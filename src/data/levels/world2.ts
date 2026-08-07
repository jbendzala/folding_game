import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 2 -- "First Shapes"
 * The goal becomes a silhouette to make, not a cell to land on. Concave
 * shapes mean folds have uneven consequences across their span.
 */
export const world2Levels: LevelDefinition[] = [
  shapeLevel({
    id: 6,
    name: 'Missing Corner',
    world: 2,
    rows: ['# # #', '# # #', '# # .'],
    goalRows: ['# # #', '# # #'],
    newConcept: 'A hole can be folded away: fold its row onto a solid one and it vanishes.',
    difficulty: 2,
    expectedFolds: 1,
    designerNotes: 'Subverts "a hole is permanent" -- animate the notch filling in.',
  }),
  shapeLevel({
    id: 7,
    name: 'Opposite Corner',
    world: 2,
    rows: ['. # #', '# # #', '# # #'],
    goalRows: ['. #', '# #'],
    newConcept: 'The opposite lesson: fold only what never crosses the hole, and it survives.',
    difficulty: 3,
    expectedFolds: 2,
    designerNotes: 'Same silhouette as 6, mirrored hole, opposite intent -- a paired lesson.',
  }),
  shapeLevel({
    id: 8,
    name: 'L Shape',
    world: 2,
    rows: ['# # #', '# . .', '# . .'],
    goalRows: ['#'],
    newConcept: 'First concave shape: folding the bar leaves the leg overhanging.',
    difficulty: 3,
    expectedFolds: 4,
    designerNotes: 'The classic silhouette; overhangs must be tracked region by region.',
  }),
  shapeLevel({
    id: 9,
    name: 'U Shape',
    world: 2,
    rows: ['# . . #', '# . . #', '# # # #'],
    goalRows: ['. #', '. #', '# #'],
    newConcept: 'Fold one arm onto the other -- the gap closes exactly, like shutting a book.',
    difficulty: 3,
    expectedFolds: 1,
    designerNotes: 'Should feel great: snap animation, soft clack as the arms meet flush.',
  }),
  shapeLevel({
    id: 10,
    name: 'T Shape',
    world: 2,
    rows: ['# # #', '. # .', '. # .'],
    goalRows: ['#'],
    newConcept: 'The bar is wider than the stem -- folding it down overhangs both sides.',
    difficulty: 4,
    expectedFolds: 4,
    designerNotes: 'Iconic silhouette; wings past the stem form a new shape mid-solve.',
  }),
];
