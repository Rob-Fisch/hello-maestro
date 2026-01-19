
import { EventFormValues } from '@/hooks/useEventForm';
import { useContentStore } from '@/store/contentStore';
import { AppEvent, BookingSlot, Person } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Share, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import uuid from 'react-native-uuid';

interface RosterEngineProps {
    slots: BookingSlot[];
    onChange: (slots: BookingSlot[]) => void;
    // We need parent onChange to sync personnelIds
    onFormChange?: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
    event: Partial<AppEvent>;
    eventId?: string;
}

export default function RosterEngine({ slots, onChange, onFormChange, event, eventId }: RosterEngineProps) {
    const { people, addPerson } = useContentStore();

    // Person Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Messaging State
    const [selectedSlotIds, setSelectedSlotIds] = useState<Set<string>>(new Set());
    const [customMessage, setCustomMessage] = useState('');

    // Derived Logic

    const filteredPeople = useMemo(() => {
        if (!searchQuery) return people;
        const q = searchQuery.toLowerCase();
        return people.filter(p =>
            p.firstName.toLowerCase().includes(q) ||
            p.lastName.toLowerCase().includes(q) ||
            p.email?.toLowerCase().includes(q) ||
            (p.instruments || []).some(i => i.toLowerCase().includes(q))
        );
    }, [people, searchQuery]);

    const handleAddSlot = (role: string = 'Musician') => {
        const newSlot: BookingSlot = {
            id: uuid.v4() as string,
            role,
            status: 'open',
            instruments: [],
            fee: '',
        };
        const newSlots = [...slots, newSlot];
        onChange(newSlots);
        if (onFormChange) {
            const ids = newSlots.map(s => s.musicianId).filter((id): id is string => !!id);
            onFormChange('personnelIds', ids);
        }
    };

    const handleRemoveSlot = (id: string) => {
        const newSlots = slots.filter(s => s.id !== id);
        onChange(newSlots);
        // Also remove from selection
        setSelectedSlotIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        if (onFormChange) {
            const ids = newSlots.map(s => s.musicianId).filter((id): id is string => !!id);
            onFormChange('personnelIds', ids);
        }
    };

    const handleAssignClick = (slotId: string) => {
        setActiveSlotId(slotId);
        setPickerVisible(true);
    };

    const handleSelectPerson = (person: Person) => {
        if (!activeSlotId) return;
        // Simplified: assign immediately, no invite modal
        updateSlot(activeSlotId, { musicianId: person.id, status: 'confirmed' });
        setPickerVisible(false);
        setActiveSlotId(null);
        setSearchQuery('');
    };

    const handleCreatePerson = () => {
        if (!searchQuery.trim()) return;
        // Basic name parsing
        const parts = searchQuery.trim().split(' ');
        const firstName = parts[0];
        const lastName = parts.slice(1).join(' ') || '';

        const newPerson: Person = {
            id: Date.now().toString(),
            firstName,
            lastName,
            email: '',
            phone: '',
            type: 'musician',
            instruments: [],
            source: 'maestro',
            createdAt: new Date().toISOString()
        };
        addPerson(newPerson);
        handleSelectPerson(newPerson);
    }

    const updateSlot = (id: string, updates: Partial<BookingSlot>) => {
        const newSlots = slots.map(s => s.id === id ? { ...s, ...updates } : s);
        onChange(newSlots);
        if (onFormChange && (updates.musicianId !== undefined)) {
            const ids = newSlots.map(s => s.musicianId).filter((id): id is string => !!id);
            onFormChange('personnelIds', ids);
        }
    };

    // Toggle slot selection for messaging
    const toggleSlotSelection = (slotId: string) => {
        setSelectedSlotIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(slotId)) {
                newSet.delete(slotId);
            } else {
                newSet.add(slotId);
            }
            return newSet;
        });
    };

    // Get selected musicians with contact info
    const selectedMusicians = useMemo(() => {
        return slots
            .filter(s => selectedSlotIds.has(s.id) && s.musicianId)
            .map(s => {
                const person = people.find(p => p.id === s.musicianId);
                return person ? { slot: s, person } : null;
            })
            .filter((item): item is { slot: BookingSlot; person: Person } => item !== null);
    }, [selectedSlotIds, slots, people]);

    // Check if Performer Page sharing is enabled
    const isPerformerPageEnabled = event.isPerformerPageEnabled === true;
    const performerLink = (eventId && isPerformerPageEnabled) ? `https://opusmode.net/performer/${eventId}` : '';

    // Build share message
    const buildShareMessage = () => {
        const parts = [];

        if (customMessage.trim()) {
            parts.push(customMessage.trim());
        }

        if (performerLink) {
            parts.push(`\nGig Details: ${performerLink}`);
        }

        return parts.join('\n');
    };

    // Handle share action
    const handleShare = async () => {
        const message = buildShareMessage();

        if (!message.trim()) {
            Alert.alert('No Message', 'Please enter a message to send.');
            return;
        }

        const recipientNames = selectedMusicians.map(m => m.person.firstName).join(', ');

        try {
            await Share.share({
                message,
                title: `Message to ${recipientNames}`
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<BookingSlot>) => {
        const assignedMusician = people.find(p => p.id === item.musicianId);
        const isSelected = selectedSlotIds.has(item.id);

        return (
            <ScaleDecorator>
                <View
                    className={`mb-3 p-4 rounded-2xl border flex-row items-center justify-between ${isActive ? 'bg-indigo-50 border-indigo-200' : isSelected ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                    {/* Checkbox for messaging - only show if musician assigned */}
                    {assignedMusician && (
                        <TouchableOpacity
                            onPress={() => toggleSlotSelection(item.id)}
                            className={`w-8 h-8 rounded-lg border-2 items-center justify-center mr-3 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}
                        >
                            {isSelected && <Ionicons name="checkmark" size={18} color="white" />}
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        onLongPress={drag}
                        disabled={isActive}
                        className="flex-row items-center flex-1"
                    >
                        {/* Drag Handle */}
                        <TouchableOpacity onPressIn={drag} className="mr-3 p-2">
                            <Ionicons name="filter" size={16} color="#cbd5e1" />
                        </TouchableOpacity>

                        {/* Slot Info - EDITABLE ROLE */}
                        <View className="flex-1 mr-2">
                            <TextInput
                                value={item.role}
                                onChangeText={(text) => updateSlot(item.id, { role: text })}
                                className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-1 p-0"
                                placeholder="ROLE / INSTRUMENT"
                                placeholderTextColor="#cbd5e1"
                            />

                            {assignedMusician ? (
                                <TouchableOpacity onPress={() => handleAssignClick(item.id)}>
                                    <Text className="text-lg font-bold text-slate-800">{assignedMusician.firstName} {assignedMusician.lastName}</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => handleAssignClick(item.id)}>
                                    <Text className="text-lg font-bold text-slate-300 italic">Select Contact...</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>

                    {/* Actions - Just trash icon now */}
                    <View className="flex-row items-center gap-2">
                        {!assignedMusician && (
                            <TouchableOpacity
                                onPress={() => handleAssignClick(item.id)}
                                className="w-10 h-10 rounded-full bg-slate-50 items-center justify-center border border-slate-200"
                            >
                                <Ionicons name="person-add" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={() => handleRemoveSlot(item.id)} className="w-10 h-10 rounded-full bg-red-50 items-center justify-center border border-red-100">
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScaleDecorator>
        );
    }, [people, selectedSlotIds]);

    // PERSON PICKER MODAL
    const renderPicker = () => (
        <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={() => setPickerVisible(false)}>
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-3xl h-[80%] p-6">
                    <View className="flex-row justify-between items-center mb-6">
                        <Text className="text-xl font-black text-slate-900">Select Contact</Text>
                        <TouchableOpacity onPress={() => setPickerVisible(false)} className="p-2 bg-slate-100 rounded-full">
                            <Ionicons name="close" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-4 text-base font-bold"
                        placeholder="Search or Add New Name..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                    />

                    <FlatList
                        data={filteredPeople}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => handleSelectPerson(item)}
                                className="flex-row items-center p-4 border-b border-slate-100"
                            >
                                <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-4">
                                    <Text className="font-bold text-indigo-600">{item.firstName[0]}{item.lastName[0]}</Text>
                                </View>
                                <View>
                                    <Text className="text-base font-bold text-slate-800">{item.firstName} {item.lastName}</Text>
                                    <Text className="text-xs text-slate-500">{(item.instruments || []).join(', ') || 'Musician'}</Text>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={() => (
                            <TouchableOpacity onPress={handleCreatePerson} className="p-6 items-center">
                                <Text className="text-slate-400 mb-2">No contacts found.</Text>
                                {searchQuery.trim().length > 0 && (
                                    <Text className="text-indigo-600 font-bold">Tap to create "{searchQuery}"</Text>
                                )}
                            </TouchableOpacity>
                        )}
                    />
                </View>
            </View>
        </Modal>
    );

    return (
        <View className="pb-20">
            <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Personnel</Text>
                <TouchableOpacity onPress={() => handleAddSlot()} className="flex-row items-center">
                    <Ionicons name="add-circle" size={20} color="#4f46e5" />
                    <Text className="text-indigo-600 font-bold ml-1">Add Slot</Text>
                </TouchableOpacity>
            </View>

            <DraggableFlatList
                data={slots}
                onDragEnd={({ data }) => onChange(data)}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                containerStyle={{ minHeight: 100 }}
            />

            {/* Messaging Section - Appears when any slots selected */}
            {selectedSlotIds.size > 0 && (
                <View className="mt-6 p-4 bg-indigo-50 rounded-2xl border border-indigo-200">
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                            Message {selectedSlotIds.size} {selectedSlotIds.size === 1 ? 'Person' : 'People'}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedSlotIds(new Set())}>
                            <Text className="text-xs text-slate-500 font-medium">Clear Selection</Text>
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        className="bg-white p-4 rounded-xl border border-indigo-100 text-slate-800 font-medium min-h-[80px] mb-3"
                        value={customMessage}
                        onChangeText={setCustomMessage}
                        multiline
                        textAlignVertical="top"
                        placeholder={performerLink ? "Type your message... (Performer Page link will be added)" : "Type your message..."}
                        placeholderTextColor="#94a3b8"
                    />

                    {performerLink ? (
                        <Text className="text-xs text-emerald-600 mb-3">
                            ✅ Performer Page link will be included with this message
                        </Text>
                    ) : (
                        <Text className="text-xs text-slate-500 mb-3">
                            📎 If Performer Page is enabled for this event (Sharing tab), the link will be included
                        </Text>
                    )}

                    <TouchableOpacity
                        onPress={handleShare}
                        className="bg-indigo-600 p-4 rounded-xl flex-row items-center justify-center shadow-sm"
                    >
                        <Ionicons name="share-outline" size={20} color="white" />
                        <Text className="text-white font-bold ml-2">Share Message</Text>
                    </TouchableOpacity>
                </View>
            )}

            {renderPicker()}
        </View>
    );
}
