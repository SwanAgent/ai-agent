import { Prisma, User as _PrismaUser, Transaction as _PrismaTransaction } from '@prisma/client';
import type { Action, Wallet as _PrismaWallet } from '@prisma/client';
import type { Chat as _PrismaChat, Document as _PrismaDocument, Suggestion as _PrismaSuggestion, Message as _PrismaMessage, Vote as _PrismaVote } from '@prisma/client';

export type EmbeddedWallet = Pick<
  _PrismaWallet,
  'id' | 'ownerId' | 'name' | 'publicKey'
>;

export type ChatMeta = Pick<
  _PrismaChat,
  'id' | 'userId' | 'title'
>;

export type Chat = _PrismaChat;

export type Message = _PrismaMessage;

export type Document = _PrismaDocument;

export type Suggestion = _PrismaSuggestion;

export type Vote = _PrismaVote;

export type PrivyUser = _PrivyUser;

export type PrismaUser = _PrismaUser & {
  wallets: EmbeddedWallet[];
};

export type AgentUser = Pick<
  PrismaUser,
  'id' | 'address'
>

export type NewAction = Omit<Action, 'id'>;

export type ActionWithUser = Prisma.ActionGetPayload<{
  include: {
    user: {
      include: {
        wallets: true;
      };
    };
  };
}>;

export type ActionFull = Prisma.ActionGetPayload<{
  select: { [K in keyof Required<Prisma.ActionSelect>]: true };
}>;

export type Transaction = _PrismaTransaction;
