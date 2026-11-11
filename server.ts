import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { footballService } from './server/footballApi.js';
import { calculateMatchPredictions, generateCuratedPredictions } from './server/predictionEngine.js';
import { db, hashPassword } from './server/db.js';
import { generateSpeechTTS, chatWithGemini, analyzeFootballImage } from './server/geminiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parsers (support large payloads for image base64 uploads)
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Initial automated settlement pass on server boot
(async () => {
  try {
    const fixtures = await footballService.getFixtures({});
    db.settleCompletedMatches(fixtures);
  } catch (e) {
    console.error('Initial auto-settlement pass error:', e);
  }
})();

// ================= API ROUTES ================= //

// 1. Health and API connection status
app.get('/api/status', (req: Request, res: Response) => {
  const status = footballService.getApiStatus();
  res.json({
    appName: 'HAULE BACKUP COMMUNITY',
    status: 'ONLINE',
    timestamp: new Date().toISOString(),
    apiStatus: status
  });
});

// 2. Fixtures discovery and multi-parameter filtering
app.get('/api/fixtures', async (req: Request, res: Response) => {
  try {
    const {
      date,
      continent,
      country,
      league,
      gender,
      ageCategory,
      status,
      search
    } = req.query;

    const fixtures = await footballService.getFixtures({
      date: date ? String(date) : undefined,
      continent: continent ? String(continent) : undefined,
      country: country ? String(country) : undefined,
      league: league ? String(league) : undefined,
      gender: gender ? String(gender) : undefined,
      ageCategory: ageCategory ? String(ageCategory) : undefined,
      status: status ? String(status) : undefined,
      search: search ? String(search) : undefined
    });

    const predictionsMap: Record<string, any> = {};
    for (const f of fixtures) {
      predictionsMap[f.id] = calculateMatchPredictions(f);
    }

    res.json({ count: fixtures.length, fixtures, predictions: predictionsMap });
  } catch (err: any) {
    console.error('Fixtures route error:', err);
    res.status(500).json({ error: 'Failed to retrieve fixtures', details: err.message });
  }
});

// 3. Single fixture with 75%+ prediction engine analysis
app.get('/api/fixtures/:id', async (req: Request, res: Response) => {
  try {
    const fixtures = await footballService.getFixtures({});
    const match = fixtures.find(f => f.id === req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match fixture not found' });
    }

    const predictions = calculateMatchPredictions(match);
    res.json({ match, predictions });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve fixture details', details: err.message });
  }
});

// 4. TOP 4 BEST PREDICTIONS and BONUS TOP 5
app.get('/api/predictions/curated', async (req: Request, res: Response) => {
  try {
    const fixtures = await footballService.getFixtures({});
    const curated = generateCuratedPredictions(fixtures);
    res.json(curated);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to compute curated predictions', details: err.message });
  }
});

// 5. Settled historical records and performance metrics
app.get('/api/predictions/settled', async (req: Request, res: Response) => {
  try {
    const fixtures = await footballService.getFixtures({});
    // Run settlement check
    db.settleCompletedMatches(fixtures);

    const history = db.getSettledHistory();
    const stats = db.getOverviewStats(fixtures);

    res.json({
      summary: stats,
      history
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load settled history', details: err.message });
  }
});

// 6. Manual or automated settlement trigger
app.post('/api/settlement/run', async (req: Request, res: Response) => {
  try {
    const fixtures = await footballService.getFixtures({});
    const settledCount = db.settleCompletedMatches(fixtures);
    res.json({
      success: true,
      settledCount,
      message: `Settlement execution completed. ${settledCount} records updated.`
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Settlement execution failed', details: err.message });
  }
});

// 7. Authentication: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.findUserByEmail(email);
  if (!user || user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email and password.' });
  }

  // Return user without passwordHash
  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// 8. Authentication: Register
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { email, username, password } = req.body;
  if (!email || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  if (db.findUserByEmail(email)) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = db.createUser(email, username, password);
  const { passwordHash, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

// 9. User favorites toggle
app.post('/api/auth/favorites', (req: Request, res: Response) => {
  const { userId, matchId } = req.body;
  if (!userId || !matchId) {
    return res.status(400).json({ error: 'userId and matchId are required' });
  }

  const updated = db.toggleFavorite(userId, matchId);
  res.json({ success: true, favorites: updated });
});

// 10. Admin Overview & Management
app.get('/api/admin/overview', async (req: Request, res: Response) => {
  try {
    const fixtures = await footballService.getFixtures({});
    const stats = db.getOverviewStats(fixtures);
    const users = db.getUsers().map(({ passwordHash, ...u }) => u);
    const logs = db.getAuditLogs();

    res.json({
      stats,
      users,
      logs
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load admin overview', details: err.message });
  }
});

// 11. Admin: Update user membership
app.post('/api/admin/membership', (req: Request, res: Response) => {
  const { userId, membership } = req.body;
  if (!userId || !membership) {
    return res.status(400).json({ error: 'userId and membership required' });
  }
  const ok = db.updateUserMembership(userId, membership);
  if (!ok) return res.status(404).json({ error: 'User not found' });
  res.json({ success: true, message: `Membership updated to ${membership}` });
});

// 12. Admin: Update match score and settle immediately
app.post('/api/admin/match-score', async (req: Request, res: Response) => {
  try {
    const { matchId, homeScore, awayScore, status } = req.body;
    const fixtures = await footballService.getFixtures({});
    const match = fixtures.find(f => f.id === matchId);
    if (!match) return res.status(404).json({ error: 'Match not found' });

    match.score = { home: Number(homeScore), away: Number(awayScore) };
    if (status) match.status = status;
    else match.status = 'FINISHED';

    db.settleCompletedMatches(fixtures);
    db.addAuditLog('MANUAL_SCORE_UPDATE', `Admin updated match ${matchId} score to ${homeScore}-${awayScore}`);

    res.json({ success: true, match });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update match score', details: err.message });
  }
});

// 13. GEMINI FEATURE 1: Text-to-Speech using gemini-3.8-flash-tts
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt is required for TTS' });
    }

    const ttsResult = await generateSpeechTTS(text, voiceName || 'Kore');
    res.json(ttsResult);
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'Failed to generate speech audio', details: err.message });
  }
});

// 14. GEMINI FEATURE 2: Multi-turn Chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, model } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message string is required' });
    }

    const reply = await chatWithGemini(message, history || [], model || 'gemini-3.8-flash');
    res.json({ reply });
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    res.status(500).json({ error: 'AI Scout analysis failed', details: err.message });
  }
});

// 15. GEMINI FEATURE 3: Slip and Lineup Image Analysis using gemini-4-argon
app.post('/api/gemini/analyze-slip', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, prompt } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required' });
    }

    // Strip prefix if client sent "data:image/...;base64,"
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
    const cleanMime = mimeType || 'image/jpeg';

    const analysis = await analyzeFootballImage(cleanBase64, cleanMime, prompt);
    res.json({ analysis });
  } catch (err: any) {
    console.error('Image analysis error:', err);
    res.status(500).json({ error: 'Slip image analysis failed', details: err.message });
  }
});

// ================= VITE DEV / PRODUCTION MOUNT ================= //

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Development mode: Mount Vite middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: Serve built static files
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HAULE BACKUP COMMUNITY running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
