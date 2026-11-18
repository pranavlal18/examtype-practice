/**
 * ExamType fork: quote ratings are a backend feature — removed.
 * This file is now just the local stats lifecycle helper used by the test runner.
 */
import { createSignal } from "solid-js";

import { Quote } from "../controllers/quotes-controller";

const [selectedQuote, setSelectedQuote] = createSignal<Quote | null>(null);
const [quoteStats, setQuoteStats] = createSignal<
  Record<string, never> | null
>(null);

export { selectedQuote, quoteStats };

export function clearQuoteStats(): void {
  setQuoteStats(null);
}
