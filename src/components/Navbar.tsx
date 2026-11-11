import React from 'react';
import {
  Trophy,
  Flame,
  Activity,
  History,
  Bot,
  ScanLine,
  ShieldAlert,
  User as UserIcon,
  Volume2,
  LogOut,
  Sparkles,
  Radio
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onPlayDailyBriefing: () => void;
  isPlayingAudio: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onOpenAuth,
  onLogout,
  onPlayDailyBriefing,
  isPlayingAudio
}) => {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/80">
      {/* Top micro-bar for community notification */}
      <div className="bg-gradient-to-r from-blue-900/60 via-cyan-900/40 to-slate-900/80 px-4 py-1 text-xs text-slate-300 border-b border-blue-500/10 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <Radio className="w-2.5 h-2.5 mr-1 text-cyan-400 animate-pulse" />
            STRICT 75%+ CONFIDENCE ENGINE
          </span>
          <span className="hidden sm:inline text-slate-400">
            Verified multileague analytics & automated match settlement
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-emerald-400 font-mono text-[11px] font-semibold">
            ● SETTLEMENT ACTIVE
          </span>
          <button
            onClick={onPlayDailyBriefing}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${
              isPlayingAudio
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30 animate-pulse'
                : 'bg-slate-800/80 text-cyan-300 hover:bg-slate-800 border border-cyan-500/30'
            }`}
            title="Listen to daily audio briefing generated via gemini-3.8-flash-tts"
          >
            <Volume2 className="w-3 h-3" />
            <span>{isPlayingAudio ? 'Audio Playing...' : 'Daily Audio Briefing'}</span>
          </button>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand */}
          <div
            onClick={() => setActiveTab('fixtures')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Trophy className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                  HAULE BACKUP
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-black uppercase bg-blue-600/30 text-blue-400 border border-blue-500/30">
                  COMMUNITY
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 tracking-wider font-medium">
                DATA-DRIVEN FOOTBALL PREDICTIONS
              </p>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('fixtures')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'fixtures'
                  ? 'bg-blue-600/20 text-cyan-300 border border-blue-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Fixtures & Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('curated')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'curated'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Top 4 & Bonus 5</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Settled Results</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Scout Chat</span>
            </button>

            <button
              onClick={() => setActiveTab('slip-scanner')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'slip-scanner'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
              }`}
            >
              <ScanLine className="w-3.5 h-3.5 text-cyan-400" />
              <span>Slip Scanner</span>
            </button>

            {currentUser?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'admin'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>Admin Console</span>
              </button>
            )}
          </nav>

          {/* Right account area */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block text-right">
                  <div className="text-xs font-bold text-white flex items-center justify-end space-x-1">
                    <span>{currentUser.username}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-black uppercase ${
                        currentUser.membership === 'Elite Analyst'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : currentUser.membership === 'VIP Pro'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {currentUser.membership}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-800 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-slate-950 hover:from-blue-500 hover:to-cyan-400 transition-all shadow-md shadow-cyan-500/20"
              >
                <UserIcon className="w-3.5 h-3.5 text-slate-950" />
                <span>Sign In / Join</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile horizontal scroller tabs */}
        <div className="flex lg:hidden overflow-x-auto py-2 space-x-1 border-t border-slate-800/60 no-scrollbar">
          <button
            onClick={() => setActiveTab('fixtures')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'fixtures' ? 'bg-blue-600/30 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Fixtures
          </button>
          <button
            onClick={() => setActiveTab('curated')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'curated' ? 'bg-amber-600/30 text-amber-300 font-bold' : 'text-slate-400'
            }`}
          >
            Top 4 & Bonus 5
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'history' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400'
            }`}
          >
            Settled History
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'chat' ? 'bg-purple-600/30 text-purple-300 font-bold' : 'text-slate-400'
            }`}
          >
            AI Scout
          </button>
          <button
            onClick={() => setActiveTab('slip-scanner')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
              activeTab === 'slip-scanner' ? 'bg-cyan-600/30 text-cyan-300 font-bold' : 'text-slate-400'
            }`}
          >
            Slip Scanner
          </button>
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap ${
                activeTab === 'admin' ? 'bg-rose-600/30 text-rose-300 font-bold' : 'text-slate-400'
              }`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
