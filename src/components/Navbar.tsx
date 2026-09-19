import React from 'react';
import {
  Search,
  Sparkles,
  ArrowUpCircle,
  DownloadCloud,
  HelpCircle,
  Settings,
  Sun,
  Moon,
  RefreshCw,
  X,
  Layers,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useInstalledStore } from '../store/useInstalledStore';
import { useDownloadsStore } from '../store/useDownloadsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { TabType } from '../types';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, searchQuery, setSearchQuery, fetchData, isLoading, index } = useAppStore();
  const { installedApps } = useInstalledStore();
  const { downloads } = useDownloadsStore();
  const { theme, toggleTheme } = useSettingsStore();

  // Count available updates
  const availableUpdatesCount = React.useMemo(() => {
    let count = 0;
    Object.values(installedApps).forEach((app) => {
      if (app.ignoredUpdates) return;
      const appData = index[app.name];
      if (!appData) return;
      // check if any provider has a newer version or the installed provider
      const provider = appData.providers[app.installedProvider] || Object.values(appData.providers)[0];
      if (provider && provider.version && provider.version !== app.installedVersion) {
        count++;
      }
    });
    return count;
  }, [installedApps, index]);

  // Count active downloads
  const activeDownloadsCount = downloads.filter((d) => d.status === 'downloading').length;

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'explore', label: 'Explore', icon: Layers },
    { id: 'updates', label: 'Updates', icon: ArrowUpCircle, badge: availableUpdatesCount },
    { id: 'downloads', label: 'Downloads', icon: DownloadCloud, badge: activeDownloadsCount },
    { id: 'tips', label: 'Guides & Tips', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-neutral-800 bg-neutral-900/90 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div 
            id="brand-header"
            onClick={() => { setActiveTab('explore'); setSearchQuery(''); }}
            className="flex items-center gap-3 cursor-pointer select-none shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-neutral-900 rounded-[10px] flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                  UpdateMe
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v3.0
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-medium">Mod & App Manager</p>
            </div>
          </div>

          {/* Search bar (primarily visible for explore) */}
          <div className="flex-1 max-w-md relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                id="search-apps-input"
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'explore') setActiveTab('explore');
                }}
                placeholder="Search modded apps, features, packages..."
                className="w-full pl-9 pr-8 py-2 text-sm rounded-xl bg-neutral-800/80 border border-neutral-700/70 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Controls: Refresh, Theme, etc. */}
          <div className="flex items-center gap-1.5">
            <button
              id="refresh-data-btn"
              onClick={() => fetchData()}
              disabled={isLoading}
              title="Refresh database"
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1 scrollbar-none border-t border-neutral-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap select-none ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-emerald-500 text-neutral-950' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
