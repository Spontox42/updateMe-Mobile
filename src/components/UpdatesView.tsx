import React from 'react';
import {
  ArrowUpCircle,
  CheckCircle2,
  BellOff,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Download,
  Trash2,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useInstalledStore } from '../store/useInstalledStore';
import { useAppStore } from '../store/useAppStore';
import { useDownloadsStore } from '../store/useDownloadsStore';

export const UpdatesView: React.FC = () => {
  const { installedApps, updateAppToVersion, uninstallApp, toggleIgnoreUpdate } = useInstalledStore();
  const { index, setSelectedAppTitle, fetchData, isLoading } = useAppStore();
  const { startDownload } = useDownloadsStore();

  const [filter, setFilter] = React.useState<'all' | 'updates' | 'uptodate' | 'ignored'>('all');
  const [updatingAll, setUpdatingAll] = React.useState(false);

  const installedList = Object.values(installedApps);

  // Compute status for each app
  const appsWithStatus = React.useMemo(() => {
    return installedList.map((app) => {
      const appData = index[app.name];
      const primaryProvider = appData?.providers[app.installedProvider] || Object.values(appData?.providers || {})[0];
      const latestVersion = primaryProvider?.version || app.installedVersion;
      const hasUpdate = !app.ignoredUpdates && primaryProvider && primaryProvider.version !== app.installedVersion;

      return {
        ...app,
        appData,
        primaryProvider,
        latestVersion,
        hasUpdate,
      };
    });
  }, [installedList, index]);

  const pendingUpdates = appsWithStatus.filter((a) => a.hasUpdate);

  const filteredApps = React.useMemo(() => {
    switch (filter) {
      case 'updates':
        return appsWithStatus.filter((a) => a.hasUpdate);
      case 'uptodate':
        return appsWithStatus.filter((a) => !a.hasUpdate && !a.ignoredUpdates);
      case 'ignored':
        return appsWithStatus.filter((a) => a.ignoredUpdates);
      default:
        return appsWithStatus;
    }
  }, [appsWithStatus, filter]);

  const handleUpdateAll = () => {
    setUpdatingAll(true);
    pendingUpdates.forEach((app) => {
      if (app.primaryProvider) {
        startDownload(
          app.name,
          app.installedProvider,
          app.primaryProvider.version,
          app.primaryProvider.download,
          app.primaryProvider.sha256
        );
        updateAppToVersion(app.name, app.primaryProvider.version, app.installedProvider);
      }
    });
    setTimeout(() => setUpdatingAll(false), 1200);
  };

  const handleUpdateSingle = (appName: string, providerName: string, version: string, downloadUrl: string, sha256: string) => {
    startDownload(appName, providerName, version, downloadUrl, sha256);
    updateAppToVersion(appName, version, providerName);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-neutral-100">Updates & Installed Manager</h2>
          </div>
          <p className="text-xs text-neutral-400">
            {pendingUpdates.length > 0
              ? `${pendingUpdates.length} ${pendingUpdates.length === 1 ? 'app has' : 'apps have'} newer versions available from mod providers.`
              : 'All your tracked modded apps are completely up to date.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {pendingUpdates.length > 0 && (
            <button
              id="update-all-btn"
              onClick={handleUpdateAll}
              disabled={updatingAll}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {updatingAll ? 'Updating...' : `Update All (${pendingUpdates.length})`}
            </button>
          )}

          <button
            id="check-updates-btn"
            onClick={() => fetchData()}
            disabled={isLoading}
            className="px-3.5 py-2 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            Check
          </button>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: 'All Installed', count: appsWithStatus.length },
          { id: 'updates', label: 'Updates Available', count: pendingUpdates.length, highlight: pendingUpdates.length > 0 },
          { id: 'uptodate', label: 'Up to Date', count: appsWithStatus.filter(a => !a.hasUpdate && !a.ignoredUpdates).length },
          { id: 'ignored', label: 'Ignored', count: appsWithStatus.filter(a => a.ignoredUpdates).length },
        ].map((tab) => (
          <button
            key={tab.id}
            id={`updates-filter-${tab.id}`}
            onClick={() => setFilter(tab.id as any)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
              filter === tab.id
                ? 'bg-neutral-800 text-neutral-100 border-neutral-600'
                : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800/60 hover:text-neutral-300'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              tab.highlight ? 'bg-amber-500/20 text-amber-400 font-bold' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Apps List */}
      {filteredApps.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-neutral-800">
          <CheckCircle2 className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-neutral-300">No apps found in this view</p>
          <p className="text-xs text-neutral-500 mt-1">
            Browse the Explore tab to install and track modded applications.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredApps.map((app) => (
            <div
              key={app.name}
              id={`installed-app-${app.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              className="p-4 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800/60 border border-neutral-700/60 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setSelectedAppTitle(app.name)}
                      className="w-12 h-12 rounded-xl bg-neutral-700/50 p-1 flex items-center justify-center cursor-pointer overflow-hidden border border-neutral-700 shrink-0 hover:scale-105 transition-transform"
                    >
                      {app.appData?.icon ? (
                        <img
                          src={app.appData.icon}
                          alt={app.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain rounded-lg"
                        />
                      ) : (
                        <span className="font-bold text-sm text-emerald-400">
                          {app.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3
                        onClick={() => setSelectedAppTitle(app.name)}
                        className="text-sm font-bold text-neutral-100 hover:text-emerald-300 cursor-pointer transition-colors"
                      >
                        {app.name}
                      </h3>
                      <p className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]">
                        {app.packageName}
                      </p>
                    </div>
                  </div>

                  <div>
                    {app.ignoredUpdates ? (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                        Ignored
                      </span>
                    ) : app.hasUpdate ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5" />
                        Update
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Latest
                      </span>
                    )}
                  </div>
                </div>

                {/* Version Comparison Bar */}
                <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 my-2 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-[11px]">Installed:</span>
                    <span className="font-mono text-neutral-200">v{app.installedVersion}</span>
                    <span className="text-[10px] text-neutral-500">({app.installedProvider})</span>
                  </div>

                  {app.hasUpdate && (
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <ArrowRight className="w-3 h-3" />
                      <span className="font-mono font-bold">v{app.latestVersion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleIgnoreUpdate(app.name)}
                    className="text-[11px] text-neutral-400 hover:text-neutral-200 flex items-center gap-1 py-1 px-1.5 rounded hover:bg-neutral-800 transition-colors"
                  >
                    <BellOff className="w-3 h-3" />
                    <span>{app.ignoredUpdates ? 'Unignore' : 'Ignore'}</span>
                  </button>

                  <button
                    onClick={() => uninstallApp(app.name)}
                    className="text-[11px] text-neutral-500 hover:text-red-400 flex items-center gap-1 py-1 px-1.5 rounded hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {app.hasUpdate && app.primaryProvider && (
                    <button
                      onClick={() =>
                        handleUpdateSingle(
                          app.name,
                          app.installedProvider,
                          app.primaryProvider.version,
                          app.primaryProvider.download,
                          app.primaryProvider.sha256
                        )
                      }
                      className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Update APK
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedAppTitle(app.name)}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
