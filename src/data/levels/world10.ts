import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 10 -- "Endgame"
 * The hardest material the mechanic supports, found with scripts/hardest.ts,
 * which pins every cell of an already-long level and reports what it costs.
 *
 * Two ceilings worth recording. Seven folds is the maximum: a pin can force
 * one extra fold by banning the shortest route, but a SECOND pin never
 * bought another -- it only makes levels unsolvable. And thickness on a big
 * holed sheet is the last untouched combination: paper is conserved, so a
 * 32-cell sheet folding to an 8-cell ring must land exactly 4 sheets deep
 * everywhere, which no amount of eyeballing the silhouette will get you.
 */
export const world10Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'tight-net',
    name: 'Tight Net',
    rows: [
      '# # . . . # #',
      '# # # . # # #',
      '. P # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # #', '# . #', '# . #'],
    newConcept: 'The doorway, with the pin moved inboard -- every step is now a trap.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '79% mean trap: the most constrained level in the game, measured.',
  }),
  shapeLevel({
    key: 'pinned-wingspan',
    name: 'Pinned Wingspan',
    rows: [
      '# # . . . # #',
      '# P # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # # #', '# . . #'],
    newConcept: 'Six folds to the wide target, with a wing nailed near its root.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '74% mean trap. Pairs with level 34, whose solution is banned here.',
  }),
  shapeLevel({
    key: 'nailed-diamond',
    name: 'Nailed Diamond',
    rows: [
      '. . . # . . .',
      '. . # # # . .',
      '. # # # # # .',
      'P # # # # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. . . # . . .',
    ],
    goalRows: ['# .', '# #', '# #', '# #', '# .'],
    newConcept: 'The big diamond down to a key shape, with its west point nailed.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: 'A different sheet from the butterfly levels either side of it.',
  }),
  shapeLevel({
    key: 'eight-deep',
    name: 'Eight Deep',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
      ],
    goalRows: ['# #', '# #'],
    uniformDepth: 8,
    newConcept: 'Thirty-two cells into four, eight sheets deep, and the hole must vanish.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: 'The opposite of 48: here the window must be sealed perfectly, not kept.',
  }),
  shapeLevel({
    key: 'endgame',
    name: 'Endgame',
    rows: [
      '# P . . . # #',
      '# # # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # #', '# . #', '# . #'],
    newConcept: 'Seven folds. The longest solution in the game, and the last one.',
    difficulty: 10,
    expectedFolds: 7,
    designerNotes: 'Sibling of level 44 with the pin one cell along, which changes the route '
      + 'without shortening it. Only TOP-row pins force the seventh fold -- the doorway goal '
      + 'is asymmetric vertically, so a bottom pin costs nothing. Measured ceiling of the '
      + 'mechanic: no arrangement of two pins ever produced an eighth fold.',
  }),
];
