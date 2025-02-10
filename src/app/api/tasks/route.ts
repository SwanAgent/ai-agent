import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth-options';
import prisma from '@/lib/prisma';
import { getChatsByUserId } from '@/server/db/queries';
import { Visibility } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const userId = session.user.id;
  console.log('userId', userId);
  try {
    // const tasks = await getChatsByUserId({ id: userId, visibility: Visibility.task });
    const tasks = await prisma.chat.findMany({
      where: {
        userId,
        visibility: 'task',
      },
      include: {
        Action: true
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('tasks', tasks);
    return Response.json(tasks);
  } catch (error) {
    console.log('Failed to fetch tasks:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 