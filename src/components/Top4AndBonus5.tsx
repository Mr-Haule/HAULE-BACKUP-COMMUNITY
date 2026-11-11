import React from 'react';
import {
  Flame,
  Award,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { MatchFixture, PredictionOption } from '../types';

interface Top4AndBonus5Props {
  top4: (PredictionOption & { match: MatchFixture })[];
  bonus5: (PredictionOption & { match: MatchFixture })[];
  onPlayAudio: (text: string, title: string) => void;
  onSelectMatch: (matchId: string) => void;
}

export const Top4AndBonus5: React.FC<Top4AndBonus5Props> = ({
  top4,
  bonus5,
  onPlayAudio,
  onSelectMatch
}) => {
  return (
    <div className="space-y-12">
      {/* SECTION 1: TOP 4 BEST PREDICTIONS */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600 p-0.5 shadow-lg shadow-orange-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  TOP 4 BEST PREDICTIONS
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  FLAGSHIP PICKS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                The 4 strongest selections of the day with peak statistical certainty and verified liquidity.
              </p>
            </div>
          </div>

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Strict Confidence Threshold: <strong className="text-emerald-400">≥ 75%</strong></span>
          </div>
        </div>

        {top4.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
            <p className="text-slate-400 text-sm">
              Analyzing daily match fixtures... No picks currently meeting the strict 75% benchmark.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {top4.map((item, idx) => {
              const audioScript = `Top pick number ${idx + 1}: ${item.match.homeTeam.name} versus ${
                item.match.awayTeam.name
              } in ${item.match.league}. Market: ${item.market}, selection: ${item.selection}.
Confidence rating is ${item.confidence} percent at odds of ${item.odds}.
Statistical breakdown: ${item.rationale}`;

              return (
                <div
                  key={item.id || idx}
                  className="relative group bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 hover:border-amber-400 transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Card Rank Header Badge */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-md shadow-orange-500/30">
                        #{idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-slate-200">
                          {item.match.league}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-2">
                          ({item.match.country})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{item.match.time} UTC</span>
                      </span>
                      <button
                        onClick={() =>
                          onPlayAudio(
                            audioScript,
                            `#${idx + 1} Pick: ${item.match.homeTeam.name} vs ${item.match.awayTeam.name}`
                          )
                        }
                        className="p-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 transition-colors"
                        title="Listen to audio analysis of this pick"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Teams Row */}
                  <div className="py-3 flex items-center justify-between">
                    <div className="font-extrabold text-sm sm:text-base text-white">
                      {item.match.homeTeam.name}{' '}
                      <span className="text-slate-500 font-normal text-xs">vs</span>{' '}
                      {item.match.awayTeam.name}
                    </div>
                  </div>

                  {/* Market & Selected Outcome Pill */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        {item.market}
                      </div>
                      <div className="text-sm font-black text-white mt-0.5">
                        {item.selection}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-black text-sm">
                        {item.confidence}% CONF.
                      </div>
                      <div className="text-xs font-mono text-slate-400 mt-1">
                        Odds: <span className="text-cyan-300 font-bold text-sm">{item.odds}</span>
                      </div>
                    </div>
                  </div>

                  {/* Short Statistical Analysis */}
                  <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                    <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-[11px] mb-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span>Statistical Rationale:</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{item.rationale}</p>
                  </div>

                  {/* Match Link */}
                  <div className="mt-3 pt-2 border-t border-slate-800/60 flex justify-end">
                    <button
                      onClick={() => onSelectMatch(item.matchId)}
                      className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      <span>Explore Fixture Statistics</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: BONUS TOP 5 */}
      <div className="pt-6 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 p-0.5 shadow-lg shadow-teal-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  BONUS TOP 5
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  QUALIFYING RESERVE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Additional qualifying high-probability selections. Never padded with fabricated or sub-75% fixtures.
              </p>
            </div>
          </div>
        </div>

        {bonus5.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center">
            <p className="text-slate-400 text-xs">
              No additional fixtures currently qualify for the Bonus Top 5 under our 75% threshold.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bonus5.map((item, idx) => (
              <div
                key={item.id || idx}
                className="bg-slate-900/70 border border-emerald-500/30 rounded-2xl p-4 hover:border-emerald-400 hover:bg-slate-900 transition-all hover:shadow-lg hover:shadow-emerald-950/40"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                  <span className="text-[11px] font-bold text-slate-300 truncate max-w-[150px]">
                    {item.match.league}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {item.match.time} UTC
                  </span>
                </div>

                <div className="py-2.5 font-bold text-xs sm:text-sm text-white truncate">
                  {item.match.homeTeam.name} vs {item.match.awayTeam.name}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-cyan-400 uppercase">
                      {item.market}
                    </span>
                    <div className="text-xs font-bold text-white mt-0.5 truncate max-w-[150px]">
                      {item.selection}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                      {item.confidence}%
                    </span>
                    <div className="text-[11px] font-mono text-cyan-300 font-bold mt-0.5">
                      {item.odds}
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  {item.rationale}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
