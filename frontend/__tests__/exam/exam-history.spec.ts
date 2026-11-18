import { describe, expect, it } from "vitest";

import {
  ExamAttemptSchema,
  importAttempts,
  mergeAttempts,
  type ExamAttempt,
} from "../../src/ts/exam/exam-history";

const sampleAttempt = {
  id: "attempt-1",
  date: "2026-11-18T13:00:00.000Z",
  passageTitle: "Economy",
  passageKind: "bank" as const,
  durationMinutes: 15,
  completedBy: "submit" as const,
  keyDepressions: 2031,
  kdph: 8122,
  netWpm: 34,
  errorPercent: 4.2,
  fullMistakes: 1,
  halfMistakes: 2,
  totalMistakes: 2,
};

describe("exam attempt schema", () => {
  it("accepts a valid attempt", () => {
    expect(ExamAttemptSchema.safeParse(sampleAttempt).success).toBe(true);
  });

  it("rejects an attempt with negative key depressions", () => {
    expect(
      ExamAttemptSchema.safeParse({ ...sampleAttempt, keyDepressions: -1 })
        .success,
    ).toBe(false);
  });
});

describe("mergeAttempts", () => {
  const make = (id: string, date: string): ExamAttempt => ({
    ...sampleAttempt,
    id,
    date,
  });

  it("deduplicates by id, keeping the first occurrence", () => {
    const merged = mergeAttempts(
      [
        make("a", "2026-11-10T00:00:00.000Z"),
        make("b", "2026-11-11T00:00:00.000Z"),
      ],
      [make("a", "2026-11-10T00:00:00.000Z")],
    );
    expect(merged.map((m) => m.id)).toEqual(["b", "a"]);
  });

  it("sorts newest first and caps at 50 attempts", () => {
    const day = 86_400_000;
    const base = Array.from({ length: 40 }, (_, i) =>
      make(`old-${i}`, new Date(Date.UTC(2026, 0, 1) + i * day).toISOString()),
    );
    const fresh = Array.from({ length: 20 }, (_, i) =>
      make(`new-${i}`, new Date(Date.UTC(2027, 0, 1) + i * day).toISOString()),
    );
    const merged = mergeAttempts(base, fresh);
    expect(merged.length).toBe(50);
    expect(merged[0]?.id).toBe("new-19");
    expect(merged.some((m) => m.id === "old-0")).toBe(false);
    expect(merged.some((m) => m.id === "old-39")).toBe(true);
    const times = merged.map((m) => Date.parse(m.date));
    const first = merged[0];
    let prev = first === undefined ? Infinity : Date.parse(first.date);
    for (const time of times) {
      expect(time).toBeLessThanOrEqual(prev);
      prev = time;
    }
  });
});

describe("importAttempts", () => {
  it("parses a valid export and reports counts", () => {
    const json = JSON.stringify({
      version: 1,
      attempts: [
        { ...sampleAttempt, id: "x1", date: "2026-11-01T00:00:00.000Z" },
        { ...sampleAttempt, id: "x2", date: "2026-11-02T00:00:00.000Z" },
      ],
    });
    const result = importAttempts(json);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.attempts.length).toBe(2);
  });

  it("rejects invalid JSON", () => {
    expect(importAttempts("not json").ok).toBe(false);
  });

  it("rejects a payload missing the attempts array", () => {
    expect(importAttempts('{"version":1}').ok).toBe(false);
  });

  it("rejects when any attempt fails the schema", () => {
    const json = JSON.stringify({
      version: 1,
      attempts: [{ ...sampleAttempt, id: "bad", keyDepressions: -5 }],
    });
    expect(importAttempts(json).ok).toBe(false);
  });
});
