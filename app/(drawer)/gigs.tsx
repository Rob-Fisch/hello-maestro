import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GigsScreen() {
    const { events = [], trackModuleUsage } = useContentStore();
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Track usage on mount
    useMemo(() => {
        trackModuleUsage('gigs');
    }, []);

    const { next7Days, next30Days, totalUpcoming } = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const day7 = new Date(today);
        day7.setDate(today.getDate() + 7);

        const day30 = new Date(today);
        day30.setDate(today.getDate() + 30);

        const upcomingEvents = events.filter(e => {
            if (e.type !== 'performance') return false;

            // Handle recurring logic basics or single date
            if (e.schedule?.type === 'recurring') {
                const { startDate, endDate } = e.schedule;
                if (!startDate || !endDate) return false;
                const start = new Date(startDate + 'T00:00:00');
                const end = new Date(endDate + 'T23:59:59');
                // Rudimentary check: is the recurring window active in the future?
                // A better check would be "is there an occurrence", but for summary counts, window overlap is a fast proxy.
                return end >= today;
            } else {
                const eDate = new Date(e.date + 'T00:00:00');
                return eDate >= today;
            }
        }).sort((a, b) => a.date.localeCompare(b.date));

        // Precision Filtering for date ranges
        // We'll expand recurring events for exact accuracy if needed, 
        // but for now, let's treat recurring active windows as "Active"
        // To be precise like the schedule screen, we should probably just count single instances for now or expand.
        // Let's stick to the simpler single-date logic for "next 7 days" specific counts to avoid complexity explosion,
        // or check simple overlap.

        const next7 = upcomingEvents.filter(e => {
            if (e.schedule?.type === 'recurring') return true; // Assume recurring events are "happening"
            const d = new Date(e.date + 'T00:00:00');
            return d <= day7;
        });

        const next30 = upcomingEvents.filter(e => {
            if (e.schedule?.type === 'recurring') return true;
            const d = new Date(e.date + 'T00:00:00');
            return d <= day30;
        });

        return {
            next7Days: next7,
            next30Days: next30,
            totalUpcoming: upcomingEvents
        };
    }, [events]);

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={{
                paddingTop: Math.max(insets.top, 20),
                paddingHorizontal: 24,
                paddingBottom: 40
            }}
        >
            {/* Header */}
            <View className="flex-row items-center mb-8">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 -ml-2 rounded-full">
                    <Ionicons name="arrow-back" size={28} color={theme.text} />
                </TouchableOpacity>
                <View>
                    <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>Performance</Text>
                    <Text className="font-medium text-base text-rose-500">Management</Text>
                </View>
            </View>

            {/* Block 1: Gig Summary */}
            <View className="mb-6 p-6 rounded-[32px] border shadow-sm bg-rose-50 border-rose-100 overflow-hidden relative">
                <View className="absolute -right-4 -top-4 opacity-10">
                    <Ionicons name="musical-notes" size={120} color={theme.primary} />
                </View>

                <Text className="text-xs font-black uppercase tracking-widest text-rose-600 mb-4">Outlook</Text>

                <View className="flex-row items-end mb-6">
                    <Text className="text-6xl font-black text-gray-900 tracking-tighter leading-none">
                        {next7Days.length}
                    </Text>
                    <Text className="text-lg font-bold text-gray-600 ml-2 mb-1.5">
                        in the next 7 days
                    </Text>
                </View>

                {next30Days.length > 0 ? (
                    <View className="bg-white/60 rounded-2xl p-4 border border-rose-100/50">
                        <Text className="text-gray-800 font-medium">
                            Looking further ahead, you have <Text className="font-bold">{next30Days.length} gigs</Text> coming up in the next 30 days.
                        </Text>

                        {/* Mini List of Next few */}
                        <View className="mt-4 space-y-2">
                            {next7Days.slice(0, 3).map(gig => (
                                <View key={gig.id} className="flex-row items-center">
                                    <Text className="text-xs font-bold text-gray-500 w-12">
                                        {gig.schedule?.type === 'recurring' ? 'Wkly' : new Date(gig.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </Text>
                                    <View className="h-1.5 w-1.5 rounded-full bg-rose-400 mr-2" />
                                    <Text className="text-sm font-bold text-gray-800 flex-1 truncate" numberOfLines={1}>
                                        {gig.title}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <View className="bg-white/60 rounded-2xl p-4 border border-rose-100/50">
                        <Text className="text-gray-600 font-medium italic">
                            No gigs on the horizon. Time to book some shows!
                        </Text>
                    </View>
                )}
            </View>

            {/* Block 2: Schedule Management (Link to Filtered Schedule) */}
            <TouchableOpacity
                onPress={() => router.push('/(drawer)/events?filter=performance')}
                className="mb-6 p-6 rounded-[32px] border shadow-sm bg-white border-gray-100 flex-row items-center justify-between"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
                <View className="flex-1 pr-4">
                    <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mb-3">
                        <Ionicons name="calendar" size={24} color="#2563eb" />
                    </View>
                    <Text className="text-xl font-black text-gray-900 mb-1" style={{ color: theme.text }}>Manage Schedule</Text>
                    <Text className="text-sm text-gray-500 font-medium leading-relaxed">
                        Open the full calendar view with your performance filter pre-selected.
                    </Text>
                </View>
                <View className="bg-gray-50 p-3 rounded-full">
                    <Ionicons name="chevron-forward" size={24} color={theme.mutedText} />
                </View>
            </TouchableOpacity>

            {/* Block 2.5: Venue Managers (Contacts) */}
            <TouchableOpacity
                onPress={() => router.push('/(drawer)/people?filter=venue_manager&source=gigs')}
                className="mb-6 p-6 rounded-[32px] border shadow-sm bg-white border-gray-100 flex-row items-center justify-between"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
                <View className="flex-1 pr-4">
                    <View className="w-12 h-12 rounded-full bg-amber-100 items-center justify-center mb-3">
                        <Ionicons name="business" size={24} color="#d97706" />
                    </View>
                    <Text className="text-xl font-black text-gray-900 mb-1" style={{ color: theme.text }}>Venue Managers</Text>
                    <Text className="text-sm text-gray-500 font-medium leading-relaxed">
                        Access your contact list of promoters and club owners.
                    </Text>
                </View>
                <View className="bg-gray-50 p-3 rounded-full">
                    <Ionicons name="chevron-forward" size={24} color={theme.mutedText} />
                </View>
            </TouchableOpacity>

            {/* Block 3: Scout / Pro Upsell */}
            <TouchableOpacity
                onPress={() => router.push('/scout')}
                activeOpacity={0.8}
                className="p-6 rounded-[32px] border shadow-sm overflow-hidden relative"
                style={{ backgroundColor: '#1e1b4b', borderColor: '#312e81' }} // Indigo-950 theme
            >
                {/* Background Gradient Effect (simulated) */}
                <View className="absolute top-0 right-0 bottom-0 left-0 opacity-30">
                    <View className="absolute top-[-50] right-[-50] w-[200px] h-[200px] bg-purple-500 rounded-full blur-3xl" />
                    <View className="absolute bottom-[-50] left-[-50] w-[150px] h-[150px] bg-blue-500 rounded-full blur-3xl" />
                </View>

                <View className="flex-row items-start justify-between relative z-10">
                    <View className="flex-1 mr-4">
                        <View className="flex-row items-center mb-3">
                            <Ionicons name="telescope" size={20} color="#a5b4fc" />
                            <Text className="text-[#a5b4fc] font-black uppercase tracking-widest text-xs ml-2">OpusMode Scout</Text>
                        </View>
                        <Text className="text-2xl font-black text-white mb-2 tracking-tight">
                            Find new opportunities
                        </Text>
                        <Text className="text-gray-300 font-medium leading-relaxed mb-6">
                            Use AI to research venues, find local promoters, and generate booking emails in seconds.
                        </Text>

                        <View className="flex-row items-center bg-white/10 self-start px-4 py-2 rounded-full border border-white/20">
                            <Text className="text-white font-bold text-sm mr-2">Launch Scout</Text>
                            <Ionicons name="arrow-forward" size={14} color="white" />
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

        </ScrollView>
    );
}
