import { JSXElement } from "solid-js";

import { AnimatedModal } from "../common/AnimatedModal";
import { Button } from "../common/Button";

export function ContactModal(): JSXElement {
  return (
    <AnimatedModal id="Contact" modalClass="max-w-4xl" title="Contact">
      <div>
        Feedback, bug reports, and questions are tracked as GitHub issues.
        <br />
        <br />
        Please do not include private account data or personal information in an
        issue. ExamType Practice is a free, static practice tool and is not
        affiliated with any exam conducting body.
      </div>
      <div class="mt-4 grid gap-4">
        <Button
          variant="button"
          href="https://github.com/pranavlal18/examtype-practice/issues"
          text="Open a GitHub issue"
          class="text-md justify-start gap-4 p-4 text-lg"
          fa={{
            icon: "fa-github",
            variant: "brand",
            fixedWidth: true,
          }}
        />
      </div>
    </AnimatedModal>
  );
}
