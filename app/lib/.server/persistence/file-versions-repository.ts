import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';

export interface FileVersionRow {
  id: string;
  file_id: string;
  project_id: string;
  chat_id: string | null;
  message_id: string | null;
  version_no: number;
  change_type: 'create' | 'update' | 'delete' | 'restore' | 'snapshot';
  content_text: string | null;
  content_blob_ref: string | null;
  content_sha256: string | null;
  size_bytes: number;
  diff_json: string | null;
  created_by_user_id: string | null;
  created_at: string;
}

export interface CreateFileVersionInput {
  fileId: string;
  projectId: string;
  versionNo: number;
  changeType: FileVersionRow['change_type'];
  chatId?: string;
  messageId?: string;
  contentText?: string;
  contentBlobRef?: string;
  contentSha256?: string;
  sizeBytes?: number;
  diffJson?: string;
  createdByUserId?: string;
}

export async function listFileVersions(fileId: string): Promise<FileVersionRow[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `
      SELECT *
      FROM file_versions
      WHERE file_id = ?
      ORDER BY version_no DESC
    `,
    args: [fileId],
  });

  return (result.rows as unknown as FileVersionRow[]) || [];
}

export async function createFileVersion(input: CreateFileVersionInput): Promise<FileVersionRow> {
  const client = getTursoClient();
  const id = randomUUID();

  await client.execute({
    sql: `
      INSERT INTO file_versions (
        id, file_id, project_id, chat_id, message_id,
        version_no, change_type, content_text,
        content_blob_ref, content_sha256, size_bytes,
        diff_json, created_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.fileId,
      input.projectId,
      input.chatId ?? null,
      input.messageId ?? null,
      input.versionNo,
      input.changeType,
      input.contentText ?? null,
      input.contentBlobRef ?? null,
      input.contentSha256 ?? null,
      input.sizeBytes ?? 0,
      input.diffJson ?? null,
      input.createdByUserId ?? null,
    ],
  });

  const row = await client.execute({
    sql: `SELECT * FROM file_versions WHERE id = ? LIMIT 1`,
    args: [id],
  });

  const created = row.rows[0] as unknown as FileVersionRow | undefined;

  if (!created) {
    throw new Error('Failed to create file version');
  }

  return created;
}

export async function getLatestFileVersion(fileId: string): Promise<FileVersionRow | null> {
  const client = getTursoClient();
  const row = await client.execute({
    sql: `
      SELECT *
      FROM file_versions
      WHERE file_id = ?
      ORDER BY version_no DESC
      LIMIT 1
    `,
    args: [fileId],
  });

  return (row.rows[0] as unknown as FileVersionRow) || null;
}
