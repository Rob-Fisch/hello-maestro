// [AGENT NOTIFICATION] The user says the PWA is running and you might be stuck.
import { VersionChecker } from '@/components/VersionChecker';
import { useContentStore } from '@/store/contentStore';
import { useGearStore } from '@/store/gearStore';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

// LogBox.ignoreAllLogs(true); // Uncomment to suppress logs for video recording // Suppress warnings/errors for clean video recording

SplashScreen.preventAutoHideAsync();

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
    if (isHydrated && fontsLoaded) {
      SplashScreen.hideAsync();

      // AUTO-SYNC ON START
      const { profile, fullSync } = useContentStore.getState();
      if (profile) {
        console.log('🚀 [RootLayout] Triggering Auto-Sync...');
        fullSync(); // Pull latest
      }
    }
  }, [isHydrated, fontsLoaded]);

  // REALTIME SUBSCRIPTION MOUNT
  useEffect(() => {
    const { profile, initRealtime, cleanupRealtime } = useContentStore.getState();

    if (profile) {
      initRealtime();
    } else {
      cleanupRealtime();
    }

    return () => {
      cleanupRealtime();
    };
  }, [profile?.id]); // Re-run only when user Identity changes


  useEffect(() => {
    if (!isHydrated || !isNavigationReady) return;

    const inAuthGroup = segments[0] === 'auth';
    const inGigGroup = segments[0] === 'gig';
    const inFanGroup = segments[0] === 'fan';
    const inRoutineGroup = segments[0] === 'routine';
    const inLiveGroup = segments[0] === 'live'; // Allow public access to /live

    if (!profile && !inAuthGroup && !inGigGroup && !inFanGroup && !inRoutineGroup && !inLiveGroup) {
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

  if ((!isHydrated || !fontsLoaded) && !forceReady) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color="#2563eb" />
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: '#999', textAlign: 'center', marginBottom: 8 }}>
            Loading OpusMode...
          </Text>
          <Text style={{ color: '#ccc', fontSize: 10, textAlign: 'center' }}>
            [Data: {contentHydrated ? 'OK' : '...'} / Gear: {gearHydrated ? 'OK' : '...'} / UI: {fontsLoaded ? 'OK' : '...'}]
          </Text>
          <Text
            onPress={() => {
              console.log('Force entering app...');
              setForceReady(true);
            }}
            style={{ color: '#2563eb', marginTop: 20, textDecorationLine: 'underline', textAlign: 'center' }}>
            Click here if stuck
          </Text>
        </View>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <VersionChecker />
      <ThemeProvider value={DefaultTheme}>
        <Stack screenOptions={{ animation: 'slide_from_right' }}>
          <Stack.Screen name="auth" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen
            name="modal/person-editor"
            options={{ title: 'Contact Editor', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="modal/event-editor"
            options={{ title: 'Event Editor', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="modal/routine-editor"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="modal/block-editor"
            options={{ headerShown: false, presentation: 'fullScreenModal' }}
          />
          <Stack.Screen
            name="modal/path-editor"
            options={{ title: 'Path Editor', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="modal/help"
            options={{ presentation: 'modal', title: 'Help & FAQ', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="modal/node-editor"
            options={{ title: 'Node Editor', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="modal/asset-editor"
            options={{ title: 'Asset Editor', headerBackTitle: 'Back' }}
          />
          <Stack.Screen
            name="modal/upgrade"
            options={{ presentation: 'modal', headerShown: false }}
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
