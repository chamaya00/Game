# iOS scaffold (SwiftUI) — unverified

This directory contains a SwiftUI source scaffold for the iOS build described
in the GDD (section 8.1). **It has not been compiled or run** — this
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
