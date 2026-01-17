import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PeopleScreen() {
    const { people = [], deletePerson, trackModuleUsage } = useContentStore();
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();

    const params = useLocalSearchParams();
    // Parse filter param safely
    const initialFilter = Array.isArray(params.filter) ? params.filter[0] : params.filter;
    // Parse source param safely
    const source = Array.isArray(params.source) ? params.source[0] : params.source;

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<PersonType | 'all'>('all');

    useEffect(() => {
        trackModuleUsage('people');
        if (initialFilter && ['student', 'musician', 'venue_manager', 'other'].includes(initialFilter)) {
            setActiveFilter(initialFilter as PersonType);
        }
    }, [initialFilter]);

    // ... (rest of logic) ...

    // IN RENDER:
    // Replace the Home Button block lines 99-106 (approx)
    {
        source === 'gigs' ? (
            <TouchableOpacity onPress={() => router.push('/(drawer)/gigs')} className="mr-4 p-2 -ml-2 rounded-full">
                <Ionicons name="arrow-back" size={26} color={theme.text} />
            </TouchableOpacity>
        ) : (
            <TouchableOpacity onPress={() => router.push('/')} className="mr-4 p-2 -ml-2 rounded-full">
                <Ionicons name="home-outline" size={26} color={theme.text} />
            </TouchableOpacity>
        )
    }

    const filteredPeople = useMemo(() => {
        try {
            const list = people || [];
            return list.filter(p => {
                const matchFilter = activeFilter === 'all' || p.type === activeFilter;
                const fName = (p.firstName || '').toLowerCase();
                const lName = (p.lastName || '').toLowerCase();
                const s = searchQuery.toLowerCase();
                return matchFilter && (fName.includes(s) || lName.includes(s));
            });
        } catch (e) {
            return [];
        }
    }, [people, activeFilter, searchQuery]);

    const handleDelete = (id: string, firstName: string, lastName: string) => {
        const fullName = `${firstName} ${lastName}`;
        const confirmDelete = () => deletePerson(id);
        if (Platform.OS === 'web') {
            if (confirm(`Are you sure you want to delete ${fullName}?`)) confirmDelete();
        } else {
            Alert.alert("Delete Contact", `Are you sure?`, [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: confirmDelete }
            ]);
        }
    };

    const getBadge = (type: PersonType) => {
        switch (type) {
            case 'student': return { label: 'Student', color: 'bg-purple-100', text: '#7e22ce', icon: 'graduation-cap' };
            case 'musician': return { label: 'Musician', color: 'bg-blue-100', text: '#2563eb', icon: 'musical-notes' };
            case 'venue_manager': return { label: 'Venue Manager', color: 'bg-amber-100', text: '#b45309', icon: 'business' };
            default: return { label: 'Other', color: 'bg-gray-100', text: '#4b5563', icon: 'person' };
        }
    };

    const handleImport = async () => {
        if (Platform.OS === 'web') return; // Not supported on web
        try {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'OpusMode needs permission to access your contacts.');
                return;
            }
            const contact = await Contacts.presentContactPickerAsync();
            if (contact) {
                router.push({
                    pathname: '/modal/person-editor',
                    params: {
                        importName: 'true',
                        importFirstName: contact.firstName || contact.name || '',
                        importLastName: contact.lastName || '',
                        importEmail: contact.emails?.[0]?.email || '',
                        importPhone: contact.phoneNumbers?.[0]?.number || '',
                        importNativeId: contact.id
                    }
                });
            }
        } catch (e) {
            console.error(e);
        }
    };

    const renderRosterItem = ({ item }: { item: Person }) => {
        const badge = getBadge(item.type);
        return (
            <View className="mb-4 border rounded-[24px] overflow-hidden shadow-sm mx-1" style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                <TouchableOpacity className="p-6" onPress={() => router.push(`/people/${item.id}`)}>
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <View className={`self-start px-3 py-1 rounded-full mb-3 flex-row items-center ${badge.color}`}>
                                <Ionicons name={badge.icon as any} size={12} color={badge.text} />
                                <Text className="text-[10px] uppercase font-black tracking-widest ml-1.5" style={{ color: badge.text }}>{badge.label}</Text>
                            </View>
                            <Text className="text-2xl font-black leading-tight text-white">{item.firstName} {item.lastName}</Text>
                            {item.type === 'venue_manager' ? (
                                <View className="mt-1">
                                    <View className="flex-row items-center mt-1">
                                        <Ionicons name="business" size={14} color="#fbbf24" style={{ marginRight: 6 }} />
                                        <Text className="text-base font-bold text-amber-400">{item.venueName || 'Unknown Venue'}</Text>
                                    </View>
                                    {(item.venueType || item.venueLocation) && (
                                        <Text className="text-xs font-semibold text-slate-400 mt-1 pl-5">
                                            {[item.venueType, item.venueLocation].filter(Boolean).join(' • ')}
                                        </Text>
                                    )}
                                </View>
                            ) : (
                                <Text className="text-sm font-bold text-blue-400 mt-1">{item.instruments?.join(', ') || item.instrument}</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.firstName, item.lastName)} className="p-2 bg-white/5 rounded-full">
                            <Ionicons name="trash-outline" size={18} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header with Home Button - Top of Page */}
            <View className="px-6 flex-row items-start pt-8 mb-2" style={{ paddingTop: insets.top }}>
                <View className="mr-5">
                    {source === 'gigs' ? (
                        <TouchableOpacity onPress={() => router.push('/(drawer)/gigs')} className="p-2 -ml-2 rounded-full bg-white/5 border border-white/10">
                            <Ionicons name="arrow-back" size={24} color="white" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="p-2 -ml-2 rounded-full bg-white/5 border border-white/10">
                            <Ionicons name="menu" size={24} color="white" />
                        </TouchableOpacity>
                    )}
                </View>
                <View className="flex-1 flex-row justify-between items-start">
                    <View>
                        <Text className="text-[10px] font-black uppercase tracking-[3px] text-teal-400 mb-1">
                            People
                        </Text>
                        <Text className="text-4xl font-black tracking-tight text-white">
                            Contacts
                        </Text>
                    </View>
                    <View className="flex-row gap-3">
                        {Platform.OS !== 'web' && (
                            <TouchableOpacity
                                onPress={handleImport}
                                className="w-12 h-12 rounded-2xl items-center justify-center bg-white/10 border border-white/20"
                            >
                                <Ionicons name="person-add-outline" size={24} color="white" />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            onPress={() => router.push('/modal/person-editor')}
                            className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-purple-500/20 bg-white"
                        >
                            <Ionicons name="add" size={28} color="black" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View className="flex-1">
                {/* Filter & Search */}
                <View className="px-6 pb-4">
                    <View className="flex-row items-center border rounded-2xl px-4 py-3 mb-6 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}>
                        <Ionicons name="search-outline" size={20} color={theme.mutedText} />
                        <TextInput
                            className="flex-1 ml-3 font-medium py-1 text-white"
                            placeholder="Search contacts..."
                            placeholderTextColor={theme.mutedText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
                        {[
                            { key: 'all', label: 'All', color: 'bg-teal-500', text: 'white' },
                            { key: 'venue_manager', label: 'Venue Managers', color: 'bg-amber-500', text: 'white' },
                            { key: 'musician', label: 'Musicians', color: 'bg-blue-500', text: 'white' },
                            { key: 'student', label: 'Students', color: 'bg-purple-500', text: 'white' },
                            { key: 'other', label: 'Other', color: 'bg-slate-500', text: 'white' }
                        ].map(opt => {
                            const isActive = activeFilter === opt.key;
                            return (
                                <TouchableOpacity
                                    key={opt.key}
                                    onPress={() => setActiveFilter(opt.key as any)}
                                    className={`mr-3 px-5 py-2.5 rounded-full border ${isActive ? `${opt.color} border-transparent` : 'bg-transparent border-white/20'}`}
                                >
                                    <Text className={`text-xs uppercase font-black tracking-widest ${isActive ? opt.text : 'text-slate-400'}`}>
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                <FlatList
                    data={filteredPeople}
                    renderItem={renderRosterItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-20">
                            <Ionicons name="people-outline" size={64} color="#475569" />
                            <Text className="text-xl font-black text-slate-500 mt-4">No Contacts Found</Text>
                            <TouchableOpacity onPress={() => router.push('/modal/person-editor')} className="mt-4 px-6 py-3 bg-white/10 rounded-full border border-white/20">
                                <Text className="text-white font-bold">Add New Person</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>
        </View>
    );
}
