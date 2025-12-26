import { uploadMediaToCloud } from '@/lib/sync';
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

    return (
        <View className="flex-1 bg-background">
            <ScrollView
                className="flex-1 px-4 pt-4"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 20 }}
            >
                <Text className="text-2xl font-bold mb-6">{isEditing ? 'Edit Activity' : 'New Activity'}</Text>

                {/* Title Input */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1 text-muted-foreground">Title</Text>
                    <TextInput
                        className="bg-card border border-border p-3 rounded-lg text-foreground"
                        placeholder="e.g., C Major Scale"
                        value={title}
                        onChangeText={setTitle}
                    />
                </View>

                {/* Type Selection */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-2 text-muted-foreground">Type</Text>
                    <View className="flex-row gap-2">
                        {(['text', 'sheet_music'] as const).map((t) => (
                            <Pressable
                                key={t}
                                onPress={() => setType(t)}
                                style={({ pressed }) => ({
                                    opacity: pressed ? 0.6 : 1
                                })}
                                className={`px-4 py-2 rounded-full border ${type === t
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'bg-card border-border'
                                    } `}
                            >
                                <Text
                                    className={`capitalize ${type === t ? 'text-white font-semibold' : 'text-foreground'} `}
                                >
                                    {t.replace('_', ' ')}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* Category Selection */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1 text-muted-foreground">Category</Text>
                    <TouchableOpacity
                        onPress={() => setShowCategoryPicker(true)}
                        className="bg-card border border-border p-3 rounded-lg flex-row justify-between items-center"
                    >
                        <Text className="text-foreground font-semibold">
                            {categories.find(c => c.id === categoryId)?.name || 'Select Category'}
                        </Text>
                        <Text className="text-muted-foreground">▼</Text>
                    </TouchableOpacity>

                    <Modal
                        visible={showCategoryPicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowCategoryPicker(false)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="bg-white rounded-t-[40px] p-6 pb-12 max-h-[80%]">
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-black text-foreground">Select Category</Text>
                                    <TouchableOpacity onPress={() => setShowCategoryPicker(false)} className="bg-gray-100 p-2 rounded-full">
                                        <Text className="text-gray-500 font-bold px-2">Close</Text>
                                    </TouchableOpacity>
                                </View>
                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {categories.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => {
                                                setCategoryId(cat.id);
                                                setShowCategoryPicker(false);
                                            }}
                                            className={`p-5 mb-2 rounded-2xl flex-row justify-between items-center ${categoryId === cat.id ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50'}`}
                                        >
                                            <Text className={`text-lg font-bold ${categoryId === cat.id ? 'text-blue-600' : 'text-gray-700'}`}>
                                                {cat.name}
                                            </Text>
                                            {categoryId === cat.id && <Text className="text-blue-600 font-black">✓</Text>}
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        </View>
                    </Modal>
                </View>

                {/* Link URL Input */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1 text-muted-foreground">External Link (YouTube/Spotify)</Text>
                    <TextInput
                        className="bg-card border border-border p-3 rounded-lg text-foreground"
                        placeholder="https://..."
                        value={linkUrl}
                        onChangeText={setLinkUrl}
                        autoCapitalize="none"
                    />
                </View>

                {/* Media Attachments */}
                {type !== 'text' && (
                    <View className="mb-6">
                        <Text className="text-sm font-medium mb-2 text-muted-foreground">Attachments</Text>

                        <View className="flex-row gap-3 mb-3">
                            <Pressable
                                onPress={takePhoto}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                className="bg-gray-100 p-3 rounded-lg items-center flex-1"
                            >
                                <Text>📷 Camera</Text>
                            </Pressable>
                            <Pressable
                                onPress={pickImage}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                className="bg-gray-100 p-3 rounded-lg items-center flex-1"
                            >
                                <Text>🖼️ Gallery</Text>
                            </Pressable>
                            <Pressable
                                onPress={pickDocument}
                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                className="bg-gray-100 p-3 rounded-lg items-center flex-1"
                            >
                                <Text>📄 PDF</Text>
                            </Pressable>
                        </View>

                        {mediaUri && (
                            <View className="bg-gray-100 p-2 rounded-lg relative">
                                {uploadingMedia ? (
                                    <View className="w-full h-40 items-center justify-center bg-gray-200 rounded">
                                        <View className="bg-white/80 p-4 rounded-2xl items-center">
                                            <Text className="text-blue-600 font-bold mb-2">Syncing with Cloud...</Text>
                                            <Text className="text-xs text-gray-400">Puddle-Proofing Media</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <Text className="text-xs text-gray-500 mb-1">Attached Media:</Text>
                                        {mediaUri.endsWith('.pdf') ? (
                                            <TouchableOpacity
                                                onPress={async () => {
                                                    if (mediaUri.startsWith('http')) {
                                                        // Remote PDF: Open in In-App Browser
                                                        await WebBrowser.openBrowserAsync(mediaUri);
                                                    } else if (await Sharing.isAvailableAsync()) {
                                                        // Local File: Share/Preview
                                                        await Sharing.shareAsync(mediaUri);
                                                    } else {
                                                        Alert.alert('Preview Unavailable', 'Cannot preview this file.');
                                                    }
                                                }}
                                                className="flex-row items-center p-2 bg-white rounded-lg border border-gray-200"
                                            >
                                                <Ionicons name="document-text" size={24} color="#ef4444" />
                                                <View className="ml-2 flex-1">
                                                    <Text className="font-semibold text-foreground" numberOfLines={1}>
                                                        {decodeURIComponent(mediaUri.split('/').pop()?.replace(/^\d+-/, '') || 'Document')}
                                                    </Text>
                                                    <Text className="text-[10px] text-blue-500 font-bold uppercase mt-0.5">Tap to Preview</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) : (
                                            <Image source={{ uri: mediaUri }} className="w-full h-40 rounded bg-gray-300" resizeMode="cover" />
                                        )}
                                        <Pressable
                                            onPress={() => setMediaUri(undefined)}
                                            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                            className="absolute top-2 right-2 bg-red-500 w-6 h-6 rounded-full items-center justify-center"
                                        >
                                            <Text className="text-white font-bold text-xs">X</Text>
                                        </Pressable>
                                    </>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Notes Input */}
                <View className="mb-4">
                    <Text className="text-sm font-medium mb-1 text-muted-foreground">Content / Notes</Text>
                    <TextInput
                        className="bg-card border border-border p-3 rounded-lg text-foreground min-h-[100px]"
                        placeholder="Enter notes or instructions..."
                        multiline
                        textAlignVertical="top"
                        value={content}
                        onChangeText={setContent}
                    />
                </View>

                {/* Tags Input */}
                <View className="mb-6">
                    <Text className="text-sm font-medium mb-1 text-muted-foreground">Tags</Text>
                    <TextInput
                        className="bg-card border border-border p-3 rounded-lg text-foreground"
                        placeholder="warmup, jazz (comma separated)"
                        value={tags}
                        onChangeText={setTags}
                    />
                </View>
            </ScrollView>

            {/* Fixed Action Buttons at the bottom */}
            <View className="flex-row gap-4 p-4 border-t border-border bg-background pb-8">
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1
                    })}
                    className="flex-1 p-4 rounded-xl bg-gray-200"
                >
                    <Text className="text-center font-semibold text-gray-700">Cancel</Text>
                </Pressable>
                <Pressable
                    onPress={handleSave}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1
                    })}
                    className="flex-1 p-4 rounded-xl bg-blue-600 shadow-sm"
                >
                    <Text className="text-center font-bold text-white">Save Activity</Text>
                </Pressable>
            </View>
        </View>
    );
}
