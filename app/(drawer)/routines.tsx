import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Link, useRouter } from 'expo-router';
import { Routine } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { exportToPdf } from '@/utils/pdfExport';

export default function RoutinesScreen() {
    const { routines, deleteRoutine, settings } = useContentStore();
    const router = useRouter();
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
        <View className="mb-6 bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm mx-1">
            <TouchableOpacity
                className="p-6"
                onPress={() => router.push({ pathname: '/modal/routine-editor', params: { id: item.id } })}
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl font-black text-gray-900 mb-2">{item.title}</Text>
                        <Text className="text-sm text-gray-500 font-medium leading-relaxed" numberOfLines={2}>
                            {item.description || 'No description provided.'}
                        </Text>
                    </View>
                    <View className="bg-blue-600 px-4 py-1.5 rounded-full shadow-md shadow-blue-200">
                        <Text className="text-[10px] font-black text-white uppercase tracking-widest">
                            {item.blocks.length} Blocks
                        </Text>
                    </View>
                </View>

                {item.schedule && (
                    <View className="flex-row items-center mb-4">
                        <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex-row items-center">
                            <Ionicons name="calendar-outline" size={14} color="#2563eb" />
                            <Text className="text-xs text-blue-600 font-bold ml-1.5">
                                {item.schedule.type === 'recurring'
                                    ? `Every ${item.schedule.daysOfWeek?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                                    : item.schedule.date}
                            </Text>
                        </View>
                    </View>
                )}

                <View className="flex-row mt-2 gap-3">
                    {item.blocks.slice(0, 6).map((block, i) => (
                        <View key={block.id} className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center border border-gray-100 shadow-sm">
                            <Ionicons
                                name={block.type === 'sheet_music' ? 'musical-notes' : 'document-text'}
                                size={18}
                                color="#4b5563"
                            />
                        </View>
                    ))}
                    {item.blocks.length > 6 && (
                        <View className="w-10 h-10 rounded-xl bg-gray-50 items-center justify-center border border-gray-100">
                            <Text className="text-xs font-black text-gray-400">+{item.blocks.length - 6}</Text>
                        </View>
                    )}
                </View>
            </TouchableOpacity>

            <View className="flex-row items-center justify-between px-6 py-4 border-t border-gray-50 bg-gray-50/30">
                <TouchableOpacity onPress={() => exportToPdf(item, settings)} className="flex-row items-center bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                    <Ionicons name="share-outline" size={18} color="#2563eb" />
                    <Text className="text-blue-600 font-black text-xs ml-2">Export PDF</Text>
                </TouchableOpacity>

                {deletingId === item.id ? (
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => setDeletingId(null)} className="px-4 py-2 bg-gray-100 rounded-xl">
                            <Text className="text-gray-600 font-bold text-xs">Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => confirmWebDelete(item.id)} className="px-4 py-2 bg-red-600 rounded-xl">
                            <Text className="text-white font-bold text-xs">Delete</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity onPress={() => handleDeletePress(item.id, item.title)} className="p-2">
                        <Ionicons name="trash-outline" size={24} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View className="p-8 pb-4 flex-row justify-between items-center">
                <View>
                    <Text className="text-4xl font-black text-gray-900 tracking-tight">Routines</Text>
                    <Text className="text-gray-500 font-medium text-base mt-1">Organize your practice sessions</Text>
                </View>
                <Link href="/modal/routine-editor" asChild>
                    <TouchableOpacity className="bg-blue-600 px-6 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-400">
                        <Ionicons name="add" size={24} color="white" />
                        <Text className="text-white text-lg font-bold ml-1">New Routine</Text>
                    </TouchableOpacity>
                </Link>
            </View>

            <FlatList
                data={routines}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="p-20 items-center justify-center">
                        <Ionicons name="repeat-outline" size={80} color="#d1d5db" />
                        <Text className="text-gray-400 font-bold text-center mt-4 text-lg">
                            No routines yet.{"\n"}Tap "New Routine" to get started!
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
