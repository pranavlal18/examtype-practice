/**
 * SSC-style word-level diff for the government exam typing simulator.
 *
 * Scoring rules (official SSC CGL/CHSL evaluation style):
 *  - Full mistakes (1.0): omitted word, added word, substituted/misspelled word
 *  - Half mistakes (0.5): wrong capitalization, punctuation-only differences,
 *    extra/missing spaces (incl. leading/trailing spaces and newlines)
 *  - Error % = (fullMistakes + 0.5 * halfMistakes) / passageWordCount * 100
 *
 * The passage is split into words on whitespace. Typed text is aligned to the
 * passage with a longest-common-subsequence pass whose match predicate is
 * tolerant to case and edge punctuation; the alignment is then walked once and
 * consecutive unmatched runs are paired as substitutions (so a wrong word is a
 * single full mistake, not an omission + an addition).
 */

export type SscDiffReason =
  | "omission"
  | "substitution"
  | "addition"
  | "capitalization"
  | "punctuation";

export type SscDiffEntry = {
  type: "correct" | "full" | "half";
  /** index into passage words, undefined for added words */
  passageIndex?: number;
  /** index into typed words, undefined for omitted words */
  typedIndex?: number;
  expected?: string;
  actual?: string;
  reason?: SscDiffReason;
};

export type SscDiffResult = {
  entries: SscDiffEntry[];
  passageWordCount: number;
  typedWordCount: number;
  /** full mistakes across words (omissions, additions, substitutions) */
  fullMistakes: number;
  /** word-level half mistakes + spacing half mistakes */
  halfMistakes: number;
  /** half mistakes caused by extra/missing spaces and newlines */
  spacingHalfMistakes: number;
  /** full + half / 2 */
  totalMistakes: number;
  /** totalMistakes / passageWordCount * 100 */
  errorPercent: number;
};

/**
 * Bounds-safe array access. The app runs with `noUncheckedIndexedAccess`, so
 * `arr[i]` is `T | undefined` — every index into a known-in-bounds array goes
 * through here and fails loudly otherwise.
 */
function at<T>(arr: ArrayLike<T>, index: number): T {
  const value = arr[index];
  if (value === undefined) {
    throw new RangeError(`index ${index} out of bounds (length ${arr.length})`);
  }
  return value;
}

/** strip leading/trailing characters that are not letters or digits */
export function stripPunctuation(word: string): string {
  return word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");
}

function softEquals(a: string, b: string): boolean {
  return (
    stripPunctuation(a).toLowerCase() === stripPunctuation(b).toLowerCase()
  );
}

/** classify an aligned (expected, actual) word pair */
function classifyPair(
  expected: string,
  actual: string,
): Pick<SscDiffEntry, "type" | "reason"> {
  if (expected === actual) return { type: "correct" };
  if (expected.toLowerCase() === actual.toLowerCase()) {
    return { type: "half", reason: "capitalization" };
  }
  if (stripPunctuation(expected) === stripPunctuation(actual)) {
    return { type: "half", reason: "punctuation" };
  }
  if (
    stripPunctuation(expected).toLowerCase() ===
    stripPunctuation(actual).toLowerCase()
  ) {
    return { type: "half", reason: "punctuation" };
  }
  return { type: "full", reason: "substitution" };
}

type AlignmentPair = readonly [number | null, number | null];

/** LCS alignment; pairs are (passageIndex | null, typedIndex | null) */
function lcsAlign(passage: string[], typed: string[]): AlignmentPair[] {
  const m = passage.length;
  const n = typed.length;
  const stride = n + 1;
  const dp = new Int32Array((m + 1) * stride);
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i * stride + j] = softEquals(at(passage, i), at(typed, j))
        ? at(dp, (i + 1) * stride + (j + 1)) + 1
        : Math.max(at(dp, (i + 1) * stride + j), at(dp, i * stride + (j + 1)));
    }
  }
  const pairs: AlignmentPair[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (softEquals(at(passage, i), at(typed, j))) {
      pairs.push([i, j] as const);
      i++;
      j++;
    } else if (at(dp, (i + 1) * stride + j) >= at(dp, i * stride + (j + 1))) {
      pairs.push([i, null] as const);
      i++;
    } else {
      pairs.push([null, j] as const);
      j++;
    }
  }
  while (i < m) {
    pairs.push([i, null] as const);
    i++;
  }
  while (j < n) {
    pairs.push([null, j] as const);
    j++;
  }
  return pairs;
}

/** half mistakes for spacing: extra spaces, leading/trailing spaces, newlines/tabs */
function countSpacingHalfMistakes(typed: string): number {
  let count = 0;
  const multiSpaceRuns = typed.match(/ {2,}/g);
  if (multiSpaceRuns !== null) {
    for (const run of multiSpaceRuns) count += run.length - 1;
  }
  if (typed.startsWith(" ") || typed.endsWith(" ")) count += 1;
  const newlines = typed.match(/[\n\r\t]/g);
  if (newlines !== null) count += newlines.length;
  return count;
}

export function sscDiff(passage: string, typed: string): SscDiffResult {
  const passageWords =
    passage.trim().length > 0 ? passage.trim().split(/\s+/) : [];
  const typedWords = typed.trim().length > 0 ? typed.trim().split(/\s+/) : [];

  const pairs = lcsAlign(passageWords, typedWords);

  const entries: SscDiffEntry[] = [];
  // walk the alignment, pairing consecutive unmatched words as substitutions
  let idx = 0;
  while (idx < pairs.length) {
    const [pi, ti] = at(pairs, idx);
    if (pi !== null && ti !== null) {
      // matched by the LCS (soft-equal): classify exact vs case/punct
      const expected = at(passageWords, pi);
      const actual = at(typedWords, ti);
      const { type, reason } = classifyPair(expected, actual);
      entries.push({
        type,
        passageIndex: pi,
        typedIndex: ti,
        expected,
        actual,
        ...(reason !== undefined ? { reason } : {}),
      });
      idx++;
      continue;
    }
    // gather the run of unmatched ops
    const omissions: number[] = [];
    const additions: number[] = [];
    while (idx < pairs.length) {
      const [rpi, rti] = at(pairs, idx);
      if (rpi !== null && rti !== null) break;
      if (rpi !== null) omissions.push(rpi);
      else if (rti !== null) additions.push(rti);
      idx++;
    }
    const pairsToZip = Math.min(omissions.length, additions.length);
    for (let k = 0; k < pairsToZip; k++) {
      const p = at(omissions, k);
      const t = at(additions, k);
      const expected = at(passageWords, p);
      const actual = at(typedWords, t);
      const { type, reason } = classifyPair(expected, actual);
      entries.push({
        // the LCS already decided these are not soft-equal, so they are full
        type: type === "correct" ? "full" : type,
        passageIndex: p,
        typedIndex: t,
        expected,
        actual,
        reason: reason ?? "substitution",
      });
    }
    for (let k = pairsToZip; k < omissions.length; k++) {
      const p = at(omissions, k);
      entries.push({
        type: "full",
        passageIndex: p,
        expected: at(passageWords, p),
        reason: "omission",
      });
    }
    for (let k = pairsToZip; k < additions.length; k++) {
      const t = at(additions, k);
      entries.push({
        type: "full",
        typedIndex: t,
        actual: at(typedWords, t),
        reason: "addition",
      });
    }
  }

  let fullMistakes = 0;
  let wordHalfMistakes = 0;
  for (const entry of entries) {
    if (entry.type === "full") fullMistakes++;
    else if (entry.type === "half") wordHalfMistakes++;
  }
  const spacingHalfMistakes = countSpacingHalfMistakes(typed);
  const halfMistakes = wordHalfMistakes + spacingHalfMistakes;
  const totalMistakes = fullMistakes + halfMistakes / 2;
  const passageWordCount = passageWords.length;
  const errorPercent =
    passageWordCount > 0 ? (totalMistakes / passageWordCount) * 100 : 0;

  return {
    entries,
    passageWordCount,
    typedWordCount: typedWords.length,
    fullMistakes,
    halfMistakes,
    spacingHalfMistakes,
    totalMistakes,
    errorPercent,
  };
}
