import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function OnboardingPasswordScreen() {
    const theme = useTheme();
    const router = useRouter();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSetPassword = async () => {
        if (password.length < 6) {
            Alert.alert('Password too short', 'Please use at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Mismatch', 'Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            Alert.alert('Welcome Aboard!', 'Your password has been set. You are ready to go!');
            router.replace('/(drawer)');

        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.background }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>

                <View className="items-center mb-10">
                    <View className="w-20 h-20 rounded-full bg-teal-500/20 items-center justify-center mb-6">
                        <Ionicons name="key-outline" size={40} color="#14b8a6" />
                    </View>
                    <Text className="text-3xl font-black text-white text-center mb-2">
                        Set Your Password 🔐
                    </Text>
                    <Text className="text-slate-400 text-center leading-relaxed">
                        Create a secure password to protect your account.
                    </Text>
                </View>

                <View className="space-y-4">
                    <View>
                        <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Password</Text>
                        <TextInput
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold text-lg"
                            secureTextEntry
                            placeholder="Min 6 characters"
                            placeholderTextColor="#64748b"
                            value={password}
                            onChangeText={setPassword}
                            autoCapitalize="none"
                        />
                    </View>

                    <View>
                        <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Confirm Password</Text>
                        <TextInput
                            className="bg-white/5 border border-white/10 p-4 rounded-2xl text-white font-bold text-lg"
                            secureTextEntry
                            placeholder="Re-enter password"
                            placeholderTextColor="#64748b"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSetPassword}
                        disabled={loading}
                        className={`mt-6 p-5 rounded-2xl items-center justify-center shadow-lg ${loading ? 'bg-slate-700' : 'bg-teal-500'}`}
                    >
                        <Text className="text-white font-black text-lg tracking-tight">
                            {loading ? 'Setting Password...' : 'Save & Enter Studio'}
                        </Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
