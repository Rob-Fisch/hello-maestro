import { getStorageItem, setStorageItem } from '@/lib/storage';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

interface Feature {
    id: string;
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    iconBg: string;
    tier: 'free' | 'pro';
    route?: string; // Only set if directly navigable
    isNew?: boolean;
}

// Define features - "isNew" items will be prioritized to show first
const FEATURES: Feature[] = [
    {
        id: 'performer-page',
        title: 'Performer Page',
        description: 'Share gig details with your band instantly',
        icon: 'share-social',
        iconBg: '#7c3aed',
        tier: 'free',
        // No route - accessed from within a gig
    },
    {
        id: 'venue-crm',
        title: 'Venue Contact Tracker',
        description: 'Log every interaction with venue contacts',
        icon: 'business',
        iconBg: '#0ea5e9',
        tier: 'pro',
        route: '/people',
    },
    {
        id: 'fan-page',
        title: 'Fan Page',
        description: 'Share your upcoming shows with fans',
        icon: 'megaphone',
        iconBg: '#ec4899',
        tier: 'free',
        // No route - accessed from within a gig
    },
    {
        id: 'navigator',
        title: 'The Navigator',
        description: 'AI-powered gig finding prompts',
        icon: 'compass',
        iconBg: '#f59e0b',
        tier: 'free',
        route: '/coach',
    },
    {
        id: 'session-log',
        title: 'Session Log',
        description: 'Track practice time with analysis',
        icon: 'analytics',
        iconBg: '#06b6d4',
        tier: 'free',
        route: '/studio',
    },
    {
        id: 'shareable-setlists',
        title: 'Shareable Set Lists',
        description: 'Keys, instructions, and YouTube/Spotify links',
        icon: 'list',
        iconBg: '#8b5cf6',
        tier: 'free',
        route: '/songs',
    },
    {
        id: 'lesson-assignments',
        title: 'Lesson Assignments',
        description: 'Send practice routines to students',
        icon: 'school',
        iconBg: '#10b981',
        tier: 'pro',
        // No route - accessed from within a routine
    },
    {
        id: 'band-messaging',
        title: 'Band Messaging',
        description: 'Select members and share gig details',
        icon: 'chatbubbles',
        iconBg: '#6366f1',
        tier: 'free',
        isNew: true,
        // No route - accessed from within a gig
    },
];

// Reorder features: "What's New" (isNew: true) items first, then regular items
function getOrderedFeatures(regularStartIndex: number): Feature[] {
    const newFeatures = FEATURES.filter(f => f.isNew);
    const regularFeatures = FEATURES.filter(f => !f.isNew);

    // Rotate regular features to start from the persisted index
    const rotatedRegular = [
        ...regularFeatures.slice(regularStartIndex % regularFeatures.length),
        ...regularFeatures.slice(0, regularStartIndex % regularFeatures.length),
    ];

    // New features always come first, then rotated regular features
    return [...newFeatures, ...rotatedRegular];
}

const ROTATION_INTERVAL = 8000; // 8 seconds per feature
const STORAGE_KEY = 'featureDiscovery_lastIndex';

export function FeatureDiscoveryCards() {
    const router = useRouter();
    const { profile } = useContentStore();
    const isPro = profile?.isPremium === true;

    const [orderedFeatures, setOrderedFeatures] = useState<Feature[]>(FEATURES);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isInitialized, setIsInitialized] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const regularStartIndexRef = useRef(0);

    const feature = orderedFeatures[currentIndex];
    const isClickable = !!feature?.route;

    // Load persisted index on mount and set up ordered features
    useEffect(() => {
        async function initializeOrder() {
            try {
                const savedIndex = await getStorageItem(STORAGE_KEY);
                const startIndex = savedIndex ? parseInt(savedIndex, 10) : 0;
                regularStartIndexRef.current = startIndex;

                // Create ordered list with new features first
                setOrderedFeatures(getOrderedFeatures(startIndex));

                // Save incremented index for next visit
                const regularCount = FEATURES.filter(f => !f.isNew).length;
                const nextIndex = (startIndex + 1) % regularCount;
                await setStorageItem(STORAGE_KEY, nextIndex.toString());
            } catch (e) {
                console.warn('[FeatureDiscovery] Storage error:', e);
                setOrderedFeatures(getOrderedFeatures(0));
            }
            setIsInitialized(true);
        }
        initializeOrder();
    }, []);

    // Auto-rotation
    useEffect(() => {
        if (!isInitialized) return;

        const interval = setInterval(() => {
            // Fade out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start(() => {
                // Change feature
                setCurrentIndex((prev) => (prev + 1) % orderedFeatures.length);
                // Fade in
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }).start();
            });
        }, ROTATION_INTERVAL);

        return () => clearInterval(interval);
    }, [fadeAnim, isInitialized, orderedFeatures.length]);

    const handlePress = () => {
        if (!feature.route) return;

        if (feature.tier === 'pro' && !isPro) {
            router.push('/modal/upgrade');
        } else {
            router.push(feature.route as any);
        }
    };

    const CardContent = (
        <Animated.View
            style={{ opacity: fadeAnim }}
            className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 items-center"
        >
            {/* Icon */}
            <View
                className="w-16 h-16 rounded-2xl items-center justify-center mb-4"
                style={{ backgroundColor: feature.iconBg + '30' }}
            >
                <Ionicons name={feature.icon} size={32} color={feature.iconBg} />
            </View>

            {/* Badges */}
            <View className="flex-row items-center gap-2 mb-2">
                {feature.isNew && (
                    <View className="bg-amber-500 px-2 py-0.5 rounded-full">
                        <Text className="text-[8px] font-black text-white uppercase">New</Text>
                    </View>
                )}
                <View className={`px-2 py-0.5 rounded-full ${feature.tier === 'pro' ? 'bg-indigo-500' : 'bg-emerald-500/80'}`}>
                    <Text className="text-[8px] font-black text-white uppercase">
                        {feature.tier === 'pro' ? 'Pro' : 'Free'}
                    </Text>
                </View>
            </View>

            {/* Title */}
            <Text className="text-white font-bold text-lg text-center mb-1">
                {feature.title}
            </Text>

            {/* Description */}
            <Text className="text-slate-400 text-sm text-center">
                {feature.description}
            </Text>

            {/* Explore link - only for clickable features */}
            {isClickable && (
                <View className="flex-row items-center mt-3">
                    <Text className="text-indigo-400 text-xs font-bold mr-1">Explore</Text>
                    <Ionicons name="arrow-forward" size={12} color="#818cf8" />
                </View>
            )}
        </Animated.View>
    );

    return (
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Explore OpusMode
                </Text>
                <Text className="text-[10px] text-slate-500">
                    {currentIndex + 1} of {orderedFeatures.length}
                </Text>
            </View>

            {isClickable ? (
                <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
                    {CardContent}
                </TouchableOpacity>
            ) : (
                CardContent
            )}

            {/* Progress dots */}
            <View className="flex-row justify-center mt-3 gap-1">
                {orderedFeatures.map((_, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => setCurrentIndex(index)}
                    >
                        <View
                            className={`w-1.5 h-1.5 rounded-full ${index === currentIndex ? 'bg-indigo-500' : 'bg-slate-600'}`}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
