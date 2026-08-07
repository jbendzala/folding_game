import { applyFold, listValidFolds } from './fold';
import { getBounds, getOccupiedPositions } from './grid';
import { checkGoal } from './goal';
import type { Fold, FoldState, LevelGoal } from './types';

/**
 * A state signature good enough to dedupe a BFS frontier for silhouette +
 * anchor goals: future fold options depend only on the bounding box (pins are
 * level-constant), and goal-checking depends only on the set of distinct
 * occupied positions. For uniform-depth goals, per-position layer counts
 * matter too, so the key includes them.
 *
 * NOT valid for stack-order goals (marks): two states with identical
 * footprints and depths can differ in layer order. Extend the key before
 * using this solver there.
 */
export function canonicalKey(state: FoldState, withDepths: boolean): string {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  if (!withDepths) {
    const positions = getOccupiedPositions(state)
      .map((p) => `${p.row}:${p.col}`)
      .sort()
      .join(',');
    return `${minRow},${maxRow},${minCol},${maxCol}|${positions}`;
  }
  const counts = new Map<string, number>();
  for (const cs of state.cells) {
    const k = `${cs.position.row}:${cs.position.col}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const positions = [...counts.entries()]
    .map(([k, n]) => `${k}=${n}`)
    .sort()
    .join(',');
  return `${minRow},${maxRow},${minCol},${maxCol}|${positions}`;
}

/**
 * Breadth-first search for a shortest fold sequence that takes `start` to
 * `goal`, giving up beyond `cap` folds. Returns the fold list (empty if the
 * start already satisfies the goal), or null if unreachable within the cap.
 *
 * Used for hints ("what's my best next move from here?") and by tests to
 * verify every level is solvable in exactly its advertised fold count.
 */
/** Fewest folds that could possibly shrink `from` cells down to `to` cells
 * along one axis -- a single fold at best halves an extent. */
function foldsToShrink(from: number, to: number): number {
  let folds = 0;
  let reach = to;
  while (reach < from) {
    reach *= 2;
    folds++;
  }
  return folds;
}

/** Admissible lower bound on remaining folds: per axis, the current extent
 * must shrink to the goal's extent, and each fold can at best halve it. For
 * uniform-depth goals, each fold can also at best double the max depth. */
function lowerBound(state: FoldState, goal: LevelGoal): number {
  const { minRow, maxRow, minCol, maxCol } = getBounds(state.cells);
  const axisBound =
    foldsToShrink(maxCol - minCol + 1, goal.shape.width) +
    foldsToShrink(maxRow - minRow + 1, goal.shape.height);
  if (goal.uniformDepth === undefined) return axisBound;

  const counts = new Map<string, number>();
  for (const cs of state.cells) {
    const k = `${cs.position.row}:${cs.position.col}`;
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let maxDepth = 0;
  for (const n of counts.values()) maxDepth = Math.max(maxDepth, n);
  // foldsToShrink doubles per step either way -- reuse it for depth growth.
  const depthBound = foldsToShrink(goal.uniformDepth, maxDepth);
  return Math.max(axisBound, depthBound);
}

export function solve(start: FoldState, goal: LevelGoal, cap: number): Fold[] | null {
  if (checkGoal(start, goal)) return [];

  const withDepths = goal.uniformDepth !== undefined;
  interface Node {
    state: FoldState;
    path: Fold[];
  }
  let frontier: Node[] = [{ state: start, path: [] }];
  const seen = new Set<string>([canonicalKey(start, withDepths)]);

  for (let depth = 1; depth <= cap; depth++) {
    const next: Node[] = [];
    for (const node of frontier) {
      for (const fold of listValidFolds(node.state)) {
        const state = applyFold(node.state, fold);
        const path = [...node.path, fold];
        if (checkGoal(state, goal)) return path;

        // Branch & bound: drop states that provably can't finish under cap.
        if (depth + lowerBound(state, goal) > cap) continue;

        const key = canonicalKey(state, withDepths);
        if (seen.has(key)) continue;
        seen.add(key);
        next.push({ state, path });
      }
    }
    if (next.length === 0) return null;
    frontier = next;
  }
  return null;
}
