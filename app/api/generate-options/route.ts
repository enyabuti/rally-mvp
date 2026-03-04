import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Increase timeout for AI generation
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const { trip_id } = await request.json();

    if (!trip_id) {
      return NextResponse.json({ error: 'Missing trip_id' }, { status: 400 });
    }

    // Fetch trip details
    const { data: trip, error: tripError } = await supabaseAdmin
      .from('trips')
      .select('*')
      .eq('id', trip_id)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
    }

    // Fetch all preferences for this trip
    const { data: preferences, error: prefsError } = await supabaseAdmin
      .from('preferences')
      .select('*')
      .eq('trip_id', trip_id);

    if (prefsError || !preferences || preferences.length === 0) {
      return NextResponse.json({ error: 'No preferences found' }, { status: 400 });
    }

    // Build prompt for Claude
    const prompt = `You are a travel planning AI. Generate exactly 3 diverse itinerary options for a group trip based on the following information:

**Trip Details:**
- Destination: ${trip.destination}
- Dates: ${trip.start_date} to ${trip.end_date}
- Budget per person: $${trip.budget_per_person / 100}
- Number of travelers: ${preferences.length}

**Group Preferences:**
${preferences.map((p, i) => `
Member ${i + 1}:
- Budget flexibility: ${p.budget_flexibility}
- Accommodation style: ${p.accommodation_style}
- Activity interests: ${p.activity_interests.join(', ')}
- Pace: ${p.pace}
- Hard nos: ${p.hard_nos || 'None'}
`).join('\n')}

Please generate 3 different itinerary options that:
1. Balance everyone's preferences
2. Stay within or close to the budget
3. Offer different vibes/approaches (e.g., one cultural, one foodie-focused, one adventure)
4. Include specific, actionable daily plans

Return ONLY a valid JSON array with this exact structure (no markdown, no explanation):
[
  {
    "option_name": "The Culture Crawl",
    "description": "Brief one-sentence description",
    "accommodation": "Specific accommodation recommendation with location",
    "daily_activities": [
      {
        "day": 1,
        "morning": "Morning activity",
        "afternoon": "Afternoon activity",
        "evening": "Evening activity"
      }
    ],
    "estimated_cost_per_person": 48000,
    "why_this_works": "Explain why this works for the group's preferences"
  }
]

Important:
- estimated_cost_per_person should be in CENTS (e.g., 48000 for $480)
- Include a daily_activities entry for each day of the trip
- Be specific with recommendations (actual restaurant names, neighborhoods, activities)
- Make sure all 3 options are distinctly different`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Clean markdown code fences if present
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let options;
    try {
      options = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Claude response:', cleanedText);
      return NextResponse.json({
        error: 'Failed to parse AI response',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, { status: 500 });
    }

    // Insert options into database
    const optionsToInsert = options.map((opt: any) => ({
      trip_id,
      option_name: opt.option_name,
      description: opt.description,
      accommodation: opt.accommodation,
      daily_activities: opt.daily_activities,
      estimated_cost_per_person: opt.estimated_cost_per_person,
      why_this_works: opt.why_this_works,
      vote_count: 0,
    }));

    const { data: insertedOptions, error: insertError } = await supabaseAdmin
      .from('options')
      .insert(optionsToInsert)
      .select('*');

    if (insertError) {
      console.error('Insert options error:', insertError);
      return NextResponse.json({ error: 'Failed to save options' }, { status: 500 });
    }

    // Update trip status to 'voting'
    await supabaseAdmin
      .from('trips')
      .update({ status: 'voting' })
      .eq('id', trip_id);

    return NextResponse.json({ success: true, options: insertedOptions });
  } catch (err: any) {
    console.error('Generate options error:', err);
    return NextResponse.json({
      error: 'Failed to generate options',
      details: err.message || String(err),
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }, { status: 500 });
  }
}
