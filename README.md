# Fold

A paper-folding puzzle game for iOS and Android. Fold a sheet of paper along
straight vertical/horizontal lines to reach a target shape (and, later, a
required stack order).

Design doc for all 50 planned levels: [docs/design/fold-levels.md](docs/design/fold-levels.md).

## Stack

- **Expo (React Native) + TypeScript** -- `App.tsx` / `src/`
- **`@shopify/react-native-skia`** -- renders the paper
- **`react-native-reanimated`** + **`react-native-gesture-handler`** -- drag-to-fold. The crease follows your finger (at half speed, so the paper's edge moves at finger speed) and the whole gesture runs on the UI thread
- **`vitest`** -- unit tests for the game engine (`src/core`), which has zero React Native dependencies and is tested standalone

## Project layout

```
src/
  core/            Renderer-agnostic game engine: grid, fold transform, goal
                    checking, BFS solver (hints). No RN imports -- pure
                    TypeScript, unit tested.
  data/levels/      Level definitions, one file per world.
  components/       Skia/RN rendering (PaperCanvas: drag-to-fold with a live
                    flap animation driven by Reanimated on the UI thread).
  screens/          HomeScreen (level select), GameScreen (play + solved flow).
  state/            Progress persistence (AsyncStorage) + star scoring.
  theme.ts          Colors/type/radii in one place.
docs/design/         Design docs (level list, rationale).
```

## Running

```
npm install
npm start        # then scan the QR code with Expo Go on your phone
npm run web       # requires `npx expo install react-dom react-native-web` first
```

There's no local Xcode/Android Studio setup assumed -- Expo Go on a physical
device is the fastest inner loop here.

## Sharing a build with other people

The app uses no custom native code, so there are two routes. Both need a free
Expo account, and the first one needs nothing else.

The npm package is **`eas-cli`** (it installs a binary called `eas`), so
`npx eas ...` fails with "could not determine executable to run". Either use
the package name each time, or install it once:

```
npm install -g eas-cli   # then just: eas login, eas build, ...
# or, without installing:
npx eas-cli@latest login
```

**1. Expo Go + EAS Update** -- no build, seconds to publish, testers need the
Expo Go app:

```
npx eas-cli update --branch preview --message "what changed"
```

Share the resulting link. Testers open it in Expo Go. Free, but only works
for people willing to install Expo Go, and their Expo Go version has to match
the SDK (57).

**2. EAS Build** -- real installable apps:

```
npx eas-cli init                              # once: links the project
npx eas-cli build -p android --profile preview   # -> APK
npx eas-cli build -p ios     --profile preview   # -> ad hoc IPA
```

`preview` is configured for internal distribution in `eas.json`, so Android
comes out as a directly installable **APK** rather than a Play Store bundle.

**Where it's hosted: EAS hosts it for you.** Each finished build gets a
shareable URL and QR code on expo.dev -- anyone with the link can install it.
No hosting to arrange. If you'd rather self-host, the APK is just a file:
GitHub Releases, Firebase App Distribution, or any static host works.

**Android** is easy: the APK installs on any device once the tester allows
"install from unknown sources". No account beyond Expo, no device registry.

## Getting it onto other people's iPhones

Unlike Android, there is **no free route** to a standalone app on a physical
iPhone. Everything below needs the **Apple Developer Program, $99/year**
(developer.apple.com/programs). Enrolment involves an identity check and can
take a day or two, so start it before you need it.

Before paying, confirm the game actually works on iOS using Expo Go -- that
needs no account at all. Only then pick one of these.

### Route A -- TestFlight (recommended past two or three testers)

Testers install Apple's TestFlight app and accept an email invite. No device
IDs to collect, and they get every later build automatically.

```
npx eas-cli build -p ios --profile production
npx eas-cli submit -p ios --latest
```

Then in App Store Connect -> TestFlight, add tester emails. EAS creates the
certificates and provisioning for you; it will ask for your Apple ID during
the build.

Things that surprise people:
- An **App Store Connect app record** is required even though you are not
  publishing. `eas submit` can create it.
- **External testers trigger a Beta App Review** on the first build. It is
  much lighter than a full App Store review, usually a day, but it exists.
  Internal testers (people added to your App Store Connect team) skip it.
- **Builds expire after 90 days.**

### Route B -- ad hoc (fastest for one or two devices)

No review, no App Store Connect record -- but every device must be
registered by its UDID *before* the build.

```
npx eas-cli device:create        # produces a link/QR for each tester's iPhone
npx eas-cli build -p ios --profile preview
```

Each tester opens the registration link on their iPhone, installs a small
profile, and their UDID is added. Then they install the finished build from
its EAS URL. The catch: **a device registered after the build cannot install
it** -- adding a tester means rebuilding. Limit is 100 devices per year, and
that count resets only at renewal.

### Route C -- iOS Simulator, free but Mac-only

No Apple account, but needs full Xcode installed (a ~10GB App Store
download; Command Line Tools alone are not enough). Useful only if no real
iPhone is available.

```
npx eas-cli build -p ios --profile preview-simulator
```

For the stores later, `--profile production` produces an Android App Bundle
and a store-signed iOS build, then `npx eas-cli submit`.

## Testing

```
npm test          # engine unit tests + every level solved by the solver
npm run test:watch
```

The level tests are worth knowing about. `levels-solvability.test.ts` searches
each of the 50 levels for its shortest solution and asserts it matches the
authored `expectedFolds`, and `levels-difficulty.test.ts` fails any level that
cannot be lost (see `src/core/analysis.ts`) -- so the level *data* is verified,
not just the engine.

Authoring tools live in `scripts/`:

```
npx tsx scripts/calibrate.ts        # true minimum folds for every level
npx tsx scripts/analyze.ts          # difficulty report (trap rates, lengths)
npx tsx scripts/discover.ts <shape> # reachable goal shapes for a sheet
npx tsx scripts/longpuzzles.ts      # goals with the longest solutions
npx tsx scripts/upgrade.ts <id>     # harder goals for an existing level
npx tsx scripts/hardest.ts <id>     # pin placements that force longer routes
npx tsx scripts/pinvariants.ts <id> # what each pin position does to a level
```
