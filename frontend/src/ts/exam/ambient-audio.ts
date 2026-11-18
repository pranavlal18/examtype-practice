/**
 * Exam-hall ambient noise for ExamType: subtle procedural typing clatter
 * and a faint room-tone murmur, generated with Web Audio. No audio assets,
 * no licensing, fully offline. Toggle is stored in localStorage
 * (`examAmbientNoise`), default OFF — in real exams the hall is never silent,
 * but neither should you be tortured by a soundscape you never asked for.
 */

const STORAGE_KEY = "examAmbientNoise";

export function getExamAmbientNoise(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    return false;
  }
}

export function setExamAmbientNoise(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // private mode etc. — non-fatal
  }
}

const PACING_KEY = "examPaceTarget";
const PACING_OPTIONS = [30, 35, 40, 45] as const;
export type PaceTarget = (typeof PACING_OPTIONS)[number];

export function getExamPaceTarget(): PaceTarget {
  try {
    const raw = window.localStorage.getItem(PACING_KEY);
    const parsed = raw === null ? NaN : Number(raw);
    return PACING_OPTIONS.includes(parsed as PaceTarget)
      ? (parsed as PaceTarget)
      : 40;
  } catch {
    return 40;
  }
}

export function setExamPaceTarget(target: PaceTarget): void {
  try {
    window.localStorage.setItem(PACING_KEY, String(target));
  } catch {
    // ignore
  }
}

export function nextPaceTarget(current: PaceTarget): PaceTarget {
  const idx = PACING_OPTIONS.indexOf(current);
  return PACING_OPTIONS[(idx + 1) % PACING_OPTIONS.length] ?? 40;
}

function createNoiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  // pink-ish noise via filtered random walk, good enough for murmur/clatter
  let last = 0;
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1;
    last = 0.96 * last + 0.04 * white;
    data[i] = last * 3.5;
  }
  return buffer;
}

export class AmbientAudio {
  private ctx: AudioContext | null = null;
  private murmurGain: GainNode | null = null;
  private active = false;

  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return (
      typeof AudioContext !== "undefined" ||
      typeof (window as unknown as { webkitAudioContext?: unknown })
        .webkitAudioContext !== "undefined"
    );
  }

  private ensureContext(): AudioContext | null {
    if (!AmbientAudio.isSupported()) return null;
    if (this.ctx === null) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      this.ctx = new Ctor();
    }
    return this.ctx;
  }

  /** start the quiet room-tone murmur (call on test start) */
  start(): void {
    const ctx = this.ensureContext();
    if (ctx === null) return;
    void ctx.resume();
    if (this.murmurGain !== null) {
      // already running — just fade back in
      this.murmurGain.gain.setTargetAtTime(0.02, ctx.currentTime, 0.4);
      this.active = true;
      return;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(ctx, 2);
    noise.loop = true;
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = "lowpass";
    lowpass.frequency.value = 320;
    this.murmurGain = ctx.createGain();
    this.murmurGain.gain.value = 0.0;
    noise.connect(lowpass).connect(this.murmurGain).connect(ctx.destination);
    noise.start();
    this.murmurGain.gain.setTargetAtTime(0.02, ctx.currentTime, 0.6);
    this.active = true;
  }

  /** one subtle key clatter (call on each keydown while enabled) */
  playKey(): void {
    if (!this.active) return;
    const ctx = this.ensureContext();
    if (ctx === null) return;
    const t = ctx.currentTime;

    // body of the thock: bandpassed noise burst
    const burst = ctx.createBufferSource();
    burst.buffer = createNoiseBuffer(ctx, 0.05);
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 1600 + Math.random() * 900;
    bandpass.Q.value = 2.2;
    const burstGain = ctx.createGain();
    burstGain.gain.setValueAtTime(0.22, t);
    burstGain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    burst.connect(bandpass).connect(burstGain).connect(ctx.destination);
    burst.start(t);
    burst.stop(t + 0.06);

    // mechanical click: short square blip at low volume
    const click = ctx.createOscillator();
    click.type = "square";
    click.frequency.value = 190 + Math.random() * 60;
    const clickGain = ctx.createGain();
    clickGain.gain.setValueAtTime(0.028, t);
    clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
    click.connect(clickGain).connect(ctx.destination);
    click.start(t);
    click.stop(t + 0.02);
  }

  /** fade the room tone out (call on finish/unmount) */
  stop(): void {
    if (this.ctx !== null && this.murmurGain !== null) {
      this.murmurGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
    }
    this.active = false;
  }
}
