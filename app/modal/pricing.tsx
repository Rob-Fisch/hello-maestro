import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function PricingModal() {
    const router = useRouter();
    const theme = useTheme();

    const tiers = [
        {
            name: 'Free',
            price: '$0',
            subtitle: 'The Hook',
            features: [
                'Unlimited Songs & Setlists',
                'Basic Gig Calendar',
                'Local "Puddle Proof" Backup',
            ],
            cta: 'Current Plan',
            active: true,
            color: 'text-slate-400',
            borderColor: 'border-slate-700',
        },
        {
            name: 'Pro',
            price: '$4.99',
            period: '/mo',
            subtitle: 'The Working Musician',
            features: [
                'Everything in Free',
                'PDF Exports (Setlists, Stage Plots)',
                'Venue Database & Contacts',
                'Calendar Sync (Google/iCal)',
                'Cloud Sync Across Devices',
            ],
            cta: 'Upgrade to Pro',
            highlight: false,
            color: 'text-indigo-400',
            borderColor: 'border-indigo-500/50',
        },
        {
            name: 'Pro+',
            price: '$19.99',
            period: '/mo',
            subtitle: 'The Business Manager',
            features: [
                'Everything in Pro',
                'The Vault (Asset Tracking & Insurance)',
                'Gig Log (Income & Payment Status)',
                'Expense Tracker (Tax Deductions)',
                'Team Management',
                'Fan Magnet (QR Data Collection)',
            ],
            cta: 'Go Pro+',
            highlight: true,
            color: 'text-rose-400',
            borderColor: 'border-rose-500',
        },
    ];

    return (
        <View className="flex-1 bg-black">
            {/* Header */}
            <View className="flex-row items-center justify-between px-6 pt-12 pb-4 border-b border-white/10">
                <Text className="text-xl font-black text-white tracking-widest uppercase">
                    Plans & Pricing
                </Text>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center"
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-6">
                <Text className="text-center text-slate-400 mb-8 italic">
                    "Invest in your career for less than the cost of a set of strings."
                </Text>

                <View className="gap-6 mb-12">
                    {tiers.map((tier, index) => (
                        <View
                            key={tier.name}
                            className={`p-6 rounded-3xl border ${tier.borderColor} ${tier.highlight ? 'bg-rose-900/10' : 'bg-slate-900/50'
                                } relative overflow-hidden`}
                        >
                            {tier.highlight && (
                                <View className="absolute top-0 right-0 bg-rose-500 px-4 py-1 rounded-bl-xl">
                                    <Text className="text-white text-[10px] font-bold uppercase tracking-widest">Recommended</Text>
                                </View>
                            )}

                            <View className="flex-row justify-between items-start mb-4">
                                <View>
                                    <Text className={`text-2xl font-black uppercase ${tier.color}`}>
                                        {tier.name}
                                    </Text>
                                    <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        {tier.subtitle}
                                    </Text>
                                </View>
                                <View className="items-end">
                                    <Text className="text-3xl font-black text-white">
                                        {tier.price}
                                    </Text>
                                    {tier.period && (
                                        <Text className="text-slate-500 text-[10px] font-bold uppercase">
                                            {tier.period}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            {/* Features List */}
                            <View className="gap-3 mb-6">
                                {tier.features.map((feat, i) => (
                                    <View key={i} className="flex-row items-center gap-3">
                                        <Ionicons name="checkmark-circle" size={16} color={tier.highlight ? '#fb7185' : '#818cf8'} />
                                        <Text className="text-slate-300 text-sm font-medium">
                                            {feat}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <TouchableOpacity
                                className={`w-full py-4 rounded-xl items-center border ${tier.active ? 'bg-slate-800 border-slate-700' :
                                    tier.highlight ? 'bg-rose-600 border-rose-400' :
                                        'bg-indigo-600 border-indigo-400'
                                    }`}
                            >
                                <Text className={`font-black uppercase tracking-widest text-xs ${tier.active ? 'text-slate-400' : 'text-white'}`}>
                                    {tier.cta}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                <Text className="text-center text-slate-600 text-xs mb-12 px-8 leading-relaxed">
                    All plans include our 100% "Puddle Proof" guarantee.
                    If the app crashes during a gig, the beers are on us.
                </Text>
            </ScrollView>
        </View>
    );
}
