export type StatType =
  | '2pt-make'
  | '2pt-miss'
  | '3pt-make'
  | '3pt-miss'
  | 'ft-make'
  | 'ft-miss'
  | 'rebound'
  | 'assist'
  | 'steal'
  | 'block'
  | 'foul'
  | 'turnover';

export interface Player {
  id: string;
  name: string;
  number: string;
}

export interface GameEvent {
  id: string;
  playerId: string;
  statType: StatType;
  timestamp: number;
}

export interface PlayerStats {
  player: Player;
  points: number;
  '2pt-made': number;
  '2pt-missed': number;
  '3pt-made': number;
  '3pt-missed': number;
  'ft-made': number;
  'ft-missed': number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  fouls: number;
  turnovers: number;
}

export interface GameState {
  roster: Player[];
  events: GameEvent[];
  activePlayerId: string | null;
  period: number;
  teamScore: number;
  opponentScore: number;
}

const STORAGE_KEY = 'basketball-stats-game';
const ROSTER_STORAGE_KEY = 'basketball-stats-roster';

export function createInitialState(): GameState {
  return {
    roster: [],
    events: [],
    activePlayerId: null,
    period: 1,
    teamScore: 0,
    opponentScore: 0,
  };
}

export function loadState(): GameState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return createInitialState();
}

export function saveState(state: GameState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

export function loadRoster(): Player[] {
  try {
    const stored = localStorage.getItem(ROSTER_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load roster:', e);
  }
  return [];
}

export function saveRoster(roster: Player[]): void {
  try {
    localStorage.setItem(ROSTER_STORAGE_KEY, JSON.stringify(roster));
  } catch (e) {
    console.error('Failed to save roster:', e);
  }
}

export function calculatePlayerStats(
  player: Player,
  events: GameEvent[]
): PlayerStats {
  const playerEvents = events.filter(e => e.playerId === player.id);
  
  const stats: PlayerStats = {
    player,
    points: 0,
    '2pt-made': 0,
    '2pt-missed': 0,
    '3pt-made': 0,
    '3pt-missed': 0,
    'ft-made': 0,
    'ft-missed': 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    fouls: 0,
    turnovers: 0,
  };

  playerEvents.forEach(event => {
    switch (event.statType) {
      case '2pt-make':
        stats['2pt-made']++;
        stats.points += 2;
        break;
      case '2pt-miss':
        stats['2pt-missed']++;
        break;
      case '3pt-make':
        stats['3pt-made']++;
        stats.points += 3;
        break;
      case '3pt-miss':
        stats['3pt-missed']++;
        break;
      case 'ft-make':
        stats['ft-made']++;
        stats.points += 1;
        break;
      case 'ft-miss':
        stats['ft-missed']++;
        break;
      case 'rebound':
        stats.rebounds++;
        break;
      case 'assist':
        stats.assists++;
        break;
      case 'steal':
        stats.steals++;
        break;
      case 'block':
        stats.blocks++;
        break;
      case 'foul':
        stats.fouls++;
        break;
      case 'turnover':
        stats.turnovers++;
        break;
    }
  });

  return stats;
}

export function calculateTeamStats(roster: Player[], events: GameEvent[]): PlayerStats {
  const teamStats: PlayerStats = {
    player: { id: 'team', name: 'Team', number: '' },
    points: 0,
    '2pt-made': 0,
    '2pt-missed': 0,
    '3pt-made': 0,
    '3pt-missed': 0,
    'ft-made': 0,
    'ft-missed': 0,
    rebounds: 0,
    assists: 0,
    steals: 0,
    blocks: 0,
    fouls: 0,
    turnovers: 0,
  };

  roster.forEach(player => {
    const playerStats = calculatePlayerStats(player, events);
    teamStats.points += playerStats.points;
    teamStats['2pt-made'] += playerStats['2pt-made'];
    teamStats['2pt-missed'] += playerStats['2pt-missed'];
    teamStats['3pt-made'] += playerStats['3pt-made'];
    teamStats['3pt-missed'] += playerStats['3pt-missed'];
    teamStats['ft-made'] += playerStats['ft-made'];
    teamStats['ft-missed'] += playerStats['ft-missed'];
    teamStats.rebounds += playerStats.rebounds;
    teamStats.assists += playerStats.assists;
    teamStats.steals += playerStats.steals;
    teamStats.blocks += playerStats.blocks;
    teamStats.fouls += playerStats.fouls;
    teamStats.turnovers += playerStats.turnovers;
  });

  return teamStats;
}
