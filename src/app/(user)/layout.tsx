import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import Script from 'next/script';
import { getUserData } from '@/server/actions/user';
import WalletDelegate from '@/components/wallet-delegate';

export const experimental_ppr = true;

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [cookieStore] = await Promise.all([cookies()]);
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';
  const userData = await getUserData();
  const user = userData?.data?.data;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <SidebarProvider defaultOpen={!isCollapsed}>
        <AppSidebar />
        <SidebarInset>
          <WalletDelegate user={user}>
            {children}
          </WalletDelegate>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}