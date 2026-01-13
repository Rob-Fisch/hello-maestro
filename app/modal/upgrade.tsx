import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, Easing, Image, LayoutChangeEvent, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 'chaos', // Keeping IDs for compatibility with params
        title: 'UNLIMITED STUDIO',
        subtitle: 'SONGS & STORAGE',
        image: require('../../assets/images/upgrade_studio_v3.png'), // Keep generic or update if possible
        icon: 'musical-notes',
        color: '#60a5fa', // Blue
        bg: 'bg-slate-950',
        blob: 'bg-blue-900'
    },
    {
        id: 'order',
        title: 'MASTERY TOOLS',
        subtitle: 'ROUTINES & HISTORY',
        image: require('../../assets/images/upgrade_mastery_v2.png'),
        icon: 'grid',
        color: '#2dd4bf', // Teal
        bg: 'bg-teal-950',
        blob: 'bg-teal-900'
    },
    {
        id: 'glory',
        title: 'GIG MANAGEMENT',
        subtitle: 'FINANCE • CRM • LOGISTICS',
        image: require('../../assets/images/upgrade_gigs_v2.png'),
        icon: 'briefcase',
        color: '#f59e0b', // Amber
        bg: 'bg-amber-950',
        blob: 'bg-amber-900'
    },
    {
        id: 'coach',
        title: 'AI COACH',
        subtitle: 'CAREER STRATEGY',
        image: require('../../assets/images/upgrade_coach_v5.png'),
        icon: 'telescope',
        color: '#8b5cf6', // Violet
        bg: 'bg-violet-950',
        blob: 'bg-violet-900'
    }
];

export default function UpgradeModal() {
    console.log("Upgrade Modal Re-Rendered - Force Update");
    const { profile, setProfile } = useContentStore();
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const params = useLocalSearchParams();

    // Feature Highlight Logic
    const requestedFeature = params.feature as string;
    const scrollRef = useRef<ScrollView>(null);
    const [layouts, setLayouts] = useState<Record<string, number>>({});

    const handleLayout = (featureId: string, event: LayoutChangeEvent) => {
        const y = event?.nativeEvent?.layout?.y;
        if (typeof y === 'number') {
            setLayouts(prev => ({ ...prev, [featureId]: y }));
        }
    };

    // Auto-scroll logic (unchanged)
    useEffect(() => {
        if (!requestedFeature) return;
        const attemptScroll = () => {
            const containerY = layouts['_container'];
            const featureY = layouts[requestedFeature];
            if (containerY !== undefined && featureY !== undefined && scrollRef.current) {
                scrollRef.current.scrollTo({ y: containerY + featureY, animated: true });
            }
        };
        setTimeout(attemptScroll, 500); // Simple delay
    }, [layouts, requestedFeature]);

    // Disclaimer
    const handlePurchase = () => {
        Alert.alert(
            "Upgrade to Pro",
            "This is a demo. Tapping 'Confirm' will simulate a successful purchase.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Confirm ($19.99/yr)",
                    onPress: () => {
                        setProfile({ ...profile!, isPremium: true });
                        Alert.alert("Welcome to Pro!", "All features are now unlocked.");
                        router.back();
                    }
                }
            ]
        );
    };

    const handleRestore = () => {
        Alert.alert(
            "Restore Purchases",
            "Checking for active subscriptions...",
            [{ text: "OK", onPress: () => Alert.alert("Restore Complete", "No active subscriptions found in this demo.") }]
        );
    };

    // SLIDESHOW LOGIC
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const slideOpacity = useRef(new Animated.Value(1)).current;

    // Scale animation for the blobs
    const blobScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Continuous organic movement for background blobs
        Animated.loop(
            Animated.sequence([
                Animated.timing(blobScale, { toValue: 1.2, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(blobScale, { toValue: 0.8, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();
    }, []);

    return (
        <View className="flex-1 bg-black">
            <ScrollView
                ref={scrollRef}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 0 }}
            >
                {/* STATIC HERO SECTION */}
                <View className="relative h-[550px] w-full items-center justify-center overflow-hidden bg-zinc-950">

                    {/* Background Texture/Blobs */}
                    <Animated.View
                        style={{ transform: [{ scale: blobScale }] }}
                        className="absolute top-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-20 bg-indigo-900"
                    />
                    <Animated.View
                        style={{ transform: [{ scale: Animated.divide(2, blobScale) }] }}
                        className="absolute bottom-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full blur-[60px] opacity-20 bg-teal-900"
                    />

                    {/* Close Button */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ zIndex: 9999, elevation: 5 }}
                        className="absolute top-12 right-6 w-12 h-12 rounded-full bg-white/10 border border-white/20 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    {/* Static Title Content */}
                    <View className="items-center px-8 z-10">
                        {/* Main Logo/Icon */}
                        <View className="w-60 h-60 mb-6 items-center justify-center rounded-3xl bg-black border border-white/10 shadow-2xl shadow-indigo-500/30 overflow-hidden">
                            <Image
                                source={require('../../assets/images/opusmode_om_logo_v9.png')}
                                style={{ width: '100%', height: '100%' }}
                                resizeMode="cover"
                            />
                        </View>

                        <Text className="text-white font-black text-5xl text-center mb-2 tracking-tighter shadow-lg">
                            OPUSMODE
                        </Text>
                        <Text className="text-indigo-400 font-bold text-lg tracking-[0.5em] text-center mb-8 uppercase">
                            PRO
                        </Text>

                        <View className="px-4">
                            <Text className="text-zinc-400 font-medium italic text-lg text-center leading-relaxed">
                                "The tool I wish I had when I started gigging."
                            </Text>
                            <Text className="text-zinc-600 font-bold text-xs text-right mt-2 uppercase tracking-widest">
                                — Rob Fisch, Founder and Musician, Opusmode
                            </Text>
                        </View>
                    </View>
                </View>

                {/* BOLD OFFER SECTION */}
                <View className="-mt-10 px-4 mb-2">
                    <View className="bg-zinc-900 p-8 rounded-[40px] shadow-2xl border border-zinc-800">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-white font-bold text-sm uppercase tracking-widest text-zinc-500 mb-1">Pro Membership</Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-black font-black text-lg mr-2">Upgrade to Pro</Text>
                                </View>
                            </View>
                            {/* <View className="bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
                                <Text className="text-green-400 font-black text-xs uppercase">-50% OFF</Text>
                            </View> */}
                        </View>

                        <TouchableOpacity onPress={handlePurchase} activeOpacity={0.9} className="w-full mb-4">
                            <View className="w-full py-5 rounded-3xl items-center justify-center shadow-lg shadow-purple-500/20 bg-white">
                                <Text className="text-black font-black text-xl tracking-tight">START FREE TRIAL</Text>
                            </View>
                        </TouchableOpacity>

                        <Text className="text-center text-zinc-500 text-xs font-medium">
                            7 days free. Monthly & Annual plans available.
                        </Text>
                    </View>
                </View>

                {/* FEATURE BREAKDOWN (Vertical Detailed List) */}
                <View
                    className="px-6 py-8"
                    onLayout={(event) => {
                        const y = event?.nativeEvent?.layout?.y;
                        if (typeof y === 'number') {
                            setLayouts(prev => ({ ...prev, _container: y }));
                        }
                    }}
                >
                    <Text className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-8 px-2">
                        Pro Feature Deep Dive
                    </Text>

                    {SLIDES.map((item) => (
                        <View
                            key={item.id}
                            onLayout={(event) => handleLayout(item.id, event)}
                            className={`mb-8 border-b border-white/5 pb-8 ${requestedFeature === item.id ? 'bg-white/5 -mx-4 px-4 pt-4 rounded-xl border-none' : ''}`}
                        >
                            <TouchableOpacity
                                onPress={() => router.setParams({ feature: item.id })}
                                className="flex-row items-start mb-3"
                            >
                                <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 mt-1 ${item.bg}`}>
                                    <Ionicons name={item.icon as any} size={20} color={item.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-black text-xl tracking-tight mb-1">{item.title}</Text>
                                    <Text className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-2" style={{ color: item.color }}>{item.subtitle}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Always visible details for Pro Page */}
                            <View className="pl-[56px]">
                                {/* VISUAL GOLDEN SAMPLE */}
                                <View className="w-full aspect-video bg-black rounded-2xl mb-6 overflow-hidden border border-white/10 shadow-lg relative items-center justify-center">
                                    <Image
                                        source={item.image}
                                        style={{ width: '80%', height: '80%', resizeMode: 'contain', opacity: 0.9 }}
                                    />
                                    {/* Optional "Sample" overlay badge */}
                                    <View className="absolute top-3 right-3 bg-white/10 px-2 py-1 rounded-md backdrop-blur-md">
                                        <Text className="text-[10px] text-white font-bold uppercase tracking-wider">Preview</Text>
                                    </View>
                                </View>

                                <Text className="text-zinc-300 leading-relaxed mb-4">
                                    {item.id === 'chaos' && "Capture ideas instantly with unlimited song storage. Attach voice memos, PDFs, and chord charts directly to your songs. Never lose a riff again."}
                                    {item.id === 'order' && "Organize chaos into mastery. Create unlimited practicing routines, track your progress session-by-session, and build perfect setlists for every gig."}
                                    {item.id === 'glory' && "The ultimate stage companion. Use Live Mode to perform distraction-free. Sync your calendar to Google/iCal and manage your band roster seamlessly."}
                                    {item.id === 'business' && "Turn your passion into a business. Track every dollar in and out. Manage gig fees, expenses, and tax deductions with the integrated Finance Manager."}
                                    {item.id === 'coach' && "Your personal AI agent. Ask 'Scout' to draft booking emails, suggest setlists based on venue vibe, or critique your practice schedule."}
                                </Text>

                                {/* Bullet Points */}
                                <View className="gap-2">
                                    {item.id === 'chaos' && [
                                        "Unlimited Song Storage", "Cloud Backup & Sync", "File Attachments (Audio/PDF)"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                    {item.id === 'chaos' && (
                                        <View className="mt-4 p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                                            <Text className="text-indigo-400 font-bold text-[10px] uppercase tracking-wide mb-1">The Pro Difference</Text>
                                            <Text className="text-zinc-400 text-xs">Free accounts are limited to 500MB. Pro includes <strong>10GB</strong> of Cloud Storage for backups & attachments*.</Text>
                                        </View>
                                    )}
                                    {item.id === 'order' && [
                                        "Unlimited Setlists", "Unlimited Routines", "Advanced Progress Tracking"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                    {item.id === 'order' && (
                                        <View className="mt-4 p-3 rounded-lg border border-teal-500/20 bg-teal-500/10">
                                            <Text className="text-teal-400 font-bold text-[10px] uppercase tracking-wide mb-1">The Pro Difference</Text>
                                            <Text className="text-zinc-400 text-xs">Free accounts keep 3 months of history. Pro tracks your growth forever.</Text>
                                        </View>
                                    )}
                                    {item.id === 'glory' && [
                                        "Finance & Contracts", "Stage Plots & Setlists", "CRM & Roster"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                    {item.id === 'business' && [
                                        "Income & Expense Tracking", "Profit & Loss Reports", "Tax Categorization"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                    {item.id === 'coach' && [
                                        "AI Strategy Bot", "Email Drafter", "Career Advice"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))}

                    {/* Pro+ Upsell */}
                    <View className="mt-8 mx-6 p-4 rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50">
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-zinc-500 font-bold text-xs uppercase tracking-widest">Need more space?</Text>
                            <View className="bg-zinc-800 px-2 py-1 rounded">
                                <Text className="text-zinc-400 text-[10px] font-bold">PRO+</Text>
                            </View>
                        </View>
                        <Text className="text-zinc-400 text-xs">
                            *Power users can upgrade to <Text className="text-white font-bold">Pro+</Text> for <Text className="text-white font-bold">100GB</Text> of secure cloud storage. Available in Settings.
                        </Text>
                    </View>

                    {/* Legal Footer */}
                    <View className="flex-row justify-center gap-6 mt-8 mb-8 opacity-60">
                        <TouchableOpacity onPress={handleRestore}>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Restore Purchase</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://opusmode.net/terms')}>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terms</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Linking.openURL('https://opusmode.net/privacy')}>
                            <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Privacy</Text>
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}
