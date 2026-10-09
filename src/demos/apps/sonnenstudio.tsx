"use client";

import { useMemo, useState } from "react";
import { BellRing, ChartColumn, Check, Clock, LayoutGrid, MapPin, Minus, Plus, ShieldCheck, Sun, Users, Wallet, Wrench } from "lucide-react";
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
   Gestaltung „Sonnendeck": dunkles Braun-Schwarz mit einem einzigen Bernsteinton, Bricolage Grotesque.
   Die Kabinen stehen als Tafel im Mittelpunkt – wer reinkommt, will wissen, was jetzt frei ist. */

const S = {
  wrap: "mx-auto w-full max-w-[72rem] px-4 @dsm:px-6 @dlg:px-8",
  label: "text-[11px] leading-none font-semibold tracking-[0.16em] uppercase",
  display: "font-d-display font-bold tracking-[-0.03em]",
  dim: "text-[#b9ad9f]",
  card: "rounded-2xl border border-[#352c25] bg-[#1f1a16]",
  btn: "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 text-[15px] font-bold transition-[filter] active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
};
const Level = ({ n }: { n: number }) => (
  <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Stärke ${n} von 3`}>
    {[1, 2, 3].map((i) => (
      <Sun key={i} className={cx("size-3.5", i <= n ? "text-[#f5a524]" : "text-[#4a4038]")} aria-hidden />
    ))}
  </span>
);

type StoreProps = { sessions: Session[]; locked: Record<number, boolean>; now: number; balance: number; onPay: (n: number) => void; onTopUp: (n: number) => void; onAdd: (s: Omit<Session, "id">) => void; onCancel: (id: number, refund: number) => void };

function Storefront(props: StoreProps) {
  const { tab, setTab } = useDemo();
  return (
    <div className="on-dark min-h-[var(--app-h)] bg-[#14110f] font-plex text-[15px] leading-[1.55] text-[#f5efe6]">
      <header className="sticky top-[var(--bar-h)] z-20 border-b border-[#352c25] bg-[#14110f]/95 backdrop-blur">
        <div className={cx(S.wrap, "flex items-center justify-between gap-4")}>
          <p className="flex items-center gap-2.5 py-3">
            <span className="grid size-8 place-items-center rounded-full bg-[#f5a524] text-[#1a1206]" aria-hidden>
              <Sun className="size-4.5" strokeWidth={2.5} />
            </span>
            <span className={cx(S.display, "text-[1.2rem] leading-none")}>Sonnendeck</span>
          </p>
          <nav aria-label="Kundenbereich" className="flex gap-1">
            {[
              { id: "kabinen", label: "Kabinen" },
              { id: "konto", label: "Mein Konto" },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-11 rounded-xl px-3.5 text-[14px] font-semibold whitespace-nowrap transition-colors", tab === n.id ? "bg-[#f5a524] text-[#1a1206]" : "text-[#f5efe6] hover:bg-[#2a231d]")}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "konto" ? <Account {...props} /> : <Cabins {...props} />}
      <footer className="border-t border-[#352c25]">
        <div className={cx(S.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-3 py-6 text-[13.5px]", S.dim)}>
          <span className={cx(S.display, "text-[1.05rem] text-[#f5efe6]")}>Sonnendeck</span>
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
      <div className={cx(S.wrap, "py-12 @dlg:py-20")}>
        <div className="mx-auto max-w-xl">
          <p className={cx(S.label, "text-[#f5a524]")}>Reserviert</p>
          <h1 className={cx(S.display, "mt-4 text-[clamp(2.5rem,10cqi,4.5rem)] leading-[0.92] text-[#f5efe6]")}>
            Kabine {c.id} wartet <span className="text-[#f5a524]">auf dich.</span>
          </h1>
          <div className={cx(S.card, "mt-8 p-6")}>
            <p className={cx(S.label, S.dim)}>Heute · {c.device}</p>
            <p className={cx(S.display, "num mt-2 text-[3.5rem] leading-none")}>{hm(done.start)}</p>
            <p className="num mt-3">
              {done.min} Minuten · {eur(c.perMin * done.min)} vom Guthaben abgebucht
            </p>
            <p className={cx("mt-4 border-t border-dashed border-[#4a4038] pt-4 text-[14px]", S.dim)}>Die Kabine bleibt zehn Minuten für dich frei. Am Empfang nennst du nur deinen Namen – die Zeit ist am Gerät schon eingestellt.</p>
          </div>
          <div className="mt-5 rounded-2xl bg-[#f5a524] p-5 text-[14.5px] leading-snug text-[#1a1206]">
            <strong className="font-bold">So sieht es das Studio:</strong> Deine Reservierung steht im Kabinen-Board, der Umsatz ist schon gebucht.
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => go("betrieb", "live")} className={cx(S.btn, "bg-[#1a1206] text-white hover:brightness-125")}>
                Im Kabinen-Board ansehen
              </button>
              <button type="button" onClick={() => setTab("konto")} className={cx(S.btn, "border border-[#1a1206] hover:bg-[#ffc45c]")}>
                Zu meinem Konto
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className={cx(S.wrap, "pt-8 pb-6 @dlg:pt-14")}>
        <p className={cx(S.label, "text-[#f5a524]")}>Sonnenstudio · Musterstadt</p>
        <div className="mt-5 grid gap-6 @dmd:grid-cols-[minmax(0,1fr)_auto] @dmd:items-end">
          <h1 className={cx(S.display, "text-[clamp(2.75rem,11cqi,6rem)] leading-[0.88] text-[#f5efe6]")}>
            Jetzt sind <span className="num text-[#f5a524]">{freeNow}</span>
            <br />
            Kabinen frei.
          </h1>
          <p className={cx("max-w-xs text-[16px] leading-snug", S.dim)}>Kabine und Uhrzeit wählen, mit Guthaben zahlen, reingehen. Kein Warten am Empfang.</p>
        </div>
      </section>

      <div className={cx(S.wrap, "grid gap-8 pb-14 @dlg:grid-cols-[minmax(0,1fr)_21rem] @dlg:gap-10")}>
        <section data-tour="kabinen" aria-label="Kabinen" className="grid content-start gap-3 @dsm:grid-cols-2">
          {CABINS.map((c) => {
            const st = stateOf(c.id, sessions, !!locked[c.id], now);
            const on = cabinId === c.id;
            const off = st.kind === "gesperrt";
            return (
              <button
                key={c.id}
                type="button"
                disabled={off}
                aria-pressed={on}
                onClick={() => {
                  setCabinId(c.id);
                  setStart(null);
                }}
                className={cx("flex flex-col gap-4 rounded-2xl border p-4 text-left transition-colors disabled:opacity-45", on ? "border-[#f5a524] bg-[#2a2017]" : "border-[#352c25] bg-[#1f1a16] hover:border-[#6b5a48]")}
              >
                <span className="flex items-start justify-between gap-3">
                  <span className={cx(S.display, "num text-[2.5rem] leading-none", on && "text-[#f5a524]")}>{c.id}</span>
                  <span className={cx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-semibold", st.kind === "frei" ? "bg-[#1f3a2a] text-[#7ee2a4]" : st.kind === "gesperrt" ? "bg-[#3a2323] text-[#f0a3a3]" : "bg-[#3a2f1c] text-[#f5c46b]")}>
                    <span className={cx("size-1.5 rounded-full", st.kind === "frei" ? "bg-[#7ee2a4]" : st.kind === "gesperrt" ? "bg-[#f0a3a3]" : "bg-[#f5c46b]")} aria-hidden />
                    {st.kind === "frei" ? "frei" : st.kind === "belegt" ? `frei in ${st.left + CLEAN} Min.` : st.kind === "reinigung" ? `frei in ${st.left} Min.` : "Wartung"}
                  </span>
                </span>
                <span>
                  <span className="block text-[16px] leading-tight font-semibold">{c.device}</span>
                  <span className={cx("mt-1.5 flex items-center justify-between gap-3 text-[13px]", S.dim)}>
                    <span className="inline-flex items-center gap-2">
                      {c.kind} {c.kind !== "Ohne UV" && <Level n={c.level} />}
                    </span>
                    <span className="num">{eur(c.perMin)} / Min.</span>
                  </span>
                </span>
              </button>
            );
          })}
        </section>

        <aside data-tour="reservieren">
          <div className={cx(S.card, "sticky top-[calc(var(--bar-h)+4.5rem)] p-5")}>
            <h2 className={cx(S.label, S.dim)}>Deine Sonnung</h2>
            {mine ? (
              <p className="mt-4 flex items-start gap-3 rounded-xl bg-[#2a231d] px-4 py-3 text-[14px] leading-snug">
                <ShieldCheck className="mt-0.5 size-5 shrink-0 text-[#f5a524]" aria-hidden />
                <span>
                  Du hast heute um <span className="num font-semibold">{hm(mine.start)}</span> Uhr reserviert. Danach gilt eine Pause von <strong className="font-semibold">48 Stunden</strong> – so schreibt es der UV-Schutz vor.
                </span>
              </p>
            ) : !cabin ? (
              <p className={cx("mt-4 text-[14.5px] leading-relaxed", S.dim)}>Wähl eine Kabine. Wir zeigen dir die nächsten freien Zeiten und rechnen den Preis aus.</p>
            ) : (
              <>
                <p className={cx(S.display, "mt-3 text-[1.6rem] leading-tight")}>
                  Kabine {cabin.id} · {cabin.device}
                </p>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-[14px]">Dauer</span>
                  <span className="flex items-center gap-2">
                    <button type="button" aria-label="Eine Minute weniger" disabled={min <= 6} onClick={() => (setMin((m) => m - 1), setStart(null))} className="grid size-11 place-items-center rounded-xl border border-[#4a4038] hover:border-[#f5a524] disabled:opacity-35">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className={cx(S.display, "num w-20 text-center text-[1.75rem] leading-none")}>{min} Min.</span>
                    <button type="button" aria-label="Eine Minute mehr" disabled={min >= ME.max} onClick={() => (setMin((m) => m + 1), setStart(null))} className="grid size-11 place-items-center rounded-xl border border-[#4a4038] hover:border-[#f5a524] disabled:opacity-35">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </span>
                </div>
                <p className={cx("mt-2 text-[12.5px]", S.dim)}>
                  Hauttyp {ME.skin}: empfohlen {ME.best}, höchstens {ME.max} Minuten.
                </p>
                <h3 className="mt-5 text-[14px] font-normal text-[#f5efe6]">Start heute</h3>
                {starts.length ? (
                  <div className="mt-2 grid grid-cols-4 gap-1.5">
                    {starts.map((t) => (
                      <button key={t} type="button" aria-pressed={start === t} onClick={() => setStart(t)} className={cx("num min-h-11 rounded-xl border text-[14px] font-semibold transition-colors", start === t ? "border-[#f5a524] bg-[#f5a524] text-[#1a1206]" : "border-[#4a4038] hover:border-[#f5a524]")}>
                        {hm(t)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={cx("mt-2 rounded-xl border border-dashed border-[#4a4038] px-4 py-4 text-[13.5px]", S.dim)}>Heute ist in dieser Kabine nichts mehr frei.</p>
                )}
                <dl className="num mt-5 space-y-1.5 border-t border-[#352c25] pt-4 text-[14px]">
                  <div className="flex justify-between">
                    <dt className={S.dim}>Preis</dt>
                    <dd className={cx(S.display, "text-[1.6rem] leading-none text-[#f5a524]")}>{eur(price)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className={S.dim}>Dein Guthaben</dt>
                    <dd>{eur(balance)}</dd>
                  </div>
                </dl>
                {balance < price ? (
                  <button type="button" onClick={() => setTab("konto")} className={cx(S.btn, "mt-4 w-full border border-[#f5a524] text-[#f5a524] hover:bg-[#2a2017]")}>
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
                    className={cx(S.btn, "mt-4 w-full bg-[#f5a524] text-[#1a1206] hover:brightness-105")}
                  >
                    Reservieren und zahlen
                  </button>
                )}
                <p className={cx("mt-3 text-[12px]", S.dim)}>Demo: Es wird nichts gebucht oder abgebucht.</p>
              </>
            )}
          </div>
        </aside>
      </div>
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
    <div className={cx(S.wrap, "grid gap-5 py-8 @dlg:grid-cols-[minmax(0,1fr)_22rem] @dlg:py-14")}>
      <div className="min-w-0 space-y-5">
        <div>
          <p className={cx(S.label, "text-[#f5a524]")}>Hallo Lena</p>
          <h1 className={cx(S.display, "mt-4 text-[clamp(2.25rem,8cqi,3.75rem)] leading-[0.95] text-[#f5efe6]")}>Mein Konto</h1>
        </div>
        <section className={cx(S.card, "p-5")} data-tour="konto">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={cx(S.label, S.dim)}>Guthaben</h2>
              <p className={cx(S.display, "num mt-2 text-[3.25rem] leading-none text-[#f5a524]")}>{eur(balance)}</p>
            </div>
            <p className={cx("max-w-[16rem] text-[13.5px]", S.dim)}>Reicht für rund {Math.floor(balance / 0.85)} Minuten in einer Intensiv-Kabine.</p>
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
                className="rounded-xl border border-[#4a4038] px-3 py-3 text-left transition-colors hover:border-[#f5a524]"
              >
                <span className={cx(S.display, "num block text-[1.5rem] leading-none")}>{eur0(p.pay)}</span>
                <span className={cx("num mt-1.5 block text-[12.5px]", p.get > p.pay ? "text-[#f5a524]" : S.dim)}>{p.get > p.pay ? `+ ${eur0(p.get - p.pay)} geschenkt` : "aufladen"}</span>
              </button>
            ))}
          </div>
        </section>
        <section className={cx(S.card, "p-5")}>
          <h2 className={cx(S.label, S.dim)}>Reservierung</h2>
          {mine ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="num">
                Heute, {hm(mine.start)} Uhr · Kabine {mine.cabin} · {mine.min} Minuten
              </p>
              <button
                type="button"
                onClick={() => {
                  onCancel(mine.id, Math.round(CABINS.find((c) => c.id === mine.cabin)!.perMin * mine.min * 100) / 100);
                  toast("Reservierung storniert – das Guthaben ist zurück auf deinem Konto.");
                }}
                className="min-h-11 rounded-xl border border-[#4a4038] px-4 text-[13.5px] font-semibold hover:border-[#f5efe6]"
              >
                Stornieren
              </button>
            </div>
          ) : (
            <p className={cx("mt-4 text-[14.5px]", S.dim)}>Keine offene Reservierung.</p>
          )}
        </section>
        <section className={cx(S.card, "p-5")}>
          <h2 className={cx(S.label, S.dim)}>Letzte Besuche</h2>
          <ul className="num mt-3 divide-y divide-[#352c25] text-[14.5px]">
            {[
              ["vor 3 Tagen", "Kabine 3 · 14 Min.", 11.9],
              ["vor 8 Tagen", "Kabine 4 · 12 Min.", 11.4],
              ["vor 13 Tagen", "Kabine 3 · 14 Min.", 11.9],
              ["vor 19 Tagen", "Kabine 5 · 10 Min.", 8],
            ].map(([d, w, p]) => (
              <li key={d as string} className="flex justify-between gap-4 py-2.5">
                <span className={S.dim}>{d}</span>
                <span className="min-w-0 flex-1">{w}</span>
                <span>{eur(p as number)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <aside className="space-y-5">
        <section className={cx(S.card, "p-5")}>
          <h2 className={cx(S.label, S.dim)}>Dein Hautschutz</h2>
          <p className={cx(S.display, "mt-3 text-[1.5rem] leading-tight")}>Hauttyp {ME.skin}</p>
          <ul className="mt-4 space-y-2.5 text-[14px]">
            {[`Empfohlen: ${ME.best} Minuten, höchstens ${ME.max}`, "Pause eingehalten: letzte Sonnung vor 3 Tagen", `${ME.year} von höchstens 50 Sonnungen in diesem Jahr`].map((x) => (
              <li key={x} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-[#7ee2a4]" strokeWidth={3} aria-hidden /> {x}
              </li>
            ))}
          </ul>
          <p className={cx("mt-4 border-t border-[#352c25] pt-3 text-[12.5px]", S.dim)}>Das System sperrt Buchungen, die gegen die Schutzregeln verstoßen würden.</p>
        </section>
        <section className="rounded-2xl bg-[#f5a524] p-5 text-[#1a1206]">
          <h2 className={cx(S.label, "text-[#1a1206]")}>Sonnen-Flat</h2>
          <p className={cx(S.display, "num mt-3 text-[2.25rem] leading-none")}>
            39,90 € <span className="text-[1rem] font-semibold">im Monat</span>
          </p>
          <p className="mt-2 text-[14px] leading-snug">Alle Classic-Kabinen ohne Minutenpreis. Monatlich kündbar, direkt hier abschließen.</p>
          <button type="button" onClick={() => toast("In der echten App schließt der Kunde hier sein Abo ab – der Beitrag wird monatlich eingezogen.")} className={cx(S.btn, "mt-4 min-h-11 w-full bg-[#1a1206] text-white hover:brightness-125")}>
            Flat ansehen
          </button>
        </section>
      </aside>
    </div>
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
