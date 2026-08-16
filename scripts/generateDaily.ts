/**
 * Generates a year of daily puzzles, each verified by the solver.
 *
 * Target is a notch above the campaign's last three worlds, which run 5-6
 * folds at 66-83% mean trap: five folds minimum, 75% minimum, and at least
 * two rules on every sheet.
 *
 * The pipeline is the same discipline the campaign used -- generate, then
 * filter, and never let anything become a puzzle until the solver has
 * confirmed it. What makes a year of these affordable is owning both halves:
 * a generator that produces ragged sheets and a solver that proves the exact
 * minimum fold count. Hand-authoring 365 levels at this difficulty would be
 * months of work.
 *
 * Two things it deliberately does NOT claim:
 *  - that the sheets are legible. The solver proves a puzzle is fair; it has
 *    no opinion on whether the shape looks deliberate or arbitrary.
 *  - that they are all distinct puzzles in the way a player means it. They are
 *    deduplicated by symmetry orbit, so none is another's reflection, but two
 *    ragged sheets can still play similarly.
 *
 * Runs in batches and resumes. It loads whatever is already in the output
 * file, seeds the duplicate check from it, and appends until the target total
 * is reached, writing after every keeper. The first version did neither: it
 * held everything in memory and wrote once at the end, so a long run showed no
 * progress and lost all of it if interrupted.
 *
 *   npx tsx scripts/generateDaily.ts [targetTotal] [outFile] [seed]
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { analyzeLevel } from '../src/core/analysis';
import { createInitialState } from '../src/core/grid';
import { shapeFromRows } from '../src/core/parseShape';
import { solve } from '../src/core/solver';
import type { Fold, FoldConstraints } from '../src/core/types';
import { orbitKey } from './hunt2';

const WANT = Number(process.argv[2] ?? 365);
const OUT = process.argv[3] ?? 'src/data/daily/puzzles.json';

const MIN_FOLDS = 5;
const MIN_TRAP = 0.75;
/** Stop searching a sheet once it has produced something this good. */
const GOOD_ENOUGH_TRAP = 0.8;
/** Hard ceiling on searches per sheet, so one awkward sheet cannot stall a batch. */
const MAX_PAIRS_PER_SHEET = 14;

let seed = Number(process.argv[4] ?? 20260816);
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

function blob(w: number, h: number, n: number): string[] | null {
  const cells = new Set<string>();
  cells.add(`${Math.floor(rnd() * h)}:${Math.floor(rnd() * w)}`);
  let guard = 0;
  while (cells.size < n && guard++ < 600) {
    const list = [...cells];
    const [pr, pc] = list[Math.floor(rnd() * list.length)].split(':').map(Number);
    const d = [[0, 1], [0, -1], [1, 0], [-1, 0]][Math.floor(rnd() * 4)];
    const nr = pr + d[0];
    const nc = pc + d[1];
    if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue;
    cells.add(`${nr}:${nc}`);
  }
  if (cells.size < n) return null;
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    const t: string[] = [];
    for (let x = 0; x < w; x++) t.push(cells.has(`${y}:${x}`) ? '#' : '.');
    rows.push(t.join(' '));
  }
  while (rows.length && !rows[0].includes('#')) rows.shift();
  while (rows.length && !rows[rows.length - 1].includes('#')) rows.pop();
  return rows.length >= 4 ? rows : null;
}

const GOALS: [string, string[]][] = [
  ['ell', ['# .', '# #']],
  ['tee', ['# .', '# #', '# .']],
  ['corner', ['# # #', '# . .', '# . .']],
  ['bar', ['# # #']],
  ['square', ['# #', '# #']],
  ['flag', ['# . . .', '# # # #']],
  ['ring', ['# # #', '# . #', '# # #']],
];

interface Puzzle {
  day: number;
  rows: string[];
  goalRows: string[];
  borders: boolean;
  lockedCrease: { axis: 'vertical' | 'horizontal'; line: number } | null;
  pin: { row: number; col: number } | null;
  folds: number;
  trap: number;
}

// Resume from whatever is already on disk.
const puzzles: Puzzle[] = existsSync(OUT)
  ? (JSON.parse(readFileSync(OUT, 'utf8')) as Puzzle[])
  : [];
const seen = new Set<string>(puzzles.map((p) => orbitKey(p.rows)));
if (puzzles.length) console.log(`resuming from ${puzzles.length} existing puzzles`);
let attempts = 0;

const save = () => {
  puzzles.forEach((p, i) => (p.day = i + 1));
  writeFileSync(OUT, JSON.stringify(puzzles, null, 1));
};

while (puzzles.length < WANT && attempts < WANT * 200) {
  attempts++;
  const w = 5 + Math.floor(rnd() * 3);
  const h = 5 + Math.floor(rnd() * 3);
  const rows = blob(w, h, 20 + Math.floor(rnd() * 14));
  if (!rows) continue;
  const key = orbitKey(rows);
  if (seen.has(key)) continue;

  const { shape } = shapeFromRows(rows);
  if (shape.cells.length < 18) continue;

  const box = { minRow: 0, maxRow: shape.height - 1, minCol: 0, maxCol: shape.width - 1 };
  // Interior lines only: a clamp on an outer line can simply never be folded
  // and so costs the player nothing (the flaw found in campaign level 97).
  const clamps: Fold[] = [];
  for (let l = 1; l < shape.width - 2; l++) clamps.push({ axis: 'vertical', line: l, moves: 'lower' });
  for (let l = 1; l < shape.height - 2; l++) clamps.push({ axis: 'horizontal', line: l, moves: 'lower' });
  if (!clamps.length) continue;

  // Every goal against every interior clamp. Growing a sheet is cheap and
  // solving is not, but a sheet that works at all usually works for several
  // combinations -- testing one random pair per sheet threw away most of the
  // yield and needed ~800 sheets per keeper.
  // Bounded work per sheet. Trying every goal against every clamp is up to 70
  // searches, and on a 30-cell sheet each one can take a second or more --
  // minutes per sheet, for a sheet that may yield nothing. Pairs are shuffled
  // so the cap does not bias toward the first goals in the list.
  const pairs: [string[], Fold][] = [];
  for (const [, goalRows] of GOALS) for (const clamp of clamps) pairs.push([goalRows, clamp]);
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  let best: { goalRows: string[]; clamp: Fold; folds: number; trap: number } | null = null;
  let tried = 0;
  for (const [goalRows, clamp] of pairs) {
    if (tried++ >= MAX_PAIRS_PER_SHEET || (best && best.trap >= GOOD_ENOUGH_TRAP)) break;
    {
      const { shape: goal } = shapeFromRows(goalRows);
      const constraints: FoldConstraints = { bounds: box, lockedCreases: [clamp] };
      const path = solve(createInitialState(shape, constraints), { shape: goal }, 7);
      if (!path || path.length < MIN_FOLDS) continue;
      const a = analyzeLevel(
        {
          key: 'daily', id: 0, world: 0, name: 'daily',
          start: shape, constraints, goal: { shape: goal },
          newConcept: '', difficulty: 10, expectedFolds: path.length, designerNotes: '',
        },
        0,
        false
      );
      if (a.meanTrap < MIN_TRAP) continue;
      // Keep only the tightest combination from each sheet, so a year of
      // puzzles is a year of different papers rather than one paper wearing
      // seven different clamps.
      if (!best || a.meanTrap > best.trap) {
        best = { goalRows, clamp, folds: path.length, trap: a.meanTrap };
      }
    }
  }
  if (!best) continue;

  seen.add(key);
  puzzles.push({
    day: puzzles.length + 1,
    rows,
    goalRows: best.goalRows,
    borders: true,
    lockedCrease: { axis: best.clamp.axis, line: best.clamp.line },
    pin: null,
    folds: best.folds,
    trap: Math.round(best.trap * 100),
  });
  save();
  console.log(`${puzzles.length}/${WANT} kept (${attempts} sheets tried)  latest: ${best.folds}f ${Math.round(best.trap * 100)}%`);
}

save();
const avgF = puzzles.reduce((s, p) => s + p.folds, 0) / puzzles.length;
const avgT = puzzles.reduce((s, p) => s + p.trap, 0) / puzzles.length;
console.log(`\nwrote ${puzzles.length} puzzles to ${OUT}`);
console.log(`mean ${avgF.toFixed(2)} folds, mean trap ${avgT.toFixed(0)}%, from ${attempts} attempts`);
