'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface RecentTrip {
  id: string;
  name: string;
  destination: string;
  role: 'organizer' | 'member';
}

export default function Home() {
  const [recentTrip, setRecentTrip] = useState<RecentTrip | null>(null);

  useEffect(() => {
    // Check localStorage for recent trips
    const stored = localStorage.getItem('rally_recent_trips');
    if (stored) {
      try {
        const trips: RecentTrip[] = JSON.parse(stored);
        if (trips.length > 0) {
          setRecentTrip(trips[0]); // Show most recent trip
        }
      } catch (err) {
        console.error('Failed to parse recent trips:', err);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="font-serif text-5xl md:text-6xl text-rally-black tracking-tight mb-6">
        Your group chat won't <em className="text-rally-blue">get you there</em>
      </h1>
      <p className="text-lg text-rally-text-sec max-w-md mb-10 leading-relaxed">
        Rally gets your crew to commit with real money before anyone starts planning. No more flaky friends.
      </p>

      {recentTrip && (
        <Link
          href={`/trip/${recentTrip.id}`}
          className="px-8 py-4 mb-4 bg-white border-2 border-rally-blue text-rally-blue font-semibold text-base rounded-button hover:bg-rally-blue-light transition-all"
        >
          Return to {recentTrip.name}
        </Link>
      )}

      <Link
        href="/create"
        className="px-8 py-4 bg-rally-blue text-white font-semibold text-base rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        Start a Trip
      </Link>
    </div>
  );
}
