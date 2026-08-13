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
  key: 'target' | 'holes' | 'pins' | 'layers' | 'faces';
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

  if (level.pins?.length) {
    rules.push({
      key: 'pins',
      label: level.pins.length > 1 ? `${level.pins.length} PINS` : 'PIN',
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

  if (level.goal.backCells !== undefined) {
    rules.push({
      key: 'faces',
      label: 'TWO SIDES',
      detail: 'Folding flips the paper over. The goal says which side must show where.',
    });
  }

  return rules;
}
