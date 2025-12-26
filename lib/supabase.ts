import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Replace these with your actual Supabase credentials
const supabaseUrl = 'https://iwobmkglhkuzwouheviu.supabase.co';
const supabaseAnonKey = 'sb_publishable_ihQj8dkL4EPeYB9fDf1EcA_y6LNLf7j';

// Platform-specific storage adapter
// Uses localStorage for web/PWA and AsyncStorage for native platforms
const createPlatformStorage = () => {
    // For web/PWA environments
    if (Platform.OS === 'web') {
        return {
            getItem: async (key: string) => {
                try {
                    if (typeof window === 'undefined') return null;
                    return window.localStorage.getItem(key);
                } catch {
                    return null;
                }
            },
            setItem: async (key: string, value: string) => {
                try {
                    if (typeof window === 'undefined') return;
                    window.localStorage.setItem(key, value);
                } catch { }
            },
            removeItem: async (key: string) => {
                try {
                    if (typeof window === 'undefined') return;
                    window.localStorage.removeItem(key);
                } catch { }
            },
        };
    }

    // For native platforms (iOS/Android)
    // Dynamically import AsyncStorage to avoid bundling it in web builds
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
        getItem: async (key: string) => {
            try {
                return await AsyncStorage.getItem(key);
            } catch {
                return null;
            }
        },
        setItem: async (key: string, value: string) => {
            try {
                await AsyncStorage.setItem(key, value);
            } catch { }
        },
        removeItem: async (key: string) => {
            try {
                await AsyncStorage.removeItem(key);
            } catch { }
        },
    };
};

const platformStorage = createPlatformStorage();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: platformStorage as any,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
