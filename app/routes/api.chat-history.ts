import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { randomUUID } from 'node:crypto';
import type { Message } from 'ai';
import { getUserId } from '~/lib/.server/auth/session.server';
import { ensureDefaultProject } from '~/lib/.server/persistence/default-project.server';
import {
  createChat,
  getChatById,
  getChatByUrlId,
  listChatsByProject,
  softDeleteChat,
  updateChat,
} from '~/lib/.server/persistence/chats-repository';
import {
  appendMessages,
  deleteMessagesByChat,
  listMessagesByChat,
} from '~/lib/.server/persistence/messages-repository';

interface ChatHistoryShape {
  id: string;
  urlId?: string;
  description?: string;
  messages: Message[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

function toClientMessage(row: any): Message {
  return {
    id: row.id,
    role: row.role,
    content: row.content_text ?? '',
  } as Message;
}

function toChatHistory(chat: any, messages: any[]): ChatHistoryShape {
  return {
    id: chat.id,
    urlId: chat.url_id,
    description: chat.description ?? chat.title ?? undefined,
    messages: messages.map(toClientMessage),
    timestamp: chat.updated_at,
    metadata: chat.metadata_json ? JSON.parse(chat.metadata_json) : undefined,
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ chats: [], chat: null });
  }

  const project = await ensureDefaultProject(userId);
  const url = new URL(request.url);
  const id = url.searchParams.get('id');

  if (id) {
    const chatById = await getChatById(id, userId);
    const chatByUrlId = chatById ?? (await getChatByUrlId(project.id, id, userId));

    if (!chatByUrlId) {
      return json({ chat: null });
    }

    const messages = await listMessagesByChat(chatByUrlId.id, userId);

    return json({ chat: toChatHistory(chatByUrlId, messages) });
  }

  const chats = await listChatsByProject(project.id, userId, { limit: 200, offset: 0 });
  const list = chats.map((chat) => ({
    id: chat.id,
    urlId: chat.url_id,
    description: chat.description ?? chat.title ?? undefined,
    messages: [],
    timestamp: chat.updated_at,
  }));

  return json({ chats: list, projectId: project.id });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = await ensureDefaultProject(userId);
  const body = await request.json<{
    action?: 'setMessages' | 'delete';
    id: string;
    urlId?: string;
    description?: string;
    timestamp?: string;
    metadata?: Record<string, unknown>;
    messages?: Message[];
  }>();

  if (body.action === 'delete') {
    const existingById = await getChatById(body.id, userId);
    const existingByUrl = existingById ?? (await getChatByUrlId(project.id, body.id, userId));

    if (existingByUrl) {
      await softDeleteChat(existingByUrl.id, userId);
      await deleteMessagesByChat(existingByUrl.id, userId);
    }

    return json({ ok: true });
  }

  const chatUrlId = body.urlId ?? body.id ?? randomUUID().slice(0, 8);
  const existingById = await getChatById(body.id, userId);
  const existing = existingById ?? (await getChatByUrlId(project.id, chatUrlId, userId));

  const chat =
    existing ??
    (await createChat({
      projectId: project.id,
      userId,
      urlId: chatUrlId,
      title: body.description,
      description: body.description,
      metadataJson: JSON.stringify(body.metadata ?? {}),
    }));

  await updateChat(chat.id, userId, {
    title: body.description,
    description: body.description,
    latestMessageAt: body.timestamp ?? new Date().toISOString(),
    metadataJson: body.metadata ? JSON.stringify(body.metadata) : undefined,
  });

  await deleteMessagesByChat(chat.id, userId);

  const incoming = body.messages ?? [];
  const rows = incoming.map((msg, index) => ({
    id: msg.id,
    chatId: chat.id,
    projectId: project.id,
    userId,
    role: (msg.role as 'system' | 'user' | 'assistant' | 'tool') ?? 'user',
    sequenceNo: index + 1,
    contentText: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
  }));

  if (rows.length > 0) {
    await appendMessages(rows);
  }

  return json({ ok: true, chatId: chat.id, urlId: chat.url_id });
}
