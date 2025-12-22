import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '@/store/contentStore';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export default function PathfinderIndex() {
    const router = useRouter();
    const { paths, fullSync, syncStatus, progress } = useContentStore();
    const [refreshing, setRefreshing] = useState(false);
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const onRefresh = async () => {
        setRefreshing(true);
        await fullSync();
        setRefreshing(false);
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="px-6 pb-6 shadow-sm" style={{ backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Math.max(insets.top, 20) }}>
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-3xl font-black" style={{ color: theme.text }}>Compass</Text>
                        <Text className="font-medium" style={{ color: theme.mutedText }}>Curate your learning journey</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/modal/path-editor')}
                        className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
                    >
                        <Ionicons name="add" size={30} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView
                className="flex-1 px-4 pt-4"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {paths.length === 0 ? (
                    <View className="mt-20 items-center justify-center px-10">
                        <View className="w-20 h-20 bg-blue-50 rounded-[30px] items-center justify-center mb-6">
                            <Ionicons name="map-outline" size={40} color="#2563eb" />
                        </View>
                        <Text className="text-xl font-bold text-foreground text-center mb-2">No Paths Yet</Text>
                        <Text className="text-muted-foreground text-center leading-relaxed">
                            Create your first learning path or "Fork" one from a public library to start tracking your progress.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/modal/path-editor')}
                            className="mt-8 bg-blue-600 px-8 py-4 rounded-2xl shadow-lg shadow-blue-200"
                        >
                            <Text className="text-white font-black">Create New Roadmap</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    paths.map((path) => (
                        <TouchableOpacity
                            key={path.id}
                            onPress={() => router.push(`/pathfinder/${path.id}`)}
                            className="bg-card p-5 rounded-[32px] border border-border mb-4 shadow-sm"
                        >
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center flex-1">
                                    <View className="w-10 h-10 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: `${theme.primary}15` }}>
                                        <Ionicons name="compass-outline" size={24} color={theme.primary} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-lg font-black" numberOfLines={1} style={{ color: theme.text }}>{path.title}</Text>
                                        <View className="flex-row items-center">
                                            <Ionicons name={path.isPublic ? "globe-outline" : "lock-closed-outline"} size={12} color={theme.mutedText} />
                                            <Text className="text-xs ml-1 font-medium italic" style={{ color: theme.mutedText }}>
                                                {path.isPublic ? 'Public' : 'Private'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
                            </View>

                            {path.description && (
                                <Text className="text-sm mb-4 leading-relaxed" numberOfLines={2} style={{ color: theme.mutedText }}>
                                    {path.description}
                                </Text>
                            )}

                            <View className="flex-row items-center justify-between pt-4 border-t border-gray-50">
                                <View className="flex-row items-center">
                                    <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center mr-2">
                                        <Ionicons name="person-outline" size={12} color="#64748b" />
                                    </View>
                                    <Text className="text-xs text-slate-500 font-bold">
                                        {path.originatorName ? `Forked from ${path.originatorName}` : (path.forkedFromId ? 'Forked' : 'Curator')}
                                    </Text>
                                </View>

                                {path.treeData?.nodes && (
                                    <View className="flex-row items-center gap-2">
                                        <View className="bg-blue-50 px-3 py-1 rounded-full">
                                            <Text className="text-blue-600 text-[10px] font-black uppercase">
                                                {path.treeData.nodes.length} Milestones
                                            </Text>
                                        </View>
                                        {(() => {
                                            const pathProgress = progress.filter(p => p.pathId === path.id);
                                            const total = path.treeData.nodes.length;
                                            const percentage = total > 0 ? Math.round((pathProgress.length / total) * 100) : 0;
                                            return (
                                                <View className={`${percentage === 100 ? 'bg-green-100' : 'bg-gray-100'} px-3 py-1 rounded-full`}>
                                                    <Text className={`${percentage === 100 ? 'text-green-700' : 'text-gray-600'} text-[10px] font-black`}>
                                                        {percentage}% COMPLETE
                                                    </Text>
                                                </View>
                                            );
                                        })()}
                                    </View>
                                )}
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
}
