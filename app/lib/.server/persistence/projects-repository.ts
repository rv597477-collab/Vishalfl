import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';
import { withPagination, type Pagination } from './types';

export interface ProjectRow {
  id: string;
  user_id: string;
  slug: string;
  name: string;
  description: string | null;
  status: 'active' | 'archived' | 'deleted';
  source_type: 'webcontainer' | 'github-import' | 'gitlab-import' | 'template' | 'upload';
  starter_template: string | null;
  root_path: string;
  latest_snapshot_message_id: string | null;
  latest_summary: string | null;
  metadata_json: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
}

export interface CreateProjectInput {
  userId: string;
  slug: string;
  name: string;
  description?: string;
  sourceType?: ProjectRow['source_type'];
  starterTemplate?: string;
  rootPath?: string;
  metadataJson?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  status?: ProjectRow['status'];
  latestSnapshotMessageId?: string;
  latestSummary?: string;
  metadataJson?: string;
}

export async function listProjectsByUserId(userId: string, pagination?: Pagination): Promise<ProjectRow[]> {
  const client = getTursoClient();
  const sql = withPagination(
    `
      SELECT *
      FROM projects
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `,
    pagination,
  );
  const result = await client.execute({ sql, args: [userId] });

  return (result.rows as unknown as ProjectRow[]) || [];
}

export async function getProjectById(projectId: string, userId: string): Promise<ProjectRow | null> {
  const client = getTursoClient();
  const result = await client.execute({
    sql: `SELECT * FROM projects WHERE id = ? AND user_id = ? LIMIT 1`,
    args: [projectId, userId],
  });

  return (result.rows[0] as unknown as ProjectRow) || null;
}

export async function createProject(input: CreateProjectInput): Promise<ProjectRow> {
  const client = getTursoClient();
  const id = randomUUID();
  const now = new Date().toISOString();
  await client.execute({
    sql: `
      INSERT INTO projects (
        id, user_id, slug, name, description, status,
        source_type, starter_template, root_path,
        metadata_json, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      input.userId,
      input.slug,
      input.name,
      input.description ?? null,
      input.sourceType ?? 'webcontainer',
      input.starterTemplate ?? null,
      input.rootPath ?? '/home/project',
      input.metadataJson ?? '{}',
      now,
      now,
    ],
  });

  const created = await getProjectById(id, input.userId);

  if (!created) {
    throw new Error('Failed to create project');
  }

  return created;
}

export async function updateProject(projectId: string, userId: string, input: UpdateProjectInput): Promise<void> {
  const client = getTursoClient();
  await client.execute({
    sql: `
      UPDATE projects
      SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        status = COALESCE(?, status),
        latest_snapshot_message_id = COALESCE(?, latest_snapshot_message_id),
        latest_summary = COALESCE(?, latest_summary),
        metadata_json = COALESCE(?, metadata_json),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `,
    args: [
      input.name ?? null,
      input.description ?? null,
      input.status ?? null,
      input.latestSnapshotMessageId ?? null,
      input.latestSummary ?? null,
      input.metadataJson ?? null,
      projectId,
      userId,
    ],
  });
}

export async function softDeleteProject(projectId: string, userId: string): Promise<void> {
  await updateProject(projectId, userId, { status: 'deleted' });
}
