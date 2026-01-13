import { useTheme } from '@/lib/theme';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AboutModal() {
    const router = useRouter();
    const theme = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-slate-950">
            {/* Header */}
            <View className="px-6 flex-row items-center justify-between z-10" style={{ paddingTop: insets.top + 20 }}>
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 rounded-full bg-white/10 items-center justify-center backdrop-blur-md"
                >
                    <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg tracking-widest uppercase opacity-80">About</Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="items-center mt-8 px-6">
                    {/* Logo */}
                    <View className="w-32 h-32 mb-8 items-center justify-center rounded-3xl bg-black border border-white/10 shadow-2xl shadow-indigo-500/30 overflow-hidden">
                        <Image
                            source={require('../../assets/images/opusmode_om_logo_v9.png')}
                            style={{ width: '100%', height: '100%' }}
                            resizeMode="cover"
                        />
                    </View>

                    {/* Title */}
                    <Text className="text-white font-black text-4xl text-center mb-2 tracking-tighter shadow-lg">
                        OPUSMODE
                    </Text>
                    <Text className="text-indigo-400 font-bold text-xs tracking-[0.5em] text-center mb-12 uppercase">
                        For the Working Musician
                    </Text>

                    {/* Quote Card */}
                    <View className="bg-white/5 border border-white/10 p-8 rounded-3xl mb-12 relative w-full">
                        <Ionicons name="quote" size={48} color="white" className="absolute top-4 left-4 opacity-10" />
                        <Text className="text-zinc-200 font-medium italic text-xl text-center leading-relaxed">
                            "The tool I wish I had when I started gigging."
                        </Text>
                        <Text className="text-zinc-500 font-bold text-xs text-center mt-4 uppercase tracking-widest">
                            — Rob Fisch, Founder and Musician
                        </Text>
                    </View>

                    {/* The Story */}
                    <View className="w-full mb-12">
                        <Text className="text-slate-400 font-bold text-sm uppercase tracking-wider mb-4 border-b border-white/10 pb-2">
                            The Story
                        </Text>

                        <Text className="text-slate-300 text-base leading-7 mb-4">
                            My musical journey began with a "grand bargain" at age 6 to get my first piano lessons. Since then, I've never stopped chasing the sound.
                        </Text>
                        <Text className="text-slate-300 text-base leading-7 mb-4">
                            From studying trumpet with legends like <Text className="text-indigo-400 font-bold">Carmine Caruso</Text> and improvisation with <Text className="text-indigo-400 font-bold">John Lewis</Text> (MJQ), to hosting jazz radio in upstate NY, music has been my life's constant.
                        </Text>
                        <Text className="text-slate-300 text-base leading-7 mb-4">
                            In the late 90s, I launched the <Text className="italic text-slate-400">Jazz Friends Review</Text>, an early online community for jazz enthusiasts. Today, I continue to perform on trumpet and bass in the Berkshires while running Taconic Brass.
                        </Text>
                        <Text className="text-slate-300 text-base leading-7">
                            <Text className="font-bold text-white">OpusMode</Text> is the culmination of that lifetime of experience. It's built to handle the chaos of the gigging life—the setlists, the practice routines, the logistics—so you can focus on what matters most: <Text className="text-indigo-400 font-bold">The Music.</Text>
                        </Text>
                    </View>

                    {/* Footer Info */}
                    <View className="items-center opacity-50 mb-8">
                        <Text className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">
                            Designed & Developed in New York
                        </Text>
                        <Text className="text-[10px] text-slate-600">
                            v{Constants.expoConfig?.version} ({Constants.expoConfig?.extra?.buildNumber})
                        </Text>
                        <Text className="text-[10px] text-slate-600 mt-2">
                            © {new Date().getFullYear()} OpusMode. All rights reserved.
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}
