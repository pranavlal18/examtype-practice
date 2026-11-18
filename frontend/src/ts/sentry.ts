/**
 * ExamType fork: Sentry is disabled and stubbed out. Same exported API as
 * upstream so call sites (error reporting, sentry debug toggles, tag wiring)
 * keep compiling and running — everything is a silent no-op.
 */
export async function activateSentry(): Promise<void> {
  console.log("Sentry is disabled in ExamType — nothing to activate.");
}

export async function setUser(_uid: string, _name: string): Promise<void> {
  // no-op
}

export async function clearUser(): Promise<void> {
  // no-op
}

export async function captureException(_error: Error): Promise<void> {
  // no-op
}

export function toggleDebug(): void {
  console.log("Sentry is disabled in ExamType — nothing to toggle.");
}
