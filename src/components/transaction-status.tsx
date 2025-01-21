import { ExternalLink } from "lucide-react";
import { Transaction } from "@prisma/client";
import { Skeleton } from "./ui/skeleton";

interface TransactionStatusProps {
  transaction?: Transaction | null;
  isLoading?: boolean;
  explorerUrl?: string;
}

export function TransactionStatus({ transaction, isLoading, explorerUrl = "https://suiexplorer.com/txblock" }: TransactionStatusProps) {
  if (isLoading) {
    return <div className="flex flex-col">
      <Skeleton className="w-full h-8" />
    </div>;
  }

  if (!transaction) return null;

  const renderStatus = () => {
    switch (transaction.status) {
      case "PENDING":
        return null;
      case "SUBMITTED":
        return (
          <div className="flex gap-3 items-center text-sm text-yellow-500">
            Transaction submitted, waiting for confirmation...
          </div>
        );
      case "SUCCESS":
        return (
          <div className="flex gap-3 items-center text-sm">
            <p>{transaction.title}</p>
            <div 
              onClick={() => window.open(`${explorerUrl}/${transaction.hash}`, '_blank')} 
              className="flex justify-center items-center gap-2 p-2 rounded-full bg-muted cursor-pointer"
            >
              View on Explorer <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex gap-3 items-center text-sm text-destructive">
            <p>Transaction failed. Please try again.</p>
            <div 
              onClick={() => window.open(`${explorerUrl}/${transaction.hash}`, '_blank')} 
              className="flex justify-center items-center gap-2 p-2 rounded-full bg-muted cursor-pointer"
            >
              View on Explorer <ExternalLink className="h-4 w-4" />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col">
      {renderStatus()}
    </div>
  );
} 