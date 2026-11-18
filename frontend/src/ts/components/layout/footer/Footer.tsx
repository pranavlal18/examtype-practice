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
        ExamType — free, open-source practice tool for SSC CGL / CHSL and RRB
        NTPC typing tests.{" "}
        <a
          href="https://github.com/monkeytypegame/monkeytype"
          class="underline hover:text-text"
          target="_blank"
          rel="noreferrer noopener"
        >
          Fork of Monkeytype
        </a>{" "}
        (GPL-3.0), reworked and independently maintained. Not affiliated with
        the Staff Selection Commission or Indian Railways.
      </p>
    </footer>
  );
}
