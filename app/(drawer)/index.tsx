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
    const startOfWeek = new Date(today);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    // Filter Logic
    const countEventsInRange = (start: Date, end: Date) => {
        return (events || []).filter(e => {
            if (e.schedule?.type === 'recurring') {
                // Simplified recurring logic for stats (checking if it happens at least once in range)
                // Ideally we'd expand occurrences, but for specific counts we might just check active status
                // For "Today", we use exact match logic
                return true; // Simplified: Assuming recurring events "exist" this week
            }
            const eDate = new Date(e.date);
            return eDate >= start && eDate <= end;
        }).length;
    };

    const upcomingEventsCount = countEventsInRange(today, endOfWeek);
    const todaysEventsCount = todaysEvents.length;
    // todaysEvents logic assumed from existing code (lines 32-41 of original file, which count as 'todaysEvents')
    // We can reuse the existing `todaysEvents` variable defined above this replacement block.
    const isMock = profile?.id.startsWith('mock-');


    const mainModules = [
        {
            title: 'Studio',
            subtitle: 'Creative Hub',
            icon: 'layers-outline',
            path: '/studio',
            color: 'bg-indigo-500',
            description: 'Levels 1 & 2'
        },
        {
            title: 'Schedule',
            subtitle: 'Calendar & CRM',
            icon: 'calendar-outline',
            path: '/events',
            color: 'bg-blue-500',
            description: 'Gigs, Rehearsals'
        },
        {
            title: 'Contacts',
            subtitle: 'People & Roster',
            icon: 'people-outline',
            path: '/people',
            color: 'bg-purple-500',
            description: 'Bandmates, Venues'
        },
        {
            title: 'Vault',
            subtitle: 'Gear Inventory',
            icon: 'briefcase-outline',
            path: '/gear-vault',
            color: 'bg-emerald-500',
            description: 'Instruments, Tech'
        },
        {
            title: 'Scout',
            subtitle: 'AI Intel',
            icon: 'telescope-outline',
            path: '/scout',
            color: 'bg-orange-500',
            description: 'Lead Gen & Prompts'
        },
        {
            title: 'System',
            subtitle: 'Config & Help',
            icon: 'settings-outline',
            path: '/settings',
            color: 'bg-gray-500',
            description: 'Preferences, FAQ'
        },
    ];

    return (
        <ScrollView className="flex-1 p-6" style={{ backgroundColor: theme.background, height: Platform.OS === 'web' ? '100vh' as any : undefined }}>
            <View className="mb-8" style={{ marginTop: Math.max(insets.top, 20) }}>
                {/* Header Profile Section */}
                <View className="flex-row justify-between items-start mb-6">
                    <View className="flex-1 mr-4">
                        <Text className="text-[10px] font-black uppercase tracking-[3px] mb-2 px-1" style={{ color: theme.primary }}>Maestro Hub</Text>
                        <Text className="text-4xl font-black tracking-tighter leading-tight" style={{ color: theme.text }}>
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
                        className={`flex-row items-center px-4 py-2 rounded-2xl border min-w-[100px] justify-center shadow-sm ${syncStatus === 'synced' ? 'bg-green-50 border-green-100' :
                            syncStatus === 'syncing' ? 'bg-blue-50 border-blue-100' :
                                'bg-gray-50 border-gray-100'
                            }`}
                    >
                        <View className={`w-2 h-2 rounded-full mr-2 ${syncStatus === 'synced' ? 'bg-green-500' :
                            syncStatus === 'syncing' ? 'bg-blue-500' :
                                'bg-gray-400'
                            }`} />
                        <Text className={`text-[10px] font-black uppercase tracking-normal ${syncStatus === 'synced' ? 'text-green-700' :
                            syncStatus === 'syncing' ? 'text-blue-700' :
                                'text-gray-500'
                            }`}>
                            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Consistency Graph (Heatmap) */}
                <View className="mb-8">
                    <View className="flex-row justify-between items-end mb-3">
                        <Text className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Consistency</Text>
                        <Text className="text-[10px] font-bold text-gray-400">Last 5 Weeks</Text>
                    </View>
                    <View className="flex-row flex-wrap justify-between" style={{ gap: 4 }}>
                        {Array.from({ length: 35 }).map((_, i) => {
                            const date = new Date();
                            date.setDate(date.getDate() - (34 - i));
                            const dateStr = date.toISOString().split('T')[0];

                            // Activity Score
                            // 1 point per checkmark, 3 points per session log
                            const logsCount = (sessionLogs || []).filter(l => l.date.startsWith(dateStr)).length;
                            const progressCount = (progress || []).filter(p => p.completedAt?.startsWith(dateStr)).length;
                            const score = (logsCount * 3) + progressCount;

                            let bgClass = 'bg-gray-100'; // Default (0)
                            if (score >= 4) bgClass = 'bg-green-600'; // High
                            else if (score >= 2) bgClass = 'bg-green-400'; // Medium
                            else if (score >= 1) bgClass = 'bg-green-200'; // Low

                            return (
                                <View
                                    key={i}
                                    className={`h-4 w-[11%] rounded-sm ${bgClass}`}
                                    style={{
                                        opacity: 0.8,
                                        // Optional: Highlight today
                                        borderColor: i === 34 ? theme.text : 'transparent',
                                        borderWidth: i === 34 ? 1 : 0
                                    }}
                                />
                            );
                        })}
                    </View>
                </View>

                {/* SECTION 1: TOP OF THE FOLD (Daily Briefing) */}
                <TouchableOpacity
                    onPress={() => router.push('/events')}
                    className="p-6 rounded-[32px] mb-8 border shadow-sm relative overflow-hidden"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                    <View className="absolute top-0 right-0 p-6 opacity-10">
                        <Ionicons name="calendar" size={120} color={theme.text} />
                    </View>

                    <View className="flex-row items-baseline mb-2 relative z-10">
                        <Text className="text-6xl font-black tracking-tighter" style={{ color: theme.primary }}>
                            {todaysEvents.length}
                        </Text>
                        <Text className="text-xl font-bold ml-2" style={{ color: theme.text }}>
                            Events Today
                        </Text>
                    </View>

                    <View className="w-[70%] relative z-10">
                        <Text className="font-medium text-base mb-4" style={{ color: theme.mutedText }}>
                            You also have <Text style={{ color: theme.text, fontWeight: 'bold' }}>{upcomingEventsCount}</Text> items on the schedule for the next 7 days.
                        </Text>
                    </View>

                    <View className="flex-row items-center relative z-10">
                        <Text className="font-bold text-sm uppercase tracking-wider mr-2" style={{ color: theme.primary }}>View Schedule</Text>
                        <Ionicons name="arrow-forward" size={16} color={theme.primary} />
                    </View>
                </TouchableOpacity>


                {/* DIVIDER */}
                <View className="h-[1px] w-full mb-8 opacity-20" style={{ backgroundColor: theme.border }} />


                {/* SECTION 2: STUDIO & TOOLS (Switchboard Grid) */}
                <Text className="text-2xl font-black tracking-tight mb-6" style={{ color: theme.text }}>
                    Studio & Tools
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    {mainModules.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            onPress={() => router.push(item.path as any)}
                            className="w-[48%] mb-4 p-4 rounded-3xl border shadow-sm relative overflow-hidden h-[160px] justify-between"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <View>
                                <View className={`w-10 h-10 rounded-full items-center justify-center mb-4 ${item.color}`}>
                                    <Ionicons name={item.icon as any} size={20} color="white" />
                                </View>
                                <Text className="text-lg font-black tracking-tight leading-none mb-1" style={{ color: theme.text }}>
                                    {item.title}
                                </Text>
                                <Text className="text-[10px] font-bold uppercase tracking-wider opacity-70" style={{ color: theme.text }}>
                                    {item.subtitle}
                                </Text>
                            </View>

                            <Text className="text-xs mt-3 leading-tight opacity-50 font-medium" style={{ color: theme.text }}>
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
