import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 3 -- "Missing Pieces"
 * Holes enter the game, and the goal generalizes from "land on this cell" to
 * "match this silhouette". The two core judgments: PATCH a hole (fold paper
 * over it) or PRESERVE it (never let paper land there). Some goals from the
 * original design doc were adjusted where the fold algebra made them
 * impossible (see docs/design/fold-levels.md); every goal below is
 * machine-verified reachable in exactly expectedFolds.
 */
export const world3Levels: LevelDefinition[] = [
  shapeLevel({
    id: 21,
    name: 'Missing Corner',
    world: 3,
    rows: ['# # #', '# # #', '# # .'],
    goalRows: ['# # #', '# # #'],
    newConcept: 'A hole can be folded away: fold its row onto a solid one and it vanishes.',
    difficulty: 3,
    expectedFolds: 1,
    designerNotes: 'Subverts "a hole is permanent" -- animate the notch filling in.',
  }),
  shapeLevel({
    id: 22,
    name: 'Opposite Corner',
    world: 3,
    rows: ['. # #', '# # #', '# # #'],
    goalRows: ['. #', '# #'],
    newConcept: 'The opposite lesson: fold only what never crosses the hole, and it survives.',
    difficulty: 4,
    expectedFolds: 2,
    designerNotes: 'Same silhouette as 21, mirrored hole, opposite intent -- a paired lesson.',
  }),
  shapeLevel({
    id: 23,
    name: 'Hole Meets Hole',
    world: 3,
    rows: ['# . #', '# . #', '# # #'],
    goalRows: ['# . #', '# # #'],
    newConcept: 'Empty + empty = empty: two holes folded onto each other stay a hole.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Completes the hole vocabulary: patch (21), preserve (22), combine (23).',
  }),
  shapeLevel({
    id: 24,
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
    id: 25,
    name: 'L Shape',
    world: 3,
    rows: ['# # #', '# . .', '# . .'],
    goalRows: ['#'],
    newConcept: 'First concave shape: folding the bar leaves the leg overhanging.',
    difficulty: 5,
    expectedFolds: 4,
    designerNotes: 'The classic silhouette; overhangs must be tracked region by region.',
  }),
  shapeLevel({
    id: 26,
    name: 'Reverse L',
    world: 3,
    rows: ['# # #', '. . #', '. . #'],
    goalRows: ['#'],
    newConcept: 'Mirrored L -- confirms the concave lesson generalized, not memorized.',
    difficulty: 5,
    expectedFolds: 4,
    designerNotes: 'Visual pair with 25 on the map.',
  }),
  shapeLevel({
    id: 27,
    name: 'Thick L',
    world: 3,
    rows: ['# # # #', '# # # #', '# # . .', '# # . .'],
    goalRows: ['# #', '# #'],
    newConcept: 'One fold can patch part of its span and stack the rest -- mixed consequences.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'Chunkier, bolder L: reads as "the tough version" of 25/26 at a glance.',
  }),
  shapeLevel({
    id: 28,
    name: 'U Shape',
    world: 3,
    rows: ['# . . #', '# . . #', '# # # #'],
    goalRows: ['. #', '. #', '# #'],
    newConcept: 'Fold one arm onto the other -- the gap closes exactly, like shutting a book.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'Should feel great: snap animation, soft clack as the arms meet flush.',
  }),
  shapeLevel({
    id: 29,
    name: 'C Shape',
    world: 3,
    rows: ['# # #', '# . .', '# . .', '# # #'],
    goalRows: ['# . .', '# # #'],
    newConcept: 'The book-close works on the other axis too -- same idea, rotated context.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'Companion piece to 28; place them adjacent on the world map.',
  }),
  shapeLevel({
    id: 30,
    name: 'Frame',
    world: 3,
    rows: ['# # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# #', '# #'],
    newConcept: 'A fully enclosed hole -- fold the sides INTO the hollow to patch it.',
    difficulty: 6,
    expectedFolds: 3,
    designerNotes: 'World capstone: the hollow vanishes into a tidy solid block.',
  }),
];
