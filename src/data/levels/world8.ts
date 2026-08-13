import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 8 -- "The Gauntlet"
 * Irregular sheets riddled with holes, targets that are themselves holed,
 * pins banning the easy routes. A hole is fragile in one direction only:
 * paper folded onto it patches it permanently, and no later fold reopens it,
 * so every fold has to be checked twice.
 */
export const world8Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'perforated',
    name: 'Perforated',
    rows: [
      '# # # # # # #',
      '# . # . # . #',
      '# # # # # # #',
      '# . # . # . #',
      '# # # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'Six holes in, one hole out. Which one survives is the puzzle.',
    difficulty: 9,
    expectedFolds: 5,
    designerNotes: '62% mean trap.',
  }),
  shapeLevel({
    key: 'the-window',
    name: 'The Window',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'Thirty-two cells to a ring, and the window lives through all six folds.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'One careless fold seals the window and it is over.',
  }),
  shapeLevel({
    key: 'half-window',
    name: 'Half Window',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# # #', '# . #'],
    newConcept: 'The same sheet, a shallower ring -- and it is harder, not easier.',
    difficulty: 9,
    expectedFolds: 5,
    designerNotes: '77% mean trap, the tightest of the window family. Replaced a 1-fold '
      + 'level that the length guard correctly rejected from a finale chapter.',
  }),
  shapeLevel({
    key: 'pinned-frame',
    name: 'Pinned Frame',
    rows: ['P # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# #'],
    newConcept: 'The frame with a corner nailed down: its natural route is banned.',
    difficulty: 9,
    expectedFolds: 3,
    designerNotes: 'Pin plus enclosed hole.',
  }),
  shapeLevel({
    key: 'nailed-window',
    name: 'Nailed Window',
    rows: [
      'P # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# . #', '# # #', '# # #'],
    newConcept: 'The pin removes the natural route and the window still has to live.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '74% mean trap -- the most constrained long level in the game.',
  }),
];
