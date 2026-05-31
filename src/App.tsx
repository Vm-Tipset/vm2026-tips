import { useEffect, useRef, useState } from 'react';
import { AppState, KnockoutState, Score, User } from './types';
import StandingsTab from './components/StandingsTab';
import TeamsTab from './components/TeamsTab';
import TipsTab from './components/TipsTab';
import KnockoutTab from './components/KnockoutTab';
import { getNextSlot, mkMatchId, ROUNDS } from './data/knockout';
import { MATCHES } from './data/matches';
import { calcR32Bracket } from './utils/groupStandings';

/** Recursively removes teamId from all subsequent rounds starting after fromMatchId */
function cascadeClear(bracket: KnockoutState, fromMatchId: string, teamId: string): void {
  const next = getNextSlot(fromMatchId);
  if (!next) return;
  const nm = bracket[next.matchId];
  if (!nm || nm[next.slot] !== teamId) return;
  const hadWinner = nm.winnerId === teamId;
  bracket[next.matchId] = { ...nm, [next.slot]: null, winnerId: hadWinner ? null : nm.winnerId };
  if (hadWinner) {
    cascadeClear(bracket, next.matchId, teamId);
  }
}

const STORAGE_KEY = 'vm2026-tips-state';

const defaultState: AppState = {
  users: [],
  tips: {},
  actual: {},
  bracket: {},
};

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultState, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultState;
}

type TabId = 'standings' | 'teams' | 'knockout' | string;
type PendingAction =
  | { type: 'reset' }
  | { type: 'removeUser'; userId: string }
  | { type: 'addUser' }
  | { type: 'simulate' }
  | { type: 'editActual'; matchId: string; score: Score | null }
  | { type: 'editKnockoutWinner'; matchId: string; winnerId: string | null }
  | { type: 'editKnockoutTeam'; matchId: string; slot: 'team1Id' | 'team2Id'; teamId: string | null }
  | { type: 'editKnockoutTeamAndWinner'; matchId: string; slot: 'team1Id' | 'team2Id'; teamId: string }
  | null;

export default function App() {
  const [state, setState] = useState<AppState>(loadState);
  const [activeTab, setActiveTab] = useState<TabId>('standings');
  const [addingUser, setAddingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [isEditUnlocked, setIsEditUnlocked] = useState(false);
  const [pwInput, setPwInput] = useState('');
  const [pwError, setPwError] = useState(false);
  const pwInputRef = useRef<HTMLInputElement>(null);
  const newUserInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (addingUser) newUserInputRef.current?.focus();
  }, [addingUser]);

  const addUser = () => {
    const name = newUserName.trim();
    if (!name) return;
    const user: User = { id: `user-${Date.now()}`, name };
    setState(prev => ({ ...prev, users: [...prev.users, user] }));
    setActiveTab(user.id);
    setNewUserName('');
    setAddingUser(false);
  };

  const createRng = (seed: number) => {
    let s = seed >>> 0;
    return () => {
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  const randomScore = (rand: () => number): Score => ({
    team1: Math.floor(rand() * 6),
    team2: Math.floor(rand() * 6),
  });

  const sameOutcomeScore = (actualScore: Score, rand: () => number): Score => {
    const outcome = Math.sign(actualScore.team1 - actualScore.team2);
    if (outcome === 0) {
      let g = Math.floor(rand() * 6);
      if (g === actualScore.team1) g = (g + 1) % 6;
      return { team1: g, team2: g };
    }
    if (outcome > 0) {
      const loser = Math.floor(rand() * 5);
      const winner = loser + 1 + Math.floor(rand() * 2);
      return { team1: winner, team2: loser };
    }
    const loser = Math.floor(rand() * 5);
    const winner = loser + 1 + Math.floor(rand() * 2);
    return { team1: loser, team2: winner };
  };

  const simulateBracket = (actual: Record<string, Score>, rand: () => number): KnockoutState => {
    const bracket: KnockoutState = {};
    const r32 = calcR32Bracket(actual);

    for (let i = 0; i < 16; i++) {
      const mid = mkMatchId('r32', i, 16);
      bracket[mid] = {
        team1Id: r32[i]?.team1Id ?? null,
        team2Id: r32[i]?.team2Id ?? null,
        winnerId: null,
      };
    }

    for (const round of ROUNDS) {
      for (let i = 0; i < round.count; i++) {
        const mid = mkMatchId(round.id, i, round.count);
        const cur = bracket[mid] ?? { team1Id: null, team2Id: null, winnerId: null };

        const winnerId = cur.team1Id && cur.team2Id
          ? (rand() < 0.5 ? cur.team1Id : cur.team2Id)
          : (cur.team1Id ?? cur.team2Id ?? null);

        bracket[mid] = { ...cur, winnerId };

        if (winnerId) {
          const next = getNextSlot(mid);
          if (next) {
            const nm = bracket[next.matchId] ?? { team1Id: null, team2Id: null, winnerId: null };
            bracket[next.matchId] = { ...nm, [next.slot]: winnerId };
          }
        }
      }
    }

    return bracket;
  };

  const simulateWorldCupTips = () => {
    const rand = createRng(Date.now());
    const playerNames = ['Jocke', 'Mia', 'Anton', 'Sara', 'Leo'];
    const users: User[] = playerNames.map((name, idx) => ({ id: `sim-user-${idx + 1}`, name }));

    const actual: Record<string, Score> = {};
    for (const match of MATCHES) {
      actual[match.id] = randomScore(rand);
    }

    const tips: Record<string, Record<string, Score>> = {};
    for (const user of users) {
      const userTips: Record<string, Score> = {};
      for (const match of MATCHES) {
        const actualScore = actual[match.id];
        const r = rand();
        if (r < 0.2) {
          userTips[match.id] = { ...actualScore };
        } else if (r < 0.55) {
          userTips[match.id] = sameOutcomeScore(actualScore, rand);
        } else {
          userTips[match.id] = randomScore(rand);
        }
      }
      tips[user.id] = userTips;
    }

    const bracket = simulateBracket(actual, rand);
    setState({ users, tips, actual, bracket });
    setActiveTab('standings');
    setAddingUser(false);
    setNewUserName('');
    setPendingAction(null);
    setPwInput('');
    setPwError(false);
    setIsEditUnlocked(false);
  };

  const setTip = (userId: string, matchId: string, score: Score) => {
    setState(prev => ({
      ...prev,
      tips: {
        ...prev.tips,
        [userId]: { ...(prev.tips[userId] ?? {}), [matchId]: score },
      },
    }));
  };

  const applyActual = (matchId: string, score: Score | null) => {
    setState(prev => {
      const next = { ...prev.actual };
      if (score === null) delete next[matchId];
      else next[matchId] = score;
      return { ...prev, actual: next };
    });
  };

  const setActual = (matchId: string, score: Score | null) => {
    if (activeTab === 'teams' && !isEditUnlocked) {
      openPwModal({ type: 'editActual', matchId, score });
      return;
    }
    applyActual(matchId, score);
  };

  const removeUser = (userId: string) => openPwModal({ type: 'removeUser', userId });

  const applyBracketWinner = (matchId: string, winnerId: string | null) => {
    setState(prev => {
      const bracket = { ...prev.bracket };
      const cur = bracket[matchId] ?? { team1Id: null, team2Id: null, winnerId: null };
      const oldWinnerId = cur.winnerId;
      bracket[matchId] = { ...cur, winnerId };
      if (winnerId !== null) {
        // Propagate new winner forward
        const next = getNextSlot(matchId);
        if (next) {
          const nm = bracket[next.matchId] ?? { team1Id: null, team2Id: null, winnerId: null };
          bracket[next.matchId] = { ...nm, [next.slot]: winnerId };
        }
      } else if (oldWinnerId !== null) {
        // Cascade-clear old winner from all subsequent rounds
        cascadeClear(bracket, matchId, oldWinnerId);
      }
      return { ...prev, bracket };
    });
  };

  const setBracketWinner = (matchId: string, winnerId: string | null) => {
    if (activeTab === 'knockout' && !isEditUnlocked) {
      openPwModal({ type: 'editKnockoutWinner', matchId, winnerId });
      return;
    }
    applyBracketWinner(matchId, winnerId);
  };

  const applyBracketTeamAndWinner = (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string) => {
    setState(prev => {
      const bracket = { ...prev.bracket };
      const cur = bracket[matchId] ?? { team1Id: null, team2Id: null, winnerId: null };
      // Clear old winner cascade first
      if (cur.winnerId && cur.winnerId !== teamId) {
        cascadeClear(bracket, matchId, cur.winnerId);
      }
      bracket[matchId] = { ...cur, [slot]: teamId, winnerId: teamId };
      const next = getNextSlot(matchId);
      if (next) {
        const nm = bracket[next.matchId] ?? { team1Id: null, team2Id: null, winnerId: null };
        bracket[next.matchId] = { ...nm, [next.slot]: teamId };
      }
      return { ...prev, bracket };
    });
  };

  const setBracketTeamAndWinner = (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string) => {
    if (activeTab === 'knockout' && !isEditUnlocked) {
      openPwModal({ type: 'editKnockoutTeamAndWinner', matchId, slot, teamId });
      return;
    }
    applyBracketTeamAndWinner(matchId, slot, teamId);
  };

  const applyBracketTeam = (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string | null) => {
    setState(prev => {
      const bracket = { ...prev.bracket };
      const cur = bracket[matchId] ?? { team1Id: null, team2Id: null, winnerId: null };
      const oldTeamId = cur[slot];
      const wasWinner = cur.winnerId === oldTeamId;
      const newWinnerId = wasWinner ? null : cur.winnerId;
      bracket[matchId] = { ...cur, [slot]: teamId, winnerId: newWinnerId };
      // If the replaced team was the winner, cascade-clear it from subsequent rounds
      if (wasWinner && oldTeamId) {
        cascadeClear(bracket, matchId, oldTeamId);
      }
      return { ...prev, bracket };
    });
  };

  const setBracketTeam = (matchId: string, slot: 'team1Id' | 'team2Id', teamId: string | null) => {
    if (activeTab === 'knockout' && !isEditUnlocked) {
      openPwModal({ type: 'editKnockoutTeam', matchId, slot, teamId });
      return;
    }
    applyBracketTeam(matchId, slot, teamId);
  };

  const openPwModal = (action: PendingAction) => {
    setPendingAction(action);
    setPwInput('');
    setPwError(false);
    setTimeout(() => pwInputRef.current?.focus(), 50);
  };

  const confirmPw = () => {
    if (!pendingAction) return;

    const expectedPassword = pendingAction.type === 'addUser' ? 'VmTips2026!' : 'Poxa30';
    if (pwInput !== expectedPassword) { setPwError(true); return; }

    if (pendingAction.type === 'reset') {
      setState(defaultState);
      setIsEditUnlocked(false);
      setActiveTab('standings');
    } else if (pendingAction.type === 'simulate') {
      simulateWorldCupTips();
    } else if (pendingAction.type === 'removeUser') {
      const userId = pendingAction.userId;
      setState(prev => {
        const users = prev.users.filter(u => u.id !== userId);
        const tips = { ...prev.tips };
        delete tips[userId];
        return { ...prev, users, tips };
      });
      setActiveTab('standings');
    } else if (pendingAction.type === 'addUser') {
      setAddingUser(true);
    } else if (pendingAction.type === 'editActual') {
      setIsEditUnlocked(true);
      applyActual(pendingAction.matchId, pendingAction.score);
    } else if (pendingAction.type === 'editKnockoutWinner') {
      setIsEditUnlocked(true);
      applyBracketWinner(pendingAction.matchId, pendingAction.winnerId);
    } else if (pendingAction.type === 'editKnockoutTeam') {
      setIsEditUnlocked(true);
      applyBracketTeam(pendingAction.matchId, pendingAction.slot, pendingAction.teamId);
    } else if (pendingAction.type === 'editKnockoutTeamAndWinner') {
      setIsEditUnlocked(true);
      applyBracketTeamAndWinner(pendingAction.matchId, pendingAction.slot, pendingAction.teamId);
    }
    setPendingAction(null);
    setPwInput('');
  };

  const resetAll = () => openPwModal({ type: 'reset' });

  const activeUser = state.users.find(u => u.id === activeTab);

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-title">
          <span className="app-logo">⚽</span>
          <span>VM 2026 – Tipset</span>
        </div>
        <div className="app-subtitle">FIFA World Cup 2026 · USA · Canada · Mexico</div>
        <button className="reset-btn" onClick={() => openPwModal({ type: 'simulate' })} title="Skapa simulerat VM med 5 spelare">🎲 Simulera 5 spelare</button>
        <button className="reset-btn" onClick={resetAll} title="Töm alla fält">🗑 Återställ</button>
      </header>

      <nav className="tab-bar">
        <button
          className={`tab-btn${activeTab === 'standings' ? ' active' : ''}`}
          onClick={() => setActiveTab('standings')}
        >
          🏆 Ställning
        </button>
        <button
          className={`tab-btn${activeTab === 'teams' ? ' active' : ''}`}
          onClick={() => setActiveTab('teams')}
        >
          🌍 Lag
        </button>
        <button
          className={`tab-btn${activeTab === 'knockout' ? ' active' : ''}`}
          onClick={() => setActiveTab('knockout')}
        >
          ⚔️ Slutspel
        </button>

        <div className="tab-divider" />

        {state.users.map(user => (
          <button
            key={user.id}
            className={`tab-btn tab-btn--user${activeTab === user.id ? ' active' : ''}`}
            onClick={() => setActiveTab(user.id)}
          >
            👤 {user.name}
          </button>
        ))}

        {addingUser ? (
          <div className="tab-add-form">
            <input
              ref={newUserInputRef}
              className="tab-add-input"
              placeholder="Spelarens namn..."
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') addUser();
                if (e.key === 'Escape') { setAddingUser(false); setNewUserName(''); }
              }}
            />
            <button className="tab-add-confirm" onClick={addUser}>✓</button>
            <button className="tab-add-cancel" onClick={() => { setAddingUser(false); setNewUserName(''); }}>✕</button>
          </div>
        ) : (
          <button className="tab-btn tab-btn--add" onClick={() => openPwModal({ type: 'addUser' })}>
            + Lägg till spelare
          </button>
        )}
      </nav>

      <main className="tab-content">
        {activeTab === 'standings' && (
          <StandingsTab state={state} onSetActual={setActual} />
        )}
        {activeTab === 'teams' && (
          <TeamsTab actual={state.actual} onSetActual={setActual} />
        )}
        {activeTab === 'knockout' && (
          <KnockoutTab
            bracket={state.bracket}
            actual={state.actual}
            onSetTeam={setBracketTeam}
            onSetWinner={setBracketWinner}
            onSetTeamAndWinner={setBracketTeamAndWinner}
          />
        )}
        {activeUser && (
          <TipsTab
            user={activeUser}
            tips={state.tips[activeUser.id] ?? {}}
            actual={state.actual}
            onSetTip={(matchId, score) => setTip(activeUser.id, matchId, score)}
            onRemoveUser={() => removeUser(activeUser.id)}
          />
        )}
      </main>

      {pendingAction && (
        <div className="pw-overlay" onClick={() => setPendingAction(null)}>
          <div className="pw-modal" onClick={e => e.stopPropagation()}>
            <p>
              {pendingAction.type === 'reset'
                ? 'Återställ all data'
                : pendingAction.type === 'removeUser'
                  ? 'Ta bort spelare'
                  : pendingAction.type === 'addUser'
                    ? 'Lägg till spelare'
                    : pendingAction.type === 'simulate'
                      ? 'Simulera 5 spelare'
                    : pendingAction.type === 'editActual'
                      ? 'Redigera resultat i Lag'
                      : 'Redigera slutspel'}
            </p>
            <input
              ref={pwInputRef}
              type="password"
              className={`pw-input${pwError ? ' pw-input--error' : ''}`}
              placeholder={pendingAction.type === 'addUser' ? 'Lösenord för att lägga till spelare...' : 'Lösenord...'}
              value={pwInput}
              onChange={e => { setPwInput(e.target.value); setPwError(false); }}
              onKeyDown={e => { if (e.key === 'Enter') confirmPw(); if (e.key === 'Escape') setPendingAction(null); }}
            />
            {pwError && <span className="pw-error">Fel lösenord</span>}
            <div className="pw-actions">
              <button className="pw-cancel" onClick={() => setPendingAction(null)}>Avbryt</button>
              <button className="pw-confirm" onClick={confirmPw}>OK</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
