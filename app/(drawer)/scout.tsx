import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCOUT_TEMPLATES = [
    {
        id: 'gigs',
        label: 'Gig Hunt',
        icon: 'musical-notes',
        color: 'bg-blue-500',
        description: 'Find venues booking your genre.',
        template: "I am a {{genre}} musician located in {{location}}. I would like to learn about venues in my area within {{radius}} miles that might host live {{genre}} music. Please provide a listing with 'Vibe' and contact methods."
    },
    {
        id: 'teach',
        label: 'Teaching',
        icon: 'school',
        color: 'bg-purple-500',
        description: 'Find schools & stores hiring.',
        template: "I am a music teacher in {{location}} specializing in {{genre}}. Please list music schools, instrument stores, and private schools within {{radius}} miles that hire adjunct professors or private instructors."
    },
    {
        id: 'tour',
        label: 'Tour Stop',
        icon: 'map',
        color: 'bg-amber-500',
        description: 'Fill a gap in your schedule.',
        template: "I am planning a tour stop in {{location}}. Please list live music venues within {{radius}} miles that book touring {{genre}} acts, categorized by capacity and genre focus."
    },
    {
        id: 'promote',
        label: 'Promotion',
        icon: 'megaphone',
        color: 'bg-rose-500',
        description: 'Find local press & radio.',
        template: "I am a {{genre}} artist releasing music in {{location}}. Please list local radio stations, music blogs, and arts weeklies within {{radius}} miles that cover local music releases."
    }
];

const PRESET_GENRES = ['Jazz', 'Classical', 'Rock', 'Pop', 'Folk', 'Blues', 'R&B', 'Electronic', 'Latin', 'Country', 'Metal', 'Soul', 'Funk', 'Bluegrass'];

export default function ScoutScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const [selectedTemplateId, setSelectedTemplateId] = useState('gigs');
    const [zip, setZip] = useState('');
    const [radius, setRadius] = useState('50'); // string for miles

    // Genre State
    const [selectedGenres, setSelectedGenres] = useState<string[]>(['Jazz']);
    const [customGenre, setCustomGenre] = useState('');
    const [showGenreModal, setShowGenreModal] = useState(false);

    const toggleGenre = (g: string) => {
        if (selectedGenres.includes(g)) {
            setSelectedGenres(selectedGenres.filter(i => i !== g));
        } else {
            setSelectedGenres([...selectedGenres, g]);
        }
    };

    const addCustomGenre = () => {
        if (customGenre.trim()) {
            setSelectedGenres([...selectedGenres, customGenre.trim()]);
            setCustomGenre('');
        }
    };

    const activeTemplate = SCOUT_TEMPLATES.find(t => t.id === selectedTemplateId) || SCOUT_TEMPLATES[0];

    const generatedPrompt = useMemo(() => {
        let text = activeTemplate.template;
        const location = zip.trim() || '[Zip Code]';
        const genreString = selectedGenres.length > 0 ? selectedGenres.join(', ') : '[Genre]';

        text = text.replace(/{{location}}/g, location);
        text = text.replace(/{{genre}}/g, genreString);
        text = text.replace(/{{radius}}/g, radius);
        return text;
    }, [activeTemplate, zip, selectedGenres, radius]);

    const handleCopy = () => {
        if (Platform.OS === 'web') {
            navigator.clipboard.writeText(generatedPrompt);
            alert('Prompt copied to clipboard!');
        } else {
            Alert.alert('Prompt Ready', 'Long-press the text below to Select All and Copy.');
        }
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
                            <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>Scout</Text>
                            <Text className="font-bold text-xs uppercase tracking-widest opacity-60" style={{ color: theme.text }}>AI Lead Generation</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-6 pt-0" contentContainerStyle={{ paddingBottom: 100 }}>
                {/* AI Primer / Intro */}
                <View className="mb-8 p-5 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <View className="flex-row items-start">
                        <Ionicons name="sparkles" size={24} color={theme.primary} style={{ marginRight: 12, marginTop: 2 }} />
                        <View className="flex-1">
                            <Text className="font-bold text-lg mb-1" style={{ color: theme.text }}>Meet Your New Roadie.</Text>
                            <Text className="text-sm leading-5 mb-3 opacity-80" style={{ color: theme.text }}>
                                New to AI? Don't worry. This tool builds "prompts" for you to paste into apps like ChatGPT or Gemini. It's not magic—it's just a faster way to find venues and contacts.
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/modal/help')}>
                                <Text className="font-bold text-sm" style={{ color: theme.primary }}>Read the AI Guide &rarr;</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Mission Selector */}
                <Text className="text-secondary font-black uppercase tracking-widest text-xs mb-4">Select Mission</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
                    {SCOUT_TEMPLATES.map((t) => {
                        const isActive = t.id === selectedTemplateId;
                        return (
                            <TouchableOpacity
                                key={t.id}
                                onPress={() => setSelectedTemplateId(t.id)}
                                className={`p-3 rounded-2xl mr-3 w-28 border h-28 justify-between ${isActive ? 'shadow-md scale-105' : 'opacity-60'}`}
                                style={{
                                    backgroundColor: isActive ? theme.card : theme.background,
                                    borderColor: isActive ? theme.primary : theme.border,
                                    borderWidth: isActive ? 2 : 1
                                }}
                            >
                                <View className={`w-8 h-8 rounded-full items-center justify-center ${t.color}`}>
                                    <Ionicons name={t.icon as any} size={16} color="white" />
                                </View>
                                <View>
                                    <Text className="font-black text-sm leading-tight" style={{ color: theme.text }}>{t.label}</Text>
                                    <Text className="text-[9px] leading-tight mt-1 opacity-70" numberOfLines={2} style={{ color: theme.text }}>{t.description}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                <View className="mb-4">
                    <Text className="text-secondary font-black uppercase tracking-widest text-xs mb-4">Mission Parameters</Text>

                    {/* Location Input */}
                    <View className="mb-4">
                        <Text className="text-xs font-bold mb-2 ml-1" style={{ color: theme.mutedText }}>Location (Zip/City)</Text>
                        <TextInput
                            value={zip}
                            onChangeText={setZip}
                            placeholder="12345 or City, State"
                            className="p-4 rounded-2xl border font-bold"
                            style={{ backgroundColor: theme.card, borderColor: theme.border, color: theme.text }}
                        />
                    </View>

                    {/* Genre Selector Trigger */}
                    <View className="mb-4">
                        <Text className="text-xs font-bold mb-2 ml-1" style={{ color: theme.mutedText }}>Genres ({selectedGenres.length})</Text>
                        <TouchableOpacity
                            onPress={() => setShowGenreModal(true)}
                            className="p-4 rounded-2xl border flex-row justify-between items-center"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <Text className="font-bold flex-1 mr-2" numberOfLines={1} style={{ color: selectedGenres.length ? theme.text : theme.mutedText }}>
                                {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Select Genres...'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color={theme.mutedText} />
                        </TouchableOpacity>
                    </View>

                    {/* Radius Selector */}
                    <View>
                        <Text className="text-xs font-bold mb-2 ml-1" style={{ color: theme.mutedText }}>Radius: {radius} miles</Text>
                        <View className="flex-row justify-between bg-gray-100 p-1 rounded-xl" style={{ backgroundColor: theme.card }}>
                            {['10', '25', '50', '100'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => setRadius(r)}
                                    className={`flex-1 py-2 items-center rounded-lg ${radius === r ? 'bg-white shadow-sm' : ''}`}
                                    style={radius === r ? { backgroundColor: theme.primary } : {}}
                                >
                                    <Text className={`font-bold ${radius === r ? 'text-white' : 'text-gray-400'}`}>{r}m</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Output */}
                <View>
                    <View className="flex-row justify-between items-end mb-2">
                        <Text className="text-secondary font-black uppercase tracking-widest text-xs">Generated Prompt</Text>
                        <TouchableOpacity onPress={handleCopy} className="flex-row items-center">
                            <Ionicons name="copy-outline" size={14} color={theme.primary} />
                            <Text className="text-xs font-bold ml-1" style={{ color: theme.primary }}>COPY</Text>
                        </TouchableOpacity>
                    </View>
                    <View className="p-4 rounded-3xl border border-dashed" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <TextInput
                            value={generatedPrompt}
                            multiline
                            numberOfLines={6}
                            scrollEnabled={false}
                            editable={false}
                            style={{ color: theme.text, fontSize: 16, lineHeight: 24, fontWeight: '500', minHeight: 144, textAlignVertical: 'top' }}
                        />
                    </View>
                    <Text className="text-center text-xs mt-4 opacity-70" style={{ color: theme.mutedText }}>
                        Paste this into your AI tool. Then, review the results and <Text className="font-bold">manually add</Text> the best opportunities to your Contacts.
                    </Text>
                </View>

                {/* GENRE MODAL */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={showGenreModal}
                    onRequestClose={() => setShowGenreModal(false)}
                >
                    <View className="flex-1 justify-end sm:justify-center bg-black/50">
                        <View className="bg-white w-full sm:w-[500px] sm:self-center h-[90%] sm:h-[80%] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl" style={{ backgroundColor: theme.background }}>

                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-2xl font-black" style={{ color: theme.text }}>Select Genres</Text>
                                <TouchableOpacity onPress={() => setShowGenreModal(false)} className="p-2 bg-gray-100 rounded-full">
                                    <Ionicons name="close" size={24} color={theme.text} />
                                </TouchableOpacity>
                            </View>

                            {/* Custom Input inside Modal */}
                            <View className="flex-row items-center border rounded-2xl px-4 py-3 mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                <TextInput
                                    className="flex-1 font-bold text-lg"
                                    placeholder="Add custom style..."
                                    placeholderTextColor={theme.mutedText}
                                    value={customGenre}
                                    onChangeText={setCustomGenre}
                                    onSubmitEditing={addCustomGenre}
                                    autoCorrect={false}
                                    style={{ color: theme.text }}
                                />
                                <TouchableOpacity onPress={addCustomGenre}>
                                    <Ionicons name="add-circle" size={32} color={customGenre.trim() ? theme.primary : theme.mutedText} />
                                </TouchableOpacity>
                            </View>

                            <Text className="font-bold text-xs uppercase tracking-widest mb-4 opacity-50" style={{ color: theme.text }}>Popular Genres</Text>

                            <ScrollView contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', paddingBottom: 40 }}>
                                {PRESET_GENRES.map(g => {
                                    const isSelected = selectedGenres.includes(g);
                                    return (
                                        <TouchableOpacity
                                            key={g}
                                            onPress={() => toggleGenre(g)}
                                            className={`mr-3 mb-3 px-5 py-3 rounded-xl border ${isSelected ? 'bg-primary' : 'bg-card'}`}
                                            style={{
                                                borderColor: isSelected ? theme.primary : theme.border,
                                                backgroundColor: isSelected ? theme.primary : theme.card
                                            }}
                                        >
                                            <Text className={`font-bold ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? '#fff' : theme.text }}>{g}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <TouchableOpacity
                                onPress={() => setShowGenreModal(false)}
                                className="bg-blue-600 py-4 rounded-2xl items-center mt-4 mb-8"
                                style={{ backgroundColor: theme.primary }}
                            >
                                <Text className="text-white font-black text-lg">Done ({selectedGenres.length} Selected)</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        </View>
    );
}
