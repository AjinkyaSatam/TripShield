import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TripShield AI — Autonomous Travel Disruption Recovery Platform',
  description:
    'Next-generation travel resilience engine that models itineraries as connected dependency graphs and autonomously heals disruptions with hybrid AI reasoning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`h-full antialiased ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-full bg-[#f4f6fa] text-slate-900 font-sans flex flex-col selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
