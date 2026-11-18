import type { Analytics as AnalyticsType } from "firebase/analytics";

import { getAnalytics } from "../firebase";
import { createErrorMessage } from "../utils/error";

let analytics: AnalyticsType | undefined;

/**
 * Fire-and-forget event log. No-op until analytics is activated (and silent
 * when a browser blocks firebase/analytics entirely — the common case with
 * ad/privacy blockers, and the expected state for this zero-backend fork).
 */
export async function log(
  eventName: string,
  params?: Record<string, string>,
): Promise<void> {
  if (analytics === undefined) return;
  try {
    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, eventName, params);
  } catch {
    console.log("Analytics unavailable");
  }
}

/** Opt-in only (see cookies.ts). Never blocks boot; never fails loudly. */
export async function activateAnalytics(): Promise<void> {
  if (analytics !== undefined) {
    console.warn("Analytics already activated");
    return;
  }
  try {
    const instance = await getAnalytics();
    if (instance === undefined) return;
    const { setAnalyticsCollectionEnabled } =
      await import("firebase/analytics");
    // NB: the upstream fork fires events into Monkeytype's GA property —
    // deliberately dropped here. Collection stays local/disabled unless a
    // maintainer wires their own property in explicitly.
    setAnalyticsCollectionEnabled(instance, true);
    analytics = instance;
    console.log("Analytics activated");
  } catch (e) {
    console.error(createErrorMessage(e, "Failed to activate analytics"));
  }
}
