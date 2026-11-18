import { applyEngineSettings } from "./anim";
import { loadFromLocalStorage } from "./config/lifecycle";
import { authPromise, initFirebase } from "./firebase";
import { initConnection } from "./states/connection";
import { setAppReady, setVersion } from "./states/core";
import { isDevEnvironment } from "./utils/env";

/** App startup work that doesn't touch the DOM. Call once, right after render. */
export async function boot(): Promise<void> {
  // ExamType fork: no network calls on boot. Firebase resolves the auth
  // promise to signed-out (the fork never signs in); the service worker
  // covers offline use. Any "backend not running"/"firebase failed" banners
  // players used to see are gone with the analytics PSA plumbing.
  initConnection();

  applyEngineSettings();
  const configLoaded = loadFromLocalStorage();
  // keep setVersion inert but defined; the version button shows the fork's own version
  setVersion("examtype");

  void initFirebase();

  await configLoaded;
  await authPromise;

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
