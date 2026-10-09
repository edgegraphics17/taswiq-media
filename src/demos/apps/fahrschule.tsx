"use client";

import { useMemo, useState } from "react";
import { BellRing, CalendarDays, ChartColumn, Check, ChevronLeft, ChevronRight, CircleDollarSign, GraduationCap, MapPin, Phone, Users } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { DayGrid } from "@/demos/kit/DayGrid";
import { Avatar, Backoffice, Bars, Btn, Figures, Panel, Ranks, Sheet, Tag, td, th, tr } from "@/demos/kit/ui";
import { cx, eur0, fmtDay, fmtDayLong, hm, nowMinutes, useOnce, weekdayShort, workday } from "@/demos/kit/util";

/**
 * Demo "Fahrschule Kompass": Schüler-App (Fahrstunden buchen, Ausbildungsstand, Konto) + Büro mit Fahrlehrer-Plan.
 * Fahrstunden werden gegen den Plan des eigenen Fahrlehrers gebucht und vom Guthaben abgezogen –
 * die Stunde steht sofort im Plan, der Ausbildungsstand zählt mit.
 */

type Kind = "uebung" | "ueberland" | "autobahn" | "nacht" | "pruefung";
const KINDS: Record<Kind, { name: string; min: number; price: number; note: string; tone: string }> = {
  uebung: { name: "Übungsfahrt", min: 90, price: 124, note: "Doppelstunde in der Stadt", tone: "border-l-[#1d4ed8] bg-[#e8eefc]" },
  ueberland: { name: "Überlandfahrt", min: 90, price: 148, note: "Sonderfahrt, Pflicht: 5 Stunden", tone: "border-l-[#4d7d5c] bg-[#eaf3ed]" },
  autobahn: { name: "Autobahnfahrt", min: 90, price: 148, note: "Sonderfahrt, Pflicht: 4 Stunden", tone: "border-l-[#b0762c] bg-[#f9f0e2]" },
  nacht: { name: "Nachtfahrt", min: 90, price: 148, note: "Sonderfahrt, Pflicht: 3 Stunden – ab 17:30 Uhr", tone: "border-l-[#5b3d9c] bg-[#efeaf8]" },
  pruefung: { name: "Praktische Prüfung", min: 60, price: 189, note: "", tone: "border-l-[#b3261e] bg-[#fbe7e5]" },
};
const BOOKABLE: Kind[] = ["uebung", "ueberland", "autobahn", "nacht"];

const TEACHERS = [
  { id: "murat", name: "Murat Aydin", car: "VW Golf · Schaltung", pause: [12 * 60 + 30, 13 * 60 + 15] as [number, number] },
  { id: "kerstin", name: "Kerstin Paul", car: "Tesla Model 3 · Automatik", pause: [13 * 60, 13 * 60 + 45] as [number, number] },
  { id: "jo", name: "Johannes Feld", car: "VW Golf · Schaltung", pause: [12 * 60, 12 * 60 + 45] as [number, number] },
];
const OPEN = 8 * 60;
const CLOSE = 20 * 60;
const DAYS = 6;
/** Demo-Schülerin fährt bei Murat */
const MY_TEACHER = "murat";

interface Lesson {
  id: number;
  teacher: string;
  day: number;
  start: number;
  kind: Kind;
  student: string;
  status: "geplant" | "gefahren" | "ausgefallen";
  own?: boolean;
}

/** Zwei typische Tage je Fahrlehrer: [Beginn, Art, Schüler] */
const PATTERN: Record<string, [number, Kind, string][][]> = {
  murat: [
    [
      [480, "uebung", "Jonas Weber"],
      [810, "ueberland", "Finn Schröder"],
      [915, "uebung", "Mila Novak"],
      [1080, "nacht", "Emil Krüger"],
    ],
    [
      [495, "pruefung", "Hannah Lange"],
      [800, "autobahn", "Aleyna Demir"],
      [990, "uebung", "Noah Schmitt"],
    ],
  ],
  kerstin: [
    [
      [510, "uebung", "Sophie Albrecht"],
      [615, "autobahn", "Ben Yildiz"],
      [840, "uebung", "Lara Hoffmann"],
      [945, "uebung", "Paul Richter"],
      [1065, "nacht", "Sophie Albrecht"],
    ],
    [
      [480, "uebung", "Lara Hoffmann"],
      [585, "uebung", "Mats Engel"],
      [690, "ueberland", "Ben Yildiz"],
      [840, "uebung", "Paul Richter"],
      [960, "uebung", "Zoe Brandt"],
    ],
  ],
  jo: [
    [
      [480, "ueberland", "Leon Vogel"],
      [600, "uebung", "Amelie Sauer"],
      [780, "uebung", "David Kaya"],
      [885, "pruefung", "Leon Vogel"],
      [975, "uebung", "Clara Busch"],
    ],
    [
      [540, "uebung", "David Kaya"],
      [780, "autobahn", "Amelie Sauer"],
      [900, "uebung", "Clara Busch"],
      [1050, "nacht", "David Kaya"],
    ],
  ],
};

function seedLessons(): Lesson[] {
  const now = nowMinutes();
  let id = 1;
  const out: Lesson[] = [];
  for (let day = 0; day < DAYS; day++) {
    for (const t of TEACHERS) {
      for (const [start, kind, student] of PATTERN[t.id][day % 2]) {
        const past = day === 0 && start + KINDS[kind].min < now;
        out.push({ id: id++, teacher: t.id, day, start, kind, student, status: past ? (student === "Mila Novak" ? "ausgefallen" : "gefahren") : "geplant" });
      }
    }
  }
  // Demo-Schülerin: ihre nächste Übungsfahrt am nächsten Werktag
  out.push({ id: 900, teacher: MY_TEACHER, day: 1, start: 15 * 60, kind: "uebung", student: "Lena Hartmann", status: "geplant", own: true });
  return out;
}

const free = (lessons: Lesson[], teacher: string, day: number, start: number, kind: Kind) => {
  const end = start + KINDS[kind].min;
  const t = TEACHERS.find((x) => x.id === teacher)!;
  if (start < OPEN || end > CLOSE) return false;
  if (kind === "nacht" && start < 17 * 60 + 30) return false;
  if (start < t.pause[1] && end > t.pause[0]) return false;
  if (day === 0 && start < nowMinutes() + 120) return false;
  // 15 Minuten Wechselzeit zwischen zwei Schülern
  return !lessons.some((l) => l.teacher === teacher && l.day === day && start < l.start + KINDS[l.kind].min + 15 && end + 15 > l.start);
};

/** Stand der Demo-Schülerin vor dem, was sie in der Demo selbst bucht */
const BASE = { theory: 9, uebung: 11, ueberland: 3, autobahn: 2, nacht: 0 };
const NEED = { theory: 14, ueberland: 5, autobahn: 4, nacht: 3 };

export default function FahrschuleDemo() {
  const { view } = useDemo();
  const [lessons, setLessons] = useState<Lesson[]>(seedLessons);
  const [balance, setBalance] = useState(372);
  const book = (l: Pick<Lesson, "day" | "start" | "kind">) => {
    setLessons((p) => [...p, { ...l, id: Date.now(), teacher: MY_TEACHER, student: "Lena Hartmann", status: "geplant", own: true }]);
    setBalance((b) => b - KINDS[l.kind].price);
  };
  const cancel = (id: number) => {
    const l = lessons.find((x) => x.id === id);
    if (!l) return;
    setLessons((p) => p.filter((x) => x.id !== id));
    setBalance((b) => b + KINDS[l.kind].price);
  };
  const patch = (id: number, status: Lesson["status"]) => setLessons((p) => p.map((l) => (l.id === id ? { ...l, status } : l)));
  return view === "kunde" ? <StudentApp lessons={lessons} balance={balance} onBook={book} onCancel={cancel} onTopUp={(n) => setBalance((b) => b + n)} /> : <Office lessons={lessons} onPatch={patch} />;
}

/* ───────────────────────────── Schüler-App ─────────────────────────────
   Gestaltung „Kompass": klares Blau auf Weiß, Gelb nur als Signal (wie das Fahrschul-Schild), Archivo.
   Gedacht fürs Handy: große Tippflächen, eine Aufgabe je Bildschirm. */

const F = {
  wrap: "mx-auto w-full max-w-[64rem] px-4 @dsm:px-6 @dlg:px-8",
  label: "text-[11px] leading-none font-bold tracking-[0.14em] uppercase",
  display: "font-d-display font-extrabold tracking-[-0.03em]",
  dim: "text-[#55607a]",
  card: "rounded-2xl border border-[#d8dfec] bg-white",
  btn: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold transition-[filter,background-color] active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
};

type AppProps = { lessons: Lesson[]; balance: number; onBook: (l: Pick<Lesson, "day" | "start" | "kind">) => void; onCancel: (id: number) => void; onTopUp: (n: number) => void };

function StudentApp(props: AppProps) {
  const { tab, setTab } = useDemo();
  return (
    <div className="min-h-[var(--app-h)] bg-[#f1f4fa] font-plex text-[15px] leading-[1.55] text-[#0f1b3d]">
      <header className="on-dark sticky top-[var(--bar-h)] z-20 bg-[#0f1b3d] text-white">
        <div className={cx(F.wrap, "flex items-center justify-between gap-4")}>
          <p className="flex items-center gap-2.5 py-3">
            <span className={cx(F.display, "grid size-8 place-items-center rounded-lg bg-[#ffd43b] text-[1.1rem] leading-none text-[#0f1b3d]")} aria-hidden>
              K
            </span>
            <span className={cx(F.display, "text-[1.1rem] leading-none")}>
              <span className="@max-dsm:hidden">Fahrschule </span>Kompass
            </span>
          </p>
          <nav aria-label="Schülerbereich" className="flex gap-1">
            {[
              { id: "stunden", label: "Fahrstunden" },
              { id: "stand", label: "Mein Stand" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-11 rounded-lg px-3 text-[14px] font-semibold whitespace-nowrap transition-colors", tab === n.id ? "bg-white text-[#0f1b3d]" : "text-white/75 hover:bg-white/10 hover:text-white")}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "stand" ? <Progress {...props} /> : <Lessons {...props} />}
      <footer className="border-t border-[#d8dfec]">
        <div className={cx(F.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[13.5px]", F.dim)}>
          <span className={cx(F.display, "text-[1rem] text-[#0f1b3d]")}>Fahrschule Kompass</span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" aria-hidden /> Ringstraße 48, Musterstadt
          </span>
          <span className="num inline-flex items-center gap-2">
            <Phone className="size-4" aria-hidden /> Büro: Mo – Fr, 15:00 – 18:30
          </span>
        </div>
      </footer>
    </div>
  );
}

function Lessons({ lessons, balance, onBook, onCancel }: AppProps) {
  const { go, setTab, toast, toTop } = useDemo();
  const [kind, setKind] = useState<Kind>("uebung");
  const [dayIdx, setDayIdx] = useState(1);
  const [slot, setSlot] = useState<number | null>(null);
  const [done, setDone] = useState<{ day: number; start: number; kind: Kind } | null>(null);
  const once = useOnce();
  const teacher = TEACHERS.find((t) => t.id === MY_TEACHER)!;
  const k = KINDS[kind];
  const slots = useMemo(() => {
    const out: number[] = [];
    for (let s = OPEN; s + KINDS[kind].min <= CLOSE; s += 15) if (free(lessons, MY_TEACHER, dayIdx, s, kind)) out.push(s);
    // Nur sinnvolle Startzeiten anbieten: jede halbe Stunde
    return out.filter((s) => s % 30 === 0);
  }, [lessons, dayIdx, kind]);
  const mine = lessons.filter((l) => l.own && l.status === "geplant").sort((a, b) => a.day - b.day || a.start - b.start);
  const pill = (on: boolean) => cx("border transition-colors", on ? "border-[#1d4ed8] bg-[#1d4ed8] text-white" : "border-[#cdd6e6] bg-white text-[#0f1b3d] hover:border-[#1d4ed8]");

  if (done) {
    return (
      <div className={cx(F.wrap, "py-10 @dlg:py-16")}>
        <div className="mx-auto max-w-xl">
          <p className={cx(F.label, "text-[#1d4ed8]")}>Gebucht</p>
          <h1 className={cx(F.display, "mt-4 text-[clamp(2.25rem,9cqi,4rem)] leading-[0.95]")}>Deine Fahrstunde steht.</h1>
          <div className={cx(F.card, "mt-7 p-6")}>
            <p className={cx(F.label, F.dim)}>{fmtDayLong(workday(done.day))}</p>
            <p className={cx(F.display, "num mt-2 text-[3.25rem] leading-none")}>{hm(done.start)}</p>
            <p className="num mt-3">
              {KINDS[done.kind].name} · {KINDS[done.kind].min} Minuten · mit {teacher.name}
            </p>
            <p className={cx("num mt-4 border-t border-dashed border-[#cdd6e6] pt-4 text-[14px]", F.dim)}>
              {eur0(KINDS[done.kind].price)} vom Guthaben abgezogen · Treffpunkt: Fahrschule, Ringstraße 48 · {teacher.car}
            </p>
          </div>
          <div className="mt-5 rounded-2xl bg-[#ffd43b] p-5 text-[14.5px] leading-snug text-[#0f1b3d]">
            <strong className="font-bold">So sieht es das Büro:</strong> Die Stunde steht im Plan von {teacher.name.split(" ")[0]}, bezahlt ist sie auch schon – niemand muss nachtelefonieren.
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("betrieb", "plan")} className={cx(F.btn, "bg-[#0f1b3d] text-white hover:brightness-125")}>
                Im Fahrlehrer-Plan ansehen
              </button>
              <button type="button" onClick={() => (setDone(null), setSlot(null))} className={cx(F.btn, "border border-[#0f1b3d] hover:bg-[#ffe27a]")}>
                Weitere Stunde buchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cx(F.wrap, "grid gap-6 py-7 @dlg:grid-cols-[minmax(0,1fr)_20rem] @dlg:py-12")}>
      <div className="min-w-0 space-y-6">
        <div>
          <p className={cx(F.label, "text-[#1d4ed8]")}>Hallo Lena · Klasse B</p>
          <h1 className={cx(F.display, "mt-3 text-[clamp(2.25rem,9cqi,4rem)] leading-[0.95]")}>Nächste Fahrstunde buchen</h1>
        </div>
        <section className={cx(F.card, "p-5")} data-tour="buchen">
          <h2 className="text-[16px] font-bold">1 · Was möchtest du fahren?</h2>
          <div className="mt-3 grid gap-2 @dsm:grid-cols-2">
            {BOOKABLE.map((id) => {
              const x = KINDS[id];
              const on = kind === id;
              const have = id === "uebung" ? null : BASE[id as "ueberland" | "autobahn" | "nacht"];
              return (
                <button key={id} type="button" aria-pressed={on} onClick={() => (setKind(id), setSlot(null))} className={cx("flex min-h-[4.75rem] items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors", on ? "border-[#1d4ed8] bg-[#e8eefc]" : "border-[#d8dfec] hover:border-[#1d4ed8]")}>
                  <span className={cx("grid size-6 shrink-0 place-items-center rounded-full border", on ? "border-[#1d4ed8] bg-[#1d4ed8] text-white" : "border-[#aab4c8]")} aria-hidden>
                    {on && <Check className="size-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15.5px] leading-tight font-semibold">{x.name}</span>
                    <span className={cx("num mt-1 block text-[12.5px]", F.dim)}>{have === null ? x.note : `${have} von ${NEED[id as "ueberland" | "autobahn" | "nacht"]} Stunden gefahren`}</span>
                  </span>
                  <span className="num shrink-0 text-[15px] font-bold">{eur0(x.price)}</span>
                </button>
              );
            })}
          </div>
          <h2 className="mt-6 text-[16px] font-bold">2 · Wann?</h2>
          <div className="no-bar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5">
            {Array.from({ length: DAYS }, (_, i) => {
              const d = workday(i);
              return (
                <button key={i} type="button" aria-pressed={dayIdx === i} onClick={() => (setDayIdx(i), setSlot(null))} className={cx("min-h-[4.25rem] w-[4.25rem] shrink-0 rounded-xl text-center", pill(dayIdx === i))}>
                  <span className={cx("block text-[12px] font-semibold", dayIdx === i ? "text-white/80" : F.dim)}>{d.toDateString() === new Date().toDateString() ? "Heute" : weekdayShort(d)}</span>
                  <span className={cx(F.display, "num mt-0.5 block text-[1.4rem] leading-none")}>{d.getDate()}</span>
                </button>
              );
            })}
          </div>
          {slots.length ? (
            <div className="mt-4 grid grid-cols-4 gap-2 @dsm:grid-cols-6">
              {slots.map((s) => (
                <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cx("num min-h-11 rounded-xl text-[14px] font-semibold", pill(slot === s))}>
                  {hm(s)}
                </button>
              ))}
            </div>
          ) : (
            <p className={cx("mt-4 rounded-xl border border-dashed border-[#aab4c8] px-4 py-5 text-[14px]", F.dim)}>
              An diesem Tag hat {teacher.name.split(" ")[0]} für eine {k.name} nichts mehr frei. Wähl einen anderen Tag.
            </p>
          )}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#d8dfec] pt-4">
            <p className={cx("num text-[13.5px]", F.dim)}>
              {slot !== null ? (
                <>
                  <strong className="font-semibold text-[#0f1b3d]">
                    {fmtDay(workday(dayIdx))}, {hm(slot)}–{hm(slot + k.min)}
                  </strong>{" "}
                  · {eur0(k.price)} vom Guthaben
                </>
              ) : (
                "Wähl eine Uhrzeit."
              )}
            </p>
            {balance < k.price ? (
              <button type="button" onClick={() => setTab("stand")} className={cx(F.btn, "border border-[#1d4ed8] text-[#1d4ed8] hover:bg-[#e8eefc]")}>
                Erst Guthaben aufladen
              </button>
            ) : (
              <button
                type="button"
                disabled={slot === null}
                onClick={() => {
                  if (slot === null || !once()) return;
                  onBook({ day: dayIdx, start: slot, kind });
                  setDone({ day: dayIdx, start: slot, kind });
                  toTop();
                }}
                className={cx(F.btn, "bg-[#1d4ed8] text-white hover:brightness-110")}
              >
                Fahrstunde buchen
              </button>
            )}
          </div>
          <p className={cx("mt-3 text-[12px]", F.dim)}>Demo: Es wird nichts gebucht oder abgebucht.</p>
        </section>
      </div>

      <aside className="space-y-4">
        <section className={cx(F.card, "p-5")}>
          <h2 className={cx(F.label, F.dim)}>Dein Fahrlehrer</h2>
          <p className="mt-3 flex items-center gap-3">
            <Avatar name={teacher.name} />
            <span>
              <span className="block text-[15.5px] leading-tight font-semibold">{teacher.name}</span>
              <span className={cx("block text-[13px]", F.dim)}>{teacher.car}</span>
            </span>
          </p>
        </section>
        <section className={cx(F.card, "p-5")}>
          <h2 className={cx(F.label, F.dim)}>Geplante Stunden</h2>
          <ul className="mt-3 space-y-2.5">
            {mine.map((l) => (
              <li key={l.id} className="flex items-center gap-3">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#e8eefc] text-center leading-none">
                  <span>
                    <span className={cx("block text-[10.5px] font-semibold", F.dim)}>{weekdayShort(workday(l.day))}</span>
                    <span className={cx(F.display, "num mt-0.5 block text-[1.15rem]")}>{workday(l.day).getDate()}</span>
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px] leading-tight font-semibold">{KINDS[l.kind].name}</span>
                  <span className={cx("num block text-[12.5px]", F.dim)}>
                    {hm(l.start)}–{hm(l.start + KINDS[l.kind].min)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onCancel(l.id);
                    toast("Stunde abgesagt – das Guthaben ist zurück, der Platz geht an die Nachrücker.");
                  }}
                  className="min-h-11 rounded-lg px-2.5 text-[13px] font-semibold text-[#1d4ed8] hover:bg-[#e8eefc]"
                >
                  Absagen
                </button>
              </li>
            ))}
            {mine.length === 0 && <li className={cx("text-[14px]", F.dim)}>Noch nichts geplant.</li>}
          </ul>
          <p className={cx("mt-3 border-t border-[#d8dfec] pt-3 text-[12.5px]", F.dim)}>Absagen bis 48 Stunden vorher kostenlos.</p>
        </section>
      </aside>
    </div>
  );
}

function Meter({ label, have, need, unit = "Stunden" }: { label: string; have: number; need: number; unit?: string }) {
  const done = have >= need;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3 text-[14.5px]">
        <span className="font-semibold">{label}</span>
        <span className={cx("num", done ? "font-semibold text-[#17794a]" : F.dim)}>
          {have} von {need} {unit}
        </span>
      </div>
      <div className="mt-1.5 h-2 rounded-full bg-[#e3e8f2]" role="img" aria-label={`${label}: ${have} von ${need}`}>
        <div className={cx("h-full rounded-full", done ? "bg-[#17794a]" : "bg-[#1d4ed8]")} style={{ width: `${Math.min(100, (have / need) * 100)}%` }} />
      </div>
    </div>
  );
}

function Progress({ lessons, balance, onTopUp }: AppProps) {
  const { toast } = useDemo();
  const planned = lessons.filter((l) => l.own && l.kind === "uebung" && l.status === "geplant").length;
  const special = BASE.ueberland + BASE.autobahn + BASE.nacht;
  return (
    <div className={cx(F.wrap, "grid gap-6 py-7 @dlg:grid-cols-[minmax(0,1fr)_20rem] @dlg:py-12")}>
      <div className="min-w-0 space-y-6">
        <div>
          <p className={cx(F.label, "text-[#1d4ed8]")}>Klasse B · seit 9 Wochen dabei</p>
          <h1 className={cx(F.display, "mt-3 text-[clamp(2.25rem,9cqi,4rem)] leading-[0.95]")}>Dein Weg zum Führerschein</h1>
        </div>
        <section className={cx(F.card, "space-y-5 p-5")} data-tour="stand">
          <Meter label="Theorie-Unterricht" have={BASE.theory} need={NEED.theory} unit="Lektionen" />
          <Meter label="Überlandfahrten" have={BASE.ueberland} need={NEED.ueberland} />
          <Meter label="Autobahnfahrten" have={BASE.autobahn} need={NEED.autobahn} />
          <Meter label="Nachtfahrten" have={BASE.nacht} need={NEED.nacht} />
          <div className="flex items-baseline justify-between gap-3 border-t border-[#d8dfec] pt-4 text-[14.5px]">
            <span className="font-semibold">Übungsfahrten</span>
            <span className={cx("num", F.dim)}>
              {BASE.uebung} gefahren{planned ? ` · ${planned} geplant` : ""}
            </span>
          </div>
        </section>
        <section className="on-dark rounded-2xl bg-[#0f1b3d] p-5 text-white">
          <h2 className={cx(F.label, "text-[#ffd43b]")}>Einschätzung von Murat</h2>
          <p className={cx(F.display, "mt-3 text-[1.5rem] leading-tight text-white")}>Noch {12 - special} Sonderfahrten und fünf Theorie-Lektionen bis zur Prüfungsanmeldung.</p>
          <p className="mt-2 text-[14px] text-white/75">Einparken sitzt, Spurwechsel auf der Autobahn üben wir noch. Nächste Theorie: Dienstag und Donnerstag, 18:30 Uhr.</p>
        </section>
      </div>
      <aside className="space-y-4">
        <section className={cx(F.card, "p-5")}>
          <h2 className={cx(F.label, F.dim)}>Guthaben</h2>
          <p className={cx(F.display, "num mt-2 text-[2.75rem] leading-none", balance < 124 && "text-[#b3261e]")}>{eur0(balance)}</p>
          <p className={cx("num mt-2 text-[13px]", F.dim)}>Reicht für {Math.floor(balance / 124)} Übungsfahrten.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[250, 500].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  onTopUp(n);
                  toast(`${eur0(n)} aufgeladen – im Büro ist die Zahlung sofort verbucht.`);
                }}
                className="num min-h-11 rounded-xl border border-[#cdd6e6] text-[14.5px] font-bold hover:border-[#1d4ed8]"
              >
                + {eur0(n)}
              </button>
            ))}
          </div>
        </section>
        <section className={cx(F.card, "p-5")}>
          <h2 className={cx(F.label, F.dim)}>Zahlungen</h2>
          <ul className="num mt-3 divide-y divide-[#e3e8f2] text-[14px]">
            {[
              ["Grundbetrag", "bezahlt", 449],
              ["Lehrmaterial und App", "bezahlt", 89],
              ["Guthaben aufgeladen", "vor 12 Tagen", 500],
              ["Vorstellung Theorieprüfung", "offen", 75],
            ].map(([w, s, p]) => (
              <li key={w as string} className="flex items-baseline justify-between gap-3 py-2">
                <span className="min-w-0">
                  {w} <span className={cx("block text-[12px]", s === "offen" ? "font-semibold text-[#b3261e]" : F.dim)}>{s}</span>
                </span>
                <span>{eur0(p as number)}</span>
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}

/* ───────────────────────────── Büro ───────────────────────────── */

interface Student {
  name: string;
  teacher: string;
  theory: number;
  special: number;
  drives: number;
  /** positiv = Guthaben, negativ = offener Betrag */
  account: number;
  /** Tage seit der letzten Zahlungserinnerung bzw. seit Fälligkeit */
  overdue?: number;
}
const STUDENTS: Student[] = [
  { name: "Lena Hartmann", teacher: "murat", theory: 9, special: 5, drives: 11, account: 372 },
  { name: "Hannah Lange", teacher: "murat", theory: 14, special: 12, drives: 19, account: 60 },
  { name: "Leon Vogel", teacher: "jo", theory: 14, special: 12, drives: 23, account: -189, overdue: 6 },
  { name: "Jonas Weber", teacher: "murat", theory: 6, special: 0, drives: 5, account: 124 },
  { name: "Aleyna Demir", teacher: "murat", theory: 12, special: 7, drives: 14, account: -272, overdue: 19 },
  { name: "Sophie Albrecht", teacher: "kerstin", theory: 14, special: 9, drives: 16, account: 248 },
  { name: "Ben Yildiz", teacher: "kerstin", theory: 11, special: 6, drives: 12, account: -148, overdue: 3 },
  { name: "David Kaya", teacher: "jo", theory: 13, special: 8, drives: 15, account: 0 },
  { name: "Mila Novak", teacher: "murat", theory: 4, special: 0, drives: 3, account: -124, overdue: 11 },
];
const ready = (s: Student) => s.theory >= 14 && s.special >= 12;

function Office({ lessons, onPatch }: { lessons: Lesson[]; onPatch: (id: number, s: Lesson["status"]) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { plan: "Fahrlehrer-Plan", schueler: "Schüler", zahlen: "Zahlen" };
  return (
    <Backoffice
      user="Ines Kompass"
      role="Büro & Inhaberin"
      title={titles[tab] ?? "Fahrlehrer-Plan"}
      nav={[
        { id: "plan", label: "Fahrlehrer-Plan", icon: CalendarDays, count: lessons.filter((l) => l.own && l.id !== 900).length },
        { id: "schueler", label: "Schüler", icon: Users },
        { id: "zahlen", label: "Zahlen", icon: ChartColumn, count: STUDENTS.filter((s) => s.account < 0).length },
      ]}
    >
      {tab === "schueler" ? <Students /> : tab === "zahlen" ? <Numbers lessons={lessons} /> : <Plan lessons={lessons} onPatch={onPatch} />}
    </Backoffice>
  );
}

function Plan({ lessons, onPatch }: { lessons: Lesson[]; onPatch: (id: number, s: Lesson["status"]) => void }) {
  const { toast } = useDemo();
  const firstOwn = lessons.find((l) => l.own && l.id !== 900);
  const [dayIdx, setDayIdx] = useState(firstOwn?.day ?? 0);
  const [openId, setOpenId] = useState<number | null>(null);
  const list = lessons.filter((l) => l.day === dayIdx);
  const open = lessons.find((l) => l.id === openId);
  const hours = (t: string) => Math.round(list.filter((l) => l.teacher === t && l.status !== "ausgefallen").reduce((n, l) => n + KINDS[l.kind].min, 0) / 45);
  return (
    <>
      <Panel
        flush
        tour="plan"
        title={fmtDayLong(workday(dayIdx))}
        aside={
          <>
            <span className="num hidden @dsm:inline">{list.length} Fahrten</span>
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
          px={1.15}
          cols={TEACHERS.map((t) => ({ id: t.id, title: t.name, sub: `${t.car} · ${hours(t.id)} Fahrstunden` }))}
          blocks={TEACHERS.map((t) => ({ col: t.id, from: t.pause[0], to: t.pause[1], label: "Pause" }))}
          items={list.map((l) => ({ id: l.id, col: l.teacher, start: l.start, min: KINDS[l.kind].min, title: l.student, sub: KINDS[l.kind].name, tone: KINDS[l.kind].tone, own: l.own && l.id !== 900, off: l.status === "ausgefallen" }))}
          onPick={setOpenId}
        />
      </Panel>
      <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-bo-muted">
        {(Object.keys(KINDS) as Kind[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className={cx("h-3 w-1 rounded-full border-l-[3px]", KINDS[k].tone)} aria-hidden /> {KINDS[k].name}
          </span>
        ))}
      </p>
      <Sheet
        open={!!open}
        onClose={() => setOpenId(null)}
        title={open ? `${open.student} · ${hm(open.start)} Uhr` : ""}
        footer={
          open && (
            <>
              <Btn
                variant="danger"
                onClick={() => {
                  onPatch(open.id, "ausgefallen");
                  setOpenId(null);
                  toast("Als ausgefallen vermerkt – die Stunde wird laut Vertrag berechnet.");
                }}
              >
                Nicht erschienen
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  onPatch(open.id, "gefahren");
                  setOpenId(null);
                  toast(`Gefahren – der Ausbildungsstand von ${open.student.split(" ")[0]} zählt mit.`);
                }}
              >
                Gefahren
              </Btn>
            </>
          )
        }
      >
        {open && (
          <dl className="space-y-2.5 text-[14px]">
            {[
              ["Art", KINDS[open.kind].name],
              ["Zeit", `${hm(open.start)}–${hm(open.start + KINDS[open.kind].min)} · ${KINDS[open.kind].min} Minuten`],
              ["Fahrlehrer", TEACHERS.find((t) => t.id === open.teacher)!.name],
              ["Fahrzeug", TEACHERS.find((t) => t.id === open.teacher)!.car],
              ["Preis", eur0(KINDS[open.kind].price)],
            ].map(([k, v]) => (
              <div key={k} className="num flex justify-between gap-4">
                <dt className="text-bo-muted">{k}</dt>
                <dd className="text-right text-bo-ink">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4">
              <dt className="text-bo-muted">Stand</dt>
              <dd>{open.status === "gefahren" ? <Tag tone="ok">gefahren</Tag> : open.status === "ausgefallen" ? <Tag tone="bad">ausgefallen</Tag> : open.own ? <Tag tone="accent">online gebucht, bezahlt</Tag> : <Tag tone="info">geplant</Tag>}</dd>
            </div>
          </dl>
        )}
      </Sheet>
    </>
  );
}

function Students() {
  const { toast } = useDemo();
  const [sel, setSel] = useState("Hannah Lange");
  const [signed, setSigned] = useState<string[]>([]);
  const s = STUDENTS.find((x) => x.name === sel)!;
  return (
    <div className="grid gap-4 @dlg:grid-cols-[minmax(0,1fr)_20rem]">
      <Panel flush title="Alle Schüler" aside={`${STUDENTS.filter(ready).length} prüfungsreif`} tour="schueler">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13.5px]">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Fahrlehrer</th>
                <th className={th}>Theorie</th>
                <th className={th}>Sonderfahrten</th>
                <th className={th}>Stand</th>
                <th className={cx(th, "text-right")}>Konto</th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((x) => (
                <tr key={x.name} className={cx(tr, "cursor-pointer hover:bg-bo-bg/60", sel === x.name && "bg-d-soft")} onClick={() => setSel(x.name)}>
                  <td className={td}>
                    <button type="button" className="flex items-center gap-2.5 text-left font-medium text-bo-ink" aria-pressed={sel === x.name}>
                      <Avatar name={x.name} size="sm" /> {x.name}
                    </button>
                  </td>
                  <td className={td}>{TEACHERS.find((t) => t.id === x.teacher)!.name.split(" ")[0]}</td>
                  <td className={cx(td, "num")}>{x.theory} / 14</td>
                  <td className={cx(td, "num")}>{x.special} / 12</td>
                  <td className={td}>{signed.includes(x.name) ? <Tag tone="info">zur Prüfung gemeldet</Tag> : ready(x) ? <Tag tone="ok">prüfungsreif</Tag> : <Tag>in Ausbildung</Tag>}</td>
                  <td className={cx(td, "num text-right", x.account < 0 ? "font-semibold text-bo-bad" : "text-bo-ink")}>{eur0(x.account)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={s.name} aside="Klasse B">
        <dl className="space-y-2 text-[13.5px]">
          {[
            ["Fahrlehrer", TEACHERS.find((t) => t.id === s.teacher)!.name],
            ["Theorie", `${s.theory} von 14 Lektionen`],
            ["Sonderfahrten", `${s.special} von 12 Stunden`],
            ["Übungsfahrten", `${s.drives} Stunden`],
            ["Konto", s.account < 0 ? `${eur0(-s.account)} offen` : `${eur0(s.account)} Guthaben`],
          ].map(([k, v]) => (
            <div key={k} className="num flex justify-between gap-3">
              <dt className="text-bo-muted">{k}</dt>
              <dd className="text-right text-bo-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {ready(s) ? (
          <Btn
            variant="primary"
            className="mt-4 w-full"
            disabled={signed.includes(s.name) || s.account < 0}
            onClick={() => {
              setSigned((x) => [...x, s.name]);
              toast(`${s.name.split(" ")[0]} ist zur praktischen Prüfung gemeldet – Termin geht an Schüler und Fahrlehrer.`);
            }}
          >
            <GraduationCap className="size-4" aria-hidden /> {signed.includes(s.name) ? "Zur Prüfung gemeldet" : "Zur Prüfung anmelden"}
          </Btn>
        ) : (
          <p className="mt-4 rounded-[min(var(--bo-rc),10px)] bg-bo-bg px-3 py-2 text-[13px] text-bo-body">Noch nicht prüfungsreif: Es fehlen Pflichtstunden.</p>
        )}
        {ready(s) && s.account < 0 && <p className="mt-2 text-[12.5px] text-bo-bad">Anmeldung gesperrt, solange ein Betrag offen ist.</p>}
        <p className="mt-2 text-[12px] text-bo-muted">Der Stand zählt automatisch mit, sobald eine Fahrt als gefahren vermerkt ist.</p>
      </Panel>
    </div>
  );
}

function Numbers({ lessons }: { lessons: Lesson[] }) {
  const { toast } = useDemo();
  const [sent, setSent] = useState<string[]>([]);
  const open = STUDENTS.filter((s) => s.account < 0).sort((a, b) => (b.overdue ?? 0) - (a.overdue ?? 0));
  const week = Array.from({ length: DAYS }, (_, i) => ({ label: weekdayShort(workday(i)), value: lessons.filter((l) => l.day === i && l.status !== "ausgefallen").reduce((n, l) => n + KINDS[l.kind].price, 0) }));
  const cap = (CLOSE - OPEN - 45) * DAYS;
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Offene Beträge", value: eur0(open.reduce((n, s) => n - s.account, 0)), note: `${open.length} Schüler` },
          { label: "Guthaben der Schüler", value: eur0(STUDENTS.filter((s) => s.account > 0).reduce((n, s) => n + s.account, 0)), note: "vorab bezahlt" },
          { label: "Fahrten diese Woche", value: lessons.filter((l) => l.status !== "ausgefallen").length, note: `${lessons.filter((l) => l.own).length} online gebucht` },
          { label: "Kurzfristige Ausfälle", value: "3,8 %", note: "letzte 30 Tage · vorher 11 %" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-[1.3fr_1fr]">
        <Panel flush title="Offene Posten" aside="älteste zuerst" tour="offen">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[440px] text-[13.5px]">
              <thead>
                <tr>
                  <th className={th}>Schüler</th>
                  <th className={th}>Fällig seit</th>
                  <th className={cx(th, "text-right")}>Betrag</th>
                  <th className={cx(th, "text-right")}>Aktion</th>
                </tr>
              </thead>
              <tbody>
                {open.map((s) => (
                  <tr key={s.name} className={tr}>
                    <td className={cx(td, "font-medium text-bo-ink")}>{s.name}</td>
                    <td className={td}>{(s.overdue ?? 0) > 14 ? <Tag tone="bad">{s.overdue} Tagen</Tag> : <Tag tone="warn">{s.overdue} Tagen</Tag>}</td>
                    <td className={cx(td, "num text-right text-bo-ink")}>{eur0(-s.account)}</td>
                    <td className={cx(td, "text-right")}>
                      <Btn
                        size="sm"
                        disabled={sent.includes(s.name)}
                        onClick={() => {
                          setSent((x) => [...x, s.name]);
                          toast(`Zahlungserinnerung mit Bezahl-Link an ${s.name.split(" ")[0]} verschickt.`);
                        }}
                      >
                        <BellRing className="size-3.5" aria-hidden /> {sent.includes(s.name) ? "erinnert" : "Erinnern"}
                      </Btn>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="flex items-start gap-2 border-t border-bo-line px-4 py-3 text-[12.5px] text-bo-muted">
            <CircleDollarSign className="mt-0.5 size-4 shrink-0" aria-hidden /> Wer mit Guthaben bucht, kann gar nicht erst offen sein – neue Schüler starten deshalb direkt mit Guthaben.
          </p>
        </Panel>
        <Panel title="Auslastung je Fahrlehrer" aside="diese Woche">
          <Ranks data={TEACHERS.map((t) => ({ label: t.name, value: Math.round((lessons.filter((l) => l.teacher === t.id && l.status !== "ausgefallen").reduce((n, l) => n + KINDS[l.kind].min, 0) / cap) * 100) })).sort((a, b) => b.value - a.value)} format={(n) => `${n} %`} />
          <h3 className="mt-5 mb-2 border-t border-bo-line pt-4 text-[13.5px] font-semibold text-bo-ink">Geplanter Umsatz je Tag</h3>
          <Bars label="Geplanter Umsatz je Tag" data={week} mark={0} height={90} format={(n) => `${n}`} />
        </Panel>
      </div>
    </div>
  );
}
