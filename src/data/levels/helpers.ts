import { shapeFromRows } from '../../core/parseShape';
import type { CellCoord, Fold, LevelDefinition } from '../../core/types';

/**
 * Shape-goal level: fold the sheet into a target silhouette -- anywhere on
 * the board, but the outline (including holes) must match exactly. Both
 * start and goal come from ASCII rows. Options:
 *  - uniformDepth: the final shape must also be exactly N layers thick
 *    everywhere (conservation-checked at build time).
 *  - Pins come from 'P' tokens in the starting art.
 */
export function shapeLevel(params: {
  id: number;
  name: string;
  world: number;
  rows: string[];
  goalRows: string[];
  uniformDepth?: number;
  /** Grid lines that can never be creased. */
  lockedCreases?: Fold[];
  /** Board cells the paper may never cover ('X' in the starting art). */
  forbidden?: CellCoord[];
  /** Layer ceiling -- a fold stacking more than this on any cell is refused. */
  maxDepth?: number;
  newConcept: string;
  difficulty: number;
  expectedFolds: number;
  designerNotes: string;
}): LevelDefinition {
  const { shape: start, pins, forbidden } = shapeFromRows(params.rows);
  const { shape: goalShape, backCells } = shapeFromRows(params.goalRows);

  if (params.uniformDepth !== undefined) {
    const need = goalShape.cells.length * params.uniformDepth;
    if (need !== start.cells.length) {
      throw new Error(
        `Level ${params.id} (${params.name}): uniformDepth ${params.uniformDepth} needs ` +
          `${need} start cells but the shape has ${start.cells.length} -- paper is conserved`
      );
    }
  }

  return {
    id: params.id,
    name: params.name,
    world: params.world,
    start,
    goal: {
      shape: goalShape,
      ...(params.uniformDepth !== undefined ? { uniformDepth: params.uniformDepth } : {}),
      ...(backCells.length > 0 ? { backCells } : {}),
    },
    ...(() => {
      const constraints = {
        ...(pins.length > 0 ? { pins } : {}),
        ...(params.lockedCreases ? { lockedCreases: params.lockedCreases } : {}),
        ...(forbidden.length > 0 || params.forbidden
          ? { forbidden: [...forbidden, ...(params.forbidden ?? [])] }
          : {}),
        ...(params.maxDepth !== undefined ? { maxDepth: params.maxDepth } : {}),
      };
      return Object.keys(constraints).length > 0 ? { constraints } : {};
    })(),
    newConcept: params.newConcept,
    difficulty: params.difficulty,
    expectedFolds: params.expectedFolds,
    designerNotes: params.designerNotes,
  };
}

/**
 * Tutorial goal type: fold the whole sheet down to a single 1x1 result that
 * sits exactly at the marked '*' (or pinned '@') cell's own original board
 * position. Position, not topmost layer, is what fold direction actually
 * controls here -- folding away from the target keeps it stationary, so it
 * never leaves its own coordinate; fold the wrong way and the final cell
 * lands somewhere else on the board instead. (Every cell, mind you, ends up
 * in that one final stack regardless -- a full reduction can't leave any
 * paper behind. Only *where* that stack sits is up for grabs.)
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
  const { shape, markers, pins } = shapeFromRows(params.rows);
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
    ...(pins.length > 0 ? { constraints: { pins } } : {}),
    newConcept: params.newConcept,
    difficulty: params.difficulty,
    expectedFolds: params.expectedFolds,
    designerNotes: params.designerNotes,
  };
}
