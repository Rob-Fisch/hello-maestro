import { useContentStore } from '@/store/contentStore';
import { Category, ContentBlock, Routine, Schedule } from '@/store/types';

import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, Modal, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

// --- WEB PICKER COMPONENTS ---
const WebSelect = ({ value, options, onChange, placeholder = 'Select', labelClassName = '' }: any) => {
    const [visible, setVisible] = useState(false);
    const selected = options.find((o: any) => o.value == value);
    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} className={`flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-2 py-3 ${labelClassName}`}>
                <Text className="font-bold text-foreground flex-1" numberOfLines={1}>{selected ? selected.label : placeholder}</Text>
                <Ionicons name="chevron-down" size={12} color="#94a3b8" />
            </TouchableOpacity>
            <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
                <TouchableOpacity activeOpacity={1} onPress={() => setVisible(false)} className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white w-[80%] max-w-[300px] max-h-[70%] rounded-2xl overflow-hidden shadow-xl">
                        <ScrollView contentContainerStyle={{ padding: 8 }}>
                            {options.map((opt: any) => (
                                <TouchableOpacity
                                    key={opt.value}
                                    onPress={() => { onChange(opt.value); setVisible(false); }}
                                    className={`p-3 rounded-xl mb-1 ${opt.value == value ? 'bg-blue-50' : 'bg-transparent'}`}
                                >
                                    <Text className={`text-center font-bold ${opt.value == value ? 'text-blue-600' : 'text-gray-700'}`}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const WebDatePicker = ({ date, onChange }: { date?: string, onChange: (d: string) => void }) => {
    const [yStr, mStr, dStr] = (date || '2025-01-01').split('-');
    const y = parseInt(yStr) || new Date().getFullYear();
    const m = parseInt(mStr) || 1;
    const d = parseInt(dStr) || 1;

    const months = [
        { label: 'Jan', value: 1 }, { label: 'Feb', value: 2 }, { label: 'Mar', value: 3 },
        { label: 'Apr', value: 4 }, { label: 'May', value: 5 }, { label: 'Jun', value: 6 },
        { label: 'Jul', value: 7 }, { label: 'Aug', value: 8 }, { label: 'Sep', value: 9 },
        { label: 'Oct', value: 10 }, { label: 'Nov', value: 11 }, { label: 'Dec', value: 12 },
    ];
    const days = Array.from({ length: 31 }, (_, i) => ({ label: (i + 1).toString(), value: i + 1 }));

    const update = (key: 'y' | 'm' | 'd', val: any) => {
        let ny = y, nm = m, nd = d;
        if (key === 'y') ny = parseInt(val) || 0;
        if (key === 'm') nm = val;
        if (key === 'd') nd = val;
        onChange(`${ny.toString().padStart(4, '0')}-${nm.toString().padStart(2, '0')}-${nd.toString().padStart(2, '0')}`);
    };

    return (
        <View className="flex-row gap-1 w-full max-w-[380px]">
            <View className="flex-[1.3]">
                <WebSelect options={months} value={m} onChange={(v: any) => update('m', v)} />
            </View>
            <View className="flex-[0.9]">
                <WebSelect options={days} value={d} onChange={(v: any) => update('d', v)} />
            </View>
            <View className="flex-[1.2]">
                <TextInput
                    className="bg-gray-50 border border-gray-100 rounded-xl px-2 py-3 font-bold text-center text-foreground"
                    value={y.toString()}
                    keyboardType="number-pad"
                    onChangeText={(t) => update('y', t)}
                    maxLength={4}
                    placeholder="YYYY"
                />
            </View>
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
        const hasPrivateFiles = selectedBlocks.some(b => !!b.mediaUri);
        if (hasPrivateFiles) {
            if (Platform.OS === 'web') {
                alert('Cannot make Public. You have private file-based items selected. Remove them first.');
            } else {
                Alert.alert('Cannot Make Public', 'Remove private files before making this collection public.');
            }
            setIsPublic(false);
        } else {
            setIsPublic(true);
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

        // GATEKEEPER CHECK (Final Save Guard)
        const hasPrivateFiles = selectedBlocks.some(b => !!b.mediaUri);

        if (isPublic && hasPrivateFiles) {
            if (Platform.OS === 'web') {
                alert('This collection is marked Public but contains private files. Please set to Private or remove files.');
            } else {
                Alert.alert('Cannot Save', 'Private files detected in Public collection.');
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
                className={`mb-2 p-3 rounded-lg border flex-row items-center justify-between ${isActive ? 'bg-blue-100 border-blue-400' : 'bg-blue-50 border-blue-200'}`}
            >
                <View className="flex-row items-center flex-1">
                    <Text className="text-gray-400 mr-3 text-lg">☰</Text>
                    {item.mediaUri && !item.mediaUri.endsWith('.pdf') && (
                        <Image source={{ uri: item.mediaUri }} className="w-10 h-10 rounded mr-3 bg-gray-200" />
                    )}
                    <View className="flex-1">
                        <Text className="font-semibold text-foreground text-base" numberOfLines={1}>{item.title}</Text>
                        <Text className="text-xs text-muted-foreground capitalize">{item.type.replace('_', ' ')}</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => removeBlockFromRoutine(item.id)} className="p-2 ml-2">
                    <Text className="text-red-500 font-bold text-lg">✕</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </ScaleDecorator>
    );

    const renderAvailableBlockItem = ({ item }: { item: ContentBlock }) => (
        <TouchableOpacity
            onPress={() => addBlockToRoutine(item)}
            className="p-3 mb-2 rounded-xl border bg-card border-border flex-row justify-between items-center shadow-sm"
        >
            <View className="flex-row items-center flex-1">
                <View className={`w-10 h-10 rounded-lg items-center justify-center mr-3 ${item.type === 'sheet_music' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                    <Text className="text-lg">{item.type === 'sheet_music' ? '🎼' : '📝'}</Text>
                </View>
                <View className="flex-1">
                    <Text className="font-semibold text-foreground" numberOfLines={1}>{item.title}</Text>
                    {item.tags && <Text className="text-[10px] text-blue-500 font-medium" numberOfLines={1}>{item.tags}</Text>}
                </View>
            </View>
            <View className="bg-green-50 w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-green-600 font-bold text-lg">+</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-4 pt-4 pb-2 border-b border-border flex-row justify-between items-center bg-background">
                <View>
                    <Text className="text-2xl font-bold">{isEditing ? 'Edit Routine' : 'New Routine'}</Text>
                    <Text className="text-xs text-muted-foreground">{selectedBlocks.length} items in sequence</Text>
                </View>
                <View className="flex-row gap-1 w-full max-w-[380px]">

                    <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 px-4 py-2 rounded-full">
                        <Text className="text-gray-600 font-semibold text-xs">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <View className="p-4">
                    {/* Basic Info */}
                    <View className="bg-card p-4 rounded-2xl border border-border shadow-sm mb-6">
                        <View className="mb-4">
                            <Text className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Title</Text>
                            <TextInput
                                className="text-xl font-semibold text-foreground"
                                placeholder="Morning Warmup..."
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>
                        <View>
                            <Text className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Description</Text>
                            <TextInput
                                className="text-sm text-foreground"
                                placeholder="What is this routine for?"
                                value={description}
                                onChangeText={setDescription}
                                multiline
                            />
                        </View>

                        {/* Visibility Toggle */}
                        <View className="flex-row items-center justify-between pt-2 border-t border-border mt-2">
                            <View>
                                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Visibility</Text>
                                <View className="flex-row items-center">
                                    <Ionicons name={isPublic ? "earth" : "lock-closed"} size={12} color={isPublic ? "#2563eb" : "#64748b"} />
                                    <Text className={`text-xs font-bold ml-1.5 ${isPublic ? 'text-blue-600' : 'text-gray-600'}`}>
                                        {isPublic ? 'Public' : 'Private'}
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={isPublic}
                                onValueChange={togglePublic}
                                trackColor={{ false: '#e2e8f0', true: '#bae6fd' }}
                                thumbColor={isPublic ? '#0ea5e9' : '#94a3b8'}
                                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                            />
                        </View>
                    </View>

                    {/* Schedule */}
                    <Text className="text-lg font-bold mb-3 px-1">Schedule</Text>
                    <View className="bg-card p-4 rounded-2xl border border-border shadow-sm mb-6">
                        <View className="flex-row gap-2 mb-4">
                            {(['none', 'recurring', 'date'] as const).map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setSchedule({ ...schedule, type: t })}
                                    className={`px-4 py-2 rounded-full border ${schedule.type === t ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <Text className={`capitalize text-xs font-bold ${schedule.type === t ? 'text-white' : 'text-gray-500'}`}>
                                        {t}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {schedule.type === 'recurring' && (
                            <View>
                                <View className="flex-row justify-between mb-5">
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
                                                className={`w-9 h-9 rounded-full items-center justify-center border ${isSelected ? 'bg-blue-600 border-blue-600' : 'bg-gray-50 border-gray-200'}`}
                                            >
                                                <Text className={`${isSelected ? 'text-white' : 'text-gray-500'} font-bold`}>{day}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">Start Date</Text>
                                        {Platform.OS === 'web' ? (
                                            <WebDatePicker date={schedule.startDate} onChange={(d) => setSchedule({ ...schedule, startDate: d })} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => setShowStartDatePicker(true)}
                                                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex-row justify-between items-center"
                                                >
                                                    <Text className="text-xs font-semibold text-foreground">
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
                                        <Text className="text-[10px] uppercase font-bold text-muted-foreground mb-1 tracking-wider">End Date</Text>
                                        {Platform.OS === 'web' ? (
                                            <WebDatePicker date={schedule.endDate} onChange={(d) => setSchedule({ ...schedule, endDate: d })} />
                                        ) : (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => setShowEndDatePicker(true)}
                                                    className="bg-gray-50 p-2.5 rounded-xl border border-gray-100 flex-row justify-between items-center"
                                                >
                                                    <Text className="text-xs font-semibold text-foreground">
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
                                    className="bg-gray-50 p-3 rounded-xl border border-gray-200 flex-row justify-between items-center"
                                >
                                    <Text className="font-semibold text-foreground">
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
                    <View className="flex-row justify-between items-center mb-3 px-1">
                        <Text className="text-lg font-bold">Sequence</Text>
                        <Text className="text-xs text-muted-foreground italic">Long press to drag</Text>
                    </View>
                    <View className="min-h-[100px] mb-6">
                        <DraggableFlatList
                            data={selectedBlocks}
                            onDragEnd={({ data }) => setSelectedBlocks(data)}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSelectedBlockItem}
                            scrollEnabled={false} // Let the main scrollview handle it for now or adjust height
                            ListEmptyComponent={
                                <View className="border-2 border-dashed border-gray-200 rounded-2xl p-8 items-center">
                                    <Text className="text-gray-400 font-medium">Add blocks from the library below</Text>
                                </View>
                            }
                        />
                    </View>

                    {/* Library */}
                    <Text className="text-lg font-bold mb-3 px-1">Add from Library</Text>
                    <View className="flex-row items-center bg-card border border-border rounded-xl px-3 py-2 mb-4 shadow-sm">
                        <Text className="mr-2">🔍</Text>
                        <TextInput
                            className="flex-1 text-foreground py-1"
                            placeholder="Search by title or tags..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Text className="text-gray-400 font-bold ml-2">✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="mb-24">
                        {groupedAvailableBlocks.length > 0 ? (
                            groupedAvailableBlocks.map(group => (
                                <View key={group.category.id} className="mb-4">
                                    <View className="px-1 mb-2">
                                        <Text className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">
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
                                <Text className="text-center text-muted-foreground font-medium">No matching blocks found.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-6 left-6 right-6">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-600 p-4 rounded-2xl shadow-lg flex-row justify-center items-center"
                >
                    <Text className="text-white font-bold text-lg">Save Routine</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
