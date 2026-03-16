import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import { getTursoClient } from '~/lib/.server/db/turso';
import { randomUUID } from 'node:crypto';

/*
 * Simple per-user key-value store backed by Turso provider_settings table
 * The api_keys are stored as a JSON blob under provider 'api_keys' at user scope
 */

const API_KEYS_PROVIDER = '__api_keys__';
const PROVIDER_SETTINGS_PROVIDER = '__provider_settings__';

async function upsertUserSetting(userId: string, provider: string, settingsJson: string) {
  const db = getTursoClient();

  const existing = await db.execute({
    sql: `SELECT id FROM provider_settings WHERE user_id = ? AND provider_name = ? AND scope = 'user' AND project_id IS NULL LIMIT 1`,
    args: [userId, provider],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: `UPDATE provider_settings SET settings_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [settingsJson, existing.rows[0].id as string],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO provider_settings (id, user_id, provider_name, settings_json, scope) VALUES (?, ?, ?, ?, 'user')`,
      args: [randomUUID(), userId, provider, settingsJson],
    });
  }
}

async function getUserSetting(userId: string, provider: string): Promise<string | null> {
  const db = getTursoClient();
  const result = await db.execute({
    sql: `SELECT settings_json FROM provider_settings WHERE user_id = ? AND provider_name = ? AND scope = 'user' AND project_id IS NULL LIMIT 1`,
    args: [userId, provider],
  });

  return (result.rows[0]?.settings_json as string) ?? null;
}

// GET /api/user-settings — returns api keys and provider settings for current user
export async function loader({ request }: LoaderFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ apiKeys: {}, providerSettings: {} });
  }

  try {
    const [apiKeysJson, providerJson] = await Promise.all([
      getUserSetting(userId, API_KEYS_PROVIDER),
      getUserSetting(userId, PROVIDER_SETTINGS_PROVIDER),
    ]);

    return json({
      apiKeys: apiKeysJson ? JSON.parse(apiKeysJson) : {},
      providerSettings: providerJson ? JSON.parse(providerJson) : {},
    });
  } catch {
    return json({ apiKeys: {}, providerSettings: {} });
  }
}

// POST /api/user-settings — save api keys / provider settings
export async function action({ request }: ActionFunctionArgs) {
  const userId = await getUserId(request);

  if (!userId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json<{
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, unknown>;
  }>();

  try {
    const tasks: Promise<void>[] = [];

    if (body.apiKeys !== undefined) {
      tasks.push(upsertUserSetting(userId, API_KEYS_PROVIDER, JSON.stringify(body.apiKeys)));
    }

    if (body.providerSettings !== undefined) {
      tasks.push(upsertUserSetting(userId, PROVIDER_SETTINGS_PROVIDER, JSON.stringify(body.providerSettings)));
    }

    await Promise.all(tasks);

    return json({ ok: true });
  } catch (err) {
    console.error('user-settings save error', err);

    return json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
