import { AppEvent } from '@/store/types';
import * as Calendar from 'expo-calendar';
import { Alert, Linking, Platform } from 'react-native';

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
    return addUnifiedToCalendar({
        title: event.title,
        date: event.date,
        time: event.time,
        venue: event.venue,
        notes: event.notes,
        duration: event.duration
    });
}

export interface CalendarItem {
    title: string;
    date: string;
    time: string;
    venue?: string;
    notes?: string;
    duration?: number;
}

export async function addUnifiedToCalendar(item: CalendarItem) {
    // Web Fallback: Use synchronous helper
    if (Platform.OS === 'web') {
        return downloadIcs(item);
    }

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
        const [hours, minutes] = (item.time || '12:00').split(':').map(Number);
        const startDate = new Date(item.date + 'T00:00:00');
        startDate.setHours(hours, minutes, 0, 0);

        // Calculate end time
        const duration = item.duration || 60;
        const endDate = new Date(startDate.getTime() + duration * 60000);

        const calendarEvent: Partial<Calendar.Event> = {
            title: item.title,
            startDate,
            endDate,
            location: item.venue,
            notes: item.notes,
            timeZone: 'GMT',
        };

        await Calendar.createEventAsync(calendarId, calendarEvent);
        Alert.alert('Success', `"${item.title}" has been added to your calendar!`);
        return true;

    } catch (error: any) {
        console.error('Failed to add to calendar:', error);
        Alert.alert('Calendar Error', `Could not add event: ${error.message}`);
        return false;
    }
}

export function openGoogleCalendar(item: CalendarItem) {
    const [hours, minutes] = (item.time || '12:00').split(':').map(Number);
    const startDate = new Date(item.date + 'T00:00:00');
    startDate.setHours(hours, minutes, 0, 0);

    const duration = item.duration || 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const url = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(item.title)}` +
        `&dates=${formatDate(startDate)}/${formatDate(endDate)}` +
        `&details=${encodeURIComponent(item.notes || '')}` +
        `&location=${encodeURIComponent(item.venue || '')}`;

    Linking.openURL(url);
}

export function downloadIcs(item: CalendarItem) {
    const [hours, minutes] = (item.time || '12:00').split(':').map(Number);
    const startDate = new Date(item.date + 'T00:00:00');
    startDate.setHours(hours, minutes, 0, 0);

    const duration = item.duration || 60;
    const endDate = new Date(startDate.getTime() + duration * 60000);

    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `SUMMARY:${item.title}`,
        `DTSTART:${formatDate(startDate)}`,
        `DTEND:${formatDate(endDate)}`,
        `LOCATION:${item.venue || ''}`,
        `DESCRIPTION:${item.notes || ''}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    const filename = `${(item.title || 'event').replace(/[^a-zA-Z0-9_\-]/g, '_')}.ics`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }, 100);

    return true;
}
