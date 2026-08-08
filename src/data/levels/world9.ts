import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 9 -- "No Mercy"
 * The finale: every rule at once, on the biggest boards, with the longest
 * chains. Nothing here introduces anything new -- it is the combination
 * space the earlier chapters spent so long getting to.
 */
export const world9Levels: LevelDefinition[] = [
  shapeLevel({
    id: 41,
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
    designerNotes: 'Level 37 with a corner pinned, so the route that solved it is illegal.',
  }),
  shapeLevel({
    id: 42,
    name: 'Nailed Swiss',
    world: 9,
    rows: [
      'P # # # # #',
      '# . # # . #',
      '# # # # # #',
      '# # # # # #',
      '# . # # . #',
      '# # # # # #',
    ],
    goalRows: ['#', '#'],
    uniformDepth: 16,
    newConcept: 'All three rules: four holes, sixteen sheets, and a pinned corner.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: 'The only level using holes, thickness and a pin together.',
  }),
  shapeLevel({
    id: 43,
    name: 'Pinned Perforation',
    world: 9,
    rows: [
      'P # # # # # #',
      '# . # . # . #',
      '# # # # # # #',
      '# . # . # . #',
      '# # # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'Six holes and a pin -- the survivor is no longer the obvious one.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: 'Pairs with 36: same sheet, and the pin moves which hole can live.',
  }),
  shapeLevel({
    id: 44,
    name: 'Pinned Net',
    world: 9,
    rows: [
      'P # . . . # #',
      '# # # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # #', '# . #', '# . #'],
    newConcept: 'The doorway again, seven folds deep, with a wingtip nailed down.',
    difficulty: 10,
    expectedFolds: 7,
    designerNotes: 'Longest solution in the game. The pin bans the six-fold route that '
      + 'solves the unpinned version (level 33), forcing a seventh fold.',
  }),
  shapeLevel({
    id: 45,
    name: 'The Last Word',
    world: 9,
    rows: [
      '. . # # # . .',
      '. . # # # . .',
      'P # # # # # #',
      '# # # # # # #',
      '# # # # # # #',
      '. . # # # . .',
      '. . # # # . .',
    ],
    goalRows: ['# .', '# #'],
    newConcept: 'Thirty-three cells, one pin, three squares. Goodnight.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Final level: the long cross with its left arm pinned.',
  }),
];
