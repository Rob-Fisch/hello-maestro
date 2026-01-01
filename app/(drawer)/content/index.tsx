import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { ContentBlock } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, SectionList, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const ContentListItem = ({
  item,
  onPress,
  onDelete,
  isDeleting,
  onCancelDelete,
  onConfirmDelete,
  onRename
}: {
  item: ContentBlock;
  onPress: () => void;
  onDelete: () => void;
  isDeleting: boolean;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onRename: () => void;
}) => {
  const theme = useTheme();

  return (
    <View
      className="flex-row items-center p-2 border-b mx-4"
      style={{
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderBottomWidth: 1,
        borderTopWidth: 0,
        borderLeftWidth: 0,
        borderRightWidth: 0,
        marginHorizontal: 16,
        marginBottom: 0,
        borderRadius: 0
      }}
    >
      <TouchableOpacity
        className="flex-1 flex-row items-center"
        onPress={onPress}
      >
        {/* Minimal Icon Indicator */}
        <View className="mr-3 ml-1 opacity-70">
          <Ionicons
            name={item.mediaUri?.endsWith('.pdf') ? "document-text" : (item.type === 'sheet_music' ? 'musical-notes' : 'images')}
            size={18}
            color={theme.primary}
          />
        </View>

        <View className="flex-1 mr-2 py-1">
          <Text
            className="text-sm font-semibold tracking-tight leading-4"
            numberOfLines={2}
            style={{ color: theme.text }}
          >
            {item.title}
          </Text>
          {(item.tags.length > 0 || item.type) && (
            <Text className="text-[10px] mt-0.5 opacity-60" numberOfLines={1} style={{ color: theme.mutedText }}>
              {item.type.replace('_', ' ')} • {item.tags.join(', ')}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row items-center pl-2">
        {isDeleting ? (
          <View className="flex-row items-center animate-in fade-in slide-in-from-right-4 duration-200">
            <TouchableOpacity onPress={onCancelDelete} className="mr-3">
              <Text className="text-[10px] font-bold" style={{ color: theme.mutedText }}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirmDelete}>
              <Text className="text-[10px] font-bold text-red-500">CONFIRM</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onDelete}
            className="p-2 opacity-40 hover:opacity-100 active:opacity-60"
            hitSlop={10}
          >
            <Ionicons name="trash-outline" size={16} color={theme.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};


export default function ContentScreen() {
  const { blocks, categories, deleteBlock, updateBlock, trackModuleUsage, recentBlockIds, trackBlockUsage } = useContentStore();

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

    categories
      .sort((a, b) => {
        if (a.name === 'Other') return 1;
        if (b.name === 'Other') return -1;
        return a.name.localeCompare(b.name);
      })
      .forEach(cat => {
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
  }, [blocks, categories, collapsedCategories]);



  const handleRename = (id: string, currentTitle: string) => {
    if (Platform.OS === 'web') {
      const newName = window.prompt("Rename Node", currentTitle);
      if (newName && newName.trim() !== '') {
        updateBlock(id, { title: newName });
      }
    } else {
      // iOS and Android
      Alert.prompt(
        "Rename Node",
        "Enter a new name for this item",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save", onPress: (text) => {
              if (text && text.trim() !== '') {
                updateBlock(id, { title: text });
              }
            }
          }
        ],
        "plain-text",
        currentTitle
      );
    }
  };

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
      onRename={() => handleRename(item.id, item.title)}
    />
  );



  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      <View className="px-8 pb-6" style={{ paddingTop: Math.max(insets.top, 20) }}>
        {/* ROW 1: Navigation & Actions */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.push('/')} className="p-2 -ml-2 mr-2">
              <Ionicons name="home-outline" size={24} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/studio')}
              className="flex-row items-center px-4 py-2 rounded-full border"
              style={{ backgroundColor: theme.card, borderColor: theme.border }}
            >
              <Ionicons name="arrow-back" size={16} color={theme.text} />
              <Text className="text-sm font-bold ml-1" style={{ color: theme.text }}>Studio</Text>
            </TouchableOpacity>
          </View>

          <Link href="/modal/block-editor" asChild>
            <TouchableOpacity className="w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-purple-500/20" style={{ backgroundColor: theme.primary }}>
              <Ionicons name="add" size={28} color="black" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* ROW 2: Title */}
        <View className="mb-2">
          <Text className="text-[10px] font-black uppercase tracking-[3px] mb-2" style={{ color: theme.primary }}>Level 1</Text>
          <Text className="text-4xl font-black tracking-tight leading-tight" style={{ color: theme.text }}>Activities</Text>
        </View>

        <View className="flex-row items-center mt-4">
          <Text className="text-sm font-bold" style={{ color: theme.mutedText }}>{blocks.length} Activities Registered</Text>
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
