import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import { listMessagesByChat, appendMessage, appendMessages } from '~/lib/.server/persistence/messages-repository';
import type { CreateMessageInput } from '~/lib/.server/persistence/messages-repository';

// GET /api/messages?chatId=...&userId=... — list messages for a chat
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ messages: [] });
  }

  const url = new URL(request.url);
  const chatId = url.searchParams.get('chatId');

  if (!chatId) {
    return json({ messages: [] });
  }

  const messages = await listMessagesByChat(chatId, userId);
  return json({ messages });
}

// POST /api/messages — append one or many messages
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    messages?: Omit<CreateMessageInput, 'userId'>[];
    message?: Omit<CreateMessageInput, 'userId'>;
  }>();

  if (body.messages) {
    const withUser = body.messages.map((m) => ({ ...m, userId }));
    const saved = await appendMessages(withUser);
    return json({ messages: saved });
  }

  if (body.message) {
    const saved = await appendMessage({ ...body.message, userId });
    return json({ message: saved });
  }

  return json({ error: 'message or messages required' }, { status: 400 });
}
