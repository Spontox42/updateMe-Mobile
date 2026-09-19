import React from 'react';
import {
  Settings,
  Sun,
  Moon,
  Trash2,
  Bell,
  Sliders,
  ChevronUp,
  ChevronDown,
  Info,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import { useDownloadsStore } from '../store/useDownloadsStore';

export const SettingsView: React.FC = () => {
  const {
    theme,
    setTheme,
    providerOrder,
    setProviderOrder,
    deleteOnLeave,
    setDeleteOnLeave,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettingsStore();

  const { clearCompleted, downloads } = useDownloadsStore();
  const [cleanedNotice, setCleanedNotice] = React.useState(false);

  const moveProvider = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= providerOrder.length) return;
    const newOrder = [...providerOrder];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);
    setProviderOrder(newOrder);
  };

  const handleClearCache = () => {
    clearCompleted();
    setCleanedNotice(true);
    setTimeout(() => setCleanedNotice(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800/80 border border-neutral-800 flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-neutral-100">Settings & Preferences</h2>
          <p className="text-xs text-neutral-400">Configure provider rankings, storage cleanup, and theme options.</p>
        </div>
      </div>

      {/* General Settings */}
      <div className="p-6 rounded-3xl bg-neutral-800/40 border border-neutral-700/60 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Appearance & Behavior</h3>

        {/* Theme */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-700/40">
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Color Theme</h4>
            <p className="text-xs text-neutral-400">Switch between Dark and Light mode</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-700">
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'dark'
                  ? 'bg-neutral-800 text-emerald-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                theme === 'light'
                  ? 'bg-neutral-800 text-amber-400 shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light
            </button>
          </div>
        </div>

        {/* Delete On Leave */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-700/40">
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Delete APKs on Leave</h4>
            <p className="text-xs text-neutral-400">Automatically clear downloaded APK installer packages when leaving</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={deleteOnLeave}
              onChange={(e) => setDeleteOnLeave(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between py-2 border-b border-neutral-700/40">
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Update Notifications</h4>
            <p className="text-xs text-neutral-400">Receive alerts when new releases or app updates are available</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Clear Storage */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h4 className="text-sm font-semibold text-neutral-200">Downloaded Storage</h4>
            <p className="text-xs text-neutral-400">
              Clear temporary downloads ({downloads.length} items currently in history)
            </p>
          </div>

          <button
            onClick={handleClearCache}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {cleanedNotice ? 'Cleaned!' : 'Clear Cache'}
          </button>
        </div>
      </div>

      {/* Provider Priority Ranking */}
      <div className="p-6 rounded-3xl bg-neutral-800/40 border border-neutral-700/60 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-emerald-400" />
              Provider Priority Order
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              When an app has multiple modders, the highest ranked provider will be selected by default.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          {providerOrder.map((provider, idx) => (
            <div
              key={provider}
              className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-mono text-xs text-neutral-500 font-bold">
                  #{idx + 1}
                </span>
                <span className="text-xs font-bold text-neutral-200">{provider}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => moveProvider(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 transition-colors"
                  title="Move Up"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveProvider(idx, 'down')}
                  disabled={idx === providerOrder.length - 1}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 disabled:opacity-20 transition-colors"
                  title="Move Down"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* About UpdateMe */}
      <div className="p-6 rounded-3xl bg-neutral-800/40 border border-neutral-700/60 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-200">About UpdateMe</h3>
            <p className="text-xs text-neutral-400">Open-source Android modded app updater & repository manager</p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            v3.0.0
          </span>
        </div>

        <div className="pt-2 flex items-center gap-4 flex-wrap text-xs text-neutral-400">
          <a
            href="https://github.com/Spontox42/updateMe-Mobile"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:underline"
          >
            GitHub Repository <ExternalLink className="w-3 h-3" />
          </a>
          <span>·</span>
          <a
            href="https://apt.izzysoft.de/packages/com.updateme"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-neutral-200"
          >
            IzzyOnDroid Package <ExternalLink className="w-3 h-3" />
          </a>
          <span>·</span>
          <span>Apache 2.0 License</span>
        </div>
      </div>
    </div>
  );
};
