'use client';

import { useState } from 'react';

import * as Collapsible from '@radix-ui/react-collapsible';
import { ChevronDown } from 'lucide-react';

import { DefaultToolResultRenderer, getToolConfig } from '@/components/actions';
import { cn } from '@/lib/utils';

interface ToolResultProps {
  toolName: string;
  result: unknown;
  header: React.ReactNode;
  msgToolId: string;
}

export function ToolResult({ toolName, result, header, msgToolId }: ToolResultProps) {
  const config = getToolConfig(toolName)!;
  const isCollapsible = true
  // config.isCollapsible === true;
  const [isOpen, setIsOpen] = useState(
    true
    // config.isExpandedByDefault ?? !isCollapsible,
  );

  // console.log("result", result);
  const content = config.component({result: {toolResult: result as any}, msgToolId: msgToolId});
  if (!content) return null;

  const headerContent = (
    <div className="flex w-full items-center gap-2">
      {header}
      {isCollapsible && (
        <ChevronDown
          className={cn(
            'ml-auto h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180 transform',
          )}
        />
      )}
    </div>
  );

  if (!isCollapsible) {
    return (
      <div className="w-full">
        <div className="w-full rounded-lg bg-muted/40 px-3 py-2">
          {headerContent}
        </div>
        <div className="mt-2">{content}</div>
      </div>
    );
  }

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Collapsible.Trigger className="w-full">
        <div className="w-full cursor-pointer rounded-lg bg-muted/40 px-3 py-2 transition-colors hover:bg-muted/60">
          {headerContent}
        </div>
      </Collapsible.Trigger>

      <Collapsible.Content>
        <div className="mt-2">{content}</div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}
