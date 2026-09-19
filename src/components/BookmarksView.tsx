import React from 'react';
import { Bookmark, Search, Trash2, ArrowRight, Layers, Sparkles } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { AppCard } from './AppCard';

export const BookmarksView: React.FC = () => {
  const {
    bookmarks,
    clearBookmarks,
    index,
    categories,
    setSelectedAppTitle,
    setActiveTab,
  } = useAppStore();

  const [localSearch, setLocalSearch] = React.useState('');

  // Filter bookmarked apps that exist in index and match local search
  const bookmarkedApps = React.useMemo(() => {
    let list = bookmarks.filter((appId) => Boolean(index[appId]));

    if (localSearch.trim()) {
      const q = localSearch.toLowerCase().trim();
      list = list.filter((name) => {
        if (name.toLowerCase().includes(q)) return true;
        const app = index[name];
        if (!app) return false;
        if (app.features?.some((f) => f.toLowerCase().includes(q))) return true;
        const providerNames = Object.keys(app.providers || {});
        if (providerNames.some((p) => p.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return list;
  }, [bookmarks, index, localSearch]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bookmark className="w-5 h-5 text-amber-400 fill-amber-400/30" />
            <h2 className="text-xl font-bold text-neutral-100">Favorites & Bookmarks</h2>
          </div>
          <p className="text-xs text-neutral-400">
            {bookmarks.length > 0
              ? `You have saved ${bookmarks.length} ${bookmarks.length === 1 ? 'app' : 'apps'} to your quick-access bookmarks.`
              : 'Keep track of your favorite modded apps, tools, and entertainment services for quick access.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {bookmarks.length > 0 && (
            <button
              id="clear-bookmarks-btn"
              onClick={clearBookmarks}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-red-500/20 hover:text-red-400 text-neutral-300 border border-neutral-700 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear All ({bookmarks.length})
            </button>
          )}

          <button
            id="browse-explore-btn"
            onClick={() => setActiveTab('explore')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            Explore Apps
          </button>
        </div>
      </div>

      {/* Search within Bookmarks (if multiple bookmarks exist) */}
      {bookmarks.length > 3 && (
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Filter your bookmarks..."
            className="w-full h-9 pl-9 pr-4 text-xs rounded-xl bg-neutral-800/80 border border-neutral-700/80 text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500/60"
          />
        </div>
      )}

      {/* Bookmarked App Grid or Empty State */}
      {bookmarkedApps.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-neutral-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto">
            <Bookmark className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-200">
              {localSearch ? 'No bookmarks match your search' : 'No bookmarked apps yet'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto">
              {localSearch
                ? 'Try a different keyword or clear the filter.'
                : 'Click the bookmark icon on any app card in the Explore directory to save your favorite apps right here.'}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setActiveTab('explore')}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 inline-flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <span>Browse Explore Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {bookmarkedApps.map((appName) => {
            const app = index[appName];
            if (!app) return null;

            // Find category
            let catName: string | undefined;
            for (const [cName, cData] of Object.entries(categories)) {
              if (cData.apps.includes(appName)) {
                catName = cName;
                break;
              }
            }

            return (
              <AppCard
                key={appName}
                name={appName}
                app={app}
                category={catName}
                onSelect={() => setSelectedAppTitle(appName)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
