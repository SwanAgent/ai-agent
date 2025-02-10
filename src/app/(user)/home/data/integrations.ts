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
    icon: '/integrations/flash.jpeg',
    label: 'Flash',
    description: 'Leading the future of decentralized finance on sui – the master agent orchestrating all others.',
    theme: {
      primary: '#e8308c', // Green
      secondary: '#e8308c', // Light green
    },
  },
  {
    icon: '/integrations/ai.webp',
    label: 'AIgnite',
    description: 'Spot, analyze and secure the best ai tokens instantly.',
    theme: {
      primary: '#e8308c', // Blue
      secondary: '#e8308c', // Light blue
    },
  },
  {
    icon: '/integrations/dexter.png',
    label: 'Dexter',
    description: 'Search for a token and swap it as best prices just by typing.',
    theme: {
      primary: '#e8308c', // Green
      secondary: '#e8308c', // Light green
    },
  },
  {
    icon: '/integrations/bolt.jpeg',
    label: 'Bolt',
    description: 'Bolt automates DeFi, managing your portfolio while you sleep.',
    theme: {
      primary: '#e8308c', // Purple
      secondary: '#e8308c', // Light purple
    },
  },
  {
    icon: '/integrations/sage.png',
    label: 'Sage',
    description: 'Unveiling trends, decoding influencers, and crafting impactful tweets.',
    theme: {
      primary: '#e8308c', // Purple
      secondary: '#e8308c', // Light purple
    },
  },
  {
    icon: '/integrations/hunter.png',
    label: 'Hunter',
    description: 'Discover, analyze, and invest in trending tokens',
    theme: {
      primary: '#e8308c', // Gray
      secondary: '#e8308c', // Light gray
    },
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
