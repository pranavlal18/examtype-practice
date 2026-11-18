/** Shared shapes for the government exam typing simulator. */

/** a scheduled key event captured during a test (for weak-key analytics) */
export type KeystrokeLogEntry = {
  /** ms since test start */
  t: number;
  /** raw KeyboardEvent.key, e.g. "a", "Backspace", "F2" */
  key: string;
  /** ms since the previous keydown, null for the first */
  latencyMs: number | null;
  /** false when the inserted char did not match the expected passage char */
  correct: boolean | null;
};

/** a configured exam run, created from the setup screen */
export type ExamSession = {
  /** passage title (or "Custom text") */
  title: string;
  passageText: string;
  /** chosen duration in minutes (5, 10, 15 for the exam; 1 for the drill) */
  durationMinutes: number;
  /** when true, the textarea blocks the backspace key entirely (discipline drill) */
  backspaceDisabled: boolean;
  /** "exam" (default) or "trainer" — controls the header chrome and history kind */
  kind?: "exam" | "trainer";
};

/** what the user ended the test with */
export type ExamOutcome = {
  typedText: string;
  /** every key pressed that produced or attempted input */
  keyDepressions: number;
  /** seconds the test actually ran for */
  elapsedSeconds: number;
  completedBy: "submit" | "time";
  /** captured keystroke log for weak-key analytics */
  keystrokes: KeystrokeLogEntry[];
};
