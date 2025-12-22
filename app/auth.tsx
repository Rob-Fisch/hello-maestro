import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useContentStore } from '@/store/contentStore';
import { supabase } from '@/lib/supabase';

export default function AuthScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const { setProfile, fullSync } = useContentStore();

    const router = useRouter();

    async function handleForgotPassword() {
        if (!email) {
            Alert.alert('Email Required', 'Please enter your email address to reset your password.');
            return;
        }
        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'maestro://reset-password',
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
                setLoading(false);
                router.replace('/(drawer)');
                return;
            }

            // Otherwise, attempt real Supabase Auth
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { display_name: isRob ? 'Rob' : undefined } }
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
                    });
                    setLoading(false);
                    router.replace('/(drawer)');
                    Alert.alert('Offline Mode', 'Signed in as Rob offline. Sync is disabled because no real Supabase account was found for this email.');
                    return;
                }

                if (error) throw error;

                if (data.user) {
                    setProfile({
                        id: data.user.id,
                        email: data.user.email || '',
                        displayName: data.user.user_metadata?.display_name || 'Maestro',
                    });
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
            className="flex-1 bg-white"
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-8">
                <View className="flex-1 justify-center py-20">
                    <View className="items-center mb-12">
                        <View className="w-24 h-24 bg-blue-600 rounded-[30px] items-center justify-center shadow-2xl shadow-blue-400 rotate-3">
                            <Ionicons name="musical-notes" size={50} color="white" />
                        </View>
                    </View>
                    <Text className="text-5xl font-black text-white tracking-tighter mb-2">OpusMode</Text>
                    <Text className="text-white/60 text-lg font-medium leading-relaxed">
                        Your journey to musical mastery,{"\n"}guided by the perfect roadmap.
                    </Text>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-xs uppercase font-black text-blue-600 tracking-widest ml-1 mb-2">Email Address</Text>
                            <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 border border-gray-100">
                                <Ionicons name="mail-outline" size={20} color="#94a3b8" />
                                <TextInput
                                    className="flex-1 py-5 ml-3 text-gray-900 font-bold"
                                    placeholder="maestro@example.com"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>
                        </View>

                        {!isForgotPassword && (
                            <View className="mt-4">
                                <View className="flex-row justify-between items-center mb-2 px-1">
                                    <Text className="text-xs uppercase font-black text-blue-600 tracking-widest">Password</Text>
                                    {!isSignUp && (
                                        <TouchableOpacity onPress={() => setIsForgotPassword(true)}>
                                            <Text className="text-xs font-bold text-gray-400">Forgot?</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                                <View className="flex-row items-center bg-gray-50 rounded-2xl px-5 border border-gray-100">
                                    <Ionicons name="lock-closed-outline" size={20} color="#94a3b8" />
                                    <TextInput
                                        className="flex-1 py-5 ml-3 text-gray-900 font-bold"
                                        placeholder="••••••••"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry
                                    />
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleAuth}
                            disabled={loading}
                            className={`mt-10 py-5 rounded-3xl items-center shadow-xl ${loading ? 'bg-gray-400' : 'bg-blue-600 shadow-blue-400'}`}
                        >
                            <Text className="text-white text-xl font-black">{loading ? 'Please Wait...' : (isForgotPassword ? 'Reset Password' : (isSignUp ? 'Create Account' : 'Sign In'))}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                if (isForgotPassword) {
                                    setIsForgotPassword(false);
                                } else {
                                    setIsSignUp(!isSignUp);
                                }
                            }}
                            className="mt-6 p-4 items-center"
                        >
                            <Text className="text-gray-500 font-bold">
                                {isForgotPassword ? 'Back to ' : (isSignUp ? 'Already have an account? ' : "Don't have an account? ")}
                                <Text className="text-blue-600"> {isForgotPassword ? 'Sign In' : (isSignUp ? 'Sign In' : 'Sign Up')}</Text>
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>

                {/* Footer Credits */}
                <View className="pb-10 items-center">
                    <Text className="text-gray-300 text-xs font-bold uppercase tracking-[4px]">Puddle-Proof Technology</Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
