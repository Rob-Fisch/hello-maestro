import { PAPER_THEME } from '@/lib/theme';
import { useGearStore } from '@/store/gearStore';
import { GearAsset, GearCategory, GearStatus } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Platform, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

const CATEGORIES: GearCategory[] = ['Instrument', 'Sound Tech', 'Software', 'Supplies', 'Accessories', 'Other'];
const STATUSES: GearStatus[] = ['Ready', 'In Repair', 'On Loan (To)', 'On Loan (From)', 'Retired'];

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

function Section({ title, children }: SectionProps) {
    return (
        <View className="mb-8 px-6">
            <Text className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-4">{title}</Text>
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
    return (
        <View className="mb-4">
            <Text className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">{label}</Text>
            <TextInput
                className={`bg-white border border-stone-200 rounded-xl px-4 py-3 text-stone-900 font-semibold text-base ${multiline ? 'h-[100px] pt-3 text-top' : ''}`}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#94a3b8"
                keyboardType={keyboardType}
                multiline={multiline}
                textAlignVertical={multiline ? 'top' : 'center'}
            />
        </View>
    );
}

export default function AssetEditor() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { assets, addAsset, updateAsset } = useGearStore();

    const existingAsset = id ? assets.find(a => a.id === id) : undefined;
    const isEditing = !!existingAsset;

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
        <View className="flex-1" style={{ backgroundColor: PAPER_THEME.background }}>
            <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 24, paddingBottom: 120 }}>
                <View className="px-6 mb-8">
                    <Text className="text-3xl font-black tracking-tight" style={{ color: PAPER_THEME.text }}>
                        {isEditing ? 'Edit Gear' : 'New Gear'}
                    </Text>
                    <Text className="text-stone-500 font-bold uppercase tracking-widest text-xs mt-1">
                        Inventory Details
                    </Text>
                </View>

                {/* Basic Info */}
                <Section title="Basic Information">
                    <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Fender Stratocaster" />

                    <View className="mb-6">
                        <Text className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full border mr-2 ${category === cat ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                                >
                                    <Text className={`font-bold text-xs ${category === cat ? 'text-white' : 'text-stone-600'}`}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <Input label="Brand" value={brand} onChangeText={setBrand} placeholder="e.g. Fender" />
                    <Input label="Model" value={model} onChangeText={setModel} placeholder="e.g. American Professional II" />
                    <Input label="Serial Number" value={serialNumber} onChangeText={setSerialNumber} placeholder="SN-12345678" />
                    <Input label="Year" value={manufactureYear} onChangeText={setManufactureYear} placeholder="e.g. 1974" keyboardType="numeric" />
                </Section>

                {/* Status & Wishlist */}
                <Section title="Status & Visibility">
                    <Text className="text-xs font-bold text-stone-500 mb-2 uppercase tracking-wide">Current Status</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {STATUSES.map(s => {
                            const isSelected = status === s;
                            return (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setStatus(s)}
                                    className={`px-3 py-1.5 rounded-lg border ${isSelected ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                                >
                                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-600'}`}>{s}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View className="flex-row justify-between items-center bg-white p-4 rounded-xl border border-stone-200">
                        <View>
                            <Text className="font-bold text-stone-900 text-base">Wishlist Item</Text>
                            <Text className="text-xs text-stone-500 font-medium mt-1">Don't own this yet, but want it</Text>
                        </View>
                        <Switch
                            value={isWishlist}
                            onValueChange={setIsWishlist}
                            trackColor={{ false: '#e2e8f0', true: '#bae6fd' }}
                            thumbColor={isWishlist ? '#0ea5e9' : '#94a3b8'}
                        />
                    </View>
                </Section>

                {/* Financials (Tax/Insurance) */}
                <Section title="Financial Records">
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Input label="Purchase Price ($)" value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" placeholder="0.00" />
                        </View>
                        <View className="flex-1">
                            <Input label="Current Value ($)" value={currentValue} onChangeText={setCurrentValue} keyboardType="numeric" placeholder="0.00" />
                        </View>
                    </View>
                    <Input label="Where Purchased" value={purchaseLocation} onChangeText={setPurchaseLocation} placeholder="e.g. Sweetwater, Reverb" />
                    <Input label="Purchase Date" value={purchaseDate} onChangeText={setPurchaseDate} placeholder="YYYY-MM-DD" />
                </Section>

                {/* Loan Details */}
                {(status === 'On Loan (To)' || status === 'On Loan (From)') && (
                    <Section title="Loan Tracking">
                        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                            <Input
                                label={status === 'On Loan (To)' ? "On Loan To" : "Borrowed From"}
                                value={loanPerson}
                                onChangeText={setLoanPerson}
                                placeholder="Full Name"
                            />
                            <Input label="Loan Notes" value={loanNotes} onChangeText={setLoanNotes} placeholder="Due dates, accessories lent, etc." multiline />
                        </View>
                    </Section>
                )}

                <Section title="Notes">
                    <Input label="General Notes" value={notes} onChangeText={setNotes} placeholder="Any other details..." multiline />
                </Section>

                <View className="h-[20px]" />
            </ScrollView>

            {/* Bottom Actions */}
            <View className="flex-row gap-4 p-6 border-t border-stone-200 bg-white/90 absolute bottom-0 left-0 right-0" style={{ paddingBottom: Platform.OS === 'ios' ? 40 : 24 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="flex-1 p-4 rounded-2xl border border-stone-300 items-center justify-center"
                    style={{ backgroundColor: PAPER_THEME.cancelBtnBg }}
                >
                    <Text className="text-center font-bold uppercase tracking-wide" style={{ color: PAPER_THEME.cancelBtnText }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 p-4 rounded-2xl shadow-lg flex-row justify-center items-center shadow-orange-900/20"
                    style={{ backgroundColor: PAPER_THEME.saveBtnBg }}
                >
                    <Ionicons name="checkmark-circle" size={20} color={PAPER_THEME.saveBtnText} />
                    <Text className="font-black text-lg uppercase tracking-wider ml-2" style={{ color: PAPER_THEME.saveBtnText }}>
                        {isEditing ? 'Update' : 'Save'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
