import { useContentStore } from '@/store/contentStore';
import { useFinanceStore } from '@/store/financeStore';
import { AppEvent, ContentBlock, Person, Routine, SetList, Song } from '@/store/types';

// Sample Data uses deterministic UUIDs starting with '00000000-' for easy identification
// This ensures Supabase UUID validation passes while still being identifiable
const generateSeedId = (type: string, num: number): string => {
    // Format: 00000000-TTTT-4000-8000-NNNNNNNNNNNN
    // Where TTTT encodes the type and NNNN is the number
    const typeMap: Record<string, string> = {
        'block': '0001',
        'routine': '0002',
        'song': '0003',
        'setlist': '0004',
        'sli': '0005', // setlist item
        'gig': '0006',
        'person': '0007',
        'tx': '0008',
    };
    const typeCode = typeMap[type] || '9999';
    const numPadded = num.toString().padStart(12, '0');
    return `00000000-${typeCode}-4000-8000-${numPadded}`;
};

// Helper to check if an ID is a sample data ID
const isSeedId = (id: string): boolean => id.startsWith('00000000-');

/**
 * Seeds sample data for new users to explore OpusMode features.
 * All seeded items have UUIDs starting with '00000000-' for easy cleanup.
 */
export const seedSampleData = async () => {
    const { addEvent, addPerson, addSong, addSetList, addRoutine, addBlock, songs, events, people } = useContentStore.getState();
    const { addTransaction, transactions } = useFinanceStore.getState();

    // Skip if already seeded (check for any items with seed UUIDs)
    const alreadySeeded = songs.some(s => isSeedId(s.id)) ||
        events.some(e => isSeedId(e.id)) ||
        people.some(p => isSeedId(p.id));

    if (alreadySeeded) {
        console.log('📦 Sample data already exists, skipping seed.');
        return false;
    }

    console.log('🌱 Seeding Sample Data...');

    // --- 1. STUDIO LIBRARY: Arban Collection (ContentBlocks in a Routine) ---
    const arbanBlocks: ContentBlock[] = [
        {
            id: generateSeedId('block', 1),
            title: 'First Studies',
            type: 'sheet_music',
            content: 'Fundamental exercises for building technique. Start slow and focus on tone quality.',
            tags: ['sample', 'warmup', 'fundamentals'],
            mediaUri: '/sample_arban_first_studies.pdf',
            createdAt: new Date().toISOString(),
        },
        {
            id: generateSeedId('block', 2),
            title: 'Lip Slurs',
            type: 'sheet_music',
            content: 'Essential for building flexibility and smooth register transitions.',
            tags: ['sample', 'warmup', 'flexibility'],
            mediaUri: '/sample_arban_lip_slurs.pdf',
            createdAt: new Date().toISOString(),
        },
        {
            id: generateSeedId('block', 3),
            title: 'Major and Minor Chords',
            type: 'sheet_music',
            content: 'Chord studies for intonation and harmonic awareness.',
            tags: ['sample', 'technique', 'chords'],
            mediaUri: '/sample_arban_chords.pdf',
            createdAt: new Date().toISOString(),
        },
        {
            id: generateSeedId('block', 4),
            title: 'Carnival of Venice',
            type: 'sheet_music',
            content: 'Classic theme and variations. A showcase piece demonstrating technical mastery.',
            tags: ['sample', 'repertoire', 'showpiece'],
            mediaUri: '/sample_arban_carnival.pdf',
            createdAt: new Date().toISOString(),
        },
    ];

    // Add blocks to store individually (so they appear in Studio Library)
    arbanBlocks.forEach(b => addBlock(b));

    // Also create a Collection (Routine) containing them
    const arbanCollection: Routine = {
        id: generateSeedId('routine', 1),
        title: "Arban's Cornet Method (Sample)",
        description: 'Classic exercises from the legendary method book. These are public domain materials to help you get started.',
        blocks: arbanBlocks,
        createdAt: new Date().toISOString(),
    };

    addRoutine(arbanCollection);

    // --- 2. SONGS for Set List (Generic Jazz Standards) ---
    const sampleSongs: Song[] = [
        {
            id: generateSeedId('song', 1),
            title: 'Autumn Leaves',
            artist: 'Jazz Standard',
            key: 'Gm',
            bpm: 120,
            notes: 'Classic jazz standard. Great for practicing ii-V-I progressions.',
            tags: ['sample', 'jazz', 'standard'],
            links: [],
            createdAt: new Date().toISOString(),
        },
        {
            id: generateSeedId('song', 2),
            title: 'Blue Bossa',
            artist: 'Kenny Dorham',
            key: 'Cm',
            bpm: 140,
            notes: 'Latin jazz feel with a minor key.',
            tags: ['sample', 'jazz', 'latin'],
            links: [],
            createdAt: new Date().toISOString(),
        },
        {
            id: generateSeedId('song', 3),
            title: 'Take Five',
            artist: 'Dave Brubeck',
            key: 'Ebm',
            bpm: 174,
            notes: 'Famous 5/4 time signature tune.',
            tags: ['sample', 'jazz', 'classic'],
            links: [],
            createdAt: new Date().toISOString(),
        },
    ];

    sampleSongs.forEach(s => addSong(s));

    // --- 3. SET LIST (Sample Jazz Set) ---
    const sampleSetList: SetList = {
        id: generateSeedId('setlist', 1),
        title: 'Sample Jazz Set',
        description: 'A demonstration set list showing how to organize songs for a gig.',
        items: [
            { id: generateSeedId('sli', 1), type: 'song', songId: generateSeedId('song', 1) },
            { id: generateSeedId('sli', 2), type: 'song', songId: generateSeedId('song', 2) },
            { id: generateSeedId('sli', 3), type: 'break', label: 'Break', durationSeconds: 300 },
            { id: generateSeedId('sli', 4), type: 'song', songId: generateSeedId('song', 3) },
        ],
        createdAt: new Date().toISOString(),
    };

    addSetList(sampleSetList);

    // --- 4. GIGS (Past & Future) ---
    const today = new Date();
    const nextMonth = new Date(today); nextMonth.setMonth(today.getMonth() + 1);
    const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);

    const sampleEvents: AppEvent[] = [
        {
            id: generateSeedId('gig', 1),
            date: lastMonth.toISOString().split('T')[0],
            title: 'Sample Past Gig',
            venue: 'Downtown Jazz Club',
            type: 'performance',
            time: '20:00',
            totalFee: '$400',
            musicianFee: '$350',
            notes: 'This is a sample past gig showing how to track completed performances.',
            createdAt: new Date().toISOString(),
            slots: [],
            routines: [],
        },
        {
            id: generateSeedId('gig', 2),
            date: nextMonth.toISOString().split('T')[0],
            title: 'Sample Upcoming Gig',
            venue: 'Community Center',
            type: 'performance',
            time: '19:00',
            totalFee: '$600',
            notes: 'This is a sample future gig. Link a set list and invite band members!',
            createdAt: new Date().toISOString(),
            slots: [],
            routines: [],
        },
    ];

    sampleEvents.forEach(e => addEvent(e));

    // --- 5. CONTACTS ---
    const samplePeople: Person[] = [
        {
            id: generateSeedId('person', 1),
            firstName: 'Sample',
            lastName: 'Bandmate',
            type: 'musician',
            instruments: ['Bass'],
            email: 'sample@example.com',
            notes: 'This is a sample contact. Add your real bandmates here!',
            source: 'maestro',
            createdAt: new Date().toISOString(),
        },
        {
            id: generateSeedId('person', 2),
            firstName: 'Sample',
            lastName: 'Venue Manager',
            type: 'venue_manager',
            instruments: [],
            venueName: 'The Sample Lounge',
            email: 'booking@example.com',
            notes: 'This is a sample venue contact.',
            source: 'maestro',
            createdAt: new Date().toISOString(),
        },
    ];

    samplePeople.forEach(p => addPerson(p));

    // --- 6. TRANSACTIONS ---
    const { addTransaction: addTx } = useFinanceStore.getState();

    addTx({
        id: generateSeedId('tx', 1),
        date: lastMonth.toISOString().split('T')[0],
        amount: 350,
        type: 'income',
        category: 'Gig',
        description: 'Sample Past Gig payout',
        createdAt: new Date().toISOString(),
    });

    addTx({
        id: generateSeedId('tx', 2),
        date: lastMonth.toISOString().split('T')[0],
        amount: 25,
        type: 'expense',
        category: 'Travel',
        description: 'Uber to Sample Gig',
        createdAt: new Date().toISOString(),
    });

    console.log('✅ Sample data seeded!');
    return true;
};

/**
 * Clears all sample data (items with UUIDs starting with '00000000-').
 */
export const clearSampleData = async () => {
    const { songs, events, people, routines, setLists, blocks, deleteEvent, deletePerson, deleteSong, deleteRoutine, deleteSetList, deleteBlock } = useContentStore.getState();
    const { transactions, deleteTransaction } = useFinanceStore.getState();

    console.log('🧹 Clearing sample data...');

    // Delete blocks (Library items)
    blocks.filter(b => isSeedId(b.id)).forEach(b => deleteBlock(b.id));

    // Delete songs
    songs.filter(s => isSeedId(s.id)).forEach(s => deleteSong(s.id));

    // Delete events
    events.filter(e => isSeedId(e.id)).forEach(e => deleteEvent(e.id));

    // Delete people
    people.filter(p => isSeedId(p.id)).forEach(p => deletePerson(p.id));

    // Delete routines
    routines.filter(r => isSeedId(r.id)).forEach(r => deleteRoutine(r.id));

    // Delete set lists
    setLists.filter(sl => isSeedId(sl.id)).forEach(sl => deleteSetList(sl.id));

    // Delete transactions
    transactions.filter(t => isSeedId(t.id)).forEach(t => deleteTransaction(t.id));

    console.log('✨ All sample data cleared.');
};

/**
 * Checks if the user has any sample data.
 */
export const hasSampleData = (): boolean => {
    const { songs, events, people, routines, setLists } = useContentStore.getState();
    const { transactions } = useFinanceStore.getState();

    return songs.some(s => isSeedId(s.id)) ||
        events.some(e => isSeedId(e.id)) ||
        people.some(p => isSeedId(p.id)) ||
        routines.some(r => isSeedId(r.id)) ||
        setLists.some(sl => isSeedId(sl.id)) ||
        transactions.some(t => isSeedId(t.id));
};

// Legacy export for backward compatibility
export const seedTestData = seedSampleData;

