# Meet & Greet

A psychological-horror visual novel. Chat with 5 strangers on an anonymous
friend-matching app — each conversation plays out in two rounds. Round 1 is
warm, ordinary small talk that ends well. Once all five finish Round 1, the
game reveals that wasn't the whole truth, and Round 2 continues the *same*
threads weeks later, forcing the player through the cruelty Round 1 quietly
suppressed. A True Ending after all five Round 2s reveals who — and what —
the player character actually is.

Full design in the project's GDD (not checked into this repo).

## Structure

- **`content/`** — the single shared source of truth:
  - `characters.json` — all 5 characters' full Round 1 + Round 2 + Bad Ending
    scripts, bilingual (`{vi, en}` per line).
  - `mystery.json` — the two shared lines (`the_line`, `the_question`) that
    must stay textually identical everywhere they're used, plus the True
    Ending's 3-scene content.
  - `ui-strings.json` — interface chrome text (buttons, labels, dialogs).
  - `design-tokens.json` — the Round 1 (mint/yellow) and Round 2 (dark)
    color palettes, fonts, spacing, and animation timings.
  Both the web and iOS builds are meant to read this same data — nothing
  duplicated per platform.
- **`web/`** — fully working React + Vite web app. This is the playable,
  tested build.
- **`ios/`** — a SwiftUI scaffold from an earlier version of this project
  ("MATCHED", a different dating-sim concept). **It predates the Meet &
  Greet pivot and does not implement this game** — see `ios/README.md`.

## Running the web app

```bash
cd web
npm install
npm run dev
```

Then open the printed local URL. Progress saves to `localStorage`. The five
chapters unlock strictly in order (Hạo → Diệp → Uyên → Khang → Nhiên) for
both rounds — the escalating glitches and the True Ending depend on that
fixed sequence, so chapters aren't freely choosable like a normal dating sim.

## Known simplifications vs. the full design doc

A few of the doc's more elaborate atmosphere details were adapted or
scoped down for a static web build with no backend/native APIs:

- **Push notifications** (section 9.7) aren't implemented — they'd need a
  service worker plus a server to trigger them while the app is closed.
- **Round 1 history "rewriting itself" on every scroll** (9.8) is
  implemented as a one-time reveal (a suppressed phantom line becomes
  visible once you've reached chapter 3+) rather than re-randomizing on
  every single scroll event.
- Timestamp anomalies (9.4) and the ghost-message/seen-status backdating
  (9.1/9.3) are implemented with simplified, deterministic rules rather
  than the full per-message logic implied by the doc.
