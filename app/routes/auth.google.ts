import { redirect } from '@remix-run/cloudflare';
import { randomBytes } from 'node:crypto';
import { buildGoogleAuthUrl } from '~/lib/.server/auth/google.server';
import { getSession, sessionStorage } from '~/lib/.server/auth/session.server';

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request);

  // Generate CSRF state token
  const state = randomBytes(16).toString('hex');
  session.set('oauth_state', state);

  const authUrl = buildGoogleAuthUrl(state);

  return redirect(authUrl, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}
