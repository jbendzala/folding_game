import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * The tear limit: a fold stacking more than N sheets on any cell is refused.
 * It is the exact inverse of a thickness goal -- there, layers are the thing
 * you are trying to build; here they are the thing that ruins you, so the
 * efficient big folds become the dangerous ones.
 */
export const tearLevels: LevelDefinition[] = [
  shapeLevel({
    key: 'careful-now',
    name: 'Careful Now',
    rows: ['# # # #'],
    goalRows: ['# #'],
    maxDepth: 2,
    newConcept: 'NEW: too many sheets on one cell would tear. Two is the limit here.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'The halving fold is fine; folding the halves again is refused.',
  }),
  shapeLevel({
    key: 'thin-ice',
    name: 'Thin Ice',
    rows: ['# # # # # #'],
    goalRows: ['# # #'],
    maxDepth: 2,
    newConcept: 'Six to three without ever doubling twice on the same cell.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'Only the exact half works: anything else stacks three somewhere.',
  }),
  shapeLevel({
    key: 'fragile-notch',
    name: 'Fragile Notch',
    rows: ['# # # #', '# # # .'],
    goalRows: ['# #', '# #'],
    maxDepth: 2,
    newConcept: 'A hole and a tear limit: patch the gap without stacking too deep.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'The patch and the limit pull against each other.',
  }),
  shapeLevel({
    key: 'fragile-grid',
    name: 'Fragile Grid',
    rows: ['# # # # # #', '# # # # # #', '# # # # # #'],
    goalRows: ['# #', '# #', '# #'],
    uniformDepth: 3,
    maxDepth: 3,
    newConcept: 'Exactly three sheets everywhere -- and a fourth would tear it.',
    difficulty: 8,
    expectedFolds: 2,
    designerNotes: 'The goal and the limit meet exactly, so every fold is forced. A tear '
      + 'limit caps how long a level can be by its nature: it forbids the stacking that '
      + 'long solutions are made of.',
  }),
  shapeLevel({
    key: 'fragile-hole',
    name: 'Fragile Hole',
    rows: ['# # # #', '# . . #', '# # # #'],
    goalRows: ['# #', '# .', '# #'],
    maxDepth: 2,
    newConcept: 'A hole to keep, and no room to stack while keeping it.',
    difficulty: 8,
    expectedFolds: 1,
    designerNotes: 'Chapter finale: holes and the tear limit pull against each other.',
  }),
];
