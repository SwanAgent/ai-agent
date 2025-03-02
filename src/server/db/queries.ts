import { BlockKind } from "@/components/block";
import prisma from "@/lib/prisma";
import { ActionWithUser, Message, NewAction } from "@/types/db";
import { Action, Chat, Kind, Prisma, User, Visibility, Wallet } from "@prisma/client";
import { Message as PrismaMessage } from '@prisma/client';
import _ from "lodash";

export async function saveChat({
    id,
    userId,
    title,
}: {
    id: string;
    userId: string;
    title: string;
}) {
    try {
        return await prisma.chat.create({
            data: {
                id,
                createdAt: new Date(),
                userId,
                title,
            },
        });
    } catch (error) {
        console.error('Failed to save chat in database');
        throw error;
    }
}

export async function deleteChatById({ id }: { id: string }) {
    try {
        // Prisma will automatically delete related votes and messages due to cascade delete
        return await prisma.chat.delete({
            where: { id },
        });
    } catch (error) {
        console.error('Failed to delete chat by id from database', error);
        throw error;
    }
}

export async function getChatsByUserId({ id, visibility = Visibility.private }: { id: string, visibility?: Visibility }) {
    try {
        return await prisma.chat.findMany({
            where: { 
                userId: id,
                visibility: visibility
            },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Failed to get chats by user from database');
        throw error;
    }
}

export async function getChatById({ id }: { id: string }) {
    try {
        return await prisma.chat.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error('Failed to get chat by id from database');
        throw error;
    }
}

export async function saveMessages({
    messages,
}: {
    messages: Omit<PrismaMessage, 'createdAt'>[];
}) {
    try {
        return await prisma.message.createMany({
            data: messages as Prisma.MessageCreateManyInput[],
        });
    } catch (error) {
        console.error('Failed to save messages in database', error);
        throw error;
    }
}

export async function getMessagesByChatId({ id }: { id: string }) {
    try {
        return await prisma.message.findMany({
            where: { chatId: id },
            orderBy: { createdAt: 'asc' },
        });
    } catch (error) {
        console.error('Failed to get messages by chat id from database', error);
        throw error;
    }
}


export async function voteMessage({
    chatId,
    messageId,
    type,
}: {
    chatId: string;
    messageId: string;
    type: 'up' | 'down';
}) {
    try {
        const existingVote = await prisma.vote.findUnique({
            where: {
                chatId_messageId: {
                    chatId,
                    messageId,
                },
            },
        });

        if (existingVote) {
            return await prisma.vote.update({
                where: {
                    chatId_messageId: {
                        chatId,
                        messageId,
                    },
                },
                data: { isUpvoted: type === 'up' },
            });
        }

        return await prisma.vote.create({
            data: {
                chatId,
                messageId,
                isUpvoted: type === 'up',
            },
        });
    } catch (error) {
        console.error('Failed to vote message in database', error);
        throw error;
    }
}

export async function getVotesByChatId({ id }: { id: string }) {
    try {
        return await prisma.vote.findMany({
            where: { chatId: id },
        });
    } catch (error) {
        console.error('Failed to get votes by chat id from database', error);
        throw error;
    }
}

export async function saveDocument({
    id,
    title,
    kind,
    content,
    userId,
}: {
    id: string;
    title: string;
    kind: BlockKind;
    content: string;
    userId: string;
}) {
    try {
        return await prisma.document.create({
            data: {
                id,
                title,
                kind: kind === 'text' ? Kind.text : Kind.code,
                content,
                userId,
                createdAt: new Date(),
            },
        });
    } catch (error) {
        console.error('Failed to save document in database');
        throw error;
    }
}

export async function getDocumentsById({ id }: { id: string }) {
    try {
        return await prisma.document.findMany({
            where: { id },
            orderBy: { createdAt: 'asc' },
        });
    } catch (error) {
        console.error('Failed to get document by id from database');
        throw error;
    }
}

export async function getDocumentById({ id }: { id: string }) {
    try {
        return await prisma.document.findFirst({
            where: { id },
            orderBy: { createdAt: 'desc' },
        });
    } catch (error) {
        console.error('Failed to get document by id from database');
        throw error;
    }
}

export async function deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp,
}: {
    id: string;
    timestamp: Date;
}) {
    try {
        // Delete related suggestions first
        await prisma.suggestion.deleteMany({
            where: {
                documentId: id,
                documentCreatedAt: { gt: timestamp },
            },
        });

        return await prisma.document.deleteMany({
            where: {
                id,
                createdAt: { gt: timestamp },
            },
        });
    } catch (error) {
        console.error('Failed to delete documents by id after timestamp from database');
        throw error;
    }
}

export async function saveSuggestions({
    suggestions,
}: {
    suggestions: Array<any>;
}) {
    try {
        return await prisma.suggestion.createMany({
            data: suggestions,
        });
    } catch (error) {
        console.error('Failed to save suggestions in database');
        throw error;
    }
}

export async function getSuggestionsByDocumentId({
    documentId,
}: {
    documentId: string;
}) {
    try {
        return await prisma.suggestion.findMany({
            where: { documentId },
        });
    } catch (error) {
        console.error('Failed to get suggestions by document version from database');
        throw error;
    }
}

export async function getMessageById({ id }: { id: string }) {
    try {
        return await prisma.message.findMany({
            where: { id },
        });
    } catch (error) {
        console.error('Failed to get message by id from database');
        throw error;
    }
}

export async function deleteMessagesByChatIdAfterTimestamp({
    chatId,
    timestamp,
}: {
    chatId: string;
    timestamp: Date;
}) {
    try {
        return await prisma.message.deleteMany({
            where: {
                chatId,
                createdAt: { gte: timestamp },
            },
        });
    } catch (error) {
        console.error('Failed to delete messages by id after timestamp from database');
        throw error;
    }
}

export async function updateChatVisiblityById({
    chatId,
    visibility,
}: {
    chatId: string;
    visibility: Visibility;
}) {
    try {
        return await prisma.chat.update({
            where: { id: chatId },
            data: { visibility: visibility },
        });
    } catch (error) {
        console.error('Failed to update chat visibility in database');
        throw error;
    }
}


/**
 * Retrieves all actions that match the specified filters
 * @param {Object} params - The parameters object
 * @param {boolean} params.triggered - Boolean to filter triggered actions
 * @param {boolean} params.paused - Boolean to filter paused actions
 * @param {boolean} params.completed - Boolean to filter completed actions
 * @param {number} params.frequency - The frequency of the action
 * @returns {Promise<Action[]>} Array of actions
 */
export async function dbGetActions({
    triggered = true,
    paused = false,
    completed = false,
  }: {
    triggered: boolean;
    paused: boolean;
    completed: boolean;
  }): Promise<ActionWithUser[]> {
    try {
      return await prisma.action.findMany({
        where: {
          triggered,
          paused,
          completed
        },
        orderBy: { createdAt: 'desc' },
        include: { user: { include: { wallets: true } } },
      });
    } catch (error) {
      console.error('[DB Error] Failed to get actions:', {
        error,
      });
      return [];
    }
  }
  
  export async function dbCreateAction(action: NewAction) {
    try {
      return await prisma.$transaction(async (tx) => {
        const newChat = await tx.chat.create({
          data: {
            userId: action.userId,
            title: action.name ?? "New Action",
            visibility: Visibility.task,
          },
        });

        console.log('newChat', newChat);

        const newMessage = await tx.message.create({
          data: {
            chatId: newChat.id,
            content: "Generating Action: " + action.name,
            role: 'assistant'
          },
        });

        console.log('newMessage', newMessage);

        const _action = await tx.action.create({
            data: {
              ..._.omit(action, 'chatId', 'userId'),
              params: action.params as Prisma.JsonObject,
              user: {
                connect: {
                  id: action.userId,
                },
              },
              chat: {
                connect: {
                  id: newChat.id,
                },
              },
            },
          });

        console.log('newAction', _action);

          return _action;
      });
    } catch (error) {
      console.log('[DB Error] Failed to create action:', {
        error,
      });
      return undefined;
    }
  }


/**
 * Creates multiple messages in bulk
 * @param {Object} params - The parameters object
 * @param {Array<Omit<PrismaMessage, 'id' | 'createdAt'>>} params.messages - Array of message objects to create
 * @returns {Promise<Prisma.BatchPayload | null>} The result of the bulk creation or null if it fails
 */
export async function dbCreateMessages({
    messages,
  }: {
    messages: Omit<PrismaMessage, 'id' | 'createdAt'>[];
  }): Promise<Prisma.BatchPayload | null> {
    try {
      return await prisma.message.createMany({
        data: messages as Prisma.MessageCreateManyInput[],
      });
    } catch (error) {
      console.error('[DB Error] Failed to create messages:', {
        messageCount: messages.length,
        error,
      });
      return null;
    }
  }

  /**
 * Retrieves a chat by its ID
 * @param {Object} params - The parameters object
 * @param {string} params.chatId - The unique identifier of the chat
 * @returns {Promise<Chat | null>} The chat object or null if not found/error occurs
 */
export async function dbGetChat({
    chatId,
    includeMessages,
  }: {
    chatId: string;
    includeMessages?: boolean;
  }): Promise<Chat | null> {
    try {
      return await prisma.chat.findUnique({
        where: { id: chatId },
        include: includeMessages ? { messages: true, user: true } : {user: true},
      });
    } catch (error) {
      console.error('[DB Error] Failed to get chat:', {
        chatId,
        error,
      });
      return null;
    }
  }
  
/**
 * Twitter DB methods
 */
export async function saveTwitterAccess({
    userId,
    oauthToken,
    requestSecret,
    accessToken,
    accessSecret,
    isValid,
}: {
    userId: string;
    oauthToken: string;
    requestSecret: string;
    accessToken?: string;
    accessSecret?: string;
    isValid: boolean;
}) {
    try {
        return await prisma.twitterAccess.upsert({
            where: { userId },
            update: {
                requestSecret: requestSecret,
                accessToken: accessToken ?? undefined,
                accessSecret: accessSecret ?? undefined,
                oauthToken,
                isValid,
            },
            create: {
                userId,
                requestSecret: requestSecret,
                accessToken: accessToken ?? null,
                accessSecret: accessSecret ?? null,
                oauthToken,
                isValid,
            },
        });
    } catch (error) {
        console.error("Failed to save/update Twitter access in database");
        throw error;
    }
}

export async function updateTwitterAccess({
    oauthToken,
    accessToken,
    accessSecret,
    username,
    isValid,
}: {
    oauthToken: string;
    accessToken?: string;
    accessSecret?: string;
    username?: string;
    isValid: boolean;
}) {
    try {
        return await prisma.twitterAccess.update({
            where: { oauthToken },
            data: {
                accessToken: accessToken ?? undefined,
                accessSecret: accessSecret ?? undefined,
                username: username ?? undefined,
                isValid,
            },
        });
    } catch (error) {
        console.error("Failed to update Twitter access in database", error);
        throw error;
    }
}

export async function getTwitterAccessByUserId({ userId }: { userId: string }) {
    try {
        return await prisma.twitterAccess.findFirst({
            where: { userId },
        });
    } catch (error) {
        console.error("Failed to get Twitter access by user id from database", error);
        return null;
    }
}

export async function getTwitterAccessByOauthToken({
    oauthToken,
}: {
    oauthToken: string;
}) {
    try {
        return await prisma.twitterAccess.findFirst({
            where: { oauthToken },
        });
    } catch (error) {
        console.error("Failed to get Twitter access by user id from database");
        throw error;
    }
}

export async function invalidateTwitterAccess({ userId }: { userId: string }) {
    try {
        return await prisma.twitterAccess.update({
            where: { userId },
            data: { isValid: false },
        });
    } catch (error) {
        console.error("Failed to invalidate Twitter access for user");
        throw error;
    }
}

export async function getUserByWalletAddress({ walletAddress }: { walletAddress: string }) {
    try {
        return await prisma.user.findFirst({
            where: { wallets: { some: { publicKey: walletAddress } } },
        });
    } catch (error) {
        console.error("Failed to get user by wallet address from database", error);
        throw error;
    }
}

export async function getUserById({ id }: { id: string }) {
    try {
        return await prisma.user.findUnique({
            where: { id },
        });
    } catch (error) {
        console.error("Failed to get user by id from database", error);
        throw error;
    }
}