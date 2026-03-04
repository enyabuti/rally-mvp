import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { CreateTripRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: CreateTripRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.destination || !body.start_date || !body.end_date || !body.budget_per_person || !body.deposit_amount || !body.organizer_name || !body.organizer_email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Set default deadlines: commitment = 7 days, preference = 14 days
    const now = new Date();
    const commitmentDeadline = body.commitment_deadline || new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const preferenceDeadline = body.preference_deadline || new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabaseAdmin
      .from('trips')
      .insert({
        name: body.name,
        destination: body.destination,
        start_date: body.start_date,
        end_date: body.end_date,
        budget_per_person: body.budget_per_person,
        deposit_amount: body.deposit_amount,
        organizer_name: body.organizer_name,
        organizer_email: body.organizer_email,
        commitment_deadline: commitmentDeadline,
        preference_deadline: preferenceDeadline,
        status: 'open',
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({
        error: 'Failed to create trip',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    // Auto-add organizer as a committed member (no deposit required for organizer)
    const { error: memberError } = await supabaseAdmin
      .from('members')
      .insert({
        trip_id: data.id,
        name: body.organizer_name,
        email: body.organizer_email,
        paid: true,
        paid_at: new Date().toISOString(),
        status: 'committed',
      });

    if (memberError) {
      console.error('Failed to add organizer as member:', memberError);
      // Still return the trip ID even if member creation fails
      // The trip was created successfully
    }

    return NextResponse.json({ id: data.id });
  } catch (err: any) {
    console.error('Create trip error:', err);
    return NextResponse.json({
      error: 'Internal server error',
      details: err.message || String(err)
    }, { status: 500 });
  }
}
