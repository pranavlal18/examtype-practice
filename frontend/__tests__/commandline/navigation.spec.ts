import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/solid-router";
import { beforeEach, describe, expect, it, vi } from "vitest";

import navigationCommands from "../../src/ts/commandline/lists/navigation";
import type { Command } from "../../src/ts/commandline/types";
import { getRouter, setRouter } from "../../src/ts/router/instance";

// stands in for the app's route tree, which needs auth and page data to load
function createTestRouter(): ReturnType<typeof createRouter> {
  const root = createRootRoute();
  const paths = ["/", "/settings", "/exam", "/trainer"];
  return createRouter({
    routeTree: root.addChildren(
      paths.map((path) => createRoute({ getParentRoute: () => root, path })),
    ),
    history: createMemoryHistory({ initialEntries: ["/settings"] }),
  });
}

let router: ReturnType<typeof createTestRouter>;

function command(id: string): Command {
  const found = navigationCommands.find((it) => it.id === id);
  if (found === undefined) throw new Error(`no command ${id}`);
  return found;
}

async function execAndGetHref(id: string, href: string): Promise<string> {
  command(id).exec?.({});
  // commands start the navigation without awaiting it
  await vi.waitFor(() => {
    expect(router.state.location.href).toBe(href);
  });
  return router.state.location.href;
}

describe("commandline navigation", () => {
  beforeEach(async () => {
    router = createTestRouter();
    await router.load();
    setRouter(router as never);
  });

  it.each([
    ["viewTypingPage", "/"],
    ["viewExam", "/exam"],
    ["viewTrainer", "/trainer"],
    ["viewSettings", "/settings"],
  ])("%s opens %s", async (id, href) => {
    expect(await execAndGetHref(id, href)).toBe(href);
  });
});

// type checked only - a broken internal link fails the type check
export function brokenLinksDoNotTypeCheck(): void {
  const appRouter = getRouter();
  // @ts-expect-error -- not a route
  void appRouter?.navigate({ to: "/not-a-route" });
}
