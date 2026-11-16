import type { Metadata } from 'next';
import FlatDesktop from '@/components/flat/FlatDesktop';

export const metadata: Metadata = {
  title: 'Flat Portfolio',
  description: 'The complete accessible portfolio of Muhammad Abdullah Bhatti.',
};

export default function FlatPage() {
  return <FlatDesktop />;
}
