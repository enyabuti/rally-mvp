'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Trip, Option, DayActivity } from '@/lib/types';

export default function OptionsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tripId]);

  async function fetchData() {
    try {
      setLoading(true);
      const [tripRes, optionsRes] = await Promise.all([
        fetch(`/api/trips/${tripId}`),
        fetch(`/api/trips/${tripId}/options`)
      ]);

      if (!tripRes.ok) throw new Error('Failed to fetch trip');

      const tripData = await tripRes.json();
      setTrip(tripData);

      if (optionsRes.ok) {
        const optionsData = await optionsRes.json();
        setOptions(optionsData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function generateOptions() {
    setGenerating(true);
    try {
      const res = await fetch('/api/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: tripId }),
      });

      if (!res.ok) throw new Error('Failed to generate options');

      const data = await res.json();
      setOptions(data.options);
    } catch (err) {
      console.error(err);
      alert('Failed to generate options. Please try again.');
    } finally {
      setGenerating(false);
    }
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

  if (generating) {
    return (
      <div className="max-w-2xl mx-auto text-center pt-24">
        <div className="w-14 h-14 rounded-full bg-rally-blue-light flex items-center justify-center mx-auto mb-5 animate-pulse">
          <div className="w-6 h-6 rounded-full border-3 border-rally-blue border-t-transparent animate-spin" />
        </div>
        <h2 className="font-serif text-2xl text-rally-black mb-2">Generating your options...</h2>
        <p className="text-sm text-rally-text-sec max-w-sm mx-auto">
          AI is analyzing everyone's preferences to build itinerary options that work for your crew.
        </p>
      </div>
    );
  }

  if (options.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => router.push(`/trip/${tripId}`)}
          className="mb-4 text-sm text-rally-blue font-semibold hover:underline"
        >
          ← Back to trip
        </button>

        <div className="text-center py-12">
          <h2 className="font-serif text-2xl text-rally-black mb-3">Ready to generate options?</h2>
          <p className="text-rally-text-sec mb-6">
            AI will create 2-3 itinerary options based on everyone's preferences.
          </p>
          <button
            onClick={generateOptions}
            className="px-8 py-4 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
          >
            Generate AI Options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <button
        onClick={() => router.push(`/trip/${tripId}`)}
        className="mb-4 text-sm text-rally-blue font-semibold hover:underline"
      >
        ← Back to trip
      </button>

      <h1 className="font-serif text-3xl text-rally-black mb-2 tracking-tight">
        {options.length} options for your crew
      </h1>
      <p className="text-rally-text-sec mb-6">
        AI built these from everyone's preferences. Review them, then vote.
      </p>

      {options.map((opt, i) => (
        <div key={opt.id} className="border border-rally-border rounded-card overflow-hidden mb-4">
          {/* Option Header */}
          <div className={`p-5 pb-4 ${i === 0 ? 'bg-rally-blue-light' : 'bg-white'}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] text-rally-text-muted font-semibold uppercase tracking-wider mb-1">
                  Option {i + 1}
                </p>
                <h3 className="font-serif text-xl text-rally-black mb-1.5 font-normal">
                  {opt.option_name}
                </h3>
              </div>
              <span className="text-lg font-bold text-rally-blue">
                ${formatCurrency(opt.estimated_cost_per_person)}
                <span className="text-xs font-normal text-rally-text-muted">/pp</span>
              </span>
            </div>
            <p className="text-sm text-rally-text-sec leading-relaxed">
              {opt.description}
            </p>
          </div>

          {/* Accommodation */}
          <div className="px-5 pt-4">
            <p className="text-[11px] text-rally-text-muted font-semibold uppercase tracking-wider mb-2">
              Accommodation
            </p>
            <p className="text-sm text-rally-text-sec mb-4">
              {opt.accommodation}
            </p>
          </div>

          {/* Day by Day */}
          <div className="px-5 pb-4">
            <p className="text-[11px] text-rally-text-muted font-semibold uppercase tracking-wider mb-2.5">
              Day by day
            </p>
            {opt.daily_activities.map((day, j) => (
              <div
                key={j}
                className={`py-2.5 ${j < opt.daily_activities.length - 1 ? 'border-b border-rally-border' : ''}`}
              >
                <p className="text-xs font-bold text-rally-blue mb-1">
                  Day {day.day}
                </p>
                <p className="text-xs text-rally-text-sec leading-relaxed">
                  <span className="text-rally-text font-semibold">AM</span> {day.morning}{' '}
                  <span className="text-rally-text-muted">·</span>{' '}
                  <span className="text-rally-text font-semibold">PM</span> {day.afternoon}{' '}
                  <span className="text-rally-text-muted">·</span>{' '}
                  <span className="text-rally-text font-semibold">EVE</span> {day.evening}
                </p>
              </div>
            ))}
          </div>

          {/* Why it works */}
          <div className="px-5 pb-5">
            <div className="bg-rally-offwhite rounded-lg p-3.5 border-l-3 border-rally-blue">
              <p className="text-[11px] text-rally-text-muted font-semibold uppercase tracking-wide mb-1">
                Why this works for your group
              </p>
              <p className="text-sm text-rally-text-sec leading-relaxed">
                {opt.why_this_works}
              </p>
            </div>
          </div>
        </div>
      ))}

      <button
        onClick={() => router.push(`/trip/${tripId}/vote`)}
        className="w-full py-4 bg-rally-blue text-white font-bold text-sm rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg mt-2"
      >
        Ready to Vote
      </button>
    </div>
  );
}
