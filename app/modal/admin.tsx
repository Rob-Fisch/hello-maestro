import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Admin emails - must match Edge Function
const ADMIN_EMAILS = [
    'robfisch@gmail.com',
    'antigravity-pro@opusmode.net'
];

interface UserResult {
    id: string;
    email: string;
    created_at: string;
    last_sign_in_at: string | null;
    user_metadata: {
        is_premium?: boolean;
        tier?: string;
        proSource?: string;
        display_name?: string;
    };
}

export default function AdminPanel() {
    const theme = useTheme();
    const router = useRouter();
    const { profile } = useContentStore();

    const [searchEmail, setSearchEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [userResult, setUserResult] = useState<UserResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Selected options for granting
    const [selectedTier, setSelectedTier] = useState<'pro' | 'pro_plus'>('pro');
    const [selectedSource, setSelectedSource] = useState<'promo_lifetime' | 'promo_trial'>('promo_lifetime');

    // Check if current user is admin
    const isAdmin = ADMIN_EMAILS.includes(profile?.email || '');

    const callAdminAPI = async (body: any) => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Not authenticated');

        const response = await fetch(
            `${process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://iwobmkglhkuzwouheviu.supabase.co'}/functions/v1/admin-api`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(body)
            }
        );

        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.error || 'API request failed');
        }
        return result;
    };

    const handleSearch = async () => {
        if (!searchEmail.trim()) return;

        setLoading(true);
        setError(null);
        setUserResult(null);
        setSuccessMessage(null);

        try {
            const result = await callAdminAPI({ action: 'search', email: searchEmail.trim() });
            setUserResult(result.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGrant = async () => {
        if (!userResult) return;

        const confirmGrant = () => {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            callAdminAPI({
                action: 'grant',
                userId: userResult.id,
                tier: selectedTier,
                proSource: selectedSource
            })
                .then(() => {
                    setSuccessMessage(`Granted ${selectedTier} (${selectedSource}) to ${userResult.email}`);
                    // Refresh user data
                    handleSearch();
                })
                .catch((err: any) => setError(err.message))
                .finally(() => setLoading(false));
        };

        if (Platform.OS === 'web') {
            confirmGrant();
        } else {
            Alert.alert(
                'Grant Pro Access',
                `Grant ${selectedTier} (${selectedSource}) to ${userResult.email}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Grant', onPress: confirmGrant }
                ]
            );
        }
    };

    const handleRevoke = async () => {
        if (!userResult) return;

        const confirmRevoke = () => {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);

            callAdminAPI({
                action: 'revoke',
                userId: userResult.id
            })
                .then(() => {
                    setSuccessMessage(`Revoked Pro from ${userResult.email}`);
                    // Refresh user data
                    handleSearch();
                })
                .catch((err: any) => setError(err.message))
                .finally(() => setLoading(false));
        };

        if (Platform.OS === 'web') {
            confirmRevoke();
        } else {
            Alert.alert(
                'Revoke Pro Access',
                `Revoke Pro from ${userResult.email}?`,
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Revoke', style: 'destructive', onPress: confirmRevoke }
                ]
            );
        }
    };

    // Access denied view
    if (!isAdmin) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                    <Ionicons name="lock-closed" size={64} color={theme.mutedText} />
                    <Text style={{ color: theme.text, fontSize: 20, fontWeight: '600', marginTop: 16 }}>
                        Access Denied
                    </Text>
                    <Text style={{ color: theme.mutedText, textAlign: 'center', marginTop: 8 }}>
                        Admin access required.
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={{ marginTop: 24, padding: 12, backgroundColor: theme.primary, borderRadius: 8 }}
                    >
                        <Text style={{ color: 'white', fontWeight: '600' }}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
            {/* Header */}
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: theme.border
            }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="close" size={28} color={theme.text} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '700', color: theme.text }}>
                    Admin Panel
                </Text>
                <View style={{
                    marginLeft: 'auto',
                    backgroundColor: '#dc2626',
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 4
                }}>
                    <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>ADMIN</Text>
                </View>
            </View>

            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                {/* Search Section */}
                <Text style={{ color: theme.mutedText, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
                    SEARCH USER BY EMAIL
                </Text>
                <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                    <TextInput
                        value={searchEmail}
                        onChangeText={setSearchEmail}
                        placeholder="user@example.com"
                        placeholderTextColor={theme.mutedText}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{
                            flex: 1,
                            backgroundColor: theme.card,
                            borderWidth: 1,
                            borderColor: theme.border,
                            borderRadius: 8,
                            padding: 12,
                            color: theme.text,
                            marginRight: 8
                        }}
                    />
                    <TouchableOpacity
                        onPress={handleSearch}
                        disabled={loading || !searchEmail.trim()}
                        style={{
                            backgroundColor: theme.primary,
                            paddingHorizontal: 16,
                            borderRadius: 8,
                            justifyContent: 'center',
                            opacity: loading || !searchEmail.trim() ? 0.5 : 1
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Ionicons name="search" size={20} color="white" />
                        )}
                    </TouchableOpacity>
                </View>

                {/* Error Message */}
                {error && (
                    <View style={{
                        backgroundColor: '#fee2e2',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16
                    }}>
                        <Text style={{ color: '#dc2626' }}>{error}</Text>
                    </View>
                )}

                {/* Success Message */}
                {successMessage && (
                    <View style={{
                        backgroundColor: '#dcfce7',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 16
                    }}>
                        <Text style={{ color: '#16a34a' }}>{successMessage}</Text>
                    </View>
                )}

                {/* User Result */}
                {userResult && (
                    <View style={{
                        backgroundColor: theme.card,
                        borderRadius: 12,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: theme.border
                    }}>
                        <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
                            {userResult.email}
                        </Text>

                        {/* User Details */}
                        <View style={{ marginBottom: 16 }}>
                            <DetailRow label="User ID" value={userResult.id} theme={theme} />
                            <DetailRow label="Created" value={new Date(userResult.created_at).toLocaleDateString()} theme={theme} />
                            <DetailRow label="Last Sign In" value={userResult.last_sign_in_at ? new Date(userResult.last_sign_in_at).toLocaleDateString() : 'Never'} theme={theme} />
                            <DetailRow
                                label="Premium"
                                value={userResult.user_metadata.is_premium ? '✅ Yes' : '❌ No'}
                                theme={theme}
                            />
                            <DetailRow
                                label="Tier"
                                value={userResult.user_metadata.tier || 'free'}
                                theme={theme}
                            />
                            <DetailRow
                                label="Pro Source"
                                value={userResult.user_metadata.proSource || '—'}
                                theme={theme}
                            />
                        </View>

                        {/* Grant/Revoke Section */}
                        <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }}>
                            <Text style={{ color: theme.mutedText, fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
                                MANAGE ACCESS
                            </Text>

                            {/* Tier Selector */}
                            <Text style={{ color: theme.text, marginBottom: 4 }}>Tier:</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 12 }}>
                                <TouchableOpacity
                                    onPress={() => setSelectedTier('pro')}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        backgroundColor: selectedTier === 'pro' ? theme.primary : theme.background,
                                        borderWidth: 1,
                                        borderColor: theme.border,
                                        marginRight: 8
                                    }}
                                >
                                    <Text style={{
                                        color: selectedTier === 'pro' ? 'white' : theme.text,
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>Pro</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSelectedTier('pro_plus')}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        backgroundColor: selectedTier === 'pro_plus' ? theme.primary : theme.background,
                                        borderWidth: 1,
                                        borderColor: theme.border
                                    }}
                                >
                                    <Text style={{
                                        color: selectedTier === 'pro_plus' ? 'white' : theme.text,
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>Pro+</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Source Selector */}
                            <Text style={{ color: theme.text, marginBottom: 4 }}>Source:</Text>
                            <View style={{ flexDirection: 'row', marginBottom: 16 }}>
                                <TouchableOpacity
                                    onPress={() => setSelectedSource('promo_lifetime')}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        backgroundColor: selectedSource === 'promo_lifetime' ? '#16a34a' : theme.background,
                                        borderWidth: 1,
                                        borderColor: theme.border,
                                        marginRight: 8
                                    }}
                                >
                                    <Text style={{
                                        color: selectedSource === 'promo_lifetime' ? 'white' : theme.text,
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>Lifetime</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setSelectedSource('promo_trial')}
                                    style={{
                                        flex: 1,
                                        padding: 10,
                                        borderRadius: 8,
                                        backgroundColor: selectedSource === 'promo_trial' ? '#16a34a' : theme.background,
                                        borderWidth: 1,
                                        borderColor: theme.border
                                    }}
                                >
                                    <Text style={{
                                        color: selectedSource === 'promo_trial' ? 'white' : theme.text,
                                        textAlign: 'center',
                                        fontWeight: '600'
                                    }}>Trial</Text>
                                </TouchableOpacity>
                            </View>

                            {/* Action Buttons */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    onPress={handleGrant}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#16a34a',
                                        padding: 14,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginRight: 8 }} />
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Grant Pro</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleRevoke}
                                    disabled={loading}
                                    style={{
                                        flex: 1,
                                        backgroundColor: '#dc2626',
                                        padding: 14,
                                        borderRadius: 8,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >
                                    <Ionicons name="close-circle" size={20} color="white" style={{ marginRight: 8 }} />
                                    <Text style={{ color: 'white', fontWeight: '700' }}>Revoke</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

function DetailRow({ label, value, theme }: { label: string; value: string; theme: any }) {
    return (
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            <Text style={{ color: theme.mutedText, width: 100 }}>{label}:</Text>
            <Text style={{ color: theme.text, flex: 1 }} selectable>{value}</Text>
        </View>
    );
}
