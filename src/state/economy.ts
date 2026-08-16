import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'fold/economy/v1';

/** Free hints per day. The solver returns an OPTIMAL move, so this is the
 *  genuinely valuable resource and the one worth charging for.
 *
 *  There is deliberately no lives system here. It was built and removed: at
 *  66-85% mean trap a player experimenting legitimately hits dead positions
 *  constantly, and the implementation charged a life for a position the player
 *  could undo out of a second later -- a fine for a mistake it then handed
 *  back. Folding is a thinking game; the scarce resource is the optimal-move
 *  hint, not permission to play. */
export const FREE_HINTS_PER_DAY = 1;

export interface Economy {
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
  coins: 0,
  hintsUsedToday: 0,
  day: today(),
  streak: 0,
  lastPlayedDay: '',
});

/**
 * Brings a stored economy up to the current day, resetting the daily hint
 * allowance when the date rolls over.
 */
export function settle(economy: Economy): Economy {
  const day = today();
  if (day === economy.day) return economy;
  return { ...economy, hintsUsedToday: 0, day };
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
