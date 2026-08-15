import { describe, expect, it } from 'vitest';
import {
  freshEconomy,
  grantLife,
  LIFE_REGEN_MS,
  MAX_LIVES,
  settle,
  spendLife,
} from '../../state/economy';

describe('lives', () => {
  it('starts the regen clock on the first life lost and not on later ones', () => {
    const t0 = 1_000_000;
    const one = spendLife(freshEconomy(), t0);
    expect(one.lives).toBe(MAX_LIVES - 1);
    expect(one.nextLifeAt).toBe(t0 + LIFE_REGEN_MS);

    // Losing another life must not push the pending life further away.
    const two = spendLife(one, t0 + 60_000);
    expect(two.lives).toBe(MAX_LIVES - 2);
    expect(two.nextLifeAt).toBe(t0 + LIFE_REGEN_MS);
  });

  it('regenerates from the clock, so time passes while the app is closed', () => {
    const t0 = 1_000_000;
    let e = spendLife(spendLife(spendLife(freshEconomy(), t0), t0), t0);
    expect(e.lives).toBe(MAX_LIVES - 3);

    // Two intervals later: exactly two lives back, not three.
    e = settle(e, t0 + LIFE_REGEN_MS * 2 + 5);
    expect(e.lives).toBe(MAX_LIVES - 1);

    // Long after: full, and the timer switched off.
    e = settle(e, t0 + LIFE_REGEN_MS * 50);
    expect(e.lives).toBe(MAX_LIVES);
    expect(e.nextLifeAt).toBe(0);
  });

  it('never exceeds the cap', () => {
    let e = freshEconomy();
    e = grantLife(e);
    expect(e.lives).toBe(MAX_LIVES);
    e = settle(grantLife(spendLife(e, 1000)), 1000);
    expect(e.lives).toBe(MAX_LIVES);
  });

  it('spending at zero is a no-op rather than going negative', () => {
    let e = { ...freshEconomy(), lives: 0, nextLifeAt: 500 };
    e = spendLife(e, 1000);
    expect(e.lives).toBe(0);
    expect(e.nextLifeAt).toBe(500);
  });
});
