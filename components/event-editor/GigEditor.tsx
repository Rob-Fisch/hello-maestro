
import { EventFormValues } from '@/hooks/useEventForm';
import { useContentStore } from '@/store/contentStore';
import { AppEventType, BookingSlot, SetList } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';
import SetListBuilder from '../setlist/SetListBuilder';
import FinanceModule from './FinanceModule';
import { WebDatePicker, WebTimePicker } from './FormComponents';
import PerformanceSharingConfig from './PerformanceSharingConfig';
import RosterEngine from './RosterEngine';

interface GigEditorProps {
    values: EventFormValues;
    eventId?: string;
    onChange: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
    isSaving: boolean;
    initialTab?: 'logistics' | 'roster' | 'finance' | 'sharing' | 'setlist';
}

export default function GigEditor({ values, eventId, onChange, isSaving, initialTab }: GigEditorProps) {
    const { setLists, addSetList, updateSetList } = useContentStore();
    const linkedSetList = eventId ? setLists.find(sl => sl.eventId === eventId) : undefined;
    const [activeTab, setActiveTab] = useState<'logistics' | 'roster' | 'finance' | 'sharing' | 'setlist'>(initialTab || 'logistics');

    // Import Setlist Logic
    const [showImportModal, setShowImportModal] = useState(false);
    // Filter for Master Setlists (no eventId)
    // Note: In a real app we might want to fetch this only when modal opens or have it in store
    const { setLists: allSetLists } = useContentStore();
    const masterSetLists = allSetLists.filter(sl => !sl.eventId && !sl.deletedAt);

    const handleImport = (masterList: SetList) => {
        // Create a copy (Fork)
        const newSetList: SetList = {
            id: uuid.v4() as string,
            title: masterList.title, // Keep same name initially
            eventId: eventId,
            originalSetListId: masterList.id,
            items: masterList.items.map(item => ({ ...item, id: uuid.v4() as string })), // New IDs for items
            createdAt: new Date().toISOString()
        };
        // Close modal FIRST, then save (so alert appears after modal is gone)
        setShowImportModal(false);
        handleSaveSetList(newSetList);
    };

    const handleSaveSetList = (setList: SetList) => {
        if (linkedSetList) {
            updateSetList(linkedSetList.id, setList);
            // alert('Set List Updated'); // REMOVED: Too noisy for minor updates
        } else {
            addSetList({ ...setList, eventId });
            // Subtle feedback instead of alert, or just nothing as the UI will update
            alert('Set List Linked');
        }
    };

    const Tabs = [
        { id: 'logistics', label: 'Logistics', icon: 'location' },
        { id: 'roster', label: 'Contacts', icon: 'people' },
        { id: 'setlist', label: 'Set List', icon: 'list' },
        { id: 'sharing', label: 'Sharing', icon: 'share-social' },
    ];

    // Type Selector Options
    const TYPES: { id: AppEventType; label: string; icon: string }[] = [
        { id: 'performance', label: 'Gig', icon: 'mic' }, // Explicit for clarity
        { id: 'lesson', label: 'Lesson', icon: 'school' },
        { id: 'rehearsal', label: 'Rehearsal', icon: 'musical-notes' },
        { id: 'other', label: 'Practice/Other', icon: 'options' },
    ];

    // Tab Navigation Helper
    const TabNavigation = ({ currentTab }: { currentTab: string }) => {
        const currentIndex = Tabs.findIndex(t => t.id === currentTab);
        const prevTab = currentIndex > 0 ? Tabs[currentIndex - 1] : null;
        const nextTab = currentIndex < Tabs.length - 1 ? Tabs[currentIndex + 1] : null;

        return (
            <View className="flex-row justify-between items-center mt-8 mb-4 pt-6 border-t border-slate-200">
                {prevTab ? (
                    <TouchableOpacity
                        onPress={() => setActiveTab(prevTab.id as any)}
                        className="flex-row items-center px-4 py-3 bg-slate-100 rounded-xl"
                    >
                        <Ionicons name="chevron-back" size={18} color="#4f46e5" />
                        <Text className="text-indigo-600 font-bold ml-1">← {prevTab.label}</Text>
                    </TouchableOpacity>
                ) : <View />}

                {nextTab ? (
                    <TouchableOpacity
                        onPress={() => setActiveTab(nextTab.id as any)}
                        className="flex-row items-center px-4 py-3 bg-indigo-600 rounded-xl"
                    >
                        <Text className="text-white font-bold mr-1">{nextTab.label} →</Text>
                        <Ionicons name="chevron-forward" size={18} color="white" />
                    </TouchableOpacity>
                ) : <View />}
            </View>
        );
    };

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

                        {/* Structured Venue Address (Optional) */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <Text className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">
                                Full Venue Address (Optional)
                            </Text>
                            <Text className="text-slate-500 text-xs mb-4">
                                Add a complete address for map links and directions
                            </Text>

                            {/* Street Address */}
                            <TextInput
                                className="border border-slate-200 rounded-xl px-4 py-3 mb-3 bg-slate-50 text-slate-800"
                                placeholder="Street Address"
                                value={values.venueAddressLine1}
                                onChangeText={(text) => onChange('venueAddressLine1', text)}
                                placeholderTextColor="#94a3b8"
                            />

                            {/* Address Line 2 */}
                            <TextInput
                                className="border border-slate-200 rounded-xl px-4 py-3 mb-3 bg-slate-50 text-slate-800"
                                placeholder="Apt, Suite, etc. (optional)"
                                value={values.venueAddressLine2}
                                onChangeText={(text) => onChange('venueAddressLine2', text)}
                                placeholderTextColor="#94a3b8"
                            />

                            {/* City, State, Zip row */}
                            <View className="flex-row gap-2 mb-3">
                                <TextInput
                                    className="flex-1 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800"
                                    placeholder="City"
                                    value={values.venueCity}
                                    onChangeText={(text) => onChange('venueCity', text)}
                                    placeholderTextColor="#94a3b8"
                                />
                                <TextInput
                                    className="w-20 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800"
                                    placeholder="State"
                                    value={values.venueStateProvince}
                                    onChangeText={(text) => onChange('venueStateProvince', text)}
                                    placeholderTextColor="#94a3b8"
                                />
                                <TextInput
                                    className="w-24 border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 text-slate-800"
                                    placeholder="Zip"
                                    value={values.venuePostalCode}
                                    onChangeText={(text) => onChange('venuePostalCode', text)}
                                    placeholderTextColor="#94a3b8"
                                />
                            </View>
                        </View>

                        {/* Performer Logistics (Optional) */}
                        <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                            <Text className="text-xs font-bold text-slate-400 uppercase mb-2 tracking-widest">
                                Performer Logistics (Optional)
                            </Text>
                            <Text className="text-slate-500 text-xs mb-4">
                                Share load-in and soundcheck times with your ensemble
                            </Text>

                            <View className="flex-row gap-4">
                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
                                        Load-In Time
                                    </Text>
                                    {Platform.OS === 'web' && (
                                        <WebTimePicker
                                            value={values.loadInTime || ''}
                                            onChange={(t) => onChange('loadInTime', t)}
                                        />
                                    )}
                                </View>

                                <View className="flex-1">
                                    <Text className="text-xs font-bold text-slate-400 uppercase mb-2">
                                        Soundcheck Time
                                    </Text>
                                    {Platform.OS === 'web' && (
                                        <WebTimePicker
                                            value={values.soundcheckTime || ''}
                                            onChange={(t) => onChange('soundcheckTime', t)}
                                        />
                                    )}
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

                        {/* Tab Navigation */}
                        <TabNavigation currentTab="logistics" />
                    </View>
                )}

                {activeTab === 'roster' && (
                    <View>
                        <RosterEngine
                            slots={values.slots || []}
                            onChange={(newSlots: BookingSlot[]) => onChange('slots', newSlots)}
                            onFormChange={onChange}
                            event={values as any}
                            eventId={eventId}
                        />
                        <TabNavigation currentTab="roster" />
                    </View>
                )}

                {/* SET LIST TAB - EMPTY STATE ONLY */}
                {/* The actual SetListBuilder is now rendered outside the ScrollView */}
                {activeTab === 'setlist' && !eventId && (
                    <View className="bg-amber-50 p-6 rounded-3xl border border-amber-100 items-center">
                        <Ionicons name="alert-circle" size={48} color="#d97706" />
                        <Text className="text-amber-800 font-bold text-lg mt-4 text-center">Save Event First</Text>
                        <Text className="text-amber-700 text-center mt-2">
                            Please save this event to create a set list for it.
                        </Text>
                    </View>
                )}

                {/* IMPORT SETLIST MODAL TRIGGER (Only if eventId exists but no setlist linked yet) */}
                {activeTab === 'setlist' && eventId && !linkedSetList && (
                    <View className="items-center justify-center py-10">
                        <View className="mb-6 items-center">
                            <Ionicons name="list" size={64} color="#e2e8f0" />
                            <Text className="text-slate-400 font-bold text-lg mt-4">No Set List Yet</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => setShowImportModal(true)}
                            className="bg-indigo-600 px-6 py-4 rounded-xl flex-row items-center mb-4 shadow-sm w-full max-w-xs justify-center"
                        >
                            <Ionicons name="download-outline" size={20} color="white" style={{ marginRight: 8 }} />
                            <Text className="text-white font-bold text-base">Import from Library</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                // Default create new empty
                                addSetList({
                                    id: uuid.v4() as string,
                                    title: `${values.title} Set List`,
                                    eventId: eventId,
                                    items: [],
                                    createdAt: new Date().toISOString()
                                });
                            }}
                            className="bg-white border border-slate-200 px-6 py-4 rounded-xl flex-row items-center w-full max-w-xs justify-center"
                        >
                            <Ionicons name="add-circle-outline" size={20} color="#64748b" style={{ marginRight: 8 }} />
                            <Text className="text-slate-600 font-bold text-base">Create from Scratch</Text>
                        </TouchableOpacity>

                        <TabNavigation currentTab="setlist" />
                    </View>
                )}

                {/* FINANCE TAB */}
                {activeTab === 'finance' && (
                    <FinanceModule values={values as any} onChange={onChange} />
                )}

                {/* SHARING TAB (Performance Promo + Performer Page) */}
                {activeTab === 'sharing' && (
                    <View>
                        <PerformanceSharingConfig values={values as any} onChange={onChange as any} eventId={eventId} />
                        <TabNavigation currentTab="sharing" />
                    </View>
                )}

            </ScrollView>

            {/* FULL SCREEN SETLIST BUILDER - Modal to cover parent header */}
            <Modal
                visible={activeTab === 'setlist' && !!eventId && !!linkedSetList}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={() => setActiveTab('logistics')}
            >
                {/* Wrap in View to handle safe areas if needed, but builder handles it mostly */}
                <View className="flex-1 bg-white">
                    {/* Safe fallback for dismiss if builder crashes or something */}
                    {linkedSetList && (
                        <SetListBuilder
                            existingSetList={linkedSetList}
                            eventId={eventId}
                            onSave={(sl) => {
                                handleSaveSetList(sl);
                                // Don't close immediately? Or do we? 
                                // The builder has a Save button. 
                                // Usually users expect to stay in editor *or* save and close.
                                // Existing logic was in-place editor. 
                                // Let's keep it open to allow multiple edits, or close? 
                                // The User's previous flow was "Save" -> Alert "Set List Updated".
                                // If it's a modal, usually Save closes it. 
                                // But let's check SetListBuilder logic. It calls onSave.
                                // I will stick to current behavior: Alert, stay open? 
                                // Actually better UX for Modal is Save & Close.
                                // Let's try closing after save for better flow.
                                // setActiveTab('logistics'); // Optional: redirect back to tabs
                            }}
                            onCancel={() => setActiveTab('logistics')}
                        />
                    )}
                </View>
            </Modal>
            {/* IMPORT MODAL */}
            <Modal visible={showImportModal} animationType="fade" transparent>
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white w-full max-w-md rounded-2xl overflow-hidden max-h-[80%]">
                        <View className="p-4 border-b border-slate-100 flex-row justify-between items-center">
                            <Text className="font-bold text-lg">Import Set List</Text>
                            <TouchableOpacity onPress={() => setShowImportModal(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={masterSetLists}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ padding: 16 }}
                            ListEmptyComponent={
                                <Text className="text-center text-slate-500 py-8">No templates found in Library.</Text>
                            }
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleImport(item)}
                                    className="p-4 border border-slate-200 rounded-xl mb-3 bg-slate-50 hover:bg-slate-100 active:bg-slate-200"
                                >
                                    <View className="flex-row items-center">
                                        <Ionicons name="document-text-outline" size={20} color="#4f46e5" style={{ marginRight: 12 }} />
                                        <View>
                                            <Text className="font-bold text-slate-800">{item.title}</Text>
                                            <Text className="text-xs text-slate-500">{item.items.length} items</Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
