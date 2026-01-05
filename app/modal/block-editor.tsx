import { uploadMediaToCloud } from '@/lib/sync';
import { PAPER_THEME, useTheme } from '@/lib/theme';
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

    const { blocks, addBlock, updateBlock, categories, addCategory } = useContentStore();
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
    const [isCreatingCategory, setIsCreatingCategory] = useState(false);
    const [newCatName, setNewCatName] = useState('');


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
        backgroundColor: PAPER_THEME.card,
        borderColor: PAPER_THEME.inputBorder,
        color: PAPER_THEME.text
    };

    const labelStyle = "text-sm font-bold mb-2 text-stone-700 uppercase tracking-wider";

    return (
        <View className="flex-1" style={{ backgroundColor: PAPER_THEME.background }}>
            <ScrollView
                className="flex-1 px-6 pt-6"
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 40 }}
            >
                <Text className="text-3xl font-black mb-8 mt-6 tracking-tight" style={{ color: PAPER_THEME.text }}>
                    {isEditing ? 'Edit Activity' : 'Add Activity'}
                </Text>

                {/* Title Input */}
                <View className="mb-6">
                    <Text className={labelStyle}>Title</Text>
                    <TextInput
                        className="p-4 rounded-xl border text-lg font-bold"
                        style={[startInputStyle, { fontStyle: title ? 'normal' : 'italic' }]}
                        placeholder="e.g., C Major Scale"
                        placeholderTextColor="#57534e"
                        value={title}
                        onChangeText={setTitle}
                        multiline
                    />
                </View>

                {/* Type Selection */}
                <View className="mb-6">
                    <Text className={labelStyle}>Type</Text>
                    <View className="flex-row gap-3">
                        {(['text', 'sheet_music'] as const).map((t) => {
                            const isSelected = type === t;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setType(t)}
                                    activeOpacity={0.8}
                                    style={{
                                        backgroundColor: isSelected ? '#c2410c' : '#ffffff',
                                        borderColor: isSelected ? '#c2410c' : '#e7e5e4',
                                        borderWidth: 1,
                                        flex: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        paddingVertical: 16,
                                        borderRadius: 12,
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: isSelected ? '#ffffff' : '#1c1917',
                                            fontWeight: '900',
                                            textTransform: 'uppercase',
                                            letterSpacing: 2,
                                            fontSize: 13
                                        }}
                                    >
                                        {t.replace('_', ' ')}
                                    </Text>
                                </TouchableOpacity>
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
                        <Text className="text-stone-900 font-bold text-base">
                            {categories.find(c => c.id === categoryId)?.name || 'Select Category'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#a8a29e" />
                    </TouchableOpacity>

                    <Modal
                        visible={showCategoryPicker}
                        transparent
                        animationType="slide"
                        onRequestClose={() => setShowCategoryPicker(false)}
                    >
                        <View className="flex-1 justify-end bg-black/50">
                            <View className="rounded-t-[40px] p-6 pb-12 h-[80%] bg-white border border-stone-200" style={{ backgroundColor: '#ffffff' }}>
                                <View className="flex-row justify-between items-center mb-6">
                                    <Text className="text-xl font-black text-stone-900">Select Category</Text>
                                    <TouchableOpacity onPress={() => { setShowCategoryPicker(false); setNewCatName(''); setIsCreatingCategory(false); }} className="bg-stone-100 p-2 rounded-full">
                                        <Ionicons name="close" size={24} color="#1c1917" />
                                    </TouchableOpacity>
                                </View>

                                {isCreatingCategory ? (
                                    <View className="mb-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                                        <Text className="text-xs font-bold text-stone-500 uppercase mb-2">New Category Name</Text>
                                        <TextInput
                                            className="bg-white p-4 rounded-xl border border-stone-200 text-lg font-bold mb-4"
                                            placeholder="e.g. Ear Training"
                                            value={newCatName}
                                            onChangeText={setNewCatName}
                                            autoFocus
                                        />
                                        <View className="flex-row gap-3">
                                            <TouchableOpacity
                                                onPress={() => { setIsCreatingCategory(false); setNewCatName(''); }}
                                                className="flex-1 bg-stone-200 p-3 rounded-xl items-center"
                                            >
                                                <Text className="font-bold text-stone-600">Cancel</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (newCatName.trim()) {
                                                        const newId = Date.now().toString();
                                                        addCategory({ id: newId, name: newCatName.trim() });
                                                        setCategoryId(newId);
                                                        setNewCatName('');
                                                        setIsCreatingCategory(false);
                                                        setShowCategoryPicker(false);
                                                    }
                                                }}
                                                className="flex-1 bg-black p-3 rounded-xl items-center"
                                            >
                                                <Text className="font-bold text-white">Create</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View>
                                        <TouchableOpacity
                                            onPress={() => setIsCreatingCategory(true)}
                                            className="flex-row items-center p-4 mb-4 bg-stone-50 rounded-2xl border border-dashed border-stone-300 active:bg-stone-100"
                                        >
                                            <View className="w-8 h-8 rounded-full bg-stone-200 items-center justify-center mr-3">
                                                <Ionicons name="add" size={20} color="#57534e" />
                                            </View>
                                            <Text className="font-bold text-lg text-stone-600">Create New Category...</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <ScrollView showsVerticalScrollIndicator={false}>
                                    {categories
                                        .sort((a, b) => {
                                            if (a.name === 'Other') return 1;
                                            if (b.name === 'Other') return -1;
                                            return a.name.localeCompare(b.name);
                                        })
                                        .map((cat) => (
                                            <TouchableOpacity
                                                key={cat.id}
                                                onPress={() => {
                                                    setCategoryId(cat.id);
                                                    setShowCategoryPicker(false);
                                                }}
                                                className={`p-5 mb-2 rounded-2xl flex-row justify-between items-center border ${categoryId === cat.id ? 'bg-stone-900 border-stone-900' : 'bg-white border-stone-100'}`}
                                            >
                                                <Text className={`text-lg font-bold ${categoryId === cat.id ? 'text-white' : 'text-stone-500'}`}>
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
                        style={[startInputStyle, { fontStyle: linkUrl ? 'normal' : 'italic' }]}
                        placeholder="https://..."
                        placeholderTextColor="#57534e"
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
                            {Platform.OS !== 'web' ? (
                                // NATIVE APP: Full distinct controls
                                <>
                                    <Pressable
                                        onPress={takePhoto}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                        className="bg-orange-50 border border-orange-100 p-4 rounded-xl items-center flex-1"
                                    >
                                        <Ionicons name="camera" size={24} color="#ea580c" />
                                        <Text className="text-orange-600 font-bold text-xs mt-2 uppercase">Camera</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={pickImage}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                        className="bg-stone-100 border border-stone-200 p-4 rounded-xl items-center flex-1"
                                    >
                                        <Ionicons name="image" size={24} color="#57534e" />
                                        <Text className="text-stone-600 font-bold text-xs mt-2 uppercase">Gallery</Text>
                                    </Pressable>
                                    <Pressable
                                        onPress={pickDocument}
                                        style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                        className="bg-amber-50 border border-amber-100 p-4 rounded-xl items-center flex-1"
                                    >
                                        <Ionicons name="document-text" size={24} color="#d97706" />
                                        <Text className="text-amber-600 font-bold text-xs mt-2 uppercase">PDF</Text>
                                    </Pressable>
                                </>
                            ) : (
                                // WEB / PWA
                                <>
                                    {/* Mobile Web Logic Check */}
                                    {/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ? (
                                        // MOBILE WEB: Consolidated to "Add Photo" + "PDF"
                                        <>
                                            <Pressable
                                                onPress={pickImage}
                                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                                className="bg-stone-100 border border-stone-200 p-4 rounded-xl items-center flex-1"
                                            >
                                                <Ionicons name="image" size={24} color="#57534e" />
                                                <Text className="text-stone-600 font-bold text-xs mt-2 uppercase">Add Photo</Text>
                                            </Pressable>
                                            <Pressable
                                                onPress={pickDocument}
                                                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                                className="bg-amber-50 border border-amber-100 p-4 rounded-xl items-center flex-1"
                                            >
                                                <Ionicons name="document-text" size={24} color="#d97706" />
                                                <Text className="text-amber-600 font-bold text-xs mt-2 uppercase">PDF</Text>
                                            </Pressable>
                                        </>
                                    ) : (
                                        // DESKTOP WEB: Single "Upload File" button
                                        <Pressable
                                            onPress={pickImage}
                                            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                            className="bg-stone-100 border border-stone-200 p-4 rounded-xl items-center flex-1"
                                        >
                                            <Ionicons name="cloud-upload" size={24} color="#57534e" />
                                            <Text className="text-stone-600 font-bold text-xs mt-2 uppercase">Upload File</Text>
                                        </Pressable>
                                    )}
                                </>
                            )}
                        </View>
                        {Platform.OS === 'web' && (
                            <Text className="text-xs text-stone-400 font-bold mb-4 italic text-center">
                                Pro Tip: Use your OS Snipping tool (Cmd+Shift+4 or Win+Shift+S) to crop sheet music, then upload here.
                            </Text>
                        )}

                        {mediaUri && (
                            <View className="bg-stone-50 border border-stone-200 p-3 rounded-2xl relative">
                                {uploadingMedia ? (
                                    <View className="w-full h-40 items-center justify-center rounded-xl bg-stone-100">
                                        <View className="bg-white p-4 rounded-2xl items-center shadow-sm">
                                            <Text className="text-amber-600 font-bold mb-2">Syncing...</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <>
                                        <Text className="text-xs font-bold text-stone-400 mb-2 uppercase tracking-wider ml-1">Attached Media</Text>
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
                                                className="flex-row items-center p-4 bg-white rounded-xl border border-stone-200"
                                            >
                                                <Ionicons name="document-text" size={32} color="#1c1917" />
                                                <View className="ml-3 flex-1">
                                                    <Text className="font-bold text-stone-900 text-base" numberOfLines={1}>
                                                        {decodeURIComponent(mediaUri.split('/').pop()?.replace(/^\d+-/, '') || 'Document')}
                                                    </Text>
                                                    <Text className="text-[10px] text-stone-400 font-black uppercase mt-1">Tap to Preview</Text>
                                                </View>
                                            </TouchableOpacity>
                                        ) : (
                                            <Image source={{ uri: mediaUri }} className="w-full h-48 rounded-xl bg-stone-200" resizeMode="cover" />
                                        )}
                                        <Pressable
                                            onPress={() => setMediaUri(undefined)}
                                            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                                            className="absolute top-4 right-4 bg-white w-8 h-8 rounded-full items-center justify-center shadow-lg shadow-black/10 border border-stone-100"
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
                        style={[startInputStyle, { fontStyle: content ? 'normal' : 'italic' }]}
                        placeholder="Enter notes or instructions..."
                        placeholderTextColor="#57534e"
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
                        style={[startInputStyle, { fontStyle: tags ? 'normal' : 'italic' }]}
                        placeholder="warmup, jazz (comma separated)"
                        placeholderTextColor="#57534e"
                        value={tags}
                        onChangeText={setTags}
                    />
                </View>
            </ScrollView>

            {/* Fixed Action Buttons at the bottom */}
            <View className="flex-row gap-4 p-6 border-t border-stone-200" style={{ backgroundColor: '#fafaf9' }}>
                <Pressable
                    onPress={() => router.back()}
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.6 : 1,
                        backgroundColor: PAPER_THEME.cancelBtnBg
                    })}
                    className="flex-1 p-4 rounded-2xl border border-stone-300"
                >
                    <Text className="text-center font-bold" style={{ color: PAPER_THEME.cancelBtnText }}>Cancel</Text>
                </Pressable>
                <TouchableOpacity
                    onPress={handleSave}
                    className="flex-1 p-4 rounded-2xl shadow-sm items-center justify-center shadow-orange-900/20"
                    style={{ backgroundColor: PAPER_THEME.saveBtnBg }}
                >
                    <Text className="font-black text-center text-base uppercase tracking-wider" style={{ color: PAPER_THEME.saveBtnText }}>Save Activity</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
