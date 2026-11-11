import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, PredictionOption, MatchFixture } from './types.js';
import { footballService } from './footballApi.js';
import { calculateMatchPredictions } from './predictionEngine.js';
import { evaluatePrediction } from './settlement.js';

export interface DatabaseSchema {
  users: User[];
  predictions: PredictionOption[];
  settledHistory: (PredictionOption & {
    matchInfo: {
      league: string;
      homeTeam: string;
      awayTeam: string;
      date: string;
      finalScore: string;
    };
  })[];
  userSlips: {
    id: string;
    userId: string;
    name: string;
    items: PredictionOption[];
    createdAt: string;
  }[];
  auditLogs: {
    id: string;
    action: string;
    details: string;
    timestamp: string;
  }[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'haule_db.json');

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_HAULE_COMMUNITY_SALT').digest('hex');
}

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading database file, initializing defaults:', e);
    }
    return this.initializeDefaults();
  }

  private save(): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  private initializeDefaults(): DatabaseSchema {
    const adminUser: User = {
      id: 'usr-admin-01',
      email: 'admin@haulecommunity.com',
      username: 'HauleChiefAdmin',
      passwordHash: hashPassword('HauleAdmin2026!'),
      role: 'admin',
      membership: 'Elite Analyst',
      favorites: ['fix-eur-01', 'fix-afr-01'],
      createdAt: new Date().toISOString()
    };

    const regularUser: User = {
      id: 'usr-demo-01',
      email: 'member@haulecommunity.com',
      username: 'ProFootballer99',
      passwordHash: hashPassword('MemberPass2026!'),
      role: 'user',
      membership: 'VIP Pro',
      favorites: ['fix-eur-02', 'fix-wmn-01'],
      createdAt: new Date().toISOString()
    };

    // Pre-populate realistic settled historical predictions with >=75% confidence
    const settledHistory: DatabaseSchema['settledHistory'] = [
      {
        id: 'hist-01',
        matchId: 'fix-hist-01',
        market: 'Home Win',
        selection: 'Manchester City',
        confidence: 84,
        odds: 1.35,
        rationale: 'Man City undefeated in 12 home matches with 2.8 xG against Ipswich.',
        status: 'WON',
        settledAt: '2026-11-10T21:45:00Z',
        matchInfo: {
          league: 'Premier League',
          homeTeam: 'Manchester City',
          awayTeam: 'Ipswich Town',
          date: '2026-11-10',
          finalScore: '4 - 1'
        }
      },
      {
        id: 'hist-02',
        matchId: 'fix-hist-02',
        market: 'Over 1.5 Goals',
        selection: 'Over 1.5 Total Goals',
        confidence: 89,
        odds: 1.25,
        rationale: 'Both teams averaged combined match goals of 3.4 across last 10 games.',
        status: 'WON',
        settledAt: '2026-11-10T22:00:00Z',
        matchInfo: {
          league: 'La Liga',
          homeTeam: 'Atletico Madrid',
          awayTeam: 'Villarreal',
          date: '2026-11-10',
          finalScore: '2 - 2'
        }
      },
      {
        id: 'hist-03',
        matchId: 'fix-hist-03',
        market: 'Double Chance (1X)',
        selection: 'Bayern Munich or Draw',
        confidence: 91,
        odds: 1.20,
        rationale: 'Bayern unbeaten at Allianz Arena in 18 matches with superior defensive indicators.',
        status: 'WON',
        settledAt: '2026-11-09T19:30:00Z',
        matchInfo: {
          league: 'Bundesliga',
          homeTeam: 'Bayern Munich',
          awayTeam: 'Bayer Leverkusen',
          date: '2026-11-09',
          finalScore: '1 - 1'
        }
      },
      {
        id: 'hist-04',
        matchId: 'fix-hist-04',
        market: 'BTTS Yes',
        selection: 'Both Teams to Score - Yes',
        confidence: 78,
        odds: 1.62,
        rationale: 'Both sides converted in 85% of matches while conceding in 9 out of 10 matches.',
        status: 'WON',
        settledAt: '2026-11-09T20:45:00Z',
        matchInfo: {
          league: 'Serie A',
          homeTeam: 'Napoli',
          awayTeam: 'Atalanta',
          date: '2026-11-09',
          finalScore: '2 - 3'
        }
      },
      {
        id: 'hist-05',
        matchId: 'fix-hist-05',
        market: 'Under 2.5 Goals',
        selection: 'Under 2.5 Total Goals',
        confidence: 77,
        odds: 1.75,
        rationale: 'High clean-sheet probabilities and ultra-compact midblocks.',
        status: 'LOST',
        settledAt: '2026-11-08T18:00:00Z',
        matchInfo: {
          league: 'Ligue 1',
          homeTeam: 'Lille',
          awayTeam: 'Monaco',
          date: '2026-11-08',
          finalScore: '2 - 2'
        }
      },
      {
        id: 'hist-06',
        matchId: 'fix-hist-06',
        market: 'Home Win',
        selection: 'Al Ahly SC',
        confidence: 86,
        odds: 1.40,
        rationale: 'Al Ahly CAF Champions League home fortress with 95% win record in Cairo.',
        status: 'WON',
        settledAt: '2026-11-08T20:00:00Z',
        matchInfo: {
          league: 'CAF Champions League',
          homeTeam: 'Al Ahly SC',
          awayTeam: 'TP Mazembe',
          date: '2026-11-08',
          finalScore: '3 - 0'
        }
      },
      {
        id: 'hist-07',
        matchId: 'fix-hist-07',
        market: 'Double Chance (12)',
        selection: 'Either Team to Win (No Draw)',
        confidence: 82,
        odds: 1.30,
        rationale: 'Decisive rivalry with 0 draws in last 8 head-to-head encounters.',
        status: 'WON',
        settledAt: '2026-11-07T21:00:00Z',
        matchInfo: {
          league: 'Copa Libertadores',
          homeTeam: 'Palmeiras',
          awayTeam: 'Boca Juniors',
          date: '2026-11-07',
          finalScore: '2 - 1'
        }
      }
    ];

    const initialDb: DatabaseSchema = {
      users: [adminUser, regularUser],
      predictions: [],
      settledHistory,
      userSlips: [],
      auditLogs: [
        {
          id: 'log-01',
          action: 'SYSTEM_BOOT',
          details: 'HAULE BACKUP COMMUNITY Database initialized with seed records.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    return initialDb;
  }

  // User management
  getUsers(): User[] {
    return this.data.users;
  }

  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(email: string, username: string, password: string): User {
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      email,
      username,
      passwordHash: hashPassword(password),
      role: 'user',
      membership: 'Free',
      favorites: [],
      createdAt: new Date().toISOString()
    };
    this.data.users.push(newUser);
    this.addAuditLog('USER_REGISTERED', `User registered: ${email}`);
    this.save();
    return newUser;
  }

  updateUserMembership(userId: string, membership: User['membership']): boolean {
    const user = this.findUserById(userId);
    if (!user) return false;
    user.membership = membership;
    this.addAuditLog('MEMBERSHIP_UPDATE', `Updated user ${user.email} membership to ${membership}`);
    this.save();
    return true;
  }

  toggleFavorite(userId: string, matchId: string): string[] {
    const user = this.findUserById(userId);
    if (!user) return [];
    if (!user.favorites) user.favorites = [];
    if (user.favorites.includes(matchId)) {
      user.favorites = user.favorites.filter(id => id !== matchId);
    } else {
      user.favorites.push(matchId);
    }
    this.save();
    return user.favorites;
  }

  // Settled History
  getSettledHistory() {
    return this.data.settledHistory;
  }

  // Audit Logs
  getAuditLogs() {
    return this.data.auditLogs.slice(-50);
  }

  addAuditLog(action: string, details: string) {
    this.data.auditLogs.push({
      id: `log-${Date.now()}`,
      action,
      details,
      timestamp: new Date().toISOString()
    });
    this.save();
  }

  // Auto Settlement execution across finished matches
  settleCompletedMatches(fixtures: MatchFixture[]) {
    let settledCount = 0;
    const now = new Date().toISOString();

    for (const match of fixtures) {
      if (match.status === 'FINISHED' && match.score) {
        // Calculate the match predictions to settle against
        const analysis = calculateMatchPredictions(match);
        if (analysis.qualifies && analysis.predictions.length > 0) {
          for (const pred of analysis.predictions) {
            // Check if already in settled history
            const exists = this.data.settledHistory.some(h => h.id === pred.id);
            if (!exists) {
              const status = evaluatePrediction(pred, match);
              this.data.settledHistory.unshift({
                ...pred,
                status,
                settledAt: now,
                matchInfo: {
                  league: match.league,
                  homeTeam: match.homeTeam.name,
                  awayTeam: match.awayTeam.name,
                  date: match.date,
                  finalScore: `${match.score.home} - ${match.score.away}`
                }
              });
              settledCount++;
            }
          }
        }
      }
    }

    if (settledCount > 0) {
      this.addAuditLog('AUTO_SETTLEMENT', `Automatically settled ${settledCount} prediction market records.`);
      this.save();
    }

    return settledCount;
  }

  getOverviewStats(allFixtures: MatchFixture[]) {
    const history = this.data.settledHistory;
    const won = history.filter(h => h.status === 'WON').length;
    const lost = history.filter(h => h.status === 'LOST').length;
    const voided = history.filter(h => h.status === 'VOID').length;
    const totalSettled = won + lost;
    const winRate = totalSettled > 0 ? Number(((won / totalSettled) * 100).toFixed(1)) : 0;

    return {
      totalUsers: this.data.users.length,
      activeMembers: this.data.users.filter(u => u.membership !== 'Free').length,
      totalMatches: allFixtures.length,
      totalPredictions: history.length,
      wonPredictions: won,
      lostPredictions: lost,
      voidPredictions: voided,
      pendingPredictions: allFixtures.filter(f => f.status === 'UPCOMING' || f.status === 'LIVE').length,
      winRate,
      apiStatus: footballService.getApiStatus()
    };
  }
}

export const db = new Database();
