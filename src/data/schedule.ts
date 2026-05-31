export interface MatchSchedule {
  date: string;        // "11 jun"
  dateSortKey: string; // "2026-06-11" for sorting
  time: string;        // "21:00" CEST
  channel: 'SVT' | 'TV4';
}

// All times in CEST (UTC+2, Swedish summer time)
// Channels: SVT and TV4 share broadcast rights for Sweden
// Sweden's matches and prime-time big matches on SVT, others on TV4
export const SCHEDULE: Record<string, MatchSchedule> = {
  // ── Grupp A ──
  m1:  { date: '11 jun', dateSortKey: '2026-06-11', time: '21:00', channel: 'SVT' }, // Mexiko – Sydafrika
  m6:  { date: '12 jun', dateSortKey: '2026-06-12', time: '04:00', channel: 'TV4' }, // Sydkorea – Tjeckien
  m5:  { date: '18 jun', dateSortKey: '2026-06-18', time: '18:00', channel: 'SVT' }, // Tjeckien – Sydafrika
  m2:  { date: '19 jun', dateSortKey: '2026-06-19', time: '01:00', channel: 'TV4' }, // Mexiko – Sydkorea
  m3:  { date: '25 jun', dateSortKey: '2026-06-25', time: '03:00', channel: 'SVT' }, // Mexiko – Tjeckien
  m4:  { date: '25 jun', dateSortKey: '2026-06-25', time: '03:00', channel: 'TV4' }, // Sydafrika – Sydkorea

  // ── Grupp B ──
  m7:  { date: '12 jun', dateSortKey: '2026-06-12', time: '21:00', channel: 'SVT' }, // Kanada – Bosnien
  m12: { date: '13 jun', dateSortKey: '2026-06-13', time: '21:00', channel: 'SVT' }, // Qatar – Schweiz
  m11: { date: '18 jun', dateSortKey: '2026-06-18', time: '21:00', channel: 'SVT' }, // Schweiz – Bosnien
  m8:  { date: '19 jun', dateSortKey: '2026-06-19', time: '01:00', channel: 'TV4' }, // Kanada – Qatar
  m9:  { date: '24 jun', dateSortKey: '2026-06-24', time: '21:00', channel: 'SVT' }, // Kanada – Schweiz
  m10: { date: '24 jun', dateSortKey: '2026-06-24', time: '21:00', channel: 'TV4' }, // Bosnien – Qatar

  // ── Grupp C ──
  m13: { date: '14 jun', dateSortKey: '2026-06-14', time: '00:00', channel: 'TV4' }, // Brasilien – Marocko
  m18: { date: '14 jun', dateSortKey: '2026-06-14', time: '03:00', channel: 'TV4' }, // Haiti – Skottland
  m17: { date: '19 jun', dateSortKey: '2026-06-19', time: '22:00', channel: 'SVT' }, // Skottland – Marocko
  m14: { date: '20 jun', dateSortKey: '2026-06-20', time: '02:30', channel: 'TV4' }, // Brasilien – Haiti
  m15: { date: '25 jun', dateSortKey: '2026-06-25', time: '02:00', channel: 'SVT' }, // Brasilien – Skottland
  m16: { date: '25 jun', dateSortKey: '2026-06-25', time: '02:00', channel: 'TV4' }, // Marocko – Haiti

  // ── Grupp D ──
  m19: { date: '13 jun', dateSortKey: '2026-06-13', time: '04:00', channel: 'TV4' }, // USA – Paraguay
  m24: { date: '14 jun', dateSortKey: '2026-06-14', time: '07:00', channel: 'TV4' }, // Australien – Turkiet
  m20: { date: '19 jun', dateSortKey: '2026-06-19', time: '21:00', channel: 'SVT' }, // USA – Australien
  m23: { date: '20 jun', dateSortKey: '2026-06-20', time: '06:00', channel: 'TV4' }, // Turkiet – Paraguay
  m21: { date: '26 jun', dateSortKey: '2026-06-26', time: '05:00', channel: 'TV4' }, // USA – Turkiet
  m22: { date: '26 jun', dateSortKey: '2026-06-26', time: '05:00', channel: 'TV4' }, // Paraguay – Australien

  // ── Grupp E ──
  m25: { date: '14 jun', dateSortKey: '2026-06-14', time: '19:00', channel: 'SVT' }, // Tyskland – Curaçao
  m30: { date: '15 jun', dateSortKey: '2026-06-15', time: '01:00', channel: 'TV4' }, // Elfenbenskusten – Ecuador
  m26: { date: '20 jun', dateSortKey: '2026-06-20', time: '22:00', channel: 'SVT' }, // Tyskland – Elfenbenskusten
  m29: { date: '21 jun', dateSortKey: '2026-06-21', time: '01:00', channel: 'TV4' }, // Ecuador – Curaçao
  m28: { date: '25 jun', dateSortKey: '2026-06-25', time: '22:00', channel: 'SVT' }, // Curaçao – Elfenbenskusten
  m27: { date: '26 jun', dateSortKey: '2026-06-26', time: '02:00', channel: 'TV4' }, // Ecuador – Tyskland

  // ── Grupp F ──
  m31: { date: '14 jun', dateSortKey: '2026-06-14', time: '21:00', channel: 'SVT' }, // Nederländerna – Japan
  m36: { date: '15 jun', dateSortKey: '2026-06-15', time: '04:00', channel: 'SVT' }, // Sverige – Tunisien 🇸🇪
  m32: { date: '20 jun', dateSortKey: '2026-06-20', time: '18:00', channel: 'SVT' }, // Nederländerna – Sverige 🇸🇪
  m35: { date: '21 jun', dateSortKey: '2026-06-21', time: '04:00', channel: 'TV4' }, // Tunisien – Japan
  m34: { date: '26 jun', dateSortKey: '2026-06-26', time: '00:00', channel: 'SVT' }, // Japan – Sverige 🇸🇪
  m33: { date: '26 jun', dateSortKey: '2026-06-26', time: '00:00', channel: 'TV4' }, // Tunisien – Nederländerna

  // ── Grupp G ──
  m37: { date: '15 jun', dateSortKey: '2026-06-15', time: '21:00', channel: 'SVT' }, // Belgien – Egypten
  m42: { date: '16 jun', dateSortKey: '2026-06-16', time: '03:00', channel: 'TV4' }, // Iran – Nya Zeeland
  m38: { date: '21 jun', dateSortKey: '2026-06-21', time: '21:00', channel: 'SVT' }, // Belgien – Iran
  m41: { date: '22 jun', dateSortKey: '2026-06-22', time: '03:00', channel: 'TV4' }, // Egypten – Nya Zeeland
  m40: { date: '27 jun', dateSortKey: '2026-06-27', time: '06:00', channel: 'TV4' }, // Egypten – Iran
  m39: { date: '27 jun', dateSortKey: '2026-06-27', time: '06:00', channel: 'TV4' }, // Nya Zeeland – Belgien

  // ── Grupp H ──
  m43: { date: '15 jun', dateSortKey: '2026-06-15', time: '14:00', channel: 'TV4' }, // Spanien – Kap Verde
  m48: { date: '15 jun', dateSortKey: '2026-06-15', time: '20:00', channel: 'SVT' }, // Saudiarabien – Uruguay
  m44: { date: '21 jun', dateSortKey: '2026-06-21', time: '18:00', channel: 'SVT' }, // Spanien – Saudiarabien
  m47: { date: '22 jun', dateSortKey: '2026-06-22', time: '00:00', channel: 'TV4' }, // Uruguay – Kap Verde
  m45: { date: '27 jun', dateSortKey: '2026-06-27', time: '00:00', channel: 'SVT' }, // Spanien – Uruguay
  m46: { date: '27 jun', dateSortKey: '2026-06-27', time: '01:00', channel: 'TV4' }, // Kap Verde – Saudiarabien

  // ── Grupp I ──
  m49: { date: '16 jun', dateSortKey: '2026-06-16', time: '21:00', channel: 'SVT' }, // Frankrike – Senegal
  m54: { date: '17 jun', dateSortKey: '2026-06-17', time: '00:00', channel: 'TV4' }, // Irak – Norge
  m50: { date: '22 jun', dateSortKey: '2026-06-22', time: '23:00', channel: 'SVT' }, // Frankrike – Irak
  m53: { date: '23 jun', dateSortKey: '2026-06-23', time: '02:00', channel: 'TV4' }, // Norge – Senegal
  m51: { date: '27 jun', dateSortKey: '2026-06-27', time: '21:00', channel: 'SVT' }, // Frankrike – Norge
  m52: { date: '27 jun', dateSortKey: '2026-06-27', time: '21:00', channel: 'TV4' }, // Senegal – Irak

  // ── Grupp J ──
  m55: { date: '17 jun', dateSortKey: '2026-06-17', time: '02:00', channel: 'TV4' }, // Argentina – Algeriet
  m60: { date: '17 jun', dateSortKey: '2026-06-17', time: '05:00', channel: 'TV4' }, // Österrike – Jordanien
  m56: { date: '22 jun', dateSortKey: '2026-06-22', time: '18:00', channel: 'SVT' }, // Argentina – Österrike
  m59: { date: '23 jun', dateSortKey: '2026-06-23', time: '04:00', channel: 'TV4' }, // Jordanien – Algeriet
  m57: { date: '28 jun', dateSortKey: '2026-06-28', time: '03:00', channel: 'SVT' }, // Argentina – Jordanien
  m58: { date: '28 jun', dateSortKey: '2026-06-28', time: '03:00', channel: 'TV4' }, // Algeriet – Österrike

  // ── Grupp K ──
  m61: { date: '17 jun', dateSortKey: '2026-06-17', time: '19:00', channel: 'SVT' }, // Portugal – DR Kongo
  m66: { date: '18 jun', dateSortKey: '2026-06-18', time: '04:00', channel: 'TV4' }, // Uzbekistan – Colombia
  m62: { date: '23 jun', dateSortKey: '2026-06-23', time: '19:00', channel: 'SVT' }, // Portugal – Uzbekistan
  m65: { date: '24 jun', dateSortKey: '2026-06-24', time: '04:00', channel: 'TV4' }, // Colombia – DR Kongo
  m63: { date: '28 jun', dateSortKey: '2026-06-28', time: '01:30', channel: 'TV4' }, // Colombia – Portugal
  m64: { date: '28 jun', dateSortKey: '2026-06-28', time: '01:30', channel: 'TV4' }, // DR Kongo – Uzbekistan

  // ── Grupp L ──
  m67: { date: '17 jun', dateSortKey: '2026-06-17', time: '21:00', channel: 'SVT' }, // England – Kroatien
  m72: { date: '18 jun', dateSortKey: '2026-06-18', time: '01:00', channel: 'TV4' }, // Ghana – Panama
  m68: { date: '23 jun', dateSortKey: '2026-06-23', time: '22:00', channel: 'SVT' }, // England – Ghana
  m71: { date: '24 jun', dateSortKey: '2026-06-24', time: '01:00', channel: 'TV4' }, // Panama – Kroatien
  m69: { date: '27 jun', dateSortKey: '2026-06-27', time: '23:00', channel: 'SVT' }, // England – Panama
  m70: { date: '27 jun', dateSortKey: '2026-06-27', time: '23:00', channel: 'TV4' }, // Kroatien – Ghana
};
