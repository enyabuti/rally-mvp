import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rally — Stop planning. Start going.',
  description: 'The group trip commitment engine. No more flaky friends, dead group chats, or one person doing all the work.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-rally-white text-rally-text min-h-screen">
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-white/85 backdrop-blur-xl border-b border-black/[0.04]">
          <a href="/" className="font-serif text-2xl text-rally-black tracking-tight">
            Rally<span className="text-rally-blue">.</span>
          </a>
        </nav>
        <main className="pt-20 pb-0">
          {children}
        </main>
      </body>
    </html>
  );
}
