
import { useContentStore } from '@/store/contentStore';
import { BookingSlot } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';

export default function EventDashboard() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { events, deleteEvent, people } = useContentStore();

    const event = events.find(e => e.id === id);

    if (!event) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <Text className="text-slate-400 font-bold mb-4">Event not found.</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-indigo-600 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // --- Derived Data ---
    const dateObj = new Date(event.date);
    const dateFormatted = dateObj.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        if (isNaN(h)) return timeStr;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };
    const timeFormatted = formatTime(event.time);

    // Roster Stats
    // HYDRATION: Fallback if slots are missing but personnelIds exist (Visual Fix only)
    let slots = event.slots || [];
    if (slots.length === 0 && event.personnelIds && event.personnelIds.length > 0) {
        slots = event.personnelIds.map(pid => ({
            id: uuid.v4() as string,
            role: 'Musician',
            status: 'confirmed', // Assume confirmed for legacy
            musicianId: pid,
            instruments: []
        } as BookingSlot));
    }

    const confirmedCount = slots.filter(s => s.status === 'confirmed').length;
    const pendingCount = slots.filter(s => s.status === 'invited').length;
    const openCount = slots.filter(s => s.status === 'open').length;

    // Finance Stats
    const totalIncome = parseFloat(event.totalFee || '0') || 0;
    const musicianRate = parseFloat(event.musicianFee || '0') || 0;
    const totalMusicianCost = slots.length * musicianRate;
    // Note: We'd need actual transaction integration here for "Realized", but for now usage projected
    const projectedProfit = totalIncome - totalMusicianCost;

    const handleDelete = () => {
        if (Platform.OS === 'web') {
            if (confirm('Are you sure you want to delete this event? This cannot be undone.')) {
                deleteEvent(id);
                router.back();
            }
        } else {
            Alert.alert(
                'Delete Event',
                'Are you sure you want to delete this event? This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            deleteEvent(id);
                            router.back();
                        }
                    }
                ]
            );
        }
    };

    return (
        <View className="flex-1 bg-slate-50">
            <Stack.Screen
                options={{
                    headerTitle: '',
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: '#f8fafc' }, // slate-50
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={() => {
                                if (router.canGoBack()) {
                                    router.back();
                                } else {
                                    // Fallback for web refresh or deep link
                                    router.push('/(drawer)/events');
                                }
                            }}
                            className="flex-row items-center p-2 -ml-2"
                        >
                            <Ionicons name="arrow-back" size={24} color="#64748b" />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/modal/event-editor', params: { id: event.id, type: event.type } })}
                            className="bg-indigo-600 px-4 py-2 rounded-full flex-row items-center shadow-sm shadow-indigo-200"
                        >
                            <Ionicons name="create" size={16} color="white" />
                            <Text className="text-white font-bold ml-2 text-sm">Edit</Text>
                        </TouchableOpacity>
                    )
                }}
            />

            <ScrollView className="flex-1 px-6 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                {/* HERO SECTION */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-2">
                        <View className={`px-3 py-1 rounded-full flex-row items-center mr-3 ${event.type === 'performance' ? 'bg-purple-100' :
                            event.type === 'lesson' ? 'bg-blue-100' : 'bg-slate-100'
                            }`}>
                            <Ionicons name={
                                event.type === 'performance' ? 'mic' :
                                    event.type === 'lesson' ? 'school' : 'musical-notes'
                            } size={12} color={
                                event.type === 'performance' ? '#9333ea' :
                                    event.type === 'lesson' ? '#2563eb' : '#64748b'
                            } />
                            <Text className={`text-[10px] font-bold uppercase ml-1.5 ${event.type === 'performance' ? 'text-purple-700' :
                                event.type === 'lesson' ? 'text-blue-700' : 'text-slate-600'
                                }`}>
                                {event.type}
                            </Text>
                        </View>
                        {event.isPublicStagePlot && (
                            <View className="bg-green-100 px-3 py-1 rounded-full flex-row items-center">
                                <Ionicons name="globe" size={12} color="#16a34a" />
                                <Text className="text-[10px] font-bold uppercase text-green-700 ml-1.5">Public</Text>
                            </View>
                        )}
                    </View>

                    <Text className="text-4xl font-black text-slate-900 leading-tight mb-2">{event.title}</Text>

                    <View className="flex-row items-center mb-1">
                        <Ionicons name="calendar-outline" size={18} color="#64748b" />
                        <Text className="text-slate-600 font-bold ml-2 text-lg">{dateFormatted} @ {timeFormatted}</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={18} color="#64748b" />
                        <Text className="text-slate-600 font-medium ml-2 text-base">{event.venue}</Text>
                    </View>
                </View>

                {/* ACTION BAR */}
                <View className="flex-row gap-3 mb-8">
                    {/* Share Button (Keep Existing) */}
                    {event.isPublicStagePlot && (
                        <TouchableOpacity
                            onPress={() => {
                                const url = `https://opusmode.net/events/${event.id}`;
                                if (Platform.OS === 'web') {
                                    if (navigator.share) {
                                        navigator.share({ title: event.title, url });
                                    } else {
                                        prompt('Copy this link:', url);
                                    }
                                } else {
                                    const { Share } = require('react-native');
                                    Share.share({ message: `Check out my gig: ${event.title}`, url });
                                }
                            }}
                            className="flex-1 bg-green-500 py-3 rounded-2xl flex-row items-center justify-center shadow-lg shadow-green-500/20"
                        >
                            <Ionicons name="share-outline" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Share Link</Text>
                        </TouchableOpacity>
                    )}

                    {/* Set List Button */}
                    <TouchableOpacity
                        onPress={() => router.push(`/live/${event.id}`)}
                        className="flex-1 bg-neutral-900 py-3 rounded-2xl flex-row items-center justify-center shadow-lg shadow-neutral-500/20"
                    >
                        <Ionicons name="list" size={20} color="white" />
                        <Text className="text-white font-bold ml-2">Set List</Text>
                    </TouchableOpacity>
                </View>

                {/* DASHBOARD WIDGETS */}
                <View className="flex-row flex-wrap justify-between gap-4 mb-8">

                    {/* Roster Widget */}
                    <View className="w-[47%] bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                        <View className="w-10 h-10 bg-indigo-50 rounded-full items-center justify-center mb-3">
                            <Ionicons name="people" size={20} color="#4f46e5" />
                        </View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Roster</Text>
                        <View className="flex-row items-baseline">
                            <Text className="text-2xl font-black text-slate-900">{confirmedCount}</Text>
                            <Text className="text-sm text-slate-400 font-bold"> / {slots.length}</Text>
                        </View>
                        <Text className="text-xs text-slate-400 mt-1">
                            {pendingCount > 0 ? `${pendingCount} Invitations Pending` : 'All Clear'}
                        </Text>
                    </View>

                    {/* Finance Widget */}
                    <View className="w-[47%] bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
                        <View className={`w-10 h-10 rounded-full items-center justify-center mb-3 ${projectedProfit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
                            <Ionicons name="cash" size={20} color={projectedProfit >= 0 ? '#10b981' : '#ef4444'} />
                        </View>
                        <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Net Profit</Text>
                        <Text className={`text-2xl font-black ${projectedProfit >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                            ${projectedProfit.toLocaleString()}
                        </Text>
                        <Text className="text-xs text-slate-400 mt-1">Projected</Text>
                    </View>
                </View>

                {/* ROSTER LIST SECTION */}
                <View className="mb-8">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="people-outline" size={20} color="#64748b" />
                        <Text className="text-slate-600 font-bold ml-2 uppercase tracking-wide text-xs">Personnel</Text>
                    </View>
                    <View className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                        {slots.map((slot, index) => {
                            const musician = people.find(p => p.id === slot.musicianId);
                            return (
                                <View key={slot.id} className={`p-4 flex-row items-center justify-between ${index !== slots.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <View className="flex-row items-center flex-1">
                                        <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                                            {musician ? (
                                                <Text className="font-bold text-slate-600">{musician.firstName[0]}{musician.lastName[0]}</Text>
                                            ) : (
                                                <Ionicons name="person-outline" size={16} color="#94a3b8" />
                                            )}
                                        </View>
                                        <View>
                                            <Text className={`font-bold text-base ${musician ? 'text-slate-900' : 'text-slate-400 italic'}`}>
                                                {musician ? `${musician.firstName} ${musician.lastName}` : 'Unassigned'}
                                            </Text>
                                            <Text className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{slot.role}</Text>
                                        </View>
                                    </View>

                                    {/* Status Badge */}
                                    <View className={`px-2.5 py-1 rounded-lg flex-row items-center ${slot.status === 'confirmed' ? 'bg-emerald-100' :
                                        slot.status === 'invited' ? 'bg-amber-100' : 'bg-slate-100'
                                        }`}>
                                        <Ionicons name={
                                            slot.status === 'confirmed' ? 'checkmark-circle' :
                                                slot.status === 'invited' ? 'time' : 'ellipse-outline'
                                        } size={12} color={
                                            slot.status === 'confirmed' ? '#059669' :
                                                slot.status === 'invited' ? '#d97706' : '#64748b'
                                        } />
                                        <Text className={`text-[10px] font-black uppercase ml-1.5 ${slot.status === 'confirmed' ? 'text-emerald-700' :
                                            slot.status === 'invited' ? 'text-amber-700' : 'text-slate-500'
                                            }`}>
                                            {slot.status}
                                        </Text>
                                    </View>
                                </View>
                            )
                        })}
                        {slots.length === 0 && (
                            <View className="p-8 items-center justify-center">
                                <Ionicons name="people-outline" size={32} color="#cbd5e1" />
                                <Text className="text-slate-400 font-bold mt-2">No personnel slots added.</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* NOTES SECTION */}
                <View className="bg-amber-50 p-6 rounded-3xl border border-amber-100 mb-8">
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="document-text" size={20} color="#d97706" />
                        <Text className="text-amber-700 font-bold ml-2 uppercase tracking-wide text-xs">Internal Notes</Text>
                    </View>
                    <Text className="text-amber-900 text-base leading-relaxed">
                        {event.notes || "No notes added."}
                    </Text>
                </View>

                {/* DELETE BUTTON */}
                <TouchableOpacity
                    onPress={handleDelete}
                    className="flex-row items-center justify-center p-4 rounded-2xl bg-white border border-red-100 mb-8"
                >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    <Text className="text-red-500 font-bold ml-2">Delete Event</Text>
                </TouchableOpacity>

            </ScrollView >
        </View >
    );
}
