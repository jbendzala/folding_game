import type { LevelDefinition } from '../../core/types';
import { shapeLevel, singleCellLevel } from './helpers';

/**
 * World 6 -- "Pinned Down"
 * A pinned cell can never be on the moving side of a fold. Pins kill half
 * your options and force routing: which way the book closes, which order
 * the frame folds. ASCII: 'P' = pinned paper, '@' = pinned target.
 */
export const world6Levels: LevelDefinition[] = [
  shapeLevel({
    id: 26,
    name: 'Hold It Down',
    world: 6,
    rows: ['P # #', '# # #', '# # #'],
    goalRows: ['# # #', '# # #'],
    newConcept: 'NEW RULE: a pinned cell never moves, so half the folds simply refuse.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'Pin intro. The paper physically will not budge toward the pin -- the rule '
      + 'teaches itself by resisting.',
  }),
  singleCellLevel({
    id: 27,
    name: 'Around the Pin',
    world: 6,
    rows: ['# # # #', '# # @ #', '# # # #', '# # # #'],
    newConcept: 'An interior pin bans whole fold directions -- route around it.',
    difficulty: 7,
    expectedFolds: 4,
    designerNotes: 'Same fold count as unpinned, but only ONE valid line per axis now.',
  }),
  shapeLevel({
    id: 28,
    name: 'Blocked Book',
    world: 6,
    rows: ['P . . #', '# . . #', '# # # #'],
    goalRows: ['# .', '# .', '# #'],
    newConcept: 'The pin decides which way the book closes -- one arm is nailed down.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'Level 9\'s U-fold, but the goal orientation is forced by the pin.',
  }),
  shapeLevel({
    id: 29,
    name: 'Pinned Frame',
    world: 6,
    rows: ['P # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# #'],
    newConcept: 'The pin blocks the frame\'s natural solution -- find another route.',
    difficulty: 8,
    expectedFolds: 3,
    designerNotes: 'Level 14\'s frame with its most natural opening move banned by the pin.',
  }),
  shapeLevel({
    id: 30,
    name: 'Fold the Banner',
    world: 6,
    rows: ['P # # P', '# # # #', '# # # #', '# # # #'],
    goalRows: ['# # # #'],
    uniformDepth: 4,
    newConcept: 'Two pins leave only one legal direction -- combine it with thickness.',
    difficulty: 8,
    expectedFolds: 2,
    designerNotes: 'Finale: read the pins, then roll the banner up in two perfect folds.',
  }),
];
