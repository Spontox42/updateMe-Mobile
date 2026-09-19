import React from 'react';
import {
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Download,
  FileCode2,
  HardDrive,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useDownloadsStore } from '../store/useDownloadsStore';
import { useSettingsStore } from '../store/useSettingsStore';

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export const DownloadsView: React.FC = () => {
  const { downloads, cancelDownload, removeDownload, clearCompleted } = useDownloadsStore();
  const { deleteOnLeave } = useSettingsStore();
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);

  const activeDownloads = downloads.filter((d) => d.status === 'downloading');
  const completedDownloads = downloads.filter((d) => d.status === 'completed');

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleRedownload = (url: string, fileName: string) => {
    if (url && url.startsWith('http')) {
      const a = document.createElement('a');
      a.href = url;
      a.target = '_blank';
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DownloadCloud className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-neutral-100">APK Downloads & Storage</h2>
          </div>
          <p className="text-xs text-neutral-400">
            Manage your downloaded APK installer packages and active transfer sessions.
            {deleteOnLeave && (
              <span className="ml-1 text-emerald-400">('Delete on Leave' is enabled in Settings)</span>
            )}
          </p>
        </div>

        {completedDownloads.length > 0 && (
          <button
            id="clear-downloads-btn"
            onClick={clearCompleted}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 border border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Completed ({completedDownloads.length})
          </button>
        )}
      </div>

      {/* Active Downloads Section */}
      {activeDownloads.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Active Downloads ({activeDownloads.length})
          </h3>
          <div className="space-y-2">
            {activeDownloads.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-neutral-800/80 border border-emerald-500/30 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-100">{item.appName}</h4>
                    <p className="text-xs text-neutral-400">
                      {item.providerName} · v{item.version} · {formatBytes(item.downloadedBytes)} / {formatBytes(item.sizeBytes)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-emerald-400">
                      {item.progress}%
                    </span>
                    <button
                      onClick={() => cancelDownload(item.id)}
                      className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-neutral-700/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed Downloads Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
          <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
          Downloaded APK Packages ({completedDownloads.length})
        </h3>

        {completedDownloads.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-neutral-800">
            <DownloadCloud className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-neutral-300">No APK files downloaded yet</p>
            <p className="text-xs text-neutral-500 mt-1">
              Select any app from Explore to download APKs and check verified hashes.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {completedDownloads.map((item) => (
              <div
                key={item.id}
                id={`download-item-${item.id}`}
                className="p-4 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800/60 border border-neutral-700/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-neutral-700/40 text-emerald-400 shrink-0 mt-0.5">
                    <FileCode2 className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-neutral-100">{item.appName}</h4>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                        v{item.version}
                      </span>
                      <span className="text-xs text-neutral-400">({item.providerName})</span>
                    </div>

                    <p className="text-xs font-mono text-neutral-400 mt-0.5">
                      {item.fileName} · {formatBytes(item.sizeBytes)}
                    </p>

                    {item.sha256 && (
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ShieldCheck className="w-3 h-3" />
                          SHA-256:
                        </span>
                        <span className="font-mono text-neutral-400 max-w-[150px] sm:max-w-[240px] truncate">
                          {item.sha256}
                        </span>
                        <button
                          onClick={() => handleCopyHash(item.sha256)}
                          className="hover:text-neutral-200 transition-colors"
                          title="Copy SHA-256"
                        >
                          {copiedHash === item.sha256 ? (
                            <Check className="w-3 h-3 text-emerald-400" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                        <a
                          href={`https://www.virustotal.com/gui/file/${item.sha256}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-0.5"
                        >
                          VT <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => handleRedownload(item.url, item.fileName)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-700/60 hover:bg-neutral-700 text-neutral-200 border border-neutral-600 flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Save File
                  </button>

                  <button
                    onClick={() => removeDownload(item.id)}
                    className="p-2 rounded-xl text-neutral-400 hover:text-red-400 hover:bg-neutral-800 transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
