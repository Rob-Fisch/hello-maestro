import { useFinanceStore } from "@/store/financeStore";
import { Transaction } from "@/store/types";
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

export const seedFinanceData = async () => {
    const { addTransaction, wipeData } = useFinanceStore.getState();

    // Optional: Clear existing data first? Or just append? 
    // Let's not wipe, just append so they can add more if they want.
    // Actually, maybe safer to wipe so we don't duplicate if they click twice.
    // Let's wipe for a clean slate demo.
    await wipeData();

    // Configuration
    const today = new Date(); // Jan 5, 2026
    const START_MONTH = -3; // Oct 2025
    const END_MONTH = 2; // Mar 2026

    const categories = {
        income: ['Gig Payment', 'Lessons', 'Royalties', 'Session Work', 'Merch Sales'],
        expense: ['Gear', 'Travel', 'Rehearsal Space', 'Marketing', 'Software Subscriptions']
    };

    const descriptions = {
        income: ['Wedding Gig', 'Jazz Club Date', 'Private Students', 'Streaming Payout', 'Studio Session', 'T-Shirt Sales'],
        expense: ['Guitar Strings', 'Uber to Gig', 'Monthly Studio Rent', 'FB Ads', 'Logic Pro Plugin', 'Gas', 'Parking']
    };

    const transactions: Transaction[] = [];

    // Loop through months relative to today
    for (let i = START_MONTH; i <= END_MONTH; i++) {
        const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        // 1. Fixed Monthly Income (Lessons)
        transactions.push({
            id: uuidv4(),
            date: formatDate(year, month, 5), // 5th of month
            amount: 1200,
            type: 'income',
            category: 'Lessons',
            description: 'Monthly Student Payments',
            isRecurring: true
        });

        // 2. Fixed Monthly Expense (Rent)
        transactions.push({
            id: uuidv4(),
            date: formatDate(year, month, 1), // 1st of month
            amount: 450,
            type: 'expense',
            category: 'Rehearsal Space',
            description: 'Studio Rent',
            isRecurring: true
        });

        // 3. Random Gigs (2-4 per month)
        const numGigs = Math.floor(Math.random() * 3) + 2;
        for (let g = 0; g < numGigs; g++) {
            const day = Math.floor(Math.random() * 20) + 5; // mid-month
            transactions.push({
                id: uuidv4(),
                date: formatDate(year, month, day),
                amount: Math.floor(Math.random() * 400) + 150, // $150 - $550
                type: 'income',
                category: 'Gig Payment',
                description: getRandom(descriptions.income),
                isRecurring: false
            });
        }

        // 4. Random Expenses (3-5 per month)
        const numExp = Math.floor(Math.random() * 3) + 3;
        for (let e = 0; e < numExp; e++) {
            const day = Math.floor(Math.random() * 25) + 1;
            transactions.push({
                id: uuidv4(),
                date: formatDate(year, month, day),
                amount: Math.floor(Math.random() * 100) + 20, // $20 - $120
                type: 'expense',
                category: getRandom(categories.expense),
                description: getRandom(descriptions.expense),
                isRecurring: false
            });
        }
    }

    // Add them to store
    // We add explicitly to trigger state updates
    transactions.forEach(t => addTransaction(t));

    return transactions.length;
};

// Helpers
function formatDate(year: number, month: number, day: number): string {
    const d = new Date(year, month, day);
    // Format YYYY-MM-DD manually to avoid timezone issues/shifting
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const da = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${da}`;
}

function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
