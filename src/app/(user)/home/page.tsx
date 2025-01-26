import { Metadata } from 'next';

import { HomeContent } from './home-content';

export const metadata: Metadata = {
  title: 'Foam',
  description: 'Your DeFAI Agent on SUI',
};

export default function HomePage() {
  return <HomeContent />;
}