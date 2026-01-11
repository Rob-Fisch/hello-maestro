
import { useFinanceStore } from '@/store/financeStore';
import { AppEvent, Transaction } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FinanceModuleProps {
    values: Partial<AppEvent>;
    onChange: (field: any, value: any) => void;
}

export default function FinanceModule({ values, onChange }: FinanceModuleProps) {
    const { transactions, addTransaction, deleteTransaction } = useFinanceStore();
    const [isAdding, setIsAdding] = useState(false);

    // New Transaction State
    const [newAmount, setNewAmount] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newType, setNewType] = useState<'income' | 'expense'>('expense');

    // Filter transactions for this event
    const eventTransactions = useMemo(() =>
        transactions.filter(t => t.relatedEventId === values.id),
        [transactions, values.id]
    );

    // Calculations
    const totalIncome = parseFloat(values.totalFee || '0') || 0;
    const musicianRate = parseFloat(values.musicianFee || '0') || 0;
    const musicianCount = (values.slots || []).length;
    const totalMusicianCost = musicianRate * musicianCount;

    const realizedIncome = eventTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const realizedExpenses = eventTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const projectedProfit = totalIncome - totalMusicianCost - realizedExpenses + realizedIncome; // + realizedIncome in case of tips/merch

    const handleAddTransaction = () => {
        if (!newAmount || !newDesc) return;

        const tx: Transaction = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            amount: parseFloat(newAmount),
            type: newType,
            category: 'Gig',
            description: newDesc,
            relatedEventId: values.id,
            createdAt: new Date().toISOString()
        };

        addTransaction(tx);
        setNewAmount('');
        setNewDesc('');
        setIsAdding(false);
    };

    return (
        <View className="pb-20">
            {/* 1. BUDGET OVERVIEW */}
            <View className="mb-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Budget & Fees</Text>

                <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Fee</Text>
                        <View className="flex-row items-center border-b border-indigo-100 pb-1">
                            <Text className="text-xl font-bold text-indigo-600 mr-1">$</Text>
                            <TextInput
                                className="flex-1 text-xl font-bold text-slate-800"
                                keyboardType="numeric"
                                placeholder="0.00"
                                value={values.totalFee}
                                onChangeText={(t) => onChange('totalFee', t)}
                            />
                        </View>
                    </View>
                    <View className="flex-1">
                        <Text className="text-[10px] font-bold text-slate-400 uppercase mb-1">Per Musician</Text>
                        <View className="flex-row items-center border-b border-rose-100 pb-1">
                            <Text className="text-xl font-bold text-rose-500 mr-1">$</Text>
                            <TextInput
                                className="flex-1 text-xl font-bold text-slate-800"
                                keyboardType="numeric"
                                placeholder="0.00"
                                value={values.musicianFee}
                                onChangeText={(t) => onChange('musicianFee', t)}
                            />
                        </View>
                    </View>
                </View>

                {/* Summary Stats */}
                <View className="flex-row justify-between items-center bg-slate-50 p-4 rounded-xl">
                    <View>
                        <Text className="text-xs text-slate-500 mb-1">Musician Cost ({musicianCount})</Text>
                        <Text className="font-bold text-rose-500">- ${totalMusicianCost.toFixed(2)}</Text>
                    </View>
                    <View>
                        <Text className="text-xs text-slate-500 mb-1">Projected Net</Text>
                        <Text className={`font-black text-lg ${projectedProfit >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                            ${projectedProfit.toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>

            {/* 2. TRANSACTIONS */}
            <View className="mb-6">
                <View className="flex-row justify-between items-center mb-4 px-1">
                    <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Expenses & Extras</Text>
                    <TouchableOpacity onPress={() => setIsAdding(!isAdding)} className="flex-row items-center">
                        <Ionicons name="add-circle" size={20} color="#64748b" />
                        <Text className="text-slate-600 font-bold ml-1">Add Item</Text>
                    </TouchableOpacity>
                </View>

                {isAdding && (
                    <View className="bg-white p-4 rounded-2xl mb-4 border border-indigo-100 shadow-sm">
                        <View className="flex-row mb-3">
                            <TouchableOpacity
                                onPress={() => setNewType('expense')}
                                className={`flex-1 py-2 items-center rounded-l-lg border ${newType === 'expense' ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold ${newType === 'expense' ? 'text-rose-600' : 'text-slate-400'}`}>Expense</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setNewType('income')}
                                className={`flex-1 py-2 items-center rounded-r-lg border-t border-b border-r ${newType === 'income' ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={`font-bold ${newType === 'income' ? 'text-green-600' : 'text-slate-400'}`}>Income</Text>
                            </TouchableOpacity>
                        </View>

                        <TextInput
                            className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-3"
                            placeholder="Description (e.g. Parking, Gas, Merch Sales)"
                            value={newDesc}
                            onChangeText={setNewDesc}
                        />
                        <View className="flex-row gap-3">
                            <View className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-row items-center">
                                <Text className="text-slate-400 mr-1">$</Text>
                                <TextInput
                                    className="flex-1 font-bold text-slate-800"
                                    placeholder="0.00"
                                    keyboardType="numeric"
                                    value={newAmount}
                                    onChangeText={setNewAmount}
                                />
                            </View>
                            <TouchableOpacity
                                onPress={handleAddTransaction}
                                className="bg-slate-900 rounded-xl px-6 justify-center items-center"
                            >
                                <Text className="text-white font-bold">Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {eventTransactions.length === 0 ? (
                    <View className="p-8 items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl">
                        <Text className="text-slate-400 text-center">No extra transactions logged.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={eventTransactions}
                        keyExtractor={item => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                            <View className="bg-white p-4 rounded-2xl mb-2 flex-row justify-between items-center border border-slate-100 shadow-sm">
                                <View>
                                    <Text className="font-bold text-slate-800">{item.description}</Text>
                                    <Text className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</Text>
                                </View>
                                <View className="flex-row items-center gap-3">
                                    <Text className={`font-bold ${item.type === 'income' ? 'text-green-600' : 'text-rose-500'}`}>
                                        {item.type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                                    </Text>
                                    <TouchableOpacity onPress={() => deleteTransaction(item.id)}>
                                        <Ionicons name="trash-outline" size={18} color="#cbd5e1" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
}
