"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowLeft, ArrowRight, Ban, CircleCheck, CircleMinus, CircleX, ExternalLink, Eye, EyeOff, Globe, Link2, List, ListChecks, Map as MapIcon, Maximize, Minus, MousePointerClick, Plus, RefreshCw, Search, TriangleAlert, X, type LucideIcon } from "lucide-react";
import { rescanSite } from "@/app/admin/actions";
import { IndexView, KeywordView, TodayView } from "@/components/admin/SiteReportViews";
import type { SiteReport } from "@/lib/admin/site-findings";
import type { GroupId, PageLink, PageNode, SiteStructure, Verdict } from "@/lib/admin/site-structure";
import { cn, formatDateTime, formatNumber } from "@/lib/format";

/**
 * Seitenstruktur: Karte (Startseite in der Mitte, Seiten nach Bereich gruppiert) und Liste derselben Daten.
 * Erster Blick = Ampel je Seite. Tiefe erst auf Klick: Die gewählte Seite zeigt ihre Links als Linien
 * und rechts ihre Call-to-Actions, Ziele und Herkunft. Ohne Auswahl stehen rechts die Auffälligkeiten.
 */

const GROUPS: { id: GroupId; label: string }[] = [
  { id: "angebot", label: "Angebot" },
  { id: "branchen", label: "Branchen" },
  { id: "leistungen", label: "Leistungen" },
  { id: "ratgeber", label: "Ratgeber" },
  { id: "demos", label: "Demos" },
  { id: "rechtliches", label: "Rechtliches" },
  { id: "sonstige", label: "Sonstige" },
];
const GROUP_LABEL = Object.fromEntries([["start", "Start"], ...GROUPS.map((g) => [g.id, g.label])]) as Record<GroupId, string>;

const VERDICT: Record<Verdict, { icon: LucideIcon; tone: string; label: string }> = {
  ok: { icon: CircleCheck, tone: "text-emerald-600", label: "Führt zum Angebot" },
  schwach: { icon: TriangleAlert, tone: "text-amber-600", label: "Kein CTA im Inhalt" },
  sackgasse: { icon: Ban, tone: "text-danger", label: "Sackgasse" },
  neutral: { icon: CircleMinus, tone: "text-muted", label: "Pflichtseite" },
  fehler: { icon: CircleX, tone: "text-danger", label: "Nicht erreichbar" },
};

type Filter = "alle" | "ok" | "schwach" | "sackgasse" | "links";
const LINK_ISSUES = ["defekt", "anker", "verwaist", "fehler"];
type Mode = "heute" | "karte" | "liste" | "suchbegriffe" | "google";
type Note = { id: string; level: number; text: string };
type Stat = { views: number; visitors: number; entries: number; exits: number; search: number; ai: number };

/* ─── Karten-Layout: feste Maße, damit die Linien die Kacheln exakt treffen ─── */
const NODE = { w: 178, h: 36, gap: 8 };
const BOX = { pad: 12, head: 34 };
const HOME = { w: 172, h: 52 };
const GUTTER = 88;
const MARGIN = 32;
/** Breite des Detail-Panels, das auf großen Bildschirmen über der Karte liegt */
const PANEL = 420;

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function layout(pages: PageNode[]) {
  const clusters = GROUPS.map((g) => ({ ...g, pages: pages.filter((p) => p.group === g.id) }))
    .filter((c) => c.pages.length)
    .map((c) => {
      const cols = c.pages.length > 3 ? 2 : 1;
      const rows = Math.ceil(c.pages.length / cols);
      return { ...c, cols, w: cols * NODE.w + (cols - 1) * NODE.gap + BOX.pad * 2, h: BOX.head + rows * (NODE.h + NODE.gap) - NODE.gap + BOX.pad, side: 1 as 1 | -1 };
    });
  // Größte Gruppe zuerst verteilen, jeweils auf die kürzere Seite – so bleibt die Karte ausgewogen.
  const height = { [-1]: 0, [1]: 0 } as Record<number, number>;
  for (const c of [...clusters].sort((a, b) => b.h - a.h)) {
    c.side = height[1] <= height[-1] ? 1 : -1;
    height[c.side] += c.h + 28;
  }
  const rects = new Map<string, Rect>();
  const boxes: (Rect & { id: GroupId; label: string; count: number; side: number })[] = [];
  for (const side of [-1, 1]) {
    let y = -(height[side] - 28) / 2;
    for (const c of clusters.filter((k) => k.side === side)) {
      const x = side === 1 ? HOME.w / 2 + GUTTER : -HOME.w / 2 - GUTTER - c.w;
      boxes.push({ x, y, w: c.w, h: c.h, id: c.id, label: c.label, count: c.pages.length, side });
      c.pages.forEach((p, i) => rects.set(p.path, { x: x + BOX.pad + (i % c.cols) * (NODE.w + NODE.gap), y: y + BOX.head + Math.floor(i / c.cols) * (NODE.h + NODE.gap), w: NODE.w, h: NODE.h }));
      y += c.h + 28;
    }
  }
  const home = pages.find((p) => p.group === "start");
  if (home) rects.set(home.path, { x: -HOME.w / 2, y: -HOME.h / 2, w: HOME.w, h: HOME.h });
  const all = [...boxes, ...rects.values()];
  const minX = Math.min(...all.map((r) => r.x)) - MARGIN;
  const minY = Math.min(...all.map((r) => r.y)) - MARGIN;
  for (const r of all) {
    r.x -= minX;
    r.y -= minY;
  }
  return { rects, boxes, w: Math.max(...all.map((r) => r.x + r.w)) + MARGIN, h: Math.max(...all.map((r) => r.y + r.h)) + MARGIN };
}

/** Geschwungene Linie zwischen zwei Kacheln – Start und Ziel jeweils an der zugewandten Seite. */
function curve(a: Rect, b: Rect) {
  const ay = a.y + a.h / 2;
  const by = b.y + b.h / 2;
  if (Math.abs(a.x - b.x) < 4) {
    // Gleiche Spalte: Bogen rechts außen herum
    const x = a.x + a.w;
    const bend = 28 + Math.min(60, Math.abs(by - ay) / 4);
    return `M${x},${ay} C${x + bend},${ay} ${x + bend},${by} ${x + 2},${by}`;
  }
  const right = b.x > a.x;
  const sx = right ? a.x + a.w : a.x;
  const tx = right ? b.x - 2 : b.x + b.w + 2;
  const d = Math.max(36, Math.abs(tx - sx) / 2);
  return `M${sx},${ay} C${sx + (right ? d : -d)},${ay} ${tx + (right ? -d : d)},${by} ${tx},${by}`;
}

function RescanButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink hover:border-brand-200 disabled:opacity-60">
      <RefreshCw className={cn("size-4", pending && "animate-spin")} aria-hidden /> {pending ? "Liest ein …" : "Neu einlesen"}
    </button>
  );
}

const target = (l: PageLink) => `${l.to}${l.hash ? `#${l.hash}` : ""}`;

export function SiteMap({ data, report, error, locale }: { data: SiteStructure | null; report: SiteReport | null; error: string; locale: string }) {
  const pages = useMemo(() => data?.pages ?? [], [data]);
  const byPath = useMemo(() => new Map(pages.map((p) => [p.path, p])), [pages]);
  const map = useMemo(() => layout(pages), [pages]);
  // Befunde je Seite (für Karte, Liste und Detail-Panel)
  const notes = useMemo(() => {
    const m = new Map<string, Note[]>();
    for (const f of report?.findings ?? []) for (const i of f.items) if (i.path) m.set(i.path, [...(m.get(i.path) ?? []), { id: f.id, level: f.level, text: `${f.title.replace(/^\d+ /, "")}${i.note ? `: ${i.note}` : ""}` }]);
    return m;
  }, [report]);
  // Besucher je Seite und echte Klickwege der letzten 30 Tage
  const { stats, flows } = useMemo(() => {
    const norm = (x: string) => x.replace(/\/+$/, "") || "/";
    const stats = new Map<string, Stat>((report?.paths?.pages ?? []).map((x) => [norm(x.path), x]));
    const flows = new Map<string, Map<string, number>>();
    for (const t of report?.paths?.transitions ?? []) flows.set(norm(t.from), (flows.get(norm(t.from)) ?? new Map()).set(norm(t.to), t.n));
    return { stats, flows };
  }, [report]);
  const views = (path: string) => stats.get(path)?.views ?? 0;

  const [mode, setMode] = useState<Mode>("heute");
  const [filter, setFilter] = useState<Filter>("alle");
  const [query, setQuery] = useState("");
  const [sel, setSel] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 }>({ key: "depth", dir: 1 });
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const wrap = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; vx: number; vy: number; moved: boolean } | null>(null);
  const dragged = useRef(false);

  // Wer verlinkt wen (nur Inhalt – Menü und Footer stehen überall und würden jede Linie überdecken)
  const { outgoing, incoming } = useMemo(() => {
    const outgoing = new Map<string, string[]>();
    const incoming = new Map<string, string[]>();
    for (const p of pages) {
      const to = Array.from(new Set(p.links.filter((l) => l.kind === "seite" && byPath.has(l.to)).map((l) => l.to)));
      outgoing.set(p.path, to);
      for (const t of to) incoming.set(t, [...(incoming.get(t) ?? []), p.path]);
    }
    return { outgoing, incoming };
  }, [pages, byPath]);

  const withLinkIssue = useMemo(() => new Set(Array.from(notes).filter(([, list]) => list.some((n) => LINK_ISSUES.includes(n.id))).map(([path]) => path)), [notes]);
  const matches = useCallback(
    (p: PageNode) => {
      const q = query.trim().toLowerCase();
      if (q && !`${p.label} ${p.path} ${p.title}`.toLowerCase().includes(q)) return false;
      if (filter === "alle") return true;
      if (filter === "links") return withLinkIssue.has(p.path);
      return p.verdict === filter;
    },
    [filter, query, withLinkIssue],
  );

  const fit = useCallback(() => {
    const el = wrap.current;
    if (!el) return;
    const k = Math.min(el.clientWidth / map.w, el.clientHeight / map.h, 1);
    setView({ k, x: (el.clientWidth - map.w * k) / 2, y: (el.clientHeight - map.h * k) / 2 });
  }, [map.w, map.h]);
  const zoom = useCallback((factor: number, cx?: number, cy?: number) => {
    const el = wrap.current;
    if (!el) return;
    const px = cx ?? el.clientWidth / 2;
    const py = cy ?? el.clientHeight / 2;
    setView((v) => {
      const k = Math.min(1.6, Math.max(0.25, v.k * factor));
      return { k, x: px - (px - v.x) * (k / v.k), y: py - (py - v.y) * (k / v.k) };
    });
  }, []);

  useEffect(() => {
    if (mode === "karte") fit();
  }, [mode, fit]);
  useEffect(() => {
    const el = wrap.current;
    if (!el || mode !== "karte") return;
    // Strg/⌘ + Scrollen (und Pinch auf dem Trackpad) zoomt; normales Scrollen bleibt bei der Seite.
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      zoom(Math.exp(-e.deltaY * 0.01), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [mode, zoom]);

  const select = (path: string | null) => {
    setSel(path);
    setPreview(false);
    // Das Detail-Panel liegt rechts über der Karte – die gewählte Seite in den freien Teil schieben.
    const el = wrap.current;
    const r = path && map.rects.get(path);
    if (!el || !r) return;
    const free = el.clientWidth > 900 ? el.clientWidth - PANEL : el.clientWidth;
    setView((v) => {
      const cx = v.x + (r.x + r.w / 2) * v.k;
      const cy = v.y + (r.y + r.h / 2) * v.k;
      return { ...v, x: cx < 60 || cx > free - 60 ? v.x + free / 2 - cx : v.x, y: cy < 40 || cy > el.clientHeight - 40 ? v.y + el.clientHeight / 2 - cy : v.y };
    });
  };

  // Aus „Heute“ oder „Suchbegriffe“ zu einer Seite springen – auf dem Handy ist die Liste die bessere Ansicht.
  const open = (path: string) => {
    if (mode !== "karte" && mode !== "liste") setMode(window.innerWidth < 768 ? "liste" : "karte");
    setTimeout(() => select(path), 60);
  };

  if (!data || !report) {
    return (
      <div>
        <Header locale={locale} />
        <p className="mt-6 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Die Website konnte nicht eingelesen werden: {error} – bitte „Neu einlesen“ versuchen.
        </p>
      </div>
    );
  }

  const current = sel ? byPath.get(sel) : undefined;
  const out = new Set(current ? outgoing.get(current.path) : []);
  const inc = new Set(current ? incoming.get(current.path) : []);
  const count = (v: Verdict) => pages.filter((p) => p.verdict === v).length;
  const tiles: { id: Filter; label: string; value: number; hint: string; tone?: string }[] = [
    { id: "alle", label: "Seiten", value: pages.length, hint: `${pages.filter((p) => !p.noindex).length} für Google freigegeben` },
    { id: "ok", label: "Führen zum Angebot", value: count("ok"), hint: "CTA oder Formular im Inhalt", tone: "text-emerald-600" },
    { id: "schwach", label: "Ohne CTA im Inhalt", value: count("schwach"), hint: "nur über Menü oder Footer", tone: count("schwach") ? "text-amber-600" : undefined },
    { id: "sackgasse", label: "Sackgassen", value: count("sackgasse"), hint: "kein Link führt weiter", tone: count("sackgasse") ? "text-danger" : undefined },
    { id: "links", label: "Link-Probleme", value: withLinkIssue.size, hint: "defekt, Sprungmarke fehlt, nicht erreichbar", tone: withLinkIssue.size ? "text-danger" : undefined },
  ];

  const rows = pages.filter(matches).sort((a, b) => {
    const val = (p: PageNode): number | string =>
      sort.key === "label" ? p.label.toLowerCase() : sort.key === "group" ? p.group : sort.key === "in" ? (incoming.get(p.path)?.length ?? 0) : sort.key === "cta" ? p.links.filter((l) => l.offer).length : sort.key === "views" ? views(p.path) : sort.key === "search" ? (stats.get(p.path)?.search ?? 0) : sort.key === "notes" ? (notes.get(p.path)?.length ?? 0) : sort.key === "offer" ? (p.toOffer ?? 99) : (p.depth ?? 99);
    const [x, y] = [val(a), val(b)];
    return (x < y ? -1 : x > y ? 1 : 0) * sort.dir || a.label.localeCompare(b.label);
  });
  const th = (key: string, label: string, right = false) => (
    <th scope="col" aria-sort={sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none"} className={cn("px-3 py-2.5 font-semibold", right && "text-right")}>
      <button type="button" onClick={() => setSort((s) => ({ key, dir: s.key === key ? (s.dir === 1 ? -1 : 1) : 1 }))} className="cursor-pointer hover:text-ink">
        {label} {sort.key === key && <span aria-hidden>{sort.dir === 1 ? "↑" : "↓"}</span>}
      </button>
    </th>
  );

  return (
    <div>
      <Header locale={locale} scannedAt={data.scannedAt} />

      <div role="tablist" aria-label="Ansicht" className="mt-6 flex w-fit max-w-full overflow-x-auto rounded-full border border-line bg-white p-1">
        {(
          [
            ["heute", "Heute", ListChecks],
            ["karte", "Karte", MapIcon],
            ["liste", "Seiten", List],
            ["suchbegriffe", "Suchbegriffe", Search],
            ["google", "Google", Globe],
          ] as const
        ).map(([m, text, Icon]) => (
          <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("flex min-h-10 cursor-pointer items-center gap-2 rounded-full px-4 text-sm font-semibold whitespace-nowrap", mode === m ? "bg-night text-white" : "text-muted hover:text-ink")}>
            <Icon className="size-4" aria-hidden /> {text}
            {m === "heute" && report.findings.length > 0 && <span className={cn("num rounded-full px-1.5 text-[11px]", mode === m ? "bg-white/20" : "bg-canvas")}>{report.findings.length}</span>}
          </button>
        ))}
      </div>

      {mode === "heute" && <TodayView report={report} locale={locale} label={(path) => byPath.get(path)?.label ?? path} onSelect={open} onKeywords={() => setMode("suchbegriffe")} />}
      {mode === "google" && <IndexView site={data} onSelect={open} />}
      {mode === "suchbegriffe" && <KeywordView keywords={data.keywords} report={report} label={(path) => byPath.get(path)?.label ?? path} onSelect={open} />}

      {(mode === "karte" || mode === "liste") && (
        <>
      <div role="group" aria-label="Filter" className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-pressed={filter === t.id}
            onClick={() => setFilter(filter === t.id ? "alle" : t.id)}
            className={cn("cursor-pointer rounded-2xl border bg-white p-4 text-left transition-colors", filter === t.id ? "border-brand-500 ring-1 ring-brand-500" : "border-line hover:border-brand-200")}
          >
            <span className="block text-xs font-medium text-muted">{t.label}</span>
            <span className={cn("num mt-1 block text-2xl font-extrabold tracking-tight", t.tone ?? "text-ink")}>{formatNumber(t.value)}</span>
            <span className="mt-0.5 block text-xs text-muted">{t.hint}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="relative min-w-0 flex-1 basis-56">
          <span className="sr-only">Seite suchen</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Seite suchen …" className="min-h-11 w-full rounded-full border border-line bg-white pr-4 pl-10 text-sm text-ink placeholder:text-muted" />
        </label>
      </div>

      <div className={cn("relative mt-4 grid items-start gap-4", mode === "liste" && current && "xl:grid-cols-[minmax(0,1fr)_400px]")}>
        {mode === "karte" ? (
          <section aria-label="Karte der Seiten" className="overflow-hidden rounded-2xl border border-line bg-white">
            <div
              ref={wrap}
              className="relative h-[72dvh] min-h-[460px] cursor-grab touch-none overflow-hidden bg-canvas/60 active:cursor-grabbing"
              onPointerDown={(e) => {
                if (e.button === 0) drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y, moved: false };
              }}
              onPointerMove={(e) => {
                const d = drag.current;
                if (!d) return;
                const [dx, dy] = [e.clientX - d.x, e.clientY - d.y];
                if (!d.moved && Math.hypot(dx, dy) < 5) return;
                if (!d.moved) e.currentTarget.setPointerCapture(e.pointerId);
                d.moved = true;
                setView((v) => ({ ...v, x: d.vx + dx, y: d.vy + dy }));
              }}
              onPointerUp={() => {
                // Nach dem Ziehen folgt noch ein Klick – der soll keine Seite auswählen.
                dragged.current = Boolean(drag.current?.moved);
                drag.current = null;
                setTimeout(() => (dragged.current = false), 0);
              }}
              onPointerCancel={() => (drag.current = null)}
              onClickCapture={(e) => {
                if (!dragged.current) return;
                e.stopPropagation();
                e.preventDefault();
              }}
              onClick={() => select(null)}
            >
              <div className="absolute top-0 left-0 origin-top-left" style={{ width: map.w, height: map.h, transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})` }}>
                <svg width={map.w} height={map.h} className="absolute inset-0" aria-hidden>
                  {map.boxes.map((b) => {
                    const home = pages.find((p) => p.group === "start");
                    const h = home && map.rects.get(home.path);
                    if (!h) return null;
                    return <path key={b.id} d={curve(h, { x: b.x, y: b.y + b.h / 2 - 1, w: b.w, h: 2 })} fill="none" stroke="#d6d6dc" strokeWidth={1.5} />;
                  })}
                </svg>
                {map.boxes.map((b) => (
                  <div key={b.id} className="absolute rounded-2xl border border-line bg-white" style={{ left: b.x, top: b.y, width: b.w, height: b.h }}>
                    <p className="flex h-[34px] items-center justify-between px-3 text-[11px] font-semibold tracking-wider text-muted uppercase">
                      {b.label} <span className="num">{b.count}</span>
                    </p>
                  </div>
                ))}
                {pages.map((p) => {
                  const r = map.rects.get(p.path);
                  if (!r) return null;
                  const v = VERDICT[p.verdict];
                  const isHome = p.group === "start";
                  const related = !current || p.path === sel || out.has(p.path) || inc.has(p.path);
                  return (
                    <button
                      key={p.path}
                      type="button"
                      title={`${p.label} · ${v.label}`}
                      aria-pressed={p.path === sel}
                      onClick={(e) => {
                        e.stopPropagation();
                        select(p.path === sel ? null : p.path);
                      }}
                      style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
                      className={cn(
                        "absolute flex cursor-pointer items-center gap-2 px-2.5 text-left text-[12.5px] font-medium transition-[opacity,box-shadow,border-color] duration-200",
                        isHome ? "justify-center rounded-full bg-night text-[14px] font-bold text-white" : "rounded-lg border border-line bg-canvas text-ink hover:border-brand-300",
                        p.path === sel && "border-brand-500 ring-2 ring-brand-500",
                        current && p.path !== sel && out.has(p.path) && "border-brand-300 bg-brand-50",
                        (!matches(p) || !related) && "opacity-25",
                      )}
                    >
                      <v.icon className={cn("size-3.5 shrink-0", isHome && p.verdict === "ok" ? "text-mint-400" : v.tone)} aria-hidden />
                      <span className="truncate">{p.label}</span>
                      <span className="sr-only">– {v.label}</span>
                    </button>
                  );
                })}
                {current && map.rects.get(current.path) && (
                  <svg width={map.w} height={map.h} className="pointer-events-none absolute inset-0" aria-hidden>
                    <defs>
                      <marker id="pfeil-aus" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                        <path d="M0,0 L8,4 L0,8 z" fill="#7840fe" />
                      </marker>
                      <marker id="pfeil-ein" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
                        <path d="M0,0 L8,4 L0,8 z" fill="#6e6e73" />
                      </marker>
                    </defs>
                    {[...inc].filter((p) => !out.has(p)).map((p) => {
                      const r = map.rects.get(p);
                      return r ? <path key={`i${p}`} d={curve(r, map.rects.get(current.path)!)} fill="none" stroke="#6e6e73" strokeWidth={1.5} strokeDasharray="5 4" markerEnd="url(#pfeil-ein)" opacity={0.75} /> : null;
                    })}
                    {[...out].map((p) => {
                      const r = map.rects.get(p);
                      const n = flows.get(current.path)?.get(p) ?? 0;
                      if (!r) return null;
                      // Linienstärke = wie oft der Weg in 30 Tagen wirklich gegangen wurde
                      return (
                        <g key={`o${p}`}>
                          <path d={curve(map.rects.get(current.path)!, r)} fill="none" stroke="#7840fe" strokeWidth={n ? Math.min(6, 2 + Math.log2(n + 1) * 0.7) : 1.5} strokeOpacity={n ? 1 : 0.55} markerEnd="url(#pfeil-aus)" />
                          {n > 0 && (
                            <g transform={`translate(${r.x + r.w - 6}, ${r.y - 2})`}>
                              <rect x={-30} y={-9} width={30} height={16} rx={8} fill="#7840fe" />
                              <text x={-15} y={3} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">
                                {n > 999 ? "999+" : n}
                              </text>
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                )}
              </div>
              <div className="absolute right-3 bottom-3 flex overflow-hidden rounded-full border border-line bg-white shadow-[var(--shadow-soft)]" onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
                {(
                  [
                    ["Verkleinern", Minus, () => zoom(1 / 1.25)],
                    ["Vergrößern", Plus, () => zoom(1.25)],
                    ["Alles zeigen", Maximize, fit],
                  ] as const
                ).map(([label, Icon, fn]) => (
                  <button key={label} type="button" aria-label={label} title={label} onClick={fn} className="flex size-11 cursor-pointer items-center justify-center text-ink hover:bg-canvas">
                    <Icon className="size-4" aria-hidden />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line px-4 py-3 text-xs text-muted">
              {(["ok", "schwach", "sackgasse", "neutral"] as const).map((k) => {
                const v = VERDICT[k];
                return (
                  <span key={k} className="flex items-center gap-1.5">
                    <v.icon className={cn("size-3.5", v.tone)} aria-hidden /> {v.label}
                  </span>
                );
              })}
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-5 bg-brand-500" aria-hidden /> verlinkt auf (Zahl = Klicks in 30 Tagen)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-5 border-t-2 border-dashed border-muted" aria-hidden /> verlinkt von
              </span>
              <span className="ml-auto max-md:hidden">Ziehen verschiebt · Strg/⌘ + Scrollen zoomt · Klick auf eine Seite zeigt ihre Links</span>
            </div>
          </section>
        ) : (
          <section aria-label="Liste der Seiten" className="overflow-x-auto rounded-2xl border border-line bg-white">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead className="border-b border-line text-xs text-muted">
                <tr>
                  {th("label", "Seite")}
                  {th("group", "Bereich")}
                  <th scope="col" className="px-3 py-2.5 font-semibold">Bewertung</th>
                  {th("depth", "Klicks ab Start", true)}
                  {th("offer", "Bis zur Anfrage", true)}
                  {th("in", "Verlinkt von", true)}
                  {th("cta", "CTAs", true)}
                  {th("views", "Aufrufe 30 T.", true)}
                  {th("search", "über Suche", true)}
                  {th("notes", "Befunde", true)}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const v = VERDICT[p.verdict];
                  return (
                    <tr key={p.path} onClick={() => select(p.path)} className={cn("cursor-pointer border-b border-line last:border-0 hover:bg-canvas", p.path === sel && "bg-brand-50")}>
                      <td className="max-w-[320px] px-3 py-2.5">
                        <button type="button" className="block max-w-full cursor-pointer truncate text-left font-semibold text-ink" title={p.label}>
                          {p.label}
                        </button>
                        <span className="block truncate text-xs text-muted">{p.path}</span>
                      </td>
                      <td className="px-3 py-2.5 text-body">{GROUP_LABEL[p.group]}</td>
                      <td className="px-3 py-2.5">
                        <span className="flex items-center gap-1.5 whitespace-nowrap text-body">
                          <v.icon className={cn("size-4", v.tone)} aria-hidden /> {v.label}
                        </span>
                      </td>
                      <td className="num px-3 py-2.5 text-right">{p.depth ?? "–"}</td>
                      <td className="num px-3 py-2.5 text-right">{p.toOffer ?? "–"}</td>
                      <td className="num px-3 py-2.5 text-right">{incoming.get(p.path)?.length ?? 0}</td>
                      <td className="num px-3 py-2.5 text-right">{p.links.filter((l) => l.offer).length}</td>
                      <td className="num px-3 py-2.5 text-right">{formatNumber(views(p.path))}</td>
                      <td className="num px-3 py-2.5 text-right">{formatNumber(stats.get(p.path)?.search ?? 0)}</td>
                      <td className={cn("num px-3 py-2.5 text-right", notes.get(p.path)?.some((n) => n.level < 3) && "font-semibold text-amber-600")}>{notes.get(p.path)?.length ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length && <p className="px-4 py-6 text-sm text-muted">Keine Seite passt zu Suche und Filter.</p>}
          </section>
        )}

        {current && (
          <aside
            aria-label="Details zur Seite"
            className={cn(
              "rounded-2xl border border-line bg-white",
              mode === "karte" ? "xl:absolute xl:top-3 xl:right-3 xl:bottom-3 xl:w-[400px] xl:overflow-y-auto xl:shadow-[var(--shadow-float)]" : "xl:sticky xl:top-6 xl:max-h-[calc(100dvh-3rem)] xl:overflow-y-auto",
            )}
          >
            <PagePanel
              page={current}
              data={data}
              stat={stats.get(current.path)}
              flow={flows.get(current.path)}
              keywords={data.keywords.filter((k) => k.target === current.path)}
              from={incoming.get(current.path) ?? []}
              notes={notes.get(current.path) ?? []}
              label={(path) => byPath.get(path)?.label ?? path}
              known={(path) => byPath.has(path)}
              preview={preview}
              onPreview={() => setPreview((p) => !p)}
              onSelect={select}
            />
          </aside>
        )}
      </div>

        </>
      )}
    </div>
  );
}

function Header({ locale, scannedAt }: { locale: string; scannedAt?: string }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-brand-600">Kunden &amp; Website</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Seitenstruktur</h1>
        <p className="mt-1 text-sm text-muted">{scannedAt ? `Stand der Live-Seite, eingelesen am ${formatDateTime(scannedAt)}` : "Wie die Seiten zusammenhängen und wo ein Weg zum Angebot fehlt"}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <nav aria-label="Sprache der Website" className="flex rounded-full border border-line bg-white p-1">
          {[
            ["de", "Deutsch"],
            ["en", "Englisch"],
          ].map(([id, label]) => (
            <Link key={id} href={id === "de" ? "/admin/struktur" : `/admin/struktur?sprache=${id}`} aria-current={locale === id ? "page" : undefined} className={cn("flex min-h-9 items-center rounded-full px-4 text-sm font-semibold", locale === id ? "bg-night text-white" : "text-muted hover:text-ink")}>
              {label}
            </Link>
          ))}
        </nav>
        <form action={rescanSite}>
          <RescanButton />
        </form>
      </div>
    </header>
  );
}

function verdictText(p: PageNode) {
  if (p.verdict === "fehler") return p.status ? `Die Seite antwortet mit Status ${p.status}.` : "Die Seite war beim Einlesen nicht erreichbar.";
  if (p.verdict === "neutral") return "Pflichtseite – braucht keinen Call-to-Action.";
  if (p.verdict === "sackgasse") return "Sackgasse: Im Inhalt führt kein Link weiter.";
  if (p.verdict === "schwach") return p.shell ? "Im Inhalt fehlt ein Call-to-Action – zum Angebot geht es nur über Menü oder Footer." : "Im Inhalt fehlt ein Call-to-Action, und die Seite hat weder Menü noch Footer.";
  if (p.hasForm) return "Das Anfrage-Formular steht direkt auf dieser Seite.";
  if (p.offerPage) return "Diese Seite gehört selbst zum Angebot.";
  return "Der Inhalt führt zurück zum Angebot.";
}

function PagePanel({
  page: p,
  data,
  stat,
  flow,
  keywords,
  from,
  notes,
  label,
  known,
  preview,
  onPreview,
  onSelect,
}: {
  page: PageNode;
  data: SiteStructure;
  stat?: Stat;
  flow?: Map<string, number>;
  keywords: SiteStructure["keywords"];
  from: string[];
  notes: Note[];
  label: (path: string) => string;
  known: (path: string) => boolean;
  preview: boolean;
  onPreview: () => void;
  onSelect: (path: string | null) => void;
}) {
  const v = VERDICT[p.verdict];
  const ctas = p.links.filter((l) => l.button || l.offer);
  const targets = new Map<string, number>();
  for (const l of p.links) if (l.kind === "seite") targets.set(l.to, (targets.get(l.to) ?? 0) + 1);
  const external = p.links.filter((l) => l.kind === "extern" || l.kind === "sprache");
  const facts = [
    { label: "Klicks ab Startseite", value: p.depth ?? "–" },
    { label: "Klicks bis zur Anfrage", value: p.toOffer ?? "kein Weg" },
    { label: "Verlinkt von", value: `${from.length} ${from.length === 1 ? "Seite" : "Seiten"}` },
    { label: "Aufrufe (30 Tage)", value: formatNumber(stat?.views ?? 0) },
    { label: "Einstiege · über Suche", value: `${formatNumber(stat?.entries ?? 0)} · ${formatNumber(stat?.search ?? 0)}` },
    { label: "Besuche enden hier", value: stat?.views ? `${Math.round((stat.exits / stat.views) * 100)} %` : "–" },
  ];
  // Wohin Besucher von hier wirklich gehen – auch über Menü und Footer
  const went = Array.from(flow ?? []).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const seo = [
    { label: "Titel", value: p.title || "fehlt", hint: `${p.titleLen} Zeichen`, bad: !p.titleLen || p.titleLen > 65 },
    { label: "Beschreibung", value: p.description || "fehlt", hint: `${p.description.length} Zeichen`, bad: !p.description || p.description.length > 165 },
    { label: "Hauptüberschrift", value: p.h1 || "fehlt", hint: p.h1Count > 1 ? `${p.h1Count}× vorhanden` : "", bad: p.h1Count !== 1 },
  ];
  const flags = [
    { label: `${formatNumber(p.words)} Wörter`, ok: p.words >= 300 },
    { label: p.noindex ? "für Google gesperrt" : "für Google freigegeben", ok: !p.noindex },
    { label: p.inSitemap ? "in der Sitemap" : "nicht in der Sitemap", ok: p.inSitemap || p.noindex },
    { label: p.schema ? "strukturierte Daten" : "keine strukturierten Daten", ok: p.schema },
  ];
  const jump = "w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-left text-sm text-ink hover:bg-canvas flex items-center gap-2";

  return (
    <div className="p-5">
      <button type="button" onClick={() => onSelect(null)} className="-ml-1 flex min-h-9 cursor-pointer items-center gap-1.5 rounded-lg px-1 text-xs font-semibold text-muted hover:text-ink">
        <X className="size-3.5" aria-hidden /> Schließen
      </button>
      <p className="mt-3 text-xs font-medium text-brand-600">{GROUP_LABEL[p.group]}</p>
      <h2 className="mt-1 text-lg leading-snug font-extrabold tracking-tight text-ink">{p.label}</h2>
      <p className="mt-1 text-xs break-all text-muted">
        {p.path}
        {p.noindex && " · nicht für Google freigegeben"}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a href={p.path} target="_blank" rel="noreferrer" className="flex min-h-10 items-center gap-2 rounded-full bg-night px-4 text-sm font-semibold text-white hover:bg-night-soft">
          <ExternalLink className="size-4" aria-hidden /> Seite öffnen
        </a>
        <button type="button" onClick={onPreview} aria-expanded={preview} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-line px-4 text-sm font-semibold text-ink hover:border-brand-200">
          {preview ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />} {preview ? "Vorschau schließen" : "Vorschau"}
        </button>
      </div>
      {preview && <iframe src={p.path} title={`Vorschau: ${p.label}`} loading="lazy" className="mt-3 h-[520px] w-full rounded-xl border border-line bg-white" />}

      <p className="mt-4 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5 text-sm text-ink">
        <v.icon className={cn("mt-0.5 size-4 shrink-0", v.tone)} aria-hidden /> {verdictText(p)}
      </p>
      {notes.filter((i) => !["kein-cta", "sackgasse", "fehler"].includes(i.id)).map((i, n) => (
        <p key={n} className="mt-2 flex items-start gap-2 rounded-xl bg-canvas px-3 py-2.5 text-sm text-ink">
          <TriangleAlert className={cn("mt-0.5 size-4 shrink-0", i.level === 1 ? "text-danger" : i.level === 2 ? "text-amber-600" : "text-muted")} aria-hidden /> <span className="min-w-0 break-words">{i.text}</span>
        </p>
      ))}

      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-xs text-muted">{f.label}</dt>
            <dd className="num text-base font-bold text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-6">
        <h3 className="text-sm font-bold text-ink">
          Call-to-Actions <span className="num font-normal text-muted">{ctas.length}</span>
        </h3>
        {ctas.length ? (
          <>
            <div className="relative mt-3 h-2 rounded-full bg-canvas" role="img" aria-label="Position der Call-to-Actions auf der Seite, von oben nach unten">
              {ctas.map((l, n) => (
                <span key={n} className={cn("absolute top-1/2 h-3.5 w-1 -translate-y-1/2 rounded-full", l.offer ? "bg-brand-500" : "bg-muted")} style={{ left: `calc(${l.pos * 100}% - 2px)` }} />
              ))}
            </div>
            <p className="mt-1 flex justify-between text-[11px] text-muted">
              <span>Seitenanfang</span>
              <span>Seitenende</span>
            </p>
            <ul className="mt-2 divide-y divide-line">
              {ctas.map((l, n) => (
                <li key={n} className="py-2">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {l.button ? <MousePointerClick className="size-3.5 shrink-0 text-brand-600" aria-hidden /> : <Link2 className="size-3.5 shrink-0 text-muted" aria-hidden />}
                    <span className="truncate" title={l.text}>{l.text}</span>
                    <span className="num ml-auto shrink-0 text-[11px] font-normal text-muted">{Math.round(l.pos * 100)} %</span>
                  </p>
                  <p className={cn("mt-0.5 flex items-center gap-1.5 pl-5.5 text-xs", l.broken ? "text-danger" : "text-body")}>
                    <ArrowRight className="size-3 shrink-0" aria-hidden />
                    <span className="truncate">{l.kind === "anker" ? `auf dieser Seite: #${l.hash}` : l.kind === "seite" ? `${label(l.to)}${l.hash ? ` #${l.hash}` : ""}` : target(l).replace(/^https?:\/\//, "")}</span>
                    {l.broken && <b className="shrink-0">· {l.broken === "seite" ? "Ziel fehlt" : "Sprungmarke fehlt"}</b>}
                    {!l.offer && !l.broken && <span className="shrink-0 text-muted">· nicht zum Angebot</span>}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">Im Inhalt dieser Seite steht kein Button und kein Link zum Angebot.</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-bold text-ink">
          Verlinkt auf <span className="num font-normal text-muted">{targets.size}</span>
        </h3>
        {targets.size ? (
          <ul className="mt-1">
            {[...targets].map(([to, n]) => (
              <li key={to}>
                {known(to) ? (
                  <button type="button" onClick={() => onSelect(to)} className={jump}>
                    <ArrowRight className="size-3.5 shrink-0 text-brand-600" aria-hidden /> <span className="truncate">{label(to)}</span>
                    <span className="num ml-auto shrink-0 text-xs text-muted">{flow?.get(to) ? `${formatNumber(flow.get(to)!)} Klicks` : n > 1 ? `${n}×` : ""}</span>
                  </button>
                ) : (
                  <p className={cn(jump, "cursor-default text-danger hover:bg-transparent")}>
                    <CircleX className="size-3.5 shrink-0" aria-hidden /> <span className="truncate">{to}</span>
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted">Der Inhalt verlinkt auf keine andere Seite.</p>
        )}
      </section>

      <section className="mt-6">
        <h3 className="text-sm font-bold text-ink">
          Verlinkt von <span className="num font-normal text-muted">{from.length}</span>
        </h3>
        {p.inNav && <p className="mt-1 text-xs text-muted">Steht zusätzlich im Menü oder Footer – also von jeder Seite aus erreichbar.</p>}
        {from.length ? (
          <ul className="mt-1">
            {from.map((f) => (
              <li key={f}>
                <button type="button" onClick={() => onSelect(f)} className={jump}>
                  <ArrowLeft className="size-3.5 shrink-0 text-muted" aria-hidden /> <span className="truncate">{label(f)}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          !p.inNav && <p className="mt-2 text-sm text-muted">Keine andere Seite verlinkt im Inhalt hierher.</p>
        )}
      </section>

      {went.length > 0 && (
        <section className="mt-6">
          <h3 className="text-sm font-bold text-ink">Wohin Besucher von hier gehen</h3>
          <p className="mt-1 text-xs text-muted">Echte Klickwege der letzten 30 Tage – auch über Menü und Footer.</p>
          <ul className="mt-1">
            {went.map(([to, n]) => (
              <li key={to}>
                <button type="button" disabled={!known(to)} onClick={() => onSelect(to)} className={jump}>
                  <ArrowRight className="size-3.5 shrink-0 text-brand-600" aria-hidden /> <span className="truncate">{label(to)}</span>
                  <span className="num ml-auto shrink-0 text-xs font-semibold text-ink">{formatNumber(n)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6">
        <h3 className="text-sm font-bold text-ink">Für Google</h3>
        <dl className="mt-2 space-y-2.5">
          {seo.map((x) => (
            <div key={x.label}>
              <dt className="flex items-center justify-between text-xs text-muted">
                {x.label} <span className={cn("num", x.bad && "font-semibold text-amber-600")}>{x.hint}</span>
              </dt>
              <dd className="text-sm leading-snug break-words text-ink">{x.value}</dd>
            </div>
          ))}
        </dl>
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {flags.map((x) => (
            <li key={x.label} className={cn("num rounded-full px-2.5 py-1 text-[11px] font-semibold", x.ok ? "bg-canvas text-body" : "bg-amber-50 text-amber-900")}>
              {x.label}
            </li>
          ))}
        </ul>
        {keywords.length > 0 && (
          <ul className="mt-3 space-y-1">
            {keywords.map((k) => (
              <li key={k.term} className="flex items-center justify-between gap-3 text-sm text-ink">
                <span className="truncate">Suchbegriff „{k.term}“</span>
                <span className={cn("shrink-0 text-xs font-semibold", k.status === "stark" ? "text-emerald-600" : "text-amber-600")}>{k.status === "stark" ? "im Titel" : k.status === "schwach" ? "nur im Text" : "fehlt"}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {external.length > 0 && (
        <details className="mt-6">
          <summary className="cursor-pointer text-sm font-bold text-ink">
            Externe Links <span className="num font-normal text-muted">{external.length}</span>
          </summary>
          <ul className="mt-2 space-y-1.5 text-xs text-body">
            {external.map((l, n) => (
              <li key={n} className="truncate" title={l.to}>
                {l.text} → {l.to.replace(/^https?:\/\//, "")}
              </li>
            ))}
          </ul>
        </details>
      )}
      {p.shell && p.group === "start" && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-bold text-ink">
            Menü &amp; Footer <span className="num font-normal text-muted">{data.nav.length + data.footer.length}</span>
          </summary>
          <p className="mt-1 text-xs text-muted">Stehen auf jeder Seite gleich und sind deshalb nicht als Linien eingezeichnet.</p>
          <ul className="mt-2 space-y-1.5 text-xs text-body">
            {[...data.nav, ...data.footer].map((l, n) => (
              <li key={n} className={cn("truncate", l.broken && "text-danger")}>
                {l.text} → {target(l).replace(/^https?:\/\//, "")}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
