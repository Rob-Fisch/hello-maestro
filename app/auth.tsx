import { supabase } from '@/lib/supabase';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';


const SLIDE_IMAGES = [
    require('../assets/images/chaos_drift.png'),
    require('../assets/images/studio_order.png'),
    require('../assets/images/performance_glory.png'),
];

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const { setProfile, fullSync } = useContentStore();

    const router = useRouter();

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
                setCurrentImageIndex((prev) => (prev + 1) % SLIDE_IMAGES.length);

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
            Alert.alert('Success', 'Check your email for the password reset link!');
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
            const isRob = email.toLowerCase().startsWith('rob');

            // If it's "Rob" and NO password, do the pure mock (No Sync)
            if (isRob && !password) {
                setProfile({
                    id: 'mock-rob',
                    email: email.toLowerCase().includes('@') ? email.toLowerCase() : 'rob@maestro.com',
                    displayName: 'Rob',
                });
                Alert.alert('Offline Sandbox', 'You are entering in Offline Mode. Data will NOT sync to other devices and will be lost on sign out.');
                setLoading(false);
                router.replace('/(drawer)');
                return;
            }

            // Otherwise, attempt real Supabase Auth
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { display_name: isRob ? 'Rob' : undefined }, emailRedirectTo: Linking.createURL('/') }
                });
                if (error) throw error;
                Alert.alert('Success', 'Check your email for the confirmation link!');
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password });

                // If it's "Rob" and real auth fails, fall back to mock but warn
                if (error && isRob) {
                    setProfile({
                        id: 'mock-rob',
                        email: email.toLowerCase().includes('@') ? email.toLowerCase() : 'rob@maestro.com',
                        displayName: 'Rob',
                        isPremium: true
                    });
                    setLoading(false);
                    router.replace('/(drawer)');
                    Alert.alert('Offline Mode', 'Signed in as Rob offline. Sync is disabled because no real Supabase account was found for this email.');
                    return;
                }

                if (error) throw error;

                if (data.user) {
                    const profileData = data.user.user_metadata || {};
                    console.log('🔍 [AUTH DEBUG] Full Metadata:', JSON.stringify(profileData, null, 2));
                    console.log('🔍 [AUTH DEBUG] is_premium raw:', profileData.is_premium);

                    const isPremium = !!profileData.is_premium;
                    console.log('🔍 [AUTH DEBUG] Final isPremium:', isPremium);

                    setProfile({
                        id: data.user.id,
                        email: data.user.email || '',
                        displayName: profileData.display_name || 'Maestro',
                        isPremium: isPremium
                    });

                    // Trigger sync (Store handles the permissions)
                    await fullSync();
                    setLoading(false);
                    router.replace('/(drawer)');
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

                    {/* --- IMAGE SLIDER SECTION --- */}
                    <View className="items-center mb-12">
                        {/* 
                            Container for the images. 
                            Restored glowing edge, black background, and rounded corners.
                        */}
                        <View className="w-full max-w-[320px] aspect-square items-center justify-center rounded-[40px] overflow-hidden border border-white/10 bg-black shadow-2xl shadow-purple-900/50">
                            {/* The Animated Image */}
                            <Animated.Image
                                source={SLIDE_IMAGES[currentImageIndex]}
                                style={{
                                    opacity: fadeAnim,
                                    width: '100%',
                                    height: '100%',
                                    resizeMode: 'contain'
                                }}
                            />
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
                                    placeholder="maestro@example.com"
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
                                    <TouchableOpacity onPress={() => setIsForgotPassword(true)} className="mt-2 ml-1 self-start">
                                        <Text className="text-xs font-bold text-zinc-400">Forgot password?</Text>
                                    </TouchableOpacity>
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
                                {loading ? 'Please Wait...' : (isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Enter Studio'))}
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
                                {isForgotPassword ? 'Back to Sign In' : isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                                <Text className="text-white"> {isForgotPassword ? '' : isSignUp ? 'Sign In' : 'Sign Up'}</Text>
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* Footer Credits */}
                <View className="pb-10 items-center">
                    <Text className="text-white/20 text-xs font-bold uppercase tracking-[4px]">Puddle-Proof Technology</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
