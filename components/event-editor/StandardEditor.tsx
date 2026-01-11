
import { EventFormValues } from '@/hooks/useEventForm';
import { AppEventType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebDatePicker, WebTimePicker } from './FormComponents';

interface StandardEditorProps {
    values: EventFormValues;
    onChange: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
    isSaving: boolean;
}

export default function StandardEditor({ values, onChange, isSaving }: StandardEditorProps) {

    // Type Selector Options
    const TYPES: { id: AppEventType; label: string; icon: string }[] = [
        { id: 'lesson', label: 'Lesson', icon: 'school' },
        { id: 'rehearsal', label: 'Rehearsal', icon: 'musical-notes' },
        { id: 'other', label: 'Practice/Other', icon: 'options' },
    ];

    return (
        <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
            {/* Title Section */}
            <View className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Basics</Text>
                    <Text className="text-xs font-bold text-red-400 uppercase tracking-widest">* Required</Text>
                </View>

                {/* Type Switcher */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
                    {TYPES.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            onPress={() => onChange('type', t.id)}
                            className={`mr-2 px-4 py-2 rounded-full border flex-row items-center ${values.type === t.id ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-50 border-slate-200'}`}
                        >
                            <Ionicons name={t.icon as any} size={16} color={values.type === t.id ? 'white' : '#64748b'} style={{ marginRight: 6 }} />
                            <Text className={`font-bold ${values.type === t.id ? 'text-white' : 'text-slate-600'}`}>
                                {t.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <TextInput
                    className="text-3xl font-black text-slate-900 leading-tight mb-2 p-0 border-b border-slate-100 pb-2"
                    placeholder="Event Title"
                    value={values.title}
                    onChangeText={(text) => onChange('title', text)}
                    placeholderTextColor="#cbd5e1"
                />
            </View>

            {/* Logistics Card */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-6">
                {/* Venue */}
                <View className="flex-row items-center mb-4 border-b border-slate-100 pb-4">
                    <View className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center mr-3">
                        <Ionicons name="location" size={20} color="#64748b" />
                    </View>
                    <TextInput
                        className="flex-1 text-lg font-bold text-slate-800"
                        placeholder="Location / Venue"
                        value={values.venue}
                        onChangeText={(text) => onChange('venue', text)}
                        placeholderTextColor="#94a3b8"
                    />
                </View>

                {/* Date & Time */}
                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Date</Text>
                        {Platform.OS === 'web' && (
                            <WebDatePicker date={values.date} onChange={(d) => onChange('date', d)} />
                        )}
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs font-bold text-slate-400 uppercase mb-1">Time</Text>
                        {Platform.OS === 'web' && (
                            <WebTimePicker value={values.time} onChange={(t) => onChange('time', t)} />
                        )}
                    </View>
                </View>

                {/* Duration Slider / Input */}
                <View>
                    <Text className="text-xs font-bold text-slate-400 uppercase mb-2">Duration: {values.duration} mins</Text>
                    <View className="flex-row gap-2">
                        {[30, 45, 60, 90, 120].map((dur) => (
                            <TouchableOpacity
                                key={dur}
                                onPress={() => onChange('duration', dur)}
                                className={`px-3 py-2 rounded-lg border ${values.duration === dur ? 'bg-indigo-100 border-indigo-200' : 'bg-slate-50 border-slate-200'}`}
                            >
                                <Text className={`font-bold ${values.duration === dur ? 'text-indigo-600' : 'text-slate-500'}`}>{dur}m</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Note Section */}
            <View className="bg-amber-50 rounded-3xl p-5 shadow-sm border border-amber-100 mb-20">
                <View className="flex-row items-center mb-2">
                    <Ionicons name="document-text" size={20} color="#d97706" style={{ marginRight: 8 }} />
                    <Text className="font-bold text-amber-800">Notes & Setlist</Text>
                </View>
                <TextInput
                    className="text-amber-900 text-base leading-relaxed h-32"
                    multiline
                    textAlignVertical="top"
                    placeholder="Add details, setlist ideas, or reminders..."
                    placeholderTextColor="#d9770680"
                    value={values.notes}
                    onChangeText={(text) => onChange('notes', text)}
                />
            </View>
        </ScrollView>
    );
}
