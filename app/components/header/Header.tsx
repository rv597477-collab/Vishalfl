import { useStore } from '@nanostores/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import Cookies from 'js-cookie';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { UserBadge } from './UserBadge.client';
import { DEFAULT_PROVIDER, PROVIDER_LIST } from '~/utils/constants';
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
        // Keep graceful fallback when model API is unavailable.
      });
  }, []);

  useEffect(() => {
    loadProjects().catch(() => {
      // Keep graceful fallback when project API is unavailable.
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

    const modelExists = providerModels.some((model) => model.name === selectedModel);

    if (!modelExists) {
      const fallbackModel = providerModels[0].name;
      setSelectedModel(fallbackModel);
      Cookies.set('selectedModel', fallbackModel, { expires: 30 });
    }
  }, [providerModels, selectedModel]);

  const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    Cookies.set('selectedProvider', providerName, { expires: 30 });

    const firstModel = availableModels.find((model) => model.provider === providerName)?.name;

    if (firstModel) {
      setSelectedModel(firstModel);
      Cookies.set('selectedModel', firstModel, { expires: 30 });
      window.dispatchEvent(new CustomEvent('bolt:model-changed', { detail: { model: firstModel } }));
    }

    window.dispatchEvent(new CustomEvent('bolt:provider-changed', { detail: { provider: providerName } }));
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    Cookies.set('selectedModel', modelName, { expires: 30 });
    window.dispatchEvent(new CustomEvent('bolt:model-changed', { detail: { model: modelName } }));
  };

  const handleProjectChange = (projectId: string) => {
    setActiveProjectState(projectId);
    setActiveProjectId(projectId);

    if (window.location.pathname !== '/') {
      window.location.href = '/';
    }
  };

  const handleCreateProject = async () => {
    const name = window.prompt('Project name', 'New Project')?.trim();

    if (!name) {
      return;
    }

    const response = await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      return;
    }

    const payload = (await response.json()) as { project?: ProjectItem };

    if (!payload.project) {
      return;
    }

    await loadProjects(payload.project.id);
    handleProjectChange(payload.project.id);
  };

  const handleRenameProject = async () => {
    if (!activeProjectId) {
      return;
    }

    const current = projects.find((project) => project.id === activeProjectId);
    const nextName = window.prompt('Rename project', current?.name || 'Project')?.trim();

    if (!nextName || nextName === current?.name) {
      return;
    }

    await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: activeProjectId, name: nextName }),
    });

    await loadProjects(activeProjectId);
  };

  const handleArchiveProject = async () => {
    if (!activeProjectId) {
      return;
    }

    await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: activeProjectId, status: 'archived' }),
    });

    await loadProjects(activeProjectId);
  };

  const handleDeleteProject = async () => {
    if (!activeProjectId) {
      return;
    }

    const ok = window.confirm('Delete this project? This hides it from the active project list.');

    if (!ok) {
      return;
    }

    await fetch('/api/projects', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: activeProjectId, status: 'deleted' }),
    });

    await loadProjects();
  };

  return (
    <header
      className={classNames(
        'flex items-center px-4 lg:px-6 border-b h-[var(--header-height)] gap-3 bg-bolt-elements-background-depth-2/90 backdrop-blur',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-2 z-logo text-bolt-elements-textPrimary">
        <a
          href="/"
          className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-bolt-elements-background-depth-3 transition-colors"
        >
          <img src="/logo-light-styled.png" alt="logo" className="w-[82px] inline-block dark:hidden" />
          <img src="/logo-dark-styled.png" alt="logo" className="w-[82px] inline-block hidden dark:block" />
          <span className="hidden lg:inline text-xs uppercase tracking-[0.16em] text-bolt-elements-textTertiary">
            Workspace
          </span>
        </a>
      </div>

      <div className="hidden md:flex items-center gap-2 min-w-0">
        <div className="h-9 px-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-sm text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-colors flex items-center gap-2">
          <span className="i-ph:stack text-base" />
          <select
            value={activeProjectId ?? ''}
            onChange={(event) => handleProjectChange(event.target.value)}
            className="bg-transparent outline-none max-w-[180px] text-sm"
            aria-label="Select project"
          >
            {projects.length ? (
              projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.status === 'archived' ? `${project.name} (Archived)` : project.name}
                </option>
              ))
            ) : (
              <option value="">Project</option>
            )}
          </select>
          <button
            onClick={handleCreateProject}
            className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-bolt-elements-background-depth-3"
            title="Create project"
            type="button"
          >
            <span className="i-ph:plus" />
          </button>
          <button
            onClick={handleRenameProject}
            className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-bolt-elements-background-depth-3"
            title="Rename project"
            type="button"
          >
            <span className="i-ph:pencil-simple" />
          </button>
          <button
            onClick={handleArchiveProject}
            className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-bolt-elements-background-depth-3"
            title="Archive project"
            type="button"
          >
            <span className="i-ph:archive" />
          </button>
          <button
            onClick={handleDeleteProject}
            className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-bolt-elements-background-depth-3"
            title="Delete project"
            type="button"
          >
            <span className="i-ph:trash" />
          </button>
        </div>

        <div className="h-9 px-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 flex items-center gap-2">
          <span className="i-ph:cpu text-bolt-elements-textTertiary" />
          <select
            value={selectedProvider}
            onChange={(event) => handleProviderChange(event.target.value)}
            className="bg-transparent text-xs text-bolt-elements-textPrimary outline-none"
            aria-label="Select provider"
          >
            {PROVIDER_LIST.map((provider) => (
              <option key={provider.name} value={provider.name}>
                {provider.name}
              </option>
            ))}
          </select>
          <div className="w-px h-4 bg-bolt-elements-borderColor" />
          <select
            value={selectedModel}
            onChange={(event) => handleModelChange(event.target.value)}
            className="bg-transparent text-xs text-bolt-elements-textPrimary outline-none max-w-[180px]"
            aria-label="Select model"
          >
            {providerModels.length > 0 ? (
              providerModels.map((model) => (
                <option key={model.name} value={model.name}>
                  {model.label}
                </option>
              ))
            ) : (
              <option value={selectedModel}>{selectedModel || 'Model'}</option>
            )}
          </select>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActivityOpen(true)}
          className="h-8 px-2.5 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 text-xs text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 flex items-center gap-1.5"
          title="View activity"
        >
          <span className="i-ph:activity text-base" />
          Activity
        </button>
        {chat.started && (
          <ClientOnly>
            {() => (
              <div>
                <HeaderActionButtons chatStarted={chat.started} />
              </div>
            )}
          </ClientOnly>
        )}
        <ClientOnly>{() => <UserBadge />}</ClientOnly>
      </div>
      <ClientOnly>{() => <ActivityDrawer open={activityOpen} onClose={() => setActivityOpen(false)} />}</ClientOnly>
    </header>
  );
}
