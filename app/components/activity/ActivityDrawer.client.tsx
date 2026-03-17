import { useEffect, useMemo, useState } from 'react';
import { getActiveProjectId } from '~/lib/persistence/projects.client';
import { classNames } from '~/utils/classNames';

interface ActivityItem {
  id: string;
  action: string;
  category: string;
  summary: string;
  created_at: string;
}

interface ActivityDrawerProps {
  open: boolean;
  onClose: () => void;
}

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function iconFor(action: string, category: string) {
  if (category === 'project') {
    return 'i-ph:stack';
  }

  if (category === 'chat') {
    return action === 'deleted' ? 'i-ph:chat-circle-dots' : 'i-ph:chat-circle-text';
  }

  if (action === 'restored') {
    return 'i-ph:clock-counter-clockwise';
  }

  if (action === 'deleted') {
    return 'i-ph:trash';
  }

  if (action === 'ai-updated') {
    return 'i-ph:sparkle';
  }

  return 'i-ph:file-text';
}

export function ActivityDrawer({ open, onClose }: ActivityDrawerProps) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(false);
  const activeProjectId = useMemo(() => getActiveProjectId(), [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    setLoading(true);

    const query = new URLSearchParams();

    if (activeProjectId) {
      query.set('projectId', activeProjectId);
    }

    fetch(`/api/activity-logs?${query.toString()}`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        const typed = payload as { activity?: ActivityItem[] } | null;
        setItems(typed?.activity ?? []);
      })
      .catch(() => {
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [open, activeProjectId]);

  if (!open) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[97]"
        onClick={onClose}
        aria-label="Close activity drawer"
      />
      <aside className="fixed right-0 top-[var(--header-height)] bottom-0 w-[360px] z-[98] border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-1/95 backdrop-blur-lg shadow-xl">
        <div className="h-12 px-4 border-b border-bolt-elements-borderColor flex items-center justify-between">
          <h3 className="text-sm font-semibold text-bolt-elements-textPrimary">Activity</h3>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-bolt-elements-background-depth-3 flex items-center justify-center"
          >
            <span className="i-ph:x" />
          </button>
        </div>

        <div className="p-3 h-[calc(100%-3rem)] overflow-auto modern-scrollbar">
          {loading ? <p className="text-sm text-bolt-elements-textTertiary">Loading activity...</p> : null}
          {!loading && items.length === 0 ? (
            <p className="text-sm text-bolt-elements-textTertiary">No activity yet for this project.</p>
          ) : null}

          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                className={classNames(
                  'rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-2.5',
                )}
              >
                <div className="flex items-start gap-2">
                  <span
                    className={classNames(
                      'mt-0.5 text-bolt-elements-textTertiary',
                      iconFor(item.action, item.category),
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-sm text-bolt-elements-textPrimary">{item.summary}</p>
                    <p className="text-[11px] uppercase tracking-[0.08em] text-bolt-elements-textTertiary mt-1">
                      {item.category} • {formatTime(item.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
