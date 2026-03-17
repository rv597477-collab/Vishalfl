import { getActiveProjectId } from './projects.client';

interface PersistFileInput {
  path: string;
  nodeType: 'file' | 'folder';
  contentText?: string;
  isBinary?: boolean;
  source?: 'user' | 'ai';
}

export async function persistFileChange(input: PersistFileInput): Promise<void> {
  const projectId = getActiveProjectId();

  if (!projectId) {
    return;
  }

  await fetch('/api/files', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upsert',
      projectId,
      path: input.path,
      nodeType: input.nodeType,
      contentText: input.contentText,
      isBinary: input.isBinary ?? false,
      source: input.source ?? 'user',
    }),
  });
}

export async function persistFileDelete(path: string): Promise<void> {
  const projectId = getActiveProjectId();

  if (!projectId) {
    return;
  }

  await fetch('/api/files', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', projectId, path }),
  });
}

export interface PersistedFileNode {
  id: string;
  path: string;
  node_type: 'file' | 'folder';
  content_text: string | null;
  is_binary: number;
}

export async function loadPersistedFiles(projectId: string): Promise<PersistedFileNode[]> {
  const response = await fetch(`/api/files?projectId=${encodeURIComponent(projectId)}`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to load persisted files');
  }

  const payload = (await response.json()) as { files?: PersistedFileNode[] };

  return payload.files ?? [];
}

export interface FileVersionRecord {
  id: string;
  version_no: number;
  change_type: 'create' | 'update' | 'delete' | 'restore' | 'snapshot';
  created_at: string;
}

export async function listFileVersions(path: string): Promise<FileVersionRecord[]> {
  const projectId = getActiveProjectId();

  if (!projectId) {
    return [];
  }

  const response = await fetch(
    `/api/file-versions?projectId=${encodeURIComponent(projectId)}&path=${encodeURIComponent(path)}`,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to list file versions');
  }

  const payload = (await response.json()) as { versions?: FileVersionRecord[] };

  return payload.versions ?? [];
}

export async function restoreFileVersion(path: string, versionNo: number) {
  const projectId = getActiveProjectId();

  if (!projectId) {
    throw new Error('No active project selected');
  }

  const response = await fetch('/api/file-versions', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'restore', projectId, path, versionNo }),
  });

  if (!response.ok) {
    throw new Error('Failed to restore file version');
  }

  return (await response.json()) as { file?: { path: string; contentText: string } };
}
