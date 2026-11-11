import { MatchFixture, MatchPredictions, PredictionOption, SettledRecord, SystemOverviewStats, User } from './types';

export const api = {
  async getStatus() {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Failed to fetch status');
    return res.json();
  },

  async getFixtures(params: {
    date?: string;
    continent?: string;
    country?: string;
    league?: string;
    gender?: string;
    ageCategory?: string;
    status?: string;
    search?: string;
  } = {}): Promise<{ count: number; fixtures: MatchFixture[]; predictions: Record<string, MatchPredictions> }> {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v && v !== 'All') query.append(k, v);
    });

    const res = await fetch(`/api/fixtures?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch fixtures');
    return res.json();
  },

  async getFixtureDetails(id: string): Promise<{ match: MatchFixture; predictions: MatchPredictions }> {
    const res = await fetch(`/api/fixtures/${id}`);
    if (!res.ok) throw new Error('Failed to fetch fixture details');
    return res.json();
  },

  async getCuratedPredictions(): Promise<{
    top4: (PredictionOption & { match: MatchFixture })[];
    bonus5: (PredictionOption & { match: MatchFixture })[];
  }> {
    const res = await fetch('/api/predictions/curated');
    if (!res.ok) throw new Error('Failed to fetch curated predictions');
    return res.json();
  },

  async getSettledPredictions(): Promise<{ summary: SystemOverviewStats; history: SettledRecord[] }> {
    const res = await fetch('/api/predictions/settled');
    if (!res.ok) throw new Error('Failed to fetch settled predictions');
    return res.json();
  },

  async triggerSettlement(): Promise<{ success: boolean; settledCount: number; message: string }> {
    const res = await fetch('/api/settlement/run', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to trigger settlement');
    return res.json();
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
  },

  async register(email: string, username: string, password: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, username, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    return data;
  },

  async toggleFavorite(userId: string, matchId: string): Promise<{ success: boolean; favorites: string[] }> {
    const res = await fetch('/api/auth/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, matchId })
    });
    return res.json();
  },

  async getAdminOverview(): Promise<{ stats: SystemOverviewStats; users: User[]; logs: any[] }> {
    const res = await fetch('/api/admin/overview');
    if (!res.ok) throw new Error('Failed to fetch admin overview');
    return res.json();
  },

  async updateMembership(userId: string, membership: string) {
    const res = await fetch('/api/admin/membership', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, membership })
    });
    return res.json();
  },

  async updateMatchScore(matchId: string, homeScore: number, awayScore: number, status?: string) {
    const res = await fetch('/api/admin/match-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, homeScore, awayScore, status })
    });
    return res.json();
  },

  // Gemini TTS (model gemini-3.8-flash-tts)
  async generateTTS(text: string, voiceName: string = 'Kore'): Promise<{ audioBase64: string; mimeType: string }> {
    const res = await fetch('/api/gemini/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceName })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate speech');
    return data;
  },

  // Gemini Multi-turn Chat
  async sendChat(message: string, history: any[] = [], model: string = 'gemini-3.8-flash'): Promise<{ reply: string }> {
    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, model })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'AI Chat failed');
    return data;
  },

  // Gemini Slip / Lineup Image Analysis (model gemini-4-argon)
  async analyzeSlipImage(imageBase64: string, mimeType: string, prompt?: string): Promise<{ analysis: string }> {
    const res = await fetch('/api/gemini/analyze-slip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, mimeType, prompt })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Image analysis failed');
    return data;
  }
};
