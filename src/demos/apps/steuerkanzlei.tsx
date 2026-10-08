"use client";

import { useRef, useState } from "react";
import { CalendarClock, Camera, ChartColumn, Check, FileText, FolderOpen, Inbox, Lock, MessageSquare, Phone, ScanLine, Send, Upload, Users } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Figures, Panel, Ranks, Tag, td, th, tr } from "@/demos/kit/ui";
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
  send: (from: Msg["from"], text: string) => void;
  approve: () => void;
  answer: (text: string) => void;
}
const baseCount = 5; // bereits früher im Monat geliefert, nicht einzeln gelistet
const delivered = (s: State) => baseCount + s.receipts.length;

/* ───────────────────────────── Mandantenportal ───────────────────────────── */

const SERIF = "font-d-display tracking-[-0.01em]";

function Portal({ s }: { s: State }) {
  const { tab, setTab } = useDemo();
  const nav = [
    { id: "uebersicht", label: "Übersicht", icon: Check },
    { id: "belege", label: "Belege", icon: ScanLine },
    { id: "dokumente", label: "Dokumente", icon: FolderOpen },
    { id: "nachrichten", label: "Nachrichten", icon: MessageSquare },
  ];
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-[#f7f6f2] font-plex text-[15px] text-[#39423d]">
      <header className="border-b border-[#dcdad0] bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 pt-3 sm:px-6">
          <p className="pb-3 leading-none">
            <span className={cx(SERIF, "block text-[1.35rem] font-semibold text-d-deep")}>Albrecht & Sommer</span>
            <span className="mt-1 block text-[10.5px] tracking-[0.2em] text-[#7a827c] uppercase">Steuerberatung · Mandantenportal</span>
          </p>
          <p className="flex items-center gap-2 pb-3 text-[13px] text-[#5d6660]">
            <Lock className="size-3.5 text-d-accent" aria-hidden /> Angemeldet: Jana Petersen · Café Rosenhof
          </p>
        </div>
        <nav aria-label="Portal" className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 [scrollbar-width:none] sm:px-6">
          {nav.map((n) => (
            <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("flex min-h-11 shrink-0 items-center gap-2 border-b-2 px-3 text-[14px] font-medium", tab === n.id ? "border-d-accent text-d-deep" : "border-transparent text-[#6b746e] hover:text-d-deep")}>
              <n.icon className="size-4" strokeWidth={1.75} aria-hidden /> {n.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-7 sm:px-6">{tab === "belege" ? <Receipts s={s} /> : tab === "dokumente" ? <Documents s={s} /> : tab === "nachrichten" ? <Messages s={s} /> : <Overview s={s} onTab={setTab} />}</div>
    </div>
  );
}

const card = "rounded-lg border border-[#dcdad0] bg-white";

function Overview({ s, onTab }: { s: State; onTab: (t: string) => void }) {
  const [text, setText] = useState("");
  const n = delivered(s);
  const open = [n < TARGET, !s.approved, !s.answered].filter(Boolean).length;
  const task = "flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4";
  const doneMark = (done: boolean) => <span className={cx("grid size-6 shrink-0 place-items-center rounded-full border-2", done ? "border-d-accent bg-d-accent text-white" : "border-[#bfc4bb]")}>{done && <Check className="size-3.5" strokeWidth={3} aria-hidden />}</span>;
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18.5rem]">
      <div>
        <h1 className={cx(SERIF, "text-[2rem] leading-tight font-medium text-d-deep")}>Guten Tag, Frau Petersen.</h1>
        <p className="mt-1 text-[#5d6660]">{open ? `${open === 1 ? "Eine Sache wartet" : `${open} Dinge warten`} auf Sie. Alles andere erledigen wir.` : "Im Moment ist nichts offen. Danke – so können wir zügig arbeiten."}</p>

        <section data-tour="aufgaben" className={cx(card, "mt-6 divide-y divide-[#e7e5dc]")} aria-label="Offene Aufgaben">
          <div className={task}>
            {doneMark(n >= TARGET)}
            <div className="min-w-0 flex-1">
              <p className="font-medium text-d-deep">Belege für {monthName()} hochladen</p>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-1.5 flex-1 rounded-full bg-[#e7e5dc]">
                  <div className="h-full rounded-full bg-d-accent transition-[width] duration-500" style={{ width: `${Math.min(100, (n / TARGET) * 100)}%` }} />
                </div>
                <p className="num shrink-0 text-[13px] text-[#5d6660]">
                  {n} von etwa {TARGET}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => onTab("belege")} className="min-h-11 rounded-md bg-d-accent px-4 text-[14px] font-medium text-white hover:brightness-95">
              Belege hochladen
            </button>
          </div>
          <div className={task}>
            {doneMark(!!s.approved)}
            <div className="min-w-0 flex-1">
              <p className={cx("font-medium text-d-deep", s.approved && "line-through opacity-60")}>Einkommensteuererklärung 2025 prüfen und freigeben</p>
              <p className="text-[13px] text-[#5d6660]">{s.approved ? `Freigegeben heute um ${s.approved} Uhr` : `Abgabe beim Finanzamt geplant für ${fmtDay(day(9))}`}</p>
            </div>
            {!s.approved && (
              <button type="button" onClick={() => onTab("dokumente")} className="min-h-11 rounded-md border border-[#c5c9c0] px-4 text-[14px] font-medium hover:border-d-deep">
                Ansehen
              </button>
            )}
          </div>
          <div className="px-5 py-4">
            <div className="flex items-start gap-4">
              {doneMark(s.answered)}
              <div className="min-w-0 flex-1">
                <p className={cx("font-medium text-d-deep", s.answered && "line-through opacity-60")}>Rückfrage zum Beleg „Restaurant Zur Linde“, 86,50 €</p>
                <p className="text-[13px] text-[#5d6660]">{s.answered ? "Beantwortet – vielen Dank." : "Bewirtungsbeleg: Wer hat teilgenommen und was war der Anlass?"}</p>
                {!s.answered && (
                  <form
                    className="mt-3 flex flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      s.answer(text.trim() || "Besprechung mit Lieferant Hansen, zwei Personen, Thema Jahresvertrag.");
                    }}
                  >
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Antwort auf die Rückfrage</span>
                      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="z. B. Besprechung mit Lieferant, zwei Personen" className="min-h-11 w-full rounded-md border border-[#c5c9c0] bg-white px-3 text-[16px] text-d-deep outline-none focus:border-d-deep sm:text-[14px]" />
                    </label>
                    <button type="submit" className="min-h-11 rounded-md border border-[#c5c9c0] px-4 text-[14px] font-medium hover:border-d-deep">
                      Antworten
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        <h2 className="mt-8 text-[12px] font-semibold tracking-[0.14em] text-[#5d6660] uppercase">Zuletzt für Sie erledigt</h2>
        <ul className="mt-2 divide-y divide-[#e7e5dc] border-y border-[#e7e5dc] text-[14px]">
          {[
            [`Umsatzsteuer-Voranmeldung ${monthName(-1)} übermittelt`, fmtDay(day(-3))],
            [`Lohnabrechnungen ${monthName(-1)} bereitgestellt`, fmtDay(day(-7))],
            ["Einspruch gegen Vorauszahlungsbescheid – stattgegeben", fmtDay(day(-15))],
          ].map(([t, w]) => (
            <li key={t} className="flex justify-between gap-4 py-2.5">
              <span>{t}</span>
              <span className="num shrink-0 text-[#7a827c]">{w}</span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="space-y-4">
        <div className={cx(card, "p-5")}>
          <h2 className="text-[12px] font-semibold tracking-[0.14em] text-[#5d6660] uppercase">Ihre Ansprechpartnerin</h2>
          <div className="mt-3 flex items-center gap-3">
            <Avatar name="Katrin Sommer" />
            <div>
              <p className="font-medium text-d-deep">Katrin Sommer</p>
              <p className="text-[13px] text-[#5d6660]">Steuerberaterin</p>
            </div>
          </div>
          <p className="num mt-3 flex items-center gap-2 text-[14px]">
            <Phone className="size-3.5 text-d-accent" aria-hidden /> 01234 220 114
          </p>
          <button type="button" onClick={() => onTab("nachrichten")} className="mt-3 min-h-11 w-full rounded-md border border-[#c5c9c0] text-[14px] font-medium hover:border-d-deep">
            Nachricht schreiben
          </button>
        </div>
        <div className={cx(card, "p-5")}>
          <h2 className="text-[12px] font-semibold tracking-[0.14em] text-[#5d6660] uppercase">Nächste Fristen</h2>
          <ul className="mt-3 space-y-3 text-[14px]">
            {[
              ["Umsatzsteuer-Voranmeldung", 6, "Belege bis dahin vollständig"],
              ["Lohnmeldung", 12, "Stunden der Aushilfen melden"],
              ["Einkommensteuer-Vorauszahlung", 27, "1.650,00 € · wird abgebucht"],
            ].map(([t, off, note]) => (
              <li key={t as string} className="flex gap-3">
                <span className="num w-12 shrink-0 text-center leading-tight">
                  <span className="block text-[17px] font-semibold text-d-deep">{day(off as number).getDate()}.</span>
                  <span className="block text-[11px] text-[#7a827c]">{monthName((day(off as number).getMonth() - new Date().getMonth() + 12) % 12).slice(0, 3)}.</span>
                </span>
                <span>
                  <span className="block font-medium text-d-deep">{t}</span>
                  <span className="block text-[12.5px] text-[#5d6660]">{note}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}

const R_LABEL: Record<ReceiptStatus, string> = { liest: "wird gelesen …", erkannt: "erkannt – bitte prüfen", geprueft: "geprüft", rueckfrage: "Rückfrage" };
const R_TONE = { liest: "info", erkannt: "warn", geprueft: "ok", rueckfrage: "bad" } as const;

function Receipts({ s }: { s: State }) {
  const n = delivered(s);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={cx(SERIF, "text-[1.8rem] leading-tight font-medium text-d-deep")}>Belege {monthName()}</h1>
          <p className="num mt-1 text-[#5d6660]">
            {n} von etwa {TARGET} geliefert · Summe erkannt: {eur(s.receipts.filter((r) => r.status !== "liest").reduce((a, r) => a + r.amount, 0))}
          </p>
        </div>
      </div>

      <div data-tour="upload" className="mt-5 rounded-lg border-2 border-dashed border-[#b9c6bc] bg-d-soft/50 px-5 py-7 text-center">
        <Upload className="mx-auto size-7 text-d-accent" strokeWidth={1.5} aria-hidden />
        <p className="mt-2 font-medium text-d-deep">Beleg fotografieren oder Datei hierher ziehen</p>
        <p className="mx-auto mt-1 max-w-md text-[13.5px] text-[#5d6660]">Lieferant, Datum, Betrag und Kategorie lesen wir automatisch aus. Sie prüfen nur noch.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={s.upload} className="inline-flex min-h-12 items-center gap-2 rounded-md bg-d-accent px-5 font-medium text-white hover:brightness-95">
            <Camera className="size-4" aria-hidden /> Beleg aufnehmen
          </button>
          <button type="button" onClick={s.upload} className="inline-flex min-h-12 items-center gap-2 rounded-md border border-[#b9c6bc] bg-white px-5 font-medium text-d-deep hover:border-d-deep">
            <FileText className="size-4" aria-hidden /> PDF auswählen
          </button>
        </div>
        <p className="mt-3 text-[12px] text-[#7a827c]">Demo: Ein Klick fügt einen Beispielbeleg hinzu – es wird nichts hochgeladen.</p>
      </div>

      <div className={cx(card, "mt-5 overflow-x-auto")}>
        <table className="w-full min-w-[620px] text-[14px]">
          <thead>
            <tr className="text-left text-[11.5px] tracking-wide text-[#6b746e] uppercase">
              <th className="px-4 py-2.5 font-medium">Datum</th>
              <th className="px-3 py-2.5 font-medium">Lieferant</th>
              <th className="px-3 py-2.5 font-medium">Kategorie</th>
              <th className="px-3 py-2.5 text-right font-medium">Betrag</th>
              <th className="px-4 py-2.5 font-medium">Stand</th>
            </tr>
          </thead>
          <tbody>
            {s.receipts.map((r) => (
              <tr key={r.id} className={cx("border-t border-[#e7e5dc]", r.fresh && r.status === "erkannt" && "animate-demo-flash")}>
                {r.status === "liest" ? (
                  <td colSpan={4} className="px-4 py-3">
                    <span className="flex items-center gap-3 text-[#5d6660]">
                      <ScanLine className="size-4 animate-pulse text-d-accent" aria-hidden /> Beleg wird gelesen …
                      <span className="h-1.5 w-32 overflow-hidden rounded-full bg-[#e7e5dc]">
                        <span className="block h-full w-1/2 animate-pulse rounded-full bg-d-accent" />
                      </span>
                    </span>
                  </td>
                ) : (
                  <>
                    <td className="num px-4 py-3">{r.date}</td>
                    <td className="px-3 py-3 font-medium text-d-deep">{r.vendor}</td>
                    <td className="px-3 py-3">{r.cat}</td>
                    <td className="num px-3 py-3 text-right text-d-deep">{eur(r.amount)}</td>
                  </>
                )}
                <td className="px-4 py-2">
                  <span className="flex flex-wrap items-center gap-2">
                    <Tag tone={R_TONE[r.status]}>{R_LABEL[r.status]}</Tag>
                    {r.status === "erkannt" && (
                      <button type="button" onClick={() => s.confirm(r.id)} className="min-h-9 rounded-md border border-[#c5c9c0] px-2.5 text-[13px] font-medium hover:border-d-deep">
                        Stimmt so
                      </button>
                    )}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
    <div className="grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
      <nav aria-label="Ordner">
        <ul className="flex gap-1 overflow-x-auto md:block md:space-y-0.5">
          {FOLDERS.map((x) => (
            <li key={x.id} className="shrink-0">
              <button type="button" aria-current={folder === x.id ? "true" : undefined} onClick={() => setFolder(x.id)} className={cx("flex min-h-11 w-full items-center gap-2.5 rounded-md px-3 text-left text-[14px]", folder === x.id ? "bg-white font-medium text-d-deep shadow-[0_0_0_1px_#dcdad0]" : "text-[#5d6660] hover:text-d-deep")}>
                <FolderOpen className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                <span className="flex-1 whitespace-nowrap">{x.name}</span>
                {x.id === "freigabe" && !s.approved ? <span className="num rounded bg-d-accent px-1.5 text-[11px] font-semibold text-white">1</span> : <span className="num text-[12px] text-[#7a827c]">{x.files.length}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {folder === "freigabe" ? (
        <section data-tour="freigabe" className={card}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e7e5dc] px-5 py-3">
            <h1 className="font-medium text-d-deep">Einkommensteuererklärung 2025 – Entwurf</h1>
            <Tag tone={s.approved ? "ok" : "warn"}>{s.approved ? `freigegeben · heute ${s.approved} Uhr` : "wartet auf Ihre Freigabe"}</Tag>
          </div>
          <div className="bg-[#efeee8] p-4 sm:p-6">
            {/* Dokumentvorschau als Blatt Papier */}
            <div className="mx-auto max-w-xl bg-white px-6 py-7 shadow-[0_1px_3px_rgb(0_0_0/0.12),0_12px_28px_-14px_rgb(0_0_0/0.25)] sm:px-9">
              <p className="flex items-start justify-between gap-4 border-b-2 border-d-deep pb-3">
                <span className={cx(SERIF, "text-[1.05rem] leading-tight font-semibold text-d-deep")}>
                  Albrecht & Sommer
                  <span className="block font-plex text-[10px] font-normal tracking-[0.18em] text-[#7a827c] uppercase">Steuerberatung</span>
                </span>
                <span className="num text-right text-[11.5px] leading-snug text-[#5d6660]">
                  Mandant 10482
                  <br />
                  {fmtDate(day(-1))}
                </span>
              </p>
              <h2 className={cx(SERIF, "mt-5 text-[1.3rem] font-medium text-d-deep")}>Einkommensteuererklärung 2025</h2>
              <p className="text-[13px] text-[#5d6660]">Jana Petersen · Zusammenfassung der Berechnung</p>
              <table className="num mt-4 w-full text-[13.5px]">
                <tbody>
                  {rows.map(([k, v, strong]) => (
                    <tr key={k} className={cx("border-t border-[#e7e5dc]", strong && "border-t-2 border-d-deep text-[15px] font-semibold text-d-deep")}>
                      <td className="py-2">{k}</td>
                      <td className="py-2 text-right">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-[12px] leading-relaxed text-[#7a827c]">Die Nachzahlung entsteht durch den höheren Gewinn gegenüber 2024. Wir empfehlen, die Vorauszahlungen für 2026 anzupassen – dazu melden wir uns gesondert.</p>
              {s.approved && (
                <p className="mt-5 inline-block -rotate-2 rounded border-2 border-d-accent px-3 py-1.5 text-[12px] leading-tight font-semibold tracking-wide text-d-accent uppercase">
                  Digital freigegeben
                  <span className="num block text-[10.5px] font-normal tracking-normal normal-case">
                    J. Petersen · {fmtDate(day())} · {s.approved} Uhr
                  </span>
                </p>
              )}
            </div>
          </div>
          {s.approved ? (
            <p className="border-t border-[#e7e5dc] bg-d-soft px-5 py-3 text-[13.5px]">
              <strong className="font-semibold">So sieht es die Kanzlei:</strong> Die Freigabe ist mit Zeitstempel im Mandat vermerkt, die Erklärung kann übermittelt werden.{" "}
              <button type="button" onClick={() => go("betrieb", "postfach")} className="font-semibold text-d-accent underline underline-offset-2">
                In der Kanzlei-Ansicht ansehen
              </button>
            </p>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e7e5dc] px-5 py-3">
              <label className="flex min-h-11 items-center gap-2.5 text-[14px]">
                <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="size-4 accent-[var(--d-accent)]" /> Ich habe die Angaben geprüft und bin einverstanden.
              </label>
              <button type="button" disabled={!checked} onClick={s.approve} className="min-h-12 rounded-md bg-d-accent px-5 font-medium text-white hover:brightness-95 disabled:opacity-40">
                Erklärung freigeben
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className={card}>
          <h1 className="border-b border-[#e7e5dc] px-5 py-3 font-medium text-d-deep">{f.name}</h1>
          <ul className="divide-y divide-[#e7e5dc]">
            {f.files.map((name, i) => (
              <li key={name} className="flex items-center gap-3 px-5 py-3">
                <FileText className="size-5 shrink-0 text-[#8a938c]" strokeWidth={1.5} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-d-deep">{name}</p>
                  <p className="num text-[12.5px] text-[#7a827c]">
                    PDF · {120 + i * 87} KB · bereitgestellt am {d(-(4 + i * 19))}
                  </p>
                </div>
                <span className="text-[13px] text-[#7a827c]">Ansehen</span>
              </li>
            ))}
          </ul>
        </section>
      )}
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
            <div className={cx("max-w-[85%] rounded-lg px-3.5 py-2.5 text-[14px] leading-relaxed", mine ? "bg-d-deep text-white" : "border border-[#dcdad0] bg-white text-[#39423d]")}>
              <p>{m.text}</p>
              <p className={cx("num mt-1 text-[11.5px]", mine ? "text-white/60" : "text-[#7a827c]")}>
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
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder={placeholder} className="min-h-12 w-full rounded-md border border-[#c5c9c0] bg-white px-3 text-[16px] text-[#15171c] outline-none focus:border-[#15171c] sm:text-[14px]" />
      </label>
      <button type="submit" aria-label="Nachricht senden" className="grid min-h-12 w-12 place-items-center rounded-md bg-d-accent text-white hover:brightness-95">
        <Send className="size-4" aria-hidden />
      </button>
    </form>
  );
}

function Messages({ s }: { s: State }) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className={cx(SERIF, "text-[1.8rem] leading-tight font-medium text-d-deep")}>Nachrichten</h1>
      <p className="mt-1 flex items-center gap-2 text-[13.5px] text-[#5d6660]">
        <Lock className="size-3.5 text-d-accent" aria-hidden /> Verschlüsselt übertragen, nur für Sie und Ihre Kanzlei sichtbar.
      </p>
      <div className="mt-5">
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
                      <div className="h-1.5 w-28 rounded-full bg-bo-bg">
                        <div className={cx("h-full rounded-full transition-[width] duration-500", pct >= 90 ? "bg-bo-ok" : pct >= 50 ? "bg-[#c8860a]" : "bg-bo-bad")} style={{ width: `${pct}%` }} />
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
    <div data-tour="postfach" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
      <Panel flush title="Eingang" aside="alle Mandate">
        <ul>
          {events.map((e, i) => (
            <li key={i} className={cx("flex items-start gap-3 px-4 py-3", i > 0 && "border-t border-bo-line", e.live && "bg-d-soft/60")}>
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-bo-bg text-bo-body">
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
      <div className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
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
