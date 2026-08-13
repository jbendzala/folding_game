/**
 * Finds hard goals for a sheet that carries constraints -- clamps, blocks, a
 * tear limit -- which the other discovery scripts ignore.
 *
 * The teaching chapters for the new rules came out at one and two folds each,
 * because a rule is cheap to demonstrate and expensive to make bite. This
 * searches the same sheets for targets that take real work.
 *
 *   npx tsx scripts/constrained.ts "# # # #,# # # #" --lock v1 --max 6
 *   npx tsx scripts/constrained.ts "X # # # #,. # # # #" --max 5
 */
import { analyzeLevel, reachableGoals } from '../src/core/analysis';
import { shapeFromRows } from '../src/core/parseShape';
import type { Fold, FoldConstraints, LevelDefinition, ShapePattern } from '../src/core/types';

const rows = (process.argv[2] ?? '# # # #').split(',');
const arg = (flag: string) => {
  const i = process.argv.indexOf(flag);
  return i > 0 ? process.argv[i + 1] : undefined;
};
const maxFolds = Number(arg('--max') ?? 5);
const maxDepth = arg('--depth') ? Number(arg('--depth')) : undefined;
// --lock v1,h2  ->  vertical line 1 and horizontal line 2
const lockedCreases: Fold[] = (arg('--lock') ?? '')
  .split(',')
  .filter(Boolean)
  .map((s) => ({
    axis: s[0] === 'v' ? ('vertical' as const) : ('horizontal' as const),
    line: Number(s.slice(1)),
    moves: 'lower' as const,
  }));

const { shape: start, pins, forbidden } = shapeFromRows(rows);
const constraints: FoldConstraints = {
  ...(pins.length ? { pins } : {}),
  ...(forbidden.length ? { forbidden } : {}),
  ...(lockedCreases.length ? { lockedCreases } : {}),
  ...(maxDepth !== undefined ? { maxDepth } : {}),
};

function render(shape: ShapePattern, backCells: { row: number; col: number }[] = []): string[] {
  const filled = new Set(shape.cells.map((c) => `${c.row}:${c.col}`));
  const back = new Set(backCells.map((c) => `${c.row}:${c.col}`));
  const out: string[] = [];
  for (let r = 0; r < shape.height; r++) {
    let line = '';
    for (let c = 0; c < shape.width; c++) {
      const k = `${r}:${c}`;
      line += !filled.has(k) ? '.' : back.has(k) ? 'B' : '#';
    }
    out.push(line);
  }
  return out;
}

console.log(`=== ${start.width}x${start.height}, ${start.cells.length} cells`);
console.log(render(start).join('\n'));
console.log(`constraints: ${JSON.stringify(constraints)}\n`);

const goals = reachableGoals(start, maxFolds, constraints)
  .filter((g) => g.shape.cells.length >= 2)
  .sort((a, b) => b.folds - a.folds || b.appeal - a.appeal);

let shown = 0;
for (const goal of goals) {
  if (shown >= 6) break;
  const level: LevelDefinition = {
    key: 'probe',
    id: 0,
    name: 'probe',
    world: 0,
    start,
    constraints,
    goal:
      goal.uniformDepth !== undefined
        ? { shape: goal.shape, uniformDepth: goal.uniformDepth }
        : { shape: goal.shape },
    newConcept: '',
    difficulty: 0,
    expectedFolds: goal.folds,
    designerNotes: '',
  };
  const a = analyzeLevel(level, 0, false);
  if (a.minFolds === null || a.minFolds < 2 || a.meanTrap < 0.4) continue;
  console.log(
    `  ${a.minFolds} folds  meanTrap ${Math.round(a.meanTrap * 100)}%` +
      `${goal.uniformDepth !== undefined ? `  x${goal.uniformDepth} thick` : ''}`
  );
  for (const line of render(goal.shape)) console.log(`    ${line}`);
  console.log();
  shown++;
}
if (shown === 0) console.log('  (nothing long and constrained found)');
