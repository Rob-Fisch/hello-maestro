import { useTheme } from '@/lib/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions, View } from 'react-native';


interface NavItem {
    name: string;
    icon: keyof typeof Ionicons.glyphMap | string;
    label: string;
    path: Href;
}


const NAV_ITEMS: NavItem[] = [
    { name: 'index', icon: 'home-outline', label: 'Home', path: '/' },
    { name: 'studio', icon: 'easel-outline', label: 'Studio', path: '/studio' },
    { name: 'content', icon: 'library-outline', label: 'Level 1', path: '/content' },
    { name: 'routines', icon: 'layers-outline', label: 'Level 2', path: '/routines' },
    { name: 'events', icon: 'calendar-outline', label: 'Schedule', path: '/events' },
    { name: 'scout', icon: 'telescope-outline', label: 'Scout', path: '/scout' },
    // { name: 'gear-vault', icon: 'briefcase-outline', label: 'Vault', path: '/gear-vault' },
    { name: 'gigs', icon: 'musical-notes-outline', label: 'Performance', path: '/gigs' },
    { name: 'people', icon: 'people-outline', label: 'Contacts', path: '/people' },
    // Compass removed for V3 Consolidation
    { name: 'settings', icon: 'settings-outline', label: 'Settings', path: '/settings' },
    { name: 'help', icon: 'help-circle-outline', label: 'Help', path: '/modal/help' },
];



export default function DrawerLayout() {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const theme = useTheme();

    return (
        <View style={{ flex: 1, backgroundColor: theme.background }}>
            <View style={{ flex: 1 }}>
                <Drawer
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
                    }}
                >
                    {NAV_ITEMS.map((item) => (
                        <Drawer.Screen
                            key={item.name}
                            name={item.name}
                            options={{
                                drawerLabel: item.label,
                                title: item.label,
                                drawerIcon: ({ color, size }) => (
                                    <Ionicons name={item.icon as any} size={size + 4} color={color} />
                                ),
                                drawerItemStyle: item.name === 'menu' ? { display: 'none' } : undefined
                            }}
                            listeners={item.name === 'help' ? {
                                drawerItemPress: (e) => {
                                    e.preventDefault();
                                    router.push('/modal/help');
                                },
                            } : undefined}
                        />
                    ))}
                </Drawer>
            </View>
        </View>

    );
}



