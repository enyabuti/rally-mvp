'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Trip, Member } from '@/lib/types';
import PhaseProgress from '@/app/components/PhaseProgress';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [preferencesCount, setPreferencesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Email identification
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [identifyingEmail, setIdentifyingEmail] = useState(false);

  // Join form state
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const paymentSuccess = searchParams.get('success') === 'true';

  useEffect(() => {
    fetchTripData();

    // Check localStorage for saved email
    const savedEmail = localStorage.getItem('rally_user_email');
    if (savedEmail) {
      setUserEmail(savedEmail);
    }
  }, [tripId]);

  // Save trip to localStorage
  useEffect(() => {
    if (trip && userEmail) {
      const role = userEmail === trip.organizer_email ? 'organizer' : 'member';
      saveRecentTrip(trip.id, trip.name, trip.destination, role);
    }
  }, [trip, userEmail]);

  function saveRecentTrip(id: string, name: string, destination: string, role: 'organizer' | 'member') {
    const stored = localStorage.getItem('rally_recent_trips');
    let trips: any[] = [];

    if (stored) {
      try {
        trips = JSON.parse(stored);
      } catch (err) {
        trips = [];
      }
    }

    // Remove existing entry for this trip
    trips = trips.filter(t => t.id !== id);

    // Add to front
    trips.unshift({ id, name, destination, role });

    // Keep only last 5
    trips = trips.slice(0, 5);

    localStorage.setItem('rally_recent_trips', JSON.stringify(trips));
  }

  async function fetchTripData() {
    try {
      setLoading(true);
      const [tripRes, membersRes, prefsCountRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/members`),
        fetch(`/api/trips/${tripId}/preferences-count`)
      ]);

      if (!tripRes.ok || !membersRes.ok) {
        throw new Error('Failed to fetch trip data');
      }

      const tripData = await tripRes.json();
      const membersData = await membersRes.json();

      setTrip(tripData);
      setMembers(membersData);

      if (prefsCountRes.ok) {
        const prefsCountData = await prefsCountRes.json();
        setPreferencesCount(prefsCountData.count || 0);
      }
    } catch (err) {
      setError('Failed to load trip. Please check the URL and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleEmailIdentification(e: React.FormEvent) {
    e.preventDefault();
    if (emailInput.trim()) {
      setUserEmail(emailInput.trim());
      localStorage.setItem('rally_user_email', emailInput.trim());
      setIdentifyingEmail(false);
    }
  }

  function copyShareLink() {
    const shareUrl = `${window.location.origin}/trip/${tripId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatCurrency(cents: number) {
    return `$${(cents / 100).toFixed(0)}`;
  }

  async function handleJoinTrip(e: React.FormEvent) {
    e.preventDefault();
    if (!memberName.trim() || !memberEmail.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          member_name: memberName,
          member_email: memberEmail,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Checkout error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create checkout session');
      }

      const { url } = await res.json();

      // Save email to localStorage before redirecting
      localStorage.setItem('rally_user_email', memberEmail);

      window.location.href = url;
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(`Failed to start checkout: ${err.message}`);
      setSubmitting(false);
    }
  }

  async function handleStatusUpdate(newStatus: string) {
    try {
      const res = await fetch(`/api/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update trip status');
      }

      // Refresh trip data
      await fetchTripData();

      // If moving to voting status, redirect to options page to trigger generation
      if (newStatus === 'voting') {
        router.push(`/trip/${tripId}/options`);
      }
    } catch (err: any) {
      alert(`Failed to update trip status: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-rally-text-sec">Loading trip...</div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="max-w-2xl mx-auto mt-20">
        <div className="bg-red-50 border border-red-200 rounded-card p-6 text-center">
          <h2 className="text-xl font-serif text-rally-black mb-2">Trip not found</h2>
          <p className="text-rally-text-sec mb-4">{error || 'This trip does not exist.'}</p>
          <button
            onClick={() => router.push('/create')}
            className="px-6 py-2 bg-rally-blue text-white rounded-button font-semibold hover:bg-rally-blue-dark transition-colors"
          >
            Create a new trip
          </button>
        </div>
      </div>
    );
  }

  const committed = members.filter(m => m.status === 'committed').length;
  const prefsSubmitted = preferencesCount;
  const isOrganizer = userEmail === trip.organizer_email;
  const isMember = members.some(m => m.email === userEmail);
  const userMember = members.find(m => m.email === userEmail);

  // Email Identification View
  if (!userEmail || identifyingEmail) {
    return (
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="bg-white border border-rally-border rounded-card p-8 text-center">
          <h2 className="font-serif text-2xl text-rally-black mb-3">Identify Yourself</h2>
          <p className="text-rally-text-sec mb-6">
            Enter your email to access this trip
          </p>
          <form onSubmit={handleEmailIdentification} className="max-w-md mx-auto">
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-rally-border rounded-input text-rally-text mb-4 focus:outline-none focus:border-rally-blue"
              required
              autoFocus
            />
            <button
              type="submit"
              className="w-full py-3 bg-rally-blue text-white font-bold rounded-button hover:bg-rally-blue-dark transition-all"
            >
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Join View (for non-members)
  if (!isMember && trip.status === 'open') {
    return (
      <div className="max-w-3xl mx-auto px-4 pb-12">
        {/* Trip Invitation Card */}
        <div className="bg-rally-offwhite border border-rally-border rounded-card p-8 mb-5 text-center">
          <h1 className="font-serif text-4xl text-rally-black mb-3">
            You're invited to {trip.name}
          </h1>
          <p className="text-lg text-rally-text-sec mb-6">{trip.destination}</p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
            {[
              { label: 'Dates', value: `${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}` },
              { label: 'Budget', value: `${formatCurrency(trip.budget_per_person)}/person` },
              { label: 'Deposit', value: formatCurrency(trip.deposit_amount) },
            ].map((item, i) => (
              <div key={i}>
                <p className="text-xs text-rally-text-muted uppercase tracking-wider font-semibold mb-1">
                  {item.label}
                </p>
                <p className="text-sm text-rally-text font-semibold">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 text-rally-text-sec mb-2">
            <span className="text-2xl">{committed}</span>
            <span className="text-sm">crew member{committed !== 1 ? 's' : ''} committed</span>
          </div>
        </div>

        {/* Payment Success Message */}
        {paymentSuccess ? (
          <div className="bg-rally-green-light border border-rally-green-border rounded-card p-8 mb-5 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="font-serif text-3xl text-rally-black mb-3">You're committed!</h3>
            <p className="text-rally-text-sec mb-6">
              Your deposit has been received. You're now part of the crew for {trip.name}!
            </p>
            <button
              onClick={() => router.push(`/trip/${tripId}/preferences`)}
              className="px-8 py-4 bg-rally-blue text-white font-bold rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              Submit Your Travel Preferences
            </button>
          </div>
        ) : (
          /* Join Trip Form */
          <div className="bg-white border border-rally-border rounded-card p-8">
            <h2 className="font-serif text-2xl text-rally-black mb-3">Join This Trip</h2>
            <p className="text-rally-text-sec mb-6">
              Commit to the trip by paying your {formatCurrency(trip.deposit_amount)} deposit. You'll help shape the itinerary!
            </p>

            <form onSubmit={handleJoinTrip} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs text-rally-text-muted font-semibold uppercase tracking-wide mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-rally-border rounded-input text-rally-text placeholder:text-rally-text-muted focus:outline-none focus:border-rally-blue"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs text-rally-text-muted font-semibold uppercase tracking-wide mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  defaultValue={userEmail}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border border-rally-border rounded-input text-rally-text placeholder:text-rally-text-muted focus:outline-none focus:border-rally-blue"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-rally-blue text-white font-bold rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? 'Processing...' : `Commit & Pay ${formatCurrency(trip.deposit_amount)}`}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Member/Organizer View
  return (
    <div className="max-w-3xl mx-auto px-4 pb-12">
      {/* Trip Header Card */}
      <div className="bg-rally-offwhite border border-rally-border rounded-card p-6 mb-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-serif text-3xl text-rally-black mb-1 font-normal tracking-tight">
              {trip.name}
            </h1>
            <p className="text-sm text-rally-text-sec">{trip.destination}</p>
          </div>
          <div className="flex items-center gap-2">
            {isOrganizer && (
              <span className="text-[10px] font-bold px-3 py-1.5 bg-rally-blue-light text-rally-blue rounded-full uppercase tracking-wide">
                Organizer
              </span>
            )}
            <span className={`
              text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide
              ${trip.status === 'locked' ? 'bg-rally-green-light text-rally-green' :
                trip.status === 'voting' ? 'bg-rally-blue-light text-rally-blue' :
                'bg-amber-50 text-amber-600'}
            `}>
              {trip.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { label: 'Dates', value: `${formatDate(trip.start_date)} — ${formatDate(trip.end_date)}` },
            { label: 'Budget', value: `${formatCurrency(trip.budget_per_person)}/person` },
            { label: 'Deposit', value: formatCurrency(trip.deposit_amount) },
          ].map((item, i) => (
            <div key={i}>
              <p className="text-[11px] text-rally-text-muted uppercase tracking-wider font-semibold mb-0.5">
                {item.label}
              </p>
              <p className="text-sm text-rally-text font-semibold">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Share Link - Organizer Only */}
        {isOrganizer && (
          <div className="flex gap-2">
            <div className="flex-1 px-3.5 py-2.5 bg-white border border-rally-border rounded-input text-sm text-rally-text-muted overflow-hidden text-ellipsis whitespace-nowrap">
              {typeof window !== 'undefined' && `${window.location.origin}/trip/${tripId}`}
            </div>
            <button
              onClick={copyShareLink}
              className={`px-5 py-2.5 ${copied ? 'bg-rally-green' : 'bg-rally-black'} text-white rounded-input text-sm font-bold transition-all whitespace-nowrap hover:-translate-y-0.5`}
            >
              {copied ? '✓ Copied' : 'Copy Link'}
            </button>
          </div>
        )}
      </div>

      {/* Phase Progress */}
      <PhaseProgress currentStatus={trip.status as any} />

      {/* Crew Status */}
      <div className="bg-white border border-rally-border rounded-card p-6 mb-5">
        <h2 className="font-serif text-xl text-rally-black mb-4">Crew Status</h2>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-rally-offwhite rounded-lg p-4">
            <p className="text-2xl font-bold text-rally-black mb-1">{committed}</p>
            <p className="text-xs text-rally-text-sec font-medium">Committed</p>
          </div>
          <div className="bg-rally-offwhite rounded-lg p-4">
            <p className="text-2xl font-bold text-rally-black mb-1">{prefsSubmitted}/{committed}</p>
            <p className="text-xs text-rally-text-sec font-medium">Preferences In</p>
          </div>
        </div>

        <div className="space-y-2">
          {members.map((member, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 bg-rally-offwhite rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-rally-blue text-white flex items-center justify-center text-sm font-bold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-rally-text">
                    {member.name}
                    {member.email === userEmail && (
                      <span className="ml-2 text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        You
                      </span>
                    )}
                    {member.email === trip.organizer_email && (
                      <span className="ml-2 text-[10px] bg-rally-blue-light text-rally-blue px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                        Organizer
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-rally-text-muted">{member.email}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                member.status === 'committed' ? 'bg-rally-green-light text-rally-green' : 'bg-amber-50 text-amber-600'
              }`}>
                {member.status === 'committed' ? '✓ Paid' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Organizer Phase Actions */}
      {isOrganizer && (
        <div className="bg-white border border-rally-border rounded-card p-6 mb-5">
          <h2 className="font-serif text-xl text-rally-black mb-4">Organizer Actions</h2>

          {trip.status === 'open' && committed > 0 && (
            <button
              onClick={() => handleStatusUpdate('preferences')}
              className="w-full py-3 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all mb-3"
            >
              Close Signups & Start Preferences Phase
            </button>
          )}

          {trip.status === 'preferences' && prefsSubmitted === committed && committed > 0 && (
            <button
              onClick={() => handleStatusUpdate('voting')}
              className="w-full py-3 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all mb-3"
            >
              Generate AI Trip Options
            </button>
          )}

          {trip.status === 'preferences' && prefsSubmitted < committed && (
            <div className="text-center py-2 text-sm text-rally-text-muted">
              Waiting for all preferences ({prefsSubmitted}/{committed} submitted)
            </div>
          )}
        </div>
      )}

      {/* Member Action Buttons */}
      <div className="space-y-3">
        {trip.status === 'open' && isMember && (
          <button
            onClick={() => router.push(`/trip/${tripId}/preferences`)}
            className="w-full py-4 bg-white border-2 border-rally-blue text-rally-blue font-bold text-sm rounded-button hover:bg-rally-blue-light transition-all"
          >
            Submit Your Travel Preferences
          </button>
        )}

        {trip.status === 'preferences' && isMember && (
          <button
            onClick={() => router.push(`/trip/${tripId}/preferences`)}
            className="w-full py-4 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            {prefsSubmitted > 0 ? 'Update Your Preferences' : 'Submit Your Travel Preferences'}
          </button>
        )}

        {trip.status === 'voting' && (
          <button
            onClick={() => router.push(`/trip/${tripId}/vote`)}
            className="w-full py-4 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Vote on Trip Options
          </button>
        )}

        {trip.status === 'locked' && (
          <div className="bg-rally-green-light border border-rally-green-border rounded-card p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-serif text-2xl text-rally-black mb-2">Trip is locked!</h3>
            <p className="text-rally-text-sec mb-4">
              Your crew has spoken. Time to pack your bags for {trip.destination}!
            </p>
            <button
              onClick={() => router.push(`/trip/${tripId}/final`)}
              className="px-6 py-3 bg-rally-green text-white font-bold text-sm rounded-button hover:bg-green-700 transition-all"
            >
              View Final Itinerary
            </button>
          </div>
        )}
      </div>

      {/* Deadlines */}
      {trip.commitment_deadline && trip.status !== 'locked' && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800 font-semibold mb-1">⏰ Important Dates</p>
          {trip.commitment_deadline && (
            <p className="text-xs text-amber-700">
              Commitment deadline: {formatDate(trip.commitment_deadline)}
            </p>
          )}
          {trip.preference_deadline && (
            <p className="text-xs text-amber-700">
              Preference deadline: {formatDate(trip.preference_deadline)}
            </p>
          )}
        </div>
      )}

      {/* Change Email Link */}
      <div className="mt-4 text-center">
        <button
          onClick={() => setIdentifyingEmail(true)}
          className="text-xs text-rally-text-muted hover:text-rally-blue underline"
        >
          Not {userEmail}? Change email
        </button>
      </div>
    </div>
  );
}
