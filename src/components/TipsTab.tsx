import { useEffect, useState } from 'react';
import { ActualScores, Score, User, UserTips } from '../types';
import { MATCHES } from '../data/matches';
import { teamById, GROUPS } from '../data/teams';
import { calcPoints, getOutcomeLabel } from '../utils/scoring';
import FlagImg from './FlagImg';

interface Props {
  user: User;
  tips: UserTips;
  actual: ActualScores;
  onSetTip: (matchId: string, score: Score) => void;
  onRemoveUser: () => void;
}

export default function TipsTab({ user, tips, actual, onSetTip, onRemoveUser }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const totalPoints = MATCHES.reduce((sum, m) => {
    const a = actual[m.id];
    const t = tips[m.id];
    if (!a || !t) return sum;
    return sum + calcPoints(t, a);
  }, 0);

  const tippedCount = MATCHES.filter(m => tips[m.id]).length;
  const playedCount = MATCHES.filter(m => actual[m.id] && tips[m.id]).length;

  return (
    <div className="tab-panel">
      <div className="tips-header">
        <div className="tips-header-left">
          <h2>👤 {user.name}</h2>
          <div className="tips-stats">
            <span className="tips-points-badge">{totalPoints} poäng</span>
            <span className="tips-meta">{tippedCount}/{MATCHES.length} tippade</span>
            {playedCount > 0 && <span className="tips-meta">{playedCount} räknade</span>}
          </div>
        </div>
        <div className="tips-header-right">
          {confirmDelete ? (
            <div className="confirm-delete">
              <span>Ta bort {user.name}?</span>
              <button className="btn-danger" onClick={onRemoveUser}>Ja</button>
              <button onClick={() => setConfirmDelete(false)}>Nej</button>
            </div>
          ) : (
            <button className="btn-remove" onClick={() => setConfirmDelete(true)}>🗑 Ta bort spelare</button>
          )}
        </div>
      </div>

      <div className="scoring-legend">
        <span className="legend-exact">⭐ 5p = Exakt rätt resultat</span>
        <span className="legend-correct">✓ 3p = Rätt utgång (W/D/L)</span>
        <span className="legend-wrong">✗ 0p = Fel gissning</span>
      </div>

      <div className="tips-instruction">
        Ange ditt tips på varje match nedan. Fyll i antal mål för respektive lag.
      </div>

      {GROUPS.map(group => (
        <div key={group} className="tips-group">
          <div className="tips-group-header">Grupp {group}</div>
          {MATCHES.filter(m => m.group === group).map(match => {
            const t1 = teamById[match.team1Id];
            const t2 = teamById[match.team2Id];
            const tip = tips[match.id] ?? null;
            const act = actual[match.id] ?? null;
            const pts = tip && act ? calcPoints(tip, act) : null;
            return (
              <TipRow
                key={match.id}
                team1={t1}
                team2={t2}
                tip={tip}
                actual={act}
                points={pts}
                onSet={score => onSetTip(match.id, score)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

interface TipRowProps {
  team1: { flag: string; name: string };
  team2: { flag: string; name: string };
  tip: Score | null;
  actual: Score | null;
  points: number | null;
  onSet: (score: Score) => void;
}

function TipRow({ team1, team2, tip, actual, points, onSet }: TipRowProps) {
  const [v1, setV1] = useState(tip?.team1?.toString() ?? '');
  const [v2, setV2] = useState(tip?.team2?.toString() ?? '');

  useEffect(() => {
    setV1(tip?.team1?.toString() ?? '');
    setV2(tip?.team2?.toString() ?? '');
  }, [tip]);

  const commit = () => {
    const n1 = parseInt(v1);
    const n2 = parseInt(v2);
    if (!isNaN(n1) && !isNaN(n2) && n1 >= 0 && n2 >= 0) {
      onSet({ team1: n1, team2: n2 });
    }
  };

  const ptClass =
    points === 5 ? 'pts-exact' :
    points === 3 ? 'pts-correct' :
    points === 0 ? 'pts-wrong' : '';

  const rowClass = `tip-row${ptClass ? ` tip-row--${ptClass}` : ''}`;

  return (
    <div className={rowClass}>
      <span className="tip-team tip-team--left">
        <FlagImg code={team1.flag} name={team1.name} size={20} />
        <span className="tip-name">{team1.name}</span>
      </span>

      <div className="tip-score-area">
        <input
          type="number"
          min="0"
          max="20"
          className="score-input"
          value={v1}
          placeholder="–"
          onChange={e => setV1(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
          disabled={!!actual}
          title={actual ? 'Matchen är avgjord, inga fler ändringar möjliga' : 'Ditt tips'}
        />
        <span className="score-sep">–</span>
        <input
          type="number"
          min="0"
          max="20"
          className="score-input"
          value={v2}
          placeholder="–"
          onChange={e => setV2(e.target.value)}
          onBlur={commit}
          onKeyDown={e => e.key === 'Enter' && commit()}
          disabled={!!actual}
          title={actual ? 'Matchen är avgjord, inga fler ändringar möjliga' : 'Ditt tips'}
        />
      </div>

      <span className="tip-team tip-team--right">
        <span className="tip-name">{team2.name}</span>
        <FlagImg code={team2.flag} name={team2.name} size={20} />
      </span>

      <div className="tip-result-area">
        {actual && (
          <span className="actual-score" title="Faktiskt resultat">
            {actual.team1}–{actual.team2}
          </span>
        )}
        {points !== null && (
          <span className={`points-badge points-badge--${ptClass}`} title={getOutcomeLabel(points)}>
            {points}p
          </span>
        )}
      </div>
    </div>
  );
}
