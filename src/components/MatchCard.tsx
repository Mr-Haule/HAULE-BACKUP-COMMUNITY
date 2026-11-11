import React, { useState } from 'react';
import {
  Star,
  Volume2,
  TrendingUp,
  AlertCircle,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Percent,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Bot
} from 'lucide-react';
import { MatchFixture, MatchPredictions, PredictionOption } from '../types';

interface MatchCardProps {
  match: MatchFixture;
  predictions?: MatchPredictions;
  isFavorite: boolean;
  onToggleFavorite: (matchId: string) => void;
  onPlayAudio: (text: string, title: string) => void;
  onAskScout: (match: MatchFixture) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  predictions,
  isFavorite,
  onToggleFavorite,
  onPlayAudio,
  onAskScout
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const home = match.homeTeam;
  const away = match.awayTeam;

  const audioScript = `Scouting analysis for ${home.name} versus ${away.name} in ${match.league}.
${home.name} enters with ${home.stats.goalsScoredAvg} goals per game and ${home.stats.expectedGoals} expected goals.
${away.name} is conceding an average of ${away.stats.goalsConcededAvg} goals.
${
  predictions?.qualifies && predictions.predictions.length > 0
    ? `The top qualifying prediction with over 75% confidence is ${predictions.predictions[0].selection} at odds ${predictions.predictions[0].odds}. Rationale: ${predictions.predictions[0].rationale}`
    : 'No betting market reached our mandatory 75% statistical confidence threshold for this fixture.'
}`;

  const renderFormPills = (form: string[]) => (
    <div className="flex items-center space-x-1">
      {form.map((f, i) => (
        <span
          key={i}
          className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center text-white ${
            f === 'W'
              ? 'bg-emerald-600'
              : f === 'D'
              ? 'bg-amber-600'
              : 'bg-rose-600'
          }`}
          title={f === 'W' ? 'Won' : f === 'D' ? 'Draw' : 'Lost'}
        >
          {f}
        </span>
      ))}
    </div>
  );

  return (
    <div className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800/90 hover:border-cyan-500/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-950/40 hover:-translate-y-1">
      {/* Card Header: League & Status */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
        <div className="flex items-center space-x-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-900/60 text-cyan-300 border border-blue-700/40">
            {match.continent}
          </span>
          <span className="font-semibold text-slate-300 truncate max-w-[150px] sm:max-w-[200px]">
            {match.league}
          </span>
          {match.gender === 'Women' && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-purple-900/50 text-purple-300 border border-purple-700/40">
              Women
            </span>
          )}
          {match.ageCategory !== 'Senior' && (
            <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-900/50 text-amber-300 border border-amber-700/40">
              {match.ageCategory}
            </span>
          )}
        </div>

        {/* Status / Time / Favorite button */}
        <div className="flex items-center space-x-2">
          {match.status === 'LIVE' ? (
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
              <span className="w-1.5 h-1.5 bg-rose-500 rounded-full"></span>
              <span>LIVE {match.minute ? `${match.minute}'` : ''}</span>
            </span>
          ) : match.status === 'FINISHED' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
              FT (Finished)
            </span>
          ) : match.status === 'POSTPONED' ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-900/40 text-amber-300 border border-amber-600/30">
              Postponed
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-slate-400 font-mono text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{match.time} UTC</span>
            </span>
          )}

          <button
            onClick={() => onToggleFavorite(match.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              isFavorite
                ? 'text-amber-400 bg-amber-400/10'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Match Faceoff */}
      <div className="py-4 grid grid-cols-7 items-center gap-2">
        {/* Home Team */}
        <div className="col-span-3 text-right">
          <div className="flex items-center justify-end space-x-2">
            <span className="font-extrabold text-sm sm:text-base text-white truncate">
              {home.name}
            </span>
            {home.logo ? (
              <img
                src={home.logo}
                alt={home.name}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full bg-slate-800 p-0.5"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-blue-600/30 flex items-center justify-center text-xs font-bold text-cyan-400">
                {home.name.substring(0, 2)}
              </div>
            )}
          </div>
          <div className="mt-1 flex items-center justify-end space-x-2 text-[10px] text-slate-400">
            {home.stats.rank && (
              <span className="font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                #{home.stats.rank}
              </span>
            )}
            {renderFormPills(home.stats.recentForm)}
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">
            xG: <span className="text-cyan-300 font-semibold">{home.stats.expectedGoals}</span> • Win:{' '}
            <span className="text-emerald-400">{(home.stats.homeOrAwayWinRate * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Center Score or VS */}
        <div className="col-span-1 text-center">
          {match.score ? (
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl py-1 px-1.5 font-mono">
              <span className="text-base sm:text-lg font-black text-white">
                {match.score.home} - {match.score.away}
              </span>
            </div>
          ) : (
            <div className="w-8 h-8 mx-auto rounded-full bg-slate-950/90 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">
              VS
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="col-span-3 text-left">
          <div className="flex items-center justify-start space-x-2">
            {away.logo ? (
              <img
                src={away.logo}
                alt={away.name}
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full bg-slate-800 p-0.5"
                onError={e => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-indigo-600/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                {away.name.substring(0, 2)}
              </div>
            )}
            <span className="font-extrabold text-sm sm:text-base text-white truncate">
              {away.name}
            </span>
          </div>
          <div className="mt-1 flex items-center justify-start space-x-2 text-[10px] text-slate-400">
            {renderFormPills(away.stats.recentForm)}
            {away.stats.rank && (
              <span className="font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                #{away.stats.rank}
              </span>
            )}
          </div>
          <div className="mt-1 text-[10px] text-slate-400 font-mono">
            xG: <span className="text-cyan-300 font-semibold">{away.stats.expectedGoals}</span> • Win:{' '}
            <span className="text-emerald-400">{(away.stats.homeOrAwayWinRate * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Venue note */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
        <div className="flex items-center space-x-1 truncate max-w-[280px]">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{match.venue}</span>
        </div>

        {/* Quick audio preview trigger */}
        <button
          onClick={() => onPlayAudio(audioScript, `${home.name} vs ${away.name}`)}
          className="flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-cyan-500/20 transition-colors"
          title="Listen to AI voice briefing for this match"
        >
          <Volume2 className="w-3 h-3" />
          <span className="hidden sm:inline">Match Audio</span>
        </button>
      </div>

      {/* Strict 75%+ Predictions Section */}
      <div className="mt-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span className="text-xs font-bold text-slate-200">
              Scout Prediction (≥ 75% Confidence)
            </span>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-medium"
          >
            <span>{isExpanded ? 'Hide Details' : 'View Full Breakdown'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Summary pill or not qualified banner */}
        {predictions && !predictions.qualifies && (
          <div className="mt-2 p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-300 text-xs flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p className="text-[11px] leading-relaxed">
              No selection qualifies the strict 75% confidence threshold for this match. We never artificially inflate probabilities or force selections when data is insufficient.
            </p>
          </div>
        )}

        {predictions && predictions.qualifies && predictions.predictions.length > 0 && (
          <div className="mt-2 space-y-2">
            {/* Primary selection preview */}
            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-2">
                  <span className="text-cyan-400">{predictions.predictions[0].market}:</span>
                  <span>{predictions.predictions[0].selection}</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {predictions.predictions[0].rationale}
                </div>
              </div>

              <div className="text-right shrink-0 ml-3">
                <div className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black font-mono">
                  {predictions.predictions[0].confidence}%
                </div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Odds: <span className="text-cyan-300 font-bold">{predictions.predictions[0].odds}</span>
                </div>
              </div>
            </div>

            {/* Expanded: Up to 4 high-confidence options */}
            {isExpanded && (
              <div className="space-y-2 pt-2 animate-in fade-in duration-200">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Qualifying Market Options ({predictions.predictions.length} / 4 eligible):
                </div>

                {predictions.predictions.map((opt, idx) => (
                  <div
                    key={opt.id || idx}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-blue-900/60 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                          #{idx + 1}
                        </span>
                        <span className="text-xs font-bold text-white">
                          {opt.market} - <span className="text-cyan-400">{opt.selection}</span>
                        </span>
                      </div>

                      <div className="flex items-center space-x-3 text-right">
                        <span className="text-xs font-mono font-black text-emerald-400">
                          {opt.confidence}%
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          {opt.odds}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 mt-1.5 leading-relaxed bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                      💡 {opt.rationale}
                    </p>
                  </div>
                ))}

                {/* Ask Scout action button */}
                <button
                  onClick={() => onAskScout(match)}
                  className="w-full mt-2 py-2 rounded-xl text-xs font-bold bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-600/40 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask AI Football Scout About {match.homeTeam.name} vs {match.awayTeam.name}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
