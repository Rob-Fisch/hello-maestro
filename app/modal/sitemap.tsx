import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SiteMapScreen() {
    const theme = useTheme();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { profile } = useContentStore();
    const isPro = profile?.isPremium;

    const FEATURES = [
        {
            category: "The Vault",
            subtitle: "Foundation Assets",
            icon: "file-tray-full-outline",
            color: "#60a5fa",
            items: [
                { label: "Song Library", path: "/songs", icon: "mic-outline", desc: "Lyrics, chords, and attachments", tier: "free" },
                { label: "People & Contacts", path: "/people", icon: "people-outline", desc: "Musicians and roster management", tier: "free" },
            ]
        },
        {
            category: "The Studio",
            subtitle: "Practice & Preparation",
            icon: "headset-outline",
            color: "#a78bfa",
            items: [
                { label: "Practice Routines", path: "/studio", icon: "layers-outline", desc: "Build custom practice sessions", tier: "free" },
            ]
        },
        {
            category: "The Stage",
            subtitle: "Performance & Events",
            icon: "flash-outline",
            color: "#f472b6",
            items: [
                { label: "Gig Calendar", path: "/events", icon: "calendar-outline", desc: "Schedule and manage events", tier: "free" },
                { label: "Setlist Builder", path: "/setlists", icon: "list-outline", desc: "Organize songs for performances", tier: "free" },
                { label: "Event Details", path: "/events", icon: "information-circle-outline", desc: "Logistics, roster, and setlists", tier: "free" },
                { label: "Performance Promo", path: "/events", icon: "share-social-outline", desc: "Share public event pages with fans", tier: "free" },
                { label: "Performer Page", path: "/events", icon: "people-outline", desc: "Share logistics with ensemble members", tier: "free" },
            ]
        },
        {
            category: "The Office",
            subtitle: "Business & Growth",
            icon: "briefcase-outline",
            color: "#34d399",
            items: [
                { label: "Finance Manager", path: "/finance", icon: "wallet-outline", desc: "Track income and expenses", tier: "pro" },
                { label: "Venue CRM", path: "/people", icon: "business-outline", desc: "Build your venue black book", tier: "freemium" },
                { label: "The Navigator", path: "/coach", icon: "compass-outline", desc: "AI assistant for career growth", tier: "freemium" },
                { label: "Settings", path: "/settings", icon: "settings-outline", desc: "Account and preferences", tier: "free" },
            ]
        }
    ];

    const getTierBadge = (tier: string) => {
        if (tier === "free") {
            return <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full"><Text className="text-emerald-300 text-[9px] font-bold">FREE</Text></View>;
        } else if (tier === "pro") {
            return <View className="bg-indigo-500/20 px-2 py-0.5 rounded-full flex-row items-center gap-1"><Ionicons name="lock-closed" size={8} color="#818cf8" /><Text className="text-indigo-300 text-[9px] font-bold">PRO</Text></View>;
        } else {
            return <View className="bg-teal-500/20 px-2 py-0.5 rounded-full"><Text className="text-teal-300 text-[9px] font-bold">FREE/PRO</Text></View>;
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Header */}
                <View className="p-6 pt-12 relative overflow-hidden">
                    <View className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />

                    <View className="flex-row items-center justify-between mb-2">
                        <View>
                            <Text className="text-[10px] font-black uppercase tracking-[4px] text-indigo-400 mb-2">
                                Navigation
                            </Text>
                            <Text className="text-4xl font-black text-white tracking-tight">
                                Site Map
                            </Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="bg-white/10 p-3 rounded-full"
                        >
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    <Text className="text-slate-400 font-medium leading-relaxed max-w-md">
                        Explore all features. Tap any item to navigate directly.
                    </Text>
                </View>

                {/* Features Grid */}
                <View className="px-4 gap-8">
                    {FEATURES.map((section, idx) => (
                        <View key={idx}>
                            {/* Section Header */}
                            <View className="flex-row items-center mb-4 px-2">
                                <View className="w-8 h-8 rounded-lg items-center justify-center mr-3" style={{ backgroundColor: section.color + '20' }}>
                                    <Ionicons name={section.icon as any} size={18} color={section.color} />
                                </View>
                                <View>
                                    <Text className="text-lg font-black text-white tracking-tight">{section.category}</Text>
                                    <Text className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">{section.subtitle}</Text>
                                </View>
                                <View className="flex-1 h-[1px] bg-white/10 ml-4 mt-1" />
                            </View>

                            {/* Feature Items */}
                            <View className="gap-3">
                                {section.items.map((item, itemIdx) => (
                                    <TouchableOpacity
                                        key={itemIdx}
                                        onPress={() => {
                                            if (item.tier === "pro" && !isPro) {
                                                router.push('/modal/upgrade');
                                            } else {
                                                router.push(item.path as any);
                                            }
                                        }}
                                        className="flex-row items-center p-4 rounded-2xl border"
                                        style={{ backgroundColor: theme.card, borderColor: theme.border }}
                                    >
                                        <View className="w-10 h-10 rounded-full items-center justify-center mr-3" style={{ backgroundColor: section.color + '20' }}>
                                            <Ionicons name={item.icon as any} size={20} color={section.color} />
                                        </View>
                                        <View className="flex-1">
                                            <View className="flex-row items-center gap-2 mb-1">
                                                <Text className="font-bold text-white">{item.label}</Text>
                                                {getTierBadge(item.tier)}
                                            </View>
                                            <Text className="text-xs text-slate-400">{item.desc}</Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={20} color={theme.mutedText} />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Pricing Comparison */}
                <View className="px-4 mt-12">
                    <View className="mb-6">
                        <Text className="text-2xl font-black text-white text-center mb-2">Pricing Tiers</Text>
                        <Text className="text-slate-400 text-center text-sm">Compare features and limits</Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-4 px-4">
                        <View className="flex-row gap-3">
                            {/* FREE Column */}
                            <View className="w-64 bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
                                <View className="bg-slate-700 p-4 items-center border-b border-slate-600">
                                    <Text className="text-slate-300 font-black text-lg">FREE</Text>
                                    <Text className="text-slate-500 text-xs mt-1">$0 forever</Text>
                                </View>
                                <View className="p-4 gap-2.5">
                                    <View className="flex-row items-start">
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">Unlimited Gigs</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">Single Platform Sync</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">~100MB Storage</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">Practice Tracking (3 mo.)</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">Performance Promo</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">Performer Page (Auth)</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="alert-circle-outline" size={14} color="#f59e0b" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">5 Venues Max</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="checkmark-circle" size={14} color="#10b981" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-slate-300 text-xs flex-1">Manual Sync Only</Text>
                                    </View>
                                </View>
                            </View>

                            {/* PRO Column */}
                            <TouchableOpacity
                                onPress={() => router.push('/modal/upgrade')}
                                className="w-64 bg-indigo-900/20 border border-indigo-500/50 rounded-2xl overflow-hidden"
                            >
                                <View className="bg-indigo-600 p-4 items-center border-b border-indigo-500/50">
                                    <Text className="text-white font-black text-lg">PRO</Text>
                                    <Text className="text-indigo-200 text-xs mt-1">$9.99/month</Text>
                                </View>
                                <View className="p-4 gap-2.5">
                                    <View className="flex-row items-start">
                                        <Ionicons name="infinite" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Unlimited Songs</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="cloud-upload" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">~5GB Storage</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="time" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Unlimited History</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="copy" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Gig Set Lists</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="sync" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Realtime Sync</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="infinite" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Unlimited Venues</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="compass" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Full Navigator</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="wallet" size={14} color="#818cf8" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-indigo-200 text-xs flex-1 font-bold">Finance Dashboard</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* PRO+ Column */}
                            <TouchableOpacity
                                onPress={() => router.push('/modal/upgrade')}
                                className="w-64 bg-purple-900/20 border border-purple-500/50 rounded-2xl overflow-hidden"
                            >
                                <View className="bg-purple-600 p-4 items-center border-b border-purple-500/50">
                                    <Text className="text-white font-black text-lg">PRO+</Text>
                                    <Text className="text-purple-200 text-xs mt-1">$19.99/month</Text>
                                </View>
                                <View className="p-4 gap-2.5">
                                    <View className="flex-row items-start">
                                        <Ionicons name="infinite" size={14} color="#c084fc" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-purple-200 text-xs flex-1 font-bold">Unlimited Songs</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="cloud-upload" size={14} color="#c084fc" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-purple-200 text-xs flex-1 font-bold">~20GB Storage</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="checkmark-done" size={14} color="#c084fc" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-purple-200 text-xs flex-1 font-bold">All Pro Features</Text>
                                    </View>
                                    <View className="flex-row items-start">
                                        <Ionicons name="headset" size={14} color="#c084fc" style={{ marginRight: 6, marginTop: 1 }} />
                                        <Text className="text-purple-200 text-xs flex-1 font-bold">Priority Support</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>

                {/* Footer */}
                <View className="items-center mt-12 mb-8 opacity-40">
                    <Ionicons name="map-outline" size={32} color="white" />
                </View>
            </ScrollView>
        </View>
    );
}
