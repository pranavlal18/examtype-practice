import { describe, expect, it } from "vitest";

import {
  calculateExamScore,
  evaluateCutoffs,
  keyDepressionsPerHour,
  netWpm,
  type ExamPreset,
  type PassFailBadge,
} from "../../src/ts/exam/ssc-scoring";

function byPreset(badges: PassFailBadge[]): Record<ExamPreset, PassFailBadge> {
  return Object.fromEntries(badges.map((b) => [b.preset, b])) as Record<
    ExamPreset,
    PassFailBadge
  >;
}

describe("keyDepressionsPerHour", () => {
  it("maps 2000 key depressions in 15 minutes to 8000 KDPH", () => {
    expect(keyDepressionsPerHour(2000, 15 * 60)).toBe(8000);
  });

  it("returns 0 for zero elapsed time", () => {
    expect(keyDepressionsPerHour(100, 0)).toBe(0);
  });
});

describe("netWpm", () => {
  it("computes words (5 chars) per minute minus mistakes", () => {
    // 1000 chars = 200 words over 10 min = 20 wpm gross
    expect(netWpm(1000, 0, 10 * 60)).toBe(20);
  });

  it("subtracts total mistakes from gross words", () => {
    // 1150 chars = 230 words, minus 10 mistakes = 220 words over 10 min = 22 wpm
    expect(netWpm(1150, 10, 10 * 60)).toBe(22);
  });

  it("never goes below zero", () => {
    expect(netWpm(10, 50, 60)).toBe(0);
  });

  it("returns 0 for zero elapsed time", () => {
    expect(netWpm(100, 0, 0)).toBe(0);
  });
});

describe("evaluateCutoffs", () => {
  it("UR candidate at 6% errors: fails strict (5), passes general (20), passes CHSL (7)", () => {
    const map = byPreset(evaluateCutoffs(6, "UR"));
    expect(map["strict"].pass).toBe(false);
    expect(map["strict"].cutoff).toBe(5);
    expect(map["general"].pass).toBe(true);
    expect(map["chsl"].pass).toBe(true);
  });

  it("OBC/EWS candidate at 8% errors: fails strict (7), passes general (25), passes CHSL (10)", () => {
    const map = byPreset(evaluateCutoffs(8, "OBC_EWS"));
    expect(map["strict"].pass).toBe(false);
    expect(map["general"].pass).toBe(true);
    expect(map["chsl"].pass).toBe(true);
    expect(map["chsl"].cutoff).toBe(10);
  });

  it("SC/ST/PwBD candidate at 25% errors: fails strict and CHSL, passes general (30)", () => {
    const map = byPreset(evaluateCutoffs(25, "SC_ST_PWBD"));
    expect(map["strict"].pass).toBe(false);
    expect(map["chsl"].pass).toBe(false);
    expect(map["general"].pass).toBe(true);
  });

  it("treats the cutoff as inclusive (exactly at cutoff passes)", () => {
    const badges = evaluateCutoffs(5, "UR");
    expect(badges.find((b) => b.preset === "strict")?.pass).toBe(true);
  });

  it("returns badges for all three presets", () => {
    const badges = evaluateCutoffs(0, "UR");
    expect(badges.map((b) => b.preset).sort()).toEqual([
      "chsl",
      "general",
      "strict",
    ]);
  });
});

describe("calculateExamScore", () => {
  const passage =
    "The preservation of monuments demands a careful balance between conservation and public access for every visitor";

  it("perfect run: zero mistakes, KDPH from depressions, netWpm positive", () => {
    const score = calculateExamScore({
      passageText: passage,
      typedText: passage,
      keyDepressions: passage.length,
      elapsedSeconds: 15 * 60,
    });
    expect(score.errorPercent).toBe(0);
    expect(score.diff.fullMistakes).toBe(0);
    expect(score.kdph).toBe(keyDepressionsPerHour(passage.length, 15 * 60));
    expect(score.netWpm).toBeGreaterThan(0);
  });

  it("counts omitted passage words as full mistakes", () => {
    const score = calculateExamScore({
      passageText: passage,
      typedText: passage.split(" ").slice(0, -2).join(" "),
      keyDepressions: passage.length,
      elapsedSeconds: 15 * 60,
    });
    expect(score.diff.fullMistakes).toBe(2);
    expect(score.errorPercent).toBeGreaterThan(0);
  });

  it("scales errorPercent by passage word count", () => {
    const score = calculateExamScore({
      passageText: passage,
      typedText: passage.replace("careful", "carefull"),
      keyDepressions: passage.length,
      elapsedSeconds: 15 * 60,
    });
    const words = passage.split(" ").length;
    expect(score.errorPercent).toBeCloseTo((1 / words) * 100, 5);
  });
});
