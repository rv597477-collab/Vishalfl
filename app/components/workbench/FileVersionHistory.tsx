import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { listFileVersions, restoreFileVersion, type FileVersionRecord } from '~/lib/persistence/files.client';
import { workbenchStore } from '~/lib/stores/workbench';

interface FileVersionHistoryProps {
  selectedFile?: string;
}

function formatDate(input: string) {
  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return input;
  }

  return date.toLocaleString();
}

export function FileVersionHistory({ selectedFile }: FileVersionHistoryProps) {
  const [versions, setVersions] = useState<FileVersionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setVersions([]);
      return;
    }

    setLoading(true);
    listFileVersions(selectedFile)
      .then((items) => {
        setVersions(items);
      })
      .catch(() => {
        setVersions([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [selectedFile]);

  const handleRestore = async (versionNo: number) => {
    if (!selectedFile) {
      return;
    }

    try {
      await restoreFileVersion(selectedFile, versionNo);
      await workbenchStore.hydrateActiveProjectFiles();
      workbenchStore.setSelectedFile(selectedFile);
      toast.success(`Restored ${selectedFile} to version ${versionNo}`);

      const refreshed = await listFileVersions(selectedFile);
      setVersions(refreshed);
    } catch {
      toast.error('Failed to restore version');
    }
  };

  return (
    <div className="h-full overflow-auto modern-scrollbar p-3">
      {!selectedFile ? <p className="text-sm text-bolt-elements-textTertiary">Select a file to see history.</p> : null}
      {selectedFile && loading ? <p className="text-sm text-bolt-elements-textTertiary">Loading versions...</p> : null}
      {selectedFile && !loading && versions.length === 0 ? (
        <p className="text-sm text-bolt-elements-textTertiary">No versions yet for this file.</p>
      ) : null}

      <div className="space-y-2">
        {versions.map((version) => (
          <div
            key={version.id}
            className="rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-bolt-elements-textPrimary">
                  v{version.version_no} • {version.change_type}
                </p>
                <p className="text-[11px] uppercase tracking-[0.08em] text-bolt-elements-textTertiary mt-1">
                  {formatDate(version.created_at)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRestore(version.version_no)}
                className="shrink-0 px-2 py-1 text-xs rounded-md border border-bolt-elements-borderColor hover:bg-bolt-elements-background-depth-3"
              >
                Restore
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
