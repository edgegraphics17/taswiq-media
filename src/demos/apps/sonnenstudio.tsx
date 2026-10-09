"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ArrowDown, BellRing, ChartColumn, Check, Clock, LayoutGrid, MapPin, Minus, Plus, ShieldCheck, Sun, Users, Wallet, Wrench } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Empty, Figures, Panel, Ranks, Tag, td, th, Toggle, tr } from "@/demos/kit/ui";
import { cx, eur, eur0, hm, nowMinutes, useOnce } from "@/demos/kit/util";

/**
 * Demo "Sonnendeck": Kabinen live reservieren und mit Guthaben zahlen + Dashboard mit Kabinen-Board.
 * Die Belegung wird aus den Sonnungen des Tages berechnet: Eine Reservierung vorne belegt die Kabine hinten.
 * Schutzregeln sind eingebaut – Höchstdauer nach Hauttyp und 48 Stunden Pause zwischen zwei Sonnungen.
 */

interface Cabin {
  id: number;
  device: string;
  kind: "Liegen" | "Stehen" | "Ohne UV";
  /** Stärke der Röhren: 1 sanft, 3 intensiv */
  level: 1 | 2 | 3;
  perMin: number;
  tubeHours: number;
  tubeMax: number;
}
const CABINS: Cabin[] = [
  { id: 1, device: "Classic 300", kind: "Liegen", level: 1, perMin: 0.6, tubeHours: 412, tubeMax: 800 },
  { id: 2, device: "Classic 300", kind: "Liegen", level: 1, perMin: 0.6, tubeHours: 388, tubeMax: 800 },
  { id: 3, device: "Intensiv 500", kind: "Liegen", level: 2, perMin: 0.85, tubeHours: 762, tubeMax: 800 },
  { id: 4, device: "Intensiv 500 Plus", kind: "Liegen", level: 3, perMin: 0.95, tubeHours: 120, tubeMax: 800 },
  { id: 5, device: "Stehkabine V8", kind: "Stehen", level: 2, perMin: 0.8, tubeHours: 540, tubeMax: 1000 },
  { id: 6, device: "Kollagen-Licht", kind: "Ohne UV", level: 1, perMin: 0.7, tubeHours: 260, tubeMax: 1000 },
];
const OPEN = 9 * 60;
const CLOSE = 21 * 60;
/** Reinigungszeit nach jeder Sonnung */
const CLEAN = 4;
/** Demo-Konto: Hauttyp III */
const ME = { name: "Lena Hartmann", skin: "III", best: 14, max: 18, year: 17 };
/** Uhrzeit der Demo: nachts und frühmorgens zeigt das Board einen Nachmittag, damit Betrieb zu sehen ist */
const clockNow = () => {
  const n = nowMinutes();
  return n < 10 * 60 || n > 20 * 60 ? 16 * 60 + 20 : n;
};

interface Session {
  id: number;
  cabin: number;
  start: number;
  min: number;
  customer: string;
  pay: "Guthaben" | "Abo" | "Bar";
  own?: boolean;
}
const NAMES = ["Tobias Kern", "Melanie Vogt", "Dennis Arslan", "Carina Wolf", "Sven Hartung", "Jasmin Öztürk", "Patrick Lenz", "Nadja Ilić", "Kevin Maier", "Sarah Brandt", "Oliver Pohl", "Ramona Geiger", "Marcel Dietz", "Elena Sokolova", "Timo Krause", "Vanessa Heil"];

/** Sonnungen des Tages je Kabine: feste Folge aus Dauer und Leerlauf, damit die Demo jeden Tag gleich belebt ist */
function seedSessions(): Session[] {
  const lengths = [12, 15, 10, 18, 14, 16];
  const gaps = [9, 26, 7, 41, 15, 22, 11];
  const out: Session[] = [];
  let id = 1;
  for (const c of CABINS) {
    let t = OPEN + c.id * 7;
    let i = c.id;
    while (t + 20 < CLOSE) {
      const min = lengths[i % lengths.length];
      out.push({ id: id++, cabin: c.id, start: t, min, customer: NAMES[(i * 3 + c.id) % NAMES.length], pay: i % 3 === 0 ? "Abo" : i % 5 === 0 ? "Bar" : "Guthaben" });
      t += min + CLEAN + gaps[(i + c.id) % gaps.length];
      i++;
    }
  }
  return out;
}

type State = { kind: "frei" } | { kind: "belegt"; s: Session; left: number } | { kind: "reinigung"; left: number } | { kind: "gesperrt" };
function stateOf(cabin: number, sessions: Session[], locked: boolean, now: number): State {
  if (locked) return { kind: "gesperrt" };
  for (const s of sessions) {
    if (s.cabin !== cabin) continue;
    if (now >= s.start && now < s.start + s.min) return { kind: "belegt", s, left: s.start + s.min - now };
    if (now >= s.start + s.min && now < s.start + s.min + CLEAN) return { kind: "reinigung", left: s.start + s.min + CLEAN - now };
  }
  return { kind: "frei" };
}
const isFree = (cabin: number, sessions: Session[], start: number, min: number) => start + min <= CLOSE && !sessions.some((s) => s.cabin === cabin && start < s.start + s.min + CLEAN && start + min + CLEAN > s.start);

export default function SonnenstudioDemo() {
  const { view } = useDemo();
  const [sessions, setSessions] = useState<Session[]>(seedSessions);
  const [locked, setLocked] = useState<Record<number, boolean>>({});
  const [balance, setBalance] = useState(34.5);
  const now = clockNow();
  const add = (s: Omit<Session, "id">) => setSessions((p) => [...p, { ...s, id: Date.now() }]);
  const cancel = (id: number, refund: number) => {
    setSessions((p) => p.filter((s) => s.id !== id));
    setBalance((b) => b + refund);
  };
  return view === "kunde" ? (
    <Storefront sessions={sessions} locked={locked} now={now} balance={balance} onPay={(n) => setBalance((b) => b - n)} onTopUp={(n) => setBalance((b) => b + n)} onAdd={add} onCancel={cancel} />
  ) : (
    <Dashboard sessions={sessions} locked={locked} now={now} onLock={(id, v) => setLocked((l) => ({ ...l, [id]: v }))} onAdd={add} />
  );
}

/* ───────────────────────────── Kundenseite ─────────────────────────────
   Gestaltung „Sonnendeck": warmes Braun-Schwarz mit Gold, dazwischen helle, cremefarbene Abschnitte (Urbanist).
   Verwandt mit der Beauty-Seite – Fotos, weiche Karten, Pillen –, nur abendlicher. Die Kabinen stehen auf Hell,
   damit Status und Preis auf einen Blick lesbar sind. */

const P = "/images/demo/photos/";
const S = {
  wrap: "mx-auto w-full max-w-[74rem] px-4 @dsm:px-6 @dlg:px-8",
  dim: "text-[#b8a593]",
  soft: "text-[#7b6a5b]",
  h2: "text-[1.6rem] leading-[1.08] font-bold tracking-[-0.025em] @dsm:text-[2.1rem]",
  card: "rounded-[1.25rem] bg-white shadow-[0_12px_32px_-20px_rgb(42_28_18/0.45)] ring-1 ring-[#efe2d2]",
  dark: "rounded-[1.25rem] bg-[#241a13] ring-1 ring-[#3a2c21]",
  gold: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#edc477] to-[#d9a54a] px-7 text-[15px] font-bold text-[#231509] transition-[filter] hover:brightness-105 active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  brown: "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2a1c12] px-7 text-[15px] font-bold text-[#f3d9a4] transition-[filter] hover:brightness-125 active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
};
const Level = ({ n }: { n: number }) => (
  <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Stärke ${n} von 3`}>
    {[1, 2, 3].map((i) => (
      <Sun key={i} className={cx("size-3.5", i <= n ? "text-[#d9a54a]" : "text-[#e3d5c4]")} aria-hidden />
    ))}
  </span>
);

type StoreProps = { sessions: Session[]; locked: Record<number, boolean>; now: number; balance: number; onPay: (n: number) => void; onTopUp: (n: number) => void; onAdd: (s: Omit<Session, "id">) => void; onCancel: (id: number, refund: number) => void };

function Storefront(props: StoreProps) {
  const { tab, setTab } = useDemo();
  return (
    <div className="min-h-[var(--app-h)] bg-[#f7efe4] font-plex text-[15px] leading-[1.55] text-[#2a1c12]">
      <header className="on-dark sticky top-[var(--bar-h)] z-20 bg-[#17110d]/95 text-[#f7efe4] backdrop-blur">
        <div className={cx(S.wrap, "flex items-center justify-between gap-3 py-2.5")}>
          <p className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-b from-[#edc477] to-[#d9a54a] text-[#231509]" aria-hidden>
              <Sun className="size-[18px]" strokeWidth={2.5} />
            </span>
            <span className="leading-tight">
              <span className="block text-[16px] font-bold tracking-[-0.01em]">Sonnendeck</span>
              <span className={cx("hidden text-[12px] @dsm:block", S.dim)}>Sonnenstudio · Musterstadt</span>
            </span>
          </p>
          <nav aria-label="Kundenbereich" className="flex items-center gap-1 rounded-full bg-white/10 p-1">
            {[
              { id: "kabinen", label: "Kabinen" },
              { id: "konto", label: "Mein Konto" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-10 rounded-full px-4 text-[13.5px] font-semibold whitespace-nowrap transition-colors", tab === n.id ? "bg-[#e2b25c] text-[#231509]" : "text-[#f7efe4] hover:bg-white/10")}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "konto" ? <Account {...props} /> : <Cabins {...props} />}
      <footer className="on-dark bg-[#17110d]">
        <div className={cx(S.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[13.5px]", S.dim)}>
          <span className="text-[15px] font-bold text-[#f7efe4]">Sonnendeck</span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="size-4" aria-hidden /> Marktstraße 12, Musterstadt
          </span>
          <span className="num inline-flex items-center gap-2">
            <Clock className="size-4" aria-hidden /> täglich 9:00 – 21:00
          </span>
          <span>Zutritt ab 18 Jahren</span>
        </div>
      </footer>
    </div>
  );
}

function Cabins({ sessions, locked, now, balance, onPay, onAdd }: StoreProps) {
  const { go, setTab, toTop } = useDemo();
  const [cabinId, setCabinId] = useState<number | null>(null);
  const [min, setMin] = useState(ME.best);
  const [start, setStart] = useState<number | null>(null);
  const [done, setDone] = useState<Session | null>(null);
  const once = useOnce();

  const mine = sessions.find((s) => s.own);
  const cabin = CABINS.find((c) => c.id === cabinId);
  const price = cabin ? Math.round(cabin.perMin * min * 100) / 100 : 0;
  const starts = useMemo(() => {
    if (!cabin) return [];
    const out: number[] = [];
    for (let t = Math.ceil((now + 3) / 5) * 5; out.length < 8 && t + min <= CLOSE; t += 5) if (isFree(cabin.id, sessions, t, min)) out.push(t);
    return out;
  }, [cabin, sessions, now, min]);
  const freeNow = CABINS.filter((c) => stateOf(c.id, sessions, !!locked[c.id], now).kind === "frei").length;

  if (done) {
    const c = CABINS.find((x) => x.id === done.cabin)!;
    return (
      <div className="on-dark bg-[#17110d] text-[#f7efe4]">
        <div className={cx(S.wrap, "py-10 @dlg:py-16")}>
          <div className="mx-auto max-w-xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e2b25c]/15 px-3 py-1 text-[12.5px] font-semibold text-[#e2b25c]">
              <Check className="size-3.5" strokeWidth={3} aria-hidden /> Reserviert und bezahlt
            </span>
            <h1 className="mt-4 text-[clamp(2.25rem,9cqi,3.75rem)] leading-[1] font-bold tracking-[-0.03em] text-[#f7efe4]">
              Kabine {c.id} wartet <span className="text-[#e2b25c]">auf dich.</span>
            </h1>
            <div className={cx(S.dark, "mt-7 p-6")}>
              <p className={cx("text-[13px] font-medium", S.dim)}>Heute · {c.device}</p>
              <p className="num text-[3.25rem] leading-none font-bold tracking-[-0.03em]">{hm(done.start)}</p>
              <p className="num mt-2">
                {done.min} Minuten · {eur(c.perMin * done.min)} vom Guthaben abgebucht
              </p>
              <p className={cx("mt-4 border-t border-dashed border-[#4a3a2c] pt-4 text-[14px]", S.dim)}>Die Kabine bleibt zehn Minuten für dich frei. Am Empfang nennst du nur deinen Namen – die Zeit ist am Gerät schon eingestellt.</p>
            </div>
            <div className="mt-4 rounded-[1.25rem] bg-[#f7efe4] p-5 text-[14.5px] leading-snug text-[#2a1c12]">
              <strong className="font-bold">So sieht es das Studio:</strong> Deine Reservierung steht im Kabinen-Board, der Umsatz ist schon gebucht.
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => go("betrieb", "live")} className={S.brown}>
                  Im Kabinen-Board ansehen
                </button>
                <button type="button" onClick={() => setTab("konto")} className="inline-flex min-h-12 items-center rounded-full px-6 text-[15px] font-bold text-[#2a1c12] ring-1 ring-[#d9c4a8] hover:ring-[#2a1c12]">
                  Zu meinem Konto
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="on-dark bg-[#17110d] text-[#f7efe4]">
        <div className={cx(S.wrap, "grid gap-7 pt-5 pb-10 @dmd:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] @dmd:items-center @dlg:pt-10 @dlg:pb-14")}>
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[12.5px] font-semibold">
              <span className="size-2 rounded-full bg-[#7ee2a4]" aria-hidden /> Jetzt <span className="num">{freeNow}</span> von {CABINS.length} Kabinen frei
            </span>
            <h1 className="mt-5 text-[clamp(2.2rem,8.4cqi,3.9rem)] leading-[1] font-bold tracking-[-0.035em] text-[#f7efe4]">
              Gleichmäßig braun.
              <br />
              <span className="bg-gradient-to-b from-[#f1cf8a] to-[#d39b3d] bg-clip-text text-transparent">Ohne Warten.</span>
            </h1>
            <p className={cx("mt-4 max-w-md text-[16.5px] leading-snug", S.dim)}>Kabine und Uhrzeit wählen, mit Guthaben zahlen, reingehen. Die Minuten passen wir an deinen Hauttyp an.</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <a href="#deck-kabinen" className={S.gold}>
                Kabine reservieren <ArrowDown className="size-4" aria-hidden />
              </a>
              <button type="button" onClick={() => setTab("konto")} className="inline-flex min-h-12 items-center rounded-full px-6 text-[15px] font-semibold text-[#f7efe4] ring-1 ring-white/25 hover:ring-white/60">
                Guthaben: <span className="num ml-1.5">{eur(balance)}</span>
              </button>
            </div>
            <ol className="mt-8 grid gap-2.5 @dsm:grid-cols-3">
              {["Minuten nach deinem Hauttyp", "Guthaben statt Papierkarte", "Sauber, ruhig, ohne Schlange"].map((x, i) => (
                <li key={x} className={cx(S.dark, "px-4 py-3.5")}>
                  <span className="num block text-[12px] font-semibold text-[#e2b25c]">0{i + 1}</span>
                  <span className="mt-1 block text-[14px] leading-snug font-medium">{x}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] @dmd:aspect-[5/6]">
              <Image src={`${P}s-hero.webp`} alt="Frau mit gebräunter Haut im warmen Abendlicht" fill priority sizes="(min-width: 48rem) 34rem, 100vw" className="object-cover object-[center_20%]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17110d]/70 via-transparent to-transparent" aria-hidden />
            </div>
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-[#17110d]/75 p-3 backdrop-blur @dsm:right-auto @dsm:w-72">
              <span className="relative block size-12 shrink-0 overflow-hidden rounded-xl">
                <Image src={`${P}s-light.webp`} alt="" fill sizes="3rem" className="object-cover" />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block text-[14px] font-semibold">Intensiv 500 Plus</span>
                <span className={cx("num block text-[12.5px]", S.dim)}>neue Röhren · 0,95 € / Min.</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="deck-kabinen" className="scroll-mt-[calc(var(--bar-h)+4rem)]">
        <div className={cx(S.wrap, "grid gap-7 py-9 @dlg:grid-cols-[minmax(0,1fr)_23rem] @dlg:gap-9 @dlg:py-12")}>
          <div className="min-w-0">
            <h2 className={cx(S.h2, "text-[#2a1c12]")}>Welche Kabine darf es sein?</h2>
            <p className={cx("mt-1.5 text-[15px]", S.soft)}>Der Stand ist live. Tipp auf eine Kabine, um Dauer und Startzeit zu wählen.</p>
            <div data-tour="kabinen" className="mt-5 grid gap-3 @dsm:grid-cols-2">
              {CABINS.map((c) => {
                const st = stateOf(c.id, sessions, !!locked[c.id], now);
                const on = cabinId === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={st.kind === "gesperrt"}
                    aria-pressed={on}
                    onClick={() => {
                      setCabinId(c.id);
                      setStart(null);
                    }}
                    className={cx("flex items-center gap-4 rounded-[1.25rem] p-3 text-left transition-[box-shadow,background-color] disabled:opacity-50", on ? "bg-[#2a1c12] text-[#f7efe4] shadow-[0_16px_34px_-16px_rgb(42_28_18/0.8)]" : cx(S.card, "hover:shadow-[0_18px_36px_-18px_rgb(42_28_18/0.55)]"))}
                  >
                    <span className={cx("num grid size-16 shrink-0 place-items-center rounded-2xl text-[1.75rem] font-bold", on ? "bg-gradient-to-b from-[#edc477] to-[#d9a54a] text-[#231509]" : "bg-[#f7efe4] text-[#2a1c12]")}>{c.id}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[16px] leading-tight font-semibold">{c.device}</span>
                        <span className={cx("inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold", st.kind === "frei" ? "bg-[#dff3e6] text-[#17663a]" : st.kind === "gesperrt" ? "bg-[#fbe4e1] text-[#a3261c]" : "bg-[#fbeccb] text-[#8a5a00]")}>
                          <span className={cx("size-1.5 rounded-full", st.kind === "frei" ? "bg-[#1f8a4c]" : st.kind === "gesperrt" ? "bg-[#c0392b]" : "bg-[#c8860a]")} aria-hidden />
                          {st.kind === "frei" ? "frei" : st.kind === "belegt" ? `in ${st.left + CLEAN} Min.` : st.kind === "reinigung" ? `in ${st.left} Min.` : "Wartung"}
                        </span>
                      </span>
                      <span className={cx("mt-1.5 flex items-center justify-between gap-3 text-[13px]", on ? "text-[#d6c4b0]" : S.soft)}>
                        <span className="inline-flex items-center gap-2">
                          {c.kind} {c.kind !== "Ohne UV" && <Level n={c.level} />}
                        </span>
                        <span className={cx("num font-semibold", on ? "text-[#e2b25c]" : "text-[#2a1c12]")}>{eur(c.perMin)} / Min.</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <aside data-tour="reservieren">
            <div className={cx(S.card, "sticky top-[calc(var(--bar-h)+4.5rem)] p-5")}>
              <h2 className="text-[17px] font-semibold text-[#2a1c12]">Deine Sonnung</h2>
              {mine ? (
                <p className="mt-4 flex items-start gap-3 rounded-2xl bg-[#f7efe4] px-4 py-3 text-[14px] leading-snug">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#b27d22]" aria-hidden />
                  <span>
                    Du hast heute um <span className="num font-semibold">{hm(mine.start)}</span> Uhr reserviert. Danach gilt eine Pause von <strong className="font-semibold">48 Stunden</strong> – so schreibt es der UV-Schutz vor.
                  </span>
                </p>
              ) : !cabin ? (
                <>
                  <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-2xl">
                    <Image src={`${P}s-lounge.webp`} alt="Ruhebereich des Studios in warmen Brauntönen" fill sizes="22rem" className="object-cover" />
                  </div>
                  <p className={cx("mt-4 text-[14.5px] leading-relaxed", S.soft)}>Wähl links eine Kabine. Wir zeigen dir die nächsten freien Zeiten und rechnen den Preis aus.</p>
                </>
              ) : (
                <>
                  <p className={cx("num mt-1 text-[13.5px]", S.soft)}>
                    Kabine {cabin.id} · {cabin.device}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#f7efe4] p-2">
                    <button type="button" aria-label="Eine Minute weniger" disabled={min <= 6} onClick={() => (setMin((m) => m - 1), setStart(null))} className="grid size-11 place-items-center rounded-xl bg-white text-[#2a1c12] shadow-sm hover:bg-[#fff7ea] disabled:opacity-35">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="text-center leading-tight">
                      <span className="num block text-[1.6rem] font-bold tracking-[-0.02em]">{min} Min.</span>
                      <span className={cx("block text-[11.5px]", S.soft)}>
                        Hauttyp {ME.skin}: empfohlen {ME.best}, max. {ME.max}
                      </span>
                    </span>
                    <button type="button" aria-label="Eine Minute mehr" disabled={min >= ME.max} onClick={() => (setMin((m) => m + 1), setStart(null))} className="grid size-11 place-items-center rounded-xl bg-white text-[#2a1c12] shadow-sm hover:bg-[#fff7ea] disabled:opacity-35">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </div>
                  <h3 className="mt-4 text-[13.5px] font-semibold text-[#2a1c12]">Start heute</h3>
                  {starts.length ? (
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      {starts.map((t) => (
                        <button key={t} type="button" aria-pressed={start === t} onClick={() => setStart(t)} className={cx("num min-h-11 rounded-full text-[13.5px] font-semibold transition-colors", start === t ? "bg-[#2a1c12] text-[#f3d9a4]" : "bg-white ring-1 ring-[#e6d6c2] hover:ring-[#2a1c12]")}>
                          {hm(t)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className={cx("mt-2 rounded-2xl border border-dashed border-[#d9c4a8] px-4 py-4 text-[13.5px]", S.soft)}>Heute ist in dieser Kabine nichts mehr frei.</p>
                  )}
                  <dl className="num mt-4 space-y-1.5 border-t border-[#efe2d2] pt-4 text-[14px]">
                    <div className="flex items-baseline justify-between">
                      <dt className={S.soft}>Preis</dt>
                      <dd className="text-[1.6rem] leading-none font-bold tracking-[-0.02em]">{eur(price)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className={S.soft}>Dein Guthaben</dt>
                      <dd>{eur(balance)}</dd>
                    </div>
                  </dl>
                  {balance < price ? (
                    <button type="button" onClick={() => setTab("konto")} className={cx(S.brown, "mt-4 w-full")}>
                      <Wallet className="size-4" aria-hidden /> Erst Guthaben aufladen
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={start === null}
                      onClick={() => {
                        if (start === null || !once()) return;
                        const s = { cabin: cabin.id, start, min, customer: ME.name, pay: "Guthaben" as const, own: true };
                        onAdd(s);
                        onPay(price);
                        setDone({ ...s, id: 0 });
                        toTop();
                      }}
                      className={cx(S.brown, "mt-4 w-full")}
                    >
                      {start === null ? "Startzeit wählen" : `Reservieren · ${hm(start)} Uhr`}
                    </button>
                  )}
                  <p className={cx("mt-3 text-center text-[12px]", S.soft)}>Demo: Es wird nichts gebucht oder abgebucht.</p>
                </>
              )}
            </div>
          </aside>
        </div>
      </section>

      <section className="on-dark bg-[#17110d] text-[#f7efe4]">
        <div className={cx(S.wrap, "grid gap-7 py-10 @dmd:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] @dmd:items-center @dlg:py-14")}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] @dmd:aspect-[4/5]">
            <Image src={`${P}s-spa.webp`} alt="Warm beleuchteter Raum im Studio" fill sizes="(min-width: 48rem) 28rem, 100vw" className="object-cover" />
          </div>
          <div>
            <h2 className={cx(S.h2, "text-[#f7efe4]")}>
              Zahl nur, was du <span className="text-[#e2b25c]">sonnst.</span>
            </h2>
            <p className={cx("mt-2 max-w-md text-[15px]", S.dim)}>Minutengenau vom Guthaben – oder mit der Flat ohne Rechnen.</p>
            <div className="mt-5 grid gap-3 @dsm:grid-cols-3">
              {[
                ["Einzeln", "ab 0,60 €", "je Minute", ["Alle sechs Kabinen", "Minutengenau"]],
                ["Guthaben", "bis + 20 %", "Bonus beim Aufladen", ["50 € → 55 €", "100 € → 120 €"]],
                ["Sonnen-Flat", "39,90 €", "im Monat", ["Classic ohne Minutenpreis", "Monatlich kündbar"]],
              ].map(([n, v, u, pts], i) => (
                <div key={n as string} className={cx("flex flex-col rounded-[1.25rem] p-4", i === 2 ? "bg-gradient-to-b from-[#edc477] to-[#d9a54a] text-[#231509]" : S.dark)}>
                  <span className={cx("text-[12.5px] font-semibold", i === 2 ? "text-[#4a3413]" : "text-[#e2b25c]")}>{n}</span>
                  <span className="num mt-1 text-[1.6rem] leading-none font-bold tracking-[-0.02em]">{v}</span>
                  <span className={cx("text-[12.5px]", i === 2 ? "text-[#4a3413]" : S.dim)}>{u}</span>
                  <ul className="mt-3 space-y-1 text-[13px]">
                    {(pts as string[]).map((x) => (
                      <li key={x} className="num flex gap-2">
                        <Check className="mt-0.5 size-3.5 shrink-0" strokeWidth={3} aria-hidden /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Account({ sessions, balance, onTopUp, onCancel }: StoreProps) {
  const { toast } = useDemo();
  const mine = sessions.find((s) => s.own);
  const packs = [
    { pay: 20, get: 20 },
    { pay: 50, get: 55 },
    { pay: 100, get: 120 },
  ];
  return (
    <>
      <section className="on-dark bg-[#17110d] pb-16 text-[#f7efe4]">
        <div className={cx(S.wrap, "pt-5 @dlg:pt-9")}>
          <p className={cx("text-[14px] font-medium", S.dim)}>Hallo Lena</p>
          <h1 className="mt-1 text-[clamp(2rem,7cqi,3.25rem)] leading-[1.02] font-bold tracking-[-0.03em] text-[#f7efe4]">Mein Konto</h1>
        </div>
      </section>
      <div className={cx(S.wrap, "-mt-11 grid gap-5 pb-10 @dlg:grid-cols-[minmax(0,1fr)_22rem]")}>
        <div className="min-w-0 space-y-4">
          <section data-tour="konto" className="overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#f1cf8a] to-[#d39b3d] p-5 text-[#231509] shadow-[0_20px_40px_-22px_rgb(42_28_18/0.7)] @dsm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-[13px] font-semibold text-[#4a3413]">Guthaben</h2>
                <p className="num mt-1 text-[3rem] leading-none font-bold tracking-[-0.03em]">{eur(balance)}</p>
              </div>
              <p className="max-w-[15rem] text-[13.5px] text-[#4a3413]">Reicht für rund {Math.floor(balance / 0.85)} Minuten in einer Intensiv-Kabine.</p>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {packs.map((p) => (
                <button
                  key={p.pay}
                  type="button"
                  onClick={() => {
                    onTopUp(p.get);
                    toast(`${eur0(p.get)} Guthaben aufgeladen${p.get > p.pay ? ` – ${eur0(p.get - p.pay)} davon geschenkt` : ""}.`);
                  }}
                  className="rounded-2xl bg-[#231509] px-3 py-3 text-left text-[#f7efe4] transition-[filter] hover:brightness-125"
                >
                  <span className="num block text-[1.35rem] leading-none font-bold">{eur0(p.pay)}</span>
                  <span className={cx("num mt-1.5 block text-[12px]", p.get > p.pay ? "text-[#e2b25c]" : S.dim)}>{p.get > p.pay ? `+ ${eur0(p.get - p.pay)} geschenkt` : "aufladen"}</span>
                </button>
              ))}
            </div>
          </section>
          <section className={cx(S.card, "p-5")}>
            <h2 className="text-[16px] font-semibold text-[#2a1c12]">Reservierung</h2>
            {mine ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="num">
                  Heute, {hm(mine.start)} Uhr · Kabine {mine.cabin} · {mine.min} Minuten
                </p>
                <button
                  type="button"
                  onClick={() => {
                    onCancel(mine.id, Math.round(CABINS.find((c) => c.id === mine.cabin)!.perMin * mine.min * 100) / 100);
                    toast("Reservierung storniert – das Guthaben ist zurück auf deinem Konto.");
                  }}
                  className="inline-flex min-h-10 items-center rounded-full bg-[#f7efe4] px-4 text-[13.5px] font-semibold text-[#2a1c12] hover:bg-[#efe2d2]"
                >
                  Stornieren
                </button>
              </div>
            ) : (
              <p className={cx("mt-2 text-[14.5px]", S.soft)}>Keine offene Reservierung.</p>
            )}
          </section>
          <section className={cx(S.card, "p-5")}>
            <h2 className="text-[16px] font-semibold text-[#2a1c12]">Letzte Besuche</h2>
            <ul className="num mt-2 divide-y divide-[#f1e6d8] text-[14.5px]">
              {[
                ["vor 3 Tagen", "Kabine 3 · 14 Min.", 11.9],
                ["vor 8 Tagen", "Kabine 4 · 12 Min.", 11.4],
                ["vor 13 Tagen", "Kabine 3 · 14 Min.", 11.9],
                ["vor 19 Tagen", "Kabine 5 · 10 Min.", 8],
              ].map(([d, w, p]) => (
                <li key={d as string} className="flex justify-between gap-4 py-2.5">
                  <span className={cx("w-28 shrink-0", S.soft)}>{d}</span>
                  <span className="min-w-0 flex-1">{w}</span>
                  <span className="font-semibold">{eur(p as number)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
        <aside className="space-y-4">
          <section className={cx(S.card, "p-5")}>
            <div className="flex items-center gap-3">
              <span className="relative block size-12 shrink-0 overflow-hidden rounded-full">
                <Image src={`${P}s-glow.webp`} alt="" fill sizes="3rem" className="object-cover" />
              </span>
              <div>
                <h2 className={cx("text-[13px] font-medium", S.soft)}>Dein Hautschutz</h2>
                <p className="text-[1.2rem] leading-tight font-semibold text-[#2a1c12]">Hauttyp {ME.skin}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {[`Empfohlen: ${ME.best} Minuten, höchstens ${ME.max}`, "Pause eingehalten: letzte Sonnung vor 3 Tagen", `${ME.year} von höchstens 50 Sonnungen in diesem Jahr`].map((x) => (
                <li key={x} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-[#1f8a4c]" strokeWidth={3} aria-hidden /> {x}
                </li>
              ))}
            </ul>
            <p className={cx("mt-4 border-t border-[#f1e6d8] pt-3 text-[12.5px]", S.soft)}>Das System sperrt Buchungen, die gegen die Schutzregeln verstoßen würden.</p>
          </section>
          <section className="on-dark rounded-[1.25rem] bg-[#17110d] p-5 text-[#f7efe4]">
            <h2 className="text-[13px] font-semibold text-[#e2b25c]">Sonnen-Flat</h2>
            <p className="num mt-1 text-[2rem] leading-none font-bold tracking-[-0.02em]">
              39,90 € <span className={cx("text-[0.95rem] font-medium", S.dim)}>im Monat</span>
            </p>
            <p className={cx("mt-2 text-[14px] leading-snug", S.dim)}>Alle Classic-Kabinen ohne Minutenpreis. Monatlich kündbar, direkt hier abschließen.</p>
            <button type="button" onClick={() => toast("In der echten App schließt der Kunde hier sein Abo ab – der Beitrag wird monatlich eingezogen.")} className={cx(S.gold, "mt-4 min-h-11 w-full")}>
              Flat ansehen
            </button>
          </section>
        </aside>
      </div>
    </>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

function Dashboard({ sessions, locked, now, onLock, onAdd }: { sessions: Session[]; locked: Record<number, boolean>; now: number; onLock: (id: number, v: boolean) => void; onAdd: (s: Omit<Session, "id">) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { live: "Kabinen", kunden: "Kunden", zahlen: "Auswertung" };
  return (
    <Backoffice
      user="Daniel Roth"
      role="Inhaber"
      title={titles[tab] ?? "Kabinen"}
      nav={[
        { id: "live", label: "Kabinen", icon: LayoutGrid, count: sessions.filter((s) => s.own).length },
        { id: "kunden", label: "Kunden", icon: Users, count: MEMBERS.filter((m) => m.days > 30 && m.balance > 0).length },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "kunden" ? <Members /> : tab === "zahlen" ? <Numbers sessions={sessions} now={now} /> : <Board sessions={sessions} locked={locked} now={now} onLock={onLock} onAdd={onAdd} />}
    </Backoffice>
  );
}

function Board({ sessions, locked, now, onLock, onAdd }: { sessions: Session[]; locked: Record<number, boolean>; now: number; onLock: (id: number, v: boolean) => void; onAdd: (s: Omit<Session, "id">) => void }) {
  const { toast } = useDemo();
  const next = sessions.filter((s) => s.start > now).sort((a, b) => a.start - b.start);
  return (
    <div className="space-y-4">
      <div className="grid gap-3 @dsm:grid-cols-2 @dxl:grid-cols-3" data-tour="board">
        {CABINS.map((c) => {
          const st = stateOf(c.id, sessions, !!locked[c.id], now);
          const coming = next.find((s) => s.cabin === c.id);
          return (
            <Panel
              key={c.id}
              title={
                <span className="flex items-center gap-2">
                  <span className="num">Kabine {c.id}</span> <span className="font-normal text-bo-muted">{c.device}</span>
                </span>
              }
              aside={st.kind === "frei" ? <Tag tone="ok">frei</Tag> : st.kind === "belegt" ? <Tag tone="warn">belegt</Tag> : st.kind === "reinigung" ? <Tag tone="info">Reinigung</Tag> : <Tag tone="bad">gesperrt</Tag>}
              className={cx(coming?.own && "ring-1 ring-bo-ink")}
            >
              <div className="min-h-[4.25rem]">
                {st.kind === "belegt" ? (
                  <>
                    <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                      <span className="truncate font-medium text-bo-ink">{st.s.customer}</span>
                      <span className="num shrink-0 text-bo-muted">noch {st.left} Min.</span>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-bo-bg" role="img" aria-label={`${st.s.min - st.left} von ${st.s.min} Minuten`}>
                      <div className="h-full rounded-full bg-d-accent" style={{ width: `${((st.s.min - st.left) / st.s.min) * 100}%` }} />
                    </div>
                    <p className="num mt-2 text-[12px] text-bo-muted">
                      seit {hm(st.s.start)} · {st.s.min} Min. · {st.s.pay}
                    </p>
                  </>
                ) : st.kind === "reinigung" ? (
                  <p className="text-[13.5px]">
                    Wird gereinigt – in <span className="num">{st.left}</span> Min. wieder buchbar.
                  </p>
                ) : st.kind === "gesperrt" ? (
                  <p className="text-[13.5px]">Für Wartung gesperrt. Online nicht buchbar.</p>
                ) : (
                  <Btn
                    size="sm"
                    onClick={() => {
                      if (!isFree(c.id, sessions, now, 12)) return toast("Dafür reicht die Zeit bis zur nächsten Reservierung nicht.");
                      onAdd({ cabin: c.id, start: now, min: 12, customer: "Laufkundschaft", pay: "Bar" });
                      toast(`Kabine ${c.id} läuft – 12 Minuten, ${eur(c.perMin * 12)} bar.`);
                    }}
                  >
                    <Sun className="size-3.5" aria-hidden /> Laufkunde starten
                  </Btn>
                )}
              </div>
              <div className="mt-3 flex items-center justify-between gap-3 border-t border-bo-line pt-2 text-[12.5px]">
                <span className="num min-w-0 truncate text-bo-muted">
                  {coming ? (
                    <>
                      Nächste: <span className={cx("text-bo-ink", coming.own && "font-semibold")}>{hm(coming.start)}</span> {coming.customer}
                    </>
                  ) : (
                    "Heute keine Reservierung mehr"
                  )}
                </span>
                <span className="flex shrink-0 items-center gap-1 text-bo-muted">
                  <Wrench className="size-3.5" aria-hidden />
                  <Toggle checked={!!locked[c.id]} onChange={(v) => onLock(c.id, v)} label={`Kabine ${c.id} für Wartung sperren`} />
                </span>
              </div>
            </Panel>
          );
        })}
      </div>
      <Panel flush title="Nächste Reservierungen" aside={`Stand ${hm(now)} Uhr`}>
        {next.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[460px] text-[13.5px]">
              <thead>
                <tr>
                  <th className={th}>Start</th>
                  <th className={th}>Kabine</th>
                  <th className={th}>Kunde</th>
                  <th className={th}>Dauer</th>
                  <th className={cx(th, "text-right")}>Zahlung</th>
                </tr>
              </thead>
              <tbody>
                {next.slice(0, 7).map((s) => (
                  <tr key={s.id} className={cx(tr, s.own && "animate-demo-flash bg-d-soft")}>
                    <td className={cx(td, "num font-medium text-bo-ink")}>{hm(s.start)}</td>
                    <td className={cx(td, "num")}>Kabine {s.cabin}</td>
                    <td className={td}>
                      {s.customer} {s.own && <Tag tone="accent">eben online gebucht</Tag>}
                    </td>
                    <td className={cx(td, "num")}>{s.min} Min.</td>
                    <td className={cx(td, "text-right")}>{s.pay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            <Empty>Für heute liegen keine Reservierungen mehr vor.</Empty>
          </div>
        )}
      </Panel>
    </div>
  );
}

interface Member {
  name: string;
  skin: string;
  balance: number;
  plan: "Guthaben" | "Flat";
  /** Tage seit der letzten Sonnung */
  days: number;
  visits: number;
}
const MEMBERS: Member[] = [
  { name: "Lena Hartmann", skin: "III", balance: 34.5, plan: "Guthaben", days: 3, visits: 17 },
  { name: "Tobias Kern", skin: "III", balance: 0, plan: "Flat", days: 0, visits: 41 },
  { name: "Carina Wolf", skin: "II", balance: 62, plan: "Guthaben", days: 47, visits: 6 },
  { name: "Dennis Arslan", skin: "IV", balance: 18.4, plan: "Guthaben", days: 0, visits: 23 },
  { name: "Ramona Geiger", skin: "II", balance: 45, plan: "Guthaben", days: 71, visits: 4 },
  { name: "Sven Hartung", skin: "III", balance: 0, plan: "Flat", days: 2, visits: 38 },
  { name: "Elena Sokolova", skin: "III", balance: 27.5, plan: "Guthaben", days: 38, visits: 9 },
  { name: "Marcel Dietz", skin: "IV", balance: 8.2, plan: "Guthaben", days: 5, visits: 29 },
];

function Members() {
  const { toast } = useDemo();
  const [sent, setSent] = useState<string[]>([]);
  const asleep = MEMBERS.filter((m) => m.days > 30 && m.balance > 0);
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Kunden mit Konto", value: 412, note: "86 davon mit Flat" },
          { label: "Guthaben im Umlauf", value: eur0(6840), note: "bereits bezahlt" },
          { label: "Schlafendes Guthaben", value: eur0(asleep.reduce((s, m) => s + m.balance, 0)), note: `${asleep.length} Kunden über 30 Tage weg` },
          { label: "Flat-Einnahmen", value: eur0(86 * 39.9), note: "im Monat, planbar" },
        ]}
      />
      <Panel flush title="Kunden" aside="wer lange nicht da war, steht oben" tour="kunden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-[13.5px]">
            <thead>
              <tr>
                <th className={th}>Name</th>
                <th className={th}>Hauttyp</th>
                <th className={th}>Tarif</th>
                <th className={cx(th, "text-right")}>Guthaben</th>
                <th className={th}>Letzte Sonnung</th>
                <th className={cx(th, "text-right")}>Aktion</th>
              </tr>
            </thead>
            <tbody>
              {[...MEMBERS]
                .sort((a, b) => b.days - a.days)
                .map((m) => {
                  const sleeping = m.days > 30 && m.balance > 0;
                  return (
                    <tr key={m.name} className={tr}>
                      <td className={td}>
                        <span className="flex items-center gap-2.5 font-medium text-bo-ink">
                          <Avatar name={m.name} size="sm" /> {m.name}
                        </span>
                      </td>
                      <td className={cx(td, "num")}>{m.skin}</td>
                      <td className={td}>{m.plan === "Flat" ? <Tag tone="accent">Flat</Tag> : "Guthaben"}</td>
                      <td className={cx(td, "num text-right text-bo-ink")}>{m.plan === "Flat" ? "–" : eur(m.balance)}</td>
                      <td className={td}>{m.days === 0 ? <Tag tone="ok">heute</Tag> : sleeping ? <Tag tone="warn">vor {m.days} Tagen</Tag> : <span className="num">vor {m.days} Tagen</span>}</td>
                      <td className={cx(td, "text-right")}>
                        {sleeping && (
                          <Btn
                            size="sm"
                            disabled={sent.includes(m.name)}
                            onClick={() => {
                              setSent((s) => [...s, m.name]);
                              toast(`${m.name.split(" ")[0]} bekommt eine Nachricht: „Du hast noch ${eur(m.balance)} Guthaben.“`);
                            }}
                          >
                            <BellRing className="size-3.5" aria-hidden /> {sent.includes(m.name) ? "erinnert" : "Erinnern"}
                          </Btn>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Numbers({ sessions, now }: { sessions: Session[]; now: number }) {
  const done = sessions.filter((s) => s.start <= now);
  const price = (s: Session) => (s.pay === "Abo" ? 0 : CABINS.find((c) => c.id === s.cabin)!.perMin * s.min);
  const hours = Array.from({ length: (CLOSE - OPEN) / 60 }, (_, i) => ({ label: String(9 + i), value: sessions.filter((s) => Math.floor(s.start / 60) === 9 + i).length }));
  const span = Math.max(60, now - OPEN);
  return (
    <div className="space-y-4">
      <Figures
        tour="zahlen"
        items={[
          { label: "Sonnungen heute", value: done.length, note: `${done.filter((s) => s.own || s.pay === "Guthaben").length} über Guthaben` },
          { label: "Umsatz heute", value: eur0(done.reduce((n, s) => n + price(s), 0)), note: "ohne Flat-Beiträge" },
          { label: "Auslastung", value: `${Math.round((done.reduce((n, s) => n + s.min, 0) / (span * CABINS.length)) * 100)} %`, note: "Laufzeit aller Kabinen" },
          { label: "Online reserviert", value: "38 %", note: "letzte 30 Tage" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-[1.3fr_1fr]">
        <Panel title="Sonnungen je Stunde" aside="heute, mit Reservierungen">
          <Bars label="Sonnungen je Stunde" data={hours} mark={Math.floor(now / 60) - 9} />
        </Panel>
        <Panel title="Laufzeit je Kabine" aside="heute">
          <Ranks data={CABINS.map((c) => ({ label: `Kabine ${c.id} · ${c.device}`, value: done.filter((s) => s.cabin === c.id).reduce((n, s) => n + s.min, 0) })).sort((a, b) => b.value - a.value)} format={(n) => `${n} Min.`} />
        </Panel>
      </div>
      <Panel flush title="Röhren und Wartung" aside="Betriebsstunden zählen automatisch mit">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13.5px]">
            <thead>
              <tr>
                <th className={th}>Kabine</th>
                <th className={th}>Gerät</th>
                <th className={cx(th, "text-right")}>Betriebsstunden</th>
                <th className={th}>Röhrenwechsel</th>
              </tr>
            </thead>
            <tbody>
              {CABINS.map((c) => {
                const left = c.tubeMax - c.tubeHours;
                return (
                  <tr key={c.id} className={tr}>
                    <td className={cx(td, "num font-medium text-bo-ink")}>Kabine {c.id}</td>
                    <td className={td}>{c.device}</td>
                    <td className={cx(td, "num text-right")}>
                      {c.tubeHours} von {c.tubeMax}
                    </td>
                    <td className={td}>{left < 50 ? <Tag tone="bad">in {left} Stunden fällig</Tag> : left < 300 ? <Tag tone="warn">in {left} Stunden</Tag> : <Tag tone="ok">in {left} Stunden</Tag>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
