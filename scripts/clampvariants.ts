/**
 * Takes an existing long level and tries clamping each grid line in turn,
 * reporting what it does to the solution.
 *
 * Past the finale, "harder" cannot mean longer: seven folds is the measured
 * ceiling of the mechanic and no arrangement of pins beat it. What is left
 * is constraint density -- the same chain with fewer legal ways to walk it.
 * A clamp is the cheapest way to add that, because unlike a pin or a block
 * it changes no cell of the sheet, so a known-reachable goal stays reachable
 * while the routes to it thin out.
 *
 *   npx tsx scripts/clampvariants.ts <levelId>
 */
import { analyzeLevel } from '../src/core/analysis';
import { createInitialState, getBounds } from '../src/core/grid';
import { solve } from '../src/core/solver';
import { allLevels } from '../src/data/levels';
import type { Fold, LevelDefinition } from '../src/core/types';

const id = Number(process.argv[2]);
const base = allLevels.find((l) => l.id === id);
if (!base) {
  console.log(`no level ${id}`);
  process.exit(1);
}

const CAP = 9;
const plainPath = solve(createInitialState(base.start, base.constraints), base.goal, CAP);
const plain = analyzeLevel(base, 2, false);
console.log(
  `=== ${base.name} (level ${id}) -- ${plainPath?.length ?? '?'} folds, ` +
    `meanTrap ${Math.round(plain.meanTrap * 100)}%`
);

const { minRow, maxRow, minCol, maxCol } = getBounds(createInitialState(base.start).cells);
const candidates: Fold[] = [];
for (let line = minCol; line < maxCol; line++) {
  candidates.push({ axis: 'vertical', line, moves: 'lower' });
}
for (let line = minRow; line < maxRow; line++) {
  candidates.push({ axis: 'horizontal', line, moves: 'lower' });
}

interface Row {
  clamp: Fold;
  folds: number;
  meanTrap: number;
}
const rows: Row[] = [];
for (const clamp of candidates) {
  const level: LevelDefinition = {
    ...base,
    constraints: {
      ...base.constraints,
      lockedCreases: [...(base.constraints?.lockedCreases ?? []), clamp],
    },
    expectedFolds: CAP,
  };
  const a = analyzeLevel(level, 0, false);
  if (a.minFolds === null) continue;
  rows.push({ clamp, folds: a.minFolds, meanTrap: a.meanTrap });
}

rows.sort((a, b) => b.folds - a.folds || b.meanTrap - a.meanTrap);
for (const r of rows.slice(0, 8)) {
  const delta = plainPath ? r.folds - plainPath.length : 0;
  console.log(
    `  clamp ${r.clamp.axis[0]}${r.clamp.line}  ${r.folds} folds ` +
      `${delta > 0 ? `(+${delta})` : '    '}  meanTrap ${Math.round(r.meanTrap * 100)}%`
  );
}
if (rows.length === 0) console.log('  (every clamp makes it unsolvable)');
