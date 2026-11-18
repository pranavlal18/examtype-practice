/**
 * ExamType fork: Firebase is fully stubbed out. No network calls, no auth,
 * no analytics, no gating on build-time env. Same exported API as upstream
 * (`authPromise`, `initFirebase`, auth helpers) so callers keep compiling;
 * everything resolves as "signed out", which is the honest state of a fork
 * with no account system.
 */

export type AnalyticsType = import("firebase/analytics").Analytics;

export const authPromise: Promise<void> = Promise.resolve();

export async function initFirebase(): Promise<void> {
  // throwaway: resolve immediately; callers already wait on authPromise
}

export async function getAnalytics(): Promise<AnalyticsType | undefined> {
  // no analytics service: always unavailable
  return undefined;
}

export function isAuthAvailable(): boolean {
  return false;
}

export function getAuthenticatedUser(): import("firebase/auth").User | null {
  return null;
}

export function finishSignUp(): void {
  // no-op
}

export async function cancelSignUp(): Promise<void> {
  // no-op
}

export async function signOut(): Promise<void> {
  // no-op
}

export async function getIdToken(): Promise<null> {
  return null;
}

export async function signInWithEmailAndPassword(): Promise<never> {
  throw new Error("Accounts are disabled in ExamType (offline fork).");
}

export async function signInWithPopup(): Promise<never> {
  throw new Error("Accounts are disabled in ExamType (offline fork).");
}

export async function createUserWithEmailAndPassword(): Promise<never> {
  throw new Error("Accounts are disabled in ExamType (offline fork).");
}
