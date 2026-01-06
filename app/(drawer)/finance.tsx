import FinanceExportModal from '@/components/FinanceExportModal';
import TransactionEditor from '@/components/TransactionEditor';
import { useContentStore } from '@/store/contentStore';
import { useFinanceStore } from '@/store/financeStore';
import { Transaction } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FinancePage() {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { profile } = useContentStore();
    const isPremium = profile?.isPremium ?? false;

    // Use Finance Store
    const { events } = useContentStore();
    const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();

    // --- State ---
    const [activeTab, setActiveTab] = useState<'all' | 'income' | 'expense'>('all');

    // Date Filtering State
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0-11

    // "Period" can be a month index (0-11) OR a quarter index (0-3)
    const [periodType, setPeriodType] = useState<'month' | 'quarter'>('month');
    const [selectedYear, setSelectedYear] = useState(currentYear);
    const [selectedPeriodValue, setSelectedPeriodValue] = useState(currentMonth);

    const [isPeriodPickerVisible, setPeriodPickerVisible] = useState(false);

    const [isEditorVisible, setEditorVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const [isReportsVisible, setReportsVisible] = useState(false);

    // --- Stats Logic ---
    const monthTransactions = useMemo(() => {
        return transactions.filter(t => {
            // Fix Timezone: Parse YYYY-MM-DD
            const [y, m, d] = t.date.split('-').map(Number);
            const tDateMonthIndex = m - 1; // 0-11

            if (y !== selectedYear) return false;

            if (periodType === 'month') {
                return tDateMonthIndex === selectedPeriodValue;
            } else {
                // Quarter Logic: Q1=0 (0,1,2), Q2=1 (3,4,5)...
                const qStart = selectedPeriodValue * 3;
                const qEnd = qStart + 2;
                return tDateMonthIndex >= qStart && tDateMonthIndex <= qEnd;
            }
        });
    }, [transactions, selectedYear, selectedPeriodValue, periodType]);

    const stats = useMemo(() => {
        let income = 0;
        let expense = 0;
        monthTransactions.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else expense += t.amount;
        });
        return { income, expense, net: income - expense };
    }, [monthTransactions]);

    // --- Filtered List ---
    const filteredTransactions = useMemo(() => {
        return monthTransactions.filter(t => {
            return activeTab === 'all' ? true : t.type === activeTab;
        }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [monthTransactions, activeTab]);

    // --- Handlers ---
    const handleSaveTransaction = (t: Transaction) => {
        if (editingTransaction) {
            updateTransaction(t.id, t);
        } else {
            addTransaction(t);
        }
        setEditingTransaction(undefined);
    };

    const handleDelete = (id: string) => {
        if (Platform.OS === 'web') {
            if (confirm('Are you sure you want to delete this transaction?')) {
                deleteTransaction(id);
                setEditorVisible(false);
            }
        } else {
            Alert.alert('Delete Transaction', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete', style: 'destructive', onPress: () => {
                        deleteTransaction(id);
                        setEditorVisible(false);
                    }
                }
            ]);
        }
    };

    const [isExportModalVisible, setExportModalVisible] = useState(false);
    const handleExport = () => setExportModalVisible(true);

    // --- Render Helpers ---
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const quarterNames = ["Q1 (Jan-Mar)", "Q2 (Apr-Jun)", "Q3 (Jul-Sep)", "Q4 (Oct-Dec)"];

    const currentPeriodLabel = periodType === 'month'
        ? monthNames[selectedPeriodValue]
        : quarterNames[selectedPeriodValue];

    const handlePrevPeriod = () => {
        if (periodType === 'month') {
            if (selectedPeriodValue === 0) {
                setSelectedPeriodValue(11);
                setSelectedYear(prev => prev - 1);
            } else {
                setSelectedPeriodValue(prev => prev - 1);
            }
        } else {
            // Quarter
            if (selectedPeriodValue === 0) {
                setSelectedPeriodValue(3);
                setSelectedYear(prev => prev - 1);
            } else {
                setSelectedPeriodValue(prev => prev - 1);
            }
        }
    };

    const handleNextPeriod = () => {
        if (periodType === 'month') {
            if (selectedPeriodValue === 11) {
                setSelectedPeriodValue(0);
                setSelectedYear(prev => prev + 1);
            } else {
                setSelectedPeriodValue(prev => prev + 1);
            }
        } else {
            if (selectedPeriodValue === 3) {
                setSelectedPeriodValue(0);
                setSelectedYear(prev => prev + 1);
            } else {
                setSelectedPeriodValue(prev => prev + 1);
            }
        }
    };


    if (!isPremium) {
        // ... (Keep existing Paywall / Teaser Code or simplify it? Preserving existing for now to minimize scope creep unless asked)
        // Re-using the teaser logic from previous version for consistency
        const potentialIncome = events.reduce((sum, event) => {
            const feeStr = event.musicianFee || event.totalFee || event.fee || '0';
            const fee = parseFloat(feeStr.replace(/[^0-9.]/g, '')) || 0;
            return sum + fee;
        }, 0);
        const estimatedIncome = events.length * 150;
        const displayTeaserAmount = potentialIncome > 0 ? potentialIncome : estimatedIncome;

        return (
            <View className="flex-1 bg-white">
                <View className="bg-blue-600 pb-10 px-6 rounded-b-[40px] shadow-2xl z-10" style={{ paddingTop: insets.top + 20 }}>
                    <View className="flex-row items-center mb-6">
                        <TouchableOpacity
                            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                            className="p-2 -ml-2 rounded-full bg-white/10 border border-white/20"
                        >
                            <Ionicons name="menu" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <View className="items-center">
                        <Ionicons name="wallet" size={64} color="white" className="mb-4" />
                        <Text className="text-white text-3xl font-black text-center mb-2">OpusMode Finance</Text>
                        <View className="bg-white/20 px-4 py-2 rounded-full">
                            <Text className="text-white font-bold text-lg">${displayTeaserAmount.toLocaleString()} Potential</Text>
                        </View>
                        <Text className="text-blue-100 text-center font-medium mt-4">
                            Unlock the pro ledger to track your music income.
                        </Text>
                    </View>
                </View>
                <View className="flex-1 items-center justify-center">
                    <TouchableOpacity onPress={() => router.push('/modal/upgrade')} className="bg-stone-900 px-8 py-4 rounded-full">
                        <Text className="text-white font-bold">Upgrade to Pro</Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }

    return (
        <View className="flex-1 bg-stone-50">
            {/* --- COMPACT HEADER --- */}
            <View className="bg-stone-900 px-6 pb-6 rounded-b-[32px] shadow-md z-20" style={{ paddingTop: insets.top + 10 }}>
                {/* Top Row: Menu | Reports | Export */}
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        className="p-2 -ml-2 rounded-full bg-white/10"
                    >
                        <Ionicons name="menu" size={24} color="white" />
                    </TouchableOpacity>

                    <View className="flex-row gap-3">
                        <TouchableOpacity onPress={() => setReportsVisible(true)} className="p-2 bg-indigo-500/20 rounded-full border border-indigo-500/50">
                            <Ionicons name="bar-chart" size={20} color="#818cf8" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleExport} className="p-2 bg-white/10 rounded-full">
                            <Ionicons name="download-outline" size={20} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Summary Bar */}
                <View className="flex-row items-center justify-between">
                    <View>
                        <Text className="text-stone-400 font-black text-[10px] uppercase tracking-widest mb-1">Net Balance</Text>
                        <Text className={`text-4xl font-black tracking-tighter ${stats.net >= 0 ? 'text-white' : 'text-red-400'}`}>
                            ${stats.net.toLocaleString()}
                        </Text>
                    </View>
                    <View className="items-end">
                        <View className="flex-row items-center mb-1">
                            <Text className="text-stone-400 font-bold text-[10px] uppercase mr-2">Income</Text>
                            <Ionicons name="arrow-up" size={12} color="#4ade80" />
                            <Text className="text-green-400 font-bold ml-1">${stats.income.toLocaleString()}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <Text className="text-stone-400 font-bold text-[10px] uppercase mr-2">Expense</Text>
                            <Ionicons name="arrow-down" size={12} color="#f87171" style={{ opacity: 0.8 }} />
                            <Text className="text-red-400 font-bold ml-1">${stats.expense.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* --- CONTROLS AREA (Sticky-ish feel) --- */}
            <View className="px-6 py-4 bg-stone-50 z-10">
                {/* Month/Year Filter */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center bg-white border border-stone-200 rounded-xl p-1 shadow-sm">
                        <TouchableOpacity
                            onPress={handlePrevPeriod}
                            className="p-2"
                        >
                            <Ionicons name="chevron-back" size={16} color="#44403c" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setPeriodPickerVisible(true)}
                            className="px-4 items-center min-w-[140px]"
                        >
                            <View className="flex-row items-center gap-1">
                                <Text className="font-extrabold text-stone-800 text-base">{currentPeriodLabel}</Text>
                                <Ionicons name="caret-down" size={12} color="#57534e" />
                            </View>
                            <Text className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{selectedYear}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleNextPeriod}
                            className="p-2"
                        >
                            <Ionicons name="chevron-forward" size={16} color="#44403c" />
                        </TouchableOpacity>
                    </View>

                    {/* Add Button for quick access */}
                    <TouchableOpacity
                        onPress={() => { setEditingTransaction(undefined); setEditorVisible(true); }}
                        className="bg-blue-600 w-12 h-12 rounded-xl items-center justify-center shadow-lg shadow-blue-500/30"
                    >
                        <Ionicons name="add" size={28} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="flex-row bg-stone-200/50 p-1 rounded-xl mb-2">
                    {['all', 'income', 'expense'].map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab as any)}
                            className={`flex-1 py-1.5 rounded-lg items-center ${activeTab === tab ? 'bg-white shadow-sm' : ''}`}
                        >
                            <Text className={`text-xs font-bold uppercase tracking-wide ${activeTab === tab ? 'text-stone-900' : 'text-stone-400'}`}>
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* --- TRANSACTION LIST --- */}
            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {filteredTransactions.length === 0 ? (
                    <View className="items-center justify-center py-20 opacity-50">
                        <Ionicons name="documents-outline" size={48} color="#a8a29e" />
                        <Text className="text-stone-400 font-bold mt-4">No transactions found</Text>
                        <Text className="text-stone-400 text-xs">Try changing filters or add new.</Text>
                    </View>
                ) : (
                    filteredTransactions.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            onPress={() => { setEditingTransaction(t); setEditorVisible(true); }}
                            className="bg-white p-3 mb-2 rounded-2xl shadow-sm border border-stone-100 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${t.type === 'income' ? 'bg-green-50' : 'bg-red-50'}`}>
                                    <Ionicons name={t.type === 'income' ? 'arrow-down' : 'arrow-up'} size={16} color={t.type === 'income' ? '#16a34a' : '#ef4444'} />
                                </View>
                                <View className="flex-1 mr-2">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="font-bold text-stone-800 text-sm">{t.category}</Text>
                                        <Text className="text-xs text-stone-400">{new Date(t.date).getDate()}</Text>
                                    </View>
                                    <Text className="text-stone-500 text-xs truncate" numberOfLines={1}>{t.description || "No description"}</Text>
                                </View>
                            </View>
                            <Text className={`font-black text-base ${t.type === 'income' ? 'text-green-600' : 'text-stone-900'}`}>
                                {t.type === 'income' ? '+' : '-'}${Math.abs(t.amount).toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            <TransactionEditor
                visible={isEditorVisible}
                onClose={() => setEditorVisible(false)}
                onSave={handleSaveTransaction}
                initialData={editingTransaction}
                onDelete={editingTransaction ? () => handleDelete(editingTransaction.id) : undefined}
            />

            {/* --- CASH FLOW REPORT MODAL --- */}
            <Modal
                visible={isReportsVisible}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setReportsVisible(false)}
            >
                <View className="flex-1 bg-stone-900">
                    <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/10">
                        <Text className="text-white font-black text-xl">Cash Flow {selectedYear}</Text>
                        <TouchableOpacity onPress={() => setReportsVisible(false)} className="bg-white/10 p-2 rounded-full">
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <ScrollView className="flex-1 p-6">
                        {monthNames.map((month, index) => {
                            // Calculate monthly stats
                            const mTrans = transactions.filter(t => {
                                const d = new Date(t.date);
                                return d.getFullYear() === selectedYear && d.getMonth() === index;
                            });
                            const inc = mTrans.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
                            const exp = mTrans.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
                            const net = inc - exp;
                            const hasActivity = mTrans.length > 0;

                            if (!hasActivity) return null; // Skip empty months

                            return (
                                <View key={month} className="mb-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <Text className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-2">{month}</Text>
                                    <View className="flex-row h-4 bg-black/50 rounded-full mb-3 overflow-hidden">
                                        {/* Simple Bar Visualization */}
                                        <View style={{ flex: inc, backgroundColor: '#4ade80' }} />
                                        <View style={{ flex: exp, backgroundColor: '#f87171' }} />
                                        {(inc === 0 && exp === 0) && <View style={{ flex: 1, backgroundColor: '#444' }} />}
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-green-400 font-bold text-xs">+{inc.toLocaleString()}</Text>
                                        <Text className="text-white font-black text-sm">{net > 0 ? '+' : ''}{net.toLocaleString()}</Text>
                                        <Text className="text-red-400 font-bold text-xs">-{exp.toLocaleString()}</Text>
                                    </View>
                                </View>
                            );
                        })}

                        {/* If no data for year */}
                        {transactions.filter(t => new Date(t.date).getFullYear() === selectedYear).length === 0 && (
                            <View className="items-center mt-20">
                                <Text className="text-stone-600 font-bold">No data for {selectedYear}</Text>
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>

            <FinanceExportModal
                visible={isExportModalVisible}
                onClose={() => setExportModalVisible(false)}
                allTransactions={transactions}
                currentViewTransactions={filteredTransactions}
                currentViewLabel={`${currentPeriodLabel} ${selectedYear}`}
                selectedYear={selectedYear}
            />


            {/* --- PERIOD PICKER MODAL --- */}
            <Modal
                visible={isPeriodPickerVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPeriodPickerVisible(false)}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => setPeriodPickerVisible(false)}
                    className="flex-1 bg-black/60 items-center justify-center p-6"
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                        className="bg-stone-900 w-full max-w-[340px] rounded-3xl p-6 border border-stone-800"
                    >
                        <Text className="text-white text-xl font-black mb-6 text-center">Select Time Period</Text>

                        {/* Switcher */}
                        <View className="flex-row bg-stone-800 p-1 rounded-xl mb-6">
                            <TouchableOpacity
                                onPress={() => setPeriodType('month')}
                                className={`flex-1 py-3 rounded-lg items-center ${periodType === 'month' ? 'bg-stone-700' : ''}`}
                            >
                                <Text className={`font-bold ${periodType === 'month' ? 'text-white' : 'text-stone-500'}`}>Monthly</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setPeriodType('quarter')}
                                className={`flex-1 py-3 rounded-lg items-center ${periodType === 'quarter' ? 'bg-stone-700' : ''}`}
                            >
                                <Text className={`font-bold ${periodType === 'quarter' ? 'text-white' : 'text-stone-500'}`}>Quarterly</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="max-h-[300px]">
                            {periodType === 'month' ? (
                                <View className="flex-row flex-wrap justify-between">
                                    {monthNames.map((m, i) => (
                                        <TouchableOpacity
                                            key={m}
                                            onPress={() => {
                                                setSelectedPeriodValue(i);
                                                setPeriodType('month');
                                                setPeriodPickerVisible(false);
                                            }}
                                            className={`w-[48%] py-4 mb-2 rounded-xl items-center ${selectedPeriodValue === i && periodType === 'month' ? 'bg-blue-600' : 'bg-stone-800'}`}
                                        >
                                            <Text className={`font-bold ${selectedPeriodValue === i && periodType === 'month' ? 'text-white' : 'text-stone-400'}`}>{m}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            ) : (
                                <View>
                                    {quarterNames.map((q, i) => (
                                        <TouchableOpacity
                                            key={q}
                                            onPress={() => {
                                                setSelectedPeriodValue(i);
                                                setPeriodType('quarter');
                                                setPeriodPickerVisible(false);
                                            }}
                                            className={`w-full py-4 mb-3 rounded-xl items-center flex-row justify-center ${selectedPeriodValue === i && periodType === 'quarter' ? 'bg-blue-600' : 'bg-stone-800'}`}
                                        >
                                            <Ionicons name="calendar-outline" size={18} color={selectedPeriodValue === i && periodType === 'quarter' ? 'white' : '#78716c'} style={{ marginRight: 8 }} />
                                            <Text className={`font-bold text-lg ${selectedPeriodValue === i && periodType === 'quarter' ? 'text-white' : 'text-stone-400'}`}>{q}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </ScrollView>

                        <View className="mt-4 pt-4 border-t border-stone-800 items-center">
                            <TouchableOpacity onPress={() => setPeriodPickerVisible(false)}>
                                <Text className="text-stone-500 font-bold">Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}
