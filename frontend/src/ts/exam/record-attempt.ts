/**
 * Shared post-test bookkeeping: persist an attempt to history and fold the
 * keystroke log into the weak-key aggregate. Used by both the exam flow and
 * the weak-key drill so they feed the same trainer.
 */

import { recordAttempt } from "./exam-history";
import { recordKeystrokes } from "./key-stats";
import { calculateExamScore } from "./ssc-scoring";
import type { ExamOutcome, ExamSession } from "./types";

export function recordExamOutcome(
  session: ExamSession,
  outcome: ExamOutcome,
): void {
  const score = calculateExamScore({
    passageText: session.passageText,
    typedText: outcome.typedText,
    keyDepressions: outcome.keyDepressions,
    elapsedSeconds: outcome.elapsedSeconds,
  });
  const passageKind =
    session.kind === "trainer"
      ? ("drill" as const)
      : session.title === "Custom text"
        ? ("custom" as const)
        : ("bank" as const);
  recordAttempt({
    id: crypto.randomUUID(),
    date: new Date().toISOString(),
    passageTitle: session.title,
    passageKind,
    durationMinutes: session.durationMinutes,
    completedBy: outcome.completedBy,
    keyDepressions: score.keyDepressions,
    kdph: score.kdph,
    netWpm: score.netWpm,
    errorPercent: score.errorPercent,
    fullMistakes: score.diff.fullMistakes,
    halfMistakes: score.diff.halfMistakes,
    totalMistakes: score.diff.totalMistakes,
  });
  recordKeystrokes(
    outcome.keystrokes
      .filter(
        (k) =>
          k.latencyMs !== null && k.correct !== null && k.key !== "Backspace",
      )
      .map((k) => ({
        key: k.key,
        latencyMs: k.latencyMs as number,
        correct: k.correct as boolean,
      })),
  );
}
