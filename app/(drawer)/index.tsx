import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRouter } from 'expo-router';

export default function HomeScreen() {
    const { blocks, routines, events, profile, syncStatus, fullSync, recentModuleIds, trackModuleUsage, sessionLogs, progress } = useContentStore();

    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
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

    // Calculate Date Ranges
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);
    endOfWeek.setHours(23, 59, 59, 999);

    // Filter Logic
    const countEventsInRange = (start: Date, end: Date) => {
        return (events || []).filter(e => {
            if (e.schedule?.type === 'recurring') {
                return true;
            }
            // Force local time parsing to match 'start' which is local
            const eDate = new Date(e.date + 'T00:00:00');
            return eDate >= start && eDate <= end;
        }).length;
    };

    const upcomingEventsCount = countEventsInRange(startOfWeek, endOfWeek);


    const mainModules = [
        {
            title: 'Studio',
            subtitle: 'Creative Hub',
            icon: 'layers-outline',
            path: '/studio',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/20',
            description: 'Levels 1 & 2'
        },
        {
            title: 'Performance Management',
            subtitle: 'Contracts & Sets',
            icon: 'musical-notes-outline',
            path: '/gigs',
            color: 'text-rose-400',
            bg: 'bg-rose-500/20',
            description: 'Bookings & Logistics'
        },
        {
            title: 'Schedule',
            subtitle: 'Calendar',
            icon: 'calendar-outline',
            path: '/events',
            color: 'text-blue-400',
            bg: 'bg-blue-500/20',
            description: 'Gigs, Rehearsals'
        },
        {
            title: 'Contacts',
            subtitle: 'People & Roster',
            icon: 'people-outline',
            path: '/people',
            color: 'text-purple-400',
            bg: 'bg-purple-500/20',
            description: 'Bandmates, Venues'
        },

        {
            title: 'Scout',
            subtitle: 'AI Intel',
            icon: 'telescope-outline',
            path: '/scout',
            color: 'text-orange-400',
            bg: 'bg-orange-500/20',
            description: 'Lead Gen & Prompts'
        },
        {
            title: 'System',
            subtitle: 'Config & Help',
            icon: 'settings-outline',
            path: '/settings',
            color: 'text-slate-400',
            bg: 'bg-slate-500/20',
            description: 'Preferences, FAQ'
        },
    ];

    const [isLogoExpanded, setIsLogoExpanded] = useState(false);

    // Breathing Animation
    const breathingOpacity = useRef(new Animated.Value(0.25)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(breathingOpacity, {
                    toValue: 1,
                    duration: 5000,
                    easing: Easing.inOut(Easing.sin), // Pure sine wave for maximum smoothness
                    useNativeDriver: true,
                }),
                Animated.timing(breathingOpacity, {
                    toValue: 0.25,
                    duration: 5000,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    return (
        <ScrollView className="flex-1 p-6" style={{ backgroundColor: theme.background, height: Platform.OS === 'web' ? '100vh' as any : undefined }}>
            <View className="mb-8" style={{ marginTop: Math.max(insets.top, 20) }}>
                {/* Header Profile Section */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center flex-1 mr-4">
                        <View className="flex-row items-center opacity-80 mr-4">
                            <Image
                                source={require('../../assets/images/opusmode_om_logo_v9.png')}
                                style={{ width: 24, height: 24, marginRight: 8 }}
                                resizeMode="contain"
                            />
                            <Text className="text-[10px] font-black uppercase tracking-[3px] text-indigo-200">OPUSMODE</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-2">
                        {/* Help Button */}
                        <TouchableOpacity
                            onPress={() => router.push('/modal/help')}
                            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center"
                        >
                            <Ionicons name="help" size={20} color={theme.text} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                fullSync();
                            }}
                            className={`flex-row items-center px-4 py-2 rounded-full border min-w-[100px] justify-center shadow-sm ${syncStatus === 'synced' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                syncStatus === 'syncing' ? 'bg-blue-500/10 border-blue-500/20' :
                                    'bg-red-500/10 border-red-500/20' // Offline / Error
                                }`}
                        >
                            <View className={`w-2 h-2 rounded-full mr-2 ${syncStatus === 'synced' ? 'bg-emerald-400' :
                                syncStatus === 'syncing' ? 'bg-blue-400' :
                                    'bg-slate-400'
                                }`} />
                            <Text className={`text-[10px] font-black uppercase tracking-normal ${syncStatus === 'synced' ? 'text-emerald-100' :
                                syncStatus === 'syncing' ? 'text-blue-100' :
                                    'text-slate-400'
                                }`}>
                                {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Greeting - moved below aligned header */}
                <Text className="text-4xl font-black tracking-tighter leading-tight text-white mb-6">
                    {profile?.displayName ? `Hello, ${profile.displayName}!` : 'OpusMode'}
                </Text>

                {/* Offline / Conflict Warning Banner */}
                {syncStatus === 'offline' && (
                    <View className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex-row items-start">
                        <Ionicons name="warning-outline" size={20} color="#fb923c" style={{ marginRight: 12, marginTop: 2 }} />
                        <View className="flex-1">
                            <Text className="font-bold text-orange-200 mb-1">Working Offline</Text>
                            <Text className="text-xs text-orange-200/60 leading-relaxed">
                                Changes are saved locally. Please ensure you tap <Text className="font-bold text-orange-200">Sync</Text> when back online and before using another device.
                            </Text>
                        </View>
                    </View>
                )}

                {/* SECTION 1: TOP OF THE FOLD (Daily Briefing) */}
                <View className="flex-row justify-between mb-8">
                    {/* Left: Breathing Logo Hero */}
                    <TouchableOpacity
                        onPress={() => setIsLogoExpanded(true)}
                        activeOpacity={0.8}
                        className="w-[48%] items-center justify-center h-[180px]"
                    >
                        {/* Ambient Glow Background - Fills the void */}
                        <View className="absolute w-[300px] h-[300px] bg-indigo-600/20 rounded-full blur-[100px]" />

                        <Animated.Image
                            source={require('../../assets/images/opusmode_om_logo_v9.png')}
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: breathingOpacity,
                                transform: [{ scale: 1.4 }]
                            }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Right: Events Card */}
                    <TouchableOpacity
                        onPress={() => router.push('/events')}
                        className="w-[48%] p-5 rounded-[32px] border shadow-sm relative overflow-hidden justify-between h-[180px]"
                        style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    >
                        <View className="absolute right-[-10] bottom-[-10] opacity-10 transform rotate-[-15deg]">
                            <Ionicons name="calendar" size={80} color={theme.text} />
                        </View>

                        <View>
                            <Text className="text-4xl font-black text-white shadow-sm">{todaysEvents.length}</Text>
                            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">Events Today</Text>
                        </View>

                        <View>
                            <Text className="text-xs font-bold text-slate-300">
                                {upcomingEventsCount} Scheduled
                            </Text>
                            <Text className="text-[10px] text-slate-500">Next 7 Days</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* DIVIDER */}
                <View className="h-[1px] w-full mb-8 opacity-10 bg-white" />


                {/* SECTION 2: STUDIO & TOOLS (Switchboard Grid) */}
                <Text className="text-2xl font-black tracking-tight mb-6 text-white">
                    Studio & Tools
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    {mainModules.map((item, index) => (
                        <TouchableOpacity
                            key={item.title}
                            onPress={() => router.push(item.path as any)}
                            activeOpacity={0.7}
                            className="w-[48%] mb-4 p-4 rounded-[32px] border shadow-sm relative overflow-hidden h-[140px] justify-between"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            {/* Watermark/Graphic */}
                            <View className="absolute -right-4 -bottom-4 opacity-[0.07] transform rotate-[-10deg]">
                                <Ionicons name={item.icon as any} size={90} color="white" />
                            </View>

                            <View>
                                {/* Colored Icon Box */}
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center mb-3 ${item.bg}`}>
                                    <Ionicons name={item.icon as any} size={22} color="white" />
                                </View>
                                <Text className="text-sm font-black tracking-tight leading-4 text-white z-10 pr-2">
                                    {item.title}
                                </Text>
                            </View>

                            {/* Small decorative indicator */}
                            <View className="flex-row items-center opacity-40">
                                <Text className="text-[9px] uppercase font-bold text-white mr-1">Open</Text>
                                <Ionicons name="arrow-forward" size={10} color="white" />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FREE TIER SYNC WARNING - MOVED HERE */}
                {profile && !profile.isPremium && syncStatus === 'synced' && (
                    <View className="mt-4 mb-2 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex-row items-start">
                        <View className="mr-3 mt-1 bg-blue-500/20 p-1.5 rounded-full">
                            <Ionicons name="cloud-offline-outline" size={16} color="#60a5fa" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-blue-100 text-sm mb-1">Backup Active (Free Tier)</Text>
                            <Text className="text-blue-200/50 text-xs leading-relaxed">
                                Your data is safely backed up ("Puddle Proof"), but will not sync to your other devices until you upgrade.
                            </Text>
                        </View>
                    </View>
                )}

                {/* Footer Padding */}
                {/* Footer Section */}
                <View className="mt-8 mb-16 items-center opacity-60">
                    <Ionicons name="infinite" size={32} color={theme.mutedText} style={{ marginBottom: 16, opacity: 0.5 }} />
                    <Text className="text-xs font-bold text-slate-500 mb-6">OpusMode v1.2</Text>

                    <View className="flex-row gap-8">
                        <TouchableOpacity onPress={() => router.push('/modal/help')}>
                            <Text className="text-xs font-semibold text-slate-400">About</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/modal/help')}>
                            <Text className="text-xs font-semibold text-slate-400">Privacy Policy</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => router.push('/modal/help')}>
                            <Text className="text-xs font-semibold text-slate-400">Contact Support</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-[10px] text-slate-600 mt-8 text-center max-w-[200px] leading-relaxed">
                        Designed for musicians, by musicians.
                        {'\n'}© 2024 OpusMode Inc.
                    </Text>
                </View>
            </View>

            {/* FULL SCREEN LOGO MODAL */}
            <Modal
                visible={isLogoExpanded}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsLogoExpanded(false)}
            >
                <View className="flex-1 bg-black/95 items-center justify-center relative p-8">
                    <TouchableOpacity
                        className="absolute right-6 top-16 z-50 p-2 bg-white/10 rounded-full"
                        onPress={() => setIsLogoExpanded(false)}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    <Image
                        source={require('../../assets/images/opusmode_om_logo_v9.png')}
                        style={{ width: '100%', height: '40%', marginBottom: 30 }}
                        resizeMode="contain"
                    />

                    <View className="items-center mb-12">
                        <Text className="text-white text-3xl font-black uppercase tracking-[8px] mb-3 text-center ml-2">
                            OpusMode
                        </Text>
                        <Text className="text-indigo-200/60 text-lg font-medium italic tracking-widest text-center">
                            "Where Focus Meets Flow"
                        </Text>
                        <Text className="text-white/30 text-[10px] font-bold uppercase tracking-widest mt-4">
                            v1.2.3 • Designed for Musicians
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View className="w-full gap-4">
                        <TouchableOpacity
                            onPress={() => {
                                setIsLogoExpanded(false);
                                router.push('/modal/pricing');
                            }}
                            className="w-full bg-indigo-600 py-4 rounded-xl items-center border border-indigo-400/30"
                        >
                            <Text className="text-white font-bold tracking-widest uppercase text-sm">
                                View Plans & Pricing
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setIsLogoExpanded(false)}
                            className="w-full py-4 items-center"
                        >
                            <Text className="text-white/40 font-bold uppercase text-xs tracking-widest">
                                Close
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}
