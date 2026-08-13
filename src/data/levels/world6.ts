import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 6 -- "Masterpieces"
 * The big recognizable silhouettes, each folded into another shape worth
 * looking at, and each carrying a second constraint now.
 */
export const world6Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'arrowhead',
    name: 'Arrowhead',
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
    key: 'butterfly',
    name: 'Butterfly',
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
    key: 'iron-cross',
    name: 'Iron Cross',
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
    key: 'pinned-cross',
    name: 'Pinned Cross',
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
    key: 'pinned-masterpiece',
    name: 'Pinned Masterpiece',
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
