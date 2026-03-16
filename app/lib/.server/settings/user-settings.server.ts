import { getTursoClient } from '~/lib/.server/db/turso';

const API_KEYS_PROVIDER = '__api_keys__';
const PROVIDER_SETTINGS_PROVIDER = '__provider_settings__';

async function getUserSetting(userId: string, provider: string): Promise<string | null> {
  const db = getTursoClient();
  const result = await db.execute({
    sql: `SELECT settings_json FROM provider_settings WHERE user_id = ? AND provider_name = ? AND scope = 'user' AND project_id IS NULL LIMIT 1`,
    args: [userId, provider],
  });

  return (result.rows[0]?.settings_json as string) ?? null;
}

export async function getUserApiKeys(userId: string): Promise<Record<string, string>> {
  const json = await getUserSetting(userId, API_KEYS_PROVIDER);
  return json ? (JSON.parse(json) as Record<string, string>) : {};
}

export async function getUserProviderSettings(userId: string): Promise<Record<string, unknown>> {
  const json = await getUserSetting(userId, PROVIDER_SETTINGS_PROVIDER);
  return json ? (JSON.parse(json) as Record<string, unknown>) : {};
}
