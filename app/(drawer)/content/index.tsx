import { View, Text, TouchableOpacity, SectionList, Alert, Platform } from 'react-native';
import { useState, useMemo } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Link, useRouter } from 'expo-router';
import { ContentBlock } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';

export default function ContentScreen() {
  const { blocks, categories, deleteBlock } = useContentStore();
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const groupedData = useMemo(() => {
    const sections: { title: string; data: ContentBlock[]; id: string }[] = [];

    categories.forEach(cat => {
      const catBlocks = blocks.filter(b => b.categoryId === cat.id);
      if (catBlocks.length > 0) {
        sections.push({
          title: cat.name,
          data: catBlocks,
          id: cat.id
        });
      }
    });

    const uncategorized = blocks.filter(b => !b.categoryId || !categories.find(c => c.id === b.categoryId));
    if (uncategorized.length > 0) {
      sections.push({
        title: 'Uncategorized',
        data: uncategorized,
        id: 'none'
      });
    }

    return sections;
  }, [blocks, categories]);

  const handleDeletePress = (id: string) => {
    if (Platform.OS === 'web') {
      setDeletingId(id);
    } else {
      Alert.alert('Delete Block', 'Are you sure you want to remove this item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteBlock(id) },
      ]);
    }
  };

  const confirmWebDelete = (id: string) => {
    deleteBlock(id);
    setDeletingId(null);
  };

  const renderItem = ({ item }: { item: ContentBlock }) => (
    <View className="flex-row items-center justify-between p-5 bg-white border-b border-gray-100 mx-4 my-1 rounded-2xl shadow-sm">
      <TouchableOpacity
        className="flex-1"
        onPress={() => router.push({ pathname: '/modal/block-editor', params: { id: item.id } })}
      >
        <Text className="text-xl font-bold text-gray-900">{item.title}</Text>
        <View className="flex-row items-center mt-1">
          <Ionicons
            name={item.type === 'sheet_music' ? 'musical-notes' : 'document-text'}
            size={14}
            color="#6b7280"
          />
          <Text className="text-sm text-gray-500 ml-1">
            {item.type === 'sheet_music' ? 'Sheet Music' : 'Text'} • {item.tags.join(', ')}
          </Text>
        </View>
      </TouchableOpacity>

      {deletingId === item.id ? (
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => setDeletingId(null)} className="px-3 py-2 bg-gray-100 rounded-full mr-2">
            <Text className="text-gray-600 font-bold text-xs">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => confirmWebDelete(item.id)} className="px-3 py-2 bg-red-500 rounded-full">
            <Text className="text-white font-bold text-xs">Delete</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => handleDeletePress(item.id)}
          className="p-3"
        >
          <Ionicons name="trash-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 py-8 flex-row justify-between items-center">
        <View>
          <Text className="text-4xl font-black text-gray-900 tracking-tight">Library</Text>
          <Text className="text-sm text-gray-500 font-medium">{blocks.length} Items Total</Text>
        </View>
        <Link href="/modal/block-editor" asChild>
          <TouchableOpacity className="bg-blue-600 px-5 py-3 rounded-2xl flex-row items-center shadow-lg shadow-blue-400">
            <Ionicons name="add" size={24} color="white" />
            <Text className="text-white text-lg font-bold ml-1">Add Content</Text>
          </TouchableOpacity>
        </Link>
      </View>

      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View className="px-6 py-3">
            <Text className="text-xs uppercase font-black text-blue-600 tracking-widest">{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="p-20 items-center justify-center">
            <Ionicons name="library-outline" size={80} color="#d1d5db" />
            <Text className="text-gray-400 font-bold text-center mt-4 text-lg">
              Your library is empty.{"\n"}Tap "Add Content" to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}
