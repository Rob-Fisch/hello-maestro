import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface GridItemProps {
    title: string;
    subtitle?: string;
    icon: string;
    color: string;
    iconColor: string;
    route: string;
    size?: 'small' | 'medium' | 'large' | 'wide';
    isPro?: boolean;
    isLocked?: boolean;
    isDimmed?: boolean; // New prop for gamification
    onPress: () => void;
}

const GridItem = ({ title, subtitle, icon, color, iconColor, size = 'medium', isPro, isLocked, isDimmed, onPress }: GridItemProps) => {
    // Dynamic styling based on size
    // small: square, icon only
    // medium: square, icon + title
    // large: tall rectangle (portrait)
    // wide: full width rectangle (landscape)

    return (
        <TouchableOpacity
            onPress={onPress}
            className={`rounded-[24px] p-4 justify-between overflow-hidden relative border border-white/5 ${size === 'wide' ? 'w-full h-32 flex-row items-center' :
                size === 'large' ? 'flex-1 h-64' :
                    'flex-1 h-32' // medium/small share height
                } ${isDimmed ? 'opacity-50' : 'opacity-100 shadow-sm'}`} // Gamification: Dim if unused
            style={{ backgroundColor: isDimmed ? '#1e293b' : color }} // Use slate-800 if dimmed, else vibrant color
        >
            {/* Background Icon (Decorative) */}
            <View className="absolute -right-4 -bottom-4 opacity-20 transform rotate-[-15deg]">
                <Ionicons name={icon as any} size={size === 'wide' ? 100 : 80} color={isDimmed ? '#94a3b8' : iconColor} />
            </View>

            {/* Main Content */}
            <View className={`${size === 'wide' ? 'flex-1' : ''}`}>
                <View className={`w-10 h-10 rounded-full items-center justify-center mb-2 backdrop-blur-sm ${isDimmed ? 'bg-white/10' : 'bg-white/20'}`}>
                    <Ionicons name={icon as any} size={20} color={isDimmed ? '#94a3b8' : 'white'} />
                </View>

                <Text className={`font-black text-lg leading-tight uppercase tracking-tight ${isDimmed ? 'text-slate-400' : 'text-white'}`}>
                    {title}
                </Text>

                {subtitle && (
                    <Text className={`text-xs font-medium mt-1 leading-4 ${isDimmed ? 'text-slate-500' : 'text-white/70'}`} numberOfLines={2}>
                        {subtitle}
                    </Text>
                )}
            </View>

            {/* Locked / Pro Badge */}
            {isLocked && (
                <View className="absolute top-4 right-4 bg-black/40 px-2 py-1 rounded-full flex-row items-center backdrop-blur-md">
                    <Ionicons name="lock-closed" size={10} color="white" />
                    <Text className="text-white text-[10px] font-bold ml-1 uppercase">Pro</Text>
                </View>
            )}

            {/* "New" Badge for Dimmed Items? No, keep it clean. Dim means "Not Started" */}
        </TouchableOpacity>
    );
};

export default function FeatureGrid() {
    const router = useRouter();
    const { profile, routines, setLists, people, events } = useContentStore();

    const isPro = profile?.isPremium;

    // Gamification Logic: Check if user has engaged with features
    const hasPractice = (routines || []).length > 0;
    const hasSetLists = (setLists || []).length > 0;
    const hasPeople = (people || []).length > 0;
    const hasShows = (events || []).some(e => e.type === 'gig' || e.type === 'performance');

    const handlePress = (route: string, locked: boolean) => {
        if (locked) {
            router.push('/modal/upgrade');
        } else {
            router.push(route as any);
        }
    };

    return (
        <View className="gap-4 mb-4">
            <Text className="text-2xl font-black tracking-tight text-white mb-2">
                Command Center
            </Text>

            {/* ROW 1: Essentials (2 Columns) */}
            <View className="flex-row gap-4">
                <GridItem
                    title="Practice"
                    subtitle={hasPractice ? `${routines.length} Routines` : "Create Routine"}
                    icon="layers-outline"
                    color="#0ea5e9" // Sky 500
                    iconColor="#7dd3fc" // Sky 300
                    route="/studio"
                    isDimmed={!hasPractice}
                    onPress={() => handlePress('/studio', false)}
                />
                <GridItem
                    title="Set Lists"
                    subtitle={hasSetLists ? `${setLists.length} Lists` : "Draft Set List"}
                    icon="musical-notes-outline"
                    color="#db2777" // Pink 600
                    iconColor="#fbcfe8" // Pink 200
                    route="/setlists"
                    isDimmed={!hasSetLists}
                    onPress={() => handlePress('/setlists', false)}
                />
            </View>

            {/* ROW 2: Tools (2 Columns) */}
            <View className="flex-row gap-4">
                <GridItem
                    title="People"
                    subtitle={hasPeople ? `${people.length} Contacts` : "Add Contacts"}
                    icon="people-outline"
                    color="#8b5cf6" // Violet 500
                    iconColor="#ddd6fe" // Violet 200
                    route="/people"
                    isDimmed={!hasPeople}
                    onPress={() => handlePress('/people', false)}
                />
                <GridItem
                    title="Schedule"
                    subtitle={hasShows ? "Manage Gigs" : "Book a Gig"}
                    icon="calendar-outline"
                    color="#3b82f6" // Blue 500
                    iconColor="#bfdbfe" // Blue 200
                    route="/events"
                    isDimmed={!hasShows}
                    onPress={() => handlePress('/events', false)}
                />
            </View>

            {/* ROW 3: Pro Tools (Full Width) */}
            <GridItem
                title="Finance"
                subtitle="Track Income & Expenses"
                icon="cash-outline"
                color="#10b981" // Emerald 500
                iconColor="#a7f3d0" // Emerald 200
                route="/finance"
                size="wide"
                isLocked={!isPro}
                // Don't dim Pro features, they are "Locked" instead
                onPress={() => handlePress('/finance', false)}
            />

            <GridItem
                title="AI Coach"
                subtitle="Book Gigs, Draft Emails, Get Advice"
                icon="telescope-outline"
                color="#f59e0b" // Amber 500
                iconColor="#fde68a" // Amber 200
                route="/coach"
                size="wide"
                // AI Coach is now Freemium (Student Mode is free), so do not show lock badge
                onPress={() => handlePress('/coach', false)}
            />
        </View>
    );
}
