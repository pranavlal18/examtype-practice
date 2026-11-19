# Deploy ExamType Practice on Vercel

## Blocking steps you must do first

1. Create a public GitHub repository named `pranavlal18/examtype-practice`.
2. Push this fork to that repository.
3. Confirm the footer **Source code** link opens an issue form / issue tracker on `pranavlal18/examtype-practice`.
4. Do **not** deploy until the public source link is real; the footer’s GPL source-offer text must not point at a private or non-existent repo.

## Vercel

- Node.js: use the version in `package.json` `engines` — `>=24 <25`; Vercel project settings should not override this
- Package manager: use `pnpm` as pinned in `package.json` `packageManager`

- Import GitHub repository `pranavlal18/examtype-practice`
- Framework Preset: **Other / Vite**
- Install Command: `pnpm install`
- Build Command: `pnpm build-fe`
- Output Directory: `frontend/dist`
- Environment variables: **none**
- SPA rewrite is already in `vercel.json`; `/exam` must load directly

## Post-deploy checks

- `/` and `/exam` load
- Footer **Source code** link works
- `privacy-policy.html`, `security-policy.html`, and `terms-of-service.html` load and contain no Monkeytype, Google, MongoDB, advertisement, analytics or `monkeytype.com` text
- `manifest.json` name is `ExamType Practice` and icons are the new assets
- Devtools **Network** shows no requests to `monkeytype.com`, `google.com`, `discord.gg`, `ko-fi.com`, `patreon.com` or `sentry.io`
- Source-code/GPL wording is visible in the footer on every page
- The site displays independent/non-affiliation wording for SSC/RRB/Indian Railways/Government of India/Monkeytype

## Domain

Use the default `*.vercel.app` domain unless you own a custom domain. If you later buy one, update README links and any OG/Twitter URLs explicitly; do **not** ship a guessed domain in the repo.

## Rollback

- In Vercel, promote a previous successful deployment.
- Or redeploy the last known-good commit from the Git repository.

## Legal posture

This is a free, static, GPL-3.0 fork. The name and branding have not been legally cleared. Keep the non-affiliation notices in place and get competent legal review before any commercialization, app-store submission, or official-looking distribution.
