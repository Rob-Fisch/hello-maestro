import { Transaction } from '@/store/types';
import { exportFinanceData } from '@/utils/financeExport';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';

interface FinanceExportModalProps {
    visible: boolean;
    onClose: () => void;
    // We pass all transactions so we can filter by year internally
    allTransactions: Transaction[];
    // We pass the current view/filters context
    currentViewTransactions: Transaction[];
    currentViewLabel: string; // e.g., "January 2026"
    selectedYear: number;
}

export default function FinanceExportModal({
    visible,
    onClose,
    allTransactions,
    currentViewTransactions,
    currentViewLabel,
    selectedYear: initialYear
}: FinanceExportModalProps) {
    const [exportYear, setExportYear] = useState(initialYear);

    const handleExportCurrentView = () => {
        // Filename: opusmode_finance_[label].csv (sanitize label)
        const sanitizedLabel = currentViewLabel.replace(/ /g, '_');
        const filename = `opusmode_finance_${sanitizedLabel}.csv`;
        exportFinanceData(currentViewTransactions, filename);
        onClose();
    };

    const handleExportYear = () => {
        const yearTransactions = allTransactions.filter(t => new Date(t.date).getFullYear() === exportYear);
        const filename = `opusmode_finance_FULL_${exportYear}.csv`;

        if (yearTransactions.length === 0) {
            alert(`No transactions found for ${exportYear}`);
            return;
        }

        exportFinanceData(yearTransactions, filename);
        onClose();
    };

    // Quick Year Selector Logic
    const availableYears = Array.from(new Set(allTransactions.map(t => new Date(t.date).getFullYear()))).sort((a, b) => b - a);
    // Ensure current year and probably next year are in the list if no data yet
    if (!availableYears.includes(new Date().getFullYear())) availableYears.push(new Date().getFullYear());
    // Also add the selected year if not there
    if (!availableYears.includes(exportYear)) availableYears.push(exportYear);
    const uniqueYears = Array.from(new Set(availableYears)).sort((a, b) => b - a);


    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/60 items-center justify-center p-6">
                <View className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl">
                    <View className="bg-stone-900 p-6 items-center">
                        <Ionicons name="download" size={48} color="white" />
                        <Text className="text-white font-black text-2xl mt-4">Export Data</Text>
                        <Text className="text-stone-400 text-center mt-2">Choose what you want to export to CSV.</Text>
                    </View>

                    <View className="p-6">
                        <View className="flex-row gap-4 mb-6">
                            {/* LEFT COLUMN: Current View (Tall) */}
                            <TouchableOpacity
                                onPress={handleExportCurrentView}
                                className="flex-1 bg-emerald-700 rounded-2xl p-4 justify-between shadow-sm"
                            >
                                <View className="bg-white/20 w-12 h-12 rounded-full items-center justify-center mb-4">
                                    <Ionicons name="documents" size={24} color="white" />
                                </View>
                                <View>
                                    <Text className="font-bold text-white text-lg leading-tight mb-1">Current View</Text>
                                    <Text className="text-emerald-100 text-[10px] font-bold uppercase tracking-wide">{currentViewLabel}</Text>
                                </View>
                            </TouchableOpacity>

                            {/* RIGHT COLUMN: Year Selector & Export Action */}
                            <View className="flex-1 justify-between">
                                {/* Year Selector */}
                                <View>
                                    <Text className="text-stone-400 font-bold text-[10px] uppercase tracking-widest mb-2 text-center">Select Year</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                                        {uniqueYears.map(year => (
                                            <TouchableOpacity
                                                key={year}
                                                onPress={() => setExportYear(year)}
                                                className={`px-3 py-2 rounded-lg mr-2 border ${year === exportYear ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-200'}`}
                                            >
                                                <Text className={`font-bold text-xs ${year === exportYear ? 'text-white' : 'text-stone-600'}`}>{year}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                {/* Export Year Button */}
                                <TouchableOpacity
                                    onPress={handleExportYear}
                                    className="bg-emerald-700 p-4 rounded-2xl flex-row items-center justify-center mt-2"
                                >
                                    <Text className="text-white font-bold text-xs mr-1">Export {exportYear}</Text>
                                    <Ionicons name="arrow-forward" size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Option 3: Cancel */}
                        <View className="border-t border-stone-100 pt-4">
                            <TouchableOpacity onPress={onClose} className="py-2 items-center">
                                <Text className="text-stone-400 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
}
