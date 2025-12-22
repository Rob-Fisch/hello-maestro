import { View, Text, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
    const router = useRouter();

    const Step = ({ number, title, description }: { number: number, title: string, description: string }) => (
        <View className="flex-row mb-6">
            <View className="w-8 h-8 bg-blue-600 rounded-full items-center justify-center mr-4">
                <Text className="text-white font-black">{number}</Text>
            </View>
            <View className="flex-1">
                <Text className="text-lg font-bold text-foreground mb-1">{title}</Text>
                <Text className="text-muted-foreground leading-relaxed">{description}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-background">
            {/* Header */}
            <View className="px-6 pt-6 pb-4 border-b border-border flex-row items-center justify-between">
                <Text className="text-2xl font-black text-foreground">Support & FAQ</Text>
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <Ionicons name="close" size={28} color="#6b7280" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-6 pt-8" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Calendar Sync Section */}
                <View className="mb-10">
                    <View className="flex-row items-center mb-6">
                        <View className="w-12 h-12 bg-blue-100 rounded-2xl items-center justify-center mr-4">
                            <Ionicons name="calendar-outline" size={24} color="#2563eb" />
                        </View>
                        <View>
                            <Text className="text-xl font-black text-foreground">Syncing to Google Calendar</Text>
                            <Text className="text-muted-foreground font-medium">{"Apple Calendar → Google Calendar"}</Text>
                        </View>
                    </View>

                    <Text className="text-muted-foreground mb-8 leading-relaxed">
                        Since OpusMode integrates with your device's native calendar, you can sync your gigs to Google Calendar by following these steps:
                    </Text>

                    <Step
                        number={1}
                        title="Add your Google Account"
                        description="Go to your device's System Settings → Calendar → Accounts. Tap 'Add Account' and sign in to your Google/Gmail account."
                    />

                    <Step
                        number={2}
                        title="Enable Calendars"
                        description="Once your Gmail account is added, ensure the 'Calendars' toggle is turned ON. This allows Apple to talk to Google."
                    />

                    <Step
                        number={3}
                        title="Set as Default (Optional)"
                        description="For the most seamless experience, go to Settings → Calendar → Default Calendar and select your Google calendar. This ensures new gigs are automatically added there."
                    />

                    <Step
                        number={4}
                        title="Check the Calendar App"
                        description="Open the Apple Calendar app, tap 'Calendars' at the bottom, and make sure your Google calendars are checked and visible."
                    />
                </View>

                {/* Support Link */}
                <View className="bg-card p-6 rounded-[32px] border border-border items-center">
                    <Text className="text-lg font-bold text-foreground mb-2 text-center">Still need help?</Text>
                    <Text className="text-muted-foreground text-center mb-6">
                        Feel free to reach out if you have any questions or feedback.
                    </Text>
                    <TouchableOpacity
                        className="bg-blue-600 px-8 py-4 rounded-2xl shadow-lg shadow-blue-200"
                        onPress={() => Linking.openURL('mailto:support@opusmode.app')}
                    >
                        <Text className="text-white font-black">Contact Support</Text>
                    </TouchableOpacity>
                </View>

                <View className="mt-8 items-center">
                    <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest">OpusMode Help Center</Text>
                    <Text className="text-[10px] text-gray-300 mt-1">© 2025 All Rights Reserved</Text>
                </View>
            </ScrollView>
        </View>
    );
}
