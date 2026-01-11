
import { useEventForm } from '@/hooks/useEventForm';
import { PAPER_THEME } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { AppEventType } from '@/store/types';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from 'react-native';

// Sub-Editors (Stubs for now)
import GigEditor from './GigEditor';
import StandardEditor from './StandardEditor';

export default function EventEditorShell() {
    const router = useRouter();
    const params = useLocalSearchParams();

    // 1. Resolve ID & Type
    // If ID exists, we are in EDIT mode.
    // If ID is undefined, we are in CREATE mode.
    const activeId = params.id as string | undefined;
    const initialType = (params.type as AppEventType) || 'performance';

    const { events } = useContentStore();
    const existingEvent = activeId ? events?.find(e => e.id === activeId) : undefined;

    // 2. Initialize Logic Hook
    const { values, handleChange, save, isSaving, isDirty, setValues } = useEventForm({
        existingEvent,
        initialType,
        onSaveSuccess: () => {
            // Optional: Show toast?
        }
    });

    // 3. Routing Logic (Gig vs Standard)
    // For now, let's treat "Performance" as Gig, others as Standard.
    // We can change this logic later.
    const isGigMode = values.type === 'performance';

    const handleCancel = () => {
        if (!isDirty) {
            router.back();
            return;
        }

        if (Platform.OS === 'web') {
            const ok = confirm('You have unsaved changes. Discard them?');
            if (ok) router.back();
        } else {
            Alert.alert(
                'Discard Changes?',
                'You have unsaved changes. Are you sure you want to discard them?',
                [
                    { text: 'Keep Editing', style: 'cancel' },
                    { text: 'Discard', style: 'destructive', onPress: () => router.back() }
                ]
            );
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: PAPER_THEME.background }}>
            <Stack.Screen
                options={{
                    headerLeft: () => null, // Clear left side
                    headerTitle: '', // Keep title clear
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: PAPER_THEME.background },
                    headerRight: () => (
                        <View className="flex-row items-center gap-3 pr-2">
                            {/* Cancel Button */}
                            <TouchableOpacity
                                onPress={handleCancel}
                                className="px-4 py-2 rounded-full bg-slate-100"
                            >
                                <Text className="font-bold text-slate-600">Cancel</Text>
                            </TouchableOpacity>

                            {/* Save Button */}
                            <TouchableOpacity
                                onPress={() => {
                                    console.log('[Shell] Save pressed. calling save()...');
                                    save().then((id) => {
                                        console.log('[Shell] save() resolved with:', id);
                                        if (id) {
                                            router.back();
                                        }
                                    }).catch(err => console.error('[Shell] Save Promise Error:', err));
                                }}
                                className={`px-4 py-2 rounded-full ${isDirty ? 'bg-indigo-600' : 'bg-slate-200'}`}
                                disabled={!isDirty || isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <Text className={`font-bold ${isDirty ? 'text-white' : 'text-slate-400'}`}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    )
                }}
            />

            {/* 
                We render the specific EDITOR implementation here 
                passing the form logic down.
            */}

            {/* For Alpha Test: Only Standard Editor implemented */}
            {isGigMode ? (
                <GigEditor
                    values={values}
                    onChange={handleChange}
                    isSaving={isSaving}
                />
            ) : (
                <StandardEditor
                    values={values}
                    onChange={handleChange}
                    isSaving={isSaving}
                />
            )}

        </View>
    );
}
