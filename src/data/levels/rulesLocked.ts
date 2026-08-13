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
    key: 'clamped-grid',
    name: 'Clamped Grid',
    rows: ['# # # # # #', '# # # # # #', '# # # # # #'],
    goalRows: ['# #'],
    lockedCreases: [V(2), H(1)],
    newConcept: 'Both middles clamped. Eighteen cells to two, the long way round.',
    difficulty: 8,
    expectedFolds: 4,
    designerNotes: 'The teaching levels are one and two folds because a rule is cheap to '
      + 'demonstrate; this is the same rule made to bite. 56% mean trap over four folds.',
  }),
  shapeLevel({
    key: 'clamped-thick',
    name: 'Clamped Thick',
    rows: ['# # # # # #', '# # # # # #', '# # # # # #'],
    goalRows: ['# # #'],
    uniformDepth: 6,
    lockedCreases: [V(2), H(1)],
    newConcept: 'Clamped on both axes, and every cell must finish six sheets deep.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: 'Chapter finale: the clamps remove the tidy route and the thickness '
      + 'goal refuses anything sloppy.',
  }),
];
