import { ExternalLink } from "lucide-react";
import { Transaction } from "@prisma/client";
import { Skeleton } from "./ui/skeleton";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface TransactionStatusProps {
  transaction?: Transaction | null;
  isLoading?: boolean;
  explorerUrl?: string;
}

export function TransactionStatus({ transaction, isLoading, explorerUrl = "https://nearblocks.io/txns" }: TransactionStatusProps) {
  console.log('transaction', transaction, isLoading);
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Skeleton className="w-full h-8" />
        </CardContent>
      </Card>
    );
  }

  if (!transaction) return null;

  const renderStatus = () => {
    switch (transaction.status) {
      case "PENDING":
        return null;
      case "SUBMITTED":
        return (
          <div className="flex items-center gap-3">
            <div className="animate-spin">
              <RefreshCw className="h-4 w-4 text-yellow-500" />
            </div>
            <p className="text-sm text-yellow-500">
              Transaction submitted, waiting for confirmation...
            </p>
          </div>
        );
      case "SUCCESS":
        return (
          <div className="flex items-center gap-3">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <p className="text-sm">{transaction.title}</p>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto flex items-center gap-2 h-8"
              onClick={() => window.open(`${explorerUrl}/${transaction.hash}`, '_blank')}
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        );
      case "FAILED":
        return (
          <div className="flex items-center gap-3">
            <XCircle className="h-4 w-4 text-destructive" />
            <p className="text-sm text-destructive">
              Transaction failed. Please try again.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="ml-auto flex items-center gap-2 h-8 border-destructive text-destructive hover:bg-destructive/10"
              onClick={() => window.open(`${explorerUrl}/${transaction.hash}`, '_blank')}
            >
              View on Explorer
              <ExternalLink className="h-3 w-3" />
            </Button>
          </div>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {renderStatus()}
      </CardContent>
    </Card>
  );
} 