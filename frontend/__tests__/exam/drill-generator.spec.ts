import { describe, expect, it } from "vitest";

import { generateDrill, mulberry32 } from "../../src/ts/exam/drill-generator";

const occurrences = (haystack: string, needle: string): number =>
  haystack.toLowerCase().split(needle.toLowerCase()).length - 1;

describe("mulberry32", () => {
  it("produces the same sequence for the same seed", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("produces different sequences for different seeds", () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)());
  });
});

describe("generateDrill", () => {
  it("is deterministic for the same seed and weak keys", () => {
    expect(generateDrill(42, ["q", "z"])).toBe(generateDrill(42, ["q", "z"]));
  });

  it("differs for different seeds", () => {
    expect(generateDrill(1, ["q"])).not.toBe(generateDrill(2, ["q"]));
  });

  it("covers each weak key at least 3 times", () => {
    const drill = generateDrill(7, ["q", "z", "x"]);
    expect(occurrences(drill, "q")).toBeGreaterThanOrEqual(3);
    expect(occurrences(drill, "z")).toBeGreaterThanOrEqual(3);
    expect(occurrences(drill, "x")).toBeGreaterThanOrEqual(3);
  });

  it("covers every letter of the alphabet when all are weak", () => {
    const drill = generateDrill(11, "abcdefghijklmnopqrstuvwxyz".split(""), {
      targetChars: 1200,
    });
    for (const key of "aeinort".split("")) {
      expect(occurrences(drill, key)).toBeGreaterThanOrEqual(3);
    }
  });

  it("is long enough for a 60-second session", () => {
    expect(generateDrill(1, ["e", "t"]).length).toBeGreaterThanOrEqual(400);
  });

  it("can sprinkle in numbers and dates", () => {
    const drill = generateDrill(5, ["1"], { includeNumbers: true });
    expect(drill).toMatch(/[0-9]/);
  });

  it("joins words with single spaces and no leading/trailing space", () => {
    const drill = generateDrill(9, ["a"]);
    expect(drill).not.toMatch(/ {2,}/);
    expect(drill.trim()).toBe(drill);
  });
});
