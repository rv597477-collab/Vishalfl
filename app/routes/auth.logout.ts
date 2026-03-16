import { redirect } from '@remix-run/cloudflare';
import { destroyUserSession } from '~/lib/.server/auth/session.server';

export async function action({ request }: { request: Request }) {
  const cookieHeader = await destroyUserSession(request);
  return redirect('/', {
    headers: { 'Set-Cookie': cookieHeader },
  });
}

// Support GET for simple link-based logout as well
export async function loader({ request }: { request: Request }) {
  const cookieHeader = await destroyUserSession(request);
  return redirect('/', {
    headers: { 'Set-Cookie': cookieHeader },
  });
}
