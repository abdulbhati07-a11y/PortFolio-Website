'use client';

import dynamic from 'next/dynamic';

const DeskPortfolio = dynamic(() => import('./DeskPortfolio'), {
  ssr: false,
  loading: () => <main className="room-starting" role="status">Preparing Abdullah’s desk… <a href="/flat">Open the full Flat portfolio</a></main>,
});

export default function RoomClient() {
  return <DeskPortfolio />;
}
