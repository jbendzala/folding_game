import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

const V = (line: number) => ({ axis: 'vertical' as const, line, moves: 'lower' as const });

/**
 * Combination chapters. Every rule has been taught by now, so nothing here
 * introduces anything -- these are the pairs and triples the teaching
 * chapters exist to make possible.
 *
 * They also answer a fair complaint about the blocked chapter: five levels
 * on one rule all end up asking the same question ("fold past the block"),
 * because with a single constraint and a small target there is only one kind
 * of thinking available. Pairing a block with a pin, a clamp or a hole to
 * keep alive changes what the block is FOR each time.
 */
export const comboLevels: LevelDefinition[] = [
  // --- chapter: blocks meet the older rules ---
  shapeLevel({
    key: 'ring-around',
    name: 'Ring Around',
    rows: ['P # # # # #', '# # X # # #', '# # # # # #'],
    goalRows: ['# # #', '# . #', '# # #'],
    newConcept: 'A pin, a block, and a hole that has to survive both.',
    difficulty: 9,
    expectedFolds: 3,
    designerNotes: '68% mean trap. Different thinking from the blocked chapter: the target '
      + 'keeps a hole, so collapsing everything is exactly wrong.',
  }),
  shapeLevel({
    key: 'gap-in-the-wall',
    name: 'Gap in the Wall',
    rows: ['# # # # # #', 'X X . X X .', '# # # # # #'],
    goalRows: ['# #'],
    uniformDepth: 6,
    newConcept: 'A wall with two gaps -- the sheet has to thread through them.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: 'Blocks arranged as a barrier rather than scattered, so the question '
      + 'becomes where the paper can pass rather than which way to fold.',
  }),
  shapeLevel({
    key: 'clamped-hollow',
    name: 'Clamped Hollow',
    rows: ['# # # # #', '# . . . #', '# # # # #'],
    goalRows: ['#', '#', '#'],
    lockedCreases: [V(2)],
    newConcept: 'A hollow sheet with its middle clamped: collapse it the long way.',
    difficulty: 9,
    expectedFolds: 3,
    designerNotes: '66% mean trap. The clamp bans the fold that closes the hollow tidily.',
  }),
  shapeLevel({
    key: 'threaded-pin',
    name: 'Threaded Pin',
    rows: ['P # # # # # #', '# # X # X # #', '# # # # # # #'],
    goalRows: ['#', '#'],
    newConcept: 'Two blocks, a pinned corner, and twenty cells to get down to two.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: '68% mean trap over four folds -- squarely in the Endgame band.',
  }),
  shapeLevel({
    key: 'threaded-wide',
    name: 'Threaded Wide',
    rows: ['P # # # # # #', '# # X # X # #', '# # # # # # #'],
    goalRows: ['# #'],
    newConcept: 'The same sheet and a wider target, which is the harder ask.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: 'Pairs with Threaded Pin: same start, and the route is not the same.',
  }),
];
