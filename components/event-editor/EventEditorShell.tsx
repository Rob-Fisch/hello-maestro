
import { useEventForm } from '@/hooks/useEventForm';
import { PAPER_THEME } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { AppEventType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
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
                    headerLeft: () => (
                        <TouchableOpacity
                            onPress={handleCancel}
                            className="flex-row items-center ml-[-8px] py-2 pr-4"
                        >
                            <Ionicons
                                name="chevron-back"
                                size={24}
                                color={isDirty ? "#ef4444" : "#64748b"}
                            />
                            <Text className={`text-base font-medium ml-[-4px] ${isDirty ? 'text-red-500' : 'text-slate-600'}`}>
                                {isDirty ? "Cancel" : "Back"}
                            </Text>
                        </TouchableOpacity>
                    ),
                    headerTitle: '', // Keep title clear
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: PAPER_THEME.background },
                    headerRight: () => (
                        <View className="flex-row items-center gap-2 pr-2">
                            {/* Save (Stay) */}
                            <TouchableOpacity
                                onPress={() => {
                                    save().catch(err => console.error('[Shell] Save Error:', err));
                                }}
                                className={`flex-row items-center px-3 py-2 rounded-full ${isDirty ? 'bg-indigo-50' : 'bg-slate-100 opacity-50'}`}
                                disabled={!isDirty || isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#4f46e5" />
                                ) : (
                                    <>
                                        <Ionicons name="save-outline" size={18} color={isDirty ? "#4f46e5" : "#94a3b8"} />
                                        <Text className={`font-bold ml-1 text-xs ${isDirty ? 'text-indigo-600' : 'text-slate-400'}`}>Save</Text>
                                    </>
                                )}
                            </TouchableOpacity>

                            {/* Done (Save & Exit) */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (!isDirty) {
                                        router.back();
                                        return;
                                    }
                                    save().then((id) => {
                                        if (id) router.back();
                                    }).catch(err => console.error('[Shell] Save Error:', err));
                                }}
                                className={`flex-row items-center px-3 py-2 rounded-full shadow-sm ${(!isDirty || isDirty) ? 'bg-indigo-600' : 'bg-slate-300'}`}
                            // Always active "Done" acts as Exit if clean, Save & Exit if dirty
                            >
                                <Ionicons name="checkmark" size={18} color="white" />
                                <Text className="text-white font-bold ml-1 text-xs">Done</Text>
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
                    eventId={activeId}
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
