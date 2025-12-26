import { useTheme } from '@/lib/theme';
import { useGearStore } from '@/store/gearStore';
import { GearCategory, GearStatus } from '@/store/types';
import { exportGearInventory } from '@/utils/gearExport';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES: GearCategory[] = ['Instrument', 'Sound Tech', 'Software', 'Supplies', 'Accessories', 'Other'];

function WishlistSearch() {
    const theme = useTheme();
    const [query, setQuery] = useState('');

    const handleSearch = () => {
        if (!query.trim()) return;
        // Sweetwater Affiliate Link Template (Deep Link)
        const affiliateId = 'MaestroApp';
        const searchUrl = `https://www.sweetwater.com/store/search?s=${encodeURIComponent(query)}&utm_source=impact&utm_medium=affiliate&irclickid=${affiliateId}`;
        Linking.openURL(searchUrl);
    };

    return (
        <View style={[styles.wishlistContainer, { backgroundColor: `${theme.primary}08`, borderColor: `${theme.primary}20` }]}>
            <View style={styles.wishlistHeader}>
                <Ionicons name="sparkles-outline" size={18} color={theme.primary} />
                <Text style={[styles.wishlistTitle, { color: theme.primary }]}>Gear Wishlist</Text>
            </View>
            <Text style={[styles.wishlistSubtitle, { color: theme.mutedText }]}>
                Research gear on Sweetwater. Purchases support Maestro development.
            </Text>
            <View style={styles.wishlistRow}>
                <TextInput
                    style={[styles.wishlistInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                    placeholder="Search for gear..."
                    placeholderTextColor={theme.mutedText}
                    value={query}
                    onChangeText={setQuery}
                />
                <TouchableOpacity
                    onPress={handleSearch}
                    style={[styles.wishlistButton, { backgroundColor: theme.primary }]}
                >
                    <Ionicons name="search" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    );
}

export default function GearVaultScreen() {
    const theme = useTheme();
    const { assets, deleteAsset } = useGearStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<GearCategory | 'All'>('All');

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            asset.model?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            "Delete Asset",
            `Are you sure you want to remove ${name} from your vault?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deleteAsset(id) }
            ]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => router.push('/')} style={{ marginRight: 16, padding: 8, marginLeft: -8 }}>
                        <Ionicons name="home-outline" size={26} color={theme.text} />
                    </TouchableOpacity>
                    <View>
                        <Text style={[styles.title, { color: theme.text }]}>Gear Vault</Text>
                        <Text style={[styles.subtitle, { color: theme.mutedText }]}>
                            {assets.length} items tracked
                        </Text>
                    </View>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={[styles.exportButton, { borderColor: theme.border }]}
                        onPress={() => exportGearInventory(assets)}
                    >
                        <Ionicons name="document-text-outline" size={20} color={theme.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.addButton, { backgroundColor: theme.primary }]}
                        onPress={() => router.push('/modal/asset-editor')}
                    >
                        <Ionicons name="add" size={24} color="#fff" />
                        <Text style={styles.addButtonText}>Add</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Search & Filters */}
            <View style={styles.filterSection}>
                <View style={[styles.searchContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="search-outline" size={20} color={theme.mutedText} />
                    <TextInput
                        style={[styles.searchInput, { color: theme.text }]}
                        placeholder="Search gear..."
                        placeholderTextColor={theme.mutedText}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    <TouchableOpacity
                        onPress={() => setSelectedCategory('All')}
                        style={[
                            styles.categoryChip,
                            { backgroundColor: selectedCategory === 'All' ? theme.primary : theme.card }
                        ]}
                    >
                        <Text style={[
                            styles.categoryText,
                            { color: selectedCategory === 'All' ? '#fff' : theme.text }
                        ]}>All</Text>
                    </TouchableOpacity>
                    {CATEGORIES.map(cat => (
                        <TouchableOpacity
                            key={cat}
                            onPress={() => setSelectedCategory(cat)}
                            style={[
                                styles.categoryChip,
                                { backgroundColor: selectedCategory === cat ? theme.primary : theme.card }
                            ]}
                        >
                            <Text style={[
                                styles.categoryText,
                                { color: selectedCategory === cat ? '#fff' : theme.text }
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content}>
                <WishlistSearch />

                {filteredAssets.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="briefcase-outline" size={64} color={theme.border} />
                        <Text style={[styles.emptyTitle, { color: theme.mutedText }]}>No gear found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.mutedText }]}>
                            {searchQuery ? "Try a different search term" : "Start by adding your first instrument or accessory"}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.grid}>
                        {filteredAssets.map(asset => (
                            <TouchableOpacity
                                key={asset.id}
                                style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => router.push({ pathname: '/modal/asset-editor', params: { id: asset.id } })}
                            >
                                <View style={styles.cardHeader}>
                                    <View style={[styles.iconBox, { backgroundColor: `${theme.primary}10` }]}>
                                        <Ionicons
                                            name={getCategoryIcon(asset.category)}
                                            size={20}
                                            color={theme.primary}
                                        />
                                    </View>
                                    <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(asset.status)}20` }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(asset.status) }]}>
                                            {asset.status}
                                        </Text>
                                    </View>
                                </View>

                                <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
                                    {asset.name}
                                </Text>
                                <Text style={[styles.cardSubtitle, { color: theme.mutedText }]} numberOfLines={1}>
                                    {asset.brand} {asset.model}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.financialRow}>
                                        <Text style={[styles.valueText, { color: theme.text }]}>
                                            {asset.financials?.currentValue ? `$${asset.financials.currentValue}` : '--'}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(asset.id, asset.name)}
                                        style={styles.deleteIcon}
                                    >
                                        <Ionicons name="trash-outline" size={18} color={theme.error} />
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

function getCategoryIcon(cat: GearCategory): any {
    switch (cat) {
        case 'Instrument': return 'musical-notes-outline';
        case 'Sound Tech': return 'mic-outline';
        case 'Software': return 'code-working-outline';
        case 'Supplies': return 'construct-outline';
        case 'Accessories': return 'hardware-chip-outline';
        default: return 'cube-outline';
    }
}

function getStatusColor(status: GearStatus): string {
    switch (status) {
        case 'Ready': return '#16a34a';
        case 'In Repair': return '#ef4444';
        case 'On Loan (To)': return '#2563eb';
        case 'On Loan (From)': return '#9333ea';
        case 'Retired': return '#64748b';
        default: return '#64748b';
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        borderBottomWidth: 1,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
    },
    subtitle: {
        fontSize: 14,
        marginTop: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: '700',
        marginLeft: 6,
    },
    exportButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    filterSection: {
        paddingVertical: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 16,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
    },
    categoryScroll: {
        paddingLeft: 20,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    categoryText: {
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        flex: 1,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
    },
    card: {
        width: '46%',
        margin: '2%',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: 13,
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: 'rgba(0,0,0,0.05)',
        paddingTop: 10,
    },
    financialRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    valueText: {
        fontSize: 14,
        fontWeight: '700',
    },
    deleteIcon: {
        padding: 4,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        paddingHorizontal: 40,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        marginTop: 16,
    },
    emptySubtitle: {
        fontSize: 14,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20,
    },
    wishlistContainer: {
        marginHorizontal: 20,
        marginBottom: 24,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    wishlistHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    wishlistTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginLeft: 8,
    },
    wishlistSubtitle: {
        fontSize: 12,
        marginBottom: 12,
        lineHeight: 16,
    },
    wishlistRow: {
        flexDirection: 'row',
        gap: 8,
    },
    wishlistInput: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    wishlistButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
