export const ROUNDS = [
  { id: 'r32',   label: 'Sextondelsfinaler', count: 16 },
  { id: 'r16',   label: 'Åttondelsfinaler',  count: 8  },
  { id: 'qf',    label: 'Kvartsfinaler',     count: 4  },
  { id: 'sf',    label: 'Semifinaler',       count: 2  },
  { id: 'final', label: 'Final',             count: 1  },
] as const;

/** Returns a stable match ID string */
export function mkMatchId(roundId: string, idx: number, count: number): string {
  return count === 1 ? roundId : `${roundId}-${idx}`;
}

// Official 2026 World Cup bracket: R32 → R16 is non-sequential.
// r32-idx → { r16 matchIdx, slot }
// R32 order: 0=M73(2A-2B), 1=M74(1E-3?), 2=M76(1C-2F), 3=M75(1F-2C),
//            4=M77(1I-3?), 5=M78(2E-2I), 6=M79(1A-3?), 7=M80(1L-3?),
//            8=M81(1D-3?), 9=M82(1G-3?), 10=M83(2K-2L), 11=M84(1H-2J),
//            12=M85(1B-3?), 13=M86(1J-2H), 14=M87(1K-3?), 15=M88(2D-2G)
// R16 order: 0=M89(W74,W77), 1=M90(W73,W75), 2=M91(W76,W78), 3=M92(W79,W80),
//            4=M93(W83,W84), 5=M94(W81,W82), 6=M95(W86,W88), 7=M96(W85,W87)
const R32_TO_R16: Record<number, { matchIdx: number; slot: 'team1Id' | 'team2Id' }> = {
  0:  { matchIdx: 1, slot: 'team1Id' }, // M73 → M90 t1
  1:  { matchIdx: 0, slot: 'team1Id' }, // M74 → M89 t1
  2:  { matchIdx: 2, slot: 'team1Id' }, // M76 → M91 t1
  3:  { matchIdx: 1, slot: 'team2Id' }, // M75 → M90 t2
  4:  { matchIdx: 0, slot: 'team2Id' }, // M77 → M89 t2
  5:  { matchIdx: 2, slot: 'team2Id' }, // M78 → M91 t2
  6:  { matchIdx: 3, slot: 'team1Id' }, // M79 → M92 t1
  7:  { matchIdx: 3, slot: 'team2Id' }, // M80 → M92 t2
  8:  { matchIdx: 5, slot: 'team1Id' }, // M81 → M94 t1
  9:  { matchIdx: 5, slot: 'team2Id' }, // M82 → M94 t2
  10: { matchIdx: 4, slot: 'team1Id' }, // M83 → M93 t1
  11: { matchIdx: 4, slot: 'team2Id' }, // M84 → M93 t2
  12: { matchIdx: 7, slot: 'team1Id' }, // M85 → M96 t1
  13: { matchIdx: 6, slot: 'team1Id' }, // M86 → M95 t1
  14: { matchIdx: 7, slot: 'team2Id' }, // M87 → M96 t2
  15: { matchIdx: 6, slot: 'team2Id' }, // M88 → M95 t2
};

/** Returns the match ID and team slot where the winner of matchId should go */
export function getNextSlot(
  matchId: string
): { matchId: string; slot: 'team1Id' | 'team2Id' } | null {
  if (matchId === 'final') return null;

  const lastDash = matchId.lastIndexOf('-');
  const roundId = matchId.slice(0, lastDash);
  const idx = parseInt(matchId.slice(lastDash + 1));

  // R32 uses a custom non-sequential mapping to R16
  if (roundId === 'r32') {
    const target = R32_TO_R16[idx];
    if (!target) return null;
    return { matchId: mkMatchId('r16', target.matchIdx, 8), slot: target.slot };
  }

  const roundIdx = ROUNDS.findIndex(r => r.id === roundId);
  if (roundIdx < 0 || roundIdx >= ROUNDS.length - 1) return null;

  const nextRound = ROUNDS[roundIdx + 1];
  const nextIdx = Math.floor(idx / 2);
  const nextMatchId = mkMatchId(nextRound.id, nextIdx, nextRound.count);
  const slot: 'team1Id' | 'team2Id' = idx % 2 === 0 ? 'team1Id' : 'team2Id';
  return { matchId: nextMatchId, slot };
}

/** All match IDs in order */
export const ALL_MATCH_IDS: string[] = ROUNDS.flatMap(r =>
  Array.from({ length: r.count }, (_, i) => mkMatchId(r.id, i, r.count))
);
