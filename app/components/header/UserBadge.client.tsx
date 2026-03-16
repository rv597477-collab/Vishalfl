import { useEffect, useRef, useState } from 'react';
import { useRouteLoaderData } from '@remix-run/react';
import type { loader as rootLoader } from '~/root';

export function UserBadge() {
  const rootData = useRouteLoaderData<typeof rootLoader>('root');
  const user = rootData?.user ?? null;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (!user) {
    return (
      <a
        href="/auth/google"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-bolt-elements-button-primary-background text-bolt-elements-button-primary-text hover:bg-bolt-elements-button-primary-backgroundHover transition-colors"
      >
        <div className="i-ph:google-logo text-base" />
        Sign in with Google
      </a>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-bolt-elements-background-depth-2 transition-colors"
      >
        {user.avatar_url ? (
          <img src={user.avatar_url} alt={user.display_name ?? user.email} className="w-6 h-6 rounded-full" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-bolt-elements-button-primary-background flex items-center justify-center text-bolt-elements-button-primary-text text-xs font-bold">
            {(user.display_name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-sm text-bolt-elements-textPrimary max-w-[120px] truncate hidden sm:block">
          {user.display_name ?? user.email}
        </span>
        <div className="i-ph:caret-down text-xs text-bolt-elements-textSecondary" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 shadow-lg z-50">
          <div className="px-3 py-2 border-b border-bolt-elements-borderColor">
            <p className="text-sm font-medium text-bolt-elements-textPrimary truncate">{user.display_name}</p>
            <p className="text-xs text-bolt-elements-textSecondary truncate">{user.email}</p>
          </div>
          <a
            href="/auth/logout"
            className="w-full text-left px-3 py-2 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 flex items-center gap-2 transition-colors"
          >
            <div className="i-ph:sign-out text-bolt-elements-textSecondary" />
            Sign out
          </a>
        </div>
      )}
    </div>
  );
}
