'use client';
import { ChevronUp, CreditCard, LogOut } from 'lucide-react';
import { useTheme } from 'next-themes';
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
import { AgentUser } from '@/types/db';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { Skeleton } from './ui/skeleton';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';

export function SidebarUserNav({ user }: { user: AgentUser | null }) {
  const { setTheme, theme } = useTheme();
  const { logout } = useUser();
  const router = useRouter();

  if (!user) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="data-[state=open]:bg-sidebar-accent bg-background data-[state=open]:text-sidebar-accent-foreground h-10">
              <img src={`/logo/foam-logo.png`} className="w-6 h-6 rounded-full" />
              {/* <Avatar >
                <AvatarImage className="w-28 h-8 rounded-full" src={`https://avatars.githubusercontent.com/u/1357181`} />
                <AvatarFallback>0x</AvatarFallback>
              </Avatar> */}
              <span className="truncate">{user.address}</span>
              <ChevronUp className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            className="w-[--radix-popper-anchor-width]"
          >
            {/* <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
            </DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer flex items-center"
                onClick={() => {
                  router.push('/account');
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Accounts
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button
                type="button"
                className="w-full cursor-pointer"
                onClick={() => {
                  logout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}