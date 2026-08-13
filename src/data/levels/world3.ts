import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 3 -- "Layers"
 * The last new rule, plus the first two levels that ask for two mechanics at
 * once. From here the game stops teaching and starts combining.
 */
export const world3Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'double-over',
    name: 'Double Over',
    rows: ['# # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    uniformDepth: 2,
    newConcept: 'NEW: thickness. The result must be exactly this many sheets everywhere.',
    difficulty: 3,
    expectedFolds: 1,
    designerNotes: 'Easiest possible example, so the chip explains itself.',
  }),
  shapeLevel({
    key: 'four-ply',
    name: 'Four Ply',
    rows: ['# # # #', '# # # #', '# # # #', '# # # #'],
    goalRows: ['# #', '# #'],
    uniformDepth: 4,
    newConcept: 'Two perfect halves make four perfect layers. Any other pair fails.',
    difficulty: 4,
    expectedFolds: 2,
    designerNotes: 'First level where a solved-LOOKING shape is still wrong.',
  }),
  shapeLevel({
    key: 'thick-three',
    name: 'Thick Three',
    rows: ['# # #', '# # #', '# # #'],
    goalRows: ['# # #'],
    uniformDepth: 3,
    newConcept: 'Odd thickness: the letter fold, 1+1+1 rather than 2+1.',
    difficulty: 5,
    expectedFolds: 2,
    designerNotes: 'Everyone knows this one from envelopes.',
  }),
  shapeLevel({
    key: 'blocked-book',
    name: 'Blocked Book',
    rows: ['P . . #', '# . . #', '# # # #'],
    goalRows: ['# .', '# .', '# #'],
    newConcept: 'FIRST COMBINATION: pin plus hole. The pin decides which way it closes.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'Level 5\'s book fold, but one arm is nailed down. 80% trap.',
  }),
  shapeLevel({
    key: 'squash-the-frame',
    name: 'Squash the Frame',
    rows: ['# # # #', '# . . #', '# . . #', '# # # #'],
    goalRows: ['# #', '. #', '. #', '# #'],
    uniformDepth: 2,
    newConcept: 'Hole plus thickness: an enclosed gap, folded to exactly two sheets.',
    difficulty: 6,
    expectedFolds: 1,
    designerNotes: '92% trap, exactly ONE solution. All five rules are now in play.',
  }),
];
