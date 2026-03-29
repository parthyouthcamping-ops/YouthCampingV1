import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DB URL not set' }, { status: 500 });
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const sql = neon(process.env.DATABASE_URL);

    try {
        if (slug) {
            const result = await sql`SELECT * FROM bookings WHERE trip_slug = ${slug} ORDER BY created_at DESC LIMIT 1`;
            return NextResponse.json(result[0] || null);
        } else {
            const result = await sql`SELECT * FROM bookings ORDER BY created_at DESC`;
            return NextResponse.json(result);
        }
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'DB URL not set' }, { status: 500 });
    const sql = neon(process.env.DATABASE_URL);

    try {
        const body = await request.json();
        const { action, id, status, tripSlug, name, phone, email } = body;

        // Initialize table if not exists (one-time or check)
        await sql`
            CREATE TABLE IF NOT EXISTS bookings (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                trip_slug TEXT NOT NULL,
                customer_name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT,
                status TEXT DEFAULT 'reserved',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `;

        try {
            await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travelers INTEGER;`;
            await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS travel_dates TEXT;`;
            await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS special_requests TEXT;`;
        } catch(e) { console.error('Error adding columns', e); }

        if (action === 'update_status') {
            const getSlugRes = await sql`SELECT trip_slug FROM bookings WHERE id = ${id}`;
            const activeSlug = tripSlug || (getSlugRes.length > 0 ? getSlugRes[0].trip_slug : null);

            await sql`UPDATE bookings SET status = ${status} WHERE id = ${id}`;

            // Sync the quotation document's bookingStatus so the client page reflects it
            if (activeSlug) {
                try {
                    const res = await fetch(`${new URL(request.url).origin}/api/db`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'getAll' })
                    });
                    if (res.ok) {
                        const qs: any[] = await res.json();
                        const q = qs.find((q: any) => q.slug === activeSlug);
                        // Always allow status updates (admin can set any status)
                        if (q) {
                            q.bookingStatus = status;
                            q.isBooked    = status === 'booked';
                            q.isReserved  = status === 'reserved';
                            q.updatedAt   = new Date().toISOString();
                            await fetch(`${new URL(request.url).origin}/api/db`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'set', id: q.id, slug: q.slug, data: q })
                            });
                        }
                    }
                } catch (syncErr) {
                    console.error('[API /book] Failed to sync quotation status:', syncErr);
                }
            }
            return NextResponse.json({ success: true, status });
        }

        if (action === 'delete') {
            await sql`DELETE FROM bookings WHERE id = ${id}`;
            return NextResponse.json({ success: true });
        }

        console.log(`[API /book] New Request. Slug: ${tripSlug}, Customer: ${name}, Action: ${action || 'New Booking'}`);

        // Prevent duplicate or already booked trips
        if (tripSlug) {
            console.log(`[API /book] Validating trip slug: ${tripSlug}`);
            const res = await fetch(`${new URL(request.url).origin}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getAll' })
            });
            if (res.ok) {
                const qs: any[] = await res.json();
                const q = qs.find(q => q.slug === tripSlug);
                console.log(`[API /book] Found Quotation? ${!!q}. Current Status: ${q?.bookingStatus}`);
                if (q && q.bookingStatus === 'booked') {
                    console.error(`[API /book] Rejected: Trip ${tripSlug} is already booked.`);
                    return NextResponse.json({ error: "Trip is already booked." }, { status: 400 });
                }
            } else {
                console.error(`[API /book] Failed to fetch quotations for validation.`);
            }
        }

        const existing = await sql`SELECT * FROM bookings WHERE trip_slug = ${tripSlug} AND email = ${email}`;
        if (existing.length > 0) {
            console.error(`[API /book] Rejected: Duplicate booking for ${email} on ${tripSlug}.`);
            return NextResponse.json({ error: "Duplicate booking detected for this trip and email." }, { status: 400 });
        }

        const { travelers, travelDates, specialRequests } = body;

        // New Booking
        const result = await sql`
            INSERT INTO bookings (trip_slug, customer_name, phone, email, status, travelers, travel_dates, special_requests)
            VALUES (${tripSlug}, ${name}, ${phone}, ${email}, 'pending', ${travelers || null}, ${travelDates || null}, ${specialRequests || null})
            RETURNING *
        `;

        // Update Quotation to pending
        try {
            const res = await fetch(`${new URL(request.url).origin}/api/db`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'getAll' })
            });
            if (res.ok) {
                const qs: any[] = await res.json();
                const q = qs.find(q => q.slug === tripSlug);
                if (q && q.bookingStatus !== 'booked' && q.bookingStatus !== 'reserved') {
                    q.bookingStatus = 'pending';
                    q.updatedAt = new Date().toISOString();
                    await fetch(`${new URL(request.url).origin}/api/db`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ action: 'set', id: q.id, slug: q.slug, data: q })
                    });
                }
            }
        } catch (e) { console.error('Error updating quotation status to pending'); }

        return NextResponse.json(result[0]);
    } catch (error: any) {
        console.error('Booking API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
