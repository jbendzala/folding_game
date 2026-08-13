import { getBounds } from './grid';
import type { CellState, Fold, FoldState } from './types';

/**
 * A fold is legal when its line sits strictly inside the current shape on
 * that axis (otherwise it moves no paper) and it breaks none of the level's
 * constraints. Everything is checked here rather than at commit time, so an
 * illegal fold cannot be made at all -- the paper simply refuses.
 */
export function isValidFold(state: FoldState, fold: Fold): boolean {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  const inBounds =
    fold.axis === 'vertical'
      ? fold.line >= minCol && fold.line < maxCol
      : fold.line >= minRow && fold.line < maxRow;
  if (!inBounds) return false;

  const c = state.constraints;
  if (!c) return true;
  const axisKey = fold.axis === 'vertical' ? 'col' : 'row';

  // Pins hold their spot on the table, so they can never be on the moving side.
  if (c.pins) {
    for (const pin of c.pins) {
      const v = pin[axisKey];
      const pinMoves = fold.moves === 'lower' ? v <= fold.line : v > fold.line;
      if (pinMoves) return false;
    }
  }

  // A clamped line cannot be creased, whichever way you fold it.
  if (c.lockedCreases) {
    for (const locked of c.lockedCreases) {
      if (locked.axis === fold.axis && locked.line === fold.line) return false;
    }
  }

  // Forbidden squares and the layer ceiling both depend on where the paper
  // LANDS, so they need the resulting positions.
  if (c.forbidden || c.maxDepth !== undefined) {
    const forbidden = new Set((c.forbidden ?? []).map((f) => `${f.row}:${f.col}`));
    const depth = new Map<string, number>();
    for (const cs of state.cells) {
      const value = cs.position[axisKey];
      const moves = fold.moves === 'lower' ? value <= fold.line : value > fold.line;
      const pos = moves
        ? { ...cs.position, [axisKey]: 2 * fold.line + 1 - value }
        : cs.position;
      const k = `${pos.row}:${pos.col}`;
      if (forbidden.has(k)) return false;
      if (c.maxDepth !== undefined) {
        const n = (depth.get(k) ?? 0) + 1;
        if (n > c.maxDepth) return false;
        depth.set(k, n);
      }
    }
  }

  return true;
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

  return state.constraints
    ? { cells, history: [...state.history, fold], constraints: state.constraints }
    : { cells, history: [...state.history, fold] };
}

/** Replays a fold sequence from a fresh initial state -- the simplest, most
 * bug-resistant way to support "undo" (just drop the last fold and replay). */
export function replayFolds(
  createInitial: () => FoldState,
  folds: readonly Fold[]
): FoldState {
  return folds.reduce((state, fold) => applyFold(state, fold), createInitial());
}

/** Every fold (line + direction, both axes) that's currently legal: every
 * line strictly inside the shape's current bounding box whose moving side
 * doesn't contain a pin. Used by the UI to offer fold choices, and by the
 * solver to search for solutions. */
export function listValidFolds(state: FoldState): Fold[] {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  const candidates: Fold[] = [];
  for (let line = minCol; line < maxCol; line++) {
    candidates.push({ axis: 'vertical', line, moves: 'lower' });
    candidates.push({ axis: 'vertical', line, moves: 'upper' });
  }
  for (let line = minRow; line < maxRow; line++) {
    candidates.push({ axis: 'horizontal', line, moves: 'lower' });
    candidates.push({ axis: 'horizontal', line, moves: 'upper' });
  }
  return state.constraints ? candidates.filter((f) => isValidFold(state, f)) : candidates;
}
