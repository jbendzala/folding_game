import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { allLevels } from '../data/levels';
import { highestUnlocked, type ProgressMap } from '../state/progress';
import { theme } from '../theme';

const WORLD_NAMES: Record<number, string> = {
  1: 'The Basics',
  2: 'Odd Dimensions',
  3: 'Missing Pieces',
  4: 'Interesting Geometry',
  5: 'Mind Benders',
};

interface HomeScreenProps {
  progress: ProgressMap;
  onOpenLevel: (id: number) => void;
}

export function HomeScreen({ progress, onOpenLevel }: HomeScreenProps) {
  const unlocked = highestUnlocked(progress, allLevels.map((l) => l.id));
  const totalStars = Object.values(progress).reduce((sum, p) => sum + p.stars, 0);
  const solvedCount = Object.values(progress).filter((p) => p.solved).length;

  const worlds = [...new Set(allLevels.map((l) => l.world))];

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* masthead */}
      <View style={styles.masthead}>
        <View style={styles.logoMark}>
          <View style={styles.logoBase} />
          <View style={styles.logoFlap} />
        </View>
        <Text style={styles.logo}>FOLD</Text>
        <Text style={styles.tagline}>a paper puzzle</Text>
        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            {solvedCount}/{allLevels.length} solved
          </Text>
          <Text style={styles.statDivider}>·</Text>
          <Text style={styles.stat}>
            <Text style={styles.statStar}>★</Text> {totalStars}
          </Text>
        </View>
      </View>

      {/* worlds */}
      {worlds.map((world) => {
        const levels = allLevels.filter((l) => l.world === world);
        return (
          <View key={world} style={styles.worldSection}>
            <Text style={styles.worldTitle}>
              WORLD {world} — {WORLD_NAMES[world] ?? ''}
            </Text>
            <View style={styles.grid}>
              {levels.map((level) => {
                const p = progress[level.id];
                const isUnlocked = level.id <= unlocked;
                return (
                  <Pressable
                    key={level.id}
                    disabled={!isUnlocked}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onOpenLevel(level.id);
                    }}
                    style={({ pressed }) => [
                      styles.tile,
                      p?.solved && styles.tileSolved,
                      !isUnlocked && styles.tileLocked,
                      pressed && styles.tilePressed,
                    ]}
                  >
                    <Text
                      style={[styles.tileNumber, !isUnlocked && styles.tileNumberLocked]}
                    >
                      {level.id}
                    </Text>
                    <Text style={styles.tileStars}>
                      {p?.solved ? '★'.repeat(p.stars) : isUnlocked ? '' : '·'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      <Text style={styles.footer}>more worlds folding soon</Text>
    </ScrollView>
  );
}

const TILE = 58;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  content: {
    paddingTop: 84,
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  masthead: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoMark: {
    width: 52,
    height: 52,
    marginBottom: 14,
  },
  logoBase: {
    position: 'absolute',
    inset: 0,
    backgroundColor: theme.colors.paper[2],
    borderRadius: 10,
  },
  logoFlap: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 26,
    height: 52,
    backgroundColor: theme.colors.accent,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  logo: {
    color: theme.colors.ink,
    fontSize: 44,
    fontWeight: '900',
    letterSpacing: 10,
    marginLeft: 10, // optically recenters the letterspaced text
  },
  tagline: {
    color: theme.colors.inkFaint,
    fontSize: theme.font.small,
    letterSpacing: 3,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
    backgroundColor: theme.colors.bgRaised,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: theme.radius.pill,
  },
  stat: {
    color: theme.colors.inkSoft,
    fontSize: theme.font.small,
    fontWeight: '700',
  },
  statStar: {
    color: theme.colors.gold,
  },
  statDivider: {
    color: theme.colors.inkFaint,
  },
  worldSection: {
    marginBottom: 28,
  },
  worldTitle: {
    color: theme.colors.inkFaint,
    fontSize: theme.font.tiny,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: 14,
    backgroundColor: theme.colors.bgRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileSolved: {
    backgroundColor: theme.colors.accentSoft,
  },
  tileLocked: {
    backgroundColor: theme.colors.locked,
    opacity: 0.55,
  },
  tilePressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  tileNumber: {
    color: theme.colors.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  tileNumberLocked: {
    color: theme.colors.inkFaint,
  },
  tileStars: {
    color: theme.colors.gold,
    fontSize: 10,
    height: 12,
    marginTop: 1,
  },
  footer: {
    color: theme.colors.inkFaint,
    fontSize: theme.font.tiny,
    textAlign: 'center',
    letterSpacing: 2,
    marginTop: 12,
  },
});
