import { Link, useLocation } from '@remix-run/react';
import { useStore } from '@nanostores/react';
import { authUserStore } from '~/lib/stores/auth';
import { ThemeSwitch } from '~/components/ui/ThemeSwitch';

const navLinks = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/docs', label: 'Docs' },
  { href: '/contact', label: 'Contact' },
];

function Logo() {
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-xl font-bold text-white tracking-tight">Noefforts</span>
      <span
        className="text-xl font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
        style={{ animation: 'gradient-shift 4s ease infinite', backgroundSize: '200% auto' }}
      >
        AI
      </span>
    </div>
  );
}

export function PublicHeader() {
  const user = useStore(authUserStore);
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-bolt-elements-background-depth-1/60 backdrop-blur-2xl border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
            <Logo />
          </Link>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'text-white bg-white/[0.08]'
                    : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <ThemeSwitch />
            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/app"
                  data-testid="nav-open-app"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  Open App
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/auth/google"
                  className="px-4 py-2 text-sm font-medium text-white/60 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/google"
                  data-testid="nav-get-started"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-blue-500/25"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative border-t border-white/[0.04] bg-bolt-elements-background-depth-1/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-white/40 max-w-xs leading-relaxed">
              Build production-ready apps with AI. No coding required.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.12] transition-all"
              >
                <span className="i-ph:github-logo text-lg" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.12] transition-all"
              >
                <span className="i-ph:twitter-logo text-lg" />
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/40 hover:text-white hover:border-white/[0.12] transition-all"
              >
                <span className="i-ph:discord-logo text-lg" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/pricing" className="text-sm text-white/40 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/docs" className="text-sm text-white/40 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/app" className="text-sm text-white/40 hover:text-white transition-colors">
                  Launch App
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/contact" className="text-sm text-white/40 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/40 hover:text-white transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-white/40 hover:text-white transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-white/40 hover:text-white transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/30">© {new Date().getFullYear()} NoeffortsAI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-bolt-elements-background-depth-1">
      <PublicHeader />
      <main className="flex-1 pt-16">{children}</main>
      <PublicFooter />
    </div>
  );
}
