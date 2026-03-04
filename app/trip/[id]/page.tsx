'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, Member } from '@/lib/types';

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      if (!tripRes.ok || !membersRes.ok) {
        throw new Error('Failed to fetch trip data');
      }

      const tripData = await tripRes.json();
      const membersData = await membersRes.json();

      setTrip(tripData);
      setMembers(membersData);
    } catch (err) {
      setError('Failed to load trip. Please check the URL and try again.');
      console.error(err);
    } finally {
      setLoading(false);
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
  const prefsSubmitted = members.filter(m => m.status === 'committed').length; // TODO: Add preferences check

  return (
    <div className="max-w-3xl mx-auto">
      {/* Trip Header Card */}
      <div className="bg-rally-offwhite border border-rally-border rounded-card p-6 mb-5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="font-serif text-3xl text-rally-black mb-1 font-normal tracking-tight">
              {trip.name}
            </h1>
            <p className="text-sm text-rally-text-sec">{trip.destination}</p>
          </div>
          <span className={`
            text-[11px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wide
            ${trip.status === 'locked' ? 'bg-rally-green-light text-rally-green' :
              trip.status === 'voting' ? 'bg-rally-blue-light text-rally-blue' :
              'bg-amber-50 text-amber-600'}
          `}>
            {trip.status}
          </span>
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

        {/* Share Link */}
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
      </div>

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

      {/* Action Buttons */}
      <div className="space-y-3">
        {trip.status === 'open' && committed > 0 && (
          <button
            onClick={() => router.push(`/trip/${tripId}/preferences`)}
            className="w-full py-4 bg-white border-2 border-rally-blue text-rally-blue font-bold text-sm rounded-button hover:bg-rally-blue-light transition-all"
          >
            Submit Your Travel Preferences
          </button>
        )}

        {trip.status === 'preferences' && (
          <button
            onClick={() => router.push(`/trip/${tripId}/options`)}
            className="w-full py-4 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            View AI-Generated Trip Options
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
    </div>
  );
}
