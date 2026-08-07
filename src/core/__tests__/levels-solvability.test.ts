import { describe, expect, it } from 'vitest';
import { createInitialState } from '../grid';
import { solve } from '../solver';
import { allLevels } from '../../data/levels';

describe('every level is solvable in exactly its expected fold count', () => {
  for (const level of allLevels) {
    it(`Level ${level.id} (${level.name}) solves in ${level.expectedFolds} folds`, () => {
      // Cap slightly above expected: BFS returns the shortest path first, so
      // the length assert proves minimality either way, and a wrong
      // expectedFolds shows the true minimum in the failure message.
      const path = solve(
        createInitialState(level.start, level.pins),
        level.goal,
        level.expectedFolds + 2
      );
      expect(path, 'no solution found within cap').not.toBeNull();
      expect(path!.length).toBe(level.expectedFolds);
    });
  }
});
