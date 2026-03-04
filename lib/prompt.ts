import { Preference, Trip } from './types';

export function buildItineraryPrompt(trip: Trip, preferences: Preference[]): string {
  // Aggregate preferences
  const budgetBreakdown = preferences.reduce((acc, p) => {
    acc[p.budget_flexibility] = (acc[p.budget_flexibility] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const accommodationBreakdown = preferences.reduce((acc, p) => {
    acc[p.accommodation_style] = (acc[p.accommodation_style] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const allInterests = preferences.flatMap(p => p.activity_interests);
  const interestCounts = allInterests.reduce((acc, interest) => {
    acc[interest] = (acc[interest] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const paceBreakdown = preferences.reduce((acc, p) => {
    acc[p.pace] = (acc[p.pace] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const hardNos = preferences
    .map(p => p.hard_nos)
    .filter(Boolean)
    .join('; ');

  const tripDays = Math.ceil(
    (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  return `You are a travel planning expert. Generate exactly 3 distinct itinerary options for a group trip.

TRIP DETAILS:
- Destination: ${trip.destination}
- Dates: ${trip.start_date} to ${trip.end_date} (${tripDays} days)
- Group size: ${preferences.length} people
- Budget per person: $${(trip.budget_per_person / 100).toFixed(0)} total

GROUP PREFERENCES (${preferences.length} members):
- Budget flexibility: ${JSON.stringify(budgetBreakdown)}
- Accommodation preference: ${JSON.stringify(accommodationBreakdown)}
- Activity interests (votes): ${JSON.stringify(interestCounts)}
- Pace preference: ${JSON.stringify(paceBreakdown)}
${hardNos ? `- Hard no's: ${hardNos}` : '- No hard no\'s listed'}

INSTRUCTIONS:
Generate 3 DIFFERENT itinerary options that cater to different balances of the group's preferences. Each option should have a distinct personality:
- Option 1: Best overall balance of everyone's preferences
- Option 2: Leans into the most popular activity interests
- Option 3: The adventurous/unexpected pick

Respond ONLY with valid JSON matching this exact structure, no markdown, no backticks, no explanation:
{
  "options": [
    {
      "option_name": "Short catchy name",
      "description": "2-3 sentence overview of this itinerary's vibe",
      "accommodation": "Where the group stays and why",
      "daily_activities": [
        {
          "day": 1,
          "morning": "Activity description",
          "afternoon": "Activity description",
          "evening": "Activity description"
        }
      ],
      "estimated_cost_per_person": 45000,
      "why_this_works": "1-2 sentences on why this option fits the group"
    }
  ]
}

IMPORTANT:
- estimated_cost_per_person is in CENTS (e.g. 45000 = $450)
- Include a daily_activities entry for each day of the trip
- Make options genuinely different, not just minor variations
- Respect the hard no's — never include anything the group explicitly rejected
- Keep activities realistic and specific to ${trip.destination}`;
}
