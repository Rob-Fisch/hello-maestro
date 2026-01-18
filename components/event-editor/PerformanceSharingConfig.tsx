
import { AppEvent } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Alert, Platform, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface PerformanceSharingConfigProps {
    values: Partial<AppEvent>;
    onChange: (field: keyof AppEvent, value: any) => void;
    eventId?: string;
}

export default function PerformanceSharingConfig({ values, onChange, eventId }: PerformanceSharingConfigProps) {
    const isPromoEnabled = values.isPublicPromo || false;
    const isPerformerPageEnabled = values.isPerformerPageEnabled || false;

    const copyToClipboard = async (text: string) => {
        if (Platform.OS === 'web') {
            try {
                await navigator.clipboard.writeText(text);
                return true;
            } catch {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = text;
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
                return true;
            }
        } else {
            await Clipboard.setStringAsync(text);
            return true;
        }
    };

    const showMessage = (title: string, message: string) => {
        if (Platform.OS === 'web') {
            alert(`${title}\n\n${message}`);
        } else {
            Alert.alert(title, message);
        }
    };

    const handleCopyPromoLink = async () => {
        if (!eventId) {
            showMessage('Save Event First', 'Please save this event before sharing the link.');
            return;
        }
        const url = `https://opusmode.net/promo/${eventId}`;
        await copyToClipboard(url);
        showMessage('Link Copied!', 'Share this link with your fans to promote your performance.');
    };

    const handleCopyPerformerLink = async () => {
        if (!eventId) {
            showMessage('Save Event First', 'Please save this event before sharing the link.');
            return;
        }
        const url = `https://opusmode.net/performer/${eventId}`;
        await copyToClipboard(url);
        showMessage(
            'Performer Link Copied!',
            '💡 Reminder: Your performers will need to sign up for a free OpusMode account to access this page. It only takes 30 seconds!'
        );
    };

    return (
        <View className="pb-20">
            {/* 1. PERFORMANCE PROMO (Public Fan Page) */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-lg font-black text-slate-800">Performance Promo</Text>
                        <Text className="text-slate-500 text-sm mt-1">
                            Share a public page with fans - setlist, bio, tip jar, and mailing list.
                        </Text>
                    </View>
                    <Switch
                        value={isPromoEnabled}
                        onValueChange={(val) => onChange('isPublicPromo', val)}
                        trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                    />
                </View>

                {isPromoEnabled && (
                    <View className="mt-4 pt-4 border-t border-slate-100">
                        {/* Public Description */}
                        <View className="mb-4">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Fan-Facing Description
                            </Text>
                            <TextInput
                                className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-800 min-h-[100px]"
                                placeholder="Come see us play at the Jazz Festival! We hit the stage at 8pm..."
                                placeholderTextColor="#94a3b8"
                                multiline
                                textAlignVertical="top"
                                value={values.publicDescription}
                                onChangeText={(text) => onChange('publicDescription', text)}
                            />
                        </View>

                        {/* Ticket / Social Link */}
                        <View className="mb-4">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                                Ticket / Website Link
                            </Text>
                            <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4">
                                <Ionicons name="link" size={20} color="#cbd5e1" />
                                <TextInput
                                    className="flex-1 p-3 text-slate-800 font-medium"
                                    placeholder="https://ticket-link.com"
                                    placeholderTextColor="#94a3b8"
                                    autoCapitalize="none"
                                    keyboardType="url"
                                    value={values.socialLink}
                                    onChangeText={(text) => onChange('socialLink', text)}
                                />
                            </View>
                        </View>

                        {/* Show Setlist Toggle */}
                        <View className="flex-row items-center justify-between py-2 mb-4">
                            <Text className="font-bold text-slate-700">Show Setlist on Page?</Text>
                            <Switch
                                value={values.showSetlist || false}
                                onValueChange={(val) => onChange('showSetlist', val)}
                                trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                            />
                        </View>

                        {/* Copy Link Button */}
                        <TouchableOpacity
                            onPress={handleCopyPromoLink}
                            className="bg-indigo-600 py-3 px-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="share-social" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Copy Promo Link</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* 2. PERFORMER PAGE (Authenticated Logistics) */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-lg font-black text-slate-800">Performer Page</Text>
                        <Text className="text-slate-500 text-sm mt-1">
                            Share logistics with your ensemble - load-in, soundcheck, setlist details, and venue info.
                        </Text>
                        <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3">
                            <View className="flex-row items-start">
                                <Ionicons name="information-circle" size={16} color="#d97706" style={{ marginRight: 6, marginTop: 2 }} />
                                <Text className="text-amber-700 text-xs font-bold flex-1">
                                    Performers must sign up for a free OpusMode account to view this page.
                                </Text>
                            </View>
                        </View>
                    </View>
                    <Switch
                        value={isPerformerPageEnabled}
                        onValueChange={(val) => onChange('isPerformerPageEnabled', val)}
                        trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                    />
                </View>

                {isPerformerPageEnabled && (
                    <View className="mt-4 pt-4 border-t border-slate-100">
                        {/* Copy Link Button */}
                        <TouchableOpacity
                            onPress={handleCopyPerformerLink}
                            className="bg-indigo-600 py-3 px-4 rounded-xl flex-row items-center justify-center"
                        >
                            <Ionicons name="people" size={20} color="white" />
                            <Text className="text-white font-bold ml-2">Copy Performer Link</Text>
                        </TouchableOpacity>

                        <Text className="text-slate-400 text-xs text-center mt-3">
                            This link will show load-in time, soundcheck, full setlist, and venue address
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
