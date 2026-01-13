import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Image, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import FeatureGrid from '@/components/home/FeatureGrid';
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';


export default function HomeScreen() {
    const { blocks, routines, events, profile, syncStatus, fullSync, recentModuleIds, trackModuleUsage, sessionLogs, progress, settings } = useContentStore();

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

    // Rotating Suggestions for Empty State
    const [suggestionIndex, setSuggestionIndex] = useState(0);
    const SUGGESTIONS = [
        "Schedule is empty.",
        "Add a Gig?",
        "Plan a Rehearsal?",
        "Book a Lesson?"
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setSuggestionIndex((prev) => (prev + 1) % SUGGESTIONS.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background, height: Platform.OS === 'web' ? '100vh' as any : undefined }}
            contentContainerStyle={{ alignItems: 'center' }} // Center content for web
        >
            <View className="w-full max-w-3xl p-4 md:p-6 mb-8" style={{ marginTop: Math.max(insets.top, 20) }}>
                {/* Header Profile Section */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center flex-1 mr-4">
                        <TouchableOpacity
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            className="mr-3 p-2 -ml-2 rounded-full"
                        >
                            <Ionicons name="menu" size={28} color={theme.text} />
                        </TouchableOpacity>

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
                        {/* Sync Status Button */}
                        <TouchableOpacity
                            onPress={() => {
                                fullSync();
                            }}
                            className={`flex-row items-center px-4 py-2 rounded-full border min-w-[90px] justify-center shadow-sm ${syncStatus === 'synced' ? 'bg-emerald-500/10 border-emerald-500/20' :
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

                {/* Greeting */}
                <Text className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-white mb-6" numberOfLines={2} adjustsFontSizeToFit>
                    {profile?.displayName ? `Hello, ${profile.displayName}!` : 'OpusMode'}
                </Text>

                {/* Offline / Conflict Warning Banner */}
                {syncStatus === 'offline' && (
                    <View className="mb-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex-row items-start">
                        <Ionicons name="cloud-offline-outline" size={20} color="#fb923c" style={{ marginRight: 12, marginTop: 2 }} />
                        <View className="flex-1">
                            <Text className="font-bold text-orange-200 mb-1">Working Offline (Puddle-Proof Mode)</Text>
                            <Text className="text-xs text-orange-200/60 leading-relaxed">
                                Your route is set! Changes are saved safely to this device. We'll automatically upload them to the cloud when you're back online.
                            </Text>
                        </View>
                    </View>
                )}

                {/* SECTION 1: TOP OF THE FOLD (Daily Briefing) */}
                <View className="flex-row gap-4 mb-8 mt-4">
                    {/* Left: Logo Card */}
                    <TouchableOpacity
                        onPress={() => setIsLogoExpanded(true)}
                        activeOpacity={0.8}
                        className="flex-1 items-center justify-center h-[160px] md:h-[180px] rounded-[32px] border shadow-sm p-4 overflow-hidden"
                        style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    >
                        <Animated.Image
                            source={require('../../assets/images/opusmode_om_logo_v9.png')}
                            style={{
                                width: '100%',
                                height: '100%',
                                opacity: breathingOpacity,
                            }}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Right: Events Card (Gamified) */}
                    <TouchableOpacity
                        onPress={() => router.push('/events')}
                        className="flex-1 p-5 rounded-[32px] border shadow-sm relative overflow-hidden justify-between h-[160px] md:h-[180px]"
                        style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    >
                        <View className="absolute right-[-10] bottom-[-10] opacity-10 transform rotate-[-15deg]">
                            <Ionicons name="calendar" size={80} color={theme.text} />
                        </View>

                        {todaysEvents.length > 0 ? (
                            // Normal "Active" State
                            <>
                                <View>
                                    <Text className="text-4xl font-black text-white shadow-sm">{todaysEvents.length}</Text>
                                    <Text className="text-xs font-black uppercase tracking-widest text-slate-400">Events Today</Text>
                                </View>
                                <View>
                                    <Text className="text-sm font-bold text-slate-300">
                                        {upcomingEventsCount} Scheduled
                                    </Text>
                                    <Text className="text-[10px] text-slate-500">Next 7 Days</Text>
                                </View>
                            </>
                        ) : (
                            // "Gamified" Empty State
                            <View className="flex-1 justify-center items-center">
                                <Ionicons name="calendar-outline" size={32} color={theme.mutedText} style={{ marginBottom: 12, opacity: 0.5 }} />
                                <Text className="text-slate-400 text-center font-bold text-lg leading-6 opacity-60">
                                    {SUGGESTIONS[suggestionIndex]}
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                {/* DIVIDER */}
                <View className="h-[1px] w-full mb-8 opacity-10 bg-white" />

                <FeatureGrid />

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

                {/* Footer Section */}
                <View className="mt-12 mb-16 items-center opacity-60">
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
                        className="absolute right-6 top-12 z-50 p-3 bg-white/20 rounded-full backdrop-blur-md"
                        onPress={() => setIsLogoExpanded(false)}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Ionicons name="close" size={30} color="white" />
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
                    <View className="w-full gap-4 max-w-sm">
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
