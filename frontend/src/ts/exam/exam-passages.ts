/**
 * Loader for the curated SSC-style passages shipped with ExamType.
 *
 * Static-first: passages live in /exam-passages/passages.json (fetched and
 * memoized like quotes/languages). They are original sample texts, labelled
 * as such, meant to be swapped for curated SSC/RRB material later.
 */

import { z } from "zod";

import { cachedFetchJson } from "../utils/json-data";

const ExamPassageSchema = z.object({
  id: z.string(),
  title: z.string(),
  topics: z.array(z.string()),
  source: z.string(),
  text: z.string().min(100),
});

const ExamPassagesFileSchema = z.object({
  passages: z.array(ExamPassageSchema).min(1),
});

export type ExamPassage = z.infer<typeof ExamPassageSchema>;
export type LoadedExamPassage = ExamPassage & { charCount: number };

/** fetch and validate the bundled passages; memoized by cachedFetchJson */
export async function getExamPassages(): Promise<LoadedExamPassage[]> {
  const raw = await cachedFetchJson<unknown>("/exam-passages/passages.json");
  const parsed = ExamPassagesFileSchema.parse(raw);
  return parsed.passages.map((p) => ({
    ...p,
    charCount: p.text.length,
  }));
}
