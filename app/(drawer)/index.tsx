import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { useContentStore } from '@/store/contentStore';
import { useRouter, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
    const { routines, events } = useContentStore();
    const router = useRouter();
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
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

    const quickActions = [
        { title: 'New Routine', icon: 'add-circle-outline' as const, path: '/modal/routine-editor' as const, color: 'bg-blue-500' },
        { title: 'My Library', icon: 'library-outline' as const, path: '/content' as const, color: 'bg-purple-500' },
        { title: 'Schedule', icon: 'calendar-outline' as const, path: '/events' as const, color: 'bg-green-500' },
        { title: 'Routines List', icon: 'list-outline' as const, path: '/routines' as const, color: 'bg-orange-500' },
    ];

    return (
        <ScrollView className="flex-1 bg-gray-50 p-6">
            <View className="mb-10 mt-6 px-2">
                <Text className="text-5xl font-black text-gray-900 tracking-tight">Welcome back!</Text>
                <Text className="text-gray-500 font-medium text-lg mt-2">Here is what is on your plate today.</Text>
            </View>

            {/* Today's Events (Gigs/Lessons) */}
            <View className="bg-blue-600 p-8 rounded-[40px] shadow-2xl shadow-blue-400 mb-10">
                <View className="flex-row items-center mb-6">
                    <Ionicons name="sparkles" size={24} color="white" />
                    <Text className="text-2xl font-black ml-3 text-white">Today&apos;s Events</Text>
                </View>

                {todaysEvents.length === 0 ? (
                    <Text className="text-blue-100 italic text-lg ml-1">No performances or lessons today.</Text>
                ) : (
                    <View>
                        {todaysEvents.map((item) => (
                            <Link key={item.id} href={{ pathname: '/modal/event-editor', params: { id: item.id } }} asChild>
                                <TouchableOpacity className="flex-row items-center py-5 border-b border-blue-500 last:border-b-0">
                                    <View className="flex-1">
                                        <Text className="text-2xl font-black text-white">{item.title}</Text>
                                        <Text className="text-blue-100 text-sm font-bold uppercase tracking-widest mt-1">
                                            {item.type} • {item.time}
                                        </Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={24} color="rgba(255,255,255,0.7)" />
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                )}
            </View>

            <View className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 mb-10">
                <View className="flex-row items-center mb-6">
                    <Ionicons name="time" size={24} color="#3b82f6" />
                    <Text className="text-2xl font-black ml-3 text-gray-900">Today&apos;s Routines</Text>
                </View>

                {todaysRoutines.length === 0 ? (
                    <View className="py-6 items-center">
                        <Text className="text-gray-400 italic text-lg">No routines scheduled for today.</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/routines')}
                            className="mt-4 bg-blue-50 px-6 py-3 rounded-2xl"
                        >
                            <Text className="text-blue-600 font-bold text-base">Browse All Routines →</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {todaysRoutines.map((item) => (
                            <Link key={item.id} href={{ pathname: '/modal/routine-editor', params: { id: item.id } }} asChild>
                                <TouchableOpacity
                                    className="flex-row items-center py-5 border-b border-gray-50 last:border-b-0"
                                >
                                    <View className="w-14 h-14 rounded-2xl bg-blue-50 items-center justify-center mr-5 shadow-sm">
                                        <Ionicons name="play" size={28} color="#2563eb" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xl font-bold text-gray-900">{item.title}</Text>
                                        <Text className="text-base text-gray-500 font-medium">{item.blocks.length} blocks</Text>
                                    </View>
                                    <Ionicons name="chevron-forward" size={22} color="#d1d5db" />
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                )}
            </View>

            <Text className="text-2xl font-black mb-6 text-gray-900 px-2 tracking-tight">Quick Actions</Text>
            <View className="flex-row flex-wrap justify-between px-1">
                {quickActions.map((action, index) => (
                    <Link key={index} href={action.path} asChild>
                        <TouchableOpacity
                            className="w-[48%] mb-6 bg-white p-8 rounded-[40px] border border-gray-100 flex-col items-center shadow-md shadow-gray-100"
                        >
                            <View className={`w-16 h-16 ${action.color} rounded-2xl items-center justify-center mb-5 shadow-lg`}>
                                <Ionicons name={action.icon} size={32} color="white" />
                            </View>
                            <Text className="text-lg font-black text-gray-900 tracking-tight">{action.title}</Text>
                        </TouchableOpacity>
                    </Link>
                ))}
            </View>
            <View className="h-20" />
        </ScrollView>
    );
}
