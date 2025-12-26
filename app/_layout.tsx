// [AGENT NOTIFICATION] The user says the PWA is running and you might be stuck.
import { Stack, router, useSegments, useRootNavigationState } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { useGearStore } from '@/store/gearStore';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import '../global.css';

export default function RootLayout() {
  console.log('🚀 [RootLayout] Render started');

  const { profile, _hasHydrated: contentHydrated } = useContentStore();
  const { _hasHydrated: gearHydrated } = useGearStore();

  const segments = useSegments();
  const navigationState = useRootNavigationState();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [forceReady, setForceReady] = useState(false);

  useEffect(() => {
    console.log('🚀 [RootLayout] Hydration:', { contentHydrated, gearHydrated });
    console.log('🚀 [RootLayout] Nav Ready:', isNavigationReady);
  }, [contentHydrated, gearHydrated, isNavigationReady]);

  // Load Icons Logic (Fix for Web PWA)
  // On web, icons sometimes need a tick to load or explicit import reference
  // Load Icons Logic (Fix for Web PWA)
  // Load Icons Logic (Fix for Web PWA)
  /* eslint-disable @typescript-eslint/no-var-requires */
  const [fontsLoaded] = useFonts({
    Ionicons: require('@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      console.log('✅ Icons loaded successfully');
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (navigationState?.key) {
      console.log('🚀 [RootLayout] Navigation set to ready');
      setIsNavigationReady(true);
    }
  }, [navigationState?.key]);

  // Combined Readiness State
  const isHydrated = (contentHydrated && gearHydrated) || forceReady;

  useEffect(() => {
    if (!isHydrated || !isNavigationReady) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!profile && !inAuthGroup) {
      router.replace('/auth');
    } else if (profile && inAuthGroup) {
      router.replace('/');
    }
  }, [profile, segments, isHydrated, isNavigationReady]);

  // Fail-safe: Show a button after 4 seconds to force entry
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isHydrated) {
        console.warn('🚀 [RootLayout] Hydration hanging... enabling force button');
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isHydrated]);

  if (!isHydrated || !fontsLoaded) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#2563eb" />
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#999' }}>Loading OpusMode...</Text>
          <Text
            onPress={() => setForceReady(true)}
            style={{ color: '#2563eb', marginTop: 20, textDecorationLine: 'underline' }}>
            Click here if stuck
          </Text>
        </View>
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
          <Stack.Screen
            name="modal/asset-editor"
            options={{ presentation: 'modal', title: 'Asset Editor' }}
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
