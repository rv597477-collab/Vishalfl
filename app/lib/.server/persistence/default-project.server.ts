import { randomUUID } from 'node:crypto';
import { listProjectsByUserId, createProject, type ProjectRow } from './projects-repository';

export async function ensureDefaultProject(userId: string): Promise<ProjectRow> {
  const existing = await listProjectsByUserId(userId, { limit: 1, offset: 0 });

  if (existing.length > 0) {
    return existing[0];
  }

  const slug = `default-${randomUUID().slice(0, 8)}`;

  return createProject({
    userId,
    slug,
    name: 'My Project',
    description: 'Default project',
    sourceType: 'webcontainer',
  });
}
