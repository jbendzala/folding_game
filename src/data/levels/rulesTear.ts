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
    key: 'two-ply-square',
    name: 'Two Ply Square',
    rows: ['# # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    maxDepth: 2,
    newConcept: 'Halve one axis and the sheet is already at its limit.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: 'Shows the limit binding on a 2D sheet rather than a strip.',
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
    key: 'fragile-pin',
    name: 'Fragile Pin',
    rows: ['P # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    maxDepth: 2,
    newConcept: 'Pinned and fragile: one direction banned, one thickness forbidden.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'Chapter finale, and the first three-way squeeze in the game.',
  }),
];
