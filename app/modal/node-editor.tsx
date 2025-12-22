import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '@/store/contentStore';
import { PathNode } from '@/store/types';

export default function NodeEditor() {
    const router = useRouter();
    const { pathId, nodeId } = useLocalSearchParams<{ pathId: string, nodeId: string }>();
    const { paths, updatePath, routines } = useContentStore();
    const theme = useTheme();

    const [label, setLabel] = useState('');
    const [description, setDescription] = useState('');
    const [referenceUrl, setReferenceUrl] = useState('');
    const [selectedRoutineId, setSelectedRoutineId] = useState<string | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState('');

    const path = paths.find(p => p.id === pathId);
    const node = path?.treeData.nodes.find(n => n.id === nodeId);

    useEffect(() => {
        if (node) {
            setLabel(node.label);
            setDescription(node.description || '');
            setReferenceUrl(node.referenceUrl || '');
            setSelectedRoutineId(node.routineId);
        }
    }, [node]);

    const handleSave = () => {
        if (!label.trim()) {
            Alert.alert('Error', 'Please enter a name for this milestone.');
            return;
        }

        if (!path) return;

        let newNodes = [...path.treeData.nodes];

        if (nodeId) {
            newNodes = newNodes.map(n => n.id === nodeId ? {
                ...n,
                label,
                description,
                referenceUrl,
                routineId: selectedRoutineId
            } : n);
        } else {
            // Add new
            const newNode: PathNode = {
                id: Date.now().toString(),
                label,
                description,
                referenceUrl,
                x: 0,
                y: newNodes.length * 100, // Basic vertical spacing
                routineId: selectedRoutineId
            };
            newNodes.push(newNode);
        }

        updatePath(path.id, {
            treeData: {
                ...path.treeData,
                nodes: newNodes
            }
        });

        router.back();
    };

    const handleDelete = () => {
        if (!path || !nodeId) return;

        Alert.alert(
            'Delete Milestone',
            'Are you sure you want to delete this milestone?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        const newNodes = path.treeData.nodes.filter(n => n.id !== nodeId);
                        updatePath(path.id, {
                            treeData: {
                                ...path.treeData,
                                nodes: newNodes
                            }
                        });
                        router.back();
                    }
                }
            ]
        );
    };

    const filteredRoutines = routines.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View className="px-6 pt-6 pb-4 shadow-sm" style={{ backgroundColor: theme.headerBg, borderBottomWidth: 1, borderBottomColor: theme.border }}>
                <View className="flex-row items-center justify-between">
                    <Text className="text-2xl font-black" style={{ color: theme.text }}>{nodeId ? 'Edit Milestone' : 'New Milestone'}</Text>
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <Ionicons name="close" size={28} color={theme.mutedText} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-8">
                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Milestone Name</Text>
                    <TextInput
                        className="bg-card p-5 rounded-2xl border border-border text-lg font-bold text-foreground"
                        placeholder="e.g. Major Pentatonic Scale"
                        value={label}
                        onChangeText={setLabel}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Description / Tips</Text>
                    <TextInput
                        className="bg-card p-5 rounded-2xl border border-border text-foreground leading-relaxed h-32"
                        placeholder="What should be focused on during this step?"
                        multiline
                        textAlignVertical="top"
                        value={description}
                        onChangeText={setDescription}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Learning Resource (URL)</Text>
                    <TextInput
                        className="bg-card p-5 rounded-2xl border border-border text-foreground font-medium"
                        placeholder="e.g. YouTube or LinkedIn Learning link"
                        value={referenceUrl}
                        onChangeText={setReferenceUrl}
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        keyboardType="url"
                    />
                    <Text className="text-[10px] text-muted-foreground mt-2 px-1 italic">
                        Paste a link to the lesson or reference material (Link, Don't Host).
                    </Text>
                </View>

                <View className="mb-8">
                    <Text className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Link to Practice Routine</Text>
                    <View className="bg-card rounded-2xl border border-border overflow-hidden">
                        <View className="p-4 border-b border-gray-50 flex-row items-center">
                            <Ionicons name="search" size={18} color="#94a3b8" className="mr-2" />
                            <TextInput
                                className="flex-1 text-foreground"
                                placeholder="Search your routines..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>
                        <View style={{ maxHeight: 200 }}>
                            {filteredRoutines.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => setSelectedRoutineId(selectedRoutineId === item.id ? undefined : item.id)}
                                    className={`p-4 flex-row items-center justify-between ${selectedRoutineId === item.id ? 'bg-blue-50' : ''
                                        }`}
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons
                                            name="repeat-outline"
                                            size={18}
                                            color={selectedRoutineId === item.id ? '#2563eb' : '#64748b'}
                                            className="mr-3"
                                        />
                                        <Text className={`font-bold ${selectedRoutineId === item.id ? 'text-blue-700' : 'text-foreground'}`}>
                                            {item.title}
                                        </Text>
                                    </View>
                                    {selectedRoutineId === item.id && (
                                        <Ionicons name="checkmark-circle" size={20} color="#2563eb" />
                                    )}
                                </TouchableOpacity>
                            ))}
                            {filteredRoutines.length === 0 && (
                                <View className="p-8 items-center">
                                    <Text className="text-muted-foreground italic text-sm">No routines found.</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>

                <View className="flex-row gap-4 mb-20">
                    <TouchableOpacity
                        onPress={handleSave}
                        className="flex-1 bg-blue-600 p-5 rounded-2xl items-center shadow-lg shadow-blue-200"
                    >
                        <Text className="text-white font-black text-lg">Save Milestone</Text>
                    </TouchableOpacity>

                    {nodeId && (
                        <TouchableOpacity
                            onPress={handleDelete}
                            className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl items-center justify-center"
                        >
                            <Ionicons name="trash-outline" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
