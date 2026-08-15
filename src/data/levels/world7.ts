import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

const H = (line: number) => ({ axis: 'horizontal' as const, line, moves: 'lower' as const });

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
      'P # # # # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. . . # . . .',
    ],
    goalRows: ['# . . .', '# # # #'],
    newConcept: 'The diamond down to a flag, with its west point pinned to the table.',
    difficulty: 8,
    expectedFolds: 5,
    designerNotes: '78% mean trap, up from 69%. The old narrow-key target ran down the '
      + "diamond's long axis, which is the axis the sheet wants to collapse along anyway; a "
      + 'target lying across it fights the natural folds instead of following them.',
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
    goalRows: ['# # #'],
    lockedCreases: [H(3)],
    newConcept: 'Thirty-three cells into a bar of three, with the middle line clamped.',
    difficulty: 9,
    expectedFolds: 5,
    designerNotes: '71% mean trap, up from 39% -- this was the loosest level in the game. '
      + 'It is one fold shorter now, which is the right trade: six folds where two thirds of '
      + 'the moves keep you on track is busywork next to five where they do not.',
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
      'P # # # # # #',
      '# # # # # # #',
      '# # # # # # #',
      '. . # # # . .',
      '. . # # # . .',
    ],
    goalRows: ['# # #', '# . .', '# . .'],
    newConcept: 'The same sheet into a big corner, with the west arm pinned down.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '80% mean trap, up from 39%. This level used to be The Long Cross with a '
      + 'mirrored target, and the note claimed the fold sequence was not its mirror -- the '
      + 'measurements disagreed: both sat at 39% and a search of every goal and constraint '
      + 'returned byte-identical results for the two. Now it differs in target, in rule and '
      + 'in route.',
  }),
];
