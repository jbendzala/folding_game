import AsyncStorage from '@react-native-async-storage/async-storage';
import type { LevelDefinition } from '../core/types';

// v5: progress is now saved against each level's stable KEY rather than its
// position, so rearranging the curriculum no longer wipes what was solved.
// The one-time cost is this reset, because old entries were keyed by id.
const STORAGE_KEY = 'fold/progress/v5';

export interface LevelProgress {
  solved: boolean;
  /** Fewest folds this level was ever solved in. */
  bestFolds: number;
  /** 1-3, derived from bestFolds vs the level's expectedFolds. */
  stars: number;
}

/** Keyed by LevelDefinition.key, never by id. */
export type ProgressMap = Record<string, LevelProgress>;

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
  const prev = progress[level.key];
  const bestFolds = prev ? Math.min(prev.bestFolds, folds) : folds;
  return {
    ...progress,
    [level.key]: { solved: true, bestFolds, stars: starsFor(level, bestFolds) },
  };
}

/** Highest level id the player may open: everything solved, plus the next one. */
export function highestUnlocked(
  progress: ProgressMap,
  levels: { id: number; key: string }[]
): number {
  let unlocked = levels[0]?.id ?? 1;
  for (const level of levels) {
    if (progress[level.key]?.solved) unlocked = Math.max(unlocked, level.id + 1);
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
