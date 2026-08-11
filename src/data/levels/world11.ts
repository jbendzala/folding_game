import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

/**
 * Chapter 11 -- "Two Sides"
 * The sheet has a front and a back. Folding flips the moving part, so it
 * lands showing its coloured underside, and the goal now says which face
 * must be showing on every cell -- not just which cells are covered.
 *
 * This makes fold ORDER visible for the first time. Folding one end of a
 * strip over and folding the other end over produce the same outline but
 * mirrored patterns, so a pattern goal separates solutions the silhouette
 * alone treats as identical. Measured: these run 65-88% mean trap at only
 * one to three folds, far tighter than a silhouette of the same length.
 *
 * Goal art: '#' must finish showing the front, 'B' the back.
 */
export const world11Levels: LevelDefinition[] = [
  shapeLevel({
    id: 51,
    name: 'Show Your Back',
    world: 11,
    rows: ['# # # #', '# # # #'],
    goalRows: ['B # #', 'B # #'],
    newConcept: 'NEW: the paper has two sides. Fold one over and its colour shows.',
    difficulty: 4,
    expectedFolds: 1,
    designerNotes: 'The whole rule in one fold: which column ends up coloured is the puzzle.',
  }),
  shapeLevel({
    id: 52,
    name: 'Left or Right',
    world: 11,
    rows: ['# # # #'],
    goalRows: ['# # B'],
    newConcept: 'Same outline either way -- only the coloured end says which fold was right.',
    difficulty: 5,
    expectedFolds: 1,
    designerNotes: 'The clearest demonstration: fold either end and the silhouette matches, '
      + 'but only one puts the colour where the goal wants it.',
  }),
  shapeLevel({
    id: 53,
    name: 'Two Tone',
    world: 11,
    rows: ['# # # #', '# # # #'],
    goalRows: ['B #', 'B #'],
    newConcept: 'Two folds, and the colour has to survive the second one.',
    difficulty: 6,
    expectedFolds: 2,
    designerNotes: '73% mean trap. Folding again over a coloured cell flips it back to pale.',
  }),
  shapeLevel({
    id: 54,
    name: 'Bookend',
    world: 11,
    rows: ['# # # # # #'],
    goalRows: ['B # # B'],
    newConcept: 'Colour at both ends, pale in the middle -- fold in from each side.',
    difficulty: 7,
    expectedFolds: 2,
    designerNotes: '84% mean trap. Symmetric target, and both folds have to be exact.',
  }),
  shapeLevel({
    id: 55,
    name: 'Alternating',
    world: 11,
    rows: ['# # # # # #'],
    goalRows: ['B # B'],
    newConcept: 'Colour, pale, colour. Three folds and every one of them flips something.',
    difficulty: 8,
    expectedFolds: 3,
    designerNotes: 'The chapter finale: 79% mean trap, and no silhouette goal could ask '
      + 'for this shape at all -- it is a plain 1x3 strip.',
  }),
];
