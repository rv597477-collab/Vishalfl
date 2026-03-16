import { createClient, type Client } from '@libsql/client';

export interface TursoEnv {
  TURSO_DATABASE_URL?: string;
  TURSO_AUTH_TOKEN?: string;
}

let clientSingleton: Client | undefined;

function getRequired(name: keyof TursoEnv, env: TursoEnv): string {
  const value = env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function createTursoClient(env: TursoEnv = process.env): Client {
  const url = getRequired('TURSO_DATABASE_URL', env);
  const authToken = getRequired('TURSO_AUTH_TOKEN', env);

  return createClient({
    url,
    authToken,
  });
}

export function getTursoClient(env: TursoEnv = process.env): Client {
  if (!clientSingleton) {
    clientSingleton = createTursoClient(env);
  }

  return clientSingleton;
}
