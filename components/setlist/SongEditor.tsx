import { Song } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SongEditorProps {
    initialSong: Song;
    onSave: (song: Song) => void;
    onCancel: () => void;
}

export default function SongEditor({ initialSong, onSave, onCancel }: SongEditorProps) {
    const [song, setSong] = useState<Song>(initialSong);
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkLabel, setNewLinkLabel] = useState('');
    const [showLinkInput, setShowLinkInput] = useState(false);

    const handleChange = (field: keyof Song, value: any) => {
        setSong(prev => ({ ...prev, [field]: value }));
    };

    const addLink = () => {
        if (!newLinkUrl.trim()) return;

        // Simple label heuristic if empty
        let label = newLinkLabel.trim();
        if (!label) {
            if (newLinkUrl.includes('spotify')) label = 'Spotify';
            else if (newLinkUrl.includes('youtube') || newLinkUrl.includes('youtu.be')) label = 'YouTube';
            else label = 'Link';
        }

        const newLinks = [...(song.links || []), { label, url: newLinkUrl.trim() }];
        handleChange('links', newLinks);

        setNewLinkUrl('');
        setNewLinkLabel('');
        setShowLinkInput(false);
    };

    const removeLink = (index: number) => {
        const newLinks = [...(song.links || [])];
        newLinks.splice(index, 1);
        handleChange('links', newLinks);
    };

    const isValid = song.title.trim().length > 0;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="flex-1 bg-white"
        >
            <View className="flex-1 bg-slate-50">
                {/* Header */}
                <View className="bg-white px-6 pt-12 pb-4 border-b border-slate-200 flex-row justify-between items-center shadow-sm z-10">
                    <TouchableOpacity onPress={onCancel}>
                        <Text className="text-slate-600 text-base">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-800">
                        {initialSong.title ? 'Edit Song' : 'New Song'}
                    </Text>
                    <TouchableOpacity
                        onPress={() => isValid ? onSave(song) : Alert.alert('Missing Title', 'Please enter a song title.')}
                        className={!isValid ? 'opacity-50' : ''}
                    >
                        <Text className="text-indigo-600 font-bold text-base">Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-6">
                    {/* Basic Info Card */}
                    <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-100">
                        <Text className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Song Details</Text>

                        <View className="mb-4">
                            <Text className="text-slate-500 text-sm mb-1">Title *</Text>
                            <TextInput
                                className="bg-slate-50 p-3 rounded-lg text-lg font-bold text-slate-900 border border-slate-200"
                                placeholder="e.g. Mustang Sally"
                                value={song.title}
                                onChangeText={t => handleChange('title', t)}
                                autoFocus={!initialSong.title}
                            />
                        </View>

                        <View className="mb-4">
                            <Text className="text-slate-500 text-sm mb-1">Artist</Text>
                            <TextInput
                                className="bg-slate-50 p-3 rounded-lg text-base text-slate-800 border border-slate-200"
                                placeholder="e.g. Wilson Pickett"
                                value={song.artist}
                                onChangeText={t => handleChange('artist', t)}
                            />
                        </View>

                        <View className="flex-row">
                            <View className="flex-1 mr-2">
                                <Text className="text-slate-500 text-sm mb-1">Key</Text>
                                <TextInput
                                    className="bg-slate-50 p-3 rounded-lg text-base text-slate-800 border border-slate-200"
                                    placeholder="C"
                                    value={song.key || ''}
                                    onChangeText={t => handleChange('key', t)}
                                />
                            </View>
                            <View className="flex-1 ml-2">
                                <Text className="text-slate-500 text-sm mb-1">BPM</Text>
                                <TextInput
                                    className="bg-slate-50 p-3 rounded-lg text-base text-slate-800 border border-slate-200"
                                    placeholder="120"
                                    keyboardType="numeric"
                                    value={song.bpm?.toString() || ''}
                                    onChangeText={t => handleChange('bpm', t ? parseInt(t) : undefined)}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Links Section */}
                    <View className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-slate-100">
                        <View className="flex-row justify-between items-center mb-3">
                            <Text className="text-xs font-bold text-slate-400 uppercase tracking-wider">Audio Links</Text>
                            <TouchableOpacity onPress={() => setShowLinkInput(true)}>
                                <Text className="text-indigo-600 text-sm font-semibold">+ Add Link</Text>
                            </TouchableOpacity>
                        </View>

                        {(song.links || []).map((link, index) => (
                            <View key={index} className="flex-row items-center bg-slate-50 p-3 rounded-lg mb-2 border border-slate-200">
                                <Ionicons
                                    name={link.label.toLowerCase().includes('spotify') ? 'musical-notes' : 'logo-youtube'}
                                    size={20}
                                    color="#64748b"
                                />
                                <View className="flex-1 ml-3">
                                    <Text className="font-medium text-slate-700">{link.label}</Text>
                                    <Text className="text-xs text-slate-400" numberOfLines={1}>{link.url}</Text>
                                </View>
                                <TouchableOpacity onPress={() => removeLink(index)}>
                                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {showLinkInput && (
                            <View className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-2">
                                <TextInput
                                    className="bg-white p-2 rounded border border-indigo-200 mb-2 text-sm"
                                    placeholder="URL (Paste here)"
                                    value={newLinkUrl}
                                    onChangeText={setNewLinkUrl}
                                    autoCapitalize="none"
                                />
                                <TextInput
                                    className="bg-white p-2 rounded border border-indigo-200 mb-2 text-sm"
                                    placeholder="Label (Optional, e.g. Live Version)"
                                    value={newLinkLabel}
                                    onChangeText={setNewLinkLabel}
                                />
                                <View className="flex-row justify-end">
                                    <TouchableOpacity onPress={() => setShowLinkInput(false)} className="mr-3 p-1">
                                        <Text className="text-slate-500 font-medium">Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={addLink} className="p-1">
                                        <Text className="text-indigo-600 font-bold">Add</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>

                    {/* Notes Section */}
                    <View className="bg-white rounded-xl p-4 mb-20 shadow-sm border border-slate-100">
                        <Text className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Notes / Instructions</Text>
                        <TextInput
                            className="bg-slate-50 p-3 rounded-lg text-base text-slate-800 border border-slate-200 min-h-[100px]"
                            placeholder="Add performance notes, structural cues, or reminders..."
                            multiline
                            textAlignVertical="top"
                            value={song.notes || ''}
                            onChangeText={t => handleChange('notes', t)}
                        />
                    </View>
                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}
