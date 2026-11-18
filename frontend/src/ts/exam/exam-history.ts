/**
 * Exam attempt history — stored only in the browser.
 *
 * Persists recent attempts (cap 50) to localStorage under `examAttempts`,
 * zod-validated. JSON export/import supported for backup and transfer.
 * Nothing leaves the device.
 */

import { z } from "zod";

import { LocalStorageWithSchema } from "../utils/local-storage-with-schema";

export const ExamAttemptSchema = z.object({
  id: z.string().min(1),
  date: z.string(),
  passageTitle: z.string().min(1),
  passageKind: z.enum(["bank", "custom", "drill"]),
  durationMinutes: z.number().positive(),
  completedBy: z.enum(["submit", "time"]),
  keyDepressions: z.number().int().min(0),
  kdph: z.number().min(0),
  netWpm: z.number().min(0),
  errorPercent: z.number().min(0),
  fullMistakes: z.number().min(0),
  halfMistakes: z.number().min(0),
  totalMistakes: z.number().min(0),
});

export type ExamAttempt = z.infer<typeof ExamAttemptSchema>;

export type ExamHistoryImport =
  | { ok: true; attempts: ExamAttempt[] }
  | { ok: false; error: string };

const MAX_ATTEMPTS = 50;
const HISTORY_KEY = "examAttempts";
const EXPORT_VERSION = 1;

const historyStorage = new LocalStorageWithSchema<ExamAttempt[]>({
  key: HISTORY_KEY,
  schema: z.array(ExamAttemptSchema),
  fallback: [],
});

/** all stored attempts, newest first */
export function getExamHistory(): ExamAttempt[] {
  return historyStorage.get();
}

/** persist one attempt; returns the stored (capped) list */
export function recordAttempt(attempt: ExamAttempt): ExamAttempt[] {
  const merged = mergeAttempts(historyStorage.get(), [attempt]);
  historyStorage.set(merged);
  return merged;
}

/** merge an imported batch into storage; returns how many NEW ids were added */
export function mergeAndStoreAttempts(imported: ExamAttempt[]): number {
  const current = historyStorage.get();
  const currentIds = new Set(current.map((a) => a.id));
  const merged = mergeAttempts(current, imported);
  historyStorage.set(merged);
  return imported.filter((a) => !currentIds.has(a.id)).length;
}

export function clearExamHistory(): void {
  historyStorage.set([]);
}

/** merge two lists, de-duplicate by id (first wins), sort newest first, cap 50 */
export function mergeAttempts(
  a: ExamAttempt[],
  b: ExamAttempt[],
): ExamAttempt[] {
  const seen = new Set<string>();
  const deduped = [...a, ...b].filter((attempt) => {
    if (seen.has(attempt.id)) return false;
    seen.add(attempt.id);
    return true;
  });
  return deduped
    .sort((x, y) => Date.parse(y.date) - Date.parse(x.date))
    .slice(0, MAX_ATTEMPTS);
}

/** serialize attempts to a downloadable JSON document */
export function exportAttempts(attempts: ExamAttempt[]): string {
  return JSON.stringify({ version: EXPORT_VERSION, attempts }, null, 2);
}

/** validate and parse an imported JSON document */
export function importAttempts(json: string): ExamHistoryImport {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "File is not valid JSON" };
  }
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("attempts" in parsed)
  ) {
    return { ok: false, error: "File is missing an 'attempts' array" };
  }
  const attemptsValue = parsed.attempts;
  if (!Array.isArray(attemptsValue)) {
    return { ok: false, error: "File is missing an 'attempts' array" };
  }
  const result = z.array(ExamAttemptSchema).safeParse(attemptsValue);
  if (!result.success) {
    return {
      ok: false,
      error: `Attempt data failed validation (${result.error.issues.length} problem(s))`,
    };
  }
  return { ok: true, attempts: result.data };
}
