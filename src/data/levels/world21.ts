import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 21 -- Both Sides, Boxed In -- one rule pair, five levels.
 *
 * The first twenty worlds used 15 of the 28 possible rule pairs, and twelve of
 * those worlds introduced nothing at all, which left their opening screen with
 * nothing to say. Every world from here is built on a single combination the
 * campaign has not used, so it has something to be about.
 *
 * Found by scripts/pairworld.ts and authored from its JSON rather than retyped:
 * every sheet, target and fold count below is the search's own output, and the
 * calibrator re-derives the minimum from scratch.
 */
export const world21Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'world21-1',
    name: 'Reverse Side',
    rows: [
      '# # # # # #',
      '. . . # # #',
      '. . . # # #',
    ],
    goalRows: [
      '# B',
      'B .',
    ],
    borders: true,
    newConcept: 'A framed sheet, and the target names which cells must finish face down.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '73% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world21-2',
    name: 'Inside Out',
    rows: [
      '# # # #',
      '# # # #',
      '# # # #',
      '# # # #',
      '# # # #',
    ],
    goalRows: [
      'B',
      '#',
      '#',
    ],
    borders: true,
    newConcept: 'Back faces inside a frame: the sheet cannot wander off to find them.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '75% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world21-3',
    name: 'Framed Faces',
    rows: [
      '. . . #',
      '. # # #',
      '. # # .',
      '. . # #',
      '. . # #',
      '# # # #',
    ],
    goalRows: [
      'B B',
      'B B',
      '# B',
    ],
    borders: true,
    newConcept: 'The frame refuses the easy turn; the faces refuse the easy fold.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '80% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world21-4',
    name: 'Turn and Stay',
    rows: [
      '# # # #',
      '# # # #',
      '# # # .',
      '# # # .',
      '# # # .',
    ],
    goalRows: [
      '. #',
      'B B',
    ],
    borders: true,
    newConcept: 'Five folds, and the paper has to land the right way up as well as the right shape.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '82% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world21-5',
    name: 'The Flip',
    rows: [
      '# # # . . .',
      '# # # # # .',
      '# # . . # .',
      '# . . . . .',
    ],
    goalRows: [
      'B .',
      '# #',
    ],
    borders: true,
    newConcept: 'The tightest measured level in the game: shape, faces and frame at once.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '85% mean trap over 5 folds.',
  }),
];
