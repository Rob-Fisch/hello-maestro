import { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';

/**
 * The Stage - Gig Management Hub
 * 
 * Gig-First layout:
 * - Create a Gig action at top
 * - Upcoming gigs with status badges
 * - Quick Share Band Link action
 * - Building Blocks bar at bottom
 */
export default function StageScreen() {
    const { events, setLists, people } = useContentStore();
    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Workflow modal state
    const [showWorkflow, setShowWorkflow] = useState(false);

    // Filter to gigs and rehearsals (performance-related events)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stageEvents = (events || [])
        .filter(e => e.type === 'performance' || e.type === 'gig' || e.type === 'rehearsal')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const upcomingEvents = stageEvents.filter(e => new Date(e.date) >= today);
    const pastEvents = stageEvents.filter(e => new Date(e.date) < today);

    // Helper: Get linked set list title
    const getSetListTitle = (eventId: string) => {
        // Set lists are linked via setList.eventId, not event.setListId
        const linkedSetList = setLists?.find(s => s.eventId === eventId && !s.deletedAt);
        return linkedSetList?.title || null;
    };

    // Helper: Count assigned slots
    const getAssignedCount = (eventId: string) => {
        const event = events?.find(e => e.id === eventId);
        if (!event?.slots) return 0;
        return event.slots.filter((s: any) => s.musicianId).length;
    };

    // Helper: Format time to 12-hour AM/PM (per /time-format workflow)
    const formatTime = (time: string) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':').map(Number);
        const period = hours >= 12 ? 'PM' : 'AM';
        const hour12 = hours % 12 || 12;
        return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background }}
        >
            <View className="w-full max-w-3xl p-4 md:p-6 mx-auto" style={{ marginTop: Math.max(insets.top, 20) }}>
                {/* Header */}
                <View className="flex-row items-center justify-between mb-6">
                    <View className="flex-row items-center">
                        <TouchableOpacity
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            className="mr-3 p-2 -ml-2 rounded-full"
                        >
                            <Ionicons name="menu" size={28} color={theme.text} />
                        </TouchableOpacity>
                        <View className="w-10 h-10 rounded-xl bg-purple-600 items-center justify-center mr-3">
                            <Ionicons name="mic" size={20} color="white" />
                        </View>
                        <Text className="text-2xl font-black text-white">The Stage</Text>
                    </View>
                </View>

                {/* TOP ACTIONS - 2 Column Layout */}
                <View className="flex-row gap-3 mb-6">
                    {/* CREATE A GIG */}
                    <TouchableOpacity
                        onPress={() => router.push('/modal/event-editor')}
                        activeOpacity={0.8}
                        className="flex-1"
                    >
                        <LinearGradient
                            colors={['#7c3aed', '#a855f7']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 16, padding: 16, height: 100, justifyContent: 'space-between' }}
                        >
                            <View className="flex-row justify-between items-start">
                                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                    <Ionicons name="add" size={24} color="white" />
                                </View>
                                {/* How it works button */}
                                <TouchableOpacity
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        setShowWorkflow(true);
                                    }}
                                    className="bg-white/20 p-2 rounded-full"
                                >
                                    <Ionicons name="help-circle-outline" size={16} color="white" />
                                </TouchableOpacity>
                            </View>
                            <View>
                                <Text className="text-base font-bold text-white">Create a Gig</Text>
                                <Text className="text-white/60 text-[10px]">Add to schedule</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* THE NAVIGATOR */}
                    <TouchableOpacity
                        onPress={() => router.push('/coach')}
                        activeOpacity={0.8}
                        className="flex-1"
                    >
                        <LinearGradient
                            colors={['#0891b2', '#06b6d4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ borderRadius: 16, padding: 16, height: 100, justifyContent: 'space-between' }}
                        >
                            <View className="flex-row justify-between items-start">
                                <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center">
                                    <Ionicons name="compass" size={24} color="white" />
                                </View>
                                <View className="bg-white/20 px-2 py-1 rounded-full">
                                    <Text className="text-white text-[8px] font-black">AI-POWERED</Text>
                                </View>
                            </View>
                            <View>
                                <Text className="text-base font-bold text-white">The Navigator</Text>
                                <Text className="text-white/60 text-[10px]">Find venues, teaching gigs & more</Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* UPCOMING EVENTS (Gigs + Rehearsals) */}
                {upcomingEvents.length > 0 && (
                    <View className="mb-8">
                        {/* Header with Legend */}
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                                Upcoming
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/events')}>
                                <Text className="text-indigo-400 text-xs font-semibold">Full Schedule →</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Legend */}
                        <View className="flex-row items-center gap-4 mb-4">
                            <View className="flex-row items-center">
                                <View className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1.5" />
                                <Text className="text-slate-500 text-[10px]">Gig</Text>
                            </View>
                            <View className="flex-row items-center">
                                <View className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5" />
                                <Text className="text-slate-500 text-[10px]">Rehearsal</Text>
                            </View>
                        </View>

                        {upcomingEvents.slice(0, 5).map((evt) => {
                            const evtDate = new Date(evt.date);
                            const setListTitle = getSetListTitle(evt.id);
                            const assignedCount = getAssignedCount(evt.id);
                            const isRehearsal = evt.type === 'rehearsal';
                            // Readiness checks
                            const hasSetList = !!setListTitle;
                            const hasBand = assignedCount > 0;
                            const hasInstructions = !!(evt.notes && evt.notes.trim());
                            const hasLocation = !!(evt.venue && evt.venue.trim()) || !!(evt.venueAddressLine1 && evt.venueAddressLine1.trim()) || !!(evt.venueCity && evt.venueCity.trim());

                            return (
                                <TouchableOpacity
                                    key={evt.id}
                                    onPress={() => router.push(`/event/${evt.id}`)}
                                    className="bg-slate-800/40 border border-slate-700/40 rounded-2xl p-4 mb-3"
                                >
                                    <View className="flex-row items-start mb-2">
                                        {/* LED Indicator */}
                                        <View
                                            className={`w-3 h-3 rounded-full mt-1 mr-3 ${isRehearsal ? 'bg-amber-500' : 'bg-purple-500'}`}
                                        />
                                        <View className="flex-1">
                                            <Text className="text-white font-bold text-base">{evt.title}</Text>
                                            <Text className="text-slate-400 text-sm">
                                                {evtDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                                                {evt.time && ` • ${formatTime(evt.time)}`}
                                            </Text>
                                            {evt.venue && (
                                                <Text className="text-slate-500 text-xs mt-1">{evt.venue}</Text>
                                            )}
                                        </View>
                                    </View>

                                    {/* Gig Readiness Pills */}
                                    <View className="flex-row flex-wrap gap-2 mb-1">
                                        {/* Set List */}
                                        <View className={`px-2 py-1 rounded-lg flex-row items-center ${hasSetList ? 'bg-emerald-500/20' : 'bg-slate-600/30'}`}>
                                            <Text className={`text-xs ${hasSetList ? 'text-emerald-300' : 'text-slate-500'}`}>
                                                {hasSetList ? '✓' : '✗'} Set List
                                            </Text>
                                        </View>

                                        {/* Band */}
                                        <View className={`px-2 py-1 rounded-lg flex-row items-center ${hasBand ? 'bg-emerald-500/20' : 'bg-slate-600/30'}`}>
                                            <Text className={`text-xs ${hasBand ? 'text-emerald-300' : 'text-slate-500'}`}>
                                                {hasBand ? `${assignedCount} assigned` : '✗ Band'}
                                            </Text>
                                        </View>

                                        {/* Instructions */}
                                        <View className={`px-2 py-1 rounded-lg flex-row items-center ${hasInstructions ? 'bg-emerald-500/20' : 'bg-slate-600/30'}`}>
                                            <Text className={`text-xs ${hasInstructions ? 'text-emerald-300' : 'text-slate-500'}`}>
                                                {hasInstructions ? '✓' : '✗'} Instructions
                                            </Text>
                                        </View>

                                        {/* Location */}
                                        <View className={`px-2 py-1 rounded-lg flex-row items-center ${hasLocation ? 'bg-emerald-500/20' : 'bg-slate-600/30'}`}>
                                            <Text className={`text-xs ${hasLocation ? 'text-emerald-300' : 'text-slate-500'}`}>
                                                {hasLocation ? '✓' : '✗'} Location
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}

                        {upcomingEvents.length > 5 && (
                            <TouchableOpacity
                                onPress={() => router.push('/events')}
                                className="py-3"
                            >
                                <Text className="text-indigo-400 text-sm font-semibold text-center">
                                    View all {upcomingEvents.length} events →
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* EMPTY STATE */}
                {upcomingEvents.length === 0 && (
                    <View className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-8 items-center mb-8">
                        <Ionicons name="calendar-outline" size={48} color="#64748b" style={{ marginBottom: 12 }} />
                        <Text className="text-slate-400 text-center text-sm">
                            No upcoming gigs or rehearsals.{'\n'}Tap "Create a Gig" to add one!
                        </Text>
                    </View>
                )}

                {/* BUILDING BLOCKS */}
                <View className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-4">
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Building Blocks</Text>

                    <View className="gap-3">
                        <TouchableOpacity
                            onPress={() => router.push('/songs')}
                            className="bg-slate-700/40 p-4 rounded-xl flex-row items-center"
                        >
                            <View className="w-12 h-12 rounded-xl bg-indigo-500/20 items-center justify-center mr-4">
                                <Ionicons name="musical-notes" size={24} color="#818cf8" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-base">Song Library</Text>
                                <Text className="text-slate-400 text-xs">Edit songs, add keys, links & notes</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748b" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/setlists')}
                            className="bg-slate-700/40 p-4 rounded-xl flex-row items-center"
                        >
                            <View className="w-12 h-12 rounded-xl bg-purple-500/20 items-center justify-center mr-4">
                                <Ionicons name="list" size={24} color="#a78bfa" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-base">Set List Templates</Text>
                                <Text className="text-slate-400 text-xs">Master lists to copy for gigs</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748b" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/people')}
                            className="bg-slate-700/40 p-4 rounded-xl flex-row items-center"
                        >
                            <View className="w-12 h-12 rounded-xl bg-emerald-500/20 items-center justify-center mr-4">
                                <Ionicons name="people" size={24} color="#6ee7b7" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-base">All Contacts</Text>
                                <Text className="text-slate-400 text-xs">Musicians, students & venue managers</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748b" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/finance')}
                            className="bg-slate-700/40 p-4 rounded-xl flex-row items-center"
                        >
                            <View className="w-12 h-12 rounded-xl bg-amber-500/20 items-center justify-center mr-4">
                                <Ionicons name="cash" size={24} color="#fcd34d" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-white font-bold text-base">Finance</Text>
                                <Text className="text-slate-400 text-xs">Track income & expenses</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Past Events Link */}
                {pastEvents.length > 0 && (
                    <TouchableOpacity
                        onPress={() => router.push('/events')}
                        className="mt-6 py-3"
                    >
                        <Text className="text-slate-500 text-sm text-center">
                            {pastEvents.length} past event{pastEvents.length > 1 ? 's' : ''} • View history
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* GIG WORKFLOW MODAL */}
            <Modal visible={showWorkflow} transparent animationType="fade" onRequestClose={() => setShowWorkflow(false)}>
                <View className="flex-1 bg-black/90 justify-center items-center p-6">
                    <TouchableOpacity
                        onPress={() => setShowWorkflow(false)}
                        className="absolute top-12 right-6 z-50 p-3 bg-white/20 rounded-full"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    <Text className="text-white text-2xl font-black mb-4">The Gig Workflow</Text>
                    <Text className="text-white/70 text-center mb-6">How gig management works in OpusMode</Text>

                    <Image
                        source={require('../../assets/images/gig_workflow.png')}
                        style={{ width: '100%', height: '60%' }}
                        resizeMode="contain"
                    />

                    <TouchableOpacity
                        onPress={() => {
                            setShowWorkflow(false);
                            router.push('/modal/event-editor');
                        }}
                        className="bg-purple-600 px-6 py-3 rounded-full mt-6"
                    >
                        <Text className="text-white font-bold">Create a Gig →</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </ScrollView>
    );
}
