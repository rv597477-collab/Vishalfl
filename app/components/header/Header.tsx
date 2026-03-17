import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { Link } from '@remix-run/react';
import Cookies from 'js-cookie';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { UserBadge } from './UserBadge.client';
import { DEFAULT_PROVIDER } from '~/utils/constants';
import type { ModelInfo } from '~/lib/modules/llm/types';
import { getActiveProjectId, setActiveProjectId } from '~/lib/persistence/projects.client';
import { ActivityDrawer } from '~/components/activity/ActivityDrawer.client';

interface ProjectItem {
  id: string;
  name: string;
  status?: 'active' | 'archived' | 'deleted';
}

export function Header() {
  const chat = useStore(chatStore);
  const [availableModels, setAvailableModels] = useState<ModelInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>(
    () => (typeof document !== 'undefined' ? Cookies.get('selectedProvider') : undefined) || DEFAULT_PROVIDER.name,
  );
  const [selectedModel, setSelectedModel] = useState<string>(
    () => (typeof document !== 'undefined' ? Cookies.get('selectedModel') : undefined) || '',
  );
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeProjectId, setActiveProjectState] = useState<string | null>(() => getActiveProjectId());
  const [activityOpen, setActivityOpen] = useState(false);
  const [showProjectMenu, setShowProjectMenu] = useState(false);

  const loadProjects = useCallback(async (preferredProjectId?: string | null) => {
    const response = await fetch('/api/projects', { credentials: 'include' });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { projects?: ProjectItem[] };
    const nextProjects = payload.projects ?? [];
    setProjects(nextProjects);

    if (!nextProjects.length) {
      setActiveProjectState(null);
      setActiveProjectId(null);

      return;
    }

    const candidate = preferredProjectId ?? getActiveProjectId();
    const exists = nextProjects.some((project) => project.id === candidate);
    const selected = exists ? candidate : nextProjects[0].id;

    setActiveProjectState(selected);
    setActiveProjectId(selected);
  }, []);

  useEffect(() => {
    fetch('/api/models')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const typed = data as { modelList?: ModelInfo[] } | null;

        if (typed?.modelList) {
          setAvailableModels(typed.modelList);
        }
      })
      .catch(() => {
        // Graceful fallback
      });
  }, []);

  useEffect(() => {
    loadProjects().catch(() => {
      // Graceful fallback
    });
  }, [loadProjects]);

  useEffect(() => {
    const syncFromCookies = () => {
      setSelectedProvider(Cookies.get('selectedProvider') || DEFAULT_PROVIDER.name);
      setSelectedModel(Cookies.get('selectedModel') || '');
    };

    window.addEventListener('focus', syncFromCookies);

    return () => window.removeEventListener('focus', syncFromCookies);
  }, []);

  const providerModels = useMemo(
    () => availableModels.filter((model) => model.provider === selectedProvider),
    [availableModels, selectedProvider],
  );

  useEffect(() => {
    if (providerModels.length === 0) {
      return;
    }

    const existing = providerModels.find((m) => m.name === selectedModel);

    if (!existing) {
      const first = providerModels[0].name;
      setSelectedModel(first);
      Cookies.set('selectedModel', first, { expires: 30, sameSite: 'strict' });
    }
  }, [providerModels, selectedModel]);

  const handleProjectChange = (projectId: string) => {
    setActiveProjectState(projectId);
    setActiveProjectId(projectId);
  };

  const handleCreateProject = async () => {
    const name = window.prompt('Project name:');

    if (!name?.trim()) {
      return;
    }

    const response = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', name }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { id?: string };

    await loadProjects(payload.id ?? null);
  };

  const currentProject = projects.find((p) => p.id === activeProjectId);

  return (
    <header
      className={classNames('flex items-center justify-between px-4 lg:px-5 h-14 transition-all duration-300', {
        'bg-transparent': !chat.started,
        'bg-bolt-elements-background-depth-1/80 backdrop-blur-2xl border-b border-white/[0.04]': chat.started,
      })}
    >
      {/* Left section - Logo and project */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.5 group" data-testid="header-logo">
          <span className="text-lg font-bold text-white tracking-tight group-hover:opacity-80 transition-opacity">
            Noefforts
          </span>
          <span
            className="text-lg font-bold bg-gradient-to-r from-blue-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent"
            style={{ backgroundSize: '200% auto', animation: 'gradient-shift 4s ease infinite' }}
          >
            AI
          </span>
        </Link>

        <span className="w-px h-5 bg-white/[0.08]" />

        {/* Project selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectMenu(!showProjectMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/[0.04] transition-all group"
          >
            <span className="i-ph:folder-notch-fill text-white/40 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-white/70 max-w-[150px] truncate">
              {currentProject?.name || 'New Project'}
            </span>
            <span className="i-ph:caret-down text-white/30 text-xs" />
          </button>

          {showProjectMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowProjectMenu(false)} />
              <div className="absolute top-full left-0 mt-1 w-56 py-2 bg-bolt-elements-background-depth-2/95 backdrop-blur-2xl border border-white/[0.08] rounded-xl shadow-2xl z-50">
                <div className="px-3 py-2 border-b border-white/[0.06]">
                  <p className="text-xs text-white/40 uppercase tracking-wider">Projects</p>
                </div>
                <div className="max-h-48 overflow-auto py-1">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        handleProjectChange(project.id);
                        setShowProjectMenu(false);
                      }}
                      className={classNames(
                        'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                        project.id === activeProjectId
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'text-white/70 hover:bg-white/[0.04] hover:text-white',
                      )}
                    >
                      <span className="i-ph:folder-notch text-sm" />
                      <span className="truncate">{project.name}</span>
                      {project.id === activeProjectId && <span className="i-ph:check ml-auto text-sm" />}
                    </button>
                  ))}
                </div>
                <div className="border-t border-white/[0.06] pt-1 mt-1">
                  <button
                    onClick={() => {
                      setShowProjectMenu(false);
                      handleCreateProject();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-white/70 hover:bg-white/[0.04] hover:text-white transition-colors"
                  >
                    <span className="i-ph:plus text-sm" />
                    New Project
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center section - Model indicator (only when chat started) */}
      {chat.started && (
        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06]">
            <span className="i-ph:cpu text-white/40" />
            <span className="text-xs text-white/60">{selectedProvider}</span>
            <span className="text-white/20">/</span>
            <span className="text-xs text-white/40 max-w-[120px] truncate">{selectedModel || 'Select model'}</span>
          </div>
        </div>
      )}

      {/* Right section - Actions */}
      <div className="flex items-center gap-2">
        {/* Activity button */}
        <button
          type="button"
          onClick={() => setActivityOpen(true)}
          className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
          title="Activity"
        >
          <span className="i-ph:activity text-lg" />
        </button>

        {/* Settings link */}
        <Link
          to="/dashboard/settings"
          className="w-9 h-9 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.1] transition-all"
          title="Settings"
        >
          <span className="i-ph:gear text-lg" />
        </Link>

        {/* Header action buttons (export, etc.) */}
        {chat.started && (
          <ClientOnly>
            {() => (
              <div className="flex items-center">
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        )}

        {/* User badge */}
        <ClientOnly>{() => <UserBadge />}</ClientOnly>
      </div>

      {/* Activity drawer */}
      <ClientOnly>{() => <ActivityDrawer open={activityOpen} onClose={() => setActivityOpen(false)} />}</ClientOnly>
    </header>
  );
}
