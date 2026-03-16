import { json, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { getUserId } from '~/lib/.server/auth/session.server';
import { getUserById } from '~/lib/.server/auth/user.server';

// GET /api/me — returns current authenticated user or null
export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const userId = await getUserId(request);

    if (!userId) {
      return json({ user: null });
    }

    const user = await getUserById(userId);

    if (!user) {
      return json({ user: null });
    }

    return json({
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        avatar_url: user.avatar_url,
      },
    });
  } catch {
    return json({ user: null });
  }
}
