import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 9 -- "The Gauntlet"
 * Everything at once: irregular sheets riddled with holes, targets that are
 * themselves holed, pins banning the easy routes, and thickness on top.
 *
 * Holes are what make these brutal. A hole is fragile in one direction only:
 * paper folded onto it patches it forever, and no later fold can reopen it.
 * So every fold has to be checked twice -- once for the silhouette, once for
 * what it does to the gaps.
 */
export const world9Levels: LevelDefinition[] = [
  shapeLevel({
    id: 41,
    name: 'Perforated',
    world: 9,
    rows: [
      '# # # # # # #',
      '# . # . # . #',
      '# # # # # # #',
      '# . # . # . #',
      '# # # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'Six holes in, one hole out -- five of them have to be closed, one must not.',
    difficulty: 9,
    expectedFolds: 5,
    designerNotes: '62% mean trap. The player must work out WHICH hole becomes the survivor.',
  }),
  shapeLevel({
    id: 42,
    name: 'The Window',
    world: 9,
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'Thirty-two cells down to a ring -- and the window survives all six folds.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '6 folds at 66% mean trap. One careless fold seals the window and it is over.',
  }),
  shapeLevel({
    id: 43,
    name: 'Swiss',
    world: 9,
    rows: [
      '# # # # # #',
      '# . # # . #',
      '# # # # # #',
      '# # # # # #',
      '# . # # . #',
      '# # # # # #',
    ],
    goalRows: ['#', '#'],
    uniformDepth: 16,
    newConcept: 'Four holes, and the answer is two cells sixteen sheets thick -- all of it perfect.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: 'Holes AND extreme thickness: every hole must be patched exactly, or a '
      + 'column comes up a sheet short.',
  }),
  shapeLevel({
    id: 44,
    name: 'Nailed Window',
    world: 9,
    rows: [
      'P # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# . #', '# # #', '# # #'],
    newConcept: 'The pin takes away the natural route, and the window still has to live.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '74% mean trap -- the most constrained long level in the game.',
  }),
  shapeLevel({
    id: 45,
    name: 'The Gauntlet',
    world: 9,
    rows: [
      'P # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'Pin, window, ring, six folds. Nothing here forgives anything.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'The final level: level 42 with a pin nailing one corner, so the six-fold '
      + 'route that solved it there is illegal here.',
  }),
];
