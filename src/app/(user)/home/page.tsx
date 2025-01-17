'use client'

import { Metadata } from 'next';

import { HomeContent } from './home-content';
import {
  useSuiClient,
} from '@mysten/dapp-kit';
import { useEffect } from 'react';

// export const metadata: Metadata = {
//   title: 'Home',
//   description: 'Your AI assistant for everything Solana',
// };

export default function HomePage() {
  const client = useSuiClient();

  useEffect(() => {
    console.log('checking balance');
    checkSuiBalance();
  }, []);

  async function checkSuiBalance() {
    const coins = await client.getCoins({
      owner: '0xe43e24ca022903581290d7a47a8f3123b6e1b072bbdbbfd096b564625c5e1502',
      coinType: '0x2::sui::SUI'
    });

    console.log(coins);
    const totalBalance = coins.data.reduce((sum, coin) =>
      sum + Number(coin.balance), 0
    );

    console.log(totalBalance);
  }

  return <HomeContent />;
}