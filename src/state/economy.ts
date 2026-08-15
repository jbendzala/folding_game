import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'fold/economy/v1';

export const MAX_LIVES = 5;
/** Milliseconds to regenerate one life. */
export const LIFE_REGEN_MS = 20 * 60 * 1000;
/** Free hints per day. The solver returns an OPTIMAL move, so this is the
 *  genuinely valuable resource and the one worth charging for. */
export const FREE_HINTS_PER_DAY = 1;

export interface Economy {
  lives: number;
  /** Epoch ms when the next life lands. 0 when already full. */
  nextLifeAt: number;
  coins: number;
  hintsUsedToday: number;
  /** Local YYYY-MM-DD the daily counters belong to. */
  day: string;
  /** Consecutive days played, for the streak reward. */
  streak: number;
  lastPlayedDay: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export const freshEconomy = (): Economy => ({
  lives: MAX_LIVES,
  nextLifeAt: 0,
  coins: 0,
  hintsUsedToday: 0,
  day: today(),
  streak: 0,
  lastPlayedDay: '',
});

/**
 * Brings a stored economy up to the current wall clock.
 *
 * Regeneration is computed from a timestamp rather than ticked, so it keeps
 * running while the app is closed and cannot be farmed by relaunching. It is
 * still trivially cheatable by moving the device clock forward -- that needs a
 * server to fix properly, and is not worth one before there is anything to
 * buy.
 */
export function settle(economy: Economy, now = Date.now()): Economy {
  let { lives, nextLifeAt } = economy;

  if (lives < MAX_LIVES && nextLifeAt > 0) {
    while (lives < MAX_LIVES && now >= nextLifeAt) {
      lives += 1;
      nextLifeAt = lives >= MAX_LIVES ? 0 : nextLifeAt + LIFE_REGEN_MS;
    }
  }
  if (lives >= MAX_LIVES) nextLifeAt = 0;

  const day = today();
  const rolledOver = day !== economy.day;

  return {
    ...economy,
    lives,
    nextLifeAt,
    hintsUsedToday: rolledOver ? 0 : economy.hintsUsedToday,
    day,
  };
}

export function spendLife(economy: Economy, now = Date.now()): Economy {
  if (economy.lives <= 0) return economy;
  const lives = economy.lives - 1;
  return {
    ...economy,
    lives,
    // Start the clock on the first life lost from full; otherwise the player
    // could lose lives one at a time and keep pushing the timer back.
    nextLifeAt: economy.nextLifeAt > 0 ? economy.nextLifeAt : now + LIFE_REGEN_MS,
  };
}

export function grantLife(economy: Economy): Economy {
  const lives = Math.min(MAX_LIVES, economy.lives + 1);
  return { ...economy, lives, nextLifeAt: lives >= MAX_LIVES ? 0 : economy.nextLifeAt };
}

export const hintsLeftToday = (economy: Economy): number =>
  Math.max(0, FREE_HINTS_PER_DAY - economy.hintsUsedToday);

/** Marks today as played and returns the updated streak. */
export function touchStreak(economy: Economy): Economy {
  const day = today();
  if (economy.lastPlayedDay === day) return economy;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streak = economy.lastPlayedDay === yesterday ? economy.streak + 1 : 1;
  return { ...economy, streak, lastPlayedDay: day };
}

export async function loadEconomy(): Promise<Economy> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return settle(raw ? { ...freshEconomy(), ...(JSON.parse(raw) as Economy) } : freshEconomy());
  } catch {
    return freshEconomy();
  }
}

export async function saveEconomy(economy: Economy): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(economy));
  } catch {
    // Non-fatal.
  }
}
