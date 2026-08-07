import type { LevelDefinition } from '../../core/types';
import { world1Levels } from './world1';
import { world2Levels } from './world2';
import { world3Levels } from './world3';
import { world4Levels } from './world4';
import { world5Levels } from './world5';
import { world6Levels } from './world6';
import { world7Levels } from './world7';
import { world8Levels } from './world8';

export const allLevels: LevelDefinition[] = [
  ...world1Levels,
  ...world2Levels,
  ...world3Levels,
  ...world4Levels,
  ...world5Levels,
  ...world6Levels,
  ...world7Levels,
  ...world8Levels,
];

export const WORLD_NAMES: Record<number, string> = {
  1: 'Paper Basics',
  2: 'First Shapes',
  3: 'Hole Algebra',
  4: 'Layer Cake',
  5: 'Strange Geometry',
  6: 'Pinned Down',
  7: 'Masterpieces',
  8: 'The Long Fold',
};

export function getLevel(id: number): LevelDefinition {
  const level = allLevels.find((l) => l.id === id);
  if (!level) throw new Error(`No level with id ${id}`);
  return level;
}
