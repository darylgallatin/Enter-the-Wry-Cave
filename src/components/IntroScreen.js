// ==================== INTRO SCREEN COMPONENT ====================
/**
 * IntroScreen.js - Game introduction and start interface with developer tools
 * 
 * This component serves as the gateway to the game, providing an atmospheric
 * introduction with narrative storytelling, game controls, and developer testing
 * features. It creates the first impression for players and sets the tone for
 * the entire game experience with humor and personality.
 * 
 * Key Features:
 * - **Animated Story Introduction**: Fade-in narrative paragraphs with timing
 * - **Game Start Controls**: New game and continue game functionality
 * - **Developer Testing Mode**: Room selection for development and debugging
 * - **Save Game Integration**: Continue option when saved games exist
 * - **Atmospheric Styling**: Background management and visual effects
 * 
 * Design Philosophy:
 * - **Humor Integration**: Establishes the game's comedic tone from the start 
 *   **BUT YOU CAN STILL DIE IN A VARIETY OF HORRIBLE WAYS
 * - **Narrative Immersion**: Rich storytelling to engage players immediately
 * - **User Experience**: Clear, intuitive controls with appropriate feedback
 * - **Developer Support**: Built-in testing tools for efficient development
 */

import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import '../styles/TextStyles.css';
import '../styles/IntroScreen.css';
import FadeInParagraphs from './FadeInParagraphs';

// ==================== NARRATIVE CONTENT CONSTANTS ====================
/**
 * Main story introduction paragraphs
 * 
 * These paragraphs establish the game's narrative foundation, introducing
 * the player to the cave setting, the treasure hunt premise, and the various
 * dangers awaiting them. The writing style establishes the game's humorous
 * and irreverent tone while providing essential plot information.
 * 
 * Narrative Elements:
 * - **Village Elder Setup**: Establishes the quest motivation (curse-breaking)
 * - **Entrance Sequence**: Describes how the player becomes trapped
 * - **Danger Introduction**: Warns about the Druika and other hazards
 * - **Objective Clarification**: Explains what the player needs to accomplish
 * 
 * Tone and Style:
 * - **Dark Humor**: Combines danger with comedic elements
 * - **Irreverent Voice**: Playful, sarcastic narrative style
 * - **Atmospheric Details**: Vivid descriptions that build immersion
 * - **Player Engagement**: Direct address to create personal investment
 */
const paragraphs = [
  "The village elder, three sheets to the wind on turnip wine, swore this cave held curse-breaking treasures. For generations, treasure hunters entered. None returned, though someone keeps leaving one-star Village Cryer reviews.",
  
  "Following his napkin map through the thick brush and unfriendly wildlife to the entrance at dawn. As you step inside you see a little rodent looking up at you and you swear it winked at you like it knew it would be the last time it would see you. You step inside — A rude flash of light later, the entrance is gone—sealed like the cave's passive-aggressive way of saying 'welcome.'",
  
  "Legend speaks of the Druika, an ancient horror with anger management issues and breath that could peel paint. The elder's slurred warnings: 'Bottomless pits! Giant bats! And the Druika cheats at everything! And then eats you! The audacity!'",
  
  "Trapped in this stone comedy club, you need the treasure map, all artifacts, and an exit that's playing hide-and-seek. Your village awaits—already carving your memorial plaque and a sad epitaph."
];

/**
 * Warning text for final atmospheric emphasis
 * 
 * This concluding warning serves as a bridge between the story introduction
 * and the game start, emphasizing the challenging and unpredictable nature
 * of the cave while maintaining the established humorous tone.
 * 
 * Key Elements:
 * - **Chamber Description**: "Thirty twisted chambers" sets exploration scope
 * - **Tone Establishment**: "sarcastic commentary from the darkness"
 * - **Player Advice**: "Listen carefully" hints at audio/text importance
 * - **Personality Attribution**: "even the echoes here have attitude"
 */
const warningText =
  "Thirty twisted chambers mock geometry itself. Each step brings salvation, doom, or sarcastic commentary from the darkness. Listen carefully—even the echoes here have attitude.";

// ==================== INTRO SCREEN COMPONENT DEFINITION ====================
/**
 * Main IntroScreen functional component
 * 
 * This component orchestrates the complete introduction experience, managing
 * narrative display, user interactions, developer tools, and transition to
 * the main game. It serves as both a story gateway and a functional interface.
 */
const IntroScreen = () => {
  
  // ========== GAME CONTEXT INTEGRATION ==========
  /**
   * Essential game functions for intro screen functionality
   * 
   * These functions provide the core capabilities needed for game initialization,
   * save game management, and transition from intro to gameplay.
   */
  const { 
    startGame,        // Function to initialize new game session
    loadGame,         // Function to load existing saved game
    hasSavedGame      // Function to check for existing save data
  } = useGame();

  // ========== DEVELOPER TESTING STATE MANAGEMENT ==========
  /**
   * Developer testing mode state variables
   * 
   * These state variables enable developer testing functionality, allowing
   * for quick testing of specific rooms and game scenarios during development.
   */
  const [testMode, setTestMode] = useState(false);      // Toggle for developer testing mode
  const [testRoom, setTestRoom] = useState('');         // Specific room number for testing

  // ==================== BACKGROUND STYLING MANAGEMENT ====================
  /**
   * Body class management for intro-specific styling
   * 
   * This effect manages the application of intro-specific background styling
   * by adding/removing a body class. This allows for intro-specific visual
   * effects that differ from the main game appearance.
   */
  useEffect(() => {
    document.body.classList.add('intro-active');
    return () => document.body.classList.remove('intro-active');
  }, []);

  // ==================== GAME START HANDLER ====================
  /**
   * Intelligent game start handler with testing mode support
   * 
   * This function manages the transition from intro screen to active gameplay,
   * with conditional logic to support both normal play and developer testing
   * scenarios.
   */
  const handleStartGame = () => {
    if (testMode && testRoom) {
      startGame(testRoom);
    } else {
      startGame();
    }
  };

  // ==================== CONTINUE GAME HANDLER ====================
  /**
   * Simple continue game handler for save system integration
   * 
   * This function provides a direct interface to the load game functionality,
   * allowing players to resume their previous game session from the intro screen.
   */
  const handleContinueGame = () => {
    loadGame();
  };

  // ==================== DEVELOPER MODE TOGGLE ====================
  /**
   * Developer testing mode toggle handler
   * 
   * This function manages the activation/deactivation of developer testing
   * mode, controlling the visibility and functionality of testing features.
   */
  const toggleTestMode = () => {
    setTestMode(!testMode);
  };

  // ==================== MAIN COMPONENT RENDER ====================
  /**
   * Complete intro screen interface with narrative and controls
   * 
   * This render method creates the full introduction experience, combining
   * animated storytelling with functional game controls and optional
   * developer testing features.
   */
  return (
    <div className="intro-container">
      
      {/* ==================== GAME TITLE ==================== 
       * Main game title with distinctive styling that establishes
       * the game's personality and creates immediate visual impact.
       */}
      <h1 className="intro-title">Enter the Wry Descent</h1>
      
      {/* ==================== ANIMATED STORY SECTION ==================== 
       * Sophisticated animated storytelling component that creates an
       * engaging narrative introduction with timed fade-in effects.
       */}
      <div className="intro-story">
        <FadeInParagraphs
          paragraphs={paragraphs}
          warningText={warningText}
          fadeDuration={800}
          paragraphDelay={3200}
        />
      </div>
      
      {/* ==================== GAME CONTROLS SECTION ==================== 
       * Primary interface controls for game initialization and continuation,
       * including conditional save game functionality and developer tools.
       */}
      <div className="intro-controls">
        
        {/* === PRIMARY START BUTTON ===  */}
        <button className="start-btn" onClick={handleStartGame}>
          Make Questionable Life Choices
        </button>
        
        {/* === CONDITIONAL CONTINUE BUTTON ===  */}
        {hasSavedGame() && (
          <button className="continue-btn" onClick={handleContinueGame}>
            Continue Previous Mistake
          </button>
        )}
        
        {/* ==================== DEVELOPER TESTING CONTROLS ==================== */}
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
