import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

const V = (line: number) => ({ axis: 'vertical' as const, line, moves: 'lower' as const });
const H = (line: number) => ({ axis: 'horizontal' as const, line, moves: 'lower' as const });

const BUTTERFLY = [
  '# # . . . # #',
  '# # # . # # #',
  '. # # # # # .',
  '. . # # # . .',
  '. # # # # # .',
  '# # # . # # #',
  '# # . . . # #',
];
const CROSS = [
  '. . # # # . .',
  '. . # # # . .',
  '# # # # # # #',
  '# # # # # # #',
  '# # # # # # #',
  '. . # # # . .',
  '. . # # # . .',
];
const WINDOW = [
  '# # # # # #',
  '# # # # # #',
  '# # . . # #',
  '# # . . # #',
  '# # # # # #',
  '# # # # # #',
];

/**
 * The last chapters, past the finale that used to end the game.
 *
 * They cannot be longer: seven folds is the measured ceiling of the mechanic,
 * and no arrangement of pins or blocks beat it. So difficulty here comes from
 * constraint density instead -- the same length with fewer legal ways to walk
 * it. A clamp is the sharpest tool for that, because unlike a pin or a block
 * it changes no cell, so a known-good target stays reachable while the routes
 * to it thin out. Clamping Butterfly Net takes it from 72% mean trap to 83%,
 * the highest measured anywhere in the game, at the same six folds.
 */
export const finaleLevels: LevelDefinition[] = [
  // --- chapter: clamped versions of the long sheets ---
  shapeLevel({
    key: 'clamped-net',
    name: 'Clamped Net',
    rows: BUTTERFLY,
    goalRows: ['# # #', '# . #', '# . #'],
    lockedCreases: [H(2)],
    newConcept: 'The doorway again, with a clamp across the wings.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '83% mean trap -- the tightest level in the game, and the same six folds '
      + 'as its unclamped twin.',
  }),
  shapeLevel({
    key: 'clamped-net-low',
    name: 'Clamped Net II',
    rows: BUTTERFLY,
    goalRows: ['# # #', '# . #', '# . #'],
    lockedCreases: [H(3)],
    newConcept: 'The clamp moved one line down, and the route changes completely.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Also 83%. Pairs with Clamped Net: adjacent clamps, unrelated solutions.',
  }),
  shapeLevel({
    key: 'clamped-window',
    name: 'Clamped Window',
    rows: WINDOW,
    goalRows: ['# # #', '# . #', '# # #'],
    lockedCreases: [H(4)],
    newConcept: 'Thirty-two cells to a ring, with one line clamped shut.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '76% mean trap, up from 66% unclamped.',
  }),
  shapeLevel({
    key: 'clamped-cross',
    name: 'Clamped Cross',
    rows: CROSS,
    goalRows: ['# .', '# #'],
    lockedCreases: [V(3)],
    newConcept: 'Thirty-three cells to three, and the middle line is gone.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'The centre clamp removes the tidiest route through.',
  }),
  shapeLevel({
    key: 'clamped-wingspan',
    name: 'Clamped Wingspan',
    rows: BUTTERFLY,
    goalRows: ['# # # #', '# . . #'],
    lockedCreases: [V(5)],
    newConcept: 'The wide target, clamped near one wing.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Chapter of clamped sheets: same lengths as the originals, far less room.',
  }),

  shapeLevel({
    key: 'the-frame',
    name: 'The Frame',
    rows: WINDOW,
    goalRows: ['# # #', '# . #', '# # #'],
    borders: true,
    newConcept: 'NEW: borders. The paper must stay inside the frame.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'The answer to folding the whole sheet over: that move creases at the '
      + "sheet's own edge so the paper translates sideways, and a frame fitted to the "
      + 'starting box refuses it. Same six folds as Clamped Window, 75% mean trap against '
      + 'its 66%. The rule is properly selective rather than decorative -- under it the '
      + 'butterfly can no longer reach the ring at all, and the cross loses four of its '
      + 'five targets.',
  }),

  shapeLevel({
    key: 'framed-net',
    name: 'Framed Net',
    rows: BUTTERFLY,
    goalRows: ['# # #', '# . #', '# . #'],
    borders: true,
    newConcept: 'The butterfly, boxed in.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: '75% mean trap. Under the frame this sheet cannot reach the ring at all '
      + 'any more, which is the clearest evidence the rule removes real routes.',
  }),
  shapeLevel({
    key: 'tight-frame',
    name: 'Tight Frame',
    rows: WINDOW,
    goalRows: ['# # # #', '# . . #'],
    borders: true,
    newConcept: 'A wide target with nowhere to overhang.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: '83% mean trap -- the tightest measurement in the game, though only four '
      + 'folds long. Short and merciless, deliberately placed between two six-fold levels.',
  }),
  shapeLevel({
    key: 'framed-notch',
    name: 'Framed Notch',
    rows: [
      '# # # # # #',
      '# # # # # #',
      '# # # # # #',
      '# # # # # #',
      '# # # # . .',
      '# # # # . .',
    ],
    goalRows: ['# .', '# #'],
    borders: 1,
    newConcept: 'A bitten corner, and one cell of slack in the frame.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'The frame is padded by one here, so it is not simply the starting box -- '
      + 'a little overhang is legal and the sheet still cannot wander.',
  }),
  shapeLevel({
    key: 'framed-cross',
    name: 'Framed Cross',
    rows: CROSS,
    goalRows: ['# #', '# #'],
    borders: true,
    newConcept: 'The cross loses four of its five targets to the frame. This is the one left.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: 'Chapter close: 69% at four folds, on the sheet the frame constrains hardest.',
  }),

  // --- chapter: pinned AND clamped, the densest in the game ---
  shapeLevel({
    key: 'nailed-and-clamped',
    name: 'Nailed and Clamped',
    rows: [
      '# P . . . # #',
      '# # # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # #', '# . #', '# . #'],
    lockedCreases: [V(5)],
    newConcept: 'A pin and a clamp on the seven-fold sheet. Nothing is free.',
    difficulty: 10,
    expectedFolds: 7,
    designerNotes: '74% mean trap at seven folds -- the longest AND among the tightest. '
      + 'The doorway is the only target that survives a pin and a clamp together at this '
      + 'length; every other goal the sheet can reach went unsolvable under both.',
  }),
  shapeLevel({
    key: 'last-thread',
    name: 'The Last Thread',
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
    lockedCreases: [H(3)],
    newConcept: 'Pinned, clamped, and thirty-three cells to three.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Two constraints on the long cross.',
  }),
  shapeLevel({
    key: 'sealed-window',
    name: 'Sealed Window',
    rows: [
      'P # # # # #',
      '# # # # # #',
      '# # . . # #',
      '# # . . # #',
      '# # # # # #',
      '# # # # # #',
    ],
    goalRows: ['# # #', '# . #', '# # #'],
    lockedCreases: [H(4)],
    newConcept: 'Pin, clamp, and a window that has to live through all six folds.',
    difficulty: 10,
    expectedFolds: 6,
    designerNotes: 'Three things to respect at once, on the sheet that already punished one.',
  }),
  shapeLevel({
    key: 'thick-and-clamped',
    name: 'Thick and Clamped',
    rows: WINDOW,
    goalRows: ['# #', '# #'],
    uniformDepth: 8,
    lockedCreases: [V(1)],
    newConcept: 'Eight sheets deep, exactly, with a clamped line in the way.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: 'Thickness and a clamp: the tidy route to even layers is banned.',
  }),
  shapeLevel({
    key: 'nothing-left',
    name: 'Nothing Left',
    rows: [
      '# P . . . # #',
      '# # # . # # #',
      '. # # # # # .',
      '. . # # # . .',
      '. # # # # # .',
      '# # # . # # #',
      '# # . . . # #',
    ],
    goalRows: ['# # #', '# . #', '# . #'],
    lockedCreases: [H(1)],
    newConcept: 'The same sheet, the same doorway, and the clamp turned the other way.',
    difficulty: 10,
    expectedFolds: 7,
    designerNotes: '77% mean trap at seven folds -- the hardest measured combination of the '
      + 'regular sheets, and the longest level in the game. Deliberately paired with Nailed '
      + 'and Clamped: one clamp line apart on the same puzzle, and the seven folds have '
      + 'nothing in common.',
  }),
];
