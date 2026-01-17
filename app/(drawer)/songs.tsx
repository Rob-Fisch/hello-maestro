import SongEditor from '@/components/setlist/SongEditor';
import { useContentStore } from '@/store/contentStore';
import { Song } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';

export default function SongLibraryScreen() {
    const navigation = useNavigation();
    const { songs, addSong, updateSong, deleteSong } = useContentStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [selectedSong, setSelectedSong] = useState<Song | null>(null);

    // Filter songs based on search
    const filteredSongs = songs
        .filter(s =>
            s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.artist.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => a.title.localeCompare(b.title));

    const handleCreate = () => {
        const newSong: Song = {
            id: uuid.v4() as string,
            title: '',
            artist: '',
            key: '',
            bpm: undefined,
            links: [],
            notes: '',
            createdAt: new Date().toISOString(),
        };
        setSelectedSong(newSong);
        setIsEditing(true);
    };

    const handleEdit = (song: Song) => {
        setSelectedSong(song);
        setIsEditing(true);
    };

    const handleSave = (song: Song) => {
        if (songs.find(s => s.id === song.id)) {
            updateSong(song.id, song);
        } else {
            addSong(song);
        }
        setIsEditing(false);
        setSelectedSong(null);
    };

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Song",
            "Are you sure you want to delete this song? It will be removed from all set lists.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteSong(id) }
            ]
        );
    };

    if (isEditing && selectedSong) {
        return (
            <SongEditor
                initialSong={selectedSong}
                onSave={handleSave}
                onCancel={() => {
                    setIsEditing(false);
                    setSelectedSong(null);
                }}
            />
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-900">
            <View className="flex-1 bg-slate-900">
                {/* Header */}
                <View className="bg-slate-800 px-6 pt-4 pb-4 border-b border-slate-700">
                    <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center">
                            <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-4">
                                <Ionicons name="menu" size={28} color="#ffffff" />
                            </TouchableOpacity>
                            <View>
                                <Text className="text-2xl font-bold text-white">Song Library</Text>
                                <Text className="text-slate-400">{songs.length} Songs</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleCreate}
                            className="bg-indigo-600 px-4 py-2 rounded-full flex-row items-center"
                        >
                            <Ionicons name="add" size={20} color="white" />
                            <Text className="text-white font-semibold ml-1">New Song</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <View className="flex-row items-center bg-slate-700 rounded-xl px-4 py-3">
                        <Ionicons name="search" size={20} color="#94a3b8" />
                        <TextInput
                            className="flex-1 ml-2 text-base text-white"
                            placeholder="Search songs, artists..."
                            placeholderTextColor="#94a3b8"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color="#94a3b8" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Song List */}
                <ScrollView className="flex-1 px-4 pt-4">
                    {filteredSongs.length === 0 ? (
                        <View className="items-center justify-center py-20">
                            <Ionicons name="musical-notes-outline" size={64} color="#475569" />
                            <Text className="text-slate-400 text-lg mt-4 font-medium">No songs found</Text>
                            <Text className="text-slate-500 text-center mt-2 px-8">
                                Add songs to your library to start building set lists.
                            </Text>
                        </View>
                    ) : (
                        filteredSongs.map((song) => (
                            <TouchableOpacity
                                key={song.id}
                                onPress={() => handleEdit(song)}
                                className="bg-slate-800 rounded-xl p-4 mb-3 flex-row items-center shadow-sm border border-slate-700"
                            >
                                <View className="h-12 w-12 bg-indigo-900 rounded-full items-center justify-center mr-4">
                                    <Text className="text-indigo-300 font-bold text-lg">
                                        {song.key || '?'}
                                    </Text>
                                </View>

                                <View className="flex-1">
                                    <Text className="text-white font-bold text-lg">{song.title || 'Untitled'}</Text>
                                    <Text className="text-slate-400">{song.artist || 'Unknown Artist'}</Text>
                                </View>

                                {song.bpm && (
                                    <View className="bg-slate-700 px-2 py-1 rounded mr-3">
                                        <Text className="text-xs text-slate-300 font-medium">{song.bpm} BPM</Text>
                                    </View>
                                )}

                                <TouchableOpacity onPress={() => handleDelete(song.id)} className="p-2">
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </TouchableOpacity>
                        ))
                    )}
                    <View className="h-24" />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}
