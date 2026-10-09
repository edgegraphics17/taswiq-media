"use client";

import { useMemo, useState } from "react";
import { ArrowDown, BellRing, CalendarDays, ChartColumn, Check, ChevronLeft, ChevronRight, Clock, MapPin, ShieldCheck, Users } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { DayGrid } from "@/demos/kit/DayGrid";
import { Avatar, Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Sheet, Tag, td, th, tr } from "@/demos/kit/ui";
import { cx, dur, eur0, fmtDay, fmtDayLong, hm, nowMinutes, useOnce, weekdayShort, workday } from "@/demos/kit/util";

/**
 * Demo "Studio Malou": Buchungsseite für Kosmetik und Nägel + Dashboard mit Plätzen statt Personen.
 * Jede Behandlung braucht ihren Platz (Kabine oder Nageltisch) – freie Zeiten ergeben sich aus dessen Belegung.
 * Online-Buchungen hinterlegen eine Anzahlung; wer nicht erscheint, verliert sie.
 */

type Cat = "Gesicht" | "Nägel" | "Wimpern & Brauen" | "Haarentfernung";
interface Treat {
  id: string;
  cat: Cat;
  name: string;
  min: number;
  price: number;
  note?: string;
  /** Wochen bis zum nächsten Termin (Auffüllen, Auffrischen) */
  refill?: number;
}
const TREATS: Treat[] = [
  { id: "g-klassik", cat: "Gesicht", name: "Klassische Gesichtsbehandlung", min: 60, price: 69, note: "Reinigung, Peeling, Maske, Massage" },
  { id: "g-tief", cat: "Gesicht", name: "Tiefenreinigung mit Ausreinigen", min: 75, price: 84, note: "Für unreine und Mischhaut" },
  { id: "g-needle", cat: "Gesicht", name: "Microneedling", min: 60, price: 129, note: "Als Kur mit drei Terminen empfohlen" },
  { id: "n-neu", cat: "Nägel", name: "Neumodellage Gel", min: 90, price: 65, note: "Natur, French oder Farbe", refill: 4 },
  { id: "n-auf", cat: "Nägel", name: "Auffüllen Gel", min: 60, price: 45, note: "Alle drei bis vier Wochen", refill: 4 },
  { id: "n-shellac", cat: "Nägel", name: "Maniküre mit Shellac", min: 45, price: 39, note: "Hält bis zu drei Wochen", refill: 3 },
  { id: "n-pedi", cat: "Nägel", name: "Pediküre mit Lack", min: 50, price: 42 },
  { id: "w-lift", cat: "Wimpern & Brauen", name: "Wimpernlifting mit Färben", min: 60, price: 59, note: "Hält sechs bis acht Wochen", refill: 6 },
  { id: "w-lam", cat: "Wimpern & Brauen", name: "Brow Lamination", min: 45, price: 49, refill: 6 },
  { id: "w-zupf", cat: "Wimpern & Brauen", name: "Brauen zupfen und färben", min: 20, price: 19 },
  { id: "h-bein", cat: "Haarentfernung", name: "Waxing Beine komplett", min: 45, price: 44 },
  { id: "h-lippe", cat: "Haarentfernung", name: "Waxing Oberlippe und Kinn", min: 15, price: 14 },
];
const CATS: { id: Cat; note: string }[] = [
  { id: "Gesicht", note: "Pflege, Reinigung, Kuren" },
  { id: "Nägel", note: "Gel, Shellac, Pediküre" },
  { id: "Wimpern & Brauen", note: "Lifting, Lamination, Farbe" },
  { id: "Haarentfernung", note: "Waxing mit Warmwachs" },
];

interface Place {
  id: string;
  name: string;
  who: string;
  cats: Cat[];
  pause: [number, number];
}
const PLACES: Place[] = [
  { id: "k1", name: "Kabine 1", who: "Elif Demir", cats: ["Gesicht"], pause: [13 * 60, 13 * 60 + 45] },
  { id: "k2", name: "Kabine 2", who: "Jana Brandt", cats: ["Wimpern & Brauen", "Haarentfernung"], pause: [12 * 60 + 30, 13 * 60 + 15] },
  { id: "nt", name: "Nageltisch", who: "Mai Tran", cats: ["Nägel"], pause: [14 * 60, 14 * 60 + 30] },
];
const OPEN = 9 * 60;
const CLOSE = 19 * 60;
const DAYS = 6;
const DEPOSIT = 10;

type Status = "bestaetigt" | "da" | "noshow";
interface Appt {
  id: number;
  place: string;
  day: number;
  start: number;
  treat: string;
  customer: string;
  status: Status;
  deposit: boolean;
  own?: boolean;
}
const treat = (id: string) => TREATS.find((t) => t.id === id)!;
const place = (id: string) => PLACES.find((p) => p.id === id)!;

/** Zwei typische Tagesmuster je Platz, im Wechsel über die Woche: [Beginn, Behandlung, Kundin] */
const PATTERN: Record<string, [number, string, string][][]> = {
  k1: [
    [
      [540, "g-klassik", "Renate Ott"],
      [615, "g-tief", "Vanessa Kurz"],
      [705, "g-klassik", "Dilara Aksoy"],
      [840, "g-needle", "Sabine Frei"],
      [1020, "g-tief", "Miriam Weiß"],
    ],
    [
      [570, "g-needle", "Carla Mendes"],
      [660, "g-klassik", "Heike Arnold"],
      [840, "g-tief", "Nadine Scholz"],
      [960, "g-klassik", "Tanja Reiter"],
    ],
  ],
  k2: [
    [
      [540, "w-lift", "Aylin Kara"],
      [615, "w-zupf", "Pia Lorenz"],
      [645, "h-bein", "Svenja Kuhn"],
      [800, "w-lam", "Melina Graf"],
      [870, "h-lippe", "Ursula Beck"],
      [900, "w-lift", "Katharina Voss"],
      [990, "w-zupf", "Jule Hofmann"],
    ],
    [
      [555, "h-bein", "Laura Seidel"],
      [630, "w-lift", "Chiara Russo"],
      [810, "w-lam", "Franka Lutz"],
      [900, "w-zupf", "Ebru Çelik"],
      [960, "w-lift", "Isabel König"],
    ],
  ],
  nt: [
    [
      [540, "n-auf", "Sandra Böhm"],
      [610, "n-neu", "Yasemin Polat"],
      [710, "n-shellac", "Marie Engel"],
      [875, "n-pedi", "Gisela Maurer"],
      [935, "n-auf", "Jessica Roth"],
      [1005, "n-neu", "Alina Fischer"],
    ],
    [
      [540, "n-neu", "Derya Yildiz"],
      [640, "n-auf", "Bianca Schulte"],
      [875, "n-shellac", "Lisa Kraus"],
      [930, "n-auf", "Monika Jahn"],
      [1000, "n-pedi", "Helga Stark"],
    ],
  ],
};

function seedAppts(): Appt[] {
  const now = nowMinutes();
  let id = 1;
  const out: Appt[] = [];
  for (let day = 0; day < DAYS; day++) {
    for (const p of PLACES) {
      for (const [start, t, customer] of PATTERN[p.id][day % 2]) {
        const past = day === 0 && start + treat(t).min < now;
        out.push({ id: id++, place: p.id, day, start, treat: t, customer, status: past ? (customer === "Vanessa Kurz" ? "noshow" : "da") : "bestaetigt", deposit: id % 3 !== 0 });
      }
    }
  }
  // Stammkundin der Demo: ihr Auffülltermin in drei Tagen
  out.push({ id: 900, place: "nt", day: 3, start: 17 * 60 + 45, treat: "n-auf", customer: "Lena Hartmann", status: "bestaetigt", deposit: true, own: true });
  return out;
}

const free = (appts: Appt[], p: Place, day: number, start: number, min: number) => {
  const end = start + min;
  if (start < OPEN || end > CLOSE) return false;
  if (start < p.pause[1] && end > p.pause[0]) return false;
  if (day === 0 && start < nowMinutes() + 30) return false;
  return !appts.some((a) => a.place === p.id && a.day === day && start < a.start + treat(a.treat).min && end > a.start);
};

interface Client {
  name: string;
  phone: string;
  visits: number;
  spent: number;
  usual: string;
  /** Tage bis zum fälligen Folgetermin; negativ = überfällig */
  due: number | null;
  booked: boolean;
  note: string;
}
const CLIENTS: Client[] = [
  { name: "Lena Hartmann", phone: "0151 2345 6701", visits: 9, spent: 428, usual: "Auffüllen Gel", due: 3, booked: true, note: "Form: Mandel, mittellang. Farbe meist 042 Nude. Latexallergie – nur Nitrilhandschuhe." },
  { name: "Yasemin Polat", phone: "0176 5510 2284", visits: 14, spent: 702, usual: "Auffüllen Gel", due: -6, booked: false, note: "Kommt sonst alle vier Wochen. Seit sechs Tagen überfällig." },
  { name: "Sabine Frei", phone: "0160 7781 0932", visits: 3, spent: 387, usual: "Microneedling", due: 9, booked: false, note: "Kur: Termin 2 von 3 steht noch aus. Kein Retinol sieben Tage vorher." },
  { name: "Aylin Kara", phone: "0157 3340 1175", visits: 6, spent: 354, usual: "Wimpernlifting mit Färben", due: 12, booked: false, note: "Verträgt die Färbung in Blauschwarz gut. Patch-Test liegt vor." },
  { name: "Vanessa Kurz", phone: "0172 6609 4418", visits: 4, spent: 252, usual: "Tiefenreinigung", due: null, booked: false, note: "Heute nicht erschienen – Anzahlung einbehalten. Zweiter Ausfall in diesem Jahr." },
  { name: "Nicole Kern", phone: "0151 9024 3360", visits: 22, spent: 1034, usual: "Auffüllen Gel", due: 2, booked: false, note: "Immer French, kurz. Mag frühe Termine vor der Arbeit." },
  { name: "Renate Ott", phone: "06101 44 21 87", visits: 31, spent: 2139, usual: "Klassische Gesichtsbehandlung", due: 18, booked: true, note: "Stammkundin seit 2019. Empfindliche Haut, keine Fruchtsäure." },
  { name: "Marie Engel", phone: "0162 4471 9053", visits: 5, spent: 195, usual: "Maniküre mit Shellac", due: -2, booked: false, note: "" },
];

export default function KosmetikDemo() {
  const { view } = useDemo();
  const [appts, setAppts] = useState<Appt[]>(seedAppts);
  const book = (a: Pick<Appt, "place" | "day" | "start" | "treat" | "customer">) => setAppts((p) => [...p, { ...a, id: Date.now(), status: "bestaetigt", deposit: true, own: true }]);
  const patch = (id: number, change: Partial<Appt> | null) => setAppts((p) => (change ? p.map((a) => (a.id === id ? { ...a, ...change } : a)) : p.filter((a) => a.id !== id)));
  return view === "kunde" ? <Storefront appts={appts} onBook={book} onPatch={patch} /> : <Dashboard appts={appts} onPatch={patch} />;
}

/* ───────────────────────────── Buchungsseite ─────────────────────────────
   Gestaltung „Studio Malou": warmes Creme, Beerenton als einzige Farbe, Fraunces für Überschriften.
   Runde Formen (Bögen, Pillen), viel Luft – ruhig wie das Studio selbst. */

const M = {
  wrap: "mx-auto w-full max-w-[72rem] px-4 @dsm:px-6 @dlg:px-8",
  label: "text-[11px] leading-none font-semibold tracking-[0.16em] uppercase",
  display: "font-d-display font-medium tracking-[-0.02em]",
  soft: "text-[#6b5a5d]",
  btn: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[15px] font-semibold transition-[filter,background-color] active:translate-y-px",
  card: "rounded-[1.5rem] border border-[#e8dcd3] bg-white",
};

function Storefront({ appts, onBook, onPatch }: { appts: Appt[]; onBook: (a: Pick<Appt, "place" | "day" | "start" | "treat" | "customer">) => void; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const { tab, setTab } = useDemo();
  const [preset, setPreset] = useState("");
  return (
    <div className="min-h-[var(--app-h)] bg-[#f8f3ee] font-plex text-[15px] leading-[1.55] text-[#2c2125]">
      <header className="sticky top-[var(--bar-h)] z-20 border-b border-[#e8dcd3] bg-[#f8f3ee]/95 backdrop-blur">
        <div className={cx(M.wrap, "flex items-center justify-between gap-4")}>
          <p className="flex items-baseline gap-3 py-3">
            <span className={cx(M.display, "text-[1.35rem] leading-none text-[#2c2125] italic")}>Studio Malou</span>
            <span className={cx("hidden @dmd:inline", M.label, M.soft)}>Kosmetik & Nägel</span>
          </p>
          <nav aria-label="Kundenbereich" className="flex gap-1">
            {[
              { id: "buchen", label: "Termin buchen", short: "Buchen" },
              { id: "termine", label: "Meine Termine", short: "Termine" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-11 rounded-full px-4 text-[14px] font-semibold transition-colors", tab === n.id ? "bg-[#2c2125] text-white" : "text-[#2c2125] hover:bg-[#efe5dc]")}>
                <span className="@dsm:hidden">{n.short}</span>
                <span className="hidden @dsm:inline">{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "termine" ? (
        <Mine
          appts={appts}
          onPatch={onPatch}
          onRebook={(id) => {
            setPreset(id);
            setTab("buchen");
          }}
        />
      ) : (
        <Booking key={preset} appts={appts} preset={preset} onBook={onBook} />
      )}
      <footer className="border-t border-[#e8dcd3]">
        <div className={cx(M.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[13.5px]", M.soft)}>
          <span className={cx(M.display, "text-[1.1rem] text-[#2c2125] italic")}>Studio Malou</span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" aria-hidden /> Lindenallee 7, Musterstadt
          </span>
          <span className="num inline-flex items-center gap-2">
            <Clock className="size-4" aria-hidden /> Mo – Sa, 9:00 – 19:00
          </span>
        </div>
      </footer>
    </div>
  );
}

function Booking({ appts, preset, onBook }: { appts: Appt[]; preset: string; onBook: (a: Pick<Appt, "place" | "day" | "start" | "treat" | "customer">) => void }) {
  const { go, toTop } = useDemo();
  const [cat, setCat] = useState<Cat>(preset ? treat(preset).cat : "Nägel");
  const [picked, setPicked] = useState(preset);
  const [dayIdx, setDayIdx] = useState(() => (nowMinutes() + 90 > CLOSE ? 1 : 0));
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ day: number; start: number } | null>(null);
  const once = useOnce();

  const t = picked ? treat(picked) : null;
  const p = t ? PLACES.find((x) => x.cats.includes(t.cat))! : null;
  const slots = useMemo(() => {
    if (!t || !p) return [];
    const out: number[] = [];
    for (let s = OPEN; s + t.min <= CLOSE; s += 15) if (free(appts, p, dayIdx, s, t.min)) out.push(s);
    return out;
  }, [appts, t, p, dayIdx]);
  const bad = { name: name.trim().length < 2, phone: phone.trim().length < 6 };
  const pill = (on: boolean) => cx("border transition-colors", on ? "border-[#a8475d] bg-[#a8475d] text-white" : "border-[#dccfc5] bg-white text-[#2c2125] hover:border-[#a8475d]");
  const fieldCls = cx(input, "rounded-xl border-[#cdbfb5] focus:border-[#a8475d]");

  if (done && t && p) {
    return (
      <div className={cx(M.wrap, "py-12 @dlg:py-20")}>
        <div className="mx-auto max-w-xl">
          <p className={cx(M.label, "text-[#a8475d]")}>Bestätigung</p>
          <h1 className={cx(M.display, "mt-4 text-[clamp(2.5rem,10cqi,4.25rem)] leading-[0.95]")}>
            Wir freuen uns <em className="text-[#a8475d]">auf dich.</em>
          </h1>
          <div className={cx(M.card, "mt-8 p-6")}>
            <p className={cx(M.label, M.soft)}>{fmtDayLong(workday(done.day))}</p>
            <p className={cx(M.display, "num mt-2 text-[3.25rem] leading-none")}>{hm(done.start)}</p>
            <p className="mt-3">
              {t.name} · <span className="num">{dur(t.min)}</span> · {p.name} bei {p.who.split(" ")[0]}
            </p>
            <dl className="num mt-5 space-y-1.5 border-t border-dashed border-[#dccfc5] pt-4 text-[14.5px]">
              <div className="flex justify-between">
                <dt>Preis der Behandlung</dt>
                <dd>{eur0(t.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Anzahlung, jetzt hinterlegt</dt>
                <dd>− {eur0(DEPOSIT)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Im Studio zu zahlen</dt>
                <dd>{eur0(t.price - DEPOSIT)}</dd>
              </div>
            </dl>
          </div>
          <div className="mt-5 rounded-[1.5rem] bg-[#f4e1e3] p-5 text-[14.5px] leading-snug">
            <strong className="font-semibold">So sieht es das Studio:</strong> Dein Termin steht jetzt am Platz „{p.name}“ im Kalender – mit dem Vermerk, dass die Anzahlung da ist.
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("betrieb", "kalender")} className={cx(M.btn, "bg-[#a8475d] text-white hover:brightness-95")}>
                Im Kalender ansehen
              </button>
              <button
                type="button"
                onClick={() => {
                  setDone(null);
                  setPicked("");
                  setSlot(null);
                }}
                className={cx(M.btn, "border border-[#2c2125] text-[#2c2125] hover:bg-white")}
              >
                Weiteren Termin buchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const head = (n: number, title: string, hint?: string) => (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className={cx(M.display, "flex items-baseline gap-3 text-[1.85rem] leading-none @dsm:text-[2.25rem]")}>
        <span className="num text-[0.55em] text-[#a8475d] italic">{n}</span>
        {title}
      </h2>
      {hint && <span className={cx("hidden shrink-0 @dsm:block", M.label, M.soft)}>{hint}</span>}
    </div>
  );
  const locked = (on: boolean) => cx("scroll-mt-[calc(var(--bar-h)+4.5rem)] transition-opacity", on && "pointer-events-none opacity-40");

  return (
    <>
      <section className={cx(M.wrap, "grid gap-8 pt-8 pb-4 @dmd:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] @dmd:items-end @dlg:pt-14")}>
        <div>
          <p className={cx(M.label, "text-[#a8475d]")}>Kosmetik & Nägel · Musterstadt</p>
          <h1 className={cx(M.display, "mt-5 text-[clamp(2.75rem,10cqi,5.5rem)] leading-[0.92]")}>
            Eine Stunde,
            <br />
            die <em className="text-[#a8475d]">dir gehört.</em>
          </h1>
          <p className={cx("mt-5 max-w-md text-[17px] leading-snug", M.soft)}>Gesicht, Nägel, Wimpern. Such dir deine Behandlung aus und buch den Termin selbst – auch abends um zehn.</p>
          <a href="#malou-behandlung" className={cx(M.btn, "mt-7 bg-[#a8475d] text-white hover:brightness-95")}>
            Termin buchen <ArrowDown className="size-4" aria-hidden />
          </a>
        </div>
        <div className="relative hidden h-72 overflow-hidden rounded-t-full bg-[#f4e1e3] @dmd:block" aria-hidden>
          <span className="absolute inset-x-8 top-10 bottom-0 rounded-t-full bg-[#e9c7cc]" />
          <span className="absolute inset-x-20 top-24 bottom-0 rounded-t-full bg-[#a8475d]" />
        </div>
      </section>
      <dl className={cx(M.wrap, "grid grid-cols-3 gap-4 border-y border-[#e8dcd3] py-5")}>
        {[
          ["4,9", "von 5 · 187 Stimmen"],
          ["3", "Plätze, ein Team"],
          ["24/7", "online buchbar"],
        ].map(([v, l]) => (
          <div key={l}>
            <dd className={cx(M.display, "num text-[1.9rem] leading-none @dsm:text-[2.4rem]")}>{v}</dd>
            <dt className={cx("mt-2 text-[12.5px] leading-snug", M.soft)}>{l}</dt>
          </div>
        ))}
      </dl>

      <div className={cx(M.wrap, "grid gap-10 py-10 @dlg:grid-cols-[minmax(0,1fr)_20rem] @dlg:gap-14 @dlg:py-16")}>
        <div className="min-w-0 space-y-12">
          <section id="malou-behandlung" data-tour="services" className="scroll-mt-[calc(var(--bar-h)+4.5rem)]">
            {head(1, "Behandlung")}
            <div className="no-bar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 @dsm:mx-0 @dsm:flex-wrap @dsm:px-0">
              {CATS.map((c) => (
                <button key={c.id} type="button" aria-pressed={cat === c.id} onClick={() => setCat(c.id)} className={cx("min-h-11 shrink-0 rounded-full px-5 text-[14.5px] font-semibold", pill(cat === c.id))}>
                  {c.id}
                </button>
              ))}
            </div>
            <p className={cx("mt-3 text-[13.5px]", M.soft)}>{CATS.find((c) => c.id === cat)!.note}</p>
            <ul className="mt-4 space-y-2">
              {TREATS.filter((x) => x.cat === cat).map((x) => {
                const on = picked === x.id;
                return (
                  <li key={x.id}>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setPicked(on ? "" : x.id);
                        setSlot(null);
                      }}
                      className={cx("flex min-h-[4.5rem] w-full items-center gap-4 rounded-[1.25rem] border px-4 py-3 text-left transition-colors", on ? "border-[#a8475d] bg-[#f4e1e3]" : "border-[#e8dcd3] bg-white hover:border-[#a8475d]")}
                    >
                      <span className={cx("grid size-6 shrink-0 place-items-center rounded-full border", on ? "border-[#a8475d] bg-[#a8475d] text-white" : "border-[#bfaea5]")} aria-hidden>
                        {on && <Check className="size-3.5" strokeWidth={3} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[16px] leading-tight font-semibold">{x.name}</span>
                        <span className={cx("num mt-1 block text-[13px]", M.soft)}>
                          {dur(x.min)}
                          {x.note ? ` · ${x.note}` : ""}
                        </span>
                      </span>
                      <span className={cx(M.display, "num shrink-0 text-[1.35rem] leading-none")}>{eur0(x.price)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section data-tour="slots" className={locked(!t)} inert={!t}>
            {head(2, "Tag und Uhrzeit", t && p ? `${p.name} · ${dur(t.min)}` : "Erst Behandlung wählen")}
            <div className="no-bar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 @dsm:mx-0 @dsm:px-0">
              {Array.from({ length: DAYS }, (_, i) => {
                const d = workday(i);
                return (
                  <button
                    key={i}
                    type="button"
                    aria-pressed={dayIdx === i}
                    onClick={() => {
                      setDayIdx(i);
                      setSlot(null);
                    }}
                    className={cx("min-h-[4.5rem] w-[4.5rem] shrink-0 rounded-2xl text-center", pill(dayIdx === i))}
                  >
                    <span className={cx("block text-[12px] font-semibold", dayIdx === i ? "text-white/80" : M.soft)}>{d.toDateString() === new Date().toDateString() ? "Heute" : weekdayShort(d)}</span>
                    <span className={cx(M.display, "num mt-1 block text-[1.5rem] leading-none")}>{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            {t &&
              (slots.length ? (
                <div className="mt-5 grid grid-cols-4 gap-2 @dsm:grid-cols-6 @dmd:grid-cols-8">
                  {slots.map((s) => (
                    <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cx("num min-h-11 rounded-full text-[14px] font-semibold", pill(slot === s))}>
                      {hm(s)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className={cx("mt-5 rounded-2xl border border-dashed border-[#cdbfb5] px-5 py-6 text-[14px]", M.soft)}>An diesem Tag ist der Platz „{p!.name}“ ausgebucht. Wähl einen anderen Tag.</p>
              ))}
          </section>

          <section className={locked(slot === null)} inert={slot === null}>
            {head(3, "Deine Angaben", slot === null ? "Erst Uhrzeit wählen" : undefined)}
            <form
              noValidate
              className="mt-6 grid gap-4 @dsm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!t || !p || slot === null || bad.name || bad.phone || !once()) return;
                onBook({ place: p.id, day: dayIdx, start: slot, treat: t.id, customer: name.trim() });
                setDone({ day: dayIdx, start: slot });
                toTop();
              }}
            >
              <Field label="Name" error={tried && bad.name && "Bitte trag deinen Namen ein."}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={tried && bad.name} className={fieldCls} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Handynummer" error={tried && bad.phone && "Bitte gib deine Handynummer an."}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={24} aria-invalid={tried && bad.phone} className={fieldCls} placeholder="0151 2345678" />
              </Field>
              <p className="flex items-start gap-3 rounded-2xl bg-[#f4e1e3] px-4 py-3 text-[14px] leading-snug @dsm:col-span-2">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#a8475d]" aria-hidden />
                <span>
                  <strong className="font-semibold">Anzahlung {eur0(DEPOSIT)}.</strong> Sie wird mit der Behandlung verrechnet. Absagen bis 24 Stunden vorher sind kostenlos – danach behalten wir die Anzahlung ein.
                </span>
              </p>
              <div className="@dsm:col-span-2">
                <button type="submit" className={cx(M.btn, "w-full bg-[#a8475d] text-white hover:brightness-95 @dsm:w-auto")}>
                  Termin buchen und {eur0(DEPOSIT)} anzahlen
                </button>
                <p className={cx("mt-3 text-[12.5px]", M.soft)}>Demo: Es wird nichts gebucht, gespeichert oder abgebucht – erfundene Angaben genügen.</p>
              </div>
            </form>
          </section>
        </div>

        <aside className="@max-dlg:hidden">
          <div className={cx(M.card, "sticky top-[calc(var(--bar-h)+4.5rem)] p-6")}>
            <h2 className={cx(M.label, M.soft)}>Dein Termin</h2>
            {t && p ? (
              <>
                <p className={cx(M.display, "mt-4 text-[1.5rem] leading-tight")}>{t.name}</p>
                <dl className="num mt-4 space-y-2 border-t border-[#e8dcd3] pt-4 text-[14px]">
                  {[
                    ["Dauer", dur(t.min)],
                    ["Platz", `${p.name} · ${p.who.split(" ")[0]}`],
                    ["Wann", slot !== null ? `${fmtDay(workday(dayIdx))}, ${hm(slot)}` : "noch offen"],
                    ["Anzahlung", eur0(DEPOSIT)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className={M.soft}>{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-end justify-between gap-3 border-t border-[#e8dcd3] pt-4">
                    <dt className={M.soft}>Preis</dt>
                    <dd className={cx(M.display, "text-[2rem] leading-none")}>{eur0(t.price)}</dd>
                  </div>
                </dl>
              </>
            ) : (
              <p className={cx("mt-4 text-[14.5px] leading-relaxed", M.soft)}>Wähl eine Behandlung – wir zeigen dir nur Zeiten, in denen der passende Platz wirklich frei ist.</p>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function Mine({ appts, onPatch, onRebook }: { appts: Appt[]; onPatch: (id: number, c: Partial<Appt> | null) => void; onRebook: (id: string) => void }) {
  const { toast } = useDemo();
  const mine = appts.filter((a) => a.own).sort((a, b) => a.day - b.day || a.start - b.start);
  const stamps = 7;
  return (
    <div className={cx(M.wrap, "grid gap-6 py-8 @dlg:grid-cols-[minmax(0,1fr)_22rem] @dlg:py-14")}>
      <div className="min-w-0">
        <p className={cx(M.label, "text-[#a8475d]")}>Hallo Lena</p>
        <h1 className={cx(M.display, "mt-4 text-[clamp(2.25rem,8cqi,3.5rem)] leading-[0.95]")}>Deine Termine</h1>
        <ul className="mt-6 space-y-3">
          {mine.map((a) => {
            const t = treat(a.treat);
            return (
              <li key={a.id} className={cx(M.card, "flex flex-wrap items-center gap-x-5 gap-y-3 p-5")}>
                <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#f4e1e3] text-center">
                  <span>
                    <span className={cx("block text-[11.5px] font-semibold", M.soft)}>{weekdayShort(workday(a.day))}</span>
                    <span className={cx(M.display, "num block text-[1.5rem] leading-none")}>{workday(a.day).getDate()}</span>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[16px] leading-tight font-semibold">{t.name}</p>
                  <p className={cx("num mt-1 text-[13.5px]", M.soft)}>
                    {hm(a.start)} Uhr · {dur(t.min)} · {place(a.place).name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onPatch(a.id, null);
                    toast("Termin abgesagt – der Platz ist sofort wieder buchbar, die Anzahlung geht zurück.");
                  }}
                  className="min-h-11 rounded-full border border-[#cdbfb5] px-4 text-[13.5px] font-semibold hover:border-[#2c2125]"
                >
                  Absagen
                </button>
              </li>
            );
          })}
          {mine.length === 0 && <li className={cx("rounded-[1.5rem] border border-dashed border-[#cdbfb5] px-5 py-8 text-center text-[14.5px]", M.soft)}>Kein Termin geplant. Zeit für den nächsten?</li>}
        </ul>
        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[1.5rem] bg-[#2c2125] p-5 text-white" data-tour="karte">
          <BellRing className="size-6 shrink-0 text-[#f0b9c2]" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[16px] leading-tight font-semibold">Auffüllen in etwa vier Wochen fällig</p>
            <p className="mt-1 text-[13.5px] text-white/75">Wir erinnern dich rechtzeitig – oder du sicherst dir den Termin gleich.</p>
          </div>
          <button type="button" onClick={() => onRebook("n-auf")} className={cx(M.btn, "min-h-11 bg-white px-5 text-[14px] text-[#2c2125] hover:brightness-95")}>
            Folgetermin buchen
          </button>
        </div>
      </div>
      <aside className="space-y-4">
        <div className={cx(M.card, "p-5")}>
          <h2 className={cx(M.label, M.soft)}>Treuekarte</h2>
          <p className={cx(M.display, "mt-3 text-[1.5rem] leading-tight")}>Noch drei Besuche bis zur Gratis-Maniküre</p>
          <ol className="mt-4 grid grid-cols-5 gap-2" aria-label={`${stamps} von 10 Stempeln`}>
            {Array.from({ length: 10 }, (_, i) => (
              <li key={i} className={cx("grid aspect-square place-items-center rounded-full border", i < stamps ? "border-[#a8475d] bg-[#a8475d] text-white" : "border-dashed border-[#cdbfb5]")}>
                {i < stamps && <Check className="size-4" strokeWidth={3} aria-hidden />}
              </li>
            ))}
          </ol>
        </div>
        <div className={cx(M.card, "p-5")}>
          <h2 className={cx(M.label, M.soft)}>Gutschein-Guthaben</h2>
          <p className={cx(M.display, "num mt-3 text-[2.25rem] leading-none")}>25 €</p>
          <p className={cx("mt-2 text-[13.5px]", M.soft)}>Wird beim nächsten Besuch automatisch angerechnet.</p>
        </div>
      </aside>
    </div>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

const CAT_STYLE: Record<Cat, string> = {
  Gesicht: "border-l-[#a8475d] bg-[#f8e9ec]",
  Nägel: "border-l-[#b0762c] bg-[#f9f0e2]",
  "Wimpern & Brauen": "border-l-[#3d6a9c] bg-[#eaf1f8]",
  Haarentfernung: "border-l-[#4d7d5c] bg-[#eaf3ed]",
};

function Dashboard({ appts, onPatch }: { appts: Appt[]; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { kalender: "Kalender", kunden: "Kundinnen", zahlen: "Auswertung" };
  return (
    <Backoffice
      user="Elif Demir"
      role="Inhaberin"
      title={titles[tab] ?? "Kalender"}
      nav={[
        { id: "kalender", label: "Kalender", icon: CalendarDays, count: appts.filter((a) => a.own && a.id !== 900).length },
        { id: "kunden", label: "Kundinnen", icon: Users, count: CLIENTS.filter((c) => c.due !== null && c.due < 0).length },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "kunden" ? <Clients /> : tab === "zahlen" ? <Numbers appts={appts} /> : <Calendar appts={appts} onPatch={onPatch} />}
    </Backoffice>
  );
}

function Calendar({ appts, onPatch }: { appts: Appt[]; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const { toast } = useDemo();
  const firstOwn = appts.find((a) => a.own && a.id !== 900);
  const [dayIdx, setDayIdx] = useState(firstOwn?.day ?? 0);
  const [openId, setOpenId] = useState<number | null>(null);
  const list = appts.filter((a) => a.day === dayIdx);
  const open = appts.find((a) => a.id === openId);
  const sum = list.reduce((s, a) => s + (a.status === "noshow" ? 0 : treat(a.treat).price), 0);
  return (
    <>
      <Panel
        flush
        tour="kalender"
        title={fmtDayLong(workday(dayIdx))}
        aside={
          <>
            <span className="num hidden @dsm:inline">
              {list.length} Termine · {eur0(sum)}
            </span>
            <Btn size="sm" disabled={dayIdx === 0} onClick={() => setDayIdx((d) => d - 1)} aria-label="Vorheriger Tag">
              <ChevronLeft className="size-4" aria-hidden />
            </Btn>
            <Btn size="sm" onClick={() => setDayIdx(0)}>
              Heute
            </Btn>
            <Btn size="sm" disabled={dayIdx === DAYS - 1} onClick={() => setDayIdx((d) => d + 1)} aria-label="Nächster Tag">
              <ChevronRight className="size-4" aria-hidden />
            </Btn>
          </>
        }
      >
        <DayGrid
          open={OPEN}
          close={CLOSE}
          cols={PLACES.map((p) => ({ id: p.id, title: p.name, sub: `${p.who} · ${list.filter((a) => a.place === p.id).length} Termine` }))}
          blocks={PLACES.map((p) => ({ col: p.id, from: p.pause[0], to: p.pause[1], label: "Pause" }))}
          items={list.map((a) => ({ id: a.id, col: a.place, start: a.start, min: treat(a.treat).min, title: a.customer, sub: treat(a.treat).name, tone: CAT_STYLE[treat(a.treat).cat], own: a.own && a.id !== 900, off: a.status === "noshow" }))}
          onPick={setOpenId}
        />
      </Panel>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-bo-muted">
        {CATS.map((c) => (
          <span key={c.id} className="inline-flex items-center gap-1.5">
            <span className={cx("h-3 w-1 rounded-full border-l-[3px]", CAT_STYLE[c.id])} aria-hidden /> {c.id}
          </span>
        ))}
      </p>
      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? `${open.customer} · ${hm(open.start)} Uhr` : ""}
        footer={
          open && (
            <>
              <Btn
                variant="danger"
                onClick={() => {
                  onPatch(open.id, { status: "noshow" });
                  setOpenId(null);
                  toast(open.deposit ? `Als nicht erschienen vermerkt – ${eur0(DEPOSIT)} Anzahlung einbehalten.` : "Als nicht erschienen vermerkt.");
                }}
              >
                Nicht erschienen
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  onPatch(open.id, { status: "da" });
                  setOpenId(null);
                  toast(`${open.customer.split(" ")[0]} ist eingecheckt.`);
                }}
              >
                Ist da
              </Btn>
            </>
          )
        }
      >
        {open && (
          <dl className="space-y-2.5 text-[14px]">
            {[
              ["Behandlung", treat(open.treat).name],
              ["Dauer", dur(treat(open.treat).min)],
              ["Platz", `${place(open.place).name} · ${place(open.place).who}`],
              ["Preis", eur0(treat(open.treat).price)],
            ].map(([k, v]) => (
              <div key={k} className="num flex justify-between gap-4">
                <dt className="text-bo-muted">{k}</dt>
                <dd className="text-right text-bo-ink">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-bo-muted">Anzahlung</dt>
              <dd>{open.deposit ? <Tag tone="ok">{eur0(DEPOSIT)} hinterlegt</Tag> : <Tag tone="warn">keine – am Telefon gebucht</Tag>}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-bo-muted">Stand</dt>
              <dd>{open.status === "da" ? <Tag tone="ok">ist da</Tag> : open.status === "noshow" ? <Tag tone="bad">nicht erschienen</Tag> : <Tag tone="info">bestätigt</Tag>}</dd>
            </div>
          </dl>
        )}
      </Sheet>
    </>
  );
}

function Clients() {
  const { toast } = useDemo();
  const [sel, setSel] = useState(CLIENTS[1].name);
  const [sent, setSent] = useState<string[]>([]);
  const c = CLIENTS.find((x) => x.name === sel)!;
  const dueTag = (x: Client) => (x.due === null ? <Tag>kein Rhythmus</Tag> : x.booked ? <Tag tone="ok">gebucht</Tag> : x.due < 0 ? <Tag tone="bad">{-x.due} Tage überfällig</Tag> : x.due <= 7 ? <Tag tone="warn">in {x.due} Tagen fällig</Tag> : <Tag>in {x.due} Tagen</Tag>);
  return (
    <div className="grid gap-4 @dlg:grid-cols-[minmax(0,1fr)_20rem]">
      <Panel flush title="Kundenkartei" aside="sortiert nach fälligem Folgetermin" tour="kunden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-[13.5px]">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Üblich</th>
                <th className={th}>Folgetermin</th>
                <th className={cx(th, "text-right")}>Umsatz</th>
              </tr>
            </thead>
            <tbody>
              {[...CLIENTS]
                .sort((a, b) => (a.booked ? 99 : (a.due ?? 98)) - (b.booked ? 99 : (b.due ?? 98)))
                .map((x) => (
                  <tr key={x.name} className={cx(tr, "cursor-pointer hover:bg-bo-bg/60", sel === x.name && "bg-d-soft")} onClick={() => setSel(x.name)}>
                    <td className={td}>
                      <button type="button" className="flex items-center gap-2.5 text-left font-medium text-bo-ink" aria-pressed={sel === x.name}>
                        <Avatar name={x.name} size="sm" /> {x.name}
                      </button>
                    </td>
                    <td className={td}>{x.usual}</td>
                    <td className={td}>{sent.includes(x.name) ? <Tag tone="info">erinnert</Tag> : dueTag(x)}</td>
                    <td className={cx(td, "num text-right text-bo-ink")}>{eur0(x.spent)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={c.name}>
        <dl className="space-y-2 text-[13.5px]">
          {[
            ["Telefon", c.phone],
            ["Besuche", String(c.visits)],
            ["Ø je Besuch", eur0(c.spent / c.visits)],
          ].map(([k, v]) => (
            <div key={k} className="num flex justify-between">
              <dt className="text-bo-muted">{k}</dt>
              <dd className="text-bo-ink">{v}</dd>
            </div>
          ))}
        </dl>
        <h3 className="mt-4 text-[12px] font-semibold text-bo-ink">Behandlungsnotiz</h3>
        <p className="mt-1 rounded-[min(var(--bo-rc),10px)] bg-[#fbf7e6] px-3 py-2 text-[13.5px] leading-relaxed text-bo-ink">{c.note || "Noch keine Notiz."}</p>
        {c.due !== null && !c.booked && (
          <Btn
            variant="primary"
            className="mt-4 w-full"
            disabled={sent.includes(c.name)}
            onClick={() => {
              setSent((s) => [...s, c.name]);
              toast(`Erinnerung mit Buchungslink an ${c.name.split(" ")[0]} verschickt.`);
            }}
          >
            <BellRing className="size-4" aria-hidden /> {sent.includes(c.name) ? "Erinnerung verschickt" : "An Folgetermin erinnern"}
          </Btn>
        )}
        <p className="mt-2 text-[12px] text-bo-muted">Im Betrieb läuft die Erinnerung automatisch, sobald der übliche Abstand erreicht ist.</p>
      </Panel>
    </div>
  );
}

function Numbers({ appts }: { appts: Appt[] }) {
  const today = appts.filter((a) => a.day === 0);
  const minutes = (list: Appt[]) => list.reduce((s, a) => s + treat(a.treat).min, 0);
  const perPlace = CLOSE - OPEN - 45;
  const week = Array.from({ length: DAYS }, (_, i) => ({ label: weekdayShort(workday(i)), value: appts.filter((a) => a.day === i && a.status !== "noshow").reduce((s, a) => s + treat(a.treat).price, 0) }));
  const byTreat = TREATS.map((t) => ({ label: t.name, value: appts.filter((a) => a.treat === t.id && a.status !== "noshow").length * t.price }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  return (
    <div className="space-y-4">
      <Figures
        tour="zahlen"
        items={[
          { label: "Termine heute", value: today.length, note: `${today.filter((a) => a.deposit).length} mit Anzahlung` },
          { label: "Auslastung heute", value: `${Math.round((minutes(today) / (perPlace * PLACES.length)) * 100)} %`, note: "über alle drei Plätze" },
          { label: "Umsatz diese Woche", value: eur0(week.reduce((s, d) => s + d.value, 0)), note: "gebuchte Termine" },
          { label: "Nicht erschienen", value: "2,4 %", note: "letzte 30 Tage · vor der Anzahlung 9,1 %" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-[1.3fr_1fr]">
        <Panel title="Gebuchter Umsatz je Tag" aside="laufende Woche">
          <Bars label="Gebuchter Umsatz je Tag" data={week} mark={0} format={(n) => `${n} €`} />
        </Panel>
        <Panel title="Auslastung je Platz" aside="heute">
          <Ranks data={PLACES.map((p) => ({ label: `${p.name} · ${p.who.split(" ")[0]}`, value: Math.round((minutes(today.filter((a) => a.place === p.id)) / perPlace) * 100) })).sort((a, b) => b.value - a.value)} format={(n) => `${n} %`} />
          <h3 className="mt-5 mb-2 border-t border-bo-line pt-4 text-[13.5px] font-semibold text-bo-ink">Umsatz je Behandlung</h3>
          <Ranks data={byTreat} format={(n) => eur0(n)} />
        </Panel>
      </div>
    </div>
  );
}
