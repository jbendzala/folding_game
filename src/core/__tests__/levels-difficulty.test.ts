import { describe, expect, it } from 'vitest';
import { analyzeLevel } from '../analysis';
import { allLevels } from '../../data/levels';

// Solver-driven analysis of 7x7 boards takes tens of seconds; these are
// correctness-of-design checks, not fast unit tests.
const SLOW = 120_000;

/**
 * Guards the failure mode that made the first level set trivial: a goal so
 * loose that every move wins. The Diamond once had 46,080 winning solutions
 * and zero wrong first moves, because "fold down to a single cell" is
 * satisfied by ANY full reduction. A level nobody can fail is not a level.
 */
describe('every level can actually be failed', () => {
  for (const level of allLevels) {
    it(
      `Level ${level.id} (${level.name}) has losing moves somewhere`,
      () => {
        const a = analyzeLevel(level, 2, false);
        expect(a.minFolds, 'unsolvable').not.toBeNull();
        // Measured across the whole solution, not just move one: on a big
        // symmetric sheet the opening fold is often genuinely free, and the
        // puzzle only tightens further down. Judging the opening alone would
        // reject good long levels and pass bad short ones.
        expect(
          a.meanTrap,
          'every move at every step wins -- the goal is too loose to be a puzzle'
        ).toBeGreaterThan(0);
      },
      SLOW
    );
  }
});

/**
 * The other way a level set goes wrong: every puzzle ends in one gesture.
 * Precision alone is not enough -- a one-fold puzzle is over the moment it
 * starts, however many of its openings lose. Late worlds have to be a chain.
 */
describe('the late game is a chain of folds, not a single move', () => {
  it('worlds 5+ average well over two folds', () => {
    const late = allLevels.filter((l) => l.world >= 5);
    const mean = late.reduce((sum, l) => sum + l.expectedFolds, 0) / late.length;
    expect(mean).toBeGreaterThan(2.5);
  });

  // The point is that the late game is not a STRING of one-gesture puzzles.
  // A short, very tight level among long ones is good pacing -- Pinned Frame
  // is three folds and among the most constrained in the game -- so the rule
  // is a floor per level plus an average per chapter, not a flat minimum.
  it('late chapters are built from chains, with no one-gesture levels', () => {
    for (const level of allLevels.filter((l) => l.world >= 7)) {
      expect(level.expectedFolds, `${level.name} is a single fold this late`).toBeGreaterThanOrEqual(3);
    }
    for (const world of [7, 8, 9]) {
      const chapter = allLevels.filter((l) => l.world === world);
      const mean = chapter.reduce((sum, l) => sum + l.expectedFolds, 0) / chapter.length;
      expect(mean, `chapter ${world} averages too few folds`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('difficulty rises across worlds', () => {
  it(
    'late worlds are harder overall, not just twitchier per move',
    () => {
      // Compared on `score`, which weighs solution LENGTH alongside
      // constraint. Per-step trap alone ranks the tight little mid-game
      // levels above the long finale, which is backwards: a 6-fold chain
      // whose first move is free is still the harder puzzle.
      const meanScore = (worlds: number[]) => {
        const picked = allLevels.filter((l) => worlds.includes(l.world));
        return picked.reduce((sum, l) => sum + analyzeLevel(l, 2, false).score, 0) / picked.length;
      };
      expect(meanScore([7, 8])).toBeGreaterThan(meanScore([2, 3, 4]));
    },
    SLOW
  );
});
