import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PaperCanvas, type FoldLine } from '../components/PaperCanvas';
import { checkGoal, createInitialState, replayFolds } from '../core';
import { getLevel } from '../data/levels';
import type { Fold } from '../core/types';

interface GameScreenProps {
  levelId: number;
  onNextLevel?: () => void;
}

export function GameScreen({ levelId, onNextLevel }: GameScreenProps) {
  const level = useMemo(() => getLevel(levelId), [levelId]);
  const [folds, setFolds] = useState<Fold[]>([]);
  const [selectedLine, setSelectedLine] = useState<FoldLine | null>(null);

  const state = useMemo(
    () => replayFolds(() => createInitialState(level.start), folds),
    [level, folds]
  );
  const solved = useMemo(() => checkGoal(state, level.goal), [state, level]);

  function applyDirection(moves: 'lower' | 'upper') {
    if (!selectedLine) return;
    setFolds((prev) => [...prev, { ...selectedLine, moves }]);
    setSelectedLine(null);
  }

  function reset() {
    setFolds([]);
    setSelectedLine(null);
  }

  function undo() {
    setFolds((prev) => prev.slice(0, -1));
    setSelectedLine(null);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>World {level.world}</Text>
      <Text style={styles.title}>
        {level.id}. {level.name}
      </Text>

      <View style={styles.canvasWrap}>
        <PaperCanvas
          state={state}
          targetCell={folds.length === 0 ? level.goal.anchor : undefined}
          selectedLine={selectedLine}
          onSelectLine={setSelectedLine}
        />
      </View>

      {selectedLine ? (
        <View style={styles.directionRow}>
          <Pressable style={styles.directionButton} onPress={() => applyDirection('lower')}>
            <Text style={styles.directionLabel}>
              {selectedLine.axis === 'vertical' ? 'Fold Left → Right' : 'Fold Top → Bottom'}
            </Text>
          </Pressable>
          <Pressable style={styles.directionButton} onPress={() => applyDirection('upper')}>
            <Text style={styles.directionLabel}>
              {selectedLine.axis === 'vertical' ? 'Fold Right → Left' : 'Fold Bottom → Top'}
            </Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => setSelectedLine(null)}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.hint}>Tap a line on the paper to fold along it.</Text>
      )}

      <View style={styles.statusRow}>
        <Text style={styles.statusText}>
          Folds: {folds.length} / {level.expectedFolds}
        </Text>
        <Pressable onPress={undo} disabled={folds.length === 0}>
          <Text style={[styles.statusButton, folds.length === 0 && styles.disabled]}>Undo</Text>
        </Pressable>
        <Pressable onPress={reset} disabled={folds.length === 0}>
          <Text style={[styles.statusButton, folds.length === 0 && styles.disabled]}>Reset</Text>
        </Pressable>
      </View>

      {solved && (
        <View style={styles.solvedBanner}>
          <Text style={styles.solvedText}>Solved!</Text>
          {onNextLevel && (
            <Pressable style={styles.nextButton} onPress={onNextLevel}>
              <Text style={styles.nextLabel}>Next Level</Text>
            </Pressable>
          )}
        </View>
      )}

      <Text style={styles.notes}>{level.newConcept}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: 24,
    gap: 12,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6f9bd6',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1c2b45',
    marginBottom: 8,
  },
  canvasWrap: {
    marginVertical: 8,
  },
  hint: {
    color: '#5b6b85',
    fontSize: 14,
    height: 44,
    textAlignVertical: 'center',
  },
  directionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  directionButton: {
    backgroundColor: '#274a85',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  directionLabel: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  cancelLabel: {
    color: '#5b6b85',
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginTop: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#1c2b45',
    fontWeight: '600',
  },
  statusButton: {
    fontSize: 14,
    color: '#274a85',
    fontWeight: '600',
  },
  disabled: {
    color: '#c2c9d6',
  },
  solvedBanner: {
    marginTop: 16,
    alignItems: 'center',
    gap: 10,
  },
  solvedText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#2f9e5e',
  },
  nextButton: {
    backgroundColor: '#2f9e5e',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  nextLabel: {
    color: 'white',
    fontWeight: '700',
  },
  notes: {
    marginTop: 20,
    fontSize: 13,
    color: '#5b6b85',
    textAlign: 'center',
    maxWidth: 320,
  },
});
