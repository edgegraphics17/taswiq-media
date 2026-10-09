"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowRight, BellRing, CalendarDays, ChartColumn, Check, ChevronLeft, ChevronRight, Clock, Home, MapPin, MessageCircle, Navigation, Phone, Search, Share2, ShieldCheck, SlidersHorizontal, Star, Users } from "lucide-react";
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
   Gestaltung „Studio Malou": Buchungs-App in Creme und Pfirsich mit einem tiefen Braun als einziger Farbe (Urbanist).
   Fotos tragen die Seite: Bereiche als Bildkacheln, Team und Behandlungen als Karten mit Bewertung und Preis.
   Ablauf wie in einer App: Start → Behandlung ansehen → Termin wählen → bestätigt. */

const P = "/images/demo/photos/";
const CAT_PHOTO: Record<Cat, string> = { Gesicht: "m-face", Nägel: "m-nails", "Wimpern & Brauen": "m-lash", Haarentfernung: "m-wax" };
const TREAT_PHOTO: Record<string, string> = { "g-klassik": "m-work4", "g-tief": "m-work3", "g-needle": "m-face", "n-neu": "m-work1", "n-shellac": "m-work1", "w-lift": "m-work2", "w-zupf": "m-work2", "h-lippe": "m-work3" };
const photoOf = (t: Treat) => `${P}${TREAT_PHOTO[t.id] ?? CAT_PHOTO[t.cat]}.webp`;
const TEAM: Record<string, { photo: string; role: string; rating: string; votes: number; pos: string }> = {
  k1: { photo: "m-team1", role: "Inhaberin · Gesicht", rating: "4,9", votes: 84, pos: "object-[center_62%]" },
  k2: { photo: "m-team2", role: "Wimpern, Brauen, Waxing", rating: "4,8", votes: 61, pos: "object-[center_35%]" },
  nt: { photo: "m-team3", role: "Nageldesign", rating: "4,9", votes: 42, pos: "object-top" },
};
/** Bewertung je Behandlung – feste Werte, damit die Karten wie im Betrieb aussehen */
const stars = (t: Treat) => (4.6 + ((t.price * 7) % 4) / 10).toFixed(1).replace(".", ",");
const placeFor = (t: Treat) => PLACES.find((x) => x.cats.includes(t.cat))!;

const M = {
  wrap: "mx-auto w-full max-w-[74rem] px-4 @dsm:px-6 @dlg:px-8",
  soft: "text-[#8b7a74]",
  h2: "text-[1.45rem] leading-tight font-semibold tracking-[-0.02em] text-[#2b1a17] @dsm:text-[1.7rem]",
  card: "rounded-[1.25rem] bg-white shadow-[0_10px_30px_-18px_rgb(74_35_29/0.35)] ring-1 ring-[#f3e6dd]",
  btn: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#4a231d] px-7 text-[15px] font-semibold text-white transition-[filter] hover:brightness-125 active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  chip: "inline-flex min-h-9 items-center rounded-full bg-[#f6ebe4] px-4 text-[13px] font-semibold text-[#4a231d] transition-colors hover:bg-[#efdccf]",
};
const Stars = ({ value, className }: { value: string; className?: string }) => (
  <span className={cx("num inline-flex items-center gap-1 text-[13px] font-semibold text-[#2b1a17]", className)}>
    <Star className="size-3.5 fill-[#f59e0b] text-[#f59e0b]" aria-hidden /> {value}
  </span>
);

function Storefront({ appts, onBook, onPatch }: { appts: Appt[]; onBook: (a: Pick<Appt, "place" | "day" | "start" | "treat" | "customer">) => void; onPatch: (id: number, c: Partial<Appt> | null) => void }) {
  const { tab, setTab, toTop } = useDemo();
  const [openId, setOpenId] = useState("");
  const open = (id: string) => {
    setOpenId(id);
    setTab("buchen");
    toTop();
  };
  return (
    <div className="min-h-[var(--app-h)] bg-[#fdf8f5] font-plex text-[15px] leading-[1.55] text-[#2b1a17]">
      <header className="sticky top-[var(--bar-h)] z-20 bg-[#fbeee6]/95 backdrop-blur">
        <div className={cx(M.wrap, "flex items-center justify-between gap-3 py-2.5")}>
          <button type="button" onClick={() => open("")} className="flex items-center gap-2.5 text-left">
            <span className="grid size-9 place-items-center rounded-full bg-[#4a231d] text-[15px] font-bold text-white" aria-hidden>
              M
            </span>
            <span className="leading-tight">
              <span className="block text-[16px] font-bold tracking-[-0.01em]">Studio Malou</span>
              <span className={cx("hidden text-[12px] @dsm:block", M.soft)}>Kosmetik & Nägel · Musterstadt</span>
            </span>
          </button>
          <nav aria-label="Kundenbereich" className="flex items-center gap-1 rounded-full bg-white/70 p-1">
            {[
              { id: "buchen", label: "Entdecken", icon: Home },
              { id: "termine", label: "Meine Termine", icon: CalendarDays },
            ].map((n) => (
              <button
                key={n.id}
                type="button"
                aria-current={tab === n.id ? "page" : undefined}
                onClick={() => {
                  setOpenId("");
                  setTab(n.id);
                }}
                className={cx("inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-[13.5px] font-semibold whitespace-nowrap transition-colors", tab === n.id ? "bg-[#4a231d] text-white" : "text-[#4a231d] hover:bg-white")}
              >
                <n.icon className="size-4" aria-hidden /> <span className={cx(n.id === "termine" && "@max-dsm:sr-only")}>{n.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "termine" ? <Mine appts={appts} onPatch={onPatch} onRebook={open} /> : openId ? <Detail key={openId} id={openId} appts={appts} onBook={onBook} onBack={() => open("")} /> : <Start onOpen={open} />}
      <footer className="mt-6 bg-[#fbeee6]">
        <div className={cx(M.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[13.5px] text-[#6d5a54]")}>
          <span className="text-[15px] font-bold text-[#2b1a17]">Studio Malou</span>
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

function Start({ onOpen }: { onOpen: (id: string) => void }) {
  const [cat, setCat] = useState<Cat | "">("");
  const [q, setQ] = useState("");
  const list = TREATS.filter((t) => (!cat || t.cat === cat) && t.name.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <section className="bg-[#fbeee6] pb-8">
        <div className={cx(M.wrap, "grid gap-6 pt-4 @dmd:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] @dmd:items-stretch @dlg:pt-8")}>
          <div className="flex flex-col justify-center">
            <p className={cx("text-[14px] font-medium", M.soft)}>Hallo Lena</p>
            <h1 className="mt-1 text-[clamp(2rem,7.5cqi,3.5rem)] leading-[1.02] font-bold tracking-[-0.03em] text-[#2b1a17]">Zeit für deinen nächsten Termin.</h1>
            <p className="mt-3 max-w-md text-[16px] leading-snug text-[#6d5a54]">Gesicht, Nägel, Wimpern. Such dir deine Behandlung aus und buch sie selbst – auch abends um zehn.</p>
            <label className="mt-6 flex items-center gap-2">
              <span className="flex min-h-12 flex-1 items-center gap-2.5 rounded-2xl bg-[#f1ddd0] px-4 focus-within:ring-2 focus-within:ring-[#4a231d]">
                <Search className="size-[18px] text-[#6d5a54]" aria-hidden />
                <span className="sr-only">Behandlung suchen</span>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Behandlung suchen …" className="min-h-12 w-full bg-transparent text-[16px] text-[#2b1a17] outline-none placeholder:text-[#8b7a74]" />
              </span>
              <a href="#malou-liste" aria-label="Zur Liste der Behandlungen" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#4a231d] text-white hover:brightness-125">
                <SlidersHorizontal className="size-5" aria-hidden />
              </a>
            </label>
          </div>
          <div className="relative min-h-56 overflow-hidden rounded-[1.75rem] @dmd:min-h-[21rem]">
            <Image src={`${P}m-hero.webp`} alt="Kosmetikerin trägt im Studio eine Gesichtsmaske mit dem Pinsel auf" fill priority sizes="(min-width: 48rem) 36rem, 100vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2b1a17]/85 via-[#2b1a17]/15 to-transparent" aria-hidden />
            <div className="absolute inset-x-5 bottom-5 flex flex-wrap items-end justify-between gap-3 text-white">
              <p>
                <span className="block text-[13px] font-medium text-white/80">Neu im Studio</span>
                <span className="block text-[1.3rem] leading-tight font-semibold">Microneedling als Kur</span>
              </p>
              <button type="button" onClick={() => onOpen("g-needle")} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-[14px] font-semibold text-[#4a231d] hover:bg-[#fbeee6]">
                Ansehen <ArrowRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className={cx(M.wrap, "space-y-10 py-8 @dlg:space-y-12 @dlg:py-10")}>
        <section data-tour="services">
          <h2 className={M.h2}>Unsere Bereiche</h2>
          <div className="no-bar -mx-4 mt-4 flex gap-3 overflow-x-auto px-4 pb-2 @dsm:mx-0 @dsm:grid @dsm:grid-cols-4 @dsm:overflow-visible @dsm:px-0">
            {CATS.map((c) => {
              const on = cat === c.id;
              return (
                <button key={c.id} type="button" aria-pressed={on} onClick={() => setCat(on ? "" : c.id)} className={cx("w-36 shrink-0 rounded-[1.25rem] p-2 text-left transition-[box-shadow,background-color] @dsm:w-auto", on ? "bg-[#4a231d] text-white shadow-[0_14px_30px_-14px_rgb(74_35_29/0.7)]" : cx(M.card, "hover:shadow-[0_16px_34px_-16px_rgb(74_35_29/0.45)]"))}>
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-[#f6ebe4]">
                    <Image src={`${P}${CAT_PHOTO[c.id]}.webp`} alt="" fill sizes="(min-width: 40rem) 16rem, 9rem" className="object-cover" />
                  </span>
                  <span className="block px-1.5 pt-2.5 pb-1.5">
                    <span className="block text-[15px] leading-tight font-semibold">{c.id}</span>
                    <span className={cx("mt-0.5 block text-[12.5px] leading-snug", on ? "text-white/75" : M.soft)}>{c.note}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="flex items-baseline justify-between gap-4">
            <h2 className={M.h2}>Dein Team</h2>
            <span className={cx("text-[13px] font-medium", M.soft)}>3 Plätze · 4,9 von 5</span>
          </div>
          <div className="mt-4 grid gap-3 @dsm:grid-cols-3">
            {PLACES.map((p) => {
              const t = TEAM[p.id];
              const from = Math.min(...TREATS.filter((x) => p.cats.includes(x.cat)).map((x) => x.price));
              return (
                <article key={p.id} className={cx(M.card, "flex gap-3 p-2 @dsm:block")}>
                  <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f6ebe4] @dsm:aspect-[4/3] @dsm:w-auto">
                    <Image src={`${P}${t.photo}.webp`} alt={`${p.who}, ${t.role}`} fill sizes="(min-width: 40rem) 22rem, 6rem" className={cx("object-cover", t.pos)} />
                  </div>
                  <div className="min-w-0 flex-1 py-1 pr-2 @dsm:px-2 @dsm:pt-3 @dsm:pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate text-[15.5px] font-semibold text-[#2b1a17]">{p.who}</h3>
                      <Stars value={t.rating} />
                    </div>
                    <p className={cx("text-[13px]", M.soft)}>{t.role}</p>
                    <p className="num mt-2 flex items-center justify-between text-[14px]">
                      <span>
                        <strong className="text-[16px] font-semibold">ab {eur0(from)}</strong>
                      </span>
                      <span className={cx("text-[12.5px]", M.soft)}>
                        {p.name} · {t.votes} Stimmen
                      </span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section id="malou-liste" data-tour="beliebt" className="scroll-mt-[calc(var(--bar-h)+4.5rem)]">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
            <h2 className={M.h2}>
              {cat || "Beliebte Behandlungen"} <span className={cx("num text-[0.7em] font-medium", M.soft)}>({list.length})</span>
            </h2>
            {(cat || q) && (
              <button type="button" onClick={() => (setCat(""), setQ(""))} className={M.chip}>
                Alle zeigen
              </button>
            )}
          </div>
          <ul className="mt-4 grid gap-3 @dmd:grid-cols-2 @dxl:grid-cols-3">
            {list.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => onOpen(t.id)} className={cx(M.card, "group flex w-full items-stretch gap-3.5 p-2 text-left transition-shadow hover:shadow-[0_18px_36px_-18px_rgb(74_35_29/0.5)]")}>
                  <span className="relative block w-28 shrink-0 overflow-hidden rounded-2xl bg-[#f6ebe4] @dsm:w-32">
                    <Image src={photoOf(t)} alt="" fill sizes="8rem" className="object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col py-1.5 pr-2">
                    <span className="flex items-center justify-between gap-2">
                      <Stars value={stars(t)} />
                      <span className={cx("num inline-flex items-center gap-1 text-[12px]", M.soft)}>
                        <Clock className="size-3.5" aria-hidden /> {dur(t.min)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[16px] leading-tight font-semibold text-[#2b1a17]">{t.name}</span>
                    <span className={cx("block text-[12.5px]", M.soft)}>bei {placeFor(t).who.split(" ")[0]}</span>
                    <span className="mt-auto flex items-end justify-between gap-2 pt-2">
                      <span className="num text-[18px] leading-none font-bold text-[#2b1a17]">{eur0(t.price)}</span>
                      <span className="inline-flex min-h-8 items-center rounded-full bg-[#f6ebe4] px-3.5 text-[12.5px] font-semibold text-[#4a231d] transition-colors group-hover:bg-[#4a231d] group-hover:text-white">Buchen</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 && <p className={cx("mt-4 rounded-[1.25rem] border border-dashed border-[#e3cfc2] px-5 py-8 text-center text-[14.5px]", M.soft)}>Dazu haben wir nichts gefunden. Probier einen anderen Begriff.</p>}
        </section>
      </div>
    </>
  );
}

function Detail({ id, appts, onBook, onBack }: { id: string; appts: Appt[]; onBook: (a: Pick<Appt, "place" | "day" | "start" | "treat" | "customer">) => void; onBack: () => void }) {
  const { go, toast, toTop } = useDemo();
  const t = treat(id);
  const p = placeFor(t);
  const [pane, setPane] = useState<"ueber" | "ablauf" | "stimmen">("ueber");
  const [dayIdx, setDayIdx] = useState(() => (nowMinutes() + 90 > CLOSE ? 1 : 0));
  const [slot, setSlot] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<{ day: number; start: number } | null>(null);
  const once = useOnce();
  const slots = useMemo(() => {
    const out: number[] = [];
    for (let s = OPEN; s + t.min <= CLOSE; s += 15) if (free(appts, p, dayIdx, s, t.min)) out.push(s);
    return out;
  }, [appts, t, p, dayIdx]);
  const bad = { name: name.trim().length < 2, phone: phone.trim().length < 6 };
  const pick = (on: boolean) => cx("transition-colors", on ? "bg-[#4a231d] text-white" : "bg-white text-[#2b1a17] ring-1 ring-[#ecdcd1] hover:ring-[#4a231d]");
  const fieldCls = cx(input, "rounded-xl border-[#e3cfc2] bg-white focus:border-[#4a231d]");

  if (done) {
    return (
      <div className={cx(M.wrap, "py-10 @dlg:py-16")}>
        <div className="mx-auto max-w-xl">
          <div className={cx(M.card, "overflow-hidden")}>
            <div className="relative h-40">
              <Image src={photoOf(t)} alt="" fill sizes="36rem" className="object-cover" />
              <div className="absolute inset-0 bg-[#2b1a17]/55" aria-hidden />
              <p className="absolute inset-x-6 bottom-5 text-white">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[12.5px] font-semibold backdrop-blur">
                  <Check className="size-3.5" strokeWidth={3} aria-hidden /> Termin bestätigt
                </span>
                <span className="mt-2 block text-[1.6rem] leading-tight font-bold">Wir freuen uns auf dich.</span>
              </p>
            </div>
            <div className="p-6">
              <p className={cx("text-[13px] font-medium", M.soft)}>{fmtDayLong(workday(done.day))}</p>
              <p className="num text-[3rem] leading-none font-bold tracking-[-0.03em]">{hm(done.start)}</p>
              <p className="mt-2 text-[15px]">
                {t.name} · <span className="num">{dur(t.min)}</span> · {p.name} bei {p.who.split(" ")[0]}
              </p>
              <dl className="num mt-5 space-y-1.5 border-t border-dashed border-[#e3cfc2] pt-4 text-[14.5px]">
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
          </div>
          <div className="mt-4 rounded-[1.25rem] bg-[#fbeee6] p-5 text-[14.5px] leading-snug">
            <strong className="font-semibold">So sieht es das Studio:</strong> Dein Termin steht jetzt am Platz „{p.name}“ im Kalender – mit dem Vermerk, dass die Anzahlung da ist.
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("betrieb", "kalender")} className={M.btn}>
                Im Kalender ansehen
              </button>
              <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center rounded-full bg-white px-6 text-[15px] font-semibold text-[#4a231d] ring-1 ring-[#e3cfc2] hover:ring-[#4a231d]">
                Weitere Behandlung
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-[#fbeee6]">
        <div className={cx(M.wrap, "grid gap-5 pt-3 @dmd:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] @dmd:items-end")}>
          <div className="pb-2 @dmd:pb-10">
            <button type="button" onClick={onBack} className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-[14.5px] font-medium text-[#6d5a54] hover:text-[#2b1a17]">
              <ChevronLeft className="size-5" aria-hidden /> Zurück
            </button>
            <p className="mt-5 flex items-center gap-3">
              <Stars value={stars(t)} className="text-[14px]" />
              <span className={cx("text-[13px]", M.soft)}>{t.cat}</span>
            </p>
            <h1 className="mt-1.5 text-[clamp(1.9rem,6.5cqi,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-[#2b1a17]">{t.name}</h1>
            <p className={cx("mt-1 text-[14.5px]", M.soft)}>
              bei {p.who} · {p.name}
            </p>
            <p className="num mt-4 flex items-baseline gap-1.5">
              <span className="text-[2rem] leading-none font-bold tracking-[-0.02em]">{eur0(t.price)}</span>
              <span className={cx("text-[14px]", M.soft)}>/ {dur(t.min)}</span>
            </p>
          </div>
          <div className="relative h-52 overflow-hidden rounded-t-[1.75rem] @dmd:h-72">
            <Image src={photoOf(t)} alt={`${t.name} im Studio Malou`} fill priority sizes="(min-width: 48rem) 32rem, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      <div className={cx(M.wrap, "grid gap-8 py-6 @dlg:grid-cols-[minmax(0,1fr)_24rem] @dlg:gap-10 @dlg:py-8")}>
        <div className="min-w-0 space-y-7">
          <div className="grid grid-cols-4 gap-2.5">
            {[
              { icon: Phone, label: "Anrufen", msg: "Im Betrieb startet hier der Anruf im Studio." },
              { icon: MessageCircle, label: "Nachricht", msg: "Im Betrieb öffnet sich hier der Chat mit dem Studio." },
              { icon: Navigation, label: "Route", msg: "Im Betrieb öffnet sich hier die Karten-App mit der Route." },
              { icon: Share2, label: "Teilen", msg: "Link zur Behandlung kopiert." },
            ].map((a) => (
              <button key={a.label} type="button" onClick={() => toast(a.msg)} className={cx(M.card, "flex min-h-[4.75rem] flex-col items-center justify-center gap-1.5 text-[13px] font-medium text-[#2b1a17] hover:bg-[#fdf3ec]")}>
                <a.icon className="size-5 text-[#4a231d]" aria-hidden /> {a.label}
              </button>
            ))}
          </div>

          <div>
            <div role="tablist" aria-label="Infos zur Behandlung" className="grid grid-cols-3 rounded-full bg-[#f6ebe4] p-1 text-[13.5px] font-semibold">
              {(
                [
                  ["ueber", "Über"],
                  ["ablauf", "Ablauf"],
                  ["stimmen", "Bewertungen"],
                ] as const
              ).map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={pane === k} onClick={() => setPane(k)} className={cx("min-h-10 rounded-full transition-colors", pane === k ? "bg-white text-[#2b1a17] shadow-sm" : "text-[#6d5a54] hover:text-[#2b1a17]")}>
                  {l}
                </button>
              ))}
            </div>
            <div className="mt-4 text-[15px] leading-relaxed text-[#5b4944]">
              {pane === "ueber" && (
                <p>
                  {t.note ? `${t.note}. ` : ""}
                  {p.who.split(" ")[0]} nimmt sich {dur(t.min)} Zeit nur für dich – am Platz „{p.name}“, ohne dass nebenbei das Telefon klingelt. Alle Produkte sind dermatologisch getestet; Unverträglichkeiten notieren wir in deiner Kartei.
                </p>
              )}
              {pane === "ablauf" && (
                <ol className="space-y-2.5">
                  {["Kurzes Gespräch: Wünsche, Hautbild, Verträglichkeit", "Die Behandlung – in Ruhe und ohne Zeitdruck", `Pflege-Tipps für zu Hause${t.refill ? ` und Folgetermin in ${t.refill} Wochen` : ""}`].map((x, i) => (
                    <li key={x} className="flex gap-3">
                      <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-[#4a231d] text-[12px] font-bold text-white">{i + 1}</span> {x}
                    </li>
                  ))}
                </ol>
              )}
              {pane === "stimmen" && (
                <ul className="space-y-3">
                  {[
                    ["Petra L.", "Sehr sorgfältig, nichts wirkt gehetzt. Online gebucht, hat alles geklappt."],
                    ["Dilara A.", "Endlich kein Hin und Her per Nachricht mehr. Termin in einer Minute gebucht."],
                  ].map(([n, x]) => (
                    <li key={n} className={cx(M.card, "p-4")}>
                      <span className="flex items-center justify-between">
                        <strong className="text-[14.5px] font-semibold text-[#2b1a17]">{n}</strong> <Stars value="5,0" />
                      </span>
                      <span className="mt-1 block text-[14px]">{x}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <section>
            <h2 className={M.h2}>Aus dem Studio</h2>
            <div className="mt-3 grid grid-cols-4 gap-2.5">
              {["m-work1", "m-work2", "m-work3", "m-studio"].map((s) => (
                <div key={s} className="relative aspect-square overflow-hidden rounded-2xl bg-[#f6ebe4]">
                  <Image src={`${P}${s}.webp`} alt="" fill sizes="(min-width: 64rem) 10rem, 25vw" className="object-cover" />
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside>
          <form
            noValidate
            data-tour="slots"
            className={cx(M.card, "sticky top-[calc(var(--bar-h)+4.5rem)] space-y-5 p-5")}
            onSubmit={(e) => {
              e.preventDefault();
              setTried(true);
              if (slot === null || bad.name || bad.phone || !once()) return;
              onBook({ place: p.id, day: dayIdx, start: slot, treat: t.id, customer: name.trim() });
              setDone({ day: dayIdx, start: slot });
              toTop();
            }}
          >
            <div>
              <h2 className="text-[17px] font-semibold text-[#2b1a17]">Termin wählen</h2>
              <p className={cx("text-[13px]", M.soft)}>Nur Zeiten, in denen „{p.name}“ wirklich frei ist.</p>
            </div>
            <div className="no-bar -mx-5 flex gap-2 overflow-x-auto px-5">
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
                    className={cx("min-h-16 w-14 shrink-0 rounded-2xl text-center", pick(dayIdx === i))}
                  >
                    <span className={cx("block text-[11.5px] font-medium", dayIdx === i ? "text-white/80" : M.soft)}>{d.toDateString() === new Date().toDateString() ? "Heute" : weekdayShort(d)}</span>
                    <span className="num block text-[1.2rem] leading-tight font-bold">{d.getDate()}</span>
                  </button>
                );
              })}
            </div>
            {slots.length ? (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cx("num min-h-11 rounded-full text-[13.5px] font-semibold", pick(slot === s))}>
                    {hm(s)}
                  </button>
                ))}
              </div>
            ) : (
              <p className={cx("rounded-2xl border border-dashed border-[#e3cfc2] px-4 py-5 text-[13.5px]", M.soft)}>An diesem Tag ist „{p.name}“ ausgebucht. Wähl einen anderen Tag.</p>
            )}
            <div className={cx("space-y-3 transition-opacity", slot === null && "pointer-events-none opacity-40")} inert={slot === null}>
              <Field label="Name" error={tried && bad.name && "Bitte trag deinen Namen ein."}>
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={tried && bad.name} className={fieldCls} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Handynummer" error={tried && bad.phone && "Bitte gib deine Handynummer an."}>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={24} aria-invalid={tried && bad.phone} className={fieldCls} placeholder="0151 2345678" />
              </Field>
              <p className="flex items-start gap-2.5 rounded-2xl bg-[#fbeee6] px-3.5 py-3 text-[13px] leading-snug text-[#5b4944]">
                <ShieldCheck className="mt-0.5 size-[18px] shrink-0 text-[#4a231d]" aria-hidden />
                <span>
                  <strong className="font-semibold text-[#2b1a17]">Anzahlung {eur0(DEPOSIT)}.</strong> Wird verrechnet. Absagen bis 24 Stunden vorher sind kostenlos.
                </span>
              </p>
            </div>
            <button type="submit" disabled={slot === null} className={cx(M.btn, "w-full")}>
              {slot === null ? "Uhrzeit wählen" : `Termin buchen · ${fmtDay(workday(dayIdx))}, ${hm(slot)}`}
            </button>
            <p className={cx("text-center text-[12px]", M.soft)}>Demo: Es wird nichts gebucht oder abgebucht.</p>
          </form>
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
    <>
      <section className="bg-[#fbeee6] pb-7">
        <div className={cx(M.wrap, "pt-4 @dlg:pt-8")}>
          <p className={cx("text-[14px] font-medium", M.soft)}>Hallo Lena</p>
          <h1 className="mt-1 text-[clamp(1.9rem,6.5cqi,3rem)] leading-[1.05] font-bold tracking-[-0.03em] text-[#2b1a17]">Deine Termine</h1>
        </div>
      </section>
      <div className={cx(M.wrap, "grid gap-6 py-6 @dlg:grid-cols-[minmax(0,1fr)_22rem] @dlg:py-8")}>
        <div className="min-w-0 space-y-3">
          {mine.map((a) => {
            const t = treat(a.treat);
            return (
              <article key={a.id} className={cx(M.card, "flex items-stretch gap-3.5 p-2")}>
                <div className="relative w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f6ebe4] @dsm:w-32">
                  <Image src={photoOf(t)} alt="" fill sizes="8rem" className="object-cover" />
                </div>
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-2 py-2 pr-2">
                  <div className="min-w-0 flex-1">
                    <p className={cx("num text-[12.5px] font-medium", M.soft)}>
                      {fmtDay(workday(a.day))} · {hm(a.start)} Uhr
                    </p>
                    <h2 className="text-[16px] leading-tight font-semibold text-[#2b1a17]">{t.name}</h2>
                    <p className={cx("num text-[13px]", M.soft)}>
                      {dur(t.min)} · {place(a.place).name} bei {place(a.place).who.split(" ")[0]}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onPatch(a.id, null);
                      toast("Termin abgesagt – der Platz ist sofort wieder buchbar, die Anzahlung geht zurück.");
                    }}
                    className={M.chip}
                  >
                    Absagen
                  </button>
                </div>
              </article>
            );
          })}
          {mine.length === 0 && <p className={cx("rounded-[1.25rem] border border-dashed border-[#e3cfc2] px-5 py-8 text-center text-[14.5px]", M.soft)}>Kein Termin geplant. Zeit für den nächsten?</p>}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[1.25rem] bg-[#4a231d] p-5 text-white" data-tour="karte">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
              <BellRing className="size-5" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[16px] leading-tight font-semibold">Auffüllen in etwa vier Wochen fällig</p>
              <p className="mt-1 text-[13.5px] text-white/75">Wir erinnern dich rechtzeitig – oder du sicherst dir den Termin gleich.</p>
            </div>
            <button type="button" onClick={() => onRebook("n-auf")} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-[14px] font-semibold text-[#4a231d] hover:bg-[#fbeee6]">
              Folgetermin buchen
            </button>
          </div>
        </div>
        <aside className="space-y-3">
          <div className={cx(M.card, "p-5")}>
            <h2 className={cx("text-[13px] font-medium", M.soft)}>Treuekarte</h2>
            <p className="mt-1 text-[1.2rem] leading-tight font-semibold text-[#2b1a17]">Noch drei Besuche bis zur Gratis-Maniküre</p>
            <ol className="mt-4 grid grid-cols-5 gap-2" aria-label={`${stamps} von 10 Stempeln`}>
              {Array.from({ length: 10 }, (_, i) => (
                <li key={i} className={cx("grid aspect-square place-items-center rounded-full", i < stamps ? "bg-[#4a231d] text-white" : "border border-dashed border-[#d9c2b4]")}>
                  {i < stamps && <Check className="size-4" strokeWidth={3} aria-hidden />}
                </li>
              ))}
            </ol>
          </div>
          <div className={cx(M.card, "p-5")}>
            <h2 className={cx("text-[13px] font-medium", M.soft)}>Gutschein-Guthaben</h2>
            <p className="num mt-1 text-[2.25rem] leading-none font-bold tracking-[-0.02em] text-[#2b1a17]">25 €</p>
            <p className={cx("mt-2 text-[13.5px]", M.soft)}>Wird beim nächsten Besuch automatisch angerechnet.</p>
          </div>
        </aside>
      </div>
    </>
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
