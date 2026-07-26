# Meet&Date — "MATCHED"

A psychological-horror visual novel dating sim. Match with 8 people (16
character variants across "thích nam" / "thích nữ" / "cả hai"), each with a
branching 2-choice conversation and a good/bad ending — and an underlying
mystery that ties all 8 together. Full design in the project's GDD.

## Structure

- **`content/`** — the single shared source of truth: `roles.json` (all 8
  roles, full scripts, choices, endings, epilogues) and `design-tokens.json`
  (colors, fonts, radii). Both the web and iOS builds read this same data —
  nothing is duplicated per platform.
- **`web/`** — fully working React + Vite web app. This is the playable,
  tested build.
- **`ios/`** — SwiftUI source scaffold reading the same `content/` JSON.
  **Unverified** — this repo was developed in a Linux environment with no
  Xcode/macOS available, so the Swift code has not been compiled. See
  `ios/README.md` for setup steps.

## Running the web app

```bash
cd web
npm install
npm run dev
```

Then open the printed local URL. Progress is saved to `localStorage`;
replaying a completed match is allowed and simply overwrites its ending.