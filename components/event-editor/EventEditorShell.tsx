
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
                            className="flex-row items-center ml-0 py-2 pr-4 pl-2" // Removed negative margin, added left padding
                        >
                            <Text className="text-base font-medium text-red-500">Cancel</Text>
                        </TouchableOpacity>
                    ),
                    headerTitle: '', // Keep title clear
                    headerShadowVisible: false,
                    headerStyle: { backgroundColor: PAPER_THEME.background },
                    headerRight: () => (
                        <View className="flex-row items-center gap-2 pr-2">
                            {/* Save (Stay) - Restored for intermediate saves */}
                            <TouchableOpacity
                                onPress={() => {
                                    save().then((id) => {
                                        // Optional: Show a subtle toast or indicator?
                                        // For now, the user just stays on screen.
                                        // If it was a new event, we might need to url replace to include ID? 
                                        // But the hook handles state. The URL param might be stale but internal state has ID.
                                        // In GigEditor, we pass `activeId`. This `activeId` const comes from params.
                                        // We might need to update the route if it was a create!
                                        if (id && !activeId) {
                                            router.replace({ pathname: '/modal/event-editor', params: { id, type: values.type } } as any);
                                        }
                                    }).catch(err => console.error('[Shell] Save Error:', err));
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

                            {/* Save & Exit (Door) */}
                            <TouchableOpacity
                                onPress={() => {
                                    if (!isDirty && existingEvent) {
                                        router.back();
                                        return;
                                    }
                                    save().then((id) => {
                                        if (id) router.back();
                                    }).catch(err => console.error('[Shell] Save Error:', err));
                                }}
                                className={`flex-row items-center px-4 py-2 rounded-full shadow-sm ${(!isDirty && !existingEvent) ? 'bg-slate-300' : 'bg-indigo-600'}`} // Disabled if clean & new (cannot exit empty new)
                                disabled={!isDirty && !existingEvent}
                            >
                                <Ionicons name="exit-outline" size={20} color="white" style={{ transform: [{ scaleX: -1 }] }} />
                                <Text className="text-white font-bold ml-1 text-sm">Save & Exit</Text>
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
