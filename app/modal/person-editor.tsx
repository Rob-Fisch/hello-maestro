import { PAPER_THEME } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import { router, useGlobalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
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

    // Address Fields
    const [addressLine1, setAddressLine1] = useState('');
    const [addressLine2, setAddressLine2] = useState('');
    const [city, setCity] = useState('');
    const [stateProvince, setStateProvince] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [mapLink, setMapLink] = useState('');


    const initializedIdRef = useRef<string | null>(null);

    // Initial state setup after hydration/mounting
    useEffect(() => {
        if (existingPerson && initializedIdRef.current !== existingPerson.id) {
            // Found person, haven't initialized this ID yet -> Initialize
            setFirstName(existingPerson.firstName || '');
            setLastName(existingPerson.lastName || '');
            setType(existingPerson.type || 'student');
            setEmail(existingPerson.email || '');
            setPhone(existingPerson.phone || '');
            setVerifiedPhone(existingPerson.verifiedPhone || '');
            setInstrument(existingPerson.instruments?.join(', ') || existingPerson.instrument || '');
            setInstruments(existingPerson.instruments || []);
            setNotes(existingPerson.notes || '');
            setSource(existingPerson.source || 'maestro');

            setNativeId(existingPerson.nativeId);
            setVenueName(existingPerson.venueName || '');
            setVenueType(existingPerson.venueType || '');
            setVenueLocation(existingPerson.venueLocation || '');

            // Address fields
            setAddressLine1(existingPerson.addressLine1 || '');
            setAddressLine2(existingPerson.addressLine2 || '');
            setCity(existingPerson.city || '');
            setStateProvince(existingPerson.stateProvince || '');
            setPostalCode(existingPerson.postalCode || '');
            setCountry(existingPerson.country || '');
            setMapLink(existingPerson.mapLink || '');

            initializedIdRef.current = existingPerson.id;

        } else if (params.importName && !id && !initializedIdRef.current) {
            // Import flow (only if no ID and not verified)
            setFirstName((params.importFirstName as string) || '');
            setLastName((params.importLastName as string) || '');
            setPhone((params.importPhone as string) || '');
            setEmail((params.importEmail as string) || '');
            setSource('native');
            if (params.importNativeId) setNativeId(params.importNativeId as string);

            initializedIdRef.current = 'new-import';
        }
    }, [existingPerson, id, params]);

    const removeInstrument = (indexToRemove: number) => {
        const newInstruments = instruments.filter((_, i) => i !== indexToRemove);
        setInstruments(newInstruments);
        setInstrument(newInstruments.join(', '));
    };

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
                    Alert.alert('Limit Reached', 'You have reached the limit of 10 Venues. Upgrade to add more.');
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

            // Address fields
            addressLine1: addressLine1.trim() || undefined,
            addressLine2: addressLine2.trim() || undefined,
            city: city.trim() || undefined,
            stateProvince: stateProvince.trim() || undefined,
            postalCode: postalCode.trim() || undefined,
            country: country.trim() || undefined,
            mapLink: mapLink.trim() || undefined,

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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1" style={{ backgroundColor: PAPER_THEME.background }}>
            {/* Header */}
            <View className="bg-white px-4 py-3 border-b border-stone-200 flex-row justify-between items-center z-10 shadow-sm" style={{ paddingTop: Platform.OS === 'ios' ? 60 : 16 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-row items-center ml-0 py-2 pr-4 pl-2"
                >
                    <Text className="text-base font-medium text-red-500">Cancel</Text>
                </TouchableOpacity>

                <View className="flex-row items-center gap-2 pr-2">
                    <TouchableOpacity
                        onPress={() => router.push('/modal/help')}
                        className="p-2 rounded-full bg-stone-50 mr-2"
                    >
                        <Ionicons name="help-circle-outline" size={24} color="#78716c" />
                    </TouchableOpacity>

                    {/* Save (Stay) */}
                    <TouchableOpacity
                        onPress={() => {
                            if (!firstName.trim()) {
                                Alert.alert('Error', 'Please enter a first name');
                                return;
                            }
                            // Save logic (duplicate) - Refactor ideal but sticking to inline for speed/safety
                            if (type === 'venue_manager' && !isEditing) {
                                const currentCount = people.filter(p => p.type === 'venue_manager').length;
                                if (currentCount >= 10) {
                                    if (Platform.OS === 'web') alert('Limit Reached');
                                    else Alert.alert('Limit Reached', 'You have reached the limit of 10 Venues.');
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

                                // Address fields
                                addressLine1: addressLine1.trim() || undefined,
                                addressLine2: addressLine2.trim() || undefined,
                                city: city.trim() || undefined,
                                stateProvince: stateProvince.trim() || undefined,
                                postalCode: postalCode.trim() || undefined,
                                country: country.trim() || undefined,
                                mapLink: mapLink.trim() || undefined,

                                createdAt: existingPerson?.createdAt || new Date().toISOString(),
                            };

                            if (isEditing && id) updatePerson(id, personData);
                            else addPerson(personData);

                            Alert.alert('Saved', 'Contact saved.');
                        }}
                        className="flex-row items-center px-3 py-2 rounded-full bg-stone-100"
                    >
                        <Ionicons name="save-outline" size={18} color="#57534e" />
                        <Text className="font-bold ml-1 text-xs text-stone-500">Save</Text>
                    </TouchableOpacity>

                    {/* Save & Exit */}
                    <TouchableOpacity
                        onPress={handleSave}
                        className="flex-row items-center px-3 py-2 rounded-full shadow-sm bg-stone-800"
                    >
                        <Ionicons name="exit-outline" size={18} color="white" style={{ transform: [{ scaleX: -1 }] }} />
                        <Text className="text-white font-bold ml-1 text-xs">Save & Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1 p-6" keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="flex-row items-center justify-between mb-8 mt-6">
                    <Text className="text-3xl font-black tracking-tight" style={{ color: PAPER_THEME.text }}>
                        {isEditing ? 'Edit Contact' : 'New Contact'}
                    </Text>
                </View>

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
                            className={`flex-row items-center px-4 py-3 rounded-2xl border ${type === t.key ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                        >
                            <Ionicons name={t.icon as any} size={16} color={type === t.key ? 'white' : '#78716c'} />
                            <Text className={`ml-2 text-xs font-bold ${type === t.key ? 'text-white' : 'text-stone-500'}`}>{t.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="bg-white p-6 rounded-[32px] border border-stone-200 mb-6 shadow-sm">
                    <View className="flex-row gap-4 mb-6">
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase font-bold text-stone-700 mb-1">First Name</Text>
                            <TextInput
                                className="text-xl font-bold py-1 border-b border-stone-200 text-stone-900"
                                value={firstName}
                                onChangeText={setFirstName}
                                placeholder="Jane"
                                placeholderTextColor="#57534e"
                                style={{ fontStyle: firstName ? 'normal' : 'italic' }}
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-[10px] uppercase font-bold text-stone-700 mb-1">Last Name</Text>
                            <TextInput
                                className="text-xl font-bold py-1 border-b border-stone-200 text-stone-900"
                                value={lastName}
                                onChangeText={setLastName}
                                placeholder="Doe"
                                placeholderTextColor="#57534e"
                                style={{ fontStyle: lastName ? 'normal' : 'italic' }}
                            />
                        </View>
                    </View>

                    <Text className="text-[10px] uppercase font-bold text-stone-700 mb-1">Email</Text>
                    <TextInput
                        className="text-lg font-semibold py-1 mb-4 border-b border-stone-100 text-stone-900"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="jane@example.com"
                        placeholderTextColor="#57534e"
                        style={{ fontStyle: email ? 'normal' : 'italic' }}
                    />

                    <Text className="text-[10px] uppercase font-bold text-stone-700 mb-1">General Phone</Text>
                    <TextInput
                        className="text-lg font-semibold py-1 mb-4 border-b border-stone-100 text-stone-900"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        placeholder="(555) 123-4567"
                        placeholderTextColor="#57534e"
                        style={{ fontStyle: phone ? 'normal' : 'italic' }}
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
                            <Text className="text-[10px] uppercase font-bold text-stone-700 mb-1">Instruments</Text>
                            <TextInput
                                className="text-lg font-semibold py-1 mb-4 border-b border-stone-100 text-stone-900"
                                placeholder="Piano, Guitar, Vocals..."
                                value={instrument}
                                onChangeText={(text) => {
                                    setInstrument(text);
                                    setInstruments(text.split(',').map(s => s.trim()).filter(Boolean));
                                }}
                                placeholderTextColor="#57534e"
                                style={{ fontStyle: instrument ? 'normal' : 'italic' }}
                            />
                            {/* Visual Confirmation of Tags */}
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {instruments.map((inst, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        onPress={() => removeInstrument(index)}
                                        className="bg-blue-100 px-3 py-1 rounded-full border border-blue-200 flex-row items-center"
                                    >
                                        <Text className="text-blue-700 text-xs font-bold mr-1">{inst}</Text>
                                        <Ionicons name="close-circle" size={14} color="#1d4ed8" />
                                    </TouchableOpacity>
                                ))}
                            </View>
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

                        <Text className="text-[10px] uppercase font-bold text-orange-700/70 mb-1">Venue Name</Text>
                        <TextInput
                            className="text-lg font-bold py-1 mb-4 border-b border-orange-200 text-orange-900"
                            placeholder="e.g. The Blue Note"
                            value={venueName}
                            onChangeText={setVenueName}
                            placeholderTextColor="#c2410c"
                            style={{ fontStyle: venueName ? 'normal' : 'italic' }}
                        />

                        <View className="flex-row gap-4">
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-bold text-orange-700/70 mb-1">Type / Vibe</Text>
                                <TextInput
                                    className="text-base font-semibold py-1 border-b border-orange-200 text-orange-900"
                                    placeholder="Jazz Club"
                                    value={venueType}
                                    onChangeText={setVenueType}
                                    placeholderTextColor="#c2410c"
                                    style={{ fontStyle: venueType ? 'normal' : 'italic' }}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-[10px] uppercase font-bold text-orange-700/70 mb-1">Location</Text>
                                <TextInput
                                    className="text-base font-semibold py-1 border-b border-orange-200 text-orange-900"
                                    placeholder="City, State"
                                    value={venueLocation}
                                    onChangeText={setVenueLocation}
                                    placeholderTextColor="#c2410c"
                                    style={{ fontStyle: venueLocation ? 'normal' : 'italic' }}
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Notes Section */}
                <View className="bg-white p-6 rounded-[32px] border border-stone-200 mb-8">
                    <Text className="text-[10px] uppercase font-bold text-stone-700 mb-2">Private Notes</Text>
                    <TextInput
                        className="text-base text-stone-800 min-h-[100px]"
                        placeholder="Booking preferences, travel info, etc..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        textAlignVertical="top"
                        placeholderTextColor="#57534e"
                        style={{ fontStyle: notes ? 'normal' : 'italic' }}
                    />
                </View>

            </ScrollView>


        </KeyboardAvoidingView>
    );
}
