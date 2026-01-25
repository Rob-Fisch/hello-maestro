
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

    // Rotating Content (Logo + Pain Points with Solutions)
    const ROTATING_CONTENT = [
        { type: 'logo' as const },
        { type: 'message' as const, icon: 'musical-notes', iconColor: '#f472b6', text: "\"I forgot the setlist at home\" — Never again. Your entire repertoire lives on your phone." },
        { type: 'message' as const, icon: 'people', iconColor: '#818cf8', text: "\"My band doesn't know what we're playing\" — Share logistics instantly with your Performer Page." },
        { type: 'message' as const, icon: 'compass', iconColor: '#f59e0b', text: "\"How do I find more gigs in my area?\" — AI helps you uncover new leads." },
        { type: 'message' as const, icon: 'person', iconColor: '#34d399', text: "\"Who played bass on that festival last year?\" — Your contact roster remembers everyone." },
        { type: 'message' as const, icon: 'layers', iconColor: '#06b6d4', text: "\"I never practice what I meant to practice\" — Build routines in The Studio and track your progress." },
        { type: 'message' as const, icon: 'school', iconColor: '#a78bfa', text: "\"Where do I even start looking for teaching gigs?\" — AI helps you find teaching opportunities." },
        { type: 'message' as const, icon: 'calendar', iconColor: '#ec4899', text: "\"What songs did we play at that wedding venue?\" — Every gig's setlist is saved and searchable." }
    ];

    const [currentContentIndex, setCurrentContentIndex] = useState(0);
    const contentOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const interval = setInterval(() => {
            // Fade out (1 second)
            Animated.timing(contentOpacity, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
            }).start(() => {
                // Change content
                setCurrentContentIndex((prev) => (prev + 1) % ROTATING_CONTENT.length);
                // Fade in (1 second)
                Animated.timing(contentOpacity, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }).start();
            });
        }, 7000); // 7 seconds per item

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
            desc: "Start getting organized!",
            features: ["All your gigs", "Up to 50 songs", "Basic Practice Tracking", "Contact Management", "Automatic backup", "Try AI-powered lead discovery"],
            cta: "Start Free - No Credit Card",
            primary: false
        },
        {
            name: "Pro Monthly",
            price: "$9.99",
            period: "/mo",
            desc: "For working musicians.",
            features: ["All your songs", "Store everything", "Access from any device", "AI helps you discover local leads", "Track your progress", "Priority Support"],
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
                <View className="px-6 pt-24 pb-12 items-center md:pt-32 md:pb-16">
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }], width: '100%', alignItems: 'center' }}>
                        <Text className="text-5xl md:text-7xl font-black text-white text-center leading-tight mb-6 max-w-4xl tracking-tighter">
                            <Text className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">OpusMode:</Text>{'\n'}
                            The Missing Toolkit{'\n'}
                            <Text className="italic text-fuchsia-400">For Musicians</Text>
                        </Text>
                        <Text className="text-slate-400 text-lg md:text-xl text-center max-w-2xl leading-relaxed mb-4">
                            Tame your business — and get back to the music.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/auth?mode=signup')}
                            className="bg-indigo-600 px-8 py-4 rounded-full shadow-lg shadow-indigo-600/30 mt-2"
                        >
                            <Text className="text-white text-lg font-bold">Get Started Free</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {/* Rotating Logo + Messages */}
                <View className="px-4 md:px-12 mb-20 items-center">
                    <View className="w-full max-w-5xl aspect-square max-h-[400px] bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-2xl shadow-indigo-900/40 relative items-center justify-center">
                        {/* Purple Glow */}
                        <View className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/20 blur-[100px] rounded-full" />

                        {/* Rotating Content */}
                        <Animated.View
                            style={{ opacity: contentOpacity }}
                            className="items-center justify-center px-12 w-full h-full"
                        >
                            {ROTATING_CONTENT[currentContentIndex].type === 'logo' ? (
                                <Image
                                    source={require('../../assets/images/opusmode_om_logo_v9.png')}
                                    style={{ width: 200, height: 200 }}
                                    resizeMode="contain"
                                />
                            ) : (
                                <View className="items-center">
                                    {ROTATING_CONTENT[currentContentIndex].icon && (
                                        <View className="w-16 h-16 rounded-2xl items-center justify-center mb-6" style={{ backgroundColor: ROTATING_CONTENT[currentContentIndex].iconColor + '20' }}>
                                            <Ionicons name={ROTATING_CONTENT[currentContentIndex].icon as any} size={32} color={ROTATING_CONTENT[currentContentIndex].iconColor} />
                                        </View>
                                    )}
                                    <Text className="text-slate-300 text-lg md:text-2xl text-center leading-relaxed font-medium">
                                        {ROTATING_CONTENT[currentContentIndex].text}
                                    </Text>
                                </View>
                            )}
                        </Animated.View>
                    </View>
                </View>

                {/* What is OpusMode Section */}
                <View className="px-6 md:px-24 mb-20 max-w-5xl mx-auto w-full">

                    {/* Full-width intro */}
                    <View className="mb-12">
                        <Text className="text-3xl md:text-4xl font-black text-white text-center mb-6">
                            What is OpusMode?
                        </Text>
                        <Text className="text-slate-300 text-lg md:text-xl text-center leading-relaxed max-w-3xl mx-auto">
                            OpusMode is a productivity app built specifically for musicians. Whether you're a freelance player juggling multiple groups, a bandleader managing a roster, or a serious musician tracking daily practice, OpusMode gives you the tools to stay organized.
                        </Text>
                    </View>

                    {/* Two-column middle section */}
                    <View className="flex-col md:flex-row gap-8 mb-12">
                        {/* Left column - Performances */}
                        <View className="flex-1">
                            <View className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 h-full">
                                <Text className="text-xl font-bold text-white mb-3">For your performances</Text>
                                <Text className="text-slate-400 leading-relaxed">
                                    Store your entire repertoire of songs with lyrics, charts, and notes. Attach links to YouTube, Spotify, or any reference recordings so your band knows exactly what version you're playing. Create set lists you can reuse across gigs or customize for specific shows. Keep all your contacts in one place — musicians, venues, managers — and assign players to each gig with a tap. AI uncovers venues that book your style of music. When it's time to share, send your band a web page with load-in times, venue directions, and the full set list. Send fans a promo page with event details and a tip jar.
                                </Text>
                            </View>
                        </View>

                        {/* Right column - Rehearsal Prep & Practice */}
                        <View className="flex-1">
                            <View className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 h-full">
                                <Text className="text-xl font-bold text-white mb-3">For rehearsal prep & practice</Text>
                                <Text className="text-slate-400 leading-relaxed mb-4">
                                    Share reference materials with your band before you even get in the room. Everyone can access the same charts, links, and notes — so you spend less time explaining and more time playing.
                                </Text>
                                <Text className="text-slate-400 leading-relaxed">
                                    Build a library of exercises, scales, excerpts, or anything you're working on. Organize them into routines you can run through daily or weekly. Log each session with a rating and notes, then watch your progress accumulate over time with built-in analytics.
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Full-width closing */}
                    <View className="bg-indigo-900/20 border border-indigo-500/30 rounded-2xl p-6">
                        <Text className="text-xl font-bold text-white mb-3 text-center">And it all stays with you</Text>
                        <Text className="text-slate-300 text-center leading-relaxed max-w-2xl mx-auto">
                            Your data backs up automatically — so whether you're at home, in the practice room, or backstage, everything is right where you left it.
                        </Text>
                    </View>
                </View>

                {/* Pricing Section */}
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

                {/* Final CTA */}
                <View className="px-6 mb-20 items-center">
                    <TouchableOpacity
                        onPress={() => router.push('/auth?mode=signup')}
                        className="bg-indigo-600 px-10 py-5 rounded-full shadow-lg shadow-indigo-600/40"
                    >
                        <Text className="text-white text-xl font-bold">Start Free Now</Text>
                    </TouchableOpacity>
                    <Text className="text-slate-500 text-sm mt-4">No credit card required</Text>
                </View>

                {/* Footer */}
                <View className="border-t border-white/5 pt-12 pb-8 px-6 text-center">
                    <Text className="text-slate-500 text-center text-sm mb-4">
                        &copy; {new Date().getFullYear()} OpusMode. All rights reserved.
                    </Text>
                    <View className="flex-row justify-center gap-6">
                        <Link href="/privacy" asChild><Text className="text-slate-600 font-bold text-xs uppercase hover:text-slate-400">Privacy</Text></Link>
                        <Link href="/terms" asChild><Text className="text-slate-600 font-bold text-xs uppercase hover:text-slate-400">Terms</Text></Link>
                        <Link href="mailto:support@opusmode.net" asChild><Text className="text-slate-600 font-bold text-xs uppercase hover:text-slate-400">Contact</Text></Link>
                    </View>
                </View>

            </ScrollView >
        </View >
    );
}
