import { View, Text, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '@/store/contentStore';
import { useState } from 'react';
import { useTheme } from '@/lib/theme';

export default function PathDetails() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { paths, progress, updateProgress, forkPathRemote, profile, proofs, addProof } = useContentStore();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const path = paths.find(p => p.id === id);
    const pathProgress = progress.filter(p => p.pathId === id);

    const isNodeCompleted = (nodeId: string) => pathProgress.some(p => p.nodeId === nodeId);

    const handleToggleComplete = (nodeId: string) => {
        const completed = isNodeCompleted(nodeId);
        updateProgress(id!, nodeId, !completed);
    };


    const handleFork = async () => {
        if (!path) return;
        Alert.alert(
            'Fork Path?',
            'This will create a private copy of this path in your library so you can track your own progress.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Fork',
                    onPress: async () => {
                        const newId = await forkPathRemote(path.id, 'Original Curator', path.title);
                        if (newId) {
                            router.push(`/pathfinder/${newId}`);
                        }
                    }
                }
            ]
        );
    };

    if (!path) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <Text className="text-muted-foreground">Path not found.</Text>
            </View>
        );
    }

    const isOwner = path.ownerId === profile?.id;

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="px-6 pb-6 shadow-sm" style={{ backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border, paddingTop: Math.max(insets.top, 20) }}>
                <View className="flex-row items-center justify-between mb-2">
                    <TouchableOpacity onPress={() => router.back()} className="flex-row items-center p-2 -ml-2">
                        <Ionicons name="arrow-back" size={24} color="#6b7280" />
                        <Text className="text-gray-500 font-bold ml-1">Back to Compass</Text>
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        {!isOwner && (
                            <TouchableOpacity
                                onPress={handleFork}
                                className="bg-blue-600 px-4 py-2 rounded-xl flex-row items-center"
                            >
                                <Ionicons name="git-branch-outline" size={18} color="white" className="mr-2" />
                                <Text className="text-white font-bold ml-1">Fork</Text>
                            </TouchableOpacity>
                        )}
                        {isOwner && (
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/modal/path-editor', params: { id } })}
                                className="bg-gray-100 p-2 rounded-xl"
                            >
                                <Ionicons name="create-outline" size={20} color="#6b7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                <Text className="text-2xl font-black" style={{ color: theme.text }}>Roadmap - {path.title}</Text>
                {path.description && (
                    <Text className="mt-1 text-sm leading-relaxed" style={{ color: theme.mutedText }}>{path.description}</Text>
                )}
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
                {path.treeData.nodes.length === 0 ? (
                    <View className="items-center justify-center mt-20">
                        <Ionicons name="construct-outline" size={48} color="#cbd5e1" />
                        <Text className="text-muted-foreground mt-4 font-medium">This tree is currently empty.</Text>
                        {isOwner && (
                            <Text className="text-blue-600 mt-2 font-bold">Add some nodes to get started!</Text>
                        )}
                    </View>
                ) : (
                    path.treeData.nodes.map((node, index) => {
                        const completed = isNodeCompleted(node.id);
                        const isLast = index === path.treeData.nodes.length - 1;

                        return (
                            <View key={node.id} className="flex-row">
                                {/* Timeline Line */}
                                <View className="items-center mr-4">
                                    <TouchableOpacity
                                        onPress={() => handleToggleComplete(node.id)}
                                        className={`w-8 h-8 rounded-full items-center justify-center z-10 ${completed ? 'shadow-lg' : ''
                                            }`}
                                        style={{ backgroundColor: completed ? theme.nodeCompleted : theme.nodeInactive }}
                                    >
                                        {completed ? (
                                            <Ionicons name="checkmark" size={20} color="white" />
                                        ) : (
                                            <View className="w-3 h-3 bg-white rounded-full" />
                                        )}
                                    </TouchableOpacity>
                                    {!isLast && <View className="w-1 flex-1 my-1" style={{ backgroundColor: theme.border }} />}
                                </View>

                                {/* Node Card */}
                                <View className="flex-1 pb-10">
                                    <TouchableOpacity
                                        activeOpacity={0.7}
                                        onPress={() => {
                                            if (isOwner) {
                                                router.push({ pathname: '/modal/node-editor', params: { pathId: id, nodeId: node.id } });
                                            }
                                        }}
                                        className={`p-4 rounded-[24px] border border-border ${theme.glass ? 'opacity-90' : ''}`}
                                        style={{
                                            backgroundColor: completed ? (theme.glass ? 'rgba(34, 197, 94, 0.05)' : '#f0fdf4') : theme.card,
                                            borderColor: completed ? (theme.glass ? 'rgba(34, 197, 94, 0.2)' : theme.nodeCompleted) : theme.border
                                        }}
                                    >
                                        <Text className="text-lg font-black" style={{ color: completed ? (theme.glass ? '#064e3b' : theme.nodeCompleted) : theme.text }}>
                                            {node.label}
                                        </Text>
                                        {node.description && (
                                            <Text className="text-sm mt-1 leading-relaxed" style={{ color: theme.mutedText }}>
                                                {node.description}
                                            </Text>
                                        )}

                                        <View className="flex-row mt-4 gap-2 flex-wrap">
                                            {node.referenceUrl && (
                                                <TouchableOpacity
                                                    onPress={() => Linking.openURL(node.referenceUrl!)}
                                                    className="bg-purple-100 px-3 py-1.5 rounded-full flex-row items-center"
                                                >
                                                    <Ionicons name="book-outline" size={14} color="#7c3aed" />
                                                    <Text className="text-purple-700 text-xs font-bold ml-1">Learn</Text>
                                                </TouchableOpacity>
                                            )}
                                            {node.routineId && (
                                                <TouchableOpacity
                                                    onPress={() => router.push(`/routines?id=${node.routineId}&returnPathId=${id}`)}
                                                    className="bg-blue-100 px-3 py-1.5 rounded-full flex-row items-center"
                                                >
                                                    <Ionicons name="play-circle" size={14} color="#2563eb" />
                                                    <Text className="text-blue-700 text-xs font-bold ml-1">Practice</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>

            {/* Action Bar (Only for owner to build) */}
            {isOwner && (
                <View className="absolute bottom-10 left-6 right-6 flex-row gap-4">
                    <TouchableOpacity
                        className="flex-1 bg-blue-600 p-4 rounded-2xl flex-row items-center justify-center shadow-xl shadow-blue-200"
                        onPress={() => router.push({ pathname: '/modal/node-editor', params: { pathId: id } })}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="white" />
                        <Text className="text-white font-black ml-2">Add Milestone</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        className="w-16 h-16 bg-white border border-border rounded-2xl items-center justify-center shadow-lg"
                        onPress={() => Alert.alert('Edit Edges', 'Connection UI coming soon!')}
                    >
                        <Ionicons name="git-network-outline" size={24} color="#64748b" />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}
