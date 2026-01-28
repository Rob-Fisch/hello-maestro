import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function CheckEmailScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const [resending, setResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResend = async () => {
        if (!email) return;

        setResending(true);
        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) throw error;

            setResent(true);
            Alert.alert('Email Sent!', 'We sent another verification link to your inbox.');
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Could not resend email. Please try again.');
        } finally {
            setResending(false);
        }
    };

    const handleUseDifferentEmail = () => {
        router.replace('/auth?mode=signup');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.background }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>

                {/* Email Icon */}
                <View className="items-center mb-10">
                    <View className="w-24 h-24 rounded-full bg-indigo-500/20 items-center justify-center mb-6">
                        <Ionicons name="mail-outline" size={48} color="#818cf8" />
                    </View>
                    <Text className="text-3xl font-black text-white text-center mb-2">
                        Check Your Inbox 📧
                    </Text>
                    <Text className="text-slate-400 text-center leading-relaxed">
                        We sent a verification link to:
                    </Text>
                    <Text className="text-white font-bold text-lg mt-2 text-center">
                        {email || 'your email address'}
                    </Text>
                </View>

                {/* Instructions */}
                <View className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 mb-8">
                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 rounded-full bg-indigo-500/30 items-center justify-center mr-3 mt-0.5">
                            <Text className="text-indigo-400 font-bold text-xs">1</Text>
                        </View>
                        <Text className="text-slate-300 flex-1">
                            Open your email app and find the message from OpusMode
                        </Text>
                    </View>
                    <View className="flex-row items-start mb-3">
                        <View className="w-6 h-6 rounded-full bg-indigo-500/30 items-center justify-center mr-3 mt-0.5">
                            <Text className="text-indigo-400 font-bold text-xs">2</Text>
                        </View>
                        <Text className="text-slate-300 flex-1">
                            Click the verification link in the email
                        </Text>
                    </View>
                    <View className="flex-row items-start">
                        <View className="w-6 h-6 rounded-full bg-indigo-500/30 items-center justify-center mr-3 mt-0.5">
                            <Text className="text-indigo-400 font-bold text-xs">3</Text>
                        </View>
                        <Text className="text-slate-300 flex-1">
                            You'll be redirected back here to complete setup
                        </Text>
                    </View>
                </View>

                {/* Help Section */}
                <View className="items-center">
                    <Text className="text-slate-500 text-sm mb-4">
                        Didn't receive the email? Check your spam folder.
                    </Text>

                    {/* Resend Button */}
                    <TouchableOpacity
                        onPress={handleResend}
                        disabled={resending || resent}
                        className={`py-3 px-6 rounded-xl mb-3 ${resent ? 'bg-emerald-500/20' : 'bg-indigo-500/20'}`}
                    >
                        <Text className={`font-bold ${resent ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {resending ? 'Sending...' : resent ? '✓ Email Resent' : 'Resend Verification Email'}
                        </Text>
                    </TouchableOpacity>

                    {/* Use Different Email */}
                    <TouchableOpacity onPress={handleUseDifferentEmail} className="py-2">
                        <Text className="text-slate-500 text-sm">
                            Wrong email? <Text className="text-indigo-400 font-bold">Use a different one</Text>
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
