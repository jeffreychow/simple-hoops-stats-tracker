import { PlayerStats, GameState } from '../state/gameState';
import { calculatePlayerStats, calculateTeamStats } from '../state/gameState';

export function exportGameToCSV(state: GameState): void {
  const { roster, events } = state;
  
  // Calculate stats for all players
  const playerStatsList: PlayerStats[] = roster.map(player =>
    calculatePlayerStats(player, events)
  );
  
  // Add team totals
  const teamStats = calculateTeamStats(roster, events);
  
  // Create CSV content
  const headers = [
    'Player',
    'Number',
    'Points',
    '2PT Made',
    '2PT Missed',
    '3PT Made',
    '3PT Missed',
    'Rebounds',
    'Assists',
    'Steals',
    'Blocks',
    'Fouls',
    'Turnovers',
  ];
  
  const rows: string[][] = [];
  
  // Add player rows
  playerStatsList.forEach(stats => {
    rows.push([
      stats.player.name,
      stats.player.number,
      stats.points.toString(),
      stats['2pt-made'].toString(),
      stats['2pt-missed'].toString(),
      stats['3pt-made'].toString(),
      stats['3pt-missed'].toString(),
      stats.rebounds.toString(),
      stats.assists.toString(),
      stats.steals.toString(),
      stats.blocks.toString(),
      stats.fouls.toString(),
      stats.turnovers.toString(),
    ]);
  });
  
  // Add team totals row
  rows.push([
    teamStats.player.name,
    '',
    teamStats.points.toString(),
    teamStats['2pt-made'].toString(),
    teamStats['2pt-missed'].toString(),
    teamStats['3pt-made'].toString(),
    teamStats['3pt-missed'].toString(),
    teamStats.rebounds.toString(),
    teamStats.assists.toString(),
    teamStats.steals.toString(),
    teamStats.blocks.toString(),
    teamStats.fouls.toString(),
    teamStats.turnovers.toString(),
  ]);
  
  // Convert to CSV string
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const date = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `basketball-stats-${date}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
