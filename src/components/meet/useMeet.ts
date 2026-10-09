"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { BackgroundId } from "@/lib/meet";
import { createBackground, type BackgroundEffect } from "./background";

/**
 * Der Call im Browser: eigene Geräte (Mikrofon, Kamera, Bildschirm, Hintergrund), eine WebRTC-Verbindung je
 * Teilnehmer (Mesh – gedacht für Team-Runden bis etwa acht Personen) und die Signalisierung über /api/meet.
 *
 * Jede Verbindung hat von Anfang an genau eine Ton- und eine Bildspur. Stummschalten, Kamera aus, Bildschirm teilen
 * und Hintergründe tauschen nur den Inhalt der Spur (replaceTrack) – es muss nie neu verhandelt werden.
 * Wer neu dazukommt, ruft die anderen an; so gibt es keine gleichzeitigen Angebote.
 */

export interface PeerState {
  mic: boolean;
  cam: boolean;
  screen: boolean;
  hand: boolean;
}

export interface RemotePeer {
  id: string;
  name: string;
  stream: MediaStream;
  state: PeerState;
  connected: boolean;
}

export interface Reaction {
  key: number;
  from: string;
  emoji: string;
}

export interface LocalState extends PeerState {
  background: BackgroundId;
  stream: MediaStream | null;
  audio: MediaStreamTrack | null;
}

export type Phase = "lobby" | "joining" | "room" | "left" | "ended";

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
  const [local, setLocal] = useState<LocalState>({ ...OFF, background: "none", stream: null, audio: null });
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState<"background" | null>(null);

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
    fx: null as BackgroundEffect | null,
    background: "none" as BackgroundId,
    hand: false,
    starting: false,
    reactionKey: 0,
  }).current;

  const api = `/api/meet/${code}`;
  const outVideo = () => s.screen ?? s.fx?.track ?? s.cam;
  const flags = (): PeerState => ({ mic: !!s.mic?.enabled, cam: !!s.cam, screen: !!s.screen, hand: s.hand });

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
    setLocal({ ...flags(), background: s.background, stream: video ? new MediaStream([video]) : null, audio: s.mic });
    if (s.me) send("state", flags());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [send, s]);

  // ─── Eigene Spuren ────────────────────────────────────────────────
  const sender = (pc: RTCPeerConnection, kind: "audio" | "video") => pc.getTransceivers().find((t) => t.receiver.track.kind === kind)?.sender;

  const syncVideo = useCallback(async () => {
    const video = outVideo() ?? null;
    await Promise.all([...s.pcs.values()].map((pc) => sender(pc, "video")?.replaceTrack(video).catch(() => {})));
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh, s]);

  const syncAudio = useCallback(async () => {
    await Promise.all([...s.pcs.values()].map((pc) => sender(pc, "audio")?.replaceTrack(s.mic).catch(() => {})));
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
    s.starting = true;
    if (!navigator.mediaDevices?.getUserMedia) return setNotice("Dieser Browser unterstützt keine Videocalls. Bitte Chrome, Edge, Safari oder Firefox verwenden.");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: AUDIO, video: VIDEO });
      s.mic = stream.getAudioTracks()[0] ?? null;
      s.cam = stream.getVideoTracks()[0] ?? null;
    } catch (first) {
      const audio = await navigator.mediaDevices.getUserMedia({ audio: AUDIO }).catch(() => null);
      const video = audio ? null : await navigator.mediaDevices.getUserMedia({ video: VIDEO }).catch(() => null);
      s.mic = audio?.getAudioTracks()[0] ?? null;
      s.cam = video?.getVideoTracks()[0] ?? null;
      setNotice(s.mic ? "Ohne Kamera: " + explain(first, "die Kamera") : explain(first, "Kamera und Mikrofon") + " Du kannst trotzdem beitreten und zuhören.");
    }
    s.starting = false;
    refresh();
  }, [refresh, s]);

  const toggleMic = useCallback(async () => {
    if (s.mic) s.mic.enabled = !s.mic.enabled;
    else {
      try {
        s.mic = (await navigator.mediaDevices.getUserMedia({ audio: AUDIO })).getAudioTracks()[0];
      } catch (e) {
        return setNotice(explain(e, "das Mikrofon"));
      }
      return syncAudio();
    }
    refresh();
  }, [refresh, syncAudio, s]);

  const toggleCam = useCallback(async () => {
    if (s.cam) {
      s.cam.stop();
      s.cam = null;
    } else {
      try {
        s.cam = (await navigator.mediaDevices.getUserMedia({ video: VIDEO })).getVideoTracks()[0];
      } catch (e) {
        return setNotice(explain(e, "die Kamera"));
      }
    }
    await syncEffect();
    await syncVideo();
  }, [syncEffect, syncVideo, s]);

  const stopScreen = useCallback(async () => {
    s.screen?.stop();
    s.screen = null;
    await syncVideo();
  }, [syncVideo, s]);

  const toggleScreen = useCallback(async () => {
    if (s.screen) return stopScreen();
    if (!navigator.mediaDevices?.getDisplayMedia) return setNotice("Bildschirm teilen geht auf diesem Gerät nicht – am Computer klappt es in Chrome, Edge, Safari und Firefox.");
    try {
      const track = (await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: { ideal: 15 } }, audio: false })).getVideoTracks()[0];
      track.contentHint = "detail";
      // „Freigabe beenden“ in der Leiste des Browsers
      track.addEventListener("ended", () => void stopScreen());
      s.screen = track;
      await syncVideo();
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "NotAllowedError")) setNotice("Der Bildschirm konnte nicht geteilt werden.");
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
  const addPeer = (id: string, name: string) =>
    setPeers((list) => (list.some((p) => p.id === id) ? list : [...list, { id, name, stream: new MediaStream(), state: OFF, connected: false }]));
  const dropPeer = (id: string) => {
    s.pcs.get(id)?.close();
    s.pcs.delete(id);
    s.pendingIce.delete(id);
    setPeers((list) => list.filter((p) => p.id !== id));
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
    await pc.addTransceiver("video", { direction: "sendrecv" }).sender.replaceTrack(outVideo() ?? null);
    await offer(id, pc);
  };

  const handle = async (m: Signal) => {
    const pc = s.pcs.get(m.from);
    switch (m.type) {
      case "join":
        addPeer(m.from, m.name ?? "Gast");
        send("state", flags(), m.from);
        break;
      case "leave":
        dropPeer(m.from);
        break;
      case "ended":
        hangUp("ended");
        break;
      case "offer": {
        addPeer(m.from, "Gast");
        const answering = pc ?? connect(m.from, false);
        await answering.setRemoteDescription(m.data as RTCSessionDescriptionInit);
        for (const t of answering.getTransceivers()) {
          t.direction = "sendrecv";
          await t.sender.replaceTrack(t.receiver.track.kind === "audio" ? s.mic : (outVideo() ?? null));
        }
        await answering.setLocalDescription(await answering.createAnswer());
        send("answer", answering.localDescription, m.from);
        for (const c of s.pendingIce.get(m.from) ?? []) await answering.addIceCandidate(c).catch(() => {});
        s.pendingIce.delete(m.from);
        break;
      }
      case "answer":
        if (!pc) break;
        await pc.setRemoteDescription(m.data as RTCSessionDescriptionInit);
        for (const c of s.pendingIce.get(m.from) ?? []) await pc.addIceCandidate(c).catch(() => {});
        s.pendingIce.delete(m.from);
        break;
      case "ice":
        if (pc?.remoteDescription) await pc.addIceCandidate(m.data as RTCIceCandidateInit).catch(() => {});
        else s.pendingIce.set(m.from, [...(s.pendingIce.get(m.from) ?? []), m.data as RTCIceCandidateInit]);
        break;
      case "state":
        patchPeer(m.from, { state: { ...OFF, ...(m.data as Partial<PeerState>) } });
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
    s.outbox.length = 0;
    setPeers([]);
  };

  const enter = async (): Promise<boolean> => {
    const res = await fetch(`${api}/join`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name: s.name }) });
    const data = (await res.json().catch(() => ({}))) as { id?: string; key?: string; peers?: { id: string; name: string }[]; iceServers?: RTCIceServer[]; error?: string };
    if (!res.ok || !data.id || !data.key) {
      setNotice(
        data.error === "full" ? "Das Meeting ist voll (12 Personen)." : data.error === "notFound" ? "Dieses Meeting wurde beendet." : "Beitreten hat nicht geklappt. Bitte versuch es noch einmal.",
      );
      return false;
    }
    s.me = { id: data.id, key: data.key };
    s.ice = data.iceServers ?? [];
    s.lastSeq = 0;
    for (const p of data.peers ?? []) addPeer(p.id, p.name);
    for (const p of data.peers ?? []) await call(p.id).catch((e) => console.error("[meet] Anruf fehlgeschlagen", e));
    send("state", flags());
    return true;
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
          if (res.status === 404 || !(await enter())) return hangUp("ended");
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
    setNotice(null);
    setPhase("joining");
    s.alive = true;
    const ok = await enter().catch(() => (setNotice("Keine Verbindung. Bitte prüf dein Internet und versuch es noch einmal."), false));
    if (!ok) {
      s.alive = false;
      return setPhase("lobby");
    }
    setPhase("room");
    void poll();
  };

  const goodbye = () => {
    if (s.me) navigator.sendBeacon(`${api}/leave`, new Blob([JSON.stringify(s.me)], { type: "application/json" }));
    s.me = null;
  };

  function hangUp(next: "left" | "ended" = "left") {
    s.alive = false;
    s.abort?.abort();
    goodbye();
    closeAll();
    s.fx?.stop();
    s.fx = null;
    for (const t of [s.mic, s.cam, s.screen]) t?.stop();
    s.mic = s.cam = s.screen = null;
    s.hand = false;
    setLocal({ ...OFF, background: s.background, stream: null, audio: null });
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

  return { phase, peers, local, reactions, notice, busy, setNotice, startDevices, join, hangUp, backToLobby, toggleMic, toggleCam, toggleScreen, toggleHand, setBackground, react };
}
