import { useContentStore } from '@/store/contentStore';
import { useFinanceStore } from '@/store/financeStore';
import { AppEvent, Person } from '@/store/types';

export const seedTestData = async () => {
    const { addEvent, addPerson } = useContentStore.getState();
    const { addTransaction } = useFinanceStore.getState();

    console.log('🌱 Seeding Test Data...');

    // 1. Seed Gigs (Past & Future) to test Teaser Logic
    const today = new Date();
    const nextMonth = new Date(today); nextMonth.setMonth(today.getMonth() + 1);
    const lastMonth = new Date(today); lastMonth.setMonth(today.getMonth() - 1);
    const twoMonthsOut = new Date(today); twoMonthsOut.setMonth(today.getMonth() + 2);

    const events: AppEvent[] = [
        {
            id: 'seed-gig-1',
            date: lastMonth.toISOString().split('T')[0], // Past gig for "Income" history
            title: 'Jazz at Lincoln Center',
            venue: 'Dizzys Club',
            type: 'performance',
            time: '19:00',
            totalFee: '$500',
            musicianFee: '$450',
            createdAt: new Date().toISOString(),
            slots: [],
            routines: [],
        },
        {
            id: 'seed-gig-2',
            date: nextMonth.toISOString().split('T')[0], // Future gig for Invites
            title: 'Holiday Party',
            venue: 'Corporate HQ',
            type: 'performance',
            time: '18:00',
            totalFee: '$1200',
            musicianFee: '$1200',
            createdAt: new Date().toISOString(),
            slots: [],
            routines: [],
        },
        {
            id: 'seed-gig-3',
            date: twoMonthsOut.toISOString().split('T')[0], // Future gig
            title: 'Valentines Duo',
            venue: 'Italian Restaurant',
            type: 'performance',
            time: '20:00',
            totalFee: '$300',
            createdAt: new Date().toISOString(),
            slots: [],
            routines: [],
        }
    ];

    events.forEach(e => addEvent(e));

    // 2. Seed Contacts
    const people: Person[] = [
        { id: 'seed-p-1', firstName: 'Miles', lastName: 'Davis', type: 'musician', instruments: ['Trumpet'], phone: '555-0101', email: 'miles@example.com', source: 'maestro', createdAt: new Date().toISOString() },
        { id: 'seed-p-2', firstName: 'John', lastName: 'Coltrane', type: 'musician', instruments: ['Sax'], phone: '555-0102', source: 'maestro', createdAt: new Date().toISOString() },
        { id: 'seed-p-3', firstName: 'Bill', lastName: 'Evans', type: 'musician', instruments: ['Keys'], email: 'bill@example.com', source: 'maestro', createdAt: new Date().toISOString() }
    ];

    people.forEach(p => addPerson(p));

    // 3. Seed Transactions (for Pro Ledger)
    addTransaction({
        id: 'seed-tx-1',
        date: '2023-11-16',
        amount: 450,
        type: 'income',
        category: 'Gig',
        description: 'JALC Payout',
        createdAt: new Date().toISOString()
    });

    addTransaction({
        id: 'seed-tx-2',
        date: '2023-11-15',
        amount: 35.50,
        type: 'expense',
        category: 'Travel',
        description: 'Uber to Venue',
        createdAt: new Date().toISOString()
    });

    addTransaction({
        id: 'seed-tx-3',
        date: '2023-12-01',
        amount: 1500,
        type: 'expense',
        category: 'Gear',
        description: 'New Nord Keyboard',
        createdAt: new Date().toISOString()
    });

    alert('🌱 Test Data Seeded! (3 Gigs, 3 Contacts, 3 Transactions)');
};
