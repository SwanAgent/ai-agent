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
    icon: '/integrations/flash.webp',
    label: 'Nova',
    description: 'Commanding the future of decentralized finance on Near—Nova orchestrates all agents with precision.',
    theme: {
      primary: '#00ea9a', // Pink
      secondary: '#00ea9a', // Light pink
    },
  },
  {
    icon: '/integrations/neuron.png',
    label: 'Neuron',
    description: 'Detect, analyze, and seize top AI tokens in real time—Neuron keeps you ahead of the AI revolution.',
    theme: {
      primary: '#00ea9a', // Blue
      secondary: '#00ea9a', // Light blue
    },
  },
  {
    icon: '/integrations/scout.png',
    label: 'Scout',
    description: 'Type, search, and swap at the best rates—Scout ensures seamless DeFi trades.',
    theme: {
      primary: '#00ea9a', // Green
      secondary: '#00ea9a', // Light green
    },
  },
  {
    icon: '/integrations/bolt.jpeg',
    label: 'Storm',
    description: 'Storm automates your DeFi strategies—optimizing trades and managing your portfolio 24/7.',
    theme: {
      primary: '#00ea9a', // Purple
      secondary: '#00ea9a', // Light purple
    },
  },
  {
    icon: '/integrations/oracle.webp',
    label: 'Oracle',
    description: 'Decipher market trends, track influencers, and craft high-impact tweets with Oracle’s intelligence.',
    theme: {
      primary: '#00ea9a', // Purple
      secondary: '#00ea9a', // Light purple
    },
  },
  {
    icon: '/integrations/sentinel.webp',
    label: 'Sentinel',
    description: 'Scan, analyze, and invest in the hottest tokens before the crowd—Sentinel spots opportunities first.',
    theme: {
      primary: '#00ea9a', // Gray
      secondary: '#00ea9a', // Light gray
    },
  },
];