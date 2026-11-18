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
      <div class="hidden h-6 place-content-center text-[2rem] leading-0 sm:grid">
        <div
          class={cn(
            "-mt-[1.65em] hidden pl-[0.5em] text-[0.315em] leading-0 text-sub transition-colors duration-125 group-focus-visible/logo:text-transparent lg:block",
            {
              "text-transparent": isFocusMode(),
            },
          )}
          data-ui-element="logoSubtext"
        >
          practice
        </div>
        <h1
          class={cn("-mt-[0.11em] text-text transition-colors duration-250", {
            "text-sub": isFocusMode(),
          })}
          data-ui-element="logoText"
        >
          examtype
        </h1>
      </div>
    </Link>
  );
}
