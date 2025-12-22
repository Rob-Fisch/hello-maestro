import { View, Text, TextInput, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Category } from '@/store/types';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { THEMES, useTheme } from '@/lib/theme';
import { AppTheme } from '@/store/types';



import { useEffect } from 'react';

export default function SettingsScreen() {
    const { categories, addCategory, updateCategory, deleteCategory, settings, updateSettings, profile, setProfile, trackModuleUsage, setTheme } = useContentStore();
    const theme = useTheme();

    useEffect(() => {
        trackModuleUsage('settings');
    }, []);

    const router = useRouter();


    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const [newTemplate, setNewTemplate] = useState('');

    const [isEditingProfile, setIsEditingProfile] = useState(false);
    const [tempDisplayName, setTempDisplayName] = useState(profile?.displayName || '');

    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [updating, setUpdating] = useState(false);


    const handleAddTemplate = () => {
        if (!newTemplate.trim()) return;
        updateSettings({
            messageTemplates: [...settings.messageTemplates, newTemplate.trim()]
        });
        setNewTemplate('');
    };

    const handleDeleteTemplate = (index: number) => {
        const newTemplates = [...settings.messageTemplates];
        newTemplates.splice(index, 1);
        updateSettings({ messageTemplates: newTemplates });
    };

    const handleAdd = () => {
        if (!newCategoryName.trim()) return;
        addCategory({
            id: Date.now().toString(),
            name: newCategoryName.trim(),
        });
        setNewCategoryName('');
    };

    const handleStartEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditingName(cat.name);
    };

    const handleSaveEdit = () => {
        if (!editingId || !editingName.trim()) return;
        updateCategory(editingId, { name: editingName.trim() });
        setEditingId(null);
    };

    const handleDelete = (id: string, name: string) => {
        const msg = `Are you sure you want to delete "${name}"? Blocks in this category will become uncategorized.`;
        if (Platform.OS === 'web') {
            if (confirm(msg)) deleteCategory(id);
        } else {
            Alert.alert('Delete Category', msg, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteCategory(id) },
            ]);
        }
    };

    const handleLogout = () => {
        const logoutLogic = () => {
            setProfile(null);
            router.replace('/auth');
        };

        if (Platform.OS === 'web') {
            if (confirm("Are you sure you want to sign out?")) logoutLogic();
        } else {
            Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logoutLogic },
            ]);
        }
    };

    const handleUpdateProfile = async () => {
        if (!tempDisplayName.trim()) return;
        setUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: { display_name: tempDisplayName.trim() }
            });
            if (error) throw error;

            setProfile({
                ...profile!,
                displayName: tempDisplayName.trim()
            });
            setIsEditingProfile(false);
            Alert.alert('Success', 'Profile updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not update profile');
        } finally {
            setUpdating(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setUpdating(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            if (error) throw error;

            setIsChangingPassword(false);
            setNewPassword('');
            setConfirmPassword('');
            Alert.alert('Success', 'Password updated successfully!');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not update password');
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteAccount = async () => {
        const performDelete = async () => {
            setUpdating(true);
            try {
                const { wipeAllData } = useContentStore.getState();
                await wipeAllData();
                await supabase.auth.signOut();
                router.replace('/auth');
            } catch (error: any) {
                Alert.alert('Error', error.message || 'Could not delete account');
            } finally {
                setUpdating(false);
            }
        };

        if (Platform.OS === 'web') {
            if (confirm("CRITICAL: This will permanently delete ALL your data (Roadmaps, Routines, Contacts, etc). This cannot be undone. Are you absolutely sure?")) {
                if (confirm("LAST CHANCE: Are you really sure?")) {
                    performDelete();
                }
            }
        } else {
            Alert.alert(
                "Delete Account?",
                "This will permanently delete ALL your data (Roadmaps, Routines, Contacts, etc). This cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete Everything",
                        style: "destructive",
                        onPress: () => {
                            Alert.alert(
                                "Last Chance",
                                "Are you absolutely sure you want to wipe your entire account?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "WIPE DATA", style: "destructive", onPress: performDelete }
                                ]
                            );
                        }
                    }
                ]
            );
        }
    };



    return (
        <ScrollView className="flex-1" style={{ backgroundColor: theme.background }} contentContainerStyle={{ padding: 24 }}>
            <View className="mb-8">
                <Text className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>Settings</Text>
                <Text className="font-medium text-base mt-2" style={{ color: theme.mutedText }}>Personalize your experience</Text>
            </View>

            {/* Category Management Section */}
            <View className="mb-8">
                <View className="flex-row items-center mb-4">
                    <Text className="text-2xl font-bold" style={{ color: theme.text }}>Content Categories</Text>
                </View>

                <View className="p-4 rounded-3xl border shadow-sm mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <Text className="text-[10px] uppercase font-black mb-2 tracking-widest px-1" style={{ color: theme.mutedText }}>Add New Category</Text>
                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 p-4 rounded-2xl font-bold"
                            style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1, color: theme.text }}
                            placeholder="e.g. Solo Pieces"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholderTextColor={theme.mutedText}
                        />
                        <TouchableOpacity
                            onPress={handleAdd}
                            style={{ backgroundColor: theme.primary }}
                            className="px-6 rounded-2xl items-center justify-center shadow-lg"
                        >
                            <Text className="text-white font-black">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {categories.map((cat) => (
                    <View key={cat.id} className="border rounded-2xl mb-3 p-4 flex-row items-center justify-between shadow-xs" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        {editingId === cat.id ? (
                            <View className="flex-1 flex-row gap-2">
                                <TextInput
                                    className="flex-1 border p-2 rounded-xl font-bold"
                                    style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
                                    value={editingName}
                                    onChangeText={setEditingName}
                                    autoFocus
                                />
                                <TouchableOpacity onPress={handleSaveEdit} className="bg-green-600 px-3 rounded-xl justify-center">
                                    <Text className="text-white font-bold text-xs">Save</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => setEditingId(null)} className="bg-gray-200 px-3 rounded-xl justify-center">
                                    <Text className="text-gray-600 font-bold text-xs">X</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View className="flex-1">
                                    <Text className="font-bold text-lg" style={{ color: theme.text }}>{cat.name}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => handleStartEdit(cat)}
                                        className="p-2 opacity-40"
                                    >
                                        <Text style={{ color: theme.primary }} className="font-bold">Edit</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => handleDelete(cat.id, cat.name)}
                                        className="p-2 opacity-40"
                                    >
                                        <Text className="text-red-600 font-bold">Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                ))}
            </View>

            {/* PDF Export Section */}
            <View className="mb-8">
                <Text className="text-2xl font-bold mb-4" style={{ color: theme.text }}>PDF Export</Text>
                <View className="p-5 rounded-3xl border shadow-sm flex-row items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <View className="flex-1 mr-4">
                        <Text className="font-bold text-lg" style={{ color: theme.text }}>Table of Contents</Text>
                        <Text className="text-xs mt-1" style={{ color: theme.mutedText }}>Include an index page with song titles and page numbers</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => updateSettings({ includeTOC: !settings.includeTOC })}
                        className={`w-14 h-8 rounded-full items-center justify-center ${settings.includeTOC ? '' : 'bg-gray-200'}`}
                        style={{ backgroundColor: settings.includeTOC ? theme.primary : undefined }}
                    >
                        <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${settings.includeTOC ? 'ml-6' : 'mr-6'}`} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messaging Section */}
            <View className="mb-8">
                <Text className="text-2xl font-bold mb-4" style={{ color: theme.text }}>Messaging Templates</Text>
                <View className="p-4 rounded-3xl border shadow-sm mb-6" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <Text className="text-[10px] uppercase font-black mb-2 tracking-widest px-1" style={{ color: theme.mutedText }}>Add New Template</Text>
                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 border p-4 rounded-2xl font-bold"
                            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
                            placeholder="e.g. Gig starts in 1 hour!"
                            value={newTemplate}
                            onChangeText={setNewTemplate}
                            multiline
                            placeholderTextColor={theme.mutedText}
                        />
                        <TouchableOpacity
                            onPress={handleAddTemplate}
                            style={{ backgroundColor: theme.primary }}
                            className="px-6 rounded-2xl items-center justify-center shadow-lg"
                        >
                            <Text className="text-white font-black">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {settings.messageTemplates.map((template, index) => (
                    <View key={index} className="bg-card border border-border rounded-2xl mb-3 p-4 flex-row items-center justify-between shadow-xs">
                        <View className="flex-1 mr-4">
                            <Text className="font-medium text-foreground text-base leading-relaxed">{template}</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => handleDeleteTemplate(index)}
                            className="p-2 opacity-40"
                        >
                            <Text className="text-red-600 font-bold">Delete</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Skins Section */}
            <View className="mb-12">
                <Text className="text-2xl font-bold mb-4" style={{ color: theme.text }}>Skins</Text>
                <View className="p-6 rounded-[40px] border shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <Text className="mb-6 font-medium" style={{ color: theme.mutedText }}>
                        Change the look and feel of your entire experience.
                    </Text>
                    <View className="flex-row gap-4">
                        {(['vibrant', 'midnight', 'zen'] as AppTheme[]).map((t) => {
                            const tokens = THEMES[t];
                            const isActive = (settings.theme || 'vibrant') === t;
                            return (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setTheme(t)}
                                    className={`flex-1 aspect-square rounded-[30px] border-4 items-center justify-center p-2`}
                                    style={{
                                        backgroundColor: tokens.background,
                                        borderColor: isActive ? tokens.primary : tokens.border
                                    }}
                                >
                                    <View
                                        className="w-10 h-10 rounded-2xl shadow-sm mb-3"
                                        style={{ backgroundColor: tokens.primary }}
                                    >
                                        <View className="flex-1 items-center justify-center">
                                            <Ionicons name="color-palette" size={18} color="white" />
                                        </View>
                                    </View>
                                    <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: isActive ? tokens.text : tokens.mutedText }}>
                                        {t === 'vibrant' ? 'Vibrant' : t === 'midnight' ? 'Midnight' : 'Zen'}
                                    </Text>
                                    {isActive && (
                                        <View className="absolute -top-2 -right-2 w-6 h-6 rounded-full items-center justify-center shadow-md" style={{ backgroundColor: tokens.primary }}>
                                            <Ionicons name="checkmark" size={14} color="white" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
            </View>

            {/* Support & FAQ Section */}
            <View className="mb-12">
                <Text className="text-2xl font-bold mb-4" style={{ color: theme.text }}>Support & FAQ</Text>
                <View className="p-6 rounded-[40px] border shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <Text className="mb-6 font-medium" style={{ color: theme.mutedText }}>
                        Need help with something? Explore our guides and FAQs to get the most out of OpusMode.
                    </Text>

                    <TouchableOpacity
                        onPress={() => router.push('/modal/help')}
                        className="p-6 rounded-[30px] border flex-row items-center justify-between"
                        style={{ backgroundColor: theme.background, borderColor: theme.border }}
                    >
                        <View className="flex-row items-center flex-1">
                            <View className="w-12 h-12 rounded-2xl items-center justify-center mr-4" style={{ backgroundColor: `${theme.primary}15` }}>
                                <Ionicons name="help-circle-outline" size={24} color={theme.primary} />
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-lg" style={{ color: theme.text }}>Guidance & FAQs</Text>
                                <Text className="text-xs mt-1" style={{ color: theme.mutedText }}>Learn effectively with OpusMode</Text>
                            </View>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Account Section */}
            <View className="mb-12">
                <Text className="text-2xl font-bold mb-4" style={{ color: theme.text }}>Account</Text>
                <View className="p-6 rounded-[40px] border shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                    <View className="flex-row items-center mb-8">
                        <View className="w-16 h-16 rounded-3xl items-center justify-center" style={{ backgroundColor: `${theme.primary}15` }}>
                            <Ionicons name="person" size={32} color={theme.primary} />
                        </View>
                        <View className="ml-4 flex-1">
                            {isEditingProfile ? (
                                <View>
                                    <TextInput
                                        className="border p-2 rounded-xl font-bold text-lg mb-2"
                                        style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
                                        value={tempDisplayName}
                                        onChangeText={setTempDisplayName}
                                        autoFocus
                                        placeholder="Display Name"
                                        placeholderTextColor={theme.mutedText}
                                    />
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity
                                            onPress={handleUpdateProfile}
                                            disabled={updating}
                                            className="px-4 py-1.5 rounded-full"
                                            style={{ backgroundColor: theme.primary }}
                                        >
                                            <Text className="text-white font-bold text-xs">{updating ? '...' : 'Save'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={() => { setIsEditingProfile(false); setTempDisplayName(profile?.displayName || ''); }}
                                            disabled={updating}
                                            className="bg-gray-200 px-4 py-1.5 rounded-full"
                                        >
                                            <Text className="text-gray-600 font-bold text-xs">Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ) : (
                                <View className="flex-row justify-between items-start">
                                    <View>
                                        <Text className="text-xl font-bold" style={{ color: theme.text }}>{profile?.displayName || 'Maestro'}</Text>
                                        <Text className="font-medium" style={{ color: theme.mutedText }}>{profile?.email || 'Local mode only'}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => setIsEditingProfile(true)} className="p-2">
                                        <Text style={{ color: theme.primary }} className="font-bold text-xs">Edit</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Password Section */}
                    {!isChangingPassword ? (
                        <TouchableOpacity
                            onPress={() => setIsChangingPassword(true)}
                            className="p-4 rounded-2xl flex-row items-center justify-center mb-4 border"
                            style={{ backgroundColor: theme.background, borderColor: theme.border }}
                        >
                            <Ionicons name="key-outline" size={20} color={theme.mutedText} />
                            <Text className="font-bold ml-2" style={{ color: theme.mutedText }}>Change Password</Text>
                        </TouchableOpacity>
                    ) : (
                        <View className="p-4 rounded-2xl border mb-4" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                            <Text className="text-[10px] uppercase font-black mb-2 px-1" style={{ color: theme.mutedText }}>Update Password</Text>
                            <TextInput
                                className="bg-white border p-3 rounded-xl font-bold mb-3"
                                style={{ borderColor: theme.border, color: theme.text }}
                                placeholder="New Password (min 6 chars)"
                                value={newPassword}
                                onChangeText={setNewPassword}
                                secureTextEntry
                                placeholderTextColor={theme.mutedText}
                            />
                            <TextInput
                                className="bg-white border p-3 rounded-xl font-bold mb-4"
                                style={{ borderColor: theme.border, color: theme.text }}
                                placeholder="Confirm New Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                                placeholderTextColor={theme.mutedText}
                            />
                            <View className="flex-row gap-2">
                                <TouchableOpacity
                                    onPress={handleChangePassword}
                                    disabled={updating}
                                    className="flex-1 p-3 rounded-xl items-center"
                                    style={{ backgroundColor: theme.primary }}
                                >
                                    <Text className="text-white font-bold">{updating ? 'Saving...' : 'Update Password'}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => setIsChangingPassword(false)}
                                    disabled={updating}
                                    className="px-4 p-3 rounded-xl bg-gray-200 items-center"
                                >
                                    <Text className="text-gray-600 font-bold">Cancel</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="bg-gray-50 border border-gray-100 p-6 rounded-[30px] items-center mb-4"
                    >
                        <Text className="text-gray-600 font-black text-lg">Sign Out</Text>
                    </TouchableOpacity>
                </View>

            </View>

            {/* Danger Zone */}
            <View className="mb-12">
                <Text className="text-2xl font-bold mb-4 text-red-600">Danger Zone</Text>
                <View className="p-6 rounded-[40px] border border-red-100 bg-red-50/30 shadow-sm">
                    <Text className="mb-6 font-medium text-red-800">
                        These actions are permanent and cannot be reversed. Please be careful.
                    </Text>

                    <TouchableOpacity
                        onPress={handleDeleteAccount}
                        disabled={updating}
                        className="bg-red-600 p-6 rounded-[30px] items-center shadow-lg shadow-red-200"
                    >
                        <Text className="text-white font-black text-lg">{updating ? 'DELETING...' : 'Delete Account'}</Text>
                    </TouchableOpacity>
                    <Text className="text-[10px] text-red-400 mt-4 text-center font-bold uppercase tracking-widest">
                        All cloud and local data will be purged.
                    </Text>
                </View>
            </View>

            {/* App Info Footer */}

            <View className="mt-12 pt-8 border-t items-center" style={{ borderTopColor: theme.border }}>
                <Text className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.mutedText }}>OpusMode Pro</Text>
                <Text className="text-[10px] mt-1" style={{ color: theme.mutedText }}>Version 1.2.0 • {profile?.id.startsWith('mock-') ? 'Local Mode' : 'Cloud Sync Enabled'}</Text>
            </View>
        </ScrollView>
    );
}
