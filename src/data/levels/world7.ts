import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 7 -- "Masterpieces"
 * The finale: the biggest, most recognizable silhouettes in the game, each
 * folded into another shape worth looking at. Every goal here was measured
 * at 63%+ trap rate before it earned its slot.
 */
export const world7Levels: LevelDefinition[] = [
  shapeLevel({
    id: 31,
    name: 'Arrowhead',
    world: 7,
    rows: [
      '. . # . .',
      '. # # # .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # # # .', '# # # # #', '. . # . .', '. . # . .'],
    newConcept: 'Blunt the arrow by exactly one row -- everything else must survive intact.',
    difficulty: 9,
    expectedFolds: 1,
    designerNotes: 'The hardest single fold in the game: 94% trap, 1 solution, 17 of 18 openings wrong.',
  }),
  shapeLevel({
    id: 32,
    name: 'Butterfly',
    world: 7,
    rows: [
      '# . . . #',
      '# # . # #',
      '. # # # .',
      '# # . # #',
      '# . . . #',
    ],
    goalRows: ['# . #', '# # #', '# . #'],
    newConcept: 'Four folds down to a tiny H -- both wing gaps have to survive every one.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '4 folds at 63% mean trap. The gaps make it: patch one by accident and it is lost.',
  }),
  shapeLevel({
    id: 33,
    name: 'Iron Cross',
    world: 7,
    rows: [
      '. . # . .',
      '. . # . .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # .', '. # .', '# # #', '. # .', '. # .'],
    newConcept: 'Shorten the arms across one axis while the other axis keeps its full span.',
    difficulty: 9,
    expectedFolds: 2,
    designerNotes: 'Symmetric shape, asymmetric goal -- the symmetry is a trap here, not a shortcut.',
  }),
  shapeLevel({
    id: 34,
    name: 'The H',
    world: 7,
    rows: [
      '# . . . #',
      '# # . # #',
      '. # # # .',
      '# # . # #',
      '# . . . #',
    ],
    goalRows: ['# . #', '# . #', '# # #', '# . #', '# . #'],
    newConcept: 'The butterfly folds into a letter -- both wing gaps must line up perfectly.',
    difficulty: 10,
    expectedFolds: 2,
    designerNotes: 'Finale-grade: the two vertical gaps only survive if both folds are exact.',
  }),
  shapeLevel({
    id: 35,
    name: 'Pinned Masterpiece',
    world: 7,
    rows: [
      '. . # . .',
      '. # # # .',
      'P # # # #',
      '. # # # .',
      '. . # . .',
    ],
    goalRows: ['. # # # .', '# # # # #', '. # # # .'],
    newConcept: 'Everything at once: a pin bans the easy route into a hexagon.',
    difficulty: 10,
    expectedFolds: 2,
    designerNotes: 'The last level: diamond geometry, a pinned corner, and only one way through.',
  }),
];
