/**
 * SSC-style scoring for government exam typing.
 *
 * Cutoffs are reference figures based on commonly cited SSC category norms.
 * They differ only by post tier; the counting rules are identical. CHSL gets
 * its own preset. They are NOT a single universal official table — permissible
 * error % varies by post and exam year, so check the current notification.
 * PASS/FAIL is decided purely from the candidate's error %.
 */

import { sscDiff, type SscDiffResult } from "./ssc-diff";

export type ExamCategory = "UR" | "OBC_EWS" | "SC_ST_PWBD";

export const CATEGORY_LABELS: Record<ExamCategory, string> = {
  UR: "UR (General)",
  OBC_EWS: "OBC / EWS",
  SC_ST_PWBD: "SC / ST / PwBD",
};

export const EXAM_CUTOFFS = {
  strict: {
    label: "Strict Posts",
    subtitle: "CPT · Tax Assistant · ASO · Inspector",
    values: { UR: 5, OBC_EWS: 7, SC_ST_PWBD: 7 },
  },
  general: {
    label: "General Posts",
    subtitle: "All other SSC CGL posts",
    values: { UR: 20, OBC_EWS: 25, SC_ST_PWBD: 30 },
  },
  chsl: {
    label: "SSC CHSL Standard",
    subtitle: "UR 7% · All other categories 10%",
    values: { UR: 7, OBC_EWS: 10, SC_ST_PWBD: 10 },
  },
} as const satisfies Record<
  string,
  { label: string; subtitle: string; values: Record<ExamCategory, number> }
>;

export type ExamPreset = keyof typeof EXAM_CUTOFFS;

export type PassFailBadge = {
  preset: ExamPreset;
  label: string;
  subtitle: string;
  category: ExamCategory;
  /** max allowed error % for this category & preset, inclusive */
  cutoff: number;
  pass: boolean;
};

export function evaluateCutoffs(
  errorPercent: number,
  category: ExamCategory,
): PassFailBadge[] {
  return (Object.keys(EXAM_CUTOFFS) as ExamPreset[]).map((preset) => {
    const { label, subtitle, values } = EXAM_CUTOFFS[preset];
    const cutoff = values[category];
    return {
      preset,
      label,
      subtitle,
      category,
      cutoff,
      pass: errorPercent <= cutoff,
    };
  });
}

export function cutoffFor(preset: ExamPreset, category: ExamCategory): number {
  return EXAM_CUTOFFS[preset].values[category];
}

/** key depressions per hour; e.g. 2000 KD in 15 minutes -> 8000 KDPH */
export function keyDepressionsPerHour(
  keyDepressions: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0) return 0;
  return Math.round((keyDepressions / elapsedSeconds) * 3600);
}

/**
 * Net WPM = (gross words - total mistake penalties) per minute.
 * Words are 5-character units; penalties include the 0.5 weighting of half
 * mistakes. Never negative.
 */
export function netWpm(
  typedCharCount: number,
  totalMistakes: number,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0) return 0;
  const minutes = elapsedSeconds / 60;
  return Math.max(
    0,
    Math.floor((typedCharCount / 5 - totalMistakes) / minutes),
  );
}

export type ExamScoreInput = {
  passageText: string;
  typedText: string;
  keyDepressions: number;
  elapsedSeconds: number;
};

export type ExamScore = {
  diff: SscDiffResult;
  elapsedSeconds: number;
  keyDepressions: number;
  /** key depressions per hour, rounded */
  kdph: number;
  netWpm: number;
  /** full + half/2 over passage words */
  errorPercent: number;
};

export function calculateExamScore(input: ExamScoreInput): ExamScore {
  const diff = sscDiff(input.passageText, input.typedText);
  const elapsedSeconds = Math.max(0, input.elapsedSeconds);
  return {
    diff,
    elapsedSeconds,
    keyDepressions: input.keyDepressions,
    kdph: keyDepressionsPerHour(input.keyDepressions, elapsedSeconds),
    netWpm: netWpm(input.typedText.length, diff.totalMistakes, elapsedSeconds),
    errorPercent: diff.errorPercent,
  };
}
