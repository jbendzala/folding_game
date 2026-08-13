/**
 * Hunts for the longest possible puzzles by pinning cells of levels that are
 * already long. A pin bans every fold that would move it, so the right pin
 * removes the shortest route and forces the player the long way round --
 * that is how level 44 reached seven folds, one more than its unpinned twin.
 *
 *   npx tsx scripts/hardest.ts <levelId...> [--pairs]
 */
import { analyzeLevel } from '../src/core/analysis';
import { createInitialState } from '../src/core/grid';
import { solve } from '../src/core/solver';
import { allLevels } from '../src/data/levels';
import type { CellCoord, LevelDefinition } from '../src/core/types';

const CAP = 9;
const wantPairs = process.argv.includes('--pairs');
const ids = process.argv.slice(2).filter((a) => !a.startsWith('--')).map(Number);

const key = (c: CellCoord) => `${c.row},${c.col}`;

for (const id of ids) {
  const base = allLevels.find((l) => l.id === id);
  if (!base) continue;

  const plain = solve(createInitialState(base.start), base.goal, CAP);
  console.log(
    `\n=== ${base.name} (level ${id}) -- ${plain ? plain.length : '?'} folds unpinned`
  );

  const results: { pins: CellCoord[]; folds: number }[] = [];
  for (const pin of base.start.cells) {
    const path = solve(createInitialState(base.start, { pins: [pin] }), base.goal, CAP);
    if (path) results.push({ pins: [pin], folds: path.length });
  }

  if (wantPairs) {
    // Only pair up pins that were individually interesting, or the search
    // explodes for no benefit.
    const best = results.filter((r) => r.folds >= (plain?.length ?? 0)).slice(0, 10);
    for (let i = 0; i < best.length; i++) {
      for (let j = i + 1; j < best.length; j++) {
        const pins = [best[i].pins[0], best[j].pins[0]];
        const path = solve(createInitialState(base.start, { pins }), base.goal, CAP);
        if (path) results.push({ pins, folds: path.length });
      }
    }
  }

  results.sort((a, b) => b.folds - a.folds || a.pins.length - b.pins.length);
  const seen = new Set<string>();
  let shown = 0;
  for (const r of results) {
    if (shown >= 6) break;
    const k = r.pins.map(key).join('|');
    if (seen.has(k)) continue;
    seen.add(k);
    const delta = plain ? r.folds - plain.length : 0;
    const level: LevelDefinition = {
      ...base,
      constraints: { ...base.constraints, pins: r.pins },
      expectedFolds: r.folds,
    };
    const a = analyzeLevel(level, 0, false);
    console.log(
      `  pin ${r.pins.map(key).join(' + ').padEnd(12)} ${r.folds} folds ` +
        `${delta > 0 ? `(+${delta})` : '    '}  meanTrap ${Math.round(a.meanTrap * 100)}%`
    );
    shown++;
  }
}
