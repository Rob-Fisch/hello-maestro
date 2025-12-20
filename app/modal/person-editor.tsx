import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';

export default function PersonEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;

    const { people = [], addPerson, updatePerson } = useContentStore();
    const existingPerson = id ? people.find((p) => p.id === id) : undefined;
    const isEditing = !!existingPerson;

    const [name, setName] = useState(existingPerson?.name || '');
    const [type, setType] = useState<PersonType>(existingPerson?.type || 'student');
    const [email, setEmail] = useState(existingPerson?.email || '');
    const [phone, setPhone] = useState(existingPerson?.phone || '');
    const [instrument, setInstrument] = useState(existingPerson?.instrument || '');
    const [notes, setNotes] = useState(existingPerson?.notes || '');

    const handleSave = () => {
        if (!name.trim()) {
            const msg = 'Please enter a name';
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert('Error', msg);
            return;
        }

        const personData: Person = {
            id: id || Date.now().toString(),
            name: name.trim(),
            type,
            email: email.trim() || undefined,
            phone: phone.trim() || undefined,
            instrument: instrument.trim() || undefined,
            notes: notes.trim() || undefined,
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
        { key: 'fan', label: 'Fan', icon: 'heart' },
        { key: 'other', label: 'Other', icon: 'person' },
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-background"
        >
            {/* Header */}
            <View className="px-6 pt-12 pb-4 border-b border-border flex-row justify-between items-center bg-background">
                <View>
                    <Text className="text-2xl font-bold tracking-tight">{isEditing ? 'Edit Contact' : 'New Contact'}</Text>
                </View>
                <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 px-4 py-2 rounded-full">
                    <Text className="text-gray-600 font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1" keyboardShouldPersistTaps="handled">
                <View className="p-6">
                    {/* Role Selection */}
                    <Text className="text-[10px] uppercase font-black text-muted-foreground mb-3 tracking-widest px-1">Contact Role</Text>
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {personTypes.map((t) => (
                            <TouchableOpacity
                                key={t.key}
                                onPress={() => setType(t.key)}
                                className={`flex-row items-center px-4 py-3 rounded-2xl border ${type === t.key ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'bg-card border-border'}`}
                            >
                                <Ionicons name={t.icon as any} size={16} color={type === t.key ? 'white' : '#6b7280'} />
                                <Text className={`ml-2 text-xs font-bold ${type === t.key ? 'text-white' : 'text-gray-500'}`}>
                                    {t.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Form Card */}
                    <View className="bg-card p-6 rounded-[40px] border border-border shadow-sm mb-10">
                        <View className="mb-6">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Full Name</Text>
                            <TextInput
                                className="text-xl font-bold text-foreground py-2"
                                placeholder="Jimi Hendrix"
                                value={name}
                                onChangeText={setName}
                            />
                        </View>

                        {(type === 'student' || type === 'musician') && (
                            <View className="mb-6">
                                <Text className="text-[10px] uppercase font-black text-blue-600 mb-1 tracking-widest">Instrument</Text>
                                <TextInput
                                    className="text-lg font-semibold text-foreground py-2"
                                    placeholder="Guitar, Piano, etc."
                                    value={instrument}
                                    onChangeText={setInstrument}
                                />
                            </View>
                        )}

                        <View className="mb-6">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Email Address</Text>
                            <TextInput
                                className="text-lg font-semibold text-foreground py-2"
                                placeholder="name@example.com"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View className="mb-6">
                            <Text className="text-[10px] uppercase font-black text-muted-foreground mb-1 tracking-widest">Phone Number</Text>
                            <TextInput
                                className="text-lg font-semibold text-foreground py-2"
                                placeholder="+1 (555) 000-0000"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="phone-pad"
                            />
                        </View>
                    </View>

                    {/* Notes */}
                    <View className="bg-card p-6 rounded-[40px] border border-border shadow-sm mb-32">
                        <Text className="text-[10px] uppercase font-black text-muted-foreground mb-2 tracking-widest">Notes & Details</Text>
                        <TextInput
                            className="text-base text-foreground min-h-[120px]"
                            placeholder="Add specifics about this contact, like student goals or venue booking preferences..."
                            value={notes}
                            onChangeText={setNotes}
                            multiline
                            textAlignVertical="top"
                        />
                    </View>
                </View>
            </ScrollView>

            {/* Save Button */}
            <View className="absolute bottom-10 left-8 right-8 shadow-2xl shadow-blue-500/50">
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-blue-600 p-6 rounded-[32px] flex-row justify-center items-center"
                >
                    <Ionicons name="checkmark-circle-outline" size={24} color="white" />
                    <Text className="text-white font-black text-xl ml-2 tracking-tight">
                        {isEditing ? 'Update' : 'Save'} Contact
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
