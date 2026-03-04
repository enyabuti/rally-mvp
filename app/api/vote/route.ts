import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { VoteRequest } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body: VoteRequest = await request.json();

    if (!body.trip_id || !body.member_id || !body.option_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user already voted
    const { data: existingVote } = await supabaseAdmin
      .from('votes')
      .select('id')
      .eq('trip_id', body.trip_id)
      .eq('member_id', body.member_id)
      .single();

    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 400 });
    }

    // Insert vote
    const { error: voteError } = await supabaseAdmin
      .from('votes')
      .insert({
        trip_id: body.trip_id,
        member_id: body.member_id,
        option_id: body.option_id,
      });

    if (voteError) {
      console.error('Vote insert error:', voteError);
      return NextResponse.json({ error: 'Failed to record vote' }, { status: 500 });
    }

    // Check if we have majority
    const { data: members } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('trip_id', body.trip_id)
      .eq('status', 'committed');

    const { data: votes } = await supabaseAdmin
      .from('votes')
      .select('option_id')
      .eq('trip_id', body.trip_id);

    const totalMembers = members?.length || 0;
    const totalVotes = votes?.length || 0;

    // Count votes per option
    const voteCounts: Record<string, number> = {};
    votes?.forEach(vote => {
      voteCounts[vote.option_id] = (voteCounts[vote.option_id] || 0) + 1;
    });

    // Check if any option has majority (more than 50%)
    const majorityThreshold = Math.ceil(totalMembers / 2);
    let winningOptionId: string | null = null;

    for (const [optionId, count] of Object.entries(voteCounts)) {
      if (count >= majorityThreshold) {
        winningOptionId = optionId;
        break;
      }
    }

    // If we have a winner, lock the trip
    if (winningOptionId) {
      await supabaseAdmin
        .from('trips')
        .update({
          status: 'locked',
          winning_option_id: winningOptionId,
        })
        .eq('id', body.trip_id);

      return NextResponse.json({ success: true, locked: true, winning_option_id: winningOptionId });
    }

    return NextResponse.json({ success: true, locked: false });
  } catch (err) {
    console.error('Vote error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
