"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Bike, BookOpen, ChartColumn, ChefHat, ClipboardList, Clock, Flame, Leaf, MapPin, Minus, Phone, Plus, Settings, ShoppingBag, Store } from "lucide-react";
import { useDemo } from "@/demos/kit/context";
import { Backoffice, Bars, Btn, Field, Figures, input, Panel, Ranks, Sheet, Tag, td, th, Toggle, tr, Track } from "@/demos/kit/ui";
import { cx, eur, eur0, hm, nowMinutes } from "@/demos/kit/util";

/**
 * Demo "Pizzeria Fiamma": Bestellseite für Gäste + Dashboard mit Küchen-Board.
 * Beide Ansichten teilen sich einen Zustand – wer vorne bestellt, sieht die Bestellung hinten in der Küche,
 * und wer hinten ein Gericht auf "ausverkauft" setzt, sieht es vorne verschwinden.
 */

type Cat = "Pizza" | "Pasta" | "Insalate" | "Dolci" | "Getränke";
interface Dish {
  id: string;
  cat: Cat;
  name: string;
  desc: string;
  price: number;
  veg?: boolean;
  hot?: boolean;
  top?: boolean;
  allergens: string;
}
const CATS: Cat[] = ["Pizza", "Pasta", "Insalate", "Dolci", "Getränke"];
const DISHES: Dish[] = [
  { id: "margherita", cat: "Pizza", name: "Margherita", desc: "San-Marzano-Tomaten, Fior di Latte, Basilikum", price: 9.5, veg: true, allergens: "A, G" },
  { id: "diavola", cat: "Pizza", name: "Diavola", desc: "Scharfe Salami, Chili, Fior di Latte", price: 12.5, hot: true, top: true, allergens: "A, G" },
  { id: "funghi", cat: "Pizza", name: "Prosciutto e Funghi", desc: "Kochschinken, Champignons, Fior di Latte", price: 12.9, allergens: "A, G" },
  { id: "formaggi", cat: "Pizza", name: "Quattro Formaggi", desc: "Gorgonzola, Taleggio, Parmesan, Fior di Latte", price: 13.5, veg: true, allergens: "A, G" },
  { id: "bufala", cat: "Pizza", name: "Bufala", desc: "Büffelmozzarella, Kirschtomaten, Rucola", price: 14.5, veg: true, top: true, allergens: "A, G" },
  { id: "tartufo", cat: "Pizza", name: "Tartufo", desc: "Trüffelcreme, Waldpilze, Parmesan", price: 15.9, veg: true, allergens: "A, G" },
  { id: "ragu", cat: "Pasta", name: "Tagliatelle al Ragù", desc: "Sechs Stunden geschmortes Rinderragù", price: 13.5, allergens: "A, C, I" },
  { id: "aglio", cat: "Pasta", name: "Spaghetti Aglio e Olio", desc: "Knoblauch, Peperoncino, Petersilie", price: 10.5, veg: true, hot: true, allergens: "A" },
  { id: "norma", cat: "Pasta", name: "Rigatoni alla Norma", desc: "Aubergine, Tomate, Ricotta salata", price: 12.5, veg: true, allergens: "A, G" },
  { id: "lasagne", cat: "Pasta", name: "Lasagne della Casa", desc: "Ragù, Béchamel, Parmesan – aus dem Holzofen", price: 13.9, allergens: "A, C, G, I" },
  { id: "mista", cat: "Insalate", name: "Insalata Mista", desc: "Blattsalate, Tomate, Gurke, Hausdressing", price: 7.5, veg: true, allergens: "J" },
  { id: "burrata", cat: "Insalate", name: "Burrata", desc: "Burrata, Ochsenherztomate, Basilikumöl", price: 11.5, veg: true, allergens: "G" },
  { id: "tiramisu", cat: "Dolci", name: "Tiramisù", desc: "Nach dem Rezept von Nonna Rosa", price: 6.5, veg: true, top: true, allergens: "A, C, G" },
  { id: "panna", cat: "Dolci", name: "Panna Cotta", desc: "Mit Waldbeeren", price: 5.9, veg: true, allergens: "G" },
  { id: "acqua", cat: "Getränke", name: "San Pellegrino 0,75 l", desc: "Mineralwasser mit Kohlensäure", price: 5.5, veg: true, allergens: "–" },
  { id: "limonata", cat: "Getränke", name: "Limonata 0,33 l", desc: "Zitronenlimonade aus Sizilien", price: 3.5, veg: true, allergens: "–" },
  { id: "moretti", cat: "Getränke", name: "Birra Moretti 0,33 l", desc: "Italienisches Lager", price: 3.9, veg: true, allergens: "A" },
];
const SIZES = [
  { id: "n", label: "Klassisch · Ø 30 cm", add: 0 },
  { id: "g", label: "Groß · Ø 36 cm", add: 4 },
];
const EXTRAS = [
  { id: "bufala", label: "Büffelmozzarella", add: 2.5 },
  { id: "parma", label: "Parmaschinken", add: 3 },
  { id: "rucola", label: "Rucola", add: 1 },
  { id: "oel", label: "Scharfes Öl", add: 0 },
  { id: "gf", label: "Glutenfreier Boden", add: 2.5 },
];

type Mode = "abholung" | "lieferung";
type Status = "neu" | "arbeit" | "fertig" | "done";
interface Line {
  key: string;
  dish: string;
  name: string;
  detail: string;
  unit: number;
  qty: number;
}
interface Order {
  no: number;
  /** Eingang in Minuten seit Mitternacht */
  at: number;
  customer: string;
  mode: Mode;
  due: string;
  lines: { qty: number; name: string; detail?: string }[];
  note?: string;
  total: number;
  pay: string;
  status: Status;
  own?: boolean;
}

const STATUS_LABEL: Record<Status, string> = { neu: "Neu", arbeit: "In Zubereitung", fertig: "Fertig", done: "Abgeschlossen" };
const STATUS_TONE = { neu: "accent", arbeit: "warn", fertig: "ok", done: "neutral" } as const;

function seedOrders(): Order[] {
  const now = nowMinutes();
  const o = (no: number, ago: number, customer: string, mode: Mode, lines: Order["lines"], total: number, pay: string, status: Status, note?: string): Order => ({
    no,
    at: Math.max(0, now - ago),
    customer,
    mode,
    due: hm(Math.max(0, now - ago) + (mode === "abholung" ? 20 : 40)),
    lines,
    total,
    pay,
    status,
    note,
  });
  return [
    o(1051, 2, "Miriam Scholz", "abholung", [{ qty: 2, name: "Margherita" }, { qty: 1, name: "Tiramisù" }], 25.5, "Online bezahlt", "neu"),
    o(1050, 6, "Tobias Renner", "lieferung", [{ qty: 1, name: "Diavola", detail: "Groß · + Büffelmozzarella" }, { qty: 1, name: "Insalata Mista" }, { qty: 2, name: "Birra Moretti 0,33 l" }], 36.8, "Bar bei Lieferung", "neu", "Klingel defekt – bitte anrufen"),
    o(1049, 11, "Familie Öztürk", "lieferung", [{ qty: 2, name: "Bufala" }, { qty: 1, name: "Prosciutto e Funghi" }, { qty: 1, name: "Lasagne della Casa" }], 55.8, "Online bezahlt", "arbeit"),
    o(1048, 14, "Jonas Keller", "abholung", [{ qty: 1, name: "Tartufo" }, { qty: 1, name: "Limonata 0,33 l" }], 19.4, "Karte bei Abholung", "arbeit"),
    o(1047, 23, "Carla Benedetti", "abholung", [{ qty: 1, name: "Quattro Formaggi", detail: "Glutenfreier Boden" }], 16.0, "Online bezahlt", "fertig"),
    o(1046, 41, "Henrik Paulsen", "lieferung", [{ qty: 3, name: "Margherita" }, { qty: 1, name: "Diavola" }], 43.5, "Online bezahlt", "done"),
    o(1045, 58, "Aylin Demir", "abholung", [{ qty: 2, name: "Tagliatelle al Ragù" }], 27.0, "Bar bei Abholung", "done"),
    o(1044, 77, "Stefan Brandl", "lieferung", [{ qty: 1, name: "Bufala" }, { qty: 1, name: "Burrata" }, { qty: 1, name: "San Pellegrino 0,75 l" }], 34.0, "Online bezahlt", "done"),
  ];
}

export default function RestaurantDemo() {
  const { view } = useDemo();
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [soldOut, setSoldOut] = useState<Record<string, boolean>>({ panna: true });
  const [settings, setSettings] = useState({ paused: false, minOrder: 15, fee: 2.5, freeFrom: 30 });
  const [myOrder, setMyOrder] = useState<number | null>(null);

  const dishes = useMemo(() => DISHES.map((d) => ({ ...d, price: prices[d.id] ?? d.price })), [prices]);
  const place = (o: Omit<Order, "no" | "at" | "status" | "own">) => {
    const no = Math.max(...orders.map((x) => x.no)) + 1;
    setOrders((prev) => [{ ...o, no, at: nowMinutes(), status: "neu", own: true }, ...prev]);
    setMyOrder(no);
  };
  const advance = (no: number) =>
    setOrders((prev) => prev.map((o) => (o.no === no ? { ...o, status: ({ neu: "arbeit", arbeit: "fertig", fertig: "done", done: "done" } as const)[o.status] } : o)));

  return view === "kunde" ? (
    <Storefront dishes={dishes} soldOut={soldOut} settings={settings} order={orders.find((o) => o.no === myOrder) ?? null} onPlace={place} onNew={() => setMyOrder(null)} />
  ) : (
    <Dashboard
      orders={orders}
      dishes={dishes}
      soldOut={soldOut}
      settings={settings}
      onAdvance={advance}
      onPrice={(id, p) => setPrices((s) => ({ ...s, [id]: p }))}
      onSoldOut={(id, v) => setSoldOut((s) => ({ ...s, [id]: v }))}
      onSettings={setSettings}
    />
  );
}

/* ───────────────────────────── Bestellseite ───────────────────────────── */

type Settings = { paused: boolean; minOrder: number; fee: number; freeFrom: number };

function Storefront({ dishes, soldOut, settings, order, onPlace, onNew }: { dishes: Dish[]; soldOut: Record<string, boolean>; settings: Settings; order: Order | null; onPlace: (o: Omit<Order, "no" | "at" | "status" | "own">) => void; onNew: () => void }) {
  const { go } = useDemo();
  const [mode, setMode] = useState<Mode>("abholung");
  const [cat, setCat] = useState<Cat>("Pizza");
  const [cart, setCart] = useState<Line[]>([]);
  const [config, setConfig] = useState<Dish | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  const add = (d: Dish, detail = "", unit = d.price, qty = 1) => {
    const key = `${d.id}|${detail}`;
    setCart((c) => (c.some((l) => l.key === key) ? c.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l)) : [...c, { key, dish: d.id, name: d.name, detail, unit, qty }]));
  };
  const count = cart.reduce((n, l) => n + l.qty, 0);
  const sub = cart.reduce((s, l) => s + l.unit * l.qty, 0);

  const cartProps = { cart, setCart, mode, setMode, settings, sub, order, onNew, onDashboard: () => go("betrieb", "kueche"), onPlace: (o: Omit<Order, "no" | "at" | "status" | "own">) => (onPlace(o), setCart([])) };

  return (
    <div className="bg-[#faf7f2] font-plex text-[15px] text-[#3b2f28]">
      <header className="bg-d-deep text-[#f6ece1]">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3 sm:px-6">
          <p className="flex items-baseline gap-2">
            <span className="font-d-display text-[1.9rem] leading-none font-semibold tracking-tight italic">Fiamma</span>
            <span className="text-[11px] tracking-[0.2em] uppercase opacity-70">Pizzeria</span>
          </p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[13px] opacity-85">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden /> Heute 11:30 – 22:30
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <MapPin className="size-3.5" aria-hidden /> Am Lindenplatz 4, Musterstadt
            </span>
            <span className="num hidden items-center gap-1.5 md:inline-flex">
              <Phone className="size-3.5" aria-hidden /> 01234 567 890
            </span>
          </p>
        </div>
      </header>

      <section className="bg-d-deep text-[#f6ece1]">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 pt-4 pb-8 sm:px-6 md:grid-cols-[1.05fr_1fr] md:items-center md:pt-6 md:pb-10">
          <div>
            <h1 className="font-d-display text-[clamp(2rem,4.6vw,3.3rem)] leading-[1.02] font-medium tracking-[-0.02em] text-balance text-[#fff7ee]">
              Aus dem Holzofen. <em className="text-[#ffb089]">Direkt bei uns bestellt.</em>
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed opacity-80">Teig mit 48 Stunden Ruhe, 90 Sekunden bei 450 Grad. Bestell hier, hol ab oder lass liefern – ohne Umweg über eine Plattform.</p>
            <ModeSwitch mode={mode} setMode={setMode} dark className="mt-5 max-w-sm" />
          </div>
          <div className="relative aspect-[16/9] overflow-hidden rounded-xl md:aspect-[5/3]">
            <Image src="/images/sectors/gastro-1.webp" alt="Pizza im Holzofen" fill priority sizes="(min-width:768px) 520px, 100vw" className="object-cover" />
          </div>
        </div>
      </section>

      {settings.paused && (
        <p className="bg-[#fbe7e5] px-4 py-2.5 text-center text-[14px] font-medium text-bo-bad" role="status">
          Wir nehmen gerade keine Online-Bestellungen an. Bitte versuch es später noch einmal.
        </p>
      )}

      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22.5rem] lg:py-8">
        <div data-tour="menu">
          <div role="tablist" aria-label="Kategorien" className="sticky top-[var(--bar-h)] z-10 -mx-4 flex gap-1 overflow-x-auto border-b border-[#e6ddd2] bg-[#faf7f2] px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {CATS.map((c) => (
              <button
                key={c}
                role="tab"
                type="button"
                aria-selected={cat === c}
                onClick={() => setCat(c)}
                className={cx("min-h-12 shrink-0 border-b-2 px-3 font-d-display text-[1.05rem] transition-colors", cat === c ? "border-d-accent font-semibold text-[#2a1a12]" : "border-transparent text-[#7a6a5f] hover:text-[#2a1a12]")}
              >
                {c}
              </button>
            ))}
          </div>

          <ul className="divide-y divide-[#e6ddd2]">
            {dishes
              .filter((d) => d.cat === cat)
              .map((d) => {
                const out = soldOut[d.id];
                return (
                  <li key={d.id} className={cx("flex items-start gap-4 py-4", out && "opacity-50")}>
                    <div className="min-w-0 flex-1">
                      <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-d-display text-[1.2rem] leading-tight font-semibold text-[#2a1a12]">
                        {d.name}
                        {d.top && <span className="rounded-sm bg-d-accent px-1.5 py-px font-plex text-[10.5px] font-semibold tracking-wide text-white uppercase">Beliebt</span>}
                        {d.veg && (
                          <span className="inline-flex items-center gap-0.5 font-plex text-[11.5px] font-medium text-[#2f6b3c]">
                            <Leaf className="size-3" aria-hidden /> vegetarisch
                          </span>
                        )}
                        {d.hot && (
                          <span className="inline-flex items-center gap-0.5 font-plex text-[11.5px] font-medium text-d-accent">
                            <Flame className="size-3" aria-hidden /> scharf
                          </span>
                        )}
                      </h3>
                      <p className="mt-0.5 text-[14.5px] leading-snug text-[#5c4d43]">{d.desc}</p>
                      <p className="mt-1 text-[11.5px] text-[#8a7a6e]">Allergene: {d.allergens}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="num font-medium text-[#2a1a12]">{eur(d.price)}</span>
                      {out ? (
                        <span className="w-11 text-center text-[11.5px] leading-tight font-medium">Heute aus</span>
                      ) : (
                        <button
                          type="button"
                          disabled={settings.paused}
                          onClick={() => (d.cat === "Pizza" ? setConfig(d) : add(d))}
                          aria-label={`${d.name} hinzufügen`}
                          className="grid size-11 place-items-center rounded-full border border-[#d9cdbf] bg-white text-[#2a1a12] transition-colors hover:border-d-accent hover:bg-d-accent hover:text-white disabled:opacity-40"
                        >
                          <Plus className="size-5" aria-hidden />
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
          </ul>
          <p className="mt-4 text-[12px] leading-relaxed text-[#8a7a6e]">A Gluten · C Eier · G Milch · I Sellerie · J Senf. Alle Preise inklusive Mehrwertsteuer.</p>
        </div>

        <aside data-tour="cart" className="hidden lg:block">
          <div className="sticky top-[calc(var(--bar-h)+1rem)]">
            <Cart {...cartProps} />
          </div>
        </aside>
      </div>

      {/* Handy: Warenkorb als Leiste unten */}
      <div className="sticky bottom-0 z-20 border-t border-[#e6ddd2] bg-[#faf7f2] p-3 lg:hidden">
        <button type="button" onClick={() => setCartOpen(true)} className="flex min-h-12 w-full items-center justify-between rounded-lg bg-d-accent px-4 font-medium text-white">
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="size-4" aria-hidden /> {order ? `Bestellung #${order.no}` : count ? `Warenkorb · ${count} Artikel` : "Warenkorb"}
          </span>
          <span className="num">{order ? STATUS_LABEL[order.status] : eur(sub)}</span>
        </button>
      </div>
      <Sheet open={cartOpen} onClose={() => setCartOpen(false)} title={order ? "Deine Bestellung" : "Warenkorb"} tone="brand">
        <Cart {...cartProps} bare />
      </Sheet>

      <ConfigSheet dish={config} onClose={() => setConfig(null)} onAdd={(detail, unit, qty) => config && add(config, detail, unit, qty)} />
    </div>
  );
}

function ModeSwitch({ mode, setMode, dark, className }: { mode: Mode; setMode: (m: Mode) => void; dark?: boolean; className?: string }) {
  const opts = [
    { id: "abholung" as const, label: "Abholung", sub: "in ca. 20 Min.", icon: Store },
    { id: "lieferung" as const, label: "Lieferung", sub: "35–45 Min.", icon: Bike },
  ];
  return (
    <div role="radiogroup" aria-label="Abholung oder Lieferung" className={cx("grid grid-cols-2 gap-1 rounded-lg p-1", dark ? "bg-white/10" : "bg-[#efe8de]", className)}>
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={mode === o.id}
          onClick={() => setMode(o.id)}
          className={cx("flex min-h-12 items-center gap-2.5 rounded-md px-3 text-left transition-colors", mode === o.id ? "bg-white text-[#2a1a12]" : dark ? "text-[#f6ece1]/80 hover:text-white" : "text-[#5c4d43]")}
        >
          <o.icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
          <span className="leading-tight">
            <span className="block text-[14px] font-semibold">{o.label}</span>
            <span className="block text-[12px] opacity-70">{o.sub}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function ConfigSheet({ dish, onClose, onAdd }: { dish: Dish | null; onClose: () => void; onAdd: (detail: string, unit: number, qty: number) => void }) {
  const [size, setSize] = useState("n");
  const [extras, setExtras] = useState<string[]>([]);
  const [qty, setQty] = useState(1);
  const [last, setLast] = useState<string | null>(null);
  if (dish && last !== dish.id) {
    setLast(dish.id);
    setSize("n");
    setExtras([]);
    setQty(1);
  }
  if (!dish) return null;
  const s = SIZES.find((x) => x.id === size)!;
  const ex = EXTRAS.filter((e) => extras.includes(e.id));
  const unit = dish.price + s.add + ex.reduce((a, e) => a + e.add, 0);
  const detail = [s.id === "g" ? "Groß" : "", ...ex.map((e) => `+ ${e.label}`)].filter(Boolean).join(" · ");
  return (
    <Sheet
      open
      onClose={onClose}
      tone="brand"
      title={<span className="font-d-display text-[1.4rem] font-semibold text-[#2a1a12]">{dish.name}</span>}
      footer={
        <div className="flex w-full items-center gap-3">
          <Qty value={qty} onChange={setQty} />
          <button
            type="button"
            onClick={() => {
              onAdd(detail, unit, qty);
              onClose();
            }}
            className="flex min-h-12 flex-1 items-center justify-between rounded-lg bg-d-accent px-4 font-medium text-white hover:brightness-95"
          >
            In den Warenkorb <span className="num">{eur(unit * qty)}</span>
          </button>
        </div>
      }
    >
      <div className="font-plex text-[15px] text-[#3b2f28]">
        <p className="text-[#5c4d43]">{dish.desc}</p>
        <fieldset className="mt-5">
          <legend className="text-[13px] font-semibold text-[#2a1a12]">Größe</legend>
          <div className="mt-2 divide-y divide-[#e6ddd2] rounded-lg border border-[#e6ddd2]">
            {SIZES.map((o) => (
              <label key={o.id} className="flex min-h-12 cursor-pointer items-center gap-3 px-3">
                <input type="radio" name="size" checked={size === o.id} onChange={() => setSize(o.id)} className="size-4 accent-[var(--d-accent)]" />
                <span className="flex-1">{o.label}</span>
                <span className="num text-[14px] text-[#5c4d43]">{o.add ? `+ ${eur(o.add)}` : eur(dish.price)}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset className="mt-5">
          <legend className="text-[13px] font-semibold text-[#2a1a12]">Extras</legend>
          <div className="mt-2 divide-y divide-[#e6ddd2] rounded-lg border border-[#e6ddd2]">
            {EXTRAS.map((o) => (
              <label key={o.id} className="flex min-h-12 cursor-pointer items-center gap-3 px-3">
                <input type="checkbox" checked={extras.includes(o.id)} onChange={(e) => setExtras((x) => (e.target.checked ? [...x, o.id] : x.filter((i) => i !== o.id)))} className="size-4 accent-[var(--d-accent)]" />
                <span className="flex-1">{o.label}</span>
                <span className="num text-[14px] text-[#5c4d43]">{o.add ? `+ ${eur(o.add)}` : "gratis"}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>
    </Sheet>
  );
}

function Qty({ value, onChange, small }: { value: number; onChange: (n: number) => void; small?: boolean }) {
  const b = cx("grid place-items-center rounded-full border border-[#d9cdbf] bg-white text-[#2a1a12] hover:border-[#2a1a12]", small ? "size-8" : "size-11");
  return (
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Weniger" className={b}>
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="num w-5 text-center font-medium" aria-live="polite">
        {value}
      </span>
      <button type="button" onClick={() => onChange(value + 1)} aria-label="Mehr" className={b}>
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

function Cart({
  cart,
  setCart,
  mode,
  setMode,
  settings,
  sub,
  order,
  onPlace,
  onNew,
  onDashboard,
  bare,
}: {
  cart: Line[];
  setCart: React.Dispatch<React.SetStateAction<Line[]>>;
  mode: Mode;
  setMode: (m: Mode) => void;
  settings: Settings;
  sub: number;
  order: Order | null;
  onPlace: (o: Omit<Order, "no" | "at" | "status" | "own">) => void;
  onNew: () => void;
  onDashboard: () => void;
  bare?: boolean;
}) {
  const [checkout, setCheckout] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [when, setWhen] = useState("asap");
  const [pay, setPay] = useState("online");
  const [tried, setTried] = useState(false);

  const fee = mode === "lieferung" && sub < settings.freeFrom ? settings.fee : 0;
  const missing = mode === "lieferung" ? Math.max(0, settings.minOrder - sub) : 0;
  const total = sub + fee;
  const now = nowMinutes();
  const lead = mode === "abholung" ? 20 : 40;
  const first = Math.ceil((now + lead) / 15) * 15;
  const slots = Array.from({ length: 6 }, (_, i) => hm(first + i * 15));
  const valid = name.trim().length > 1 && phone.trim().length > 5 && (mode === "abholung" || street.trim().length > 4);
  const box = bare ? "" : "rounded-xl border border-[#e6ddd2] bg-white p-4";

  if (order) {
    const steps = ["Eingegangen", "In Zubereitung", order.mode === "abholung" ? "Abholbereit" : "Unterwegs", "Abgeschlossen"];
    const idx = { neu: 0, arbeit: 1, fertig: 2, done: 3 }[order.status];
    return (
      <div className={box}>
        <p className="text-[12.5px] font-medium text-[#8a7a6e]">Bestellung #{order.no}</p>
        <h2 className="mt-0.5 font-d-display text-[1.45rem] leading-tight font-semibold text-[#2a1a12]">
          {idx === 0 ? "Danke! Wir haben deine Bestellung." : idx === 1 ? "Deine Bestellung ist im Ofen." : idx === 2 ? (order.mode === "abholung" ? "Fertig – komm vorbei." : "Unterwegs zu dir.") : "Guten Appetit!"}
        </h2>
        <p className="mt-1 text-[14px] text-[#5c4d43]">
          {order.mode === "abholung" ? "Abholung" : "Lieferung"} gegen {order.due} Uhr · {eur(order.total)}
        </p>
        <Track steps={steps} current={idx} className="mt-5" />
        <ul className="mt-5 space-y-1 border-t border-[#e6ddd2] pt-3 text-[14px]">
          {order.lines.map((l, i) => (
            <li key={i}>
              <span className="num">{l.qty}×</span> {l.name}
              {l.detail && <span className="text-[#8a7a6e]"> · {l.detail}</span>}
            </li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg bg-d-soft p-3 text-[13.5px] leading-snug text-[#3b2f28]">
          <strong className="font-semibold">So sieht es der Betrieb:</strong> Deine Bestellung liegt jetzt im Küchen-Board. Setz dort den Status – diese Anzeige läuft mit.
          <button type="button" onClick={onDashboard} className="mt-2 flex min-h-11 w-full items-center justify-center rounded-md bg-d-deep px-3 font-medium text-white">
            Im Dashboard ansehen
          </button>
        </div>
        <button type="button" onClick={onNew} className="mt-2 min-h-11 w-full text-[14px] font-medium text-[#5c4d43] underline decoration-[#d9cdbf] underline-offset-4 hover:text-[#2a1a12]">
          Neue Bestellung
        </button>
      </div>
    );
  }

  return (
    <div className={box}>
      {!bare && <h2 className="font-d-display text-[1.35rem] font-semibold text-[#2a1a12]">Deine Bestellung</h2>}
      <ModeSwitch mode={mode} setMode={setMode} className={bare ? "" : "mt-3"} />

      {cart.length === 0 ? (
        <p className="py-8 text-center text-[14px] leading-relaxed text-[#8a7a6e]">
          Noch nichts im Warenkorb.
          <br />
          Tipp auf das Plus bei einem Gericht.
        </p>
      ) : (
        <>
          <ul className="mt-3 divide-y divide-[#efe8de]">
            {cart.map((l) => (
              <li key={l.key} className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="leading-tight font-medium text-[#2a1a12]">{l.name}</p>
                  {l.detail && <p className="text-[12.5px] leading-tight text-[#8a7a6e]">{l.detail}</p>}
                  <p className="num text-[13px] text-[#5c4d43]">{eur(l.unit * l.qty)}</p>
                </div>
                <Qty small value={l.qty} onChange={(n) => setCart((c) => (n <= 0 ? c.filter((x) => x.key !== l.key) : c.map((x) => (x.key === l.key ? { ...x, qty: n } : x))))} />
              </li>
            ))}
          </ul>
          <dl className="num mt-2 space-y-1 border-t border-[#e6ddd2] pt-3 text-[14px]">
            <div className="flex justify-between">
              <dt>Zwischensumme</dt>
              <dd>{eur(sub)}</dd>
            </div>
            {mode === "lieferung" && (
              <div className="flex justify-between">
                <dt>Lieferung{fee === 0 && <span className="text-[#2f6b3c]"> · frei ab {eur0(settings.freeFrom)}</span>}</dt>
                <dd>{fee ? eur(fee) : "0,00 €"}</dd>
              </div>
            )}
            <div className="flex justify-between pt-1 text-[16px] font-semibold text-[#2a1a12]">
              <dt>Gesamt</dt>
              <dd>{eur(total)}</dd>
            </div>
          </dl>
          {missing > 0 && (
            <p className="num mt-3 rounded-md bg-[#fbf0d9] px-3 py-2 text-[13px] text-bo-warn" role="status">
              Noch {eur(missing)} bis zum Mindestbestellwert für die Lieferung ({eur0(settings.minOrder)}).
            </p>
          )}

          {!checkout ? (
            <button type="button" disabled={missing > 0 || settings.paused} onClick={() => setCheckout(true)} className="mt-4 min-h-12 w-full rounded-lg bg-d-accent px-4 font-medium text-white hover:brightness-95 disabled:opacity-40">
              Zur Kasse
            </button>
          ) : (
            <form
              noValidate
              className="mt-4 space-y-3 border-t border-[#e6ddd2] pt-4"
              onSubmit={(e) => {
                e.preventDefault();
                setTried(true);
                if (!valid || missing > 0) return;
                onPlace({
                  customer: name.trim(),
                  mode,
                  due: when === "asap" ? slots[0] : when,
                  lines: cart.map((l) => ({ qty: l.qty, name: l.name, detail: l.detail || undefined })),
                  total,
                  pay: pay === "online" ? "Online bezahlt" : mode === "abholung" ? "Zahlung bei Abholung" : "Bar bei Lieferung",
                });
                setCheckout(false);
                setTried(false);
              }}
            >
              <Field label={mode === "abholung" ? "Abholzeit" : "Lieferzeit"}>
                <select value={when} onChange={(e) => setWhen(e.target.value)} className={input}>
                  <option value="asap">So schnell wie möglich (ca. {slots[0]} Uhr)</option>
                  {slots.slice(1).map((s) => (
                    <option key={s} value={s}>
                      {s} Uhr
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Name">
                <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={tried && name.trim().length < 2} className={input} placeholder="Vor- und Nachname" />
              </Field>
              <Field label="Telefon" hint="Nur für Rückfragen zur Bestellung.">
                <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" autoComplete="tel" aria-invalid={tried && phone.trim().length < 6} className={input} placeholder="0151 2345678" />
              </Field>
              {mode === "lieferung" && (
                <Field label="Straße und Hausnummer">
                  <input value={street} onChange={(e) => setStreet(e.target.value)} autoComplete="street-address" aria-invalid={tried && street.trim().length < 5} className={input} placeholder="Gartenweg 12" />
                </Field>
              )}
              <fieldset>
                <legend className="mb-1 text-[12.5px] font-medium opacity-80">Bezahlung</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { id: "online", label: "Online" },
                    { id: "vorort", label: mode === "abholung" ? "Bei Abholung" : "Bar an der Tür" },
                  ].map((p) => (
                    <button key={p.id} type="button" aria-pressed={pay === p.id} onClick={() => setPay(p.id)} className={cx("min-h-11 rounded-md border px-3 text-[14px] font-medium", pay === p.id ? "border-[#2a1a12] bg-[#2a1a12] text-white" : "border-[#d9cdbf] bg-white")}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              {tried && !valid && (
                <p role="alert" className="text-[13px] text-bo-bad">
                  Bitte trag Name, Telefon{mode === "lieferung" ? " und Adresse" : ""} ein – erfundene Angaben genügen.
                </p>
              )}
              <button type="submit" className="flex min-h-12 w-full items-center justify-between rounded-lg bg-d-accent px-4 font-medium text-white hover:brightness-95">
                Jetzt bestellen <span className="num">{eur(total)}</span>
              </button>
              <p className="text-center text-[12px] text-[#8a7a6e]">Demo: Es wird nichts bestellt, bezahlt oder gespeichert.</p>
            </form>
          )}
        </>
      )}
    </div>
  );
}

/* ───────────────────────────── Dashboard ───────────────────────────── */

function Dashboard({
  orders,
  dishes,
  soldOut,
  settings,
  onAdvance,
  onPrice,
  onSoldOut,
  onSettings,
}: {
  orders: Order[];
  dishes: Dish[];
  soldOut: Record<string, boolean>;
  settings: Settings;
  onAdvance: (no: number) => void;
  onPrice: (id: string, p: number) => void;
  onSoldOut: (id: string, v: boolean) => void;
  onSettings: (s: Settings) => void;
}) {
  const { tab } = useDemo();
  const open = orders.filter((o) => o.status === "neu").length;
  const titles: Record<string, string> = { kueche: "Küche", bestellungen: "Bestellungen", speisekarte: "Speisekarte", zahlen: "Auswertung", einstellungen: "Einstellungen" };
  return (
    <Backoffice
      user="Luca Moretti"
      role="Inhaber"
      title={titles[tab] ?? "Küche"}
      nav={[
        { id: "kueche", label: "Küche", icon: ChefHat, count: open },
        { id: "bestellungen", label: "Bestellungen", icon: ClipboardList },
        { id: "speisekarte", label: "Speisekarte", icon: BookOpen },
        { id: "zahlen", label: "Auswertung", icon: ChartColumn },
        { id: "einstellungen", label: "Einstellungen", icon: Settings },
      ]}
      actions={
        <label className="flex items-center gap-2 rounded-md border border-bo-line bg-white py-0.5 pr-1 pl-3 text-[13px]">
          <span className={settings.paused ? "font-medium text-bo-bad" : "text-bo-body"}>{settings.paused ? "Bestellstopp aktiv" : "Online-Bestellungen an"}</span>
          <Toggle checked={!settings.paused} onChange={(v) => onSettings({ ...settings, paused: !v })} label="Online-Bestellungen annehmen" />
        </label>
      }
    >
      {tab === "bestellungen" ? (
        <OrdersTable orders={orders} />
      ) : tab === "speisekarte" ? (
        <MenuEditor dishes={dishes} soldOut={soldOut} onPrice={onPrice} onSoldOut={onSoldOut} />
      ) : tab === "zahlen" ? (
        <Numbers orders={orders} />
      ) : tab === "einstellungen" ? (
        <SettingsPanel settings={settings} onSettings={onSettings} />
      ) : (
        <Kitchen orders={orders} onAdvance={onAdvance} />
      )}
    </Backoffice>
  );
}

function Kitchen({ orders, onAdvance }: { orders: Order[]; onAdvance: (no: number) => void }) {
  const now = nowMinutes();
  const cols: { status: Status; title: string; action: string }[] = [
    { status: "neu", title: "Neu", action: "Annehmen" },
    { status: "arbeit", title: "In Zubereitung", action: "Fertig melden" },
    { status: "fertig", title: "Fertig", action: "Übergeben" },
  ];
  return (
    <div data-tour="board" className="grid gap-3 md:grid-cols-3">
      {cols.map((c) => {
        const list = orders.filter((o) => o.status === c.status).sort((a, b) => a.at - b.at);
        return (
          <section key={c.status} aria-label={c.title} className="rounded-[10px] border border-bo-line bg-[#e9ebee] p-2">
            <h2 className="flex items-center justify-between px-2 py-1.5 text-[13px] font-semibold text-bo-ink">
              {c.title} <span className="num rounded bg-white px-1.5 text-[12px] font-medium text-bo-muted">{list.length}</span>
            </h2>
            <ul className="space-y-2">
              {list.map((o) => {
                const wait = Math.max(0, now - o.at);
                return (
                  <li key={o.no} className={cx("rounded-lg border border-bo-line bg-white", o.own && "animate-demo-flash")}>
                    <div className="flex items-center justify-between gap-2 border-b border-dashed border-bo-line px-3 py-2">
                      <p className="font-plex-mono text-[15px] font-medium text-bo-ink">#{o.no}</p>
                      <p className="flex items-center gap-1.5 text-[12.5px] font-medium text-bo-ink">
                        {o.mode === "abholung" ? <Store className="size-3.5" aria-hidden /> : <Bike className="size-3.5" aria-hidden />}
                        {o.mode === "abholung" ? "Abholung" : "Lieferung"} {o.due}
                      </p>
                    </div>
                    <ul className="space-y-1 px-3 py-2.5 text-[14px] text-bo-ink">
                      {o.lines.map((l, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="num w-5 shrink-0 font-semibold">{l.qty}×</span>
                          <span>
                            {l.name}
                            {l.detail && <span className="block text-[12.5px] font-medium text-bo-warn">{l.detail}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {o.note && <p className="mx-3 mb-2.5 rounded bg-[#fbf0d9] px-2 py-1 text-[12.5px] text-bo-warn">Hinweis: {o.note}</p>}
                    <div className="flex items-center justify-between gap-2 border-t border-bo-line px-3 py-2">
                      <p className="text-[12px] text-bo-muted">
                        {o.customer}
                        {o.own && " (du)"} · <span className={cx("num", wait > 12 && c.status !== "fertig" && "font-semibold text-bo-bad")}>vor {wait} Min.</span>
                      </p>
                      <Btn size="sm" variant={c.status === "neu" ? "primary" : "dark"} onClick={() => onAdvance(o.no)}>
                        {c.action}
                      </Btn>
                    </div>
                  </li>
                );
              })}
              {list.length === 0 && <li className="px-2 py-6 text-center text-[13px] text-bo-muted">Nichts offen.</li>}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function OrdersTable({ orders }: { orders: Order[] }) {
  const [filter, setFilter] = useState<"alle" | Mode>("alle");
  const list = orders.filter((o) => filter === "alle" || o.mode === filter);
  return (
    <Panel
      flush
      title="Heute"
      aside={
        <div className="flex gap-1">
          {(["alle", "abholung", "lieferung"] as const).map((f) => (
            <Btn key={f} size="sm" variant={filter === f ? "dark" : "quiet"} onClick={() => setFilter(f)} aria-pressed={filter === f}>
              {f === "alle" ? "Alle" : f === "abholung" ? "Abholung" : "Lieferung"}
            </Btn>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-[13.5px]">
          <thead>
            <tr>
              {["Nr.", "Eingang", "Gast", "Art", "Artikel", "Zahlung", "Status"].map((h) => (
                <th key={h} className={th}>
                  {h}
                </th>
              ))}
              <th className={cx(th, "text-right")}>Summe</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.no} className={tr}>
                <td className={cx(td, "font-plex-mono text-bo-ink")}>#{o.no}</td>
                <td className={cx(td, "num")}>{hm(o.at)}</td>
                <td className={cx(td, "text-bo-ink")}>{o.customer}</td>
                <td className={td}>{o.mode === "abholung" ? "Abholung" : "Lieferung"}</td>
                <td className={cx(td, "num")}>{o.lines.reduce((n, l) => n + l.qty, 0)}</td>
                <td className={td}>{o.pay}</td>
                <td className={td}>
                  <Tag tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Tag>
                </td>
                <td className={cx(td, "num text-right font-medium text-bo-ink")}>{eur(o.total)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-bo-line bg-bo-bg/60">
              <td className={cx(td, "text-bo-muted")} colSpan={7}>
                {list.length} Bestellungen
              </td>
              <td className={cx(td, "num text-right font-semibold text-bo-ink")}>{eur(list.reduce((s, o) => s + o.total, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Panel>
  );
}

function MenuEditor({ dishes, soldOut, onPrice, onSoldOut }: { dishes: Dish[]; soldOut: Record<string, boolean>; onPrice: (id: string, p: number) => void; onSoldOut: (id: string, v: boolean) => void }) {
  const { toast } = useDemo();
  return (
    <Panel flush tour="karte" title="Artikel" aside="Änderungen gelten sofort auf der Bestellseite">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[520px] text-[13.5px]">
          <thead>
            <tr>
              <th className={th}>Artikel</th>
              <th className={th}>Kategorie</th>
              <th className={th}>Preis</th>
              <th className={cx(th, "text-right")}>Verfügbar</th>
            </tr>
          </thead>
          <tbody>
            {dishes.map((d) => (
              <tr key={d.id} className={tr}>
                <td className={td}>
                  <p className="font-medium text-bo-ink">{d.name}</p>
                  <p className="max-w-[28rem] truncate text-[12.5px] text-bo-muted">{d.desc}</p>
                </td>
                <td className={td}>{d.cat}</td>
                <td className={td}>
                  <label className="flex w-24 items-center rounded-md border border-bo-line bg-white focus-within:border-bo-ink">
                    <span className="sr-only">Preis für {d.name}</span>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={d.price}
                      onChange={(e) => onPrice(d.id, Math.max(0, Number(e.target.value)))}
                      className="num min-h-9 w-full bg-transparent pl-2 text-right text-[16px] text-bo-ink outline-none sm:text-[13.5px]"
                    />
                    <span className="px-2 text-bo-muted">€</span>
                  </label>
                </td>
                <td className={cx(td, "text-right")}>
                  <span className="inline-flex items-center gap-2">
                    {soldOut[d.id] && <Tag tone="bad">Ausverkauft</Tag>}
                    <Toggle
                      checked={!soldOut[d.id]}
                      label={`${d.name} verfügbar`}
                      onChange={(v) => {
                        onSoldOut(d.id, !v);
                        toast(v ? `${d.name} ist wieder bestellbar.` : `${d.name} ist auf der Bestellseite als „Heute aus“ markiert.`);
                      }}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function Numbers({ orders }: { orders: Order[] }) {
  // Tagesverlauf aus einem typischen Profil bis zur aktuellen Stunde + alles, was in der Demo dazukommt.
  // Vor der Öffnung zeigt die Auswertung den gestrigen Tag.
  const live = orders.filter((o) => o.own);
  const profile = [2, 9, 7, 3, 1, 1, 4, 8, 10, 9, 6, 2];
  const hour = new Date().getHours();
  const open = Math.min(Math.max(hour - 10, 0), profile.length);
  const today = open > 0;
  const hours = profile.map((v, i) => ({ label: String(11 + i), value: !today ? v : i < open - 1 ? v : i === open - 1 ? Math.ceil(v / 2) + live.length : 0 }));
  const count = hours.reduce((n, h) => n + h.value, 0);
  const revenue = (count - live.length) * 27.6 + live.reduce((s, o) => s + o.total, 0);
  const month = 14820 + live.reduce((s, o) => s + o.total, 0);
  return (
    <div className="space-y-4">
      <Figures
        tour="zahlen"
        items={[
          { label: today ? "Umsatz heute" : "Umsatz gestern", value: eur(revenue), note: today ? "bis jetzt" : "heute noch nicht geöffnet" },
          { label: "Bestellungen", value: count, note: "davon 61 % Abholung" },
          { label: "Durchschnittsbon", value: eur(revenue / Math.max(count, 1)) },
          { label: "Zubereitung im Schnitt", value: "14 Min.", note: "Ziel: unter 18 Min." },
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Bestellungen je Stunde" aside={today ? "heute" : "gestern"}>
          <Bars label="Bestellungen je Stunde" data={hours} mark={today ? open - 1 : 8} />
        </Panel>
        <Panel title="Meistbestellt diese Woche">
          <Ranks
            data={[
              { label: "Margherita", value: 86 },
              { label: "Diavola", value: 71 },
              { label: "Bufala", value: 54 },
              { label: "Tiramisù", value: 49 },
              { label: "Tagliatelle al Ragù", value: 33 },
            ]}
            format={(n) => `${n}×`}
          />
        </Panel>
      </div>
      <Panel title="Eigene Seite statt Plattform" aside={`Rechenbeispiel für diesen Monat`}>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-[12px] text-bo-muted">Online-Umsatz im laufenden Monat</p>
            <p className="num text-[1.2rem] font-semibold text-bo-ink">{eur0(month)}</p>
          </div>
          <div>
            <p className="text-[12px] text-bo-muted">Provision einer Plattform bei 14 %</p>
            <p className="num text-[1.2rem] font-semibold text-bo-bad">− {eur0(month * 0.14)}</p>
          </div>
          <div>
            <p className="text-[12px] text-bo-muted">Bleibt mit eigenem System im Betrieb</p>
            <p className="num text-[1.2rem] font-semibold text-bo-ok">+ {eur0(month * 0.14)}</p>
          </div>
        </div>
        <p className="mt-3 text-[12.5px] text-bo-muted">Die Provision ist eine Annahme zum Vergleich; Plattformen berechnen je nach Vertrag unterschiedlich viel.</p>
      </Panel>
    </div>
  );
}

function SettingsPanel({ settings, onSettings }: { settings: Settings; onSettings: (s: Settings) => void }) {
  const numField = (label: string, key: "minOrder" | "fee" | "freeFrom", hint: string) => (
    <Field label={label} hint={hint}>
      <span className="flex items-center rounded-md border border-[#cfd3db] bg-white focus-within:border-bo-ink">
        <input type="number" inputMode="decimal" min="0" step="0.5" value={settings[key]} onChange={(e) => onSettings({ ...settings, [key]: Math.max(0, Number(e.target.value)) })} className="num min-h-11 w-full bg-transparent px-3 text-[16px] text-bo-ink outline-none sm:min-h-9 sm:text-[14px]" />
        <span className="px-3 text-bo-muted">€</span>
      </span>
    </Field>
  );
  const days = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Lieferung" aside="wirkt sofort im Warenkorb">
        <div className="grid gap-3 sm:grid-cols-3">
          {numField("Mindestbestellwert", "minOrder", "nur Lieferung")}
          {numField("Liefergebühr", "fee", "je Bestellung")}
          {numField("Gratis ab", "freeFrom", "Warenwert")}
        </div>
        <p className="mt-4 text-[13px] text-bo-muted">Liefergebiet: Musterstadt-Mitte, Nord und Lindenviertel (PLZ 12345, 12347).</p>
      </Panel>
      <Panel flush title="Öffnungszeiten">
        <table className="w-full text-[13.5px]">
          <tbody>
            {days.map((d, i) => (
              <tr key={d} className={i ? tr : ""}>
                <td className={cx(td, "text-bo-ink")}>{d}</td>
                <td className={cx(td, "num text-right")}>{i === 0 ? <Tag>Ruhetag</Tag> : i > 4 ? "12:00 – 23:00" : "11:30 – 14:30 · 17:00 – 22:30"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
