import { create } from 'zustand';
import { InstalledApp } from '../types';

interface InstalledStoreState {
  installedApps: Record<string, InstalledApp>;
  installApp: (name: string, providerName: string, version: string, packageName: string) => void;
  uninstallApp: (name: string) => void;
  toggleIgnoreUpdate: (name: string) => void;
  updateAppToVersion: (name: string, newVersion: string, providerName: string) => void;
}

const STORAGE_KEY = 'updateme_installed_apps';

const DEFAULT_INSTALLED: Record<string, InstalledApp> = {
  'YouTube': {
    name: 'YouTube',
    packageName: 'app.revanced.android.youtube',
    installedVersion: '18.45.43',
    installedProvider: 'ReVanced',
    installedAt: '2024-03-10',
    ignoredUpdates: false,
  },
  'Spotify': {
    name: 'Spotify',
    packageName: 'com.spotify.music',
    installedVersion: '8.8.96.364',
    installedProvider: 'Balatan',
    installedAt: '2024-03-12',
    ignoredUpdates: false,
  },
  'MicroG': {
    name: 'MicroG',
    packageName: 'com.mgoogle.android.gms',
    installedVersion: '0.3.1.4.240913',
    installedProvider: 'ReVanced',
    installedAt: '2024-03-10',
    ignoredUpdates: false,
  },
};

function loadFromStorage(): Record<string, InstalledApp> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return DEFAULT_INSTALLED;
}

function saveToStorage(apps: Record<string, InstalledApp>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    // ignore
  }
}

export const useInstalledStore = create<InstalledStoreState>((set) => ({
  installedApps: loadFromStorage(),

  installApp: (name, providerName, version, packageName) =>
    set((state) => {
      const updated = {
        ...state.installedApps,
        [name]: {
          name,
          packageName,
          installedVersion: version,
          installedProvider: providerName,
          installedAt: new Date().toISOString().split('T')[0],
          ignoredUpdates: false,
        },
      };
      saveToStorage(updated);
      return { installedApps: updated };
    }),

  uninstallApp: (name) =>
    set((state) => {
      const updated = { ...state.installedApps };
      delete updated[name];
      saveToStorage(updated);
      return { installedApps: updated };
    }),

  toggleIgnoreUpdate: (name) =>
    set((state) => {
      const current = state.installedApps[name];
      if (!current) return state;
      const updated = {
        ...state.installedApps,
        [name]: {
          ...current,
          ignoredUpdates: !current.ignoredUpdates,
        },
      };
      saveToStorage(updated);
      return { installedApps: updated };
    }),

  updateAppToVersion: (name, newVersion, providerName) =>
    set((state) => {
      const current = state.installedApps[name];
      if (!current) return state;
      const updated = {
        ...state.installedApps,
        [name]: {
          ...current,
          installedVersion: newVersion,
          installedProvider: providerName,
        },
      };
      saveToStorage(updated);
      return { installedApps: updated };
    }),
}));
