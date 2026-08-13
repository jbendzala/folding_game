import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Blocked squares ('X' in the level art): board cells the paper may never
 * cover. Every other rule restricts what the paper does to itself; this one
 * restricts where it is allowed to end up, so it constrains routing rather
 * than geometry -- the first rule that makes the empty board matter.
 */
export const blockedLevels: LevelDefinition[] = [
  shapeLevel({
    key: 'no-go',
    name: 'No Go',
    rows: ['X # # # #'],
    goalRows: ['# #'],
    newConcept: 'NEW: the paper may never cover a blocked square.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Folding leftward would land on the block, so only one way is open.',
  }),
  shapeLevel({
    key: 'boxed-in',
    name: 'Boxed In',
    rows: ['X # # X', '. # # .'],
    goalRows: ['# #'],
    newConcept: 'Blocks on both sides -- the sheet can only collapse inward.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'Symmetric walls, so the puzzle is which axis to work first.',
  }),
  shapeLevel({
    key: 'narrow-escape',
    name: 'Narrow Escape',
    rows: ['# # # #', '# # # #', 'X X . .'],
    goalRows: ['# #', '# #'],
    newConcept: 'The blocks sit under the sheet: fold down and the paper has nowhere to go.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: 'Teaches that a block matters even when the paper is not on it yet.',
  }),
  shapeLevel({
    key: 'blocked-pin',
    name: 'Blocked Pin',
    rows: ['P # # #', '# # # #', 'X . . .'],
    goalRows: ['# #', '# #'],
    newConcept: 'A pin holds one corner, a block guards the other. Route between them.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'Two rules pulling in different directions, which is the point.',
  }),
  shapeLevel({
    key: 'walled-garden',
    name: 'Walled Garden',
    rows: ['X # # # X', '. # # # .', '. # # # .'],
    goalRows: ['# #', '# #'],
    newConcept: 'Walls left and right, three rows deep. Every fold is a routing decision.',
    difficulty: 7,
    expectedFolds: 2,
    designerNotes: 'Chapter finale: the walls make half the natural folds illegal.',
  }),
];
