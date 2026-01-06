import { createPlatformStorage } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import { deleteFromCloud, mapFromDb, pullFromCloud, pullProfileFromCloud, pushAllToCloud, syncToCloud } from '@/lib/sync';
import { Alert, Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useFinanceStore } from './financeStore';
import { useGearStore } from './gearStore';
import { AppEvent, AppTheme, Category, ContentBlock, InteractionLog, LearningPath, Person, ProofOfWork, Routine, SessionLog, SyncStatus, UserProfile, UserProgress, UserSettings } from './types';

// Platform-specific storage for Zustand persistence


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
    duplicateRoutine: (id: string) => string | undefined;
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

    // SAFE Logout
    wipeLocalData: () => Promise<void>;
    // DANGER Account Deletion
    nukeAccount: () => Promise<void>;

    // Public / Community
    publicRoutines: Routine[];
    fetchPublicRoutines: () => Promise<void>;
    forkRemoteRoutine: (routine: Routine) => void;

    // Persistence
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;

    // Realtime Sync
    realtimeSub: any | null; // Keep as any to avoid complex type deps in interface
    initRealtime: () => void;
    cleanupRealtime: () => void;
    handleRealtimeEvent: (payload: any) => void;

    // Parent Proxy / Student Mode
    studentMode: boolean;
    toggleStudentMode: (enabled: boolean) => void;
}


export const useContentStore = create<ContentState>()(
    persist(
        (set, get) => ({
            blocks: [],
            routines: [],
            events: [],
            categories: [
                { id: uuid.v4() as string, name: 'Warmups' },
                { id: uuid.v4() as string, name: 'Technical' },
                { id: uuid.v4() as string, name: 'Repertoire' },
                { id: uuid.v4() as string, name: 'Performance' },
                { id: uuid.v4() as string, name: 'Coaching' },
                { id: uuid.v4() as string, name: 'Other' },
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


            realtimeSub: null,

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
            duplicateRoutine: (id) => {
                const state = get();
                const original = state.routines.find((r) => r.id === id);
                if (!original) return;

                const newRoutine: Routine = {
                    ...original,
                    id: Date.now().toString(),
                    title: `Copy of ${original.title}`,
                    createdAt: new Date().toISOString(),
                    isPublic: false, // Reset visibility
                    // Deep copy blocks if necessary, but arguably blocks are references. 
                    // If blocks are modified in the copy, do they affect the original? 
                    // No, usually blocks are shared entities in the 'blocks' store. 
                    // The 'blocks' array in a routine acts as a playlist sequence.
                    blocks: [...original.blocks]
                };

                set((state) => ({ routines: [...state.routines, newRoutine] }));
                syncToCloud('routines', newRoutine);
                return newRoutine.id;
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
                if (!state.profile) {
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
                if (!state.profile) {
                    set({ syncStatus: 'offline' });
                    return;
                }

                // PREMIUM GATE LIFTED: Puddle Proofing (Push) is now for everyone.
                // However, PULL (Active Sync between devices) is Restricted to Premium.

                set({ syncStatus: 'syncing' });

                const { data: { session } } = await supabase.auth.getSession();
                if (!session?.user) {
                    console.warn('[FullSync] No active Supabase session found. Logging out local user.');
                    Alert.alert('Session Expired', 'Please sign in again to resume syncing.');
                    set({ profile: null, syncStatus: 'offline' });
                    return;
                }

                try {
                    // 1. Push stage: BACKUP EVERYONE
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
                        pushAllToCloud('transactions', useFinanceStore.getState().transactions),
                    ]);


                    // 2. Pull stage: Universal (Data Portability)
                    // Free users can pull, but they don't get Realtime updates.
                    // This ensures they can restore from backup on login/refresh.
                    console.log('[FullSync] Starting Pull...');
                    const [cloudData, cloudProfile] = await Promise.all([
                        pullFromCloud(),
                        pullProfileFromCloud(),
                    ]);

                    if (cloudData) {
                        console.log('[FullSync] Pulled Data:', Object.keys(cloudData).map(k => `${k}: ${cloudData[k]?.length}`));



                        // CLOUD TRUTH LOGIC:
                        // 1. We already PUSHED our changes above (lines 383-395).
                        // 2. So the Cloud now has our local "Offline Work".
                        // 3. We can safely OVERWRITE local with Cloud, because Cloud = Local + Remote.
                        set({
                            blocks: cloudData.blocks || [],
                            routines: cloudData.routines || [],
                            events: cloudData.events || [],
                            categories: cloudData.categories || [],
                            people: cloudData.people || [],
                            paths: cloudData.learning_paths || [],
                            progress: cloudData.user_progress || [],
                            proofs: cloudData.proof_of_work || [],
                            profile: cloudProfile || state.profile,
                            syncStatus: 'synced'
                        });

                        const eventCount = (cloudData.events || []).length;
                        console.log(`[FullSync] sync complete. Pulled ${eventCount} events.`);

                        // 3. Sync Gear Store
                        useGearStore.getState().mergeFromCloud(
                            cloudData.gear_assets || [],
                            cloudData.pack_lists || []
                        );

                        // 4. Sync Finance Store
                        if (cloudData.transactions) {
                            useFinanceStore.getState().setTransactions(cloudData.transactions);
                        }
                    } else {
                        console.log('[FullSync] No cloud data returned');
                        Alert.alert('Sync Info', 'Unable to reach cloud. Your session may have expired. Please Sign Out and Sign In again.');
                        set({ syncStatus: 'offline' });
                    }

                } catch (err: any) {
                    console.error('[FullSync Error]:', err);
                    set({ syncStatus: 'offline' });
                    Alert.alert('Sync Failed', err.message || 'Could not reconcile data with cloud.');
                }
            },

            nukeAccount: async () => {
                const state = get();

                // 1. Wipe Cloud Data if logged in (DANGER!)
                if (state.profile) {
                    const { error } = await supabase.rpc('delete_own_data');
                    if (error) {
                        console.warn('[Purge RPC Missing/Failed]:', error.message);
                        // Fallback: Delete table by table manually
                        await supabase.from('blocks').delete().eq('user_id', state.profile?.id);
                        await supabase.from('routines').delete().eq('user_id', state.profile?.id);
                        await supabase.from('events').delete().eq('user_id', state.profile?.id);
                        await supabase.from('learning_paths').delete().eq('user_id', state.profile?.id);
                        await supabase.from('user_progress').delete().eq('user_id', state.profile?.id);
                        await supabase.from('proof_of_work').delete().eq('user_id', state.profile?.id);
                        await supabase.from('categories').delete().eq('user_id', state.profile?.id);
                        await supabase.from('people').delete().eq('user_id', state.profile?.id);
                        await supabase.from('gear_assets').delete().eq('user_id', state.profile?.id);
                        await supabase.from('pack_lists').delete().eq('user_id', state.profile?.id);
                    }
                }

                // 2. Call local wipe
                get().wipeLocalData();
            },

            wipeLocalData: async () => {
                // 1. Wipe Local State
                try {
                    // Clear Supabase Session Local (though auth.tsx handles router replace)
                    // Note: We don't sign out from Supabase here to avoid circular dep if needed, but usually we should.
                    // supabase.auth.signOut(); // Let component handle this to avoid flicker?
                } catch (e) { }

                set({
                    blocks: [],
                    routines: [],
                    events: [],
                    categories: [
                        { id: uuid.v4() as string, name: 'Warmups' },
                        { id: uuid.v4() as string, name: 'Technical' },
                        { id: uuid.v4() as string, name: 'Repertoire' },
                        { id: uuid.v4() as string, name: 'Performance' },
                        { id: uuid.v4() as string, name: 'Coaching' },
                        { id: uuid.v4() as string, name: 'Other' },
                    ],
                    people: [],
                    paths: [],
                    progress: [],
                    proofs: [],
                    recentModuleIds: [],
                    recentBlockIds: [],
                    profile: null,
                    syncStatus: 'offline',
                    publicRoutines: [], // Clear public cache
                });

                // 2. Clear Storage explicitly using platform-specific method
                if (Platform.OS === 'web') {
                    if (typeof window !== 'undefined') {
                        window.localStorage.removeItem('maestro-content-storage');
                    }
                } else {
                    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
                    await AsyncStorage.removeItem('maestro-content-storage');
                }
            },

            publicRoutines: [],
            fetchPublicRoutines: async () => {
                const state = get();
                if (!state.profile) {
                    return;
                }

                try {
                    const { data, error } = await supabase
                        .from('routines')
                        .select('*')
                        .eq('is_public', true)
                        .neq('user_id', state.profile.id)
                        .order('created_at', { ascending: false })
                        .limit(20);

                    if (error) throw error;

                    if (data) {
                        set({ publicRoutines: data });
                    }
                } catch (err) {
                    console.error('Error fetching public routines:', err);
                }
            },

            forkRemoteRoutine: (routine) => {
                const state = get();
                const newRoutine: Routine = {
                    ...routine,
                    id: Date.now().toString(),
                    title: `Copy of ${routine.title}`,
                    createdAt: new Date().toISOString(),
                    isPublic: false, // Reset visibility
                    blocks: routine.blocks || [] // Ensure blocks are carried over
                };

                set((state) => ({ routines: [...state.routines, newRoutine] }));
                syncToCloud('routines', newRoutine);
                Alert.alert('Saved to Library', `"${newRoutine.title}" has been added to your collection.`);
            },

            initRealtime: () => {
                const state = get();
                // Avoid multiple subscriptions or subscribing mock users
                if (state.realtimeSub || !state.profile) return;

                const userId = state.profile.id;
                console.log('[Realtime] Initializing subscription for user:', userId);

                const channel = supabase.channel('db-changes')
                    .on(
                        'postgres_changes',
                        { event: '*', schema: 'public', filter: `user_id=eq.${userId}` },
                        (payload) => state.handleRealtimeEvent(payload)
                    )
                    .subscribe((status) => {
                        console.log('[Realtime] Status:', status);
                    });

                set({ realtimeSub: channel });
            },

            cleanupRealtime: () => {
                const state = get();
                if (state.realtimeSub) {
                    console.log('[Realtime] Unsubscribing...');
                    supabase.removeChannel(state.realtimeSub);
                    set({ realtimeSub: null });
                }
            },

            handleRealtimeEvent: (payload: any) => {
                const { eventType, table, new: newRecord, old: oldRecord } = payload;
                // console.log(`[Realtime] ${eventType} on ${table}`);

                // Helper to upsert (Insert or Update)
                const upsert = (list: any[], item: any) => {
                    // Check by ID
                    const mappedItem = mapFromDb(item); // Convert snake_case -> camelCase
                    const exists = list.find(l => l.id === mappedItem.id);

                    if (exists) {
                        // Optional: Deep compare to avoid unnecessary re-renders?
                        // For now, blind update to ensure consistency
                        return list.map(l => l.id === mappedItem.id ? { ...l, ...mappedItem } : l);
                    }
                    // Insert new
                    return [mappedItem, ...list];
                };

                const remove = (list: any[], id: string) => list.filter(l => l.id !== id);

                set((state) => {
                    switch (table) {
                        case 'blocks':
                            if (eventType === 'DELETE') return { blocks: remove(state.blocks, oldRecord.id) };
                            return { blocks: upsert(state.blocks, newRecord) };
                        case 'routines':
                            if (eventType === 'DELETE') return { routines: remove(state.routines, oldRecord.id) };
                            return { routines: upsert(state.routines, newRecord) };
                        case 'events':
                            if (eventType === 'DELETE') return { events: remove(state.events, oldRecord.id) };
                            return { events: upsert(state.events, newRecord) };
                        case 'categories':
                            if (eventType === 'DELETE') return { categories: remove(state.categories, oldRecord.id) };
                            return { categories: upsert(state.categories, newRecord) };
                        case 'people':
                            if (eventType === 'DELETE') return { people: remove(state.people, oldRecord.id) };
                            return { people: upsert(state.people, newRecord) };
                        case 'learning_paths':
                            if (eventType === 'DELETE') return { paths: remove(state.paths, oldRecord.id) };
                            // Paths uses 'paths' key in store, but 'learning_paths' in DB
                            return { paths: upsert(state.paths, newRecord) };
                        case 'user_progress':
                            // Special case: Progress
                            // We use upsert logic for progress too
                            if (eventType === 'DELETE') return { progress: remove(state.progress, oldRecord.id) };
                            return { progress: upsert(state.progress, newRecord) };
                        case 'proof_of_work':
                            if (eventType === 'DELETE') return { proofs: remove(state.proofs, oldRecord.id) };
                            return { proofs: upsert(state.proofs, newRecord) };
                        case 'profiles':
                            // Handle profile updates (e.g. is_premium change)
                            if (newRecord && state.profile && newRecord.id === state.profile.id) {
                                const mappedProfile = mapFromDb(newRecord);
                                return { profile: { ...state.profile, ...mappedProfile } };
                            }
                            return {};
                        // Gear tables handled via GearStore? Or we trigger a refresh?
                        // Ideally we'd dispatch to GearStore, but contentStore doesn't own that state.
                        // For now, contentStore only syncs core content.
                    }
                    return {};
                });
            },

            // Student Mode
            studentMode: false,
            toggleStudentMode: (enabled) => set({ studentMode: enabled }),

        }),
        {
            name: 'maestro-content-storage',
            storage: createJSONStorage(() => createPlatformStorage()),
            version: 5,

            // EXCLUDE realtimeSub from persistence to prevent crashes
            partialize: (state) => {
                const { realtimeSub, ...rest } = state;
                return rest;
            },

            onRehydrateStorage: () => (state) => {
                console.log('🚀 [ContentStore] Hydration complete');
                state?.setHasHydrated(true);
            },
            migrate: (persistedState: any, version: number) => {
                let state = persistedState as any;
                if (version <= 2) {
                    // Migrate gigs to events
                    if (state.gigs) {
                        state.events = [...(state.events || []), ...(state.gigs || [])];
                        delete state.gigs;
                    }
                }
                if (version <= 3) {
                    // Migrate legacy categories (cat-1..6) to STATIC unique IDs
                    const idMap: Record<string, string> = {
                        'cat-1': 'default-cat-1',
                        'cat-2': 'default-cat-2',
                        'cat-3': 'default-cat-3',
                        'cat-4': 'default-cat-4',
                        'cat-5': 'default-cat-5',
                        'cat-6': 'default-cat-6',
                    };



                    state.categories = (state.categories || []).map((c: Category) => {
                        if (idMap[c.id]) {
                            return { ...c, id: idMap[c.id] };
                        }
                        return c;
                    });


                    state.blocks = (state.blocks || []).map((b: ContentBlock) => {
                        if (b.categoryId && idMap[b.categoryId]) {
                            return { ...b, categoryId: idMap[b.categoryId] };
                        }
                        return b;
                    });
                }
                if (version <= 4) {
                    // Migrate legacy categories (default-cat-X) to UUIDs to fix RLS collisions
                    const idMap: Record<string, string> = {};

                    // 1. Identify and map legacy IDs
                    state.categories = (state.categories || []).map((c: Category) => {
                        if (c.id && c.id.startsWith('default-cat-')) {
                            const newId = uuid.v4() as string;
                            idMap[c.id] = newId;
                            return { ...c, id: newId };
                        }
                        return c;
                    });

                    // 2. Update Blocks referencing those IDs
                    if (Object.keys(idMap).length > 0) {
                        state.blocks = (state.blocks || []).map((b: ContentBlock) => {
                            if (b.categoryId && idMap[b.categoryId]) {
                                return { ...b, categoryId: idMap[b.categoryId] };
                            }
                            return b;
                        });
                    }
                }
                return state;
            },
        }
    )
);
