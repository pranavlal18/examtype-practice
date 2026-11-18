// ExamType fork — intentionally committed with EMPTY values.
//
// Firebase is not used by this fork at runtime: the site boots signed out and
// all exam stats stay in the browser. This file exists only so `src/ts/firebase.ts`
// can statically import it and Vite can build (dev and prod alike). Empty strings
// make `initializeApp` throw on boot; upstream catches the failure and starts
// the app signed out, which is the intended zero-backend path.
//
// Do NOT put real Firebase keys in this file (it is committed). If you ever wire
// accounts back in, put real config in `firebase-config-live.ts` instead (gitignored),
// and revert the resolve.alias hunk in `vite.config.ts`.

export const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};
