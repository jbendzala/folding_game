import { applyFold, listValidFolds } from './fold';
import { createInitialState, getOccupiedPositions, normalizeToShape } from './grid';
import { checkGoal } from './goal';
import { canonicalKey, solve } from './solver';
import type { Fold, FoldState, LevelDefinition, LevelGoal, ShapePattern } from './types';

/**
 * Measured difficulty, straight from the solver -- authored `difficulty`
 * numbers are guesses, these are facts.
 *
 * The signal that matters most is `trapRate`: the fraction of legal opening
 * moves that are NOT on any shortest solution. A level with one good opening
 * out of twelve genuinely demands thought; one where half the openings work
 * plays itself no matter how many folds it takes.
 */
export interface LevelAnalysis {
  minFolds: number | null;
  /** Legal first moves available to the player. */
  openings: number;
  /** First moves that keep a shortest solution alive. */
  viableOpenings: number;
  /** First moves after which the goal is unreachable at any length (within cap). */
  deadEndOpenings: number;
  /** 1 - viable/openings: how often the obvious move betrays you. */
  trapRate: number;
  /** Distinct fold SEQUENCES of minimum length (order-sensitive, so
   * commuting folds inflate this -- compare levels, don't read absolutely). */
  minimalPaths: number;
  /**
   * Mean losing-move fraction across EVERY step of a shortest solution, not
   * just the opening. This is the metric that matters for multi-fold levels:
   * `trapRate` only judges move one, so a six-fold puzzle where every opening
   * works can still be tightly constrained later -- or genuinely mindless.
   */
  meanTrap: number;
  /** 0-10, combining length, trap rate and dead ends. */
  score: number;
}

export function analyzeLevel(
  level: LevelDefinition,
  extraCap = 2,
  /** Counting minimal paths explodes on long solutions; skip when searching. */
  countPaths = true
): LevelAnalysis {
  const start = createInitialState(level.start, level.pins);
  const shortest = solve(start, level.goal, level.expectedFolds + extraCap);
  const minFolds = shortest ? shortest.length : null;

  const openingFolds = listValidFolds(start);
  if (minFolds === null) {
    return {
      minFolds: null,
      openings: openingFolds.length,
      viableOpenings: 0,
      deadEndOpenings: openingFolds.length,
      trapRate: 1,
      minimalPaths: 0,
      meanTrap: 1,
      score: 0,
    };
  }

  let viable = 0;
  let deadEnds = 0;
  for (const fold of openingFolds) {
    const after = applyFold(start, fold);
    const onShortest = solve(after, level.goal, minFolds - 1);
    if (onShortest && onShortest.length === minFolds - 1) {
      viable++;
      continue;
    }
    // Not on a shortest path -- is it recoverable at all?
    if (solve(after, level.goal, minFolds + extraCap) === null) deadEnds++;
  }

  const trapRate = openingFolds.length > 0 ? 1 - viable / openingFolds.length : 0;
  const deadEndRate = openingFolds.length > 0 ? deadEnds / openingFolds.length : 0;
  const minimalPaths = countPaths ? countMinimalPaths(start, level.goal, minFolds) : -1;
  const meanTrap = measureMeanTrap(start, level.goal, shortest!);

  // Length and sustained constraint both count: a long unconstrained puzzle
  // is busywork, a constrained one-fold puzzle is over too fast.
  const score = Math.min(
    10,
    Math.round((minFolds * 0.9 + meanTrap * 5 + deadEndRate * 2) * 10) / 10
  );

  return {
    minFolds,
    openings: openingFolds.length,
    viableOpenings: viable,
    deadEndOpenings: deadEnds,
    trapRate,
    minimalPaths,
    meanTrap,
    score,
  };
}

/** Walks one shortest solution, measuring at each step what fraction of the
 * legal moves would leave the shortest path. */
function measureMeanTrap(start: FoldState, goal: LevelGoal, solution: readonly Fold[]): number {
  let state = start;
  let sum = 0;
  let steps = 0;

  for (let i = 0; i < solution.length; i++) {
    const remaining = solution.length - i;
    const legal = listValidFolds(state);
    if (legal.length > 0) {
      let viable = 0;
      for (const fold of legal) {
        const next = applyFold(state, fold);
        if (remaining === 1) {
          if (checkGoal(next, goal)) viable++;
        } else if (solve(next, goal, remaining - 1)?.length === remaining - 1) {
          viable++;
        }
      }
      sum += 1 - viable / legal.length;
      steps++;
    }
    state = applyFold(state, solution[i]);
  }
  return steps > 0 ? sum / steps : 0;
}

function countMinimalPaths(start: FoldState, goal: LevelGoal, depth: number): number {
  const withDepths = goal.uniformDepth !== undefined;
  const memo = new Map<string, number>();

  function walk(state: FoldState, remaining: number): number {
    if (remaining === 0) return checkGoal(state, goal) ? 1 : 0;
    const key = `${canonicalKey(state, withDepths)}#${remaining}`;
    const cached = memo.get(key);
    if (cached !== undefined) return cached;

    let total = 0;
    for (const fold of listValidFolds(state)) {
      const next = applyFold(state, fold);
      // Only descend where a solution of exactly this length still exists.
      if (remaining === 1) {
        if (checkGoal(next, goal)) total += 1;
      } else if (solve(next, goal, remaining - 1)?.length === remaining - 1) {
        total += walk(next, remaining - 1);
      }
    }
    memo.set(key, total);
    return total;
  }

  return walk(start, depth);
}

/** A silhouette reachable from some start, with how it can be reached. */
export interface ReachableGoal {
  shape: ShapePattern;
  folds: number;
  /** Set if every occupied cell has the same layer count. */
  uniformDepth?: number;
  /** Rough visual appeal, for ranking candidates during authoring. */
  appeal: number;
}

const shapeKey = (s: ShapePattern) =>
  `${s.width}x${s.height}:${s.cells.map((c) => `${c.row}.${c.col}`).join(',')}`;

/**
 * Enumerates every silhouette reachable from a start shape within `maxFolds`,
 * so goals can be discovered from what the fold algebra actually permits
 * rather than guessed and then found impossible.
 */
export function reachableGoals(
  start: ShapePattern,
  maxFolds: number,
  pins?: LevelDefinition['pins']
): ReachableGoal[] {
  const initial = createInitialState(start, pins);
  const found = new Map<string, ReachableGoal>();
  const seen = new Set<string>([canonicalKey(initial, true)]);
  let frontier: FoldState[] = [initial];

  for (let depth = 1; depth <= maxFolds; depth++) {
    const next: FoldState[] = [];
    for (const state of frontier) {
      for (const fold of listValidFolds(state)) {
        const after = applyFold(state, fold);
        const key = canonicalKey(after, true);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push(after);

        const shape = normalizeToShape(getOccupiedPositions(after));
        const counts = new Map<string, number>();
        for (const cs of after.cells) {
          const k = `${cs.position.row}:${cs.position.col}`;
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        const depths = [...counts.values()];
        const uniform = depths.every((d) => d === depths[0]) ? depths[0] : undefined;

        const sk = shapeKey(shape) + (uniform !== undefined ? `@${uniform}` : '');
        if (!found.has(sk)) {
          found.set(sk, { shape, folds: depth, uniformDepth: uniform, appeal: appealOf(shape) });
        }
      }
    }
    frontier = next;
  }
  return [...found.values()];
}

/** Prefers shapes that are non-rectangular, symmetric, and chunky enough to
 * recognize -- the qualities that make a goal worth looking at. */
function appealOf(shape: ShapePattern): number {
  const area = shape.width * shape.height;
  const filled = shape.cells.length;
  if (filled <= 1) return 0;

  const occupied = new Set(shape.cells.map((c) => `${c.row}:${c.col}`));
  const isRect = filled === area;

  let vSym = true;
  let hSym = true;
  for (const c of shape.cells) {
    if (!occupied.has(`${c.row}:${shape.width - 1 - c.col}`)) vSym = false;
    if (!occupied.has(`${shape.height - 1 - c.row}:${c.col}`)) hSym = false;
  }

  let score = 0;
  if (!isRect) score += 4; // interesting outline
  if (vSym) score += 2;
  if (hSym) score += 2;
  if (filled >= 4 && filled <= 12) score += 2; // readable at a glance
  if (shape.width >= 2 && shape.height >= 2) score += 1; // not a bare strip
  const ratio = Math.max(shape.width, shape.height) / Math.min(shape.width, shape.height);
  if (ratio <= 2.5) score += 1;
  return score;
}
