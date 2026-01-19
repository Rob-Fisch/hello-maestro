import { useContentStore } from '@/store/contentStore';
import { AppEvent, AppEventType, BookingSlot } from '@/store/types';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import uuid from 'react-native-uuid';

export type EventFormValues = Omit<AppEvent, 'id' | 'createdAt' | 'updatedAt'>;

export interface UseEventFormProps {
    existingEvent?: AppEvent;
    initialType?: AppEventType;
    onSaveSuccess?: () => void;
}

export function useEventForm({ existingEvent, initialType = 'performance', onSaveSuccess }: UseEventFormProps) {
    const { addEvent, updateEvent } = useContentStore();

    // Initial State Factory
    const getInitialState = (): EventFormValues => {
        if (existingEvent) {
            const { id, createdAt, ...rest } = existingEvent;

            // HYDRATION: Fix missing slots from legacy personnelIds (Zombie Roster Fix)
            let slots = rest.slots || [];
            if (slots.length === 0 && rest.personnelIds && rest.personnelIds.length > 0) {
                console.log('[useEventForm] Hydrating slots from personnelIds:', rest.personnelIds);
                slots = rest.personnelIds.map(pid => ({
                    id: uuid.v4() as string,
                    role: 'Musician',
                    status: 'confirmed',
                    musicianId: pid,
                    instruments: []
                } as BookingSlot));
            }

            return { ...rest, slots };
        }

        // Defaults for new event
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return {
            type: initialType,
            title: '',
            venue: '',
            date: `${year}-${month}-${day}`,
            time: '20:00',
            duration: 60,
            notes: '',
            slots: [],
            routines: [],
            totalFee: '',
            musicianFee: '',
            // Venue Address (Structured)
            venueAddressLine1: '',
            venueAddressLine2: '',
            venueCity: '',
            venueStateProvince: '',
            venuePostalCode: '',
            venueCountry: '',
            // Performer Page
            isPerformerPageEnabled: false,
            loadInTime: '',
            soundcheckTime: '',
            // Performance Promo (renamed from Stage Plot)
            isPublicPromo: false,
            showSetlist: false
        } as EventFormValues;
    };

    const [values, setValues] = useState<EventFormValues>(getInitialState());
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Internal ID tracking - GENERATE UPFRONT for new events so set list etc can link immediately
    const [internalId, setInternalId] = useState<string | undefined>(
        existingEvent?.id || (uuid.v4() as string)
    );

    // Track initial values for dirty checking? 
    // For now, simple "touched" approach might be enough or comparing JSON strings.

    const handleChange = <K extends keyof EventFormValues>(field: K, value: EventFormValues[K]) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    // Debounce Logic for Auto-Save
    const saveTimeout = useRef<NodeJS.Timeout | null>(null);

    const save = useCallback(async (silent = false) => {
        if (!values.title?.trim()) {
            if (!silent) Alert.alert('Validation Check', 'Please enter a Title.');
            return false;
        }

        setIsSaving(true);

        try {
            console.log('[useEventForm] Starting Save...');

            // Use internalId if available (Edit Mode), otherwise generate new (Create Mode)
            const eventId = internalId || existingEvent?.id || (uuid.v4() as string);
            console.log('[useEventForm] Target ID:', eventId);

            const payload: AppEvent = {
                id: eventId,
                createdAt: existingEvent?.createdAt || new Date().toISOString(),
                ...values,
                // Ensure optional fields are handled if undefined in values
            };

            // Determing if we are updating or creating
            // strict check: if we have an internalId or existingEvent, we update.
            const isUpdate = !!internalId || !!existingEvent;
            console.log('[useEventForm] Mode:', isUpdate ? 'Update' : 'Create');

            if (isUpdate) {
                updateEvent(eventId, payload);
            } else {
                addEvent(payload);
                // CRITICAL: Lock onto this ID so subsequent saves are updates
                setInternalId(eventId);
            }

            console.log('[useEventForm] Store Updated.');

            // Logic for "First Save" (switching from Create to Edit mode) needs to be handled by the Parent (Shell)
            // The shell needs to know we saved successfully and what the ID is.

            if (onSaveSuccess) onSaveSuccess();
            setIsDirty(false);
            console.log('[useEventForm] Save Complete. Returning ID.');
            return eventId;
        } catch (error) {
            console.error('[useEventForm] Save Error', error);
            if (!silent) Alert.alert('Error', 'Failed to save event.');
            return false;
        } finally {
            setIsSaving(false);
        }
    }, [values, existingEvent, internalId, addEvent, updateEvent, onSaveSuccess]);

    // Explicit Save Model: No Auto-Save

    // Internal ID tracking still useful for "Save & Continue Editing" if we add that later.


    return {
        values,
        handleChange,
        save,
        isDirty,
        isSaving,
        setValues, // Exposed for complex bulk updates (like applying a template)
        eventId: internalId // Expose the event ID (available immediately for new events)
    };
}
