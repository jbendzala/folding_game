import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 23 -- Clamped and Blocked -- one rule pair, five levels.
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
export const world23Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'world23-1',
    name: 'No Room',
    rows: [
      '# . . #',
      '# # X #',
      '# # # #',
      '# # # .',
      '. # # #',
      '. . # #',
    ],
    goalRows: [
      '# #',
      '# .',
      '# #',
    ],
    lockedCreases: [{ axis: 'horizontal', line: 1, moves: 'lower' }],
    newConcept: 'A blocked square inside the sheet and a clamped line across it.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '66% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world23-2',
    name: 'The Barred Line',
    rows: [
      '# # # #',
      '# X # #',
      '# # . #',
      '# # # .',
      '# # # #',
      '. . # #',
    ],
    goalRows: [
      '# #',
      '# .',
    ],
    lockedCreases: [{ axis: 'vertical', line: 1, moves: 'lower' }],
    newConcept: 'The clamp takes the line you need; the block takes the space you wanted.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '68% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world23-3',
    name: 'Around the Block',
    rows: [
      '. # . . . .',
      '. # X . . .',
      '. # . # # .',
      '# # # # # #',
      '. # # # . #',
      '. # # # . .',
    ],
    goalRows: [
      '# # #',
      '# . #',
    ],
    lockedCreases: [{ axis: 'vertical', line: 1, moves: 'lower' }],
    newConcept: 'Fold around the blocked square without using the clamped crease.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '69% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world23-4',
    name: 'Shut Both Ways',
    rows: [
      '. . . # . .',
      '. . . # . .',
      '# # # # # #',
      '# # # # . .',
      '# # . # X .',
      '# # . . . .',
    ],
    goalRows: [
      '# # #',
      '. # .',
    ],
    lockedCreases: [{ axis: 'horizontal', line: 2, moves: 'lower' }],
    newConcept: 'Two rules that each remove a route, on a sheet with few to spare.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '72% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world23-5',
    name: 'Nowhere Left',
    rows: [
      '# # # . # .',
      '# # # # # #',
      '# # # . . .',
      '# # # # X .',
      '# # # # . .',
    ],
    goalRows: [
      '# # #',
      '# . #',
    ],
    lockedCreases: [{ axis: 'vertical', line: 1, moves: 'lower' }],
    newConcept: 'Chapter close: the tightest clamp-and-block sheet found.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '73% mean trap over 5 folds.',
  }),
];
