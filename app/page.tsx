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
    <div className="-mt-20 -mx-4">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-white">
        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-rally-blue/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rally-blue/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          {recentTrip && (
            <Link
              href={`/trip/${recentTrip.id}`}
              className="inline-block mb-6 px-4 py-2 bg-rally-blue-light text-rally-blue text-sm font-semibold rounded-full hover:bg-rally-blue hover:text-white transition-all"
            >
              ← Return to {recentTrip.name}
            </Link>
          )}

          <h1 className="font-serif text-5xl md:text-7xl text-rally-black tracking-tight mb-6 leading-tight">
            Your group chat won't <em className="text-rally-blue not-italic">get you there</em>
          </h1>
          <p className="text-xl md:text-2xl text-rally-text-sec max-w-2xl mx-auto mb-10 leading-relaxed">
            Rally gets your crew to commit with real money before anyone starts planning. No more flaky friends.
          </p>
          <Link
            href="/create"
            className="inline-block px-10 py-5 bg-rally-blue text-white font-bold text-lg rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            Start a Trip
          </Link>
        </div>
      </section>

      {/* How Rally Works */}
      <section className="bg-rally-offwhite py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-rally-black text-center mb-16">
            How Rally works
          </h2>

          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-rally-border hidden md:block"></div>

            <div className="space-y-12">
              {[
                {
                  num: '1',
                  title: 'One person starts it',
                  desc: 'Create a trip with dates, budget, and deposit amount. Get a shareable link instantly.',
                },
                {
                  num: '2',
                  title: 'Everyone commits with skin in the game',
                  desc: 'Friends pay a deposit to join. No deposit, no vote. Suddenly everyone\'s serious.',
                },
                {
                  num: '3',
                  title: 'AI builds options from real preferences',
                  desc: 'Everyone submits their travel style. Rally generates 3 complete trip options with flights, hotels, and activities.',
                },
                {
                  num: '4',
                  title: 'Vote, lock, and go',
                  desc: 'Crew votes on their favorite. Winner gets locked. Time to pack.',
                },
              ].map((step, i) => (
                <div key={i} className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rally-blue text-white font-bold text-lg flex items-center justify-center relative z-10">
                    {step.num}
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="text-2xl font-semibold text-rally-black mb-2">
                      {step.title}
                    </h3>
                    <p className="text-rally-text-sec text-lg leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Sound Familiar? */}
      <section className="bg-white py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl text-rally-black text-center mb-4">
            Sound familiar?
          </h2>
          <p className="text-rally-text-sec text-lg text-center mb-16 max-w-2xl mx-auto">
            Every group trip hits the same walls. Rally removes them.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Decisions by committee',
                quote: '"We had 47 messages arguing about hotels. Nobody booked anything."',
                author: '— Sarah, 28',
              },
              {
                title: 'One person does everything',
                quote: '"I spent 12 hours planning. Three people ghosted the week before."',
                author: '— Marcus, 32',
              },
              {
                title: 'People ghost when it\'s time to pay',
                quote: '"Everyone was \'so down\' until I asked for Venmo. Then silence."',
                author: '— Jen, 26',
              },
            ].map((pain, i) => (
              <div
                key={i}
                className="bg-rally-offwhite border border-rally-border rounded-card p-8 hover:shadow-lg transition-shadow"
              >
                <h3 className="text-xl font-bold text-rally-black mb-4">
                  {pain.title}
                </h3>
                <p className="text-rally-text italic mb-3 text-lg leading-relaxed">
                  {pain.quote}
                </p>
                <p className="text-rally-text-muted text-sm">{pain.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-rally-black py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
            Stop planning trips.<br />Start going on them.
          </h2>
          <Link
            href="/create"
            className="inline-block px-10 py-5 bg-white text-rally-black font-bold text-lg rounded-button hover:bg-rally-offwhite transition-all hover:-translate-y-1 hover:shadow-2xl"
          >
            Start a Trip — It's Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-rally-black py-8 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-white/60 text-sm">
            © 2026 Rally. Built because group chats don't book flights.
          </p>
        </div>
      </footer>
    </div>
  );
}
