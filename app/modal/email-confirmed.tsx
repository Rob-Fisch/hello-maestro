import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function EmailConfirmedScreen() {
    const theme = useTheme();
    const router = useRouter();
    const { profile } = useContentStore();

    const handleEnterStudio = () => {
        router.replace('/(drawer)');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1"
            style={{ backgroundColor: theme.background }}
        >
            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 32 }}>

                {/* Success Icon */}
                <View className="items-center mb-10">
                    <View className="w-24 h-24 rounded-full bg-emerald-500/20 items-center justify-center mb-6">
                        <Ionicons name="checkmark-circle" size={56} color="#34d399" />
                    </View>
                    <Text className="text-3xl font-black text-white text-center mb-2">
                        You're All Set! 🎉
                    </Text>
                    <Text className="text-slate-400 text-center leading-relaxed">
                        Your email has been verified.{'\n'}Welcome to OpusMode!
                    </Text>
                    {profile?.email && (
                        <Text className="text-slate-500 text-sm mt-2">
                            Signed in as {profile.email}
                        </Text>
                    )}
                </View>

                {/* What's Next Section */}
                <View className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700 mb-8">
                    <Text className="text-indigo-400 font-bold text-xs uppercase tracking-wider mb-3">
                        What's Next?
                    </Text>
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="musical-notes" size={20} color="#818cf8" style={{ marginRight: 12 }} />
                        <Text className="text-slate-300 flex-1">Add your first song to the repertoire</Text>
                    </View>
                    <View className="flex-row items-center mb-3">
                        <Ionicons name="calendar" size={20} color="#818cf8" style={{ marginRight: 12 }} />
                        <Text className="text-slate-300 flex-1">Schedule an upcoming gig</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name="time" size={20} color="#818cf8" style={{ marginRight: 12 }} />
                        <Text className="text-slate-300 flex-1">Create a practice routine</Text>
                    </View>
                </View>

                {/* Enter Studio Button */}
                <TouchableOpacity
                    onPress={handleEnterStudio}
                    className="bg-white py-5 rounded-2xl items-center justify-center shadow-lg"
                >
                    <Text className="text-black font-black text-lg tracking-tight">
                        Enter Studio
                    </Text>
                </TouchableOpacity>

            </ScrollView>
        </KeyboardAvoidingView>
    );
}
