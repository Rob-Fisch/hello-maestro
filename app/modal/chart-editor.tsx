import { formatChord, getDiatonicChords, getOrderedRoots, useChartsStore } from '@/store/chartsStore';
import { Chord, ChordChart, ChordChartBar, ChordChartSection } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// Chord quality options
const PRIMARY_QUALITIES = ['maj', 'min', '7', 'm7', 'maj7', 'dim'];
const SECONDARY_QUALITIES = ['m7b5', 'aug', 'sus4', '9', 'm9', '6', '7b9'];

export default function ChartEditorScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { charts, updateChart, addSection, updateSection, deleteSection, updateBar, addBar, deleteBar, transposeChart } = useChartsStore();

    const [chart, setChart] = useState<ChordChart | null>(null);
    const [selectedBarId, setSelectedBarId] = useState<string | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<number>(0); // Which beat slot in subdivided bar
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingKey, setEditingKey] = useState(false);
    const [showChordPicker, setShowChordPicker] = useState(false);
    const [showSecondaryQualities, setShowSecondaryQualities] = useState(false);
    const [editingSectionName, setEditingSectionName] = useState<string | null>(null);
    const [showTranspose, setShowTranspose] = useState(false);
    const [useChromatic, setUseChromatic] = useState(false); // Toggle for chromatic vs smart order

    // Build-and-confirm chord state
    const [pendingRoot, setPendingRoot] = useState<string | null>(null);
    const [pendingQuality, setPendingQuality] = useState<string>('maj'); // Default to triad

    // Load chart from store
    useEffect(() => {
        if (id) {
            const found = charts.find(c => c.id === id);
            setChart(found || null);
        }
    }, [id, charts]);

    if (!chart) {
        return (
            <SafeAreaView className="flex-1 bg-slate-900 items-center justify-center">
                <Text className="text-white">Chart not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-indigo-400">Go Back</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // Get diatonic chords for smart picks (based on key AND mode)
    const diatonicChords = chart.key ? getDiatonicChords(chart.key, chart.mode || 'major') : [];

    // Handle title update
    const handleTitleChange = (title: string) => {
        updateChart(chart.id, { title });
    };

    // Handle key update
    const handleKeyChange = (key: string) => {
        updateChart(chart.id, { key });
        setEditingKey(false);
    };

    // Add a new section
    const handleAddSection = () => {
        const sectionId = addSection(chart.id, { name: `Section ${chart.sections.length + 1}` });
        setSelectedSectionId(sectionId);
    };

    // Delete a section
    const handleDeleteSection = (sectionId: string) => {
        const section = chart.sections.find(s => s.id === sectionId);
        Alert.alert(
            'Delete Section',
            `Delete "${section?.name || 'this section'}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteSection(chart.id, sectionId) }
            ]
        );
    };

    // Handle bar tap - open picker and reset pending state (for single-chord bars)
    const handleBarTap = (sectionId: string, barId: string, slot: number = 0) => {
        setSelectedSectionId(sectionId);
        setSelectedBarId(barId);
        setSelectedSlot(slot);

        // Load existing chord at this slot into pending state, or reset
        const section = chart.sections.find(s => s.id === sectionId);
        const bar = section?.bars.find(b => b.id === barId);
        const existingChord = bar?.chords[slot];

        if (existingChord) {
            setPendingRoot(existingChord.root);
            setPendingQuality(existingChord.quality);
        } else {
            setPendingRoot(null);
            setPendingQuality('maj');
        }

        setShowChordPicker(true);
    };

    // Select a root note (keeps picker open)
    const handleSelectRoot = (root: string) => {
        setPendingRoot(root);
    };

    // Select a quality (keeps picker open)
    const handleSelectQuality = (quality: string) => {
        setPendingQuality(quality);
    };

    // Apply a smart pick (pre-built chord)
    const handleSmartPick = (root: string, quality: string) => {
        setPendingRoot(root);
        setPendingQuality(quality);
    };

    // Confirm and apply the pending chord to the selected slot
    const handleConfirmChord = () => {
        if (!selectedSectionId || !selectedBarId || !pendingRoot) return;

        const section = chart.sections.find(s => s.id === selectedSectionId);
        const bar = section?.bars.find(b => b.id === selectedBarId);
        if (!bar) return;

        // Copy existing chords, update the specific slot
        const newChords = [...bar.chords];
        const chord: Chord = { root: pendingRoot, quality: pendingQuality, beat: selectedSlot + 1 };
        newChords[selectedSlot] = chord;

        updateBar(chart.id, selectedSectionId, selectedBarId, { chords: newChords });

        // Close picker and reset
        setShowChordPicker(false);
        setSelectedBarId(null);
        setSelectedSlot(0);
        setPendingRoot(null);
        setPendingQuality('maj');
    };

    // Subdivide a bar: 1 → 2 → 4 slots
    const handleSubdivideBar = () => {
        if (!selectedSectionId || !selectedBarId) return;

        const section = chart.sections.find(s => s.id === selectedSectionId);
        const bar = section?.bars.find(b => b.id === selectedBarId);
        if (!bar) return;

        const currentCount = bar.chords.length;

        if (currentCount <= 1) {
            // 1 → 2: duplicate first chord to both slots
            const chord = bar.chords[0] || { root: 'C', quality: 'maj', beat: 1 };
            updateBar(chart.id, selectedSectionId, selectedBarId, {
                chords: [chord, { ...chord, beat: 2 }]
            });
        } else if (currentCount === 2) {
            // 2 → 4: expand each half to two beats
            const c1 = bar.chords[0] || { root: 'C', quality: 'maj', beat: 1 };
            const c2 = bar.chords[1] || { root: 'C', quality: 'maj', beat: 3 };
            updateBar(chart.id, selectedSectionId, selectedBarId, {
                chords: [
                    { ...c1, beat: 1 },
                    { ...c1, beat: 2 },
                    { ...c2, beat: 3 },
                    { ...c2, beat: 4 }
                ]
            });
        }
        // If already 4, do nothing
    };

    // Merge bar: 4 → 2 → 1
    const handleMergeBar = () => {
        if (!selectedSectionId || !selectedBarId) return;

        const section = chart.sections.find(s => s.id === selectedSectionId);
        const bar = section?.bars.find(b => b.id === selectedBarId);
        if (!bar || bar.chords.length <= 1) return;

        const currentCount = bar.chords.length;

        if (currentCount >= 4) {
            // 4 → 2: take beats 1 and 3
            updateBar(chart.id, selectedSectionId, selectedBarId, {
                chords: [bar.chords[0], bar.chords[2]].filter(Boolean)
            });
        } else {
            // 2 → 1: take first chord only
            updateBar(chart.id, selectedSectionId, selectedBarId, {
                chords: bar.chords[0] ? [bar.chords[0]] : []
            });
        }
    };

    // Clear chord from bar
    const handleClearBar = () => {
        if (!selectedSectionId || !selectedBarId) return;
        updateBar(chart.id, selectedSectionId, selectedBarId, { chords: [] });
        setShowChordPicker(false);
        setSelectedBarId(null);
        setPendingRoot(null);
        setPendingQuality('maj');
    };

    // Cancel without saving
    const handleCancelPicker = () => {
        setShowChordPicker(false);
        setSelectedBarId(null);
        setPendingRoot(null);
        setPendingQuality('maj');
    };

    // Add 4 more bars to a section
    const handleAddBars = (sectionId: string) => {
        for (let i = 0; i < 4; i++) {
            addBar(chart.id, sectionId);
        }
    };

    // Render a single bar cell (supports subdivided bars with 2 chords)
    const renderBar = (section: ChordChartSection, bar: ChordChartBar, index: number) => {
        const isSelected = selectedBarId === bar.id && selectedSectionId === section.id;
        const isSubdivided = bar.chords.length >= 2;

        // Check if there's a previous chord in this section (for repeat display)
        const hasPreviousChord = section.bars.slice(0, index).some(b => b.chords.length > 0);

        // Helper to get display text for a slot
        const getSlotDisplay = (slotIndex: number): string => {
            const chord = bar.chords[slotIndex];
            if (chord) return formatChord(chord);
            // Empty slot: show / if previous chord exists
            const prevChord = slotIndex > 0 ? bar.chords[slotIndex - 1] : (hasPreviousChord ? true : null);
            return prevChord ? '/' : '';
        };

        // Subdivided bar: 2 slots (side by side) or 4 slots (2x2 grid)
        if (isSubdivided) {
            const is4Slot = bar.chords.length >= 4;

            return (
                <View key={bar.id} className="w-[23%] aspect-square">
                    <View className={`flex-1 rounded-lg overflow-hidden border-2 ${isSelected ? 'border-cyan-400' : 'border-slate-600'}`}>
                        {is4Slot ? (
                            // 4-slot: 2x2 grid
                            <View className="flex-1">
                                {[0, 2].map((rowStart) => (
                                    <View key={rowStart} className={`flex-1 flex-row ${rowStart === 0 ? 'border-b border-slate-600' : ''}`}>
                                        {[0, 1].map((col) => {
                                            const slotIdx = rowStart + col;
                                            const slotChord = bar.chords[slotIdx];
                                            const slotDisplay = slotChord ? formatChord(slotChord) : '/';
                                            const isSlotSelected = isSelected && selectedSlot === slotIdx;
                                            return (
                                                <TouchableOpacity
                                                    key={slotIdx}
                                                    onPress={() => handleBarTap(section.id, bar.id, slotIdx)}
                                                    className={`flex-1 items-center justify-center ${isSlotSelected ? 'bg-cyan-500/30' : 'bg-slate-700/50'
                                                        } ${col === 0 ? 'border-r border-slate-600' : ''}`}
                                                >
                                                    <Text className="absolute top-0 left-0.5 text-slate-500 text-[8px]">{slotIdx + 1}</Text>
                                                    <Text className={`text-xs font-bold ${slotChord ? 'text-white' : 'text-slate-500'}`}>
                                                        {slotDisplay}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        ) : (
                            // 2-slot: side by side
                            <View className="flex-1 flex-row">
                                {[0, 1].map((slotIdx) => {
                                    const slotChord = bar.chords[slotIdx];
                                    const slotDisplay = slotChord ? formatChord(slotChord) : '/';
                                    const isSlotSelected = isSelected && selectedSlot === slotIdx;
                                    return (
                                        <TouchableOpacity
                                            key={slotIdx}
                                            onPress={() => handleBarTap(section.id, bar.id, slotIdx)}
                                            className={`flex-1 items-center justify-center ${isSlotSelected ? 'bg-cyan-500/30' : 'bg-slate-700/50'
                                                } ${slotIdx === 0 ? 'border-r border-slate-600' : ''}`}
                                        >
                                            <Text className={`text-sm font-bold ${slotChord ? 'text-white' : 'text-slate-500'}`}>
                                                {slotDisplay}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        )}
                    </View>
                    {/* Delete button */}
                    {isSelected && (
                        <TouchableOpacity
                            onPress={() => {
                                deleteBar(chart.id, section.id, bar.id);
                                setShowChordPicker(false);
                                setSelectedBarId(null);
                            }}
                            className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center"
                        >
                            <Ionicons name="close" size={12} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
            );
        }

        // Single chord bar (original behavior)
        const chord = bar.chords[0];
        const displayText = chord ? formatChord(chord) : '';
        const emptyDisplay = hasPreviousChord ? '/' : (index + 1).toString();

        return (
            <View key={bar.id} className="w-[23%] aspect-square">
                <TouchableOpacity
                    onPress={() => handleBarTap(section.id, bar.id, 0)}
                    className={`flex-1 rounded-lg items-center justify-center border-2 ${isSelected
                        ? 'border-cyan-400 bg-cyan-500/20'
                        : displayText
                            ? 'border-slate-600 bg-slate-700/50'
                            : 'border-slate-700 border-dashed bg-slate-800/30'
                        }`}
                >
                    <Text className={`text-lg font-bold ${displayText ? 'text-white' : 'text-slate-600'}`}>
                        {displayText || emptyDisplay}
                    </Text>
                </TouchableOpacity>

                {/* Delete button - only show when selected */}
                {isSelected && (
                    <TouchableOpacity
                        onPress={() => {
                            deleteBar(chart.id, section.id, bar.id);
                            setShowChordPicker(false);
                            setSelectedBarId(null);
                        }}
                        className="absolute -top-1 -right-1 bg-red-500 w-5 h-5 rounded-full items-center justify-center"
                    >
                        <Ionicons name="close" size={12} color="white" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Render add bar button
    const renderAddBarButton = (sectionId: string) => (
        <TouchableOpacity
            onPress={() => addBar(chart.id, sectionId)}
            className="w-[23%] aspect-square rounded-lg items-center justify-center border-2 border-dashed border-slate-600"
        >
            <Ionicons name="add" size={24} color="#64748b" />
        </TouchableOpacity>
    );

    // Render a section
    const renderSection = (section: ChordChartSection) => {
        const isEditing = editingSectionName === section.id;

        return (
            <View key={section.id} className="mb-6 bg-slate-800/40 rounded-2xl p-4 border border-slate-700/50">
                {/* Section Header */}
                <View className="flex-row items-center justify-between mb-3">
                    {isEditing ? (
                        <TextInput
                            className="flex-1 text-white font-bold text-lg bg-slate-700 px-3 py-1 rounded"
                            value={section.name}
                            onChangeText={(name) => updateSection(chart.id, section.id, { name })}
                            onBlur={() => setEditingSectionName(null)}
                            onSubmitEditing={() => setEditingSectionName(null)}
                            autoFocus
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setEditingSectionName(section.id)}>
                            <Text className="text-white font-bold text-lg">[{section.name}]</Text>
                        </TouchableOpacity>
                    )}
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => handleAddBars(section.id)}
                            className="px-2 py-1 mr-2 bg-slate-700 rounded"
                        >
                            <Text className="text-slate-300 text-xs font-bold">+4</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => handleDeleteSection(section.id)}
                            className="p-2"
                        >
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Bar Grid - 4 per row with add button */}
                <View className="flex-row flex-wrap gap-2">
                    {section.bars.map((bar, index) => renderBar(section, bar, index))}
                    {renderAddBarButton(section.id)}
                </View>

                {/* Bar count */}
                <Text className="text-slate-500 text-xs mt-2 text-right">
                    {section.bars.length} bars
                </Text>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                {/* Header */}
                <View className="bg-slate-800 px-4 pt-4 pb-3 border-b border-slate-700">
                    {/* Top row: Back, Title, Key button */}
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>

                        {/* Title */}
                        {editingTitle ? (
                            <TextInput
                                className="flex-1 text-white font-bold text-lg bg-slate-700 px-3 py-1 rounded"
                                value={chart.title}
                                onChangeText={handleTitleChange}
                                onBlur={() => setEditingTitle(false)}
                                onSubmitEditing={() => setEditingTitle(false)}
                                autoFocus
                            />
                        ) : (
                            <TouchableOpacity
                                onPress={() => setEditingTitle(true)}
                                className="flex-1"
                            >
                                <Text className="text-white font-bold text-lg" numberOfLines={1}>{chart.title}</Text>
                            </TouchableOpacity>
                        )}

                        {/* Key Button (tap to expand) - shows key + mode */}
                        <TouchableOpacity
                            onPress={() => { setEditingKey(!editingKey); setShowTranspose(false); }}
                            className={`ml-2 px-3 py-1 rounded ${editingKey ? 'bg-cyan-700' : 'bg-cyan-600'}`}
                        >
                            <Text className="text-white font-bold">
                                {chart.key || '?'}{chart.mode === 'minor' ? 'm' : ''}
                            </Text>
                        </TouchableOpacity>

                        {/* Transpose Button */}
                        <TouchableOpacity
                            onPress={() => { setShowTranspose(!showTranspose); setEditingKey(false); }}
                            className={`ml-1 px-2 py-1 rounded ${showTranspose ? 'bg-indigo-600' : 'bg-slate-600'}`}
                        >
                            <Ionicons name="swap-vertical" size={16} color="white" />
                        </TouchableOpacity>
                    </View>

                    {/* Transpose picker row */}
                    {showTranspose && (
                        <View className="mt-3 flex-row items-center">
                            <Text className="text-slate-400 text-sm mr-3">Transpose:</Text>
                            <TouchableOpacity
                                onPress={() => transposeChart(chart.id, -1)}
                                className="bg-indigo-600 w-10 h-10 rounded-lg items-center justify-center mr-2"
                            >
                                <Text className="text-white font-bold text-lg">−1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => transposeChart(chart.id, 1)}
                                className="bg-indigo-600 w-10 h-10 rounded-lg items-center justify-center mr-4"
                            >
                                <Text className="text-white font-bold text-lg">+1</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => transposeChart(chart.id, -7)}
                                className="bg-slate-600 px-3 py-2 rounded-lg mr-2"
                            >
                                <Text className="text-white text-sm">−5th</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => transposeChart(chart.id, 7)}
                                className="bg-slate-600 px-3 py-2 rounded-lg"
                            >
                                <Text className="text-white text-sm">+5th</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    {editingKey && (
                        <View className="mt-3">
                            {/* Major/Minor Toggle */}
                            <View className="flex-row items-center mb-2">
                                <TouchableOpacity
                                    onPress={() => updateChart(chart.id, { mode: 'major' })}
                                    className={`px-4 py-1.5 rounded-l-lg ${chart.mode !== 'minor' ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                >
                                    <Text className={`font-bold ${chart.mode !== 'minor' ? 'text-white' : 'text-slate-400'}`}>Major</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => updateChart(chart.id, { mode: 'minor' })}
                                    className={`px-4 py-1.5 rounded-r-lg ${chart.mode === 'minor' ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                >
                                    <Text className={`font-bold ${chart.mode === 'minor' ? 'text-white' : 'text-slate-400'}`}>Minor</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Key Selection */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-1">
                                    {['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Eb', 'Ab'].map(k => (
                                        <TouchableOpacity
                                            key={k}
                                            onPress={() => handleKeyChange(k)}
                                            className={`px-4 py-2 rounded-lg ${chart.key === k ? 'bg-cyan-600' : 'bg-slate-600'}`}
                                        >
                                            <Text className="text-white font-bold">{k}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>

                {/* Main Content */}
                <ScrollView className="flex-1 px-4 pt-4">
                    {chart.sections.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="grid-outline" size={64} color="#475569" />
                            <Text className="text-slate-400 text-lg mt-4 font-medium">No sections yet</Text>
                            <Text className="text-slate-500 text-center mt-2 px-8">
                                Add a section to start building your chord chart.
                            </Text>
                            <TouchableOpacity
                                onPress={handleAddSection}
                                className="mt-6 bg-cyan-600 px-6 py-3 rounded-full flex-row items-center"
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text className="text-white font-semibold ml-2">Add First Section</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            {chart.sections.map(section => renderSection(section))}

                            {/* Add Section Button */}
                            <TouchableOpacity
                                onPress={handleAddSection}
                                className="bg-slate-700/40 border border-dashed border-slate-600 rounded-xl p-4 items-center mb-8"
                            >
                                <Ionicons name="add" size={24} color="#94a3b8" />
                                <Text className="text-slate-400 mt-1">Add Section</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    <View className="h-40" />
                </ScrollView>

                {/* Chord Picker (Bottom Sheet Style) - Compact for Mobile */}
                {showChordPicker && (
                    <View className="absolute bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 rounded-t-2xl px-3 pt-3 pb-6">
                        {/* Header with Preview + Confirm */}
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center flex-1">
                                <View className="bg-cyan-600/30 border border-cyan-500 px-3 py-1.5 rounded-lg mr-2">
                                    <Text className="text-cyan-300 font-bold">
                                        {pendingRoot ? formatChord({ root: pendingRoot, quality: pendingQuality }) : '...'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    onPress={handleConfirmChord}
                                    disabled={!pendingRoot}
                                    className={`px-4 py-1.5 rounded-lg ${pendingRoot ? 'bg-cyan-600' : 'bg-slate-700'}`}
                                >
                                    <Text className={`font-bold ${pendingRoot ? 'text-white' : 'text-slate-500'}`}>
                                        Confirm
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <View className="flex-row items-center">
                                {/* Subdivide/Merge button */}
                                {(() => {
                                    const section = chart.sections.find(s => s.id === selectedSectionId);
                                    const bar = section?.bars.find(b => b.id === selectedBarId);
                                    const chordCount = bar?.chords.length || 0;
                                    // Determine button action and label
                                    const canSubdivide = chordCount < 4;
                                    const label = chordCount >= 4 ? '×2' : chordCount >= 2 ? '÷4' : '÷2';
                                    return (
                                        <TouchableOpacity
                                            onPress={canSubdivide ? handleSubdivideBar : handleMergeBar}
                                            className="bg-indigo-600 px-2 py-1 rounded mr-2"
                                        >
                                            <Text className="text-white text-xs font-bold">
                                                {label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })()}
                                <TouchableOpacity
                                    onPress={handleClearBar}
                                    className="bg-slate-700 px-2 py-1 rounded mr-2"
                                >
                                    <Text className="text-slate-400 text-xs">Clear</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleCancelPicker} className="p-1">
                                    <Ionicons name="close" size={20} color="#94a3b8" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Beat picker row - only for subdivided bars */}
                        {(() => {
                            const section = chart.sections.find(s => s.id === selectedSectionId);
                            const bar = section?.bars.find(b => b.id === selectedBarId);
                            const chordCount = bar?.chords.length || 0;
                            if (chordCount < 2) return null;

                            const beatSlots = chordCount >= 4 ? [0, 1, 2, 3] : [0, 1];
                            return (
                                <View className="flex-row mb-3 gap-2">
                                    {beatSlots.map((slotIdx) => {
                                        const chord = bar?.chords[slotIdx];
                                        const isActive = selectedSlot === slotIdx;
                                        return (
                                            <TouchableOpacity
                                                key={slotIdx}
                                                onPress={() => {
                                                    setSelectedSlot(slotIdx);
                                                    if (chord) {
                                                        setPendingRoot(chord.root);
                                                        setPendingQuality(chord.quality);
                                                    } else {
                                                        setPendingRoot(null);
                                                        setPendingQuality('maj');
                                                    }
                                                }}
                                                className={`flex-1 py-2 rounded-lg border-2 items-center ${isActive
                                                        ? 'border-cyan-400 bg-cyan-500/20'
                                                        : 'border-slate-600 bg-slate-700/50'
                                                    }`}
                                            >
                                                <Text className="text-slate-400 text-[10px] mb-0.5">Beat {slotIdx + 1}</Text>
                                                <Text className={`font-bold ${chord ? 'text-white' : 'text-slate-500'}`}>
                                                    {chord ? formatChord(chord) : '/'}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            );
                        })()}

                        {/* Root Notes - Smart or Chromatic order */}
                        <View className="mb-2">
                            <View className="flex-row items-center justify-between mb-1">
                                <Text className="text-slate-500 text-xs">ROOT</Text>
                                <TouchableOpacity onPress={() => setUseChromatic(!useChromatic)}>
                                    <Text className="text-indigo-400 text-xs">
                                        {useChromatic ? '♪ Smart' : '⬆⬇ Chromatic'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-1.5">
                                    {(useChromatic
                                        ? ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
                                        : chart.key
                                            ? getOrderedRoots(chart.key)
                                            : ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C#', 'Eb', 'F#', 'Ab', 'Bb']
                                    ).map((root, index) => {
                                        const isSelected = pendingRoot === root;
                                        const isDiatonic = !useChromatic && index < 7; // First 7 are diatonic in smart mode
                                        return (
                                            <TouchableOpacity
                                                key={root}
                                                onPress={() => handleSelectRoot(root)}
                                                className={`w-9 h-9 rounded-full items-center justify-center ${isSelected
                                                    ? 'bg-cyan-600'
                                                    : isDiatonic
                                                        ? 'bg-slate-600'
                                                        : 'bg-slate-700'
                                                    }`}
                                            >
                                                <Text className={`font-bold text-sm ${isSelected ? 'text-white' : isDiatonic ? 'text-white' : 'text-slate-300'}`}>
                                                    {root}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>

                        {/* Chord Qualities - Horizontal Scroll */}
                        <View>
                            <View className="flex-row items-center justify-between mb-1">
                                <Text className="text-slate-500 text-xs">QUALITY</Text>
                                <TouchableOpacity onPress={() => setShowSecondaryQualities(!showSecondaryQualities)}>
                                    <Text className="text-indigo-400 text-xs">
                                        {showSecondaryQualities ? '← Less' : 'More →'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                <View className="flex-row gap-1.5">
                                    {PRIMARY_QUALITIES.map(quality => {
                                        const isSelected = pendingQuality === quality;
                                        return (
                                            <TouchableOpacity
                                                key={quality}
                                                onPress={() => handleSelectQuality(quality)}
                                                className={`px-3 py-1.5 rounded-lg ${isSelected ? 'bg-cyan-600' : 'bg-slate-700'
                                                    }`}
                                            >
                                                <Text className="text-white text-sm">{quality}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                    {showSecondaryQualities && SECONDARY_QUALITIES.map(quality => {
                                        const isSelected = pendingQuality === quality;
                                        return (
                                            <TouchableOpacity
                                                key={quality}
                                                onPress={() => handleSelectQuality(quality)}
                                                className={`px-3 py-1.5 rounded-lg ${isSelected ? 'bg-cyan-600' : 'bg-slate-600'
                                                    }`}
                                            >
                                                <Text className="text-slate-200 text-sm">{quality}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                )}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
