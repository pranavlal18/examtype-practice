/* oxlint-disable react/no-unknown-property -- Solid passes lowercase attributes through verbatim */
import {
  createSignal,
  JSXElement,
  onCleanup,
  onMount,
  Show,
  untrack,
} from "solid-js";

import type {
  ExamOutcome,
  ExamSession,
  KeystrokeLogEntry,
} from "../../../exam/types";

import {
  AmbientAudio,
  getExamAmbientNoise,
  getExamPaceTarget,
  nextPaceTarget,
  setExamPaceTarget,
  type PaceTarget,
} from "../../../exam/ambient-audio";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function countWords(text: string): number {
  const t = text.trim();
  return t.length > 0 ? t.split(/\s+/).length : 0;
}

const PACE_SCALE_WPM = 60; // bar visualises 0–60 WPM

/**
 * The live exam hall: split-screen TCS iON layout, no live highlighting,
 * no auto-scroll, no error colors — mistakes are revealed only on the
 * result screen. Timer auto-submits at zero.
 *
 * The typing area is uncontrolled and the key-depression counter is a plain
 * ref on purpose: finishing must work from the (non-reactive) timer callback
 * and from untracked event paths, so nothing inside `finish` is reactive.
 */
export function ExamTest(props: {
  session: ExamSession;
  onFinish: (outcome: ExamOutcome) => void;
}): JSXElement {
  const totalSeconds = untrack(() => props.session.durationMinutes * 60);
  const onFinish = untrack(() => props.onFinish);
  const isTrainer = untrack(() => props.session.kind === "trainer");
  const isDevanagari = untrack(() =>
    /[\u0900-\u097F]/.test(props.session.passageText),
  );
  const passageFont = isDevanagari
    ? '"Noto Sans Devanagari","Noto Serif Devanagari","Nirmala UI","Mangal",sans-serif'
    : '"Times New Roman",Times,serif';
  const startedAt = Date.now();
  const [remaining, setRemaining] = createSignal(totalSeconds);
  const [typedChars, setTypedChars] = createSignal(0);
  const [wordsTyped, setWordsTyped] = createSignal(0);
  const [keyDepressions, setKeyDepressions] = createSignal(0);
  const [backspaceFlash, setBackspaceFlash] = createSignal(false);
  const [focused, setFocused] = createSignal(false);
  const [paceTarget, setPaceTarget] =
    createSignal<PaceTarget>(getExamPaceTarget());
  let kdCount = 0;
  let textareaRef: HTMLTextAreaElement | undefined;
  const strokes: KeystrokeLogEntry[] = [];
  let lastKeyAt: number | null = null;
  const ambient = new AmbientAudio();

  onMount(() => {
    textareaRef?.focus();
    if (getExamAmbientNoise()) ambient.start();
  });
  onCleanup(() => ambient.stop());

  const finish = (completedBy: ExamOutcome["completedBy"]) => {
    ambient.stop();
    const elapsed = Math.min(
      totalSeconds,
      Math.max(0, Math.round((Date.now() - startedAt) / 1000)),
    );
    onFinish({
      typedText: textareaRef?.value ?? "",
      keyDepressions: kdCount,
      elapsedSeconds: elapsed,
      completedBy,
      keystrokes: strokes,
    });
  };

  const interval = window.setInterval(() => {
    const elapsed = (Date.now() - startedAt) / 1000;
    if (elapsed >= totalSeconds) {
      window.clearInterval(interval);
      setRemaining(0);
      finish("time");
      return;
    }
    setRemaining(Math.ceil(totalSeconds - elapsed));
  }, 200);
  onCleanup(() => window.clearInterval(interval));

  const progress = () => ((totalSeconds - remaining()) / totalSeconds) * 100;
  const elapsedMinutes = () => (totalSeconds - remaining()) / 60;
  const yourPace = () => {
    const m = elapsedMinutes();
    return m > 0 ? Math.floor(typedChars() / 5 / m) : 0;
  };
  const yourFill = () => Math.min(100, (yourPace() / PACE_SCALE_WPM) * 100);
  const ghostPos = () => (paceTarget() / PACE_SCALE_WPM) * 100;

  const cyclePaceTarget = () => {
    const next = nextPaceTarget(paceTarget());
    setPaceTarget(next);
    setExamPaceTarget(next);
  };

  const bumpKeyDepressions = () => {
    kdCount += 1;
    setKeyDepressions(kdCount);
  };

  const logStroke = (
    key: string,
    now: number,
    correct: boolean | null,
  ): void => {
    const latencyMs = lastKeyAt === null ? null : now - lastKeyAt;
    lastKeyAt = now;
    strokes.push({ t: now - startedAt, key, latencyMs, correct });
  };

  const handleKeyDown = (
    e: KeyboardEvent & { currentTarget: HTMLTextAreaElement },
  ) => {
    const key = e.key;
    const now = Date.now();
    if (key === "Tab") {
      e.preventDefault();
      return;
    }
    if (key === "F2") {
      e.preventDefault();
      finish("submit");
      return;
    }
    if (key === "Backspace" && props.session.backspaceDisabled) {
      e.preventDefault();
      setBackspaceFlash(true);
      window.setTimeout(() => setBackspaceFlash(false), 1200);
      return; // blocked key: not logged, not counted
    }
    if (key === "Backspace") {
      logStroke(key, now, null);
      bumpKeyDepressions();
      ambient.playKey();
      return;
    }
    if (key === "Enter" || key.length === 1) {
      const idx = textareaRef?.value.length ?? 0;
      const expected: string | undefined = props.session.passageText[idx];
      const correct = expected === undefined ? null : key === expected;
      logStroke(key, now, correct);
      bumpKeyDepressions();
      ambient.playKey();
    }
  };

  const handleInput = (
    e: InputEvent & { currentTarget: HTMLTextAreaElement },
  ) => {
    const value = e.currentTarget.value;
    setTypedChars(value.length);
    setWordsTyped(countWords(value));
  };

  return (
    <div class="flex w-full flex-col gap-3 py-2">
      {/* exam header bar */}
      <div class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sub-alt bg-sub-alt px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <div class="grid size-9 place-items-center rounded-md bg-main text-base font-black text-bg">
            {isTrainer ? "DRILL" : "SSC"}
          </div>
          <div>
            <div class="text-xs font-bold tracking-widest text-sub uppercase">
              {isTrainer ? "Weak-Key Trainer" : "DEST · Descriptive Paper"}
            </div>
            <div class="max-w-[40ch] truncate font-semibold text-text">
              {props.session.title}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <Show when={props.session.backspaceDisabled}>
            <span class="hidden items-center gap-1 rounded bg-error px-2 py-1 text-[10px] font-bold tracking-widest text-bg uppercase sm:flex">
              <Fa icon="fa-ban" /> no backspace
            </span>
          </Show>
          <div class="text-right">
            <div class="text-[10px] tracking-widest text-sub uppercase">
              time left
            </div>
            <div
              class={cn(
                "text-3xl leading-none font-black tabular-nums",
                remaining() <= 60 ? "text-error" : "text-main",
              )}
            >
              {formatTime(remaining())}
            </div>
          </div>
        </div>
      </div>

      {/* pace bar */}
      <div class="flex items-center gap-3 rounded-xl border border-sub-alt bg-sub-alt px-4 py-2">
        <button
          type="button"
          onClick={cyclePaceTarget}
          title="cycle pace target (30 → 35 → 40 → 45)"
          class="cursor-pointer rounded-md bg-bg px-2 py-1 text-[10px] font-bold tracking-widest text-sub uppercase transition-colors hover:text-text"
        >
          target {paceTarget()} wpm
        </button>
        <div class="relative h-2 flex-1 rounded-full bg-bg">
          <div
            class="absolute inset-y-0 left-0 rounded-full bg-main"
            style={{ width: `${yourFill()}%` }}
          ></div>
          <div
            class="absolute -inset-y-1 w-0.5 bg-sub"
            style={{ left: `${ghostPos()}%` }}
          ></div>
        </div>
        <span class="text-[10px] font-bold tracking-widest text-sub uppercase tabular-nums">
          you {yourPace()}
        </span>
      </div>

      {/* progress bar (not scroll, not live scoring — just a time bar) */}
      <div class="h-1.5 w-full overflow-hidden rounded-full bg-sub-alt">
        <div
          class="h-full bg-main transition-[width] duration-200 ease-linear"
          style={{ width: `${progress()}%` }}
        ></div>
      </div>

      {/* split screen */}
      <div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* passage panel */}
        <div class="flex flex-col overflow-hidden rounded-2xl border border-sub-alt bg-sub-alt">
          <div class="flex items-center justify-between border-b border-bg px-5 py-2">
            <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
              {isTrainer ? "Drill passage" : "Passage — read only"}
            </span>
            <span class="text-xs text-sub tabular-nums">
              {props.session.passageText.length} chars
            </span>
          </div>
          <div class="max-h-[62vh] min-h-[16rem] overflow-y-auto px-6 py-5 lg:min-h-[26rem]">
            <p
              lang={isDevanagari ? "hi" : "en"}
              class="text-[15px] leading-7 whitespace-pre-wrap text-text"
              style={{ "font-family": passageFont }}
            >
              {props.session.passageText}
            </p>
          </div>
        </div>

        {/* typing panel */}
        <div class="flex flex-col gap-2 overflow-hidden rounded-2xl border border-sub-alt bg-sub-alt">
          <div class="flex items-center justify-between border-b border-bg px-5 py-2">
            <span class="text-[10px] font-bold tracking-widest text-sub uppercase">
              Your typing
            </span>
            <span class="text-xs text-sub">mistakes revealed after submit</span>
          </div>
          <textarea
            ref={(el) => (textareaRef = el)}
            lang={isDevanagari ? "hi" : "en"}
            class="min-h-[16rem] w-full flex-1 resize-none bg-bg p-5 text-[15px] leading-7 text-text outline-none placeholder:text-sub lg:min-h-[18rem]"
            style={{ "font-family": passageFont }}
            placeholder="Start typing here. In the real exam, every keystroke is counted and nothing is corrected for you…"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            spellcheck={false}
            autocapitalize="off"
            autocomplete="off"
            autocorrect="off"
            wrap="soft"
          ></textarea>
          <Show when={backspaceFlash()}>
            <div class="mx-3 flex items-center gap-2 rounded-lg bg-error px-3 py-2 text-xs font-bold text-bg">
              <Fa icon="fa-ban" /> Backspace is disabled in this drill
            </div>
          </Show>
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-bg px-5 py-3">
            <div class="flex items-center gap-4 text-xs text-sub">
              <span>
                words <b class="text-text tabular-nums">{wordsTyped()}</b>
              </span>
              <span>
                key depressions{" "}
                <b class="text-text tabular-nums">{keyDepressions()}</b>
              </span>
              <Show when={!focused()}>
                <button
                  type="button"
                  class="cursor-pointer font-bold text-main underline"
                  onClick={() => textareaRef?.focus()}
                >
                  click to refocus
                </button>
              </Show>
            </div>
            <Button
              variant="button"
              class="px-6"
              fa={{ icon: "fa-flag-checkered", fixedWidth: true }}
              text="SUBMIT (F2)"
              onClick={() => finish("submit")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
