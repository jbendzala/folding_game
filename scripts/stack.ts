/**
 * Stacks rules onto the irregular sheets until they beat the Endgame band.
 *
 * The generator's sheets land at five folds and 68-79% mean trap, which is
 * Endgame-equal but not past it. Past it has to come from constraint density,
 * since five to seven folds is all the mechanic has. So this tries the rules
 * in combination -- a frame, a clamp, a pin -- and keeps what survives.
 *
 * Most combinations kill the level outright: three constraints on a ragged
 * sheet usually leaves no route at all. That is expected, and it is why this
 * searches instead of assuming.
 *
 *   npx tsx scripts/stack.ts <irr.txt> [minTrap]
 */
import {readFileSync} from 'node:fs';
import {shapeFromRows} from '../src/core/parseShape';
import {createInitialState} from '../src/core/grid';
import {solve} from '../src/core/solver';
import {analyzeLevel} from '../src/core/analysis';
import type {Fold, FoldConstraints} from '../src/core/types';

const MIN_TRAP = Number(process.argv[3] ?? 0.78);
const text = readFileSync(process.argv[2], 'utf8').split('\n');

const GOALS: Record<string,string[]> = {
  ell: ['# .','# #'], square: ['# #','# #'], bar: ['# # #'], ring: ['# # #','# . #','# # #'],
};

interface Cand { goal: string; rows: string[]; trap: number }
const cands: Cand[] = [];
for (let i = 0; i < text.length; i++) {
  const m = text[i].match(/^--- (\w+)\s+(\d+)f\s+meanTrap (\d+)%/);
  if (!m) continue;
  const rows: string[] = [];
  for (let j = i+1; j < text.length && text[j].startsWith('    '); j++) rows.push(text[j].trim());
  if (rows.length) cands.push({goal: m[1], rows, trap: Number(m[3])/100});
}
cands.sort((a,b)=>b.trap-a.trap);

let shown = 0;
for (const cand of cands.slice(0, 14)) {
  const {shape} = shapeFromRows(cand.rows);
  const {shape: goal} = shapeFromRows(GOALS[cand.goal]);
  const box = {minRow:0,maxRow:shape.height-1,minCol:0,maxCol:shape.width-1};
  const clamps: Fold[] = [];
  for (let l=0;l<shape.width-1;l++) clamps.push({axis:'vertical',line:l,moves:'lower'});
  for (let l=0;l<shape.height-1;l++) clamps.push({axis:'horizontal',line:l,moves:'lower'});
  // corner-ish cells make the most legible pins
  const pins = shape.cells.filter(c =>
    (c.row===0||c.row===shape.height-1||c.col===0||c.col===shape.width-1)).slice(0,6);

  const tries: [string, FoldConstraints][] = [];
  for (const frame of [false, true]) {
    const b = frame ? {bounds: box} : {};
    for (const cl of clamps) {
      tries.push([`${frame?'frame+':''}clamp ${cl.axis[0]}${cl.line}`, {...b, lockedCreases:[cl]}]);
      for (const pin of pins) {
        tries.push([`${frame?'frame+':''}clamp ${cl.axis[0]}${cl.line}+pin r${pin.row}c${pin.col}`,
          {...b, lockedCreases:[cl], pins:[pin]}]);
      }
    }
  }
  for (const [label, cs] of tries) {
    const p = solve(createInitialState(shape, cs), {shape: goal}, 7);
    if (!p || p.length < 5) continue;
    const a = analyzeLevel({key:'p',id:0,world:0,name:'p',start:shape,constraints:cs,goal:{shape:goal},newConcept:'',difficulty:0,expectedFolds:p.length,designerNotes:''},0,false);
    if (a.meanTrap < MIN_TRAP) continue;
    console.log(`--- ${cand.goal}  ${p.length}f  meanTrap ${Math.round(a.meanTrap*100)}%  ${label}`);
    for (const r of cand.rows) console.log(`    ${r}`);
    shown++;
  }
}
console.log(`\n${shown} stacked keepers`);
