import type { LevelDefinition } from '../../core/types';
import { shapeLevel, singleCellLevel } from './helpers';

/**
 * Chapter 2 -- "Holes & Pins"
 * Holes, then pins. Pins used to arrive at level 26, more than halfway in;
 * arriving here means the back two thirds of the game can combine them with
 * everything else.
 */
export const world2Levels: LevelDefinition[] = [
  shapeLevel({
    id: 6,
    name: 'Missing Corner',
    world: 2,
    rows: ['# # #', '# # #', '# # .'],
    goalRows: ['# # #', '# # #'],
    newConcept: 'NEW: holes. Fold a gap onto solid paper and it vanishes for good.',
    difficulty: 3,
    expectedFolds: 1,
    designerNotes: 'Subverts "a hole is permanent".',
  }),
  shapeLevel({
    id: 7,
    name: 'Opposite Corner',
    world: 2,
    rows: ['. # #', '# # #', '# # #'],
    goalRows: ['. #', '# #'],
    newConcept: 'The reverse: fold only what never crosses the gap, and it survives.',
    difficulty: 4,
    expectedFolds: 2,
    designerNotes: 'Paired with level 6 -- same silhouette, opposite intent.',
  }),
  shapeLevel({
    id: 8,
    name: 'Hole Meets Hole',
    world: 2,
    rows: ['# . #', '# . #', '# # #'],
    goalRows: ['# . #', '# # #'],
    newConcept: 'Empty onto empty stays empty -- the only way to move a hole.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'Completes the hole vocabulary: patch, preserve, combine.',
  }),
  shapeLevel({
    id: 9,
    name: 'Hold It Down',
    world: 2,
    rows: ['P # #', '# # #', '# # #'],
    goalRows: ['# # #', '# # #'],
    newConcept: 'NEW: pins. A pinned cell never moves, so half the folds simply refuse.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'The paper physically will not budge -- the rule teaches itself.',
  }),
  singleCellLevel({
    id: 10,
    name: 'Around the Pin',
    world: 2,
    rows: ['# # # #', '# # @ #', '# # # #', '# # # #'],
    newConcept: 'A pin in the middle bans whole directions. Route around it.',
    difficulty: 5,
    expectedFolds: 4,
    designerNotes: 'Only ONE legal line per axis now.',
  }),
];
