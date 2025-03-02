import { Copy, ExternalLink } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { isValidSuiAddress } from '@mysten/sui/utils';

interface Props {
  text: string;
  /**
   * Whether to show Basescan link
   */
  showExplorer?: boolean;
}

/**
 * Copyable text component with clipboard support and Basescan link
 */
export const CopyableText = ({ text, showExplorer = false }: Props) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const isValidAddress = (text: string): boolean => {
    return isValidSuiAddress(text);
  };

  const _isValidAddress = isValidAddress(text);
  const shouldShowExplorerLink = showExplorer && _isValidAddress;

  return (
    <div className="flex w-full select-none items-center gap-2">
      <div className="min-w-0 flex-1 truncate">
        <span className="block font-mono text-sm">{text}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleCopy(text)}
          className="h-6 w-6 hover:bg-sidebar-accent/50"
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
        {shouldShowExplorerLink && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="h-6 w-6 hover:bg-sidebar-accent/50"
          >
            <a
              href={`https://suiexplorer.com//account/${text}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
};