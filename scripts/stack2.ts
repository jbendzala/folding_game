/**
 * Second pass: multi-rule combinations on the sheets that survived the first.
 *
 * The first pass mostly crowned single clamps, because a second constraint on
 * a ragged sheet usually removes the last route rather than merely narrowing
 * it. This one searches only combinations of two and three rules and reports
 * whatever survives, so the final chapters can carry several rules at once
 * instead of one rule and a lot of shape.
 */
import {readFileSync} from 'node:fs';
import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel} from '../src/core/analysis';
import type {Fold, FoldConstraints} from '../src/core/types';

const GOALS: Record<string,string[]> = {
  ell: ['# .','# #'], square: ['# #','# #'], bar: ['# # #'], ring: ['# # #','# . #','# # #'],
};
const sheets: {goal:string; rows:string[]}[] = JSON.parse(readFileSync(process.argv[2],'utf8'));

for (const s of sheets) {
  const {shape} = shapeFromRows(s.rows);
  const {shape: goal} = shapeFromRows(GOALS[s.goal]);
  const box = {minRow:0,maxRow:shape.height-1,minCol:0,maxCol:shape.width-1};
  const clamps: Fold[] = [];
  for (let l=0;l<shape.width-1;l++) clamps.push({axis:'vertical',line:l,moves:'lower'});
  for (let l=0;l<shape.height-1;l++) clamps.push({axis:'horizontal',line:l,moves:'lower'});
  const pins = shape.cells.filter(c=>c.row===0||c.col===0||c.row===shape.height-1||c.col===shape.width-1);

  let bestLabel = '', bestTrap = 0, bestFolds = 0, bestRules = 0;
  const consider = (label:string, rules:number, cs:FoldConstraints) => {
    const p = solve(createInitialState(shape, cs), {shape: goal}, 7);
    if (!p || p.length < 5) return;
    const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:cs,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
    // prefer more rules first, then tightness
    if (rules > bestRules || (rules === bestRules && a.meanTrap > bestTrap)) {
      bestRules = rules; bestTrap = a.meanTrap; bestFolds = p.length; bestLabel = label;
    }
  };
  for (const cl of clamps) {
    consider(`frame + clamp ${cl.axis[0]}${cl.line}`, 2, {bounds:box, lockedCreases:[cl]});
    for (const pin of pins) {
      consider(`clamp ${cl.axis[0]}${cl.line} + pin r${pin.row}c${pin.col}`, 2,
        {lockedCreases:[cl], pins:[pin]});
      consider(`frame + clamp ${cl.axis[0]}${cl.line} + pin r${pin.row}c${pin.col}`, 3,
        {bounds:box, lockedCreases:[cl], pins:[pin]});
    }
  }
  console.log(`### ${bestRules} rules  ${bestFolds}f  ${Math.round(bestTrap*100)}%  goal=${s.goal}  ${bestLabel || 'NOTHING SURVIVED'}`);
  for (const r of s.rows) console.log(`    ${r}`);
}
