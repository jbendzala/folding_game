import { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { PaperCanvas } from '../components/PaperCanvas';
import { checkGoal, createInitialState, isValidFold, replayFolds, solve } from '../core';
import type { Fold, LevelDefinition } from '../core/types';
import { starsFor } from '../state/progress';
import { theme } from '../theme';

const HINTS_PER_LEVEL = 3;

interface GameScreenProps {
  level: LevelDefinition;
  onExit: () => void;
  onSolved: (folds: number) => void;
  onNextLevel: (() => void) | null;
}

export function GameScreen({ level, onExit, onSolved, onNextLevel }: GameScreenProps) {
  const [folds, setFolds] = useState<Fold[]>([]);
  const [hintFold, setHintFold] = useState<Fold | null>(null);
  const [hintsLeft, setHintsLeft] = useState(HINTS_PER_LEVEL);
  const [showSolved, setShowSolved] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reportedRef = useRef(false);

  const state = useMemo(
    () => replayFolds(() => createInitialState(level.start, level.pins), folds),
    [level, folds]
  );
  const solved = useMemo(() => checkGoal(state, level.goal), [state, level]);

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
    if (hintsLeft <= 0 || solved) return;
    const cap = Math.max(level.expectedFolds - folds.length + 2, 2);
    const path = solve(state, level.goal, cap);
    if (!path || path.length === 0) {
      // Player has folded into a dead end -- the honest hint is "back up".
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setHintsLeft((n) => n - 1);
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
    <View style={styles.root}>
      {/* header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={onExit} hitSlop={12}>
          <Text style={styles.backGlyph}>‹</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.eyebrow}>WORLD {level.world}</Text>
          <Text style={styles.title}>{level.name}</Text>
        </View>
        <View style={[styles.foldPill, overPar && styles.foldPillOver]}>
          <Text style={[styles.foldPillText, overPar && styles.foldPillTextOver]}>
            {folds.length}/{level.expectedFolds}
          </Text>
        </View>
      </View>

      {/* silhouette goal preview (worlds with shape goals, no board anchor) */}
      {!goalCells && (
        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>GOAL</Text>
          <GoalPreview shape={level.goal.shape} />
          {level.goal.uniformDepth !== undefined && (
            <View style={styles.depthChip}>
              <Text style={styles.depthChipText}>×{level.goal.uniformDepth} thick</Text>
            </View>
          )}
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
          onFold={handleFold}
        />
      </View>

      {/* controls */}
      <View style={styles.controls}>
        <ControlButton label="Undo" onPress={undo} disabled={folds.length === 0} />
        <ControlButton label="Reset" onPress={reset} disabled={folds.length === 0} />
        <ControlButton
          label={`Hint ${'·'.repeat(Math.max(hintsLeft, 0))}`}
          onPress={showHint}
          disabled={hintsLeft <= 0 || solved}
          accent
        />
      </View>

      <Text style={styles.concept}>{level.newConcept}</Text>

      {/* solved overlay */}
      {showSolved && (
        <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
          <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
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
                <Pressable style={styles.primaryButton} onPress={onNextLevel}>
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
function GoalPreview({ shape }: { shape: { width: number; height: number; cells: { row: number; col: number }[] } }) {
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
            backgroundColor: theme.colors.accent,
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
  accent,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.controlButton,
        accent && styles.controlButtonAccent,
        pressed && styles.controlButtonPressed,
        disabled && styles.controlButtonDisabled,
      ]}
    >
      <Text
        style={[
          styles.controlLabel,
          accent && styles.controlLabelAccent,
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
    paddingTop: 64,
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
  depthChip: {
    backgroundColor: theme.colors.accentSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: theme.radius.pill,
  },
  depthChipText: {
    color: theme.colors.accent,
    fontSize: theme.font.small,
    fontWeight: '800',
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
  concept: {
    color: theme.colors.inkSoft,
    fontSize: theme.font.small,
    textAlign: 'center',
    paddingHorizontal: 36,
    paddingTop: 16,
    paddingBottom: 56,
    lineHeight: 19,
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
