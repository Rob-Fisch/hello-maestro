
import SetListBuilder from '@/components/setlist/SetListBuilder';
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { SetList } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, FlatList, Modal, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SetlistsScreen() {
    const theme = useTheme();
    const navigation = useNavigation();
    const router = useRouter();
    const { setLists, addSetList, updateSetList, deleteSetList, profile } = useContentStore();

    // Filter for Master Setlists (no eventId)
    const masterSetLists = setLists.filter(sl => !sl.eventId && !sl.deletedAt).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const [editingSetList, setEditingSetList] = useState<SetList | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Free tier limit
    const isFree = !profile?.isPremium;
    const canCreate = !isFree || masterSetLists.length < 5;

    const handleCreate = () => {
        if (!canCreate) {
            alert('Free tier is limited to 5 Master Setlists. Upgrade to Pro for unlimited.');
            return;
        }
        setIsCreating(true);
    };

    const handleSave = (setList: SetList) => {
        if (editingSetList) {
            updateSetList(editingSetList.id, setList);
        } else {
            addSetList(setList);
        }
        setEditingSetList(null);
        setIsCreating(false);
    };

    const handleDelete = (id: string) => {
        if (Platform.OS === 'web') {
            if (window.confirm('Are you sure you want to delete this setlist?')) {
                deleteSetList(id);
                setEditingSetList(null);
                setIsCreating(false);
            }
        } else {
            Alert.alert(
                'Delete Setlist',
                'Are you sure you want to delete this setlist?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                            deleteSetList(id);
                            setEditingSetList(null);
                            setIsCreating(false);
                        }
                    }
                ]
            );
        };
    };

    const renderItem = ({ item }: { item: SetList }) => {
        const durationSeconds = item.items.reduce((acc, i) => acc + (i.durationSeconds || 0), 0);
        const songsCount = item.items.filter(i => i.type === 'song').length;

        return (
            <TouchableOpacity
                onPress={() => setEditingSetList(item)}
                className="bg-white p-4 mb-3 rounded-xl border border-slate-200 shadow-sm flex-row items-center justify-between"
            >
                <View className="flex-1">
                    <Text className="text-lg font-bold text-slate-800 mb-1">{item.title}</Text>
                    <Text className="text-slate-500 text-xs font-medium uppercase tracking-wider">
                        {songsCount} Songs
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
            </TouchableOpacity>
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1" style={{ backgroundColor: theme.background }}>
            {/* Header */}
            <View
                className="px-6 pb-4 bg-white border-b border-slate-100 flex-row justify-between items-center"
                style={{ paddingTop: insets.top + 12 }}
            >
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.openDrawer())} className="mr-5 p-2 rounded-full bg-slate-50 border border-slate-100">
                        <Ionicons name="menu" size={24} color="#1e293b" />
                    </TouchableOpacity>
                    <Text className="text-2xl font-black tracking-tight text-slate-900">Set Lists</Text>
                </View>
                <TouchableOpacity
                    onPress={handleCreate}
                    className={`h-10 w-10 rounded-full items-center justify-center ${canCreate ? 'bg-indigo-600 shadow-sm shadow-indigo-200' : 'bg-slate-300'}`}
                >
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* List */}
            <FlatList
                data={masterSetLists}
                keyExtractor={item => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 24 }}
                ListEmptyComponent={
                    <View className="items-center justify-center py-20 opacity-50">
                        <Ionicons name="list-outline" size={80} color="#cbd5e1" />
                        <Text className="text-slate-400 mt-4 text-center font-bold text-lg">No Master Setlists</Text>
                        <Text className="text-slate-400 text-center mt-2 max-w-[250px] mb-8">
                            Create reusable setlists here, then import them into your gigs.
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/')}
                            className="bg-slate-100 px-6 py-3 rounded-full flex-row items-center"
                        >
                            <Ionicons name="home-outline" size={18} color="#64748b" />
                            <Text className="text-slate-600 font-bold ml-2">Return to Dashboard</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            {/* Editor Modal */}
            <Modal visible={!!editingSetList || isCreating} animationType="slide" presentationStyle="fullScreen">
                {/* Wrap in View to prevent full screen takeover on web or weird safe area issues */}
                <View className="flex-1 bg-white">
                    <SetListBuilder
                        existingSetList={editingSetList || undefined}
                        eventId={undefined} // Master list has no eventId
                        onSave={handleSave}
                        onCancel={() => {
                            setEditingSetList(null);
                            setIsCreating(false);
                        }}
                    />
                    {/* Add a delete button to the builder via a portal or just pass a delete prop in future. 
                         For now, let's just rely on the swipe to delete or similar if we added it, 
                         but actually SetListBuilder doesn't have a delete button. 
                         
                         Wait, I should add a delete capability to the SetListsScreen, maybe a long press or a delete icon in the row?
                         Or pass onDelete to SetListBuilder?
                     */}
                </View>
            </Modal>
        </View>
    );
}
