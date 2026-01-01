import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function HomeScreen() {
    const { blocks, routines, events, profile, syncStatus, fullSync, recentModuleIds, trackModuleUsage, sessionLogs, progress } = useContentStore();

    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    const todayDay = today.getDay();

    const todaysRoutines = (routines || []).filter(r => {
        if (!r.schedule) return false;
        if (r.schedule.type === 'date' && r.schedule.date === todayStr) return true;
        if (r.schedule.type === 'recurring' && r.schedule.daysOfWeek?.includes(todayDay)) {
            const start = r.schedule.startDate ? new Date(r.schedule.startDate + 'T00:00:00') : null;
            const end = r.schedule.endDate ? new Date(r.schedule.endDate + 'T23:59:59') : null;
            if ((!start || today >= start) && (!end || today <= end)) return true;
        }
        return false;
    });

    const todaysEvents = (events || []).filter(e => {
        if (e.schedule?.type === 'recurring') {
            const { startDate, endDate, daysOfWeek } = e.schedule;
            if (!startDate || !endDate || !daysOfWeek) return false;
            const start = new Date(startDate + 'T00:00:00');
            const end = new Date(endDate + 'T23:59:59');
            return today >= start && today <= end && daysOfWeek.includes(todayDay);
        }
        return e.date === todayStr;
    });

    // Calculate Date Ranges
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter Logic
    const countEventsInRange = (start: Date, end: Date) => {
        return (events || []).filter(e => {
            if (e.schedule?.type === 'recurring') {
                return true;
            }
            // Force local time parsing to match 'start' which is local
            const eDate = new Date(e.date + 'T00:00:00');
            return eDate >= start && eDate <= end;
        }).length;
    };

    const upcomingEventsCount = countEventsInRange(startOfWeek, endOfWeek);
    const isMock = profile?.id.startsWith('mock-');


    const mainModules = [
        {
            title: 'Studio',
            subtitle: 'Creative Hub',
            icon: 'layers-outline',
            path: '/studio',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/20',
            description: 'Levels 1 & 2'
        },
        {
            title: 'Performance Management',
            subtitle: 'Contracts & Sets',
            icon: 'musical-notes-outline',
            path: '/gigs',
            color: 'text-rose-400',
            bg: 'bg-rose-500/20',
            description: 'Bookings & Logistics'
        },
        {
            title: 'Schedule',
            subtitle: 'Calendar',
            icon: 'calendar-outline',
            path: '/events',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            description: 'Gigs, Rehearsals'
        },
        {
            title: 'Contacts',
            subtitle: 'People & Roster',
            icon: 'people-outline',
            path: '/people',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
            description: 'Bandmates, Venues'
        },

        {
            title: 'Scout',
            subtitle: 'AI Intel',
            icon: 'telescope-outline',
            path: '/scout',
            color: 'text-orange-400',
            bg: 'bg-orange-500/20',
            description: 'Lead Gen & Prompts'
        },
        {
            title: 'System',
            subtitle: 'Config & Help',
            icon: 'settings-outline',
            path: '/settings',
            color: 'text-slate-400',
            bg: 'bg-slate-500/20',
            description: 'Preferences, FAQ'
        },
    ];

    return (
        <ScrollView className="flex-1 p-6" style={{ backgroundColor: theme.background, height: Platform.OS === 'web' ? '100vh' as any : undefined }}>
            <View className="mb-8" style={{ marginTop: Math.max(insets.top, 20) }}>
                {/* Header Profile Section */}
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-[10px] font-black uppercase tracking-[3px] mb-2 px-1 text-slate-400">Maestro Hub</Text>
                        <Text className="text-4xl font-black tracking-tighter leading-tight text-white">
                            {profile?.displayName ? `Hello, ${profile.displayName}!` : 'OpusMode'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            if (isMock) {
                                Alert.alert('Offline Mode', 'You are currently in a mock session. Sign in with a real account to enable cloud sync.');
                            } else {
                                fullSync();
                            }
                        }}
                        className={`flex-row items-center px-4 py-2 rounded-full border min-w-[100px] justify-center shadow-sm ${syncStatus === 'synced' ? 'bg-emerald-500/10 border-emerald-500/20' :
                            syncStatus === 'syncing' ? 'bg-blue-500/10 border-blue-500/20' :
                                'bg-white/5 border-white/10'
                            }`}
                    >
                        <View className={`w-2 h-2 rounded-full mr-2 ${syncStatus === 'synced' ? 'bg-emerald-400' :
                            syncStatus === 'syncing' ? 'bg-blue-400' :
                                'bg-slate-400'
                            }`} />
                        <Text className={`text-[10px] font-black uppercase tracking-normal ${syncStatus === 'synced' ? 'text-emerald-100' :
                            syncStatus === 'syncing' ? 'text-blue-100' :
                                'text-slate-400'
                            }`}>
                            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Consistency Graph (Heatmap) */}
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

                {/* SECTION 1: TOP OF THE FOLD (Daily Briefing) */}
                <TouchableOpacity
                    onPress={() => router.push('/events')}
                    className="p-6 rounded-[32px] mb-8 border shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                    <View className="absolute top-0 right-0 p-6 opacity-20">
                        <Ionicons name="calendar" size={120} color={theme.text} />
                    </View>

                    <View className="flex-row items-baseline mb-2 relative z-10">
                        <Text className="text-6xl font-black tracking-tighter text-white">
                            {todaysEvents.length}
                        </Text>
                        <Text className="text-xl font-bold ml-2 text-slate-200">
                            Events Today
                        </Text>
                    </View>

                    <View className="w-[70%] relative z-10">
                        <Text className="font-medium text-base mb-4 text-slate-400">
                            You also have <Text className="text-white font-bold">{upcomingEventsCount}</Text> items on the schedule for the next 7 days.
                        </Text>
                    </View>

                    <View className="flex-row items-center relative z-10">
                        <Text className="font-bold text-sm uppercase tracking-wider mr-2 text-white">View Schedule</Text>
                        <Ionicons name="arrow-forward" size={16} color="white" />
                    </View>
                </TouchableOpacity>


                {/* VENUE MANAGEMENT PROMO - Updated to Dark Glass Orange */}
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/people', params: { filter: 'venue_manager' } })}
                    className="p-6 rounded-[32px] mb-8 border border-orange-500/20 bg-orange-500/10 shadow-sm relative overflow-hidden"
                >
                    <View className="absolute -right-4 -bottom-4 opacity-10">
                        <Ionicons name="business" size={140} color="#f97316" />
                    </View>

                    <View className="relative z-10 mb-2 flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-orange-500 mr-2" />
                        <Text className="font-black text-[10px] uppercase tracking-widest text-orange-400 mb-0">Feature Spotlight</Text>
                    </View>

                    <Text className="text-2xl font-black text-white leading-tight mb-2 relative z-10">Venue Manager</Text>

                    <Text className="text-orange-200/60 font-medium mb-4 relative z-10 w-[85%] leading-snug">
                        Track booking history and manage relationships with venue owners.
                    </Text>

                    <View className="flex-row items-center relative z-10">
                        <Text className="font-bold text-xs uppercase tracking-wider mr-2 text-orange-400">Open Venues</Text>
                        <Ionicons name="arrow-forward" size={14} color="#f97316" />
                    </View>
                </TouchableOpacity>

                {/* FREE TIER SYNC WARNING */}
                {profile && !profile.isPremium && !isMock && syncStatus === 'synced' && (
                    <View className="mb-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex-row items-start">
                        <View className="mr-3 mt-1 bg-blue-500/20 p-1.5 rounded-full">
                            <Ionicons name="cloud-offline-outline" size={16} color="#60a5fa" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-blue-100 text-sm mb-1">Backup Active (Free Tier)</Text>
                            <Text className="text-blue-200/50 text-xs leading-relaxed">
                                Your data is safely backed up ("Puddle Proof"), but will not sync to your other devices until you upgrade.
                            </Text>
                        </View>
                    </View>
                )}

                {/* DIVIDER */}
                <View className="h-[1px] w-full mb-8 opacity-10 bg-white" />


                {/* SECTION 2: STUDIO & TOOLS (Switchboard Grid) */}
                <Text className="text-2xl font-black tracking-tight mb-6 text-white">
                    Studio & Tools
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    {mainModules.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            onPress={() => router.push(item.path as any)}
                            activeOpacity={0.7}
                            className="w-[48%] mb-4 p-4 rounded-[28px] border shadow-sm relative overflow-hidden h-[160px] justify-between"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <View>
                                {/* Icon Box */}
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mb-4 bg-white/5 border border-white/5`}>
                                    <Ionicons name={item.icon as any} size={20} color="white" />
                                </View>
                                <Text className="text-base font-black tracking-tight leading-none mb-1 text-white">
                                    {item.title}
                                </Text>
                                <Text className={`text-[9px] font-bold uppercase tracking-wider ${item.color}`}>
                                    {item.subtitle}
                                </Text>
                            </View>

                            <Text className="text-[11px] mt-3 leading-tight opacity-40 font-medium text-white">
                                {item.description}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Footer Padding */}
                <View className="h-20" />
            </View>
        </ScrollView>
    );
}
