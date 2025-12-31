import { uploadMediaToCloud } from '@/lib/sync';
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { ContentBlock } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Alert, Image, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const FS: any = FileSystem;

const documentDirectory = FS.documentDirectory;
const copyAsync = FS.copyAsync;

export default function BlockEditor() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const id = params.id as string | undefined;
    const theme = useTheme();

    const { blocks, addBlock, updateBlock, categories } = useContentStore();
    const existingBlock = id ? blocks.find((b) => b.id === id) : undefined;
    const isEditing = !!existingBlock;

    const [title, setTitle] = useState(existingBlock?.title || '');
    const [type, setType] = useState<ContentBlock['type']>(existingBlock?.type || 'text');
    const [categoryId, setCategoryId] = useState<string | undefined>(existingBlock?.categoryId || 'cat-6'); // Default to 'Other'
    const [content, setContent] = useState(existingBlock?.content || '');
    const [tags, setTags] = useState(existingBlock?.tags.join(', ') || '');
    const [linkUrl, setLinkUrl] = useState(existingBlock?.linkUrl || '');
    const [mediaUri, setMediaUri] = useState<string | undefined>(existingBlock?.mediaUri);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);
    const [uploadingMedia, setUploadingMedia] = useState(false);


    const saveToPersistentStorage = async (uri: string, originalName?: string | null) => {
        try {
            if (Platform.OS === 'web') return uri;

            // Path Healing for iOS (Application UUID changes)
            let sourceUri = uri;
            if (Platform.OS === 'ios' && uri.includes('/Application/')) {
                const docDir = documentDirectory;
                const uuidMatch = docDir?.match(/Application\/([A-Z0-9-]+)\//);
                if (uuidMatch && uuidMatch[1]) {
                    const currentUuid = uuidMatch[1];
                    const oldUuidMatch = uri.match(/Application\/([A-Z0-9-]+)\//);
                    if (oldUuidMatch && oldUuidMatch[1] && oldUuidMatch[1] !== currentUuid) {
                        sourceUri = uri.replace(oldUuidMatch[1], currentUuid);
                    }
                }
            }

            // Ensure destination filename is clean and unique
            const baseName = originalName || sourceUri.split('/').pop() || 'file';
            const cleanName = baseName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filename = `${Date.now()}-${cleanName}`;
            const dest = `${documentDirectory}${filename}`;

            await copyAsync({ from: sourceUri, to: dest });
            return dest;
        } catch (e: any) {
            console.error('Failed to save media to persistent storage:', e);
            if (Platform.OS !== 'web') {
                Alert.alert('Save Error', `Could not save file to local storage. ${e.message}`);
            }
            return uri;
        }
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            // Size Check (15MB for images)
            const MAX_SIZE = 15 * 1024 * 1024;
            if (asset.fileSize && asset.fileSize > MAX_SIZE) {
                Alert.alert('Image Too Large', 'To keep your cloud sync fast and free, images are limited to 15MB. Please choose a smaller photo.');
                return;
            }

            const persistentUri = await saveToPersistentStorage(asset.uri, asset.fileName);
            setMediaUri(persistentUri);
            setType('sheet_music'); // Auto-switch type

            // Cloud Sync
            setUploadingMedia(true);
            const cloudUrl = await uploadMediaToCloud(persistentUri, asset.fileName || 'image.jpg');
            if (cloudUrl) setMediaUri(cloudUrl);
            setUploadingMedia(false);
        }

    };

    const takePhoto = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            // Size Check (15MB for photos)
            const MAX_SIZE = 15 * 1024 * 1024;
            if (asset.fileSize && asset.fileSize > MAX_SIZE) {
                Alert.alert('Photo Too Large', 'This photo exceeds the 15MB limit. Try lowering your camera resolution settings.');
                return;
            }

            const persistentUri = await saveToPersistentStorage(asset.uri, asset.fileName);
            setMediaUri(persistentUri);
            setType('sheet_music');

            setUploadingMedia(true);
            const cloudUrl = await uploadMediaToCloud(persistentUri, asset.fileName || 'photo.jpg');
            if (cloudUrl) setMediaUri(cloudUrl);
            setUploadingMedia(false);
        }

    };

    const pickDocument = async () => {
        const result = await DocumentPicker.getDocumentAsync({
            type: 'application/pdf',
        });

        if (!result.canceled) {
            const asset = result.assets[0];

            // Size Check (10MB for PDFs)
            const MAX_SIZE = 10 * 1024 * 1024;
            const fileSize = asset.size;
            if (fileSize && fileSize > MAX_SIZE) {
                Alert.alert('PDF Too Large', 'PDF files are limited to 10MB to ensure your repertoire packet exports smoothly.');
                return;
            }

            const persistentUri = await saveToPersistentStorage(asset.uri, asset.name);
            setMediaUri(persistentUri);
            setType('sheet_music');

            setUploadingMedia(true);
            const cloudUrl = await uploadMediaToCloud(persistentUri, asset.name);
            if (cloudUrl) setMediaUri(cloudUrl);
            setUploadingMedia(false);
        }

    };


    const handleSave = () => {
        if (!title.trim()) {
            if (Platform.OS === 'web') {
                alert('Please enter a title');
            } else {
                Alert.alert('Error', 'Please enter a title');
            }
            return;
        }

        const blockData: ContentBlock = {
            id: id || Date.now().toString(),
            title,
            type,
            categoryId,
            content,
            tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
            mediaUri,
            linkUrl: linkUrl.trim() || undefined,
            createdAt: existingBlock?.createdAt || new Date().toISOString(),
        };

        if (isEditing && id) {
            updateBlock(id, blockData);
        } else {
            addBlock(blockData);
        }
        router.back();
    };

    const startInputStyle = {
        backgroundColor: '#ffffff', // White
        borderColor: '#e2e8f0',     // Slate 200
        color: '#0f172a'            // Slate 900
    };

    const labelStyle = "text-sm font-bold mb-2 text-slate-500 uppercase tracking-wider";

    return (
        <View className="flex-1" style={{ backgroundColor: '#ffffff' }}>
            <ScrollView
                className="flex-1 px-6 pt-6"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                {/* Custom Header */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-4 p-2 -ml-2 rounded-full"
                    >
                        <Ionicons name="arrow-back" size={28} color="#0f172a" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-slate-500 uppercase tracking-widest">Back to Activities</Text>
                </View>

                <Text className="text-3xl font-black mb-8 text-slate-900 tracking-tight">
                    {isEditing ? 'Edit Activity' : 'Add Activity'}
                </Text>

                {/* Title Input */}
                <View className="mb-6">
                    <Text className={labelStyle}>Title</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-lg font-bold"
                        style={startInputStyle}
                        placeholder="e.g., C Major Scale"
                        placeholderTextColor="#94a3b8"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Type Selection */}
                <View className="mb-6">
                    <Text className={labelStyle}>Type</Text>
                    <View className="flex-row gap-3">
                        {(['text', 'sheet_music'] as const).map((t) => {
                            const isSelected = type === t;
                            return (
                                <Pressable
                                    key={t}
                                    onPress={() => setType(t)}
                                    style={({ pressed }) => ({
                                        opacity: pressed ? 0.8 : 1,
                                        backgroundColor: isSelected ? '#0f172a' : '#f1f5f9', // Slate 900 vs Slate 100
                                        borderColor: isSelected ? '#0f172a' : '#e2e8f0',
                                        borderWidth: 1,
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 16,
                                        borderRadius: 12,
                                    })}
                                >
                                    <Text
                                        style={{
                                            color: isSelected ? 'white' : '#0f172a',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                            letterSpacing: 2,
                                            fontSize: 12
                                        }}
                                    >
                                        {t.replace('_', ' ')}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                {/* Category Selection */}
                <View className="mb-6">
                    <Text className={labelStyle}>Category</Text>
                    <TouchableOpacity
                        onPress={() => setShowCategoryPicker(true)}
                        className="p-4 rounded-xl border flex-row justify-between items-center"
                        style={startInputStyle}
                    >
                        <Text className="text-slate-900 font-bold text-base">
                            {categories.find(c => c.id === categoryId)?.name || 'Select Category'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#94a3b8" />
                    </TouchableOpacity>

                    <Modal
                        visible={showCategoryPicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowCategoryPicker(false)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="rounded-t-[40px] p-6 pb-12 max-h-[80%] bg-white border border-slate-200">
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-black text-slate-900">Select Category</Text>
                                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)} className="bg-slate-100 p-2 rounded-full">
                                        <Ionicons name="close" size={24} color="#0f172a" />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {categories
                                        .sort((a, b) => a.name.localeCompare(b.name)) // ALPHABETICAL SORT
                                        .map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                onPress={() => {
                                                    setCategoryId(cat.id);
                                                    setShowCategoryPicker(false);
                                                }}
                                                className={`p-5 mb-2 rounded-2xl flex-row justify-between items-center border ${categoryId === cat.id ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-100'}`}
                                            >
                                                <Text className={`text-lg font-bold ${categoryId === cat.id ? 'text-white' : 'text-slate-500'}`}>
                                                    {cat.name}
                                                </Text>
                                                {categoryId === cat.id && <Ionicons name="checkmark" size={24} color="white" />}
                                            </TouchableOpacity>
                                        ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Link URL Input */}
                <View className="mb-6">
                    <Text className={labelStyle}>External Link (YouTube/Spotify)</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-base"
                        style={startInputStyle}
                        placeholder="https://..."
                        placeholderTextColor="#94a3b8"
                        value={linkUrl}
                        onChangeText={setLinkUrl}
                        autoCapitalize="none"
                    />
                </View>

                {/* Media Attachments */}
                {type !== 'text' && (
                    <View className="mb-8">
                        <Text className={labelStyle}>Attachments</Text>

                        <View className="flex-row gap-3 mb-4">
                            <Pressable
                                onPress={takePhoto}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                className="bg-pink-50 border border-pink-100 p-4 rounded-xl items-center flex-1"
                            >
                                <Ionicons name="camera" size={24} color="#db2777" />
                                <Text className="text-pink-600 font-bold text-xs mt-2 uppercase">Camera</Text>
                            </Pressable>
                            <Pressable
                                onPress={pickImage}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                className="bg-blue-50 border border-blue-100 p-4 rounded-xl items-center flex-1"
                            >
                                <Ionicons name="image" size={24} color="#2563eb" />
                                <Text className="text-blue-600 font-bold text-xs mt-2 uppercase">Gallery</Text>
                            </Pressable>
                            <Pressable
                                onPress={pickDocument}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                className="bg-red-50 border border-red-100 p-4 rounded-xl items-center flex-1"
                            >
                                <Ionicons name="document-text" size={24} color="#dc2626" />
                                <Text className="text-red-600 font-bold text-xs mt-2 uppercase">PDF</Text>
                            </Pressable>
                        </View>

                        {mediaUri && (
                            <View className="bg-slate-50 border border-slate-200 p-3 rounded-2xl relative">
                                {uploadingMedia ? (
                                    <View className="w-full h-40 items-center justify-center rounded-xl bg-slate-100">
                                        <View className="bg-white p-4 rounded-2xl items-center shadow-sm">
                                            <Text className="text-blue-600 font-bold mb-2">Syncing...</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <Text className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider ml-1">Attached Media</Text>
                                        {mediaUri.endsWith('.pdf') ? (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    if (Platform.OS === 'web') {
                                                        // Debug info
                                                        console.log('Attempting to open:', mediaUri);
                                                        if (!mediaUri) {
                                                            alert('Error: No URI found');
                                                            return;
                                                        }
                                                        window.open(mediaUri, '_blank');
                                                        return;
                                                    }

                                                    // Native handling
                                                    if (mediaUri.startsWith('http')) {
                                                        // Remote PDF (Native): In-App Browser
                                                        await WebBrowser.openBrowserAsync(mediaUri);
                                                    } else if (await Sharing.isAvailableAsync()) {
                                                        // Local File (Native): Share/Preview Sheet
                                                        await Sharing.shareAsync(mediaUri);
                                                    } else {
                                                        Alert.alert('Preview Unavailable', 'Cannot preview this file.');
                                                    }
                                                }}
                                                className="flex-row items-center p-4 bg-white rounded-xl border border-slate-200"
                                            >
                                                <Ionicons name="document-text" size={32} color="#0f172a" />
                                                <View className="ml-3 flex-1">
                                                    <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>
                                                        {decodeURIComponent(mediaUri.split('/').pop()?.replace(/^\d+-/, '') || 'Document')}
                                                    </Text>
                                                    <Text className="text-[10px] text-slate-400 font-black uppercase mt-1">Tap to Preview</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) : (
                                            <Image source={{ uri: mediaUri }} className="w-full h-48 rounded-xl bg-slate-200" resizeMode="cover" />
                                        )}
                                        <Pressable
                                            onPress={() => setMediaUri(undefined)}
                                            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                            className="absolute top-4 right-4 bg-white w-8 h-8 rounded-full items-center justify-center shadow-lg shadow-black/10 border border-slate-100"
                                        >
                                            <Ionicons name="close" size={18} color="black" />
                                        </Pressable>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Notes Input */}
                <View className="mb-6">
                    <Text className={labelStyle}>Content / Notes</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-base min-h-[120px]"
                        style={startInputStyle}
                        placeholder="Enter notes or instructions..."
                        placeholderTextColor="#94a3b8"
                        multiline
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                    />
                </View>

                {/* Tags Input */}
                <View className="mb-8">
                    <Text className={labelStyle}>Tags</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-base"
                        style={startInputStyle}
                        placeholder="warmup, jazz (comma separated)"
                        placeholderTextColor="#94a3b8"
                        value={tags}
                        onChangeText={setTags}
                    />
                </View>
            </ScrollView>

            {/* Fixed Action Buttons at the bottom */}
            <View className="flex-row gap-4 p-6 border-t border-slate-200" style={{ backgroundColor: '#ffffff' }}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1
                    })}
                    className="flex-1 p-4 rounded-2xl bg-slate-100 border border-slate-200"
                >
                    <Text className="text-center font-bold text-slate-500">Cancel</Text>
                </Pressable>
                <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 p-4 rounded-2xl bg-slate-900 shadow-sm items-center justify-center"
                >
                    <Text className="text-white font-black text-center text-base uppercase tracking-wider">Save Activity</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
