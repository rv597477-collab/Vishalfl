import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import {
  listChatsByProject,
  createChat,
  getChatById,
  updateChat,
  softDeleteChat,
} from '~/lib/.server/persistence/chats-repository';
import { randomUUID } from 'node:crypto';

// GET /api/chats?projectId=... — list chats for a project
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ chats: [] });
  }

  const url = new URL(request.url);
  const projectId = url.searchParams.get('projectId');

  if (!projectId) {
    return json({ chats: [] });
  }

  const chats = await listChatsByProject(projectId, userId);
  return json({ chats });
}

// POST /api/chats — create, update or delete a chat
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    action?: string;
    id?: string;
    projectId?: string;
    urlId?: string;
    title?: string;
    description?: string;
    latestMessageAt?: string;
  }>();

  if (body.action === 'delete' && body.id) {
    await softDeleteChat(body.id, userId);
    return json({ ok: true });
  }

  if (body.action === 'update' && body.id) {
    await updateChat(body.id, userId, {
      title: body.title,
      description: body.description,
      latestMessageAt: body.latestMessageAt,
    });
    const chat = await getChatById(body.id, userId);
    return json({ chat });
  }

  // Default: create
  if (!body.projectId) {
    return json({ error: 'projectId required' }, { status: 400 });
  }

  const urlId = body.urlId ?? randomUUID().slice(0, 8);
  const chat = await createChat({
    projectId: body.projectId,
    userId,
    urlId,
    title: body.title,
    description: body.description,
  });

  return json({ chat });
}
