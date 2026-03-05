import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Disable caching for this endpoint
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { count, error } = await supabaseAdmin
      .from('preferences')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', id);

    if (error) {
      console.error('Get preferences count error:', error);
      return NextResponse.json({ error: 'Failed to fetch preferences count' }, { status: 500 });
    }

    return NextResponse.json({ count: count || 0 });
  } catch (err) {
    console.error('Get preferences count error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
