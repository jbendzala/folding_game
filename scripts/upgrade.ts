/**
 * Finds a harder goal for a level that resolves too quickly: same sheet,
 * but a target that takes more folds and stays constrained throughout.
 *
 * Also flags goals whose solution needs an OVERHANG fold -- one where the
 * flap reaches past the far edge and the paper ends up where the sheet never
 * was. Those read as "fold it back over itself and find the shape on the
 * other side", and they are the least obvious folds in the game.
 *
 *   npx tsx scripts/upgrade.ts <levelId> [maxFolds]
 */
import { analyzeLevel, reachableGoals } from '../src/core/analysis';
import { applyFold } from '../src/core/fold';
import { createInitialState, getBounds } from '../src/core/grid';
import { solve } from '../src/core/solver';
import { allLevels } from '../src/data/levels';
import type { LevelDefinition, ShapePattern } from '../src/core/types';

const id = Number(process.argv[2]);
const maxFolds = Number(process.argv[3] ?? 5);
const base = allLevels.find((l) => l.id === id);
if (!base) {
  console.log(`no level ${id}`);
  process.exit(1);
}

function render(shape: ShapePattern): string[] {
  const filled = new Set(shape.cells.map((c) => `${c.row}:${c.col}`));
  const out: string[] = [];
  for (let r = 0; r < shape.height; r++) {
    let line = '';
    for (let c = 0; c < shape.width; c++) line += filled.has(`${r}:${c}`) ? '#' : '.';
    out.push(line);
  }
  return out;
}

/** True if any fold in the sequence sends paper past the far edge. */
function usesOverhang(level: LevelDefinition, folds: ReturnType<typeof solve>): boolean {
  if (!folds) return false;
  let state = createInitialState(level.start, level.pins);
  for (const fold of folds) {
    const before = getBounds(state.cells);
    state = applyFold(state, fold);
    const after = getBounds(state.cells);
    if (fold.axis === 'vertical') {
      if (after.maxCol > before.maxCol || after.minCol < before.minCol) return true;
    } else if (after.maxRow > before.maxRow || after.minRow < before.minRow) {
      return true;
    }
  }
  return false;
}

console.log(`=== ${base.name} (level ${id}) -- currently ${base.expectedFolds} folds`);
console.log(render(base.start).join('\n'));

const goals = reachableGoals(base.start, maxFolds, base.pins)
  .filter((g) => g.folds >= 3 && g.shape.cells.length >= 2)
  .sort((a, b) => b.folds - a.folds || b.appeal - a.appeal);

let shown = 0;
for (const goal of goals) {
  if (shown >= 6) break;
  const level: LevelDefinition = {
    ...base,
    goal:
      goal.uniformDepth !== undefined
        ? { shape: goal.shape, uniformDepth: goal.uniformDepth }
        : { shape: goal.shape },
    expectedFolds: goal.folds,
  };
  const a = analyzeLevel(level, 0, false);
  if (a.minFolds === null || a.meanTrap < 0.45) continue;

  const path = solve(createInitialState(base.start, base.pins), level.goal, a.minFolds);
  const over = usesOverhang(level, path);
  console.log(
    `\n  ${a.minFolds} FOLDS  meanTrap ${Math.round(a.meanTrap * 100)}%` +
      `${goal.uniformDepth !== undefined ? `  x${goal.uniformDepth} thick` : ''}` +
      `${over ? '  [OVERHANG]' : ''}`
  );
  for (const line of render(goal.shape)) console.log(`    ${line}`);
  shown++;
}
if (shown === 0) console.log('\n  (nothing harder found on this sheet)');
