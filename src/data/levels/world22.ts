import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 22 -- Held and Turned -- one rule pair, five levels.
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
export const world22Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'world22-1',
    name: 'Held Face Down',
    rows: [
      '# . . .',
      '# # . .',
      '# # . .',
      '# # # .',
      'P # # #',
    ],
    goalRows: [
      'B #',
      '. B',
    ],
    newConcept: 'A pin holds one corner while the target asks for the far side of the paper.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '75% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world22-2',
    name: 'The Pinned Turn',
    rows: [
      '# . . .',
      '# # . .',
      '# # # P',
      '# # # #',
      '# # # .',
    ],
    goalRows: [
      '# B',
      '# #',
    ],
    newConcept: 'The pin bans the fold you wanted; the faces ban the one you settled for.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '75% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world22-3',
    name: 'Both Ways at Once',
    rows: [
      '# P # #',
      '# # # #',
      '# # # .',
      '# # # .',
      '# # # .',
    ],
    goalRows: [
      '. #',
      'B #',
    ],
    newConcept: 'Shape and face together, with a corner that will not move.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '78% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world22-4',
    name: 'Nailed Reverse',
    rows: [
      '# # # # . .',
      'P # # # . .',
      '# # # # # .',
      '# # # # . .',
    ],
    goalRows: [
      '. B',
      '# #',
    ],
    newConcept: 'Five folds around a pin, landing the right way up.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '78% mean trap over 5 folds.',
  }),
  shapeLevel({
    key: 'world22-5',
    name: 'Face of the Matter',
    rows: [
      '# # # # #',
      '# # # # #',
      'P # . # #',
      '# # . . .',
    ],
    goalRows: [
      '# B',
      'B .',
    ],
    newConcept: 'The chapter closes on the hardest pin-and-face sheet found.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '78% mean trap over 5 folds.',
  }),
];
