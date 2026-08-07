/**
 * Difficulty report for every level, measured by the solver.
 *   npx tsx scripts/analyze.ts
 */
import { analyzeLevel } from '../src/core/analysis';
import { allLevels, WORLD_NAMES } from '../src/data/levels';

const pct = (n: number) => `${Math.round(n * 100)}%`.padStart(4);

let world = -1;
console.log('  id  name              folds  openings  viable  dead  trap  paths  score  rated');
for (const level of allLevels) {
  if (level.world !== world) {
    world = level.world;
    console.log(`\n-- WORLD ${world}: ${WORLD_NAMES[world]}`);
  }
  const a = analyzeLevel(level);
  const flag = a.score < 4 ? '  <- soft' : a.score >= 7 ? '  <- hard' : '';
  console.log(
    `  ${String(level.id).padStart(2)}  ${level.name.padEnd(17)}` +
      `${String(a.minFolds).padStart(4)}  ${String(a.openings).padStart(8)}  ` +
      `${String(a.viableOpenings).padStart(6)}  ${String(a.deadEndOpenings).padStart(4)}  ` +
      `${pct(a.trapRate)}  ${String(a.minimalPaths).padStart(5)}  ` +
      `${String(a.score).padStart(5)}  ${String(level.difficulty).padStart(5)}${flag}`
  );
}
