import { authOptions } from '@/utils/auth-options';
import { BlockKind } from '@/components/block';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/server/db/queries';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id;

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (!document) {
    return new Response('Not Found', { status: 404 });
  }

  if (document.userId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id;

  const {
    content,
    title,
    kind,
  }: { content: string; title: string; kind: BlockKind } = await request.json();

  if (userId) {
    const document = await saveDocument({
      id,
      content,
      title,
      kind,
      userId: userId,
    });

    return Response.json(document, { status: 200 });
  }
  return new Response('Unauthorized', { status: 401 });
}

export async function PATCH(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  const { timestamp }: { timestamp: string } = await request.json();

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const session = await getServerSession(authOptions)
  if (!session || !session.user || !session.user.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const userId = session.user.id;

  const documents = await getDocumentsById({ id });

  const [document] = documents;

  if (document.userId !== userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
}
