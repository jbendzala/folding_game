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
    id: 16,
    name: 'Staircase',
    world: 4,
    rows: ['# # # #', '. # # #', '. . # #', '. . . #'],
    goalRows: ['# # #', '# # #', '. # #', '. . #'],
    newConcept: 'Fold the stairs into themselves -- the top steps square off.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: '92% trap, unique solution.',
  }),
  shapeLevel({
    id: 17,
    name: 'Pyramid',
    world: 4,
    rows: ['. . # . .', '. # # # .', '# # # # #'],
    goalRows: ['. # # # .', '# # # # #'],
    newConcept: 'Take the peak off and the slope survives, one course shorter.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: '92% trap, unique solution.',
  }),
  shapeLevel({
    id: 18,
    name: 'Hourglass',
    world: 4,
    rows: ['# # #', '. # .', '# # #'],
    goalRows: ['# #', '# .', '# #'],
    newConcept: 'Fold it narrow, not flat -- the waist stays pinched on one side.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: 'Closing the waist is the obvious move and it loses.',
  }),
  shapeLevel({
    id: 19,
    name: 'Lightning',
    world: 4,
    rows: ['# # # .', '. . # .', '. # # #'],
    goalRows: ['# # .', '. # .', '# # #'],
    newConcept: 'No symmetry anywhere -- one fold, and only one, keeps the bolt.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: '90% trap, unique solution.',
  }),
  shapeLevel({
    id: 20,
    name: 'Pinned Diamond',
    world: 4,
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
