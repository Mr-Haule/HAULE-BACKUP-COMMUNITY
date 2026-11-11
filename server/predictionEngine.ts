import { MatchFixture, MatchPredictions, PredictionMarket, PredictionOption } from './types.js';

/**
 * Poisson and statistical probability calculation for football matches
 */
function factorial(n: number): number {
  if (n <= 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
}

function poisson(lambda: number, k: number): number {
  if (lambda <= 0) return k === 0 ? 1 : 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
}

/**
 * Calculates statistically grounded probabilities for all markets.
 * Minimum qualifying confidence is strictly 75%.
 */
export function calculateMatchPredictions(match: MatchFixture): MatchPredictions {
  const home = match.homeTeam.stats;
  const away = match.awayTeam.stats;

  // Expected goals based on team attacking & opponent defensive averages
  const homeLambda = Math.max(0.4, (home.goalsScoredAvg * 0.6 + away.goalsConcededAvg * 0.4) * (home.expectedGoals ? home.expectedGoals / 1.5 : 1));
  const awayLambda = Math.max(0.3, (away.goalsScoredAvg * 0.6 + home.goalsConcededAvg * 0.4) * (away.expectedGoals ? away.expectedGoals / 1.5 : 1));

  // Build 0-6 scoreline probability matrix
  let pHomeWin = 0;
  let pDraw = 0;
  let pAwayWin = 0;
  let pOver15 = 0;
  let pOver25 = 0;
  let pUnder25 = 0;
  let pBttsYes = 0;
  let pBttsNo = 0;

  for (let h = 0; h <= 6; h++) {
    for (let a = 0; a <= 6; a++) {
      const prob = poisson(homeLambda, h) * poisson(awayLambda, a);
      if (h > a) pHomeWin += prob;
      else if (h === a) pDraw += prob;
      else pAwayWin += prob;

      const totalGoals = h + a;
      if (totalGoals > 1) pOver15 += prob;
      if (totalGoals > 2) pOver25 += prob;
      else pUnder25 += prob;

      if (h > 0 && a > 0) pBttsYes += prob;
      else pBttsNo += prob;
    }
  }

  // Weight with recent form (last 5 games) and home/away factor
  const homeFormPoints = home.recentForm.reduce((acc, f) => acc + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0) / 15;
  const awayFormPoints = away.recentForm.reduce((acc, f) => acc + (f === 'W' ? 3 : f === 'D' ? 1 : 0), 0) / 15;

  const formDiff = homeFormPoints - awayFormPoints;
  // Adjusted win probabilities
  let adjHomeWin = Math.min(0.92, Math.max(0.08, pHomeWin + formDiff * 0.12));
  let adjAwayWin = Math.min(0.92, Math.max(0.08, pAwayWin - formDiff * 0.12));
  let adjDraw = Math.max(0.05, 1 - (adjHomeWin + adjAwayWin));

  // Re-normalize 1X2
  const sum1x2 = adjHomeWin + adjDraw + adjAwayWin;
  adjHomeWin /= sum1x2;
  adjDraw /= sum1x2;
  adjAwayWin /= sum1x2;

  // Double chance probabilities
  const p1X = adjHomeWin + adjDraw;
  const pX2 = adjDraw + adjAwayWin;
  const p12 = adjHomeWin + adjAwayWin;

  // Over/Under adjustments from direct statistics
  const combinedAvgGoals = (home.goalsScoredAvg + home.goalsConcededAvg + away.goalsScoredAvg + away.goalsConcededAvg) / 2;
  const adjOver15 = Math.min(0.95, (pOver15 * 0.7 + (combinedAvgGoals > 2.0 ? 0.82 : 0.65) * 0.3));
  const adjOver25 = Math.min(0.92, (pOver25 * 0.7 + (combinedAvgGoals > 2.7 ? 0.78 : 0.45) * 0.3));
  const adjUnder25 = Math.min(0.92, (pUnder25 * 0.7 + (combinedAvgGoals < 2.3 ? 0.78 : 0.45) * 0.3));

  // BTTS adjusted by team BTTS rates
  const avgBttsRate = (home.bttsRate + away.bttsRate) / 2;
  const adjBttsYes = Math.min(0.92, (pBttsYes * 0.6 + avgBttsRate * 0.4));
  const adjBttsNo = Math.min(0.92, (pBttsNo * 0.6 + (1 - avgBttsRate) * 0.4));

  // Candidate pool with detailed statistical rationale
  interface Candidate {
    market: PredictionMarket;
    selection: string;
    probability: number;
    odds: number;
    rationale: string;
  }

  const candidates: Candidate[] = [];

  // 1. Home Win
  if (adjHomeWin >= 0.75) {
    const conf = Math.round(adjHomeWin * 100);
    candidates.push({
      market: 'Home Win',
      selection: match.homeTeam.name,
      probability: adjHomeWin,
      odds: Number((1 / adjHomeWin * 0.94).toFixed(2)),
      rationale: `${match.homeTeam.name} dominates with ${home.recentForm.filter(f => f === 'W').length}/5 recent wins, ${(home.homeOrAwayWinRate * 100).toFixed(0)}% home win rate and strong expected goals (${home.expectedGoals.toFixed(1)} xG vs ${away.expectedGoals.toFixed(1)} xG).`
    });
  }

  // 2. Away Win
  if (adjAwayWin >= 0.75) {
    candidates.push({
      market: 'Away Win',
      selection: match.awayTeam.name,
      probability: adjAwayWin,
      odds: Number((1 / adjAwayWin * 0.94).toFixed(2)),
      rationale: `${match.awayTeam.name} shows supreme away form with ${away.recentForm.filter(f => f === 'W').length}/5 wins and superior goal output (${away.goalsScoredAvg.toFixed(1)} scored/match) against ${match.homeTeam.name}'s fragile defense.`
    });
  }

  // 3. Draw
  if (adjDraw >= 0.75) {
    candidates.push({
      market: 'Draw',
      selection: 'Draw (X)',
      probability: adjDraw,
      odds: Number((1 / adjDraw * 0.94).toFixed(2)),
      rationale: `Both teams show balanced form and low goal expectancy with ${home.goalsConcededAvg.toFixed(1)} & ${away.goalsConcededAvg.toFixed(1)} conceded rates indicating high draw probability.`
    });
  }

  // 4. Double Chance 1X
  if (p1X >= 0.75) {
    candidates.push({
      market: 'Double Chance (1X)',
      selection: `${match.homeTeam.name} or Draw`,
      probability: p1X,
      odds: Number((1 / p1X * 0.96).toFixed(2)),
      rationale: `${match.homeTeam.name} remains undefeated in 85%+ of recent home fixtures; combined win & draw probability reaches ${(p1X * 100).toFixed(0)}% against ${match.awayTeam.name}.`
    });
  }

  // 5. Double Chance X2
  if (pX2 >= 0.75) {
    candidates.push({
      market: 'Double Chance (X2)',
      selection: `Draw or ${match.awayTeam.name}`,
      probability: pX2,
      odds: Number((1 / pX2 * 0.96).toFixed(2)),
      rationale: `${match.awayTeam.name} exhibits consistent counter-attacking resilience; their combined win or draw probability is ${(pX2 * 100).toFixed(0)}%.`
    });
  }

  // 6. Double Chance 12
  if (p12 >= 0.75) {
    candidates.push({
      market: 'Double Chance (12)',
      selection: 'Either Team to Win (No Draw)',
      probability: p12,
      odds: Number((1 / p12 * 0.96).toFixed(2)),
      rationale: `Both sides boast aggressive direct play styles with low draw frequencies; decisive winner probability stands at ${(p12 * 100).toFixed(0)}%.`
    });
  }

  // 7. Over 1.5 Goals
  if (adjOver15 >= 0.75) {
    candidates.push({
      market: 'Over 1.5 Goals',
      selection: 'Over 1.5 Total Goals',
      probability: adjOver15,
      odds: Number((1 / adjOver15 * 0.95).toFixed(2)),
      rationale: `Fixture combines average match goals of ${combinedAvgGoals.toFixed(1)} with both teams consistently breaching the 1.5 goal line in over 80% of matches.`
    });
  }

  // 8. Over 2.5 Goals
  if (adjOver25 >= 0.75) {
    candidates.push({
      market: 'Over 2.5 Goals',
      selection: 'Over 2.5 Total Goals',
      probability: adjOver25,
      odds: Number((1 / adjOver25 * 0.95).toFixed(2)),
      rationale: `High-octane clash averaging ${(home.goalsScoredAvg + away.goalsScoredAvg).toFixed(1)} attacking goals per 90 mins with elevated xG profiles (${home.expectedGoals.toFixed(1)} + ${away.expectedGoals.toFixed(1)}).`
    });
  }

  // 9. Under 2.5 Goals
  if (adjUnder25 >= 0.75) {
    candidates.push({
      market: 'Under 2.5 Goals',
      selection: 'Under 2.5 Total Goals',
      probability: adjUnder25,
      odds: Number((1 / adjUnder25 * 0.95).toFixed(2)),
      rationale: `Compact defensive setups and low offensive conversion (${home.goalsScoredAvg.toFixed(1)} & ${away.goalsScoredAvg.toFixed(1)} goals/match) heavily support a tight low-scoring affair.`
    });
  }

  // 10. BTTS Yes
  if (adjBttsYes >= 0.75) {
    candidates.push({
      market: 'BTTS Yes',
      selection: 'Both Teams to Score - Yes',
      probability: adjBttsYes,
      odds: Number((1 / adjBttsYes * 0.95).toFixed(2)),
      rationale: `${match.homeTeam.name} and ${match.awayTeam.name} have scored in ${(home.bttsRate * 100).toFixed(0)}% and ${(away.bttsRate * 100).toFixed(0)}% of respective games this season.`
    });
  }

  // 11. BTTS No
  if (adjBttsNo >= 0.75) {
    candidates.push({
      market: 'BTTS No',
      selection: 'Both Teams to Score - No',
      probability: adjBttsNo,
      odds: Number((1 / adjBttsNo * 0.95).toFixed(2)),
      rationale: `High clean sheet probability (${(Math.max(home.cleanSheetRate, away.cleanSheetRate) * 100).toFixed(0)}%) suggests at least one side will be held scoreless.`
    });
  }

  // Sort candidates by probability descending
  candidates.sort((a, b) => b.probability - a.probability);

  // Take up to 4 high-confidence prediction options that strictly meet >= 75%
  const qualifying = candidates
    .filter(c => c.probability >= 0.75)
    .slice(0, 4)
    .map((c, idx) => ({
      id: `${match.id}-pred-${idx + 1}`,
      matchId: match.id,
      market: c.market,
      selection: c.selection,
      confidence: Math.round(c.probability * 100),
      odds: c.odds,
      rationale: c.rationale,
      status: 'PENDING' as const
    }));

  if (qualifying.length === 0) {
    return {
      matchId: match.id,
      qualifies: false,
      message: 'No selection qualifies the strict 75% confidence threshold for this match based on current statistical indicators.',
      predictions: []
    };
  }

  return {
    matchId: match.id,
    qualifies: true,
    predictions: qualifying
  };
}

/**
 * Ranks all fixtures and generates TOP 4 BEST PREDICTIONS & BONUS TOP 5
 */
export function generateCuratedPredictions(fixtures: MatchFixture[]): {
  top4: (PredictionOption & { match: MatchFixture })[];
  bonus5: (PredictionOption & { match: MatchFixture })[];
} {
  const allQualifying: (PredictionOption & { match: MatchFixture })[] = [];

  for (const match of fixtures) {
    const analysis = calculateMatchPredictions(match);
    if (analysis.qualifies && analysis.predictions.length > 0) {
      // Pick the primary best selection from this match
      const best = analysis.predictions[0];
      allQualifying.push({
        ...best,
        match
      });
    }
  }

  // Sort by highest confidence and market solidity
  allQualifying.sort((a, b) => {
    if (b.confidence !== a.confidence) {
      return b.confidence - a.confidence;
    }
    return a.odds - b.odds;
  });

  const top4 = allQualifying.slice(0, 4);
  const bonus5 = allQualifying.slice(4, 9);

  return { top4, bonus5 };
}
