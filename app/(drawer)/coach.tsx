import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Linking, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// =============================================================================
// QUERY PACK CHECKOUT URLS
// =============================================================================
const TEST_MODE = false; // Set to true for testing
const QUERY_PACK_CHECKOUT = TEST_MODE
    ? 'https://opusmode.lemonsqueezy.com/checkout/buy/71cdc811-f356-493b-aada-8094e1943b10' // Test Mode
    : 'https://opusmode.lemonsqueezy.com/checkout/buy/a49c7e53-4e13-4fff-a2a9-ac1bcd2c7ed2'; // Live Mode

const SCOUT_TEMPLATES = [
    {
        id: 'public',
        label: 'Student Stages',
        icon: 'library',
        color: 'bg-teal-500',
        description: 'Libraries, parks, & community centers.',
        isFree: true,
        requiresGenre: false,
        template: "Act as a Community Arts Coordinator in {{location}}.\nI am a musician looking for performance opportunities in public spaces and community venues within a {{radius}}-mile radius.\n\nThe Goal: A list of welcoming, low-barrier venues suitable for students, busking, or community engagement.\n\nThe Rules:\n1. Focus On: Public Libraries, Community Centers, Parks with amphitheaters, Farmers Markets, and Coffee Shops that host open mics.\n2. Exclude: 21+ Bars, Ticketed Clubs, and Private Venues requiring an agent.\n3. Scope: {{location}} + {{radius}} miles.\n4. For every venue, include a website URL or alternative contact source (Facebook page, phone number, etc.) when available.\n\nOutput Categories:\nTable 1: Community Hubs\n* Venue Name (e.g., \"Downtown Public Library\")\n* Event Value (e.g., \"Weekly Lunch Concert Series\" or \"Summer Reading Kickoff\")\n* Website/Contact (URL or alternative)\n\nTable 2: Coffee & Open Mics\n* Venue Name\n* Schedule (e.g., \"Thursdays 7pm\")\n* Vibe (e.g., \"Acoustic only, very quiet\")\n* Website/Contact\n\nTable 3: Busking & Public Squares\n* Location\n* Permit Requirements (Is a permit needed?)\n* Best Times to Play\n* Info Source (City website or relevant link)",
        goldenSample: null // It's free!
    },
    {
        id: 'gigs',
        label: 'Club Gig Hunt',
        icon: 'musical-notes',
        color: 'bg-blue-500',
        description: 'Find venues booking your genre.',
        isFree: false,
        requiresGenre: true,
        template: "Act as a veteran {{genre}} musician and scene insider located in {{location}}.\nI need a comprehensive, curated guide to the local music circuit within a {{radius}}-mile radius of my location.\n\nThe Rules:\n1. Filter Criteria: Strictly exclude venues where music is \"background noise\" (e.g., generic hotel lobbies or chain steakhouses). Focus on Listening Rooms, Clubs, and Musician-Centric venues.\n2. Scope: Include venues within {{location}} proper and the immediate surrounding metro.\n3. Audience: The output should be useful for a musician looking to book gigs or network, not just a tourist looking for dinner.\n4. For every venue, include a website URL or booking email. If no website exists, provide an alternative contact source (Facebook page, phone number, etc.).\n\nPart 1: Performance Venues (Bookable Clubs) Create a table with the following columns:\n* Venue Name\n* The \"Vibe\" (e.g., \"Strict listening room,\" \"High-energy speakeasy,\" \"Supper club\")\n* Website/Booking Contact (URL or email)\n* Musician Note (e.g., \"Has a house piano,\" or \"Bring your own PA\")\n\nPart 2: The Jam Session Circuit (Networking) Create a separate list of active recurring jam sessions. For each, include:\n* Location & Day/Time\n* Style Focus (e.g., Straight-ahead Bop, Gypsy Jazz, Fusion/Funk)\n* The \"Sit-In\" Protocol (Is it an open sign-up? Invite only? Is there a house band?)\n* Website/Info Link\nTone: Professional, encouraging, and knowledgeable.",
        goldenSample: "SAMPLE RESULT (Austin, TX - Jazz):\n\n| Venue | The Vibe | Booking Contact | Musician Note |\n|-------|----------|-----------------|---------------|\n| The Elephant Room | Underground speakeasy, authentic jazz cave | booking@elephantroom.com | House Steinway B. Strict 'No Covers' policy on weeknights. |\n| Monks Jazz | High-fidelity listening room (Livestream focus) | booking@monksjazz.com | incredible backline. strictly 90-minute sets. |\n| Parker Jazz Club | Upscale, polished supper club | info@parkerjazzclub.com | Dress code enforced. House drum kit provided. |\n\nRecurring Jam Sessions:\n1. The Gallery (Mondays 8pm) - Modern Jazz. Invite only for the first set, open after 10pm.\n2. Sahara Lounge (Thursdays 7pm) - Afrobeat/Funk. Very open, bring your horn."
    },
    {
        id: 'teach',
        label: 'Teaching Jobs',
        icon: 'school',
        color: 'bg-purple-500',
        description: 'Find schools & stores hiring.',
        isFree: false,
        requiresGenre: true,
        template: "Act as a Music Education Career Consultant and Academic Headhunter.\nI am a qualified {{genre}} Music Educator in {{location}}. I am looking for employment opportunities (Adjunct Professor, Private Instructor, or Clinician) within a {{radius}}-mile radius.\n\nThe Goal: Provide a categorized list of high-probability hiring institutions.\n\nThe Rules:\n1. Prioritize \"Commercial Music\" or \"Music Industry\" Programs: In {{location}}, {{genre}} jobs are often housed under these departments. Make sure to include them.\n2. Exclude: Generic elementary schools or chain stores with low pay rates (e.g., avoid Guitar Center Lessons).\n3. Scope: {{location}} + {{radius}} miles (include surrounding towns if relevant).\n4. For every institution, include a website URL or faculty directory link. If no website exists, provide an alternative contact method.\n\nOutput Categories: Please organize the results into three specific tables:\nTable 1: Higher Education (Adjunct/Faculty Targets)\n* Institution Name\n* Department Focus (e.g., \"School of Music\" vs. \"College of Media/Ent\")\n* Website/Faculty Directory Link\n* The \"In\" (Who is the Department Chair of {{genre}} or Commercial Music?)\n\nTable 2: Elite Private Schools & Academies\n* (Note: Target private high schools with large arts endowments)\n* School Name\n* Jazz/Music Presence (Do they have a known {{genre}} Band or Show Band?)\n* Website & Hiring Contact (Director of Arts or Music Dept)\n\nTable 3: Community Schools & Pro-Level Lesson Programs\n* Organization Name\n* Student Base (Adults/Pros vs. Beginners)\n* Website/Application Link",
        goldenSample: "SAMPLE RESULT (Boston, MA - Music Ed):\n\nTable 1: Higher Education Targets\n| Institution | Focus | Key Contact / The 'In' |\n|-------------|-------|------------------------|\n| Berklee College of Music | Contemporary Performance | Dept Chair: Ron Savage. Look for 'Adjunct' postings in April. |\n| New England Conservatory | Jazz Studies (NEC) | Jazz Dept. Often hires for 'Prep' school on weekends. |\n\nTable 2: Elite Private Programs\n| School | Music Presence | Hiring Contact |\n|--------|----------------|----------------|\n| Phillips Academy (Andover) | Massive endowment, full jazz big band | Director of Music Dept. |\n| Milton Academy | Strong arts focus | Check 'Faculty' page for p/t instrumental roles. |"
    },
    {
        id: 'tour',
        label: 'Tour Routing',
        icon: 'map',
        color: 'bg-amber-500',
        description: 'Fill a gap in your schedule.',
        isFree: false,
        requiresGenre: true,
        template: "Act as a Concert Promoter and Tour Routing Agent.\nI am booking a {{genre}} tour stop in {{location}} (and within a {{radius}}-mile radius). I need a strategic list of venues that actively book touring/national acts rather than just local residencies.\n\nThe Goal: A tiered list of venues suitable for a touring {{genre}} artist, categorized by capacity.\n\nThe Rules:\n1. Exclude: Venues that operate strictly on local residencies (e.g., small hotel bars that only hire the same local guy every Tuesday).\n2. Include: Performing Arts Centers and University Series in the surrounding area, as they often offer guarantees rather than just door splits.\n3. Scope: {{location}} + {{radius}} miles.\n4. For every venue, include a website URL or booking contact. If no website exists, provide an alternative contact method.\n\nOutput Categories: Please organize the results into these three capacity tiers:\nTier 1: Intimate Listening Rooms (Cap: 50–120)\n* Target: Solo/Duo/Trios or niche acts.\n* Venue Name & Location\n* Vibe/Genre Nuance\n* Website/Booking Method (URL or email)\n\nTier 2: The Club Circuit (Cap: 150–400)\n* Target: Established quartets/quintets with a regional draw.\n* Venue Name\n* Production Specs (Do they have a house grand piano?)\n* Website & Typical Deal Structure (If known: Door Split vs. Guarantee)\n\nTier 3: Theaters & PACs (Cap: 500+)\n* Target: Headliners or Festival packages.\n* Venue Name\n* Programming Focus\n* Website & Booking Contact/Director",
        goldenSample: "SAMPLE RESULT (Nashville, TN - Tour Stop):\n\nTier 1: Intimate Listening Rooms (50-120 cap)\n* The Bluebird Cafe: Legendary logic. Email opening is 1st Monday of the month. STRICT.\n* Rudy's Jazz Room: Authentic NOLA vibe. Steinway B on stage. booking@rudysjazzroom.com\n\nTier 2: The Club Circuit (200-400 cap)\n* 3rd & Lindsley: High production value. Home of 'The Time Jumpers'.\n* City Winery: National acts. Guarantee deals possible. Contact: Programming Director.\n\nTier 3: Theaters\n* The Ryman: The Mother Church. (Requires major agent).\n* TPAC (Polk Theater): Often rents to promoters."
    },
    {
        id: 'promote',
        label: 'PR & Radio',
        icon: 'megaphone',
        color: 'bg-rose-500',
        description: 'Find local press & radio.',
        isFree: false,
        requiresGenre: true,
        template: "Act as a {{location}}-based Music Publicist and PR Strategist.\nI am a {{genre}} artist releasing new music in {{location}}. I need a targeted \"Media Hit List\" of outlets within {{radius}} miles that actively cover local independent releases.\n\nThe Goal: A contact list for radio airplay and press coverage, filtered by outlets that actually support {{genre}}/Soul/Roots music.\n\nThe Rules:\n1. Exclude: Top 40/Commercial Country stations or Pay-to-Play blogs.\n2. Focus On: Public Radio (NPR affiliates), Community Radio, and independent arts journalism.\n3. Detail Level: Include specific Show Hosts or Editors where possible, not just generic \"info@\" emails.\n4. For every outlet, include a website URL or submission link. If no website exists, provide the best available contact method.\n\nOutput Categories: Please organize the results into these three targeted tables:\nTable 1: Radio Airplay (The \"Big Three\" & Community)\n* Station Call Letters\n* Target Show/Host\n* Website/Submission Link\n* Submission Protocol (Crucial: Do they want MP3s, WAV links, or physical CDs?)\n\nTable 2: Music Journalism (Blogs & Weeklies)\n* Outlet Name\n* Website\n* Key Contact (Name of the Music Editor)\n* Pitch Angle (e.g., \"Focus on the local premiere,\" or \"Best for show previews\")\n\nTable 3: Niche Podcasts & Curators\n* Name\n* Website/Link\n* Focus (e.g., \"Deep dive interviews\" or \"Spotify Playlisters\")",
        goldenSample: "SAMPLE RESULT (Seattle, WA - PR):\n\nTable 1: Radio Airplay\n| Station | Show/Host | Usage |\n|---------|-----------|-------|\n| KEXP 90.3 | 'Street Sounds' or 'Swingin Doors' | Use the Digital Submission form on their site. DO NOT cold email DJs.\n| KNKX 88.5 | Jazz/Blues host | Accepts CD submissions by mail (Attn: Music Director).\n\nTable 2: Journalism\n| Outlet | Contact | Angle |\n|--------|---------|-------|\n| The Stranger | Music Editor | Focus on 'Upcoming Show Previews' 2 weeks out.\n| Seattle Times | Arts Desk | only covers major releases/touring acts."
    },
    {
        id: 'repair',
        label: 'Pro Shops',
        icon: 'build',
        color: 'bg-emerald-500',
        description: 'Find luthiers & repair techs.',
        isFree: true,
        requiresGenre: false,
        template: "Act as a veteran {{location}} session musician and instrument technician.\nI am a professional musician located in {{location}}. I need a curated list of the \"industry standard\" repair shops, luthiers, and vintage gear dealers within a {{radius}}-mile radius.\n\nThe Rules:\n1. Strictly Exclude: Big box retailers (Guitar Center, Sam Ash) or general music schools.\n2. Focus On: Artisan/craftsman shops where professional symphony and session players take their gear.\n3. For every shop, include a website URL or contact method. If no website exists, provide the best available contact (phone, Facebook page, etc.).\n4. Categories Needed:\n* Woodwind & Brass Repair (Sax, Trumpet, etc.)\n* Orchestral Strings/Luthier (specifically for Upright Bass)\n* Vintage Keys & Piano (Rhodes, Wurlitzer, Acoustic tuning)\n* Guitar/Amp Repair (Archtop setups, Tube amp techs)\n* Percussion (Vintage drums/cymbals)\n\nOutput Format: Please present this as a table with the following columns:\n* Category (e.g., Woodwinds)\n* Shop/Technician Name\n* The \"Vibe\" & Reputation (e.g., \"Gritty workshop, legendary for fretwork,\" or \"High-end showroom\")\n* Website/Contact",
        goldenSample: "SAMPLE RESULT (Chicago, IL - Repair):\n\n| Category | Shop | Vibe | Contact |\n|----------|------|------|--------|\n| Sax/Woodwind | PM Woodwind Repair | The gold standard. Waiting list is 3 weeks long. | 847-xxx-xxxx |\n| Strings (Bass) | Sonksen Strings | Master luthier for CSO players. | By appointment only. |\n| Vintage Keys | Borish Electronics | Gritty shop, can fix any Rhodes or Wurlitzer. | Walk-ins okay. |"
    },
    {
        id: 'festival',
        label: 'Festival Scout',
        icon: 'sunny',
        color: 'bg-orange-500',
        description: 'Find music festivals & fairs.',
        isFree: false,
        requiresGenre: true,
        template: "Act as a Music Festival Booking Specialist and National Tour Planner.\nI am a {{genre}} artist/band based in {{location}} looking for festival performance opportunities.\n\nThe Goal: A comprehensive calendar-based list of music festivals that book {{genre}} acts, including submission windows, key contacts, and strategic notes for artists actively seeking festival slots.\n\nScope Preference: If my radius is 100 miles or less, focus on regional festivals near {{location}}. If my radius is larger ({{radius}} miles+), include major national destination festivals worth traveling for.\n\nThe Rules:\n1. Cast a Wide Net: Include festivals of ALL sizes — from major destination festivals (50,000+ attendees) down to intimate neighborhood block parties and small-town heritage festivals (500-2,000 attendees). Smaller festivals are often easier to book and great for building a touring resume.\n2. Focus On: Music Festivals (genre-specific and multi-genre), Arts Fairs with live music stages, Cultural/Heritage Festivals, County/State Fairs, and Food/Wine/Craft festivals with curated music.\n3. Include: Typical annual dates, submission deadlines, approximate attendance size, and whether they accept direct artist submissions.\n4. Quantity Goal: Aim for 8-12 results per table where possible. More options = more booking opportunities.\n5. For each festival, indicate if it's a 'destination' (people travel to attend) or 'regional/local draw'.\n6. For every festival, include a website URL or application link. If no website exists, provide the best available contact method.\n\nOutput Format:\n\nTable 1: Premier & Mid-Size Festivals (Worth Traveling For)\n* Festival Name & State\n* Website\n* Attendance (e.g., '75,000', '5,000-8,000', '~2,000')\n* Typical Dates (Month/Weekend)\n* Genre Fit (Strong/Moderate/Long Shot for {{genre}})\n* Artist Submission Window\n* Application Method/Link\n* Strategic Notes (Pay range, tips for getting selected)\n\nTable 2: Regional & Community Festivals (Within {{radius}} miles)\n* Festival Name & City/State\n* Website\n* Attendance Size\n* Dates & Vibe\n* How to Apply (with link)\n* Compensation (Flat fee range, door split, 'exposure')\n\nTable 3: The Fair Circuit (Steady Pay, Often Overlooked)\n* Fair Name & State\n* Website\n* Attendance\n* Typical Dates\n* Stage Setup (Main stage vs. beer tent vs. cultural village)\n* How to Get Booked (with contact)\n* Notes\n\nBonus: Create a 'Festival Year Planner' view grouping these by submission deadline quarter (Q1: Jan-Mar, Q2: Apr-Jun, etc.) so I know when to apply.",
        goldenSample: "SAMPLE RESULT (Jazz Artist - Midwest):\n\nTable 1: Premier & Mid-Size Festivals\n| Festival | Attendance | Dates | Fit | Apply | Notes |\n|----------|------------|-------|-----|-------|-------|\n| Detroit Jazz Festival | 400,000+ | Labor Day | Strong | Q4 | World's largest free jazz fest |\n| Rochester Intl Jazz Fest | 200,000 | June | Strong | Q4 | 1,500+ artists, apply for Club Pass |\n| Twin Cities Jazz Fest | 15,000 | June | Strong | Jan 31 | Very regional-friendly |\n| Elkhart Jazz Fest | 5,000 | June | Strong | Q4 | Covers hotels for traveling acts |\n\nTable 2: Regional Festivals\n| Festival | Size | Vibe | Apply | Comp |\n|----------|------|------|-------|------|\n| Hyde Park Jazz Fest (Chicago) | 15,000 | Free community | Email | Union scale |\n| Iowa City Jazz Fest | 8,000 | Outdoor, artsy | Online (Jan 31) | Guarantees |\n| Fox Jazz Fest (WI) | 2,500 | Park, family | Email | $500 flat |\n\n📅 Year Planner:\nQ1: Twin Cities, Iowa City, Hyde Park\nQ4: Detroit, Rochester"
    }
];

const PRESET_GENRES = ['Jazz', 'Classical', 'Rock', 'Pop', 'Folk', 'Blues', 'R&B', 'Electronic', 'Latin', 'Country', 'Metal', 'Soul', 'Funk', 'Bluegrass'];

import { supabase } from '@/lib/supabase';
import * as Clipboard from 'expo-clipboard';
import { marked } from 'marked';

// Helper to copy rich text (HTML) on web
const copyRichText = async (markdown: string) => {
    if (Platform.OS === 'web') {
        try {
            const html = await marked(markdown);
            const blob = new Blob([html], { type: 'text/html' });
            const plainBlob = new Blob([markdown], { type: 'text/plain' });
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html': blob,
                    'text/plain': plainBlob
                })
            ]);
            return true;
        } catch (e) {
            // Fallback to plain text
            await Clipboard.setStringAsync(markdown);
            return false;
        }
    } else {
        // Mobile: plain text only
        await Clipboard.setStringAsync(markdown);
        return false;
    }
};

// Geocoding helper - converts zip/city to full location (US only)
interface GeoLocation {
    city: string;
    county: string;
    state: string;
    country: string;
    displayName: string;
}

const geocodeLocation = async (zipOrCity: string): Promise<GeoLocation | null> => {
    try {
        // Use Nominatim (OpenStreetMap) - free, no API key needed
        const query = encodeURIComponent(`${zipOrCity}, USA`);
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${query}&format=json&addressdetails=1&limit=1`,
            { headers: { 'User-Agent': 'HelloMaestro/1.0' } }
        );

        if (!response.ok) return null;

        const results = await response.json();
        if (!results || results.length === 0) return null;

        const addr = results[0].address;
        return {
            city: addr.city || addr.town || addr.village || addr.hamlet || zipOrCity,
            county: addr.county || '',
            state: addr.state || '',
            country: addr.country || 'United States',
            displayName: results[0].display_name
        };
    } catch (e) {
        console.error('Geocoding error:', e);
        return null;
    }
};

export default function CoachV2Screen() {
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
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [customGenre, setCustomGenre] = useState('');
    const [showGenreModal, setShowGenreModal] = useState(false);

    // AI Response State
    const [isRunning, setIsRunning] = useState(false);
    const [aiResponse, setAiResponse] = useState<string | null>(null);
    const [queryInfo, setQueryInfo] = useState<{ used: number; limit: number; remaining: number } | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);

    // Template scroll ref for arrow navigation
    const templateScrollRef = useRef<ScrollView>(null);
    const [templateScrollPosition, setTemplateScrollPosition] = useState(0);

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

    const handleRunResearch = async () => {
        // Validate inputs
        if (!zip.trim()) {
            Alert.alert('Missing Location', 'Please enter a zip code or city.');
            return;
        }

        // Validate genre for templates that require it
        if (activeTemplate.requiresGenre && selectedGenres.length === 0) {
            Alert.alert('Missing Genre', 'Please select at least one genre for better results.');
            return;
        }

        setIsRunning(true);
        setAiError(null);
        setAiResponse(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                setAiError('Please log in to use AI Research.');
                return;
            }

            // Geocode the location for accurate context
            const geoLocation = await geocodeLocation(zip.trim());

            // Build enhanced prompt with accurate location
            let enhancedPrompt = generatedPrompt;
            if (geoLocation) {
                const locationContext = `\n\n**VERIFIED LOCATION CONTEXT**: The user is searching near ${geoLocation.city}, ${geoLocation.county ? geoLocation.county + ', ' : ''}${geoLocation.state}, ${geoLocation.country}. Use this verified location for all recommendations.\n`;
                enhancedPrompt = locationContext + generatedPrompt;
            }

            const response = await fetch(
                `${process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://iwobmkglhkuzwouheviu.supabase.co'}/functions/v1/navigator-ai`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        prompt: enhancedPrompt,
                        templateId: activeTemplate.id,
                        isFreeTemplate: activeTemplate.isFree
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                if (response.status === 429) {
                    const templateType = result.templateType === 'pro' ? 'Pro template' : 'Free template';
                    setAiError(`Monthly ${templateType} limit reached (${result.used}/${result.limit}). Resets next month.`);
                } else if (response.status === 403) {
                    if (result.tasteTestUsed !== undefined) {
                        setAiError(`You've used all ${result.tasteTestLimit} free Pro samples. Upgrade to Pro for unlimited access!`);
                    } else {
                        setAiError('Pro subscription required for AI Research.');
                    }
                } else {
                    setAiError(result.error || 'Research failed. Please try again.');
                }
                return;
            }

            setAiResponse(result.response);
            setQueryInfo(result.queryInfo);
        } catch (error: any) {
            setAiError(error.message || 'Network error. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <KeyboardAvoidingViewWrapper theme={theme}>
            <View style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={{ flexGrow: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className="px-8 pb-3" style={{ paddingTop: Math.max(insets.top, 20) }}>
                        {/* Header with Home Button */}
                        <View className="flex-row justify-between items-center mb-6">
                            <View className="flex-row items-center flex-1 mr-4">
                                <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-4 p-2 -ml-2 rounded-full">
                                    <Ionicons name="menu" size={26} color={theme.text} />
                                </TouchableOpacity>
                                <View className="flex-1">
                                    <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>The Navigator</Text>
                                    <Text className="font-bold text-[10px] uppercase tracking-widest opacity-40" style={{ color: theme.text }}>AI Career Guidance</Text>
                                </View>
                            </View>
                        </View>

                        {/* Mission Selector with Arrow Navigation */}
                        <View className="relative">
                            <Text className="text-secondary font-black uppercase tracking-widest text-xs mb-4 ml-6">Select Mission</Text>

                            {/* Left Arrow */}
                            {templateScrollPosition > 0 && (
                                <TouchableOpacity
                                    onPress={() => {
                                        const newPos = Math.max(0, templateScrollPosition - 300);
                                        templateScrollRef.current?.scrollTo({ x: newPos, animated: true });
                                    }}
                                    className="absolute left-0 top-12 z-10 w-10 h-10 items-center justify-center rounded-full"
                                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                                >
                                    <Ionicons name="chevron-back" size={24} color="white" />
                                </TouchableOpacity>
                            )}

                            {/* Right Arrow (always show initially, hide when at end) */}
                            <TouchableOpacity
                                onPress={() => {
                                    const newPos = templateScrollPosition + 300;
                                    templateScrollRef.current?.scrollTo({ x: newPos, animated: true });
                                }}
                                className="absolute right-0 top-12 z-10 w-10 h-10 items-center justify-center rounded-full"
                                style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                            >
                                <Ionicons name="chevron-forward" size={24} color="white" />
                            </TouchableOpacity>

                            <ScrollView
                                ref={templateScrollRef}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                className="mb-4 -mx-6 px-12 ml-0 pl-6"
                                onScroll={(e) => setTemplateScrollPosition(e.nativeEvent.contentOffset.x)}
                                scrollEventThrottle={16}
                            >
                                {SCOUT_TEMPLATES.map((t) => {
                                    const isActive = t.id === selectedTemplateId;
                                    return (
                                        <TouchableOpacity
                                            key={t.id}
                                            onPress={() => setSelectedTemplateId(t.id)}
                                            activeOpacity={0.7}
                                            className={`p-4 rounded-2xl mr-4 w-36 border h-36 justify-between ${isActive ? '' : 'opacity-60'}`}
                                            style={{
                                                backgroundColor: isActive ? theme.card : theme.background,
                                                borderColor: isActive ? theme.primary : theme.border,
                                                borderWidth: isActive ? 2 : 1
                                            }}
                                        >
                                            <View className={`w-10 h-10 rounded-full items-center justify-center ${t.color}`}>
                                                <Ionicons name={t.icon as any} size={20} color="white" />
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
                                                <Text className="font-black text-base leading-tight" style={{ color: theme.text }}>{t.label}</Text>
                                                <Text className="text-[10px] leading-tight mt-1 opacity-70" numberOfLines={2} style={{ color: theme.text }}>{t.description}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>

                        {/* Hide Parameters if viewing a Locked Template on Free Tier (focus on Golden Sample) */}
                        {(profile?.isPremium || activeTemplate.isFree) && (
                            <View>
                                <View className="mb-3">
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
                                        {activeTemplate.id === 'festival' && (
                                            <Text className="text-xs mt-2 ml-1" style={{ color: theme.mutedText }}>
                                                💡 Tip: Use the nearest major city for best festival results
                                            </Text>
                                        )}
                                    </View>

                                    {/* Genre Selector Trigger */}
                                    <View className="mb-4">
                                        <Text className="text-xs font-bold mb-2 ml-1" style={{ color: theme.mutedText }}>
                                            Genres ({selectedGenres.length}) {activeTemplate.requiresGenre ? '• Required' : ''}
                                        </Text>
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

                                    {/* Radius Selector - Festival Scout gets extended options */}
                                    <View>
                                        <Text className="text-xs font-bold mb-2 ml-1" style={{ color: theme.mutedText }}>Radius: {radius} miles</Text>
                                        <View className="flex-row justify-between bg-gray-100 p-1 rounded-xl" style={{ backgroundColor: theme.card }}>
                                            {(activeTemplate.id === 'festival' ? ['50', '100', '250', '500'] : ['10', '25', '50', '100']).map((r) => (
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
                        <View className="px-8 flex-1 mb-10">
                            {
                                profile?.isPremium || activeTemplate.isFree ? (
                                    // UNLOCKED VIEW - AI POWERED
                                    <View>
                                        {/* Query Info Badge with Buy Option */}
                                        {queryInfo && (
                                            <View className="mb-4">
                                                <View className="flex-row justify-center items-center">
                                                    <View className="bg-indigo-500/10 px-3 py-1.5 rounded-full flex-row items-center">
                                                        <Ionicons name="flash" size={14} color="#6366f1" />
                                                        <Text className="text-indigo-400 text-xs font-bold ml-1">
                                                            {queryInfo.remaining} of {queryInfo.limit} queries remaining
                                                        </Text>
                                                    </View>
                                                </View>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        const url = `${QUERY_PACK_CHECKOUT}&checkout[custom][user_id]=${profile?.id}`;
                                                        Linking.openURL(url);
                                                    }}
                                                    className="flex-row justify-center items-center mt-2"
                                                >
                                                    <Ionicons name="add-circle-outline" size={14} color="#10b981" />
                                                    <Text className="text-emerald-400 text-xs font-bold ml-1 underline">
                                                        Buy 10-Pack ($10)
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {/* Action Card */}
                                        <View className="p-6 rounded-3xl border mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                                            <View className="items-center mb-6">
                                                <View className="w-16 h-16 rounded-full items-center justify-center mb-4" style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)' }}>
                                                    <Ionicons name={aiResponse ? "checkmark-done-circle" : "rocket"} size={48} color={aiResponse ? '#10b981' : '#6366f1'} />
                                                </View>
                                                <Text className="text-2xl font-black text-center mb-2" style={{ color: theme.text }}>
                                                    {aiResponse ? 'Research Complete!' : 'Ready to Research'}
                                                </Text>
                                                <Text className="text-center opacity-70 leading-5" style={{ color: theme.text }}>
                                                    {aiResponse
                                                        ? `Your ${activeTemplate.label} results are below.`
                                                        : `Click below to run your ${activeTemplate.label} query with AI.`
                                                    }
                                                </Text>
                                            </View>

                                            {/* Primary: Run Research Button (Pro only) */}
                                            {profile?.isPremium && (
                                                <TouchableOpacity
                                                    onPress={handleRunResearch}
                                                    disabled={isRunning}
                                                    activeOpacity={0.7}
                                                    className="w-full py-4 rounded-xl flex-row items-center justify-center mb-3 shadow-sm"
                                                    style={{ backgroundColor: isRunning ? '#4f46e5' : '#16a34a', opacity: isRunning ? 0.7 : 1 }}
                                                >
                                                    {isRunning ? (
                                                        <>
                                                            <ActivityIndicator color="white" size="small" />
                                                            <Text className="text-white font-black text-lg ml-3 uppercase tracking-wide">Researching...</Text>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Ionicons name="flash" size={22} color="white" />
                                                            <Text className="text-white font-black text-lg ml-2 uppercase tracking-wide">Run Research</Text>
                                                        </>
                                                    )}
                                                </TouchableOpacity>
                                            )}

                                        </View>

                                        {/* Error Display */}
                                        {aiError && (
                                            <View className="p-4 rounded-2xl mb-6" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)' }}>
                                                <View className="flex-row items-center">
                                                    <Ionicons name="alert-circle" size={20} color="#dc2626" />
                                                    <Text className="text-red-400 font-bold ml-2 flex-1">{aiError}</Text>
                                                </View>
                                                {(aiError.includes('limit reached') || aiError.includes('free Pro samples')) && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            const url = `${QUERY_PACK_CHECKOUT}&checkout[custom][user_id]=${profile?.id}`;
                                                            Linking.openURL(url);
                                                        }}
                                                        className="mt-3 py-3 px-4 rounded-xl flex-row items-center justify-center"
                                                        style={{ backgroundColor: '#6366f1' }}
                                                    >
                                                        <Ionicons name="flash" size={16} color="white" />
                                                        <Text className="text-white font-bold ml-2">Get 10 More Queries ($10)</Text>
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        )}

                                        {/* AI Response Display */}
                                        {aiResponse && (
                                            <View className="rounded-3xl border mb-6 overflow-hidden" style={{ backgroundColor: theme.card, borderColor: '#16a34a' }}>
                                                {/* Header with Copy Button */}
                                                <View className="flex-row items-center justify-between p-4 border-b" style={{ borderColor: 'rgba(22, 163, 74, 0.3)' }}>
                                                    <View className="flex-row items-center">
                                                        <Ionicons name="sparkles" size={20} color="#16a34a" />
                                                        <Text className="text-green-400 font-black uppercase text-xs ml-2">AI Results</Text>
                                                    </View>
                                                    <TouchableOpacity
                                                        onPress={async () => {
                                                            const richCopy = await copyRichText(aiResponse);
                                                            if (Platform.OS === 'web') {
                                                                alert(richCopy ? 'Copied as formatted text!' : 'Results copied to clipboard!');
                                                            } else {
                                                                Alert.alert('Copied!', 'Results copied to clipboard.');
                                                            }
                                                        }}
                                                        className="flex-row items-center bg-green-600/20 px-3 py-1.5 rounded-lg"
                                                    >
                                                        <Ionicons name="copy-outline" size={14} color="#16a34a" />
                                                        <Text className="text-green-400 text-xs font-bold ml-1">Copy Results</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {/* Scrollable Results */}
                                                <ScrollView
                                                    style={{ maxHeight: 500 }}
                                                    nestedScrollEnabled
                                                    showsVerticalScrollIndicator
                                                >
                                                    <View className="p-5">
                                                        <Markdown
                                                            style={{
                                                                body: { color: theme.text, fontSize: 14, lineHeight: 22 },
                                                                heading1: { color: theme.text, fontSize: 20, fontWeight: '800', marginBottom: 8 },
                                                                heading2: { color: theme.text, fontSize: 18, fontWeight: '700', marginTop: 16, marginBottom: 8 },
                                                                heading3: { color: theme.text, fontSize: 16, fontWeight: '700', marginTop: 12, marginBottom: 6 },
                                                                strong: { fontWeight: '700' },
                                                                link: { color: '#6366f1' },
                                                                table: { borderWidth: 1, borderColor: theme.border, marginVertical: 12 },
                                                                tr: { borderBottomWidth: 1, borderColor: theme.border },
                                                                th: { padding: 8, backgroundColor: 'rgba(99, 102, 241, 0.1)', fontWeight: '700' },
                                                                td: { padding: 8 },
                                                                bullet_list: { marginVertical: 8 },
                                                                ordered_list: { marginVertical: 8 },
                                                                list_item: { marginVertical: 4 },
                                                                blockquote: { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderLeftWidth: 4, borderLeftColor: '#6366f1', paddingLeft: 12, marginVertical: 8 },
                                                                code_inline: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 4, borderRadius: 4, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
                                                                fence: { backgroundColor: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 8, marginVertical: 8 },
                                                            }}
                                                        >
                                                            {aiResponse}
                                                        </Markdown>
                                                    </View>
                                                </ScrollView>
                                                {/* Disclaimer Footer */}
                                                <View className="px-4 py-3 border-t" style={{ borderColor: 'rgba(22, 163, 74, 0.2)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                                                    <View className="flex-row items-start">
                                                        <Ionicons name="information-circle-outline" size={14} color={theme.mutedText} style={{ marginTop: 2, marginRight: 6 }} />
                                                        <Text style={{ color: theme.mutedText, fontSize: 11, lineHeight: 16, flex: 1 }}>
                                                            AI results may contain inaccuracies. Please verify venue details, contact info, and event dates before making commitments.
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>
                                        )}

                                        {/* Collapsible Raw Prompt - Only show for Free templates (Pro templates keep prompts proprietary) */}
                                        {activeTemplate.isFree && (
                                            <>
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
                                            </>
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
                </ScrollView >
            </View >
        </KeyboardAvoidingViewWrapper >
    );
}

// Helper to avoid Web layout issues with KeyboardAvoidingView
function KeyboardAvoidingViewWrapper({ children, theme }: { children: React.ReactNode, theme: any }) {
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1, backgroundColor: theme.background }}>
                {children}
            </View>
        );
    }
    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1, backgroundColor: theme.background }}
        >
            {children}
        </KeyboardAvoidingView>
    );
}
