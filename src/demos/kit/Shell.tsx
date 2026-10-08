"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Calculator, Check, CirclePlay, Info, MessageCircle, Monitor, RotateCcw, Smartphone, X } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { site } from "@/config/site";
import { DemoContext, type DemoCtx } from "@/demos/kit/context";
import { Tour } from "@/demos/kit/Tour";
import type { DemoDef, DemoSlug } from "@/demos/registry";
import { formatEUR } from "@/lib/format";
import { track } from "@/lib/track";

/**
 * Hülle jeder Demo: schmale TasWiq-Leiste (Ansicht wechseln, Web/Handy, Tour, Infos, Anfrage), darunter die App der Musterfirma.
 * Die Leiste ist bewusst im TasWiq-Look gehalten, die App darunter im Look der Musterfirma – so bleibt klar, was Demo ist.
 * Die Apps laufen nur im Browser (Daten relativ zu "heute", nichts wird gespeichert) und werden je Demo einzeln nachgeladen.
 * Umschalter „Web / Handy": dieselbe App am Desktop im Telefon-Rahmen – die Apps richten sich nach ihrem Rahmen (Container-Queries),
 * deshalb genügt es, den Rahmen zu wechseln. Dialoge der App rendert die Handy-Ansicht im Rahmen (siehe kit/context.tsx → frame).
 */
const loading = () => (
  <div className="grid min-h-[70dvh] place-items-center text-sm text-muted" role="status">
    Demo wird geladen …
  </div>
);
const APPS: Record<DemoSlug, ComponentType> = {
  restaurant: dynamic(() => import("@/demos/apps/restaurant"), { ssr: false, loading }),
  friseur: dynamic(() => import("@/demos/apps/friseur"), { ssr: false, loading }),
  immobilien: dynamic(() => import("@/demos/apps/immobilien"), { ssr: false, loading }),
  werkstatt: dynamic(() => import("@/demos/apps/werkstatt"), { ssr: false, loading }),
  steuerkanzlei: dynamic(() => import("@/demos/apps/steuerkanzlei"), { ssr: false, loading }),
  handwerk: dynamic(() => import("@/demos/apps/handwerk"), { ssr: false, loading }),
};

type Pricing = { start: number; shown: number; rent: number };
type Device = "web" | "handy";

export function DemoShell({ def, pricing, industryHref, industryLabel, children }: { def: DemoDef; pricing: Pricing; industryHref: string; industryLabel: string; children?: React.ReactNode }) {
  const App = APPS[def.slug];
  const [view, setView] = useState(def.views[0].id);
  const [tabs, setTabs] = useState<Record<string, string>>(() => Object.fromEntries(def.views.map((v) => [v.id, v.tab])));
  const [welcome, setWelcome] = useState(false);
  const [info, setInfo] = useState(false);
  const [tour, setTour] = useState<number | null>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [run, setRun] = useState(0);
  const [device, setDevice] = useState<Device>("web");
  const [frame, setFrame] = useState<HTMLElement | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const go = useCallback((v: string, tab?: string) => {
    setView(v);
    if (tab) setTabs((t) => ({ ...t, [v]: tab }));
  }, []);
  const setTab = useCallback((tab: string) => setTabs((t) => ({ ...t, [view]: tab })), [view]);
  const showToast = useCallback((text: string) => {
    setToast({ id: Date.now(), text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  // Deep-Links für den Vertrieb: ?ansicht=betrieb öffnet direkt das Dashboard, ?tour=0 überspringt die Begrüßung, ?tour=1 startet die Tour, ?geraet=handy zeigt den Telefon-Rahmen.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const v = q.get("ansicht");
    if (v && def.views.some((x) => x.id === v)) setView(v);
    const b = q.get("bereich");
    if (b) setTabs((t) => ({ ...t, [v && def.views.some((x) => x.id === v) ? v : def.views[0].id]: b }));
    const g = q.get("geraet");
    if (g === "handy" || g === "web") setDevice(g);
    const t = q.get("tour");
    if (t === "1") setTour(0);
    else if (t !== "0") setWelcome(true);
  }, [def]);

  // Tour-Schritt → passende Ansicht und Bereich öffnen
  useEffect(() => {
    if (tour === null) return;
    const s = def.tour[tour];
    go(s.view, s.tab);
  }, [tour, def, go]);

  const startTour = () => {
    setWelcome(false);
    setInfo(false);
    setTour(0);
    track("demo_tour_start");
  };
  const reset = () => {
    setRun((r) => r + 1);
    setView(def.views[0].id);
    setTabs(Object.fromEntries(def.views.map((v) => [v.id, v.tab])));
    showToast("Demo zurückgesetzt – alle Eingaben sind gelöscht.");
  };
  const switchDevice = (d: Device) => {
    setDevice(d);
    if (d === "handy") track("demo_device_handy");
  };

  // Im Telefon-Rahmen scrollt die Fläche im Rahmen, sonst das Fenster
  const toTop = useCallback(() => {
    const box = frame?.firstElementChild;
    if (box) box.scrollTo({ top: 0 });
    else window.scrollTo({ top: 0 });
  }, [frame]);
  // Ansicht oder Bereich gewechselt → oben beginnen (nicht beim ersten Aufbau; während der Tour holt sie ihr Ziel selbst in den Blick)
  const tab = tabs[view] ?? "";
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    toTop();
  }, [view, tab, toTop]);

  const ctx = useMemo<DemoCtx>(() => ({ def, view, tab, go, setTab, toast: showToast, toTop, frame }), [def, view, tab, go, setTab, showToast, toTop, frame]);
  const theme = {
    "--d-accent": def.theme.accent,
    "--d-on": def.theme.on,
    "--d-soft": def.theme.soft,
    "--d-deep": def.theme.deep,
    "--d-display": def.theme.display,
    "--d-ui": def.theme.ui,
    "--app-h": device === "handy" ? "100%" : "calc(100dvh - var(--bar-h))",
    "--color-bo-bg": def.theme.bo.bg,
    "--color-bo-line": def.theme.bo.line,
    "--color-bo-ink": def.theme.bo.ink,
    "--bo-r": def.theme.bo.r,
    "--bo-rc": def.theme.bo.rc,
    "--bo-side": def.theme.bo.side,
    "--bo-side-ink": def.theme.bo.sideInk,
    "--bo-title-tt": def.theme.bo.caps ? "uppercase" : "none",
    "--bo-title-ls": def.theme.bo.caps ? "0.01em" : "-0.02em",
    "--d-focus": def.theme.focus ?? def.theme.deep,
    "--d-cta": def.theme.cta ?? def.theme.accent,
  } as React.CSSProperties;

  return (
    <DemoContext.Provider value={ctx}>
      <div className="[--bar-h:6.25rem] md:[--bar-h:3.25rem]">
        <header className="sticky top-0 z-40 bg-night text-white">
          <div className="flex h-[3.25rem] items-center gap-2 px-3 sm:gap-3 sm:px-4">
            <Link href="/demo" className="-ml-1 flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-1 text-sm font-medium text-white/80 hover:text-white" aria-label="Zurück zur Demo-Übersicht von TasWiq Media">
              <LogoMark className="h-6" />
              <span className="hidden lg:inline">Demos</span>
            </Link>
            <span className="h-5 w-px bg-white/15" aria-hidden />
            <p className="min-w-0 flex-1 truncate text-sm md:max-w-[9.5rem] md:flex-none xl:max-w-none">
              <span className="font-medium">{def.firm}</span>
              <span className="ml-2 hidden rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/75 sm:inline md:hidden xl:inline">Musterfirma</span>
            </p>
            <ViewSwitch def={def} view={view} onChange={(v) => go(v)} className="mx-auto hidden md:flex" />
            <div className="flex shrink-0 items-center gap-1 md:ml-auto">
              <DeviceSwitch device={device} onChange={switchDevice} className="mr-1 hidden md:flex" />
              <button type="button" onClick={startTour} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white">
                <CirclePlay className="size-4" aria-hidden /> <span className="md:max-lg:sr-only">Tour</span>
              </button>
              <button type="button" onClick={() => setInfo(true)} aria-expanded={info} className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white">
                <Info className="size-4" aria-hidden /> <span className="hidden xl:inline">Was ist möglich?</span>
                <span className="md:max-lg:sr-only xl:hidden">Infos</span>
              </button>
              <Link href="/#kontakt" prefetch={false} onClick={() => track("demo_cta")} className="ml-1 hidden min-h-9 items-center gap-1.5 rounded-full bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600 lg:inline-flex">
                Für meinen Betrieb <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 px-3 py-1.5 md:hidden">
            <ViewSwitch def={def} view={view} onChange={(v) => go(v)} className="flex w-full" />
          </div>
        </header>

        <main id="main">
          {device === "handy" ? (
            <div className="flex justify-center bg-[#e9edf2] px-4 py-5 md:py-7">
              {/* Telefon-Rahmen: die App richtet sich nach der schmalen Fläche (Container-Queries), nicht nach dem Fenster */}
              <div className="relative rounded-[2.6rem] bg-[#0c0d10] px-[11px] py-[15px] shadow-[0_24px_60px_-18px_rgb(17_17_19/0.4)]" style={{ height: "min(52rem, calc(100dvh - var(--bar-h) - 2.5rem))" }}>
                <span className="absolute top-[6px] left-1/2 h-[3px] w-14 -translate-x-1/2 rounded-full bg-white/25" aria-hidden />
                <span className="absolute top-[5px] left-[calc(50%+3.25rem)] size-[5px] rounded-full bg-white/15" aria-hidden />
                <div ref={setFrame} style={{ ...theme, "--bar-h": "0px" } as React.CSSProperties} className="demo-app @container relative h-full w-[23rem] max-w-full overflow-hidden rounded-[2.1rem] bg-white [transform:translateZ(0)]">
                  <div className="h-full overflow-x-hidden overflow-y-auto overscroll-contain">
                    <App key={run} />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={theme} className="demo-app @container min-h-[calc(100dvh-var(--bar-h))] bg-white">
              <App key={run} />
            </div>
          )}
          {/* Auf dem Server gerenderter Text zur Demo (Hauptüberschrift, Funktionen, Kosten, weiterführende Links) */}
          {children}
        </main>
      </div>

      {/* Info-Panel: immer im Dokument (auch für Suchmaschinen), nur eingefahren */}
      <div className={`fixed inset-0 z-[55] bg-ink/45 transition-opacity duration-200 ${info ? "opacity-100" : "pointer-events-none opacity-0"}`} onClick={() => setInfo(false)} aria-hidden />
      <InfoPanel def={def} pricing={pricing} industryHref={industryHref} industryLabel={industryLabel} open={info} onClose={() => setInfo(false)} onTour={startTour} onReset={reset} />

      {welcome && <Welcome def={def} onTour={startTour} onSkip={() => setWelcome(false)} />}

      {tour !== null && (
        <Tour
          steps={def.tour}
          index={tour}
          onIndex={setTour}
          onClose={() => setTour(null)}
          onDone={() => {
            setTour(null);
            track("demo_tour_done");
            showToast("Tour beendet. Probier jetzt alles selbst aus – „Was ist möglich?“ zeigt, was sich anpassen lässt.");
          }}
        />
      )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex justify-center px-4">
        {toast && (
          <p key={toast.id} className="pointer-events-auto max-w-md animate-demo-in rounded-xl bg-night px-4 py-3 text-sm leading-snug text-white shadow-[var(--shadow-float)]">
            {toast.text}
          </p>
        )}
      </div>
    </DemoContext.Provider>
  );
}

function ViewSwitch({ def, view, onChange, className }: { def: DemoDef; view: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div role="group" aria-label="Ansicht wechseln" className={`gap-0.5 rounded-full bg-white/10 p-0.5 ${className ?? ""}`}>
      {def.views.map((v) => (
        <button
          key={v.id}
          type="button"
          aria-pressed={view === v.id}
          onClick={() => onChange(v.id)}
          className={`min-h-9 flex-1 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors md:flex-none md:max-lg:px-2.5 ${view === v.id ? "bg-white text-ink" : "text-white/75 hover:text-white"}`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

/** „Web / Handy": dieselbe Demo vollbreit oder im Telefon-Rahmen (nur am Desktop sinnvoll, echte Handys sind schon schmal) */
function DeviceSwitch({ device, onChange, className }: { device: Device; onChange: (d: Device) => void; className?: string }) {
  const opts = [
    { id: "web" as const, label: "Web", icon: Monitor },
    { id: "handy" as const, label: "Handy", icon: Smartphone },
  ];
  return (
    <div role="group" aria-label="Gerät wechseln" className={`gap-0.5 rounded-full bg-white/10 p-0.5 ${className ?? ""}`}>
      {opts.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={device === o.id}
          onClick={() => onChange(o.id)}
          className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium whitespace-nowrap transition-colors ${device === o.id ? "bg-white text-ink" : "text-white/75 hover:text-white"}`}
        >
          <o.icon className="size-4" aria-hidden /> <span className="md:max-xl:sr-only">{o.label}</span>
        </button>
      ))}
    </div>
  );
}

function Welcome({ def, onTour, onSkip }: { def: DemoDef; onTour: () => void; onSkip: () => void }) {
  const primary = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    primary.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onSkip();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSkip]);
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/55 p-0 sm:items-center sm:p-6" onClick={(e) => e.target === e.currentTarget && onSkip()}>
      <div role="dialog" aria-modal="true" aria-labelledby="demo-welcome-title" className="w-full max-w-lg animate-demo-in rounded-t-[1.75rem] bg-white p-6 shadow-[var(--shadow-float)] sm:rounded-[1.75rem] sm:p-8">
        <p className="text-[13px] font-medium text-brand-600">
          {def.kind} · Demo von TasWiq Media
        </p>
        <h2 id="demo-welcome-title" className="mt-2 text-[1.7rem] leading-[1.1] font-medium text-balance text-ink">
          Willkommen bei {def.firm}.
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-body">
          {def.firm} ist eine Musterfirma: Namen, Kunden und Zahlen sind erfunden. Du siehst zwei Seiten desselben Systems – was Kunden sehen und womit der Betrieb arbeitet. Klick dich durch, es kann nichts kaputtgehen und nichts wird gespeichert.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button ref={primary} type="button" onClick={onTour} className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 font-medium text-white hover:bg-brand-600">
            <CirclePlay className="size-4" aria-hidden /> Kurze Tour ({def.tour.length} Schritte)
          </button>
          <button type="button" onClick={onSkip} className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full border border-line px-5 font-medium text-ink hover:border-brand-200">
            Selbst umsehen
          </button>
        </div>
        <p className="mt-4 text-xs text-muted">Die Tour kannst du jederzeit abbrechen oder später oben über „Tour“ starten. Am Desktop zeigt „Handy“ dieselbe Demo im Telefon-Rahmen.</p>
      </div>
    </div>
  );
}

function InfoPanel({
  def,
  pricing,
  industryHref,
  industryLabel,
  open,
  onClose,
  onTour,
  onReset,
}: {
  def: DemoDef;
  pricing: Pricing;
  industryHref: string;
  industryLabel: string;
  open: boolean;
  onClose: () => void;
  onTour: () => void;
  onReset: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <aside
      aria-labelledby="demo-info-title"
      inert={!open}
      className={`fixed inset-y-0 right-0 z-[56] flex w-full max-w-[30rem] flex-col bg-white shadow-[var(--shadow-float)] transition-transform duration-300 ease-[var(--ease-soft)] ${open ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
        <div>
          <p className="text-[13px] font-medium text-brand-600">{def.kind} · Demo</p>
          <h2 id="demo-info-title" className="mt-1 text-xl leading-snug font-medium text-ink">
            {def.title}
          </h2>
        </div>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Infos schließen" className="-mr-2 grid size-11 shrink-0 place-items-center rounded-full text-muted hover:bg-canvas hover:text-ink">
          <X className="size-5" aria-hidden />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 text-[14.5px] leading-relaxed text-body">
        <p>{def.summary}</p>
        <p className="mt-3 rounded-2xl bg-canvas px-4 py-3 text-[13.5px]">
          Die Demo ist ein Beispiel, kein fertiges Produkt von der Stange. Dein System bauen wir um deine Abläufe: andere Branche, andere Felder, andere Regeln – das Prinzip bleibt.
        </p>

        <h3 className="mt-7 text-sm font-semibold text-ink">Das zeigt die Demo</h3>
        <ul className="mt-3 space-y-2.5">
          {def.features.map((f) => (
            <li key={f.title} className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-mint-500" strokeWidth={2.5} aria-hidden />
              <span>
                <span className="font-medium text-ink">{f.title}.</span> {f.text}
              </span>
            </li>
          ))}
        </ul>

        <h3 className="mt-7 text-sm font-semibold text-ink">Das lässt sich ergänzen</h3>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {def.options.map((o) => (
            <li key={o} className="rounded-full border border-line px-3 py-1.5 text-[13px] leading-snug">
              {o}
            </li>
          ))}
        </ul>

        <h3 className="mt-7 text-sm font-semibold text-ink">Passt genauso für</h3>
        <dl className="mt-3 divide-y divide-line border-y border-line">
          {def.fits.map((f) => (
            <div key={f.who} className="py-2.5">
              <dt className="font-medium text-ink">{f.who}</dt>
              <dd className="text-[13.5px] text-muted">{f.how}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-[13.5px]">
          Mehr dazu:{" "}
          <a href={industryHref} className="font-medium text-brand-600 underline decoration-brand-200 underline-offset-2 hover:text-brand-700">
            {industryLabel}
          </a>
        </p>

        <h3 className="mt-7 text-sm font-semibold text-ink">Kostenrahmen</h3>
        <p className="num mt-2">
          Einstieg ab <strong className="font-semibold text-ink">{formatEUR(pricing.start)}</strong> einmalig oder ab <strong className="font-semibold text-ink">{formatEUR(pricing.rent)}</strong> im Monat zur Miete.
          {pricing.shown > pricing.start && <> Im Umfang dieser Demo ab {formatEUR(pricing.shown)}.</>} Den Festpreis gibt es nach dem Prototyp.
        </p>

        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-1 border-t border-line pt-4 text-[13.5px]">
          <button type="button" onClick={onTour} className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink hover:text-brand-600">
            <CirclePlay className="size-4" aria-hidden /> Tour starten
          </button>
          <button
            type="button"
            onClick={() => {
              onReset();
              onClose();
            }}
            className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink hover:text-brand-600"
          >
            <RotateCcw className="size-4" aria-hidden /> Demo zurücksetzen
          </button>
          <Link href="/demo" className="inline-flex min-h-11 items-center gap-1.5 font-medium text-ink hover:text-brand-600">
            Andere Demos <ArrowUpRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>

      <div className="grid gap-2 border-t border-line bg-canvas px-6 py-4 sm:grid-cols-2">
        <Link href="/#kontakt" prefetch={false} onClick={() => track("demo_cta")} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-500 px-5 font-medium text-white hover:bg-brand-600 sm:col-span-2">
          So ein System für meinen Betrieb <ArrowRight className="size-4" aria-hidden />
        </Link>
        <Link href="/preisrechner" prefetch={false} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:border-brand-200">
          <Calculator className="size-4" aria-hidden /> Kosten berechnen
        </Link>
        <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-medium text-ink hover:border-brand-200">
          <MessageCircle className="size-4 text-mint-500" aria-hidden /> WhatsApp
        </a>
      </div>
    </aside>
  );
}
