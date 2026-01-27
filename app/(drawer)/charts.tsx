import { useChartsStore } from '@/store/chartsStore';
import { ChordChart } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChartsScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const { charts, addChart, updateChart, deleteChart } = useChartsStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    // Filter charts based on search (exclude deleted)
    const activeCharts = charts.filter(c => !c.deletedAt);
    const filteredCharts = activeCharts
        .filter(c =>
            c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.key && c.key.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const handleCreate = () => {
        const chartId = addChart({
            title: 'New Chart',
            key: 'C',
            sections: [],
        });
        // Navigate to editor
        router.push(`/modal/chart-editor?id=${chartId}`);
    };

    const handleOpen = (chart: ChordChart) => {
        router.push(`/modal/chart-editor?id=${chart.id}`);
    };

    const handleStartRename = (chart: ChordChart) => {
        setIsRenaming(chart.id);
        setRenameValue(chart.title);
    };

    const handleConfirmRename = () => {
        if (isRenaming && renameValue.trim()) {
            updateChart(isRenaming, { title: renameValue.trim() });
        }
        setIsRenaming(null);
        setRenameValue('');
    };

    const handleDelete = (id: string, title: string) => {
        Alert.alert(
            "Delete Chart",
            `Are you sure you want to delete "${title}"?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteChart(id) }
            ]
        );
    };

    // Get section count and bar count for display
    const getChartStats = (chart: ChordChart) => {
        const sectionCount = chart.sections.length;
        const barCount = chart.sections.reduce((acc, s) => acc + s.bars.length, 0);
        return { sectionCount, barCount };
    };

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <View className="flex-1 bg-slate-900">
                {/* Header */}
                <View className="bg-slate-800 px-6 pt-4 pb-4 border-b border-slate-700">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-4">
                                <Ionicons name="menu" size={28} color="#ffffff" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-2xl font-bold text-white">Chord Charts</Text>
                                <Text className="text-slate-400">{activeCharts.length} Charts</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleCreate}
                            className="bg-purple-600 px-4 py-2 rounded-full flex-row items-center"
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-semibold ml-1">New Chart</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-slate-700 rounded-xl px-4 py-3">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-2 text-base text-white"
                            placeholder="Search charts..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Chart List */}
                <ScrollView className="flex-1 px-4 pt-4">
                    {filteredCharts.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="musical-notes-outline" size={64} color="#475569" />
                            <Text className="text-slate-400 text-lg mt-4 font-medium">No charts found</Text>
                            <Text className="text-slate-500 text-center mt-2 px-8">
                                Create chord charts for your songs — quick, visual, and print-ready.
                            </Text>
                            <TouchableOpacity
                                onPress={handleCreate}
                                className="mt-6 bg-purple-600 px-6 py-3 rounded-full flex-row items-center"
                            >
                                <Ionicons name="add" size={20} color="white" />
                                <Text className="text-white font-semibold ml-2">Create Your First Chart</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        filteredCharts.map((chart) => {
                            const stats = getChartStats(chart);
                            return (
                                <TouchableOpacity
                                    key={chart.id}
                                    onPress={() => handleOpen(chart)}
                                    className="bg-slate-800 rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-slate-700"
                                >
                                    {/* Key Badge */}
                                    <View className="h-12 w-12 bg-purple-900 rounded-full items-center justify-center mr-4">
                                        <Text className="text-purple-300 font-bold text-lg">
                                            {chart.key || '?'}
                                        </Text>
                                    </View>

                                    {/* Chart Info */}
                                    <View className="flex-1">
                                        {isRenaming === chart.id ? (
                                            <TextInput
                                                className="text-white font-bold text-lg bg-slate-700 px-2 py-1 rounded"
                                                value={renameValue}
                                                onChangeText={setRenameValue}
                                                onBlur={handleConfirmRename}
                                                onSubmitEditing={handleConfirmRename}
                                                autoFocus
                                            />
                                        ) : (
                                            <Text className="text-white font-bold text-lg">{chart.title || 'Untitled'}</Text>
                                        )}
                                        <Text className="text-slate-400">
                                            {stats.sectionCount} section{stats.sectionCount !== 1 ? 's' : ''} • {stats.barCount} bar{stats.barCount !== 1 ? 's' : ''}
                                        </Text>
                                    </View>

                                    {/* Action Buttons */}
                                    <TouchableOpacity
                                        onPress={() => handleStartRename(chart)}
                                        className="p-2 mr-1"
                                    >
                                        <Ionicons name="pencil-outline" size={18} color="#94a3b8" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => handleDelete(chart.id, chart.title)}
                                        className="p-2"
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </TouchableOpacity>
                            );
                        })
                    )}
                    <View className="h-24" />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
