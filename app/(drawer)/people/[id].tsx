import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { InteractionType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- WEB PICKER COMPONENTS ---

const WebSelect = ({ value, options, onChange, placeholder = 'Select', labelClassName = '', icon }: any) => {
    const [visible, setVisible] = useState(false);
    const selected = options.find((o: any) => o.value == value);

    // Ensure current value is represented if not in options
    const displayLabel = selected ? selected.label : (value ? value : placeholder);

    return (
        <>
            <TouchableOpacity onPress={() => setVisible(true)} className={`flex-row items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 ${labelClassName}`}>
                <Text className="font-bold text-foreground flex-1" numberOfLines={1}>{displayLabel}</Text>
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
    return (
        <View className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden shadow-sm w-full h-[50px] justify-center relative">
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

const WebTimePicker = ({ value, onChange }: { value: string, onChange: (t: string) => void }) => {
    // Value format: "HH:MM" (24h)
    const [h24, m] = value.split(':').map(Number);
    const isPM = h24 >= 12;
    const h12 = h24 % 12 || 12;

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
            <View className="flex-1 relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden h-[50px]">
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
            <View className="flex-1 relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden h-[50px]">
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
            <View className="w-20 relative bg-gray-50 border border-gray-100 rounded-xl overflow-hidden h-[50px]">
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

export default function PersonDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { people, interactionLogs, logInteraction, updateInteractionLog, deleteInteractionLog, deletePerson } = useContentStore();

    const person = people.find(p => p.id === id);

    const [showLogModal, setShowLogModal] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [logNote, setLogNote] = useState('');
    const [logType, setLogType] = useState<InteractionType>('meeting');
    const [logDate, setLogDate] = useState(new Date());
    const [logDateText, setLogDateText] = useState(new Date().toISOString().split('T')[0]);

    // Time State
    const [logTime, setLogTime] = useState('12:00');
    const [showTimePicker, setShowTimePicker] = useState(false);

    const formatDisplayTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    // Calculate timeOptions just like in event-editor
    const timeOptions = (() => {
        const opts = [];
        for (let h = 0; h < 24; h++) {
            for (let m = 0; m < 60; m += 15) {
                const val = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                opts.push({ label: formatDisplayTime(val), value: val });
            }
        }
        return opts;
    })();

    if (!person) {

        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Contact not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-600">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const allLogs = (interactionLogs || [])
        .filter(l => l.personId === person.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const isVenue = person.type === 'venue_manager';
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = isVenue
        ? allLogs.filter(l => new Date(l.date) >= thirtyDaysAgo)
        : allLogs;

    const hiddenCount = allLogs.length - logs.length;

    const openCreateModal = () => {
        setEditingLogId(null);
        setLogNote('');
        setLogType('meeting');
        const now = new Date();
        setLogDate(now);
        setLogDateText(now.toISOString().split('T')[0]);
        // Set default time to now, mostly rounded
        const h = now.getHours();
        const m = Math.round(now.getMinutes() / 15) * 15;
        // Handle roll-over if needed
        let effectiveH = h;
        let effectiveM = m;
        if (m === 60) {
            effectiveH = h + 1;
            effectiveM = 0;
        } else {
            effectiveM = m;
        }

        // Wrap hour if 24
        if (effectiveH === 24) effectiveH = 0;

        const hStr = effectiveH.toString().padStart(2, '0');
        const mStr = effectiveM.toString().padStart(2, '0');

        setLogTime(`${hStr}:${mStr}`);
        setShowLogModal(true);
    };

    const openEditModal = (log: any) => {
        setEditingLogId(log.id);
        setLogNote(log.notes || '');
        setLogType(log.type);
        const d = new Date(log.date);
        setLogDate(d);
        setLogDateText(d.toISOString().split('T')[0]);
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        setLogTime(`${h}:${m}`);
        setShowLogModal(true);
    };

    const handleSaveLog = () => {
        let finalDate: Date;

        if (Platform.OS === 'web') {
            // Combine Date Text + Time Text
            const dtString = `${logDateText}T${logTime}:00`;
            finalDate = new Date(dtString);
        } else {
            // Combine Date Object + Time String
            finalDate = new Date(logDate);
            const [hours, minutes] = logTime.split(':').map(Number);
            finalDate.setHours(hours);
            finalDate.setMinutes(minutes);
        }

        // Validation
        if (isNaN(finalDate.getTime())) {
            if (Platform.OS === 'web') alert('Invalid Date/Time');
            else Alert.alert('Error', 'Invalid Date/Time');
            return;
        }

        if (editingLogId) {
            updateInteractionLog(editingLogId, {
                date: finalDate.toISOString(),
                type: logType,
                notes: logNote,
            });
        } else {
            logInteraction({
                id: Date.now().toString(),
                personId: person.id,
                date: finalDate.toISOString(),
                type: logType,
                notes: logNote,
                createdAt: new Date().toISOString(),
            });
        }
        setShowLogModal(false);
    };

    const handleDeleteLog = () => {
        const confirm = () => {
            if (editingLogId) deleteInteractionLog(editingLogId);
            setShowLogModal(false);
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Delete this interaction?")) confirm();
        } else {
            Alert.alert("Delete Log", "Are you sure?", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: confirm }
            ]);
        }
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || logDate;
        setLogDate(currentDate);
        setLogDateText(currentDate.toISOString().split('T')[0]);
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setLogTime(`${hours}:${minutes}`);
        }
    };

    // Helper to get Date object derived from current date + time string
    const getLogTimeDate = () => {
        const [h, m] = logTime.split(':').map(Number);
        const d = new Date(logDate);
        d.setHours(h || 0);
        d.setMinutes(m || 0);
        return d;
    };

    const getBadge = (type: string) => {
        switch (type) {
            case 'student': return { label: 'Student', color: 'bg-purple-100', text: '#7e22ce', icon: 'graduation-cap' };
            case 'musician': return { label: 'Musician', color: 'bg-blue-100', text: '#2563eb', icon: 'musical-notes' };
            case 'venue_manager': return { label: 'Venue Manager', color: 'bg-amber-100', text: '#b45309', icon: 'business' };
            default: return { label: 'Other', color: 'bg-gray-100', text: '#4b5563', icon: 'person' };
        }
    };

    const handleDeleteContact = () => {
        const fullName = `${person.firstName} ${person.lastName}`;
        const confirmDelete = () => {
            deletePerson(person.id);
            router.navigate('/people');
        };
        if (Platform.OS === 'web') {
            if (confirm(`Are you sure you want to delete ${fullName}?`)) confirmDelete();
        } else {
            Alert.alert("Delete Contact", `Are you sure you want to delete ${fullName}?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: confirmDelete }
            ]);
        }
    };

    const badge = getBadge(person.type);

    const interactionTypes: { label: string, value: InteractionType, icon: string }[] = [
        { label: 'Meeting', value: 'meeting', icon: 'people' },
        { label: 'Call', value: 'call', icon: 'call' },
        { label: 'Email', value: 'email', icon: 'mail' },
        { label: 'Gig', value: 'gig', icon: 'musical-notes' },
        { label: 'Rehearsal', value: 'rehearsal', icon: 'mic' },
        { label: 'Jam Session', value: 'jam', icon: 'headset' },
        { label: 'Other', value: 'other', icon: 'ellipsis-horizontal' },
    ];

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header Profile */}
                <View className="px-6 pb-6 border-b" style={{ paddingTop: Math.max(insets.top, 20), backgroundColor: theme.headerBg, borderColor: theme.border }}>
                    <View className="flex-row justify-between items-center mb-6">
                        <TouchableOpacity
                            onPress={() => router.navigate('/people')}
                            className="-ml-2 flex-row items-center self-start rounded-full pl-2 pr-4 py-2 bg-white/10 border border-white/10"
                        >
                            <Ionicons name="chevron-back" size={20} color={theme.text} />
                            <Text className="text-sm font-bold ml-1" style={{ color: theme.text }}>Back</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className="p-2 rounded-full bg-white/10 border border-white/10"
                        >
                            <Ionicons name="home" size={20} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View className={`self-start px-3 py-1 rounded-full mb-3 flex-row items-center ${badge.color}`}>
                        <Ionicons name={badge.icon as any} size={12} color={badge.text} />
                        <Text className="text-[10px] uppercase font-black tracking-widest ml-1.5" style={{ color: badge.text }}>{badge.label}</Text>
                    </View>

                    <Text className="text-4xl font-black mb-1" style={{ color: theme.text }}>{person.firstName} {person.lastName}</Text>

                    {person.type === 'venue_manager' && person.venueName && (
                        <Text className="text-xl font-bold text-amber-700 mb-2">{person.venueName}</Text>
                    )}

                    <View className="flex-row flex-wrap gap-4 mt-2">
                        {person.email && (
                            <View className="flex-row items-center">
                                <Ionicons name="mail-outline" size={14} color={theme.mutedText} />
                                <Text className="text-sm ml-1.5 font-medium" style={{ color: theme.text }}>{person.email}</Text>
                            </View>
                        )}
                        {person.phone && (
                            <View className="flex-row items-center">
                                <Ionicons name="call-outline" size={14} color={theme.mutedText} />
                                <Text className="text-sm ml-1.5 font-medium" style={{ color: theme.text }}>{person.phone}</Text>
                            </View>
                        )}
                    </View>

                    {/* Address Section */}
                    {(person.address_line1 || person.city || person.map_link) && (
                        <View className="mt-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="location-outline" size={16} color={theme.mutedText} />
                                <Text className="text-sm font-bold ml-2" style={{ color: theme.text }}>Address</Text>
                            </View>

                            {person.address_line1 && (
                                <Text className="text-sm font-medium mb-1" style={{ color: theme.text }}>{person.address_line1}</Text>
                            )}
                            {person.address_line2 && (
                                <Text className="text-sm font-medium mb-1" style={{ color: theme.text }}>{person.address_line2}</Text>
                            )}
                            {(person.city || person.state_province || person.postal_code) && (
                                <Text className="text-sm font-medium mb-1" style={{ color: theme.text }}>
                                    {[person.city, person.state_province, person.postal_code].filter(Boolean).join(', ')}
                                </Text>
                            )}
                            {person.country && (
                                <Text className="text-sm font-medium" style={{ color: theme.text }}>{person.country}</Text>
                            )}

                            {person.map_link && (
                                <TouchableOpacity
                                    onPress={() => Linking.openURL(person.map_link!)}
                                    className="mt-3 bg-blue-600 py-2 px-4 rounded-lg flex-row items-center justify-center"
                                >
                                    <Ionicons name="map-outline" size={16} color="white" />
                                    <Text className="text-white font-bold ml-2 text-sm">View on Map</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                    <View className="flex-row gap-3 mt-6">
                        <TouchableOpacity
                            onPress={() => router.push(`/modal/person-editor?id=${person.id}`)}
                            className="flex-1 bg-gray-100 py-3 rounded-xl items-center border border-gray-200"
                        >
                            <Text className="font-bold text-gray-700">Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleDeleteContact}
                            className="px-6 py-3 rounded-xl items-center border border-red-200 bg-red-50"
                        >
                            <Ionicons name="trash-outline" size={18} color="#dc2626" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Relationship Engine */}
                <View className="p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-black" style={{ color: theme.text }}>Timeline</Text>
                        <TouchableOpacity
                            onPress={openCreateModal}
                            className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center shadow-sm"
                        >
                            <Ionicons name="add" size={16} color="white" />
                            <Text className="text-white font-bold ml-1 text-xs uppercase">Log Interaction</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Timeline Stream */}
                    <View className="relative border-l-2 border-gray-100 ml-4 space-y-8">
                        {logs.map((log) => (
                            <View key={log.id} className="ml-6 relative">
                                {/* Dot */}
                                <View className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-white border-4 border-blue-500" />

                                {/* Content - Clickable for Edit */}
                                <TouchableOpacity onPress={() => openEditModal(log)} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm active:bg-gray-50">
                                    <View className="flex-row justify-between items-center mb-2">
                                        <View className="flex-row items-center">
                                            <View className="bg-blue-50 p-1.5 rounded-md mr-2">
                                                <Ionicons name={interactionTypes.find(t => t.value === log.type)?.icon as any || 'ellipse'} size={12} color="#2563eb" />
                                            </View>
                                            <Text className="font-bold uppercase text-xs text-blue-600 tracking-wider">
                                                {interactionTypes.find(t => t.value === log.type)?.label || log.type}
                                            </Text>
                                        </View>
                                        <Text className="text-[10px] font-bold text-gray-400">
                                            {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </Text>
                                    </View>
                                    <Text className="text-xs font-bold text-gray-400 mb-2">
                                        Time: {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                    {log.notes && (
                                        <Text className="text-gray-700 leading-relaxed text-sm">{log.notes}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}

                        {hiddenCount > 0 && (
                            <View className="ml-6 mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-100 items-center shadow-sm">
                                <View className="w-8 h-8 bg-amber-100 rounded-full items-center justify-center mb-2">
                                    <Ionicons name="lock-closed" size={14} color="#b45309" />
                                </View>
                                <Text className="text-amber-900 font-bold mb-1 text-xs">Premium History</Text>
                                <Text className="text-amber-800/60 text-[10px] text-center mb-3">
                                    {hiddenCount} older interactions hidden.
                                </Text>
                                <TouchableOpacity className="bg-amber-600 px-4 py-2 rounded-full">
                                    <Text className="text-white text-[10px] font-bold uppercase">Unlock</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {allLogs.length === 0 && (
                            <View className="ml-6 py-4">
                                <Text className="text-gray-400 italic">No interactions logged yet. Start the timeline!</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Log Interaction Modal */}
            <Modal
                visible={showLogModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowLogModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 h-[80%]" style={{ paddingBottom: insets.bottom + 20 }}>
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black">{editingLogId ? 'Edit Interaction' : 'Log Interaction'}</Text>
                            <TouchableOpacity onPress={() => setShowLogModal(false)} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="flex-row gap-4 mb-6">
                                <View className="flex-1">
                                    <Text className="text-base font-bold mb-3 text-gray-500">Date</Text>
                                    {Platform.OS === 'web' ? (
                                        <WebDatePicker
                                            date={logDate.toISOString().split('T')[0]}
                                            onChange={(d) => {
                                                const date = new Date(d);
                                                if (!isNaN(date.getTime())) {
                                                    setLogDate(date);
                                                    setLogDateText(d);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <View className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                            <DateTimePicker
                                                value={logDate}
                                                mode="date"
                                                display="spinner"
                                                onChange={onDateChange}
                                                style={{ height: 120, width: '100%' }}
                                            />
                                        </View>
                                    )}
                                </View>

                                <View className="flex-1">
                                    <Text className="text-base font-bold mb-3 text-gray-500">Time</Text>
                                    {Platform.OS === 'web' ? (
                                        <WebSelect
                                            value={logTime}
                                            options={timeOptions}
                                            onChange={setLogTime}
                                            icon="time-outline"
                                        />
                                    ) : (
                                        <View>
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker(true)}
                                                className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-row justify-between items-center h-[50px] justify-center" // Matched height of WebSelect/WebDatePicker
                                            >
                                                <Text className="font-bold text-foreground text-center flex-1">{formatDisplayTime(logTime)}</Text>
                                                <Ionicons name="time-outline" size={20} color="#64748b" />
                                            </TouchableOpacity>

                                            {showTimePicker && Platform.OS === 'ios' && (
                                                <Modal transparent animationType="fade" visible={showTimePicker} onRequestClose={() => setShowTimePicker(false)}>
                                                    <View className="flex-1 bg-black/40 justify-center items-center p-6">
                                                        <View className="bg-white rounded-[40px] p-8 w-full shadow-2xl items-center">
                                                            <Text className="text-center font-black text-2xl mb-2 text-foreground">Set Time</Text>
                                                            <DateTimePicker
                                                                value={getLogTimeDate()}
                                                                mode="time"
                                                                display="spinner"
                                                                onChange={onTimeChange}
                                                                style={{ width: '100%', height: 200 }}
                                                            />
                                                            <TouchableOpacity onPress={() => setShowTimePicker(false)} className="mt-8 bg-blue-600 w-full p-5 rounded-3xl items-center shadow-lg shadow-blue-400">
                                                                <Text className="text-white font-black text-xl">Done</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                </Modal>
                                            )}
                                            {showTimePicker && Platform.OS !== 'ios' && (
                                                <DateTimePicker
                                                    value={getLogTimeDate()}
                                                    mode="time"
                                                    display="default"
                                                    is24Hour={false}
                                                    onChange={onTimeChange}
                                                />
                                            )}
                                        </View>
                                    )}
                                </View>
                            </View>

                            <Text className="text-base font-bold mb-3 text-gray-500">What kind of interaction?</Text>
                            <View className="flex-row flex-wrap gap-3 mb-6">
                                {interactionTypes.map((t) => (
                                    <TouchableOpacity
                                        key={t.value}
                                        onPress={() => setLogType(t.value)}
                                        className={`px-4 py-3 rounded-xl border flex-row items-center ${logType === t.value ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                                    >
                                        <Ionicons name={t.icon as any} size={16} color={logType === t.value ? 'white' : '#64748b'} />
                                        <Text className={`font-bold ml-2 ${logType === t.value ? 'text-white' : 'text-gray-600'}`}>{t.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-base font-bold mb-3 text-gray-500">Notes</Text>
                            <TextInput
                                className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-base h-32 mb-6"
                                placeholder="Discussed upcoming gig, sent deposit..."
                                multiline
                                textAlignVertical="top"
                                value={logNote}
                                onChangeText={setLogNote}
                            />

                            <TouchableOpacity
                                onPress={handleSaveLog}
                                className="bg-blue-600 py-4 rounded-xl items-center shadow-lg shadow-blue-200 mb-3"
                            >
                                <Text className="font-bold text-white text-lg">{editingLogId ? 'Update Log' : 'Save to Timeline'}</Text>
                            </TouchableOpacity>

                            {editingLogId && (
                                <TouchableOpacity
                                    onPress={handleDeleteLog}
                                    className="bg-red-50 py-4 rounded-xl items-center border border-red-100 mb-6"
                                >
                                    <Text className="font-bold text-red-600 text-lg">Delete Log</Text>
                                </TouchableOpacity>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
