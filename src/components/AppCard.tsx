import React from 'react';
import { ShieldCheck, Download, Check, Sparkles, ExternalLink, ArrowUpRight, Bookmark } from 'lucide-react';
import { IndexAppProps } from '../types';
import { useInstalledStore } from '../store/useInstalledStore';
import { useAppStore } from '../store/useAppStore';

interface AppCardProps {
  name: string;
  app: IndexAppProps;
  category?: string;
  onSelect: () => void;
}

export const AppCard: React.FC<AppCardProps> = ({ name, app, category, onSelect }) => {
  const [imgError, setImgError] = React.useState(false);
  const { installedApps } = useInstalledStore();
  const { setSelectedAppTitle, isBookmarked, toggleBookmark } = useAppStore();

  const providersList = Object.entries(app.providers || {});
  const providerCount = providersList.length;
  const primaryProvider = providersList[0]?.[1];
  const primaryProviderName = providersList[0]?.[0];

  const isInstalled = Boolean(installedApps[name]);
  const installedInfo = installedApps[name];
  const hasUpdate = isInstalled && primaryProvider && installedInfo.installedVersion !== primaryProvider.version;
  const bookmarked = isBookmarked(name);

  return (
    <div
      id={`app-card-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      onClick={onSelect}
      className="group relative flex flex-col justify-between p-4 rounded-2xl bg-neutral-800/50 hover:bg-neutral-800/80 border border-neutral-700/60 hover:border-emerald-500/40 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg hover:shadow-neutral-950/40"
    >
      <div>
        {/* Top bar: Icon, Badges & Bookmark */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="relative w-12 h-12 rounded-xl bg-neutral-700/60 overflow-hidden flex items-center justify-center p-1 border border-neutral-700 shrink-0 group-hover:scale-105 transition-transform">
            {!imgError && app.icon ? (
              <img
                src={app.icon}
                alt={name}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <span className="font-bold text-lg text-emerald-400">
                {name.slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <div className="flex flex-col items-end gap-1">
              {isInstalled && (
                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  hasUpdate 
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {hasUpdate ? <Sparkles className="w-2.5 h-2.5" /> : <Check className="w-2.5 h-2.5" />}
                  {hasUpdate ? 'Update' : 'Installed'}
                </span>
              )}

              {primaryProvider?.safe && (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400/90 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
                  Verified
                </span>
              )}
            </div>

            {/* Bookmark button */}
            <button
              type="button"
              id={`bookmark-btn-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={(e) => {
                e.stopPropagation();
                toggleBookmark(name);
              }}
              title={bookmarked ? 'Remove bookmark' : 'Bookmark this app'}
              className={`p-1.5 rounded-lg border transition-all ${
                bookmarked
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400 hover:bg-amber-500/30'
                  : 'bg-neutral-900/60 border-neutral-700/60 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700/50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title and Category */}
        <div className="mb-2">
          <h3 className="text-base font-bold text-neutral-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
            {name}
          </h3>
          {category && (
            <p className="text-xs text-neutral-400 font-medium">
              {category}
            </p>
          )}
        </div>

        {/* Feature Highlights */}
        {app.features && app.features.length > 0 && (
          <p className="text-xs text-neutral-400 line-clamp-2 mb-3 leading-relaxed">
            {app.features[0]}
          </p>
        )}
      </div>

      {/* Footer Info: Providers & Version */}
      <div className="pt-3 border-t border-neutral-700/40 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-neutral-900/60 font-mono text-neutral-300 border border-neutral-700/50">
            {primaryProvider?.version ? `v${primaryProvider.version}` : 'Latest'}
          </span>
          <span className="text-neutral-500">·</span>
          <span>{providerCount} {providerCount === 1 ? 'provider' : 'providers'}</span>
        </div>

        <div className="flex items-center text-emerald-400 font-medium group-hover:translate-x-0.5 transition-transform">
          <span className="text-xs">View</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
        </div>
      </div>
    </div>
  );
};
