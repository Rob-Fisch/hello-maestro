import LandingPage from '@/components/landing/LandingPage';
import { useContentStore } from '@/store/contentStore';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function Index() {
    const { profile } = useContentStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <View className="flex-1 bg-slate-950" />;

    // If logged in, go to app
    if (profile?.id) {
        return <Redirect href="/(drawer)" />;
    }

    // Otherwise, show Marketing Site
    return <LandingPage />;
}
