"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowLeft, BedDouble, Building2, CalendarClock, ChartColumn, Check, Inbox, MapPin, Maximize2, Phone } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Tag, td, th, tr, Track } from "@/demos/kit/ui";
import { cx, eur0, fmtDay, num, workday } from "@/demos/kit/util";

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

const priceLabel = (o: Obj) => (o.deal === "miete" ? `${eur0(o.price)} kalt` : eur0(o.price));

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

/* ───────────────────────────── Website ───────────────────────────── */

function Site({ objects, sel, onSelect, mine, onRequest }: { objects: LiveObj[]; sel: string; onSelect: (id: string) => void; mine: Lead | null; onRequest: (l: Omit<Lead, "id" | "stage" | "when" | "own">) => void }) {
  const { tab, setTab } = useDemo();
  const obj = objects.find((o) => o.id === sel)!;
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-[#f6f5f1] font-plex text-[15px] text-[#33403f]">
      <header className="border-b border-[#dcdad2] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3 sm:px-6">
          <button type="button" onClick={() => setTab("suche")} className="flex items-center gap-2.5 text-left">
            <svg viewBox="0 0 32 32" className="size-8 text-d-deep" aria-hidden>
              <rect width="32" height="32" rx="4" fill="currentColor" />
              <path d="M8 22.5V15l8-6.5 8 6.5v7.5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
              <path d="M13.500 22.500v-5h5v5" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
            </svg>
            <span className="leading-none">
              <span className="block font-d-display text-[1.5rem] text-d-deep">Kranich</span>
              <span className="block text-[10.5px] tracking-[0.22em] text-[#6f7b79] uppercase">Immobilien</span>
            </span>
          </button>
          <p className="num hidden items-center gap-1.5 text-[13.5px] text-[#55615f] sm:flex">
            <Phone className="size-3.5" aria-hidden /> 01234 445 566 · Mo – Fr, 9 – 18 Uhr
          </p>
        </div>
      </header>
      {tab === "expose" ? <Expose obj={obj} mine={mine} onBack={() => setTab("suche")} onRequest={onRequest} /> : <SearchPage objects={objects} onSelect={onSelect} />}
    </div>
  );
}

function StatusBadge({ status }: { status: ObjStatus }) {
  if (status === "aktiv") return null;
  return <span className={cx("absolute top-3 left-3 rounded-sm px-2 py-1 text-[11.5px] font-semibold tracking-wide uppercase", status === "reserviert" ? "bg-[#f0c75e] text-[#3d2f00]" : "bg-[#33403f] text-white")}>{status === "reserviert" ? "Reserviert" : "Vergeben"}</span>;
}

function SearchPage({ objects, onSelect }: { objects: LiveObj[]; onSelect: (id: string) => void }) {
  const [deal, setDeal] = useState<"alle" | Deal>("alle");
  const [rooms, setRooms] = useState(0);
  const [max, setMax] = useState(0);
  const list = objects.filter((o) => (deal === "alle" || o.deal === deal) && o.rooms >= rooms && (!max || (o.deal === "miete" ? o.price <= max : o.price <= max * 500)));
  const chip = (on: boolean) => cx("min-h-11 rounded-md border px-3.5 text-[14px] font-medium transition-colors", on ? "border-d-deep bg-d-deep text-white" : "border-[#cfcdc4] bg-white hover:border-d-deep");
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <h1 className="max-w-3xl font-d-display text-[clamp(2.1rem,5vw,3.6rem)] leading-[1.02] text-d-deep">
        Wohnen und arbeiten in Musterstadt. <em>Seit 1987 in guten Händen.</em>
      </h1>
      <div data-tour="suche" className="mt-7 flex flex-wrap items-end gap-x-6 gap-y-4 rounded-xl border border-[#dcdad2] bg-white p-4">
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-[#55615f]">Ich möchte</p>
          <div className="flex gap-1.5" role="group" aria-label="Mieten oder kaufen">
            {(["alle", "miete", "kauf"] as const).map((d) => (
              <button key={d} type="button" aria-pressed={deal === d} onClick={() => setDeal(d)} className={chip(deal === d)}>
                {d === "alle" ? "Alles sehen" : d === "miete" ? "Mieten" : "Kaufen"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-[#55615f]">Zimmer</p>
          <div className="flex gap-1.5" role="group" aria-label="Mindestens Zimmer">
            {[0, 2, 3, 4].map((r) => (
              <button key={r} type="button" aria-pressed={rooms === r} onClick={() => setRooms(r)} className={chip(rooms === r)}>
                {r === 0 ? "egal" : `ab ${r}`}
              </button>
            ))}
          </div>
        </div>
        <Field label="Miete bis" className="w-40">
          <select value={max} onChange={(e) => setMax(Number(e.target.value))} className={input}>
            <option value={0}>kein Limit</option>
            <option value={700}>700 € kalt</option>
            <option value={1000}>1.000 € kalt</option>
            <option value={1500}>1.500 € kalt</option>
          </select>
        </Field>
        <p className="num ml-auto self-center text-[14px] text-[#55615f]" aria-live="polite">
          {list.length} {list.length === 1 ? "Objekt" : "Objekte"}
        </p>
      </div>

      <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((o) => (
          <li key={o.id}>
            <button type="button" onClick={() => onSelect(o.id)} className="group block w-full overflow-hidden rounded-xl border border-[#dcdad2] bg-white text-left transition-shadow hover:shadow-[0_14px_34px_-18px_rgb(18_56_60/0.45)]">
              <span className="relative block aspect-[3/2] overflow-hidden">
                <Image src={o.img} alt={o.alt} fill sizes="(min-width:1024px) 360px, (min-width:640px) 50vw, 100vw" className={cx("object-cover transition-transform duration-500 group-hover:scale-[1.03]", o.status === "vergeben" && "grayscale")} />
                <StatusBadge status={o.status} />
                <span className="absolute right-3 bottom-3 rounded-sm bg-white/95 px-2 py-1 text-[12px] font-medium text-d-deep">{o.deal === "miete" ? "Zur Miete" : "Zum Kauf"}</span>
              </span>
              <span className="block p-4">
                <span className="flex items-center gap-1 text-[12.5px] text-[#6f7b79]">
                  <MapPin className="size-3.5" aria-hidden /> {o.area} · {o.kind}
                </span>
                <span className="mt-1 block font-d-display text-[1.45rem] leading-[1.1] text-d-deep">{o.title}</span>
                <span className="num mt-3 flex items-center justify-between gap-3 border-t border-[#e7e5de] pt-3 text-[13.5px]">
                  <span className="flex items-center gap-3 text-[#55615f]">
                    <span className="inline-flex items-center gap-1">
                      <BedDouble className="size-4" strokeWidth={1.6} aria-hidden /> {o.rooms} Zi.
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Maximize2 className="size-3.5" strokeWidth={1.6} aria-hidden /> {o.size} m²
                    </span>
                  </span>
                  <span className="text-[15px] font-semibold text-d-deep">{priceLabel(o)}</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-6 rounded-xl border border-dashed border-[#cfcdc4] px-5 py-10 text-center text-[#55615f]">Dazu haben wir gerade nichts. Lockere einen Filter – oder hinterlass einen Suchauftrag.</p>}
    </div>
  );
}

const ENERGY = ["A+", "A", "B", "C", "D", "E", "F", "G", "H"];
const ENERGY_COLOR = ["#2e9b4f", "#57b04a", "#93c13f", "#cdd235", "#f4d12f", "#f3a72c", "#ec7b2a", "#e14e28", "#c9302a"];

function Expose({ obj, mine, onBack, onRequest }: { obj: LiveObj; mine: Lead | null; onBack: () => void; onRequest: (l: Omit<Lead, "id" | "stage" | "when" | "own">) => void }) {
  const { go } = useDemo();
  const rent = obj.deal === "miete";
  const facts: [string, string][] = [
    ["Objekt-Nr.", obj.id],
    [obj.kind === "Gewerbe" ? "Räume" : "Zimmer", String(obj.rooms)],
    [obj.kind === "Gewerbe" ? "Nutzfläche" : "Wohnfläche", `${obj.size} m²`],
    ["Lage im Haus", obj.floor],
    ["Baujahr", String(obj.year)],
    ["Frei", obj.free],
  ];
  const e = ENERGY.indexOf(obj.energy);
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1.5 text-[14px] font-medium text-d-accent hover:underline">
        <ArrowLeft className="size-4" aria-hidden /> Alle Objekte
      </button>
      <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1fr)_23rem]">
        <div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
            <Image src={obj.img} alt={obj.alt} fill priority sizes="(min-width:1024px) 720px, 100vw" className="object-cover" />
            <StatusBadge status={obj.status} />
          </div>
          <p className="mt-5 flex items-center gap-1 text-[13.5px] text-[#6f7b79]">
            <MapPin className="size-4" aria-hidden /> Musterstadt-{obj.area}
          </p>
          <h1 className="mt-1 font-d-display text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.04] text-d-deep">{obj.title}</h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-relaxed">{obj.text}</p>

          <dl data-tour="fakten" className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-[#dcdad2] bg-[#dcdad2] sm:grid-cols-3">
            {facts.map(([k, v]) => (
              <div key={k} className="bg-white px-4 py-3">
                <dt className="text-[12px] text-[#6f7b79]">{k}</dt>
                <dd className="num mt-0.5 font-medium text-d-deep">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <section>
              <h2 className="font-d-display text-[1.5rem] text-d-deep">Grundriss</h2>
              <FloorPlan obj={obj} />
            </section>
            <section>
              <h2 className="font-d-display text-[1.5rem] text-d-deep">Ausstattung</h2>
              <ul className="mt-3 space-y-2">
                {obj.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5">
                    <Check className="size-4 text-d-accent" strokeWidth={2.5} aria-hidden /> {p}
                  </li>
                ))}
              </ul>
              <h2 className="mt-7 font-d-display text-[1.5rem] text-d-deep">Energieausweis</h2>
              <div className="mt-3" role="img" aria-label={`Energieeffizienzklasse ${obj.energy}, ${obj.kwh} Kilowattstunden je Quadratmeter und Jahr`}>
                <div className="flex gap-0.5">
                  {ENERGY.map((c, i) => (
                    <span key={c} className={cx("relative flex-1 py-1 text-center text-[11px] font-semibold text-white first:rounded-l last:rounded-r", i === e && "ring-2 ring-d-deep ring-offset-2 ring-offset-[#f6f5f1]")} style={{ background: ENERGY_COLOR[i] }}>
                      {c}
                    </span>
                  ))}
                </div>
                <p className="num mt-2.5 text-[13.5px] text-[#55615f]">
                  Klasse <strong className="font-semibold text-d-deep">{obj.energy}</strong> · {obj.kwh} kWh/(m²·a) · {obj.year > 2010 ? "Wärmepumpe" : "Gas-Zentralheizung"}
                </p>
              </div>
            </section>
          </div>
        </div>

        <aside>
          <div className="sticky top-[calc(var(--bar-h)+1rem)] space-y-4">
            <div className="rounded-xl bg-d-deep p-5 text-[#dfe9e8]">
              <p className="text-[12.5px] text-[#a9c1bf]">{rent ? "Kaltmiete" : "Kaufpreis"}</p>
              <p className="num font-d-display text-[2.4rem] leading-none text-white">{eur0(obj.price)}</p>
              <dl className="num mt-4 space-y-1.5 border-t border-white/15 pt-3 text-[14px]">
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
              </dl>
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
    <div className={cx("flex justify-between gap-3", strong && "font-semibold text-white")}>
      <dt className={strong ? "" : "text-[#a9c1bf]"}>{k}</dt>
      <dd>{v}</dd>
    </div>
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
  const box = "rounded-xl border border-[#dcdad2] bg-white p-5";

  if (mine) {
    const idx = { neu: 0, termin: 1, unterlagen: 2, zusage: 3 }[mine.stage];
    return (
      <div className={box} data-tour="besichtigung">
        <h2 className="font-d-display text-[1.4rem] leading-tight text-d-deep">{idx === 0 ? "Ihre Anfrage ist bei uns." : idx === 1 ? "Ihr Termin ist bestätigt." : idx === 2 ? "Ihre Unterlagen sind geprüft." : "Sie haben die Zusage."}</h2>
        <p className="num mt-1 text-[14px] text-[#55615f]">Wunschtermin: {mine.slot}</p>
        <Track steps={["Anfrage", "Termin", "Unterlagen", "Zusage"]} current={idx} className="mt-5" />
        <div className="mt-5 rounded-lg bg-d-soft p-3 text-[13.5px] leading-snug">
          <strong className="font-semibold">So sieht es das Büro:</strong> Ihre Anfrage liegt in der Pipeline unter „Neu“. Schieben Sie sie dort weiter – diese Anzeige läuft mit.
          <button type="button" onClick={onDashboard} className="mt-2 min-h-11 w-full rounded-md bg-d-deep px-3 font-medium text-white">
            Im Dashboard ansehen
          </button>
        </div>
      </div>
    );
  }
  if (obj.status !== "aktiv") {
    return (
      <div className={box} data-tour="besichtigung">
        <h2 className="font-d-display text-[1.4rem] text-d-deep">{obj.status === "reserviert" ? "Dieses Objekt ist reserviert." : "Dieses Objekt ist vergeben."}</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-[#55615f]">Wir setzen Sie gern auf die Nachrückerliste und melden uns, wenn sich etwas ändert.</p>
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
        if (name.trim().length < 2 || !mail.includes("@")) return;
        onRequest({ name: name.trim(), obj: obj.id, slot, move, household, fit: rent ? `${income.replace(".", ",")}-fache Miete` : "Finanzierung in Klärung", ok: rent ? Number(income) >= 3 : false });
      }}
    >
      <h2 className="font-d-display text-[1.4rem] text-d-deep">Besichtigung anfragen</h2>
      <fieldset className="mt-3">
        <legend className="mb-1.5 text-[12.5px] font-medium text-[#55615f]">Freie Termine</legend>
        <div className="grid gap-1.5">
          {slots.map((s) => (
            <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cx("num min-h-11 rounded-md border px-3 text-left text-[14px] font-medium", slot === s ? "border-d-accent bg-d-soft text-d-deep" : "border-[#cfcdc4] hover:border-d-deep")}>
              {s} Uhr
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-3 grid gap-3">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Vor- und Nachname" />
        </Field>
        <Field label="E-Mail">
          <input value={mail} onChange={(e) => setMail(e.target.value)} type="email" autoComplete="email" className={input} placeholder="name@beispiel.de" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label={rent ? "Einzug" : "Kauf geplant"}>
            <select value={move} onChange={(e) => setMove(e.target.value)} className={input}>
              <option>sofort</option>
              <option>in 1–3 Monaten</option>
              <option>später</option>
            </select>
          </Field>
          <Field label={obj.kind === "Gewerbe" ? "Arbeitsplätze" : "Haushalt"}>
            <select value={household} onChange={(e) => setHousehold(e.target.value)} className={input}>
              <option>1 Person</option>
              <option>2 Personen</option>
              <option>3 Personen</option>
              <option>4 und mehr</option>
            </select>
          </Field>
        </div>
        {rent && (
          <Field label="Haushaltsnetto im Verhältnis zur Kaltmiete" hint="Vermieter erwarten meist das Dreifache.">
            <select value={income} onChange={(e) => setIncome(e.target.value)} className={input}>
              <option value="2">etwa das Doppelte</option>
              <option value="3">etwa das Dreifache</option>
              <option value="4">das Vierfache oder mehr</option>
            </select>
          </Field>
        )}
      </div>
      {tried && (name.trim().length < 2 || !mail.includes("@")) && (
        <p role="alert" className="mt-3 text-[13px] text-bo-bad">
          Bitte Name und E-Mail eintragen – erfundene Angaben genügen.
        </p>
      )}
      <button type="submit" className="mt-4 min-h-12 w-full rounded-lg bg-d-accent px-4 font-medium text-white hover:brightness-95">
        Termin anfragen
      </button>
      <p className="mt-2 text-center text-[12px] text-[#6f7b79]">Demo: Es wird nichts gesendet oder gespeichert.</p>
    </form>
  );
}

/** Schematischer Grundriss – Wohnung mit Flur oder offene Gewerbefläche */
function FloorPlan({ obj }: { obj: Obj }) {
  const wall = { fill: "none", stroke: "#12383c", strokeWidth: 3, strokeLinejoin: "miter" as const };
  const thin = { fill: "none", stroke: "#12383c", strokeWidth: 1.25 };
  const label = { fontSize: 10.5, fill: "#33403f", fontFamily: "var(--font-plex-sans), sans-serif", textAnchor: "middle" as const };
  const small = { ...label, fontSize: 8.5, fill: "#6f7b79" };
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
    <figure className="mt-3 rounded-xl border border-[#dcdad2] bg-white p-4">
      <svg viewBox="0 0 320 232" role="img" aria-label={`Schematischer Grundriss: ${rooms.map((r) => r.n).join(", ")}`} className="w-full">
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
        <path d="M40 8h60M190 8h70M8 150v36M312 30v40" stroke="#fff" strokeWidth="3.5" />
        <path d="M40 8h60M190 8h70M8 150v36M312 30v40" stroke="#12383c" strokeWidth="1" />
        {/* Wohnungstür */}
        <path d="M170 208h26" stroke="#fff" strokeWidth="4" />
        <path d="M170 208a26 26 0 0 1 26-26v26" {...thin} />
        {rooms.map((r, i) => (
          <g key={i}>
            <text x={r.x} y={r.y} {...label}>
              {r.n}
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
      <figcaption className="mt-1 text-[12px] text-[#6f7b79]">Schematische Darstellung, nicht maßstabsgetreu.</figcaption>
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
    <div data-tour="pipeline" className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {STAGES.map((st, si) => {
        const list = leads.filter((l) => l.stage === st.id);
        return (
          <section key={st.id} aria-label={st.title} className="rounded-[10px] border border-bo-line bg-[#e9ebee] p-2">
            <h2 className="flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold text-bo-ink">
              {st.title} <span className="num rounded bg-white px-1.5 text-[12px] font-medium text-bo-muted">{list.length}</span>
            </h2>
            <ul className="space-y-2">
              {list.map((l) => {
                const o = objects.find((x) => x.id === l.obj)!;
                return (
                  <li key={l.id} className={cx("rounded-lg border border-bo-line bg-white p-3", l.own && "animate-demo-flash")}>
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
                      className="min-h-9 rounded-md border border-bo-line bg-white px-2 text-[16px] text-bo-ink sm:text-[13px]"
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
  const days = [...new Set(list.map((l) => l.slot.split(", ").slice(0, -1).join(", ")))];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
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
      <div className="grid gap-4 lg:grid-cols-2">
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
