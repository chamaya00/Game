# iOS scaffold (SwiftUI) — unverified, and now stale

> **This scaffold implements "MATCHED"**, an earlier, different game concept
> (8 dating-sim characters, gender variants, good/bad endings by choice).
> The project has since pivoted to **"Meet & Greet"** — 5 fixed characters,
> a two-round "phantom option" mechanic, and a True Ending — which is what
> `web/` now implements. **This Swift code does not reflect that game.**
> It's kept here as a reference for the SwiftUI project-structure pattern
> (content loading, a Codable bilingual schema, a beat-based chat engine)
> but would need a full content/logic rewrite to match `content/characters.json`
> and `content/mystery.json` before it's useful for Meet & Greet. Rebuilding
> it wasn't attempted alongside the web rewrite given the scope of both
> changes together.

This directory contains a SwiftUI source scaffold for the *original* iOS
build described in an earlier GDD. **It has not been compiled or run** — this
environment is Linux with no Xcode/macOS toolchain available, so there was no
way to verify the Swift code builds. Treat it as a structured starting point,
not a finished, tested app (unlike `web/`, which is fully working and was
tested in-browser).

## What's here

- `Matched/Models/ContentModels.swift` — Codable types mirroring the shared
  JSON schema in `/content/roles.json` (same shape as `web/src/types.ts`).
- `Matched/Models/ContentLoader.swift` — loads `roles.json` /
  `design-tokens.json` from the app bundle.
- `Matched/Models/GameState.swift` — orientation, save data (UserDefaults),
  profile-list building with the "both" orientation's role-dedup rule
  (GDD section 2.0).
- `Matched/ViewModels/ChatViewModel.swift` — walks a role's beat list the
  same way `web/src/screens/Chat.tsx` does (typing delays, flavor/midpoint/
  final choices, `message_recalled` / `glitch_subtle` effects).
- `Matched/Views/*.swift` — Splash, orientation picker, match list, chat,
  ending, epilogue screens, plus a `Palette` mirroring the design tokens'
  colors.

## Setting up the actual Xcode project

No `.xcodeproj` is checked in, because generating one by hand outside Xcode
is easy to get subtly wrong (and impossible to validate without Xcode
itself). To turn this into a buildable app:

1. In Xcode: **File → New → Project → iOS → App**, SwiftUI interface, name it
   `Matched`, and point it at this `ios/` directory (or create it fresh and
   drag the `Matched/` folder's files in).
2. Run `Scripts/sync-content.sh` once (or add it as a **Run Script** build
   phase) to copy `/content/roles.json` and `/content/design-tokens.json`
   into `Matched/Resources/`, and make sure that folder is added to the
   target as a **folder reference** (blue folder, not a group) so both
   `.json` files are bundled as resources.
3. Build and fix whatever the compiler flags — this scaffold was written
   carefully but not compiler-checked.
4. Deployment target iOS 16+ is assumed (uses `NavigationStack`-free manual
   screen switching, `.confirmationDialog`, etc. — all iOS 15/16 APIs).

## Known gaps vs. the web build

- No audio (background music / SFX per GDD section 12) — no assets exist yet
  (see GDD 12.5's open question), and this scaffold doesn't stub the
  `AVAudioUnitTimePitch` pitch-shift behavior from section 12.3b.
- Avatars are plain colored-circle-with-initial placeholders, matching the
  web build's placeholder-art decision — swap in real character art per
  section 11 later.
- **No language toggle UI.** The content models now decode the bilingual
  `{vi, en}` shape (`LocalizedText` in `Models/ContentModels.swift`) and
  every view renders through `.text(lang:)` / `.rendered(lang:name:)`, but
  `lang` is hardcoded to `.vi` throughout (`ChatViewModel`, `EndingView`,
  `EpilogueView`, `MatchListView`) — there's no SwiftUI control to switch it
  at runtime yet, unlike the web build's `LangToggle` button on every screen.
  Threading a `@State var lang` down from `ContentView` and adding a toggle
  button per screen would mirror `web/src/App.tsx` + `LangToggle.tsx`.
- The "true ending" epilogue (exactly 8/8 bad endings, `epilogues.trueEnding`
  in the content JSON) is wired into `GameState.selectedEpilogue()`, matching
  the web build's logic in `web/src/screens/Epilogue.tsx`.
