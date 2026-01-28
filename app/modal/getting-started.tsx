import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Easing, ScrollView, Text, TouchableOpacity, View } from 'react-native';

/**
 * Getting Started - Onboarding guide for new users
 * 
 * Helps users discover the app's navigation structure:
 * 1. Main menu contains everything
 * 2. Site Map for detailed structure
 * 3. Help for detailed instructions
 */
export default function GettingStartedScreen() {
    const router = useRouter();

    // Animated pulse for the menu icon
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        // Subtle breathing pulse animation
        const pulseLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.08,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        // Glow opacity animation
        const glowLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, {
                    toValue: 0.6,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(glowAnim, {
                    toValue: 0.3,
                    duration: 1200,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );

        pulseLoop.start();
        glowLoop.start();

        return () => {
            pulseLoop.stop();
            glowLoop.stop();
        };
    }, [pulseAnim, glowAnim]);

    const Section = ({
        icon,
        iconColor,
        title,
        description,
        actionLabel,
        onAction
    }: {
        icon: string;
        iconColor: string;
        title: string;
        description: string;
        actionLabel?: string;
        onAction?: () => void;
    }) => (
        <View className="bg-slate-800 rounded-3xl p-6 mb-4 border border-slate-700">
            <View className="flex-row items-center mb-4">
                <View
                    className="w-12 h-12 rounded-2xl items-center justify-center mr-4"
                    style={{ backgroundColor: iconColor + '20' }}
                >
                    <Ionicons name={icon as any} size={24} color={iconColor} />
                </View>
                <Text className="text-xl font-black text-white flex-1">{title}</Text>
            </View>
            <Text className="text-slate-300 text-base leading-relaxed mb-4">{description}</Text>
            {actionLabel && onAction && (
                <TouchableOpacity
                    onPress={onAction}
                    className="flex-row items-center self-start bg-slate-700 px-4 py-2 rounded-full"
                >
                    <Text className="text-white font-bold mr-2">{actionLabel}</Text>
                    <Ionicons name="chevron-forward" size={16} color="white" />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-slate-800 flex-row items-center justify-between">
                <View>
                    <Text className="text-2xl font-black text-white">Getting Started</Text>
                    <Text className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Your Quick Tour</Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-white/10 rounded-full items-center justify-center"
                    style={{ width: 44, height: 44 }}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Hero Section with Main Menu Graphic */}
                <View className="bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-3xl p-6 mb-6 border border-purple-500/30 items-center">
                    {/* Animated glow ring */}
                    <View style={{ position: 'relative' }}>
                        <Animated.View
                            style={{
                                position: 'absolute',
                                width: 80,
                                height: 80,
                                borderRadius: 16,
                                backgroundColor: '#a78bfa',
                                opacity: glowAnim,
                                top: -8,
                                left: -8,
                            }}
                        />
                        <Animated.View
                            className="w-16 h-16 bg-slate-800 rounded-2xl items-center justify-center mb-4"
                            style={{
                                transform: [{ scale: pulseAnim }],
                                borderWidth: 2,
                                borderColor: 'white',
                            }}
                        >
                            <Ionicons name="menu" size={36} color="white" />
                        </Animated.View>
                    </View>
                    <Text className="text-2xl font-black text-white text-center mb-2">
                        Everything You Need
                    </Text>
                    <Text className="text-slate-300 text-center leading-relaxed">
                        Tap the Main menu (☰) in the top-left corner to access <Text className="font-bold text-white">all features</Text> in OpusMode.
                    </Text>
                </View>

                {/* Section 1: Menu Overview */}
                <Section
                    icon="menu"
                    iconColor="#a78bfa"
                    title="The Menu"
                    description="The Main menu is your home base. From there you can access The Stage (for gigs), The Studio (for practice), your Contacts, the AI Navigator, and more."
                />

                {/* Section 2: Site Map */}
                <Section
                    icon="git-network-outline"
                    iconColor="#818cf8"
                    title="Site Map"
                    description="Want a bird's-eye view? The Site Map shows how all the features connect — perfect for understanding the big picture."
                    actionLabel="View Site Map"
                    onAction={() => router.push('/modal/sitemap')}
                />

                {/* Section 3: Help */}
                <Section
                    icon="help-circle-outline"
                    iconColor="#22d3ee"
                    title="Help & Support"
                    description="Need step-by-step instructions? The Help section has detailed guides for every feature, including workflow diagrams."
                    actionLabel="View Help"
                    onAction={() => router.push('/modal/help')}
                />

                {/* Quick Tips */}
                <View className="mt-4 mb-8">
                    <Text className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4">Quick Tips</Text>

                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 bg-purple-500/20 rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-purple-400 font-bold text-xs">1</Text>
                        </View>
                        <Text className="text-slate-300 flex-1">
                            <Text className="font-bold text-white">The Stage</Text> is for managing gigs and performances
                        </Text>
                    </View>

                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 bg-cyan-500/20 rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-cyan-400 font-bold text-xs">2</Text>
                        </View>
                        <Text className="text-slate-300 flex-1">
                            <Text className="font-bold text-white">The Studio</Text> is for organizing practice routines
                        </Text>
                    </View>

                    <View className="flex-row items-start">
                        <View className="w-6 h-6 bg-amber-500/20 rounded-full items-center justify-center mr-3 mt-0.5">
                            <Text className="text-amber-400 font-bold text-xs">3</Text>
                        </View>
                        <Text className="text-slate-300 flex-1">
                            <Text className="font-bold text-white">The Navigator</Text> uses AI to help you find gigs
                        </Text>
                    </View>
                </View>

                {/* CTA */}
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl py-4 items-center mb-8"
                    style={{ backgroundColor: '#7c3aed' }}
                >
                    <Text className="text-white font-black text-lg">Let's Go! 🚀</Text>
                </TouchableOpacity>

                <View className="items-center mb-8">
                    <Text className="text-slate-500 text-xs">You can always find this guide in the menu</Text>
                </View>
            </ScrollView>
        </View>
    );
}
