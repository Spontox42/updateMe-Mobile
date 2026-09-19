import { create } from 'zustand';
import { Tips, Tip } from '../types';

interface TipsStoreState {
  tips: Tips;
  activeTipTitle: string | null;
  activeTipStep: number;
  isLoading: boolean;
  fetchTips: () => Promise<void>;
  openTip: (title: string) => void;
  closeTip: () => void;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const TIPS_URL = 'https://raw.githubusercontent.com/anfreire/updateMe-Data/main/tips.json';

export const useTipsStore = create<TipsStoreState>((set, get) => ({
  tips: {},
  activeTipTitle: null,
  activeTipStep: 0,
  isLoading: false,

  fetchTips: async () => {
    set({ isLoading: true });
    try {
      let data: Tips;
      try {
        const res = await fetch(TIPS_URL);
        if (!res.ok) throw new Error('Failed remote');
        data = await res.json();
      } catch {
        const localRes = await fetch('/data/tips.json');
        data = await localRes.json();
      }
      set({ tips: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  openTip: (title: string) => set({ activeTipTitle: title, activeTipStep: 0 }),
  closeTip: () => set({ activeTipTitle: null, activeTipStep: 0 }),
  setStep: (step: number) => set({ activeTipStep: step }),

  nextStep: () => {
    const { activeTipTitle, tips, activeTipStep } = get();
    if (!activeTipTitle || !tips[activeTipTitle]) return;
    const maxSteps = tips[activeTipTitle].content.length;
    if (activeTipStep < maxSteps - 1) {
      set({ activeTipStep: activeTipStep + 1 });
    }
  },

  prevStep: () => {
    const { activeTipStep } = get();
    if (activeTipStep > 0) {
      set({ activeTipStep: activeTipStep - 1 });
    }
  },
}));
