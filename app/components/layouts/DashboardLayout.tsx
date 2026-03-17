import { Link, useLocation } from '@remix-run/react';
import { useStore } from '@nanostores/react';
import { authUserStore } from '~/lib/stores/auth';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';
import { useState } from 'react';

const sidebarLinks = [
  { href: '/dashboard', label: 'Overview', icon: 'i-ph:house-fill' },
  { href: '/dashboard/projects', label: 'Projects', icon: 'i-ph:folder-notch-fill' },
  { href: '/dashboard/providers', label: 'AI Providers', icon: 'i-ph:cpu-fill' },
  { href: '/dashboard/activity', label: 'Activity', icon: 'i-ph:activity-fill' },
  { href: '/dashboard/settings', label: 'Settings', icon: 'i-ph:gear-fill' },
  { href: '/dashboard/billing', label: 'Billing', icon: 'i-ph:credit-card-fill' },
];

function Logo() {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-lg font-bold text-white tracking-tight">Noefforts</span>
      <span
        className="text-lg font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
        style={{ animation: 'gradient-shift 4s ease infinite', backgroundSize: '200% auto' }}
      >
        AI
      </span>
    </div>
  );
}

function DashboardSidebar() {
  const location = useLocation();
  const user = useStore(authUserStore);

  return (
    <aside className="w-64 flex-shrink-0 border-r border-white/[0.04] bg-bolt-elements-background-depth-2/30 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/[0.04]">
        <Link to="/" className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarLinks.map((link) => {
          const isActive =
            location.pathname === link.href || (link.href !== '/dashboard' && location.pathname.startsWith(link.href));

          return (
            <Link
              key={link.href}
              to={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-500/15 to-violet-500/15 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-500/5'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <span className={`${link.icon} text-lg`} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/[0.04]">
        <Link
          to="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/[0.08] flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="i-ph:user-fill text-white/50" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.display_name || user?.email || 'User'}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function DashboardHeader() {
  const user = useStore(authUserStore);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/[0.04] bg-bolt-elements-background-depth-1/60 backdrop-blur-2xl">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">Dashboard</h1>
      </div>

      <div className="flex items-center gap-3">
        <Link
          to="/app"
          data-testid="header-open-builder"
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
        >
          <span className="i-ph:lightning-fill" />
          Open Builder
        </Link>
        <ThemeSwitch />
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 border border-white/[0.08] flex items-center justify-center hover:border-white/[0.15] transition-all"
          >
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
            ) : (
              <span className="i-ph:user-fill text-white/50" />
            )}
          </button>
          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 mt-2 w-52 py-2 bg-bolt-elements-background-depth-2/95 backdrop-blur-2xl border border-white/[0.08] rounded-2xl shadow-2xl z-50">
                <Link
                  to="/dashboard/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.03] transition-all"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="i-ph:user" />
                  Profile
                </Link>
                <Link
                  to="/dashboard/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/[0.03] transition-all"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="i-ph:gear" />
                  Settings
                </Link>
                <hr className="my-2 border-white/[0.04]" />
                <Link
                  to="/auth/logout"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-white/[0.03] transition-all"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="i-ph:sign-out" />
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

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="h-screen flex bg-bolt-elements-background-depth-1">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
