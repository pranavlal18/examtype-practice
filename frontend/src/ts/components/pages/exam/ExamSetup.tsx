/* oxlint-disable react/no-unknown-property -- Solid passes lowercase attributes through verbatim */
import {
  createMemo,
  createResource,
  createSignal,
  For,
  JSXElement,
  Show,
} from "solid-js";

import type { ExamSession } from "../../../exam/types";

import {
  getExamAmbientNoise,
  setExamAmbientNoise,
} from "../../../exam/ambient-audio";
import {
  getExamPassages,
  type ExamPassageLanguage,
} from "../../../exam/exam-passages";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";
import { ExamHistory } from "./ExamHistory";

const MIN_CUSTOM = 200;
const MAX_CUSTOM = 10_000;
const SOFT_TARGET = 2000;

export function ExamSetup(props: {
  onStart: (session: ExamSession) => void;
}): JSXElement {
  const [passages] = createResource(getExamPassages);
  const passagesError = (): unknown => passages.error;
  const [tab, setTab] = createSignal<"bank" | "custom" | "history">("bank");
  const [selectedId, setSelectedId] = createSignal<string>();
  const [customText, setCustomText] = createSignal("");
  const [duration, setDuration] = createSignal<5 | 10 | 15>(15);
  const [backspaceDisabled, setBackspaceDisabled] = createSignal(false);
  const [ambientNoise, setAmbientNoise] = createSignal(getExamAmbientNoise());
  const [examLanguage, setExamLanguage] =
    createSignal<ExamPassageLanguage>("en");
  const filteredPassages = createMemo(() =>
    passages()?.filter((passage) => passage.language === examLanguage()),
  );

  const selectedPassage = () => {
    const list = filteredPassages();
    if (list === undefined || list.length === 0) return undefined;
    const first = list[0];
    if (first === undefined) return undefined;
    const id = selectedId() ?? first.id;
    return list.find((p) => p.id === id) ?? first;
  };

  const customLength = () => customText().length;
  const customState = (): "tooShort" | "ok" | "aroundTarget" | "tooLong" => {
    const n = customLength();
    if (n < MIN_CUSTOM) return "tooShort";
    if (n > MAX_CUSTOM) return "tooLong";
    if (n >= SOFT_TARGET - 150 && n <= SOFT_TARGET + 150) return "aroundTarget";
    return "ok";
  };
  const customValid = () => {
    const n = customLength();
    return n >= MIN_CUSTOM && n <= MAX_CUSTOM;
  };

  const canStart = () =>
    tab() === "bank" ? selectedPassage() !== undefined : customValid();

  const start = () => {
    const passage = selectedPassage();
    if (tab() === "bank") {
      if (passage === undefined) return;
      props.onStart({
        title: passage.title,
        passageText: passage.text,
        durationMinutes: duration(),
        backspaceDisabled: backspaceDisabled(),
      });
    } else {
      if (!customValid()) return;
      props.onStart({
        title: "Custom text",
        passageText: customText(),
        durationMinutes: duration(),
        backspaceDisabled: backspaceDisabled(),
      });
    }
  };

  const durationOptions = [5, 10, 15] as const;

  return (
    <div class="flex w-full flex-col items-center gap-6 py-2">
      {/* header */}
      <div class="flex flex-col items-center gap-2 text-center">
        <div class="flex items-center gap-3">
          <div class="grid size-10 place-items-center rounded-md bg-main text-xl font-black text-bg">
            SSC
          </div>
          <h1 class="text-3xl font-black text-text sm:text-4xl">
            Government Exam Typing
          </h1>
        </div>
        <p class="max-w-xl text-sm text-sub">
          SSC CGL DEST · SSC CHSL · RRB NTPC — authentic split-screen practice.
          No live highlighting, no hints. Mistakes are revealed only after you
          submit, like the real examination.
        </p>
      </div>

      {/* panel */}
      <div class="w-full max-w-4xl rounded-2xl border border-sub-alt bg-sub-alt p-4 sm:p-6">
        {/* tabs */}
        <div class="mb-4 flex flex-wrap gap-2">
          <Button
            variant="button"
            active={tab() === "bank"}
            fa={{ icon: "fa-layer-group", fixedWidth: true }}
            text="Passage bank"
            onClick={() => setTab("bank")}
          />
          <Button
            variant="button"
            active={tab() === "custom"}
            fa={{ icon: "fa-paste", fixedWidth: true }}
            text="Custom text"
            onClick={() => setTab("custom")}
          />
          <Button
            variant="button"
            active={tab() === "history"}
            fa={{ icon: "fa-history", fixedWidth: true }}
            text="History"
            onClick={() => setTab("history")}
          />
        </div>

        {/* passage bank */}
        <Show when={tab() === "bank"}>
          <div class="mb-3 flex flex-wrap items-center gap-2">
            <span class="text-xs font-bold tracking-widest text-sub uppercase">
              passage language
            </span>
            <Button
              variant="button"
              active={examLanguage() === "en"}
              fa={{ icon: "fa-language", fixedWidth: true }}
              text="English"
              onClick={() => {
                setExamLanguage("en");
                setSelectedId(undefined);
              }}
            />
            <Button
              variant="button"
              active={examLanguage() === "hi"}
              fa={{ icon: "fa-language", fixedWidth: true }}
              text="हिन्दी"
              onClick={() => {
                setExamLanguage("hi");
                setSelectedId(undefined);
              }}
            />
          </div>
          <Show
            when={filteredPassages()}
            fallback={
              <div class="p-6 text-center text-sub">
                <Show when={passagesError()} fallback={"loading passages…"}>
                  {
                    "Could not load the passage bank. Check your connection and reload."
                  }
                </Show>
              </div>
            }
          >
            {(list) => (
              <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <For each={list()}>
                  {(p) => (
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      class={cn(
                        "flex cursor-pointer flex-col gap-2 rounded-xl border p-4 text-left transition-colors",
                        selectedPassage()?.id === p.id
                          ? "border-main bg-bg"
                          : "border-transparent bg-bg hover:border-sub",
                      )}
                    >
                      <div class="font-bold text-text">{p.title}</div>
                      <div class="flex flex-wrap gap-1">
                        <For each={p.topics}>
                          {(topic) => (
                            <span class="rounded bg-sub-alt px-2 py-0.5 text-xs text-sub">
                              {topic}
                            </span>
                          )}
                        </For>
                      </div>
                      <div class="mt-auto text-xs text-sub">
                        {p.charCount} key depressions · original sample
                      </div>
                    </button>
                  )}
                </For>
              </div>
            )}
          </Show>
        </Show>

        {/* custom text */}
        <Show when={tab() === "custom"}>
          <div class="flex flex-col gap-2">
            <textarea
              class="h-44 w-full resize-y rounded-xl border border-bg bg-bg p-4 font-[Times_New_Roman,Times,serif] text-[15px] leading-7 text-text outline-none placeholder:text-sub focus:border-main"
              placeholder="Paste any paragraph here — an editorial, a current affairs piece, yesterday's newspaper. Aim for ~2,000 characters for a classic DEST passage, or anything between 200 and 10,000 characters."
              value={customText()}
              onInput={(e) => setCustomText(e.currentTarget.value)}
              spellcheck={false}
              autocapitalize="off"
              autocomplete="off"
            ></textarea>
            <div class="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div
                class={cn(
                  "tabular-nums",
                  customState() === "aroundTarget" && "text-main",
                  (customState() === "tooShort" ||
                    customState() === "tooLong") &&
                    "text-error",
                )}
              >
                {customLength()} chars
                <span class="text-sub"> · soft target ~{SOFT_TARGET}</span>
              </div>
              <div class="text-sub">
                <Show when={customState() === "tooShort"}>
                  need at least {MIN_CUSTOM} chars to start
                </Show>
                <Show when={customState() === "tooLong"}>
                  maximum {MAX_CUSTOM.toLocaleString()} chars
                </Show>
                <Show when={customState() === "ok"}>
                  fine for practice — shorter drills work too
                </Show>
                <Show when={customState() === "aroundTarget"}>
                  classic DEST-length passage
                </Show>
              </div>
            </div>
          </div>
        </Show>

        {/* history */}
        <Show when={tab() === "history"}>
          <ExamHistory />
        </Show>

        {/* options row */}
        <Show when={tab() !== "history"}>
          <div class="mt-5 flex flex-col gap-4 border-t border-bg pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex flex-col gap-1">
              <span class="text-xs tracking-wide text-sub uppercase">
                duration
              </span>
              <div class="flex gap-1 rounded-lg bg-bg p-1">
                <For each={durationOptions}>
                  {(d) => (
                    <button
                      type="button"
                      onClick={() => setDuration(d)}
                      class={cn(
                        "cursor-pointer rounded-md px-4 py-1.5 text-sm font-bold tabular-nums transition-colors",
                        duration() === d
                          ? "bg-main text-bg"
                          : "text-sub hover:text-text",
                      )}
                    >
                      {d}:00
                    </button>
                  )}
                </For>
              </div>
              <span class="text-xs text-sub">
                15:00 is the official DEST length · 5/10 for drills
              </span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs tracking-wide text-sub uppercase">
                backspace
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={backspaceDisabled()}
                onClick={() => setBackspaceDisabled((v) => !v)}
                class={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm font-bold transition-colors",
                  backspaceDisabled() ? "text-error" : "text-text",
                )}
              >
                <span
                  class={cn(
                    "grid h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                    backspaceDisabled() ? "bg-error" : "bg-sub-alt",
                  )}
                >
                  <span
                    class={cn(
                      "size-4 rounded-full bg-bg transition-transform",
                      backspaceDisabled() && "translate-x-4",
                    )}
                  ></span>
                </span>
                Backspace {backspaceDisabled() ? "disabled" : "allowed"}
              </button>
              <span class="text-xs text-sub">
                allowed in real SSC CGL/CHSL — disable for discipline drills
              </span>
            </div>

            <div class="flex flex-col gap-1">
              <span class="text-xs tracking-wide text-sub uppercase">
                ambient noise
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={ambientNoise()}
                onClick={() => {
                  const next = !ambientNoise();
                  setAmbientNoise(next);
                  setExamAmbientNoise(next);
                }}
                class={cn(
                  "flex cursor-pointer items-center gap-2 rounded-lg bg-bg px-3 py-2 text-sm font-bold transition-colors",
                  ambientNoise() ? "text-main" : "text-text",
                )}
              >
                <span
                  class={cn(
                    "grid h-5 w-9 items-center rounded-full p-0.5 transition-colors",
                    ambientNoise() ? "bg-main" : "bg-sub-alt",
                  )}
                >
                  <span
                    class={cn(
                      "size-4 rounded-full bg-bg transition-transform",
                      ambientNoise() && "translate-x-4",
                    )}
                  ></span>
                </span>
                Hall clatter {ambientNoise() ? "on" : "off"}
              </button>
              <span class="text-xs text-sub">
                subtle typing sounds · every keystroke
              </span>
            </div>
          </div>
        </Show>

        {/* start */}
        <Show when={tab() !== "history"}>
          <div class="mt-5 flex items-center justify-between gap-4">
            <p class="max-w-xs text-xs text-sub">
              The timer starts the moment you press Start. It auto-submits at
              zero — an unfinished last word counts as it stands.
            </p>
            <Button
              variant="button"
              class="px-8 py-3 text-lg"
              fa={{ icon: "fa-play", fixedWidth: true }}
              text="START TEST"
              disabled={!canStart()}
              onClick={start}
            />
          </div>
        </Show>
      </div>

      {/* footer note */}
      <p class="text-center text-xs text-sub">
        <Fa icon="fa-shield-alt" class="mr-1" /> Results are computed locally
        and never leave your browser. Scoring: full mistakes 1.0 · half mistakes
        0.5 · error % vs SSC category cutoffs (reference figures — check the
        current notification for your post).
      </p>
    </div>
  );
}
