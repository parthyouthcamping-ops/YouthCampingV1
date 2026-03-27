import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: 'DATABASE_URL is not set.' },
      { status: 500 }
    );
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    const result = await sql`SELECT data FROM quotations WHERE slug = ${slug}`;
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
    }

    return NextResponse.json(result[0].data);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Database operation failed', message: error.message },
      { status: 500 }
    );
  }
}
