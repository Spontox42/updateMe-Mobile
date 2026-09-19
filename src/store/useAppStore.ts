import { create } from 'zustand';
import { Index, Categories, TabType } from '../types';

interface AppStoreState {
  index: Index;
  categories: Categories;
  selectedCategory: string;
  searchQuery: string;
  selectedAppTitle: string | null;
  activeTab: TabType;
  isLoading: boolean;
  error: string | null;
  latestAppVersion: { version: string; download: string } | null;
  
  // Actions
  fetchData: () => Promise<void>;
  setSelectedCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSelectedAppTitle: (title: string | null) => void;
  setActiveTab: (tab: TabType) => void;
}

const INDEX_URL = 'https://raw.githubusercontent.com/anfreire/updateMe-Data/main/index.json';
const CATEGORIES_URL = 'https://raw.githubusercontent.com/anfreire/updateMe-Data/main/categories.json';
const APP_URL = 'https://raw.githubusercontent.com/anfreire/updateMe-Data/main/app.json';

export const useAppStore = create<AppStoreState>((set) => ({
  index: {},
  categories: {},
  selectedCategory: 'All',
  searchQuery: '',
  selectedAppTitle: null,
  activeTab: 'explore',
  isLoading: true,
  error: null,
  latestAppVersion: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      // Try remote first, fallback to local static data if needed
      let indexData: Index;
      let categoriesData: Categories;

      try {
        const [indexRes, catRes] = await Promise.all([
          fetch(INDEX_URL),
          fetch(CATEGORIES_URL),
        ]);
        if (!indexRes.ok || !catRes.ok) throw new Error('Remote fetch failed');
        indexData = await indexRes.json();
        categoriesData = await catRes.json();
      } catch {
        // Fallback to local files in /data/
        const [localIndexRes, localCatRes] = await Promise.all([
          fetch('/data/index.json'),
          fetch('/data/categories.json'),
        ]);
        indexData = await localIndexRes.json();
        categoriesData = await localCatRes.json();
      }

      // Also try fetching latest app info
      try {
        const appRes = await fetch(APP_URL).catch(() => fetch('/data/app.json'));
        if (appRes.ok) {
          const appData = await appRes.json();
          set({ latestAppVersion: appData });
        }
      } catch {
        // non-critical
      }

      set({
        index: indexData,
        categories: categoriesData,
        isLoading: false,
      });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : 'Failed to load app directory',
      });
    }
  },

  setSelectedCategory: (category: string) => set({ selectedCategory: category }),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
  setSelectedAppTitle: (title: string | null) => set({ selectedAppTitle: title }),
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
}));
