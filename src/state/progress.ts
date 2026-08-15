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

/** Total stars earned across every solved level. */
export function totalStars(progress: ProgressMap): number {
  return Object.values(progress).reduce((sum, p) => sum + (p.solved ? p.stars : 0), 0);
}

/**
 * Stars needed to open a world.
 *
 * Zero for the first three worlds -- a gate a new player can hit before they
 * understand the star system is just a wall. After that it asks for a bit
 * under half of what is theoretically available so far, so someone clearing
 * levels at two stars still walks straight through, and only someone skipping
 * levels entirely gets stopped.
 */
export function starsToUnlockWorld(world: number, levelsPerWorld = 5): number {
  if (world <= 3) return 0;
  const availableBefore = (world - 1) * levelsPerWorld * 3;
  return Math.floor(availableBefore * 0.45);
}

/** Worlds the player has enough stars for. */
export function worldUnlocked(progress: ProgressMap, world: number): boolean {
  return totalStars(progress) >= starsToUnlockWorld(world);
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

const SEEN_WORLDS_KEY = 'fold/seenWorlds/v1';

/** Worlds whose introduction has already been shown. */
export async function loadSeenWorlds(): Promise<number[]> {
  try {
    const raw = await AsyncStorage.getItem(SEEN_WORLDS_KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

export async function markWorldSeen(world: number): Promise<void> {
  try {
    const seen = await loadSeenWorlds();
    if (seen.includes(world)) return;
    await AsyncStorage.setItem(SEEN_WORLDS_KEY, JSON.stringify([...seen, world]));
  } catch {
    // Non-fatal: the intro shows again next time, which is harmless.
  }
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
