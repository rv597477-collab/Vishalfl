import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';
import { toDbBool } from './types';

export interface FileRow {
  id: string;
  project_id: string;
  parent_file_id: string | null;
  path: string;
  name: string;
  node_type: 'file' | 'folder';
  mime_type: string | null;
  extension: string | null;
  is_binary: number;
  content_text: string | null;
  content_blob_ref: string | null;
  content_sha256: string | null;
  size_bytes: number;
  is_deleted: number;
  deleted_at: string | null;
  last_modified_by_message_id: string | null;
  last_modified_at: string;
  created_at: string;
  updated_at: string;
}

export interface UpsertFileInput {
  projectId: string;
  path: string;
  name: string;
  nodeType: FileRow['node_type'];
  parentFileId?: string;
  mimeType?: string;
  extension?: string;
  isBinary?: boolean;
  contentText?: string;
  contentBlobRef?: string;
  contentSha256?: string;
  sizeBytes?: number;
  lastModifiedByMessageId?: string;
}

export async function listFilesByProject(projectId: string): Promise<FileRow[]> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `
      SELECT *
      FROM files
      WHERE project_id = ? AND is_deleted = 0
      ORDER BY path ASC
    `,
    args: [projectId],
  });

  return (result.rows as unknown as FileRow[]) || [];
}

export async function getFileByPath(projectId: string, filePath: string): Promise<FileRow | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `SELECT * FROM files WHERE project_id = ? AND path = ? LIMIT 1`,
    args: [projectId, filePath],
  });
  return (result.rows[0] as unknown as FileRow) || null;
}

export async function upsertFile(input: UpsertFileInput): Promise<FileRow> {
  const client = getTursoClient();
  const existing = await getFileByPath(input.projectId, input.path);

  if (!existing) {
    const id = randomUUID();
    await client.execute({
      sql: `
        INSERT INTO files (
          id, project_id, parent_file_id, path, name, node_type,
          mime_type, extension, is_binary, content_text,
          content_blob_ref, content_sha256, size_bytes,
          is_deleted, last_modified_by_message_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
      `,
      args: [
        id,
        input.projectId,
        input.parentFileId ?? null,
        input.path,
        input.name,
        input.nodeType,
        input.mimeType ?? null,
        input.extension ?? null,
        toDbBool(input.isBinary ?? false),
        input.contentText ?? null,
        input.contentBlobRef ?? null,
        input.contentSha256 ?? null,
        input.sizeBytes ?? 0,
        input.lastModifiedByMessageId ?? null,
      ],
    });
  } else {
    await client.execute({
      sql: `
        UPDATE files
        SET
          parent_file_id = COALESCE(?, parent_file_id),
          name = COALESCE(?, name),
          node_type = COALESCE(?, node_type),
          mime_type = COALESCE(?, mime_type),
          extension = COALESCE(?, extension),
          is_binary = COALESCE(?, is_binary),
          content_text = COALESCE(?, content_text),
          content_blob_ref = COALESCE(?, content_blob_ref),
          content_sha256 = COALESCE(?, content_sha256),
          size_bytes = COALESCE(?, size_bytes),
          is_deleted = 0,
          deleted_at = NULL,
          last_modified_by_message_id = COALESCE(?, last_modified_by_message_id),
          last_modified_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      args: [
        input.parentFileId ?? null,
        input.name ?? null,
        input.nodeType ?? null,
        input.mimeType ?? null,
        input.extension ?? null,
        input.isBinary === undefined ? null : toDbBool(input.isBinary),
        input.contentText ?? null,
        input.contentBlobRef ?? null,
        input.contentSha256 ?? null,
        input.sizeBytes ?? null,
        input.lastModifiedByMessageId ?? null,
        existing.id,
      ],
    });
  }

  const updated = await getFileByPath(input.projectId, input.path);
  if (!updated) {
    throw new Error('Failed to upsert file');
  }

  return updated;
}

export async function softDeleteFile(projectId: string, filePath: string): Promise<void> {
  const client = getTursoClient();
  await client.execute({
    sql: `
      UPDATE files
      SET is_deleted = 1,
          deleted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE project_id = ? AND path = ?
    `,
    args: [projectId, filePath],
  });
}
