import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 4 -- "Strange Geometry"
 * Diagonal-LOOKING shapes that fold orthogonally, now with pins on the
 * asymmetric ones. Pins raise the constraint sharply where a shape has no
 * mirror to fall back on (Diamond goes 65% -> 73% mean trap) and do nothing
 * on symmetric boards, so they are placed by measurement, not decoration.
 */
export const world4Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'staircase',
    name: 'Staircase',
    rows: ['# # # #', '. # # #', '. . # #', '. . . #'],
    goalRows: ['# #', '# .', '# .'],
    newConcept: 'Three folds, and one of them has to reach past the far edge.',
    difficulty: 8,
    expectedFolds: 3,
    designerNotes: 'Was a one-fold level. 73% mean trap and the solution needs an overhang fold.',
  }),
  shapeLevel({
    key: 'pyramid',
    name: 'Pyramid',
    rows: ['. . # . .', '. # # # .', '# # # # #'],
    goalRows: ['# # #', '. # .'],
    newConcept: 'Fold the pyramid off its own edge and catch it on the way back.',
    difficulty: 8,
    expectedFolds: 3,
    designerNotes: '72% mean trap, overhang required. Was one fold.',
  }),
  shapeLevel({
    key: 'hourglass',
    name: 'Hourglass',
    rows: [
      '# # # # #',
      '. # # # .',
      '. . # . .',
      '. # # # .',
      '# # # # #',
    ],
    goalRows: ['# # #', '. # .', '# # #'],
    newConcept: 'Fold the hourglass into a smaller hourglass -- the waist has to survive.',
    difficulty: 8,
    expectedFolds: 4,
    designerNotes: 'Grown from 3x3 to 5x5 so it can hold a real solution: 4 folds, 63% mean '
      + 'trap, overhang required. Was a single fold.',
  }),
  shapeLevel({
    key: 'lightning',
    name: 'Lightning',
    rows: ['# # # .', '. . # .', '. # # #'],
    goalRows: ['# #', '# .'],
    newConcept: 'No symmetry, three folds, and the bolt has to leave the sheet to get there.',
    difficulty: 8,
    expectedFolds: 3,
    designerNotes: 'Overhang required. Was one fold.',
  }),
  shapeLevel({
    key: 'pinned-diamond',
    name: 'Pinned Diamond',
    rows: [
      '. . # . .',
      '. # # # .',
      'P # # # #',
      '. # # # .',
      '. . # . .',
    ],
    goalRows: ['# # #', '. # .'],
    newConcept: 'The diamond, with its left point nailed to the table.',
    difficulty: 7,
    expectedFolds: 4,
    designerNotes: 'Measured: the pin lifts mean trap from 65% to 73% on this shape.',
  }),
];
