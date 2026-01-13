import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SiteMapScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [viewMode, setViewMode] = useState<'functional' | 'schema' | 'workflow'>('functional');

    const SECTIONS = [
        {
            title: "The Vault",
            subtitle: "Foundation Assets",
            icon: "file-tray-full-outline",
            color: "#60a5fa", // Blue
            items: [
                { label: "Song Library", path: "/songs", icon: "mic-outline", desc: "Lyrics, chords, and attachments." },
                { label: "People & Roster", path: "/people", icon: "people-outline", desc: "Bandmates, subs, and contacts." },
                // { label: "Venue Database", path: "/venues", icon: "business-outline", desc: "Locations and booking info.", locked: true }, // Future
                // { label: "Gear Vault", path: "/gear-vault", icon: "briefcase-outline", desc: "Equipment inventory.", locked: true } // Future
            ]
        },
        {
            title: "The Studio",
            subtitle: "Preparation & Practice",
            icon: "headset-outline",
            color: "#a78bfa", // Purple
            items: [
                { label: "Practice Routines", path: "/routines", icon: "stopwatch-outline", desc: "Drills and warm-ups." },
                { label: "Setlist Builder", path: "/setlists", icon: "list-outline", desc: "Craft the perfect show order." },
            ]
        },
        {
            title: "The Stage",
            subtitle: "Execution",
            icon: "flash-outline",
            color: "#f472b6", // Pink
            items: [
                { label: "Gig Calendar", path: "/events", icon: "calendar-outline", desc: "Schedule and logistics." },
                { label: "Live Mode", path: "/events", icon: "play-circle-outline", desc: "Performance view for stage." },
            ]
        },
        {
            title: "The Office",
            subtitle: "Business & Growth",
            icon: "briefcase-outline",
            color: "#34d399", // Emerald
            items: [
                { label: "Finance Manager", path: "/finance", icon: "wallet-outline", desc: "Income, expenses, and splits." },
                { label: "AI Coach (Scout)", path: "/coach", icon: "telescope-outline", desc: "Booking agent & career advice." },
                { label: "Settings", path: "/settings", icon: "settings-outline", desc: "Preferences and account." },
            ]
        }
    ];

    const SCHEMA_NODES = [
        {
            table: "EVENT (Gig)",
            color: "#f472b6",
            fields: [
                { name: "id", type: "PK" },
                { name: "date", type: "DATE" },
                { name: "venue_id", type: "FK", link: "VENUE" },
                { name: "setlist_id", type: "FK", link: "SETLIST" },
                { name: "roster", type: "JSON", link: "PEOPLE" }
            ]
        },
        {
            table: "SETLIST",
            color: "#a78bfa",
            fields: [
                { name: "id", type: "PK" },
                { name: "songs", type: "ARRAY", link: "SONG" },
                { name: "total_duration", type: "INT" }
            ]
        },
        {
            table: "SONG",
            color: "#60a5fa",
            fields: [
                { name: "id", type: "PK" },
                { name: "title", type: "TEXT" },
                { name: "attachments", type: "FILE[]" },
                { name: "custom_fields", type: "JSON" }
            ]
        },
        {
            table: "ROSTER (People)",
            color: "#60a5fa",
            fields: [
                { name: "id", type: "PK" },
                { name: "role", type: "TEXT", note: "(e.g. Bass)" },
                { name: "contact_info", type: "JSON" }
            ]
        },
        {
            table: "ROUTINE",
            color: "#a78bfa",
            fields: [
                { name: "id", type: "PK" },
                { name: "blocks", type: "ARRAY", link: "SONG" },
                { name: "schedule", type: "CRON" }
            ]
        }
    ];

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="p-6 pt-12 relative overflow-hidden">
                    {/* Background Decor */}
                    <View className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

                    <View className="flex-row items-center justify-between mb-2">
                        <View>
                            <Text className="text-[10px] font-black uppercase tracking-[4px] text-indigo-400 mb-2">
                                System Architecture
                            </Text>
                            <Text className="text-4xl font-black text-white tracking-tight">
                                Site Map
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-white/10 p-3 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-slate-400 font-medium leading-relaxed max-w-md">
                        Explore the four pillars of OpusMode. Tap any module to navigate directly.
                        Explore the ecosystem. Toggle views to see how OpusMode fits together.
                    </Text>
                </View>

                {/* Grid */}
                <View className="px-4 gap-6">

                    {/* View Toggle */}
                    <View className="flex-row bg-slate-800 rounded-xl p-1 mb-8 self-center shadow-lg border border-slate-700">
                        <TouchableOpacity
                            onPress={() => setViewMode('functional')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'functional' ? 'bg-indigo-600' : ''}`}
                        >
                            <Text className={`font-bold ${viewMode === 'functional' ? 'text-white' : 'text-slate-400'}`}>Card View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setViewMode('schema')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'schema' ? 'bg-indigo-600' : ''}`}
                        >
                            <Text className={`font-bold ${viewMode === 'schema' ? 'text-white' : 'text-slate-400'}`}>Concept Map</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setViewMode('workflow')}
                            className={`px-4 py-2 rounded-lg ${viewMode === 'workflow' ? 'bg-indigo-600' : ''}`}
                        >
                            <Text className={`font-bold ${viewMode === 'workflow' ? 'text-white' : 'text-slate-400'}`}>Gig Flow</Text>
                        </TouchableOpacity>
                    </View>

                    {viewMode === 'functional' ? (
                        /* FUNCTIONAL CARD VIEW */
                        SECTIONS.map((section, idx) => (
                            <View key={idx} className="mb-2">
                                {/* Section Header */}
                                <View className="flex-row items-center mb-4 px-2">
                                    <View className={`w-8 h-8 rounded-lg items-center justify-center mr-3 bg-opacity-20`} style={{ backgroundColor: section.color + '20' }}>
                                        <Ionicons name={section.icon as any} size={18} color={section.color} />
                                    </View>
                                    <View>
                                        <Text className="text-lg font-black text-white tracking-tight">{section.title}</Text>
                                        <Text className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{section.subtitle}</Text>
                                    </View>
                                    <View className="flex-1 h-[1px] bg-white/10 ml-4 mt-1" />
                                </View>

                                {/* Cards Container */}
                                <View className="flex-row flex-wrap gap-3">
                                    {section.items.map((item, itemIdx) => (
                                        <TouchableOpacity
                                            key={itemIdx}
                                            onPress={() => {
                                                if ((item as any).locked) return;
                                                router.push(item.path as any);
                                            }}
                                            activeOpacity={0.8}
                                            className={`w-[48%] p-4 rounded-2xl border ${Platform.OS === 'web' ? 'flex-1 min-w-[300px]' : ''}`}
                                            style={{
                                                backgroundColor: theme.card,
                                                borderColor: theme.border,
                                                opacity: (item as any).locked ? 0.5 : 1
                                            }}
                                        >
                                            <View className="flex-row justify-between items-start mb-3">
                                                <Ionicons name={item.icon as any} size={24} color={section.color} />
                                                {(item as any).locked && <Ionicons name="lock-closed" size={14} color="#64748b" />}
                                            </View>
                                            <Text className="font-bold text-white text-base mb-1">{item.label}</Text>
                                            <Text className="text-xs text-slate-400 leading-tight">{item.desc}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        ))
                    ) : viewMode === 'schema' ? (
                        /* CONCEPT MAP VIEW (Updated: Schedule centered) */
                        <View className="pb-20">
                            <Text className="text-center text-slate-400 text-xs mb-8">
                                Static Assets <Ionicons name="arrow-forward" /> Time & Schedule
                            </Text>

                            <View className="flex-row justify-between relative">
                                {/* Connector Lines (Absolute Overlay) */}
                                <View className="absolute inset-0 z-0">
                                    {/* Line: Vault -> Schedule */}
                                    <View className="absolute top-[80px] left-[45%] w-[10%] h-[2px] bg-indigo-500/30" />
                                    <View className="absolute top-[150px] left-[45%] w-[10%] h-[2px] bg-indigo-500/30" />
                                </View>

                                {/* COLUMN 1: THE VAULT (Static Assets) */}
                                <View className="w-[45%] gap-6">
                                    <View className="bg-indigo-900/30 border border-indigo-500/30 rounded-2xl overflow-hidden min-h-[300px]">
                                        <View className="bg-indigo-600 p-3 items-center">
                                            <Ionicons name="file-tray-full" size={20} color="white" />
                                            <Text className="text-white font-black text-sm mt-1">THE VAULT</Text>
                                        </View>

                                        <View className="p-4 gap-4">
                                            {/* Songs */}
                                            <View className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-indigo-200 font-bold text-xs">Songs</Text>
                                                    <Ionicons name="mic-outline" size={14} color="#a5b4fc" />
                                                </View>
                                                <Text className="text-[9px] text-indigo-300/60 leading-tight">Lyrics, Audio, Files</Text>
                                            </View>

                                            {/* People */}
                                            <View className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-indigo-200 font-bold text-xs">People</Text>
                                                    <Ionicons name="people-outline" size={14} color="#a5b4fc" />
                                                </View>
                                                <Text className="text-[9px] text-indigo-300/60 leading-tight">Musicians, Contacts</Text>
                                            </View>

                                            {/* Venues */}
                                            <View className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-indigo-200 font-bold text-xs">Venues</Text>
                                                    <Ionicons name="location-outline" size={14} color="#a5b4fc" />
                                                </View>
                                                <Text className="text-[9px] text-indigo-300/60 leading-tight">Locations, Tech Specs</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>

                                {/* COLUMN 2: THE SCHEDULE (Time) */}
                                <View className="w-[45%] gap-6">
                                    <View className="bg-fuchsia-900/30 border border-fuchsia-500/30 rounded-2xl overflow-hidden min-h-[400px]">
                                        <View className="bg-fuchsia-600 p-3 items-center">
                                            <Ionicons name="calendar" size={20} color="white" />
                                            <Text className="text-white font-black text-sm mt-1">THE SCHEDULE</Text>
                                        </View>

                                        <View className="p-4 gap-3">
                                            {/* GIGS */}
                                            <TouchableOpacity onPress={() => router.push('/events')} className="p-3 bg-pink-500/20 rounded-xl border border-pink-500/40 shadow-sm">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-pink-100 font-black text-sm">PERFORMANCES</Text>
                                                    <Ionicons name="flash" size={14} color="#f472b6" />
                                                </View>
                                                <Text className="text-[9px] text-pink-200/80 leading-tight mb-2">The Main Event.</Text>
                                                <View className="flex-row gap-1 flex-wrap">
                                                    <View className="bg-pink-500/20 px-1.5 py-0.5 rounded"><Text className="text-[8px] text-pink-300 font-bold">+Roster</Text></View>
                                                    <View className="bg-pink-500/20 px-1.5 py-0.5 rounded"><Text className="text-[8px] text-pink-300 font-bold">+Setlist</Text></View>
                                                </View>
                                            </TouchableOpacity>

                                            {/* REHEARSALS */}
                                            <View className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-fuchsia-100 font-bold text-xs">Rehearsals</Text>
                                                    <Ionicons name="musical-notes" size={14} color="#e879f9" />
                                                </View>
                                                <Text className="text-[9px] text-fuchsia-300/60 leading-tight">Prep for the show.</Text>
                                            </View>

                                            {/* LESSONS */}
                                            <View className="p-3 bg-fuchsia-500/10 rounded-xl border border-fuchsia-500/20">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-fuchsia-100 font-bold text-xs">Lessons</Text>
                                                    <Ionicons name="school" size={14} color="#e879f9" />
                                                </View>
                                                <Text className="text-[9px] text-fuchsia-300/60 leading-tight">Teaching & Learning.</Text>
                                            </View>

                                            <View className="h-[1px] bg-white/10 my-1" />

                                            {/* PRACTICE ROUTINES */}
                                            <TouchableOpacity onPress={() => router.push('/routines')} className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                                                <View className="flex-row items-center justify-between mb-1">
                                                    <Text className="text-purple-100 font-bold text-xs">Practice Routines</Text>
                                                    <Ionicons name="stopwatch" size={14} color="#c084fc" />
                                                </View>
                                                <Text className="text-[9px] text-purple-300/60 leading-tight">Recurring daily/weekly drills.</Text>
                                            </TouchableOpacity>

                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* PRICING TIERS SECTION */}
                            <View className="mt-12">
                                <Text className="text-center text-slate-400 text-xs mb-6 uppercase tracking-widest font-bold">
                                    Access Levels
                                </Text>

                                <View className="flex-row gap-4 justify-center">
                                    {/* FREE TIER */}
                                    <View className="w-[45%] bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                                        <View className="bg-slate-700 p-3 items-center border-b border-slate-600">
                                            <Text className="text-slate-300 font-black text-sm">FREE</Text>
                                        </View>
                                        <View className="p-4 gap-2">
                                            <View className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#94a3b8" /><Text className="text-slate-400 text-[10px] ml-2">Unlimited Gigs</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="alert-circle-outline" size={12} color="#f59e0b" /><Text className="text-slate-400 text-[10px] ml-2">50 Songs Max</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="alert-circle-outline" size={12} color="#f59e0b" /><Text className="text-slate-400 text-[10px] ml-2">5 Setlists Max</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="alert-circle-outline" size={12} color="#f59e0b" /><Text className="text-slate-400 text-[10px] ml-2">3 Routines Max</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="cloud-offline-outline" size={12} color="#94a3b8" /><Text className="text-slate-400 text-[10px] ml-2">Manual Backup</Text></View>
                                        </View>
                                    </View>

                                    {/* PRO TIER */}
                                    <TouchableOpacity
                                        onPress={() => router.push('/modal/upgrade?feature=chaos')}
                                        className="w-[45%] bg-indigo-900/20 border border-indigo-500/50 rounded-2xl overflow-hidden shadow-lg shadow-indigo-500/10"
                                    >
                                        <View className="bg-indigo-600 p-3 items-center border-b border-indigo-500/50">
                                            <Text className="text-white font-black text-sm">PRO</Text>
                                        </View>
                                        <View className="p-4 gap-2">
                                            <View className="flex-row items-center"><Ionicons name="infinite" size={12} color="#818cf8" /><Text className="text-indigo-200 text-[10px] ml-2 font-bold">Unlimited Songs</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="infinite" size={12} color="#818cf8" /><Text className="text-indigo-200 text-[10px] ml-2 font-bold">Unlimited Setlists</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="infinite" size={12} color="#818cf8" /><Text className="text-indigo-200 text-[10px] ml-2 font-bold">Unlimited Routines</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="sync" size={12} color="#818cf8" /><Text className="text-indigo-200 text-[10px] ml-2 font-bold">Active Cloud Sync</Text></View>
                                            <View className="flex-row items-center"><Ionicons name="folder-open-outline" size={12} color="#818cf8" /><Text className="text-indigo-200 text-[10px] ml-2 font-bold">5GB Storage</Text></View>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </View>
                    ) : (
                        /* WORKFLOW VIEW (Gig Flow) */
                        /* WORKFLOW VIEW (Gig Flow) */
                        <View className="pb-20">
                            <Text className="text-center text-slate-400 text-xs mb-8 uppercase tracking-widest font-bold">
                                The Lifecycle of a Gig
                            </Text>

                            <View className="relative pl-6 border-l-2 border-indigo-500/20 ml-6 space-y-8">
                                {/* Step 1: Booking */}
                                <View className="relative">
                                    <View className="absolute -left-[31px] top-0 bg-indigo-900 border-2 border-indigo-500 w-4 h-4 rounded-full" />
                                    <View className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-2xl">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-indigo-200 font-bold">1. Booking & Logistics</Text>
                                            <Ionicons name="calendar" size={16} color="#818cf8" />
                                        </View>
                                        <Text className="text-indigo-300/60 text-xs mb-3">
                                            Create event, set date/time/venue. Define pay rates.
                                        </Text>
                                        <TouchableOpacity onPress={() => router.push('/events')} className="bg-indigo-600/20 py-2 rounded-lg items-center border border-indigo-500/30">
                                            <Text className="text-indigo-300 text-[10px] font-bold uppercase">Go to Calendar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Step 2: Roster */}
                                <View className="relative">
                                    <View className="absolute -left-[31px] top-0 bg-indigo-900 border-2 border-indigo-500 w-4 h-4 rounded-full" />
                                    <View className="bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-2xl">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-indigo-200 font-bold">2. Staffing</Text>
                                            <Ionicons name="people" size={16} color="#818cf8" />
                                        </View>
                                        <Text className="text-indigo-300/60 text-xs leading-relaxed">
                                            Assign roles (Bass, Drums). Invite musicians via SMS. Track confirmations.
                                        </Text>
                                    </View>
                                </View>

                                {/* Step 3: Setlist */}
                                <View className="relative">
                                    <View className="absolute -left-[31px] top-0 bg-fuchsia-900 border-2 border-fuchsia-500 w-4 h-4 rounded-full" />
                                    <View className="bg-fuchsia-900/20 border border-fuchsia-500/30 p-4 rounded-2xl">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-fuchsia-200 font-bold">3. Setlist Design</Text>
                                            <Ionicons name="list" size={16} color="#e879f9" />
                                        </View>
                                        <Text className="text-fuchsia-300/60 text-xs mb-3">
                                            Drag & drop songs from Library. Add breaks. Calculate duration.
                                        </Text>
                                        <TouchableOpacity onPress={() => router.push('/setlists')} className="bg-fuchsia-600/20 py-2 rounded-lg items-center border border-fuchsia-500/30">
                                            <Text className="text-fuchsia-300 text-[10px] font-bold uppercase">Go to Builder</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Step 4: Performance */}
                                <View className="relative">
                                    <View className="absolute -left-[31px] top-0 bg-pink-900 border-2 border-pink-500 w-4 h-4 rounded-full" />
                                    <View className="bg-pink-900/20 border border-pink-500/30 p-4 rounded-2xl">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-pink-200 font-bold">4. Showtime</Text>
                                            <Ionicons name="play-circle" size={16} color="#f472b6" />
                                        </View>
                                        <Text className="text-pink-300/60 text-xs">
                                            "Live Mode" for stage. Large text. Metronome. Quick transitions.
                                        </Text>
                                    </View>
                                </View>

                                {/* Step 5: Finance */}
                                <View className="relative">
                                    <View className="absolute -left-[31px] top-0 bg-emerald-900 border-2 border-emerald-500 w-4 h-4 rounded-full" />
                                    <View className="bg-emerald-900/20 border border-emerald-500/30 p-4 rounded-2xl">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <Text className="text-emerald-200 font-bold">5. Settlement</Text>
                                            <Ionicons name="cash" size={16} color="#34d399" />
                                        </View>
                                        <Text className="text-emerald-300/60 text-xs mb-3">
                                            Mark as paid. Calculate splits. Track expenses.
                                        </Text>
                                        <TouchableOpacity onPress={() => router.push('/finance')} className="bg-emerald-600/20 py-2 rounded-lg items-center border border-emerald-500/30">
                                            <Text className="text-emerald-300 text-[10px] font-bold uppercase">Go to Finance</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer */}
                <View className="items-center mt-12 mb-8 opacity-40">
                    <Ionicons name="git-network-outline" size={32} color="white" />
                </View>

            </ScrollView>
        </View>
    );
}
