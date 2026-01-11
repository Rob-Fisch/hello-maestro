
import { useTheme } from '@/lib/theme';
import { useContentStore } from '@/store/contentStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingModal() {
    const router = useRouter();
    const theme = useTheme();
    const { settings, updateSettings } = useContentStore();

    const [step, setStep] = useState(0);
    const [selectedRoles, setSelectedRoles] = useState<string[]>(settings.roles || []);
    const [selectedGoals, setSelectedGoals] = useState<string[]>(settings.goals || []);

    const toggleSelection = (list: string[], item: string, setList: (l: string[]) => void) => {
        if (list.includes(item)) {
            setList(list.filter(i => i !== item));
        } else {
            setList([...list, item]);
        }
    };

    const ROLE_OPTIONS = [
        { id: 'Band Leader', icon: 'people', description: 'I manage bookings & rosters' },
        { id: 'Sideman', icon: 'musical-note', description: 'I play in bands' },
        { id: 'Solo Artist', icon: 'mic', description: 'I perform solo' },
        { id: 'Teacher', icon: 'school', description: 'I run a studio' },
        { id: 'Student', icon: 'book', description: 'I take lessons' },
        { id: 'Hobbyist', icon: 'heart', description: 'I play for fun' },
    ];

    const GOAL_OPTIONS = [
        { id: 'Organize Gigs', icon: 'calendar', description: 'Manage dates & contracts' },
        { id: 'Practice Routine', icon: 'layers', description: 'Build structured habits' },
        { id: 'Manage Roster', icon: 'file-tray-full', description: 'Keep track of contacts' },
        { id: 'Scout Talent', icon: 'telescope', description: 'Find new musicians' },
        { id: 'Teach', icon: 'easel', description: 'Manage students & materials' },
    ];

    const saveAndExit = () => {
        updateSettings({ roles: selectedRoles, goals: selectedGoals });
        router.back();
    };

    const renderStep0_Welcome = () => (
        <View className="flex-1 items-center justify-center px-6">
            <View className="w-24 h-24 bg-indigo-500/20 rounded-full items-center justify-center mb-8">
                <Ionicons name="sparkles" size={48} color="#818cf8" />
            </View>
            <Text className="text-3xl font-black text-white text-center mb-4">
                Welcome to OpusMode
            </Text>
            <Text className="text-slate-400 text-center text-lg mb-12 leading-relaxed">
                Your command center for total musical agency. Let's tailor the experience to your needs.
            </Text>
            <TouchableOpacity
                onPress={() => setStep(1)}
                className="w-full bg-indigo-600 py-4 rounded-xl items-center"
            >
                <Text className="text-white font-bold text-lg">Let's Go</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep1_Roles = () => (
        <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-black text-white mb-2">Who are you?</Text>
            <Text className="text-slate-400 mb-8">Select all that apply.</Text>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="flex-row flex-wrap justify-between">
                    {ROLE_OPTIONS.map((role) => {
                        const isSelected = selectedRoles.includes(role.id);
                        return (
                            <TouchableOpacity
                                key={role.id}
                                onPress={() => toggleSelection(selectedRoles, role.id, setSelectedRoles)}
                                className={`w-[48%] mb-4 p-4 rounded-2xl border ${isSelected ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800/50 border-slate-700'}`}
                            >
                                <Ionicons name={role.icon as any} size={24} color={isSelected ? '#818cf8' : '#94a3b8'} style={{ marginBottom: 12 }} />
                                <Text className={`font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{role.id}</Text>
                                <Text className="text-[10px] text-slate-500 leading-tight">{role.description}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            <TouchableOpacity
                onPress={() => setStep(2)}
                className={`w-full py-4 rounded-xl items-center mt-4 mb-8 ${selectedRoles.length > 0 ? 'bg-indigo-600' : 'bg-slate-700'}`}
                disabled={selectedRoles.length === 0}
            >
                <Text className={`font-bold text-lg ${selectedRoles.length > 0 ? 'text-white' : 'text-slate-400'}`}>Next</Text>
            </TouchableOpacity>
        </View>
    );

    const renderStep2_Goals = () => (
        <View className="flex-1 px-6 pt-8">
            <Text className="text-2xl font-black text-white mb-2">What's your focus?</Text>
            <Text className="text-slate-400 mb-8">This helps us highlight tools for you.</Text>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                {GOAL_OPTIONS.map((goal) => {
                    const isSelected = selectedGoals.includes(goal.id);
                    return (
                        <TouchableOpacity
                            key={goal.id}
                            onPress={() => toggleSelection(selectedGoals, goal.id, setSelectedGoals)}
                            className={`w-full mb-3 p-4 rounded-2xl border flex-row items-center ${isSelected ? 'bg-indigo-600/20 border-indigo-500' : 'bg-slate-800/50 border-slate-700'}`}
                        >
                            <View className={`p-2 rounded-full mr-4 ${isSelected ? 'bg-indigo-500/20' : 'bg-slate-700/50'}`}>
                                <Ionicons name={goal.icon as any} size={20} color={isSelected ? '#818cf8' : '#94a3b8'} />
                            </View>
                            <View>
                                <Text className={`font-bold text-lg ${isSelected ? 'text-white' : 'text-slate-300'}`}>{goal.id}</Text>
                                <Text className="text-xs text-slate-500">{goal.description}</Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            <View className="flex-row gap-4 mb-8 mt-4">
                <TouchableOpacity
                    onPress={() => setStep(1)}
                    className="flex-1 py-4 rounded-xl items-center bg-slate-800"
                >
                    <Text className="text-slate-400 font-bold">Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setStep(3)}
                    className={`flex-2 py-4 rounded-xl items-center px-8 ${selectedGoals.length > 0 ? 'bg-indigo-600' : 'bg-slate-700'}`}
                    disabled={selectedGoals.length === 0}
                >
                    <Text className={`font-bold text-lg ${selectedGoals.length > 0 ? 'text-white' : 'text-slate-400'}`}>Next</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderStep3_Finish = () => (
        <View className="flex-1 items-center justify-center px-6">
            <View className="w-20 h-20 bg-emerald-500/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="checkmark" size={40} color="#34d399" />
            </View>
            <Text className="text-2xl font-black text-white text-center mb-4">
                You're All Set!
            </Text>
            <Text className="text-slate-400 text-center mb-12">
                We've customized your experience. You can always change these in Settings.
            </Text>

            {/* Personalized Suggestion */}
            {selectedRoles.includes('Band Leader') && (
                <View className="w-full bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
                    <Text className="text-indigo-400 font-bold uppercase text-xs mb-1">Recommended</Text>
                    <Text className="text-white font-bold">Check out "Performance Management"</Text>
                    <Text className="text-slate-500 text-xs">To manage your gigs and contracts.</Text>
                </View>
            )}

            {selectedRoles.includes('Student') && (
                <View className="w-full bg-slate-800/50 p-4 rounded-xl mb-4 border border-slate-700">
                    <Text className="text-indigo-400 font-bold uppercase text-xs mb-1">Recommended</Text>
                    <Text className="text-white font-bold">Check out "Studio"</Text>
                    <Text className="text-slate-500 text-xs">To build your practice routines.</Text>
                </View>
            )}

            <TouchableOpacity
                onPress={saveAndExit}
                className="w-full bg-white py-4 rounded-xl items-center mt-4"
            >
                <Text className="text-black font-black text-lg">Go to Dashboard</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-slate-950">
            {/* Header / Close */}
            <View className="flex-row justify-between items-center p-6 pt-12">
                <View className="h-1 flex-1 bg-slate-800 rounded-full mr-4 overflow-hidden">
                    <View
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-slate-500 font-bold">Close</Text>
                </TouchableOpacity>
            </View>

            {step === 0 && renderStep0_Welcome()}
            {step === 1 && renderStep1_Roles()}
            {step === 2 && renderStep2_Goals()}
            {step === 3 && renderStep3_Finish()}
        </View>
    );
}
