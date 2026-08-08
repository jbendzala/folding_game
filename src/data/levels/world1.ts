import type { LevelDefinition } from '../../core/types';
import { shapeLevel, singleCellLevel } from './helpers';

/**
 * Chapter 1 -- "First Folds"
 * Fold grammar, then straight into shape goals. The old version spent five
 * levels on rectangles alone; measurement showed the game stopped teaching
 * at level 16 and then repeated itself for 25 levels, so every teaching
 * chapter here is compressed to make room for combinations.
 */
export const world1Levels: LevelDefinition[] = [
  singleCellLevel({
    id: 1,
    name: 'Tiny Square',
    world: 1,
    rows: ['# #', '# *'],
    newConcept: 'Fold the paper onto the marked cell. Direction is everything.',
    difficulty: 1,
    expectedFolds: 2,
    designerNotes: 'The whole grammar in the smallest possible box.',
  }),
  singleCellLevel({
    id: 2,
    name: 'Wide Rectangle',
    world: 1,
    rows: ['* # # #', '# # # #'],
    newConcept: 'A long side needs more than one fold -- or one fold in half.',
    difficulty: 2,
    expectedFolds: 3,
    designerNotes: 'First taste of chaining.',
  }),
  singleCellLevel({
    id: 3,
    name: 'Center Target',
    world: 1,
    rows: ['# # # #', '# # * #', '# # # #', '# # # #'],
    newConcept: 'The target sits near the middle -- only one direction per axis keeps it.',
    difficulty: 3,
    expectedFolds: 4,
    designerNotes: 'First deliberate "obvious fold is wrong" trap.',
  }),
  shapeLevel({
    id: 4,
    name: 'L Shape',
    world: 1,
    rows: ['# # #', '# . .', '# . .'],
    goalRows: ['# # #', '# . .'],
    newConcept: 'NEW: the goal is a SHAPE now, not a cell. Fold the L into a smaller L.',
    difficulty: 3,
    expectedFolds: 1,
    designerNotes: 'You must fold INTO the shape, not flatten it. 75% of openings lose.',
  }),
  shapeLevel({
    id: 5,
    name: 'U Shape',
    world: 1,
    rows: ['# . . #', '# . . #', '# # # #'],
    goalRows: ['. #', '. #', '# #'],
    newConcept: 'Close it like a book -- the two arms meet exactly.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: '90% trap with a unique solution, and it lands at level 5.',
  }),
];
