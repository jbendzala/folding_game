import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 8 -- "The Long Fold"
 * Big sheet, small target: these take five to seven folds each, and the
 * constraint holds the whole way down rather than just at move one.
 *
 * Found with scripts/longpuzzles.ts, which ranks by solution LENGTH and by
 * meanTrap (losing-move fraction across every step). The earlier search
 * ranked by visual appeal, which favoured big goals -- and a big goal sits
 * one fold from a big start, which is why those levels ended so fast.
 */
export const world8Levels: LevelDefinition[] = [
  shapeLevel({
    id: 36,
    name: 'Long Diamond',
    world: 8,
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
    newConcept: 'A whole sheet down to a narrow key shape -- five folds, none of them free.',
    difficulty: 8,
    expectedFolds: 5,
    designerNotes: 'Measured 69% mean trap across all five steps. Big shape, small target.',
  }),
  shapeLevel({
    id: 37,
    name: 'The Long Cross',
    world: 8,
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
    newConcept: 'Thirty-three cells into three -- six folds, and the last one still matters.',
    difficulty: 9,
    expectedFolds: 6,
    designerNotes: 'The L-of-three-boxes target: the longest chain in the game at 6 folds.',
  }),
  shapeLevel({
    id: 38,
    name: 'Butterfly Net',
    world: 8,
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
    newConcept: 'Six folds to a doorway -- the hole in the middle has to survive all of them.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'The best level in the game by measurement: 6 folds at 72% mean trap, '
      + '67% of openings lose. Long AND tight the whole way.',
  }),
  shapeLevel({
    id: 39,
    name: 'Wingspan',
    world: 8,
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
    newConcept: 'Same butterfly, wider target -- a different six-fold route entirely.',
    difficulty: 9,
    expectedFolds: 6,
    designerNotes: '63% mean trap. Pairs with 38: identical start, different destination.',
  }),
  shapeLevel({
    id: 40,
    name: 'The Last Fold',
    world: 8,
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
    newConcept: 'Everything you know, six folds deep, with the mirror image as the target.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Finale. Mirrors level 37 -- same sheet, opposite corner, and the fold '
      + 'sequence is not the mirror of it.',
  }),
];
