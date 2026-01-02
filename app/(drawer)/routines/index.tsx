import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Routine } from '@/store/types';
import { exportToPdf } from '@/utils/pdfExport';
import { Ionicons } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RoutinesScreen() {
    const { routines, deleteRoutine, settings, trackModuleUsage, fetchPublicRoutines, publicRoutines, forkRemoteRoutine, sessionLogs, progress } = useContentStore();
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [activeTab, setActiveTab] = useState<'mine' | 'public'>('mine');
    const [isLoadingPublic, setIsLoadingPublic] = useState(false);

    useEffect(() => {
        trackModuleUsage('routines');
    }, []);

    // Fetch public data when tab changes to 'public'
    useEffect(() => {
        if (activeTab === 'public') {
            setIsLoadingPublic(true);
            fetchPublicRoutines().finally(() => setIsLoadingPublic(false));
        }
    }, [activeTab]);

    const displayRoutines = id
        ? routines.filter(r => r.id === id)
        : (activeTab === 'mine' ? routines : publicRoutines);

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

    const handleForkPress = (item: Routine) => {
        const hasMedia = item.blocks.some(b => !!b.mediaUri);
        if (hasMedia) {
            Alert.alert(
                'Cannot Copy Collection',
                'This collection contains user-uploaded files or media. To prevent copyright infringement, copying is disabled for this item.'
            );
            return;
        }
        forkRemoteRoutine(item);
    };

    const Heatmap = () => (
        <TouchableOpacity
            onPress={() => router.push('/(drawer)/history')}
            activeOpacity={0.7}
            className="mb-8"
        >
            <View className="flex-row justify-between items-end mb-3 px-1">
                <View>
                    <Text className="text-xs font-black uppercase text-slate-400 tracking-widest mb-1 shadow-sm">Practice Momentum</Text>
                    <Text className="text-2xl font-black text-white shadow-sm">
                        Keep it up!
                    </Text>
                </View>
                <View className="flex-row items-center bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                    <Text className="text-xs font-bold text-slate-300 mr-1">View History</Text>
                    <Ionicons name="chevron-forward" size={12} color="white" />
                </View>
            </View>

            <View className="p-4 rounded-[24px] bg-white/5 border border-white/5">
                <View className="flex-row flex-wrap justify-between" style={{ gap: 4 }}>
                    {Array.from({ length: 35 }).map((_, i) => {
                        const date = new Date();
                        date.setDate(date.getDate() - (34 - i));
                        const dateStr = date.toISOString().split('T')[0];

                        // Activity Score
                        const logsCount = (sessionLogs || []).filter(l => l.date.startsWith(dateStr)).length;
                        const progressCount = (progress || []).filter(p => p.completedAt?.startsWith(dateStr)).length;
                        const score = (logsCount * 3) + progressCount;

                        let bgClass = 'bg-white/5'; // Default (0) - Subtle glass
                        if (score >= 4) bgClass = 'bg-emerald-400'; // High
                        else if (score >= 2) bgClass = 'bg-emerald-500/60'; // Medium
                        else if (score >= 1) bgClass = 'bg-emerald-900/40'; // Low

                        return (
                            <View
                                key={i}
                                className={`h-4 w-[11%] rounded-sm ${bgClass}`}
                                style={{
                                    // Highlight today
                                    borderColor: i === 34 ? 'white' : 'transparent',
                                    borderWidth: i === 34 ? 1 : 0
                                }}
                            />
                        );
                    })}
                </View>
                <View className="flex-row justify-between mt-3">
                    <Text className="text-[9px] font-bold text-slate-600">30 Days Ago</Text>
                    <Text className="text-[9px] font-bold text-slate-600">Today</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: { item: Routine }) => (
        <View className="mb-8 border rounded-card overflow-hidden shadow-lg shadow-gray-200/50 mx-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
            <TouchableOpacity
                className="p-8"
                onPress={() => {
                    // If public, maybe just show a preview alert or navigate to a read-only view?
                    // For now, let's just let them see the detail view which might be read-only if we handle it right.
                    // Actually, the detail view assumes it's in state.routines? No, it just finds by ID in store.
                    // If it's publicRL, it's not in 'routines' store, so detail view will fail "Collection Not Found".

                    if (activeTab === 'public') {
                        Alert.alert('Public Collection', 'Save a copy of this collection to your library to view details and edit.');
                        return;
                    }

                    trackModuleUsage('routines/' + item.id);
                    router.push(`/routines/${item.id}`);
                }}
            >
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-2xl font-black mb-2 tracking-tight" style={{ color: theme.text }}>{item.title}</Text>
                        <Text className="text-sm font-medium leading-relaxed" numberOfLines={2} style={{ color: theme.mutedText }}>
                            {item.description || (activeTab === 'public' ? 'Community Collection' : 'Level 2 Collection')}
                        </Text>
                    </View>

                    {activeTab === 'mine' ? (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/modal/routine-editor', params: { id: item.id } })}
                            className="px-4 py-2 rounded-full shadow-md bg-white active:bg-slate-200"
                        >
                            <Text className="text-[10px] font-black text-slate-900 uppercase tracking-widest leading-3">
                                Edit ({item.blocks.length})
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            onPress={() => handleForkPress(item)}
                            className="px-4 py-2 rounded-full shadow-md bg-amber-400 active:bg-amber-500"
                        >
                            <Text className="text-[10px] font-black text-amber-950 uppercase tracking-widest leading-3">
                                Save Copy
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {item.schedule && activeTab === 'mine' && (
                    <View className="flex-row items-center mb-6">
                        <View className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex-row items-center">
                            <Ionicons name="calendar" size={12} color="#2563eb" />
                            <Text className="text-[10px] text-blue-600 font-black ml-1.5 uppercase tracking-wide">
                                {item.schedule.type === 'recurring'
                                    ? `Every ${item.schedule.daysOfWeek?.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]).join(', ')}`
                                    : item.schedule.date}
                            </Text>
                        </View>
                    </View>
                )}

                <View className="flex-row mt-2 gap-3">
                    {item.blocks.slice(0, 6).map((block, i) => (
                        <View key={block.id || i} className="w-12 h-12 rounded-2xl items-center justify-center border shadow-inner" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
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

            {activeTab === 'mine' && (
                <View className="flex-row items-center justify-between px-8 py-6 border-t" style={{ borderColor: theme.border, backgroundColor: `${theme.primary}05` }}>
                    <TouchableOpacity
                        onPress={() => exportToPdf(item, settings)}
                        className="flex-row items-center px-5 py-2.5 rounded-2xl shadow-sm border"
                        style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    >
                        <Ionicons name="share-outline" size={18} color={theme.primary} />
                        <Text className="font-black text-xs ml-2 uppercase tracking-widest" style={{ color: theme.primary }}>PDF</Text>
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
            )}
            {activeTab === 'public' && (
                <View className="px-8 py-4 border-t flex-row items-center" style={{ borderColor: theme.border, backgroundColor: `${theme.primary}05` }}>
                    <Ionicons name="people-outline" size={16} color={theme.mutedText} />
                    <Text className="text-xs font-bold ml-2 text-slate-500">Public Collection</Text>
                </View>
            )}
        </View>
    );


    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-8 pb-4" style={{ paddingTop: Math.max(insets.top, 20) }}>
                {/* ROW 1: Navigation & Actions */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className="p-2 -ml-2 mr-2"
                        >
                            <Ionicons name="home-outline" size={24} color="white" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => router.push('/studio')}
                            className="flex-row items-center px-4 py-2 rounded-full border"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <Ionicons name="arrow-back" size={16} color={theme.text} />
                            <Text className="text-sm font-bold ml-1" style={{ color: theme.text }}>Studio</Text>
                        </TouchableOpacity>
                    </View>

                    <Link href="/modal/routine-editor" asChild>
                        <TouchableOpacity
                            onPress={() => trackModuleUsage('routines')}
                            className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-white/10 bg-white"
                        >
                            <Ionicons name="add" size={28} color="black" />
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* ROW 2: Header & Tabs */}
                <View className="flex-row justify-between items-end mb-2">
                    <View>
                        <View className="flex-row items-center mb-2">
                            <Text className="text-[10px] font-black uppercase tracking-[3px] text-teal-100">Level 2</Text>
                        </View>
                        <Text className="text-4xl font-black tracking-tight leading-tight text-white">
                            Collections
                        </Text>
                    </View>
                </View>

                {/* Tabs Removed for MVP */}
                <View className="flex-row gap-4 mt-4 pb-2 border-b border-white/10">
                    <View
                        className={`pb-2 border-b-2 border-teal-400`}
                    >
                        <Text className={`font-black uppercase tracking-wider text-xs text-white`}>My Collections</Text>
                    </View>
                </View>
            </View>


            <FlatList
                data={displayRoutines}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListHeaderComponent={
                    <View>
                        {activeTab === 'mine' && <Heatmap />}
                        {activeTab === 'public' && isLoadingPublic ? (
                            <View className="p-8 items-center"><Text className="text-slate-400">Loading community collections...</Text></View>
                        ) : null}
                    </View>
                }
                ListEmptyComponent={
                    <View className="p-20 items-center justify-center">
                        <Ionicons name={activeTab === 'mine' ? "layers-outline" : "earth-outline"} size={80} color="#d1d5db" />
                        <Text className="text-gray-400 font-bold text-center mt-4 text-lg">
                            {activeTab === 'mine' ? "No Collections yet.\nTap + to create one!" : "No public collections found."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
