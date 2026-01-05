import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Href } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useWindowDimensions, View } from 'react-native';


interface NavItem {
    name: string;
    icon: keyof typeof Ionicons.glyphMap | string;
    label: string;
    path: Href;
    hidden?: boolean;
}


const NAV_ITEMS: NavItem[] = [
    { name: 'index', icon: 'home-outline', label: 'Home', path: '/' },
    { name: 'studio', icon: 'easel-outline', label: 'Studio', path: '/studio' },
    { name: 'content', icon: 'library-outline', label: 'Level 1', path: '/content', hidden: true },
    { name: 'routines', icon: 'layers-outline', label: 'Level 2', path: '/routines', hidden: true },
    { name: 'events', icon: 'calendar-outline', label: 'Schedule', path: '/events' },
    { name: 'scout', icon: 'telescope-outline', label: 'Scout', path: '/scout' },
    // { name: 'gear-vault', icon: 'briefcase-outline', label: 'Vault', path: '/gear-vault' },
    { name: 'gigs', icon: 'musical-notes-outline', label: 'Performance', path: '/gigs', hidden: true },
    { name: 'finance', icon: 'wallet-outline', label: 'Finance', path: '/finance' },
    { name: 'people', icon: 'people-outline', label: 'Contacts', path: '/people' },
    // Compass removed for V3 Consolidation
    { name: 'settings', icon: 'settings-outline', label: 'Settings', path: '/settings' },

    // Hidden Routes (Explicitly defined to hide from Drawer)
    { name: 'gear-vault', icon: 'briefcase', label: 'Vault', path: '/gear-vault', hidden: true },
    { name: 'history', icon: 'time', label: 'History', path: '/history', hidden: true },
    { name: 'engagements', icon: 'musical-notes', label: 'Engagements', path: '/engagements', hidden: true },
    { name: 'people/[id]', icon: 'person', label: 'Person', path: '/people/1', hidden: true }, // Dynamic route
    { name: 'routines/[id]', icon: 'list', label: 'Routine', path: '/routines/1', hidden: true }, // Dynamic route
    { name: 'routines/index', icon: 'list', label: 'Routines', path: '/routines', hidden: true }, // Explicit index
];



export default function DrawerLayout() {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024;
    const theme = useTheme();
    const { studentMode, toggleStudentMode } = useContentStore();

    // Items to hide in Student Mode
    const RESTRICTED_ITEMS = ['finance', 'people', 'scout', 'settings'];

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



