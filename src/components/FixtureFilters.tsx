import React from 'react';
import { Search, Globe, Filter, Calendar, Users, Layers, Activity } from 'lucide-react';

interface FixtureFiltersProps {
  selectedContinent: string;
  setSelectedContinent: (c: string) => void;
  selectedStatus: string;
  setSelectedStatus: (s: string) => void;
  selectedGender: string;
  setSelectedGender: (g: string) => void;
  selectedAgeCategory: string;
  setSelectedAgeCategory: (a: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDate: string;
  setSelectedDate: (d: string) => void;
  onReset: () => void;
}

const CONTINENTS = [
  'All',
  'Europe',
  'Africa',
  'South America',
  'North America',
  'Asia',
  'Oceania',
  'International'
];

const STATUSES = ['All', 'LIVE', 'UPCOMING', 'FINISHED', 'POSTPONED'];
const GENDERS = ['All', 'Men', 'Women'];
const AGE_CATEGORIES = ['All', 'Senior', 'U23', 'U21', 'U20'];

export const FixtureFilters: React.FC<FixtureFiltersProps> = ({
  selectedContinent,
  setSelectedContinent,
  selectedStatus,
  setSelectedStatus,
  selectedGender,
  setSelectedGender,
  selectedAgeCategory,
  setSelectedAgeCategory,
  searchQuery,
  setSearchQuery,
  selectedDate,
  setSelectedDate,
  onReset
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Top search & status row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search teams, leagues, competitions (e.g. Arsenal, Simba, Champions League)..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Date Selector */}
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-cyan-400 hidden sm:block" />
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
          <button
            onClick={() => setSelectedDate(today)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedDate === today
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Continents horizontal badges */}
      <div className="space-y-1.5">
        <div className="flex items-center space-x-1 text-slate-400 text-xs font-semibold">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>Continent / Region:</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {CONTINENTS.map(c => (
            <button
              key={c}
              onClick={() => setSelectedContinent(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedContinent === c
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30'
                  : 'bg-slate-950/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800/80'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary filter chips: Status, Gender, Age Category */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/60">
        {/* Status */}
        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center space-x-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>Match Status:</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {STATUSES.map(s => (
              <button
                key={s}
                onClick={() => setSelectedStatus(s)}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                  selectedStatus === s
                    ? s === 'LIVE'
                      ? 'bg-rose-500 text-white font-bold animate-pulse'
                      : 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                {s === 'LIVE' ? '● LIVE' : s}
              </button>
            ))}
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center space-x-1">
            <Users className="w-3 h-3 text-purple-400" />
            <span>Gender Category:</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {GENDERS.map(g => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  selectedGender === g
                    ? 'bg-purple-600 text-white font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Age Category */}
        <div>
          <label className="block text-[11px] text-slate-400 font-semibold mb-1 flex items-center space-x-1">
            <Layers className="w-3 h-3 text-amber-400" />
            <span>Age Tier:</span>
          </label>
          <div className="flex flex-wrap gap-1">
            {AGE_CATEGORIES.map(a => (
              <button
                key={a}
                onClick={() => setSelectedAgeCategory(a)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  selectedAgeCategory === a
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800/60'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
