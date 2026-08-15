/**
 * Tries the border rule on the sheets that were too easy without it.
 *
 * The complaint about the clamped chapter was that you can fold the whole
 * sheet over and walk it to the target. That move creases at the sheet's own
 * edge so the paper translates sideways rather than collapsing, and no
 * existing rule refuses it -- pins ban a side, clamps ban a line, blocks ban
 * cells, none of them ban leaving the table. A frame fitted to the starting
 * box does.
 */
import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel} from '../src/core/analysis';
import type {FoldConstraints} from '../src/core/types';

const SHEETS: [string,string[]][] = [
  ['butterfly',['# # . . . # #','# # # . # # #','. # # # # # .','. . # # # . .','. # # # # # .','# # # . # # #','# # . . . # #']],
  ['window',['# # # # # #','# # # # # #','# # . . # #','# # . . # #','# # # # # #','# # # # # #']],
  ['cross',['. . # # # . .','. . # # # . .','# # # # # # #','# # # # # # #','# # # # # # #','. . # # # . .','. . # # # . .']],
  ['notch',['# # # # # #','# # # # # #','# # # # # #','# # # # # #','# # # # . .','# # # # . .']],
];
const GOALS: [string,string[]][] = [
  ['doorway',['# # #','# . #','# . #']],
  ['ring',['# # #','# . #','# # #']],
  ['wide',['# # # #','# . . #']],
  ['ell',['# .','# #']],
  ['square',['# #','# #']],
];

for (const [sn, rows] of SHEETS) {
  const {shape} = shapeFromRows(rows);
  const box = {minRow:0,maxRow:shape.height-1,minCol:0,maxCol:shape.width-1};
  for (const [gn, g] of GOALS) {
    const {shape:goal} = shapeFromRows(g);
    for (const pad of [0,1]) {
      const b = {minRow:-pad,maxRow:box.maxRow+pad,minCol:-pad,maxCol:box.maxCol+pad};
      const cs: FoldConstraints = {bounds:b};
      const p = solve(createInitialState(shape,cs), {shape:goal}, 8);
      if (!p) { console.log(`${sn.padEnd(9)} ${gn.padEnd(8)} pad${pad}  unsolvable`); continue; }
      const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:cs,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
      console.log(`${sn.padEnd(9)} ${gn.padEnd(8)} pad${pad}  ${p.length}f  meanTrap ${Math.round(a.meanTrap*100)}%`);
    }
  }
}
