import { supabase } from '@/lib/supabase';
import { deleteFromCloud, pullFromCloud, pullProfileFromCloud, pushAllToCloud, syncToCloud } from '@/lib/sync';
import { Alert, Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { useGearStore } from './gearStore';
import { AppEvent, AppTheme, Category, ContentBlock, InteractionLog, LearningPath, Person, ProofOfWork, Routine, SessionLog, SyncStatus, UserProfile, UserProgress, UserSettings } from './types';

// Platform-specific storage for Zustand persistence
const createPlatformStorageAdapter = (): StateStorage => {
    if (Platform.OS === 'web') {
        // Use localStorage for web/PWA
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

    // Use AsyncStorage for native platforms
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


interface ContentState {
    blocks: ContentBlock[];
    routines: Routine[];
    events: AppEvent[];
    categories: Category[];
    people: Person[];
    addBlock: (block: ContentBlock) => void;
    updateBlock: (id: string, updates: Partial<ContentBlock>) => void;
    deleteBlock: (id: string) => void;
    addRoutine: (routine: Routine) => void;
    updateRoutine: (id: string, updates: Partial<Routine>) => void;
    deleteRoutine: (id: string) => void;
    addEvent: (event: AppEvent) => void;
    updateEvent: (id: string, updates: Partial<AppEvent>) => void;
    deleteEvent: (id: string) => void;
    addCategory: (category: Category) => void;
    updateCategory: (id: string, updates: Partial<Category>) => void;
    deleteCategory: (id: string) => void;
    addPerson: (person: Person) => void;
    updatePerson: (id: string, updates: Partial<Person>) => void;
    deletePerson: (id: string) => void;
    settings: UserSettings;
    updateSettings: (updates: Partial<UserSettings>) => void;
    setTheme: (theme: AppTheme) => void;

    // Pathfinder Actions
    paths: LearningPath[];
    progress: UserProgress[];
    proofs: ProofOfWork[];
    addPath: (path: LearningPath) => void;
    updatePath: (id: string, updates: Partial<LearningPath>) => void;
    deletePath: (id: string) => void;
    forkPathRemote: (originalPathId: string, originatorName?: string, originatorPathTitle?: string) => Promise<string | null>;
    updateProgress: (pathId: string, nodeId: string, completed: boolean) => void;
    addProof: (proof: ProofOfWork) => void;
    // Session Logs
    sessionLogs: SessionLog[];
    logSession: (log: SessionLog) => void;
    // Interaction Logs (CRM)
    interactionLogs: InteractionLog[];
    logInteraction: (log: InteractionLog) => void;
    updateInteractionLog: (id: string, updates: Partial<InteractionLog>) => void;
    deleteInteractionLog: (id: string) => void;

    // Cloud Actions
    fullSync: () => Promise<void>;

    // Auth & Profile
    profile: UserProfile | null;
    setProfile: (profile: UserProfile | null) => void;
    syncStatus: SyncStatus;
    setSyncStatus: (status: SyncStatus) => void;

    // Navigation & Usage History
    recentModuleIds: string[];
    trackModuleUsage: (moduleId: string) => void;
    recentBlockIds: string[];
    trackBlockUsage: (blockId: string) => void;
    wipeAllData: () => Promise<void>;

    // Persistence
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}


export const useContentStore = create<ContentState>()(
    persist(
        (set, get) => ({
            blocks: [],
            routines: [],
            events: [],
            categories: [
                { id: 'cat-1', name: 'Warmups' },
                { id: 'cat-2', name: 'Technical' },
                { id: 'cat-3', name: 'Repertoire' },
                { id: 'cat-4', name: 'Performance' },
                { id: 'cat-5', name: 'Coaching' },
                { id: 'cat-6', name: 'Other' },
            ],
            people: [],
            settings: {
                includeTOC: true,
                messageTemplates: ['Hey {name}, looking forward to our session at {time}!'],
                theme: 'vibrant',
            },
            paths: [],
            progress: [],
            proofs: [],
            sessionLogs: [],
            logSession: (log) => {
                set((state) => ({
                    sessionLogs: [log, ...(state.sessionLogs || [])],
                    // Auto-reset progress for this routine upon logging
                    progress: state.progress.filter(p => p.pathId !== log.routineId),
                }));
                // Future: syncToCloud('session_logs', log);
            },
            interactionLogs: [],
            logInteraction: (log) => {
                set((state) => ({
                    interactionLogs: [log, ...(state.interactionLogs || [])],
                }));
            },
            updateInteractionLog: (id, updates) => {
                set((state) => ({
                    interactionLogs: (state.interactionLogs || []).map(l => l.id === id ? { ...l, ...updates } : l),
                }));
            },
            deleteInteractionLog: (id) => {
                set((state) => ({
                    interactionLogs: (state.interactionLogs || []).filter(l => l.id !== id),
                }));
            },
            profile: null,
            setProfile: (profile) => set({ profile }),
            syncStatus: 'offline',
            setSyncStatus: (status) => set({ syncStatus: status }),
            recentModuleIds: ['modal/routine-editor', 'content', 'events', 'routines'],
            trackModuleUsage: (moduleId) => {
                set((state) => {
                    const filtered = state.recentModuleIds.filter(id => id !== moduleId);
                    return { recentModuleIds: [moduleId, ...filtered].slice(0, 4) };
                });
            },
            recentBlockIds: [],
            trackBlockUsage: (blockId) => {
                set((state) => {
                    const filtered = state.recentBlockIds.filter(id => id !== blockId);
                    return { recentBlockIds: [blockId, ...filtered].slice(0, 4) };
                });
            },
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            setTheme: (theme: AppTheme) => {
                set((state) => ({
                    settings: {
                        ...state.settings,
                        theme
                    }
                }));
            },


            addBlock: (block) => {
                set((state) => ({ blocks: [...state.blocks, block] }));
                syncToCloud('blocks', block);
            },
            updateBlock: (id, updates) => {
                set((state) => {
                    const newBlocks = state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b));
                    const updatedBlock = newBlocks.find(b => b.id === id);
                    if (updatedBlock) syncToCloud('blocks', updatedBlock);

                    return {
                        blocks: newBlocks,
                        routines: state.routines.map((r) => ({
                            ...r,
                            blocks: r.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
                        })),
                    };
                });
            },
            deleteBlock: (id) => {
                set((state) => ({
                    blocks: state.blocks.filter((b) => b.id !== id),
                    routines: state.routines.map((r) => ({
                        ...r,
                        blocks: r.blocks.filter((b) => b.id !== id),
                    })),
                }));
                deleteFromCloud('blocks', id);
            },

            addRoutine: (routine) => {
                set((state) => ({ routines: [...state.routines, routine] }));
                syncToCloud('routines', routine);
            },
            updateRoutine: (id, updates) => {
                set((state) => {
                    const newRoutines = state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r));
                    const updatedRoutine = newRoutines.find(r => r.id === id);
                    if (updatedRoutine) syncToCloud('routines', updatedRoutine);
                    return { routines: newRoutines };
                });
            },
            deleteRoutine: (id) => {
                set((state) => ({
                    routines: state.routines.filter((r) => r.id !== id),
                    events: state.events.map((e) => ({
                        ...e,
                        routines: e.routines.filter((rid) => rid !== id),
                    })),
                }));
                deleteFromCloud('routines', id);
            },

            addEvent: (event) => {
                set((state) => ({ events: [...state.events, event] }));
                syncToCloud('events', event);
            },
            updateEvent: (id, updates) => {
                set((state) => {
                    const newEvents = state.events.map((e) => (e.id === id ? { ...e, ...updates } : e));
                    const updatedEvent = newEvents.find(e => e.id === id);
                    if (updatedEvent) syncToCloud('events', updatedEvent);
                    return { events: newEvents };
                });
            },
            deleteEvent: (id) => {
                set((state) => ({ events: state.events.filter((e) => e.id !== id) }));
                deleteFromCloud('events', id);
            },

            addCategory: (category) => {
                set((state) => ({ categories: [...state.categories, category] }));
                syncToCloud('categories', category);
            },
            updateCategory: (id, updates) => {
                set((state) => {
                    const newCats = state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
                    const updatedCat = newCats.find(c => c.id === id);
                    if (updatedCat) syncToCloud('categories', updatedCat);
                    return { categories: newCats };
                });
            },
            deleteCategory: (id) => {
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                    blocks: state.blocks.map((b) => (b.categoryId === id ? { ...b, categoryId: undefined } : b)),
                }));
                deleteFromCloud('categories', id);
            },
            addPerson: (person) => {
                set((state) => ({ people: [...state.people, person] }));
                syncToCloud('people', person);
            },
            updatePerson: (id, updates) => {
                set((state) => {
                    const newPeople = state.people.map((p) => (p.id === id ? { ...p, ...updates } : p));
                    const updatedPerson = newPeople.find(p => p.id === id);
                    if (updatedPerson) syncToCloud('people', updatedPerson);
                    return { people: newPeople };
                });
            },
            deletePerson: (id) => {
                set((state) => ({ people: state.people.filter((p) => p.id !== id) }));
                deleteFromCloud('people', id);
            },

            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),

            addPath: (path) => {
                set((state) => ({ paths: [...state.paths, path] }));
                syncToCloud('learning_paths', path);
            },
            updatePath: (id, updates) => {
                set((state) => {
                    const newPaths = state.paths.map((p) => (p.id === id ? { ...p, ...updates } : p));
                    const updated = newPaths.find(p => p.id === id);
                    if (updated) syncToCloud('learning_paths', updated);
                    return { paths: newPaths };
                });
            },
            deletePath: (id) => {
                set((state) => ({ paths: state.paths.filter((p) => p.id !== id) }));
                deleteFromCloud('learning_paths', id);
            },
            forkPathRemote: async (originalPathId, originatorName, originatorPathTitle) => {
                const state = get();
                if (state.profile?.id.startsWith('mock-')) {
                    Alert.alert('Cloud Sync Only', 'Forking is only available when signed in.');
                    return null;
                }

                try {
                    const newId = Date.now().toString(); // Consistent with app's ID pattern
                    const { data, error } = await supabase.rpc('fork_path', {
                        original_path_id: originalPathId,
                        new_path_id: newId,
                        originator_name: originatorName,
                        originator_path_title: originatorPathTitle
                    });

                    if (error) throw error;

                    // Trigger a pull to get the new row
                    await state.fullSync();
                    return newId;
                } catch (err: any) {
                    Alert.alert('Fork Failed', err.message);
                    return null;
                }
            },
            updateProgress: (pathId, nodeId, completed) => {
                set((state) => {
                    if (completed) {
                        const newProgress: UserProgress = {
                            id: `${pathId}-${nodeId}`,
                            userId: state.profile?.id || 'offline',
                            pathId,
                            nodeId,
                            completedAt: new Date().toISOString(),
                        };
                        syncToCloud('user_progress', newProgress);
                        return { progress: [...state.progress, newProgress] };
                    } else {
                        deleteFromCloud('user_progress', `${pathId}-${nodeId}`); // Assuming deterministic ID for now
                        return { progress: state.progress.filter(p => !(p.pathId === pathId && p.nodeId === nodeId)) };
                    }
                });
            },
            addProof: (proof) => {
                set((state) => ({ proofs: [...state.proofs, proof] }));
                syncToCloud('proof_of_work', proof);
            },

            fullSync: async () => {
                const state = get();
                if (state.profile?.id.startsWith('mock-')) {
                    set({ syncStatus: 'offline' });
                    return;
                }

                set({ syncStatus: 'syncing' });

                try {
                    // 1. Push stage: Make sure everything local is up there
                    // This will now throw if the DB schema is not aligned!
                    await Promise.all([
                        pushAllToCloud('blocks', state.blocks),
                        pushAllToCloud('routines', state.routines),
                        pushAllToCloud('events', state.events),
                        pushAllToCloud('categories', state.categories),
                        pushAllToCloud('people', state.people),
                        pushAllToCloud('learning_paths', state.paths),
                        pushAllToCloud('user_progress', state.progress),
                        pushAllToCloud('proof_of_work', state.proofs),
                        pushAllToCloud('gear_assets', useGearStore.getState().assets),
                        pushAllToCloud('pack_lists', useGearStore.getState().packLists),
                    ]);

                    // 2. Pull stage: Get everything else
                    const [cloudData, cloudProfile] = await Promise.all([
                        pullFromCloud(),
                        pullProfileFromCloud(),
                    ]);

                    if (cloudData) {
                        // MERGE LOGIC: Additive merging to prevent local data loss
                        const merge = (local: any[], cloud: any[]) => {
                            const map = new Map();
                            // Local items first
                            local.forEach(item => map.set(item.id, item));
                            // Cloud items overwrite/augment local items
                            cloud.forEach(item => map.set(item.id, item));
                            return Array.from(map.values());
                        };

                        set({
                            blocks: merge(state.blocks, cloudData.blocks || []),
                            routines: merge(state.routines, cloudData.routines || []),
                            events: merge(state.events, cloudData.events || []),
                            categories: merge(state.categories, cloudData.categories || []),
                            people: merge(state.people, cloudData.people || []),
                            paths: merge(state.paths, cloudData.learning_paths || []),
                            progress: merge(state.progress, cloudData.user_progress || []),
                            proofs: merge(state.proofs, cloudData.proof_of_work || []),
                            profile: cloudProfile || state.profile,
                            syncStatus: 'synced'
                        });

                        Alert.alert('Sync Successful', 'Your data is now fully reconciled with the cloud.');

                        // 3. Sync Gear Store
                        useGearStore.getState().mergeFromCloud(
                            cloudData.gear_assets || [],
                            cloudData.pack_lists || []
                        );
                    } else {
                        set({ syncStatus: 'offline' });
                    }

                } catch (err: any) {
                    console.error('[FullSync Error]:', err);
                    set({ syncStatus: 'offline' });
                    Alert.alert('Sync Failed', err.message || 'Could not reconcile data with cloud.');
                }
            },

            wipeAllData: async () => {
                const state = get();

                // 1. Wipe Cloud Data if logged in
                if (state.profile && !state.profile.id.startsWith('mock-')) {
                    const { error } = await supabase.rpc('delete_own_data');
                    if (error) {
                        console.error('[Purge Error]:', error.message);
                        throw new Error('Failed to purge cloud data. Please try again or contact support.');
                    }
                }

                // 2. Wipe Local Data
                set({
                    blocks: [],
                    routines: [],
                    events: [],
                    people: [],
                    paths: [],
                    progress: [],
                    proofs: [],
                    recentModuleIds: [],
                    recentBlockIds: [],
                    profile: null,
                    syncStatus: 'offline'
                });

                // 3. Clear Storage explicitly using platform-specific method
                if (Platform.OS === 'web') {
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('maestro-content-storage');
                    }
                } else {
                    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                    await AsyncStorage.removeItem('maestro-content-storage');
                }
            },


        }),
        {
            name: 'maestro-content-storage',
            storage: createJSONStorage(() => createPlatformStorageAdapter()),
            version: 3,
            onRehydrateStorage: () => (state) => {
                console.log('🚀 [ContentStore] Hydration complete');
                state?.setHasHydrated(true);
            },
            migrate: (persistedState: any, version: number) => {
                if (version <= 2) {
                    // Migrate gigs to events
                    const state = persistedState as any;
                    if (state.gigs) {
                        state.events = [...(state.events || []), ...(state.gigs || [])];
                        delete state.gigs;
                    }
                    return state;
                }
                return persistedState;
            },
        }
    )
);
