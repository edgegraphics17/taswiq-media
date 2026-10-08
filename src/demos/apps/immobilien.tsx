"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarClock, ChartColumn, Check, Inbox, MapPin, Phone, X } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Empty, Field, Figures, input, Panel, Ranks, Tag, td, th, tr, Track } from "@/demos/kit/ui";
import { cx, eur0, fmtDay, num, useOnce, workday } from "@/demos/kit/util";

/**
 * Demo "Kranich Immobilien": Objektsuche und Exposé für Interessenten + Dashboard mit Anfragen-Pipeline.
 * Eine Besichtigungsanfrage vorne landet hinten als Karte in der Pipeline; der Objektstatus hinten
 * ("reserviert") erscheint vorne in der Suche.
 */

type Deal = "miete" | "kauf";
type ObjStatus = "aktiv" | "reserviert" | "vergeben";
interface Obj {
  id: string;
  deal: Deal;
  kind: "Wohnung" | "Haus" | "Gewerbe";
  title: string;
  area: string;
  rooms: number;
  size: number;
  price: number;
  extra: number;
  floor: string;
  year: number;
  energy: string;
  kwh: number;
  free: string;
  img: string;
  alt: string;
  perks: string[];
  text: string;
  views: number;
  leads: number;
}
const OBJECTS: Obj[] = [
  {
    id: "KR-2041",
    deal: "miete",
    kind: "Wohnung",
    title: "Altbau mit Balkon am Stadtpark",
    area: "Altstadt",
    rooms: 3,
    size: 86,
    price: 1180,
    extra: 240,
    floor: "2. Obergeschoss",
    year: 1908,
    energy: "D",
    kwh: 118,
    free: "ab 1. Dezember",
    img: "/images/sectors/immobilien-1.webp",
    alt: "Weiße Altbaufassade mit roten Dächern",
    perks: ["Balkon nach Süden", "Dielenboden", "Stuck", "Einbauküche", "Kellerabteil"],
    text: "Drei Meter hohe Decken, abgezogene Dielen und ein Balkon mit Blick in die Kastanien des Stadtparks. Das Bad wurde 2022 erneuert, die Küche ist eingebaut. Fünf Gehminuten zum Markt, acht zur S-Bahn.",
    views: 1284,
    leads: 61,
  },
  {
    id: "KR-2038",
    deal: "miete",
    kind: "Wohnung",
    title: "Helle Neubauwohnung mit Loggia",
    area: "Lindenviertel",
    rooms: 2,
    size: 58,
    price: 940,
    extra: 180,
    floor: "4. Obergeschoss, Aufzug",
    year: 2023,
    energy: "A",
    kwh: 38,
    free: "sofort",
    img: "/images/sectors/immobilien-2.webp",
    alt: "Wohnzimmer mit grünem Sofa und bodentiefen Fenstern",
    perks: ["Loggia", "Fußbodenheizung", "Aufzug", "Tiefgarage möglich", "Glasfaser"],
    text: "Bodentiefe Fenster, Eichenparkett und eine Loggia zur ruhigen Hofseite. Wärmepumpe und Dreifachverglasung halten die Nebenkosten niedrig. Stellplatz in der Tiefgarage auf Wunsch.",
    views: 962,
    leads: 48,
  },
  {
    id: "KR-2029",
    deal: "kauf",
    kind: "Wohnung",
    title: "Familienwohnung mit Wohnküche",
    area: "Nordstadt",
    rooms: 4,
    size: 112,
    price: 438000,
    extra: 320,
    floor: "1. Obergeschoss",
    year: 1994,
    energy: "C",
    kwh: 92,
    free: "nach Absprache",
    img: "/images/sectors/immobilien-4.webp",
    alt: "Gemütliches Wohnzimmer mit Regalwand",
    perks: ["Wohnküche", "Zwei Bäder", "Westbalkon", "Garage", "Gemeinschaftsgarten"],
    text: "Vier Zimmer, zwei Bäder und eine Wohnküche, in der die ganze Familie Platz hat. Grundschule und Kita liegen in derselben Straße. Die Eigentümergemeinschaft ist klein, das Hausgeld überschaubar.",
    views: 731,
    leads: 22,
  },
  {
    id: "KR-2033",
    deal: "kauf",
    kind: "Haus",
    title: "Stadthaus mit Dachterrasse",
    area: "Hafenquartier",
    rooms: 5,
    size: 164,
    price: 795000,
    extra: 0,
    floor: "3 Etagen",
    year: 2019,
    energy: "A+",
    kwh: 24,
    free: "ab Frühjahr",
    img: "/images/blog/software-fuer-makler-und-hausverwaltungen.webp",
    alt: "Modernes Stadthaus mit dunkler Fassade",
    perks: ["Dachterrasse", "Photovoltaik", "Wallbox", "Carport", "Smart Home"],
    text: "Drei Etagen, eine Dachterrasse mit Blick über das Hafenbecken und eine Photovoltaikanlage, die den Großteil des Stroms liefert. Wallbox und Carport sind vorhanden.",
    views: 1105,
    leads: 19,
  },
  {
    id: "KR-2044",
    deal: "miete",
    kind: "Wohnung",
    title: "Apartment für Pendler und Studierende",
    area: "Bahnhofsviertel",
    rooms: 1,
    size: 34,
    price: 560,
    extra: 110,
    floor: "5. Obergeschoss, Aufzug",
    year: 1972,
    energy: "E",
    kwh: 141,
    free: "ab 15. November",
    img: "/images/blog/mieterportal.webp",
    alt: "Wohnhaus mit Balkonen in der Abenddämmerung",
    perks: ["Möbliert möglich", "Balkon", "Aufzug", "Waschkeller", "Fahrradraum"],
    text: "Ein Zimmer mit Pantryküche, Duschbad und Balkon. Drei Minuten zum Hauptbahnhof. Auf Wunsch möbliert mit Bett, Schreibtisch und Schrank.",
    views: 2018,
    leads: 87,
  },
  {
    id: "KR-2025",
    deal: "miete",
    kind: "Gewerbe",
    title: "Bürofläche im Glaspavillon",
    area: "Campus Ost",
    rooms: 6,
    size: 180,
    price: 2880,
    extra: 610,
    floor: "Erdgeschoss, barrierefrei",
    year: 2016,
    energy: "B",
    kwh: 64,
    free: "ab 1. Januar",
    img: "/images/sectors/immobilien-5.webp",
    alt: "Verglastes Bürogebäude vor hellem Himmel",
    perks: ["Sechs Stellplätze", "Serverraum", "Teeküche", "Klimatisiert", "Barrierefrei"],
    text: "Offene Fläche mit zwei abgetrennten Besprechungsräumen, Teeküche und Serverraum. Sechs Stellplätze direkt vor der Tür, Straßenbahn in Sichtweite.",
    views: 412,
    leads: 9,
  },
];

type Stage = "neu" | "termin" | "unterlagen" | "zusage";
const STAGES: { id: Stage; title: string; next?: string }[] = [
  { id: "neu", title: "Neu", next: "Termin bestätigen" },
  { id: "termin", title: "Besichtigung", next: "Unterlagen geprüft" },
  { id: "unterlagen", title: "Unterlagen geprüft", next: "Zusage erteilen" },
  { id: "zusage", title: "Zusage" },
];
interface Lead {
  id: number;
  name: string;
  obj: string;
  stage: Stage;
  when: string;
  slot: string;
  move: string;
  household: string;
  /** Verhältnis Einkommen zu Miete bzw. Stand der Finanzierung */
  fit: string;
  ok: boolean;
  own?: boolean;
}
const seedLeads = (): Lead[] => [
  { id: 1, name: "Daniela Krause", obj: "KR-2041", stage: "neu", when: "vor 20 Min.", slot: `${fmtDay(workday(2))}, 17:00`, move: "ab Dezember", household: "2 Personen", fit: "3,4-fache Miete", ok: true },
  { id: 2, name: "Yusuf Arslan", obj: "KR-2044", stage: "neu", when: "vor 1 Std.", slot: `${fmtDay(workday(1))}, 12:30`, move: "sofort", household: "1 Person", fit: "2,1-fache Miete", ok: false },
  { id: 3, name: "Marlene & Tom Weiss", obj: "KR-2029", stage: "neu", when: "vor 3 Std.", slot: `${fmtDay(workday(3))}, 10:00`, move: "ab Frühjahr", household: "4 Personen", fit: "Finanzierung bestätigt", ok: true },
  { id: 4, name: "Kerstin Albrecht", obj: "KR-2041", stage: "termin", when: "gestern", slot: `${fmtDay(workday(1))}, 16:00`, move: "ab Dezember", household: "3 Personen", fit: "3,9-fache Miete", ok: true },
  { id: 5, name: "Niklas Heim", obj: "KR-2038", stage: "termin", when: "gestern", slot: `${fmtDay(workday(1))}, 18:00`, move: "sofort", household: "1 Person", fit: "4,2-fache Miete", ok: true },
  { id: 6, name: "Bürogemeinschaft Vossberg", obj: "KR-2025", stage: "termin", when: "vor 2 Tagen", slot: `${fmtDay(workday(2))}, 09:00`, move: "ab Januar", household: "8 Arbeitsplätze", fit: "Bonität geprüft", ok: true },
  { id: 7, name: "Ana Petrović", obj: "KR-2038", stage: "unterlagen", when: "vor 3 Tagen", slot: "besichtigt", move: "sofort", household: "2 Personen", fit: "3,1-fache Miete", ok: true },
  { id: 8, name: "Familie Okonkwo", obj: "KR-2033", stage: "unterlagen", when: "vor 5 Tagen", slot: "besichtigt", move: "ab Frühjahr", household: "5 Personen", fit: "Finanzierung bestätigt", ok: true },
  { id: 9, name: "Jörg Tiedemann", obj: "KR-2044", stage: "zusage", when: "vor 6 Tagen", slot: "besichtigt", move: "ab 15. November", household: "1 Person", fit: "3,6-fache Miete", ok: true },
];

export default function ImmobilienDemo() {
  const { view, setTab } = useDemo();
  const [status, setStatus] = useState<Record<string, ObjStatus>>({ "KR-2029": "reserviert" });
  const [leads, setLeads] = useState<Lead[]>(seedLeads);
  const [sel, setSel] = useState("KR-2041");
  const objects = OBJECTS.map((o) => ({ ...o, status: status[o.id] ?? ("aktiv" as ObjStatus), leads: o.leads + leads.filter((l) => l.own && l.obj === o.id).length }));

  return view === "kunde" ? (
    <Site
      objects={objects}
      sel={sel}
      onSelect={(id) => {
        setSel(id);
        setTab("expose");
      }}
      mine={leads.find((l) => l.own && l.obj === sel) ?? null}
      onRequest={(l) => setLeads((p) => [{ ...l, id: Date.now(), stage: "neu", when: "gerade eben", own: true }, ...p])}
    />
  ) : (
    <Dashboard objects={objects} leads={leads} onStage={(id, stage) => setLeads((p) => (stage ? p.map((l) => (l.id === id ? { ...l, stage } : l)) : p.filter((l) => l.id !== id)))} onStatus={(id, s) => setStatus((p) => ({ ...p, [id]: s }))} />
  );
}

type LiveObj = Obj & { status: ObjStatus };

/* ───────────────────────────── Website ─────────────────────────────
   Gestaltung „Kranich": architektonisch und kantig (Radius 3 px), nur Schwarz (#1e1e1b), zwei Grautöne und Weiß.
   Red Hat Display – Überschriften 900 in Versalien, Preise und Flächen als große tabellarische Ziffern,
   Etiketten 10.5 px gesperrt. Strenges Raster mit Haarlinien statt Schatten; Abstände im 4/8er-Raster, Sektionen 40/72. */

const I = {
  wrap: "mx-auto w-full max-w-[80rem] px-4 @dsm:px-6 @dlg:px-10",
  label: "text-[10.5px] leading-none font-bold tracking-[0.18em] uppercase",
  grey: "text-[#6b6a63]",
  display: "font-d-display font-black tracking-[-0.035em] uppercase text-d-deep",
  h2: "font-d-display text-[1.375rem] leading-none font-extrabold tracking-[-0.02em] text-d-deep",
  btn: "inline-flex min-h-12 items-center justify-center gap-2 rounded-[3px] px-6 text-[15px] font-bold transition-colors active:translate-y-px",
};

function Site({ objects, sel, onSelect, mine, onRequest }: { objects: LiveObj[]; sel: string; onSelect: (id: string) => void; mine: Lead | null; onRequest: (l: Omit<Lead, "id" | "stage" | "when" | "own">) => void }) {
  const { tab, setTab } = useDemo();
  const obj = objects.find((o) => o.id === sel)!;
  return (
    <div className="min-h-[var(--app-h)] bg-white font-plex text-[15px] leading-[1.55] text-[#4a4943]">
      <header className="border-b border-[#1e1e1b]">
        <div className={cx(I.wrap, "flex items-center justify-between gap-6 py-3.5")}>
          <button type="button" onClick={() => setTab("suche")} className="flex min-h-11 items-center gap-3 text-left" aria-label="Kranich Immobilien – zur Objektsuche">
            <svg viewBox="0 0 32 32" className="size-9 shrink-0 text-d-deep" aria-hidden>
              <rect width="32" height="32" fill="currentColor" />
              <path d="M7.5 23V14.5L16 8l8.500 6.500V23" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="miter" />
              <path d="M13 23v-5.500h6V23" fill="none" stroke="#fff" strokeWidth="2" strokeLinejoin="miter" />
            </svg>
            <span className="font-d-display text-[1.0625rem] leading-none font-black tracking-[0.02em] text-d-deep uppercase">
              Kranich <span className="font-medium">Immobilien</span>
            </span>
          </button>
          <p className="num flex items-center gap-5 text-[13.5px] font-semibold text-d-deep">
            <span className={cx("hidden font-medium @dmd:inline", I.grey)}>Mo – Fr, 9 – 18 Uhr</span>
            <span className="inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-d-deep px-4 text-white">
              <Phone className="size-4" aria-hidden /> <span className="@max-dsm:sr-only">01234 445 566</span>
            </span>
          </p>
        </div>
      </header>
      {tab === "expose" ? <Expose obj={obj} mine={mine} onBack={() => setTab("suche")} onRequest={onRequest} /> : <SearchPage objects={objects} onSelect={onSelect} />}
      <footer className="border-t border-[#1e1e1b]">
        <div className={cx(I.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-2 py-5", I.label, I.grey)}>
          <span className="text-d-deep">Kranich Immobilien · seit 1987</span>
          <span>Rathausgasse 3, Musterstadt</span>
          <span>Makler & Vermietung</span>
        </div>
      </footer>
    </div>
  );
}

function StatusBadge({ status }: { status: ObjStatus }) {
  if (status === "aktiv") return null;
  return <span className={cx("absolute top-3 left-3 inline-flex min-h-7 items-center gap-2 rounded-[3px] px-2.5", I.label, status === "reserviert" ? "bg-white text-d-deep" : "bg-d-deep text-white")}>
    <span className={cx("size-1.5 rounded-full", status === "reserviert" ? "bg-[#c8860a]" : "bg-white")} aria-hidden />
    {status === "reserviert" ? "Reserviert" : "Vergeben"}
  </span>;
}

/** "5. Obergeschoss, Aufzug" → "5. OG" – nur für die kompakte Faktenzeile der Objektkarten */
const floorShort = (f: string) => f.split(",")[0]!.replace(" Obergeschoss", " OG").replace("Erdgeschoss", "EG");

function SearchPage({ objects, onSelect }: { objects: LiveObj[]; onSelect: (id: string) => void }) {
  const [deal, setDeal] = useState<"alle" | Deal>("alle");
  const [rooms, setRooms] = useState(0);
  const [max, setMax] = useState(0);
  const list = objects.filter((o) => (deal === "alle" || o.deal === deal) && o.rooms >= rooms && (!max || (o.deal === "miete" ? o.price <= max : o.price <= max * 500)));
  const active = deal !== "alle" || rooms > 0 || max > 0;
  const seg = (on: boolean) => cx("min-h-11 flex-1 rounded-[2px] px-3 text-[14px] font-bold whitespace-nowrap transition-colors", on ? "bg-d-deep text-white" : "text-d-deep hover:bg-[#efefec]");
  const box = (on: boolean) => cx("min-h-11 rounded-[3px] border px-3 text-[14px] font-bold transition-colors", on ? "border-d-deep bg-d-deep text-white" : "border-[#cccccc] bg-white text-d-deep hover:border-d-deep");
  const dealSwitch = (label: string) => (
    <div className="flex gap-0.5 rounded-[3px] border border-d-deep p-0.5" role="group" aria-label={label}>
      {(["alle", "miete", "kauf"] as const).map((d) => (
        <button key={d} type="button" aria-pressed={deal === d} onClick={() => setDeal(d)} className={seg(deal === d)}>
          {d === "alle" ? "Alle" : d === "miete" ? "Mieten" : "Kaufen"}
        </button>
      ))}
    </div>
  );
  return (
    <>
      <section className={cx(I.wrap, "pt-8 @dlg:pt-14")}>
        <div className="grid gap-6 @dlg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] @dlg:items-end @dlg:gap-12">
          <h1 className={cx(I.display, "min-w-0 text-[clamp(2.4rem,7cqi,5.25rem)] leading-[0.9]")}>
            Dein Zuhause
            <br />
            in Musterstadt.
          </h1>
          <div className="@dlg:pb-2">
            <p className={cx("max-w-sm text-[15.5px] leading-relaxed", I.grey)}>Jedes Objekt mit Exposé, Grundriss und Kostenaufstellung. Die Besichtigung fragst du online an – seit 1987 in guten Händen.</p>
            <div className="mt-5 flex max-w-sm gap-2">
              <div className="min-w-0 flex-1">
                {dealSwitch("Mieten oder kaufen")}
              </div>
              <a href="#kranich-objekte" aria-label="Zu den Objekten" className="grid size-[3.125rem] shrink-0 place-items-center rounded-[3px] bg-d-deep text-white transition-colors hover:bg-black">
                <ArrowRight className="size-5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
        <figure className="relative mt-8 aspect-[4/3] overflow-hidden rounded-[3px] bg-[#efefec] @dsm:aspect-[21/9] @dlg:mt-10">
          <Image src="/images/demo/photos/i-hero.webp" alt="Modernes weißes Wohnhaus mit Holzdecken und Pool – Beispielobjekt aus dem Bestand" fill priority sizes="(min-width: 80rem) 75rem, 100vw" className="object-cover object-[center_60%]" />
          <figcaption className="absolute right-0 bottom-0 left-0 grid grid-cols-3 divide-x divide-[#cccccc] bg-white @dsm:left-auto @dsm:w-[27rem]">
            {[
              [String(objects.filter((o) => o.status !== "vergeben").length), "Objekte frei"],
              ["38", "Jahre am Markt"],
              ["23", "Tage bis zur Zusage"],
            ].map(([v, l]) => (
              <span key={l} className="px-3 py-3 @dsm:px-4 @dsm:py-4">
                <span className="num block font-d-display text-[1.75rem] leading-none font-black tracking-[-0.04em] text-d-deep @dsm:text-[2.25rem]">{v}</span>
                <span className={cx("mt-2 block leading-[1.35]", I.label, I.grey)}>{l}</span>
              </span>
            ))}
          </figcaption>
        </figure>
      </section>

      <section id="kranich-objekte" className={cx(I.wrap, "grid scroll-mt-[var(--bar-h)] gap-6 py-10 @dlg:grid-cols-[15.5rem_minmax(0,1fr)] @dlg:gap-12 @dlg:py-16")}>
        <aside>
          <div data-tour="suche" className="space-y-6 @dlg:sticky @dlg:top-[calc(var(--bar-h)+1.5rem)]">
            <div className="flex items-baseline justify-between gap-3 border-b border-d-deep pb-3">
              <h2 className={I.h2}>Objektsuche</h2>
              <p className={cx("num text-[13px] font-semibold", I.grey)} aria-live="polite">
                {list.length} {list.length === 1 ? "Objekt" : "Objekte"}
              </p>
            </div>
            <div className="grid gap-5 @dsm:grid-cols-3 @dlg:grid-cols-1 @dlg:gap-6">
              <div>
                <p className={cx("mb-2.5", I.label, I.grey)}>Ich möchte</p>
                {dealSwitch("Mieten oder kaufen (Filter)")}
              </div>
              <div>
                <p className={cx("mb-2.5", I.label, I.grey)}>Zimmer</p>
                <div className="grid grid-cols-4 gap-1.5" role="group" aria-label="Mindestens Zimmer">
                  {[0, 2, 3, 4].map((r) => (
                    <button key={r} type="button" aria-pressed={rooms === r} onClick={() => setRooms(r)} className={box(rooms === r)}>
                      {r === 0 ? "egal" : `${r}+`}
                    </button>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className={cx("mb-2.5 block", I.label, I.grey)}>Budget</span>
                <select value={max} onChange={(e) => setMax(Number(e.target.value))} className={cx(input, "rounded-[3px] border-[#cccccc] font-bold text-d-deep hover:border-d-deep")}>
                  <option value={0}>kein Limit</option>
                  <option value={700}>bis 700 € kalt</option>
                  <option value={1000}>bis 1.000 € kalt</option>
                  <option value={1500}>bis 1.500 € kalt</option>
                </select>
              </label>
            </div>
            {active && (
              <button
                type="button"
                onClick={() => {
                  setDeal("alle");
                  setRooms(0);
                  setMax(0);
                }}
                className="inline-flex min-h-11 items-center gap-2 text-[13.5px] font-bold text-d-deep underline decoration-[#cccccc] underline-offset-4 hover:decoration-d-deep"
              >
                <X className="size-4" aria-hidden /> Filter zurücksetzen
              </button>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <ul className="grid gap-x-5 gap-y-9 @dsm:grid-cols-2 @dxl:grid-cols-3">
            {list.map((o) => (
              <li key={o.id}>
                <button type="button" onClick={() => onSelect(o.id)} className="group block w-full text-left">
                  <span className="relative block aspect-[4/3] overflow-hidden rounded-[3px] bg-[#efefec]">
                    <Image src={o.img} alt={o.alt} fill sizes="(min-width: 80rem) 20rem, (min-width: 40rem) 45vw, 100vw" className={cx("object-cover transition-transform duration-500 group-hover:scale-[1.03]", o.status === "vergeben" && "grayscale")} />
                    <StatusBadge status={o.status} />
                    <span className={cx("absolute right-3 bottom-3 inline-flex min-h-7 items-center rounded-[3px] bg-d-deep px-2.5 text-white", I.label)}>{o.deal === "miete" ? "Miete" : "Kauf"}</span>
                  </span>
                  <span className="mt-4 flex items-baseline justify-between gap-3">
                    <span className="num font-d-display text-[1.625rem] leading-none font-black tracking-[-0.03em] text-d-deep">
                      {eur0(o.price)}
                      {o.deal === "miete" && <span className={cx("ml-1 text-[13px] font-medium tracking-normal", I.grey)}>/Monat kalt</span>}
                    </span>
                    <ArrowUpRight className="size-5 shrink-0 text-d-deep opacity-40 transition-opacity group-hover:opacity-100" aria-hidden />
                  </span>
                  <span className="mt-2.5 block text-[16px] leading-snug font-semibold text-d-deep group-hover:underline group-hover:underline-offset-4">{o.title}</span>
                  <span className={cx("num mt-1.5 block text-[13.5px]", I.grey)}>
                    {o.rooms} {o.kind === "Gewerbe" ? "Räume" : "Zi."} · {o.size} m² · {floorShort(o.floor)} · {o.area}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {list.length === 0 && (
            <div className="rounded-[3px] border border-dashed border-[#8c8c8c] px-6 py-14 text-center">
              <p className={I.h2}>Dazu haben wir gerade nichts.</p>
              <p className={cx("mt-3", I.grey)}>Lockere einen Filter – oder hinterlass einen Suchauftrag.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

const ENERGY = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"];
const ENERGY_COLOR = ["#2e9b4f", "#57b04a", "#93c13f", "#cdd235", "#f4d12f", "#f3a72c", "#ec7b2a", "#d44420", "#c9302a"];

/** Räume des Musterobjekts für die Galerie im Exposé */
const ROOMS: { src: string; room: string; alt: string }[] = [
  { src: "/images/demo/photos/i-living.webp", room: "Wohnzimmer", alt: "Wohnzimmer mit zwei grauen Samtsofas, Kamin und bodentiefen Fenstern" },
  { src: "/images/demo/photos/i-kitchen.webp", room: "Küche", alt: "Offene Küche mit grauem Schrankwerk, Küchenhalbinsel und Edelstahlgeräten" },
  { src: "/images/demo/photos/i-bedroom.webp", room: "Schlafzimmer", alt: "Schlafzimmer mit Bett vor hölzerner Bogenwand und warmem Deckenlicht" },
  { src: "/images/demo/photos/i-bath.webp", room: "Bad", alt: "Bad mit freistehender Wanne, Glasdusche und hellen Steinflächen" },
  { src: "/images/demo/photos/i-dining.webp", room: "Essbereich", alt: "Essbereich mit dunklem Holztisch und weißer Küche im Hintergrund" },
  { src: "/images/demo/photos/i-loft.webp", room: "Loft", alt: "Offener Loft-Raum mit Galerie, dunkler Küche und Sonnenschatten" },
  { src: "/images/demo/photos/i-office.webp", room: "Arbeitszimmer", alt: "Arbeitszimmer als Großraumbüro mit weißen Arbeitsplätzen und Glaswänden" },
];

/** Galerie des Musterobjekts: Hauptbild mit drei Nachbarn als Mosaik (breit) bzw. Vorschaustreifen (schmal), Umschalten im Client */
function Gallery({ obj, onBack }: { obj: LiveObj; onBack: () => void }) {
  const [pic, setPic] = useState(0);
  const shot = ROOMS[pic]!;
  const step = (n: number) => setPic((p) => (p + n + ROOMS.length) % ROOMS.length);
  // die drei folgenden Bilder füllen das Mosaik
  const side = [1, 2, 3].map((n) => (pic + n) % ROOMS.length);
  return (
    <div>
      <div className="grid gap-2 @dmd:h-[30rem] @dmd:grid-cols-4 @dmd:grid-rows-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-[3px] bg-[#efefec] @dmd:col-span-2 @dmd:row-span-2 @dmd:aspect-auto">
          <Image key={shot.src} src={shot.src} alt={shot.alt} fill priority sizes="(min-width: 48rem) 50vw, 100vw" className="object-cover" />
          <button type="button" onClick={onBack} className="absolute top-3 left-3 inline-flex min-h-11 items-center gap-2 rounded-[3px] bg-white px-4 text-[14px] font-bold text-d-deep transition-colors hover:bg-[#efefec]">
            <ArrowLeft className="size-4" aria-hidden /> Alle Objekte
          </button>
          <StatusBadge status={obj.status} />
          <div className="absolute right-3 bottom-3 flex items-center gap-px overflow-hidden rounded-[3px]">
            <button type="button" onClick={() => step(-1)} aria-label="Vorheriges Bild" className="grid size-11 place-items-center bg-white text-d-deep hover:bg-[#efefec]">
              <ArrowLeft className="size-4" aria-hidden />
            </button>
            <span className="num grid h-11 place-items-center bg-white px-3 text-[13px] font-bold text-d-deep" aria-live="polite">
              {pic + 1} / {ROOMS.length}
            </span>
            <button type="button" onClick={() => step(1)} aria-label="Nächstes Bild" className="grid size-11 place-items-center bg-white text-d-deep hover:bg-[#efefec]">
              <ArrowRight className="size-4" aria-hidden />
            </button>
          </div>
          <span className={cx("absolute bottom-3 left-3 inline-flex min-h-7 items-center rounded-[3px] bg-d-deep px-2.5 text-white", I.label)}>{shot.room}</span>
        </div>
        {side.map((i, n) => (
          <button key={ROOMS[i]!.src} type="button" onClick={() => setPic(i)} className={cx("group relative hidden overflow-hidden rounded-[3px] bg-[#efefec] @dmd:block", n === 2 ? "col-start-4 row-span-2 row-start-1" : "col-start-3")}>
            <Image src={ROOMS[i]!.src} alt="" fill sizes="25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
            <span className="sr-only">{ROOMS[i]!.room} groß anzeigen</span>
          </button>
        ))}
      </div>
      <div className="no-bar mt-2 flex gap-2 overflow-x-auto @dmd:hidden">
        {ROOMS.map((r, i) => (
          <button key={r.src} type="button" aria-pressed={i === pic} onClick={() => setPic(i)} className={cx("relative size-16 shrink-0 overflow-hidden rounded-[3px] transition-opacity", i === pic ? "ring-2 ring-d-deep ring-inset" : "opacity-60 hover:opacity-100")}>
            <Image src={r.src} alt="" fill sizes="64px" className="object-cover" />
            <span className="sr-only">
              Bild {i + 1} von {ROOMS.length}: {r.room}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function Expose({ obj, mine, onBack, onRequest }: { obj: LiveObj; mine: Lead | null; onBack: () => void; onRequest: (l: Omit<Lead, "id" | "stage" | "when" | "own">) => void }) {
  const { go } = useDemo();
  const rent = obj.deal === "miete";
  const big: [string, string][] = [
    [String(obj.size), "m²"],
    [String(obj.rooms), obj.kind === "Gewerbe" ? "Räume" : "Zimmer"],
    [String(obj.year), "Baujahr"],
    [obj.energy, "Energie"],
  ];
  const facts: [string, string][] = [
    ["Objekt-Nr.", obj.id],
    ["Art", `${obj.kind} zur ${rent ? "Miete" : "Kauf"}`.replace("zur Kauf", "zum Kauf")],
    ["Lage im Haus", obj.floor],
    ["Frei", obj.free],
  ];
  const e = ENERGY.indexOf(obj.energy);
  return (
    <div className={cx(I.wrap, "py-4 @dlg:py-6")}>
      <Gallery key={obj.id} obj={obj} onBack={onBack} />
      <div className="mt-8 grid gap-10 @dlg:mt-12 @dlg:grid-cols-[minmax(0,1fr)_24rem] @dlg:gap-16">
        <div className="min-w-0">
          <p className={cx("flex flex-wrap items-center gap-x-3 gap-y-1", I.label, I.grey)}>
            <span className="inline-flex items-center gap-1.5 text-d-deep">
              <MapPin className="size-3.5" aria-hidden /> Musterstadt-{obj.area}
            </span>
            <span>Exposé {obj.id}</span>
          </p>
          <h1 className={cx(I.display, "mt-4 text-[clamp(2rem,6cqi,3.75rem)] leading-[0.95] text-balance")}>{obj.title}</h1>

          {/* Schmale Rahmen: Preis und Anfrage gleich unter dem Titel, die Kostenaufstellung folgt weiter unten */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 @dlg:hidden">
            <p className="num font-d-display text-[2.25rem] leading-none font-black tracking-[-0.04em] text-d-deep">
              {eur0(obj.price)}
              {rent && <span className={cx("ml-1.5 text-[14px] font-medium tracking-normal", I.grey)}>/Monat kalt</span>}
            </p>
            <a href="#kranich-besichtigung" className={cx(I.btn, "bg-d-deep text-white")}>
              {mine ? "Stand der Anfrage" : "Besichtigung anfragen"}
            </a>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-y-6 border-y border-d-deep py-6 @dsm:grid-cols-4">
            {big.map(([v, l]) => (
              <div key={l} className="flex items-baseline gap-2">
                <dd className="num font-d-display text-[2.75rem] leading-none font-black tracking-[-0.04em] text-d-deep">{v}</dd>
                <dt className="text-[14px] font-semibold text-d-deep">{l}</dt>
              </div>
            ))}
          </dl>

          <p className="mt-8 max-w-2xl text-[17px] leading-relaxed text-[#3a3934]">{obj.text}</p>

          <dl data-tour="fakten" className="mt-8 grid border-t border-[#cccccc] @dsm:grid-cols-2 @dsm:gap-x-10">
            {facts.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[#cccccc] py-3">
                <dt className={cx(I.label, I.grey)}>{k}</dt>
                <dd className="num text-right text-[15px] font-bold text-d-deep">{v}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-12">
            <h2 className={cx(I.h2, "border-b border-d-deep pb-3")}>Ausstattung</h2>
            <ul className="mt-2 grid @dsm:grid-cols-2 @dsm:gap-x-10 @dxl:grid-cols-3">
              {obj.perks.map((p) => (
                <li key={p} className="flex items-center gap-3 border-b border-[#cccccc] py-3 text-[15px] font-medium text-d-deep">
                  <Check className="size-4 shrink-0" strokeWidth={2.5} aria-hidden /> {p}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-12 grid gap-12 @dmd:grid-cols-2 @dmd:gap-10">
            <section>
              <h2 className={cx(I.h2, "border-b border-d-deep pb-3")}>Grundriss</h2>
              <FloorPlan obj={obj} />
            </section>
            <section>
              <h2 className={cx(I.h2, "border-b border-d-deep pb-3")}>Energieausweis</h2>
              <div className="mt-5">
                <div className="flex gap-0.5 pt-5" role="img" aria-label={`Energieeffizienzklasse ${obj.energy}, ${obj.kwh} Kilowattstunden je Quadratmeter und Jahr`}>
                  {ENERGY.map((c, i) => (
                    <span key={c} className={cx("relative flex-1 py-1.5 text-center text-[11px] font-bold", i < 7 ? "text-d-deep" : "text-white")} style={{ background: ENERGY_COLOR[i] }}>
                      {i === e && <span className="absolute -top-5 left-1/2 size-0 -translate-x-1/2 border-x-[7px] border-t-[9px] border-x-transparent border-t-d-deep" aria-hidden />}
                      {c}
                    </span>
                  ))}
                </div>
                <table className="num mt-5 w-full text-[14.5px]">
                  <tbody>
                    <Row k="Energieeffizienzklasse" v={obj.energy} strong />
                    <Row k="Endenergiebedarf" v={`${obj.kwh} kWh/(m²·a)`} />
                    <Row k="Wärmeversorgung" v={obj.year > 2010 ? "Wärmepumpe" : "Gas-Zentralheizung"} />
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

        <aside id="kranich-besichtigung" className="scroll-mt-[calc(var(--bar-h)+1rem)]">
          <div className="space-y-4 @dlg:sticky @dlg:top-[calc(var(--bar-h)+1.5rem)]">
            <div className="rounded-[3px] border border-d-deep p-5 @dsm:p-6">
              <p className={cx(I.label, I.grey)}>{rent ? "Kaltmiete" : "Kaufpreis"}</p>
              <p className="num mt-3 font-d-display text-[3rem] leading-none font-black tracking-[-0.04em] text-d-deep">
                {eur0(obj.price)}
                {rent && <span className={cx("ml-1.5 text-[15px] font-medium tracking-normal", I.grey)}>/Monat</span>}
              </p>
              <h2 className={cx("mt-6", I.label, I.grey)}>Kostenaufstellung</h2>
              <table className="num mt-2 w-full text-[14.5px]">
                <tbody>
                  {rent ? (
                    <>
                      <Row k="Nebenkosten" v={`${eur0(obj.extra)} mtl.`} />
                      <Row k="Warmmiete" v={`${eur0(obj.price + obj.extra)} mtl.`} strong />
                      <Row k="Kaution" v={eur0(obj.price * 3)} />
                    </>
                  ) : (
                    <>
                      <Row k="Preis je m²" v={eur0(obj.price / obj.size)} />
                      {obj.extra > 0 && <Row k="Hausgeld" v={`${eur0(obj.extra)} mtl.`} />}
                      <Row k="Käuferprovision" v="3,57 % inkl. MwSt." />
                    </>
                  )}
                </tbody>
              </table>
            </div>
            <Viewing obj={obj} mine={mine} onRequest={onRequest} onDashboard={() => go("betrieb", "anfragen")} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <tr className="border-t border-[#cccccc]">
      <th scope="row" className={cx("py-2.5 pr-3 text-left font-normal", strong ? "font-bold text-d-deep" : "text-[#6b6a63]")}>
        {k}
      </th>
      <td className={cx("py-2.5 text-right text-d-deep", strong ? "font-bold" : "font-medium")}>{v}</td>
    </tr>
  );
}

function Viewing({ obj, mine, onRequest, onDashboard }: { obj: LiveObj; mine: Lead | null; onRequest: (l: Omit<Lead, "id" | "stage" | "when" | "own">) => void; onDashboard: () => void }) {
  const rent = obj.deal === "miete";
  const slots = [`${fmtDay(workday(1))}, 17:30`, `${fmtDay(workday(2))}, 12:00`, `${fmtDay(workday(4))}, 10:30`];
  const [slot, setSlot] = useState(slots[0]);
  const [name, setName] = useState("");
  const [mail, setMail] = useState("");
  const [move, setMove] = useState("sofort");
  const [household, setHousehold] = useState("2 Personen");
  const [income, setIncome] = useState("3");
  const [tried, setTried] = useState(false);
  const once = useOnce();
  const box = "rounded-[3px] bg-[#efefec] p-5 @dsm:p-6";
  const field = cx(input, "rounded-[3px] border-[#cccccc] text-d-deep hover:border-d-deep");
  const bad = { name: name.trim().length < 2, mail: !/^\S+@\S+\.\S+$/.test(mail.trim()) };

  if (mine) {
    const idx = { neu: 0, termin: 1, unterlagen: 2, zusage: 3 }[mine.stage];
    return (
      <div className={box} data-tour="besichtigung">
        <p className={cx(I.label, I.grey)}>Ihre Anfrage</p>
        <h2 className="mt-3 font-d-display text-[1.625rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-d-deep">{idx === 0 ? "Ihre Anfrage ist bei uns." : idx === 1 ? "Ihr Termin ist bestätigt." : idx === 2 ? "Ihre Unterlagen sind geprüft." : "Sie haben die Zusage."}</h2>
        <p className="num mt-2 text-[14px]">Wunschtermin: {mine.slot}</p>
        <Track steps={["Anfrage", "Termin", "Unterlagen", "Zusage"]} current={idx} className="mt-6" />
        <div className="mt-6 rounded-[3px] bg-white p-4 text-[13.5px] leading-snug">
          <strong className="font-bold text-d-deep">So sieht es das Büro:</strong> Ihre Anfrage liegt in der Pipeline unter „Neu“. Schieben Sie sie dort weiter – diese Anzeige läuft mit.
          <button type="button" onClick={onDashboard} className={cx(I.btn, "mt-3 w-full bg-d-deep text-white hover:bg-black")}>
            Im Dashboard ansehen
          </button>
        </div>
      </div>
    );
  }
  if (obj.status !== "aktiv") {
    return (
      <div className={box} data-tour="besichtigung">
        <p className={cx(I.label, I.grey)}>{obj.status === "reserviert" ? "Reserviert" : "Vergeben"}</p>
        <h2 className="mt-3 font-d-display text-[1.625rem] leading-[1.05] font-extrabold tracking-[-0.03em] text-d-deep">{obj.status === "reserviert" ? "Dieses Objekt ist reserviert." : "Dieses Objekt ist vergeben."}</h2>
        <p className="mt-3 text-[14.5px] leading-relaxed">Wir setzen Sie gern auf die Nachrückerliste und melden uns, wenn sich etwas ändert.</p>
      </div>
    );
  }
  return (
    <form
      noValidate
      data-tour="besichtigung"
      className={box}
      onSubmit={(ev) => {
        ev.preventDefault();
        setTried(true);
        if (bad.name || bad.mail || !once()) return;
        onRequest({ name: name.trim(), obj: obj.id, slot, move, household, fit: rent ? `${income.replace(".", ",")}-fache Miete` : "Finanzierung in Klärung", ok: rent ? Number(income) >= 3 : false });
      }}
    >
      <div className="flex items-center gap-3">
        <Avatar name="Friederike Kranich" />
        <p className="leading-tight">
          <span className="block text-[14.5px] font-bold text-d-deep">Friederike Kranich</span>
          <span className={cx("block text-[12.5px]", I.grey)}>zeigt Ihnen das Objekt persönlich</span>
        </p>
      </div>
      <h2 className="mt-5 font-d-display text-[1.625rem] leading-none font-extrabold tracking-[-0.03em] text-d-deep">Besichtigung anfragen</h2>
      <fieldset className="mt-5">
        <legend className={cx("mb-2.5", I.label, I.grey)}>Freie Termine</legend>
        <div className="grid gap-1.5">
          {slots.map((s) => (
            <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cx("num flex min-h-12 items-center justify-between rounded-[3px] border px-4 text-left text-[14.5px] font-bold transition-colors", slot === s ? "border-d-deep bg-d-deep text-white" : "border-[#cccccc] bg-white text-d-deep hover:border-d-deep")}>
              {s} Uhr {slot === s && <Check className="size-4" strokeWidth={3} aria-hidden />}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-4">
        <Field label="Name" error={tried && bad.name && "Bitte tragen Sie Ihren Namen ein."}>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={tried && bad.name} className={field} placeholder="Vor- und Nachname" />
        </Field>
        <Field label="E-Mail" error={tried && bad.mail && "Bitte eine gültige E-Mail-Adresse angeben."}>
          <input value={mail} onChange={(e) => setMail(e.target.value)} type="email" autoComplete="email" maxLength={80} aria-invalid={tried && bad.mail} className={field} placeholder="name@beispiel.de" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={rent ? "Einzug" : "Kauf geplant"}>
            <select value={move} onChange={(e) => setMove(e.target.value)} className={field}>
              <option>sofort</option>
              <option>in 1–3 Monaten</option>
              <option>später</option>
            </select>
          </Field>
          <Field label={obj.kind === "Gewerbe" ? "Arbeitsplätze" : "Haushalt"}>
            <select value={household} onChange={(e) => setHousehold(e.target.value)} className={field}>
              <option>1 Person</option>
              <option>2 Personen</option>
              <option>3 Personen</option>
              <option>4 und mehr</option>
            </select>
          </Field>
        </div>
        {rent && (
          <Field label="Haushaltsnetto im Verhältnis zur Kaltmiete" hint="Vermieter erwarten meist das Dreifache.">
            <select value={income} onChange={(e) => setIncome(e.target.value)} className={field}>
              <option value="2">etwa das Doppelte</option>
              <option value="3">etwa das Dreifache</option>
              <option value="4">das Vierfache oder mehr</option>
            </select>
          </Field>
        )}
      </div>
      <button type="submit" className={cx(I.btn, "mt-6 w-full bg-d-deep text-white hover:bg-black")}>
        Termin anfragen <ArrowRight className="size-4" aria-hidden />
      </button>
      <p className={cx("mt-3 text-center text-[12px]", I.grey)}>Demo: Es wird nichts gesendet oder gespeichert – erfundene Angaben genügen.</p>
    </form>
  );
}

/** Schematischer Grundriss – Wohnung mit Flur oder offene Gewerbefläche */
function FloorPlan({ obj }: { obj: Obj }) {
  const wall = { fill: "none", stroke: "#1e1e1b", strokeWidth: 3.5, strokeLinejoin: "miter" as const, strokeLinecap: "square" as const };
  const thin = { fill: "none", stroke: "#1e1e1b", strokeWidth: 1 };
  const label = { fontSize: 10, fontWeight: 700, fill: "#1e1e1b", fontFamily: "var(--d-display), sans-serif", textAnchor: "middle" as const, letterSpacing: "0.04em" };
  const small = { ...label, fontSize: 8.5, fontWeight: 500, fill: "#6b6a63", letterSpacing: "0" };
  const open = obj.kind === "Gewerbe" || obj.rooms === 1;
  const rooms = open
    ? obj.kind === "Gewerbe"
      ? [
          { x: 85, y: 75, n: "Offene Fläche", m: "118 m²" },
          { x: 252, y: 45, n: "Besprechung", m: "22 m²" },
          { x: 252, y: 120, n: "Besprechung", m: "18 m²" },
          { x: 252, y: 178, n: "Technik", m: "9 m²" },
          { x: 85, y: 178, n: "Teeküche", m: "13 m²" },
        ]
      : [
          { x: 110, y: 85, n: "Wohnen / Schlafen", m: "22 m²" },
          { x: 252, y: 55, n: "Bad", m: "4 m²" },
          { x: 252, y: 140, n: "Flur", m: "3 m²" },
          { x: 110, y: 178, n: "Pantry", m: "5 m²" },
        ]
    : [
        { x: 75, y: 62, n: "Wohnen", m: `${Math.round(obj.size * 0.3)} m²` },
        { x: 230, y: 50, n: obj.rooms > 3 ? "Wohnküche" : "Küche", m: `${Math.round(obj.size * 0.16)} m²` },
        { x: 75, y: 170, n: "Schlafen", m: `${Math.round(obj.size * 0.19)} m²` },
        { x: 187, y: 176, n: obj.rooms > 2 ? "Zimmer" : "Bad", m: `${Math.round(obj.size * 0.14)} m²` },
        { x: 271, y: 176, n: obj.rooms > 2 ? "Bad" : "Abst.", m: `${Math.round(obj.size * 0.07)} m²` },
        { x: 187, y: 113, n: "Flur", m: "" },
      ];
  return (
    <figure className="mt-5 rounded-[3px] bg-[#efefec] p-4 @dsm:p-6">
      <svg viewBox="0 0 320 232" role="img" aria-label={`Schematischer Grundriss: ${rooms.map((r) => r.n).join(", ")}`} className="w-full">
        <rect x="8" y="8" width="304" height="200" fill="#fff" />
        <rect x="8" y="8" width="304" height="200" {...wall} />
        {open ? (
          <>
            <path d="M200 8v200M200 82h112M200 152h112M8 152h192" {...wall} strokeWidth={2} />
            <path d="M200 100a16 16 0 0 1 16-16M200 170a16 16 0 0 1 16-16M150 152a16 16 0 0 1 16 16" {...thin} />
          </>
        ) : (
          <>
            <path d="M150 8v92M8 128h134M150 100h162M142 128v80M232 128v80M142 128h170" {...wall} strokeWidth={2} />
            <path d="M150 60a16 16 0 0 0-16 16M100 128a16 16 0 0 0 16 16M166 128a16 16 0 0 1 16 16M256 128a16 16 0 0 1 16 16M150 100" {...thin} />
          </>
        )}
        {/* Fenster */}
        <path d="M40 8h60M190 8h70M8 150v36M312 30v40" stroke="#fff" strokeWidth="4" />
        <path d="M40 8h60M190 8h70M8 150v36M312 30v40" stroke="#1e1e1b" strokeWidth="1" />
        {/* Wohnungstür */}
        <path d="M170 208h26" stroke="#fff" strokeWidth="4.5" />
        <path d="M170 208a26 26 0 0 1 26-26v26" {...thin} />
        {rooms.map((r, i) => (
          <g key={i}>
            <text x={r.x} y={r.y} {...label}>
              {r.n.toUpperCase()}
            </text>
            <text x={r.x} y={r.y + 12} {...small}>
              {r.m}
            </text>
          </g>
        ))}
        <path d="M8 222h60M8 219v6M68 219v6" {...thin} />
        <text x="38" y="231" {...small}>
          ca. 3 m
        </text>
      </svg>
      <figcaption className="mt-2 text-[12px] text-[#6b6a63]">Schematische Darstellung, nicht maßstabsgetreu.</figcaption>
    </figure>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

function Dashboard({ objects, leads, onStage, onStatus }: { objects: LiveObj[]; leads: Lead[]; onStage: (id: number, s: Stage | null) => void; onStatus: (id: string, s: ObjStatus) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { anfragen: "Anfragen", objekte: "Objekte", termine: "Besichtigungen", zahlen: "Auswertung" };
  return (
    <Backoffice
      user="Friederike Kranich"
      role="Geschäftsführung"
      title={titles[tab] ?? "Anfragen"}
      nav={[
        { id: "anfragen", label: "Anfragen", icon: Inbox, count: leads.filter((l) => l.stage === "neu").length },
        { id: "objekte", label: "Objekte", icon: Building2 },
        { id: "termine", label: "Besichtigungen", icon: CalendarClock },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "objekte" ? <ObjectTable objects={objects} onStatus={onStatus} /> : tab === "termine" ? <Viewings leads={leads} objects={objects} /> : tab === "zahlen" ? <Numbers objects={objects} leads={leads} /> : <Pipeline leads={leads} objects={objects} onStage={onStage} />}
    </Backoffice>
  );
}

function Pipeline({ leads, objects, onStage }: { leads: Lead[]; objects: LiveObj[]; onStage: (id: number, s: Stage | null) => void }) {
  const { toast } = useDemo();
  return (
    <div data-tour="pipeline" className="grid gap-3 @dmd:grid-cols-2 @dxl:grid-cols-4">
      {STAGES.map((st, si) => {
        const list = leads.filter((l) => l.stage === st.id);
        return (
          <section key={st.id} aria-label={st.title} className="min-w-0 rounded-[var(--bo-r)] border border-bo-line bg-bo-bg p-2">
            <h2 className="flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold text-bo-ink">
              {st.title} <span className="num rounded bg-white px-1.5 text-[12px] font-medium text-bo-muted">{list.length}</span>
            </h2>
            <ul className="space-y-2">
              {list.map((l) => {
                const o = objects.find((x) => x.id === l.obj)!;
                return (
                  <li key={l.id} className={cx("rounded-[var(--bo-r)] border border-bo-line bg-white p-3", l.own && "animate-demo-flash")}>
                    <div className="flex items-start gap-2.5">
                      <Avatar name={l.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] leading-tight font-semibold text-bo-ink">
                          {l.name}
                          {l.own && " (du)"}
                        </p>
                        <p className="truncate text-[12.5px] text-bo-muted">
                          <span className="font-plex-mono">{o.id}</span> · {o.title}
                        </p>
                      </div>
                    </div>
                    <dl className="mt-2.5 grid grid-cols-[4.5rem_1fr] gap-y-1 text-[12.5px]">
                      <dt className="text-bo-muted">Termin</dt>
                      <dd className="num text-bo-ink">{l.slot}</dd>
                      <dt className="text-bo-muted">Einzug</dt>
                      <dd className="text-bo-ink">{l.move}</dd>
                      <dt className="text-bo-muted">Haushalt</dt>
                      <dd className="text-bo-ink">{l.household}</dd>
                    </dl>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                      <Tag tone={l.ok ? "ok" : "warn"}>{l.fit}</Tag>
                      <span className="text-[11.5px] text-bo-muted">{l.when}</span>
                    </div>
                    {st.next && (
                      <div className="mt-3 flex gap-1.5 border-t border-bo-line pt-2.5">
                        <Btn size="sm" variant={st.id === "neu" ? "primary" : "dark"} className="flex-1" onClick={() => onStage(l.id, STAGES[si + 1].id)}>
                          {st.next}
                        </Btn>
                        <Btn
                          size="sm"
                          variant="quiet"
                          onClick={() => {
                            onStage(l.id, null);
                            toast(`Absage an ${l.name} vorbereitet – mit freundlicher Standardnachricht.`);
                          }}
                        >
                          Absagen
                        </Btn>
                      </div>
                    )}
                  </li>
                );
              })}
              {list.length === 0 && <li className="px-2 py-6 text-center text-[13px] text-bo-muted">Keine Anfragen in diesem Schritt.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function ObjectTable({ objects, onStatus }: { objects: LiveObj[]; onStatus: (id: string, s: ObjStatus) => void }) {
  const { toast } = useDemo();
  return (
    <Panel flush tour="objekte" title="Bestand" aside={`${objects.filter((o) => o.status === "aktiv").length} aktiv in der Vermarktung`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Objekt</th>
              <th className={th}>Art</th>
              <th className={cx(th, "text-right")}>Preis</th>
              <th className={cx(th, "text-right")}>Aufrufe</th>
              <th className={cx(th, "text-right")}>Anfragen</th>
              <th className={cx(th, "text-right")}>Quote</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {objects.map((o) => (
              <tr key={o.id} className={tr}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <span className="relative size-10 shrink-0 overflow-hidden rounded">
                      <Image src={o.img} alt="" fill sizes="40px" className="object-cover" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-bo-ink">{o.title}</p>
                      <p className="text-[12.5px] text-bo-muted">
                        <span className="font-plex-mono">{o.id}</span> · {o.area} · {o.rooms} Zi. · {o.size} m²
                      </p>
                    </div>
                  </div>
                </td>
                <td className={td}>{o.deal === "miete" ? "Miete" : "Kauf"}</td>
                <td className={cx(td, "num text-right text-bo-ink")}>{eur0(o.price)}</td>
                <td className={cx(td, "num text-right")}>{num(o.views)}</td>
                <td className={cx(td, "num text-right")}>{o.leads}</td>
                <td className={cx(td, "num text-right")}>{((o.leads / o.views) * 100).toFixed(1).replace(".", ",")} %</td>
                <td className={td}>
                  <label className="flex items-center gap-2">
                    <span className={cx("size-2 rounded-full", o.status === "aktiv" ? "bg-bo-ok" : o.status === "reserviert" ? "bg-[#c8860a]" : "bg-bo-muted")} aria-hidden />
                    <span className="sr-only">Status von {o.title}</span>
                    <select
                      value={o.status}
                      onChange={(e) => {
                        onStatus(o.id, e.target.value as ObjStatus);
                        toast(`${o.id} ist jetzt „${e.target.value}“ – auf der Website sofort sichtbar.`);
                      }}
                      className="min-h-9 rounded-[var(--bo-rc)] border border-bo-line bg-white px-2 text-[16px] text-bo-ink @dsm:text-[13px]"
                    >
                      <option value="aktiv">aktiv</option>
                      <option value="reserviert">reserviert</option>
                      <option value="vergeben">vergeben</option>
                    </select>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Viewings({ leads, objects }: { leads: Lead[]; objects: LiveObj[] }) {
  const list = leads.filter((l) => l.stage === "termin" || l.stage === "neu").filter((l) => l.slot.includes(","));
  // Tage in Kalenderreihenfolge (die Texte „Fr., 9. Okt." lassen sich nicht alphabetisch sortieren)
  const order = Array.from({ length: 8 }, (_, i) => fmtDay(workday(i)));
  const days = [...new Set(list.map((l) => l.slot.split(", ").slice(0, -1).join(", ")))].sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return (
    <div className="grid items-start gap-4 @dlg:grid-cols-2">
      {days.length === 0 && <Empty className="bg-white @dlg:col-span-2">Keine Besichtigungen geplant. Neue Anfragen erscheinen hier, sobald ein Termin gewählt ist.</Empty>}
      {days.map((d) => (
        <Panel key={d} flush title={d}>
          <ul>
            {list
              .filter((l) => l.slot.startsWith(d))
              .sort((a, b) => a.slot.localeCompare(b.slot))
              .map((l, i) => {
                const o = objects.find((x) => x.id === l.obj)!;
                return (
                  <li key={l.id} className={cx("flex items-center gap-4 px-4 py-3", i > 0 && "border-t border-bo-line")}>
                    <span className="num w-12 text-[15px] font-semibold text-bo-ink">{l.slot.split(", ").pop()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-bo-ink">{l.name}</p>
                      <p className="truncate text-[12.5px] text-bo-muted">
                        {o.title} · {o.area}
                      </p>
                    </div>
                    <Tag tone={l.stage === "termin" ? "ok" : "warn"}>{l.stage === "termin" ? "bestätigt" : "angefragt"}</Tag>
                  </li>
                );
              })}
          </ul>
        </Panel>
      ))}
    </div>
  );
}

function Numbers({ objects, leads }: { objects: LiveObj[]; leads: Lead[] }) {
  const own = leads.filter((l) => l.own).length;
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Objekte in der Vermarktung", value: objects.filter((o) => o.status === "aktiv").length, note: `${objects.filter((o) => o.status === "reserviert").length} reserviert` },
          { label: "Anfragen, 30 Tage", value: 246 + own, note: "68 % über die eigene Website" },
          { label: "Vermarktungsdauer", value: "23 Tage", note: "Mietobjekte im Schnitt" },
          { label: "Zeit bis zur ersten Antwort", value: "38 Min.", note: "vorher: 1,4 Tage" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-2">
        <Panel title="Vom Aufruf bis zur Zusage" aside="letzte 30 Tage">
          <Ranks
            data={[
              { label: "Exposé aufgerufen", value: 6512 },
              { label: "Anfrage gestellt", value: 246 + own, note: "3,8 %" },
              { label: "Besichtigt", value: 104, note: "42 %" },
              { label: "Unterlagen vollständig", value: 51, note: "49 %" },
              { label: "Zusage", value: 17, note: "33 %" },
            ]}
            format={num}
          />
          <p className="mt-3 text-[12.5px] text-bo-muted">Prozentwerte: Anteil am jeweils vorherigen Schritt.</p>
        </Panel>
        <Panel title="Anfragen je Objekt" aside="seit Veröffentlichung">
          <Bars label="Anfragen je Objekt" data={objects.map((o) => ({ label: o.id.replace("KR-", ""), value: o.leads }))} mark={objects.reduce((best, o, i, a) => (o.leads > a[best].leads ? i : best), 0)} />
        </Panel>
      </div>
    </div>
  );
}
