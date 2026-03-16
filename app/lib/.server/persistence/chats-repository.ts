import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';
import { withPagination, type Pagination } from './types';

export interface ChatRow {
  id: string;
  project_id: string;
  user_id: string;
  url_id: string;
  title: string | null;
  description: string | null;
  status: 'active' | 'archived' | 'deleted';
  forked_from_chat_id: string | null;
  forked_from_message_id: string | null;
  latest_message_at: string | null;
  latest_snapshot_id: string | null;
  metadata_json: string;
  created_at: string;
  updated_at: string;
}

export interface CreateChatInput {
  projectId: string;
  userId: string;
  urlId: string;
  title?: string;
  description?: string;
  forkedFromChatId?: string;
  forkedFromMessageId?: string;
  metadataJson?: string;
}

export interface UpdateChatInput {
  title?: string;
  description?: string;
  status?: ChatRow['status'];
  latestMessageAt?: string;
  latestSnapshotId?: string;
  metadataJson?: string;
}

export async function listChatsByProject(projectId: string, userId: string, pagination?: Pagination): Promise<ChatRow[]> {
  const client = getTursoClient();
  const sql = withPagination(
    `
      SELECT *
      FROM chats
      WHERE project_id = ? AND user_id = ?
      ORDER BY updated_at DESC
    `,
    pagination,
  );
  const result = await client.execute({ sql, args: [projectId, userId] });
  return (result.rows as unknown as ChatRow[]) || [];
}

export async function getChatById(chatId: string, userId: string): Promise<ChatRow | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `SELECT * FROM chats WHERE id = ? AND user_id = ? LIMIT 1`,
    args: [chatId, userId],
  });
  return (result.rows[0] as unknown as ChatRow) || null;
}

export async function createChat(input: CreateChatInput): Promise<ChatRow> {
  const client = getTursoClient();
  const id = randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: `
      INSERT INTO chats (
        id, project_id, user_id, url_id, title, description, status,
        forked_from_chat_id, forked_from_message_id, metadata_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.projectId,
      input.userId,
      input.urlId,
      input.title ?? null,
      input.description ?? null,
      input.forkedFromChatId ?? null,
      input.forkedFromMessageId ?? null,
      input.metadataJson ?? '{}',
      now,
      now,
    ],
  });

  const created = await getChatById(id, input.userId);
  if (!created) {
    throw new Error('Failed to create chat');
  }

  return created;
}

export async function updateChat(chatId: string, userId: string, input: UpdateChatInput): Promise<void> {
  const client = getTursoClient();
  await client.execute({
    sql: `
      UPDATE chats
      SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        latest_message_at = COALESCE(?, latest_message_at),
        latest_snapshot_id = COALESCE(?, latest_snapshot_id),
        metadata_json = COALESCE(?, metadata_json),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `,
    args: [
      input.title ?? null,
      input.description ?? null,
      input.status ?? null,
      input.latestMessageAt ?? null,
      input.latestSnapshotId ?? null,
      input.metadataJson ?? null,
      chatId,
      userId,
    ],
  });
}

export async function softDeleteChat(chatId: string, userId: string): Promise<void> {
  await updateChat(chatId, userId, { status: 'deleted' });
}
