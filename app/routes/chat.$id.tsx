import { type LoaderFunctionArgs, redirect } from '@remix-run/cloudflare';

export async function loader(args: LoaderFunctionArgs) {
  // Redirect legacy /chat/:id routes to /app/:id
  return redirect(`/app/${args.params.id}`);
}

export default function ChatRedirect() {
  return null;
}
