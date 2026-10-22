"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  Check,
  Circle,
  Crown,
  Ellipsis,
  Hand,
  Link2,
  Loader2,
  MessageSquare,
  MessageSquareText,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  PictureInPicture2,
  Send,
  Settings2,
  Smile,
  Sparkles,
  UserMinus,
  Users,
  Video,
  VideoOff,
  X,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/format";
import { BACKGROUNDS, REACTIONS, backgroundCss, type BackgroundId } from "@/lib/meet";
import { useCaptions } from "./captions";
import { SELF, useMeet, type DeviceKind, type PeerState, type Reaction } from "./useMeet";

const NAME_KEY = "taswiq-meet-name";
const spring = { type: "spring", stiffness: 420, damping: 32 } as const;
const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("") || "?";

/** Einladungslink /meet/<code>: erst die Vorschau (Name, Kamera, Mikrofon), dann der Call. */
export function MeetApp({ code, title }: { code: string; title: string }) {
  const meet = useMeet(code);
  const { phase, startDevices, notice, setNotice } = meet;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void startDevices();
  }, [startDevices]);

  useEffect(() => {
    if (!notice || phase !== "room") return;
    const t = setTimeout(() => setNotice(null), 6000);
    return () => clearTimeout(t);
  }, [notice, phase, setNotice]);

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${location.origin}/meet/${code}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative isolate flex h-dvh flex-col overflow-hidden bg-[#0b0b0f] text-white">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_15%_0%,rgb(120_64_254/0.22),transparent_70%),radial-gradient(45%_40%_at_95%_100%,rgb(224_86_110/0.12),transparent_70%)]" />
        <AnimatePresence mode="wait">
          {phase === "room" ? (
            <Room key="room" meet={meet} title={title} copied={copied} onCopy={copyLink} />
          ) : phase === "waiting" ? (
            <Waiting key="waiting" title={title} onCancel={() => meet.hangUp()} />
          ) : phase === "left" || phase === "ended" || phase === "kicked" || phase === "denied" ? (
            <Goodbye key="bye" reason={phase} onBack={meet.backToLobby} />
          ) : (
            <Lobby key="lobby" meet={meet} title={title} copied={copied} onCopy={copyLink} />
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}

type Meet = ReturnType<typeof useMeet>;

// ─── Bausteine ──────────────────────────────────────────────────────
function RoundButton({
  icon: Icon,
  label,
  onClick,
  tone = "idle",
  pressed,
  className,
  disabled,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  tone?: "idle" | "off" | "on";
  pressed?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.92 }}
      transition={spring}
      className={cn(
        "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0f] disabled:cursor-wait disabled:opacity-60 sm:size-12",
        tone === "off" && "bg-[#e5484d] text-white hover:bg-[#f0585d]",
        tone === "on" && "bg-brand-500 text-white shadow-brand hover:bg-brand-400",
        tone === "idle" && "bg-white/10 text-white hover:bg-white/20",
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span key={Icon.displayName ?? label} initial={{ scale: 0.5, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.14 }}>
          <Icon className="size-5" aria-hidden />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
}

/** Schlägt aus, solange auf der Tonspur gesprochen wird. */
let audioContext: AudioContext | null = null;
function useSpeaking(track: MediaStreamTrack | null | undefined, active: boolean) {
  const [speaking, setSpeaking] = useState(false);
  useEffect(() => {
    if (!track || !active || track.readyState !== "live") return setSpeaking(false);
    let source: MediaStreamAudioSourceNode;
    try {
      audioContext ??= new AudioContext();
      void audioContext.resume();
      source = audioContext.createMediaStreamSource(new MediaStream([track]));
    } catch {
      return;
    }
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    let last = 0;
    const timer = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const v of samples) sum += (v - 128) ** 2;
      if (Math.sqrt(sum / samples.length) / 128 > 0.035) last = Date.now();
      setSpeaking(Date.now() - last < 450);
    }, 120);
    return () => {
      clearInterval(timer);
      source.disconnect();
    };
  }, [track, active]);
  return speaking;
}

function Tile({
  name,
  stream,
  state,
  self = false,
  connected = true,
  reactions,
  compact = false,
  contain = false,
  screen = false,
  pip = false,
  audio,
  muted,
  sinkId,
}: {
  name: string;
  stream: MediaStream | null;
  state: PeerState;
  self?: boolean;
  connected?: boolean;
  reactions: Reaction[];
  compact?: boolean;
  contain?: boolean;
  /** Kachel zeigt einen geteilten Bildschirm statt einer Person */
  screen?: boolean;
  /** Dieses Bild wandert ins Bild-in-Bild-Fenster, wenn man den Browser verlässt */
  pip?: boolean;
  audio: MediaStreamTrack | null | undefined;
  /** Standard: eigene Kachel und Bildschirm stumm; ein Bildschirm mit Ton (geteilter Tab) wird abgespielt */
  muted?: boolean;
  /** Gewählter Lautsprecher */
  sinkId?: string;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const speaking = useSpeaking(audio, state.mic);
  const showVideo = (screen || state.cam) && !!stream;

  useEffect(() => {
    const el = video.current;
    if (!el || el.srcObject === stream) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [stream]);

  useEffect(() => {
    const el = video.current as (HTMLVideoElement & { setSinkId?: (id: string) => Promise<void> }) | null;
    if (sinkId && el?.setSinkId) void el.setSinkId(sinkId).catch(() => {});
  }, [sinkId, stream]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.86 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.86, transition: { duration: 0.16 } }}
      transition={spring}
      className={cn(
        "relative size-full min-h-0 overflow-hidden rounded-3xl bg-night-soft ring-1 ring-white/10 transition-shadow duration-300",
        speaking && "shadow-[0_0_0_3px_var(--color-mint-400),0_0_40px_-6px_rgb(74_222_128/0.55)]",
        compact && "rounded-2xl",
      )}
    >
      {/* Das Video-Element bleibt immer im Baum – darüber läuft auch der Ton der anderen. */}
      <video
        ref={video}
        autoPlay
        playsInline
        muted={muted ?? (self || screen)}
        data-pip={pip || undefined}
        className={cn("size-full bg-black", contain ? "object-contain" : "object-cover", self && !screen && "-scale-x-100", !showVideo && "invisible")}
      />
      {!showVideo && (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_40%,rgb(120_64_254/0.28),transparent_65%)]">
          <motion.span
            animate={speaking ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={{ duration: 0.9, repeat: speaking ? Infinity : 0 }}
            className={cn("grid place-items-center rounded-full bg-brand-500 font-bold text-white shadow-brand", compact ? "size-12 text-base" : "size-20 text-2xl sm:size-24 sm:text-3xl")}
          >
            {initials(name)}
          </motion.span>
        </div>
      )}
      {!self && !connected && (
        <div className="absolute inset-x-0 top-3 flex justify-center">
          <span className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium backdrop-blur">
            <Loader2 className="size-3.5 animate-spin" aria-hidden /> Verbindet …
          </span>
        </div>
      )}
      <AnimatePresence>
        {state.hand && !screen && (
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={spring}
            className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-amber-400 px-2.5 py-1.5 text-xs font-bold text-black"
          >
            <Hand className="size-3.5" aria-hidden /> {!compact && "Meldet sich"}
          </motion.span>
        )}
      </AnimatePresence>
      <div className="absolute bottom-2.5 left-2.5 flex max-w-[calc(100%-1.25rem)] items-center gap-1.5 rounded-full bg-black/55 py-1 pr-3 pl-1.5 text-xs font-medium backdrop-blur-md sm:text-sm">
        {screen ? (
          <span className="grid size-6 place-items-center rounded-full bg-brand-500">
            <MonitorUp className="size-3.5" aria-hidden />
          </span>
        ) : (
          <span className={cn("grid size-6 place-items-center rounded-full", state.mic ? (speaking ? "bg-mint-500" : "bg-white/15") : "bg-[#e5484d]")}>
            {state.mic ? <Mic className="size-3.5" aria-hidden /> : <MicOff className="size-3.5" aria-hidden />}
          </span>
        )}
        <span className="truncate">
          {screen ? (self ? "Dein Bildschirm" : `Bildschirm von ${name}`) : name}
          {self && !screen && " (Du)"}
        </span>
        {!screen && <span className="sr-only">{state.mic ? "Mikrofon an" : "stumm"}</span>}
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
        <AnimatePresence>
          {reactions.map((r) => (
            <motion.span
              key={r.key}
              initial={{ y: 0, x: ((r.key * 37) % 80) - 40, opacity: 0, scale: 0.4 }}
              animate={{ y: compact ? -70 : -190, opacity: [0, 1, 1, 0], scale: [0.4, 1.35, 1.1, 1], rotate: [0, -8, 8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.4, ease: "easeOut" }}
              className={cn("absolute", compact ? "text-3xl" : "text-5xl")}
            >
              {r.emoji}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function MenuItem({ icon: Icon, label, onClick, danger, className }: { icon: LucideIcon; label: string; onClick: () => void; danger?: boolean; className?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-left text-sm font-medium outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white", danger && "text-red-300", className)}
    >
      <Icon className="size-4.5 shrink-0" aria-hidden /> {label}
    </button>
  );
}

function Popover({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: React.ReactNode; label: string }) {
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-label={label}
            initial={{ opacity: 0, y: 14, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.12 } }}
            transition={spring}
            className="absolute bottom-full left-1/2 z-40 mb-4 w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-3xl border border-white/10 bg-[#17171c]/95 p-3 shadow-float backdrop-blur-xl"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BackgroundPicker({ value, onPick, loading }: { value: BackgroundId; onPick: (id: BackgroundId) => void; loading: boolean }) {
  return (
    <div className="w-[min(21rem,calc(100vw-3.5rem))]">
      <p className="flex items-center gap-2 px-1 pb-2.5 text-sm font-semibold">
        Hintergrund {loading && <Loader2 className="size-3.5 animate-spin text-night-muted" aria-label="lädt" />}
      </p>
      <div className="grid grid-cols-4 gap-2">
        {BACKGROUNDS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onPick(b.id)}
            aria-pressed={value === b.id}
            className={cn(
              "group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl text-[11px] font-semibold outline-none ring-2 ring-transparent transition focus-visible:ring-white",
              value === b.id ? "ring-brand-400" : "hover:ring-white/40",
            )}
            style={{ background: b.colors ? backgroundCss(b.colors) : undefined }}
          >
            {!b.colors && <span className={cn("absolute inset-0 bg-white/10", b.id === "blur" && "bg-[radial-gradient(circle_at_30%_30%,#9a70ff,transparent_60%),radial-gradient(circle_at_75%_70%,#e0566e,transparent_60%)] blur-md")} />}
            <span className="absolute inset-x-0 bottom-0 bg-black/45 px-1 py-1 text-center leading-tight backdrop-blur-sm">{b.label}</span>
            {value === b.id && (
              <span className="absolute top-1 right-1 grid size-4 place-items-center rounded-full bg-brand-500">
                <Check className="size-3" aria-hidden />
              </span>
            )}
          </button>
        ))}
      </div>
      <p className="px-1 pt-2.5 text-[11px] leading-snug text-night-muted">Wird direkt auf deinem Gerät berechnet. Beim ersten Mal dauert das Laden ein paar Sekunden.</p>
    </div>
  );
}

function Notice({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <motion.div
      role="status"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-400/15 px-4 py-3 text-sm text-amber-100"
    >
      <span className="flex-1">{text}</span>
      <button type="button" onClick={onClose} aria-label="Hinweis schließen" className="-m-1 grid size-7 cursor-pointer place-items-center rounded-full hover:bg-white/10">
        <X className="size-4" aria-hidden />
      </button>
    </motion.div>
  );
}

const CopyButton = ({ copied, onCopy, className }: { copied: boolean; onCopy: () => void; className?: string }) => (
  <button
    type="button"
    onClick={onCopy}
    className={cn("flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-4 text-sm font-semibold outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white", className)}
  >
    {copied ? <Check className="size-4 text-mint-400" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
    <span aria-live="polite">{copied ? "Link kopiert" : "Link kopieren"}</span>
  </button>
);

const DEVICE_LABELS: { kind: DeviceKind; label: string; fallback: string }[] = [
  { kind: "audioinput", label: "Mikrofon", fallback: "Mikrofon" },
  { kind: "audiooutput", label: "Lautsprecher", fallback: "Lautsprecher" },
  { kind: "videoinput", label: "Kamera", fallback: "Kamera" },
];

/** Mikrofon, Lautsprecher und Kamera wählen (Headset, externe Kamera …). */
function DeviceSettings({ meet }: { meet: Meet }) {
  const { devices, chosen, listDevices, chooseDevice } = meet;
  useEffect(() => {
    void listDevices();
    navigator.mediaDevices?.addEventListener?.("devicechange", listDevices);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", listDevices);
  }, [listDevices]);
  return (
    <div className="grid w-[min(20rem,calc(100vw-3.5rem))] gap-3">
      {DEVICE_LABELS.map(({ kind, label, fallback }) => {
        const list = devices.filter((d) => d.kind === kind);
        // Lautsprecher wählen kann nicht jeder Browser (Safari, Firefox auf dem Handy) – dann gilt der Systemlautsprecher.
        if (kind === "audiooutput" && (!list.length || !("setSinkId" in HTMLMediaElement.prototype))) return null;
        return (
          <label key={kind} className="block text-sm font-semibold">
            {label}
            <select
              value={chosen[kind]}
              onChange={(e) => void chooseDevice(kind, e.target.value)}
              disabled={!list.length}
              className="mt-1.5 h-11 w-full cursor-pointer rounded-xl border border-white/10 bg-white/5 px-3 text-sm font-normal text-white outline-none focus:border-brand-400 [&>option]:bg-[#17171c]"
            >
              {!chosen[kind] && <option value="">Standard</option>}
              {list.map((d, i) => (
                <option key={d.deviceId} value={d.deviceId}>
                  {d.label || `${fallback} ${i + 1}`}
                </option>
              ))}
              {!list.length && <option value="">Nichts gefunden</option>}
            </select>
          </label>
        );
      })}
    </div>
  );
}

/** Links in Chat-Nachrichten anklickbar machen. */
const linkify = (text: string) =>
  text.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
    i % 2 ? (
      <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-brand-300 underline underline-offset-2 hover:text-brand-200">
        {part}
      </a>
    ) : (
      part
    ),
  );

function ChatPanel({ meet }: { meet: Meet }) {
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [meet.chat.length]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    meet.sendChat(text);
    setText("");
  };
  return (
    <>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-3" aria-live="polite">
        {meet.chat.length === 0 && <p className="pt-6 text-center text-sm text-night-muted">Noch keine Nachrichten. Nachrichten sehen alle, die gerade im Call sind.</p>}
        {meet.chat.map((m) => (
          <div key={m.key} className={cn("max-w-[85%]", m.self && "ml-auto text-right")}>
            <p className="text-[11px] text-night-muted">
              {m.self ? "Du" : m.name} · {new Date(m.at).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
            </p>
            <p className={cn("mt-0.5 inline-block rounded-2xl px-3 py-2 text-left text-sm break-words whitespace-pre-wrap", m.self ? "bg-brand-500" : "bg-white/10")}>{linkify(m.text)}</p>
          </div>
        ))}
        <div ref={end} />
      </div>
      <form onSubmit={submit} className="flex gap-2 border-t border-white/10 p-3">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={2000}
          placeholder="Nachricht an alle"
          aria-label="Nachricht an alle"
          className="h-11 min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-brand-400"
        />
        <button type="submit" disabled={!text.trim()} aria-label="Senden" className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full bg-brand-500 outline-none hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-40">
          <Send className="size-4" aria-hidden />
        </button>
      </form>
    </>
  );
}

function PeoplePanel({ meet, name }: { meet: Meet; name: string }) {
  const people = [{ id: SELF, name, host: meet.host, state: meet.local as PeerState }, ...meet.peers];
  const small = "grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white/10 outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white";
  return (
    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
      {meet.host && meet.knocks.length > 0 && (
        <div className="mb-3 rounded-2xl bg-amber-400/15 p-3">
          <p className="px-1 text-xs font-semibold text-amber-100">Möchten rein</p>
          {meet.knocks.map((k) => (
            <KnockRow key={k.id} name={k.name} onAnswer={(ok) => meet.admit(k.id, ok)} />
          ))}
        </div>
      )}
      {meet.host && meet.peers.length > 0 && (
        <button type="button" onClick={() => meet.peers.forEach((p) => p.state.mic && meet.mutePeer(p.id))} className="mb-2 flex min-h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white/10 text-sm font-semibold hover:bg-white/20">
          <MicOff className="size-4" aria-hidden /> Alle stummschalten
        </button>
      )}
      <ul className="space-y-1">
        {people.map((p) => (
          <li key={p.id} className="flex items-center gap-2.5 rounded-2xl px-2 py-2 hover:bg-white/5">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-500 text-xs font-bold">{initials(p.name)}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">
                {p.name}
                {p.id === SELF && " (Du)"}
              </span>
              {p.host && (
                <span className="flex items-center gap-1 text-[11px] text-amber-200">
                  <Crown className="size-3" aria-hidden /> Gastgeber
                </span>
              )}
            </span>
            {p.state.hand && <Hand className="size-4 text-amber-300" aria-label="meldet sich" />}
            {p.state.mic ? <Mic className="size-4 text-night-muted" aria-label="Mikrofon an" /> : <MicOff className="size-4 text-[#e5484d]" aria-label="stumm" />}
            {meet.host && p.id !== SELF && (
              <>
                {p.state.mic && (
                  <button type="button" onClick={() => meet.mutePeer(p.id)} aria-label={`${p.name} stummschalten`} title="Stummschalten" className={small}>
                    <MicOff className="size-4" aria-hidden />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => confirm(`${p.name} aus dem Meeting entfernen?`) && meet.kick(p.id)}
                  aria-label={`${p.name} entfernen`}
                  title="Aus dem Meeting entfernen"
                  className={cn(small, "hover:bg-[#e5484d]")}
                >
                  <UserMinus className="size-4" aria-hidden />
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function KnockRow({ name, onAnswer }: { name: string; onAnswer: (ok: boolean) => void }) {
  return (
    <div className="flex items-center gap-2 px-1 pt-2">
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{name}</span>
      <button type="button" onClick={() => onAnswer(false)} className="min-h-9 cursor-pointer rounded-full bg-white/10 px-3 text-xs font-semibold hover:bg-white/20">
        Ablehnen
      </button>
      <button type="button" onClick={() => onAnswer(true)} className="min-h-9 cursor-pointer rounded-full bg-brand-500 px-3 text-xs font-bold hover:bg-brand-400">
        Einlassen
      </button>
    </div>
  );
}

// ─── Vorschau ───────────────────────────────────────────────────────
function Lobby({ meet, title, copied, onCopy }: { meet: Meet; title: string; copied: boolean; onCopy: () => void }) {
  const { local, phase, notice } = meet;
  const [name, setName] = useState("");
  const [picker, setPicker] = useState<"background" | "devices" | null>(null);
  const joining = phase === "joining";

  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {}
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || joining) return;
    try {
      localStorage.setItem(NAME_KEY, name.trim());
    } catch {}
    void meet.join(name);
  };

  return (
    <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="flex items-center justify-between px-5 py-4 sm:px-8">
        <span className="flex items-center gap-2.5 font-bold tracking-tight">
          <LogoMark className="h-7" /> TasWiq Meet
        </span>
        <CopyButton copied={copied} onCopy={onCopy} />
      </header>
      <div className="mx-auto grid w-full max-w-6xl flex-1 items-center gap-8 px-5 pb-10 sm:px-8 lg:grid-cols-[1.35fr_1fr] lg:gap-14">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.05 }} className="relative">
          <div className="aspect-video w-full max-lg:max-h-[42dvh]">
            <Tile name={name || "Du"} stream={local.stream} state={local} self reactions={[]} audio={local.audio} />
          </div>
          <div className="absolute inset-x-0 -bottom-6 flex justify-center">
            <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-[#17171c]/90 p-1.5 shadow-float backdrop-blur-xl">
              <RoundButton icon={local.mic ? Mic : MicOff} label={local.mic ? "Mikrofon ausschalten" : "Mikrofon einschalten"} tone={local.mic ? "idle" : "off"} onClick={meet.toggleMic} />
              <RoundButton icon={local.cam ? Video : VideoOff} label={local.cam ? "Kamera ausschalten" : "Kamera einschalten"} tone={local.cam ? "idle" : "off"} onClick={meet.toggleCam} />
              <RoundButton icon={Sparkles} label="Hintergrund wählen" tone={local.background !== "none" ? "on" : "idle"} pressed={picker === "background"} onClick={() => setPicker((v) => (v === "background" ? null : "background"))} />
              <RoundButton icon={Settings2} label="Mikrofon, Lautsprecher und Kamera wählen" pressed={picker === "devices"} onClick={() => setPicker((v) => (v === "devices" ? null : "devices"))} />
              <Popover open={picker === "background"} onClose={() => setPicker(null)} label="Hintergrund">
                <BackgroundPicker value={local.background} onPick={meet.setBackground} loading={meet.busy === "background"} />
              </Popover>
              <Popover open={picker === "devices"} onClose={() => setPicker(null)} label="Geräte">
                <DeviceSettings meet={meet} />
              </Popover>
            </div>
          </div>
        </motion.div>

        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.12 }} className="max-lg:mt-6">
          <p className="text-sm font-medium text-brand-300">Du bist eingeladen</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-night-muted">Prüf kurz Bild und Ton – dann geht es los. Niemand sieht oder hört dich, bevor du beitrittst.</p>
          <p className="mt-3 flex items-start gap-2 text-xs text-night-muted">
            <MessageSquareText className="mt-0.5 size-3.5 shrink-0" aria-hidden /> Das Gespräch wird automatisch mitgeschrieben. Die Mitschrift erhält der Gastgeber.
          </p>
          <label htmlFor="meet-name" className="mt-7 block text-sm font-semibold">
            Dein Name
          </label>
          <input
            id="meet-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="name"
            placeholder="z. B. Karim"
            className="mt-2 h-13 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-base text-white outline-none transition placeholder:text-white/30 focus:border-brand-400 focus:bg-white/10"
          />
          <AnimatePresence>{notice && <div className="mt-4"><Notice text={notice} onClose={() => meet.setNotice(null)} /></div>}</AnimatePresence>
          <motion.button
            type="submit"
            disabled={!name.trim() || joining}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.97 }}
            transition={spring}
            className="mt-5 flex h-13 w-full cursor-pointer items-center justify-center gap-2.5 rounded-full bg-brand-500 text-base font-bold shadow-brand outline-none transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            {joining ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <Video className="size-5" aria-hidden />}
            {joining ? "Verbinde …" : "Jetzt beitreten"}
          </motion.button>
        </motion.form>
      </div>
    </motion.main>
  );
}

// ─── Call ───────────────────────────────────────────────────────────
function Room({ meet, title, copied, onCopy }: { meet: Meet; title: string; copied: boolean; onCopy: () => void }) {
  const { peers, local, reactions, notice } = meet;
  const [open, setOpen] = useState<"reactions" | "background" | "more" | null>(null);
  const [panel, setPanel] = useState<"chat" | "people" | "devices" | null>(null);
  const [seen, setSeen] = useState(0);
  const unread = panel === "chat" ? 0 : meet.chat.filter((m) => !m.self).length - seen;
  const togglePanel = (p: "chat" | "people" | "devices") => {
    setOpen(null);
    setPanel((v) => (v === p ? null : p));
  };
  useEffect(() => {
    if (panel === "chat") setSeen(meet.chat.filter((m) => !m.self).length);
  }, [panel, meet.chat]);
  const sink = meet.chosen.audiooutput || undefined;
  const recording = !!local.rec || peers.some((p) => p.state.rec);
  const [seconds, setSeconds] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const name = meet.name || "Du";
  const [pipReady, setPipReady] = useState(false);
  useCaptions(meet);

  /**
   * Bild-in-Bild: das Bild des Gegenübers (oder der geteilte Bildschirm) als kleines Fenster über anderen Apps.
   * Von selbst beim Verlassen des Browsers, soweit das Gerät es erlaubt – sonst über den Knopf oben.
   */
  const togglePip = async (auto = false) => {
    const el = document.querySelector<HTMLVideoElement & { webkitSetPresentationMode?: (mode: string) => void; webkitPresentationMode?: string }>("video[data-pip]");
    try {
      if (document.pictureInPictureElement) return auto ? undefined : await document.exitPictureInPicture();
      if (!el) return;
      if (el.requestPictureInPicture) await el.requestPictureInPicture();
      else el.webkitSetPresentationMode?.(el.webkitPresentationMode === "picture-in-picture" && !auto ? "inline" : "picture-in-picture");
    } catch {
      if (!auto) meet.setNotice("Bild-in-Bild lässt dieser Browser gerade nicht zu.");
    }
  };

  useEffect(() => {
    setPipReady(!!document.pictureInPictureEnabled || "webkitSetPresentationMode" in HTMLVideoElement.prototype);
    const leave = () => document.hidden && void togglePip(true);
    document.addEventListener("visibilitychange", leave);
    // Chrome und Edge wechseln darüber von selbst ins kleine Fenster, sobald der Tab oder die App verlassen wird.
    const session = navigator.mediaSession as (MediaSession & { setActionHandler: (action: string, handler: (() => void) | null) => void }) | undefined;
    try {
      session?.setActionHandler("enterpictureinpicture", () => void togglePip(true));
    } catch {}
    return () => {
      document.removeEventListener("visibilitychange", leave);
      try {
        session?.setActionHandler("enterpictureinpicture", null);
      } catch {}
      if (document.pictureInPictureElement) void document.exitPictureInPicture().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const mq = window.matchMedia("(max-width: 767px)");
    const fit = () => setNarrow(mq.matches);
    fit();
    mq.addEventListener("change", fit);
    return () => {
      clearInterval(t);
      mq.removeEventListener("change", fit);
    };
  }, []);

  // Tastenkürzel wie gewohnt: M = Mikrofon, V = Kamera
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || (e.target as HTMLElement).closest("input, textarea")) return;
      if (e.key === "m") void meet.toggleMic();
      if (e.key === "v") void meet.toggleCam();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [meet]);

  const tiles = useMemo(
    () => [
      { id: SELF, name, stream: local.stream, screenStream: local.screenStream, state: local as PeerState, self: true, connected: true, audio: local.audio },
      ...peers.map((p) => ({ id: p.id, name: p.name, stream: p.stream as MediaStream | null, screenStream: p.screenStream, state: p.state, self: false, connected: p.connected, audio: p.stream.getAudioTracks()[0] })),
    ],
    [local, peers, name],
  );
  // Ein geteilter Bildschirm bekommt die große Fläche – alle Personen (auch wer teilt) bleiben mit Kamera in der Leiste.
  // Ältere Version auf der Gegenseite: der Bildschirm kommt dort über die Kamera-Spur.
  const legacy = (t: (typeof tiles)[number]) => !t.self && typeof t.state.stt !== "number";
  const sharing = tiles.find((t) => t.state.screen && !t.self && (t.screenStream || legacy(t))) ?? tiles.find((t) => t.state.screen && t.screenStream);
  const rest = tiles;
  const n = tiles.length;
  // Ins kleine Fenster kommt der Bildschirm eines anderen, sonst die erste andere Person.
  const pipId = sharing && !sharing.self ? `${sharing.id}:screen` : tiles.find((t) => !t.self)?.id;
  const transcribing = !!local.stt || peers.some((p) => p.state.stt);
  const cols = narrow ? (n <= 3 ? 1 : 2) : n === 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const mine = (id: string) => reactions.filter((r) => r.from === id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <LogoMark className="h-6 shrink-0" />
        <h1 className="min-w-0 truncate text-sm font-semibold text-white sm:text-base">{title}</h1>
        <span className="num hidden rounded-full bg-white/10 px-2.5 py-1 text-xs text-night-muted tabular-nums sm:block">{clock}</span>
        {recording && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#e5484d]/20 px-2.5 py-1.5 text-xs font-semibold text-red-100" title="Der Call wird aufgenommen">
            <Circle className="size-2.5 animate-pulse fill-[#e5484d] text-[#e5484d]" aria-hidden />
            <span className="max-sm:sr-only">Aufnahme läuft</span>
          </span>
        )}
        {transcribing && (
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1.5 text-xs font-medium text-night-muted" title="Das Gespräch wird mitgeschrieben">
            <span className="size-1.5 animate-pulse rounded-full bg-mint-400" aria-hidden />
            <MessageSquareText className="size-3.5 sm:hidden" aria-hidden />
            <span className="max-sm:sr-only">Mitschrift läuft</span>
          </span>
        )}
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tabular-nums" aria-label={`${n} Personen im Meeting`}>
          <Users className="size-3.5" aria-hidden /> {n}
        </span>
        {pipReady && pipId && (
          <button
            type="button"
            onClick={() => void togglePip()}
            aria-label="Bild-in-Bild: Call als kleines Fenster anzeigen"
            title="Bild-in-Bild"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-white/10 outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white"
          >
            <PictureInPicture2 className="size-4" aria-hidden />
          </button>
        )}
        <CopyButton copied={copied} onCopy={onCopy} className="min-h-9 shrink-0 px-3 text-xs max-sm:px-2.5 max-sm:[&>span]:sr-only sm:text-sm" />
      </header>

      <div className="relative min-h-0 flex-1 px-3 sm:px-5">
        <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center px-4">
          <AnimatePresence>{notice && <div className="pointer-events-auto max-w-lg"><Notice text={notice} onClose={() => meet.setNotice(null)} /></div>}</AnimatePresence>
        </div>
        {meet.host && meet.knocks.length > 0 && panel !== "people" && (
          <div className="absolute inset-x-0 top-2 z-30 flex justify-center px-4">
            <div role="alert" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#17171c]/95 p-3 shadow-float backdrop-blur-xl">
              <p className="px-1 text-xs font-semibold text-amber-200">{meet.knocks.length === 1 ? "Jemand möchte rein" : `${meet.knocks.length} Personen möchten rein`}</p>
              {meet.knocks.slice(0, 3).map((k) => (
                <KnockRow key={k.id} name={k.name} onAnswer={(ok) => meet.admit(k.id, ok)} />
              ))}
            </div>
          </div>
        )}
        <AnimatePresence>
          {panel && (
            <motion.aside
              aria-label={panel === "chat" ? "Chat" : panel === "people" ? "Teilnehmer" : "Geräte"}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={spring}
              className="absolute inset-y-0 right-3 z-30 flex w-[min(22rem,calc(100%-1.5rem))] flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#17171c]/95 shadow-float backdrop-blur-xl sm:right-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 py-2 pr-2 pl-4">
                <h2 className="text-sm font-bold text-white">{panel === "chat" ? "Chat" : panel === "people" ? `Teilnehmer (${n})` : "Geräte"}</h2>
                <button type="button" onClick={() => setPanel(null)} aria-label="Schließen" className="grid size-9 cursor-pointer place-items-center rounded-full hover:bg-white/10">
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              {panel === "chat" ? <ChatPanel meet={meet} /> : panel === "people" ? <PeoplePanel meet={meet} name={name} /> : <div className="p-4"><DeviceSettings meet={meet} /></div>}
            </motion.aside>
          )}
        </AnimatePresence>
        {sharing ? (
          <div className="flex size-full min-h-0 gap-3 max-md:flex-col">
            <div className="min-h-0 min-w-0 flex-1">
              <Tile
                key={`${sharing.id}:screen`}
                {...sharing}
                stream={legacy(sharing) ? sharing.stream : sharing.screenStream}
                screen
                contain
                pip={pipId === `${sharing.id}:screen`}
                audio={null}
                reactions={[]}
                muted={sharing.self || legacy(sharing)}
                sinkId={sink}
              />
            </div>
            <div className="flex shrink-0 gap-3 overflow-auto max-md:h-24 md:w-52 md:flex-col">
              <AnimatePresence>
                {rest.map((t) => (
                  <div key={t.id} className="aspect-video shrink-0 max-md:h-full md:w-full">
                    <Tile {...t} compact pip={pipId === t.id} reactions={mine(t.id)} sinkId={sink} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid size-full min-h-0 gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: "minmax(0, 1fr)", maxWidth: n === 1 ? "min(100%, 150dvh)" : undefined }}>
            <AnimatePresence>
              {tiles.map((t) => (
                <Tile key={t.id} {...t} pip={pipId === t.id} reactions={mine(t.id)} sinkId={sink} />
              ))}
            </AnimatePresence>
          </div>
        )}
        {n === 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="absolute inset-x-0 top-5 flex justify-center px-4">
            <p className="rounded-full bg-black/55 px-4 py-2 text-center text-xs font-medium backdrop-blur-md sm:text-sm">Du bist als Erste:r da. Schick den Link weiter, damit die anderen dazukommen.</p>
          </motion.div>
        )}
      </div>

      <footer className="relative z-40 flex justify-center px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.15 }}
          className="relative flex items-center gap-1.5 rounded-full border border-white/10 bg-[#17171c]/90 p-1.5 shadow-float backdrop-blur-xl sm:gap-2 sm:p-2"
        >
          <RoundButton icon={local.mic ? Mic : MicOff} label={local.mic ? "Stummschalten (M)" : "Mikrofon einschalten (M)"} tone={local.mic ? "idle" : "off"} onClick={meet.toggleMic} />
          <RoundButton icon={local.cam ? Video : VideoOff} label={local.cam ? "Kamera ausschalten (V)" : "Kamera einschalten (V)"} tone={local.cam ? "idle" : "off"} onClick={meet.toggleCam} />
          <RoundButton icon={MonitorUp} label={local.screen ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"} tone={local.screen ? "on" : "idle"} pressed={local.screen} onClick={meet.toggleScreen} className="max-sm:hidden" />
          <span className="mx-0.5 h-6 w-px bg-white/10 max-sm:hidden" aria-hidden />
          <RoundButton icon={Smile} label="Reaktion senden" pressed={open === "reactions"} onClick={() => setOpen(open === "reactions" ? null : "reactions")} className="max-sm:hidden" />
          <RoundButton icon={Hand} label={local.hand ? "Hand senken" : "Hand heben"} tone={local.hand ? "on" : "idle"} pressed={local.hand} onClick={meet.toggleHand} className="max-sm:hidden" />
          <span className="relative">
            <RoundButton icon={MessageSquare} label={unread > 0 ? `Chat (${unread} neu)` : "Chat"} tone={panel === "chat" ? "on" : "idle"} pressed={panel === "chat"} onClick={() => togglePanel("chat")} />
            {unread > 0 && <span className="pointer-events-none absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-[#e5484d] px-1 text-[11px] font-bold">{unread}</span>}
          </span>
          <span className="relative">
            <RoundButton icon={Users} label="Teilnehmer" tone={panel === "people" ? "on" : "idle"} pressed={panel === "people"} onClick={() => togglePanel("people")} />
            {meet.host && meet.knocks.length > 0 && <span className="pointer-events-none absolute -top-0.5 -right-0.5 grid min-w-5 place-items-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-black">{meet.knocks.length}</span>}
          </span>
          <RoundButton icon={Ellipsis} label="Weitere Optionen" pressed={open === "more"} onClick={() => setOpen(open === "more" ? null : "more")} />
          <span className="mx-0.5 h-6 w-px bg-white/10 max-sm:hidden" aria-hidden />
          <motion.button
            type="button"
            onClick={() => meet.hangUp()}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            transition={spring}
            className="flex h-11 cursor-pointer items-center gap-2 rounded-full bg-[#e5484d] px-4 text-sm font-bold outline-none transition-colors hover:bg-[#f0585d] focus-visible:ring-2 focus-visible:ring-white sm:h-12 sm:px-5"
          >
            <PhoneOff className="size-5" aria-hidden /> <span className="max-sm:sr-only">Verlassen</span>
          </motion.button>

          <Popover open={open === "reactions"} onClose={() => setOpen(null)} label="Reaktionen">
            <div className="flex gap-1">
              {REACTIONS.map((emoji, i) => (
                <motion.button
                  key={emoji}
                  type="button"
                  onClick={() => meet.react(emoji)}
                  initial={{ opacity: 0, y: 12, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ ...spring, delay: i * 0.03 }}
                  whileHover={{ scale: 1.3, y: -5 }}
                  whileTap={{ scale: 0.85 }}
                  aria-label={`Reaktion ${emoji}`}
                  className="grid size-10 cursor-pointer place-items-center rounded-full text-2xl outline-none hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white sm:size-11"
                >
                  {emoji}
                </motion.button>
              ))}
            </div>
          </Popover>
          <Popover open={open === "more"} onClose={() => setOpen(null)} label="Weitere Optionen">
            <div className="grid w-[min(17rem,calc(100vw-3.5rem))] gap-1">
              <div className="flex justify-between pb-1 sm:hidden">
                {REACTIONS.slice(0, 6).map((emoji) => (
                  <button key={emoji} type="button" onClick={() => meet.react(emoji)} aria-label={`Reaktion ${emoji}`} className="grid size-10 cursor-pointer place-items-center rounded-full text-2xl hover:bg-white/10">
                    {emoji}
                  </button>
                ))}
              </div>
              <MenuItem icon={Hand} label={local.hand ? "Hand senken" : "Hand heben"} onClick={() => (meet.toggleHand(), setOpen(null))} className="sm:hidden" />
              <MenuItem icon={Sparkles} label="Hintergrund" onClick={() => setOpen("background")} />
              <MenuItem icon={Settings2} label="Mikrofon, Lautsprecher, Kamera" onClick={() => togglePanel("devices")} />
              {meet.host && (
                <MenuItem icon={Circle} label={local.rec ? "Aufnahme beenden und speichern" : "Aufnahme starten"} onClick={() => (void meet.toggleRecording(), setOpen(null))} className="max-sm:hidden" />
              )}
              {meet.host && (
                <MenuItem icon={PhoneOff} label="Meeting für alle beenden" danger onClick={() => confirm("Meeting für alle beenden? Alle werden aus dem Call genommen.") && meet.endForAll()} />
              )}
            </div>
          </Popover>
          <Popover open={open === "background"} onClose={() => setOpen(null)} label="Hintergrund">
            <BackgroundPicker value={local.background} onPick={meet.setBackground} loading={meet.busy === "background"} />
          </Popover>
        </motion.div>
      </footer>
    </motion.div>
  );
}

function Waiting({ title, onCancel }: { title: string; onCancel: () => void }) {
  return (
    <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring} className="grid flex-1 place-items-center px-6 text-center">
      <div className="max-w-md" role="status">
        <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/10">
          <Loader2 className="size-7 animate-spin" aria-hidden />
        </span>
        <p className="mt-6 text-sm font-medium text-brand-300">{title}</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white">Gleich geht es los</h1>
        <p className="mt-3 text-sm text-night-muted">Der Gastgeber weiß Bescheid und lässt dich gleich rein. Bitte lass dieses Fenster offen.</p>
        <button type="button" onClick={onCancel} className="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-white/10 px-6 text-sm font-bold outline-none hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white">
          Abbrechen
        </button>
      </div>
    </motion.main>
  );
}

const BYE = {
  left: ["Du hast das Meeting verlassen", "Kamera und Mikrofon sind aus. Über den Link kommst du jederzeit zurück."],
  ended: ["Das Meeting wurde beendet", "Der Gastgeber hat den Call für alle beendet. Kamera und Mikrofon sind aus."],
  kicked: ["Du wurdest aus dem Meeting entfernt", "Kamera und Mikrofon sind aus."],
  denied: ["Der Gastgeber hat dich nicht eingelassen", "Kamera und Mikrofon sind aus."],
} as const;

function Goodbye({ reason, onBack }: { reason: keyof typeof BYE; onBack: () => void }) {
  const ended = reason !== "left";
  return (
    <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring} className="grid flex-1 place-items-center px-6 text-center">
      <div className="max-w-md">
        <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...spring, delay: 0.1 }} className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/10">
          <PhoneOff className="size-7" aria-hidden />
        </motion.span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">{BYE[reason][0]}</h1>
        <p className="mt-3 text-sm text-night-muted">{BYE[reason][1]}</p>
        {!ended && (
          <button type="button" onClick={onBack} className="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-bold shadow-brand outline-none transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-white">
            <Video className="size-4" aria-hidden /> Wieder beitreten
          </button>
        )}
      </div>
    </motion.main>
  );
}
