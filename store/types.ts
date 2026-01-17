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
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
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
    expiresAt?: string; // ISO date string. If set, link is invalid after this date.
    originalRoutineId?: string; // If cloned, points to source
    clonedFromUserId?: string; // If cloned, points to teacher
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
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
    inviteId?: string; // Unique ID for public "Gig Link"
    inviteType?: 'inquiry' | 'offer';
    inviteExpiresAt?: string; // ISO Date for offer expiration
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

    // Venue Information (Structured)
    venueAddressLine1?: string;
    venueAddressLine2?: string;
    venueCity?: string;
    venueStateProvince?: string;
    venuePostalCode?: string;
    venueCountry?: string;

    // Performer Page (Logistics for ensemble members)
    isPerformerPageEnabled?: boolean;
    loadInTime?: string;
    soundcheckTime?: string;

    // Performance Promo (Public fan engagement - renamed from Stage Plot)
    isPublicPromo?: boolean; // Renamed from isPublicStagePlot
    publicDescription?: string; // Fan-facing notes (separate from private 'notes')
    showSetlist?: boolean;
    socialLink?: string; // Event-specific link (e.g. Band Website for this specific gig)
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
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
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
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
    roles?: string[]; // e.g. "Band Leader", "Sideman", "Teacher", "Student"
    goals?: string[]; // e.g. "Get Organized", "Practice More"
}

export interface UserProfile {
    id: string;
    email: string;
    displayName?: string;
    avatarUrl?: string;
    lastSyncedAt?: string;    // Pro Features & Fan Engagement
    isPremium?: boolean;
    tipUrl?: string;          // Venmo/CashApp/PayPal (Global)
    mailingListUrl?: string;  // Mailchimp/Google Form (Global)
    // socialUrl removed in favor of Event-specific link
    bio?: string;            // Short artist bio for Performance Promo
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
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
    createdAt: string;
    updatedAt: string;
}

export interface UserProgress {
    id: string;
    userId: string;
    pathId: string;
    nodeId: string;
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
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
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
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

export type TransactionType = 'income' | 'expense';

export type TransactionCategory = 'Gig' | 'Gear' | 'Lesson' | 'Travel' | 'Musician Payout' | 'Tip' | 'Other';

export interface Transaction {
    id: string;
    date: string; // ISO date string
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    relatedEventId?: string; // Link to an AppEvent
    receiptUri?: string;     // Link to a receipt image
    createdAt: string;
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    key?: string;
    bpm?: number;
    durationSeconds?: number;
    links: { label: string; url: string }[];
    notes?: string;
    tags?: string[];
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
    createdAt: string;
    deletedAt?: string;
}

export type SetListItemType = 'song' | 'break';

export interface SetListItem {
    id: string; // Unique ID for this item in the set
    type: SetListItemType;
    songId?: string; // If type === 'song'
    label?: string;  // If type === 'break' (e.g. "Intermission")
    note?: string;   // Ride the cymbal hard here
    durationSeconds?: number; // Override or manual duration
}

export interface SetList {
    id: string;
    title: string;
    description?: string;
    eventId?: string; // Optional link to a specific gig
    originalSetListId?: string; // If forked/imported, points to master
    items: SetListItem[];
    platform?: 'web' | 'native'; // Two Islands: Web vs Native App
    createdAt: string;
    deletedAt?: string;
}
