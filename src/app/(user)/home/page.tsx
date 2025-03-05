import { Metadata } from 'next';

import { HomeContent } from './home-content';

export const metadata: Metadata = {
  title: 'SWAN',
  description: 'Your DeFAI Agent on NEAR',
};

export default function HomePage() {
  return <HomeContent />;
}