import * as React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useGearStore } from '@/store/gearStore';
import { useTheme } from '@/lib/theme';
import { GearAsset, GearCategory, GearStatus } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';

const CATEGORIES: GearCategory[] = ['Instrument', 'Sound Tech', 'Software', 'Supplies', 'Accessories', 'Other'];
const STATUSES: GearStatus[] = ['Ready', 'In Repair', 'On Loan (To)', 'On Loan (From)', 'Retired'];

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
    const theme = useTheme();
    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.primary }]}>{title}</Text>
            {children}
        </View>
    );
}

interface InputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    multiline?: boolean;
}

function Input({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: InputProps) {
    const theme = useTheme();
    return (
        <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.mutedText }]}>{label}</Text>
            <TextInput
                style={[
                    styles.input,
                    { backgroundColor: theme.card, color: theme.text, borderColor: theme.border },
                    multiline && { height: 100, textAlignVertical: 'top', paddingTop: 12 }
                ]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={theme.mutedText}
                keyboardType={keyboardType}
                multiline={multiline}
            />
        </View>
    );
}

export default function AssetEditor() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const theme = useTheme();
    const { assets, addAsset, updateAsset } = useGearStore();

    const existingAsset = id ? assets.find(a => a.id === id) : undefined;

    // Form State
    const [name, setName] = React.useState(existingAsset?.name || '');
    const [category, setCategory] = React.useState<GearCategory>(existingAsset?.category || 'Instrument');
    const [brand, setBrand] = React.useState(existingAsset?.brand || '');
    const [model, setModel] = React.useState(existingAsset?.model || '');
    const [serialNumber, setSerialNumber] = React.useState(existingAsset?.serialNumber || '');
    const [manufactureYear, setManufactureYear] = React.useState(existingAsset?.manufactureYear || '');
    const [status, setStatus] = React.useState<GearStatus>(existingAsset?.status || 'Ready');
    const [isWishlist, setIsWishlist] = React.useState(existingAsset?.isWishlist || false);
    const [notes, setNotes] = React.useState(existingAsset?.notes || '');

    // Financials
    const [purchasePrice, setPurchasePrice] = React.useState(existingAsset?.financials?.purchasePrice || '');
    const [currentValue, setCurrentValue] = React.useState(existingAsset?.financials?.currentValue || '');
    const [purchaseLocation, setPurchaseLocation] = React.useState(existingAsset?.financials?.purchaseLocation || '');
    const [purchaseDate, setPurchaseDate] = React.useState(existingAsset?.financials?.purchaseDate || '');

    // Loans
    const [loanPerson, setLoanPerson] = React.useState(existingAsset?.loanDetails?.personName || '');
    const [loanNotes, setLoanNotes] = React.useState(existingAsset?.loanDetails?.notes || '');

    const handleSave = () => {
        if (!name.trim()) {
            Alert.alert("Missing Information", "Please enter at least a name for this gear.");
            return;
        }

        const assetData: Partial<GearAsset> = {
            name: name.trim(),
            category,
            brand: brand.trim(),
            model: model.trim(),
            serialNumber: serialNumber.trim(),
            manufactureYear: manufactureYear.trim(),
            status,
            isWishlist,
            notes: notes.trim(),
            financials: {
                purchasePrice: purchasePrice.trim(),
                currentValue: currentValue.trim(),
                purchaseLocation: purchaseLocation.trim(),
                purchaseDate: purchaseDate.trim(),
            },
            loanDetails: (status === 'On Loan (To)' || status === 'On Loan (From)') ? {
                personName: loanPerson.trim(),
                notes: loanNotes.trim()
            } : undefined,
            updatedAt: new Date().toISOString()
        };

        if (existingAsset) {
            updateAsset(existingAsset.id, assetData);
        } else {
            const newAsset: GearAsset = {
                ...assetData as GearAsset,
                id: Date.now().toString(),
                media: { photoUris: [] },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            addAsset(newAsset);
        }

        router.back();
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
                    <Ionicons name="close" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.text }]}>
                    {existingAsset ? 'Edit Gear' : 'Add New Gear'}
                </Text>
                <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                    <Text style={[styles.actionButtonText, { color: theme.primary }]}>Save</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.form}>
                {/* Basic Info */}
                <Section title="Basic Information">
                    <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Fender Stratocaster" />

                    <Text style={[styles.label, { color: theme.mutedText }]}>Category</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                        {CATEGORIES.map(cat => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                style={[
                                    styles.chip,
                                    { backgroundColor: category === cat ? theme.primary : theme.card, borderColor: theme.border }
                                ]}
                            >
                                <Text style={[styles.chipText, { color: category === cat ? '#fff' : theme.text }]}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Input label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Fender" />
                    <Input label="Model" value={model} onChangeText={setModel} placeholder="e.g. American Professional II" />
                    <Input label="Serial Number" value={serialNumber} onChangeText={setSerialNumber} placeholder="SN-12345678" />
                    <Input label="Approx. Year Manufactured" value={manufactureYear} onChangeText={setManufactureYear} placeholder="e.g. 1974" keyboardType="numeric" />
                </Section>

                {/* Status & Wishlist */}
                <Section title="Status & Visibility">
                    <Text style={[styles.label, { color: theme.mutedText }]}>Current Status</Text>
                    <View style={styles.statusRow}>
                        {STATUSES.map(s => (
                            <TouchableOpacity
                                key={s}
                                onPress={() => setStatus(s)}
                                style={[
                                    styles.statusChip,
                                    {
                                        backgroundColor: status === s ? getStatusColor(s) : theme.card,
                                        borderColor: theme.border
                                    }
                                ]}
                            >
                                <Text style={[styles.statusChipText, { color: status === s ? '#fff' : theme.text }]}>{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.switchRow}>
                        <View>
                            <Text style={[styles.switchLabel, { color: theme.text }]}>Wishlist Item</Text>
                            <Text style={[styles.switchSubtitle, { color: theme.mutedText }]}>Don't own this yet, but want it</Text>
                        </View>
                        <Switch
                            value={isWishlist}
                            onValueChange={setIsWishlist}
                            trackColor={{ false: theme.border, true: theme.primary }}
                        />
                    </View>
                </Section>

                {/* Financials (Tax/Insurance) */}
                <Section title="Financial Records">
                    <View style={styles.row}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                            <Input label="Purchase Price ($)" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" placeholder="0.00" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                            <Input label="Current Value ($)" value={currentValue} onChangeText={setCurrentValue} keyboardType="numeric" placeholder="0.00" />
                        </View>
                    </View>
                    <Input label="Where Purchased" value={purchaseLocation} onChangeText={setPurchaseLocation} placeholder="e.g. Sweetwater, Reverb" />
                    <Input label="Purchase Date" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" />
                </Section>

                {/* Loan Details */}
                {(status === 'On Loan (To)' || status === 'On Loan (From)') && (
                    <Section title="Loan Tracking">
                        <Input
                            label={status === 'On Loan (To)' ? "On Loan To" : "Borrowed From"}
                            value={loanPerson}
                            onChangeText={setLoanPerson}
                            placeholder="Full Name"
                        />
                        <Input label="Loan Notes" value={loanNotes} onChangeText={setLoanNotes} placeholder="Due dates, accessories lent, etc." multiline />
                    </Section>
                )}

                <Section title="Notes">
                    <Input label="General Notes" value={notes} onChangeText={setNotes} placeholder="Any other details..." multiline />
                </Section>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
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
    closeButton: {
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '800',
    },
    actionButton: {
        padding: 4,
    },
    actionButtonText: {
        fontSize: 18,
        fontWeight: '800',
    },
    form: {
        flex: 1,
        paddingTop: 20,
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        fontSize: 16,
    },
    row: {
        flexDirection: 'row',
    },
    chipRow: {
        flexDirection: 'row',
        marginBottom: 16,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
    },
    chipText: {
        fontWeight: '600',
    },
    statusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 16,
    },
    statusChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginRight: 8,
        marginBottom: 8,
        borderWidth: 1,
    },
    statusChipText: {
        fontSize: 12,
        fontWeight: '700',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
        padding: 16,
        borderRadius: 12,
        marginTop: 8,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '700',
    },
    switchSubtitle: {
        fontSize: 13,
        marginTop: 2,
    }
});
