import { GearPackManager } from '@/components/GearPackManager';
import { RosterManager } from '@/components/RosterManager';
import { useContentStore } from '@/store/contentStore';
import { useGearStore } from '@/store/gearStore';
import { AppEvent, AppEventType, BookingSlot, Person, Routine } from '@/store/types';
import { addToNativeCalendar } from '@/utils/calendar';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';


export default function EventEditor() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;

    const { routines = [], events = [], people = [], addEvent, updateEvent } = useContentStore();
    const existingEvent = id ? events.find((e) => e.id === id) : undefined;
    const isEditing = !!existingEvent;

    const [type, setType] = useState<AppEventType>(
        existingEvent?.type || (params.type as AppEventType) || 'performance'
    );

    const [title, setTitle] = useState(existingEvent?.title || '');
    const [venue, setVenue] = useState(existingEvent?.venue || '');
    const [date, setDate] = useState(existingEvent?.date || new Date().toISOString().split('T')[0]);
    const [time, setTime] = useState(existingEvent?.time || '20:00');
    const [notes, setNotes] = useState(existingEvent?.notes || '');
    const [totalFee, setTotalFee] = useState(existingEvent?.totalFee || existingEvent?.fee || '');
    const [musicianFee, setMusicianFee] = useState(existingEvent?.musicianFee || '');
    const [studentName, setStudentName] = useState(existingEvent?.studentName || '');
    const [duration, setDuration] = useState<number>(existingEvent?.duration || 60);

    // selectedRoutineIds stores the IDs of routines (sets) for this event
    const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(
        existingEvent?.routines || []
    );

    // slots manages the structured roster
    const [slots, setSlots] = useState<BookingSlot[]>(
        existingEvent?.slots || []
    );

    const { packLists, addPackList, updatePackList, getPackListForEvent } = useGearStore();
    const existingPackList = id ? getPackListForEvent(id) : undefined;

    const [selectedGearIds, setSelectedGearIds] = useState<string[]>(
        existingPackList?.itemIds || []
    );
    const [checkedGearIds, setCheckedGearIds] = useState<string[]>(
        existingPackList?.checkedItemIds || []
    );


    const [searchQuery, setSearchQuery] = useState('');
    const [personSearchQuery, setPersonSearchQuery] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Recurrence states
    const [isRecurring, setIsRecurring] = useState(existingEvent?.schedule?.type === 'recurring');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(existingEvent?.schedule?.daysOfWeek || []);
    const [startDate, setStartDate] = useState(existingEvent?.schedule?.startDate || date);
    const [endDate, setEndDate] = useState(existingEvent?.schedule?.endDate || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const toggleDay = useCallback((day: number) => {
        setDaysOfWeek(prev => {
            if (prev.includes(day)) {
                return prev.filter(d => d !== day);
            } else {
                return [...prev, day].sort();
            }
        });
    }, []);

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

    const availablePersonnel = useMemo(() => {
        return people
            .filter(p => !slots.some(s => s.musicianId === p.id))
            .filter(p => {
                const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
                return fullName.includes(personSearchQuery.toLowerCase());
            });
    }, [people, slots, personSearchQuery]);

    const addRoutineToEvent = useCallback((routineId: string) => {
        setSelectedRoutineIds(prev => [...prev, routineId]);
    }, []);

    const removeRoutineFromEvent = useCallback((routineId: string) => {
        setSelectedRoutineIds(prev => prev.filter((id) => id !== routineId));
    }, []);

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
            slots, // New structured roster
            notes: notes.trim() || undefined,
            totalFee: totalFee.trim() || undefined,
            fee: totalFee.trim() || undefined, // Keep for backward compatibility
            musicianFee: musicianFee.trim() || undefined,
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
            duration,
            createdAt: existingEvent?.createdAt || new Date().toISOString(),
        };

        if (isEditing && id) {
            updateEvent(id, eventData);
            if (existingPackList) {
                updatePackList(existingPackList.id, {
                    itemIds: selectedGearIds,
                    checkedItemIds: checkedGearIds
                });
            } else if (selectedGearIds.length > 0) {
                addPackList({
                    id: Date.now().toString() + 'pl',
                    eventId: id,
                    itemIds: selectedGearIds,
                    checkedItemIds: checkedGearIds,
                    additionalItems: []
                });
            }
        } else {
            const newEventId = Date.now().toString();
            addEvent({ ...eventData, id: newEventId });
            if (selectedGearIds.length > 0) {
                addPackList({
                    id: Date.now().toString() + 'pl',
                    eventId: newEventId,
                    itemIds: selectedGearIds,
                    checkedItemIds: checkedGearIds,
                    additionalItems: []
                });
            }
        }

        router.back();
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

    const getEndTime = () => {
        const start = getTimeDate();
        const end = new Date(start.getTime() + duration * 60000);
        const hours = end.getHours().toString().padStart(2, '0');
        const minutes = end.getMinutes().toString().padStart(2, '0');
        return formatDisplayTime(`${hours}:${minutes}`);
    };

    const adjustDuration = (amount: number) => {
        setDuration(prev => Math.max(15, prev + amount));
    };

    // --- Sub-render components moved here or defined as true components ---


    return (
        <View className="flex-1 bg-white" style={Platform.OS === 'web' ? { height: '100vh' } as any : undefined}>
            {/* Header */}
            <View className="px-6 pt-4 pb-4 border-b border-slate-200 flex-row justify-between items-center bg-white z-10">
                <View>
                    <Text className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Edit Event' : 'New Event'}</Text>
                    <Text className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedRoutineIds.length} Sets Scheduled</Text>
                </View>
                <TouchableOpacity
                    onPress={() => {
                        if (navigation.canGoBack()) {
                            router.back();
                        } else {
                            // Fallback for web PWA if opened directly or refreshed
                            router.replace('/(drawer)/(tabs)/schedule' as any);
                        }
                    }}
                    className="bg-slate-100 px-4 py-2 rounded-full flex-row items-center"
                >
                    <Ionicons name="close-circle" size={18} color="#475569" />
                    <Text className="text-slate-600 font-bold text-xs uppercase tracking-wide ml-2">Cancel</Text>
                </TouchableOpacity>
            </View>

            <DraggableFlatList
                data={selectedRoutines}
                onDragEnd={({ data }) => setSelectedRoutineIds(data.map(r => r.id))}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 100 }}
                containerStyle={{ flex: 1 }}
                ListHeaderComponent={
                    <EditorHeader
                        type={type} setType={setType} title={title} setTitle={setTitle}
                        studentName={studentName} setStudentName={setStudentName}
                        venue={venue} setVenue={setVenue} isRecurring={isRecurring}
                        setIsRecurring={setIsRecurring} daysOfWeek={daysOfWeek}
                        toggleDay={toggleDay} startDate={startDate} setStartDate={setStartDate}
                        endDate={endDate} setEndDate={setEndDate} date={date} setDate={setDate}
                        time={time} setTime={setTime} duration={duration} setDuration={setDuration}
                        totalFee={totalFee} setTotalFee={setTotalFee} musicianFee={musicianFee}
                        setMusicianFee={setMusicianFee} formatDisplayTime={formatDisplayTime}
                        getTimeDate={getTimeDate} notes={notes}
                        people={people}
                    />
                }
                ListFooterComponent={
                    <EditorFooter
                        slots={slots} setSlots={setSlots} people={people} type={type}
                        title={title} venue={venue} isRecurring={isRecurring}
                        startDate={startDate} date={date} time={time} notes={notes}
                        setNotes={setNotes} totalFee={totalFee} musicianFee={musicianFee}
                        personSearchQuery={personSearchQuery} setPersonSearchQuery={setPersonSearchQuery}
                        availablePersonnel={availablePersonnel} searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery} availableRoutines={availableRoutines}
                        addRoutineToEvent={addRoutineToEvent}
                        selectedGearIds={selectedGearIds}
                        setSelectedGearIds={setSelectedGearIds}
                        checkedGearIds={checkedGearIds}
                        setCheckedGearIds={setCheckedGearIds}
                    />
                }
                renderItem={({ item, drag, isActive }) => (
                    <View className="px-6">
                        <ScaleDecorator>
                            <TouchableOpacity
                                onLongPress={drag}
                                disabled={isActive}
                                className={`mb-2 p-4 rounded-2xl border flex-row items-center justify-between ${isActive ? 'bg-slate-100 border-slate-300' : 'bg-white border-slate-200 shadow-sm'}`}
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-xl bg-slate-100 items-center justify-center mr-3">
                                        <Text className="text-lg">🎼</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>{item.title}</Text>
                                        <Text className="text-xs text-slate-500 font-medium">{item.blocks.length} Blocks</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => removeRoutineFromEvent(item.id)} className="p-2 ml-2 bg-slate-50 rounded-full">
                                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        </ScaleDecorator>
                    </View>
                )}
                ListEmptyComponent={
                    <View className="px-6">
                        <View className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-3xl p-8 items-center">
                            <Text className="text-slate-400 font-bold text-center">No routines added. Add a routine below to build your {type === 'lesson' ? 'lesson' : 'setlist'}.</Text>
                        </View>
                    </View>
                }
            />

            {/* Save Button */}
            <View className="absolute bottom-6 left-6 right-6 border-t border-slate-100 pt-4 bg-white/90" style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-slate-900 p-4 rounded-2xl shadow-lg flex-row justify-center items-center shadow-slate-900/20"
                >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white font-black text-lg uppercase tracking-wider ml-2">
                        {isEditing ? 'Update' : 'Save'} {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- Specialized Components for Stability ---

const WebSelect = ({ value, options, onChange, placeholder = 'Select', labelClassName = '', icon }: any) => {
    const [visible, setVisible] = useState(false);
    const selected = options.find((o: any) => o.value == value);

    // Ensure current value is represented if not in options
    const displayLabel = selected ? selected.label : (value ? value : placeholder);

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} className={`flex-row items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 ${labelClassName}`}>
                <Text className="font-bold text-slate-900 flex-1" numberOfLines={1}>{displayLabel}</Text>
                <Ionicons name={icon || "chevron-down"} size={icon ? 20 : 12} color={icon ? "#64748b" : "#94a3b8"} />
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
                                    <Text className={`text-center font-bold ${opt.value == value ? 'text-blue-600' : 'text-slate-700'}`}>{opt.label}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

const WebDatePicker = ({ date, onChange }: { date: string, onChange: (d: string) => void }) => {
    return (
        <View className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full h-[50px] justify-center relative">
            {/* Native Input: Visible, Transparent Background, fills container */}
            <input
                type="date"
                value={date}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => {
                    try {
                        if (typeof e.currentTarget.showPicker === 'function') {
                            e.currentTarget.showPicker();
                        }
                    } catch (err) {
                        // Ignore
                    }
                }}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    paddingLeft: 16,
                    paddingRight: 40, // Space for icon
                    fontSize: 16,
                    border: 'none',
                    background: 'transparent',
                    fontFamily: 'inherit',
                    fontWeight: 600,
                    color: '#0f172a',
                    zIndex: 10,
                    cursor: 'pointer',
                    appearance: 'none',
                    WebkitAppearance: 'none'
                }}
            />
            {/* Icon Decoration */}
            <View className="absolute right-3 top-0 bottom-0 justify-center pointer-events-none" style={{ zIndex: 5 }}>
                <Ionicons name="calendar-outline" size={20} color="#64748b" />
            </View>
        </View>
    );
};

const WebTimePicker = ({ value, onChange }: { value: string, onChange: (t: string) => void }) => {
    // Value format: "HH:MM" (24h)
    // We need to parse this into 12h format for the UI
    const [h24, m] = value.split(':').map(Number);
    const isPM = h24 >= 12;
    const h12 = h24 % 12 || 12; // 0 -> 12, 13 -> 1

    const updateTime = (newH12: number, newM: number, newIsPM: boolean) => {
        let finalH = newH12;
        if (newIsPM && finalH < 12) finalH += 12;
        if (!newIsPM && finalH === 12) finalH = 0;

        const timeString = `${finalH.toString().padStart(2, '0')}:${newM.toString().padStart(2, '0')}`;
        onChange(timeString);
    };

    return (
        <View className="flex-row gap-2 w-full">
            {/* Hour Picker */}
            <View className="flex-1 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                <select
                    value={h12}
                    onChange={(e) => updateTime(parseInt(e.target.value), m, isPM)}
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                        <option key={h} value={h}>{h}</option>
                    ))}
                </select>
                <View className="flex-1 items-center justify-center pointer-events-none">
                    <Text className="font-bold text-lg text-slate-800">{h12}</Text>
                </View>
            </View>

            <Text className="self-center font-black text-slate-300">:</Text>

            {/* Minute Picker */}
            <View className="flex-1 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                <select
                    value={m}
                    onChange={(e) => updateTime(h12, parseInt(e.target.value), isPM)}
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                >
                    {Array.from({ length: 12 }, (_, i) => i * 5).map(min => (
                        <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                    ))}
                </select>
                <View className="flex-1 items-center justify-center pointer-events-none">
                    <Text className="font-bold text-lg text-slate-800">{m.toString().padStart(2, '0')}</Text>
                </View>
            </View>

            {/* AM/PM Picker */}
            <View className="w-20 relative bg-slate-50 border border-slate-200 rounded-xl overflow-hidden h-[50px]">
                <select
                    value={isPM ? 'PM' : 'AM'}
                    onChange={(e) => updateTime(h12, m, e.target.value === 'PM')}
                    style={{
                        position: 'absolute', inset: 0, width: '100%', height: '100%',
                        opacity: 0, cursor: 'pointer', zIndex: 10
                    }}
                >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                </select>
                <View className="flex-1 items-center justify-center pointer-events-none bg-slate-100">
                    <Text className="font-black text-sm text-slate-600">{isPM ? 'PM' : 'AM'}</Text>
                </View>
            </View>
        </View>
    );
};

interface HeaderProps {
    type: AppEventType;
    setType: (t: AppEventType) => void;
    title: string;
    setTitle: (t: string) => void;
    studentName: string;
    setStudentName: (t: string) => void;
    venue: string;
    setVenue: (v: string) => void;
    isRecurring: boolean;
    setIsRecurring: (r: boolean) => void;
    daysOfWeek: number[];
    toggleDay: (d: number) => void;
    startDate: string;
    setStartDate: (d: string) => void;
    endDate: string;
    setEndDate: (d: string) => void;
    date: string;
    setDate: (d: string) => void;
    time: string;
    setTime: (t: string) => void;
    duration: number;
    setDuration: React.Dispatch<React.SetStateAction<number>>;
    totalFee: string;
    setTotalFee: (f: string) => void;
    musicianFee: string;
    setMusicianFee: (f: string) => void;
    formatDisplayTime: (t: string) => string;
    getTimeDate: () => Date;
    notes: string;
    people: Person[];
}

const EditorHeader = ({
    type, setType, title, setTitle, studentName, setStudentName,
    venue, setVenue, isRecurring, setIsRecurring, daysOfWeek, toggleDay,
    startDate, setStartDate, endDate, setEndDate, date, setDate,
    time, setTime, duration, setDuration, totalFee, setTotalFee,
    musicianFee, setMusicianFee, formatDisplayTime, getTimeDate, notes,
    people
}: HeaderProps) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    // Venue Picker State
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const venueManagers = useMemo(() => people.filter(p => p.type === 'venue_manager'), [people]);

    // Generate time options for web picker
    // Generate time options for web picker
    const timeOptions = useMemo(() => {
        const opts = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                opts.push({ label: formatDisplayTime(val), value: val });
            }
        }
        return opts;
    }, []);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) setDate(selectedDate.toISOString().split('T')[0]);
    };
    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        }
    };
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        setShowStartDatePicker(false);
        if (selectedDate) setStartDate(selectedDate.toISOString().split('T')[0]);
    };
    const onEndDateChange = (event: any, selectedDate?: Date) => {
        setShowEndDatePicker(false);
        if (selectedDate) setEndDate(selectedDate.toISOString().split('T')[0]);
    };

    const getEndTime = () => {
        const start = getTimeDate();
        const end = new Date(start.getTime() + duration * 60000);
        const hours = end.getHours().toString().padStart(2, '0');
        const minutes = end.getMinutes().toString().padStart(2, '0');
        return formatDisplayTime(`${hours}:${minutes}`);
    };

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <View className="p-6">
            <View className="flex-row gap-2 mb-6">
                {(['performance', 'lesson', 'rehearsal'] as const).map(t => (
                    <TouchableOpacity
                        key={t}
                        onPress={() => setType(t)}
                        className={`flex-1 py-3 items-center rounded-2xl border ${type === t ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                    >
                        <Text className={`text-[10px] uppercase font-black tracking-widest ${type === t ? 'text-white' : 'text-slate-400'}`}>
                            {t}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
                <View className="mb-5">
                    <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Event Title</Text>
                    <TextInput
                        className="text-2xl font-bold text-slate-900"
                        placeholder={type === 'lesson' ? 'Weekly Sax Lesson' : 'Summer Festival...'}
                        placeholderTextColor="#cbd5e1"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {type === 'lesson' && (
                    <View className="mb-5">
                        <Text className="text-[10px] uppercase font-black text-purple-600 mb-1 tracking-widest">Student Name</Text>
                        <TextInput
                            className="text-lg font-semibold text-slate-900"
                            placeholder="John Doe"
                            placeholderTextColor="#cbd5e1"
                            value={studentName}
                            onChangeText={setStudentName}
                        />
                    </View>
                )}

                <View className="mb-5">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Venue / Location</Text>
                        <TouchableOpacity onPress={() => setShowVenuePicker(true)} className="flex-row items-center">
                            <Ionicons name="people-circle-outline" size={16} color="#2563eb" />
                            <Text className="text-10px font-bold text-blue-600 ml-1">Select from Contacts</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        className="text-lg font-semibold text-slate-900"
                        placeholder={type === 'lesson' ? 'Studio / Zoom' : 'The Jazz Corner'}
                        placeholderTextColor="#cbd5e1"
                        value={venue}
                        onChangeText={setVenue}
                    />

                    {/* Venue Picker Modal */}
                    <Modal visible={showVenuePicker} animationType="slide" transparent>
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white rounded-t-3xl p-6 h-[70%]">
                                <View className="flex-row justify-between items-center mb-4">
                                    <Text className="text-xl font-black text-slate-900">Select Venue Contact</Text>
                                    <TouchableOpacity onPress={() => setShowVenuePicker(false)} className="bg-slate-100 p-2 rounded-full">
                                        <Ionicons name="close" size={24} color="#0f172a" />
                                    </TouchableOpacity>
                                </View>
                                {venueManagers.length > 0 ? (
                                    <ScrollView>
                                        {venueManagers.map(vm => (
                                            <TouchableOpacity
                                                key={vm.id}
                                                onPress={() => {
                                                    if (vm.venueName) setVenue(vm.venueName);
                                                    setShowVenuePicker(false);
                                                }}
                                                className="p-4 border-b border-gray-100 flex-row items-center"
                                            >
                                                <Ionicons name="business" size={20} color="#b45309" style={{ marginRight: 12 }} />
                                                <View>
                                                    <Text className="font-bold text-base text-slate-900">{vm.venueName || 'Unknown Venue'}</Text>
                                                    <Text className="text-sm text-slate-500">{vm.firstName} {vm.lastName} • {vm.venueLocation || 'No Loc'}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                ) : (
                                    <View className="flex-1 items-center justify-center">
                                        <Text className="text-slate-400 font-medium">No contacts marked as 'Venue Manager' found.</Text>
                                        <TouchableOpacity onPress={() => setShowVenuePicker(false)} className="mt-4"><Text className="text-blue-500 font-bold">Close</Text></TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>
                    </Modal>
                </View>

                <View className="mb-5 flex-row items-center justify-between border-t border-slate-100 pt-5">
                    <View>
                        <Text className="text-sm font-bold text-slate-900">Recurring Event?</Text>
                        <Text className="text-[10px] text-slate-400 uppercase font-black">Repeats weekly</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setIsRecurring(!isRecurring)}
                        className={`w-14 h-8 rounded-full items-center justify-center ${isRecurring ? 'bg-blue-600' : 'bg-slate-200'}`}
                    >
                        <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${isRecurring ? 'ml-6' : 'mr-6'}`} />
                    </TouchableOpacity>
                </View>

                {isRecurring ? (
                    <View className="mb-5">
                        <Text className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest">Repeat On</Text>
                        <View className="flex-row justify-between mb-6">
                            {days.map((day, index) => (
                                <TouchableOpacity
                                    key={day}
                                    onPress={() => toggleDay(index)}
                                    className={`w-10 h-10 rounded-full items-center justify-center border ${daysOfWeek.includes(index) ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'bg-slate-50 border-slate-200'}`}
                                >
                                    <Text className={`text-[10px] font-black ${daysOfWeek.includes(index) ? 'text-white' : 'text-slate-400'}`}>
                                        {day.charAt(0)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Start Date</Text>
                                {Platform.OS === 'web' ? (
                                    <WebDatePicker date={startDate} onChange={setStartDate} />
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => setShowStartDatePicker(true)} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex-row justify-between items-center">
                                            <Text className="font-bold text-slate-900 text-xs">{new Date(startDate).toLocaleDateString()}</Text>
                                            <Text className="text-xs">📅</Text>
                                        </TouchableOpacity>
                                        {showStartDatePicker && <DateTimePicker value={new Date(startDate)} mode="date" display="default" onChange={onStartDateChange} />}
                                    </>
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">End Date</Text>
                                {Platform.OS === 'web' ? (
                                    <WebDatePicker date={endDate} onChange={setEndDate} />
                                ) : (
                                    <>
                                        <TouchableOpacity onPress={() => setShowEndDatePicker(true)} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex-row justify-between items-center">
                                            <Text className="font-bold text-slate-900 text-xs">{new Date(endDate).toLocaleDateString()}</Text>
                                            <Text className="text-xs">📅</Text>
                                        </TouchableOpacity>
                                        {showEndDatePicker && <DateTimePicker value={new Date(endDate)} mode="date" display="default" onChange={onEndDateChange} />}
                                    </>
                                )}
                            </View>
                        </View>
                    </View>
                ) : (
                    <View className="flex-row gap-4 mb-5">
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Date</Text>
                            {Platform.OS === 'web' ? (
                                <WebDatePicker date={date} onChange={setDate} />
                            ) : (
                                <>
                                    <TouchableOpacity onPress={() => setShowDatePicker(true)} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex-row justify-between items-center">
                                        <Text className="font-bold text-slate-900">{new Date(date).toLocaleDateString()}</Text>
                                        <Text>📅</Text>
                                    </TouchableOpacity>
                                    {showDatePicker && <DateTimePicker value={new Date(date)} mode="date" display="default" onChange={onDateChange} />}
                                </>
                            )}
                        </View>
                    </View>
                )}

                <View className="mb-2">
                    <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Time</Text>
                    {Platform.OS === 'web' ? (
                        <WebSelect
                            value={time}
                            options={timeOptions}
                            onChange={setTime}
                            icon="time-outline"
                        />
                    ) : (
                        <TouchableOpacity onPress={() => setShowTimePicker(true)} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex-row justify-between items-center">
                            <Text className="font-bold text-slate-900 text-center flex-1">{formatDisplayTime(time)}</Text>
                            <Text>🕒</Text>
                        </TouchableOpacity>
                    )}

                    <View className="flex-row gap-4 mt-6 border-t border-slate-100 pt-5">
                        <View className="flex-[2]">
                            <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Duration</Text>
                            <View className="flex-row items-center bg-slate-50 rounded-2xl border border-slate-200 p-1">
                                <TouchableOpacity onPress={() => setDuration(prev => Math.max(15, prev - 15))} className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <Text className="text-slate-900 font-black text-xl">−</Text>
                                </TouchableOpacity>
                                <View className="flex-1 items-center">
                                    <Text className="font-bold text-slate-900">
                                        {duration < 60 ? `${duration}m` : `${Math.floor(duration / 60)}h${duration % 60 > 0 ? ` ${duration % 60}m` : ''}`}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setDuration(prev => prev + 15)} className="w-10 h-10 items-center justify-center rounded-xl bg-white shadow-sm">
                                    <Text className="text-slate-900 font-black text-xl">+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View className="flex-1 items-center justify-center">
                            <View className="items-center">
                                <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">End Time</Text>
                                <Text className="font-bold text-blue-600 text-sm">{getEndTime()}</Text>
                            </View>
                        </View>
                    </View>

                    {showTimePicker && Platform.OS === 'ios' && (
                        <Modal transparent animationType="fade" visible={showTimePicker} onRequestClose={() => setShowTimePicker(false)}>
                            <View className="flex-1 bg-black/40 justify-center items-center p-6">
                                <View className="bg-white rounded-[40px] p-8 w-full shadow-2xl items-center">
                                    <Text className="text-center font-black text-2xl mb-2 text-slate-900">Set Event Time</Text>
                                    <Text className="text-slate-500 font-medium mb-6">Scroll to select the start time</Text>
                                    <DateTimePicker value={getTimeDate()} mode="time" display="spinner" is24Hour={false} onChange={onTimeChange} style={{ width: '100%', height: 200 }} />
                                    <TouchableOpacity onPress={() => setShowTimePicker(false)} className="mt-8 bg-blue-600 w-full p-5 rounded-3xl items-center shadow-lg shadow-blue-400">
                                        <Text className="text-white font-black text-xl">Done</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>
                    )}
                    {showTimePicker && Platform.OS !== 'ios' && <DateTimePicker value={getTimeDate()} mode="time" display="default" is24Hour={false} onChange={onTimeChange} />}
                </View>
            </View>

            <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                    <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">{type === 'lesson' ? 'Rate / Fee' : 'Total Event Fee'}</Text>
                    <TextInput className="text-lg font-bold text-green-600" placeholder="$" value={totalFee} onChangeText={setTotalFee} />
                </View>
                {type !== 'lesson' && (
                    <View className="flex-1 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
                        <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Default Pay/Musician</Text>
                        <TextInput className="text-lg font-bold text-blue-600" placeholder="$" value={musicianFee} onChangeText={setMusicianFee} />
                    </View>
                )}
            </View>

            <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-xl font-bold tracking-tight text-slate-900">{type === 'lesson' ? 'Lesson Material' : 'Setlist'}</Text>
                <TouchableOpacity
                    onPress={() => addToNativeCalendar({
                        id: 'temp',
                        type,
                        title,
                        venue,
                        date: isRecurring ? startDate : date,
                        time,
                        duration,
                        notes,
                        routines: [],
                        slots: [],
                        createdAt: new Date().toISOString()
                    })}
                    className="flex-row items-center bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200"
                >
                    <Ionicons name="calendar-outline" size={14} color="#64748b" />
                    <Text className="text-slate-500 font-bold text-[10px] uppercase ml-1.5 tracking-wider">Sync to Calendar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

interface FooterProps {
    slots: BookingSlot[];
    setSlots: (s: BookingSlot[]) => void;
    people: Person[];
    type: AppEventType;
    title: string;
    venue: string;
    isRecurring: boolean;
    startDate: string;
    date: string;
    time: string;
    notes: string;
    setNotes: (n: string) => void;
    totalFee: string;
    musicianFee: string;
    personSearchQuery: string;
    setPersonSearchQuery: (q: string) => void;
    availablePersonnel: Person[];
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    availableRoutines: Routine[];
    addRoutineToEvent: (id: string) => void;
    selectedGearIds: string[];
    setSelectedGearIds: (ids: string[]) => void;
    checkedGearIds: string[];
    setCheckedGearIds: (ids: string[]) => void;
}

const EditorFooter = ({
    slots, setSlots, people, type, title, venue, isRecurring, startDate, date, time, notes, setNotes, totalFee, musicianFee,
    personSearchQuery, setPersonSearchQuery, availablePersonnel, searchQuery, setSearchQuery, availableRoutines, addRoutineToEvent,
    selectedGearIds, setSelectedGearIds, checkedGearIds, setCheckedGearIds
}: FooterProps) => (
    <View className="p-6">
        <RosterManager
            slots={slots}
            onUpdateSlots={setSlots}
            availablePeople={people}
            event={{ type, title, venue, date: isRecurring ? startDate : date, time, notes, totalFee, fee: totalFee, musicianFee }}
        />

        <GearPackManager
            selectedItemIds={selectedGearIds}
            onUpdateItems={setSelectedGearIds}
            checkedItemIds={checkedGearIds}
            onUpdateCheckedItems={setCheckedGearIds}
        />

        <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-8">
            <Text className="text-[10px] uppercase font-black text-slate-400 mb-2 tracking-widest">Detailed Event Notes</Text>
            <TextInput className="text-base text-slate-900 min-h-[120px]" placeholder="Add setup notes, directions, or student goals here..." placeholderTextColor="#94a3b8" value={notes} onChangeText={setNotes} multiline textAlignVertical="top" />
        </View>
        <Text className="text-xl font-bold tracking-tight mb-4 px-1 text-slate-900">Add Personnel</Text>
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-5 shadow-sm">
            <Ionicons name="search" size={24} color="#3b82f6" style={{ marginRight: 12 }} />
            <TextInput className="flex-1 text-slate-900 font-medium py-1" placeholder="Search people..." placeholderTextColor="#94a3b8" value={personSearchQuery} onChangeText={setPersonSearchQuery} />
        </View>
        <View className="mb-8">
            {availablePersonnel.length > 0 ? (
                availablePersonnel.map(person => (
                    <TouchableOpacity
                        key={person.id}
                        onPress={() => {
                            const newSlot: BookingSlot = {
                                id: Date.now().toString() + person.id,
                                role: person.instruments[0] || 'Musician',
                                instruments: person.instruments,
                                status: 'invited',
                                musicianId: person.id,
                                invitedAt: new Date().toISOString()
                            };
                            setSlots([...slots, newSlot]);
                        }}
                        className="p-4 mb-3 rounded-2xl border bg-white border-slate-200 flex-row justify-between items-center shadow-sm"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center mr-3">
                                <Ionicons name="person" size={20} color="#3b82f6" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>{person.firstName} {person.lastName}</Text>
                                <Text className="text-xs text-slate-500" numberOfLines={1}>{person.instruments.join(', ') || person.type}</Text>
                            </View>
                        </View>
                        <View className="bg-emerald-50 w-8 h-8 rounded-full items-center justify-center border border-emerald-100">
                            <Ionicons name="add" size={20} color="#059669" />
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View className="p-4 items-center border border-dashed border-slate-200 rounded-2xl">
                    <Text className="text-center text-slate-400 font-medium">
                        {people.length === 0 ? "No people in library. Add contacts in 'People' tab." : "No matching contacts found."}
                    </Text>
                </View>
            )}
        </View>
        <Text className="text-xl font-bold tracking-tight mb-4 px-1 text-slate-900">Add from Routines</Text>
        <View className="flex-row items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 mb-5 shadow-sm">
            <Ionicons name="search" size={24} color="#3b82f6" style={{ marginRight: 12 }} />
            <TextInput className="flex-1 text-slate-900 font-medium py-1" placeholder="Search your routines..." placeholderTextColor="#94a3b8" value={searchQuery} onChangeText={setSearchQuery} />
        </View>
        <View className="mb-24">
            {availableRoutines.length > 0 ? (
                availableRoutines.map(routine => (
                    <TouchableOpacity
                        key={routine.id}
                        onPress={() => addRoutineToEvent(routine.id)}
                        className="p-4 mb-3 rounded-2xl border bg-white border-slate-200 flex-row justify-between items-center shadow-sm"
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-10 h-10 rounded-xl bg-amber-100 items-center justify-center mr-3">
                                <Ionicons name="musical-notes" size={20} color="#f59e0b" />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>{routine.title}</Text>
                                <Text className="text-xs text-slate-500" numberOfLines={1}>{routine.blocks.length} Items</Text>
                            </View>
                        </View>
                        <View className="bg-emerald-50 w-8 h-8 rounded-full items-center justify-center border border-emerald-100">
                            <Ionicons name="add" size={20} color="#059669" />
                        </View>
                    </TouchableOpacity>
                ))
            ) : (
                <View className="p-4 items-center">
                    <Text className="text-center text-slate-400 font-medium">No routines found.</Text>
                </View>
            )}
        </View>
    </View>
);
