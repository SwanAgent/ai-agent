import { getChatsByUserId } from '@/server/db/queries';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/auth-options';

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id; 

  // biome-ignore lint: Forbidden non-null assertion.
  const chats = await getChatsByUserId({ id: userId });
  return Response.json(chats);
}