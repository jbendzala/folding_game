import type { LevelDefinition } from '../../core/types';
import { world1Levels } from './world1';

// Worlds 2-5 land here as they're built: world2Levels, world3Levels, ...
export const allLevels: LevelDefinition[] = [...world1Levels];

export function getLevel(id: number): LevelDefinition {
  const level = allLevels.find((l) => l.id === id);
  if (!level) throw new Error(`No level with id ${id}`);
  return level;
}

export { world1Levels };
