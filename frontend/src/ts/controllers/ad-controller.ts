// ExamType Practice ships as a static, no-ads build. Keep the exported
// names used by the app, but make every entry point a no-op so no ad
// network is contacted and no upstream ad code is bundled.
export async function reinstate(): Promise<boolean> {
  return false;
}

export async function checkAdblock(): Promise<void> {
  return undefined;
}

export async function checkCookieblocker(): Promise<void> {
  return undefined;
}

export function destroyResult(): void {
  // no-op
}

export function renderResult(): void {
  // no-op
}
