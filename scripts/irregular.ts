/**
 * Random irregular sheets, kept only if the solver says they are worth playing.
 *
 * The regular sheets have a duplication problem: they are symmetric, so their
 * variants collapse into orbits of the square's dihedral group -- the window's
 * six one-block levels turned out to be a single puzzle reflected six ways.
 * An irregular sheet has no symmetry, so every clamp and every block position
 * on it is a distinct puzzle.
 *
 * Random shapes are mostly rubbish, though: too loose, too short, or with no
 * route to any target at all. So this generates and then filters, which is the
 * same discipline the rest of the level toolchain uses -- nothing becomes a
 * level until the solver has confirmed it.
 *
 *   npx tsx scripts/irregular.ts [count] [seed]
 */
import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel} from '../src/core/analysis';
import {orbitKey} from './hunt2';

const WANT = Number(process.argv[2] ?? 400);
let seed = Number(process.argv[3] ?? 12345);
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** Grows a connected blob by random accretion -- the shapes come out ragged,
 *  which is the point; a tidy generator would rebuild the symmetric sheets. */
function blob(w: number, h: number, n: number): string[] | null {
  const cells = new Set<string>();
  let r = Math.floor(rnd() * h), c = Math.floor(rnd() * w);
  cells.add(`${r}:${c}`);
  let guard = 0;
  while (cells.size < n && guard++ < 500) {
    const list = [...cells];
    const [pr, pc] = list[Math.floor(rnd() * list.length)].split(':').map(Number);
    const d = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(rnd() * 4)];
    const nr = pr + d[0], nc = pc + d[1];
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
  // Trim empty border rows/cols so the sheet is its own bounding box.
  while (rows.length && !rows[0].includes('#')) rows.shift();
  while (rows.length && !rows[rows.length-1].includes('#')) rows.pop();
  return rows.length >= 3 ? rows : null;
}

const GOALS: [string,string[]][] = [
  ['ell',['# .','# #']],
  ['square',['# #','# #']],
  ['bar',['# # #']],
  ['ring',['# # #','# . #','# # #']],
];

const seen = new Set<string>();
let kept = 0;
for (let i = 0; i < WANT; i++) {
  const w = 5 + Math.floor(rnd() * 3), h = 5 + Math.floor(rnd() * 3);
  const rows = blob(w, h, 20 + Math.floor(rnd() * 14));
  if (!rows) continue;
  const key = orbitKey(rows);
  if (seen.has(key)) continue;
  seen.add(key);
  const {shape} = shapeFromRows(rows);
  if (shape.cells.length < 18) continue;
  for (const [gn, g] of GOALS) {
    const {shape:goal} = shapeFromRows(g);
    const p = solve(createInitialState(shape), {shape:goal}, 7);
    if (!p || p.length < 5) continue;
    const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
    if (a.meanTrap < 0.66) continue;
    kept++;
    console.log(`--- ${gn}  ${p.length}f  meanTrap ${Math.round(a.meanTrap*100)}%  cells ${shape.cells.length}`);
    for (const r of rows) console.log(`    ${r}`);
  }
}
console.log(`\n${kept} keepers from ${seen.size} distinct shapes`);
