"use client";

import { useState } from "react";
import Image from "next/image";
import { CalendarDays, CarFront, ChartColumn, Check, ClipboardList, Clock, MapPin, Phone, TriangleAlert, Wrench } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Tag, td, th, tr } from "@/demos/kit/ui";
import { clock, cx, dur, eur, eur0, fmtDay, hm, nowMinutes, weekdayShort, workday } from "@/demos/kit/util";

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
    <div className="mt-5">
      <div className="h-1.5 w-full bg-[#e3e9ec]" role="presentation">
        <div className="h-full bg-d-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
      <ol className="mt-px grid grid-cols-5 gap-px bg-[#d2dce0]">
        {steps.map((s, i) => {
          const done = i < current;
          const now = i === current;
          return (
            <li key={s} aria-current={now ? "step" : undefined} className={cx("bg-white px-1 pt-2 pb-1.5 text-center", (done || now) && "bg-d-soft")}>
              <span className={cx("num mx-auto grid size-6 place-items-center font-plex-mono text-[11px] font-semibold", done ? "bg-d-accent text-white" : now ? "border-2 border-d-accent bg-white text-d-accent" : "border border-[#b9c6cb] bg-white text-[#9aa8ad]")}>{String(i + 1).padStart(2, "0")}</span>
              <span className={cx("mt-1 block text-[10.5px] leading-tight tracking-[0.04em] uppercase", now ? "font-semibold text-d-deep" : done ? "text-d-deep" : "text-[#9aa8ad]")}>{s}</span>
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

/* ───────────────────────────── Kundenseite ───────────────────────────── */

const H = "font-d-display font-extrabold tracking-tight [font-stretch:88%]";

function CustomerSite({ jobs, onPatch, onBook }: { jobs: Job[]; onPatch: (no: string, c: Partial<Job>) => void; onBook: (j: Omit<Job, "no" | "step" | "own" | "bay">) => string }) {
  const { tab, setTab } = useDemo();
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-[#eef2f5] font-plex text-[15px] text-[#0e1b1d]">
      <header className="bg-d-deep text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 @dsm:px-6">
          <p className="flex items-center gap-3 py-3">
            <span className="grid h-8 place-items-center bg-d-accent px-2 font-d-display text-[15px] font-black tracking-wide [font-stretch:80%]">FALKNER</span>
            <span className="hidden font-plex-mono text-[10.5px] tracking-[0.22em] text-[#8fa3a8] uppercase @dsm:inline">Werkstatt & Service · Musterstadt</span>
          </p>
          <nav aria-label="Kundenbereich" className="flex gap-1">
            {[
              { id: "termin", label: "Termin buchen" },
              { id: "fahrzeug", label: "Mein Fahrzeug" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-12 border-b-[3px] px-3 text-[13.5px] font-semibold tracking-[0.04em] uppercase", tab === n.id ? "border-d-accent text-white" : "border-transparent text-[#8fa3a8] hover:text-white")}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="h-1 bg-d-accent" aria-hidden />
      </header>
      {tab === "fahrzeug" ? <MyCar job={jobs.find((j) => j.mine)!} onPatch={onPatch} /> : <BookService jobs={jobs} onBook={onBook} />}
    </div>
  );
}

function BookService({ jobs, onBook }: { jobs: Job[]; onBook: (j: Omit<Job, "no" | "step" | "own" | "bay">) => string }) {
  const { go } = useDemo();
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

  const chosen = SERVICES.filter((s) => picked.includes(s.id));
  const min = chosen.reduce((n, s) => n + s.min, 0);
  const mobility = MOBILITY.find((m) => m.id === mob)!;
  const price = chosen.reduce((n, s) => n + s.price, 0) + mobility.price;
  const times = [450, 480, 540, 600, 780, 840];
  // Frei, solange an dem Tag nicht alle drei Bühnen zur selben Zeit belegt sind
  const busy = (t: number) => jobs.filter((j) => j.day === dayIdx && j.bay < 3 && t < j.start + j.min && t + Math.max(min, 30) > j.start).length >= 3;
  const plateShown = plate.trim().toUpperCase() || "MU AB 123";
  const valid = plate.trim().length >= 4 && name.trim().length > 1 && phone.trim().length > 5 && time !== null && chosen.length > 0;

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 @dsm:px-6">
        <span className="grid size-12 place-items-center bg-d-accent text-white">
          <Check className="size-6" strokeWidth={2.5} aria-hidden />
        </span>
        <p className="mt-5 font-plex-mono text-[11px] tracking-[0.24em] text-d-accent uppercase">Buchung bestätigt · Annahme Musterstadt</p>
        <h1 className={cx(H, "mt-2 text-[2.1rem] leading-none uppercase text-d-deep")}>Termin bestätigt.</h1>
        <p className="mt-3 text-[16px] leading-relaxed">
          Wir erwarten Sie am {fmtDay(workday(dayIdx))} um {hm(time!)} Uhr in der Annahme. Ihre Auftragsnummer: <span className="font-plex-mono font-medium text-d-deep">{done}</span>
        </p>
        <p className="mt-4">
          <Plate value={plateShown} size="lg" />
        </p>
        <div className="mt-6 border border-[#d2dce0] bg-d-soft p-4 text-[14px] leading-snug shadow-[inset_4px_0_0_var(--d-accent)]">
          <strong className="font-semibold">So sieht es die Werkstatt:</strong> Ihr Termin hat sich selbst in den Werkstattplan eingetragen – niemand musste ans Telefon.
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => go("betrieb", "plan")} className="min-h-11 bg-d-deep px-4 font-medium text-white hover:bg-[#16292c]">
              Im Werkstattplan ansehen
            </button>
            <button type="button" onClick={() => go("kunde", "fahrzeug")} className="min-h-11 border border-[#b9c6cb] bg-white px-4 font-medium hover:border-d-deep">
              Fahrzeugstatus ansehen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const head = (n: string, t: string) => (
    <h2 className={cx(H, "flex items-center gap-3 text-[1.2rem] uppercase text-d-deep")}>
      <span className="grid size-7 shrink-0 place-items-center bg-d-accent font-plex-mono text-[13px] font-semibold text-white">{n}</span>
      {t}
    </h2>
  );
  const option = (on: boolean) => cx("flex min-h-14 w-full items-center gap-3 border px-3 py-2 text-left transition-colors", on ? "border-d-deep bg-d-soft shadow-[inset_4px_0_0_var(--d-accent)]" : "border-[#d2dce0] bg-white hover:border-d-deep");

  return (
    <>
      <div className="relative overflow-hidden bg-d-deep text-white">
        <Image src="/images/demo/photos/w-hero.webp" alt="Silbernes Fahrzeug in der dunklen Ausstellungshalle des Autohauses" fill priority sizes="100vw" className="object-cover object-[center_60%] opacity-45" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(14,27,29,0.96)_10%,rgba(14,27,29,0.45)_100%)]" aria-hidden />
        <div className="absolute inset-x-0 top-0 h-1 bg-d-accent" aria-hidden />
        <div className="relative mx-auto flex min-h-[20rem] max-w-6xl flex-col justify-end gap-3 px-4 pt-14 pb-6 @dsm:px-6 @dlg:min-h-[23rem]">
          <p className="font-plex-mono text-[11px] tracking-[0.28em] text-d-accent uppercase">Werkstatt & Service · Musterstadt</p>
          <h1 className={cx(H, "max-w-2xl text-[2.15rem] leading-[0.92] text-white uppercase @dsm:text-[2.8rem] @dlg:text-[3.3rem]")}>Werkstatt-Termin in zwei Minuten.</h1>
          <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-[#c3d0d3]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden /> Industriestraße 40, Musterstadt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> Annahme Mo – Fr ab 7:30
            </span>
            <span className="inline-flex items-center gap-1.5 font-plex-mono">
              <Phone className="size-3.5" aria-hidden /> 01234 778 900
            </span>
          </p>
          <p>
            <a href="#buchen" className="inline-flex min-h-12 items-center bg-d-accent px-6 text-[14.5px] font-semibold tracking-[0.06em] text-white uppercase hover:brightness-95">Termin buchen</a>
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-7 @dsm:px-6 @dlg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-8">
          <section id="buchen">
            {head("1", "Ihr Fahrzeug")}
            <div className="mt-3 grid gap-3 @dsm:grid-cols-[auto_1fr]">
              <Field label="Kennzeichen">
                <span className="flex items-stretch overflow-hidden border-2 border-bo-ink bg-white focus-within:ring-2 focus-within:ring-d-accent">
                  <span className="flex w-6 items-end justify-center bg-[#1d4ed8] pb-1 font-plex-mono text-[10px] font-medium text-white" aria-hidden>
                    D
                  </span>
                  <input value={plate} onChange={(e) => setPlate(e.target.value.toUpperCase().slice(0, 10))} placeholder="MU AB 123" autoCapitalize="characters" className="min-h-11 w-40 bg-transparent px-2.5 font-plex-mono text-[19px] font-medium tracking-wide text-bo-ink outline-none placeholder:text-[#a7b4b9]" />
                </span>
              </Field>
              <Field label="Modell">
                <select value={model} onChange={(e) => setModel(e.target.value)} className={input}>
                  {MODELS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          <section data-tour="leistungen">
            {head("2", "Was soll gemacht werden?")}
            <ul className="mt-3 grid gap-2 @dsm:grid-cols-2">
              {SERVICES.map((s) => {
                const on = picked.includes(s.id);
                return (
                  <li key={s.id}>
                    <button type="button" aria-pressed={on} onClick={() => setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]))} className={option(on)}>
                      <span className={cx("grid size-5 shrink-0 place-items-center border", on ? "border-d-accent bg-d-accent text-white" : "border-[#8d9ba0] bg-white")}>{on && <Check className="size-3.5" strokeWidth={3} aria-hidden />}</span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block font-semibold text-d-deep">{s.name}</span>
                        <span className="block text-[12.5px] text-[#5f7075]">
                          {s.note} · {dur(s.min)}
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
            {head("3", "Wie bleiben Sie mobil?")}
            <div className="mt-3 grid gap-px border border-[#d2dce0] bg-[#d2dce0] @dsm:grid-cols-3">
              {MOBILITY.map((m) => {
                const on = mob === m.id;
                return (
                  <button key={m.id} type="button" aria-pressed={on} onClick={() => setMob(m.id)} className={cx("min-h-14 px-3 py-2 text-left transition-colors", on ? "bg-d-deep text-white" : "bg-white hover:bg-[#e4eaed]")}>
                    <span className="leading-tight">
                      <span className="block font-semibold">{m.name}</span>
                      <span className={cx("block text-[12.5px]", on ? "text-[#a9bcc0]" : "text-[#5f7075]")}>{m.note}</span>
                      <span className={cx("num mt-0.5 block font-plex-mono text-[13px] font-medium", on ? "text-white" : "text-d-deep")}>{m.price ? `+ ${eur0(m.price)}` : "inklusive"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            {head("4", "Wann bringen Sie das Fahrzeug?")}
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
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
                    className={cx("min-h-14 w-16 shrink-0 border text-center leading-tight transition-colors", dayIdx === i ? "border-d-deep bg-d-deep text-white shadow-[inset_0_3px_0_var(--d-accent)]" : "border-[#d2dce0] bg-white hover:border-d-deep")}
                  >
                    <span className="block text-[12px] opacity-75">{weekdayShort(d)}</span>
                    <span className="num block font-plex-mono text-[17px] font-semibold">{d.getDate()}.</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5 @dsm:grid-cols-6">
              {times.map((t) => {
                const full = busy(t);
                return (
                  <button key={t} type="button" disabled={full} aria-pressed={time === t} onClick={() => setTime(t)} className={cx("num min-h-11 border font-plex-mono text-[14px] font-medium disabled:text-[#9aa8ad] disabled:line-through", time === t ? "border-d-accent bg-d-accent text-white" : "border-[#d2dce0] bg-white hover:border-d-deep")}>
                    {hm(t)}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            {head("5", "Ihre Kontaktdaten")}
            <form
              noValidate
              className="mt-3 grid gap-3 @dsm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!valid) return;
                setDone(onBook({ plate: plateShown, car: model, customer: name.trim(), work: chosen.map((s) => s.name).join(", "), day: dayIdx, start: time!, min: Math.max(min, 30), total: price }));
              }}
            >
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Telefon" hint="Für Rückfragen und die Freigabe von Zusatzarbeiten.">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={input} placeholder="0151 2345678" />
              </Field>
              {tried && !valid && (
                <p role="alert" className="text-[13px] text-bo-bad @dsm:col-span-2">
                  Es fehlt noch etwas: Kennzeichen, mindestens eine Leistung, eine Uhrzeit, Name und Telefon. Erfundene Angaben genügen.
                </p>
              )}
              <div className="@dsm:col-span-2">
                <button type="submit" className="min-h-12 w-full bg-d-accent px-6 text-[14.5px] font-semibold tracking-[0.06em] text-white uppercase hover:brightness-95 @dsm:w-auto">
                  Termin verbindlich buchen
                </button>
                <p className="mt-2 text-[12px] text-[#5f7075]">Demo: Es wird nichts gebucht oder gespeichert.</p>
              </div>
            </form>
          </section>
        </div>

        <aside>
          <div className="sticky top-[calc(var(--bar-h)+1rem)] border border-[#d2dce0] bg-white">
            <div className="h-1 bg-d-accent" aria-hidden />
            <div className="bg-d-deep px-5 py-4 text-white">
              <p className="font-plex-mono text-[10.5px] tracking-[0.22em] text-[#8fa3a8] uppercase">Ihr Auftrag</p>
              <p className="mt-2">
                <Plate value={plateShown} />
              </p>
              <p className="mt-2 text-[14px]">{model}</p>
            </div>
            <div className="px-5 py-4">
              {chosen.length === 0 ? (
                <p className="text-[14px] text-[#5f7075]">Wählen Sie mindestens eine Leistung.</p>
              ) : (
                <ul className="space-y-2 text-[14px]">
                  {chosen.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3">
                      <span>{s.name}</span>
                      <span className="num font-plex-mono text-[#5f7075]">{s.price ? eur(s.price) : "0,00 €"}</span>
                    </li>
                  ))}
                  {mobility.price > 0 && (
                    <li className="flex justify-between gap-3">
                      <span>{mobility.name}</span>
                      <span className="num font-plex-mono text-[#5f7075]">{eur(mobility.price)}</span>
                    </li>
                  )}
                </ul>
              )}
              <dl className="num mt-4 space-y-1.5 border-t border-[#dde5e8] pt-3 font-plex-mono text-[14px]">
                <div className="flex justify-between">
                  <dt className="text-[#5f7075]">Arbeitszeit</dt>
                  <dd>{min ? `ca. ${dur(min)}` : "–"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#5f7075]">Annahme</dt>
                  <dd>{time !== null ? `${fmtDay(workday(dayIdx))}, ${hm(time)}` : "noch offen"}</dd>
                </div>
                <div className="flex justify-between border-t border-[#dde5e8] pt-2 text-[17px] font-semibold text-d-deep">
                  <dt>Richtpreis</dt>
                  <dd>{eur(price)}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[12px] leading-snug text-[#5f7075]">Inklusive Mehrwertsteuer. Mehr wird es nur, wenn Sie eine Zusatzarbeit ausdrücklich freigeben.</p>
            </div>
          </div>
        </aside>
      </div>
    </>
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
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 @dsm:px-6 @dlg:grid-cols-[minmax(0,1fr)_21rem]">
      <div className="space-y-5">
        <div>
          <p className="text-[13px] text-[#5f7075]">Guten Tag, Frau Hartmann</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Plate value={job.plate} size="lg" />
            <div>
              <h1 className={cx(H, "text-[1.6rem] leading-none uppercase text-d-deep")}>{job.car}</h1>
              <p className="num mt-1 font-plex-mono text-[13px] text-[#5f7075]">68.420 km · Auftrag {job.no}</p>
            </div>
          </div>
        </div>

        <section data-tour="status" className="border border-[#d2dce0] bg-white p-5">
          <h2 className="font-plex-mono text-[11px] font-semibold tracking-[0.22em] text-[#5f7075] uppercase">Stand Ihres Fahrzeugs</h2>
          <p className={cx(H, "mt-1 text-[1.5rem] uppercase text-d-deep")}>{job.step >= 4 ? "Abholbereit – wir freuen uns auf Sie." : job.step === 3 ? "In der Endkontrolle." : "In Arbeit auf Bühne 2."}</p>
          <p className="num mt-0.5 font-plex-mono text-[14px] text-[#5f7075]">Voraussichtlich fertig um {hm(job.start + job.min + 20)} Uhr</p>
          <StatusRail steps={[...STEPS]} current={Math.min(job.step, 4)} />
          <ol className="mt-5 space-y-1.5 border-t border-[#dde5e8] pt-4 text-[14px]">
            {log.map((l, i) => (
              <li key={i} className="flex gap-3">
                <span className="num w-11 shrink-0 font-plex-mono text-[13px] text-d-accent">{l.t || "jetzt"}</span>
                <span>{l.text}</span>
              </li>
            ))}
          </ol>
        </section>

        <section data-tour="freigabe" className={cx("border bg-white", ex.state === "offen" ? "border-d-accent" : "border-[#d2dce0]")}>
          <div className={cx("flex items-center gap-2 px-5 py-2.5 text-[13px] font-semibold", ex.state === "offen" ? "bg-d-accent text-white" : ex.state === "frei" ? "bg-d-deep text-white" : "bg-[#e4eaed] text-[#5f7075]")}>
            {ex.state === "offen" ? <TriangleAlert className="size-4" aria-hidden /> : <Check className="size-4" aria-hidden />}
            {ex.state === "offen" ? "Ihre Freigabe wird benötigt" : ex.state === "frei" ? `Freigegeben um ${ex.at} Uhr` : `Abgelehnt um ${ex.at} Uhr`}
          </div>
          <div className="grid gap-5 p-5 @dsm:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <div className="relative mb-4 aspect-[3/2] w-full max-w-sm overflow-hidden border border-[#d2dce0]">
                <Image src="/images/demo/photos/w-mech1.webp" alt="Mechaniker am offenen Motorraum – der Befund entsteht direkt am Fahrzeug" fill sizes="(min-width: 40rem) 24rem, 100vw" className="object-cover object-[center_55%]" />
                <span className="absolute bottom-0 left-0 bg-d-deep px-2 py-1 font-plex-mono text-[10px] tracking-[0.18em] text-white uppercase">Befundfoto · Bühne 2</span>
              </div>
              <h3 className="text-[17px] font-semibold text-d-deep">{ex.text}</h3>
              <p className="mt-1 text-[14px] leading-relaxed">Bei der Inspektion gemessen: 2 mm Restbelag vorn. Unter 3 mm verlängert sich der Bremsweg spürbar, die Beläge sollten jetzt getauscht werden.</p>
              {/* Messwert als Skala: Neuzustand 12 mm, Grenze 3 mm, gemessen 2 mm */}
              <div className="mt-4 max-w-sm" role="img" aria-label="Belagstärke: gemessen 2 Millimeter, Verschleißgrenze 3 Millimeter, Neuzustand 12 Millimeter">
                <div className="relative h-3 bg-[linear-gradient(to_right,var(--d-accent)_0_25%,#e3e9ec_25%_100%)]">
                  <span className="absolute -top-1 h-5 w-1 bg-d-deep" style={{ left: "16.6%" }} />
                </div>
                <div className="num mt-1.5 flex justify-between font-plex-mono text-[11.5px] text-[#5f7075]">
                  <span className="font-semibold text-d-accent">Ist: 2 mm</span>
                  <span>Grenze 3 mm</span>
                  <span>Neu: 12 mm</span>
                </div>
              </div>
            </div>
            <div className="@dsm:text-right">
              <p className="num font-plex-mono text-[2rem] leading-none font-semibold text-d-deep">{eur(ex.price)}</p>
              <p className="mt-1 text-[12.5px] text-[#5f7075]">Material und Einbau, inkl. MwSt.</p>
              <p className="text-[12.5px] text-[#5f7075]">+ 45 Min. Arbeitszeit</p>
            </div>
          </div>
          {ex.state === "offen" && (
            <div className="flex flex-wrap gap-2 border-t border-[#dde5e8] px-5 py-3">
              <button type="button" onClick={() => decide("frei")} className="min-h-12 flex-1 bg-d-accent px-5 text-[14.5px] font-semibold tracking-[0.06em] text-white uppercase hover:brightness-95">
                Freigeben
              </button>
              <button type="button" onClick={() => decide("abgelehnt")} className="min-h-12 border border-d-deep px-5 font-semibold text-d-deep hover:bg-[#e4eaed]">
                Ablehnen
              </button>
              <button type="button" onClick={() => toast("Rückruf notiert – die Annahme meldet sich in den nächsten Minuten.")} className="min-h-12 border border-[#b9c6cb] px-4 font-medium hover:border-d-deep">
                Bitte anrufen
              </button>
            </div>
          )}
          {ex.state !== "offen" && (
            <div className="border-t border-[#dde5e8] bg-d-soft px-5 py-3 text-[13.5px] shadow-[inset_4px_0_0_var(--d-accent)]">
              <strong className="font-semibold">So sieht es die Werkstatt:</strong> Ihre Entscheidung steht jetzt im Auftrag.{" "}
              <button type="button" onClick={() => go("betrieb", "auftraege")} className="font-semibold text-d-accent underline underline-offset-2">
                Im Dashboard ansehen
              </button>
            </div>
          )}
        </section>
      </div>

      <aside className="space-y-4">
        <div className="border border-[#d2dce0] bg-white p-5">
          <h2 className="font-plex-mono text-[11px] font-semibold tracking-[0.22em] text-[#5f7075] uppercase">Kosten</h2>
          <ul className="num mt-3 space-y-2 font-plex-mono text-[14px]">
            <li className="flex justify-between">
              <span>Inspektion</span>
              <span>289,00 €</span>
            </li>
            <li className="flex justify-between">
              <span>Ölwechsel mit Filter</span>
              <span>119,00 €</span>
            </li>
            <li className={cx("flex justify-between", ex.state !== "frei" && "text-[#9aa8ad]")}>
              <span>
                Bremsbeläge vorn{ex.state === "offen" && " (offen)"}
                {ex.state === "abgelehnt" && " (abgelehnt)"}
              </span>
              <span className={ex.state === "abgelehnt" ? "line-through" : ""}>{eur(ex.price)}</span>
            </li>
            <li className="flex justify-between border-t border-[#dde5e8] pt-2 text-[16px] font-semibold text-d-deep">
              <span>Gesamt</span>
              <span>{eur(total)}</span>
            </li>
          </ul>
          <p className="mt-3 text-[12px] text-[#5f7075]">Zahlung bei Abholung oder vorab online.</p>
        </div>
        <div className="border border-[#d2dce0] bg-white p-5 text-[14px]">
          <h2 className="font-plex-mono text-[11px] font-semibold tracking-[0.22em] text-[#5f7075] uppercase">Fahrzeugakte</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-3">
              <dt className="text-[#5f7075]">Nächste HU</dt>
              <dd className="num font-plex-mono">März 2027</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#5f7075]">Winterräder</dt>
              <dd>eingelagert · Regal B-14</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#5f7075]">Letzter Service</dt>
              <dd className="num font-plex-mono">vor 11 Monaten</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#5f7075]">Ihr Berater</dt>
              <dd>Kemal Demir</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
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
