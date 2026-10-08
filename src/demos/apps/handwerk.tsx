"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, CalendarDays, Camera, ChartColumn, Check, ChevronRight, Columns3, Droplets, FileText, Flame, MapPin, Minus, Phone, PhoneCall, Plus, ThermometerSun, TriangleAlert, Wind, Wrench } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Avatar, Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Tag, td, th, tr, Track } from "@/demos/kit/ui";
import { clock, cx, eur, eur0, fmtDay, weekdayShort, workday } from "@/demos/kit/util";

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

const H = "font-d-display font-black tracking-tight uppercase [font-stretch:92%]";

/* ───────────────────────────── Kundenseite ───────────────────────────── */

function CustomerSite({ orders, onAdd, onPatch }: { orders: Order[]; onAdd: (o: Omit<Order, "id" | "stage" | "value" | "via" | "own">) => string; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { tab, setTab } = useDemo();
  const mine = orders.filter((o) => o.mine || o.own);
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-[#f4f4f2] font-plex text-[15px] text-[#33363a]">
      <header className="bg-d-deep text-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 sm:px-6">
          <p className="flex items-center gap-2.5 py-3">
            <span className="grid size-8 place-items-center bg-d-accent font-d-display text-[18px] font-black text-d-on">W</span>
            <span className="leading-none">
              <span className={cx(H, "block text-[1.05rem]")}>Wilke Haustechnik</span>
              <span className="mt-0.5 block text-[11px] text-[#a9adb3]">Sanitär · Heizung · Klima</span>
            </span>
          </p>
          <nav aria-label="Kundenbereich" className="flex gap-1">
            {[
              { id: "anfrage", label: "Anfrage stellen" },
              { id: "status", label: `Meine Aufträge (${mine.length})` },
            ].map((n) => (
              <button key={n.id} type="button" aria-current={tab === n.id ? "page" : undefined} onClick={() => setTab(n.id)} className={cx("min-h-12 border-b-[3px] px-3 text-[14px] font-medium", tab === n.id ? "border-d-accent text-white" : "border-transparent text-[#a9adb3] hover:text-white")}>
                {n.label}
              </button>
            ))}
          </nav>
        </div>
      </header>
      {tab === "status" ? <MyOrders orders={mine} onPatch={onPatch} /> : <Request onAdd={onAdd} onStatus={() => setTab("status")} />}
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
const THUMBS = ["/images/sectors/handwerk-0.webp", "/images/sectors/handwerk-5.webp", "/images/sectors/handwerk-0.webp"];

function Request({ onAdd, onStatus }: { onAdd: (o: Omit<Order, "id" | "stage" | "value" | "via" | "own">) => string; onStatus: () => void }) {
  const { go } = useDemo();
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
  const t = TOPICS.find((x) => x.id === topic);
  const valid = name.trim().length > 1 && street.trim().length > 3 && phone.trim().length > 5;

  if (done) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <span className="grid size-12 place-items-center bg-d-accent text-d-on">
          <Check className="size-6" strokeWidth={3} aria-hidden />
        </span>
        <h1 className={cx(H, "mt-5 text-[2.1rem] leading-none text-[#131416]")}>Anfrage ist da.</h1>
        <p className="mt-3 text-[16px] leading-relaxed">
          Vorgang <span className="font-plex-mono font-medium text-[#131416]">{done}</span>. Wir melden uns heute noch mit einem Angebot oder einem Terminvorschlag.
        </p>
        <div className="mt-6 border-l-4 border-d-accent bg-white p-4 text-[14px] leading-snug">
          <strong className="font-semibold">So sieht es das Büro:</strong> Ihre Anfrage steht mit Beschreibung und Fotos in der Auftragsübersicht. Schreiben Sie dort das Angebot – hier unter „Meine Aufträge“ können Sie es danach annehmen.
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => go("betrieb", "auftraege")} className="min-h-11 bg-d-deep px-4 font-medium text-white">
              Im Büro ansehen
            </button>
            <button type="button" onClick={onStatus} className="min-h-11 border border-[#c9cbcf] bg-white px-4 font-medium">
              Meine Aufträge
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden bg-d-deep">
        <Image src="/images/sectors/handwerk-5.webp" alt="Monteur prüft einen Heizkreisverteiler" fill priority sizes="100vw" className="object-cover object-[center_30%] opacity-45" />
        <div className="relative mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-11">
          <h1 className={cx(H, "max-w-lg text-[clamp(2.1rem,6vw,3.6rem)] leading-[0.92] text-white")}>
            Heizung kalt? <span className="text-d-accent">Wir kommen.</span>
          </h1>
          <p className="mt-3 max-w-md text-[15px] leading-relaxed text-[#d9dbde]">Anliegen in drei Schritten schildern, Fotos anhängen, fertig. Sie bekommen heute noch ein Angebot oder einen Termin.</p>
          <p className="num mt-4 inline-flex items-center gap-2 bg-d-accent px-3 py-1.5 text-[14px] font-semibold text-d-on">
            <Phone className="size-4" aria-hidden /> Notdienst rund um die Uhr: 01234 110 220
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6" data-tour="anfrage">
        <ol className="flex gap-2 text-[13px] font-medium" aria-label="Fortschritt">
          {["Anliegen", "Beschreibung & Fotos", "Adresse & Termin"].map((s, i) => (
            <li key={s} aria-current={step === i ? "step" : undefined} className={cx("flex-1 border-t-4 pt-2", i <= step ? "border-d-accent text-[#131416]" : "border-[#d9dbde] text-[#8b8f96]")}>
              <span className="num">{i + 1}.</span> {s}
            </li>
          ))}
        </ol>

        {step === 0 && (
          <div className="mt-6">
            <h2 className={cx(H, "text-[1.4rem] text-[#131416]")}>Worum geht es?</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {TOPICS.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={topic === x.id}
                  onClick={() => {
                    setTopic(x.id);
                    setStep(1);
                  }}
                  className={cx("flex min-h-16 items-center gap-3 border bg-white px-4 text-left transition-colors hover:border-[#131416]", topic === x.id ? "border-[#131416]" : "border-[#d9dbde]")}
                >
                  <x.icon className={cx("size-6 shrink-0", x.urgent ? "text-bo-bad" : "text-[#131416]")} strokeWidth={1.6} aria-hidden />
                  <span className="flex-1 font-semibold text-[#131416]">{x.label}</span>
                  {x.urgent ? <span className="bg-bo-bad px-1.5 py-0.5 text-[11px] font-semibold text-white uppercase">Notfall</span> : <ChevronRight className="size-4 text-[#8b8f96]" aria-hidden />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="mt-6">
            <h2 className={cx(H, "text-[1.4rem] text-[#131416]")}>{t?.label}</h2>
            {t?.urgent && (
              <p role="alert" className="num mt-3 border-l-4 border-bo-bad bg-[#fbe7e5] px-4 py-3 text-[14px] font-medium text-bo-bad">
                Bei Gefahr bitte sofort anrufen: 01234 110 220. {t.id === "gas" && "Fenster öffnen, kein Licht schalten, Haus verlassen."}
              </p>
            )}
            <Field label="Was genau ist los?" hint="Seit wann, welche Räume, was haben Sie schon versucht?" className="mt-4">
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={4} className={cx(input, "py-2.5")} placeholder="Zum Beispiel: Seit gestern Abend bleiben die Heizkörper im Obergeschoss kalt …" />
            </Field>
            <p className="mt-4 mb-1 text-[12.5px] font-medium opacity-80">Fotos helfen uns, das richtige Material mitzubringen</p>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: photos }, (_, i) => (
                <span key={i} className="relative size-20 overflow-hidden border border-[#d9dbde]">
                  <Image src={THUMBS[i % THUMBS.length]} alt={`Foto ${i + 1}`} fill sizes="80px" className="object-cover" />
                </span>
              ))}
              {photos < 3 && (
                <button type="button" onClick={() => setPhotos((p) => p + 1)} className="grid size-20 place-items-center border-2 border-dashed border-[#b9bcc1] bg-white text-[#5b5f66] hover:border-[#131416]">
                  <span className="text-center text-[11.5px] leading-tight font-medium">
                    <Camera className="mx-auto mb-1 size-5" strokeWidth={1.6} aria-hidden /> Foto
                  </span>
                </button>
              )}
            </div>
            <div className="mt-6 flex justify-between gap-2">
              <button type="button" onClick={() => setStep(0)} className="min-h-12 border border-[#c9cbcf] bg-white px-4 font-medium">
                Zurück
              </button>
              <button type="button" onClick={() => setStep(2)} className="min-h-12 bg-d-accent px-6 font-semibold text-d-on hover:brightness-95">
                Weiter
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <form
            noValidate
            className="mt-6"
            onSubmit={(e) => {
              e.preventDefault();
              setTried(true);
              if (!valid) return;
              setDone(onAdd({ customer: name.trim(), address: street.trim(), topic: t?.label ?? "Anfrage", desc: desc.trim() || "Keine Beschreibung angegeben.", photos, urgent: t?.urgent, slot: when }));
            }}
          >
            <h2 className={cx(H, "text-[1.4rem] text-[#131416]")}>Wo und wann?</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={input} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Telefon">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" className={input} placeholder="0151 2345678" />
              </Field>
              <Field label="Straße und Hausnummer" className="sm:col-span-2">
                <input value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="street-address" className={input} placeholder="Gartenweg 12, Musterstadt" />
              </Field>
            </div>
            <fieldset className="mt-4">
              <legend className="mb-1.5 text-[12.5px] font-medium opacity-80">Wann passt es Ihnen am besten?</legend>
              <div className="flex flex-wrap gap-1.5">
                {["vormittags", "nachmittags", "ganztags", "so schnell wie möglich"].map((w) => (
                  <button key={w} type="button" aria-pressed={when === w} onClick={() => setWhen(w)} className={cx("min-h-11 border px-3.5 text-[14px] font-medium", when === w ? "border-[#131416] bg-[#131416] text-white" : "border-[#c9cbcf] bg-white")}>
                    {w}
                  </button>
                ))}
              </div>
            </fieldset>
            {tried && !valid && (
              <p role="alert" className="mt-3 text-[13px] text-bo-bad">
                Bitte Name, Telefon und Adresse eintragen – erfundene Angaben genügen.
              </p>
            )}
            <div className="mt-6 flex justify-between gap-2">
              <button type="button" onClick={() => setStep(1)} className="min-h-12 border border-[#c9cbcf] bg-white px-4 font-medium">
                Zurück
              </button>
              <button type="submit" className="min-h-12 bg-d-accent px-6 font-semibold text-d-on hover:brightness-95">
                Anfrage senden
              </button>
            </div>
            <p className="mt-2 text-right text-[12px] text-[#6c7077]">Demo: Es wird nichts gesendet oder gespeichert.</p>
          </form>
        )}
      </div>
    </>
  );
}

function QuoteTable({ quote, dark }: { quote: Pos[]; dark?: boolean }) {
  const line = dark ? "border-white/15" : "border-[#e2e3e5]";
  return (
    <table className="num w-full text-[13.5px]">
      <thead>
        <tr className={cx("text-left text-[11.5px] tracking-wide uppercase", dark ? "text-white/60" : "text-[#6c7077]")}>
          <th className="py-1.5 font-medium">Leistung</th>
          <th className="py-1.5 text-right font-medium">Menge</th>
          <th className="py-1.5 text-right font-medium">Betrag</th>
        </tr>
      </thead>
      <tbody>
        {quote.map((p) => {
          const c = CATALOG.find((x) => x.id === p.id)!;
          return (
            <tr key={p.id} className={cx("border-t", line)}>
              <td className="py-2">{c.name}</td>
              <td className="py-2 text-right whitespace-nowrap">
                {p.qty} {c.unit === "pauschal" ? "" : c.unit}
              </td>
              <td className="py-2 text-right">{eur(c.price * p.qty)}</td>
            </tr>
          );
        })}
      </tbody>
      <tfoot>
        <tr className={cx("border-t", line)}>
          <td colSpan={2} className="pt-2 text-right opacity-70">
            Netto
          </td>
          <td className="pt-2 text-right">{eur(net(quote))}</td>
        </tr>
        <tr>
          <td colSpan={2} className="text-right opacity-70">
            19 % MwSt.
          </td>
          <td className="text-right">{eur(net(quote) * 0.19)}</td>
        </tr>
        <tr className="text-[16px] font-semibold">
          <td colSpan={2} className="pt-1 text-right">
            Festpreis
          </td>
          <td className="pt-1 text-right">{eur(gross(quote))}</td>
        </tr>
      </tfoot>
    </table>
  );
}

function MyOrders({ orders, onPatch }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void }) {
  const { go, toast } = useDemo();
  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6" data-tour="status">
      <h1 className={cx(H, "text-[1.8rem] leading-none text-[#131416]")}>Meine Aufträge</h1>
      {orders.map((o) => {
        const idx = STAGES.findIndex((s) => s.id === o.stage);
        const waiting = o.stage === "angebot" && o.quote;
        return (
          <article key={o.id} className="border border-[#d9dbde] bg-white">
            <header className="flex flex-wrap items-start justify-between gap-3 border-b border-[#e2e3e5] px-5 py-4">
              <div>
                <p className="font-plex-mono text-[12.5px] text-[#6c7077]">{o.id}</p>
                <h2 className="text-[17px] font-semibold text-[#131416]">{o.topic}</h2>
                <p className="flex items-center gap-1.5 text-[13px] text-[#6c7077]">
                  <MapPin className="size-3.5" aria-hidden /> {o.address}
                </p>
              </div>
              {waiting && <span className="bg-d-accent px-2 py-1 text-[12px] font-semibold text-d-on uppercase">Angebot liegt vor</span>}
            </header>
            <div className="px-5 py-4">
              <Track steps={["Anfrage", "Angebot", "Termin", "Erledigt", "Rechnung"]} current={idx} />
            </div>
            {waiting && (
              <div className="border-t border-[#e2e3e5] px-5 py-4">
                <QuoteTable quote={o.quote!} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13px] text-[#6c7077]">Festpreis, gültig 14 Tage. Mehr wird es nur nach Rücksprache.</p>
                  <button
                    type="button"
                    onClick={() => {
                      onPatch(o.id, { stage: "geplant", value: gross(o.quote!) });
                      toast("Angebot angenommen. Im Büro wartet der Auftrag jetzt im Einsatzplan auf einen Monteur.");
                    }}
                    className="min-h-12 bg-d-accent px-6 font-semibold text-d-on hover:brightness-95"
                  >
                    Angebot annehmen
                  </button>
                </div>
              </div>
            )}
            {o.stage === "anfrage" && <p className="border-t border-[#e2e3e5] px-5 py-3 text-[14px] text-[#6c7077]">Wir prüfen Ihre Anfrage und melden uns heute noch.</p>}
            {o.stage === "geplant" && (
              <div className="border-t border-[#e2e3e5] px-5 py-3 text-[14px]">
                {o.tech ? (
                  <p>
                    <strong className="font-semibold text-[#131416]">
                      {fmtDay(workday(o.day ?? 0))}, {o.slot} Uhr
                    </strong>{" "}
                    · Ihr Monteur: {o.tech}. Er meldet sich 30 Minuten vor Ankunft.
                  </p>
                ) : (
                  <p>
                    Danke für Ihren Auftrag. Wir teilen gerade einen Monteur ein –{" "}
                    <button type="button" onClick={() => go("betrieb", "plan")} className="font-semibold underline underline-offset-2">
                      im Einsatzplan des Büros ansehen
                    </button>
                    .
                  </p>
                )}
              </div>
            )}
            {(o.stage === "erledigt" || o.stage === "rechnung") && (
              <p className="flex items-center gap-2 border-t border-[#e2e3e5] px-5 py-3 text-[14px]">
                <FileText className="size-4 text-[#6c7077]" aria-hidden /> Arbeitsbericht mit Fotos und Ihrer Unterschrift{o.doneAt ? ` · ${o.doneAt}` : ""}
                {o.stage === "rechnung" && " · Rechnung liegt bei"}
              </p>
            )}
          </article>
        );
      })}
    </div>
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
      <div className="grid min-w-[1080px] grid-cols-5 gap-3">
        {STAGES.map((st) => {
          const list = orders.filter((o) => o.stage === st.id);
          return (
            <section key={st.id} aria-label={st.title} className="rounded-[10px] border border-bo-line bg-[#e9ebee] p-2">
              <h2 className="flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold text-bo-ink">
                {st.title} <span className="num rounded bg-white px-1.5 text-[12px] font-medium text-bo-muted">{list.length}</span>
              </h2>
              <ul className="space-y-2">
                {list.map((o) => (
                  <li key={o.id} className={cx("rounded-lg border border-bo-line bg-white p-3", o.own && "animate-demo-flash")}>
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
                      <p className="mt-2 flex gap-2 rounded bg-[#e6eefb] px-2 py-1.5 text-[12px] leading-snug text-[#1d4fa8]">
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
    <div data-tour="angebot" className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="space-y-4">
        <Panel
          title={`Anfrage ${order.id}`}
          aside={
            <label className="flex items-center gap-2">
              <span className="sr-only">Anfrage wählen</span>
              <select value={order.id} onChange={(e) => onPick(e.target.value)} className="min-h-9 rounded-md border border-bo-line bg-white px-2 text-[16px] text-bo-ink sm:text-[13px]">
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
                <span key={i} className="relative size-16 overflow-hidden rounded border border-bo-line">
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
      <div>
        <div className="sticky top-[calc(var(--bar-h)+1rem)] rounded-[10px] border border-bo-line bg-white">
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
                    <select value={p.tech} onChange={(e) => setPick((s) => ({ ...s, [o.id]: { ...p, tech: e.target.value } }))} className="min-h-9 rounded-md border border-bo-line bg-white px-2 text-[16px] text-bo-ink sm:text-[13px]">
                      {TECHS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span className="sr-only">Tag</span>
                    <select value={p.day} onChange={(e) => setPick((s) => ({ ...s, [o.id]: { ...p, day: Number(e.target.value) } }))} className="min-h-9 rounded-md border border-bo-line bg-white px-2 text-[16px] text-bo-ink sm:text-[13px]">
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
                            <li key={j.key} className={cx("rounded border-l-[3px] px-2 py-1 leading-tight", j.live ? "animate-demo-flash border-l-d-accent bg-d-soft" : j.done ? "border-l-bo-ok bg-[#e3f3ea]" : "border-l-[#8a93a3] bg-bo-bg")}>
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
      <div className="grid gap-4 lg:grid-cols-2">
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

function TechApp({ orders, onPatch, onOffice }: { orders: Order[]; onPatch: (id: string, c: Partial<Order>) => void; onOffice: () => void }) {
  const me = TECHS[0];
  const jobs = orders.filter((o) => o.tech === me && o.day === 0 && (o.stage === "geplant" || o.stage === "erledigt")).sort((a, b) => (a.slot ?? "").localeCompare(b.slot ?? ""));
  const [openId, setOpenId] = useState<string | null>(null);
  const open = jobs.find((j) => j.id === openId);
  return (
    <div className="min-h-[calc(100dvh-var(--bar-h))] bg-[#dfe1e4] px-4 py-6 font-plex sm:py-9">
      <div className="mx-auto grid max-w-4xl items-start gap-8 md:grid-cols-[minmax(0,24rem)_1fr]">
        {/* Telefonrahmen */}
        <div data-tour="monteur" className="mx-auto w-full max-w-[24rem] overflow-hidden rounded-[2rem] border-[10px] border-[#131416] bg-[#f4f4f2] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.5)]">
          <div className="flex items-center justify-between bg-[#131416] px-5 pt-1 pb-2 text-[11px] font-medium text-white/80">
            <span className="num">{clock()}</span>
            <span>Wilke · Monteur</span>
          </div>
          <div className="h-[36rem] overflow-y-auto text-[14.5px] text-[#33363a]">{open ? <JobDetail key={open.id} job={open} onBack={() => setOpenId(null)} onPatch={onPatch} /> : <JobList me={me} jobs={jobs} onOpen={setOpenId} />}</div>
        </div>
        <div className="hidden text-[#33363a] md:block">
          <h1 className={cx(H, "text-[1.7rem] leading-none text-[#131416]")}>Die App für draußen.</h1>
          <p className="mt-3 max-w-sm text-[15px] leading-relaxed">Deniz sieht morgens seine Einsätze, hakt vor Ort die Checkliste ab, erfasst das Material und lässt den Kunden auf dem Display unterschreiben.</p>
          <ul className="mt-5 space-y-2.5 text-[14px]">
            {["Öffne einen Einsatz", "Hak die Checkliste ab", "Unterschreib mit Maus oder Finger", "Schließ den Auftrag ab – im Büro steht er sofort auf „Erledigt“"].map((s, i) => (
              <li key={s} className="flex gap-3">
                <span className="num grid size-5 shrink-0 place-items-center bg-[#131416] text-[11px] font-semibold text-white">{i + 1}</span> {s}
              </li>
            ))}
          </ul>
          <button type="button" onClick={onOffice} className="mt-6 min-h-11 border border-[#131416] px-4 text-[14px] font-medium hover:bg-[#131416] hover:text-white">
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
      <div className="bg-[#131416] px-5 pt-3 pb-5 text-white">
        <p className="text-[13px] text-white/60">{fmtDay(workday(0))}</p>
        <h2 className={cx(H, "text-[1.5rem] leading-tight")}>Moin {me.split(" ")[0]}.</h2>
        <p className="mt-0.5 text-[13.5px] text-white/75">{left ? `${left} ${left === 1 ? "Einsatz" : "Einsätze"} offen` : "Alles erledigt für heute."}</p>
      </div>
      <ul className="space-y-2.5 p-3">
        {jobs.map((j) => {
          const done = j.stage === "erledigt";
          return (
            <li key={j.id}>
              <button type="button" disabled={done} onClick={() => onOpen(j.id)} className={cx("block w-full border bg-white p-3.5 text-left", done ? "border-[#d9dbde] opacity-60" : "border-[#c9cbcf] hover:border-[#131416]")}>
                <span className="flex items-center justify-between gap-2">
                  <span className="num text-[13px] font-semibold text-[#131416]">{j.slot}</span>
                  {done ? (
                    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-bo-ok">
                      <Check className="size-3.5" strokeWidth={3} aria-hidden /> erledigt
                    </span>
                  ) : (
                    <ChevronRight className="size-4 text-[#8b8f96]" aria-hidden />
                  )}
                </span>
                <span className="mt-1 block font-semibold text-[#131416]">{j.topic}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#6c7077]">
                  <MapPin className="size-3.5 shrink-0" aria-hidden /> {j.customer} · {j.address}
                </span>
              </button>
            </li>
          );
        })}
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
  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-[#d9dbde] bg-white px-2 py-1.5">
        <button type="button" onClick={onBack} aria-label="Zurück zur Liste" className="grid size-11 place-items-center">
          <ArrowLeft className="size-5" aria-hidden />
        </button>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-semibold text-[#131416]">{job.topic}</p>
          <p className="num font-plex-mono text-[11.5px] text-[#6c7077]">
            {job.id} · {job.slot}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-3">
        <section className="border border-[#d9dbde] bg-white">
          {/* Lageskizze */}
          <svg viewBox="0 0 320 96" className="block w-full bg-[#e9ebe6]" role="img" aria-label={`Lageskizze: ${job.address}`}>
            <path d="M0 62h320M96 0v96M228 0v96M0 22h96M228 34h92" stroke="#fff" strokeWidth="9" />
            <path d="M118 8h88v22h-88zM118 40h40v14h-40zM166 40h40v14h-40zM118 72h88v20h-88zM8 32h76v22H8zM240 44h72v10h-72zM240 72h72v20h-72zM8 72h76v20H8z" fill="#d5d8d0" />
            <path d="M40 0c8 30 20 40 56 62" stroke="#b9d3e6" strokeWidth="7" fill="none" />
            <g transform="translate(186 47)">
              <path d="M0 14c-7-8-10-12-10-17a10 10 0 0 1 20 0c0 5-3 9-10 17Z" fill="#131416" />
              <circle cy="-3" r="3.6" fill="#f5c400" />
            </g>
          </svg>
          <div className="p-3.5">
            <p className="font-semibold text-[#131416]">{job.customer}</p>
            <p className="text-[13.5px] text-[#6c7077]">{job.address}, Musterstadt</p>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => toast("Navigation würde jetzt in der Karten-App starten.")} className="min-h-11 border border-[#c9cbcf] text-[13.5px] font-medium">
                Route starten
              </button>
              <button type="button" onClick={() => toast("Anruf beim Kunden würde jetzt starten.")} className="min-h-11 border border-[#c9cbcf] text-[13.5px] font-medium">
                Kunde anrufen
              </button>
            </div>
            {job.desc && <p className="mt-3 border-t border-[#e2e3e5] pt-2.5 text-[13.5px] leading-relaxed">{job.desc}</p>}
          </div>
        </section>

        <section>
          <h3 className="mb-1.5 text-[11.5px] font-semibold tracking-[0.12em] text-[#6c7077] uppercase">
            Checkliste <span className="num">{checks.length}/{CHECKS.length}</span>
          </h3>
          <ul className="divide-y divide-[#e2e3e5] border border-[#d9dbde] bg-white">
            {CHECKS.map((c, i) => {
              const on = checks.includes(i);
              return (
                <li key={c}>
                  <button type="button" role="checkbox" aria-checked={on} onClick={() => setChecks((x) => (on ? x.filter((y) => y !== i) : [...x, i]))} className="flex min-h-12 w-full items-center gap-3 px-3.5 text-left">
                    <span className={cx("grid size-6 shrink-0 place-items-center border-2", on ? "border-[#131416] bg-[#131416] text-d-accent" : "border-[#b9bcc1]")}>{on && <Check className="size-4" strokeWidth={3} aria-hidden />}</span>
                    <span className={on ? "text-[#6c7077] line-through" : ""}>{c}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="mb-1.5 text-[11.5px] font-semibold tracking-[0.12em] text-[#6c7077] uppercase">Material</h3>
          <ul className="divide-y divide-[#e2e3e5] border border-[#d9dbde] bg-white">
            {MATERIAL.map((m) => {
              const q = mat[m.id] ?? 0;
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 px-3.5 py-1.5">
                  <span>{m.name}</span>
                  <span className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setMat((s) => ({ ...s, [m.id]: Math.max(0, q - 1) }))} aria-label={`${m.name} weniger`} className="grid size-10 place-items-center border border-[#c9cbcf]">
                      <Minus className="size-4" aria-hidden />
                    </button>
                    <span className="num w-6 text-center font-semibold text-[#131416]">{q}</span>
                    <button type="button" onClick={() => setMat((s) => ({ ...s, [m.id]: q + 1 }))} aria-label={`${m.name} mehr`} className="grid size-10 place-items-center border border-[#c9cbcf]">
                      <Plus className="size-4" aria-hidden />
                    </button>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section>
          <h3 className="mb-1.5 text-[11.5px] font-semibold tracking-[0.12em] text-[#6c7077] uppercase">Fotos</h3>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: photos }, (_, i) => (
              <span key={i} className="relative size-16 overflow-hidden border border-[#d9dbde]">
                <Image src={THUMBS[i % THUMBS.length]} alt={`Foto ${i + 1}`} fill sizes="64px" className="object-cover" />
              </span>
            ))}
            <button type="button" onClick={() => setPhotos((p) => Math.min(4, p + 1))} className="grid size-16 place-items-center border-2 border-dashed border-[#b9bcc1] bg-white" aria-label="Foto aufnehmen">
              <Camera className="size-5 text-[#5b5f66]" strokeWidth={1.6} aria-hidden />
            </button>
          </div>
        </section>

        <section>
          <h3 className="mb-1.5 text-[11.5px] font-semibold tracking-[0.12em] text-[#6c7077] uppercase">Unterschrift des Kunden</h3>
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
          className="min-h-14 w-full bg-d-accent font-semibold text-d-on disabled:bg-[#d9dbde] disabled:text-[#8b8f96]"
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
    ctx.strokeStyle = "#131416";
  }, []);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top] as const;
  };
  return (
    <div className="border border-[#d9dbde] bg-white">
      <canvas
        ref={ref}
        role="img"
        aria-label={has ? "Unterschrift vorhanden" : "Unterschriftsfeld, noch leer"}
        className="block h-32 w-full touch-none cursor-crosshair"
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
      <div className="flex items-center justify-between border-t border-dashed border-[#c9cbcf] px-3 py-1 text-[12px] text-[#6c7077]">
        <span>{has ? "Danke – Unterschrift erfasst" : "Hier mit Maus oder Finger unterschreiben"}</span>
        <button
          type="button"
          onClick={() => {
            const c = ref.current!;
            c.getContext("2d")!.clearRect(0, 0, c.width, c.height);
            setHas(false);
            onChange(false);
          }}
          className="min-h-9 px-2 font-medium text-[#131416] underline underline-offset-2"
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
