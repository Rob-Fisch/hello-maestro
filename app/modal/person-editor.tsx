import { useContentStore } from '@/store/contentStore';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { router, useGlobalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PersonEditor() {
    // Standard params hook
    const params = useGlobalSearchParams();
    const id = typeof params.id === 'string' ? params.id : undefined;

    const { people = [], addPerson, updatePerson } = useContentStore();
    const existingPerson = id ? people.find((p) => p.id === id) : undefined;
    const isEditing = !!existingPerson;

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [type, setType] = useState<PersonType>('student');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [instrument, setInstrument] = useState('');
    const [instruments, setInstruments] = useState<string[]>([]);
    const [verifiedPhone, setVerifiedPhone] = useState('');
    const [notes, setNotes] = useState('');
    const [source, setSource] = useState<'maestro' | 'native'>('maestro');

    const [nativeId, setNativeId] = useState<string | undefined>(undefined);
    // Venue Manager Fields
    const [venueName, setVenueName] = useState('');
    const [venueType, setVenueType] = useState('');
    const [venueLocation, setVenueLocation] = useState('');


    // Initial state setup after hydration/mounting
    useEffect(() => {
        if (existingPerson) {
            setFirstName(existingPerson.firstName || '');
            setLastName(existingPerson.lastName || '');
            setType(existingPerson.type || 'student');
            setEmail(existingPerson.email || '');
            setPhone(existingPerson.phone || '');
            setInstrument(existingPerson.instrument || '');
            setInstruments(existingPerson.instruments || []);
            setVerifiedPhone(existingPerson.verifiedPhone || '');
            setNotes(existingPerson.notes || '');
            setSource(existingPerson.source || 'maestro');

            setNativeId(existingPerson.nativeId);
            setVenueName(existingPerson.venueName || '');
            setVenueType(existingPerson.venueType || '');
            setVenueLocation(existingPerson.venueLocation || '');

        }
    }, [id, existingPerson]);

    const pickContact = async () => {
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'OpusMode needs contact permission.');
                return;
            }
            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                setFirstName(contact.firstName || '');
                setLastName(contact.lastName || '');
                if (contact.emails && contact.emails.length > 0) setEmail(contact.emails[0].email || '');
                if (contact.phoneNumbers && contact.phoneNumbers.length > 0) setPhone(contact.phoneNumbers[0].number || '');
                setSource('native');
                setNativeId(contact.id);
            }
        } catch (e) {
            Alert.alert('Error', 'Could not open contact picker.');
        }
    };

    const handleSave = () => {
        if (!firstName.trim()) {
            Alert.alert('Error', 'Please enter a first name');
            return;
        }

        // FREEMIUM LIMIT CHECK
        if (type === 'venue_manager' && !isEditing) {
            const currentCount = people.filter(p => p.type === 'venue_manager').length;
            if (currentCount >= 10) {
                if (Platform.OS === 'web') {
                    alert('Free Plan Limit: You can only manage 10 Venues. Upgrade to Premium for unlimited entries.');
                } else {
                    Alert.alert('Limit Reached', 'You have reached the limit of 10 Venues on the free plan. Upgrade to add more.');
                }
                return;
            }
        }

        const personData: Person = {
            id: id || Date.now().toString(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            type,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            verifiedPhone: verifiedPhone.trim() || undefined,
            instruments: instruments.length > 0 ? instruments : (instrument ? [instrument] : []),
            notes: notes.trim() || undefined,
            source,

            nativeId,
            venueName: type === 'venue_manager' ? venueName : undefined,
            venueType: type === 'venue_manager' ? venueType : undefined,
            venueLocation: type === 'venue_manager' ? venueLocation : undefined,
            createdAt: existingPerson?.createdAt || new Date().toISOString(),
        };


        if (isEditing && id) {
            updatePerson(id, personData);
        } else {
            addPerson(personData);
        }
        router.back();
    };

    const personTypes: { key: PersonType; label: string; icon: string }[] = [
        { key: 'student', label: 'Student', icon: 'graduation-cap' },
        { key: 'musician', label: 'Musician', icon: 'musical-notes' },
        { key: 'venue_manager', label: 'Venue Manager', icon: 'business' },
        { key: 'other', label: 'Other', icon: 'person' },
    ];

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-white">
            <View className="px-6 pt-12 pb-4 border-b border-gray-100 flex-row justify-between items-center bg-white">
                <Text className="text-2xl font-black text-slate-900">{isEditing ? 'Edit Contact' : 'New Contact'}</Text>
                <TouchableOpacity onPress={() => router.back()} className="bg-slate-100 p-2 rounded-full">
                    <Ionicons name="close" size={24} color="#0f172a" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled">
                {!isEditing && Platform.OS !== 'web' && (
                    <TouchableOpacity onPress={pickContact} className="bg-blue-50 p-4 rounded-2xl flex-row items-center justify-center mb-8 border border-blue-100 shadow-sm">
                        <Ionicons name="person-add" size={20} color="#2563eb" />
                        <Text className="text-blue-600 font-bold ml-2">Import from Contacts</Text>
                    </TouchableOpacity>
                )}

                <View className="flex-row flex-wrap gap-2 mb-8">
                    {personTypes.map((t) => (
                        <TouchableOpacity
                            key={t.key}
                            onPress={() => setType(t.key)}
                            className={`flex-row items-center px-4 py-3 rounded-2xl border ${type === t.key ? 'bg-slate-900 border-slate-900' : 'bg-white border-gray-200'}`}
                        >
                            <Ionicons name={t.icon as any} size={16} color={type === t.key ? 'white' : '#64748b'} />
                            <Text className={`ml-2 text-xs font-bold ${type === t.key ? 'text-white' : 'text-slate-500'}`}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-6">
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase font-bold text-slate-400 mb-1">First Name</Text>
                            <TextInput
                                className="text-xl font-bold py-1 border-b border-gray-200 text-slate-900"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Jane"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase font-bold text-slate-400 mb-1">Last Name</Text>
                            <TextInput
                                className="text-xl font-bold py-1 border-b border-gray-200 text-slate-900"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Doe"
                                placeholderTextColor="#cbd5e1"
                            />
                        </View>
                    </View>

                    <Text className="text-[10px] uppercase font-bold text-slate-400 mb-1">Email</Text>
                    <TextInput
                        className="text-lg font-semibold py-1 mb-4 border-b border-gray-100 text-slate-900"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="jane@example.com"
                        placeholderTextColor="#cbd5e1"
                    />

                    <Text className="text-[10px] uppercase font-bold text-slate-400 mb-1">General Phone</Text>
                    <TextInput
                        className="text-lg font-semibold py-1 mb-4 border-b border-gray-100 text-slate-900"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="(555) 123-4567"
                        placeholderTextColor="#cbd5e1"
                    />

                    <View className="mb-4">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-[10px] uppercase font-black text-blue-600 tracking-widest">OpusMode-Verified Mobile (SMS)</Text>
                            <Ionicons name="checkmark-circle" size={12} color="#2563eb" style={{ marginLeft: 4 }} />
                        </View>
                        <TextInput
                            className="text-lg font-bold text-blue-700 py-1 border-b border-blue-100"
                            placeholder="Primary for Gig Requests"
                            value={verifiedPhone}
                            onChangeText={setVerifiedPhone}
                            keyboardType="phone-pad"
                            placeholderTextColor="#93c5fd"
                        />
                    </View>

                    {type !== 'venue_manager' && (
                        <>
                            <Text className="text-[10px] uppercase font-bold text-slate-400 mb-1">Instruments</Text>
                            <TextInput
                                className="text-lg font-semibold py-1 mb-4 border-b border-gray-100 text-slate-900"
                                placeholder="Piano, Guitar, Vocals..."
                                value={instruments.join(', ')}
                                onChangeText={(text) => setInstruments(text.split(',').map(s => s.trim()).filter(s => s !== ''))}
                                placeholderTextColor="#cbd5e1"
                            />
                        </>
                    )}
                </View>

                {/* Venue Details (Conditional) */}
                {type === 'venue_manager' && (
                    <View className="bg-orange-50 p-6 rounded-[32px] border border-orange-100 mb-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <Ionicons name="business" size={18} color="#ea580c" />
                                <Text className="text-[10px] uppercase font-black text-orange-600 tracking-widest ml-2">Venue Details</Text>
                            </View>
                            {!isEditing && (
                                <Text className="text-[10px] font-bold text-orange-400">
                                    {people.filter(p => p.type === 'venue_manager').length} / 10 Free Used
                                </Text>
                            )}
                        </View>

                        <Text className="text-[10px] uppercase font-bold text-orange-400/70 mb-1">Venue Name</Text>
                        <TextInput
                            className="text-lg font-bold py-1 mb-4 border-b border-orange-200 text-orange-900"
                            placeholder="e.g. The Blue Note"
                            value={venueName}
                            onChangeText={setVenueName}
                            placeholderTextColor="#fdba74"
                        />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-bold text-orange-400/70 mb-1">Type / Vibe</Text>
                                <TextInput
                                    className="text-base font-semibold py-1 border-b border-orange-200 text-orange-900"
                                    placeholder="Jazz Club"
                                    value={venueType}
                                    onChangeText={setVenueType}
                                    placeholderTextColor="#fdba74"
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-bold text-orange-400/70 mb-1">Location</Text>
                                <TextInput
                                    className="text-base font-semibold py-1 border-b border-orange-200 text-orange-900"
                                    placeholder="City, State"
                                    value={venueLocation}
                                    onChangeText={setVenueLocation}
                                    placeholderTextColor="#fdba74"
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Notes Section */}
                <View className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 mb-8">
                    <Text className="text-[10px] uppercase font-bold text-slate-400 mb-2">Private Notes</Text>
                    <TextInput
                        className="text-base text-slate-800 min-h-[100px]"
                        placeholder="Booking preferences, travel info, etc..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        textAlignVertical="top"
                        placeholderTextColor="#cbd5e1"
                    />
                </View>


                <TouchableOpacity onPress={handleSave} className="bg-slate-900 p-5 rounded-[24px] items-center mb-20 shadow-lg shadow-slate-900/20 flex-row justify-center">
                    <Ionicons name="save-outline" size={20} color="white" />
                    <Text className="text-white font-black text-lg ml-2">{isEditing ? 'Update' : 'Save'} Contact</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
