/**
 * Rally MVP - Setup Test Trip
 * Creates a test trip with options ready for voting
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

const testTrip = {
  name: 'Vote Test Trip',
  destination: 'Barcelona, Spain',
  start_date: '2026-07-10',
  end_date: '2026-07-14',
  budget_per_person: 60000, // $600
  deposit_amount: 3000, // $30
  organizer_name: 'Test User',
  organizer_email: 'voter@example.com',
};

const testPreferences = {
  budget_flexibility: 'flexible',
  accommodation_style: 'airbnb',
  activity_interests: ['food', 'culture', 'nightlife'],
  pace: 'balanced',
  hard_nos: 'No museums',
};

async function setupTestTrip() {
  console.log('\n🚀 Setting up test trip for voting...\n');

  try {
    // Step 1: Create trip
    console.log('1️⃣  Creating trip...');
    const tripRes = await fetch(`${BASE_URL}/api/create-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTrip),
    });

    if (!tripRes.ok) throw new Error('Failed to create trip');
    const trip = await tripRes.json();
    console.log(`   ✅ Trip created: ${trip.id}`);

    // Step 2: Get member ID
    console.log('\n2️⃣  Getting organizer member ID...');
    const membersRes = await fetch(`${BASE_URL}/api/trips/${trip.id}/members`);
    const members = await membersRes.json();
    const memberId = members[0].id;
    console.log(`   ✅ Member ID: ${memberId}`);

    // Step 3: Submit preferences
    console.log('\n3️⃣  Submitting preferences...');
    const prefsRes = await fetch(`${BASE_URL}/api/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trip_id: trip.id,
        member_id: memberId,
        ...testPreferences,
      }),
    });

    if (!prefsRes.ok) throw new Error('Failed to submit preferences');
    console.log('   ✅ Preferences submitted');

    // Step 4: Generate options
    console.log('\n4️⃣  Generating AI options (this takes 15-30 seconds)...');
    const optionsRes = await fetch(`${BASE_URL}/api/generate-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: trip.id }),
    });

    if (!optionsRes.ok) {
      const error = await optionsRes.json();
      throw new Error(`Failed to generate options: ${JSON.stringify(error)}`);
    }

    const optionsData = await optionsRes.json();
    console.log(`   ✅ Generated ${optionsData.options.length} options`);

    // Display voting URL
    console.log('\n' + '='.repeat(60));
    console.log('✨ Test trip ready for voting!');
    console.log('='.repeat(60));
    console.log(`\n📍 Vote URL: ${BASE_URL}/trip/${trip.id}/vote`);
    console.log(`\n🆔 Trip ID: ${trip.id}`);
    console.log(`👤 Member ID: ${memberId}`);
    console.log('\nOptions:');
    optionsData.options.forEach((opt, i) => {
      console.log(`   ${i + 1}. ${opt.option_name} - $${opt.estimated_cost_per_person / 100}`);
    });
    console.log('\n' + '='.repeat(60));
    console.log('\n👉 Open the vote URL above in your browser to test voting!\n');

  } catch (error) {
    console.error('\n❌ Error setting up test trip:', error.message);
    process.exit(1);
  }
}

setupTestTrip();
