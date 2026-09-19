import React from 'react';
import { useAppStore } from './store/useAppStore';
import { useSettingsStore } from './store/useSettingsStore';
import { Navbar } from './components/Navbar';
import { ExploreView } from './components/ExploreView';
import { UpdatesView } from './components/UpdatesView';
import { DownloadsView } from './components/DownloadsView';
import { TipsView } from './components/TipsView';
import { SettingsView } from './components/SettingsView';
import { AppDetailModal } from './components/AppDetailModal';

export const App: React.FC = () => {
  const { activeTab, fetchData } = useAppStore();
  const { theme } = useSettingsStore();

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-100 text-neutral-900'}`}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'explore' && <ExploreView />}
        {activeTab === 'updates' && <UpdatesView />}
        {activeTab === 'downloads' && <DownloadsView />}
        {activeTab === 'tips' && <TipsView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* App Detail Modal */}
      <AppDetailModal />
    </div>
  );
};

export default App;
