import type { LevelDefinition } from './types';

/**
 * Which rules a level actually uses, derived from its data rather than
 * hand-tagged, so a level can never advertise a rule it does not have (or
 * quietly use one it never mentions).
 *
 * This exists because the game had become silently inconsistent: back faces
 * are painted on two-sided levels and not elsewhere, holes appear without
 * comment, pins look like decoration until you try to fold one. A player has
 * no way to know which rules are in play on the level in front of them.
 */
export interface ActiveRule {
  key: 'target' | 'holes' | 'pins' | 'layers' | 'faces' | 'locked' | 'blocked' | 'tear' | 'bounds';
  /** Short label for the in-level legend. */
  label: string;
  /** One line, for a tap-to-explain popover later. */
  detail: string;
}

export function activeRules(level: LevelDefinition): ActiveRule[] {
  const rules: ActiveRule[] = [];

  if (level.goal.anchor) {
    rules.push({
      key: 'target',
      label: 'TARGET',
      detail: 'Fold the sheet down onto the marked cell.',
    });
  }

  const hasHoles = level.start.cells.length < level.start.width * level.start.height;
  if (hasHoles) {
    rules.push({
      key: 'holes',
      label: 'HOLES',
      detail: 'Paper folded over a gap fills it for good. Gaps you keep clear survive.',
    });
  }

  const pins = level.constraints?.pins;
  if (pins?.length) {
    rules.push({
      key: 'pins',
      label: pins.length > 1 ? `${pins.length} PINS` : 'PIN',
      detail: 'A pinned cell never moves, so folds that would carry it are refused.',
    });
  }

  if (level.goal.uniformDepth !== undefined) {
    rules.push({
      key: 'layers',
      label: `×${level.goal.uniformDepth} THICK`,
      detail: `Every cell of the finished shape must be exactly ${level.goal.uniformDepth} sheets deep.`,
    });
  }

  if (level.constraints?.lockedCreases?.length) {
    rules.push({
      key: 'locked',
      label: 'LOCKED',
      detail: 'The marked line cannot be creased, whichever way you fold it.',
    });
  }

  if (level.constraints?.bounds) {
    rules.push({
      key: 'bounds',
      label: 'BORDERS',
      detail: 'The paper must stay inside the frame. It may not hang over the edge.',
    });
  }

  if (level.constraints?.forbidden?.length) {
    rules.push({
      key: 'blocked',
      label: 'BLOCKED',
      detail: 'The paper may never cover the blocked squares.',
    });
  }

  if (level.constraints?.maxDepth !== undefined) {
    rules.push({
      key: 'tear',
      label: `MAX ×${level.constraints.maxDepth}`,
      detail: `More than ${level.constraints.maxDepth} sheets on one cell would tear the paper.`,
    });
  }

  if (level.goal.backCells !== undefined) {
    rules.push({
      key: 'faces',
      label: 'TWO SIDES',
      detail: 'Folding flips the paper over. The goal says which side must show where.',
    });
  }

  return rules;
}
