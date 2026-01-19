
import { EventFormValues } from '@/hooks/useEventForm';
import { useContentStore } from '@/store/contentStore';
import { AppEvent, BookingSlot, Person } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';

import uuid from 'react-native-uuid';

interface RosterEngineProps {
    slots: BookingSlot[];
    onChange: (slots: BookingSlot[]) => void;
    // We need parent onChange to sync personnelIds
    onFormChange?: <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => void;
    event: Partial<AppEvent>;
}

export default function RosterEngine({ slots, onChange, onFormChange, event }: RosterEngineProps) {
    const { people, addPerson } = useContentStore();

    // Person Picker State
    const [pickerVisible, setPickerVisible] = useState(false);
    const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

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



    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<BookingSlot>) => {
        const assignedMusician = people.find(p => p.id === item.musicianId);

        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    className={`mb-3 p-4 rounded-2xl border flex-row items-center justify-between ${isActive ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200 shadow-sm'}`}
                >
                    <View className="flex-row items-center flex-1">
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
                    </View>

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
                </TouchableOpacity>
            </ScaleDecorator>
        );
    }, [people]);

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

            {renderPicker()}
        </View>
    );
}
