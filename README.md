# Fold

A paper-folding puzzle game for iOS and Android. Fold a sheet of paper along
straight vertical/horizontal lines to reach a target shape (and, later, a
required stack order).

Design doc for all 50 planned levels: [docs/design/fold-levels.md](docs/design/fold-levels.md).

## Stack

- **Expo (React Native) + TypeScript** -- `App.tsx` / `src/`
- **`@shopify/react-native-skia`** -- renders the paper
- **`react-native-reanimated`** + **`react-native-gesture-handler`** -- fold animation and interaction (gesture-driven folding is still a follow-up; the current UI uses tap-to-select-line, tap-to-pick-direction)
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
device is the fastest inner loop here. `npx eas build` (cloud) is the path to
real App Store / Play Store binaries when that's needed.

## Testing

```
npm test          # runs the core engine's unit + solvability tests once
npm run test:watch
```

`src/core/__tests__/world1-solvability.test.ts` is worth knowing about: it
brute-force searches each World 1 level for its shortest solution and asserts
it matches the level's `expectedFolds`, so it doubles as a check on the level
data itself, not just the engine.
