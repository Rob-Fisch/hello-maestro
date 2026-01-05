import { AppEvent, BookingSlot, Person } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Linking, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SmsInviteModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (musicianId: string, inviteData?: { inviteId: string; inviteType: 'inquiry' | 'offer'; inviteExpiresAt?: string }) => void;
    event: Partial<AppEvent>;
    musician: Person;
    slot: BookingSlot;
}

export function SmsInviteModal({ visible, onClose, onConfirm, event, musician, slot }: SmsInviteModalProps) {
    const [message, setMessage] = useState('');
    const [selectedPhone, setSelectedPhone] = useState(musician.verifiedPhone || musician.phone || '');
    const [inviteType, setInviteType] = useState<'inquiry' | 'offer'>('offer');
    const [offerDuration, setOfferDuration] = useState('48'); // hours
    const [inviteId] = useState(() => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10));

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
            const dateStr = event.date ? new Date(event.date + 'T12:00:00').toLocaleDateString(undefined, {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            }) : 'TBD';
            const venueStr = event.venue || 'TBD';

            let link = `https://opusmode.net/gig/${inviteId}`;



            let actionText = '';
            // Determine Fee to show
            const feeToShow = slot.fee ? slot.fee : (event.musicianFee && event.musicianFee !== '0') ? event.musicianFee : null;
            const feeText = feeToShow ? ` ($${feeToShow})` : '';

            if (inviteType === 'inquiry') {
                actionText = `Are you available${feeText}? Let me know here: ${link}`;
            } else {
                const deadlineText = offerDuration === 'custom' ? '' : ` within ${offerDuration} hours`;
                actionText = `I'm offering you the gig${feeText}. Please confirm${deadlineText} here: ${link}`;
            }

            const template = `Hi ${musician.firstName}! ${actionText}\n\n(For "${event.title}" on ${dateStr} at ${venueStr}. Load-in: ${timeStr})`;
            setMessage(template);
        }
    }, [visible, event, musician, slot, inviteType, offerDuration, inviteId]);

    const sendSms = async () => {
        if (!selectedPhone) {
            Alert.alert('No Number', 'This musician does not have a phone number saved.');
            return;
        }

        // Calculate expiration if applicable
        let expiresAt: string | undefined = undefined;
        if (inviteType === 'offer' && offerDuration !== 'custom') {
            const hours = parseInt(offerDuration);
            if (!isNaN(hours)) {
                expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
            }
        }

        const inviteData = {
            inviteId,
            inviteType,
            inviteExpiresAt: expiresAt
        };

        if (Platform.OS === 'web') {
            try {
                if (navigator.share) {
                    await navigator.share({
                        title: `Gig Invite: ${event.title}`,
                        text: message
                    });
                    onConfirm(musician.id, inviteData);
                    onClose();
                } else {
                    // Fallback to clipboard for Desktop Web where Share API might be missing
                    await navigator.clipboard.writeText(`${message}\n\nTo: ${selectedPhone}`);
                    alert('Message copied to clipboard! You can now paste it into your messaging app.');
                    onConfirm(musician.id, inviteData);
                    onClose();
                }
            } catch (err) {
                console.log('Error sharing:', err);
                // If user cancelled share, we might not want to close/confirm, or we might.
                // For now, let's assume if they cancelled, they might try again.
            }
            return;
        }

        const url = `sms:${selectedPhone}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;

        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                onConfirm(musician.id, inviteData);
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

    const confirmWithoutSms = () => {
        onConfirm(musician.id);
        onClose();
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

                        <Text className="text-[10px] uppercase font-black text-blue-400 mb-2 tracking-widest px-1">Invitation Type</Text>
                        <View className="flex-row bg-white p-1 rounded-2xl border border-blue-100 mb-4 h-12">
                            <TouchableOpacity
                                onPress={() => setInviteType('offer')}
                                className={`flex-1 rounded-xl justify-center items-center ${inviteType === 'offer' ? 'bg-blue-600 shadow-sm' : ''}`}
                            >
                                <Text className={`font-black ${inviteType === 'offer' ? 'text-white' : 'text-gray-400'}`}>Official Offer</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setInviteType('inquiry')}
                                className={`flex-1 rounded-xl justify-center items-center ${inviteType === 'inquiry' ? 'bg-amber-500 shadow-sm' : ''}`}
                            >
                                <Text className={`font-black ${inviteType === 'inquiry' ? 'text-white' : 'text-gray-400'}`}>Inquiry Only</Text>
                            </TouchableOpacity>
                        </View>

                        {inviteType === 'offer' && (
                            <View className="mb-4">
                                <Text className="text-[10px] uppercase font-black text-blue-400 mb-2 tracking-widest px-1">Response Expected Within</Text>
                                <View className="flex-row gap-2">
                                    {['24', '48', 'custom'].map((opt) => (
                                        <TouchableOpacity
                                            key={opt}
                                            onPress={() => setOfferDuration(opt)}
                                            className={`px-4 py-2 rounded-xl border ${offerDuration === opt ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-100'}`}
                                        >
                                            <Text className={`font-bold ${offerDuration === opt ? 'text-white' : 'text-blue-600'}`}>
                                                {opt === 'custom' ? 'Custom' : `${opt}h`}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        <Text className="text-[10px] uppercase font-black text-blue-400 mb-2 tracking-widest px-1">Message Content</Text>
                        <TextInput
                            className="bg-white p-5 rounded-2xl border border-blue-100 font-medium text-foreground min-h-[120px]"
                            value={message}
                            onChangeText={setMessage}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>

                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            onPress={confirmWithoutSms}
                            className="flex-1 bg-gray-100 p-5 rounded-3xl items-center"
                        >
                            <Text className="text-gray-600 font-black text-lg text-center">Assign only</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={sendSms}
                            className="flex-[2] bg-blue-600 p-5 rounded-3xl flex-row justify-center items-center shadow-lg shadow-blue-400"
                        >
                            <Ionicons name="send" size={20} color="white" />
                            <Text className="text-white font-black text-lg ml-3">Invite via SMS</Text>
                        </TouchableOpacity>
                    </View>
                    {Platform.OS === 'web' && (
                        <Text className="text-center text-gray-400 text-xs mt-4 px-4 leading-relaxed">
                            <Text className="font-bold">Note:</Text> This will open your device's share menu (e.g., Messages, WhatsApp). You may need to select the contact again in that app.
                        </Text>
                    )}
                </View>
            </View>
        </Modal>
    );
}
