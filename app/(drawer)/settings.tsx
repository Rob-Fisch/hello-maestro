import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Category } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const { categories, addCategory, updateCategory, deleteCategory, settings, updateSettings, profile, setProfile, trackModuleUsage, setTheme } = useContentStore();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

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
        <ScrollView className="flex-1" style={{ backgroundColor: theme.background }} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header with Home Button - Top of Page */}
            <View className="px-6 flex-row items-start pt-8 mb-6" style={{ paddingTop: insets.top }}>
                <TouchableOpacity
                    onPress={() => router.push('/')}
                    className="mr-5 p-2 rounded-full bg-white/5 border border-white/10"
                >
                    <Ionicons name="home-outline" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[10px] font-black uppercase tracking-[3px] text-teal-400 mb-1">
                        Preferences
                    </Text>
                    <Text className="text-4xl font-black tracking-tight text-white">
                        Settings
                    </Text>
                </View>
            </View>

            <View className="px-6">

                {/* Account Section */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Account</Text>
                    <View className="p-6 rounded-[32px] border shadow-sm" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <View className="flex-row items-center mb-6">
                            <View className="w-16 h-16 rounded-3xl items-center justify-center bg-white/10 border border-white/5">
                                <Ionicons name="person" size={32} color="white" />
                            </View>
                            <View className="ml-4 flex-1">
                                {isEditingProfile ? (
                                    <View>
                                        <TextInput
                                            className="border p-2 rounded-xl font-bold text-lg mb-2 text-white"
                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }}
                                            value={tempDisplayName}
                                            onChangeText={setTempDisplayName}
                                            autoFocus
                                            placeholder="Display Name"
                                            placeholderTextColor="#64748b"
                                        />
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={handleUpdateProfile}
                                                disabled={updating}
                                                className="px-4 py-1.5 rounded-full bg-teal-500"
                                            >
                                                <Text className="text-white font-bold text-xs">{updating ? '...' : 'Save'}</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => { setIsEditingProfile(false); setTempDisplayName(profile?.displayName || ''); }}
                                                disabled={updating}
                                                className="bg-white/10 px-4 py-1.5 rounded-full"
                                            >
                                                <Text className="text-slate-300 font-bold text-xs">Cancel</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ) : (
                                    <View className="flex-row justify-between items-start">
                                        <View>
                                            <Text className="text-xl font-bold text-white mb-1">{profile?.displayName || 'Maestro'}</Text>
                                            <Text className="font-medium text-slate-400 text-xs">{profile?.email || 'Local mode only'}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => setIsEditingProfile(true)} className="p-2 bg-white/5 rounded-full">
                                            <Ionicons name="pencil" size={12} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </View>

                        {/* Password Section */}
                        {!isChangingPassword ? (
                            <TouchableOpacity
                                onPress={() => setIsChangingPassword(true)}
                                className="p-4 rounded-2xl flex-row items-center justify-center mb-4 border bg-black/20 border-white/5"
                            >
                                <Ionicons name="key-outline" size={16} color="#94a3b8" />
                                <Text className="font-bold ml-2 text-slate-400 text-sm">Change Password</Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="p-4 rounded-2xl border mb-4 bg-black/20 border-white/5">
                                <Text className="text-[10px] uppercase font-black mb-2 px-1 text-slate-500">Update Password</Text>
                                <TextInput
                                    className="bg-white/5 border p-3 rounded-xl font-bold mb-3 text-white"
                                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                    placeholder="New Password (min 6 chars)"
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    secureTextEntry
                                    placeholderTextColor="#64748b"
                                />
                                <TextInput
                                    className="bg-white/5 border p-3 rounded-xl font-bold mb-4 text-white"
                                    style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    secureTextEntry
                                    placeholderTextColor="#64748b"
                                />
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={handleChangePassword}
                                        disabled={updating}
                                        className="flex-1 p-3 rounded-xl items-center bg-teal-500"
                                    >
                                        <Text className="text-white font-bold">{updating ? 'Saving...' : 'Update Password'}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() => setIsChangingPassword(false)}
                                        disabled={updating}
                                        className="px-4 p-3 rounded-xl bg-white/10 items-center"
                                    >
                                        <Text className="text-slate-300 font-bold">Cancel</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleLogout}
                            className="bg-white/5 border border-white/10 p-5 rounded-[24px] items-center mb-1"
                        >
                            <Text className="text-slate-300 font-bold text-sm">Sign Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Category Management Section */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Content Categories</Text>
                    <View className="p-4 rounded-3xl border shadow-sm mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <Text className="text-[10px] uppercase font-black mb-2 tracking-widest px-1 text-slate-500">Add New Category</Text>
                        <View className="flex-row gap-3">
                            <TextInput
                                className="flex-1 p-4 rounded-2xl font-bold text-white bg-black/20"
                                style={{ borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }}
                                placeholder="e.g. Solo Pieces"
                                value={newCategoryName}
                                onChangeText={setNewCategoryName}
                                placeholderTextColor="#64748b"
                            />
                            <TouchableOpacity
                                onPress={handleAdd}
                                className="px-6 rounded-2xl items-center justify-center shadow-lg bg-indigo-500"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {categories
                        .sort((a, b) => {
                            if (a.name === 'Other') return 1;
                            if (b.name === 'Other') return -1;
                            return a.name.localeCompare(b.name);
                        })
                        .map((cat) => (
                            <View key={cat.id} className="border rounded-2xl mb-2 p-4 flex-row items-center justify-between shadow-xs" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                {editingId === cat.id ? (
                                    <View className="flex-1 flex-row gap-2">
                                        <TextInput
                                            className="flex-1 border p-2 rounded-xl font-bold bg-black/20 text-white"
                                            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                            value={editingName}
                                            onChangeText={setEditingName}
                                            autoFocus
                                        />
                                        <TouchableOpacity onPress={handleSaveEdit} className="bg-emerald-500 px-3 rounded-xl justify-center">
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setEditingId(null)} className="bg-white/10 px-3 rounded-xl justify-center">
                                            <Ionicons name="close" size={16} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <>
                                        <View className="flex-1">
                                            <Text className="font-bold text-base text-slate-300">{cat.name}</Text>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={() => handleStartEdit(cat)}
                                                className="p-2 opacity-60"
                                            >
                                                <Ionicons name="pencil" size={16} color="white" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(cat.id, cat.name)}
                                                className="p-2 opacity-60"
                                            >
                                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                </View>

                {/* PDF Export Section */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">PDF Export</Text>
                    <View className="p-5 rounded-3xl border shadow-sm flex-row items-center justify-between" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <View className="flex-1 mr-4">
                            <Text className="font-bold text-lg text-white">Table of Contents</Text>
                            <Text className="text-xs mt-1 text-slate-400">Include an index page with song titles and page numbers</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => updateSettings({ includeTOC: !settings.includeTOC })}
                            className={`w-14 h-8 rounded-full items-center justify-center ${settings.includeTOC ? 'bg-teal-500' : 'bg-white/10'}`}
                        >
                            <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${settings.includeTOC ? 'ml-6' : 'mr-6'}`} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Messaging Section */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Messaging Templates</Text>
                    <View className="p-4 rounded-3xl border shadow-sm mb-4" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                        <Text className="text-[10px] uppercase font-black mb-2 tracking-widest px-1 text-slate-500">Add New Template</Text>
                        <View className="flex-row gap-3">
                            <TextInput
                                className="flex-1 border p-4 rounded-2xl font-bold bg-black/20 text-white"
                                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
                                placeholder="e.g. Gig starts in 1 hour!"
                                value={newTemplate}
                                onChangeText={setNewTemplate}
                                multiline
                                placeholderTextColor="#64748b"
                            />
                            <TouchableOpacity
                                onPress={handleAddTemplate}
                                className="px-6 rounded-2xl items-center justify-center shadow-lg bg-indigo-500"
                            >
                                <Ionicons name="add" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {settings.messageTemplates.map((template, index) => (
                        <View key={index} className="bg-white/5 border border-white/5 rounded-2xl mb-3 p-4 flex-row items-center justify-between shadow-xs">
                            <View className="flex-1 mr-4">
                                <Text className="font-medium text-slate-300 text-sm leading-relaxed">{template}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleDeleteTemplate(index)}
                                className="p-2 opacity-60"
                            >
                                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>



                {/* Support & FAQ Section */}
                <View className="mb-12">
                    <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Support</Text>
                    <View className="p-6 rounded-[32px] border shadow-sm bg-blue-900/10 border-blue-500/20">
                        <Text className="mb-6 font-medium text-slate-300 leading-relaxed">
                            Need help with something? Explore our guides and FAQs to get the most out of OpusMode.
                        </Text>

                        <TouchableOpacity
                            onPress={() => router.push('/modal/help')}
                            className="p-5 rounded-[24px] border flex-row items-center justify-between bg-black/30 border-white/10"
                        >
                            <View className="flex-row items-center flex-1">
                                <View className="w-10 h-10 rounded-xl items-center justify-center mr-4 bg-blue-500/20">
                                    <Ionicons name="help-circle-outline" size={20} color="#60a5fa" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-base text-white">Guidance & FAQs</Text>
                                    <Text className="text-xs mt-0.5 text-slate-500">Learn effectively with OpusMode</Text>
                                </View>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>


                {/* Subscription Section */}
                <View className="mb-8">
                    <Text className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Membership</Text>
                    <View className="p-6 rounded-[30px] border shadow-sm relative overflow-hidden" style={{ backgroundColor: profile?.isPremium ? theme.card : '#111827', borderColor: theme.border }}>
                        {!profile?.isPremium && (
                            <View className="absolute top-0 right-0 p-32 bg-blue-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                        )}

                        <View className="flex-row justify-between items-start mb-4">
                            <View>
                                <Text className={`font-black text-xl tracking-tight ${profile?.isPremium ? 'text-green-400' : 'text-white'}`}>
                                    {profile?.isPremium ? 'OPUSMODE PRO' : 'OPUSMODE FREE'}
                                </Text>
                                <Text className={`text-xs font-medium mt-1 ${profile?.isPremium ? 'text-slate-400' : 'text-slate-400'}`}>
                                    {profile?.isPremium ? 'Active Subscription' : 'Upgrade to unlock global sync & AI tools'}
                                </Text>
                            </View>
                            {profile?.isPremium && (
                                <View className="bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                    <Text className="text-green-400 font-bold text-xs uppercase">Active</Text>
                                </View>
                            )}
                        </View>

                        {!profile?.isPremium ? (
                            <View>
                                <View className="flex-row items-center mb-2">
                                    <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
                                    <Text className="text-slate-300 ml-2 font-medium">Cloud Sync across all devices</Text>
                                </View>
                                <View className="flex-row items-center mb-6">
                                    <Ionicons name="checkmark-circle" size={16} color="#4ADE80" />
                                    <Text className="text-slate-300 ml-2 font-medium">Scout AI Booking Agent</Text>
                                </View>

                                <TouchableOpacity
                                    onPress={() => router.push('/modal/upgrade')}
                                    className="bg-white p-4 rounded-2xl items-center flex-row justify-center"
                                >
                                    <Text className="text-black font-black text-base mr-2">Upgrade for $19.99/yr</Text>
                                    <Ionicons name="arrow-forward" size={18} color="black" />
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View>
                                <TouchableOpacity
                                    onPress={() => {
                                        // MOCK DOWNGRADE ACTION
                                        setProfile({ ...profile!, isPremium: false });
                                        alert("Pro subscription cancelled. You are now on the Free plan.");
                                    }}
                                    className="bg-white/5 border border-white/10 p-3 rounded-xl items-center"
                                >
                                    <Text className="text-slate-300 font-bold">Manage Subscription</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>


                {/* Danger Zone */}
                <View className="mb-12">
                    <Text className="text-sm font-bold text-red-500 mb-3 uppercase tracking-wider">Danger Zone</Text>
                    <View className="p-6 rounded-[32px] border border-red-500/20 bg-red-900/5 shadow-sm">
                        <Text className="mb-6 font-medium text-red-300/80">
                            These actions are permanent and cannot be reversed. Please be careful.
                        </Text>

                        <TouchableOpacity
                            onPress={handleDeleteAccount}
                            disabled={updating}
                            className="bg-red-600/10 border border-red-600/50 p-6 rounded-[24px] items-center"
                        >
                            <Text className="text-red-500 font-black text-lg">{updating ? 'DELETING...' : 'Delete Account'}</Text>
                        </TouchableOpacity>
                        <Text className="text-[10px] text-red-400/60 mt-4 text-center font-bold uppercase tracking-widest">
                            All cloud and local data will be purged.
                        </Text>
                    </View>
                </View>

                {/* App Info Footer */}
                <View className="mt-8 pt-8 border-t items-center mb-20" style={{ borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    <Text className="text-xs font-bold uppercase tracking-widest text-slate-500">
                        {profile?.isPremium ? 'OpusMode Pro' : 'OpusMode'}
                    </Text>
                    <Text className="text-[10px] mt-1 text-slate-600">Version 1.2.0 • {profile?.id.startsWith('mock-') ? 'Local Mode' : 'Cloud Sync Enabled'}</Text>
                </View>

            </View>
        </ScrollView>
    );
}
