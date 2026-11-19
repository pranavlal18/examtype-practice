import { Link } from "@tanstack/solid-router";
import { JSXElement } from "solid-js";

import { getRoutePage } from "../../../states/router";
import { isFocusMode } from "../../../states/test";
import { restartTest } from "../../../test/test-logic";
import { cn } from "../../../utils/cn";

export function Logo(): JSXElement {
  return (
    <Link
      to="/"
      class="group/logo -m-2 flex h-6 w-max gap-2 rounded-[0.8rem] p-2"
      aria-label="ExamType Practice Home"
      style={{
        "box-sizing": "content-box",
        "font-family": "Lexend Deca ,sans-serif",
      }}
      data-ui-element="logo"
      onClick={() => {
        if (getRoutePage() === "test") void restartTest();
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        class={cn("h-full transition-opacity", {
          "opacity-60": isFocusMode(),
        })}
        aria-hidden="true"
      >
        <rect width="64" height="64" rx="14" fill="#172554"></rect>
        <path
          d="M36 10 L21 36 H31 L27 54 L47 27 H36 L44 10 Z"
          fill="#fbbf24"
        ></path>
        <rect x="8" y="20" width="16" height="4" rx="2" fill="#f97316"></rect>
        <rect x="8" y="30" width="12" height="4" rx="2" fill="#f97316"></rect>
        <rect x="8" y="40" width="16" height="4" rx="2" fill="#f97316"></rect>
      </svg>
      <div class="hidden h-6 flex-col justify-center text-[2rem] leading-none sm:flex">
        <h1
          class={cn("text-text transition-colors duration-250", {
            "text-sub": isFocusMode(),
          })}
          data-ui-element="logoText"
        >
          examtype
        </h1>
        <div
          class={cn(
            "pl-[0.08em] text-[0.32em] leading-none text-main transition-colors duration-125",
            {
              "text-sub": isFocusMode(),
            },
          )}
          data-ui-element="logoSubtext"
        >
          PRACTICE
        </div>
      </div>
    </Link>
  );
}
