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
