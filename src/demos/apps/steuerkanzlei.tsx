"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight, CalendarClock, Camera, ChartColumn, Check, FileText, FolderOpen, Inbox, LayoutGrid, Lock, MessageSquare, Phone, ScanLine, Send, Upload, Users } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Backoffice, Bars, Btn, Figures, Panel, Ranks, Tag, td, th, tr } from "@/demos/kit/ui";
import { clock, cx, day, eur, fmtDate, fmtDay, monthName, num } from "@/demos/kit/util";

/**
 * Demo "Albrecht & Sommer": Mandantenportal (Aufgaben, Belege, Dokumente, Nachrichten) + Kanzlei-Ansicht.
 * Hochgeladene Belege werden "gelesen" (simulierte KI-Erkennung) und zählen sofort in der Mandantenliste der Kanzlei mit;
 * Freigaben und Nachrichten laufen in beide Richtungen.
 */

type ReceiptStatus = "liest" | "erkannt" | "geprueft" | "rueckfrage";
interface Receipt {
  id: number;
  vendor: string;
  date: string;
  amount: number;
  cat: string;
  status: ReceiptStatus;
  fresh?: boolean;
}
const TARGET = 30;
const POOL = [
  { vendor: "Metro Deutschland", amount: 284.36, cat: "Wareneinkauf" },
  { vendor: "Stadtwerke Musterstadt", amount: 412.8, cat: "Strom und Gas" },
  { vendor: "Kaffeerösterei Hansen", amount: 196.0, cat: "Wareneinkauf" },
  { vendor: "Telekom Deutschland", amount: 49.95, cat: "Telefon und Internet" },
  { vendor: "Bürobedarf Plus", amount: 38.9, cat: "Bürobedarf" },
  { vendor: "Tankstelle Nordring", amount: 71.42, cat: "Fahrzeugkosten" },
];
const d = (offset: number) => fmtDate(day(offset));
const seedReceipts = (): Receipt[] => [
  { id: 1, vendor: "Molkerei Wiesengrund", date: d(-2), amount: 148.2, cat: "Wareneinkauf", status: "erkannt" },
  { id: 2, vendor: "Restaurant Zur Linde", date: d(-5), amount: 86.5, cat: "Bewirtung", status: "rueckfrage" },
  { id: 3, vendor: "Bäckerei-Großhandel Nord", date: d(-6), amount: 312.75, cat: "Wareneinkauf", status: "geprueft" },
  { id: 4, vendor: "Versicherung Alba", date: d(-8), amount: 129.0, cat: "Versicherungen", status: "geprueft" },
  { id: 5, vendor: "Getränke Hoffmann", date: d(-9), amount: 221.4, cat: "Wareneinkauf", status: "geprueft" },
  { id: 6, vendor: "Vermietung Rosenhof GbR", date: d(-12), amount: 1850.0, cat: "Miete", status: "geprueft" },
  { id: 7, vendor: "Reinigung Blitzblank", date: d(-13), amount: 240.0, cat: "Reinigung", status: "geprueft" },
];

interface Msg {
  from: "kanzlei" | "mandant";
  text: string;
  at: string;
}
const seedMsgs = (): Msg[] => [
  { from: "kanzlei", text: "Guten Tag Frau Petersen, der Entwurf Ihrer Einkommensteuererklärung 2025 liegt zur Freigabe bereit. Es ergibt sich eine Nachzahlung von 1.474 €. Details finden Sie unter Dokumente.", at: `${fmtDay(day(-1))}, 16:12` },
  { from: "mandant", text: "Danke, ich schaue es mir am Wochenende an. Die Oktober-Belege kommen diese Woche.", at: `${fmtDay(day(-1))}, 18:40` },
];

const FOLDERS = [
  { id: "freigabe", name: "Zur Freigabe", files: ["Einkommensteuererklärung 2025 – Entwurf"] },
  { id: "bescheide", name: "Bescheide", files: ["Einkommensteuerbescheid 2024", "Gewerbesteuerbescheid 2024", "Umsatzsteuerbescheid 2024", "Vorauszahlungsbescheid 2026"] },
  { id: "abschluss", name: "Jahresabschlüsse", files: ["Einnahmenüberschussrechnung 2024", "Einnahmenüberschussrechnung 2023", "Anlagenverzeichnis 2024"] },
  { id: "lohn", name: "Lohn", files: [`Lohnjournal ${monthName(-1)}`, `Lohnabrechnungen ${monthName(-1)} (4)`, `Beitragsnachweise ${monthName(-1)}`] },
  { id: "vertraege", name: "Verträge", files: ["Steuerberatungsvertrag", "Vollmacht Finanzamt"] },
];

export default function KanzleiDemo() {
  const { view } = useDemo();
  const [receipts, setReceipts] = useState<Receipt[]>(seedReceipts);
  const [msgs, setMsgs] = useState<Msg[]>(seedMsgs);
  const [approved, setApproved] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const count = useRef(0);

  const upload = () => {
    const id = Date.now();
    const p = POOL[count.current++ % POOL.length];
    setReceipts((r) => [{ id, ...p, date: d(-(count.current % 4)), status: "liest", fresh: true }, ...r]);
    setTimeout(() => setReceipts((r) => r.map((x) => (x.id === id ? { ...x, status: "erkannt" } : x))), 1700);
  };
  const state = {
    receipts,
    msgs,
    approved,
    answered,
    upload,
    confirm: (id: number) => setReceipts((r) => r.map((x) => (x.id === id ? { ...x, status: "geprueft" } : x))),
    // Prüfschritt: ausgelesene Angaben korrigieren und damit freigeben
    fix: (id: number, change: Pick<Receipt, "vendor" | "amount" | "cat">) => setReceipts((r) => r.map((x) => (x.id === id ? { ...x, ...change, status: "geprueft" } : x))),
    send: (from: Msg["from"], text: string) => setMsgs((m) => [...m, { from, text, at: `heute, ${clock()}` }]),
    approve: () => setApproved(clock()),
    answer: (text: string) => {
      setAnswered(true);
      setReceipts((r) => r.map((x) => (x.status === "rueckfrage" ? { ...x, status: "geprueft" } : x)));
      setMsgs((m) => [...m, { from: "mandant", text: `Zur Bewirtung bei „Zur Linde“: ${text}`, at: `heute, ${clock()}` }]);
    },
  };
  return view === "kunde" ? <Portal s={state} /> : <Office s={state} />;
}

interface State {
  receipts: Receipt[];
  msgs: Msg[];
  approved: string | null;
  answered: boolean;
  upload: () => void;
  confirm: (id: number) => void;
  fix: (id: number, change: Pick<Receipt, "vendor" | "amount" | "cat">) => void;
  send: (from: Msg["from"], text: string) => void;
  approve: () => void;
  answer: (text: string) => void;
}
const baseCount = 5; // bereits früher im Monat geliefert, nicht einzeln gelistet
const delivered = (s: State) => baseCount + s.receipts.length;

/* ───────────────────────────── Mandantenportal ─────────────────────────────
   Gestaltung „Albrecht & Sommer": seriöses Schwarz (#111) auf Weiß, Manrope, viel Weißraum und Haarlinien (#dcdcda).
   Bewusst Software statt Werbeseite: feste Navigation (Leiste links, am Handy Reiter unten), nummerierte Listen,
   Zahlen tabellarisch, Etiketten 11 px gesperrt. Kanten gerade (Radius 0–2 px). Abstände im 4/8er-Raster, Blöcke 32/48. */

const SERIF = "font-d-display tracking-[-0.03em]";
const P = {
  label: "text-[11px] leading-none font-bold tracking-[0.14em] uppercase",
  muted: "text-[#6b6b66]",
  line: "border-[#dcdcda]",
  btn: "inline-flex min-h-11 items-center justify-center gap-2 rounded-[2px] px-5 text-[14px] font-bold whitespace-nowrap transition-colors active:translate-y-px disabled:pointer-events-none disabled:opacity-40",
  dark: "bg-[#111111] text-white hover:bg-black",
  ghost: "border border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white",
  input: "min-h-11 w-full rounded-[2px] border border-[#b9b9b4] bg-white px-3 text-[16px] text-[#111111] outline-none transition-colors placeholder:text-[#7d7d78] hover:border-[#111111] focus:border-[#111111] focus:shadow-[inset_0_-2px_0_#111111] @dsm:text-[14.5px]",
};
const CATEGORIES = ["Wareneinkauf", "Strom und Gas", "Telefon und Internet", "Bürobedarf", "Fahrzeugkosten", "Bewirtung", "Versicherungen", "Miete", "Reinigung"];

function Portal({ s }: { s: State }) {
  const { tab, setTab } = useDemo();
  const open = [delivered(s) < TARGET, !s.approved, !s.answered].filter(Boolean).length;
  const nav = [
    { id: "uebersicht", label: "Übersicht", icon: LayoutGrid, count: open },
    { id: "belege", label: "Belege", icon: ScanLine, count: s.receipts.filter((r) => r.status === "erkannt").length },
    { id: "dokumente", label: "Dokumente", icon: FolderOpen, count: s.approved ? 0 : 1 },
    { id: "nachrichten", label: "Nachrichten", icon: MessageSquare, count: 0 },
  ];
  return (
    <div className="min-h-[var(--app-h)] bg-white font-plex text-[15px] leading-[1.55] text-[#3f3f3a] @dlg:grid @dlg:grid-cols-[15.5rem_minmax(0,1fr)]">
      {/* Breite Rahmen: Leiste links */}
      <aside className="on-dark hidden bg-[#111111] text-white @dlg:sticky @dlg:top-[var(--bar-h)] @dlg:flex @dlg:h-[var(--app-h)] @dlg:flex-col">
        <p className="border-b border-white/15 px-6 py-6">
          <span className={cx(SERIF, "block text-[1.375rem] leading-none font-extrabold text-white")}>Albrecht & Sommer</span>
          <span className={cx("mt-2.5 block text-white/60", P.label)}>Steuerberatung</span>
        </p>
        <nav aria-label="Portal" className="flex flex-col gap-0.5 px-3 py-4">
          {nav.map((n) => (
            <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("flex min-h-11 items-center gap-3 rounded-[2px] px-3 text-left text-[14.5px] font-semibold transition-colors", tab === n.id ? "bg-white text-[#111111]" : "text-white/75 hover:bg-white/10 hover:text-white")}>
              <n.icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="flex-1">{n.label}</span>
              {n.count > 0 && <span className={cx("num min-w-5 rounded-[2px] px-1.5 text-center text-[11px] leading-5 font-bold", tab === n.id ? "bg-[#111111] text-white" : "bg-white text-[#111111]")}>{n.count}</span>}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t border-white/15 px-6 py-5">
          <p className={cx("flex items-center gap-2 text-white/60", P.label)}>
            <Lock className="size-3.5" aria-hidden /> Sicher angemeldet
          </p>
          <p className="mt-3 text-[14.5px] leading-tight font-semibold text-white">Jana Petersen</p>
          <p className="mt-1 text-[13px] text-white/65">Café Rosenhof · Mandant 10482</p>
        </div>
      </aside>

      <div className="flex min-h-[var(--app-h)] min-w-0 flex-col">
        {/* Schmale Rahmen: Kopfzeile oben, Reiter unten */}
        <header className="on-dark flex items-center justify-between gap-4 bg-[#111111] px-4 py-3.5 text-white @dsm:px-6 @dlg:hidden">
          <p>
            <span className={cx(SERIF, "block text-[1.125rem] leading-none font-extrabold text-white")}>Albrecht & Sommer</span>
            <span className={cx("mt-2 block text-[10px] text-white/60", P.label)}>Mandantenportal</span>
          </p>
          <p className="flex min-w-0 items-center gap-2 text-[12.5px] font-semibold text-white/80">
            <Lock className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">J. Petersen</span>
          </p>
        </header>
        <main className="mx-auto w-full max-w-[64rem] flex-1 px-4 py-6 @dsm:px-6 @dlg:px-10 @dlg:py-10">{tab === "belege" ? <Receipts s={s} /> : tab === "dokumente" ? <Documents s={s} /> : tab === "nachrichten" ? <Messages s={s} /> : <Overview s={s} onTab={setTab} />}</main>
        <nav aria-label="Portal" className="sticky bottom-0 z-20 grid grid-cols-4 border-t border-[#111111] bg-white @dlg:hidden">
          {nav.map((n) => (
            <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("relative flex min-h-14 flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors", tab === n.id ? "bg-[#111111] text-white" : "text-[#3f3f3a]")}>
              <span className="relative">
                <n.icon className="size-5" strokeWidth={1.75} aria-hidden />
                {n.count > 0 && <span className={cx("num absolute -top-1.5 -right-2.5 grid min-w-4 place-items-center rounded-full px-1 text-[10px] leading-4", tab === n.id ? "bg-white text-[#111111]" : "bg-[#111111] text-white")}>{n.count}</span>}
              </span>
              {n.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

const card = "rounded-none border border-[#dcdcda] bg-white";
/** Seitenkopf der Unterseiten: Etikett, Titel, rechts eine Kennzahl oder Aktion */
function PageHead({ label, title, children }: { label: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-[#111111] pb-5">
      <div>
        <p className={cx(P.label, P.muted)}>{label}</p>
        <h1 className={cx(SERIF, "mt-3 text-[2rem] leading-none font-extrabold text-[#111111] @dsm:text-[2.5rem]")}>{title}</h1>
      </div>
      {children}
    </div>
  );
}

function Overview({ s, onTab }: { s: State; onTab: (t: string) => void }) {
  const [text, setText] = useState("");
  const n = delivered(s);
  const open = [n < TARGET, !s.approved, !s.answered].filter(Boolean).length;
  const num2 = (i: number, done: boolean) => (
    <span className={cx("num grid size-9 shrink-0 place-items-center rounded-[2px] border text-[12.5px] font-bold", done ? "border-[#111111] bg-[#111111] text-white" : "border-[#b9b9b4] text-[#111111]")}>{done ? <Check className="size-4" strokeWidth={3} aria-hidden /> : `0${i}`}</span>
  );
  const row = "grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-4 gap-y-3 py-5 @dmd:grid-cols-[2.25rem_minmax(0,1fr)_auto] @dmd:items-center";
  const deadlines: [string, number, string][] = [
    ["Umsatzsteuer-Voranmeldung", 6, "Belege bis dahin vollständig"],
    ["Lohnmeldung", 12, "Stunden der Aushilfen melden"],
    ["Einkommensteuer-Vorauszahlung", 27, "1.650,00 € · wird abgebucht"],
  ];
  return (
    <div className="space-y-10 @dlg:space-y-12">
      <section className="grid gap-2 @dmd:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="on-dark flex flex-col justify-between gap-10 bg-[#111111] p-6 text-white @dsm:p-8">
          <div>
            <p className={cx("inline-flex min-h-7 items-center gap-2 rounded-[2px] bg-white/10 px-2.5 text-white/85", P.label)}>
              <Lock className="size-3.5" aria-hidden /> Mandantenportal
            </p>
            <h1 className={cx(SERIF, "mt-5 text-[clamp(2rem,6.4cqi,3.25rem)] leading-[1.02] font-extrabold text-white")}>
              Guten Tag,
              <br />
              Frau Petersen.
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/70">{open ? `${open === 1 ? "Eine Sache wartet" : `${open} Dinge warten`} auf Sie. Alles andere erledigen wir.` : "Im Moment ist nichts offen. Danke – so können wir zügig arbeiten."}</p>
          </div>
          <dl className="grid grid-cols-3 gap-4">
            {[
              [String(open), "offene Aufgaben"],
              [`${n}/${TARGET}`, `Belege ${monthName()}`],
              ["6", "Tage bis zur Frist"],
            ].map(([v, l]) => (
              <div key={l} className="border-t border-white/25 pt-4">
                <dd className={cx(SERIF, "num text-[clamp(1.375rem,6.8cqi,2rem)] leading-none font-extrabold whitespace-nowrap text-white @dlg:text-[2.5rem]")}>{v}</dd>
                <dt className="mt-2 text-[12.5px] leading-snug text-white/65">{l}</dt>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative min-h-[15rem] overflow-hidden bg-[#c9c9cd] @dmd:min-h-[24rem]">
          <Image src="/images/demo/photos/k-hero.webp" alt="Steuerberaterin Katrin Sommer im dunklen Blazer vor grauem Hintergrund" fill priority sizes="(min-width: 48rem) 28rem, 100vw" className="object-cover object-[center_22%] grayscale" />
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap items-center justify-between gap-3 bg-white/95 p-4">
            <p className="leading-tight">
              <span className={cx("block", P.label, P.muted)}>Ihre Ansprechpartnerin</span>
              <span className="mt-2 block text-[16px] font-extrabold text-[#111111]">Katrin Sommer</span>
              <span className="num mt-1 flex items-center gap-1.5 text-[13px]">
                <Phone className="size-3.5" aria-hidden /> 01234 220 114
              </span>
            </p>
            <button type="button" onClick={() => onTab("nachrichten")} className={cx(P.btn, P.dark)}>
              Nachricht
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4 border-b border-[#111111] pb-3">
          <h2 className={cx(SERIF, "text-[1.5rem] leading-none font-extrabold text-[#111111]")}>Was offen ist</h2>
          <p className={cx("num", P.label, P.muted)}>{open} von 3</p>
        </div>
        <div data-tour="aufgaben" className="divide-y divide-[#dcdcda] border-b border-[#dcdcda]" aria-label="Offene Aufgaben">
          <div className={row}>
            {num2(1, n >= TARGET)}
            <div className="min-w-0">
              <p className="text-[16px] leading-snug font-bold text-[#111111]">Belege für {monthName()} hochladen</p>
              <div className="mt-2.5 flex items-center gap-3">
                <div className="h-1.5 max-w-xs flex-1 bg-[#e3e3df]">
                  <div className="h-full bg-[#111111] transition-[width] duration-500" style={{ width: `${Math.min(100, (n / TARGET) * 100)}%` }} />
                </div>
                <p className={cx("num shrink-0 text-[13px]", P.muted)}>
                  {n} von etwa {TARGET}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => onTab("belege")} className={cx(P.btn, P.dark, "col-start-2 justify-self-start @dmd:col-start-3")}>
              Belege hochladen <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
          <div className={row}>
            {num2(2, !!s.approved)}
            <div className="min-w-0">
              <p className={cx("text-[16px] leading-snug font-bold text-[#111111]", s.approved && "line-through decoration-1 opacity-55")}>Einkommensteuererklärung 2025 prüfen und freigeben</p>
              <p className={cx("mt-1 text-[13.5px]", P.muted)}>
                {s.approved ? (
                  <>
                    Freigegeben heute um <span className="num">{s.approved}</span> Uhr
                  </>
                ) : (
                  <>
                    Abgabe beim Finanzamt geplant für <span className="num">{fmtDay(day(9))}</span>
                  </>
                )}
              </p>
            </div>
            {!s.approved && (
              <button type="button" onClick={() => onTab("dokumente")} className={cx(P.btn, P.ghost, "col-start-2 justify-self-start @dmd:col-start-3")}>
                Ansehen
              </button>
            )}
          </div>
          <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-x-4 py-5">
            {num2(3, s.answered)}
            <div className="min-w-0">
              <p className={cx("text-[16px] leading-snug font-bold text-[#111111]", s.answered && "line-through decoration-1 opacity-55")}>Rückfrage zum Beleg „Restaurant Zur Linde“, 86,50 €</p>
              <p className={cx("mt-1 text-[13.5px]", P.muted)}>{s.answered ? "Beantwortet – vielen Dank." : "Bewirtungsbeleg: Wer hat teilgenommen und was war der Anlass?"}</p>
              {!s.answered && (
                <form
                  className="mt-3 flex max-w-xl flex-wrap gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    s.answer(text.trim() || "Besprechung mit Lieferant Hansen, zwei Personen, Thema Jahresvertrag.");
                  }}
                >
                  <label className="min-w-[12rem] flex-1">
                    <span className="sr-only">Antwort auf die Rückfrage</span>
                    <input value={text} onChange={(e) => setText(e.target.value)} maxLength={200} placeholder="z. B. Besprechung mit Lieferant, zwei Personen" className={P.input} />
                  </label>
                  <button type="submit" className={cx(P.btn, P.ghost)}>
                    Antworten
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-10 @dmd:grid-cols-2 @dmd:gap-12">
        <section>
          <h2 className={cx("border-b border-[#111111] pb-3", P.label, "text-[#111111]")}>Zuletzt für Sie erledigt</h2>
          <ul className="divide-y divide-[#dcdcda] border-b border-[#dcdcda] text-[14.5px]">
            {[
              [`Umsatzsteuer-Voranmeldung ${monthName(-1)} übermittelt`, fmtDay(day(-3))],
              [`Lohnabrechnungen ${monthName(-1)} bereitgestellt`, fmtDay(day(-7))],
              ["Einspruch gegen Vorauszahlungsbescheid – stattgegeben", fmtDay(day(-15))],
            ].map(([t, w]) => (
              <li key={t} className="flex items-start gap-3 py-3.5">
                <Check className="mt-1 size-4 shrink-0 text-[#111111]" strokeWidth={2.5} aria-hidden />
                <span className="min-w-0 flex-1 text-[#111111]">{t}</span>
                <span className={cx("num shrink-0 text-[13px]", P.muted)}>{w}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className={cx("border-b border-[#111111] pb-3", P.label, "text-[#111111]")}>Nächste Fristen</h2>
          <ul className="divide-y divide-[#dcdcda] border-b border-[#dcdcda]">
            {deadlines.map(([t, off, note]) => (
              <li key={t} className="flex items-center gap-4 py-3">
                <span className="num grid w-12 shrink-0 text-center leading-none">
                  <span className={cx(SERIF, "text-[1.5rem] font-extrabold text-[#111111]")}>{day(off).getDate()}</span>
                  <span className={cx("mt-1.5 text-[10px]", P.label, P.muted)}>{monthName((day(off).getMonth() - new Date().getMonth() + 12) % 12).slice(0, 3)}</span>
                </span>
                <span className="min-w-0 border-l border-[#dcdcda] pl-4 leading-tight">
                  <span className="block text-[14.5px] font-bold text-[#111111]">{t}</span>
                  <span className={cx("num mt-1 block text-[13px]", P.muted)}>{note}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="grid border border-[#dcdcda] @dsm:grid-cols-[14rem_minmax(0,1fr)]">
        <div className="relative aspect-[16/9] overflow-hidden @dsm:aspect-auto">
          <Image src="/images/demo/photos/k-building.webp" alt="Kanzleigebäude von Albrecht & Sommer mit Glasfassade" fill sizes="(min-width: 40rem) 14rem, 100vw" className="object-cover grayscale" />
        </div>
        <dl className="grid gap-x-8 gap-y-4 p-5 text-[14px] @dsm:grid-cols-3 @dsm:p-6">
          {[
            ["Kanzlei", "Am Stadtgraben 14, Musterstadt"],
            ["Erreichbar", "Mo – Do 8 – 17 Uhr, Fr bis 14 Uhr"],
            ["Sicherheit", "Hosting in Deutschland, Anmeldung in zwei Schritten"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className={cx(P.label, P.muted)}>{k}</dt>
              <dd className="num mt-2 leading-snug font-semibold text-[#111111]">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

const R_LABEL: Record<ReceiptStatus, string> = { liest: "wird gelesen …", erkannt: "erkannt – bitte prüfen", geprueft: "geprüft", rueckfrage: "Rückfrage" };
const R_TONE = { liest: "info", erkannt: "warn", geprueft: "ok", rueckfrage: "bad" } as const;

function Receipts({ s }: { s: State }) {
  const n = delivered(s);
  const [edit, setEdit] = useState<number | null>(null);
  const [draft, setDraft] = useState({ vendor: "", amount: "", cat: "" });
  const amount = Number(draft.amount.replace(/\./g, "").replace(",", "."));
  const badDraft = { vendor: draft.vendor.trim().length < 2, amount: !draft.amount.trim() || !Number.isFinite(amount) || amount <= 0 };
  const cols = "@dmd:grid-cols-[6.5rem_minmax(0,1.4fr)_minmax(0,1fr)_7.5rem_minmax(0,15rem)]";
  return (
    <div>
      <PageHead label={`Belege · ${monthName()}`} title="Belege">
        <dl className="num flex gap-8">
          <div>
            <dt className={cx(P.label, P.muted)}>Geliefert</dt>
            <dd className={cx(SERIF, "mt-2 text-[1.5rem] leading-none font-extrabold text-[#111111]")}>
              {n}
              <span className={cx("text-[14px] font-semibold", P.muted)}> / {TARGET}</span>
            </dd>
          </div>
          <div>
            <dt className={cx(P.label, P.muted)}>Summe erkannt</dt>
            <dd className={cx(SERIF, "mt-2 text-[1.5rem] leading-none font-extrabold text-[#111111]")}>{eur(s.receipts.filter((r) => r.status !== "liest").reduce((a, r) => a + r.amount, 0))}</dd>
          </div>
        </dl>
      </PageHead>

      <div data-tour="upload" className="mt-6 grid gap-6 border border-dashed border-[#111111] bg-[#f5f5f4] p-6 @dmd:grid-cols-[minmax(0,1fr)_auto] @dmd:items-center @dsm:p-8">
        <div className="flex gap-4">
          <span className="grid size-12 shrink-0 place-items-center bg-[#111111] text-white" aria-hidden>
            <Upload className="size-5" strokeWidth={1.75} />
          </span>
          <div className="min-w-0">
            <p className="text-[17px] leading-snug font-extrabold text-[#111111]">Beleg fotografieren oder Datei hierher ziehen</p>
            <p className="mt-1.5 max-w-md text-[14px] leading-relaxed">Lieferant, Datum, Betrag und Kategorie lesen wir automatisch aus. Sie prüfen nur noch.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={s.upload} className={cx(P.btn, P.dark, "min-h-12")}>
            <Camera className="size-4" aria-hidden /> Beleg aufnehmen
          </button>
          <button type="button" onClick={s.upload} className={cx(P.btn, P.ghost, "min-h-12 bg-white")}>
            <FileText className="size-4" aria-hidden /> PDF auswählen
          </button>
        </div>
        <p className={cx("text-[12px] @dmd:col-span-2", P.muted)}>Demo: Ein Klick fügt einen Beispielbeleg hinzu – es wird nichts hochgeladen.</p>
      </div>

      <div className="mt-8">
        <div className={cx("hidden gap-x-4 border-b border-[#111111] pb-2.5 @dmd:grid", cols, P.label, P.muted)}>
          <span>Datum</span>
          <span>Lieferant</span>
          <span>Kategorie</span>
          <span className="text-right">Betrag</span>
          <span>Stand</span>
        </div>
        <ul className="border-t border-[#111111] @dmd:border-t-0">
          {s.receipts.map((r) => (
            <li key={r.id} className={cx("border-b border-[#dcdcda]", r.fresh && r.status === "erkannt" && "animate-demo-flash")}>
              {r.status === "liest" ? (
                <p className={cx("flex min-h-14 items-center gap-3 py-3 text-[14px]", P.muted)} role="status">
                  <ScanLine className="size-5 shrink-0 animate-pulse text-[#111111]" aria-hidden /> Beleg wird gelesen …
                  <span className="h-1.5 w-32 overflow-hidden bg-[#e3e3df]">
                    <span className="block h-full w-1/2 animate-pulse bg-[#111111]" />
                  </span>
                </p>
              ) : (
                <div className={cx("grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1.5 py-3.5 text-[14.5px]", cols)}>
                  <span className={cx("num order-3 text-[13px] @dmd:order-none @dmd:text-[14px]", P.muted)}>{r.date}</span>
                  <span className="order-1 min-w-0 font-bold break-words text-[#111111] @dmd:order-none">{r.vendor}</span>
                  <span className="order-4 justify-self-end text-[13px] @dmd:order-none @dmd:justify-self-start @dmd:text-[14.5px]">{r.cat}</span>
                  <span className="num order-2 text-right font-bold text-[#111111] @dmd:order-none">{eur(r.amount)}</span>
                  <span className="order-5 col-span-2 flex flex-wrap items-center gap-2 @dmd:order-none @dmd:col-span-1">
                    <span className={cx(r.status === "erkannt" && "w-full @dxl:w-auto")}>
                      <Tag tone={R_TONE[r.status]} className="rounded-[2px]">
                        {R_LABEL[r.status]}
                      </Tag>
                    </span>
                    {r.status === "erkannt" && edit !== r.id && (
                      <>
                        <button type="button" onClick={() => s.confirm(r.id)} className={cx(P.btn, P.dark, "min-h-11 flex-1 px-3 text-[13px] @dmd:min-h-9 @dmd:flex-none")}>
                          Stimmt so
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEdit(r.id);
                            setDraft({ vendor: r.vendor, amount: r.amount.toFixed(2).replace(".", ","), cat: r.cat });
                          }}
                          className={cx(P.btn, P.ghost, "min-h-11 flex-1 px-3 text-[13px] @dmd:min-h-9 @dmd:flex-none")}
                        >
                          Korrigieren
                        </button>
                      </>
                    )}
                  </span>
                </div>
              )}
              {edit === r.id && r.status === "erkannt" && (
                <form
                  noValidate
                  className="mb-4 grid gap-4 border border-[#111111] bg-[#f5f5f4] p-4 @dmd:grid-cols-[minmax(0,1.4fr)_8rem_minmax(0,1fr)_auto] @dmd:items-end"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (badDraft.vendor || badDraft.amount) return;
                    s.fix(r.id, { vendor: draft.vendor.trim(), amount, cat: draft.cat });
                    setEdit(null);
                  }}
                >
                  <label className="block">
                    <span className={cx("mb-2 block", P.label, P.muted)}>Lieferant</span>
                    <input value={draft.vendor} onChange={(e) => setDraft((d) => ({ ...d, vendor: e.target.value }))} maxLength={60} aria-invalid={badDraft.vendor} className={cx(P.input, badDraft.vendor && "border-bo-bad")} />
                  </label>
                  <label className="block">
                    <span className={cx("mb-2 block", P.label, P.muted)}>Betrag in €</span>
                    <input value={draft.amount} onChange={(e) => setDraft((d) => ({ ...d, amount: e.target.value }))} inputMode="decimal" maxLength={12} aria-invalid={badDraft.amount} className={cx(P.input, "num text-right", badDraft.amount && "border-bo-bad")} />
                  </label>
                  <label className="block">
                    <span className={cx("mb-2 block", P.label, P.muted)}>Kategorie</span>
                    <select value={draft.cat} onChange={(e) => setDraft((d) => ({ ...d, cat: e.target.value }))} className={P.input}>
                      {CATEGORIES.map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" disabled={badDraft.vendor || badDraft.amount} className={cx(P.btn, P.dark, "flex-1")}>
                      Freigeben
                    </button>
                    <button type="button" onClick={() => setEdit(null)} className={cx(P.btn, P.ghost, "bg-white")}>
                      Abbrechen
                    </button>
                  </div>
                  {(badDraft.vendor || badDraft.amount) && (
                    <p role="alert" className="text-[13px] font-medium text-bo-bad @dmd:col-span-4">
                      {badDraft.vendor ? "Bitte den Lieferanten eintragen." : "Bitte einen Betrag über 0 € eintragen, zum Beispiel 49,95."}
                    </p>
                  )}
                </form>
              )}
            </li>
          ))}
        </ul>
        {s.receipts.length === 0 && <p className={cx("border-b border-[#dcdcda] py-10 text-center", P.muted)}>Noch keine Belege in diesem Monat.</p>}
      </div>
    </div>
  );
}

function Documents({ s }: { s: State }) {
  const { go } = useDemo();
  const [folder, setFolder] = useState("freigabe");
  const [checked, setChecked] = useState(false);
  const f = FOLDERS.find((x) => x.id === folder)!;
  const rows: [string, string, boolean?][] = [
    ["Einkünfte aus Gewerbebetrieb", "48.612,00 €"],
    ["Sonderausgaben und Vorsorge", "− 7.940,00 €"],
    ["Zu versteuerndes Einkommen", "40.672,00 €"],
    ["Festzusetzende Einkommensteuer", "9.874,00 €"],
    ["Geleistete Vorauszahlungen", "− 8.400,00 €"],
    ["Nachzahlung", "1.474,00 €", true],
  ];
  return (
    <div>
      <PageHead label="Ablage" title="Dokumente" />
      <div className="mt-6 grid gap-6 @dmd:grid-cols-[13.5rem_minmax(0,1fr)] @dmd:gap-8">
        <nav aria-label="Ordner" className="min-w-0">
          <ul className="no-bar -mx-4 flex gap-1.5 overflow-x-auto px-4 @dsm:-mx-6 @dsm:px-6 @dmd:mx-0 @dmd:block @dmd:space-y-0.5 @dmd:px-0">
            {FOLDERS.map((x) => (
              <li key={x.id} className="shrink-0">
                <button type="button" aria-current={folder === x.id ? "true" : undefined} onClick={() => setFolder(x.id)} className={cx("flex min-h-11 w-full items-center gap-2.5 rounded-[2px] border px-3 text-left text-[14px] font-semibold transition-colors", folder === x.id ? "border-[#111111] bg-[#111111] text-white" : "border-[#dcdcda] text-[#3f3f3a] hover:border-[#111111] @dmd:border-transparent")}>
                  <FolderOpen className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  <span className="flex-1 whitespace-nowrap">{x.name}</span>
                  {x.id === "freigabe" && !s.approved ? <span className={cx("num rounded-[2px] px-1.5 text-[11px] leading-5 font-bold", folder === x.id ? "bg-white text-[#111111]" : "bg-[#111111] text-white")}>1</span> : <span className={cx("num text-[12px]", folder === x.id ? "text-white/70" : P.muted)}>{x.files.length}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {folder === "freigabe" ? (
          <section data-tour="freigabe" className={cx(card, "min-w-0")}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dcdcda] px-5 py-4">
              <h2 className="text-[15px] font-extrabold tracking-normal text-[#111111]">Einkommensteuererklärung 2025 – Entwurf</h2>
              <Tag tone={s.approved ? "ok" : "warn"} className="rounded-[2px]">
                {s.approved ? `freigegeben · heute ${s.approved} Uhr` : "wartet auf Ihre Freigabe"}
              </Tag>
            </div>
            <div className="bg-[#ececea] p-4 @dsm:p-8">
              {/* Dokumentvorschau als Blatt Papier */}
              <div className="mx-auto max-w-xl bg-white px-6 py-8 shadow-[0_1px_2px_rgb(0_0_0/0.14),0_18px_36px_-20px_rgb(0_0_0/0.35)] @dsm:px-10 @dsm:py-10">
                <p className="flex items-start justify-between gap-4 border-b-2 border-[#111111] pb-4">
                  <span className={cx(SERIF, "text-[1.125rem] leading-tight font-extrabold text-[#111111]")}>
                    Albrecht & Sommer
                    <span className={cx("mt-1.5 block text-[10px] font-bold", P.label, P.muted)}>Steuerberatung</span>
                  </span>
                  <span className={cx("num text-right text-[11.5px] leading-snug", P.muted)}>
                    Mandant 10482
                    <br />
                    {fmtDate(day(-1))}
                  </span>
                </p>
                <h3 className={cx(SERIF, "mt-6 text-[1.375rem] leading-tight font-extrabold text-[#111111]")}>Einkommensteuererklärung 2025</h3>
                <p className={cx("mt-1 text-[13px]", P.muted)}>Jana Petersen · Zusammenfassung der Berechnung</p>
                <table className="num mt-5 w-full text-[13.5px]">
                  <tbody>
                    {rows.map(([k, v, strong]) => (
                      <tr key={k} className={cx("border-t border-[#dcdcda]", strong && "border-t-2 border-[#111111] text-[15.5px] font-extrabold text-[#111111]")}>
                        <td className="py-2.5 pr-3">{k}</td>
                        <td className="py-2.5 text-right whitespace-nowrap">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className={cx("mt-5 text-[12px] leading-relaxed", P.muted)}>Die Nachzahlung entsteht durch den höheren Gewinn gegenüber 2024. Wir empfehlen, die Vorauszahlungen für 2026 anzupassen – dazu melden wir uns gesondert.</p>
                {s.approved && (
                  <p className="mt-6 inline-block -rotate-2 border-2 border-[#111111] px-3 py-2 text-[12px] leading-tight font-extrabold tracking-[0.1em] text-[#111111] uppercase">
                    Digital freigegeben
                    <span className="num mt-1 block text-[10.5px] font-medium tracking-normal normal-case">
                      J. Petersen · {fmtDate(day())} · {s.approved} Uhr
                    </span>
                  </p>
                )}
              </div>
            </div>
            {s.approved ? (
              <p className="border-t border-[#dcdcda] bg-[#f5f5f4] px-5 py-4 text-[13.5px]">
                <strong className="font-bold text-[#111111]">So sieht es die Kanzlei:</strong> Die Freigabe ist mit Zeitstempel im Mandat vermerkt, die Erklärung kann übermittelt werden.{" "}
                <button type="button" onClick={() => go("betrieb", "postfach")} className="min-h-11 font-bold text-[#111111] underline underline-offset-4">
                  In der Kanzlei-Ansicht ansehen
                </button>
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dcdcda] px-5 py-4">
                <label className="flex min-h-11 items-center gap-3 text-[14.5px] font-medium text-[#111111]">
                  <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="size-5 shrink-0 accent-[#111111]" /> Ich habe die Angaben geprüft und bin einverstanden.
                </label>
                <button type="button" disabled={!checked} onClick={s.approve} className={cx(P.btn, P.dark, "min-h-12")}>
                  Erklärung freigeben
                </button>
              </div>
            )}
          </section>
        ) : (
          <section className={cx(card, "min-w-0")}>
            <h2 className="border-b border-[#dcdcda] px-5 py-4 text-[15px] font-extrabold tracking-normal text-[#111111]">{f.name}</h2>
            <ul className="divide-y divide-[#dcdcda]">
              {f.files.map((name, i) => (
                <li key={name} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="grid size-10 shrink-0 place-items-center bg-[#f5f5f4] text-[#111111]" aria-hidden>
                    <FileText className="size-5" strokeWidth={1.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-[#111111]">{name}</p>
                    <p className={cx("num text-[12.5px]", P.muted)}>
                      PDF · {120 + i * 87} KB · bereitgestellt am {d(-(4 + i * 19))}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}

function Thread({ msgs, me }: { msgs: Msg[]; me: Msg["from"] }) {
  return (
    <ol className="space-y-3">
      {msgs.map((m, i) => {
        const mine = m.from === me;
        return (
          <li key={i} className={cx("flex", mine && "justify-end")}>
            <div className={cx("max-w-[85%] min-w-0 rounded-[var(--bo-r)] px-4 py-3 text-[14px] leading-relaxed", mine ? "bg-d-deep text-white" : "border border-bo-line bg-white text-bo-body")}>
              <p className="break-words whitespace-pre-line">{m.text}</p>
              <p className={cx("num mt-1 text-[11.5px]", mine ? "text-white/60" : "text-bo-muted")}>
                {m.from === "kanzlei" ? "Katrin Sommer" : "Jana Petersen"} · {m.at}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Composer({ onSend, placeholder }: { onSend: (t: string) => void; placeholder: string }) {
  const [text, setText] = useState("");
  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">Nachricht</span>
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder={placeholder} className="min-h-12 w-full rounded-[var(--bo-rc)] border border-bo-line bg-white px-3 text-[16px] text-bo-ink outline-none focus:border-bo-ink @dsm:text-[14px]" />
      </label>
      <button type="submit" aria-label="Nachricht senden" className="grid min-h-12 w-12 place-items-center rounded-[var(--bo-rc)] bg-d-accent text-white hover:bg-d-deep">
        <Send className="size-4" aria-hidden />
      </button>
    </form>
  );
}

function Messages({ s }: { s: State }) {
  return (
    <div>
      <PageHead label="Postfach" title="Nachrichten">
        <p className={cx("flex max-w-xs items-start gap-2 text-[13px] leading-snug", P.muted)}>
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Verschlüsselt übertragen, nur für Sie und Ihre Kanzlei sichtbar.
        </p>
      </PageHead>
      <div className="mt-6 max-w-2xl">
        <Thread msgs={s.msgs} me="mandant" />
        <Composer onSend={(t) => s.send("mandant", t)} placeholder="Nachricht an Frau Sommer" />
      </div>
    </div>
  );
}

/* ───────────────────────────── Kanzlei-Ansicht ───────────────────────────── */

const CLIENTS = [
  { name: "Malerbetrieb Thomsen GmbH", form: "GmbH", got: 41, of: 45, asks: 0, due: "USt-VA", in: 6, by: "K. Sommer" },
  { name: "Praxis Dr. Vogel", form: "Freiberuflich", got: 22, of: 22, asks: 0, due: "Lohn", in: 12, by: "M. Albrecht" },
  { name: "Fahrradladen Speiche", form: "Einzelunternehmen", got: 9, of: 35, asks: 3, due: "USt-VA", in: 6, by: "K. Sommer" },
  { name: "Wilke Haustechnik", form: "GmbH & Co. KG", got: 58, of: 70, asks: 1, due: "USt-VA", in: 6, by: "M. Albrecht" },
  { name: "Yogastudio Atemraum", form: "Einzelunternehmen", got: 3, of: 18, asks: 2, due: "USt-VA", in: 6, by: "K. Sommer" },
  { name: "Architekturbüro Lindqvist", form: "Partnerschaft", got: 27, of: 30, asks: 0, due: "Jahresabschluss", in: 21, by: "M. Albrecht" },
  { name: "Hofladen Sonnenfeld", form: "GbR", got: 15, of: 25, asks: 1, due: "Lohn", in: 12, by: "K. Sommer" },
];

function Office({ s }: { s: State }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { mandanten: "Mandanten", fristen: "Fristen", postfach: "Postfach", zahlen: "Auswertung" };
  const fresh = s.receipts.filter((r) => r.fresh).length + (s.approved ? 1 : 0) + s.msgs.filter((m) => m.from === "mandant" && m.at.startsWith("heute")).length;
  return (
    <Backoffice
      user="Katrin Sommer"
      role="Steuerberaterin"
      title={titles[tab] ?? "Mandanten"}
      nav={[
        { id: "mandanten", label: "Mandanten", icon: Users },
        { id: "fristen", label: "Fristen", icon: CalendarClock },
        { id: "postfach", label: "Postfach", icon: Inbox, count: fresh },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "fristen" ? <Deadlines s={s} /> : tab === "postfach" ? <Mailbox s={s} /> : tab === "zahlen" ? <Numbers s={s} /> : <ClientTable s={s} />}
    </Backoffice>
  );
}

function ClientTable({ s }: { s: State }) {
  const me = { name: "Café Rosenhof · J. Petersen", form: "Einzelunternehmen", got: delivered(s), of: TARGET, asks: s.answered ? 0 : 1, due: "USt-VA", in: 6, by: "K. Sommer", live: true };
  const list = [me, ...CLIENTS.map((c) => ({ ...c, live: false }))].sort((a, b) => a.got / a.of - b.got / b.of);
  return (
    <Panel flush tour="mandanten" title={`Belegstand ${monthName()}`} aside="sortiert nach Rückstand">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Mandant</th>
              <th className={th}>Rechtsform</th>
              <th className={th}>Belege geliefert</th>
              <th className={th}>Rückfragen</th>
              <th className={th}>Nächste Frist</th>
              <th className={th}>Betreuung</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => {
              const pct = Math.min(100, Math.round((c.got / c.of) * 100));
              return (
                <tr key={c.name} className={cx(tr, c.live && "bg-d-soft/70")}>
                  <td className={cx(td, "font-medium text-bo-ink")}>
                    {c.name}
                    {c.live && <span className="ml-2 text-[12px] font-normal text-bo-muted">(du, im Portal)</span>}
                  </td>
                  <td className={td}>{c.form}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-28 rounded-[var(--bo-rc)] bg-bo-bg">
                        <div className={cx("h-full rounded-[var(--bo-rc)] transition-[width] duration-500", pct >= 90 ? "bg-bo-ok" : pct >= 50 ? "bg-[#c8860a]" : "bg-bo-bad")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="num text-bo-ink">
                        {c.got} / {c.of}
                      </span>
                    </div>
                  </td>
                  <td className={td}>{c.asks ? <Tag tone="warn">{c.asks} offen</Tag> : <span className="text-bo-muted">–</span>}</td>
                  <td className={cx(td, "num")}>
                    {c.due} · in {c.in} Tagen
                  </td>
                  <td className={td}>{c.by}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Deadlines({ s }: { s: State }) {
  const [done, setDone] = useState<string[]>([]);
  const items = [
    { id: "a", in: 6, type: "USt-VA", client: "Fahrradladen Speiche", ready: false, note: "26 Belege fehlen" },
    { id: "b", in: 6, type: "USt-VA", client: "Yogastudio Atemraum", ready: false, note: "15 Belege fehlen" },
    { id: "c", in: 6, type: "USt-VA", client: "Café Rosenhof · J. Petersen", ready: delivered(s) >= TARGET, note: delivered(s) >= TARGET ? "Belege vollständig" : `${TARGET - delivered(s)} Belege fehlen` },
    { id: "d", in: 6, type: "USt-VA", client: "Malerbetrieb Thomsen GmbH", ready: true, note: "Belege vollständig" },
    { id: "e", in: 9, type: "ESt 2025", client: "Café Rosenhof · J. Petersen", ready: !!s.approved, note: s.approved ? `vom Mandanten freigegeben, ${s.approved} Uhr` : "wartet auf Freigabe des Mandanten" },
    { id: "f", in: 12, type: "Lohn", client: "Praxis Dr. Vogel", ready: true, note: "Stunden gemeldet" },
    { id: "g", in: 12, type: "Lohn", client: "Hofladen Sonnenfeld", ready: false, note: "Stunden der Aushilfen fehlen" },
    { id: "h", in: 21, type: "Jahresabschluss", client: "Architekturbüro Lindqvist", ready: true, note: "in Bearbeitung" },
  ];
  const groups = [...new Set(items.map((i) => i.in))];
  return (
    <div data-tour="fristen" className="space-y-4">
      {groups.map((g) => (
        <Panel key={g} flush title={`${fmtDay(day(g))} · in ${g} Tagen`} aside={`${items.filter((i) => i.in === g && !i.ready).length} noch nicht abgabereif`}>
          <ul>
            {items
              .filter((i) => i.in === g)
              .map((i, n) => {
                const d = done.includes(i.id);
                return (
                  <li key={i.id} className={cx("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5", n > 0 && "border-t border-bo-line")}>
                    <label className="flex min-h-9 min-w-0 flex-1 cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={d} onChange={() => setDone((x) => (d ? x.filter((y) => y !== i.id) : [...x, i.id]))} className="size-4 accent-[var(--d-accent)]" />
                      <span className="w-28 shrink-0">
                        <Tag>{i.type}</Tag>
                      </span>
                      <span className={cx("truncate font-medium text-bo-ink", d && "line-through opacity-50")}>{i.client}</span>
                    </label>
                    <Tag tone={d ? "neutral" : i.ready ? "ok" : "warn"}>{d ? "übermittelt" : i.note}</Tag>
                  </li>
                );
              })}
          </ul>
        </Panel>
      ))}
    </div>
  );
}

function Mailbox({ s }: { s: State }) {
  const events = [
    ...(s.approved ? [{ icon: Check, who: "Café Rosenhof · J. Petersen", what: "hat die Einkommensteuererklärung 2025 freigegeben", at: `heute, ${s.approved}`, live: true }] : []),
    ...s.receipts.filter((r) => r.fresh).map((r) => ({ icon: ScanLine, who: "Café Rosenhof · J. Petersen", what: r.status === "liest" ? "lädt einen Beleg hoch …" : `Beleg ${r.vendor}, ${eur(r.amount)} – vorkontiert als ${r.cat}`, at: "heute", live: true })),
    { icon: Upload, who: "Wilke Haustechnik", what: "14 Belege hochgeladen, 13 automatisch vorkontiert", at: "heute, 08:02", live: false },
    { icon: MessageSquare, who: "Hofladen Sonnenfeld", what: "„Die Stunden der Aushilfen schicke ich morgen früh.“", at: `${fmtDay(day(-1))}, 19:27`, live: false },
    { icon: Upload, who: "Malerbetrieb Thomsen GmbH", what: "Kontoauszüge und 9 Belege hochgeladen", at: `${fmtDay(day(-1))}, 17:45`, live: false },
    { icon: Check, who: "Praxis Dr. Vogel", what: "hat den Jahresabschluss 2024 freigegeben", at: `${fmtDay(day(-2))}, 11:03`, live: false },
  ];
  return (
    <div data-tour="postfach" className="grid gap-4 @dlg:grid-cols-[minmax(0,1fr)_24rem]">
      <Panel flush title="Eingang" aside="alle Mandate">
        <ul>
          {events.map((e, i) => (
            <li key={i} className={cx("flex items-start gap-3 px-4 py-3", i > 0 && "border-t border-bo-line", e.live && "bg-d-soft/60")}>
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-[var(--bo-rc)] bg-bo-bg text-bo-body">
                <e.icon className="size-3.5" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13.5px] font-medium text-bo-ink">{e.who}</p>
                <p className="text-[13px] text-bo-body">{e.what}</p>
              </div>
              <span className="num shrink-0 text-[12px] text-bo-muted">{e.at}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Panel title="Café Rosenhof · J. Petersen" aside="Nachrichten">
        <Thread msgs={s.msgs} me="kanzlei" />
        <Composer onSend={(t) => s.send("kanzlei", t)} placeholder="Antwort an Frau Petersen" />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["Vielen Dank, das genügt uns.", "Bitte reichen Sie den Beleg noch einmal lesbar nach."].map((t) => (
            <Btn key={t} size="sm" onClick={() => s.send("kanzlei", t)}>
              {t}
            </Btn>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function Numbers({ s }: { s: State }) {
  const fresh = s.receipts.filter((r) => r.fresh).length;
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Mandate im Portal", value: 142, note: "von 168 insgesamt" },
          { label: `Belege im ${monthName()}`, value: num(3418 + fresh), note: "91 % automatisch vorkontiert" },
          { label: "Pünktlich vollständig", value: "81 %", note: "vor dem Portal: 54 %" },
          { label: "Rückfragen je Mandat", value: "1,2", note: "vorher: 3,7 im Monat" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-[1.3fr_1fr]">
        <Panel title="Wann Belege eingehen" aside="Tag im Monat">
          <Bars
            label="Belegeingang nach Tag im Monat"
            data={[
              { label: "1–5", value: 380 },
              { label: "6–10", value: 240 },
              { label: "11–15", value: 310 },
              { label: "16–20", value: 420 },
              { label: "21–25", value: 760 },
              { label: "26–31", value: 1308 + fresh },
            ]}
            mark={5}
            format={num}
          />
          <p className="mt-3 text-[12.5px] text-bo-muted">Erinnerungen gehen am 20. und 26. automatisch an Mandate mit Rückstand.</p>
        </Panel>
        <Panel title="Eingesparte Zeit je Monat" aside="Schätzung der Kanzlei">
          <Ranks
            data={[
              { label: "Belege sortieren und erfassen", value: 46 },
              { label: "Unterlagen nachfordern", value: 21 },
              { label: "Freigaben einholen", value: 9 },
              { label: "Dokumente versenden", value: 7 },
            ]}
            format={(n) => `${n} Std.`}
          />
        </Panel>
      </div>
    </div>
  );
}
