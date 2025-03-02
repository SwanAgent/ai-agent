import { CreateActionResult, NO_CONFIRMATION_MESSAGE } from "@/lib/ai/actions/action";
import { Card } from "../ui/card";
import { ActionComponentProps } from "@/types/actions";
import { formatFrequency, getNextExecutionTime } from "@/lib/utils/time";

export type CreateActionResultProps = ActionComponentProps<CreateActionResult>

export function ActionResult({ result }: CreateActionResultProps) {
  const { id, description, frequency, maxExecutions, startTime } = result.toolResult?.data ?? {};

  console.log("result", result);

  if (!result.toolResult?.success) {
    return (
      <Card className="bg-destructive/10 p-6">
        <h2 className="mb-2 text-xl font-semibold text-destructive">
          Action Creation Failed
        </h2>
        <pre className="text-sm text-destructive/80">
          An Internal error occurred while creating the action. Please try again later.
        </pre>
      </Card>
    );
  }

  if (!id || !description || !frequency || !startTime) {
    return null;
  }

  const frequencyLabel = formatFrequency(frequency);
  const nextExecution = getNextExecutionTime(new Date(startTime), frequency);

  return (
    <>
    <Card className="bg-card p-6">
      <h2 className="mb-4 text-xl font-semibold text-card-foreground">
        Action Created Successfully! ⚡
      </h2>

      <div className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="text-sm font-medium text-muted-foreground">
            Description
          </div>
          <div className="mt-1 text-base font-semibold">
            {description.replace(NO_CONFIRMATION_MESSAGE, '')}
          </div>
        </div>

        <div className="space-y-1 rounded-lg bg-muted/50 p-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">Frequency</span>
            <span>{frequencyLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="mr-2 font-medium text-muted-foreground">
              Next Execution
            </span>
            <span className="ml-2">{nextExecution}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-muted-foreground">
              Max Executions
            </span>
            <span>{maxExecutions !== null ? maxExecutions : 'Unlimited'}</span>
          </div>
        </div>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Action ID: {id}
        </div>
        </div>
      </Card>
    </>
  );
}
