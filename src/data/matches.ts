import { Match } from '../types';
import { TEAMS, GROUPS } from './teams';

function generateGroupMatches(): Match[] {
  const matches: Match[] = [];
  let matchNumber = 1;
  for (const group of GROUPS) {
    const groupTeams = TEAMS.filter(t => t.group === group);
    for (let i = 0; i < groupTeams.length; i++) {
      for (let j = i + 1; j < groupTeams.length; j++) {
        matches.push({
          id: `m${matchNumber}`,
          group,
          team1Id: groupTeams[i].id,
          team2Id: groupTeams[j].id,
          matchNumber: matchNumber++,
        });
      }
    }
  }
  return matches;
}

export const MATCHES: Match[] = generateGroupMatches();
export const matchById: Record<string, Match> = Object.fromEntries(MATCHES.map(m => [m.id, m]));
