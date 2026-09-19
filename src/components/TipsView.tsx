import React from 'react';
import {
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useTipsStore } from '../store/useTipsStore';

export const TipsView: React.FC = () => {
  const { tips, fetchTips, isLoading, activeTipTitle, activeTipStep, openTip, closeTip, nextStep, prevStep } = useTipsStore();

  React.useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  const tipEntries = Object.entries(tips);
  const activeTip = activeTipTitle ? tips[activeTipTitle] : null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-800/80 border border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-neutral-100">Guides & Troubleshooting Tips</h2>
          </div>
          <p className="text-xs text-neutral-400">
            Official walk-throughs and recommendations for setting up modded apps, MicroG, and resolving Android link opening issues.
          </p>
        </div>
      </div>

      {/* Grid of Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tipEntries.map(([title, tip]) => (
          <div
            key={title}
            id={`tip-card-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => openTip(title)}
            className="p-5 rounded-2xl bg-neutral-800/40 hover:bg-neutral-800/70 border border-neutral-700/60 hover:border-emerald-500/40 transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  {tip.content.length} Steps
                </span>
              </div>

              <h3 className="text-base font-bold text-neutral-100 group-hover:text-emerald-300 transition-colors mb-1.5">
                {title}
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed line-clamp-2">
                {tip.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
              <span className="text-[11px] text-neutral-500">Interactive Walkthrough</span>
              <div className="flex items-center text-emerald-400 font-medium group-hover:translate-x-1 transition-transform">
                <span>View Guide</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Step-by-Step Walkthrough Modal */}
      {activeTip && activeTipTitle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-900/80">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-neutral-100">
                  {activeTipTitle}
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Step {activeTipStep + 1} of {activeTip.content.length}
                </p>
              </div>

              <button
                onClick={closeTip}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              {/* Step image or visual */}
              {activeTip.content[activeTipStep]?.image && (
                <div className="w-full bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 flex items-center justify-center min-h-[220px] max-h-[380px] p-2">
                  <img
                    src={activeTip.content[activeTipStep].image}
                    alt={`Step ${activeTipStep + 1}`}
                    referrerPolicy="no-referrer"
                    className="max-h-[360px] object-contain rounded-xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Step Description */}
              <div className="p-4 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                    {activeTipStep + 1}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Instructions
                  </span>
                </div>
                <p className="text-sm text-neutral-200 leading-relaxed">
                  {activeTip.content[activeTipStep]?.description}
                </p>
              </div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between p-4 border-t border-neutral-800 bg-neutral-900/80">
              <button
                onClick={prevStep}
                disabled={activeTipStep === 0}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1.5">
                {activeTip.content.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === activeTipStep
                        ? 'w-6 bg-emerald-400'
                        : 'bg-neutral-700'
                    }`}
                  />
                ))}
              </div>

              {activeTipStep < activeTip.content.length - 1 ? (
                <button
                  onClick={nextStep}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={closeTip}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
