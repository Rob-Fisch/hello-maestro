import { useState, useMemo } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, Image, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { AppEvent, AppEventType, Routine } from '@/store/types';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function EventEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;

    const { routines = [], events = [], addEvent, updateEvent } = useContentStore();
    const existingEvent = id ? events.find((e) => e.id === id) : undefined;
    const isEditing = !!existingEvent;

    const [type, setType] = useState<AppEventType>(existingEvent?.type || 'performance');
    const [title, setTitle] = useState(existingEvent?.title || '');
    const [venue, setVenue] = useState(existingEvent?.venue || '');
    const [date, setDate] = useState(existingEvent?.date || new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(existingEvent?.time || '20:00');
    const [notes, setNotes] = useState(existingEvent?.notes || '');
    const [fee, setFee] = useState(existingEvent?.fee || '');
    const [studentName, setStudentName] = useState(existingEvent?.studentName || '');

    // selectedRoutineIds stores the IDs of routines (sets) for this event
    const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(
        existingEvent?.routines || []
    );

    const [searchQuery, setSearchQuery] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Recurrence states
    const [isRecurring, setIsRecurring] = useState(existingEvent?.schedule?.type === 'recurring');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(existingEvent?.schedule?.daysOfWeek || []);
    const [startDate, setStartDate] = useState(existingEvent?.schedule?.startDate || date);
    const [endDate, setEndDate] = useState(existingEvent?.schedule?.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const toggleDay = (day: number) => {
        if (daysOfWeek.includes(day)) {
            setDaysOfWeek(daysOfWeek.filter(d => d !== day));
        } else {
            setDaysOfWeek([...daysOfWeek, day].sort());
        }
    };

    // Get the actual routine objects for the selected IDs
    const selectedRoutines = useMemo(() => {
        return selectedRoutineIds
            .map(rid => routines.find(r => r.id === rid))
            .filter((r): r is Routine => !!r);
    }, [selectedRoutineIds, routines]);

    // Filter available routines (not already selected) and apply search
    const availableRoutines = useMemo(() => {
        return routines
            .filter((r) => !selectedRoutineIds.includes(r.id))
            .filter((r) =>
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
    }, [routines, selectedRoutineIds, searchQuery]);

    const addRoutineToEvent = (routineId: string) => {
        setSelectedRoutineIds([...selectedRoutineIds, routineId]);
    };

    const removeRoutineFromEvent = (routineId: string) => {
        setSelectedRoutineIds(selectedRoutineIds.filter((id) => id !== routineId));
    };

    const handleSave = () => {
        if (!title.trim() || !venue.trim()) {
            const msg = 'Please enter a title and venue/location';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Error', msg);
            return;
        }

        const eventData: AppEvent = {
            id: id || Date.now().toString(),
            type,
            title,
            venue,
            date: isRecurring ? startDate : date,
            time,
            routines: selectedRoutineIds,
            notes: notes.trim() || undefined,
            fee: fee.trim() || undefined,
            studentName: type === 'lesson' ? studentName.trim() || undefined : undefined,
            schedule: isRecurring ? {
                type: 'recurring',
                daysOfWeek,
                startDate,
                endDate
            } : {
                type: 'date',
                date
            },
            createdAt: existingEvent?.createdAt || new Date().toISOString(),
        };

        if (isEditing && id) {
            updateEvent(id, eventData);
        } else {
            addEvent(eventData);
        }
        router.back();
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') {
            setShowTimePicker(false);
        }
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        }
    };

    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) {
            setStartDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) {
            setEndDate(selectedDate.toISOString().split('T')[0]);
        }
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const formatDisplayTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const getTimeDate = () => {
        const [hours, minutes] = time.split(':').map(Number);
        const d = new Date();
        d.setHours(hours);
        d.setMinutes(minutes);
        return d;
    };

    const renderSelectedRoutineItem = ({ item, drag, isActive }: RenderItemParams<Routine>) => (
        <ScaleDecorator>
            <TouchableOpacity
                onLongPress={drag}
                disabled={isActive}
                className={`mb-2 p-4 rounded-2xl border flex-row items-center justify-between ${isActive ? 'bg-amber-100 border-amber-400' : 'bg-amber-50 border-amber-200 shadow-sm'}`}
            >
                <View className="flex-row items-center flex-1">
                    <Text className="text-amber-400 mr-3 text-lg">☰</Text>
                    <View className="flex-1">
                        <Text className="font-bold text-foreground text-base" numberOfLines={1}>{item.title}</Text>
                        <Text className="text-xs text-amber-600 font-medium">{item.blocks.length} Blocks</Text>
                    </View>
                </View>
                <TouchableOpacity onPress={() => removeRoutineFromEvent(item.id)} className="p-2 ml-2">
                    <Text className="text-red-500 font-bold text-lg">✕</Text>
                </TouchableOpacity>
            </TouchableOpacity>
        </ScaleDecorator>
    );

    const renderAvailableRoutineItem = ({ item }: { item: Routine }) => (
        <TouchableOpacity
            onPress={() => addRoutineToEvent(item.id)}
            className="p-4 mb-3 rounded-2xl border bg-card border-border flex-row justify-between items-center shadow-sm"
        >
            <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center mr-3">
                    <Text className="text-lg">🎼</Text>
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-foreground text-base" numberOfLines={1}>{item.title}</Text>
                    <Text className="text-xs text-muted-foreground" numberOfLines={1}>{item.blocks.length} Items</Text>
                </View>
            </View>
            <View className="bg-green-50 w-8 h-8 rounded-full items-center justify-center">
                <Text className="text-green-600 font-bold text-xl">+</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 pt-4 pb-4 border-b border-border flex-row justify-between items-center bg-background">
                <View>
                    <Text className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Event' : 'New Event'}</Text>
                    <Text className="text-xs text-muted-foreground">{selectedRoutineIds.length} Sets Scheduled</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 px-4 py-2 rounded-full">
                    <Text className="text-gray-600 font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <View className="p-6">
                    {/* Event Type Toggle */}
                    <View className="flex-row gap-2 mb-6">
                        {(['performance', 'lesson', 'rehearsal'] as const).map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                className={`flex-1 py-3 items-center rounded-2xl border ${type === t ? 'bg-blue-600 border-blue-600' : 'bg-card border-border'}`}
                            >
                                <Text className={`text-[10px] uppercase font-black tracking-widest ${type === t ? 'text-white' : 'text-gray-500'}`}>
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Basic Info Card */}
                    <View className="bg-card p-5 rounded-3xl border border-border shadow-sm mb-6">
                        <View className="mb-5">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Event Title</Text>
                            <TextInput
                                className="text-2xl font-bold text-foreground"
                                placeholder={type === 'lesson' ? 'Weekly Sax Lesson' : 'Summer Festival...'}
                                value={title}
                                onChangeText={setTitle}
                            />
                        </View>

                        {type === 'lesson' && (
                            <View className="mb-5">
                                <Text className="text-[10px] uppercase font-black text-purple-600 mb-1 tracking-widest">Student Name</Text>
                                <TextInput
                                    className="text-lg font-semibold text-foreground"
                                    placeholder="John Doe"
                                    value={studentName}
                                    onChangeText={setStudentName}
                                />
                            </View>
                        )}

                        <View className="mb-5">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Venue / Location</Text>
                            <TextInput
                                className="text-lg font-semibold text-foreground"
                                placeholder={type === 'lesson' ? 'Studio / Zoom' : 'The Jazz Corner'}
                                value={venue}
                                onChangeText={setVenue}
                            />
                        </View>
                        <View className="mb-5 flex-row items-center justify-between border-t border-gray-50 pt-5">
                            <View>
                                <Text className="text-sm font-bold text-foreground">Recurring Event?</Text>
                                <Text className="text-[10px] text-muted-foreground uppercase font-black">Repeats weekly</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => setIsRecurring(!isRecurring)}
                                className={`w-14 h-8 rounded-full items-center justify-center ${isRecurring ? 'bg-blue-600' : 'bg-gray-200'}`}
                            >
                                <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${isRecurring ? 'ml-6' : 'mr-6'}`} />
                            </TouchableOpacity>
                        </View>

                        {isRecurring ? (
                            <View className="mb-5">
                                <Text className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest">Repeat On</Text>
                                <View className="flex-row justify-between mb-6">
                                    {days.map((day, index) => (
                                        <TouchableOpacity
                                            key={day}
                                            onPress={() => toggleDay(index)}
                                            className={`w-10 h-10 rounded-full items-center justify-center border ${daysOfWeek.includes(index) ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'bg-gray-50 border-gray-100'}`}
                                        >
                                            <Text className={`text-[10px] font-black ${daysOfWeek.includes(index) ? 'text-white' : 'text-gray-400'}`}>
                                                {day.charAt(0)}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <View className="flex-row gap-4">
                                    <View className="flex-1">
                                        <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Start Date</Text>
                                        <TouchableOpacity
                                            onPress={() => setShowStartDatePicker(true)}
                                            className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-row justify-between items-center"
                                        >
                                            <Text className="font-bold text-foreground text-xs">
                                                {new Date(startDate).toLocaleDateString()}
                                            </Text>
                                            <Text className="text-xs">📅</Text>
                                        </TouchableOpacity>
                                        {showStartDatePicker && (
                                            <DateTimePicker
                                                value={new Date(startDate)}
                                                mode="date"
                                                display="default"
                                                onChange={onStartDateChange}
                                            />
                                        )}
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">End Date</Text>
                                        <TouchableOpacity
                                            onPress={() => setShowEndDatePicker(true)}
                                            className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-row justify-between items-center"
                                        >
                                            <Text className="font-bold text-foreground text-xs">
                                                {new Date(endDate).toLocaleDateString()}
                                            </Text>
                                            <Text className="text-xs">📅</Text>
                                        </TouchableOpacity>
                                        {showEndDatePicker && (
                                            <DateTimePicker
                                                value={new Date(endDate)}
                                                mode="date"
                                                display="default"
                                                onChange={onEndDateChange}
                                            />
                                        )}
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View className="flex-row gap-4 mb-5">
                                <View className="flex-1">
                                    <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Date</Text>
                                    <TouchableOpacity
                                        onPress={() => setShowDatePicker(true)}
                                        className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-row justify-between items-center"
                                    >
                                        <Text className="font-bold text-foreground">
                                            {new Date(date).toLocaleDateString()}
                                        </Text>
                                        <Text>📅</Text>
                                    </TouchableOpacity>
                                    {showDatePicker && (
                                        <DateTimePicker
                                            value={new Date(date)}
                                            mode="date"
                                            display="default"
                                            onChange={onDateChange}
                                        />
                                    )}
                                </View>
                                <View className="flex-1" />
                            </View>
                        )}

                        <View className="mb-2">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Time</Text>
                            <TouchableOpacity
                                onPress={() => setShowTimePicker(true)}
                                className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-row justify-between items-center"
                            >
                                <Text className="font-bold text-foreground text-center flex-1">
                                    {formatDisplayTime(time)}
                                </Text>
                                <Text>🕒</Text>
                            </TouchableOpacity>

                            {showTimePicker && Platform.OS === 'ios' && (
                                <Modal
                                    transparent
                                    animationType="fade"
                                    visible={showTimePicker}
                                    onRequestClose={() => setShowTimePicker(false)}
                                >
                                    <View className="flex-1 bg-black/40 justify-center items-center p-6">
                                        <View className="bg-white rounded-[40px] p-8 w-full shadow-2xl items-center">
                                            <Text className="text-center font-black text-2xl mb-2 text-foreground">Set Event Time</Text>
                                            <Text className="text-muted-foreground font-medium mb-6">Scroll to select the start time</Text>

                                            <DateTimePicker
                                                value={getTimeDate()}
                                                mode="time"
                                                display="spinner"
                                                is24Hour={false}
                                                onChange={onTimeChange}
                                                style={{ width: '100%', height: 200 }}
                                            />

                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker(false)}
                                                className="mt-8 bg-blue-600 w-full p-5 rounded-3xl items-center shadow-lg shadow-blue-400"
                                            >
                                                <Text className="text-white font-black text-xl">Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Modal>
                            )}

                            {showTimePicker && Platform.OS !== 'ios' && (
                                <DateTimePicker
                                    value={getTimeDate()}
                                    mode="time"
                                    display="default"
                                    is24Hour={false}
                                    onChange={onTimeChange}
                                />
                            )}
                        </View>
                    </View>

                    {/* Financials Row */}
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1 bg-card p-4 rounded-3xl border border-border shadow-sm">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Fee / Pay</Text>
                            <TextInput
                                className="text-lg font-bold text-green-600"
                                placeholder="$"
                                value={fee}
                                onChangeText={setFee}
                            />
                        </View>
                        <View className="flex-[2]" />
                    </View>

                    {/* Setlist / Material (Routines) */}
                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-xl font-bold tracking-tight">{type === 'lesson' ? 'Lesson Material' : 'Setlist'}</Text>
                        <Text className="text-xs text-muted-foreground italic font-medium">Drag to reorder</Text>
                    </View>

                    <View className="min-h-[80px] mb-8">
                        <DraggableFlatList
                            data={selectedRoutines}
                            onDragEnd={({ data }) => setSelectedRoutineIds(data.map(r => r.id))}
                            keyExtractor={(item) => item.id}
                            renderItem={renderSelectedRoutineItem}
                            scrollEnabled={false}
                            ListEmptyComponent={
                                <View className="border-2 border-dashed border-amber-200 bg-amber-50/30 rounded-3xl p-8 items-center">
                                    <Text className="text-amber-400 font-bold text-center">No routines added. Add a routine below to build your {type === 'lesson' ? 'lesson' : 'setlist'}.</Text>
                                </View>
                            }
                        />
                    </View>

                    {/* Event Notes Section - Full Width & Bottom-ish */}
                    <View className="bg-card p-5 rounded-3xl border border-border shadow-sm mb-8">
                        <Text className="text-[10px] uppercase font-black text-muted-foreground mb-2 tracking-widest">Detailed Event Notes</Text>
                        <TextInput
                            className="text-base text-foreground min-h-[120px]"
                            placeholder="Add setup notes, directions, or student goals here..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Library (Routines) */}
                    <Text className="text-xl font-bold tracking-tight mb-4 px-1">Add from Routines</Text>
                    <View className="flex-row items-center bg-card border border-border rounded-2xl px-4 py-3 mb-5 shadow-sm">
                        <Text className="mr-3 text-lg">🔍</Text>
                        <TextInput
                            className="flex-1 text-foreground font-medium py-1"
                            placeholder="Search your routines..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <View className="mb-24">
                        {availableRoutines.length > 0 ? (
                            availableRoutines.map(routine => (
                                <View key={routine.id}>
                                    {renderAvailableRoutineItem({ item: routine })}
                                </View>
                            ))
                        ) : (
                            <View className="p-4 items-center">
                                <Text className="text-center text-muted-foreground font-medium">No routines found.</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-8 left-8 right-8 shadow-2xl shadow-blue-500/50">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-600 p-5 rounded-3xl flex-row justify-center items-center"
                >
                    <Text className="text-white font-black text-xl tracking-tight">
                        {isEditing ? 'Update' : 'Confirm'} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
