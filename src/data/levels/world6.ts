import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 6 -- "Masterpieces"
 * The big recognizable silhouettes, each folded into another shape worth
 * looking at, and each carrying a second constraint now.
 */
export const world6Levels: LevelDefinition[] = [
  shapeLevel({
    id: 26,
    name: 'Arrowhead',
    world: 6,
    rows: [
      '. . # . .',
      '. # # # .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['# .', '# #', '# .'],
    newConcept: 'Four folds to a key shape -- the arrow has to fold clean off its own edge.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '61% mean trap with an overhang fold. Was a single fold.',
  }),
  shapeLevel({
    id: 27,
    name: 'Butterfly',
    world: 6,
    rows: [
      '# . . . #',
      '# # . # #',
      '. # # # .',
      '# # . # #',
      '# . . . #',
    ],
    goalRows: ['# . #', '# # #', '# . #'],
    newConcept: 'Four folds to a tiny H -- both wing gaps survive every one.',
    difficulty: 8,
    expectedFolds: 4,
    designerNotes: '63% mean trap. Patch a gap by accident and it is lost.',
  }),
  shapeLevel({
    id: 28,
    name: 'Iron Cross',
    world: 6,
    rows: [
      '. . # . .',
      '. . # . .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # .', '# # #', '. # .'],
    newConcept: 'Turn the cross into a plus: four folds, and the paper leaves the sheet twice.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '63% mean trap, overhang required. Was two folds.',
  }),
  shapeLevel({
    id: 29,
    name: 'Pinned Cross',
    world: 6,
    rows: [
      '. . # . .',
      '. . # . .',
      'P # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # .', '. # .', '# # #', '. # .', '. # .'],
    newConcept: 'The same cross with an arm nailed down -- the easy half is gone.',
    difficulty: 9,
    expectedFolds: 2,
    designerNotes: 'Pairs with 28: identical goal, and the route that solved it is illegal.',
  }),
  shapeLevel({
    id: 30,
    name: 'Pinned Masterpiece',
    world: 6,
    rows: [
      '. . # . .',
      '. # # # .',
      'P # # # #',
      '. # # # .',
      '. . # . .',
    ],
    goalRows: ['. # .', '# # #'],
    newConcept: 'Four folds off a pinned diamond, and the paper leaves the sheet to get there.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '73% mean trap with an overhang fold. Was two folds.',
  }),
];
