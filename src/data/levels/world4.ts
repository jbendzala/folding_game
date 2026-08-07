import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 4 -- "Layer Cake"
 * The thickness goal debuts: the final shape must be exactly N layers thick
 * everywhere. Paper is conserved, so every sloppy overlap somewhere is a
 * missing layer somewhere else -- waste becomes visible.
 */
export const world4Levels: LevelDefinition[] = [
  shapeLevel({
    id: 16,
    name: 'Double Over',
    world: 4,
    rows: ['# # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    uniformDepth: 2,
    newConcept: 'NEW RULE: the result must be exactly this many layers thick everywhere.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'The thickness chip debuts here on the easiest possible example.',
  }),
  shapeLevel({
    id: 17,
    name: 'Four Ply',
    world: 4,
    rows: ['# # # #', '# # # #', '# # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    uniformDepth: 4,
    newConcept: 'Two perfect half-folds = four perfect layers. Any other pair fails.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'The first level where a "solved-looking" shape can still be wrong.',
  }),
  shapeLevel({
    id: 18,
    name: 'Even Strip',
    world: 4,
    rows: ['# # # # # # # #'],
    goalRows: ['# #'],
    uniformDepth: 4,
    newConcept: 'Halve the strip, then halve it again -- depth doubles each time.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'Pure 1-D thinking; the accordion in miniature.',
  }),
  shapeLevel({
    id: 19,
    name: 'Thick Three',
    world: 4,
    rows: ['# # #', '# # #', '# # #'],
    goalRows: ['# # #'],
    uniformDepth: 3,
    newConcept: 'Odd thickness: two different folds stack 1+1+1, not 2+1.',
    difficulty: 6,
    expectedFolds: 2,
    designerNotes: 'The Z-fold (letter fold) -- everyone knows it from envelopes.',
  }),
  shapeLevel({
    id: 20,
    name: 'Quarter Fold',
    world: 4,
    rows: ['# # # #', '# # # #', '# # # #', '# # # #'],
    goalRows: ['#', '#', '#', '#'],
    uniformDepth: 4,
    newConcept: 'Collapse one axis completely while the other keeps its full length.',
    difficulty: 6,
    expectedFolds: 2,
    designerNotes: 'World capstone. Replaced a 20%-trap version; every horizontal fold here is a '
      + 'losing move even though it looks like progress.',
  }),
];
