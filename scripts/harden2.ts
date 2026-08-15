/**
 * Hardens a level by testing a curated goal library against constraint
 * combinations, instead of enumerating every reachable goal.
 *
 * harden.ts calls reachableGoals(), which is an exhaustive BFS over every
 * shape the sheet can fold into. That is fine on a 9-to-19 cell sheet and
 * hopeless on a 25-to-33 cell 7x7 -- it ran for thirteen minutes on level 56
 * without producing a single candidate. The goals worth shipping are not
 * exotic anyway; they are the dozen or so legible silhouettes below.
 *
 *   npx tsx scripts/harden2.ts <levelId> [minTrap] [minFolds]
 */
import {analyzeLevel} from '../src/core/analysis';
import {createInitialState} from '../src/core/grid';
import {shapeFromRows} from '../src/core/parseShape';
import {solve} from '../src/core/solver';
import {allLevels} from '../src/data/levels';
import type {Fold, FoldConstraints, LevelDefinition, ShapePattern} from '../src/core/types';

const id = Number(process.argv[2]);
const MIN_TRAP = Number(process.argv[3] ?? 0.68);
const base = allLevels.find(l => l.id === id)!;
const cur = analyzeLevel(base, 0, false);
const MIN_FOLDS = Number(process.argv[4] ?? cur.minFolds!);

const GOALS: string[][] = [
  ['# .', '# #'], ['. #', '# #'], ['# #', '# #'], ['# # #'], ['# .', '# #', '# .'],
  ['# # #', '# . #'], ['# # #', '# . #', '# # #'], ['# # #', '# . #', '# . #'],
  ['# # # #', '# . . #'], ['# # #', '# # #', '# . #'], ['# # #', '. # .', '. # .'],
  ['# . #', '# # #', '# . #'], ['. # .', '# # #', '. # .'], ['# # . .', '. . # #'],
  ['# # #', '# . .', '# . .'], ['# . . .', '# # # #'], ['# # # #', '. . # #'],
];
const art = (s: ShapePattern) =>
  Array.from({length: s.height}, (_, r) =>
    Array.from({length: s.width}, (_, c) => s.cells.some(x => x.row === r && x.col === c) ? '#' : '.').join('')
  ).join('/');
const sig = (l: LevelDefinition) =>
  `${art(l.start)}|${art(l.goal.shape)}|${JSON.stringify(l.constraints ?? {})}`;
const existing = new Set(allLevels.filter(l => l.id !== id).map(sig));

const W = base.start.width, H = base.start.height;
const sets: [string, FoldConstraints][] = [['as-is', base.constraints ?? {}]];
sets.push(['frame', {...base.constraints, bounds: {minRow: 0, maxRow: H - 1, minCol: 0, maxCol: W - 1}}]);
// interior lines only: a clamp on an outer line costs nothing (see level 97)
for (let l = 1; l < W - 2; l++) sets.push([`clamp v${l}`, {...base.constraints, lockedCreases: [{axis: 'vertical', line: l, moves: 'lower'} as Fold]}]);
for (let l = 1; l < H - 2; l++) sets.push([`clamp h${l}`, {...base.constraints, lockedCreases: [{axis: 'horizontal', line: l, moves: 'lower'} as Fold]}]);
for (const p of base.start.cells.filter(c => c.row === 0 || c.col === 0).slice(0, 4))
  sets.push([`pin r${p.row}c${p.col}`, {...base.constraints, pins: [p]}]);

const out: string[] = [];
for (const g of GOALS) {
  const {shape: goal} = shapeFromRows(g);
  for (const [label, cs] of sets) {
    const p = solve(createInitialState(base.start, cs), {shape: goal}, 8);
    if (!p || p.length < MIN_FOLDS) continue;
    const cand: LevelDefinition = {...base, constraints: cs, goal: {shape: goal}, expectedFolds: p.length};
    if (existing.has(sig(cand))) continue;
    const a = analyzeLevel(cand, 0, false);
    if (a.meanTrap < MIN_TRAP) continue;
    out.push(`  ${p.length}f ${Math.round(a.meanTrap * 100)}%  goal ${g.map(x => x.replace(/ /g, '')).join('/')}  ${label}`);
  }
}
out.sort((a, b) => b.localeCompare(a));
console.log(`=== ${id} ${base.name}: now ${cur.minFolds}f ${Math.round(cur.meanTrap * 100)}%`);
console.log(out.length ? out.slice(0, 10).join('\n') : '  (nothing harder found)');
