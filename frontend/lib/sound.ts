export type SoundKind = "minor" | "major" | "legendary" | "level_up_minor" | "level_up_major";

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const Ctx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    audioCtx = new Ctx();
  }
  return audioCtx;
}

function tone(ctx: AudioContext, freq: number, start: number, duration: number, gainValue: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.01);
}

export function playSound(kind: SoundKind) {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + 0.01;
  switch (kind) {
    case "minor":
      tone(ctx, 640, now, 0.12, 0.04);
      break;
    case "major":
      tone(ctx, 720, now, 0.12, 0.06);
      tone(ctx, 880, now + 0.08, 0.14, 0.05);
      break;
    case "legendary":
      tone(ctx, 620, now, 0.14, 0.05);
      tone(ctx, 930, now + 0.1, 0.16, 0.06);
      tone(ctx, 1240, now + 0.22, 0.2, 0.06);
      break;
    case "level_up_minor":
      tone(ctx, 540, now, 0.12, 0.05);
      tone(ctx, 760, now + 0.1, 0.14, 0.06);
      break;
    case "level_up_major":
      tone(ctx, 520, now, 0.13, 0.05);
      tone(ctx, 780, now + 0.1, 0.16, 0.07);
      tone(ctx, 1040, now + 0.2, 0.2, 0.07);
      break;
    default:
      break;
  }
}
