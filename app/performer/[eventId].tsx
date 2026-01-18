
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PerformerEventData = {
    id: string;
    title: string;
    venue: string;
    date: string;
    time: string;
    load_in_time?: string;
    soundcheck_time?: string;
    notes?: string;
    // Structured venue address
    venue_address_line1?: string;
    venue_address_line2?: string;
    venue_city?: string;
    venue_state_province?: string;
    venue_postal_code?: string;
    venue_country?: string;
    routines?: {
        title: string;
        blocks: {
            title: string;
            content?: string;
            link_url?: string;
            media_uri?: string;
        }[];
    }[];
};

type SetListData = {
    id: string;
    title: string;
    items: {
        id: string;
        type: 'song' | 'break';
        songId?: string;
        label?: string;
        note?: string;
        songTitle?: string; // Resolved from songs table
        songArtist?: string;
        songKey?: string;
        songLinks?: { label: string; url: string }[]; // Song links
    }[];
};

export default function PerformerPage() {
    const { eventId } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [event, setEvent] = useState<PerformerEventData | null>(null);
    const [setList, setSetList] = useState<SetListData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthAndFetchData();
    }, [eventId]);

    const checkAuthAndFetchData = async () => {
        // Check if user is authenticated
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.user) {
            setIsAuthenticated(false);
            setLoading(false);
            return;
        }

        setIsAuthenticated(true);
        await fetchEventData();
    };

    const fetchEventData = async () => {
        if (!eventId) return;

        try {
            // Fetch Event with all logistics details
            const { data: eventData, error: eventError } = await supabase
                .from('events')
                .select(`
                    id, title, venue, date, time, notes,
                    load_in_time, soundcheck_time,
                    venue_address_line1, venue_address_line2,
                    venue_city, venue_state_province, venue_postal_code, venue_country,
                    routines
                `)
                .eq('id', eventId)
                .eq('is_performer_page_enabled', true)
                .single();

            if (eventError) throw eventError;

            // Fetch Routine Details if available
            let routineDetails: any[] = [];
            if (eventData.routines && eventData.routines.length > 0) {
                const { data: routines } = await supabase
                    .from('routines')
                    .select('title, blocks')
                    .in('id', eventData.routines);
                routineDetails = routines || [];
            }

            // Fetch Set List linked to this event
            const { data: setListData } = await supabase
                .from('set_lists')
                .select('id, title, items')
                .eq('event_id', eventId)
                .is('deleted_at', null)
                .single();

            if (setListData && setListData.items) {
                // Resolve song titles from the songs table
                const songIds = setListData.items
                    .filter((item: any) => item.type === 'song' && item.songId)
                    .map((item: any) => item.songId);

                let songsMap: Record<string, { title: string; artist?: string; key?: string; links?: { label: string; url: string }[] }> = {};
                if (songIds.length > 0) {
                    const { data: songs } = await supabase
                        .from('songs')
                        .select('id, title, artist, key, links')
                        .in('id', songIds);

                    if (songs) {
                        songsMap = songs.reduce((acc: any, song: any) => {
                            acc[song.id] = { title: song.title, artist: song.artist, key: song.key, links: song.links };
                            return acc;
                        }, {});
                    }
                }

                // Enrich set list items with song details
                const enrichedItems = setListData.items.map((item: any) => ({
                    ...item,
                    songTitle: item.songId ? songsMap[item.songId]?.title : undefined,
                    songArtist: item.songId ? songsMap[item.songId]?.artist : undefined,
                    songKey: item.songId ? songsMap[item.songId]?.key : undefined,
                    songLinks: item.songId ? songsMap[item.songId]?.links : undefined,
                }));

                setSetList({
                    id: setListData.id,
                    title: setListData.title,
                    items: enrichedItems,
                });
            }

            setEvent({
                ...eventData,
                routines: routineDetails
            });

        } catch (err) {
            console.error('Error fetching performer page:', err);
            setError('Could not load event data. The Performer Page may not be enabled for this event.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (timeStr?: string) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const h = parseInt(hours, 10);
        if (isNaN(h)) return timeStr;
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
    };

    const openMap = () => {
        if (!event) return;

        const addressParts = [
            event.venue_address_line1,
            event.venue_city,
            event.venue_state_province,
            event.venue_postal_code
        ].filter(Boolean);

        if (addressParts.length === 0) {
            Alert.alert('No Address', 'No venue address available for this event.');
            return;
        }

        const address = addressParts.join(', ');
        const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
        Linking.openURL(url);
    };

    // Auth gate - show sign-up prompt if not authenticated
    if (!loading && !isAuthenticated) {
        return (
            <View className="flex-1 bg-slate-900 items-center justify-center px-6">
                <Stack.Screen options={{ headerShown: false }} />

                <View className="w-16 h-16 bg-indigo-500 rounded-full items-center justify-center mb-6">
                    <Ionicons name="musical-note" size={32} color="white" />
                </View>

                <Text className="text-white font-black text-2xl mb-2 text-center">
                    OpusMode Performer Page
                </Text>

                <Text className="text-slate-400 text-center mb-8 leading-relaxed">
                    This page contains performance details for ensemble members.
                </Text>

                <View className="bg-slate-800 rounded-2xl p-6 mb-8 w-full max-w-md">
                    <Text className="text-white font-bold mb-3">Sign up for a free account to view:</Text>
                    <View className="space-y-2">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="time-outline" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                            <Text className="text-slate-300 text-sm">Load-in and soundcheck times</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="list-outline" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                            <Text className="text-slate-300 text-sm">Complete setlist with charts and notes</Text>
                        </View>
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="location-outline" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                            <Text className="text-slate-300 text-sm">Venue address and directions</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Ionicons name="document-text-outline" size={16} color="#94a3b8" style={{ marginRight: 8 }} />
                            <Text className="text-slate-300 text-sm">Performance logistics</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.push('/modal/auth')}
                    className="bg-indigo-600 px-8 py-4 rounded-full mb-4 w-full max-w-md"
                >
                    <Text className="text-white font-bold text-center text-lg">Sign Up Free</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => router.push('/modal/auth')}
                    className="bg-slate-800 border border-slate-700 px-8 py-4 rounded-full w-full max-w-md"
                >
                    <Text className="text-white font-bold text-center">Log In</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-900">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (error || !event) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-900 px-6">
                <Ionicons name="alert-circle-outline" size={64} color="#64748b" />
                <Text className="text-slate-400 mt-4 text-center">{error || 'Event not found'}</Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-indigo-600 px-6 py-3 rounded-full mt-6"
                >
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const hasVenueAddress = event.venue_address_line1 || event.venue_city;

    return (
        <View className="flex-1 bg-slate-900">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* HEADER */}
                <View className="relative p-6 pt-16 bg-gradient-to-b from-indigo-900/30 to-transparent">
                    <View className="flex-row items-center mb-4">
                        <View className="w-10 h-10 bg-indigo-500 rounded-full items-center justify-center mr-3">
                            <Ionicons name="musical-note" size={20} color="white" />
                        </View>
                        <Text className="text-indigo-400 font-bold uppercase tracking-widest text-xs">
                            Performer Logistics
                        </Text>
                    </View>

                    <Text className="text-4xl font-black text-white leading-tight mb-2">
                        {event.title}
                    </Text>

                    <View className="flex-row items-center mb-1">
                        <Ionicons name="calendar-outline" size={18} color="#94a3b8" />
                        <Text className="text-slate-300 font-bold ml-2 text-lg">
                            {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </Text>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={18} color="#94a3b8" />
                        <Text className="text-slate-300 font-medium ml-2 text-base">{event.venue}</Text>
                    </View>
                </View>

                <View className="px-6">
                    {/* TIMING CARD */}
                    <View className="bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-700">
                        <Text className="text-white font-black text-xl mb-4">Schedule</Text>

                        <View className="space-y-3">
                            {event.load_in_time && (
                                <View className="flex-row items-center justify-between py-2 border-b border-slate-700">
                                    <View className="flex-row items-center">
                                        <Ionicons name="enter-outline" size={20} color="#818cf8" />
                                        <Text className="text-slate-400 font-bold ml-3">Load-In</Text>
                                    </View>
                                    <Text className="text-white font-black text-lg">{formatTime(event.load_in_time)}</Text>
                                </View>
                            )}

                            {event.soundcheck_time && (
                                <View className="flex-row items-center justify-between py-2 border-b border-slate-700">
                                    <View className="flex-row items-center">
                                        <Ionicons name="mic-outline" size={20} color="#818cf8" />
                                        <Text className="text-slate-400 font-bold ml-3">Soundcheck</Text>
                                    </View>
                                    <Text className="text-white font-black text-lg">{formatTime(event.soundcheck_time)}</Text>
                                </View>
                            )}

                            <View className="flex-row items-center justify-between py-2">
                                <View className="flex-row items-center">
                                    <Ionicons name="play-outline" size={20} color="#818cf8" />
                                    <Text className="text-slate-400 font-bold ml-3">Performance</Text>
                                </View>
                                <Text className="text-white font-black text-lg">{formatTime(event.time)}</Text>
                            </View>
                        </View>
                    </View>

                    {/* VENUE ADDRESS CARD */}
                    {hasVenueAddress && (
                        <View className="bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-700">
                            <View className="flex-row items-center justify-between mb-4">
                                <Text className="text-white font-black text-xl">Venue Address</Text>
                                <TouchableOpacity
                                    onPress={openMap}
                                    className="bg-indigo-600 px-4 py-2 rounded-full flex-row items-center"
                                >
                                    <Ionicons name="navigate" size={16} color="white" />
                                    <Text className="text-white font-bold ml-2 text-sm">Directions</Text>
                                </TouchableOpacity>
                            </View>

                            <View className="bg-slate-900 rounded-xl p-4">
                                <Text className="text-slate-300 font-medium leading-relaxed">
                                    {event.venue_address_line1}
                                    {event.venue_address_line2 && `\n${event.venue_address_line2}`}
                                    {'\n'}
                                    {event.venue_city}{event.venue_state_province && `, ${event.venue_state_province}`} {event.venue_postal_code}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* SET LIST SECTION (from set_lists table) */}
                    {setList && setList.items && setList.items.length > 0 && (
                        <View className="bg-slate-800 rounded-3xl p-6 mb-6 border border-slate-700">
                            <View className="flex-row items-center mb-4">
                                <Ionicons name="list" size={24} color="#4f46e5" style={{ marginRight: 12 }} />
                                <View>
                                    <Text className="text-white font-black text-xl">Set List</Text>
                                    {setList.title && (
                                        <Text className="text-slate-400 text-sm">{setList.title}</Text>
                                    )}
                                </View>
                            </View>

                            <View className="space-y-2">
                                {setList.items.map((item, index) => (
                                    <View key={item.id || index} className={`flex-row items-center py-3 ${index !== setList.items.length - 1 ? 'border-b border-slate-700' : ''}`}>
                                        <Text className="text-slate-500 font-mono text-sm w-8">{index + 1}.</Text>
                                        {item.type === 'song' ? (
                                            <View className="flex-1 flex-row items-center justify-between">
                                                <View className="flex-1">
                                                    <Text className="text-white font-bold text-base">
                                                        {item.songTitle || 'Unknown Song'}
                                                    </Text>
                                                    {(item.songArtist || item.songKey) && (
                                                        <Text className="text-slate-400 text-sm">
                                                            {item.songArtist}{item.songKey && ` • Key of ${item.songKey}`}
                                                        </Text>
                                                    )}
                                                    {item.note && (
                                                        <Text className="text-indigo-400 text-xs mt-1 italic">
                                                            📝 {item.note}
                                                        </Text>
                                                    )}
                                                    {/* Song Links */}
                                                    {item.songLinks && item.songLinks.length > 0 && (
                                                        <View className="flex-row flex-wrap gap-2 mt-2">
                                                            {item.songLinks.map((link, linkIdx) => (
                                                                <TouchableOpacity
                                                                    key={linkIdx}
                                                                    onPress={() => Linking.openURL(link.url)}
                                                                    className="flex-row items-center bg-indigo-600/20 border border-indigo-500/30 px-2 py-1 rounded-lg"
                                                                >
                                                                    <Ionicons
                                                                        name={link.url.includes('youtube') ? 'logo-youtube' : link.url.includes('spotify') ? 'musical-notes' : 'link'}
                                                                        size={12}
                                                                        color="#818cf8"
                                                                    />
                                                                    <Text className="text-indigo-400 font-bold ml-1 text-xs">{link.label}</Text>
                                                                </TouchableOpacity>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
                                        ) : (
                                            <View className="flex-1 flex-row items-center">
                                                <View className="bg-amber-500/20 px-3 py-1 rounded-full">
                                                    <Text className="text-amber-400 font-bold text-sm">
                                                        ☕ {item.label || 'Break'}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ROUTINES SECTION (legacy) */}
                    {event.routines && event.routines.length > 0 && (
                        <View className="mb-6">
                            <View className="flex-row items-center mb-4">
                                <Ionicons name="musical-notes" size={24} color="#4f46e5" style={{ marginRight: 12 }} />
                                <Text className="text-white font-black text-2xl">Setlist</Text>
                            </View>

                            {event.routines.map((routine, i) => (
                                <View key={i} className="mb-6 bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50">
                                    <Text className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4">
                                        Set {i + 1}: {routine.title}
                                    </Text>
                                    {routine.blocks.map((block, j) => (
                                        <View key={j} className="mb-4 last:mb-0">
                                            <View className="flex-row items-start">
                                                <Text className="text-slate-500 font-mono text-xs w-8 mr-2 mt-1">{j + 1}.</Text>
                                                <View className="flex-1">
                                                    <Text className="text-slate-200 font-bold text-lg mb-1">{block.title}</Text>
                                                    {block.content && (
                                                        <Text className="text-slate-400 text-sm mb-2">{block.content}</Text>
                                                    )}
                                                    {block.link_url && (
                                                        <TouchableOpacity
                                                            onPress={() => Linking.openURL(block.link_url!)}
                                                            className="flex-row items-center mt-1"
                                                        >
                                                            <Ionicons name="link" size={14} color="#818cf8" />
                                                            <Text className="text-indigo-400 text-xs font-bold ml-1">View Chart</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* NOTES SECTION */}
                    {event.notes && (
                        <View className="bg-amber-900/20 border border-amber-700/30 p-6 rounded-3xl mb-6">
                            <View className="flex-row items-center mb-3">
                                <Ionicons name="document-text" size={20} color="#fbbf24" />
                                <Text className="text-amber-400 font-bold ml-2 uppercase tracking-wide text-xs">
                                    Internal Notes
                                </Text>
                            </View>
                            <Text className="text-amber-100 text-base leading-relaxed">
                                {event.notes}
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
