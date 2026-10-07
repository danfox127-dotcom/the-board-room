import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'The Board Room — Authentic Retro Jeopardy Trivia',
  description:
    'An authentic, retro-styled Jeopardy-inspired trivia web application featuring Daily Drop mode, classic J-Archive vault, couch co-op buzzers, and a two-pass AI clue generator.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#00021c]">
      <body className="min-h-full flex flex-col bg-[#00021c] text-white selection:bg-yellow-400 selection:text-slate-950 font-sans">
        {children}
      </body>
    </html>
  );
}
