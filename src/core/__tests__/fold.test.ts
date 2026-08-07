import { describe, expect, it } from 'vitest';
import { applyFold, isValidFold } from '../fold';
import { createInitialState, getOccupiedPositions, getStackAt, normalizeToShape } from '../grid';
import { checkGoal, shapesMatch } from '../goal';
import { shapeFromRows } from '../parseShape';
import { getLevel } from '../../data/levels';
import type { Fold } from '../types';

describe('applyFold', () => {
  it('solves Level 1 (Tiny Square): fold away from the target twice', () => {
    const level = getLevel(1);
    let state = createInitialState(level.start);

    // Target is bottom-right ('*' at row1,col1): fold left col onto right,
    // then top row onto bottom.
    state = applyFold(state, { axis: 'vertical', line: 0, moves: 'lower' });
    state = applyFold(state, { axis: 'horizontal', line: 0, moves: 'lower' });

    expect(checkGoal(state, level.goal)).toBe(true);
  });

  it('fails Level 1 with the opposite directions (the habit trap actually bites)', () => {
    const level = getLevel(1);
    let state = createInitialState(level.start);

    state = applyFold(state, { axis: 'vertical', line: 0, moves: 'upper' });
    state = applyFold(state, { axis: 'horizontal', line: 0, moves: 'upper' });

    expect(checkGoal(state, level.goal)).toBe(false);
  });

  it('rejects a fold line outside the current shape', () => {
    const { shape } = shapeFromRows(['# #', '# #']);
    const state = createInitialState(shape);
    const outOfRange: Fold = { axis: 'vertical', line: 5, moves: 'lower' };
    expect(isValidFold(state, outOfRange)).toBe(false);
    expect(() => applyFold(state, outOfRange)).toThrow();
  });

  it('reduces a 4-wide strip to 1 cell in the expected minimum of folds', () => {
    const level = getLevel(2); // Wide Rectangle, 2x4, target at (0,0)
    let state = createInitialState(level.start);

    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'upper' }); // 4 -> 2
    state = applyFold(state, { axis: 'vertical', line: 0, moves: 'upper' }); // 2 -> 1
    state = applyFold(state, { axis: 'horizontal', line: 0, moves: 'upper' });

    expect(state.history).toHaveLength(level.expectedFolds);
    expect(checkGoal(state, level.goal)).toBe(true);
  });

  it('folding a hole onto solid paper patches it (Missing Corner style)', () => {
    // 2x3 with the bottom-right corner missing.
    const { shape } = shapeFromRows(['# # #', '# # .']);
    let state = createInitialState(shape);

    // Fold the bottom row (with the hole) up onto the fully-solid top row.
    state = applyFold(state, { axis: 'horizontal', line: 0, moves: 'upper' });

    const occupied = normalizeToShape(getOccupiedPositions(state));
    expect(shapesMatch(occupied, { width: 3, height: 1, cells: [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    ] })).toBe(true);
  });

  it('a hole preserved by never folding across it stays a hole', () => {
    // 2x3 with the TOP-LEFT corner missing.
    const { shape } = shapeFromRows(['. # #', '# # #']);
    let state = createInitialState(shape);

    // Drop the solid third column (never touches the hole's column).
    state = applyFold(state, { axis: 'vertical', line: 1, moves: 'upper' });

    const occupied = normalizeToShape(getOccupiedPositions(state));
    expect(shapesMatch(occupied, { width: 2, height: 2, cells: [
      { row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 },
    ] })).toBe(true);
  });

  it('reverses internal layer order when a stacked group folds again (physical stacking)', () => {
    const { shape } = shapeFromRows(['# #', '# #']); // 2x2, ids: 0_0, 0_1, 1_0, 1_1
    let state = createInitialState(shape);

    // Fold left col onto right: at (row, col1) each row now has [old-col0 on
    // top of old-col1] since the mover (col0) always lands above stationary.
    state = applyFold(state, { axis: 'vertical', line: 0, moves: 'lower' });
    let stack = getStackAt(state, { row: 0, col: 1 });
    expect(stack.map((c) => c.cell.id)).toEqual(['0_0', '0_1']);

    // Now fold the top row (a 2-layer flap: 0_0 over 0_1) down onto the
    // bottom row (1_0 over 1_1). The flap flips as a rigid block, so its
    // internal order reverses (0_1 ends up above 0_0), and the whole
    // flipped block lands above the stationary bottom-row stack.
    state = applyFold(state, { axis: 'horizontal', line: 0, moves: 'lower' });
    stack = getStackAt(state, { row: 1, col: 1 });
    expect(stack.map((c) => c.cell.id)).toEqual(['0_1', '0_0', '1_0', '1_1']);
  });
});
