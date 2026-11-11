"""
HAULE BACKUP COMMUNITY - Python Prediction Engine Module
Strict minimum 75% confidence threshold implementation
"""
import math

def poisson(lmbda: float, k: int) -> float:
    if lmbda <= 0:
        return 1.0 if k == 0 else 0.0
    return (math.pow(lmbda, k) * math.exp(-lmbda)) / math.factorial(k)

def calculate_match_predictions(match_dict: dict) -> dict:
    home_stats = match_dict.get('homeTeam', {}).get('stats', {})
    away_stats = match_dict.get('awayTeam', {}).get('stats', {})

    home_avg = home_stats.get('goalsScoredAvg', 1.5)
    away_conceded = away_stats.get('goalsConcededAvg', 1.2)
    away_avg = away_stats.get('goalsScoredAvg', 1.2)
    home_conceded = home_stats.get('goalsConcededAvg', 1.0)

    home_lambda = max(0.4, home_avg * 0.6 + away_conceded * 0.4)
    away_lambda = max(0.3, away_avg * 0.6 + home_conceded * 0.4)

    p_home_win = 0.0
    p_draw = 0.0
    p_away_win = 0.0
    p_over15 = 0.0
    p_over25 = 0.0
    p_under25 = 0.0
    p_btts_yes = 0.0
    p_btts_no = 0.0

    for h in range(7):
        for a in range(7):
            prob = poisson(home_lambda, h) * poisson(away_lambda, a)
            if h > a:
                p_home_win += prob
            elif h == a:
                p_draw += prob
            else:
                p_away_win += prob

            total = h + a
            if total > 1:
                p_over15 += prob
            if total > 2:
                p_over25 += prob
            else:
                p_under25 += prob

            if h > 0 and a > 0:
                p_btts_yes += prob
            else:
                p_btts_no += prob

    p_1x = p_home_win + p_draw
    p_x2 = p_draw + p_away_win
    p_12 = p_home_win + p_away_win

    candidates = []
    # Check 75% confidence threshold strictly
    if p_home_win >= 0.75:
        candidates.append({
            "market": "Home Win",
            "selection": match_dict.get('homeTeam', {}).get('name', 'Home'),
            "confidence": round(p_home_win * 100),
            "odds": round(1 / p_home_win * 0.94, 2)
        })
    if p_away_win >= 0.75:
        candidates.append({
            "market": "Away Win",
            "selection": match_dict.get('awayTeam', {}).get('name', 'Away'),
            "confidence": round(p_away_win * 100),
            "odds": round(1 / p_away_win * 0.94, 2)
        })
    if p_1x >= 0.75:
        candidates.append({
            "market": "Double Chance (1X)",
            "selection": f"{match_dict.get('homeTeam', {}).get('name', 'Home')} or Draw",
            "confidence": round(p_1x * 100),
            "odds": round(1 / p_1x * 0.96, 2)
        })
    if p_x2 >= 0.75:
        candidates.append({
            "market": "Double Chance (X2)",
            "selection": f"Draw or {match_dict.get('awayTeam', {}).get('name', 'Away')}",
            "confidence": round(p_x2 * 100),
            "odds": round(1 / p_x2 * 0.96, 2)
        })
    if p_12 >= 0.75:
        candidates.append({
            "market": "Double Chance (12)",
            "selection": "Either Team to Win (No Draw)",
            "confidence": round(p_12 * 100),
            "odds": round(1 / p_12 * 0.96, 2)
        })
    if p_over15 >= 0.75:
        candidates.append({
            "market": "Over 1.5 Goals",
            "selection": "Over 1.5 Total Goals",
            "confidence": round(p_over15 * 100),
            "odds": round(1 / p_over15 * 0.95, 2)
        })
    if p_over25 >= 0.75:
        candidates.append({
            "market": "Over 2.5 Goals",
            "selection": "Over 2.5 Total Goals",
            "confidence": round(p_over25 * 100),
            "odds": round(1 / p_over25 * 0.95, 2)
        })
    if p_under25 >= 0.75:
        candidates.append({
            "market": "Under 2.5 Goals",
            "selection": "Under 2.5 Total Goals",
            "confidence": round(p_under25 * 100),
            "odds": round(1 / p_under25 * 0.95, 2)
        })
    if p_btts_yes >= 0.75:
        candidates.append({
            "market": "BTTS Yes",
            "selection": "Both Teams to Score - Yes",
            "confidence": round(p_btts_yes * 100),
            "odds": round(1 / p_btts_yes * 0.95, 2)
        })
    if p_btts_no >= 0.75:
        candidates.append({
            "market": "BTTS No",
            "selection": "Both Teams to Score - No",
            "confidence": round(p_btts_no * 100),
            "odds": round(1 / p_btts_no * 0.95, 2)
        })

    candidates.sort(key=lambda x: x['confidence'], reverse=True)
    qualifying = candidates[:4]

    return {
        "matchId": match_dict.get('id'),
        "qualifies": len(qualifying) > 0,
        "predictions": qualifying
    }
