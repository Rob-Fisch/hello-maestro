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
    isPublic?: boolean;
    createdAt: string;
}

export interface SessionLog {
    id: string;
    routineId: string;
    date: string;
    durationMinutes?: number;
    rating?: number; // 1-5
    notes?: string;
    itemsCompletedCount: number;
    totalItemsCount: number;
}

export type InteractionType = 'call' | 'email' | 'meeting' | 'gig' | 'rehearsal' | 'jam' | 'lesson' | 'other';

export interface InteractionLog {
    id: string;
    personId: string;
    date: string;
    type: InteractionType;
    notes?: string;
    rating?: number; // How did it go?
    createdAt: string;
}

export type BookingStatus = 'open' | 'invited' | 'confirmed' | 'declined' | 'cancelled';


export interface BookingSlot {
    id: string;
    role: string; // e.g. "Lead Sax", "Rhythm Section"
    instruments: string[]; // required instruments for this slot
    status: BookingStatus;
    musicianId?: string; // Links to Person ID
    invitedAt?: string; // Timestamp
    confirmedAt?: string;
    notes?: string;
    fee?: string;
}

export type AppEventType = 'performance' | 'lesson' | 'rehearsal' | 'other';

export interface AppEvent {
    id: string;
    type: AppEventType;
    title: string;
    venue: string;
    date: string; // YYYY-MM-DD
    time: string;
    slots: BookingSlot[]; // Replaces personnelIds/routines for roster view
    routines: string[]; // Array of Routine IDs
    duration?: number; // Duration in minutes
    packListIds?: string[]; // Links to GearAsset IDs or PackList IDs
    personnelIds?: string[]; // Deprecated: Use slots instead
    notes?: string;
    fee?: string; // Total fee (legacy/compatibility)
    totalFee?: string;
    musicianFee?: string;
    studentName?: string;
    schedule?: Schedule;
    createdAt: string;
}

/**
 * @deprecated Use AppEvent instead. Keeping for migration purposes.
 */
export interface Gig extends AppEvent { }

export type PersonType = 'student' | 'musician' | 'venue_manager' | 'fan' | 'other';

export interface Person {
    id: string;
    firstName: string;
    lastName: string;

    type: PersonType;
    email?: string;
    phone?: string;
    verifiedPhone?: string; // Explicitly marked as mobile/SMS ready
    instruments: string[]; // List of instruments they play
    notes?: string;
    instrument?: string; // deprecated, use instruments
    source: 'maestro' | 'native';
    nativeId?: string;
    venueName?: string; // For Venue Managers
    venueType?: string; // e.g. "Club", "Festival"
    venueLocation?: string; // City, State
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

export type AppTheme = 'vibrant' | 'midnight' | 'zen';

export interface UserSettings {
    includeTOC: boolean;
    messageTemplates: string[];
    theme: AppTheme;
}

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    lastSyncedAt?: string;
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface PathNode {
    id: string;
    label: string;
    description?: string;
    x: number;
    y: number;
    routineId?: string; // Integration with Routines
    referenceUrl?: string; // Link to YouTube, LinkedIn Learning, etc.
}

export type PathNodeType = 'routine' | 'task' | 'resource';

export interface PathNode {
    id: string;
    label: string;
    description?: string;
    x: number;
    y: number;

    // The Type Discriminator
    type: PathNodeType;

    // Type: Routine
    routineId?: string; // Links to an executable Routine

    // Type: Resource
    referenceUrl?: string; // Affiliate link, YouTube URL, etc.

    // Type: Task (Internal Logic)
    // Task status is tracked in UserProgress, no extra static fields needed here
}

export interface PathEdge {
    id: string;
    source: string; // node id
    target: string; // node id
}

export interface LearningPath {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    treeData: {
        nodes: PathNode[];
        edges: PathEdge[];
    };
    routineId?: string; // Global routine for the path
    forkedFromId?: string;
    rootOriginId?: string;
    originatorName?: string;
    originatorPathTitle?: string;
    isPublic: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserProgress {
    id: string;
    userId: string;
    pathId: string;
    nodeId: string;
    completedAt: string;
}

export interface ProofOfWork {
    id: string;
    userId: string;
    pathId: string;
    nodeId: string;
    proofUrl: string;
    proofType?: 'github' | 'youtube' | 'dropbox' | 'website' | 'other';
    notes?: string;
    createdAt: string;
}


export type GearCategory = 'Instrument' | 'Sound Tech' | 'Software' | 'Supplies' | 'Accessories' | 'Other';
export type GearStatus = 'Ready' | 'In Repair' | 'On Loan (To)' | 'On Loan (From)' | 'Retired';

export interface GearAsset {
    id: string;
    name: string;
    category: GearCategory;
    brand?: string;
    model?: string;
    serialNumber?: string;
    manufactureYear?: string;
    status: GearStatus;
    financials?: {
        purchasePrice?: string;
        purchaseDate?: string;
        currentValue?: string;
        resaleValue?: string;
        purchaseLocation?: string;
    };
    loanDetails?: {
        personName: string;
        dueDate?: string;
        notes?: string;
    };
    media?: {
        photoUris: string[];
        receiptUri?: string;
    };
    isWishlist: boolean;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PackList {
    id: string;
    eventId: string;
    itemIds: string[]; // List of GearAsset IDs
    additionalItems: string[]; // Manual entries like "Water", "Snacks"
    checkedItemIds: string[]; // For the load-out checklist
}
