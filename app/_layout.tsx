import { Stack } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { useEffect, useState } from 'react';
import { router, useSegments, useRootNavigationState } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

export default function RootLayout() {
  const { profile, _hasHydrated } = useContentStore();
  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (navigationState?.key) {
      setIsNavigationReady(true);
    }
  }, [navigationState?.key]);

  useEffect(() => {
    // Wait for hydration and basic navigation readiness
    if (!_hasHydrated || !isNavigationReady) return;

    const inAuthGroup = segments[0] === 'auth';

    // Basic routing logic
    if (!profile && !inAuthGroup) {
      router.replace('/auth');
    } else if (profile && inAuthGroup) {
      router.replace('/');
    }
  }, [profile, segments, _hasHydrated, isNavigationReady]);

  // Essential: Don't render the Stack until the navigation state is ready
  // EXCEPT we wrap it in a GestureHandlerRootView for context stability
  if (!_hasHydrated || !isNavigationReady) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <Stack>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal/person-editor"
            options={{ presentation: 'modal', title: 'Contact Editor' }}
          />
          <Stack.Screen
            name="modal/event-editor"
            options={{ presentation: 'modal', title: 'Event Editor' }}
          />
          <Stack.Screen
            name="modal/routine-editor"
            options={{ presentation: 'modal', title: 'Routine Editor' }}
          />
          <Stack.Screen
            name="modal/block-editor"
            options={{ presentation: 'modal', title: 'Block Editor' }}
          />
          <Stack.Screen
            name="modal/path-editor"
            options={{ presentation: 'modal', title: 'Path Editor' }}
          />
          <Stack.Screen
            name="modal/help"
            options={{ presentation: 'modal', title: 'Help & FAQ' }}
          />
          <Stack.Screen
            name="modal/node-editor"
            options={{ presentation: 'modal', title: 'Node Editor' }}
          />
        </Stack>
        <StatusBar style="dark" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999
  }
});
