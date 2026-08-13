import type { LevelDefinition } from '../../core/types';
import { allLevels, CHAPTERS, WORLD_NAMES } from './curriculum';

export { allLevels, CHAPTERS, WORLD_NAMES };

export function getLevel(id: number): LevelDefinition {
  const level = allLevels.find((l) => l.id === id);
  if (!level) throw new Error(`No level with id ${id}`);
  return level;
}
