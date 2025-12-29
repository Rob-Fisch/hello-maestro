import { useContentStore } from '@/store/contentStore';
import { AppEvent, AppEventType, Person, Routine } from '@/store/types';
import { addUnifiedToCalendar } from '@/utils/calendar';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScheduleFilter = AppEventType | 'practice';

interface UnifiedItem {
    id: string;
    date: string;
    time: string;
    title: string;
    type: ScheduleFilter;
    originalItem: AppEvent | Routine;
}

import { useTheme } from '@/lib/theme';
import { useEffect } from 'react';

export default function ScheduleScreen() {
    const { events = [], routines = [], people = [], settings, deleteEvent, trackModuleUsage } = useContentStore();

    useEffect(() => {
        trackModuleUsage('events');
    }, []);

    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const { filter } = useLocalSearchParams();
    const [activeFilters, setActiveFilters] = useState<ScheduleFilter[]>(() => {
        if (filter) {
            const filterParam = Array.isArray(filter) ? filter[0] : filter;
            // Validate that the filter is a valid ScheduleFilter
            if (['performance', 'lesson', 'rehearsal', 'practice'].includes(filterParam)) {
                return [filterParam as ScheduleFilter];
            }
        }
        return ['performance', 'lesson', 'rehearsal', 'practice'];
    });


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
            const msg = `Are you sure you want to remove this ${type}?`;
            if (confirm(msg)) deleteEvent(id);
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

    const getEndTime = (startTime: string, duration?: number) => {
        if (!duration) return null;
        const [hours, minutes] = startTime.split(':').map(Number);
        const start = new Date();
        start.setHours(hours, minutes, 0, 0);
        const end = new Date(start.getTime() + duration * 60000);
        const endHours = end.getHours().toString().padStart(2, '0');
        const endMinutes = end.getMinutes().toString().padStart(2, '0');
        return formatDisplayTime(`${endHours}:${endMinutes}`);
    };

    const handleMessage = (event: AppEvent) => {
        const personnel = (event.personnelIds || [])
            .map((id: string) => people.find((p: Person) => p.id === id))
            .filter((p: Person | undefined): p is Person => !!p);

        if (personnel.length === 0) {
            Alert.alert('No Personnel', 'This event has no people linked to it.');
            return;
        }

        const phoneNumbers = personnel
            .map((p: Person) => p.phone)
            .filter((phone: string | undefined): phone is string => !!phone);

        if (phoneNumbers.length === 0) {
            Alert.alert('No Phone Numbers', 'None of the linked personnel have phone numbers saved.');
            return;
        }

        const templates = settings?.messageTemplates || [];
        if (templates.length === 0) {
            // Default iMessage behavior
            const recipients = phoneNumbers.join(',');
            Linking.openURL(`sms:${recipients}`);
            return;
        }

        Alert.alert(
            'Message Group',
            'Choose a template to send to the group:',
            [
                ...templates.map(tmp => ({
                    text: tmp,
                    onPress: () => {
                        const recipients = phoneNumbers.join(',');
                        const message = tmp.replace('{event}', event.title).replace('{time}', formatDisplayTime(event.time));
                        Linking.openURL(`sms:${recipients}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`);
                    }
                })),
                { text: 'Cancel', style: 'cancel' } as const
            ]
        );
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
            <View className={`mb-4 border ${isToday ? 'shadow-blue-50' : ''} rounded-[32px] overflow-hidden shadow-sm`} style={{ backgroundColor: theme.card, borderColor: isToday ? '#bfdbfe' : theme.border }}>
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
                            <Text className="text-xl font-bold leading-tight" style={{ color: theme.text }}>{item.title}</Text>
                            {!isRoutine && (item.originalItem as AppEvent).venue && (
                                <Text className="text-sm font-semibold mt-1" style={{ color: theme.mutedText }}>@ {(item.originalItem as AppEvent).venue}</Text>
                            )}
                            {item.type === 'lesson' && (item.originalItem as AppEvent).studentName && (
                                <Text className="text-sm font-bold text-purple-600 mt-1">Student: {(item.originalItem as AppEvent).studentName}</Text>
                            )}
                        </View>
                        {!isRoutine && ((item.originalItem as AppEvent).totalFee || (item.originalItem as AppEvent).fee) && (
                            <View className="bg-green-100 px-2 py-1 rounded-xl">
                                <Text className="text-[10px] font-black text-green-700">{(item.originalItem as AppEvent).totalFee || (item.originalItem as AppEvent).fee}</Text>
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
                            <Text className="text-xs font-bold text-gray-600">
                                {formatDisplayTime(item.time)}
                                {item.type !== 'practice' && (item.originalItem as AppEvent).duration && (
                                    <> - {getEndTime(item.time, (item.originalItem as AppEvent).duration!)}</>
                                )}
                            </Text>
                        </View>
                        {item.type !== 'practice' && (item.originalItem as AppEvent).duration && (
                            <View className="hidden md:flex flex-row items-center bg-blue-50/50 px-3 py-1.5 rounded-xl border border-blue-100/50">
                                <Text className="text-[10px] font-bold text-blue-600">
                                    {(item.originalItem as AppEvent).duration! < 60
                                        ? `${(item.originalItem as AppEvent).duration}m`
                                        : `${Math.floor((item.originalItem as AppEvent).duration! / 60)}h${(item.originalItem as AppEvent).duration! % 60 > 0 ? ` ${(item.originalItem as AppEvent).duration! % 60}m` : ''}`
                                    }
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mt-4 border-t border-gray-50 pt-3">
                        {/* Musicians / Slots Row */}
                        {!isRoutine && (
                            <View className="flex-row flex-wrap gap-2 mb-2">
                                {/* Prefer Slots */}
                                {(item.originalItem as AppEvent).slots?.map((slot: any) => {
                                    const musician = people.find(p => p.id === slot.musicianId);
                                    return (
                                        <View key={slot.id} className={`flex-row items-center px-2 py-1 rounded-lg border ${slot.status === 'confirmed' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'}`}>
                                            <Text className="text-[10px]">👤</Text>
                                            <Text className="text-[10px] font-bold ml-1 text-gray-700">
                                                {musician ? `${slot.role} (${musician.firstName} ${musician.lastName})` : `${slot.role} (-unassigned-)`}
                                            </Text>
                                        </View>
                                    );
                                })}

                                {/* Fallback to Personnel IDs if no slots */}
                                {(!((item.originalItem as AppEvent).slots) || (item.originalItem as AppEvent).slots?.length === 0) && (item.originalItem as AppEvent).personnelIds?.map((pid: string) => {
                                    const person = people.find(p => p.id === pid);
                                    if (!person) return null;
                                    return (
                                        <View key={pid} className="flex-row items-center px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">
                                            <Text className="text-[10px]">👤</Text>
                                            <Text className="text-[10px] font-bold ml-1 text-blue-700">{person.firstName} {person.lastName}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        <View className="flex-row justify-between items-center">
                            {!isRoutine && ((item.originalItem as AppEvent).slots?.length > 0 || ((item.originalItem as AppEvent).personnelIds && (item.originalItem as AppEvent).personnelIds!.length > 0)) && (
                                <TouchableOpacity
                                    onPress={() => handleMessage(item.originalItem as AppEvent)}
                                    className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
                                >
                                    <Ionicons name="chatbubble-outline" size={14} color="#2563eb" />
                                    <Text className="text-blue-600 font-bold text-xs ml-1.5">Message Group</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity
                                onPress={() => addUnifiedToCalendar({
                                    title: item.title,
                                    date: item.date,
                                    time: item.time,
                                    venue: !isRoutine ? (item.originalItem as AppEvent).venue : undefined,
                                    notes: !isRoutine ? (item.originalItem as AppEvent).notes : (item.originalItem as Routine).description,
                                    duration: !isRoutine ? (item.originalItem as AppEvent).duration : undefined,
                                })}
                                className="flex-row items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100"
                            >
                                <Ionicons name="calendar-outline" size={14} color="#64748b" />
                                <Text className="text-gray-600 font-bold text-xs ml-1.5">Sync to Calendar</Text>
                            </TouchableOpacity>
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
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View style={{ paddingTop: Math.max(insets.top, 20), paddingHorizontal: 32, paddingBottom: 16 }}>
                <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center">
                        {(Array.isArray(filter) ? filter[0] : filter) === 'performance' ? (
                            <TouchableOpacity onPress={() => router.push('/(drawer)/gigs')} className="mr-5 p-2 -ml-2 rounded-full">
                                <Ionicons name="arrow-back" size={28} color="white" />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => router.push('/')} className="mr-5 p-2 -ml-2 rounded-full">
                                <Ionicons name="home-outline" size={28} color="white" />
                            </TouchableOpacity>
                        )}
                        <View>
                            <Text className="text-4xl font-black tracking-tight text-white">Schedule</Text>
                            <Text className="font-medium text-base mt-1 text-teal-100">Your entire musical life</Text>
                        </View>
                    </View>
                    <Link href="/modal/event-editor" asChild>
                        <TouchableOpacity className="px-6 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-400" style={{ backgroundColor: theme.primary }}>
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
                                className={`flex-row items-center px-5 py-2.5 rounded-full border`}
                                style={{
                                    backgroundColor: isActive ? theme.primary : theme.card,
                                    borderColor: isActive ? theme.primary : theme.border
                                }}
                            >
                                <Text className="mr-2 text-sm">{opt.icon}</Text>
                                <Text className={`text-xs uppercase font-black tracking-widest ${isActive ? 'text-white' : ''}`} style={{ color: isActive ? '#fff' : theme.mutedText }}>
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
