"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { Check, Hand, Link2, Loader2, Mic, MicOff, MonitorUp, PhoneOff, Smile, Sparkles, Users, Video, VideoOff, X, type LucideIcon } from "lucide-react";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/format";
import { BACKGROUNDS, REACTIONS, backgroundCss, type BackgroundId } from "@/lib/meet";
import { SELF, useMeet, type PeerState, type Reaction } from "./useMeet";

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
          ) : phase === "left" || phase === "ended" ? (
            <Goodbye key="bye" ended={phase === "ended"} onBack={meet.backToLobby} />
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
  audio,
}: {
  name: string;
  stream: MediaStream | null;
  state: PeerState;
  self?: boolean;
  connected?: boolean;
  reactions: Reaction[];
  compact?: boolean;
  contain?: boolean;
  audio: MediaStreamTrack | null | undefined;
}) {
  const video = useRef<HTMLVideoElement>(null);
  const speaking = useSpeaking(audio, state.mic);
  const showVideo = (state.cam || state.screen) && !!stream;

  useEffect(() => {
    const el = video.current;
    if (!el || el.srcObject === stream) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [stream]);

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
        muted={self}
        className={cn("size-full bg-black", contain ? "object-contain" : "object-cover", self && !state.screen && "-scale-x-100", !showVideo && "invisible")}
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
        {state.hand && (
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
        <span className={cn("grid size-6 place-items-center rounded-full", state.mic ? (speaking ? "bg-mint-500" : "bg-white/15") : "bg-[#e5484d]")}>
          {state.mic ? <Mic className="size-3.5" aria-hidden /> : <MicOff className="size-3.5" aria-hidden />}
        </span>
        <span className="truncate">
          {name}
          {self && " (Du)"}
        </span>
        <span className="sr-only">{state.mic ? "Mikrofon an" : "stumm"}</span>
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

// ─── Vorschau ───────────────────────────────────────────────────────
function Lobby({ meet, title, copied, onCopy }: { meet: Meet; title: string; copied: boolean; onCopy: () => void }) {
  const { local, phase, notice } = meet;
  const [name, setName] = useState("");
  const [picker, setPicker] = useState(false);
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
              <RoundButton icon={Sparkles} label="Hintergrund wählen" tone={local.background !== "none" ? "on" : "idle"} pressed={picker} onClick={() => setPicker((v) => !v)} />
              <Popover open={picker} onClose={() => setPicker(false)} label="Hintergrund">
                <BackgroundPicker value={local.background} onPick={meet.setBackground} loading={meet.busy === "background"} />
              </Popover>
            </div>
          </div>
        </motion.div>

        <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.12 }} className="max-lg:mt-6">
          <p className="text-sm font-medium text-brand-300">Du bist eingeladen</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-balance text-white sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-night-muted">Prüf kurz Bild und Ton – dann geht es los. Niemand sieht oder hört dich, bevor du beitrittst.</p>
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
  const [open, setOpen] = useState<"reactions" | "background" | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [narrow, setNarrow] = useState(false);
  const name = meet.name || "Du";

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
      { id: SELF, name, stream: local.stream, state: local as PeerState, self: true, connected: true, audio: local.audio },
      ...peers.map((p) => ({ id: p.id, name: p.name, stream: p.stream as MediaStream | null, state: p.state, self: false, connected: p.connected, audio: p.stream.getAudioTracks()[0] })),
    ],
    [local, peers, name],
  );
  // Wer seinen Bildschirm teilt, bekommt die große Fläche – die anderen rücken in die Leiste.
  const spotlight = tiles.find((t) => t.state.screen && !t.self) ?? tiles.find((t) => t.state.screen);
  const rest = spotlight ? tiles.filter((t) => t !== spotlight) : tiles;
  const n = tiles.length;
  const cols = narrow ? (n <= 3 ? 1 : 2) : n === 1 ? 1 : n <= 4 ? 2 : n <= 9 ? 3 : 4;
  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const mine = (id: string) => reactions.filter((r) => r.from === id);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <LogoMark className="h-6 shrink-0" />
        <h1 className="min-w-0 truncate text-sm font-semibold text-white sm:text-base">{title}</h1>
        <span className="num hidden rounded-full bg-white/10 px-2.5 py-1 text-xs text-night-muted tabular-nums sm:block">{clock}</span>
        <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tabular-nums" aria-label={`${n} Personen im Meeting`}>
          <Users className="size-3.5" aria-hidden /> {n}
        </span>
        <CopyButton copied={copied} onCopy={onCopy} className="min-h-9 px-3 text-xs sm:text-sm" />
      </header>

      <div className="relative min-h-0 flex-1 px-3 sm:px-5">
        <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center px-4">
          <AnimatePresence>{notice && <div className="pointer-events-auto max-w-lg"><Notice text={notice} onClose={() => meet.setNotice(null)} /></div>}</AnimatePresence>
        </div>
        {spotlight ? (
          <div className="flex size-full min-h-0 gap-3 max-md:flex-col">
            <div className="min-h-0 min-w-0 flex-1">
              <Tile key={spotlight.id} {...spotlight} contain reactions={mine(spotlight.id)} />
            </div>
            <div className="flex shrink-0 gap-3 overflow-auto max-md:h-24 md:w-52 md:flex-col">
              <AnimatePresence>
                {rest.map((t) => (
                  <div key={t.id} className="aspect-video shrink-0 max-md:h-full md:w-full">
                    <Tile {...t} compact reactions={mine(t.id)} />
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          <div className="mx-auto grid size-full min-h-0 gap-3" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gridAutoRows: "minmax(0, 1fr)", maxWidth: n === 1 ? "min(100%, 150dvh)" : undefined }}>
            <AnimatePresence>
              {tiles.map((t) => (
                <Tile key={t.id} {...t} reactions={mine(t.id)} />
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

      <footer className="flex justify-center px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...spring, delay: 0.15 }}
          className="relative flex items-center gap-1.5 rounded-full border border-white/10 bg-[#17171c]/90 p-1.5 shadow-float backdrop-blur-xl sm:gap-2 sm:p-2"
        >
          <RoundButton icon={local.mic ? Mic : MicOff} label={local.mic ? "Stummschalten (M)" : "Mikrofon einschalten (M)"} tone={local.mic ? "idle" : "off"} onClick={meet.toggleMic} />
          <RoundButton icon={local.cam ? Video : VideoOff} label={local.cam ? "Kamera ausschalten (V)" : "Kamera einschalten (V)"} tone={local.cam ? "idle" : "off"} onClick={meet.toggleCam} />
          <RoundButton icon={MonitorUp} label={local.screen ? "Bildschirmfreigabe beenden" : "Bildschirm teilen"} tone={local.screen ? "on" : "idle"} pressed={local.screen} onClick={meet.toggleScreen} className="max-sm:hidden" />
          <span className="mx-0.5 h-6 w-px bg-white/10" aria-hidden />
          <RoundButton icon={Smile} label="Reaktion senden" pressed={open === "reactions"} onClick={() => setOpen(open === "reactions" ? null : "reactions")} />
          <RoundButton icon={Hand} label={local.hand ? "Hand senken" : "Hand heben"} tone={local.hand ? "on" : "idle"} pressed={local.hand} onClick={meet.toggleHand} />
          <RoundButton icon={Sparkles} label="Hintergrund wählen" tone={local.background !== "none" ? "on" : "idle"} pressed={open === "background"} onClick={() => setOpen(open === "background" ? null : "background")} />
          <span className="mx-0.5 h-6 w-px bg-white/10" aria-hidden />
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
          <Popover open={open === "background"} onClose={() => setOpen(null)} label="Hintergrund">
            <BackgroundPicker value={local.background} onPick={meet.setBackground} loading={meet.busy === "background"} />
          </Popover>
        </motion.div>
      </footer>
    </motion.div>
  );
}

function Goodbye({ ended, onBack }: { ended: boolean; onBack: () => void }) {
  return (
    <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={spring} className="grid flex-1 place-items-center px-6 text-center">
      <div className="max-w-md">
        <motion.span initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ ...spring, delay: 0.1 }} className="mx-auto grid size-16 place-items-center rounded-3xl bg-white/10">
          <PhoneOff className="size-7" aria-hidden />
        </motion.span>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white">{ended ? "Das Meeting wurde beendet" : "Du hast das Meeting verlassen"}</h1>
        <p className="mt-3 text-sm text-night-muted">{ended ? "Der Raum wurde geschlossen. Kamera und Mikrofon sind aus." : "Kamera und Mikrofon sind aus. Über den Link kommst du jederzeit zurück."}</p>
        {!ended && (
          <button type="button" onClick={onBack} className="mt-8 inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full bg-brand-500 px-6 text-sm font-bold shadow-brand outline-none transition-colors hover:bg-brand-400 focus-visible:ring-2 focus-visible:ring-white">
            <Video className="size-4" aria-hidden /> Wieder beitreten
          </button>
        )}
      </div>
    </motion.main>
  );
}
