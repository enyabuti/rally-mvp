'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreateTripRequest } from '@/lib/types';

export default function CreateTrip() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const payload: CreateTripRequest = {
      name: formData.get('name') as string,
      destination: formData.get('destination') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      budget_per_person: Math.round(parseFloat(formData.get('budget') as string) * 100),
      deposit_amount: Math.round(parseFloat(formData.get('deposit') as string) * 100),
      organizer_name: formData.get('organizer_name') as string,
      organizer_email: formData.get('organizer_email') as string,
    };

    try {
      const res = await fetch('/api/create-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('API error:', errorData);
        alert(`Failed to create trip: ${errorData.error || 'Unknown error'}`);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.id) {
        router.push(`/trip/${data.id}`);
      } else {
        alert('Trip created but no ID returned');
        setLoading(false);
      }
    } catch (err) {
      console.error('Failed to create trip:', err);
      alert('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 pb-12">
      <div className="max-w-lg mx-auto">
      <h1 className="font-serif text-4xl text-rally-black tracking-tight mb-2">
        Start a trip
      </h1>
      <p className="text-rally-text-sec mb-8">
        Set the basics. Your crew handles the rest.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Trip Name */}
        <div>
          <label className="block text-sm font-semibold text-rally-text mb-1.5">Trip name</label>
          <input
            name="name"
            type="text"
            required
            placeholder="Lisbon 2026"
            className="w-full px-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-sm font-semibold text-rally-text mb-1.5">Destination</label>
          <input
            name="destination"
            type="text"
            required
            placeholder="Lisbon, Portugal"
            className="w-full px-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-rally-text mb-1.5">Start date</label>
            <input
              name="start_date"
              type="date"
              required
              className="w-full px-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-rally-text mb-1.5">End date</label>
            <input
              name="end_date"
              type="date"
              required
              className="w-full px-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
            />
          </div>
        </div>

        {/* Budget + Deposit */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-rally-text mb-1.5">Budget per person</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rally-text-muted text-sm">$</span>
              <input
                name="budget"
                type="number"
                required
                min="50"
                step="50"
                placeholder="500"
                className="w-full pl-7 pr-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-rally-text mb-1.5">Commitment deposit</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rally-text-muted text-sm">$</span>
              <input
                name="deposit"
                type="number"
                required
                min="10"
                max="100"
                step="5"
                placeholder="25"
                className="w-full pl-7 pr-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Organizer Info */}
        <div className="border-t border-rally-border pt-5 mt-1">
          <p className="text-xs text-rally-text-muted mb-4 font-medium">Your info (as the organizer)</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-rally-text mb-1.5">Your name</label>
              <input
                name="organizer_name"
                type="text"
                required
                placeholder="Ezra"
                className="w-full px-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rally-text mb-1.5">Your email</label>
              <input
                name="organizer_email"
                type="email"
                required
                placeholder="ezra@email.com"
                className="w-full px-4 py-3 border border-rally-border rounded-input text-sm focus:border-rally-blue focus:ring-2 focus:ring-rally-blue-glow outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-rally-blue text-white font-bold text-sm rounded-input hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Creating...' : 'Create Trip & Get Share Link'}
        </button>
      </form>
      </div>
    </div>
  );
}
