import { describe, expect, it } from 'vitest';
import { applyFold, isValidFold, listValidFolds } from '../fold';
import { createInitialState } from '../grid';
import { checkGoal } from '../goal';
import { shapeFromRows } from '../parseShape';

describe('pinned cells', () => {
  it('bans any fold whose moving side contains a pin', () => {
    const { shape, pins } = shapeFromRows(['P # #', '# # #']);
    const state = createInitialState(shape, pins);

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
    let state = createInitialState(shape, pins);

    const folds = listValidFolds(state);
    expect(folds.every((f) => isValidFold(state, f))).toBe(true);
    expect(folds.some((f) => f.moves === 'lower')).toBe(false); // pin sits at min row+col

    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'upper' });
    expect(state.pins).toEqual([{ row: 0, col: 0 }]);
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
