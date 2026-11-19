// Vercel's Turborepo auto-preset builds the frontend and expects the
// output at repo-root `dist/` (ignoring vercel.json#outputDirectory and
// project settings). After `turbo run build`, mirror frontend/dist there
// so every preset finds it. Root `dist/` is gitignored.
import { cpSync, existsSync } from "node:fs";

if (!existsSync("frontend/dist/index.html")) {
  console.error("copy-dist: frontend/dist/index.html not found — did the build run?");
  process.exit(1);
}

cpSync("frontend/dist", "dist", { recursive: true });
console.log("copy-dist: frontend/dist -> dist/");
