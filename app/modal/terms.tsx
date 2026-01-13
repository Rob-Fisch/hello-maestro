import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsModal() {
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
                <Text className="text-white font-bold text-lg">Terms of Service</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 100 }}>
                <Text className="text-xs text-slate-500 mb-8">Last Updated: January 2026</Text>

                <Section title="1. Acceptance">
                    <P>
                        By using the OpusMode application, you agree to be bound by these Terms of Service.
                    </P>
                </Section>

                <Section title="2. Use License">
                    <P>
                        OpusMode grants you a personal, non-exclusive, non-transferable license to use the application for your personal or professional music management needs.
                    </P>
                </Section>

                <Section title="3. Subscription">
                    <P>
                        Certain features ("Pro") require a paid subscription. Prices are subject to change with notice.
                        You may cancel your subscription at any time via your App Store settings.
                    </P>
                </Section>

                <Section title="4. Acceptable Use">
                    <P>
                        You agree not to misuse the application or use it to store illegal content.
                        We reserve the right to terminate accounts that violate these terms.
                    </P>
                </Section>

                <Section title="5. Disclaimer">
                    <P>
                        The application is provided "as is". OpusMode makes no warranties, expressed or implied, regarding reliability or availability.
                        We are not liable for any data loss or damages arising from the use of this software.
                    </P>
                </Section>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
}
