import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ActualScores, KnockoutState, KnockoutMatchState } from '../types';
import { TEAMS, teamById } from '../data/teams';
import { ROUNDS, mkMatchId, getNextSlot } from '../data/knockout';
import { calcR32Bracket, R32_SLOT_DEFS } from '../utils/groupStandings';
import FlagImg from './FlagImg';

/** Converts slot code like '1A', '2B', '3ABCDF' to Swedish label */
function slotCodeToLabel(code: string): string {
  if (!code) return '';
  const pos = code[0];
  const rest = code.slice(1);
  if (pos === '1') return `Gruppvinnare grupp ${rest}`;
  if (pos === '2') return `Grupptv\u00e5a grupp ${rest}`;
  if (pos === '3') return `B\u00e4sta 3:a (${rest.split('').join('/')})`;
  return code;
}

// ── Layout constants ─────────────────────────────────────────────────────────
const MATCH_H = 90;   // height of each match card (px)
const UNIT    = 110;  // MATCH_H + gap between adjacent R32 matches
const COL_W   = 260;  // column width per round
const COL_GAP = 56;   // horizontal gap between round columns
const LABEL_H = 38;   // height of round title above the bracket

const N_R32 = 16;
// Total container height so that all 16 R32 cards fit
const BRACKET_H = LABEL_H + N_R32 * UNIT - (UNIT - MATCH_H);
const CHAMPION_COL_X = ROUNDS.length * (COL_W + COL_GAP);
const TOTAL_W   = CHAMPION_COL_X + COL_W;

/** Top-offset (px) of a match card in its column */
function matchTop(roundIdx: number, matchIdx: number): number {
  const step = Math.pow(2, roundIdx);
  return LABEL_H + matchIdx * step * UNIT + ((step - 1) / 2) * UNIT;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  bracket:    KnockoutState;
  actual:     ActualScores;
  onSetTeam:            (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string | null) => void;
  onSetWinner:          (matchId: string, winnerId: string | null) => void;
  onSetTeamAndWinner:   (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string) => void;
}

/** Returns all team IDs currently used in the knockout bracket (to prevent duplicates in pickers) */
function getUsedKnockoutTeamIds(bracket: KnockoutState): Set<string> {
  const ids = new Set<string>();
  for (const round of ROUNDS) {
    for (let i = 0; i < round.count; i++) {
      const m = bracket[mkMatchId(round.id, i, round.count)];
      if (m?.team1Id) ids.add(m.team1Id);
      if (m?.team2Id) ids.add(m.team2Id);
    }
  }
  return ids;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function KnockoutTab({ bracket, actual, onSetTeam, onSetWinner, onSetTeamAndWinner }: Props) {
  const usedTeamIds = getUsedKnockoutTeamIds(bracket);
  const r32Resolved = calcR32Bracket(actual);

  const calcScale = () => {
    // Only scale to fit width — height scrolls vertically
    const availW = window.innerWidth - 32;
    return Math.min(availW / TOTAL_W, 1);
  };

  const [scale, setScale] = useState(calcScale);

  useEffect(() => {
    const onResize = () => setScale(calcScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const scaledH = BRACKET_H * scale;
  const scaledW = TOTAL_W * scale;

  return (
    <div className="tab-panel tab-panel--knockout">
      <div className="teams-hero">
        <span>🏆</span>
        <div>
          <h2>Slutspel – VM 2026</h2>
          <p>Välj lag i sextondelsfinaler · ★ vinnaren vidare till nästa runda automatiskt</p>
        </div>
      </div>

      {/* Sticky round-label bar — outside the transform so sticky works */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        width: scaledW,
        height: LABEL_H * scale,
        overflow: 'hidden',
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: TOTAL_W, height: LABEL_H, position: 'absolute', top: 0, left: 0 }}>
          {ROUNDS.map((round, rIdx) => (
            <div key={round.id} style={{ position: 'absolute', left: rIdx * (COL_W + COL_GAP), top: 0, width: COL_W }}>
              <div className="bracket-round-label" style={{ height: LABEL_H }}>{round.label}</div>
            </div>
          ))}
          <div style={{ position: 'absolute', left: CHAMPION_COL_X, top: 0, width: COL_W }}>
            <div className="bracket-round-label" style={{ height: LABEL_H }}>Världsmästare</div>
          </div>
        </div>
      </div>

      <div style={{ width: scaledW, height: scaledH, position: 'relative', overflow: 'visible' }}>
        <div
          style={{ transform: `scale(${scale})`, transformOrigin: 'top left', width: TOTAL_W, height: BRACKET_H, position: 'absolute', top: 0, left: 0 }}
        >
          <BracketLines bracket={bracket} />

          {ROUNDS.map((round, rIdx) => (
            <div
              key={round.id}
              style={{ position: 'absolute', left: rIdx * (COL_W + COL_GAP), top: 0, width: COL_W }}
            >
              {/* Label hidden here (shown in sticky bar above) but kept for spacing */}
              <div style={{ height: LABEL_H }} />

              {Array.from({ length: round.count }, (_, mIdx) => {
                const mid = mkMatchId(round.id, mIdx, round.count);
                const m: KnockoutMatchState = bracket[mid] ?? { team1Id: null, team2Id: null, winnerId: null };
                const slotDef = round.id === 'r32' ? R32_SLOT_DEFS[mIdx] : undefined;
                const resolved = round.id === 'r32' ? r32Resolved[mIdx] : undefined;
                return (
                  <MatchCard
                    key={mid}
                    matchId={mid}
                    top={matchTop(rIdx, mIdx)}
                    match={m}
                    isR32={round.id === 'r32'}
                    usedTeamIds={usedTeamIds}
                    slotLabel1={slotDef?.team1}
                    slotLabel2={slotDef?.team2}
                    resolvedTeam1={resolved?.team1Id ?? null}
                    resolvedTeam2={resolved?.team2Id ?? null}
                    onSetTeam={onSetTeam}
                    onSetWinner={onSetWinner}
                    onSetTeamAndWinner={onSetTeamAndWinner}
                  />
                );
              })}
            </div>
          ))}

          {/* Champion column */}
          <ChampionCard bracket={bracket} />
        </div>
      </div>
    </div>
  );
}

// ── SVG Connector lines ───────────────────────────────────────────────────────
function BracketLines({ bracket }: { bracket: KnockoutState }) {
  const paths: { d: string; hasWinner: boolean; dashed?: boolean }[] = [];

  ROUNDS.forEach((round, rIdx) => {
    if (rIdx >= ROUNDS.length - 1) return;
    for (let i = 0; i < round.count; i++) {
      const mid = mkMatchId(round.id, i, round.count);
      const nextSlot = getNextSlot(mid);
      if (!nextSlot) continue;

      const m = bracket[mid];
      const hasWinner = !!(m?.winnerId);

      const x1 = rIdx * (COL_W + COL_GAP) + COL_W;
      const y1 = matchTop(rIdx, i) + MATCH_H / 2;

      // Determine target round index and match index from the match ID
      const targetId = nextSlot.matchId;
      const lastDash = targetId.lastIndexOf('-');
      const targetRoundId  = lastDash >= 0 ? targetId.slice(0, lastDash) : targetId;
      const targetMatchIdx = lastDash >= 0 ? parseInt(targetId.slice(lastDash + 1)) : 0;
      const targetRoundIdx = ROUNDS.findIndex(r => r.id === targetRoundId);

      const x2   = (rIdx + 1) * (COL_W + COL_GAP);
      const y2   = matchTop(targetRoundIdx, targetMatchIdx) + MATCH_H / 2;
      const midX = x1 + COL_GAP / 2;

      // R32→R16 uses dashed lines since the bracket isn't sequential
      const dashed = round.id === 'r32';
      paths.push({ d: `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`, hasWinner, dashed });
    }
  });

  // Line from final to champion
  const finalRoundIdx = ROUNDS.length - 1;
  const finalMid = mkMatchId('final', 0, 1);
  const finalM = bracket[finalMid];
  const finalHasWinner = !!(finalM?.winnerId);
  const fx1 = finalRoundIdx * (COL_W + COL_GAP) + COL_W;
  const fy  = matchTop(finalRoundIdx, 0) + MATCH_H / 2;
  const fx2 = CHAMPION_COL_X;
  paths.push({ d: `M ${fx1} ${fy} L ${fx2} ${fy}`, hasWinner: finalHasWinner });

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: TOTAL_W, height: BRACKET_H, pointerEvents: 'none', overflow: 'visible' }}
    >
      {paths.map((p, i) => (
        <path
          key={i}
          d={p.d}
          stroke={p.hasWinner ? 'rgba(245,197,24,0.4)' : 'var(--border)'}
          strokeWidth={p.hasWinner ? 2 : 1.5}
          strokeDasharray={p.dashed && !p.hasWinner ? '4 3' : undefined}
          fill="none"
        />
      ))}
    </svg>
  );
}

// ── Champion card ─────────────────────────────────────────────────────────────
function ChampionCard({ bracket }: { bracket: KnockoutState }) {
  const finalM = bracket['final'];
  const winnerId = finalM?.winnerId ?? null;
  const team = winnerId ? teamById[winnerId] : null;
  const top = matchTop(ROUNDS.length - 1, 0);

  return (
    <div
      style={{
        position: 'absolute',
        left: CHAMPION_COL_X,
        top: 0,
        width: COL_W,
      }}
    >
      <div className="bracket-round-label" style={{ height: LABEL_H }}>Världsmästare</div>
      <div
        className={`bracket-match bracket-match--champion${winnerId ? ' bracket-match--champion-filled' : ''}`}
        style={{ top, height: MATCH_H, width: COL_W }}
      >
        <div className="bracket-team bracket-team--winner" style={{ height: '100%', justifyContent: 'center' }}>
          <div className="bracket-team-info bracket-team-info--readonly" style={{ justifyContent: 'center' }}>
            {team ? (
              <>
                <span style={{ fontSize: '1.2rem' }}>🏆</span>
                <FlagImg code={team.flag} name={team.name} size={18} />
                <span className="bracket-team-name" style={{ fontWeight: 700 }}>{team.name}</span>
              </>
            ) : (
              <span className="bracket-team-empty bracket-team-empty--waiting">Väntar på vinnare…</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Match card ────────────────────────────────────────────────────────────────
interface MatchCardProps {
  matchId: string;
  top: number;
  match: KnockoutMatchState;
  isR32: boolean;
  usedTeamIds: Set<string>;
  slotLabel1?: string;
  slotLabel2?: string;
  resolvedTeam1?: string | null;
  resolvedTeam2?: string | null;
  onSetTeam:          (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string | null) => void;
  onSetWinner:        (matchId: string, winnerId: string | null) => void;
  onSetTeamAndWinner: (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string) => void;
}

function MatchCard({ matchId, top, match, isR32, usedTeamIds, slotLabel1, slotLabel2, resolvedTeam1, resolvedTeam2, onSetTeam, onSetWinner, onSetTeamAndWinner }: MatchCardProps) {
  const t1IsWinner = match.winnerId !== null && match.winnerId === match.team1Id;
  const t2IsWinner = match.winnerId !== null && match.winnerId === match.team2Id;
  // R32: user picks teams manually. R16+: filled via ★ propagation (read-only).
  const teamsReadOnly = !isR32;

  return (
    <div className="bracket-match" style={{ top, height: MATCH_H, width: COL_W }}>
      <TeamSlot
        teamId={match.team1Id}
        isWinner={t1IsWinner}
        isLoser={t2IsWinner}
        readOnly={teamsReadOnly}
        usedTeamIds={usedTeamIds}
        slotLabel={slotLabel1}
        resolvedTeamId={resolvedTeam1 ?? null}
        onSelect={id => onSetTeam(matchId, 'team1Id', id)}
        onToggleWinner={() => onSetWinner(matchId, t1IsWinner ? null : match.team1Id)}
        onSetResolved={() => resolvedTeam1 ? onSetTeamAndWinner(matchId, 'team1Id', resolvedTeam1) : undefined}
      />
      <div className="bracket-divider" />
      <TeamSlot
        teamId={match.team2Id}
        isWinner={t2IsWinner}
        isLoser={t1IsWinner}
        readOnly={teamsReadOnly}
        usedTeamIds={usedTeamIds}
        slotLabel={slotLabel2}
        resolvedTeamId={resolvedTeam2 ?? null}
        onSelect={id => onSetTeam(matchId, 'team2Id', id)}
        onToggleWinner={() => onSetWinner(matchId, t2IsWinner ? null : match.team2Id)}
        onSetResolved={() => resolvedTeam2 ? onSetTeamAndWinner(matchId, 'team2Id', resolvedTeam2) : undefined}
      />
    </div>
  );
}

// ── Team slot ─────────────────────────────────────────────────────────────────
interface TeamSlotProps {
  teamId:          string | null;
  isWinner:        boolean;
  isLoser:         boolean;
  readOnly:        boolean;
  usedTeamIds:     Set<string>;
  slotLabel?:      string;
  resolvedTeamId?: string | null;
  onSelect:        (id: string | null) => void;
  onToggleWinner:  () => void;
  onSetResolved?:  () => void;
}

function TeamSlot({ teamId, isWinner, isLoser, readOnly, usedTeamIds, slotLabel, resolvedTeamId, onSelect, onToggleWinner, onSetResolved }: TeamSlotProps) {
  const [open, setOpen] = useState(false);
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const openDrop = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropPos({ top: r.bottom + 2, left: r.left });
    }
    setOpen(true);
  };

  const team = teamId ? teamById[teamId] : null;

  const cls = ['bracket-team',
    isWinner ? 'bracket-team--winner' : '',
    isLoser  ? 'bracket-team--loser'  : '',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={cls}>
        {readOnly ? (
          <div className="bracket-team-info bracket-team-info--readonly">
            {team ? (
              <>
                <FlagImg code={team.flag} name={team.name} size={16} />
                <span className="bracket-team-name">{team.name}</span>
              </>
            ) : (
              <span className="bracket-team-empty bracket-team-empty--waiting">Väntar på vinnare…</span>
            )}
          </div>
        ) : (
          <div ref={triggerRef} className="bracket-team-info" onClick={openDrop}>
            {team ? (
              <>
                <FlagImg code={team.flag} name={team.name} size={16} />
                <span className="bracket-team-name">{team.name}</span>
              </>
            ) : (
              <div className="bracket-team-hint">
                {slotLabel && <span className="bracket-slot-label">{slotCodeToLabel(slotLabel)}</span>}
                {resolvedTeamId && teamById[resolvedTeamId] ? (
                  <span className="bracket-slot-resolved">
                    <FlagImg code={teamById[resolvedTeamId].flag} name={teamById[resolvedTeamId].name} size={14} />
                    {teamById[resolvedTeamId].name}
                  </span>
                ) : (
                  <span className="bracket-team-empty">välj lag…</span>
                )}
              </div>
            )}
          </div>
        )}
        {(teamId || resolvedTeamId) && (
          <button
            className={`bracket-star${isWinner ? ' bracket-star--on' : ''}`}
            onClick={teamId ? onToggleWinner : onSetResolved}
            title={isWinner ? 'Avmarkera vinnare' : 'Markera som vinnare'}
          >
            {isWinner ? '★' : '☆'}
          </button>
        )}
      </div>

      {open && createPortal(
        <TeamPicker
          pos={dropPos}
          selected={teamId}
          usedTeamIds={usedTeamIds}
          onSelect={id => { onSelect(id); setOpen(false); }}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  );
}

// ── Team picker dropdown ──────────────────────────────────────────────────────
interface TeamPickerProps {
  pos:         { top: number; left: number };
  selected:    string | null;
  usedTeamIds: Set<string>;
  onSelect:    (id: string | null) => void;
  onClose:     () => void;
}

function TeamPicker({ pos, selected, usedTeamIds, onSelect, onClose }: TeamPickerProps) {
  const [search, setSearch] = useState('');
  const ref      = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const down = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', down);
    return () => document.removeEventListener('mousedown', down);
  }, [onClose]);

  const filtered = TEAMS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.group.toLowerCase() === search.toLowerCase()
  );

  const flipUp = pos.top + 330 > window.innerHeight;
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(pos.left, window.innerWidth - 230),
    zIndex: 1000,
    ...(flipUp
      ? { bottom: window.innerHeight - pos.top + 4 }
      : { top: pos.top }),
  };

  return (
    <div className="team-picker" style={style} ref={ref}>
      <div className="team-picker-search">
        <input
          ref={inputRef}
          placeholder="Sök lag eller grupp…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Escape' && onClose()}
        />
      </div>
      {selected && (
        <button className="team-picker-clear" onClick={() => onSelect(null)}>✕ Rensa</button>
      )}
      <div className="team-picker-list">
        {filtered.map(t => {
          const isUsed = usedTeamIds.has(t.id) && t.id !== selected;
          return (
            <button
              key={t.id}
              className={`team-picker-item${selected === t.id ? ' team-picker-item--active' : ''}${isUsed ? ' team-picker-item--used' : ''}`}
              onClick={() => !isUsed && onSelect(t.id)}
              disabled={isUsed}
              title={isUsed ? 'Laget är redan valt' : undefined}
            >
              <FlagImg code={t.flag} name={t.name} size={16} />
              <span>{t.name}</span>
              <span className="team-picker-group">Gr. {t.group}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
