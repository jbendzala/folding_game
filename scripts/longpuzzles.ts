/**
 * Finds LONG puzzles: big interesting start shape -> small specific goal, so
 * the solution is a chain of many folds rather than one clever one.
 *
 * The first discovery pass ranked goals by visual appeal, which favoured big
 * goals -- and a big goal sits 1-2 folds from a big start. Here the ranking
 * is minimum solution length, with small goals preferred.
 *
 *   npx tsx scripts/longpuzzles.ts [shapeName] [maxFolds]
 */
import { analyzeLevel, reachableGoals } from '../src/core/analysis';
import { shapeFromRows } from '../src/core/parseShape';
import type { LevelDefinition, ShapePattern } from '../src/core/types';

const STARTS: Record<string, string[]> = {
  butterfly: ['# . . . #', '# # . # #', '. # # # .', '# # . # #', '# . . . #'],
  diamond: ['. . # . .', '. # # # .', '# # # # #', '. # # # .', '. . # . .'],
  bigdiamond: [
    '. . . # . . .',
    '. . # # # . .',
    '. # # # # # .',
    '# # # # # # #',
    '. # # # # # .',
    '. . # # # . .',
    '. . . # . . .',
  ],
  crown: ['# . # . #', '# # # # #', '# # # # #', '# # # # #'],
  castle: ['# . # . #', '# # # # #', '# # # # #'],
  bigframe: [
    '# # # # #',
    '# . . . #',
    '# . . . #',
    '# . . . #',
    '# # # # #',
  ],
  bigplus: ['. . # . .', '. . # . .', '# # # # #', '. . # . .', '. . # . .'],
  staircase5: ['# # # # #', '. # # # #', '. . # # #', '. . . # #', '. . . . #'],
  solid5: ['# # # # #', '# # # # #', '# # # # #', '# # # # #', '# # # # #'],
  solid6: [
    '# # # # # #',
    '# # # # # #',
    '# # # # # #',
    '# # # # # #',
    '# # # # # #',
    '# # # # # #',
  ],
  hshape: ['# . #', '# . #', '# # #', '# . #', '# . #'],
  solid7: [
    '# # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
  ],
  bigbutterfly: [
    '# # . . . # #',
    '# # # . # # #',
    '. # # # # # .',
    '. . # # # . .',
    '. # # # # # .',
    '# # # . # # #',
    '# # . . . # #',
  ],
  bigcross: [
    '. . # # # . .',
    '. . # # # . .',
    '# # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
    '. . # # # . .',
    '. . # # # . .',
  ],

  // --- irregular sheets with holes: a hole is fragile, so any fold that
  // patches it loses outright. Add 'P' for a pin.
  perforated: ['# # # # # # #', '# . # . # . #', '# # # # # # #', '# . # . # . #', '# # # # # # #'],
  window: [
    '# # # # # #',
    '# # # # # #',
    '# # . . # #',
    '# # . . # #',
    '# # # # # #',
    '# # # # # #',
  ],
  swiss: [
    '# # # # # #',
    '# . # # . #',
    '# # # # # #',
    '# # # # # #',
    '# . # # . #',
    '# # # # # #',
  ],
  ringcross: [
    '. . # # # . .',
    '. # # # # # .',
    '# # . . . # #',
    '# # . # . # #',
    '# # . . . # #',
    '. # # # # # .',
    '. . # # # . .',
  ],
  pinnedcross: [
    '. . # # # . .',
    '. . # # # . .',
    'P # # # # # #',
    '# # # # # # #',
    '# # # # # # #',
    '. . # # # . .',
    '. . # # # . .',
  ],
  pinnedbutterfly: [
    'P # . . . # #',
    '# # # . # # #',
    '. # # # # # .',
    '. . # # # . .',
    '. # # # # # .',
    '# # # . # # #',
    '# # . . . # #',
  ],
  pinnedwindow: [
    'P # # # # #',
    '# # # # # #',
    '# # . . # #',
    '# # . . # #',
    '# # # # # #',
    '# # # # # #',
  ],
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
const maxFolds = Number(process.argv[3] ?? 6);

for (const name of names) {
  const rows = STARTS[name];
  if (!rows) {
    console.log(`unknown shape: ${name}`);
    continue;
  }
  const { shape: start, pins } = shapeFromRows(rows);
  console.log(
    `\n\n=== ${name.toUpperCase()} (${start.width}x${start.height}, ${start.cells.length} cells` +
      `${pins.length ? `, ${pins.length} pinned` : ''})`
  );
  console.log(render(start).join('\n'));

  const goals = reachableGoals(start, maxFolds, pins)
    // Small, specific targets -- the kind you have to work down to.
    .filter((g) => g.shape.cells.length >= 2 && g.shape.cells.length <= 8)
    // Longest solutions first: that is the whole point of this pass.
    .sort((a, b) => b.folds - a.folds || b.appeal - a.appeal);

  let shown = 0;
  for (const goal of goals) {
    if (shown >= 5) break;
    const level: LevelDefinition = {
      id: 0,
      name,
      world: 0,
      start,
      ...(pins.length > 0 ? { pins } : {}),
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
    if (a.minFolds === null) continue;
    // Sustained constraint is what makes a long puzzle a puzzle.
    if (a.meanTrap < 0.35) continue;

    console.log(
      `\n  ${a.minFolds} FOLDS  meanTrap ${Math.round(a.meanTrap * 100)}%  ` +
        `opening ${Math.round(a.trapRate * 100)}%` +
        `${goal.uniformDepth !== undefined ? `  x${goal.uniformDepth} thick` : ''}`
    );
    for (const line of render(goal.shape)) console.log(`    ${line}`);
    shown++;
  }
  if (shown === 0) console.log('\n  (nothing found)');
}
