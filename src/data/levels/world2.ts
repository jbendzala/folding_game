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
    difficulty: 3,
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
    goalRows: ['# # #', '# . .'],
    newConcept: 'Fold the leg up into the bar -- the L keeps its corner, loses its length.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Measured 75% trap: 2 of 8 openings work. One precise fold, not four vague ones.',
  }),
  shapeLevel({
    id: 9,
    name: 'U Shape',
    world: 2,
    rows: ['# . . #', '# . . #', '# # # #'],
    goalRows: ['. #', '. #', '# #'],
    newConcept: 'Fold one arm onto the other -- the gap closes exactly, like shutting a book.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Should feel great: snap animation, soft clack as the arms meet flush.',
  }),
  shapeLevel({
    id: 10,
    name: 'T Shape',
    world: 2,
    rows: ['# # #', '. # .', '. # .'],
    goalRows: ['# # #', '. # .'],
    newConcept: 'Shorten the stem without touching the bar -- the T must stay a T.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Goal is the same silhouette, smaller: you must fold INTO the shape, not flatten it.',
  }),
];
