import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 5 -- "Thick & Thin"
 * Thickness combined with everything else: with pins, with holes, and with
 * shapes whose silhouette alone would not pin down the answer.
 */
export const world5Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'even-strip',
    name: 'Even Strip',
    rows: ['# # # # # # # #'],
    goalRows: ['# #'],
    uniformDepth: 4,
    newConcept: 'Halve, then halve again -- thickness doubles each time.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'The accordion in miniature.',
  }),
  shapeLevel({
    key: 'quarter-fold',
    name: 'Quarter Fold',
    rows: ['# # # #', '# # # #', '# # # #', '# # # #'],
    goalRows: ['#', '#', '#', '#'],
    uniformDepth: 4,
    newConcept: 'Collapse one axis completely while the other keeps its full length.',
    difficulty: 6,
    expectedFolds: 2,
    designerNotes: '83% trap: every horizontal fold here looks like progress and loses.',
  }),
  shapeLevel({
    key: 'fold-the-banner',
    name: 'Fold the Banner',
    rows: ['P # # P', '# # # #', '# # # #', '# # # #'],
    goalRows: ['# # # #'],
    uniformDepth: 4,
    newConcept: 'Two pins and a thickness: exactly one direction is still legal.',
    difficulty: 7,
    expectedFolds: 2,
    designerNotes: 'Read the pins first, then roll the banner up.',
  }),
  shapeLevel({
    key: 'thick-corner',
    name: 'Thick Corner',
    rows: ['# # # #', '# # # #', '# # . .', '# # . .'],
    goalRows: ['# #', '# #'],
    uniformDepth: 3,
    newConcept: 'A notched sheet folded to even thickness -- the gap must be filled exactly.',
    difficulty: 7,
    expectedFolds: 2,
    designerNotes: 'Holes plus thickness: patch the notch or a column comes up short.',
  }),
  shapeLevel({
    key: 'swiss',
    name: 'Swiss',
    rows: [
      '# # # # # #',
      '# . # # . #',
      '# # # # # #',
      '# # # # # #',
      '# . # # . #',
      '# # # # # #',
    ],
    goalRows: ['#', '#'],
    uniformDepth: 16,
    newConcept: 'Four holes, and the answer is two cells sixteen sheets thick.',
    difficulty: 8,
    expectedFolds: 5,
    designerNotes: 'Every hole has to be patched exactly or a column finishes a sheet short.',
  }),
];
