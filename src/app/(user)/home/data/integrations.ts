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
      primary: '#00FFB2', // Green
      secondary: '#00FFB2', // Light green
    },
  },
  {
    icon: '/integrations/ai.webp',
    label: 'AIgnite',
    description: 'Spot, analyze and secure the best ai tokens instantly.',
    theme: {
      primary: '#00FFB2', // Blue
      secondary: '#00FFB2', // Light blue
    },
  },
  {
    icon: '/integrations/dexter.png',
    label: 'Dexter',
    description: 'Search for a token and swap it as best prices just by typing.',
    theme: {
      primary: '#00FFB2', // Green
      secondary: '#00FFB2', // Light green
    },
  },
  {
    icon: '/integrations/bolt.jpeg',
    label: 'Bolt',
    description: 'Bolt automates DeFi, managing your portfolio while you sleep.',
    theme: {
      primary: '#00FFB2', // Purple
      secondary: '#00FFB2', // Light purple
    },
  },
  {
    icon: '/integrations/sage.png',
    label: 'Sage',
    description: 'Unveiling trends, decoding influencers, and crafting impactful tweets.',
    theme: {
      primary: '#00FFB2', // Purple
      secondary: '#00FFB2', // Light purple
    },
  },
  {
    icon: '/integrations/hunter.png',
    label: 'Hunter',
    description: 'Discover, analyze, and invest in trending tokens',
    theme: {
      primary: '#00FFB2', // Gray
      secondary: '#00FFB2', // Light gray
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
