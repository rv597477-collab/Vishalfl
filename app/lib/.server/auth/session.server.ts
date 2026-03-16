import { createCookieSessionStorage, redirect } from '@remix-run/cloudflare';

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__bolt_session',
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.SESSION_SECRET || 'bolt-fallback-secret-change-me'],
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  },
});

export async function getSession(request: Request) {
  return sessionStorage.getSession(request.headers.get('Cookie'));
}

export async function getUserId(request: Request): Promise<string | null> {
  const session = await getSession(request);
  return session.get('userId') ?? null;
}

export async function requireUserId(request: Request): Promise<string> {
  const userId = await getUserId(request);

  if (!userId) {
    throw redirect('/auth/google');
  }

  return userId;
}

export async function setUserSession(userId: string, request: Request): Promise<string> {
  const session = await getSession(request);
  session.set('userId', userId);

  return sessionStorage.commitSession(session);
}

export async function destroyUserSession(request: Request): Promise<string> {
  const session = await getSession(request);
  return sessionStorage.destroySession(session);
}
