import { PremiumGate } from '@/components/PremiumGate';
import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
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
        template: "Act as a veteran {{genre}} musician and scene insider located in {{location}}.\nI need a comprehensive, curated guide to the local music circuit within a {{radius}}-mile radius of my location.\n\nThe Rules:\n1. Filter Criteria: Strictly exclude venues where music is \"background noise\" (e.g., generic hotel lobbies or chain steakhouses). Focus on Listening Rooms, Clubs, and Musician-Centric venues.\n2. Scope: Include venues within {{location}} proper and the immediate surrounding metro.\n3. Audience: The output should be useful for a musician looking to book gigs or network, not just a tourist looking for dinner.\n\nPart 1: Performance Venues (Bookable Clubs) Create a table with the following columns:\n* Venue Name\n* The \"Vibe\" (e.g., \"Strict listening room,\" \"High-energy speakeasy,\" \"Supper club\")\n* Booking/Contact Info (Website or Booking Email if public)\n* Musician Note (e.g., \"Has a house piano,\" or \"Bring your own PA\")\n\nPart 2: The Jam Session Circuit (Networking) Create a separate list of active recurring jam sessions. For each, include:\n* Location & Day/Time\n* Style Focus (e.g., Straight-ahead Bop, Gypsy Jazz, Fusion/Funk)\n* The \"Sit-In\" Protocol (Is it an open sign-up? Invite only? Is there a house band?)\nTone: Professional, encouraging, and knowledgeable."
    },
    {
        id: 'teach',
        label: 'Teaching',
        icon: 'school',
        color: 'bg-purple-500',
        description: 'Find schools & stores hiring.',
        template: "Act as a Music Education Career Consultant and Academic Headhunter.\nI am a qualified {{genre}} Music Educator in {{location}}. I am looking for employment opportunities (Adjunct Professor, Private Instructor, or Clinician) within a {{radius}}-mile radius.\n\nThe Goal: Provide a categorized list of high-probability hiring institutions.\n\nThe Rules:\n1. Prioritize \"Commercial Music\" or \"Music Industry\" Programs: In {{location}}, {{genre}} jobs are often housed under these departments. Make sure to include them.\n2. Exclude: Generic elementary schools or chain stores with low pay rates (e.g., avoid Guitar Center Lessons).\n3. Scope: {{location}} + {{radius}} miles (include surrounding towns if relevant).\n\nOutput Categories: Please organize the results into three specific tables:\nTable 1: Higher Education (Adjunct/Faculty Targets)\n* Institution Name\n* Department Focus (e.g., \"School of Music\" vs. \"College of Media/Ent\")\n* The \"In\" (Who is the Department Chair of {{genre}} or Commercial Music? Or link to the Faculty Directory).\n\nTable 2: Elite Private Schools & Academies\n* (Note: Target private high schools with large arts endowments)\n* School Name\n* Jazz/Music Presence (Do they have a known {{genre}} Band or Show Band?)\n* Hiring Contact (Director of Arts or Music Dept).\n\nTable 3: Community Schools & Pro-Level Lesson Programs\n* Organization Name\n* Student Base (Adults/Pros vs. Beginners)\n* Application Method (Website link or Contact email)."
    },
    {
        id: 'tour',
        label: 'Tour Stop',
        icon: 'map',
        color: 'bg-amber-500',
        description: 'Fill a gap in your schedule.',
        template: "Act as a Concert Promoter and Tour Routing Agent.\nI am booking a {{genre}} tour stop in {{location}} (and within a {{radius}}-mile radius). I need a strategic list of venues that actively book touring/national acts rather than just local residencies.\n\nThe Goal: A tiered list of venues suitable for a touring {{genre}} artist, categorized by capacity.\n\nThe Rules:\n1. Exclude: Venues that operate strictly on local residencies (e.g., small hotel bars that only hire the same local guy every Tuesday).\n2. Include: Performing Arts Centers and University Series in the surrounding area, as they often offer guarantees rather than just door splits.\n3. Scope: {{location}} + {{radius}} miles.\n\nOutput Categories: Please organize the results into these three capacity tiers:\nTier 1: Intimate Listening Rooms (Cap: 50–120)\n* Target: Solo/Duo/Trios or niche acts.\n* Venue Name & Location\n* Vibe/Genre Nuance\n* Booking Method (Website form vs. Email address)\n\nTier 2: The Club Circuit (Cap: 150–400)\n* Target: Established quartets/quintets with a regional draw.\n* Venue Name\n* Production Specs (Do they have a house grand piano?)\n* Typical Deal Structure (If known: Door Split vs. Guarantee)\n\nTier 3: Theaters & PACs (Cap: 500+)\n* Target: Headliners or Festival packages.\n* Venue Name\n* Programming Focus\n* Booking Contact/Director"
    },
    {
        id: 'promote',
        label: 'Promotion',
        icon: 'megaphone',
        color: 'bg-rose-500',
        description: 'Find local press & radio.',
        template: "Act as a {{location}}-based Music Publicist and PR Strategist.\nI am a {{genre}} artist releasing new music in {{location}}. I need a targeted \"Media Hit List\" of outlets within {{radius}} miles that actively cover local independent releases.\n\nThe Goal: A contact list for radio airplay and press coverage, filtered by outlets that actually support {{genre}}/Soul/Roots music.\n\nThe Rules:\n1. Exclude: Top 40/Commercial Country stations or Pay-to-Play blogs.\n2. Focus On: Public Radio (NPR affiliates), Community Radio, and independent arts journalism.\n3. Detail Level: Include specific Show Hosts or Editors where possible, not just generic \"info@\" emails.\n\nOutput Categories: Please organize the results into these three targeted tables:\nTable 1: Radio Airplay (The \"Big Three\" & Community)\n* Station Call Letters\n* Target Show/Host\n* Submission Protocol (Crucial: Do they want MP3s, WAV links, or physical CDs?)\n\nTable 2: Music Journalism (Blogs & Weeklies)\n* Outlet Name\n* Key Contact (Name of the Music Editor)\n* Pitch Angle (e.g., \"Focus on the local premiere,\" or \"Best for show previews\")\n\nTable 3: Niche Podcasts & Curators\n* Name\n* Focus (e.g., \"Deep dive interviews\" or \"Spotify Playlisters\")"
    },
    {
        id: 'repair',
        label: 'Pro Shops',
        icon: 'build',
        color: 'bg-emerald-500',
        description: 'Find luthiers & repair techs.',
        template: "Act as a veteran {{location}} session musician and instrument technician.\nI am a professional musician located in {{location}}. I need a curated list of the \"industry standard\" repair shops, luthiers, and vintage gear dealers within a {{radius}}-mile radius.\n\nThe Rules:\n1. Strictly Exclude: Big box retailers (Guitar Center, Sam Ash) or general music schools.\n2. Focus On: Artisan/craftsman shops where professional symphony and session players take their gear.\n3. Categories Needed:\n* Woodwind & Brass Repair (Sax, Trumpet, etc.)\n* Orchestral Strings/Luthier (specifically for Upright Bass)\n* Vintage Keys & Piano (Rhodes, Wurlitzer, Acoustic tuning)\n* {{genre}} Guitar/Amp Repair (Archtop setups, Tube amp techs)\n* Percussion (Vintage drums/cymbals)\n\nOutput Format: Please present this as a table with the following columns:\n* Category (e.g., Woodwinds)\n* Shop/Technician Name\n* The \"Vibe\" & Reputation (e.g., \"Gritty workshop, legendary for fretwork,\" or \"High-end showroom\")\n* Location/Contact Method"
    }
];

const PRESET_GENRES = ['Jazz', 'Classical', 'Rock', 'Pop', 'Folk', 'Blues', 'R&B', 'Electronic', 'Latin', 'Country', 'Metal', 'Soul', 'Funk', 'Bluegrass'];

import * as Clipboard from 'expo-clipboard';

export default function CoachScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter(); // Hooks must be used inside the component
    const navigation = useNavigation();

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

        // Grammar logic for genres
        let genreString = '[Genre]';
        if (selectedGenres.length > 0) {
            if (selectedGenres.length === 1) {
                genreString = selectedGenres[0];
            } else if (selectedGenres.length === 2) {
                genreString = `${selectedGenres[0]} and ${selectedGenres[1]}`;
            } else {
                const allButLast = selectedGenres.slice(0, -1).join(', ');
                const last = selectedGenres[selectedGenres.length - 1];
                genreString = `${allButLast}, and ${last}`;
            }
        }

        text = text.replace(/{{location}}/g, location);
        text = text.replace(/{{genre}}/g, genreString);
        text = text.replace(/{{radius}}/g, radius);
        return text;
    }, [activeTemplate, zip, selectedGenres, radius]);

    const handleCopy = async () => {
        await Clipboard.setStringAsync(generatedPrompt);
        if (Platform.OS === 'web') {
            alert('Prompt copied to clipboard!');
        } else {
            Alert.alert('Copied!', 'The prompt has been copied to your clipboard.');
        }
    };

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <View className="px-8 pb-3" style={{ paddingTop: Math.max(insets.top, 20) }}>
                {/* Header with Home Button */}
                <View className="flex-row justify-between items-center mb-6">
                    <View className="flex-row items-center flex-1 mr-4">
                        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-4 p-2 -ml-2 rounded-full">
                            <Ionicons name="menu" size={26} color={theme.text} />
                        </TouchableOpacity>
                        <View className="flex-1">
                            <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>AI Coach</Text>
                            <Text className="font-bold text-xs uppercase tracking-widest opacity-60" style={{ color: theme.text }}>AI Career Strategy</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Premium Gate Removed from Top Level */}
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
                                activeOpacity={0.7}
                                className={`p-3 rounded-2xl mr-3 w-28 border h-28 justify-between ${isActive ? '' : 'opacity-60'}`}
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
                                    className={`flex-1 py-2 items-center rounded-lg ${radius === r ? 'bg-indigo-500 shadow-sm' : ''}`}
                                    style={radius === r ? { backgroundColor: '#6366f1' } : {}}
                                >
                                    <Text className={`font-bold ${radius === r ? 'text-white' : 'text-gray-400'}`}>{r}m</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                {/* Output - GATED */}
                <PremiumGate
                    featureName="Unlock Intelligence"
                    description="Upgrade to generate unlimited, high-precision prompts for your career."
                    buttonText="Unlock AI Coach"
                    featureId="scout_generate"
                >
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
                                multiline={true}
                                scrollEnabled={true}
                                editable={false}
                                style={{
                                    color: theme.text,
                                    fontSize: 16,
                                    lineHeight: 24,
                                    fontWeight: '500',
                                    minHeight: 200, // Increased height
                                    textAlignVertical: 'top' // Android only
                                }}
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
                                    <TouchableOpacity onPress={() => setShowGenreModal(false)} className="p-2 bg-white/10 rounded-full border border-white/10">
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
                                                className={`mr-3 mb-3 px-5 py-3 rounded-xl border ${isSelected ? 'bg-indigo-500' : 'bg-card'}`}
                                                style={{
                                                    borderColor: isSelected ? '#6366f1' : theme.border,
                                                    backgroundColor: isSelected ? '#6366f1' : theme.card
                                                }}
                                            >
                                                <Text className={`font-bold ${isSelected ? 'text-white' : ''}`} style={{ color: isSelected ? '#fff' : theme.text }}>{g}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <TouchableOpacity
                                    onPress={() => setShowGenreModal(false)}
                                    className="bg-indigo-500 py-4 rounded-2xl items-center mt-4 mb-8"
                                    style={{ backgroundColor: '#6366f1' }}
                                >
                                    <Text className="text-white font-black text-lg">Done ({selectedGenres.length} Selected)</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </PremiumGate>
            </ScrollView>
        </View>
    );
}
