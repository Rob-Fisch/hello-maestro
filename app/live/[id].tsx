import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Linking, SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function LiveGigMode() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { events, setLists, songs } = useContentStore();

    const event = events.find(e => e.id === id);
    const setList = setLists.find(sl => sl.eventId === id);

    const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

    // View Mode: 'stage' (dark, interactive) vs 'print' (light, static, expanded)
    const [viewMode, setViewMode] = useState<'stage' | 'print'>('stage');

    const toggleExpand = (itemId: string) => {
        if (viewMode === 'print') return; // Disable collapsing in print mode? Or maybe allow it.
        // Let's allow expanding manually in print mode too, but default logic might differ.
        const newSet = new Set(expandedIds);
        if (newSet.has(itemId)) {
            newSet.delete(itemId);
        } else {
            newSet.add(itemId);
        }
        setExpandedIds(newSet);
    };

    if (!event) {
        return (
            <View className="flex-1 bg-black items-center justify-center">
                <Text className="text-white font-bold text-lg">Event not found</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white/10 px-6 py-3 rounded-full">
                    <Text className="text-white">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    if (!setList || setList.items.length === 0) {
        return (
            <View className="flex-1 bg-black items-center justify-center px-8">
                <Ionicons name="musical-notes-outline" size={64} color="#525252" />
                <Text className="text-neutral-400 font-bold text-xl mt-6 text-center">No Set List Created</Text>
                <Text className="text-neutral-600 text-center mt-2 mb-8">
                    Go to "Edit Event" &gt; "Set List" to build your set.
                </Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-white/10 px-6 py-3 rounded-full">
                    <Text className="text-white font-bold">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <View className={`flex-1 ${viewMode === 'print' ? 'bg-white' : 'bg-black'}`}>
            <StatusBar barStyle={viewMode === 'print' ? 'dark-content' : 'light-content'} />
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header / Actions - Hide in actual Print (media query impossible in native, so simpler UI) */}
            <SafeAreaView className={`${viewMode === 'print' ? 'bg-white border-slate-200 py-4' : 'bg-neutral-900 border-neutral-800'} border-b`}>
                {viewMode === 'print' ? (
                    // PRINT HEADER
                    <View className="px-5 flex-row justify-between items-start">
                        <View className="flex-1">
                            <Text className="text-3xl font-black text-black uppercase tracking-tight mb-1">{event.title}</Text>
                            <Text className="text-slate-600 text-lg font-bold">{event.venue}</Text>
                            <Text className="text-slate-500 font-medium">
                                {new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} @ {event.time}
                            </Text>
                        </View>

                        {/* View Control for Print */}
                        <View className="flex-row items-center bg-gray-100 rounded-lg p-1 ml-4 print:hidden">
                            <TouchableOpacity onPress={() => setViewMode('stage')} className="px-3 py-1">
                                <Text className="text-xs font-bold text-gray-400">STAGE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setViewMode('print')} className="px-3 py-1 bg-white shadow-sm rounded-md">
                                <Text className="text-xs font-bold text-black">PRINT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    // STAGE HEADER
                    <View className="px-5 py-4 flex-row justify-between items-center">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="flex-row items-center opacity-70"
                        >
                            <Ionicons name="chevron-back" size={24} color="white" />
                            <Text className="text-white ml-1 font-bold">Exit Stage</Text>
                        </TouchableOpacity>

                        <View className="flex-row items-center bg-gray-100/10 rounded-lg p-1 mr-4">
                            <TouchableOpacity onPress={() => setViewMode('stage')} className="px-3 py-1 bg-neutral-800 rounded-md">
                                <Text className="text-xs font-bold text-white">STAGE</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setViewMode('print')} className="px-3 py-1">
                                <Text className="text-xs font-bold text-gray-400">PRINT</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="items-end">
                            <Text className="font-black text-lg uppercase tracking-wider text-white">{event.title}</Text>
                            <Text className="text-neutral-400 text-xs font-bold">{event.venue}</Text>
                        </View>
                    </View>
                )}
            </SafeAreaView>

            {/* Print Table Header Row */}
            {viewMode === 'print' && (
                <View className="flex-row px-5 py-2 border-b-2 border-slate-800 bg-slate-50">
                    <Text className="w-10 font-bold text-slate-500 text-xs uppercase">#</Text>
                    <Text className="flex-1 font-bold text-slate-500 text-xs uppercase">Song / Artist</Text>
                    <Text className="w-24 font-bold text-slate-500 text-xs uppercase text-center">Key / BPM</Text>
                    <Text className="flex-1 font-bold text-slate-500 text-xs uppercase ml-4">Notes</Text>
                </View>
            )}

            {/* Set List Scroll */}
            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                {setList.items.map((item, index) => {
                    // In print mode, auto-expand if desired, or let user expand.
                    // User said "without links", "put on music stand".
                    // Print view usually shows key info cleanly.
                    const isExpanded = expandedIds.has(item.id) || viewMode === 'print';
                    const song = item.type === 'song' ? songs.find(s => s.id === item.songId) : null;
                    const isBreak = item.type === 'break';

                    if (isBreak) {
                        return (
                            <View key={item.id} className={`${viewMode === 'print' ? 'bg-slate-100 py-2 border-y border-slate-200' : 'bg-neutral-900/50 py-4 px-6 mb-1 mt-1 border-l-4 border-amber-500'}`}>
                                {viewMode === 'print' ? (
                                    <View className="flex-row px-5 items-center justify-center">
                                        <Text className="font-black text-slate-400 uppercase tracking-widest text-sm">— BREAK (10 MIN) —</Text>
                                    </View>
                                ) : (
                                    <View className="flex-row items-center">
                                        <Ionicons name="cafe-outline" size={24} color="#f59e0b" />
                                        <Text className="text-amber-500 font-black text-2xl uppercase ml-3 tracking-widest">Break</Text>
                                        <View className="ml-auto px-3 py-1 rounded">
                                            <Text className="text-amber-500 font-bold">10 MIN</Text>
                                        </View>
                                    </View>
                                )}
                            </View>
                        );
                    }

                    if (viewMode === 'print') {
                        // PRINT TABLE ROW
                        return (
                            <View key={item.id} className="flex-row px-5 py-3 border-b border-slate-200 bg-white items-start">
                                {/* # */}
                                <Text className="w-10 text-slate-400 font-bold text-sm pt-0.5">{index + 1}</Text>

                                {/* Song / Artist */}
                                <View className="flex-1 pr-2">
                                    <Text className="text-black font-bold text-base leading-tight">{song?.title}</Text>
                                    <Text className="text-slate-500 text-xs font-bold uppercase mt-0.5">{song?.artist}</Text>
                                </View>

                                {/* Key / BPM */}
                                <View className="w-24 items-center">
                                    <Text className="font-bold text-slate-800 text-base">{song?.key || '-'}</Text>
                                    <Text className="text-slate-400 text-[10px] font-bold">{song?.bpm ? `${song.bpm} bpm` : ''}</Text>
                                </View>

                                {/* Notes */}
                                <View className="flex-1 ml-4 pt-0.5">
                                    <Text className="text-slate-600 text-sm italic leading-tight">{song?.notes || ''}</Text>
                                </View>
                            </View>
                        );
                    }

                    // STAGE LIST ROW (Original - Optimized)
                    return (
                        <TouchableOpacity
                            key={item.id}
                            activeOpacity={0.9}
                            onPress={() => toggleExpand(item.id)}
                            className={`border-b ${isExpanded ? 'bg-neutral-900 border-neutral-800' : 'bg-black border-neutral-800'}`}
                        >
                            <View className="p-4 flex-row items-center">
                                {/* Number */}
                                <Text className="text-neutral-600 font-black text-xl w-10">{index + 1}</Text>

                                {/* Song Info */}
                                <View className="flex-1 pr-2">
                                    <View className="flex-row items-center flex-wrap">
                                        <Text className={`font-bold text-2xl mr-2 ${isExpanded ? 'text-indigo-400' : 'text-white'}`}>
                                            {song?.title || 'Unknown Song'}
                                        </Text>
                                        {song?.artist && (
                                            <Text className="text-neutral-500 font-bold text-sm uppercase mt-1">{song.artist}</Text>
                                        )}
                                    </View>
                                </View>

                                {/* Key / BPM */}
                                <View className="items-end">
                                    {song?.key && (
                                        <View className="bg-neutral-800 px-3 py-1.5 rounded-lg mb-1">
                                            <Text className="text-white font-bold text-lg">{song.key}</Text>
                                        </View>
                                    )}
                                    {song?.bpm && (
                                        <Text className="text-neutral-600 font-bold text-xs">{song.bpm} BPM</Text>
                                    )}
                                </View>
                            </View>

                            {/* Expanded Details */}
                            {isExpanded && (
                                <View className="px-4 pb-4 pl-14">
                                    {/* Links - Horizontal Scroll for Conciseness */}
                                    {song?.links && song.links.length > 0 && (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            className="mb-3"
                                            contentContainerStyle={{ paddingRight: 20 }}
                                        >
                                            {song.links.map((link, i) => (
                                                <TouchableOpacity
                                                    key={i}
                                                    onPress={() => openLink(link.url)}
                                                    className="bg-indigo-600/20 border border-indigo-500/30 px-3 py-2 rounded-lg flex-row items-center mr-2"
                                                >
                                                    <Ionicons
                                                        name={link.label.toLowerCase().includes('spotify') ? 'musical-notes' : 'link'}
                                                        size={16}
                                                        color="#818cf8"
                                                    />
                                                    <Text className="text-indigo-400 font-bold ml-2 text-sm">{link.label}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    )}

                                    {/* Notes */}
                                    {song?.notes ? (
                                        <View className="bg-neutral-800/50 border-neutral-600 p-3 rounded-lg border-l-4">
                                            <Text className="text-neutral-400 font-bold text-xs uppercase mb-1">Notes</Text>
                                            <Text className="text-neutral-200 text-base leading-relaxed">{song.notes}</Text>
                                        </View>
                                    ) : (
                                        <Text className="text-neutral-700 italic">No notes available.</Text>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}
