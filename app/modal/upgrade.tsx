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
        id: 'chaos',
        title: 'THE DRIFT',
        subtitle: 'CHAOS & CREATIVITY',
        image: require('../../assets/images/chaos_drift.png'),
        icon: 'musical-notes',
        color: '#ffd700', // Gold
        bg: 'bg-stone-900', // Warm Dark
        blob: 'bg-amber-700'
    },
    {
        id: 'order',
        title: 'THE OPUS',
        subtitle: 'ORDER & MASTERY',
        image: require('../../assets/images/studio_order.png'),
        icon: 'grid',
        color: '#2dd4bf', // Teal
        bg: 'bg-slate-950', // Deep Blue
        blob: 'bg-cyan-700'
    },
    {
        id: 'glory',
        title: 'THE STAGE',
        subtitle: 'PERFORMANCE READY',
        image: require('../../assets/images/performance_glory.png'),
        icon: 'trophy',
        color: '#fb7185', // Rose
        bg: 'bg-rose-950', // Deep Red
        blob: 'bg-rose-700'
    },
    {
        id: 'business',
        title: 'THE BUSINESS',
        subtitle: 'PASSION TO PROFIT',
        image: require('../../assets/images/finance_profit.png'),
        icon: 'cash',
        color: '#10b981', // Emerald
        bg: 'bg-emerald-950',
        blob: 'bg-emerald-700'
    },
    {
        id: 'coach',
        title: 'THE COACH',
        subtitle: 'AI STRATEGY',
        image: require('../../assets/images/scout_vision.png'), // New generated image
        icon: 'telescope',
        color: '#8b5cf6', // Violet
        bg: 'bg-violet-950',
        blob: 'bg-violet-700'
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
        // Continuous organic movement
        Animated.loop(
            Animated.sequence([
                Animated.timing(blobScale, { toValue: 1.2, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(blobScale, { toValue: 0.8, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();

        const interval = setInterval(() => {
            Animated.sequence([
                Animated.timing(slideOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
                Animated.delay(50),
                Animated.timing(slideOpacity, { toValue: 1, duration: 600, useNativeDriver: true })
            ]).start();

            setTimeout(() => {
                setCurrentSlideIndex(prev => (prev + 1) % SLIDES.length);
            }, 450);
        }, 3500);

        return () => clearInterval(interval);
    }, []);

    const activeSlide = SLIDES[currentSlideIndex];

    return (
        <View className="flex-1 bg-black">
            <ScrollView
                ref={scrollRef}
                className="flex-1"
                contentContainerStyle={{ paddingBottom: 100, paddingTop: 0 }}
            >
                {/* ARTISTIC HERO SECTION */}
                <View className={`relative h-[550px] w-full items-center justify-center overflow-hidden ${activeSlide.bg} transition-colors duration-1000`}>

                    {/* Artistic Background Blobs */}
                    <Animated.View
                        style={{ opacity: slideOpacity, transform: [{ scale: blobScale }] }}
                        className={`absolute top-[-10%] right-[-20%] w-[400px] h-[400px] rounded-full blur-[80px] opacity-40 ${activeSlide.blob}`}
                    />
                    <Animated.View
                        style={{ opacity: slideOpacity, transform: [{ scale: Animated.divide(2, blobScale) }] }}
                        className={`absolute bottom-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full blur-[60px] opacity-30 ${activeSlide.blob}`}
                    />

                    {/* Close Button - High Z-Index */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                        style={{ zIndex: 9999, elevation: 5 }}
                        className="absolute top-12 right-6 w-12 h-12 rounded-full bg-white/10 border border-white/20 items-center justify-center backdrop-blur-md"
                    >
                        <Ionicons name="close" size={28} color="white" />
                    </TouchableOpacity>

                    {/* Changing Content */}
                    <Animated.View style={{ opacity: slideOpacity, alignItems: 'center' }} className="px-8">
                        {/* Huge Iconic Representation - Matches Auth Screen now */}
                        <View className="w-full max-w-[320px] aspect-square items-center justify-center rounded-[40px] overflow-hidden border border-white/10 bg-black shadow-2xl shadow-purple-900/50 mb-8">
                            <Image
                                source={activeSlide.image}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    resizeMode: 'contain'
                                }}
                            />
                        </View>

                        <Text className="text-white font-black text-6xl text-center mb-4 leading-none tracking-tighter shadow-lg">
                            {activeSlide.title}
                        </Text>

                        <View className="bg-white/10 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
                            <Text className="text-white font-bold tracking-[0.2em] text-xs uppercase" style={{ color: activeSlide.color }}>
                                {activeSlide.subtitle}
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Pagination Lines */}
                    <View className="absolute bottom-20 flex-row gap-2">
                        {SLIDES.map((_, i) => (
                            <View
                                key={i}
                                className={`h-1.5 rounded-full duration-300 ${i === currentSlideIndex ? 'w-12 bg-white' : 'w-4 bg-white/20'}`}
                            />
                        ))}
                    </View>
                </View>

                {/* BOLD OFFER SECTION */}
                <View className="-mt-10 px-4 mb-2">
                    <View className="bg-zinc-900 p-8 rounded-[40px] shadow-2xl border border-zinc-800">
                        <View className="flex-row justify-between items-center mb-8">
                            <View>
                                <Text className="text-white font-bold text-sm uppercase tracking-widest text-zinc-500 mb-1">Annual Plan</Text>
                                <View className="flex-row items-baseline">
                                    <Text className="text-5xl font-black text-white tracking-tighter">$19.99</Text>
                                    <Text className="text-zinc-500 font-bold ml-2">/year</Text>
                                </View>
                            </View>
                            <View className="bg-green-500/20 px-3 py-1 rounded-lg border border-green-500/30">
                                <Text className="text-green-400 font-black text-xs uppercase">-50% OFF</Text>
                            </View>
                        </View>

                        <TouchableOpacity onPress={handlePurchase} activeOpacity={0.9} className="w-full mb-4">
                            <View className="w-full py-5 rounded-3xl items-center justify-center shadow-lg shadow-purple-500/20 bg-white">
                                <Text className="text-black font-black text-xl tracking-tight">START FREE TRIAL</Text>
                            </View>
                        </TouchableOpacity>

                        <Text className="text-center text-zinc-500 text-xs font-medium">
                            7 days free, then $19.99/year. Cancel anytime.
                        </Text>
                    </View>
                </View>

                {/* FEATURE BREAKDOWN (Minimalist Grid) */}
                <View
                    className="px-6 py-8"
                    onLayout={(event) => {
                        const y = event?.nativeEvent?.layout?.y;
                        if (typeof y === 'number') {
                            setLayouts(prev => ({ ...prev, _container: y }));
                        }
                    }}
                >
                    <Text className="text-zinc-500 font-black text-xs uppercase tracking-widest mb-6 px-2">Where Art Meets Science</Text>

                    {SLIDES.map((item) => (
                        <View
                            key={item.id}
                            onLayout={(event) => handleLayout(item.id, event)}
                            className={`mb-4 rounded-3xl overflow-hidden ${requestedFeature === item.id ? 'bg-zinc-800' : 'bg-transparent'}`}
                        >
                            <TouchableOpacity className="flex-row items-center p-4">
                                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${item.bg}`}>
                                    <Ionicons name={item.icon as any} size={24} color={item.color} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg tracking-tight">{item.title}</Text>
                                    <Text className="text-zinc-400 text-xs font-medium mt-0.5">{item.subtitle}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={20} color="#52525b" />
                            </TouchableOpacity>
                            {requestedFeature === item.id && (
                                <View className="px-4 pb-4">
                                    <Text className="text-zinc-400 leading-relaxed">
                                        Unlock the full potential of {item.title}. No limits, no boundaries. Just pure creative freedom.
                                    </Text>
                                </View>
                            )}
                        </View>
                    ))}

                    {/* Legal Footer */}
                    <View className="flex-row justify-center gap-6 mt-8 opacity-60">
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
