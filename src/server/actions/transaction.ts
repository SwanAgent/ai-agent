'use server';

import prisma from '@/lib/prisma';
import { ActionResponse } from '@/lib/safe-action';
import { actionClient } from '@/lib/safe-action';
import { TransactionStatus, TransactionType, Transaction } from '@prisma/client';
import { z } from 'zod';
import { getUserSessionData } from './user';

export type CreateTransactionInput = {
  msgToolId: string;
  type: TransactionType;
  title: string;
  metadata: any;
  userId: string;
  chatId: string;
};

export type UpdateTransactionInput = {
  hash?: string;
  status?: TransactionStatus;
};

export const getOrCreateTransaction = actionClient
  .schema(z.object({ msgToolId: z.string(), type: z.nativeEnum(TransactionType), title: z.string().optional(), metadata: z.any().optional() }))
  .action<ActionResponse<Transaction>>(async ({ parsedInput: { msgToolId, type, title, metadata } }) => {
    const user = await getUserSessionData();
    const success = user?.data?.success;
    const userData = user?.data?.data;
    const error = user?.data?.error;

    if (!success || !userData) {
      return {
        success: false,
        error: error,
      };
    }

    const userId = userData.id;

    const existing = await prisma.transaction.findUnique({
      where: { msgToolId },
    });

    if (existing) {
      return {
        success: true,
        data: existing,
      };
    }

    const created = await prisma.transaction.create({
      data: {
        msgToolId,
        status: TransactionStatus.PENDING,
        user: {
          connect: {
            id: userId,
          },
        },
        type,
        title,
        metadata,
      },
    });

    return {
      success: true,
      data: created,
    };
  });

export const updateTransactionStatus = actionClient
  .schema(
    z.object({
      msgToolId: z.string(),
      input: z.object({
        hash: z.string().optional(),
        status: z.nativeEnum(TransactionStatus).optional(),
        metadata: z.any().optional(),
        title: z.string().optional(),
      }),
    })
  )
  .action<ActionResponse<Transaction>>(
    async ({ parsedInput: { msgToolId, input } }) => {
      try {
        const updated = await prisma.transaction.update({
          where: { msgToolId },
          data: input,
        });

        return {
          success: true,
          data: updated,
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to update transaction',
        };
      }
    }
  );

export const getTransaction = actionClient
  .schema(z.object({ msgToolId: z.string() }))
  .action<ActionResponse<Transaction | null>>(
    async ({ parsedInput: { msgToolId } }) => {
      const transaction = await prisma.transaction.findUnique({
        where: { msgToolId },
      });

      return {
        success: true,
        data: transaction,
      };
    }
  );

export const getTransactionByHash = actionClient
  .schema(z.object({ hash: z.string() }))
  .action<ActionResponse<Transaction | null>>(
    async ({ parsedInput: { hash } }) => {
      const transaction = await prisma.transaction.findFirst({
        where: { hash },
      });

      return {
        success: true,
        data: transaction,
      };
    }
  );
