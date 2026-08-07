import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LevelDefinition } from '../core/types';

// v3: ~a dozen levels kept their id but became different puzzles (Diamond,
// Frame, Staircase, Pyramid, Lightning, L, T...) when the 1x1 goals were
// replaced with real silhouettes. Carrying their stars over would mark
// unplayed puzzles as finished, so pre-release progress resets again.
const STORAGE_KEY = 'fold/progress/v3';

export interface LevelProgress {
  solved: boolean;
  /** Fewest folds this level was ever solved in. */
  bestFolds: number;
  /** 1-3, derived from bestFolds vs the level's expectedFolds. */
  stars: number;
}

export type ProgressMap = Record<number, LevelProgress>;

/** 3 stars = optimal, 2 = close, 1 = solved at all. */
export function starsFor(level: LevelDefinition, folds: number): number {
  if (folds <= level.expectedFolds) return 3;
  if (folds <= level.expectedFolds + 2) return 2;
  return 1;
}

export function recordSolve(
  progress: ProgressMap,
  level: LevelDefinition,
  folds: number
): ProgressMap {
  const prev = progress[level.id];
  const bestFolds = prev ? Math.min(prev.bestFolds, folds) : folds;
  return {
    ...progress,
    [level.id]: { solved: true, bestFolds, stars: starsFor(level, bestFolds) },
  };
}

/** Highest level id the player may open: everything solved, plus the next one. */
export function highestUnlocked(progress: ProgressMap, levelIds: number[]): number {
  let unlocked = levelIds[0] ?? 1;
  for (const id of levelIds) {
    if (progress[id]?.solved) unlocked = Math.max(unlocked, id + 1);
  }
  return unlocked;
}

export async function loadProgress(): Promise<ProgressMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

export async function saveProgress(progress: ProgressMap): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Non-fatal: progress just won't survive the session.
  }
}
