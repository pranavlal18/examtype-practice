# ExamType — Government Exam Simulator

This document covers the exam modules this fork adds. Everything else is upstream Monkeytype (see `../README.md`).

## What exists

- **`/exam` route** — Real Exam Mode (SSC CGL DEST / CHSL / RRB NTPC pattern).
  - Split-screen: scrollable Times New Roman passage on top (read-only), plain `<textarea>` below. **No live highlighting, no auto-scroll, no error colors.**
  - 5 / 10 / 15-minute countdown (default 15), auto-submits at zero; an unfinished last word counts as it stands.
  - Optional **Backspace Disabled** toggle (default OFF). Blocked backspace keys do not count as key depressions.
  - Post-test screen: Total Key Depressions, KDPH (with the 2,000 KD ≈ 8,000 KDPH reference), Net WPM, Error %, full/half mistake diff and category-wise PASS/FAIL badges.
- **Passages** — `frontend/static/exam-passages/passages.json`. Original sample texts labelled "original sample"; swap in curated material freely. `getExamPassages()` validates with zod and derives `charCount` from `text.length`.
- **Custom text** — paste any paragraph (200–10,000 chars; soft target ~2,000) and practice it in exam conditions.

## Module map

```
src/ts/exam/
  types.ts          ExamSession / ExamOutcome
  ssc-diff.ts       word-level LCS diff; Full (1.0) vs Half (0.5) mistakes;
                    Error % = (full + half/2) / passageWords * 100. Pure, unit-tested.
  ssc-scoring.ts    KDPH, Net WPM, Error % orchestration, official cutoff tables
                    (Strict / General / CHSL × UR / OBC-EWS / SC-ST-PwBD). Pure, unit-tested.
  exam-passages.ts  static-JSON loader (zod-validated)
src/ts/components/pages/exam/
  ExamPage.tsx      state machine: setup → running → result
  ExamSetup.tsx     passage bank + custom text + duration + backspace toggle
  ExamTest.tsx      live exam hall
  ExamResult.tsx    verdict + word-level diff + mistake table
```

## Phase 2 — Trainer & retention (added alongside the simulator)

- **History tab** (`/exam` → History): last 50 attempts from localStorage (`examAttempts`), zod-validated via `LocalStorageWithSchema`, capped, with JSON **Export / Import** (merges, de-duped by id, validated on import) and clear-all.
- **Weak-Key Tracker**: every finished exam test and drill logs a keystroke stream; `src/ts/exam/key-stats.ts` folds it into a per-key aggregate (attempts, error rate, latency EMA) in `examKeyStats`.
- **Trainer** (`/trainer`, dumbbell icon): 60-second seeded word-salad drills generated from your weakest keys (`src/ts/exam/drill-generator.ts`, `mulberry32` PRNG, ≥3 occurrences of each weak key guaranteed, optional number/date tokens). Falls back to `z·q·x·j` until ≥5 keystrokes per key are tracked.
- **Ghost pacer** (both halls): pace bar in the test header — ghost marker at target WPM (click to cycle 30→35→40→45, persisted in `examPaceTarget`), your rolling fill, 0–60 scale.
- **Exam Hall Ambient Noise**: procedural Web Audio clatter + murmur (`src/ts/exam/ambient-audio.ts`), toggle in setup, default OFF, stored in `examAmbientNoise`. No audio assets involved.

## Scoring spec

- Full mistakes (1.0): omitted word, added word, substituted/misspelled word.
- Half mistakes (0.5): wrong capitalization, punctuation-only differences,
  extra/missing spaces (runs of N spaces count N−1), leading/trailing space, newline/tab.
- Aligned word pairs classify as: exact → correct; case-only → half (capitalization);
  punctuation-only (after stripping edge punctuation) → half (punctuation); anything else → full.
- Spacing mistakes are counted separately (`spacingHalfMistakes`) and added into `halfMistakes`.

## Testing

```bash
cd frontend
pnpm vitest run __tests__/exam/
```

## Deployment

Static-only. `vercel.json` / `netlify.toml` at the repo root publish `frontend/dist` with an SPA fallback. No backend needed; ads default to `off` in `src/ts/constants/default-config.ts`.

Two fork-specific build deviations, both deliberate:

- **`firebase-config.ts` is committed with empty strings.** Upstream gitignores it (real keys); this fork needs only a Vite-resolvable module so `src/ts/firebase.ts` transforms and boots signed-out. Never put real keys in it — use `firebase-config-live.ts` (ignored) if accounts are re-enabled, and revert the `resolve.alias` hunk in `frontend/vite.config.ts`.
- **`RECAPTCHA_SITE_KEY` is optional in production builds** (warns instead of throwing). Required upstream; useless for a zero-backend bundle. Set it if accounts come back.
