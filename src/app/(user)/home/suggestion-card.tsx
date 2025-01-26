import { motion } from 'framer-motion';

import type { Suggestion } from './data/suggestions';

interface SuggestionCardProps extends Suggestion {
  delay?: number;
  onSelect: (text: string) => void;
}

export function SuggestionCard({
  title,
  content,
  delay = 0,
  onSelect,
}: SuggestionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{
        scale: 1.01,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(content)}
      className="flex flex-col gap-1.5 rounded-lg bg-muted/50 px-3 py-2 text-left 
        transition-colors duration-200 hover:bg-primary/30 border-[1px] border-primary"
    >
      <div className="text-sm font-medium">{title}</div>
      {/* <div className="text-xs text-muted-foreground/80">{subtitle}</div> */}
    </motion.button>
  );
}
