import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PeopleScreen() {
    const { people = [], deletePerson, trackModuleUsage } = useContentStore();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<PersonType | 'all'>('all');

    useEffect(() => {
        trackModuleUsage('people');
    }, []);

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
            case 'fan': return { label: 'Fan', color: 'bg-red-100', text: '#dc2626', icon: 'heart' };
            default: return { label: 'Other', color: 'bg-gray-100', text: '#4b5563', icon: 'person' };
        }
    };

    const renderRosterItem = ({ item }: { item: Person }) => {
        const badge = getBadge(item.type);
        return (
            <View className="mb-4 border rounded-[32px] overflow-hidden shadow-sm mx-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <TouchableOpacity className="p-6" onPress={() => router.push(`/people/${item.id}`)}>
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <View className={`self-start px-3 py-1 rounded-full mb-3 flex-row items-center ${badge.color}`}>
                                <Ionicons name={badge.icon as any} size={12} color={badge.text} />
                                <Text className="text-[10px] uppercase font-black tracking-widest ml-1.5" style={{ color: badge.text }}>{badge.label}</Text>
                            </View>
                            <Text className="text-2xl font-black leading-tight" style={{ color: theme.text }}>{item.firstName} {item.lastName}</Text>
                            {item.type === 'venue_manager' ? (
                                <View className="mt-1">
                                    <Text className="text-base font-bold text-amber-700">{item.venueName || 'Unknown Venue'}</Text>
                                    {(item.venueType || item.venueLocation) && (
                                        <Text className="text-xs font-semibold opacity-60" style={{ color: theme.text }}>
                                            {[item.venueType, item.venueLocation].filter(Boolean).join(' • ')}
                                        </Text>
                                    )}
                                </View>
                            ) : (
                                <Text className="text-sm font-bold text-blue-600 mt-1">{item.instruments?.join(', ') || item.instrument}</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.firstName, item.lastName)} className="p-2">
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-8 pb-3" style={{ paddingTop: Math.max(insets.top, 20) }}>
                {/* Header with Home Button */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center flex-1 mr-4">
                        <TouchableOpacity onPress={() => router.push('/')} className="mr-4 p-2 -ml-2 rounded-full">
                            <Ionicons name="home-outline" size={26} color={theme.text} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>Contacts</Text>
                            <Text className="font-bold text-xs uppercase tracking-widest opacity-60" style={{ color: theme.text }}>People & Relationships</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="flex-1">
                {/* Filter & Search */}
                <View className="px-8 pb-4">
                    <View className="flex-row items-center border rounded-2xl px-4 py-3 mb-6 shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <Ionicons name="search-outline" size={20} color={theme.mutedText} />
                        <TextInput
                            className="flex-1 ml-3 font-medium py-1"
                            placeholder="Search contacts..."
                            placeholderTextColor={theme.mutedText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={{ color: theme.text }}
                        />
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-2">
                        {[{ key: 'all', label: 'All' }, { key: 'student', label: 'Students' }, { key: 'musician', label: 'Musicians' }, { key: 'venue_manager', label: 'Venues' }].map(opt => (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setActiveFilter(opt.key as any)}
                                className={`mr-3 px-5 py-2.5 rounded-full border`}
                                style={{
                                    backgroundColor: activeFilter === opt.key ? theme.primary : theme.card,
                                    borderColor: activeFilter === opt.key ? theme.primary : theme.border
                                }}
                            >
                                <Text className={`text-xs uppercase font-black tracking-widest ${activeFilter === opt.key ? 'text-white' : ''}`} style={{ color: activeFilter === opt.key ? '#fff' : theme.mutedText }}>
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <FlatList
                    data={filteredPeople}
                    renderItem={renderRosterItem}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center pt-20">
                            <Text className="text-xl font-black text-gray-400">No Contacts Found</Text>
                            <TouchableOpacity onPress={() => router.push('/modal/person-editor')} className="mt-4">
                                <Text className="text-blue-500 font-bold">Add New Person</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />

                {/* Floating Add Button for Roster */}
                <View className="absolute bottom-8 right-8 shadow-2xl">
                    <TouchableOpacity
                        onPress={() => router.push('/modal/person-editor')}
                        className="w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-400"
                        style={{ backgroundColor: theme.primary }}
                    >
                        <Ionicons name="add" size={32} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}
