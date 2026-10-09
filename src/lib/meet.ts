/** Videocalls (/meet): gemeinsame Typen und Vorgaben für Website, Dashboard und Call-Raum. */

export interface MeetRoom {
  code: string;
  title: string;
  created_by: string | null;
  created_at: string;
  /** Teilnehmer, die gerade im Raum sind */
  live: number;
}

export const MEET_CODE = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
export const meetPath = (code: string) => `/meet/${code}`;

export const REACTIONS = ["👍", "👏", "❤️", "😂", "🎉", "🔥", "😮", "🙌"] as const;

export type BackgroundId = "none" | "blur" | "aurora" | "ozean" | "abend" | "wald" | "studio";

/** Farbverläufe der virtuellen Hintergründe: zwei Grundfarben und ein Lichtfleck – dieselben Werte für Vorschau und Kamerabild. */
export const BACKGROUNDS: { id: BackgroundId; label: string; colors?: [string, string, string] }[] = [
  { id: "none", label: "Ohne" },
  { id: "blur", label: "Weichzeichnen" },
  { id: "aurora", label: "Aurora", colors: ["#2a1470", "#7840fe", "#f9cfd4"] },
  { id: "ozean", label: "Ozean", colors: ["#06283d", "#1363df", "#9be8ff"] },
  { id: "abend", label: "Abendrot", colors: ["#3b0a45", "#e0566e", "#ffd08a"] },
  { id: "wald", label: "Wald", colors: ["#062a1c", "#1daf59", "#d7ffb8"] },
  { id: "studio", label: "Studio", colors: ["#0c0c10", "#2c2c31", "#8a8a96"] },
];

export const backgroundCss = (c: [string, string, string]) => `radial-gradient(circle at 78% 18%, ${c[2]}aa 0%, transparent 42%), linear-gradient(135deg, ${c[0]} 0%, ${c[1]} 100%)`;
