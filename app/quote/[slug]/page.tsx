import { notFound } from "next/navigation";
import { PREDEFINED_QUOTES } from "@/lib/itineraries";
import { getQuotations } from "@/lib/store";
import LuxuryQuotationUI from "./LuxuryQuotationUI";
import { neon } from '@neondatabase/serverless';

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    console.log("Next.js Server Debug - Params Slug:", slug);

    // TASK 1: Use direct mapping if possible (PREDEFINED_QUOTES acts as our quotes map)
    let data = PREDEFINED_QUOTES[slug];

    // Optional: Fallback to DB if not in predefined (to be robust)
    if (!data) {
        try {
            if (process.env.DATABASE_URL) {
                const sql = neon(process.env.DATABASE_URL);
                const result = await sql`SELECT data FROM quotations WHERE slug = ${slug} LIMIT 1`;
                if (result.length > 0) {
                    data = result[0].data;
                }
            }
        } catch (e) {
            console.error("Failed to fetch quotation from db:", e);
        }
    }

    // TASK 3: Remove Admin Fallback - Use notFound()
    if (!data) {
        console.error("Quotation not found for slug:", slug);
        return notFound();
    }

    // TASK 2: Pass corrected data into EXISTING UI (LuxuryQuotationUI)
    // The design remains EXACTLY SAME as it was in your previous luxury design.
    return <LuxuryQuotationUI q={data as any} />;
}
