/**
 * Per-key accuracy and latency tracking for the weak-key trainer.
 *
 * Every finished test (exam or drill) contributes keystrokes to a persistent
 * per-key aggregate in localStorage. Latency is an exponential moving
 * average (alpha = 0.2) of the inter-keystroke interval for that key.
 * Weak keys are ranked by a transparent score: errorRate*100 + latencyEma/25.
 * Pure functions throughout; the storage helpers are thin wrappers.
 */

import { z } from "zod";

import { LocalStorageWithSchema } from "../utils/local-storage-with-schema";

export const KeyStatSchema = z.object({
  attempts: z.number().int().min(0),
  errors: z.number().int().min(0),
  latencyEma: z.number().min(0),
});
export type KeyStat = z.infer<typeof KeyStatSchema>;
export type KeyStats = Record<string, KeyStat>;

export type Keystroke = {
  key: string;
  latencyMs: number;
  correct: boolean;
};

export type WeakKey = {
  key: string;
  attempts: number;
  errorRate: number;
  latencyEma: number;
  score: number;
};

const LATENCY_ALPHA = 0.2;
const MIN_SAMPLE_SIZE = 5;

/** normalize raw KeyboardEvent.key values to trackable keys ("a", "7", "space") */
export function normalizeKey(raw: string): string | null {
  if (raw === " " || raw.toLowerCase() === "spacebar") return "space";
  if (raw.length === 1) return raw.toLowerCase();
  return null;
}

export function emptyKeyStats(): KeyStats {
  return {};
}

export function emptyKeyStat(): KeyStat {
  return { attempts: 0, errors: 0, latencyEma: 0 };
}

/** fold one keystroke into the aggregate; returns a new object */
export function applyKeystroke(stats: KeyStats, stroke: Keystroke): KeyStats {
  const key = normalizeKey(stroke.key);
  if (key === null) return stats;
  const current = stats[key] ?? emptyKeyStat();
  const latencyEma =
    current.attempts === 0
      ? stroke.latencyMs
      : LATENCY_ALPHA * stroke.latencyMs +
        (1 - LATENCY_ALPHA) * current.latencyEma;
  return {
    ...stats,
    [key]: {
      attempts: current.attempts + 1,
      errors: current.errors + (stroke.correct ? 0 : 1),
      latencyEma,
    },
  };
}

/** fold a whole keystroke sequence into the aggregate */
export function applyKeystrokes(
  stats: KeyStats,
  strokes: readonly Keystroke[],
): KeyStats {
  return strokes.reduce(applyKeystroke, stats);
}

/**
 * Rank weak keys by score = errorRate*100 + latencyEma/25.
 * Requires at least MIN_SAMPLE_SIZE attempts per key.
 */
export function rankWeakKeys(stats: KeyStats, limit = 10): WeakKey[] {
  return Object.entries(stats)
    .map(([key, s]) => ({
      key,
      attempts: s.attempts,
      errorRate: s.errors / s.attempts,
      latencyEma: s.latencyEma,
      score: (s.errors / s.attempts) * 100 + s.latencyEma / 25,
    }))
    .filter((w) => w.attempts >= MIN_SAMPLE_SIZE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

const keyStatsStorage = new LocalStorageWithSchema<KeyStats>({
  key: "examKeyStats",
  schema: z.record(z.string(), KeyStatSchema),
  fallback: {},
});

export function getKeyStats(): KeyStats {
  return keyStatsStorage.get();
}

/** fold keystrokes into the stored aggregate; returns the new aggregate */
export function recordKeystrokes(strokes: readonly Keystroke[]): KeyStats {
  const next = applyKeystrokes(keyStatsStorage.get(), strokes);
  keyStatsStorage.set(next);
  return next;
}

export function resetKeyStats(): void {
  keyStatsStorage.set({});
}
