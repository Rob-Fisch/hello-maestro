import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { AppEvent } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function EngagementsScreen() {
    const { events = [], people = [] } = useContentStore();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const [filter, setFilter] = useState<'all' | 'needs_booking' | 'confirmed'>('all');

    const engagementStats = useMemo(() => {
        const totalEvents = events.length;
        const eventsWithOpenSlots = events.filter(e => e.slots?.some(s => s.status === 'open')).length;
        const totalMusiciansFound = people.filter(p => p.type === 'musician').length;
        return { totalEvents, eventsWithOpenSlots, totalMusiciansFound };
    }, [events, people]);

    const filteredEvents = useMemo(() => {
        return events
            .filter(e => e.type !== 'lesson') // Engagements usually refers to gigs/performances
            .filter(e => {
                if (filter === 'all') return true;
                if (filter === 'needs_booking') return e.slots?.some(s => s.status === 'open' || s.status === 'declined');
                if (filter === 'confirmed') return e.slots?.every(s => s.status === 'confirmed');
                return true;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [events, filter]);

    const renderEngagementCard = ({ item }: { item: AppEvent }) => {
        const openSlots = item.slots?.filter(s => s.status === 'open').length || 0;
        const totalSlots = item.slots?.length || 0;
        const confirmedSlots = item.slots?.filter(s => s.status === 'confirmed').length || 0;

        return (
            <TouchableOpacity
                onPress={() => router.push(`/modal/event-editor?id=${item.id}`)}
                className="mb-6 border rounded-[40px] p-6 shadow-sm mx-1"
                style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                        <View className="flex-row items-center mb-2">
                            <View className="bg-blue-600 px-3 py-1 rounded-full flex-row items-center">
                                <Ionicons name="star" size={10} color="white" />
                                <Text className="text-[10px] text-white font-black ml-1 uppercase tracking-widest">Premium</Text>
                            </View>
                            <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest ml-3">
                                {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                        </View>
                        <Text className="text-2xl font-black leading-tight" style={{ color: theme.text }}>{item.title}</Text>
                        <Text className="font-bold mt-1" style={{ color: theme.mutedText }}>@{item.venue}</Text>
                    </View>

                    <View className="items-end">
                        <View className="bg-gray-50 px-4 py-2 rounded-2xl flex-row items-center border border-gray-100">
                            <Text className="text-gray-900 font-black text-lg">{confirmedSlots}</Text>
                            <Text className="text-gray-400 font-bold text-xs ml-1">/ {totalSlots}</Text>
                        </View>
                    </View>
                </View>

                {/* Progress Bar */}
                {totalSlots > 0 && (
                    <View className="h-2 bg-gray-100 rounded-full mb-6 overflow-hidden">
                        <View
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${(confirmedSlots / totalSlots) * 100}%` }}
                        />
                    </View>
                )}

                <View className="flex-row flex-wrap gap-2">
                    {item.slots?.map(slot => {
                        const musician = people.find(p => p.id === slot.musicianId);
                        return (
                            <View
                                key={slot.id}
                                className={`px-3 py-2 rounded-2xl flex-row items-center border ${slot.status === 'confirmed' ? 'bg-green-50 border-green-100' :
                                    slot.status === 'invited' ? 'bg-amber-50 border-amber-100' :
                                        'bg-gray-50 border-gray-100'
                                    }`}
                            >
                                <View className={`w-2 h-2 rounded-full mr-2 ${slot.status === 'confirmed' ? 'bg-green-500' :
                                    slot.status === 'invited' ? 'bg-amber-500' :
                                        'bg-blue-500'
                                    }`} />
                                <Text className={`text-[10px] font-black uppercase tracking-tight ${slot.status === 'confirmed' ? 'text-green-700' :
                                    slot.status === 'invited' ? 'text-amber-700' :
                                        'text-gray-600'
                                    }`}>
                                    {musician ? `${slot.role} (${musician.firstName} ${musician.lastName})` : `${slot.role} (-unassigned-)`}
                                </Text>
                            </View>
                        );
                    })}
                    {totalSlots === 0 && (
                        <Text className="text-gray-400 text-xs italic">No slots defined yet</Text>
                    )}
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-8 pb-4" style={{ paddingTop: Math.max(insets.top, 20) }}>
                <View className="flex-row justify-between items-center mb-8">
                    <View className="flex-row items-center flex-1 mr-4">
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-4 p-2 -ml-2 rounded-full">
                            <Ionicons name="menu" size={26} color={theme.text} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <View className="flex-row items-center mb-1">
                                <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>Gigs</Text>
                                <View className="ml-3 px-2 py-0.5 rounded-lg" style={{ backgroundColor: theme.primary }}>
                                    <Text className="text-[10px] text-white font-black uppercase tracking-widest">Pro</Text>
                                </View>
                            </View>
                            <Text className="font-medium text-base" style={{ color: theme.mutedText }}>Personnel & Roster Logistics</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={() => router.push('/modal/event-editor?type=gig')}
                        className="bg-blue-600 w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-400"
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </TouchableOpacity>
                </View>


                <View className="flex-row gap-4 mb-8">
                    <View className="flex-1 p-5 rounded-[32px] border shadow-sm items-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <Text className="text-2xl font-black text-blue-600">{engagementStats.eventsWithOpenSlots}</Text>
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mt-1">Needs Booking</Text>
                    </View>
                    <View className="flex-1 p-5 rounded-[32px] border shadow-sm items-center" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <Text className="text-2xl font-black text-green-600">{engagementStats.totalEvents - engagementStats.eventsWithOpenSlots}</Text>
                        <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center mt-1">Fully Staffed</Text>
                    </View>
                </View>

                <View className="flex-row gap-2 mb-4">
                    {(['all', 'needs_booking', 'confirmed'] as const).map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setFilter(f)}
                            className={`flex-1 py-3 items-center rounded-2xl border`}
                            style={{
                                backgroundColor: filter === f ? theme.primary : theme.card,
                                borderColor: filter === f ? theme.primary : theme.border
                            }}
                        >
                            <Text className={`text-[10px] uppercase font-black tracking-widest ${filter === f ? 'text-white' : ''}`} style={{ color: filter === f ? '#fff' : theme.mutedText }}>
                                {f.replace('_', ' ')}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredEvents}
                renderItem={renderEngagementCard}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-20">
                        <Ionicons name="calendar-outline" size={48} color="#d1d5db" />
                        <Text className="text-xl font-black text-gray-400 mt-4">No Gigs Found</Text>
                    </View>
                }
            />
        </View>
    );
}
