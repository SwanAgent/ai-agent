export type ActionResponse<T> = {
    success: boolean;
    error?: string;
    data?: T;
    signTransaction?: boolean;
    suppressFollowUp?: boolean;
}

export type ActionComponentProps<T> = {
    result: {
      toolResult?: T;
      isLoading?: boolean;
      className?: string;
    }
}

export interface SwapQuote {
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  quoteResponse?: any;
}

export interface SwapResult {
  tx?: any;
  coinOut?: string;
}

export interface SwapCommission {
  partner: string;
  commissionBps: number;
}