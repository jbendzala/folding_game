import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

const V = (line: number) => ({ axis: 'vertical' as const, line, moves: 'lower' as const });
const H = (line: number) => ({ axis: 'horizontal' as const, line, moves: 'lower' as const });

/**
 * The last ten levels: irregular sheets carrying two and three rules at once.
 *
 * The sheets are machine-generated and then filtered by the solver -- grown by
 * random accretion, deduplicated by symmetry orbit, and kept only if they hold
 * five folds at Endgame tightness or better. Irregular is not decoration here.
 * The regular sheets are symmetric, so their variants collapse into orbits of
 * the square's dihedral group: the window's six one-block levels turned out to
 * be one puzzle reflected six ways. A ragged sheet has no symmetry, so every
 * clamp and pin position on it is a distinct puzzle.
 *
 * One finding shaped the mix. Three rules measure EASIER than two -- 66% mean
 * trap against 80% across the search. Mean trap is the fraction of legal moves
 * that lose, and a pin bans losing moves along with winning ones, so each rule
 * added narrows the search but also removes chances to go wrong. The chapters
 * therefore run three-rule levels first and finish on two-rule ones, which is
 * the opposite of how the rule count reads.
 */
export const irregularLevels: LevelDefinition[] = [
  shapeLevel({
    key: 'ragged-edge',
    name: 'Ragged Edge',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # # # # P',
      '# # # # . #',
      '# # # # # .',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(0)],
    newConcept: 'A torn sheet, framed and clamped, with a pin in the far edge.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '68% mean trap over 5 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'torn-corner',
    name: 'Torn Corner',
    rows: [
      '# # # # # # #',
      '# # # # # # .',
      '# # # # # . P',
      '# # # # # # #',
      '# # # # # . .',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(1)],
    newConcept: 'Three rules on a sheet with a bite out of two corners.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '68% mean trap over 5 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'offcut',
    name: 'Offcut',
    rows: [
      '# # # # # #',
      '# # # # # #',
      'P # # # # #',
      '# . # # # #',
      '# . . # # #',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(2)],
    newConcept: 'An offcut of paper: no straight edge to trust.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '67% mean trap over 5 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'the-scrap',
    name: 'The Scrap',
    rows: [
      '# # P . . . .',
      '# # # # . . .',
      '# # # # . . .',
      '# # # # # . .',
      '# # # # # . .',
      '# # # # # # .',
      '# # # # # # .',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(5)],
    newConcept: 'A long ragged wedge, framed, clamped and pinned.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '67% mean trap over 5 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'ragged-ring',
    name: 'Ragged Ring',
    rows: [
      '. . # P # # #',
      '. # # . # # #',
      '# # # # # # #',
      '. # # # # # #',
      '. # # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    borders: true,
    lockedCreases: [H(0)],
    newConcept: 'A ring to build out of a torn sheet with a hole already in it.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '68% mean trap over 5 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'long-scrap',
    name: 'The Long Scrap',
    rows: [
      '. . . # # # .',
      '. . . # # # .',
      '# # # # # # #',
      'P # # # # # #',
      '# # # # # # #',
      '. # # . # # #',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [H(4)],
    newConcept: 'Six folds on a ragged cross, with three rules on it.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '68% mean trap over 6 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'pinned-scrap',
    name: 'Pinned Scrap',
    rows: [
      '# # # . . .',
      '# # # # . .',
      '# # # # # .',
      '# # . . # .',
      '# # # # # P',
      '# # # . . #',
      '# # # . . .',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(0)],
    newConcept: 'The tightest three-rule sheet in the game.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '74% mean trap over 5 folds, 3 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'narrow-margin',
    name: 'Narrow Margin',
    rows: [
      '# . # # # #',
      '# . # # # #',
      '# # # # # #',
      '# . . # # #',
      '. # # # # #',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(3)],
    newConcept: 'Two rules, and far less room than three would leave.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '78% mean trap over 5 folds, 2 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'last-margin',
    name: 'Last Margin',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # # # # #',
      '# # # # # #',
      '. # # # # #',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(3)],
    newConcept: 'A frame and a clamp on an almost-whole sheet.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '78% mean trap over 5 folds, 2 rules. At or above the Endgame band.',
  }),
  shapeLevel({
    key: 'the-hundredth',
    name: 'The Hundredth',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '. . . # # #',
      '. . . . # #',
      '. . # # # #',
      '# # # # # #',
      '. . . # . #',
    ],
    goalRows: ['# .', '# #'],
    borders: true,
    lockedCreases: [V(3)],
    newConcept: 'The last one: a frame, a clamp, and nowhere to be wrong.',
    difficulty: 10,
    expectedFolds: 5,
    designerNotes: '83% mean trap over 5 folds, 2 rules. Above the Endgame band.',
  }),
];
