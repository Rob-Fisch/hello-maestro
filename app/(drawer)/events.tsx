import { useContentStore } from '@/store/contentStore';
import { AppEvent, AppEventType, Person, Routine } from '@/store/types';
import { addUnifiedToCalendar, downloadIcs, openGoogleCalendar } from '@/utils/calendar';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import * as Linking from 'expo-linking';
import { Link, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
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
import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export default function ScheduleScreen() {
    const { events = [], routines = [], people = [], settings, profile, deleteEvent, trackModuleUsage } = useContentStore();

    useEffect(() => {
        trackModuleUsage('events');
    }, []);

    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Animation Logic
    const breathingOpacity = useRef(new Animated.Value(0.25)).current;

    useEffect(() => {
        // Breathing Loop (5s in, 5s out = 10s total)
        Animated.loop(
            Animated.sequence([
                Animated.timing(breathingOpacity, {
                    toValue: 1,
                    duration: 5000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(breathingOpacity, {
                    toValue: 0.25,
                    duration: 5000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const { filter, source } = useLocalSearchParams();
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
        // Updated colors for Dark Theme - using specific text colors instead of bg colors
        switch (type) {
            case 'performance': return { label: 'Performance', className: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30', icon: '🎸' };
            case 'lesson': return { label: 'Lesson', className: 'bg-purple-500/20 text-purple-300 border border-purple-500/30', icon: '👨‍🏫' };
            case 'rehearsal': return { label: 'Rehearsal', className: 'bg-amber-500/20 text-amber-300 border border-amber-500/30', icon: '👥' };
            case 'practice': return { label: 'Routines', className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30', icon: '🎼' };
            default: return { label: 'Other', className: 'bg-slate-700 text-slate-300 border border-slate-600', icon: '📅' };
        }
    };

    const renderItem = ({ item }: { item: UnifiedItem }) => {
        const badge = getBadge(item.type);
        const isRoutine = item.type === 'practice';
        const today = new Date().toLocaleDateString('en-CA');
        const isToday = item.date === today;
        const calItem = {
            title: item.title,
            date: item.date,
            time: item.time,
            venue: !isRoutine ? (item.originalItem as AppEvent).venue : undefined,
            notes: !isRoutine ? (item.originalItem as AppEvent).notes : (item.originalItem as Routine).description,
            duration: !isRoutine ? (item.originalItem as AppEvent).duration : undefined,
        };

        return (
            <View
                className={`mb-4 rounded-[32px] overflow-hidden`}
                style={{
                    backgroundColor: theme.card, // Glass
                    borderColor: isToday ? '#60a5fa' : theme.border, // Blue border if today
                    borderWidth: 1
                }}
            >
                <TouchableOpacity
                    className="p-5"
                    onPress={() => {
                        const pathname = isRoutine ? '/modal/routine-editor' : '/event/[id]';
                        const relatedId = isRoutine ? (item.originalItem as Routine).id : (item.originalItem as AppEvent).id;
                        router.push({ pathname, params: { id: relatedId } });
                    }}
                >
                    <View className="flex-row justify-between items-start mb-3">
                        <View className="flex-1 mr-2">
                            <View className={`self-start px-2 py-0.5 rounded-lg mb-2 ${badge.className}`}>
                                <Text className={`text-[9px] uppercase font-black tracking-widest ${badge.className.split(' ').find(c => c.startsWith('text-'))}`}>{badge.label}</Text>
                            </View>
                            <Text className="text-xl font-bold leading-tight" style={{ color: theme.text }}>{item.title}</Text>
                            {!isRoutine && (item.originalItem as AppEvent).venue && (
                                <Text className="text-sm font-semibold mt-1" style={{ color: theme.mutedText }}>@ {(item.originalItem as AppEvent).venue}</Text>
                            )}
                            {item.type === 'lesson' && (item.originalItem as AppEvent).studentName && (
                                <Text className="text-sm font-bold text-purple-400 mt-1">Student: {(item.originalItem as AppEvent).studentName}</Text>
                            )}
                        </View>

                        {/* Right Side: Fee + Delete Action */}
                        <View className="flex-row items-center gap-3">
                            {!isRoutine && ((item.originalItem as AppEvent).totalFee || (item.originalItem as AppEvent).fee) && (
                                <View className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-1.5 rounded-xl flex-row items-center">
                                    <Ionicons name="briefcase-outline" size={10} color="#34d399" style={{ marginRight: 4 }} />
                                    <Text className="text-[10px] font-black text-emerald-400">
                                        ${(item.originalItem as AppEvent).totalFee || (item.originalItem as AppEvent).fee}
                                    </Text>
                                </View>
                            )}

                            {!isRoutine && (
                                <TouchableOpacity
                                    onPress={() => handleDeleteEvent(item.originalItem.id, item.type)}
                                    className="p-2 -mr-2" // Negative margin to align visually with edge
                                >
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View className="flex-row items-center gap-3">
                        {/* DATE BADGE */}
                        <View className={`flex-row items-center px-3 py-1.5 rounded-xl border ${isToday ? 'bg-blue-500/20 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                            <Text className="text-xs mr-2">{isToday ? '✨' : '📅'}</Text>
                            <Text className={`text-xs font-bold ${isToday ? 'text-blue-300' : 'text-slate-400'}`}>{isToday ? 'Today' : formatDate(item.date)}</Text>
                        </View>

                        {/* TIME BADGE */}
                        <View className="flex-row items-center bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                            <Text className="text-xs mr-2">🕒</Text>
                            <Text className="text-xs font-bold text-slate-400">
                                {formatDisplayTime(item.time)}
                                {item.type !== 'practice' && (item.originalItem as AppEvent).duration && (
                                    <> - {getEndTime(item.time, (item.originalItem as AppEvent).duration!)}</>
                                )}
                            </Text>
                        </View>

                        {item.type !== 'practice' && (item.originalItem as AppEvent).duration && (
                            <View className="hidden md:flex flex-row items-center bg-blue-500/10 px-3 py-1.5 rounded-xl border border-blue-500/20">
                                <Text className="text-[10px] font-bold text-blue-400">
                                    {(item.originalItem as AppEvent).duration! < 60
                                        ? `${(item.originalItem as AppEvent).duration}m`
                                        : `${Math.floor((item.originalItem as AppEvent).duration! / 60)}h${(item.originalItem as AppEvent).duration! % 60 > 0 ? ` ${(item.originalItem as AppEvent).duration! % 60}m` : ''}`
                                    }
                                </Text>
                            </View>
                        )}
                    </View>

                    <View className="mt-4 border-t border-white/5 pt-3">
                        {/* Musicians / Slots Row */}
                        {!isRoutine && (
                            <View className="flex-row flex-wrap gap-2 mb-2">
                                {/* Prefer Slots */}
                                {(item.originalItem as AppEvent).slots?.map((slot: any) => {
                                    const musician = people.find(p => p.id === slot.musicianId);
                                    const isConfirmed = slot.status === 'confirmed';
                                    return (
                                        <View key={slot.id} className={`flex-row items-center px-2 py-1 rounded-lg border ${isConfirmed ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-white/5 border-white/10'}`}>
                                            <Text className="text-[10px]">👤</Text>
                                            <Text className={`text-[10px] font-bold ml-1 ${isConfirmed ? 'text-emerald-400' : 'text-slate-400'}`}>
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
                                        <View key={pid} className="flex-row items-center px-2 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <Text className="text-[10px]">👤</Text>
                                            <Text className="text-[10px] font-bold ml-1 text-blue-300">{person.firstName} {person.lastName}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}

                        <View className="flex-row justify-between items-center">
                            {!isRoutine && ((item.originalItem as AppEvent).slots?.length > 0 || ((item.originalItem as AppEvent).personnelIds && (item.originalItem as AppEvent).personnelIds!.length > 0)) && (
                                <TouchableOpacity
                                    onPress={() => handleMessage(item.originalItem as AppEvent)}
                                    className="flex-row items-center bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30"
                                >
                                    <Ionicons name="chatbubble-outline" size={14} color="#60a5fa" />
                                    <Text className="text-blue-300 font-bold text-xs ml-1.5">Message Group</Text>
                                </TouchableOpacity>
                            )}

                            {Platform.OS === 'web' ? (
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => downloadIcs(calItem)}
                                        className="flex-row items-center bg-white/5 px-3 py-2 rounded-full border border-white/10"
                                    >
                                        <Ionicons name="download-outline" size={14} color="#94a3b8" />
                                        <Text className="text-slate-400 font-bold text-xs ml-1.5">ICS</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        onPress={() => openGoogleCalendar(calItem)}
                                        className="flex-row items-center bg-blue-500/10 px-3 py-2 rounded-full border border-blue-500/20"
                                    >
                                        <Ionicons name="logo-google" size={14} color="#60a5fa" />
                                        <Text className="text-blue-300 font-bold text-xs ml-1.5">Google</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    onPress={() => {
                                        Alert.alert(
                                            'Sync to Calendar',
                                            'Choose destination:',
                                            [
                                                { text: 'Cancel', style: 'cancel' },
                                                { text: 'Google Calendar (Web)', onPress: () => openGoogleCalendar(calItem) },
                                                { text: 'Device Calendar', onPress: () => addUnifiedToCalendar(calItem) }
                                            ]
                                        );
                                    }}
                                    className="flex-row items-center bg-white/5 px-4 py-2 rounded-full border border-white/10"
                                >
                                    <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                                    <Text className="text-slate-400 font-bold text-xs ml-1.5">Sync to Calendar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    const filterOptions: { key: ScheduleFilter; label: string; icon: string }[] = [
        { key: 'performance', label: 'Performance', icon: '🎸' },
        { key: 'lesson', label: 'Lessons', icon: '👨‍🏫' },
        { key: 'rehearsal', label: 'Rehearsals', icon: '👥' },
        { key: 'practice', label: 'Routines', icon: '🎼' },
    ];

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header with Home Button - Top of Page (Replicated from Studio) */}
            <View className="px-6 flex-row items-start pt-8 mb-2" style={{ paddingTop: insets.top }}>
                {source === 'gigs' ? (
                    <TouchableOpacity
                        onPress={() => router.push('/gigs')}
                        className="mr-5 p-2 rounded-full bg-rose-500/10 border border-rose-500/20"
                    >
                        <Ionicons name="arrow-back" size={24} color="#fb7185" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        className="mr-5 p-2 rounded-full bg-white/5 border border-white/10"
                    >
                        <Ionicons name="menu" size={24} color="white" />
                    </TouchableOpacity>
                )}
                <View className="flex-1 flex-row justify-between items-start">
                    <View>
                        <Text className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-1">
                            Calendar
                        </Text>
                        <Text className="text-4xl font-black tracking-tight text-white">
                            Schedule
                        </Text>
                    </View>
                    <View className="flex-row gap-2">
                        <Link href="/modal/event-editor" asChild>
                            <TouchableOpacity className="w-12 h-12 rounded-2xl items-center justify-center bg-indigo-600 shadow-lg shadow-indigo-500/20">
                                <Ionicons name="add" size={28} color="white" />
                            </TouchableOpacity>
                        </Link>
                    </View>
                </View>
            </View>

            <FlatList
                ListHeaderComponent={
                    <>
                        {/* Hero Image Section - Dark & Moody */}
                        <View className="w-full aspect-square max-h-[300px] mb-6 self-center shadow-2xl shadow-indigo-900/40">
                            <Animated.Image
                                source={require('@/assets/images/schedule_clock.png')}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    borderRadius: 32,
                                    opacity: breathingOpacity
                                }}
                                resizeMode="contain"
                            />
                        </View>

                        <View className="px-6 pb-4">
                            {/* PRODUCT ADOPTION HOOK */}
                            {/* PRODUCT ADOPTION HOOK - SUBTLE VERSION */}
                            {!profile?.isPremium && (
                                <TouchableOpacity
                                    onPress={() => router.push('/(drawer)/finance')}
                                    className="mb-6 flex-row items-center justify-between py-3 px-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20"
                                >
                                    <View className="flex-row items-center flex-1">
                                        <Ionicons name="cash-outline" size={16} color="#818cf8" style={{ marginRight: 8 }} />
                                        <Text className="text-indigo-200 font-bold text-xs">
                                            Want to track gig income? <Text className="text-indigo-400">See how Pro works</Text>
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={14} color="#818cf8" />
                                </TouchableOpacity>
                            )}

                            <View className="flex-row flex-wrap gap-3 justify-center">
                                {filterOptions.map(opt => {
                                    const isActive = activeFilters.includes(opt.key);
                                    return (
                                        <TouchableOpacity
                                            key={opt.key}
                                            onPress={() => toggleFilter(opt.key)}
                                            className={`flex-row items-center px-5 py-2.5 rounded-full border`}
                                            style={{
                                                backgroundColor: isActive ? 'white' : 'transparent',
                                                borderColor: isActive ? 'white' : 'rgba(255,255,255,0.1)'
                                            }}
                                        >
                                            <Text className="mr-2 text-sm">{opt.icon}</Text>
                                            <Text className={`text-xs uppercase font-black tracking-widest ${isActive ? 'text-black' : 'text-slate-400'}`}>
                                                {opt.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </>
                }
                data={unifiedData}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-24">
                        <View className="w-32 h-32 bg-white/5 rounded-full items-center justify-center mb-6 border border-white/10">
                            <Text className="text-6xl">🗓️</Text>
                        </View>
                        <Text className="text-2xl font-black text-white">Nothing Scheduled</Text>
                        <Text className="text-slate-400 text-center mt-3 px-12 leading-relaxed font-medium">
                            Adjust your filters or add a new event/routine to fill your schedule.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
