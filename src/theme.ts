/**
 * Fold's visual language, in one place.
 *
 * Direction: dark slate stage, warm cream paper. The paper is the hero --
 * everything else stays low-contrast so the fold animation carries the
 * screen. Stack depth reads as progressively deeper amber (paper getting
 * "thicker"), which doubles as the game's core feedback mechanic.
 */
export const theme = {
  colors: {
    // Stage
    bg: '#12151d',
    bgRaised: '#1a1f2b',
    bgOverlay: 'rgba(9, 11, 16, 0.72)',

    // Text
    ink: '#f2ede3',
    inkSoft: '#9aa3b5',
    inkFaint: '#5a6375',

    // Paper: index = stack depth - 1 (deeper = folded more = warmer/darker).
    paper: ['#f5efe2', '#ecdfc2', '#dfcb9e', '#d0b478', '#bd9a55', '#a5813c', '#8c6a2e'],
    // Face-down top layer gets a cooler tint so flips are visible.
    paperDown: ['#e3e0d8', '#d8d2c0', '#c9bda0', '#b8a67e', '#a48d5c', '#8d7642', '#766033'],
    paperShadow: 'rgba(0, 0, 0, 0.35)',

    // Accents
    accent: '#ff6d4d', // coral -- target marker, hints, primary actions
    accentSoft: 'rgba(255, 109, 77, 0.16)',
    gold: '#ffc247', // stars, best-score celebration
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
    // System font, weights carry the hierarchy.
    title: 30,
    heading: 22,
    body: 15,
    small: 13,
    tiny: 11,
  },
} as const;

/** Paper fill for a stack of the given depth (1-based) and top-face state. */
export function paperColor(depth: number, faceUp: boolean): string {
  const palette = faceUp ? theme.colors.paper : theme.colors.paperDown;
  return palette[Math.min(depth, palette.length) - 1];
}
