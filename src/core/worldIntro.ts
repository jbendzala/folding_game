import { activeRules } from './rules';
import type { LevelDefinition } from './types';

export interface WorldIntro {
  world: number;
  name: string;
  /** Rules that appear in this world and in no earlier one. */
  newRules: { label: string; detail: string }[];
  /** One line describing what the world is about. */
  blurb: string;
}

/**
 * Works out what is new about a world by diffing its rules against every
 * earlier world's.
 *
 * Hand-written blurbs would drift the moment a chapter moves, and chapters
 * have moved a lot -- Threading was authored for the end and now sits in the
 * middle. Deriving the "new here" set from the levels themselves means the
 * introduction is always telling the truth about what the player is about to
 * meet, which is the same reason the legend chips are derived rather than
 * tagged (see rules.ts).
 */
export function worldIntro(world: number, levels: LevelDefinition[], name: string): WorldIntro {
  const seenBefore = new Set<string>();
  for (const level of levels) {
    if (level.world >= world) continue;
    for (const rule of activeRules(level)) seenBefore.add(rule.key);
  }

  const newRules: { label: string; detail: string }[] = [];
  const added = new Set<string>();
  for (const level of levels) {
    if (level.world !== world) continue;
    for (const rule of activeRules(level)) {
      // TARGET is on every level ever, so it is never news.
      if (rule.key === 'target') continue;
      // Keyed, not labelled: "x2 THICK" and "x4 THICK" are one rule with a
      // number in it, and announcing the same rule again at every new number
      // would be noise.
      if (seenBefore.has(rule.key) || added.has(rule.key)) continue;
      added.add(rule.key);
      newRules.push({ label: rule.label, detail: rule.detail });
    }
  }

  // A world with no new rule still gets a proper welcome rather than a
  // disclaimer about what it lacks. Twelve of the twenty are in that position,
  // so "no new rules" as a headline would be the most common thing the game
  // ever says to the player.
  const inWorld = levels.filter((l) => l.world === world);
  const longest = Math.max(...inWorld.map((l) => l.expectedFolds));
  const blurb = newRules.length
    ? 'Something new in this one.'
    : `${inWorld.length} new sheets, up to ${longest} folds deep. Everything you know, harder.`;

  return { world, name, newRules, blurb };
}
