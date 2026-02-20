import { GameState, calculatePlayerStats, calculateTeamStats } from '../state/gameState';
import { exportGameToCSV } from '../utils/exportCSV';

interface SummaryScreenProps {
  gameState: GameState;
  onNewGame: () => void;
}

export default function SummaryScreen({ gameState, onNewGame }: SummaryScreenProps) {
  const { roster, events, period, teamScore, opponentScore } = gameState;
  const teamStats = calculateTeamStats(roster, events);

  const handleExport = () => {
    exportGameToCSV(gameState);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-center mb-6 text-blue-900">
            Game Summary
          </h1>
          
          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Team</div>
              <div className="text-4xl font-bold text-blue-600">{teamScore}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">vs</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Opponent</div>
              <div className="text-4xl font-bold text-red-600">{opponentScore}</div>
            </div>
          </div>

          <div className="text-center text-gray-600 mb-6">
            Period {period}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Player Statistics</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-2">Player</th>
                  <th className="text-center p-2">Pts</th>
                  <th className="text-center p-2">2PT M/A</th>
                  <th className="text-center p-2">3PT M/A</th>
                  <th className="text-center p-2">Reb</th>
                  <th className="text-center p-2">Ast</th>
                  <th className="text-center p-2">Stl</th>
                  <th className="text-center p-2">Blk</th>
                  <th className="text-center p-2">Foul</th>
                  <th className="text-center p-2">TO</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((player) => {
                  const stats = calculatePlayerStats(player, events);
                  return (
                    <tr key={player.id} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">
                        #{player.number} {player.name}
                      </td>
                      <td className="text-center p-2 font-bold">{stats.points}</td>
                      <td className="text-center p-2">
                        {stats['2pt-made']}/{stats['2pt-made'] + stats['2pt-missed']}
                      </td>
                      <td className="text-center p-2">
                        {stats['3pt-made']}/{stats['3pt-made'] + stats['3pt-missed']}
                      </td>
                      <td className="text-center p-2">{stats.rebounds}</td>
                      <td className="text-center p-2">{stats.assists}</td>
                      <td className="text-center p-2">{stats.steals}</td>
                      <td className="text-center p-2">{stats.blocks}</td>
                      <td className="text-center p-2">{stats.fouls}</td>
                      <td className="text-center p-2">{stats.turnovers}</td>
                    </tr>
                  );
                })}
                <tr className="border-t-2 border-gray-400 font-bold bg-gray-100">
                  <td className="p-2">Team Total</td>
                  <td className="text-center p-2">{teamStats.points}</td>
                  <td className="text-center p-2">
                    {teamStats['2pt-made']}/{teamStats['2pt-made'] + teamStats['2pt-missed']}
                  </td>
                  <td className="text-center p-2">
                    {teamStats['3pt-made']}/{teamStats['3pt-made'] + teamStats['3pt-missed']}
                  </td>
                  <td className="text-center p-2">{teamStats.rebounds}</td>
                  <td className="text-center p-2">{teamStats.assists}</td>
                  <td className="text-center p-2">{teamStats.steals}</td>
                  <td className="text-center p-2">{teamStats.blocks}</td>
                  <td className="text-center p-2">{teamStats.fouls}</td>
                  <td className="text-center p-2">{teamStats.turnovers}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleExport}
            className="flex-1 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg"
          >
            Export CSV
          </button>
          <button
            onClick={onNewGame}
            className="flex-1 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
