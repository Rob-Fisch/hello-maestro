import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useWindowDimensions } from 'react-native';

export default function DrawerLayout() {
    const { width } = useWindowDimensions();
    const isLargeScreen = width >= 767;

    return (
        <Drawer
            screenOptions={{
                headerShown: true,
                drawerType: isLargeScreen ? 'permanent' : 'front',
                headerStyle: {
                    backgroundColor: '#fff',
                    borderBottomWidth: 1,
                    borderBottomColor: '#f3f4f6',
                },
                drawerStyle: {
                    width: isLargeScreen ? 280 : 250,
                    backgroundColor: '#fff',
                    borderRightWidth: 1,
                    borderRightColor: '#f3f4f6',
                },
                drawerActiveTintColor: '#2563eb',
                drawerInactiveTintColor: '#6b7280',
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
                headerTitleStyle: {
                    fontWeight: '800',
                    fontSize: 20,
                },
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: 'Home',
                    title: 'HelloMaestro',
                    drawerIcon: ({ color, size }) => (
                        <Ionicons name="home-outline" size={size + 4} color={color} />
                    ),
                }}
            />
            <Drawer.Screen
                name="content"
                options={{
                    drawerLabel: 'Library',
                    title: 'Content Library',
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
                name="people"
                options={{
                    drawerLabel: 'People',
                    title: 'People',
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
        </Drawer>
    );
}
