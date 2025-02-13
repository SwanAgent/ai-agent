import {
  CoreTool,
  NoSuchToolError,
  appendResponseMessages,
  convertToCoreMessages,
  generateObject,
  generateText,
} from 'ai';
import _, { uniqueId } from 'lodash';
import moment from 'moment';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import {
  dbCreateMessages,
  dbGetChat,
} from '@/server/db/queries';
import { ActionWithUser } from '@/types/db';

import { getToolsFromOrchestrator } from './orchestrator';
import { defaultToolsWithoutConfirmation, getToolsFromRequiredTools } from '@/lib/ai/actions';
import { defaultModel, defaultSystemPrompt } from '@/lib/ai/prompts';

const ACTION_PAUSE_THRESHOLD = 3;

export async function processAction(action: ActionWithUser) {
  const startTime = performance.now();
  console.log(
    `[action:${action.id}] Processing action ${action.id} with prompt "${action.description}"`,
  );

  // flags for successful execution
  let successfulExecution = false;
  let noToolExecution = true;

  try {
    const chat = await dbGetChat({
      chatId: action.chatId,
    });

    if (!chat) {
      console.error(
        `[action:${action.id}] Chat ${action.chatId} not found`,
      );
      return;
    }

    // logWithTiming(startTime, `[action:${action.id}] Retrieved conversation`);

    // Get user wallet
    const activeWallet = action.user.wallets[0];
    if (!activeWallet) {
      console.error(
        `[action:${action.id}] No active wallet found for user ${action.userId}`,
      );
      return;
    }
    const systemPrompt =
      defaultSystemPrompt +
      `\n\nUser Solana wallet public key: ${activeWallet.publicKey}`;

    // Run messages through orchestration
    const { toolsRequired, usage: orchestratorUsage } =
      await getToolsFromOrchestrator(
        [
          {
            id: '1',
            role: 'user',
            content: action.description,
          },
        ],
        true,
      );
    // const agent = (await retrieveAgentKit({ walletId: activeWallet.id }))?.data
    //   ?.data?.agent;

    // logWithTiming(
    //   startTime,
    //   `[action:${action.id}] getToolsFromOrchestrator completed`,
    // );

    // Check for any unknown tools
    for (const toolName of toolsRequired ?? []) {
      if (toolName.startsWith('INVALID_TOOL:')) {
        console.error(
          `[action:${action.id}] Unknown tool requested ${toolName}, skipping action`,
        );
        successfulExecution = false;
        return;
      }
    }

    const tools = toolsRequired
      ? getToolsFromRequiredTools(toolsRequired)
      : defaultToolsWithoutConfirmation;

    const clonedTools = _.cloneDeep(tools);
    for (const toolName in clonedTools) {
      const tool = clonedTools[toolName as keyof typeof clonedTools];
      clonedTools[toolName as keyof typeof clonedTools] = {
        ...tool,
        // userId: action.userId,
      };
    }

    // Remove createAction from tools, prevent recursive action creation
    delete tools.createActionTool;

    // Call the AI model
    // logWithTiming(startTime, `[action:${action.id}] calling generateText`);
    const { response, usage } = await generateText({
      model: defaultModel,
      system: systemPrompt,
      tools: clonedTools as Record<string, CoreTool<any, any>>,
      experimental_telemetry: {
        isEnabled: true,
        functionId: 'generate-text',
      },
      experimental_repairToolCall: async ({
        toolCall,
        tools,
        parameterSchema,
        error,
      }) => {
        if (NoSuchToolError.isInstance(error)) {
          return null;
        }

        console.log('[action:${action.id}] repairToolCall', toolCall);

        const tool = tools[toolCall.toolName as keyof typeof tools];
        const { object: repairedArgs } = await generateObject({
          model: defaultModel,
          schema: tool.parameters as z.ZodType<any>,
          prompt: [
            `The model tried to call the tool "${toolCall.toolName}"` +
              ` with the following arguments:`,
            JSON.stringify(toolCall.args),
            `The tool accepts the following schema:`,
            JSON.stringify(parameterSchema(toolCall)),
            'Please fix the arguments.',
          ].join('\n'),
        });

        console.log('[action:${action.id}] repairedArgs', repairedArgs);
        console.log('[action:${action.id}] toolCall', toolCall);

        return { ...toolCall, args: JSON.stringify(repairedArgs) };
      },
      onStepFinish({ toolResults, stepType }) {
        if (stepType === 'tool-result' && toolResults.length > 0) {
          noToolExecution = false;
        }
      },
      maxSteps: 15,
      prompt: action.description,
    });

    const finalMessages = appendResponseMessages({
      messages: [],
      responseMessages: response.messages.map((m) => {
        return {
          ...m,
          id: uniqueId(),
        };
      }),
    });

    // Increment createdAt by 1ms to avoid duplicate timestamps
    finalMessages.forEach((m, index) => {
      if (m.createdAt) {
        m.createdAt = new Date(m.createdAt.getTime() + index);
      }
    });

    // logWithTiming(startTime, `[action:${action.id}] generateText completed`);
    const messages = await dbCreateMessages({
      messages: convertToCoreMessages(finalMessages).map((message) => {
        return {
          chatId: action.chatId,
          role: message.role,
          content: message.content as any
        };
      }),
    });

    console.log(`[action:${action.id}] Processed action ${action.id}`);

    // If no tool was executed, mark the action as failure
    if (!noToolExecution) {
      successfulExecution = true;
    }
  } catch (error) {
    console.error(
      `[action:${action.id}] Failed to process action ${action.id}`,
      error,
    );
    successfulExecution = false;
  } finally {
    // Increment the action's execution count and state
    // round off to the nearest 15th minute like 15, 30, 45, 60
    const completeTime = new Date(Math.floor(new Date().getTime() / 900000) * 900000);

    const update = {
      timesExecuted: { increment: 1 },
      lastExecutedAt: completeTime,
      completed:
        !!action.maxExecutions &&
        action.timesExecuted + 1 >= action.maxExecutions,
      lastSuccessAt: successfulExecution ? completeTime : undefined,
      lastFailureAt: !successfulExecution ? completeTime : undefined,
      paused: action.paused,
    };

    if (!successfulExecution && action.lastSuccessAt) {
      // Action failed, but has succeeded before. If lastSuccessAt is more than 1 day ago, pause the action
      const lastSuccessAt = moment(action.lastSuccessAt);
      const oneDayAgo = moment().subtract(1, 'days');

      if (lastSuccessAt.isBefore(oneDayAgo)) {
        update.paused = true;

        console.log(
          `[action:${action.id}] paused - execution failed and no recent success`,
        );

        await dbCreateMessages({
          messages: [
            {
              chatId: action.chatId,
              role: 'assistant',
              content: `I've paused action ${action.id} because it has not executed successfully in the last 24 hours.`,
            },
          ],
        });
      }
    } else if (!successfulExecution && !action.lastSuccessAt) {
      // Action failed and has never succeeded before. If execution count is more than N, pause the action
      if (action.timesExecuted >= ACTION_PAUSE_THRESHOLD) {
        update.paused = true;

        console.log(
          `[action:${action.id}] paused - execution failed repeatedly`,
        );

        await dbCreateMessages({
          messages: [
            {
              chatId: action.chatId,
              role: 'assistant',
              content: `I've paused action ${action.id} because it has failed to execute successfully more than ${ACTION_PAUSE_THRESHOLD} times.`,
            },
          ],
        });
      }
    }

    await prisma.action.update({
      where: { id: action.id },
      data: update,
    });
  }
}
