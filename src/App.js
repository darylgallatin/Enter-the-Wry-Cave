// Update App.js to add inventory panel

import React from 'react';
import './App.css';
import './styles/TextStyles.css';
import './styles/InventoryStyles.css';
import GameBoard from './components/GameBoard';
import Instructions from './components/Instructions';
import GameStats from './components/GameStats';
import IntroScreen from './components/IntroScreen';
import InventoryPanel from './components/InventoryPanel';
import { GameProvider, useGame } from './context/GameContext';

// Create a wrapper component that conditionally renders game or intro
const GameWrapper = () => {
  const { showIntro } = useGame();
  
  return (
    <>
      {showIntro ? (
        <IntroScreen />
      ) : (
        <div className='game-wrapper'>
          <GameBoard />
          <div className="game-sidebar">
            <GameStats />
            <InventoryPanel />
          </div>
          <Instructions />
        </div>
      )}
    </>
  );
};

const App = () => {
  return (
    <GameProvider>
      <GameWrapper />
    </GameProvider>
  );
};

export default App;