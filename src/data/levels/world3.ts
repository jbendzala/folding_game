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
    difficulty: 3,
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
    difficulty: 4,
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
    difficulty: 4,
    expectedFolds: 2,
    designerNotes: 'Chunkier, bolder L: the tough version of level 8 at a glance.',
  }),
  shapeLevel({
    id: 14,
    name: 'Frame',
    world: 3,
    rows: ['# # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# #', '# #'],
    newConcept: 'A fully enclosed hole -- fold the sides INTO the hollow to patch it.',
    difficulty: 5,
    expectedFolds: 3,
    designerNotes: 'The hollow vanishes into a tidy solid block. Big aha.',
  }),
  shapeLevel({
    id: 15,
    name: 'Plus',
    world: 3,
    rows: ['. # .', '# # #', '. # .'],
    goalRows: ['#'],
    newConcept: 'Four protrusions, four folds -- irregular shapes cost more than their size.',
    difficulty: 4,
    expectedFolds: 4,
    designerNotes: 'Perfectly symmetric; each arm swinging in should look beautiful.',
  }),
];
