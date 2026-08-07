import type { LevelDefinition } from '../../core/types';
import { singleCellLevel } from './helpers';

/**
 * World 1 -- "Paper Basics" (the only rectangle world)
 * Five levels of fold grammar: direction, chaining, and two "obvious fold is
 * wrong" traps. Everything after this world is shapes, holes, layers, pins.
 */
export const world1Levels: LevelDefinition[] = [
  singleCellLevel({
    id: 1,
    name: 'Tiny Square',
    world: 1,
    rows: ['# #', '# *'],
    newConcept: 'One horizontal + one vertical fold; fold direction follows the target.',
    difficulty: 1,
    expectedFolds: 2,
    designerNotes: 'The entire grammar of the game in the smallest possible box.',
  }),
  singleCellLevel({
    id: 2,
    name: 'Wide Rectangle',
    world: 1,
    rows: ['* # # #', '# # # #'],
    newConcept: 'Chaining folds on one axis (4 -> 2 -> 1) -- or fold it in half at once.',
    difficulty: 2,
    expectedFolds: 3,
    designerNotes: 'First taste of "this dimension needs more than one fold."',
  }),
  singleCellLevel({
    id: 3,
    name: 'Center Target',
    world: 1,
    rows: ['# # # #', '# # * #', '# # # #', '# # # #'],
    newConcept: 'Target near the middle -- only one direction per axis preserves it.',
    difficulty: 2,
    expectedFolds: 4,
    designerNotes: 'First deliberate "obvious fold, wrong pick" trap.',
  }),
  singleCellLevel({
    id: 4,
    name: 'Five by Five',
    world: 1,
    rows: [
      '# # # # #',
      '# # # # #',
      '# # * # #',
      '# # # # #',
      '# # # # #',
    ],
    newConcept: 'Odd sizes never split evenly -- a fold is always 2 vs 3.',
    difficulty: 3,
    expectedFolds: 6,
    designerNotes: 'Perfectly symmetric card; calm before the shapes arrive.',
  }),
  singleCellLevel({
    id: 5,
    name: 'Offset Center',
    world: 1,
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # # * # #',
      '# # # # # #',
      '# # # # # #',
      '# # # # # #',
    ],
    newConcept: 'The instinctive half-fold is wrong -- the target is one cell off center.',
    difficulty: 3,
    expectedFolds: 6,
    designerNotes: 'Graduation exam for rectangles. The last one in the game.',
  }),
];
