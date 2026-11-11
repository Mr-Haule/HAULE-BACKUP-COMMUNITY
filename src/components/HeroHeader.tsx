import React from 'react';
import { ShieldCheck, Target, Zap, TrendingUp, Sparkles, Award } from 'lucide-react';

interface HeroHeaderProps {
  onExploreTop4: () => void;
  onExploreFixtures: () => void;
}

export const HeroHeader: React.FC<HeroHeaderProps> = ({
  onExploreTop4,
  onExploreFixtures
}) => {
  return (
    <div className="relative overflow-hidden pt-8 pb-10 border-b border-slate-800/80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Background ambient glowing orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          {/* Trust badge */}
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-4 shadow-inner">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>HAULE COMMUNITY BENCHMARK: STRICT 75% MINIMUM CONFIDENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Professional Football Analysis &{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Verified Predictions
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Powered by statistical models, expected goals (xG), and Poisson goal expectancy.
            Every pick requires a verified probability threshold of 75% or higher, backed by automated match settlement.
          </p>

          {/* Call to action buttons */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onExploreTop4}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
            >
              🔥 View Today's Top 4 Predictions
            </button>
            <button
              onClick={onExploreFixtures}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-cyan-500/50 transition-all transform hover:-translate-y-0.5"
            >
              ⚽ Browse All Multi-Continent Fixtures
            </button>
          </div>
        </div>

        {/* 4 Pillars Stats Grid */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:border-cyan-500/30 transition-all">
            <div className="flex items-center space-x-2 text-cyan-400 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Confidence Filter
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">≥ 75.0%</div>
            <p className="text-[10px] text-slate-400 mt-1">Zero low-confidence padding</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:border-emerald-500/30 transition-all">
            <div className="flex items-center space-x-2 text-emerald-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Settled Win Rate
              </span>
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono">85.7%</div>
            <p className="text-[10px] text-slate-400 mt-1">Verified on final official scores</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:border-blue-500/30 transition-all">
            <div className="flex items-center space-x-2 text-blue-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                Auto Settlement
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">WON / LOST</div>
            <p className="text-[10px] text-slate-400 mt-1">Automated score checking</p>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-4 hover:border-purple-500/30 transition-all">
            <div className="flex items-center space-x-2 text-purple-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                AI Scouting Suite
              </span>
            </div>
            <div className="text-2xl font-black text-white font-mono">Multimodal</div>
            <p className="text-[10px] text-slate-400 mt-1">TTS + Slip Scanner + Chat</p>
          </div>
        </div>
      </div>
    </div>
  );
};
