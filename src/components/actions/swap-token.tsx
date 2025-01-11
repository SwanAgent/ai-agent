import { useEffect } from 'react';
import { SwapTokenResponse } from '@/lib/ai/actions/swapToken';
import { Appearance, LiFiWidget, WidgetConfig, RouteExecutionUpdate, RouteHighValueLossUpdate, useWidgetEvents, Route, WidgetEvent } from '@lifi/widget';
import { Loader2 } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ActionComponentProps } from '@/types/actions';
import { useTransaction } from '@/hooks/use-transaction';
import { TransactionStatus } from '../transaction-status';

type SwapProps = ActionComponentProps<SwapTokenResponse> & {
  msgToolId: string;
}

const widgetConfig: WidgetConfig = {
  integrator: "JesseAI",
  fromChain: 8453,
  toChain: 8453,
  fromToken: '0x0000000000000000000000000000000000000000',
  toToken: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
  fromAmount: 10,
  appearance: 'dark',
};
  
export function SwapToken({ result, isLoading, msgToolId }: SwapProps) {
  const { theme } = useTheme();
  const { transaction, isLoading: isTransactionLoading, createTransaction, updateTransaction } = useTransaction(msgToolId, "SWAP");
  const widgetEvents = useWidgetEvents();
  const { fromAmount, fromTokenAddress: fromToken, toTokenAddress: toToken } = result?.data || {};

  console.log("transaction", transaction);
  useEffect(() => {
    const onRouteExecutionUpdated = (update: RouteExecutionUpdate) => {
        console.log("onRouteExecutionUpdated", update);
        if (update.process.type === "SWAP" && update.process.status === "STARTED") {
            console.log("onRouteExecutionUpdated STARTED");
            createTransaction({
                type: "SWAP",
                title: `Swapping transaction started`,
                metadata: update.route
            })
        } else if (update.process.type === "SWAP" && update.process.status === "DONE") {
            console.log("onRouteExecutionUpdated DONE");
            updateTransaction({
                status: "SUCCESS",
                title: "Swap completed successfully",
                hash: update.process.txHash
            })
        } else if (update.process.type === "SWAP" && update.process.status === "FAILED") {
            console.log("onRouteExecutionUpdated FAILED");
            updateTransaction({
                status: "FAILED",
                title: "Swap failed",
                hash: update.process.txHash
            })
        } 
    };
    
    if (!isLoading) {
    //   widgetEvents.on(WidgetEvent.RouteExecutionStarted, onRouteExecutionStarted);
      widgetEvents.on(WidgetEvent.RouteExecutionUpdated, onRouteExecutionUpdated);
    }
    // widgetEvents.on(WidgetEvent.RouteExecutionCompleted, onRouteExecutionCompleted);
    // widgetEvents.on(WidgetEvent.RouteExecutionFailed, onRouteExecutionFailed);
    // widgetEvents.on(WidgetEvent.RouteHighValueLoss, onRouteHighValueLoss);
    
    return () => widgetEvents.all.clear();
  }, [widgetEvents, result, isLoading]);

  widgetConfig.fromToken = fromToken;
  widgetConfig.toToken = toToken;
  widgetConfig.fromAmount = fromAmount;
  widgetConfig.appearance = theme === 'system' ? 'auto' : theme as Appearance;

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">
      <Loader2 className="animate-spin" />
    </div>;
  }

  if (transaction && (transaction.status == "SUCCESS" || transaction.status == "FAILED")) {
    return <TransactionStatus 
      transaction={transaction} 
      isLoading={isTransactionLoading}
      explorerUrl="https://basescan.org/tx"
    />;
  }

  return (
    <div className="h-[540px] overflow-auto flex flex-col gap-2">
      <LiFiWidget 
        config={widgetConfig}
        integrator="JesseAI"
      />
    </div>
  );
}