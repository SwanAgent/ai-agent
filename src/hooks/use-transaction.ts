'use client';

import { useEffect, useState } from 'react';
import { Transaction, TransactionStatus, TransactionType } from '@prisma/client';
import { getOrCreateTransaction, getTransaction, updateTransactionStatus } from '@/server/actions/transaction';

const POLLING_INTERVAL = 5000; // 5 seconds

export function useTransaction(msgToolId: string, type: TransactionType) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async () => {
    try {
      const response = await getTransaction({ msgToolId });
      setTransaction(response?.data?.data ?? null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const createTransaction = async (input: {
    type: Transaction['type'];
    title: string;
    metadata: any;
  }) => {
    try {
      const response = await getOrCreateTransaction({ msgToolId, type, title: input.title, metadata: input.metadata });

      if (!response?.data?.success) {
        throw new Error('Failed to create transaction');
      }

      setTransaction(response?.data?.data ?? null);
      return response?.data?.data ?? null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTransaction = async (input: {
    hash?: string;
    status?: TransactionStatus;
    metadata?: any; 
    title?: string;
  }) => {
    try {
      const response = await updateTransactionStatus({ msgToolId, input: { status: input.status, hash: input.hash, metadata: input.metadata, title: input.title } });

      if (!response?.data?.success) {
        throw new Error('Failed to update transaction');
      }

      setTransaction(response?.data?.data ?? null);
      return response?.data?.data ?? null;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTransaction();
  }, [msgToolId]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (
      transaction?.status === TransactionStatus.SUBMITTED 
    //   || transaction?.status === TransactionStatus.PENDING
    ) {
      intervalId = setInterval(fetchTransaction, POLLING_INTERVAL);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [transaction?.status]);

  return {
    transaction,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
  };
} 