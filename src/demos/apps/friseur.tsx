"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, CalendarDays, ChartColumn, Check, ChevronLeft, ChevronRight, Clock, MapPin, Scissors, Search, Users } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Sheet, Tag, td, th, Toggle, tr } from "@/demos/kit/ui";
import { cx, dur, eur0, fmtDay, fmtDayLong, hm, initials, nowMinutes, useOnce, weekdayShort, workday } from "@/demos/kit/util";

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

/* ───────────────────────────── Buchungsseite ─────────────────────────────
   Gestaltung „Kammwerk": streng Schwarz-Weiß wie ein Barber-Magazin. Hanken Grotesk – Display 900 in Versalien,
   Mikro-Etiketten 10.5 px mit 0.22em Sperrung, Ziffern tabellarisch. Alle Fotos in Graustufen, Flächen wechseln
   zwischen Schwarz (#0d0d0d) und Weiß, getrennt durch Haarlinien. Abstände im 4/8er-Raster, Sektionen 48/80. */

const K = {
  wrap: "mx-auto w-full max-w-[76rem] px-4 @dsm:px-6 @dlg:px-8",
  label: "text-[10.5px] leading-none font-bold tracking-[0.22em] uppercase",
  display: "font-d-display font-black tracking-[-0.03em] uppercase",
  grey: "text-[#5f5f5a]",
  photo: "object-cover grayscale contrast-[1.08]",
  btn: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-[13px] font-bold tracking-[0.12em] uppercase transition-colors active:translate-y-px",
};

/** Ein Foto je Bereich – nur Schwarzweiß, passend zur strengen Bildsprache des Salons */
const GROUP_PHOTO: Record<Group, { src: string; alt: string; pos: string; note: string }> = {
  Damen: { src: "/images/demo/photos/f-styling.webp", alt: "Stylistin föhnt einer Kundin die Haare über die Rundbürste", pos: "object-[70%_40%]", note: "Schnitt, Styling, Pflege" },
  Herren: { src: "/images/demo/photos/f-barber.webp", alt: "Barber arbeitet am Kunden im Friseurstuhl", pos: "object-[40%_30%]", note: "Schere, Maschine, Fade" },
  Farbe: { src: "/images/demo/photos/f-color.webp", alt: "Coloristin trägt Farbe mit dem Pinsel auf eine Strähne auf", pos: "object-[55%_45%]", note: "Ansatz, Balayage, Glanz" },
  Bart: { src: "/images/demo/photos/f-beard.webp", alt: "Rasierschaum wird mit dem Pinsel am Bart aufgetragen", pos: "object-[45%_35%]", note: "Trimmen, Konturen, Messer" },
};

function Wordmark({ className }: { className?: string }) {
  return <span className={cx("font-d-display font-black tracking-[0.18em] uppercase", className)}>Kammwerk</span>;
}

function Storefront({ appts, services, onBook, onPatch }: { appts: Appt[]; services: Service[]; onBook: (a: Omit<Appt, "id" | "status" | "via" | "own">) => void; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const { tab, setTab } = useDemo();
  const [preset, setPreset] = useState<string[]>([]);
  return (
    <div className="min-h-[var(--app-h)] bg-white font-plex text-[15px] leading-[1.55] text-[#0d0d0d]">
      <header className="on-dark sticky top-[var(--bar-h)] z-20 border-b border-white/15 bg-[#0d0d0d] text-white">
        <div className={cx(K.wrap, "flex items-center justify-between gap-4")}>
          <p className="flex items-baseline gap-4 py-3">
            <Wordmark className="text-[1.05rem] text-white" />
            <span className={cx("hidden text-white/60 @dmd:inline", K.label)}>Friseur & Barber · Musterstadt</span>
          </p>
          <nav aria-label="Kundenbereich" className="flex">
            {[
              { id: "buchen", label: "Termin buchen", short: "Buchen" },
              { id: "profil", label: "Mein Profil", short: "Profil" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("relative min-h-12 px-3 text-[11.5px] font-bold tracking-[0.16em] uppercase transition-colors @dsm:px-4", tab === n.id ? "text-white" : "text-white/55 hover:text-white")}>
                <span className="@dsm:hidden">{n.short}</span>
                <span className="hidden @dsm:inline">{n.label}</span>
                {tab === n.id && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-white @dsm:inset-x-4" aria-hidden />}
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
      <footer className="on-dark bg-[#0d0d0d] text-white/60">
        <div className={cx(K.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-t border-white/15 py-6", K.label)}>
          <Wordmark className="text-[0.9rem] text-white" />
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-3.5" aria-hidden /> Bahnhofstraße 21, Musterstadt
          </span>
          <span className="num inline-flex items-center gap-2">
            <Clock className="size-3.5" aria-hidden /> Mo – Sa, 9:00 – 18:30
          </span>
        </div>
      </footer>
    </div>
  );
}

function Booking({ appts, services, preset, onBook }: { appts: Appt[]; services: Service[]; preset: string[]; onBook: (a: Omit<Appt, "id" | "status" | "via" | "own">) => void }) {
  const { go, toTop } = useDemo();
  const [picked, setPicked] = useState<string[]>(preset);
  const [who, setWho] = useState("egal");
  // Abends ist heute nichts mehr frei – dann startet die Auswahl mit dem nächsten Werktag
  const [dayIdx, setDayIdx] = useState(() => (nowMinutes() + 60 > CLOSE ? 1 : 0));
  const [slot, setSlot] = useState<{ start: number; staff: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [remind, setRemind] = useState(true);
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ day: number; start: number; staff: string } | null>(null);
  const once = useOnce();

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
  const bad = { name: name.trim().length < 2, phone: phone.trim().length < 6 };
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  if (done) {
    return (
      <div className={cx(K.wrap, "py-12 @dlg:py-20")}>
        <div className="mx-auto max-w-xl">
          <p className={cx(K.label, K.grey)}>Bestätigung · Kammwerk</p>
          <h1 className={cx(K.display, "mt-4 text-[clamp(2.75rem,11cqi,5rem)] leading-[0.86] text-[#0d0d0d]")}>
            Dein Termin
            <br />
            steht.
          </h1>
          <div className="on-dark mt-8 bg-[#0d0d0d] p-6 text-white">
            <p className={cx(K.label, "text-white/60")}>{fmtDayLong(workday(done.day))}</p>
            <p className="num mt-3 font-d-display text-[3.5rem] leading-none font-black tracking-[-0.04em] text-white">{hm(done.start)}</p>
            <p className="mt-3 text-[15px] text-white/80">
              bei {staffName(done.staff)} · <span className="num">{dur(total)}</span>. {remind ? "Am Vortag erinnern wir dich per SMS." : ""}
            </p>
            <dl className="mt-6 border-t border-dashed border-white/30 pt-4 text-[14.5px]">
              {chosen.map((s) => (
                <div key={s.id} className="flex justify-between gap-4 py-1.5">
                  <dt className="min-w-0 break-words">{s.name}</dt>
                  <dd className="num shrink-0 text-white/70">
                    {dur(s.min)} · {eur0(s.price)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mt-6 border border-[#0d0d0d] p-5 text-[14px] leading-snug">
            <strong className="font-bold">So sieht es der Salon:</strong> Der Termin steht jetzt im Kalender von {staffName(done.staff).split(" ")[0]} – und die Zeit ist für alle anderen belegt.
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("betrieb", "kalender")} className={cx(K.btn, "bg-[#0d0d0d] text-white hover:bg-black")}>
                Im Kalender ansehen
              </button>
              <button
                type="button"
                onClick={() => {
                  setDone(null);
                  setPicked([]);
                  setSlot(null);
                }}
                className={cx(K.btn, "border border-[#0d0d0d] text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-white")}
              >
                Weiteren Termin buchen
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stepHead = (n: number, title: string, hint?: string) => (
    <div className="flex items-end justify-between gap-4 border-t-2 border-[#0d0d0d] pt-4">
      <h2 className={cx(K.display, "flex items-baseline gap-3 text-[1.75rem] leading-none text-[#0d0d0d] @dsm:text-[2.25rem]")}>
        <span className="num text-[0.5em] font-bold tracking-[0.1em] text-[#8a8a85]">0{n}</span>
        {title}
      </h2>
      {hint && <span className={cx("hidden shrink-0 pb-1 @dsm:block", K.label, K.grey)}>{hint}</span>}
    </div>
  );
  const locked = (on: boolean) => cx("scroll-mt-[calc(var(--bar-h)+4.5rem)] transition-opacity", on && "pointer-events-none opacity-35");
  const pill = (on: boolean) => cx("border transition-colors", on ? "border-[#0d0d0d] bg-[#0d0d0d] text-white" : "border-[#cfcfca] bg-white text-[#0d0d0d] hover:border-[#0d0d0d]");
  const fieldCls = cx(input, "rounded-none border-[#0d0d0d] text-[#0d0d0d] hover:border-[#0d0d0d] focus:shadow-[inset_0_-2px_0_#0d0d0d]");

  return (
    <>
      <section className="on-dark relative overflow-hidden bg-[#0d0d0d] text-white">
        <Image src="/images/demo/photos/f-hero.webp" alt="Blick in den Salon Kammwerk: Friseurstühle, Spiegel und Regale im gedämpften Licht" fill priority sizes="100vw" className={cx(K.photo, "object-[center_55%] opacity-55")} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/40 to-[#0d0d0d]/70" aria-hidden />
        <div className={cx(K.wrap, "relative flex min-h-[30rem] flex-col justify-between gap-10 pt-6 pb-8 @dlg:min-h-[38rem] @dlg:pb-12")}>
          <p className={cx("flex justify-between gap-4 text-white/70", K.label)}>
            <span>Friseur & Barber</span>
            <span className="hidden @dsm:inline">Musterstadt · Bahnhofstraße 21</span>
            <span>Seit 2013</span>
          </p>
          <div>
            <h1 className={cx(K.display, "-ml-[0.04em] text-[clamp(2.4rem,14.2cqi,11rem)] leading-[0.8] whitespace-nowrap text-white")}>Kammwerk</h1>
            <div className="mt-8 grid gap-8 border-t border-white/25 pt-6 @dmd:grid-cols-[minmax(0,1fr)_auto] @dmd:items-end">
              <div>
                <p className="max-w-md text-[17px] leading-snug text-white/85">Schnitt, Farbe, Bart. Buch deinen Termin in unter einer Minute – rund um die Uhr, ohne Anruf.</p>
                <a href="#kammwerk-leistungen" className={cx(K.btn, "mt-6 bg-white text-[#0d0d0d] hover:bg-[#e9e9e5]")}>
                  Termin buchen <ArrowDown className="size-4" aria-hidden />
                </a>
              </div>
              <dl className="grid grid-cols-3 gap-6 @dmd:gap-10">
                {[
                  ["4,9", "von 5 · 312 Stimmen"],
                  ["3", "Stühle, ein Team"],
                  ["24/7", "online buchbar"],
                ].map(([v, l]) => (
                  <div key={l}>
                    <dd className="num font-d-display text-[2rem] leading-none font-black tracking-[-0.04em] text-white @dsm:text-[2.75rem]">{v}</dd>
                    <dt className={cx("mt-2 leading-snug text-white/65", K.label, "leading-[1.4]")}>{l}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      <div className={cx(K.wrap, "grid gap-10 py-10 @dlg:grid-cols-[minmax(0,1fr)_21rem] @dlg:gap-14 @dlg:py-20")}>
        <div className="min-w-0 space-y-12 @dlg:space-y-16">
          <section id="kammwerk-leistungen" data-tour="services" className="scroll-mt-[calc(var(--bar-h)+4.5rem)]">
            {stepHead(1, "Leistung", "Mehrfachauswahl möglich")}
            <div className="mt-8 space-y-10">
              {GROUPS.map((g) => {
                const list = services.filter((s) => s.group === g);
                if (!list.length) return null;
                const photo = GROUP_PHOTO[g];
                return (
                  <div key={g} className="grid gap-4 @dmd:grid-cols-[13rem_minmax(0,1fr)] @dmd:gap-8">
                    <figure className="relative aspect-[21/9] overflow-hidden bg-[#0d0d0d] @dmd:aspect-[4/5]">
                      <Image src={photo.src} alt={photo.alt} fill sizes="(min-width: 48rem) 13rem, 100vw" className={cx(K.photo, photo.pos)} />
                      <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" aria-hidden />
                      <figcaption className="absolute inset-x-4 bottom-3 text-white">
                        <span className={cx(K.display, "block text-[1.75rem] leading-none")}>{g}</span>
                        <span className={cx("mt-2 block text-white/75", K.label)}>{photo.note}</span>
                      </figcaption>
                    </figure>
                    <ul className="border-t border-[#0d0d0d]">
                      {list.map((s) => {
                        const on = picked.includes(s.id);
                        return (
                          <li key={s.id} className="border-b border-[#d9d9d4]">
                            <button type="button" aria-pressed={on} onClick={() => toggle(s.id)} className={cx("group flex min-h-16 w-full items-center gap-4 px-3 py-3 text-left transition-colors", on ? "bg-[#0d0d0d] text-white" : "hover:bg-[#f4f4f2]")}>
                              <span className={cx("grid size-6 shrink-0 place-items-center border", on ? "border-white bg-white text-[#0d0d0d]" : "border-[#0d0d0d]")} aria-hidden>
                                {on && <Check className="size-4" strokeWidth={3} />}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block text-[16px] leading-tight font-semibold">{s.name}</span>
                                <span className={cx("num mt-1 block", K.label, on ? "text-white/70" : K.grey)}>{dur(s.min)}</span>
                              </span>
                              <span className={cx("hidden h-px flex-1 border-t border-dotted @dsm:block", on ? "border-white/40" : "border-[#b5b5b0]")} aria-hidden />
                              <span className="num shrink-0 font-d-display text-[1.25rem] leading-none font-black tracking-[-0.02em]">{eur0(s.price)}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>

          <section className={locked(!total)} inert={!total}>
            {stepHead(2, "Person", !total ? "Erst Leistung wählen" : undefined)}
            <div className="mt-6 grid grid-cols-2 gap-2 @dmd:grid-cols-4">
              {[{ id: "egal", name: "Egal", role: "nächster freier Termin", groups: GROUPS } as Staff, ...STAFF].map((s) => {
                const ok = s.id === "egal" || able.some((a) => a.id === s.id);
                const on = who === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!ok}
                    aria-pressed={on}
                    onClick={() => {
                      setWho(s.id);
                      setSlot(null);
                    }}
                    className={cx("flex min-h-[7.5rem] flex-col justify-between p-3 text-left disabled:opacity-40", pill(on))}
                  >
                    <span className={cx("num font-d-display text-[1.75rem] leading-none font-black tracking-[-0.03em]", on ? "text-white" : "text-[#0d0d0d]")} aria-hidden>
                      {s.id === "egal" ? "∗" : initials(s.name)}
                    </span>
                    <span>
                      <span className="block text-[15px] leading-tight font-bold">{s.name.split(" ")[0]}</span>
                      <span className={cx("mt-1 block text-[12px] leading-snug", on ? "text-white/70" : K.grey)}>{ok ? s.role : "bietet das nicht an"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section id="kammwerk-zeit" data-tour="slots" className={locked(!total)} inert={!total}>
            {stepHead(3, "Zeit", total ? `Dauer ${dur(total)}` : "Erst Leistung wählen")}
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
                    className={cx("min-h-[4.5rem] w-[4.5rem] shrink-0 text-center", pill(dayIdx === i))}
                  >
                    <span className={cx("block", K.label, "tracking-[0.16em]", dayIdx === i ? "text-white/75" : K.grey)}>{d.toDateString() === new Date().toDateString() ? "Heute" : weekdayShort(d)}</span>
                    <span className="num mt-1.5 block font-d-display text-[1.5rem] leading-none font-black tracking-[-0.03em]">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            {total > 0 &&
              (slots.length ? (
                <div className="mt-6 space-y-5">
                  {[
                    { title: "Vormittag", list: slots.filter((s) => s.start < 12 * 60) },
                    { title: "Nachmittag", list: slots.filter((s) => s.start >= 12 * 60) },
                  ]
                    .filter((p) => p.list.length)
                    .map((p) => (
                      <div key={p.title}>
                        <h3 className={cx(K.label, K.grey)}>{p.title}</h3>
                        <div className="mt-2.5 grid grid-cols-4 gap-1.5 @dsm:grid-cols-6 @dmd:grid-cols-8">
                          {p.list.map((s) => (
                            <button key={s.start} type="button" aria-pressed={slot?.start === s.start} onClick={() => setSlot(s)} className={cx("num min-h-11 text-[14px] font-bold", pill(slot?.start === s.start))}>
                              {hm(s.start)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="mt-6 border border-dashed border-[#8a8a85] px-5 py-6 text-[14px] leading-relaxed text-[#5f5f5a]">An diesem Tag ist für {dur(total)} nichts mehr frei. Wähl einen anderen Tag oder „Egal“ bei der Person.</p>
              ))}
          </section>

          <section id="kammwerk-daten" className={locked(!slot)} inert={!slot}>
            {stepHead(4, "Kontakt", !slot ? "Erst Zeit wählen" : undefined)}
            <form
              noValidate
              className="mt-6 grid gap-4 @dsm:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!slot || bad.name || bad.phone || !once()) return;
                onBook({ staff: slot.staff, day: dayIdx, start: slot.start, min: total, customer: name.trim(), what: chosen.map((s) => s.name).join(" + "), group: chosen[0].group, price });
                setDone({ day: dayIdx, start: slot.start, staff: slot.staff });
                toTop();
              }}
            >
              <Field label="Name" error={tried && bad.name && "Bitte trag deinen Namen ein."}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={tried && bad.name} className={fieldCls} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Handynummer" error={tried && bad.phone && "Bitte gib deine Handynummer an."}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={24} aria-invalid={tried && bad.phone} className={fieldCls} placeholder="0151 2345678" />
              </Field>
              <label className="flex min-h-11 items-center gap-3 text-[14.5px] @dsm:col-span-2">
                <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="size-5 rounded-none accent-[#0d0d0d]" /> Am Vortag per SMS erinnern
              </label>
              <div className="@dsm:col-span-2">
                <button type="submit" className={cx(K.btn, "w-full bg-[#0d0d0d] text-white hover:bg-black @dsm:w-auto")}>
                  Termin verbindlich buchen
                </button>
                <p className={cx("mt-3 text-[12.5px]", K.grey)}>Demo: Es wird nichts gebucht oder gespeichert – erfundene Angaben genügen. Absage bis 24 Stunden vorher kostenlos.</p>
              </div>
            </form>
          </section>
        </div>

        <aside className="@max-dlg:hidden">
          <div className="on-dark sticky top-[calc(var(--bar-h)+4.5rem)] bg-[#0d0d0d] text-white">
            <div className="px-6 pt-6 pb-5">
              <h2 className={cx(K.label, "text-white/60")}>Dein Termin</h2>
              {chosen.length === 0 ? (
                <p className="mt-4 text-[14.5px] leading-relaxed text-white/75">Wähl eine Leistung – Dauer und Preis rechnen wir für dich zusammen.</p>
              ) : (
                <ul className="mt-4 space-y-2.5 text-[14.5px]">
                  {chosen.map((s) => (
                    <li key={s.id} className="flex justify-between gap-3">
                      <span className="min-w-0 break-words">{s.name}</span>
                      <span className="num shrink-0 text-white/70">{eur0(s.price)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {chosen.length > 0 && (
              <>
                <div className="relative border-t border-dashed border-white/35">
                  <span className="absolute -top-2 -left-2 size-4 rounded-full bg-white" aria-hidden />
                  <span className="absolute -top-2 -right-2 size-4 rounded-full bg-white" aria-hidden />
                </div>
                <dl className="num space-y-2 px-6 pt-5 pb-6 text-[14px]">
                  {[
                    ["Dauer", dur(total)],
                    ["Bei", slot ? staffName(slot.staff) : who === "egal" ? "Egal" : staffName(who)],
                    ["Wann", slot ? `${fmtDay(workday(dayIdx))}, ${hm(slot.start)}` : "noch offen"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-3">
                      <dt className={cx("pt-1 text-white/60", K.label)}>{k}</dt>
                      <dd className="text-right">{v}</dd>
                    </div>
                  ))}
                  <div className="flex items-end justify-between gap-3 border-t border-white/20 pt-4">
                    <dt className={cx("pb-1 text-white/60", K.label)}>Preis</dt>
                    <dd className="font-d-display text-[2.25rem] leading-none font-black tracking-[-0.04em] text-white">{eur0(price)}</dd>
                  </div>
                  <p className="pt-1 text-[12px] text-white/60">Bezahlt wird im Salon.</p>
                </dl>
              </>
            )}
          </div>
        </aside>
      </div>

      <section className="on-dark bg-[#0d0d0d] text-white">
        <div className={cx(K.wrap, "grid gap-8 py-12 @dmd:grid-cols-2 @dmd:items-center @dlg:gap-16 @dlg:py-20")}>
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image src="/images/demo/photos/f-wash.webp" alt="Reihe schwarzer Waschliegen am Waschplatz des Salons" fill sizes="(min-width: 48rem) 36rem, 100vw" className={K.photo} />
          </div>
          <div>
            <p className={cx(K.label, "text-white/60")}>Das Haus</p>
            <h2 className={cx(K.display, "mt-4 text-[clamp(2rem,6cqi,3.5rem)] leading-[0.9] text-white")}>
              Handwerk,
              <br />
              kein Fließband.
            </h2>
            <ol className="mt-8 border-t border-white/25">
              {[
                ["Ohne Wartezeit", "Dein Stuhl ist frei, wenn du kommst – die Zeit ist nur für dich geblockt."],
                ["Feste Preise", "Was auf der Karte steht, steht auf der Rechnung. Extras sagen wir vorher an."],
                ["Fair absagen", "Bis 24 Stunden vorher kostenlos, mit einem Tipp in deinem Profil."],
              ].map(([t, x], i) => (
                <li key={t} className="grid grid-cols-[2.5rem_1fr] gap-x-2 border-b border-white/25 py-4">
                  <span className={cx("num pt-1 text-white/55", K.label)}>0{i + 1}</span>
                  <span>
                    <strong className="block text-[16px] font-bold text-white">{t}</strong>
                    <span className="mt-1 block text-[14px] leading-snug text-white/70">{x}</span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Schmale Rahmen: Auswahl als Leiste unten, „Weiter" führt zum nächsten offenen Schritt */}
      {chosen.length > 0 && (
        <div className="sticky bottom-0 z-20 border-t border-white/20 bg-[#0d0d0d] px-4 py-2.5 text-white @dlg:hidden">
          <div className="on-dark flex items-center gap-3">
            <p className="min-w-0 flex-1 leading-tight">
              <span className="num block font-d-display text-[1.375rem] leading-none font-black tracking-[-0.03em]">{eur0(price)}</span>
              <span className="num mt-1 block truncate text-[12px] text-white/70">
                {chosen.length} {chosen.length === 1 ? "Leistung" : "Leistungen"} · {dur(total)}
                {slot && ` · ${hm(slot.start)}`}
              </span>
            </p>
            <button type="button" onClick={() => jump(slot ? "kammwerk-daten" : "kammwerk-zeit")} className={cx(K.btn, "min-h-11 bg-white px-5 text-[#0d0d0d]")}>
              {slot ? "Zu den Daten" : "Zeit wählen"}
            </button>
          </div>
        </div>
      )}
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
  const head = (t: string) => <h2 className={cx("border-t-2 border-[#0d0d0d] pt-4 text-[#0d0d0d]", K.label)}>{t}</h2>;
  return (
    <div data-tour="profil">
      <section className="on-dark bg-[#0d0d0d] text-white">
        <div className={cx(K.wrap, "pt-10 pb-8 @dlg:pt-16 @dlg:pb-12")}>
          <p className={cx(K.label, "text-white/60")}>Angemeldet als Lena Hartmann</p>
          <h1 className={cx(K.display, "mt-4 text-[clamp(2.5rem,13cqi,8rem)] leading-[0.82] whitespace-nowrap text-white")}>Hallo Lena.</h1>
        </div>
      </section>
      <div className={cx(K.wrap, "grid gap-10 py-10 @dlg:grid-cols-[minmax(0,1fr)_21rem] @dlg:gap-14 @dlg:py-16")}>
        <div className="min-w-0">
          {head("Nächster Termin")}
          {next ? (
            <div className="mt-5 grid gap-5 @dsm:grid-cols-[auto_minmax(0,1fr)] @dsm:gap-8">
              <p className="num on-dark grid min-w-[7.5rem] place-items-center self-start bg-[#0d0d0d] px-5 py-5 text-center text-white">
                <span className={cx(K.label, "text-white/65")}>{weekdayShort(workday(next.day))}</span>
                <span className="mt-2 font-d-display text-[3.25rem] leading-none font-black tracking-[-0.04em]">{workday(next.day).getDate()}</span>
                <span className="mt-2 text-[15px] font-bold">{hm(next.start)} Uhr</span>
              </p>
              <div className="min-w-0">
                <p className="text-[1.375rem] leading-tight font-bold text-[#0d0d0d]">{next.what}</p>
                <p className={cx("mt-1.5 text-[14.5px]", K.grey)}>
                  {fmtDayLong(workday(next.day))} · bei {STAFF.find((s) => s.id === next.staff)!.name} ·{" "}
                  <span className="num">
                    {dur(next.min)} · {eur0(next.price)}
                  </span>
                </p>
                {moving ? (
                  <div className="mt-5 border-t border-[#d9d9d4] pt-4">
                    <p className={cx(K.label, K.grey)}>Freie Zeiten bei Mira</p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {options.map((o) => (
                        <button
                          key={`${o.day}-${o.start}`}
                          type="button"
                          onClick={() => {
                            onPatch(900, { day: o.day, start: o.start });
                            setMoving(false);
                            toast("Termin verschoben – im Kalender des Salons steht er jetzt auf der neuen Zeit.");
                          }}
                          className="num min-h-11 border border-[#cfcfca] px-3.5 text-[14px] font-semibold transition-colors hover:border-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-white"
                        >
                          {fmtDay(workday(o.day))}, {hm(o.start)}
                        </button>
                      ))}
                      {options.length === 0 && <p className={cx("text-[14px]", K.grey)}>In den nächsten Tagen ist bei Mira nichts mehr frei.</p>}
                    </div>
                    <button type="button" onClick={() => setMoving(false)} className="mt-2 min-h-11 text-[13px] font-semibold underline underline-offset-4">
                      Doch nicht verschieben
                    </button>
                  </div>
                ) : (
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={() => setMoving(true)} className={cx(K.btn, "min-h-11 bg-[#0d0d0d] px-6 text-white hover:bg-black")}>
                      Verschieben
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onPatch(900, null);
                        toast("Termin abgesagt. Die Zeit ist im Kalender sofort wieder frei.");
                      }}
                      className={cx(K.btn, "min-h-11 border border-[#0d0d0d] px-6 text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-white")}
                    >
                      Absagen
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-5 border border-dashed border-[#8a8a85] px-5 py-7 text-[14.5px] text-[#5f5f5a]">Kein Termin geplant. Buch deinen letzten Besuch einfach nochmal.</p>
          )}

          <div className="mt-12">{head("Bisherige Besuche")}</div>
          <ul className="mt-1">
            {history.map((h, i) => (
              <li key={h.when} className="grid grid-cols-[2.5rem_minmax(0,1fr)] items-center gap-x-2 gap-y-3 border-b border-[#d9d9d4] py-4 @dsm:grid-cols-[2.5rem_minmax(0,1fr)_auto]">
                <span className={cx("num", K.label, K.grey)}>0{i + 1}</span>
                <div className="min-w-0">
                  <p className="text-[16px] leading-tight font-semibold text-[#0d0d0d]">{h.what}</p>
                  <p className={cx("num mt-1 text-[13px]", K.grey)}>
                    {h.when} · bei {h.who} · {eur0(h.price)}
                  </p>
                </div>
                <button type="button" onClick={() => onRebook(h.ids)} className={cx(K.btn, "col-start-2 min-h-11 justify-self-start border border-[#0d0d0d] px-5 text-[11.5px] text-[#0d0d0d] hover:bg-[#0d0d0d] hover:text-white @dsm:col-start-3")}>
                  Nochmal buchen
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="space-y-6">
          <div className="on-dark bg-[#0d0d0d] p-6 text-white">
            <h2 className={cx(K.label, "text-white/60")}>Treuekarte</h2>
            <p className={cx(K.display, "mt-4 text-[1.75rem] leading-[0.95] text-white")}>
              Jeder zehnte Besuch:
              <br />
              20 % auf alles.
            </p>
            <ol className="mt-6 grid grid-cols-5 gap-2" aria-label={`${stamps} von 10 Stempeln`}>
              {Array.from({ length: 10 }, (_, i) => (
                <li key={i} className={cx("grid aspect-square place-items-center rounded-full border text-[11px]", i < stamps ? "border-white bg-white text-[#0d0d0d]" : "border-dashed border-white/45 text-white/60")}>
                  {i < stamps ? <Scissors className="size-4" aria-hidden /> : <span className="num">{i + 1}</span>}
                </li>
              ))}
            </ol>
            <p className="num mt-5 text-[13px] text-white/70">Noch {10 - stamps} Besuche bis zum Rabatt.</p>
          </div>
          <div>
            {head("Meine Angaben")}
            <dl className="mt-1 text-[14.5px]">
              {[
                ["Stammfriseurin", "Mira Albers"],
                ["Erinnerung", "SMS am Vortag"],
                ["Handy", "0151 2345 6701"],
              ].map(([k, v]) => (
                <div key={k} className="num flex justify-between gap-4 border-b border-[#d9d9d4] py-3">
                  <dt className={K.grey}>{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </aside>
      </div>
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
            <span className="num hidden @dsm:inline">
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
                <div key={s.id} className="relative border-l border-bo-line" style={{ height: (CLOSE - OPEN) * PX, backgroundImage: "linear-gradient(to bottom, var(--color-bo-line) 1px, transparent 1px)", backgroundSize: `100% ${60 * PX}px` }}>
                  <div className="absolute inset-x-0 grid place-items-center bg-[repeating-linear-gradient(135deg,var(--color-bo-line)_0_6px,var(--color-bo-bg)_6px_12px)] text-[11px] text-bo-muted" style={{ top: (p0 - OPEN) * PX, height: (p1 - p0) * PX }}>
                    Pause
                  </div>
                  {list
                    .filter((a) => a.staff === s.id)
                    .map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setOpenId(a.id)}
                        className={cx("absolute inset-x-1 overflow-hidden rounded border-l-[3px] px-2 py-0.5 text-left leading-tight transition-shadow hover:shadow-md", a.status === "noshow" ? "border-l-bo-muted bg-[repeating-linear-gradient(135deg,#eceeef_0_5px,#f6f7f8_5px_10px)]" : GROUP_STYLE[a.group], a.own && "animate-demo-flash ring-1 ring-bo-ink")}
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
    <div className="grid gap-4 @dlg:grid-cols-[minmax(0,1fr)_20rem]" data-tour="kunden">
      <Panel
        flush
        title="Kundenkartei"
        aside={
          <label className="flex items-center gap-2 rounded-[var(--bo-rc)] border border-bo-line bg-white px-2 focus-within:border-bo-ink">
            <Search className="size-3.5" aria-hidden />
            <span className="sr-only">Kunden suchen</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name suchen" className="min-h-9 w-32 bg-transparent text-[16px] text-bo-ink outline-none @dsm:text-[13px]" />
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
        <p className="mt-1 rounded-[var(--bo-rc)] bg-[#fbf7e6] px-3 py-2 text-[13.5px] leading-relaxed text-bo-ink">{c.note || "Noch keine Notiz."}</p>
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
                  <label className="flex w-24 items-center rounded-[var(--bo-rc)] border border-bo-line bg-white focus-within:border-bo-ink">
                    <span className="sr-only">Preis für {s.name}</span>
                    <input type="number" min="0" value={s.price} onChange={(e) => onPrice(s.id, Math.max(0, Number(e.target.value)))} className="num min-h-9 w-full bg-transparent pl-2 text-right text-[16px] text-bo-ink outline-none @dsm:text-[13.5px]" />
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
      <div className="grid gap-4 @dlg:grid-cols-[1.3fr_1fr]">
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
