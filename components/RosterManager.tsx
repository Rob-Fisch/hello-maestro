import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BookingSlot, Person, BookingStatus, AppEvent } from '@/store/types';
import { SmsInviteModal } from './SmsInviteModal';

interface RosterManagerProps {
    slots: BookingSlot[];
    onUpdateSlots: (slots: BookingSlot[]) => void;
    availablePeople: Person[];
    event: Partial<AppEvent>; // Needed for SMS template
}

export function RosterManager({ slots, onUpdateSlots, availablePeople, event }: RosterManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newRole, setNewRole] = useState('');

    // SMS Invite Modal States
    const [isSmsVisible, setIsSmsVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [selectedMusician, setSelectedMusician] = useState<Person | null>(null);


    const addSlot = () => {
        if (!newRole.trim()) return;
        const newSlot: BookingSlot = {
            id: Date.now().toString(),
            role: newRole.trim(),
            instruments: [], // Could be expanded later
            status: 'open',
        };
        onUpdateSlots([...slots, newSlot]);
        setNewRole('');
        setIsAdding(false);
    };

    const removeSlot = (id: string) => {
        onUpdateSlots(slots.filter(s => s.id !== id));
    };

    const updateSlotStatus = (id: string, status: BookingStatus) => {
        onUpdateSlots(slots.map(s => s.id === id ? { ...s, status } : s));
    };

    const updateSlotFee = (id: string, fee: string) => {
        onUpdateSlots(slots.map(s => s.id === id ? { ...s, fee } : s));
    };

    const assignMusician = (slotId: string, musicianId: string | undefined) => {
        const musician = availablePeople.find(p => p.id === musicianId);
        const slot = slots.find(s => s.id === slotId);

        onUpdateSlots(slots.map(s => s.id === slotId ? {
            ...s,
            musicianId,
            status: musicianId ? 'invited' : 'open',
            invitedAt: musicianId ? new Date().toISOString() : undefined
        } : s));

        if (musician && slot) {
            setSelectedMusician(musician);
            setSelectedSlot({ ...slot, musicianId, status: 'invited' });
            setIsSmsVisible(true);
        }
    };


    return (
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4 px-1">
                <Text className="text-xl font-bold tracking-tight text-foreground">Personnel Roster</Text>
                <TouchableOpacity
                    onPress={() => setIsAdding(true)}
                    className="flex-row items-center bg-blue-50 px-3 py-1.5 rounded-full"
                >
                    <Ionicons name="add-circle-outline" size={16} color="#2563eb" />
                    <Text className="text-blue-600 font-bold text-xs ml-1.5">Add Slot</Text>
                </TouchableOpacity>
            </View>

            {isAdding && (
                <View className="bg-blue-50 p-4 rounded-3xl border border-blue-100 mb-4 animate-in fade-in slide-in-from-top-2">
                    <Text className="text-[10px] uppercase font-black text-blue-600 mb-2 tracking-widest px-1">New Booking Role</Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            className="flex-1 bg-white border border-blue-100 p-3 rounded-2xl font-bold text-foreground"
                            placeholder="e.g. Lead Sax, Drums..."
                            value={newRole}
                            onChangeText={setNewRole}
                            autoFocus
                        />
                        <TouchableOpacity
                            onPress={addSlot}
                            className="bg-blue-600 px-5 rounded-2xl items-center justify-center"
                        >
                            <Text className="text-white font-black">Add</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setIsAdding(false)}
                            className="bg-gray-200 px-4 rounded-2xl items-center justify-center"
                        >
                            <Ionicons name="close" size={20} color="#6b7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {slots.length === 0 ? (
                <View className="border-2 border-dashed border-blue-100 bg-blue-50/20 rounded-[40px] p-10 items-center">
                    <Ionicons name="people-outline" size={32} color="#93c5fd" />
                    <Text className="text-blue-400 font-bold text-center mt-3">No slots defined yet.</Text>
                    <Text className="text-blue-300 text-[10px] font-medium mt-1">Add roles like "Piano" or "Vocals" to start booking.</Text>
                </View>
            ) : (
                slots.map((slot) => {
                    const musician = availablePeople.find(p => p.id === slot.musicianId);

                    return (
                        <View key={slot.id} className="bg-card border border-border rounded-[32px] mb-4 p-5 shadow-sm">
                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <Text className="text-sm font-black text-foreground uppercase tracking-tight">{slot.role}</Text>
                                    <View className="flex-row items-center mt-1">
                                        <View className={`w-2 h-2 rounded-full mr-2 ${slot.status === 'confirmed' ? 'bg-green-500' :
                                            slot.status === 'invited' ? 'bg-amber-500' :
                                                slot.status === 'open' ? 'bg-blue-500' : 'bg-red-500'
                                            }`} />
                                        <Text className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{slot.status}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    <View className="bg-blue-50/50 border border-blue-100 flex-row items-center px-3 py-1.5 rounded-2xl">
                                        <Text className="text-blue-600 font-black text-xs mr-2">$</Text>
                                        <TextInput
                                            className="text-foreground font-black text-xs min-w-[40px]"
                                            placeholder={event.musicianFee || '0'}
                                            placeholderTextColor="#94a3b8"
                                            value={slot.fee || ''}
                                            onChangeText={(val) => updateSlotFee(slot.id, val)}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <TouchableOpacity onPress={() => removeSlot(slot.id)} className="p-1 opacity-20">
                                        <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {musician ? (
                                <View className="flex-row items-center bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3 shadow-sm border border-white">
                                        <Text className="text-blue-600 font-bold">{musician.firstName[0]}{musician.lastName[0]}</Text>
                                    </View>
                                    <View className="flex-1">
                                        <Text className="font-bold text-foreground">{musician.firstName} {musician.lastName}</Text>
                                        <Text className="text-[10px] text-muted-foreground">{musician.instruments.join(', ') || musician.type}</Text>
                                    </View>
                                    <View className="flex-row gap-2">
                                        {slot.status === 'invited' && (
                                            <>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        setSelectedMusician(musician);
                                                        setSelectedSlot(slot);
                                                        setIsSmsVisible(true);
                                                    }}
                                                    className="bg-amber-100 p-2 rounded-full"
                                                >
                                                    <Ionicons name="mail-outline" size={16} color="#d97706" />
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={() => updateSlotStatus(slot.id, 'confirmed')}
                                                    className="bg-green-100 p-2 rounded-full"
                                                >
                                                    <Ionicons name="checkmark" size={16} color="#16a34a" />
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => assignMusician(slot.id, undefined)}
                                            className="bg-gray-200 p-2 rounded-full"
                                        >
                                            <Ionicons name="person-remove-outline" size={16} color="#4b5563" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View>
                                    <Text className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest px-1">Assign Musician</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                        {availablePeople.map(person => (
                                            <TouchableOpacity
                                                key={person.id}
                                                onPress={() => assignMusician(slot.id, person.id)}
                                                className="bg-white border border-gray-100 px-4 py-3 rounded-2xl flex-row items-center shadow-xs"
                                            >
                                                <Text className="font-bold text-foreground text-xs">{person.firstName} {person.lastName}</Text>
                                            </TouchableOpacity>
                                        ))}
                                        {availablePeople.length === 0 && (
                                            <Text className="text-xs text-muted-foreground italic">No musicians in your Library yet.</Text>
                                        )}
                                    </ScrollView>
                                </View>
                            )}
                        </View>
                    );
                })
            )}

            {selectedSlot && selectedMusician && (
                <SmsInviteModal
                    visible={isSmsVisible}
                    onClose={() => setIsSmsVisible(false)}
                    event={event}
                    musician={selectedMusician}
                    slot={selectedSlot}
                />
            )}
        </View>
    );
}

