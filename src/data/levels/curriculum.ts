import type { LevelDefinition } from '../../core/types';
import { world1Levels } from './world1';
import { world2Levels } from './world2';
import { world3Levels } from './world3';
import { world4Levels } from './world4';
import { world5Levels } from './world5';
import { world6Levels } from './world6';
import { world7Levels } from './world7';
import { world8Levels } from './world8';
import { world9Levels } from './world9';
import { world10Levels } from './world10';
import { world11Levels } from './world11';
import { lockedLevels } from './rulesLocked';
import { blockedLevels } from './rulesBlocked';
import { tearLevels } from './rulesTear';

/**
 * Every level that exists, keyed by its stable key. The files this reads from
 * are a LIBRARY, not an order -- a level's position in the game is decided
 * entirely by CHAPTERS below.
 *
 * The split exists because ordering kept being the thing that needed to
 * change. Difficulty was appended rather than woven in, so the hardest
 * chapter ended up sitting before a chapter that teaches a new rule. With
 * order living in one array, rearranging is a text edit rather than a rewrite
 * of eleven files, and because progress is saved against the key rather than
 * the position, players keep what they solved.
 */
const LIBRARY: LevelDefinition[] = [
  ...world1Levels,
  ...world2Levels,
  ...world3Levels,
  ...world4Levels,
  ...world5Levels,
  ...world6Levels,
  ...world7Levels,
  ...world8Levels,
  ...world9Levels,
  ...world10Levels,
  ...world11Levels,
  ...lockedLevels,
  ...blockedLevels,
  ...tearLevels,
];

export interface Chapter {
  name: string;
  /** Level keys, in play order. */
  keys: string[];
}

/**
 * The curriculum. Rules are introduced early and cheaply, then combined for
 * the rest of the game; each chapter that teaches something new dips in
 * difficulty before the next climb, so the curve is a sawtooth rather than a
 * ramp.
 */
export const CHAPTERS: Chapter[] = [
  {
    name: 'First Folds',
    keys: ['tiny-square', 'wide-rectangle', 'center-target', 'l-shape', 'u-shape'],
  },
  {
    name: 'Holes & Pins',
    keys: ['missing-corner', 'opposite-corner', 'hole-meets-hole', 'hold-it-down', 'around-the-pin'],
  },
  {
    name: 'Layers',
    keys: ['double-over', 'four-ply', 'thick-three', 'blocked-book', 'squash-the-frame'],
  },
  {
    name: 'Two Sides',
    keys: ['show-your-back', 'left-or-right', 'two-tone', 'bookend', 'alternating'],
  },
  {
    name: 'Clamped',
    keys: ['clamped', 'clamped-notch', 'clamped-corner', 'clamped-grid', 'clamped-thick'],
  },
  {
    name: 'No Go',
    keys: ['no-go', 'boxed-in', 'narrow-escape', 'blocked-wall', 'blocked-column'],
  },
  {
    // Short by nature rather than by neglect: a tear limit forbids exactly
    // the stacking that long solutions are built from, so searching found
    // nothing past two folds on any sheet, with or without a block beside
    // it. This chapter trades length for tightness.
    name: 'Fragile',
    keys: ['careful-now', 'thin-ice', 'fragile-notch', 'fragile-hole', 'fragile-grid'],
  },
  {
    name: 'Strange Geometry',
    keys: ['staircase', 'pinned-cross', 'pyramid', 'lightning', 'hourglass'],
  },
  {
    name: 'Thick & Thin',
    keys: ['even-strip', 'quarter-fold', 'fold-the-banner', 'thick-corner', 'swiss'],
  },
  {
    name: 'Masterpieces',
    keys: ['arrowhead', 'butterfly', 'iron-cross', 'pinned-diamond', 'pinned-masterpiece'],
  },
  {
    name: 'The Long Fold',
    keys: ['long-diamond', 'the-long-cross', 'butterfly-net', 'wingspan', 'the-last-fold'],
  },
  {
    name: 'The Gauntlet',
    keys: ['perforated', 'the-window', 'half-window', 'pinned-frame', 'nailed-window'],
  },
  {
    name: 'No Mercy',
    keys: ['the-gauntlet', 'nailed-swiss', 'pinned-perforation', 'pinned-net', 'the-last-word'],
  },
  {
    name: 'Endgame',
    keys: ['tight-net', 'pinned-wingspan', 'nailed-diamond', 'eight-deep', 'endgame'],
  },
];

const byKey = new Map(LIBRARY.map((l) => [l.key, l]));

/** Levels in play order, with id and world assigned from their position. */
export const allLevels: LevelDefinition[] = CHAPTERS.flatMap((chapter, chapterIndex) =>
  chapter.keys.map((key) => {
    const level = byKey.get(key);
    if (!level) throw new Error(`Curriculum lists "${key}", which no level file defines`);
    return { ...level, world: chapterIndex + 1 };
  })
).map((level, index) => ({ ...level, id: index + 1 }));

// A level that exists but is not placed would silently vanish from the game.
const placed = new Set(CHAPTERS.flatMap((c) => c.keys));
const orphans = LIBRARY.filter((l) => !placed.has(l.key)).map((l) => l.key);
if (orphans.length > 0) {
  throw new Error(`These levels exist but no chapter lists them: ${orphans.join(', ')}`);
}

export const WORLD_NAMES: Record<number, string> = Object.fromEntries(
  CHAPTERS.map((c, i) => [i + 1, c.name])
);
