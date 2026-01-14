import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyModal() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
        <View className="mb-8">
            <Text className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-2">{title}</Text>
            {children}
        </View>
    );

    const P = ({ children }: { children: React.ReactNode }) => (
        <Text className="text-slate-300 text-sm leading-6 mb-3">{children}</Text>
    );

    return (
        <View className="flex-1 bg-slate-950">
            {/* Header */}
            <View className="px-6 flex-row items-center justify-between z-10 border-b border-white/5 pb-4" style={{ paddingTop: insets.top + 20 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg">Privacy Policy</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-xs text-slate-500 mb-8">Last Updated: January 2026</Text>

                <Section title="1. Overview">
                    <P>
                        At OpusMode, we believe your creative data belongs to you. We do not sell your personal data to third parties.
                        Our business model is simple: we build a great tool, and you pay for it.
                    </P>
                </Section>

                <Section title="2. Data Collection">
                    <P>
                        <Text className="font-bold text-white">Account Info:</Text> When you sign up, we collect your email address to create your account.
                    </P>
                    <P>
                        <Text className="font-bold text-white">User Content:</Text> Data you input (Songs, Setlists, Contacts) is stored locally on your device.
                        If you are a Pro user or sync is enabled, this data is encrypted and stored on our secure cloud servers to enable synchronization across devices.
                    </P>
                </Section>

                <Section title="3. AI Features">
                    <P>
                        Our AI features (The Navigator) process your inputs to generate responses.
                        Your data is not used to train public AI models.
                    </P>
                </Section>

                <Section title="4. Data Deletion">
                    <P>
                        You can delete your account and all associated data at any time via the Settings menu ("Danger Zone").
                    </P>
                </Section>

                <Section title="5. Contact">
                    <P>
                        If you have questions about this policy, please contact us at support@opusmode.com.
                    </P>
                </Section>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
