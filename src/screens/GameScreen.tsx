import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PaperCanvas } from '../components/PaperCanvas';
import { FailModal } from '../components/FailModal';
import { WorldIntroModal } from '../components/WorldIntroModal';
import {
  activeRules,
  checkGoal,
  createInitialState,
  isGoalStillReachable,
  isValidFold,
  replayFolds,
  solve,
} from '../core';
import type { Fold, LevelDefinition } from '../core/types';
import { worldIntro } from '../core/worldIntro';
import { allLevels, CHAPTERS } from '../data/levels';
import {
  grantLife,
  loadEconomy,
  saveEconomy,
  spendLife,
  type Economy,
} from '../state/economy';
import { loadSeenWorlds, markWorldSeen, starsFor } from '../state/progress';
import { theme, worldPalette } from '../theme';

// Hints and undo are unrestricted for now. A future limit (daily allowance,
// purchasable extras) goes here rather than being sprinkled through the
// component: set a number and the button gates itself.
const HINT_LIMIT: number | null = null; // null = unlimited

interface GameScreenProps {
  level: LevelDefinition;
  onExit: () => void;
  onSolved: (folds: number) => void;
  onNextLevel: (() => void) | null;
}

export function GameScreen({ level, onExit, onSolved, onNextLevel }: GameScreenProps) {
  // Real insets rather than the hand-tuned padding this used to carry: on a
  // notched iPhone the header sat under the Dynamic Island, and on a phone
  // without one the fixed padding was simply too much.
  const insets = useSafeAreaInsets();
  // Each world folds in its own colour; the indicator is its complement, so
  // goal tints and crease lines never sink into the paper.
  const palette = worldPalette(level.world);
  const rules = useMemo(() => activeRules(level), [level]);
  const [folds, setFolds] = useState<Fold[]>([]);
  const [hintFold, setHintFold] = useState<Fold | null>(null);
  const [showSolved, setShowSolved] = useState(false);
  // The world's introduction, shown once on its first level. Held as null
  // until storage answers so it cannot flash up for a world already seen.
  const [showIntro, setShowIntro] = useState(false);
  const isWorldOpener = useMemo(
    () => allLevels.find((l) => l.world === level.world)?.id === level.id,
    [level]
  );
  const intro = useMemo(
    () => worldIntro(level.world, allLevels, CHAPTERS[level.world - 1]?.name ?? `World ${level.world}`),
    [level.world]
  );

  useEffect(() => {
    if (!isWorldOpener) return;
    let cancelled = false;
    loadSeenWorlds().then((seen) => {
      if (!cancelled && !seen.includes(level.world)) setShowIntro(true);
    });
    return () => {
      cancelled = true;
    };
  }, [isWorldOpener, level.world]);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportedRef = useRef(false);
  const [economy, setEconomy] = useState<Economy | null>(null);
  const [showFail, setShowFail] = useState(false);
  // A life is charged once per dead position, not once per render.
  const chargedRef = useRef(false);

  useEffect(() => {
    loadEconomy().then(setEconomy);
  }, []);

  // Reset the per-attempt fail state when the level changes.
  useEffect(() => {
    setShowFail(false);
    chargedRef.current = false;
  }, [level.key]);

  const state = useMemo(
    () => replayFolds(() => createInitialState(level.start, level.constraints), folds),
    [level, folds]
  );
  const solved = useMemo(() => checkGoal(state, level.goal), [state, level]);
  // Provably dead position. Not a failure state -- undo is right there -- so
  // this only warns, and never blocks play.
  const stuck = useMemo(
    () => !solved && folds.length > 0 && !isGoalStillReachable(state, level.goal),
    [state, level, solved, folds.length]
  );

  // Let the fold animation land before celebrating.
  useEffect(() => {
    if (!solved) {
      setShowSolved(false);
      reportedRef.current = false;
      return;
    }
    if (!reportedRef.current) {
      reportedRef.current = true;
      onSolved(folds.length);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    const t = setTimeout(() => setShowSolved(true), 350);
    return () => clearTimeout(t);
  }, [solved]);

  function clearHint() {
    if (hintTimer.current) clearTimeout(hintTimer.current);
    setHintFold(null);
  }

  // A short warning buzz the moment the position goes dead, so the player
  // does not fold on for another three moves before noticing.
  const wasStuck = useRef(false);
  useEffect(() => {
    if (stuck && !wasStuck.current) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      // The engine has PROVED this cannot be won, so charging here is honest
      // in a way a move limit or a timer never is.
      if (!chargedRef.current && economy) {
        chargedRef.current = true;
        const next = spendLife(economy);
        setEconomy(next);
        void saveEconomy(next);
      }
      setShowFail(true);
    }
    wasStuck.current = stuck;
  }, [stuck, economy]);

  function handleFold(fold: Fold) {
    // Defensive: a gesture racing a re-render could hand us a fold computed
    // against a stale state. Dropping it beats crashing the replay.
    if (!isValidFold(state, fold)) return;
    clearHint();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFolds((prev) => [...prev, fold]);
  }

  function undo() {
    clearHint();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFolds((prev) => prev.slice(0, -1));
  }

  function reset() {
    clearHint();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFolds([]);
  }

  function showHint() {
    if (solved) return;
    const cap = Math.max(level.expectedFolds - folds.length + 2, 2);
    const path = solve(state, level.goal, cap);
    if (!path || path.length === 0) {
      // Player has folded into a dead end -- the honest hint is "back up".
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setHintFold(path[0]);
    if (hintTimer.current) clearTimeout(hintTimer.current);
    hintTimer.current = setTimeout(() => setHintFold(null), 2400);
  }

  const canvasSize = Math.min(Dimensions.get('window').width - 16, 460);
  const stars = starsFor(level, folds.length);
  const overPar = folds.length > level.expectedFolds;

  // The board cells the final shape must cover (goal silhouette placed at
  // its anchor). Worlds 1-2: a single cell.
  const goalCells = useMemo(() => {
    const anchor = level.goal.anchor;
    if (!anchor) return undefined;
    return level.goal.shape.cells.map((c) => ({
      row: c.row + anchor.row,
      col: c.col + anchor.col,
    }));
  }, [level]);

  return (
    <View style={[styles.root, { paddingTop: insets.top + 28, backgroundColor: palette.bg }]}>
      {/* header */}
      <View style={styles.header}>
        <Pressable style={[styles.backButton, { backgroundColor: palette.bgRaised }]} onPress={onExit} hitSlop={12}>
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.eyebrow}>
            WORLD {level.world} · LEVEL {level.id}
          </Text>
          <Text style={styles.title}>{level.name}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* which rules are in play -- derived from the level, never hand-tagged */}
      {rules.length > 0 && (
        <View style={styles.legendRow}>
          {rules.map((rule) => (
            <View key={rule.key} style={[styles.legendChip, { borderColor: palette.tintSoft }]}>
              <Text style={[styles.legendText, { color: palette.tint }]}>{rule.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* silhouette goal preview (worlds with shape goals, no board anchor) */}
      {!goalCells && (
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>GOAL</Text>
          <GoalPreview
            shape={level.goal.shape}
            color={palette.tint}
            backCells={level.goal.backCells}
            backColor={palette.paperDown[2]}
          />
        </View>
      )}

      {/* paper */}
      <View style={styles.stage}>
        <PaperCanvas
          state={state}
          start={level.start}
          size={canvasSize}
          goalCells={goalCells}
          hint={hintFold}
          palette={palette}
          twoSided={level.goal.backCells !== undefined}
          onFold={handleFold}
        />
      </View>

      {/* dead position: inform, do not block */}
      {stuck && (
        <Animated.View entering={FadeIn.duration(180)} style={styles.stuckBar}>
          <Text style={styles.stuckText}>No way to the goal from here</Text>
          <Pressable onPress={undo} hitSlop={8}>
            <Text style={styles.stuckAction}>Undo</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* fold counter -- its own row so nothing can obscure it */}
      <View style={styles.counterRow}>
        <Text style={styles.counterLabel}>FOLDS</Text>
        <Text style={[styles.counterValue, overPar && { color: palette.tint }]}>
          {folds.length}
        </Text>
        <Text style={styles.counterPar}>/ {level.expectedFolds}</Text>
      </View>

      {/* controls */}
      <View style={styles.controls}>
        <ControlButton label="Undo" onPress={undo} disabled={folds.length === 0} />
        <ControlButton label="Reset" onPress={reset} disabled={folds.length === 0} />
        <ControlButton label="Hint" onPress={showHint} disabled={solved} accentColor={palette.tint} />
      </View>

      <View style={{ paddingBottom: insets.bottom + 20 }} />

      {showFail && economy && (
        <FailModal
          lives={economy.lives}
          nextLifeAt={economy.nextLifeAt}
          palette={palette}
          onUndo={() => {
            setShowFail(false);
            undo();
          }}
          onRestart={() => {
            setShowFail(false);
            chargedRef.current = false;
            reset();
          }}
          onWatchAd={() => {
            // Placeholder until the ad SDK lands: grants the life directly so
            // the flow can be played end to end.
            const next = grantLife(economy);
            setEconomy(next);
            void saveEconomy(next);
            setShowFail(false);
            undo();
          }}
          onExit={onExit}
        />
      )}

      {showIntro && (
        <WorldIntroModal
          intro={intro}
          palette={palette}
          onDismiss={() => {
            setShowIntro(false);
            void markWorldSeen(level.world);
          }}
        />
      )}

      {/* solved overlay */}
      {showSolved && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
          {/* Deliberately gentle: the card used to spring in from nothing at
              damping 14, which read as a jump. It now starts at 0.7 scale --
              about a third less travel -- and damps harder so it settles
              instead of overshooting. */}
          <Animated.View
            entering={ZoomIn.springify()
              .damping(19)
              .withInitialValues({ transform: [{ scale: 0.7 }] })}
            style={styles.card}
          >
            <Text style={styles.cardTitle}>Folded!</Text>
            <Animated.View entering={FadeInDown.delay(150)} style={styles.starsRow}>
              {[1, 2, 3].map((i) => (
                <Text
                  key={i}
                  style={[styles.star, i > stars && styles.starDim]}
                >
                  ★
                </Text>
              ))}
            </Animated.View>
            <Text style={styles.cardSub}>
              {folds.length} fold{folds.length === 1 ? '' : 's'}
              {folds.length <= level.expectedFolds
                ? ' — perfect!'
                : ` (best is ${level.expectedFolds})`}
            </Text>
            <View style={styles.cardButtons}>
              <Pressable style={styles.secondaryButton} onPress={reset}>
                <Text style={styles.secondaryLabel}>Replay</Text>
              </Pressable>
              {onNextLevel && (
                <Pressable style={[styles.primaryButton, { backgroundColor: palette.tint }]} onPress={onNextLevel}>
                  <Text style={styles.primaryLabel}>Next Level</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

/** Tiny rendering of the target silhouette, shown when the goal is a shape
 * (not a board-anchored cell). */
function GoalPreview({
  shape,
  color,
  backCells,
  backColor,
}: {
  shape: { width: number; height: number; cells: { row: number; col: number }[] };
  color: string;
  /** Two-sided levels: these cells must finish showing the sheet's back. */
  backCells?: { row: number; col: number }[];
  backColor?: string;
}) {
  const wantsBack = new Set((backCells ?? []).map((c) => `${c.row}:${c.col}`));
  const mini = Math.min(Math.floor(64 / Math.max(shape.width, shape.height)), 16);
  return (
    <View
      style={{
        width: shape.width * mini,
        height: shape.height * mini,
      }}
    >
      {shape.cells.map((c) => (
        <View
          key={`${c.row}:${c.col}`}
          style={{
            position: 'absolute',
            left: c.col * mini,
            top: c.row * mini,
            width: mini,
            height: mini,
            backgroundColor:
              !backCells
                ? color
                : wantsBack.has(`${c.row}:${c.col}`)
                  ? backColor
                  : theme.colors.ink,
            borderWidth: 0.5,
            borderColor: theme.colors.bgRaised,
          }}
        />
      ))}
    </View>
  );
}

function ControlButton({
  label,
  onPress,
  disabled,
  accentColor,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accentColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.controlButton,
        accentColor ? { backgroundColor: `${accentColor}26` } : null,
        pressed && styles.controlButtonPressed,
        disabled && styles.controlButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.controlLabel,
          accentColor ? { color: accentColor } : null,
          disabled && styles.controlLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backGlyph: {
    color: theme.colors.ink,
    fontSize: 26,
    lineHeight: 30,
    marginTop: -2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eyebrow: {
    color: theme.colors.inkFaint,
    fontSize: theme.font.tiny,
    fontWeight: '700',
    letterSpacing: 2,
  },
  title: {
    color: theme.colors.ink,
    fontSize: theme.font.heading,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 40,
  },
  stuckBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginHorizontal: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255, 92, 105, 0.14)',
  },
  stuckText: {
    color: theme.colors.danger,
    fontSize: theme.font.small,
    fontWeight: '700',
  },
  stuckAction: {
    color: theme.colors.ink,
    fontSize: theme.font.small,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 14,
    paddingBottom: 12,
  },
  counterLabel: {
    color: theme.colors.inkFaint,
    fontSize: theme.font.tiny,
    fontWeight: '800',
    letterSpacing: 2,
  },
  counterValue: {
    color: theme.colors.ink,
    fontSize: 26,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
  counterOver: {
    color: theme.colors.accent,
  },
  counterPar: {
    color: theme.colors.inkSoft,
    fontSize: theme.font.body,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  foldPill: {
    minWidth: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bgRaised,
    alignItems: 'center',
  },
  foldPillOver: {
    backgroundColor: theme.colors.accentSoft,
  },
  foldPillText: {
    color: theme.colors.ink,
    fontWeight: '800',
    fontSize: theme.font.body,
    fontVariant: ['tabular-nums'],
  },
  foldPillTextOver: {
    color: theme.colors.accent,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 12,
    paddingHorizontal: 24,
  },
  legendChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
  },
  legendText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 18,
  },
  goalLabel: {
    color: theme.colors.inkFaint,
    fontSize: theme.font.tiny,
    fontWeight: '800',
    letterSpacing: 2,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 20,
  },
  controlButton: {
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bgRaised,
  },
  controlButtonAccent: {
    backgroundColor: theme.colors.accentSoft,
  },
  controlButtonPressed: {
    opacity: 0.7,
  },
  controlButtonDisabled: {
    opacity: 0.35,
  },
  controlLabel: {
    color: theme.colors.ink,
    fontWeight: '700',
    fontSize: theme.font.body,
  },
  controlLabelAccent: {
    color: theme.colors.accent,
  },
  controlLabelDisabled: {
    color: theme.colors.inkFaint,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.bgOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '80%',
    maxWidth: 340,
    backgroundColor: theme.colors.bgRaised,
    borderRadius: theme.radius.card,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 10,
  },
  cardTitle: {
    color: theme.colors.ink,
    fontSize: theme.font.title,
    fontWeight: '900',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    fontSize: 34,
    color: theme.colors.gold,
  },
  starDim: {
    color: theme.colors.locked,
  },
  cardSub: {
    color: theme.colors.inkSoft,
    fontSize: theme.font.body,
  },
  cardButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: theme.radius.pill,
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '800',
    fontSize: theme.font.body,
  },
  secondaryButton: {
    backgroundColor: theme.colors.bg,
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: theme.radius.pill,
  },
  secondaryLabel: {
    color: theme.colors.inkSoft,
    fontWeight: '700',
    fontSize: theme.font.body,
  },
});
