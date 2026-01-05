import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Href, router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { Alert, Platform, useWindowDimensions, View } from 'react-native';


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
    { name: 'help', icon: 'help-circle-outline', label: 'Help', path: '/modal/help' },
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
                                listeners={item.name === 'help' ? {
                                    drawerItemPress: (e) => {
                                        e.preventDefault();
                                        router.push('/modal/help');
                                    },
                                } : undefined}
                            />
                        );
                    })}

                    {/* Student Mode Toggle Item (Virtual) */}
                    <Drawer.Screen
                        name="student-mode-toggle"
                        options={{
                            drawerLabel: studentMode ? 'Exit Student Mode' : 'Student Mode',
                            title: 'Student Mode',
                            drawerIcon: ({ color, size }) => (
                                <Ionicons name={studentMode ? "school" : "school-outline"} size={size + 4} color={studentMode ? "#4f46e5" : color} />
                            ),
                            drawerLabelStyle: studentMode ? { color: '#4f46e5', fontWeight: 'bold' } : undefined
                        }}
                        listeners={{
                            drawerItemPress: (e) => {
                                e.preventDefault();
                                if (!studentMode) {
                                    // Preamble for Parents
                                    const title = "Enable Student Mode?";
                                    const message = "OpusMode is a learning tool sent by your teacher to assist with musical learning.\n\nStudent Mode creates a safe, distraction-free environment, removing financial and social features.\n\nEnable now?";

                                    Alert.alert(
                                        title,
                                        message,
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Enable",
                                                onPress: () => {
                                                    toggleStudentMode(true);
                                                    router.push('/studio');
                                                }
                                            }
                                        ]
                                    );
                                    // For Web compatibility
                                    if (Platform.OS === 'web') {
                                        const confirm = window.confirm(`${title}\n\n${message}`);
                                        if (confirm) {
                                            toggleStudentMode(true);
                                            router.push('/studio');
                                        }
                                    }
                                } else {
                                    toggleStudentMode(false);
                                }
                            },
                        }}
                    />
                </Drawer>
            </View>
        </View>

    );
}



