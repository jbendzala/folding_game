import { shapeFromRows } from '../../core/parseShape';
import type { LevelDefinition } from '../../core/types';

/**
 * Worlds 1-2 share one goal type: fold the whole sheet down to a single 1x1
 * result that sits exactly at the marked '*' cell's own original board
 * position. Position, not topmost layer, is what fold direction actually
 * controls here -- folding away from the target keeps it stationary, so it
 * never leaves its own coordinate; fold the wrong way and the final cell
 * lands somewhere else on the board instead. (Every cell, mind you, ends up
 * in that one final stack regardless -- a full reduction can't leave any
 * paper behind. Only *where* that stack sits is up for grabs.)
 *
 * This builds that LevelDefinition from ASCII rows so each level file only
 * has to state the interesting part: the shape and the metadata.
 */
export function singleCellLevel(params: {
  id: number;
  name: string;
  world: number;
  rows: string[];
  newConcept: string;
  difficulty: number;
  expectedFolds: number;
  designerNotes: string;
}): LevelDefinition {
  const { shape, markers } = shapeFromRows(params.rows);
  const target = markers.get('target');
  if (!target) {
    throw new Error(`Level ${params.id} (${params.name}): starting art has no '*' target marker`);
  }

  return {
    id: params.id,
    name: params.name,
    world: params.world,
    start: shape,
    goal: {
      shape: { width: 1, height: 1, cells: [{ row: 0, col: 0 }] },
      anchor: target,
    },
    newConcept: params.newConcept,
    difficulty: params.difficulty,
    expectedFolds: params.expectedFolds,
    designerNotes: params.designerNotes,
  };
}
