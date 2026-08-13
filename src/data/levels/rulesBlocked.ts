import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Blocked squares ('X' in the level art): board cells the paper may never
 * cover. Every other rule restricts what the paper does to itself; this one
 * restricts where it is allowed to end up.
 *
 * Placement is everything, and the first version of this chapter got it
 * wrong. A block beside the sheet only deletes one direction -- you fold the
 * other way and the rule never bites. A block INSIDE the sheet is a
 * different animal: a hole that can never be covered, where an ordinary hole
 * can always be patched. Every fold then has to be checked against it, and
 * the measured difficulty roughly doubles (3-4 folds at 62-68% mean trap,
 * against 1-3 folds at 54% for edge placement).
 */
export const blockedLevels: LevelDefinition[] = [
  shapeLevel({
    key: 'no-go',
    name: 'No Go',
    rows: ['# # # # #', '# # X # #', '# # # # #'],
    goalRows: ['# # #', '# # #'],
    newConcept: 'NEW: a blocked square. Paper may never cover it, so it never fills in.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'The block sits inside the sheet, so it is a hole you cannot patch -- '
      + 'and the target is solid, so the sheet has to close up around it.',
  }),
  shapeLevel({
    key: 'boxed-in',
    name: 'Boxed In',
    rows: ['# # # # #', '# # X # #', '# # # # #'],
    goalRows: ['# # #'],
    newConcept: 'Fold the sheet down past the block without ever covering it.',
    difficulty: 6,
    expectedFolds: 3,
    designerNotes: '51% mean trap. Every fold has to clear the blocked cell.',
  }),
  shapeLevel({
    key: 'narrow-escape',
    name: 'Narrow Escape',
    rows: ['# # # # # #', '# X # # X #', '# # # # # #'],
    goalRows: ['# # # #'],
    newConcept: 'Two blocks, and the sheet has to come apart between them.',
    difficulty: 7,
    expectedFolds: 3,
    designerNotes: '64% mean trap.',
  }),
  shapeLevel({
    key: 'blocked-wall',
    name: 'Threading',
    rows: ['# # # # # # #', '# # X # X # #', '# # # # # # #'],
    goalRows: ['#', '#'],
    newConcept: 'Twenty cells to two, threading past both blocks on the way.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '68% mean trap over four folds -- inside the Endgame band.',
  }),
  shapeLevel({
    key: 'blocked-column',
    name: 'Blocked Column',
    rows: ['# # # # # # #', '# # X # X # #', '# # # # # # #'],
    goalRows: ['#', '#', '#'],
    newConcept: 'The same threading, but the column has to stay three tall.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: 'Chapter finale: 64% mean trap, and the taller target is the harder one.',
  }),
];
