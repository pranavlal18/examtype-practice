import { createSignal, JSXElement, Show } from "solid-js";

import type { ExamOutcome, ExamSession } from "../../../exam/types";

import { recordExamOutcome } from "../../../exam/record-attempt";
import { ExamResult } from "./ExamResult";
import { ExamSetup } from "./ExamSetup";
import { ExamTest } from "./ExamTest";

type Phase = "setup" | "running" | "result";

/**
 * Government exam typing simulator (SSC CGL DEST / CHSL / RRB NTPC pattern).
 * State machine: setup -> running -> result. Everything happens client-side;
 * nothing is persisted — like the real exam hall.
 */
export function ExamPage(): JSXElement {
  const [phase, setPhase] = createSignal<Phase>("setup");
  const [session, setSession] = createSignal<ExamSession>();
  const [outcome, setOutcome] = createSignal<ExamOutcome>();

  const bothReady = () => {
    const s = session();
    const o = outcome();
    return s !== undefined && o !== undefined
      ? { session: s, outcome: o }
      : undefined;
  };

  return (
    <div class="content-grid grid w-full gap-4 py-4">
      <Show when={phase() === "setup"}>
        <ExamSetup
          onStart={(s) => {
            setSession(s);
            setOutcome(undefined);
            setPhase("running");
          }}
        />
      </Show>
      <Show when={phase() === "running" ? session() : undefined} keyed>
        {(s) => (
          <ExamTest
            session={s}
            onFinish={(o) => {
              recordExamOutcome(s, o);
              setOutcome(o);
              setPhase("result");
            }}
          />
        )}
      </Show>
      <Show when={phase() === "result" ? bothReady() : undefined} keyed>
        {(b) => (
          <ExamResult
            session={b.session}
            outcome={b.outcome}
            onRetry={() => setPhase("running")}
            onBackToSetup={() => setPhase("setup")}
          />
        )}
      </Show>
    </div>
  );
}
