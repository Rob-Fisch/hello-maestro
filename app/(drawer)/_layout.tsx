import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useWindowDimensions, View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { router, usePathname, Href } from 'expo-router';
import { useContentStore } from '@/store/contentStore';
import { useTheme } from '@/lib/theme';


interface NavItem {
    name: string;
    icon: keyof typeof Ionicons.prototype.queries | any;
    label: string;
    path: Href;
}


const NAV_ITEMS: NavItem[] = [
    { name: 'index', icon: 'home-outline', label: 'Home', path: '/' },
    { name: 'content', icon: 'library-outline', label: 'Activities', path: '/content' },
    { name: 'routines', icon: 'repeat-outline', label: 'Routines', path: '/routines' },
    { name: 'events', icon: 'calendar-outline', label: 'Schedule', path: '/events' },
    { name: 'engagements', icon: 'star-outline', label: 'Gigs', path: '/engagements' },
    { name: 'people', icon: 'people-outline', label: 'Contacts', path: '/people' },
    { name: 'pathfinder', icon: 'map-outline', label: 'Compass', path: '/pathfinder' },
    { name: 'settings', icon: 'settings-outline', label: 'Settings', path: '/settings' },
    { name: 'help', icon: 'help-circle-outline', label: 'Help', path: '/modal/help' },
];


function NavigationRail() {
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const navigation = useNavigation();
    const { trackModuleUsage } = useContentStore();
    const theme = useTheme();

    // Only show the rail for main drawer modules
    const isMainModule = NAV_ITEMS.some(item => {
        const pathStr = typeof item.path === 'string' ? item.path : (item.path as any).pathname;
        return pathname === pathStr || (pathStr !== '/' && pathname.startsWith(pathStr));
    });

    // Hide if we are in a modal or any other sub-page
    if (!isMainModule || pathname.includes('modal')) {
        return null;
    }

    // Helper to check if path is active
    const isActive = (path: Href) => {

        const pathStr = typeof path === 'string' ? path : (path as any).pathname;
        if (pathStr === '/' && pathname === '/') return true;
        if (pathStr !== '/' && pathname.startsWith(pathStr)) return true;
        return false;
    };


    return (
        <TouchableOpacity
            activeOpacity={1}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            style={[styles.rail, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        >
            <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={styles.menuTrigger}
            >
                <Ionicons name="menu-outline" size={24} color="#2563eb" />
            </TouchableOpacity>

            <View style={styles.separator} />

            {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                return (
                    <TouchableOpacity
                        key={item.name}
                        onPress={() => {
                            const modId = (item.path as any).replace?.('/', '') || 'index';
                            trackModuleUsage(modId === 'index' ? 'index' : modId);
                            router.push(item.path);
                        }}
                        style={[styles.railItem, active && { backgroundColor: theme.card }]}
                    >
                        <Ionicons
                            name={(active ? (item.icon as string).replace('-outline', '') : (item.icon as string)) as any}
                            size={26}
                            color={active ? theme.primary : theme.mutedText}
                        />
                        {active && <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />}
                    </TouchableOpacity>

                );
            })}


            <View style={{ flex: 1 }} />
        </TouchableOpacity>
    );
}

export default function DrawerLayout() {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 1024; // Rail + Drawer is better for very large screens
    const theme = useTheme();

    return (
        <View style={{ flex: 1, flexDirection: 'row', backgroundColor: theme.background }}>
            <NavigationRail />

            <View style={{ flex: 1 }}>
                <Drawer
                    screenOptions={{
                        headerShown: false,
                        drawerType: 'front', // Slide over the rail/content
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
                    <Drawer.Screen
                        name="index"
                        options={{
                            drawerLabel: 'Home',
                            title: 'OpusMode',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="home-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="content"
                        options={{
                            drawerLabel: 'Activities',
                            title: 'Activities',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="library-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="routines"
                        options={{
                            drawerLabel: 'Routines',
                            title: 'Routines',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="repeat-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="events"
                        options={{
                            drawerLabel: 'Schedule',
                            title: 'Schedule',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="calendar-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="engagements"
                        options={{
                            drawerLabel: 'Gigs',
                            title: 'Gigs',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="star-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />

                    <Drawer.Screen
                        name="pathfinder"
                        options={{
                            drawerLabel: 'Compass',
                            title: 'Compass',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="map-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="people"
                        options={{
                            drawerLabel: 'Contacts',
                            title: 'Contacts',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="people-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="settings"
                        options={{
                            drawerLabel: 'Settings',
                            title: 'Settings',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="settings-outline" size={size + 4} color={color} />
                            ),
                        }}
                    />
                    <Drawer.Screen
                        name="help"
                        options={{
                            drawerLabel: 'Help & FAQ',
                            title: 'Support',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name="help-circle-outline" size={size + 4} color={color} />
                            ),
                        }}
                        listeners={{
                            drawerItemPress: (e) => {
                                e.preventDefault();
                                router.push('/modal/help');
                            },
                        }}
                    />
                </Drawer>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    rail: {
        width: 72,
        // backgroundColor: '#fff', // controlled dynamically
        borderRightWidth: 1,
        // borderRightColor: '#f1f5f9', // controlled dynamically
        alignItems: 'center',
    },
    menuTrigger: {
        width: 48,
        height: 48,
        borderRadius: 16,
        // backgroundColor: '#eff6ff', 
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    separator: {
        width: 30,
        height: 1,
        // backgroundColor: '#f1f5f9',
        marginBottom: 20,
    },
    railItem: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderRadius: 16,
    },
    railItemActive: {
        // backgroundColor: '#f8fafc',
    },
    activeIndicator: {
        position: 'absolute',
        right: -11,
        width: 4,
        height: 24,
        // backgroundColor: '#2563eb', // controlled dynamically
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4,
    }
});

