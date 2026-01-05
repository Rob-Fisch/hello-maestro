
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PublicEventData = {
    id: string;
    title: string;
    venue: string;
    date: string;
    time: string;
    public_description?: string;
    show_setlist: boolean;
    social_link?: string;
    owner_profile: {
        display_name: string;
        bio?: string;
        tip_url?: string;
        mailing_list_url?: string;
        avatar_url?: string;
    };
    routines?: {
        title: string;
        blocks: { title: string }[];
    }[];
};

export default function FanPage() {
    const { eventId } = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    // Force Dark Mode for Stage Plot
    const theme = { background: '#0f172a', text: '#f8fafc', card: '#1e293b', border: '#334155', primary: '#f43f5e' };

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<PublicEventData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchEventData();
    }, [eventId]);

    const fetchEventData = async () => {
        if (!eventId) return;

        try {
            // 1. Fetch Event
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select(`
                    id, title, venue, date, time, 
                    public_description, show_setlist, routines, social_link,
                    user_id
                `)
                .eq('id', eventId)
                .single();

            if (eventError) throw eventError;

            // 2. Fetch Owner Profile (Public Info)
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('display_name, bio, tip_url, mailing_list_url, avatar_url')
                .eq('id', eventData.user_id)
                .single();

            if (profileError) throw profileError;

            // 3. Fetch Routine Details if setlist is shown
            let routineDetails: any[] = [];
            if (eventData.show_setlist && eventData.routines && eventData.routines.length > 0) {
                // In a real app, we'd fetch the specific routine items. 
                // For MVP, we assume the 'routines' array on event might store IDs, 
                // but let's try to fetch if possible.
                // Ideally, we'd join query, but keeping it simple for now.
                const { data: routines } = await supabase
                    .from('routines')
                    .select('title, blocks')
                    .in('id', eventData.routines);
                routineDetails = routines || [];
            }

            setEvent({
                ...eventData,
                owner_profile: profileData,
                routines: routineDetails
            });

        } catch (err) {
            console.error('Error fetching stage plot:', err);
            setError('Could not load event data. It may be private or deleted.');
        } finally {
            setLoading(false);
        }
    };

    const handleLink = (url?: string) => {
        if (!url) return;
        Linking.openURL(url).catch(() => {
            Alert.alert("Link Error", "Could not open link.");
        });
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-900">
                <ActivityIndicator size="large" color="#f43f5e" />
            </View>
        );
    }

    if (error || !event) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-900 px-6">
                <Ionicons name="alert-circle-outline" size={64} color="#64748b" />
                <Text className="text-slate-400 mt-4 text-center">{error || 'Event not found'}</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* HERO HEADER */}
                <View className="relative h-[300px] justify-end p-6 overflow-hidden">
                    {/* Abstract Background */}
                    <View className="absolute top-0 left-0 right-0 bottom-0 bg-rose-900/20" />
                    <View className="absolute top-[-50] right-[-50] w-[300px] h-[300px] bg-rose-600 rounded-full blur-[100px] opacity-30" />
                    <View className="absolute bottom-[-50] left-[-50] w-[200px] h-[200px] bg-purple-600 rounded-full blur-[80px] opacity-30" />

                    <Text className="text-rose-400 font-black uppercase tracking-[4px] text-xs mb-2">
                        Live @ {event.venue}
                    </Text>
                    <Text className="text-5xl font-black text-white leading-tight mb-2 tracking-tighter">
                        {event.owner_profile.display_name}
                    </Text>
                    <Text className="text-slate-300 text-lg font-medium">
                        {event.title} • {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </Text>
                </View>

                {/* MAIN ACTIONS */}
                <View className="px-6 -mt-8">
                    <View className="flex-row gap-4 mb-8">
                        {event.owner_profile.tip_url && (
                            <TouchableOpacity
                                onPress={() => handleLink(event.owner_profile.tip_url)}
                                activeOpacity={0.8}
                                className="flex-1 bg-rose-600 py-4 px-6 rounded-2xl items-center shadow-lg shadow-rose-900/50 flex-row justify-center"
                            >
                                <Ionicons name="cash-outline" size={24} color="white" style={{ marginRight: 8 }} />
                                <View>
                                    <Text className="text-white font-black uppercase text-sm tracking-wide">Tip the Band</Text>
                                    <Text className="text-white/60 text-[10px] font-bold">Support Live Music</Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {event.owner_profile.mailing_list_url && (
                            <TouchableOpacity
                                onPress={() => handleLink(event.owner_profile.mailing_list_url)}
                                activeOpacity={0.8}
                                className="flex-1 bg-slate-800 border border-slate-700 py-4 px-6 rounded-2xl items-center shadow-lg flex-row justify-center"
                            >
                                <Ionicons name="mail-outline" size={24} color="white" style={{ marginRight: 8 }} />
                                <View>
                                    <Text className="text-white font-black uppercase text-sm tracking-wide">Join List</Text>
                                    <Text className="text-slate-400 text-[10px] font-bold">Stay Updated</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* BIO SECTION */}
                    <View className="mb-10">
                        {/* Avatar */}
                        {event.owner_profile.avatar_url && (
                            <View className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-900 mb-4 overflow-hidden self-start">
                                {/* <Image source={{ uri: ... }} /> - Placeholder for now */}
                                <View className="flex-1 items-center justify-center bg-slate-700">
                                    <Text className="text-2xl">🎤</Text>
                                </View>
                            </View>
                        )}

                        <Text className="text-white font-black text-2xl mb-4">About the Artist</Text>
                        <Text className="text-slate-400 leading-relaxed text-base">
                            {event.owner_profile.bio || event.public_description || "Thanks for coming out to the show! We appreciate your support."}
                        </Text>

                        {event.social_link && (
                            <TouchableOpacity onPress={() => handleLink(event.social_link)} className="flex-row items-center mt-4">
                                <Text className="text-rose-400 font-bold mr-2">Visit Website</Text>
                                <Ionicons name="arrow-forward" size={16} color="#fb7185" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* SETLIST SECTION (Optional) */}
                    {event.show_setlist && event.routines && event.routines.length > 0 && (
                        <View className="mb-12">
                            <View className="flex-row items-center mb-6">
                                <Ionicons name="musical-notes" size={24} color="#f43f5e" style={{ marginRight: 12 }} />
                                <Text className="text-white font-black text-2xl">Tonight's Set</Text>
                            </View>

                            {event.routines.map((routine, i) => (
                                <View key={i} className="mb-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                                    <Text className="text-rose-400 font-bold uppercase tracking-widest text-xs mb-4">Set {i + 1}</Text>
                                    {routine.blocks.map((block, j) => (
                                        <View key={j} className="flex-row items-center mb-3 last:mb-0">
                                            <Text className="text-slate-500 font-mono text-xs w-6 mr-2">{j + 1}.</Text>
                                            <Text className="text-slate-200 font-medium text-lg">{block.title}</Text>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* OPUSMODE GROWTH HOOK */}
                    <View className="items-center py-10 border-t border-slate-800">
                        <Text className="text-slate-500 font-bold text-[10px] uppercase tracking-[4px] mb-4">Powered by</Text>
                        <View className="flex-row items-center gap-2 mb-4">
                            <View className="w-8 h-8 bg-indigo-500 rounded-lg items-center justify-center">
                                <Ionicons name="musical-note" size={20} color="white" />
                            </View>
                            <Text className="text-white font-black text-xl tracking-[4px]">OPUSMODE</Text>
                        </View>
                        <Text className="text-slate-400 text-center text-xs px-10 leading-relaxed mb-6">
                            Are you a musician? Organize your band, get gigs, and track your finances with OpusMode.
                        </Text>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('https://opusmode.net')}
                            className="bg-white/10 px-6 py-3 rounded-full border border-white/20"
                        >
                            <Text className="text-white font-bold text-xs">Get the App</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
