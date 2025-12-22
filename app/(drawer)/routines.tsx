import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { Routine } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { exportToPdf } from '@/utils/pdfExport';

import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';

export default function RoutinesScreen() {
    const { routines, deleteRoutine, settings, trackModuleUsage } = useContentStore();

    useEffect(() => {
        trackModuleUsage('routines');
    }, []);

    const router = useRouter();
    const { id, returnPathId } = useLocalSearchParams<{ id: string, returnPathId: string }>();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const displayRoutines = id
        ? routines.filter(r => r.id === id)
        : routines;

    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDeletePress = (id: string, title?: string) => {
        if (Platform.OS === 'web') {
            setDeletingId(id);
        } else {
            Alert.alert(
                "Delete Routine",
                `Are you sure you want to delete "${title || 'this routine'}"?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: () => deleteRoutine(id) }
                ]
            );
        }
    };

    const confirmWebDelete = (id: string) => {
        deleteRoutine(id);
        setDeletingId(null);
    };

    const renderItem = ({ item }: { item: Routine }) => (
        <View className="mb-8 border rounded-card overflow-hidden shadow-lg shadow-gray-200/50 mx-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <TouchableOpacity
                className="p-8"
                onPress={() => {
                    trackModuleUsage('modal/routine-editor');
                    router.push({ pathname: '/modal/routine-editor', params: { id: item.id } });
                }}
            >
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl font-black mb-2 tracking-tight" style={{ color: theme.text }}>{item.title}</Text>
                        <Text className="text-sm font-medium leading-relaxed" numberOfLines={2} style={{ color: theme.mutedText }}>
                            {item.description || 'Structured practice routine with multiple blocks.'}
                        </Text>
                    </View>
                    <View className="px-4 py-1.5 rounded-full shadow-md" style={{ backgroundColor: theme.primary }}>
                        <Text className="text-[10px] font-black text-white uppercase tracking-widest leading-3">
                            {item.blocks.length} Blocks
                        </Text>
                    </View>
                </View>

                {item.schedule && (
                    <View className="flex-row items-center mb-6">
                        <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex-row items-center">
                            <Ionicons name="calendar" size={12} color="#2563eb" />
                            <Text className="text-[10px] text-primary font-black ml-1.5 uppercase tracking-wide">
                                {item.schedule.type === 'recurring'
                                    ? `Every ${item.schedule.daysOfWeek?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                                    : item.schedule.date}
                            </Text>
                        </View>
                    </View>
                )}

                <View className="flex-row mt-2 gap-3">
                    {item.blocks.slice(0, 6).map((block, i) => (
                        <View key={block.id} className="w-12 h-12 rounded-2xl items-center justify-center border shadow-inner" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                            <Ionicons
                                name={block.type === 'sheet_music' ? 'musical-notes' : 'document-text'}
                                size={22}
                                color={theme.mutedText}
                            />
                        </View>
                    ))}
                    {item.blocks.length > 6 && (
                        <View className="w-12 h-12 rounded-2xl bg-gray-50 items-center justify-center border border-gray-100">
                            <Text className="text-xs font-black text-gray-400">+{item.blocks.length - 6}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center justify-between px-8 py-6 border-t" style={{ borderColor: theme.border, backgroundColor: `${theme.primary}05` }}>
                <TouchableOpacity
                    onPress={() => exportToPdf(item, settings)}
                    className="flex-row items-center px-5 py-2.5 rounded-2xl shadow-sm border"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                    <Ionicons name="share-outline" size={18} color={theme.primary} />
                    <Text className="font-black text-xs ml-2 uppercase tracking-widest" style={{ color: theme.primary }}>Global PDF</Text>
                </TouchableOpacity>

                {deletingId === item.id ? (
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => setDeletingId(null)} className="px-5 py-2.5 bg-gray-100 rounded-2xl">
                            <Text className="text-gray-600 font-bold text-xs">EXIT</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmWebDelete(item.id)} className="px-5 py-2.5 bg-red-600 rounded-2xl">
                            <Text className="text-white font-bold text-xs">DEL</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => handleDeletePress(item.id, item.title)} className="bg-red-50 p-2.5 rounded-full border border-red-100">
                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );


    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-8 pb-6 flex-row justify-between items-center" style={{ paddingTop: Math.max(insets.top, 20) }}>
                <View className="flex-1 mr-4">
                    <View className="flex-row items-center mb-2">
                        <Text className="text-[10px] font-black uppercase tracking-[3px]" style={{ color: theme.primary }}>Practice Plan</Text>
                        {returnPathId && (
                            <TouchableOpacity
                                onPress={() => router.push(`/pathfinder/${returnPathId}`)}
                                className="ml-4 bg-purple-100 px-3 py-1 rounded-full flex-row items-center border border-purple-200"
                            >
                                <Ionicons name="arrow-back" size={12} color="#7c3aed" />
                                <Text className="text-purple-700 text-[10px] font-black ml-1 uppercase">Back to Roadmap</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    {(() => {
                        const path = returnPathId ? useContentStore.getState().paths.find(p => p.id === returnPathId) : null;
                        const milestone = path?.treeData.nodes.find(n => n.routineId === id);
                        return (
                            <Text className="text-2xl font-black tracking-tight leading-tight" style={{ color: theme.text }}>
                                {id && path && milestone
                                    ? `Selected ${path.title} - ${milestone.label}`
                                    : (id ? 'Selected Routine' : 'Routines')
                                }
                            </Text>
                        );
                    })()}
                </View>
                <Link href="/modal/routine-editor" asChild>
                    <TouchableOpacity
                        onPress={() => trackModuleUsage('routines')}
                        className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-400"
                        style={{ backgroundColor: theme.primary }}
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </TouchableOpacity>
                </Link>
            </View>


            <FlatList
                data={displayRoutines}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="p-20 items-center justify-center">
                        <Ionicons name="repeat-outline" size={80} color="#d1d5db" />
                        <Text className="text-gray-400 font-bold text-center mt-4 text-lg">
                            No routines yet.{"\n"}Tap &quot;New Routine&quot; to get started!
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
