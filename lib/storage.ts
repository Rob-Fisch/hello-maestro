import { Platform } from 'react-native';
import { StateStorage } from 'zustand/middleware';

/**
 * Universal storage adapter that works across Web (localStorage) 
 * and Native (AsyncStorage).
 * 
 * Compatible with:
 * 1. Zustand's `persist` middleware
 * 2. Supabase Auth `storage` option
 */
export const createPlatformStorage = (): StateStorage => {
    // Web: localStorage
    if (Platform.OS === 'web') {
        return {
            getItem: (name: string) => {
                try {
                    if (typeof window === 'undefined') return null;
                    return window.localStorage.getItem(name);
                } catch {
                    return null;
                }
            },
            setItem: (name: string, value: string) => {
                try {
                    if (typeof window === 'undefined') return;
                    window.localStorage.setItem(name, value);
                } catch { }
            },
            removeItem: (name: string) => {
                try {
                    if (typeof window === 'undefined') return;
                    window.localStorage.removeItem(name);
                } catch { }
            },
        };
    }

    // Native: AsyncStorage
    // We use require() to avoid importing this module in Web bundles
    // where it might cause resolution errors if not strictly tree-shaken.
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;

    return {
        getItem: async (name: string) => {
            try {
                return await AsyncStorage.getItem(name);
            } catch {
                return null;
            }
        },
        setItem: async (name: string, value: string) => {
            try {
                await AsyncStorage.setItem(name, value);
            } catch { }
        },
        removeItem: async (name: string) => {
            try {
                await AsyncStorage.removeItem(name);
            } catch { }
        },
    };
};

export const platformStorage = createPlatformStorage();
