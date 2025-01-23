'use client';

import { AgentUser } from '@/types/db';
import { usePathname, useRouter } from 'next/navigation';

import { HomeIcon, PlusIcon } from '@/components/icons';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useSession } from 'next-auth/react';
import { Bot, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Chat } from '@phosphor-icons/react';

export const SidebarMenuOptions = [
  {
    label: 'Home',
    icon: <HomeIcon size={12} />,
    href: '/home',
    isActive: true,
  },
  {
    label: 'Tasks',
    icon: <ListTodo size={12} />,
    href: '/tasks',
    isActive: false,
  },
  {
    label: 'Agents',
    icon: <Bot size={12} />,
    href: '/agents',
    isActive: false,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="bg-black group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                foam.sh
              </span>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  type="button"
                  className="p-2 h-fit"
                  onClick={() => {
                    setOpenMobile(false);
                    router.push('/home');
                    router.refresh();
                  }}
                >
                  <Chat />
                </Button>
              </TooltipTrigger>
              <TooltipContent align="end">New Chat</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex flex-col gap-2 py-3 px-2">
          {SidebarMenuOptions.map((option) => (
            <Tooltip key={option.label}>
              <TooltipTrigger asChild>
                <Link
                  href={option.isActive && user?.address ? option.href : '#'}
                  key={option.label}
                  className={cn(
                buttonVariants({ variant: 'ghost' }),
                'flex flex-row gap-2 justify-start items-center px-2',
                pathname === option.href && 'bg-muted',
              )}
            >
              {option.icon}
                  {option.label}
                </Link>
              </TooltipTrigger>
              <TooltipContent align="end">
                {option.isActive ? option.label : 'Coming Soon'}
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <SidebarHistory user={user ?? null} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
