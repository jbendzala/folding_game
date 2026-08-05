import { describe, expect, it } from 'vitest';
import { createInitialState } from '../grid';
import { solve } from '../solver';
import { allLevels } from '../../data/levels';

describe('every level is solvable in exactly its expected fold count', () => {
  for (const level of allLevels) {
    it(`Level ${level.id} (${level.name}) solves in ${level.expectedFolds} folds`, () => {
      // Cap at exactly expectedFolds: BFS returns the shortest path first, so
      // finding one AT the cap also proves nothing shorter exists -- and the
      // tight cap lets branch-and-bound prune hard on the big grids.
      const path = solve(createInitialState(level.start), level.goal, level.expectedFolds);
      expect(path).not.toBeNull();
      expect(path!).toHaveLength(level.expectedFolds);
    });
  }
});
