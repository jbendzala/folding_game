import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 5 -- "Strange Geometry"
 * Diagonal-looking silhouettes that fold orthogonally: staircases, pyramids,
 * diamonds. The aha: the diagonal was just stairs all along.
 */
export const world5Levels: LevelDefinition[] = [
  shapeLevel({
    id: 21,
    name: 'Staircase',
    world: 5,
    rows: ['# # # #', '. # # #', '. . # #', '. . . #'],
    goalRows: ['#'],
    newConcept: 'One fold line, different consequences on every row it crosses.',
    difficulty: 5,
    expectedFolds: 4,
    designerNotes: 'Iconic silhouette -- candidate for the game\'s key art.',
  }),
  shapeLevel({
    id: 22,
    name: 'Pyramid',
    world: 5,
    rows: ['. . # . .', '. # # # .', '# # # # #'],
    goalRows: ['#'],
    newConcept: 'Spot the symmetry axis -- the center fold overlaps both halves perfectly.',
    difficulty: 5,
    expectedFolds: 5,
    designerNotes: 'Monumental look; the first fold is free if you see the axis.',
  }),
  shapeLevel({
    id: 23,
    name: 'Diamond',
    world: 5,
    rows: [
      '. . # . .',
      '. # # # .',
      '# # # # #',
      '. # # # .',
      '. . # . .',
    ],
    goalRows: ['#'],
    newConcept: 'Symmetric on BOTH axes -- two equally clean opening moves. Pick one.',
    difficulty: 5,
    expectedFolds: 6,
    designerNotes: 'First genuine branching strategy; both paths valid.',
  }),
  shapeLevel({
    id: 24,
    name: 'Hourglass',
    world: 5,
    rows: ['# # #', '. # .', '# # #'],
    goalRows: ['# # #'],
    newConcept: 'Fold at the waist and the cones nest perfectly -- one line off is ugly.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'Precision pinch-point; several plausible lines, one clean one.',
  }),
  shapeLevel({
    id: 25,
    name: 'Lightning',
    world: 5,
    rows: ['# # # .', '. . # .', '. # # #'],
    goalRows: ['#'],
    newConcept: 'No symmetry anywhere -- every fold reasoned from scratch.',
    difficulty: 6,
    expectedFolds: 4,
    designerNotes: 'World capstone: removes the symmetry crutch it just taught.',
  }),
];
