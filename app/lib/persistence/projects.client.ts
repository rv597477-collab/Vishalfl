export const ACTIVE_PROJECT_STORAGE_KEY = 'bolt:active-project-id';

export function getActiveProjectId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
}

export function setActiveProjectId(projectId: string | null) {
  if (typeof window === 'undefined') {
    return;
  }

  if (!projectId) {
    window.localStorage.removeItem(ACTIVE_PROJECT_STORAGE_KEY);
  } else {
    window.localStorage.setItem(ACTIVE_PROJECT_STORAGE_KEY, projectId);
  }

  window.dispatchEvent(new CustomEvent('bolt:project-changed', { detail: { projectId } }));
}
