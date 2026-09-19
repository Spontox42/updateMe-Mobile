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
  ChevronDown,
  Tag,
  CornerDownLeft,
  Check,
  Bookmark,
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { useInstalledStore } from '../store/useInstalledStore';
import { useDownloadsStore } from '../store/useDownloadsStore';
import { useSettingsStore } from '../store/useSettingsStore';
import { TabType } from '../types';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    categories,
    selectedCategory,
    setSelectedCategory,
    setSelectedAppTitle,
    fetchData,
    isLoading,
    index,
    bookmarks,
  } = useAppStore();

  const { installedApps } = useInstalledStore();
  const { downloads } = useDownloadsStore();
  const { theme, toggleTheme } = useSettingsStore();

  const [isSearchFocused, setIsSearchFocused] = React.useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        setIsCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K or / to focus search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') ||
        ((e.metaKey || e.ctrlKey) && e.key === 'k')
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape' && isSearchFocused) {
        searchInputRef.current?.blur();
        setIsSearchFocused(false);
        setIsCategoryDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  // Compute available updates count
  const availableUpdatesCount = React.useMemo(() => {
    let count = 0;
    Object.values(installedApps).forEach((app) => {
      if (app.ignoredUpdates) return;
      const appData = index[app.name];
      if (!appData) return;
      const provider = appData.providers[app.installedProvider] || Object.values(appData.providers)[0];
      if (provider && provider.version && provider.version !== app.installedVersion) {
        count++;
      }
    });
    return count;
  }, [installedApps, index]);

  // Compute active downloads count
  const activeDownloadsCount = downloads.filter((d) => d.status === 'downloading').length;

  // Compute matching categories and apps for search dropdown suggestions
  const { matchingCategories, matchingApps, totalMatches } = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { matchingCategories: [], matchingApps: [], totalMatches: 0 };

    // 1. Categories matching the query
    const matchedCats = Object.entries(categories)
      .filter(([catName]) => catName.toLowerCase().includes(q))
      .map(([catName, catData]) => ({
        name: catName,
        count: catData.apps.length,
      }));

    // Apps belonging to matching categories
    const matchingCategoryApps = new Set<string>();
    matchedCats.forEach((cat) => {
      categories[cat.name]?.apps.forEach((appName) => matchingCategoryApps.add(appName));
    });

    // 2. Apps matching query by name, category, feature, or provider
    const matchedApps: { name: string; category?: string; icon?: string }[] = [];
    let count = 0;

    for (const [appName, appData] of Object.entries(index)) {
      let isMatch = false;

      // Match by app name
      if (appName.toLowerCase().includes(q)) {
        isMatch = true;
      }
      // Match by category
      else if (matchingCategoryApps.has(appName)) {
        isMatch = true;
      }
      // Match by feature or provider
      else if (
        appData.features?.some((f) => f.toLowerCase().includes(q)) ||
        Object.keys(appData.providers || {}).some((p) => p.toLowerCase().includes(q)) ||
        Object.values(appData.providers || {}).some((p) => (p.packageName || '').toLowerCase().includes(q))
      ) {
        isMatch = true;
      }

      if (isMatch) {
        count++;
        if (matchedApps.length < 5) {
          // Find category name
          let catName: string | undefined;
          for (const [cName, cData] of Object.entries(categories)) {
            if (cData.apps.includes(appName)) {
              catName = cName;
              break;
            }
          }
          matchedApps.push({
            name: appName,
            category: catName,
            icon: appData.icon,
          });
        }
      }
    }

    return {
      matchingCategories: matchedCats.slice(0, 4),
      matchingApps: matchedApps,
      totalMatches: count,
    };
  }, [searchQuery, categories, index]);

  const handleSelectCategoryFromSearch = (catName: string) => {
    setSelectedCategory(catName);
    setSearchQuery('');
    setActiveTab('explore');
    setIsSearchFocused(false);
    setIsCategoryDropdownOpen(false);
  };

  const handleSelectAppFromSearch = (appName: string) => {
    setSelectedAppTitle(appName);
    setActiveTab('explore');
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setActiveTab('explore');
    setIsSearchFocused(false);
  };

  const tabs: { id: TabType; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [
    { id: 'explore', label: 'Explore', icon: Layers },
    { id: 'bookmarks', label: 'Bookmarks', icon: Bookmark, badge: bookmarks.length },
    { id: 'updates', label: 'Updates', icon: ArrowUpCircle, badge: availableUpdatesCount },
    { id: 'downloads', label: 'Downloads', icon: DownloadCloud, badge: activeDownloadsCount },
    { id: 'tips', label: 'Guides & Tips', icon: HelpCircle },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200 border-neutral-800 bg-neutral-900/90 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Name */}
          <div 
            id="brand-header"
            onClick={() => { setActiveTab('explore'); setSearchQuery(''); setSelectedCategory('All'); }}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-neutral-900 rounded-[10px] flex items-center justify-center">
                <ArrowUpCircle className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-neutral-100 to-neutral-300 bg-clip-text text-transparent">
                  UpdateMe
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  v3.0
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-medium">Mod & App Manager</p>
            </div>
          </div>

          {/* Global Search Bar (with Category Selector & Autocomplete) */}
          <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              {/* Category Filter Selector Dropdown */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  id="navbar-category-dropdown-btn"
                  onClick={() => setIsCategoryDropdownOpen((prev) => !prev)}
                  className="h-9 px-2.5 rounded-l-xl bg-neutral-800/90 hover:bg-neutral-800 border-y border-l border-neutral-700/80 text-xs font-semibold text-neutral-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors select-none"
                  title="Filter by category"
                >
                  <Tag className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="max-w-[85px] md:max-w-[120px] truncate">
                    {selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                  </span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 shrink-0" />
                </button>

                {/* Category Dropdown Menu */}
                {isCategoryDropdownOpen && (
                  <div className="absolute left-0 top-full mt-1.5 w-56 max-h-64 overflow-y-auto bg-neutral-900 border border-neutral-700 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                    <button
                      type="button"
                      onClick={() => handleSelectCategoryFromSearch('All')}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors ${
                        selectedCategory === 'All'
                          ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                          : 'text-neutral-300 hover:bg-neutral-800'
                      }`}
                    >
                      <span>All Categories</span>
                      {selectedCategory === 'All' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <div className="h-px bg-neutral-800 my-1" />
                    {Object.entries(categories).map(([catName, catData]) => (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => handleSelectCategoryFromSearch(catName)}
                        className={`w-full text-left px-3 py-1.5 text-xs rounded-xl flex items-center justify-between transition-colors ${
                          selectedCategory === catName
                            ? 'bg-emerald-500/15 text-emerald-400 font-bold'
                            : 'text-neutral-300 hover:bg-neutral-800'
                        }`}
                      >
                        <span className="truncate mr-2">{catName}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">
                          {catData.apps.length}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Main Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  id="global-search-input"
                  type="text"
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (activeTab !== 'explore') setActiveTab('explore');
                  }}
                  placeholder="Search apps by name or category..."
                  className="w-full h-9 pl-9 pr-14 text-xs sm:text-sm rounded-r-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/60 focus:border-emerald-500/60 transition-all"
                />

                {/* Right controls: Clear button or shortcut badge */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-md text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-neutral-500 bg-neutral-900 border border-neutral-700/60">
                      /
                    </span>
                  )}
                </div>
              </div>
            </form>

            {/* Global Search Dropdown Results / Suggestions */}
            {isSearchFocused && searchQuery.trim() && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-neutral-900 border border-neutral-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-neutral-800">
                {/* Matching Categories section */}
                {matchingCategories.length > 0 && (
                  <div className="p-3 bg-neutral-950/50">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-2 flex items-center gap-1.5">
                      <Tag className="w-3 h-3 text-emerald-400" />
                      Matching Categories
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {matchingCategories.map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={() => handleSelectCategoryFromSearch(cat.name)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-neutral-800/90 hover:bg-emerald-500/20 hover:text-emerald-300 text-neutral-200 border border-neutral-700/80 flex items-center gap-1.5 transition-colors"
                        >
                          <span className="font-semibold">{cat.name}</span>
                          <span className="text-[10px] font-mono text-emerald-400">
                            ({cat.count} apps)
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Matching Applications */}
                {matchingApps.length > 0 && (
                  <div className="p-2 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-2 py-1 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-emerald-400" />
                      Applications
                    </p>
                    {matchingApps.map((app) => (
                      <div
                        key={app.name}
                        onClick={() => handleSelectAppFromSearch(app.name)}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/80 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700 p-0.5 flex items-center justify-center shrink-0">
                            {app.icon ? (
                              <img
                                src={app.icon}
                                alt={app.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-contain rounded"
                              />
                            ) : (
                              <span className="text-xs font-bold text-emerald-400">
                                {app.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-neutral-100 group-hover:text-emerald-300 transition-colors">
                              {app.name}
                            </h4>
                            {app.category && (
                              <p className="text-[10px] text-neutral-400">{app.category}</p>
                            )}
                          </div>
                        </div>

                        <span className="text-[11px] text-neutral-500 group-hover:text-emerald-400 transition-colors">
                          Details →
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer Action: View All Results */}
                <div
                  onClick={() => handleSearchSubmit()}
                  className="p-2.5 bg-neutral-900 hover:bg-neutral-800 cursor-pointer flex items-center justify-between text-xs text-neutral-300 transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    View all {totalMatches} results in Explore
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <span>Press Enter</span>
                    <CornerDownLeft className="w-3 h-3" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Controls: Refresh, Theme */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              id="refresh-data-btn"
              onClick={() => fetchData()}
              disabled={isLoading}
              title="Refresh database"
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>

            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              title="Toggle theme"
              className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1.5 scrollbar-none border-t border-neutral-800/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap select-none cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-neutral-400'}`} />
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
