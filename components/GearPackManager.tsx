import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useGearStore } from '@/store/gearStore';
import { useTheme } from '@/lib/theme';
import { GearAsset, GearCategory } from '@/store/types';

interface GearPackManagerProps {
    selectedItemIds: string[];
    onUpdateItems: (ids: string[]) => void;
    checkedItemIds?: string[];
    onUpdateCheckedItems?: (ids: string[]) => void;
}

export function GearPackManager({
    selectedItemIds,
    onUpdateItems,
    checkedItemIds = [],
    onUpdateCheckedItems
}: GearPackManagerProps) {
    const theme = useTheme();
    const { assets } = useGearStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSelecting, setIsSelecting] = useState(false);

    const selectedAssets = useMemo(() => {
        return selectedItemIds
            .map(id => assets.find(a => a.id === id))
            .filter((a): a is GearAsset => !!a);
    }, [selectedItemIds, assets]);

    const availableAssets = useMemo(() => {
        return assets
            .filter(a => !selectedItemIds.includes(a.id) && !a.isWishlist)
            .filter(a =>
                a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [assets, selectedItemIds, searchQuery]);

    const toggleItem = (id: string) => {
        if (selectedItemIds.includes(id)) {
            onUpdateItems(selectedItemIds.filter(itemId => itemId !== id));
        } else {
            onUpdateItems([...selectedItemIds, id]);
        }
    };

    const toggleCheck = (id: string) => {
        if (!onUpdateCheckedItems) return;
        if (checkedItemIds.includes(id)) {
            onUpdateCheckedItems(checkedItemIds.filter(itemId => itemId !== id));
        } else {
            onUpdateCheckedItems([...checkedItemIds, id]);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.foreground }]}>Packing List</Text>
                <TouchableOpacity
                    onPress={() => setIsSelecting(!isSelecting)}
                    style={[styles.actionButton, { backgroundColor: isSelecting ? theme.primary + '20' : theme.primary }]}
                >
                    <Ionicons
                        name={isSelecting ? "chevron-up" : "add"}
                        size={20}
                        color={isSelecting ? theme.primary : "#fff"}
                    />
                    <Text style={[styles.actionButtonText, { color: isSelecting ? theme.primary : "#fff" }]}>
                        {isSelecting ? "Done" : "Add Gear"}
                    </Text>
                </TouchableOpacity>
            </View>

            {isSelecting && (
                <View style={[styles.pickerArea, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <View style={[styles.searchContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Ionicons name="search-outline" size={18} color={theme.mutedText} />
                        <TextInput
                            style={[styles.searchInput, { color: theme.foreground }]}
                            placeholder="Search your vault..."
                            placeholderTextColor={theme.mutedText}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    <ScrollView style={styles.pickerList} nestedScrollEnabled>
                        {availableAssets.length > 0 ? (
                            availableAssets.map(asset => (
                                <TouchableOpacity
                                    key={asset.id}
                                    style={styles.pickerItem}
                                    onPress={() => toggleItem(asset.id)}
                                >
                                    <View style={[styles.iconBox, { backgroundColor: theme.primary + '10' }]}>
                                        <Ionicons name={getCategoryIcon(asset.category)} size={16} color={theme.primary} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.itemName, { color: theme.foreground }]}>{asset.name}</Text>
                                        <Text style={[styles.itemDetail, { color: theme.mutedText }]}>{asset.brand} {asset.model}</Text>
                                    </View>
                                    <View style={[styles.plusButton, { backgroundColor: theme.primary + '10' }]}>
                                        <Ionicons name="add" size={20} color={theme.primary} />
                                    </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={[styles.emptyText, { color: theme.mutedText }]}>
                                {assets.length === 0 ? "Vault is empty" : "No matching gear"}
                            </Text>
                        )}
                    </ScrollView>
                </View>
            )}

            <View style={styles.list}>
                {selectedAssets.length > 0 ? (
                    selectedAssets.map(asset => {
                        const isChecked = checkedItemIds.includes(asset.id);
                        return (
                            <View
                                key={asset.id}
                                style={[
                                    styles.listItem,
                                    { backgroundColor: theme.card, borderColor: isChecked ? theme.primary + '40' : theme.border },
                                    isChecked && { opacity: 0.6 }
                                ]}
                            >
                                <TouchableOpacity
                                    onPress={() => toggleCheck(asset.id)}
                                    style={[
                                        styles.checkbox,
                                        { borderColor: isChecked ? theme.primary : theme.border, backgroundColor: isChecked ? theme.primary : 'transparent' }
                                    ]}
                                >
                                    {isChecked && <Ionicons name="checkmark" size={16} color="#fff" />}
                                </TouchableOpacity>

                                <View style={{ flex: 1 }}>
                                    <Text style={[
                                        styles.listItemName,
                                        { color: theme.foreground },
                                        isChecked && { textDecorationLine: 'line-through' }
                                    ]}>{asset.name}</Text>
                                    <Text style={[styles.listItemDetail, { color: theme.mutedText }]}>{asset.category}</Text>
                                </View>

                                <TouchableOpacity onPress={() => toggleItem(asset.id)} style={styles.removeButton}>
                                    <Ionicons name="close-circle" size={20} color={theme.mutedText} />
                                </TouchableOpacity>
                            </View>
                        );
                    })
                ) : (
                    <View style={[styles.emptyPlaceholder, { borderColor: theme.border }]}>
                        <Text style={[styles.placeholderText, { color: theme.mutedText }]}>No gear assigned to this gig yet.</Text>
                    </View>
                )}
            </View>
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

const styles = StyleSheet.create({
    container: {
        marginBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    actionButtonText: {
        fontSize: 12,
        fontWeight: '800',
        marginLeft: 4,
    },
    pickerArea: {
        borderWidth: 1,
        borderRadius: 20,
        padding: 12,
        marginBottom: 16,
        maxHeight: 300,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 12,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
    },
    pickerList: {
        flex: 1,
    },
    pickerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
    },
    iconBox: {
        width: 32,
        height: 32,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        mr: 12,
    },
    itemName: {
        fontSize: 14,
        fontWeight: '700',
    },
    itemDetail: {
        fontSize: 11,
    },
    plusButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        fontSize: 13,
        fontStyle: 'italic',
    },
    list: {
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listItemName: {
        fontSize: 15,
        fontWeight: '700',
    },
    listItemDetail: {
        fontSize: 11,
        marginTop: 2,
    },
    removeButton: {
        padding: 4,
    },
    emptyPlaceholder: {
        padding: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderRadius: 20,
        alignItems: 'center',
    },
    placeholderText: {
        fontSize: 13,
    }
});
