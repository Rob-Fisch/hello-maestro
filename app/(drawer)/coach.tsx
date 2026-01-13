import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCOUT_TEMPLATES = [
    {
        id: 'public',
        label: 'Student Stages',
        icon: 'library',
        color: 'bg-teal-500',
        description: 'Libraries, parks, & community centers.',
        isFree: true,
        template: "Act as a Community Arts Coordinator in {{location}}.\nI am a musician looking for performance opportunities in public spaces and community venues within a {{radius}}-mile radius.\n\nThe Goal: A list of welcoming, low-barrier venues suitable for students, busking, or community engagement.\n\nThe Rules:\n1. Focus On: Public Libraries, Community Centers, Parks with amphitheaters, Farmers Markets, and Coffee Shops that host open mics.\n2. Exclude: 21+ Bars, Ticketed Clubs, and Private Venues requiring an agent.\n3. Scope: {{location}} + {{radius}} miles.\n\nOutput Categories:\nTable 1: Community Hubs\n* Venue Name (e.g., \"Downtown Public Library\")\n* Event Value (e.g., \"Weekly Lunch Concert Series\" or \"Summer Reading Kickoff\")\n* Contact Method (Website/Email)\n\nTable 2: Coffee & Open Mics\n* Venue Name\n* Schedule (e.g., \"Thursdays 7pm\")\n* Vibe (e.g., \"Acoustic only, very quiet\")\n\nTable 3: Busking & Public Squares\n* Location\n* Permit Requirements (Is a permit needed?)\n* Best Times to Play",
        goldenSample: null // It's free!
    },
    {
        id: 'gigs',
        label: 'Club Gig Hunt',
        icon: 'musical-notes',
        color: 'bg-blue-500',
        description: 'Find venues booking your genre.',
        isFree: false,
        template: "Act as a veteran {{genre}} musician and scene insider located in {{location}}.\nI need a comprehensive, curated guide to the local music circuit within a {{radius}}-mile radius of my location.\n\nThe Rules:\n1. Filter Criteria: Strictly exclude venues where music is \"background noise\" (e.g., generic hotel lobbies or chain steakhouses). Focus on Listening Rooms, Clubs, and Musician-Centric venues.\n2. Scope: Include venues within {{location}} proper and the immediate surrounding metro.\n3. Audience: The output should be useful for a musician looking to book gigs or network, not just a tourist looking for dinner.\n\nPart 1: Performance Venues (Bookable Clubs) Create a table with the following columns:\n* Venue Name\n* The \"Vibe\" (e.g., \"Strict listening room,\" \"High-energy speakeasy,\" \"Supper club\")\n* Booking/Contact Info (Website or Booking Email if public)\n* Musician Note (e.g., \"Has a house piano,\" or \"Bring your own PA\")\n\nPart 2: The Jam Session Circuit (Networking) Create a separate list of active recurring jam sessions. For each, include:\n* Location & Day/Time\n* Style Focus (e.g., Straight-ahead Bop, Gypsy Jazz, Fusion/Funk)\n* The \"Sit-In\" Protocol (Is it an open sign-up? Invite only? Is there a house band?)\nTone: Professional, encouraging, and knowledgeable.",
        goldenSample: "SAMPLE RESULT (Austin, TX - Jazz):\n\n| Venue | The Vibe | Booking Contact | Musician Note |\n|-------|----------|-----------------|---------------|\n| The Elephant Room | Underground speakeasy, authentic jazz cave | booking@elephantroom.com | House Steinway B. Strict 'No Covers' policy on weeknights. |\n| Monks Jazz | High-fidelity listening room (Livestream focus) | booking@monksjazz.com | incredible backline. strictly 90-minute sets. |\n| Parker Jazz Club | Upscale, polished supper club | info@parkerjazzclub.com | Dress code enforced. House drum kit provided. |\n\nRecurring Jam Sessions:\n1. The Gallery (Mondays 8pm) - Modern Jazz. Invite only for the first set, open after 10pm.\n2. Sahara Lounge (Thursdays 7pm) - Afrobeat/Funk. Very open, bring your horn."
    },
    {
        id: 'teach',
        label: 'Teaching Jobs',
        icon: 'school',
        color: 'bg-purple-500',
        description: 'Find schools & stores hiring.',
        isFree: false,
        template: "Act as a Music Education Career Consultant and Academic Headhunter.\nI am a qualified {{genre}} Music Educator in {{location}}. I am looking for employment opportunities (Adjunct Professor, Private Instructor, or Clinician) within a {{radius}}-mile radius.\n\nThe Goal: Provide a categorized list of high-probability hiring institutions.\n\nThe Rules:\n1. Prioritize \"Commercial Music\" or \"Music Industry\" Programs: In {{location}}, {{genre}} jobs are often housed under these departments. Make sure to include them.\n2. Exclude: Generic elementary schools or chain stores with low pay rates (e.g., avoid Guitar Center Lessons).\n3. Scope: {{location}} + {{radius}} miles (include surrounding towns if relevant).\n\nOutput Categories: Please organize the results into three specific tables:\nTable 1: Higher Education (Adjunct/Faculty Targets)\n* Institution Name\n* Department Focus (e.g., \"School of Music\" vs. \"College of Media/Ent\")\n* The \"In\" (Who is the Department Chair of {{genre}} or Commercial Music? Or link to the Faculty Directory).\n\nTable 2: Elite Private Schools & Academies\n* (Note: Target private high schools with large arts endowments)\n* School Name\n* Jazz/Music Presence (Do they have a known {{genre}} Band or Show Band?)\n* Hiring Contact (Director of Arts or Music Dept).\n\nTable 3: Community Schools & Pro-Level Lesson Programs\n* Organization Name\n* Student Base (Adults/Pros vs. Beginners)\n* Application Method (Website link or Contact email).",
        goldenSample: "SAMPLE RESULT (Boston, MA - Music Ed):\n\nTable 1: Higher Education Targets\n| Institution | Focus | Key Contact / The 'In' |\n|-------------|-------|------------------------|\n| Berklee College of Music | Contemporary Performance | Dept Chair: Ron Savage. Look for 'Adjunct' postings in April. |\n| New England Conservatory | Jazz Studies (NEC) | Jazz Dept. Often hires for 'Prep' school on weekends. |\n\nTable 2: Elite Private Programs\n| School | Music Presence | Hiring Contact |\n|--------|----------------|----------------|\n| Phillips Academy (Andover) | Massive endowment, full jazz big band | Director of Music Dept. |\n| Milton Academy | Strong arts focus | Check 'Faculty' page for p/t instrumental roles. |"
    },
    {
        id: 'tour',
        label: 'Tour Routing',
        icon: 'map',
        color: 'bg-amber-500',
        description: 'Fill a gap in your schedule.',
        isFree: false,
        template: "Act as a Concert Promoter and Tour Routing Agent.\nI am booking a {{genre}} tour stop in {{location}} (and within a {{radius}}-mile radius). I need a strategic list of venues that actively book touring/national acts rather than just local residencies.\n\nThe Goal: A tiered list of venues suitable for a touring {{genre}} artist, categorized by capacity.\n\nThe Rules:\n1. Exclude: Venues that operate strictly on local residencies (e.g., small hotel bars that only hire the same local guy every Tuesday).\n2. Include: Performing Arts Centers and University Series in the surrounding area, as they often offer guarantees rather than just door splits.\n3. Scope: {{location}} + {{radius}} miles.\n\nOutput Categories: Please organize the results into these three capacity tiers:\nTier 1: Intimate Listening Rooms (Cap: 50–120)\n* Target: Solo/Duo/Trios or niche acts.\n* Venue Name & Location\n* Vibe/Genre Nuance\n* Booking Method (Website form vs. Email address)\n\nTier 2: The Club Circuit (Cap: 150–400)\n* Target: Established quartets/quintets with a regional draw.\n* Venue Name\n* Production Specs (Do they have a house grand piano?)\n* Typical Deal Structure (If known: Door Split vs. Guarantee)\n\nTier 3: Theaters & PACs (Cap: 500+)\n* Target: Headliners or Festival packages.\n* Venue Name\n* Programming Focus\n* Booking Contact/Director",
        goldenSample: "SAMPLE RESULT (Nashville, TN - Tour Stop):\n\nTier 1: Intimate Listening Rooms (50-120 cap)\n* The Bluebird Cafe: Legendary logic. Email opening is 1st Monday of the month. STRICT.\n* Rudy's Jazz Room: Authentic NOLA vibe. Steinway B on stage. booking@rudysjazzroom.com\n\nTier 2: The Club Circuit (200-400 cap)\n* 3rd & Lindsley: High production value. Home of 'The Time Jumpers'.\n* City Winery: National acts. Guarantee deals possible. Contact: Programming Director.\n\nTier 3: Theaters\n* The Ryman: The Mother Church. (Requires major agent).\n* TPAC (Polk Theater): Often rents to promoters."
    },
    {
        id: 'promote',
        label: 'PR & Radio',
        icon: 'megaphone',
        color: 'bg-rose-500',
        description: 'Find local press & radio.',
        isFree: false,
        template: "Act as a {{location}}-based Music Publicist and PR Strategist.\nI am a {{genre}} artist releasing new music in {{location}}. I need a targeted \"Media Hit List\" of outlets within {{radius}} miles that actively cover local independent releases.\n\nThe Goal: A contact list for radio airplay and press coverage, filtered by outlets that actually support {{genre}}/Soul/Roots music.\n\nThe Rules:\n1. Exclude: Top 40/Commercial Country stations or Pay-to-Play blogs.\n2. Focus On: Public Radio (NPR affiliates), Community Radio, and independent arts journalism.\n3. Detail Level: Include specific Show Hosts or Editors where possible, not just generic \"info@\" emails.\n\nOutput Categories: Please organize the results into these three targeted tables:\nTable 1: Radio Airplay (The \"Big Three\" & Community)\n* Station Call Letters\n* Target Show/Host\n* Submission Protocol (Crucial: Do they want MP3s, WAV links, or physical CDs?)\n\nTable 2: Music Journalism (Blogs & Weeklies)\n* Outlet Name\n* Key Contact (Name of the Music Editor)\n* Pitch Angle (e.g., \"Focus on the local premiere,\" or \"Best for show previews\")\n\nTable 3: Niche Podcasts & Curators\n* Name\n* Focus (e.g., \"Deep dive interviews\" or \"Spotify Playlisters\")",
        goldenSample: "SAMPLE RESULT (Seattle, WA - PR):\n\nTable 1: Radio Airplay\n| Station | Show/Host | Usage |\n|---------|-----------|-------|\n| KEXP 90.3 | 'Street Sounds' or 'Swingin Doors' | Use the Digital Submission form on their site. DO NOT cold email DJs.\n| KNKX 88.5 | Jazz/Blues host | Accepts CD submissions by mail (Attn: Music Director).\n\nTable 2: Journalism\n| Outlet | Contact | Angle |\n|--------|---------|-------|\n| The Stranger | Music Editor | Focus on 'Upcoming Show Previews' 2 weeks out.\n| Seattle Times | Arts Desk | only covers major releases/touring acts."
    },
    {
        id: 'repair',
        label: 'Pro Shops',
        icon: 'build',
        color: 'bg-emerald-500',
        description: 'Find luthiers & repair techs.',
        isFree: false,
        template: "Act as a veteran {{location}} session musician and instrument technician.\nI am a professional musician located in {{location}}. I need a curated list of the \"industry standard\" repair shops, luthiers, and vintage gear dealers within a {{radius}}-mile radius.\n\nThe Rules:\n1. Strictly Exclude: Big box retailers (Guitar Center, Sam Ash) or general music schools.\n2. Focus On: Artisan/craftsman shops where professional symphony and session players take their gear.\n3. Categories Needed:\n* Woodwind & Brass Repair (Sax, Trumpet, etc.)\n* Orchestral Strings/Luthier (specifically for Upright Bass)\n* Vintage Keys & Piano (Rhodes, Wurlitzer, Acoustic tuning)\n* {{genre}} Guitar/Amp Repair (Archtop setups, Tube amp techs)\n* Percussion (Vintage drums/cymbals)\n\nOutput Format: Please present this as a table with the following columns:\n* Category (e.g., Woodwinds)\n* Shop/Technician Name\n* The \"Vibe\" & Reputation (e.g., \"Gritty workshop, legendary for fretwork,\" or \"High-end showroom\")\n* Location/Contact Method",
        goldenSample: "SAMPLE RESULT (Chicago, IL - Repair):\n\n| Category | Shop | Vibe | Contact |\n|----------|------|------|---------|\n| Sax/Woodwind | PM Woodwind Repair | The gold standard. Waiting list is 3 weeks long. | 847-xxx-xxxx |\n| Strings (Bass) | Sonksen Strings | Master luthier for CSO players. | By appointment only. |\n| Vintage Keys | Borish Electronics | Gritty shop, can fix any Rhodes or Wurlitzer. | Walk-ins okay. |"
    }
];

const PRESET_GENRES = ['Jazz', 'Classical', 'Rock', 'Pop', 'Folk', 'Blues', 'R&B', 'Electronic', 'Latin', 'Country', 'Metal', 'Soul', 'Funk', 'Bluegrass'];

import * as Clipboard from 'expo-clipboard';

export default function CoachScreen() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const router = useRouter(); // Hooks must be used inside the component
    const navigation = useNavigation();
    const { profile } = useContentStore();

    const [selectedTemplateId, setSelectedTemplateId] = useState('public');
    const [showRaw, setShowRaw] = useState(false);
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
        <>
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

                    {/* Intro Blurb */}
                    <View className="flex-row items-start mb-6">
                        <View className="mr-4 mt-1 bg-indigo-500/10 p-2 rounded-full">
                            <Ionicons name="sparkles" size={20} color={theme.primary} />
                        </View>
                        <View className="flex-1">
                            <View className="flex-row items-center justify-between mb-1">
                                <Text className="font-black text-lg" style={{ color: theme.text }}>Scout Mode.</Text>
                            </View>
                            <Text className="text-sm opacity-70 leading-5 mb-2" style={{ color: theme.text }}>
                                New to AI? Don't worry. This tool builds "prompts" for you to paste into apps like ChatGPT or Gemini. It's not magic—it's just a faster way to find venues and contacts.
                            </Text>
                            <TouchableOpacity onPress={() => router.push('/modal/help')}>
                                <Text className="font-bold text-sm" style={{ color: theme.primary }}>Read the AI Guide &rarr;</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Mission Selector */}
                <Text className="text-secondary font-black uppercase tracking-widest text-xs mb-4 ml-6">Select Mission</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-12 ml-0 pl-6">
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
                                {!t.isFree && (
                                    <View className="absolute top-2 right-2 bg-stone-900 px-1.5 py-0.5 rounded-md">
                                        <Text className="text-white text-[8px] font-black uppercase">Pro</Text>
                                    </View>
                                )}
                                {t.isFree && (
                                    <View className="absolute top-2 right-2 bg-teal-600 px-1.5 py-0.5 rounded-md">
                                        <Text className="text-white text-[8px] font-black uppercase">Free</Text>
                                    </View>
                                )}
                                <View>
                                    <Text className="font-black text-sm leading-tight" style={{ color: theme.text }}>{t.label}</Text>
                                    <Text className="text-[9px] leading-tight mt-1 opacity-70" numberOfLines={2} style={{ color: theme.text }}>{t.description}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>

                {/* Hide Parameters if viewing a Locked Template on Free Tier (focus on Golden Sample) */}
                {(profile?.isPremium || activeTemplate.isFree) && (
                    <View className="px-8">
                        <View className="mb-4">
                            <Text className="text-secondary font-black uppercase tracking-widest text-xs mb-4">Mission Parameters</Text>
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
                                    onPress={() => setShowGenreModal(!showGenreModal)}
                                    className="p-4 rounded-2xl border flex-row justify-between items-center"
                                    style={{ backgroundColor: theme.card, borderColor: theme.border }}
                                >
                                    <Text className="font-bold flex-1 mr-2" numberOfLines={1} style={{ color: selectedGenres.length ? theme.text : theme.mutedText }}>
                                        {selectedGenres.length > 0 ? selectedGenres.join(', ') : 'Select Genres...'}
                                    </Text>
                                    <Ionicons name={showGenreModal ? "chevron-up" : "chevron-down"} size={20} color={theme.mutedText} />
                                </TouchableOpacity>

                                {/* INLINE GENRE EXPANSION */}
                                {showGenreModal && (
                                    <View className="mt-2 p-4 rounded-2xl border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                        <View className="flex-row flex-wrap mb-4">
                                            {PRESET_GENRES.map(g => (
                                                <TouchableOpacity
                                                    key={g}
                                                    onPress={() => toggleGenre(g)}
                                                    className={`mr-2 mb-2 px-3 py-2 rounded-lg border ${selectedGenres.includes(g) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-200'}`}
                                                    style={selectedGenres.includes(g) ? {} : { borderColor: theme.border }}
                                                >
                                                    <Text className={`text-xs font-bold ${selectedGenres.includes(g) ? 'text-white' : ''}`} style={{ color: selectedGenres.includes(g) ? 'white' : theme.text }}>
                                                        {g}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {/* Custom Genre Input Inline */}
                                        <View className="flex-row items-center">
                                            <TextInput
                                                value={customGenre}
                                                onChangeText={setCustomGenre}
                                                placeholder="Add custom..."
                                                className="flex-1 p-3 rounded-l-xl border-t border-b border-l text-xs"
                                                style={{ borderColor: theme.border, color: theme.text, backgroundColor: theme.background }}
                                                placeholderTextColor={theme.mutedText}
                                            />
                                            <TouchableOpacity
                                                onPress={addCustomGenre}
                                                className="bg-indigo-500 h-full justify-center px-4 rounded-r-xl"
                                            >
                                                <Ionicons name="add" size={20} color="white" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                )}
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
                    </View>
                )}

                {/* Output - Dynamically Gated */}
                <View className="px-8 flex-1">
                    {
                        profile?.isPremium || activeTemplate.isFree ? (
                            // UNLOCKED VIEW
                            <View>
                                <View className="p-6 rounded-3xl border mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <View className="items-center mb-6">
                                        <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: activeTemplate.color.replace('bg-', 'bg-opacity-10 ').replace('500', '500/10') }}>
                                            <Ionicons name="checkmark-done-circle" size={48} color={activeTemplate.color === 'bg-black' ? theme.text : '#10b981'} />
                                        </View>
                                        <Text className="text-2xl font-black text-center mb-2" style={{ color: theme.text }}>Command Ready.</Text>
                                        <Text className="text-center opacity-70 leading-5" style={{ color: theme.text }}>
                                            Your custom {activeTemplate.label} prompt has been generated.
                                        </Text>
                                    </View>

                                    <TouchableOpacity
                                        onPress={handleCopy}
                                        activeOpacity={0.7}
                                        className="w-full py-4 rounded-xl flex-row items-center justify-center mb-4 shadow-sm bg-indigo-600"
                                        style={{}}
                                    >
                                        <Text className="text-white font-black text-lg mr-2 uppercase tracking-wide">Copy Command</Text>
                                        <Ionicons name="copy" size={20} color="white" />
                                    </TouchableOpacity>

                                    <Text className="text-center text-xs opacity-60 mb-2" style={{ color: theme.text }}>
                                        Next: Paste this into ChatGPT, Gemini, or Claude.
                                    </Text>
                                </View>

                                {/* Collapsible Raw Text */}
                                <TouchableOpacity
                                    onPress={() => setShowRaw(!showRaw)}
                                    className="flex-row items-center justify-center mb-4 opacity-50"
                                >
                                    <Text className="font-bold mr-1" style={{ color: theme.text }}>{showRaw ? 'Hide' : 'View'} Raw Prompt</Text>
                                    <Ionicons name={showRaw ? "chevron-up" : "chevron-down"} size={16} color={theme.text} />
                                </TouchableOpacity>

                                {showRaw && (
                                    <View className="p-4 rounded-3xl border border-dashed mb-8" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                                        <TextInput
                                            value={generatedPrompt}
                                            multiline={true}
                                            scrollEnabled={false}
                                            editable={false}
                                            style={{
                                                color: theme.mutedText,
                                                fontSize: 13,
                                                lineHeight: 20,
                                                fontWeight: '500',
                                            }}
                                        />
                                    </View>
                                )}
                            </View>
                        ) : (
                            // LOCKED VIEW (GOLDEN SAMPLE PREVIEW)
                            <View className="relative mt-4">
                                <View className="p-5 rounded-3xl border opacity-50 overflow-hidden h-64" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                    <View className="flex-row justify-between items-center mb-2">
                                        <Text className="font-black text-xs uppercase" style={{ color: theme.mutedText }}>Sample Result (Preview Only)</Text>
                                        <View className="bg-indigo-500/10 px-2 py-1 rounded-md">
                                            <Text className="text-[10px] font-bold text-indigo-500">Found {Math.floor(Math.random() * (45 - 18 + 1)) + 18} matches...</Text>
                                        </View>
                                    </View>
                                    <Text style={{ color: theme.text, fontSize: 13, lineHeight: 20 }}>
                                        {activeTemplate.goldenSample || "Upgrade to see more..."}
                                    </Text>
                                </View>

                                {/* Overlay */}
                                <View className="absolute inset-0 items-center justify-center rounded-3xl" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                    <View className="p-6 rounded-2xl shadow-xl items-center w-[90%] border" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                        <Ionicons name="lock-closed" size={32} color="#F59E0B" className="mb-2" />
                                        <Text className="font-bold text-lg text-center mb-1" style={{ color: theme.text }}>Pro Feature Locked</Text>
                                        <Text className="text-center mb-4 text-xs" style={{ color: theme.mutedText }}>Unlock to generate custom prompts for this category.</Text>
                                        <TouchableOpacity
                                            onPress={() => router.push('/modal/upgrade?feature=scout_pro' as any)}
                                            className="bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center"
                                        >
                                            <Text className="text-white font-bold mr-2">Upgrade to Pro</Text>
                                            <Ionicons name="arrow-forward" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )
                    }
                </View>

            </View>
        </>
    );
}
