// [AGENT NOTIFICATION] The user says the PWA is running and you might be stuck.
import { VersionChecker } from '@/components/VersionChecker';
import { useContentStore } from '@/store/contentStore';
import { useGearStore } from '@/store/gearStore';

import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
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
    ...Ionicons.font,
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

  // SUPABASE AUTH LISTENER (Deep Links / Invites)
  useEffect(() => {
    // This catches 'SIGNED_IN' events triggered by Hash Fragment URL tokens (e.g. Invites, Magic Links)
    const { data: { subscription } } = require('@/lib/supabase').supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log('🚀 [RootLayout] Auth Event:', event);

      if (event === 'PASSWORD_RECOVERY') {
        // Check URL to distinguish between actual password recovery vs signup confirmation
        // Supabase fires PASSWORD_RECOVERY for all email link clicks
        // Only route to password page if URL explicitly indicates recovery or invite
        let isActualRecovery = false;

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const hash = window.location.hash;
          const search = window.location.search;
          const fullUrl = hash + search;

          console.log('🚀 [RootLayout] PASSWORD_RECOVERY URL:', fullUrl);

          // Only set recovery=true if URL explicitly contains recovery or invite type
          if (fullUrl.includes('type=recovery') || fullUrl.includes('type=invite')) {
            isActualRecovery = true;
            console.log('🚀 [RootLayout] Explicit recovery/invite type found. Redirecting to password setup...');
          } else {
            // Default: treat as signup confirmation
            console.log('🚀 [RootLayout] No recovery/invite type — treating as signup confirmation. Redirecting to welcome...');
          }
        }

        if (isActualRecovery) {
          setTimeout(() => router.replace('/modal/onboarding-password'), 500);
        } else {
          setTimeout(() => router.replace('/modal/email-confirmed'), 500);
        }

      } else if (event === 'SIGNED_IN' && session?.user) {

        // CHECK FOR INVITE / RECOVERY / SIGNUP IN URL
        // Supabase often swallows the event type but leaves the hash until cleared.
        let isInviteOrRecovery = false;
        let isSignupConfirmation = false;

        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const hash = window.location.hash;
          const search = window.location.search;
          const fullUrl = hash + search;

          // Check for invite or recovery
          if (fullUrl.includes('type=invite') || fullUrl.includes('type=recovery')) {
            isInviteOrRecovery = true;
          }
          // Check for signup confirmation
          else if (fullUrl.includes('type=signup') || fullUrl.includes('type=email')) {
            isSignupConfirmation = true;
          }
          // Fallback: if there's an access_token but no type, treat as signup confirmation
          else if (fullUrl.includes('access_token')) {
            isSignupConfirmation = true;
          }
        }

        if (isProcessingInvite.current) isInviteOrRecovery = true;

        if (isInviteOrRecovery) {
          console.log('🚀 [RootLayout] Invite/Recovery detected. Redirecting to password setup...');
          setTimeout(() => router.replace('/modal/onboarding-password'), 500);
        } else if (isSignupConfirmation) {
          console.log('🚀 [RootLayout] Signup confirmation detected. Redirecting to welcome...');
          setTimeout(() => router.replace('/modal/email-confirmed'), 500);
        }

        // Auto-populate profile in store if missing
        const { profile, setProfile } = useContentStore.getState();
        if (!profile || profile.id !== session.user.id) {
          console.log('🚀 [RootLayout] New session detected. Syncing Profile...');
          const profileData = session.user.user_metadata || {};
          // Use display_name if set, otherwise use email prefix (before @), or fallback
          const emailPrefix = session.user.email?.split('@')[0] || 'New User';
          setProfile({
            id: session.user.id,
            email: session.user.email || '',
            displayName: profileData.display_name || emailPrefix,
            isPremium: !!profileData.is_premium
          });
        }
      } else if (event === 'SIGNED_OUT') {
        useContentStore.getState().setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    }
  }, []);


  // Track if we are processing an invite/deep link to prevent premature redirects
  const isProcessingInvite = useRef<boolean>(false);

  // SYNCHRONOUS CHECK (Before Effects): Capture the intent immediately
  // Only lock for ACTUAL invites/recovery — NOT signup confirmations
  if (Platform.OS === 'web' && typeof window !== 'undefined' && !isProcessingInvite.current) {
    const href = window.location.href;
    // Only set this for explicit invite/recovery links, NOT signup confirmations
    if (href.includes('type=invite') || href.includes('type=recovery')) {
      console.log('🚀 [RootLayout] Invite/Recovery Deep Link detected on render. Locking Router.');
      isProcessingInvite.current = true;
    }
  }

  useEffect(() => {
    if (!isHydrated || !isNavigationReady) return;

    const inAuthGroup = segments[0] === 'auth';
    const inGigGroup = segments[0] === 'gig';
    const inFanGroup = segments[0] === 'fan';
    const inRoutineGroup = segments[0] === 'routine';
    const inLiveGroup = segments[0] === 'live'; // Allow public access to /live
    const inJoinGroup = segments[0] === 'join'; // Allow public access to /join (campaigns)
    const inPrivacyPage = segments[0] === 'privacy'; // Allow public access to /privacy
    const inTermsPage = segments[0] === 'terms'; // Allow public access to /terms
    const inOnboarding = segments[0] === 'modal' && segments[1] === 'onboarding-password';
    const inCheckEmail = segments[0] === 'modal' && segments[1] === 'check-email';
    const inEmailConfirmed = segments[0] === 'modal' && segments[1] === 'email-confirmed';

    // If we are processing an invite (caught in ref), DO NOT redirect to /auth yet.
    if (isProcessingInvite.current) {
      console.log('⏳ [RootLayout] Waiting for Invite/Deep Link processing... Skipping Auth Redirect.');
      return;
    }

    if (!profile && !inAuthGroup && !inGigGroup && !inFanGroup && !inRoutineGroup && !inLiveGroup && !inJoinGroup && !inPrivacyPage && !inTermsPage && !inOnboarding && !inCheckEmail && !inEmailConfirmed && segments[0] !== undefined) {
      console.log(`[log][...RootLayout] Redirecting to auth: /${segments.join('/')}`);
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
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="privacy" options={{ headerShown: false }} />
          <Stack.Screen name="terms" options={{ headerShown: false }} />
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
            options={{ presentation: 'modal', headerShown: false }}
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
          <Stack.Screen
            name="modal/sitemap"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/about"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/privacy"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/terms"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/onboarding-password"
            options={{ presentation: 'fullScreenModal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/check-email"
            options={{ presentation: 'fullScreenModal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/email-confirmed"
            options={{ presentation: 'fullScreenModal', headerShown: false }}
          />
          <Stack.Screen
            name="modal/admin"
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
