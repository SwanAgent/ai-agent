export interface IntegrationTheme {
  primary: string;
  secondary: string;
}

export interface Integration {
  icon: string;
  label: string;
  description?: string;
  theme: IntegrationTheme;
  url?: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    icon: '/integrations/suiai_fun.jpg',
    label: 'suiai.fun',
    description: 'Discover new tokens, launch tokens',
    theme: {
      primary: '#0EA5E9', // Blue
      secondary: '#38BDF8', // Light blue
    },
    url: 'https://suiai.fun',
  },
  {
    icon: '/integrations/7k_aggregator.png',
    label: '7K Aggregator',
    description: 'Swap tokens & DCA, Limit orders',
    theme: {
      primary: '#B0EECF', // Green
      secondary: '#B0EECF', // Light green
    },
    url: 'https://port.7k.ag',
  },
  // {
  //   icon: 'integrations/magic_eden.svg',
  //   label: 'Magic Eden',
  //   description: 'Explore the best NFT collections',
  //   theme: {
  //     primary: '#9333EA', // Purple
  //     secondary: '#A855F7', // Light purple
  //   },
  // },
  // {
  //   icon: 'integrations/dialect.svg',
  //   label: 'Dialect',
  //   description: 'Create and share blinks',
  //   theme: {
  //     primary: '#0EA5E9', // Blue
  //     secondary: '#38BDF8', // Light blue
  //   },
  // },
  {
    icon: '/integrations/dexscreener.svg',
    label: 'DexScreener',
    description: 'Discover trending tokens',
    theme: {
      primary: '#64748B', // Gray
      secondary: '#94A3B8', // Light gray
    },
    url: 'https://dexscreener.com',
  },
  // {
  //   icon: 'integrations/defined_fi.svg',
  //   label: 'Defined Fi',
  //   description: 'Discover unbiassed trending tokens',
  //   theme: {
  //     primary: '#B0EECF', // Orange
  //     secondary: '#181432', // White
  //   },
  // },
];
