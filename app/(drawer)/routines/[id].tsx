import { useContentStore } from '@/store/contentStore';
import { exportToPdf } from '@/utils/pdfExport';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// --- WEB PICKER COMPONENTS ---
const WebSelect = ({ value, options, onChange, placeholder = 'Select', labelClassName = '', icon, formatDisplay }: any) => {
    const [visible, setVisible] = useState(false);
    const selected = options.find((o: any) => o.value == value);
    const displayLabel = selected ? selected.label : (value ? (formatDisplay ? formatDisplay(value) : value) : placeholder);

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

const WebDatePicker = ({ date, onChange }: { date?: string, onChange: (d: string) => void }) => {
    return (
        <View className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm w-full h-[50px] justify-center relative">
            <input
                type="date"
                value={date}
                onChange={(e) => onChange(e.target.value)}
                onClick={(e) => {
                    try { if (typeof e.currentTarget.showPicker === 'function') e.currentTarget.showPicker(); else e.currentTarget.focus(); } catch (err) { e.currentTarget.focus(); }
                }}
                style={{
                    position: 'absolute', inset: 0, padding: 12, fontSize: 16, border: 'none', background: 'transparent',
                    width: '100%', height: '100%', fontFamily: 'inherit', fontWeight: 600, color: '#0f172a',
                    appearance: 'none', WebkitAppearance: 'none'
                }}
            />
        </View>
    );
};

export default function CollectionDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { routines, updateRoutine, progress, updateProgress, settings, logSession, sessionLogs, profile } = useContentStore();

    const routine = routines.find(r => r.id === id);

    const [showExportModal, setShowExportModal] = useState(false);
    const [showLogModal, setShowLogModal] = useState(false);
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [includeTOC, setIncludeTOC] = useState(settings.includeTOC);

    // Session Log State
    const [sessionNotes, setSessionNotes] = useState('');
    const [sessionRating, setSessionRating] = useState(3);
    const [sessionDate, setSessionDate] = useState(new Date());
    const [sessionDateText, setSessionDateText] = useState(new Date().toISOString().split('T')[0]);

    // Time State
    const [sessionTime, setSessionTime] = useState('12:00');
    const [showTimePicker, setShowTimePicker] = useState(false);

    useEffect(() => {
        setIncludeTOC(settings.includeTOC);
    }, [settings.includeTOC]);

    const formatDisplayTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

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

    if (!routine) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-950">
                <Text className="text-white font-bold text-lg">Collection not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white/10 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const isPublic = !!(routine as any).isPublic;

    const completedBlocks = routine.blocks.filter(b =>
        progress.some(p => p.pathId === routine.id && p.nodeId === b.id)
    );
    const progressPercent = routine.blocks.length > 0
        ? Math.round((completedBlocks.length / routine.blocks.length) * 100)
        : 0;

    const handleToggleComplete = (blockId: string) => {
        const isComplete = progress.some(p => p.pathId === routine.id && p.nodeId === blockId);
        updateProgress(routine.id, blockId, !isComplete);
    };

    const handleConfirmExport = async () => {
        setShowExportModal(false);
        setTimeout(() => {
            exportToPdf(routine, { ...settings, includeTOC }, profile?.displayName);
        }, 300);
    };

    const openLogModal = () => {
        const now = new Date();
        setSessionDate(now);
        setSessionDateText(now.toISOString().split('T')[0]);
        setSessionNotes('');
        setSessionRating(3);
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        setSessionTime(`${h}:${m}`);
        setShowLogModal(true);
    };

    const handleLogSession = () => {
        const completedCount = routine.blocks.filter(b =>
            progress.some(p => p.pathId === routine.id && p.nodeId === b.id)
        ).length;

        let finalDate: Date;
        if (Platform.OS === 'web') {
            const dtString = `${sessionDateText}T${sessionTime}:00`;
            finalDate = new Date(dtString);
        } else {
            finalDate = new Date(sessionDate);
            const [h, m] = sessionTime.split(':').map(Number);
            finalDate.setHours(h);
            finalDate.setMinutes(m);
        }

        logSession({
            id: Date.now().toString(),
            routineId: routine.id,
            date: finalDate.toISOString(),
            notes: sessionNotes,
            rating: sessionRating,
            itemsCompletedCount: completedCount,
            totalItemsCount: routine.blocks.length,
        });

        setShowLogModal(false);
        setSessionNotes('');
        setSessionRating(3);

        const now = new Date();
        setSessionDate(now);
        setSessionDateText(now.toISOString().split('T')[0]);
        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');
        setSessionTime(`${h}:${m}`);

        Alert.alert('Session Logged', 'Your progress has been saved!');
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || sessionDate;
        setSessionDate(currentDate);
        setSessionDateText(currentDate.toISOString().split('T')[0]);
    };

    const onTimeChange = (event: any, selectedTime?: Date) => {
        if (Platform.OS === 'android') setShowTimePicker(false);
        if (selectedTime) {
            const hours = selectedTime.getHours().toString().padStart(2, '0');
            const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
            setSessionTime(`${hours}:${minutes}`);
        }
    };

    const getSessionTimeDate = () => {
        const [h, m] = sessionTime.split(':').map(Number);
        const d = new Date(sessionDate);
        d.setHours(h || 0);
        d.setMinutes(m || 0);
        return d;
    };

    return (
        <View className="flex-1 bg-slate-950">
            {/* Fixed Header (Navigation Only) */}
            <View className="px-6 pt-12 pb-4 bg-slate-950 z-10">
                <View className="flex-row justify-between items-start">
                    <TouchableOpacity onPress={() => router.navigate('/routines')} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/modal/routine-editor', params: { id: routine.id } })}
                            className="bg-white/10 px-3 py-2 rounded-lg flex-row items-center border border-white/10"
                        >
                            <Ionicons name="create-outline" size={16} color="#60a5fa" />
                            <Text className="text-xs font-bold ml-1.5 text-white">Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                const hasMedia = routine.blocks.some(b => !!b.mediaUri);
                                if (hasMedia) {
                                    Alert.alert(
                                        'Cannot Copy Collection',
                                        'This collection contains user-uploaded files. To prevent copyright infringement, copying is disabled for collections with media attachments.'
                                    );
                                    return;
                                }

                                Alert.alert(
                                    'Save to Library',
                                    'Save a copy of this collection to your library?',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Save Copy',
                                            style: 'default',
                                            onPress: () => {
                                                const { duplicateRoutine } = useContentStore.getState();
                                                const newId = duplicateRoutine(routine.id);
                                                if (newId) {
                                                    Alert.alert('Success', 'Collection saved to your library!');
                                                    router.push(`/routines/${newId}`); // Navigate to new copy
                                                }
                                            }
                                        }
                                    ]
                                );
                            }}
                            className="bg-white/10 px-3 py-2 rounded-lg flex-row items-center border border-white/10"
                        >
                            <Ionicons name="copy-outline" size={16} color="#fbbf24" />
                            <Text className="text-xs font-bold ml-1.5 text-white">Save Copy</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowExportModal(true)}
                            className="bg-white/10 px-3 py-2 rounded-lg flex-row items-center border border-white/10"
                        >
                            <Ionicons name="download-outline" size={16} color="#c084fc" />
                            <Text className="text-xs font-bold text-white ml-1.5">Export Set</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Export Modal (Light Mode for Forms) */}
            <Modal
                transparent
                visible={showExportModal}
                animationType="fade"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View className="flex-1 bg-black/80 justify-center items-center p-6">
                    <View className="bg-white p-6 rounded-[32px] w-full max-w-sm">
                        <View className="items-center mb-4">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                                <Ionicons name="print-outline" size={24} color="#2563eb" />
                            </View>
                            <Text className="text-xl font-black text-center text-slate-900">Export Set List</Text>
                            <Text className="text-gray-500 text-center mt-2 text-sm leading-relaxed">
                                Generating a single, combined PDF file of all charts in this collection.
                            </Text>
                        </View>

                        <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                            <TouchableOpacity
                                onPress={() => setIncludeTOC(!includeTOC)}
                                className="flex-row items-center justify-between"
                            >
                                <View>
                                    <Text className="font-bold text-gray-900">Table of Contents</Text>
                                    <Text className="text-xs text-gray-400">Add an index page at the start</Text>
                                </View>
                                <View className={`w-12 h-7 rounded-full justify-center px-1 ${includeTOC ? 'bg-blue-600' : 'bg-gray-300'}`}>
                                    <View className={`w-5 h-5 bg-white rounded-full shadow-sm ${includeTOC ? 'self-end' : 'self-start'}`} />
                                </View>
                            </TouchableOpacity>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                onPress={() => setShowExportModal(false)}
                                className="flex-1 bg-gray-100 py-3 rounded-xl items-center"
                            >
                                <Text className="font-bold text-gray-600">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleConfirmExport}
                                className="flex-1 bg-slate-900 py-3 rounded-xl items-center shadow-md shadow-slate-900/20"
                            >
                                <Text className="font-bold text-white">Export</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Log Session Modal (Light Mode for Forms) */}
            <Modal
                transparent
                visible={showLogModal}
                animationType="slide"
                onRequestClose={() => setShowLogModal(false)}
            >
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 h-[90%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-slate-900">Log Session</Text>
                            <TouchableOpacity onPress={() => setShowLogModal(false)} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="bg-gray-50 p-6 rounded-2xl mb-6 items-center">
                                <Text className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Items Completed</Text>
                                <Text className="text-4xl font-black text-slate-900">
                                    {routine.blocks.filter(b => progress.some(p => p.pathId === routine.id && p.nodeId === b.id)).length}
                                    <Text className="text-xl text-gray-400"> / {routine.blocks.length}</Text>
                                </Text>
                            </View>

                            <View className="flex-row gap-4 mb-6">
                                <View className="flex-1">
                                    <Text className="text-base font-bold mb-3 text-gray-500">Date</Text>
                                    {Platform.OS === 'web' ? (
                                        <WebDatePicker
                                            date={sessionDate.toISOString().split('T')[0]}
                                            onChange={(d) => {
                                                const date = new Date(d);
                                                if (!isNaN(date.getTime())) {
                                                    setSessionDate(date);
                                                    setSessionDateText(d);
                                                }
                                            }}
                                        />
                                    ) : (
                                        <View className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                                            <DateTimePicker
                                                value={sessionDate}
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
                                            value={sessionTime}
                                            options={timeOptions}
                                            onChange={setSessionTime}
                                            icon="time-outline"
                                            formatDisplay={formatDisplayTime}
                                        />
                                    ) : (
                                        <View>
                                            <TouchableOpacity
                                                onPress={() => setShowTimePicker(true)}
                                                className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex-row justify-between items-center h-[50px] justify-center"
                                            >
                                                <Text className="font-bold text-slate-900 text-center flex-1">{formatDisplayTime(sessionTime)}</Text>
                                                <Ionicons name="time-outline" size={20} color="#64748b" />
                                            </TouchableOpacity>

                                            {showTimePicker && Platform.OS === 'ios' && (
                                                <Modal transparent animationType="fade" visible={showTimePicker} onRequestClose={() => setShowTimePicker(false)}>
                                                    <View className="flex-1 bg-black/40 justify-center items-center p-6">
                                                        <View className="bg-white rounded-[40px] p-8 w-full shadow-2xl items-center">
                                                            <Text className="text-center font-black text-2xl mb-2 text-foreground">Set Time</Text>
                                                            <DateTimePicker
                                                                value={getSessionTimeDate()}
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
                                                    value={getSessionTimeDate()}
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

                            <Text className="text-lg font-bold mb-3 text-slate-900">How did it feel?</Text>
                            <View className="flex-row justify-between mb-6 bg-gray-50 p-4 rounded-xl">
                                {[1, 2, 3, 4, 5].map(star => (
                                    <TouchableOpacity key={star} onPress={() => setSessionRating(star)}>
                                        <Ionicons
                                            name={star <= sessionRating ? "star" : "star-outline"}
                                            size={40}
                                            color={star <= sessionRating ? "#fbbf24" : "#cbd5e1"}
                                        />
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <Text className="text-lg font-bold mb-3 text-slate-900">Session Notes</Text>
                            <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 h-40">
                                <ScrollView>
                                    <TextInput
                                        className="text-base text-gray-800 leading-relaxed"
                                        placeholder="I hit a wall today... / This was easy..."
                                        multiline
                                        value={sessionNotes}
                                        onChangeText={setSessionNotes}
                                        scrollEnabled={false}
                                    />
                                </ScrollView>
                            </View>

                            <View className="h-20" />
                        </ScrollView>

                        <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100">
                            <TouchableOpacity
                                onPress={handleLogSession}
                                className="bg-slate-900 py-4 rounded-2xl items-center shadow-lg shadow-slate-900/20"
                            >
                                <Text className="font-bold text-white text-lg">Save Log & Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* History Modal (Light Mode for List) */}
            <Modal
                transparent
                visible={showHistoryModal}
                animationType="slide"
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View className="flex-1 bg-black/80 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black text-slate-900">Session History</Text>
                            <TouchableOpacity onPress={() => setShowHistoryModal(false)} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {(sessionLogs || [])
                                .filter(l => l.routineId === routine.id)
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .map((log) => (
                                    <View key={log.id} className="bg-gray-50 p-5 rounded-2xl mb-4 border border-gray-100">
                                        <View className="flex-row justify-between items-center mb-3">
                                            <Text className="text-gray-500 font-bold text-xs uppercase">
                                                {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                            <View className="flex-row">
                                                {[1, 2, 3, 4, 5].map(s => (
                                                    <Ionicons key={s} name="star" size={12} color={s <= (log.rating || 0) ? "#fbbf24" : "#e2e8f0"} />
                                                ))}
                                            </View>
                                        </View>

                                        <View className="flex-row items-baseline mb-3">
                                            <Text className="text-2xl font-black text-gray-900 mr-1">{log.itemsCompletedCount}</Text>
                                            <Text className="text-sm font-bold text-gray-400">/ {log.totalItemsCount} items</Text>
                                        </View>

                                        {log.notes ? (
                                            <View className="bg-white p-3 rounded-xl border border-gray-100">
                                                <Text className="text-gray-700 italic leading-snug">"{log.notes}"</Text>
                                            </View>
                                        ) : null}
                                    </View>
                                ))
                            }
                            {sessionLogs?.filter(l => l.routineId === routine.id).length === 0 && (
                                <View className="items-center py-10">
                                    <Text className="text-gray-400 font-medium">No sessions logged yet.</Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <ScrollView className="flex-1 px-6 pt-0" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Scrollable Header Content */}
                <View className="mb-8 border-b border-white/10 pb-6">
                    <View className="mb-4">
                        <Text className="text-3xl font-black tracking-tight mb-2 text-white">{routine.title}</Text>
                        {routine.description && (
                            <Text className="text-base text-slate-400 leading-relaxed">{routine.description}</Text>
                        )}
                    </View>

                    <View className="flex-row justify-between items-center mt-2">
                        <View className={`flex-row items-center px-3 py-1.5 rounded-full border ${isPublic ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/5 border-white/10'} `}>
                            <Ionicons name={isPublic ? "earth" : "lock-closed"} size={12} color={isPublic ? "#60a5fa" : "#94a3b8"} />
                            <Text className={`text-xs font-bold ml-1.5 ${isPublic ? 'text-blue-400' : 'text-slate-400'} `}>
                                {isPublic ? 'Shareable' : 'Private'}
                            </Text>
                        </View>

                        <View className="flex-row gap-2">
                            <TouchableOpacity onPress={() => setShowHistoryModal(true)} className="flex-row items-center bg-white/10 px-3 py-2 rounded-full border border-white/10">
                                <Ionicons name="time" size={16} color="#fbbf24" />
                                <Text className="text-xs font-bold ml-1.5 uppercase text-white">History</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={openLogModal} className="flex-row items-center bg-white px-4 py-2 rounded-full shadow-lg shadow-white/10">
                                <Ionicons name="checkbox" size={16} color="#059669" />
                                <Text className="text-xs font-bold text-slate-900 ml-1.5 uppercase">Log Session</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="mt-8">
                        <View className="flex-row justify-between mb-2">
                            <Text className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Progress</Text>
                            <Text className="text-xs font-bold text-white">{progressPercent}%</Text>
                        </View>
                        <View className="h-1 bg-white/10 rounded-full overflow-hidden">
                            <View
                                className="h-full bg-white rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </View>
                    </View>
                </View>

                <View className="mb-6 bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 max-w-md">
                    <Text className="text-blue-200 font-bold text-xs mb-1">How to Track Progress</Text>
                    <Text className="text-blue-100/60 text-xs leading-relaxed">
                        Track your activities below. Each time you go through the routine, tap <Text className="text-white font-bold">Log Session</Text> above to save your history.
                    </Text>
                </View>

                {routine.blocks.map((block, index) => {
                    const isComplete = progress.some(p => p.pathId === routine.id && p.nodeId === block.id);
                    return (
                        <TouchableOpacity
                            key={block.id}
                            onPress={() => handleToggleComplete(block.id)}
                            className={`mb-4 p-4 rounded-2xl border flex-row items-center shadow-md ${isComplete ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'} `}
                        >
                            <View className={`w-8 h-8 rounded-full border-2 items-center justify-center mr-4 ${isComplete ? 'border-emerald-500 bg-emerald-500' : 'border-white/30 bg-transparent'} `}>
                                {isComplete && <Ionicons name="checkmark" size={18} color="white" />}
                            </View>

                            <View className="flex-1">
                                <Text className={`text-base font-bold mb-1 ${isComplete ? 'text-emerald-400' : 'text-white'} `}>
                                    {block.title}
                                </Text>
                                <View className="flex-row items-center">
                                    <View className="bg-white/10 px-2 py-0.5 rounded text-[10px] mr-2">
                                        <Text className="text-[10px] text-white/70 font-bold uppercase">{block.type.replace('_', ' ')}</Text>
                                    </View>
                                    {block.mediaUri && (
                                        <Ionicons name="attach" size={12} color="#a855f7" />
                                    )}
                                </View>
                            </View>

                            {(block.mediaUri || block.linkUrl) && (
                                <TouchableOpacity
                                    className="p-2 bg-white/10 rounded-full"
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        if (block.linkUrl) Linking.openURL(block.linkUrl);
                                        else Alert.alert('File', 'File viewing logic here');
                                    }}
                                >
                                    <Ionicons name="open-outline" size={16} color="#38bdf8" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
