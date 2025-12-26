import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { InteractionType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

export default function PersonDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { people, interactionLogs, logInteraction, updateInteractionLog, deleteInteractionLog } = useContentStore();

    const person = people.find(p => p.id === id);

    const [showLogModal, setShowLogModal] = useState(false);
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [logNote, setLogNote] = useState('');
    const [logType, setLogType] = useState<InteractionType>('meeting');
    const [logDate, setLogDate] = useState(new Date());
    const [logDateText, setLogDateText] = useState(new Date().toISOString().split('T')[0]);

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

    const logs = (interactionLogs || [])
        .filter(l => l.personId === person.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const openCreateModal = () => {
        setEditingLogId(null);
        setLogNote('');
        setLogType('meeting');
        setLogDate(new Date());
        setLogDateText(new Date().toISOString().split('T')[0]);
        setShowLogModal(true);
    };

    const openEditModal = (log: any) => {
        setEditingLogId(log.id);
        setLogNote(log.notes || '');
        setLogType(log.type);
        setLogDate(new Date(log.date));
        setLogDateText(new Date(log.date).toISOString().split('T')[0]);
        setShowLogModal(true);
    };

    const handleSaveLog = () => {
        let finalDate: Date;

        if (Platform.OS === 'web') {
            // Fix Timezone Bug: Parse manually to create Local Midnight
            const parts = logDateText.split('-');
            if (parts.length === 3 && !isNaN(parseInt(parts[0])) && !isNaN(parseInt(parts[1])) && !isNaN(parseInt(parts[2]))) {
                finalDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            } else {
                finalDate = new Date(logDateText);
            }
        } else {
            finalDate = logDate;
        }

        // Validation
        if (isNaN(finalDate.getTime())) {
            if (Platform.OS === 'web') alert('Invalid Date Format (YYYY-MM-DD)');
            else Alert.alert('Error', 'Invalid Date');
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

    const getBadge = (type: string) => {
        switch (type) {
            case 'student': return { label: 'Student', color: 'bg-purple-100', text: '#7e22ce', icon: 'graduation-cap' };
            case 'musician': return { label: 'Musician', color: 'bg-blue-100', text: '#2563eb', icon: 'musical-notes' };
            case 'venue_manager': return { label: 'Venue Manager', color: 'bg-amber-100', text: '#b45309', icon: 'business' };
            case 'fan': return { label: 'Fan', color: 'bg-red-100', text: '#dc2626', icon: 'heart' };
            default: return { label: 'Other', color: 'bg-gray-100', text: '#4b5563', icon: 'person' };
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
                    <TouchableOpacity onPress={() => router.back()} className="mb-6 -ml-2 p-2 self-start rounded-full bg-gray-100">
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

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

                    <TouchableOpacity
                        onPress={() => router.push(`/modal/person-editor?id=${person.id}`)}
                        className="mt-6 bg-gray-100 py-3 rounded-xl items-center border border-gray-200"
                    >
                        <Text className="font-bold text-gray-700">Edit Profile</Text>
                    </TouchableOpacity>
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
                                    {log.notes && (
                                        <Text className="text-gray-700 leading-relaxed text-sm">{log.notes}</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ))}
                        {logs.length === 0 && (
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
                            <Text className="text-base font-bold mb-3 text-gray-500">Date</Text>

                            {Platform.OS === 'web' ? (
                                <View className="mb-6">
                                    <WebDatePicker date={logDateText} onChange={setLogDateText} />
                                </View>
                            ) : (
                                <View className="self-start mb-6">
                                    <DateTimePicker
                                        value={logDate}
                                        mode="date"
                                        display="default"
                                        onChange={onDateChange}
                                    />
                                </View>
                            )}

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
