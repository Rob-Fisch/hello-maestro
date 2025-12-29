import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function StudioScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const sections = [
        {
            title: 'Level 1: Library',
            subtitle: 'Raw Materials & Resources',
            description: 'Your central repository for sheet music, audio tracks, and reference materials. Organize your assets before arranging them into routines.',
            icon: 'library-outline',
            path: '/content',
            color: 'bg-purple-500', // Tailwind class reference
            accent: '#a855f7'
        },
        {
            title: 'Level 2: Collections',
            subtitle: 'Routines & Setlists',
            description: 'Combine your Level 1 assets into practice routines, setlists, and performance flows. Design your daily practice.',
            icon: 'layers-outline',
            path: '/routines',
            color: 'bg-orange-500',
            accent: '#f97316'
        },
        {
            title: 'Analytics',
            subtitle: 'History & Stats',
            description: 'Track your practice momentum, view session logs, and analyze your consistency over time.',
            icon: 'stats-chart-outline',
            path: '/(drawer)/history',
            color: 'bg-green-500',
            accent: '#22c55e'
        }
    ];

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={{ paddingBottom: 40 }}
        >
            <View className="w-full aspect-square max-h-[400px] mt-4 mb-8 self-center shadow-2xl shadow-indigo-500/30">
                <Image
                    source={require('@/assets/images/studio_order.png')}
                    style={{ width: '100%', height: '100%', borderRadius: 32 }}
                    resizeMode="contain"
                />
            </View>

            <View className="px-6" style={{ paddingTop: 20 }}>
                {/* Header with Home Button */}
                <View className="flex-row items-center mb-8">
                    <TouchableOpacity
                        onPress={() => router.push('/')}
                        className="mr-5 -ml-2 p-2 rounded-full"
                    >
                        <Ionicons name="home-outline" size={32} color="white" />
                    </TouchableOpacity>
                    <View>
                        <Text className="text-[10px] font-black uppercase tracking-[3px] text-teal-100 mb-1">
                            Creative Hub
                        </Text>
                        <Text className="text-4xl font-black tracking-tight text-white">
                            Studio
                        </Text>
                    </View>
                </View>

                {/* Intro Text */}
                <Text className="text-lg leading-relaxed mb-8 font-medium text-white/80">
                    The Studio is where you manage your artistry. Start with raw materials in Level 1, then forge them into actionable routines in Level 2.
                </Text>

                {/* Navigation Cards */}
                <View className="gap-6">
                    {sections.map((section, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => router.push(section.path as any)}
                            className="p-6 rounded-3xl border shadow-sm flex-row items-start"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <View
                                className={`w-14 h-14 rounded-2xl items-center justify-center mr-5 ${section.color}`}
                            >
                                <Ionicons name={section.icon as any} size={28} color="white" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-xl font-black mb-1" style={{ color: theme.text }}>
                                    {section.title}
                                </Text>
                                <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: section.accent }}>
                                    {section.subtitle}
                                </Text>
                                <Text className="leading-6" style={{ color: theme.mutedText }}>
                                    {section.description}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={theme.mutedText} style={{ marginTop: 20 }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info / Legend Section */}
                <View className="mt-10 p-6 rounded-3xl border border-dashed" style={{ borderColor: theme.border }}>
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="information-circle-outline" size={24} color={theme.primary} className="mr-3" />
                        <Text className="font-bold text-lg" style={{ color: theme.text }}>How it works</Text>
                    </View>
                    <Text className="leading-relaxed mb-4" style={{ color: theme.mutedText }}>
                        <Text className="font-bold">Public vs Private:</Text> By default, your Studio is private. You can choose to "Fork" public routines from the community or publish your own later.
                    </Text>
                    <Text className="leading-relaxed" style={{ color: theme.mutedText }}>
                        <Text className="font-bold">Workflow:</Text> Add PDFs and Backing Tracks to <Text style={{ color: theme.text }}>Level 1</Text>. Then open <Text style={{ color: theme.text }}>Level 2</Text> to build playlists using those files.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

// Consistent styling with index.tsx would be ideal, nativewind classNames used above match the project style.
