import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <h1 className="font-serif text-5xl md:text-6xl text-rally-black tracking-tight mb-6">
        Your group chat won't <em className="text-rally-blue">get you there</em>
      </h1>
      <p className="text-lg text-rally-text-sec max-w-md mb-10 leading-relaxed">
        Rally gets your crew to commit with real money before anyone starts planning. No more flaky friends.
      </p>
      <Link
        href="/create"
        className="px-8 py-4 bg-rally-blue text-white font-semibold text-base rounded-button hover:bg-rally-blue-dark transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        Start a Trip
      </Link>
    </div>
  );
}
