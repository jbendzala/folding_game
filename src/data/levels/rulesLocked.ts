import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

const V = (line: number) => ({ axis: 'vertical' as const, line, moves: 'lower' as const });
const H = (line: number) => ({ axis: 'horizontal' as const, line, moves: 'lower' as const });

/**
 * Locked creases: a grid line clamped to the table, which cannot be folded
 * whichever way you push it. A pin bans folds by which SIDE moves; this bans
 * one position outright, so the two constrain completely different things.
 */
export const lockedLevels: LevelDefinition[] = [
  shapeLevel({
    key: 'clamped',
    name: 'Clamped',
    rows: ['# # # #'],
    goalRows: ['# # B'],
    lockedCreases: [V(1)],
    newConcept: 'NEW: a clamped line cannot be creased. The obvious half-fold is gone.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'The clamp removes the tempting middle fold. A plain 1x3 goal was not '
      + 'enough -- every remaining fold reached it, which the difficulty guard caught -- so '
      + 'the target names which end must finish coloured, and only one fold does that.',
  }),
  shapeLevel({
    key: 'clamped-corner',
    name: 'Clamped Corner',
    rows: ['# # #', '# # #', '# # #'],
    goalRows: ['# #', '# #'],
    lockedCreases: [V(0), H(0)],
    newConcept: 'Two clamps, one on each axis -- only the far lines are left.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'Reads instantly: the dashed lines say where you cannot go.',
  }),
  shapeLevel({
    key: 'clamped-notch',
    name: 'Clamped Notch',
    rows: ['# # #', '# # #', '# # .'],
    goalRows: ['# #', '# #', '# #'],
    lockedCreases: [H(1)],
    newConcept: 'A clamp plus a hole: the fold that patches the gap is banned.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: 'The obvious patch folds the bottom row up, and that line is clamped. '
      + 'Patching sideways works, and lands the sheet on its other axis.',
  }),
  shapeLevel({
    key: 'clamped-pin',
    name: 'Clamped Pin',
    rows: ['P # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    lockedCreases: [V(0)],
    newConcept: 'Pin and clamp together: one bans a direction, the other a position.',
    difficulty: 7,
    expectedFolds: 1,
    designerNotes: 'The clearest demonstration that the two rules are not the same thing.',
  }),
  shapeLevel({
    key: 'clamped-strip',
    name: 'Clamped Strip',
    rows: ['# # # # # #'],
    goalRows: ['# #'],
    lockedCreases: [V(2)],
    newConcept: 'Six cells to two, with the centre line clamped shut.',
    difficulty: 7,
    expectedFolds: 2,
    designerNotes: 'Chapter finale: the accordion has to start from the wrong end.',
  }),
];
