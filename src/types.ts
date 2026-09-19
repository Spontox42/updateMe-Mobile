export interface IndexAppProviderProps {
  packageName: string;
  source: string;
  version: string;
  link: string;
  download: string;
  sha256: string;
  safe: boolean;
}

export interface IndexAppProps {
  icon: string;
  providers: Record<string, IndexAppProviderProps>;
  depends: string[];
  complements: string[];
  features: string[];
}

export type Index = Record<string, IndexAppProps>;

export interface CategoryData {
  apps: string[];
  icon: string;
}

export type Categories = Record<string, CategoryData>;

export interface TipStep {
  image: string;
  description: string;
}

export interface Tip {
  description: string;
  content: TipStep[];
}

export type Tips = Record<string, Tip>;

export interface InstalledApp {
  name: string;
  packageName: string;
  installedVersion: string;
  installedProvider: string;
  installedAt: string;
  ignoredUpdates?: boolean;
}

export interface DownloadItem {
  id: string;
  appName: string;
  providerName: string;
  version: string;
  fileName: string;
  url: string;
  progress: number; // 0 - 100
  status: 'downloading' | 'completed' | 'failed' | 'cancelled';
  sizeBytes: number;
  downloadedBytes: number;
  timestamp: number;
  sha256: string;
}

export type TabType = 'explore' | 'bookmarks' | 'updates' | 'downloads' | 'tips' | 'settings';
