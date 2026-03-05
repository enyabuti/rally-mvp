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
      .from('trips')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Get trip error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { status } = await request.json();

    // Validate status transitions
    const validTransitions: Record<string, string[]> = {
      open: ['preferences'],
      preferences: ['voting'],
      voting: ['locked'],
    };

    // Get current trip status
    const { data: currentTrip, error: fetchError } = await supabaseAdmin
      .from('trips')
      .select('status')
      .eq('id', id)
      .single();

    if (fetchError || !currentTrip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Check if transition is valid
    const allowedNextStatuses = validTransitions[currentTrip.status];
    if (!allowedNextStatuses || !allowedNextStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status transition from ${currentTrip.status} to ${status}` },
        { status: 400 }
      );
    }

    // Update trip status
    const { data, error } = await supabaseAdmin
      .from('trips')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update trip status error:', error);
      return NextResponse.json({ error: 'Failed to update trip status' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('Update trip error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
