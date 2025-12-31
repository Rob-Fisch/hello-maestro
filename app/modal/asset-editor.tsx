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
            <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">{title}</Text>
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
            <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">{label}</Text>
            <TextInput
                className={`bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-semibold text-base ${multiline ? 'h-[100px] pt-3 text-top' : ''}`}
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

    const getStatusColor = (s: GearStatus) => {
        switch (s) {
            case 'Ready': return 'bg-green-100 border-green-200 text-green-700';
            case 'In Repair': return 'bg-red-100 border-red-200 text-red-700';
            case 'On Loan (To)': return 'bg-blue-100 border-blue-200 text-blue-700';
            case 'On Loan (From)': return 'bg-purple-100 border-purple-200 text-purple-700';
            case 'Retired': return 'bg-slate-100 border-slate-200 text-slate-500';
            default: return 'bg-slate-100 border-slate-200 text-slate-500';
        }
    };

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 pt-4 pb-2 border-b border-slate-200 flex-row justify-between items-center bg-white z-10">
                <View>
                    <Text className="text-2xl font-black text-slate-900 tracking-tight">
                        {existingAsset ? 'Edit Gear' : 'New Gear'}
                    </Text>
                    <Text className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                        Inventory Details
                    </Text>
                </View>

                <View className="flex-row gap-2">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="bg-slate-100 px-4 py-2 rounded-full flex-row items-center"
                    >
                        <Ionicons name="close-circle" size={18} color="#475569" />
                        <Text className="text-slate-600 font-bold text-xs uppercase tracking-wide ml-2">Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 24 }}>
                {/* Basic Info */}
                <Section title="Basic Information">
                    <Input label="Name" value={name} onChangeText={setName} placeholder="e.g. Fender Stratocaster" />

                    <View className="mb-6">
                        <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {CATEGORIES.map(cat => (
                                <TouchableOpacity
                                    key={cat}
                                    onPress={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full border mr-2 ${category === cat ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                                >
                                    <Text className={`font-bold text-xs ${category === cat ? 'text-white' : 'text-slate-600'}`}>{cat}</Text>
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
                    <Text className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide">Current Status</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {STATUSES.map(s => {
                            const isSelected = status === s;
                            // Just simplified logic for selection: 
                            // If selected: Solid Slate-900
                            // If not: Light variant
                            return (
                                <TouchableOpacity
                                    key={s}
                                    onPress={() => setStatus(s)}
                                    className={`px-3 py-1.5 rounded-lg border ${isSelected ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                                >
                                    <Text className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-600'}`}>{s}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <View className="flex-row justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <View>
                            <Text className="font-bold text-slate-900 text-base">Wishlist Item</Text>
                            <Text className="text-xs text-slate-500 font-medium mt-1">Don't own this yet, but want it</Text>
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

                <View className="h-[120px]" />
            </ScrollView>

            {/* Sticky Footer Save Button */}
            <View className="absolute bottom-6 left-6 right-6 border-t border-slate-100 pt-4 bg-white/90" style={{ paddingBottom: Platform.OS === 'ios' ? 20 : 0 }}>
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-slate-900 p-4 rounded-2xl shadow-lg flex-row justify-center items-center shadow-slate-900/20"
                >
                    <Ionicons name="checkmark-circle" size={20} color="white" />
                    <Text className="text-white font-black text-lg uppercase tracking-wider ml-2">Save Gear</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
