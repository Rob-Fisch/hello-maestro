import { BuildInfo } from '@/constants/BuildInfo';
import { supabase } from '@/lib/supabase';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';



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
    const [isForgotPassword, setIsForgotPassword] = useState(false);

    const { setProfile, fullSync } = useContentStore();

    const router = useRouter();
    const { redirectTo, mode } = useLocalSearchParams<{ redirectTo: string; mode: string }>();

    // Initialize isSignUp based on mode query param (from "Get Started Free")
    const [isSignUp, setIsSignUp] = useState(mode === 'signup');

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



                {/* Footer Credits */}
                <View className="pb-10 items-center">
                    {/* Legal Links */}
                    <View className="flex-row items-center mb-4 gap-4">
                        <TouchableOpacity onPress={() => router.push('/privacy')}>
                            <Text className="text-white/40 text-xs font-bold uppercase tracking-wider">Privacy</Text>
                        </TouchableOpacity>
                        <Text className="text-white/20">•</Text>
                        <TouchableOpacity onPress={() => router.push('/terms')}>
                            <Text className="text-white/40 text-xs font-bold uppercase tracking-wider">Terms</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-white/20 text-xs font-bold uppercase tracking-[4px]">Puddle-Proof Technology</Text>
                    <Text className="text-white/20 text-[10px] mt-2">v{BuildInfo.version} (b{BuildInfo.buildNumber})</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
