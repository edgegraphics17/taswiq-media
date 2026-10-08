"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { CalendarDays, ChartColumn, Check, ChevronLeft, ChevronRight, Clock, MapPin, Scissors, Search, Users } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Sheet, Tag, td, th, Toggle, tr } from "@/demos/kit/ui";
import { cx, dur, eur0, fmtDay, fmtDayLong, hm, nowMinutes, weekdayShort, workday } from "@/demos/kit/util";

/**
 * Demo "Kammwerk": Buchungsseite mit Kundenprofil + Dashboard mit Teamkalender und Kundenkartei.
 * Freie Zeiten werden wirklich berechnet (Arbeitszeit, Pause, bestehende Termine) – eine Buchung vorne
 * belegt die Zeit und steht sofort im Kalender hinten.
 */

type Group = "Damen" | "Herren" | "Farbe" | "Bart";
interface Service {
  id: string;
  group: Group;
  name: string;
  min: number;
  price: number;
}
const SERVICES: Service[] = [
  { id: "d-wsf", group: "Damen", name: "Waschen, Schneiden, Föhnen", min: 60, price: 58 },
  { id: "d-cut", group: "Damen", name: "Trockenschnitt", min: 30, price: 34 },
  { id: "d-style", group: "Damen", name: "Föhnen & Styling", min: 30, price: 29 },
  { id: "h-cut", group: "Herren", name: "Haarschnitt", min: 30, price: 32 },
  { id: "h-combo", group: "Herren", name: "Haarschnitt & Bart", min: 45, price: 46 },
  { id: "h-clip", group: "Herren", name: "Maschinenschnitt", min: 15, price: 18 },
  { id: "f-ansatz", group: "Farbe", name: "Ansatzfarbe", min: 75, price: 62 },
  { id: "f-bal", group: "Farbe", name: "Balayage", min: 150, price: 139 },
  { id: "f-gloss", group: "Farbe", name: "Glossing", min: 30, price: 35 },
  { id: "b-trim", group: "Bart", name: "Bart trimmen & Konturen", min: 20, price: 19 },
];
const GROUPS: Group[] = ["Damen", "Herren", "Farbe", "Bart"];

interface Staff {
  id: string;
  name: string;
  role: string;
  groups: Group[];
}
const STAFF: Staff[] = [
  { id: "mira", name: "Mira Albers", role: "Inhaberin · Farbe & Schnitt", groups: ["Damen", "Farbe"] },
  { id: "jonas", name: "Jonas Reuter", role: "Barber", groups: ["Herren", "Bart"] },
  { id: "selin", name: "Selin Kaya", role: "Stylistin", groups: ["Damen", "Herren", "Farbe"] },
];
const OPEN = 9 * 60;
const CLOSE = 18 * 60 + 30;
const PAUSE: Record<string, [number, number]> = { mira: [13 * 60, 13 * 60 + 45], jonas: [12 * 60 + 30, 13 * 60 + 15], selin: [14 * 60, 14 * 60 + 30] };
const DAYS = 6;

type ApptStatus = "bestaetigt" | "da" | "noshow";
interface Appt {
  id: number;
  staff: string;
  day: number;
  start: number;
  min: number;
  customer: string;
  what: string;
  group: Group;
  price: number;
  status: ApptStatus;
  via: "Online" | "Telefon";
  own?: boolean;
}

/** Zwei typische Tagesmuster je Person, im Wechsel über die Woche */
const PATTERN: Record<string, [number, number, string, string, Group, number][][]> = {
  mira: [
    [
      [540, 75, "Petra Lindner", "Ansatzfarbe", "Farbe", 62],
      [630, 60, "Hanna Vogt", "Waschen, Schneiden, Föhnen", "Damen", 58],
      [705, 60, "Ines Bauer", "Waschen, Schneiden, Föhnen", "Damen", 58],
      [840, 150, "Sophie Marx", "Balayage", "Farbe", 139],
      [1005, 30, "Karin Wolff", "Glossing", "Farbe", 35],
    ],
    [
      [555, 150, "Nele Brandt", "Balayage", "Farbe", 139],
      [720, 30, "Ute Hansen", "Trockenschnitt", "Damen", 34],
      [840, 75, "Maren Schütz", "Ansatzfarbe", "Farbe", 62],
      [930, 60, "Julia Roth", "Waschen, Schneiden, Föhnen", "Damen", 58],
    ],
  ],
  jonas: [
    [
      [540, 30, "Tim Becker", "Haarschnitt", "Herren", 32],
      [585, 45, "Emre Yilmaz", "Haarschnitt & Bart", "Herren", 46],
      [645, 30, "Paul Krüger", "Haarschnitt", "Herren", 32],
      [690, 20, "Oskar Lang", "Bart trimmen & Konturen", "Bart", 19],
      [810, 45, "David Stein", "Haarschnitt & Bart", "Herren", 46],
      [870, 30, "Felix Horn", "Haarschnitt", "Herren", 32],
      [930, 15, "Ben Fuchs", "Maschinenschnitt", "Herren", 18],
      [990, 45, "Marco Rossi", "Haarschnitt & Bart", "Herren", 46],
    ],
    [
      [570, 45, "Luis Sommer", "Haarschnitt & Bart", "Herren", 46],
      [630, 30, "Kai Neumann", "Haarschnitt", "Herren", 32],
      [690, 30, "Arne Peters", "Haarschnitt", "Herren", 32],
      [825, 30, "Milan Jovic", "Haarschnitt", "Herren", 32],
      [900, 45, "Samir Haddad", "Haarschnitt & Bart", "Herren", 46],
      [1020, 30, "Jan Winter", "Haarschnitt", "Herren", 32],
    ],
  ],
  selin: [
    [
      [570, 60, "Anna Schreiber", "Waschen, Schneiden, Föhnen", "Damen", 58],
      [660, 30, "Leon Maier", "Haarschnitt", "Herren", 32],
      [720, 75, "Clara Jung", "Ansatzfarbe", "Farbe", 62],
      [885, 30, "Mia Busch", "Föhnen & Styling", "Damen", 29],
      [960, 60, "Greta Simon", "Waschen, Schneiden, Föhnen", "Damen", 58],
    ],
    [
      [540, 30, "Rosa Engel", "Trockenschnitt", "Damen", 34],
      [600, 60, "Lea Kraft", "Waschen, Schneiden, Föhnen", "Damen", 58],
      [750, 30, "Noah Berg", "Haarschnitt", "Herren", 32],
      [900, 75, "Emma Thiel", "Ansatzfarbe", "Farbe", 62],
    ],
  ],
};

function seedAppts(): Appt[] {
  const now = nowMinutes();
  let id = 1;
  const out: Appt[] = [];
  for (let day = 0; day < DAYS; day++) {
    for (const s of STAFF) {
      for (const [start, min, customer, what, group, price] of PATTERN[s.id][day % 2]) {
        const past = day === 0 && start + min < now;
        out.push({ id: id++, staff: s.id, day, start, min, customer, what, group, price, status: past ? (customer === "Paul Krüger" ? "noshow" : "da") : "bestaetigt", via: id % 4 === 0 ? "Telefon" : "Online" });
      }
    }
  }
  // Stammkundin der Demo: ihr nächster Termin in drei Tagen
  out.push({ id: 900, staff: "mira", day: 3, start: 16 * 60 + 45, min: 60, customer: "Lena Hartmann", what: "Waschen, Schneiden, Föhnen", group: "Damen", price: 58, status: "bestaetigt", via: "Online", own: true });
  return out;
}

const free = (appts: Appt[], staff: string, day: number, start: number, min: number) => {
  const end = start + min;
  if (start < OPEN || end > CLOSE) return false;
  const [p0, p1] = PAUSE[staff];
  if (start < p1 && end > p0) return false;
  if (day === 0 && start < nowMinutes() + 30) return false;
  return !appts.some((a) => a.staff === staff && a.day === day && start < a.start + a.min && end > a.start);
};

interface Client {
  name: string;
  phone: string;
  visits: number;
  last: string;
  spent: number;
  note: string;
  regular?: boolean;
}
const CLIENTS: Client[] = [
  { name: "Lena Hartmann", phone: "0151 2345 6701", visits: 7, last: "vor 5 Wochen", spent: 486, note: "Farbrezeptur: 7.1 + 8.0 (1:1), 6 % Oxidant, 35 Min. Kopfhaut empfindlich – ohne Parfüm.", regular: true },
  { name: "Sophie Marx", phone: "0160 5550 1422", visits: 12, last: "heute", spent: 1318, note: "Balayage alle 12 Wochen. Trinkt Hafer-Cappuccino.", regular: true },
  { name: "Emre Yilmaz", phone: "0172 8890 3345", visits: 21, last: "heute", spent: 934, note: "Fade 1,5 auf 3, Bart natürlich lassen. Kommt alle drei Wochen.", regular: true },
  { name: "Petra Lindner", phone: "0151 7781 2090", visits: 9, last: "heute", spent: 602, note: "Ansatz 5.3, Längen nur auffrischen." },
  { name: "Tim Becker", phone: "0176 4411 5567", visits: 4, last: "heute", spent: 128, note: "" },
  { name: "Paul Krüger", phone: "0157 3020 8876", visits: 3, last: "vor 6 Wochen", spent: 96, note: "Zweimal nicht erschienen – künftig mit Anzahlung buchen." },
  { name: "Clara Jung", phone: "0162 9034 1178", visits: 6, last: "vor 4 Wochen", spent: 412, note: "Möchte Erinnerung per WhatsApp." },
  { name: "Marco Rossi", phone: "0170 2256 7743", visits: 15, last: "vor 3 Wochen", spent: 690, note: "Bart mit Messer, heißes Tuch.", regular: true },
];

export default function FriseurDemo() {
  const { view } = useDemo();
  const [appts, setAppts] = useState<Appt[]>(seedAppts);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [offline, setOffline] = useState<Record<string, boolean>>({});
  const services = useMemo(() => SERVICES.map((s) => ({ ...s, price: prices[s.id] ?? s.price })), [prices]);

  const book = (a: Omit<Appt, "id" | "status" | "via" | "own">) => setAppts((p) => [...p, { ...a, id: Date.now(), status: "bestaetigt", via: "Online", own: true }]);
  const patch = (id: number, change: Partial<Appt> | null) => setAppts((p) => (change ? p.map((a) => (a.id === id ? { ...a, ...change } : a)) : p.filter((a) => a.id !== id)));

  return view === "kunde" ? (
    <Storefront appts={appts} services={services.filter((s) => !offline[s.id])} onBook={book} onPatch={patch} />
  ) : (
    <Dashboard appts={appts} services={services} offline={offline} onPatch={patch} onPrice={(id, p) => setPrices((s) => ({ ...s, [id]: p }))} onOffline={(id, v) => setOffline((s) => ({ ...s, [id]: v }))} />
  );
}

/* ───────────────────────────── Buchungsseite ───────────────────────────── */

function Wordmark({ className }: { className?: string }) {
  return <span className={cx("font-d-display font-extrabold tracking-[0.14em] uppercase [font-stretch:125%]", className)}>Kammwerk</span>;
}

function Storefront({ appts, services, onBook, onPatch }: { appts: Appt[]; services: Service[]; onBook: (a: Omit<Appt, "id" | "status" | "via" | "own">) => void; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const { tab, setTab } = useDemo();
  const [preset, setPreset] = useState<string[]>([]);
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-[#f5f1ea] font-plex text-[15px] text-[#3a312b]">
      <header className="bg-d-deep text-[#efe6da]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 px-4 sm:px-6">
          <p className="flex items-baseline gap-3 py-3">
            <Wordmark className="text-[1.15rem] text-white" />
            <span className="hidden text-[12px] text-[#bfb1a0] sm:inline">Friseur & Barber</span>
          </p>
          <nav aria-label="Kundenbereich" className="flex gap-1">
            {[
              { id: "buchen", label: "Termin buchen" },
              { id: "profil", label: "Mein Profil" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-12 border-b-2 px-3 text-[14px] font-medium", tab === n.id ? "border-d-accent text-white" : "border-transparent text-[#bfb1a0] hover:text-white")}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "profil" ? (
        <Profile
          appts={appts}
          onPatch={onPatch}
          onRebook={(ids) => {
            setPreset(ids);
            setTab("buchen");
          }}
        />
      ) : (
        <Booking key={preset.join()} appts={appts} services={services} preset={preset} onBook={onBook} />
      )}
    </div>
  );
}

function Booking({ appts, services, preset, onBook }: { appts: Appt[]; services: Service[]; preset: string[]; onBook: (a: Omit<Appt, "id" | "status" | "via" | "own">) => void }) {
  const { go } = useDemo();
  const [picked, setPicked] = useState<string[]>(preset);
  const [who, setWho] = useState("egal");
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState<{ start: number; staff: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remind, setRemind] = useState(true);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ day: number; start: number; staff: string } | null>(null);

  const chosen = services.filter((s) => picked.includes(s.id));
  const total = chosen.reduce((n, s) => n + s.min, 0);
  const price = chosen.reduce((n, s) => n + s.price, 0);
  const groups = [...new Set(chosen.map((s) => s.group))];
  const able = STAFF.filter((s) => groups.every((g) => s.groups.includes(g)));
  const pool = who === "egal" ? able : able.filter((s) => s.id === who);

  const slots = useMemo(() => {
    if (!total) return [];
    const out: { start: number; staff: string }[] = [];
    for (let t = OPEN; t + total <= CLOSE; t += 15) {
      const s = pool.find((p) => free(appts, p.id, dayIdx, t, total));
      if (s) out.push({ start: t, staff: s.id });
    }
    return out;
  }, [appts, pool, dayIdx, total]);

  const toggle = (id: string) => {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
    setSlot(null);
  };
  const staffName = (id: string) => STAFF.find((s) => s.id === id)!.name;

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <span className="grid size-12 place-items-center rounded-full bg-d-accent text-d-on">
          <Check className="size-6" strokeWidth={2.5} aria-hidden />
        </span>
        <h1 className="mt-5 font-d-display text-[2rem] leading-[1.05] font-bold tracking-tight text-[#231c18] [font-stretch:110%]">Dein Termin steht.</h1>
        <p className="mt-2 text-[16px] leading-relaxed">
          {fmtDayLong(workday(done.day))} um {hm(done.start)} Uhr bei {staffName(done.staff)}. {remind ? "Am Vortag erinnern wir dich per SMS." : ""}
        </p>
        <dl className="mt-6 divide-y divide-[#e2d9cc] border-y border-[#e2d9cc] text-[15px]">
          {chosen.map((s) => (
            <div key={s.id} className="flex justify-between py-2.5">
              <dt>{s.name}</dt>
              <dd className="num text-[#6b5d52]">
                {dur(s.min)} · {eur0(s.price)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 rounded-lg bg-d-soft p-4 text-[14px] leading-snug">
          <strong className="font-semibold">So sieht es der Salon:</strong> Der Termin steht jetzt im Kalender von {staffName(done.staff).split(" ")[0]} – und die Zeit ist für alle anderen belegt.
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => go("betrieb", "kalender")} className="min-h-11 rounded-md bg-d-deep px-4 font-medium text-white">
              Im Kalender ansehen
            </button>
            <button
              type="button"
              onClick={() => {
                setDone(null);
                setPicked([]);
                setSlot(null);
              }}
              className="min-h-11 rounded-md border border-[#cdbfae] px-4 font-medium"
            >
              Weiteren Termin buchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepHead = (n: number, title: string, hint?: string) => (
    <div className="flex items-baseline gap-3">
      <span className="num font-d-display text-[13px] font-bold text-[#a8743a] [font-stretch:125%]">0{n}</span>
      <h2 className="font-d-display text-[1.15rem] font-bold tracking-tight text-[#231c18] [font-stretch:110%]">{title}</h2>
      {hint && <span className="text-[13px] text-[#8a7b6e]">{hint}</span>}
    </div>
  );

  return (
    <>
      <div className="relative h-36 overflow-hidden bg-d-deep sm:h-44">
        <Image src="/images/sectors/beauty-0.webp" alt="Blick in den Salon mit drei Friseurstühlen" fill priority sizes="100vw" className="object-cover object-[center_60%] opacity-55" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-4 pb-5 sm:px-6">
          <h1 className="font-d-display text-[clamp(1.6rem,4vw,2.5rem)] leading-none font-extrabold tracking-tight text-white [font-stretch:115%]">Termin buchen</h1>
          <p className="mt-2 flex flex-wrap gap-x-4 text-[13px] text-[#e5d9c9]">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden /> Bahnhofstraße 21, Musterstadt
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> Mo – Sa, 9:00 – 18:30
            </span>
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-7 sm:px-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="space-y-9">
          <section data-tour="services">
            {stepHead(1, "Was darf es sein?", "Mehrfachauswahl möglich")}
            <div className="mt-4 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {GROUPS.map((g) => (
                <div key={g}>
                  <h3 className="border-b border-[#231c18] pb-1 text-[11.5px] font-semibold tracking-[0.14em] text-[#231c18] uppercase">{g}</h3>
                  <ul>
                    {services
                      .filter((s) => s.group === g)
                      .map((s) => {
                        const on = picked.includes(s.id);
                        return (
                          <li key={s.id} className="border-b border-[#e2d9cc]">
                            <button type="button" aria-pressed={on} onClick={() => toggle(s.id)} className="flex min-h-12 w-full items-center gap-3 py-1.5 text-left">
                              <span className={cx("grid size-5 shrink-0 place-items-center rounded-sm border", on ? "border-[#231c18] bg-[#231c18] text-white" : "border-[#bdae9c] bg-white")}>{on && <Check className="size-3.5" strokeWidth={3} aria-hidden />}</span>
                              <span className="min-w-0 flex-1">
                                <span className={cx("block leading-tight", on && "font-semibold text-[#231c18]")}>{s.name}</span>
                                <span className="num text-[12.5px] text-[#8a7b6e]">{dur(s.min)}</span>
                              </span>
                              <span className="num font-medium text-[#231c18]">{eur0(s.price)}</span>
                            </button>
                          </li>
                        );
                      })}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className={cx(!total && "pointer-events-none opacity-40")} inert={!total}>
            {stepHead(2, "Bei wem?")}
            <div className="mt-4 grid gap-2 sm:grid-cols-4">
              {[{ id: "egal", name: "Egal", role: "nächster freier Termin", groups: GROUPS } as Staff, ...STAFF].map((s) => {
                const ok = s.id === "egal" || able.some((a) => a.id === s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!ok}
                    aria-pressed={who === s.id}
                    onClick={() => {
                      setWho(s.id);
                      setSlot(null);
                    }}
                    className={cx("min-h-16 rounded-lg border px-3 py-2 text-left transition-colors disabled:opacity-40", who === s.id ? "border-[#231c18] bg-white" : "border-[#d9cebf] hover:border-[#231c18]")}
                  >
                    <span className="block font-semibold text-[#231c18]">{s.name.split(" ")[0]}</span>
                    <span className="block text-[12px] leading-tight text-[#8a7b6e]">{ok ? s.role : "bietet das nicht an"}</span>
                  </button>
                );
              })}
            </div>
          </section>

          <section data-tour="slots" className={cx(!total && "pointer-events-none opacity-40")} inert={!total}>
            {stepHead(3, "Wann passt es?")}
            <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
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
                    className={cx("min-h-14 w-16 shrink-0 rounded-lg border text-center leading-tight", dayIdx === i ? "border-[#231c18] bg-[#231c18] text-white" : "border-[#d9cebf] bg-white")}
                  >
                    <span className="block text-[12px] opacity-75">{d.toDateString() === new Date().toDateString() ? "Heute" : weekdayShort(d)}</span>
                    <span className="num block text-[17px] font-semibold">{d.getDate()}.</span>
                  </button>
                );
              })}
            </div>
            {total > 0 &&
              (slots.length ? (
                <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
                  {slots.map((s) => (
                    <button
                      key={s.start}
                      type="button"
                      aria-pressed={slot?.start === s.start}
                      onClick={() => setSlot(s)}
                      className={cx("num min-h-11 rounded-md border text-[14px] font-medium", slot?.start === s.start ? "border-d-accent bg-d-accent text-d-on" : "border-[#d9cebf] bg-white hover:border-[#231c18]")}
                    >
                      {hm(s.start)}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-lg border border-dashed border-[#cdbfae] px-4 py-5 text-[14px] text-[#6b5d52]">An diesem Tag ist für {dur(total)} nichts mehr frei. Wähl einen anderen Tag oder „Egal“ bei der Person.</p>
              ))}
          </section>

          <section className={cx(!slot && "pointer-events-none opacity-40")} inert={!slot}>
            {stepHead(4, "Deine Daten")}
            <form
              noValidate
              className="mt-4 grid gap-3 sm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!slot || name.trim().length < 2 || phone.trim().length < 6) return;
                onBook({ staff: slot.staff, day: dayIdx, start: slot.start, min: total, customer: name.trim(), what: chosen.map((s) => s.name).join(" + "), group: chosen[0].group, price });
                setDone({ day: dayIdx, start: slot.start, staff: slot.staff });
              }}
            >
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Handynummer">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={input} placeholder="0151 2345678" />
              </Field>
              <label className="flex min-h-11 items-center gap-2.5 text-[14px] sm:col-span-2">
                <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="size-4 accent-[#231c18]" /> Am Vortag per SMS erinnern
              </label>
              {tried && (name.trim().length < 2 || phone.trim().length < 6) && (
                <p role="alert" className="text-[13px] text-bo-bad sm:col-span-2">
                  Bitte trag Name und Handynummer ein – erfundene Angaben genügen.
                </p>
              )}
              <div className="sm:col-span-2">
                <button type="submit" className="min-h-12 w-full rounded-lg bg-d-accent px-5 font-semibold text-d-on hover:brightness-95 sm:w-auto">
                  Termin verbindlich buchen
                </button>
                <p className="mt-2 text-[12px] text-[#8a7b6e]">Demo: Es wird nichts gebucht oder gespeichert. Absage bis 24 Stunden vorher kostenlos.</p>
              </div>
            </form>
          </section>
        </div>

        <aside>
          <div className="sticky top-[calc(var(--bar-h)+1rem)] rounded-xl bg-d-deep p-5 text-[#efe6da]">
            <h2 className="text-[11.5px] font-semibold tracking-[0.14em] text-d-accent uppercase">Dein Termin</h2>
            {chosen.length === 0 ? (
              <p className="mt-3 text-[14px] leading-relaxed text-[#bfb1a0]">Wähl eine Leistung – Dauer und Preis rechnen wir für dich zusammen.</p>
            ) : (
              <>
                <ul className="mt-3 space-y-2 text-[14.5px]">
                  {chosen.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3">
                      <span>{s.name}</span>
                      <span className="num text-[#bfb1a0]">{eur0(s.price)}</span>
                    </li>
                  ))}
                </ul>
                <dl className="num mt-4 space-y-1.5 border-t border-white/15 pt-3 text-[14px]">
                  <div className="flex justify-between">
                    <dt className="text-[#bfb1a0]">Dauer</dt>
                    <dd>{dur(total)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#bfb1a0]">Bei</dt>
                    <dd>{slot ? staffName(slot.staff) : who === "egal" ? "Egal" : staffName(who)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-[#bfb1a0]">Wann</dt>
                    <dd>{slot ? `${fmtDay(workday(dayIdx))}, ${hm(slot.start)}` : "noch offen"}</dd>
                  </div>
                  <div className="flex justify-between pt-2 text-[17px] font-semibold text-white">
                    <dt>Preis</dt>
                    <dd>{eur0(price)}</dd>
                  </div>
                </dl>
                <p className="mt-3 text-[12px] text-[#bfb1a0]">Bezahlt wird im Salon.</p>
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}

function Profile({ appts, onPatch, onRebook }: { appts: Appt[]; onPatch: (id: number, c: Partial<Appt> | null) => void; onRebook: (ids: string[]) => void }) {
  const { toast } = useDemo();
  const next = appts.find((a) => a.id === 900);
  const [moving, setMoving] = useState(false);
  const options = useMemo(() => {
    if (!next) return [];
    const out: { day: number; start: number }[] = [];
    for (let d = next.day; d < DAYS && out.length < 6; d++) for (let t = OPEN; t + next.min <= CLOSE && out.length < 6; t += 45) if (free(appts, next.staff, d, t, next.min)) out.push({ day: d, start: t });
    return out;
  }, [appts, next]);
  const history = [
    { when: "vor 5 Wochen", what: "Ansatzfarbe + Trockenschnitt", who: "Mira", price: 96, ids: ["f-ansatz", "d-cut"] },
    { when: "vor 11 Wochen", what: "Waschen, Schneiden, Föhnen", who: "Mira", price: 58, ids: ["d-wsf"] },
    { when: "vor 4 Monaten", what: "Balayage", who: "Mira", price: 139, ids: ["f-bal"] },
  ];
  const stamps = 7;
  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem]" data-tour="profil">
      <div>
        <p className="text-[13px] text-[#8a7b6e]">Angemeldet als</p>
        <h1 className="font-d-display text-[1.9rem] leading-tight font-extrabold tracking-tight text-[#231c18] [font-stretch:110%]">Hallo Lena.</h1>

        <h2 className="mt-7 text-[11.5px] font-semibold tracking-[0.14em] text-[#231c18] uppercase">Nächster Termin</h2>
        {next ? (
          <div className="mt-2 rounded-xl border border-[#d9cebf] bg-white p-5">
            <p className="num font-d-display text-[1.35rem] leading-tight font-bold text-[#231c18]">
              {fmtDayLong(workday(next.day))} · {hm(next.start)} Uhr
            </p>
            <p className="mt-1">
              {next.what} bei {STAFF.find((s) => s.id === next.staff)!.name} · {dur(next.min)} · {eur0(next.price)}
            </p>
            {moving ? (
              <div className="mt-4 border-t border-[#e2d9cc] pt-4">
                <p className="text-[13.5px] font-medium text-[#231c18]">Freie Zeiten bei Mira</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {options.map((o) => (
                    <button
                      key={`${o.day}-${o.start}`}
                      type="button"
                      onClick={() => {
                        onPatch(900, { day: o.day, start: o.start });
                        setMoving(false);
                        toast("Termin verschoben – im Kalender des Salons steht er jetzt auf der neuen Zeit.");
                      }}
                      className="num min-h-11 rounded-md border border-[#d9cebf] px-3 text-[14px] hover:border-[#231c18]"
                    >
                      {fmtDay(workday(o.day))}, {hm(o.start)}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => setMoving(true)} className="min-h-11 rounded-md bg-[#231c18] px-4 text-[14px] font-medium text-white">
                  Verschieben
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPatch(900, null);
                    toast("Termin abgesagt. Die Zeit ist im Kalender sofort wieder frei.");
                  }}
                  className="min-h-11 rounded-md border border-[#cdbfae] px-4 text-[14px] font-medium"
                >
                  Absagen
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2 rounded-xl border border-dashed border-[#cdbfae] px-5 py-6 text-[14px] text-[#6b5d52]">Kein Termin geplant. Buch deinen letzten Besuch einfach nochmal.</p>
        )}

        <h2 className="mt-8 text-[11.5px] font-semibold tracking-[0.14em] text-[#231c18] uppercase">Bisherige Besuche</h2>
        <ul className="mt-1 divide-y divide-[#e2d9cc] border-b border-[#e2d9cc]">
          {history.map((h) => (
            <li key={h.when} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
              <div>
                <p className="font-medium text-[#231c18]">{h.what}</p>
                <p className="num text-[13px] text-[#8a7b6e]">
                  {h.when} · bei {h.who} · {eur0(h.price)}
                </p>
              </div>
              <button type="button" onClick={() => onRebook(h.ids)} className="min-h-11 rounded-md border border-[#cdbfae] px-3 text-[13.5px] font-medium hover:border-[#231c18]">
                Nochmal buchen
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-4">
        <div className="rounded-xl bg-d-deep p-5 text-[#efe6da]">
          <h2 className="text-[11.5px] font-semibold tracking-[0.14em] text-d-accent uppercase">Treuekarte</h2>
          <p className="mt-2 text-[14px] leading-snug">Jeder zehnte Besuch: 20 % auf alles.</p>
          <ol className="mt-4 grid grid-cols-5 gap-2" aria-label={`${stamps} von 10 Stempeln`}>
            {Array.from({ length: 10 }, (_, i) => (
              <li key={i} className={cx("grid aspect-square place-items-center rounded-full border text-[11px]", i < stamps ? "border-d-accent bg-d-accent text-d-on" : "border-dashed border-white/30 text-white/40")}>
                {i < stamps ? <Scissors className="size-3.5" aria-hidden /> : <span className="num">{i + 1}</span>}
              </li>
            ))}
          </ol>
          <p className="num mt-4 text-[13px] text-[#bfb1a0]">Noch {10 - stamps} Besuche bis zum Rabatt.</p>
        </div>
        <div className="rounded-xl border border-[#d9cebf] bg-white p-5 text-[14px]">
          <h2 className="text-[11.5px] font-semibold tracking-[0.14em] text-[#231c18] uppercase">Meine Angaben</h2>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-3">
              <dt className="text-[#8a7b6e]">Stammfriseurin</dt>
              <dd>Mira Albers</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[#8a7b6e]">Erinnerung</dt>
              <dd>SMS am Vortag</dd>
            </div>
            <div className="num flex justify-between gap-3">
              <dt className="text-[#8a7b6e]">Handy</dt>
              <dd>0151 2345 6701</dd>
            </div>
          </dl>
        </div>
      </aside>
    </div>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

const GROUP_STYLE: Record<Group, string> = {
  Damen: "border-l-[#8a5a9c] bg-[#f4edf6]",
  Herren: "border-l-[#3d6a9c] bg-[#eaf1f8]",
  Farbe: "border-l-[#b0762c] bg-[#f9f0e2]",
  Bart: "border-l-[#4d7d5c] bg-[#eaf3ed]",
};

function Dashboard({ appts, services, offline, onPatch, onPrice, onOffline }: { appts: Appt[]; services: Service[]; offline: Record<string, boolean>; onPatch: (id: number, c: Partial<Appt> | null) => void; onPrice: (id: string, p: number) => void; onOffline: (id: string, v: boolean) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { kalender: "Kalender", kunden: "Kunden", leistungen: "Leistungen", zahlen: "Auswertung" };
  const fresh = appts.filter((a) => a.own && a.id !== 900).length;
  return (
    <Backoffice
      user="Mira Albers"
      role="Inhaberin"
      title={titles[tab] ?? "Kalender"}
      nav={[
        { id: "kalender", label: "Kalender", icon: CalendarDays, count: fresh },
        { id: "kunden", label: "Kunden", icon: Users },
        { id: "leistungen", label: "Leistungen", icon: Scissors },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "kunden" ? <Clients /> : tab === "leistungen" ? <ServiceEditor services={services} offline={offline} onPrice={onPrice} onOffline={onOffline} /> : tab === "zahlen" ? <Numbers appts={appts} /> : <Calendar appts={appts} onPatch={onPatch} />}
    </Backoffice>
  );
}

function Calendar({ appts, onPatch }: { appts: Appt[]; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const firstOwn = appts.find((a) => a.own && a.id !== 900);
  const [dayIdx, setDayIdx] = useState(firstOwn?.day ?? 0);
  const [openId, setOpenId] = useState<number | null>(null);
  const PX = 1.4; // Pixel je Minute
  const hours = Array.from({ length: (CLOSE - OPEN) / 60 + 1 }, (_, i) => OPEN + i * 60);
  const now = nowMinutes();
  const open = appts.find((a) => a.id === openId);
  const list = appts.filter((a) => a.day === dayIdx);
  return (
    <>
      <Panel
        flush
        tour="kalender"
        title={fmtDayLong(workday(dayIdx))}
        aside={
          <>
            <span className="num hidden sm:inline">
              {list.length} Termine · {eur0(list.reduce((s, a) => s + (a.status === "noshow" ? 0 : a.price), 0))}
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
        <div className="overflow-x-auto">
          <div className="grid min-w-[620px] grid-cols-[3.25rem_repeat(3,minmax(0,1fr))]">
            <div className="border-b border-bo-line" />
            {STAFF.map((s) => (
              <div key={s.id} className="flex items-center gap-2 border-b border-l border-bo-line px-3 py-2">
                <Avatar name={s.name} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-[13px] leading-tight font-semibold text-bo-ink">{s.name}</p>
                  <p className="num text-[11.5px] leading-tight text-bo-muted">{list.filter((a) => a.staff === s.id).length} Termine</p>
                </div>
              </div>
            ))}
            <div className="relative" style={{ height: (CLOSE - OPEN) * PX }}>
              {hours.map((h) => (
                <span key={h} className="num absolute right-2 -translate-y-1/2 text-[11px] text-bo-muted" style={{ top: Math.max(8, (h - OPEN) * PX) }}>
                  {hm(h)}
                </span>
              ))}
            </div>
            {STAFF.map((s) => {
              const [p0, p1] = PAUSE[s.id];
              return (
                <div key={s.id} className="relative border-l border-bo-line" style={{ height: (CLOSE - OPEN) * PX, backgroundImage: "linear-gradient(to bottom, #e6e8ec 1px, transparent 1px)", backgroundSize: `100% ${60 * PX}px` }}>
                  <div className="absolute inset-x-0 grid place-items-center bg-[repeating-linear-gradient(135deg,#eef0f3_0_6px,#f7f8f9_6px_12px)] text-[11px] text-bo-muted" style={{ top: (p0 - OPEN) * PX, height: (p1 - p0) * PX }}>
                    Pause
                  </div>
                  {list
                    .filter((a) => a.staff === s.id)
                    .map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setOpenId(a.id)}
                        className={cx("absolute inset-x-1 overflow-hidden rounded border-l-[3px] px-2 py-0.5 text-left leading-tight transition-shadow hover:shadow-md", GROUP_STYLE[a.group], a.status === "noshow" && "opacity-55", a.own && "animate-demo-flash ring-1 ring-bo-ink")}
                        style={{ top: (a.start - OPEN) * PX + 1, height: a.min * PX - 2 }}
                      >
                        {a.min < 30 ? (
                          <span className={cx("block truncate text-[12px] font-semibold text-bo-ink", a.status === "noshow" && "line-through")}>
                            <span className="num font-normal text-bo-muted">{hm(a.start)}</span> {a.customer}
                          </span>
                        ) : (
                          <>
                            <span className="num block truncate text-[11px] text-bo-muted">
                              {hm(a.start)}–{hm(a.start + a.min)}
                              {a.status === "da" && " · da"}
                              {a.status === "noshow" && " · nicht erschienen"}
                            </span>
                            <span className={cx("block truncate text-[12.5px] font-semibold text-bo-ink", a.status === "noshow" && "line-through")}>{a.customer}</span>
                            {a.min >= 60 && <span className="block truncate text-[11.5px] text-bo-body">{a.what}</span>}
                          </>
                        )}
                      </button>
                    ))}
                  {dayIdx === 0 && now > OPEN && now < CLOSE && <div className="pointer-events-none absolute inset-x-0 z-10 border-t-2 border-bo-bad" style={{ top: (now - OPEN) * PX }} aria-hidden />}
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-bo-muted">
        {GROUPS.map((g) => (
          <li key={g} className="inline-flex items-center gap-1.5">
            <span className={cx("h-3 w-3 rounded-sm border-l-[3px]", GROUP_STYLE[g])} aria-hidden /> {g}
          </li>
        ))}
      </ul>

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
                }}
              >
                Nicht erschienen
              </Btn>
              <Btn
                onClick={() => {
                  onPatch(open.id, null);
                  setOpenId(null);
                }}
              >
                Termin löschen
              </Btn>
              <Btn
                variant="primary"
                onClick={() => {
                  onPatch(open.id, { status: "da" });
                  setOpenId(null);
                }}
              >
                Einchecken
              </Btn>
            </>
          )
        }
      >
        {open && (
          <dl className="grid grid-cols-[7rem_1fr] gap-y-2.5 text-[14px]">
            <dt className="text-bo-muted">Leistung</dt>
            <dd className="text-bo-ink">{open.what}</dd>
            <dt className="text-bo-muted">Bei</dt>
            <dd className="text-bo-ink">{STAFF.find((s) => s.id === open.staff)!.name}</dd>
            <dt className="text-bo-muted">Zeit</dt>
            <dd className="num text-bo-ink">
              {fmtDay(workday(open.day))}, {hm(open.start)}–{hm(open.start + open.min)} ({dur(open.min)})
            </dd>
            <dt className="text-bo-muted">Preis</dt>
            <dd className="num text-bo-ink">{eur0(open.price)}</dd>
            <dt className="text-bo-muted">Gebucht</dt>
            <dd>
              <Tag tone={open.via === "Online" ? "info" : "neutral"}>{open.via}</Tag>
            </dd>
            <dt className="text-bo-muted">Status</dt>
            <dd>
              <Tag tone={open.status === "da" ? "ok" : open.status === "noshow" ? "bad" : "neutral"}>{open.status === "da" ? "Eingecheckt" : open.status === "noshow" ? "Nicht erschienen" : "Bestätigt"}</Tag>
            </dd>
          </dl>
        )}
      </Sheet>
    </>
  );
}

function Clients() {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(CLIENTS[0].name);
  const list = CLIENTS.filter((c) => c.name.toLowerCase().includes(q.toLowerCase()));
  const c = CLIENTS.find((x) => x.name === sel)!;
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]" data-tour="kunden">
      <Panel
        flush
        title="Kundenkartei"
        aside={
          <label className="flex items-center gap-2 rounded-md border border-bo-line bg-white px-2 focus-within:border-bo-ink">
            <Search className="size-3.5" aria-hidden />
            <span className="sr-only">Kunden suchen</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name suchen" className="min-h-9 w-32 bg-transparent text-[16px] text-bo-ink outline-none sm:text-[13px]" />
          </label>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-[13.5px]">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Besuche</th>
                <th className={th}>Zuletzt</th>
                <th className={cx(th, "text-right")}>Umsatz</th>
              </tr>
            </thead>
            <tbody>
              {list.map((x) => (
                <tr key={x.name} className={cx(tr, "cursor-pointer hover:bg-bo-bg/60", sel === x.name && "bg-d-soft")} onClick={() => setSel(x.name)}>
                  <td className={td}>
                    <button type="button" className="flex items-center gap-2.5 text-left font-medium text-bo-ink" aria-pressed={sel === x.name}>
                      <Avatar name={x.name} size="sm" /> {x.name}
                      {x.regular && <Tag tone="accent">Stamm</Tag>}
                    </button>
                  </td>
                  <td className={cx(td, "num")}>{x.visits}</td>
                  <td className={td}>{x.last}</td>
                  <td className={cx(td, "num text-right text-bo-ink")}>{eur0(x.spent)}</td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr className={tr}>
                  <td colSpan={4} className={cx(td, "py-8 text-center text-bo-muted")}>
                    Niemand mit „{q}“ gefunden.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title={c.name}>
        <dl className="space-y-2 text-[13.5px]">
          <div className="num flex justify-between">
            <dt className="text-bo-muted">Telefon</dt>
            <dd className="text-bo-ink">{c.phone}</dd>
          </div>
          <div className="num flex justify-between">
            <dt className="text-bo-muted">Besuche</dt>
            <dd className="text-bo-ink">{c.visits}</dd>
          </div>
          <div className="num flex justify-between">
            <dt className="text-bo-muted">Ø je Besuch</dt>
            <dd className="text-bo-ink">{eur0(c.spent / c.visits)}</dd>
          </div>
        </dl>
        <h3 className="mt-4 text-[12px] font-semibold text-bo-ink">Interne Notiz</h3>
        <p className="mt-1 rounded-md bg-[#fbf7e6] px-3 py-2 text-[13.5px] leading-relaxed text-bo-ink">{c.note || "Noch keine Notiz."}</p>
        <p className="mt-2 text-[12px] text-bo-muted">Notizen sieht nur das Team, nie die Kundin oder der Kunde.</p>
      </Panel>
    </div>
  );
}

function ServiceEditor({ services, offline, onPrice, onOffline }: { services: Service[]; offline: Record<string, boolean>; onPrice: (id: string, p: number) => void; onOffline: (id: string, v: boolean) => void }) {
  return (
    <Panel flush title="Leistungen und Preise" aside="Änderungen gelten sofort auf der Buchungsseite">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Leistung</th>
              <th className={th}>Bereich</th>
              <th className={th}>Dauer</th>
              <th className={th}>Preis</th>
              <th className={cx(th, "text-right")}>Online buchbar</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className={tr}>
                <td className={cx(td, "font-medium text-bo-ink")}>{s.name}</td>
                <td className={td}>{s.group}</td>
                <td className={cx(td, "num")}>{dur(s.min)}</td>
                <td className={td}>
                  <label className="flex w-24 items-center rounded-md border border-bo-line bg-white focus-within:border-bo-ink">
                    <span className="sr-only">Preis für {s.name}</span>
                    <input type="number" min="0" value={s.price} onChange={(e) => onPrice(s.id, Math.max(0, Number(e.target.value)))} className="num min-h-9 w-full bg-transparent pl-2 text-right text-[16px] text-bo-ink outline-none sm:text-[13.5px]" />
                    <span className="px-2 text-bo-muted">€</span>
                  </label>
                </td>
                <td className={cx(td, "text-right")}>
                  <Toggle checked={!offline[s.id]} onChange={(v) => onOffline(s.id, !v)} label={`${s.name} online buchbar`} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Numbers({ appts }: { appts: Appt[] }) {
  const today = appts.filter((a) => a.day === 0);
  const capacity = (CLOSE - OPEN - 40) * STAFF.length;
  const load = (list: Appt[]) => Math.round((list.reduce((s, a) => s + a.min, 0) / capacity) * 100);
  const week = Array.from({ length: DAYS }, (_, i) => ({ label: weekdayShort(workday(i)), value: appts.filter((a) => a.day === i && a.status !== "noshow").reduce((s, a) => s + a.price, 0) }));
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Termine heute", value: today.length, note: `${today.filter((a) => a.via === "Online").length} davon online gebucht` },
          { label: "Auslastung heute", value: `${load(today)} %`, note: "Ziel: 75 %" },
          { label: "Umsatz diese Woche", value: eur0(week.reduce((s, d) => s + d.value, 0)), note: "gebuchte Termine" },
          { label: "Nicht erschienen", value: "3,1 %", note: "letzte 30 Tage · vorher 8,4 %" },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <Panel title="Gebuchter Umsatz je Tag" aside="laufende Woche">
          <Bars label="Gebuchter Umsatz je Tag" data={week} mark={0} format={(n) => `${n} €`} />
        </Panel>
        <Panel title="Auslastung je Person" aside="heute">
          <Ranks data={STAFF.map((s) => ({ label: s.name, value: Math.round((today.filter((a) => a.staff === s.id).reduce((n, a) => n + a.min, 0) / (CLOSE - OPEN - 40)) * 100) })).sort((a, b) => b.value - a.value)} format={(n) => `${n} %`} />
          <h3 className="mt-5 mb-2 border-t border-bo-line pt-4 text-[13.5px] font-semibold text-bo-ink">So wird gebucht</h3>
          <Ranks
            data={[
              { label: "Online, außerhalb der Öffnungszeit", value: 46 },
              { label: "Online, tagsüber", value: 31 },
              { label: "Telefon", value: 17 },
              { label: "Im Salon", value: 6 },
            ]}
            format={(n) => `${n} %`}
          />
        </Panel>
      </div>
    </div>
  );
}
