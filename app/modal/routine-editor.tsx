import { PAPER_THEME } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Category, ContentBlock, Routine, Schedule } from '@/store/types';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';



const WebDatePicker = ({ date, onChange }: { date?: string, onChange: (d: string) => void }) => {
    return (
        <View className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm w-full h-[50px] justify-center relative">
            <input
                type="date"
                value={date}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => {
                    try {
                        if (typeof e.currentTarget.showPicker === 'function') {
                            e.currentTarget.showPicker();
                        } else {
                            e.currentTarget.focus();
                        }
                    } catch (err) {
                        e.currentTarget.focus();
                    }
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: 12,
                    fontSize: 16,
                    border: 'none',
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    color: '#0f172a',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                }}
            />
        </View>
    );
};

export default function RoutineEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;

    const { blocks, routines, addRoutine, updateRoutine, categories, settings } = useContentStore();
    const existingRoutine = id ? routines.find((r) => r.id === id) : undefined;
    const isEditing = !!existingRoutine;

    const [title, setTitle] = useState(existingRoutine?.title || '');
    const [description, setDescription] = useState(existingRoutine?.description || '');
    const [isPublic, setIsPublic] = useState(existingRoutine?.isPublic || false);
    const [expiresAt, setExpiresAt] = useState<string | undefined>(existingRoutine?.expiresAt);
    const [selectedBlocks, setSelectedBlocks] = useState<ContentBlock[]>(
        existingRoutine?.blocks || []
    );
    const [schedule, setSchedule] = useState<Schedule>(
        existingRoutine?.schedule || { type: 'none' }
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setSchedule({ ...schedule, startDate: selectedDate.toISOString().split('T')[0] });
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setSchedule({ ...schedule, endDate: selectedDate.toISOString().split('T')[0] });
        }
    };

    // Group available blocks by category
    const groupedAvailableBlocks = useMemo(() => {
        const filtered = blocks
            .filter((b) => !selectedBlocks.some((selected) => selected.id === b.id))
            .filter((b) =>
                b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (b.tags && b.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
            );

        const groups: { category: Category | { id: string, name: string }, blocks: ContentBlock[] }[] = [];

        categories.forEach(cat => {
            const catBlocks = filtered.filter(b => b.categoryId === cat.id);
            if (catBlocks.length > 0) {
                groups.push({ category: cat, blocks: catBlocks });
            }
        });

        const uncategorized = filtered.filter(b => !b.categoryId || !categories.find(c => c.id === b.categoryId));
        if (uncategorized.length > 0) {
            groups.push({ category: { id: 'none', name: 'Uncategorized' }, blocks: uncategorized });
        }

        return groups;
    }, [blocks, selectedBlocks, searchQuery, categories]);

    const addBlockToRoutine = (block: ContentBlock) => {
        setSelectedBlocks([...selectedBlocks, block]);
    };

    const removeBlockFromRoutine = (blockId: string) => {
        setSelectedBlocks(selectedBlocks.filter((b) => b.id !== blockId));
    };

    const togglePublic = (val: boolean) => {
        if (!val) {
            setIsPublic(false);
            return;
        }

        // GATEKEEPER (Immediate Check in Editor)
        const privateBlocks = selectedBlocks.filter(b => !!b.mediaUri);
        if (privateBlocks.length > 0) {
            const msg = `This routine contains ${privateBlocks.length} items with attached files (e.g. "${privateBlocks[0].title}"). These files may not be visible to students if they are private. Proceed?`;

            if (Platform.OS === 'web') {
                if (window.confirm(msg)) {
                    setIsPublic(true);
                    if (!expiresAt) {
                        const d = new Date();
                        d.setDate(d.getDate() + 7);
                        setExpiresAt(d.toISOString());
                    }
                } else {
                    setIsPublic(false);
                }
            } else {
                Alert.alert(
                    'Private Files Detected',
                    msg,
                    [
                        { text: 'Cancel', style: 'cancel', onPress: () => setIsPublic(false) },
                        {
                            text: 'Make Public',
                            style: 'destructive',
                            onPress: () => {
                                setIsPublic(true);
                                if (!expiresAt) {
                                    const d = new Date();
                                    d.setDate(d.getDate() + 7);
                                    setExpiresAt(d.toISOString());
                                }
                            }
                        }
                    ]
                );
            }
        } else {
            setIsPublic(true);
            if (!expiresAt) {
                const d = new Date();
                d.setDate(d.getDate() + 7);
                setExpiresAt(d.toISOString());
            }
        }
    };

    const handleSave = () => {
        if (!title.trim()) {
            if (Platform.OS === 'web') {
                alert('Please enter a routine title');
            } else {
                Alert.alert('Error', 'Please enter a routine title');
            }
            return;
        }

        const routineData: Routine = {
            id: id || Date.now().toString(),
            title,
            description: description.trim() || undefined,
            blocks: selectedBlocks,
            schedule: schedule.type !== 'none' ? schedule : undefined,
            isPublic,
            expiresAt: isPublic ? expiresAt : undefined, // clear expiry if made private
            createdAt: existingRoutine?.createdAt || new Date().toISOString(),
        };

        if (isEditing && id) {
            updateRoutine(id, routineData);
        } else {
            addRoutine(routineData);
        }
        router.back();
    };



    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setSchedule({ ...schedule, date: selectedDate.toISOString().split('T')[0] });
        }
    };

    const renderSelectedBlockItem = ({ item, drag, isActive }: RenderItemParams<ContentBlock>) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                className={`mb-2 p-3 rounded-xl border flex-row items-start justify-between ${isActive ? 'bg-amber-50 border-amber-400 shadow-md transform scale-105' : 'bg-white border-stone-200 shadow-sm'}`}
            >
                <View className="flex-row items-start flex-1">
                    <Text className="text-stone-300 mr-3 text-lg font-bold mt-1">☰</Text>
                    {item.mediaUri && !item.mediaUri.endsWith('.pdf') && (
                        <Image source={{ uri: item.mediaUri }} className="w-10 h-10 rounded mr-3 bg-stone-100" />
                    )}
                    <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                            <Text className="font-bold text-stone-900 text-base flex-1" numberOfLines={1}>{item.title}</Text>
                            <Text className="text-[10px] text-stone-400 font-bold uppercase tracking-wide ml-2">{item.type.replace('_', ' ')}</Text>
                        </View>

                        {/* Metadata Row: Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <View className="flex-row flex-wrap gap-1 mt-1">
                                {item.tags.map((tag, idx) => (
                                    <View key={idx} className="bg-stone-100 px-1.5 py-0.5 rounded-md border border-stone-200">
                                        <Text className="text-[10px] text-stone-600 font-bold" numberOfLines={1}>
                                            {tag}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Metadata Row: Content Preview (Notes) */}
                        {item.content && (
                            <Text className="text-xs text-stone-500 mt-1 italic leading-tight" numberOfLines={2}>
                                {item.content}
                            </Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity onPress={() => removeBlockFromRoutine(item.id)} className="p-2 ml-2 bg-red-50 rounded-lg self-center">
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                </TouchableOpacity>
            </TouchableOpacity>
        </ScaleDecorator>
    );

    const renderAvailableBlockItem = ({ item }: { item: ContentBlock }) => (
        <TouchableOpacity
            onPress={() => addBlockToRoutine(item)}
            className="p-3 mb-2 rounded-xl border bg-white border-stone-200 flex-row justify-between items-center shadow-sm active:bg-stone-100"
        >
            <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${item.type === 'sheet_music' ? 'bg-orange-100' : 'bg-stone-200'}`}>
                    <Ionicons
                        name={item.type === 'sheet_music' ? 'musical-notes' : 'document-text'}
                        size={20}
                        color={item.type === 'sheet_music' ? '#c2410c' : '#57534e'}
                    />
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-stone-900" numberOfLines={1}>{item.title}</Text>
                    {item.tags && <Text className="text-[10px] text-amber-700 font-bold uppercase tracking-wide mt-0.5" numberOfLines={1}>{item.tags}</Text>}
                </View>
            </View>
            <View className="bg-stone-800 w-8 h-8 rounded-full items-center justify-center shadow-sm">
                <Ionicons name="add" size={20} color="white" />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1" style={{ backgroundColor: PAPER_THEME.background }}>
            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <View className="p-6">
                    <Text className="text-3xl font-black mb-8 mt-6 tracking-tight" style={{ color: PAPER_THEME.text }}>
                        {isEditing ? 'Edit Routine' : 'New Routine'}
                    </Text>

                    {/* Basic Info */}
                    <View className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8">
                        <View className="mb-6">
                            <Text className="text-[10px] uppercase font-black text-stone-700 mb-2 tracking-widest">Title</Text>
                            <TextInput
                                className="text-2xl font-black text-stone-900 border-b border-stone-100 pb-2"
                                placeholder="Morning Warmup..."
                                placeholderTextColor="#57534e"
                                style={{ fontStyle: title ? 'normal' : 'italic' }}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View>
                            <Text className="text-[10px] uppercase font-black text-stone-700 mb-2 tracking-widest">Description</Text>
                            <TextInput
                                className="text-sm text-stone-700 bg-stone-50 p-3 rounded-xl border border-stone-100 min-h-[80px]"
                                placeholder="What is this routine for?"
                                placeholderTextColor="#57534e"
                                style={{ fontStyle: description ? 'normal' : 'italic' }}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                textAlignVertical="top"
                            />
                        </View>
                    </View>

                    {/* Share / Teacher Tools */}
                    <Text className="text-lg font-black text-stone-900 mb-4 px-1">Share Lesson</Text>
                    <View className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8">
                        <View className="flex-row justify-between items-center mb-2">
                            <View className="flex-1 mr-4">
                                <Text className="font-bold text-stone-900 text-base">Make Public (Shareable)</Text>
                                <Text className="text-xs text-stone-500 mt-1">
                                    Allow students to import this lesson via a link.
                                </Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => togglePublic(!isPublic)}
                                className={`w-12 h-7 rounded-full justify-center ${isPublic ? 'bg-indigo-600' : 'bg-stone-300'}`}
                            >
                                <View className={`w-5 h-5 bg-white rounded-full shadow-sm mx-1 ${isPublic ? 'self-end' : 'self-start'}`} />
                            </TouchableOpacity>
                        </View>

                        {isPublic && (
                            <View className="mt-4 pt-4 border-t border-stone-100">
                                {existingRoutine && existingRoutine.isPublic ? (
                                    <>
                                        <View className="bg-stone-50 p-3 rounded-xl border border-stone-200 mb-3">
                                            <Text className="text-xs text-stone-500 font-mono" numberOfLines={1}>
                                                {`opusmode.net/routine/${existingRoutine.id}`}
                                            </Text>
                                        </View>

                                        <View className="flex-row items-center justify-between mb-3 px-1">
                                            <Text className="text-[10px] uppercase font-bold text-stone-400 tracking-wide">
                                                {existingRoutine.expiresAt
                                                    ? `Strings snap on ${new Date(existingRoutine.expiresAt).toLocaleDateString()}`
                                                    : 'Link never expires'}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const nextWeek = new Date();
                                                    nextWeek.setDate(nextWeek.getDate() + 7);
                                                    // We can't update directly here without saving, so we force a save flow or just update state?
                                                    // Editor pattern: Update state, user must click Save.
                                                    // But existingRoutine is from props. 
                                                    // Optimization: If we update state, the UI below should reflect state, not existingRoutine props.
                                                    // My bad, let's use the UI to reflect *state* (expiresAt) but the Link requires *saved* state.
                                                    // Actually, let's keep it simple: "Extend 7 Days" -> Updates local state. User hits Save. Link remains valid.
                                                    // BUT the UI above checks `existingRoutine.isPublic` to show link.

                                                    // Wait, if I change expiration, the link is still valid (ID doesn't change).
                                                    // So I should just update the `expiresAt` state variable.
                                                    // But I need to initialize `expiresAt` state variable first! (See top of file)

                                                    // Since I haven't added the state var yet, let's do that in a separate edit or assumption?
                                                    // No, I need to add the state variable `expiresAt` at the top of component first.
                                                    // For now, I will add the logic assuming the state exists, and then add the state.

                                                    const newDate = new Date();
                                                    newDate.setDate(newDate.getDate() + 7);
                                                    setExpiresAt(newDate.toISOString());
                                                    Alert.alert("Extended", "Don't forget to click Save!");
                                                }}
                                            >
                                                <Text className="text-indigo-600 font-bold text-[10px] uppercase">
                                                    Extend 7 Days
                                                </Text>
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity
                                            onPress={async () => {
                                                await Clipboard.setStringAsync(`https://opusmode.net/routine/${existingRoutine.id}`);
                                                Alert.alert("Copied", "Link copied to clipboard");
                                            }}
                                            className="flex-row items-center justify-center bg-indigo-50 py-3 rounded-xl border border-indigo-100"
                                        >
                                            <Ionicons name="link" size={18} color="#4f46e5" style={{ marginRight: 8 }} />
                                            <Text className="text-indigo-600 font-bold uppercase text-xs tracking-wide">Copy Link</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <View className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex-row items-center">
                                        <Ionicons name="alert-circle" size={20} color="#d97706" style={{ marginRight: 8 }} />
                                        <Text className="text-amber-800 text-xs font-bold flex-1 ml-2">
                                            Save this routine. After the window closes, click "Edit" to access the sharing link.
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Schedule */}
                    <Text className="text-lg font-black text-stone-900 mb-4 px-1">Schedule</Text>
                    <View className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm mb-8">
                        <View className="flex-row gap-2 mb-6">
                            {(['none', 'recurring', 'date'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSchedule({ ...schedule, type: t })}
                                    className={`px-4 py-2 rounded-full border ${schedule.type === t ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                                >
                                    <Text className={`capitalize text-xs font-bold ${schedule.type === t ? 'text-white' : 'text-stone-500'}`}>
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {schedule.type === 'recurring' && (
                            <View>
                                <View className="flex-row justify-between mb-6">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => {
                                        const isSelected = schedule.daysOfWeek?.includes(i);
                                        return (
                                            <TouchableOpacity
                                                key={i}
                                                onPress={() => {
                                                    const currentDays = schedule.daysOfWeek || [];
                                                    const nextDays = isSelected
                                                        ? currentDays.filter(d => d !== i)
                                                        : [...currentDays, i];
                                                    setSchedule({ ...schedule, daysOfWeek: nextDays });
                                                }}
                                                className={`w-9 h-9 rounded-full items-center justify-center border ${isSelected ? 'bg-stone-900 border-stone-900' : 'bg-stone-50 border-stone-200'}`}
                                            >
                                                <Text className={`${isSelected ? 'text-white' : 'text-stone-400'} font-bold`}>{day}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-[10px] uppercase font-black text-stone-700 mb-1 tracking-widest">Start Date</Text>
                                        {Platform.OS === 'web' ? (
                                            <WebDatePicker date={schedule.startDate} onChange={(d) => setSchedule({ ...schedule, startDate: d })} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => setShowStartDatePicker(true)}
                                                    className="bg-white p-3 rounded-xl border border-stone-200 flex-row justify-between items-center"
                                                >
                                                    <Text className="text-xs font-bold text-stone-900">
                                                        {schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'Set Start'}
                                                    </Text>
                                                    <Text className="text-xs">📅</Text>
                                                </TouchableOpacity>
                                                {showStartDatePicker && (
                                                    <DateTimePicker
                                                        value={schedule.startDate ? new Date(schedule.startDate) : new Date()}
                                                        mode="date"
                                                        display="default"
                                                        onChange={onStartDateChange}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] uppercase font-black text-stone-700 mb-1 tracking-widest">End Date</Text>
                                        {Platform.OS === 'web' ? (
                                            <WebDatePicker date={schedule.endDate} onChange={(d) => setSchedule({ ...schedule, endDate: d })} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => setShowEndDatePicker(true)}
                                                    className="bg-white p-3 rounded-xl border border-stone-200 flex-row justify-between items-center"
                                                >
                                                    <Text className="text-xs font-bold text-stone-900">
                                                        {schedule.endDate ? new Date(schedule.endDate).toLocaleDateString() : 'Set End'}
                                                    </Text>
                                                    <Text className="text-xs">📅</Text>
                                                </TouchableOpacity>
                                                {showEndDatePicker && (
                                                    <DateTimePicker
                                                        value={schedule.endDate ? new Date(schedule.endDate) : new Date()}
                                                        mode="date"
                                                        display="default"
                                                        onChange={onEndDateChange}
                                                    />
                                                )}
                                            </>
                                        )}
                                    </View>
                                </View>
                            </View>
                        )}

                        {schedule.type === 'date' && (
                            Platform.OS === 'web' ? (
                                <WebDatePicker date={schedule.date} onChange={(d) => setSchedule({ ...schedule, date: d })} />
                            ) : (
                                <TouchableOpacity
                                    onPress={() => setShowDatePicker(true)}
                                    className="bg-white p-3 rounded-xl border border-stone-200 flex-row justify-between items-center"
                                >
                                    <Text className="font-bold text-stone-900">
                                        {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'Select Date'}
                                    </Text>
                                    <Text>📅</Text>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={schedule.date ? new Date(schedule.date) : new Date()}
                                            mode="date"
                                            display="default"
                                            onChange={onDateChange}
                                        />
                                    )}
                                </TouchableOpacity>
                            )
                        )}
                    </View>

                    {/* Sequence */}
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-lg font-black text-stone-900">Sequence</Text>
                        <Text className="text-xs text-stone-400 font-semibold italic">Long press to drag</Text>
                    </View>
                    <View className="min-h-[100px] mb-8">
                        <DraggableFlatList
                            data={selectedBlocks}
                            onDragEnd={({ data }) => setSelectedBlocks(data)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSelectedBlockItem}
                            scrollEnabled={false} // Let the main scrollview handle it for now or adjust height
                            ListEmptyComponent={
                                <View className="border-2 border-dashed border-stone-200 rounded-2xl p-8 items-center bg-stone-50">
                                    <Text className="text-stone-400 font-bold">Add blocks from the library below</Text>
                                </View>
                            }
                        />
                    </View>

                    {/* Library */}
                    <Text className="text-lg font-black text-stone-900 mb-4 px-1">Add from Library</Text>
                    <View className="flex-row items-center bg-white border border-stone-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 text-stone-900 font-semibold ml-3"
                            placeholder="Search by title or tags..."
                            placeholderTextColor="#57534e"
                            style={{ fontStyle: searchQuery ? 'normal' : 'italic' }}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="mb-32">
                        {groupedAvailableBlocks.length > 0 ? (
                            groupedAvailableBlocks.map(group => (
                                <View key={group.category.id} className="mb-6">
                                    <View className="px-1 mb-2">
                                        <Text className="text-[10px] uppercase font-black text-stone-400 tracking-widest">
                                            {group.category.name}
                                        </Text>
                                    </View>
                                    {group.blocks.map(block => (
                                        <View key={block.id}>
                                            {renderAvailableBlockItem({ item: block })}
                                        </View>
                                    ))}
                                </View>
                            ))
                        ) : (
                            <View className="p-8 items-center justify-center">
                                <Text className="text-center text-stone-400 font-bold">No matching blocks found.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Fixed Action Buttons at the bottom */}
            <View className="flex-row gap-4 p-6 border-t border-stone-200" style={{ backgroundColor: PAPER_THEME.background, paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-1 p-4 rounded-2xl border border-stone-300 items-center justify-center"
                    style={{ backgroundColor: PAPER_THEME.cancelBtnBg }}
                >
                    <Text className="text-center font-bold uppercase tracking-wide" style={{ color: PAPER_THEME.cancelBtnText }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 p-4 rounded-2xl shadow-sm items-center justify-center shadow-orange-900/20"
                    style={{ backgroundColor: PAPER_THEME.saveBtnBg }}
                >
                    <Text className="font-black text-lg uppercase tracking-wider" style={{ color: PAPER_THEME.saveBtnText }}>Save</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
