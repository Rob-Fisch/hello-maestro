
import { supabase } from '@/lib/supabase';
import { useContentStore } from '@/store/contentStore';
import { Routine } from '@/store/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';

export default function PublicRoutinePage() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { profile, addRoutine } = useContentStore();

    const [loading, setLoading] = useState(true);
    const [routine, setRoutine] = useState<any | null>(null); // Using any for raw fetch, then map to Routine
    const [teacherProfile, setTeacherProfile] = useState<any>(null);
    const [cloning, setCloning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRoutine();
    }, [id]);

    const fetchRoutine = async () => {
        if (!id) return;
        try {
            // Fetch Routine (Must be public)
            const { data: rData, error: rError } = await supabase
                .from('routines')
                .select('*')
                .eq('id', id)
                .single();

            if (rError || !rData) throw rError || new Error("Routine not found");
            if (!rData.is_public) throw new Error("This lesson plan is private.");

            // Expiration Check
            if (rData.expires_at) {
                const expiry = new Date(rData.expires_at);
                if (new Date() > expiry) {
                    throw new Error("This link has expired.");
                }
            }

            setRoutine(rData);

            // Fetch Teacher
            const { data: pData } = await supabase
                .from('profiles')
                .select('display_name, avatar_url')
                .eq('id', rData.user_id)
                .single();

            setTeacherProfile(pData);

        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Could not load lesson plan');
        } finally {
            setLoading(false);
        }
    };

    const handleClone = async () => {
        if (!profile) {
            // If not logged in, redirect to auth with return url
            // For now, just alert or simple redirect
            Alert.alert("Log In Required", "Please log in to add this lesson to your library.", [
                { text: "Log In", onPress: () => router.push('/auth') },
                { text: "Cancel", style: 'cancel' }
            ]);
            return;
        }

        setCloning(true);
        try {
            // 1. Prepare Deep Copy
            const newRoutineId = uuid.v4().toString();

            // We need to fetch the blocks first? 
            // Actually, in our simple model 'blocks' is a JSONB column on 'routines'?
            // Wait, checking types.ts -> Routine has `blocks: ContentBlock[]`.
            // In Supabase, if it's a jsonb column `blocks`, we just copy it.
            // If it's a relation, we'd need to fetch them.
            // Based on previous files, `blocks` seems to be stored in the `routines` table as JSON or we fetch it.
            // Looking at fetchRoutine above -> `select('*')`.
            // Assuming `blocks` is in the returned object.

            const newRoutine: Routine = {
                id: newRoutineId,
                title: routine.title, // Keep name or add (Copy)? Keep name is cleaner for assignments.
                description: routine.description,
                blocks: routine.blocks || [], // Deep copy happens effectively here as we create new array
                createdAt: new Date().toISOString(),
                isPublic: false, // Private copy
                originalRoutineId: routine.id,
                clonedFromUserId: routine.user_id,
                schedule: { type: 'none' } // Reset schedule
            };

            // 2. Add to Local Store (which syncs to backend)
            await addRoutine(newRoutine);

            // 3. Navigate away immediately for better feedback
            // Using replace to prevent going back to "Add" screen on back press
            router.replace('/(drawer)/routines');

            // Optional: Web Alert if needed, but navigation is usually enough
            if (Platform.OS === 'web') {
                // router.replace should work
            }

        } catch (err) {
            Alert.alert("Error", "Could not clone routine.");
        } finally {
            setCloning(false);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50">
                <ActivityIndicator size="large" color="#4f46e5" />
            </View>
        );
    }

    if (error || !routine) {
        return (
            <View className="flex-1 items-center justify-center bg-slate-50 px-6">
                <Ionicons name="lock-closed-outline" size={64} color="#94a3b8" />
                <Text className="text-slate-500 mt-4 text-center font-medium">{error || 'Lesson not found'}</Text>
                <TouchableOpacity onPress={() => router.replace('/')} className="mt-8">
                    <Text className="text-indigo-600 font-bold">Return Home</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
                {/* HEADER */}
                <View className="bg-indigo-600 pt-16 pb-12 px-6 rounded-b-[40px] shadow-xl relative overflow-hidden">
                    {/* Brand Top Right */}
                    <View className="absolute top-12 right-6 flex-row items-center opacity-80">
                        <View className="w-6 h-6 bg-indigo-400 rounded-lg items-center justify-center mr-2">
                            <Ionicons name="musical-note" size={14} color="white" />
                        </View>
                        <Text className="text-white font-black tracking-widest text-[10px]">OPUSMODE</Text>
                    </View>

                    <Text className="text-indigo-200 text-xs font-black uppercase tracking-widest mb-2 mt-8">Lesson Plan</Text>
                    <Text className="text-4xl font-black text-white mb-6 leading-tight shadow-sm">{routine.title}</Text>

                    <View className="flex-row items-center bg-white/10 self-start py-2 pl-2 pr-4 rounded-full border border-white/10">
                        <View className="w-8 h-8 bg-indigo-400 rounded-full mr-3 items-center justify-center border border-indigo-300">
                            <Text className="text-white text-xs font-bold">
                                {teacherProfile?.display_name?.charAt(0) || 'T'}
                            </Text>
                        </View>
                        <View>
                            <Text className="text-indigo-100 text-[10px] font-medium uppercase tracking-wide">Shared by</Text>
                            <Text className="text-white font-bold text-sm">
                                {teacherProfile?.display_name || 'Expert Teacher'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* INFO */}
                <View className="px-6 py-8">
                    {routine.description && (
                        <Text className="text-slate-600 text-lg leading-relaxed mb-8 font-medium">
                            {routine.description}
                        </Text>
                    )}

                    <View className="flex-row items-center mb-6">
                        <Ionicons name="list" size={24} color="#4f46e5" style={{ marginRight: 10 }} />
                        <Text className="text-2xl font-black text-slate-900">Items ({routine.blocks?.length || 0})</Text>
                    </View>

                    {/* ITEMS LIST (PREVIEW) */}
                    <View className="gap-4">
                        {routine.blocks?.map((block: any, i: number) => (
                            <View key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex-row items-center">
                                <View className="w-8 h-8 bg-white rounded-full items-center justify-center border border-slate-200 mr-4 shadow-sm">
                                    <Text className="text-slate-400 font-black text-xs">{i + 1}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="text-slate-900 font-bold text-base mb-1">{block.title}</Text>
                                    <View className="flex-row gap-2">
                                        {block.tags?.map((tag: string) => (
                                            <Text key={tag} className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md overflow-hidden">{tag}</Text>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* MARKETING FOOTER */}
                <View className="items-center pb-10 px-6 opacity-60">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-[4px] mb-2">Powered by</Text>
                    <View className="flex-row items-center gap-2 mb-4">
                        <View className="w-6 h-6 bg-slate-400 rounded-lg items-center justify-center">
                            <Ionicons name="musical-note" size={14} color="white" />
                        </View>
                        <Text className="text-slate-500 font-black text-lg tracking-[4px]">OPUSMODE</Text>
                    </View>
                    <Text className="text-slate-400 text-center text-xs px-8 leading-relaxed mb-4">
                        OpusMode is a professional learning tool sent by {teacherProfile?.display_name || 'your teacher'} to assist with musical learning and daily practice.
                    </Text>
                    <TouchableOpacity onPress={() => Linking.openURL('https://opusmode.net')}>
                        <Text className="text-indigo-500 font-bold text-xs">Visit opusmode.net</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* ACTION FOOTER */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-slate-100 shadow-2xl safe-bottom">
                {!profile ? (
                    <View>
                        <Text className="text-center text-slate-800 font-bold mb-3">
                            Log in to save this lesson plan
                        </Text>
                        <TouchableOpacity
                            onPress={() => {
                                const redirectUrl = `/routine/${id}`;
                                router.push(`/auth?redirectTo=${encodeURIComponent(redirectUrl)}`);
                            }}
                            className="bg-slate-900 w-full py-4 rounded-2xl items-center shadow-lg shadow-slate-200"
                        >
                            <Text className="text-white font-black text-lg">Log In / Sign Up</Text>
                        </TouchableOpacity>
                        <Text className="text-center text-slate-400 text-[10px] mt-3 leading-tight px-4">
                            You must be logged in to OpusMode to add this shared routine to your library.
                        </Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={handleClone}
                        disabled={cloning}
                        className="bg-indigo-600 w-full py-4 rounded-2xl items-center shadow-lg shadow-indigo-200 flex-row justify-center"
                    >
                        {cloning ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="download-outline" size={24} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-black text-lg">Add to My Library</Text>
                            </>
                        )}
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}
