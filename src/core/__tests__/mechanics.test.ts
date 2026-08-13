import { describe, expect, it } from 'vitest';
import { applyFold, isValidFold, listValidFolds } from '../fold';
import { createInitialState } from '../grid';
import { checkGoal, isGoalStillReachable } from '../goal';
import { shapeFromRows } from '../parseShape';
import { allLevels } from '../../data/levels';

describe('pinned cells', () => {
  it('bans any fold whose moving side contains a pin', () => {
    const { shape, pins } = shapeFromRows(['P # #', '# # #']);
    const state = createInitialState(shape, { pins });

    // Pin at (0,0): anything moving col 0 or row 0 is out.
    expect(isValidFold(state, { axis: 'vertical', line: 0, moves: 'lower' })).toBe(false);
    expect(isValidFold(state, { axis: 'vertical', line: 1, moves: 'lower' })).toBe(false);
    expect(isValidFold(state, { axis: 'horizontal', line: 0, moves: 'lower' })).toBe(false);
    // Folding the far side ONTO the pinned region is fine.
    expect(isValidFold(state, { axis: 'vertical', line: 1, moves: 'upper' })).toBe(true);
    expect(isValidFold(state, { axis: 'horizontal', line: 0, moves: 'upper' })).toBe(true);
  });

  it('listValidFolds filters pinned folds and pins survive applyFold', () => {
    const { shape, pins } = shapeFromRows(['P # #', '# # #']);
    let state = createInitialState(shape, { pins });

    const folds = listValidFolds(state);
    expect(folds.every((f) => isValidFold(state, f))).toBe(true);
    expect(folds.some((f) => f.moves === 'lower')).toBe(false); // pin sits at min row+col

    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'upper' });
    expect(state.constraints?.pins).toEqual([{ row: 0, col: 0 }]);
    // Still enforced after folding.
    expect(isValidFold(state, { axis: 'vertical', line: 0, moves: 'lower' })).toBe(false);
  });

  it('parses @ as pin + target simultaneously', () => {
    const { markers, pins } = shapeFromRows(['@ #', '# #']);
    expect(markers.get('target')).toEqual({ row: 0, col: 0 });
    expect(pins).toEqual([{ row: 0, col: 0 }]);
  });
});

describe('uniform depth goals', () => {
  const goal2x2depth2 = {
    shape: {
      width: 2,
      height: 2,
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
    },
    uniformDepth: 2,
  };

  it('accepts a perfectly even half-fold', () => {
    const { shape } = shapeFromRows(['# # # #', '# # # #']);
    let state = createInitialState(shape);
    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'lower' });
    expect(checkGoal(state, goal2x2depth2)).toBe(true);
  });

  it('rejects the right silhouette with uneven thickness', () => {
    // 2x3: folding one column over gives a 2x2 footprint but depths 2,1.
    const { shape } = shapeFromRows(['# # #', '# # #']);
    let state = createInitialState(shape);
    state = applyFold(state, { axis: 'vertical', line: 0, moves: 'lower' });
    // Silhouette is 2x2 but col depths are 2 and 1 -> not uniform.
    expect(checkGoal(state, goal2x2depth2)).toBe(false);
  });
});

describe('dead position detection', () => {
  it('flags a position folded smaller than the goal', () => {
    const { shape } = shapeFromRows(['# # # #', '# # # #']);
    let state = createInitialState(shape);
    const goal = {
      shape: {
        width: 3,
        height: 2,
        cells: [
          { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
          { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 },
        ],
      },
    };
    expect(isGoalStillReachable(state, goal)).toBe(true);
    // Fold to 2 wide: the goal needs 3, and width never grows back.
    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'lower' });
    expect(isGoalStillReachable(state, goal)).toBe(false);
  });

  it('flags a stack already deeper than a uniform-depth goal', () => {
    const { shape } = shapeFromRows(['# # # #']);
    let state = createInitialState(shape);
    const goal = {
      shape: { width: 2, height: 1, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }] },
      uniformDepth: 2,
    };
    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'lower' });
    expect(isGoalStillReachable(state, goal)).toBe(true); // exactly 2 deep
    state = applyFold(state, { axis: 'vertical', line: 2, moves: 'lower' });
    expect(isGoalStillReachable(state, goal)).toBe(false); // 4 deep, cannot thin
  });

  it('never reports a solved position as dead', () => {
    for (const level of allLevels.slice(0, 12)) {
      const state = createInitialState(level.start, level.constraints);
      expect(isGoalStillReachable(state, level.goal), level.name).toBe(true);
    }
  });
});

describe('locked creases', () => {
  it('refuses the clamped line in both directions, and allows its neighbours', () => {
    const { shape } = shapeFromRows(['# # # #']);
    const state = createInitialState(shape, {
      lockedCreases: [{ axis: 'vertical', line: 1, moves: 'lower' }],
    });
    expect(isValidFold(state, { axis: 'vertical', line: 1, moves: 'lower' })).toBe(false);
    expect(isValidFold(state, { axis: 'vertical', line: 1, moves: 'upper' })).toBe(false);
    expect(isValidFold(state, { axis: 'vertical', line: 0, moves: 'lower' })).toBe(true);
    expect(isValidFold(state, { axis: 'vertical', line: 2, moves: 'upper' })).toBe(true);
  });
});

describe('forbidden squares', () => {
  it('refuses any fold that would land paper on a blocked cell', () => {
    // 1x3 strip with the square to its right blocked.
    const { shape } = shapeFromRows(['# # # X']);
    const state = createInitialState(shape, { forbidden: [{ row: 0, col: 3 }] });
    // Folding col 0 rightward puts paper on col 1 -- fine.
    expect(isValidFold(state, { axis: 'vertical', line: 0, moves: 'lower' })).toBe(true);
    // Folding cols 0-1 over line 1 sends col 0 to col 3, which is blocked.
    expect(isValidFold(state, { axis: 'vertical', line: 1, moves: 'lower' })).toBe(false);
  });
});

describe('max depth', () => {
  it('refuses a fold that would stack more sheets than the paper can take', () => {
    const { shape } = shapeFromRows(['# # # #']);
    const state = createInitialState(shape, { maxDepth: 2 });
    // 4 -> 2 columns, two sheets each: allowed.
    const halved = applyFold(state, { axis: 'vertical', line: 1, moves: 'lower' });
    expect(halved.cells).toHaveLength(4);
    // Halving again would make four sheets on a cell: refused.
    expect(isValidFold(halved, { axis: 'vertical', line: 2, moves: 'lower' })).toBe(false);
  });

  it('leaves folds alone when no ceiling is set', () => {
    const { shape } = shapeFromRows(['# # # #']);
    let state = createInitialState(shape);
    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'lower' });
    expect(isValidFold(state, { axis: 'vertical', line: 2, moves: 'lower' })).toBe(true);
  });
});
