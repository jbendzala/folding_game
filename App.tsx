import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameScreen } from './src/screens/GameScreen';
import { allLevels } from './src/data/levels';

export default function App() {
  const [levelId, setLevelId] = useState(1);

  function goToNextLevel() {
    const index = allLevels.findIndex((l) => l.id === levelId);
    const next = allLevels[index + 1];
    if (next) setLevelId(next.id);
  }

  return (
    <GestureHandlerRootView style={styles.fill}>
      <SafeAreaProvider>
        <View style={styles.fill}>
          <GameScreen levelId={levelId} onNextLevel={goToNextLevel} />
          <StatusBar style="auto" />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: '#f4f7fc',
  },
});
