import { create } from 'zustand';
import { DownloadItem } from '../types';

interface DownloadsStoreState {
  downloads: DownloadItem[];
  startDownload: (
    appName: string,
    providerName: string,
    version: string,
    downloadUrl: string,
    sha256: string
  ) => string;
  cancelDownload: (id: string) => void;
  removeDownload: (id: string) => void;
  clearCompleted: () => void;
}

const STORAGE_KEY = 'updateme_downloads';

const INITIAL_DOWNLOADS: DownloadItem[] = [
  {
    id: 'dl-initial-1',
    appName: 'YouTube',
    providerName: 'ReVanced',
    version: '19.16.39',
    fileName: 'youtube_revanced_19.16.39.apk',
    url: 'https://github.com/anfreire/UpdateMe-Data/releases/download/apps/youtube_revanced.apk',
    progress: 100,
    status: 'completed',
    sizeBytes: 135 * 1024 * 1024,
    downloadedBytes: 135 * 1024 * 1024,
    timestamp: Date.now() - 3600000 * 2,
    sha256: '9f83cf6a8a3a7f805a5a123f8b030467c6eb2345e8ef9673412089456ab79810',
  },
];

function loadDownloads(): DownloadItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // fallback
  }
  return INITIAL_DOWNLOADS;
}

function saveDownloads(items: DownloadItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

export const useDownloadsStore = create<DownloadsStoreState>((set, get) => ({
  downloads: loadDownloads(),

  startDownload: (appName, providerName, version, downloadUrl, sha256) => {
    const id = `dl-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const safeApp = appName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const safeProvider = providerName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fileName = `${safeApp}_${safeProvider}_v${version}.apk`;
    // Random realistic size between 45MB and 140MB
    const totalSize = (45 + Math.floor(Math.random() * 95)) * 1024 * 1024;

    const newItem: DownloadItem = {
      id,
      appName,
      providerName,
      version,
      fileName,
      url: downloadUrl,
      progress: 0,
      status: 'downloading',
      sizeBytes: totalSize,
      downloadedBytes: 0,
      timestamp: Date.now(),
      sha256,
    };

    set((state) => {
      const updated = [newItem, ...state.downloads];
      saveDownloads(updated);
      return { downloads: updated };
    });

    // Simulate progress
    const interval = setInterval(() => {
      set((state) => {
        const item = state.downloads.find((d) => d.id === id);
        if (!item || item.status !== 'downloading') {
          clearInterval(interval);
          return state;
        }

        const increment = 8 + Math.random() * 14;
        const newProgress = Math.min(100, item.progress + increment);
        const downloadedBytes = Math.floor((newProgress / 100) * item.sizeBytes);
        const isDone = newProgress >= 100;

        if (isDone) {
          clearInterval(interval);
        }

        const updated = state.downloads.map((d) =>
          d.id === id
            ? {
                ...d,
                progress: Math.floor(newProgress),
                downloadedBytes,
                status: isDone ? ('completed' as const) : ('downloading' as const),
              }
            : d
        );

        saveDownloads(updated);
        return { downloads: updated };
      });
    }, 400);

    return id;
  },

  cancelDownload: (id) =>
    set((state) => {
      const updated = state.downloads.map((d) =>
        d.id === id ? { ...d, status: 'cancelled' as const } : d
      );
      saveDownloads(updated);
      return { downloads: updated };
    }),

  removeDownload: (id) =>
    set((state) => {
      const updated = state.downloads.filter((d) => d.id !== id);
      saveDownloads(updated);
      return { downloads: updated };
    }),

  clearCompleted: () =>
    set((state) => {
      const updated = state.downloads.filter((d) => d.status !== 'completed');
      saveDownloads(updated);
      return { downloads: updated };
    }),
}));
