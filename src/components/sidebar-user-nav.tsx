'use client';
import { ChevronUp } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import { useWallet } from '@suiet/wallet-kit';
import { AgentUser } from '@/types/db';

export function SidebarUserNav({ user }: { user: AgentUser }) {
  const { setTheme, theme } = useTheme();
  const [account, setAccount] = useState<string | null>(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [signer, setSigner] = useState<any>(null);
  const router = useRouter();
  const { disconnect } = useWallet();
  // Check if MetaMask is installed
  useEffect(() => {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
          setIsMetaMaskInstalled(true);
      }
  }, []);

  // Attempt to connect to MetaMask
  useEffect(() => {
      const connectWallet = async () => {
          if (!isMetaMaskInstalled) return;

          setIsConnecting(true);
          try {
              await window.ethereum.request({method: 'eth_requestAccounts'});
              const accounts = await window.ethereum.request({method: 'eth_accounts'});
              if (accounts.length > 0) {
                setAccount(accounts[0]);
              }
              console.log(accounts, 'accounts');
              console.log("window.ethereum", window.ethereum);
              const provider = new ethers.BrowserProvider(window.ethereum);
              console.log("provider", provider);
              const signer = await provider.getSigner();
              setSigner(signer);
              console.log("signer", signer);
              // Switch to Base network if not already on it
            //   try {
            //     await window.ethereum.request({
            //       method: 'wallet_switchEthereumChain',
            //       params: [{ chainId: '0x14a34' }], // Base chainId
            //     });
            //   } catch (switchError: any) {
            //     console.error("Failed to switch to Base network:", switchError);
            //   }

          } catch (error) {
              console.error("Failed to connect to MetaMask:", error);
              // Handle errors here
          } finally {
              setIsConnecting(false);
          }
      };

      connectWallet();
  }, [isMetaMaskInstalled]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Image
                src={`https://avatar.vercel.sh/${user.id}`}
                alt={user.address ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="truncate">{user.address}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  disconnect();
                  signOut()
                  router.push("/");
                }}
              >
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
