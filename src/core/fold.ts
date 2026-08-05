import { getBounds } from './grid';
import type { CellState, Fold, FoldState } from './types';

/** A fold line must sit strictly inside the current shape's extent on that axis
 * -- otherwise it wouldn't move any paper at all. */
export function isValidFold(state: FoldState, fold: Fold): boolean {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  if (fold.axis === 'vertical') {
    return fold.line >= minCol && fold.line < maxCol;
  }
  return fold.line >= minRow && fold.line < maxRow;
}

/**
 * Applies a single fold, returning a new FoldState (input is left untouched).
 *
 * The moving side is mirrored across the fold line (reflection about the
 * boundary at `line + 0.5`) and lands on top of whatever is already at its
 * destination, with its face flipped. Cells on the stationary side are
 * returned unchanged.
 *
 * Physical subtlety this has to get right: the moving side may already be a
 * multi-layer stack from an earlier fold. Folding it flips it over as one
 * rigid block, so its INTERNAL layer order reverses (what was the top of the
 * flap becomes the bottom of the flipped block) before the whole block lands
 * above the destination's existing stack. So: sort the movers by their
 * current zOrder, then hand out new zOrders above the previous global max in
 * reverse -- the old bottom becomes the new top of the moved block.
 */
export function applyFold(state: FoldState, fold: Fold): FoldState {
  if (!isValidFold(state, fold)) {
    throw new Error(
      `Invalid fold: ${fold.axis} line=${fold.line} moves=${fold.moves} is outside the current shape`
    );
  }

  const axisKey = fold.axis === 'vertical' ? 'col' : 'row';
  const currentMaxZ = state.cells.reduce((max, cs) => Math.max(max, cs.zOrder), 0);

  const movingIndices: number[] = [];
  state.cells.forEach((cs, i) => {
    const value = cs.position[axisKey];
    const cellMoves = fold.moves === 'lower' ? value <= fold.line : value > fold.line;
    if (cellMoves) movingIndices.push(i);
  });

  const sortedByOldZAscending = [...movingIndices].sort(
    (a, b) => state.cells[a].zOrder - state.cells[b].zOrder
  );
  const newZByIndex = new Map<number, number>();
  sortedByOldZAscending.forEach((cellIndex, rank) => {
    // rank 0 = old bottom -> gets the highest new z (new top of the moved block).
    newZByIndex.set(cellIndex, currentMaxZ + (sortedByOldZAscending.length - rank));
  });

  const cells: CellState[] = state.cells.map((cs, i) => {
    const newZ = newZByIndex.get(i);
    if (newZ === undefined) return cs; // stationary side, untouched

    const value = cs.position[axisKey];
    const mirrored = 2 * fold.line + 1 - value;
    return {
      ...cs,
      position: { ...cs.position, [axisKey]: mirrored },
      zOrder: newZ,
      faceUp: !cs.faceUp,
    };
  });

  return { cells, history: [...state.history, fold] };
}

/** Replays a fold sequence from a fresh initial state -- the simplest, most
 * bug-resistant way to support "undo" (just drop the last fold and replay). */
export function replayFolds(
  createInitial: () => FoldState,
  folds: readonly Fold[]
): FoldState {
  return folds.reduce((state, fold) => applyFold(state, fold), createInitial());
}

/** Every fold (line + direction, both axes) that's currently legal, i.e. every
 * line strictly inside the shape's current bounding box. Used by the UI to
 * offer fold choices, and by tests to search for solutions. */
export function listValidFolds(state: FoldState): Fold[] {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  const folds: Fold[] = [];
  for (let line = minCol; line < maxCol; line++) {
    folds.push({ axis: 'vertical', line, moves: 'lower' });
    folds.push({ axis: 'vertical', line, moves: 'upper' });
  }
  for (let line = minRow; line < maxRow; line++) {
    folds.push({ axis: 'horizontal', line, moves: 'lower' });
    folds.push({ axis: 'horizontal', line, moves: 'upper' });
  }
  return folds;
}
