/**
 * Top-end combination search: takes the three sheets long enough to sustain
 * five-plus folds and tries the rules that the final chapters have not yet
 * paired at that length -- an interior block, a thickness ceiling, and a
 * back-face target. The small sheets were checked first and none of them
 * reach five folds at all, so length at the top end has to come from these.
 */
import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel} from '../src/core/analysis';

const BUTTERFLY = ['# # . . . # #','# # # . # # #','. # # # # # .','. . # # # . .','. # # # # # .','# # # . # # #','# # . . . # #'];
const CROSS = ['. . # # # . .','. . # # # . .','# # # # # # #','# # # # # # #','# # # # # # #','. . # # # . .','. . # # # . .'];
const WINDOW = ['# # # # # #','# # # # # #','# # . . # #','# # . . # #','# # # # # #','# # # # # #'];
const GOALS = [['# # #','# . #','# . #'],['# # # #','# . . #'],['# # #','# . #','# # #'],['# .','# #'],['# #','# #'],['# # #']];

const ALL: [string,string[]][] = [['butterfly',BUTTERFLY],['cross',CROSS],['window',WINDOW]];
const sheets = process.argv[2] ? ALL.filter(s=>s[0]===process.argv[2]) : ALL;
const blockAt = (rows:string[], r:number, c:number) => rows.map((row,i)=>{
  if (i!==r) return row; const t=row.split(' '); if (t[c]!=='#') return row; t[c]='X'; return t.join(' ');
});

for (const [name, rows] of sheets) {
  const found: string[] = [];
  // one interior block, every legal position
  for (let r=1;r<rows.length-1;r++) for (let c=1;c<rows[0].split(' ').length-1;c++) {
    const v = blockAt(rows,r,c);
    if (v.join('') === rows.join('')) continue; // the cell was a hole, not paper
    const {shape, forbidden} = shapeFromRows(v);
    for (const g of GOALS) {
      const {shape:goal} = shapeFromRows(g);
      const cs = {forbidden};
      const p = solve(createInitialState(shape,cs), {shape:goal}, 8);
      if (!p || p.length < 5) continue;
      const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:cs,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
      if (a.meanTrap < 0.66) continue;
      found.push(`  ${p.length}f ${Math.round(a.meanTrap*100)}%  block r${r}c${c}  goal ${g.map(x=>x.replace(/ /g,'')).join('/')}`);
    }
  }
  // thickness ceiling
  for (const md of [4,6,8]) for (const g of GOALS) {
    const {shape} = shapeFromRows(rows);
    const {shape:goal} = shapeFromRows(g);
    const cs = {maxDepth: md};
    const p = solve(createInitialState(shape,cs), {shape:goal}, 8);
    if (!p || p.length < 5) continue;
    const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:cs,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
    if (a.meanTrap < 0.66) continue;
    found.push(`  ${p.length}f ${Math.round(a.meanTrap*100)}%  maxDepth ${md}  goal ${g.map(x=>x.replace(/ /g,'')).join('/')}`);
  }
  found.sort((a,b)=>b.localeCompare(a));
  console.log(`=== ${name}`);
  console.log(found.length ? found.slice(0,10).join('\n') : '  (nothing)');
}

/**
 * Candidates that differ only by a reflection or rotation are the SAME puzzle
 * to a player -- they solve one and the rest are its mirror. The big sheets
 * are all symmetric, so an unfiltered search reports one puzzle many times:
 * the six one-block window results were a single orbit of the square's
 * dihedral group. Anything the search offers has to be deduped by orbit
 * before it becomes a chapter.
 */
export function orbitKey(rows: string[]): string {
  let grid = rows.map((r) => r.split(' '));
  const forms: string[] = [];
  for (let i = 0; i < 4; i++) {
    forms.push(grid.map((r) => r.join('')).join('/'));
    forms.push(grid.map((r) => [...r].reverse().join('')).join('/'));
    // rotate 90 degrees
    grid = grid[0].map((_, c) => grid.map((r) => r[c]).reverse());
  }
  return forms.sort()[0];
}
