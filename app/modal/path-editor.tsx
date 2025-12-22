import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '@/store/contentStore';
import { LearningPath } from '@/store/types';

export default function PathEditor() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { paths, addPath, updatePath, deletePath, profile } = useContentStore();
    const theme = useTheme();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    useEffect(() => {
        if (id) {
            const path = paths.find(p => p.id === id);
            if (path) {
                setTitle(path.title);
                setDescription(path.description || '');
                setIsPublic(path.isPublic);
            }
        }
    }, [id]);

    const handleSave = () => {
        if (!title.trim()) {
            Alert.alert('Error', 'Please enter a title for your path.');
            return;
        }

        if (id) {
            updatePath(id, {
                title,
                description,
                isPublic,
                updatedAt: new Date().toISOString(),
            });
        } else {
            const newPath: LearningPath = {
                id: Date.now().toString(),
                ownerId: profile?.id || 'offline-user',
                title,
                description,
                isPublic,
                treeData: { nodes: [], edges: [] },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            addPath(newPath);
        }

        router.back();
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4 shadow-sm" style={{ backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-black" style={{ color: theme.text }}>{id ? 'Edit Roadmap' : 'New Roadmap'}</Text>
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Ionicons name="close" size={28} color={theme.mutedText} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Goal Title</Text>
                    <TextInput
                        className="bg-card p-5 rounded-2xl border border-border text-lg font-bold text-foreground"
                        placeholder="e.g. Master the Jazz Blues"
                        value={title}
                        onChangeText={setTitle}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description</Text>
                    <TextInput
                        className="bg-card p-5 rounded-2xl border border-border text-foreground leading-relaxed h-32"
                        placeholder="What do you want to achieve with this path?"
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                {/* Privacy Toggle */}
                <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 mb-8">
                    <View className="flex-row items-center justify-between">
                        <View className="flex-1 mr-4">
                            <Text className="text-lg font-bold text-blue-900 mb-1">Make Path Public</Text>
                            <Text className="text-blue-700/60 text-xs">Allow others to see and "Fork" your curated learning tree.</Text>
                        </View>
                        <Switch
                            value={isPublic}
                            onValueChange={setIsPublic}
                            trackColor={{ false: '#cbd5e1', true: '#2563eb' }}
                            thumbColor="white"
                        />
                    </View>
                </View>

                <View className="flex-row gap-4 mb-20">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="flex-1 bg-blue-600 p-5 rounded-2xl items-center shadow-lg shadow-blue-200"
                    >
                        <Text className="text-white font-black text-lg">Save Roadmap</Text>
                    </TouchableOpacity>

                    {id && (
                        <TouchableOpacity
                            onPress={() => {
                                Alert.alert(
                                    'Delete Roadmap',
                                    'Are you sure you want to delete this learning path? This will also remove all milestones and progress.',
                                    [
                                        { text: 'Cancel', style: 'cancel' },
                                        {
                                            text: 'Delete',
                                            style: 'destructive',
                                            onPress: () => {
                                                deletePath(id);
                                                router.replace('/pathfinder');
                                            }
                                        }
                                    ]
                                );
                            }}
                            className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl items-center justify-center"
                        >
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView >
        </View >
    );
}
