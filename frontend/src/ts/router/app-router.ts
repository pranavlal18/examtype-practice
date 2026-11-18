// The app's router instance: a no-op auth source (ExamType fork has no
// accounts), the router type registration, and app-only side effects
// (title, og:url, focus).

import * as AdController from "../controllers/ad-controller";
import { queryClient } from "../queries";
import { getRoutePage } from "../states/router";
import { setFocusMode } from "../states/test";
import type { PageName } from "./routes";
import { updateTitle } from "../utils/misc";
import { capitalizeFirstLetterOfEachWord } from "../utils/strings";
import { createRouterAuth } from "./create-router-auth";
import { createAppRouter } from "./create-router";
import { setRouter } from "./instance";
import type { AuthState } from "../states/core";

type UserDataLoadState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "loaded" }
  | { status: "failed"; error: unknown };

const loggedOut: AuthState = "signedOut";
const noLoad: UserDataLoadState = { status: "idle" };

const auth = createRouterAuth({
  isAvailable: () => false,
  authState: () => loggedOut,
  userDataLoadState: () => noLoad,
  reloadUserData: async () => undefined,
  signOut: () => {
    // nothing to sign out of in this fork
  },
});

export const router = createAppRouter({ queryClient, auth });

declare module "@tanstack/solid-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation needs an interface
  interface Register {
    router: typeof router;
  }
}

setRouter(router);

let isInitialLoad = true;
let prevPage: PageName = "loading";

router.subscribe("onResolved", () => {
  updateOpenGraphUrl();

  if (isInitialLoad) {
    isInitialLoad = false;
    document.body.classList.remove("loading");
  }

  const page = getRoutePage();
  if (page === prevPage) return;
  prevPage = page;

  updatePageTitle(page);
  setFocusMode(false);
  void AdController.reinstate();
});

function updatePageTitle(page: PageName): void {
  if (page === "test") {
    updateTitle();
  } else {
    updateTitle(`${capitalizeFirstLetterOfEachWord(page)} | ExamType`);
  }
}

function updateOpenGraphUrl(): void {
  let tag = document.querySelector('meta[property="og:url"]');
  if (tag === null) {
    tag = document.createElement("meta");
    tag.setAttribute("property", "og:url");
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", window.location.href);
}
