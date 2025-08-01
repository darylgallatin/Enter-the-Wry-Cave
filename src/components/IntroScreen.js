// components/IntroScreen.js
import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import '../styles/TextStyles.css';
import '../styles/IntroScreen.css';


import FadeInParagraphs from './FadeInParagraphs';


const paragraphs = [
  "The village elder, three sheets to the wind on turnip wine, swore this cave held curse-breaking treasures. For generations, treasure hunters entered. None returned, though someone keeps leaving one-star Villiage Cryer reviews.",
  "Following his napkin map through the thick brush and unfriendly wildlife to the entrance at dawn. As you step inside you see a little rodent looking up at you and you swear it winked at you like it knew it would be the last time it would see you. You step inside — A rude flash of light later, the entrance is gone—sealed like the cave's passive-aggressive way of saying 'welcome.'",
  "Legend speaks of the Druika, an ancient horror with anger management issues and breath that could peel paint. The elder's slurred warnings: 'Bottomless pits! Giant bats! And the Druika cheats at everything! And then eats you! The audacity!'",
  "Trapped in this stone comedy club, you need the treasure map, all artifacts, and an exit that's playing hide-and-seek. Your village awaits—already carving your memorial plaque and a sad epitaph."
];

const warningText =
  "Thirty twisted chambers mock geometry itself. Each step brings salvation, doom, or sarcastic commentary from the darkness. Listen carefully—even the echoes here have attitude.";


const IntroScreen = () => {
  const { startGame, loadGame, hasSavedGame } = useGame();
  const [testMode, setTestMode] = useState(false);
  const [testRoom, setTestRoom] = useState('');

  // Add a body class for background handling
  useEffect(() => {
    document.body.classList.add('intro-active');
    return () => document.body.classList.remove('intro-active');
  }, []);

  const handleStartGame = () => {
    if (testMode && testRoom) {
      startGame(testRoom);
    } else {
      startGame();
    }
  };

  const handleContinueGame = () => {
    loadGame();
  };

  const toggleTestMode = () => {
    setTestMode(!testMode);
  };

  return (
    <div className="intro-container">
      <h1 className="intro-title">Cave of Questionable Choices</h1>
      

<div className="intro-story">
  <FadeInParagraphs
    paragraphs={paragraphs}
    warningText={warningText}
    fadeDuration={800}
    paragraphDelay={3200}
  />
</div>
      
      <div className="intro-controls">
        <button className="start-btn" onClick={handleStartGame}>
          Make Questionable Life Choices
        </button>
        
        {hasSavedGame() && (
          <button className="continue-btn" onClick={handleContinueGame}>
            Continue Previous Mistake
          </button>
        )}
        
        <div className="test-controls">
          <label className="test-toggle">
            <input
              type="checkbox"
              checked={testMode}
              onChange={toggleTestMode}
            />
            Developer Testing Mode
          </label>
          
          {testMode && (
            <div className="test-room-input">
              <label>
                Starting Room (1-30):
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={testRoom}
                  onChange={(e) => setTestRoom(e.target.value)}
                />
              </label>
              <p className="test-note">Note: Starting room will still avoid hazards</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntroScreen;