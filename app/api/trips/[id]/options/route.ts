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

    console.log('[OPTIONS] Fetching options for trip:', id);
    const { data, error } = await supabaseAdmin
      .from('options')
      .select('*')
      .eq('trip_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[OPTIONS] Get options error:', error);
      return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
    }

    console.log('[OPTIONS] Found', data?.length || 0, 'options');
    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Get options error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
