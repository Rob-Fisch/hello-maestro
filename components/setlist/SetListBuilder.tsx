import { useContentStore } from '@/store/contentStore';
import { SetList, SetListItem, Song } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import uuid from 'react-native-uuid';

interface SetListBuilderProps {
    existingSetList?: SetList;
    eventId?: string;
    onSave: (setList: SetList) => void;
    onCancel: () => void;
}

import SongEditor from './SongEditor';

export default function SetListBuilder({ existingSetList, eventId, onSave, onCancel }: SetListBuilderProps) {
    const { songs, addSong } = useContentStore(); // Add addSong
    const [title, setTitle] = useState(existingSetList?.title || 'New Set List');
    const [items, setItems] = useState<SetListItem[]>(existingSetList?.items || []);

    const [isDirty, setIsDirty] = useState(false);

    // Song Picker Modal
    const [showSongPicker, setShowSongPicker] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // New Song Creation
    const [isCreatingSong, setIsCreatingSong] = useState(false);
    const [newSongInitialState, setNewSongInitialState] = useState<Song | null>(null);

    // Filter songs for picker
    const filteredSongs = songs.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.artist.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => a.title.localeCompare(b.title));

    // Stats
    const totalDurationSeconds = items.reduce((acc, item) => {
        if (item.type === 'song' && item.songId) {
            const song = songs.find(s => s.id === item.songId);
            return acc + (song?.durationSeconds || 0);
        }
        return acc + (item.durationSeconds || 0);
    }, 0);

    const totalDurationFormatted = `${Math.floor(totalDurationSeconds / 60)} min`;

    // Actions
    const addItem = (songOrBreak: Song | 'break') => {
        const newItem: SetListItem = {
            id: uuid.v4() as string,
            type: songOrBreak === 'break' ? 'break' : 'song',
            songId: typeof songOrBreak !== 'string' ? songOrBreak.id : undefined,
            label: songOrBreak === 'break' ? 'Break' : undefined,
            durationSeconds: songOrBreak === 'break' ? 600 : 0
        };
        setItems([...items, newItem]);
        setIsDirty(true);
        setShowSongPicker(false);
    };

    const startCreateSong = () => {
        setNewSongInitialState({
            id: uuid.v4() as string,
            title: searchQuery, // Pre-fill title with search query if it exists
            artist: '',
            key: '',
            bpm: undefined,
            links: [],
            notes: '',
            createdAt: new Date().toISOString(),
        });
        setIsCreatingSong(true);
    };

    const handleSaveNewSong = (song: Song) => {
        addSong(song);
        addItem(song); // Add immediately to set list
        setIsCreatingSong(false);
        setNewSongInitialState(null);
        setSearchQuery('');
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
        setIsDirty(true);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === items.length - 1) return;

        const newItems = [...items];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newItems[index], newItems[swapIndex]] = [newItems[swapIndex], newItems[index]];
        setItems(newItems);
        setIsDirty(true);
    };

    const handleBack = () => {
        if (isDirty) {
            if (Platform.OS === 'web') {
                if (confirm('Discard unsaved changes?')) {
                    onCancel();
                }
            } else {
                Alert.alert(
                    'Discard Changes?',
                    'You have unsaved changes. Are you sure you want to discard them?',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Discard', style: 'destructive', onPress: onCancel }
                    ]
                );
            }
        } else {
            onCancel();
        }
    };

    const saveLogic = () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please give your set list a name.');
            return null;
        }

        const setList: SetList = {
            id: existingSetList?.id || uuid.v4() as string,
            title,
            eventId,
            items,
            createdAt: existingSetList?.createdAt || new Date().toISOString(),
        };
        // In a real app we might return the ID or something, but here we just return the object
        return setList;
    };

    const handleSave = () => {
        const setList = saveLogic();
        if (setList) {
            onSave(setList);
            setIsDirty(false); // Reset dirty state, but stay on screen

            if (Platform.OS !== 'web') {
                // Optional toast or feedback
                // Alert.alert('Saved', 'Changes saved successfully.');
            }
        }
    };

    const handleSaveAndExit = () => {
        const setList = saveLogic();
        if (setList) {
            onSave(setList);
            onCancel(); // This MUST close the modal. The parent GigEditor passes `setActiveTab('logistics')` or similar to close.
        }
    };

    if (isCreatingSong && newSongInitialState) {
        return (
            <Modal visible={true} animationType="slide">
                <SongEditor
                    initialSong={newSongInitialState}
                    onSave={handleSaveNewSong}
                    onCancel={() => setIsCreatingSong(false)}
                />
            </Modal>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <View className="flex-1 bg-slate-50">
                <View className="bg-white px-4 py-3 border-b border-slate-200 flex-row justify-between items-center z-10">
                    <TouchableOpacity onPress={handleBack} className="p-2 ml-0 flex-row items-center">
                        <Text className="text-red-500 text-base font-medium">Cancel</Text>
                    </TouchableOpacity>

                    <TextInput
                        className="font-bold text-lg text-center flex-1 mx-2 bg-slate-50 p-2 rounded-lg border border-transparent focus:border-indigo-200 focus:bg-white"
                        value={title}
                        onChangeText={(t) => { setTitle(t); setIsDirty(true); }}
                        placeholder="Set List Name"
                        placeholderTextColor="#94a3b8"
                    />

                    <View className="flex-row items-center gap-2">
                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={!isDirty} // Disable save if clean
                            className={`flex-row items-center px-3 py-2 rounded-full ${isDirty ? 'bg-indigo-50' : 'bg-slate-100 opacity-50'}`}
                        >
                            <Ionicons name="save-outline" size={18} color={isDirty ? "#4f46e5" : "#94a3b8"} />
                            <Text className={`font-bold ml-1 text-xs ${isDirty ? 'text-indigo-600' : 'text-slate-400'}`}>Save</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                handleSaveAndExit();
                            }}
                            className="flex-row items-center bg-indigo-600 px-3 py-2 rounded-full shadow-sm"
                        >
                            <Ionicons name="exit-outline" size={18} color="white" style={{ transform: [{ scaleX: -1 }] }} />
                            <Text className="text-white font-bold ml-1 text-xs">Save & Exit</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Toolbar */}
                <View className="flex-row px-4 py-3 bg-white border-b border-slate-100 justify-between items-center">
                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                        {items.length} Items • ~{totalDurationFormatted}
                    </Text>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => addItem('break')}
                            className="bg-slate-100 px-3 py-2 rounded-lg flex-row items-center border border-slate-200"
                        >
                            <Ionicons name="time-outline" size={16} color="#64748b" />
                            <Text className="ml-1 text-slate-600 text-xs font-bold uppercase">Break</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowSongPicker(true)}
                            className="bg-indigo-600 px-3 py-2 rounded-lg flex-row items-center"
                        >
                            <Ionicons name="musical-note" size={16} color="white" />
                            <Text className="ml-1 text-white text-xs font-bold uppercase">Add Song</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* List */}
                <ScrollView className="flex-1 p-4">
                    {items.length === 0 ? (
                        <View className="items-center justify-center py-20 opacity-50">
                            <Ionicons name="list-outline" size={64} color="#cbd5e1" />
                            <Text className="text-slate-400 mt-4 text-center">Empty Set List</Text>
                        </View>
                    ) : (
                        items.map((item, index) => {
                            const song = item.type === 'song' ? songs.find(s => s.id === item.songId) : null;
                            const isBreak = item.type === 'break';

                            return (
                                <View
                                    key={item.id}
                                    className={`mb-2 rounded-xl p-3 flex-row items-center border ${isBreak ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200 shadow-sm'}`}
                                >
                                    <View className="mr-3 w-6 items-center">
                                        <Text className="text-slate-400 text-xs font-bold">{index + 1}</Text>
                                    </View>

                                    <View className="flex-1">
                                        {isBreak ? (
                                            <Text className="font-bold text-amber-800 text-base">Break (10 min)</Text>
                                        ) : (
                                            <>
                                                <Text className="font-bold text-slate-800 text-base">{song?.title || 'Unknown Song'}</Text>
                                                <Text className="text-slate-500 text-xs">{song?.artist} {song?.key ? `• Key: ${song.key}` : ''}</Text>
                                                {/* Song Links (YouTube, Spotify, etc.) */}
                                                {song?.links && song.links.length > 0 && (
                                                    <View className="flex-row gap-2 mt-1">
                                                        {song.links.map((link, linkIndex) => (
                                                            <TouchableOpacity
                                                                key={linkIndex}
                                                                onPress={() => {
                                                                    if (Platform.OS === 'web') {
                                                                        window.open(link.url, '_blank');
                                                                    } else {
                                                                        Linking.openURL(link.url);
                                                                    }
                                                                }}
                                                                className="flex-row items-center bg-slate-100 px-2 py-1 rounded-full"
                                                            >
                                                                <Ionicons
                                                                    name={
                                                                        link.url.includes('youtube') ? 'logo-youtube' :
                                                                            link.url.includes('spotify') ? 'logo-soundcloud' :
                                                                                'link'
                                                                    }
                                                                    size={12}
                                                                    color={
                                                                        link.url.includes('youtube') ? '#FF0000' :
                                                                            link.url.includes('spotify') ? '#1DB954' :
                                                                                '#4f46e5'
                                                                    }
                                                                />
                                                                <Text className="text-slate-600 text-[10px] ml-1 font-bold">{link.label || 'Link'}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </View>

                                    {/* Actions */}
                                    <View className="flex-row items-center ml-2">
                                        <View className="flex-col mr-2">
                                            <TouchableOpacity
                                                onPress={() => moveItem(index, 'up')}
                                                disabled={index === 0}
                                                className={`p-1 ${index === 0 ? 'opacity-20' : 'opacity-60'}`}
                                            >
                                                <Ionicons name="chevron-up" size={20} color="#334155" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => moveItem(index, 'down')}
                                                disabled={index === items.length - 1}
                                                className={`p-1 ${index === items.length - 1 ? 'opacity-20' : 'opacity-60'}`}
                                            >
                                                <Ionicons name="chevron-down" size={20} color="#334155" />
                                            </TouchableOpacity>
                                        </View>

                                        <TouchableOpacity onPress={() => removeItem(index)} className="p-2 bg-slate-100 rounded-full">
                                            <Ionicons name="close" size={16} color="#94a3b8" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            );
                        })
                    )}
                    <View className="h-24" />
                </ScrollView>
            </View>

            {/* Song Picker Modal */}
            <Modal visible={showSongPicker} animationType="slide" presentationStyle="pageSheet">
                <View className="flex-1 bg-white pt-6">
                    <View className="px-4 pb-4 border-b border-slate-100 flex-row justify-between items-center">
                        <Text className="text-lg font-bold">Add Song</Text>
                        <TouchableOpacity onPress={() => setShowSongPicker(false)} className="bg-slate-100 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="#64748b" />
                        </TouchableOpacity>
                    </View>

                    <View className="px-4 py-2 bg-slate-50">
                        <TextInput
                            className="bg-white p-3 rounded-xl border border-slate-200"
                            placeholder="Search library..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoFocus
                        />
                    </View>

                    {/* Create New Song Action - Prominently displayed if search yields no results or user wants new */}
                    <TouchableOpacity
                        onPress={startCreateSong}
                        className="mx-4 mt-3 bg-indigo-50 border-indigo-100 border p-3 rounded-xl flex-row items-center justify-center mb-2"
                    >
                        <Ionicons name="add-circle" size={24} color="#4f46e5" />
                        <Text className="ml-2 text-indigo-600 font-bold">Create "{searchQuery || 'New Song'}"</Text>
                    </TouchableOpacity>

                    <ScrollView className="flex-1 px-4">
                        {filteredSongs.map(song => (
                            <TouchableOpacity
                                key={song.id}
                                onPress={() => addItem(song)}
                                className="py-4 border-b border-slate-100 flex-row items-center"
                            >
                                <View className="h-10 w-10 bg-indigo-50 rounded-full items-center justify-center mr-3">
                                    <Text className="text-indigo-600 font-bold">{song.key || '?'}</Text>
                                </View>
                                <View>
                                    <Text className="font-bold text-slate-800 text-base">{song.title}</Text>
                                    <Text className="text-slate-500">{song.artist}</Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                        <View className="h-12" />
                    </ScrollView>
                </View>
            </Modal>
        </View >
    );
}
