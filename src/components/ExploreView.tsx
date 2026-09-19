import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { CategoryFilter } from './CategoryFilter';
import { AppCard } from './AppCard';
import { Search, Sparkles, Flame, ShieldCheck, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';

export const ExploreView: React.FC = () => {
  const {
    index,
    categories,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    setSelectedAppTitle,
    isLoading,
    error,
    fetchData,
  } = useAppStore();

  // Filter apps by category and search
  const filteredAppNames = React.useMemo(() => {
    let names = Object.keys(index);

    // Filter by Category
    if (selectedCategory !== 'All' && categories[selectedCategory]) {
      const categoryAppSet = new Set(categories[selectedCategory].apps);
      names = names.filter((name) => categoryAppSet.has(name));
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      names = names.filter((name) => {
        if (name.toLowerCase().includes(q)) return true;
        const app = index[name];
        if (!app) return false;
        // Check features
        if (app.features?.some((f) => f.toLowerCase().includes(q))) return true;
        // Check providers
        const providerNames = Object.keys(app.providers || {});
        if (providerNames.some((p) => p.toLowerCase().includes(q))) return true;
        // Check package names
        const packages = Object.values(app.providers || {}).map((p) => p.packageName || '');
        if (packages.some((pkg) => pkg.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    return names;
  }, [index, categories, selectedCategory, searchQuery]);

  // Featured Apps
  const featuredNames = ['YouTube', 'Spotify', 'HDO', 'MicroG'].filter((n) => Boolean(index[n]));

  if (isLoading && Object.keys(index).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-sm font-semibold text-neutral-300">Loading modded applications directory...</p>
      </div>
    );
  }

  if (error && Object.keys(index).length === 0) {
    return (
      <div className="p-8 rounded-3xl bg-neutral-900 border border-red-500/30 text-center space-y-3 max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
        <h3 className="text-base font-bold text-neutral-100">Unable to load apps</h3>
        <p className="text-xs text-neutral-400">{error}</p>
        <button
          onClick={() => fetchData()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-neutral-950 hover:bg-emerald-400 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Featured Banner (only show when not searching and category is All) */}
      {!searchQuery && selectedCategory === 'All' && featuredNames.length > 0 && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-teal-950/30 border border-emerald-500/20 p-6 sm:p-8">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
              <Flame className="w-3.5 h-3.5" />
              Featured Modded App
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-100 tracking-tight">
              YouTube ReVanced & Extended
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Ad-free video streaming, background & minimized playback, SponsorBlock integration, custom theme styling, and external download options.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                id="featured-explore-btn"
                onClick={() => setSelectedAppTitle('YouTube')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <span>View YouTube ReVanced</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setSelectedAppTitle('MicroG')}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
              >
                MicroG Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Horizontal Filter */}
      <CategoryFilter />

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-neutral-200">
            {selectedCategory === 'All' ? 'All Applications' : selectedCategory}
            {searchQuery && ` matching "${searchQuery}"`}
          </h2>
          <p className="text-xs text-neutral-400">
            Showing {filteredAppNames.length} {filteredAppNames.length === 1 ? 'application' : 'applications'}
          </p>
        </div>

        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-xs text-emerald-400 hover:underline font-medium"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* App Grid */}
      {filteredAppNames.length === 0 ? (
        <div className="text-center py-20 px-4 rounded-3xl border border-dashed border-neutral-800">
          <Search className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-neutral-200">No applications matched your search</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try searching for another name, feature (like 'ad-free', 'sponsorblock', 'download'), or reset filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              useAppStore.getState().setSelectedCategory('All');
            }}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-colors"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAppNames.map((appName) => {
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
