import type { LevelDefinition } from '../../core/types';
import { shapeLevel } from './helpers';

const H = (line: number) => ({ axis: 'horizontal' as const, line, moves: 'lower' as const });

/**
 * Chapter 6 -- "Masterpieces"
 * The big recognizable silhouettes, each folded into another shape worth
 * looking at, and each carrying a second constraint now.
 */
export const world6Levels: LevelDefinition[] = [
  shapeLevel({
    key: 'arrowhead',
    name: 'Arrowhead',
    rows: [
      '. . # . .',
      '. # # # .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['# .', '# #', '# .'],
    newConcept: 'Four folds to a key shape -- the arrow has to fold clean off its own edge.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '74% mean trap, up from 63%. The eight-cell target is most of a solid block, so nearly every fold that tidies the wings away also destroys it. ' + '61% mean trap with an overhang fold. Was a single fold.',
  }),
  shapeLevel({
    key: 'butterfly',
    name: 'Butterfly',
    rows: [
      'P . . . #',
      '# # . # #',
      '. # # # .',
      '# # . # #',
      '# . . . #',
    ],
    goalRows: ['# # #', '# # #', '# . #'],
    newConcept: 'Four folds to a solid block with one notch left in it.',
    difficulty: 8,
    expectedFolds: 4,
    designerNotes: '63% mean trap. Patch a gap by accident and it is lost.',
  }),
  shapeLevel({
    key: 'iron-cross',
    name: 'Iron Cross',
    rows: [
      '. . P . .',
      '. . # . .',
      '# # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['# # #', '. # .', '. # .'],
    newConcept: 'Turn the cross into a T, with its head pinned to the table.',
    difficulty: 9,
    expectedFolds: 4,
    designerNotes: '74% mean trap, up from 63%. The plus was symmetric, so half its folds '
      + 'were interchangeable; the T has a top and a bottom and they are not. Overhang '
      + 'still required.',
  }),
  shapeLevel({
    key: 'pinned-cross',
    name: 'Pinned Cross',
    rows: [
      '. . # . .',
      '. . # . .',
      'P # # # #',
      '. . # . .',
      '. . # . .',
    ],
    goalRows: ['. # .', '. # .', '# # #', '. # .', '. # .'],
    newConcept: 'The same cross with an arm nailed down -- the easy half is gone.',
    difficulty: 9,
    expectedFolds: 2,
    designerNotes: 'Pairs with 28: identical goal, and the route that solved it is illegal.',
  }),
  shapeLevel({
    key: 'pinned-masterpiece',
    name: 'The Kite',
    rows: [
      '. . # . .',
      '. # # # .',
      '# # # # #',
      '. # # # .',
      '. # # # .',
      '. . # . .',
    ],
    goalRows: ['# .', '# #', '# .'],
    lockedCreases: [H(3)],
    newConcept: 'A clamped kite down to a T -- the chapter ends on a different shape entirely.',
    difficulty: 10,
    expectedFolds: 4,
    designerNotes: '81% mean trap, up from 73%. This was the pinned diamond with the target '
      + 'of the level before it mirrored -- the same puzzle reflected, which is why both sat '
      + 'at exactly 73%. A longer sheet, a clamp instead of a pin, and a target that is not a '
      + "reflection of anything, so the chapter's last two levels no longer rhyme.",
  }),
];
