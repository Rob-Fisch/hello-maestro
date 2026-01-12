import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function GigsScreen() {
    const { events = [], trackModuleUsage } = useContentStore();
    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const goToLiveMode = (eventId: string) => {
        router.push(`/live/${eventId}`);
    };

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
                return end >= today;
            } else {
                const eDate = new Date(e.date + 'T00:00:00');
                return eDate >= today;
            }
        }).sort((a, b) => a.date.localeCompare(b.date));

        const next7 = upcomingEvents.filter(e => {
            if (e.schedule?.type === 'recurring') return true;
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
                paddingBottom: 40
            }}
        >
            {/* Header - Top with Safe Area */}
            <View className="px-6 flex-row items-start pt-8 mb-6" style={{ paddingTop: insets.top }}>
                <TouchableOpacity
                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                    className="mr-5 p-2 rounded-full bg-white/5 border border-white/10"
                >
                    <Ionicons name="menu" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[10px] font-black uppercase tracking-[3px] text-rose-400 mb-1">
                        Professional
                    </Text>
                    <Text className="text-4xl font-black tracking-tight text-white">
                        Performance Management
                    </Text>
                </View>
            </View>

            <View className="px-6">
                {/* Block 1: Gig Summary - Dark Glass Rose */}
                <View className="mb-6 p-6 rounded-[32px] border shadow-sm bg-rose-900/10 border-rose-500/20 overflow-hidden relative">
                    <View className="absolute -right-4 -top-4 opacity-20">
                        <Ionicons name="musical-notes" size={120} color="#f43f5e" />
                    </View>

                    <Text className="text-[10px] font-black uppercase tracking-widest text-rose-400 mb-4">Outlook</Text>

                    <View className="flex-row items-end mb-6">
                        <Text className="text-6xl font-black text-white tracking-tighter leading-none">
                            {next7Days.length}
                        </Text>
                        <Text className="text-lg font-bold text-rose-200/60 ml-2 mb-1.5">
                            in the next 7 days
                        </Text>
                    </View>

                    {next30Days.length > 0 ? (
                        <View className="bg-black/20 rounded-2xl p-4 border border-rose-500/10">
                            <Text className="text-rose-100 font-medium leading-relaxed">
                                Looking further ahead, you have <Text className="font-bold text-white">{next30Days.length} {next30Days.length === 1 ? 'gig' : 'gigs'}</Text> coming up in the next 30 days.
                            </Text>

                            {/* Mini List of Next few */}
                            <View className="mt-4 space-y-3">
                                {next7Days.slice(0, 3).map(gig => (
                                    <View key={gig.id} className="flex-row items-center justify-between">
                                        <View className="flex-row items-center flex-1 mr-2">
                                            <Text className="text-[10px] font-bold text-rose-300 w-12 uppercase">
                                                {gig.schedule?.type === 'recurring' ? 'Wkly' : new Date(gig.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </Text>
                                            <View className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-2" />
                                            <Text className="text-sm font-bold text-white flex-1 truncate" numberOfLines={1}>
                                                {gig.title}
                                            </Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={() => goToLiveMode(gig.id)}
                                            className="bg-rose-500 px-3 py-1.5 rounded-full"
                                        >
                                            <Text className="text-[10px] font-black uppercase text-white">Live</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : (
                        <View className="bg-black/20 rounded-2xl p-4 border border-rose-500/10">
                            <Text className="text-rose-200/60 font-medium italic">
                                No gigs on the horizon. Time to book some shows!
                            </Text>
                        </View>
                    )}
                </View>

                {/* Block 2: Schedule Management */}
                <TouchableOpacity
                    onPress={() => router.push('/(drawer)/events?filter=performance&source=gigs')}
                    className="mb-6 p-6 rounded-[32px] border shadow-sm flex-row items-center justify-between"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                    <View className="flex-1 pr-4">
                        <View className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 items-center justify-center mb-3">
                            <Ionicons name="calendar" size={24} color="#60a5fa" />
                        </View>
                        <Text className="text-xl font-black text-white mb-1">Manage Schedule</Text>
                        <Text className="text-sm text-slate-400 font-medium leading-relaxed">
                            Open the full calendar view with your performance filter pre-selected.
                        </Text>
                    </View>
                    <View className="bg-white/5 p-3 rounded-full border border-white/10">
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Block 2.5: Venue Managers */}
                <TouchableOpacity
                    onPress={() => router.push('/(drawer)/people?filter=venue_manager&source=gigs')}
                    className="mb-6 p-6 rounded-[32px] border shadow-sm flex-row items-center justify-between"
                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                >
                    <View className="flex-1 pr-4">
                        <View className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 items-center justify-center mb-3">
                            <Ionicons name="business" size={24} color="#fbbf24" />
                        </View>
                        <Text className="text-xl font-black text-white mb-1">Venue Managers</Text>
                        <Text className="text-sm text-slate-400 font-medium leading-relaxed">
                            Access your contact list of promoters and club owners.
                        </Text>
                    </View>
                    <View className="bg-white/5 p-3 rounded-full border border-white/10">
                        <Ionicons name="chevron-forward" size={24} color="white" />
                    </View>
                </TouchableOpacity>

                {/* Block 3: Scout / Pro Upsell */}
                <TouchableOpacity
                    onPress={() => router.push('/coach')}
                    activeOpacity={0.8}
                    className="p-6 rounded-[32px] border shadow-sm overflow-hidden relative mb-10"
                    style={{ backgroundColor: '#1e1b4b', borderColor: '#312e81' }} // Indigo-950 theme
                >
                    {/* Background Gradient Effect */}
                    <View className="absolute top-0 right-0 bottom-0 left-0 opacity-30">
                        <View className="absolute top-[-50] right-[-50] w-[200px] h-[200px] bg-purple-500 rounded-full blur-3xl" />
                        <View className="absolute bottom-[-50] left-[-50] w-[150px] h-[150px] bg-blue-500 rounded-full blur-3xl" />
                    </View>

                    <View className="flex-row items-start justify-between relative z-10">
                        <View className="flex-1 mr-4">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="telescope" size={20} color="#a5b4fc" />
                                <Text className="text-[#a5b4fc] font-black uppercase tracking-widest text-xs ml-2">OpusMode AI Coach</Text>
                            </View>
                            <Text className="text-2xl font-black text-white mb-2 tracking-tight">
                                Find new opportunities
                            </Text>
                            <Text className="text-indigo-200 font-medium leading-relaxed mb-6">
                                Use AI to research venues, find local promoters, and generate booking emails in seconds.
                            </Text>

                            <View className="flex-row items-center bg-white/10 self-start px-4 py-2 rounded-full border border-white/20">
                                <Text className="text-white font-bold text-sm mr-2">Launch Coach</Text>
                                <Ionicons name="arrow-forward" size={14} color="white" />
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}
