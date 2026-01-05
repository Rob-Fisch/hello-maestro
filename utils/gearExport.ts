import { GearAsset } from '@/store/types';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

export const exportGearInventory = async (assets: GearAsset[], ownerName?: string) => {
    try {
        const totalPurchase = assets.reduce((sum, a) => sum + (parseFloat(a.financials?.purchasePrice || '0') || 0), 0);
        const totalValue = assets.reduce((sum, a) => sum + (parseFloat(a.financials?.currentValue || '0') || 0), 0);

        const html = `
            <html>
                <head>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
                    <style>
                        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 3px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px; }
                        h1 { font-size: 32px; margin: 0; color: #111; }
                        .summary-grid { display: flex; gap: 20px; margin-bottom: 40px; }
                        .summary-box { flex: 1; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
                        .summary-label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #64748b; letter-spacing: 0.1em; }
                        .summary-value { font-size: 24px; font-weight: 900; color: #1e293b; margin-top: 4px; }
                        
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th { text-align: left; padding: 12px; background-color: #f1f5f9; font-size: 12px; text-transform: uppercase; font-weight: 800; color: #475569; }
                        td { padding: 12px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                        .item-name { font-weight: bold; color: #1e293b; }
                        .item-meta { font-size: 12px; color: #64748b; }
                        .status-badge { font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px; text-transform: uppercase; }
                        
                        .footer { margin-top: 60px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${ownerName ? ownerName + ' ' : ''}Gear Inventory</h1>
                        <p style="color: #64748b; margin-top: 8px;">Asset & Valuation Report for Insurance/Tax Purposes</p>
                    </div>

                    <div class="summary-grid">
                        <div class="summary-box">
                            <div class="summary-label">Total Assets</div>
                            <div class="summary-value">${assets.length}</div>
                        </div>
                        <div class="summary-box">
                            <div class="summary-label">Total Purchase Price</div>
                            <div class="summary-value">$${totalPurchase.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                        <div class="summary-box">
                            <div class="summary-label">Current Net Value</div>
                            <div class="summary-value">$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                        </div>
                    </div>

                    <table>
                        <thead>
                            <tr>
                                <th>Item / Serial</th>
                                <th>Category</th>
                                <th>Status</th>
                                <th>Purchase</th>
                                <th>Current</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${assets.map(asset => `
                                <tr>
                                    <td>
                                        <div class="item-name">${asset.brand || ''} ${asset.name}</div>
                                        <div class="item-meta">${asset.model || ''} ${asset.serialNumber ? `• SN: ${asset.serialNumber}` : ''}</div>
                                    </td>
                                    <td>${asset.category}</td>
                                    <td><span class="status-badge">${asset.status}</span></td>
                                    <td>$${parseFloat(asset.financials?.purchasePrice || '0').toFixed(2)}</td>
                                    <td>$${parseFloat(asset.financials?.currentValue || '0').toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="footer">
                        Report Generated for ${ownerName || 'User'} on ${new Date().toLocaleDateString()}
                    </div>
                </body>
            </html>
        `;

        const { base64 } = await Print.printToFileAsync({ html, base64: true });
        if (base64) {
            const filename = `Gear_Inventory_${new Date().toISOString().split('T')[0]}.pdf`;
            const fileUri = `${FileSystem.documentDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(fileUri, base64, { encoding: 'base64' });
            await Sharing.shareAsync(fileUri, { UTI: '.pdf', mimeType: 'application/pdf' });
        }
    } catch (error) {
        console.error('Error generating Gear PDF:', error);
        Alert.alert('Error', 'Failed to generate inventory report.');
    }
};
