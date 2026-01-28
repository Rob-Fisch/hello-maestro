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
        id: 'studio',
        title: 'THE STUDIO',
        subtitle: 'PRACTICE • ORGANIZE • MASTER',
        icon: 'musical-notes',
        color: '#60a5fa', // Blue
        bg: 'bg-slate-950',
        blob: 'bg-blue-900'
    },
    {
        id: 'stage',
        title: 'THE STAGE',
        subtitle: 'PERFORM • MANAGE • GROW',
        icon: 'briefcase',
        color: '#f59e0b', // Amber
        bg: 'bg-amber-950',
        blob: 'bg-amber-900'
    },
    {
        id: 'navigator',
        title: 'THE NAVIGATOR',
        subtitle: 'MUSICIAN-CURATED AI',
        icon: 'compass',
        color: '#2dd4bf', // Teal
        bg: 'bg-teal-950',
        blob: 'bg-teal-900'
    }
];

// Contextual marketing based on trigger source
const UPGRADE_TRIGGERS: Record<string, {
    headline: string;
    subtext: string;
    anchor: 'studio' | 'stage' | 'navigator' | 'query-pack';
    showQueryPack?: boolean;
}> = {
    // Navigator triggers
    navigator_limit: {
        headline: "Need more AI-powered leads?",
        subtext: "Your Navigator queries help you find gigs, teaching spots, and festivals. Get more with a Query Pack or unlock unlimited with Pro.",
        anchor: 'query-pack',
        showQueryPack: true,
    },
    scout_pro: {
        headline: "Unlock Pro Navigator Templates",
        subtext: "Festival Scout, Tour Stop Planner, and Teaching Finder are Pro features designed by working musicians.",
        anchor: 'navigator',
    },
    // Finance triggers
    finance: {
        headline: "Track your music income",
        subtext: "The Finance Dashboard gives you real visibility into your gig earnings, expenses, and tax-ready reports.",
        anchor: 'stage',
    },
    // Analytics triggers
    analytics: {
        headline: "See your practice patterns",
        subtext: "Pro unlocks detailed analytics so you can track progress and stay consistent.",
        anchor: 'studio',
    },
    analytics_trends: {
        headline: "Discover your practice trends",
        subtext: "See what's working and what needs attention with Pro analytics.",
        anchor: 'studio',
    },
    // Sync triggers
    sync: {
        headline: "Work on laptop AND phone?",
        subtext: "Pro syncs your data across all devices — web and native app. Your setlists, songs, and gigs go everywhere.",
        anchor: 'stage',
    },
    // Storage triggers
    storage_limit: {
        headline: "Running out of space?",
        subtext: "Pro includes 5GB of cloud storage for your practice materials, charts, and attachments.",
        anchor: 'studio',
    },
    // Set List triggers
    setlist_limit: {
        headline: "Need more set list templates?",
        subtext: "Pro unlocks unlimited master set lists so you can organize for every venue and situation.",
        anchor: 'stage',
    },
    // Song Library triggers
    song_limit: {
        headline: "Your song library is growing!",
        subtext: "Pro gives you unlimited songs with keys, tempos, and reference links all in one place.",
        anchor: 'stage',
    },
    // Default (no specific trigger)
    default: {
        headline: "Upgrade to Pro",
        subtext: "Everything you need to run your music career, in one place.",
        anchor: 'stage',
    },
};

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

    // Get contextual marketing copy based on trigger
    const trigger = UPGRADE_TRIGGERS[requestedFeature] || UPGRADE_TRIGGERS['default'];
    const showQueryPackSection = trigger.showQueryPack || requestedFeature === 'navigator_limit';

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

    // ==========================================================================
    // LEMON SQUEEZY CHECKOUT URLS
    // ==========================================================================
    // URL Format: https://opusmode.lemonsqueezy.com/checkout/buy/[PRODUCT_UUID]?enabled=[VARIANT_ID]
    //
    // Toggle TEST_MODE to switch between test and live checkout:
    const TEST_MODE = false; // Set to true for testing

    // Product UUIDs and Variant IDs by environment
    const CHECKOUT_CONFIG = TEST_MODE ? {
        // TEST MODE
        pro: {
            productUuid: 'f8536fd3-2968-4b94-8f1b-eb92d4a6a334',
            monthlyVariant: 1216060,
            annualVariant: 1216066,
        },
        pro_plus: {
            productUuid: '7c7ceb27-e1aa-4624-a489-5c6dfae727a6',
            monthlyVariant: 1247517,
            annualVariant: 1247518,
        },
        query_pack: {
            checkoutUrl: 'https://opusmode.lemonsqueezy.com/checkout/buy/71cdc811-f356-493b-aada-8094e1943b10',
        },
    } : {
        // LIVE MODE
        pro: {
            productUuid: '68c7d257-06f7-4bee-9123-f8fc30c6b172',
            monthlyVariant: 1240740,
            annualVariant: 1240749,
        },
        pro_plus: {
            productUuid: '229c8350-1c1d-46bf-8748-027b75f1337a',
            monthlyVariant: 1247769,
            annualVariant: 1247770,
        },
        query_pack: {
            checkoutUrl: 'https://opusmode.lemonsqueezy.com/checkout/buy/a49c7e53-4e13-4fff-a2a9-ac1bcd2c7ed2',
        },
    };

    const buildCheckoutUrl = (productUuid: string, variantId: number) =>
        `https://opusmode.lemonsqueezy.com/checkout/buy/${productUuid}?enabled=${variantId}&checkout[custom][user_id]=${profile?.id}&checkout[media]=0`;

    const proMonthlyUrl = buildCheckoutUrl(CHECKOUT_CONFIG.pro.productUuid, CHECKOUT_CONFIG.pro.monthlyVariant);
    const proAnnualUrl = buildCheckoutUrl(CHECKOUT_CONFIG.pro.productUuid, CHECKOUT_CONFIG.pro.annualVariant);
    const proPlusMonthlyUrl = buildCheckoutUrl(CHECKOUT_CONFIG.pro_plus.productUuid, CHECKOUT_CONFIG.pro_plus.monthlyVariant);
    const proPlusAnnualUrl = buildCheckoutUrl(CHECKOUT_CONFIG.pro_plus.productUuid, CHECKOUT_CONFIG.pro_plus.annualVariant);

    const handleSubscribe = (tier: 'pro' | 'pro_plus', period: 'monthly' | 'annual') => {
        if (!profile?.id) {
            Alert.alert("Error", "Please log in to upgrade.");
            return;
        }

        // Select the correct checkout URL based on tier and period
        const urls = {
            pro: { monthly: proMonthlyUrl, annual: proAnnualUrl },
            pro_plus: { monthly: proPlusMonthlyUrl, annual: proPlusAnnualUrl },
        };

        const url = urls[tier][period];
        Linking.openURL(url);
    };

    const handleRestore = () => {
        // For web-based subs, restore is just manage billing
        Linking.openURL('https://opusmode.lemonsqueezy.com/billing');
    };

    const handleQueryPack = () => {
        if (!profile?.id) {
            Alert.alert("Error", "Please log in to purchase.");
            return;
        }
        const url = `${CHECKOUT_CONFIG.query_pack.checkoutUrl}&checkout[custom][user_id]=${profile.id}`;
        Linking.openURL(url);
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

                        {/* Contextual Hero or Default Testimonial */}
                        <View className="px-4">
                            {requestedFeature && trigger.headline !== 'Upgrade to Pro' ? (
                                // Contextual marketing based on trigger
                                <>
                                    <Text className="text-white font-bold text-xl text-center leading-relaxed mb-2">
                                        {trigger.headline}
                                    </Text>
                                    <Text className="text-zinc-400 font-medium text-sm text-center leading-relaxed">
                                        {trigger.subtext}
                                    </Text>
                                </>
                            ) : (
                                // Default testimonial
                                <>
                                    <Text className="text-zinc-400 font-medium italic text-lg text-center leading-relaxed">
                                        "The tool I wish I had when I started gigging."
                                    </Text>
                                    <Text className="text-zinc-600 font-bold text-xs text-right mt-2 uppercase tracking-widest">
                                        — Rob Fisch, Founder and Musician, Opusmode
                                    </Text>
                                </>
                            )}
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

                        <TouchableOpacity onPress={() => handleSubscribe('pro', 'monthly')} activeOpacity={0.9} className="w-full mb-3">
                            <View className="w-full py-4 rounded-2xl items-center justify-center shadow-lg shadow-purple-500/20 bg-white">
                                <Text className="text-black font-black text-lg tracking-tight">START MONTHLY ($9.99/mo)</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSubscribe('pro', 'annual')} activeOpacity={0.9} className="w-full mb-4">
                            <View className="w-full py-4 rounded-2xl items-center justify-center border border-white/10 bg-white/5">
                                <Text className="text-white font-bold text-sm tracking-tight">GET ANNUAL ($99/yr) - 2 MONTHS FREE</Text>
                            </View>
                        </TouchableOpacity>

                        <Text className="text-center text-zinc-500 text-xs font-medium">
                            Secure checkout via Lemon Squeezy. Cancel anytime.
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

                    {SLIDES.map((item, index) => (
                        <View
                            key={item.id}
                            onLayout={(event) => handleLayout(item.id, event)}
                            className={`mb-8 border-b border-white/5 pb-8 -mx-6 px-6 py-6 ${index % 2 === 0 ? 'bg-black' : 'bg-zinc-900'} ${requestedFeature === item.id ? 'bg-white/5 rounded-xl border-none' : ''}`}
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
                                <Text className="text-zinc-300 leading-relaxed mb-4">
                                    {item.id === 'studio' && "Your personal practice library. Create exercises, excerpts, and full pieces. Organize them into routines, track your sessions, and export to PDF."}
                                    {item.id === 'stage' && "Everything for the working musician. Build set lists with song details and references. Manage gigs, track finances, and coordinate with your band."}
                                    {item.id === 'navigator' && "AI guidance curated by a working musician. Find venues, teaching opportunities, festivals, and plan tours — with results designed for how musicians actually work."}
                                </Text>

                                {/* Bullet Points */}
                                <View className="gap-2">
                                    {item.id === 'studio' && [
                                        "Unlimited Practice Blocks", "Custom Routines & Progress Tracking", "PDF Export & Sharing", "Cloud Backup & Sync"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                    {item.id === 'studio' && (
                                        <View className="mt-4 p-3 rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                                            <Text className="text-indigo-400 font-bold text-[10px] uppercase tracking-wide mb-1">The Pro Difference</Text>
                                            <Text className="text-zinc-400 text-xs">Free accounts are limited to 100MB. Pro includes <Text className="font-bold text-white">5GB</Text> of Cloud Storage for backups & attachments.</Text>
                                        </View>
                                    )}
                                    {item.id === 'stage' && [
                                        "Unlimited Setlists & Songs", "Gig Calendar & Finance Dashboard", "Band Roster & Venue Contacts", "5GB Cloud Storage"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                    {item.id === 'navigator' && [
                                        "Find Venues & Gig Leads", "Discover Teaching Establishments", "Research Festivals", "Plan Tours with the Venue Locator"
                                    ].map((feat, i) => (
                                        <View key={i} className="flex-row items-center"><Ionicons name="checkmark" size={12} color="#71717a" /><Text className="text-zinc-400 text-xs ml-2">{feat}</Text></View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    ))}
                    {/* Pro+ Upsell */}
                    <View className="mt-8 mx-6 p-5 rounded-xl border border-amber-500/30 bg-amber-950/30">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-amber-400 font-bold text-sm uppercase tracking-widest">Power User?</Text>
                            <View className="bg-amber-500/20 px-2 py-1 rounded border border-amber-500/30">
                                <Text className="text-amber-400 text-[10px] font-bold">PRO+</Text>
                            </View>
                        </View>
                        <Text className="text-zinc-300 text-sm mb-4">
                            Get <Text className="text-white font-bold">20GB</Text> of cloud storage for large libraries, plus priority support.
                        </Text>

                        <TouchableOpacity onPress={() => handleSubscribe('pro_plus', 'monthly')} activeOpacity={0.9} className="w-full mb-2">
                            <View className="w-full py-3 rounded-xl items-center justify-center border border-amber-500/30 bg-amber-500/10">
                                <Text className="text-amber-400 font-bold text-sm tracking-tight">PRO+ MONTHLY ($19.99/mo)</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => handleSubscribe('pro_plus', 'annual')} activeOpacity={0.9} className="w-full">
                            <View className="w-full py-3 rounded-xl items-center justify-center bg-amber-500/5">
                                <Text className="text-amber-300/70 font-medium text-xs tracking-tight">PRO+ ANNUAL ($199/yr) - 2 MONTHS FREE</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Query Pack Section - Shows when relevant (e.g., navigator_limit trigger) */}
                    {showQueryPackSection && (
                        <View
                            className="mt-8 mx-6 p-5 rounded-xl border border-teal-500/30 bg-teal-950/30"
                            onLayout={(event) => handleLayout('query-pack', event)}
                        >
                            <View className="flex-row items-center justify-between mb-3">
                                <Text className="text-teal-400 font-bold text-sm uppercase tracking-widest">One-Time Pack</Text>
                                <View className="bg-teal-500/20 px-2 py-1 rounded border border-teal-500/30">
                                    <Text className="text-teal-400 text-[10px] font-bold">10 QUERIES</Text>
                                </View>
                            </View>
                            <Text className="text-zinc-300 text-sm mb-4">
                                Not ready for a subscription? Get <Text className="text-white font-bold">10 Navigator queries</Text> that never expire.
                            </Text>

                            <TouchableOpacity onPress={handleQueryPack} activeOpacity={0.9} className="w-full">
                                <View className="w-full py-3 rounded-xl items-center justify-center border border-teal-500/30 bg-teal-500/10">
                                    <Text className="text-teal-400 font-bold text-sm tracking-tight">BUY 10-PACK ($10)</Text>
                                </View>
                            </TouchableOpacity>

                            <Text className="text-zinc-500 text-[10px] text-center mt-3">
                                Credits added instantly. Use anytime.
                            </Text>
                        </View>
                    )}

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
