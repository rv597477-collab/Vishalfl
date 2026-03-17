import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { basename, extname, dirname } from 'node:path';
import { getUserId } from '~/lib/.server/auth/session.server';
import { ensureDefaultProject } from '~/lib/.server/persistence/default-project.server';
import { getProjectById } from '~/lib/.server/persistence/projects-repository';
import {
  getFileByPath,
  listFilesByProject,
  softDeleteFile,
  upsertFile,
} from '~/lib/.server/persistence/files-repository';
import { createFileVersion, getLatestFileVersion } from '~/lib/.server/persistence/file-versions-repository';
import { createActivityLog } from '~/lib/.server/persistence/activity-logs-repository';

async function resolveProjectId(userId: string, projectId?: string | null) {
  if (projectId) {
    const project = await getProjectById(projectId, userId);

    if (project) {
      return project.id;
    }
  }

  const fallback = await ensureDefaultProject(userId);

  return fallback.id;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ files: [] });
  }

  const url = new URL(request.url);
  const projectId = await resolveProjectId(userId, url.searchParams.get('projectId'));
  const files = await listFilesByProject(projectId);

  return json({ files, projectId });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    action?: 'upsert' | 'delete';
    projectId?: string;
    path?: string;
    nodeType?: 'file' | 'folder';
    contentText?: string;
    isBinary?: boolean;
    source?: 'user' | 'ai';
  }>();

  const projectId = await resolveProjectId(userId, body.projectId);

  if (body.action === 'delete') {
    if (!body.path) {
      return json({ error: 'path required' }, { status: 400 });
    }

    const allFiles = await listFilesByProject(projectId);
    const deleteTargets = allFiles.filter(
      (entry) => entry.path === body.path || entry.path.startsWith(`${body.path}/`),
    );

    for (const target of deleteTargets) {
      await softDeleteFile(projectId, target.path);

      const latest = await getLatestFileVersion(target.id);
      const versionNo = (latest?.version_no ?? 0) + 1;
      await createFileVersion({
        fileId: target.id,
        projectId,
        versionNo,
        changeType: 'delete',
        contentText: target.content_text ?? undefined,
        sizeBytes: target.size_bytes,
        createdByUserId: userId,
      });

      await createActivityLog({
        userId,
        projectId,
        fileId: target.id,
        category: 'file',
        action: 'deleted',
        summary: `Deleted ${target.path}`,
        source: body.source ?? 'user',
      });
    }

    return json({ ok: true });
  }

  if (body.action !== 'upsert' || !body.path || !body.nodeType) {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const previous = await getFileByPath(projectId, body.path);
  const normalizedContent = body.nodeType === 'file' ? (body.contentText ?? '') : undefined;

  const file = await upsertFile({
    projectId,
    path: body.path,
    name: basename(body.path),
    parentFileId: undefined,
    nodeType: body.nodeType,
    extension: body.nodeType === 'file' ? extname(body.path).replace(/^\./, '') || null || undefined : undefined,
    mimeType: undefined,
    isBinary: body.isBinary ?? false,
    contentText: normalizedContent,
    sizeBytes: normalizedContent?.length ?? 0,
  });

  const latest = await getLatestFileVersion(file.id);
  const nextVersion = (latest?.version_no ?? 0) + 1;
  const isCreate = !previous;

  const contentChanged =
    previous?.content_text !== (normalizedContent ?? null) ||
    previous?.is_deleted === 1 ||
    previous?.node_type !== body.nodeType;

  if (isCreate || contentChanged) {
    await createFileVersion({
      fileId: file.id,
      projectId,
      versionNo: nextVersion,
      changeType: isCreate ? 'create' : 'update',
      contentText: normalizedContent,
      sizeBytes: normalizedContent?.length ?? 0,
      createdByUserId: userId,
    });

    await createActivityLog({
      userId,
      projectId,
      fileId: file.id,
      category: 'file',
      action: isCreate ? 'created' : body.source === 'ai' ? 'ai-updated' : 'updated',
      summary: `${isCreate ? 'Created' : 'Updated'} ${dirname(file.path) === '.' ? file.path : file.path}`,
      source: body.source ?? 'user',
    });
  }

  return json({ file });
}
