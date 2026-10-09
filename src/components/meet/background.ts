import { BACKGROUNDS, type BackgroundId } from "@/lib/meet";

/**
 * Virtueller Hintergrund: trennt die Person per MediaPipe-Segmentierung vom Kamerabild und setzt sie vor
 * einen Farbverlauf oder das weichgezeichnete Original. Läuft komplett im Browser; Modell und WASM werden
 * erst geladen, wenn jemand einen Hintergrund wählt.
 */
const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.0/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite";

export interface BackgroundEffect {
  track: MediaStreamTrack;
  source: MediaStreamTrack;
  stop: () => void;
}

function paint(canvas: HTMLCanvasElement, id: BackgroundId) {
  const colors = BACKGROUNDS.find((b) => b.id === id)?.colors;
  const ctx = canvas.getContext("2d");
  if (!colors || !ctx) return;
  const { width: w, height: h } = canvas;
  const base = ctx.createLinearGradient(0, 0, w, h);
  base.addColorStop(0, colors[0]);
  base.addColorStop(1, colors[1]);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.78, h * 0.18, 0, w * 0.78, h * 0.18, w * 0.42);
  glow.addColorStop(0, `${colors[2]}aa`);
  glow.addColorStop(1, `${colors[2]}00`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
}

export async function createBackground(source: MediaStreamTrack, current: () => BackgroundId): Promise<BackgroundEffect> {
  const { FilesetResolver, ImageSegmenter } = await import("@mediapipe/tasks-vision");
  const files = await FilesetResolver.forVisionTasks(WASM);
  const options = (delegate: "GPU" | "CPU") => ({ baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "VIDEO" as const, outputCategoryMask: false, outputConfidenceMasks: true });
  const segmenter = await ImageSegmenter.createFromOptions(files, options("GPU")).catch(() => ImageSegmenter.createFromOptions(files, options("CPU")));

  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.srcObject = new MediaStream([source]);
  await video.play();

  const settings = source.getSettings();
  const W = Math.min(settings.width ?? 960, 960);
  const H = Math.round(W * ((settings.height ?? 540) / (settings.width ?? 960)));
  const out = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const scene = Object.assign(document.createElement("canvas"), { width: W, height: H });
  const maskCanvas = document.createElement("canvas");
  const ctx = out.getContext("2d")!;
  const maskCtx = maskCanvas.getContext("2d")!;
  let painted: BackgroundId | null = null;
  let pixels: ImageData | null = null;

  const frame = () => {
    if (video.readyState < 2) return;
    const id = current();
    const result = segmenter.segmentForVideo(video, performance.now());
    const mask = result.confidenceMasks?.[0];
    if (!mask) return result.close();
    // Konfidenz „Person“ (0–1) → Deckkraft, mit weichem Übergang an der Kante.
    const values = mask.getAsFloat32Array();
    if (!pixels || pixels.width !== mask.width || pixels.height !== mask.height) {
      maskCanvas.width = mask.width;
      maskCanvas.height = mask.height;
      pixels = maskCtx.createImageData(mask.width, mask.height);
    }
    for (let i = 0; i < values.length; i++) pixels.data[i * 4 + 3] = Math.max(0, Math.min(255, (values[i] - 0.25) * 510));
    maskCtx.putImageData(pixels, 0, 0);
    result.close();

    ctx.globalCompositeOperation = "copy";
    ctx.filter = "blur(3px)";
    ctx.drawImage(maskCanvas, 0, 0, W, H);
    ctx.filter = "none";
    ctx.globalCompositeOperation = "source-in";
    ctx.drawImage(video, 0, 0, W, H);
    ctx.globalCompositeOperation = "destination-over";
    if (id === "blur" || id === "none") {
      ctx.filter = "blur(16px)";
      ctx.drawImage(video, -24, -24, W + 48, H + 48);
      ctx.filter = "none";
    } else {
      if (painted !== id) paint(scene, (painted = id));
      ctx.drawImage(scene, 0, 0);
    }
  };

  // Timer statt requestAnimationFrame: der Call soll auch weiterlaufen, wenn der Tab im Hintergrund liegt.
  const timer = setInterval(() => {
    try {
      frame();
    } catch (e) {
      console.warn("[meet] Hintergrund-Bild übersprungen", e);
    }
  }, 40);
  const track = out.captureStream(25).getVideoTracks()[0];

  return {
    track,
    source,
    stop() {
      clearInterval(timer);
      track.stop();
      video.srcObject = null;
      segmenter.close();
    },
  };
}
