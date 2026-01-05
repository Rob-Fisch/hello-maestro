import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Modal, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function GigInvitePage() {
    const { inviteId } = useLocalSearchParams<{ inviteId: string }>();
    const router = useRouter();

    // -- HOOKS: MUST BE AT TOP LEVEL --
    const [data, setData] = useState<{ event: any, slot: any } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!inviteId) return;

        const fetchInvite = async () => {
            try {
                setLoading(true);
                // RPC call to secure backend function
                const { data: inviteData, error } = await supabase.rpc('get_invite_info', {
                    p_invite_id: inviteId
                });

                if (error || !inviteData) {
                    console.error('Invite fetch error:', error);
                    setError(true);
                } else {
                    // Map flat RPC result to structure expected by UI
                    const result = Array.isArray(inviteData) ? inviteData[0] : inviteData;

                    if (!result) {
                        setError(true);
                        return;
                    }

                    const mapEvent = {
                        id: result.event_id,
                        title: result.event_title,
                        date: result.event_date,
                        time: result.event_time,
                        venue: result.event_venue,
                        slots: [] // Dummy holder
                    };

                    const mapSlot = {
                        id: result.slot_id,
                        role: result.slot_role,
                        fee: result.slot_fee,
                        status: result.slot_status,
                        inviteId: inviteId, // Keep strictly what we used to lookup
                        inviteType: result.invite_type,
                        inviteExpiresAt: result.invite_expires_at
                    };

                    setData({ event: mapEvent, slot: mapSlot });
                }
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchInvite();
    }, [inviteId]);

    const handleResponse = async (response: 'accept' | 'decline') => {
        if (!data) return;
        const { slot } = data;
        const isExpired = slot.inviteExpiresAt && new Date(slot.inviteExpiresAt) < new Date();

        if (isExpired) return;

        try {
            setProcessing(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setShowAuthModal(true);
                return;
            }

            // User is logged in, call the RPC
            const { error: rpcError } = await supabase.rpc('respond_to_invite', {
                p_invite_id: inviteId,
                p_response: response === 'accept' ? 'confirmed' : 'declined'
            });

            if (rpcError) throw rpcError;

            // Refresh data to show confirmation state
            setData(prev => prev ? {
                ...prev,
                slot: { ...prev.slot, status: response === 'accept' ? 'confirmed' : 'declined' }
            } : null);

        } catch (err) {
            console.error('Error responding to invite:', err);
            Alert.alert('Error', 'Failed to update response. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <View className="flex-1 justify-center items-center bg-white"><Stack.Screen options={{ headerShown: false }} /><ActivityIndicator size="large" color="#2563eb" /></View>;

    if (error || !data) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-8">
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="alert-circle-outline" size={64} color="#ef4444" />
                <Text className="text-2xl font-black text-foreground mt-4 text-center">Invalid Link</Text>
                <Text className="text-gray-500 text-center mt-2">This invitation link appears to be invalid or has expired.</Text>
                <TouchableOpacity onPress={() => router.replace('/')} className="mt-8">
                    <Text className="text-blue-500 font-bold">Go Home</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { event, slot } = data;
    const isOffer = slot.inviteType === 'offer';
    const isExpired = slot.inviteExpiresAt && new Date(slot.inviteExpiresAt) < new Date();
    const isConfirmed = slot.status === 'confirmed';

    if (isConfirmed || slot.status === 'declined') {
        const isDecline = slot.status === 'declined';
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center p-8">
                <Stack.Screen options={{ headerShown: false }} />
                <View className={`${isDecline ? 'bg-gray-100' : 'bg-green-100'} p-6 rounded-full mb-6`}>
                    <Ionicons name={isDecline ? "close" : "checkmark"} size={48} color={isDecline ? "#4b5563" : "#16a34a"} />
                </View>
                <Text className={`text-3xl font-black text-center ${isDecline ? 'text-gray-600' : 'text-green-700'}`}>
                    {isDecline ? 'Declined' : 'Confirmed!'}
                </Text>
                <Text className="text-gray-500 text-center mt-2 mb-4">
                    {isDecline ? 'Thanks for letting us know.' : `You are locked in for ${slot.role}.`}
                </Text>

                <View className="bg-orange-50 px-4 py-3 rounded-2xl mb-8 border border-orange-100 flex-row items-center border-l-4 border-l-orange-400">
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#ea580c" />
                    <Text className="text-orange-800 text-xs font-bold ml-2 flex-1">
                        Please reply "Yes" to the original SMS to let the leader know!
                    </Text>
                </View>

                {/* Privacy / Independence Note */}
                <View className="mb-6 px-2">
                    <View className="flex-row justify-center mb-2">
                        <Ionicons name="shield-checkmark-outline" size={16} color="#94a3b8" />
                    </View>
                    <Text className="text-center text-slate-400 text-xs leading-relaxed px-4">
                        <Text className="font-bold text-slate-500">Privacy Note:</Text> Your events are independent.
                        This gig is not automatically added to your OpusMode schedule to ensures your data remains separate and private.
                    </Text>
                </View>

                {/* Product Adoption Hook */}
                <View className="w-full bg-blue-50 p-6 rounded-3xl items-center border border-blue-100">
                    <Text className="text-blue-900 font-bold mb-1">Passionate about music?</Text>
                    <Text className="text-blue-500 text-xs text-center mb-4">
                        OpusMode helps musicians manage gigs, gear, and practice routines.
                    </Text>
                    <TouchableOpacity
                        onPress={() => Linking.openURL('https://opusmode.net')}
                        className="bg-blue-600 px-6 py-3 rounded-xl"
                    >
                        <Text className="text-white font-bold">Discover OpusMode</Text>
                    </TouchableOpacity>
                </View>

                {/* Demo Back Button (Hidden in production web usually, but good for sim) */}
                <TouchableOpacity
                    onPress={() => router.push('/(drawer)/events')}
                    className="mt-8"
                >
                    <Text className="font-bold text-gray-300 text-xs uppercase">Back to App (Demo)</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />
            <Modal
                visible={showAuthModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowAuthModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white p-6 rounded-3xl w-full max-w-sm">
                        <Text className="text-xl font-black text-center mb-2">Account Required</Text>
                        <Text className="text-gray-500 text-center mb-6">
                            To accept this gig and view the setlist, please sign in or create a free musician account.
                        </Text>

                        <TouchableOpacity
                            onPress={() => {
                                setShowAuthModal(false);
                                router.push(`/auth?redirectTo=/gig/${inviteId}`);
                            }}
                            className="bg-blue-600 py-4 rounded-xl mb-3"
                        >
                            <Text className="text-white text-center font-bold">Sign In / Join</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setShowAuthModal(false)}
                            className="py-2"
                        >
                            <Text className="text-slate-400 text-center font-bold">Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ScrollView className="flex-1">
                {/* Header Image / Map Placeholder */}
                <View className="h-48 bg-blue-600 justify-end p-6">
                    <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-6 bg-white/20 p-2 rounded-full">
                        <Ionicons name="arrow-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text className="text-white/80 font-bold uppercase tracking-widest text-xs mb-2">{isOffer ? 'Official Offer' : 'Availability Check'}</Text>
                    <Text className="text-white font-black text-3xl">{event.title}</Text>
                </View>

                <View className="p-6 -mt-6 bg-white rounded-t-3xl min-h-[500px]">
                    {/* Gig Details */}
                    <View className="flex-row gap-4 mb-8">
                        <View className="bg-gray-50 p-4 rounded-2xl flex-1 items-center">
                            <Text className="text-xs text-gray-500 font-bold uppercase">Date</Text>
                            <Text className="text-lg font-black text-foreground">
                                {event.date ? new Date(event.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : 'TBD'}
                            </Text>
                        </View>
                        <View className="bg-gray-50 p-4 rounded-2xl flex-1 items-center">
                            <Text className="text-xs text-gray-500 font-bold uppercase">Time</Text>
                            <Text className="text-lg font-black text-foreground">
                                {event.time ? new Date(`2000-01-01T${event.time}`).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : 'TBD'}
                            </Text>
                        </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-xs text-gray-500 font-bold uppercase mb-2">Venue</Text>
                        <Text className="text-xl font-bold text-foreground">{event.venue || 'To Be Announced'}</Text>
                    </View>

                    <View className="mb-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                        <Text className="text-blue-600 font-bold mb-1">Your Role</Text>
                        <Text className="text-2xl font-black text-blue-900">{slot.role}</Text>
                        {slot.fee && <Text className="text-lg font-bold text-green-600 mt-2">${slot.fee}</Text>}
                    </View>

                    {/* Actions */}
                    {isExpired ? (
                        <View className="bg-red-50 p-6 rounded-3xl items-center border border-red-100">
                            <Ionicons name="hourglass-outline" size={32} color="#ef4444" />
                            <Text className="text-red-600 font-black text-xl mt-2">Offer Expired</Text>
                            <Text className="text-red-400 text-center mt-1">Please contact the band leader directly.</Text>
                        </View>
                    ) : (
                        <View className="gap-4">
                            <TouchableOpacity
                                onPress={() => handleResponse('accept')}
                                disabled={processing}
                                className={`p-5 rounded-3xl items-center shadow-lg shadow-blue-300 ${processing ? 'bg-blue-400' : 'bg-blue-600'}`}
                            >
                                {processing ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-black text-xl">{isOffer ? 'Accept Gig' : 'Yes, I\'m Free'}</Text>
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={() => handleResponse('decline')}
                                disabled={processing}
                                className={`p-5 rounded-3xl items-center ${processing ? 'bg-gray-200' : 'bg-gray-100'}`}
                            >
                                <Text className="text-gray-600 font-black text-lg">{isOffer ? 'Decline' : 'No, I\'m Busy'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
