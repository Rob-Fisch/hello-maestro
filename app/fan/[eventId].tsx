import { Redirect, useLocalSearchParams } from 'expo-router';

/**
 * Backward compatibility redirect from old /fan/ route to new /promo/ route
 * This ensures that any previously shared links continue to work
 */
export default function FanRedirect() {
    const { eventId } = useLocalSearchParams<{ eventId: string }>();

    // Redirect to the new /promo/ route
    return <Redirect href={`/promo/${eventId}`} />;
}
