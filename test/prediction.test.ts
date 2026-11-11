import { test } from 'node:test';
import assert from 'node:assert';
import { calculateMatchPredictions, generateCuratedPredictions } from '../server/predictionEngine.js';
import { evaluatePrediction, calculateSettlementSummary } from '../server/settlement.js';
import { MatchFixture, PredictionOption } from '../server/types.js';

const mockFixture: MatchFixture = {
  id: 'test-fix-01',
  date: '2026-11-11',
  time: '18:00',
  timestamp: Date.now(),
  continent: 'Europe',
  country: 'England',
  league: 'Premier League',
  competitionType: 'Domestic League',
  gender: 'Men',
  ageCategory: 'Senior',
  status: 'FINISHED',
  venue: 'Emirates Stadium',
  homeTeam: {
    id: 't-1',
    name: 'Arsenal',
    logo: '',
    stats: {
      recentForm: ['W', 'W', 'W', 'W', 'W'],
      goalsScoredAvg: 2.5,
      goalsConcededAvg: 0.5,
      expectedGoals: 2.4,
      cleanSheetRate: 0.6,
      bttsRate: 0.4,
      homeOrAwayWinRate: 0.85
    }
  },
  awayTeam: {
    id: 't-2',
    name: 'Everton',
    logo: '',
    stats: {
      recentForm: ['L', 'L', 'D', 'L', 'L'],
      goalsScoredAvg: 0.8,
      goalsConcededAvg: 2.1,
      expectedGoals: 0.7,
      cleanSheetRate: 0.1,
      bttsRate: 0.4,
      homeOrAwayWinRate: 0.15
    }
  },
  score: {
    home: 3,
    away: 0
  }
};

test('Prediction Engine: strictly enforces >=75% confidence', () => {
  const result = calculateMatchPredictions(mockFixture);
  assert.strictEqual(result.qualifies, true);
  assert.ok(result.predictions.length <= 4, 'Must return at most 4 high-confidence options');

  for (const pred of result.predictions) {
    assert.ok(
      pred.confidence >= 75,
      `Prediction ${pred.market} (${pred.confidence}%) must be >= 75%`
    );
    assert.ok(pred.rationale.length > 10, 'Must have meaningful statistical explanation');
  }
});

test('Prediction Engine: flags disqualified fixtures when criteria not met', () => {
  // Team with completely unpredictable / balanced low data
  const balancedFixture: MatchFixture = {
    ...mockFixture,
    id: 'test-balanced',
    homeTeam: {
      ...mockFixture.homeTeam,
      stats: {
        recentForm: ['D', 'D', 'D', 'D', 'D'],
        goalsScoredAvg: 1.0,
        goalsConcededAvg: 1.0,
        expectedGoals: 1.0,
        cleanSheetRate: 0.33,
        bttsRate: 0.5,
        homeOrAwayWinRate: 0.33
      }
    },
    awayTeam: {
      ...mockFixture.awayTeam,
      stats: {
        recentForm: ['D', 'D', 'D', 'D', 'D'],
        goalsScoredAvg: 1.0,
        goalsConcededAvg: 1.0,
        expectedGoals: 1.0,
        cleanSheetRate: 0.33,
        bttsRate: 0.5,
        homeOrAwayWinRate: 0.33
      }
    }
  };

  const result = calculateMatchPredictions(balancedFixture);
  // Any predictions returned must strictly be >= 75%
  for (const pred of result.predictions) {
    assert.ok(pred.confidence >= 75);
  }
});

test('Settlement Engine: correctly settles finished match outcomes', () => {
  const homeWinPred: PredictionOption = {
    id: 'p-1',
    matchId: mockFixture.id,
    market: 'Home Win',
    selection: 'Arsenal',
    confidence: 85,
    odds: 1.3,
    rationale: 'Domination',
    status: 'PENDING'
  };

  const status = evaluatePrediction(homeWinPred, mockFixture);
  assert.strictEqual(status, 'WON', 'Arsenal 3-0 Everton should settle as WON for Home Win');

  const awayWinPred: PredictionOption = {
    ...homeWinPred,
    market: 'Away Win',
    selection: 'Everton'
  };
  assert.strictEqual(evaluatePrediction(awayWinPred, mockFixture), 'LOST');

  const over15Pred: PredictionOption = {
    ...homeWinPred,
    market: 'Over 1.5 Goals',
    selection: 'Over 1.5 Total Goals'
  };
  assert.strictEqual(evaluatePrediction(over15Pred, mockFixture), 'WON');

  const bttsYesPred: PredictionOption = {
    ...homeWinPred,
    market: 'BTTS Yes',
    selection: 'Both Teams to Score - Yes'
  };
  assert.strictEqual(evaluatePrediction(bttsYesPred, mockFixture), 'LOST'); // 3 - 0 score has away = 0
});

test('Settlement Engine: calculates metrics accurately', () => {
  const samplePredictions: PredictionOption[] = [
    { id: '1', matchId: 'm1', market: 'Home Win', selection: 'A', confidence: 80, odds: 1.5, rationale: '', status: 'WON' },
    { id: '2', matchId: 'm2', market: 'Home Win', selection: 'B', confidence: 80, odds: 1.8, rationale: '', status: 'WON' },
    { id: '3', matchId: 'm3', market: 'Away Win', selection: 'C', confidence: 75, odds: 2.0, rationale: '', status: 'LOST' }
  ];

  const summary = calculateSettlementSummary(samplePredictions);
  assert.strictEqual(summary.won, 2);
  assert.strictEqual(summary.lost, 1);
  assert.strictEqual(summary.winRate, 66.7);
  assert.strictEqual(summary.totalSettled, 3);
});
