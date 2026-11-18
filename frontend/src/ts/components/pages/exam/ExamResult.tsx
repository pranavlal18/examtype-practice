import { createMemo, createSignal, For, JSXElement, Show } from "solid-js";

import type { SscDiffEntry } from "../../../exam/ssc-diff";
import type { ExamOutcome, ExamSession } from "../../../exam/types";

import {
  calculateExamScore,
  CATEGORY_LABELS,
  evaluateCutoffs,
  type ExamCategory,
} from "../../../exam/ssc-scoring";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const REASON_LABELS: Record<string, string> = {
  omission: "omitted word",
  substitution: "wrong word",
  addition: "extra word",
  capitalization: "wrong capitalization",
  punctuation: "punctuation error",
};

export function ExamResult(props: {
  session: ExamSession;
  outcome: ExamOutcome;
  onRetry: () => void;
  onBackToSetup: () => void;
}): JSXElement {
  const [category, setCategory] = createSignal<ExamCategory>("UR");

  const score = createMemo(() =>
    calculateExamScore({
      passageText: props.session.passageText,
      typedText: props.outcome.typedText,
      keyDepressions: props.outcome.keyDepressions,
      elapsedSeconds: props.outcome.elapsedSeconds,
    }),
  );
  const badges = createMemo(() =>
    evaluateCutoffs(score().errorPercent, category()),
  );
  const mistakeEntries = createMemo(() =>
    score().diff.entries.filter((e) => e.type !== "correct"),
  );

  const entryByPassageIndex = createMemo(() => {
    const map = new Map<number, SscDiffEntry>();
    for (const entry of score().diff.entries) {
      if (entry.passageIndex !== undefined) map.set(entry.passageIndex, entry);
    }
    return map;
  });

  // plain {word, entry} pairs with ordinary numeric keys, so the diff view
  // never needs For's index accessor outside JSX
  const passageTokens = createMemo(() => {
    const words = props.session.passageText.trim().split(/\s+/);
    const map = entryByPassageIndex();
    return words.map((word, i) => ({ word, entry: map.get(i) }));
  });

  return (
    <div class="mx-auto flex w-full max-w-5xl flex-col items-center gap-5 py-2">
      {/* header */}
      <div class="flex flex-col items-center gap-1 text-center">
        <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
          {props.outcome.completedBy === "time"
            ? "Time expired — auto-submitted"
            : "You submitted the test"}
        </span>
        <h1 class="text-3xl font-black text-text">Exam complete</h1>
      </div>

      {/* hero metrics */}
      <div class="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
        <div class="col-span-2 flex flex-col items-center justify-center rounded-2xl border border-sub-alt bg-sub-alt p-5">
          <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
            Error %
          </span>
          <span
            class={cn(
              "text-6xl font-black tabular-nums",
              score().errorPercent <= 7 ? "text-main" : "text-error",
            )}
          >
            {score().errorPercent.toFixed(2)}
            <span class="text-2xl">%</span>
          </span>
          <span class="mt-1 text-xs text-sub">
            {score().diff.totalMistakes} mistakes ({score().diff.fullMistakes}{" "}
            full · {score().diff.halfMistakes} half) over{" "}
            {score().diff.passageWordCount} words
          </span>
        </div>
        <div class="flex flex-col items-center justify-center rounded-2xl border border-sub-alt bg-sub-alt p-4">
          <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
            Key depressions
          </span>
          <span class="text-4xl font-black text-text tabular-nums">
            {score().keyDepressions}
          </span>
          <span class="text-[10px] text-sub">incl. spaces</span>
        </div>
        <div class="flex flex-col items-center justify-center rounded-2xl border border-sub-alt bg-sub-alt p-4">
          <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
            KDPH
          </span>
          <span class="text-4xl font-black text-text tabular-nums">
            {score().kdph.toLocaleString()}
          </span>
          <span class="text-[10px] text-sub">
            target ref: 2,000 KD ≈ 8,000 KDPH
          </span>
        </div>
        <div class="flex flex-col items-center justify-center rounded-2xl border border-sub-alt bg-sub-alt p-4">
          <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
            Net WPM
          </span>
          <span class="text-4xl font-black text-text tabular-nums">
            {score().netWpm}
          </span>
          <span class="text-[10px] text-sub">gross words − mistakes, /min</span>
        </div>
        <div class="flex flex-col items-center justify-center rounded-2xl border border-sub-alt bg-sub-alt p-4">
          <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
            Time used
          </span>
          <span class="text-4xl font-black text-text tabular-nums">
            {formatElapsed(score().elapsedSeconds)}
          </span>
          <span class="text-[10px] text-sub">
            of {props.session.durationMinutes}:00
          </span>
        </div>
      </div>

      {/* pass / fail */}
      <div class="w-full rounded-2xl border border-sub-alt bg-sub-alt p-5">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-black text-text">Verdict</h2>
          <div class="flex items-center gap-2">
            <span class="text-xs text-sub">your category</span>
            <div class="flex gap-1 rounded-lg bg-bg p-1">
              <For each={Object.entries(CATEGORY_LABELS)}>
                {([key, label]) => (
                  <button
                    type="button"
                    onClick={() => setCategory(key as ExamCategory)}
                    class={cn(
                      "cursor-pointer rounded-md px-3 py-1.5 text-xs font-bold transition-colors",
                      category() === key
                        ? "bg-main text-bg"
                        : "text-sub hover:text-text",
                    )}
                  >
                    {label}
                  </button>
                )}
              </For>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <For each={badges()}>
            {(badge) => (
              <div
                class={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 p-4 text-center",
                  badge.pass
                    ? "border-green-500/60 bg-green-500/10"
                    : "border-red-500/60 bg-red-500/10",
                )}
              >
                <span class="text-xs font-bold tracking-wide text-text uppercase">
                  {badge.label}
                </span>
                <span class="text-[10px] text-sub">{badge.subtitle}</span>
                <span
                  class={cn(
                    "mt-1 text-3xl font-black tracking-wide",
                    badge.pass ? "text-green-500" : "text-red-500",
                  )}
                >
                  {badge.pass ? "PASS" : "FAIL"}
                </span>
                <span class="text-[11px] text-sub">
                  error ≤ {badge.cutoff}% for {CATEGORY_LABELS[badge.category]}
                </span>
              </div>
            )}
          </For>
        </div>
        <p class="mt-3 text-center text-[11px] text-sub">
          Same scoring for every post tier — only the maximum allowed error %
          changes. Official SSC CGL tiers: Strict (CPT/Tax Asst/ASO/Inspector)
          vs General posts. CHSL shown for reference.
        </p>
      </div>

      {/* the diff */}
      <div class="w-full rounded-2xl border border-sub-alt bg-sub-alt p-5">
        <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 class="text-lg font-black text-text">Word-by-word diff</h2>
          <div class="flex flex-wrap items-center gap-3 text-[11px] text-sub">
            <span class="flex items-center gap-1">
              <span class="inline-block size-3 rounded-sm bg-error"></span> full
              mistake (−1)
            </span>
            <span class="flex items-center gap-1">
              <span class="bg-amber-400 inline-block size-3 rounded-sm"></span>{" "}
              half mistake (−0.5)
            </span>
            <span class="flex items-center gap-1">
              <span class="inline-block size-3 rounded-sm bg-text line-through"></span>{" "}
              omitted
            </span>
          </div>
        </div>
        <p class="rounded-xl bg-bg p-4 font-[Times_New_Roman,Times,serif] text-[15px] leading-7 text-text">
          <For each={passageTokens()}>
            {(token) => {
              const entry = token.entry;
              const type = entry?.type ?? "correct";
              const isOmission = entry?.reason === "omission";
              return (
                <span>
                  <span
                    title={
                      entry?.actual !== undefined
                        ? `you typed: “${entry.actual}”`
                        : entry?.expected !== undefined && isOmission
                          ? "not typed"
                          : undefined
                    }
                    class={cn(
                      "rounded-sm",
                      type === "full" && "bg-error px-0.5 text-bg",
                      type === "half" && "bg-amber-400 px-0.5 text-bg",
                      isOmission && "line-through",
                    )}
                  >
                    {token.word}
                  </span>{" "}
                </span>
              );
            }}
          </For>
        </p>

        {/* mistakes table */}
        <Show
          when={mistakeEntries().length > 0}
          fallback={
            <p class="mt-4 text-center text-sm font-bold text-main">
              <Fa icon="fa-check-circle" class="mr-2" />
              Zero mistakes — a clean sheet, candidate.
            </p>
          }
        >
          <div class="mt-4 max-h-72 overflow-y-auto rounded-xl border border-bg">
            <table class="w-full text-left text-sm">
              <thead class="sticky top-0 bg-sub-alt text-[10px] tracking-widest text-sub uppercase">
                <tr>
                  <th class="px-3 py-2">#</th>
                  <th class="px-3 py-2">Passage</th>
                  <th class="px-3 py-2">You typed</th>
                  <th class="px-3 py-2">Mistake</th>
                  <th class="px-3 py-2 text-right">Penalty</th>
                </tr>
              </thead>
              <tbody>
                <For each={mistakeEntries()}>
                  {(entry, i) => (
                    <tr class="border-t border-bg">
                      <td class="px-3 py-1.5 text-sub tabular-nums">
                        {i() + 1}
                      </td>
                      <td class="px-3 py-1.5 font-[Times_New_Roman,Times,serif] text-text">
                        {entry.expected ?? "—"}
                      </td>
                      <td class="px-3 py-1.5 font-[Times_New_Roman,Times,serif] text-sub">
                        {entry.actual ?? "—"}
                      </td>
                      <td class="px-3 py-1.5 text-xs text-sub">
                        {entry.reason
                          ? (REASON_LABELS[entry.reason] ?? entry.reason)
                          : "—"}
                      </td>
                      <td
                        class={cn(
                          "px-3 py-1.5 text-right font-bold tabular-nums",
                          entry.type === "full"
                            ? "text-error"
                            : "text-amber-400",
                        )}
                      >
                        {entry.type === "full" ? "1.0" : "0.5"}
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
          <Show when={score().diff.spacingHalfMistakes > 0}>
            <p class="mt-2 text-xs text-sub">
              + {score().diff.spacingHalfMistakes} half mistake(s) from extra
              spaces / line breaks in your typing (not shown in the table
              above).
            </p>
          </Show>
        </Show>
      </div>

      {/* actions */}
      <div class="flex flex-wrap items-center justify-center gap-3 pb-4">
        <Button
          variant="button"
          fa={{ icon: "fa-redo", fixedWidth: true }}
          text="Retake this passage"
          onClick={props.onRetry}
        />
        <Button
          variant="button"
          fa={{ icon: "fa-th-list", fixedWidth: true }}
          text="Choose another passage"
          onClick={props.onBackToSetup}
        />
      </div>
    </div>
  );
}
