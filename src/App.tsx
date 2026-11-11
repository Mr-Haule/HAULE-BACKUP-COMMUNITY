import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Activity,
  Flame,
  History,
  Bot,
  ScanLine,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Star,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroHeader } from './components/HeroHeader';
import { FixtureFilters } from './components/FixtureFilters';
import { MatchCard } from './components/MatchCard';
import { Top4AndBonus5 } from './components/Top4AndBonus5';
import { SettlementHistoryView } from './components/SettlementHistoryView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { SlipScannerModal } from './components/SlipScannerModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { AudioBriefingBar } from './components/AudioBriefingBar';
import { api } from './api';
import {
  MatchFixture,
  MatchPredictions,
  PredictionOption,
  SettledRecord,
  SystemOverviewStats,
  User
} from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('fixtures');
  const [fixtures, setFixtures] = useState<MatchFixture[]>([]);
  const [fixturePredictions, setFixturePredictions] = useState<Record<string, MatchPredictions>>({});
  const [top4, setTop4] = useState<(PredictionOption & { match: MatchFixture })[]>([]);
  const [bonus5, setBonus5] = useState<(PredictionOption & { match: MatchFixture })[]>([]);
  const [settledHistory, setSettledHistory] = useState<SettledRecord[]>([]);
  const [overviewStats, setOverviewStats] = useState<SystemOverviewStats | undefined>(undefined);
  const [registeredUsers, setRegisteredUsers] = useState<User[]>([]);

  // Filtering state
  const [selectedContinent, setSelectedContinent] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedGender, setSelectedGender] = useState<string>('All');
  const [selectedAgeCategory, setSelectedAgeCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Loading & Action state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSettling, setIsSettling] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSlipScannerOpen, setIsSlipScannerOpen] = useState<boolean>(false);

  // Audio briefing state (Gemini 3.8 Flash TTS)
  const [isAudioBarOpen, setIsAudioBarOpen] = useState<boolean>(false);
  const [audioScript, setAudioScript] = useState<string | undefined>(undefined);
  const [audioTitle, setAudioTitle] = useState<string | undefined>(undefined);

  // Scout chat prefill
  const [chatInitialPrompt, setChatInitialPrompt] = useState<string | undefined>(undefined);

  // Load saved user from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('haule_current_user');
      if (saved) {
        setCurrentUser(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleUserLogin = (user: User) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('haule_current_user', JSON.stringify(user));
    } catch (e) {}
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('haule_current_user');
    } catch (e) {}
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Fixtures with current filters and instant precomputed predictions
      const [fixData, curated, settled] = await Promise.all([
        api.getFixtures({
          continent: selectedContinent,
          status: selectedStatus,
          gender: selectedGender,
          ageCategory: selectedAgeCategory,
          date: selectedDate,
          search: searchQuery
        }),
        api.getCuratedPredictions(),
        api.getSettledPredictions()
      ]);

      setFixtures(fixData.fixtures);
      if (fixData.predictions) {
        setFixturePredictions(fixData.predictions);
      }

      // 2. Curated predictions (Top 4 & Bonus 5)
      setTop4(curated.top4);
      setBonus5(curated.bonus5);

      // 3. Settled predictions & overview stats
      setSettledHistory(settled.history);
      setOverviewStats(settled.summary);

      // 4. Admin telemetry if admin logged in
      try {
        const adminData = await api.getAdminOverview();
        setRegisteredUsers(adminData.users);
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [selectedContinent, selectedStatus, selectedGender, selectedAgeCategory, selectedDate]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleTriggerSettlement = async () => {
    setIsSettling(true);
    try {
      await api.triggerSettlement();
      await loadAllData();
    } catch (e) {
      console.error('Settlement trigger error:', e);
    } finally {
      setIsSettling(false);
    }
  };

  const handleToggleFavorite = async (matchId: string) => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    try {
      const res = await api.toggleFavorite(currentUser.id, matchId);
      const updatedUser = { ...currentUser, favorites: res.favorites };
      handleUserLogin(updatedUser);
    } catch (e) {
      console.error(e);
    }
  };

  const handlePlayAudio = (text: string, title: string) => {
    setAudioScript(text);
    setAudioTitle(title);
    setIsAudioBarOpen(true);
  };

  const handleAskScout = (match: MatchFixture) => {
    setChatInitialPrompt(
      `Provide a comprehensive statistical breakdown for ${match.homeTeam.name} vs ${match.awayTeam.name} in ${match.league}. Evaluate home xG (${match.homeTeam.stats.expectedGoals}) against away defensive stats and determine if any 75%+ confidence value exists.`
    );
    setActiveTab('chat');
  };

  const resetFilters = () => {
    setSelectedContinent('All');
    setSelectedStatus('All');
    setSelectedGender('All');
    setSelectedAgeCategory('All');
    setSearchQuery('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleUserLogout}
        onPlayDailyBriefing={() => {
          setAudioScript(undefined);
          setAudioTitle('Haule Daily Football Briefing');
          setIsAudioBarOpen(true);
        }}
        isPlayingAudio={isAudioBarOpen}
      />

      {/* Floating Audio Briefing Bar (Gemini 3.8 Flash TTS) */}
      <AudioBriefingBar
        isOpen={isAudioBarOpen}
        onClose={() => setIsAudioBarOpen(false)}
        defaultText={audioScript}
        matchTitle={audioTitle}
      />

      {/* Betting Slip & Lineup Scanner Modal (Gemini 4 Argon) */}
      <SlipScannerModal
        isOpen={isSlipScannerOpen}
        onClose={() => setIsSlipScannerOpen(false)}
        onPlayAudio={handlePlayAudio}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleUserLogin}
      />

      {/* Main Hero Header */}
      <HeroHeader
        onExploreTop4={() => setActiveTab('curated')}
        onExploreFixtures={() => setActiveTab('fixtures')}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* TAB 1: Fixtures & Predictions Discovery */}
        {activeTab === 'fixtures' && (
          <div className="space-y-6">
            <FixtureFilters
              selectedContinent={selectedContinent}
              setSelectedContinent={setSelectedContinent}
              selectedStatus={selectedStatus}
              setSelectedStatus={setSelectedStatus}
              selectedGender={selectedGender}
              setSelectedGender={setSelectedGender}
              selectedAgeCategory={selectedAgeCategory}
              setSelectedAgeCategory={setSelectedAgeCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onReset={resetFilters}
            />

            {/* Results count & quick actions */}
            {!isLoading && (
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div>
                  Showing <span className="font-bold text-white">{fixtures.length}</span> matches across{' '}
                  <span className="text-cyan-400 font-semibold">{selectedContinent}</span>
                </div>
                <button
                  onClick={() => setIsSlipScannerOpen(true)}
                  className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-300 hover:bg-slate-800 text-xs font-semibold"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  <span>Upload Betting Slip or Pitch Lineup</span>
                </button>
              </div>
            )}

            {/* Matches Grid */}
            {isLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400 mb-3" />
                <p className="text-sm text-slate-400 font-medium">
                  Retrieving real fixtures & computing 75%+ prediction models...
                </p>
              </div>
            ) : fixtures.length === 0 ? (
              <div className="p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center max-w-lg mx-auto">
                <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">No Fixtures Match Your Filter</h3>
                <p className="text-xs text-slate-400 mt-1.5">
                  Try adjusting the continent, age category, or reset the search query to explore other competitions.
                </p>
                <button
                  onClick={resetFilters}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {fixtures.map(match => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    predictions={fixturePredictions[match.id]}
                    isFavorite={currentUser?.favorites?.includes(match.id) ?? false}
                    onToggleFavorite={handleToggleFavorite}
                    onPlayAudio={handlePlayAudio}
                    onAskScout={handleAskScout}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TOP 4 & BONUS TOP 5 */}
        {activeTab === 'curated' && (
          <Top4AndBonus5
            top4={top4}
            bonus5={bonus5}
            onPlayAudio={handlePlayAudio}
            onSelectMatch={matchId => {
              setActiveTab('fixtures');
            }}
          />
        )}

        {/* TAB 3: Settled History & Performance */}
        {activeTab === 'history' && (
          <SettlementHistoryView
            summary={overviewStats}
            history={settledHistory}
            onTriggerSettlement={handleTriggerSettlement}
            isSettling={isSettling}
          />
        )}

        {/* TAB 4: Gemini AI Football Scout & Multi-turn Chat */}
        {activeTab === 'chat' && (
          <GeminiChatbot
            onPlayAudio={handlePlayAudio}
            initialPrompt={chatInitialPrompt}
          />
        )}

        {/* TAB 5: Slip Scanner Full View */}
        {activeTab === 'slip-scanner' && (
          <div className="max-w-2xl mx-auto py-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-white">Slip & Tactical Board Scanner</h2>
              <p className="text-xs text-slate-400 mt-1">
                Upload photos of your slips or squad sheets for analysis via Gemini 4 Argon.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center">
              <button
                onClick={() => setIsSlipScannerOpen(true)}
                className="px-6 py-3 rounded-2xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/20"
              >
                Open Photo Scanner Modal
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: Admin Dashboard */}
        {activeTab === 'admin' && (
          <AdminDashboard
            stats={overviewStats}
            users={registeredUsers}
            fixtures={fixtures}
            onRefreshData={loadAllData}
            onTriggerSettlement={handleTriggerSettlement}
            isSettling={isSettling}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span className="font-extrabold text-sm text-white">HAULE BACKUP COMMUNITY</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A professional football analytics and match prediction platform built upon data-driven probabilities, Poisson distributions, and automated match settlement.
            </p>
            <p className="text-[11px] text-slate-500">
              Strict 75% minimum qualifying confidence. No artificial inflation.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Platform Features
            </h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>Top 4 Best Predictions (Flagship)</li>
              <li>Bonus Top 5 Qualifying Reserve</li>
              <li>Multi-Continent Match Discovery</li>
              <li>Automated Score Settlement Ledger</li>
              <li>AI Football Scout with Gemini</li>
              <li>Voice Briefings (gemini-3.8-flash-tts)</li>
              <li>Slip & Lineup Vision (gemini-4-argon)</li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Responsible Gaming
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Predictions are statistical estimations and not financial guarantees. Never wager more than you can comfortably afford to lose. 18+ only.
            </p>
            <div className="mt-3 text-[10px] text-slate-500 font-mono">
              Server Version 2.4.0 • Settlement Active
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
