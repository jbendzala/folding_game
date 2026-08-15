import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MAX_LIVES } from '../state/economy';
import { theme, type WorldPalette } from '../theme';

interface Props {
  lives: number;
  /** Epoch ms the next life lands, or 0 when full. */
  nextLifeAt: number;
  palette: WorldPalette;
  onUndo: () => void;
  onRestart: () => void;
  onWatchAd: () => void;
  onExit: () => void;
}

function waitLabel(nextLifeAt: number): string {
  if (!nextLifeAt) return '';
  const mins = Math.max(0, Math.ceil((nextLifeAt - Date.now()) / 60000));
  return `Next life in ${mins} min`;
}

/**
 * Shown only when the position is PROVABLY unwinnable.
 *
 * Most puzzle games have to guess at failure -- a move limit, a timer -- but
 * the engine here can prove a fold has killed the level, so the game never
 * takes a life on a position the player could still have saved. Undo is
 * offered first and stays free: undo is how the fold logic is learned, and
 * taxing that would tax the part of the game people come for.
 */
export function FailModal({
  lives,
  nextLifeAt,
  palette,
  onUndo,
  onRestart,
  onWatchAd,
  onExit,
}: Props) {
  const out = lives <= 0;
  return (
    <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
      <Animated.View
        entering={ZoomIn.springify().damping(19).withInitialValues({ transform: [{ scale: 0.8 }] })}
        style={styles.card}
      >
        <Text style={styles.title}>{out ? 'Out of lives' : 'No way back'}</Text>
        <Text style={styles.body}>
          {out
            ? 'That fold cannot be recovered, and there are no lives left.'
            : 'This sheet can no longer reach the target. Undo costs nothing.'}
        </Text>

        <View style={styles.hearts}>
          {Array.from({ length: MAX_LIVES }).map((_, i) => (
            <Text key={i} style={[styles.heart, i >= lives && styles.heartSpent]}>
              ♥
            </Text>
          ))}
        </View>
        {out && !!nextLifeAt && <Text style={styles.timer}>{waitLabel(nextLifeAt)}</Text>}

        {!out && (
          <Pressable
            onPress={onUndo}
            style={({ pressed }) => [
              styles.primary,
              { backgroundColor: palette.tint },
              pressed && { opacity: 0.85 },
            ]}
          >
            <Text style={styles.primaryLabel}>Undo that fold</Text>
          </Pressable>
        )}

        <Pressable
          onPress={onWatchAd}
          style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
        >
          <Text style={[styles.secondaryLabel, { color: palette.tint }]}>Watch ad for +1 life</Text>
        </Pressable>

        <View style={styles.row}>
          <Pressable onPress={onRestart} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}>
            <Text style={styles.ghostLabel}>Restart</Text>
          </Pressable>
          <Pressable onPress={onExit} style={({ pressed }) => [styles.ghost, pressed && { opacity: 0.6 }]}>
            <Text style={styles.ghostLabel}>Levels</Text>
          </Pressable>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: theme.colors.bgOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
    zIndex: 30,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 22,
    backgroundColor: theme.colors.bgRaised,
    padding: 26,
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: '700', color: theme.colors.ink, marginBottom: 8 },
  body: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.inkSoft,
    textAlign: 'center',
    marginBottom: 18,
  },
  hearts: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  heart: { fontSize: 20, color: theme.colors.danger },
  heartSpent: { color: theme.colors.inkFaint, opacity: 0.5 },
  timer: { fontSize: 13, color: theme.colors.inkFaint, marginBottom: 14 },
  primary: { borderRadius: 999, paddingHorizontal: 34, paddingVertical: 13, marginTop: 10 },
  primaryLabel: { fontSize: 16, fontWeight: '700', color: '#10131a' },
  secondary: { paddingVertical: 14 },
  secondaryLabel: { fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', gap: 26, marginTop: 2 },
  ghost: { paddingVertical: 8, paddingHorizontal: 10 },
  ghostLabel: { fontSize: 14, fontWeight: '600', color: theme.colors.inkFaint },
});
