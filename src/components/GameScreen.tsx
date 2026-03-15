import { useState, useEffect } from 'react';
import { GameState, StatType, GameEvent, calculatePlayerStats, calculateTeamStats } from '../state/gameState';
import { saveState } from '../state/gameState';
import { exportGameToCSV } from '../utils/exportCSV';
import VoiceInput from './VoiceInput';

interface GameScreenProps {
  initialState: GameState;
  onEndGame: (finalState: GameState) => void;
}

const STAT_BUTTONS: { type: StatType; label: string; color: string }[] = [
  { type: '2pt-make', label: '2PT ✓', color: 'bg-green-600 hover:bg-green-700' },
  { type: '2pt-miss', label: '2PT ✗', color: 'bg-red-600 hover:bg-red-700' },
  { type: '3pt-make', label: '3PT ✓', color: 'bg-green-600 hover:bg-green-700' },
  { type: '3pt-miss', label: '3PT ✗', color: 'bg-red-600 hover:bg-red-700' },
  { type: 'ft-make', label: 'FT ✓', color: 'bg-green-600 hover:bg-green-700' },
  { type: 'ft-miss', label: 'FT ✗', color: 'bg-red-600 hover:bg-red-700' },
  { type: 'rebound', label: 'Reb', color: 'bg-blue-600 hover:bg-blue-700' },
  { type: 'assist', label: 'Ast', color: 'bg-purple-600 hover:bg-purple-700' },
  { type: 'steal', label: 'Stl', color: 'bg-yellow-600 hover:bg-yellow-700' },
  { type: 'block', label: 'Blk', color: 'bg-indigo-600 hover:bg-indigo-700' },
  { type: 'foul', label: 'Foul', color: 'bg-orange-600 hover:bg-orange-700' },
  { type: 'turnover', label: 'TO', color: 'bg-pink-600 hover:bg-pink-700' },
];

const STAT_EVENT_LABELS: Record<StatType, string> = {
  '2pt-make': '2 point made',
  '2pt-miss': '2 point missed',
  '3pt-make': '3 point made',
  '3pt-miss': '3 point missed',
  'ft-make': 'free throw made',
  'ft-miss': 'free throw missed',
  'rebound': 'rebound',
  'assist': 'assist',
  'steal': 'steal',
  'block': 'block',
  'foul': 'foul',
  'turnover': 'turnover',
};

export default function GameScreen({ initialState, onEndGame }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  const updateEvent = (eventId: string, updates: { playerId?: string; statType?: StatType }) => {
    setGameState((prev) => ({
      ...prev,
      events: prev.events.map((e) =>
        e.id === eventId ? { ...e, ...updates } : e
      ),
    }));
    setEditingEventId(null);
  };

  const deleteEvent = (eventId: string) => {
    setGameState((prev) => ({
      ...prev,
      events: prev.events.filter((e) => e.id !== eventId),
    }));
    setEditingEventId(null);
  };

  const recordStat = (statType: StatType, playerId?: string) => {
    setGameState((prev) => {
      const targetPlayerId = playerId || prev.activePlayerId;
      if (!targetPlayerId) {
        alert('Please select a player first');
        return prev;
      }

      const timestamp = Date.now();
      const event: GameEvent = {
        id: `${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
        playerId: targetPlayerId,
        statType,
        timestamp,
      };

      return {
        ...prev,
        events: [...prev.events, event],
        activePlayerId: targetPlayerId,
      };
    });
  };

  const setActivePlayer = (playerId: string) => {
    setGameState((prev) => ({
      ...prev,
      activePlayerId: playerId,
    }));
  };

  const nextPeriod = () => {
    setGameState((prev) => ({
      ...prev,
      period: prev.period + 1,
    }));
  };

  const updateScore = (team: 'team' | 'opponent', delta: number) => {
    setGameState((prev) => ({
      ...prev,
      teamScore: team === 'team' ? Math.max(0, prev.teamScore + delta) : prev.teamScore,
      opponentScore: team === 'opponent' ? Math.max(0, prev.opponentScore + delta) : prev.opponentScore,
    }));
  };

  const teamStats = calculateTeamStats(gameState.roster, gameState.events);
  const activePlayer = gameState.roster.find(p => p.id === gameState.activePlayerId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-blue-900 text-white p-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">Game Stats</h1>
            <button
              onClick={() => exportGameToCSV(gameState)}
              className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 text-sm font-medium"
            >
              Export CSV
            </button>
            <button
              onClick={() => onEndGame(gameState)}
              className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-sm font-medium"
            >
              End Game
            </button>
          </div>
          <div className="flex justify-between items-center">
            <div className="text-center">
              <div className="text-sm opacity-80">Team</div>
              <div className="text-3xl font-bold">{gameState.teamScore}</div>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-80">Period {gameState.period}</div>
              <button
                onClick={nextPeriod}
                className="mt-1 px-3 py-1 bg-blue-700 rounded hover:bg-blue-600 text-sm"
              >
                Next Period
              </button>
            </div>
            <div className="text-center">
              <div className="text-sm opacity-80">Opponent</div>
              <div className="text-3xl font-bold">{gameState.opponentScore}</div>
            </div>
          </div>
          <div className="flex gap-2 mt-2 justify-center">
            <button
              onClick={() => updateScore('team', 1)}
              className="px-2 py-1 bg-green-600 rounded text-xs"
            >
              Team +1
            </button>
            <button
              onClick={() => updateScore('team', -1)}
              className="px-2 py-1 bg-red-600 rounded text-xs"
            >
              Team -1
            </button>
            <button
              onClick={() => updateScore('opponent', 1)}
              className="px-2 py-1 bg-green-600 rounded text-xs"
            >
              Opp +1
            </button>
            <button
              onClick={() => updateScore('opponent', -1)}
              className="px-2 py-1 bg-red-600 rounded text-xs"
            >
              Opp -1
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* Active Player Indicator */}
        {activePlayer && (
          <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-3 mb-4 text-center">
            <div className="text-sm text-gray-600">Active Player</div>
            <div className="text-xl font-bold text-yellow-900">
              #{activePlayer.number} {activePlayer.name}
            </div>
          </div>
        )}

        {/* Player Strip */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Select Player</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gameState.roster.map((player) => {
              const isActive = player.id === gameState.activePlayerId;
              const playerStats = calculatePlayerStats(player, gameState.events);
              return (
                <button
                  key={player.id}
                  onClick={() => setActivePlayer(player.id)}
                  className={`flex-shrink-0 flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      isActive ? 'bg-blue-600' : 'bg-gray-400'
                    }`}
                  >
                    {player.number}
                  </div>
                  <div className="text-xs mt-1 font-medium truncate max-w-[60px]">
                    {player.name}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {playerStats.points} pts
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Stat Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Record Stat</h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {STAT_BUTTONS.map(({ type, label, color }) => (
              <button
                key={type}
                onClick={() => recordStat(type)}
                disabled={!gameState.activePlayerId}
                className={`py-4 px-2 rounded-lg text-white font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 ${color}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Input */}
        <div className="mb-4">
          <VoiceInput
            roster={gameState.roster}
            onStatRecorded={recordStat}
            onPlayerSelected={setActivePlayer}
          />
        </div>

        {/* Event Log */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="text-lg font-semibold mb-3">Event Log</h2>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
            {gameState.events.length === 0 ? (
              <div className="p-4 text-sm text-gray-500 text-center">No events yet</div>
            ) : (
              <ul className="divide-y divide-gray-200 text-sm">
                {[...gameState.events].reverse().map((event) => {
                  const player = gameState.roster.find(p => p.id === event.playerId);
                  const time = new Date(event.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' });
                  return (
                    <li
                      key={event.id}
                      className="px-3 py-2 flex items-center gap-2 flex-wrap rounded transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => setEditingEventId(event.id)}
                        className="flex-1 min-w-0 flex items-center gap-2 flex-wrap text-left cursor-pointer hover:bg-blue-50 rounded transition-colors"
                      >
                        <span className="text-gray-500 font-mono shrink-0">{time}</span>
                        <span className="font-medium">
                          #{player?.number ?? '?'} {player?.name ?? 'Unknown'}
                        </span>
                        <span className="text-gray-700">{STAT_EVENT_LABELS[event.statType]}</span>
                        <span className="ml-auto text-gray-400 text-xs">tap to edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-100 rounded shrink-0"
                        title="Delete event"
                        aria-label="Delete event"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Live Totals */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-3">Live Totals</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Player</th>
                  <th className="text-center p-2">Pts</th>
                  <th className="text-center p-2">2PT</th>
                  <th className="text-center p-2">3PT</th>
                  <th className="text-center p-2">FT</th>
                  <th className="text-center p-2">Reb</th>
                  <th className="text-center p-2">Ast</th>
                  <th className="text-center p-2">Stl</th>
                  <th className="text-center p-2">Blk</th>
                  <th className="text-center p-2">Foul</th>
                  <th className="text-center p-2">TO</th>
                </tr>
              </thead>
              <tbody>
                {gameState.roster.map((player) => {
                  const stats = calculatePlayerStats(player, gameState.events);
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
                      <td className="text-center p-2">
                        {stats['ft-made']}/{stats['ft-made'] + stats['ft-missed']}
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
                  <td className="text-center p-2">
                    {teamStats['ft-made']}/{teamStats['ft-made'] + teamStats['ft-missed']}
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
      </div>

      {/* Edit Event Modal */}
      {editingEventId && (() => {
        const event = gameState.events.find((e) => e.id === editingEventId);
        if (!event) return null;
        return (
          <EditEventModal
            key={editingEventId}
            event={event}
            roster={gameState.roster}
            statLabels={STAT_EVENT_LABELS}
            statTypes={STAT_BUTTONS.map((b) => b.type)}
            onSave={(playerId, statType) => updateEvent(editingEventId, { playerId, statType })}
            onDelete={() => deleteEvent(editingEventId)}
            onCancel={() => setEditingEventId(null)}
          />
        );
      })()}
    </div>
  );
}

interface EditEventModalProps {
  event: GameEvent;
  roster: GameState['roster'];
  statLabels: Record<StatType, string>;
  statTypes: StatType[];
  onSave: (playerId: string, statType: StatType) => void;
  onDelete: () => void;
  onCancel: () => void;
}

function EditEventModal({
  event,
  roster,
  statLabels,
  statTypes,
  onSave,
  onDelete,
  onCancel,
}: EditEventModalProps) {
  const [playerId, setPlayerId] = useState(event.playerId);
  const [statType, setStatType] = useState<StatType>(event.statType);

  const handleSave = () => {
    onSave(playerId, statType);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Correct Event</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
            <select
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {roster.map((p) => (
                <option key={p.id} value={p.id}>
                  #{p.number} {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Stat</label>
            <select
              value={statType}
              onChange={(e) => setStatType(e.target.value as StatType)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statTypes.map((type) => (
                <option key={type} value={type}>
                  {statLabels[type]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Save
          </button>
          <button
            onClick={onDelete}
            className="w-full py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-medium"
          >
            Delete event
          </button>
          <button
            onClick={onCancel}
            className="w-full py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
