'use client';
import { ChevronUp } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { useDisconnectWallet } from '@mysten/dapp-kit';
import { AgentUser } from '@/types/db';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

export function SidebarUserNav({ user }: { user: AgentUser }) {
  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const { mutate: disconnect } = useDisconnectWallet();
  
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <Avatar >
                <AvatarImage className="w-28 h-8 rounded-full" src={`https://avatars.githubusercontent.com/u/1357181`} />
                <AvatarFallback>0x</AvatarFallback>
              </Avatar>
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
