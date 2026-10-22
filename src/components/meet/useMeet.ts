"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BackgroundId } from "@/lib/meet";
import { createBackground, type BackgroundEffect } from "./background";

/**
 * Der Call im Browser: eigene Geräte (Mikrofon, Kamera, Bildschirm, Hintergrund), eine WebRTC-Verbindung je
 * Teilnehmer (Mesh – gedacht für Team-Runden bis etwa acht Personen) und die Signalisierung über /api/meet.
 *
 * Jede Verbindung hat von Anfang an drei Spuren: Ton, Kamera und Bildschirm. Stummschalten, Kamera aus, Bildschirm teilen
 * und Hintergründe tauschen nur den Inhalt der Spur (replaceTrack) – es muss nie neu verhandelt werden.
 * Weil der Bildschirm eine eigene Spur hat, bleibt die Kamera beim Teilen sichtbar.
 * Wer neu dazukommt, ruft die anderen an; so gibt es keine gleichzeitigen Angebote.
 */

export interface PeerState {
  mic: boolean;
  cam: boolean;
  screen: boolean;
  hand: boolean;
  /** Mitschrift: 1 = schreibt die eigene Stimme mit, 2 = kann zusätzlich andere mitschreiben (siehe captions.ts) */
  stt?: number;
  /** Nimmt den Call gerade auf – alle sehen den Hinweis */
  rec?: boolean;
}

export interface RemotePeer {
  id: string;
  name: string;
  stream: MediaStream;
  /** Geteilter Bildschirm – eigene Spur neben der Kamera */
  screenStream: MediaStream | null;
  state: PeerState;
  connected: boolean;
  host: boolean;
}

export interface ChatMessage {
  key: number;
  name: string;
  text: string;
  at: number;
  self: boolean;
}

export type DeviceKind = "audioinput" | "videoinput" | "audiooutput";

export interface Reaction {
  key: number;
  from: string;
  emoji: string;
}

export interface LocalState extends PeerState {
  background: BackgroundId;
  stream: MediaStream | null;
  screenStream: MediaStream | null;
  audio: MediaStreamTrack | null;
}

export type Phase = "lobby" | "joining" | "waiting" | "room" | "left" | "ended" | "kicked" | "denied";

interface Signal {
  seq: number;
  type: string;
  from: string;
  name?: string;
  data?: unknown;
}

const OFF: PeerState = { mic: false, cam: false, screen: false, hand: false };
const AUDIO: MediaTrackConstraints = { echoCancellation: true, noiseSuppression: true, autoGainControl: true };
const VIDEO: MediaTrackConstraints = { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 }, facingMode: "user" };
export const SELF = "self";

export function useMeet(code: string) {
  const [phase, setPhase] = useState<Phase>("lobby");
  const [peers, setPeers] = useState<RemotePeer[]>([]);
  const [local, setLocal] = useState<LocalState>({ ...OFF, background: "none", stream: null, screenStream: null, audio: null });
  const [meId, setMeId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"background" | null>(null);
  const [name, setName] = useState("");
  const [host, setHost] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [knocks, setKnocks] = useState<{ id: string; name: string }[]>([]);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [chosen, setChosen] = useState<Record<DeviceKind, string>>({ audioinput: "", videoinput: "", audiooutput: "" });

  const s = useRef({
    me: null as { id: string; key: string } | null,
    name: "",
    ice: [] as RTCIceServer[],
    pcs: new Map<string, RTCPeerConnection>(),
    pendingIce: new Map<string, RTCIceCandidateInit[]>(),
    outbox: [] as { type: string; to?: string; data: unknown }[],
    sending: false,
    lastSeq: 0,
    alive: false,
    abort: null as AbortController | null,
    mic: null as MediaStreamTrack | null,
    cam: null as MediaStreamTrack | null,
    screen: null as MediaStreamTrack | null,
    // Ton des geteilten Tabs (Video, Präsentation) – eigene Spur neben dem Mikrofon
    screenAudio: null as MediaStreamTrack | null,
    micId: "",
    camId: "",
    rec: null as { recorder: MediaRecorder; stop: () => void } | null,
    fx: null as BackgroundEffect | null,
    background: "none" as BackgroundId,
    hand: false,
    stt: 0,
    // Teilnehmer, deren Browser die eigene Bildschirm-Spur kennt (neue Version). Allen anderen geht der Bildschirm wie früher über die Kamera-Spur.
    modern: new Set<string>(),
    starting: false,
    reactionKey: 0,
  }).current;

  const api = `/api/meet/${code}`;
  const outVideo = () => s.fx?.track ?? s.cam;
  const flags = (): PeerState => ({ mic: !!s.mic?.enabled, cam: !!s.cam, screen: !!s.screen, hand: s.hand, stt: s.stt, rec: !!s.rec });
  const audioC = (): MediaTrackConstraints => (s.micId ? { ...AUDIO, deviceId: { exact: s.micId } } : AUDIO);
  const videoC = (): MediaTrackConstraints => (s.camId ? { ...VIDEO, deviceId: { exact: s.camId } } : VIDEO);

  // ─── Signalisierung ───────────────────────────────────────────────
  const flush = useCallback(async () => {
    if (s.sending || !s.me) return;
    s.sending = true;
    while (s.outbox.length && s.me) {
      const messages = s.outbox.splice(0, 40);
      try {
        await fetch(`${api}/send`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...s.me, messages }) });
      } catch {
        s.outbox.unshift(...messages);
        await new Promise((r) => setTimeout(r, 800));
      }
    }
    s.sending = false;
  }, [api, s]);

  const send = useCallback(
    (type: string, data: unknown, to?: string) => {
      s.outbox.push({ type, data, to });
      queueMicrotask(flush);
    },
    [flush, s],
  );

  const refresh = useCallback(() => {
    const video = outVideo();
    setLocal((old) => ({
      ...flags(),
      background: s.background,
      stream: video ? new MediaStream([video]) : null,
      screenStream: s.screen ? (old.screenStream?.getVideoTracks()[0] === s.screen ? old.screenStream : new MediaStream([s.screen])) : null,
      audio: s.mic,
    }));
    if (s.me) send("state", flags());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send, s]);

  // ─── Eigene Spuren ────────────────────────────────────────────────
  /** Bildspuren einer Verbindung in fester Reihenfolge: erst die Kamera, dann der Bildschirm. */
  const videoLines = (pc: RTCPeerConnection) => pc.getTransceivers().filter((t) => t.receiver.track.kind === "video");
  /** Tonspuren: erst das Mikrofon, dann der Ton des geteilten Bildschirms. */
  const audioLines = (pc: RTCPeerConnection) => pc.getTransceivers().filter((t) => t.receiver.track.kind === "audio");

  /** Mesh: jeder schickt sein Bild an jeden. Ab vier Personen wird das eigene Kamerabild kleiner, damit die Leitung reicht. */
  const tune = () => {
    const n = s.pcs.size;
    for (const pc of s.pcs.values()) {
      const cam = videoLines(pc)[0]?.sender;
      const params = cam?.getParameters();
      if (!cam || !params?.encodings?.length) continue;
      params.encodings[0].maxBitrate = n <= 2 ? 1_500_000 : n <= 5 ? 600_000 : 300_000;
      params.encodings[0].scaleResolutionDownBy = n <= 2 ? 1 : n <= 5 ? 1.5 : 2.5;
      void cam.setParameters(params).catch(() => {});
    }
  };

  const syncVideo = useCallback(async () => {
    const video = outVideo() ?? null;
    await Promise.all(
      [...s.pcs].flatMap(([id, pc]) => {
        const [cam, screen] = videoLines(pc);
        const split = !!screen && s.modern.has(id);
        return [
          cam?.sender.replaceTrack(split ? video : (s.screen ?? video)).catch(() => {}),
          screen?.sender.replaceTrack(split ? s.screen : null).catch(() => {}),
          audioLines(pc)[1]?.sender.replaceTrack(s.screenAudio).catch(() => {}),
        ];
      }),
    );
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, s]);

  const syncAudio = useCallback(async () => {
    await Promise.all([...s.pcs.values()].map((pc) => audioLines(pc)[0]?.sender.replaceTrack(s.mic).catch(() => {})));
    refresh();
  }, [refresh, s]);

  /** Hintergrund-Effekt an die aktuelle Kamera hängen bzw. abbauen. */
  const syncEffect = useCallback(async () => {
    const wanted = s.background !== "none" && s.cam;
    if (wanted && s.fx?.source === s.cam) return;
    s.fx?.stop();
    s.fx = null;
    if (!wanted || !s.cam) return;
    setBusy("background");
    try {
      s.fx = await createBackground(s.cam, () => s.background);
    } catch (e) {
      console.error("[meet] Hintergrund nicht verfügbar", e);
      s.background = "none";
      setNotice("Der Hintergrund konnte auf diesem Gerät nicht geladen werden.");
    } finally {
      setBusy(null);
    }
  }, [s]);

  const explain = (e: unknown, what: string) => {
    const name = e instanceof DOMException ? e.name : "";
    if (name === "NotAllowedError") return `Zugriff auf ${what} wurde nicht erlaubt. Bitte in der Adressleiste des Browsers freigeben.`;
    if (name === "NotFoundError") return `Es wurde kein Gerät für ${what} gefunden.`;
    if (name === "NotReadableError") return `${what} wird gerade von einem anderen Programm verwendet.`;
    return `${what} konnte nicht gestartet werden.`;
  };

  /** Vorschau in der Lobby: Kamera und Mikrofon zusammen anfragen (eine Rückfrage), sonst einzeln. */
  const startDevices = useCallback(async () => {
    if (s.mic || s.cam || s.starting) return;
    if (!navigator.mediaDevices?.getUserMedia) return setNotice("Dieser Browser unterstützt keine Videocalls. Bitte Chrome, Edge, Safari oder Firefox verwenden.");
    s.starting = true;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: audioC(), video: videoC() });
      s.mic = stream.getAudioTracks()[0] ?? null;
      s.cam = stream.getVideoTracks()[0] ?? null;
    } catch (first) {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: audioC() }).catch(() => null);
      const video = audio ? null : await navigator.mediaDevices.getUserMedia({ video: videoC() }).catch(() => null);
      s.mic = audio?.getAudioTracks()[0] ?? null;
      s.cam = video?.getVideoTracks()[0] ?? null;
      setNotice(s.mic ? "Ohne Kamera: " + explain(first, "die Kamera") : explain(first, "Kamera und Mikrofon") + " Du kannst trotzdem beitreten und zuhören.");
    }
    s.starting = false;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- audioC/videoC lesen nur die Ref
  }, [refresh, s]);

  const toggleMic = useCallback(async () => {
    if (s.mic) s.mic.enabled = !s.mic.enabled;
    else {
      try {
        s.mic = (await navigator.mediaDevices.getUserMedia({ audio: audioC() })).getAudioTracks()[0];
      } catch (e) {
        return setNotice(explain(e, "das Mikrofon"));
      }
      return syncAudio();
    }
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- audioC/videoC lesen nur die Ref
  }, [refresh, syncAudio, s]);

  const toggleCam = useCallback(async () => {
    if (s.cam) {
      s.cam.stop();
      s.cam = null;
    } else {
      try {
        s.cam = (await navigator.mediaDevices.getUserMedia({ video: videoC() })).getVideoTracks()[0];
      } catch (e) {
        return setNotice(explain(e, "die Kamera"));
      }
    }
    await syncEffect();
    await syncVideo();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- audioC/videoC lesen nur die Ref
  }, [syncEffect, syncVideo, s]);

  const stopScreen = useCallback(async () => {
    s.screen?.stop();
    s.screenAudio?.stop();
    s.screen = s.screenAudio = null;
    await syncVideo();
  }, [syncVideo, s]);

  const toggleScreen = useCallback(async () => {
    if (s.screen) return stopScreen();
    if (!navigator.mediaDevices?.getDisplayMedia) return setNotice("Bildschirm teilen geht auf diesem Gerät nicht – am Computer klappt es in Chrome, Edge, Safari und Firefox.");
    try {
      // Höchstens Full HD: Retina-Auflösung frisst die Bandbreite, das Bild steht dann bei den anderen. Der eigene Tab ist ausgeblendet (sonst Spiegel-Effekt).
      // Ton nur, wenn im Auswahlfenster „Audio teilen“ an ist (geht bei Tabs, unter Windows auch beim ganzen Bildschirm).
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 15 }, width: { max: 1920 }, height: { max: 1080 } },
        audio: true,
        selfBrowserSurface: "exclude",
        surfaceSwitching: "include",
        systemAudio: "include",
      } as DisplayMediaStreamOptions);
      const track = stream.getVideoTracks()[0];
      s.screenAudio = stream.getAudioTracks()[0] ?? null;
      track.contentHint = "detail";
      // „Freigabe beenden“ in der Leiste des Browsers
      track.addEventListener("ended", () => void stopScreen());
      s.screen = track;
      await syncVideo();
    } catch (e) {
      // Abbrechen im Auswahlfenster ist kein Fehler. „by system“ = macOS hat dem Browser die Bildschirmaufnahme nicht erlaubt.
      if (e instanceof DOMException && e.name === "NotAllowedError" && !/system/i.test(e.message)) return;
      setNotice(
        e instanceof DOMException && e.name === "NotAllowedError"
          ? "Dein Computer erlaubt dem Browser die Bildschirmaufnahme nicht. Mac: Systemeinstellungen → Datenschutz & Sicherheit → Bildschirm- & Systemaudioaufnahme → Browser einschalten, Browser neu starten."
          : "Der Bildschirm konnte nicht geteilt werden.",
      );
    }
  }, [stopScreen, syncVideo, s]);

  const setBackground = useCallback(
    async (id: BackgroundId) => {
      s.background = id;
      refresh();
      await syncEffect();
      await syncVideo();
    },
    [refresh, syncEffect, syncVideo, s],
  );

  /** Mitschrift: was dieser Browser kann (für die anderen sichtbar) und eine verstandene Zeile abschicken. */
  const setStt = useCallback(
    (level: number) => {
      s.stt = level;
      refresh();
    },
    [refresh, s],
  );
  const caption = useCallback((text: string, forPeer?: string) => send("caption", { text, for: forPeer }), [send]);

  /** Geräte auflisten (Namen gibt es erst nach der Freigabe von Kamera/Mikrofon). */
  const listDevices = useCallback(async () => {
    const all = (await navigator.mediaDevices?.enumerateDevices?.().catch(() => [])) ?? [];
    setDevices(all.filter((d) => d.deviceId && d.deviceId !== "default" && d.deviceId !== "communications"));
    setChosen((c) => ({ ...c, audioinput: s.mic?.getSettings().deviceId ?? c.audioinput, videoinput: s.cam?.getSettings().deviceId ?? c.videoinput }));
  }, [s]);

  const chooseDevice = useCallback(
    async (kind: DeviceKind, id: string) => {
      setChosen((c) => ({ ...c, [kind]: id }));
      if (kind === "audiooutput") return;
      try {
        if (kind === "audioinput") {
          s.micId = id;
          if (!s.mic) return;
          const next = (await navigator.mediaDevices.getUserMedia({ audio: audioC() })).getAudioTracks()[0];
          next.enabled = s.mic.enabled;
          s.mic.stop();
          s.mic = next;
          await syncAudio();
        } else {
          s.camId = id;
          if (!s.cam) return;
          const next = (await navigator.mediaDevices.getUserMedia({ video: videoC() })).getVideoTracks()[0];
          s.cam.stop();
          s.cam = next;
          await syncEffect();
          await syncVideo();
        }
      } catch (e) {
        setNotice(explain(e, kind === "audioinput" ? "das Mikrofon" : "die Kamera"));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [syncAudio, syncEffect, syncVideo, s],
  );

  const sendChat = useCallback(
    (text: string) => {
      const clean = text.trim().slice(0, 2000);
      if (!clean) return;
      setChat((list) => [...list, { key: ++s.reactionKey, name: s.name, text: clean, at: Date.now(), self: true }]);
      send("chat", { text: clean, name: s.name });
    },
    [send, s],
  );

  // Gastgeber-Rechte – der Server prüft, ob der Absender wirklich Gastgeber ist.
  const admit = useCallback(
    (id: string, ok: boolean) => {
      setKnocks((list) => list.filter((k) => k.id !== id));
      send("admit", { id, ok });
    },
    [send],
  );
  const mutePeer = useCallback((id: string) => send("mute", { id }), [send]);
  const kick = useCallback((id: string) => send("kick", { id }), [send]);
  const endForAll = useCallback(() => send("end", null), [send]);

  /**
   * Aufnahme im eigenen Browser: der Tab mit dem Call wird aufgezeichnet (Bild + Ton der anderen), dazu das eigene Mikrofon.
   * Am Ende lädt der Browser die Datei herunter – nichts liegt auf einem Server. Alle sehen „Aufnahme läuft“.
   */
  const toggleRecording = useCallback(async () => {
    if (s.rec) return s.rec.stop();
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") return setNotice("Aufnehmen geht in diesem Browser nicht – am Computer in Chrome oder Edge.");
    let capture: MediaStream;
    try {
      capture = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 24 } }, audio: true, preferCurrentTab: true, selfBrowserSurface: "include" } as DisplayMediaStreamOptions);
    } catch {
      return;
    }
    const ctx = new AudioContext();
    const mix = ctx.createMediaStreamDestination();
    for (const t of [...capture.getAudioTracks(), ...(s.mic ? [s.mic] : [])]) ctx.createMediaStreamSource(new MediaStream([t])).connect(mix);
    const type = ["video/webm;codecs=vp9,opus", "video/webm", "video/mp4"].find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
    const recorder = new MediaRecorder(new MediaStream([...capture.getVideoTracks(), ...mix.stream.getAudioTracks()]), type ? { mimeType: type } : undefined);
    const parts: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && parts.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(parts, { type: recorder.mimeType });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `meeting-${new Date().toISOString().slice(0, 16).replace(/[T:]/g, "-")}.${recorder.mimeType.includes("mp4") ? "mp4" : "webm"}`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 60_000);
    };
    const stop = () => {
      if (recorder.state !== "inactive") recorder.stop();
      for (const t of capture.getTracks()) t.stop();
      void ctx.close();
      s.rec = null;
      refresh();
    };
    capture.getVideoTracks()[0]?.addEventListener("ended", stop);
    recorder.start(1000);
    s.rec = { recorder, stop };
    refresh();
  }, [refresh, s]);

  const toggleHand = useCallback(() => {
    s.hand = !s.hand;
    refresh();
  }, [refresh, s]);

  const showReaction = useCallback(
    (from: string, emoji: string) => {
      const key = ++s.reactionKey;
      setReactions((list) => [...list.slice(-11), { key, from, emoji }]);
      setTimeout(() => setReactions((list) => list.filter((r) => r.key !== key)), 2600);
    },
    [s],
  );

  const react = useCallback(
    (emoji: string) => {
      showReaction(SELF, emoji);
      send("reaction", { emoji });
    },
    [send, showReaction],
  );

  // ─── Verbindungen ─────────────────────────────────────────────────
  const patchPeer = (id: string, patch: Partial<RemotePeer>) => setPeers((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const addPeer = (id: string, name: string, host = false) =>
    setPeers((list) => (list.some((p) => p.id === id) ? list : [...list, { id, name, stream: new MediaStream(), screenStream: null, state: OFF, connected: false, host }]));
  const dropPeer = (id: string) => {
    s.pcs.get(id)?.close();
    s.pcs.delete(id);
    s.pendingIce.delete(id);
    s.modern.delete(id);
    setPeers((list) => list.filter((p) => p.id !== id));
    setKnocks((list) => list.filter((k) => k.id !== id));
    tune();
  };

  const offer = async (id: string, pc: RTCPeerConnection, iceRestart = false) => {
    await pc.setLocalDescription(await pc.createOffer({ iceRestart }));
    send("offer", pc.localDescription, id);
  };

  const connect = (id: string, caller: boolean) => {
    const pc = new RTCPeerConnection({ iceServers: s.ice });
    s.pcs.set(id, pc);
    pc.onicecandidate = (e) => e.candidate && send("ice", e.candidate.toJSON(), id);
    pc.ontrack = (e) =>
      setPeers((list) =>
        list.map((p) => {
          if (p.id !== id) return p;
          // Bildschirm (zweite Bildspur) und sein Ton (zweite Tonspur) landen zusammen im Bildschirm-Stream.
          if ((e.track.kind === "video" ? videoLines(pc) : audioLines(pc)).indexOf(e.transceiver) > 0)
            return { ...p, screenStream: new MediaStream([...(p.screenStream?.getTracks().filter((t) => t.kind !== e.track.kind) ?? []), e.track]) };
          // Neues Stream-Objekt, damit die Kachel neu zeichnet und die Tonanalyse die Spur sieht.
          return { ...p, stream: new MediaStream([...p.stream.getTracks().filter((t) => t !== e.track), e.track]) };
        }),
      );
    pc.onconnectionstatechange = () => {
      patchPeer(id, { connected: pc.connectionState === "connected" });
      // Netzwechsel (WLAN → Mobilfunk): der Anrufer baut die Verbindung neu auf.
      if (pc.connectionState === "failed" && caller && s.pcs.get(id) === pc) void offer(id, pc, true).catch(() => {});
    };
    return pc;
  };

  const call = async (id: string) => {
    const pc = connect(id, true);
    await pc.addTransceiver("audio", { direction: "sendrecv" }).sender.replaceTrack(s.mic);
    const split = s.modern.has(id);
    await pc.addTransceiver("video", { direction: "sendrecv" }).sender.replaceTrack((split ? null : s.screen) ?? outVideo() ?? null);
    await pc.addTransceiver("video", { direction: "sendrecv" }).sender.replaceTrack(split ? s.screen : null);
    await pc.addTransceiver("audio", { direction: "sendrecv" }).sender.replaceTrack(s.screenAudio);
    await offer(id, pc);
  };

  const handle = async (m: Signal) => {
    const pc = s.pcs.get(m.from);
    switch (m.type) {
      case "join":
        addPeer(m.from, m.name ?? "Gast", !!(m.data as { host?: boolean } | null)?.host);
        send("state", flags(), m.from);
        break;
      case "leave":
        dropPeer(m.from);
        break;
      case "ended":
        hangUp("ended");
        break;
      case "kicked":
      case "denied":
        hangUp(m.type);
        break;
      case "knock":
        setKnocks((list) => (list.some((k) => k.id === m.from) ? list : [...list, { id: m.from, name: m.name ?? "Gast" }]));
        break;
      case "knocked":
        setKnocks((list) => list.filter((k) => k.id !== m.from));
        break;
      case "admitted":
        await meetPeers((m.data as { peers?: { id: string; name: string; host?: boolean }[] })?.peers ?? []);
        setPhase("room");
        break;
      case "mute":
        if (s.mic?.enabled) {
          s.mic.enabled = false;
          refresh();
          setNotice("Der Gastgeber hat dich stummgeschaltet. Mit M oder dem Mikrofon-Knopf schaltest du dich wieder ein.");
        }
        break;
      case "chat": {
        const d = m.data as { text?: unknown; name?: unknown } | null;
        const text = String(d?.text ?? "").slice(0, 2000);
        if (text) setChat((list) => [...list.slice(-199), { key: ++s.reactionKey, name: String(d?.name ?? "Gast").slice(0, 40), text, at: Date.now(), self: false }]);
        break;
      }
      case "offer": {
        addPeer(m.from, "Gast");
        const answering = pc ?? connect(m.from, false);
        await answering.setRemoteDescription(m.data as RTCSessionDescriptionInit);
        const lines = videoLines(answering);
        for (const t of answering.getTransceivers()) {
          t.direction = "sendrecv";
          const split = lines.length > 1 && s.modern.has(m.from);
          await t.sender.replaceTrack(
            t.receiver.track.kind === "audio"
              ? audioLines(answering).indexOf(t) > 0
                ? s.screenAudio
                : s.mic
              : lines.indexOf(t) > 0
                ? split
                  ? s.screen
                  : null
                : ((split ? null : s.screen) ?? outVideo() ?? null),
          );
        }
        await answering.setLocalDescription(await answering.createAnswer());
        send("answer", answering.localDescription, m.from);
        tune();
        for (const c of s.pendingIce.get(m.from) ?? []) await answering.addIceCandidate(c).catch(() => {});
        s.pendingIce.delete(m.from);
        break;
      }
      case "answer":
        if (!pc) break;
        await pc.setRemoteDescription(m.data as RTCSessionDescriptionInit);
        tune();
        for (const c of s.pendingIce.get(m.from) ?? []) await pc.addIceCandidate(c).catch(() => {});
        s.pendingIce.delete(m.from);
        break;
      case "ice":
        if (pc?.remoteDescription) await pc.addIceCandidate(m.data as RTCIceCandidateInit).catch(() => {});
        else s.pendingIce.set(m.from, [...(s.pendingIce.get(m.from) ?? []), m.data as RTCIceCandidateInit]);
        break;
      case "state":
        patchPeer(m.from, { state: { ...OFF, ...(m.data as Partial<PeerState>) } });
        if (typeof (m.data as Partial<PeerState>)?.stt === "number" && !s.modern.has(m.from)) {
          s.modern.add(m.from);
          if (s.screen) void syncVideo();
        }
        break;
      case "reaction":
        showReaction(m.from, String((m.data as { emoji?: string })?.emoji ?? "").slice(0, 8));
        break;
    }
  };

  const closeAll = () => {
    for (const pc of s.pcs.values()) pc.close();
    s.pcs.clear();
    s.pendingIce.clear();
    s.modern.clear();
    s.outbox.length = 0;
    setPeers([]);
    setKnocks([]);
  };

  /** Mit allen schon Anwesenden verbinden (nach dem Beitritt oder dem Einlass aus dem Warteraum). */
  const meetPeers = async (list: { id: string; name: string; host?: boolean }[]) => {
    for (const p of list) addPeer(p.id, p.name, !!p.host);
    for (const p of list) await call(p.id).catch((e) => console.error("[meet] Anruf fehlgeschlagen", e));
    send("state", flags());
  };

  /** Beitreten: „room“ = drin, „waiting“ = im Warteraum, bis der Gastgeber einlässt. */
  const enter = async (): Promise<"room" | "waiting" | false> => {
    const res = await fetch(`${api}/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: s.name }) });
    const data = (await res.json().catch(() => ({}))) as {
      id?: string;
      key?: string;
      host?: boolean;
      waiting?: boolean;
      peers?: { id: string; name: string; host?: boolean }[];
      iceServers?: RTCIceServer[];
      error?: string;
    };
    if (!res.ok || !data.id || !data.key) {
      setNotice(
        data.error === "full" ? "Das Meeting ist voll (12 Personen)." : data.error === "notFound" ? "Dieses Meeting wurde beendet." : "Beitreten hat nicht geklappt. Bitte versuch es noch einmal.",
      );
      return false;
    }
    s.me = { id: data.id, key: data.key };
    setMeId(data.id);
    s.ice = data.iceServers ?? [];
    s.lastSeq = 0;
    setHost(!!data.host);
    if (data.waiting) return "waiting";
    await meetPeers(data.peers ?? []);
    return "room";
  };

  const poll = async () => {
    while (s.alive && s.me) {
      s.abort = new AbortController();
      try {
        const res = await fetch(`${api}/poll?${new URLSearchParams({ id: s.me.id, key: s.me.key, after: String(s.lastSeq) })}`, { signal: s.abort.signal, cache: "no-store" });
        if (res.status === 410 || res.status === 404) {
          // Backend neu gestartet oder wir waren zu lange weg → einmal sauber neu beitreten.
          closeAll();
          s.me = null;
          const again = res.status === 404 ? false : await enter();
          if (!again) return hangUp("ended");
          setPhase(again);
          continue;
        }
        if (!res.ok) throw new Error(String(res.status));
        const { messages } = (await res.json()) as { messages: Signal[] };
        for (const m of messages) {
          if (m.seq <= s.lastSeq) continue;
          s.lastSeq = m.seq;
          await handle(m).catch((e) => console.error("[meet] Nachricht nicht verarbeitet", m.type, e));
        }
      } catch {
        if (s.alive) await new Promise((r) => setTimeout(r, 1000));
      }
    }
  };

  const join = async (name: string) => {
    s.name = name.trim().slice(0, 40);
    if (!s.name) return;
    setName(s.name);
    setNotice(null);
    setPhase("joining");
    s.alive = true;
    const ok = await enter().catch(() => (setNotice("Keine Verbindung. Bitte prüf dein Internet und versuch es noch einmal."), false as const));
    if (!ok) {
      s.alive = false;
      return setPhase("lobby");
    }
    setChat([]);
    setPhase(ok);
    void poll();
  };

  const goodbye = () => {
    if (s.me) navigator.sendBeacon(`${api}/leave`, new Blob([JSON.stringify(s.me)], { type: "application/json" }));
    s.me = null;
  };

  function hangUp(next: "left" | "ended" | "kicked" | "denied" = "left") {
    s.rec?.stop();
    s.alive = false;
    s.abort?.abort();
    goodbye();
    closeAll();
    s.fx?.stop();
    s.fx = null;
    for (const t of [s.mic, s.cam, s.screen, s.screenAudio]) t?.stop();
    s.mic = s.cam = s.screen = s.screenAudio = null;
    s.hand = false;
    setLocal({ ...OFF, background: s.background, stream: null, screenStream: null, audio: null });
    setPhase(next);
  }

  /** Aus „Verlassen“ zurück in die Vorschau */
  const backToLobby = () => {
    setPhase("lobby");
    void startDevices();
  };

  // Tab schließen = Raum verlassen; beim Abbau der Seite alles freigeben (Kamera-Licht aus).
  useEffect(() => {
    window.addEventListener("pagehide", goodbye);
    return () => {
      window.removeEventListener("pagehide", goodbye);
      s.alive = false;
      s.abort?.abort();
      goodbye();
      for (const pc of s.pcs.values()) pc.close();
      s.fx?.stop();
      for (const t of [s.mic, s.cam, s.screen]) t?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    meId,
    setStt,
    caption,
    name,
    phase,
    peers,
    local,
    reactions,
    notice,
    busy,
    setNotice,
    startDevices,
    join,
    hangUp,
    backToLobby,
    toggleMic,
    toggleCam,
    toggleScreen,
    toggleHand,
    setBackground,
    react,
    host,
    chat,
    sendChat,
    knocks,
    admit,
    mutePeer,
    kick,
    endForAll,
    toggleRecording,
    devices,
    chosen,
    listDevices,
    chooseDevice,
  };
}
