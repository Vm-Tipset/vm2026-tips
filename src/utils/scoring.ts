import { Score } from '../types';

export function calcPoints(tip: Score, actual: Score): number {
  if (tip.team1 === actual.team1 && tip.team2 === actual.team2) return 5;
  const tipOutcome = Math.sign(tip.team1 - tip.team2);
  const actualOutcome = Math.sign(actual.team1 - actual.team2);
  if (tipOutcome === actualOutcome) return 3;
  return 0;
}

/** Sum of |tippad GD – faktisk GD| for all tipped & played matches (lower = better tiebreaker) */
export function calcGdDiff(tips: Record<string, Score>, actual: Record<string, Score>): number {
  let diff = 0;
  for (const matchId of Object.keys(actual)) {
    const tip = tips[matchId];
    if (!tip) continue;
    const tipGD    = tip.team1 - tip.team2;
    const actualGD = actual[matchId].team1 - actual[matchId].team2;
    diff += Math.abs(tipGD - actualGD);
  }
  return diff;
}

export function getOutcomeLabel(points: number | null): string {
  if (points === 5) return 'Exakt rätt! +5p';
  if (points === 3) return 'Rätt utgång! +3p';
  if (points === 0) return 'Fel. 0p';
  return '';
}
