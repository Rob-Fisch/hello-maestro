import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useContentStore } from '@/store/contentStore';
import { useRouter, Link, useNavigation } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { useEffect } from 'react';
import { useTheme } from '@/lib/theme';

export default function HomeScreen() {
    const { blocks, routines, events, profile, syncStatus, fullSync, recentModuleIds, trackModuleUsage } = useContentStore();

    const router = useRouter();
    const navigation = useNavigation();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    const todayDay = today.getDay();

    const todaysRoutines = (routines || []).filter(r => {
        if (!r.schedule) return false;
        if (r.schedule.type === 'date' && r.schedule.date === todayStr) return true;
        if (r.schedule.type === 'recurring' && r.schedule.daysOfWeek?.includes(todayDay)) {
            const start = r.schedule.startDate ? new Date(r.schedule.startDate + 'T00:00:00') : null;
            const end = r.schedule.endDate ? new Date(r.schedule.endDate + 'T23:59:59') : null;
            if ((!start || today >= start) && (!end || today <= end)) return true;
        }
        return false;
    });

    const todaysEvents = (events || []).filter(e => {
        if (e.schedule?.type === 'recurring') {
            const { startDate, endDate, daysOfWeek } = e.schedule;
            if (!startDate || !endDate || !daysOfWeek) return false;
            const start = new Date(startDate + 'T00:00:00');
            const end = new Date(endDate + 'T23:59:59');
            return today >= start && today <= end && daysOfWeek.includes(todayDay);
        }
        return e.date === todayStr;
    });

    // Map of all possible modules
    const moduleMap: Record<string, { title: string, icon: any, color: string, path: any }> = {
        'modal/routine-editor': { title: 'New Routine', icon: 'add-circle-outline', path: '/modal/routine-editor', color: 'bg-blue-500' },
        'content': { title: 'Activities', icon: 'library-outline', path: '/content', color: 'bg-purple-500' },
        'events': { title: 'Schedule', icon: 'calendar-outline', path: '/events', color: 'bg-green-500' },
        'routines': { title: 'Routines', icon: 'list-outline', path: '/routines', color: 'bg-orange-500' },
        'people': { title: 'Contacts', icon: 'people-outline', path: '/people', color: 'bg-indigo-500' },
        'pathfinder': { title: 'Compass', icon: 'map-outline', path: '/pathfinder', color: 'bg-rose-500' },
        'engagements': { title: 'Gigs', icon: 'star-outline', path: '/engagements', color: 'bg-amber-500' },
        'settings': { title: 'Settings', icon: 'settings-outline', path: '/settings', color: 'bg-gray-500' },
    };

    const quickActions = recentModuleIds.map(id => moduleMap[id]).filter(Boolean);
    const isMock = profile?.id.startsWith('mock-');

    return (
        <ScrollView className="flex-1 p-6" style={{ backgroundColor: theme.background }}>
            <View className="mb-8 px-2" style={{ marginTop: Math.max(insets.top, 20) }}>
                <View className="flex-row justify-between items-start mb-10">
                    <View className="flex-1 mr-4">
                        <Text className="text-[10px] font-black uppercase tracking-[3px] mb-2 px-1" style={{ color: theme.primary }}>Control Center</Text>
                        <Text className="text-5xl font-black tracking-tighter leading-[48px]" style={{ color: theme.text }}>
                            {profile?.displayName ? `Hello, ${profile.displayName}!` : 'OpusMode'}
                        </Text>

                    </View>


                    <TouchableOpacity
                        onPress={() => {
                            if (isMock) {
                                Alert.alert('Offline Mode', 'You are currently in a mock session. Sign in with a real account to enable cloud sync.');
                            } else {
                                fullSync();
                            }
                        }}
                        className={`flex-row items-center px-4 py-2 rounded-2xl border min-w-[100px] justify-center shadow-sm ${syncStatus === 'synced' ? 'bg-green-50 border-green-100' :
                            syncStatus === 'syncing' ? 'bg-blue-50 border-blue-100' :
                                'bg-gray-50 border-gray-100'
                            }`}
                    >
                        <View className={`w-2 h-2 rounded-full mr-2 ${syncStatus === 'synced' ? 'bg-green-500' :
                            syncStatus === 'syncing' ? 'bg-blue-500' :
                                'bg-gray-400'
                            }`} />
                        <Text className={`text-[10px] font-black uppercase tracking-normal ${syncStatus === 'synced' ? 'text-green-700' :
                            syncStatus === 'syncing' ? 'text-blue-700' :
                                'text-gray-500'
                            }`}>
                            {syncStatus === 'synced' ? 'Synced' : syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
                        </Text>
                    </TouchableOpacity>
                </View>

                {isMock && (
                    <View className="border p-4 rounded-2xl mb-6 flex-row items-center" style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
                        <Ionicons name="cloud-offline-outline" size={20} color="#d97706" />
                        <Text className="text-amber-700 font-bold ml-3 text-xs flex-1">
                            Storage is local-only. Sign in to push your {routines.length + blocks.length} items to the cloud.
                        </Text>
                    </View>
                )}


                {/* Separator and Global Menu Trigger */}
                <View className="flex-row items-center mb-6">
                    <TouchableOpacity
                        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                        className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm border mr-4"
                        style={{ backgroundColor: theme.card, borderColor: theme.border }}
                    >
                        <Ionicons name="menu-outline" size={24} color={theme.text} />
                    </TouchableOpacity>
                    <View className="flex-1 h-[1px]" style={{ backgroundColor: theme.border }} />
                </View>

                <View className="mb-10">
                    <Text className="font-medium text-lg leading-7 px-1" style={{ color: theme.mutedText }}>
                        We have organized your schedule and practice routines for today.
                    </Text>
                </View>

            </View>

            {/* Today's Events */}
            <View className="p-10 rounded-card shadow-2xl shadow-blue-400/30 mb-10 border border-blue-400/20" style={{ backgroundColor: theme.primary }}>
                <View className="flex-row items-center mb-8">
                    <View className="bg-white/20 p-2 rounded-xl">
                        <Ionicons name="sparkles" size={20} color="white" />
                    </View>
                    <Text className="text-2xl font-black ml-3 text-white tracking-tight">Today&apos;s Gigs & Events</Text>
                </View>

                {todaysEvents.length === 0 ? (
                    <View className="bg-white/5 p-6 rounded-[32px] border border-white/10 items-center">
                        <Text className="text-white font-bold text-center opacity-90">No performances or lessons today.</Text>
                        <Text className="text-white text-[10px] font-black uppercase mt-1 tracking-widest opacity-60">Open Schedule</Text>
                    </View>
                ) : (
                    <View>
                        {todaysEvents.map((item) => (
                            <Link key={item.id} href={{ pathname: '/modal/event-editor', params: { id: item.id } }} asChild>
                                <TouchableOpacity className="flex-row items-center py-6 border-b border-white/10 last:border-b-0">
                                    <View className="flex-1">
                                        <Text className="text-2xl font-black text-white tracking-tight">{item.title}</Text>
                                        <View className="flex-row items-center mt-1.5">
                                            <View className="bg-white/20 px-2 py-0.5 rounded-md mr-2">
                                                <Text className="text-[10px] text-white font-black uppercase tracking-widest">{item.type}</Text>
                                            </View>
                                            <Text className="text-white text-xs font-bold uppercase tracking-widest opacity-80">
                                                {item.time} • {item.venue}
                                            </Text>
                                        </View>
                                    </View>
                                    <View className="bg-white/10 w-10 h-10 rounded-full items-center justify-center">
                                        <Ionicons name="chevron-forward" size={20} color="white" />
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        ))}
                    </View>
                )}
            </View>


            <View className="p-10 rounded-card shadow-sm border mb-10" style={{ backgroundColor: theme.card, borderColor: theme.border }}>
                <View className="flex-row items-center mb-8">
                    <View className="p-2 rounded-xl" style={{ backgroundColor: `${theme.primary}15` }}>
                        <Ionicons name="time" size={20} color={theme.primary} />
                    </View>
                    <Text className="text-2xl font-black ml-3 tracking-tight" style={{ color: theme.text }}>Practice Routines</Text>
                </View>


                {todaysRoutines.length === 0 ? (
                    <View className="py-6 items-center">
                        <Text className="text-gray-400 italic text-lg">No routines scheduled for today.</Text>
                        <TouchableOpacity
                            onPress={() => {
                                trackModuleUsage('routines');
                                router.push('/routines');
                            }}
                            className="mt-4 px-6 py-3 rounded-2xl"
                            style={{ backgroundColor: `${theme.primary}15` }}
                        >
                            <Text className="font-bold text-base" style={{ color: theme.primary }}>Browse All Routines →</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View>
                        {todaysRoutines.map((item) => (
                            <Link key={item.id} href={{ pathname: '/modal/routine-editor', params: { id: item.id } }} asChild>
                                <TouchableOpacity
                                    onPress={() => trackModuleUsage('modal/routine-editor')}
                                    className="flex-row items-center py-6 border-b last:border-b-0"
                                    style={{ borderBottomColor: theme.border }}
                                >
                                    <View className="w-16 h-16 rounded-[24px] items-center justify-center mr-5 shadow-sm border" style={{ backgroundColor: theme.background, borderColor: theme.border }}>
                                        <Ionicons name="play" size={24} color={theme.primary} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-xl font-black tracking-tight" style={{ color: theme.text }}>{item.title}</Text>
                                        <Text className="text-sm font-bold mt-0.5" style={{ color: theme.mutedText }}>{item.blocks.length} Practice Blocks</Text>
                                    </View>
                                    <View className="w-8 h-8 rounded-full items-center justify-center" style={{ backgroundColor: theme.background }}>
                                        <Ionicons name="chevron-forward" size={18} color={theme.mutedText} />
                                    </View>
                                </TouchableOpacity>
                            </Link>
                        ))}

                    </View>
                )}
            </View>

            <Text className="text-2xl font-black mb-6 px-2 tracking-tight" style={{ color: theme.text }}>Quick Actions</Text>
            <View className="flex-row flex-wrap justify-between px-1">
                {quickActions.map((action, index) => (
                    <Link key={index} href={action.path} asChild>
                        <TouchableOpacity
                            onPress={() => trackModuleUsage(action.path.startsWith('/') ? action.path.slice(1) : action.path)}
                            className="w-[48%] mb-6 p-8 rounded-card border flex-col items-center shadow-lg shadow-gray-200/50"
                            style={{ backgroundColor: theme.card, borderColor: theme.border }}
                        >
                            <View className={`w-16 h-16 rounded-[24px] items-center justify-center mb-5 shadow-inner ${action.color}`}>
                                <Ionicons name={action.icon} size={30} color="white" />
                            </View>
                            <Text className="text-lg font-black tracking-tight text-center leading-5" style={{ color: theme.text }}>{action.title}</Text>
                            <Text className="text-[10px] font-black uppercase tracking-widest mt-2" style={{ color: theme.mutedText }}>{action.title === 'Activities' ? 'Assets' : 'Manage'}</Text>
                        </TouchableOpacity>
                    </Link>
                ))}

            </View>
            <View className="h-20" />
        </ScrollView>
    );
}
