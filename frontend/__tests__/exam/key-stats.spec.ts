import { describe, expect, it } from "vitest";

import {
  applyKeystroke,
  emptyKeyStats,
  normalizeKey,
  rankWeakKeys,
  type KeyStats,
} from "../../src/ts/exam/key-stats";

describe("normalizeKey", () => {
  it("lowercases single letters and digits", () => {
    expect(normalizeKey("A")).toBe("a");
    expect(normalizeKey("7")).toBe("7");
  });

  it("normalizes space to a space token", () => {
    expect(normalizeKey(" ")).toBe("space");
    expect(normalizeKey("Spacebar")).toBe("space");
  });

  it("returns null for non-printable keys", () => {
    expect(normalizeKey("Backspace")).toBeNull();
    expect(normalizeKey("F2")).toBeNull();
    expect(normalizeKey("Shift")).toBeNull();
  });
});

describe("applyKeystroke", () => {
  it("records attempts, errors and first-seen latency", () => {
    let stats = emptyKeyStats();
    stats = applyKeystroke(stats, { key: "a", latencyMs: 200, correct: true });
    expect(stats["a"]?.attempts).toBe(1);
    expect(stats["a"]?.errors).toBe(0);
    expect(stats["a"]?.latencyEma).toBe(200);

    stats = applyKeystroke(stats, { key: "a", latencyMs: 100, correct: false });
    expect(stats["a"]?.attempts).toBe(2);
    expect(stats["a"]?.errors).toBe(1);
    expect(stats["a"]?.latencyEma).toBeCloseTo(0.2 * 100 + 0.8 * 200, 5);
  });

  it("ignores non-printable keys", () => {
    let stats = emptyKeyStats();
    stats = applyKeystroke(stats, {
      key: "Backspace",
      latencyMs: 50,
      correct: true,
    });
    expect(Object.keys(stats)).toHaveLength(0);
  });

  it("treats case-different keys as the same key", () => {
    let stats = emptyKeyStats();
    stats = applyKeystroke(stats, { key: "A", latencyMs: 100, correct: true });
    stats = applyKeystroke(stats, { key: "a", latencyMs: 100, correct: true });
    expect(stats["a"]?.attempts).toBe(2);
  });
});

describe("rankWeakKeys", () => {
  const make = (entries: Array<[string, number, number, number]>): KeyStats =>
    Object.fromEntries(
      entries.map(([key, attempts, errors, latencyEma]) => [
        key,
        { attempts, errors, latencyEma },
      ]),
    );

  it("ranks keys with the highest error rate first", () => {
    const stats = make([
      ["a", 10, 0, 100],
      ["b", 10, 5, 100],
      ["c", 10, 2, 100],
    ]);
    const ranked = rankWeakKeys(stats, 3);
    expect(ranked.map((r) => r.key)).toEqual(["b", "c", "a"]);
  });

  it("requires a minimum sample size", () => {
    const stats = make([
      ["x", 3, 3, 500], // only 3 attempts — excluded
      ["y", 10, 1, 100],
    ]);
    const ranked = rankWeakKeys(stats, 5);
    expect(ranked.map((r) => r.key)).toEqual(["y"]);
  });

  it("caps the result list at the requested limit", () => {
    const stats = make(
      Array.from({ length: 20 }, (_, i) => [
        String.fromCharCode(97 + i),
        10,
        (i * 7) % 5,
        100 + i * 10,
      ]),
    );
    expect(rankWeakKeys(stats, 10)).toHaveLength(10);
  });

  it("reports error rates between 0 and 1", () => {
    const stats = make([["q", 8, 2, 250]]);
    const ranked = rankWeakKeys(stats, 1);
    expect(ranked[0]?.errorRate).toBeCloseTo(0.25, 5);
  });
});
