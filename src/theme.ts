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

/** Base hue per world. Spread around the wheel and deliberately not tied to
 * the old fixed coral, since each world now supplies its own indicator. */
const WORLD_HUES: Record<number, number> = {
  1: 42, // sand
  2: 12, // terracotta
  3: 340, // rose
  4: 300, // orchid
  5: 265, // violet
  6: 222, // indigo
  7: 194, // sky
  8: 168, // teal
  9: 96, // moss
  10: 62, // olive
};

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
  /** Back-face paper: same ramp desaturated, so a flip is visible. */
  paperDown: string[];
  /** Crease lines, keyed off the world hue so they sit in the paper. */
  crease: string;
  /** Complementary hue: goal tint, crease preview, drop line, hints. Chosen
   * opposite the paper so it never disappears into whatever the world is. */
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
  for (let i = 0; i < DEPTH_STEPS; i++) {
    const t = i / (DEPTH_STEPS - 1);
    // One sheet is near-white with a hint of colour; each layer pushes
    // saturation up and lightness down. Both curves are front-loaded
    // (t^0.65): with a linear ramp the second and third layers -- the ones
    // players actually see most -- were still reading as plain grey.
    const k = Math.pow(t, 0.65);
    paper.push(hsl(hue, 14 + k * 46, 96 - k * 46));
    paperDown.push(hsl(hue, (14 + k * 46) * 0.4, 91 - k * 44));
  }
  const comp = (hue + 180) % 360;
  return {
    hue,
    paper,
    paperDown,
    crease: `hsla(${hue}, 45%, 25%, 0.18)`,
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
  const built = buildPalette(WORLD_HUES[world] ?? WORLD_HUES[1]);
  paletteCache.set(world, built);
  return built;
}

/** Paper fill for a stack of the given depth (1-based) and top-face state. */
export function paperColor(palette: WorldPalette, depth: number, faceUp: boolean): string {
  const ramp = faceUp ? palette.paper : palette.paperDown;
  return ramp[Math.min(Math.max(depth, 1), ramp.length) - 1];
}
