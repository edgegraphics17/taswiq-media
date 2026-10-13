import { useEffect, useRef } from "react";
import type { LocalState, RemotePeer } from "./useMeet";

/**
 * Mitschrift des Calls über die Spracherkennung des Browsers (Web Speech API) – kein eigener Dienst, keine Kosten.
 *
 * Jeder schreibt zuerst seine eigene Stimme mit. Browser, die das nicht können (Firefox, die meisten Handys), meldet
 * die Stufe 0; ihre Stimme schreibt dann ein anderer Teilnehmer aus der ankommenden Tonspur mit, sofern dessen Browser
 * Tonspuren direkt erkennen kann (Chrome und Edge ab 139). Damit das nur einer tut, übernimmt der mit der kleinsten ID.
 * Die fertigen Sätze gehen als „caption“ ans Backend und landen dort als Chat-Zeilen.
 */

interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: (track?: MediaStreamTrack) => void;
  abort: () => void;
}
type RecognitionClass = (new () => Recognition) & { available?: unknown };

const recognitionClass = (): RecognitionClass | undefined => {
  const w = window as unknown as { SpeechRecognition?: RecognitionClass; webkitSpeechRecognition?: RecognitionClass };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
};

/** 0 = keine Erkennung, 1 = nur das eigene Mikrofon, 2 = beliebige Tonspuren (auch die der anderen). */
export function sttLevel(): number {
  const SR = recognitionClass();
  if (!SR) return 0;
  // `available()` kam zusammen mit der Erkennung auf Tonspuren – ältere Browser würden die Spur ignorieren und das Mikrofon nehmen.
  if (typeof SR.available === "function") return 2;
  // Auf Handys nimmt die Erkennung dem Call das Mikrofon weg.
  const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent));
  return mobile ? 0 : 1;
}

/** Hört dauerhaft zu (die Erkennung endet von selbst nach Pausen und wird neu gestartet). Rückgabe: beenden. */
function listen(track: MediaStreamTrack | null, lang: string, onText: (text: string) => void): () => void {
  const SR = recognitionClass()!;
  let stopped = false;
  let quick = 0;
  let current: Recognition | null = null;
  const start = () => {
    if (stopped || (track && track.readyState !== "live")) return;
    const startedAt = Date.now();
    const rec = (current = new SR());
    rec.lang = lang;
    rec.continuous = true;
    rec.interimResults = false;
    rec.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i]!.isFinal ? e.results[i]![0]?.transcript.trim() : "";
        if (text) onText(text);
      }
    };
    rec.onerror = (e) => {
      if (["not-allowed", "service-not-allowed", "language-not-supported", "audio-capture"].includes(e.error)) stopped = true;
    };
    rec.onend = () => {
      // Bricht die Erkennung mehrfach sofort wieder ab, kann dieser Browser es hier nicht – dann Ruhe geben.
      quick = Date.now() - startedAt < 1500 ? quick + 1 : 0;
      if (quick >= 6) stopped = true;
      if (!stopped) setTimeout(start, 400);
    };
    try {
      if (track) rec.start(track);
      else rec.start();
    } catch {
      stopped = true;
    }
  };
  start();
  return () => {
    stopped = true;
    try {
      current?.abort();
    } catch {}
  };
}

export function useCaptions(meet: { meId: string | null; local: LocalState; peers: RemotePeer[]; setStt: (level: number) => void; caption: (text: string, forPeer?: string) => void }) {
  const { meId, local, peers, setStt, caption } = meet;
  const level = useRef(0);
  const running = useRef(new Map<string, () => void>());

  useEffect(() => {
    level.current = sttLevel();
    setStt(level.current);
    const all = running.current;
    return () => {
      for (const stop of all.values()) stop();
      all.clear();
    };
  }, [setStt]);

  useEffect(() => {
    const lv = level.current;
    const lang = /^en/i.test(navigator.language) ? navigator.language : "de-DE";
    const want = new Map<string, { track: MediaStreamTrack | null; peer?: string }>();
    if (lv && local.mic && local.audio) want.set(`self:${local.audio.id}`, { track: lv === 2 ? local.audio : null });
    if (lv === 2 && meId) {
      const leader = [meId, ...peers.filter((p) => p.state.stt === 2).map((p) => p.id)].sort()[0] === meId;
      for (const p of leader ? peers : []) {
        const track = p.stream.getAudioTracks()[0];
        if (!p.state.stt && p.state.mic && p.connected && track) want.set(`${p.id}:${track.id}`, { track, peer: p.id });
      }
    }
    for (const [key, stop] of running.current) {
      if (want.has(key)) continue;
      stop();
      running.current.delete(key);
    }
    for (const [key, { track, peer }] of want) {
      if (!running.current.has(key)) running.current.set(key, listen(track, lang, (text) => caption(text, peer)));
    }
  }, [meId, local.mic, local.audio, peers, caption]);

}
