import { describe, expect, it } from "vitest";

import { sscDiff, stripPunctuation } from "../../src/ts/exam/ssc-diff";

// small, realistic passage fragment (indices referenced in assertions)
const passage =
  "The quick brown fox jumps over the lazy dog near the river bank";

describe("stripPunctuation", () => {
  it("strips leading and trailing punctuation", () => {
    expect(stripPunctuation("dog,")).toBe("dog");
    expect(stripPunctuation("(dog)")).toBe("dog");
    expect(stripPunctuation('"dog."')).toBe("dog");
  });

  it("keeps internal apostrophes and hyphens", () => {
    expect(stripPunctuation("India's")).toBe("India's");
    expect(stripPunctuation("well-known")).toBe("well-known");
  });
});

describe("sscDiff", () => {
  it("scores a perfect transcription with zero mistakes", () => {
    const result = sscDiff(passage, passage);
    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(0);
    expect(result.totalMistakes).toBe(0);
    expect(result.errorPercent).toBe(0);
    expect(result.entries.every((e) => e.type === "correct")).toBe(true);
  });

  it("counts an omitted trailing word as one full mistake", () => {
    const words = passage.split(" ");
    const typed = words.slice(0, -1).join(" ");
    const result = sscDiff(passage, typed);
    expect(result.fullMistakes).toBe(1);
    expect(result.halfMistakes).toBe(0);
    const omission = result.entries.find((e) => e.reason === "omission");
    expect(omission?.expected).toBe("bank");
  });

  it("counts an omitted word in the middle as one full mistake", () => {
    const result = sscDiff(passage, passage.replace("lazy ", ""));
    expect(result.fullMistakes).toBe(1);
    expect(result.halfMistakes).toBe(0);
  });

  it("counts an added extra word as one full mistake", () => {
    const result = sscDiff(passage, `${passage} winter`);
    expect(result.fullMistakes).toBe(1);
    const addition = result.entries.find((e) => e.reason === "addition");
    expect(addition?.actual).toBe("winter");
  });

  it("counts a substituted word as exactly one full mistake (not two)", () => {
    const typed = passage.replace("brown", "black");
    const result = sscDiff(passage, typed);
    expect(result.fullMistakes).toBe(1);
    expect(result.halfMistakes).toBe(0);
    const sub = result.entries.find((e) => e.reason === "substitution");
    expect(sub?.expected).toBe("brown");
    expect(sub?.actual).toBe("black");
  });

  it("counts wrong capitalization as a half mistake", () => {
    const typed = passage.replace("The", "the");
    const result = sscDiff(passage, typed);
    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(1);
    expect(
      result.entries.find((e) => e.reason === "capitalization"),
    ).toBeDefined();
  });

  it("counts a punctuation-only difference as a half mistake", () => {
    const p = "Type exactly as shown, without errors.";
    const typed = "Type exactly as shown. without errors.";
    const result = sscDiff(p, typed);
    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(1);
    expect(
      result.entries.find((e) => e.reason === "punctuation"),
    ).toBeDefined();
  });

  it("counts a missing trailing period as a half mistake, not a substitution", () => {
    const p = "the river bank.";
    const result = sscDiff(p, "the river bank");
    expect(result.fullMistakes).toBe(0);
    expect(result.halfMistakes).toBe(1);
  });

  it("counts each run of extra spaces as half mistakes", () => {
    const typed = passage.replace("quick brown", "quick  brown"); // double space
    const result = sscDiff(passage, typed);
    expect(result.spacingHalfMistakes).toBe(1);
    expect(result.halfMistakes).toBe(1);
    expect(result.fullMistakes).toBe(0);
  });

  it("counts N extra spaces as N-1 half mistakes", () => {
    const typed = passage.replace("quick brown", "quick   brown"); // triple space
    const result = sscDiff(passage, typed);
    expect(result.spacingHalfMistakes).toBe(2);
  });

  it("counts a leading or trailing space as a half mistake", () => {
    expect(sscDiff(passage, ` ${passage}`).spacingHalfMistakes).toBe(1);
    expect(sscDiff(passage, `${passage} `).spacingHalfMistakes).toBe(1);
  });

  it("counts newline characters as half mistakes", () => {
    const typed = passage.replace("brown fox", "brown\nfox");
    const result = sscDiff(passage, typed);
    expect(result.spacingHalfMistakes).toBe(1);
  });

  it("treats an incomplete final word as a (substitution) mistake", () => {
    const typed = passage.slice(0, -2); // "ban" instead of "bank"
    const result = sscDiff(passage, typed);
    expect(result.totalMistakes).toBe(1);
    expect(result.fullMistakes).toBe(1);
  });

  it("computes total mistakes as full + half/2 and errorPercent over passage words", () => {
    // passage has 13 words; typed drops "lazy" (1 full) and mis-capitalizes "The" (1 half)
    const typed = passage.replace("The", "the").replace(" lazy", "");
    const result = sscDiff(passage, typed);
    expect(result.fullMistakes).toBe(1);
    expect(result.halfMistakes).toBe(1);
    expect(result.totalMistakes).toBe(1.5);
    expect(result.errorPercent).toBeCloseTo((1.5 / 13) * 100, 5);
  });

  it("handles numbers and dates typed exactly with no mistakes", () => {
    const p =
      "On 15 August 1947, India became independent, its debt stood at 71.2 percent.";
    expect(sscDiff(p, p).totalMistakes).toBe(0);
  });

  it("flags numbers typed wrongly as full mistakes", () => {
    const p = "On 15 August 1947, India became independent.";
    const typed = "On 15 August 1950, India became independent.";
    const result = sscDiff(p, typed);
    expect(result.fullMistakes).toBe(1);
  });
});
