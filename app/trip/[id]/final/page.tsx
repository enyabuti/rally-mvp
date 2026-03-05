'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, Option, Member } from '@/lib/types';

export default function FinalItineraryPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [winningOption, setWinningOption] = useState<Option | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [tripRes, optionsRes, membersRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/options`),
        fetch(`/api/trips/${tripId}/members`)
      ]);

      if (!tripRes.ok) throw new Error('Failed to fetch trip');

      const tripData = await tripRes.json();
      setTrip(tripData);

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData);
      }

      if (optionsRes.ok && tripData.winning_option_id) {
        const optionsData = await optionsRes.json();
        const winning = optionsData.find((o: Option) => o.id === tripData.winning_option_id);
        setWinningOption(winning || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(cents: number) {
    return (cents / 100).toFixed(0);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  function formatDateRange(start: string, end: string) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-rally-text-sec">Loading itinerary...</div>
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

  if (trip.status !== 'locked' || !trip.winning_option_id) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-rally-border/20 flex items-center justify-center mx-auto mb-4 text-rally-text-muted text-3xl">
            ⏳
          </div>
          <h2 className="font-serif text-3xl text-rally-black mb-3">Trip not locked yet</h2>
          <p className="text-rally-text-sec mb-8 max-w-md mx-auto">
            The final itinerary will be available once voting is complete and the trip is locked.
          </p>
        </div>
        <button
          onClick={() => router.push(`/trip/${tripId}`)}
          className="px-8 py-3.5 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all"
        >
          Back to Trip
        </button>
      </div>
    );
  }

  if (!winningOption) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <p className="text-rally-text-sec">Winning option not found</p>
      </div>
    );
  }

  const committedMembers = members.filter(m => m.status === 'committed');
  const totalCost = winningOption.estimated_cost_per_person * committedMembers.length;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header Section */}
      <div className="text-center mb-8">
        <button
          onClick={() => router.push(`/trip/${tripId}`)}
          className="mb-4 text-sm text-rally-blue font-semibold hover:underline"
        >
          ← Back to trip
        </button>

        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rally-green mb-5 text-white text-4xl">
          ✓
        </div>

        <h1 className="font-serif text-4xl text-rally-black mb-2 tracking-tight">
          {trip.name}
        </h1>
        <p className="text-lg text-rally-text-sec mb-1">{trip.destination}</p>
        <p className="text-sm text-rally-text-muted mb-6">
          {formatDateRange(trip.start_date, trip.end_date)}
        </p>

        <div className="inline-block bg-rally-green-light border border-rally-green-border rounded-lg px-6 py-3">
          <p className="text-sm text-rally-text-muted mb-1">Final Itinerary</p>
          <p className="text-2xl font-bold text-rally-black">{winningOption.option_name}</p>
        </div>
      </div>

      {/* Trip Summary Card */}
      <div className="bg-rally-offwhite border border-rally-border rounded-card p-6 mb-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-rally-blue mb-1">
              ${formatCurrency(winningOption.estimated_cost_per_person)}
            </p>
            <p className="text-xs text-rally-text-sec font-medium">Per Person</p>
          </div>
          <div className="text-center border-l border-r border-rally-border">
            <p className="text-2xl font-bold text-rally-blue mb-1">
              {committedMembers.length}
            </p>
            <p className="text-xs text-rally-text-sec font-medium">Travelers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-rally-blue mb-1">
              {winningOption.daily_activities.length}
            </p>
            <p className="text-xs text-rally-text-sec font-medium">Days</p>
          </div>
        </div>

        <div className="border-t border-rally-border pt-4">
          <p className="text-sm text-rally-text font-semibold mb-2">Accommodation</p>
          <p className="text-sm text-rally-text-sec">{winningOption.accommodation}</p>
        </div>
      </div>

      {/* Itinerary Description */}
      <div className="bg-white border border-rally-border rounded-card p-6 mb-6">
        <h2 className="font-serif text-2xl text-rally-black mb-3">About This Trip</h2>
        <p className="text-sm text-rally-text-sec leading-relaxed mb-4">
          {winningOption.description}
        </p>
        <div className="bg-rally-blue-light border-l-4 border-rally-blue rounded-lg p-4">
          <p className="text-xs text-rally-text-muted font-semibold uppercase tracking-wide mb-2">
            Why This Works For Your Group
          </p>
          <p className="text-sm text-rally-text-sec leading-relaxed">
            {winningOption.why_this_works}
          </p>
        </div>
      </div>

      {/* Day by Day Itinerary */}
      <div className="bg-white border border-rally-border rounded-card p-6 mb-6">
        <h2 className="font-serif text-2xl text-rally-black mb-5">Your Day-by-Day</h2>

        <div className="space-y-6">
          {winningOption.daily_activities.map((day, index) => (
            <div key={index} className="relative">
              {/* Timeline connector */}
              {index < winningOption.daily_activities.length - 1 && (
                <div className="absolute left-[15px] top-[40px] bottom-[-24px] w-0.5 bg-rally-border" />
              )}

              <div className="flex gap-4">
                {/* Day number badge */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-rally-blue text-white flex items-center justify-center font-bold text-sm z-10">
                  {day.day}
                </div>

                {/* Day content */}
                <div className="flex-1">
                  <p className="text-xs text-rally-text-muted font-semibold uppercase tracking-wide mb-3">
                    Day {day.day}
                  </p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-rally-blue mb-1">Morning</p>
                      <p className="text-sm text-rally-text-sec leading-relaxed">{day.morning}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-rally-blue mb-1">Afternoon</p>
                      <p className="text-sm text-rally-text-sec leading-relaxed">{day.afternoon}</p>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-rally-blue mb-1">Evening</p>
                      <p className="text-sm text-rally-text-sec leading-relaxed">{day.evening}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crew Members */}
      <div className="bg-white border border-rally-border rounded-card p-6 mb-6">
        <h2 className="font-serif text-2xl text-rally-black mb-4">Your Crew</h2>
        <div className="grid grid-cols-2 gap-3">
          {committedMembers.map((member, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-rally-offwhite rounded-lg">
              <div className="w-10 h-10 rounded-full bg-rally-blue text-white flex items-center justify-center font-bold">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-semibold text-rally-text">{member.name}</p>
                <p className="text-xs text-rally-text-muted">{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-rally-green-light border border-rally-green-border rounded-card p-6">
        <h2 className="font-serif text-2xl text-rally-black mb-4">Cost Breakdown</h2>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-rally-text-sec">Price per person</span>
            <span className="text-rally-text font-semibold">${formatCurrency(winningOption.estimated_cost_per_person)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-rally-text-sec">Number of travelers</span>
            <span className="text-rally-text font-semibold">× {committedMembers.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-rally-text-sec">Deposit paid per person</span>
            <span className="text-rally-text font-semibold">${formatCurrency(trip.deposit_amount)}</span>
          </div>
        </div>

        <div className="border-t border-rally-green-border pt-4 flex justify-between">
          <span className="text-lg font-bold text-rally-black">Total Trip Cost</span>
          <span className="text-lg font-bold text-rally-green">${formatCurrency(totalCost)}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-rally-green-border">
          <div className="flex justify-between text-sm">
            <span className="text-rally-text-sec">Remaining per person</span>
            <span className="text-rally-text font-semibold">
              ${formatCurrency(winningOption.estimated_cost_per_person - trip.deposit_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Print/Share Actions */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 bg-white border-2 border-rally-blue text-rally-blue font-bold text-sm rounded-button hover:bg-rally-blue-light transition-all"
        >
          Print Itinerary
        </button>
        <button
          onClick={() => router.push(`/trip/${tripId}`)}
          className="flex-1 py-3 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all"
        >
          Back to Trip Dashboard
        </button>
      </div>
    </div>
  );
}
