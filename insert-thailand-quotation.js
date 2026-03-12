require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set in .env.local');
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const id   = 'thailand-pattaya-bangkok-' + Date.now();
const slug = 'thailand-pattaya-bangkok-luxury-' + id.slice(-5);

const quotation = {
    id,
    slug,
    status: 'Draft',
    clientName: '',
    destination: 'Thailand – Pattaya + Bangkok',
    pax: 2,
    travelDates: { from: '', to: '' },
    duration: '5 Nights / 6 Days',
    transportOption: 'Flight',
    roomSharing: 'Double',
    packagePrice: 19999,
    lowLevelPrice: 19999,
    highLevelPrice: 22999,
    heroImage: null,
    experiencePhotos: [],
    expert: { name: '', whatsapp: '', designation: '' },

    // ── STANDARD HOTELS ────────────────────────────────────────────────────
    lowLevelHotels: [
        {
            id: 'llh-1',
            name: 'Golden Beach Hotel',
            location: 'Pattaya',
            rating: 3,
            description: '4 Nights stay in Pattaya with buffet breakfast included.',
            roomType: 'Standard Room',
            photos: []
        },
        {
            id: 'llh-2',
            name: 'Ecotel Hotel',
            location: 'Bangkok',
            rating: 3,
            description: '1 Night stay in Bangkok with buffet breakfast included.',
            roomType: 'Standard Room',
            photos: []
        }
    ],

    // ── PREMIUM HOTELS ─────────────────────────────────────────────────────
    highLevelHotels: [
        {
            id: 'hlh-1',
            name: 'Hiso Hotel',
            location: 'Pattaya',
            rating: 4,
            description: '4 Nights stay in Pattaya with buffet breakfast included.',
            roomType: 'Deluxe Room',
            photos: []
        },
        {
            id: 'hlh-2',
            name: 'Season Siam Hotel',
            location: 'Bangkok',
            rating: 4,
            description: '1 Night stay in Bangkok with buffet breakfast included.',
            roomType: 'Deluxe Room',
            photos: []
        }
    ],

    hotels: [],

    // ── ITINERARY ──────────────────────────────────────────────────────────
    itinerary: [
        {
            id: 'day-1',
            day: 1,
            title: 'Arrival Bangkok → Pattaya',
            description: 'Arrival at Bangkok airport. Pickup & private transfer to Pattaya hotel. Check-in (standard time 14:00–15:00 hrs). Remaining day free to explore local markets of Pattaya.',
            activities: [
                'Airport pickup & transfer to Pattaya hotel',
                'Check-in at hotel',
                'Explore Pattaya local markets at leisure'
            ],
            photos: []
        },
        {
            id: 'day-2',
            day: 2,
            title: 'Leisure Day – Optional Tours',
            description: 'After breakfast, free day at leisure or choose from popular optional tours.',
            activities: [
                'Buffet breakfast at hotel',
                'Optional: Alcazar Show',
                'Optional: Nong Nooch Park',
                'Optional: Underwater World',
                'Overnight stay in Pattaya hotel'
            ],
            photos: []
        },
        {
            id: 'day-3',
            day: 3,
            title: 'Coral Island Tour',
            description: 'Exciting speedboat trip to Coral Island with Indian buffet lunch included. Enjoy swimming, snorkelling and relaxing on the beach.',
            activities: [
                'Breakfast at hotel',
                'Pickup from hotel lobby',
                'Coral Island by speed boat',
                'Activities: swim, snorkel, beach time',
                'Indian buffet lunch included',
                'Evening free at leisure',
                'Overnight stay in hotel'
            ],
            photos: []
        },
        {
            id: 'day-4',
            day: 4,
            title: 'Leisure Day – Optional Tours',
            description: 'After breakfast, full free day. Enjoy optional tours or explore Pattaya at your own pace.',
            activities: [
                'Buffet breakfast at hotel',
                'Optional: Alcazar Show',
                'Optional: Nong Nooch Park',
                'Optional: Underwater World',
                'Overnight stay in Pattaya hotel'
            ],
            photos: []
        },
        {
            id: 'day-5',
            day: 5,
            title: 'Pattaya → Bangkok + Temple Tour',
            description: 'After breakfast, private transfer to Bangkok. Hotel check-in followed by a Bangkok city & temple tour covering Golden Buddha Temple and Mini Reclining Buddha.',
            activities: [
                'Buffet breakfast at hotel',
                'Private transfer: Pattaya Hotel → Bangkok Hotel',
                'Check-in at Bangkok hotel',
                'Bangkok city & temple tour (Golden Buddha + Mini Reclining Buddha)',
                'Optional: Chao Phraya River Dinner Cruise',
                'Optional: Sea Life Ocean World',
                'Optional: Madame Tussauds',
                'Overnight stay in Bangkok hotel'
            ],
            photos: []
        },
        {
            id: 'day-6',
            day: 6,
            title: 'Airport Drop',
            description: 'After breakfast, check out from hotel and private transfer to Bangkok airport for your return flight. Safe travels!',
            activities: [
                'Buffet breakfast at hotel',
                'Check out',
                'Private transfer: Bangkok Hotel → Bangkok Airport'
            ],
            photos: []
        }
    ],

    // ── INCLUSIONS ─────────────────────────────────────────────────────────
    includes: [
        '4 Nights Accommodation in Pattaya',
        '1 Night Accommodation in Bangkok',
        'Daily Buffet Breakfast',
        'Tiger Park + Gems Gallery (Transfer Only)',
        'Coral Island by Speed Boat Including Lunch',
        'Bangkok 2 Temple Tour (Golden Buddha + Mini Reclining Buddha)',
        'All Sightseeing on Sharing Basis',
        'Private Transfer: Bangkok Airport → Pattaya Hotel',
        'Private Transfer: Pattaya Hotel → Bangkok Hotel',
        'Private Transfer: Bangkok Hotel → Bangkok Airport'
    ],

    // ── EXCLUSIONS ─────────────────────────────────────────────────────────
    exclusions: [
        'Flight Tickets',
        'Lunch & Dinner (except Coral Island lunch)',
        'Travel Insurance',
        'Visa Fees',
        'Anything Not Mentioned in Inclusions',
        'Optional Tours & Activities'
    ],

    customSections: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
};

async function run() {
    try {
        const jsonString = JSON.stringify(quotation);
        console.log(`📦 Payload size: ${(jsonString.length / 1024).toFixed(1)} KB`);

        await sql`
            INSERT INTO quotations (id, slug, data, updated_at, created_at)
            VALUES (
                ${id},
                ${slug},
                ${jsonString}::jsonb,
                ${quotation.updatedAt},
                ${quotation.createdAt}
            )
            ON CONFLICT (id) DO UPDATE
            SET slug = EXCLUDED.slug,
                data = EXCLUDED.data,
                updated_at = EXCLUDED.updated_at
        `;
        console.log('✅ Thailand quotation saved!');
        console.log(`   ID:   ${id}`);
        console.log(`   Slug: ${slug}`);
    } catch (e) {
        console.error('❌ Failed:', e.message);
    }
}

run();
