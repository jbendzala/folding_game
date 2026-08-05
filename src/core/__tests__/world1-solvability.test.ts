import { describe, expect, it } from 'vitest';
import { createInitialState } from '../grid';
import { solve } from '../solver';
import { world1Levels } from '../../data/levels/world1';

describe('World 1 levels are solvable in exactly their expected fold count', () => {
  for (const level of world1Levels) {
    it(`Level ${level.id} (${level.name}) solves in ${level.expectedFolds} folds`, () => {
      const path = solve(createInitialState(level.start), level.goal, level.expectedFolds + 2);
      expect(path).not.toBeNull();
      expect(path!).toHaveLength(level.expectedFolds);
    });
  }
});
