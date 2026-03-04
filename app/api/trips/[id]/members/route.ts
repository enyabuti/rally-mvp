import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('trip_id', id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Get members error:', error);
      return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (err) {
    console.error('Get members error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
