'use client';

import dynamic from 'next/dynamic';

const SafeBypassApp = dynamic(() => import('../src/App'), { ssr: false });

export default function HomePage() {
  return <SafeBypassApp />;
}
