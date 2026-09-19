import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Film, Music, Video, MessageCircle, Camera, Image, Scissors, Tv, PlaySquare, Download, FolderArchive, Smartphone, Palette, Cpu, Briefcase, Shield, MapPin, GraduationCap, Heart, Wine, Wrench, MoreHorizontal, Sparkles } from 'lucide-react';

// Map icon strings from categories.json to lucide icons
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'movie-open-play': Film,
  'music-box-multiple': Music,
  'play-box-multiple': Video,
  'account-group': MessageCircle,
  'camera': Camera,
  'image-edit': Image,
  'movie-edit': Scissors,
  'television-box': Tv,
  'play-circle': PlaySquare,
  'file-download': Download,
  'download-network': FolderArchive,
  'home-edit': Smartphone,
  'image-filter-black-white': Palette,
  'robot-industrial': Cpu,
  'briefcase': Briefcase,
  'shield-key': Shield,
  'map-marker': MapPin,
  'school': GraduationCap,
  'heart': Heart,
  'beer': Wine,
  'tools': Wrench,
  'shape-plus': MoreHorizontal,
};

export const CategoryFilter: React.FC = () => {
  const { categories, selectedCategory, setSelectedCategory, index } = useAppStore();

  const categoryEntries = Object.entries(categories);
  const totalAppsCount = Object.keys(index).length;

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-none">
      <div className="flex items-center gap-2 min-w-max">
        {/* All Categories Button */}
        <button
          id="category-chip-all"
          onClick={() => setSelectedCategory('All')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            selectedCategory === 'All'
              ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
              : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:bg-neutral-800 hover:text-neutral-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>All Apps</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
            selectedCategory === 'All' ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-700/60 text-neutral-400'
          }`}>
            {totalAppsCount}
          </span>
        </button>

        {categoryEntries.map(([catName, catData]) => {
          const isSelected = selectedCategory === catName;
          const Icon = iconMap[catData.icon] || Wrench;
          return (
            <button
              key={catName}
              id={`category-chip-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              onClick={() => setSelectedCategory(catName)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isSelected
                  ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-bold shadow-sm shadow-emerald-500/20'
                  : 'bg-neutral-800/60 text-neutral-300 border-neutral-700/60 hover:bg-neutral-800 hover:text-neutral-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{catName}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                isSelected ? 'bg-neutral-950/20 text-neutral-950' : 'bg-neutral-700/60 text-neutral-400'
              }`}>
                {catData.apps.length}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
