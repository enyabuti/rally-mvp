'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, Option, Vote } from '@/lib/types';

export default function VotePage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [myVote, setMyVote] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [tripRes, optionsRes, votesRes, membersRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/options`),
        fetch(`/api/trips/${tripId}/votes`),
        fetch(`/api/trips/${tripId}/members`)
      ]);

      if (!tripRes.ok) throw new Error('Failed to fetch trip');

      const tripData = await tripRes.json();
      setTrip(tripData);

      // Get the organizer (first member) as the current user
      let currentMemberId: string | null = null;
      if (membersRes.ok) {
        const membersData = await membersRes.json();
        if (membersData.length > 0) {
          currentMemberId = membersData[0].id;
          setMemberId(currentMemberId);
        }
      }

      if (optionsRes.ok) {
        const optionsData = await optionsRes.json();
        setOptions(optionsData);
      }

      if (votesRes.ok) {
        const votesData = await votesRes.json();
        setVotes(votesData);

        // Check if current user has voted
        if (currentMemberId) {
          const userVote = votesData.find((v: Vote) => v.member_id === currentMemberId);
          if (userVote) {
            setMyVote(userVote.option_id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVote(optionId: string) {
    if (myVote || !memberId) return; // Already voted or no member ID

    setSubmitting(true);
    try {
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trip_id: tripId,
          member_id: memberId,
          option_id: optionId,
        }),
      });

      if (!res.ok) throw new Error('Failed to submit vote');

      const data = await res.json();
      setMyVote(optionId);

      // If trip is locked, navigate to trip page
      if (data.locked) {
        setTimeout(() => {
          router.push(`/trip/${tripId}`);
        }, 2000);
      } else {
        // Refresh data to show updated vote counts
        fetchData();
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit vote. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function getVoteCount(optionId: string) {
    return votes.filter(v => v.option_id === optionId).length;
  }

  function formatCurrency(cents: number) {
    return (cents / 100).toFixed(0);
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

  if (options.length === 0 && !loading) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 rounded-full bg-rally-border/20 flex items-center justify-center mx-auto mb-4 text-rally-text-muted text-3xl">
            ?
          </div>
          <h2 className="font-serif text-3xl text-rally-black mb-3">No options yet</h2>
          <p className="text-rally-text-sec mb-8 max-w-md mx-auto">
            Trip options need to be generated before voting can begin. Make sure everyone has submitted their preferences first.
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

  if (trip.status === 'locked' && trip.winning_option_id) {
    const winningOption = options.find(o => o.id === trip.winning_option_id);

    return (
      <div className="max-w-3xl mx-auto text-center pt-12">
        <div className="w-16 h-16 rounded-full bg-rally-green flex items-center justify-center mx-auto mb-5 text-white text-3xl">
          ✓
        </div>
        <h2 className="font-serif text-4xl text-rally-black mb-2">Trip locked!</h2>
        {winningOption && (
          <>
            <p className="text-base text-rally-text-sec mb-1">
              {winningOption.option_name} won with {getVoteCount(winningOption.id)} votes
            </p>
            <p className="text-sm text-rally-text-muted mb-8">
              {trip.destination} · {new Date(trip.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — {new Date(trip.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>

            <div className="bg-rally-offwhite border border-rally-border rounded-card p-6 text-left mb-6">
              <h3 className="font-serif text-2xl text-rally-black mb-2">{winningOption.option_name}</h3>
              <p className="text-sm text-rally-text-sec mb-4 leading-relaxed">{winningOption.description}</p>
              <p className="text-sm text-rally-text font-semibold mb-1">Accommodation</p>
              <p className="text-sm text-rally-text-sec mb-4">{winningOption.accommodation}</p>
              <p className="text-sm text-rally-text font-semibold mb-1">Cost per person</p>
              <p className="text-xl text-rally-blue font-bold">${formatCurrency(winningOption.estimated_cost_per_person)}</p>
            </div>
          </>
        )}

        <button
          onClick={() => router.push(`/trip/${tripId}`)}
          className="px-8 py-3.5 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all"
        >
          View Trip Dashboard
        </button>
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
        Vote for your favorite
      </h1>
      <p className="text-rally-text-sec mb-6">
        {myVote ? "Your vote has been recorded. Waiting for others..." : "Pick the option that works best for you. Majority wins."}
      </p>

      <div className="space-y-4">
        {options.map((opt) => {
          const voteCount = getVoteCount(opt.id);
          const isSelected = myVote === opt.id;

          return (
            <div
              key={opt.id}
              className={`border-2 rounded-card overflow-hidden transition-all ${
                isSelected
                  ? 'border-rally-blue bg-rally-blue-light'
                  : 'border-rally-border bg-white hover:border-rally-blue/30'
              }`}
            >
              <div className="p-5 sm:p-6">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-serif text-xl sm:text-2xl text-rally-black mb-1 font-normal">
                      {opt.option_name}
                    </h3>
                    <p className="text-sm sm:text-base text-rally-text-sec leading-relaxed">
                      {opt.description}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <p className="text-lg font-bold text-rally-blue">
                      ${formatCurrency(opt.estimated_cost_per_person)}
                      <span className="text-xs font-normal text-rally-text-muted">/pp</span>
                    </p>
                  </div>
                </div>

                {myVote && (
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex-1 bg-rally-border/20 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rally-blue h-full transition-all"
                        style={{ width: `${(voteCount / votes.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-rally-text">
                      {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                    </span>
                  </div>
                )}

                <button
                  onClick={() => handleVote(opt.id)}
                  disabled={!!myVote || submitting || !memberId}
                  className={`w-full py-4 min-h-[48px] rounded-button text-sm font-bold transition-all ${
                    isSelected
                      ? 'bg-rally-green text-white'
                      : myVote
                      ? 'bg-rally-border/20 text-rally-text-muted cursor-not-allowed'
                      : !memberId
                      ? 'bg-rally-border/20 text-rally-text-muted cursor-not-allowed'
                      : 'bg-rally-blue text-white hover:bg-rally-blue-dark hover:-translate-y-0.5 hover:shadow-lg'
                  }`}
                >
                  {isSelected ? '✓ You voted for this' : myVote ? 'You voted for another option' : !memberId ? 'Loading...' : submitting ? 'Voting...' : 'Vote for this'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {myVote && (
        <div className="mt-6 p-4 bg-rally-blue-light border border-rally-blue/20 rounded-lg text-center">
          <p className="text-sm text-rally-blue font-semibold">
            Your vote is in! The trip will lock when the majority agrees.
          </p>
        </div>
      )}
    </div>
  );
}
