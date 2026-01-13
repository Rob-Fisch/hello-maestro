import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type MonthKey = string; // "YYYY-MM"

export default function HistoryScreen() {
    const { sessionLogs, routines, profile } = useContentStore();
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // Default current month

    const analytics = useMemo(() => {
        const groupedByMonth: Record<MonthKey, {
            totalSessions: number;
            routines: Record<string, { count: number; totalItems: number; completedItems: number }>
        }> = {};

        const monthsSet = new Set<string>();

        (sessionLogs || []).forEach(log => {
            const date = new Date(log.date);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            monthsSet.add(monthKey);

            if (!groupedByMonth[monthKey]) {
                groupedByMonth[monthKey] = { totalSessions: 0, routines: {} };
            }

            groupedByMonth[monthKey].totalSessions++;
            const rId = log.routineId;

            if (!groupedByMonth[monthKey].routines[rId]) {
                groupedByMonth[monthKey].routines[rId] = { count: 0, totalItems: 0, completedItems: 0 };
            }

            const stats = groupedByMonth[monthKey].routines[rId];
            stats.count++;
            stats.totalItems += log.totalItemsCount;
            stats.completedItems += log.itemsCompletedCount;
        });

        // Convert to array and sort months descending
        let months = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));

        // PREMIUM GATE: Limit to 3 months for free users
        const isPremium = profile?.isPremium;
        const hasMoreHistory = months.length > 3;

        if (!isPremium && hasMoreHistory) {
            months = months.slice(0, 3);
        }

        return { months, data: groupedByMonth, hasHiddenHistory: !isPremium && hasMoreHistory };
    }, [sessionLogs, profile]);

    const currentMonthData = analytics.data[selectedMonth];

    const getRoutineName = (id: string) => {
        return routines.find(r => r.id === id)?.title || 'Deleted Routine';
    };

    const getMonthLabel = (yyyy_mm: string) => {
        const [y, m] = yyyy_mm.split('-');
        const date = new Date(parseInt(y), parseInt(m) - 1, 1);
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-6 pb-2 border-b" style={{ paddingTop: Math.max(insets.top, 20), borderColor: theme.border }}>
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full active:bg-gray-100">
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-2xl font-black tracking-tight" style={{ color: theme.text }}>Analytics</Text>
                        <Text className="text-xs font-medium uppercase tracking-widest text-gray-400">Monthly Performance</Text>
                    </View>
                </View>

                {/* Month Selector */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                    {analytics.months.length > 0 ? analytics.months.map(m => (
                        <TouchableOpacity
                            key={m}
                            onPress={() => setSelectedMonth(m)}
                            className={`mr-3 px-4 py-2 rounded-full border ${selectedMonth === m ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold text-xs ${selectedMonth === m ? 'text-white' : 'text-gray-600'}`}>
                                {getMonthLabel(m)}
                            </Text>
                        </TouchableOpacity>
                    )) : (
                        <View className="px-4 py-2 bg-gray-100 rounded-full">
                            <Text className="text-gray-400 text-xs font-bold">No Data Yet</Text>
                        </View>
                    )}

                    {/* Upsell Pill */}
                    {analytics.hasHiddenHistory && (
                        <TouchableOpacity
                            onPress={() => router.push('/modal/upgrade?feature=analytics')}
                            className="mr-3 px-4 py-2 rounded-full border border-yellow-200 bg-yellow-50 flex-row items-center"
                        >
                            <Ionicons name="lock-closed" size={12} color="#ca8a04" />
                            <Text className="font-bold text-xs text-yellow-700 ml-1">
                                Older...
                            </Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 px-6 pt-6">
                {!currentMonthData ? (
                    <View className="items-center justify-center py-20 opacity-50">
                        <Ionicons name="bar-chart-outline" size={64} color={theme.text} />
                        <Text className="mt-4 font-bold text-gray-400">No sessions recorded in this month.</Text>
                    </View>
                ) : (
                    <>
                        {/* Summary Cards */}
                        <View className="flex-row gap-4 mb-8">
                            <View className="flex-1 p-5 rounded-3xl bg-blue-50 border border-blue-100 items-center justify-center">
                                <Text className="text-3xl font-black text-blue-600">{currentMonthData.totalSessions}</Text>
                                <Text className="text-xs font-bold uppercase tracking-wider text-blue-400">Sessions</Text>
                            </View>
                            <View className="flex-1 p-5 rounded-3xl bg-green-50 border border-green-100 items-center justify-center">
                                <Text className="text-3xl font-black text-green-600">
                                    {(Object.values(currentMonthData.routines).reduce((acc, r) => acc + r.count, 0) / 30).toFixed(1)}
                                </Text>
                                <Text className="text-xs font-bold uppercase tracking-wider text-green-400">Daily Avg</Text>
                            </View>
                        </View>

                        <Text className="text-xs font-black uppercase tracking-[2px] mb-4" style={{ color: theme.primary }}>Routine Breakdown</Text>

                        {Object.keys(currentMonthData.routines).map(rId => {
                            const stats = currentMonthData.routines[rId];
                            const completionRate = Math.round((stats.completedItems / stats.totalItems) * 100) || 0;

                            return (
                                <View key={rId} className="mb-4 p-5 rounded-3xl border shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="text-lg font-black tracking-tight" style={{ color: theme.text }}>
                                            {getRoutineName(rId)}
                                        </Text>
                                        <View className="bg-gray-100 px-3 py-1 rounded-full">
                                            <Text className="font-black text-xs text-gray-600">{stats.count}x</Text>
                                        </View>
                                    </View>

                                    <View className="mt-2">
                                        <View className="flex-row justify-between mb-1">
                                            <Text className="text-xs font-bold text-gray-400">Avg Completion</Text>
                                            <Text className="text-xs font-bold text-gray-600">{completionRate}%</Text>
                                        </View>
                                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <View
                                                className="h-full bg-blue-500 rounded-full"
                                                style={{ width: `${completionRate}%` }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </>
                )}

                {/* LOCKED YEARLY TREND (GOLDEN SAMPLE) */}
                {!profile?.isPremium && (
                    <View className="mt-8 mb-8 relative">
                        <View className="flex-row items-center mb-4 opacity-40">
                            <Ionicons name="calendar" size={20} color={theme.text} className="mr-2" />
                            <Text className="text-sm font-black uppercase tracking-widest" style={{ color: theme.text }}>Yearly Trend</Text>
                        </View>

                        {/* Blurred Fake Chart */}
                        <View className="h-48 rounded-3xl border overflow-hidden relative" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                            {/* Fake Bars */}
                            <View className="absolute inset-0 flex-row items-end justify-between px-6 pb-4 pt-10 opacity-30">
                                {[30, 45, 60, 50, 75, 40, 80, 90, 65, 55, 70, 85].map((h, i) => (
                                    <View key={i} className="w-2 rounded-t-full bg-indigo-500" style={{ height: `${h}%` }} />
                                ))}
                            </View>

                            {/* Overlay */}
                            <View className="absolute inset-0 items-center justify-center bg-transparent">
                                <View className="bg-white p-6 rounded-2xl shadow-xl items-center border border-stone-100">
                                    <Ionicons name="lock-closed" size={32} color="#F59E0B" className="mb-2" />
                                    <Text className="font-extrabold text-stone-900 text-lg">Unlock Long-Term Trends</Text>
                                    <Text className="text-stone-500 text-xs text-center mb-4 leading-4 max-w-[200px]">
                                        See how your persistence pays off over months and years.
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => router.push('/modal/upgrade?feature=analytics_trends')}
                                        className="bg-black px-6 py-3 rounded-xl"
                                    >
                                        <Text className="text-white font-bold text-xs uppercase tracking-wide">Unlock Pro Analytics</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                )}

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
