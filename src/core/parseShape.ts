import type { CellCoord, ShapePattern } from './types';

/**
 * Authoring helper: turns the ASCII rows used throughout the design doc into
 * a ShapePattern, plus any named markers found in the art.
 *
 * Each row is whitespace-separated tokens, one per cell -- this matches the
 * "paper-cell paper-cell paper-cell" spacing convention used in the design
 * doc's ASCII art, and avoids ambiguity between "a hole" and "the gap between
 * cells" that raw character columns would have.
 *
 *   . or empty token -> hole (no paper)
 *   P                 -> paper, pinned to the table (collected in `pins`)
 *   B                 -> paper that must finish showing its BACK face
 *                        (collected in `backCells`; only meaningful in goals)
 *   @                 -> pinned paper that is ALSO the '*' target marker
 *   any other token   -> paper; the token itself is recorded as a marker
 *                        (e.g. "*" for a single-cell target, so callers can
 *                        look up its coordinate by name)
 */
export function shapeFromRows(
  rows: string[],
  markerNames: Record<string, string> = { '*': 'target', '@': 'target' }
): { shape: ShapePattern; markers: Map<string, CellCoord>; pins: CellCoord[]; backCells: CellCoord[] } {
  const grid = rows.map((row) => row.trim().split(/\s+/));
  const cells: CellCoord[] = [];
  const markers = new Map<string, CellCoord>();
  const pins: CellCoord[] = [];
  const backCells: CellCoord[] = [];

  grid.forEach((tokens, row) => {
    tokens.forEach((token, col) => {
      if (token === '.' || token === '') return;
      cells.push({ row, col });
      if (token === 'P' || token === '@') pins.push({ row, col });
      if (token === 'B') backCells.push({ row, col });
      const name = markerNames[token];
      if (name) markers.set(name, { row, col });
    });
  });

  const height = grid.length;
  const width = Math.max(...grid.map((r) => r.length));
  return { shape: { width, height, cells }, markers, pins, backCells };
}
