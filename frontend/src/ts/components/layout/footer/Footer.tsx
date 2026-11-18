import { JSXElement } from "solid-js";

import { getIsScreenshotting } from "../../../states/core";
import { isFocusMode } from "../../../states/test";
import { cn } from "../../../utils/cn";
import { isLoadingShown } from "../../core/PageSwitcher";
import { Keytips } from "./Keytips";
import { ThemeIndicator } from "./ThemeIndicator";

export function Footer(): JSXElement {
  return (
    <footer
      class={cn("relative flex flex-col text-xs text-sub", {
        "opacity-0": getIsScreenshotting(),
      })}
      data-focused={isFocusMode() ? "" : undefined}
      inert={isLoadingShown()}
    >
      <Keytips />

      <div
        class={cn("flex items-center justify-end transition-opacity", {
          "opacity-0": isFocusMode(),
        })}
      >
        <ThemeIndicator />
      </div>
      <p class="mt-2 border-t border-sub-alt pt-2 text-[10px] leading-4 text-sub opacity-80">
        ExamType Practice — free, open-source (GPL-3.0){" "}
        <a
          href="https://github.com/monkeytypegame/monkeytype"
          class="underline hover:text-text"
          target="_blank"
          rel="noreferrer noopener"
        >
          fork of Monkeytype
        </a>
        , modified and independently maintained. Not affiliated with SSC, RRB,
        Indian Railways, Government of India or Monkeytype. Source code:{" "}
        <a
          href="https://github.com/pranavlal18/examtype-practice"
          class="underline hover:text-text"
          target="_blank"
          rel="noreferrer noopener"
        >
          github.com/pranavlal18/examtype-practice
        </a>
        .
      </p>
    </footer>
  );
}
