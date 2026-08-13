/**
 * Goal discovery: for each candidate start shape, enumerate every silhouette
 * the fold algebra can actually reach, rank by visual appeal, and measure how
 * hard each one is to hit. Authoring tool -- run it, read it, pick goals.
 *   npx tsx scripts/discover.ts [shapeName]
 */
import { analyzeLevel, reachableGoals } from '../src/core/analysis';
import { shapeFromRows } from '../src/core/parseShape';
import type { LevelDefinition, ShapePattern } from '../src/core/types';

const STARTS: Record<string, string[]> = {
  diamond: ['. . # . .', '. # # # .', '# # # # #', '. # # # .', '. . # . .'],
  pyramid: ['. . # . .', '. # # # .', '# # # # #'],
  staircase: ['# # # #', '. # # #', '. . # #', '. . . #'],
  plus: ['. # .', '# # #', '. # .'],
  frame: ['# # # #', '# . . #', '# . . #', '# # # #'],
  tshape: ['# # #', '. # .', '. # .'],
  hourglass: ['# # #', '. # .', '# # #'],
  lightning: ['# # # .', '. . # .', '. # # #'],
  bigplus: ['. . # . .', '. . # . .', '# # # # #', '. . # . .', '. . # . .'],
  butterfly: ['# . . . #', '# # . # #', '. # # # .', '# # . # #', '# . . . #'],
  arrow: ['. . # . .', '. # # # .', '# # # # #', '. . # . .', '. . # . .'],
  chunky: ['# # # # #', '# # # # #', '# # # # #'],
  lshape: ['# # #', '# . .', '# . .'],
  zigzag: ['# # . .', '. # # .', '. . # #'],
  cross5: ['. # # # .', '# # # # #', '# # # # #', '# # # # #', '. # # # .'],
};

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

const names = process.argv[2] ? [process.argv[2]] : Object.keys(STARTS);

for (const name of names) {
  const rows = STARTS[name];
  if (!rows) {
    console.log(`unknown shape: ${name}`);
    continue;
  }
  const { shape: start } = shapeFromRows(rows);
  console.log(`\n\n=== ${name.toUpperCase()} (${start.width}x${start.height}, ${start.cells.length} cells)`);
  console.log(render(start).join('\n'));

  const goals = reachableGoals(start, 4)
    // Worth looking at, and not a trivial single cell.
    .filter((g) => g.appeal >= 6 && g.shape.cells.length >= 3)
    .sort((a, b) => b.appeal - a.appeal || a.folds - b.folds);

  const seen = new Set<string>();
  let shown = 0;
  for (const goal of goals) {
    if (shown >= 6) break;
    const key = render(goal.shape).join('|');
    if (seen.has(key)) continue;
    seen.add(key);

    const level: LevelDefinition = {
      key: 'probe',
      id: 0,
      name: name,
      world: 0,
      start,
      goal:
        goal.uniformDepth !== undefined
          ? { shape: goal.shape, uniformDepth: goal.uniformDepth }
          : { shape: goal.shape },
      newConcept: '',
      difficulty: 0,
      expectedFolds: goal.folds,
      designerNotes: '',
    };
    const a = analyzeLevel(level);
    // Only surface goals that actually demand something of the player.
    if (a.trapRate < 0.5) continue;

    console.log(
      `\n  goal (${goal.folds} folds, appeal ${goal.appeal}` +
        `${goal.uniformDepth !== undefined ? `, x${goal.uniformDepth} thick` : ''}) ` +
        `trap ${Math.round(a.trapRate * 100)}%  paths ${a.minimalPaths}  score ${a.score}`
    );
    for (const line of render(goal.shape)) console.log(`    ${line}`);
    shown++;
  }
  if (shown === 0) console.log('\n  (no goals above the difficulty threshold)');
}
