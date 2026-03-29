import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const VALID_STATUSES = ['pending', 'reserved', 'booked', 'cancelled', 'sent'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!process.env.DATABASE_URL) {
        return NextResponse.json({ error: 'DATABASE_URL not configured' }, { status: 500 });
    }

    try {
        const { id } = await params;
        const { status } = await request.json();

        if (!status || !VALID_STATUSES.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
                { status: 400 }
            );
        }

        console.log(`[API /quotation/${id}/status] Updating to: ${status}`);

        const sql = neon(process.env.DATABASE_URL);

        // Fetch the current quotation row directly from DB (no circular fetch)
        const rows = await sql`SELECT data FROM quotations WHERE id = ${id}`;
        if (rows.length === 0) {
            console.error(`[API /quotation/${id}/status] Not found`);
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        const quotation = rows[0].data as any;
        const prevStatus = quotation.bookingStatus;

        // Update status flags
        quotation.bookingStatus = status;
        quotation.isBooked      = status === 'booked';
        quotation.isReserved    = status === 'reserved';
        quotation.updatedAt     = new Date().toISOString();

        const jsonString = JSON.stringify(quotation);

        await sql`
            UPDATE quotations
            SET data       = ${jsonString}::jsonb,
                updated_at = ${quotation.updatedAt}
            WHERE id = ${id}
        `;

        console.log(`[API /quotation/${id}/status] ${prevStatus} → ${status} ✓`);

        return NextResponse.json({
            message: 'Status updated successfully',
            id,
            previousStatus: prevStatus,
            newStatus: status,
            isBooked: quotation.isBooked,
            isReserved: quotation.isReserved,
        }, { status: 200 });

    } catch (error: any) {
        console.error(`[API /quotation/status] Error:`, error.message);
        return NextResponse.json(
            { error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}
