import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import { ensureDefaultProject } from '~/lib/.server/persistence/default-project.server';
import { getProjectById } from '~/lib/.server/persistence/projects-repository';
import { getFileByPath, upsertFile } from '~/lib/.server/persistence/files-repository';
import {
  createFileVersion,
  getLatestFileVersion,
  listFileVersions,
} from '~/lib/.server/persistence/file-versions-repository';
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
    return json({ versions: [] });
  }

  const url = new URL(request.url);
  const path = url.searchParams.get('path');
  const projectId = await resolveProjectId(userId, url.searchParams.get('projectId'));

  if (!path) {
    return json({ versions: [] });
  }

  const file = await getFileByPath(projectId, path);

  if (!file) {
    return json({ versions: [] });
  }

  const versions = await listFileVersions(file.id);

  return json({ versions, file });
}

export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    action?: 'restore';
    projectId?: string;
    path?: string;
    versionNo?: number;
  }>();

  if (body.action !== 'restore' || !body.path || !body.versionNo) {
    return json({ error: 'Invalid payload' }, { status: 400 });
  }

  const projectId = await resolveProjectId(userId, body.projectId);
  const file = await getFileByPath(projectId, body.path);

  if (!file) {
    return json({ error: 'File not found' }, { status: 404 });
  }

  const versions = await listFileVersions(file.id);
  const target = versions.find((version) => version.version_no === body.versionNo);

  if (!target) {
    return json({ error: 'Version not found' }, { status: 404 });
  }

  const restoredContent = target.content_text ?? '';

  const updated = await upsertFile({
    projectId,
    path: file.path,
    name: file.name,
    nodeType: file.node_type,
    extension: file.extension ?? undefined,
    mimeType: file.mime_type ?? undefined,
    isBinary: file.is_binary === 1,
    contentText: restoredContent,
    sizeBytes: restoredContent.length,
  });

  const latest = await getLatestFileVersion(file.id);
  const nextVersionNo = (latest?.version_no ?? 0) + 1;

  await createFileVersion({
    fileId: file.id,
    projectId,
    versionNo: nextVersionNo,
    changeType: 'restore',
    contentText: restoredContent,
    sizeBytes: restoredContent.length,
    createdByUserId: userId,
  });

  await createActivityLog({
    userId,
    projectId,
    fileId: file.id,
    category: 'file',
    action: 'restored',
    summary: `Restored ${file.path} to version ${body.versionNo}`,
    source: 'user',
  });

  return json({ file: { path: updated.path, contentText: updated.content_text ?? '' } });
}
