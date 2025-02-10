'use client';

import { useEffect, useState } from 'react';
import { Clock, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Action, Chat } from '@/types/db';
import { formatFrequency, getNextExecutionTime } from '@/lib/utils/time';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';

type TaskChat = Chat & {
  Action: Action[];
};

function TaskSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex justify-between items-start">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-[250px]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </Card>
  );
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskChat[]>([]);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tasks');
      if (!response.ok) throw new Error('Failed to fetch tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!deleteTaskId) return;

    try {
      const response = await fetch(`/api/chat?id=${deleteTaskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');

      setTasks(tasks.filter(task => task.id !== deleteTaskId));
      setShowDeleteDialog(false);
      setDeleteTaskId(null);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Scheduled Tasks</h1>
        <p className="text-muted-foreground mt-2">
          Manage your automated tasks and their schedules
        </p>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <>
            <TaskSkeleton />
            <TaskSkeleton />
            <TaskSkeleton />
          </>
        ) : tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No Tasks Found</h3>
            <p className="text-muted-foreground mt-2">
              Create a new task by starting a chat and asking the AI to schedule something.
            </p>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card
             key={task.id} 
             className="p-6 cursor-pointer"
             onClick={() => {
              router.push(`/chat/${task.id}`);
             }}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-semibold truncate">{task.title}</h2>
                  <div className="mt-4 space-y-3">
                    {task.Action.map((action) => (
                      <div
                        key={action.id}
                        className="rounded-lg bg-muted/50 p-3 text-sm space-y-2"
                      >
                        <p className="text-muted-foreground">{action.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Next Run:</span>
                            <p className="font-medium">
                              {getNextExecutionTime(action.startTime, action.frequency)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Frequency:</span>
                            <p className="font-medium">
                              {formatFrequency(action.frequency)}
                            </p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Times Executed:</span>
                            <p className="font-medium">{action.timesExecuted}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Max Executions:</span>
                            <p className="font-medium">
                              {action.maxExecutions ?? 'Unlimited'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDeleteTaskId(task.id);
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this task and all its associated actions. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 