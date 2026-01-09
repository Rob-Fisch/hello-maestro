import { AppEvent, BookingSlot, BookingStatus, Person } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SmsInviteModal } from './SmsInviteModal';

interface RosterManagerProps {
    slots: BookingSlot[];
    onUpdateSlots: (slots: BookingSlot[]) => void;
    availablePeople: Person[];
    event: Partial<AppEvent>; // Needed for SMS template
    onSave?: (slots?: BookingSlot[]) => void;
}

export function RosterManager({ slots, onUpdateSlots, availablePeople, event, onSave }: RosterManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
    const [tempRole, setTempRole] = useState('');
    const [changingSlotId, setChangingSlotId] = useState<string | null>(null);

    // SMS Invite Modal States
    const [isSmsVisible, setIsSmsVisible] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<BookingSlot | null>(null);
    const [selectedMusician, setSelectedMusician] = useState<Person | null>(null);

    const addSlot = () => {
        if (!newRole.trim()) return;
        const newSlot: BookingSlot = {
            id: Date.now().toString(),
            role: newRole.trim(),
            instruments: [],
            status: 'open',
        };
        const newSlots = [...slots, newSlot];
        onUpdateSlots(newSlots);
        if (onSave) onSave(newSlots);
        setNewRole('');
        setIsAdding(false);
    };

    const startEditingRole = (slot: BookingSlot) => {
        setEditingSlotId(slot.id);
        setTempRole(slot.role);
    };

    const saveRole = () => {
        if (!editingSlotId) return;
        const newSlots = slots.map(s => s.id === editingSlotId ? { ...s, role: tempRole.trim() || s.role } : s);
        onUpdateSlots(newSlots);
        if (onSave) onSave(newSlots);
        setEditingSlotId(null);
        setTempRole('');
    };

    const removeSlot = (id: string) => {
        const proceed = () => {
            const newSlots = slots.filter(s => s.id !== id);
            onUpdateSlots(newSlots);
            if (onSave) onSave(newSlots);
        };

        if (Platform.OS === 'web') {
            if (confirm('Are you sure you want to delete this slot?')) proceed();
        } else {
            Alert.alert(
                'Delete Slot',
                'Are you sure you want to remove this role?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: proceed }
                ]
            );
        }
    };

    const updateSlotStatus = (id: string, status: BookingStatus) => {
        const newSlots = slots.map(s => s.id === id ? { ...s, status } : s);
        onUpdateSlots(newSlots);
        if (onSave) onSave(newSlots);
    };

    const updateSlotFee = (id: string, fee: string) => {
        const newSlots = slots.map(s => s.id === id ? { ...s, fee } : s);
        onUpdateSlots(newSlots);
        if (onSave) onSave(newSlots);
    };

    const assignMusician = (slotId: string, musicianId: string | undefined) => {
        if (!musicianId) {
            // Removal is immediate
            // Removal is immediate
            const newSlots = slots.map(s => s.id === slotId ? {
                ...s,
                musicianId: undefined,
                status: 'open' as const,
                invitedAt: undefined,
                inviteId: undefined // Also clear invite data if unassigning
            } : s);
            onUpdateSlots(newSlots);
            if (onSave) onSave(newSlots);
            return;
        }

        // Immediate Assignment (keep status 'open' until invited, but assign the ID)
        const newSlots = slots.map(s => s.id === slotId ? {
            ...s,
            musicianId,
            status: 'open' as const // Explicitly keep/set to open, presence of musicianId drives UI
        } : s);
        onUpdateSlots(newSlots);
        if (onSave) onSave(newSlots);
    };

    const handleConfirmAssignment = (musicianId: string, inviteData?: { inviteId: string; inviteType: 'inquiry' | 'offer'; inviteExpiresAt?: string }) => {
        if (!selectedSlot) return;

        const newSlots = slots.map(s => s.id === selectedSlot.id ? {
            ...s,
            musicianId,
            status: 'invited' as const,
            invitedAt: new Date().toISOString(),
            ...inviteData
        } : s);

        onUpdateSlots(newSlots);

        // Auto-save the event so the invite ID exists in the cloud immediately!
        if (onSave) {
            console.log('Auto-saving event after invite creation...');
            onSave(newSlots);
        }
    };

    return (
        <View className="mb-8">
            <View className="flex-row justify-end items-center mb-4 px-1">
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
                    <Text className="text-[10px] uppercase font-black text-blue-700 mb-2 tracking-widest px-1">New Booking Role</Text>
                    <View className="flex-row gap-2">
                        <TextInput
                            className="flex-1 bg-white border border-blue-100 p-3 rounded-2xl font-bold text-foreground"
                            placeholder="e.g. Lead Sax, Drums..."
                            placeholderTextColor="#475569"
                            style={{ fontStyle: newRole ? 'normal' : 'italic' }}
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
                            {/* ROW 1: ROLE NAME & DELETE */}
                            <View className="flex-row justify-between items-start mb-3">
                                <View className="flex-1 mr-3">
                                    {editingSlotId === slot.id ? (
                                        <View className="flex-row items-center gap-2">
                                            <TextInput
                                                className="flex-1 bg-white border border-blue-100 p-3 rounded-xl font-bold text-foreground text-base"
                                                value={tempRole}
                                                onChangeText={setTempRole}
                                                autoFocus
                                                onBlur={saveRole}
                                                onSubmitEditing={saveRole}
                                            />
                                            <TouchableOpacity onPress={saveRole} className="bg-blue-600 p-3 rounded-xl shadow-sm">
                                                <Ionicons name="checkmark" size={18} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity onPress={() => startEditingRole(slot)}>
                                            <Text className="text-lg font-black text-foreground uppercase tracking-tight leading-6">{slot.role}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <TouchableOpacity onPress={() => removeSlot(slot.id)} className="p-2 bg-red-50 rounded-xl">
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>

                            {/* ROW 2: STATUS & FEE */}
                            <View className="flex-row justify-between items-center mb-5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                <View className="flex-row items-center">
                                    <View className={`w-2.5 h-2.5 rounded-full mr-2 ${slot.status === 'confirmed' ? 'bg-green-500 shadow-sm shadow-green-200' :
                                        slot.status === 'invited' ? 'bg-amber-500 shadow-sm shadow-amber-200' :
                                            slot.status === 'open' ? (slot.musicianId ? 'bg-purple-500 shadow-sm shadow-purple-200' : 'bg-blue-500 shadow-sm shadow-blue-200') : 'bg-red-500'
                                        }`} />
                                    <Text className="text-[10px] font-black uppercase text-slate-500 tracking-widest">
                                        {slot.status === 'open' && slot.musicianId ? 'Assigned' : slot.status}
                                    </Text>
                                </View>

                                <View className="bg-white border border-slate-200 flex-row items-center px-3 py-2 rounded-xl shadow-sm">
                                    <Text className="text-slate-400 font-bold text-sm mr-1">$</Text>
                                    <TextInput
                                        className="text-slate-900 font-black text-sm w-20 text-right p-0"
                                        placeholder={event.musicianFee || '0'}
                                        placeholderTextColor="#94a3b8"
                                        value={slot.fee || ''}
                                        onChangeText={(val) => updateSlotFee(slot.id, val)}
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>

                            {musician ? (
                                <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    {/* Musician Info Row - Full Width */}
                                    <View className="flex-row items-center mb-3">
                                        <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3 shadow-sm border border-white">
                                            <Text className="text-blue-600 font-bold">{musician.firstName[0]}{musician.lastName[0]}</Text>
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-bold text-foreground text-base">{musician.firstName} {musician.lastName}</Text>
                                            <Text className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{musician.instruments.join(', ') || musician.type}</Text>
                                        </View>
                                    </View>

                                    {/* Action Buttons Container - Explicit Vertical Stack Below Name */}
                                    <View className="flex-col gap-2">
                                        {/* Row 1: Status Actions (Invite, Confirm, etc) */}
                                        {(slot.status === 'invited' || slot.status === 'declined' || (slot.status === 'open' && slot.musicianId)) && (
                                            <View className="flex-row gap-2">
                                                {(slot.status === 'invited' || (slot.status === 'open' && slot.musicianId)) && (
                                                    <>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                setSelectedMusician(musician);
                                                                setSelectedSlot(slot);
                                                                setIsSmsVisible(true);
                                                            }}
                                                            className="bg-amber-100 px-3 py-2 rounded-xl flex-row items-center shadow-sm flex-1 justify-center"
                                                        >
                                                            <Ionicons name="mail-outline" size={16} color="#d97706" />
                                                            <Text className="text-amber-700 font-bold text-[10px] ml-1.5 uppercase">Invite</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity
                                                            onPress={() => updateSlotStatus(slot.id, 'confirmed')}
                                                            className="bg-green-100 px-3 py-2 rounded-xl flex-row items-center shadow-sm flex-1 justify-center"
                                                        >
                                                            <Ionicons name="checkmark" size={16} color="#16a34a" />
                                                            <Text className="text-green-700 font-bold text-[10px] ml-1.5 uppercase">Confirm</Text>
                                                        </TouchableOpacity>
                                                    </>
                                                )}
                                                {slot.status === 'declined' && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setSelectedMusician(musician);
                                                            setSelectedSlot(slot);
                                                            setIsSmsVisible(true);
                                                        }}
                                                        className="bg-red-50 px-3 py-2 rounded-xl flex-row items-center border border-red-100 flex-1 justify-center shadow-sm"
                                                    >
                                                        <Ionicons name="refresh" size={16} color="#ef4444" />
                                                        <Text className="text-red-600 font-bold text-[10px] ml-1.5 uppercase">Re-Invite</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}

                                        {/* Row 2: Management Actions (Replace, Clear) */}
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={() => setChangingSlotId(slot.id)}
                                                className="bg-indigo-50 px-3 py-2 rounded-xl flex-row items-center flex-1 justify-center border border-indigo-100 shadow-sm"
                                            >
                                                <Ionicons name="swap-horizontal-outline" size={16} color="#4338ca" />
                                                <Text className="text-indigo-700 font-bold text-[10px] ml-1.5 uppercase">Replace</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => assignMusician(slot.id, undefined)}
                                                className="bg-slate-100 px-4 py-2 rounded-xl flex-row items-center border border-slate-200 shadow-sm"
                                            >
                                                <Ionicons name="close" size={18} color="#64748b" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            ) : null}

                            {(!musician || changingSlotId === slot.id) && (
                                <View className={musician ? "mt-4 border-t border-gray-100 pt-4" : ""}>
                                    <View className="flex-row justify-between items-center mb-3 px-1">
                                        <Text className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">{musician ? 'Replace With' : 'Assign Musician'}</Text>
                                        {changingSlotId === slot.id && (
                                            <TouchableOpacity onPress={() => setChangingSlotId(null)}>
                                                <Text className="text-blue-600 font-bold text-[10px] uppercase">Cancel</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                        {availablePeople
                                            .filter(p => p.id !== slot.musicianId)
                                            .filter(p => {
                                                const slotRole = slot.role.toLowerCase();
                                                // Strict Filter: Must have matching instrument tag OR matching single instrument
                                                return p.instruments?.some(i => i.toLowerCase().includes(slotRole))
                                                    || p.instrument?.toLowerCase().includes(slotRole);
                                            })
                                            .map(person => (
                                                <TouchableOpacity
                                                    key={person.id}
                                                    onPress={() => {
                                                        assignMusician(slot.id, person.id);
                                                        setChangingSlotId(null);
                                                    }}
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
                    onClose={() => {
                        setIsSmsVisible(false);
                        setSelectedSlot(null);
                        setSelectedMusician(null);
                    }}
                    onConfirm={(mid, inviteData) => {
                        handleConfirmAssignment(mid, inviteData);
                        setChangingSlotId(null);
                    }}
                    event={event}
                    musician={selectedMusician}
                    slot={selectedSlot}
                />
            )}
        </View>
    );
}

