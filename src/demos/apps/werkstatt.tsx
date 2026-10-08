"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarDays, CarFront, ChartColumn, Check, ClipboardList, Clock, Gauge, MapPin, Phone, ShieldCheck, TriangleAlert, Wrench } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Tag, td, th, tr } from "@/demos/kit/ui";
import { clock, cx, dur, eur, eur0, fmtDay, hm, nowMinutes, useOnce, weekdayShort, workday } from "@/demos/kit/util";

/**
 * Demo "Autohaus Falkner": Werkstatttermin buchen und Fahrzeugstatus verfolgen + Dashboard mit Aufträgen und Werkstattplan.
 * Kern der Demo ist die digitale Freigabe: Der Kunde gibt eine Zusatzarbeit auf seiner Seite frei,
 * im Auftrag der Werkstatt steht sie Sekunden später mit Uhrzeit.
 */

const STEPS = ["Angenommen", "Diagnose", "In Arbeit", "Kontrolle", "Abholbereit"] as const;
type ExtraState = "offen" | "frei" | "abgelehnt";
interface Job {
  no: string;
  plate: string;
  car: string;
  customer: string;
  work: string;
  bay: number;
  day: number;
  start: number;
  min: number;
  /** Index in STEPS; -1 = geplant, 5 = abgeholt */
  step: number;
  total: number;
  extra?: { text: string; price: number; state: ExtraState; at?: string };
  own?: boolean;
  mine?: boolean;
}
const BAYS = ["Bühne 1", "Bühne 2", "Bühne 3", "Direktannahme"];
const DAY_START = 7 * 60;
const DAY_END = 17 * 60;

function seedJobs(): Job[] {
  const now = nowMinutes();
  const st = (start: number, min: number) => (now < start ? -1 : now > start + min ? 4 : now > start + min * 0.85 ? 3 : 2);
  const j = (no: string, plate: string, car: string, customer: string, work: string, bay: number, day: number, start: number, min: number, total: number): Job => ({ no, plate, car, customer, work, bay, day, start, min, total, step: day === 0 ? st(start, min) : -1 });
  return [
    { ...j("W-2291", "MU LH 418", "VW Golf VII 1.5 TSI", "Lena Hartmann", "Inspektion, Ölwechsel", 1, 0, 480, 210, 408), step: 2, mine: true, extra: { text: "Bremsbeläge vorn unter Verschleißgrenze", price: 189, state: "offen" } },
    j("W-2288", "MU AK 7731", "Škoda Octavia Combi", "Andreas Köhler", "HU/AU, Bremsen-Check", 0, 0, 450, 90, 149.5),
    j("W-2289", "MU FS 902", "BMW 320d Touring", "Franziska Seidel", "Klimaservice", 0, 0, 570, 60, 99),
    j("W-2290", "MU RB 1150", "Ford Transit Custom", "Bäckerei Reinhold", "Inspektion, Bremsen hinten", 2, 0, 465, 240, 612),
    j("W-2292", "MU DE 64", "Renault Zoe", "Derya Erdem", "Räderwechsel mit Einlagerung", 3, 0, 540, 30, 89),
    j("W-2293", "MU JP 3308", "Opel Corsa F", "Jannik Pohl", "Räderwechsel", 3, 0, 600, 30, 39),
    j("W-2294", "MU HW 515", "Audi A4 Avant", "Helga Wiesner", "Ölwechsel, Klimaservice", 0, 0, 660, 105, 218),
    j("W-2295", "MU MT 88", "Mercedes Vito", "Malerbetrieb Thomsen", "Zahnriemen, Wasserpumpe", 2, 0, 750, 240, 874),
    j("W-2296", "MU SK 2204", "Toyota Yaris Hybrid", "Sabine Kurz", "Inspektion", 1, 0, 720, 150, 289),
    j("W-2297", "MU BL 771", "Seat Leon", "Boris Lehmann", "HU/AU", 0, 0, 810, 60, 149.5),
    j("W-2298", "MU CN 409", "VW Tiguan", "Carolin Nagel", "Inspektion, Räderwechsel", 0, 1, 450, 180, 328),
    j("W-2299", "MU GT 1290", "Hyundai i30", "Gregor Thiel", "Bremsen vorn", 1, 1, 480, 120, 342),
    j("W-2300", "MU PV 55", "Tesla Model 3", "Praxis Dr. Vogel", "Räderwechsel mit Einlagerung", 3, 1, 510, 30, 89),
    j("W-2301", "MU EM 6602", "Dacia Duster", "Emil Maurer", "Klimaservice, Ölwechsel", 2, 1, 540, 105, 218),
  ];
}

interface Svc {
  id: string;
  name: string;
  note: string;
  min: number;
  price: number;
  from?: boolean;
}
const SERVICES: Svc[] = [
  { id: "insp", name: "Inspektion", note: "nach Herstellervorgabe", min: 150, price: 289, from: true },
  { id: "oel", name: "Ölwechsel", note: "inklusive Filter und Entsorgung", min: 45, price: 119, from: true },
  { id: "hu", name: "HU / AU", note: "Prüfer täglich im Haus", min: 60, price: 149.5 },
  { id: "rad", name: "Räderwechsel", note: "inklusive Wuchtkontrolle", min: 30, price: 39 },
  { id: "lager", name: "Räderwechsel mit Einlagerung", note: "eine Saison, gewaschen", min: 30, price: 89 },
  { id: "klima", name: "Klimaservice", note: "Desinfektion und Kältemittel", min: 60, price: 99 },
  { id: "bremse", name: "Bremsen-Check", note: "mit Messprotokoll", min: 20, price: 0 },
];
const MOBILITY = [
  { id: "warten", name: "Ich warte", note: "Lounge mit WLAN und Kaffee", price: 0 },
  { id: "ersatz", name: "Ersatzwagen", note: "Kleinwagen für den Tag", price: 29 },
  { id: "holbring", name: "Hol- und Bringservice", note: "im Stadtgebiet Musterstadt", price: 19 },
];
const MODELS = ["VW Golf", "Škoda Octavia", "BMW 3er", "Opel Corsa", "Ford Focus", "Audi A4", "Anderes Modell"];

/** Deutsches Kennzeichen als kleines Schild – scharfkantig, Kennzeichen-Schrift in Mono */
function Plate({ value, size = "md" }: { value: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cx("inline-flex items-stretch overflow-hidden rounded-[var(--bo-rc)] border-[1.5px] border-bo-ink bg-white align-middle font-plex-mono font-medium tracking-[0.04em] text-bo-ink", size === "lg" ? "text-[1.45rem]" : size === "sm" ? "text-[12px]" : "text-[15px]")}>
      <span className={cx("flex items-end justify-center bg-[#1d4ed8] pb-px text-white", size === "lg" ? "w-6 text-[11px]" : size === "sm" ? "w-3 text-[6.5px]" : "w-4 text-[8px]")} aria-hidden>
        D
      </span>
      <span className={cx("tracking-wide whitespace-nowrap", size === "lg" ? "px-3 py-0.5" : size === "sm" ? "px-1.5" : "px-2")}>{value}</span>
    </span>
  );
}

const stepLabel = (s: number) => (s < 0 ? "Geplant" : s > 4 ? "Abgeholt" : STEPS[s]);
const stepTone = (s: number) => (s < 0 ? "neutral" : s === 4 ? "ok" : s > 4 ? "neutral" : s === 3 ? "info" : "warn");

/** Technischer Status-Leser: nummerierte Stationen mit rotem Fortschrittsband statt weicher Punkte */
function StatusRail({ steps, current }: { steps: string[]; current: number }) {
  const pct = steps.length > 1 ? (Math.max(current, 0) / (steps.length - 1)) * 100 : 0;
  return (
    <div className="mt-6">
      <div className="h-2 w-full bg-[#dbe3e7]" role="presentation">
        <div className="h-full bg-d-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-px grid grid-cols-5 gap-px bg-[#d2dce0]">
        {steps.map((s, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li key={s} aria-current={now ? "step" : undefined} className={cx("min-w-0 px-1 pt-2.5 pb-2 text-center", now ? "bg-d-deep" : "bg-white")}>
              <span className={cx("num mx-auto grid size-7 place-items-center font-plex-mono text-[11.5px] font-medium", done ? "bg-d-cta text-white" : now ? "bg-white text-d-deep" : "border border-[#b9c6cb] bg-white text-[#56676c]")}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cx("mt-1.5 block text-[10px] leading-tight font-medium tracking-[0.02em] break-words uppercase @dsm:text-[11px] @dsm:tracking-[0.06em]", now ? "text-white" : done ? "text-d-deep" : "text-[#56676c]")}>{s}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function WerkstattDemo() {
  const { view } = useDemo();
  const [jobs, setJobs] = useState<Job[]>(seedJobs);
  const patch = (no: string, change: Partial<Job>) => setJobs((p) => p.map((j) => (j.no === no ? { ...j, ...change } : j)));
  const add = (j: Omit<Job, "no" | "step" | "own" | "bay">) => {
    const no = `W-${2302 + jobs.filter((x) => x.own).length}`;
    const bay = j.min <= 30 ? 3 : [0, 1, 2].find((b) => !jobs.some((x) => x.bay === b && x.day === j.day && j.start < x.start + x.min && j.start + j.min > x.start)) ?? 0;
    setJobs((p) => [...p, { ...j, no, bay, step: -1, own: true }]);
    return no;
  };
  return view === "kunde" ? <CustomerSite jobs={jobs} onPatch={patch} onBook={add} /> : <Dashboard jobs={jobs} onPatch={patch} />;
}

/* ───────────────────────────── Kundenseite ─────────────────────────────
   Gestaltung „Falkner": technisch und kantig (Radius 0). Dunkelgrün (#0e1b1d), Signalrot (#e63e2d) und kühles Hellgrau (#eef2f5).
   Rajdhani 700 in Versalien für Überschriften, IBM Plex Mono für Kennzeichen, Preise und „// Etiketten", IBM Plex Sans für Text.
   Rot trägt nur Handlung und Warnung; rote Schrift auf Hell nutzt den tieferen Ton (#c92d1b), auf Dunkel den helleren (#ff6b5a).
   Abstände im 4/8er-Raster, Sektionen 40/72. */

const H = "font-d-display font-bold uppercase tracking-[0.005em]";
const W = {
  wrap: "mx-auto w-full max-w-[76rem] px-4 @dsm:px-6 @dlg:px-8",
  mono: "font-plex-mono text-[11px] leading-none font-medium tracking-[0.16em] uppercase",
  muted: "text-[#56676c]",
  line: "border-[#d2dce0]",
  cta: "inline-flex min-h-12 items-center justify-center gap-2 bg-d-cta px-6 font-d-display text-[16px] font-bold tracking-[0.06em] text-white uppercase transition-[filter,transform] hover:brightness-90 active:translate-y-px",
  ghost: "inline-flex min-h-12 items-center justify-center gap-2 border border-d-deep px-5 font-d-display text-[16px] font-bold tracking-[0.06em] text-d-deep uppercase transition-colors hover:bg-d-deep hover:text-white",
};
/** „// Etikett" – die Schrägstriche sind das wiederkehrende Zeichen der Marke */
const slash = (text: string, dark?: boolean) => (
  <span className={cx(W.mono, dark ? "text-[#ff6b5a]" : "text-[#c92d1b]")}>
    <span aria-hidden>{"// "}</span>
    {text}
  </span>
);

function CustomerSite({ jobs, onPatch, onBook }: { jobs: Job[]; onPatch: (no: string, c: Partial<Job>) => void; onBook: (j: Omit<Job, "no" | "step" | "own" | "bay">) => string }) {
  const { tab, setTab } = useDemo();
  return (
    <div className="min-h-[var(--app-h)] bg-[#eef2f5] font-plex text-[15px] leading-[1.55] text-[#0e1b1d]">
      <div className="on-dark bg-d-deep text-[#b7c6ca]">
        <p className={cx(W.wrap, "flex min-h-9 flex-wrap items-center justify-between gap-x-6 text-[12.5px]")}>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5 text-[#ff6b5a]" aria-hidden /> Industriestraße 40, Musterstadt
          </span>
          <span className="hidden items-center gap-2 @dmd:inline-flex">
            <Clock className="size-3.5 text-[#ff6b5a]" aria-hidden /> Annahme Mo – Fr ab 7:30
          </span>
          <span className="hidden items-center gap-2 font-plex-mono text-white @dsm:inline-flex">
            <Phone className="size-3.5 text-[#ff6b5a]" aria-hidden /> 01234 778 900
          </span>
        </p>
      </div>
      <header className={cx("sticky top-[var(--bar-h)] z-20 border-b bg-white", W.line)}>
        <div className={cx(W.wrap, "flex items-stretch justify-between gap-4")}>
          <p className="flex items-center gap-3 py-2.5">
            <span className="grid h-9 -skew-x-12 place-items-center bg-d-cta px-3" aria-hidden>
              <span className={cx(H, "skew-x-12 text-[18px] leading-none tracking-[0.04em] text-white")}>Falkner</span>
            </span>
            <span className="sr-only">Autohaus Falkner</span>
            <span className={cx("hidden @dmd:inline", W.mono, W.muted)}>Werkstatt & Service</span>
          </p>
          <nav aria-label="Kundenbereich" className="flex">
            {[
              { id: "termin", label: "Termin buchen", short: "Termin" },
              { id: "fahrzeug", label: "Mein Fahrzeug", short: "Fahrzeug" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx(H, "relative min-h-12 px-3 text-[15px] tracking-[0.06em] transition-colors @dsm:px-5", tab === n.id ? "text-d-deep" : "text-[#56676c] hover:text-d-deep")}>
                <span className="@dsm:hidden">{n.short}</span>
                <span className="hidden @dsm:inline">{n.label}</span>
                {tab === n.id && <span className="absolute inset-x-0 bottom-0 h-[3px] bg-d-accent" aria-hidden />}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "fahrzeug" ? <MyCar job={jobs.find((j) => j.mine)!} onPatch={onPatch} /> : <BookService jobs={jobs} onBook={onBook} />}
      <footer className="on-dark bg-d-deep text-[#8fa3a8]">
        <div className={cx(W.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/10 py-5", W.mono)}>
          <span className="text-white">Autohaus Falkner</span>
          <span>Meisterbetrieb der Kfz-Innung</span>
          <span>Notruf 01234 778 911</span>
        </div>
      </footer>
    </div>
  );
}

function BookService({ jobs, onBook }: { jobs: Job[]; onBook: (j: Omit<Job, "no" | "step" | "own" | "bay">) => string }) {
  const { go, setTab, toTop } = useDemo();
  const [plate, setPlate] = useState("");
  const [model, setModel] = useState(MODELS[0]);
  const [picked, setPicked] = useState<string[]>(["insp"]);
  const [mob, setMob] = useState("warten");
  const [dayIdx, setDayIdx] = useState(1);
  const [time, setTime] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const once = useOnce();

  const chosen = SERVICES.filter((s) => picked.includes(s.id));
  const min = chosen.reduce((n, s) => n + s.min, 0);
  const mobility = MOBILITY.find((m) => m.id === mob)!;
  const price = chosen.reduce((n, s) => n + s.price, 0) + mobility.price;
  const times = [450, 480, 540, 600, 780, 840];
  // Frei, solange an dem Tag nicht alle drei Bühnen zur selben Zeit belegt sind
  const busy = (t: number) => jobs.filter((j) => j.day === dayIdx && j.bay < 3 && t < j.start + j.min && t + Math.max(min, 30) > j.start).length >= 3;
  const plateShown = plate.trim().toUpperCase() || "MU AB 123";
  const bad = { plate: plate.trim().length < 4, svc: chosen.length === 0, time: time === null, name: name.trim().length < 2, phone: phone.trim().length < 6 };
  const valid = !bad.plate && !bad.svc && !bad.time && !bad.name && !bad.phone;
  const field = cx(input, "border-[#b9c6cb] text-d-deep hover:border-d-deep");

  if (done) {
    return (
      <div className={cx(W.wrap, "py-12 @dlg:py-20")}>
        <div className="mx-auto max-w-xl">
          {slash("Buchung bestätigt")}
          <h1 className={cx(H, "mt-3 text-[clamp(2.5rem,10cqi,4.25rem)] leading-[0.9] text-d-deep")}>
            Termin steht<span className="text-d-accent">.</span>
          </h1>
          <div className="mt-8 border-t-4 border-d-accent bg-white">
            <dl className="grid grid-cols-2 gap-px bg-[#d2dce0]">
              {[
                ["Auftrag", done],
                ["Annahme", `${fmtDay(workday(dayIdx))}, ${hm(time!)} Uhr`],
                ["Fahrzeug", model],
                ["Richtpreis", eur(price)],
              ].map(([k, v]) => (
                <div key={k} className="bg-white px-4 py-3.5">
                  <dt className={cx(W.mono, W.muted)}>{k}</dt>
                  <dd className="num mt-2 font-plex-mono text-[15px] font-medium break-words text-d-deep">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="border-t border-[#d2dce0] px-4 py-4">
              <Plate value={plateShown} size="lg" />
            </p>
          </div>
          <div className="mt-6 bg-d-deep p-5 text-[14px] leading-snug text-[#c3d0d3]">
            <strong className="font-semibold text-white">So sieht es die Werkstatt:</strong> Ihr Termin hat sich selbst in den Werkstattplan eingetragen – niemand musste ans Telefon.
            <div className="on-dark mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("betrieb", "plan")} className={W.cta}>
                Im Werkstattplan ansehen
              </button>
              <button type="button" onClick={() => go("kunde", "fahrzeug")} className={cx(W.ghost, "border-white/40 text-white hover:bg-white hover:text-d-deep")}>
                Fahrzeugstatus
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const head = (n: string, t: string, err?: string | false) => (
    <div className={cx("flex flex-wrap items-end justify-between gap-x-4 gap-y-1 border-b-2 border-d-deep pb-2.5")}>
      <h2 className={cx(H, "flex items-baseline gap-3 text-[1.5rem] leading-none text-d-deep @dsm:text-[1.75rem]")}>
        <span className="font-plex-mono text-[13px] font-medium tracking-[0.1em] text-[#c92d1b]">{`${n} //`}</span>
        {t}
      </h2>
      {err && (
        <p role="alert" className="text-[12.5px] font-medium text-bo-bad">
          {err}
        </p>
      )}
    </div>
  );
  const option = (on: boolean) => cx("flex min-h-16 w-full items-center gap-3 border px-3.5 py-2.5 text-left transition-colors", on ? "border-d-deep bg-white shadow-[inset_4px_0_0_var(--d-accent)]" : "border-[#d2dce0] bg-white hover:border-d-deep");

  return (
    <>
      <section className="relative overflow-hidden">
        <p className={cx(H, "pointer-events-none absolute -top-[0.12em] right-0 left-0 text-center text-[clamp(7rem,27cqi,24rem)] leading-none tracking-[0.02em] whitespace-nowrap text-white select-none")} aria-hidden>
          Service
        </p>
        <div className={cx(W.wrap, "relative grid gap-8 pt-10 pb-8 @dlg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)] @dlg:items-center @dlg:gap-10 @dlg:pt-16 @dlg:pb-14")}>
          <div>
            {slash("Werkstatt & Service · Musterstadt")}
            <h1 className={cx(H, "mt-4 text-[clamp(2.6rem,8.6cqi,5rem)] leading-[0.9] text-d-deep")}>
              Werkstatt-Termin in zwei Minuten<span className="text-d-accent">.</span>
            </h1>
            <p className={cx("mt-5 max-w-md border-l-2 border-d-accent pl-4 text-[16px] leading-relaxed", W.muted)}>Leistung wählen, Richtpreis sehen, Zeit sichern. Den Stand Ihres Fahrzeugs verfolgen Sie danach live auf dem Handy.</p>
            <p className="mt-7 flex flex-wrap gap-2">
              <a href="#buchen" className={W.cta}>
                Termin buchen <ArrowRight className="size-4" aria-hidden />
              </a>
              <button type="button" onClick={() => setTab("fahrzeug")} className={W.ghost}>
                Mein Fahrzeug
              </button>
            </p>
          </div>
          <div className="relative">
            <div className="relative aspect-[16/10] overflow-hidden bg-d-deep [clip-path:polygon(9%_0,100%_0,100%_100%,0_100%)]">
              <Image src="/images/demo/photos/w-hero.webp" alt="Silberne Limousine in der dunklen Ausstellungshalle des Autohauses" fill priority sizes="(min-width: 64rem) 38rem, 100vw" className="object-cover object-[center_60%]" />
            </div>
            <p className="absolute right-0 bottom-0 flex items-center gap-3 bg-d-cta py-2.5 pr-4 pl-3 text-white">
              <span className="grid size-9 place-items-center bg-white/15">
                <Wrench className="size-4" aria-hidden />
              </span>
              <span className="leading-tight">
                <span className={cx("block text-white/85", W.mono, "text-[10px]")}>Nächste freie Bühne</span>
                <span className="num mt-1.5 block font-plex-mono text-[14px] font-medium">{fmtDay(workday(1))} · 07:30</span>
              </span>
            </p>
          </div>
        </div>
        <ul className={cx(W.wrap, "relative grid @dmd:grid-cols-3")}>
          {[
            { icon: Gauge, t: "Richtpreis vorab", x: "Preis und Dauer stehen dabei, bevor Sie buchen – keine Überraschung an der Kasse.", c: "bg-d-deep text-[#b7c6ca]", h: "text-white", i: "text-[#ff6b5a]" },
            { icon: ShieldCheck, t: "Freigabe per Handy", x: "Zusatzarbeiten sehen Sie mit Befund und Preis. Ohne Ihr Okay passiert nichts.", c: "bg-d-cta text-white", h: "text-white", i: "text-white" },
            { icon: CarFront, t: "Mobil bleiben", x: "Lounge, Ersatzwagen oder Hol- und Bringservice buchen Sie gleich mit.", c: "border-y border-r border-[#d2dce0] bg-white text-[#56676c] @max-dmd:border-l", h: "text-d-deep", i: "text-[#c92d1b]" },
          ].map((f) => (
            <li key={f.t} className={cx("flex gap-4 px-5 py-6 @dlg:px-7 @dlg:py-8", f.c)}>
              <f.icon className={cx("mt-0.5 size-7 shrink-0", f.i)} strokeWidth={1.5} aria-hidden />
              <p className="text-[14px] leading-snug">
                <strong className={cx(H, "block text-[1.25rem] leading-none", f.h)}>{f.t}</strong>
                <span className="mt-2 block">{f.x}</span>
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className={cx(W.wrap, "grid gap-10 py-10 @dlg:grid-cols-[minmax(0,1fr)_22rem] @dlg:gap-12 @dlg:py-16")}>
        <div className="min-w-0 space-y-10 @dlg:space-y-12">
          <section id="buchen" className="scroll-mt-[calc(var(--bar-h)+4.5rem)]">
            {head("01", "Ihr Fahrzeug", tried && bad.plate && "Bitte Kennzeichen eintragen.")}
            <div className="mt-5 grid gap-4 @dsm:grid-cols-[auto_1fr]">
              <Field label="Kennzeichen">
                <span className={cx("flex items-stretch overflow-hidden border-2 bg-white focus-within:shadow-[0_0_0_2px_var(--d-accent)]", tried && bad.plate ? "border-bo-bad" : "border-d-deep")}>
                  <span className="flex w-7 items-end justify-center bg-[#1d4ed8] pb-1.5 font-plex-mono text-[10px] font-medium text-white" aria-hidden>
                    D
                  </span>
                  <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase().slice(0, 10))} placeholder="MU AB 123" autoCapitalize="characters" aria-invalid={tried && bad.plate} className="min-h-12 w-full min-w-0 bg-transparent px-3 font-plex-mono text-[20px] font-medium tracking-[0.06em] text-d-deep outline-none placeholder:text-[#a7b4b9] @dsm:w-44" />
                </span>
              </Field>
              <Field label="Modell">
                <select value={model} onChange={(e) => setModel(e.target.value)} className={cx(field, "min-h-[3.25rem]")}>
                  {MODELS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section data-tour="leistungen">
            {head("02", "Leistungen", tried && bad.svc && "Mindestens eine Leistung wählen.")}
            <ul className="mt-5 grid gap-2 @dmd:grid-cols-2">
              {SERVICES.map((s) => {
                const on = picked.includes(s.id);
                return (
                  <li key={s.id}>
                    <button type="button" aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))} className={option(on)}>
                      <span className={cx("grid size-6 shrink-0 place-items-center border", on ? "border-d-accent bg-d-accent text-white" : "border-[#8d9ba0] bg-white")} aria-hidden>
                        {on && <Check className="size-4" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-[15.5px] font-semibold text-d-deep">{s.name}</span>
                        <span className={cx("mt-1 block text-[12.5px]", W.muted)}>
                          {s.note} · <span className="num">{dur(s.min)}</span>
                        </span>
                      </span>
                      <span className="num shrink-0 font-plex-mono text-[14px] font-medium text-d-deep">{s.price ? `${s.from ? "ab " : ""}${eur(s.price).replace(",00", "")}` : "kostenlos"}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section>
            {head("03", "Mobilität")}
            <div className="mt-5 grid gap-px border border-[#d2dce0] bg-[#d2dce0] @dsm:grid-cols-3">
              {MOBILITY.map((m) => {
                const on = mob === m.id;
                return (
                  <button key={m.id} type="button" aria-pressed={on} onClick={() => setMob(m.id)} className={cx("min-h-[5.5rem] px-4 py-3 text-left transition-colors", on ? "on-dark bg-d-deep text-white shadow-[inset_0_4px_0_var(--d-accent)]" : "bg-white hover:bg-[#f6f8f9]")}>
                    <span className="block text-[15.5px] leading-tight font-semibold">{m.name}</span>
                    <span className={cx("mt-1 block text-[12.5px] leading-snug", on ? "text-[#a9bcc0]" : W.muted)}>{m.note}</span>
                    <span className={cx("num mt-2 block font-plex-mono text-[13px] font-medium", on ? "text-white" : "text-d-deep")}>{m.price ? `+ ${eur0(m.price)}` : "inklusive"}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            {head("04", "Annahme", tried && bad.time && "Bitte eine Uhrzeit wählen.")}
            <div className="no-bar -mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 @dsm:mx-0 @dsm:px-0">
              {[1, 2, 3, 4, 5].map((i) => {
                const d = workday(i);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={dayIdx === i}
                    onClick={() => {
                      setDayIdx(i);
                      setTime(null);
                    }}
                    className={cx("min-h-[4.25rem] w-[4.5rem] shrink-0 border text-center leading-tight transition-colors", dayIdx === i ? "on-dark border-d-deep bg-d-deep text-white shadow-[inset_0_4px_0_var(--d-accent)]" : "border-[#d2dce0] bg-white hover:border-d-deep")}
                  >
                    <span className={cx("block", W.mono, "text-[10.5px]", dayIdx === i ? "text-[#a9bcc0]" : W.muted)}>{weekdayShort(d)}</span>
                    <span className={cx(H, "num mt-1.5 block text-[1.5rem] leading-none")}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 @dsm:grid-cols-6">
              {times.map((t) => {
                const full = busy(t);
                return (
                  <button key={t} type="button" disabled={full} aria-pressed={time === t} onClick={() => setTime(t)} className={cx("num min-h-12 border font-plex-mono text-[14.5px] font-medium transition-colors disabled:border-dashed disabled:bg-transparent disabled:text-[#7f9096] disabled:line-through", time === t ? "border-d-cta bg-d-cta text-white" : "border-[#d2dce0] bg-white hover:border-d-deep")}>
                    {hm(t)}
                  </button>
                );
              })}
            </div>
            <p className={cx("mt-2 text-[12.5px]", W.muted)}>Durchgestrichene Zeiten: alle drei Bühnen belegt.</p>
          </section>

          <section>
            {head("05", "Kontakt")}
            <form
              noValidate
              className="mt-5 grid gap-4 @dsm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!valid || !once()) return;
                setDone(onBook({ plate: plateShown, car: model, customer: name.trim(), work: chosen.map((s) => s.name).join(", "), day: dayIdx, start: time!, min: Math.max(min, 30), total: price }));
                toTop();
              }}
            >
              <Field label="Name" error={tried && bad.name && "Bitte tragen Sie Ihren Namen ein."}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={tried && bad.name} className={field} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Telefon" hint="Für Rückfragen und die Freigabe von Zusatzarbeiten." error={tried && bad.phone && "Bitte geben Sie eine Telefonnummer an."}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={24} aria-invalid={tried && bad.phone} className={field} placeholder="0151 2345678" />
              </Field>
              {tried && !valid && (
                <p role="alert" className="border-l-4 border-bo-bad bg-[#fbe7e5] px-4 py-3 text-[13.5px] font-medium text-bo-bad @dsm:col-span-2">
                  Es fehlt noch etwas – die Stellen sind oben markiert. Erfundene Angaben genügen.
                </p>
              )}
              <div className="@dsm:col-span-2">
                <button type="submit" className={cx(W.cta, "w-full @dsm:w-auto")}>
                  Termin verbindlich buchen <ArrowRight className="size-4" aria-hidden />
                </button>
                <p className={cx("mt-3 text-[12.5px]", W.muted)}>Demo: Es wird nichts gebucht oder gespeichert.</p>
              </div>
            </form>
          </section>
        </div>

        <aside>
          <div className="border border-[#d2dce0] bg-white @dlg:sticky @dlg:top-[calc(var(--bar-h)+4.5rem)]">
            <div className="on-dark border-t-4 border-d-accent bg-d-deep px-5 py-5 text-white">
              <p className={cx(W.mono, "text-[#8fa3a8]")}>Auftragszettel</p>
              <p className="mt-3">
                <Plate value={plateShown} />
              </p>
              <p className="mt-2 text-[14.5px] font-medium">{model}</p>
            </div>
            <div className="px-5 py-5">
              {chosen.length === 0 ? (
                <p className={cx("text-[14px]", W.muted)}>Wählen Sie mindestens eine Leistung.</p>
              ) : (
                <ul className="space-y-2.5 text-[14px]">
                  {chosen.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3">
                      <span className="min-w-0 break-words">{s.name}</span>
                      <span className={cx("num shrink-0 font-plex-mono", W.muted)}>{s.price ? eur(s.price) : "0,00 €"}</span>
                    </li>
                  ))}
                  {mobility.price > 0 && (
                    <li className="flex justify-between gap-3">
                      <span>{mobility.name}</span>
                      <span className={cx("num shrink-0 font-plex-mono", W.muted)}>{eur(mobility.price)}</span>
                    </li>
                  )}
                </ul>
              )}
              <dl className="num mt-5 space-y-2 border-t border-dashed border-[#b9c6cb] pt-4 text-[14px]">
                <div className="flex justify-between gap-3">
                  <dt className={W.muted}>Arbeitszeit</dt>
                  <dd className="font-plex-mono">{min ? `ca. ${dur(min)}` : "–"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className={W.muted}>Annahme</dt>
                  <dd className="font-plex-mono">{time !== null ? `${fmtDay(workday(dayIdx))}, ${hm(time)}` : "noch offen"}</dd>
                </div>
                <div className="flex items-end justify-between gap-3 border-t-2 border-d-deep pt-3">
                  <dt className={cx(H, "text-[1.125rem] leading-none text-d-deep")}>Richtpreis</dt>
                  <dd className="font-plex-mono text-[1.5rem] leading-none font-medium text-d-deep">{eur(price)}</dd>
                </div>
              </dl>
              <p className={cx("mt-4 text-[12px] leading-snug", W.muted)}>Inklusive Mehrwertsteuer. Mehr wird es nur, wenn Sie eine Zusatzarbeit ausdrücklich freigeben.</p>
            </div>
          </div>
        </aside>
      </div>

      <section className="on-dark relative overflow-hidden bg-d-deep text-white">
        <Image src="/images/demo/photos/w-mech2.webp" alt="Werkstatthalle des Autohauses mit einem Fahrzeug an der Bühne" fill sizes="100vw" className="object-cover object-[center_70%] opacity-35" />
        <div className="absolute inset-0 bg-gradient-to-r from-d-deep via-d-deep/85 to-d-deep/40" aria-hidden />
        <div className={cx(W.wrap, "relative grid gap-8 py-12 @dlg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] @dlg:items-end @dlg:py-20")}>
          <div>
            {slash("Der Betrieb", true)}
            <h2 className={cx(H, "mt-3 text-[clamp(2.25rem,7cqi,3.75rem)] leading-[0.9] text-white")}>
              Drei Bühnen,
              <br />
              ein Plan<span className="text-d-accent">.</span>
            </h2>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 @dmd:grid-cols-4">
            {[
              ["1998", "", "Meisterbetrieb seit"],
              ["52", "%", "buchen nach Feierabend"],
              ["11", "Min.", "bis zur Freigabe"],
              ["3", "", "Bühnen plus Direktannahme"],
            ].map(([v, u, l]) => (
              <div key={l} className="border-l-2 border-d-accent pl-4">
                <dd className={cx(H, "num text-[3rem] leading-[0.85] text-white")}>
                  {v}
                  {u && <span className="ml-1 text-[1.125rem] text-[#ff6b5a]">{u}</span>}
                </dd>
                <dt className="mt-3 text-[13px] leading-snug text-[#b7c6ca]">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}

/** Messuhr für die Belagstärke: Halbkreis 0–12 mm, roter Bereich unter der Verschleißgrenze, Zeiger auf dem Messwert */
function PadGauge({ value, limit, max }: { value: number; limit: number; max: number }) {
  const pt = (v: number, r: number) => {
    const a = Math.PI * (1 - v / max);
    return [100 + r * Math.cos(a), 100 - r * Math.sin(a)] as const;
  };
  const arc = (from: number, to: number, r: number) => {
    const [x0, y0] = pt(from, r);
    const [x1, y1] = pt(to, r);
    return `M${x0.toFixed(1)} ${y0.toFixed(1)}A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  };
  const [nx, ny] = pt(value, 62);
  return (
    <svg viewBox="0 0 200 118" role="img" aria-label={`Belagstärke: gemessen ${value} Millimeter, Verschleißgrenze ${limit} Millimeter, Neuzustand ${max} Millimeter`} className="w-full max-w-[17rem]">
      <path d={arc(0, max, 80)} fill="none" stroke="#dbe3e7" strokeWidth="14" />
      <path d={arc(0, limit, 80)} fill="none" stroke="var(--d-accent)" strokeWidth="14" />
      {Array.from({ length: max + 1 }, (_, i) => {
        const [x0, y0] = pt(i, i % 3 === 0 ? 66 : 70);
        const [x1, y1] = pt(i, 73);
        return <path key={i} d={`M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`} stroke="#0e1b1d" strokeWidth={i % 3 === 0 ? 1.6 : 0.8} />;
      })}
      {[0, 3, 6, 9, 12].map((v) => {
        const [x, y] = pt(v, 54);
        return (
          <text key={v} x={x} y={y + 3} textAnchor="middle" fontSize="8.5" fontFamily="var(--font-plex-mono-face), monospace" fill="#56676c">
            {v}
          </text>
        );
      })}
      <path d={`M100 100L${nx.toFixed(1)} ${ny.toFixed(1)}`} stroke="#0e1b1d" strokeWidth="3" strokeLinecap="square" />
      <rect x="93" y="93" width="14" height="14" fill="#0e1b1d" />
      <text x="100" y="116" textAnchor="middle" fontSize="8.5" fontFamily="var(--font-plex-mono-face), monospace" letterSpacing="1.5" fill="#56676c">
        MM BELAG
      </text>
    </svg>
  );
}

function MyCar({ job, onPatch }: { job: Job; onPatch: (no: string, c: Partial<Job>) => void }) {
  const { go, toast } = useDemo();
  const ex = job.extra!;
  const total = job.total + (ex.state === "frei" ? ex.price : 0);
  const log = [
    { t: "07:42", text: "Fahrzeug angenommen · Annahme: Herr Demir" },
    { t: "08:15", text: "Diagnose abgeschlossen · keine Fehlereinträge" },
    { t: "08:40", text: "Arbeiten begonnen · Bühne 2 · Mechaniker: T. Brandt" },
    ...(ex.state === "frei" ? [{ t: ex.at!, text: "Zusatzarbeit freigegeben: Bremsbeläge vorn" }] : ex.state === "abgelehnt" ? [{ t: ex.at!, text: "Zusatzarbeit abgelehnt – im Bericht vermerkt" }] : []),
    ...(job.step >= 3 ? [{ t: "", text: "Endkontrolle mit Probefahrt" }] : []),
    ...(job.step >= 4 ? [{ t: "", text: "Fahrzeug steht gewaschen zur Abholung bereit" }] : []),
  ];
  const decide = (state: ExtraState) => {
    onPatch(job.no, { extra: { ...ex, state, at: clock() }, min: job.min + (state === "frei" ? 45 : 0) });
    toast(state === "frei" ? "Freigegeben. Die Werkstatt sieht die Freigabe jetzt im Auftrag – mit Uhrzeit." : "Abgelehnt. Die Werkstatt vermerkt das im Bericht.");
  };
  const card = "border border-[#d2dce0] bg-white";
  return (
    <>
      <section className="on-dark bg-d-deep text-white">
        <div className={cx(W.wrap, "flex flex-wrap items-end justify-between gap-x-10 gap-y-6 py-8 @dlg:py-12")}>
          <div className="min-w-0">
            {slash("Guten Tag, Frau Hartmann", true)}
            <h1 className={cx(H, "mt-3 text-[clamp(2rem,7cqi,3.5rem)] leading-[0.9] text-white")}>{job.car}</h1>
            <p className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <Plate value={job.plate} size="lg" />
              <span className="num font-plex-mono text-[13px] text-[#a9bcc0]">68.420 km · Auftrag {job.no}</span>
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-px bg-white/15 text-left">
            <div className="bg-d-deep py-1 pr-6">
              <dt className={cx(W.mono, "text-[#8fa3a8]")}>Fertig gegen</dt>
              <dd className={cx(H, "num mt-2 text-[2.25rem] leading-none text-white")}>{hm(job.start + job.min + 20)}</dd>
            </div>
            <div className="bg-d-deep py-1 pl-6">
              <dt className={cx(W.mono, "text-[#8fa3a8]")}>Stand heute</dt>
              <dd className={cx(H, "num mt-2 text-[2.25rem] leading-none text-white")}>{eur0(total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <div className={cx(W.wrap, "grid gap-6 py-8 @dlg:grid-cols-[minmax(0,1fr)_22rem] @dlg:gap-8 @dlg:py-12")}>
        <div className="min-w-0 space-y-6">
          <section data-tour="status" className={cx(card, "p-5 @dsm:p-6")}>
            {slash("Stand Ihres Fahrzeugs")}
            <p className={cx(H, "mt-3 text-[1.75rem] leading-none text-d-deep @dsm:text-[2rem]")}>{job.step >= 4 ? "Abholbereit – wir freuen uns auf Sie." : job.step === 3 ? "In der Endkontrolle." : "In Arbeit auf Bühne 2."}</p>
            <StatusRail steps={[...STEPS]} current={Math.min(job.step, 4)} />
            <ol className="mt-6 border-t border-[#d2dce0] text-[14px]">
              {log.map((l, i) => (
                <li key={i} className="flex gap-4 border-b border-[#e6ecef] py-2.5">
                  <span className="num w-12 shrink-0 font-plex-mono text-[13px] font-medium text-[#c92d1b]">{l.t || "jetzt"}</span>
                  <span className="min-w-0">{l.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section data-tour="freigabe" className={cx("border bg-white", ex.state === "offen" ? "border-d-accent shadow-[0_0_0_3px_rgb(230_62_45/0.15)]" : "border-[#d2dce0]")}>
            <div className={cx(H, "flex items-center gap-2.5 px-5 py-3 text-[1.0625rem] leading-none tracking-[0.04em]", ex.state === "offen" ? "bg-d-cta text-white" : ex.state === "frei" ? "bg-d-deep text-white" : "bg-[#dfe6ea] text-[#44555a]")}>
              {ex.state === "offen" ? <TriangleAlert className="size-5" aria-hidden /> : <Check className="size-5" aria-hidden />}
              {ex.state === "offen" ? "Ihre Freigabe wird benötigt" : ex.state === "frei" ? `Freigegeben um ${ex.at} Uhr` : `Abgelehnt um ${ex.at} Uhr`}
            </div>
            <div className="grid gap-6 p-5 @dmd:grid-cols-[minmax(0,1fr)_17rem] @dsm:p-6">
              <div className="min-w-0">
                <h3 className="text-[1.125rem] leading-snug font-semibold text-d-deep">{ex.text}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed">Bei der Inspektion gemessen: 2 mm Restbelag vorn. Unter 3 mm verlängert sich der Bremsweg spürbar, die Beläge sollten jetzt getauscht werden.</p>
                <div className="relative mt-5 aspect-[16/9] overflow-hidden bg-d-deep">
                  <Image src="/images/demo/photos/w-mech1.webp" alt="Mechaniker am offenen Motorraum – der Befund entsteht direkt am Fahrzeug" fill sizes="(min-width: 48rem) 28rem, 100vw" className="object-cover object-[center_45%]" />
                  <span className={cx("absolute bottom-0 left-0 bg-d-deep px-2.5 py-2 text-white", W.mono, "text-[10px]")}>Befundfoto · Bühne 2</span>
                </div>
              </div>
              <div className="flex flex-col items-center border-[#d2dce0] @dmd:border-l @dmd:pl-6">
                <PadGauge value={2} limit={3} max={12} />
                <p className="num mt-3 flex w-full justify-between gap-2 font-plex-mono text-[11.5px]">
                  <span className="font-medium text-[#c92d1b]">Ist 2 mm</span>
                  <span className={W.muted}>Grenze 3 mm</span>
                  <span className={W.muted}>Neu 12 mm</span>
                </p>
                <p className="num mt-5 w-full border-t-2 border-d-deep pt-4 font-plex-mono text-[2rem] leading-none font-medium text-d-deep">{eur(ex.price)}</p>
                <p className={cx("mt-2 w-full text-[12.5px] leading-snug", W.muted)}>Material und Einbau, inkl. MwSt. · + 45 Min. Arbeitszeit</p>
              </div>
            </div>
            {ex.state === "offen" && (
              <div className="grid gap-2 border-t border-[#d2dce0] p-4 @dsm:grid-cols-[1fr_auto_auto] @dsm:px-6">
                <button type="button" onClick={() => decide("frei")} className={W.cta}>
                  <Check className="size-4" strokeWidth={3} aria-hidden /> Freigeben
                </button>
                <button type="button" onClick={() => decide("abgelehnt")} className={W.ghost}>
                  Ablehnen
                </button>
                <button type="button" onClick={() => toast("Rückruf notiert – die Annahme meldet sich in den nächsten Minuten.")} className={cx(W.ghost, "border-[#b9c6cb]")}>
                  <Phone className="size-4" aria-hidden /> Bitte anrufen
                </button>
              </div>
            )}
            {ex.state !== "offen" && (
              <p className="border-t border-[#d2dce0] bg-[#f6f8f9] px-5 py-4 text-[13.5px] shadow-[inset_4px_0_0_var(--d-accent)] @dsm:px-6">
                <strong className="font-semibold">So sieht es die Werkstatt:</strong> Ihre Entscheidung steht jetzt im Auftrag.{" "}
                <button type="button" onClick={() => go("betrieb", "auftraege")} className="min-h-11 font-semibold text-[#c92d1b] underline underline-offset-4">
                  Im Dashboard ansehen
                </button>
              </p>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <div className={card}>
            <h2 className={cx("border-b border-[#d2dce0] px-5 py-3.5", W.mono, W.muted)}>Kosten</h2>
            <ul className="num space-y-2.5 px-5 py-4 font-plex-mono text-[13.5px]">
              <li className="flex justify-between gap-3">
                <span>Inspektion</span>
                <span>289,00 €</span>
              </li>
              <li className="flex justify-between gap-3">
                <span>Ölwechsel mit Filter</span>
                <span>119,00 €</span>
              </li>
              <li className={cx("flex justify-between gap-3", ex.state !== "frei" && "text-[#56676c]")}>
                <span>
                  Bremsbeläge vorn{ex.state === "offen" && " (offen)"}
                  {ex.state === "abgelehnt" && " (abgelehnt)"}
                </span>
                <span className={cx("shrink-0", ex.state === "abgelehnt" && "line-through")}>{eur(ex.price)}</span>
              </li>
            </ul>
            <p className="num flex items-end justify-between gap-3 border-t-2 border-d-deep px-5 py-4">
              <span className={cx(H, "text-[1.125rem] leading-none text-d-deep")}>Gesamt</span>
              <span className="font-plex-mono text-[1.5rem] leading-none font-medium text-d-deep">{eur(total)}</span>
            </p>
            <p className={cx("border-t border-[#d2dce0] px-5 py-3 text-[12px]", W.muted)}>Zahlung bei Abholung oder vorab online.</p>
          </div>
          <div className={card}>
            <h2 className={cx("border-b border-[#d2dce0] px-5 py-3.5", W.mono, W.muted)}>Fahrzeugakte</h2>
            <dl className="px-5 py-2 text-[14px]">
              {[
                ["Nächste HU", "März 2027"],
                ["Winterräder", "Regal B-14"],
                ["Letzter Service", "vor 11 Monaten"],
                ["Ihr Berater", "Kemal Demir"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3 border-b border-[#e6ecef] py-2.5 last:border-0">
                  <dt className={W.muted}>{k}</dt>
                  <dd className="num text-right font-medium text-d-deep">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

function Dashboard({ jobs, onPatch }: { jobs: Job[]; onPatch: (no: string, c: Partial<Job>) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { auftraege: "Aufträge", plan: "Werkstattplan", kunden: "Kunden & Fahrzeuge", zahlen: "Auswertung" };
  return (
    <Backoffice
      user="Kemal Demir"
      role="Serviceberater"
      title={titles[tab] ?? "Aufträge"}
      nav={[
        { id: "auftraege", label: "Aufträge", icon: ClipboardList, count: jobs.filter((j) => j.extra?.state === "offen").length },
        { id: "plan", label: "Werkstattplan", icon: CalendarDays, count: jobs.filter((j) => j.own).length },
        { id: "kunden", label: "Kunden & Fahrzeuge", icon: CarFront },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "plan" ? <Plan jobs={jobs} /> : tab === "kunden" ? <Vehicles /> : tab === "zahlen" ? <Numbers jobs={jobs} /> : <Jobs jobs={jobs} onPatch={onPatch} />}
    </Backoffice>
  );
}

function Jobs({ jobs, onPatch }: { jobs: Job[]; onPatch: (no: string, c: Partial<Job>) => void }) {
  const today = jobs.filter((j) => j.day === 0).sort((a, b) => (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || a.start - b.start);
  const next = (s: number) => (s < 0 ? "Annehmen" : s === 0 ? "Diagnose fertig" : s === 1 ? "Arbeit beginnen" : s === 2 ? "Zur Kontrolle" : s === 3 ? "Abholbereit melden" : s === 4 ? "Übergeben" : null);
  return (
    <Panel flush tour="auftraege" title="Heute im Haus" aside={`${today.length} Fahrzeuge · ${today.filter((j) => j.step === 4).length} abholbereit`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Auftrag</th>
              <th className={th}>Fahrzeug</th>
              <th className={th}>Arbeiten</th>
              <th className={th}>Platz</th>
              <th className={th}>Status</th>
              <th className={th}>Zusatzarbeit</th>
              <th className={cx(th, "text-right")}>Nächster Schritt</th>
            </tr>
          </thead>
          <tbody>
            {today.map((j) => {
              const n = next(j.step);
              return (
                <tr key={j.no} className={cx(tr, j.mine && "bg-d-soft/60")}>
                  <td className={cx(td, "font-plex-mono text-bo-ink")}>
                    {j.no}
                    <span className="num block font-plex text-[12px] text-bo-muted">{hm(j.start)} Uhr</span>
                  </td>
                  <td className={td}>
                    <Plate value={j.plate} size="sm" />
                    <span className="mt-1 block text-bo-ink">{j.car}</span>
                    <span className="block text-[12.5px] text-bo-muted">{j.customer}</span>
                  </td>
                  <td className={cx(td, "max-w-[14rem]")}>{j.work}</td>
                  <td className={td}>{BAYS[j.bay]}</td>
                  <td className={td}>
                    <Tag tone={stepTone(j.step)}>{stepLabel(j.step)}</Tag>
                  </td>
                  <td className={td}>
                    {j.extra ? (
                      <>
                        <Tag tone={j.extra.state === "offen" ? "warn" : j.extra.state === "frei" ? "ok" : "neutral"}>{j.extra.state === "offen" ? "wartet auf Freigabe" : j.extra.state === "frei" ? `freigegeben ${j.extra.at}` : `abgelehnt ${j.extra.at}`}</Tag>
                        <span className="num mt-1 block text-[12.5px] text-bo-muted">
                          {j.extra.text} · {eur(j.extra.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-bo-muted">–</span>
                    )}
                  </td>
                  <td className={cx(td, "text-right")}>
                    {n ? (
                      <Btn size="sm" variant={j.step === 3 ? "primary" : "line"} onClick={() => onPatch(j.no, { step: j.step + 1 })}>
                        {n}
                      </Btn>
                    ) : (
                      <span className="text-[12.5px] text-bo-muted">abgeschlossen</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Plan({ jobs }: { jobs: Job[] }) {
  const firstOwn = jobs.find((j) => j.own);
  const [dayIdx, setDayIdx] = useState(firstOwn?.day ?? 0);
  const span = DAY_END - DAY_START;
  const hours = Array.from({ length: span / 60 + 1 }, (_, i) => DAY_START + i * 60);
  const now = nowMinutes();
  const list = jobs.filter((j) => j.day === dayIdx);
  return (
    <Panel
      flush
      tour="plan"
      title={dayIdx === 0 ? "Heute" : fmtDay(workday(dayIdx))}
      aside={
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Btn key={i} size="sm" variant={dayIdx === i ? "dark" : "quiet"} aria-pressed={dayIdx === i} onClick={() => setDayIdx(i)}>
              {i === 0 ? "Heute" : weekdayShort(workday(i))}
              {jobs.some((j) => j.own && j.day === i) && <span className="size-1.5 rounded-[var(--bo-rc)] bg-d-accent" aria-label="neue Online-Buchung" />}
            </Btn>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[7.5rem_1fr] border-b border-bo-line">
            <div />
            <div className="relative h-7">
              {hours.map((h) => (
                <span key={h} className="num absolute top-1.5 -translate-x-1/2 text-[11px] text-bo-muted first:translate-x-0 last:-translate-x-full" style={{ left: `${((h - DAY_START) / span) * 100}%` }}>
                  {hm(h)}
                </span>
              ))}
            </div>
          </div>
          {BAYS.map((b, bi) => (
            <div key={b} className={cx("grid grid-cols-[7.5rem_1fr]", bi > 0 && "border-t border-bo-line")}>
              <div className="flex items-center gap-2 px-4 text-[13px] font-medium text-bo-ink">
                <Wrench className="size-3.5 text-bo-muted" strokeWidth={1.75} aria-hidden /> {b}
              </div>
              <div className="relative h-[4.5rem] border-l border-bo-line" style={{ backgroundImage: "linear-gradient(to right, var(--color-bo-line) 1px, transparent 1px)", backgroundSize: `${(60 / span) * 100}% 100%` }}>
                {list
                  .filter((j) => j.bay === bi)
                  .map((j) => (
                    <div
                      key={j.no}
                      className={cx("absolute inset-y-1.5 overflow-hidden rounded-[var(--bo-r)] border-l-[3px] px-2 py-1 leading-tight", j.own ? "animate-demo-flash border-l-d-accent bg-d-soft ring-1 ring-d-accent" : j.step >= 4 ? "border-l-bo-ok bg-[#e3f3ea]" : j.step >= 0 ? "border-l-[#c8860a] bg-[#fbf0d9]" : "border-l-bo-muted bg-bo-bg")}
                      style={{ left: `${((j.start - DAY_START) / span) * 100}%`, width: `${(Math.max(j.min, 30) / span) * 100}%` }}
                      title={`${j.plate} · ${j.work}`}
                    >
                      <p className="truncate font-plex-mono text-[11.5px] font-medium text-bo-ink">{j.plate}</p>
                      <p className="truncate text-[11.5px] text-bo-body">{j.work}</p>
                      {j.min >= 90 && <p className="truncate text-[11px] text-bo-muted">{j.customer}</p>}
                    </div>
                  ))}
                {dayIdx === 0 && now > DAY_START && now < DAY_END && <div className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-bo-bad" style={{ left: `${((now - DAY_START) / span) * 100}%` }} aria-hidden />}
              </div>
            </div>
          ))}
        </div>
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 border-t border-bo-line px-4 py-2.5 text-[12px] text-bo-muted">
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[var(--bo-r)] border-l-[3px] border-l-bo-muted bg-bo-bg" aria-hidden /> geplant
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[var(--bo-r)] border-l-[3px] border-l-[#c8860a] bg-[#fbf0d9]" aria-hidden /> in Arbeit
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[var(--bo-r)] border-l-[3px] border-l-bo-ok bg-[#e3f3ea]" aria-hidden /> fertig
        </li>
        <li className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[var(--bo-r)] border-l-[3px] border-l-d-accent bg-d-soft" aria-hidden /> gerade online gebucht
        </li>
      </ul>
    </Panel>
  );
}

const FLEET = [
  { plate: "MU RB 1150", car: "Ford Transit Custom", owner: "Bäckerei Reinhold", hu: 9, km: "148.200", tires: "–" },
  { plate: "MU SK 2204", car: "Toyota Yaris Hybrid", owner: "Sabine Kurz", hu: 16, km: "41.870", tires: "Sommer · A-07" },
  { plate: "MU HW 515", car: "Audi A4 Avant", owner: "Helga Wiesner", hu: 24, km: "96.340", tires: "Sommer · C-21" },
  { plate: "MU JP 3308", car: "Opel Corsa F", owner: "Jannik Pohl", hu: 38, km: "22.115", tires: "–" },
  { plate: "MU GT 1290", car: "Hyundai i30", owner: "Gregor Thiel", hu: 52, km: "73.900", tires: "Sommer · B-02" },
  { plate: "MU LH 418", car: "VW Golf VII", owner: "Lena Hartmann", hu: 148, km: "68.420", tires: "Winter · B-14" },
  { plate: "MU DE 64", car: "Renault Zoe", owner: "Derya Erdem", hu: 203, km: "31.050", tires: "Sommer · A-19" },
];

function Vehicles() {
  const { toast } = useDemo();
  const [sent, setSent] = useState<string[]>([]);
  return (
    <Panel flush tour="hu" title="Hauptuntersuchung fällig" aside="sortiert nach Dringlichkeit">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Fahrzeug</th>
              <th className={th}>Halter</th>
              <th className={cx(th, "text-right")}>Kilometer</th>
              <th className={th}>Räder im Lager</th>
              <th className={th}>HU fällig</th>
              <th className={cx(th, "text-right")}>Erinnerung</th>
            </tr>
          </thead>
          <tbody>
            {FLEET.map((v) => (
              <tr key={v.plate} className={tr}>
                <td className={td}>
                  <Plate value={v.plate} size="sm" />
                  <span className="mt-1 block text-bo-ink">{v.car}</span>
                </td>
                <td className={td}>{v.owner}</td>
                <td className={cx(td, "num text-right")}>{v.km}</td>
                <td className={td}>{v.tires}</td>
                <td className={td}>
                  <Tag tone={v.hu < 14 ? "bad" : v.hu < 45 ? "warn" : "neutral"}>in {v.hu} Tagen</Tag>
                </td>
                <td className={cx(td, "text-right")}>
                  {sent.includes(v.plate) ? (
                    <Tag tone="ok">gesendet {clock()}</Tag>
                  ) : v.hu < 60 ? (
                    <Btn
                      size="sm"
                      onClick={() => {
                        setSent((s) => [...s, v.plate]);
                        toast(`Erinnerung an ${v.owner} gesendet – mit Link direkt zur Terminbuchung.`);
                      }}
                    >
                      Erinnerung senden
                    </Btn>
                  ) : (
                    <span className="text-[12.5px] text-bo-muted">automatisch in {v.hu - 42} Tagen</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Numbers({ jobs }: { jobs: Job[] }) {
  const today = jobs.filter((j) => j.day === 0);
  const load = Math.round((today.filter((j) => j.bay < 3).reduce((s, j) => s + j.min, 0) / ((DAY_END - DAY_START) * 3)) * 100);
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Fahrzeuge heute", value: today.length, note: `${today.filter((j) => j.step === 4).length} abholbereit` },
          { label: "Auslastung der Bühnen", value: `${load} %`, note: "Ziel: 80 %" },
          { label: "Zusatzarbeiten freigegeben", value: "78 %", note: "per Telefon waren es 52 %" },
          { label: "Antwort auf Freigaben", value: "11 Min.", note: "im Schnitt, per Handy" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-2">
        <Panel title="Umsatz nach Leistung" aside="laufender Monat">
          <Ranks
            data={[
              { label: "Inspektion und Wartung", value: 38400 },
              { label: "Bremsen und Fahrwerk", value: 21750 },
              { label: "Räder und Einlagerung", value: 14200 },
              { label: "HU / AU", value: 9860 },
              { label: "Klima", value: 4350 },
            ]}
            format={eur0}
          />
        </Panel>
        <Panel title="Wann online gebucht wird" aside="letzte 30 Tage">
          <Bars
            label="Online-Buchungen nach Tageszeit"
            data={[
              { label: "6–9", value: 14 },
              { label: "9–12", value: 22 },
              { label: "12–15", value: 19 },
              { label: "15–18", value: 27 },
              { label: "18–21", value: 48 },
              { label: "21–24", value: 31 },
              { label: "0–6", value: 9 },
            ]}
            mark={4}
          />
          <p className="mt-3 text-[12.5px] text-bo-muted">52 % der Buchungen kommen, wenn die Annahme geschlossen ist.</p>
        </Panel>
      </div>
    </div>
  );
}
