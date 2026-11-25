import type { Metadata } from 'next';
import { DM_Sans, Space_Mono, Syne, Space_Grotesk, Doto } from 'next/font/google';
import './globals.css';

const bodyFont = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-dm' });
const displayFont = Syne({ subsets: ['latin'], display: 'swap', variable: '--font-syne' });
const monoFont = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', variable: '--font-mono' });

const roomFont = Space_Grotesk({ subsets: ['latin'], display: 'swap', variable: '--font-room' });
const clockFont = Doto({ subsets: ['latin'], display: 'swap', variable: '--font-clock' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.theabdullahdevs.com'),
  title: { default: 'Abdullah’s Desk — Muhammad Abdullah Bhatti', template: '%s | Abdullah' },
  description: 'Explore the web, Python and data science work of Muhammad Abdullah Bhatti through an interactive developer desk.',
  openGraph: { images: ['/og-desk.jpg'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} ${roomFont.variable} ${clockFont.variable}`}><body>{children}</body></html>;
}
