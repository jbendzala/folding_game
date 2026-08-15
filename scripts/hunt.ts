import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel, reachableGoals} from '../src/core/analysis';
import type {Fold} from '../src/core/types';

const ONLY = process.argv[2];
const ALL: [string, string[]][] = [
  ['pinwheel', ['# # # . .','# # # . .','# # # # #','. . # # #','. . # # #']],
  ['staircase',['# # . . .','# # # # .','. # # # #','. . # # #','. . . # #']],
  ['hourglass',['# # # # #','. # # # .','. . # . .','. # # # .','# # # # #']],
  ['plus7',    ['. . # # # . .','. . # # # . .','# # # # # # #','# # # # # # #','# # # # # # #','. . # # # . .','. . # # # . .']],
  ['ladder',   ['# # # # # #','# . . . . #','# # # # # #','# . . . . #','# # # # # #']],
  ['arrow',    ['. . # . .','. # # # .','# # # # #','. . # . .','. . # . .']],
];
const SHEETS = ONLY && ONLY !== 'all' ? ALL.filter(s=>s[0]===ONLY) : ALL;
for (const [name, rows] of SHEETS) {
  const {shape} = shapeFromRows(rows);
  const goals = reachableGoals(shape, Number(process.argv[3] ?? 7), {}).filter(g=>g.shape.cells.length>=2);
  const out: string[] = [];
  for (const g of goals) {
    if (g.folds < 4) continue;
    for (const ax of ['vertical','horizontal'] as const) for (let line=0; line<rows[0].split(' ').length-1; line++) {
      const c = {lockedCreases:[{axis:ax,line,moves:'lower'} as Fold]};
      const p = solve(createInitialState(shape,c), {shape:g.shape}, 8);
      if (!p || p.length < 5) continue;
      const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:c,goal:{shape:g.shape},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
      if (a.meanTrap < 0.66) continue;
      const g2 = Array.from({length:g.shape.height},(_,r)=>Array.from({length:g.shape.width},(_,cc)=>g.shape.cells.some(x=>x.row===r&&x.col===cc)?'#':'.').join('')).join('/');
      out.push(`  ${p.length}f ${Math.round(a.meanTrap*100)}%  clamp ${ax[0]}${line}  goal ${g2}`);
    }
  }
  out.sort((a,b)=>b.localeCompare(a));
  if (out.length) console.log(`=== ${name}\n${out.slice(0,6).join('\n')}`);
}
