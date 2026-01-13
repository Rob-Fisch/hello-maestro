import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, Image, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

const SLIDES = [
    {
        id: 'events',
        title: 'Master Your Schedule',
        narrative: 'Effortlessly schedule gigs, rehearsals, and lessons. Sync with your bandmates and keep everyone on the same beat.',
        ctaFree: 'Open Calendar',
        ctaPro: 'Open Calendar',
        route: '/events',
        icon: 'calendar-outline',
        color: 'bg-blue-500',
        textColor: 'text-blue-400',
        isPro: false,
        screenshot: require('../../assets/images/events_schedule.png')
    },
    {
        id: 'routines',
        title: 'Perfect Your Practice',
        narrative: 'Build custom routines, track your progress, and level up your skills every single day.',
        ctaFree: 'Start Practicing',
        ctaPro: 'Start Practicing',
        route: '/studio',
        icon: 'layers-outline',
        color: 'bg-indigo-500',
        textColor: 'text-indigo-400',
        isPro: false,
        screenshot: require('../../assets/images/routines_active.png')
    },
    {
        id: 'teacher',
        title: 'Teach & Inspire',
        narrative: 'Manage students, schedule lessons, and track progress. The ultimate tool for modern music teachers.',
        ctaFree: 'Plan Lessons',
        ctaPro: 'Plan Lessons',
        route: '/events',
        icon: 'school-outline',
        color: 'bg-teal-500',
        textColor: 'text-teal-400',
        isPro: false,
        screenshot: require('../../assets/images/teacher_planner.png')
    },
    {
        id: 'setlists',
        title: 'Command the Stage',
        narrative: 'Create dynamic set lists, transpose keys instantly, and share live links with your band or fans.',
        ctaFree: 'Build Set List',
        ctaPro: 'Build Set List',
        route: '/gigs',
        icon: 'musical-notes-outline',
        color: 'bg-rose-500',
        textColor: 'text-rose-400',
        isPro: false,
        screenshot: require('../../assets/images/setlist_view.png')
    },
    {
        id: 'stageplot',
        title: 'Visualize Your Setup',
        narrative: 'Design professional stage plots in seconds. Ensure every venue knows exactly what you need.',
        ctaFree: 'Create Plot',
        ctaPro: 'Create Plot',
        route: '/gigs',
        icon: 'grid-outline',
        color: 'bg-purple-500',
        textColor: 'text-purple-400',
        isPro: false,
        screenshot: require('../../assets/images/stage_plot.png')
    },
    {
        id: 'crm',
        title: 'Grow Your Fanbase',
        narrative: 'Manage your roster and build your mailing list with instant QR codes at every gig.',
        ctaFree: 'Connect',
        ctaPro: 'Connect',
        route: '/people',
        icon: 'people-outline',
        color: 'bg-orange-500',
        textColor: 'text-orange-400',
        isPro: false,
        screenshot: require('../../assets/images/contact_editor.png')
    },
    {
        id: 'finance',
        title: 'Turn Passion to Profit',
        narrative: 'Track gig income, manage expenses, and see exactly what your music career is worth.',
        ctaFree: 'Unlock Finance',
        ctaPro: 'Open Finance',
        route: '/finance',
        icon: 'cash-outline',
        color: 'bg-emerald-500',
        textColor: 'text-emerald-400',
        isPro: true,
        screenshot: require('../../assets/images/finance_dashboard.png')
    },
    {
        id: 'coach',
        title: 'Meet Your AI Coach',
        narrative: 'Your 24/7 agent. Find venues, draft booking emails, and get career advice instantly.',
        ctaFree: 'Ask Coach',
        ctaPro: 'Ask Coach',
        route: '/coach',
        icon: 'telescope-outline',
        color: 'bg-amber-500',
        textColor: 'text-amber-400',
        isPro: true,
        screenshot: require('../../assets/images/scout_agent.png')
    }
];

export default function FeatureCarousel() {
    const theme = useTheme();
    const router = useRouter();
    const { profile } = useContentStore();
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);
    const [previewImage, setPreviewImage] = useState<any>(null);

    // Dynamic width calculation for responsiveness
    // On web, we force a max width (400) to match the container logic in HomeScreen
    // On mobile, we use full width minus parent padding (p-4 = 16px * 2 = 32px)
    const PARENT_PADDING = 32;
    const maxWebWidth = 400;

    const cardWidth = Platform.OS === 'web'
        ? Math.min(width - PARENT_PADDING, maxWebWidth)
        : width - PARENT_PADDING;

    const handleScroll = (event: any) => {
        const slideSize = event.nativeEvent.layoutMeasurement.width;
        const index = event.nativeEvent.contentOffset.x / slideSize;
        const roundIndex = Math.round(index);
        setActiveIndex(roundIndex);
    };

    const scrollToIndex = (index: number) => {
        if (index < 0 || index >= SLIDES.length) return;
        scrollRef.current?.scrollTo({ x: index * cardWidth, animated: true });
        setActiveIndex(index);
    };

    const handlePress = (slide: typeof SLIDES[0]) => {
        if (slide.isPro && !profile?.isPremium) {
            router.push('/modal/upgrade');
        } else {
            router.push(slide.route as any);
        }
    };

    return (
        <View className="mb-8">
            <Text className="text-2xl font-black tracking-tight mb-6 text-white">
                Explore Features
            </Text>

            <View
                className="rounded-[32px] overflow-hidden border shadow-sm relative"
                style={{ backgroundColor: theme.card, borderColor: theme.border, height: 380 }}
            >
                {/* Horizontal Scroll Carousel */}
                <ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={handleScroll}
                    scrollEventThrottle={16}
                    contentContainerStyle={{ width: cardWidth * SLIDES.length }}
                    snapToInterval={cardWidth}
                    decelerationRate="fast"
                    style={{ width: '100%' }}
                >
                    {SLIDES.map((slide, index) => (
                        <View key={slide.id} style={{ width: cardWidth }} className="h-full">
                            {/* Top Image Area */}
                            {/* Top Image Area */}
                            <View
                                style={{
                                    height: 200,
                                    width: '100%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    overflow: 'hidden',
                                    borderBottomWidth: 1,
                                    borderColor: 'rgba(255,255,255,0.1)',
                                    // Hardcoding a dark background for contrast if slide.color fails, 
                                    // but we will try to pass the bg color via style if possible logic allows, 
                                    // for now, let's just make it dark base.
                                    backgroundColor: '#1a1a1a'
                                }}
                            >
                                {slide.screenshot ? (
                                    <TouchableOpacity
                                        activeOpacity={0.9}
                                        onPress={() => setPreviewImage(slide.screenshot)}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            padding: 8, // Reduced padding to enlarge image ~15%
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        <Image
                                            source={slide.screenshot}
                                            style={{ width: '100%', height: '100%' }}
                                            resizeMode="contain"
                                        />
                                        <View style={{ position: 'absolute', bottom: 10, left: 20, backgroundColor: 'rgba(0,0,0,0.7)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 }}>
                                            <Ionicons name="expand-outline" size={12} color="white" />
                                            <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginLeft: 4, textTransform: 'uppercase' }}>View</Text>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <>
                                        <View className={`absolute inset-0 opacity-20 ${slide.color}`} />
                                        <View className="opacity-20 transform scale-150 rotate-[-5deg]">
                                            <Ionicons name={slide.icon as any} size={120} color="white" />
                                        </View>
                                        <Text className="absolute bottom-4 right-4 text-[10px] font-black uppercase tracking-widest text-white/30 border border-white/20 px-2 py-1 rounded">
                                            Screen Shot Placeholder
                                        </Text>
                                    </>
                                )}
                            </View>

                            {/* Content Area */}
                            <View className="p-6 flex-1 justify-between">
                                <View>
                                    <Text className={`text-xs font-black uppercase tracking-widest mb-2 ${slide.textColor}`}>
                                        {slide.title}
                                    </Text>
                                    <Text className="text-white font-medium text-lg leading-6 mb-4">
                                        {slide.narrative}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => handlePress(slide)}
                                    className={`flex-row items-center justify-center py-3 rounded-xl ${slide.isPro && !profile?.isPremium ? 'bg-amber-500' : 'bg-white/10 border border-white/10'}`}
                                >
                                    {slide.isPro && !profile?.isPremium && (
                                        <Ionicons name="lock-closed" size={14} color="black" style={{ marginRight: 6 }} />
                                    )}
                                    <Text className={`font-bold uppercase tracking-wider text-xs ${slide.isPro && !profile?.isPremium ? 'text-black' : 'text-white'}`}>
                                        {slide.isPro && !profile?.isPremium ? slide.ctaFree : slide.ctaPro}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={14} color={slide.isPro && !profile?.isPremium ? 'black' : 'white'} style={{ marginLeft: 6 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Navigation Controls Overlay */}
                <View className="absolute top-1/2 w-full flex-row justify-between px-2 pointer-events-none" style={{ transform: [{ translateY: -120 }] }}>
                    {/* Left Arrow */}
                    <View className="pointer-events-auto">
                        {activeIndex > 0 && (
                            <TouchableOpacity
                                onPress={() => scrollToIndex(activeIndex - 1)}
                                className="w-8 h-8 rounded-full bg-black/30 items-center justify-center backdrop-blur-md border border-white/10"
                            >
                                <Ionicons name="chevron-back" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* Right Arrow */}
                    <View className="pointer-events-auto">
                        {activeIndex < SLIDES.length - 1 && (
                            <TouchableOpacity
                                onPress={() => scrollToIndex(activeIndex + 1)}
                                className="w-8 h-8 rounded-full bg-black/30 items-center justify-center backdrop-blur-md border border-white/10"
                            >
                                <Ionicons name="chevron-forward" size={20} color="white" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Pagination Dots */}
                <View className="absolute top-4 right-4 flex-row gap-1.5 bg-black/30 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/5">
                    {SLIDES.map((_, i) => (
                        <View
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${i === activeIndex ? 'bg-white' : 'bg-white/30'}`}
                        />
                    ))}
                </View>
            </View>

            {/* Full Screen Image Preview Modal */}
            {/* Full Screen Image Preview Modal */}
            <Modal visible={!!previewImage} transparent={true} animationType="fade" onRequestClose={() => setPreviewImage(null)}>
                <View className="flex-1 bg-black/95 justify-center items-center relative">
                    {/* Close Button - Positioned safely for all devices */}
                    <TouchableOpacity
                        onPress={() => setPreviewImage(null)}
                        className="absolute top-12 right-6 z-50 p-3 bg-white/20 rounded-full backdrop-blur-md"
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    >
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>

                    {previewImage && (
                        <Image
                            source={previewImage}
                            className="w-full h-full"
                            resizeMode="contain"
                            style={{ opacity: 1 }}
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}
