import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useContentStore } from '@/store/contentStore';
import { useRouter, Link } from 'expo-router';
import { AppEvent, AppEventType, Routine } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';

type ScheduleFilter = AppEventType | 'practice';

interface UnifiedItem {
    id: string;
    date: string;
    time: string;
    title: string;
    type: ScheduleFilter;
    originalItem: AppEvent | Routine;
}

export default function ScheduleScreen() {
    const { events = [], routines = [], deleteEvent } = useContentStore();
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [activeFilters, setActiveFilters] = useState<ScheduleFilter[]>(['performance', 'lesson', 'rehearsal', 'practice']);

    const toggleFilter = (filter: ScheduleFilter) => {
        if (activeFilters.includes(filter)) {
            setActiveFilters(activeFilters.filter(f => f !== filter));
        } else {
            setActiveFilters([...activeFilters, filter]);
        }
    };

    const unifiedData = useMemo(() => {
        const items: UnifiedItem[] = [];
        const today = new Date();
        const lookaheadDays = 30;

        // Add Events
        events.forEach(e => {
            if (e.schedule?.type === 'recurring') {
                const { startDate, endDate, daysOfWeek: eventDays } = e.schedule;
                if (!startDate || !endDate || !eventDays) return;

                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T23:59:59');

                for (let i = 0; i < lookaheadDays; i++) {
                    const current = new Date();
                    current.setDate(today.getDate() + i);
                    current.setHours(0, 0, 0, 0);

                    if (current >= start && current <= end && eventDays.includes(current.getDay())) {
                        const dateStr = current.toISOString().split('T')[0];
                        items.push({
                            id: `${e.id}-${dateStr}`,
                            date: dateStr,
                            time: e.time,
                            title: e.title,
                            type: e.type,
                            originalItem: e
                        });
                    }
                }
            } else {
                // Single date event
                items.push({
                    id: e.id,
                    date: e.date,
                    time: e.time,
                    title: e.title,
                    type: e.type,
                    originalItem: e
                });
            }
        });

        // Add Scheduled Routines
        for (let i = 0; i < lookaheadDays; i++) {
            const date = new Date();
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const dayOfWeek = date.getDay();

            routines.forEach(r => {
                if (!r.schedule) return;
                let isToday = false;
                if (r.schedule.type === 'date' && r.schedule.date === dateStr) isToday = true;
                if (r.schedule.type === 'recurring' && r.schedule.daysOfWeek?.includes(dayOfWeek)) {
                    // Check if routine has start/end dates (newly added to type but maybe not in old routines)
                    const start = r.schedule.startDate ? new Date(r.schedule.startDate + 'T00:00:00') : null;
                    const end = r.schedule.endDate ? new Date(r.schedule.endDate + 'T23:59:59') : null;
                    const current = new Date(dateStr + 'T12:00:00');

                    if ((!start || current >= start) && (!end || current <= end)) {
                        isToday = true;
                    }
                }

                if (isToday) {
                    items.push({
                        id: `routine-${r.id}-${dateStr}`,
                        date: dateStr,
                        time: '00:00',
                        title: r.title,
                        type: 'practice',
                        originalItem: r
                    });
                }
            });
        }

        // Sort chronologically
        return items
            .filter(item => activeFilters.includes(item.type))
            .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                if (dateCompare !== 0) return dateCompare;
                return a.time.localeCompare(b.time);
            });
    }, [events, routines, activeFilters]);

    const handleDeleteEvent = (id: string, type: string) => {
        if (Platform.OS === 'web') {
            setDeletingId(id);
        } else {
            Alert.alert(`Cancel ${type}`, `Are you sure you want to remove this ${type}?`, [
                { text: 'Back', style: 'cancel' },
                { text: 'Remove', style: 'destructive', onPress: () => deleteEvent(id) },
            ]);
        }
    };

    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, options);
    };

    const formatDisplayTime = (timeStr: string) => {
        if (timeStr === '00:00') return 'All Day';
        const [hours, minutes] = timeStr.split(':').map(Number);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    };

    const getBadge = (type: ScheduleFilter) => {
        switch (type) {
            case 'performance': return { label: 'Gig', color: 'bg-blue-100 text-blue-700', icon: '🎸' };
            case 'lesson': return { label: 'Lesson', color: 'bg-purple-100 text-purple-700', icon: '👨‍🏫' };
            case 'rehearsal': return { label: 'Rehearsal', color: 'bg-amber-100 text-amber-700', icon: '👥' };
            case 'practice': return { label: 'Practice', color: 'bg-green-100 text-green-700', icon: '🎼' };
            default: return { label: 'Other', color: 'bg-gray-100 text-gray-700', icon: '📅' };
        }
    };

    const renderItem = ({ item }: { item: UnifiedItem }) => {
        const badge = getBadge(item.type);
        const isRoutine = item.type === 'practice';
        const today = new Date().toLocaleDateString('en-CA');
        const isToday = item.date === today;

        return (
            <View className={`mb-4 bg-card border ${isToday ? 'border-blue-200 shadow-blue-50' : 'border-border'} rounded-[32px] overflow-hidden shadow-sm`}>
                <TouchableOpacity
                    className="p-5"
                    onPress={() => {
                        const pathname = isRoutine ? '/modal/routine-editor' : '/modal/event-editor';
                        const relatedId = isRoutine ? (item.originalItem as Routine).id : (item.originalItem as AppEvent).id;
                        router.push({ pathname, params: { id: relatedId } });
                    }}
                >
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1 mr-4">
                            <View className={`self-start px-2 py-0.5 rounded-lg mb-2 ${badge.color}`}>
                                <Text className="text-[9px] uppercase font-black tracking-widest">{badge.label}</Text>
                            </View>
                            <Text className="text-xl font-bold text-foreground leading-tight">{item.title}</Text>
                            {!isRoutine && (item.originalItem as AppEvent).venue && (
                                <Text className="text-sm font-semibold text-muted-foreground mt-1">@ {(item.originalItem as AppEvent).venue}</Text>
                            )}
                            {item.type === 'lesson' && (item.originalItem as AppEvent).studentName && (
                                <Text className="text-sm font-bold text-purple-600 mt-1">Student: {(item.originalItem as AppEvent).studentName}</Text>
                            )}
                        </View>
                        {!isRoutine && (item.originalItem as AppEvent).fee && (
                            <View className="bg-green-100 px-2 py-1 rounded-xl">
                                <Text className="text-[10px] font-black text-green-700">{(item.originalItem as AppEvent).fee}</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <Text className="text-xs mr-2">{isToday ? '✨' : '📅'}</Text>
                            <Text className={`text-xs font-bold ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>{isToday ? 'Today' : formatDate(item.date)}</Text>
                        </View>
                        <View className="flex-row items-center bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                            <Text className="text-xs mr-2">🕒</Text>
                            <Text className="text-xs font-bold text-gray-600">{formatDisplayTime(item.time)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {!isRoutine && (
                    <TouchableOpacity
                        onPress={() => handleDeleteEvent(item.originalItem.id, item.type)}
                        className="absolute top-5 right-5 p-3"
                    >
                        <Ionicons name="trash-outline" size={22} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const filterOptions: { key: ScheduleFilter; label: string; icon: string }[] = [
        { key: 'performance', label: 'Gigs', icon: '🎸' },
        { key: 'lesson', label: 'Lessons', icon: '👨‍🏫' },
        { key: 'rehearsal', label: 'Rehearsals', icon: '👥' },
        { key: 'practice', label: 'Practice', icon: '🎼' },
    ];

    return (
        <View className="flex-1 bg-gray-50">
            <View className="p-8 pb-4">
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-4xl font-black text-gray-900 tracking-tight">Schedule</Text>
                        <Text className="text-gray-500 font-medium text-base mt-1">Your entire musical life</Text>
                    </View>
                    <Link href="/modal/event-editor" asChild>
                        <TouchableOpacity className="bg-blue-600 px-6 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-400">
                            <Ionicons name="add" size={24} color="white" />
                            <Text className="text-white text-lg font-bold ml-1">New Event</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                <View className="flex-row flex-wrap gap-3">
                    {filterOptions.map(opt => {
                        const isActive = activeFilters.includes(opt.key);
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => toggleFilter(opt.key)}
                                className={`flex-row items-center px-5 py-2.5 rounded-full border ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                            >
                                <Text className="mr-2 text-sm">{opt.icon}</Text>
                                <Text className={`text-xs uppercase font-black tracking-widest ${isActive ? 'text-white' : 'text-gray-500'}`}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            <FlatList
                data={unifiedData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-24">
                        <View className="w-32 h-32 bg-gray-50 rounded-full items-center justify-center mb-6 border border-gray-100">
                            <Text className="text-6xl">🗓️</Text>
                        </View>
                        <Text className="text-2xl font-black text-foreground">Nothing Scheduled</Text>
                        <Text className="text-muted-foreground text-center mt-3 px-12 leading-relaxed font-medium">
                            Adjust your filters or add a new event/routine to fill your schedule.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
