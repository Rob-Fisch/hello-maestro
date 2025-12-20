import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, Platform, ScrollView } from 'react-native';
import { useState, useMemo } from 'react';
import { useContentStore } from '@/store/contentStore';
import { useRouter, Link } from 'expo-router';
import { Person, PersonType } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';

export default function PeopleScreen() {
    const { people = [], deletePerson } = useContentStore();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<PersonType | 'all'>('all');

    const filteredPeople = useMemo(() => {
        return people
            .filter(p => activeFilter === 'all' || p.type === activeFilter)
            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.instrument?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [people, activeFilter, searchQuery]);

    const handleDelete = (id: string, name: string) => {
        const confirmDelete = () => deletePerson(id);

        if (Platform.OS === 'web') {
            if (confirm(`Are you sure you want to delete ${name}?`)) confirmDelete();
        } else {
            Alert.alert(
                "Delete Contact",
                `Are you sure you want to delete ${name}?`,
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Delete", style: "destructive", onPress: confirmDelete }
                ]
            );
        }
    };

    const getBadge = (type: PersonType) => {
        switch (type) {
            case 'student': return { label: 'Student', color: 'bg-purple-100 text-purple-700', icon: 'graduation-cap' };
            case 'musician': return { label: 'Musician', color: 'bg-blue-100 text-blue-700', icon: 'musical-notes' };
            case 'venue_manager': return { label: 'Manager', color: 'bg-amber-100 text-amber-700', icon: 'business' };
            case 'fan': return { label: 'Fan', color: 'bg-red-100 text-red-700', icon: 'heart' };
            default: return { label: 'Other', color: 'bg-gray-100 text-gray-700', icon: 'person' };
        }
    };

    const renderItem = ({ item }: { item: Person }) => {
        const badge = getBadge(item.type);
        return (
            <View className="mb-4 bg-white border border-gray-100 rounded-[32px] overflow-hidden shadow-sm mx-1">
                <TouchableOpacity
                    className="p-6"
                    onPress={() => router.push({ pathname: '/modal/person-editor', params: { id: item.id } })}
                >
                    <View className="flex-row justify-between items-start mb-4">
                        <View className="flex-1 mr-4">
                            <View className={`self-start px-3 py-1 rounded-full mb-3 flex-row items-center ${badge.color}`}>
                                <Ionicons name={badge.icon as any} size={12} color="currentColor" />
                                <Text className="text-[10px] uppercase font-black tracking-widest ml-1.5">{badge.label}</Text>
                            </View>
                            <Text className="text-2xl font-black text-gray-900 leading-tight">{item.name}</Text>
                            {item.instrument && (
                                <Text className="text-sm font-bold text-blue-600 mt-1">{item.instrument}</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} className="p-2">
                            <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                    </View>

                    <View className="flex-row flex-wrap gap-2 mt-2">
                        {item.email && (
                            <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                <Ionicons name="mail-outline" size={14} color="#6b7280" />
                                <Text className="text-xs font-bold text-gray-600 ml-2">{item.email}</Text>
                            </View>
                        )}
                        {item.phone && (
                            <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100">
                                <Ionicons name="call-outline" size={14} color="#6b7280" />
                                <Text className="text-xs font-bold text-gray-600 ml-2">{item.phone}</Text>
                            </View>
                        )}
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
        <View className="flex-1 bg-gray-50 shadow-inner">
            <View className="p-8 pb-4">
                <View className="flex-row justify-between items-center mb-8">
                    <View>
                        <Text className="text-4xl font-black text-gray-900 tracking-tight">People</Text>
                        <Text className="text-gray-500 font-medium text-base mt-1">Manage your connections</Text>
                    </View>
                    <Link href="/modal/person-editor" asChild>
                        <TouchableOpacity className="bg-blue-600 px-6 py-4 rounded-2xl flex-row items-center shadow-lg shadow-blue-400">
                            <Ionicons name="add" size={24} color="white" />
                            <Text className="text-white text-lg font-bold ml-1">New Contact</Text>
                        </TouchableOpacity>
                    </Link>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-6 shadow-sm">
                    <Ionicons name="search-outline" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-3 text-gray-900 font-medium py-1"
                        placeholder="Search by name, instrument, email..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                    {filterOptions.map(opt => (
                        <TouchableOpacity
                            key={opt.key}
                            onPress={() => setActiveFilter(opt.key)}
                            className={`mr-3 px-5 py-2.5 rounded-full border ${activeFilter === opt.key ? 'bg-blue-600 border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs uppercase font-black tracking-widest ${activeFilter === opt.key ? 'text-white' : 'text-gray-500'}`}>
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
                        <View className="w-32 h-32 bg-white rounded-full items-center justify-center mb-6 border border-gray-100 shadow-sm">
                            <Ionicons name="people-outline" size={60} color="#d1d5db" />
                        </View>
                        <Text className="text-2xl font-black text-gray-900">No Contacts Found</Text>
                        <Text className="text-gray-500 text-center mt-3 px-12 leading-relaxed font-medium">
                            {people.length === 0
                                ? "Your address book is empty. Tap 'New Contact' to start building your network!"
                                : "No contacts match your current search or filter criteria."}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

