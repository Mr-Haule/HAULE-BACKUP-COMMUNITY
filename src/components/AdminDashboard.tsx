import React, { useState } from 'react';
import {
  ShieldAlert,
  Users,
  Activity,
  RotateCw,
  Server,
  CheckCircle2,
  AlertTriangle,
  Award,
  Layers,
  Database,
  Terminal,
  Settings
} from 'lucide-react';
import { MatchFixture, SystemOverviewStats, User } from '../types';
import { api } from '../api';

interface AdminDashboardProps {
  stats?: SystemOverviewStats;
  users: User[];
  fixtures: MatchFixture[];
  onRefreshData: () => Promise<void>;
  onTriggerSettlement: () => Promise<void>;
  isSettling: boolean;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  users,
  fixtures,
  onRefreshData,
  onTriggerSettlement,
  isSettling
}) => {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(fixtures[0]?.id || '');
  const [homeScoreInput, setHomeScoreInput] = useState<number>(2);
  const [awayScoreInput, setAwayScoreInput] = useState<number>(1);
  const [statusInput, setStatusInput] = useState<string>('FINISHED');
  const [isUpdatingScore, setIsUpdatingScore] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleUpdateScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId) return;

    setIsUpdatingScore(true);
    setMessage(null);

    try {
      await api.updateMatchScore(selectedMatchId, homeScoreInput, awayScoreInput, statusInput);
      setMessage(`Successfully updated score and triggered automatic settlement!`);
      await onRefreshData();
    } catch (err: any) {
      setMessage(`Error: ${err.message || 'Failed to update score'}`);
    } finally {
      setIsUpdatingScore(false);
    }
  };

  const handleMembershipChange = async (userId: string, newMembership: string) => {
    try {
      await api.updateMembership(userId, newMembership);
      await onRefreshData();
    } catch (err: any) {
      alert(`Failed to update membership: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Community Administrator Console
            </h2>
            <p className="text-xs text-slate-400">
              Platform telemetry, API connection metrics, settlement engine controls, and member management.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSettlement}
          disabled={isSettling}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 flex items-center space-x-1.5 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isSettling ? 'animate-spin' : ''}`} />
          <span>{isSettling ? 'Settling Fixtures...' : 'Execute Full Auto Settlement'}</span>
        </button>
      </div>

      {/* API Connection Health Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Server className="w-4 h-4 text-blue-400" />
            <div>
              <div className="text-xs font-bold text-white">API-FOOTBALL</div>
              <div className="text-[10px] text-slate-400">Fixtures & Live Feed</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-cyan-300 border border-blue-500/30">
            {stats?.apiStatus.apiFootball || 'CONNECTED'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white">FootyStats API</div>
              <div className="text-[10px] text-slate-400">xG & Advanced Metrics</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            {stats?.apiStatus.footyStats || 'CONNECTED'}
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-4 h-4 text-purple-400" />
            <div>
              <div className="text-xs font-bold text-white">Gemini Multimodal</div>
              <div className="text-[10px] text-slate-400">TTS & Vision Intelligence</div>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
            {stats?.apiStatus.geminiAi || 'READY'}
          </span>
        </div>
      </div>

      {/* Match Score & Settlement Tool */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 mb-4">
          <Settings className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-white">
            Manual Match Result Simulator & Settle Tool
          </h3>
        </div>

        <form onSubmit={handleUpdateScore} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              Select Match Fixture:
            </label>
            <select
              value={selectedMatchId}
              onChange={e => setSelectedMatchId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {fixtures.map(f => (
                <option key={f.id} value={f.id}>
                  [{f.league}] {f.homeTeam.name} vs {f.awayTeam.name} ({f.status})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 font-semibold mb-1">
              Final Score (Home - Away):
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={homeScoreInput}
                onChange={e => setHomeScoreInput(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-center text-xs text-white"
              />
              <span className="text-slate-500 font-black">-</span>
              <input
                type="number"
                min="0"
                value={awayScoreInput}
                onChange={e => setAwayScoreInput(Number(e.target.value))}
                className="w-16 bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-center text-xs text-white"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isUpdatingScore}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              {isUpdatingScore ? 'Updating...' : 'Set Score & Settle'}
            </button>
          </div>
        </form>

        {message && (
          <div className="mt-3 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono">
            {message}
          </div>
        )}
      </div>

      {/* Member Accounts Management */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-bold text-white">
              Registered Community Members ({users.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Username</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Membership Tier</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 font-bold text-white">{u.username}</td>
                  <td className="py-3 px-3 text-slate-400 font-mono">{u.email}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'admin'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.membership === 'Elite Analyst'
                          ? 'bg-purple-500/20 text-purple-300'
                          : u.membership === 'VIP Pro'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {u.membership}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <select
                      value={u.membership}
                      onChange={e => handleMembershipChange(u.id, e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300"
                    >
                      <option value="Free">Free</option>
                      <option value="VIP Pro">Upgrade to VIP Pro</option>
                      <option value="Elite Analyst">Upgrade to Elite Analyst</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
