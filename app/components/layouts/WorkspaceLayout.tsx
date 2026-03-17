import { Link, useParams } from '@remix-run/react';
import { useStore } from '@nanostores/react';
import { authUserStore } from '~/lib/stores/auth';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { useState } from 'react';

function WorkspaceHeader() {
  const user = useStore(authUserStore);
  const params = useParams();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-white/[0.06] bg-bolt-elements-background-depth-1/80 backdrop-blur-xl">
      {/* Left: Logo + Project */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img src="/logo-dark-styled.png" alt="Bolt" className="h-5 hidden dark:block" />
          <img src="/logo-light-styled.png" alt="Bolt" className="h-5 dark:hidden" />
        </Link>
        <span className="w-px h-6 bg-white/[0.08]" />
        <div className="flex items-center gap-2">
          <span className="i-ph:folder-notch text-bolt-elements-textTertiary" />
          <span className="text-sm font-medium text-bolt-elements-textPrimary">
            {params.id ? `Project ${params.id.slice(0, 8)}...` : 'New Project'}
          </span>
        </div>
      </div>

      {/* Center: Builder Mode Tabs */}
      <div className="hidden md:flex items-center gap-1 px-1 py-1 bg-white/[0.03] rounded-lg border border-white/[0.06]">
        <button className="px-3 py-1.5 text-xs font-medium text-bolt-elements-textPrimary bg-white/[0.08] rounded-md">
          Build
        </button>
        <button className="px-3 py-1.5 text-xs font-medium text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary rounded-md transition-colors">
          Preview
        </button>
        <button className="px-3 py-1.5 text-xs font-medium text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary rounded-md transition-colors">
          Deploy
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Link
          to="/dashboard"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary transition-colors"
        >
          <span className="i-ph:squares-four" />
          Dashboard
        </Link>
        <ThemeSwitch />
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center hover:border-white/20 transition-colors"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="i-ph:user text-sm text-bolt-elements-textSecondary" />
            )}
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-48 py-1 bg-bolt-elements-background-depth-2 border border-white/[0.08] rounded-xl shadow-xl z-50">
                <div className="px-4 py-2 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-bolt-elements-textPrimary truncate">
                    {user?.display_name || 'User'}
                  </p>
                  <p className="text-xs text-bolt-elements-textTertiary truncate">{user?.email}</p>
                </div>
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-white/[0.03]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="i-ph:squares-four mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary hover:bg-white/[0.03]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="i-ph:gear mr-2" />
                  Settings
                </Link>
                <hr className="my-1 border-white/[0.06]" />
                <Link
                  to="/auth/logout"
                  className="block px-4 py-2 text-sm text-red-400 hover:bg-white/[0.03]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="i-ph:sign-out mr-2" />
                  Sign Out
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

interface WorkspaceLayoutProps {
  children: React.ReactNode;

  /** If true, shows the minimal header. If false, workspace fills entire viewport. */
  showHeader?: boolean;
}

export function WorkspaceLayout({ children, showHeader = false }: WorkspaceLayoutProps) {
  if (!showHeader) {
    // Full viewport mode - the builder handles its own chrome
    return <div className="h-screen w-screen bg-bolt-elements-background-depth-1">{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-bolt-elements-background-depth-1">
      <WorkspaceHeader />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}
