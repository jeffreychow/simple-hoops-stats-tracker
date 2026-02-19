import { useState, useEffect } from 'react';
import { Player } from '../state/gameState';
import { loadRoster, saveRoster } from '../state/gameState';

interface RosterScreenProps {
  onStartGame: (roster: Player[]) => void;
}

export default function RosterScreen({ onStartGame }: RosterScreenProps) {
  const [roster, setRoster] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlayer, setNewPlayer] = useState({ name: '', number: '' });

  useEffect(() => {
    const savedRoster = loadRoster();
    if (savedRoster.length > 0) {
      setRoster(savedRoster);
    }
  }, []);

  const addPlayer = () => {
    if (newPlayer.name.trim() && newPlayer.number.trim()) {
      const player: Player = {
        id: Date.now().toString(),
        name: newPlayer.name.trim(),
        number: newPlayer.number.trim(),
      };
      const updated = [...roster, player];
      setRoster(updated);
      saveRoster(updated);
      setNewPlayer({ name: '', number: '' });
    }
  };

  const updatePlayer = (id: string, field: 'name' | 'number', value: string) => {
    const updated = roster.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    );
    setRoster(updated);
    saveRoster(updated);
  };

  const removePlayer = (id: string) => {
    const updated = roster.filter(p => p.id !== id);
    setRoster(updated);
    saveRoster(updated);
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleStartGame = () => {
    if (roster.length > 0) {
      onStartGame(roster);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-blue-900">
          Game Roster
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Player</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Jersey Number"
              value={newPlayer.number}
              onChange={(e) => setNewPlayer({ ...newPlayer, number: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={3}
            />
            <input
              type="text"
              placeholder="Player Name"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <button
              onClick={addPlayer}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              Add
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Players ({roster.length})
          </h2>
          {roster.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No players added yet. Add players above to get started.
            </p>
          ) : (
            <div className="space-y-3">
              {roster.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  {editingId === player.id ? (
                    <>
                      <input
                        type="text"
                        value={player.number}
                        onChange={(e) =>
                          updatePlayer(player.id, 'number', e.target.value)
                        }
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength={3}
                      />
                      <input
                        type="text"
                        value={player.name}
                        onChange={(e) =>
                          updatePlayer(player.id, 'name', e.target.value)
                        }
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                      >
                        Done
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                        {player.number}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-lg">{player.name}</div>
                        <div className="text-sm text-gray-500">#{player.number}</div>
                      </div>
                      <button
                        onClick={() => setEditingId(player.id)}
                        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removePlayer(player.id)}
                        className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleStartGame}
          disabled={roster.length === 0}
          className="w-full py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-lg"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
