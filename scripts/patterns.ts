/**
 * Discovers two-sided goals: silhouettes reachable from a sheet together
 * with WHICH FACE ends up showing on each cell.
 *
 * The point of a pattern goal is that it separates fold sequences the
 * silhouette alone cannot tell apart -- folding one end of a strip over and
 * folding the other end over give the same outline but mirrored patterns.
 * This prints, for a given sheet, the patterns that are actually reachable
 * and how hard each is to hit.
 *
 *   npx tsx scripts/patterns.ts <rows...>   e.g. npx tsx scripts/patterns.ts 1x6
 *   npx tsx scripts/patterns.ts --shape "# # # #,# # # #"
 */
import { analyzeLevel } from '../src/core/analysis';
import { applyFold, listValidFolds } from '../src/core/fold';
import { createInitialState, getBounds, getStackAt } from '../src/core/grid';
import { shapeFromRows } from '../src/core/parseShape';
import type { CellCoord, FoldState, LevelDefinition, ShapePattern } from '../src/core/types';

const arg = process.argv[2] ?? '1x6';
let rows: string[];
if (arg.startsWith('--shape')) {
  rows = (process.argv[3] ?? '').split(',');
} else {
  const [w, h] = arg.split('x').map(Number);
  rows = Array.from({ length: h || 1 }, () => Array.from({ length: w }, () => '#').join(' '));
}
const maxFolds = Number(process.argv[process.argv.length - 1]) || 4;

const { shape: start } = shapeFromRows(rows);
console.log(`=== sheet ${start.width}x${start.height}, up to ${maxFolds} folds\n`);

interface Found {
  shape: ShapePattern;
  backCells: CellCoord[];
  folds: number;
}

/** Silhouette plus the visible face at every cell. */
function readPattern(state: FoldState): { shape: ShapePattern; backCells: CellCoord[] } {
  const b = getBounds(state.cells);
  const seen = new Set<string>();
  const cells: CellCoord[] = [];
  const backCells: CellCoord[] = [];
  for (const cs of state.cells) {
    const k = `${cs.position.row}:${cs.position.col}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const cell = { row: cs.position.row - b.minRow, col: cs.position.col - b.minCol };
    cells.push(cell);
    if (!getStackAt(state, cs.position)[0].faceUp) backCells.push(cell);
  }
  return {
    shape: { width: b.maxCol - b.minCol + 1, height: b.maxRow - b.minRow + 1, cells },
    backCells,
  };
}

const key = (f: Found) =>
  `${f.shape.width}x${f.shape.height}:` +
  f.shape.cells.map((c) => `${c.row}.${c.col}`).sort().join(',') +
  '|' +
  f.backCells.map((c) => `${c.row}.${c.col}`).sort().join(',');

const found = new Map<string, Found>();
let frontier = [createInitialState(start)];
const seenStates = new Set<string>();
for (let depth = 1; depth <= maxFolds; depth++) {
  const next: FoldState[] = [];
  for (const state of frontier) {
    for (const fold of listValidFolds(state)) {
      const after = applyFold(state, fold);
      const pat = readPattern(after);
      const f: Found = { ...pat, folds: depth };
      const k = key(f);
      if (!found.has(k)) found.set(k, f);
      if (seenStates.has(k + depth)) continue;
      seenStates.add(k + depth);
      next.push(after);
    }
  }
  frontier = next;
}

function render(f: Found): string[] {
  const filled = new Set(f.shape.cells.map((c) => `${c.row}:${c.col}`));
  const back = new Set(f.backCells.map((c) => `${c.row}:${c.col}`));
  const out: string[] = [];
  for (let r = 0; r < f.shape.height; r++) {
    let line = '';
    for (let c = 0; c < f.shape.width; c++) {
      const k = `${r}:${c}`;
      line += !filled.has(k) ? '.' : back.has(k) ? 'B' : '#';
    }
    out.push(line);
  }
  return out;
}

// Mixed patterns are the interesting ones: all-front or all-back adds nothing
// the silhouette did not already say.
const candidates = [...found.values()]
  .filter((f) => f.backCells.length > 0 && f.backCells.length < f.shape.cells.length)
  .sort((a, b) => b.folds - a.folds);

let shown = 0;
for (const f of candidates) {
  if (shown >= 8) break;
  const level: LevelDefinition = {
    key: 'probe',
    id: 0,
    name: 'probe',
    world: 0,
    start,
    goal: { shape: f.shape, backCells: f.backCells },
    newConcept: '',
    difficulty: 0,
    expectedFolds: f.folds,
    designerNotes: '',
  };
  const a = analyzeLevel(level, 0, false);
  if (a.minFolds === null) continue;
  console.log(`  ${a.minFolds} folds  meanTrap ${Math.round(a.meanTrap * 100)}%`);
  for (const line of render(f)) console.log(`    ${line}`);
  console.log();
  shown++;
}
if (shown === 0) console.log('  (no mixed-face patterns reachable)');
