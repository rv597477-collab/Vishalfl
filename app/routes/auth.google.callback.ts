import { redirect } from '@remix-run/cloudflare';
import { exchangeCodeForTokens, getGoogleUserInfo } from '~/lib/.server/auth/google.server';
import { findOrCreateUser } from '~/lib/.server/auth/user.server';
import { getSession, sessionStorage } from '~/lib/.server/auth/session.server';

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    return redirect('/?auth_error=' + encodeURIComponent(error));
  }

  if (!code || !state) {
    return redirect('/?auth_error=missing_params');
  }

  const session = await getSession(request);
  const storedState = session.get('oauth_state');

  // Validate CSRF state
  if (!storedState || storedState !== state) {
    return redirect('/?auth_error=state_mismatch');
  }

  // Clean up state from session
  session.unset('oauth_state');

  try {
    const tokens = await exchangeCodeForTokens(code);
    const googleUser = await getGoogleUserInfo(tokens.access_token);
    const user = await findOrCreateUser(googleUser);

    session.set('userId', user.id);

    return redirect('/', {
      headers: {
        'Set-Cookie': await sessionStorage.commitSession(session),
      },
    });
  } catch (err) {
    console.error('OAuth callback error:', err);
    return redirect('/?auth_error=oauth_failed');
  }
}
