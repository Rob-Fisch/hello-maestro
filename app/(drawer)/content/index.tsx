import { View, Text, TouchableOpacity, SectionList, Alert, Platform, Image } from 'react-native';
import { useState, useMemo, useEffect } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContentBlock } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { resolveFileUri } from '@/utils/pdfExport';
import { useTheme } from '@/lib/theme';


const ContentListItem = ({
  item,
  onPress,
  onDelete,
  isDeleting,
  onCancelDelete,
  onConfirmDelete
}: {
  item: ContentBlock;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}) => {
  const [displayUri, setDisplayUri] = useState<string | null>(null);

  useEffect(() => {
    async function loadUri() {
      if (item.mediaUri) {
        const resolved = await resolveFileUri(item.mediaUri);
        if (resolved) setDisplayUri(resolved);
      }
    }
    loadUri();
  }, [item.mediaUri]);

  const theme = useTheme();

  return (
    <View className="flex-row items-center justify-between p-6 border mx-4 my-2 rounded-card shadow-lg shadow-gray-200/50" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
      <TouchableOpacity
        className="flex-1 flex-row items-center"
        onPress={onPress}
      >
        {/* Media Preview Thumbnail */}
        <View className="w-16 h-16 rounded-2xl mr-5 items-center justify-center overflow-hidden border shadow-inner" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
          {item.mediaUri ? (
            item.mediaUri.endsWith('.pdf') ? (
              <View className="items-center">
                <Ionicons name="document-text" size={32} color={theme.primary} />
                <Text className="text-[10px] font-black mt-1 uppercase tracking-tighter" style={{ color: theme.primary }}>PDF</Text>
              </View>
            ) : (
              <Image
                source={{ uri: displayUri || item.mediaUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
            )
          ) : (
            <Ionicons
              name={item.type === 'sheet_music' ? 'musical-notes' : 'document-text'}
              size={28}
              color="#cbd5e1"
            />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-xl font-black tracking-tight" numberOfLines={1} style={{ color: theme.text }}>{item.title}</Text>
          <View className="flex-row items-center mt-1.5 font-bold">
            <View className="px-2 py-0.5 rounded-lg mr-2" style={{ backgroundColor: `${theme.primary}15` }}>
              <Text className="text-[10px] font-black uppercase tracking-widest" style={{ color: theme.primary }}>{item.type.replace('_', ' ')}</Text>
            </View>
            <Text className="text-xs font-bold" numberOfLines={1} style={{ color: theme.mutedText }}>
              {item.tags.length > 0 ? item.tags.join(' • ') : 'No Tags'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {isDeleting ? (
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onCancelDelete} className="px-4 py-2 bg-gray-100 rounded-full mr-2">
            <Text className="text-gray-600 font-bold text-xs">NO</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onConfirmDelete} className="px-4 py-2 bg-red-600 rounded-full">
            <Text className="text-white font-bold text-xs">DEL</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 p-2.5 rounded-full border border-red-100"
        >
          <Ionicons name="trash-outline" size={18} color="#ef4444" />
        </TouchableOpacity>
      )}
    </View>
  );
};


export default function ContentScreen() {
  const { blocks, categories, deleteBlock, trackModuleUsage, recentBlockIds, trackBlockUsage } = useContentStore();

  useEffect(() => {
    trackModuleUsage('content');
  }, []);

  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  const allCategoryIds = useMemo(() => {
    const ids = categories.map(cat => cat.id).filter(id => blocks.some(b => b.categoryId === id));
    if (blocks.some(b => !b.categoryId || !categories.find(c => c.id === b.categoryId))) {
      ids.push('none');
    }
    return ids;
  }, [blocks, categories]);

  const isAllCollapsed = collapsedCategories.size >= allCategoryIds.length && allCategoryIds.length > 0;

  const toggleAll = () => {
    if (isAllCollapsed) {
      setCollapsedCategories(new Set());
    } else {
      setCollapsedCategories(new Set(allCategoryIds));
    }
  };

  const toggleCategory = (id: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const groupedData = useMemo(() => {
    const sections: { title: string; data: ContentBlock[]; id: string; type: 'category' | 'mru' }[] = [];

    // MRU Section
    if (recentBlockIds.length > 0) {
      const mruBlocks = recentBlockIds
        .map(id => blocks.find(b => b.id === id))
        .filter((b): b is ContentBlock => !!b);

      if (mruBlocks.length > 0) {
        sections.push({
          title: 'Most Recently Used',
          data: mruBlocks,
          id: 'mru',
          type: 'mru'
        });
      }
    }

    categories.forEach(cat => {
      const catBlocks = blocks.filter(b => b.categoryId === cat.id);
      if (catBlocks.length > 0) {
        sections.push({
          title: cat.name,
          data: collapsedCategories.has(cat.id) ? [] : catBlocks,
          id: cat.id,
          type: 'category'
        });
      }
    });

    const uncategorized = blocks.filter(b => !b.categoryId || !categories.find(c => c.id === b.categoryId));
    if (uncategorized.length > 0) {
      sections.push({
        title: 'Uncategorized',
        data: collapsedCategories.has('none') ? [] : uncategorized,
        id: 'none',
        type: 'category'
      });
    }

    return sections;
  }, [blocks, categories, recentBlockIds, collapsedCategories]);

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
    <ContentListItem
      item={item}
      onPress={() => {
        trackBlockUsage(item.id);
        router.push({ pathname: '/modal/block-editor', params: { id: item.id } });
      }}
      onDelete={() => handleDeletePress(item.id)}
      isDeleting={deletingId === item.id}
      onCancelDelete={() => setDeletingId(null)}
      onConfirmDelete={() => confirmWebDelete(item.id)}
    />
  );



  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-8 pb-6" style={{ paddingTop: Math.max(insets.top, 20) }}>
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-4">
            <Text className="text-[10px] font-black uppercase tracking-[3px] mb-2" style={{ color: theme.primary }}>Content Bank</Text>
            <Text className="text-5xl font-black tracking-tight leading-[48px]" style={{ color: theme.text }}>Activities</Text>
          </View>
          <Link href="/modal/block-editor" asChild>
            <TouchableOpacity className="w-14 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-400" style={{ backgroundColor: theme.primary }}>
              <Ionicons name="add" size={32} color="white" />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="flex-row items-center mt-4">
          <Text className="text-sm font-bold" style={{ color: theme.mutedText }}>{blocks.length} Assets Registered</Text>
          <View className="mx-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: theme.mutedText }} />
          <TouchableOpacity onPress={toggleAll} className="active:opacity-60">
            <Text className="text-[10px] font-black uppercase tracking-[1.5px]" style={{ color: theme.primary }}>
              {isAllCollapsed ? 'Expand All' : 'Collapse All'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>


      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={({ section }) => (
          <TouchableOpacity
            onPress={() => toggleCategory(section.id)}
            className="px-8 pt-8 pb-4 flex-row justify-between items-center"
            disabled={section.type === 'mru'}
          >
            <Text className="text-[10px] uppercase font-black tracking-[2px]" style={{ color: section.type === 'mru' ? '#f59e0b' : theme.primary }}>
              {section.title}
              {section.type === 'category' && ` (${section.data.length === 0 ? 'Collapsed' : blocks.filter(b => b.categoryId === section.id || (section.id === 'none' && !b.categoryId)).length})`}
            </Text>
            {section.type === 'category' && (
              <Ionicons
                name={collapsedCategories.has(section.id) ? 'chevron-forward' : 'chevron-down'}
                size={16}
                color={theme.mutedText}
              />
            )}
          </TouchableOpacity>
        )}

        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
          <View className="p-20 items-center justify-center">
            <Ionicons name="library-outline" size={80} color="#d1d5db" />
            <Text className="text-gray-400 font-bold text-center mt-4 text-lg">
              No activities registered yet.{"\n"}Tap &quot;+&quot; to get started!
            </Text>
          </View>
        }
      />
    </View>
  );
}
