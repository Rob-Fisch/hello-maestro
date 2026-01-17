import { BuildInfo } from '@/constants/BuildInfo';
import { supabase } from '@/lib/supabase';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';



const FEATURE_HIGHLIGHTS = [
    { text: "Track your gigs", icon: "calendar-outline" },
    { text: "Build your repertoire", icon: "musical-notes-outline" },
    { text: "Organize your practice", icon: "time-outline" },
    { text: "Manage your contacts", icon: "people-outline" },
];

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const { setProfile, fullSync } = useContentStore();

    const router = useRouter();
    const { redirectTo } = useLocalSearchParams<{ redirectTo: string }>();

    // --- ANIMATION REFS ---
    const fadeAnim = useRef(new Animated.Value(1)).current; // Opacity for transitions
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Blob Animation
    const blobScale = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        // Blob Breathing
        Animated.loop(
            Animated.sequence([
                Animated.timing(blobScale, { toValue: 1.1, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(blobScale, { toValue: 0.8, duration: 4000, useNativeDriver: true, easing: Easing.inOut(Easing.ease) })
            ])
        ).start();

        // Slideshow Loop
        const interval = setInterval(() => {
            // 1. Fade Out
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 1500, // Explicitly Slower fade out (was 500)
                useNativeDriver: true,
            }).start(() => {
                // 2. Change Image
                setCurrentImageIndex((prev) => (prev + 1) % FEATURE_HIGHLIGHTS.length);

                // 3. Fade In
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1500, // Explicitly Slower fade in (was 500)
                    useNativeDriver: true,
                }).start();
            });
        }, 5000); // Wait longer (showing image) + transition times effectively

        return () => clearInterval(interval);
    }, []);

    async function handleForgotPassword() {
        if (!email) {
            Alert.alert('Email Required', 'Please enter your email address to reset your password.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: Linking.createURL('/'),
            });
            if (error) throw error;
            Alert.alert('Check your email!', 'We sent you a link to reset your password.');
            setIsForgotPassword(false);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    }

    async function handleAuth() {
        if (isForgotPassword) {
            handleForgotPassword();
            return;
        }
        if (!email || (!password && !isSignUp)) {
            Alert.alert('Missing Info', 'Please fill in all fields.');
            return;
        }

        setLoading(true);

        try {
            // Attempt real Supabase Auth
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { display_name: undefined }, emailRedirectTo: Linking.createURL('/') }
                });
                if (error) throw error;
                Alert.alert('Success', 'Check your email for the confirmation link!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) throw error;


                if (error) throw error;

                if (data.user) {
                    const profileData = data.user.user_metadata || {};
                    const isPremium = !!profileData.is_premium;

                    setProfile({
                        id: data.user.id,
                        email: data.user.email || '',
                        displayName: profileData.display_name || 'Maestro',
                        isPremium: isPremium
                    });

                    // Trigger sync (Store handles the permissions)
                    await fullSync();
                    setLoading(false);
                    if (redirectTo) {
                        router.replace(redirectTo as any);
                    } else {
                        router.replace('/(drawer)');
                    }
                }
            }

        } catch (error: any) {
            setLoading(false);
            Alert.alert('Auth Error', error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }

    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-slate-950 relative" // Dark Background
        >
            {/* --- BACKGROUND GRADIENT --- */}
            <LinearGradient
                colors={['#000000', '#4c1d95']}
                start={{ x: 0, y: 0.2 }}
                end={{ x: 1, y: 1 }}
                locations={[0, 1]}
                style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
            />

            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8">
                <View className="flex-1 justify-center py-20">

                    {/* --- FEATURE HIGHLIGHT SECTION --- */}
                    <View className="items-center mb-6">
                        <View className="w-full max-w-[320px] h-[140px] items-center justify-center rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-indigo-950 to-purple-950 shadow-2xl shadow-purple-900/50">
                            {/* Animated Feature Highlight */}
                            <Animated.View
                                style={{
                                    opacity: fadeAnim,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons
                                    name={FEATURE_HIGHLIGHTS[currentImageIndex].icon as any}
                                    size={44}
                                    color="#a78bfa"
                                    style={{ marginBottom: 10 }}
                                />
                                <Text className="text-white text-lg font-bold text-center px-8">
                                    {FEATURE_HIGHLIGHTS[currentImageIndex].text}
                                </Text>
                            </Animated.View>
                        </View>
                    </View>

                    <Text className="text-5xl font-black text-white tracking-tighter mb-2 text-center">OpusMode</Text>
                    <Text className="text-slate-400 text-lg font-medium leading-relaxed text-center mb-10">
                        Your career, fully composed and orchestrated. OpusMode is the ultimate toolkit for the working musician.
                    </Text>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-xs uppercase font-black text-white tracking-widest ml-1 mb-2">Email Address</Text>
                            <View className="flex-row items-center bg-white/5 rounded-2xl px-5 border border-white/10 backdrop-blur-md">
                                <Ionicons name="mail-outline" size={20} color="white" />
                                <TextInput
                                    className="flex-1 py-5 ml-3 text-white font-bold"
                                    placeholder="opusmode@example.com"
                                    placeholderTextColor="#e4e4e7"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                    selectionColor="white"
                                />
                            </View>
                        </View>

                        {!isForgotPassword && (
                            <View className="mt-4">
                                <View className="mb-2 px-1">
                                    <Text className="text-xs uppercase font-black text-white tracking-widest">Password</Text>
                                </View>
                                <View className="flex-row items-center bg-white/5 rounded-2xl px-5 border border-white/10 backdrop-blur-md">
                                    <Ionicons name="lock-closed-outline" size={20} color="white" />
                                    <TextInput
                                        className="flex-1 py-5 ml-3 text-white font-bold"
                                        placeholder="••••••••"
                                        placeholderTextColor="#e4e4e7"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                        selectionColor="white"
                                    />
                                </View>
                                {!isSignUp && (
                                    <View className="flex-row justify-between mt-2 ml-1">
                                        <TouchableOpacity onPress={() => setIsForgotPassword(true)}>
                                            <Text className="text-xs font-bold text-zinc-400">Forgot password?</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleAuth}
                            disabled={loading}
                            activeOpacity={0.8}
                            className={`mt-10 py-5 rounded-3xl items-center shadow-xl shadow-purple-500/20 ${loading ? 'bg-zinc-800' : 'bg-white'}`}
                        >
                            <Text className={`text-xl font-black tracking-tight ${loading ? 'text-zinc-500' : 'text-black'}`}>
                                {loading
                                    ? 'Please Wait...'
                                    : (isForgotPassword
                                        ? 'Reset Password'
                                        : (isSignUp ? 'Create Account' : 'Enter Studio'))}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                if (isForgotPassword) {
                                    setIsForgotPassword(false);
                                } else if (isSignUp) {
                                    setIsSignUp(false);
                                } else {
                                    setIsSignUp(true);
                                }
                            }}
                            className="mt-6 p-4 items-center"
                        >
                            <Text className="text-zinc-300 font-bold">
                                {isForgotPassword
                                    ? 'Back to Sign In'
                                    : isSignUp
                                        ? 'Already have an account? '
                                        : "Don't have an account? "}

                                {(isForgotPassword || isSignUp) ? (
                                    <Text className="text-white">Sign In</Text>
                                ) : (
                                    <Text className="text-white">Sign Up</Text>
                                )}
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* --- MARKETING SECTIONS --- */}
                <View className="pb-20">
                    {/* 1. The Chaos Problem */}
                    <View className="mb-24 mt-12 items-center px-4">
                        <View className="w-16 h-16 bg-red-500/10 rounded-full items-center justify-center mb-6 border border-red-500/20">
                            <Ionicons name="flash" size={32} color="#f87171" />
                        </View>
                        <Text className="text-white font-black text-3xl text-center mb-4 leading-tight">
                            Is your musical life a scattered mess?
                        </Text>
                        <Text className="text-slate-400 text-lg text-center leading-relaxed">
                            Setlists in texts. Rehearsal notes lost in emails.
                            Gig details missing. It's time to bring order to the chaos.
                        </Text>
                    </View>

                    {/* 2. Features Grid */}
                    <View className="mb-24">
                        <Text className="text-indigo-400 font-bold text-xs uppercase tracking-[4px] text-center mb-10">
                            The Toolkit
                        </Text>

                        {/* Feature 1: The Studio */}
                        <View className="flex-col mb-16">
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-blue-500/10 rounded-2xl items-center justify-center mr-4 border border-blue-500/20">
                                    <Ionicons name="mic" size={24} color="#60a5fa" />
                                </View>
                                <Text className="text-white font-bold text-2xl">The Studio</Text>
                            </View>
                            <Text className="text-slate-400 leading-7 text-lg mb-6">
                                Track practices, log history, and manage your repertoire metadata. Every hour counts.
                            </Text>
                            {/* Golden Sample Image */}
                            <View className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-blue-900/20">
                                <Image
                                    source={require('../assets/images/upgrade_studio_v3.png')}
                                    style={{ width: '100%', height: 240 }}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>

                        {/* Feature 2: The Stage */}
                        <View className="flex-col mb-16">
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-purple-500/10 rounded-2xl items-center justify-center mr-4 border border-purple-500/20">
                                    <Ionicons name="musical-notes" size={24} color="#a78bfa" />
                                </View>
                                <Text className="text-white font-bold text-2xl">The Stage</Text>
                            </View>
                            <Text className="text-slate-400 leading-7 text-lg mb-6">
                                Build dynamic setlists, manage rosters, and keep gig details perfectly organized.
                            </Text>
                            {/* Golden Sample Image */}
                            <View className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-900/20">
                                <Image
                                    source={require('../assets/images/upgrade_gigs_v2.png')}
                                    style={{ width: '100%', height: 240 }}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>

                        {/* Feature 3: The Navigator */}
                        <View className="flex-col mb-12">
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-teal-500/10 rounded-2xl items-center justify-center mr-4 border border-teal-500/20">
                                    <Ionicons name="compass" size={24} color="#2dd4bf" />
                                </View>
                                <Text className="text-white font-bold text-2xl">The Navigator</Text>
                            </View>
                            <Text className="text-slate-400 leading-7 text-lg mb-6">
                                Your digital co-pilot. Find venues, generate email drafts, and navigate the industry landscape.
                            </Text>
                            {/* Golden Sample Image */}
                            <View className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-teal-900/20">
                                <Image
                                    source={require('../assets/images/upgrade_coach_v5.png')}
                                    style={{ width: '100%', height: 240 }}
                                    resizeMode="cover"
                                />
                            </View>
                        </View>
                    </View>

                    {/* 3. Social Proof */}
                    <View className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-24 relative overflow-hidden">
                        <Ionicons name="quote" size={64} color="white" className="absolute -top-2 -left-2 opacity-5" />
                        <Text className="text-zinc-200 font-medium italic text-xl text-center leading-relaxed relative z-10">
                            "The tool I wish I had when I started gigging. It's built to handle the chaos so you can focus on the music."
                        </Text>
                        <View className="mt-6 flex-row items-center justify-center">
                            <View className="w-8 h-8 rounded-full bg-indigo-500 items-center justify-center mr-3">
                                <Text className="text-white font-bold text-xs">RF</Text>
                            </View>
                            <Text className="text-zinc-500 font-bold text-xs uppercase tracking-widest">
                                Rob Fisch, Founder
                            </Text>
                        </View>
                    </View>

                    {/* 4. Bottom CTA */}
                    <View className="items-center mb-8">
                        <Text className="text-white font-black text-2xl mb-6 text-center">
                            Ready to get organized?
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS === 'web') {
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className="bg-white px-8 py-4 rounded-full shadow-lg shadow-white/10"
                        >
                            <Text className="text-black font-black text-base uppercase tracking-wider">
                                Start Now
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Footer Credits */}
                <View className="pb-10 items-center">

                    <Text className="text-white/20 text-xs font-bold uppercase tracking-[4px]">Puddle-Proof Technology</Text>
                    <Text className="text-white/20 text-[10px] mt-2">v{BuildInfo.version} (b{BuildInfo.buildNumber})</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
