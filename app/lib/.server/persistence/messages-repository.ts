import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';
import { withPagination, toDbBool, type Pagination } from './types';

export interface MessageRow {
  id: string;
  chat_id: string;
  project_id: string;
  user_id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  sequence_no: number;
  content_text: string;
  parts_json: string | null;
  annotations_json: string | null;
  model_name: string | null;
  provider_name: string | null;
  prompt_id: string | null;
  chat_mode: 'build' | 'discuss' | null;
  hidden: number;
  no_store: number;
  token_usage_json: string | null;
  created_at: string;
}

export interface CreateMessageInput {
  id?: string;
  chatId: string;
  projectId: string;
  userId: string;
  role: MessageRow['role'];
  sequenceNo: number;
  contentText: string;
  partsJson?: string;
  annotationsJson?: string;
  modelName?: string;
  providerName?: string;
  promptId?: string;
  chatMode?: 'build' | 'discuss';
  hidden?: boolean;
  noStore?: boolean;
  tokenUsageJson?: string;
}

export async function listMessagesByChat(
  chatId: string,
  userId: string,
  pagination?: Pagination,
): Promise<MessageRow[]> {
  const client = getTursoClient();
  const sql = withPagination(
    `
      SELECT m.*
      FROM messages m
      INNER JOIN chats c ON c.id = m.chat_id
      WHERE m.chat_id = ? AND c.user_id = ?
      ORDER BY m.sequence_no ASC
    `,
    pagination,
  );
  const result = await client.execute({ sql, args: [chatId, userId] });

  return (result.rows as unknown as MessageRow[]) || [];
}

export async function appendMessage(input: CreateMessageInput): Promise<MessageRow> {
  const client = getTursoClient();
  const id = input.id ?? randomUUID();

  await client.execute({
    sql: `
      INSERT INTO messages (
        id, chat_id, project_id, user_id, role, sequence_no,
        content_text, parts_json, annotations_json,
        model_name, provider_name, prompt_id, chat_mode,
        hidden, no_store, token_usage_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.chatId,
      input.projectId,
      input.userId,
      input.role,
      input.sequenceNo,
      input.contentText,
      input.partsJson ?? null,
      input.annotationsJson ?? null,
      input.modelName ?? null,
      input.providerName ?? null,
      input.promptId ?? null,
      input.chatMode ?? null,
      toDbBool(input.hidden ?? false),
      toDbBool(input.noStore ?? false),
      input.tokenUsageJson ?? null,
    ],
  });

  const result = await client.execute({
    sql: `SELECT * FROM messages WHERE id = ? LIMIT 1`,
    args: [id],
  });

  const row = result.rows[0] as unknown as MessageRow | undefined;

  if (!row) {
    throw new Error('Failed to append message');
  }

  return row;
}

export async function appendMessages(items: CreateMessageInput[]): Promise<MessageRow[]> {
  const inserted: MessageRow[] = [];

  for (const item of items) {
    inserted.push(await appendMessage(item));
  }

  return inserted;
}

export async function deleteMessagesByChat(chatId: string, userId: string): Promise<void> {
  const client = getTursoClient();
  await client.execute({
    sql: `
      DELETE FROM messages
      WHERE chat_id = ? AND user_id = ?
    `,
    args: [chatId, userId],
  });
}
