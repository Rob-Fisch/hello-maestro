import { RosterManager } from '@/components/RosterManager';
import TransactionEditor from '@/components/TransactionEditor';
import { PAPER_THEME } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { useFinanceStore } from '@/store/financeStore';
import { useGearStore } from '@/store/gearStore';
import { AppEvent, AppEventType, BookingSlot, Person, Routine, Transaction } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
// @ts-ignore
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import { TouchableOpacity as GHTouchableOpacity } from 'react-native-gesture-handler';
import QRCode from 'react-native-qrcode-svg';


export default function EventEditor() {
    const router = useRouter();
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    // Initialize activeId from params.id. If undef (create), it stays undef until first save.
    const [activeId, setActiveId] = useState<string | undefined>(params.id as string | undefined);

    const { routines = [], events = [], people = [], addEvent, updateEvent, deleteEvent, profile } = useContentStore();
    const existingEvent = activeId ? events.find((e) => e.id === activeId) : undefined;
    const isEditing = !!existingEvent; // Derived from activeId now

    const [type, setType] = useState<AppEventType>(
        existingEvent?.type || (params.type as AppEventType) || 'performance'
    );

    const [title, setTitle] = useState(existingEvent?.title || '');
    const [venue, setVenue] = useState(existingEvent?.venue || '');
    const [date, setDate] = useState(() => {
        if (existingEvent?.date) return existingEvent.date;
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const result = `${year}-${month}-${day}`;
        return result;
    });
    const [time, setTime] = useState(existingEvent?.time || '20:00');
    const [notes, setNotes] = useState(existingEvent?.notes || '');
    const [totalFee, setTotalFee] = useState(existingEvent?.totalFee || existingEvent?.fee || '');
    const [musicianFee, setMusicianFee] = useState(existingEvent?.musicianFee || '');
    const [studentName, setStudentName] = useState(existingEvent?.studentName || '');
    const [duration, setDuration] = useState<number>(existingEvent?.duration || 60);

    // Public Stage Plot / Fan Engagement
    const [publicDescription, setPublicDescription] = useState(existingEvent?.publicDescription || '');
    const [socialLink, setSocialLink] = useState(existingEvent?.socialLink || '');
    const [showSetlist, setShowSetlist] = useState(existingEvent?.showSetlist || false);
    const [isPublicStagePlot, setIsPublicStagePlot] = useState(existingEvent?.isPublicStagePlot || false);
    const [showQrModal, setShowQrModal] = useState(false);
    const isPremium = profile?.isPremium;
    const { studentMode } = useContentStore();

    // selectedRoutineIds stores the IDs of routines (sets) for this event
    const [selectedRoutineIds, setSelectedRoutineIds] = useState<string[]>(
        existingEvent?.routines || []
    );

    // slots manages the structured roster
    const [slots, setSlots] = useState<BookingSlot[]>(
        existingEvent?.slots || []
    );

    const { packLists, addPackList, updatePackList, getPackListForEvent } = useGearStore();
    const existingPackList = activeId ? getPackListForEvent(activeId) : undefined;

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
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

    const cleanFee = (fee: string) => {
        const parsed = parseFloat(fee);
        return isNaN(parsed) || parsed <= 0 ? undefined : parsed.toFixed(2);
    };

    const performSave = (shouldExit: boolean = true, slotsOverride?: BookingSlot[]) => {
        if (!title.trim()) {
            // For auto-save (shouldExit=false), we might want to be silent if title is empty?
            // But if user hits "Exit" (which calls performSave(true) implicitly?), we might want to block?
            // Actually, "Exit" just closes.
            // Let's stick to simple validation: Title is required.
            if (shouldExit) {
                const msg = 'Please enter a title';
                if (Platform.OS === 'web') alert(msg);
                else Alert.alert('Error', msg);
            }
            return;
        }

        const eventData: AppEvent = {
            id: activeId || Date.now().toString(),
            type,
            title,
            venue,
            date: isRecurring ? startDate : date,
            time,
            routines: selectedRoutineIds,
            slots: slotsOverride || slots, // Use override if provided, else accessible state
            notes: notes.trim() || undefined,
            totalFee: cleanFee(totalFee),
            fee: cleanFee(totalFee), // Keep for backward compatibility
            musicianFee: cleanFee(musicianFee),
            studentName: type === 'lesson' ? studentName.trim() || undefined : undefined,
            isPublicStagePlot,
            publicDescription: publicDescription.trim() || undefined,
            socialLink: socialLink.trim() || undefined,
            showSetlist,
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

        if (isEditing && activeId) {
            updateEvent(activeId, eventData);
            if (existingPackList) {
                updatePackList(existingPackList.id, {
                    itemIds: selectedGearIds,
                    checkedItemIds: checkedGearIds
                });
            } else if (selectedGearIds.length > 0) {
                addPackList({
                    id: Date.now().toString() + 'pl',
                    eventId: activeId,
                    itemIds: selectedGearIds,
                    checkedItemIds: checkedGearIds,
                    additionalItems: []
                });
            }
        } else {
            const newEventId = eventData.id; // Use the ID we generated in eventData
            addEvent(eventData);

            // CRITICAL: Switch to Edit Mode immediately so subsequent saves update this event
            setActiveId(newEventId);

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

        if (shouldExit) router.back();
    };

    const handleSave = () => performSave(true);
    const saveWithoutExit = (slotsOverride?: BookingSlot[]) => performSave(false, slotsOverride);

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

    // --- AUTO-SAVE LOGIC ---
    // Debounce save for text fields
    useEffect(() => {
        // Skip initial render or empty title
        if (!title.trim()) return;

        const timer = setTimeout(() => {
            performSave(false);
        }, 1000); // 1-second debounce

        return () => clearTimeout(timer);
    }, [title, venue, notes, totalFee, musicianFee, studentName, publicDescription, socialLink]);

    // Immediate save for non-text fields (pickers, toggles, lists)
    useEffect(() => {
        if (!activeId) return; // Don't trigger on new events until title is set/saved
        performSave(false);
    }, [date, time, duration, isRecurring, startDate, daysOfWeek, showSetlist, isPublicStagePlot, selectedRoutineIds, selectedGearIds, checkedGearIds]);

    // --- HEADER CONFIG ---


    // --- Finance Integration ---
    const { transactions, addTransaction } = useFinanceStore();
    const [showTransactionEditor, setShowTransactionEditor] = useState(false);

    const relatedTransactions = useMemo(() => {
        if (!activeId) return [];
        return transactions.filter(t => t.relatedEventId === activeId);
    }, [activeId, transactions]);

    const financePaidAmount = useMemo(() => {
        return relatedTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }, [relatedTransactions]);

    const financeStatus = useMemo(() => {
        const fee = parseFloat(totalFee || musicianFee || '0');
        if (financePaidAmount <= 0) return 'unpaid';
        if (financePaidAmount >= fee && fee > 0) return 'paid';
        return 'partial';
    }, [financePaidAmount, totalFee, musicianFee]);

    const handleLogPayment = () => {
        console.log('[EventEditor] Log Payment Clicked', { activeId });
        if (!activeId) {
            const msg = 'Please save the event before logging a payment.';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Save Required', msg);
            return;
        }
        console.log('[EventEditor] Opening Transaction Editor');
        setShowTransactionEditor(true);
    };

    const handleSaveTransaction = (t: Transaction) => {
        addTransaction({
            ...t,
            relatedEventId: activeId,
            description: t.description || `Payment for ${title}`
        });
    };

    const handleDelete = () => {
        if (!activeId) return;
        deleteEvent(activeId);
        router.back();
    };


    return (
        <View className="flex-1" style={{ backgroundColor: PAPER_THEME.background }}>
            <Stack.Screen
                options={{
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} className="p-2 ml-2 flex-row items-center gap-2">
                            <Ionicons name="log-out-outline" size={24} color="#000" style={{ transform: [{ scaleX: -1 }] }} />
                            <Text className="text-base font-bold text-black">Exit</Text>
                        </TouchableOpacity>
                    ),
                    headerTitle: "",
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: PAPER_THEME.background },
                }}
            />
            <DraggableFlatList
                data={selectedRoutines}
                onDragEnd={({ data }) => setSelectedRoutineIds(data.map(r => r.id))}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={true}
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 120 }} // Increased top padding to clear header
                containerStyle={{ flex: 1, backgroundColor: '#e7e5e4' }} // Darker Stone 200 for Clear Contrast
                style={{ backgroundColor: '#e7e5e4' }}
                ListHeaderComponent={
                    <>
                        <View className="px-6 mb-4">
                            <Text className="text-3xl font-black text-stone-900 tracking-tight">{isEditing ? 'Edit Event' : 'New Event'}</Text>
                        </View>
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
                            // Finance Props
                            financeStatus={financeStatus}
                            financePaidAmount={financePaidAmount}
                            onLogPayment={handleLogPayment}
                            // Public Stage Plot Props
                            isPremium={isPremium}
                            isPublicStagePlot={isPublicStagePlot}
                            setIsPublicStagePlot={setIsPublicStagePlot}
                            publicDescription={publicDescription}
                            setPublicDescription={setPublicDescription}
                            socialLink={socialLink}
                            setSocialLink={setSocialLink}
                            showSetlist={showSetlist}
                            setShowSetlist={setShowSetlist}
                            showQrModal={showQrModal}
                            setShowQrModal={setShowQrModal}
                            eventId={activeId}
                            studentMode={studentMode}
                        />
                    </>
                }
                ListFooterComponent={
                    <View>
                        <EditorFooter
                            slots={slots} setSlots={setSlots} people={people} type={type}
                            title={title} venue={venue} isRecurring={isRecurring}
                            startDate={startDate} date={date} time={time} notes={notes}
                            setNotes={setNotes}
                            totalFee={totalFee} setTotalFee={setTotalFee}
                            musicianFee={musicianFee} setMusicianFee={setMusicianFee}
                            personSearchQuery={personSearchQuery} setPersonSearchQuery={setPersonSearchQuery}
                            availablePersonnel={availablePersonnel} searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery} availableRoutines={availableRoutines}
                            addRoutineToEvent={addRoutineToEvent}
                            selectedGearIds={selectedGearIds}
                            setSelectedGearIds={setSelectedGearIds}
                            checkedGearIds={checkedGearIds}
                            setCheckedGearIds={setCheckedGearIds}
                            onSave={saveWithoutExit}
                            studentMode={studentMode}
                        />

                        {/* Save Button Container REMOVED for Auto-Save */}
                        {/* DELETE BUTTON with Inline Confirmation */}
                        {isEditing && (
                            <View className="px-6 pb-20 pt-8">
                                {showDeleteConfirm ? (
                                    <View className="flex-row gap-3 animate-in fade-in slide-in-from-bottom-2">
                                        <TouchableOpacity
                                            onPress={() => setShowDeleteConfirm(false)}
                                            className="flex-1 p-4 rounded-2xl bg-stone-100 border border-stone-200 items-center justify-center"
                                        >
                                            <Text className="text-stone-600 font-bold text-base">Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={handleDelete}
                                            className="flex-1 p-4 rounded-2xl bg-red-500 border border-red-600 items-center justify-center shadow-sm shadow-red-200"
                                        >
                                            <Text className="text-white font-bold text-base">Confirm Delete</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        onPress={() => setShowDeleteConfirm(true)}
                                        className="p-4 rounded-2xl border border-red-200 bg-red-50 flex-row items-center justify-center gap-2"
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                        <Text className="text-red-500 font-bold text-base">Delete Event</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
                        <View style={{ height: 40 }} />
                    </View>
                }
                renderItem={({ item, drag, isActive }) => (
                    <View className="px-6">
                        <ScaleDecorator>
                            <GHTouchableOpacity
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
                            </GHTouchableOpacity>
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

            <TransactionEditor
                visible={showTransactionEditor}
                onClose={() => setShowTransactionEditor(false)}
                onSave={handleSaveTransaction}
                initialData={{
                    relatedEventId: activeId,
                    amount: 0,
                    type: 'income',
                    category: 'Gig',
                    description: `Payment for ${title}${venue ? ` at ${venue}` : ''}`,
                    id: '', date: '', createdAt: ''
                } as any}
            />
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
    // Finance Props
    financeStatus: 'unpaid' | 'paid' | 'partial';
    financePaidAmount: number;
    onLogPayment: () => void;
    // Public Stage Plot Props
    isPremium: boolean | undefined;
    isPublicStagePlot: boolean;
    setIsPublicStagePlot: (b: boolean) => void;
    publicDescription: string;
    setPublicDescription: (s: string) => void;
    socialLink: string;
    setSocialLink: (s: string) => void;
    showSetlist: boolean;
    setShowSetlist: (b: boolean) => void;
    showQrModal: boolean;
    setShowQrModal: (b: boolean) => void;
    eventId: string | undefined;
    studentMode: boolean;
}

// ---------------------------------------------------------------------------
// TIMEZONE FIX: Helpers to ensure "2026-01-07" stays "Jan 7" everywhere.
// ---------------------------------------------------------------------------

// Converts "2026-01-07" string -> Date Object (Jan 7, 00:00:00 LOCAL TIME)
// Using new Date("2026-01-07") defaults to UTC, which is why it often shows as "Yesterday".
const parseLocalDate = (dateStr: string): Date => {
    if (!dateStr) return new Date();
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d); // Month is 0-indexed in JS Date constructor
};

// Converts Date Object -> "2026-01-07" string (Using LOCAL components)
// Using .toISOString() converts to UTC, which might shift the date.
const formatLocalDate = (dateObj: Date): string => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Helper Component for consistent Date Picking (iOS Modal vs Android Native)
const DatePickerModal = ({
    visible,
    onClose,
    value,
    onChange
}: {
    visible: boolean;
    onClose: () => void;
    value: Date;
    onChange: (d: Date) => void;
}) => {
    if (!visible) return null;

    if (Platform.OS === 'android') {
        return (
            <DateTimePicker
                value={value}
                mode="date"
                display="default"
                onChange={(e, d) => {
                    onClose();
                    if (d) onChange(d);
                }}
            />
        );
    }

    // iOS Modal for Inline Picker
    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 justify-center bg-black/50 p-6">
                <View className="bg-white rounded-3xl p-4 overflow-hidden shadow-2xl">
                    <DateTimePicker
                        value={value}
                        mode="date"
                        display="inline"
                        onChange={(e, d) => {
                            if (d) onChange(d);
                        }}
                        style={{ height: 320, width: '100%' }}
                        themeVariant="light"
                    />
                    <TouchableOpacity onPress={onClose} className="bg-slate-900 p-3 rounded-xl items-center mt-2">
                        <Text className="text-white font-bold uppercase tracking-wide">Done</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    )
}

const EditorHeader = ({
    type, setType, title, setTitle, studentName, setStudentName,
    venue, setVenue, isRecurring, setIsRecurring, daysOfWeek, toggleDay,
    startDate, setStartDate, endDate, setEndDate, date, setDate,
    time, setTime, duration, setDuration, totalFee, setTotalFee,
    musicianFee, setMusicianFee, formatDisplayTime, getTimeDate, notes,
    people,
    // Finance Props
    financeStatus, financePaidAmount, onLogPayment,
    // Public Stage Plot Props
    isPremium, isPublicStagePlot, setIsPublicStagePlot,
    publicDescription, setPublicDescription, socialLink, setSocialLink,
    showSetlist, setShowSetlist,
    showQrModal, setShowQrModal, eventId, studentMode
}: HeaderProps) => {
    const router = useRouter();
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);
    // Venue Picker State
    const [showVenuePicker, setShowVenuePicker] = useState(false);
    const venueManagers = useMemo(() => people.filter(p => p.type === 'venue_manager'), [people]);

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

    const onDateChange = (selectedDate?: Date) => {
        if (selectedDate) setDate(formatLocalDate(selectedDate));
    };
    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setTime(`${hours}:${minutes}`);
        }
    };
    const onStartDateChange = (selectedDate?: Date) => {
        if (selectedDate) setStartDate(formatLocalDate(selectedDate));
    };
    const onEndDateChange = (selectedDate?: Date) => {
        if (selectedDate) setEndDate(formatLocalDate(selectedDate));
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

            {/* FINANCE STATUS / FEE SECTION (Hidden in Student Mode, and only for Performances) */
                !studentMode && type === 'performance' && (
                    isPremium ? (
                        <View className="bg-emerald-50 p-4 rounded-3xl border border-emerald-100 flex-row items-center justify-between mb-6">
                            <View>
                                <Text className="text-[10px] uppercase font-black text-emerald-600 mb-1 tracking-widest">Finance Status</Text>
                                <View className="flex-row items-baseline gap-1">
                                    <Text className={`text-2xl font-black ${financeStatus === 'paid' ? 'text-emerald-700' : 'text-emerald-900'}`}>
                                        {financeStatus === 'paid' ? 'PAID' : financeStatus === 'partial' ? 'PARTIAL' : 'UNPAID'}
                                    </Text>
                                    {financePaidAmount > 0 && (
                                        <Text className="text-xs font-bold text-emerald-600">(${financePaidAmount} collected)</Text>
                                    )}
                                </View>
                            </View>

                            {financeStatus !== 'paid' && (
                                <TouchableOpacity
                                    onPress={onLogPayment}
                                    className="rounded-full shadow-md flex-row items-center justify-center bg-green-600"
                                    style={{
                                        backgroundColor: '#16a34a',
                                        borderRadius: 100, // Force Pill
                                        paddingHorizontal: 24,
                                        paddingVertical: 12,
                                        minWidth: 160, // Give it more heft
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        elevation: 4
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Ionicons name="cash-outline" size={16} color="white" style={{ marginRight: 6 }} />
                                    <Text className="text-white font-bold text-xs uppercase tracking-wide" style={{ color: '#ffffff' }}>Log Payment</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        // LOCKED UPSELL STATE
                        <View className="bg-slate-50 p-4 rounded-3xl border border-slate-200 flex-row items-center justify-between mb-6">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-slate-200 items-center justify-center">
                                    <Ionicons name="lock-closed" size={18} color="#64748b" />
                                </View>
                                <View>
                                    <Text className="text-[10px] uppercase font-black text-slate-400 mb-1 tracking-widest">Finance Tracking</Text>
                                    <Text className="text-lg font-bold text-slate-700">Track Payments</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => router.push('/modal/upgrade?feature=order')}
                                className="bg-slate-900 px-5 py-3 rounded-full shadow-sm"
                            >
                                <Text className="text-white font-black text-xs uppercase tracking-wide">Unlock</Text>
                            </TouchableOpacity>
                        </View>
                    )
                )}

            <View className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm mb-6">
                <View className="mb-5">
                    <Text className="text-[10px] uppercase font-black text-slate-600 mb-1 tracking-widest">Event Title</Text>
                    <TextInput
                        className="text-2xl font-bold text-slate-900"
                        placeholder={type === 'lesson' ? 'Weekly Sax Lesson' : 'Summer Festival...'}
                        placeholderTextColor="#475569"
                        style={{ fontStyle: title ? 'normal' : 'italic' }}
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {type === 'lesson' && (
                    <View className="mb-5">
                        <Text className="text-[10px] uppercase font-black text-purple-700 mb-1 tracking-widest">Student Name</Text>
                        <TextInput
                            className="text-lg font-semibold text-slate-900"
                            placeholder="John Doe"
                            placeholderTextColor="#475569"
                            style={{ fontStyle: studentName ? 'normal' : 'italic' }}
                            value={studentName}
                            onChangeText={setStudentName}
                        />
                    </View>
                )}

                <View className="mb-5">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-[10px] uppercase font-black text-slate-600 tracking-widest">Venue / Location</Text>
                        <TouchableOpacity onPress={() => setShowVenuePicker(true)} className="flex-row items-center">
                            <Ionicons name="people-circle-outline" size={16} color="#2563eb" />
                            <Text className="text-10px font-bold text-blue-600 ml-1">Select from Contacts</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        className="text-lg font-semibold text-slate-900"
                        placeholder={type === 'lesson' ? 'Studio / Zoom' : 'The Jazz Corner'}
                        placeholderTextColor="#475569"
                        style={{ fontStyle: venue ? 'normal' : 'italic' }}
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
                                            <Text className="font-bold text-slate-900 text-xs">
                                                {parseLocalDate(startDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                            </Text>
                                            <Text className="text-xs">📅</Text>
                                        </TouchableOpacity>
                                        <DatePickerModal
                                            visible={showStartDatePicker}
                                            value={parseLocalDate(startDate)}
                                            onClose={() => setShowStartDatePicker(false)}
                                            onChange={onStartDateChange}
                                        />
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
                                            <Text className="font-bold text-slate-900 text-xs">
                                                {parseLocalDate(endDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                            </Text>
                                            <Text className="text-xs">📅</Text>
                                        </TouchableOpacity>
                                        <DatePickerModal
                                            visible={showEndDatePicker}
                                            value={parseLocalDate(endDate)}
                                            onClose={() => setShowEndDatePicker(false)}
                                            onChange={onEndDateChange}
                                        />
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
                                        <Text className="font-bold text-slate-900">
                                            {parseLocalDate(date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                                        </Text>
                                        <Text>📅</Text>
                                    </TouchableOpacity>
                                    <DatePickerModal
                                        visible={showDatePicker}
                                        value={parseLocalDate(date)}
                                        onClose={() => setShowDatePicker(false)}
                                        onChange={onDateChange}
                                    />
                                </>
                            )}
                        </View>
                    </View>
                )}


                {/* FAN ENGAGEMENT SECTION (PRO / UPSELL) - Hidden in Student Mode, only for Performances */}
                {!studentMode && type === 'performance' && (
                    <View className="mb-8 p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden relative">
                        <View className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />

                        <View className="flex-row items-center mb-4">
                            <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 shadow-lg ${isPremium ? 'bg-indigo-500 shadow-indigo-500/30' : 'bg-slate-700'}`}>
                                <Ionicons name={isPremium ? "qr-code" : "lock-closed"} size={20} color="white" />
                            </View>
                            <View>
                                <Text className="font-black text-white text-lg">Digital Stage Plot</Text>
                                <Text className="text-indigo-200 text-xs font-medium">Public Event Page for Fans</Text>
                            </View>
                        </View>

                        {isPremium ? (
                            <>
                                <View className="flex-row items-center justify-between mb-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                                    <Text className="text-slate-300 font-bold text-sm">Enable Public Page</Text>
                                    <TouchableOpacity
                                        onPress={() => setIsPublicStagePlot(!isPublicStagePlot)}
                                        className={`w-12 h-7 rounded-full justify-center ${isPublicStagePlot ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                    >
                                        <View className={`w-5 h-5 bg-white rounded-full shadow-sm mx-1 ${isPublicStagePlot ? 'self-end' : 'self-start'}`} />
                                    </TouchableOpacity>
                                </View>

                                {isPublicStagePlot && (
                                    <View>
                                        <View className="mb-4">
                                            <Text className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Public Description</Text>
                                            <TextInput
                                                className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700 min-h-[80px]"
                                                placeholder="Thanks for coming! Tip us below..."
                                                placeholderTextColor="#64748b"
                                                multiline
                                                value={publicDescription}
                                                onChangeText={setPublicDescription}
                                            />
                                        </View>

                                        <View className="mb-4">
                                            <Text className="text-[10px] uppercase font-black text-slate-500 mb-1 tracking-widest">Band Website</Text>
                                            <TextInput
                                                className="bg-slate-800 text-white p-3 rounded-xl border border-slate-700"
                                                placeholder="https://myband.com"
                                                placeholderTextColor="#64748b"
                                                autoCapitalize="none"
                                                value={socialLink}
                                                onChangeText={setSocialLink}
                                            />
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => setShowSetlist(!showSetlist)}
                                            className="flex-row items-center mb-6"
                                        >
                                            <View className={`w-5 h-5 rounded-md border mr-2 items-center justify-center ${showSetlist ? 'bg-indigo-500 border-indigo-500' : 'border-slate-600'}`}>
                                                {showSetlist && <Ionicons name="checkmark" size={14} color="white" />}
                                            </View>
                                            <Text className="text-slate-300 text-sm font-bold">Show Setlist on Page</Text>
                                        </TouchableOpacity>

                                        <View className="flex-row gap-3">
                                            <TouchableOpacity
                                                onPress={() => setShowQrModal(true)}
                                                className="flex-1 bg-white py-3 rounded-xl items-center flex-row justify-center"
                                            >
                                                <Ionicons name="qr-code-outline" size={18} color="black" style={{ marginRight: 8 }} />
                                                <Text className="text-black font-black text-xs uppercase tracking-wide">View QR</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    const url = eventId ? `https://opusmode.net/fan/${eventId}` : 'Save event first';
                                                    await Clipboard.setStringAsync(url);
                                                    Alert.alert("Copied", "Link copied to clipboard.");
                                                }}
                                                className="flex-1 bg-slate-800 border border-slate-700 py-3 rounded-xl items-center flex-row justify-center"
                                            >
                                                <Ionicons name="link-outline" size={18} color="white" style={{ marginRight: 8 }} />
                                                <Text className="text-white font-bold text-xs uppercase tracking-wide">Copy Link</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
                            </>
                        ) : (
                            // UPSELL STATE
                            <View className="bg-slate-800/30 p-4 rounded-xl border border-slate-700/50">
                                <Text className="text-slate-400 text-sm mb-4 leading-relaxed">
                                    Create a stunning public page for your gig. Share setlists, collect tips, and grow your fanbase with a single QR code.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => router.push('/modal/upgrade?feature=glory')}
                                    className="bg-white py-3 rounded-xl items-center shadow-lg shadow-white/10"
                                >
                                    <Text className="text-black font-black text-xs uppercase tracking-widest">Unlock with Pro</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}

                {/* QR MODAL */}
                <Modal visible={showQrModal} animationType="fade" transparent>
                    <View className="flex-1 bg-black/90 justify-center items-center p-6">
                        <View className="bg-white p-8 rounded-3xl items-center w-full max-w-[320px]">
                            <Text className="text-2xl font-black mb-2 text-center">{title || 'Untitled Event'}</Text>
                            <Text className="text-slate-500 font-bold mb-6 text-center">{venue}</Text>

                            <View className="mb-8 p-2 border-4 border-black rounded-xl">
                                {eventId ? (
                                    <QRCode
                                        value={`https://opusmode.net/fan/${eventId}`}
                                        size={200}
                                    />
                                ) : (
                                    <Text>Save Event to Generate QR</Text>
                                )}
                            </View>

                            <Text className="text-center text-xs text-slate-400 mb-6 px-4">
                                Fans can scan this to see the setlist, bio, and tipping links.
                            </Text>

                            <TouchableOpacity
                                onPress={() => setShowQrModal(false)}
                                className="bg-black w-full py-4 rounded-xl items-center"
                            >
                                <Text className="text-white font-black uppercase text-sm">Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

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
                </View>
            </View>

            {/* List Footer is rendered by the parent DraggableFlatList */}
        </View>
    );
};


// EditorFooter Component
const EditorFooter = ({ slots, setSlots, people, type, title, venue, isRecurring, startDate, date, time, notes, setNotes, totalFee, setTotalFee, musicianFee, setMusicianFee, personSearchQuery, setPersonSearchQuery, availablePersonnel, searchQuery, setSearchQuery, availableRoutines, addRoutineToEvent, selectedGearIds, setSelectedGearIds, checkedGearIds, setCheckedGearIds, onSave, studentMode }: any) => {

    // UI State for Progressive Disclosure
    const [trackPersonnel, setTrackPersonnel] = useState(slots && slots.length > 0);


    return (
        <View className="p-6 pt-0">
            {/* Financials & Notes (Hidden in Student Mode) */}
            {!studentMode && !['lesson', 'rehearsal'].includes(type) && (
                <View className="mb-8">
                    <Text className="text-xl font-black text-slate-900 mb-4">Notes & Financials</Text>
                    <View className="bg-white p-6 rounded-[32px] border border-slate-200 shadow-sm">
                        <Text className="text-[10px] uppercase font-bold text-slate-600 mb-2">Private Notes</Text>
                        <TextInput
                            className="text-base text-slate-800 min-h-[100px] mb-6"
                            placeholder="Load-in details, parking info, setlist notes..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            textAlignVertical="top"
                            placeholderTextColor="#475569"
                            style={{ fontStyle: notes ? 'normal' : 'italic' }}
                        />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-bold text-slate-600 mb-1">Agreed Fee ($)</Text>
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="number"
                                        className="w-full text-xl font-mono font-bold py-1 border-b border-slate-200 text-green-700 bg-transparent outline-none"
                                        value={totalFee}
                                        onChange={(e) => setTotalFee(e.target.value)}
                                        placeholder="0.00"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                ) : (
                                    <TextInput
                                        className="text-xl font-mono font-bold py-1 border-b border-slate-200 text-green-700"
                                        value={totalFee}
                                        onChangeText={setTotalFee}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                        placeholderTextColor="#475569"
                                        style={{ fontStyle: totalFee ? 'normal' : 'italic' }}
                                    />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-bold text-slate-600 mb-1">Per-Musician ($)</Text>
                                {Platform.OS === 'web' ? (
                                    <input
                                        type="number"
                                        className="w-full text-xl font-mono font-bold py-1 border-b border-slate-200 text-slate-700 bg-transparent outline-none"
                                        value={musicianFee}
                                        onChange={(e) => setMusicianFee(e.target.value)}
                                        placeholder="0.00"
                                        style={{ fontFamily: 'monospace' }}
                                    />
                                ) : (
                                    <TextInput
                                        className="text-xl font-mono font-bold py-1 border-b border-slate-200 text-slate-700"
                                        value={musicianFee}
                                        onChangeText={setMusicianFee}
                                        keyboardType="numeric"
                                        placeholder="0.00"
                                        placeholderTextColor="#475569"
                                        style={{ fontStyle: musicianFee ? 'normal' : 'italic' }}
                                    />
                                )}
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Roster Section - Hidden for Lessons, Optional for others */}
            {type !== 'lesson' && (
                <View className="mb-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-xl font-black text-slate-900">Personnel & Roster</Text>
                        <View className="flex-col items-end gap-2">
                            <View className="flex-row items-center gap-2">
                                <Text className="text-xs font-bold text-slate-500 uppercase">Track Members?</Text>
                                <Switch
                                    value={trackPersonnel}
                                    onValueChange={setTrackPersonnel}
                                    trackColor={{ false: '#e2e8f0', true: '#2563eb' }}
                                    thumbColor={'#ffffff'}
                                />
                            </View>

                        </View>
                    </View>

                    {trackPersonnel && (
                        <View>
                            <RosterManager
                                slots={slots}
                                onUpdateSlots={setSlots}
                                availablePeople={people}
                                event={{ title, date, time, type, venue, musicianFee }}
                                onSave={onSave}
                            />
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

