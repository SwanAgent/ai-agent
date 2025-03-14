import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';

export default async function Page() {
  redirect('/home');

  // const id = generateUUID();

  // const cookieStore = await cookies();
  // const modelIdFromCookie = cookieStore.get('model-id')?.value;

  // const selectedModelId =
  //   models.find((model) => model.id === modelIdFromCookie)?.id ||
  //   DEFAULT_MODEL_NAME;

  // return <></>;

  // return (
  //   <>
  //     <Chat
  //       key={id}
  //       id={id}
  //       initialMessages={[]}
  //       selectedModelId={selectedModelId}
  //       selectedVisibilityType="private"
  //       isReadonly={false}
  //     />
  //     <DataStreamHandler id={id} />
  //   </>
  // );
}