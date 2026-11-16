import type { Metadata } from 'next';
import { DM_Sans, Space_Mono, Syne } from 'next/font/google';
import './globals.css';

const bodyFont = DM_Sans({ subsets: ['latin'], display: 'swap', variable: '--font-dm' });
const displayFont = Syne({ subsets: ['latin'], display: 'swap', variable: '--font-syne' });
const monoFont = Space_Mono({ subsets: ['latin'], weight: ['400', '700'], display: 'swap', variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://www.theabdullahdevs.com'),
  title: { default: 'Muhammad Abdullah Bhatti — Developer & Data Science', template: '%s | Abdullah' },
  description: 'Explore the web, Python and data science work of Muhammad Abdullah Bhatti through an interactive developer desk.',
  openGraph: { images: ['/og-lab.png'] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth" className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}><body>{children}</body></html>;
}
