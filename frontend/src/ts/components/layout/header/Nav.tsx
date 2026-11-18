import { JSXElement } from "solid-js";

import { getRoutePage } from "../../../states/router";
import { isFocusMode } from "../../../states/test";
import { restartTest } from "../../../test/test-logic";
import { cn } from "../../../utils/cn";
import { Button } from "../../common/Button";

/**
 * ExamType fork: no accounts, no leaderboards, no news — just the test,
 * the exam simulator, the trainer, and settings.
 */
export function Nav(): JSXElement {
  const buttonClass = () =>
    cn("aspect-square", {
      "opacity-(--nav-focus-opacity)": isFocusMode(),
    });

  return (
    <nav class={cn("z-5 flex w-full items-center gap-1 md:gap-2")}>
      <Button
        variant="text"
        fa={{
          icon: "fa-keyboard",
          fixedWidth: true,
        }}
        to="/"
        class={buttonClass()}
        dataset={{
          "data-nav-item": "test",
        }}
        onClick={() => {
          if (getRoutePage() === "test") void restartTest();
        }}
      />
      <Button
        variant="text"
        fa={{
          icon: "fa-graduation-cap",
          fixedWidth: true,
        }}
        dataset={{
          "data-nav-item": "exam",
        }}
        class={buttonClass()}
        to="/exam"
        balloon={{ text: "government exam simulator", position: "down" }}
      />
      <Button
        variant="text"
        fa={{
          icon: "fa-dumbbell",
          fixedWidth: true,
        }}
        dataset={{
          "data-nav-item": "trainer",
        }}
        class={buttonClass()}
        to="/trainer"
        balloon={{ text: "weak-key trainer", position: "down" }}
      />
      <Button
        variant="text"
        fa={{
          icon: "fa-cog",
          fixedWidth: true,
        }}
        to="/settings"
        class={buttonClass()}
        dataset={{
          "data-nav-item": "settings",
        }}
      />
      <div class="grow"></div>
    </nav>
  );
}
