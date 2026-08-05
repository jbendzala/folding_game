import type { CellCoord, CellState, FoldState, ShapePattern } from './types';

/** Builds the starting FoldState for a shape: every occupied cell is its own
 * original cell, at zOrder 0 (the base layer), face up. */
export function createInitialState(shape: ShapePattern): FoldState {
  const cells: CellState[] = shape.cells.map(({ row, col }) => ({
    cell: { id: `${row}_${col}`, initial: { row, col } },
    position: { row, col },
    zOrder: 0,
    faceUp: true,
  }));
  return { cells, history: [] };
}

export interface Bounds {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
}

export function getBounds(cells: CellState[]): Bounds {
  if (cells.length === 0) {
    throw new Error('getBounds: cannot compute bounds of an empty cell list');
  }
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;
  for (const { position } of cells) {
    if (position.row < minRow) minRow = position.row;
    if (position.row > maxRow) maxRow = position.row;
    if (position.col < minCol) minCol = position.col;
    if (position.col > maxCol) maxCol = position.col;
  }
  return { minRow, maxRow, minCol, maxCol };
}

/** Distinct occupied positions in the current (un-normalized) coordinate system. */
export function getOccupiedPositions(state: FoldState): CellCoord[] {
  const seen = new Map<string, CellCoord>();
  for (const cs of state.cells) {
    seen.set(`${cs.position.row}:${cs.position.col}`, cs.position);
  }
  return [...seen.values()];
}

/** Translates a set of coordinates so the bounding box starts at (0,0), and
 * sorts them into a stable, comparable order. */
export function normalizeToShape(coords: CellCoord[]): ShapePattern {
  if (coords.length === 0) return { width: 0, height: 0, cells: [] };
  const minRow = Math.min(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const maxCol = Math.max(...coords.map((c) => c.col));
  const cells = coords
    .map((c) => ({ row: c.row - minRow, col: c.col - minCol }))
    .sort((a, b) => a.row - b.row || a.col - b.col);
  return { width: maxCol - minCol + 1, height: maxRow - minRow + 1, cells };
}

/** All cells currently stacked at a given (un-normalized) position, top first. */
export function getStackAt(state: FoldState, position: CellCoord): CellState[] {
  return state.cells
    .filter((cs) => cs.position.row === position.row && cs.position.col === position.col)
    .sort((a, b) => b.zOrder - a.zOrder);
}
