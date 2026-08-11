import type { LevelDefinition } from '../../core/types';
import { world1Levels } from './world1';
import { world2Levels } from './world2';
import { world3Levels } from './world3';
import { world4Levels } from './world4';
import { world5Levels } from './world5';
import { world6Levels } from './world6';
import { world7Levels } from './world7';
import { world8Levels } from './world8';
import { world9Levels } from './world9';
import { world10Levels } from './world10';
import { world11Levels } from './world11';

export const allLevels: LevelDefinition[] = [
  ...world1Levels,
  ...world2Levels,
  ...world3Levels,
  ...world4Levels,
  ...world5Levels,
  ...world6Levels,
  ...world7Levels,
  ...world8Levels,
  ...world9Levels,
  ...world10Levels,
  ...world11Levels,
];

export const WORLD_NAMES: Record<number, string> = {
  1: 'First Folds',
  2: 'Holes & Pins',
  3: 'Layers',
  4: 'Strange Geometry',
  5: 'Thick & Thin',
  6: 'Masterpieces',
  7: 'The Long Fold',
  8: 'The Gauntlet',
  9: 'No Mercy',
  10: 'Endgame',
  11: 'Two Sides',
};

export function getLevel(id: number): LevelDefinition {
  const level = allLevels.find((l) => l.id === id);
  if (!level) throw new Error(`No level with id ${id}`);
  return level;
}
