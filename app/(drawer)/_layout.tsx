import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { useFinanceStore } from '@/store/financeStore';
import { Ionicons } from '@expo/vector-icons';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Href, useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Alert, Image, Platform, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';

interface NavItem {
    name: string;
    icon: keyof typeof Ionicons.glyphMap | string;
    label: string;
    path: Href;
    hidden?: boolean;
}

const NAV_ITEMS: NavItem[] = [
    { name: 'index', icon: 'home-outline', label: 'Home', path: '/' },
    { name: 'stage', icon: 'mic-outline', label: 'The Stage', path: '/stage' },
    { name: 'studio', icon: 'easel-outline', label: 'The Studio', path: '/studio' },
    { name: 'events', icon: 'calendar-outline', label: 'Schedule', path: '/events' },
    { name: 'coach', icon: 'compass-outline', label: 'The Navigator', path: '/coach' },
    { name: 'people', icon: 'people-outline', label: 'Contacts', path: '/people' },
    { name: 'setlists', icon: 'list-outline', label: 'Set Lists', path: '/setlists' },
    { name: 'songs', icon: 'mic-outline', label: 'Song Library', path: '/songs' },
    { name: 'finance', icon: 'wallet-outline', label: 'Finance', path: '/finance' },
    { name: 'settings', icon: 'settings-outline', label: 'Settings', path: '/settings' },

    // Hidden Routes
    { name: 'home-legacy', icon: 'home', label: 'Home (Legacy)', path: '/home-legacy', hidden: true },
    { name: 'content', icon: 'library-outline', label: 'Level 1', path: '/content', hidden: true },
    { name: 'routines', icon: 'layers-outline', label: 'Level 2', path: '/routines', hidden: true },
    { name: 'history', icon: 'bar-chart-outline', label: 'Analytics', path: '/history', hidden: true },
    { name: 'gigs', icon: 'musical-notes', label: 'Gigs', path: '/gigs', hidden: true },
    { name: 'gear-vault', icon: 'briefcase', label: 'Vault', path: '/gear-vault', hidden: true },
    { name: 'engagements', icon: 'musical-notes', label: 'Engagements', path: '/engagements', hidden: true },
    { name: 'people/[id]', icon: 'person', label: 'Person', path: '/people/1', hidden: true },
    { name: 'routines/[id]', icon: 'list', label: 'Routine', path: '/routines/1', hidden: true },
    { name: 'routines/index', icon: 'list', label: 'Routines', path: '/routines', hidden: true },
];

function CustomDrawerContent(props: any) {
    const theme = useTheme();
    const router = useRouter();

    const handleLogout = async () => {
        const logoutLogic = async () => {
            try {
                // Sign out of Supabase first
                await supabase.auth.signOut();

                // Wipe stores
                const { wipeLocalData } = useContentStore.getState();
                const { wipeData: wipeFinanceData } = useFinanceStore.getState();

                await wipeLocalData();
                await wipeFinanceData();

                router.replace('/auth');
            } catch (e) {
                console.error('Logout error:', e);
                router.replace('/auth');
            }
        };

        // On web, just sign out directly (confirm gets dismissed by drawer re-render)
        if (Platform.OS === 'web') {
            logoutLogic();
        } else {
            Alert.alert('Sign Out', 'Are you sure?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logoutLogic },
            ]);
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}>
                {/* Header Logo Area */}
                <View className="px-6 mb-6 mt-2 flex-row items-center opacity-80">
                    <Image
                        source={require('../../assets/images/opusmode_om_logo_v9.png')}
                        style={{ width: 24, height: 24, marginRight: 12 }}
                        resizeMode="contain"
                    />
                    <View>
                        <Text className="text-[10px] font-black uppercase tracking-[3px] text-indigo-400">OpusMode</Text>
                    </View>
                </View>

                {/* Standard Drawer Items */}
                <DrawerItemList {...props} />

                {/* Footer Section (Now Scrollable) */}
                <View style={{ borderTopWidth: 1, borderTopColor: theme.border, marginTop: 20, paddingTop: 20, paddingHorizontal: 20 }}>
                    {/* Site Map */}
                    <TouchableOpacity
                        onPress={() => router.push('/modal/sitemap')}
                        className="flex-row items-center p-2 opacity-70 mb-2"
                    >
                        <Ionicons name="map-outline" size={22} color={theme.text} style={{ marginRight: 12 }} />
                        <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>Site Map</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => router.push('/modal/help')}
                        className="flex-row items-center p-2 opacity-70 mb-2"
                    >
                        <Ionicons name="help-circle-outline" size={22} color={theme.text} style={{ marginRight: 12 }} />
                        <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center p-2 opacity-70"
                    >
                        <Ionicons name="log-out-outline" size={22} color={theme.text} style={{ marginRight: 12 }} />
                        <Text style={{ color: theme.text, fontWeight: '600', fontSize: 15 }}>Sign Out</Text>
                    </TouchableOpacity>
                    <Text className="text-[10px] text-stone-500 mt-6 ml-2 font-bold opacity-40">v1.2.3</Text>
                </View>
            </DrawerContentScrollView>
        </View>
    );
}

export default function DrawerLayout() {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const theme = useTheme();
    const { studentMode, toggleStudentMode } = useContentStore();

    // Items to hide in Student Mode
    const RESTRICTED_ITEMS = ['finance', 'people', 'coach', 'settings'];

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={{ flex: 1 }}>
                <Drawer
                    drawerContent={(props) => <CustomDrawerContent {...props} />}
                    screenOptions={{
                        headerShown: false,
                        drawerType: 'front',
                        drawerStyle: {
                            width: 280,
                            backgroundColor: theme.background,
                            borderRightWidth: 1,
                            borderRightColor: theme.border,
                        },
                        drawerActiveTintColor: theme.primary,
                        drawerInactiveTintColor: theme.mutedText,
                        drawerLabelStyle: {
                            fontSize: 16,
                            fontWeight: '600',
                            marginLeft: -10,
                        },
                        drawerItemStyle: {
                            borderRadius: 12,
                            paddingHorizontal: 10,
                            marginVertical: 4,
                        },
                        // sceneContainerStyle removed to fix type error
                    }}
                >
                    {NAV_ITEMS.map((item) => {
                        // Logic for hiding restricted items
                        let isHidden = item.hidden;
                        if (studentMode && RESTRICTED_ITEMS.includes(item.name)) {
                            isHidden = true;
                        }

                        return (
                            <Drawer.Screen
                                key={item.name}
                                name={item.name}
                                options={{
                                    drawerLabel: item.label,
                                    title: item.label,
                                    drawerIcon: ({ color, size }) => (
                                        <Ionicons name={item.icon as any} size={size + 4} color={color} />
                                    ),
                                    drawerItemStyle: (item.name === 'menu' || isHidden) ? { display: 'none' } : undefined
                                }}
                            />
                        );
                    })}

                </Drawer>
            </View>
        </View>

    );
}
