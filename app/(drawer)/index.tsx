import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';

/**
 * Home2 - Two Hubs Navigation Design
 * 
 * Simplified Home screen with two primary paths:
 * - The Stage (gig management)
 * - The Studio (practice/routines)
 */
export default function Home2Screen() {
    const { routines, events, profile, syncStatus, fullSync } = useContentStore();

    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    // Calculate stats for each hub
    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Stage stats
    const gigsThisMonth = (events || []).filter(e => {
        if (e.type !== 'performance' && e.type !== 'gig') return false;
        const eventDate = new Date(e.date);
        return eventDate.getMonth() === thisMonth && eventDate.getFullYear() === thisYear;
    }).length;

    const nextGig = (events || [])
        .filter(e => (e.type === 'performance' || e.type === 'gig') && new Date(e.date) >= today)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    // Studio stats
    const hasRoutines = (routines || []).length > 0;
    const routineCount = (routines || []).length;

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background, height: Platform.OS === 'web' ? '100vh' as any : undefined }}
        >
            <View className="w-full max-w-3xl p-4 md:p-6 mb-8 mx-auto" style={{ marginTop: Math.max(insets.top, 20) }}>
                {/* Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center flex-1 mr-4">
                        <TouchableOpacity
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            className="mr-3 p-2 -ml-2 rounded-full"
                        >
                            <Ionicons name="menu" size={28} color={theme.text} />
                        </TouchableOpacity>

                        <View className="flex-row items-center opacity-80">
                            <View className="w-6 h-6 rounded-lg bg-indigo-600 items-center justify-center mr-2">
                                <Ionicons name="musical-notes" size={14} color="white" />
                            </View>
                            <Text className="text-[10px] font-black uppercase tracking-[3px] text-indigo-200">OPUSMODE</Text>
                        </View>
                    </View>

                    {/* Sync Status Button */}
                    <TouchableOpacity
                        onPress={() => fullSync()}
                        className={`flex-row items-center px-4 py-2 rounded-full border min-w-[90px] justify-center shadow-sm ${syncStatus === 'synced' ? 'bg-emerald-500/10 border-emerald-500/20' :
                            syncStatus === 'syncing' ? 'bg-blue-500/10 border-blue-500/20' :
                                'bg-red-500/10 border-red-500/20'
                            }`}
                    >
                        <View className={`w-2 h-2 rounded-full mr-2 ${syncStatus === 'synced' ? 'bg-emerald-400' :
                            syncStatus === 'syncing' ? 'bg-blue-400' : 'bg-slate-400'
                            }`} />
                        <Text className={`text-[10px] font-black uppercase ${syncStatus === 'synced' ? 'text-emerald-100' :
                            syncStatus === 'syncing' ? 'text-blue-100' : 'text-slate-400'
                            }`}>
                            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Greeting */}
                <Text className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-white mb-8">
                    {profile?.displayName ? `Hello, ${profile.displayName}!` : 'OpusMode'}
                </Text>

                {/* TWO HUBS */}
                <View className="flex-row gap-4 mb-8">
                    {/* THE STAGE */}
                    <TouchableOpacity
                        onPress={() => router.push('/stage')}
                        activeOpacity={0.8}
                        style={{ flex: 1, height: 220, borderRadius: 24, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={['#7c3aed', '#c026d3']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}
                        >
                            <View>
                                <View className="w-11 h-11 bg-white/20 rounded-xl items-center justify-center mb-3">
                                    <Ionicons name="mic" size={22} color="white" />
                                </View>
                                <Text className="text-xl font-black text-white">The Stage</Text>
                                <Text className="text-white/70 text-xs mt-1">Manage performances</Text>
                            </View>

                            <View className="bg-white/15 px-3 py-1.5 rounded-lg self-start">
                                <Text className="text-white text-xs font-bold">
                                    {gigsThisMonth > 0 ? `${gigsThisMonth} gig${gigsThisMonth > 1 ? 's' : ''} this month` : 'Create a gig'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* THE STUDIO */}
                    <TouchableOpacity
                        onPress={() => router.push('/studio')}
                        activeOpacity={0.8}
                        style={{ flex: 1, height: 220, borderRadius: 24, overflow: 'hidden' }}
                    >
                        <LinearGradient
                            colors={['#0ea5e9', '#06b6d4']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={{ flex: 1, padding: 20, justifyContent: 'space-between' }}
                        >
                            <View>
                                <View className="w-11 h-11 bg-white/20 rounded-xl items-center justify-center mb-3">
                                    <Ionicons name="layers" size={22} color="white" />
                                </View>
                                <Text className="text-xl font-black text-white">The Studio</Text>
                                <Text className="text-white/70 text-xs mt-1">Organize practice</Text>
                            </View>

                            <View className="bg-white/15 px-3 py-1.5 rounded-lg self-start">
                                <Text className="text-white text-xs font-bold">
                                    {hasRoutines ? `${routineCount} routine${routineCount > 1 ? 's' : ''} ready` : 'Build a routine'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>

                {/* QUICK ACCESS HINT */}
                <View className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 mb-8">
                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Everything you need</Text>
                    <View className="flex-row justify-around">
                        <View className="items-center">
                            <Ionicons name="list" size={20} color="#94a3b8" />
                            <Text className="text-slate-500 text-[10px] mt-1">Setlists</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="musical-notes" size={20} color="#94a3b8" />
                            <Text className="text-slate-500 text-[10px] mt-1">Songs</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="people" size={20} color="#94a3b8" />
                            <Text className="text-slate-500 text-[10px] mt-1">Band</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="cash" size={20} color="#94a3b8" />
                            <Text className="text-slate-500 text-[10px] mt-1">Finance</Text>
                        </View>
                        <View className="items-center">
                            <Ionicons name="compass" size={20} color="#94a3b8" />
                            <Text className="text-slate-500 text-[10px] mt-1">Navigator</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View className="mt-8 mb-16 items-center opacity-50">
                    <Text className="text-xs text-slate-500">OpusMode</Text>
                </View>
            </View>
        </ScrollView>
    );
}
