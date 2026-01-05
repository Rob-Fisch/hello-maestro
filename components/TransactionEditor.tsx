import { Transaction, TransactionType } from '@/store/types';
import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface TransactionEditorProps {
    visible: boolean;
    onClose: () => void;
    onSave: (transaction: Transaction) => void;
    initialData?: Transaction;
    defaultType?: TransactionType;
}

export default function TransactionEditor({ visible, onClose, onSave, initialData, defaultType = 'expense' }: TransactionEditorProps) {
    const isEditing = !!(initialData && initialData.id);
    const [type, setType] = useState<TransactionType>(initialData?.type || defaultType);
    const [amount, setAmount] = useState(initialData?.amount?.toString() || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
    const [relatedEventId, setRelatedEventId] = useState(initialData?.relatedEventId);

    const handleSave = () => {
        if (!amount || isNaN(Number(amount))) {
            alert('Please enter a valid amount');
            return;
        }
        if (!category) {
            alert('Please select a category');
            return;
        }

        const newTransaction: Transaction = {
            id: initialData?.id || Date.now().toString(),
            date: date,
            amount: parseFloat(amount),
            type,
            category,
            description,
            relatedEventId,
            createdAt: initialData?.createdAt || new Date().toISOString(),
        };

        onSave(newTransaction);
        onClose();
        // Reset form if adding new
        if (!isEditing) {
            setAmount('');
            setCategory('');
            setDescription('');
        }
    };

    const categories = type === 'income'
        ? ['Gig', 'Lesson', 'Merch', 'Royalty', 'Tip', 'Other']
        : ['Gear', 'Travel', 'Meals', 'Rehearsal', 'Marketing', 'Musician Payout', 'Other'];

    console.log('[TransactionEditor] Render', { visible });

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-stone-50">
                <View className="flex-row justify-between items-center p-4 border-b border-stone-200 bg-white">
                    <TouchableOpacity onPress={onClose} className="p-2">
                        <Text className="text-stone-500 font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-black text-lg">{isEditing ? 'Edit Transaction' : 'New Transaction'}</Text>
                    <TouchableOpacity onPress={handleSave} className="p-2">
                        <Text className="text-blue-600 font-bold">Save</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 p-6">
                    {/* TYPE TOGGLE */}
                    <View className="flex-row bg-stone-200 p-1 rounded-xl mb-8">
                        {(['income', 'expense'] as TransactionType[]).map((t) => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setType(t)}
                                className={`flex-1 py-2 items-center rounded-lg ${type === t ? (t === 'income' ? 'bg-green-600' : 'bg-red-500') : 'bg-transparent'}`}
                            >
                                <Text className={`font-black uppercase text-xs tracking-wider ${type === t ? 'text-white' : 'text-stone-500'}`}>
                                    {t}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* AMOUNT */}
                    <View className="items-center mb-8">
                        <Text className="text-stone-400 font-bold uppercase text-xs tracking-widest mb-2">Amount</Text>
                        <View className="flex-row items-center">
                            <Text className={`text-5xl font-black mr-1 ${type === 'income' ? 'text-green-600' : 'text-stone-800'}`}>$</Text>
                            <TextInput
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                placeholder="0.00"
                                className={`text-6xl font-black ${type === 'income' ? 'text-green-600' : 'text-stone-800'}`}
                                autoFocus
                            />
                        </View>
                    </View>

                    {/* CATEGORY */}
                    <Text className="text-stone-400 font-bold uppercase text-xs tracking-widest mb-3">Category</Text>
                    <View className="flex-row flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <TouchableOpacity
                                key={cat}
                                onPress={() => setCategory(cat)}
                                className={`px-4 py-2 rounded-full border ${category === cat ? 'bg-stone-800 border-stone-800' : 'bg-white border-stone-200'}`}
                            >
                                <Text className={`font-bold ${category === cat ? 'text-white' : 'text-stone-600'}`}>{cat}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* DESCRIPTION */}
                    <Text className="text-stone-400 font-bold uppercase text-xs tracking-widest mb-2">Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        placeholder="e.g. Wedding Gig at The Plaza"
                        className="bg-white p-4 rounded-xl border border-stone-200 text-lg font-bold text-stone-800 mb-8"
                    />

                    {/* DATE */}
                    <Text className="text-stone-400 font-bold uppercase text-xs tracking-widest mb-2">Date (YYYY-MM-DD)</Text>
                    <TextInput
                        value={date}
                        onChangeText={setDate} // Simple text input for now, could use a DatePicker later
                        placeholder="2024-01-01"
                        className="bg-white p-4 rounded-xl border border-stone-200 text-lg font-bold text-stone-800 mb-8"
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </Modal>
    );
}
