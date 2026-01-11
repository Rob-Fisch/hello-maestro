
import { AppEvent } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { Switch, Text, TextInput, View } from 'react-native';

interface StagePlotConfigProps {
    values: Partial<AppEvent>;
    onChange: (field: keyof AppEvent, value: any) => void;
}

export default function StagePlotConfig({ values, onChange }: StagePlotConfigProps) {
    const isPublic = values.isPublicStagePlot || false;

    return (
        <View className="pb-20">
            {/* 1. Master Toggle */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1 mr-4">
                        <Text className="text-lg font-black text-slate-800">Public Event Page</Text>
                        <Text className="text-slate-500 text-sm mt-1">
                            Create a shareable web page for this event (Stage Plot, Setlist, and Details).
                        </Text>
                    </View>
                    <Switch
                        value={isPublic}
                        onValueChange={(val) => onChange('isPublicStagePlot', val)}
                        trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                    />
                </View>

                {isPublic && (
                    <View className="mt-4 pt-4 border-t border-slate-100 space-y-4">
                        {/* Public Description */}
                        <View>
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Fan-Facing Description</Text>
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
                        <View>
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Ticket / Website Link</Text>
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

                        {/* Toggles */}
                        <View className="flex-row items-center justify-between py-2">
                            <Text className="font-bold text-slate-700">Show Setlist on Page?</Text>
                            <Switch
                                value={values.showSetlist || false}
                                onValueChange={(val) => onChange('showSetlist', val)}
                                trackColor={{ false: '#e2e8f0', true: '#4f46e5' }}
                            />
                        </View>
                    </View>
                )}
            </View>

            {/* Preview Card (Visual Fluff) */}
            {isPublic && (
                <View className="opacity-50 pointer-events-none">
                    <View className="bg-indigo-900 rounded-3xl p-6 shadow-xl items-center">
                        <Ionicons name="phone-portrait-outline" size={48} color="white" />
                        <Text className="text-white font-bold mt-2 text-center">Your Page Preview</Text>
                        <Text className="text-indigo-200 text-xs text-center mt-1">
                            (Preview functionality coming soon)
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}
