import { View, Text, TextInput, TouchableOpacity, FlatList, Alert, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useContentStore } from '@/store/contentStore';
import { Category } from '@/store/types';

export default function SettingsScreen() {
    const { categories, addCategory, updateCategory, deleteCategory, settings, updateSettings } = useContentStore();
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');

    const [newTemplate, setNewTemplate] = useState('');

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

    return (
        <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 24 }}>
            <View className="mb-8">
                <Text className="text-4xl font-black tracking-tight text-foreground">Settings</Text>
                <Text className="text-muted-foreground font-medium text-base mt-2">Personalize your experience</Text>
            </View>

            {/* Category Management Section */}
            <View className="mb-8">
                <View className="flex-row items-center mb-4">
                    <Text className="text-2xl font-bold text-foreground">Content Categories</Text>
                </View>

                <View className="bg-card p-4 rounded-3xl border border-border shadow-sm mb-6">
                    <Text className="text-[10px] uppercase font-black text-muted-foreground mb-2 tracking-widest px-1">Add New Category</Text>
                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-foreground"
                            placeholder="e.g. Solo Pieces"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                        />
                        <TouchableOpacity
                            onPress={handleAdd}
                            className="bg-blue-600 px-6 rounded-2xl items-center justify-center shadow-lg shadow-blue-300"
                        >
                            <Text className="text-white font-black">Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {categories.map((cat) => (
                    <View key={cat.id} className="bg-card border border-border rounded-2xl mb-3 p-4 flex-row items-center justify-between shadow-xs">
                        {editingId === cat.id ? (
                            <View className="flex-1 flex-row gap-2">
                                <TextInput
                                    className="flex-1 bg-gray-50 border border-gray-100 p-2 rounded-xl text-foreground font-bold"
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
                                    <Text className="font-bold text-foreground text-lg">{cat.name}</Text>
                                </View>
                                <View className="flex-row gap-2">
                                    <TouchableOpacity
                                        onPress={() => handleStartEdit(cat)}
                                        className="p-2 opacity-40"
                                    >
                                        <Text className="text-blue-600 font-bold">Edit</Text>
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
                <Text className="text-2xl font-bold text-foreground mb-4">PDF Export</Text>
                <View className="bg-card p-5 rounded-3xl border border-border shadow-sm flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                        <Text className="font-bold text-lg text-foreground">Table of Contents</Text>
                        <Text className="text-muted-foreground text-xs mt-1">Include an index page with song titles and page numbers</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => updateSettings({ includeTOC: !settings.includeTOC })}
                        className={`w-14 h-8 rounded-full items-center justify-center ${settings.includeTOC ? 'bg-blue-600' : 'bg-gray-200'}`}
                    >
                        <View className={`w-6 h-6 bg-white rounded-full shadow-sm ${settings.includeTOC ? 'ml-6' : 'mr-6'}`} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Messaging Section */}
            <View className="mb-8">
                <Text className="text-2xl font-bold text-foreground mb-4">Messaging Templates</Text>
                <View className="bg-card p-4 rounded-3xl border border-border shadow-sm mb-6">
                    <Text className="text-[10px] uppercase font-black text-muted-foreground mb-2 tracking-widest px-1">Add New Template</Text>
                    <View className="flex-row gap-3">
                        <TextInput
                            className="flex-1 bg-gray-50 border border-gray-100 p-4 rounded-2xl font-bold text-foreground"
                            placeholder="e.g. Gig starts in 1 hour!"
                            value={newTemplate}
                            onChangeText={setNewTemplate}
                            multiline
                        />
                        <TouchableOpacity
                            onPress={handleAddTemplate}
                            className="bg-blue-600 px-6 rounded-2xl items-center justify-center shadow-lg shadow-blue-300"
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

            {/* App Info Footer */}
            <View className="mt-12 pt-8 border-t border-border items-center">
                <Text className="text-muted-foreground text-xs font-bold uppercase tracking-widest">HelloMaestro Premium</Text>
                <Text className="text-[10px] text-gray-400 mt-1">Version 1.2.0 • Local Storage Mode</Text>
            </View>
        </ScrollView>
    );
}
