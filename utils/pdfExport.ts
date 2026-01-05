import { Routine, UserSettings } from '@/store/types';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Alert, Platform } from 'react-native';

// Helper: Fetch bytes (Web/Native compatible)
const getFileBytes = async (uri: string): Promise<Uint8Array | null> => {
    try {
        if (Platform.OS === 'web') {
            const response = await fetch(uri);
            const buffer = await response.arrayBuffer();
            return new Uint8Array(buffer);
        } else {
            // Native: Resolve file URI
            let cleanUri = uri;
            if (uri.startsWith('http')) {
                const filename = uri.split('/').pop()?.split('?')[0] || 'temp_down';
                cleanUri = `${FileSystem.cacheDirectory}${filename}`;
                await FileSystem.downloadAsync(uri, cleanUri);
            }

            const base64 = await FileSystem.readAsStringAsync(cleanUri, { encoding: 'base64' });
            // Manual base64 to Uint8Array conversion for Native
            const raw = atob(base64);
            const uint8Array = new Uint8Array(raw.length);
            for (let i = 0; i < raw.length; i++) uint8Array[i] = raw.charCodeAt(i);
            return uint8Array;
        }
    } catch (e) {
        console.warn('Error fetching bytes:', uri, e);
        return null;
    }
};

// Helper: Base64 decode for Native (polyfill if needed)
const atob = (input: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let str = input.replace(/=+$/, '');
    let output = '';
    if (str.length % 4 == 1) throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");
    for (let bc = 0, bs = 0, buffer, i = 0; buffer = str.charAt(i++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
    }
    return output;
};

// Helper: Resolve URI (Exported for general use)
export const resolveFileUri = async (uri: string): Promise<string | null> => {
    if (!uri || uri.startsWith('data:')) return uri;
    if ((Platform.OS as any) === 'web') return uri;

    // Handle Remote Cloud URIs
    if (uri.startsWith('http')) {
        try {
            const filename = uri.split('/').pop()?.split('?')[0] || 'remote_file';
            const cachePath = `${FileSystem.cacheDirectory}${filename}`;
            const info = await FileSystem.getInfoAsync(cachePath);
            if (info.exists) return cachePath;

            await FileSystem.downloadAsync(uri, cachePath);
            return cachePath;
        } catch (e) {
            console.warn('Failed to download remote file:', uri, e);
            return uri; // Fallback to raw URL
        }
    }

    let cleanUri = uri;
    try {
        if (uri.includes('%')) {
            cleanUri = decodeURIComponent(uri);
        }
    } catch (e) { }

    if (Platform.OS !== 'web' && !cleanUri.startsWith('file://') && !cleanUri.startsWith('content://')) {
        cleanUri = `file://${cleanUri}`;
    }

    const docDir = FileSystem.documentDirectory;
    if ((Platform.OS as any) === 'ios' && cleanUri.includes('/Application/') && docDir) {
        const uuidMatch = docDir.match(/Application\/([A-Z0-9-]+)\//);
        if (uuidMatch && uuidMatch[1]) {
            const currentUuid = uuidMatch[1];
            const oldUuidMatch = cleanUri.match(/Application\/([A-Z0-9-]+)\//);
            if (oldUuidMatch && oldUuidMatch[1] && oldUuidMatch[1] !== currentUuid) {
                cleanUri = cleanUri.replace(oldUuidMatch[1], currentUuid);
            }
        }
    }

    let fileInfo = await FileSystem.getInfoAsync(cleanUri);
    if (fileInfo.exists) return cleanUri;

    return null;
};

// Helper: Simple Word Wrap
const wrapText = (text: string, maxWidth: number, font: any, fontSize: number) => {
    const words = text.split(' ');
    let lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
        if (width < maxWidth) {
            currentLine += ` ${word}`;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }
    lines.push(currentLine);
    return lines;
};

export const exportToPdf = async (routine: Routine, settings: UserSettings, ownerName?: string) => {
    try {
        // 1. Create a new PDF Document
        const pdfDoc = await PDFDocument.create();

        // Metadata Sanitization (White Label)
        pdfDoc.setTitle(routine.title);
        pdfDoc.setAuthor(ownerName || 'Maestro User');
        pdfDoc.setProducer(ownerName || 'Maestro User');
        pdfDoc.setCreator(ownerName || 'Maestro User');

        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        // 2. Add Title Page
        let page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const margin = 50;

        page.drawText(routine.title, {
            x: margin,
            y: height - 80,
            size: 24,
            font: fontBold,
            color: rgb(0, 0, 0),
        });

        if (routine.description) {
            const descLines = wrapText(routine.description, width - (margin * 2), font, 12);
            let yPos = height - 120;
            descLines.forEach(line => {
                page.drawText(line, { x: margin, y: yPos, size: 12, font: font, color: rgb(0.4, 0.4, 0.4) });
                yPos -= 18;
            });
        }

        page.drawText(`Prepared by ${ownerName || 'Maestro User'} • ${new Date().toLocaleDateString()}`, {
            x: margin,
            y: 30,
            size: 10,
            font: font,
            color: rgb(0.6, 0.6, 0.6),
        });

        // 3. Process Content Blocks
        for (const block of routine.blocks) {
            const isPdf = block.mediaUri?.toLowerCase().split('?')[0].endsWith('.pdf');

            if (isPdf && block.mediaUri) {
                // --- MERGE PDF ---
                const pdfBytes = await getFileBytes(block.mediaUri);
                if (pdfBytes) {
                    try {
                        const srcDoc = await PDFDocument.load(pdfBytes);
                        const indices = srcDoc.getPageIndices();
                        const copiedPages = await pdfDoc.copyPages(srcDoc, indices);
                        copiedPages.forEach((p) => pdfDoc.addPage(p));
                    } catch (e) {
                        console.warn('Failed to merge PDF:', block.title);
                    }
                }
            } else {
                // --- DRAW TEXT / IMAGE ---
                // Always start a new page for a new block (Book/Chapter style)
                page = pdfDoc.addPage();
                let yCursor = height - 60;

                // Block Title
                page.drawText(block.title, {
                    x: margin,
                    y: yCursor,
                    size: 18,
                    font: fontBold,
                    color: rgb(0, 0, 0),
                });
                yCursor -= 30;

                // Block Content (Text)
                if (block.content) {
                    const lines = wrapText(block.content, width - (margin * 2), font, 12);
                    for (const line of lines) {
                        if (yCursor < 50) {
                            page = pdfDoc.addPage();
                            yCursor = height - 60;
                        }
                        page.drawText(line, { x: margin, y: yCursor, size: 12, font: font });
                        yCursor -= 18;
                    }
                    yCursor -= 20;
                }

                // Block Image (if exists and not PDF)
                if (block.mediaUri && !isPdf) {
                    try {
                        const imgBytes = await getFileBytes(block.mediaUri);
                        if (imgBytes) {
                            let image;
                            // Naive check for PNG vs JPG headers could be better, but try/catch works
                            try {
                                image = await pdfDoc.embedPng(imgBytes);
                            } catch {
                                image = await pdfDoc.embedJpg(imgBytes);
                            }

                            if (image) {
                                const imgDims = image.scaleToFit(width - (margin * 2), height / 2);

                                if (yCursor - imgDims.height < 50) {
                                    page = pdfDoc.addPage();
                                    yCursor = height - 60;
                                }

                                page.drawImage(image, {
                                    x: margin,
                                    y: yCursor - imgDims.height,
                                    width: imgDims.width,
                                    height: imgDims.height,
                                });
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to embed image:', block.title);
                    }
                }
            }
        }

        // 4. Save & Encode
        const pdfBase64 = await pdfDoc.saveAsBase64();

        // 5. Download / Share
        if (Platform.OS === 'web') {
            // Web: Create Blob and Click Link
            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${routine.title.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            // Native: Save to FileSystem and Share
            const filename = `${routine.title.replace(/\s+/g, '_')}.pdf`;
            const fileUri = `${FileSystem.documentDirectory}${filename}`;
            await FileSystem.writeAsStringAsync(fileUri, pdfBase64, { encoding: 'base64' });
            await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
        }

    } catch (error) {
        console.error('PDF Generation Failed:', error);
        Alert.alert('Export Error', 'Failed to generate PDF. Check log.');
    }
};
