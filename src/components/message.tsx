'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useState } from 'react';

import type { Vote } from '@/types/db';

import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { PostTweet, TokenDetailsCard, PortfolioView } from './actions';
import { Transfer } from './actions/transfer';
import { SuiAiPools } from './actions/sui-ai-pools';
import { SwapToken } from './actions/swap-token';
import { TrendingTokens } from './actions/trending-tokens';
import { FetchTweets } from './actions/fetch-tweets';
import { TopGainers } from './actions/top-gainers';
import { LiquidityPools } from './actions/liquidity-pools';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
        id={`foam-message-cell-${message.id}`}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary !text-white px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />

                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;
                  // const msgToolId = `${message.id}-${toolCallId}`
                  if (state === 'result') {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === 'getPortfolio' ? (
                          <PortfolioView result={result} msgToolId={toolCallId} />
                        ) : toolName === 'getSuiAiPools' ? (
                          <SuiAiPools result={result} msgToolId={toolCallId} />
                        ) : toolName === 'transfer' ? (
                          <Transfer msgToolId={toolCallId}  result={ result } />
                        ) : toolName === 'swapTokens' ? (
                          <SwapToken msgToolId={toolCallId} result={result} />
                        ) : toolName === 'getTrendingTokens' ? (
                          <TrendingTokens result={result} msgToolId={toolCallId} />
                        ) : toolName === 'getTopGainers' ? (
                          <TopGainers result={result} msgToolId={toolCallId} />
                        ) : toolName === 'fetchTweets' ? (
                          <FetchTweets result={result} msgToolId={toolCallId} />
                        ) : toolName === 'fetchTweetsTillTimestamp' ? (
                          <FetchTweets result={result} msgToolId={toolCallId} />
                        ) : toolName === 'postTweet' ? (
                          <PostTweet result={result} msgToolId={toolCallId} />
                        ) : toolName === 'searchTokenDetails' ? (
                          result.data ? <TokenDetailsCard result={result} msgToolId={toolCallId} /> : null
                        ) : toolName === 'getLiquidityPools' ? (
                          <LiquidityPools result={result} msgToolId={toolCallId} />
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: true
                      })}
                    >
                      {toolName === 'getPortfolio' ? (
                        <PortfolioView result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : toolName === 'getSuiAiPools' ? (
                        <SuiAiPools result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : toolName === 'transfer' ? (
                        <Transfer msgToolId={toolCallId} result={{ isLoading: true }} />
                      // ) : toolName === 'resolveBasenames' ? (
                      //   <ResolveBasename result={{ isLoading: true }} />
                    ) : toolName === 'fetchTweets' ? (  
                      <FetchTweets result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : toolName === 'fetchTweetsTillTimestamp' ? (  
                        <FetchTweets result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : toolName === 'postTweet' ? (
                        <PostTweet result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : toolName === 'searchTokenDetails' ? (
                        <TokenDetailsCard result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : toolName === 'swapTokens' ? (
                        <SwapToken msgToolId={toolCallId} result={{ isLoading: true }} />
                      ) : toolName === 'getLiquidityPools' ? (
                        <LiquidityPools result={{ isLoading: true }} msgToolId={toolCallId} />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
