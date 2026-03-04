import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from('votes')
      .select('*')
      .eq('trip_id', id);

    if (error) {
      console.error('Get votes error:', error);
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Get votes error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
