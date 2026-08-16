import { describe, expect, it } from 'vitest';
import { freshEconomy, hintsLeftToday, settle, touchStreak } from '../../state/economy';

describe('daily hint allowance', () => {
  it('resets when the date rolls over and holds within a day', () => {
    const used = { ...freshEconomy(), hintsUsedToday: 1 };
    expect(hintsLeftToday(used)).toBe(0);
    expect(hintsLeftToday(settle(used))).toBe(0); // same day, still spent

    const stale = { ...used, day: '2000-01-01' };
    expect(hintsLeftToday(settle(stale))).toBe(1);
  });
});

describe('streak', () => {
  it('counts consecutive days and is idempotent within one day', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const e = touchStreak({ ...freshEconomy(), streak: 4, lastPlayedDay: yesterday });
    expect(e.streak).toBe(5);
    expect(touchStreak(e).streak).toBe(5); // opening the app again changes nothing
  });

  it('restarts after a missed day', () => {
    const e = touchStreak({ ...freshEconomy(), streak: 9, lastPlayedDay: '2000-01-01' });
    expect(e.streak).toBe(1);
  });
});
