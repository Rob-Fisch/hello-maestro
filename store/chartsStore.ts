import { ChordChart, ChordChartBar, ChordChartSection } from '@/store/types';
import { Platform } from 'react-native';
import uuid from 'react-native-uuid';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// Platform-specific storage for charts
const storage = Platform.OS === 'web'
    ? {
        getItem: (name: string) => {
            const value = window.localStorage.getItem(name);
            return value ? JSON.parse(value) : null;
        },
        setItem: (name: string, value: any) => {
            window.localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name: string) => {
            window.localStorage.removeItem(name);
        },
    }
    : undefined; // Will use AsyncStorage on native

interface ChartsState {
    charts: ChordChart[];

    // CRUD
    addChart: (chart: Partial<ChordChart>) => string;
    updateChart: (id: string, updates: Partial<ChordChart>) => void;
    deleteChart: (id: string) => void;

    // Section operations
    addSection: (chartId: string, section: Partial<ChordChartSection>) => string;
    updateSection: (chartId: string, sectionId: string, updates: Partial<ChordChartSection>) => void;
    deleteSection: (chartId: string, sectionId: string) => void;

    // Bar operations (within a section)
    addBar: (chartId: string, sectionId: string) => string;
    updateBar: (chartId: string, sectionId: string, barId: string, updates: Partial<ChordChartBar>) => void;
    deleteBar: (chartId: string, sectionId: string, barId: string) => void;

    // Transposition
    transposeChart: (chartId: string, semitones: number) => void;

    // Persistence
    _hasHydrated: boolean;
    setHasHydrated: (state: boolean) => void;
}

export const useChartsStore = create<ChartsState>()(
    persist(
        (set, get) => ({
            charts: [],
            _hasHydrated: false,
            setHasHydrated: (state) => set({ _hasHydrated: state }),

            // ========== CHART CRUD ==========
            addChart: (chartData) => {
                const id = uuid.v4() as string;
                const now = new Date().toISOString();
                const chart: ChordChart = {
                    id,
                    title: chartData.title || 'Untitled Chart',
                    key: chartData.key,
                    tempo: chartData.tempo,
                    timeSignature: chartData.timeSignature || '4/4',
                    sections: chartData.sections || [],
                    arrangement: chartData.arrangement,
                    songId: chartData.songId,
                    platform: Platform.OS === 'web' ? 'web' : 'native',
                    createdAt: now,
                    updatedAt: now,
                };
                set((state) => ({ charts: [...state.charts, chart] }));
                return id;
            },

            updateChart: (id, updates) => {
                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === id
                            ? { ...c, ...updates, updatedAt: new Date().toISOString() }
                            : c
                    ),
                }));
            },

            deleteChart: (id) => {
                set((state) => ({
                    charts: state.charts.filter((c) => c.id !== id),
                }));
            },

            // ========== SECTION CRUD ==========
            addSection: (chartId, sectionData) => {
                const sectionId = uuid.v4() as string;
                const section: ChordChartSection = {
                    id: sectionId,
                    name: sectionData.name || 'New Section',
                    bars: sectionData.bars || [
                        // Default: 4 empty bars
                        { id: uuid.v4() as string, chords: [] },
                        { id: uuid.v4() as string, chords: [] },
                        { id: uuid.v4() as string, chords: [] },
                        { id: uuid.v4() as string, chords: [] },
                    ],
                };

                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === chartId
                            ? {
                                ...c,
                                sections: [...c.sections, section],
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }));
                return sectionId;
            },

            updateSection: (chartId, sectionId, updates) => {
                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === chartId
                            ? {
                                ...c,
                                sections: c.sections.map((s) =>
                                    s.id === sectionId ? { ...s, ...updates } : s
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }));
            },

            deleteSection: (chartId, sectionId) => {
                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === chartId
                            ? {
                                ...c,
                                sections: c.sections.filter((s) => s.id !== sectionId),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }));
            },

            // ========== BAR CRUD ==========
            addBar: (chartId, sectionId) => {
                const barId = uuid.v4() as string;
                const bar: ChordChartBar = { id: barId, chords: [] };

                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === chartId
                            ? {
                                ...c,
                                sections: c.sections.map((s) =>
                                    s.id === sectionId
                                        ? { ...s, bars: [...s.bars, bar] }
                                        : s
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }));
                return barId;
            },

            updateBar: (chartId, sectionId, barId, updates) => {
                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === chartId
                            ? {
                                ...c,
                                sections: c.sections.map((s) =>
                                    s.id === sectionId
                                        ? {
                                            ...s,
                                            bars: s.bars.map((b) =>
                                                b.id === barId
                                                    ? { ...b, ...updates }
                                                    : b
                                            ),
                                        }
                                        : s
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }));
            },

            deleteBar: (chartId, sectionId, barId) => {
                set((state) => ({
                    charts: state.charts.map((c) =>
                        c.id === chartId
                            ? {
                                ...c,
                                sections: c.sections.map((s) =>
                                    s.id === sectionId
                                        ? { ...s, bars: s.bars.filter((b) => b.id !== barId) }
                                        : s
                                ),
                                updatedAt: new Date().toISOString(),
                            }
                            : c
                    ),
                }));
            },

            // ========== TRANSPOSITION ==========
            transposeChart: (chartId, semitones) => {
                set((state) => ({
                    charts: state.charts.map((c) => {
                        if (c.id !== chartId) return c;

                        // Transpose the key
                        const newKey = c.key ? transposeNote(c.key, semitones) : c.key;

                        // Transpose all chords in all sections
                        const newSections = c.sections.map((section) => ({
                            ...section,
                            bars: section.bars.map((bar) => ({
                                ...bar,
                                chords: bar.chords.map((chord) => ({
                                    ...chord,
                                    root: transposeNote(chord.root, semitones),
                                    bass: chord.bass ? transposeNote(chord.bass, semitones) : undefined,
                                })),
                            })),
                        }));

                        return {
                            ...c,
                            key: newKey,
                            sections: newSections,
                            updatedAt: new Date().toISOString(),
                        };
                    }),
                }));
            },
        }),
        {
            name: 'opusmode-charts-storage',
            storage: createJSONStorage(() => storage || require('@react-native-async-storage/async-storage').default),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Transpose a note by a given number of semitones
 */
export function transposeNote(note: string, semitones: number): string {
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    // Determine if we should use flats or sharps based on the original note
    const useFlats = note.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(note);
    const scale = useFlats ? chromaticFlat : chromatic;

    // Find current position
    let index = chromatic.indexOf(note);
    if (index === -1) {
        index = chromaticFlat.indexOf(note);
    }
    if (index === -1) return note; // Unknown note, return as-is

    // Calculate new position (wrapping around)
    const newIndex = ((index + semitones) % 12 + 12) % 12;
    return scale[newIndex];
}

/**
 * Get all 12 roots ordered by musical relevance to the key
 * Uses circle of fifths distance, with diatonic notes prioritized
 */
export function getOrderedRoots(key: string): string[] {
    // Circle of fifths (sharps direction)
    const circleOfFifths = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];

    // Find key position in circle
    let keyIndex = circleOfFifths.indexOf(key);
    if (keyIndex === -1) {
        // Handle enharmonic equivalents
        const enharmonic: Record<string, string> = { 'Gb': 'F#', 'C#': 'Db', 'G#': 'Ab', 'D#': 'Eb', 'A#': 'Bb' };
        keyIndex = circleOfFifths.indexOf(enharmonic[key] || 'C');
    }

    // Get diatonic scale degrees for this key (these are highest priority)
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
    const majorIntervals = [0, 2, 4, 5, 7, 9, 11];

    let rootIndex = chromatic.indexOf(key);
    const useFlats = key.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(key);
    if (rootIndex === -1) rootIndex = chromaticFlat.indexOf(key);
    if (rootIndex === -1) rootIndex = 0;

    const scale = useFlats ? chromaticFlat : chromatic;
    const diatonicRoots = majorIntervals.map(i => scale[(rootIndex + i) % 12]);

    // Order remaining chromatic notes by circle of fifths distance
    const allNotes = useFlats ? chromaticFlat : chromatic;
    const nonDiatonic = allNotes.filter(n => !diatonicRoots.includes(n));

    // Sort non-diatonic by circle distance from key
    nonDiatonic.sort((a, b) => {
        const aIdx = circleOfFifths.indexOf(a) >= 0 ? circleOfFifths.indexOf(a) : circleOfFifths.indexOf(chromaticFlat[chromatic.indexOf(a)]);
        const bIdx = circleOfFifths.indexOf(b) >= 0 ? circleOfFifths.indexOf(b) : circleOfFifths.indexOf(chromaticFlat[chromatic.indexOf(b)]);
        const aDist = Math.min(Math.abs(aIdx - keyIndex), 12 - Math.abs(aIdx - keyIndex));
        const bDist = Math.min(Math.abs(bIdx - keyIndex), 12 - Math.abs(bIdx - keyIndex));
        return aDist - bDist;
    });

    return [...diatonicRoots, ...nonDiatonic];
}

/**
 * Format a chord for display (e.g., "C7", "Bbmaj7", "F#m7b5")
 */
export function formatChord(chord: { root: string; quality: string; bass?: string }): string {
    if (!chord.root) return '';

    // Map quality to display format
    const qualityMap: Record<string, string> = {
        'maj': '',        // Major is often implicit
        'min': 'm',
        'm7': 'm7',
        'maj7': 'maj7',
        'dim': 'dim',
        'm7b5': 'm7♭5',
        'aug': 'aug',
        'sus4': 'sus4',
        '7': '7',
        '9': '9',
        'm9': 'm9',
        '6': '6',
        '7b9': '7♭9',
    };

    const displayQuality = qualityMap[chord.quality] ?? chord.quality;
    const base = `${chord.root}${displayQuality}`;

    return chord.bass ? `${base}/${chord.bass}` : base;
}

/**
 * Get diatonic chords for a given key and mode
 */
export function getDiatonicChords(key: string, mode: 'major' | 'minor' = 'major'): { root: string; quality: string }[] {
    // Chromatic scale for calculating note positions
    const chromatic = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const chromaticFlat = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

    // Major scale intervals (semitones from root): 0, 2, 4, 5, 7, 9, 11
    const majorIntervals = [0, 2, 4, 5, 7, 9, 11];
    // Natural minor intervals: 0, 2, 3, 5, 7, 8, 10
    const minorIntervals = [0, 2, 3, 5, 7, 8, 10];

    // Quality patterns
    // Major: I, ii, iii, IV, V, vi, vii°
    const majorQualities = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
    // Natural minor: i, ii°, III, iv, v, VI, VII
    const minorQualities = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];

    // Find root position
    let rootIndex = chromatic.indexOf(key);
    const useFlats = key.includes('b') || ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'].includes(key);
    if (rootIndex === -1) {
        rootIndex = chromaticFlat.indexOf(key);
    }
    if (rootIndex === -1) {
        rootIndex = 0; // Default to C
    }

    const intervals = mode === 'minor' ? minorIntervals : majorIntervals;
    const qualities = mode === 'minor' ? minorQualities : majorQualities;
    const scale = useFlats ? chromaticFlat : chromatic;

    return intervals.map((interval, i) => ({
        root: scale[(rootIndex + interval) % 12],
        quality: qualities[i]
    }));
}

