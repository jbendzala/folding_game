import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 6 -- "Masterpieces"
 * The big recognizable silhouettes, each folded into another shape worth
 * looking at, and each carrying a second constraint now.
 */
export const world6Levels: LevelDefinition[] = [
  shapeLevel({
    id: 26,
    name: 'Arrowhead',
    world: 6,
    rows: [
      '. . # . .',
      '. # # # .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # # # .', '# # # # #', '. . # . .', '. . # . .'],
    newConcept: 'Blunt the arrow by exactly one row. Everything else survives.',
    difficulty: 8,
    expectedFolds: 1,
    designerNotes: 'The tightest single fold in the game: 94% trap, 17 of 18 openings lose.',
  }),
  shapeLevel({
    id: 27,
    name: 'Butterfly',
    world: 6,
    rows: [
      '# . . . #',
      '# # . # #',
      '. # # # .',
      '# # . # #',
      '# . . . #',
    ],
    goalRows: ['# . #', '# # #', '# . #'],
    newConcept: 'Four folds to a tiny H -- both wing gaps survive every one.',
    difficulty: 8,
    expectedFolds: 4,
    designerNotes: '63% mean trap. Patch a gap by accident and it is lost.',
  }),
  shapeLevel({
    id: 28,
    name: 'Iron Cross',
    world: 6,
    rows: [
      '. . # . .',
      '. . # . .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # .', '. # .', '# # #', '. # .', '. # .'],
    newConcept: 'Shorten one axis while the other keeps its full span.',
    difficulty: 8,
    expectedFolds: 2,
    designerNotes: 'Symmetric shape, asymmetric goal -- the symmetry is the trap.',
  }),
  shapeLevel({
    id: 29,
    name: 'Pinned Cross',
    world: 6,
    rows: [
      '. . # . .',
      '. . # . .',
      'P # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # .', '. # .', '# # #', '. # .', '. # .'],
    newConcept: 'The same cross with an arm nailed down -- the easy half is gone.',
    difficulty: 9,
    expectedFolds: 2,
    designerNotes: 'Pairs with 28: identical goal, and the route that solved it is illegal.',
  }),
  shapeLevel({
    id: 30,
    name: 'Pinned Masterpiece',
    world: 6,
    rows: [
      '. . # . .',
      '. # # # .',
      'P # # # #',
      '. # # # .',
      '. . # . .',
    ],
    goalRows: ['. # # # .', '# # # # #', '. # # # .'],
    newConcept: 'Diamond geometry, a pinned point, and one way through.',
    difficulty: 9,
    expectedFolds: 2,
    designerNotes: 'Chapter capstone before the long folds begin.',
  }),
];
