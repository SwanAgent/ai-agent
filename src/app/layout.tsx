import type { Metadata } from 'next';
import { Toaster } from 'sonner';

import { ThemeProvider } from '@/components/theme-provider';
import './globals.css';
import { SpringSuiProvider, SuiWalletProvider } from './providers';
import '@mysten/dapp-kit/dist/index.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://foam.sh'),
  title: 'Foam | Your DeFAI Agent on SUI',
  description: 'Experience the Future of DeFAI on Sui, powered by Intelligent Agents ✨',
  openGraph: {
    title: 'Foam - Your DeFAI Agent on SUI',
    description: 'Experience the Future of DeFAI on Sui, powered by Intelligent Agents ✨',
    url: 'https://foam.sh',
    siteName: 'Foam',
    images: [
      {
        url: '/product.png', // Make sure to add this image to your public folder
        width: 1200,
        height: 630,
        alt: 'Foam DeFAI Agent Interface',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Foam - Your DeFAI Agent on SUI',
    description: 'Experience the Future of DeFAI on Sui, powered by Intelligent Agents ✨',
    images: ['/product.png'],
    creator: '@foamsh',
  },
};

export const viewport = {
  maximumScale: 1, // Disable auto-zoom on mobile Safari
};

const LIGHT_THEME_COLOR = 'hsl(0 0% 100%)';
const DARK_THEME_COLOR = 'hsl(240deg 10% 3.92%)';
const THEME_COLOR_SCRIPT = `\
(function() {
  var html = document.documentElement;
  var meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'theme-color');
    document.head.appendChild(meta);
  }
  function updateThemeColor() {
    var isDark = html.classList.contains('dark');
    meta.setAttribute('content', isDark ? '${DARK_THEME_COLOR}' : '${LIGHT_THEME_COLOR}');
  }
  var observer = new MutationObserver(updateThemeColor);
  observer.observe(html, { attributes: true, attributeFilter: ['class'] });
  updateThemeColor();
})();`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      // `next-themes` injects an extra classname to the body element to avoid
      // visual flicker before hydration. Hence the `suppressHydrationWarning`
      // prop is necessary to avoid the React hydration mismatch warning.
      // https://github.com/pacocoursey/next-themes?tab=readme-ov-file#with-app
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: THEME_COLOR_SCRIPT,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Toaster position="top-center" />
          <SuiWalletProvider>
            <SpringSuiProvider>
              {children}
            </SpringSuiProvider>
          </SuiWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
