
import { EventFormValues } from '@/hooks/useEventForm';
import { useContentStore } from '@/store/contentStore';
import { AppEventType, BookingSlot, SetList } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SetListBuilder from '../setlist/SetListBuilder';
import FinanceModule from './FinanceModule';
import { WebDatePicker, WebTimePicker } from './FormComponents';
import RosterEngine from './RosterEngine';
import StagePlotConfig from './StagePlotConfig';

interface GigEditorProps {
    values: EventFormValues;
    eventId?: string;
    onChange: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
    isSaving: boolean;
}

export default function GigEditor({ values, eventId, onChange, isSaving }: GigEditorProps) {
    const { setLists, addSetList, updateSetList } = useContentStore();
    const linkedSetList = eventId ? setLists.find(sl => sl.eventId === eventId) : undefined;
    const [activeTab, setActiveTab] = useState<'logistics' | 'roster' | 'finance' | 'stageplot' | 'setlist'>('logistics');

    const handleSaveSetList = (setList: SetList) => {
        if (linkedSetList) {
            updateSetList(linkedSetList.id, setList);
            alert('Set List Updated');
        } else {
            addSetList({ ...setList, eventId });
            alert('Set List Created');
        }
    };

    const Tabs = [
        { id: 'logistics', label: 'Logistics', icon: 'location' },
        { id: 'roster', label: 'Roster', icon: 'people' },
        { id: 'setlist', label: 'Set List', icon: 'list' },
        { id: 'finance', label: 'Finance', icon: 'cash' },
        { id: 'stageplot', label: 'Stage Plot', icon: 'map' },
    ];

    // Type Selector Options
    const TYPES: { id: AppEventType; label: string; icon: string }[] = [
        { id: 'performance', label: 'Gig', icon: 'mic' }, // Explicit for clarity
        { id: 'lesson', label: 'Lesson', icon: 'school' },
        { id: 'rehearsal', label: 'Rehearsal', icon: 'musical-notes' },
        { id: 'other', label: 'Practice/Other', icon: 'options' },
    ];

    return (
        <View className="flex-1 bg-slate-50">
            {/* Sticky Tab Header */}
            <View className="bg-white border-b border-slate-200 shadow-sm">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 py-2 opacity-90">
                    {Tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as any)}
                            className={`mr-4 px-4 py-3 rounded-xl flex-row items-center transition-all ${activeTab === tab.id ? 'bg-indigo-50 border-b-2 border-indigo-600' : ''}`}
                            style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}
                        >
                            <Ionicons name={tab.icon as any} size={18} color={activeTab === tab.id ? '#4f46e5' : '#64748b'} style={{ marginRight: 8 }} />
                            <Text className={`font-black uppercase tracking-wider text-xs ${activeTab === tab.id ? 'text-indigo-600' : 'text-slate-500'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView className="flex-1 px-6 pt-6" showsVerticalScrollIndicator={false}>

                {/* LOGISTICS TAB */}
                {activeTab === 'logistics' && (
                    <View className="space-y-6 pb-20">
                        {/* Title & Venue */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <View className="flex-row justify-between items-center mb-4">
                                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Event Basics</Text>
                                <Text className="text-xs font-bold text-red-400 uppercase tracking-widest">* Required</Text>
                            </View>

                            {/* Type Switcher */}
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
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

                            <View className="flex-row items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 mb-4">
                                <Ionicons name="text" size={20} color="#64748b" style={{ marginRight: 12 }} />
                                <TextInput
                                    className="flex-1 text-lg font-bold text-slate-800"
                                    placeholder="Event Title"
                                    value={values.title}
                                    onChangeText={(text) => onChange('title', text)}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>

                            <View className="flex-row items-center border border-slate-200 rounded-xl px-4 py-3 bg-slate-50">
                                <Ionicons name="location" size={20} color="#64748b" style={{ marginRight: 12 }} />
                                <TextInput
                                    className="flex-1 text-lg font-bold text-slate-800"
                                    placeholder="Location / Venue"
                                    value={values.venue}
                                    onChangeText={(text) => onChange('venue', text)}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        {/* Date & Time Grid */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <Text className="text-xs font-bold text-slate-400 uppercase mb-4 tracking-widest">Timing</Text>

                            <View className="flex-row gap-4 mb-6">
                                <View className="flex-1">
                                    <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Date</Text>
                                    {Platform.OS === 'web' && (
                                        <WebDatePicker date={values.date} onChange={(d) => onChange('date', d)} />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Start Time</Text>
                                    {Platform.OS === 'web' && (
                                        <WebTimePicker value={values.time} onChange={(t) => onChange('time', t)} />
                                    )}
                                </View>
                            </View>

                            <View>
                                <Text className="text-[10px] font-bold text-slate-400 uppercase mb-2">Duration: {values.duration} mins</Text>
                                <View className="flex-row gap-2 flex-wrap">
                                    {[30, 45, 60, 90, 120, 180, 240].map((dur) => (
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

                        {/* Event Note */}
                        <View className="bg-amber-50 rounded-3xl p-5 shadow-sm border border-amber-100">
                            <Text className="text-xs font-bold text-amber-500 uppercase mb-2 tracking-widest">Internal Notes</Text>
                            <TextInput
                                className="text-amber-900 text-base leading-relaxed h-24"
                                multiline
                                textAlignVertical="top"
                                placeholder="Load-in details, parking info, setlist notes..."
                                placeholderTextColor="#d9770680"
                                value={values.notes}
                                onChangeText={(text) => onChange('notes', text)}
                            />
                        </View>
                    </View>
                )}

                {/* ROSTER TAB */}
                {activeTab === 'roster' && (
                    <RosterEngine
                        slots={values.slots || []}
                        onChange={(newSlots: BookingSlot[]) => onChange('slots', newSlots)}
                        onFormChange={onChange}
                        event={values as any}
                    />
                )}

                {/* SET LIST TAB */}
                {activeTab === 'setlist' && (
                    eventId ? (
                        <SetListBuilder
                            existingSetList={linkedSetList}
                            eventId={eventId}
                            onSave={handleSaveSetList}
                            onCancel={() => setActiveTab('logistics')}
                        />
                    ) : (
                        <View className="bg-amber-50 p-6 rounded-3xl border border-amber-100 items-center">
                            <Ionicons name="alert-circle" size={48} color="#d97706" />
                            <Text className="text-amber-800 font-bold text-lg mt-4 text-center">Save Event First</Text>
                            <Text className="text-amber-700 text-center mt-2">
                                Please save this event to create a set list for it.
                            </Text>
                        </View>
                    )
                )}

                {/* FINANCE TAB */}
                {activeTab === 'finance' && (
                    <FinanceModule values={values as any} onChange={onChange} />
                )}

                {/* STAGE PLOT TAB */}
                {activeTab === 'stageplot' && (
                    <StagePlotConfig values={values as any} onChange={onChange as any} />
                )}

            </ScrollView>
        </View>
    );
}
