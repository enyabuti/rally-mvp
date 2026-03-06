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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, email, status } = await request.json();

    if (!name || !email || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, status' },
        { status: 400 }
      );
    }

    // Check if member already exists
    const { data: existing } = await supabaseAdmin
      .from('members')
      .select('*')
      .eq('trip_id', id)
      .eq('email', email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Member with this email already exists' },
        { status: 409 }
      );
    }

    // Insert new member
    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({
        trip_id: id,
        name,
        email,
        status,
        paid: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Insert member error:', error);
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Add member error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
