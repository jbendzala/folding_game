import { getOccupiedPositions, getStackAt, normalizeToShape } from './grid';
import type { CellCoord, FoldState, LevelGoal, ShapePattern } from './types';

const key = (c: CellCoord) => `${c.row}:${c.col}`;

/** Two shape patterns match if they have the same bounding box and exactly
 * the same set of occupied cells (so holes must line up too). */
export function shapesMatch(a: ShapePattern, b: ShapePattern): boolean {
  if (a.width !== b.width || a.height !== b.height) return false;
  if (a.cells.length !== b.cells.length) return false;
  const cellsA = new Set(a.cells.map(key));
  return b.cells.every((c) => cellsA.has(key(c)));
}

/**
 * Checks whether the current fold state satisfies a level's goal: the
 * silhouette must match exactly, and (from World 5 on) specific cells' full
 * layer stacks must match the required marks/order too.
 */
/**
 * Cheap, certain detection of a dead position -- false means the goal can
 * NEVER be reached from here, true means "not provably dead" (it may still
 * be, but proving that needs a search).
 *
 * It leans on three things folding can never undo:
 *  - the bounding box only ever shrinks, so an axis already smaller than the
 *    goal's can never grow back;
 *  - the number of distinct occupied cells never increases, since every
 *    moved cell lands on exactly one position;
 *  - layers only accumulate, so a stack already deeper than a uniform-depth
 *    goal can never thin out.
 *
 * Deliberately not a solver call: running a real search after every fold
 * would stall the UI on the larger boards for seconds. This costs one pass
 * over the cells and never raises a false alarm.
 */
export function isGoalStillReachable(state: FoldState, goal: LevelGoal): boolean {
  const occupied = getOccupiedPositions(state);
  if (occupied.length === 0) return false;
  if (occupied.length < goal.shape.cells.length) return false;

  const minRow = Math.min(...occupied.map((c) => c.row));
  const maxRow = Math.max(...occupied.map((c) => c.row));
  const minCol = Math.min(...occupied.map((c) => c.col));
  const maxCol = Math.max(...occupied.map((c) => c.col));
  if (maxCol - minCol + 1 < goal.shape.width) return false;
  if (maxRow - minRow + 1 < goal.shape.height) return false;

  if (goal.uniformDepth !== undefined) {
    const counts = new Map<string, number>();
    for (const cs of state.cells) {
      const k = `${cs.position.row}:${cs.position.col}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const n of counts.values()) {
      if (n > goal.uniformDepth) return false;
    }
  }
  return true;
}

export function checkGoal(state: FoldState, goal: LevelGoal): boolean {
  const occupied = getOccupiedPositions(state);
  if (occupied.length === 0) return false;

  const minRow = Math.min(...occupied.map((c) => c.row));
  const minCol = Math.min(...occupied.map((c) => c.col));

  const pattern = normalizeToShape(occupied);
  if (!shapesMatch(pattern, goal.shape)) return false;
  if (goal.anchor && (minRow !== goal.anchor.row || minCol !== goal.anchor.col)) return false;

  if (goal.uniformDepth !== undefined) {
    const counts = new Map<string, number>();
    for (const cs of state.cells) {
      const k = `${cs.position.row}:${cs.position.col}`;
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
    for (const n of counts.values()) {
      if (n !== goal.uniformDepth) return false;
    }
  }

  if (goal.backCells) {
    // Two-sided paper: the top layer at each cell must be showing the side
    // the goal asks for. faceUp is the front; it toggles on every fold the
    // cell takes part in.
    const wantBack = new Set(goal.backCells.map(key));
    for (const cell of goal.shape.cells) {
      const top = getStackAt(state, { row: cell.row + minRow, col: cell.col + minCol })[0];
      if (!top) return false;
      if (wantBack.has(key(cell)) === top.faceUp) return false;
    }
  }

  if (!goal.stackRequirements || goal.stackRequirements.length === 0) return true;
  const toAbsolute = (at: CellCoord): CellCoord => ({
    row: at.row + minRow,
    col: at.col + minCol,
  });

  return goal.stackRequirements.every((req) => {
    const stack = getStackAt(state, toAbsolute(req.at));
    if (req.kind === 'topCell') {
      return stack[0]?.cell.id === req.cellId;
    }
    return stack.map((cs) => cs.cell.id).join(',') === req.order.join(',');
  });
}
