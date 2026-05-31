import { Team } from '../types';

export const TEAMS: Team[] = [
  // Grupp A
  { id: 'mex', name: 'Mexiko', flag: 'mx', group: 'A' },
  { id: 'rsa', name: 'Sydafrika', flag: 'za', group: 'A' },
  { id: 'kor', name: 'Sydkorea', flag: 'kr', group: 'A' },
  { id: 'cze', name: 'Tjeckien', flag: 'cz', group: 'A' },
  // Grupp B
  { id: 'can', name: 'Kanada', flag: 'ca', group: 'B' },
  { id: 'bih', name: 'Bosnien-Hercegovina', flag: 'ba', group: 'B' },
  { id: 'qat', name: 'Qatar', flag: 'qa', group: 'B' },
  { id: 'sui', name: 'Schweiz', flag: 'ch', group: 'B' },
  // Grupp C
  { id: 'bra', name: 'Brasilien', flag: 'br', group: 'C' },
  { id: 'mar', name: 'Marocko', flag: 'ma', group: 'C' },
  { id: 'hai', name: 'Haiti', flag: 'ht', group: 'C' },
  { id: 'sco', name: 'Skottland', flag: 'gb-sct', group: 'C' },
  // Grupp D
  { id: 'usa', name: 'USA', flag: 'us', group: 'D' },
  { id: 'par', name: 'Paraguay', flag: 'py', group: 'D' },
  { id: 'aus', name: 'Australien', flag: 'au', group: 'D' },
  { id: 'tur', name: 'Turkiet', flag: 'tr', group: 'D' },
  // Grupp E
  { id: 'ger', name: 'Tyskland', flag: 'de', group: 'E' },
  { id: 'cur', name: 'Curaçao', flag: 'cw', group: 'E' },
  { id: 'civ', name: 'Elfenbenskusten', flag: 'ci', group: 'E' },
  { id: 'ecu', name: 'Ecuador', flag: 'ec', group: 'E' },
  // Grupp F
  { id: 'ned', name: 'Nederländerna', flag: 'nl', group: 'F' },
  { id: 'jpn', name: 'Japan', flag: 'jp', group: 'F' },
  { id: 'swe', name: 'Sverige', flag: 'se', group: 'F' },
  { id: 'tun', name: 'Tunisien', flag: 'tn', group: 'F' },
  // Grupp G
  { id: 'bel', name: 'Belgien', flag: 'be', group: 'G' },
  { id: 'egy', name: 'Egypten', flag: 'eg', group: 'G' },
  { id: 'irn', name: 'Iran', flag: 'ir', group: 'G' },
  { id: 'nzl', name: 'Nya Zeeland', flag: 'nz', group: 'G' },
  // Grupp H
  { id: 'esp', name: 'Spanien', flag: 'es', group: 'H' },
  { id: 'cpv', name: 'Kap Verde', flag: 'cv', group: 'H' },
  { id: 'ksa', name: 'Saudiarabien', flag: 'sa', group: 'H' },
  { id: 'uru', name: 'Uruguay', flag: 'uy', group: 'H' },
  // Grupp I
  { id: 'fra', name: 'Frankrike', flag: 'fr', group: 'I' },
  { id: 'sen', name: 'Senegal', flag: 'sn', group: 'I' },
  { id: 'irq', name: 'Irak', flag: 'iq', group: 'I' },
  { id: 'nor', name: 'Norge', flag: 'no', group: 'I' },
  // Grupp J
  { id: 'arg', name: 'Argentina', flag: 'ar', group: 'J' },
  { id: 'alg', name: 'Algeriet', flag: 'dz', group: 'J' },
  { id: 'aut', name: 'Österrike', flag: 'at', group: 'J' },
  { id: 'jor', name: 'Jordanien', flag: 'jo', group: 'J' },
  // Grupp K
  { id: 'por', name: 'Portugal', flag: 'pt', group: 'K' },
  { id: 'cod', name: 'DR Kongo', flag: 'cd', group: 'K' },
  { id: 'uzb', name: 'Uzbekistan', flag: 'uz', group: 'K' },
  { id: 'col', name: 'Colombia', flag: 'co', group: 'K' },
  // Grupp L
  { id: 'eng', name: 'England', flag: 'gb-eng', group: 'L' },
  { id: 'cro', name: 'Kroatien', flag: 'hr', group: 'L' },
  { id: 'gha', name: 'Ghana', flag: 'gh', group: 'L' },
  { id: 'pan', name: 'Panama', flag: 'pa', group: 'L' },
];

export const teamById: Record<string, Team> = Object.fromEntries(TEAMS.map(t => [t.id, t]));
export const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
