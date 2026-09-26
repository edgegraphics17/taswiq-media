import {
  Archive,
  Award,
  Handshake,
  Headphones,
  Medal,
  Rocket,
  AudioLines,
  Camera,
  Captions,
  ChartLine,
  Clapperboard,
  Frame,
  Languages,
  Layers,
  MessageSquareText,
  RefreshCw,
  Scissors,
  Smartphone,
  Sparkles,
  Split,
  Target,
  Workflow,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Icon-IDs aus den Content-Configs → Lucide (ein Icon-Set, 1.75px Strich, keine Emojis) */
const ICONS: Record<string, LucideIcon> = {
  archive: Archive,
  award: Award,
  handshake: Handshake,
  headphones: Headphones,
  medal: Medal,
  rocket: Rocket,
  audio: AudioLines,
  camera: Camera,
  captions: Captions,
  chart: ChartLine,
  clapperboard: Clapperboard,
  frame: Frame,
  languages: Languages,
  layers: Layers,
  message: MessageSquareText,
  refresh: RefreshCw,
  scissors: Scissors,
  smartphone: Smartphone,
  sparkles: Sparkles,
  split: Split,
  target: Target,
  workflow: Workflow,
  zap: Zap,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = ICONS[name] ?? Sparkles;
  return <C className={className} strokeWidth={1.75} aria-hidden />;
}
