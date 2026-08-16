import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { WorldIntro } from '../core/worldIntro';
import { theme, type WorldPalette } from '../theme';

interface Props {
  intro: WorldIntro;
  palette: WorldPalette;
  /** Cancels the host screen's top padding so the card centres on the
   *  screen rather than on the padded content box. */
  topOffset?: number;
  onDismiss: () => void;
}

/**
 * Shown once, on the first level of a world.
 *
 * The rule text is not written here -- it comes from the same derivation the
 * legend chips use, so a world can never introduce a rule its levels do not
 * actually contain. Twelve of the twenty worlds add no rule at all; those get
 * an honest "no new rules, just harder" rather than an invented gimmick.
 */
export function WorldIntroModal({ intro, palette, topOffset = 0, onDismiss }: Props) {
  return (
    <Animated.View entering={FadeIn.duration(200)} style={[styles.overlay, { top: topOffset }]}>
      <Animated.View
        entering={ZoomIn.springify().damping(19).withInitialValues({ transform: [{ scale: 0.8 }] })}
        style={[styles.card, { borderColor: palette.tintSoft }]}
      >
        <Text style={[styles.eyebrow, { color: palette.tint }]}>WELCOME TO WORLD {intro.world}</Text>
        <Text style={styles.title}>{intro.name}</Text>

        {intro.newRules.length > 0 ? (
          <View style={styles.rules}>
            {intro.newRules.map((rule) => (
              <View key={rule.label} style={styles.rule}>
                <Text style={[styles.ruleLabel, { color: palette.tint, borderColor: palette.tintSoft }]}>
                  {rule.label}
                </Text>
                <Text style={styles.ruleDetail}>{rule.detail}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.blurb}>{intro.blurb}</Text>
        )}

        <Pressable
          onPress={onDismiss}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: palette.tint },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={styles.buttonLabel}>Start</Text>
        </Pressable>
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
    zIndex: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    borderWidth: 1,
    backgroundColor: theme.colors.bgRaised,
    padding: 26,
    alignItems: 'center',
  },
  eyebrow: { fontSize: 13, fontWeight: '700', letterSpacing: 2, marginBottom: 6 },
  title: { fontSize: 26, fontWeight: '700', color: theme.colors.ink, marginBottom: 18 },
  blurb: {
    fontSize: 15,
    lineHeight: 22,
    color: theme.colors.inkSoft,
    textAlign: 'center',
    marginBottom: 22,
  },
  rules: { alignSelf: 'stretch', gap: 14, marginBottom: 22 },
  rule: { gap: 6, alignItems: 'center' },
  ruleLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    overflow: 'hidden',
  },
  ruleDetail: {
    fontSize: 15,
    lineHeight: 21,
    color: theme.colors.inkSoft,
    textAlign: 'center',
  },
  button: { borderRadius: 999, paddingHorizontal: 40, paddingVertical: 13 },
  buttonLabel: { fontSize: 16, fontWeight: '700', color: '#10131a' },
});
