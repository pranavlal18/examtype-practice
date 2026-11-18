/**
 * Generates weak-key drilling passages — word salad seeded by an RNG so
 * every drill is reproducible (and unit-testable). Not SSC material: this
 * is muscle-memory training, not exam simulation.
 *
 * Two phases: (1) front-load three words containing each weak key to
 * guarantee coverage, (2) fill the rest with a frequency-weighted pick
 * that favors words containing weak keys.
 */

export type DrillOptions = {
  /** also sprinkle digit/date tokens (for number-and-punctuation drills) */
  includeNumbers?: boolean;
  /** approximate drill length in characters (default 480 ≈ 60s @ 40 WPM) */
  targetChars?: number;
};

/** deterministic PRNG (mulberry32) */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ~260 words, roughly frequency-ordered, with full alphabet coverage
const WORD_BANK = [
  "the",
  "of",
  "and",
  "to",
  "in",
  "a",
  "is",
  "that",
  "for",
  "it",
  "with",
  "as",
  "are",
  "on",
  "was",
  "at",
  "be",
  "this",
  "have",
  "from",
  "or",
  "an",
  "by",
  "not",
  "but",
  "what",
  "all",
  "were",
  "they",
  "we",
  "when",
  "your",
  "can",
  "said",
  "there",
  "use",
  "each",
  "which",
  "she",
  "do",
  "how",
  "their",
  "if",
  "will",
  "up",
  "other",
  "about",
  "out",
  "many",
  "then",
  "them",
  "these",
  "so",
  "some",
  "her",
  "would",
  "make",
  "like",
  "him",
  "into",
  "time",
  "has",
  "two",
  "more",
  "write",
  "go",
  "see",
  "number",
  "no",
  "way",
  "could",
  "people",
  "my",
  "than",
  "first",
  "water",
  "been",
  "call",
  "who",
  "oil",
  "its",
  "now",
  "find",
  "long",
  "down",
  "day",
  "did",
  "get",
  "come",
  "made",
  "may",
  "part",
  "over",
  "new",
  "sound",
  "take",
  "only",
  "little",
  "work",
  "know",
  "place",
  "year",
  "live",
  "me",
  "back",
  "give",
  "most",
  "very",
  "after",
  "thing",
  "our",
  "just",
  "name",
  "good",
  "sentence",
  "man",
  "think",
  "say",
  "great",
  "where",
  "help",
  "through",
  "much",
  "before",
  "line",
  "right",
  "too",
  "mean",
  "old",
  "any",
  "same",
  "tell",
  "boy",
  "follow",
  "came",
  "want",
  "show",
  "also",
  "around",
  "form",
  "three",
  "small",
  "set",
  "put",
  "end",
  "does",
  "another",
  "well",
  "large",
  "must",
  "big",
  "even",
  "such",
  "because",
  "turn",
  "here",
  "why",
  "ask",
  "went",
  "men",
  "read",
  "need",
  "land",
  "different",
  "home",
  "us",
  "move",
  "try",
  "kind",
  "hand",
  "picture",
  "again",
  "change",
  "play",
  "spell",
  "air",
  "away",
  "animal",
  "house",
  "point",
  "page",
  "letter",
  "mother",
  "answer",
  "found",
  "study",
  "still",
  "learn",
  "should",
  "world",
  // SSC/editorial-leaning vocabulary with full rare-letter coverage
  "government",
  "economy",
  "policy",
  "growth",
  "reform",
  "quality",
  "question",
  "require",
  "quality",
  "quick",
  "unique",
  "equal",
  "square",
  "sequence",
  "zone",
  "size",
  "prize",
  "quiz",
  "lazy",
  "amaze",
  "hazard",
  "dozen",
  "phrase",
  "frozen",
  "exact",
  "example",
  "export",
  "exist",
  "extra",
  "complex",
  "context",
  "next",
  "experiment",
  "fix",
  "tax",
  "subject",
  "project",
  "major",
  "object",
  "justice",
  "budget",
  "injury",
  "adjacent",
  "approach",
  "require",
  "question",
  "however",
  "therefore",
  "notable",
  "increase",
  "decrease",
  "percent",
  "revenue",
  "expenditure",
  "budget",
  "finance",
  "committee",
  "development",
  "production",
  "industry",
  "agriculture",
  "education",
  "health",
  "environment",
  "transport",
  "energy",
  "digital",
  "climate",
  "infrastructure",
  "district",
  "village",
  "welfare",
  "scheme",
  "beneficiary",
  "officer",
  "department",
  "responsibility",
  "administration",
  "parliament",
  "resolution",
  "constitute",
  "achieve",
  "achievement",
  "character",
  "technology",
  "research",
  "analysis",
  "improve",
  "improve",
  "provide",
  "continue",
  "include",
  "possible",
  "important",
];

const NUMBER_TOKENS = [
  "2025",
  "2026",
  "15 August",
  "71.2",
  "7.4",
  "100",
  "2,000",
  "8,000",
  "28",
  "1.6",
  "91,000",
  "350",
  "1,500",
  "84",
  "9.8",
  "342",
  "4.4",
  "87",
  "62",
];

function countOccurrences(haystack: string, needle: string): number {
  if (needle === "") return 0;
  return haystack.split(needle).length - 1;
}

export function generateDrill(
  seed: number,
  weakKeys: readonly string[],
  options: DrillOptions = {},
): string {
  const rand = mulberry32(seed);
  const target = options.targetChars ?? 480;
  const weak = [
    ...new Set(
      weakKeys.map((k) => k.toLowerCase()).filter((k) => k !== "space"),
    ),
  ];

  const weighted = WORD_BANK.map((word) => {
    const occurrences = weak.reduce(
      (sum, k) => sum + countOccurrences(word, k),
      0,
    );
    return { word, weight: 1 + occurrences * 6 };
  });
  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  const pickWeighted = (): string => {
    let r = rand() * totalWeight;
    for (const { word, weight } of weighted) {
      r -= weight;
      if (r <= 0) return word;
    }
    const last = weighted[weighted.length - 1];
    if (last === undefined) throw new Error("word bank is empty");
    return last.word;
  };

  const tokens: string[] = [];
  let length = 0;
  const push = (token: string): void => {
    tokens.push(token);
    length += token.length + 1;
  };

  // phase 1: guarantee at least 3 occurrences of every weak key
  for (const key of weak) {
    const sources = weighted
      .map((w) => w.word)
      .filter((word) => word.includes(key));
    const pool = sources.length > 0 ? sources : [key];
    for (let i = 0; i < 3; i++) {
      const pick = pool[Math.floor(rand() * pool.length)];
      if (pick !== undefined) push(pick);
    }
  }

  // phase 2: fill up to the target length
  while (length < target) {
    const picked = pickWeighted();
    tokens.push(picked);
    length += picked.length + 1;
    if (options.includeNumbers && rand() < 0.06) {
      const token = NUMBER_TOKENS[Math.floor(rand() * NUMBER_TOKENS.length)];
      if (token !== undefined) {
        tokens.push(token);
        length += token.length + 1;
      }
    }
  }

  return tokens.join(" ");
}
