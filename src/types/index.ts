export interface Team {
  id: string;
  name: string;
  flag: string;
  group: string;
}

export interface Match {
  id: string;
  group: string;
  team1Id: string;
  team2Id: string;
  matchNumber: number;
}

export interface Score {
  team1: number;
  team2: number;
}

export interface User {
  id: string;
  name: string;
}

export type UserTips = Record<string, Score>;    // matchId -> Score
export type ActualScores = Record<string, Score>; // matchId -> Score

export interface KnockoutMatchState {
  team1Id: string | null;
  team2Id: string | null;
  winnerId: string | null;
}
export type KnockoutState = Record<string, KnockoutMatchState>;

export interface AppState {
  users: User[];
  tips: Record<string, UserTips>; // userId -> (matchId -> Score)
  actual: ActualScores;
  bracket: KnockoutState;
}
