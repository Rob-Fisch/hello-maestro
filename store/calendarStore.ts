import { create } from 'zustand';
import { CalendarEvent } from './types';

interface CalendarState {
    events: CalendarEvent[];
    addEvent: (event: CalendarEvent) => void;
    toggleEventCompletion: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
    events: [
        {
            id: '1',
            date: new Date().toISOString().split('T')[0], // Today
            title: 'Morning Practice',
            type: 'routine',
            completed: false,
        },
    ],
    addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
    toggleEventCompletion: (id) =>
        set((state) => ({
            events: state.events.map((e) =>
                e.id === id ? { ...e, completed: !e.completed } : e
            ),
        })),
}));
