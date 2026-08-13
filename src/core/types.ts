/**
 * Core, renderer-agnostic types for the Fold game engine.
 *
 * A "sheet" is a fixed bounding grid of unit cells; some are paper, some are
 * holes (never paper). Folding never creates or destroys paper cells, it only
 * moves them and stacks them on top of one another. See src/core/fold.ts for
 * the transform, and docs/design/fold-levels.md for the design rationale.
 */

export type Axis = 'vertical' | 'horizontal';

export interface CellCoord {
  row: number;
  col: number;
}

/** A unit square of the original sheet. Identity never changes after creation. */
export interface OriginalCell {
  id: string;
  initial: CellCoord;
}

/**
 * One fold: a straight line through the CURRENT shape's bounding box, and
 * which side moves onto the other.
 */
export interface Fold {
  axis: Axis;
  /**
   * Boundary index in the CURRENT coordinate system.
   * Vertical fold: `line = k` is the boundary between column k and column k+1.
   * Horizontal fold: `line = k` is the boundary between row k and row k+1.
   */
  line: number;
  /**
   * Which side moves.
   * 'lower' = the side with the smaller row/col index flips onto the higher side.
   * 'upper' = the side with the larger row/col index flips onto the lower side.
   */
  moves: 'lower' | 'upper';
}

export interface CellState {
  cell: OriginalCell;
  position: CellCoord;
  /**
   * Higher = higher in the physical stack at this position (closer to the
   * viewer). Not a simple "fold step number": when an already-stacked group
   * of cells moves together, folding flips it as a rigid block, so its
   * internal order reverses. Only relative order between cells matters --
   * the raw numbers have no meaning on their own.
   */
  zOrder: number;
  /** Toggles on every fold this cell participates in. */
  faceUp: boolean;
}

/**
 * Rules that restrict which folds are legal. All are constant for a level
 * (nothing here moves), and all are enforced in isValidFold, so an illegal
 * fold simply cannot be made rather than being made and then punished.
 */
export interface FoldConstraints {
  /**
   * Board coordinates pinned to the table. A pinned cell can never be on the
   * moving side of a fold; paper may still fold ONTO a pin -- it holds the
   * bottom layer down.
   */
  pins?: CellCoord[];
  /**
   * Grid lines that cannot be creased, as if a rod were clamped across the
   * table. Unlike a pin, which bans folds by which SIDE moves, this bans one
   * specific fold position outright.
   */
  lockedCreases?: Fold[];
  /**
   * Board cells the paper may never cover. The only rule about where paper
   * ends up rather than what it does to itself.
   */
  forbidden?: CellCoord[];
  /**
   * Layer ceiling: a fold that would stack more than this many sheets on any
   * cell is refused -- the paper would tear. The inverse of a uniformDepth
   * goal, and it makes big folds dangerous rather than efficient.
   */
  maxDepth?: number;
}

export interface FoldState {
  cells: CellState[];
  history: Fold[];
  constraints?: FoldConstraints;
}

/** A static shape pattern, normalized so its bounding box starts at (0,0). */
export interface ShapePattern {
  width: number;
  height: number;
  /** Occupied cells only -- anything inside the bounding box and not listed is a hole. */
  cells: CellCoord[];
}

export type StackRequirement =
  | { kind: 'topCell'; at: CellCoord; cellId: string }
  | { kind: 'fullOrder'; at: CellCoord; order: string[] };

export interface LevelGoal {
  /** Normalized silhouette the final result's occupied cells must match. */
  shape: ShapePattern;
  /**
   * If set, the shape's (0,0) must land at this EXACT absolute board
   * coordinate -- position matters, not just silhouette. This is what
   * Worlds 1-2's "fold down to the target cell" goal actually needs: in a
   * full reduction every cell ends up in the same final stack regardless of
   * fold choices, so the only thing fold *direction* can change is WHERE
   * that final cell sits on the original board (folding away from the
   * target keeps it stationary, so it never moves from its own coordinate).
   * Worlds 3+ omit this -- the resulting silhouette can land anywhere.
   */
  anchor?: CellCoord;
  /**
   * If set, every occupied cell of the final shape must be exactly this many
   * layers thick. Turns sloppy folding into visible unevenness: conservation
   * demands |start cells| = |goal cells| * uniformDepth, so every wasted
   * overlap somewhere is a missing layer somewhere else.
   */
  uniformDepth?: number;
  /**
   * Two-sided paper. Cells (in the goal shape's own coordinates) that must
   * finish showing the BACK of the sheet -- i.e. the topmost layer there has
   * been flipped an odd number of times. Every other goal cell must show the
   * front.
   *
   * This is what makes fold ORDER visible. Folding one end of a strip over
   * and folding the other end over produce the same silhouette but mirrored
   * patterns, so a pattern goal tells apart solutions the silhouette alone
   * treats as identical.
   *
   * Undefined means faces are unconstrained, which is every level authored
   * before this existed.
   */
  backCells?: CellCoord[];
  stackRequirements?: StackRequirement[];
}

export interface LevelDefinition {
  /**
   * Stable identity, independent of where the level sits in the curriculum.
   * Order changes constantly during design; progress is saved against this,
   * so reordering never wipes what a player has solved.
   */
  key: string;
  /** Position in the curriculum (1-based). Assigned, not authored. */
  id: number;
  name: string;
  world: number;
  start: ShapePattern;
  goal: LevelGoal;
  /** Rules restricting which folds are legal (pins, locked creases, ...). */
  constraints?: FoldConstraints;
  newConcept: string;
  difficulty: number;
  expectedFolds: number;
  designerNotes: string;
}
