import { describe, expect, it } from 'vitest';
import { analyzeLevel } from '../analysis';
import { allLevels } from '../../data/levels';

/**
 * Guards the failure mode that made the first level set trivial: a goal so
 * loose that every opening move wins. The Diamond once had 46,080 winning
 * solutions and zero wrong first moves, because "fold down to a single cell"
 * is satisfied by ANY full reduction. A level nobody can fail is not a level.
 */
describe('every level can actually be failed', () => {
  for (const level of allLevels) {
    it(`Level ${level.id} (${level.name}) has losing opening moves`, () => {
      const a = analyzeLevel(level);
      expect(a.minFolds, 'unsolvable').not.toBeNull();
      expect(
        a.viableOpenings,
        `all ${a.openings} openings win -- the goal is too loose to be a puzzle`
      ).toBeLessThan(a.openings);
    });
  }
});

describe('difficulty rises across worlds', () => {
  it('later worlds demand more precision than the tutorial', () => {
    const meanTrap = (worlds: number[]) => {
      const picked = allLevels.filter((l) => worlds.includes(l.world));
      return picked.reduce((sum, l) => sum + analyzeLevel(l).trapRate, 0) / picked.length;
    };
    // Worlds 5-7 are the payoff; they should punish loose play harder than
    // the mid-game teaching worlds.
    expect(meanTrap([5, 6, 7])).toBeGreaterThan(meanTrap([3, 4]));
  });
});
