export type Tag = string;

export interface Category {
    id: string;
    name: string;
    color?: string; // For visual grouping
}

export interface ContentBlock {
    id: string;
    title: string;
    type: 'text' | 'sheet_music';
    content: string; // URL, text, or file path
    tags: Tag[];
    categoryId?: string;
    mediaUri?: string;
    linkUrl?: string;
    createdAt: string;
}

export interface Schedule {
    type: 'none' | 'recurring' | 'date';
    daysOfWeek?: number[]; // 0=Sun, 1=Mon...
    date?: string; // ISO date string YYYY-MM-DD
    startDate?: string; // For recurring
    endDate?: string; // For recurring
}

export interface Routine {
    id: string;
    title: string;
    description?: string;
    blocks: ContentBlock[];
    schedule?: Schedule;
    createdAt: string;
}

export type AppEventType = 'performance' | 'lesson' | 'rehearsal' | 'other';

export interface AppEvent {
    id: string;
    type: AppEventType;
    title: string;
    venue: string;
    date: string; // Keep for backward compatibility/single date
    time: string;
    routines: string[]; // Array of Routine IDs
    notes?: string;
    fee?: string;
    studentName?: string; // Specific for lessons
    schedule?: Schedule; // New for recurring events
    personnelIds?: string[]; // IDs of people (band members, etc.)
    createdAt: string;
}

/**
 * @deprecated Use AppEvent instead. Keeping for migration purposes.
 */
export interface Gig extends AppEvent { }

export type PersonType = 'student' | 'musician' | 'venue_manager' | 'fan' | 'other';

export interface Person {
    id: string;
    name: string;
    type: PersonType;
    email?: string;
    phone?: string;
    notes?: string;
    instrument?: string; // Added based on typical musician needs
    createdAt: string;
}

export interface CalendarEvent {
    id: string;
    date: string; // ISO date string YYYY-MM-DD
    title: string;
    type: 'routine' | 'event' | 'practice';
    relatedId?: string; // ID of routine or event
    completed: boolean;
}

export interface UserSettings {
    includeTOC: boolean;
    messageTemplates: string[];
}

