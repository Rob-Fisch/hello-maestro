import { Transaction } from '@/store/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

/**
 * Generates a CSV string from a list of transactions.
 */
export const generateTransactionsCSV = (transactions: Transaction[]): string => {
    // CSV Header
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Related Event', 'Receipt Link'];
    const rows = transactions.map(t => {
        // Escape quotes to prevent CSV breakage
        const safeDesc = t.description ? `"${t.description.replace(/"/g, '""')}"` : '';
        const safeCat = `"${t.category.replace(/"/g, '""')}"`;
        const date = new Date(t.date).toLocaleDateString();

        return [
            date,
            t.type,
            safeCat,
            safeDesc,
            t.amount.toString(),
            t.relatedEventId ? 'Yes' : 'No',
            t.receiptUri || ''
        ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
};

/**
 * Handles the export flow: Generate CSV -> Save File -> Share/Download
 */
export const exportFinanceData = async (transactions: Transaction[], filename: string = 'opusmode_finance_export.csv') => {
    try {
        const csvData = generateTransactionsCSV(transactions);

        if (Platform.OS === 'web') {
            // Web Download Logic
            const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } else {
            // Native Share Logic
            const fileUri = FileSystem.documentDirectory + filename;
            await FileSystem.writeAsStringAsync(fileUri, csvData, { encoding: FileSystem.EncodingType.UTF8 });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri);
            } else {
                alert('Sharing is not available on this device');
            }
        }
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export data. Please try again.');
    }
};
