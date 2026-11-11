export type Continent =
  | 'Europe'
  | 'Africa'
  | 'Asia'
  | 'North America'
  | 'South America'
  | 'Oceania'
  | 'International';

export type Gender = 'Men' | 'Women';
export type AgeCategory = 'Senior' | 'U23' | 'U21' | 'U20';
export type MatchStatus = 'LIVE' | 'UPCOMING' | 'FINISHED' | 'POSTPONED';

export interface TeamStats {
  rank?: number;
  recentForm: string[];
  goalsScoredAvg: number;
  goalsConcededAvg: number;
  expectedGoals: number;
  cleanSheetRate: number;
  bttsRate: number;
  homeOrAwayWinRate: number;
  h2hRecordLast5?: { wins: number; draws: number; losses: number };
}

export interface MatchFixture {
  id: string;
  date: string;
  time: string;
  timestamp: number;
  continent: Continent;
  country: string;
  league: string;
  leagueLogo?: string;
  competitionType: string;
  gender: Gender;
  ageCategory: AgeCategory;
  status: MatchStatus;
  minute?: number;
  venue: string;
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    stats: TeamStats;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    stats: TeamStats;
  };
  score?: {
    home: number;
    away: number;
  };
}

export type PredictionMarket =
  | 'Home Win'
  | 'Draw'
  | 'Away Win'
  | 'Double Chance (1X)'
  | 'Double Chance (X2)'
  | 'Double Chance (12)'
  | 'Over 1.5 Goals'
  | 'Over 2.5 Goals'
  | 'Under 2.5 Goals'
  | 'BTTS Yes'
  | 'BTTS No';

export type SettlementStatus = 'PENDING' | 'WON' | 'LOST' | 'VOID';

export interface PredictionOption {
  id: string;
  matchId: string;
  market: PredictionMarket;
  selection: string;
  confidence: number;
  odds: number;
  rationale: string;
  status: SettlementStatus;
  settledAt?: string;
}

export interface MatchPredictions {
  matchId: string;
  qualifies: boolean;
  message?: string;
  predictions: PredictionOption[];
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin';
  membership: 'Free' | 'VIP Pro' | 'Elite Analyst';
  favorites: string[];
  createdAt: string;
}

export interface SettledRecord extends PredictionOption {
  matchInfo: {
    league: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    finalScore: string;
  };
}

export interface SystemOverviewStats {
  totalUsers: number;
  activeMembers: number;
  totalMatches: number;
  totalPredictions: number;
  wonPredictions: number;
  lostPredictions: number;
  pendingPredictions: number;
  voidPredictions: number;
  winRate: number;
  apiStatus: {
    apiFootball: 'CONNECTED' | 'FALLBACK_MODE' | 'STANDBY';
    footyStats: 'CONNECTED' | 'FALLBACK_MODE' | 'STANDBY';
    geminiAi: 'CONNECTED' | 'READY';
  };
}
