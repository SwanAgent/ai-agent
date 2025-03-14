'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { usePathname } from 'next/navigation';
import axios from 'axios';
import { useChat } from 'ai/react';
import { cn, generateUUID } from '@/lib/utils';
import { Bot } from 'lucide-react';

import { IntegrationsGrid } from './components/integrations-grid';
import { ConversationInput } from './conversation-input';
import { getRandomSuggestions } from './data/suggestions';
import { SuggestionCard } from './suggestion-card';
import BlurFade from '@/components/ui/blur-fade';
import TypingAnimation from '@/components/ui/typing-animation';
import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { useSWRConfig } from 'swr';
import ChatInterface from '../chat/[id]/chat-interface';

const EAP_PRICE = 1.0;
const RECEIVE_WALLET_ADDRESS =
  process.env.NEXT_PUBLIC_EAP_RECEIVE_WALLET_ADDRESS!;

const EAP_BENEFITS = [
  'Support platform growth',
  'Early access to features',
  'Unlimited AI interactions',
  'Join early governance and decisions',
];

interface SectionTitleProps {
  children: React.ReactNode;
}

function SectionTitle({ children }: SectionTitleProps) {
  return (
    <h2 className="mb-2 px-1 text-sm font-medium text-muted-foreground/80">
      {children}
    </h2>
  );
}

export function HomeContent() {
  const { mutate } = useSWRConfig();

  const pathname = usePathname();
  const suggestions = useMemo(() => getRandomSuggestions(4), []);
  const [showChat, setShowChat] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatId, setChatId] = useState(() => generateUUID());
  // const { user, isLoading } = useU();
  const [verifyingTx, setVerifyingTx] = useState<string | null>(null);
  const [verificationAttempts, setVerificationAttempts] = useState(0);
  const MAX_VERIFICATION_ATTEMPTS = 20;

  // const { conversations, refreshConversations } = useConversations(user?.id);

  const resetChat = useCallback(() => {
    setShowChat(false);
    setChatId(generateUUID());
  }, []);

  const { messages, input, handleSubmit, setInput } = useChat({
    id: chatId,
    initialMessages: [],
    body: { id: chatId },
    onFinish: () => {
      // Only refresh if we have a new conversation that's not in the list
      // if (chatId && !conversations?.find((conv) => conv.id === chatId)) {
      //   refreshConversations();
      // }
      mutate('/api/history');
    },
  });

  // Verification effect
  // useEffect(() => {
  //   if (!verifyingTx) return;

  //   const verify = async () => {
  //     try {
  //       const response = await checkEAPTransaction({ txHash: verifyingTx });
  //       if (response?.data?.success) {
  //         toast.success('EAP Purchase Successful', {
  //           description:
  //             'Your Early Access Program purchase has been verified. Please refresh the page.',
  //         });
  //         setVerifyingTx(null);
  //         return;
  //       }

  //       // Continue verification if not reached max attempts
  //       if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
  //         setVerificationAttempts((prev) => prev + 1);
  //       } else {
  //         // Max attempts reached, show manual verification message
  //         toast.error('Verification Timeout', {
  //           description:
  //             'Please visit the FAQ page to manually verify your transaction.',
  //         });
  //         setVerifyingTx(null);
  //       }
  //     } catch (error) {
  //       console.error('Verification error:', error);
  //       // Continue verification if not reached max attempts
  //       if (verificationAttempts < MAX_VERIFICATION_ATTEMPTS) {
  //         setVerificationAttempts((prev) => prev + 1);
  //       }
  //     }
  //   };

  //   const timer = setTimeout(verify, 3000);
  //   return () => clearTimeout(timer);
  // }, [verifyingTx, verificationAttempts]);

  const handleSend = async (value: string) => {
    if (!value.trim()) return;

    // if (!user?.earlyAccess) {
    //   return;
    // }

    const fakeEvent = new Event('submit') as any;
    fakeEvent.preventDefault = () => { };

    await handleSubmit(fakeEvent, { data: { content: value } });
    setShowChat(true);
    window.history.replaceState(null, '', `/chat/${chatId}`);
  };

  // const handlePurchase = async () => {
  //   if (!user) return;
  //   setIsProcessing(true);
  //   setVerificationAttempts(0);

  //   try {
  //     const tx = await SolanaUtils.sendTransferWithMemo({
  //       to: RECEIVE_WALLET_ADDRESS,
  //       amount: EAP_PRICE,
  //       memo: `{
  //                   "type": "EAP_PURCHASE",
  //                   "user_id": "${user.id}"
  //               }`,
  //     });

  //     if (tx) {
  //       setVerifyingTx(tx);
  //       toast.success('Transaction Sent', {
  //         description: 'Transaction has been sent. Verifying your purchase...',
  //       });
  //     } else {
  //       toast.error('Transaction Failed', {
  //         description: 'Failed to send the transaction. Please try again.',
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Transaction error:', error);

  //     let errorMessage = 'Failed to send the transaction. Please try again.';

  //     if (error instanceof Error) {
  //       const errorString = error.toString();
  //       if (
  //         errorString.includes('TransactionExpiredBlockheightExceededError')
  //       ) {
  //         toast.error('Transaction Timeout', {
  //           description: (
  //             <>
  //               <span className="font-semibold">
  //                 Transaction might have been sent successfully.
  //               </span>
  //               <br />
  //               If SOL was deducted from your wallet, please visit the FAQ page
  //               and input your transaction hash for manual verification.
  //             </>
  //           ),
  //         });
  //         return;
  //       }
  //       errorMessage = error.message;
  //     }

  //     toast.error('Transaction Failed', {
  //       description: errorMessage,
  //     });
  //   } finally {
  //     setIsProcessing(false);
  //   }
  // };

  // Reset chat when pathname changes to /home
  useEffect(() => {
    if (pathname === '/home') {
      resetChat();
    }
  }, [pathname, resetChat]);

  // 监听浏览器的前进后退
  useEffect(() => {
    const handlePopState = () => {
      if (location.pathname === '/home') {
        resetChat();
      } else if (location.pathname === `/chat/${chatId}`) {
        setShowChat(true);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [chatId, resetChat]);

  // if (isLoading) {
  //   return (
  //     <div className="flex h-screen w-full items-center justify-center">
  //       <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  //     </div>
  //   );
  // }

  // const hasEAP = user?.earlyAccess === true;

  const mainContent = (
    <div
      className={cn(
        'mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-12',
        // !hasEAP ? 'h-screen py-0' : 'py-12',
      )}
    >
      <BlurFade delay={0.2}>
        <div className="flex items-center justify-center gap-4">
          <img src="/logo/foam.png" alt="logo" className="h-[100px]" />
          <span className="text-6xl animate-wave">👋</span>
        </div>
      </BlurFade>

      <div className="mx-auto w-full max-w-3xl mt-10">
        <BlurFade delay={0.1}>
          <ConversationInput
            value={input}
            onChange={setInput}
            onSubmit={handleSend}
          />
        </BlurFade>
        <div className="mt-2">
          <BlurFade delay={0.2}>
            <div className="space-y-2">
              <div className="flex flex-row overflow-x-scroll overflow-y-hidden gap-4">
                {suggestions.map((suggestion, index) => (
                  <SuggestionCard
                    key={suggestion.title}
                    {...suggestion}
                    delay={0.3 + index * 0.1}
                    onSelect={setInput}
                  />
                ))}
              </div>
            </div>
          </BlurFade>
          <BlurFade delay={0.4}>
            <div className="space-y-2 mt-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="text-2xl font-semibold">Agents</div>
              </div>
              <IntegrationsGrid />
            </div>
          </BlurFade>
        </div>
      </div>
    </div>
  );

  // if (!hasEAP) {
  //   return (
  //     <div className="relative h-screen w-full overflow-hidden">
  //       <div className="absolute inset-0 z-10 bg-background/30 backdrop-blur-md" />
  //       {mainContent}
  //       <div className="absolute inset-0 z-20 flex items-center justify-center">
  //         <div className="mx-auto w-full max-w-xl px-6">
  //           <Card className="relative overflow-hidden border-white/[0.1] bg-white/[0.02] p-8 backdrop-blur-sm backdrop-saturate-150 dark:bg-black/[0.02]">
  //             <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-white/[0.02] dark:from-white/[0.02] dark:to-white/[0.01]" />
  //             <div className="relative space-y-6">
  //               <div className="space-y-2 text-center">
  //                 <h2 className="text-2xl font-semibold">
  //                   Early Access Program
  //                 </h2>
  //                 <div className="text-muted-foreground">
  //                   We&apos;re currently limiting <Badge>BETA</Badge> access to
  //                   a limited amount of users to ensure stable service while
  //                   continuing to refine features.
  //                 </div>
  //               </div>

  //               <Card className="border-teal-500/10 bg-white/[0.01] p-6 backdrop-blur-sm dark:bg-black/[0.01]">
  //                 <h3 className="mb-4 font-semibold">EAP Benefits</h3>
  //                 <div className="space-y-3">
  //                   {EAP_BENEFITS.map((benefit, index) => (
  //                     <div key={index} className="flex items-start gap-2">
  //                       <CheckCircle2 className="mt-1 h-4 w-4 text-teal-500" />
  //                       <span className="text-sm">{benefit}</span>
  //                     </div>
  //                   ))}
  //                 </div>
  //               </Card>

  //               <div className="rounded-lg bg-white/[0.01] p-4 backdrop-blur-sm dark:bg-black/[0.01]">
  //                 <div className="mb-2 flex items-center justify-between">
  //                   <span className="text-sm font-medium">Payment</span>
  //                   <span className="text-lg font-semibold">
  //                     {EAP_PRICE} SOL
  //                   </span>
  //                 </div>
  //                 <div className="text-sm text-muted-foreground">
  //                   Funds will be allocated to cover expenses such as LLM
  //                   integration, RPC data services, infrastructure maintenance,
  //                   and other operational costs, all aimed at ensuring the
  //                   platform&apos;s stability and reliability.
  //                 </div>
  //               </div>

  //               <div className="flex items-center justify-between gap-4">
  //                 <Link
  //                   href="https://x.com/neur_sh"
  //                   target="_blank"
  //                   rel="noopener noreferrer"
  //                   className="flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
  //                 >
  //                   <RiTwitterXFill className="mr-2 h-4 w-4" />
  //                   Follow Updates
  //                 </Link>
  //                 <Button
  //                   onClick={handlePurchase}
  //                   disabled={isProcessing}
  //                   className="bg-teal-500/70 ring-offset-0 hover:bg-teal-500/90 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-teal-500/60 dark:hover:bg-teal-500/80"
  //                 >
  //                   {isProcessing ? (
  //                     <>
  //                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  //                       Processing
  //                     </>
  //                   ) : (
  //                     `Join EAP (${EAP_PRICE} SOL)`
  //                   )}
  //                 </Button>
  //               </div>
  //             </div>
  //           </Card>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="relative h-screen">
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          showChat ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        {mainContent}
      </div>

      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-300',
          showChat ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <ChatInterface id={chatId} visiblilty={"private"} initialMessages={[]} />
        {/* <Chat id={chatId} initialMessages={[]} selectedModelId={DEFAULT_MODEL_NAME} selectedVisibilityType="private" isReadonly={false} />
        <DataStreamHandler id={chatId} /> */}
      </div>
    </div>
  );
}
