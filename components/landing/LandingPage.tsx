
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;
const IS_DESKTOP = Platform.OS === 'web' && SCREEN_WIDTH > 768;

export default function LandingPage() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    // Rotating Messages
    const VALUE_PROPS = [
        "Is your musical life a scattered mess? Setlists in texts. Rehearsal notes lost in emails. Gig details missing. It's time to bring order to the chaos",
        "The Studio - Track practices, log history, and manage your repertoire metadata. Every hour counts",
        "The Navigator - Your digital co-pilot. Find venues, generate email drafts, and navigate the industry landscape"
    ];

    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const messageOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out
            Animated.timing(messageOpacity, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                // Change message
                setCurrentMessageIndex((prev) => (prev + 1) % VALUE_PROPS.length);
                // Fade in
                Animated.timing(messageOpacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }).start();
            });
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const FEATURE_CARDS = [
        { title: "Gig Management", icon: "calendar", desc: "Track schedules, locations, pay rates, and rosters in one place.", color: "#818cf8" },
        { title: "Contact Manager", icon: "people", desc: "Manage musicians, venues, and students with smart organization.", color: "#f472b6" },
        { title: "Setlist Builder", icon: "list", desc: "Organize your songs with drag-and-drop reordering.", color: "#a78bfa" },
        { title: "Practice Tracking", icon: "time", desc: "Log practice sessions and build custom routines.", color: "#34d399" },
    ];

    const PRICING_TIERS = [
        {
            name: "Free",
            price: "$0",
            desc: "Perfect to get started.",
            features: ["Unlimited Gigs", "50 Songs Max", "Basic Practice Tracking", "Contact Management", "Auto Sync", "Try The Navigator"],
            cta: "Start Free",
            primary: false
        },
        {
            name: "Pro Monthly",
            price: "$9.99",
            period: "/mo",
            desc: "For working musicians.",
            features: ["Unlimited Songs", "Unlimited Storage", "Cloud Sync Across Devices", "Full Navigator Access", "Advanced Analytics", "Priority Support"],
            cta: "Go Pro",
            primary: true,
            highlight: "Most Popular"
        },
        {
            name: "Pro Annual",
            price: "$99",
            period: "/year",
            desc: "Best value - 2 months free!",
            features: ["Everything in Pro Monthly", "2 Months Free", "Annual Billing", "Priority Support"],
            cta: "Go Annual",
            primary: false,
            highlight: "Best Value"
        }
    ];

    return (
        <View className="flex-1 bg-slate-950">
            {/* Background Gradient */}
            <LinearGradient
                colors={['#0f172a', '#1e1b4b', '#000000']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: 'absolute', width: '100%', height: '100%' }}
            />

            {/* Navbar */}
            <View className="absolute top-0 left-0 right-0 z-50 flex-row items-center justify-between px-6 py-4 md:px-12 md:py-6" style={{ paddingTop: insets.top + (Platform.OS === 'web' ? 16 : 0) }}>
                <View className="flex-row items-center gap-3">
                    <View className="w-8 h-8 rounded-lg bg-indigo-600 items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Ionicons name="musical-notes" size={18} color="white" />
                    </View>
                    <Text className="text-white font-black text-xl tracking-tight">OpusMode</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push('/auth')}
                    className="bg-white/10 border border-white/20 px-5 py-2 rounded-full hover:bg-white/20 transition-all"
                >
                    <Text className="text-white font-bold text-sm">Log In</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                {/* Hero Section */}
                <View className="px-6 pt-32 pb-20 items-center md:pt-48 md:pb-32">
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
                        <View className="bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full mb-6">
                            <Text className="text-indigo-300 text-xs font-bold uppercase tracking-widest">v1.3.0 Now Available</Text>
                        </View>
                        <Text className="text-5xl md:text-7xl font-black text-white text-center leading-tight mb-6 max-w-4xl tracking-tighter">
                            The Operating System for <Text className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">Working Musicians</Text>
                        </Text>
                        <Text className="text-slate-400 text-lg md:text-xl text-center max-w-2xl leading-relaxed mb-4">
                            Stop using spreadsheets and sticky notes. OpusMode connects your calendar, repertoire, and finances in one beautiful workspace.
                        </Text>
                        <Text className="text-indigo-300 text-sm md:text-base text-center max-w-xl font-medium mb-10">
                            ✨ Start free - no credit card required. Upgrade only when you need more.
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push('/auth')}
                            className="bg-indigo-600 px-8 py-4 rounded-full shadow-xl shadow-indigo-600/20 w-full md:w-auto items-center"
                        >
                            <Text className="text-white font-bold text-lg">Start Free - No Credit Card</Text>
                        </TouchableOpacity>
                </View>
            </Animated.View>
        </View>

                {/* Logo + Rotating Value Props */ }
    <View className="px-4 md:px-12 mb-32 items-center">
        <View className="w-full max-w-3xl items-center">
            {/* Logo */}
            <View className="mb-8">
                <Image
                    source={require('../../assets/images/opusmode_om_logo_v9.png')}
                    style={{ width: 200, height: 200 }}
                    resizeMode="contain"
                />
            </View>

            {/* Rotating Messages */}
            <Animated.View
                style={{ opacity: messageOpacity }}
                className="px-8"
            >
                <Text className="text-slate-300 text-lg md:text-xl text-center leading-relaxed font-medium">
                    {VALUE_PROPS[currentMessageIndex]}
                </Text>
            </Animated.View>
        </View>
    </View>

    {/* Features Grid */ }
    <View className="px-6 md:px-24 mb-32 max-w-7xl mx-auto w-full">
        <Text className="text-indigo-400 font-bold text-center uppercase tracking-widest mb-2">Everything You Need</Text>
        <Text className="text-3xl md:text-4xl font-black text-white text-center mb-16">Built for the Stage & Studio</Text>

        <View className="flex-row flex-wrap justify-center gap-6">
            {FEATURE_CARDS.map((card, i) => (
                <View key={i} className="w-full md:w-[48%] lg:w-[23%] bg-slate-900/50 border border-white/5 p-6 rounded-3xl hover:border-indigo-500/30 transition-all">
                    <View className="w-12 h-12 rounded-2xl items-center justify-center mb-4 bg-opacity-10" style={{ backgroundColor: card.color + '20' }}>
                        <Ionicons name={card.icon as any} size={24} color={card.color} />
                    </View>
                    <Text className="text-white font-bold text-xl mb-2">{card.title}</Text>
                    <Text className="text-slate-400 leading-relaxed text-sm">{card.desc}</Text>
                </View>
            ))}
        </View>
    </View>

    {/* Pricing Section */ }
    <View className="px-6 md:px-24 mb-32 max-w-5xl mx-auto w-full">
        <Text className="text-3xl md:text-4xl font-black text-white text-center mb-12">Simple Pricing</Text>

        <View className="flex-col md:flex-row justify-center gap-8 items-stretch">
            {PRICING_TIERS.map((tier, i) => (
                <View
                    key={i}
                    className={`flex-1 rounded-3xl p-8 border ${tier.primary ? 'bg-indigo-900/20 border-indigo-500/50' : 'bg-slate-900/30 border-white/5'} relative`}
                >
                    {tier.highlight && (
                        <View className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 px-4 py-1 rounded-full shadow-lg shadow-indigo-500/40">
                            <Text className="text-white text-xs font-bold uppercase tracking-wider">{tier.highlight}</Text>
                        </View>
                    )}

                    <Text className="text-white font-bold text-2xl mb-2">{tier.name}</Text>
                    <View className="flex-row items-baseline mb-4">
                        <Text className="text-4xl font-black text-white">{tier.price}</Text>
                        {tier.period && <Text className="text-slate-400 font-medium ml-1">{tier.period}</Text>}
                    </View>
                    <Text className="text-slate-400 h-10 mb-8 max-w-[200px]">{tier.desc}</Text>

                    <TouchableOpacity
                        onPress={() => router.push('/auth')}
                        className={`w-full py-4 rounded-2xl items-center mb-8 ${tier.primary ? 'bg-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        <Text className="text-white font-bold">{tier.cta}</Text>
                    </TouchableOpacity>

                    <View className="gap-4">
                        {tier.features.map((feat, f) => (
                            <View key={f} className="flex-row items-center gap-3">
                                <Ionicons name="checkmark-circle" size={16} color={tier.primary ? "#818cf8" : "#94a3b8"} />
                                <Text className="text-slate-300 text-sm font-medium">{feat}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            ))}
        </View>
    </View>

    {/* Footer */ }
    <View className="border-t border-white/5 pt-12 pb-8 px-6 text-center">
        <Text className="text-slate-500 text-center text-sm mb-4">
            &copy; {new Date().getFullYear()} OpusMode. All rights reserved.
        </Text>
        <View className="flex-row justify-center gap-6">
            <Link href="/modal/privacy" asChild><Text className="text-slate-600 font-bold text-xs uppercase hover:text-slate-400">Privacy</Text></Link>
            <Link href="/modal/terms" asChild><Text className="text-slate-600 font-bold text-xs uppercase hover:text-slate-400">Terms</Text></Link>
            <Link href="mailto:support@opusmode.net" asChild><Text className="text-slate-600 font-bold text-xs uppercase hover:text-slate-400">Contact</Text></Link>
        </View>
    </View>

            </ScrollView >
        </View >
    );
}
