import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { exportToPdf } from '@/utils/pdfExport';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CollectionDetail() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const theme = useTheme();
    const { routines, updateRoutine, progress, updateProgress, settings, logSession, sessionLogs } = useContentStore();

    const routine = routines.find(r => r.id === id);

    if (!routine) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Collection not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4">
                    <Text className="text-blue-600">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Public/Private State (Gatekeeper)
    // We assume routines have an 'isPublic' field. If not, we might need to add it to the type.
    // For now, let's treat it as a concept we enforce, even if the DB field is missing (we can use description tag or similar, or just add the field).
    // WAIT: Routine type currently DOES NOT have isPublic. 
    // I will add it to the type definition in a separate step or just mock it for now.
    // Let's assume we maintain it in the store/DB. For now, I'll mock it or use a custom tag.
    // UPDATE: I will use a local state that pretends until we update Schema. 
    // actually, let's just assume we will add it. I'll use 'isPublic' property casted.
    const isPublic = !!(routine as any).isPublic;

    // Progress Logic
    // ... later in the file ...


    // Progress Logic
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

    const handleResetProgress = () => {
        Alert.alert(
            'Reset Progress',
            'Uncheck all items in this collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => {
                        routine.blocks.forEach(b => updateProgress(routine.id, b.id, false));
                    }
                }
            ]
        );
    };

    const [showExportModal, setShowExportModal] = React.useState(false);
    const [showLogModal, setShowLogModal] = React.useState(false);
    const [showHistoryModal, setShowHistoryModal] = React.useState(false);
    const [includeTOC, setIncludeTOC] = React.useState(settings.includeTOC);

    // Session Log State
    const [sessionNotes, setSessionNotes] = React.useState('');
    const [sessionRating, setSessionRating] = React.useState(3); // Default 3 stars

    // Sync local toggle with global settings on mount/change
    React.useEffect(() => {
        setIncludeTOC(settings.includeTOC);
    }, [settings.includeTOC]);

    const handleConfirmExport = async () => {
        setShowExportModal(false);
        // Slight delay to allow modal to close before heavy PDF gen (prevents UI stutter)
        setTimeout(() => {
            exportToPdf(routine, { ...settings, includeTOC });
        }, 300);
    };

    const handleLogSession = () => {
        const completedCount = routine.blocks.filter(b =>
            progress.some(p => p.pathId === routine.id && p.nodeId === b.id)
        ).length;

        logSession({
            id: Date.now().toString(),
            routineId: routine.id,
            date: new Date().toISOString(),
            notes: sessionNotes,
            rating: sessionRating,
            itemsCompletedCount: completedCount,
            totalItemsCount: routine.blocks.length,
        });

        setShowLogModal(false);
        setSessionNotes('');
        setSessionRating(3);
        Alert.alert('Session Logged', 'Your progress has been saved and the checklist is ready for your next session!');
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="px-6 pt-12 pb-4 border-b" style={{ borderColor: theme.border, backgroundColor: theme.headerBg }}>
                <View className="flex-row justify-between items-start mb-4">
                    {/* Fixed Navigation: Always go to Routines list */}
                    <TouchableOpacity onPress={() => router.navigate('/routines')} className="p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        {/* Edit Button (Labeled) */}
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/modal/routine-editor', params: { id: routine.id } })}
                            className="bg-gray-100 px-3 py-2 rounded-lg flex-row items-center border border-gray-200"
                        >
                            <Ionicons name="create-outline" size={16} color={theme.text} />
                            <Text className="text-xs font-bold ml-1.5" style={{ color: theme.text }}>Edit Info</Text>
                        </TouchableOpacity>

                        {/* Export Button (Labeled) */}
                        <TouchableOpacity
                            onPress={() => setShowExportModal(true)}
                            className="bg-blue-50 px-3 py-2 rounded-lg flex-row items-center border border-blue-100"
                        >
                            <Ionicons name="download-outline" size={16} color="#2563eb" />
                            <Text className="text-xs font-bold text-blue-600 ml-1.5">Export Set</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text className="text-3xl font-black tracking-tight mb-2" style={{ color: theme.text }}>{routine.title}</Text>
                {routine.description && (
                    <Text className="text-base mb-4 leading-relaxed" style={{ color: theme.mutedText }}>{routine.description}</Text>
                )}

                {/* Controls Bar */}
                <View className="flex-row justify-between items-center mt-2">
                    {/* Visibility Badge (Read Only) */}
                    <View className={`flex-row items-center px-3 py-1.5 rounded-full border ${isPublic ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} `}>
                        <Ionicons name={isPublic ? "earth" : "lock-closed"} size={12} color={isPublic ? "#2563eb" : "#64748b"} />
                        <Text className={`text-xs font-bold ml-1.5 ${isPublic ? 'text-blue-600' : 'text-gray-500'} `}>
                            {isPublic ? 'Public' : 'Private'}
                        </Text>
                    </View>

                    {/* Log Session Button (Replaces Reset) */}
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => setShowHistoryModal(true)} className="flex-row items-center bg-gray-100 px-3 py-2 rounded-full">
                            <Ionicons name="time" size={16} color={theme.text} />
                            <Text className="text-xs font-bold ml-1.5 uppercase" style={{ color: theme.text }}>History</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowLogModal(true)} className="flex-row items-center bg-blue-600 px-4 py-2 rounded-full shadow-sm">
                            <Ionicons name="checkbox" size={16} color="white" />
                            <Text className="text-xs font-bold text-white ml-1.5 uppercase">Log Session</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Progress Bar */}
                <View className="mt-6">
                    <View className="flex-row justify-between mb-1">
                        <Text className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Progress</Text>
                        <Text className="text-xs font-bold text-blue-600">{progressPercent}%</Text>
                    </View>
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </View>
                </View>
            </View>

            {/* Export Modal */}
            <Modal
                transparent
                visible={showExportModal}
                animationType="fade"
                onRequestClose={() => setShowExportModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-center items-center p-6">
                    <View className="bg-white p-6 rounded-[32px] w-full max-w-sm">
                        <View className="items-center mb-4">
                            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mb-3">
                                <Ionicons name="print-outline" size={24} color="#2563eb" />
                            </View>
                            <Text className="text-xl font-black text-center">Export Set List</Text>
                            <Text className="text-gray-500 text-center mt-2 text-sm leading-relaxed">
                                Generating a single, combined PDF file of all charts in this collection.
                            </Text>
                        </View>

                        {/* Options */}
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
                                className="flex-1 bg-blue-600 py-3 rounded-xl items-center shadow-md shadow-blue-300"
                            >
                                <Text className="font-bold text-white">Export</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Log Session Modal */}
            <Modal
                transparent
                visible={showLogModal}
                animationType="slide"
                onRequestClose={() => setShowLogModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black">Log Session</Text>
                            <TouchableOpacity onPress={() => setShowLogModal(false)} className="bg-gray-100 p-2 rounded-full">
                                <Ionicons name="close" size={24} color="black" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {/* Summary */}
                            <View className="bg-gray-50 p-6 rounded-2xl mb-6 items-center">
                                <Text className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Items Completed</Text>
                                <Text className="text-4xl font-black text-blue-600">
                                    {routine.blocks.filter(b => progress.some(p => p.pathId === routine.id && p.nodeId === b.id)).length}
                                    <Text className="text-xl text-gray-400"> / {routine.blocks.length}</Text>
                                </Text>
                            </View>

                            {/* Rating */}
                            <Text className="text-lg font-bold mb-3">How did it feel?</Text>
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

                            {/* Journal */}
                            <Text className="text-lg font-bold mb-3">Session Notes</Text>
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

                        </ScrollView>

                        <View className="pt-4 border-t border-gray-100">
                            <TouchableOpacity
                                onPress={handleLogSession}
                                className="bg-blue-600 py-4 rounded-2xl items-center shadow-lg shadow-blue-200"
                            >
                                <Text className="font-bold text-white text-lg">Save Log & Reset</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* History Modal */}
            <Modal
                transparent
                visible={showHistoryModal}
                animationType="slide"
                onRequestClose={() => setShowHistoryModal(false)}
            >
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[32px] p-6 h-[85%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-2xl font-black">Session History</Text>
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
                                        {/* Header */}
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

                                        {/* Stats Bar */}
                                        <View className="flex-row items-baseline mb-3">
                                            <Text className="text-2xl font-black text-gray-900 mr-1">{log.itemsCompletedCount}</Text>
                                            <Text className="text-sm font-bold text-gray-400">/ {log.totalItemsCount} items</Text>
                                        </View>

                                        {/* Notes */}
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

            {/* List */}
            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
                {routine.blocks.map((block, index) => {
                    const isComplete = progress.some(p => p.pathId === routine.id && p.nodeId === block.id);
                    return (
                        <TouchableOpacity
                            key={block.id}
                            onPress={() => handleToggleComplete(block.id)}
                            className={`mb-4 p-4 rounded-2xl border flex-row items-center shadow-sm ${isComplete ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'} `}
                        >
                            {/* Checkbox */}
                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${isComplete ? 'border-green-500 bg-green-500' : 'border-gray-300'} `}>
                                {isComplete && <Ionicons name="checkmark" size={16} color="white" />}
                            </View>

                            {/* Content */}
                            <View className="flex-1">
                                <Text className={`text - base font - bold mb - 0.5 ${isComplete ? 'text-green-900' : 'text-gray-900'} `}>
                                    {block.title}
                                </Text>
                                <View className="flex-row items-center">
                                    <View className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px] mr-2">
                                        <Text className="text-[10px] text-gray-500 font-bold uppercase">{block.type.replace('_', ' ')}</Text>
                                    </View>
                                    {block.mediaUri && (
                                        <Ionicons name="attach" size={12} color="gray" />
                                    )}
                                </View>
                            </View>

                            {/* Action Arrow (if link/file) */}
                            {(block.mediaUri || block.linkUrl) && (
                                <TouchableOpacity
                                    className="p-2 bg-gray-50 rounded-full"
                                    onPress={(e) => {
                                        e.stopPropagation(); // prevent toggling check
                                        if (block.linkUrl) Linking.openURL(block.linkUrl);
                                        // TODO: Handle File Viewing via Modal if not a link
                                        else Alert.alert('File', 'File viewing logic here');
                                    }}
                                >
                                    <Ionicons name="open-outline" size={16} color="#64748b" />
                                </TouchableOpacity>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
