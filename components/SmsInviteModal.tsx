import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, Linking, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppEvent, Person, BookingSlot } from '@/store/types';

interface SmsInviteModalProps {
    visible: boolean;
    onClose: () => void;
    event: Partial<AppEvent>;
    musician: Person;
    slot: BookingSlot;
}

export function SmsInviteModal({ visible, onClose, event, musician, slot }: SmsInviteModalProps) {
    const [message, setMessage] = useState('');
    const [selectedPhone, setSelectedPhone] = useState(musician.verifiedPhone || musician.phone || '');

    // Generate initial template
    React.useEffect(() => {
        if (visible) {
            const formatTime = (timeStr: string) => {
                const [hours, minutes] = timeStr.split(':').map(Number);
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const h = hours % 12 || 12;
                return `${h}:${minutes.toString().padStart(2, '0')} ${ampm}`;
            };

            const timeStr = event.time ? formatTime(event.time) : 'TBD';
            const dateStr = event.date ? new Date(event.date).toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }) : 'TBD';
            const venueStr = event.venue || 'TBD';

            const template = `Hi ${musician.firstName}! Are you available to play ${slot.role} for "${event.title}" on ${dateStr} at ${venueStr}? Load-in is ${timeStr}. Let me know!`;
            setMessage(template);
        }
    }, [visible, event, musician, slot]);

    const sendSms = async () => {
        if (!selectedPhone) {
            Alert.alert('No Number', 'This musician does not have a phone number saved.');
            return;
        }

        const url = `sms:${selectedPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
                onClose();
            } else {
                Alert.alert('Error', 'SMS is not supported on this device.');
            }
        } catch (error) {
            console.error('Failed to open SMS:', error);
            Alert.alert('Error', 'Could not open the messaging app.');
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 justify-end">
                <View className="bg-white rounded-t-[40px] p-8 pb-12 shadow-2xl">
                    <View className="flex-row justify-between items-center mb-6">
                        <View>
                            <Text className="text-2xl font-black text-foreground">Invite Musician</Text>
                            <Text className="text-blue-600 font-bold text-xs uppercase tracking-widest mt-1">SMS Template</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#6b7280" />
                        </TouchableOpacity>
                    </View>

                    <View className="bg-blue-50 p-5 rounded-3xl border border-blue-100 mb-6">
                        <View className="flex-row items-center mb-4">
                            <View className="w-12 h-12 rounded-full bg-white items-center justify-center mr-3 shadow-sm">
                                <Text className="text-blue-600 font-black text-lg">{musician.firstName[0]}</Text>
                            </View>
                            <View>
                                <Text className="font-bold text-foreground text-lg">{musician.firstName} {musician.lastName}</Text>
                                <Text className="text-xs text-blue-600 font-medium">{slot.role}</Text>
                            </View>
                        </View>

                        <Text className="text-[10px] uppercase font-black text-blue-400 mb-2 tracking-widest px-1">Recipient Number</Text>
                        <TextInput
                            className="bg-white p-4 rounded-2xl border border-blue-100 font-bold text-foreground mb-4"
                            value={selectedPhone}
                            onChangeText={setSelectedPhone}
                            placeholder="Phone Number"
                            keyboardType="phone-pad"
                        />

                        <Text className="text-[10px] uppercase font-black text-blue-400 mb-2 tracking-widest px-1">Message Content</Text>
                        <TextInput
                            className="bg-white p-5 rounded-2xl border border-blue-100 font-medium text-foreground min-h-[120px]"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={sendSms}
                        className="bg-blue-600 p-5 rounded-3xl flex-row justify-center items-center shadow-lg shadow-blue-400"
                    >
                        <Ionicons name="send" size={20} color="white" />
                        <Text className="text-white font-black text-xl ml-3">Send via SMS</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
