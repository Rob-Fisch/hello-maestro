import { getOtherPlatform, getPlatformDisplayName } from './platform';
import { supabase } from './supabase';

/**
 * Detect if user has data on the other platform (for upgrade prompts)
 */
export async function detectCrossPlatformData(userId: string): Promise<{
    hasOtherPlatformData: boolean;
    otherPlatformCounts: { events: number; songs: number; routines: number };
}> {
    const otherPlatform = getOtherPlatform();

    try {
        // Check a few key tables to see if there's data on the other platform
        const [eventsResult, songsResult, routinesResult] = await Promise.all([
            supabase
                .from('events')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('platform', otherPlatform),
            supabase
                .from('songs')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('platform', otherPlatform),
            supabase
                .from('routines')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('platform', otherPlatform),
        ]);

        const eventCount = eventsResult.count || 0;
        const songCount = songsResult.count || 0;
        const routineCount = routinesResult.count || 0;

        return {
            hasOtherPlatformData: eventCount > 0 || songCount > 0 || routineCount > 0,
            otherPlatformCounts: {
                events: eventCount,
                songs: songCount,
                routines: routineCount,
            },
        };
    } catch (err) {
        console.warn('[detectCrossPlatformData] Error:', err);
        return {
            hasOtherPlatformData: false,
            otherPlatformCounts: { events: 0, songs: 0, routines: 0 },
        };
    }
}

/**
 * Show merge prompt when Pro user has data on both platforms
 */
export function showCrossPlatformMergePrompt(
    otherPlatformCounts: { events: number; songs: number; routines: number },
    onMerge: () => void,
    onKeepSeparate: () => void
) {
    const { Alert } = require('react-native');
    const currentPlatformName = getPlatformDisplayName();
    const otherPlatformName = getPlatformDisplayName(getOtherPlatform());

    const message = `You have data on both ${currentPlatformName} and ${otherPlatformName}:

${currentPlatformName}: Current device
${otherPlatformName}: ${otherPlatformCounts.events} events, ${otherPlatformCounts.songs} songs, ${otherPlatformCounts.routines} routines

⚠️ Note: If you entered the same data on both platforms, you'll see duplicates after merging.

What would you like to do?`;

    Alert.alert('Merge Your Data?', message, [
        {
            text: `Keep ${currentPlatformName} Only`,
            style: 'cancel',
            onPress: onKeepSeparate,
        },
        {
            text: 'Merge All',
            onPress: onMerge,
        },
    ]);
}
