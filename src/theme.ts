/**
 * Fold's visual language, in one place.
 *
 * Direction: dark stage, pale paper. The paper is the hero -- everything else
 * stays low-contrast so the fold carries the screen.
 *
 * Colour is not decoration here, it is the depth readout. A single sheet is
 * barely tinted; every layer folded on top saturates and darkens it, so a
 * six-deep stack is unmistakable at a glance. Each world drives that ramp
 * from its own hue, which gives the world an identity without ever resorting
 * to a neon palette.
 */
export const theme = {
  colors: {
    // Neutral stage, used before a world is known (home screen chrome).
    bg: '#12151d',
    bgRaised: '#1a1f2b',
    bgOverlay: 'rgba(9, 11, 16, 0.72)',

    ink: '#f2ede3',
    inkSoft: '#9aa3b5',
    inkFaint: '#5a6375',

    paperShadow: 'rgba(0, 0, 0, 0.35)',

    accent: '#ff6d4d',
    accentSoft: 'rgba(255, 109, 77, 0.16)',
    gold: '#ffc247', // stars stay gold everywhere, so progress reads consistently
    success: '#4cd07d',
    danger: '#ff5c69',
    locked: '#2a3040',
  },
  radius: {
    cell: 7,
    card: 20,
    pill: 999,
  },
  font: {
    title: 30,
    heading: 22,
    body: 15,
    small: 13,
    tiny: 11,
  },
} as const;

// --- world palettes -------------------------------------------------------

/**
 * Hue per chapter, generated rather than listed. A fixed table ran out the
 * moment the curriculum grew past ten chapters, and every chapter after that
 * silently fell back to the first one's colour -- four identical-looking
 * worlds on the map.
 *
 * The golden angle spreads any number of chapters around the wheel while
 * keeping ADJACENT ones far apart, which is what matters here: chapters are
 * seen next to each other on the level select, never all at once.
 */
const GOLDEN_ANGLE = 137.508;
const FIRST_HUE = 42; // sand, for chapter one

function hueForWorld(world: number): number {
  return (FIRST_HUE + (world - 1) * GOLDEN_ANGLE) % 360;
}

const DEPTH_STEPS = 7;

function hsl(h: number, s: number, l: number): string {
  const sat = s / 100;
  const lig = l / 100;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n: number) => {
    const k = (n + ((h % 360) + 360) / 30) % 12;
    const c = lig - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface WorldPalette {
  hue: number;
  /** Front-face paper by stack depth (index = depth - 1). */
  paper: string[];
  /** Back-face paper on two-sided levels: the world's colour, so a flip is
   * unmistakable. */
  paperDown: string[];
  /**
   * Back-face paper everywhere else: barely distinguishable from the front.
   * On levels whose goal says nothing about faces, a flipped cell carries no
   * meaning, and painting it bright would both invent a signal that is not
   * there and fight the depth readout, which is what the lightness ramp is
   * for.
   */
  paperDownMuted: string[];
  /** Crease lines, keyed off the world hue so they sit in the paper. */
  crease: string;
  /**
   * The world's own colour, for anything that says "this world" or "this is
   * the target": goal preview, chips, buttons. Deliberately NOT the
   * complement -- a yellow world showing a blue goal shape reads as a
   * different world entirely.
   */
  tint: string;
  tintSoft: string;
  /** Saturated world hue for marks drawn ON the paper (the goal cells in the
   * anchored worlds), where the pale ramp needs something darker to read. */
  tintDeep: string;
  /**
   * Complementary hue, reserved for live fold indicators drawn over the
   * paper -- crease, drop line, hint. These have to stay legible against
   * whatever the paper is doing, and keeping them distinct from the world
   * colour also separates "what you are doing" from "what you are aiming at".
   */
  accent: string;
  accentSoft: string;
  /** Stage, tinted a few percent toward the hue so the world reads before
   * a single fold has been made. */
  bg: string;
  bgRaised: string;
}

function buildPalette(hue: number): WorldPalette {
  const paper: string[] = [];
  const paperDown: string[] = [];
  const paperDownMuted: string[] = [];
  for (let i = 0; i < DEPTH_STEPS; i++) {
    const t = i / (DEPTH_STEPS - 1);
    // One sheet is near-white with a hint of colour; each layer pushes
    // saturation up and lightness down. Both curves are front-loaded
    // (t^0.65): with a linear ramp the second and third layers -- the ones
    // players actually see most -- were still reading as plain grey.
    const k = Math.pow(t, 0.65);
    // Two-sided sheet: the FRONT is pale and the BACK carries the world's
    // colour, like real origami paper. Saturation says which face you are
    // looking at, lightness says how many layers are stacked there, so the
    // two readouts stay independent.
    paper.push(hsl(hue, 14 + k * 34, 96 - k * 40));
    paperDown.push(hsl(hue, 58 + k * 24, 63 - k * 26));
    paperDownMuted.push(hsl(hue, (14 + k * 34) * 0.5, 92 - k * 38));
  }
  const comp = (hue + 180) % 360;
  return {
    hue,
    paper,
    paperDown,
    paperDownMuted,
    crease: `hsla(${hue}, 45%, 25%, 0.18)`,
    tint: hsl(hue, 62, 60),
    tintSoft: `hsla(${hue}, 62%, 60%, 0.18)`,
    tintDeep: hsl(hue, 70, 42),
    // Muted rather than neon: saturation stays in the 60s, which still reads
    // clearly against any paper tint without glowing off the screen.
    accent: hsl(comp, 64, 62),
    accentSoft: `hsla(${comp}, 64%, 62%, 0.18)`,
    bg: hsl(hue, 16, 9),
    bgRaised: hsl(hue, 15, 15),
  };
}

const paletteCache = new Map<number, WorldPalette>();

/** Palette for a world, memoised -- these are pure functions of the hue and
 * get asked for on every render. */
export function worldPalette(world: number): WorldPalette {
  const cached = paletteCache.get(world);
  if (cached) return cached;
  const built = buildPalette(hueForWorld(world));
  paletteCache.set(world, built);
  return built;
}

/**
 * Paper fill for a stack of the given depth (1-based) and top-face state.
 * `twoSided` is on only for levels whose goal constrains faces; elsewhere a
 * flipped cell stays near-white, because there the flip means nothing.
 */
export function paperColor(
  palette: WorldPalette,
  depth: number,
  faceUp: boolean,
  twoSided: boolean
): string {
  const ramp = faceUp ? palette.paper : twoSided ? palette.paperDown : palette.paperDownMuted;
  return ramp[Math.min(Math.max(depth, 1), ramp.length) - 1];
}
