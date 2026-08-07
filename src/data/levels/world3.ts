import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 3 -- "Hole Algebra"
 * Patch, preserve, combine: paper + hole = paper, hole + hole = hole. The
 * frame capstone folds the sides INTO an enclosed hollow.
 */
export const world3Levels: LevelDefinition[] = [
  shapeLevel({
    id: 11,
    name: 'Hole Meets Hole',
    world: 3,
    rows: ['# . #', '# . #', '# # #'],
    goalRows: ['# . #', '# # #'],
    newConcept: 'Empty + empty = empty: two holes folded onto each other stay a hole.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Completes the hole vocabulary: patch (6), preserve (7), combine (11).',
  }),
  shapeLevel({
    id: 12,
    name: 'Diagonal Missing',
    world: 3,
    rows: ['. # # #', '# # # #', '# # # #', '# # # .'],
    goalRows: ['# #', '# #'],
    newConcept: 'Two holes, one goal: both must be patched on the way to a solid square.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'The real test of patch-vs-preserve as a choice, not an accident.',
  }),
  shapeLevel({
    id: 13,
    name: 'Thick L',
    world: 3,
    rows: ['# # # #', '# # # #', '# # . .', '# # . .'],
    goalRows: ['# #', '# #'],
    newConcept: 'One fold can patch part of its span and stack the rest -- mixed consequences.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'Chunkier, bolder L: the tough version of level 8 at a glance.',
  }),
  shapeLevel({
    id: 14,
    name: 'Shrink the Frame',
    world: 3,
    rows: ['# # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# # #', '# . #', '# . #', '# # #'],
    newConcept: 'Narrow the frame without sealing the hollow -- the hole must survive.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'The old version (frame -> solid block) measured 0% trap: every opening won. '
      + 'Keeping the hole alive is what makes it a puzzle -- 67% trap.',
  }),
  shapeLevel({
    id: 15,
    name: 'Squash the Frame',
    world: 3,
    rows: ['# # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# #', '. #', '. #', '# #'],
    uniformDepth: 2,
    newConcept: 'Same frame, folded onto itself: every cell exactly two sheets thick.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: 'Measured 92% trap, exactly ONE solution -- the sharpest level in the game.',
  }),
];
