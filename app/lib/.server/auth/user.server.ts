import { randomUUID } from 'node:crypto';
import { getTursoClient } from '~/lib/.server/db/turso';
import type { GoogleUserInfo } from './google.server';

export interface AppUser {
  id: string;
  google_sub: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export async function findOrCreateUser(googleUser: GoogleUserInfo): Promise<AppUser> {
  const db = getTursoClient();

  // Check if user already exists
  const existing = await db.execute({
    sql: 'SELECT * FROM users WHERE google_sub = ? LIMIT 1',
    args: [googleUser.id],
  });

  if (existing.rows.length > 0) {
    // Update login timestamp and profile fields
    await db.execute({
      sql: `
        UPDATE users
        SET display_name = ?,
            avatar_url = ?,
            last_login_at = CURRENT_TIMESTAMP,
            updated_at = CURRENT_TIMESTAMP
        WHERE google_sub = ?
      `,
      args: [googleUser.name, googleUser.picture, googleUser.id],
    });

    const updated = await db.execute({
      sql: 'SELECT * FROM users WHERE google_sub = ? LIMIT 1',
      args: [googleUser.id],
    });

    return updated.rows[0] as unknown as AppUser;
  }

  // Create new user
  const id = randomUUID();
  await db.execute({
    sql: `
      INSERT INTO users (id, google_sub, email, display_name, avatar_url, last_login_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `,
    args: [id, googleUser.id, googleUser.email, googleUser.name, googleUser.picture],
  });

  const created = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [id],
  });

  if (!created.rows[0]) {
    throw new Error('Failed to create user');
  }

  return created.rows[0] as unknown as AppUser;
}

export async function getUserById(userId: string): Promise<AppUser | null> {
  const db = getTursoClient();
  const result = await db.execute({
    sql: 'SELECT * FROM users WHERE id = ? LIMIT 1',
    args: [userId],
  });

  return (result.rows[0] as unknown as AppUser) ?? null;
}
