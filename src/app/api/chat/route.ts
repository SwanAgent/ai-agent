import {
  type Message,
  convertToCoreMessages,
  createDataStreamResponse,
  streamObject,
  streamText,
} from 'ai';
import { z } from 'zod';

import { customModel } from '@/lib/ai';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import {
  codePrompt,
  systemPrompt,
  updateDocumentPrompt,
} from '@/lib/ai/prompts';
import {
  deleteChatById,
  getChatById,
  getDocumentById,
  saveChat,
  saveDocument,
  saveMessages,
  saveSuggestions,
} from '@/server/db/queries';
import type { Suggestion } from '@/types/db';
import {
  generateUUID,
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/utils';

import { generateTitleFromUserMessage } from '@/server/actions/ai';
import { tools } from '@/lib/ai/actions';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth-options';
import { getUserData } from '@/server/actions/user';

export const maxDuration = 60;

type AllowedTools = keyof typeof tools;

const allTools: AllowedTools[] = [...Object.keys(tools) as AllowedTools[]];

export async function POST(request: Request) {
  try {
    const {
      id,
      messages,
      // modelId,
    }: { id: string; messages: Array<Message>;  } =
      await request.json();

    // Get the session using the auth options
    const session = await getServerSession(authOptions)
    if (!session || !session.user || !session.user.id) {
      return new Response('Unauthorized', { status: 401 })
    }

    const modelId = DEFAULT_MODEL_NAME;
    const { id: userId, address: userAddress } = session.user
    const model = models.find((model) => model.id === modelId);

    if (!model) {
      return new Response('Model not found', { status: 404 });
    }

    const coreMessages = convertToCoreMessages(messages);
    const userMessage = getMostRecentUserMessage(coreMessages);

    if (!userMessage) {
      return new Response('No user message found', { status: 400 });
    }

    const chat = await getChatById({ id });

    if (!chat) {
      const title = await generateTitleFromUserMessage({ message: userMessage });
      await saveChat({ id, userId: userId, title });
    }

    const userMessageId = generateUUID();

    const user = await getUserData()
    if (!user?.data?.data) {
      return new Response('User not found', { status: 404 });
    }

    const { publicKey } = user.data.data.wallets[0];

    await saveMessages({
      messages: [
        { id: userMessageId, role: userMessage.role, chatId: id, content: userMessage.content as unknown as any },
      ],
    });

    const defaultSystemPrompt = systemPrompt +
      `\n\nUser Base wallet public key: ${publicKey ?? "Unknown"}`;

    return createDataStreamResponse({
      execute: (dataStream) => {
        dataStream.writeData({
          type: 'user-message-id',
          content: userMessageId,
        });

        const result = streamText({
          model: customModel(model.apiIdentifier),
          system: defaultSystemPrompt,
          messages: coreMessages,
          maxSteps: 5,
          experimental_activeTools: allTools,
          tools: {
            ...tools,
          },
          onFinish: async ({ response }) => {
            if (userId) {
              try {
                const responseMessagesWithoutIncompleteToolCalls =
                  sanitizeResponseMessages(response.messages);

                await saveMessages({
                  messages: responseMessagesWithoutIncompleteToolCalls.map(
                    (message) => {
                      const messageId = generateUUID();

                      if (message.role === 'assistant') {
                        dataStream.writeMessageAnnotation({
                          messageIdFromServer: messageId,
                        });
                      }

                      return {
                        id: messageId,
                        chatId: id,
                        role: message.role,
                        content: message.content as unknown as any,
                      };
                    },
                  ),
                });
              } catch (error) {
                console.error('Failed to save chat');
              }
            }
          },
          experimental_telemetry: {
            isEnabled: true,
            functionId: 'stream-text',
          },
        });

        result.mergeIntoDataStream(dataStream);
      },
    });
  } catch (error) {
    console.error(error);
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Not Found', { status: 404 });
  }
  // Get the session using the auth options
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id;

  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response('Chat not found', { status: 404 });
    }

    if (chat.userId !== userId) {
      return new Response('Unauthorized', { status: 401 });
    }

    await deleteChatById({ id });

    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
