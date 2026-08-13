/**
 * Writes a measured snapshot of every level's difficulty to
 * docs/design/difficulty-snapshot.json, and diffs against whatever is
 * already there.
 *
 * The point is regression tracking across redesigns: authored `difficulty`
 * numbers are opinions, these are facts, and a level set drifts easily when
 * goals get swapped around. Run it before and after a batch of level work.
 *
 *   npx tsx scripts/snapshot.ts          # diff against the saved snapshot
 *   npx tsx scripts/snapshot.ts --write  # overwrite it with today's numbers
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { analyzeLevel } from '../src/core/analysis';
import { allLevels, WORLD_NAMES } from '../src/data/levels';

const OUT = 'docs/design/difficulty-snapshot.json';
const write = process.argv.includes('--write');

interface Row {
  id: number;
  name: string;
  world: number;
  worldName: string;
  authoredDifficulty: number;
  expectedFolds: number;
  minFolds: number | null;
  openings: number;
  viableOpenings: number;
  trapRate: number;
  meanTrap: number;
  score: number;
  mechanics: string[];
}

function mechanicsOf(level: (typeof allLevels)[number]): string[] {
  const out: string[] = [];
  const holes = level.start.cells.length < level.start.width * level.start.height;
  if (holes) out.push('holes');
  if (level.constraints?.pins?.length) out.push('pins');
  if (level.goal.uniformDepth !== undefined) out.push('layers');
  if (level.goal.anchor) out.push('anchored');
  return out;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

const rows: Row[] = allLevels.map((level) => {
  const a = analyzeLevel(level, 2, false);
  return {
    id: level.id,
    name: level.name,
    world: level.world,
    worldName: WORLD_NAMES[level.world] ?? '',
    authoredDifficulty: level.difficulty,
    expectedFolds: level.expectedFolds,
    minFolds: a.minFolds,
    openings: a.openings,
    viableOpenings: a.viableOpenings,
    trapRate: round(a.trapRate),
    meanTrap: round(a.meanTrap),
    score: a.score,
    mechanics: mechanicsOf(level),
  };
});

const summary = {
  levels: rows.length,
  meanFolds: round(rows.reduce((s, r) => s + r.expectedFolds, 0) / rows.length),
  meanTrap: round(rows.reduce((s, r) => s + r.meanTrap, 0) / rows.length),
  meanScore: round(rows.reduce((s, r) => s + r.score, 0) / rows.length),
  longest: Math.max(...rows.map((r) => r.expectedFolds)),
  combinationLevels: rows.filter((r) => r.mechanics.filter((m) => m !== 'anchored').length >= 2).length,
};

let commit = 'unknown';
try {
  commit = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
} catch {
  // not a git checkout; the snapshot is still useful without it
}

const snapshot = { takenAt: new Date().toISOString().slice(0, 10), commit, summary, levels: rows };

if (existsSync(OUT)) {
  const prev = JSON.parse(readFileSync(OUT, 'utf8')) as typeof snapshot;
  console.log(`comparing against snapshot from ${prev.takenAt} (${prev.commit})\n`);
  const byId = new Map(prev.levels.map((r) => [r.id, r]));
  let changed = 0;
  for (const row of rows) {
    const old = byId.get(row.id);
    if (!old) {
      console.log(`  + ${row.id} ${row.name} (new)`);
      changed++;
      continue;
    }
    const diffs: string[] = [];
    if (old.name !== row.name) diffs.push(`name ${old.name} -> ${row.name}`);
    if (old.expectedFolds !== row.expectedFolds)
      diffs.push(`folds ${old.expectedFolds} -> ${row.expectedFolds}`);
    if (Math.abs(old.meanTrap - row.meanTrap) > 0.02)
      diffs.push(`meanTrap ${Math.round(old.meanTrap * 100)}% -> ${Math.round(row.meanTrap * 100)}%`);
    if (diffs.length) {
      console.log(`  ~ ${row.id} ${row.name}: ${diffs.join(', ')}`);
      changed++;
    }
  }
  for (const old of prev.levels) {
    if (!rows.some((r) => r.id === old.id)) {
      console.log(`  - ${old.id} ${old.name} (gone)`);
      changed++;
    }
  }
  if (changed === 0) console.log('  no changes');
  console.log(
    `\n  summary then: ${prev.summary.levels} levels, mean ${prev.summary.meanFolds} folds, ` +
      `mean trap ${Math.round(prev.summary.meanTrap * 100)}%`
  );
}

console.log(
  `\n  summary now:  ${summary.levels} levels, mean ${summary.meanFolds} folds, ` +
    `mean trap ${Math.round(summary.meanTrap * 100)}%, longest ${summary.longest}, ` +
    `${summary.combinationLevels} combination levels`
);

if (write) {
  writeFileSync(OUT, JSON.stringify(snapshot, null, 2) + '\n');
  console.log(`\nwrote ${OUT}`);
} else if (!existsSync(OUT)) {
  console.log('\n(no snapshot on disk -- run with --write to create one)');
}
