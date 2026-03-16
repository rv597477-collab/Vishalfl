#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { createClient } from '@libsql/client';

const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl || !authToken) {
  console.error('Missing required env vars: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN');
  process.exit(1);
}

const client = createClient({
  url: databaseUrl,
  authToken,
});

const migrationsDir = path.resolve(process.cwd(), 'app/lib/.server/db/migrations');

function splitSqlStatements(sql) {
  const cleaned = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  return cleaned
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
}

async function run() {
  const files = (await fs.readdir(migrationsDir))
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  for (const fileName of files) {
    const filePath = path.join(migrationsDir, fileName);
    const sql = await fs.readFile(filePath, 'utf8');
    const statements = splitSqlStatements(sql);

    console.log(`Applying migration: ${fileName} (${statements.length} statements)`);

    for (const statement of statements) {
      await client.execute({ sql: statement });
    }
  }

  console.log('Turso migrations completed successfully.');
}

run().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
