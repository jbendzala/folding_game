import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { todaysDaily } from '../data/daily';
import { allLevels, WORLD_NAMES } from '../data/levels';
import { highestUnlocked, type ProgressMap } from '../state/progress';
import { theme, worldPalette } from '../theme';

interface HomeScreenProps {
  progress: ProgressMap;
  onOpenLevel: (id: number) => void;
  onOpenDaily: () => void;
}

export function HomeScreen({ progress, onOpenLevel, onOpenDaily }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  // Dev builds unlock everything for level previewing; release keeps progression.
  const unlocked = __DEV__ ? Infinity : highestUnlocked(progress, allLevels);
  // Count against the CURRENT curriculum, not everything in storage. Progress
  // is keyed by level key and keys outlive the levels that had them -- renaming
  // a level while hardening it leaves its old entry behind, which is how the
  // menu came to report 106/100 solved.
  const daily = todaysDaily();
  const live = allLevels.map((l) => progress[l.key]).filter((p) => p?.solved);
  const totalStars = live.reduce((sum, p) => sum + p.stars, 0);
  const solvedCount = live.length;

  const worlds = [...new Set(allLevels.map((l) => l.world))];

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 52, paddingBottom: insets.bottom + 40 },
      ]}
    >
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

      {/* Daily puzzle. Generated offline and solver-verified, so its fold
          count is exact rather than an estimate. */}
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onOpenDaily();
        }}
        style={({ pressed }) => [styles.dailyCard, pressed && styles.tilePressed]}
      >
        <View>
          <Text style={styles.dailyEyebrow}>DAILY PUZZLE</Text>
          <Text style={styles.dailyName}>{daily.name}</Text>
        </View>
        <Text style={styles.dailyFolds}>{daily.expectedFolds} folds</Text>
      </Pressable>

      {/* worlds */}
      {worlds.map((world) => {
        const levels = allLevels.filter((l) => l.world === world);
        const wp = worldPalette(world);
        return (
          <View key={world} style={styles.worldSection}>
            <Text style={[styles.worldTitle, { color: wp.paper[3] }]}>
              WORLD {world} — {WORLD_NAMES[world] ?? ''}
            </Text>
            <View style={styles.grid}>
              {levels.map((level) => {
                const p = progress[level.key];
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
                      { backgroundColor: wp.bgRaised },
                      p?.solved && { backgroundColor: wp.paper[4] },
                      !isUnlocked && styles.tileLocked,
                      pressed && styles.tilePressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tileNumber,
                        p?.solved && { color: '#15171d' },
                        !isUnlocked && styles.tileNumberLocked,
                      ]}
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
    backgroundColor: '#dfcb9e',
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
  dailyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bgRaised,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 26,
  },
  dailyEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: theme.colors.gold,
    marginBottom: 4,
  },
  dailyName: { fontSize: 18, fontWeight: '700', color: theme.colors.ink },
  dailyFolds: { fontSize: 14, fontWeight: '600', color: theme.colors.inkSoft },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
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
