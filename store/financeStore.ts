import { deleteFromCloud, syncToCloud } from '@/lib/sync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Transaction } from './types';

interface FinanceState {
    transactions: Transaction[];

    // Actions
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, updates: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    setTransactions: (transactions: Transaction[]) => void;
    wipeData: () => void;

    // Getters / Helpers can be derived in components, but we might add some convenience ones here if needed?
    // For now, simpler is better.
}

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set, get) => ({
            transactions: [],

            addTransaction: (transaction) => {
                set((state) => ({
                    transactions: [transaction, ...state.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                }));
                syncToCloud('transactions', transaction);
            },

            updateTransaction: (id, updates) => {
                set((state) => {
                    const newTransactions = state.transactions.map((t) =>
                        t.id === id ? { ...t, ...updates } : t
                    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                    const updatedTransaction = newTransactions.find(t => t.id === id);
                    if (updatedTransaction) syncToCloud('transactions', updatedTransaction);

                    return { transactions: newTransactions };
                });
            },

            deleteTransaction: (id) => {
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id)
                }));
                deleteFromCloud('transactions', id);
            },

            setTransactions: (transactions) => set({
                transactions: transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            }),

            wipeData: async () => {
                set({ transactions: [] });
                // Clear persistence
                if (Platform.OS === 'web') {
                    if (typeof window !== 'undefined') window.localStorage.removeItem('finance-storage');
                } else {
                    await AsyncStorage.removeItem('finance-storage');
                }
            }
        }),
        {
            name: 'finance-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
