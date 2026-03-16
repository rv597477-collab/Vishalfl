import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import {
  listProjectsByUserId,
  createProject,
  getProjectById,
  updateProject,
} from '~/lib/.server/persistence/projects-repository';
import { randomUUID } from 'node:crypto';

function toSlug(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) || 'project'
  );
}

// GET /api/projects — list logged-in user's projects
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ projects: [] });
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') ?? 50);
  const offset = Number(url.searchParams.get('offset') ?? 0);

  const projects = await listProjectsByUserId(userId, { limit, offset });

  return json({ projects });
}

// POST /api/projects — create or touch a project (upsert by name for simplicity)
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    action?: string;
    id?: string;
    name?: string;
    description?: string;
  }>();

  if (body.action === 'update' && body.id) {
    await updateProject(body.id, userId, {
      name: body.name,
      description: body.description,
    });

    const project = await getProjectById(body.id, userId);

    return json({ project });
  }

  // Default: create
  const name = body.name ?? 'Untitled Project';
  const projectSlug = `${toSlug(name)}-${randomUUID().slice(0, 8)}`;
  const project = await createProject({ userId, slug: projectSlug, name, description: body.description });

  return json({ project });
}
