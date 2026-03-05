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

    const { data, error } = await supabaseAdmin
      .from('options')
      .select('*')
      .eq('trip_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get options error:', error);
      return NextResponse.json({ error: 'Failed to fetch options' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Get options error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
