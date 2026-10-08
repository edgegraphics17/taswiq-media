"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, Camera, ChartColumn, Check, ChevronRight, Columns3, Droplets, FileText, Flame, MapPin, Minus, Phone, PhoneCall, Plus, Star, ThermometerSun, TriangleAlert, Wind, Wrench, X } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Tag, td, th, tr, Track } from "@/demos/kit/ui";
import { clock, cx, eur, eur0, fmtDay, useOnce, weekdayShort, workday } from "@/demos/kit/util";

/**
 * Demo "Wilke Haustechnik": ein Auftrag aus drei Blickwinkeln – Kunde (Anfrage, Angebot, Status),
 * Büro (Aufträge, Angebot, Einsatzplan) und Monteur (Checkliste, Material, Unterschrift).
 * Jede Ansicht schreibt in denselben Auftrag; was eine Seite tut, sieht die andere sofort.
 */

type Stage = "anfrage" | "angebot" | "geplant" | "erledigt" | "rechnung";
const STAGES: { id: Stage; title: string }[] = [
  { id: "anfrage", title: "Anfrage" },
  { id: "angebot", title: "Angebot raus" },
  { id: "geplant", title: "Geplant" },
  { id: "erledigt", title: "Erledigt" },
  { id: "rechnung", title: "Abgerechnet" },
];
interface Pos {
  id: string;
  qty: number;
}
interface Order {
  id: string;
  customer: string;
  address: string;
  topic: string;
  desc: string;
  photos: number;
  urgent?: boolean;
  via: "Website" | "KI-Telefon" | "Telefon";
  stage: Stage;
  value: number;
  quote?: Pos[];
  tech?: string;
  day?: number;
  slot?: string;
  doneAt?: string;
  own?: boolean;
  mine?: boolean;
}

const CATALOG = [
  { id: "anfahrt", name: "Anfahrt Stadtgebiet", unit: "pauschal", price: 39 },
  { id: "stunde", name: "Monteurstunde", unit: "Std.", price: 68 },
  { id: "wartung", name: "Heizungswartung Gas-Brennwert", unit: "pauschal", price: 149 },
  { id: "ventil", name: "Thermostatventil tauschen", unit: "Stück", price: 46 },
  { id: "pumpe", name: "Hocheffizienz-Umwälzpumpe inkl. Einbau", unit: "Stück", price: 389 },
  { id: "abgleich", name: "Hydraulischer Abgleich", unit: "pauschal", price: 420 },
  { id: "entlueften", name: "Anlage entlüften, Druck prüfen", unit: "pauschal", price: 35 },
  { id: "klein", name: "Kleinmaterial", unit: "pauschal", price: 18 },
];
const price = (id: string) => CATALOG.find((c) => c.id === id)!.price;
const net = (q: Pos[]) => q.reduce((s, p) => s + price(p.id) * p.qty, 0);
const gross = (q: Pos[]) => net(q) * 1.19;

const TECHS = ["Deniz Aydin", "Ralf Jansen", "Svenja Mohr"];

const seedOrders = (): Order[] => [
  { id: "A-0151", customer: "Ingrid Paulsen", address: "Birkenweg 9", topic: "Heizkörper im Bad bleibt kalt", desc: "Anruf um 06:48 Uhr. Heizkörper im Bad wird seit gestern nicht warm, die anderen laufen. Gluckern zu hören. Kundin ist vormittags zu Hause und bittet um Rückruf wegen eines Termins.", photos: 0, via: "KI-Telefon", stage: "anfrage", value: 0 },
  { id: "A-0150", customer: "Kita Sonnenkäfer", address: "Schulstraße 3", topic: "Wasserhahn tropft, Spülkasten läuft nach", desc: "Zwei Waschbecken im Gruppenraum und ein WC im Personalbereich. Bitte außerhalb der Bringzeit kommen.", photos: 3, via: "Website", stage: "anfrage", value: 0 },
  { id: "A-0148", customer: "Familie Hartmann", address: "Am Mühlbach 17", topic: "Heizung wird im Obergeschoss nicht warm", desc: "Drei Heizkörper im Obergeschoss bleiben lauwarm, unten ist alles in Ordnung. Anlage ist von 2009.", photos: 2, via: "Website", stage: "angebot", value: 0, mine: true, quote: [{ id: "anfahrt", qty: 1 }, { id: "pumpe", qty: 1 }, { id: "ventil", qty: 3 }, { id: "entlueften", qty: 1 }, { id: "klein", qty: 1 }] },
  { id: "A-0147", customer: "Zahnarztpraxis Dr. Behrens", address: "Marktplatz 2", topic: "Klimagerät warten, zwei Räume", desc: "Jährliche Wartung, bitte Mittwochnachmittag.", photos: 0, via: "Telefon", stage: "angebot", value: 298 },
  { id: "A-0146", customer: "Markus Elsner", address: "Tannenstraße 41", topic: "Heizungswartung", desc: "Gas-Brennwert, letzte Wartung vor 14 Monaten.", photos: 0, via: "Website", stage: "geplant", value: 188, tech: "Deniz Aydin", day: 0, slot: "08:00 – 09:30" },
  { id: "A-0144", customer: "Hausverwaltung Kranich", address: "Lindenallee 12, Whg. 4", topic: "Thermostatventile tauschen (4 Stück)", desc: "Mieter ist informiert, Schlüssel beim Hausmeister.", photos: 1, via: "Website", stage: "geplant", value: 223, tech: "Deniz Aydin", day: 0, slot: "10:30 – 12:00" },
  { id: "A-0143", customer: "Bäckerei Reinhold", address: "Hauptstraße 60", topic: "Warmwasserspeicher entkalken", desc: "Vor Ladenöffnung nicht möglich, bitte ab 13 Uhr.", photos: 0, via: "Telefon", stage: "geplant", value: 310, tech: "Deniz Aydin", day: 0, slot: "13:30 – 15:30" },
  { id: "A-0145", customer: "Sabine Kurz", address: "Rosenweg 5", topic: "Badsanierung – Aufmaß", desc: "Dusche bodengleich, Waschtisch, Fliesen. Aufmaß und Beratung.", photos: 6, via: "Website", stage: "geplant", value: 0, tech: "Svenja Mohr", day: 1, slot: "09:00 – 10:30" },
  { id: "A-0142", customer: "Gregor Thiel", address: "Feldstraße 22", topic: "Umwälzpumpe getauscht", desc: "", photos: 4, via: "Website", stage: "erledigt", value: 512, tech: "Ralf Jansen", doneAt: "gestern, 15:10" },
  { id: "A-0139", customer: "Helga Wiesner", address: "Kastanienweg 8", topic: "Heizungswartung", desc: "", photos: 2, via: "Telefon", stage: "rechnung", value: 188, tech: "Deniz Aydin" },
  { id: "A-0138", customer: "Yogastudio Atemraum", address: "Hafenstraße 14", topic: "Lüftungsanlage gereinigt", desc: "", photos: 5, via: "Website", stage: "rechnung", value: 640, tech: "Svenja Mohr" },
];

const PLAN_EXTRA: { tech: string; day: number; slot: string; label: string }[] = [
  { tech: "Ralf Jansen", day: 0, slot: "07:30 – 12:00", label: "Rohbau Lindenhof · Leitungen" },
  { tech: "Ralf Jansen", day: 0, slot: "13:00 – 16:00", label: "Rohbau Lindenhof · Leitungen" },
  { tech: "Svenja Mohr", day: 0, slot: "08:00 – 11:00", label: "Bad Familie Okonkwo · Montage" },
  { tech: "Svenja Mohr", day: 0, slot: "12:30 – 15:00", label: "Wärmepumpe Elsner · Inbetriebnahme" },
  { tech: "Deniz Aydin", day: 1, slot: "08:00 – 10:00", label: "Wartung Praxis Dr. Vogel" },
  { tech: "Ralf Jansen", day: 1, slot: "07:30 – 16:00", label: "Rohbau Lindenhof · Leitungen" },
  { tech: "Deniz Aydin", day: 2, slot: "09:00 – 12:00", label: "Notdienst-Bereitschaft" },
  { tech: "Svenja Mohr", day: 2, slot: "08:00 – 15:00", label: "Bad Familie Okonkwo · Montage" },
  { tech: "Ralf Jansen", day: 3, slot: "08:00 – 12:00", label: "Heizungstausch Thomsen" },
  { tech: "Svenja Mohr", day: 4, slot: "08:00 – 13:00", label: "Bad Familie Okonkwo · Abnahme" },
];

export default function HandwerkDemo() {
  const { view, setTab, go } = useDemo();
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [quoteFor, setQuoteFor] = useState("A-0151");
  const patch = (id: string, change: Partial<Order>) => setOrders((p) => p.map((o) => (o.id === id ? { ...o, ...change } : o)));
  const add = (o: Omit<Order, "id" | "stage" | "value" | "via" | "own">) => {
    const id = `A-0${152 + orders.filter((x) => x.own).length}`;
    setOrders((p) => [{ ...o, id, stage: "anfrage", value: 0, via: "Website", own: true }, ...p]);
    setQuoteFor(id);
    return id;
  };
  if (view === "kunde") return <CustomerSite orders={orders} onAdd={add} onPatch={patch} />;
  if (view === "monteur") return <TechApp orders={orders} onPatch={patch} onOffice={() => go("betrieb", "auftraege")} />;
  return (
    <Office
      orders={orders}
      onPatch={patch}
      quoteFor={quoteFor}
      onQuote={(id) => {
        setQuoteFor(id);
        setTab("angebot");
      }}
    />
  );
}

/* ───────────────────────────── Kundenseite ─────────────────────────────
   Gestaltung „Wilke": kräftig und handfest. Navy (#152b3b) trägt, Gelb (#f4c042) ruft zur Handlung – immer mit Navy-Schrift.
   Big Shoulders 900 in Versalien für Überschriften, Instrument Sans für Text. Dicke Karten (Radius 16 px, 2 px Rand),
   Schaltflächen mit 10 px Radius, Vertrauens-Plaketten als Pillen. Abstände im 4/8er-Raster, Sektionen 40/72. */

const H = "font-d-display font-black tracking-[0.005em] uppercase";
const B = {
  wrap: "mx-auto w-full max-w-[72rem] px-4 @dsm:px-6 @dlg:px-8",
  label: "text-[12px] leading-none font-bold tracking-[0.16em] uppercase",
  muted: "text-[#4d606d]",
  yes: "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-d-accent px-6 text-[14px] font-bold tracking-[0.06em] text-d-on uppercase shadow-[0_3px_0_#c9982a] transition-[filter,transform,box-shadow] hover:brightness-105 active:translate-y-[2px] active:shadow-[0_1px_0_#c9982a] disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
  no: "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border-2 border-d-deep bg-white px-5 text-[14px] font-bold tracking-[0.06em] text-d-deep uppercase transition-colors hover:bg-d-deep hover:text-white active:translate-y-px",
  card: "overflow-hidden rounded-[16px] border-2 border-d-deep bg-white",
};

function CustomerSite({ orders, onAdd, onPatch }: { orders: Order[]; onAdd: (o: Omit<Order, "id" | "stage" | "value" | "via" | "own">) => string; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { tab, setTab } = useDemo();
  const mine = orders.filter((o) => o.mine || o.own);
  return (
    <div className="min-h-[var(--app-h)] bg-white font-plex text-[15px] leading-[1.55] text-d-deep">
      <header className="on-dark sticky top-[var(--bar-h)] z-20 bg-d-deep text-white">
        <div className={cx(B.wrap, "flex items-stretch justify-between gap-2")}>
          <p className="flex min-w-0 items-center gap-2.5 py-2.5">
            <span className={cx(H, "grid size-10 shrink-0 place-items-center rounded-[10px] bg-d-accent text-[22px] leading-none text-d-on")} aria-hidden>
              W
            </span>
            <span className="leading-none">
              <span className={cx(H, "block text-[1.25rem] text-white")}>Wilke</span>
              <span className="mt-1 hidden text-[10.5px] font-bold tracking-[0.16em] text-d-accent uppercase @dsm:block">Sanitär · Heizung · Klima</span>
            </span>
          </p>
          <nav aria-label="Kundenbereich" className="flex">
            {[
              { id: "anfrage", label: "Anfrage stellen", short: "Anfrage" },
              { id: "status", label: `Meine Aufträge (${mine.length})`, short: `Aufträge (${mine.length})` },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("relative min-h-12 px-2 text-[12.5px] font-bold tracking-[0.04em] whitespace-nowrap uppercase transition-colors @dsm:px-4 @dsm:text-[13px] @dsm:tracking-[0.08em]", tab === n.id ? "text-white" : "text-white/65 hover:text-d-accent")}>
                <span className="num @dsm:hidden">{n.short}</span>
                <span className="num hidden @dsm:inline">{n.label}</span>
                {tab === n.id && <span className="absolute inset-x-3 bottom-0 h-1 rounded-t-full bg-d-accent @dsm:inset-x-4" aria-hidden />}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "status" ? <MyOrders orders={mine} onPatch={onPatch} /> : <Request onAdd={onAdd} onStatus={() => setTab("status")} />}
      <footer className="on-dark bg-d-deep text-white/70">
        <div className={cx(B.wrap, "flex flex-wrap items-center justify-between gap-x-8 gap-y-2 border-t border-white/15 py-5 text-[12px] font-bold tracking-[0.12em] uppercase")}>
          <span className="text-white">Wilke Haustechnik GmbH</span>
          <span>Werkstraße 8, Musterstadt</span>
          <span className="num text-d-accent">Notdienst 01234 110 220</span>
        </div>
      </footer>
    </div>
  );
}

const TOPICS = [
  { id: "heizung", label: "Heizung wird nicht warm", icon: ThermometerSun },
  { id: "wartung", label: "Wartung der Heizung", icon: Wrench },
  { id: "wasser", label: "Wasserhahn, WC, Abfluss", icon: Droplets },
  { id: "rohrbruch", label: "Rohrbruch oder Wasserschaden", icon: TriangleAlert, urgent: true },
  { id: "klima", label: "Klima und Lüftung", icon: Wind },
  { id: "gas", label: "Gasgeruch", icon: Flame, urgent: true },
];
const THUMBS = ["/images/demo/photos/h-heating.webp", "/images/demo/photos/h-pipe.webp", "/images/sectors/handwerk-0.webp"];
const TRADES = [
  { topic: "heizung", img: "/images/demo/photos/h-heating.webp", alt: "Gusseiserner Heizkörper unter einem Fenster", label: "Heizung", note: "Wird nicht warm · Wartung · Tausch" },
  { topic: "wasser", img: "/images/demo/photos/h-bath.webp", alt: "Modernes Bad mit Glasdusche und Doppelwaschtisch", label: "Sanitär & Bad", note: "Wasserhahn · WC · Abfluss" },
  { topic: "rohrbruch", img: "/images/demo/photos/h-pipe.webp", alt: "Monteur arbeitet am Siphon unter einem Waschbecken", label: "Rohr & Notfall", note: "Rohrbruch · Wasserschaden" },
];

function Request({ onAdd, onStatus }: { onAdd: (o: Omit<Order, "id" | "stage" | "value" | "via" | "own">) => string; onStatus: () => void }) {
  const { go, toTop } = useDemo();
  const [step, setStep] = useState(0);
  const [topic, setTopic] = useState("");
  const [desc, setDesc] = useState("");
  const [photos, setPhotos] = useState(0);
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [phone, setPhone] = useState("");
  const [when, setWhen] = useState("vormittags");
  const [tried, setTried] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const once = useOnce();
  const t = TOPICS.find((x) => x.id === topic);
  const bad = { name: name.trim().length < 2, street: street.trim().length < 4, phone: phone.trim().length < 6 };
  const valid = !bad.name && !bad.street && !bad.phone;
  const start = () => document.getElementById("anfrage-start")?.scrollIntoView({ behavior: "smooth", block: "start" });
  const field = cx(input, "min-h-12 border-2 border-d-deep/25 text-d-deep hover:border-d-deep/60 focus:border-d-deep");

  if (done) {
    return (
      <div className={cx(B.wrap, "py-12 @dlg:py-20")}>
        <div className="mx-auto max-w-xl">
          <span className="grid size-14 place-items-center rounded-[14px] bg-d-accent text-d-on shadow-[0_3px_0_#c9982a]" aria-hidden>
            <Check className="size-7" strokeWidth={3} />
          </span>
          <h1 className={cx(H, "mt-6 text-[clamp(2.75rem,11cqi,4.5rem)] leading-[0.88] text-d-deep")}>Anfrage ist da.</h1>
          <p className={cx("mt-4 text-[16.5px] leading-relaxed", B.muted)}>
            Vorgang <span className="num font-plex-mono font-semibold text-d-deep">{done}</span>. Wir melden uns heute noch mit einem Angebot oder einem Terminvorschlag.
          </p>
          <div className={cx(B.card, "mt-8")}>
            <p className={cx(H, "bg-d-deep px-5 py-3 text-[1.125rem] leading-none text-d-accent")}>So sieht es das Büro</p>
            <div className="p-5 text-[14.5px] leading-snug">
              Ihre Anfrage steht mit Beschreibung und Fotos in der Auftragsübersicht. Schreiben Sie dort das Angebot – hier unter „Meine Aufträge“ können Sie es danach annehmen.
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button type="button" onClick={() => go("betrieb", "auftraege")} className={B.yes}>
                  Im Büro ansehen
                </button>
                <button type="button" onClick={onStatus} className={B.no}>
                  Meine Aufträge
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
      <section className="on-dark relative overflow-hidden bg-d-deep text-white">
        <div className={cx(B.wrap, "grid gap-10 pt-10 pb-12 @dlg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] @dlg:items-center @dlg:gap-14 @dlg:pt-16 @dlg:pb-20")}>
          <div>
            <p className={cx(B.label, "text-d-accent")}>Meisterbetrieb in Musterstadt · seit 1994</p>
            <h1 className={cx(H, "mt-4 text-[clamp(2.1rem,11.2cqi,5.5rem)] leading-[0.86] text-white")}>
              <span className="block whitespace-nowrap">Heute melden.</span>
              <span className="block whitespace-nowrap text-d-accent">Morgen läuft&apos;s.</span>
            </h1>
            <p className="mt-6 max-w-md text-[16.5px] leading-relaxed text-white/80">Anliegen in drei Schritten schildern, Fotos anhängen, fertig. Sie bekommen heute noch ein Angebot oder einen Termin.</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <button type="button" onClick={start} className={B.yes}>
                Anfrage starten <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
              </button>
              <button type="button" onClick={onStatus} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border-2 border-white/45 px-5 text-[14px] font-bold tracking-[0.06em] text-white uppercase transition-colors hover:border-white hover:bg-white hover:text-d-deep active:translate-y-px">
                Meine Aufträge
              </button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Unsere Zusagen">
              {[
                [Wrench, "Meisterbetrieb"],
                [Check, "Festpreis vorab"],
                [Star, "4,9 bei 380 Kunden"],
              ].map(([Icon, text]) => {
                const I2 = Icon as typeof Wrench;
                return (
                  <li key={text as string} className="num inline-flex min-h-9 items-center gap-2 rounded-full border border-white/25 px-3.5 text-[12.5px] font-bold tracking-[0.06em] text-white uppercase">
                    <I2 className="size-4 text-d-accent" strokeWidth={2.4} aria-hidden /> {text as string}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative @dlg:pl-6">
            <span className="absolute -right-3 -bottom-3 left-10 top-8 rounded-[16px] bg-d-accent @dlg:left-16" aria-hidden />
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] border-2 border-white/15 bg-[#0e1f2b]">
              <Image src="/images/demo/photos/h-hero.webp" alt="Monteur von Wilke Haustechnik zieht eine Verschraubung unter einem Waschbecken nach" fill priority sizes="(min-width: 64rem) 34rem, 100vw" className="object-cover object-[35%_center]" />
            </div>
            <p className="absolute bottom-5 -left-1 flex items-center gap-3 rounded-[12px] border-2 border-d-deep bg-white py-2.5 pr-4 pl-2.5 text-d-deep @dlg:left-0">
              <span className={cx(H, "num grid size-12 place-items-center rounded-[8px] bg-d-deep text-[1.375rem] leading-none text-d-accent")}>2,4</span>
              <span className="text-[13px] leading-tight font-semibold">
                Stunden bis
                <br />
                zum Angebot
              </span>
            </p>
          </div>
        </div>
      </section>

      <p className="num bg-d-accent text-d-on">
        <span className={cx(B.wrap, "flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-3 text-[14px] font-bold")}>
          <span className="inline-flex items-center gap-2 tracking-[0.06em] uppercase">
            <TriangleAlert className="size-5" strokeWidth={2.2} aria-hidden /> Rohrbruch oder Gasgeruch?
          </span>
          <span className={cx(H, "inline-flex items-center gap-2 text-[1.375rem] leading-none")}>
            <Phone className="size-5" strokeWidth={2.4} aria-hidden /> 24/7-Notdienst 01234 110 220
          </span>
        </span>
      </p>

      <section aria-labelledby="wilke-leistungen" className={cx(B.wrap, "pt-10 @dlg:pt-16")}>
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-2">
          <h2 id="wilke-leistungen" className={cx(H, "text-[clamp(2rem,6cqi,3rem)] leading-[0.9] text-d-deep")}>
            Was wir richten
          </h2>
          <p className={cx("max-w-sm text-[14.5px]", B.muted)}>Tippen Sie auf einen Bereich – die Anfrage startet gleich mit dem passenden Anliegen.</p>
        </div>
        <ul className="mt-6 grid gap-4 @dsm:grid-cols-3">
          {TRADES.map((s) => (
            <li key={s.img}>
              <button
                type="button"
                onClick={() => {
                  setTopic(s.topic);
                  setStep(1);
                  start();
                }}
                className={cx(B.card, "group flex w-full flex-col text-left transition-transform hover:-translate-y-1")}
              >
                <span className="relative block aspect-[4/3] w-full overflow-hidden @max-dsm:aspect-[16/9]">
                  <Image src={s.img} alt={s.alt} fill sizes="(min-width: 40rem) 22rem, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                </span>
                <span className="flex items-center justify-between gap-3 bg-d-deep px-4 py-4 text-white">
                  <span>
                    <span className={cx(H, "block text-[1.5rem] leading-none text-d-accent")}>{s.label}</span>
                    <span className="mt-2 block text-[13px] leading-snug text-white/75">{s.note}</span>
                  </span>
                  <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-d-accent text-d-on" aria-hidden>
                    <ArrowRight className="size-5" strokeWidth={2.5} />
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <div id="anfrage-start" className={cx(B.wrap, "scroll-mt-[calc(var(--bar-h)+4rem)] py-10 @dlg:py-16")}>
        <div data-tour="anfrage" className={cx(B.card, "mx-auto max-w-3xl")}>
          <div className="on-dark bg-d-deep px-4 pt-5 pb-4 text-white @dsm:px-7">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-1">
              <p className={cx(H, "text-[1.75rem] leading-none text-white")}>Anfrage stellen</p>
              <p className={cx("num", B.label, "text-d-accent")}>Schritt {step + 1} von 3</p>
            </div>
            <ol className="mt-4 grid grid-cols-3 gap-2" aria-label="Fortschritt">
              {["Anliegen", "Beschreibung", "Adresse"].map((s, i) => (
                <li key={s} aria-current={step === i ? "step" : undefined} className="min-w-0">
                  <span className={cx("block h-1.5 rounded-full", i <= step ? "bg-d-accent" : "bg-white/20")} />
                  <span className={cx("mt-2 block truncate text-[12px] font-bold tracking-[0.06em] uppercase", i <= step ? "text-white" : "text-white/55")}>
                    <span className="num">{i + 1}</span> · {s}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="px-4 py-6 @dsm:px-7 @dsm:py-8">
            {step === 0 && (
              <div>
                <h2 className={cx(H, "text-[1.75rem] leading-none text-d-deep")}>Worum geht es?</h2>
                <div className="mt-5 grid gap-2.5 @dsm:grid-cols-2">
                  {TOPICS.map((x) => (
                    <button
                      key={x.id}
                      type="button"
                      aria-pressed={topic === x.id}
                      onClick={() => {
                        setTopic(x.id);
                        setStep(1);
                      }}
                      className={cx("flex min-h-[4.25rem] items-center gap-3 rounded-[12px] border-2 px-3.5 text-left transition-colors", topic === x.id ? "border-d-deep bg-d-soft" : "border-d-deep/15 bg-white hover:border-d-deep")}
                    >
                      <span className={cx("grid size-10 shrink-0 place-items-center rounded-[10px]", x.urgent ? "bg-bo-bad text-white" : "bg-d-deep text-d-accent")}>
                        <x.icon className="size-5" strokeWidth={1.9} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1 leading-tight font-bold text-d-deep">{x.label}</span>
                      {x.urgent ? <span className="rounded-full bg-bo-bad px-2.5 py-1 text-[11px] leading-none font-bold tracking-[0.06em] text-white uppercase">Notfall</span> : <ChevronRight className="size-5 shrink-0 text-d-deep/45" aria-hidden />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className={cx(H, "text-[1.75rem] leading-none text-d-deep")}>{t?.label ?? "Beschreibung"}</h2>
                {t?.urgent && (
                  <p role="alert" className="num mt-4 flex gap-3 rounded-[12px] border-2 border-bo-bad bg-[#fbe7e5] px-4 py-3 text-[14px] leading-snug font-semibold text-bo-bad">
                    <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
                    <span>
                      Bei Gefahr bitte sofort anrufen: 01234 110 220. {t.id === "gas" && "Fenster öffnen, kein Licht schalten, Haus verlassen."}
                    </span>
                  </p>
                )}
                <Field label="Was genau ist los?" hint="Seit wann, welche Räume, was haben Sie schon versucht?" className="mt-5">
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} maxLength={600} className={cx(field, "py-3 leading-relaxed")} placeholder="Zum Beispiel: Seit gestern Abend bleiben die Heizkörper im Obergeschoss kalt …" />
                </Field>
                <p className="mt-5 mb-2 text-[12.5px] leading-tight font-semibold opacity-85">
                  Fotos helfen uns, das richtige Material mitzubringen <span className="num font-normal opacity-70">({photos} von 3)</span>
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {Array.from({ length: photos }, (_, i) => (
                    <span key={i} className="relative size-20 overflow-hidden rounded-[12px] border-2 border-d-deep">
                      <Image src={THUMBS[i % THUMBS.length]} alt={`Foto ${i + 1}`} fill sizes="80px" className="object-cover" />
                      <button type="button" onClick={() => setPhotos((p) => Math.max(0, p - 1))} aria-label={`Foto ${i + 1} entfernen`} className="absolute top-0 right-0 grid size-8 place-items-center rounded-bl-[10px] bg-d-deep text-white after:absolute after:-inset-1.5">
                        <X className="size-4" aria-hidden />
                      </button>
                    </span>
                  ))}
                  {photos < 3 && (
                    <button type="button" onClick={() => setPhotos((p) => p + 1)} className="grid size-20 place-items-center rounded-[12px] border-2 border-dashed border-d-deep/45 bg-d-soft/50 text-d-deep transition-colors hover:border-d-deep hover:bg-d-accent/30">
                      <span className="text-center text-[11.5px] leading-tight font-bold tracking-[0.06em] uppercase">
                        <Camera className="mx-auto mb-1 size-5" strokeWidth={1.8} aria-hidden /> Foto
                      </span>
                    </button>
                  )}
                </div>
                <div className="mt-8 flex justify-between gap-2.5">
                  <button type="button" onClick={() => setStep(0)} className={B.no}>
                    Zurück
                  </button>
                  <button type="button" onClick={() => setStep(2)} className={B.yes}>
                    Weiter <ArrowRight className="size-4" strokeWidth={2.5} aria-hidden />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  setTried(true);
                  if (!valid || !once()) return;
                  setDone(onAdd({ customer: name.trim(), address: street.trim(), topic: t?.label ?? "Anfrage", desc: desc.trim() || "Keine Beschreibung angegeben.", photos, urgent: t?.urgent, slot: when }));
                  toTop();
                }}
              >
                <h2 className={cx(H, "text-[1.75rem] leading-none text-d-deep")}>Wo und wann?</h2>
                <div className="mt-5 grid gap-4 @dsm:grid-cols-2">
                  <Field label="Name" error={tried && bad.name && "Bitte tragen Sie Ihren Namen ein."}>
                    <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={60} aria-invalid={tried && bad.name} className={field} placeholder="Vor- und Nachname" />
                  </Field>
                  <Field label="Telefon" error={tried && bad.phone && "Bitte geben Sie eine Telefonnummer an."}>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" maxLength={24} aria-invalid={tried && bad.phone} className={field} placeholder="0151 2345678" />
                  </Field>
                  <Field label="Straße und Hausnummer" className="@dsm:col-span-2" error={tried && bad.street && "Wohin dürfen wir kommen?"}>
                    <input value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="street-address" maxLength={80} aria-invalid={tried && bad.street} className={field} placeholder="Gartenweg 12, Musterstadt" />
                  </Field>
                </div>
                <fieldset className="mt-5">
                  <legend className="mb-2 text-[12.5px] leading-tight font-semibold opacity-85">Wann passt es Ihnen am besten?</legend>
                  <div className="grid grid-cols-2 gap-2 @dsm:flex @dsm:flex-wrap">
                    {["vormittags", "nachmittags", "ganztags", "so schnell wie möglich"].map((w) => (
                      <button key={w} type="button" aria-pressed={when === w} onClick={() => setWhen(w)} className={cx("min-h-12 rounded-[10px] border-2 px-3.5 text-[13px] leading-tight font-bold tracking-[0.04em] uppercase transition-colors", when === w ? "border-d-deep bg-d-deep text-white" : "border-d-deep/20 bg-white text-d-deep hover:border-d-deep")}>
                        {w}
                      </button>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-8 flex justify-between gap-2.5">
                  <button type="button" onClick={() => setStep(1)} className={B.no}>
                    Zurück
                  </button>
                  <button type="submit" className={B.yes}>
                    Anfrage senden
                  </button>
                </div>
                <p className={cx("mt-3 text-right text-[12px]", B.muted)}>Demo: Es wird nichts gesendet oder gespeichert – erfundene Angaben genügen.</p>
              </form>
            )}
          </div>
        </div>
      </div>

      <section className="bg-d-soft">
        <div className={cx(B.wrap, "py-10 @dlg:py-16")}>
          <h2 className={cx(H, "text-[clamp(2rem,6cqi,3rem)] leading-[0.9] text-d-deep")}>So läuft&apos;s ab</h2>
          <ol className="mt-6 grid gap-4 @dsm:grid-cols-2 @dlg:grid-cols-4">
            {[
              ["Anfrage", "Sie schildern das Problem und hängen Fotos an – in zwei Minuten."],
              ["Angebot", "Festpreis aufs Handy, meist noch am selben Tag. Annehmen mit einem Tipp."],
              ["Termin", "Wir teilen einen Monteur ein. Er meldet sich 30 Minuten vor Ankunft."],
              ["Abnahme", "Arbeitsbericht mit Fotos, Sie unterschreiben auf dem Display."],
            ].map(([title, text], i) => (
              <li key={title} className="rounded-[16px] bg-white p-5">
                <p className={cx(H, "num flex items-center gap-3 text-[1.5rem] leading-none text-d-deep")}>
                  <span className="grid size-11 place-items-center rounded-[10px] bg-d-accent text-[1.5rem] text-d-on">{i + 1}</span>
                  {title}
                </p>
                <p className={cx("mt-3 text-[14px] leading-snug", B.muted)}>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

function QuoteTable({ quote, dark }: { quote: Pos[]; dark?: boolean }) {
  const line = dark ? "border-white/15" : "border-bo-line";
  return (
    <table className="num w-full text-[13.5px]">
      <thead>
        <tr className={cx("text-left text-[11px] font-semibold tracking-[0.08em] uppercase", dark ? "text-white/65" : "text-bo-muted")}>
          <th className="py-2 font-semibold">Leistung</th>
          <th className="py-2 text-right font-semibold">Menge</th>
          <th className="py-2 text-right font-semibold">Betrag</th>
        </tr>
      </thead>
      <tbody>
        {quote.map((p) => {
          const c = CATALOG.find((x) => x.id === p.id)!;
          return (
            <tr key={p.id} className={cx("border-t", line)}>
              <td className="py-2.5 pr-2">{c.name}</td>
              <td className="py-2.5 text-right whitespace-nowrap">
                {p.qty} {c.unit === "pauschal" ? "" : c.unit}
              </td>
              <td className="py-2.5 pl-2 text-right whitespace-nowrap">{eur(c.price * p.qty)}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className={cx("border-t", line)}>
          <td colSpan={2} className="pt-2.5 text-right opacity-80">
            Netto
          </td>
          <td className="pt-2.5 pl-2 text-right whitespace-nowrap">{eur(net(quote))}</td>
        </tr>
        <tr>
          <td colSpan={2} className="text-right opacity-80">
            19 % MwSt.
          </td>
          <td className="pl-2 text-right whitespace-nowrap">{eur(net(quote) * 0.19)}</td>
        </tr>
        <tr className="text-[17px] font-bold">
          <td colSpan={2} className="pt-1.5 text-right">
            Festpreis
          </td>
          <td className="pt-1.5 pl-2 text-right whitespace-nowrap">{eur(gross(quote))}</td>
        </tr>
      </tfoot>
    </table>
  );
}

function MyOrders({ orders, onPatch }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { go, toast } = useDemo();
  return (
    <>
      <section className="on-dark bg-d-deep text-white">
        <div className={cx(B.wrap, "py-8 @dlg:py-12")}>
          <p className={cx(B.label, "text-d-accent")}>Kundenbereich</p>
          <h1 className={cx(H, "mt-3 text-[clamp(2.75rem,11cqi,5rem)] leading-[0.86] text-white")}>Meine Aufträge</h1>
        </div>
      </section>
      <div className={cx(B.wrap, "py-8 @dlg:py-12")}>
        <div className="mx-auto max-w-3xl space-y-5" data-tour="status">
          {orders.map((o) => {
            const idx = STAGES.findIndex((s) => s.id === o.stage);
            const waiting = o.stage === "angebot" && o.quote;
            return (
              <article key={o.id} className={B.card}>
                <header className="on-dark flex flex-wrap items-start justify-between gap-3 bg-d-deep px-5 py-4 text-white">
                  <div className="min-w-0">
                    <p className="num font-plex-mono text-[12.5px] font-medium text-d-accent">{o.id}</p>
                    <h2 className="mt-1 text-[18px] leading-snug font-bold tracking-normal break-words text-white">{o.topic}</h2>
                    <p className="mt-1 flex items-start gap-1.5 text-[13px] text-white/75">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden /> <span className="min-w-0 break-words">{o.address}</span>
                    </p>
                  </div>
                  {waiting && <span className="rounded-full bg-d-accent px-3 py-1.5 text-[11.5px] leading-none font-bold tracking-[0.06em] text-d-on uppercase">Angebot liegt vor</span>}
                </header>
                <div className="px-3 py-5 @dsm:px-5">
                  <Track steps={["Anfrage", "Angebot", "Termin", "Erledigt", "Rechnung"]} current={idx} />
                </div>
                {waiting && (
                  <div className="border-t-2 border-d-deep bg-d-soft/60 px-5 py-5">
                    <QuoteTable quote={o.quote!} />
                    <p className={cx("mt-4 text-[13px]", B.muted)}>Festpreis, gültig 14 Tage. Mehr wird es nur nach Rücksprache.</p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          onPatch(o.id, { stage: "geplant", value: gross(o.quote!) });
                          toast("Angebot angenommen. Im Büro wartet der Auftrag jetzt im Einsatzplan auf einen Monteur.");
                        }}
                        className={cx(B.yes, "flex-1 @dsm:flex-none")}
                      >
                        Angebot annehmen
                      </button>
                      <button type="button" onClick={() => toast("Kein Problem – sagen Sie uns kurz Bescheid, dann passen wir das Angebot an.")} className={cx(B.no, "flex-1 @dsm:flex-none")}>
                        Ablehnen
                      </button>
                    </div>
                  </div>
                )}
                {o.stage === "anfrage" && <p className={cx("border-t border-d-deep/15 px-5 py-4 text-[14px]", B.muted)}>Wir prüfen Ihre Anfrage und melden uns heute noch.</p>}
                {o.stage === "geplant" && (
                  <div className="border-t border-d-deep/15 px-5 py-4 text-[14.5px]">
                    {o.tech ? (
                      <p>
                        <strong className="num font-bold text-d-deep">
                          {fmtDay(workday(o.day ?? 0))}, {o.slot} Uhr
                        </strong>{" "}
                        · Ihr Monteur: {o.tech}. Er meldet sich 30 Minuten vor Ankunft.
                      </p>
                    ) : (
                      <p>
                        Danke für Ihren Auftrag. Wir teilen gerade einen Monteur ein –{" "}
                        <button type="button" onClick={() => go("betrieb", "plan")} className="min-h-11 font-bold text-d-deep underline decoration-d-accent decoration-[3px] underline-offset-4">
                          im Einsatzplan des Büros ansehen
                        </button>
                        .
                      </p>
                    )}
                  </div>
                )}
                {(o.stage === "erledigt" || o.stage === "rechnung") && (
                  <p className="flex items-center gap-3 border-t border-d-deep/15 px-5 py-4 text-[14.5px]">
                    <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-d-soft text-d-deep">
                      <FileText className="size-4" aria-hidden />
                    </span>
                    <span>
                      Arbeitsbericht mit Fotos und Ihrer Unterschrift{o.doneAt ? ` · ${o.doneAt}` : ""}
                      {o.stage === "rechnung" && " · Rechnung liegt bei"}
                    </span>
                  </p>
                )}
              </article>
            );
          })}
          {orders.length === 0 && <p className="rounded-[16px] border-2 border-dashed border-d-deep/30 px-5 py-10 text-center text-[15px]">Noch kein Auftrag. Stellen Sie eine Anfrage – sie erscheint hier mit ihrem Stand.</p>}
        </div>
      </div>
    </>
  );
}

/* ───────────────────────────── Büro ───────────────────────────── */

function Office({ orders, onPatch, quoteFor, onQuote }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void; quoteFor: string; onQuote: (id: string) => void }) {
  const { tab } = useDemo();
  const titles: Record<string, string> = { auftraege: "Aufträge", angebot: "Angebot schreiben", plan: "Einsatzplan", zahlen: "Auswertung" };
  return (
    <Backoffice
      user="Martina Wilke"
      role="Büro & Disposition"
      title={titles[tab] ?? "Aufträge"}
      nav={[
        { id: "auftraege", label: "Aufträge", icon: Columns3, count: orders.filter((o) => o.stage === "anfrage").length },
        { id: "angebot", label: "Angebot", icon: FileText },
        { id: "plan", label: "Einsatzplan", icon: CalendarDays, count: orders.filter((o) => o.stage === "geplant" && !o.tech).length },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
      ]}
    >
      {tab === "angebot" ? <QuoteBuilder orders={orders} id={quoteFor} onPick={onQuote} onPatch={onPatch} /> : tab === "plan" ? <Schedule orders={orders} onPatch={onPatch} /> : tab === "zahlen" ? <Numbers orders={orders} /> : <Board orders={orders} onPatch={onPatch} onQuote={onQuote} />}
    </Backoffice>
  );
}

function Board({ orders, onPatch, onQuote }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void; onQuote: (id: string) => void }) {
  const { setTab, toast } = useDemo();
  return (
    <div data-tour="kanban" className="overflow-x-auto pb-2">
      <div className="grid min-w-[1080px] grid-cols-[repeat(5,minmax(0,1fr))] gap-3">
        {STAGES.map((st) => {
          const list = orders.filter((o) => o.stage === st.id);
          return (
            <section key={st.id} aria-label={st.title} className="min-w-0 rounded-[var(--bo-r)] border border-bo-line bg-bo-bg p-2">
              <h2 className="flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold text-bo-ink">
                {st.title} <span className="num rounded-[var(--bo-rc)] bg-white px-1.5 text-[12px] font-medium text-bo-muted">{list.length}</span>
              </h2>
              <ul className="space-y-2">
                {list.map((o) => (
                  <li key={o.id} className={cx("rounded-[var(--bo-r)] border border-bo-line bg-white p-3", o.own && "animate-demo-flash")}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-plex-mono text-[12px] text-bo-muted">{o.id}</span>
                      {o.urgent ? <Tag tone="bad">Notfall</Tag> : o.via === "KI-Telefon" ? <Tag tone="info">KI-Telefon</Tag> : o.photos > 0 ? <span className="num inline-flex items-center gap-1 text-[12px] text-bo-muted"><Camera className="size-3" aria-hidden /> {o.photos}</span> : null}
                    </div>
                    <p className="mt-1 text-[13.5px] leading-snug font-semibold text-bo-ink">{o.topic}</p>
                    <p className="text-[12.5px] text-bo-muted">
                      {o.customer}
                      {o.own && " (du)"} · {o.address}
                    </p>
                    {o.via === "KI-Telefon" && (
                      <p className="mt-2 flex gap-2 rounded-[var(--bo-rc)] bg-[#e6eefb] px-2 py-1.5 text-[12px] leading-snug text-[#1d4fa8]">
                        <PhoneCall className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                        <span>{o.desc}</span>
                      </p>
                    )}
                    {st.id === "geplant" && <p className="num mt-2 text-[12.5px] text-bo-ink">{o.tech ? `${o.day === 0 ? "Heute" : fmtDay(workday(o.day ?? 0))}, ${o.slot} · ${o.tech.split(" ")[0]}` : "Noch kein Monteur eingeteilt"}</p>}
                    {(o.value > 0 || o.quote) && st.id !== "anfrage" && <p className="num mt-1 text-[13px] font-medium text-bo-ink">{eur(o.value || gross(o.quote!))}</p>}
                    <div className="mt-2.5">
                      {st.id === "anfrage" && (
                        <Btn size="sm" variant="primary" className="w-full" onClick={() => onQuote(o.id)}>
                          Angebot schreiben
                        </Btn>
                      )}
                      {st.id === "angebot" && (
                        <Btn size="sm" className="w-full" onClick={() => onPatch(o.id, { stage: "geplant", value: o.value || gross(o.quote ?? []) })}>
                          Kunde hat zugesagt
                        </Btn>
                      )}
                      {st.id === "geplant" && !o.tech && (
                        <Btn size="sm" variant="primary" className="w-full" onClick={() => setTab("plan")}>
                          Einplanen
                        </Btn>
                      )}
                      {st.id === "erledigt" && (
                        <Btn
                          size="sm"
                          variant="dark"
                          className="w-full"
                          onClick={() => {
                            onPatch(o.id, { stage: "rechnung" });
                            toast(`Rechnung zu ${o.id} aus dem Arbeitsbericht erstellt und an ${o.customer} gesendet.`);
                          }}
                        >
                          Rechnung erstellen
                        </Btn>
                      )}
                    </div>
                  </li>
                ))}
                {list.length === 0 && <li className="px-2 py-6 text-center text-[13px] text-bo-muted">Nichts in diesem Schritt.</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function QuoteBuilder({ orders, id, onPick, onPatch }: { orders: Order[]; id: string; onPick: (id: string) => void; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { toast, go } = useDemo();
  const open = orders.filter((o) => o.stage === "anfrage");
  const order = open.find((o) => o.id === id) ?? open[0];
  const [pos, setPos] = useState<Pos[]>([
    { id: "anfahrt", qty: 1 },
    { id: "stunde", qty: 1 },
    { id: "entlueften", qty: 1 },
  ]);
  const set = (pid: string, qty: number) => setPos((p) => (qty <= 0 ? p.filter((x) => x.id !== pid) : p.some((x) => x.id === pid) ? p.map((x) => (x.id === pid ? { ...x, qty } : x)) : [...p, { id: pid, qty }]));

  if (!order) {
    return (
      <Panel tour="angebot">
        <p className="py-8 text-center text-bo-muted">Keine offene Anfrage. Stell auf der Kundenseite eine Anfrage – sie erscheint hier zum Kalkulieren.</p>
        <p className="text-center">
          <Btn variant="primary" onClick={() => go("kunde", "anfrage")}>
            Zur Kundenseite
          </Btn>
        </p>
      </Panel>
    );
  }
  return (
    <div data-tour="angebot" className="grid gap-4 @dlg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-4">
        <Panel
          title={`Anfrage ${order.id}`}
          aside={
            <label className="flex items-center gap-2">
              <span className="sr-only">Anfrage wählen</span>
              <select value={order.id} onChange={(e) => onPick(e.target.value)} className="min-h-9 max-w-[11rem] rounded-[var(--bo-rc)] border border-bo-line bg-white px-2 text-[16px] text-bo-ink @dsm:max-w-[16rem] @dsm:text-[13px]">
                {open.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.id} · {o.customer}
                  </option>
                ))}
              </select>
            </label>
          }
        >
          <p className="font-semibold text-bo-ink">{order.topic}</p>
          <p className="text-[13px] text-bo-muted">
            {order.customer} · {order.address} · über {order.via}
          </p>
          <p className="mt-2 text-[13.5px] leading-relaxed">{order.desc}</p>
          {order.photos > 0 && (
            <div className="mt-3 flex gap-2">
              {Array.from({ length: Math.min(order.photos, 3) }, (_, i) => (
                <span key={i} className="relative size-16 overflow-hidden rounded-[var(--bo-rc)] border border-bo-line">
                  <Image src={THUMBS[i % THUMBS.length]} alt={`Foto ${i + 1} vom Kunden`} fill sizes="64px" className="object-cover" />
                </span>
              ))}
            </div>
          )}
        </Panel>
        <Panel flush title="Leistungskatalog" aside="Menge wählen – die Summe rechnet mit">
          <table className="w-full text-[13.5px]">
            <tbody>
              {CATALOG.map((c, i) => {
                const qty = pos.find((p) => p.id === c.id)?.qty ?? 0;
                return (
                  <tr key={c.id} className={cx(i > 0 && tr, qty > 0 && "bg-d-soft/50")}>
                    <td className={td}>
                      <p className={cx("text-bo-ink", qty > 0 && "font-medium")}>{c.name}</p>
                      <p className="num text-[12.5px] text-bo-muted">
                        {eur(c.price)} · {c.unit}
                      </p>
                    </td>
                    <td className={cx(td, "w-px whitespace-nowrap")}>
                      <span className="flex items-center justify-end gap-1">
                        <Btn size="sm" disabled={qty === 0} onClick={() => set(c.id, qty - 1)} aria-label={`${c.name} weniger`}>
                          <Minus className="size-3.5" aria-hidden />
                        </Btn>
                        <span className="num w-7 text-center font-medium text-bo-ink">{qty}</span>
                        <Btn size="sm" onClick={() => set(c.id, qty + 1)} aria-label={`${c.name} mehr`}>
                          <Plus className="size-3.5" aria-hidden />
                        </Btn>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      </div>
      <div className="min-w-0">
        <div className="sticky top-[calc(var(--bar-h)+1rem)] rounded-[var(--bo-r)] border border-bo-line bg-white">
          <div className="border-b border-bo-line px-4 py-3">
            <p className="text-[12px] text-bo-muted">Angebot an</p>
            <p className="font-semibold text-bo-ink">{order.customer}</p>
          </div>
          <div className="px-4 py-3">{pos.length ? <QuoteTable quote={pos} /> : <p className="py-4 text-center text-[13px] text-bo-muted">Noch keine Position gewählt.</p>}</div>
          <div className="border-t border-bo-line bg-bo-bg/60 px-4 py-3">
            <Btn
              variant="primary"
              className="w-full"
              disabled={!pos.length}
              onClick={() => {
                onPatch(order.id, { stage: "angebot", quote: pos, value: gross(pos) });
                toast(order.own ? "Angebot gesendet. Auf der Kundenseite unter „Meine Aufträge“ kannst du es jetzt annehmen." : `Angebot über ${eur(gross(pos))} an ${order.customer} gesendet.`);
              }}
            >
              Angebot an Kunden senden
            </Btn>
            <p className="mt-2 text-center text-[12px] text-bo-muted">Der Kunde nimmt online an – ohne Ausdrucken und Unterschreiben.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Schedule({ orders, onPatch }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { toast } = useDemo();
  const waiting = orders.filter((o) => o.stage === "geplant" && !o.tech);
  const [pick, setPick] = useState<Record<string, { tech: string; day: number }>>({});
  const days = [0, 1, 2, 3, 4];
  return (
    <div className="space-y-4" data-tour="plan">
      {waiting.length > 0 && (
        <Panel flush title="Noch einzuplanen" aside={`${waiting.length} zugesagte Aufträge ohne Termin`}>
          <ul>
            {waiting.map((o, i) => {
              const p = pick[o.id] ?? { tech: TECHS[0], day: 1 };
              return (
                <li key={o.id} className={cx("flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3", i > 0 && "border-t border-bo-line", (o.own || o.mine) && "bg-d-soft/60")}>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-bo-ink">
                      <span className="mr-2 font-plex-mono text-[12px] font-normal text-bo-muted">{o.id}</span>
                      {o.topic}
                    </p>
                    <p className="text-[12.5px] text-bo-muted">
                      {o.customer} · {o.address} · Wunsch: {o.slot ?? "nach Absprache"}
                    </p>
                  </div>
                  <label>
                    <span className="sr-only">Monteur</span>
                    <select value={p.tech} onChange={(e) => setPick((s) => ({ ...s, [o.id]: { ...p, tech: e.target.value } }))} className="min-h-9 rounded-[var(--bo-rc)] border border-bo-line bg-white px-2 text-[16px] text-bo-ink @dsm:text-[13px]">
                      {TECHS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Tag</span>
                    <select value={p.day} onChange={(e) => setPick((s) => ({ ...s, [o.id]: { ...p, day: Number(e.target.value) } }))} className="min-h-9 rounded-[var(--bo-rc)] border border-bo-line bg-white px-2 text-[16px] text-bo-ink @dsm:text-[13px]">
                      {days.map((d) => (
                        <option key={d} value={d}>
                          {d === 0 ? "Heute" : fmtDay(workday(d))}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Btn
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      onPatch(o.id, { tech: p.tech, day: p.day, slot: "15:30 – 17:00" });
                      toast(`${o.id} eingeplant: ${p.tech}, ${p.day === 0 ? "heute" : fmtDay(workday(p.day))}. Kunde und Monteur sind benachrichtigt.`);
                    }}
                  >
                    Einplanen
                  </Btn>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
      <Panel flush title="Diese Woche" aside="Montage und Kundendienst">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] table-fixed text-[12.5px]">
            <thead>
              <tr>
                <th className={cx(th, "w-36")}>Monteur</th>
                {days.map((d) => (
                  <th key={d} className={cx(th, "border-l border-bo-line")}>
                    {d === 0 ? "Heute" : weekdayShort(workday(d))} · <span className="num">{workday(d).getDate()}.</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TECHS.map((t) => (
                <tr key={t} className={tr}>
                  <td className={cx(td, "align-top")}>
                    <span className="flex items-center gap-2 text-[13px] font-medium text-bo-ink">
                      <Avatar name={t} size="sm" /> {t.split(" ")[0]}
                    </span>
                  </td>
                  {days.map((d) => {
                    const jobs = [
                      ...orders.filter((o) => o.tech === t && o.day === d && (o.stage === "geplant" || o.stage === "erledigt")).map((o) => ({ key: o.id, slot: o.slot ?? "", label: `${o.topic} · ${o.customer}`, live: o.own || o.mine, done: o.stage === "erledigt" })),
                      ...PLAN_EXTRA.filter((x) => x.tech === t && x.day === d).map((x) => ({ key: x.slot + x.label, slot: x.slot, label: x.label, live: false, done: false })),
                    ].sort((a, b) => a.slot.localeCompare(b.slot));
                    return (
                      <td key={d} className="border-l border-bo-line p-1.5 align-top">
                        <ul className="space-y-1">
                          {jobs.map((j) => (
                            <li key={j.key} className={cx("rounded-[var(--bo-rc)] border-l-[3px] px-2 py-1 leading-tight", j.live ? "animate-demo-flash border-l-d-accent bg-d-soft" : j.done ? "border-l-bo-ok bg-[#e3f3ea]" : "border-l-bo-muted bg-bo-bg")}>
                              <span className="num block text-[11px] text-bo-muted">
                                {j.slot}
                                {j.done && " · erledigt"}
                              </span>
                              <span className="block text-bo-ink">{j.label}</span>
                            </li>
                          ))}
                          {jobs.length === 0 && <li className="px-2 py-3 text-center text-bo-muted">frei</li>}
                        </ul>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

function Numbers({ orders }: { orders: Order[] }) {
  const offers = orders.filter((o) => o.stage === "angebot");
  return (
    <div className="space-y-4">
      <Figures
        items={[
          { label: "Umsatz im laufenden Monat", value: eur0(48620 + orders.filter((o) => o.stage === "rechnung").reduce((s, o) => s + o.value, 0)), note: "Ziel: 62.000 €" },
          { label: "Offene Angebote", value: eur0(12480 + offers.reduce((s, o) => s + (o.value || gross(o.quote ?? [])), 0)), note: `${7 + offers.length} Angebote` },
          { label: "Angebote angenommen", value: "64 %", note: "online im Schnitt nach 5 Std." },
          { label: "Zeit bis zum Angebot", value: "2,4 Std.", note: "vorher: 2 Tage" },
        ]}
      />
      <div className="grid gap-4 @dlg:grid-cols-2">
        <Panel title="Abgeschlossene Aufträge je Woche" aside="letzte acht Wochen">
          <Bars label="Abgeschlossene Aufträge je Woche" data={[21, 24, 19, 27, 26, 31, 29, 34].map((v, i) => ({ label: `KW ${i + 34}`, value: v }))} mark={7} />
        </Panel>
        <Panel title="Woher Anfragen kommen" aside="letzte 30 Tage">
          <Ranks
            data={[
              { label: "Anfrage-Assistent auf der Website", value: 58 },
              { label: "KI-Telefonassistent, außerhalb der Bürozeit", value: 31 },
              { label: "Telefon im Büro", value: 24 },
              { label: "Wartungsverträge, automatisch", value: 17 },
            ]}
          />
          <p className="mt-3 text-[12.5px] text-bo-muted">31 Anrufe wären ohne Assistenten auf dem Anrufbeantworter gelandet.</p>
        </Panel>
      </div>
      <Panel flush title="Offene Posten">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13.5px]">
            <thead>
              <tr>
                <th className={th}>Rechnung</th>
                <th className={th}>Kunde</th>
                <th className={th}>Fällig</th>
                <th className={cx(th, "text-right")}>Betrag</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["R-2025-0411", "Hausverwaltung Kranich", "in 9 Tagen", 1840.5, "neutral"],
                ["R-2025-0406", "Zahnarztpraxis Dr. Behrens", "in 2 Tagen", 298, "warn"],
                ["R-2025-0398", "Bäckerei Reinhold", "seit 6 Tagen überfällig", 612.8, "bad"],
              ].map(([no, who, due, sum, tone]) => (
                <tr key={no as string} className={tr}>
                  <td className={cx(td, "font-plex-mono text-bo-ink")}>{no}</td>
                  <td className={td}>{who}</td>
                  <td className={td}>
                    <Tag tone={tone as "neutral" | "warn" | "bad"}>{due}</Tag>
                  </td>
                  <td className={cx(td, "num text-right text-bo-ink")}>{eur(sum as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}

/* ───────────────────────────── Monteur-App ───────────────────────────── */

const CHECKS = ["Anlage auf Dichtheit geprüft", "Brenner gereinigt, Abgaswerte gemessen", "Druck und Ausdehnungsgefäß geprüft", "Kunde eingewiesen"];
const MATERIAL = [
  { id: "dichtung", name: "Dichtungssatz" },
  { id: "elektrode", name: "Zündelektrode" },
  { id: "ventil", name: "Thermostatventil" },
];

/**
 * Die App des Monteurs. In breiten Rahmen steht sie als Telefon neben einer kurzen Anleitung;
 * in schmalen Rahmen (echtes Handy oder Handy-Ansicht der Demo-Leiste) füllt sie die Fläche – ohne Telefon im Telefon.
 */
function TechApp({ orders, onPatch, onOffice }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void; onOffice: () => void }) {
  const me = TECHS[0];
  const jobs = orders.filter((o) => o.tech === me && o.day === 0 && (o.stage === "geplant" || o.stage === "erledigt")).sort((a, b) => (a.slot ?? "").localeCompare(b.slot ?? ""));
  const [openId, setOpenId] = useState<string | null>(null);
  const open = jobs.find((j) => j.id === openId);
  return (
    <div className="min-h-[var(--app-h)] bg-bo-bg font-plex @dmd:px-6 @dmd:py-10">
      <div className="mx-auto grid max-w-4xl items-start gap-10 @dmd:grid-cols-[minmax(0,24rem)_1fr]">
        <div data-tour="monteur" className="w-full min-w-0 bg-bo-bg @dmd:mx-auto @dmd:max-w-[24rem] @dmd:overflow-hidden @dmd:rounded-[2.25rem] @dmd:border-[10px] @dmd:border-bo-ink @dmd:shadow-[0_30px_60px_-24px_rgb(21_43_59/0.6)]">
          <div className="hidden items-center justify-between bg-bo-ink px-5 pt-1 pb-2 text-[11px] font-semibold text-white/85 @dmd:flex">
            <span className="num">{clock()}</span>
            <span>Wilke · Monteur</span>
          </div>
          <div className="no-bar text-[15px] text-bo-ink @dmd:h-[38rem] @dmd:overflow-y-auto">{open ? <JobDetail key={open.id} job={open} onBack={() => setOpenId(null)} onPatch={onPatch} /> : <JobList me={me} jobs={jobs} onOpen={setOpenId} />}</div>
        </div>
        <div className="hidden pt-4 text-bo-ink @dmd:block">
          <p className={cx(B.label, B.muted)}>Ansicht 3 von 3</p>
          <h1 className={cx(H, "mt-3 text-[clamp(2.25rem,5cqi,3.25rem)] leading-[0.9] text-bo-ink")}>
            Die App
            <br />
            für draußen.
          </h1>
          <p className={cx("mt-4 max-w-sm text-[15.5px] leading-relaxed", B.muted)}>Deniz sieht morgens seine Einsätze, hakt vor Ort die Checkliste ab, erfasst das Material und lässt den Kunden auf dem Display unterschreiben.</p>
          <ol className="mt-6 max-w-sm space-y-2">
            {["Öffne einen Einsatz", "Hak die Checkliste ab", "Unterschreib mit Maus oder Finger", "Schließ den Auftrag ab – im Büro steht er sofort auf „Erledigt“"].map((s, i) => (
              <li key={s} className="flex items-center gap-3 rounded-[12px] bg-white px-3 py-2.5 text-[14.5px] leading-snug font-medium">
                <span className={cx(H, "num grid size-8 shrink-0 place-items-center rounded-[8px] bg-d-accent text-[1.125rem] leading-none text-d-on")}>{i + 1}</span> {s}
              </li>
            ))}
          </ol>
          <button type="button" onClick={onOffice} className={cx(B.no, "mt-6")}>
            Zum Büro wechseln
          </button>
        </div>
      </div>
    </div>
  );
}

function JobList({ me, jobs, onOpen }: { me: string; jobs: Order[]; onOpen: (id: string) => void }) {
  const left = jobs.filter((j) => j.stage === "geplant").length;
  return (
    <div>
      <div className="on-dark bg-bo-ink px-5 pt-5 pb-6 text-white">
        <p className={cx("num", B.label, "text-d-accent")}>{fmtDay(workday(0))}</p>
        <h2 className={cx(H, "mt-2 text-[2.5rem] leading-[0.9] text-white")}>Moin {me.split(" ")[0]}.</h2>
        <p className="mt-2 text-[14.5px] text-white/80">{left ? `${left} ${left === 1 ? "Einsatz" : "Einsätze"} offen` : "Alles erledigt für heute."}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/20" role="img" aria-label={`${jobs.length - left} von ${jobs.length} Einsätzen erledigt`}>
          <div className="h-full rounded-full bg-d-accent transition-[width] duration-500" style={{ width: `${jobs.length ? ((jobs.length - left) / jobs.length) * 100 : 0}%` }} />
        </div>
      </div>
      <ul className="space-y-3 p-4">
        {jobs.map((j) => {
          const done = j.stage === "erledigt";
          return (
            <li key={j.id}>
              <button type="button" disabled={done} onClick={() => onOpen(j.id)} className={cx("block w-full rounded-[14px] border-2 bg-white p-4 text-left transition-colors", done ? "border-bo-line" : "border-bo-ink/15 hover:border-bo-ink")}>
                <span className="flex items-center justify-between gap-2">
                  <span className={cx("num rounded-full px-2.5 py-1 text-[12.5px] leading-none font-bold", done ? "bg-bo-bg text-bo-muted" : "bg-d-accent text-d-on")}>{j.slot}</span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-[12.5px] font-bold text-bo-ok">
                      <Check className="size-4" strokeWidth={3} aria-hidden /> erledigt
                    </span>
                  ) : (
                    <ChevronRight className="size-5 text-bo-ink" aria-hidden />
                  )}
                </span>
                <span className={cx("mt-2.5 block text-[16px] leading-snug font-bold break-words", done ? "text-bo-muted" : "text-bo-ink")}>{j.topic}</span>
                <span className="mt-1 flex items-start gap-1.5 text-[13px] text-bo-muted">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden />
                  <span className="min-w-0 break-words">
                    {j.customer} · {j.address}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {jobs.length === 0 && <li className="rounded-[14px] border-2 border-dashed border-bo-line px-4 py-8 text-center text-[14px] text-bo-muted">Heute sind keine Einsätze geplant.</li>}
      </ul>
    </div>
  );
}

function JobDetail({ job, onBack, onPatch }: { job: Order; onBack: () => void; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { toast } = useDemo();
  const [checks, setChecks] = useState<number[]>([]);
  const [mat, setMat] = useState<Record<string, number>>({ dichtung: 1 });
  const [photos, setPhotos] = useState(0);
  const [signed, setSigned] = useState(false);
  const ready = checks.length === CHECKS.length && signed;
  const head = "mb-2 flex items-baseline justify-between text-[11.5px] font-bold tracking-[0.14em] text-bo-muted uppercase";
  const box = "overflow-hidden rounded-[14px] border-2 border-bo-ink/12 bg-white";
  return (
    <div>
      <div className="on-dark sticky top-[var(--bar-h)] z-10 flex items-center gap-1 bg-bo-ink px-2 py-1.5 text-white @dmd:top-0">
        <button type="button" onClick={onBack} aria-label="Zurück zur Liste" className="grid size-11 shrink-0 place-items-center rounded-[10px] hover:bg-white/10">
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[15px] leading-tight font-bold">{job.topic}</p>
          <p className="num mt-0.5 font-plex-mono text-[11.5px] text-d-accent">
            {job.id} · {job.slot}
          </p>
        </div>
      </div>
      <div className="space-y-5 p-4">
        <section className={box}>
          {/* Lageskizze */}
          <svg viewBox="0 0 320 96" className="block w-full bg-[#dfecf3]" role="img" aria-label={`Lageskizze: ${job.address}`}>
            <path d="M0 62h320M96 0v96M228 0v96M0 22h96M228 34h92" stroke="#fff" strokeWidth="10" strokeLinecap="square" />
            <path d="M118 8h88v22h-88zM118 40h40v14h-40zM166 40h40v14h-40zM118 72h88v20h-88zM8 32h76v22H8zM240 44h72v10h-72zM240 72h72v20h-72zM8 72h76v20H8z" fill="#c3d6e1" />
            <path d="M40 0c8 30 20 40 56 62" stroke="#9cc3dc" strokeWidth="7" fill="none" />
            <path d="M0 62h186" stroke="#152b3b" strokeWidth="2.5" strokeDasharray="5 5" fill="none" />
            <g transform="translate(186 47)">
              <path d="M0 15c-8-9-11-13-11-18.500a11 11 0 0 1 22 0c0 5.500-3 9.500-11 18.500Z" fill="#152b3b" />
              <circle cy="-3.500" r="4.200" fill="#f4c042" />
            </g>
          </svg>
          <div className="p-4">
            <p className="text-[16px] font-bold break-words text-bo-ink">{job.customer}</p>
            <p className="text-[14px] break-words text-bo-muted">{job.address}, Musterstadt</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => toast("Navigation würde jetzt in der Karten-App starten.")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] bg-bo-ink text-[14px] font-bold text-white">
                <MapPin className="size-4" aria-hidden /> Route
              </button>
              <button type="button" onClick={() => toast("Anruf beim Kunden würde jetzt starten.")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] border-2 border-bo-ink text-[14px] font-bold text-bo-ink">
                <Phone className="size-4" aria-hidden /> Anrufen
              </button>
            </div>
            {job.desc && <p className="mt-4 border-t border-bo-line pt-3 text-[14px] leading-relaxed break-words">{job.desc}</p>}
          </div>
        </section>

        <section>
          <h3 className={head}>
            Checkliste{" "}
            <span className="num">
              {checks.length}/{CHECKS.length}
            </span>
          </h3>
          <ul className={cx(box, "divide-y divide-bo-line")}>
            {CHECKS.map((c, i) => {
              const on = checks.includes(i);
              return (
                <li key={c}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => setChecks((x) => (on ? x.filter((y) => y !== i) : [...x, i]))} className="flex min-h-14 w-full items-center gap-3 px-4 py-2 text-left">
                    <span className={cx("grid size-7 shrink-0 place-items-center rounded-[8px] border-2", on ? "border-bo-ink bg-bo-ink text-d-accent" : "border-bo-ink/35")}>{on && <Check className="size-4" strokeWidth={3.5} aria-hidden />}</span>
                    <span className={cx("leading-snug font-medium", on && "text-bo-muted line-through")}>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className={head}>Material</h3>
          <ul className={cx(box, "divide-y divide-bo-line")}>
            {MATERIAL.map((m) => {
              const q = mat[m.id] ?? 0;
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2 pr-2 pl-4">
                  <span className="font-medium">{m.name}</span>
                  <span className="flex items-center gap-1">
                    <button type="button" disabled={q === 0} onClick={() => setMat((s) => ({ ...s, [m.id]: Math.max(0, q - 1) }))} aria-label={`${m.name} weniger`} className="grid size-11 place-items-center rounded-[10px] bg-bo-bg disabled:opacity-40">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="num w-7 text-center text-[16px] font-bold text-bo-ink" aria-live="polite">
                      {q}
                    </span>
                    <button type="button" onClick={() => setMat((s) => ({ ...s, [m.id]: Math.min(99, q + 1) }))} aria-label={`${m.name} mehr`} className="grid size-11 place-items-center rounded-[10px] bg-bo-bg">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className={head}>
            Fotos <span className="num">{photos}/4</span>
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {Array.from({ length: photos }, (_, i) => (
              <span key={i} className="relative size-[4.5rem] overflow-hidden rounded-[12px] border-2 border-bo-ink">
                <Image src={THUMBS[i % THUMBS.length]} alt={`Foto ${i + 1}`} fill sizes="72px" className="object-cover" />
              </span>
            ))}
            {photos < 4 && (
              <button type="button" onClick={() => setPhotos((p) => Math.min(4, p + 1))} className="grid size-[4.5rem] place-items-center rounded-[12px] border-2 border-dashed border-bo-ink/40 bg-white" aria-label="Foto aufnehmen">
                <Camera className="size-6 text-bo-ink" strokeWidth={1.7} aria-hidden />
              </button>
            )}
          </div>
        </section>

        <section>
          <h3 className={head}>Unterschrift des Kunden</h3>
          <SignaturePad onChange={setSigned} />
        </section>

        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            onPatch(job.id, { stage: "erledigt", doneAt: `heute, ${clock()}` });
            toast(`${job.id} abgeschlossen. Im Büro steht der Auftrag jetzt auf „Erledigt“ – bereit für die Rechnung.`);
            onBack();
          }}
          className={cx("min-h-14 w-full rounded-[12px] text-[15px] font-bold tracking-[0.04em] uppercase", ready ? "bg-d-accent text-d-on shadow-[0_3px_0_#c9982a]" : "bg-[#d3dde4] text-[#4d606d]")}
        >
          {ready ? "Auftrag abschließen" : !signed && checks.length === CHECKS.length ? "Unterschrift fehlt noch" : "Erst Checkliste und Unterschrift"}
        </button>
      </div>
    </div>
  );
}

/** Unterschriftsfeld: zeichnet mit Maus, Stift oder Finger */
function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [has, setHas] = useState(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ratio = window.devicePixelRatio || 1;
    c.width = c.offsetWidth * ratio;
    c.height = c.offsetHeight * ratio;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2.2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#152b3b";
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  return (
    <div className="overflow-hidden rounded-[14px] border-2 border-bo-ink/12 bg-white">
      <canvas
        ref={ref}
        role="img"
        aria-label={has ? "Unterschrift vorhanden" : "Unterschriftsfeld, noch leer"}
        className="block h-36 w-full touch-none cursor-crosshair bg-[linear-gradient(to_bottom,transparent_calc(100%-2.25rem),#d6e0e7_calc(100%-2.25rem),#d6e0e7_calc(100%-2.25rem+1px),transparent_calc(100%-2.25rem+1px))]"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          const ctx = e.currentTarget.getContext("2d")!;
          const [x, y] = point(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext("2d")!;
          const [x, y] = point(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (!has) {
            setHas(true);
            onChange(true);
          }
        }}
        onPointerUp={() => (drawing.current = false)}
        onPointerCancel={() => (drawing.current = false)}
      />
      <div className="flex items-center justify-between border-t border-dashed border-bo-line px-3 py-1 text-[12px] text-bo-muted">
        <span>{has ? "Danke – Unterschrift erfasst" : "Hier mit Maus oder Finger unterschreiben"}</span>
        <button
          type="button"
          onClick={() => {
            const c = ref.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            setHas(false);
            onChange(false);
          }}
          className="min-h-11 px-2 font-semibold text-bo-ink underline underline-offset-4"
        >
          Löschen
        </button>
      </div>
      {!has && (
        <button
          type="button"
          onClick={() => {
            // Für Tastaturnutzer: Unterschrift als geschwungene Linie einsetzen
            const c = ref.current!;
            const ctx = c.getContext("2d")!;
            const w = c.offsetWidth;
            ctx.beginPath();
            ctx.moveTo(w * 0.15, 80);
            ctx.bezierCurveTo(w * 0.25, 20, w * 0.3, 110, w * 0.42, 62);
            ctx.bezierCurveTo(w * 0.5, 30, w * 0.55, 100, w * 0.66, 58);
            ctx.bezierCurveTo(w * 0.72, 40, w * 0.8, 84, w * 0.88, 52);
            ctx.stroke();
            setHas(true);
            onChange(true);
          }}
          className="sr-only focus:not-sr-only focus:m-2 focus:inline-block focus:underline"
        >
          Beispiel-Unterschrift einsetzen
        </button>
      )}
    </div>
  );
}
