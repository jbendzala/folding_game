import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 7 -- "The Long Fold"
 * Big sheets, small targets: five and six fold chains. Folding is
 * exponentially efficient (each fold can halve an axis), so minimum
 * solutions grow only logarithmically with board size -- six folds is the
 * practical ceiling at a size that still reads on a phone.
 */
export const world7Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'long-diamond',
    name: 'Long Diamond',
    rows: [
      '. . . # . . .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # # # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. . . # . . .',
    ],
    goalRows: ['# .', '# #', '# #', '# #', '# .'],
    newConcept: 'A whole sheet down to a narrow key shape -- five folds, none free.',
    difficulty: 8,
    expectedFolds: 5,
    designerNotes: '69% mean trap across all five steps.',
  }),
  shapeLevel({
    key: 'the-long-cross',
    name: 'The Long Cross',
    rows: [
      '. . # # # . .',
      '. . # # # . .',
      '# # # # # # #',
      '# # # # # # #',
      '# # # # # # #',
      '. . # # # . .',
      '. . # # # . .',
    ],
    goalRows: ['# .', '# #'],
    newConcept: 'Thirty-three cells into three, and the last fold still matters.',
    difficulty: 9,
    expectedFolds: 6,
    designerNotes: 'The L-of-three-boxes target.',
  }),
  shapeLevel({
    key: 'butterfly-net',
    name: 'Butterfly Net',
    rows: [
      '# # . . . # #',
      '# # # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # #', '# . #', '# . #'],
    newConcept: 'Six folds to a doorway -- the gap in the middle survives all of them.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Best measured level in the game: 6 folds at 72% mean trap.',
  }),
  shapeLevel({
    key: 'wingspan',
    name: 'Wingspan',
    rows: [
      '# # . . . # #',
      '# # # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # # #', '# . . #'],
    newConcept: 'Same butterfly, wider target, a completely different six-fold route.',
    difficulty: 9,
    expectedFolds: 6,
    designerNotes: 'Pairs with 33: identical start, different destination.',
  }),
  shapeLevel({
    key: 'the-last-fold',
    name: 'The Last Fold',
    rows: [
      '. . # # # . .',
      '. . # # # . .',
      '# # # # # # #',
      '# # # # # # #',
      '# # # # # # #',
      '. . # # # . .',
      '. . # # # . .',
    ],
    goalRows: ['. #', '# #'],
    newConcept: 'The mirror of level 32 -- and the fold sequence is not its mirror.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Same sheet, opposite corner.',
  }),
];
