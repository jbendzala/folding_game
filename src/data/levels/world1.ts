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
    key: 'tiny-square',
    name: 'Tiny Square',
    rows: ['# #', '# *'],
    newConcept: 'Fold the paper onto the marked cell. Direction is everything.',
    difficulty: 1,
    expectedFolds: 2,
    designerNotes: 'The whole grammar in the smallest possible box.',
  }),
  singleCellLevel({
    key: 'wide-rectangle',
    name: 'Wide Rectangle',
    rows: ['* # # #', '# # # #'],
    newConcept: 'A long side needs more than one fold -- or one fold in half.',
    difficulty: 2,
    expectedFolds: 3,
    designerNotes: 'First taste of chaining.',
  }),
  singleCellLevel({
    key: 'center-target',
    name: 'Center Target',
    rows: ['# # # #', '# # * #', '# # # #', '# # # #'],
    newConcept: 'The target sits near the middle -- only one direction per axis keeps it.',
    difficulty: 3,
    expectedFolds: 4,
    designerNotes: 'First deliberate "obvious fold is wrong" trap.',
  }),
  shapeLevel({
    key: 'l-shape',
    name: 'L Shape',
    rows: ['# # #', '# . .', '# . .'],
    goalRows: ['# # #', '# . .'],
    newConcept: 'NEW: the goal is a SHAPE now, not a cell. Fold the L into a smaller L.',
    difficulty: 3,
    expectedFolds: 1,
    designerNotes: 'You must fold INTO the shape, not flatten it. 75% of openings lose.',
  }),
  shapeLevel({
    key: 'u-shape',
    name: 'U Shape',
    rows: ['# . . #', '# . . #', '# # # #'],
    goalRows: ['. #', '. #', '# #'],
    newConcept: 'Close it like a book -- the two arms meet exactly.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: '90% trap with a unique solution, and it lands at level 5.',
  }),
];
