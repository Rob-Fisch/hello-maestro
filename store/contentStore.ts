import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContentBlock, Routine, AppEvent, Category, Person, UserSettings } from './types';

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

    // Aliases for backward compatibility during transition if needed
    gigs?: AppEvent[];
}

export const useContentStore = create<ContentState>()(
    persist(
        (set) => ({
            blocks: [],
            routines: [],
            events: [],
            categories: [
                { id: 'cat-1', name: 'Scales & Arpeggios' },
                { id: 'cat-2', name: 'Etudes & Technical Studies' },
                { id: 'cat-3', name: 'Chord Studies' },
                { id: 'cat-4', name: 'Improvisation' },
                { id: 'cat-5', name: 'Warm-up' },
                { id: 'cat-6', name: 'Other' },
            ],
            people: [],
            settings: {
                includeTOC: true,
                messageTemplates: [
                    "Everything is on schedule!",
                    "Schedule update: The performace has been delayed by 30 minutes.",
                    "Reminder: Soundcheck is at 5:00 PM.",
                    "Quick check: Is everyone ready for the gig tonight?",
                ],
            },
            addBlock: (block) => set((state) => ({ blocks: [...state.blocks, block] })),
            updateBlock: (id, updates) =>
                set((state) => ({
                    blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
                    routines: state.routines.map((r) => ({
                        ...r,
                        blocks: r.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
                    })),
                })),
            deleteBlock: (id) =>
                set((state) => ({
                    blocks: state.blocks.filter((b) => b.id !== id),
                    routines: state.routines.map((r) => ({
                        ...r,
                        blocks: r.blocks.filter((b) => b.id !== id),
                    })),
                })),
            addRoutine: (routine) => set((state) => ({ routines: [...state.routines, routine] })),
            updateRoutine: (id, updates) =>
                set((state) => ({
                    routines: state.routines.map((r) => (r.id === id ? { ...r, ...updates } : r)),
                })),
            deleteRoutine: (id) =>
                set((state) => ({
                    routines: state.routines.filter((r) => r.id !== id),
                    events: state.events.map((e) => ({
                        ...e,
                        routines: e.routines.filter((rid) => rid !== id),
                    })),
                })),
            addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
            updateEvent: (id, updates) =>
                set((state) => ({
                    events: state.events.map((e) => (e.id === id ? { ...e, ...updates } : e)),
                })),
            deleteEvent: (id) =>
                set((state) => ({ events: state.events.filter((e) => e.id !== id) })),
            addCategory: (category) =>
                set((state) => ({ categories: [...state.categories, category] })),
            updateCategory: (id, updates) =>
                set((state) => ({
                    categories: state.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
                })),
            deleteCategory: (id) =>
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                    blocks: state.blocks.map((b) => (b.categoryId === id ? { ...b, categoryId: undefined } : b)),
                })),
            addPerson: (person) => set((state) => ({ people: [...state.people, person] })),
            updatePerson: (id, updates) =>
                set((state) => ({
                    people: state.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
                })),
            deletePerson: (id) =>
                set((state) => ({ people: state.people.filter((p) => p.id !== id) })),
            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),
        }),
        {
            name: 'maestro-content-storage',
            storage: createJSONStorage(() => AsyncStorage),
            version: 3,
            migrate: (persistedState: any, version: number) => {
                if (version <= 2) {
                    // Migrate gigs to events
                    const legacyGigs = persistedState.gigs || [];
                    const migratedEvents = legacyGigs.map((gig: any) => ({
                        ...gig,
                        type: 'performance', // Default existing gigs to performance
                    }));
                    return {
                        ...persistedState,
                        events: migratedEvents,
                        gigs: undefined, // Remove legacy key
                    };
                }
                return persistedState;
            },
        }
    )
);
