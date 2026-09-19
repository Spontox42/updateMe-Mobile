import { create } from 'zustand';

interface SettingsStoreState {
  theme: 'dark' | 'light';
  providerOrder: string[];
  defaultProviders: Record<string, string>;
  deleteOnLeave: boolean;
  notificationsEnabled: boolean;
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setProviderOrder: (order: string[]) => void;
  setDefaultProvider: (appName: string, providerName: string) => void;
  setDeleteOnLeave: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

const STORAGE_KEY = 'updateme_settings';

const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  providerOrder: [
    'ReVanced',
    'Inotia00',
    'Balatan',
    'Mobilism',
    'Cuynu',
    'Anddea',
    'LiteApks',
    'F-Droid',
    'GitHub',
  ],
  defaultProviders: {} as Record<string, string>,
  deleteOnLeave: false,
  notificationsEnabled: true,
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: any) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export const useSettingsStore = create<SettingsStoreState>((set) => ({
  ...loadSettings(),

  setTheme: (theme) =>
    set((state) => {
      const updated = { ...state, theme };
      saveSettings(updated);
      return { theme };
    }),

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === 'dark' ? 'light' : 'dark';
      const updated = { ...state, theme: newTheme };
      saveSettings(updated);
      return { theme: newTheme };
    }),

  setProviderOrder: (providerOrder) =>
    set((state) => {
      const updated = { ...state, providerOrder };
      saveSettings(updated);
      return { providerOrder };
    }),

  setDefaultProvider: (appName, providerName) =>
    set((state) => {
      const defaultProviders = { ...state.defaultProviders, [appName]: providerName };
      const updated = { ...state, defaultProviders };
      saveSettings(updated);
      return { defaultProviders };
    }),

  setDeleteOnLeave: (deleteOnLeave) =>
    set((state) => {
      const updated = { ...state, deleteOnLeave };
      saveSettings(updated);
      return { deleteOnLeave };
    }),

  setNotificationsEnabled: (notificationsEnabled) =>
    set((state) => {
      const updated = { ...state, notificationsEnabled };
      saveSettings(updated);
      return { notificationsEnabled };
    }),
}));
