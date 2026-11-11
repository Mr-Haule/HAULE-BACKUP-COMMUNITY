import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, KeyRound, Loader2 } from 'lucide-react';
import { api } from '../api';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        const res = await api.register(email, username, password);
        onSuccess(res.user);
        onClose();
      } else {
        const res = await api.login(email, password);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role: 'admin' | 'member') => {
    if (role === 'admin') {
      setEmail('admin@haulecommunity.com');
      setPassword('HauleAdmin2026!');
      setIsRegister(false);
    } else {
      setEmail('member@haulecommunity.com');
      setPassword('MemberPass2026!');
      setIsRegister(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl shadow-cyan-950/60 text-white relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-cyan-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-white">
              {isRegister ? 'Join Haule Backup Community' : 'Member Sign In'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Pre-fills */}
        <div className="mt-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Quick Test Accounts (Instant Sign-in):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-[11px] font-bold text-rose-300 text-center transition-colors"
            >
              👑 Admin Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('member')}
              className="py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/30 text-[11px] font-bold text-amber-300 text-center transition-colors"
            >
              ⭐ VIP Member Demo
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Community Username:
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. TacticalScout"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Email Address:
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Password:
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-slate-950 transition-all flex items-center justify-center space-x-1.5 shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              Already a member?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-cyan-400 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to Haule Backup Community?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-cyan-400 font-bold hover:underline"
              >
                Create Account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
