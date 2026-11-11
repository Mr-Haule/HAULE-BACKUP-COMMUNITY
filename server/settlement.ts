import { MatchFixture, PredictionOption, SettlementStatus } from './types.js';

export interface SettleResult {
  predictionId: string;
  matchId: string;
  market: string;
  selection: string;
  status: SettlementStatus;
  scoreText: string;
  settledAt: string;
}

export function evaluatePrediction(
  prediction: PredictionOption,
  match: MatchFixture
): SettlementStatus {
  if (match.status === 'POSTPONED') {
    return 'VOID';
  }

  if (match.status !== 'FINISHED' || !match.score) {
    return 'PENDING';
  }

  const { home, away } = match.score;
  const totalGoals = home + away;

  switch (prediction.market) {
    case 'Home Win':
      return home > away ? 'WON' : 'LOST';

    case 'Away Win':
      return away > home ? 'WON' : 'LOST';

    case 'Draw':
      return home === away ? 'WON' : 'LOST';

    case 'Double Chance (1X)':
      return home >= away ? 'WON' : 'LOST';

    case 'Double Chance (X2)':
      return away >= home ? 'WON' : 'LOST';

    case 'Double Chance (12)':
      return home !== away ? 'WON' : 'LOST';

    case 'Over 1.5 Goals':
      return totalGoals > 1 ? 'WON' : 'LOST';

    case 'Over 2.5 Goals':
      return totalGoals > 2 ? 'WON' : 'LOST';

    case 'Under 2.5 Goals':
      return totalGoals < 3 ? 'WON' : 'LOST';

    case 'BTTS Yes':
      return home > 0 && away > 0 ? 'WON' : 'LOST';

    case 'BTTS No':
      return home === 0 || away === 0 ? 'WON' : 'LOST';

    default:
      return 'PENDING';
  }
}

export function calculateSettlementSummary(predictions: PredictionOption[]) {
  let won = 0;
  let lost = 0;
  let voided = 0;
  let pending = 0;
  let totalOddsWon = 0;
  let totalSettled = 0;

  for (const p of predictions) {
    if (p.status === 'WON') {
      won++;
      totalOddsWon += p.odds;
      totalSettled++;
    } else if (p.status === 'LOST') {
      lost++;
      totalSettled++;
    } else if (p.status === 'VOID') {
      voided++;
    } else {
      pending++;
    }
  }

  const winRate = totalSettled > 0 ? Number(((won / totalSettled) * 100).toFixed(1)) : 0;
  // Yield / ROI assuming 1 unit flat stake on all settled bets
  const netProfit = totalOddsWon - totalSettled;
  const roi = totalSettled > 0 ? Number(((netProfit / totalSettled) * 100).toFixed(1)) : 0;

  return {
    totalPredictions: predictions.length,
    totalSettled,
    won,
    lost,
    voided,
    pending,
    winRate,
    roi,
    netProfit: Number(netProfit.toFixed(2))
  };
}
