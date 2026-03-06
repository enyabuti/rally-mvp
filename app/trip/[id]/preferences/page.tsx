'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, ActivityInterest, BudgetFlexibility, AccommodationStyle, Pace } from '@/lib/types';

export default function PreferencesPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [budgetFlexibility, setBudgetFlexibility] = useState<BudgetFlexibility | ''>('');
  const [accommodationStyle, setAccommodationStyle] = useState<AccommodationStyle | ''>('');
  const [activityInterests, setActivityInterests] = useState<ActivityInterest[]>([]);
  const [pace, setPace] = useState<Pace | ''>('');
  const [hardNos, setHardNos] = useState('');

  // Mock member ID - in real app, this would come from auth
  const [memberId, setMemberId] = useState<string>('');

  useEffect(() => {
    fetchTripData();
  }, [tripId]);

  async function fetchTripData() {
    try {
      setLoading(true);
      const [tripRes, membersRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/members`)
      ]);

      if (!tripRes.ok) throw new Error('Failed to fetch trip');

      const tripData = await tripRes.json();
      setTrip(tripData);

      // Get the first member (organizer) as the current user
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        if (membersData.length > 0) {
          setMemberId(membersData[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleInterest(interest: ActivityInterest) {
    setActivityInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!budgetFlexibility || !accommodationStyle || !pace || activityInterests.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    if (!memberId) {
      alert('Member ID not found. Please refresh the page and try again.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          member_id: memberId,
          budget_flexibility: budgetFlexibility,
          accommodation_style: accommodationStyle,
          activity_interests: activityInterests,
          pace,
          hard_nos: hardNos || null,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit preferences');

      // Redirect to options page after successful submission
      router.push(`/trip/${tripId}/options`);
    } catch (err) {
      console.error(err);
      alert('Failed to submit preferences. Please try again.');
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-rally-text-sec">Loading...</div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <p className="text-rally-text-sec">Trip not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12">
      <button
        onClick={() => router.push(`/trip/${tripId}`)}
        className="mb-4 text-sm text-rally-blue font-semibold hover:underline"
      >
        ← Back to trip
      </button>

      <h1 className="font-serif text-3xl text-rally-black mb-2 tracking-tight">
        Your travel preferences
      </h1>
      <p className="text-rally-text-sec mb-7">
        This helps AI build itinerary options that actually work for everyone. Takes 2 minutes.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Budget Flexibility */}
        <div>
          <label className="block text-sm font-bold text-rally-text mb-2.5">
            Budget flexibility
          </label>
          <div className="flex gap-2">
            {(['strict', 'flexible', 'whatever'] as BudgetFlexibility[]).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setBudgetFlexibility(val)}
                className={`flex-1 py-2.5 px-4 border-2 rounded-input text-sm font-semibold capitalize transition-all ${
                  budgetFlexibility === val
                    ? 'border-rally-blue bg-rally-blue-light text-rally-blue'
                    : 'border-rally-border bg-white text-rally-text-sec'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Accommodation Style */}
        <div>
          <label className="block text-sm font-bold text-rally-text mb-2.5">
            Accommodation style
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(['hostel', 'airbnb', 'hotel', 'no_preference'] as AccommodationStyle[]).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAccommodationStyle(val)}
                className={`py-2.5 px-4 border-2 rounded-input text-sm font-semibold capitalize transition-all ${
                  accommodationStyle === val
                    ? 'border-rally-blue bg-rally-blue-light text-rally-blue'
                    : 'border-rally-border bg-white text-rally-text-sec'
                }`}
              >
                {val.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Interests */}
        <div>
          <label className="block text-sm font-bold text-rally-text mb-2.5">
            What are you into? (pick all that apply)
          </label>
          <div className="flex flex-wrap gap-2">
            {(['food', 'nightlife', 'outdoors', 'culture', 'relaxation', 'adventure'] as ActivityInterest[]).map(val => (
              <button
                key={val}
                type="button"
                onClick={() => toggleInterest(val)}
                className={`py-2 px-4 border-2 rounded-full text-sm font-semibold capitalize transition-all ${
                  activityInterests.includes(val)
                    ? 'border-rally-blue bg-rally-blue-light text-rally-blue'
                    : 'border-rally-border bg-white text-rally-text-sec'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Pace */}
        <div>
          <label className="block text-sm font-bold text-rally-text mb-2.5">
            Preferred pace
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            {[
              { val: 'packed' as Pace, desc: 'See everything' },
              { val: 'balanced' as Pace, desc: 'Mix of plans & free time' },
              { val: 'chill' as Pace, desc: 'Go with the flow' },
            ].map(item => (
              <button
                key={item.val}
                type="button"
                onClick={() => setPace(item.val)}
                className={`flex-1 py-3 px-4 border-2 rounded-input text-sm font-semibold capitalize transition-all text-center ${
                  pace === item.val
                    ? 'border-rally-blue bg-rally-blue-light text-rally-blue'
                    : 'border-rally-border bg-white text-rally-text-sec'
                }`}
              >
                <div className="font-bold">{item.val}</div>
                <div className="text-[10px] font-normal mt-0.5 text-rally-text-muted">
                  {item.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Hard Nos */}
        <div>
          <label className="block text-sm font-bold text-rally-text mb-2.5">
            Any hard no's?
          </label>
          <textarea
            value={hardNos}
            onChange={(e) => setHardNos(e.target.value)}
            placeholder="Anything you absolutely don't want on this trip (e.g. no hostels, no early mornings, no museums...)"
            className="w-full px-4 py-3 border-2 border-rally-border rounded-input text-sm min-h-[80px] resize-y focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Submitting...' : 'Submit Preferences'}
        </button>
      </form>
    </div>
  );
}
