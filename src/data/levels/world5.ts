import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * World 5 -- "Strange Geometry"
 * Diagonal-LOOKING silhouettes that fold orthogonally, and every goal is a
 * shape worth making. Goals here were discovered by enumerating what the
 * fold algebra can actually reach (scripts/discover.ts) and picked for
 * measured trap rate, not guessed -- the old "fold it down to one square"
 * goals measured 0% trap with up to 46,080 winning solutions.
 */
export const world5Levels: LevelDefinition[] = [
  shapeLevel({
    id: 21,
    name: 'Staircase',
    world: 5,
    rows: ['# # # #', '. # # #', '. . # #', '. . . #'],
    goalRows: ['# # #', '# # #', '. # #', '. . #'],
    newConcept: 'Fold the stairs into themselves -- the top steps square off, the rest stay.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'Measured 92% trap, 1 solution: 11 of 12 openings are wrong.',
  }),
  shapeLevel({
    id: 22,
    name: 'Pyramid',
    world: 5,
    rows: ['. . # . .', '. # # # .', '# # # # #'],
    goalRows: ['. # # # .', '# # # # #'],
    newConcept: 'Fold the peak away and the pyramid keeps its slope, one course shorter.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'Measured 92% trap, 1 solution. Old 1x1 goal was 0% trap / 3,840 paths.',
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
    goalRows: ['# # #', '. # .'],
    newConcept: 'Thirteen cells down to four -- four folds, and every one of them can lose it.',
    difficulty: 7,
    expectedFolds: 4,
    designerNotes: 'The showcase shape gets a real journey: 4 folds at 65% mean trap. Earlier '
      + 'versions ended in 1-2 folds, which is why the shape never paid off.',
  }),
  shapeLevel({
    id: 24,
    name: 'Lightning',
    world: 5,
    rows: ['# # # .', '. . # .', '. # # #'],
    goalRows: ['# # .', '. # .', '# # #'],
    newConcept: 'No symmetry to lean on -- one fold, and only one, keeps the bolt intact.',
    difficulty: 8,
    expectedFolds: 1,
    designerNotes: 'Measured 90% trap with a unique solution.',
  }),
  shapeLevel({
    id: 25,
    name: 'Hourglass',
    world: 5,
    rows: ['# # #', '. # .', '# # #'],
    goalRows: ['# #', '# .', '# #'],
    newConcept: 'Fold it narrow, not flat -- the waist has to stay pinched on one side.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'Folding the waist shut (the obvious move) gives a solid block and loses. 75% trap.',
  }),
];
