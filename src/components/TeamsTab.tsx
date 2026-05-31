import { useState } from 'react';
import { ActualScores, Score } from '../types';
import { TEAMS, GROUPS, teamById } from '../data/teams';
import { MATCHES } from '../data/matches';
import { SCHEDULE } from '../data/schedule';
import { calcQualification } from '../utils/groupStandings';
import FlagImg from './FlagImg';

interface Props {
  actual: ActualScores;
  onSetActual: (matchId: string, score: Score | null) => void;
}

export default function TeamsTab({ actual, onSetActual }: Props) {
  const playedCount = MATCHES.filter(m => actual[m.id]).length;
  const { groupStandings } = calcQualification(actual);

  // Build sorted TV schedule grouped by date
  const scheduleRows = MATCHES
    .filter(m => SCHEDULE[m.id])
    .map(m => ({ match: m, sched: SCHEDULE[m.id] }))
    .sort((a, b) => {
      const ka = `${a.sched.dateSortKey} ${a.sched.time}`;
      const kb = `${b.sched.dateSortKey} ${b.sched.time}`;
      return ka.localeCompare(kb);
    });

  const byDate = new Map<string, typeof scheduleRows>();
  for (const row of scheduleRows) {
    if (!byDate.has(row.sched.date)) byDate.set(row.sched.date, []);
    byDate.get(row.sched.date)!.push(row);
  }

  return (
    <div className="tab-panel tab-panel--lag">
      <div className="teams-hero">
        <span>🌍</span>
        <div>
          <h2>Lag &amp; Resultat – VM 2026</h2>
          <p>48 lag · 12 grupper · {playedCount}/{MATCHES.length} resultat inmatade</p>
        </div>
      </div>

      <div className="lag-layout">
        {/* ── TV-sändningar (vänsterpanel) ── */}
        <div className="tv-schedule-panel">
          <div className="tv-schedule-header">
            <span className="tv-schedule-title">📺 TV-Sändningstider</span>
            <span className="tv-schedule-sub">Tider i CEST (sv. sommartid)</span>
          </div>
          <div className="tv-schedule-body">
            {Array.from(byDate.entries()).map(([date, rows]) => (
              <div key={date} className="tv-date-group">
                <div className="tv-date-header">{date}</div>
                {rows.map(({ match, sched }) => {
                  const t1 = teamById[match.team1Id];
                  const t2 = teamById[match.team2Id];
                  const isSwe = match.team1Id === 'swe' || match.team2Id === 'swe';
                  return (
                    <div key={match.id} className={`tv-match-row${isSwe ? ' tv-match-row--sweden' : ''}`}>
                      <span className="tv-time">{sched.time}</span>
                      <span className="tv-teams">
                        <FlagImg code={t1.flag} name={t1.name} size={13} />
                        {' '}{t1.name} – {t2.name}{' '}
                        <FlagImg code={t2.flag} name={t2.name} size={13} />
                      </span>
                      <span className={`tv-channel tv-channel--${sched.channel.toLowerCase()}`}>{sched.channel}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* ── Grupper & resultat (höger) ── */}
        <div className="lag-groups">
          <div className="results-groups">
            {GROUPS.map(group => {
              const groupTeams = TEAMS.filter(t => t.group === group);
              const groupMatches = MATCHES.filter(m => m.group === group);
              const winnerId = groupStandings[group]?.[0] ?? null;
              const winner = winnerId ? teamById[winnerId] : null;
              return (
                <div key={group} className="results-group">
                  <h3>Grupp {group}</h3>

                  <div className="teams-list teams-list--inline">
                    {groupTeams.map(team => (
                      <div key={team.id} className="team-card team-card--sm">
                        <FlagImg code={team.flag} name={team.name} size={22} />
                        <span className="team-name">{team.name}</span>
                      </div>
                    ))}
                  </div>

                  <div className="group-matches-divider">Matcher</div>

                  {groupMatches.map(match => {
                    const t1 = teamById[match.team1Id];
                    const t2 = teamById[match.team2Id];
                    const sched = SCHEDULE[match.id];
                    return (
                      <ResultRow
                        key={match.id}
                        matchId={match.id}
                        team1={t1}
                        team2={t2}
                        score={actual[match.id] ?? null}
                        schedTime={sched ? `${sched.date} ${sched.time}` : undefined}
                        schedChannel={sched?.channel}
                        onSet={score => onSetActual(match.id, score)}
                      />
                    );
                  })}

                  <div className="group-winner-inline">
                    <span className="group-winner-inline-label">🥇 Gruppvinnare:</span>
                    {winner ? (
                      <span className="group-winner-inline-team">
                        <FlagImg code={winner.flag} name={winner.name} size={16} />
                        {winner.name}
                      </span>
                    ) : (
                      <span className="group-winner-unknown">–</span>
                    )}
                  </div>
                  {(() => {
                    const runnerId = groupStandings[group]?.[1] ?? null;
                    const runner = runnerId ? teamById[runnerId] : null;
                    return (
                      <div className="group-winner-inline">
                        <span className="group-winner-inline-label">🥈 Tvåa:</span>
                        {runner ? (
                          <span className="group-winner-inline-team">
                            <FlagImg code={runner.flag} name={runner.name} size={16} />
                            {runner.name}
                          </span>
                        ) : (
                          <span className="group-winner-unknown">–</span>
                        )}
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ matchId: _matchId, team1, team2, score, schedTime, schedChannel, onSet }: {
  matchId: string;
  team1: { flag: string; name: string };
  team2: { flag: string; name: string };
  score: Score | null;
  schedTime?: string;
  schedChannel?: string;
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

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSet(null);
  };

  if (editing) {
    return (
      <div className="result-row result-row--editing">
        <span className="result-team" style={{ fontSize: '0.82rem' }}><FlagImg code={team1.flag} name={team1.name} size={16} /> {team1.name}</span>
        <input type="number" min="0" max="20" value={v1} onChange={e => setV1(e.target.value)}
          className="score-input" autoFocus
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }} />
        <span className="score-sep">–</span>
        <input type="number" min="0" max="20" value={v2} onChange={e => setV2(e.target.value)}
          className="score-input"
          onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') setEditing(false); }} />
        <span className="result-team result-team--right" style={{ fontSize: '0.82rem' }}><FlagImg code={team2.flag} name={team2.name} size={16} /> {team2.name}</span>
        <button className="btn-save" onClick={save}>✓</button>
        <button className="btn-cancel" onClick={() => setEditing(false)}>✕</button>
      </div>
    );
  }

  return (
    <div className="result-row" onClick={startEdit} title="Klicka för att ange/ändra resultat">
      <span className="result-team"><FlagImg code={team1.flag} name={team1.name} size={16} /> {team1.name}</span>
      <span className={`result-score ${score ? 'result-score--set' : ''}`}>
        {score ? `${score.team1} – ${score.team2}` : '? – ?'}
      </span>
      <span className="result-team result-team--right"><FlagImg code={team2.flag} name={team2.name} size={16} /> {team2.name}</span>
      {score && (
        <button className="result-clear" onClick={clear} title="Rensa resultat">✕</button>
      )}
      {schedTime && (
        <span className="result-sched">
          {schedTime}
          {schedChannel && <span className={`result-sched-ch result-sched-ch--${schedChannel.toLowerCase()}`}>{schedChannel}</span>}
        </span>
      )}
    </div>
  );
}
