import { ActualScores } from '../types';
import { TEAMS, GROUPS } from '../data/teams';
import { MATCHES } from '../data/matches';

// ── Team standing in group ─────────────────────────────────────────────────

export interface TeamStanding {
  teamId: string;
  group: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

function calcGroupStandings(group: string, actual: ActualScores): { standings: TeamStanding[]; complete: boolean } {
  const groupTeams = TEAMS.filter(t => t.group === group);
  const groupMatches = MATCHES.filter(m => m.group === group);
  let playedMatches = 0;

  const map = new Map<string, TeamStanding>(
    groupTeams.map(t => [
      t.id,
      { teamId: t.id, group, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 },
    ])
  );

  for (const m of groupMatches) {
    const score = actual[m.id];
    if (!score) continue;
    playedMatches++;
    const t1 = map.get(m.team1Id)!;
    const t2 = map.get(m.team2Id)!;
    t1.played++;
    t2.played++;
    t1.gf += score.team1;
    t1.ga += score.team2;
    t2.gf += score.team2;
    t2.ga += score.team1;
    t1.gd = t1.gf - t1.ga;
    t2.gd = t2.gf - t2.ga;
    if (score.team1 > score.team2) {
      t1.won++; t1.pts += 3; t2.lost++;
    } else if (score.team1 < score.team2) {
      t2.won++; t2.pts += 3; t1.lost++;
    } else {
      t1.drawn++; t1.pts++;
      t2.drawn++; t2.pts++;
    }
  }

  const standings = Array.from(map.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    return b.gf - a.gf;
  });

  return { standings, complete: playedMatches === groupMatches.length };
}

// ── Qualification ──────────────────────────────────────────────────────────

// group → [1st, 2nd, 3rd, 4th] team IDs (null if standings incomplete)
export type GroupStandingsMap = Record<string, (string | null)[]>;

export function calcQualification(actual: ActualScores): {
  groupStandings: GroupStandingsMap;
  qualified3rd: string[]; // 8 best 3rd-place team IDs, sorted best-first
  third3rdGroupOf: Record<string, string>; // teamId → group
} {
  const groupStandings: GroupStandingsMap = {};
  const thirdPlace: (TeamStanding & { group: string })[] = [];

  for (const group of GROUPS) {
    const { standings, complete } = calcGroupStandings(group, actual);
    groupStandings[group] = complete ? standings.map(s => s.teamId) : [null, null, null, null];
    if (complete && standings.length >= 3) {
      thirdPlace.push({ ...standings[2], group });
    }
  }

  // Rank all 3rd-place teams; top 8 qualify
  thirdPlace.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.gd  !== a.gd)  return b.gd  - a.gd;
    return b.gf - a.gf;
  });

  const qualified3rd = thirdPlace.slice(0, 8).map(t => t.teamId);

  const third3rdGroupOf: Record<string, string> = {};
  for (const t of thirdPlace) third3rdGroupOf[t.teamId] = t.group;

  return { groupStandings, qualified3rd, third3rdGroupOf };
}

// ── R32 slot definitions ───────────────────────────────────────────────────
// Each entry corresponds to r32-0..r32-15.
// Format: '1A' = winner of A, '2B' = runner-up of B, '3ABCDF' = best 3rd from those groups.

interface SlotDef { team1: string; team2: string }

export const R32_SLOT_DEFS: SlotDef[] = [
  { team1: '2A', team2: '2B'     }, // r32-0  M73
  { team1: '1E', team2: '3ABCDF' }, // r32-1  M74
  { team1: '1C', team2: '2F'     }, // r32-2  M76
  { team1: '1F', team2: '2C'     }, // r32-3  M75
  { team1: '1I', team2: '3CDFGH' }, // r32-4  M77
  { team1: '2E', team2: '2I'     }, // r32-5  M78
  { team1: '1A', team2: '3CEFHI' }, // r32-6  M79
  { team1: '1L', team2: '3EHIJK' }, // r32-7  M80
  { team1: '1D', team2: '3BEFIJ' }, // r32-8  M81
  { team1: '1G', team2: '3AEHIJ' }, // r32-9  M82
  { team1: '2K', team2: '2L'     }, // r32-10 M83
  { team1: '1H', team2: '2J'     }, // r32-11 M84
  { team1: '1B', team2: '3EFGIJ' }, // r32-12 M85
  { team1: '1J', team2: '2H'     }, // r32-13 M86
  { team1: '1K', team2: '3DEIJL' }, // r32-14 M87
  { team1: '2D', team2: '2G'     }, // r32-15 M88
];

function resolveFixed(
  code: string,
  groupStandings: GroupStandingsMap
): string | null {
  const pos = parseInt(code[0]) - 1; // '1' → 0, '2' → 1
  const group = code[1];
  return groupStandings[group]?.[pos] ?? null;
}

// Backtracking: assign each qualified 3rd-place team to exactly one 3rd-place slot,
// respecting per-slot group constraints.  Returns true if a valid assignment was found.
function assignBacktrack(
  slotQueue: Array<{ matchIdx: number; teamSlot: 'team1Id' | 'team2Id'; allowed: string[] }>,
  qualified3rd: string[],
  third3rdGroupOf: Record<string, string>,
  assigned: Set<string>,
  result: Array<{ team1Id: string | null; team2Id: string | null }>
): boolean {
  if (slotQueue.length === 0) return true;

  const [head, ...tail] = slotQueue;
  for (const teamId of qualified3rd) {
    if (assigned.has(teamId)) continue;
    const teamGroup = third3rdGroupOf[teamId];
    if (!head.allowed.includes(teamGroup)) continue;

    result[head.matchIdx][head.teamSlot] = teamId;
    assigned.add(teamId);
    if (assignBacktrack(tail, qualified3rd, third3rdGroupOf, assigned, result)) return true;
    result[head.matchIdx][head.teamSlot] = null;
    assigned.delete(teamId);
  }
  return false;
}

// ── Main export ────────────────────────────────────────────────────────────

export function calcR32Bracket(
  actual: ActualScores
): Array<{ team1Id: string | null; team2Id: string | null }> {
  const { groupStandings, qualified3rd, third3rdGroupOf } = calcQualification(actual);

  const result: Array<{ team1Id: string | null; team2Id: string | null }> =
    R32_SLOT_DEFS.map(() => ({ team1Id: null, team2Id: null }));

  // 1. Fill all fixed slots (1st-place vs 2nd-place)
  for (let i = 0; i < R32_SLOT_DEFS.length; i++) {
    const def = R32_SLOT_DEFS[i];
    if (!def.team1.startsWith('3')) result[i].team1Id = resolveFixed(def.team1, groupStandings);
    if (!def.team2.startsWith('3')) result[i].team2Id = resolveFixed(def.team2, groupStandings);
  }

  // 2. Collect 3rd-place slots and their allowed groups
  const thirdSlots = R32_SLOT_DEFS.flatMap((def, i) => {
    const slots = [];
    if (def.team1.startsWith('3'))
      slots.push({ matchIdx: i, teamSlot: 'team1Id' as const, allowed: def.team1.slice(1).split('') });
    if (def.team2.startsWith('3'))
      slots.push({ matchIdx: i, teamSlot: 'team2Id' as const, allowed: def.team2.slice(1).split('') });
    return slots;
  });

  // Sort by constraint count ascending (most constrained first)
  thirdSlots.sort((a, b) => {
    const countA = qualified3rd.filter(tid => a.allowed.includes(third3rdGroupOf[tid])).length;
    const countB = qualified3rd.filter(tid => b.allowed.includes(third3rdGroupOf[tid])).length;
    return countA - countB;
  });

  // 3. Backtracking assignment
  assignBacktrack(thirdSlots, qualified3rd, third3rdGroupOf, new Set(), result);

  return result;
}
