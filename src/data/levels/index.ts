import type { LevelDefinition } from '../../core/types';
import { world1Levels } from './world1';
import { world2Levels } from './world2';
import { world3Levels } from './world3';

// Worlds 4-5 land here as they're built.
export const allLevels: LevelDefinition[] = [
  ...world1Levels,
  ...world2Levels,
  ...world3Levels,
];

export function getLevel(id: number): LevelDefinition {
  const level = allLevels.find((l) => l.id === id);
  if (!level) throw new Error(`No level with id ${id}`);
  return level;
}

export { world1Levels, world2Levels, world3Levels };
