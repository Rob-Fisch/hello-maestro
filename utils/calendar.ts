import * as Calendar from 'expo-calendar';
import { Platform, Alert, Linking } from 'react-native';
import { AppEvent } from '@/store/types';

/**
 * Requests calendar permissions with specific handling for iOS 17+ permission tiers.
 */
export async function requestCalendarPermissions() {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    console.log('[Calendar Permission Status]:', status);

    // 'granted' = Full Access, 'limited' = Add Events Only
    return {
        authorized: status === 'granted' || (status as any) === 'limited',
        isLimited: (status as any) === 'limited'
    };
}

/**
 * Aggressively searches for a writeable calendar on the device.
 */
export async function findBestCalendarId() {
    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);

    if (calendars.length === 0) return null;

    // 1. Try to find the system primary calendar
    const primary = calendars.find(cal => cal.isPrimary && cal.allowsModifications);
    if (primary) return primary.id;

    // 2. Try to find an iCloud calendar (preferred on Apple devices)
    const icloud = calendars.find(cal => cal.source?.name === 'iCloud' && cal.allowsModifications);
    if (icloud) return icloud.id;

    // 3. Fallback to any calendar that allows modifications
    const writeable = calendars.find(cal => cal.allowsModifications);
    if (writeable) return writeable.id;

    // 4. Absolute fallback to the first one available
    return calendars[0].id;
}

export async function addToNativeCalendar(event: AppEvent) {
    try {
        const { authorized, isLimited } = await requestCalendarPermissions();

        if (!authorized) {
            Alert.alert(
                'Permission Needed',
                'OpusMode needs "Full Access" to your calendar to automatically find your default schedule. Please enable it in Settings.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
            return false;
        }

        const calendarId = await findBestCalendarId();

        if (!calendarId) {
            // If we are "Limited", we often can't see the calendar list at all.
            const message = isLimited
                ? 'Apple restricts "Add Events Only" access, which prevents the app from finding your calendar. Please change permission to "Full Access" in Settings for a seamless experience.'
                : 'Could not find a writeable calendar on this device. Please check your Calendar app settings.';

            Alert.alert(
                'Calendar Not Found',
                message,
                [
                    { text: 'OK' },
                    { text: 'Open Settings', onPress: () => Linking.openSettings() }
                ]
            );
            return false;
        }

        // Parse start time
        const [hours, minutes] = (event.time || '12:00').split(':').map(Number);
        const startDate = new Date(event.date);
        startDate.setHours(hours, minutes, 0, 0);

        // Calculate end time
        const duration = event.duration || 60;
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const calendarEvent: Partial<Calendar.Event> = {
            title: event.title,
            startDate,
            endDate,
            location: event.venue,
            notes: event.notes,
            timeZone: 'GMT', // Using GMT or device local
        };

        await Calendar.createEventAsync(calendarId, calendarEvent);
        Alert.alert('Success', `"${event.title}" has been added to your calendar!`);
        return true;

    } catch (error: any) {
        console.error('Failed to add to calendar:', error);
        Alert.alert('Calendar Error', `Could not add event: ${error.message}`);
        return false;
    }
}
