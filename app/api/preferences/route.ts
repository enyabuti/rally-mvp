import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { PreferenceRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: PreferenceRequest = await request.json();

    // Validate required fields
    if (!body.trip_id || !body.member_id || !body.budget_flexibility || !body.accommodation_style || !body.activity_interests || !body.pace) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('preferences')
      .insert({
        trip_id: body.trip_id,
        member_id: body.member_id,
        budget_flexibility: body.budget_flexibility,
        accommodation_style: body.accommodation_style,
        activity_interests: body.activity_interests,
        pace: body.pace,
        hard_nos: body.hard_nos || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Save preferences error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
