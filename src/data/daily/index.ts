import { shapeFromRows } from '../../core/parseShape';
import type { LevelDefinition } from '../../core/types';
import puzzles from './sample.json';

interface DailyPuzzle {
  day: number;
  rows: string[];
  goalRows: string[];
  borders: boolean;
  lockedCrease: { axis: 'vertical' | 'horizontal'; line: number } | null;
  pin: { row: number; col: number } | null;
  folds: number;
  trap: number;
}

/**
 * The daily puzzles, generated offline and solver-verified before shipping.
 *
 * They are stored as data rather than built as level files because there will
 * eventually be a year of them: the same shapeLevel() authoring that suits a
 * hand-tuned campaign would be 365 near-identical blocks of TypeScript.
 * Everything about them is already proven by scripts/generateDaily.ts -- the
 * fold count here is the solver's exact minimum, not an estimate.
 */
const all = puzzles as DailyPuzzle[];

export const dailyCount = all.length;

/** Days since epoch, so the puzzle rolls over at local midnight. */
export function todayIndex(now = new Date()): number {
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(local.getTime() / 86400000);
}

export function dailyFor(index: number): LevelDefinition {
  const puzzle = all[((index % all.length) + all.length) % all.length];
  const { shape: start } = shapeFromRows(puzzle.rows);
  const { shape: goalShape } = shapeFromRows(puzzle.goalRows);

  return {
    key: `daily-${puzzle.day}`,
    // Daily puzzles sit outside the campaign, so they carry no id or world of
    // their own; the game screen only uses these for display.
    id: 0,
    world: ((puzzle.day - 1) % 20) + 1,
    name: `Daily #${puzzle.day}`,
    start,
    goal: { shape: goalShape },
    constraints: {
      ...(puzzle.borders
        ? { bounds: { minRow: 0, maxRow: start.height - 1, minCol: 0, maxCol: start.width - 1 } }
        : {}),
      ...(puzzle.lockedCrease
        ? { lockedCreases: [{ ...puzzle.lockedCrease, moves: 'lower' as const }] }
        : {}),
      ...(puzzle.pin ? { pins: [puzzle.pin] } : {}),
    },
    newConcept: '',
    difficulty: 10,
    expectedFolds: puzzle.folds,
    designerNotes: `Generated and solver-verified. ${puzzle.trap}% mean trap.`,
  };
}

export const todaysDaily = (): LevelDefinition => dailyFor(todayIndex());
