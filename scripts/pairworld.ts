/**
 * Finds levels for a world built around ONE pair of rules.
 *
 * The campaign uses 15 of the 28 possible rule pairs, and 7 of those appear in
 * three levels or fewer. Building each new world around a single untouched
 * pair gives it a real identity -- twelve of the first twenty worlds introduce
 * nothing and their intro screen has nothing to say.
 *
 * Unlike reachableGoals(), this records what the TOP of each stack is showing,
 * so it can produce two-sided goals. That matters because TWO SIDES is the
 * most wasted rule in the game: it appears in six of the twenty unused pairs
 * and in exactly one shipped level, despite being the most distinctive thing
 * the mechanic does -- folding flips the paper, so the goal can demand which
 * face ends up looking at you.
 *
 *   npx tsx scripts/pairworld.ts faces+bounds [minTrap] [count]
 */
import { analyzeLevel } from '../src/core/analysis';
import { applyFold, listValidFolds } from '../src/core/fold';
import { createInitialState, getOccupiedPositions, getStackAt, normalizeToShape } from '../src/core/grid';
import { shapeFromRows } from '../src/core/parseShape';
import { solve } from '../src/core/solver';
import type { CellCoord, Fold, FoldConstraints, FoldState, LevelDefinition, LevelGoal } from '../src/core/types';
import { writeFileSync } from 'node:fs';
import { orbitKey } from './hunt2';

const PAIR = (process.argv[2] ?? 'faces+bounds').split('+').sort().join('+');
const MIN_TRAP = Number(process.argv[3] ?? 0.66);
const WANT = Number(process.argv[4] ?? 8);
// Late worlds must average 4.5 folds -- the difficulty guard enforces it, and
// it rejected a five-level world at 4.0 even though every level measured 81%
// or better. Tight and short is not the same as hard.
const MIN_FOLDS = Number(process.argv[6] ?? 4);
// Optional JSON dump. Levels are authored FROM this rather than retyped from
// the console: transcribing a sheet by eye once produced an unsolvable level.
const JSON_OUT = process.argv[5];

let seed = 77001;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** Ragged sheets, plus a few regular ones -- regular reads better for the
 *  two-sided goals, where the player must track faces as well as shape. */
function sheet(): string[] | null {
  const w = 4 + Math.floor(rnd() * 3);
  const h = 4 + Math.floor(rnd() * 3);
  const n = 12 + Math.floor(rnd() * 10);
  const cells = new Set<string>([`${Math.floor(rnd() * h)}:${Math.floor(rnd() * w)}`]);
  let guard = 0;
  while (cells.size < n && guard++ < 400) {
    const list = [...cells];
    const [pr, pc] = list[Math.floor(rnd() * list.length)].split(':').map(Number);
    const d = [[0, 1], [0, -1], [1, 0], [-1, 0]][Math.floor(rnd() * 4)];
    const nr = pr + d[0];
    const nc = pc + d[1];
    if (nr < 0 || nc < 0 || nr >= h || nc >= w) continue;
    cells.add(`${nr}:${nc}`);
  }
  if (cells.size < 10) return null;
  const rows: string[] = [];
  for (let y = 0; y < h; y++) {
    const t: string[] = [];
    for (let x = 0; x < w; x++) t.push(cells.has(`${y}:${x}`) ? '#' : '.');
    rows.push(t.join(' '));
  }
  while (rows.length && !rows[0].includes('#')) rows.shift();
  while (rows.length && !rows[rows.length - 1].includes('#')) rows.pop();
  return rows.length >= 3 ? rows : null;
}

/** Applies the rules this world is about. Returns null when the pair cannot be
 *  placed on this sheet (no interior line to clamp, no cell to block, etc). */
function constraintsFor(rows: string[]): { rows: string[]; constraints: FoldConstraints } | null {
  const parsed = shapeFromRows(rows);
  const shape = parsed.shape;
  const wants = (r: string) => PAIR.split('+').includes(r);
  const constraints: FoldConstraints = {};
  let outRows = rows;

  if (wants('bounds')) {
    constraints.bounds = { minRow: 0, maxRow: shape.height - 1, minCol: 0, maxCol: shape.width - 1 };
  }
  if (wants('locked')) {
    // Interior lines only: a clamp on an outer line can never be folded anyway.
    const lines: Fold[] = [];
    for (let l = 1; l < shape.width - 2; l++) lines.push({ axis: 'vertical', line: l, moves: 'lower' });
    for (let l = 1; l < shape.height - 2; l++) lines.push({ axis: 'horizontal', line: l, moves: 'lower' });
    if (!lines.length) return null;
    constraints.lockedCreases = [lines[Math.floor(rnd() * lines.length)]];
  }
  if (wants('pins')) {
    const edge = shape.cells.filter(
      (c) => c.row === 0 || c.col === 0 || c.row === shape.height - 1 || c.col === shape.width - 1
    );
    if (!edge.length) return null;
    constraints.pins = [edge[Math.floor(rnd() * edge.length)]];
  }
  if (wants('blocked')) {
    // Interior blocks only -- at the edge you simply fold the other way.
    const inner: CellCoord[] = [];
    for (let r = 1; r < shape.height - 1; r++) {
      for (let c = 1; c < shape.width - 1; c++) {
        if (!shape.cells.some((x) => x.row === r && x.col === c)) inner.push({ row: r, col: c });
      }
    }
    if (!inner.length) return null;
    constraints.forbidden = [inner[Math.floor(rnd() * inner.length)]];
  }
  if (wants('tear')) {
    constraints.maxDepth = 3 + Math.floor(rnd() * 3);
  }
  return { rows: outRows, constraints };
}

interface Candidate {
  rows: string[];
  constraints: FoldConstraints;
  goal: LevelGoal;
  folds: number;
  trap: number;
  goalArt: string[];
}

/** Every state reachable within `maxFolds`, with its silhouette, its layer
 *  depths, and which cells are showing their back face on top. */
function walk(start: FoldState, maxFolds: number): { state: FoldState; depth: number }[] {
  const out: { state: FoldState; depth: number }[] = [];
  let frontier = [start];
  for (let depth = 1; depth <= maxFolds; depth++) {
    const next: FoldState[] = [];
    for (const s of frontier) {
      for (const f of listValidFolds(s)) {
        const after = applyFold(s, f);
        next.push(after);
        out.push({ state: after, depth });
      }
    }
    frontier = next.slice(0, 400); // breadth cap: these sheets branch hard
  }
  return out;
}

const wantsFaces = PAIR.split('+').includes('faces');
const wantsThick = PAIR.split('+').includes('layers');

const kept: Candidate[] = [];
const seen = new Set<string>();
let tries = 0;

while (kept.length < WANT && tries < 700) {
  tries++;
  const rows = sheet();
  if (!rows) continue;
  const key = orbitKey(rows);
  if (seen.has(key)) continue;
  const built = constraintsFor(rows);
  if (!built) continue;

  const { shape } = shapeFromRows(built.rows);
  const initial = createInitialState(shape, built.constraints);

  let best: Candidate | null = null;
  for (const { state, depth } of walk(initial, Math.max(5, MIN_FOLDS + 1))) {
    if (depth < MIN_FOLDS) continue;
    const occupied = getOccupiedPositions(state);
    if (occupied.length < 2 || occupied.length > 9) continue;
    const goalShape = normalizeToShape(occupied);

    const minRow = Math.min(...occupied.map((c) => c.row));
    const minCol = Math.min(...occupied.map((c) => c.col));

    const goal: LevelGoal = { shape: goalShape };
    if (wantsFaces) {
      const back = goalShape.cells.filter((c) => {
        const top = getStackAt(state, { row: c.row + minRow, col: c.col + minCol })[0];
        return top && !top.faceUp;
      });
      // A two-sided goal that asks for no back faces is not a two-sided goal.
      if (!back.length || back.length === goalShape.cells.length) continue;
      goal.backCells = back;
    }
    if (wantsThick) {
      const counts = new Map<string, number>();
      for (const cs of state.cells) {
        const k = `${cs.position.row}:${cs.position.col}`;
        counts.set(k, (counts.get(k) ?? 0) + 1);
      }
      const depths = [...counts.values()];
      if (!depths.every((d) => d === depths[0])) continue;
      goal.uniformDepth = depths[0];
    }

    const path = solve(initial, goal, 7);
    if (!path || path.length < MIN_FOLDS) continue;

    const level: LevelDefinition = {
      key: 'probe', id: 0, world: 0, name: 'probe',
      start: shape, constraints: built.constraints, goal,
      newConcept: '', difficulty: 10, expectedFolds: path.length, designerNotes: '',
    };
    const a = analyzeLevel(level, 0, false);
    if (a.meanTrap < MIN_TRAP) continue;

    const backSet = new Set((goal.backCells ?? []).map((c) => `${c.row}:${c.col}`));
    const goalArt = Array.from({ length: goalShape.height }, (_, r) =>
      Array.from({ length: goalShape.width }, (_, c) =>
        !goalShape.cells.some((x) => x.row === r && x.col === c)
          ? '.'
          : backSet.has(`${r}:${c}`)
            ? 'B'
            : '#'
      ).join(' ')
    );
    if (!best || a.meanTrap > best.trap) {
      best = { rows: built.rows, constraints: built.constraints, goal, folds: path.length, trap: a.meanTrap, goalArt };
    }
  }

  if (!best) continue;
  seen.add(key);
  kept.push(best);
  const c = best.constraints;
  console.log(`\n--- ${best.folds}f  ${Math.round(best.trap * 100)}%  ${PAIR}`);
  for (const r of best.rows) console.log(`    ${r}`);
  console.log(`    goal: ${best.goalArt.join(' / ')}`);
  console.log(
    `    rules: ${[
      c.bounds ? 'borders' : '',
      c.lockedCreases ? `clamp ${c.lockedCreases[0].axis[0]}${c.lockedCreases[0].line}` : '',
      c.pins ? `pin r${c.pins[0].row}c${c.pins[0].col}` : '',
      c.forbidden ? `block r${c.forbidden[0].row}c${c.forbidden[0].col}` : '',
      c.maxDepth ? `max x${c.maxDepth}` : '',
      best.goal.uniformDepth ? `exactly x${best.goal.uniformDepth}` : '',
      best.goal.backCells ? `${best.goal.backCells.length} back faces` : '',
    ].filter(Boolean).join(', ')}`
  );
}
if (JSON_OUT) {
  writeFileSync(
    JSON_OUT,
    JSON.stringify(
      kept.map((k) => ({
        rows: k.rows,
        goalArt: k.goalArt,
        constraints: k.constraints,
        uniformDepth: k.goal.uniformDepth ?? null,
        folds: k.folds,
        trap: Math.round(k.trap * 100),
      })),
      null,
      1
    )
  );
  console.log(`\nwrote ${kept.length} candidates to ${JSON_OUT}`);
}
console.log(`\n${kept.length} candidates from ${tries} sheets for ${PAIR}`);
