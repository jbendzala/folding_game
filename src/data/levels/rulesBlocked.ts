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
    key: 'blocked-wall',
    name: 'Blocked Wall',
    rows: ['X # # # # #', '. # # # # #', '. # # # # #'],
    goalRows: ['# # # #'],
    newConcept: 'A wall down one side, and the sheet has to come apart around it.',
    difficulty: 8,
    expectedFolds: 3,
    designerNotes: 'Three folds at 54% mean trap -- the block is doing real work here, '
      + 'not just removing one opening.',
  }),
  shapeLevel({
    key: 'blocked-column',
    name: 'Blocked Column',
    rows: ['X # # # # #', '. # # # # #', '. # # # # #'],
    goalRows: ['#', '#', '#'],
    uniformDepth: 5,
    newConcept: 'Past the wall and down to a single column, five sheets thick.',
    difficulty: 9,
    expectedFolds: 3,
    designerNotes: 'Chapter finale: 61% mean trap, and the wall bans the obvious collapse.',
  }),
];
