import React from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Download,
  ExternalLink,
  Copy,
  Check,
  Package,
  Layers,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useInstalledStore } from '../store/useInstalledStore';
import { useDownloadsStore } from '../store/useDownloadsStore';
import { IndexAppProviderProps } from '../types';

export const AppDetailModal: React.FC = () => {
  const { selectedAppTitle, setSelectedAppTitle, index, categories } = useAppStore();
  const { installedApps, installApp, updateAppToVersion, uninstallApp } = useInstalledStore();
  const { startDownload, downloads } = useDownloadsStore();

  const [selectedProviderKey, setSelectedProviderKey] = React.useState<string>('');
  const [copiedHash, setCopiedHash] = React.useState<string | null>(null);
  const [downloadNotice, setDownloadNotice] = React.useState<string | null>(null);

  const appData = selectedAppTitle ? index[selectedAppTitle] : null;

  // Determine which category this app belongs to
  const appCategory = React.useMemo(() => {
    if (!selectedAppTitle) return null;
    for (const [catName, catData] of Object.entries(categories)) {
      if (catData.apps.includes(selectedAppTitle)) {
        return catName;
      }
    }
    return null;
  }, [selectedAppTitle, categories]);

  // Providers list
  const providersList = React.useMemo(() => {
    if (!appData?.providers) return [];
    return Object.entries(appData.providers);
  }, [appData]);

  // Set initial selected provider when modal opens
  React.useEffect(() => {
    if (providersList.length > 0) {
      // If user has installed a specific provider, select that, otherwise select first
      const installed = selectedAppTitle ? installedApps[selectedAppTitle] : null;
      if (installed && appData?.providers[installed.installedProvider]) {
        setSelectedProviderKey(installed.installedProvider);
      } else {
        setSelectedProviderKey(providersList[0][0]);
      }
    }
  }, [selectedAppTitle, providersList]);

  // Close on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedAppTitle(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedAppTitle]);

  if (!selectedAppTitle || !appData) return null;

  const currentProvider: IndexAppProviderProps | undefined = appData.providers[selectedProviderKey] || providersList[0]?.[1];
  const installedInfo = installedApps[selectedAppTitle];
  const isInstalled = Boolean(installedInfo);
  const hasUpdate = isInstalled && currentProvider && installedInfo.installedVersion !== currentProvider.version;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleDownload = (providerName: string, provider: IndexAppProviderProps) => {
    startDownload(
      selectedAppTitle,
      providerName,
      provider.version,
      provider.download,
      provider.sha256
    );
    setDownloadNotice(`Download started for ${selectedAppTitle} (${providerName})`);
    setTimeout(() => setDownloadNotice(null), 3500);

    // Also offer direct download if URL is available
    if (provider.download && provider.download.startsWith('http')) {
      const a = document.createElement('a');
      a.href = provider.download;
      a.target = '_blank';
      a.rel = 'noreferrer';
      a.download = `${selectedAppTitle}_${providerName}_${provider.version}.apk`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleInstallToggle = () => {
    if (!currentProvider) return;
    if (isInstalled) {
      if (hasUpdate) {
        updateAppToVersion(selectedAppTitle, currentProvider.version, selectedProviderKey);
      } else {
        uninstallApp(selectedAppTitle);
      }
    } else {
      installApp(
        selectedAppTitle,
        selectedProviderKey,
        currentProvider.version,
        currentProvider.packageName || `com.${selectedAppTitle.toLowerCase().replace(/[^a-z0-9]/g, '')}`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div 
        id="app-detail-modal-card"
        className="relative w-full max-w-3xl my-8 bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between p-6 border-b border-neutral-800 bg-neutral-900/60 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700 p-2 overflow-hidden flex items-center justify-center shrink-0 shadow-md">
              {appData.icon ? (
                <img
                  src={appData.icon}
                  alt={selectedAppTitle}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="text-2xl font-bold text-emerald-400">
                  {selectedAppTitle.slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-neutral-100">
                  {selectedAppTitle}
                </h2>
                {appCategory && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700 font-medium">
                    {appCategory}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                {currentProvider?.packageName || 'Package: N/A'}
              </p>
            </div>
          </div>

          <button
            id="modal-close-btn"
            onClick={() => setSelectedAppTitle(null)}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Notification banner if download triggered */}
          {downloadNotice && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {downloadNotice}
              </span>
              <span className="text-[11px] opacity-80">Track in Downloads tab</span>
            </div>
          )}

          {/* Quick Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-neutral-400 font-medium">Active Status</p>
                <p className="text-sm font-bold text-neutral-200">
                  {isInstalled ? (
                    hasUpdate ? (
                      <span className="text-amber-400">Update Available ({installedInfo.installedVersion} → {currentProvider?.version})</span>
                    ) : (
                      <span className="text-emerald-400">Installed (v{installedInfo.installedVersion})</span>
                    )
                  ) : (
                    <span className="text-neutral-400">Not Installed</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="modal-install-toggle-btn"
                onClick={handleInstallToggle}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  !isInstalled
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-neutral-950 shadow-md shadow-emerald-500/20'
                    : hasUpdate
                    ? 'bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold'
                    : 'bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 border border-neutral-700'
                }`}
              >
                {!isInstalled ? (
                  <>
                    <Check className="w-4 h-4" />
                    Mark as Installed
                  </>
                ) : hasUpdate ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Apply Update (v{currentProvider?.version})
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    Installed (Click to remove)
                  </>
                )}
              </button>

              {currentProvider && (
                <button
                  id="modal-download-apk-btn"
                  onClick={() => handleDownload(selectedProviderKey, currentProvider)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-700/80 hover:bg-neutral-600 text-neutral-100 border border-neutral-600 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  Download APK
                </button>
              )}
            </div>
          </div>

          {/* Provider Selection Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Select Provider / Modder ({providersList.length})
              </label>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {providersList.map(([pName, pData]) => {
                const isSelected = selectedProviderKey === pName;
                return (
                  <button
                    key={pName}
                    id={`provider-btn-${pName.toLowerCase()}`}
                    onClick={() => setSelectedProviderKey(pName)}
                    className={`p-3 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-neutral-100 shadow-sm'
                        : 'bg-neutral-800/40 border-neutral-700/60 hover:bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs">{pName}</span>
                      {pData.safe && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-neutral-400">
                      v{pData.version || 'Latest'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Details Card */}
          {currentProvider && (
            <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/50 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-neutral-700/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-neutral-200">
                    {selectedProviderKey} Details
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-emerald-400">
                    v{currentProvider.version}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {currentProvider.source && (
                    <a
                      href={currentProvider.source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-emerald-400 transition-colors"
                    >
                      <span>Source Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>

              {/* SHA256 & VirusTotal Safety Check */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex items-center justify-between mb-1 text-neutral-400 font-medium">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Security Check
                    </span>
                    <span className="text-emerald-400 font-bold text-[11px]">
                      {currentProvider.safe ? 'Safe & Verified' : 'Check Hash'}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500">
                    APKs are verified and scanned for integrity and malware.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-neutral-400 font-medium">SHA-256 Checksum</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyHash(currentProvider.sha256)}
                        className="text-neutral-400 hover:text-neutral-200 transition-colors flex items-center gap-1"
                        title="Copy Hash"
                      >
                        {copiedHash === currentProvider.sha256 ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span className="text-[10px]">{copiedHash === currentProvider.sha256 ? 'Copied' : 'Copy'}</span>
                      </button>
                      {currentProvider.sha256 && (
                        <a
                          href={`https://www.virustotal.com/gui/file/${currentProvider.sha256}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline text-[10px] flex items-center gap-0.5"
                        >
                          VirusTotal <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-[10px] text-neutral-400 truncate bg-neutral-950 p-1.5 rounded border border-neutral-800 select-all">
                    {currentProvider.sha256 || 'Hash not available'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Dependencies and Complements */}
          {((appData.depends && appData.depends.length > 0) || (appData.complements && appData.complements.length > 0)) && (
            <div className="space-y-3">
              {appData.depends && appData.depends.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                    <Info className="w-4 h-4" />
                    Required Dependency
                  </div>
                  <p className="text-neutral-300 mb-2">
                    This app requires the following dependency to function properly (e.g. for Google account login):
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {appData.depends.map((dep) => (
                      <button
                        key={dep}
                        id={`dep-link-${dep.toLowerCase()}`}
                        onClick={() => setSelectedAppTitle(dep)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold flex items-center gap-1.5 border border-amber-500/30 transition-colors"
                      >
                        <span>{dep}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {appData.complements && appData.complements.length > 0 && (
                <div className="p-4 rounded-2xl bg-neutral-800/40 border border-neutral-700/60 text-xs">
                  <p className="text-neutral-400 font-bold mb-2">Complementary Apps</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {appData.complements.map((comp) => (
                      <button
                        key={comp}
                        onClick={() => setSelectedAppTitle(comp)}
                        className="px-3 py-1 rounded-lg bg-neutral-700/50 hover:bg-neutral-700 text-neutral-200 font-medium flex items-center gap-1 border border-neutral-600 transition-colors"
                      >
                        <span>{comp}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Features List */}
          {appData.features && appData.features.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Modded Features & Enhancements
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {appData.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 p-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800 text-xs text-neutral-300 leading-relaxed"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
