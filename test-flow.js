/**
 * Rally MVP - End-to-End Flow Test
 * Tests the complete user journey from trip creation to AI option generation
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// ANSI color codes for pretty output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step, message) {
  console.log(`\n${colors.cyan}[STEP ${step}]${colors.reset} ${message}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✓ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}✗ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠ ${message}${colors.reset}`);
}

// Test data
const testTrip = {
  name: 'Test Trip to Lisbon',
  destination: 'Lisbon, Portugal',
  start_date: '2026-06-15',
  end_date: '2026-06-19',
  budget_per_person: 50000, // $500 in cents
  deposit_amount: 2500, // $25 in cents
  organizer_name: 'Test Organizer',
  organizer_email: 'test@example.com',
};

const testPreferences = {
  budget_flexibility: 'flexible',
  accommodation_style: 'airbnb',
  activity_interests: ['food', 'culture', 'nightlife'],
  pace: 'balanced',
  hard_nos: 'No early mornings before 9am',
};

let tripId = null;
let memberId = null;

async function test1_CreateTrip() {
  logStep(1, 'Testing Trip Creation');

  try {
    const response = await fetch(`${BASE_URL}/api/create-trip`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testTrip),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    if (!data.id) {
      throw new Error('No trip ID returned');
    }

    tripId = data.id;
    logSuccess(`Trip created with ID: ${tripId}`);
    return true;
  } catch (error) {
    logError(`Failed to create trip: ${error.message}`);
    return false;
  }
}

async function test2_FetchTrip() {
  logStep(2, 'Testing Trip Retrieval');

  if (!tripId) {
    logError('No trip ID available (previous test failed)');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/trips/${tripId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const trip = await response.json();

    // Verify trip data
    if (trip.name !== testTrip.name) {
      throw new Error(`Trip name mismatch: expected "${testTrip.name}", got "${trip.name}"`);
    }
    if (trip.status !== 'open') {
      throw new Error(`Trip status should be "open", got "${trip.status}"`);
    }

    logSuccess(`Trip retrieved successfully`);
    logSuccess(`  - Name: ${trip.name}`);
    logSuccess(`  - Destination: ${trip.destination}`);
    logSuccess(`  - Status: ${trip.status}`);
    return true;
  } catch (error) {
    logError(`Failed to fetch trip: ${error.message}`);
    return false;
  }
}

async function test3_FetchMembers() {
  logStep(3, 'Testing Members Retrieval (Organizer Auto-Add)');

  if (!tripId) {
    logError('No trip ID available');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/trips/${tripId}/members`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const members = await response.json();

    if (!Array.isArray(members) || members.length === 0) {
      throw new Error('No members found (organizer should be auto-added)');
    }

    const organizer = members[0];
    if (organizer.email !== testTrip.organizer_email) {
      throw new Error(`Organizer email mismatch`);
    }
    if (organizer.status !== 'committed') {
      throw new Error(`Organizer status should be "committed", got "${organizer.status}"`);
    }
    if (!organizer.paid) {
      throw new Error('Organizer should be marked as paid');
    }

    memberId = organizer.id;
    logSuccess(`Organizer auto-added as member`);
    logSuccess(`  - Name: ${organizer.name}`);
    logSuccess(`  - Email: ${organizer.email}`);
    logSuccess(`  - Status: ${organizer.status}`);
    logSuccess(`  - Member ID: ${memberId}`);
    return true;
  } catch (error) {
    logError(`Failed to fetch members: ${error.message}`);
    return false;
  }
}

async function test4_SubmitPreferences() {
  logStep(4, 'Testing Preferences Submission');

  if (!tripId || !memberId) {
    logError('Missing trip ID or member ID');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        trip_id: tripId,
        member_id: memberId,
        ...testPreferences,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    if (!data.success && !data.id) {
      throw new Error('Invalid response format');
    }

    logSuccess(`Preferences submitted successfully`);
    logSuccess(`  - Budget: ${testPreferences.budget_flexibility}`);
    logSuccess(`  - Accommodation: ${testPreferences.accommodation_style}`);
    logSuccess(`  - Activities: ${testPreferences.activity_interests.join(', ')}`);
    logSuccess(`  - Pace: ${testPreferences.pace}`);
    return true;
  } catch (error) {
    logError(`Failed to submit preferences: ${error.message}`);
    return false;
  }
}

async function test5_GenerateOptions() {
  logStep(5, 'Testing AI Option Generation');

  if (!tripId) {
    logError('No trip ID available');
    return false;
  }

  logWarning('This test may take 15-30 seconds...');

  try {
    const response = await fetch(`${BASE_URL}/api/generate-options`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trip_id: tripId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    if (!data.options || !Array.isArray(data.options)) {
      throw new Error('No options array in response');
    }

    if (data.options.length !== 3) {
      logWarning(`Expected 3 options, got ${data.options.length}`);
    }

    logSuccess(`AI generated ${data.options.length} options`);
    data.options.forEach((opt, i) => {
      logSuccess(`  Option ${i + 1}: ${opt.option_name}`);
      logSuccess(`    - Cost: $${opt.estimated_cost_per_person / 100}`);
      logSuccess(`    - Days: ${opt.daily_activities.length}`);
    });

    return true;
  } catch (error) {
    logError(`Failed to generate options: ${error.message}`);

    // Check for specific errors
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      logError('ANTHROPIC_API_KEY environment variable is not set');
    } else if (error.message.includes('No preferences found')) {
      logError('Preferences were not saved properly (previous test failed)');
    } else if (error.message.includes('parse')) {
      logError('Failed to parse AI response (check Claude API response format)');
    }

    return false;
  }
}

async function test6_FetchOptions() {
  logStep(6, 'Testing Options Retrieval');

  if (!tripId) {
    logError('No trip ID available');
    return false;
  }

  try {
    const response = await fetch(`${BASE_URL}/api/trips/${tripId}/options`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const options = await response.json();

    if (!Array.isArray(options) || options.length === 0) {
      throw new Error('No options found in database');
    }

    logSuccess(`Retrieved ${options.length} options from database`);
    return true;
  } catch (error) {
    logError(`Failed to fetch options: ${error.message}`);
    return false;
  }
}

async function test7_VerifyTripStatus() {
  logStep(7, 'Testing Trip Status Update');

  if (!tripId) {
    logError('No trip ID available');
    return false;
  }

  try {
    // Wait a moment for database to propagate the status update
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = await fetch(`${BASE_URL}/api/trips/${tripId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`HTTP ${response.status}: ${JSON.stringify(error)}`);
    }

    const trip = await response.json();

    if (trip.status !== 'voting') {
      throw new Error(`Trip status should be "voting", got "${trip.status}"`);
    }

    logSuccess(`Trip status correctly updated to "voting"`);
    return true;
  } catch (error) {
    logError(`Failed to verify trip status: ${error.message}`);
    return false;
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n' + '='.repeat(60));
  log('Rally MVP - End-to-End Flow Test Suite', 'blue');
  log(`Testing against: ${BASE_URL}`, 'cyan');
  console.log('='.repeat(60));

  const tests = [
    test1_CreateTrip,
    test2_FetchTrip,
    test3_FetchMembers,
    test4_SubmitPreferences,
    test5_GenerateOptions,
    test6_FetchOptions,
    test7_VerifyTripStatus,
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await test();
    if (result) {
      passed++;
    } else {
      failed++;
      logWarning('Stopping tests due to failure (subsequent tests may depend on this)');
      break;
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  log('Test Results', 'blue');
  console.log('='.repeat(60));
  log(`Total Tests: ${tests.length}`, 'cyan');
  log(`Passed: ${passed}`, 'green');
  log(`Failed: ${failed}`, 'red');

  if (failed === 0) {
    log('\n🎉 All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  logError(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
