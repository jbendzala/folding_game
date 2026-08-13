/**
 * Turns an existing level into a combination level by pinning a cell, and
 * reports what each pin does to it. A pin bans every fold that would move
 * it, so the right pin removes the intended solution and forces a longer or
 * trickier route -- the wrong one makes the level unsolvable.
 *
 *   npx tsx scripts/pinvariants.ts <levelId> [--depth N]
 */
import { analyzeLevel } from '../src/core/analysis';
import { allLevels } from '../src/data/levels';
import type { CellCoord, LevelDefinition } from '../src/core/types';

const id = Number(process.argv[2]);
const depthArg = process.argv.indexOf('--depth');
const uniformDepth = depthArg > 0 ? Number(process.argv[depthArg + 1]) : undefined;

const base = allLevels.find((l) => l.id === id);
if (!base) {
  console.log(`no level ${id}`);
  process.exit(1);
}

const goal =
  uniformDepth !== undefined ? { ...base.goal, uniformDepth } : base.goal;

if (uniformDepth !== undefined) {
  const need = goal.shape.cells.length * uniformDepth;
  if (need !== base.start.cells.length) {
    console.log(
      `x${uniformDepth} needs ${need} cells, shape has ${base.start.cells.length} -- paper is conserved`
    );
    process.exit(1);
  }
}

console.log(`=== ${base.name} (level ${id})`);
const plain = analyzeLevel({ ...base, goal, constraints: undefined }, 3, false);
console.log(
  `  no pin: ${plain.minFolds} folds, meanTrap ${Math.round(plain.meanTrap * 100)}%` +
    `${uniformDepth !== undefined ? `  (x${uniformDepth} thick)` : ''}`
);

interface Row {
  pin: CellCoord;
  folds: number;
  meanTrap: number;
}
const rows: Row[] = [];
for (const pin of base.start.cells) {
  const level: LevelDefinition = {
    ...base,
    goal,
    constraints: { ...base.constraints, pins: [pin] },
    expectedFolds: 10,
  };
  const a = analyzeLevel(level, 0, false);
  if (a.minFolds === null) continue;
  rows.push({ pin, folds: a.minFolds, meanTrap: a.meanTrap });
}

// Longest first, then most constrained: a pin that adds a fold is doing real
// work, one that changes nothing is decoration.
rows.sort((a, b) => b.folds - a.folds || b.meanTrap - a.meanTrap);
for (const r of rows.slice(0, 12)) {
  const delta = plain.minFolds !== null ? r.folds - plain.minFolds : 0;
  console.log(
    `  pin (${r.pin.row},${r.pin.col}): ${r.folds} folds ${delta > 0 ? `(+${delta})` : '     '}` +
      `  meanTrap ${Math.round(r.meanTrap * 100)}%`
  );
}
if (rows.length === 0) console.log('  (no pin leaves it solvable)');
