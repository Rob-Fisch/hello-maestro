import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type CampaignData = {
    code: string;
    name: string;
    lifetime_limit: number;
    trial_limit: number;
    lifetime_claimed: number;
    trial_claimed: number;
    is_active: boolean;
};

type CampaignTier = 'lifetime' | 'trial' | 'waitlist' | 'inactive';

// Genre and instrument options for waitlist form
const INSTRUMENT_OPTIONS = ['Guitar', 'Bass', 'Drums', 'Keys/Piano', 'Vocals', 'Saxophone', 'Trumpet', 'Trombone', 'Violin', 'Other'];
const GENRE_OPTIONS = ['Jazz', 'Rock', 'Pop', 'Classical', 'Blues', 'R&B/Soul', 'Country', 'Folk', 'Electronic', 'Other'];

export default function CampaignJoinPage() {
    const { code } = useLocalSearchParams<{ code: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Dark theme for landing page
    const theme = { background: '#0f172a', text: '#f8fafc', card: '#1e293b', border: '#334155' };

    const [loading, setLoading] = useState(true);
    const [campaign, setCampaign] = useState<CampaignData | null>(null);
    const [currentTier, setCurrentTier] = useState<CampaignTier>('inactive');
    const [error, setError] = useState<string | null>(null);

    // Waitlist form state
    const [waitlistEmail, setWaitlistEmail] = useState('');
    const [waitlistName, setWaitlistName] = useState('');
    const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
    const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);

    useEffect(() => {
        fetchCampaign();
    }, [code]);

    const fetchCampaign = async () => {
        if (!code) return;

        try {
            const { data, error: fetchError } = await supabase
                .from('campaigns')
                .select('*')
                .eq('code', code)
                .single();

            if (fetchError) throw fetchError;

            setCampaign(data);

            // Determine current tier
            if (!data.is_active) {
                setCurrentTier('inactive');
            } else if (data.lifetime_claimed < data.lifetime_limit) {
                setCurrentTier('lifetime');
            } else if (data.trial_claimed < data.trial_limit) {
                setCurrentTier('trial');
            } else {
                setCurrentTier('waitlist');
            }
        } catch (err) {
            console.error('Error fetching campaign:', err);
            setError('This campaign link is invalid or has expired.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = () => {
        // Navigate to auth with campaign code in params
        // The auth flow will handle claiming the spot
        router.push(`/auth?campaign=${code}&tier=${currentTier}`);
    };

    const handleWaitlistSubmit = async () => {
        if (!waitlistEmail.trim()) {
            Alert.alert('Email Required', 'Please enter your email address.');
            return;
        }

        setSubmitting(true);
        try {
            const { error: insertError } = await supabase
                .from('waitlist')
                .insert({
                    email: waitlistEmail.trim(),
                    name: waitlistName.trim() || null,
                    instruments: selectedInstruments.length > 0 ? selectedInstruments : null,
                    genres: selectedGenres.length > 0 ? selectedGenres : null,
                    campaign_code: code
                });

            if (insertError) throw insertError;

            setWaitlistSubmitted(true);
        } catch (err) {
            console.error('Waitlist error:', err);
            Alert.alert('Error', 'Could not join waitlist. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const toggleSelection = (item: string, selected: string[], setSelected: (items: string[]) => void) => {
        if (selected.includes(item)) {
            setSelected(selected.filter(i => i !== item));
        } else {
            setSelected([...selected, item]);
        }
    };

    // Loading state
    if (loading) {
        return (
            <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
                <Stack.Screen options={{ headerShown: false }} />
                <ActivityIndicator size="large" color="#8b5cf6" />
            </View>
        );
    }

    // Error state
    if (error || !campaign) {
        return (
            <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="alert-circle-outline" size={64} color="#64748b" />
                <Text className="text-slate-400 mt-4 text-center text-lg">{error || 'Campaign not found'}</Text>
                <TouchableOpacity
                    onPress={() => Linking.openURL('https://opusmode.net')}
                    className="mt-6 bg-indigo-600 px-6 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">Visit OpusMode</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Inactive campaign state
    if (currentTier === 'inactive') {
        return (
            <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: theme.background }}>
                <Stack.Screen options={{ headerShown: false }} />
                <Ionicons name="time-outline" size={64} color="#64748b" />
                <Text className="text-white text-2xl font-black mt-4 text-center">Campaign Ended</Text>
                <Text className="text-slate-400 mt-2 text-center">This early access campaign has ended.</Text>
                <TouchableOpacity
                    onPress={() => Linking.openURL('https://opusmode.net')}
                    className="mt-6 bg-indigo-600 px-6 py-3 rounded-full"
                >
                    <Text className="text-white font-bold">Visit OpusMode</Text>
                </TouchableOpacity>
            </View>
        );
    }

    // Calculate remaining spots
    const lifetimeRemaining = campaign.lifetime_limit - campaign.lifetime_claimed;
    const trialRemaining = campaign.trial_limit - campaign.trial_claimed;

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* HERO HEADER */}
                <LinearGradient
                    colors={currentTier === 'lifetime' ? ['#7c3aed', '#4f46e5'] : currentTier === 'trial' ? ['#0ea5e9', '#0284c7'] : ['#64748b', '#475569']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingTop: Math.max(insets.top, 40), paddingBottom: 40, paddingHorizontal: 24 }}
                >
                    {/* Logo */}
                    <View className="flex-row items-center mb-8">
                        <View className="w-10 h-10 bg-white/20 rounded-xl items-center justify-center mr-3">
                            <Ionicons name="musical-notes" size={22} color="white" />
                        </View>
                        <Text className="text-white/80 font-black text-sm tracking-[3px]">OPUSMODE</Text>
                    </View>

                    {/* Main headline based on tier */}
                    {currentTier === 'lifetime' && (
                        <>
                            <View className="bg-yellow-400 self-start px-3 py-1.5 rounded-full mb-4">
                                <Text className="text-black font-black text-xs uppercase tracking-wider">🎉 Founding Member</Text>
                            </View>
                            <Text className="text-4xl font-black text-white leading-tight mb-3">
                                Help Us Build the Ultimate Musician's App
                            </Text>
                            <Text className="text-white/80 text-lg mb-2">
                                Get <Text className="font-black text-yellow-300">FREE Lifetime Pro</Text> in exchange for your honest feedback.
                            </Text>
                            <Text className="text-white/60 text-sm">
                                We're looking for {campaign.lifetime_limit} founding members who will try features, offer suggestions, and help shape the future of OpusMode.
                            </Text>
                        </>
                    )}

                    {currentTier === 'trial' && (
                        <>
                            <View className="bg-cyan-400 self-start px-3 py-1.5 rounded-full mb-4">
                                <Text className="text-black font-black text-xs uppercase tracking-wider">⚡ Early Access</Text>
                            </View>
                            <Text className="text-4xl font-black text-white leading-tight mb-3">
                                Get 30 Days of Pro Free
                            </Text>
                            <Text className="text-white/70 text-lg">
                                Join as an early adopter and explore all Pro features for a full month.
                            </Text>
                        </>
                    )}

                    {currentTier === 'waitlist' && (
                        <>
                            <View className="bg-slate-400 self-start px-3 py-1.5 rounded-full mb-4">
                                <Text className="text-black font-black text-xs uppercase tracking-wider">📋 Join Waitlist</Text>
                            </View>
                            <Text className="text-4xl font-black text-white leading-tight mb-3">
                                All Early Access Spots Claimed!
                            </Text>
                            <Text className="text-white/70 text-lg">
                                Join the waitlist to be notified when we open up more spots.
                            </Text>
                        </>
                    )}
                </LinearGradient>

                <View className="px-6 -mt-6">
                    {/* SPOTS REMAINING COUNTER */}
                    {(currentTier === 'lifetime' || currentTier === 'trial') && (
                        <View className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 mb-6">
                            <View className="flex-row items-center justify-between">
                                <View>
                                    <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                                        {currentTier === 'lifetime' ? 'Lifetime Pro Spots' : 'Trial Spots'}
                                    </Text>
                                    <View className="flex-row items-baseline">
                                        <Text className="text-4xl font-black text-white">
                                            {currentTier === 'lifetime' ? lifetimeRemaining : trialRemaining}
                                        </Text>
                                        <Text className="text-slate-400 ml-2">
                                            of {currentTier === 'lifetime' ? campaign.lifetime_limit : campaign.trial_limit} remaining
                                        </Text>
                                    </View>
                                </View>
                                <View className={`w-16 h-16 rounded-full items-center justify-center ${currentTier === 'lifetime' ? 'bg-purple-500/20' : 'bg-cyan-500/20'}`}>
                                    <Ionicons
                                        name={currentTier === 'lifetime' ? 'diamond' : 'flash'}
                                        size={32}
                                        color={currentTier === 'lifetime' ? '#a78bfa' : '#22d3ee'}
                                    />
                                </View>
                            </View>
                        </View>
                    )}

                    {/* SIGN UP CTA (for lifetime/trial) */}
                    {(currentTier === 'lifetime' || currentTier === 'trial') && (
                        <TouchableOpacity
                            onPress={handleSignUp}
                            activeOpacity={0.8}
                            className="mb-4"
                        >
                            <LinearGradient
                                colors={currentTier === 'lifetime' ? ['#a855f7', '#7c3aed'] : ['#06b6d4', '#0891b2']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={{ borderRadius: 16, padding: 20 }}
                            >
                                <View className="flex-row items-center justify-center">
                                    <Text className="text-white font-black text-lg mr-2">
                                        {currentTier === 'lifetime' ? 'Claim Your Lifetime Pro' : 'Start Your Free Trial'}
                                    </Text>
                                    <Ionicons name="arrow-forward" size={20} color="white" />
                                </View>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}

                    {/* FEEDBACK EXPECTATIONS BOX */}
                    {currentTier === 'lifetime' && (
                        <View className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-5 mb-8">
                            <Text className="text-yellow-300 font-black text-lg mb-2">💬 What We Ask in Return</Text>
                            <View className="gap-2">
                                <View className="flex-row items-start">
                                    <Text className="text-yellow-200/80 mr-2">•</Text>
                                    <Text className="text-yellow-200/80 flex-1">Try features and tell us what you liked and what you didn't</Text>
                                </View>
                                <View className="flex-row items-start">
                                    <Text className="text-yellow-200/80 mr-2">•</Text>
                                    <Text className="text-yellow-200/80 flex-1">Offer suggestions for improvement</Text>
                                </View>
                                <View className="flex-row items-start">
                                    <Text className="text-yellow-200/80 mr-2">•</Text>
                                    <Text className="text-yellow-200/80 flex-1">Reply to occasional feedback emails (1-2 per month)</Text>
                                </View>
                                <View className="flex-row items-start">
                                    <Text className="text-yellow-200/80 mr-2">•</Text>
                                    <Text className="text-yellow-200/80 flex-1">Be patient with us as we build and improve</Text>
                                </View>
                            </View>
                        </View>
                    )}

                    {/* WAITLIST FORM */}
                    {currentTier === 'waitlist' && !waitlistSubmitted && (
                        <View className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 mb-8">
                            <Text className="text-white font-black text-xl mb-1">Join the Waitlist</Text>
                            <Text className="text-slate-400 text-sm mb-6">We'll notify you when more spots open up.</Text>

                            {/* Email */}
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Email *</Text>
                            <TextInput
                                className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-medium mb-4"
                                placeholder="your@email.com"
                                placeholderTextColor="#64748b"
                                value={waitlistEmail}
                                onChangeText={setWaitlistEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />

                            {/* Name */}
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Name (optional)</Text>
                            <TextInput
                                className="bg-slate-900 border border-slate-700 rounded-xl p-4 text-white font-medium mb-4"
                                placeholder="Your name"
                                placeholderTextColor="#64748b"
                                value={waitlistName}
                                onChangeText={setWaitlistName}
                            />

                            {/* Instruments */}
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Instruments (optional)</Text>
                            <View className="flex-row flex-wrap gap-2 mb-4">
                                {INSTRUMENT_OPTIONS.map(inst => (
                                    <TouchableOpacity
                                        key={inst}
                                        onPress={() => toggleSelection(inst, selectedInstruments, setSelectedInstruments)}
                                        className={`px-3 py-2 rounded-full border ${selectedInstruments.includes(inst) ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}
                                    >
                                        <Text className={`text-sm font-medium ${selectedInstruments.includes(inst) ? 'text-white' : 'text-slate-400'}`}>{inst}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Genres */}
                            <Text className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Genres (optional)</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {GENRE_OPTIONS.map(genre => (
                                    <TouchableOpacity
                                        key={genre}
                                        onPress={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                                        className={`px-3 py-2 rounded-full border ${selectedGenres.includes(genre) ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-800 border-slate-700'}`}
                                    >
                                        <Text className={`text-sm font-medium ${selectedGenres.includes(genre) ? 'text-white' : 'text-slate-400'}`}>{genre}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Submit */}
                            <TouchableOpacity
                                onPress={handleWaitlistSubmit}
                                disabled={submitting}
                                className="bg-indigo-600 p-4 rounded-xl items-center"
                            >
                                <Text className="text-white font-bold text-lg">{submitting ? 'Submitting...' : 'Join Waitlist'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* WAITLIST SUCCESS */}
                    {currentTier === 'waitlist' && waitlistSubmitted && (
                        <View className="bg-emerald-900/30 border border-emerald-500/30 rounded-3xl p-6 mb-8 items-center">
                            <Ionicons name="checkmark-circle" size={48} color="#10b981" />
                            <Text className="text-white font-black text-xl mt-3 text-center">You're on the list!</Text>
                            <Text className="text-slate-400 text-center mt-2">We'll email you when more early access spots become available.</Text>
                        </View>
                    )}

                    {/* WHAT IS OPUSMODE */}
                    <View className="mb-8">
                        <Text className="text-white font-black text-2xl mb-4">What is OpusMode?</Text>
                        <Text className="text-slate-400 leading-relaxed mb-4">
                            OpusMode is the all-in-one app for serious musicians. Organize your practice, manage your gigs, track your finances, and grow your music career.
                        </Text>

                        <View className="gap-3">
                            {[
                                { icon: 'layers', title: 'Practice Routines', desc: 'Build and track structured practice sessions' },
                                { icon: 'mic', title: 'Gig Management', desc: 'Organize performances, setlists, and band communication' },
                                { icon: 'compass', title: 'AI Navigator', desc: 'Research venues, festivals, and booking opportunities' },
                                { icon: 'cash', title: 'Finance Tracking', desc: 'Track gig income and music-related expenses' },
                            ].map(feature => (
                                <View key={feature.title} className="flex-row items-start bg-slate-800/30 p-4 rounded-2xl border border-slate-700/50">
                                    <View className="w-10 h-10 bg-indigo-500/20 rounded-xl items-center justify-center mr-4">
                                        <Ionicons name={feature.icon as any} size={20} color="#a5b4fc" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-white font-bold">{feature.title}</Text>
                                        <Text className="text-slate-400 text-sm">{feature.desc}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* FOOTER */}
                    <View className="items-center py-8 border-t border-slate-800">
                        <View className="flex-row items-center gap-2 mb-2">
                            <View className="w-6 h-6 bg-indigo-500 rounded-lg items-center justify-center">
                                <Ionicons name="musical-note" size={14} color="white" />
                            </View>
                            <Text className="text-white font-black tracking-[3px]">OPUSMODE</Text>
                        </View>
                        <Text className="text-slate-500 text-xs">Built by musicians, for musicians</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
