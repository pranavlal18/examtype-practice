import { applyEngineSettings } from "./anim";
import { loadFromLocalStorage } from "./config/lifecycle";
import { initConnection } from "./states/connection";
import { setAppReady, setVersion } from "./states/core";
import { isDevEnvironment } from "./utils/env";

/** App startup work that doesn't touch the DOM. Call once, right after render. */
export async function boot(): Promise<void> {
  // ExamType fork: no network calls on boot. Firebase/accounts are removed;
  // the service worker covers offline use. Offline banners were also removed.
  initConnection();

  applyEngineSettings();
  const configLoaded = loadFromLocalStorage();
  // keep setVersion inert but defined; the version button shows the fork's own version
  setVersion({ text: "examtype", isNew: false });

  await configLoaded;
  // no auth wait: the fork is permanently signed out

  setAppReady(true);

  registerServiceWorker();
}

function registerServiceWorker(): void {
  if (isDevEnvironment()) {
    void navigator.serviceWorker
      .getRegistrations()
      .then(function (registrations) {
        for (const registration of registrations) {
          void registration.unregister();
        }
      });
  } else {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js", { scope: "/" })
          .then((registration) => {
            console.log(
              "ServiceWorker registration successful with scope: ",
              registration.scope,
            );
          })
          .catch((error: unknown) => {
            console.error("ServiceWorker registration failed: ", error);
          });
      });
    }
  }
}
