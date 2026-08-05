import { describe, expect, it } from 'vitest';
import { applyFold, listValidFolds } from '../fold';
import { createInitialState, getBounds, getOccupiedPositions } from '../grid';
import { checkGoal } from '../goal';
import { world1Levels } from '../../data/levels/world1';
import type { FoldState, LevelDefinition } from '../types';

/**
 * A state signature good enough to dedupe the BFS frontier for these levels
 * specifically: no holes and no stack-order goal, so future fold options
 * (which depend only on the bounding box) and goal-checking (which depends
 * only on the set of distinct occupied positions) are all that matter --
 * which original cell sits under which is irrelevant here.
 */
function canonicalKey(state: FoldState): string {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  const positions = getOccupiedPositions(state)
    .map((p) => `${p.row}:${p.col}`)
    .sort()
    .join(',');
  return `${minRow},${maxRow},${minCol},${maxCol}|${positions}`;
}

/** Breadth-first search for the minimum number of folds that solves `level`,
 * giving up past `cap` moves. */
function minimalFoldCount(level: LevelDefinition, cap: number): number | null {
  const initial = createInitialState(level.start);
  if (checkGoal(initial, level.goal)) return 0;

  let frontier: FoldState[] = [initial];
  const seen = new Set<string>([canonicalKey(initial)]);

  for (let depth = 1; depth <= cap; depth++) {
    const next: FoldState[] = [];
    for (const state of frontier) {
      for (const fold of listValidFolds(state)) {
        const nextState = applyFold(state, fold);
        if (checkGoal(nextState, level.goal)) return depth;

        const key = canonicalKey(nextState);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(nextState);
      }
    }
    if (next.length === 0) return null;
    frontier = next;
  }
  return null;
}

describe('World 1 levels are solvable in exactly their expected fold count', () => {
  for (const level of world1Levels) {
    it(`Level ${level.id} (${level.name}) solves in ${level.expectedFolds} folds`, () => {
      const minimal = minimalFoldCount(level, level.expectedFolds + 2);
      expect(minimal).toBe(level.expectedFolds);
    });
  }
});
