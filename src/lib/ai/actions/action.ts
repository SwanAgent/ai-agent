import { z } from 'zod';

import { dbCreateAction } from '@/server/db/queries';
import { ActionResponse } from '@/types/actions';
import { getUserSessionData } from '@/server/actions/user';
import { Action } from '@/types/db';
import { ToolConfig } from '.';

export const NO_CONFIRMATION_MESSAGE = ' (Does not require confirmation)';

const createActionParams = z.object({
  requiresConfirmation: z.boolean().optional().default(true),
  userId: z.string().describe('User that the action belongs to'),
  chatId: z
    .string()
    .describe('Chat that the action belongs to'),
  name: z
    .string()
    .describe(
      'Shorthand human readable name to classify the action.',
    ),
  description: z
    .string()
    .describe(
      'Action description to display as the main content. STRICT RULES: Should not contain the frequency (like every X time) or max executions (like 10 times)',
    ),
  frequency: z
    .number()
    .describe(
      'Frequency in seconds (3600 for hourly, 86400 for daily, or any custom intervals of 15 minutes (900)). It should be a multiple of 15 minutes only.',
    ),
  maxExecutions: z
    .number()
    .optional()
    .describe('Max number of times the action can be executed'),
  startTimeOffset: z
    .number()
    .optional()
    .describe('Offset in milliseconds for how long to wait before starting the action. Useful for scheduling actions in the future, e.g. 1 hour from now = 3600000'),
})

export type CreateActionResult = ActionResponse<Action>

export const createActionTool: ToolConfig = {
  description:
    'Create an action in the database (requires confirmation from the user first about the action name, description, frequency, max executions, and start time if specified). Do proper checks if the action requires additional setup before creating an action',
  displayName: '⚡ Create Action',
  parameters: createActionParams,
  execute: async function (
    params: z.infer<typeof this.parameters>,
  ): Promise<CreateActionResult> {
    try {
      const response = await getUserSessionData();
      if (!response?.data?.success || !response?.data?.data) {
          return { success: false, error: 'Unauthorized' };
      }

      const userId = response.data.data.id;

    if (!userId || userId !== params.userId) {
        return { success: false, error: 'Unauthorized' };
      }

      console.log('action params');
      console.dir(params);

      const action = await dbCreateAction({
        userId,
        chatId: params.chatId,
        name: params.name,
        description: `${params.description}${NO_CONFIRMATION_MESSAGE}`,
        actionType: 'default',
        frequency: params.frequency,
        maxExecutions: params.maxExecutions ?? 0,
        triggered: true,
        paused: false,
        completed: false,
        priority: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        triggeredBy: [],
        stoppedBy: [],
        params: {},
        timesExecuted: 0,
        lastExecutedAt: null,
        lastFailureAt: null,
        lastSuccessAt: null,
        startTime: params.startTimeOffset ? new Date(Date.now() + params.startTimeOffset) : new Date(),
      });
      console.log('action', action);
      if (!action) {
        return { success: false, error: 'Failed to create action' };
      }

      return { success: true, data: action };
    } catch (error: any) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error creating action',
      };
    }
  }
};

