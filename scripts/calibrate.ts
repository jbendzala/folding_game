/**
 * Prints the true minimum fold count for every level, so authored
 * `expectedFolds` can be corrected in bulk after a restructure.
 *   npx tsx scripts/calibrate.ts
 */
import { createInitialState } from '../src/core/grid';
import { solve } from '../src/core/solver';
import { allLevels } from '../src/data/levels';

const CAP = 8;
for (const level of allLevels) {
  const path = solve(createInitialState(level.start, level.constraints), level.goal, CAP);
  const actual = path ? path.length : null;
  const flag =
    actual === null ? 'UNSOLVABLE' : actual === level.expectedFolds ? '' : `<- was ${level.expectedFolds}`;
  console.log(`${String(level.id).padStart(2)} ${level.name.padEnd(20)} ${String(actual).padStart(2)}  ${flag}`);
}
