import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';
import { withPagination, type Pagination } from './types';

export interface ActivityLogRow {
  id: string;
  user_id: string;
  project_id: string;
  chat_id: string | null;
  message_id: string | null;
  file_id: string | null;
  category: string;
  action: string;
  level: 'debug' | 'info' | 'warning' | 'error';
  summary: string;
  details_json: string | null;
  source: string | null;
  created_at: string;
}

export interface CreateActivityLogInput {
  userId: string;
  projectId: string;
  category: string;
  action: string;
  summary: string;
  chatId?: string;
  messageId?: string;
  fileId?: string;
  level?: ActivityLogRow['level'];
  detailsJson?: string;
  source?: string;
}

export async function createActivityLog(input: CreateActivityLogInput): Promise<ActivityLogRow> {
  const client = getTursoClient();
  const id = randomUUID();

  await client.execute({
    sql: `
      INSERT INTO activity_logs (
        id, user_id, project_id, chat_id,
        message_id, file_id, category, action,
        level, summary, details_json, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.userId,
      input.projectId,
      input.chatId ?? null,
      input.messageId ?? null,
      input.fileId ?? null,
      input.category,
      input.action,
      input.level ?? 'info',
      input.summary,
      input.detailsJson ?? null,
      input.source ?? null,
    ],
  });

  const result = await client.execute({
    sql: `SELECT * FROM activity_logs WHERE id = ? LIMIT 1`,
    args: [id],
  });

  const created = result.rows[0] as unknown as ActivityLogRow | undefined;
  if (!created) {
    throw new Error('Failed to create activity log');
  }

  return created;
}

export async function listActivityLogsByProject(
  projectId: string,
  pagination?: Pagination,
): Promise<ActivityLogRow[]> {
  const client = getTursoClient();
  const sql = withPagination(
    `
      SELECT *
      FROM activity_logs
      WHERE project_id = ?
      ORDER BY created_at DESC
    `,
    pagination,
  );

  const result = await client.execute({
    sql,
    args: [projectId],
  });

  return (result.rows as unknown as ActivityLogRow[]) || [];
}

export async function listActivityLogsByChat(
  chatId: string,
  pagination?: Pagination,
): Promise<ActivityLogRow[]> {
  const client = getTursoClient();
  const sql = withPagination(
    `
      SELECT *
      FROM activity_logs
      WHERE chat_id = ?
      ORDER BY created_at DESC
    `,
    pagination,
  );

  const result = await client.execute({
    sql,
    args: [chatId],
  });

  return (result.rows as unknown as ActivityLogRow[]) || [];
}
