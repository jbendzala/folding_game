/**
 * Hand-designed asymmetric sheets, checked against the targets already known
 * to be reachable at length.
 *
 * The symmetric sheets are exhausted: their one-block variants collapse into
 * a single orbit of the square's dihedral group, so they yield one puzzle,
 * not six. A sheet with no reflection symmetry gives every block and clamp
 * position a distinct puzzle, which is where the remaining variety is.
 */
import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel} from '../src/core/analysis';

const SHEETS: [string,string[]][] = [
  ['notch',    ['# # # # # #','# # # # # #','# # # # # #','# # # # # #','# # # # . .','# # # # . .']],
  ['step',     ['# # # # # #','# # # # # #','# # # # # .','# # # # . .','# # # . . .','# # . . . .']],
  ['hook',     ['# # # # # #','# . . . . #','# . . . . #','# # # # . #','. . . # . #','. . . # # #']],
  ['comb',     ['# # # # # #','# . # . # .','# # # # # #','# . # . # .','# # # # # #']],
  ['flag',     ['# # # # # #','# # # # # #','# # # # # #','# # . . . .','# # . . . .','# # . . . .']],
  ['zig',      ['# # # . . .','# # # # # .','. # # # # #','. . # # # #','. . . # # #','. . . . # #']],
  ['key',      ['# # # # # #','# . . . . .','# # # # # #','. . . . . #','# # # # # #','# . . . . .']],
  ['bigl',     ['# # . . . .','# # . . . .','# # . . . .','# # # # # #','# # # # # #','# # # # # #']],
  ['offhole',  ['# # # # # #','# . # # # #','# # # # # #','# # # . # #','# # # # # #','# # # # # #']],
  ['tee',      ['# # # # # # #','# # # # # # #','. . # # # . .','. . # # # . .','. . # # # . .']],
  ['spiral',   ['# # # # # #','# . . . . #','# . # # . #','# . # . . #','# . # # # #','# . . . . .']],
  ['wedge',    ['. . . # # #','. . # # # #','. # # # # #','# # # # # #','# # # # # .','# # # # . .']],
];
const GOALS: [string,string[]][] = [
  ['doorway', ['# # #','# . #','# . #']],
  ['ring',    ['# # #','# . #','# # #']],
  ['wide',    ['# # # #','# . . #']],
  ['ell',     ['# .','# #']],
  ['square',  ['# #','# #']],
  ['bar',     ['# # #']],
];

for (const [name, rows] of SHEETS) {
  const {shape} = shapeFromRows(rows);
  for (const [gn, g] of GOALS) {
    const {shape:goal} = shapeFromRows(g);
    const w = rows[0].split(' ').length, h = rows.length;
    const clamps: (undefined|{axis:'vertical'|'horizontal';line:number;moves:'lower'})[] = [undefined];
    for (let l=0;l<w-1;l++) clamps.push({axis:'vertical',line:l,moves:'lower'});
    for (let l=0;l<h-1;l++) clamps.push({axis:'horizontal',line:l,moves:'lower'});
    for (const clamp of clamps) {
      const cs = clamp ? {lockedCreases:[clamp]} : undefined;
      const p = solve(createInitialState(shape,cs), {shape:goal}, 8);
      if (!p || p.length < 5) continue;
      const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:cs,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
      if (a.meanTrap < 0.66) continue;
      console.log(`${name.padEnd(9)} ${gn.padEnd(8)} ${(clamp?clamp.axis[0]+clamp.line:'--').padEnd(3)} ${p.length}f  meanTrap ${Math.round(a.meanTrap*100)}%`);
    }
  }
}
