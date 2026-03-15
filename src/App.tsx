import { useState, useEffect } from 'react';
import { GameState, Player, createInitialState, loadState } from './state/gameState';
import RosterScreen from './components/RosterScreen';
import GameScreen from './components/GameScreen';
import SummaryScreen from './components/SummaryScreen';

type Screen = 'roster' | 'game' | 'summary';

export default function App() {
  const [screen, setScreen] = useState<Screen>('roster');
  const [gameState, setGameState] = useState<GameState>(createInitialState());

  useEffect(() => {
    const saved = loadState();
    if (saved.roster.length > 0 && saved.events.length > 0) {
      setGameState(saved);
      setScreen('game');
    }
  }, []);

  const handleStartGame = (roster: Player[]) => {
    const newState: GameState = {
      ...createInitialState(),
      roster,
    };
    setGameState(newState);
    setScreen('game');
  };

  const handleEndGame = (finalState: GameState) => {
    setGameState(finalState);
    setScreen('summary');
  };

  const handleNewGame = () => {
    setGameState(createInitialState());
    setScreen('roster');
  };

  return (
    <>
      {screen === 'roster' && <RosterScreen onStartGame={handleStartGame} />}
      {screen === 'game' && (
        <GameScreen initialState={gameState} onEndGame={handleEndGame} />
      )}
      {screen === 'summary' && (
        <SummaryScreen gameState={gameState} onNewGame={handleNewGame} />
      )}
    </>
  );
}
