import { getOccupiedPositions } from './grid';
import { isGoalStillReachable } from './goal';
import { solve } from './solver';
import type { FoldState, LevelGoal } from './types';

/**
 * Board positions small enough to settle with a real search rather than
 * invariants.
 *
 * This runs synchronously on every fold, so it has to stay imperceptible.
 * Measured on Butterfly Net, searching to cap 8:
 *
 *   17 cells -> 147ms      22 cells -> 438ms      33 cells -> 1890ms
 *
 * Twelve keeps it under a frame or two. Raising it would catch more dead
 * positions on the big sheets at the cost of a visible hitch mid-drag, which
 * is a bad trade for a game whose whole feel is the fold gesture. Doing better
 * means moving the search off the interaction path, not raising this number.
 */
const EXACT_BELOW_CELLS = 12;

/**
 * Fold's fold ceiling is 7, measured across every level in the game, so any
 * live position is solvable well inside this cap. Searching to 8 keeps the
 * check from ever crying dead on a position that simply needed one more fold.
 */
const SEARCH_CAP = 8;

/**
 * Whether the level is definitely lost from here.
 *
 * `isGoalStillReachable` is cheap and certain but weak -- it only knows what
 * folding can never undo (shrinking box, cell count, layers, frozen axis), so
 * it misses most genuinely dead positions. Measured on world 1: of the dead
 * opening folds, it caught 0 of 4 on Center Target and 3 of 9 on U Shape, so
 * the warning arrived several folds after the mistake.
 *
 * A real search settles it exactly, and on a small board costs almost nothing.
 * The invariants run first because when they fire they save the search
 * entirely, and above the cell limit they remain the only affordable answer.
 */
export function isDeadPosition(state: FoldState, goal: LevelGoal): boolean {
  if (!isGoalStillReachable(state, goal)) return true;
  if (getOccupiedPositions(state).length > EXACT_BELOW_CELLS) return false;
  return solve(state, goal, SEARCH_CAP) === null;
}
