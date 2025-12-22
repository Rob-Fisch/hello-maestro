import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useMemo, useEffect } from 'react';
import { useContentStore } from '@/store/contentStore';
import { router } from 'expo-router';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';

export default function PeopleScreen() {
    const { people = [], deletePerson, trackModuleUsage } = useContentStore();

    useEffect(() => {
        trackModuleUsage('people');
    }, []);

    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<PersonType | 'all'>('all');

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
            Alert.alert(
                "Delete Contact",
                `Are you sure you want to delete ${fullName}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: confirmDelete }
                ]
            );
        }
    };

    const getBadge = (type: PersonType) => {
        switch (type) {
            case 'student': return { label: 'Student', color: 'bg-purple-100', text: '#7e22ce', icon: 'graduation-cap' };
            case 'musician': return { label: 'Musician', color: 'bg-blue-100', text: '#2563eb', icon: 'musical-notes' };
            case 'venue_manager': return { label: 'Manager', color: 'bg-amber-100', text: '#b45309', icon: 'business' };
            case 'fan': return { label: 'Fan', color: 'bg-red-100', text: '#dc2626', icon: 'heart' };
            default: return { label: 'Other', color: 'bg-gray-100', text: '#4b5563', icon: 'person' };
        }
    };

    const renderItem = ({ item }: { item: Person }) => {
        const badge = getBadge(item.type);
        return (
            <View className="mb-4 border rounded-[32px] overflow-hidden shadow-sm mx-1" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <TouchableOpacity
                    className="p-6"
                    onPress={() => router.push(`/modal/person-editor?id=${item.id}`)}
                >
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <View className={`self-start px-3 py-1 rounded-full mb-3 flex-row items-center ${badge.color}`}>
                                <Ionicons name={badge.icon as any} size={12} color={badge.text} />
                                <Text className="text-[10px] uppercase font-black tracking-widest ml-1.5" style={{ color: badge.text }}>{badge.label}</Text>
                            </View>

                            {item.source === 'native' && (
                                <View className="self-start px-2 py-0.5 rounded-full bg-gray-100 mb-2 flex-row items-center border border-gray-200">
                                    <Ionicons name="logo-apple" size={10} color="#6b7280" />
                                    <Text className="text-[8px] font-bold text-gray-500 ml-1">SYNCED</Text>
                                </View>
                            )}

                            <Text className="text-2xl font-black leading-tight" style={{ color: theme.text }}>
                                {item.firstName} {item.lastName}
                            </Text>

                            {item.instruments && item.instruments.length > 0 ? (
                                <Text className="text-sm font-bold text-blue-600 mt-1">
                                    {item.instruments.join(', ')}
                                </Text>
                            ) : item.instrument ? (
                                <Text className="text-sm font-bold text-blue-600 mt-1">{item.instrument}</Text>
                            ) : null}

                            {item.verifiedPhone && (
                                <View className="flex-row items-center mt-2 bg-blue-50 self-start px-2 py-1 rounded-lg">
                                    <Ionicons name="checkmark-circle" size={10} color="#2563eb" />
                                    <Text className="text-[10px] font-black text-blue-600 ml-1">VERIFIED SMS</Text>
                                </View>
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

    const filterOptions: { key: PersonType | 'all'; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'student', label: 'Students' },
        { key: 'musician', label: 'Musicians' },
        { key: 'venue_manager', label: 'Managers' },
        { key: 'fan', label: 'Fans' },
    ];

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-8 pb-6" style={{ paddingTop: Math.max(insets.top, 20) }}>
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>Contacts</Text>
                        <Text className="font-medium text-base mt-1" style={{ color: theme.mutedText }}>Manage connections</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => router.push('/modal/person-editor')}
                        className="bg-blue-600 px-6 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-400"
                    >
                        <Ionicons name="add" size={24} color="white" />
                        <Text className="text-white text-lg font-bold ml-1">Add</Text>
                    </TouchableOpacity>
                </View>

                <View className="flex-row items-center border rounded-2xl px-4 py-3 mb-6 shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <Ionicons name="search-outline" size={20} color={theme.mutedText} />
                    <TextInput
                        className="flex-1 ml-3 font-medium py-1"
                        placeholder="Search..."
                        placeholderTextColor={theme.mutedText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={{ color: theme.text }}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                    {filterOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => setActiveFilter(opt.key)}
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
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                ListEmptyComponent={
                    <View className="flex-1 items-center justify-center pt-20">
                        <Text className="text-xl font-black text-gray-400">No Contacts Found</Text>
                    </View>
                }
            />
        </View>
    );
}
