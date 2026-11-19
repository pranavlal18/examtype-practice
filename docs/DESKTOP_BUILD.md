# Desktop app (Tauri)

ExamType Practice ships a thin Tauri (Rust) wrapper around the static frontend:
same app, same build, native window, offline by default.

## Layout

- `src-tauri/` at the repo root. No app logic lives here — it only wraps `frontend/dist`.
- `src-tauri/tauri.conf.json`: productName `ExamType Practice`, dark window (`#323437`),
  `frontendDist` → `../frontend/dist`, `beforeBuildCommand` → `pnpm build-fe`.
- `src-tauri/icons/` — generated from `frontend/static/images/favicon/favicon.svg`
  (`pnpm tauri icon frontend/static/images/favicon/favicon.svg -o src-tauri/icons`).
- Build output: `src-tauri/target/release/bundle/nsis/*.exe` (installer) and
  `src-tauri/target/release/examtype-practice.exe` (raw binary).
- `src-tauri/target/` and `src-tauri/gen/` are gitignored.

## Build

Prerequisites (already on this machine): Rust stable + MSVC Build Tools, Node, pnpm, WebView2 runtime.

```powershell
pnpm tauri build
```

This runs `beforeBuildCommand` (`pnpm build-fe`), then compiles the Rust shell and produces the installer in `src-tauri/target/release/bundle/nsis/`.

## Security / signing

The installer is unsigned. On first run Windows SmartScreen shows "Windows protected your PC" → **More info → Run anyway**. Signing requires a code-signing certificate; not needed for private use.

## Moving data between browser and desktop

localStorage/profile data does not carry over between the web app and the desktop app (different webview profiles).

- Exam history: open the **Exam** page → **Export** (`examtype-history.json`), then in the app → Exam page → **Import**.
- Settings: Settings → **Import**/**Export** → paste the JSON between the two.

## Notes

- No updater in v1: to update, rebuild and reinstall.
- The web version always reflects the latest master; the desktop binary is a snapshot.
