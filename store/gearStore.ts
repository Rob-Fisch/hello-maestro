import { createPlatformStorage } from '@/lib/storage';
import { deleteFromCloud, syncToCloud } from '@/lib/sync';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { GearAsset, PackList } from './types';



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
            storage: createJSONStorage(() => createPlatformStorage()),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);
