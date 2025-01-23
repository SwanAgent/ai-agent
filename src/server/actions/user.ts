"use server";

import { z } from "zod";

import prisma from "@/lib/prisma";
import { ActionResponse, actionClient } from "@/lib/safe-action";
import { generateEncryptedKeyPair } from "@/lib/wallet/wallet-generator";
import { AgentUser, PrismaUser } from "@/types/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/utils/auth-options";

export const getOrCreateUser = actionClient
  .schema(z.object({ address: z.string() }))
  .action<ActionResponse<PrismaUser>>(async ({ parsedInput: { address } }) => {
    const prismaUser = await prisma.user.findUnique({
      where: { address: address },
      include: {
        wallets: {
          select: {
            id: true,
            ownerId: true,
            name: true,
            publicKey: true,
          },
        },
      },
    });

    if (prismaUser) {
      return {
        success: true,
        data: prismaUser,
      };
    }

    const createdUser = await prisma.user.create({
      data: { address: address },
    });
    const { publicKey, encryptedPrivateKey } =
      await generateEncryptedKeyPair();
    const initalWallet = await prisma.wallet.create({
      data: {
        ownerId: createdUser.id,
        name: "Default",
        publicKey,
        encryptedPrivateKey,
      },
    });

    return {
      success: true,
      data: {
        ...createdUser,
        wallets: [
          {
            id: initalWallet.id,
            ownerId: initalWallet.ownerId,
            name: initalWallet.name,
            publicKey: initalWallet.publicKey,
          },
        ],
      },
    };
  });

export const getUserData = actionClient.action<ActionResponse<PrismaUser>>(async () => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }
  const userId = session.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallets: {
        select: {
          id: true,
          ownerId: true,
          name: true,
          publicKey: true,
        },
      },
    },
  });

  if (!user) {
    return {
      success: false,
      error: "User not found",
    };
  }

  return {
    success: true,
    data: user,
  };
});

export const getUserSessionData = actionClient.action<ActionResponse<AgentUser>>(async () => {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return {
      success: false,
      error: "User not authenticated",
    };
  }
  return {
    success: true,
    data: {
      id: session.user.id,
      address: session.user.address,
    },
  };
});