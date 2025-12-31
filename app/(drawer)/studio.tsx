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
            color: 'bg-indigo-500', // Adjusted to fit dark theme better
            accent: '#818cf8' // Indigo 400
        },
        {
            title: 'Level 2: Collections',
            subtitle: 'Routines & Setlists',
            description: 'Combine your Level 1 activities into practice routines, setlists, and performance flows. Design your daily practice.',
            icon: 'layers-outline',
            path: '/routines',
            color: 'bg-fuchsia-500',
            accent: '#e879f9' // Fuchsia 400
        },
        {
            title: 'Analytics',
            subtitle: 'History & Stats',
            description: 'Track your practice momentum, view session logs, and analyze your consistency over time.',
            icon: 'stats-chart-outline',
            path: '/(drawer)/history',
            color: 'bg-teal-500',
            accent: '#2dd4bf' // Teal 400
        }
    ];

    return (
        <ScrollView
            className="flex-1"
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={{ paddingBottom: 100 }}
        >
            {/* Header with Home Button - Top of Page */}
            <View className="px-6 flex-row items-start pt-8 mb-2" style={{ paddingTop: insets.top }}>
                <TouchableOpacity
                    onPress={() => router.push('/')}
                    className="mr-5 p-2 rounded-full bg-white/5 border border-white/10"
                >
                    <Ionicons name="home-outline" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 mb-1">
                        Creative Hub
                    </Text>
                    <Text className="text-4xl font-black tracking-tight text-white">
                        Studio
                    </Text>
                </View>
            </View>

            {/* Hero Image Section - Dark & Moody */}
            <View className="w-full aspect-square max-h-[350px] mb-8 self-center shadow-2xl shadow-indigo-900/40 opacity-90">
                <Image
                    source={require('@/assets/images/studio_order.png')}
                    style={{ width: '100%', height: '100%', borderRadius: 32 }}
                    resizeMode="contain"
                />
            </View>

            <View className="px-6">
                {/* Intro Text - Muted and readable */}
                <Text className="text-lg leading-relaxed mb-10 font-medium text-slate-400">
                    The Studio is where you manage your artistry. Start with raw materials in <Text className="text-indigo-400 font-bold">Level 1</Text>, then forge them into actionable routines in <Text className="text-fuchsia-400 font-bold">Level 2</Text>.
                </Text>

                {/* Navigation Cards - Glassmorphic */}
                <View className="gap-6">
                    {sections.map((section, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => router.push(section.path as any)}
                            activeOpacity={0.7}
                            className="p-6 rounded-[32px] border flex-row items-start relative overflow-hidden"
                            style={{
                                backgroundColor: theme.card, // Glass
                                borderColor: theme.border
                            }}
                        >
                            {/* Colorful Glow behind icon */}
                            <View className={`absolute top-0 left-0 w-32 h-32 rounded-full blur-[50px] opacity-20 ${section.color}`} />

                            <View
                                className={`w-14 h-14 rounded-2xl items-center justify-center mr-5 bg-white/10 border border-white/5`}
                            >
                                <Ionicons name={section.icon as any} size={28} color="white" />
                            </View>
                            <View className="flex-1 z-10">
                                <Text className="text-xl font-black mb-1 text-white">
                                    {section.title}
                                </Text>
                                <Text className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: section.accent }}>
                                    {section.subtitle}
                                </Text>
                                <Text className="leading-6 text-sm font-medium text-slate-400">
                                    {section.description}
                                </Text>
                            </View>
                            <Ionicons name="chevron-forward" size={24} color={theme.mutedText} style={{ marginTop: 20 }} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Info / Legend Section - Subtle */}
                <View className="mt-12 p-6 rounded-3xl border border-dashed border-white/10 bg-white/5">
                    <View className="flex-row items-center mb-4">
                        <Ionicons name="information-circle-outline" size={24} color={theme.mutedText} className="mr-3" />
                        <Text className="font-bold text-lg text-slate-200">How it works</Text>
                    </View>
                    <Text className="leading-relaxed mb-4 text-slate-400 text-sm">
                        <Text className="font-bold text-slate-300">Public vs Private:</Text> By default, your Studio is private. You can choose to "Fork" public routines from the community or publish your own later.
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}
