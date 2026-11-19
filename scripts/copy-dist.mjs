// Vercel's Turborepo auto-preset builds the frontend app directly and
// expects the output at repo-root `dist/`, ignoring vercel.json's
// outputDirectory and the root postbuild when the cwd is frontend/.
// Mirror frontend/dist -> dist/ regardless of the caller's cwd.
// Root dist/ is gitignored.
import { cpSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const from = join(repoRoot, "frontend", "dist");
const to = join(repoRoot, "dist");

if (!existsSync(join(from, "index.html"))) {
  console.error(
    `copy-dist: ${join(from, "index.html")} not found — did the build run?`,
  );
  process.exit(1);
}

cpSync(from, to, { recursive: true });
console.log("copy-dist: frontend/dist -> dist/");
