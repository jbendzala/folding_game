import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './src/screens/GameScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { allLevels, getLevel } from './src/data/levels';
import { todaysDaily } from './src/data/daily';
import {
  loadProgress,
  recordSolve,
  saveProgress,
  type ProgressMap,
} from './src/state/progress';
import { theme } from './src/theme';

type Route = { screen: 'home' } | { screen: 'level'; id: number } | { screen: 'daily' };

export default function App() {
  const [route, setRoute] = useState<Route>({ screen: 'home' });
  const [progress, setProgress] = useState<ProgressMap>({});

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  function handleSolved(levelId: number, folds: number) {
    setProgress((prev) => {
      const next = recordSolve(prev, getLevel(levelId), folds);
      saveProgress(next);
      return next;
    });
  }

  function nextLevelIdAfter(id: number): number | null {
    const index = allLevels.findIndex((l) => l.id === id);
    return allLevels[index + 1]?.id ?? null;
  }

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <View style={styles.fill}>
          {route.screen === 'home' ? (
            <HomeScreen
              progress={progress}
              onOpenLevel={(id) => setRoute({ screen: 'level', id })}
              onOpenDaily={() => setRoute({ screen: 'daily' })}
            />
          ) : route.screen === 'daily' ? (
            <GameScreen
              key="daily"
              level={todaysDaily()}
              onExit={() => setRoute({ screen: 'home' })}
              // Daily results are not campaign progress, so nothing is
              // recorded against the level keys the menu counts.
              onSolved={() => {}}
              onNextLevel={null}
            />
          ) : (
            <GameScreen
              // Remount per level: all in-level state (folds, hints, overlay)
              // must die with the level, or a stale fold list gets replayed
              // against the next level's shape for one render and crashes.
              key={route.id}
              level={getLevel(route.id)}
              onExit={() => setRoute({ screen: 'home' })}
              onSolved={(folds) => handleSolved(route.id, folds)}
              onNextLevel={
                nextLevelIdAfter(route.id) !== null
                  ? () => setRoute({ screen: 'level', id: nextLevelIdAfter(route.id)! })
                  : null
              }
            />
          )}
          <StatusBar style="light" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
});
