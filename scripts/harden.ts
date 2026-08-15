/**
 * Finds a harder version of an existing level: a tighter goal, an added
 * constraint, or both.
 *
 * Two rules it enforces that hand-authoring kept getting wrong:
 *
 *  - A clamp on an OUTERMOST grid line is nearly free, because you can simply
 *    never fold there. Level 97 shipped with one and played easy for exactly
 *    that reason. Interior lines only.
 *  - The candidate must not reproduce a level the game already has. The cross
 *    sheet alone is used four times, and two of those turned out to be mirror
 *    images of each other.
 *
 *   npx tsx scripts/harden.ts <levelId> [minTrap]
 */
import {analyzeLevel, reachableGoals} from '../src/core/analysis';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {allLevels} from '../src/data/levels';
import type {Fold, FoldConstraints, LevelDefinition, ShapePattern} from '../src/core/types';

const id = Number(process.argv[2]);
const MIN_TRAP = Number(process.argv[3] ?? 0.7);
// Length is not difficulty: six folds at 39% is a worse puzzle than five at 75%.
// Pass a floor below the level's current length to allow that trade.
const MIN_FOLDS = process.argv[4] ? Number(process.argv[4]) : undefined;
const base = allLevels.find((l) => l.id === id)!;
const cur = analyzeLevel(base, 0, false);

const art = (s: ShapePattern) =>
  Array.from({length: s.height}, (_, r) =>
    Array.from({length: s.width}, (_, c) => (s.cells.some(x => x.row === r && x.col === c) ? '#' : '.')).join('')
  ).join('/');

/** identity of an existing level, so we never re-invent one */
const sig = (l: LevelDefinition) =>
  `${art(l.start)}|${art(l.goal.shape)}|${JSON.stringify(l.constraints ?? {})}|${l.goal.uniformDepth ?? ''}`;
const existing = new Set(allLevels.filter(l => l.id !== id).map(sig));

const W = base.start.width, H = base.start.height;
const box = {minRow: 0, maxRow: H - 1, minCol: 0, maxCol: W - 1};
// interior lines only -- an edge clamp is nearly free
const clamps: Fold[] = [];
for (let l = 1; l < W - 2; l++) clamps.push({axis: 'vertical', line: l, moves: 'lower'});
for (let l = 1; l < H - 2; l++) clamps.push({axis: 'horizontal', line: l, moves: 'lower'});
const pins = base.start.cells.filter(c =>
  c.row === 0 || c.col === 0 || c.row === H - 1 || c.col === W - 1);

const sets: [string, FoldConstraints][] = [['as-is', base.constraints ?? {}]];
for (const cl of clamps) {
  sets.push([`clamp ${cl.axis[0]}${cl.line}`, {...base.constraints, lockedCreases: [cl]}]);
  sets.push([`frame + clamp ${cl.axis[0]}${cl.line}`, {...base.constraints, bounds: box, lockedCreases: [cl]}]);
}
sets.push(['frame', {...base.constraints, bounds: box}]);
for (const p of pins.slice(0, 8)) sets.push([`pin r${p.row}c${p.col}`, {...base.constraints, pins: [p]}]);

const goals = reachableGoals(base.start, Math.min(cur.minFolds! + 2, 7), base.constraints ?? {})
  .filter(g => g.shape.cells.length >= 2);

interface Row { folds: number; trap: number; goal: string; label: string; cells: number }
const rows: Row[] = [];
for (const g of goals) {
  for (const [label, cs] of sets) {
    const p = solve(createInitialState(base.start, cs), {shape: g.shape}, 8);
    if (!p || p.length < (MIN_FOLDS ?? cur.minFolds!)) continue;
    const cand: LevelDefinition = {...base, start: base.start, constraints: cs,
      goal: {shape: g.shape}, expectedFolds: p.length};
    if (existing.has(sig(cand))) continue;
    const a = analyzeLevel(cand, 0, false);
    if (a.meanTrap < MIN_TRAP) continue;
    rows.push({folds: p.length, trap: a.meanTrap, goal: art(g.shape), label, cells: g.shape.cells.length});
  }
}
rows.sort((a, b) => b.trap - a.trap || b.folds - a.folds);
console.log(`=== ${id} ${base.name}: now ${cur.minFolds}f ${Math.round(cur.meanTrap * 100)}%`);
const seen = new Set<string>();
for (const r of rows) {
  const k = `${r.goal}|${r.label}`;
  if (seen.has(k)) continue;
  seen.add(k);
  if (seen.size > 8) break;
  console.log(`  ${r.folds}f ${Math.round(r.trap * 100)}%  goal ${r.goal} (${r.cells} cells)  ${r.label}`);
}
if (!rows.length) console.log('  (nothing harder found)');
