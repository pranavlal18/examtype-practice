import { createSignal, For, JSXElement, Show } from "solid-js";

import type { ExamOutcome, ExamSession } from "../../../exam/types";

import { generateDrill } from "../../../exam/drill-generator";
import { getKeyStats, rankWeakKeys } from "../../../exam/key-stats";
import { recordExamOutcome } from "../../../exam/record-attempt";
import { calculateExamScore } from "../../../exam/ssc-scoring";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";
import { ExamTest } from "../exam/ExamTest";

type Phase = "idle" | "drill" | "done";

const FALLBACK_KEYS = ["z", "q", "x", "j"];

export function TrainerPage(): JSXElement {
  const [phase, setPhase] = createSignal<Phase>("idle");
  const [includeNumbers, setIncludeNumbers] = createSignal(false);
  const [seed, setSeed] = createSignal(Math.floor(Math.random() * 1e9));
  const [outcome, setOutcome] = createSignal<ExamOutcome>();
  const [drillNumber, setDrillNumber] = createSignal(1);

  const weakKeys = () => rankWeakKeys(getKeyStats(), 8);
  const targetKeys = () => {
    const weak = weakKeys().map((w) => w.key);
    return weak.length > 0 ? weak : FALLBACK_KEYS;
  };

  const session = (): ExamSession => ({
    title: `Weak-Key Drill #${drillNumber()}`,
    passageText: generateDrill(seed(), targetKeys(), {
      includeNumbers: includeNumbers(),
      targetChars: 480,
    }),
    durationMinutes: 1,
    backspaceDisabled: false,
    kind: "trainer",
  });

  const startDrill = () => {
    setSeed(Math.floor(Math.random() * 1e9));
    setPhase("drill");
  };

  const finishDrill = (o: ExamOutcome) => {
    recordExamOutcome(session(), o);
    setOutcome(o);
    setPhase("done");
  };

  const score = () => {
    const o = outcome();
    if (o === undefined || o.typedText.length === 0) return undefined;
    return calculateExamScore({
      passageText: session().passageText,
      typedText: o.typedText,
      keyDepressions: o.keyDepressions,
      elapsedSeconds: o.elapsedSeconds,
    });
  };

  return (
    <div class="content-grid grid w-full gap-4 py-4">
      <Show when={phase() === "idle"}>
        <div class="flex w-full flex-col items-center gap-6 py-2">
          <div class="flex flex-col items-center gap-2 text-center">
            <div class="flex items-center gap-3">
              <div class="grid size-10 place-items-center rounded-md bg-main text-xl text-bg">
                <Fa icon="fa-dumbbell" />
              </div>
              <h1 class="text-3xl font-black text-text sm:text-4xl">
                Weak-Key Trainer
              </h1>
            </div>
            <p class="max-w-lg text-sm text-sub">
              60-second drills built around the keys you actually mistype. Every
              exam test and drill feeds the tracker below — run a few DEST-style
              tests first for calibrated targeting.
            </p>
          </div>

          <div class="grid w-full max-w-4xl grid-cols-1 gap-4 md:grid-cols-2">
            {/* weak keys panel */}
            <div class="rounded-2xl border border-sub-alt bg-sub-alt p-5">
              <h2 class="mb-3 flex items-center gap-2 text-sm font-bold tracking-widest text-sub uppercase">
                <Fa icon="fa-bullseye" /> your weak keys
              </h2>
              <Show
                when={weakKeys().length > 0}
                fallback={
                  <p class="text-sm text-sub">
                    Not enough tracked keystrokes yet (need ≥5 per key). Drills
                    will target common problem letters:{" "}
                    <b class="text-text">z · q · x · j</b>
                  </p>
                }
              >
                <table class="w-full text-left text-sm">
                  <thead class="text-[10px] tracking-widest text-sub uppercase">
                    <tr>
                      <th class="pb-2">Key</th>
                      <th class="pb-2 text-right">Error rate</th>
                      <th class="pb-2 text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    <For each={weakKeys()}>
                      {(w) => (
                        <tr class="border-t border-bg">
                          <td class="py-1.5 font-mono font-bold text-main">
                            {w.key === "space" ? "␣" : w.key}
                          </td>
                          <td class="py-1.5 text-right text-text tabular-nums">
                            {(w.errorRate * 100).toFixed(0)}%
                          </td>
                          <td class="py-1.5 text-right text-sub tabular-nums">
                            {Math.round(w.latencyEma)} ms
                          </td>
                        </tr>
                      )}
                    </For>
                  </tbody>
                </table>
              </Show>
            </div>

            {/* controls */}
            <div class="flex flex-col gap-4 rounded-2xl border border-sub-alt bg-sub-alt p-5">
              <h2 class="flex items-center gap-2 text-sm font-bold tracking-widest text-sub uppercase">
                <Fa icon="fa-sliders-h" /> drill setup
              </h2>
              <label class="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-bg px-4 py-3">
                <span>
                  <span class="block text-sm font-bold text-text">
                    Number & punctuation drill
                  </span>
                  <span class="text-xs text-sub">
                    dates, percentages and figures mixed into the word salad
                  </span>
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeNumbers()}
                  onClick={() => setIncludeNumbers((v) => !v)}
                  class={cn(
                    "grid h-6 w-11 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors",
                    includeNumbers() ? "bg-main" : "bg-sub-alt",
                  )}
                >
                  <span
                    class={cn(
                      "size-5 rounded-full bg-bg transition-transform",
                      includeNumbers() && "translate-x-5",
                    )}
                  ></span>
                </button>
              </label>
              <div class="mt-auto flex flex-col gap-2">
                <div class="rounded-xl bg-bg p-4 text-xs leading-6 text-sub">
                  <p>
                    <b class="text-text">60 seconds</b> · word salad, seeded
                    randomly each run · target ~{targetKeys().length} weak keys
                    · results feed your weak-key matrix and history
                  </p>
                </div>
                <Button
                  variant="button"
                  class="px-8 py-3 text-lg"
                  fa={{ icon: "fa-play", fixedWidth: true }}
                  text="START DRILL"
                  onClick={startDrill}
                />
              </div>
            </div>
          </div>
        </div>
      </Show>

      <Show when={phase() === "drill"}>
        <ExamTest session={session()} onFinish={finishDrill} />
      </Show>

      <Show when={phase() === "done" ? outcome() : undefined} keyed>
        {(o) => (
          <div class="flex w-full flex-col items-center gap-6 py-6">
            <div class="flex flex-col items-center gap-1 text-center">
              <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
                {o.completedBy === "time" ? "Time's up" : "Drill submitted"}
              </span>
              <h1 class="text-3xl font-black text-text">Drill complete</h1>
            </div>
            <Show when={score()}>
              {(s) => (
                <div class="grid grid-cols-3 gap-3">
                  <div class="flex flex-col items-center rounded-2xl border border-sub-alt bg-sub-alt px-6 py-4">
                    <span class="text-4xl font-black text-main tabular-nums">
                      {s().netWpm}
                    </span>
                    <span class="text-[10px] tracking-widest text-sub uppercase">
                      net wpm
                    </span>
                  </div>
                  <div class="flex flex-col items-center rounded-2xl border border-sub-alt bg-sub-alt px-6 py-4">
                    <span class="text-4xl font-black text-text tabular-nums">
                      {s().kdph.toLocaleString()}
                    </span>
                    <span class="text-[10px] tracking-widest text-sub uppercase">
                      kdph
                    </span>
                  </div>
                  <div class="flex flex-col items-center rounded-2xl border border-sub-alt bg-sub-alt px-6 py-4">
                    <span class="text-4xl font-black text-text tabular-nums">
                      {s().keyDepressions}
                    </span>
                    <span class="text-[10px] tracking-widest text-sub uppercase">
                      key depressions
                    </span>
                  </div>
                </div>
              )}
            </Show>
            <div class="flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="button"
                fa={{ icon: "fa-redo", fixedWidth: true }}
                text="Another drill"
                onClick={() => {
                  setDrillNumber((n) => n + 1);
                  startDrill();
                }}
              />
              <Button
                variant="button"
                fa={{ icon: "fa-arrow-left", fixedWidth: true }}
                text="Back to setup"
                onClick={() => setPhase("idle")}
              />
            </div>
          </div>
        )}
      </Show>
    </div>
  );
}
