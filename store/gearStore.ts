import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { GearAsset, PackList } from './types';
import { syncToCloud, deleteFromCloud } from '@/lib/sync';


// Platform-specific storage for Zustand persistence
const createPlatformStorageAdapter = (): StateStorage => {
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

interface GearState {
    assets: GearAsset[];
    packLists: PackList[];

    // Asset Actions
    addAsset: (asset: GearAsset) => void;
    updateAsset: (id: string, updates: Partial<GearAsset>) => void;
    deleteAsset: (id: string) => void;

    // Pack List Actions
    addPackList: (packList: PackList) => void;
    updatePackList: (id: string, updates: Partial<PackList>) => void;
    deletePackList: (id: string) => void;
    getPackListForEvent: (eventId: string) => PackList | undefined;

    // Persistence
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
    mergeFromCloud: (assets: GearAsset[], packLists: PackList[]) => void;
}

export const useGearStore = create<GearState>()(
    persist(
        (set, get) => ({
            assets: [],
            packLists: [],
            _hasHydrated: false,

            setHasHydrated: (state) => set({ _hasHydrated: state }),

            addAsset: (asset) => {
                set((state) => ({ assets: [...state.assets, asset] }));
                syncToCloud('gear_assets', asset);
            },

            updateAsset: (id, updates) => {
                set((state) => {
                    const newAssets = state.assets.map((a) => (a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a));
                    const updated = newAssets.find(a => a.id === id);
                    if (updated) syncToCloud('gear_assets', updated);
                    return { assets: newAssets };
                });
            },

            deleteAsset: (id) => {
                set((state) => ({
                    assets: state.assets.filter((a) => a.id !== id),
                    // Also remove from any pack lists
                    packLists: state.packLists.map(pl => {
                        const newPl = {
                            ...pl,
                            itemIds: pl.itemIds.filter(itemId => itemId !== id),
                            checkedItemIds: pl.checkedItemIds.filter(itemId => itemId !== id)
                        };
                        syncToCloud('pack_lists', newPl);
                        return newPl;
                    })
                }));
                deleteFromCloud('gear_assets', id);
            },

            addPackList: (packList) => {
                set((state) => ({ packLists: [...state.packLists, packList] }));
                syncToCloud('pack_lists', packList);
            },

            updatePackList: (id, updates) => {
                set((state) => {
                    const newLists = state.packLists.map((pl) => (pl.id === id ? { ...pl, ...updates } : pl));
                    const updated = newLists.find(pl => pl.id === id);
                    if (updated) syncToCloud('pack_lists', updated);
                    return { packLists: newLists };
                });
            },

            deletePackList: (id) => {
                set((state) => ({
                    packLists: state.packLists.filter((pl) => pl.id !== id),
                }));
                deleteFromCloud('pack_lists', id);
            },

            getPackListForEvent: (eventId) => {
                return get().packLists.find(pl => pl.eventId === eventId);
            },

            mergeFromCloud: (cloudAssets, cloudLists) => {
                set((state) => {
                    const merge = (local: any[], cloud: any[]) => {
                        const map = new Map();
                        local.forEach(item => map.set(item.id, item));
                        cloud.forEach(item => map.set(item.id, item));
                        return Array.from(map.values());
                    };
                    return {
                        assets: merge(state.assets, cloudAssets),
                        packLists: merge(state.packLists, cloudLists),
                    };
                });
            }
        }),
        {
            name: 'maestro-gear-storage',
            storage: createJSONStorage(() => createPlatformStorageAdapter()),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
