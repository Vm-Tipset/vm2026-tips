import { useState } from 'react';
import { AppState, Score } from '../types';
import { MATCHES, matchById } from '../data/matches';
import { teamById, GROUPS } from '../data/teams';
import { calcPoints, calcGdDiff } from '../utils/scoring';
import FlagImg from './FlagImg';

interface Props {
  state: AppState;
  onSetActual: (matchId: string, score: Score | null) => void;
}

export default function StandingsTab({ state, onSetActual }: Props) {
  const [showResults, setShowResults] = useState(false);

  const userPoints = state.users.map(user => {
    const tips = state.tips[user.id] ?? {};
    let total = 0;
    let exactCount = 0;
    let correctCount = 0;
    let tippedCount = 0;
    for (const match of MATCHES) {
      const actual = state.actual[match.id];
      const tip = tips[match.id];
      if (tip) tippedCount++;
      if (!actual || !tip) continue;
      const pts = calcPoints(tip, actual);
      total += pts;
      if (pts === 5) exactCount++;
      else if (pts === 3) correctCount++;
    }
    const gdDiff = calcGdDiff(tips, state.actual);
    return { user, total, exactCount, correctCount, tippedCount, gdDiff };
  });

  userPoints.sort((a, b) =>
    b.total - a.total ||
    a.gdDiff - b.gdDiff ||   // lägre MV-avvikelse vinner vid lika poäng
    b.tippedCount - a.tippedCount
  );

  const playedCount = MATCHES.filter(m => state.actual[m.id]).length;

  return (
    <div className="tab-panel">
      <div className="standings-hero">
        <span className="standings-trophy">🏆</span>
        <div>
          <h2>Sammanlagd ställning</h2>
          <p className="standings-sub">{playedCount} av {MATCHES.length} matcher spelade</p>
        </div>
      </div>

      {state.users.length === 0 ? (
        <div className="empty-state">
          <p>Inga spelare ännu. Klicka <strong>"+ Lägg till spelare"</strong> i tabbmenyn för att komma igång.</p>
        </div>
      ) : (
        <table className="standings-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Spelare</th>
              <th title="Totala poäng">Poäng</th>
              <th title="Exakt rätt resultat (5 poäng)">⭐ Exakt</th>
              <th title="Rätt utgång (3 poäng)">✓ Utgång</th>
              <th title="Summa |tippad MV – faktisk MV| (lägre = bättre, används som tiebreaker)">MV-avv.</th>
              <th title="Antal tippade matcher">Tippat</th>
            </tr>
          </thead>
          <tbody>
            {userPoints.map(({ user, total, exactCount, correctCount, tippedCount, gdDiff }, i) => (
              <tr key={user.id} className={i === 0 && total > 0 ? 'standings-leader' : ''}>
                <td className="standings-rank">
                  {i === 0 && total > 0 ? '🥇' : i === 1 && total > 0 ? '🥈' : i === 2 && total > 0 ? '🥉' : i + 1}
                </td>
                <td className="standings-name">{user.name}</td>
                <td className="standings-points">{total}</td>
                <td className="standings-exact">{exactCount}</td>
                <td className="standings-correct">{correctCount}</td>
                <td className="standings-gd" title="Summa av |tippad MV – faktisk MV|">{gdDiff}</td>
                <td className="standings-tipped">{tippedCount}/{MATCHES.length}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="scoring-legend">
        <span className="legend-exact">⭐ 5p = Exakt rätt resultat</span>
        <span className="legend-correct">✓ 3p = Rätt utgång (W/D/L)</span>
        <span className="legend-wrong">✗ 0p = Fel gissning</span>
        <span className="legend-gd">MV-avv. = tiebreaker (lägre = bättre)</span>
      </div>

      <div className="results-section">
        <button className="btn-toggle-results" onClick={() => setShowResults(v => !v)}>
          {showResults ? '▲' : '▼'} Ange faktiska matchresultat ({playedCount} inmatade)
        </button>

        {showResults && (
          <div className="results-groups">
            {GROUPS.map(group => (
              <div key={group} className="results-group">
                <h3>Grupp {group}</h3>
                {MATCHES.filter(m => m.group === group).map(match => {
                  const t1 = teamById[match.team1Id];
                  const t2 = teamById[match.team2Id];
                  return (
                    <ResultRow
                      key={match.id}
                      matchId={match.id}
                      team1={t1}
                      team2={t2}
                      score={state.actual[match.id] ?? null}
                      onSet={score => onSetActual(match.id, score)}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Suppress unused import warning
const _matchById = matchById;

function ResultRow({ matchId: _matchId, team1, team2, score, onSet }: {
  matchId: string;
  team1: { flag: string; name: string };
  team2: { flag: string; name: string };
  score: Score | null;
  onSet: (score: Score | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [v1, setV1] = useState('');
  const [v2, setV2] = useState('');

  const startEdit = () => {
    setV1(score?.team1?.toString() ?? '');
    setV2(score?.team2?.toString() ?? '');
    setEditing(true);
  };

  const save = () => {
    const n1 = parseInt(v1);
    const n2 = parseInt(v2);
    if (!isNaN(n1) && !isNaN(n2) && n1 >= 0 && n2 >= 0) {
      onSet({ team1: n1, team2: n2 });
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="result-row result-row--editing">
        <span className="result-team"><FlagImg code={team1.flag} name={team1.name} size={16} /> {team1.name}</span>
        <input type="number" min="0" max="20" value={v1} onChange={e => setV1(e.target.value)}
          className="score-input" autoFocus onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }} />
        <span className="score-sep">–</span>
        <input type="number" min="0" max="20" value={v2} onChange={e => setV2(e.target.value)}
          className="score-input" onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }} />
        <span className="result-team result-team--right"><FlagImg code={team2.flag} name={team2.name} size={16} /> {team2.name}</span>
        <button className="btn-save" onClick={save}>✓</button>
        <button className="btn-cancel" onClick={() => setEditing(false)}>✕</button>
      </div>
    );
  }

  return (
    <div className="result-row" onClick={startEdit} title="Klicka för att ange resultat">
      <span className="result-team"><FlagImg code={team1.flag} name={team1.name} size={16} /> {team1.name}</span>
      <span className={`result-score ${score ? 'result-score--set' : ''}`}>
        {score ? `${score.team1} – ${score.team2}` : '? – ?'}
      </span>
      <span className="result-team result-team--right"><FlagImg code={team2.flag} name={team2.name} size={16} /> {team2.name}</span>
    </div>
  );
}
