// The route tree: every page with its guards and loaders

import {
  createRootRouteWithContext,
  createRoute,
} from "@tanstack/solid-router";

import { PageSwitcher } from "../components/core/PageSwitcher";
import { createRouterPage } from "../components/core/Page";
import { ExamPage } from "../components/pages/exam/ExamPage";
import { TrainerPage } from "../components/pages/trainer/TrainerPage";
import { SettingsPage } from "../components/pages/settings/SettingsPage";
import { TestPage } from "../components/pages/test/TestPage";
import { SettingsSearchSchema } from "../states/settings-highlight";
import { type LoadingStep } from "./loading-bar";

// NOTE: whenever adding a route add the pathname to the `firebase.json`
// rewrite rule

/** A page of the site, rendered by its route (see `staticData.page`). */
export type PageName =
  | "loading"
  | "test"
  | "settings"
  | "404"
  | "exam"
  | "trainer";

declare module "@tanstack/solid-router" {
  // oxlint-disable-next-line typescript/consistent-type-definitions -- module augmentation needs an interface
  interface StaticDataRouteOption {
    /** The page the route renders (its component is a `createRouterPage`). */
    page?: PageName;
    /** The route's loading step: its loader runs it with runRouteLoadingStep */
    loadingPage?: RouteLoadingStep;
  }
}

/**
 * A route's loading step, set in its `staticData.loadingPage`: its bar setup
 * and whether it has to run right now. Labelled after the route's page.
 */
type RouteLoadingStep = Omit<LoadingStep, "label"> & {
  /** Read when the navigation starts (to plan the bar) and again when the step runs. */
  isNeeded: () => boolean;
};

/** Router context: guards and loaders read these instead of module globals. */
export type RouterContext = {
  queryClient: import("@tanstack/solid-query").QueryClient;
  auth: import("./create-router-auth").RouterAuth;
};

const root = createRootRouteWithContext<RouterContext>()({
  component: PageSwitcher,
});

// pathless layout so every page waits for the app's early setup
const userDataRoute = createRoute({
  getParentRoute: () => root,
  id: "userData",
  // explicit return type: inferring it would make the route tree's type
  // depend on itself through `matches` (TS7022)
  beforeLoad: async (): Promise<void> => {
    // ExamType fork: no accounts, no user-data download, no loading bar
  },
});

const test = createRoute({
  getParentRoute: () => userDataRoute,
  path: "/",
  staticData: { page: "test" },
  component: createRouterPage(TestPage),
});

const settings = createRoute({
  getParentRoute: () => userDataRoute,
  path: "/settings",
  staticData: { page: "settings" },
  component: createRouterPage(SettingsPage),
  validateSearch: SettingsSearchSchema,
});

const exam = createRoute({
  getParentRoute: () => userDataRoute,
  path: "/exam",
  staticData: { page: "exam" },
  component: createRouterPage(ExamPage),
});

const trainer = createRoute({
  getParentRoute: () => userDataRoute,
  path: "/trainer",
  staticData: { page: "trainer" },
  component: createRouterPage(TrainerPage),
});

export const routeTree = root.addChildren([
  userDataRoute.addChildren([test, settings, exam, trainer]),
]);
