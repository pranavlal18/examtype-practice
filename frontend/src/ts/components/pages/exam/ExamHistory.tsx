import { createSignal, For, JSXElement, Show } from "solid-js";

import {
  clearExamHistory,
  exportAttempts,
  getExamHistory,
  importAttempts,
  mergeAndStoreAttempts,
  type ExamAttempt,
} from "../../../exam/exam-history";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

function formatAttemptDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const KIND_STYLES: Record<ExamAttempt["passageKind"], string> = {
  bank: "bg-bg text-sub",
  custom: "bg-main text-bg",
  drill: "bg-amber-400 text-bg",
};

const KIND_LABELS: Record<ExamAttempt["passageKind"], string> = {
  bank: "DEST passage",
  custom: "custom text",
  drill: "drill",
};

export function ExamHistory(): JSXElement {
  const [attempts, setAttempts] = createSignal<ExamAttempt[]>(getExamHistory());
  const [importError, setImportError] = createSignal("");
  const [notice, setNotice] = createSignal("");
  let fileInputRef: HTMLInputElement | undefined;

  const refresh = () => {
    setAttempts(getExamHistory());
  };

  const handleClear = () => {
    clearExamHistory();
    setNotice("History cleared.");
    refresh();
  };

  const handleExport = () => {
    const blob = new Blob([exportAttempts(attempts())], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "examtype-history.json";
    a.click();
    URL.revokeObjectURL(url);
    setNotice(`Exported ${attempts().length} attempt(s).`);
  };

  const handleImportFile = async (file: File | undefined) => {
    setImportError("");
    setNotice("");
    if (!file) return;
    const text = await file.text();
    const result = importAttempts(text);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    const added = mergeAndStoreAttempts(result.attempts);
    setNotice(
      `Imported ${result.attempts.length} attempt(s), ${added} new — history capped at 50.`,
    );
    refresh();
  };

  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="text-xs tracking-widest text-sub uppercase">
          {attempts().length} attempt(s) stored locally
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <Button
            variant="text"
            fa={{ icon: "fa-file-export", fixedWidth: true }}
            text="Export"
            onClick={handleExport}
          />
          <Button
            variant="text"
            fa={{ icon: "fa-file-import", fixedWidth: true }}
            text="Import"
            onClick={() => fileInputRef?.click()}
          />
          <input
            ref={(el) => (fileInputRef = el)}
            type="file"
            accept="application/json,.json"
            class="hidden"
            onInput={(e) => void handleImportFile(e.currentTarget.files?.[0])}
          />
          <Show when={attempts().length > 0}>
            <Button
              variant="text"
              fa={{ icon: "fa-trash", fixedWidth: true }}
              text="Clear"
              onClick={handleClear}
            />
          </Show>
        </div>
      </div>

      <Show when={importError()}>
        <p class="rounded-lg bg-error px-3 py-2 text-xs font-bold text-bg">
          <Fa icon="fa-exclamation-triangle" class="mr-1" />
          {importError()}
        </p>
      </Show>
      <Show when={notice()}>
        <p class="rounded-lg bg-sub-alt px-3 py-2 text-xs text-main">
          {notice()}
        </p>
      </Show>

      <Show
        when={attempts().length > 0}
        fallback={
          <div class="rounded-xl border border-dashed border-sub p-8 text-center">
            <Fa icon="fa-history" size={1.5} class="mb-2 text-sub" />
            <p class="font-bold text-text">No attempts yet</p>
            <p class="mx-auto mt-1 max-w-sm text-xs text-sub">
              Finish a DEST-style test or a weak-key drill and it will be
              recorded here — KDPH, Net WPM, error %, mistake breakdown.
            </p>
          </div>
        }
      >
        <div class="max-h-96 overflow-y-auto rounded-xl border border-bg">
          <table class="w-full text-left text-xs">
            <thead class="sticky top-0 bg-sub-alt text-[10px] tracking-widest text-sub uppercase">
              <tr>
                <th class="px-3 py-2">When</th>
                <th class="px-3 py-2">Passage</th>
                <th class="px-3 py-2 text-right">Error %</th>
                <th class="px-3 py-2 text-right">Net WPM</th>
                <th class="px-3 py-2 text-right">KDPH</th>
                <th class="px-3 py-2 text-right">KDs</th>
              </tr>
            </thead>
            <tbody>
              <For each={attempts()}>
                {(attempt) => (
                  <tr class="border-t border-bg">
                    <td class="px-3 py-2 whitespace-nowrap text-sub">
                      {formatAttemptDate(attempt.date)}
                    </td>
                    <td class="max-w-[22ch] px-3 py-2">
                      <span
                        class="block truncate font-semibold text-text"
                        title={attempt.passageTitle}
                      >
                        {attempt.passageTitle}
                      </span>
                      <span
                        class={cn(
                          "mt-0.5 inline-block rounded px-1.5 py-0.5 text-[9px] font-bold tracking-widest uppercase",
                          KIND_STYLES[attempt.passageKind],
                        )}
                      >
                        {KIND_LABELS[attempt.passageKind]}
                        {attempt.completedBy === "time" ? " · time up" : ""}
                      </span>
                    </td>
                    <td
                      class={cn(
                        "px-3 py-2 text-right font-bold tabular-nums",
                        attempt.errorPercent <= 7 ? "text-main" : "text-error",
                      )}
                    >
                      {attempt.errorPercent.toFixed(2)}%
                    </td>
                    <td class="px-3 py-2 text-right text-text tabular-nums">
                      {attempt.netWpm}
                    </td>
                    <td class="px-3 py-2 text-right text-text tabular-nums">
                      {Math.round(attempt.kdph).toLocaleString()}
                    </td>
                    <td class="px-3 py-2 text-right text-sub tabular-nums">
                      {attempt.keyDepressions}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </Show>
    </div>
  );
}
