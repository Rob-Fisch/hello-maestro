import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

export default function DebugPage() {
    const [events, setEvents] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkCloud = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: events, error } = await supabase
                    .from('events')
                    .select('*');
                setEvents(events || []);
                if (error) console.error(error);
            }
            setLoading(false);
        };
        checkCloud();
    }, []);

    if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

    return (
        <ScrollView contentContainerStyle={{ padding: 40 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>Cloud Debug</Text>

            <View style={{ marginBottom: 20, padding: 20, backgroundColor: '#f0f9ff', borderRadius: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Logged In User:</Text>
                <Text>{user ? `${user.email} (${user.id})` : 'NOT LOGGED IN'}</Text>
            </View>

            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Cloud Events ({events.length})</Text>
            {events.map(e => (
                <View key={e.id} style={{ marginBottom: 20, padding: 20, backgroundColor: '#f5f5f5', borderRadius: 10, borderLeftWidth: 4, borderLeftColor: '#2563eb' }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{e.title}</Text>
                    <Text>ID: {e.id}</Text>
                    <Text>Date: {e.date}</Text>

                    <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Slots (JSON):</Text>
                    <Text style={{ fontFamily: 'monospace', fontSize: 10 }}>{JSON.stringify(e.slots, null, 2)}</Text>

                    <Text style={{ marginTop: 10, fontWeight: 'bold' }}>Invite IDs Found:</Text>
                    {Array.isArray(e.slots) ? e.slots.map((s: any) => (
                        <Text key={s.id} style={{ color: '#2563eb', fontWeight: 'bold' }}>• {s.inviteId || 'NONE'}</Text>
                    )) : <Text>Slots is not an array</Text>}
                </View>
            ))}
        </ScrollView>
    );
}
