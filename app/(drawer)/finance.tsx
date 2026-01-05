import TransactionEditor from '@/components/TransactionEditor';
import { useContentStore } from '@/store/contentStore';
import { useFinanceStore } from '@/store/financeStore';
import { Transaction } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function FinancePage() {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { profile } = useContentStore();
    const isPremium = profile?.isPremium ?? false;

    // Use Finance Store
    const { events } = useContentStore();
    const { transactions } = useFinanceStore();

    // Hybrid Teaser Logic: Calculate Potential Income from Events
    const potentialIncome = useMemo(() => {
        return events.reduce((sum, event) => {
            // Try to find a fee string and parse number
            const feeStr = event.musicianFee || event.totalFee || event.fee || '0';
            const fee = parseFloat(feeStr.replace(/[^0-9.]/g, '')) || 0;
            return sum + fee;
        }, 0);
    }, [events]);

    const estimatedIncome = useMemo(() => {
        // Fallback calculation: $150 * number of events
        return events.length * 150;
    }, [events]);

    const displayTeaserAmount = potentialIncome > 0 ? potentialIncome : estimatedIncome;
    const isEstimate = potentialIncome === 0;

    if (!isPremium) {
        return (
            <View className="flex-1 bg-white">
                <View className="bg-blue-600 pb-10 px-6 rounded-b-[40px] shadow-2xl z-10" style={{ paddingTop: insets.top + 20 }}>
                    {/* Header */}
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
                        <Text className="text-white text-3xl font-black text-center mb-2">Finance Tracker</Text>
                        <Text className="text-blue-100 text-center font-medium">
                            Maximize your net income by tracking expenses against your revenue.
                        </Text>
                    </View>
                </View>

                <ScrollView className="flex-1 -mt-10 px-6">
                    <View className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100 mb-6">
                        <Text className="text-xs uppercase font-black text-gray-400 tracking-widest mb-4 text-center">Your Potential</Text>

                        <View className="items-center mb-6">
                            <Text className="text-5xl font-black text-green-600">
                                ${displayTeaserAmount.toLocaleString()}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-2 text-center px-8">
                                {isEstimate
                                    ? `Based on ${events.length} gigs at ~$150 avg.`
                                    : `Aggregated from your ${events.length} existing events.`
                                }
                            </Text>
                        </View>

                        <View className="space-y-4">
                            <View className="flex-row items-start">
                                <View className="bg-green-100 p-2 rounded-full mr-3">
                                    <Ionicons name="checkmark" size={16} color="#16a34a" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800">Track Gig Income</Text>
                                    <Text className="text-gray-500 text-xs">Log payments instantly.</Text>
                                </View>
                            </View>
                            <View className="flex-row items-start mt-4">
                                <View className="bg-red-100 p-2 rounded-full mr-3">
                                    <Ionicons name="checkmark" size={16} color="#ef4444" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800">Deduct Expenses</Text>
                                    <Text className="text-gray-500 text-xs">Gas, gear, travel, and meals.</Text>
                                </View>
                            </View>
                            <View className="flex-row items-start mt-4">
                                <View className="bg-blue-100 p-2 rounded-full mr-3">
                                    <Ionicons name="checkmark" size={16} color="#2563eb" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800">Private Ledger</Text>
                                    <Text className="text-gray-500 text-xs">Securely stored on your device.</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        className="bg-stone-900 p-5 rounded-3xl items-center shadow-lg mb-8"
                        onPress={() => alert('Upgrade Modal Placeholder')}
                    >
                        <Text className="text-white font-black text-lg">Start Tracking Now</Text>
                        <Text className="text-stone-400 text-xs mt-1">Included with OpusMode Pro</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // PRO VIEW
    const [isEditorVisible, setEditorVisible] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined);
    const { addTransaction, updateTransaction, deleteTransaction } = useFinanceStore();

    const totalBalance = useMemo(() => {
        return transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    }, [transactions]);

    const handleSaveTransaction = (t: Transaction) => {
        if (editingTransaction) {
            updateTransaction(t.id, t);
        } else {
            addTransaction(t);
        }
        setEditingTransaction(undefined);
    };

    return (
        <View className="flex-1 bg-stone-50">
            {/* Header / Balance Card */}
            <View className="bg-stone-900 pb-12 px-6 rounded-b-[40px] shadow-xl z-10" style={{ paddingTop: insets.top + 10 }}>
                {/* Top Nav Row */}
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        className="p-2 -ml-2 rounded-full bg-white/10 border border-white/20"
                    >
                        <Ionicons name="menu" size={24} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.push('/(drawer)/settings')} className="bg-stone-800 p-2 rounded-full border border-stone-700">
                        <Ionicons name="settings-outline" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-start mb-6">
                    <View>
                        <Text className="text-stone-400 font-bold uppercase tracking-widest text-xs mb-1">Total Balance</Text>
                        <Text className={`text-5xl font-black tracking-tight ${totalBalance >= 0 ? 'text-white' : 'text-red-400'}`}>
                            ${totalBalance.toLocaleString()}
                        </Text>
                    </View>
                </View>

                {/* Quick Stats (Income vs Expense) could go here */}
            </View>

            {/* Transaction List */}
            <ScrollView className="flex-1 -mt-6 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
                {transactions.length === 0 ? (
                    <View className="items-center justify-center py-20">
                        <Ionicons name="receipt-outline" size={48} color="#d6d3d1" />
                        <Text className="text-stone-400 font-bold mt-4">No transactions yet.</Text>
                        <Text className="text-stone-400 text-xs">Tap + to start tracking.</Text>
                    </View>
                ) : (
                    transactions.map((t) => (
                        <TouchableOpacity
                            key={t.id}
                            onPress={() => { setEditingTransaction(t); setEditorVisible(true); }}
                            className="bg-white p-4 mb-3 rounded-2xl shadow-sm border border-stone-100 flex-row items-center justify-between"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${t.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                                    <Ionicons name={t.type === 'income' ? 'arrow-down' : 'arrow-up'} size={18} color={t.type === 'income' ? '#16a34a' : '#ef4444'} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-stone-800 text-base">{t.category}</Text>
                                    <Text className="text-stone-500 text-xs" numberOfLines={1}>{t.description || t.date}</Text>
                                    {t.relatedEventId && (
                                        <View className="flex-row items-center mt-1">
                                            <Ionicons name="link" size={10} color="#64748b" />
                                            <Text className="text-[10px] text-slate-500 font-bold ml-1 uppercase">Event Linked</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <Text className={`font-black text-lg ${t.type === 'income' ? 'text-green-600' : 'text-stone-800'}`}>
                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                            </Text>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                onPress={() => { setEditingTransaction(undefined); setEditorVisible(true); }}
                className="absolute bottom-10 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg shadow-blue-900/40"
            >
                <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>

            <TransactionEditor
                visible={isEditorVisible}
                onClose={() => setEditorVisible(false)}
                onSave={handleSaveTransaction}
                initialData={editingTransaction}
            />
        </View>
    );
}
