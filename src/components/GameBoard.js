// ==================== GAMEBOARD COMPONENT IMPORTS ====================
/**
 * GameBoard.js - Primary game display and interaction component - The UI orchestration layer
 * 
 * This is the main visual component of the game, responsible for rendering
 * the game world, handling player interactions, managing visual effects,
 * and orchestrating all the various display modes and special scenes.
 * 
 * Key Responsibilities:
 * - **Game World Rendering**: Displays current room, perceptions, and status
 * - **Interactive Controls**: Handles player input and action buttons
 * - **Visual Effects**: Manages mood-based styling and special animations
 * - **Modal Management**: Controls treasure displays, death scenes, and special events
 * - **Audio-Visual Coordination**: Syncs visual effects with game audio
 * - **State Management**: Tracks display states and visual transitions
 */
import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';        // Core game state and functions
import Perceptions from './Perceptions';                  // Environmental perception display
import RoomDescription from './RoomDescription';          // Room narrative display
import { getMoodStyles } from '../data/roomDescriptions'; // Atmospheric styling system
import '../App.css';                                      // Core application styles
import '../styles/TextStyles.css';                       // Typography and text effects
import '../styles/scenes.css';                           // Special scene animations

// ==================== GAMEBOARD COMPONENT DEFINITION ====================
/**
 * Main GameBoard component - the heart of the game's visual presentation
 * 
 * This component serves as the central hub for all game visuals and interactions.
 * It manages a complex array of display states, special scenes, and user interactions
 * while maintaining synchronization with the game's core state.
 */
const GameBoard = () => {
  // ========== GAME CONTEXT DESTRUCTURING ==========
  /**
   * Comprehensive game state and function extraction from GameContext
   * 
   * This destructuring operation pulls in all the necessary game state,
   * functions, and configuration data needed for the GameBoard to operate.
   * The extensive list reflects the complexity of the game's visual systems.
   */
  const { 
    // === CORE GAME STATE ===
    term,                           // Current player input
    message,                        // Current game message
    roomDescription,                // Current room description
    gameStatus,                     // Game state (playing/won/lost)
    batEncounter,                   // Bat encounter state
    perceptions,                    // Environmental perceptions array
    roomMood,                       // Current room's atmospheric mood
    currentPosition,                // Player's current room number
    roomConnections,                // Room connection graph
    history,                        // Game action history
  

    
    // === CORE GAME FUNCTIONS ===
    handleGuess,                    // Player action handler
    handleChange,                   // Input change handler
    resetGame,                      // Game reset function
    
    // === TREASURE SYSTEM ===
    treasurePieces,                 // Treasure objects array
    
    // === ENVIRONMENTAL SYSTEMS ===
    roomHasWater,                   // Water room detection
    throwingRepellent,              // Repellent throwing state
    repellentThrowHandler,          // Repellent throw function
    nightCrawlerWarning,            // Night crawler warning state
    nightCrawlerProtection,         // Night crawler protection status
    
    // === COMMERCE SYSTEMS ===
    showTradeButton,                // Trade button visibility
    handleTrade,                    // Trade function
    showWaterSpiritTradeButton,     // Water spirit trade visibility
    handleWaterSpiritTrade,         // Water spirit trade function
    shopMode,                       // Shop interface mode
    giftShopRoom,                   // Gift shop room ID
    giftShopCatalog,               // Shop item catalog
    
    // === INVENTORY & ITEMS ===
    inventory,                      // Player inventory
    
    // === GAME OUTCOME TRACKING ===
    deathCause,                     // Reason for game loss
    positions,                      // Entity positions
    roomDescriptionMap,             // Room description mapping
    
    // === SPECIAL MECHANICS ===
    handleHiddenRoomTrap,           // Hidden room trap handler
    specialRooms,                   // Special room configurations
    setSpecialRooms,

    // === DISPLAY SYSTEMS ===
    showTreasureDisplay,            // Treasure display visibility
    foundTreasureInfo,              // Found treasure information
    showLadderExtendScene,          // Ladder extension scene
    specialMessage,                 // Special message object
    showWinVideo,                   // Victory video display
    showWinMessage,                 // Victory message display
    setShowWinMessage,              // Victory message controller
    
    // === SAVE SYSTEM ===
    saveGame,                       // Game save function
    loadGame,                       // Game load function
    hasSavedGame,                   // Saved game existence check
    deleteSavedGame,                // Save deletion function
    playLoadGameSound,              // Load game audio
    playDeleteSavedGameSound        // Delete save audio
  } = useGame();

  // ========== DEBUG LOGGING ==========
  /**
   * Debug console output for tracking critical display states
   * These logs help monitor the state of key visual systems during development
   */
  console.log("showWinVideo", showWinVideo);
  console.log("showLadderExtendScene", showLadderExtendScene);
  console.log("Special message in GameBoard:", specialMessage);

  // ==================== COMPONENT STATE MANAGEMENT ====================
  /**
   * Local component state for managing various display modes and visual effects
   * 
   * The GameBoard maintains extensive local state to handle the complex visual
   * presentation requirements of the game. Each state variable controls specific
   * aspects of the display or user interaction flow.
   */
  
  // === VISUAL EFFECTS STATE ===
  const [containerStyle, setContainerStyle] = useState({});     // Dynamic mood-based styling
  const [wizardMode, setWizardMode] = useState(false);          // Wizard encounter visual mode
  const [isWaterRoom, setIsWaterRoom] = useState(false);        // Water room visual effects
  
  // === DISCOVERY & INTERACTION STATE ===
  const [showMapDiscovery, setShowMapDiscovery] = useState(false);    // Map discovery display
  const [oneWayDiscovered, setOneWayDiscovered] = useState(false);    // One-way passage discovery
  const [pulsedButtons, setPulsedButtons] = useState([]);             // Button pulse animation tracking
  
  // === SPECIAL LOCATION DISPLAY STATE ===
  const [showGiftShopDisplay, setShowGiftShopDisplay] = useState(false);        // Gift shop interface
  const [giftShopItems, setGiftShopItems] = useState([]);                       // Shop inventory
  const [showWizardRoomDisplay, setShowWizardRoomDisplay] = useState(false);    // Wizard room interface
  const [hasLeftWizardRoom, setHasLeftWizardRoom] = useState(false);            // Wizard room exit tracking
  const [showShrineDisplay, setShowShrineDisplay] = useState(false);            // Shrine interface
  const [showHiddenRoomDisplay, setShowHiddenRoomDisplay] = useState(false);    // Hidden room interface
  const [showExitRoomDisplay, setShowExitRoomDisplay] = useState(false);        // Exit room interface
  const [showExitWithLadder, setShowExitWithLadder] = useState(false);          // Ladder exit variant
  const [showTranquilPoolDisplay, setShowTranquilPoolDisplay] = useState(false); // Tranquil pool interface
  const [showBoneRoomDisplay, setShowBoneRoomDisplay] = useState(false);


  // === DEATH SCENE DISPLAY STATE ===
  /**
   * Death scene display state variables
   * Each death cause has its own display state for customized death animations
   */
  const showCurseDeathDisplay = gameStatus === 'lost' && deathCause === 'curse';                          // Curse death scene
  const showTrinketTrapDisplay = gameStatus === 'lost' && deathCause === 'trinket_trap';                 // Trinket trap death
  const [showPitDeathDisplay, setShowPitDeathDisplay] = useState(false);                                 // Pit fall death
  const [showDarknessDeathDisplay, setShowDarknessDeathDisplay] = useState(false);                       // Darkness death
  const [showNightCrawlerDeathDisplay, setShowNightCrawlerDeathDisplay] = useState(false);               // Night crawler death
  const [showWumpusDeathDisplay, setShowWumpusDeathDisplay] = useState(false);                           // Wumpus death
  const [showSulfurExplosionDisplay, setShowSulfurExplosionDisplay] = useState(false);                   // Sulfur explosion death
  const [showLadderTrapDisplay, setShowLadderTrapDisplay] = useState(false);                             // Ladder trap death
  const [showMagicalCatastropheDisplay, setShowMagicalCatastropheDisplay] = useState(false);             // Magical catastrophe death
  const [showVortexTrapDisplay, setShowVortexTrapDisplay] = useState(false);                             // Vortex trap death
  const [showNixieRageDeathDisplay, setShowNixieRageDeathDisplay] = useState(false);    
  const [showFungiDeathDisplay, setShowFungiDeathDisplay] = useState(false);                 // Nixie rage death
  
  // === TRAP & HAZARD STATE ===
  const [hiddenRoomTrapActive, setHiddenRoomTrapActive] = useState(false);        // Hidden room trap activation
  
  // ==================== COMPONENT REFS ====================
  /**
   * React refs for tracking component state and DOM manipulation
   */
  const prevPositionRef = useRef(null);           // Previous position tracking for transition detection
  const gameBoardRef = useRef(null);              // Game board container reference for effects

  // ==================== ROOM MOOD & VISUAL EFFECTS SYSTEM ====================
  /**
   * Primary visual effects management system
   * 
   * This effect handles the dynamic visual presentation of the game world,
   * including atmospheric styling, water effects, wizard encounters, and
   * special discovery sequences. It responds to changes in room mood,
   * game messages, and environmental conditions.
   * 
   * Visual Systems Managed:
   * - **Mood-Based Styling**: Dynamic CSS based on room atmosphere
   * - **Water Room Effects**: Special visual treatment for water-themed rooms
   * - **Wizard Encounter Mode**: Dramatic visual effects for wizard interactions
   * - **Map Discovery Sequences**: Special presentation for treasure map discovery
   * 
   * Technical Features:
   * - **Dynamic Style Injection**: Real-time CSS updates based on game state
   * - **Multi-Source Water Detection**: Uses both props and text analysis
   * - **Timed Effect Management**: Automatic cleanup of temporary visual modes
   * - **Discovery State Tracking**: Manages special discovery sequence displays
   * 
   * Performance Considerations:
   * - **Efficient Style Updates**: Only updates styles when mood actually changes
   * - **Automatic Cleanup**: Timer-based cleanup prevents memory leaks
   * - **Selective Re-rendering**: Minimizes unnecessary DOM manipulations
   * 
   * @effects Updates containerStyle, isWaterRoom, wizardMode, showMapDiscovery states
   */
  useEffect(() => {
    // ========== MOOD-BASED STYLING SYSTEM ==========
    const newStyle = getMoodStyles(roomMood);
    setContainerStyle(newStyle);
    
    // ========== WATER ROOM DETECTION AND EFFECTS ==========
    // Multi-source water room detection for comprehensive coverage
    const waterRoomDesc = roomDescription?.toLowerCase().includes('water drips') || 
                        roomDescription?.toLowerCase().includes('droplets') ||
                        roomDescription?.toLowerCase().includes('stream') ||
                        roomDescription?.toLowerCase().includes('pool');
    
    // Combine description analysis with explicit room property
    setIsWaterRoom(waterRoomDesc || roomHasWater);
    
    // ========== WIZARD ENCOUNTER VISUAL MODE ==========
    // Detect wizard encounters and activate special visual effects
    const isWizardMessage = message.includes('Evil Cave Wizard');
    setWizardMode(isWizardMessage);
    
    // ========== TIMED WIZARD EFFECT CLEANUP ==========
    if (isWizardMessage) {
      // Automatically disable wizard mode after dramatic effect duration
      const timer = setTimeout(() => {
        setWizardMode(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    // ========== MAP DISCOVERY SEQUENCE DETECTION ==========
    console.log("Displaying room description:", roomDescription);
    const isMapDiscovery = message.includes('You found an ancient treasure map');
    setShowMapDiscovery(isMapDiscovery);
  }, [roomMood, message, roomDescription, roomHasWater]);

  // ==================== WIZARD ROOM MANAGEMENT SYSTEM ====================
  /**
   * Sophisticated wizard room state management with visit tracking
   * 
   * This effect manages the complex state transitions associated with the wizard's
   * room (room 32), including initial discovery, wizard liberation status, and
   * return visit detection. It coordinates with global wizard state and tracks
   * player movement patterns for contextual display management.
   * 
   * Wizard Room States:
   * - **Initial Discovery**: First-time entry into wizard's sanctum
   * - **Pre-Liberation**: Wizard still imprisoned, player can interact
   * - **Post-Liberation**: Wizard freed, room dynamics changed
   * - **Return Visits**: Subsequent entries after wizard liberation
   * 
   * Movement Tracking:
   * - **Position Transition Detection**: Identifies when player enters/exits room 32
   * - **Previous Position Analysis**: Determines if entry is from another room
   * - **Exit State Management**: Tracks when player leaves after wizard liberation
   * - **Return Visit Recognition**: Detects return trips to freed wizard room
   * 
   * Global State Integration:
   * - **window.WIZARD_FREED**: Global flag indicating wizard liberation status
   * - **Cross-Session Persistence**: Wizard state persists across game sessions
   * - **State Synchronization**: Ensures UI matches actual wizard status
   * 
   * Technical Features:
   * - **Reference-Based Position Tracking**: Uses ref to avoid stale closure issues
   * - **Conditional State Updates**: Only updates when actual changes occur
   * - **Edge Case Handling**: Properly manages initial game state and transitions
   * - **Memory Efficient**: Minimal state updates and clean transition logic
   * 
   * Display Coordination:
   * - **Wizard Room Display**: Controls specialized wizard room interface
   * - **Exit Tracking**: Manages post-liberation room dynamics
   * - **Context-Aware Presentation**: Adapts display based on visit history
   * 
   * @effects Updates showWizardRoomDisplay, hasLeftWizardRoom, prevPositionRef states
   */
  useEffect(() => {
    // ========== WIZARD ROOM ENTRY DETECTION ==========
    if (currentPosition === 32) {
      setShowWizardRoomDisplay(true);
      
      // ========== RETURN VISIT DETECTION ==========
      // Check if wizard is already freed when we enter and this is a return visit
      if (window.WIZARD_FREED && prevPositionRef.current !== 32 && prevPositionRef.current !== null) {
        // We're entering from another room after wizard was freed - mark as return visit
        setHasLeftWizardRoom(true);
      }
    } else {
      // ========== WIZARD ROOM EXIT HANDLING ==========
      setShowWizardRoomDisplay(false);
      
      // ========== POST-LIBERATION EXIT TRACKING ==========
      // If we're leaving room 32 and wizard is freed, mark that we've left
      if (prevPositionRef.current === 32 && window.WIZARD_FREED) {
        setHasLeftWizardRoom(true);
      }
    }
    
    // ========== POSITION REFERENCE UPDATE ==========
    // Update previous position AFTER all checks to ensure proper state transitions
    prevPositionRef.current = currentPosition;
  }, [currentPosition]);


// ==================== DEATH SCENE MANAGEMENT SYSTEMS ====================

// ==================== WUMPUS DEATH DISPLAY CONTROLLER ====================
/**
 * Wumpus death scene display management
 * 
 * This effect controls the visibility of the specialized wumpus death display,
 * providing dramatic visual feedback when the player is killed by the wumpus.
 * It ensures the death scene only appears for actual wumpus-caused deaths.
 * 
 * Death Scene Features:
 * - **Cause-Specific Display**: Only triggers for wumpus deaths
 * - **Automatic State Management**: Handles both show and hide states
 * - **Clean State Transitions**: Ensures proper cleanup when death cause changes
 * - **Visual Drama**: Provides appropriate visual impact for wumpus encounters
 * 
 * Technical Implementation:
 * - **Dual Condition Check**: Validates both game loss and specific death cause
 * - **Automatic Cleanup**: Resets display state when conditions no longer met
 * - **State Synchronization**: Keeps display in sync with actual game status
 * - **Performance Optimized**: Only updates when relevant state actually changes
 * 
 * @effects Updates showWumpusDeathDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'wumpus') {
    setShowWumpusDeathDisplay(true);
  } else {
    setShowWumpusDeathDisplay(false);
  }
}, [gameStatus, deathCause]);

// ==================== HIDDEN ROOM DISPLAY CONTROLLER ====================
/**
 * Hidden room (Room 31) interface management system
 * 
 * This effect manages the specialized display interface for the hidden room,
 * which likely contains unique mechanics, traps, or treasures that require
 * a custom presentation different from standard room displays.
 * 
 * Hidden Room Features:
 * - **Room-Specific Interface**: Custom UI for room 31's unique mechanics
 * - **Automatic Detection**: Activates when player enters hidden room
 * - **Clean Transitions**: Proper interface cleanup when leaving room
 * - **Exclusive Display**: Only shows for the specific hidden room location
 * 
 * Technical Implementation:
 * - **Position-Based Activation**: Direct room number comparison for reliability
 * - **Binary State Control**: Simple show/hide logic for clean state management
 * - **Immediate Response**: Updates instantly when position changes
 * - **Memory Efficient**: Minimal state tracking overhead
 * 
 * @effects Updates showHiddenRoomDisplay state based on current position
 */
useEffect(() => {
  // Check if we're in the hidden room (31)
  if (currentPosition === 31) {
    setShowHiddenRoomDisplay(true);
  } else {
    setShowHiddenRoomDisplay(false);
  }
}, [currentPosition]);

// ==================== HIDDEN ROOM TRAP SYSTEM ====================
/**
 * Advanced hidden room trap management with timed death mechanics
 * 
 * This sophisticated effect manages the hidden room's trap system, which provides
 * players with a brief escape window before triggering a deadly trap. It uses
 * global event listeners and timed death sequences to create tension and allow
 * for dramatic escapes.
 * 
 * Trap Mechanics:
 * - **Event-Driven Activation**: Responds to 'hidden_room_trap' custom events
 * - **Timed Death Sequence**: 5-second countdown before trap triggers death
 * - **Position Validation**: Confirms player is still in room before death
 * - **Escape Opportunity**: Players can avoid death by leaving room quickly
 * 
 * Technical Features:
 * - **Global Event System**: Uses window-level events for cross-component communication
 * - **Timer Management**: Sophisticated timeout handling with cleanup
 * - **State Coordination**: Integrates with GameContext trap handling
 * - **Memory Safety**: Proper event listener cleanup on component unmount
 * 
 * Escape Mechanics:
 * - **Position Verification**: Double-checks player location before executing death
 * - **Timer Storage**: Global timer reference allows for external cleanup
 * - **Grace Period**: 5-second window provides fair escape opportunity
 * - **Visual Feedback**: Activates trap visual effects during countdown
 * 
 * Error Prevention:
 * - **Event Listener Cleanup**: Prevents orphaned listeners after component unmount
 * - **Timer Cleanup**: Clears pending death timers when effect re-runs
 * - **State Validation**: Multiple checks ensure trap only affects intended target
 * 
 * @effects Manages hiddenRoomTrapActive state and death timer coordination
 */
useEffect(() => {
  // ========== TRAP EVENT HANDLER DEFINITION ==========
  const handleTrap = (event) => {
    if (event.detail.trapActive && currentPosition === 31) {
      setHiddenRoomTrapActive(true);
      
      // ========== TIMED DEATH SEQUENCE ==========
      // Set a timer to trigger the actual death after 5 seconds
      const deathTimer = setTimeout(() => {
        // ========== FINAL POSITION VALIDATION ==========
        // Check if player is still in room 31 before executing trap
        if (currentPosition === 31) {
          // Call the GameContext function to handle the actual trap death
          handleHiddenRoomTrap();
        }
      }, 5000); // 5 seconds to escape
      
      // ========== GLOBAL TIMER STORAGE ==========
      // Store the timer so we can clear it if needed from other parts of the game
      window.HIDDEN_ROOM_DEATH_TIMER = deathTimer;
    }
  };
  
  // ========== EVENT LISTENER REGISTRATION ==========
  window.addEventListener('hidden_room_trap', handleTrap);
  
  // ========== CLEANUP FUNCTION ==========
  return () => window.removeEventListener('hidden_room_trap', handleTrap);
}, [currentPosition, handleHiddenRoomTrap]);

// ==================== HIDDEN ROOM TRAP CLEANUP SYSTEM ====================
/**
 * Hidden room escape and trap cleanup management
 * 
 * This effect provides the escape mechanism for the hidden room trap system,
 * automatically clearing trap states and timers when the player successfully
 * escapes room 31. It ensures proper cleanup of the trap system and prevents
 * lingering death timers from affecting gameplay.
 * 
 * Cleanup Operations:
 * - **Visual State Reset**: Clears trap activation visual effects
 * - **Timer Cancellation**: Prevents pending death from executing after escape
 * - **Global State Cleanup**: Resets window-level trap tracking variables
 * - **Safety Reset**: Ensures trap system returns to neutral state
 * 
 * Escape Detection:
 * - **Position-Based Trigger**: Activates when player leaves room 31
 * - **Immediate Response**: Cleanup happens instantly upon room exit
 * - **Comprehensive Reset**: Clears all trap-related state and timers
 * - **Fail-Safe Design**: Multiple cleanup operations ensure complete reset
 * 
 * Technical Features:
 * - **Global Timer Management**: Accesses and clears window-stored timers
 * - **Multi-Variable Reset**: Comprehensive cleanup of all trap-related flags
 * - **Performance Optimized**: Only executes cleanup when actually needed
 * - **Memory Safe**: Prevents timer leaks and orphaned timeout functions
 * 
 * @effects Clears hiddenRoomTrapActive state and global trap timers when escaping
 */
useEffect(() => {
  if (currentPosition !== 31) {
    // ========== VISUAL STATE CLEANUP ==========
    setHiddenRoomTrapActive(false);
    
    // ========== TIMER AND FLAG CLEANUP ==========
    // Clear the timer if player escaped successfully
    if (window.HIDDEN_ROOM_TRAP_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_TRAP_TIMER);
      window.HIDDEN_ROOM_TRAP_TIMER = null;
      window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    }
  }
}, [currentPosition]);

// ==================== LADDER TRAP DEATH DISPLAY CONTROLLER ====================
/**
 * Ladder trap death scene display management
 * 
 * This effect controls the specialized display for ladder trap deaths, providing
 * visual feedback specific to this particular type of death. Ladder traps likely
 * involve the player attempting to use ladders in dangerous situations.
 * 
 * Death Scene Features:
 * - **Trap-Specific Display**: Custom visuals for ladder-related deaths
 * - **Conditional Activation**: Only shows for actual ladder trap deaths
 * - **State Synchronization**: Maintains consistency with game status
 * - **Clean Transitions**: Proper cleanup when death cause changes
 * 
 * Technical Implementation:
 * - **Dual Condition Validation**: Checks both game loss and specific death cause
 * - **Binary State Management**: Simple show/hide logic for reliability
 * - **Immediate Updates**: Responds instantly to game status changes
 * - **Memory Efficient**: Minimal overhead for death scene management
 * 
 * @effects Updates showLadderTrapDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'ladder_trap') {
    setShowLadderTrapDisplay(true);
  } else {
    setShowLadderTrapDisplay(false);
  }
}, [gameStatus, deathCause]);

// ==================== NIGHT CRAWLER DEATH DISPLAY CONTROLLER ====================
/**
 * Night crawler death scene display management
 * 
 * This effect manages the dramatic visual presentation for night crawler deaths,
 * one of the game's signature threat systems. Night crawler deaths likely involve
 * atmospheric horror elements and specialized visual effects.
 * 
 * Death Scene Features:
 * - **Creature-Specific Display**: Custom horror visuals for night crawler deaths
 * - **Atmospheric Presentation**: Likely includes dramatic visual and audio elements
 * - **Conditional Activation**: Only triggers for actual night crawler deaths
 * - **State Management**: Proper show/hide lifecycle management
 * 
 * Technical Implementation:
 * - **Status-Based Activation**: Responds to specific game loss conditions
 * - **Cause Validation**: Ensures display only shows for night crawler deaths
 * - **Clean State Handling**: Automatic cleanup when conditions change
 * - **Performance Optimized**: Efficient state updates with minimal overhead
 * 
 * Integration Notes:
 * - **Audio Coordination**: Likely coordinates with night crawler audio systems
 * - **Visual Effects**: May include special CSS animations or scene presentations
 * - **Timing Coordination**: Could integrate with audio timing for dramatic effect
 * 
 * @effects Updates showNightCrawlerDeathDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'night_crawlers') {
    setShowNightCrawlerDeathDisplay(true);
  } else {
    setShowNightCrawlerDeathDisplay(false);
  }
}, [gameStatus, deathCause]);



// ==================== SULFUR EXPLOSION DEATH DISPLAY CONTROLLER ====================
/**
 * Sulfur explosion death scene display management
 * 
 * This effect controls the specialized visual presentation for sulfur explosion deaths,
 * likely involving dramatic chemical reactions or environmental hazards. The display
 * provides appropriate visual feedback for this specific type of death scenario.
 * 
 * Death Scene Features:
 * - **Chemical Hazard Display**: Custom visuals for sulfur explosion deaths
 * - **Environmental Death Feedback**: Reflects the environmental nature of the hazard
 * - **Conditional Activation**: Only shows for actual sulfur explosion deaths
 * - **State Synchronization**: Maintains consistency with current game status
 * 
 * Technical Implementation:
 * - **Dual Condition Check**: Validates both game loss and specific death cause
 * - **Binary State Control**: Clean show/hide logic for reliable state management
 * - **Instant Response**: Updates immediately when game status changes
 * - **Memory Efficient**: Minimal state overhead for death scene management
 * 
 * @effects Updates showSulfurExplosionDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'sulfur_explosion') {
    setShowSulfurExplosionDisplay(true);
  } else {
    setShowSulfurExplosionDisplay(false);
  }
}, [gameStatus, deathCause]);

// ==================== PIT DEATH DETECTION AND DISPLAY SYSTEM ====================
/**
 * Advanced pit death detection with position validation
 * 
 * This sophisticated effect manages pit death displays by cross-referencing the
 * player's current position with known pit locations. It ensures that pit death
 * scenes only display when the player has actually fallen into a pit, providing
 * accurate and contextual death feedback.
 * 
 * Position-Based Death Detection:
 * - **Multi-Pit Support**: Handles both pit positions (pitPosition1 and pitPosition2)
 * - **Location Verification**: Confirms player is actually in a pit room before showing death
 * - **Status Coordination**: Combines position data with game loss status
 * - **Accurate Feedback**: Ensures death display matches actual death location
 * 
 * Technical Features:
 * - **Comprehensive Validation**: Checks currentPosition, positions object, and game status
 * - **Multi-Condition Logic**: Validates all necessary conditions before activation
 * - **Position Comparison**: Direct comparison with both possible pit locations
 * - **State Safety**: Handles edge cases where position data might be unavailable
 * 
 * Error Prevention:
 * - **Null Checking**: Validates existence of currentPosition and positions data
 * - **Game State Validation**: Only activates during actual game loss scenarios
 * - **Position Accuracy**: Prevents false positives from incorrect position data
 * - **Clean State Management**: Proper cleanup when conditions no longer met
 * 
 * @effects Updates showPitDeathDisplay state based on position, pit locations, and game status
 */
useEffect(() => {
  // Check if we're in a pit room AND the game is lost
  if (currentPosition && positions && gameStatus === 'lost' &&
     (currentPosition === positions.pitPosition1 || currentPosition === positions.pitPosition2)) {
    setShowPitDeathDisplay(true);
  } else {
    setShowPitDeathDisplay(false);
  }
}, [currentPosition, positions, gameStatus]);

// ==================== GIFT SHOP INTERFACE MANAGEMENT SYSTEM ====================
/**
 * Comprehensive gift shop display and inventory management
 * 
 * This sophisticated effect manages the gift shop interface, including item catalog
 * display, inventory filtering, and shop mode coordination. It provides a complete
 * commerce experience with dynamic item availability based on player inventory.
 * 
 * Shop Interface Features:
 * - **Automatic Detection**: Activates when player enters gift shop room
 * - **Dynamic Inventory**: Shows only items not already owned by player
 * - **Item Limiting**: Displays maximum 6 items for manageable interface
 * - **Shop Mode Integration**: Coordinates with broader shop state management
 * 
 * Inventory Management:
 * - **Duplicate Prevention**: Filters out items already in player inventory
 * - **Multi-ID Support**: Handles both regular ID and originalId for robust checking
 * - **Catalog Integration**: Sources items from comprehensive gift shop catalog
 * - **Real-time Updates**: Responds to inventory changes during shop visits
 * 
 * Technical Implementation:
 * - **Catalog Processing**: Transforms catalog data into displayable item format
 * - **Advanced Filtering**: Uses sophisticated inventory comparison logic
 * - **Performance Optimized**: Efficient item processing with early termination
 * - **State Coordination**: Integrates with multiple shop-related state variables
 * 
 * Shop State Coordination:
 * - **Mode Checking**: Respects shopMode state for proper interface control
 * - **Room Validation**: Only activates in the actual gift shop room
 * - **Exit Handling**: Automatically hides interface when leaving shop
 * - **Dependency Management**: Comprehensive dependency array for proper updates
 * 
 * Error Prevention:
 * - **Catalog Validation**: Checks for giftShopCatalog existence before processing
 * - **Safe Object Transformation**: Robust object destructuring and mapping
 * - **Edge Case Handling**: Manages scenarios with empty catalogs or inventories
 * 
 * @effects Updates showGiftShopDisplay and giftShopItems states based on location and inventory
 */
useEffect(() => {
  // Check if we're in the gift shop room
  if (currentPosition === giftShopRoom && !shopMode) {
    // Show gift shop display
    setShowGiftShopDisplay(true);
    // Get available items from catalog
    if (giftShopCatalog) {
      const availableItems = Object.entries(giftShopCatalog)
        .filter(([id, item]) => !inventory.some(inv => inv.id === id || inv.originalId === id))
        .map(([id, item]) => ({
          id,
          ...item
        }))
        .slice(0, 6); // Show max 6 items
      setGiftShopItems(availableItems);
    }
  } else {
    // Hide gift shop display when leaving
    setShowGiftShopDisplay(false);
  }
}, [currentPosition, giftShopRoom, shopMode, inventory, giftShopCatalog]);

// ==================== SHRINE DETECTION AND DISPLAY SYSTEM ====================
/**
 * Intelligent shrine detection with display priority management
 * 
 * This effect manages the detection and display of shrine rooms while respecting
 * display hierarchy to prevent interface conflicts. It uses sophisticated text
 * analysis to identify shrine locations and coordinates with other display systems.
 * 
 * Shrine Detection Features:
 * - **Text-Based Recognition**: Analyzes room descriptions for shrine keywords
 * - **Multi-Keyword Validation**: Requires multiple specific text elements for accuracy
 * - **Display Priority**: Defers to higher-priority displays like map discovery
 * - **Dynamic Detection**: Updates automatically when room descriptions change
 * 
 * Text Analysis System:
 * - **Keyword Matching**: Searches for "small shrine", "Cave goblins", and "magpies"
 * - **Content Validation**: Ensures all required elements are present
 * - **Case-Sensitive Matching**: Uses exact text matching for reliability
 * - **Room Description Integration**: Works with dynamic room description system
 * 
 * Display Hierarchy Management:
 * - **Priority Checking**: Defers to showMapDiscovery for display precedence
 * - **Conflict Prevention**: Avoids simultaneous display of competing interfaces
 * - **Clean State Management**: Properly handles display transitions
 * - **Automatic Cleanup**: Removes display when conditions no longer met
 * 
 * Technical Features:
 * - **Safe Text Access**: Handles cases where room descriptions might be undefined
 * - **Efficient Processing**: Minimizes text analysis overhead
 * - **State Synchronization**: Coordinates with room description updates
 * - **Memory Efficient**: Clean state management without memory leaks
 * 
 * @effects Updates showShrineDisplay state based on room content and display priorities
 */
useEffect(() => {
  // Don't show shrine if map is being displayed
  if (showMapDiscovery) {
    setShowShrineDisplay(false);
    return;
  }
  
  // Check if current room has shrine description
  if (currentPosition && roomDescriptionMap[currentPosition]) {
    const roomText = roomDescriptionMap[currentPosition].text || "";
    if (roomText.includes("small shrine") &&
        roomText.includes("Cave goblins") &&
        roomText.includes("magpies")) {
      setShowShrineDisplay(true);
    } else {
      setShowShrineDisplay(false);
    }
  }
}, [currentPosition, roomDescriptionMap, showMapDiscovery]);



// ==================== BONE ROOM DETECTION AND DISPLAY SYSTEM ====================
/**
 * Intelligent bone room detection with display priority management
 * 
 * This effect manages the detection and display of bone rooms while respecting
 * display hierarchy to prevent interface conflicts. It uses sophisticated text
 * analysis to identify bone room locations and coordinates with other display systems.
 * 
 * Bone Room Detection Features:
 * - **Text-Based Recognition**: Analyzes room descriptions for bone keywords
 * - **Multi-Keyword Validation**: Requires multiple specific text elements for accuracy
 * - **Display Priority**: Defers to higher-priority displays like map discovery
 * - **Dynamic Detection**: Updates automatically when room descriptions change
 * 
 * Text Analysis System:
 * - **Keyword Matching**: Searches for "bones", "arranged in a pattern", and "crunch"
 * - **Content Validation**: Ensures all required elements are present
 * - **Case-Sensitive Matching**: Uses exact text matching for reliability
 * - **Room Description Integration**: Works with dynamic room description system
 * 
 * Display Hierarchy Management:
 * - **Priority Checking**: Defers to showMapDiscovery for display precedence
 * - **Conflict Prevention**: Avoids simultaneous display of competing interfaces
 * - **Clean State Management**: Properly handles display transitions
 * - **Automatic Cleanup**: Removes display when conditions no longer met
 * 
 * @effects Updates showBoneRoomDisplay state based on room content and display priorities
 */
useEffect(() => {
  // Don't show bone room if map is being displayed
  if (showMapDiscovery) {
    setShowBoneRoomDisplay(false);
    return;
  }
  
  // Check if current room has bone room description
  if (currentPosition && roomDescriptionMap[currentPosition]) {
    const roomText = roomDescriptionMap[currentPosition].text || "";
    if (roomText.includes("bones") &&
        roomText.includes("arranged in a pattern") &&
        roomText.includes("crunch")) {
      setShowBoneRoomDisplay(true);
    } else {
      setShowBoneRoomDisplay(false);
    }
  }
}, [currentPosition, roomDescriptionMap, showMapDiscovery]);



// ==================== TRANQUIL POOL DETECTION AND DISPLAY SYSTEM ====================
/**
 * Advanced tranquil pool detection with multi-display conflict resolution
 * 
 * This effect manages the detection and display of tranquil pool rooms while
 * implementing sophisticated conflict resolution with other display systems.
 * It ensures proper display hierarchy and prevents interface conflicts.
 * 
 * Pool Detection Features:
 * - **Specific Text Matching**: Searches for "tranquil pool" and "perfect mirror"
 * - **Multi-Keyword Validation**: Requires multiple elements for accurate identification
 * - **Room Description Analysis**: Analyzes current room text for pool indicators
 * - **Dynamic Updates**: Responds to room description changes automatically
 * 
 * Display Conflict Resolution:
 * - **Multi-Display Checking**: Defers to both map discovery and hidden room displays
 * - **Priority Hierarchy**: Respects higher-priority interface displays
 * - **Clean State Management**: Automatic cleanup when conflicts arise
 * - **Seamless Transitions**: Smooth display transitions without conflicts
 * 
 * Technical Implementation:
 * - **Early Return Logic**: Efficient conflict checking with early exits
 * - **Safe Text Processing**: Handles undefined room descriptions gracefully
 * - **Multi-Dependency Tracking**: Comprehensive dependency array for proper updates
 * - **State Synchronization**: Coordinates with multiple display state variables
 * 
 * Pool-Specific Features:
 * - **Atmospheric Display**: Likely provides serene, water-themed interface
 * - **Environmental Interaction**: May offer unique pool-based interactions
 * - **Visual Enhancement**: Probably includes water-themed visual effects
 * - **Narrative Integration**: Connects with broader water-themed game elements
 * 
 * @effects Updates showTranquilPoolDisplay state based on room content and display conflicts
 */
// Update your existing tranquil pool useEffect
useEffect(() => {
  // Don't show tranquil pool if other displays are active
  if (showMapDiscovery || showHiddenRoomDisplay) {
    setShowTranquilPoolDisplay(false);
    return;
  }
  
  // Check if current room has tranquil pool description
  if (currentPosition && roomDescriptionMap[currentPosition]) {
    const roomText = roomDescriptionMap[currentPosition].text || "";
    // Check for the specific tranquil pool text
    if (roomText.includes("tranquil pool") &&
        roomText.includes("perfect mirror")) {
      setShowTranquilPoolDisplay(true);
      
      // FORCE re-render by toggling state when nixie payment changes
      if (specialRooms[currentPosition]?.tollPaid && 
          specialRooms[currentPosition]?.nixieHasAppeared === false) {
        setShowTranquilPoolDisplay(false);
        setTimeout(() => setShowTranquilPoolDisplay(true), 1);
      }
    } else {
      setShowTranquilPoolDisplay(false);
    }
  }
}, [currentPosition, roomDescriptionMap, showMapDiscovery, showHiddenRoomDisplay, specialRooms]);


// ==================== NIXIE DEATH SCENE CLEANUP CONTROLLER ====================
/**
 * Nixie death scene state management with room-based cleanup
 * 
 * This effect ensures that the nixie death scene display is properly reset when
 * the player leaves the tranquil pool room. This prevents the death scene from
 * persisting when the player returns to the room later, allowing for proper
 * display state transitions.
 * 
 * Cleanup Features:
 * - **Room-Based Reset**: Automatically clears death scene when leaving tranquil pool
 * - **State Synchronization**: Ensures display matches actual room state
 * - **Clean Transitions**: Prevents lingering death scene effects
 * - **Proper State Management**: Maintains consistency between room visits
 * 
 * Technical Implementation:
 * - **Position-Based Trigger**: Only affects rooms with tranquil pool descriptions
 * - **Conditional Reset**: Only clears state when actually leaving the pool room
 * - **State Preservation**: Maintains other nixie-related states appropriately
 * - **Performance Optimized**: Minimal overhead with targeted state updates
 * 
 * @effects Clears showNixieDeathScene when player leaves tranquil pool room
 */
useEffect(() => {
  // Check if we're currently in a tranquil pool room
  const currentRoomText = roomDescriptionMap[currentPosition]?.text || "";
  const isCurrentlyInTranquilPool = currentRoomText.includes("tranquil pool") && 
                                   currentRoomText.includes("perfect mirror");
  
  // If we're NOT in a tranquil pool room, clear any death scene state
  if (!isCurrentlyInTranquilPool && currentPosition) {
    // Find any rooms that have death scenes active and clear them
    setSpecialRooms(prev => {
      const updated = { ...prev };
      let hasChanges = false;
      
      // Loop through all rooms and clear death scenes for non-current rooms
      Object.keys(updated).forEach(roomPos => {
        if (parseInt(roomPos) !== currentPosition && updated[roomPos]?.showNixieDeathScene) {
          updated[roomPos] = {
            ...updated[roomPos],
           
            showNixieDeathScene: false
          };
          hasChanges = true;
        }
      });
      
      return hasChanges ? updated : prev;
    });
  }
}, [currentPosition, roomDescriptionMap, setSpecialRooms]);


// ==================== VORTEX TRAP DEATH DISPLAY CONTROLLER ====================
/**
 * Vortex trap death scene display management
 * 
 * This effect controls the specialized visual presentation for vortex trap deaths,
 * which likely involve dimensional or magical hazards with unique visual effects.
 * Provides appropriate dramatic feedback for this specific type of death scenario.
 * 
 * Death Scene Features:
 * - **Dimensional Hazard Display**: Custom visuals for vortex-related deaths
 * - **Magical Death Feedback**: Reflects the supernatural nature of vortex traps
 * - **Conditional Activation**: Only shows for actual vortex trap deaths
 * - **Dramatic Presentation**: Likely includes swirling or dimensional visual effects
 * 
 * Technical Implementation:
 * - **Status-Based Activation**: Responds to specific game loss conditions
 * - **Cause Validation**: Ensures display only appears for vortex trap deaths
 * - **Clean State Handling**: Automatic cleanup when death cause changes
 * - **Performance Optimized**: Efficient state updates with minimal overhead
 * 
 * Visual Integration:
 * - **Special Effects**: Probably coordinates with CSS animations for vortex effects
 * - **Audio Coordination**: May integrate with vortex-themed audio effects
 * - **Atmospheric Presentation**: Creates immersive dimensional hazard experience
 * 
 * @effects Updates showVortexTrapDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'vortex_trap') {
    setShowVortexTrapDisplay(true);
  } else {
    setShowVortexTrapDisplay(false);
  }
}, [gameStatus, deathCause]);


  // ==================== DARKNESS DEATH DISPLAY CONTROLLER ====================
/**
 * Comprehensive darkness death scene display management
 * 
 * This effect manages the display of darkness-related death scenes, handling both
 * torch and lantern darkness deaths with a unified interface. It provides consistent
 * visual feedback for light-related death scenarios regardless of the specific
 * light source that failed.
 * 
 * Darkness Death Types:
 * - **Torch Darkness**: Death when torch fuel runs out completely
 * - **Lantern Darkness**: Death when lantern fails or runs out of fuel
 * - **Unified Display**: Single interface handles both death types seamlessly
 * - **Consistent Experience**: Provides similar visual feedback for all darkness deaths
 * 
 * Technical Features:
 * - **Multi-Cause Detection**: Handles multiple darkness-related death causes
 * - **OR Logic Implementation**: Uses logical OR to catch both death types
 * - **State Synchronization**: Maintains consistency with game status changes
 * - **Clean Transitions**: Proper state cleanup when death cause changes
 * 
 * Game Design Integration:
 * - **Light Resource Management**: Reflects the critical importance of light sources
 * - **Survival Mechanics**: Emphasizes the deadly nature of cave darkness
 * - **Player Education**: Teaches importance of managing light resources
 * - **Dramatic Impact**: Provides appropriate weight to light-related deaths
 * 
 * @effects Updates showDarknessDeathDisplay for both torch and lantern darkness deaths
 */
useEffect(() => {
  // Check if game is lost due to darkness (either type)
  if (gameStatus === 'lost' && (deathCause === 'torch_darkness' || deathCause === 'lantern_darkness')) {
    setShowDarknessDeathDisplay(true);
  } else {
    setShowDarknessDeathDisplay(false);
  }
}, [gameStatus, deathCause]);

// ==================== DYNAMIC WATER ROOM EFFECTS SYSTEM ====================
/**
 * Advanced water room visual effects with dynamic DOM manipulation
 * 
 * This sophisticated effect creates immersive water room atmospherics through
 * dynamic DOM manipulation, generating animated water drops, ripple effects,
 * and environmental overlays. It provides rich visual feedback for water-themed
 * rooms and creates an engaging environmental experience.
 * 
 * Water Effect Components:
 * - **Animated Water Drops**: 15 randomly positioned drops with varied timing
 * - **Ripple Effects**: Coordinated ripples that sync with drop impacts
 * - **Environmental Overlay**: Subtle water-themed visual enhancement
 * - **Dynamic Positioning**: Randomized drop locations for natural variation
 * 
 * Animation System:
 * - **Randomized Timing**: Each drop has unique delay and duration
 * - **Spread Distribution**: 15-second delay spread for continuous effect
 * - **Variable Speed**: 4-10 second fall durations for realistic variation
 * - **Coordinated Effects**: Ripples time perfectly with drop impacts
 * 
 * Technical Implementation:
 * - **DOM Element Creation**: Dynamically creates water effect elements
 * - **CSS Custom Properties**: Uses CSS variables for flexible animation timing
 * - **Element Cleanup**: Comprehensive cleanup prevents DOM pollution
 * - **Performance Optimized**: Efficient element management and reuse
 * 
 * Ripple Coordination:
 * - **Timing Synchronization**: Ripples appear exactly when drops "hit"
 * - **Size Variation**: Random ripple sizes (10-20px) for natural effect
 * - **Position Matching**: Ripples appear at exact drop impact locations
 * - **Animation Offset**: 90% through drop animation for realistic timing
 * 
 * Element Management:
 * - **Duplicate Prevention**: Clears existing effects before creating new ones
 * - **Selective Cleanup**: Removes only water-related elements
 * - **Memory Safety**: Proper cleanup prevents memory leaks
 * - **State Responsive**: Only activates when actually in water rooms
 * 
 * Visual Enhancements:
 * - **Atmospheric Overlay**: Subtle environmental enhancement
 * - **Realistic Physics**: Drop timing mimics actual water behavior
 * - **Immersive Experience**: Creates believable water room atmosphere
 * - **Performance Conscious**: Balanced between visual impact and performance
 * 
 * @effects Creates/destroys water effect DOM elements based on water room status
 */
useEffect(() => {
  if (isWaterRoom && gameBoardRef.current) {
    const container = gameBoardRef.current;
    
    // ========== CLEANUP EXISTING EFFECTS ==========
    // Clear any existing water drops to prevent accumulation
    const existingDrops = container.querySelectorAll('.gb-water-drop, .gb-water-ripple');
    existingDrops.forEach(el => el.remove());
    
    // ========== WATER DROP GENERATION SYSTEM ==========
    // Create 15 water drops at random positions for rich atmosphere
    for (let i = 0; i < 15; i++) {
      // ========== DROP ELEMENT CREATION ==========
      const drop = document.createElement('div');
      drop.className = 'gb-water-drop';
      
      // ========== RANDOM POSITIONING ==========
      // Random horizontal position (5-95% to keep within viewport)
      const xPos = 5 + Math.random() * 90;
      drop.style.left = `${xPos}%`;
      
      // ========== ANIMATION TIMING RANDOMIZATION ==========
      // Random timing for each drop creates natural variation
      drop.style.setProperty('--drip-delay', `${Math.random() * 15}s`); // More spread out
      drop.style.setProperty('--drip-duration', `${4 + Math.random() * 6}s`); // Slower falls
      
      container.appendChild(drop);
      
      // ========== COORDINATED RIPPLE EFFECT CREATION ==========
      const ripple = document.createElement('div');
      ripple.className = 'gb-water-ripple';
      ripple.style.left = `${xPos}%`; // Match drop position exactly
      
      // ========== RIPPLE SIZE VARIATION ==========
      // Random ripple size for natural variation
      const rippleSize = 10 + Math.random() * 10;
      ripple.style.width = `${rippleSize}px`;
      ripple.style.height = `${rippleSize}px`;
      
      // ========== RIPPLE TIMING SYNCHRONIZATION ==========
      // Match ripple timing to drop timing with offset for impact effect
      const dropDelay = parseFloat(drop.style.getPropertyValue('--drip-delay'));
      const dropDuration = parseFloat(drop.style.getPropertyValue('--drip-duration'));
      ripple.style.setProperty('--ripple-delay', `${dropDelay + dropDuration * 0.9}s`);
      
      container.appendChild(ripple);
    }
    
    // ========== ENVIRONMENTAL OVERLAY SYSTEM ==========
    // Add water overlay if not already present
    if (!container.querySelector('.water-room-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'water-room-overlay';
      container.appendChild(overlay);
    }
    
    // ========== CLEANUP FUNCTION ==========
    // Comprehensive cleanup prevents DOM pollution and memory leaks
    return () => {
      const drops = container.querySelectorAll('.gb-water-drop, .gb-water-ripple, .water-room-overlay');
      drops.forEach(el => el.remove());
    };
  }
}, [isWaterRoom]);

// ==================== ONE-WAY PASSAGE DETECTION SYSTEM ====================
/**
 * Intelligent one-way passage discovery with navigation analysis
 * 
 * This sophisticated effect detects when players discover one-way passages by
 * analyzing room connections and movement history. It provides dynamic feedback
 * for discovering interesting cave topology and enhances exploration mechanics.
 * 
 * Detection Algorithm:
 * - **Bidirectional Testing**: Checks if return movement is possible
 * - **Connection Analysis**: Uses room connection data for validation
 * - **History Integration**: Ensures valid movement context exists
 * - **Real-time Discovery**: Detects one-way passages as they're encountered
 * 
 * One-Way Passage Logic:
 * - **Previous Position Tracking**: Maintains reference to last room
 * - **Return Path Validation**: Tests if reverse movement is available
 * - **Connection Verification**: Uses actual room connection data
 * - **History Context**: Ensures sufficient movement history exists
 * 
 * Technical Features:
 * - **Reference-Based Tracking**: Uses ref to avoid stale closure issues
 * - **Connection Data Integration**: Leverages room connection graph
 * - **Timed Notifications**: Auto-hides discovery message after 5 seconds
 * - **State Management**: Proper cleanup and state transitions
 * 
 * Discovery Feedback:
 * - **Visual Notification**: Shows discovery message to player
 * - **Timed Display**: Message appears for 5 seconds then auto-hides
 * - **Educational Value**: Teaches players about cave navigation
 * - **Exploration Reward**: Provides satisfaction for discovering unique passages
 * 
 * Performance Considerations:
 * - **Efficient Checking**: Quick connection lookups with minimal overhead
 * - **Conditional Processing**: Only runs when sufficient context exists
 * - **Memory Efficient**: Minimal state tracking overhead
 * - **Timer Management**: Proper cleanup of notification timers
 * 
 * @effects Updates oneWayDiscovered state and manages discovery notification timing
 */
useEffect(() => {
  if (prevPositionRef.current && currentPosition) {
    // ========== RETURN PATH VALIDATION ==========
    // Check if we can go back to where we came from
    const canGoBack = roomConnections[currentPosition]?.includes(prevPositionRef.current);
    
    if (!canGoBack && history.length > 1) {
      // ========== ONE-WAY PASSAGE DISCOVERY ==========
      // We've discovered a one-way passage!
      setOneWayDiscovered(true);
      
      // ========== TIMED NOTIFICATION CLEANUP ==========
      // Hide the message after 5 seconds
      setTimeout(() => {
        setOneWayDiscovered(false);
      }, 5000);
    }
  }
  
  // ========== POSITION REFERENCE UPDATE ==========
  // Update previous position for next check
  prevPositionRef.current = currentPosition;
}, [currentPosition, roomConnections, history]);


// ==================== FUNGI DEATH CONTROLLER useEFFECT====================
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'fungi') {
    setShowFungiDeathDisplay(true);
  } else {
    setShowFungiDeathDisplay(false);
  }
}, [gameStatus, deathCause]);







// ==================== TREASURE MAP SHIMMER ANIMATION SYSTEM ====================
/**
 * Advanced treasure clue shimmer animation with cycling effects
 * 
 * This sophisticated animation system creates engaging visual effects for treasure
 * map discovery, cycling through treasure clues with shimmering animations that
 * draw player attention and create excitement around treasure hunting mechanics.
 * 
 * Animation Features:
 * - **Cycling Shimmer Effects**: Rotates through 4 treasure types sequentially
 * - **Timed Animation Cycles**: 1.6-second cycles with 3.5-second shimmer duration
 * - **Visual Hierarchy**: Only one treasure shimmers at a time for focus
 * - **Automatic Cleanup**: Comprehensive cleanup prevents animation artifacts
 * 
 * Treasure Types Animated:
 * - **Ruby Clue**: Precious gem treasure indicator
 * - **Medallion Clue**: Ancient medallion treasure marker
 * - **Statue Clue**: Mystical statue treasure reference
 * - **Amulet Clue**: Magical amulet treasure indicator
 * 
 * Animation Timing System:
 * - **Sequential Cycling**: Moves through treasures in order
 * - **Animation Duration**: 3.5-second shimmer per treasure
 * - **Cycle Interval**: 1.6-second gaps between treasure animations
 * - **Smooth Transitions**: Clean transitions between shimmer effects
 * 
 * Technical Implementation:
 * - **DOM Query System**: Dynamically finds treasure elements by class
 * - **CSS Class Management**: Adds/removes shimmer classes for animation
 * - **Timer Coordination**: Multiple timers manage complex animation timing
 * - **Reflow Forcing**: Ensures animation restarts properly for each cycle
 * 
 * Visual Effects Management:
 * - **Shimmer Class Control**: Precise timing of shimmer-active class
 * - **Global Cleanup**: Removes effects from all treasures before applying new ones
 * - **Animation Restart**: Forces DOM reflow to ensure proper animation timing
 * - **State Responsive**: Only runs when map discovery is actually active
 * 
 * Performance Optimization:
 * - **Efficient DOM Queries**: Minimizes expensive DOM lookups
 * - **Timer Management**: Proper cleanup prevents memory leaks
 * - **Conditional Execution**: Only runs when map discovery is visible
 * - **Animation Cleanup**: Comprehensive cleanup on component unmount
 * 
 * Error Prevention:
 * - **Element Existence Checking**: Validates elements exist before animation
 * - **Timer Cleanup**: Multiple timer cleanup paths prevent memory leaks
 * - **State Validation**: Only runs when showMapDiscovery is true
 * - **Graceful Degradation**: Continues working even if some elements missing
 * 
 * @effects Manages treasure clue shimmer animations during map discovery
 */
useEffect(() => {
  if (!showMapDiscovery) return;

  // ========== ANIMATION CONFIGURATION ==========
  const treasureClasses = ['ruby-clue', 'medallion-clue', 'statue-clue', 'amulet-clue'];
  let currentIndex = 0;
  let animationTimeout = null;
  let cycleInterval = null;

  // ========== SHIMMER ANIMATION FUNCTION ==========
  // Function to animate the next treasure in sequence
  const animateNext = () => {
    // ========== GLOBAL SHIMMER CLEANUP ==========
    // Remove shimmer from ALL elements first for clean transitions
    document.querySelectorAll('.ruby-clue, .medallion-clue, .statue-clue, .amulet-clue').forEach(el => {
      el.classList.remove('shimmer-active');
    });

    // ========== CURRENT TREASURE SELECTION ==========
    // Get the current class and element for animation
    const currentClass = treasureClasses[currentIndex];
    const currentElement = document.querySelector(`.map-clue-list .${currentClass}`);

    if (currentElement) {
      // ========== ANIMATION RESTART MECHANISM ==========
      // Force a reflow to ensure the animation restarts properly
      void currentElement.offsetWidth;
      
      // ========== SHIMMER EFFECT APPLICATION ==========
      // Add shimmer effect to only this element for focused attention
      currentElement.classList.add('shimmer-active');
      
      // ========== SHIMMER CLEANUP TIMER ==========
      // Remove the class after animation completes (3.5s)
      animationTimeout = setTimeout(() => {
        currentElement.classList.remove('shimmer-active');
      }, 3500);
    }

    // ========== CYCLE PROGRESSION ==========
    // Move to next treasure for the next cycle
    currentIndex = (currentIndex + 1) % treasureClasses.length;
  };

  // ========== ANIMATION INITIALIZATION ==========
  // Start animation after ensuring DOM is ready
  const startTimeout = setTimeout(() => {
    // ========== INITIAL ANIMATION ==========
    animateNext();
    
    // ========== REPEATING ANIMATION SETUP ==========
    // Set up repeating animation every 1.6 seconds (3.5s animation + timing gap)
    cycleInterval = setInterval(animateNext, 1600);
  }, 100);

  // ========== COMPREHENSIVE CLEANUP FUNCTION ==========
  return () => {
    // ========== TIMER CLEANUP ==========
    clearTimeout(startTimeout);
    clearTimeout(animationTimeout);
    clearInterval(cycleInterval);
    
    // ========== VISUAL STATE CLEANUP ==========
    // Remove all shimmer classes to prevent visual artifacts
    document.querySelectorAll('.ruby-clue, .medallion-clue, .statue-clue, .amulet-clue').forEach(el => {
      el.classList.remove('shimmer-active');
    });
  };
}, [showMapDiscovery]); // Re-run when map discovery state changes
// ==================== ADVANCED EXIT ROOM MECHANICS SYSTEM ====================
/**
 * Sophisticated exit room display management with item and state validation
 * 
 * This complex effect manages the exit room interface with multiple conditional
 * requirements including wyrmglass possession, lantern state, and game status.
 * It implements sophisticated win condition validation and provides different
 * exit scenarios based on player equipment and choices.
 * 
 * Exit Requirements:
 * - **Position Validation**: Must be in the actual exit room
 * - **Game Status Check**: Only active during gameplay (not won/lost)
 * - **Wyrmglass Requirement**: Player must possess the wyrmglass item
 * - **Lantern State Analysis**: Checks if lantern is active for different endings
 * 
 * Exit Scenarios:
 * - **Standard Exit**: Player has wyrmglass and can leave the cave
 * - **Ladder Exit**: Special scenario when lantern is inactive
 * - **No Exit**: Player lacks required wyrmglass item
 * - **Different Presentations**: UI adapts based on player equipment state
 * 
 * Item Validation System:
 * - **Wyrmglass Detection**: Searches inventory for wyrmglass using flexible ID matching
 * - **Lantern State Checking**: Validates both possession and active status
 * - **Multi-ID Support**: Handles both originalId and regular id for robust detection
 * - **Boolean State Logic**: Uses inventory search results for conditional display
 * 
 * Technical Features:
 * - **Nested Conditional Logic**: Multiple validation layers for accurate state detection
 * - **State Coordination**: Coordinates multiple display flags based on conditions
 * - **Item State Analysis**: Advanced inventory analysis for equipment states
 * - **Exit Cleanup**: Proper state reset when leaving exit room
 * 
 * Game Design Integration:
 * - **Win Condition Enforcement**: Ensures players have required items to win
 * - **Multiple Endings**: Provides different exit experiences based on player choices
 * - **Equipment Significance**: Makes lantern state meaningful for game conclusion
 * - **Player Agency**: Gives players control over how they complete the game
 * 
 * Performance Considerations:
 * - **Efficient Inventory Scanning**: Uses optimized array methods for item detection
 * - **Conditional Processing**: Only runs complex checks when in exit room
 * - **State Minimization**: Clean state management with minimal overhead
 * - **Proper Cleanup**: Resets display state when conditions no longer met
 * 
 * @effects Updates showExitRoomDisplay and showExitWithLadder based on location and equipment
 */
useEffect(() => {
  // Check if we're in the exit room
  if (currentPosition === positions?.exitPosition && gameStatus === 'playing') {
    // ========== WYRMGLASS REQUIREMENT VALIDATION ==========
    // Check if player has wyrmglass (required for exit)
    const hasWyrmglass = inventory.some(item =>
      (item.originalId || item.id) === 'wyrmglass'
    );
    
    if (hasWyrmglass) {
      // ========== LANTERN STATE ANALYSIS ==========
      // Check if lantern is active for different exit scenarios
      const hasActiveLantern = inventory.some(item =>
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      // ========== EXIT DISPLAY CONFIGURATION ==========
      setShowExitRoomDisplay(true);
      setShowExitWithLadder(!hasActiveLantern); // Show ladder only if lantern is OFF
    } else {
      // ========== NO WYRMGLASS - NO EXIT ==========
      setShowExitRoomDisplay(false);
    }
  } else {
    // ========== EXIT ROOM CLEANUP ==========
    setShowExitRoomDisplay(false);
  }
}, [currentPosition, positions, inventory, gameStatus]);

// ==================== MAGICAL CATASTROPHE DEATH DISPLAY CONTROLLER ====================
/**
 * Magical catastrophe death scene display management
 * 
 * This effect controls the specialized visual presentation for magical catastrophe
 * deaths, which likely involve spellcasting failures, magical item mishaps, or
 * supernatural hazards. Provides dramatic feedback for magic-related death scenarios.
 * 
 * Death Scene Features:
 * - **Magic-Themed Display**: Custom visuals for magical catastrophe deaths
 * - **Supernatural Feedback**: Reflects the magical nature of the catastrophe
 * - **Conditional Activation**: Only shows for actual magical catastrophe deaths
 * - **Dramatic Presentation**: Likely includes magical visual effects and animations
 * 
 * Technical Implementation:
 * - **Status-Based Activation**: Responds to specific game loss conditions
 * - **Cause Validation**: Ensures display only appears for magical catastrophe deaths
 * - **Clean State Handling**: Automatic cleanup when death cause changes
 * - **Performance Optimized**: Efficient state updates with minimal overhead
 * 
 * Integration Notes:
 * - **Spell System Integration**: May coordinate with spellcasting mechanics
 * - **Magical Item Coordination**: Could relate to magical item usage failures
 * - **Visual Effects**: Probably includes special CSS animations for magical themes
 * - **Audio Coordination**: May integrate with magical-themed audio effects
 * 
 * @effects Updates showMagicalCatastropheDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'magical_catastrophe') {
    setShowMagicalCatastropheDisplay(true);
  } else {
    setShowMagicalCatastropheDisplay(false);
  }
}, [gameStatus, deathCause]);

// ==================== HIDDEN ROOM TRAP ESCAPE CLEANUP SYSTEM ====================
/**
 * Comprehensive hidden room trap state cleanup on room exit
 * 
 * This effect provides emergency cleanup for hidden room trap states when the
 * player successfully escapes room 31. It ensures all trap-related timers,
 * flags, and visual states are properly reset to prevent lingering effects.
 * 
 * Cleanup Operations:
 * - **Visual State Reset**: Clears trap activation visual indicators
 * - **Global Flag Cleanup**: Resets window-level trap tracking variables
 * - **Timer Cancellation**: Prevents pending death from executing after escape
 * - **Complete State Reset**: Ensures trap system returns to neutral state
 * 
 * Technical Features:
 * - **Position-Based Trigger**: Only executes when leaving room 31
 * - **Global State Management**: Handles window-level trap variables
 * - **Timer Safety**: Prevents orphaned timeout functions
 * - **Comprehensive Reset**: Multiple cleanup operations ensure complete reset
 * 
 * Safety Mechanisms:
 * - **Escape Detection**: Automatically triggers when player leaves dangerous room
 * - **State Synchronization**: Ensures UI reflects actual trap status
 * - **Memory Management**: Prevents timer leaks and orphaned functions
 * - **Fail-Safe Design**: Multiple cleanup paths ensure reliable reset
 * 
 * Performance Considerations:
 * - **Conditional Execution**: Only runs when actually leaving room 31
 * - **Efficient Cleanup**: Minimal overhead for comprehensive state reset
 * - **Memory Safe**: Proper timer cleanup prevents memory leaks
 * - **State Optimization**: Clean state transitions without redundant operations
 * 
 * @effects Clears hiddenRoomTrapActive state and global trap timers when escaping room 31
 */
useEffect(() => {
  if (currentPosition !== 31) {
    // ========== VISUAL STATE CLEANUP ==========
    setHiddenRoomTrapActive(false);
    window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    
    // ========== TIMER AND MEMORY CLEANUP ==========
    // Clear the death timer if player escaped
    if (window.HIDDEN_ROOM_DEATH_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_DEATH_TIMER);
      window.HIDDEN_ROOM_DEATH_TIMER = null;
    }
  }
}, [currentPosition]);

// ==================== NIXIE RAGE DEATH DISPLAY CONTROLLER ====================
/**
 * Nixie rage death scene display management
 * 
 * This effect controls the specialized visual presentation for nixie rage deaths,
 * which likely involve water spirit encounters gone wrong. Provides appropriate
 * feedback for aquatic creature-related death scenarios with water-themed visuals.
 * 
 * Death Scene Features:
 * - **Water Spirit Theme**: Custom visuals for nixie (water spirit) rage deaths
 * - **Aquatic Death Feedback**: Reflects the water-based nature of nixie encounters
 * - **Conditional Activation**: Only shows for actual nixie rage deaths
 * - **Atmospheric Presentation**: Likely includes water-themed visual effects
 * 
 * Technical Implementation:
 * - **Status-Based Activation**: Responds to specific game loss conditions
 * - **Cause Validation**: Ensures display only appears for nixie rage deaths
 * - **Clean State Handling**: Automatic cleanup when death cause changes
 * - **Performance Optimized**: Efficient state updates with minimal overhead
 * 
 * Nixie Encounter Integration:
 * - **Water Spirit Mechanics**: Coordinates with nixie trading and interaction systems
 * - **Rage Trigger Context**: Relates to failed negotiations or hostile encounters
 * - **Aquatic Atmosphere**: Probably includes water-themed visual and audio effects
 * - **Creature Behavior**: Reflects the vengeful nature of enraged water spirits
 * 
 * @effects Updates showNixieRageDeathDisplay state based on game status and death cause
 */
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'nixie_rage') {
    setShowNixieRageDeathDisplay(true);
  } else {
    setShowNixieRageDeathDisplay(false);
  }
}, [gameStatus, deathCause]);


// Add this useEffect to watch for nixie payment
useEffect(() => {
  if (currentPosition && specialRooms[currentPosition]?.tollPaid && 
      specialRooms[currentPosition]?.nixieHasAppeared === false) {
    // Force a re-render by updating a local state
    setShowTranquilPoolDisplay(false);
    setTimeout(() => {
      setShowTranquilPoolDisplay(true);
    }, 10);
  }
}, [specialRooms, currentPosition]); // Watch for changes to specialRooms



// ==================== UTILITY FUNCTIONS FOR DYNAMIC STYLING ====================

// ==================== DARKNESS DEATH CSS CLASS SELECTOR ====================
/**
 * Dynamic CSS class selector for darkness death scenarios
 * 
 * This utility function provides appropriate CSS classes for different types of
 * darkness deaths, allowing for specialized visual presentations based on the
 * specific light source that failed. Enables themed death scenes for different
 * lighting equipment failures.
 * 
 * Class Selection Logic:
 * - **Torch Darkness**: Returns "torch-darkness-death" for torch fuel depletion
 * - **Lantern Darkness**: Returns "lantern-darkness-death" for lantern failures
 * - **Fallback Safety**: Defaults to torch death styling if cause is unclear
 * 
 * Visual Differentiation:
 * - **Equipment-Specific Styling**: Different visual themes for different light sources
 * - **Thematic Consistency**: Visual presentation matches the failed equipment
 * - **Player Education**: Helps players understand what equipment failed
 * - **Atmospheric Enhancement**: Enhances immersion through contextual visuals
 * 
 * Technical Features:
 * - **Simple Logic**: Straightforward conditional returns for reliability
 * - **Fallback Safety**: Always returns a valid CSS class
 * - **Performance Optimized**: Minimal computational overhead
 * - **Maintainable Design**: Easy to extend for additional darkness types
 * 
 * @returns {string} CSS class name for appropriate darkness death styling
 */
const getDarknessDeathClass = () => {
  if (deathCause === 'torch_darkness') {
    return "torch-darkness-death";
  } else if (deathCause === 'lantern_darkness') {
    return "lantern-darkness-death";
  }
  return "torch-darkness-death"; // fallback
};

// ==================== PIT DEATH CSS CLASS SELECTOR ====================
/**
 * Position-based CSS class selector for pit death scenarios
 * 
 * This utility function determines appropriate CSS classes for pit deaths based
 * on which specific pit the player fell into. Allows for differentiated visual
 * presentations for different pit locations, potentially with unique characteristics
 * or environmental details for each pit.
 * 
 * Position-Based Selection:
 * - **Pit 1 Deaths**: Returns "pit-death-1" for first pit location deaths
 * - **Pit 2 Deaths**: Returns "pit-death-2" for second pit location deaths
 * - **Fallback Safety**: Defaults to pit 1 styling if position is unclear
 * 
 * Visual Differentiation Features:
 * - **Location-Specific Styling**: Different visual themes for different pits
 * - **Environmental Context**: Visual presentation reflects specific pit characteristics
 * - **Spatial Awareness**: Helps players understand which pit was deadly
 * - **Atmospheric Variety**: Prevents repetitive death presentations
 * 
 * Technical Implementation:
 * - **Position Validation**: Uses optional chaining for safe position access
 * - **Direct Comparison**: Simple equality checks for reliable detection
 * - **Fallback Logic**: Always provides valid CSS class even with missing data
 * - **Performance Efficient**: Minimal computational requirements
 * 
 * Game Design Benefits:
 * - **Environmental Storytelling**: Different pits can have unique characteristics
 * - **Player Feedback**: Clear indication of which hazard was encountered
 * - **Visual Variety**: Prevents death scene monotony
 * - **Contextual Immersion**: Death visuals match specific cave locations
 * 
 * @returns {string} CSS class name for appropriate pit death styling based on location
 */
const getPitDeathClass = () => {
  if (currentPosition === positions?.pitPosition1) {
    return "pit-death-1";
  } else if (currentPosition === positions?.pitPosition2) {
    return "pit-death-2";
  }
  return "pit-death-1"; // fallback
};

// ==================== REPELLENT THROWING ROOM SELECTION HANDLER ====================
/**
 * Room selection handler for repellent throwing mechanics
 * 
 * This function manages player room selection when throwing repellent items,
 * providing the interface between UI room selection and game logic repellent
 * mechanics. It validates throwing state and coordinates with repellent handlers.
 * 
 * Throwing Mechanics:
 * - **Room Target Selection**: Allows player to choose target room for repellent
 * - **State Validation**: Ensures throwing is actually active before processing
 * - **Handler Coordination**: Integrates with game logic repellent system
 * - **Debug Logging**: Provides feedback for debugging throwing mechanics
 * 
 * Function Parameters:
 * - **room**: Target room number selected by player for repellent throwing
 * 
 * Validation Logic:
 * - **Throwing State Check**: Validates throwingRepellent flag is active
 * - **Handler Existence**: Ensures repellentThrowHandler function is available
 * - **Safe Execution**: Only executes throw logic when all conditions are met
 * - **Error Prevention**: Guards against invalid throwing attempts
 * 
 * Integration Features:
 * - **UI Coordination**: Connects room selection UI with game mechanics
 * - **State Management**: Respects throwing state for proper execution timing
 * - **Debug Support**: Console logging for development and troubleshooting
 * - **Handler Delegation**: Passes room selection to appropriate game logic
 * 
 * Technical Design:
 * - **Conditional Execution**: Only processes valid throwing scenarios
 * - **Function Safety**: Validates handler existence before calling
 * - **Parameter Passing**: Cleanly forwards room selection to game logic
 * - **State Awareness**: Integrates with broader throwing state management
 * 
 * @param {number} room - The room number selected as target for repellent throwing
 * @effects Delegates to repellentThrowHandler when throwing state is valid
 */
const handleRoomSelection = (room) => {
  console.log(`Selected room ${room} for throwing repellent`);
  if (throwingRepellent && repellentThrowHandler) {
    // Call the handler with the selected room
    repellentThrowHandler(room);
  }
};
// ==================== HELPER FUNCTIONS & UTILITY LOGIC SECTION ====================
/**
 * This section contains all the utility functions and helper logic that support
 * the component's rendering and interaction systems. These functions provide
 * reusable logic for CSS class determination, content parsing, state analysis,
 * and user interaction handling.
 */

// ==================== TREASURE CLUE CSS CLASS MAPPER ====================
/**
 * Dynamic CSS class generator for treasure map clue styling
 * 
 * This helper function maps treasure types to their corresponding CSS classes
 * for visual styling in the treasure map display. It provides consistent
 * visual theming for different treasure types and handles edge cases gracefully.
 * 
 * Treasure Type Mapping:
 * - **Ruby**: Returns 'ruby-clue' class for red gem styling
 * - **Medallion**: Returns 'medallion-clue' class for ancient medallion styling
 * - **Statue**: Returns 'statue-clue' class for mystical statue styling
 * - **Amulet**: Returns 'amulet-clue' class for magical amulet styling
 * 
 * Safety Features:
 * - **Bounds Checking**: Validates index is within treasurePieces array
 * - **Null Safety**: Handles cases where treasurePieces might be undefined
 * - **Fallback Logic**: Returns empty string for unknown treasure types
 * - **Index Validation**: Prevents array access errors
 * 
 * Technical Implementation:
 * - **Array Bounds Validation**: Checks both existence and length before access
 * - **Switch Statement**: Efficient mapping of treasure IDs to CSS classes
 * - **Default Case**: Handles unexpected treasure types gracefully
 * - **Performance Optimized**: Minimal computational overhead
 * 
 * @param {number} index - Index of treasure in treasurePieces array
 * @returns {string} CSS class name for treasure clue styling, empty string if invalid
 */
const getClueClass = (index) => {
  if (!treasurePieces || treasurePieces.length <= index) return '';
  const treasureId = treasurePieces[index].id;
  switch(treasureId) {
    case 'ruby': return 'ruby-clue';
    case 'medallion': return 'medallion-clue';
    case 'statue': return 'statue-clue';
    case 'amulet': return 'amulet-clue';
    default: return '';
  }
};

// ==================== WIZARD ROOM STATE ANALYZER ====================
/**
 * Advanced wizard room visual state determination system
 * 
 * This sophisticated function analyzes multiple game state variables to determine
 * the appropriate visual presentation for the wizard's room. It manages a complex
 * state machine with four distinct phases of the wizard liberation storyline.
 * 
 * Wizard Room States:
 * - **STATE 1 - Trapped**: Initial state with wizard imprisoned in crystal
 * - **STATE 2 - Rock Placed**: Immediately after freeing wizard, rock on pedestal
 * - **STATE 3 - Wyrmglass Appears**: After leaving and returning, wyrmglass available
 * - **STATE 4 - Empty Pedestal**: After taking wyrmglass, empty pedestal remains
 * 
 * State Transition Logic:
 * - **Liberation Detection**: Uses window.WIZARD_FREED global flag
 * - **Visit Tracking**: Monitors hasLeftWizardRoom for return visit detection
 * - **Item Analysis**: Checks inventory for wyrmglass possession
 * - **Progressive Revelation**: Each state reveals more of the wizard storyline
 * 
 * Technical Features:
 * - **Multi-Variable Analysis**: Combines global flags, local state, and inventory
 * - **Debug Logging**: Comprehensive logging for state debugging and verification
 * - **State Machine Logic**: Clean progression through wizard liberation phases
 * - **Fallback Safety**: Returns default state if logic fails
 * 
 * Global State Integration:
 * - **window.WIZARD_FREED**: Persistent global flag for wizard liberation status
 * - **Cross-Session Persistence**: Wizard state maintained across game sessions
 * - **State Synchronization**: Ensures UI matches actual wizard storyline progress
 * - **Component Coordination**: Integrates with broader wizard mechanics
 * 
 * Inventory Integration:
 * - **Flexible Item Detection**: Uses both originalId and regular id for wyrmglass
 * - **Real-time Updates**: Responds immediately to inventory changes
 * - **Item State Logic**: Wyrmglass possession affects room presentation
 * - **Equipment Validation**: Ensures accurate item detection
 * 
 * Debug Features:
 * - **Comprehensive Logging**: Logs all relevant state variables for debugging
 * - **State Identification**: Console output identifies which state is active
 * - **Troubleshooting Support**: Detailed information for development debugging
 * - **State Verification**: Confirms expected state transitions
 * 
 * @returns {string} CSS class name for appropriate wizard room background state
 */
const getWizardRoomClass = () => {
  // ========== WYRMGLASS INVENTORY DETECTION ==========
  // Check if wyrmglass has been taken from pedestal (in player's inventory)
  const hasWyrmglass = inventory.some(item =>
    (item.originalId || item.id) === 'wyrmglass'
  );
  
  // ========== COMPREHENSIVE DEBUG LOGGING ==========
  // Debug logging to see what's happening
  console.log("Wizard room state check:");
  console.log("- WIZARD_FREED:", window.WIZARD_FREED);
  console.log("- Has left wizard room:", hasLeftWizardRoom);
  console.log("- Has wyrmglass in inventory:", hasWyrmglass);
  console.log("- Current room:", currentPosition);
  
  // ========== STATE 1: WIZARD TRAPPED (INITIAL STATE) ==========
  if (!window.WIZARD_FREED) {
    console.log("STATE 1: Showing trapped wizard");
    return "wizard-room-trapped";
  }
  
  // ========== STATE 2: ROCK PLACED, WIZARD JUST FREED ==========
  if (window.WIZARD_FREED && !hasLeftWizardRoom) {
    console.log("STATE 2: Showing room with rock in pedestal");
    return "wizard-room-rock";
  }
  
  // ========== STATE 3: RETURNED TO ROOM, WYRMGLASS APPEARS ==========
  if (window.WIZARD_FREED && hasLeftWizardRoom && !hasWyrmglass) {
    console.log("STATE 3: Showing wyrmglass on pedestal");
    return "wizard-room-freed";
  }
  
  // ========== STATE 4: WYRMGLASS TAKEN, EMPTY PEDESTAL ==========
  if (window.WIZARD_FREED && hasWyrmglass) {
    console.log("STATE 4: Showing empty pedestal");
    return "wizard-room-empty";
  }
  
  // ========== FALLBACK STATE ==========
  // Fallback - should not reach here under normal circumstances
  return "wizard-room-trapped";
};

// ==================== TREASURE MAP CONTENT PARSER ====================
/**
 * Advanced treasure map message parsing system
 * 
 * This sophisticated parser extracts structured content from treasure map discovery
 * messages, breaking down the narrative text into organized components for display.
 * It handles complex message formats and provides robust parsing with error handling.
 * 
 * Parsing Components:
 * - **Title Extraction**: Extracts map discovery title from message structure
 * - **Intro Text**: Captures introductory narrative about the ancient map
 * - **Clue Parsing**: Identifies and formats bullet-pointed treasure clues
 * - **Structure Validation**: Ensures message format matches expected structure
 * 
 * Message Format Handling:
 * - **Multi-Part Messages**: Splits messages on double newlines for section parsing
 * - **Section Identification**: Identifies title, intro, and clue sections
 * - **Bullet Point Processing**: Extracts and cleans bullet-pointed clue text
 * - **Content Validation**: Validates message contains expected map discovery content
 * 
 * Technical Features:
 * - **Robust Parsing**: Handles variations in message format gracefully
 * - **Safe Array Access**: Validates array bounds before accessing elements
 * - **Content Filtering**: Removes empty lines and irrelevant content
 * - **String Processing**: Advanced string manipulation for clean content extraction
 * 
 * Error Handling:
 * - **Format Validation**: Returns default structure if parsing fails
 * - **Content Verification**: Checks for expected message markers before parsing
 * - **Graceful Degradation**: Provides empty structure rather than errors
 * - **Boundary Checking**: Validates array access to prevent errors
 * 
 * Output Structure:
 * - **title**: Main title of the treasure map discovery
 * - **introText**: Narrative introduction about the ancient map
 * - **clues**: Array of individual treasure clues from the map
 * 
 * @returns {Object} Structured treasure map content with title, introText, and clues
 */
const parseMapContent = () => {
  // ========== CONTENT VALIDATION ==========
  if (!message.includes('You found an ancient treasure map')) {
    return { title: '', introText: '', clues: [] };
  }
  
  // ========== MESSAGE STRUCTURE PARSING ==========
  const parts = message.split('\n\n');
  if (parts.length < 3) return { title: '', introText: '', clues: [] };
  
  // ========== TITLE AND INTRO EXTRACTION ==========
  // First part is room number, second is map discovery
  const title = parts[1].trim();
  // If we have "The ancient map..." text
  const introText = parts.length > 2 ? parts[2].trim() : '';
  
  // ========== CLUE EXTRACTION AND PROCESSING ==========
  // Extract the clues (the bullet points)
  const clueText = parts.slice(3).join('\n\n');
  const clues = clueText.split('\n\n')
    .filter(line => line.startsWith('•'))
    .map(line => line.substring(2).trim());
  
  return { title, introText, clues };
};

// ==================== ONE-WAY CONNECTION ANALYZER ====================
/**
 * Navigation connection analysis for one-way passage detection
 * 
 * This utility function analyzes room connections to determine if a passage
 * is one-way (player can go from current room to target, but not return).
 * It provides critical information for UI feedback and navigation warnings.
 * 
 * One-Way Detection Logic:
 * - **Current Position Validation**: Ensures valid starting position exists
 * - **Target Room Analysis**: Examines target room's connection list
 * - **Return Path Check**: Verifies if target room connects back to current room
 * - **Bidirectional Validation**: Confirms whether return travel is possible
 * 
 * Technical Features:
 * - **Safe Connection Access**: Validates connection data exists before analysis
 * - **Null Checking**: Handles missing position or connection data gracefully
 * - **Array Analysis**: Uses array methods for efficient connection checking
 * - **Boolean Logic**: Returns clear true/false result for one-way status
 * 
 * Navigation Benefits:
 * - **Player Warning**: Enables UI to warn about one-way passages
 * - **Strategic Planning**: Helps players make informed movement decisions
 * - **Exploration Guidance**: Provides feedback about cave topology
 * - **Risk Assessment**: Allows players to evaluate movement consequences
 * 
 * @param {number} targetRoom - Room number to check for one-way connection
 * @returns {boolean} True if connection is one-way (no return path), false otherwise
 */
const isOneWayConnection = (targetRoom) => {
  // ========== VALIDATION CHECKS ==========
  // If no current position or connections data, can't determine
  if (!currentPosition || !roomConnections[targetRoom]) return false;
  
  // ========== RETURN PATH ANALYSIS ==========
  // Check if the target room has a connection back to the current room
  return !roomConnections[targetRoom].includes(currentPosition);
};

// ==================== NAVIGATION BUTTON PULSE CONTROLLER ====================
/**
 * One-way passage button pulse animation management system
 * 
 * This function manages the visual pulse effect for navigation buttons that lead
 * to one-way passages. It ensures each button only pulses once per discovery and
 * provides visual feedback for potentially dangerous navigation choices.
 * 
 * Pulse Management Features:
 * - **One-Time Pulsing**: Each button pulses only once per session
 * - **One-Way Detection**: Only pulses for actual one-way connections
 * - **State Tracking**: Maintains list of buttons that have already pulsed
 * - **Visual Feedback**: Provides immediate warning for risky navigation
 * 
 * Animation Logic:
 * - **Duplicate Prevention**: Checks pulsedButtons list to avoid repeat animations
 * - **Connection Analysis**: Uses one-way detection to determine pulse eligibility
 * - **State Updates**: Adds room to pulsed list after triggering animation
 * - **Return Values**: Boolean indicates whether pulse was triggered
 * 
 * Technical Implementation:
 * - **Array State Management**: Maintains pulsedButtons array for tracking
 * - **Functional Updates**: Uses function form of setState for array updates
 * - **Performance Optimized**: Quick array includes check for efficiency
 * - **Side Effect Management**: State updates only when pulse is actually triggered
 * 
 * User Experience Benefits:
 * - **Navigation Warning**: Visual cue alerts players to one-way passages
 * - **Discovery Feedback**: Provides satisfying feedback for finding unique passages
 * - **Risk Communication**: Helps players understand navigation consequences
 * - **Visual Polish**: Enhances overall game feel with responsive animations
 * 
 * @param {number} room - Room number to check for pulse animation
 * @returns {boolean} True if pulse was triggered, false if already pulsed or not one-way
 */
const handleButtonPulse = (room) => {
  // ========== DUPLICATE PULSE PREVENTION ==========
  // If this room has already pulsed, don't pulse again
  if (pulsedButtons.includes(room)) return false;
  
  // ========== ONE-WAY CONNECTION VALIDATION ==========
  // Check if it's a one-way passage
  if (isOneWayConnection(room)) {
    // ========== PULSE STATE TRACKING ==========
    // Add to pulsed buttons list so it only pulses once
    setPulsedButtons(prev => [...prev, room]);
    return true;
  }
  
  return false;
};

// ==================== TREASURE MAP CONTENT EXTRACTION ====================
/**
 * Parsed treasure map content for component rendering
 * 
 * This constant extracts and structures the treasure map content for use throughout
 * the component's rendering logic. It provides a clean interface to the parsed
 * map data without requiring repeated parsing operations.
 */
const mapContent = parseMapContent();
// ==================== GAMEBOARD JSX RENDER METHOD ====================
/**
 * Main component render method - sophisticated conditional display system
 * 
 * This massive JSX return statement orchestrates the entire visual presentation
 * of the game through an intricate system of conditional rendering. It manages
 * multiple display modes, video sequences, death scenes, special room interfaces,
 * and interactive elements in a hierarchical priority system.
 * 
 * Render Architecture:
 * - **Container Structure**: Dynamic CSS classes for visual states
 * - **Conditional Display System**: Complex ternary operator chains for content
 * - **Video Integration**: Multiple video backgrounds for dramatic scenes
 * - **Interactive Elements**: Navigation, trading, and input systems
 * - **State-Driven Styling**: CSS classes based on game state
 * 
 * Display Priority Hierarchy:
 * 1. Win Video (highest priority)
 * 2. Map Discovery Video
 * 3. Death Scenes (various types)
 * 4. Special Room Displays
 * 5. Regular Game Content (lowest priority)
 */
return (
  // ==================== MAIN CONTAINER WITH DYNAMIC STYLING ====================
  /**
   * Primary game board container with comprehensive conditional CSS classes
   * 
   * The container div uses a sophisticated class system that responds to multiple
   * game states simultaneously, creating rich visual feedback and atmospheric
   * effects based on current game conditions.
   * 
   * Dynamic CSS Classes:
   * - **Base Classes**: 'container game-board' for core styling
   * - **Wizard Mode**: 'wizard-mode' for magical encounter effects
   * - **Water Room**: 'water-room' for environmental water effects
   * - **Night Crawler Protection**: 'night-crawler-protection' for protection visuals
   * - **Game Over**: 'game-over' for end state styling
   * 
   * Container Features:
   * - **Mood-Based Styling**: containerStyle object provides atmospheric effects
   * - **DOM Reference**: gameBoardRef for dynamic DOM manipulation (water effects)
   * - **Multi-State Support**: Multiple classes can be active simultaneously
   * - **Responsive Design**: Adapts to various game states and conditions
   */
  <div 
    className={`container game-board ${wizardMode ? 'wizard-mode' : ''} ${isWaterRoom ? 'water-room' : ''} ${nightCrawlerProtection ? 'night-crawler-protection' : ''} ${gameStatus === 'lost' || gameStatus === 'won' ? 'game-over' : ''}`} 
    style={containerStyle}
    ref={gameBoardRef}
  >
    {/* ==================== GAME HEADER ====================
     * Simple header providing game context and instructions
     */}
    <div className='head'>
      <label htmlFor='term'>
        Cave Explorer: Numbers 1-30
      </label>
    </div>

    {/* ==================== MAIN MESSAGE CONTAINER WITH DISPLAY HIERARCHY ==================== 
     * 
     * This section implements a complex conditional rendering system that determines
     * which type of content to display based on game state. It uses a cascading
     * series of ternary operators to establish display priority, ensuring that
     * higher-priority content (like win videos) takes precedence over lower-priority
     * content (like regular game messages).
     * 
     * Display Hierarchy (highest to lowest priority):
     * 1. Win Video Display - Victory celebration with video background
     * 2. Map Discovery Video - Treasure map found animation
     * 3. Death Scene Displays - Various death-specific presentations
     * 4. Special Room Displays - Unique interfaces for special locations
     * 5. Regular Game Content - Standard game messages and interactions
     */}
    <div className="game-message-container">
      
      {/* ==================== PRIORITY 1: WIN VIDEO DISPLAY ==================== 
       * 
       * Highest priority display for victory celebrations. Features a full-screen
       * video background with overlay messaging that appears after video completion.
       * 
       * Features:
       * - **Auto-playing Victory Video**: player_exiting_cave_end.mp4
       * - **Timed Message Overlay**: Win message appears after video ends
       * - **Video Event Handling**: onEnded triggers message display
       * - **Overlay System**: Message overlays on video for dramatic effect
       */}
      {showWinVideo && gameStatus === 'won' ? (
        <div className="win-video-display">
          <video
            className="win-video-background"
            autoPlay
            muted
            playsInline
            onEnded={() => {
              console.log("Win video finished");
              setShowWinMessage(true); // Show message when video ends
            }}
          >
            <source src={require('../images/player_exiting_cave_end.mp4')} type="video/mp4" />
          </video>
          <div className="win-message-overlay">
            {showWinMessage && ( // Only show message if video has ended
              <p className={`game-message won ${showWinMessage ? 'show' : 'hide'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      ) :
      
      /* ==================== PRIORITY 2: MAP DISCOVERY VIDEO DISPLAY ==================== 
       * 
       * Second highest priority for treasure map discovery sequences. Combines
       * video background with structured treasure clue overlay using shimmer effects.
       * 
       * Features:
       * - **Parchment Map Video**: parchmentmap.mp4 background animation
       * - **Structured Content Overlay**: Title, description, and treasure clues
       * - **Dynamic Clue Mapping**: Uses getClueClass for treasure-specific styling
       * - **Shimmer Text Effects**: Enhanced visual appeal for treasure clues
       * - **Video Event Handling**: onEnded for potential future functionality
       */
      showMapDiscovery ? (
        <div className="map-discovery-video-container">
          <video
            className="map-discovery-video"
            autoPlay
            muted
            playsInline
            onEnded={() => {
              console.log("Map discovery video finished");
              // Optionally set a state to show the map content after video
              // setShowMapContent(true);
            }}
          >
            <source src={require('../images/parchmentmap.mp4')} type="video/mp4" />
          </video>
          
          {/* Structured treasure map content overlay */}
          <div className="map-discovery-overlay">
            <div className="map-discovery-title">Ancient Treasure Map Found!</div>
            <div className="map-discovery-text">
              The ancient map shows four lost artifacts scattered throughout these caves.<br/>
              To lift the curse on the village, you must find all the treasures and return to the exit.
            </div>
            <div className="map-clue-list">
              {mapContent.clues.map((clue, index) => (
                <div key={index} className={getClueClass(index)}>
                  • <span className="shimmer-text">{clue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : 
      
      /* ==================== PRIORITY 3: DEATH SCENE DISPLAYS ==================== 
       * 
       * Multiple death scene displays with specialized visuals for different death causes.
       * Each death type has unique styling and presentation appropriate to the cause.
       */
      
      /* === MAGICAL CATASTROPHE DEATH === 
       * Features void/dimensional imagery for magical failure deaths
       */
      showMagicalCatastropheDisplay ? (
        <div className="magical-catastrophe-display">
          <img 
            src={require('../images/Exit_Room_void.png')} 
            alt="Magical Catastrophe" 
            className="magical-catastrophe-background"
          />
          <p className={`game-message lost magical_catastrophe`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* === NIGHT CRAWLER DEATH === 
       * Simple but effective presentation for creature deaths
       */
      showNightCrawlerDeathDisplay ? (
        <div className="night-crawler-death-display">
          <p className={`game-message lost night_crawlers`}>
            {message}
          </p>
        </div>
      ) : 
      

      /* ===  FUNGI DEATH === 
       * Dynamic styling based on if player was killed by the killer fingi in the fungi room 
       */
      showFungiDeathDisplay ? (
  <div className="fungi-death-display">
    <div className="tendril-growth"></div>
    <p className={`game-message lost fungi`}>
      {message}
    </p>
  </div>
) :



      /* === DARKNESS DEATH === 
       * Dynamic styling based on whether torch or lantern failed
       */
      showDarknessDeathDisplay ? (
        <div className={`darkness-death-display ${getDarknessDeathClass()}`}>
          <div className="darkness-death-content">
            <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''} ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
              {message}
            </p>
          </div>
        </div>
      ) : 
      
      /* === NIXIE RAGE DEATH === 
       * Water spirit themed death presentation
       */
      showNixieRageDeathDisplay ? (
        <div className="nixie-rage-death-display">
          <p className={`game-message lost nixie_rage`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* === LADDER EXTEND SCENE === 
       * Special scene for ladder extension with video and fallback image
       */
      showLadderExtendScene && gameStatus !== 'won' ? (
        <div className="ladder-extend-display">
          {/* Conditional video display to prevent conflicts with win video */}
          {!showWinVideo && (
            <video
              className="ladder-video-background"
              autoPlay
              muted
              playsInline
              onEnded={() => {
                console.log("Ladder extension video finished");
              }}
            >
              <source src={require('../images/player_holding_orb_rusty_ladder_hole.mp4')} type="video/mp4" />
            </video>
          )}
          {/* Fallback image background for visual consistency */}
          <img 
            src={require('../images/Ladder_exit_scene.png')} 
            alt="Ladder Extension" 
            className="ladder-image-background"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              zIndex: -1
            }}
          />
          <div className="ladder-extend-content">
            <div className="ladder-extend-title">✨ Magical Ladder Extension ✨</div>
            <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
              {message}
            </p>
          </div>
        </div>
      ) : 
      
      /* === PIT DEATH === 
       * Position-based styling for different pit locations
       */
      showPitDeathDisplay ? (
        <div className={`pit-death-display ${getPitDeathClass()}`}>
          <div className="pit-death-content">
            <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''} ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
              {message}
            </p>
          </div>
        </div>
      ) : 
      
      /* === WUMPUS DEATH === 
       * Dramatic video background for creature encounter deaths
       */
      showWumpusDeathDisplay ? (
        <div className="wumpus-death-display">
          <video 
            className="death-video-background" 
            autoPlay 
            muted
            playsInline
          >
            <source src={require('../images/druika.mp4')} type="video/mp4" />
          </video>
          <p className={`game-message lost wumpus`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* === ADDITIONAL DEATH SCENES === 
       * Various other death presentations with specialized styling
       */
      showSulfurExplosionDisplay ? (
        <div className="sulfur-explosion-display">
          <p className={`game-message lost sulfur_explosion`}>
            {message}
          </p>
        </div>
      ) : showCurseDeathDisplay ? (
        <div className="curse-death-display">
          <p className={`game-message lost curse`}>
            {message}
          </p>
        </div>
      ) : showTrinketTrapDisplay ? (
        <div className="trinket-trap-display">
          <div className="maw-effect"></div>
          <div className="teeth-border"></div>
          <div className="void-pulse"></div>
          <div className="eldritch-symbols"></div>
          <p className={`game-message lost trinket_trap`}>
            {message}
          </p>
        </div>
      ) : showVortexTrapDisplay ? (
        <div className="vortex-trap-display">
          <p className={`game-message lost vortex_trap`}>
            {message}
          </p>
        </div>
      ) : showLadderTrapDisplay ? (
        <div className="ladder-trap-display">
          <p className={`game-message lost ladder_trap`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* ==================== PRIORITY 4: SPECIAL ROOM DISPLAYS ==================== 
       * 
       * Unique interfaces for special game locations with enhanced visuals
       * and specialized interaction systems.
       */
      
      /* === WIZARD ROOM DISPLAY === 
       * Complex state-driven wizard room with multiple visual states
       */
      showWizardRoomDisplay ? (
        <div className={`wizard-room-display ${getWizardRoomClass()}`}>
          <div className="wizard-room-content">
            {specialMessage && (
              <div className={`special-message ${specialMessage.className}`}>
                {specialMessage.text}
              </div>
            )}
            <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''}${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
              {message}
            </p>
          </div>
        </div>
      ) : 
      
      /* === FALLBACK MAP DISCOVERY === 
       * Non-video version of map discovery for compatibility
       */
      showMapDiscovery ? (
        <div className="map-discovery">
          <div className="map-discovery-title">Ancient Treasure Map Found!</div>
          <div className="map-discovery-text">
            The ancient map shows four lost artifacts scattered throughout these caves.<br/>
            To lift the curse on the village, you must find all the treasures and return to the exit.
          </div>
          <div className="map-clue-list">
            {mapContent.clues.map((clue, index) => (
              <div key={index} className={getClueClass(index)}>
                • <span className="shimmer-text">{clue}</span>
              </div>
            ))}
          </div>
        </div>
      ) : 
      
      /* === HIDDEN ROOM DISPLAY === 
       * Ancient chamber with trap activation effects
       */
      showHiddenRoomDisplay ? (
        <div className={`hidden-room-display ${hiddenRoomTrapActive ? 'trap-active' : ''}`}>
          <div className="hidden-room-title">⚡ Ancient Hidden Chamber ⚡</div>
          <div className="hidden-room-content">
            <div className={`vortex-overlay ${hiddenRoomTrapActive ? 'vortex-active' : ''}`}></div>
            <div className="artifacts-glow"></div>
            <div className="hidden-room-message">
              <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
                {message}
              </p>
            </div>
          </div>
        </div>
      ) : 
      
      /* === EXIT ROOM DISPLAY === 
       * Dynamic exit room with conditional ladder imagery
       */
      showExitRoomDisplay ? (
        <div className="exit-room-display">
          <img 
            src={require(`../images/${showExitWithLadder ? 'rusty_ladder_exit.png' : 'Exit_room_no_ladder.png'}`)} 
            alt="Exit Room" 
            className="exit-room-background"
          />
          <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* === TRANQUIL POOL DISPLAY === 
       * Water-themed room with nixie encounter states
       */
      showTranquilPoolDisplay ? (
<div className={
currentPosition && specialRooms[currentPosition]?.showNixieDeathScene ?
"nixie-death-scene-display" :
// Only show nixie appearance if nixie has appeared AND is still active (not killed)
currentPosition && specialRooms[currentPosition]?.nixieHasAppeared && 
specialRooms[currentPosition]?.waterSpiritActive ?
"nixie-appearance-display" :
"tranquil-pool-display"  // Default to normal pool display
}>


{!specialRooms[currentPosition]?.nixieHasAppeared &&  (
            <>
              <div className="bio-glow-layer"></div>
              <div className="bio-glow-layer"></div>
              <div className="bio-glow-layer"></div>
              <div className="flicker-spots"></div>
            </>
          )}
          <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* === SHRINE DISPLAY === 
       * Goblin shrine room interface
       */
      showShrineDisplay ? (
        <div className="goblin-shrine-display">
          <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
            {message}
          </p>
        </div>
      ) : 
      
      /* === BONE ROOM DISPLAY === 
      * Ritual bone room interface
      */
      showBoneRoomDisplay ? (
        <div className="bone-room-display">
          <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
            {message}
          </p>
        </div>
      ) : 


      /* === GIFT SHOP DISPLAY === 
       * Comprehensive commerce interface with save/load controls
       */
      showGiftShopDisplay ? (
        <div className="gift-shop-discovery">
          <div className="gift-shop-title">🛍️ Throk's Cave Gift Shop 🛍️</div>
          <div className="gift-shop-subtitle">"Finest Cave Souvenirs & Survival Gear!"</div>
          
          <div className="gift-shop-content">
            {/* Dynamic item preview grid */}
            <div className="gift-shop-items-preview">
              <div className="items-grid">
                {giftShopItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="shop-item-preview"
                    style={{'--item-index': index}}
                  >
                    <span className="item-icon-large">{item.icon}</span>
                    <span className="item-name-preview">{item.name}</span>
                    <span className="item-price">{item.price} coins</span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Game message display area */}
            <div className="shop-message-area">
              <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''} ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
                {message}
              </p>
            </div>
            
            {/* Save/Load game controls */}
            <div className="save-game-controls">
              <button 
                className="save-game-btn"
                onClick={() => saveGame()}
                title="Save your current game progress"
              >
                💾 Save Game
              </button>
              
              {hasSavedGame() && (
                <>
                  <button 
                    className="load-game-btn"
                    onClick={() => {
                      playLoadGameSound()
                      if (window.confirm("Are you sure you want to load your saved game? Current progress will be lost.")) {
                        loadGame();
                      }
                    }}
                    title="Load your previously saved game"
                  >
                    📂 Load Game
                  </button>
                  
                  <button 
                    className="delete-save-btn"
                    onClick={() => {
                      playDeleteSavedGameSound()
                      if (window.confirm("Are you sure you want to delete your saved game? This cannot be undone.")) {
                        deleteSavedGame();
                      }
                    }}
                    title="Delete your saved game"
                  >
                    🗑️ Delete Save
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : 
      
      /* ==================== PRIORITY 5: DEFAULT GAME CONTENT ==================== 
       * 
       * Standard game message display with optional treasure and special message overlays
       */
      (
        <div className={showTreasureDisplay && foundTreasureInfo ? `treasure-display treasure-${foundTreasureInfo.id}` : ''}>
          {specialMessage ? (
            <div className={`special-message ${specialMessage.className}`}>
              {specialMessage.text}
            </div>
          ) : (
            <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''}  ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
              {message}
            </p>
          )}
        </div>
      )}

      {/* ==================== OVERLAY NOTIFICATION SYSTEMS ==================== 
       * 
       * Additional notification overlays that appear on top of main content
       */}
      
      {/* One-way passage discovery notification */}
      {oneWayDiscovered && (
        <div className="one-way-message">
          You notice the passage sealed behind you. There's no way back the way you came!
        </div>
      )}

      {/* Night crawler warning system */}
      {nightCrawlerWarning && !nightCrawlerProtection && (
        <div className="night-crawler-warning">
          Warning: You've been squatting here like a teenager at a mall. The wall worms are filing noise complaints and preparing an eviction notice with their teeth. Shuffle along to another room or protect yourself with...
        </div>
      )}

      {/* Protection status indicator */}
      {nightCrawlerProtection && (
        <div className="protection-status">
          <span className="protection-icon">✨</span> Cave Salt Protection Active
        </div>
      )}
    </div>

    {/* ==================== CONDITIONAL TRADE BUTTONS ==================== 
     * 
     * Trade interface buttons that appear contextually based on location and availability
     */}
    
    {/* Gift shop trade button */}
    {showTradeButton && showGiftShopDisplay && (
      <button 
        className="trade-gold-btn" 
        onClick={handleTrade}
        data-description="Trade your gold coins for useful items"
      >
        Trade Gold Coins
      </button>
    )}

    {/* ==================== CORE GAME CONTENT COMPONENTS ==================== 
     * 
     * Essential game components that appear consistently during gameplay
     */}
    
    {/* Room description component */}
    {roomDescription && (
      <RoomDescription description={roomDescription} />
    )}

    {/* Environmental perceptions component */}
    <Perceptions perceptions={perceptions} gameStatus={gameStatus} />

    {/* ==================== NAVIGATION SYSTEM ==================== 
     * 
     * Dynamic room connection interface with special room support and trading
     */}
    {currentPosition && roomConnections && roomConnections[currentPosition] && gameStatus === 'playing' && (
      <div className="connections-wrapper">
        <div className="room-connections">
          <p className="connections-header">
            {throwingRepellent ?
              "Choose a room to throw the Wumpus Repellent into:" :
              "Tunnels lead to rooms:"}
          </p>
          
          {/* Dynamic room connection buttons */}
          <div className="connections-list">
            {roomConnections[currentPosition].map(room => {
              const shouldPulse = handleButtonPulse(room);
              const isOneWay = isOneWayConnection(room);
              const isSpecial = room > 30; // Identify special rooms
              
              return (
                <button
                  key={room}
                  className={`connection-btn ${isOneWay ? 'one-way-btn' : ''} ${shouldPulse ? 'one-way-pulse' : ''} ${isSpecial ? 'special-room-btn' : ''} ${throwingRepellent ? 'throwing-mode-btn' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (throwingRepellent) {
                      handleRoomSelection(room);
                    } else if (isSpecial) {
                      handleGuess({ 
                        preventDefault: () => {},
                        target: { specialRoomTarget: room }
                      });
                    } else {
                      handleGuess({
                        preventDefault: () => {},
                        target: { roomNumber: room }
                      });
                    }
                  }}
                  title={throwingRepellent ? 
                    `Throw repellent into room ${room}` : 
                    (isSpecial ? "Secret passage" : `Room ${room}`)}
                >
                  {isSpecial ? (
                    <span role="img" aria-label="Secret passage">🚪</span>
                  ) : (
                    room
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Water spirit trade button */}
          {showWaterSpiritTradeButton && (
            <button
              className="water-trade-btn"
              onClick={handleWaterSpiritTrade}
            >
              {inventory.some(item => (item.originalId || item.id) === 'gold_coins') ? 
                "Offer Gold Coin to Water Spirit" : 
                inventory.some(item => (item.originalId || item.id) === 'golden_compass') ?
                  "Offer Golden Compass to Water Spirit" :
                  "Offer Payment to Water Spirit"
              }
            </button>
          )}
          
          {/* Shop trade button */}
          {showTradeButton && (
            <button
              className="trade-btn"
              onClick={handleTrade}
            >
              Trade Gold Coins
            </button>
          )}
        </div>
      </div>
    )}

    {/* ==================== PLAYER INPUT SYSTEM ==================== 
     * 
     * Main form for player input with dynamic placeholder text and state management
     */}
    <form onSubmit={handleGuess}>
      <input
        id='term'
        type='text'
        name='term'
        value={term}
        onChange={handleChange}
        disabled={gameStatus !== 'playing' || wizardMode || throwingRepellent}
        placeholder={
          shopMode ? 'Enter item number (or 0 to leave)...' :
          throwingRepellent ? 'Choose a room to throw into...' : 
          'Enter a room number (1-30)'
        }
        autoComplete="off"
      />
      <button 
        type='submit' 
        className='explore-btn'
        disabled={gameStatus !== 'playing' || wizardMode || throwingRepellent || !term.trim()}
      >
        Explore
      </button>
    </form>
          
    {/* ==================== GAME RESET CONTROL ==================== 
     * 
     * Play again button appears when game ends
     */}
    {gameStatus !== 'playing' && (
      <button onClick={resetGame} className='reset-btn'>
        Play Again
      </button>
    )}
  </div>
);

}; // End of GameBoard component

export default GameBoard;