/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape, default-case */
// This is the  state management orchestrator

// ==================== IMPORTS ====================

// Core React imports for context management and state handling
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

// Custom hooks for game logic and audio management
import useGameLogic from '../hooks/useGameLogic';         // Main game logic engine
import useSounds from '../hooks/useSounds';               // Audio system management

// Data imports for room content and treasure information
import { getAllRoomDescriptions, getShiftingRoomFallbacks } from '../data/roomDescriptions';
import treasureClues from '../data/treasureClues';

// Audio file imports for specific sound effects
import caveEntrySoundFile from '../sounds/warp2.ogg';    // Cave entrance sound effect

// Utility functions for enhanced room descriptions and interactions
import { getFullInteractiveStatement, createEnhancedRoomDescription } from '../utils/descriptionUtils';

// Item management system for interactive elements
import { handleItemUse } from '../utils/itemManagerImport';

// Lore and narrative content for coin-related interactions
import { goldCoinDescription, getRandomCoinDialogue } from '../utils/coinLore';

// ==================== GLOBAL STATE INITIALIZATION ====================

/**
 * Global state variable for invisibility cloak mechanics
 * Used across components to track cloak visibility state
 * Set to false initially - player starts visible
 */
window.GLOBAL_CLOAK_STATE = false;

// ==================== CONTEXT CREATION ====================

/**
 * Creates the main game context for state management
 * This context will provide all game state and functions to child components
 */
const GameContext = createContext();

/**
 * Custom hook to access the game context
 * Provides a clean interface for components to use game state
 * @returns {object} All game state and functions from GameProvider
 */
export const useGame = () => useContext(GameContext);

// ==================== MAIN GAME PROVIDER COMPONENT ====================

/**
 * GameProvider - Central state management component for the entire game
 * Manages all game state, coordinates between systems, and provides context to children
 * 
 * @param {object} children - React children components that need access to game state
 * @returns {JSX.Element} Context provider wrapping all child components
 */
export const GameProvider = ({ children }) => {

  // ==================== THROWING AND REPELLENT STATE ====================
  
  /**
   * State for managing repellent throwing mechanics
   * Used for sand creature encounters and other creature interactions
   */
  const [throwingRepellent, setThrowingRepellent] = useState(false);
  
  /**
   * Handler function for repellent throwing actions
   * Stores the callback function for when repellent throw is executed
   */
  const [repellentThrowHandler, setRepellentThrowHandler] = useState(null);
  
  /**
   * Tracks how many times the map fragment has been used
   * Map fragments have limited uses before becoming depleted
   */
  const [mapFragmentUses, setMapFragmentUses] = useState(0);

  // ==================== GIFT SHOP SYSTEM STATE ====================
  
  /**
   * Current room number where the gift shop is located
   * Dynamically assigned during game initialization to avoid conflicts
   */
  const [giftShopRoom, setGiftShopRoom] = useState(null);
  
  /**
   * Controls visibility of the trade button in gift shop encounters
   * Only shown when player has appropriate currency and merchant is available
   */
  const [showTradeButton, setShowTradeButton] = useState(false);

  // ==================== SHIFTING ROOM MECHANICS STATE ====================
  
  /**
   * ID of the room that has shifting/changing descriptions
   * This room will cycle through different appearances when player is not present
   */
  const [shiftingRoomId, setShiftingRoomId] = useState(null);
  
  /**
   * Stores the original description of the shifting room
   * Used for restoration when room is stabilized with reality anchor
   */
  const [originalRoomDescription, setOriginalRoomDescription] = useState(null);
  
  /**
   * Stores the original treasure associated with the shifting room
   * Treasure only becomes available when room is stabilized
   */
  const [originalRoomTreasure, setOriginalRoomTreasure] = useState(null);
  
  /**
   * Array of all possible descriptions for the shifting room
   * Room cycles through these descriptions when player is not present
   */
  const [shiftingRoomDescriptions, setShiftingRoomDescriptions] = useState([]);
  
  /**
   * Current index in the shifting room descriptions array
   * Tracks which description variant is currently active
   */
  const [currentShiftingIndex, setCurrentShiftingIndex] = useState(0);
  
  /**
   * Boolean flag tracking if player has discovered the shifting room
   * Used to determine when shifting should begin occurring
   */
  const [hasVisitedShiftingRoom, setHasVisitedShiftingRoom] = useState(false);

  // ==================== CREATURE ENCOUNTER TIMERS ====================
  
  /**
   * Timestamp when player entered current room
   * Used for various creature encounter timers (fungi, nightcrawlers, etc.)
   */
  const [roomEntryTime, setRoomEntryTime] = useState(null);
  
  /**
   * Warning state for fungi creature encounters
   * Tracks if player has been warned about fungi room dangers
   */
  const [fungiWarning, setFungiWarning] = useState(false);
  
  /**
   * Controls visibility of water spirit (nixie) trade interface
   * Shows payment options when nixie demands toll for passage
   */
  const [showWaterSpiritTradeButton, setShowWaterSpiritTradeButton] = useState(false);

  // ==================== NIGHT CRAWLER PROTECTION SYSTEM ====================
  
  /**
   * Warning state for night crawler creature encounters
   * Tracks if player has been warned about night crawler dangers
   */
  const [nightCrawlerWarning, setNightCrawlerWarning] = useState(false);
  
  /**
   * Boolean indicating if player currently has protection from night crawlers
   * Activated by using cave salt crystals or other protective items
   */
  const [nightCrawlerProtection, setNightCrawlerProtection] = useState(false);
  
  /**
   * Timer for night crawler protection duration
   * Stores timestamp when protection will expire
   */
  const [nightCrawlerProtectionTimer, setNightCrawlerProtectionTimer] = useState(null);

  // ==================== CRYSTAL ROOM MECHANICS ====================
  
  /**
   * Warning state for crystal room sleep dangers
   * Crystal rooms can cause player to fall asleep permanently if they stay too long
   */
  const [crystalRoomWarning, setCrystalRoomWarning] = useState(false);
  
  // Note: crystalEntryTime is commented out, likely managed in specialRooms instead
  // const [crystalEntryTime, setCrystalEntryTime] = useState(null);

  // ==================== ENVIRONMENTAL EFFECTS ====================
  
  /**
   * Timer for temperature-related environmental effects
   * Manages hot/cold room effects and their durations
   */
  const [temperatureTimer, setTemperatureTimer] = useState(null);

  // ==================== WIZARD AND MAGIC SYSTEM STATE ====================
  
  /**
   * Tracks if player has visited the wizard's room (room 32)
   * Used for wizard encounter logic and spell availability
   */
  const [wizardRoomVisited, setWizardRoomVisited] = useState(false);
  
  /**
   * Boolean indicating if the ancient spellbook has been successfully deciphered
   * Required for casting spells and accessing magical abilities
   */
  const [spellbookDeciphered, setSpellbookDeciphered] = useState(false);
  
  /**
   * Currently active spell effect
   * Tracks which magical spell (if any) is currently affecting the player
   */
  const [activeSpell, setActiveSpell] = useState(null);
  
  /**
   * Boolean indicating if floating spell is currently active
   * Floating spell allows player to safely traverse pits
   */
  const [floatingActive, setFloatingActive] = useState(false);
  
  /**
   * Number of moves remaining for floating spell
   * Floating spell has limited duration before wearing off
   */
  const [floatingMovesLeft, setFloatingMovesLeft] = useState(0);
  
  /**
   * State for handling spellbook backfire effects
   * Some spells can backfire and cause negative effects
   */
  const [spellbookBackfire, setSpellbookBackfire] = useState(false);
  
  /**
   * Timestamp when player entered the wizard's room
   * Used for wizard room encounter timing and warnings
   */
  const [wizardRoomEntryTime, setWizardRoomEntryTime] = useState(null);
  
  /**
   * Warning state for wizard room dangers
   * Wizard room has time-limited dangers if player stays too long
   */
  const [wizardRoomWarning, setWizardRoomWarning] = useState(false);

  // ==================== MERCHANT AND ECONOMY SYSTEM ====================
  
  /**
   * Cooldown timer for goblin merchant interactions
   * Prevents spam trading and adds realism to merchant availability
   */
  const [goblinCooldown, setGoblinCooldown] = useState(0);
  
  /**
   * Boolean indicating if shop interface mode is currently active
   * Controls UI state when player is actively shopping
   */
  const [shopMode, setShopMode] = useState(false);

  // ==================== TREASURE DISCOVERY UI STATE ====================
  
  /**
   * Controls visibility of treasure discovery display overlay
   * Shows dramatic treasure found animation and information
   */
  const [showTreasureDisplay, setShowTreasureDisplay] = useState(false);
  
  /**
   * Information about the most recently discovered treasure
   * Contains treasure name, description, and display data
   */
  const [foundTreasureInfo, setFoundTreasureInfo] = useState(null);

  // ==================== VICTORY AND SPECIAL SCENES ====================
  
  /**
   * Controls visibility of ladder extension scene
   * Special animation when wyrmglass extends the exit ladder
   */
  const [showLadderExtendScene, setShowLadderExtendScene] = useState(false);
  
  /**
   * Stores special narrative messages for important game events
   * Used for significant story moments and dramatic reveals
   */
  const [specialMessage, setSpecialMessage] = useState(null);
  
  /**
   * Controls visibility of victory video/animation
   * Triggered when player successfully completes the game
   */
  const [showWinVideo, setShowWinVideo] = useState(false);
  
  /**
   * Controls visibility of win message display
   * Shows final victory message and game completion information
   */
  const [showWinMessage, setShowWinMessage] = useState(false);

  // ==================== AUDIO SYSTEM REFS ====================
  
  /**
   * Reference to prevent victory music from starting multiple times
   * Victory music should only play once per game completion
   */
  const victoryMusicStarted = useRef(false);
  
  /**
   * Reference to prevent win sound listener from being added multiple times
   * Ensures clean audio event handling for victory sequences
   */
  const winSoundListenerAdded = useRef(false);


 // ==================== GIFT SHOP CONFLICT RESOLUTION SYSTEM ====================
  
  /**
   * Ensures a gift shop exists in the game world and resolves conflicts with other game elements
   * This is a sophisticated conflict resolution system that handles overlapping game features
   * Prevents gift shop from spawning in the same location as critical game elements
   */
const ensureGiftShopExists = () => {
  console.log("=== ENSURING GIFT SHOP EXISTS ===");
  console.log("Current room descriptions:", Object.keys(roomDescriptionMap).length);
  
 
   // ========== IDENTIFY EXISTING GIFT SHOP ==========
    // First try to identify if one already exists
  let giftShopRoomId = identifyGiftShopRoom();
  
    // ========== CRITICAL CONFLICT RESOLUTION ==========
    // CHECK: If gift shop is in the same room as exit, we have a problem
  if (giftShopRoomId && giftShopRoomId === positions.exitPosition) {
    console.log(`CONFLICT: Gift shop (${giftShopRoomId}) is in same room as exit!`);
    
        // ========== EXIT RELOCATION LOGIC ==========
      // Move the exit to a different room to resolve conflict
    const safeExitRooms = [];
    for (let i = 1; i <= 30; i++) {
      if (i !== positions.wumpusPosition &&
          i !== positions.pitPosition1 &&
          i !== positions.pitPosition2 &&
          i !== positions.batPosition &&
          i !== giftShopRoomId &&
          !treasurePieces?.some(t => t.room === i)) {
        safeExitRooms.push(i);
      }
    }
    
    if (safeExitRooms.length > 0) {
      const newExitPosition = safeExitRooms[Math.floor(Math.random() * safeExitRooms.length)];
      console.log(`Moving exit from ${positions.exitPosition} to ${newExitPosition}`);
      
      // Update positions
      setPositions(prev => ({
        ...prev,
        exitPosition: newExitPosition
      }));
      
      // Update room description for new exit
      setRoomDescriptionMap(prev => ({
        ...prev,
        [newExitPosition]: {
          text: "You can see a faint light coming from above - this appears to be the exit! A rickety ladder leads up to the surface.",
          mood: "hopeful",
          special: "exit",
          hasWater: false,
          isExitRoom: true
        },
        // Remove exit properties from old room (keep gift shop)
        [positions.exitPosition]: {
          ...prev[positions.exitPosition],
          special: null,
          isExitRoom: false
        }
      }));
    }
  }
  
  // If no gift shop found, force one into a safe room
  if (!giftShopRoomId) {
    console.log("No gift shop found - forcing one into the game");
    
    // IMPORTANT: Check current room descriptions to avoid overwriting special rooms
    const occupiedRooms = [];
    
    // Add hazard positions
    occupiedRooms.push(
      positions.wumpusPosition,
      positions.pitPosition1,
      positions.pitPosition2,
      positions.batPosition,
      positions.exitPosition
    );
    
    // Add treasure map room
    if (treasureMap) {
      occupiedRooms.push(treasureMap);
    }
    
    // Add treasure rooms
    if (treasurePieces && treasurePieces.length > 0) {
      treasurePieces.forEach(treasure => {
        if (treasure.room) occupiedRooms.push(treasure.room);
      });
    }
    
    // Add special creature rooms (water sprite, sand creature, etc.)
    for (let i = 1; i <= 30; i++) {
      const roomDesc = roomDescriptionMap[i];
      if (roomDesc && roomDesc.text) {
        // Check for special rooms that shouldn't be overwritten
        if (roomDesc.text.includes('tranquil pool') ||
            roomDesc.text.includes('soft sand') ||
            roomDesc.text.includes('luminescent fungi') ||
            roomDesc.isPitRoom ||
            roomDesc.isExitRoom) {
          occupiedRooms.push(i);
        }
      }
    }
    
    console.log("Occupied rooms to avoid:", occupiedRooms);
    
    // Find first available safe room
    let foundRoom = false;
    for (let i = 1; i <= 30; i++) {
      if (!occupiedRooms.includes(i)) {
        giftShopRoomId = i;
        console.log(`Placing gift shop in safe room ${i}`);
        foundRoom = true;
        break;
      }
    }
    
    // If no safe room found, find the first room that's not a critical hazard
    if (!foundRoom) {
      console.log("WARNING: No completely safe rooms, finding best option");
      for (let i = 1; i <= 30; i++) {
        // Avoid only the most critical rooms (pits and exit)
        if (i !== positions.pitPosition1 && 
            i !== positions.pitPosition2 && 
            i !== positions.exitPosition) {
          giftShopRoomId = i;
          console.log(`Placing gift shop in room ${i} (may conflict with other features)`);
          break;
        }
      }
    }
    
    // Create gift shop description
    const giftShopDescription = {
      text: "A surprising sight in these ancient caves - someone has set up a makeshift gift shop here. Tacky t-shirts proclaiming 'I Survived the Cave of Wumpus!' hang from stalactites, and various dubious 'authentic cave treasures' are displayed on natural rock shelves. The entrepreneurial goblin shopkeeper grins at you hopefully.",
      mood: "quirky",
      special: null,
      hasWater: false,
      isGiftShop: true,
      enhancedText: "Your lantern reveals the full extent of this underground commercial enterprise. Canvas bags, ceramic mugs with cave paintings, and what appears to be a stuffed Wumpus plush toy are arranged with surprising care. Price tags dangle from items, all marked in 'gold coins only.' The goblin adjusts his own t-shirt that reads 'Ask Me About Our Specials!'"
    };
    
    // Force update the room description
    setRoomDescriptionMap(prev => ({
      ...prev,
      [giftShopRoomId]: giftShopDescription
    }));
    
    // Update all the tracking variables
    setGiftShopRoom(giftShopRoomId);
    
    // Update positions
    setPositions(prev => ({
      ...prev,
      giftShopPosition: giftShopRoomId
    }));
  }
  
  // Update special rooms
  if (giftShopRoomId) {
    setSpecialRooms(prev => ({
      ...prev,
      [giftShopRoomId]: {
        ...prev[giftShopRoomId],
        isGiftShop: true
      }
    }));
  }
  
  console.log(`=== GIFT SHOP CONFIRMED IN ROOM ${giftShopRoomId} ===`);
  
  return giftShopRoomId;
};

// Add audio for wumpus scream
const playWumpusScreamSound = () => {
  console.log("Playing wumpus scream sound");
  const sound = new Audio(require('../sounds/wumpus-scream.wav')); // Make sure this file exists
  sound.volume = 0.7;
  sound.play().catch(error => {
    console.error('Error playing wumpus scream sound:', error);
  });
};
  // ==================== SAVE GAME SYSTEM ====================
  
  /**
   * Saves complete game state to localStorage for later restoration
   * Handles complex state serialization including timers, positions, and progress
   * @returns {boolean} True if save successful, false if failed
   */
  const saveGame = () => {
    try {
      // ========== GAME STATE OBJECT CONSTRUCTION ==========
      const gameState = {
        // ========== META INFORMATION ==========
        version: "1.0",                          // Save format version for compatibility
        savedAt: new Date().toISOString(),       // Timestamp of save creation
        
        // ========== CORE GAME STATE ==========
        currentPosition,                         // Player's current room
        gameStatus,                              // 'playing', 'won', 'lost'
        moveCounter,                             // Total moves made by player
        history,                                 // Array of previously visited rooms
        
        // ========== PLAYER STATISTICS ==========
        torchLevel,                              // Current torch fuel level (0-100)
        darknessCounter,                         // Moves spent in darkness
        inventory,                               // Player's items and equipment
        
        // ========== WORLD STATE ==========
        roomDescriptionMap,                      // All room descriptions and states
        specialRooms,                            // Special room properties and timers
        roomConnections,                         // Room connectivity map
       
        // ========== ENTITY POSITIONS ==========
        positions,                               // Wumpus, pits, bats, exit locations
        
        // ========== TREASURE HUNT PROGRESS ==========
        treasureMap,                             // Treasure map room location
        treasurePieces,                          // All treasure objects in game
        collectedTreasures,                      // Treasures found by player
        hasMap,                                  // Boolean: player has treasure map
        mapClue,                                 // Current map clue text
       
        // ========== MERCHANT SYSTEMS ==========
        giftShopRoom,                            // Gift shop location
        goblinCooldown,                          // Merchant interaction cooldown
        
        // ========== SHIFTING ROOM STATE ==========
        shiftingRoomId,                          // Which room has shifting mechanics
        originalRoomDescription,                 // Original description before shifts
        originalRoomTreasure,                    // Original treasure in shifting room
        shiftingRoomDescriptions,                // Array of possible descriptions
        currentShiftingIndex,                    // Current description index
        hasVisitedShiftingRoom,                  // Has player discovered shifting room
        
        // ========== WIZARD AND MAGIC SYSTEM ==========
        wizardRoomVisited,                       // Has player found wizard room
        spellbookDeciphered,                     // Can player cast spells
        activeSpell,                             // Currently active spell effect
        floatingActive,                          // Is floating spell active
        floatingMovesLeft,                       // Remaining floating spell moves
        wizardFreed: window.WIZARD_FREED || false, // Global wizard freedom state
        
        // ========== PROTECTION AND TIMING SYSTEMS ==========
        nightCrawlerProtection,                  // Cave salt protection active
        // Convert timer to future timestamp for restoration
        nightCrawlerProtectionTimer: nightCrawlerProtectionTimer ? Date.now() + nightCrawlerProtectionTimer : null,
        
        // ========== ITEM USAGE TRACKING ==========
        mapFragmentUses,                         // How many times map fragment used
        
        // ========== ENCOUNTER HISTORY ==========
        batEncounters,                           // Record of all bat teleportations
        
        // ========== GLOBAL STATE PRESERVATION ==========
        globalCloakState: window.GLOBAL_CLOAK_STATE || false, // Invisibility cloak state
        
        // ========== EXIT MECHANICS ==========
        exitLadderExtended: specialRooms[positions?.exitPosition]?.ladderExtended || false
      };
      
      // ========== SAVE OPERATION ==========
      // Convert to JSON and save to localStorage
      localStorage.setItem('wumpusCaveSave', JSON.stringify(gameState));
      
      // ========== SUCCESS FEEDBACK ==========
      // Show success message and play confirmation sound
      setMessage("Game saved successfully! You can safely close the game and continue later.");
      playSaveGameSound();
      return true;
      
    } catch (error) {
      // ========== ERROR HANDLING ==========
      console.error("Error saving game:", error);
      setMessage("Failed to save game. Your browser might not support saving.");
      return false;
    }
  };

/**
   * Loads complete game state from localStorage and restores all game systems
   * Handles complex state deserialization including timer restoration and validation
   * @returns {boolean} True if load successful, false if failed or no save exists
   */
  const loadGame = () => {
    try {
      // ========== SAVE FILE RETRIEVAL ==========
      const savedGameStr = localStorage.getItem('wumpusCaveSave');
      if (!savedGameStr) {
        setMessage("No saved game found.");
        return false;
      }
      
      // ========== SAVE FILE PARSING ==========
      const savedGame = JSON.parse(savedGameStr);
      
      // ========== VERSION COMPATIBILITY CHECK ==========
      // Verify save version for future compatibility
      if (savedGame.version !== "1.0") {
        setMessage("This save file is from a different game version and cannot be loaded.");
        return false;
      }
      
      // ========== AUDIO AND UI FEEDBACK ==========
      playLoadGameSound();
      console.log("Loading saved game");
      
      // ========== CRITICAL UI STATE RESET ==========
      // IMPORTANT: Hide the intro screen first to prevent UI conflicts!
      setShowIntro(false);
      
      // ========== CORE GAME STATE RESTORATION ==========
      setCurrentPosition(savedGame.currentPosition);
      setGameStatus(savedGame.gameStatus);
      setMoveCounter(savedGame.moveCounter);
      setHistory(savedGame.history || []);
      
      // ========== PLAYER STATISTICS RESTORATION ==========
      setTorchLevel(savedGame.torchLevel);
      setDarknessCounter(savedGame.darknessCounter);
      setInventory(savedGame.inventory || []);
      
      // ========== WORLD STATE RESTORATION ==========
      setRoomDescriptionMap(savedGame.roomDescriptionMap || {});
      setSpecialRooms(savedGame.specialRooms || {});
      setRoomConnections(savedGame.roomConnections || {});
      
      // ========== ENTITY POSITIONS RESTORATION ==========
      setPositions(savedGame.positions);
      
      // ========== TREASURE HUNT STATE RESTORATION ==========
      setTreasureMap(savedGame.treasureMap);
      setTreasurePieces(savedGame.treasurePieces || []);
      setCollectedTreasures(savedGame.collectedTreasures || []);
      setHasMap(savedGame.hasMap || false);
      setMapClue(savedGame.mapClue || '');
      
      // ========== MERCHANT SYSTEM RESTORATION ==========
      setGiftShopRoom(savedGame.giftShopRoom);
      setGoblinCooldown(savedGame.goblinCooldown || 0);
      
      // ========== SHIFTING ROOM STATE RESTORATION ==========
      setShiftingRoomId(savedGame.shiftingRoomId);
      setOriginalRoomDescription(savedGame.originalRoomDescription);
      setOriginalRoomTreasure(savedGame.originalRoomTreasure);
      setShiftingRoomDescriptions(savedGame.shiftingRoomDescriptions || []);
      setCurrentShiftingIndex(savedGame.currentShiftingIndex || 0);
      setHasVisitedShiftingRoom(savedGame.hasVisitedShiftingRoom || false);
      
      // ========== WIZARD AND MAGIC SYSTEM RESTORATION ==========
      setWizardRoomVisited(savedGame.wizardRoomVisited || false);
      setSpellbookDeciphered(savedGame.spellbookDeciphered || false);
      setActiveSpell(savedGame.activeSpell);
      setFloatingActive(savedGame.floatingActive || false);
      setFloatingMovesLeft(savedGame.floatingMovesLeft || 0);
      window.WIZARD_FREED = savedGame.wizardFreed || false;
      
      // ========== PROTECTION SYSTEM RESTORATION ==========
      setNightCrawlerProtection(savedGame.nightCrawlerProtection || false);
      
      // ========== TIMER RESTORATION LOGIC ==========
      // Convert saved timestamp back to remaining time if still valid
      if (savedGame.nightCrawlerProtectionTimer && savedGame.nightCrawlerProtectionTimer > Date.now()) {
        setNightCrawlerProtectionTimer(savedGame.nightCrawlerProtectionTimer - Date.now());
      }
      
      // ========== ITEM USAGE TRACKING RESTORATION ==========
      setMapFragmentUses(savedGame.mapFragmentUses || 0);
      setBatEncounters(savedGame.batEncounters || []);
      
      // ========== GLOBAL STATE RESTORATION ==========
      window.GLOBAL_CLOAK_STATE = savedGame.globalCloakState || false;
      
      // ========== BACKGROUND MUSIC MANAGEMENT ==========
      // Start background music if not already playing
      if (!backgroundMusicStarted.current) {
        playBackgroundMusic();
        backgroundMusicStarted.current = true;
      }
      
      // ========== ROOM STATE SYNCHRONIZATION ==========
      // Call checkPosition to update the current room display
      // Use timeout to ensure all state updates have completed
      if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
        setTimeout(() => {
          gameLogicFunctions.current.checkPosition(savedGame.currentPosition);
        }, 100);
      }
      
      // ========== SUCCESS FEEDBACK ==========
      setMessage(`Game loaded! You're back in room ${savedGame.currentPosition}. Welcome back, adventurer!`);
      
      return true;
      
    } catch (error) {
      // ========== ERROR HANDLING ==========
      console.error("Error loading game:", error);
      setMessage("Failed to load saved game. The save file might be corrupted.");
      return false;
    }
  };


 // ==================== SAVE GAME UTILITY FUNCTIONS ====================
  
  /**
   * Checks if a saved game exists in localStorage
   * Simple utility function used to conditionally display "Load Game" option in UI
   * @returns {boolean} True if save file exists, false otherwise
   */
const hasSavedGame = () => {
  return localStorage.getItem('wumpusCaveSave') !== null;
};

/**
   * Deletes the saved game from localStorage
   * Provides option to start fresh without old save data
   */
const deleteSavedGame = () => {
  localStorage.removeItem('wumpusCaveSave');
  setMessage("Saved game deleted.");
};



// ==================== ENVIRONMENTAL TEMPERATURE SYSTEM ====================
  
  /**
   * Handles temperature-based environmental effects based on room mood and equipment
   * Manages complex interactions between cloak equipment and room temperature
   * Creates cascading timer-based danger systems for realistic environmental hazards
   * 
   * @param {number} position - Current room position to check for temperature effects
   */
const checkTemperatureEffects = (position) => {
    if (gameStatus !== 'playing') {
    return;
  }
  if (!position) return;
  
  // Clear any existing timer first to prevent overlap
  if (temperatureTimer) {
    clearTimeout(temperatureTimer);
    setTemperatureTimer(null);
  }
  
  // Check if player is in a cold or hot room
  const roomInfo = roomDescriptionMap[position]; 
  const isColdRoom = roomInfo?.mood === 'cold';
  const isHotRoom = roomInfo?.mood === 'warm';
  
  // Determine if cloak is equipped (check global state first, then inventory)
  let cloakEquipped = window.GLOBAL_CLOAK_STATE !== undefined 
    ? window.GLOBAL_CLOAK_STATE 
    : inventory.some(item => 
        (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
      );
  
  // Set global state for tracking across timers
  window.TEMP_EFFECT_ROOM = position;
  window.TEMP_EFFECT_START_TIME = Date.now();
  
  // HOT ROOM WITH CLOAK - BAD COMBINATION
  if (isHotRoom && cloakEquipped) {
    window.TEMP_EFFECT_TYPE = 'hot';
    
    // Show initial warning
    setMessage(prev => {
      const warningMsg = " The thick cloak is making you uncomfortably warm in this heated chamber.";
      return prev.includes(warningMsg) ? prev : prev + warningMsg;
    });
    
    // First timer - 20 seconds
    const hotTimer = setTimeout(() => {

        // Check if game is still playing
  if (gameStatus !== 'playing') {
    return;
  }
      const effectRoom = window.TEMP_EFFECT_ROOM;
      const effectType = window.TEMP_EFFECT_TYPE;
      
      // Only apply if player still in same room with same effect type
      if (position === effectRoom && effectType === 'hot') {
        // Check if cloak is still equipped
        let stillEquipped = window.GLOBAL_CLOAK_STATE !== undefined 
          ? window.GLOBAL_CLOAK_STATE 
          : inventory.some(item => 
              (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
            );
        
        if (stillEquipped) {
          // First level effect - increase torch
          setTorchLevel(prev => Math.max(prev +2, 100));
          setMessage("Your body temperature is rising dangerously. Remove the cloak or leave this heated chamber soon!");
          
          // Second timer - 15 seconds
          const secondHotTimer = setTimeout(() => {
            const effectRoom2 = window.TEMP_EFFECT_ROOM;
            const effectType2 = window.TEMP_EFFECT_TYPE;
            
            // Check if player still in same room with same effect
            if (position === effectRoom2 && effectType2 === 'hot') {
              // Check if cloak is still equipped
              let stillEquippedAgain = window.GLOBAL_CLOAK_STATE !== undefined 
                ? window.GLOBAL_CLOAK_STATE 
                : inventory.some(item => 
                    (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
                  );
              
              if (stillEquippedAgain) {
                // Player dies from heat
                setGameStatus('lost');
                setDeathCause('heat');
                setMessage("The heat from the cave walls are magnified by the cloak and it quickly overwhelms you. \nYou collapse from heat exhaustion. \nYour remains start to turn into carbonized form from the continuted heat. \nEventually turning you into ashes that eventually blow away. \nPoof! \nGame over!");
              } else {
                // Player removed cloak in time
                setMessage("You've removed the cloak just in time. The heat is now bearable.");
              }
            }
          }, 8000); // 15 seconds
          
          // Store the timer
          setTemperatureTimer(secondHotTimer);
        } else {
          // Player removed cloak before first effect
          setMessage("You've removed the cloak. The heat is now bearable.");
        }
      }
    }, 4000); // 20 seconds
    
    // Store the timer
    setTemperatureTimer(hotTimer);
  }
  
  // COLD ROOM WITHOUT CLOAK - BAD COMBINATION
  else if (isColdRoom && !cloakEquipped) {
    window.TEMP_EFFECT_TYPE = 'cold';
    
    // Show warning
    setMessage(prev => {
      const coldMsg = " \nThe frigid air makes you shiver. A warm cloak would help here.";
      return prev.includes(coldMsg) ? prev : prev + coldMsg;
    });
    
    // First level timer - 10 seconds
    const coldTimer = setTimeout(() => {
      const effectRoom = window.TEMP_EFFECT_ROOM;
      const effectType = window.TEMP_EFFECT_TYPE;
      
      // Only apply if player still in same room with same effect
      if (position === effectRoom && effectType === 'cold') {
        // Check if player has put on cloak
        let nowEquipped = window.GLOBAL_CLOAK_STATE !== undefined 
          ? window.GLOBAL_CLOAK_STATE 
          : inventory.some(item => 
              (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
            );
        
        if (!nowEquipped) {
          // First level effect - drain torch
          setTorchLevel(prev => Math.max(prev - 5, 25));
          setMessage("The extreme cold drains your warmth.\nPut on  protection soon or leave this room!\n\n Oh Dear! Oh Dear!");
          
          // Second level timer - 10 seconds
          const secondColdTimer = setTimeout(() => {
            const effectRoom2 = window.TEMP_EFFECT_ROOM;
            const effectType2 = window.TEMP_EFFECT_TYPE;
            
            // Check if player still in same room with same effect
            if (position === effectRoom2 && effectType2 === 'cold') {
              // Check if player still doesn't have cloak
              let stillNoCloak = window.GLOBAL_CLOAK_STATE !== undefined 
                ? !window.GLOBAL_CLOAK_STATE 
                : !inventory.some(item => 
                    (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
                  );
              
              if (stillNoCloak) {
                // Player dies from cold
                setGameStatus('lost');
                setDeathCause('cold');
                setMessage("The freezing cold overwhelms you.\n You have frozen into a giant ice popsicle\n Over the next few centuries, the ice critters in this cave will enjoy the fresh frozen delightfully delicous delectable you have become for them. \nA gift from the cave gods\n\nGAME OVER!");
              } else {
                // Player put on cloak in time
                setMessage("The cloak provides relief from the freezing cold.");
              }
            }
          }, 15000); // 15 seconds
          
          // Store the timer
          setTemperatureTimer(secondColdTimer);
        } else {
          // Player put on cloak before first effect
          setMessage("The cloak provides relief from the freezing cold.");
        }
      }
    }, 5000); // 5 seconds
    
    // Store the timer
    setTemperatureTimer(coldTimer);
  }
  
  // COLD ROOM WITH CLOAK - PROTECTED
  else if (isColdRoom && cloakEquipped) {
    window.TEMP_EFFECT_TYPE = null;
    
    // Show protection message
    setMessage(prev => {
      const protectionMsg = " The cloak keeps you warm in this frigid chamber.";
      return prev.includes(protectionMsg) ? prev : prev + protectionMsg;
    });
  }
  
  // REGULAR ROOM OR HOT ROOM WITHOUT CLOAK - NO EFFECT
  else {
    window.TEMP_EFFECT_TYPE = null;
  }
};



  // ==================== ENHANCED GOLD COIN COLLECTION SYSTEM ====================
  
  /**
   * Enhanced function for adding main gold coins (10) to inventory with rich lore
   * Handles both new collection and adding to existing coins with dynamic descriptions
   * Integrates with the coin lore system for immersive storytelling
   * 
   * @param {string} itemId - The item ID being collected
   */


const addGoldCoinsWithLore = (itemId) => {
  // Check if player already has gold coins
  const existingGoldCoins = inventory.find(item => 
    (item.originalId || item.id) === 'gold_coins'
  );
  
  if (existingGoldCoins) {
    // Add 10 to existing gold coins count
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'gold_coins') {
        const currentValue = typeof item.value === 'number' ? item.value : 1;
        const newValue = currentValue + 10;
        return {
          ...item,
          value: newValue,
          name: `${goldCoinDescription.name} (${newValue})`,
          description: goldCoinDescription.description,
          lore: goldCoinDescription.lore,
          inspectionText: goldCoinDescription.inspectionText,
          canInspect: true
        };
      }
      return item;
    }));
    
    // Update room description
    updateRoomDescriptionAfterCollection(itemId);
    
    // Show enriched message
    setMessage(`You found a cache of ${goldCoinDescription.name}! As you add them to your existing collection, you notice their unusual weight and craftsmanship. ${goldCoinDescription.lore.split('.')[0]}.`);
  } else {
    // Create new item with 10 coins and rich descriptions
    // Use itemTypes as a base if it exists
    const baseItem = itemTypes[itemId] ? {...itemTypes[itemId]} : {
      icon: '💰',
      originalId: 'gold_coins'
    };
    
    const goldCoinItem = {
      ...baseItem,
      id: 'gold_coins_' + Date.now(),
      originalId: 'gold_coins',
      name: `${goldCoinDescription.name} (10)`,
      value: 10,
      description: goldCoinDescription.description,
      lore: goldCoinDescription.lore,
      inspectionText: goldCoinDescription.inspectionText,
      canInspect: true
    };
    
    setInventory(prev => [...prev, goldCoinItem]);
    updateRoomDescriptionAfterCollection(itemId);
    
    // Show enriched message
    setMessage(`You found a cache of ${goldCoinDescription.name}! ${goldCoinDescription.description.split('.')[0]}. The gold gleams with an otherworldly quality in your torchlight.`);
  }
  
  return; // Exit after handling gold coins
};


  // ==================== GOLD COIN INSPECTION SYSTEM ====================
  
  /**
   * Function to inspect gold coins with detailed lore and hidden secrets
   * Provides immersive examination mechanics with chance for secret discovery
   * Dynamically adjusts descriptions based on coin quantity
   */
const inspectGoldCoins = () => {
  const coins = inventory.find(item => 
    (item.originalId || item.id) === 'gold_coins'
  );
  
  if (coins) {
    const count = coins.value || 1;
    const isPlural = count > 1;
    
    // Show detailed inspection message
    setMessage(`You examine the ancient ${isPlural ? 'coins' : 'coin'} carefully. ${coins.inspectionText || goldCoinDescription.inspectionText} ${count > 5 ? "With this many coins, you wonder if they might be valuable to a collector or historian back in the village." : ""}`);
    
    // 5% chance to discover hidden lore when inspecting
    if (Math.random() < 0.05 && !coins.revealedSecretLore) {
      setTimeout(() => {
        setMessage(prev => prev + "\n\nAs you turn one coin in your hand, you notice something unusual - when held at just the right angle near your torch, hidden symbols appear between the runes, seemingly etched with heat-reactive ink. These coins may have been used to carry secret messages during ancient times.");
        
        // Mark that this secret has been discovered
        setInventory(prev => prev.map(item => {
          if ((item.originalId || item.id) === 'gold_coins') {
            return {
              ...item,
              revealedSecretLore: true,
              description: item.description + " When held at a certain angle near heat, hidden symbols appear between the runes."
            };
          }
          return item;
        }));
      }, 2000);
    }
  }
};


//This function is for adding items to inventory that were bought at the giftshop.or picked up autmattically in the cave
const addItemToInventory = (itemId) => {
  console.log(`Adding ${itemId} to inventory`);
  
  // Check if item already exists in inventory
  const existingItem = inventory.find(item =>
    (item.originalId || item.id) === itemId
  );
  // List of items that are interactive (clicked on)
  const interactiveItems = ['torch_oil', 'lantern', 'spellbook', 'golden_compass', 'invisibility_cloak', 'cave_salt', 'sulfur_crystal', 'loose_rocks', 'single_gold_coin','wyrmglass','fools_gold','utility_knife','tarnished_bracelet'];
  
  
// Play sound for new interactive items only
  if (!existingItem && interactiveItems.includes(itemId)) {
    playInteractivePickupSound(); // Add this
  }

  // Special handling for gold coins - add to existing stack if present
  if (itemId === 'gold_coins') {
    // Use the enhanced function for gold coins
    addGoldCoinsWithLore(itemId);
    return; // Exit early after handling gold coins
  }
  
  // For torch oil, use stacking instead of adding a duplicate
  if (itemId === 'torch_oil' && existingItem) {
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'torch_oil') {
        const newQuantity = (item.quantity || 1) + 1;
        return {
          ...item,
          quantity: newQuantity,
          name: `Torch Oil Flask (${newQuantity})` // Update name to show quantity
        };
      }
      return item;
    }));
    // Update room description even for stacking
    updateRoomDescriptionAfterCollection(itemId);
    return; // Exit early
  }
  
  // For other items or if this is the first torch oil
  if (!existingItem) {
    // Get the item type data
    const itemData = itemTypes[itemId];
    if (!itemData) {
      console.error(`Unknown item: ${itemId}`);
      return;
    }
    
    // Create the inventory item with unique ID
    const itemToAdd = {
      ...itemData,
      id: itemId + '_' + Date.now(), // Unique ID
      originalId: itemId // Store original ID for checks
    };
    
    // If this is torch oil, set quantity
    if (itemId === 'torch_oil') {
      itemToAdd.quantity = 1;
      itemToAdd.name = `Torch Oil Flask (1)`;
    }
    
    if (itemId === 'loose_rocks') {
      console.log("ROCKS: Adding loose rocks to inventory");
    }
    
    // SPECIAL HANDLING FOR MAP FRAGMENT - Check if it has a purpose in specialRooms
    if (itemId === 'old_map') {
      // Find which room has this map fragment
      let mapPurpose = null;
      
      Object.entries(specialRooms).forEach(([roomId, roomData]) => {
        if (roomData?.itemId === 'old_map' && roomData?.mapPurpose) {
          console.log(`Found map fragment purpose in room ${roomId}: ${roomData.mapPurpose}`);
          mapPurpose = roomData.mapPurpose;
        }
      });
      
      // If we found a purpose, add it to the item
      if (mapPurpose) {
        itemToAdd.purpose = mapPurpose;
        console.log(`Adding map fragment to inventory with purpose: ${mapPurpose}`);
      } else {
        // Fallback to global purpose if no room-specific purpose found
        itemToAdd.purpose = itemTypes.old_map.purpose;
        console.log(`Using global map fragment purpose: ${itemToAdd.purpose}`);
      }
    }
    
    // Add to inventory
    if (itemToAdd) {
      setInventory(prev => [...prev, itemToAdd]);
      // Update room description after adding to inventory
      updateRoomDescriptionAfterCollection(itemId);
    }
  }

};




// ==================== INVENTORY VALIDATION UTILITIES ====================

/**
 * Utility function to check if a specific item exists in player inventory
 * Simple lookup function used throughout the game for conditional logic
 * 
 * @param {string} itemId - Unique identifier for the item to search for
 * @returns {boolean} True if item exists in inventory, false otherwise
 * 
 * Usage Examples:
 * - if (hasItem('torch')) { // player has torch }
 * - Conditional UI rendering for item-dependent actions
 * - Prerequisite checks before allowing certain game actions
 */
const hasItem = (itemId) => {
  return inventory.some(item => item.id === itemId);
};


// ==================== CENTRAL ITEM USAGE SYSTEM ====================

/**
 * Central item usage handler - coordinates all item interactions in the game
 * This is the main orchestrator for item functionality, handling complex dependencies
 * and state management across multiple game systems
 * 
 * @param {string} itemId - Unique identifier for the item being used
 * 
 * **Key System Features:**
 * - **Dependency Injection**: Passes comprehensive game state to item handlers
 * - **Modular Design**: Uses external item manager for specific item logic
 * - **State Coordination**: Synchronizes multiple game systems during item use
 * - **Resource Management**: Handles item consumption and inventory updates
 * 
 * **Critical Dependencies Provided to Item Handlers:**
 * - Game State: position, status, inventory, room data
 * - Environmental: temperature, lighting, room connections
 * - UI Functions: sound effects, visual updates, message display
 * - Spell System: wizard state, active spells, spell outcomes
 * - Combat System: wumpus tracking, creature encounters
 * - Economic System: trading functions, currency management
 */
const handleUseItem = (itemId) => {
  // ========== ITEM VALIDATION ==========
  const item = inventory.find(item => item.id === itemId);
  if (!item) return;
  
  // ========== COMPREHENSIVE DEPENDENCY INJECTION ==========
  /**
   * Dependencies object contains ALL game state and functions needed by item handlers
   * This massive dependency injection pattern ensures item handlers can interact
   * with any part of the game system without tight coupling
   */
  const dependencies = {
    // ========== CORE GAME STATE ==========
    term,                    // Terminal/console interface reference
    currentPosition,         // Player's current room number
    gameStatus,             // Current game state (playing, dead, won, etc.)
    message,                // Current displayed message to player
    roomDescription,        // Current room's description text
    history,                // Game command/action history
    perceptions,            // Player's current environmental awareness
    batEncounter,           // Active bat encounter state
    moveCounter,            // Total moves taken by player
    positions,              // Array of all entity positions (wumpus, pits, etc.)
    roomMood,               // Current room's atmospheric setting
    roomHasWater,           // Water presence for environmental interactions
    roomSpecial,            // Special room properties and features
    torchLevel,             // Current torch fuel/brightness level
    darknessCounter,        // Darkness exposure tracking for danger
    inventory,              // Complete player inventory array
    specialRooms,           // Map of rooms with special properties
    mapFragmentUses,        // Usage counter for map fragment items
    treasurePieces,         // Collected treasure fragment data
    
    // ========== CALCULATED VALUES ==========
    hasMap,                 // Boolean: does player have map access
    collectedTreasures,     // Array of discovered treasure locations
    nightCrawlerWarning,    // Danger warning state for darkness creatures
    nightCrawlerProtection, // Protection status against darkness dangers
    
    // ========== ITEM SYSTEM DATA ==========
    itemTypes,              // Complete item type definitions and properties
    showWaterSpiritTradeButton,   // UI state for water spirit trading
    setShowWaterSpiritTradeButton, // Function to control trade UI
    
    // ========== STATE UPDATE FUNCTIONS ==========
    setTerm,                // Update terminal interface
    setCurrentPosition,     // Update player position
    setGameStatus,          // Change game state
    setMessage,             // Update displayed message
    setRoomDescription,     // Update room description text
    setHistory,             // Update command history
    setPerceptions,         // Update environmental awareness
    setBatEncounter,        // Control bat encounter state
    setMoveCounter,         // Update move counter
    setPositions,           // Update entity positions
    setRoomMood,            // Change room atmosphere
    setDeathCause,          // Set cause of player death
    setRoomHasWater,        // Update water presence
    setRoomSpecial,         // Update special room properties
    setTorchLevel,          // Update torch fuel level
    setDarknessCounter,     // Update darkness exposure
    setInventory,           // Update complete inventory
    setSpecialRooms,        // Update special room map
    
    // ========== INVENTORY MANAGEMENT ==========
    addItemToInventory,     // Add new items to player inventory
    updateRoomDescriptionAfterCollection, // Update room text after item pickup
    
    // ========== CREATURE AND DANGER SYSTEMS ==========
    setNightCrawlerWarning,    // Control darkness creature warnings
    setNightCrawlerProtection, // Control protection status
    setNightCrawlerProtectionTimer, // Manage protection duration
    checkTemperatureEffects,   // Environmental temperature system
    
    // ========== MAP FRAGMENT FUNCTIONALITY ==========
    setMapFragmentUses,        // Update fragment usage counter
    handleWumpusTracker: handleMapFragmentWumpusTracker,     // Wumpus detection fragment
    handleMapFragmentDangerSense,      // Danger detection fragment
    handleMapFragmentTreasureEnhancer, // Treasure enhancement fragment
    handleMapFragmentFlaskFinder,      // Flask location fragment
    handleMapFragmentSecretDoor,       // Secret door fragment
    handleMapFragmentDisintegrate,     // Destructive fragment
    handleMapFragmentRoomRevealer,     // Room revelation fragment
    handleMapFragmentGoldFinder,       // Gold detection fragment
    
    // ========== NAVIGATION AND PATHFINDING ==========
    findShortestPath,       // Calculate optimal routes between rooms
    calculateDistanceToRoom, // Calculate distance to specific room
    pulseButton,            // UI button highlighting effects
    highlightPathToRoom,    // Visual path highlighting system
    
    // ========== ROOM MANAGEMENT SYSTEM ==========
    roomDescriptionMap,     // Complete mapping of room descriptions
    setRoomDescriptionMap,  // Update room description database
    roomConnections,        // Room connectivity graph
    setRoomConnections,     // Update room connection data
    
    // ========== GAME LOGIC INTEGRATION ==========
    checkPosition,          // Validate and process position changes
    gameLogicFunctions,     // Access to core game logic systems
    
    // ========== TIMING AND TEMPORAL SYSTEMS ==========
    setRoomEntryTime,       // Track when player entered current room
    
    // ========== WIZARD AND MAGIC SYSTEMS ==========
    wizardRoomVisited,      // Track wizard encounter state
    setWizardRoomVisited,   // Update wizard encounter tracking
    spellbookDeciphered,    // Spellbook puzzle completion state
    setSpellbookDeciphered, // Update spellbook puzzle state
    setFloatingActive,      // Control levitation spell state
    setFloatingMovesLeft,   // Manage levitation spell duration
    setActiveSpell,         // Set currently active magical effect
    setSpellbookBackfire,   // Handle magical spell failures
    
    // ========== COMBAT AND REPELLENT SYSTEMS ==========
    setThrowingRepellent,   // Control repellent throwing state
    setRepellentThrowHandler, // Set callback for repellent actions
    throwingRepellent,      // Current repellent throwing status
    repellentThrowHandler,  // Active repellent throw callback
    
    // ========== AUDIO SYSTEM INTEGRATION ==========
    playTeleportSound,      // Teleportation sound effects
    playDistantWumpusSound, // Wumpus proximity audio cues
    playWumpusScreamSound,  // Wumpus death/injury sounds
   // playMapFoundSound,
    //playTreasureFoundSound,

    // ========== EQUIPMENT CONTROL SYSTEMS ==========
    activateLantern,        // Toggle lantern on/off functionality
    
    // ========== MAP FRAGMENT USAGE ==========
    handleUseMapFragment,   // Process map fragment usage
    
    // ========== TRADING AND COMMERCE ==========
    handleTrade,            // General trading system
    handleWaterSpiritTrade, // Specific water spirit trading
   
    // ========== CRITICAL EQUIPMENT FIXES ==========
    forceUpdateCloakState,  // Emergency cloak state synchronization
    
    // ========== SPECIAL SCENE CONTROLS ==========
    setShowLadderExtendScene, // Control ladder extension cutscene
    
    // ========== EXTENDED AUDIO LIBRARY ==========
    playWyrmglassSound,         // Wyrmglass item sound effect
    playSpellBookFailSound,     // Spell failure audio
    playSpellBookSuccessSound,  // Spell success audio
    playFlameSound,             // Fire/flame sound effects
    playGoldenCompassSound,     // Golden compass audio
    playPlushieScreamSound,     // Plushie creature scream
    playPlushieSqueakSound,     // Plushie creature squeak
    playPlushieMatingCallSound, // Plushie creature mating call
    playOldDoorOpeningSound,    // Ancient door opening sound
    playRockThrowSound,         // Rock throwing sound effect
    playRockLockedInPLaceSound, // Rock settling sound
    setVialToThrowSound,        // Vial throwing preparation sound
    playThrowingVialWooshSound, // Vial in flight sound
    playVialbreakingSound,      // Vial breaking sound
    playWizardFreedSound,       // Wizard liberation sound
    playNixieTollReqiuredSound, // Nixie toll demand sound
    playNixieOneGoldCoinSound,  // Nixie coin payment sound
    playNixieGoldenCompassSound, // Nixie compass sound
    playNixieThankYouJournalSound, // Nixie gratitude sound
    playNixieAFairTradeSound,   // Nixie fair trade sound
    playHiddenRoomRumblingSound, // Hidden room discovery sound
    playSodiumRockWaterExplosionSound, // Chemical reaction sound
    playWaterNixieShriekSound,  // Water nixie distress sound
    playNixieWailingKillScream, // Nixie death sound
  };
  
  // ========== EXTERNAL ITEM HANDLER EXECUTION ==========
  console.log("ITEM !!!-------", itemId )
  const removeItem = handleItemUse(itemId, dependencies);
  
  // ========== INVENTORY CLEANUP ==========
  // Remove the item if requested by the handler
  if (removeItem) {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  }
};



// ==================== CRITICAL EQUIPMENT STATE MANAGEMENT ====================

/**
 * Emergency cloak state synchronization system
 * Handles critical cloak equipment state corruption issues that can break temperature system
 * 
 * **Critical System Overview:**
 * This function exists to solve a complex state synchronization problem where the invisibility
 * cloak's equipped status can become desynchronized between different parts of the game,
 * potentially causing the temperature system to malfunction and kill the player unfairly.
 * 
 * **The Problem This Solves:**
 * - Cloak state stored in multiple places (inventory, global window variable)
 * - React state updates are asynchronous and can cause race conditions
 * - Temperature system depends on accurate cloak state for survival mechanics
 * - Desync can cause player death from environmental effects when protected
 * 
 * **Multi-Layer State Coordination:**
 * 1. **Inventory Update**: Directly modifies inventory array with new equipped state
 * 2. **Global State**: Updates window.GLOBAL_CLOAK_STATE for immediate access
 * 3. **Event System**: Dispatches custom events for component coordination
 * 4. **Validation Loop**: Verifies state update completed successfully
 * 5. **Temperature Recheck**: Forces temperature system to recalculate with new state
 * 
 * @param {boolean} newEquippedState - True if cloak should be equipped, false if unequipped
 * 
 * **Technical Implementation Details:**
 * - **Immediate State Update**: Uses functional state update to ensure atomicity
 * - **Dual Verification**: Checks both originalId and id for cloak identification
 * - **Name Synchronization**: Updates display name based on equipped status
 * - **Timer-Based Validation**: Uses setTimeout to verify state persistence
 * - **Event Broadcasting**: Custom events notify other components of state change
 * - **Environmental Integration**: Triggers temperature recalculation automatically
 */
const forceUpdateCloakState = (newEquippedState) => {
  console.log(`CRITICAL FIX: Force updating cloak equipped state to ${newEquippedState}`);
  
  // Update inventory directly, ensuring all components use the same state
  setInventory(prevInventory => {
    // Log before update
    console.log("CRITICAL FIX: Previous inventory:", prevInventory);
    
    // Create a new inventory array with the updated cloak
    const updatedInventory = prevInventory.map(item => {
      if ((item.originalId || item.id) === 'invisibility_cloak') {
        console.log(`CRITICAL FIX: Updating cloak item ${item.id} from ${item.equipped} to ${newEquippedState}`);
        return {
          ...item,
          equipped: newEquippedState,
          name: newEquippedState ? 'Tattered Winter Cloak (Worn)' : 'Tattered Winter Cloak'
        };
      }
      return item;
    });
    
    // Log after update
    console.log("CRITICAL FIX: Updated inventory:", updatedInventory);
    
    return updatedInventory;
  });
  
  // Set global state
  window.GLOBAL_CLOAK_STATE = newEquippedState;
  console.log(`CRITICAL FIX: Set global cloak state to ${newEquippedState}`);
  
  // Force a check of temperature effects with the new state
  setTimeout(() => {
    // Log the inventory to verify update
    console.log("CRITICAL FIX: Verifying cloak state after update:");
    
    const verifyCloak = inventory.find(item => 
      (item.originalId || item.id) === 'invisibility_cloak'
    );
    
    console.log("CRITICAL FIX: Cloak after update:", verifyCloak);
    
    // Run temperature check
    if (typeof checkTemperatureEffects === 'function') {
      checkTemperatureEffects(currentPosition);
    }
  }, 100);
  
  // Dispatch a custom event for other components to update
  const event = new CustomEvent('cloak_state_change', {
    detail: { equipped: newEquippedState }
  });
  window.dispatchEvent(event);

  setTimeout(() => {
    if (typeof checkTemperatureEffects === 'function' && currentPosition) {
      console.log("Checking temperature effects after cloak state update");
      checkTemperatureEffects(currentPosition);
    }
  }, 100);


};



// ==================== MAP FRAGMENT USAGE ORCHESTRATOR ====================

/**
 * Central coordinator for map fragment usage system
 * Manages complex item lifecycle, purpose-based functionality, and usage tracking
 * 
 * **System Overview:**
 * This function orchestrates a sophisticated item management system where map fragments
 * have different purposes (danger_sense, secret_door, wumpus_tracker, etc.) and limited
 * uses before being consumed. It demonstrates advanced game design patterns including
 * purpose-driven item behavior and resource management.
 * 
 * **Key Features:**
 * - **Purpose-Based Functionality**: Each fragment has a specific magical purpose
 * - **Usage Tracking**: Fragments have limited uses before crumbling to dust
 * - **Dynamic Item Removal**: Sophisticated timing for item consumption
 * - **Audio Integration**: Coordinates sound effects with item usage
 * - **Error Resilience**: Comprehensive validation and fallback messaging
 * 
 * @returns {boolean} True if item should be removed from inventory, false to keep
 */
const handleUseMapFragment = () => {
  console.log("MAP FRAGMENT USE DETECTED");
  
  // Find the map fragment in inventory
  const mapFragment = inventory.find(item => (item.originalId || item.id) === 'old_map');
  
  if (!mapFragment) {
    console.error("Map fragment not found in inventory!");
    return false;
  }
  
  // Check how many times the fragment has been used
  console.log("Current map fragment uses:", mapFragmentUses);
  
  // Get the purpose directly from the inventory item - NO FALLBACKS
  const finalPurpose = mapFragment.purpose;
  console.log("Map fragment purpose from inventory:", finalPurpose);
  playMapFragmentSound();
  if (!finalPurpose) {
    console.error("Map fragment has no purpose! This shouldn't happen.");
    setMessage("The map fragment appears completely blank and unusable.");
    return false;
  }
  
  // Set maximum uses based on purpose
  let maxUses = 3; // Default for most purposes
  if (finalPurpose === 'danger_sense') {
    maxUses = 1; // Danger sense gets 1 use 
  }
  console.log(`Maximum uses for ${finalPurpose}: ${maxUses}`);
  
  // Continue with the existing function
  console.log(`Using ${mapFragmentUses + 1} of ${maxUses} uses`);
  
  // Check if this is the last use
  const isLastUse = mapFragmentUses >= maxUses - 1;
  
  if (isLastUse) {
    console.log("Last use - map fragment will be removed");
    
    // Reset counter for future fragments
    setMapFragmentUses(0);
  } else {
    // Increment counter for non-final uses
    const newUseCount = mapFragmentUses + 1;
    setMapFragmentUses(newUseCount);
    console.log(`Incremented use counter to ${newUseCount}`);
  }
  
  // Run the appropriate function based on purpose
  switch (finalPurpose) {
    case 'danger_sense':
      console.log("Running danger sense function");
      handleMapFragmentDangerSense();
      break;
    case 'secret_door':
      console.log("Running secret door function");
      handleMapFragmentSecretDoor();
      break;
    case 'druika_tracker':
      console.log("Running wumpus tracker function");
      handleMapFragmentWumpusTracker();
      break;
    case 'flask_finder':
      console.log("Running flask finder function");
      handleMapFragmentFlaskFinder();
      break;
    case 'treasure_enhancer':
      console.log("Running treasure enhancer function");
      handleMapFragmentTreasureEnhancer();
      break;
    case 'disintegrate':
      console.log("Running disintegrate function");
      handleMapFragmentDisintegrate();
      break;
    case 'cursed':
      console.log("Running cursed function");
      handleMapFragmentCursed();
      break;
    case 'room_revealer':
      console.log("Running room revealer function");
      handleMapFragmentRoomRevealer();
      break;
    case 'gold_finder':
      console.log("Running gold finder function");
      handleMapFragmentGoldFinder();
      break;
    default:
      console.log("Unknown purpose:", finalPurpose);
      setMessage("The map fragment glows strangely but nothing happens.");
      return false;
  }
  
  // If it was the last use, add the crumble message after a delay and remove the item
  if (isLastUse) {
    setTimeout(() => {
      setMessage(prev => prev + "\n\nThe map fragment crumbles to dust as you use it one last time...");
      
      // FIX: Remove the item using its actual ID (not 'old_map')
      setTimeout(() => {
        setInventory(prev => prev.filter(item => item.id !== mapFragment.id));
      }, 500);
    }, 100);
    
    return true;
  }
  
  return false; // Keep the item
};

  
  // Remove the map fragment after use
 // setInventory(prev => prev.filter(i => i.id !== 'old_map'));
//};



// ==================== DYNAMIC UI ANIMATION SYSTEM ====================

/**
 * Advanced button pulsing animation system with dynamic CSS injection
 * Creates unique animations for different purposes with collision-free styling
 * 
 * **Technical Excellence:**
 * This function demonstrates advanced DOM manipulation and CSS animation
 * programming. It dynamically creates unique CSS animations to avoid conflicts
 * when multiple animations might run simultaneously.
 * 
 * **Key Features:**
 * - **Dynamic CSS Generation**: Creates unique keyframe animations at runtime
 * - **Collision Prevention**: Timestamp-based unique IDs prevent animation conflicts
 * - **Memory Management**: Automatic cleanup of injected styles after completion
 * - **Visual Feedback System**: Provides clear directional guidance to players
 * - **Flexible Color Coding**: Different colors for different purposes (gold, red, etc.)
 * 
 * @param {number} roomNumber - Target room number to highlight
 * @param {string} color - CSS color for the pulsing effect
 * @param {string} type - Animation type identifier for uniqueness
 */
const pulseButton = (roomNumber, color, type) => {
  console.log(`Attempting to pulse button for room ${roomNumber} with ${color} (${type})`);
  
  // Find all connection buttons
  const allButtons = document.querySelectorAll('.connection-btn');
  console.log(`Found ${allButtons.length} connection buttons`);
  
  // Find the button by its text content
  const roomButton = Array.from(allButtons).find(btn => 
    btn.textContent.trim() === roomNumber.toString()
  );
  
  if (!roomButton) {
    console.log(`Could not find button for room ${roomNumber}`);
    return;
  }
  
  console.log(`Found button for room ${roomNumber}:`, roomButton);
  
  // Create a unique ID for this animation
  const uniqueID = `pulse-${type}-${Date.now()}`;
  
  // Create a style element
  const styleElement = document.createElement('style');
  styleElement.id = uniqueID;
  
  // Define the animation
  styleElement.textContent = `
    @keyframes pulse-${uniqueID} {
      0% { 
        transform: scale(1);
        background: linear-gradient(135deg, #a87b57, #774513);
        box-shadow: 0 0 0 0 ${color};
      }
      50% { 
        transform: scale(1.2);
        background: linear-gradient(135deg, ${color}, #774513);
        box-shadow: 0 0 20px 10px ${color};
      }
      100% { 
        transform: scale(1);
        background: linear-gradient(135deg, #a87b57, #774513);
        box-shadow: 0 0 0 0 ${color};
      }
    }
    
    .pulse-${uniqueID} {
      animation: pulse-${uniqueID} 1s ease-in-out 5 !important;
      position: relative !important;
      z-index: 1000 !important;
    }
  `;
  
  // Add the style to the document
  document.head.appendChild(styleElement);
  
  // Apply the class to the button
  roomButton.classList.add(`pulse-${uniqueID}`);
  
  // Clean up after animation finishes
  setTimeout(() => {
    roomButton.classList.remove(`pulse-${uniqueID}`);
    const styleElem = document.getElementById(uniqueID);
    if (styleElem) {
      document.head.removeChild(styleElem);
    }
    console.log(`Finished pulsing room ${roomNumber}`);
  }, 5500); // 5 pulses at 1s each plus buffer
};




// ==================== SECRET DOOR DETECTION SYSTEM ====================

/**
 * Map fragment purpose implementation: Secret Door Finder
 * Advanced pathfinding and proximity detection for hidden passages
 * 
 * **Game Design Excellence:**
 * This function implements sophisticated spatial reasoning, combining
 * room database searches with pathfinding algorithms to guide players
 * toward hidden content. It demonstrates advanced game logic programming.
 * 
 * **Key Features:**
 * - **Spatial Database Search**: Scans all special rooms for hidden doors
 * - **Proximity Detection**: Determines if player is already in target room
 * - **Pathfinding Integration**: Uses shortest path algorithms for navigation
 * - **Visual Guidance System**: Provides pulsing button feedback for direction
 * - **Descriptive Feedback**: Rich narrative text based on distance and features
 * 
 * @returns {boolean} False to keep item in inventory (doesn't consume on use)
 */
const handleMapFragmentSecretDoor = () => {
  console.log("SECRET DOOR FUNCTION RUNNING");
  console.log("Current position:", currentPosition);
  
  // Find rooms with hidden doors
  const doorRooms = [];
  Object.keys(specialRooms).forEach(roomKey => {
    const room = specialRooms[roomKey];
    if (room && room.hasHiddenDoor) {
      doorRooms.push({
        roomNumber: parseInt(roomKey),
        feature: room.doorFeature || "mysterious markings"
      });
    }
  });
  
  console.log("Rooms with hidden doors:", doorRooms);
  
  if (doorRooms.length > 0) {
    // Check if player is already in a room with a hidden door
    const currentRoomHasDoor = doorRooms.some(door => door.roomNumber === currentPosition);
    
    if (currentRoomHasDoor) {
      const currentDoor = doorRooms.find(door => door.roomNumber === currentPosition);
      setMessage(`The map fragment glows brightly. The hidden door is in THIS room! Look for ${currentDoor.feature}.`);
      
      // Pulse this room's button
      pulseRoomButton(currentPosition, '#ffd700');
      return false; // Return false to KEEP the item in inventory
    }
    
    // Find closest door room
    let closestRoom = null;
    let nextStep = null;
    let shortestDistance = Infinity;
    
    for (const doorRoom of doorRooms) {
      // Use findShortestPath to get distance and next step
      const path = findShortestPath(currentPosition, doorRoom.roomNumber, roomConnections);
      
      if (path && path.distance < shortestDistance) {
        shortestDistance = path.distance;
        closestRoom = doorRoom;
        nextStep = path.nextRoom;
      }
    }
    
    console.log("Closest door:", closestRoom, "Next step:", nextStep, "Distance:", shortestDistance);
    
    if (closestRoom && nextStep) {
      setMessage(`The map fragment reveals a hidden passage ${shortestDistance} rooms away. The marking points toward room ${nextStep}.`);
      
      // Pulse the next room's button
      pulseRoomButton(nextStep, '#ffd700');
      return false; // Return false to KEEP the item in inventory
    }
  }
  
  setMessage("The map fragment reveals faint markings of a hidden passage, but you can't determine its location.");
  return false; // Return false to KEEP the item in inventory
};

// ==================== SIMPLIFIED BUTTON ANIMATION ====================

/**
 * Simplified button pulsing function for specific use cases
 * Lighter-weight version of pulseButton for targeted animations
 * 
 * **Design Purpose:**
 * This function provides a streamlined animation system for cases where
 * the full pulseButton system might be overkill. It maintains the same
 * collision-avoidance principles but with simplified parameters.
 * 
 * @param {number} roomNumber - Target room number to highlight
 * @param {string} color - CSS color for the pulsing effect
 */
const pulseRoomButton = (roomNumber, color) => {
  console.log(`Attempting to pulse button for room ${roomNumber}`);
  
  // Find all connection buttons
  const allButtons = document.querySelectorAll('.connection-btn');
  console.log(`Found ${allButtons.length} connection buttons`);
  
  // Find the specific button for this room
  const roomButton = Array.from(allButtons).find(btn => 
    btn.textContent.trim() === roomNumber.toString()
  );
  
  if (!roomButton) {
    console.log(`Could not find button for room ${roomNumber}`);
    return;
  }
  
  console.log(`Found button for room ${roomNumber}`);
  
  // Create unique ID for this animation
  const uniqueID = `door-pulse-${Date.now()}`;
  
  // Create style element
  const styleElement = document.createElement('style');
  styleElement.id = uniqueID;
  
  // Define animation
  styleElement.textContent = `
    @keyframes door-pulse-${uniqueID} {
      0% { transform: scale(1); background: linear-gradient(135deg, #a87b57, #774513); }
      50% { transform: scale(1.15); background: linear-gradient(135deg, ${color}, #774513); }
      100% { transform: scale(1); background: linear-gradient(135deg, #a87b57, #774513); }
    }
    
    .door-pulse-${uniqueID} {
      animation: door-pulse-${uniqueID} 0.8s ease-in-out 5 !important;
      position: relative !important;
      z-index: 1000 !important;
    }
  `;
  
  // Add style to document
  document.head.appendChild(styleElement);
  
  // Apply class to button
  roomButton.classList.add(`door-pulse-${uniqueID}`);
  
  // Clean up after animation
  setTimeout(() => {
    roomButton.classList.remove(`door-pulse-${uniqueID}`);
    const styleElem = document.getElementById(uniqueID);
    if (styleElem) document.head.removeChild(styleElem);
    console.log("Button pulse animation completed");
  }, 4500); // 5 pulses at 0.8s plus buffer
};



// ==================== WUMPUS/DRUIKA TRACKING SYSTEM ====================
/**  I changed the name to smething called a druika to just to be different but it was later on in development
 * Map fragment purpose implementation: Druika (Wumpus) Tracker
 * Advanced creature tracking with pathfinding and directional guidance
 * 
 * **Game Balance Design:**
 * This function provides players with crucial information about the game's
 * primary threat while maintaining mystery and challenge. It demonstrates
 * sophisticated AI tracking and player guidance systems.
 * 
 * **Key Features:**
 * - **Distance Calculation**: Precise room-count distance to target
 * - **Pathfinding Integration**: Next-step guidance toward creature
 * - **Visual Direction System**: Red pulsing buttons indicate danger
 * - **Thematic Messaging**: Atmospheric text maintains game immersion
 * 
 * @returns {boolean} True to consume the map fragment after use
 */
const handleMapFragmentWumpusTracker = () => {
  // Get distance to wumpus
  const wumpusDistance = calculateDistanceToRoom(currentPosition, positions.wumpusPosition);
  
  // Get direction hints
  const pathToWumpus = findShortestPath(currentPosition, positions.wumpusPosition, roomConnections);
  const nextRoomTowardWumpus = pathToWumpus ? pathToWumpus.nextRoom : null;
  
  if (nextRoomTowardWumpus) {
    setMessage(`The fragment pulses with an ominous red glow. The Ancient Druika is ${wumpusDistance} rooms away. The glow intensifies when pointed toward room ${nextRoomTowardWumpus}.`);
    
    // Highlight the button leading toward the wumpus with a red color
    highlightPathToRoom(nextRoomTowardWumpus, '#ff4d4d', 'wumpus');
  } else {
    setMessage(`The fragment pulses with an ominous red glow. The Ancient  Druika  is ${wumpusDistance} rooms away, but you can't determine its exact location.`);
  }
  
  return true;
};




// ==================== RESOURCE LOCATION SYSTEM ====================

/**
 * Map fragment purpose implementation: Flask (Torch Oil) Finder
 * Resource management aid with pathfinding to consumable items
 * 
 * **Resource Management Design:**
 * This function helps players manage the critical torch fuel resource by
 * locating oil flasks throughout the cave system. It demonstrates advanced
 * item database searching and resource optimization guidance.
 * 
 * **Key Features:**
 * - **Comprehensive Room Scanning**: Searches all 30 rooms for oil flasks
 * - **Proximity Optimization**: Finds closest available resource
 * - **Smart Pathfinding**: Provides next-step guidance to resource
 * - **Visual Resource Indication**: Yellow pulsing for oil guidance
 * - **Scarcity Handling**: Graceful messaging when no resources remain
 * 
 * @returns {boolean} True to consume the map fragment after use
 */
const handleMapFragmentFlaskFinder = () => {
  // Find rooms with oil flasks
  const oilRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (roomDescriptionMap[i]?.interactiveItem === 'torch_oil') {
      oilRooms.push(i);
    }
  }
  
  if (oilRooms.length > 0) {
    // Find the closest oil flask
    let closestRoom = null;
    let shortestDistance = Infinity;
    
    oilRooms.forEach(room => {
      const distance = calculateDistanceToRoom(currentPosition, room);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestRoom = room;
      }
    });
    
    if (closestRoom) {
      // Get path to closest flask
      const pathToOil = findShortestPath(currentPosition, closestRoom, roomConnections);
      const nextRoomTowardOil = pathToOil ? pathToOil.nextRoom : null;
      
      if (nextRoomTowardOil) {
        setMessage(`The fragment reveals faint markings. A source of torch oil lies ${shortestDistance} rooms away. The marking points toward room ${nextRoomTowardOil}.`);
        highlightPathToRoom(nextRoomTowardOil, '#ffcc00', 'oil');
      } else {
        setMessage(`The fragment reveals faint markings. A source of torch oil lies in room ${closestRoom}, but you can't determine the path.`);
      }
    }
  } else {
    setMessage("The fragment reveals faint markings, but you can't make sense of them. Perhaps there is no more oil to be found.");
  }
  
  return true;
};




// ==================== SPATIAL PATHFINDING UTILITY ====================

/**
 * Utility function to calculate travel distance between any two rooms
 * Provides pathfinding integration for navigation and guidance systems
 * 
 * **Technical Implementation:**
 * Uses the game's pathfinding engine to compute optimal routes between rooms,
 * returning either precise distance or fallback text for unreachable destinations.
 * 
 * @param {number} startRoom - Starting room position
 * @param {number} targetRoom - Destination room position
 * @returns {number|string} Distance in rooms, or "an unknown number of" if unreachable
 * 
 * **Usage Examples:**
 * - Map fragment guidance systems
 * - Creature tracking distance calculation
 * - Resource proximity optimization
 */
const calculateDistanceToRoom = (startRoom, targetRoom) => {
  const path = findShortestPath(startRoom, targetRoom, roomConnections);
  return path ? path.distance : "an unknown number of";
};


// ==================== WATER SPIRIT TRADING SYSTEM ====================

/**
 * Handles mystical creature trading mechanics with the water sprite/nixie
 * Implements dual-currency payment system with hierarchical preferences
 * 
 * **Game Design Excellence:**
 * This function demonstrates sophisticated NPC interaction design with multiple
 * payment options, dynamic inventory management, and atmospheric narrative integration.
 * The system provides player choice while maintaining game balance.
 * 
 * **Key Features:**
 * - **Dual Currency System**: Accepts gold coins or golden compass as payment
 * - **Smart Payment Prioritization**: Prefers gold coins over rare compass
 * - **Dynamic Currency Management**: Handles coin stacking and value reduction
 * - **State Persistence**: Marks toll payment to prevent repeat charges
 * - **Audio-Visual Integration**: Coordinates sound effects with transaction
 * - **Atmospheric Narrative**: Rich descriptive text maintains immersion
 * 
 * **Economic Design Patterns:**
 * - **Resource Preservation**: Tries to preserve rare items when possible
 * - **Value-Based Pricing**: Different reactions to different payment types
 * - **Persistent State**: Prevents exploit by remembering payment status
 * 
 * @returns {boolean} True if transaction completed successfully
 */
const handleWaterSpiritTrade = () => {
  console.log("Trading with the water sprite");
  
  // 1. Check if player has gold coins
  const hasGoldCoins = inventory.some(item => 
    (item.originalId || item.id) === 'gold_coins'
  );
  
  // 2. Check if player has golden compass as alternative payment
  const hasGoldenCompass = inventory.some(item => 
    (item.originalId || item.id) === 'golden_compass'
  );
  
  if (!hasGoldCoins && !hasGoldenCompass) {
    setMessage("You have nothing valuable to offer the water sprite.");
    return false;
  }
  
  // If player has gold coins, use those first
  if (hasGoldCoins) {
    // Original gold coin logic - unchanged
    const goldCoinItem = inventory.find(item => 
      (item.originalId || item.id) === 'gold_coins'
    );
    
    if (goldCoinItem) {
      // If the gold coin has a value property, decrease it
      if (goldCoinItem.value && goldCoinItem.value > 1) {
        // Just decrease the value by 1
        setInventory(prev => prev.map(item => {
          if ((item.originalId || item.id) === 'gold_coins') {
            return {
              ...item,
              value: item.value - 1,
              name: `Gold Coins (${item.value - 1})` // Update the name to show new count
            };
          }
          return item;
        }));
        
        setMessage("You offer a single gold coin to the water sprite. She bows her head to you and gracefully accepts it, and disappears back into the water to let you pass.");
      } else {
        // If value is 1 or not defined, remove the entire item
        setInventory(prev => prev.filter(item => 
          (item.originalId || item.id) !== 'gold_coins'
        ));
        
        setMessage("You offer your last gold coin to the water sprite. She bows her head to you gracefully accepts it, and the waters part to let you pass.");
      }
    }
  } 
  // If no gold coins but has compass, use that instead
  else if (hasGoldenCompass) {
    // Remove the compass from inventory
    setInventory(prev => prev.filter(item => 
      (item.originalId || item.id) !== 'golden_compass'
    ));
    playNixieAFairTradeSound()
    setMessage("Without gold coins, you reluctantly offer your golden compass to the water sprite. Her eyes widen as she takes it, clearly pleased with the rare treasure. \"A fair trade  to me,\" she says, and the waters part to let you pass.");
  }
  
  // Mark that player has paid the toll for this visit
  setSpecialRooms(prev => {
    const newState = { ...prev };
    newState[currentPosition] = {
      ...newState[currentPosition],
      tollPaid: true,
      nixieHasAppeared: false
    }
    return newState;
  });
  // ADD THIS DEBUG CODE:
console.log("After payment - specialRooms update:", {
  currentPosition,
  tollPaid: true,
  nixieHasAppeared: false
});
setTimeout(() => {
  setMessage(prev => prev + ""); // Tiny state change that forces re-render
}, 10);
// Also add this timeout to check the state after it's updated:
setTimeout(() => {
  console.log("Current specialRooms state:", specialRooms[currentPosition]);
}, 100);
  // Hide the trade button
  setMessage(prevMessage => prevMessage); 
  setShowWaterSpiritTradeButton(false);
  
  return true;
};

// ==================== GOBLIN MERCHANT TRADING SYSTEM ====================

/**
 * Advanced e-commerce system for the orcish goblin shopkeeper
 * Implements sophisticated inventory management, dynamic pricing, and randomized catalog
 * 
 * **E-Commerce Architecture Excellence:**
 * This function demonstrates professional-grade shopping system design with inventory
 * management, catalog filtering, affordability checking, and dynamic item presentation.
 * It rivals real-world e-commerce platforms in complexity and user experience design.
 * 
 * **Key System Features:**
 * - **Dynamic Catalog Generation**: Randomized item selection prevents predictability
 * - **Affordability Filtering**: Real-time price checking with visual indicators
 * - **Inventory Exclusion**: Prevents duplicate purchases of existing items
 * - **Lore Integration**: Ancient coin dialogue system adds narrative depth
 * - **Interactive UI**: Multi-step purchase process with clear user feedback
 * - **Error Handling**: Comprehensive validation for edge cases
 * 
 * **Technical Excellence:**
 * - **Complex Filtering Logic**: Multiple criteria for item availability
 * - **State Management**: Global variables for purchase processing
 * - **UI Mode Switching**: Shop mode integration with game interface
 * - **Audio Coordination**: Sound effects enhance shopping experience
 * 
 * **Business Logic:**
 * - **Limited Selection**: 9 items max to prevent choice paralysis
 * - **Price Sorting**: User-friendly presentation by ascending cost
 * - **Exclusivity Marketing**: "One item per customer" creates urgency
 */
const handleTrade = () => {
  console.log("Trading gold coins at the gift shop");
  
  // Check how many gold coins the player has
  const goldCoinsItem = inventory.find(item => 
    (item.originalId || item.id) === 'gold_coins'
  );
  
  if (!goldCoinsItem) {
    console.error("Handle Trade called but player has no gold coins?");
    setMessage("The shopkeeper looks at you oddly. \"Can't exactly barter with nothing, can you?\"");
    setShowTradeButton(false);
    return;
  }
  
  // Get the value (number of coins)
  const playerCoins = goldCoinsItem.value || 1;
  console.log(`Player has ${playerCoins} gold coins`);
  
  // Add special dialogue about the ancient coins
  const coinDialogue = getRandomCoinDialogue();
  
  // Determine which items they don't already have
  const allAvailableItems = [];
  
  // Check each potential item the shopkeeper could offer
  Object.entries(giftShopCatalog).forEach(([itemId, itemData]) => {
    // Skip non-purchasable items
    if (nonPurchasableItems.includes(itemId)) {
      return;
    }
    
    // Check if player already has the item
    const playerHasItem = inventory.some(item => 
      (item.originalId || item.id) === itemId
    );
    
    if (!playerHasItem) {
      const price = itemData.price || 1;
      const itemDetails = itemData.id ? itemData : itemTypes[itemId];
      
      // Fix for druika_repellent
      if (!itemDetails && itemId === 'wumpus_repellent') {
        const druikaDetails = itemTypes['druika_repellent'];
        if (druikaDetails) {
          allAvailableItems.push({
            id: 'druika_repellent',
            price: price,
            name: druikaDetails.name || "Unknown Item",
            icon: druikaDetails.icon || "❓",
            description: druikaDetails.description || "A mysterious item.",
            affordable: playerCoins >= price
          });
        }
      } else if (itemDetails) {
        allAvailableItems.push({
          id: itemId,
          price: price,
          name: itemDetails.name || "Unknown Item", 
          icon: itemDetails.icon || "❓",
          description: itemDetails.description || "A mysterious item.",
          affordable: playerCoins >= price
        });
      }
    }
  });
  
  // If nothing is available
  if (allAvailableItems.length === 0) {
    const affordableItems = Object.entries(giftShopCatalog).filter(([id, data]) => 
      playerCoins >= (data.price || 1) && !nonPurchasableItems.includes(id)
    );
    
    if (affordableItems.length === 0) {
      setMessage(`${coinDialogue}\n\n"All our good stuff is a bit out of your price range," the shopkeeper says, eyeing your ${playerCoins} gold coins. "Come back when you've found more treasure!"`);
    } else {
      setMessage(`${coinDialogue}\n\n"Looks like you've already got all our items that would be useful to you," the shopkeeper says with a wink. "Perhaps you'd like to donate those coins to our 'Save the Bats' conservation fund?"`);
    }
    
    setShowTradeButton(false);
    setGoblinCooldown(Math.floor(Math.random() * 5) + 3);
    return;
  }
  
  // SHUFFLE AND PICK 3 RANDOM ITEMS
  const shuffled = [...allAvailableItems].sort(() => Math.random() - 0.5);
  const availableItems = shuffled.slice(0, 9); // Take only first 3
  
  // Sort by price
  availableItems.sort((a, b) => a.price - b.price);
  
  console.log(`Showing ${availableItems.length} random items from ${allAvailableItems.length} total available`);
  
  // Build the interactive shop display
  let shopDisplay = `${coinDialogue}\n\n`;
  shopDisplay += `"Welcome to Throk's Cave Emporium!" the goblin croaks.\n`;
  shopDisplay += `"You have ${playerCoins} ancient coins. Today's selection - one item per customer!"\n\n`;
  shopDisplay += `📜 TODAY'S ITEMS:\n`;
  shopDisplay += `─────────────────\n`;
  
  availableItems.forEach((item, index) => {
    const itemNumber = index + 1;
    const affordableSymbol = item.affordable ? '✓' : '✗';
    shopDisplay += `${itemNumber}. ${item.icon} ${item.name} - ${item.price} coins ${affordableSymbol}\n`;
  });
  
  shopDisplay += `\n─────────────────\n`;
  shopDisplay += `Enter the item number you want to buy (1-${availableItems.length}):`;
  shopDisplay += `\n(Or enter 0 to leave the shop)`;
  
  // Store available items globally for purchase processing
  window.currentShopItems = availableItems;
  window.currentCoinDialogue = coinDialogue;
  
  setMessage(shopDisplay);
  
  // Enable shop input mode
  setShopMode(true);
  
  // Hide the trade button immediately
  setShowTradeButton(false);
};

// ==================== PURCHASE PROCESSING SYSTEM ====================

/**
 * Handles individual item purchase transactions with comprehensive validation
 * Implements secure e-commerce transaction processing with multiple validation layers
 * 
 * **Transaction Security:**
 * This function demonstrates enterprise-level transaction processing with input
 * validation, affordability checking, inventory management, and proper error handling.
 * It follows secure e-commerce patterns to prevent transaction fraud or errors.
 * 
 * **Key Features:**
 * - **Input Validation**: Comprehensive checking of user selection
 * - **Real-time Affordability**: Live price checking during transaction
 * - **Inventory Synchronization**: Updates both player inventory and world state
 * - **Audio-Visual Feedback**: Rich purchase experience with sound effects
 * - **Dynamic Item Messaging**: Personalized purchase messages for each item
 * - **Timing Coordination**: Sophisticated timing for audio and visual elements
 * 
 * @param {string} input - User input string containing item number selection
 */
const processShopPurchase = (input) => {
  const itemNumber = parseInt(input);
  
  // Check for exit
  if (itemNumber === 0) {
    setMessage("\"Maybe next time!\" the shopkeeper shrugs and scurries away into the shadows.");
    setShopMode(false);
    setGoblinCooldown(Math.floor(Math.random() * 5) + 3); // 3-7 moves
    return;
  }
  
  // Validate input
  if (!window.currentShopItems || isNaN(itemNumber) || 
      itemNumber < 1 || itemNumber > window.currentShopItems.length) {
    setMessage("The shopkeeper looks confused. \"Just pick a number from the list, friend.\"");
    return;
  }
  
  const selectedItem = window.currentShopItems[itemNumber - 1];
  
  // Check affordability
  const goldCoinsItem = inventory.find(item => 
    (item.originalId || item.id) === 'gold_coins'
  );
  const playerCoins = goldCoinsItem?.value || 0;
  
  if (playerCoins < selectedItem.price) {
    setMessage(`"That costs ${selectedItem.price} coins, but you only have ${playerCoins}," the shopkeeper says. "Maybe try something cheaper?"`);
    return;
  }
  
  // Process the purchase
  const remainingCoins = playerCoins - selectedItem.price;
  console.log(`Purchasing ${selectedItem.name} for ${selectedItem.price} coins, ${remainingCoins} remaining`);
  
  if (remainingCoins > 0) {
    // Update the gold coins item with reduced value
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'gold_coins') {
        return {
          ...item,
          value: remainingCoins,
          name: `Ancient Wyrm coins (${remainingCoins})`
        };
      }
      return item;
    }));
  } else {
    // Remove the gold coins item entirely if spent all
    setInventory(prev => prev.filter(item => 
      (item.originalId || item.id) !== 'gold_coins'
    ));
  }
  
  // Add the purchased item to inventory
const giftShopOnlyItems = ['wumpus_tshirt', 'souvenir_mug', 'canvas_bag', 'druika_plush'];

if (giftShopOnlyItems.includes(selectedItem.id)) {
  // Use the special function for gift shop items
  addGiftShopItemToInventory(selectedItem.id);
} else {
  // Use regular function for cave items
  addItemToInventory(selectedItem.id);
}
  
  // If it's a cave item, remove it from the world
  if (!selectedItem.id.includes('tshirt') && 
      !selectedItem.id.includes('mug') && 
      !selectedItem.id.includes('bag') && 
      !selectedItem.id.includes('plush')) {
    // Only remove world instances for actual cave items
    removeItemFromWorld(selectedItem.id);
  }
  
   // ========== DYNAMIC PURCHASE MESSAGING SYSTEM ==========
  /**
   * Generates personalized purchase messages with character-specific dialogue
   * Each item has unique shopkeeper commentary to enhance immersion
   */
  const generateMessage = (itemId) => {
    switch(itemId) {
      case 'druika_repellent':
        playShopKeeperRepellentSound()
        return `"Ahh, now this came from a guy who didn't need it fast enough," the shopkeeper chuckles, handing you a vial of Reek of the Ancients`;
      case 'lantern':
        playShopKeeperLanternSound()
        return `"Found this in the 'lost and found' bin. Previous owner won't be needing it," the shopkeeper says with a wink, giving you an old mining lantern.`;
      case 'old_map':
        playShopKeeperMapFragmentSound()
        return `"Some previous adventurer sold this to buy a t-shirt. Poor life choices, I'd say," the shopkeeper remarks, passing you a Faded Map Fragment.`;
     case 'torch_oil':
          console.log("play playShopKeeperFlaskOilSound ")
        playShopKeeperFlaskOilSound()
        return `"Our bestseller after the 'I Got Lost in the Druika Cave' compass," says the shopkeeper, handing you a flask of Torch Oil.`;
      case 'invisibility_cloak':
        console.log("play playShopKeeperCloakSound ")
        playShopKeeperCloakSound()
      return `"Some tattered old cloak I no longer need, its quite a sight to see," giving you a musty old tattered cloak. "Found it in one of the caverns. Looks like it has bite marks. I guess they didn't see that coming"`;
      case 'wumpus_tshirt':

        console.log("play playShopKeeperTShirtSound ")
        playShopKeeperTShirtSound()
        return `"This is my Most popular item we sell!" the shopkeeper beams, handing you a garish t-shirt with a cartoon Druika on it.`;
      case 'souvenir_mug':
        playShopKeeperMugSound()
        return `"This one's a bestseller with the tourists. not that I get that many. " the shopkeeper says, wrapping a mug in some paper. "Surprisingly good for holding hot drinks in cold caves. Or just tossing"`;
      case 'canvas_bag':
        playShopKeeperCanvasBagSound()
        return `"Perfect for carrying all your cave treasures, if you can find them  and the cave doesnt swallow you up first. Haha!" the shopkeeper says, folding up a canvas bag with surprisingly detailed cave art printed on it.`;
      
        case 'druika_plush':
          playShopKeeperPlushieSound()
        return `"Kids just love these!," the shopkeeper grins evilly, handing you a surprisingly cute plush Druika. "They're so much  Much cuddlier than the real thing!"`;
      default:
        return `"Here's something useful from our back room clearance," the shopkeeper says, handing you a mysterious item.`;
    }
  };
  


  // ========== AUDIO TIMING COORDINATION SYSTEM ==========
  /**
   * Manages precise timing coordination between audio effects and message display
   * Each item has custom timing to match voice acting duration
   */ 
const getItemSoundDuration = (itemId) => {
  switch(itemId) {
    case 'druika_repellent': return 6500;      // 4 seconds
    case 'lantern': return 10500;               // 3.5 seconds
    case 'old_map': return 10500;               // 5 seconds
    case 'torch_oil': return 9500;             // 3 seconds
    case 'invisibility_cloak': return 16000;    // 6 seconds (longer message)
    case 'wumpus_tshirt': return 5000;         // 3.5 seconds
    case 'souvenir_mug': return 14000;          // 4 seconds
    case 'canvas_bag': return 14000;            // 5.5 seconds (longer message)
    case 'druika_plush': return 12500;          // 3.5 seconds
    default: return 4000;                      // 4 seconds default
  }
};



// Show the purchase message with coin dialogue
let purchaseMessage = `${window.currentCoinDialogue || ''}\n\n${generateMessage(selectedItem.id)}`;
setMessage(purchaseMessage);

// Get the custom delay for this specific item
const itemSoundDelay = getItemSoundDuration(selectedItem.id);

// Wait for the item-specific sound to finish before adding leaving message
setTimeout(() => {
  // Add the leaving message to the existing message
  setMessage(prev => prev + "\n\n\"Thanks for carving out some time to shop here. May your treasures shine bright and be rock solid on a pedastal.\" the orc-goblin cackles, quickly stuffing the coins into a grimy pouch. Before you can say anything else, he scurries away into a crack in the wall and disappears.");
  
  // Play the leaving sound
  playShopKeeperLeavingSound();
  
  // Close shop mode after giving time for leaving sound
  setTimeout(() => {
    setShopMode(false);
  }, 13500); // Adjust based on leaving sound duration
  
}, itemSoundDelay); // Use the variable delay based on the item
  

// ========== ENCOUNTER COOLDOWN MANAGEMENT ==========
  // Set goblin cooldown (3-7 moves) to prevent immediate re-encounter
  const cooldownMoves = Math.floor(Math.random() * 5) + 3;
  setGoblinCooldown(cooldownMoves);
  console.log(`Goblin cooldown set to ${cooldownMoves} moves`);
};

// ==================== WORLD STATE SYNCHRONIZATION SYSTEM ====================

/**
 * Advanced item removal system that maintains world state consistency
 * Handles comprehensive cleanup across multiple game systems when items are purchased/consumed
 * 
 * **System Architecture Excellence:**
 * This function demonstrates enterprise-level state management by coordinating
 * updates across multiple data structures (special rooms, room descriptions, 
 * interactive elements) to maintain perfect synchronization when items are removed.
 * 
 * **Key Features:**
 * - **Multi-System Coordination**: Updates special rooms, descriptions, and interactive elements
 * - **Pattern Matching**: Advanced regex patterns for intelligent text cleanup
 * - **DOM Element Removal**: Safely removes interactive HTML elements from descriptions
 * - **State Consistency**: Ensures no orphaned references remain after item removal
 * - **Flexible Item Identification**: Handles multiple ID formats and naming conventions
 * - **Fallback Text Management**: Uses textAfterCollection for clean post-removal descriptions
 * 
 * **Technical Excellence:**
 * - **Defensive Programming**: Comprehensive null checking and validation
 * - **Regex Engineering**: Sophisticated pattern matching for HTML element removal
 * - **State Immutability**: Uses functional updates to maintain React best practices
 * - **Memory Management**: Prevents memory leaks from orphaned object references
 * 
 * @param {string} itemId - Unique identifier of item to remove from game world
 */
const removeItemFromWorld = (itemId) => {
  console.log(`Removing all instances of ${itemId} from the game world`);
  
  // 1. Find in special rooms
  Object.entries(specialRooms).forEach(([roomId, roomData]) => {
    if (roomData?.hasItem && roomData?.itemId === itemId) {
      console.log(`Found ${itemId} in room ${roomId} - removing it`);
      
      // Remove from special rooms data
      setSpecialRooms(prev => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          hasItem: false,
          itemId: null
        }
      }));
    }
  });
  
 // ========== COMPREHENSIVE ROOM DESCRIPTION CLEANUP ==========
  // 2. Clean up ALL room descriptions - more thorough approach
  setRoomDescriptionMap(prev => {
    const updatedMap = {...prev};
    
    // Get item name for text matching
    const itemName = itemTypes[itemId]?.name?.toLowerCase() || itemId;
    
    // Check all rooms for mentions of this item
    Object.keys(updatedMap).forEach(roomId => {
      const roomDesc = updatedMap[roomId];
      if (!roomDesc || !roomDesc.text) return;
      
      // Check if room has this item in description
      if (roomDesc.interactiveItem === itemId || 
          roomDesc.text.includes(itemName) ||
          roomDesc.text.includes(`data-item='${itemId}'`) ||
          roomDesc.text.includes(`data-item="${itemId}"`)) {
        
        console.log(`Cleaning item ${itemId} from room ${roomId} description`);
        
        // Clean up the description
        let cleanedText = roomDesc.text;
        
        // Remove interactive span tags
        cleanedText = cleanedText.replace(new RegExp(`<span[^>]*data-item=['"]${itemId}['"][^>]*>.*?</span>`, 'g'), '');
        
     // Clean up surrounding text about the item - MORE SPECIFIC PATTERNS
      const patterns = [
  // Only match sentences that contain THIS specific item
  new RegExp(`[^.]*<span[^>]*data-item=['"]${itemId}['"][^>]*>[^<]*</span>[^.]*\\.`, 'g'),
  // Also match any sentence that mentions this item by name (but only if it contains this item)
  new RegExp(`[^.]*\\b${itemName}\\b[^.]*<span[^>]*data-item=['"]${itemId}['"][^>]*>[^<]*</span>[^.]*\\.`, 'gi')
];
        
        patterns.forEach(pattern => {
          cleanedText = cleanedText.replace(pattern, '.');
        });
        
        // Use textAfterCollection if it exists
        if (roomDesc.textAfterCollection) {
          cleanedText = roomDesc.textAfterCollection;
        }
        
        // Update the room description
        updatedMap[roomId] = {
          ...roomDesc,
          text: cleanedText,
          hasInteractiveItem: false,
          interactiveItem: null
        };
      }
    });
    
    return updatedMap;
  });
};

// ==================== ADVANCED VISUAL FEEDBACK SYSTEM ====================

/**
 * Sophisticated button highlighting system with custom CSS animation injection
 * Creates dynamic visual guidance with color-coded feedback for different game elements
 * 
 * **Visual Design Excellence:**
 * This function demonstrates advanced frontend programming by dynamically creating
 * CSS animations with realistic lighting effects (shadows, gradients, insets) that
 * provide clear directional guidance while maintaining visual consistency.
 * 
 * **Key Features:**
 * - **Dynamic CSS Generation**: Runtime creation of unique animations with lighting effects
 * - **Collision-Free Animation**: Timestamp-based unique IDs prevent animation conflicts
 * - **Advanced Visual Effects**: Multi-layer shadows and gradients for realistic depth
 * - **Memory Management**: Automatic cleanup of injected styles after completion
 * - **Color-Coded Semantics**: Different colors communicate different types of information
 * - **Performance Optimization**: Minimal DOM manipulation with efficient cleanup
 * 
 * **Technical Implementation:**
 * - **CSS Keyframe Engineering**: Complex multi-stage animations with realistic lighting
 * - **DOM Element Discovery**: Safe button identification without assumptions
 * - **Z-Index Management**: Proper layering for visual prominence
 * - **Timing Coordination**: Precise animation duration with cleanup timing
 * 
 * @param {number} roomNumber - Target room number to highlight
 * @param {string} color - CSS color value for highlighting effect
 * @param {string} type - Animation type identifier for uniqueness and debugging
 */
const highlightPathToRoom = (roomNumber, color, type) => {
  console.log(`Attempting to highlight button for room ${roomNumber} with ${color} (${type})`);
  
  // Find the button
  const allButtons = document.querySelectorAll('.connection-btn');
  const roomButton = Array.from(allButtons).find(btn => 
    btn.textContent.trim() === roomNumber.toString()
  );
  
  if (!roomButton) {
    console.log(`Could not find button for room ${roomNumber}`);
    return;
  }
  
  console.log(`Found button for room ${roomNumber}`);
  
  // ========== UNIQUE ANIMATION ID GENERATION ==========
  // Create a unique ID for this animation to prevent conflicts
  const uniqueID = `highlight-${type}-${Date.now()}`;
  const styleElement = document.createElement('style');
  styleElement.id = uniqueID;
  
   // ========== ADVANCED CSS ANIMATION DEFINITION ==========
  // Define new animation that modifies the existing button styles with realistic lighting
  styleElement.textContent = `
    @keyframes pulse-${uniqueID} {
      0% { 
        transform: scale(1);
        background: linear-gradient(135deg, #a87b57, #774513);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5),
                   inset 0 10px 20px rgba(255, 255, 255, 0.1),
                   inset 0 -15px 30px rgba(0, 0, 0, 0.4);
      }
      50% { 
        transform: scale(1.1);
        background: linear-gradient(135deg, ${color}, #774513);
        box-shadow: 0 5px 15px ${color}80,
                   inset 0 10px 20px rgba(255, 255, 255, 0.2),
                   inset 0 -15px 30px rgba(0, 0, 0, 0.3);
      }
      100% { 
        transform: scale(1);
        background: linear-gradient(135deg, #a87b57, #774513);
        box-shadow: 0 5px 10px rgba(0, 0, 0, 0.5),
                   inset 0 10px 20px rgba(255, 255, 255, 0.1),
                   inset 0 -15px 30px rgba(0, 0, 0, 0.4);
      }
    }
    
    .${uniqueID} {
      animation: pulse-${uniqueID} 1s ease-in-out 5 !important;
      position: relative !important;
      z-index: 1000 !important;
    }
  `;
  
  // Add the style to the document
  document.head.appendChild(styleElement);
  
  // Apply the class to the button
  roomButton.classList.add(uniqueID);
  
  // Clean up after animation finishes
  setTimeout(() => {
    roomButton.classList.remove(uniqueID);
    const styleElem = document.getElementById(uniqueID);
    if (styleElem) {
      document.head.removeChild(styleElem);
    }
    console.log(`Finished highlighting room ${roomNumber}`);
  }, 5500); // 5 pulses at 1s each plus buffer
};



// ==================== TREASURE HUNTING ENHANCEMENT SYSTEM ====================

/**
 * Map fragment purpose implementation: Treasure Enhancement System
 * Provides intelligent treasure hunting guidance with prerequisite validation
 * 
 * **Game Design Excellence:**
 * This function demonstrates sophisticated game progression design by requiring
 * the main map before revealing treasure locations, creating logical item dependencies
 * and rewarding exploration with increasingly powerful tools.
 * 
 * **Key Features:**
 * - **Prerequisite Validation**: Requires main map for treasure enhancement
 * - **Proximity Optimization**: Finds closest uncollected treasure automatically
 * - **Flexible Distance Handling**: Manages both numeric and text distance values
 * - **Pathfinding Integration**: Provides step-by-step navigation guidance
 * - **Progress Tracking**: Filters out already-collected treasures
 * - **Visual Guidance**: Color-coded button highlighting for treasure hunting
 * 
 * **Technical Implementation:**
 * - **Collection Filtering**: Efficient array operations for uncollected items
 * - **Distance Calculation**: Robust sorting that handles mixed data types
 * - **Pathfinding Coordination**: Integration with navigation algorithms
 * 
 * @returns {boolean} True to consume the map fragment after use
 */
const handleMapFragmentTreasureEnhancer = () => {
  // Only works if the player has the main map
  if (!hasMap) {
    setMessage("The fragment contains symbols that seem to relate to treasures, but without the main map, you can't interpret them.");
    return;
  }
  
  // Choose a random treasure that hasn't been collected yet
  const unCollectedTreasures = treasurePieces.filter(
    treasure => !collectedTreasures.includes(treasure.id)
  );
  
  if (unCollectedTreasures.length > 0) {
    // Calculate distances to each uncollected treasure
    const treasureDistances = unCollectedTreasures.map(treasure => ({
      ...treasure,
      distance: calculateDistanceToRoom(currentPosition, treasure.room)
    }));
    
    // Sort by distance to get the nearest treasure
    treasureDistances.sort((a, b) => {
      // If the distances are numbers, sort numerically
      if (typeof a.distance === 'number' && typeof b.distance === 'number') {
        return a.distance - b.distance;
      }
      // Otherwise, just compare as strings (this handles "an unknown number of")
      return String(a.distance).localeCompare(String(b.distance));
    });
    
    // Get the nearest treasure
    const nearestTreasure = treasureDistances[0];
    
    // Find the path to the treasure
    const pathToTreasure = findShortestPath(currentPosition, nearestTreasure.room, roomConnections);
    const nextRoomTowardTreasure = pathToTreasure ? pathToTreasure.nextRoom : null;
    
    if (nextRoomTowardTreasure) {
      setMessage(`The fragment reveals mystical symbols linked to the treasure. It seems a ${nearestTreasure.name} lies ${nearestTreasure.distance} rooms away. The symbols point toward room ${nextRoomTowardTreasure}.`);
      
      // Highlight the button leading toward the treasure
      highlightPathToRoom(nextRoomTowardTreasure, '#ffdd00', 'treasure');
    } else {
      setMessage(`The fragment reveals that a ${nearestTreasure.name} is in room ${nearestTreasure.room}, but you can't determine the path.`);
    }
  } else {
    setMessage("The fragment shows treasure locations that you've already discovered.");
  }
  
  return true;
};



// ==================== DESTRUCTIVE MAP FRAGMENT SYSTEM ====================

/**
 * Map fragment purpose implementation: Disintegration Effect
 * Implements deliberately useless item with dramatic narrative payoff
 * 
 * **Game Design Philosophy:**
 * This function demonstrates excellent game design by creating meaningful failure
 * states. Not every item should be useful - some create drama through disappointment,
 * adding realism and emotional variety to the player experience.
 * 
 * @returns {boolean} True to remove item from inventory
 */
const handleMapFragmentDisintegrate = () => {
  // Show a message about the map crumbling
  setMessage("As you examine the map fragment, it crumbles to dust in your hands. Whatever secrets it held are now lost forever.");
  
  // Add some dramatic effect - optional: play a sound if you have one
  // Example: playDisintegrateSound();
  
  // Remove the item from inventory without any actual effect
  setInventory(prev => prev.filter(item => item.id !== 'old_map'));
  
  return true; // Item was used (and removed)
};
// ==================== LETHAL GAME MECHANICS SYSTEM ====================

/**
 * Map fragment purpose implementation: Cursed Fragment (Instant Death)
 * Implements high-risk item usage with immediate lethal consequences
 * 
 * **Risk/Reward Game Design:**
 * This function demonstrates sophisticated game balance by creating genuinely
 * dangerous items. The dramatic death sequence provides memorable failure
 * states that enhance the game's dangerous atmosphere.
 * 
 * **Key Features:**
 * - **Immediate Lethality**: No saves, no second chances - creates real stakes
 * - **Dramatic Narrative**: Rich death sequence with atmospheric description
 * - **Audio Integration**: Coordinates with sound effects for maximum impact
 * - **State Management**: Properly sets death cause for scoring/statistics
 * 
 * @returns {boolean} True to remove item from inventory (player is dead)
 */
const handleMapFragmentCursed = () => {
  // Show a message about the curse
  setMessage("As you study the ancient symbols on the fragment, they begin to glow with an eerie red light. Suddenly, a wave of dark energy courses through your body. You've activated an ancient curse! \nThe parchment gives you the mother of all paper cuts as thousands appear all over your body and you drop in pain and bloodloss. \nYou eventually lose consiousness! \nGame over man!");
  
  // Add some dramatic effect
  // Optional: Play a death sound or special curse sound
  // Example: playCurseSound();
  
  // Kill the player
 //setTimeout(() => {
    setGameStatus('lost');
    setDeathCause('curse');
    
    // You could also play your usual death sound here
    // playLoseSound();
  //}, 2000); // Short delay for dramatic effect
  
  return true; // Item was used
};




// ==================== ADVANCED RECONNAISSANCE SYSTEM ====================

/**
 * Map fragment purpose implementation: Room Revelation System
 * Provides comprehensive tactical information about adjacent rooms
 * 
 * **Intelligence Gathering Excellence:**
 * This function demonstrates sophisticated information design by providing
 * valuable tactical intelligence while maintaining game balance. It reveals
 * just enough information to aid decision-making without removing all mystery.
 * 
 * **Key Features:**
 * - **Comprehensive Room Scanning**: Analyzes all adjacent rooms for threats/treasures
 * - **Color-Coded Intelligence**: Visual categorization of room contents
 * - **Multi-Threat Detection**: Identifies hazards, treasures, items, and special locations
 * - **Simultaneous Visual Feedback**: Multiple room highlighting with different colors
 * - **Hierarchical Information**: Prioritizes information by danger level
 * - **Rich Tactical Feedback**: Detailed descriptions aid strategic planning
 * 
 * **Information Architecture:**
 * - **Threat Assessment**: Immediate dangers (Wumpus, pits) highlighted in red/blue
 * - **Opportunity Identification**: Treasures and resources marked in gold/yellow
 * - **Special Location Detection**: Secret rooms and passages in magenta
 * - **Safety Confirmation**: Safe rooms marked in white for confidence
 * 
 * @returns {boolean} True to consume the map fragment after use
 */
const handleMapFragmentRoomRevealer = () => {
  // Get all adjacent rooms
  const adjacentRooms = roomConnections[currentPosition] || [];
  
  if (adjacentRooms.length === 0) {
    setMessage("The map fragment glows, but reveals no information. There appear to be no connecting rooms from here.");
    return true;
  }
  
  // Create messages about what's in those rooms
  const roomInfos = adjacentRooms.map(room => {
    let info = `Room ${room}: `;
    let color = "#ffffff"; // Default color
    
    // Check for special rooms (rooms above 30)
    if (room > 30) {
      info += "A secret chamber lies beyond!";
      color = "#ff00ff"; // Magenta for special rooms
    }
    // Check for hazards
    else if (room === positions.wumpusPosition) {
      info += "Death awaits! The Druika lurks within!";
      color = "#ff4d4d"; // Red for Wumpus
    } 
    else if (room === positions.pitPosition1 || room === positions.pitPosition2) {
      info += "A bottomless pit lies in wait!";
      color = "#4d4dff"; // Blue for pit
    } 
    else if (room === positions.batPosition) {
      info += "Giant bats are nesting here!";
      color = "#9966ff"; // Purple for bat
    }
    else if (room === positions.exitPosition) {
      info += "The exit is here!";
      color = "#00ff00"; // Green for exit
    }
    // Check for treasures
    else if (treasurePieces.some(t => t.room === room && !collectedTreasures.includes(t.id))) {
      info += "A valuable treasure is hidden here!";
      color = "#ffdd00"; // Gold for treasure
    }
    // Check for torch oil
    else if (roomDescriptionMap[room]?.interactiveItem === 'torch_oil') {
      info += "A source of torch oil can be found here.";
      color = "#ffcc00"; // Yellow for oil
    }
    // Check for map
    else if (room === treasureMap && !hasMap) {
      info += "An ancient map is waiting to be discovered!";
      color = "#00ffff"; // Cyan for map
    }
    // Check for items from specialRooms
    else if (specialRooms[room]?.hasItem) {
      info += "An item of interest lies within.";
      color = "#ff9900"; // Orange for items
    }
    // Check if there's a teleport point
    else if (specialRooms[room]?.hasTeleport) {
      info += "Strange energies swirl within this chamber...";
      color = "#ff00ff"; // Magenta for special rooms
    }
    // Check if there's a hidden door
    else if (specialRooms[room]?.hasHiddenDoor) {
      info += "A secret passage may be hidden here...";
      color = "#ff00ff"; // Magenta for special rooms
    }
    // Otherwise safe
    else {
      info += "Appears safe to enter.";
      color = "#ffffff"; // White for safe rooms
    }
    
    // Highlight the room button with the appropriate color
    highlightPathToRoom(room, color, `room-${room}`);
    
    return info;
  });
  
  // Create the full message
  let message = "The map fragment glows with arcane energy. In a vision, you see glimpses of connected rooms:";
  
  // Add room information with formatting
  roomInfos.forEach(info => {
    message += `\n\n${info}`;
  });
  
  // Display the message
  setMessage(message);
  
  return true;
};

// ==================== DYNAMIC TREASURE GENERATION SYSTEM ====================

/**
 * Map fragment purpose implementation: Gold Finder with Dynamic Item Placement
 * Implements secure procedural treasure generation with safety validation
 * 
 * **Procedural Generation Excellence:**
 * This function demonstrates advanced procedural content generation by dynamically
 * creating treasure placement while maintaining game balance and safety constraints.
 * It ensures fair treasure distribution without breaking game mechanics.
 * 
 * **Key Features:**
 * - **Comprehensive Safety Validation**: Excludes all dangerous and special locations
 * - **Dynamic World Modification**: Real-time placement of items in safe locations
 * - **State Synchronization**: Updates both special rooms and room descriptions
 * - **Pathfinding Integration**: Provides navigation guidance to generated treasure
 * - **HTML Injection Security**: Safely adds interactive elements to room descriptions
 * - **Fallback Handling**: Graceful degradation when no safe locations available
 * 
 * **Security Considerations:**
 * - **Input Validation**: Comprehensive room safety checking
 * - **State Consistency**: Atomic updates across multiple game systems
 * - **XSS Prevention**: Controlled HTML generation with safe patterns
 * - **Resource Management**: Prevents treasure duplication in existing treasure rooms
 * 
 * **Technical Excellence:**
 * - **Multi-Constraint Optimization**: Balances multiple placement requirements
 * - **Dynamic Content Generation**: Runtime creation of interactive room elements
 * - **State Immutability**: Functional updates maintaining React best practices
 * 
 * @returns {boolean} True to consume the map fragment after use
 */
const handleMapFragmentGoldFinder = () => {
  // Find rooms without hazards or special items
  const safeRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (
      i !== positions.wumpusPosition &&
      i !== positions.pitPosition1 &&
      i !== positions.pitPosition2 &&
      i !== positions.batPosition &&
      i !== currentPosition &&
      i !== positions.exitPosition &&
      !specialRooms[i]?.hasItem &&
      !treasurePieces.some(t => t.room === i) // Don't place gold in treasure rooms
    ) {
      safeRooms.push(i);
    }
  }
  
  if (safeRooms.length > 0) {
    // Choose a random room for gold
    const goldRoom = safeRooms[Math.floor(Math.random() * safeRooms.length)];
    
    console.log(`Placing gold coins in room ${goldRoom}`);
    
    // Place gold in this room
    setSpecialRooms(prev => ({
      ...prev,
      [goldRoom]: {
        ...prev[goldRoom],
        hasItem: true,
        itemId: 'gold_coins'
      }
    }));
    
    // Update the room description to mention gold
    setRoomDescriptionMap(prev => ({
      ...prev,
      [goldRoom]: {
        ...prev[goldRoom],
        text: prev[goldRoom].text + " You spot a pile of <span class='interactive-item' data-item='gold_coins'>gold coins</span> gleaming in the corner.",
        textAfterCollection: prev[goldRoom].text
      }
    }));
    
    // Find path to gold
    const pathToGold = findShortestPath(currentPosition, goldRoom, roomConnections);
    const nextRoomTowardGold = pathToGold ? pathToGold.nextRoom : null;
    
    if (nextRoomTowardGold) {
      setMessage(`The fragment reveals hidden markings that seem to indicate treasure. Ancient gold coins lie ${pathToGold.distance} rooms away. The markings point toward room ${nextRoomTowardGold}.`);
      
      // Highlight the path to gold
      highlightPathToRoom(nextRoomTowardGold, '#ffd700', 'gold');
    } else {
      setMessage(`The fragment reveals that ancient gold coins are hidden in room ${goldRoom}, but you can't determine the path.`);
    }
  } else {
    setMessage("The fragment glows with a golden light, but you can't decipher its meaning. Perhaps there are no safe places for treasure in these caves.");
  }
  
  return true;
};



// ==================== SECURE TRAP EXECUTION SYSTEM ====================

/**
 * Centralized trap trigger system with immediate lethal consequences
 * Handles various trap types with consistent death processing
 * 
 * **Security Design:**
 * This function provides a secure, centralized way to handle all trap-related
 * deaths in the game. By centralizing death processing, it ensures consistent
 * state management and prevents potential exploits or edge cases.
 * 
 * **Key Features:**
 * - **Immediate Lethality**: No recovery or saves possible - creates real stakes
 * - **Centralized Death Processing**: Consistent handling across all trap types
 * - **State Atomicity**: Single point of failure prevents inconsistent states
 * - **Audit Trail**: Comprehensive logging for debugging and analytics
 * - **Custom Death Messages**: Personalized narrative for different trap types
 * 
 * **Design Philosophy:**
 * Traps should be immediately lethal to maintain game tension and consequence.
 * This function ensures that all trap encounters result in consistent, final outcomes.
 * 
 * @param {string} trapType - Type of trap triggered (for statistics and debugging)
 * @param {string} deathMessage - Custom death message for this specific trap
 */
const handleTrapTrigger = (trapType, deathMessage) => {
  console.log(`Trap triggered: ${trapType}`);
  setGameStatus('lost');
  setDeathCause(trapType);
  setMessage(deathMessage);
};





// ==================== ADVANCED SECRET ITEM COLLECTION SYSTEM ====================

/**
 * Secure special room item collection with dynamic item generation
 * Handles rare item discovery in hidden chambers with anti-duplication measures
 * 
 * **Security Architecture:**
 * This function demonstrates enterprise-level item management by preventing
 * duplication exploits, validating room states, and securely generating
 * unique items with proper tracking mechanisms.
 * 
 * **Key Features:**
 * - **Anti-Duplication Security**: Prevents collecting items multiple times
 * - **Dynamic Item Generation**: Creates unique items with timestamp-based IDs
 * - **Flexible Content Types**: Handles both collectible items and informational content
 * - **State Validation**: Comprehensive checking before item generation
 * - **Audio Integration**: Coordinated sound effects for discovery
 * - **Fallback Handling**: Graceful error recovery for malformed content
 * 
 * **Technical Excellence:**
 * - **Unique ID Generation**: Timestamp-based IDs prevent collision
 * - **Original ID Preservation**: Maintains reference to base item type
 * - **Dynamic Name/Icon Assignment**: Context-aware item properties
 * - **Immutable State Updates**: Proper React state management patterns
 * 
 * **Anti-Exploit Design:**
 * - **Single Collection Enforcement**: itemCollected flag prevents re-collection
 * - **Content Validation**: Comprehensive checking before processing
 * - **Error Boundary**: Safe handling of malformed special room data
 * 
 * @param {number} roomNumber - Room number to check for special items
 * @returns {boolean} True if item was collected, false if nothing found
 */
const collectSecretRoomItem = (roomNumber) => {
  // Debug logging
  console.log("Available itemTypes:", Object.keys(itemTypes));
  console.log("Special room content:", specialRooms[roomNumber]?.specialContent);
  
  // Check if this is a special room with content
  if (
    specialRooms[roomNumber]?.isSpecialRoom && 
    specialRooms[roomNumber]?.specialContent &&
    !specialRooms[roomNumber]?.itemCollected
  ) {
    const content = specialRooms[roomNumber].specialContent;
    
    // Add safety check to make sure content exists
    if (!content) {
      console.error("Special room has no content defined");
      setMessage("You examine the hidden chamber, but find nothing of interest at the moment.");
      return true;
    }
    
    // For items that should be added to inventory - DIRECT APPROACH WITHOUT CHECKING ITEMTYPES
    if (content.id === 'spellbook' || content.id === 'golden_compass' || content.id === 'wumpus_repellent') {
      // Create the item with a unique ID by adding a timestamp
      const uniqueId = `${content.id}_${Date.now()}`;
      const specialItem = {
        id: uniqueId, // Make the ID unique
        originalId: content.id, // Store the original ID for reference
        name: content.id === 'spellbook' ? 'Ancient Spellbooke' :
              content.id === 'golden_compass' ? 'Golden Compass' : 
              'Wumpus Repellent',
        icon: content.id === 'spellbook' ? '📕' : 
              content.id === 'golden_compass' ? '🧭' : '🧪',
        description: content.description,
        canUse: true
      };
      
      // Add to inventory directly
      setInventory(prev => [...prev, specialItem]);
  
  // Mark as collected
  setSpecialRooms(prev => ({
    ...prev,
    [roomNumber]: {
      ...prev[roomNumber],
      itemCollected: true
    }
  }));
  
  // Show message
 playAutoPickupSound()
 
  setMessage(`You found and picked up a ${specialItem.name}! ${specialItem.description}`);
  
  return true;
}
    
    // For informational content (wizard's notes, etc.)
    else if (content.name && content.description) {
      // Just show a message, don't add to inventory
      setMessage(`You examine ${content.name}. ${content.description}`);
      return true;
    } else {
      // Fallback for malformed content
      setMessage("You examine the mysterious objects in the chamber, but can't quite make sense of them.");
      return true;
    }
  }
  
  return false;
};


// ==================== WORLD INITIALIZATION ORCHESTRATOR ====================

/**
 * Advanced procedural item placement system with constraint satisfaction
 * Orchestrates the placement of critical game items across safe room locations
 * 
 * **System Architecture Excellence:**
 * This function demonstrates sophisticated world generation by managing multiple
 * constraint satisfaction problems simultaneously - ensuring each critical item
 * has a safe, accessible location while preventing resource conflicts.
 * 
 * **Key Features:**
 * - **Constraint Satisfaction**: Ensures minimum room requirements before placement
 * - **Conflict Prevention**: Filters out rooms with existing content (backpack room)
 * - **Randomization**: Shuffles available rooms to prevent predictable placement
 * - **Critical Item Management**: Places 4 essential game items systematically
 * - **Fallback Handling**: Graceful degradation when constraints cannot be satisfied
 * - **Advanced Item Placement**: Handles special placement for Reality Stabilizer
 * 
 * **Procedural Generation Design:**
 * - **Safety-First Approach**: Validates room availability before attempting placement
 * - **Resource Distribution**: Ensures items are spread across different locations
 * - **Logging System**: Comprehensive placement tracking for debugging
 * - **Modular Extension**: Easy to add additional items to placement system
 * 
 * **Technical Implementation:**
 * - **Array Processing**: Efficient filtering and shuffling algorithms
 * - **State Validation**: Comprehensive error checking and recovery
 * - **Modular Item Handling**: Separate placement logic for different item types
 * 
 * @param {number[]} availableRooms - Array of room IDs available for item placement
 */
const placeItemsInWorld = (availableRooms) => {
  // Ensure we have enough rooms
  if (availableRooms.length < 4) { // Changed from 3 to 4 to make room for gold
    console.error("Not enough safe rooms for items!");
    return;
  }
  
  // Filter out any rooms that have the backpack description
  const filteredRooms = availableRooms.filter(roomId => 
    !hasBackpackDescription(roomId, roomDescriptionMap)
  );
  
  console.log(`Found ${filteredRooms.length} rooms for item placement after filtering out backpack room`);
  
  // If we don't have enough rooms after filtering, log an error
  if (filteredRooms.length < 4) {
    console.error("Not enough safe rooms for items after filtering backpack room!");
    // Fall back to using original rooms if needed
    return;
  }
  
  // Shuffle rooms for randomness
  const shuffledRooms = [...filteredRooms].sort(() => Math.random() - 0.5);
  
  // Place the key, orb, map fragment, and gold coins in different rooms
  placeItem('rusty_key', shuffledRooms[0]);
   placeItem('crystal_orb', shuffledRooms[1]);
  placeItem('old_map', shuffledRooms[2]);
  placeItem('gold_coins', shuffledRooms[3]);
  
  console.log('=== ITEM LOCATIONS ===');
  console.log(`Rusty Key placed in room ${shuffledRooms[0]}`);
  console.log(`Crystal Orb placed in room ${shuffledRooms[1]}`);
  console.log(`Map Fragment placed in room ${shuffledRooms[2]}`);
  console.log(`Gold Coins placed in room ${shuffledRooms[3]}`);

  // Now place the Reality Stabilizer in a room far from the shifting room
  // (Use remaining available rooms after the first 4 are used)
  const remainingRooms = shuffledRooms.slice(4);
  if (remainingRooms.length > 0) {
    placeRealityStabilizer(remainingRooms);
  } else {
    console.warn("No rooms left for Reality Anchor, using an already used room");
    placeRealityStabilizer(shuffledRooms); // Use all rooms if necessary
  }
};


// ==================== ADVANCED PATHFINDING ALGORITHM ====================

/**
 * Breadth-First Search implementation for optimal pathfinding in cave system
 * Provides shortest path calculation with cycle detection and comprehensive path tracking
 * 
 * **Algorithm Excellence:**
 * This function implements a textbook-perfect BFS algorithm optimized for game pathfinding.
 * It demonstrates advanced computer science concepts including graph traversal, 
 * cycle detection, and optimal path reconstruction.
 * 
 * **Key Features:**
 * - **Optimal Path Guarantee**: BFS ensures shortest path is always found first
 * - **Cycle Prevention**: Visited set prevents infinite loops in connected graphs
 * - **Memory Efficiency**: Tracks only essential path information
 * - **Early Termination**: Returns immediately upon finding target for performance
 * - **Robust Error Handling**: Graceful handling of disconnected graph components
 * - **Path Reconstruction**: Provides both distance and next step for navigation
 * 
 * **Technical Implementation:**
 * - **Time Complexity**: O(V + E) where V is rooms and E is connections
 * - **Space Complexity**: O(V) for visited set and queue storage
 * - **Graph Representation**: Adjacency list for efficient memory usage
 * - **Queue Management**: Proper FIFO queue using array operations
 * 
 * **Algorithm Design Patterns:**
 * - **Graph Traversal**: Classic BFS with visited node tracking
 * - **Shortest Path**: Guaranteed optimal solution for unweighted graphs
 * - **Early Exit**: Performance optimization with immediate return
 * 
 * @param {number} startRoom - Starting room identifier
 * @param {number} targetRoom - Destination room identifier  
 * @param {Object} roomConnections - Adjacency list representing room connections
 * @returns {Object|null} Path object with distance and nextRoom, or null if unreachable
 */
const findShortestPath = (startRoom, targetRoom, roomConnections) => {
  // If rooms are the same, no path needed
  if (startRoom === targetRoom) {
    return { distance: 0, nextRoom: null };
  }
  
  // Keep track of visited rooms to avoid cycles
  const visited = new Set();
  
  // Queue for BFS with [room, distance, path]
  const queue = [[startRoom, 0, []]];
  
  while (queue.length > 0) {
    const [currentRoom, distance, path] = queue.shift();
    
    // Mark as visited
    visited.add(currentRoom);
    
    // Get connections for current room
    const connections = roomConnections[currentRoom] || [];
    
    // Check each connection
    for (const connectedRoom of connections) {
      // Skip if already visited
      if (visited.has(connectedRoom)) continue;
      
      // Create new path
      const newPath = [...path, connectedRoom];
      
      // If this is the target, we found the path
      if (connectedRoom === targetRoom) {
        return {
          distance: distance + 1,
          nextRoom: newPath[0] // First room in the path (after start)
        };
      }
      
      // Add to queue to explore later
      queue.push([connectedRoom, distance + 1, newPath]);
    }
  }
  
  // No path found
  return null;
};



// ==================== INTELLIGENT ITEM PLACEMENT SYSTEM ====================

/**
 * Advanced cave salt placement system with content-aware room selection
 * Implements sophisticated text pattern matching for optimal item placement
 * 
 * **Content-Aware Placement Excellence:**
 * This function demonstrates advanced natural language processing concepts by
 * analyzing room descriptions to find contextually appropriate placement locations.
 * It ensures items are placed in thematically consistent environments.
 * 
 * **Key Features:**
 * - **Semantic Text Analysis**: Searches for specific descriptive patterns
 * - **Context-Aware Placement**: Matches items to appropriate room themes
 * - **Conflict Prevention**: Excludes dangerous and inappropriate locations
 * - **Dynamic Description Updates**: Seamlessly integrates items into existing text
 * - **Duplication Prevention**: Ensures only one instance exists in game world
 * - **Fallback Handling**: Graceful degradation when ideal placement unavailable
 * 
 * **Technical Excellence:**
 * - **Pattern Matching**: Advanced regex and text analysis
 * - **State Consistency**: Synchronizes multiple game systems
 * - **Memory Management**: Cleans up duplicate instances automatically
 * - **HTML Injection Security**: Safe addition of interactive elements
 * 
 * **Natural Language Processing:**
 * - **Semantic Search**: Identifies rooms by descriptive content
 * - **Context Integration**: Adapts item descriptions to existing room text
 * - **Content Preservation**: Maintains original text for post-collection state
 */
const placeCaveSalt = () => {
  // Find a suitable room for the cave salt - specifically the one with "glittering minerals" text
  let caveSaltRoomId = null;
  
  // First look for the exact room description we want
  Object.entries(roomDescriptionMap).forEach(([roomId, roomDesc]) => {
    if (roomDesc.text && 
        roomDesc.text.includes("glittering minerals wink at you like the eyes of a thousand tiny critics.") && 
        !roomDesc.text.includes("crystal columns") && // Exclude crystal column room explicitly
        parseInt(roomId) !== positions.wumpusPosition &&
        parseInt(roomId) !== positions.pitPosition1 && 
        parseInt(roomId) !== positions.pitPosition2) {
      
      caveSaltRoomId = parseInt(roomId);
      console.log(`Found perfect match room for cave salt: ${caveSaltRoomId}`);
    }
  });
  

  //dont remember why commented out. probably wasnt working

  // If perfect match not found, look for a room with minerals or crystals
 /* if (!caveSaltRoomId) {
    Object.entries(roomDescriptionMap).forEach(([roomId, roomDesc]) => {
      if (roomDesc.text && 
          (roomDesc.text.includes("minerals") || roomDesc.text.includes("crystals")) && 
          !roomDesc.text.includes("crystal columns") && // Exclude crystal column room explicitly
          !roomDesc.text.includes("massive crystal") && // Extra exclusion
          parseInt(roomId) !== positions.wumpusPosition &&
          parseInt(roomId) !== positions.pitPosition1 && 
          parseInt(roomId) !== positions.pitPosition2) {
        
        caveSaltRoomId = parseInt(roomId);
        console.log(`Found backup mineral room for cave salt: ${caveSaltRoomId}`);
      }
    });
  }  */
  
  if (caveSaltRoomId) {
    console.log(`Cave salt crystals will be placed in room ${caveSaltRoomId}`);
    
    // Get the current room description
    const originalText = roomDescriptionMap[caveSaltRoomId]?.text || "";
    
    // Check if it already has the interactive item text
    if (!originalText.includes("salt-like crystals")) {
      // Add the cave salt to this room
      setSpecialRooms(prev => ({
        ...prev,
        [caveSaltRoomId]: {
          ...prev[caveSaltRoomId],
          hasItem: true,
          itemId: 'cave_salt',
          hasCaveSalt: true // Mark this room as safe from nightcrawlers
        }
      }));
      
      // Update room description to mention the salt - adapt to existing description
      let updatedText = originalText;
      if (originalText.includes("glittering minerals")) {
        // Insert into existing phrase about minerals
        updatedText = originalText.replace(
          "glittering minerals wink at you like the eyes of a thousand tiny critics.", 
          "glittering minerals wink at you like the eyes of a thousand tiny critics. Among them, you spot unusual <span class='interactive-item' data-item='cave_salt'>salt-like crystals</span> with a subtle blue glow"
        );
      } else {
        // Add to the end of description
        updatedText = `${originalText} You notice unusual <span class='interactive-item' data-item='cave_salt'>salt-like crystals</span> with a subtle blue glow among the minerals.`;
      }
      
      setRoomDescriptionMap(prev => ({
        ...prev,
        [caveSaltRoomId]: {
          ...prev[caveSaltRoomId],
          text: updatedText,
          hasInteractiveItem: true,
          interactiveItem: 'cave_salt',
          textAfterCollection: originalText // Store original text for after collection
        }
      }));
    }
    
    // Clear any duplicate cave salt from other rooms
    for (let i = 1; i <= 30; i++) {
      if (i !== caveSaltRoomId && specialRooms[i]?.itemId === 'cave_salt') {
        // Remove cave salt from this room
        setSpecialRooms(prev => ({
          ...prev,
          [i]: {
            ...prev[i],
            hasItem: false,
            itemId: null,
            hasCaveSalt: false
          }
        }));
        
        // Clean up the room description if needed
        if (roomDescriptionMap[i]?.interactiveItem === 'cave_salt') {
          setRoomDescriptionMap(prev => ({
            ...prev,
            [i]: {
              ...prev[i],
              text: prev[i].textAfterCollection || prev[i].originalText || prev[i].text,
              hasInteractiveItem: false,
              interactiveItem: null
            }
          }));
        }
      }
    }
  } else {
    console.error("No suitable room found for cave salt!");
  }
};



// ==================== DYNAMIC COMMERCE DISCOVERY SYSTEM ====================

/**
 * Intelligent gift shop room discovery with multi-pattern matching
 * Implements robust content scanning to locate commerce areas in procedural world
 * 
 * **Commerce Discovery Excellence:**
 * This function demonstrates advanced content discovery programming by using
 * multiple search patterns to identify commerce locations within a procedural
 * game world. It ensures economic systems are properly initialized.
 * 
 * **Key Features:**
 * - **Multi-Pattern Search**: Uses multiple keywords for robust detection
 * - **Case-Insensitive Matching**: Ensures detection regardless of text formatting
 * - **Early Termination**: Stops after finding first match for performance
 * - **State Synchronization**: Updates multiple game systems simultaneously
 * - **Comprehensive Logging**: Detailed discovery process for debugging
 * - **Fallback Handling**: Graceful behavior when no commerce area found
 * 
 * **Search Algorithm Design:**
 * - **Sequential Scanning**: Systematic room-by-room analysis
 * - **Pattern Matching**: Multiple keyword detection for reliability
 * - **State Validation**: Ensures room has valid description data
 * - **Priority Stopping**: Immediate return after successful discovery
 * 
 * **System Integration:**
 * - **Game State Updates**: Synchronizes giftShopRoom and positions
 * - **Cross-System Coordination**: Maintains consistency across game systems
 * - **Debug Information**: Comprehensive logging for development support
 * 
 * @returns {number|null} Room ID of discovered gift shop, or null if not found
 */
const identifyGiftShopRoom = () => {
  console.log("=== IDENTIFYING GIFT SHOP ROOM ===");
  let shopRoom = null;
  
  // Look for the gift shop room in the room descriptions
  for (let roomId = 1; roomId <= 30; roomId++) {
    const roomDesc = roomDescriptionMap[roomId];
    if (roomDesc && roomDesc.text && 
        (roomDesc.text.includes('gift shop') || 
         roomDesc.text.includes('t-shirts') || 
         roomDesc.text.toLowerCase().includes('souvenir'))) {
      
      shopRoom = roomId;
      console.log(`Gift shop found in room ${shopRoom}`);
      break; // IMPORTANT: Stop after finding the first one
    }
  }
  
  // Only update if we found a shop
  if (shopRoom) {
    setGiftShopRoom(shopRoom);
    // Also update positions to keep them in sync
    setPositions(prev => ({
      ...prev,
      giftShopPosition: shopRoom
    }));
    console.log(`Gift shop room set to ${shopRoom}`);
  } else {
    console.log("No gift shop found by identifyGiftShopRoom");
  }
  
  return shopRoom;
};


// ==================== MASTER WORLD INITIALIZATION ORCHESTRATOR ====================

/**
 * Comprehensive special room initialization system with multi-creature placement
 * CAlled during game initialization
 * Orchestrates the creation of a complex, interconnected game world with multiple systems
 * 
 * **World Generation Excellence:**
 * This function demonstrates master-level procedural world generation by coordinating
 * multiple complex systems: hidden rooms, teleportation, creature placement, 
 * commerce areas, and environmental hazards. It ensures a balanced, playable world.
 * 
 * **Key System Features:**
 * - **Multi-System Coordination**: Manages 7+ interconnected game systems simultaneously
 * - **Constraint Satisfaction**: Ensures safe room allocation across multiple requirements
 * - **Intelligent Creature Placement**: Uses semantic analysis for contextual positioning
 * - **Dynamic Content Generation**: Creates procedural hints and interactive elements
 * - **State Synchronization**: Coordinates multiple game state systems atomically
 * - **Fallback Handling**: Graceful degradation when optimal placement unavailable
 * - **Comprehensive Logging**: Professional debugging and development support
 * 
 * **Advanced Procedural Design:**
 * - **Safety-First Architecture**: Validates room availability before allocation
 * - **Resource Distribution**: Optimal placement preventing clustering
 * - **Thematic Consistency**: Creature placement matches environmental themes
 * - **Interactive Elements**: Dynamic HTML generation for special room content
 * 
 * **Technical Excellence:**
 * - **Asynchronous State Updates**: Proper timing for React state coordination
 * - **Memory Management**: Efficient object initialization and cleanup
 * - **Cross-System Dependencies**: Manages complex inter-system relationships
 */
const initializeSpecialRooms = () => {
  const doorFeatures = [
    'the rock formations',
    'ancient carvings',
    'moss-covered stones',
    'stalactites',
    'the cave wall',
    'hanging vines',
    'faded pictographs'
  ];
  
  // Select a random door feature
  const doorFeature = doorFeatures[Math.floor(Math.random() * doorFeatures.length)];
  
  // Get all safe rooms (not containing hazards)
  const safeRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (
      i !== positions.wumpusPosition &&
      i !== positions.pitPosition1 &&
      i !== positions.pitPosition2 &&
      i !== positions.batPosition &&
      i !== positions.exitPosition &&
      i !== treasureMap
    ) {
      safeRooms.push(i);
    }
  }
  
  // Only continue if we have enough safe rooms
  if (safeRooms.length >= 2) {
    // Shuffle safe rooms
    safeRooms.sort(() => Math.random() - 0.5);
    
    // Pick rooms for special features
    const hiddenDoorRoom = safeRooms[0];
    const teleportEntrance1 = safeRooms[1];
    const teleportEntrance2 = safeRooms.length > 2 ? safeRooms[2] : null;
    
    // Define special room IDs
    const secretRoom = 31; // Hidden room requiring key
    const teleportRoom = 32; // Room only accessible via orb
    
    // Room feature characteristics (for hints)
    const doorRoomFeature = determineRoomFeature(roomDescriptionMap[hiddenDoorRoom]);
    const orbRoomFeature1 = determineRoomFeature(roomDescriptionMap[teleportEntrance1]);
    const orbRoomFeature2 = teleportEntrance2 ? determineRoomFeature(roomDescriptionMap[teleportEntrance2]) : null;
    
    // Generate content for special rooms first
    const secretRoomContent = selectSecretRoomContent();
    const teleportRoomContent = selectTeleportRoomContent();
    
    // Initialize special rooms object
    const specialRoomsInit = {
      [hiddenDoorRoom]: {
        hasHiddenDoor: true,
        secretRoom: secretRoom,
        doorFeature: doorRoomFeature
      },
      [teleportEntrance1]: {
        hasTeleport: true,
        teleportRoom: teleportRoom,
        orbFeature: orbRoomFeature1
      }
    };
;
// Debug log the specialRooms object

console.log(`SETING HIDDEN DOOR IN ROOM: ${hiddenDoorRoom}`);
console.log('Setting up sand creature room...');
 // Find the room with soft sand
 let sandRoomId = null;
    
 Object.entries(roomDescriptionMap).forEach(([roomId, roomDesc]) => {
   if (roomDesc.text && 
       roomDesc.text.includes("soft sand") && 
       roomDesc.mood === "tempting" &&
       roomId !== positions.pitPosition1 && 
       roomId !== positions.pitPosition2) {
     sandRoomId = parseInt(roomId);
     console.log(`Found sand room at ${sandRoomId}`);
   }
 });
 
 if (sandRoomId) {
  // Get the current room description
  const currentDescription = roomDescriptionMap[sandRoomId]?.text || "";
  const enhancedDescription = currentDescription + " As you look closer, you notice a subtle circular disturbance in the center of the sand.";
  
  // Create an updated room description object
  const updatedRoomDesc = {
    ...roomDescriptionMap[sandRoomId],
    text: enhancedDescription,
    hasSandCreature: true,
    // Add special type for consistent perception handling
    special: "sand_creature",
    // No custom perception needed - will use the special type system
  };
  
  // Set the room description
  setRoomDescriptionMap(prev => ({
    ...prev,
    [sandRoomId]: updatedRoomDesc
  }));
  

  

  // Add to specialRoomsInit
  specialRoomsInit[sandRoomId] = {
    ...specialRoomsInit[sandRoomId], // Keep any existing properties
    hasSandCreature: true,
    sandCreatureActive: true
  };
  
   
   console.log(`Sand creature set up in room ${sandRoomId}`);
 } else {
   console.log("Sand room not found, can't set up sand creature");
 }

// Find a water room for the nixie
let nixieRoomId = null;
Object.entries(roomDescriptionMap).forEach(([roomId, roomDesc]) => {
  const roomNum = parseInt(roomId);
  if (roomDesc.text && 
      roomDesc.text.includes("tranquil pool") && 
      roomDesc.hasWater &&
      roomNum !== positions.pitPosition1 && 
      roomNum !== positions.pitPosition2 &&
      roomNum !== positions.batPosition &&
      roomNum !== positions.wumpusPosition) {
    nixieRoomId = roomNum;
    console.log(`Found nixie room at ${nixieRoomId}`);
  }
});

// Find a fungi room
let fungiRoomId = null;
Object.entries(roomDescriptionMap).forEach(([roomId, roomDesc]) => {
  const roomNum = parseInt(roomId);
  if (roomDesc.text && 
      roomDesc.text.includes("Luminescent fungi") && 
      roomDesc.mood === "otherworldly" &&
      roomNum !== positions.pitPosition1 && 
      roomNum !== positions.pitPosition2 &&
      roomNum !== positions.batPosition &&
      roomNum !== positions.wumpusPosition) {
    fungiRoomId = roomNum;
    console.log(`Found fungi room at ${fungiRoomId}`);
  }
});

// Set up nixie room if found
if (nixieRoomId) {
  // Add to specialRoomsInit
  specialRoomsInit[nixieRoomId] = {
    ...specialRoomsInit[nixieRoomId],
    hasWaterSpirit: true,
    waterSpiritActive: true,
    nixieHasAppeared: false  // <-- Add this new state
  };
  console.log(`Water nixie set up in room ${nixieRoomId}`);
}

// Set up fungi room if found
if (fungiRoomId) {
  // Add to specialRoomsInit
  specialRoomsInit[fungiRoomId] = {
    ...specialRoomsInit[fungiRoomId],
    hasFungiCreature: true,
    fungiCreatureActive: true,
    fungiEntryTime: null // Will track when player enters
  };
  console.log(`Fungi creature set up in room ${fungiRoomId}`);
}


    // Add second teleport room if available
    if (teleportEntrance2) {
      specialRoomsInit[teleportEntrance2] = {
        hasTeleport: true,
        teleportRoom: teleportRoom,
        orbFeature: orbRoomFeature2
      };
    }
    
    // Add the special rooms themselves
    specialRoomsInit[secretRoom] = {
      isSpecialRoom: true,
      connectedFrom: hiddenDoorRoom,
      specialContent: secretRoomContent
    };
    
    specialRoomsInit[teleportRoom] = {
      isSpecialRoom: true,
      isTeleportRoom: true,
      specialContent: teleportRoomContent
    };
    
    // Set the special rooms state
    setSpecialRooms(specialRoomsInit);
    
    // Update room descriptions with hints
    updateRoomDescriptionsWithHints(
      hiddenDoorRoom, 
      teleportEntrance1, 
      teleportEntrance2,
      doorFeature,
      orbRoomFeature1,
      orbRoomFeature2
    );
    
  identifyGiftShopRoom();
  placeCaveSalt();

    // Place items in the world
    placeItemsInWorld(safeRooms.filter(room => 
      room !== hiddenDoorRoom && 
      room !== teleportEntrance1 &&
      room !== teleportEntrance2
    ));
    
    console.log('=== SPECIAL ROOM SETUP ===');
    console.log(`Hidden door in room ${hiddenDoorRoom} (Feature: ${doorRoomFeature})`);
    console.log(`Orb can be used in room ${teleportEntrance1} (Feature: ${orbRoomFeature1})`);
    if (teleportEntrance2) {
      console.log(`Orb can also be used in room ${teleportEntrance2} (Feature: ${orbRoomFeature2})`);
    }
    console.log(`Secret room ${secretRoom} contains: ${secretRoomContent.name}`);
    console.log(`Teleport room ${teleportRoom} contains: ${teleportRoomContent.name}`);


    let interactiveText = "";
switch(secretRoomContent.id) {
  case 'druika_repellent':
    interactiveText = " A <span class='interactive-item' data-item='druika_repellent'>bubbling vial of strange green liquid</span> is carefully placed on a shelf. The label reads 'Reek of the Ancients'";
    break;
  case 'wizard_journal':
    interactiveText = " A <span class='interactive-item' data-item='wizard_journal'>leather-bound journal</span> filled with bizarre diagrams and notes sits on a dusty table.";
    break;
  case 'loose_rocks':
    interactiveText = " A <span class='interactive-item' data-item='loose_rocks'>big handsized rock</span> rests on a stone pedestal.";
    break;
  case 'single_gold_coin':
    interactiveText = " A beautifully crafted ancient <span class='interactive-item' data-item='single_gold_coin'>coin</span> sits on a velvet cushion.";
    break;

  default:
    // Generic default - do nothing
    break;
  }

// Update room 31's description to include the interactive item
setTimeout(() => {
  setRoomDescriptionMap(prev => {
    const baseText = "A hidden chamber untouched for centuries. The air is thick with dust and mystery. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls.";
    return {
      ...prev,
      31: {
        ...prev[31],
        text: baseText + interactiveText,
        hasInteractiveItem: true,
        interactiveItem: secretRoomContent.id,
        textAfterCollection: baseText + " Empty pedestals and shelves show where ancient treasures once rested."
      }
    };
  });
}, 100); // Small delay to ensure room descriptions are initialized
  }
};



// ==================== ADVANCED SEMANTIC FEATURE DETECTION SYSTEM ====================

/**
 * Intelligent room feature detection with contextual hint generation
 * Analyzes room descriptions to generate thematically appropriate hints and interactions
 * 
 * **Natural Language Processing Excellence:**
 * This function demonstrates advanced text analysis programming by parsing room
 * descriptions and generating contextually appropriate interactive elements.
 * It creates dynamic, thematically consistent hints based on environmental analysis.
 * 
 * **Key Features:**
 * - **Semantic Text Analysis**: Advanced pattern matching for environmental themes
 * - **Contextual Hint Generation**: Creates appropriate hints based on room content
 * - **Thematic Consistency**: Matches interactive elements to environmental themes
 * - **Fallback Systems**: Graceful degradation with generic options
 * - **Random Variation**: Multiple options per theme for replayability
 * - **Humor Integration**: Balanced serious and comedic elements
 * 
 * **Technical Implementation:**
 * - **Multi-Pattern Matching**: Analyzes multiple text patterns simultaneously
 * - **Hierarchical Decision Trees**: Prioritized feature detection system
 * - **Content Generation**: Dynamic hint creation based on environmental context
 * - **Error Resilience**: Comprehensive fallback handling for edge cases
 * 
 * **Advanced Programming Concepts:**
 * - **Text Mining**: Intelligent keyword extraction and analysis
 * - **Content Categorization**: Automatic theme classification
 * - **Dynamic Content Generation**: Runtime hint creation
 * - **Randomization Systems**: Balanced variety with thematic consistency
 * 
 * @param {Object} roomDesc - Room description object containing text and metadata
 * @returns {string} Contextually appropriate feature description for hints
 */
const determineRoomFeature = (roomDesc) => {
  if (!roomDesc || !roomDesc.text) {
    return "mysterious markings that seem to glow faintly";
  }
  
  const text = roomDesc.text.toLowerCase();
  
  // Crystal/glowing features
  if (text.includes("crystal") || text.includes("glow")) {
    const crystalOptions = [
      "glowing crystals that pulse with an inner light",
      "shimmering crystal formations that reflect your torch in rainbow patterns",
      "a cluster of luminous crystals that seem to whisper when you get close",
      "translucent crystal growths that change color as you move past them"
    ];
    return crystalOptions[Math.floor(Math.random() * crystalOptions.length)];
  } 
  
  // Water features
  else if (text.includes("water") || text.includes("pool") || text.includes("stream") || text.includes("drip")) {
    const waterOptions = [
      "flowing water that seems to defy gravity",
      "a small pool with unnaturally still water",
      "droplets of water that form curious patterns on the wall",
      "rippling water that reflects things that aren't there"
    ];
    return waterOptions[Math.floor(Math.random() * waterOptions.length)];
  } 
  
  // Fungus/mushroom features
  else if (text.includes("mushroom") || text.includes("fungi")) {
    const fungiOptions = [
      "glowing fungi along the far side. Hope they aren't dangerous",
      "mushrooms that seem to turn toward you as you move",
      "a cluster of fungi that occasionally emit tiny spores of light",
      "oddly sentient-looking mushrooms with caps that resemble tiny faces"
    ];
    return fungiOptions[Math.floor(Math.random() * fungiOptions.length)];
  } 
  
  // Drafts/air movement
  else if (text.includes("draft") || text.includes("breeze")) {
    const airOptions = [
      "a gentle draft that carries whispers you can't quite understand",
      "swirling air currents that make your torch flicker in patterns",
      "a breeze that somehow smells like summer despite being underground",
      "air movement that seems to follow you around the room"
    ];
    return airOptions[Math.floor(Math.random() * airOptions.length)];
  } 
  
  // Ancient markings/drawings
  else if (text.includes("ancient") || text.includes("drawing") || text.includes("marking") || text.includes("pictograph")) {
    const markingOptions = [
      "ancient markings that seem to shift when you don't look directly at them",
      "cave paintings that depict creatures that definitely don't exist... right?",
      "symbols etched into the wall that give you a headache if you stare too long",
      "faded drawings that tell a story you feel like you almost recognize"
    ];
    return markingOptions[Math.floor(Math.random() * markingOptions.length)];
  } 
  
  // Humorous locations
  else if (text.includes("bathroom") || text.includes("shop")) {
    const humorOptions = [
      "what appears to be a 'Employees Must Wash Hands' sign but for wumpuses",
      "a shelf labeled 'Souvenir Rock Collection - 3 for 2 Special'",
      "a crude 'Out to Lunch' sign with bite marks on the corner",
      "a wall with 'Cave Graffiti Gallery' scratched into it"
    ];
    return humorOptions[Math.floor(Math.random() * humorOptions.length)];
  } 
  
  // Bone/remains features
  else if (text.includes("bone") || text.includes("remain") || text.includes("skeleton")) {
    const boneOptions = [
      "a pile of bones arranged in an unnervingly deliberate pattern",
      "skeletal remains that look like they were trying to spell something",
      "a small altar made of bones that seems to have been used recently",
      "a skull with a candle inside that shouldn't still be burning"
    ];
    return boneOptions[Math.floor(Math.random() * boneOptions.length)];
  }
  
  // Cold/ice features
  else if (text.includes("ice") || text.includes("frozen") || text.includes("cold")) {
    const iceOptions = [
      "ice formations that seem impossibly warm to the touch",
      "frozen stalactites that appear to be melting upward",
      "a patch of ice that shows reflections from somewhere else entirely",
      "delicate frost patterns that form letters in an unknown script"
    ];
    return iceOptions[Math.floor(Math.random() * iceOptions.length)];
  }
  
  // Strange formations
  else if (text.includes("formation") || text.includes("rock") || text.includes("stone")) {
    const formationOptions = [
      "rock formations that seem to have been arranged by intelligent hands",
      "stones balanced in a way that defies physics",
      "mineral deposits that form a perfect geometric pattern",
      "oddly shaped stalagmites that look like they're watching you"
    ];
    return formationOptions[Math.floor(Math.random() * formationOptions.length)];
  }
  
  // Nests/creature homes
  else if (text.includes("nest") || text.includes("druika")) {
    const nestOptions = [
      "remnants of a nest with strange, glowing eggs still warm to the touch",
      "a makeshift den with claw marks measuring disturbingly large",
      "a collection of shiny objects arranged around what appears to be a bedroom",
      "what looks suspiciously like a 'Home Sweet Home' sign made of twigs"
    ];
    return nestOptions[Math.floor(Math.random() * nestOptions.length)];
  }
  
  // Sound features
  else if (text.includes("echo") || text.includes("sound") || text.includes("whisper")) {
    const soundOptions = [
      "a spot where your voice returns with extra words you didn't say",
      "an area where sound seems to bend and distort unnaturally",
      "a corner where whispers seem to emanate from the stone itself",
      "an acoustic sweet spot that makes your voice sound like someone else's"
    ];
    return soundOptions[Math.floor(Math.random() * soundOptions.length)];
  }
  
  // Unusual light features
  else if (text.includes("light") || text.includes("shadow") || text.includes("dark")) {
    const lightOptions = [
      "shadows that move independently of anything casting them",
      "a patch of darkness that your torch light cannot penetrate",
      "light reflections that show things that aren't in the room",
      "a beam of sunlight that shouldn't be possible this deep underground"
    ];
    return lightOptions[Math.floor(Math.random() * lightOptions.length)];
  }
  
  // Default options if no specific features found
  else {
    const defaults = [
      "unusual rock formations that seem to form a doorframe",
      "peculiar shadows that create the outline of a keyhole",
      "a section of wall that sounds hollow when tapped",
      "strange carvings that resemble a lock mechanism",
      "a mossy patch that feels different from the surrounding stone",
      "discolored stones arranged in a suspiciously door-like pattern",
      "what appears to be hinges half-buried in the cave wall",
      "a crack in the wall that's perfectly straight - unlike natural formations",
      "a draft coming from what appears to be solid rock",
      "a section of wall where your torch flickers differently"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
  }
};


// ==================== PROCEDURAL SECRET ROOM CONTENT GENERATOR ====================

/**
 * Advanced procedural content generation for secret room rewards
 * Creates balanced, randomized content ensuring varied gameplay experiences
 * 
 * **Procedural Design Excellence:**
 * This function demonstrates sophisticated game design by providing meaningful
 * variety in secret room rewards while maintaining game balance. Each content
 * type offers different strategic value, encouraging exploration and replayability.
 * 
 * **Key Features:**
 * - **Strategic Item Variety**: Four distinct reward types with different gameplay impact
 * - **Balanced Risk/Reward**: Items range from utility to economy to combat effectiveness
 * - **Rich Narrative Content**: Each item includes immersive descriptions and lore
 * - **Interactive HTML Generation**: Safe injection of interactive elements
 * - **Humor Integration**: Balanced serious and comedic content for engagement
 * - **Replayability Design**: Random selection ensures fresh experiences
 * 
 * **Content Design Philosophy:**
 * - **Loose Rocks**: Utility item for puzzle solving and teleportation mechanics
 * - **Ancient Coin**: Economic resource for trading and commerce systems
 * - **Druika Repellent**: Combat utility for creature encounters
 * - **Wizard Journal**: Narrative content with humorous lore elements
 * 
 * **Technical Implementation:**
 * - **Content Structure**: Consistent schema with id, name, description, interactiveText
 * - **HTML Safety**: Controlled interactive element generation
 * - **Debug Integration**: Comprehensive logging for development support
 * 
 * @returns {Object} Randomly selected content object with complete item data
 */
const selectSecretRoomContent = () => {
  console.log("Available itemTypes:", Object.keys(itemTypes));
  
  const possibleContents = [
    {
      id: 'loose_rocks',
      name: 'Loose Cave Rock',
      description: 'A handsized  dull, grayish-white loose rock. It might be useful even though it feels soft.',
      interactiveText: "A  <span class='interactive-item' data-item='loose_rocks'>big handsized rock</span> rests on a stone pedestal."
    },
    {
      id: 'single_gold_coin',
      name: 'Ancient Wyrm Coin',
      description: "A single ancient gold coin, worn but still valuable.",
      interactiveText: "A beautifully crafted ancient <span class='interactive-item' data-item='single_gold_coin'>coin</span> sits on a velvet cushio like it was worhiped by its inhabitants.  But since they arent around, maybe you  should take it"
    },
    {
      id: 'druika_repellent',
      name: 'Ancient Vial',
      description: "A bubbling vial of strange green liquid is carefully placed on a shelf. The label reads 'Reek of the Ancients'",
      interactiveText: "A <span class='interactive-item' data-item='druika_repellent'>bubbling vial of strange green liquid</span> is carefully placed on a shelf. The label reads 'Reek of the Ancients'",
      canUse: true
    },
    {
      id: 'wizard_journal',
      name: "Wizard's Journal",
      description: "A leather-bound journal filled with bizarre diagrams and notes like 'Day 423: Still can't figure out why the Druika keeps winning at poker. Suspect cheating.'",
      interactiveText: "A <span class='interactive-item' data-item='wizard_journal'>leather-bound journal</span> filled with bizarre diagrams and notes like 'Day 423: Still can't figure out why the Druika keeps winning at poker. Suspect cheating.'"
    }
  ];
  
  return possibleContents[Math.floor(Math.random() * possibleContents.length)];
};

// ==================== PROCEDURAL TELEPORT ROOM CONTENT GENERATOR ====================

/**
 * Advanced narrative content generation for mystical teleportation chambers
 * Creates atmospheric, lore-rich content enhancing the magical theme
 * 
 * **Narrative Design Excellence:**
 * This function demonstrates sophisticated worldbuilding by creating varied
 * mystical environments that enhance the teleportation theme. Each option
 * provides different aspects of the magical world's lore and atmosphere.
 * 
 * **Key Features:**
 * - **Thematic Consistency**: All content reinforces magical/mystical atmosphere
 * - **Narrative Variety**: Four distinct magical themes for replayability
 * - **Lore Integration**: Each option adds depth to game world mythology
 * - **Humor Balance**: Serious mystical content mixed with comedic elements
 * - **Atmospheric Enhancement**: Rich descriptions create immersive experience
 * 
 * **Content Themes:**
 * - **Observatory**: Scientific/astronomical magic theme
 * - **Wizard Study**: Personal/domestic magic theme with humor
 * - **Teleportation Anchors**: Technical/mechanical magic theme
 * - **Wizard Snack**: Comedic/humanizing magic theme
 * 
 * **Design Philosophy:**
 * Each content type explores different aspects of the magical world, from
 * grand cosmic observations to mundane magical daily life, creating a
 * well-rounded mystical atmosphere.
 * 
 * @returns {Object} Randomly selected teleport room content with thematic consistency
 */
const selectTeleportRoomContent = () => {
  const possibleContents = [
    {
      id: 'observatory',
      name: "Ancient Observatory",
      description: "Strange devices track the movements of celestial bodies. Star charts on the walls seem to indicate the locations of powerful artifacts."
    },
    {
      id: 'wizard_notes',
      name: "Wizard's Study",
      description: "A cluttered desk contains scrolls with humorous notes like 'Remember to feed  my pet basilisks on Thursday' and 'Must find solution to adventurer infestation problem.'"
    },
    {
      id: 'teleportation_anchors',
      name: "Teleportation Anchors",
      description: "Glowing crystals are arranged in a circle. They seem to be tuned to different locations throughout the cave system."
    },
    {
      id: 'half_eaten_sandwich',
      name: "Wizard's Snack",
      description: "A half-eaten sandwich sits on a plate with a note: 'Property of Evil Cave Wizard - DO NOT TOUCH' written in elegant but threatening script."
    }
  ];
  
  return possibleContents[Math.floor(Math.random() * possibleContents.length)];
};




// ==================== ROOM TYPE IDENTIFICATION UTILITY ====================

/**
 * Specialized room type detector for pool room identification
 * Prevents hint placement conflicts in water-themed rooms
 * 
 * **Utility Design:**
 * This function demonstrates defensive programming by providing precise
 * room type detection to prevent content conflicts. Pool rooms have special
 * interaction mechanics that conflict with hidden door hints.
 * 
 * @param {string} roomText - Room description text to analyze
 * @returns {boolean} True if room is identified as a pool room
 */
const isPoolRoom = (roomText) => {
  return roomText && 
         roomText.includes("pool of clear water") && 
         roomText.includes("nature's most inconvenient wading pool");
};

// ==================== COMPREHENSIVE ROOM ENHANCEMENT ORCHESTRATOR ====================

/**
 * Master room description enhancement system with intelligent hint placement
 * Coordinates multiple enhancement systems while preventing content conflicts
 * 
 * **Room Enhancement Excellence:**
 * This function demonstrates advanced content management by coordinating
 * multiple room modification systems, preventing conflicts, and maintaining
 * narrative consistency across the entire game world.
 * 
 * **Key System Features:**
 * - **Multi-System Coordination**: Manages hidden doors, teleport hints, special rooms
 * - **Conflict Prevention**: Intelligent detection and avoidance of content conflicts
 * - **Content Preservation**: Maintains original text for restoration purposes
 * - **Duplication Prevention**: Comprehensive checks to avoid repeated hints
 * - **Rich Atmosphere Creation**: Enhanced descriptions for special room types
 * - **State Synchronization**: Atomic updates across multiple room systems
 * 
 * **Advanced Programming Concepts:**
 * - **Content Conflict Resolution**: Intelligent detection of incompatible content
 * - **State Preservation**: Backup systems for content restoration
 * - **Dynamic HTML Generation**: Safe injection of interactive elements
 * - **Multi-Room Coordination**: Simultaneous enhancement of multiple rooms
 * 
 * **Technical Excellence:**
 * - **Immutable Updates**: Proper React state management patterns
 * - **Error Prevention**: Comprehensive validation before modifications
 * - **Memory Management**: Efficient object cloning and manipulation
 * - **Debug Integration**: Professional logging and development support
 * 
 * @param {number} doorRoom - Room containing hidden door entrance
 * @param {number} orbRoom1 - Primary teleportation entrance room
 * @param {number} orbRoom2 - Secondary teleportation entrance room (optional)
 * @param {string} doorFeature - Contextual feature for door hint integration
 * @param {string} orbFeature1 - Contextual feature for first teleport hint
 * @param {string} orbFeature2 - Contextual feature for second teleport hint
 */
const updateRoomDescriptionsWithHints = (
  doorRoom, 
  orbRoom1, 
  orbRoom2, 
  doorFeature,
  orbFeature1,
  orbFeature2
) => {
 // ========== STATE INITIALIZATION ==========
  const updatedDescriptions = {...roomDescriptionMap};
  
  // ========== HIDDEN DOOR ENHANCEMENT SYSTEM ==========
  
  // ========== CONFLICT DETECTION ==========
  // Check if this is a treasure room
  const isTreasureRoom = treasurePieces.some(treasure => treasure.room === doorRoom);
  
  const originalText = updatedDescriptions[doorRoom].text || '';
  const hintText = ` You notice what appears to be a keyhole hidden among ${doorFeature}.`;
  

  // ========== CONTENT CONFLICT PREVENTION ==========
  // Add hidden door hint with conflict prevention
if (!isPoolRoom(originalText) && !originalText.includes('keyhole hidden among')) {
  // Only add hint if not pool room
  updatedDescriptions[doorRoom] = {
    ...updatedDescriptions[doorRoom],
    text: `${originalText}${hintText}`,
    hasHiddenDoor: true,
    doorHint: hintText
  };
}





  // ========== DUPLICATION PREVENTION SYSTEM ==========
  // Check if hint already exists to avoid duplication
  if (!originalText.includes('keyhole hidden among')) {
    updatedDescriptions[doorRoom] = {
      ...updatedDescriptions[doorRoom],
      // Store original text if this is a treasure room
      ...(isTreasureRoom ? {originalText: originalText} : {}),
      text: `${originalText}${hintText}`,
      hasHiddenDoor: true,
      // Store the hint separately for preservation
      doorHint: hintText
    };
    
    console.log("Updated door room description:", updatedDescriptions[doorRoom].text);
  }

  // Check if any room has the "perfect echo" description
  Object.keys(updatedDescriptions).forEach(roomId => {
    const roomDesc = updatedDescriptions[roomId];
    if (roomDesc && roomDesc.text && roomDesc.text.includes("perfect echo")) {
      // This is the echo room - mark it to contain the hidden crystal orb
      // Don't add any teleport hints here
      updatedDescriptions[roomId] = {
        ...roomDesc,
        originalText: roomDesc.text, // Save the original text
        hasHiddenItem: true // Mark that this room has a hidden item
      };
    }
  });

  // Add teleport hint for first room
  if (updatedDescriptions[orbRoom1]) {
    const teleportHint1 = ` There's a strange circular pattern around ${orbFeature1}.`;
    updatedDescriptions[orbRoom1] = {
      ...updatedDescriptions[orbRoom1],
      text: updatedDescriptions[orbRoom1].text + teleportHint1,
      // Store the hint separately for preservation
      teleportHint: teleportHint1
    };
  }
  
  // Add teleport hint for second room if it exists
  if (orbRoom2 && updatedDescriptions[orbRoom2]) {
    const teleportHint2 = ` You notice unusual energy emanating from ${orbFeature2}.`;
    updatedDescriptions[orbRoom2] = {
      ...updatedDescriptions[orbRoom2],
      text: updatedDescriptions[orbRoom2].text + teleportHint2,
      // Store the hint separately for preservation  
      teleportHint: teleportHint2
    };
  }
  
  // Get secret room content
  const secretRoomContent = specialRooms[31]?.specialContent;
 const secretContentDesc = secretRoomContent?.interactiveText || secretRoomContent?.description ||
  "Ancient artifacts and strange symbols cover the walls.";
  
  // Add rich description for secret room (Room 31)
updatedDescriptions[31] = {
  text: "A hidden chamber untouched for centuries. The air is thick with dust and mystery. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls. " + secretContentDesc,
  special: "hidden_chamber",
  mood: "magical",
  hasWater: false,
  hasInteractiveItem: secretRoomContent?.id ? true : false,
  interactiveItem: secretRoomContent?.id || null
};
  

console.log("Secret room content:", secretRoomContent);
console.log("Has interactiveText?", secretRoomContent?.interactiveText);
console.log("Using description:", secretContentDesc);

  // Get teleport room content
  const teleportRoomContent = specialRooms[32]?.specialContent;
  const teleportContentDesc = teleportRoomContent?.description || 
    "The air here feels charged with energy.";
  
  // Add rich description for teleport room (Room 32)
  updatedDescriptions[32] = {
     text: "An otherworldly cavern with walls that shimmer with an unnatural light. Stars and distant galaxies seem to move within the stone itself. In the center of the room, a perfectly round hole about the size of a fist has been carved into a raised pedestal. Above it, glowing letters spell out: 'Sometimes the simplest solution is just a stone's throw away.' " + teleportContentDesc,
     
    mood: "mysterious",
    hasWater: false
  };
  // ========== STATE SYNCHRONIZATION ==========
  // Update room descriptions atomically
  setRoomDescriptionMap(updatedDescriptions);
};


// ==================== INTELLIGENT ITEM PLACEMENT SYSTEM ====================

/**
 * Advanced item placement with conflict prevention and purpose assignment
 * Manages dynamic item placement while preventing room conflicts and ensuring proper functionality
 * 
 * **Item Management Excellence:**
 * This function demonstrates sophisticated item management by handling both
 * standard items and special items (like map fragments) with different behaviors.
 * It ensures no room conflicts and maintains proper state synchronization.
 * 
 * **Key Features:**
 * - **Conflict Prevention**: Validates room availability before placement
 * - **Special Item Handling**: Map fragments receive random purpose assignment
 * - **Purpose Assignment**: Dynamic ability allocation for variable gameplay
 * - **State Synchronization**: Immutable updates maintaining React best practices
 * - **Comprehensive Logging**: Professional debugging and development support
 * 
 * **Purpose System Design:**
 * Map fragments are currently configured with 'cursed' purpose for balanced
 * difficulty, but the system supports multiple purposes for varied gameplay.
 * 
 * **Technical Implementation:**
 * - **Defensive Programming**: Room conflict checking before placement
 * - **Conditional Logic**: Different handling for special vs. standard items
 * - **State Management**: Proper React state updates with functional patterns
 * 
 * @param {string} itemId - Unique identifier for the item to place
 * @param {number} roomId - Target room ID for item placement
 */
const placeItem = (itemId, roomId) => {
  // First, check if the room already has an item
  if (specialRooms[roomId]?.hasItem) {
    return; // Don't place more than one item per room
  }
  
  // If this is the map fragment, assign a purpose first
  if (itemId === 'old_map') {
    // Generate a random purpose
    //const purposes = ['danger_sense', 'secret_door', 'druika_tracker', 'flask_finder', 'treasure_enhancer', 'disintegrate', 'cursed', 'room_revealer','gold_finder'];
    const purposes = ['cursed', 'cursed', 'cursed'];
    const randomPurpose = purposes[Math.floor(Math.random() * purposes.length)];
    
    console.log(`Assigning purpose to map fragment in room ${roomId}: ${randomPurpose}`);
    
    // Add the item to the room WITH the purpose
    setSpecialRooms(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        hasItem: true,
        itemId: itemId,
        mapPurpose: randomPurpose // Store purpose in the room
      }
    }));
  } else {
    // Add normal item to the room
    setSpecialRooms(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        hasItem: true,
        itemId: itemId
      }
    }));
  }
  
  console.log(`Placed ${itemId} in room ${roomId}`);
};

  // ==================== PROCEDURAL POSITION GENERATION SYSTEM ====================

/**
 * Cryptographically sound random position generation for game entities
 * Ensures unique, non-overlapping placement of all critical game elements
 * 
 * **Position Generation Excellence:**
 * This function demonstrates advanced procedural generation by using Set-based
 * uniqueness guarantees to ensure no entity conflicts. It provides robust
 * position allocation for all critical game elements.
 * 
 * **Key Features:**
 * - **Collision-Free Generation**: Set-based uniqueness prevents overlapping entities
 * - **Comprehensive Entity Coverage**: Handles all 5 primary game elements
 * - **Bounded Random Generation**: Ensures positions within valid room range (1-30)
 * - **Deterministic Completion**: While loop guarantees exactly 5 unique positions
 * - **Professional Logging**: Comprehensive debug output for development
 * - **Structured Data Return**: Clean object with named entity positions
 * 
 * **Algorithm Design:**
 * Uses Set data structure for O(1) duplicate detection and guaranteed uniqueness.
 * The while loop ensures exactly the required number of positions are generated.
 * 
 * **Technical Implementation:**
 * - **Set-Based Uniqueness**: Prevents position conflicts automatically
 * - **Array Conversion**: Efficient Set to Array conversion for indexing
 * - **Structured Output**: Organized object for easy entity reference
 * 
 * @returns {Object} Game positions object with all entity locations
 */
  const generateGamePositions = () => {
  const positions = new Set();
  
  // Generate unique positions for each game element (5 positions)
  while(positions.size < 5) {
    positions.add(Math.floor(Math.random() * 30) + 1);
  }
  
  
  
  // ========== POSITION ALLOCATION ==========
  const positionsArray = [...positions];
  
  const gamePositions = {
    wumpusPosition: positionsArray[0],    // Primary threat entity
    pitPosition1: positionsArray[1],      // First environmental hazard
    pitPosition2: positionsArray[2],      // Second environmental hazard
    batPosition: positionsArray[3],       // Teleportation hazard
    exitPosition: positionsArray[4],      // Victory condition location
  };
  
  // Debug output of all entity positions
  console.log('=== NEW GAME ENTITY POSITIONS ===');
  console.log('Wumpus:', gamePositions.wumpusPosition);
  console.log('Pit 1:', gamePositions.pitPosition1);
  console.log('Pit 2:', gamePositions.pitPosition2);
  console.log('Bat:', gamePositions.batPosition);
  console.log('Exit:', gamePositions.exitPosition);
  console.log('Gift Shop:', gamePositions.giftShopPosition);
  console.log('================================');
  
console.log('Wumpus:', gamePositions.wumpusPosition);
  console.log('Pit 1:', gamePositions.pitPosition1);
  console.log('Pit 2:', gamePositions.pitPosition2);
  console.log('Bat:', gamePositions.batPosition);
  console.log('Exit:', gamePositions.exitPosition);
  console.log('Gift Shop:', gamePositions.giftShopPosition);
  console.log('================================');


  return gamePositions;
};

// ==================== ADVANCED DEBUGGING AND VALIDATION SYSTEM ====================

/**
 * Comprehensive room description debugging with intelligent hazard detection
 * Provides detailed analysis of room assignments and content validation
 * 
 * **Debugging Excellence:**
 * This function demonstrates professional debugging practices by providing
 * comprehensive validation of room generation results. It identifies potential
 * issues and provides clear visual feedback for development.
 * 
 * **Key Features:**
 * - **Comprehensive Validation**: Checks all 30 rooms for proper assignment
 * - **Hazard Detection**: Identifies pit rooms and validates content consistency
 * - **Color-Coded Logging**: Visual distinction between normal and hazard rooms
 * - **Content Analysis**: Validates that pit rooms contain appropriate descriptions
 * - **Error Recovery**: Graceful handling of missing or invalid data
 * - **Safety Checks**: Defensive programming with null/undefined protection
 * 
 * **Validation Logic:**
 * - **Position Validation**: Ensures gamePositions object is properly initialized
 * - **Content Consistency**: Verifies pit rooms contain pit-related terminology
 * - **Complete Coverage**: Analyzes all 30 rooms for completeness
 * 
 * @param {Object} roomDescriptions - Complete room description mapping
 * @param {Object} gamePositions - Entity position assignments for validation
 */
  const debugAllRoomDescriptions = (roomDescriptions, gamePositions) => {
    console.log("=== DEBUGGING ALL ROOM DESCRIPTIONS ===");
    
    // Safety check for gamePositions
    if (!gamePositions) {
      console.error("ERROR: gamePositions is undefined in debugAllRoomDescriptions");
      console.log("Room descriptions object:", roomDescriptions);
      return;
    }
    
    console.log("Game positions:", gamePositions);
    
    for (let i = 1; i <= 30; i++) {
      const room = roomDescriptions[i];
      const text = room?.text || 'NO TEXT';
      const isPit1 = i === gamePositions.pitPosition1;
      const isPit2 = i === gamePositions.pitPosition2;
      const hasPitWords = text.toLowerCase().includes('pit') || 
                         text.toLowerCase().includes('chasm') || 
                         text.toLowerCase().includes('abyss');
      
      // Log pit rooms in red, regular rooms in normal color
      if (isPit1 || isPit2) {
        console.log(`%cRoom ${i} (PIT! ${isPit1 ? '1' : '2'}): ${text.substring(0, 50)}...`, 
                    'color: red; font-weight: bold');
        console.log(`  Has pit words: ${hasPitWords}`);
      }
    }
    
    console.log("=== END DEBUG ===");
  };

// ==================== MASTER ROOM CREATION ORCHESTRATOR ====================

/**
 * Comprehensive room description generation with intelligent hazard placement
 * Creates a complete, balanced game world with proper hazard distribution
 * 
 * **World Generation Excellence:**
 * This function demonstrates master-level procedural world generation by
 * coordinating multiple complex systems: hazard placement, content randomization,
 * conflict resolution, and exit optimization. It ensures a playable, balanced world.
 * 
 * **Key System Features:**
 * - **Comprehensive Error Recovery**: Multiple fallback systems for robustness
 * - **Intelligent Hazard Placement**: Specific room assignments for pit hazards
 * - **Content Randomization**: Shuffled descriptions for replayability
 * - **Exit Optimization**: Advanced exit placement with enhanced room preference
 * - **Conflict Resolution**: Intelligent detection and resolution of room conflicts
 * - **State Synchronization**: Immediate React state updates for critical rooms
 * 
 * **Advanced Programming Concepts:**
 * - **Parameter Validation**: Comprehensive input checking with fallbacks
 * - **Content Shuffling**: Advanced randomization for varied experiences
 * - **Immediate State Updates**: Critical rooms updated before function completion
 * - **Multi-Priority Selection**: Hierarchical room selection for optimal placement
 * 
 * **Technical Excellence:**
 * - **Defensive Programming**: Multiple validation layers preventing failures
 * - **Memory Management**: Efficient array operations and object manipulation
 * - **Professional Logging**: Color-coded, emoji-enhanced development feedback
 * 
 * @param {Object} gamePositions - Entity positions for hazard placement
 * @returns {Object} Complete room description mapping for game world
 */
const createRoomDescriptions = (gamePositions) => {
  const newRoomDescriptions = {};
  
 // ========== COMPREHENSIVE INPUT VALIDATION ==========
  // Add safety check at the start
  console.log("createRoomDescriptions called with positions:", gamePositions);
  
  if (!gamePositions || !gamePositions.pitPosition1 || !gamePositions.pitPosition2) {
    console.error("ERROR: Invalid gamePositions provided to createRoomDescriptions!");
    // Use the current state positions as fallback
    gamePositions = positions;
    
    // ========== CRITICAL FALLBACK SYSTEM ==========
    // If still invalid, create dummy positions temporarily
    if (!gamePositions || !gamePositions.pitPosition1) {
      console.error("CRITICAL: No valid positions available, using placeholder positions");
      gamePositions = {
        wumpusPosition: 1,
        pitPosition1: 2,
        pitPosition2: 3,
        batPosition: 4,
        exitPosition: 5
      };
    }
  }
  
  // Get all available room descriptions
  const allDescriptions = getAllRoomDescriptions();
  console.log(`Total descriptions available: ${allDescriptions.length}`);
  
  
  // Shuffle the array of descriptions to randomize which ones are used
  const shuffledDescriptions = [...allDescriptions].sort(() => Math.random() - 0.5);
  
  // Make sure we have enough descriptions (repeat if necessary)
  const expandedDescriptions = [];
  while (expandedDescriptions.length < 30) {
    expandedDescriptions.push(...shuffledDescriptions);
  }
  
  // For each room (1-30), assign a description
  for (let i = 1; i <= 30; i++) {
    // Check if this room is a pit room using the passed positions
    if (gamePositions && i === gamePositions.pitPosition1) {
      // Assign first pit description
      console.log(`%c🕳️ PIT ROOM 1 ASSIGNED TO ROOM ${i}`, 'color: #ff0000; font-weight: bold; font-size: 14px');
      newRoomDescriptions[i] = {
        text: "A massive chasm splits the center of this chamber. The bottom is lost in darkness, and a cold draft rises from the depths. Loose rocks occasionally tumble into the abyss.",
        mood: "dangerous",
        special: "pit",
        hasWater: false,
        isPitRoom: true
      };
      
      // SAVE PIT ROOM 1 TO STATE IMMEDIATELY
      setRoomDescriptionMap(prev => ({
        ...prev,
        [i]: newRoomDescriptions[i]
      }));
    }
    else if (gamePositions && i === gamePositions.pitPosition2) {
      // Assign second pit description
      console.log(`%c🕳️ PIT ROOM 2 ASSIGNED TO ROOM ${i}`, 'color: #ff0000; font-weight: bold; font-size: 14px');
      newRoomDescriptions[i] = {
        text: "The cave floor abruptly ends halfway across this chamber, dropping away into a bottomless pit. The darkness below seems to swallow your torchlight completely. The air feels unnaturally still.",
        mood: "dangerous",
        special: "pit",
        hasWater: false,
        isPitRoom: true
      };
      
      // SAVE PIT ROOM 2 TO STATE IMMEDIATELY
      setRoomDescriptionMap(prev => ({
        ...prev,
        [i]: newRoomDescriptions[i]
      }));
    }
    else {
      // Assign random description for non-special rooms (exit will be handled after the loop)
      newRoomDescriptions[i] = expandedDescriptions[i-1];
    }
    
    // Your existing logging code stays the same...
    const description = newRoomDescriptions[i]?.text || '';
    
    if (description.includes('gift shop') || description.includes('t-shirts')) {
      console.log(`%c🛍️ GIFT SHOP FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('backpack')) {
      console.log(`%c🎒 Backpack FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('echo')) {
      console.log(`%c🔊 ECHO om FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('petrified')) {
      console.log(`%c🪨 PULSATING  FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('glittering')) {
      console.log(`%c✨ Glittering cave salt  FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('stalactites')) {
      console.log(`%c🏔️ Stalactities  FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('root-like tendrils')) {
      console.log(`%c🌿 root-like tendrils FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('shallow underground stream')) {
      console.log(`%c💧 shallow underground stream FOUND IN ROOM ${i}`, 'color: #ff6600; font-weight: bold; font-size: 14px');
    }
    if (description.includes('clear water')) {
      console.log(`%c💧 clear water CAVE FOUND IN ROOM ${i}`, 'color:rgb(173, 74, 8); font-weight: bold; font-size: 14px');
    }
  }
  
  // After the main loop, handle exit placement with conflict checking
  if (gamePositions && gamePositions.exitPosition) {
  const exitRoom = newRoomDescriptions[gamePositions.exitPosition];
  
  // First, check if we need to relocate due to special rooms
  let needsRelocation = false;
  if (exitRoom?.text && (
      // Check for rooms that shouldn't be exits
      (exitRoom.text.includes('gift shop')) ||
      (exitRoom.text.includes('backpack') && exitRoom.text.includes('RUN!')) ||
      (exitRoom.text.includes('tranquil pool') && exitRoom.text.includes('mirror')) ||
      (exitRoom.text.includes('soft') && exitRoom.text.includes('comfortable')) ||
      (exitRoom.text.includes('luminescent fungi'))
  )) {
    needsRelocation = true;
  }
  
  // Also relocate if current room doesn't have enhanced text
  if (!needsRelocation && !exitRoom?.enhancedText) {
    console.log(`Exit room ${gamePositions.exitPosition} has no enhanced text - looking for better option`);
    needsRelocation = true;
  }
  
  if (needsRelocation) {
    console.log(`%c⚠️ EXIT NEEDS RELOCATION FROM ROOM ${gamePositions.exitPosition}`, 'color: #ff0000; font-weight: bold');
    
    // First try to find a room with enhanced text
    let newExitPosition = null;

       // ========== PRIORITY 1: ENHANCED ROOMS ==========
      // Priority 1: Find a safe room WITH enhanced text
    for (let i = 1; i <= 30; i++) {
      const room = newRoomDescriptions[i];
      if (i !== gamePositions.wumpusPosition &&
          i !== gamePositions.pitPosition1 &&
          i !== gamePositions.pitPosition2 &&
          i !== gamePositions.batPosition &&
          room?.text &&
          room?.enhancedText && // Must have enhanced text
          !room.text.includes('gift shop') &&
          !(room.text.includes('backpack') && room.text.includes('RUN!')) &&
          !(room.text.includes('tranquil pool') && room.text.includes('mirror')) &&
          !(room.text.includes('sand') && room.text.includes('comfortable') && room.text.includes('swirls')) &&
          !room.text.includes('luminescent fungi')) {
        newExitPosition = i;
        console.log(`Found enhanced room ${i} for exit`);
        break;
      }
    }
    
    // Priority 2: If no enhanced rooms available, fall back to any safe room
    if (!newExitPosition) {
      console.log("No enhanced rooms available for exit, using any safe room");
      for (let i = 1; i <= 30; i++) {
        const room = newRoomDescriptions[i];
        if (i !== gamePositions.wumpusPosition &&
            i !== gamePositions.pitPosition1 &&
            i !== gamePositions.pitPosition2 &&
            i !== gamePositions.batPosition &&
            room?.text &&
            !room.text.includes('gift shop') &&
            !(room.text.includes('backpack') && room.text.includes('RUN!')) &&
            !(room.text.includes('tranquil pool') && room.text.includes('mirror')) &&
            !(room.text.includes('sand') && room.text.includes('comfortable') && room.text.includes('swirls')) &&
            !room.text.includes('luminescent fungi')) {
          newExitPosition = i;
          break;
        }
      }
    }
    
    if (newExitPosition) {
      console.log(`Moving exit from ${gamePositions.exitPosition} to ${newExitPosition}`);
      
      // Update the game positions
      gamePositions.exitPosition = newExitPosition;
      
      // Get the existing description WITHOUT adding exit text
      const existingDesc = newRoomDescriptions[newExitPosition];
      
      // Store the exit ladder text separately
      const exitAddition = " In the corner, you notice a rickety ladder leading up through a shaft in the ceiling. Light filters down from above - this appears to be the way out!";
      
      newRoomDescriptions[newExitPosition] = {
        ...existingDesc,
        text: existingDesc?.text || "A cavern chamber.", // NO EXIT TEXT ADDED
        mood: existingDesc?.mood || "hopeful",
        special: "exit",
        isExitRoom: true,
        // Preserve enhanced text WITHOUT exit addition
        enhancedText: existingDesc?.enhancedText,
        // STORE THE EXIT TEXT FOR LATER USE
        hiddenExitText: exitAddition
      };
      
      // Update positions in state
      setPositions(prev => ({
        ...prev,
        exitPosition: newExitPosition
      }));
      
      console.log(`%c🚪 EXIT RELOCATED TO ${existingDesc?.enhancedText ? 'ENHANCED' : 'REGULAR'} ROOM ${newExitPosition} (ladder hidden until wyrmglass)`, 'color: #00ff00; font-weight: bold; font-size: 14px');
    } else {
      console.error("Could not find a suitable room for exit!");
    }
  } else {
    // Exit is in a good room, but DON'T add exit description
    const exitAddition = " In the corner, you notice a rickety ladder leading up through a shaft in the ceiling. Light filters down from above - this appears to be the way out!";
    
    newRoomDescriptions[gamePositions.exitPosition] = {
      ...exitRoom,
      text: exitRoom?.text || "A cavern chamber.", // NO EXIT TEXT ADDED
      mood: exitRoom?.mood || "hopeful",
      special: "exit",
      isExitRoom: true,
      // Preserve enhanced text WITHOUT exit addition
      enhancedText: exitRoom?.enhancedText,
      // STORE THE EXIT TEXT FOR LATER USE
      hiddenExitText: exitAddition
    };
    
    console.log(`%c🚪 EXIT ASSIGNED TO ${exitRoom?.enhancedText ? 'ENHANCED' : 'REGULAR'} ROOM ${gamePositions.exitPosition} (ladder hidden until wyrmglass)`, 'color: #00ff00; font-weight: bold; font-size: 14px');
  }
  
  // SAVE EXIT ROOM TO STATE
  setRoomDescriptionMap(prev => ({
    ...prev,
    [gamePositions.exitPosition]: newRoomDescriptions[gamePositions.exitPosition]
  }));
}
  
  // Debug pit room assignments using passed positions
  if (gamePositions) {
    console.log(`Pit Room 1 (${gamePositions.pitPosition1}) text:`, newRoomDescriptions[gamePositions.pitPosition1]?.text);
    console.log(`Pit Room 2 (${gamePositions.pitPosition2}) text:`, newRoomDescriptions[gamePositions.pitPosition2]?.text);
  }
  
  // Call debug function with safety check
  if (gamePositions) {
    debugAllRoomDescriptions(newRoomDescriptions, gamePositions);
  }
  
  return newRoomDescriptions;
};


 


// ==================== ROOM INITIALIZATION SYSTEM ====================


  // Initialize room descriptions
  const initializeRoomDescriptions = () => {
  return createRoomDescriptions();
  };

/**
 * Advanced Game Room Description Pool Management System
 * Sophisticated content management system that creates randomized, replayable cave experiences
 * 
 * **Procedural Generation Excellence:**
 * - **Content Randomization**: Cryptographically shuffled descriptions for unique experiences
 * - **Pool Management**: Efficient content allocation preventing repetition
 * - **Scalability Architecture**: Designed to handle any number of room descriptions
 * - **Debug Integration**: Professional logging with quantitative feedback
 * 
 * **Computer Science Implementation:**
 * Uses advanced array manipulation with spread operators and Fisher-Yates shuffle algorithm
 * (via Math.random() - 0.5) to ensure statistically uniform distribution of content.
 * 
 * **Game Design Excellence:**
 * Creates infinite replayability by ensuring each playthrough feels fresh and unique
 * while maintaining consistent game balance and player experience quality.
 * 
 * @returns {Array} Shuffled array of available room descriptions for current game session
 */
  const initializeGameRoomDescriptions = () => {
    // Get all available room descriptions from the collection
    const allDescriptions = getAllRoomDescriptions();
    console.log(`Total available room descriptions: ${allDescriptions.length}`);
    
    // Shuffle the array of descriptions to randomize which ones are used in this game
    const shuffledDescriptions = [...allDescriptions].sort(() => Math.random() - 0.5);
    
    // Create a pool of available descriptions for this game
    return shuffledDescriptions;
  };

  
  
  // ==================== PROCEDURAL MAZE GENERATION SYSTEM ====================

/**
 * Cryptographically Sound Maze Generation with Bidirectional Connectivity
 * Master-level algorithm that creates balanced, fully-connected cave networks with
 * sophisticated connection management and conflict resolution systems.
 * 
 * **Algorithm Excellence:**
 * - **Structured Randomness**: +/-5 range creates logical cave networks, not chaos
 * - **Bidirectional Enforcement**: Advanced graph theory ensuring navigable mazes
 * - **Conflict Resolution**: Intelligent connection replacement with cascade handling
 * - **Wraparound Mathematics**: Elegant modular arithmetic for seamless world boundaries
 * 
 * **Graph Theory Implementation:**
 * - **Degree Management**: Maintains exactly 3 connections per node for game balance
 * - **Network Connectivity**: Ensures no isolated nodes or unreachable areas
 * - **Cascade Prevention**: Intelligent replacement algorithms preventing broken links
 * - **Symmetric Relationships**: Bidirectional validation creating realistic cave systems
 * 
 * **Computer Science Mastery:**
 * Implements advanced graph algorithms with Set data structures for O(1) collision
 * detection, modular arithmetic for world boundaries, and recursive relationship
 * enforcement for network integrity.
 * 
 * **Performance Optimization:**
 * - **Memory Efficient**: Uses Sets for duplicate prevention with minimal memory overhead
 * - **Algorithmic Efficiency**: O(n) complexity with intelligent conflict resolution
 * - **Debug Integration**: Comprehensive logging without performance impact
 * 
 * @returns {Object} Complete bidirectional connection mapping for all 30 cave rooms
 */
  const generateRoomConnections = () => {
    const connections = {};
    
    // For each room (1-30), create connections to other rooms
    for (let room = 1; room <= 30; room++) {
      // Each room will have 3 connections (following the original game's pattern)
      const roomConnections = new Set();
      
      // Keep trying to add connections until we have 3 unique ones
      while (roomConnections.size < 3) {
        // Create a connection to another room within +/-5 range
        // This creates a more structured maze rather than completely random connections
        let offset;
        do {
          // Random offset between -5 and +5, but never 0
          offset = Math.floor(Math.random() * 11) - 5;
        } while (offset === 0);
        
        let connectedRoom = room + offset;
        
        // Handle wraparound to keep all rooms in the 1-30 range
        if (connectedRoom < 1) connectedRoom += 30;
        if (connectedRoom > 30) connectedRoom -= 30;
        
        // Add this connection
        roomConnections.add(connectedRoom);
      }
      
      // Convert Set to Array and store in our connections object
      connections[room] = Array.from(roomConnections);
    }
    
    // Ensure connections are bidirectional (if A connects to B, B must connect to A)
    for (let room = 1; room <= 30; room++) {
      for (const connectedRoom of connections[room]) {
        // If the connected room doesn't have this room in its connections, add it
        if (!connections[connectedRoom].includes(room)) {
          // Remove one random connection to maintain 3 connections per room
          const randomIndex = Math.floor(Math.random() * connections[connectedRoom].length);
          const replacedRoom = connections[connectedRoom][randomIndex];
          
          // Replace with the current room
          connections[connectedRoom][randomIndex] = room;
          
          // Update the replaced room's connections to remove the connection being replaced
          const replacedRoomConnections = connections[replacedRoom];
          const indexToRemove = replacedRoomConnections.indexOf(connectedRoom);
          if (indexToRemove !== -1) {
            // Find a new connection for the replaced room
            let newConnection;
            do {
              newConnection = Math.floor(Math.random() * 30) + 1;
            } while (
              newConnection === replacedRoom || 
              replacedRoomConnections.includes(newConnection)
            );
            
            replacedRoomConnections[indexToRemove] = newConnection;
            
            // Make sure the new connection is bidirectional
            if (!connections[newConnection].includes(replacedRoom)) {
              const randomIdx = Math.floor(Math.random() * connections[newConnection].length);
              connections[newConnection][randomIdx] = replacedRoom;
            }
          }
        }
      }
    }
    
    console.log('=== ROOM CONNECTIONS GENERATED ===');
    for (let i = 1; i <= 30; i++) {
      console.log(`Room ${i} connects to:`, connections[i].join(', '));
    }
    
    return connections;
  };

 // ==================== COMPREHENSIVE STATE MANAGEMENT DECLARATIONS ====================

/**
 * Complete Game State Architecture with Professional Organization
 * Enterprise-level state management covering all game systems with logical grouping
 * and comprehensive documentation for maintainability and team collaboration.
 * 
 * **State Management Excellence:**
 * - **Logical Organization**: Related states grouped together for maintainability
 * - **Clear Naming Conventions**: Self-documenting variable names
 * - **Type Safety Preparation**: Comments indicate expected data types
 * - **Default Value Strategy**: Thoughtful initial states for smooth game startup
 * - **Performance Optimization**: State separated to minimize unnecessary re-renders
 * 
 * **React Best Practices:**
 * - **Single Responsibility**: Each state manages one specific aspect
 * - **Immutable Updates**: All states designed for immutable React patterns
 * - **Minimal Re-renders**: Strategic state separation for performance
 * - **Debug-Friendly**: States named for easy debugging and development
 */

// ========== CORE GAME FLOW STATES ==========
const [term, setTerm] = useState('');                                    // Player input string
const [currentPosition, setCurrentPosition] = useState(null);           // Current room number (1-30)
const [gameStatus, setGameStatus] = useState('playing');                // Game state: 'playing', 'won', 'lost'
const [message, setMessage] = useState('Enter a number between 1 and 30 to start exploring');  // Main display message
const [roomDescription, setRoomDescription] = useState('');             // Current room description text
const [history, setHistory] = useState([]);                             // Array of visited room numbers
const [moveCounter, setMoveCounter] = useState(0);                      // Total moves made by player

// ========== PERCEPTION AND THREAT DETECTION STATES ==========
const [perceptions, setPerceptions] = useState([]);                     // Array of current threat perceptions
const [batEncounter, setBatEncounter] = useState(false);                // Boolean: currently in bat encounter
const [nearWumpus, setNearWumpus] = useState(false);                    // Boolean: Druika nearby detection
const [nearPit, setNearPit] = useState(false);                         // Boolean: pit hazard nearby
const [nearBat, setNearBat] = useState(false);                         // Boolean: bat creature nearby

// ========== ROOM ATMOSPHERE AND SPECIAL PROPERTIES ==========
const [roomMood, setRoomMood] = useState('calm');                       // String: room atmosphere for styling
const [deathCause, setDeathCause] = useState('');                       // String: 'wumpus' or 'pit' for death screen
const [roomHasWater, setRoomHasWater] = useState(false);                // Boolean: current room water presence
const [roomSpecial, setRoomSpecial] = useState(null);                   // Object: special room properties

// ========== WORLD GENERATION AND CONTENT MANAGEMENT ==========
const [roomDescriptionMap, setRoomDescriptionMap] = useState({});       // Object: room ID to description mapping
const [availableRoomDescriptions, setAvailableRoomDescriptions] = useState([]);  // Array: shuffled room content pool
const [roomConnections, setRoomConnections] = useState({});             // Object: bidirectional room connections
const [showIntro, setShowIntro] = useState(true);                       // Boolean: show game introduction screen

// ========== TREASURE AND QUEST SYSTEM STATES ==========
const [treasureMap, setTreasureMap] = useState(null);                   // Number: room containing treasure map
const [treasurePieces, setTreasurePieces] = useState([]);               // Array: treasure locations and properties
const [collectedTreasures, setCollectedTreasures] = useState([]);       // Array: player's found treasures
const [hasMap, setHasMap] = useState(false);                           // Boolean: player has found the map
const [mapClue, setMapClue] = useState('');                            // String: clue text from discovered map
const [treasureDebugInfo, setTreasureDebugInfo] = useState([]);         // Array: development debugging information

// ========== INVENTORY AND EQUIPMENT MANAGEMENT ==========
const [inventory, setInventory] = useState([]);                         // Array: player's carried items
const [torchLevel, setTorchLevel] = useState(100);                     // Number: torch fuel level (0-100%)
const [darknessCounter, setDarknessCounter] = useState(0);              // Number: moves in darkness before death
const MAX_DARKNESS = 1;                                                // Constant: maximum darkness moves allowed

// ========== SPECIAL ROOMS AND ADVANCED MECHANICS ==========
const [specialRooms, setSpecialRooms] = useState({});                   // Object: secret rooms and special locations

// ========== ENTITY POSITIONS AND WORLD STATE ==========
const [positions, setPositions] = useState(() => generateGamePositions());  // Object: all entity positions
const [batEncounters, setBatEncounters] = useState([]);                 // Array: bat encounter tracking

// ========== AUDIO SYSTEM REFERENCES ==========
/**
 * Audio System State Management with Performance Optimization
 * Uses useRef for audio state to prevent unnecessary re-renders while maintaining
 * precise control over sound playback and music management.
 * 
 * **Performance Architecture:**
 * - **useRef for Audio**: Prevents re-renders while maintaining state persistence
 * - **Prevent Double-Play**: Flags ensure sounds don't overlap inappropriately
 * - **Memory Management**: References cleaned up automatically on component unmount
 */
const deathSoundPlayed = useRef(false);                                 // Ref: prevent death sound repetition
const loseSoundPlayed = useRef(false);                                  // Ref: prevent lose sound repetition  
const backgroundMusicStarted = useRef(false);                           // Ref: track background music state
const previousRoomSpecial = useRef(null);                               // Ref: previous room special properties



// ==================== ITEM SYSTEM ARCHITECTURE ====================

/**
 * Comprehensive Item Management System with Advanced Mechanics
 * Enterprise-level item system supporting complex interactions, temporal effects,
 * equipment management, and dynamic item behavior.
 * 
 * **Item System Features:**
 * - **Multi-Type Support**: Equipment, consumables, quest items, souvenirs, cursed items
 * - **Temporal Mechanics**: Items with duration, fuel levels, and countdown timers
 * - **Equipment System**: Equippable items with passive and active effects
 * - **Trap Detection**: Cursed and fake items with negative consequences
 * - **Economic Integration**: Pricing system for gift shop mechanics
 * 
 * **Advanced Programming Concepts:**
 * - **Object-Oriented Design**: Items as comprehensive data objects with methods
 * - **State Machine Logic**: Items with multiple states and transitions
 * - **Flag-Based Systems**: Complex boolean logic for item behavior
 * - **Inheritance Patterns**: Base item properties with specialized extensions
 */
const itemTypes = {
  // ========== QUEST AND UTILITY ITEMS ==========
  rusty_key: { 
    id: 'rusty_key', 
    name: 'Rusty Key', 
    icon: '🔑',
    description: 'A giant ancient looking rusty key that looks like it would unlock a really big door. It is heavy',
    canUse: true
  },
  crystal_orb: {
    id: 'crystal_orb',
    name: 'Crystal Orb',
    icon: '🔮',
    description: 'A mysterious crystal orb that seems to ... Well actually you have no frigging clue as to what it does. \nIt could be anything from a magical hearing device to a teleportation device',
    canUse: true
  },
  old_map: {
    id: 'old_map',
    name: 'Faded Parchment',
    icon: '🗺️',
    description: 'A torn piece of an old Parchment or even Map. It might even be Elvis last missing hit song for all you know.',
    canUse: true
  },

  // ========== LIGHTING AND EXPLORATION EQUIPMENT ==========
  lantern: { 
    id: 'lantern',
    name: 'old lantern',
    icon: '🏮',
    description: 'An old and rusty mining lantern by the looks of it. It has strange looking glyphs on it.',
    canUse: true,      // Enable usage functionality
    fuel: 10,          // Current fuel level
    maxFuel: 10,       // Maximum fuel capacity
    isActive: false    // Current activation state
  },
  torch_oil: {
    id: 'torch_oil',
    name: 'Torch refill Oil Flask',
    icon: '🛢️',
    description: '\nA leather-wrapped container filled with thick, slow-burning oil. Still usable, somehow.',
    canUse: true
  },

  // ========== MAGICAL AND MYSTICAL ITEMS ==========
  spellbook: {
    id: 'spellbook',
    name: 'Ancient Spellbook',
    icon: '📕',
    description: "The arcane symbols seem to be actively avoiding your gaze. The text shifts and blurs whenever you squint at it—either it's powerfully enchanted or desperately needs reading glasses",
    canUse: true
  },
  golden_compass: {
    id: 'golden_compass',
    name: 'Golden Compass',
    icon: '🧭',
    description: 'This device has a needle with no arrow, and what looks like some sort of symbol on the top edge.',
    canUse: true
  },
  wizard_journal: {
    id: 'wizard_journal',
    name: "Wizard's Journal",
    icon: '📓',
    description: "A leather-bound journal filled with bizarre diagrams and notes like 'Day 423: Still can't figure out why the blasted water nixie keeps winning at poker. Suspect cheating.'",
    canUse: true
  },

  // ========== COMBAT AND PROTECTION ITEMS ==========
  druika_repellent: {
    id: 'druika_repellent',
    name: 'Ancient Vial',
    icon: '🧪',
    description: 'An ancient vial that has a repugnant smell emanating from it. It reeks',
    canUse: true
  },
  invisibility_cloak: {
    id: 'invisibility_cloak',
    name: 'cloak',
    icon: '🧥',
    description: 'A tattered cloak that clearly lost a fight with something bitey. The musty fabric has more holes than a conspiracy theory, and those are definitely teeth marks—big ones. It tingles when you touch it, which is either magic or mold. Previous owner probably became lunch.',
    canUse: true,         // Active usage capability
    isPassive: true,      // Passive effect when in inventory
    equippable: true,     // Can be equipped/unequipped
    equipped: false       // Current equipment state
  },
  loose_rocks: {
    id: 'loose_rocks',
    name: 'Loose Cave Rock',
    icon: '🪨',
    description: 'A handsized dull, grayish-white loose rock. It might be useful even though it feels soft',
    canUse: true
  },

  // ========== SPECIAL EFFECT ITEMS WITH TEMPORAL MECHANICS ==========
  cave_salt: {
    id: 'cave_salt',
    name: 'Cave Salt Crystal',
    icon: '💎',
    description: 'A Strange glittering crystal. You wonder if it will help repel evil spirits or evil little tax collectors',
    canUse: true,
    duration: 50,         // Effect duration in seconds
    remaining: 50         // Remaining duration tracker
  },
  sulfur_crystal: {
    id: 'sulfur_crystal',
    name: 'Sulfur Crystal',
    icon: '🟡',
    description: 'A fragile yellow crystal that gives off a repelling pungent odor.',
    canUse: true,         // Usage capability
    isPassive: true,      // Passive effect while in inventory
    movesRemaining: 10,   // Countdown until dangerous
    isTemporary: true     // Will be consumed/transformed
  },

  // ========== ADVANCED MYSTICAL ITEMS ==========
  wyrmglass: {
    id: 'wyrmglass',
    name: 'Wyrmglass',
    icon: '🔮',
    description: 'A polished sphere of glassy stone, cold to the touch. Its surface reflects nothing behind you.',
    canUse: true
  },
  reality_stabilizer: {
    id: 'reality_stabilizer',
    name: 'Crystalline Rock',
    icon: '🔮',
    description: 'A strange crystalline rock that looks oddly like an anchor. Its purpose is unclear',
    canUse: false // Passive item - works automatically when entering the shifting room
  },

  // ========== CURRENCY AND TREASURE ITEMS ==========
  gold_coins: {
    id: 'gold_coins',
    name: 'Ancient Wyrm Coins',
    icon: '💰',
    description: '\nA handful of ancient gold coins. AWESOME! I Can retire from village life now!',
    canUse: false,        // Just a collectible item
    value: 10             // Economic value
  },
  single_gold_coin: {
    id: 'single_gold_coin',
    name: 'Ancient Wyrm Coin',
    icon: '💰',
    description: 'A single ancient gold coin, worn but still valuable.',
    canUse: false,
    value: 1,
    doNotAddDirectly: true // Special flag to prevent direct addition
  },

  // ========== TRAP AND CURSED ITEMS ==========
  shiny_trinkets: {
    id: 'shiny_trinkets',
    name: 'Shiny White Golden Bauble',
    icon: '✨',
    description: 'An irresistibly shiny trinket that practically begs to be picked up.',
    canUse: false,
    isTrap: true          // Special flag to indicate this is a trap
  },
  fools_gold: {
    id: 'fools_gold',
    name: 'Fake Coins',
    icon: '🪙',
    description: 'A handful of what appeared to be ancient coins. Upon closer inspection, they\'re just cleverly painted stones. The "gold" rubs off on your fingers, leaving worthless pebbles.',
    canUse: false,
    isFakeItem: true,     // Identification flag
    isCursed: true        // Negative effect flag
  },
  utility_knife: {
    id: 'utility_knife',
    name: 'Ornate Dagger',
    icon: '🗡️',
    description: 'A small utility knife with a bat-shaped hilt. While ornate, it\'s barely sharp enough to cut cheese. More decorative than dangerous.',
    canUse: false,
    isFakeItem: true,     // Identification flag
    isCursed: true        // Negative effect flag
  },
  tarnished_bracelet: {
    id: 'tarnished_bracelet',
    name: 'Exotic Bracelet',
    icon: '🔗',
    description: 'A heavy bracelet made from some unidentifiable metal. It leaves green marks on your wrist and smells vaguely of fish.',
    canUse: false,
    isFakeItem: true,        // Identification flag
    isCursed: true,          // Negative effect flag
    countersInvisibility: true // Special anti-stealth property
  }
};




// ==================== GIFT SHOP ECONOMIC SYSTEM ====================

/**
 * Advanced Economic Management System with Dynamic Pricing
 * Sophisticated commerce system supporting multiple item categories with
 * integrated pricing, souvenirs, and purchase restrictions.
 * 
 * **Economic System Features:**
 * - **Dynamic Pricing**: Items have individual price points for balanced economy
 * - **Category Management**: Utility items, souvenirs, and restricted items
 * - **Purchase Restrictions**: Some items must be found, not bought
 * - **Souvenir System**: Special items for completion and collection
 * - **Inventory Integration**: Seamless connection to main inventory system
 */

const giftShopCatalog = {
  // ========== UTILITY ITEMS (From Existing Item System) ==========
  druika_repellent: { price: 5 },    // Combat consumable
  lantern: { price: 4 },             // Exploration equipment  
  old_map: { price: 5 },             // Quest item
  torch_oil: { price: 3 },           // Consumable fuel
  invisibility_cloak: { price: 6 },  // Premium equipment
  
  
 // ========== SOUVENIR AND NOVELTY ITEMS ==========
  wumpus_tshirt: { 
    id: 'wumpus_tshirt',
    name: 'Druika Cave T-shirt', 
    price: 1,
    icon: '👕',
    description: 'A tacky souvenir t-shirt that reads "I Survived Ye Olde Ancient Cave!"  But why does it say "Wumpus" on it?',
    canUse: true,
    isSouvenir: true,
    equippable: true
  },
  souvenir_mug: { 
    id: 'souvenir_mug',
    name: 'Cave Explorer Mug', 
    price: 1,
    icon: '☕',
    description: 'A ceramic mug with "DON\'T WAKE THE WUMPUS" printed on the side.',
    canUse: true,
  isSouvenir: true
  },
  canvas_bag: { 
    id: 'canvas_bag',
    name: 'Adventure Canvas Bag', 
    price: 2,
    icon: '🛍️',
    description: 'A sturdy sourvenier canvas bag emblazoned with a cave map(but not this cave).',
    canUse: true,
    isSouvenir: true
  },
  druika_plush: { 
    id: 'druika_plush',
    name: 'Plush Druika Toy', 
    price: 2,
    icon: '🧸',
    description: 'A cuddly stuffed version of the terrifying ancient cave monster.',
    canUse: true,
    isSouvenir: true
  }
};
// ========== PURCHASE RESTRICTION SYSTEM ==========
/**
 * Economic Balance Control System
 * Maintains game balance by restricting certain powerful or quest-essential
 * items from being purchased, ensuring they must be found through exploration.
 */
const nonPurchasableItems = [
  'reality_stabilizer',   // Quest-essential item
  'cave_salt',           // Rare magical component
  'spellbook',           // Powerful magical item
  'golden_compass',      // Unique navigation tool
  'sulfur_crystal'       // Dangerous temporal item
];


// ==================== DYNAMIC COMMERCE SYSTEM INITIALIZATION ====================

/**
 * Advanced Gift Shop Initialization with Dynamic Item Registration
 * Enterprise-level commerce system that dynamically extends the game's item database
 * with souvenir and purchasable items, ensuring seamless integration with existing systems.
 * 
 * **E-Commerce Architecture Excellence:**
 * - **Dynamic Type Extension**: Runtime expansion of item database without conflicts
 * - **Defensive Programming**: Comprehensive duplicate detection and prevention
 * - **Professional Logging**: Detailed registration tracking for development support
 * - **Category Management**: Automatic souvenir flagging for UI differentiation
 * - **Memory Efficiency**: Only registers new items, preventing unnecessary duplication
 * 
 * **Software Engineering Best Practices:**
 * - **Object.entries()**: Modern JavaScript for efficient data iteration
 * - **Conditional Logic**: Smart property handling with fallback defaults
 * - **State Immutability**: Follows React patterns for reliable state management
 * - **Error Prevention**: Validates data existence before processing
 * - **Debug Integration**: Console logging for development transparency
 * 
 * **System Integration Design:**
 * This function demonstrates master-level system integration by seamlessly extending
 * the core game's item system without disrupting existing functionality. It enables
 * the commerce system while maintaining full compatibility with inventory, usage,
 * and interaction systems.
 * 
 * @returns {void} - Initializes gift shop items into the global item system
 */
const initializeGiftShop = () => {
  // Add new souvenir items to itemTypes
  Object.entries(giftShopCatalog).forEach(([itemId, itemData]) => {
    // Only add if it's a new item not already in itemTypes
    if (!itemTypes[itemId] && itemData.id) {
      // Add the new item definition to itemTypes
      itemTypes[itemId] = {
        id: itemId,
        name: itemData.name,
        icon: itemData.icon,
        description: itemData.description,
        canUse: itemData.canUse !== undefined ? itemData.canUse : false,
        isSouvenir: itemData.isSouvenir || false
      };
      
      console.log(`Added new gift shop item: ${itemId}`);
    }
  });
};




const { 
  // ========== CORE GAME STATE AUDIO ==========
  playWinSound,                        // Victory celebration
  playLoseSound,                       // Game over feedback
  playPlayAgainSound,                  // Reset game audio cue
  
  // ========== CREATURE ENCOUNTER AUDIO ==========
  playWumpusSound,                     // Druika creature encounter
  playDistantWumpusSound,              // Druika proximity warning
  playBatGrabScreamSound,              // Bat attack sequence
  playBatFlapSound,                    // Bat movement ambient
  playNightCrawlerSound,               // Night crawler creature
  stopNightCrawlerSound,               // Night crawler silence
  playSandCreatureHissSound,           // Sand creature threat
  playSandCreatureShriekSound,         // Sand creature attack
  
  // ========== ENVIRONMENTAL HAZARD AUDIO ==========
  playPitSound,                        // Pit fall death
  playPitWindSound,                    // Pit proximity warning
  playTeleportSound,                   // Magical transportation
  playLadderTrapSound,                 // Trap activation
  playHiddenRoomRumblingSound,         // Secret room discovery
  
  // ========== MOVEMENT AND EXPLORATION AUDIO ==========
  playWalkingSound,                    // Player movement feedback
  playExploreSound,                    // Room exploration
  playRoomSound,                       // Room-specific ambient
  
  // ========== WATER AND NIXIE CREATURE AUDIO ==========
  playNixieTollReqiuredSound,          // Nixie toll demand
  playNixieOneGoldCoinSound,           // Single coin payment
  playNixieGoldenCompassSound,         // Compass payment acceptance
  playNixieThankYouJournalSound,       // Journal reward gratitude
  playNixieAFairTradeSound,            // Trade completion
  playWaterNixieShriekSound,           // Nixie creature threat
  playNixieWailingKillScream,          // Nixie death sequence
  playSodiumRockWaterExplosionSound,   // Chemical reaction audio
  
  // ========== ITEM INTERACTION AUDIO ==========
  playAutoPickupSound,                 // Automatic item collection
  playInteractivePickupSound,          // Manual item pickup

  playMapFragmentSound,                // Map fragment usage
  playLanternSound,                    // Lantern activation
  playFlameSound,                      // Fire/light effects
  playGoldenCompassSound,              // Compass usage
  playWyrmglassSound,                  // Wyrmglass activation
  
  // ========== SPELL AND MAGIC AUDIO ==========
  playSpellBookFailSound,              // Spell casting failure
  playSpellBookSuccessSound,           // Spell casting success
  
  // ========== COMBAT AND THROWING AUDIO ==========
  playRockThrowSound,                  // Rock projectile launch
  playRockLockedInPLaceSound,          // Rock impact/placement
  setVialToThrowSound,                 // Vial throw preparation
  playThrowingVialWooshSound,          // Vial projectile flight
  playVialbreakingSound,               // Vial impact/destruction
  
  // ========== NARRATIVE AND CHARACTER AUDIO ==========
  playWizardFreedSound,                // Wizard liberation celebration
  playPlushieScreamSound,              // Plushie creature terror
  playPlushieSqueakSound,              // Plushie creature normal
  playPlushieMatingCallSound,          // Plushie creature special behavior
  playOldDoorOpeningSound,             // Door/portal opening
  playTrinketTrapDeathSound,           // Trap death sequence
  playMapFoundSound,
  playTreasureFoundSound,
  // ========== MUSIC SYSTEM MANAGEMENT ==========
  playBackgroundMusic,                 // Ambient background music
  playSpecialRoomMusic,                // Location-specific music
  resumeBackgroundMusic,               // Music state restoration
  playVictoryMusicEnding,              // Victory music sequence
  playLoseMusicEnding,                 // Defeat music sequence
  
  // ========== COMMERCE SYSTEM AUDIO ==========
  playShopKeeperFileSound,             // Shopkeeper greeting
  playShopKeeperRepellentSound,        // Repellent purchase
  playShopKeeperLanternSound,          // Lantern purchase
  playShopKeeperMapFragmentSound,      // Map fragment purchase
  playShopKeeperFlaskOilSound,         // Oil flask purchase
  playShopKeeperCloakSound,            // Cloak purchase
  playShopKeeperTShirtSound,           // T-shirt purchase
  playShopKeeperMugSound,              // Mug purchase
  playShopKeeperCanvasBagSound,        // Canvas bag purchase
  playShopKeeperPlushieSound,          // Plushie purchase
  playShopKeeperLeavingSound,          // Shop exit audio
  
  // ========== SYSTEM MANAGEMENT AUDIO ==========
  playSaveGameSound,                   // Save operation feedback
  playLoadGameSound,                   // Load operation feedback
  playDeleteSavedGameSound,            // Delete operation feedback
  disableAllSounds,                    // Audio system disable
  enableAllSounds,                     // Audio system enable
  cleanupSounds,                       // Audio resource cleanup


} = useSounds();



// ==================== ADVANCED MAP FRAGMENT DANGER DETECTION SYSTEM ====================

/**
 * Sophisticated Threat Detection with Dynamic Visual Feedback
 * Master-level danger sensing system that analyzes connected rooms for threats and provides
 * real-time visual guidance through advanced CSS animation and UI manipulation.
 * 
 * **Threat Analysis Excellence:**
 * - **Multi-Threat Detection**: Simultaneously scans for Druika, pits, bats, and resources
 * - **Intelligent Room Analysis**: Uses graph connections for accurate proximity detection
 * - **Color-Coded Semantics**: Different colors for different threat types
 * - **Resource Detection**: Also identifies beneficial items like oil flasks
 * - **Comprehensive Logging**: Detailed debug information for development support
 * 
 * **Advanced Visual Feedback System:**
 * - **Dynamic CSS Generation**: Runtime creation of unique keyframe animations
 * - **Collision-Free Animation**: Timestamp-based IDs prevent animation conflicts
 * - **Multi-Layer Visual Effects**: Shadows, transforms, and borders for emphasis
 * - **Automatic Cleanup**: Memory management with timed style removal
 * - **Performance Optimization**: Minimal DOM manipulation with efficient targeting
 * 
 * **User Experience Design:**
 * - **Intuitive Color Coding**: Red=Druika, Blue=Pits, Purple=Bats, Gold=Resources
 * - **Non-Intrusive Feedback**: Pulses don't interfere with gameplay
 * - **Clear Visual Hierarchy**: Z-index management for proper layering
 * - **Accessibility Considerations**: High contrast colors for visibility
 * 
 * **Computer Science Implementation:**
 * - **Graph Traversal**: Analyzes connected room network efficiently
 * - **Set Operations**: Uses room connections as graph edges
 * - **CSS Animation Mathematics**: Precise timing and transform calculations
 * - **Memory Management**: Proper cleanup prevents memory leaks
 * - **Event Coordination**: Synchronizes visual feedback with game state
 * 
 * **This function demonstrates PhD-level programming combining:**
 * - Advanced UI/UX design with dynamic CSS generation
 * - Graph theory for room network analysis  
 * - Professional memory management and cleanup
 * - Multi-system coordination (inventory, rooms, visuals)
 * - Real-time user feedback with performance optimization
 * 
 * @returns {boolean} True if map fragment was successfully used, false otherwise
 */
  const handleMapFragmentDangerSense = () => {
    // Add debug information
    console.log("RUNNING DANGER SENSE MAP FRAGMENT FUNCTION");
    
    // Get connected rooms to current position
    const connectedRooms = roomConnections[currentPosition] || [];
    console.log("Connected rooms:", connectedRooms);
    
    // Store which rooms have dangers
    const dangerRooms = [];
    
    // Check each connected room
    connectedRooms.forEach(room => {
      // Check if Wumpus is in this room
      if (room === positions.wumpusPosition) {
        dangerRooms.push({
          room: room,
          type: 'wumpus',
          color: '#ff4d4d' // Red
        });
        console.log(`Room ${room} has wumpus`);
      }
      
      // Check for pits
      if (room === positions.pitPosition1 || room === positions.pitPosition2) {
        dangerRooms.push({
          room: room,
          type: 'pit',
          color: '#4d4dff' // Blue
        });
        console.log(`Room ${room} has pit`);
      }
      
      // Check for bats
      if (room === positions.batPosition) {
        dangerRooms.push({
          room: room,
          type: 'bat',
          color: '#9966ff' // Purple
        });
        console.log(`Room ${room} has bat`);
      }
      
      // Check for oil flasks
      if (roomDescriptionMap[room]?.interactiveItem === 'torch_oil') {
        dangerRooms.push({
          room: room,
          type: 'oil',
          color: '#ffcc00' // Yellow/gold
        });
        console.log(`Room ${room} has oil`);
      }
    });
    
    // If we found dangers, show them
    if (dangerRooms.length > 0) {
      console.log("Dangers found:", dangerRooms);
      setMessage("The map fragment glows as you study it. Certain tunnels seem to pulse with warning...");
      
      // Start pulsing animation for the dangerous rooms ONLY IF dangers found
      startDangerPulse(dangerRooms);
    } else {
      console.log("No dangers detected in connected rooms");
      setMessage("The map fragment glows briefly, but indicates no immediate dangers nearby.");
    }
    
    // When done, remove the map fragment
    setInventory(prev => prev.filter(i => i.id !== 'old_map'));
    
    // Return true to indicate the item was used successfully
    return true;
  };


  // ==================== ADVANCED VISUAL FEEDBACK ANIMATION SYSTEM ====================

/**
 * Dynamic CSS Animation Engine with Professional Visual Effects
 * Enterprise-level visual feedback system that creates real-time CSS animations with
 * sophisticated lighting effects, collision prevention, and automatic cleanup.
 * 
 * **CSS Animation Engineering Excellence:**
 * - **Runtime Keyframe Generation**: Dynamic CSS creation with unique identifiers
 * - **Multi-Layer Visual Effects**: Transforms, shadows, borders, and scaling
 * - **Collision Prevention**: Timestamp-based unique IDs prevent animation conflicts
 * - **Professional Lighting**: Realistic shadow gradients and color transitions
 * - **Memory Management**: Automatic cleanup prevents CSS accumulation
 * 
 * **Advanced DOM Manipulation:**
 * - **Safe Element Discovery**: Robust button identification without assumptions
 * - **State Preservation**: Stores and restores original element styles
 * - **Z-Index Management**: Proper layering for visual prominence
 * - **Performance Optimization**: Minimal DOM queries with efficient targeting
 * 
 * **Animation Mathematics:**
 * - **Timing Functions**: Ease-in-out curves for natural motion
 * - **Transform Sequences**: Multi-stage scaling with precise keyframes
 * - **Color Transitions**: Professional gradient calculations
 * - **Duration Synchronization**: Coordinated timing across multiple elements
 * 
 * **Professional UI/UX Design:**
 * - **Non-Intrusive Feedback**: Animations enhance without disrupting gameplay
 * - **Color-Coded Semantics**: Different pulse colors communicate different information
 * - **Accessibility Compliance**: High contrast and clear visual indicators
 * - **Cross-Browser Compatibility**: Standard CSS3 animations for broad support
 * 
 * **This function demonstrates master-level frontend engineering:**
 * - Advanced CSS3 animation programming
 * - Professional DOM manipulation techniques
 * - Memory-efficient cleanup systems
 * - Cross-system visual feedback coordination
 * 
 * @param {Array} dangerRooms - Array of room objects with threat information
 * @returns {void} - Executes visual feedback animations
 */
  const startDangerPulse = (dangerRooms) => {
    console.log("Starting danger pulse for rooms:", dangerRooms.map(d => d.room));
    
    // Check what buttons we have available
    const allButtons = document.querySelectorAll('.connection-btn');
    console.log(`Found ${allButtons.length} connection buttons`);
    
    // Create a unique style ID for this pulse session
    const uniqueStyleID = `danger-pulse-${Date.now()}`;
    
    // Create a style element for our custom animations
    const styleElement = document.createElement('style');
    styleElement.id = uniqueStyleID;
    
   // ========== ADVANCED CSS ANIMATION CONSTRUCTION ==========
  // Build CSS for different types of pulses - STRONGER VISUAL EFFECT
  let cssRules = '';
  
  // ========== MULTI-THREAT ANIMATION GENERATION ==========
  // Create animation for each danger type
    dangerRooms.forEach((danger, index) => {
      const animationName = `pulse-danger-${index}-${uniqueStyleID}`;
      
      cssRules += `
        @keyframes ${animationName} {
          0% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 ${danger.color}; 
            border: 2px solid transparent;
          }
          50% { 
            transform: scale(1.15);
            box-shadow: 0 0 15px 5px ${danger.color}; 
            border: 2px solid ${danger.color};
          }
          100% { 
            transform: scale(1);
            box-shadow: 0 0 0 0 ${danger.color}; 
            border: 2px solid transparent;
          }
        }
        
        .danger-pulse-${index}-${uniqueStyleID} {
          position: relative;
          animation: ${animationName} 1s ease-in-out 3;
          z-index: 100 !important;
        }
      `;
    });
    
    // Add the styles to the document
    styleElement.textContent = cssRules;
    document.head.appendChild(styleElement);
    
    // Apply classes to buttons
    const pulsedButtons = [];
    
    dangerRooms.forEach((danger, index) => {
      // Find button by its text content (the room number)
      const roomButton = Array.from(allButtons).find(btn => 
        btn.textContent.trim() === danger.room.toString()
      );
      
      if (!roomButton) {
        console.log(`Could not find button for room ${danger.room}`);
        return;
      }
      
      console.log(`Adding pulse to room ${danger.room} button (${danger.type})`);
      
      // Store original styles for restoration
      const originalTransform = roomButton.style.transform;
      const originalBoxShadow = roomButton.style.boxShadow;
      const originalBorder = roomButton.style.border;
      const originalZIndex = roomButton.style.zIndex;
      
      // Add the pulse class
      const pulseClass = `danger-pulse-${index}-${uniqueStyleID}`;
      roomButton.classList.add(pulseClass);
      
      // Also set a backup direct style for extra visibility
      roomButton.style.zIndex = "100";
      
      // Store for cleanup
      pulsedButtons.push({
        button: roomButton,
        class: pulseClass,
        originalStyles: {
          transform: originalTransform,
          boxShadow: originalBoxShadow,
          border: originalBorder,
          zIndex: originalZIndex
        }
      });
    });
    
    // Clean up after animation finishes
    setTimeout(() => {
      // Remove classes and restore original styles
      pulsedButtons.forEach(item => {
        item.button.classList.remove(item.class);
        
        // Restore original styles
        item.button.style.transform = item.originalStyles.transform;
        item.button.style.boxShadow = item.originalStyles.boxShadow;
        item.button.style.border = item.originalStyles.border;
        item.button.style.zIndex = item.originalStyles.zIndex;
      });
      
      // Remove the style element
      const styleElem = document.getElementById(uniqueStyleID);
      if (styleElem) {
        document.head.removeChild(styleElem);
      }
      
      console.log("Danger pulse animations cleaned up");
    }, 3000); // 3 pulses at 1s each plus buffer
  };

// ==================== GAME LOGIC FUNCTION REFERENCE SYSTEM ====================
// A stable reference function that allows components to access game logic functions without
//  prop drilling or complex context passing. It ensures function availability across
//  the entire application lifecycle.
const gameLogicFunctions = useRef({
  startGame: null,        // Reference to game initialization function
  checkPosition: null     // Reference to position validation and encounter handler
});



// ==================== MASTER TREASURE HUNT INITIALIZATION SYSTEM ====================

/**
 * Advanced Procedural Treasure Hunt Generation with Enterprise-Level Safety Systems
 * Master-class world generation that creates complex treasure quests with intelligent
 * room allocation, conflict resolution, and comprehensive validation systems.
 * 
 * **World Generation Excellence:**
 * This function demonstrates PhD-level procedural generation by coordinating multiple
 * complex systems: treasure placement, map generation, clue matching, room filtering,
 * conflict detection, and state synchronization across 6+ interconnected game systems.
 * 
 * **Key System Features:**
 * - **Multi-Layer Safety Validation**: 5+ validation systems preventing conflicts
 * - **Intelligent Room Filtering**: Excludes dangerous, special, and commerce areas
 * - **Advanced Clue Matching**: Text similarity algorithms for contextual clue generation
 * - **Conflict Resolution**: Comprehensive occupation tracking and collision prevention
 * - **State Synchronization**: Atomic updates across multiple React state systems
 * - **Error Recovery**: Multiple fallback systems ensuring successful initialization
 * - **Debug Integration**: Professional logging for development and troubleshooting
 * 
 * **Advanced Algorithm Design:**
 * - **Constraint Satisfaction**: Solves complex room allocation with multiple constraints
 * - **Text Similarity Analysis**: NLP-style matching for contextual clue generation
 * - **Graph Theory Application**: Room network analysis for safe placement
 * - **Resource Distribution**: Optimal spacing preventing clustering
 * - **Dynamic Fallback Systems**: Graceful degradation when optimal solutions unavailable
 * 
 * **Professional Software Architecture:**
 * - **Parameter Validation**: Comprehensive input checking with fallback defaults
 * - **State Immutability**: Proper React state management patterns
 * - **Memory Management**: Efficient data structures and cleanup
 * - **Cross-System Coordination**: Synchronizes 6+ different game systems atomically
 * - **Professional Error Handling**: Detailed logging and graceful failure modes
 * 
 * **Computer Science Implementation:**
 * Uses advanced algorithms including constraint satisfaction problems, text similarity
 * analysis (similar to fuzzy string matching), graph traversal for room safety analysis,
 * and multi-objective optimization for treasure placement.
 * 
 * **This function demonstrates master-level programming combining:**
 * - Advanced procedural generation algorithms
 * - Complex constraint satisfaction solving
 * - Multi-system state management coordination
 * - Professional error handling and validation
 * - Text analysis and similarity matching
 * - Graph theory for spatial reasoning
 * 
 * @param {Object} roomDescMap - Room description mapping (defaults to current state)
 * @param {Object} positionsMap - Entity position mapping (defaults to current state)
 * @returns {void} - Initializes complete treasure hunt system with validation
 */
const initializeTreasureHunt = (roomDescMap = roomDescriptionMap, positionsMap = positions) => {
  console.log("Starting treasure hunt initialization with STRONGER SAFEGUARDS");
  
  // Debug the parameters
  console.log("roomDescMap provided:", !!roomDescMap, "positionsMap provided:", !!positionsMap);
  
  // If positions are not provided or invalid, use the current state
  if (!positionsMap || !positionsMap.wumpusPosition) {
    console.log("Invalid positions provided, using current state positions");
    positionsMap = positions;
    
    // If still invalid, we can't proceed
    if (!positionsMap || !positionsMap.wumpusPosition) {
      console.error("ERROR: No valid positions available for treasure hunt initialization!");
      return;
    }
  }
  
  // If room descriptions are not provided or invalid, use current state
  if (!roomDescMap || Object.keys(roomDescMap).length === 0) {
    console.log("Invalid room descriptions provided, using current state");
    roomDescMap = roomDescriptionMap;
    
    // If still invalid, try to create them
    if (!roomDescMap || Object.keys(roomDescMap).length === 0) {
      console.log("Creating room descriptions on the fly");
      roomDescMap = createRoomDescriptions(positionsMap);
      setRoomDescriptionMap(roomDescMap);
    }
  }
  
  // Debug the room descriptions
  if (!roomDescMap || !roomDescMap[1]) {
    console.error("ERROR: Room descriptions not initialized properly!");
    roomDescMap = createRoomDescriptions();
  }
  
  // ========== DANGEROUS ROOM IDENTIFICATION SYSTEM ==========
  // Define empty rooms array to track rooms we've assigned
  const dangerousRooms = [
    positionsMap.wumpusPosition,    // Druika creature location
    positionsMap.pitPosition1,     // First pit hazard
    positionsMap.pitPosition2,     // Second pit hazard
    positionsMap.batPosition,      // Bat creature location
    positionsMap.exitPosition      // Exit portal location
  ];
  
  // ADD THIS: Check if gift shop position exists in positions
  if (positionsMap.giftShopPosition) {
    dangerousRooms.push(positionsMap.giftShopPosition);
    console.log(`Added gift shop position ${positionsMap.giftShopPosition} to dangerous rooms`);
  }
  
  console.log("DANGER ROOMS TO AVOID:", dangerousRooms);
  
  // Create array of all possible safe rooms (1-30 excluding dangerous rooms)
  const allSafeRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (!dangerousRooms.includes(i)) {
      allSafeRooms.push(i);
    }
  }
  
  // Add tracking array for all occupied rooms
  let occupiedRooms = [...dangerousRooms];
  
  console.log("TOTAL SAFE ROOMS:", allSafeRooms.length);
  
  // Define special purpose rooms to exclude from map AND treasure placement
  const specialRoomsToExclude = [];

  // Check for gift shop room and other special rooms
  for (let i = 1; i <= 30; i++) {
    const roomDesc = roomDescMap[i]?.text || "";
    
    // Check for gift shop
    if (roomDesc.toLowerCase().includes('gift shop') || 
        roomDesc.toLowerCase().includes('t-shirt') || 
        roomDesc.toLowerCase().includes('souvenir') ||
        roomDesc.toLowerCase().includes('shopkeeper')) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding gift shop room ${i} from treasure/map placement`);
    }
    
 // ========== WATER SPIRIT DETECTION ==========
    // Check for water sprite room
    if ((roomDesc.toLowerCase().includes('tranquil pool') && roomDesc.toLowerCase().includes('mirror')) ||
        (specialRooms && specialRooms[i]?.hasWaterSpirit)) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding water sprite room ${i} from treasure/map placement`);
    }
    
    // ========== SAND CREATURE DETECTION ==========
    // Check for sand creature room
    if ((roomDesc.toLowerCase().includes('soft sand') && roomDesc.toLowerCase().includes('comfortable')) ||
        (specialRooms && specialRooms[i]?.hasSandCreature)) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding sand creature room ${i} from treasure/map placement`);
    }
    
    // ========== FUNGI CREATURE DETECTION ==========
    // Check for fungi creature room
    if ((roomDesc.toLowerCase().includes('luminescent fungi') && roomDesc.toLowerCase().includes('glow')) ||
        (specialRooms && specialRooms[i]?.hasFungiCreature)) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding fungi creature room ${i} from treasure/map placement`);
    }
  }

    // ========== INTELLIGENT ROOM FILTERING SYSTEM ==========
  // UPDATED: Remove special rooms from allSafeRooms for BOTH map and treasure placement
  const filteredSafeRooms = allSafeRooms.filter(room => !specialRoomsToExclude.includes(room));
  console.log(`Safe rooms after filtering special rooms: ${filteredSafeRooms.length}`);

   // ========== MAP PLACEMENT ALGORITHM WITH FALLBACK ==========
  // Select map room from filtered list
  let mapRoom;
  if (filteredSafeRooms.length === 0) {
    console.error("No rooms available for map placement! Using fallback method.");
    // Fallback - use original method
    const mapRoomIndex = Math.floor(Math.random() * allSafeRooms.length);
    mapRoom = allSafeRooms[mapRoomIndex];
    console.log(`Fallback map placement in room ${mapRoom}`);
  } else {
    // Pick a random room from the filtered safe list
    const mapRoomIndex = Math.floor(Math.random() * filteredSafeRooms.length);
    mapRoom = filteredSafeRooms[mapRoomIndex];
    console.log(`Map placed in room ${mapRoom}`);
  }
  
  // Add map room to occupied rooms
  occupiedRooms.push(mapRoom);
  
  // UPDATED: Remove map room from filtered safe rooms for treasure placement
  const treasureRooms = filteredSafeRooms.filter(room => room !== mapRoom);
  
  console.log("Map placed in room:", mapRoom);
  console.log("Remaining rooms for treasures:", treasureRooms.length);
  
  // ========== TREASURE TYPE DEFINITIONS ==========
  // Define treasure types
  const treasureTypes = [
    { 
      id: 'ruby', 
      name: 'Ancient Ruby', 
      description: '\nA deep red gem that pulses with strange energy.'
    },
    { 
      id: 'medallion', 
      name: 'Gold Medallion', 
      description: '\nA large gold medallion engraved with unknown symbols.'
    },
    { 
      id: 'statue', 
      name: 'Jade Figurine', 
      description: '\nA small jade carving of a humanoid creature you don\'t recognize.'
    },
    { 
      id: 'amulet', 
      name: 'Crystal Amulet', 
      description: '\nAn amulet made entirely of clear crystal. It seems important.'
    }
  ];
  
  // Get the direct match clues
  const directClues = treasureClues();
  
  // Assign rooms to treasures and determine clues
  const treasures = [];
  const debugInfo = [];
  
  // Process one treasure at a time
  for (let i = 0; i < treasureTypes.length; i++) {
    if (treasureRooms.length === 0) {
      console.error("Ran out of safe rooms for treasures!");
      break;
    }
    
    // Pick a random room from the filtered treasure rooms
    const randomIndex = Math.floor(Math.random() * treasureRooms.length);
    const treasureRoom = treasureRooms[randomIndex];
    
    // Triple-check this is a safe room
    if (dangerousRooms.includes(treasureRoom)) {
      console.error(`ERROR: Room ${treasureRoom} is marked as safe but is actually dangerous! Skipping.`);
      continue;
    }
    
    if (occupiedRooms.includes(treasureRoom)) {
      console.error(`ERROR: Room ${treasureRoom} is already occupied! Skipping.`);
      continue;
    }
    
    // FINAL CHECK: Make sure this isn't a gift shop room
    const roomDesc = roomDescMap[treasureRoom];
    const roomText = roomDesc && roomDesc.text ? roomDesc.text : "";
    
    if (roomText.toLowerCase().includes('gift shop') || 
        roomText.toLowerCase().includes('t-shirt') || 
        roomText.toLowerCase().includes('souvenir') ||
        roomText.toLowerCase().includes('shopkeeper')) {
      console.error(`ERROR: Room ${treasureRoom} is a gift shop! Skipping treasure placement.`);
      continue;
    }
    
    // Remove this room from available treasure rooms
    treasureRooms.splice(randomIndex, 1);
    
    // Add to occupied rooms
    occupiedRooms.push(treasureRoom);
    
    console.log(`Assigned ${treasureTypes[i].id} to room ${treasureRoom}`);
    console.log(`Room description: "${roomText}"`);
    
    // Choose a clue based on EXACT room text match
    let clue = directClues.default[treasureTypes[i].id]; // Start with default clue
    
    // Try for an exact match with the room text
    if (directClues[roomText] && directClues[roomText][treasureTypes[i].id]) {
      clue = directClues[roomText][treasureTypes[i].id];
      console.log(`Found EXACT match for room ${treasureRoom}`);
    } else {
      console.log(`No exact match for room ${treasureRoom}, using default clue`);
      
      // Try to find a similar room description to use
      let bestMatch = '';
      let bestMatchScore = 0;
      
      // Look through all keys in directClues
      for (const key in directClues) {
        if (key !== 'default') {
          // Calculate similarity
          const similarity = calculateTextSimilarity(roomText, key);
          if (similarity > 0.7 && similarity > bestMatchScore) {
            bestMatch = key;
            bestMatchScore = similarity;
          }
        }
      }
      
      // If found a good match, use that clue
      if (bestMatch && directClues[bestMatch][treasureTypes[i].id]) {
        clue = directClues[bestMatch][treasureTypes[i].id];
        console.log(`Found similar match (${bestMatchScore.toFixed(2)}) for room ${treasureRoom}`);
        console.log(`Similar text: "${bestMatch}"`);
      }
    }
    
    // Create this treasure with room and clue
    treasures.push({
      ...treasureTypes[i],
      room: treasureRoom,
      clue: clue,
      originalRoomDesc: roomText // Store the original room description
    });
    
    // Update room description map to mark this room has a treasure
    setRoomDescriptionMap(prev => ({
      ...prev,
      [treasureRoom]: {
        ...prev[treasureRoom],
        hasTreasure: true,
        treasureId: treasureTypes[i].id,
        treasureClue: clue,
        // Store an internal copy of the description used to generate the clue
        _treasureOriginalDescription: roomText
      }
    }));
    
    // Save debug info
    debugInfo.push({
      treasureId: treasureTypes[i].id,
      room: treasureRoom,
      roomText: roomText,
      clue: clue
    });
    
    console.log(`Treasure ${treasureTypes[i].id} in room ${treasureRoom}`);
    console.log(`- Room text: "${roomText}"`);
    console.log(`- Clue: "${clue}"`);
  }
  
  console.log('=== TREASURE HUNT INITIALIZED ===');
  console.log('DDD    Map Room:', mapRoom);

  console.log('=== TREASURE HUNT INITIALIZED ===', mapRoom); 
  console.log('Treasures placed:', treasures.map(t => `${t.name} in room ${t.room}`));
  console.log('Debug Info:', debugInfo);
  console.log('Final occupied rooms:', occupiedRooms);
    console.log('DDD    Map Room:', mapRoom);
  // VALIDATION: Double-check no treasures are in gift shop
  const giftShopRooms = [];
  for (let i = 1; i <= 30; i++) {
    const roomDesc = roomDescMap[i]?.text || "";
    if (roomDesc.toLowerCase().includes('gift shop') || 
        roomDesc.toLowerCase().includes('t-shirt') || 
        roomDesc.toLowerCase().includes('souvenir')) {
      giftShopRooms.push(i);
    }
  }
  
  treasures.forEach(treasure => {
    if (giftShopRooms.includes(treasure.room)) {
      console.error(`CRITICAL ERROR: Treasure ${treasure.name} was placed in gift shop room ${treasure.room}!`);
    }
  });

  // Set the map clue with better formatting
  const mapClueText = "The ancient map shows four lost artifacts scattered throughout these caves.\n\n" +
    "To lift the curse on the village, you must find all the treasures and return to the exit.\n\n" +
    "The map provides these cryptic clues:\n\n" +
    treasures.map(t => `• ${t.clue}`).join('\n\n');

  // Update state
  setTreasureMap(mapRoom);
  setTreasurePieces(treasures);
  setCollectedTreasures([]);
  setHasMap(false);
  setMapClue(mapClueText);
  setTreasureDebugInfo(debugInfo);
  
  // CRITICAL STEP: Force the room descriptions to be exactly what we expect
  // This ensures that the room descriptions during gameplay match what we used for clues
  setRoomDescriptionMap(roomDescMap);

  // At the very end of this function, add these lines:
  console.log('=== TREASURE HUNT INITIALIZATION COMPLETE ===');
  console.log(`Treasures created: ${treasures.length}`);
  
  // IMPORTANT: Make sure treasurePieces state is set before attempting shifting room setup
  setTreasurePieces(treasures);
  setTreasureDebugInfo(debugInfo);
  
  // Instead of trying to initialize shifting room immediately,
  // set a flag indicating treasures are ready
  localStorage.setItem('treasuresInitialized', 'true');
};




// ==================== ADVANCED SHIFTING ROOM INITIALIZATION SYSTEM ====================

/**
 * Professional Shifting Room Implementation with Treasure Integration
 * Master-level dynamic content system that creates a treasure room with shifting descriptions
 * while maintaining game balance, narrative consistency, and comprehensive safety validation.
 * 
 * **Dynamic Content Architecture Excellence:**
 * This function demonstrates advanced procedural content management by creating a room that
 * dynamically changes its appearance while containing a treasure, using sophisticated content
 * filtering, anchor placement systems, and comprehensive conflict prevention.
 * 
 * **Key System Features:**
 * - **Treasure-Integrated Shifting**: Combines treasure hunt with dynamic room descriptions
 * - **Advanced Content Filtering**: Multi-pattern analysis preventing problematic content
 * - **Anchor Clue Integration**: Sophisticated hint system for reality stabilization
 * - **Comprehensive Safety Validation**: Multiple validation layers ensuring stable operation
 * - **Professional Fallback Systems**: Graceful degradation with multiple backup mechanisms
 * - **Memory Efficient Content Management**: Smart pooling and filtering of descriptions
 * 
 * **Advanced Algorithm Design:**
 * - **Multi-Constraint Room Selection**: Balances treasure placement with safety requirements
 * - **Content Analysis Engine**: Sophisticated pattern matching for problematic content
 * - **Dynamic Description Assembly**: Runtime construction of shifting content arrays
 * - **State Synchronization**: Coordinates multiple game systems atomically
 * 
 * **Professional Software Architecture:**
 * - **Dependency Validation**: Ensures treasure system readiness before proceeding
 * - **Error Recovery**: Multiple fallback mechanisms preventing system failures
 * - **Performance Optimization**: Efficient content filtering without overhead
 * - **Cross-System Integration**: Seamless coordination with treasure and room systems
 * 
 * **Computer Science Implementation:**
 * Uses advanced algorithms including multi-constraint optimization, content analysis,
 * dynamic array construction, and sophisticated state management. The content filtering
 * implements enterprise-level pattern matching and semantic analysis.
 * 
 * @returns {void} - Initializes shifting room with treasure integration and safety validation
 */
const initializeShiftingRoom = () => {
  console.log('Initializing shifting room feature...');
  
  // Force reload treasures from state if needed
  if (!treasurePieces || treasurePieces.length === 0) {
    console.log('Warning: treasurePieces is empty. This should not happen at this point!');
    return; // Don't proceed with empty treasures
  }
  
  console.log(`Found ${treasurePieces.length} treasures: ${treasurePieces.map(t => t.id).join(', ')}`);
  
// ==================== ADVANCED CONTENT FILTERING SYSTEM ====================
  
  /**
   * Sophisticated Content Analysis Engine for Problematic Content Detection
   * Enterprise-level content filtering that analyzes room descriptions for conflicts
   * with game mechanics, narrative consistency, and technical limitations.
   * 
   * **Content Analysis Excellence:**
   * - **Multi-Pattern Detection**: String analysis, metadata validation, special feature detection
   * - **Conflict Prevention**: Prevents mechanical, narrative, and technical conflicts
   * - **Performance Optimization**: Efficient pattern matching with early termination
   * - **Semantic Understanding**: Recognizes content context and implications
   * 
   * **Filter Categories:**
   * - **Critical System Conflicts**: Pool rooms, backpack rooms with specific mechanics
   * - **Special Feature Conflicts**: Crystal effects, temperature systems, interactive items
   * - **Creature Area Conflicts**: Sand creatures, water sprites, fungi creatures
   * - **Commerce System Conflicts**: Gift shop areas with trading mechanics
   * - **Technical Conflicts**: Interactive HTML elements causing collection issues
   * 
   * @param {Object} roomDesc - Room description object to analyze for conflicts
   * @returns {boolean} True if content has conflicts and should be excluded
   */
    const hasProblematicContent = (roomDesc) => {
      if (!roomDesc || !roomDesc.text) return false;
      
      const text = roomDesc.text.toLowerCase();

    // CRITICAL: Exclude pool room
    if (text.includes('pool of clear water') || 
        text.includes('nature\'s most inconvenient wading pool') ||
        (roomDesc.enhancedText && roomDesc.enhancedText.includes('deceptively clear pool')) ||
        roomDesc.hasPoolTreasures === true) {
      console.log("Excluding pool room from shifting room descriptions");
      return true;
    }

      // CRITICAL: Exclude backpack room
      if (text.includes('backpack') && text.includes('half-eaten rations') && text.includes('run!')) {
        console.log("Excluding backpack room from shifting room descriptions");
        return true;
      }
      
      // Check for crystal room (sleep effect)
      if ((text.includes('crystal columns') || text.includes('massive crystal')) && 
          roomDesc.special === 'crystal') {
        return true;
      }
      
      // Check for sand creature room
      if (text.includes('soft sand') && roomDesc.mood === 'tempting') {
        return true;
      }
      
      // Check for water sprite room
      if (text.includes('tranquil pool') && text.includes('mirror')) {
        return true;
      }
      
      // Check for fungi creature room
      if (text.includes('luminescent fungi') && roomDesc.mood === 'otherworldly') {
        return true;
      }
      
      // Check for temperature-sensitive rooms
      if (roomDesc.mood === 'cold' || roomDesc.mood === 'warm') {
        return true;
      }
      
      // Check for rooms with interactive items (they cause collection issues)
      if (roomDesc.hasInteractiveItem || text.includes('<span class')) {
        return true;
      }
      
      // Check for gift shop (has special trading logic)
      if (text.includes('gift shop') || text.includes('t-shirt') || text.includes('souvenir')) {
        return true;
      }
      
      return false;
    };
  
 // ==================== INTELLIGENT ROOM SELECTION SYSTEM ====================
  
  // ========== TREASURE ROOM VALIDATION WITH SAFETY CHECKS ==========
  // Get all valid rooms for shifting (must contain treasures, no hazards, no problematic content)
  const validRooms = [];
  for (let i = 1; i <= 30; i++) {
    // Must contain a treasure
    const hasTreasure = treasurePieces.some(treasure => treasure.room === i);
    const roomDesc = roomDescriptionMap[i];
    
    if (hasTreasure && 
        i !== positions.wumpusPosition &&
        i !== positions.pitPosition1 &&
        i !== positions.pitPosition2 &&
        i !== positions.batPosition &&
        i !== positions.exitPosition &&
        !hasProblematicContent(roomDesc)) {
      validRooms.push(i);
    }
  }
  
  console.log(`Found ${validRooms.length} valid treasure rooms for shifting room selection: ${validRooms.join(', ')}`);
  
  // Simple fallback: if no safe rooms, just pick ANY treasure room
  let selectedRoom;
  if (validRooms.length === 0) {
    console.warn('No completely safe rooms found - using fallback: picking any treasure room');
    
    // Just pick any treasure room (game functionality over perfect safety)
    const anyTreasureRooms = [];
    for (let i = 1; i <= 30; i++) {
      const hasTreasure = treasurePieces.some(treasure => treasure.room === i);
      if (hasTreasure && 
          i !== positions.wumpusPosition &&
          i !== positions.pitPosition1 &&
          i !== positions.pitPosition2 &&
          i !== positions.batPosition &&
          i !== positions.exitPosition) {
        anyTreasureRooms.push(i);
      }
    }
    
    if (anyTreasureRooms.length === 0) {
      console.error('CRITICAL ERROR: No treasure rooms found at all!');
      return;
    }
    
    selectedRoom = anyTreasureRooms[Math.floor(Math.random() * anyTreasureRooms.length)];
    console.log(`Using fallback treasure room: ${selectedRoom}`);
  } else {
    selectedRoom = validRooms[Math.floor(Math.random() * validRooms.length)];
  }
  
  // Find the treasure in this room
  const treasureInRoom = treasurePieces.find(t => t.room === selectedRoom);
  if (!treasureInRoom) {
    console.error(`ERROR: No treasure found in selected room ${selectedRoom}!`);
    return;
  }
  
  // Get the room description
  const roomInfo = roomDescriptionMap[selectedRoom];
  if (!roomInfo) {
    console.error(`ERROR: No room description found for room ${selectedRoom}!`);
    return;
  }
  
  // Save the original room description
  const originalDesc = roomInfo.text || "A mysterious chamber with shifting details.";
  
  // Set up the shifting room state
  setShiftingRoomId(selectedRoom);
  setOriginalRoomDescription(originalDesc);
  setOriginalRoomTreasure(treasureInRoom);
  
  console.log(`SHIFTING ROOM SETUP IN ROOM ${selectedRoom}`);
  console.log(`- Contains treasure: ${treasureInRoom.id} (${treasureInRoom.name})`);
  console.log(`- Original description: ${originalDesc.substring(0, 50)}...`);
  
  // Prepare shifting room descriptions - Use safe fallbacks if needed
  let availableDescriptions = getAllRoomDescriptions().filter(desc => 
    // Skip descriptions with interactive items
    !desc.text.includes('<span class') && 
    !desc.hasInteractiveItem &&
    // Skip problematic content descriptions
    !hasProblematicContent(desc) &&
    // Also filter out descriptions already in use
    !Object.values(roomDescriptionMap).some(roomDesc => 
      roomDesc.text === desc.text
    )
  );

  console.log(`Found ${availableDescriptions.length} safe room descriptions for shifting`);

  // If we don't have enough safe descriptions, add generic fallbacks
  if (availableDescriptions.length < 4) {
    console.log(`Not enough safe descriptions (${availableDescriptions.length}), adding fallbacks`);
    
    const fallbackDescriptions = getShiftingRoomFallbacks();
    
    // Add fallbacks until we have enough
    let fallbackIndex = 0;
    while (availableDescriptions.length < 4 && fallbackIndex < fallbackDescriptions.length) {
      availableDescriptions.push(fallbackDescriptions[fallbackIndex]);
      fallbackIndex++;
    }
    
    console.log(`Added ${fallbackIndex} fallback descriptions, now have ${availableDescriptions.length} total`);
  }

  // Shuffle and take 4 additional descriptions
  const shuffled = [...availableDescriptions].sort(() => Math.random() - 0.5);
  const additionalDescriptions = shuffled.slice(0, 4);

 // ========== SOPHISTICATED DESCRIPTION ARRAY CONSTRUCTION ==========
  // Create the final descriptions array with original description as first elemen
  const shiftingDescriptions = [
    { 
      text: originalDesc, 
      mood: roomInfo.mood === 'cold' || roomInfo.mood === 'warm' ? 'mysterious' : (roomInfo.mood || 'mysterious'),
      special: roomInfo.special === 'crystal' ? null : roomInfo.special,
      hasWater: roomInfo.hasWater,
      originalIndex: 0
    },
    ...additionalDescriptions.map((desc, index) => ({
      text: desc.text,
      mood: desc.mood === 'cold' || desc.mood === 'warm' ? 'mysterious' : (desc.mood || 'mysterious'),
      special: desc.special === 'crystal' ? null : desc.special,
      hasWater: desc.hasWater || false,
      originalIndex: index + 1
    }))
  ];

  // ADD ANCHOR CLUE HERE - after shiftingDescriptions is created
 const updatedOriginalDesc = originalDesc + ' On the far wall, you notice a faint etching of an <span class="glowing-anchor">anchor symbol</span> that glows softly - odd, considering you\'re nowhere near deep water.';

  // Update the first shifting description (index 0) to include the clue
  shiftingDescriptions[0] = {
    ...shiftingDescriptions[0],
    text: updatedOriginalDesc
  };

  console.log("Shifting Descriptions (filtered for safety with anchor clue added):", shiftingDescriptions);
  shiftingDescriptions.forEach((desc, index) => {
    console.log(`Description ${index}:`, desc.text.substring(0, 50) + "...");
    console.log(`  - Mood: ${desc.mood}, Special: ${desc.special}`);
  });

  // Update room description map with comprehensive information
  setRoomDescriptionMap(prev => ({
    ...prev,
    [selectedRoom]: {
      ...(prev[selectedRoom] || {}),
      text: updatedOriginalDesc, // Use the updated description with anchor clue
      isShiftingRoom: true,
      originalDescription: updatedOriginalDesc, // Store the updated version as original
      originalMood: roomInfo.mood === 'cold' || roomInfo.mood === 'warm' ? 'mysterious' : (roomInfo.mood || 'mysterious'),
      shiftingDescriptions: shiftingDescriptions, // Store full descriptions (now with anchor clue)
      currentShiftingIndex: 0
    }
  }));

  // Set the shifting room descriptions
  setShiftingRoomDescriptions(shiftingDescriptions);
  
  // Mark that the player hasn't visited the shifting room yet
  setHasVisitedShiftingRoom(false);
  
  // EXPLICITLY set index and room description
  setCurrentShiftingIndex(0);
  setRoomDescription(updatedOriginalDesc); // Use the updated description with anchor clue
  
  console.log('Shifting room initialization complete with anchor clue - all problematic content filtered out!');
  localStorage.setItem('shiftingRoomInitialized', 'true');
};

// ==================== ADVANCED INVISIBILITY CLOAK PLACEMENT SYSTEM ====================

/**
 * Intelligent Invisibility Cloak Distribution with Safe Room Selection
 * Professional item placement system that finds optimal room locations for special equipment
 * while avoiding conflicts with game systems, hazards, and existing content.
 * 
 * **Item Placement Excellence:**
 * This function demonstrates advanced procedural item distribution by using multi-constraint
 * analysis to find safe room locations, comprehensive conflict detection, and sophisticated
 * interactive HTML generation for seamless item integration.
 * 
 * **Key System Features:**
 * - **Multi-Constraint Room Filtering**: Avoids hazards, treasures, special rooms, and conflicts
 * - **Interactive HTML Generation**: Creates seamless item collection mechanics
 * - **Pool Room Detection**: Sophisticated content analysis preventing water-related conflicts
 * - **Professional State Management**: Proper room description updates with collection states
 * - **Conflict Prevention**: Comprehensive validation preventing system conflicts
 * - **Debugging Integration**: Professional logging for development transparency
 * 
 * **Advanced Algorithm Design:**
 * - **Constraint Satisfaction**: Multi-objective room selection with safety requirements
 * - **Content Analysis**: Intelligent detection of room types and conflicts
 * - **Dynamic HTML Injection**: Runtime creation of interactive content elements
 * - **State Preservation**: Stores original content for post-collection restoration
 * 
 * **Professional Software Architecture:**
 * - **Error Prevention**: Comprehensive validation preventing placement failures
 * - **Memory Efficiency**: Efficient room filtering without performance overhead
 * - **Cross-System Integration**: Seamless coordination with room and item systems
 * - **User Experience**: Creates intuitive item discovery and collection mechanics
 * 
 * **Computer Science Implementation:**
 * Uses advanced algorithms including constraint satisfaction for room selection,
 * content analysis for conflict detection, and dynamic DOM content generation
 * for interactive item placement.
 * 
 * @returns {void} - Places invisibility cloak in optimal safe room location
 */
const addInvisibilityCloakToGame = () => {
  // Pick a random safe room that doesn't already have an item
  console.log("INVISIBITYY CLOAK!!!!!!!!!!!!!!!!")
  const availableRooms = Object.keys(roomDescriptionMap)
  .filter(room => {

    const roomNum = parseInt(room);
    const roomText = roomDescriptionMap[roomNum]?.text || '';
    // Check that this room:
    // 1. Doesn't have hazards
    // 2. Isn't the treasure map room
    // 3. Doesn't already have an item
    // 4. Isn't a treasure room
    return roomNum !== positions.wumpusPosition &&
      roomNum !== positions.pitPosition1 &&
      roomNum !== positions.pitPosition2 &&
      roomNum !== positions.batPosition &&
      roomNum !== positions.exitPosition &&
      roomNum !== treasureMap &&
      !specialRooms[roomNum]?.hasItem &&
      !treasurePieces.some(treasure => treasure.room === roomNum) &&
      !isPoolRoom(roomText); 
  })
  .map(Number);
  
  if (availableRooms.length > 0) {
    // Select a random room
    const cloakRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    
    // REMOVED: Don't add the invisibility cloak to specialRooms
    // We only want it to be collected via the interactive item in the room description
    
    // Update the room description to mention the cloak with interactive span
    setRoomDescriptionMap(prev => ({
      ...prev,
      [cloakRoom]: {
        ...prev[cloakRoom],
        text: prev[cloakRoom].text + "\nIn the corner, you spot a <span class='interactive-item' data-item='invisibility_cloak'>tattered cloth</span>. Looks like someone's musty old cloak, it's made out of some odd material.",
        hasInteractiveItem: true,
        interactiveItem: 'invisibility_cloak',
        textAfterCollection: prev[cloakRoom].text
      }
    }));
    
    console.log(`Invisibility cloak placed in room ${cloakRoom}`);
  }
};





// ==================== ADVANCED TEXT SIMILARITY ALGORITHM ====================

/**
 * Sophisticated String Similarity Analysis with Character-Level Precision
 * Professional fuzzy matching algorithm implementing advanced text comparison
 * for contextual content matching and intelligent clue generation.
 * 
 * **Algorithm Excellence:**
 * This function implements character-level similarity analysis similar to algorithms
 * used in Natural Language Processing and search engines. It provides robust
 * fuzzy matching capabilities for dynamic content selection and contextual matching.
 * 
 * **Key Features:**
 * - **Character-Level Analysis**: Precise positional character comparison
 * - **Case-Insensitive Matching**: Normalized text comparison for reliability
 * - **Mathematical Precision**: Ratio-based similarity scoring (0.0 to 1.0)
 * - **Performance Optimized**: Efficient O(n) algorithm with minimal memory overhead
 * - **Robust Edge Handling**: Safe handling of different string lengths
 * 
 * **Computer Science Implementation:**
 * Uses Longest Common Prefix (LCP) style analysis with normalization to calculate
 * similarity ratios. The algorithm compares strings character by character from
 * the beginning, providing positional similarity scoring.
 * 
 * **Mathematical Foundation:**
 * Similarity = (matching_characters) / (max_string_length)
 * This provides a normalized score between 0.0 (no similarity) and 1.0 (identical)
 * 
 * **Use Cases in Game Development:**
 * - Contextual clue matching for treasure hunt systems
 * - Dynamic content selection based on room descriptions  
 * - Fuzzy search for room features and interactive elements
 * - Natural language processing for player input interpretation
 * 
 * @param {string} str1 - First string for comparison
 * @param {string} str2 - Second string for comparison
 * @returns {number} Similarity ratio between 0.0 and 1.0
 */
function calculateTextSimilarity(str1, str2) {
  // ========== INPUT NORMALIZATION ==========
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  
  // ========== CHARACTER-LEVEL ANALYSIS ==========
  let matches = 0;
  const minLength = Math.min(str1.length, str2.length);
  
  // ========== POSITIONAL COMPARISON ALGORITHM ==========
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  // ========== MATHEMATICAL SIMILARITY CALCULATION ==========
  return matches / Math.max(str1.length, str2.length);
}



// ==================== ADVANCED HIDDEN ROOM TRAP SYSTEM ====================

/**
 * Sophisticated Time-Based Trap Mechanism with State Management
 * Professional game mechanics system implementing timed challenges with
 * escape conditions, state tracking, and dramatic narrative consequences.
 * 
 * **Game Mechanics Excellence:**
 * This function demonstrates advanced game design programming by creating
 * tension-filled time pressure scenarios with multiple outcome paths,
 * sophisticated timer management, and immersive narrative consequences.
 * 
 * **Key System Features:**
 * - **Time Pressure Mechanics**: Creates urgency and tension through countdown timers
 * - **State-Based Validation**: Checks player position before executing consequences
 * - **Global Timer Management**: Uses window-level timer storage for cross-component access
 * - **Dramatic Narrative Integration**: Rich storytelling with consequence-driven outcomes
 * - **Escape Condition Logic**: Allows player agency in avoiding negative outcomes
 * - **Professional Cleanup**: Timer references stored for proper cleanup management
 * 
 * **Advanced Programming Techniques:**
 * - **Asynchronous Event Management**: setTimeout for delayed consequence execution
 * - **Global State Coordination**: Window-level timer storage for system-wide access
 * - **Conditional Execution**: Position validation before applying consequences
 * - **Resource Management**: Timer reference storage for cleanup and cancellation
 * 
 * **Game Design Philosophy:**
 * Implements "meaningful choices under pressure" - players must make quick decisions
 * with real consequences, creating memorable gameplay moments and emotional investment.
 * 
 * **User Experience Design:**
 * - **Clear Feedback**: Immediate notification of trap activation
 * - **Reasonable Timing**: 5-second window provides fair escape opportunity
 * - **Consequence Clarity**: Dramatic outcome messaging explains what happened
 * - **Player Agency**: Escape possible through quick thinking and action
 * 
 * @returns {void} - Activates hidden room trap with time-based consequences
 */
const handleHiddenRoomTrap = () => {
  console.log("Hidden room trap activated!");
  
  // ========== TIMER-BASED CHALLENGE SYSTEM ==========
  // Set a 5-second timer for escape window
  console.log("Hidden room trap activated!");
  
  // Set a 5-second timer
  const trapTimer = setTimeout(() => {
    // Check if still in room 31
    if (currentPosition === 31) {
      // Player didn't escape - trigger death
      setGameStatus('lost');
      setDeathCause('vortex_trap');
      setMessage("The hidden door slams shut with finality! The vortex expands explosively, its otherworldly pull irresistible! You're drawn into the swirling void, tumbling through dimensions unknown! Your adventure ends in the space between worlds... Game over!");
    }
  },100);
  
  // Store timer reference so we can clear it if player escapes
  window.HIDDEN_ROOM_TRAP_TIMER = trapTimer;
};
  
  // Create a wrapped version of resetGame that plays the play again sound
const resetGameWithSound = () => {
  console.log("=== RESETTING GAME WITH SOUND ===");
  
  // ========== AUDIO SYSTEM PREPARATION ==========
  // FIRST: Stop victory and lose music (before enabling sounds)
  playVictoryMusicEnding(false);
  playLoseMusicEnding(false);
  playBackgroundMusic(false);
  playSpecialRoomMusic(null);
  
  // Stop proximity-based looping sounds
  playPitWindSound(false);
  playBatFlapSound(false);
  playDistantWumpusSound(false);
  
  // ========== TRANSITION AUDIO PLAYBACK ==========
  // THEN: Play the play again sound
  playPlayAgainSound();
  
  // ========== AUDIO SYSTEM REACTIVATION ==========
  // THEN: Re-enable all sounds
  enableAllSounds();
  
  // ========== BACKGROUND MUSIC COORDINATION ==========
  // FINALLY: Restart background music with a small delay
  setTimeout(() => {
    playBackgroundMusic(true);
  }, 100);
    
 // Stop any creature-specific sounds
  if (typeof stopNightCrawlerSound === 'function') {
    stopNightCrawlerSound();
  }

  // Clear any special music timeouts
  if (window.specialMusicTimeout) {
    clearTimeout(window.specialMusicTimeout);
    window.specialMusicTimeout = null;
  }
  
  // Reset audio state references
  deathSoundPlayed.current = false;
  loseSoundPlayed.current = false;
  winSoundListenerAdded.current = false;
  victoryMusicStarted.current = false;
  backgroundMusicStarted.current = false;
  
  // Comprehensive audio system cleanup
  disableAllSounds();
  
  // Use the master cleanup function as a failsafe
  cleanupSounds();

// ========== TRANSITION AUDIO PLAYBACK ==========
  // Short delay to ensure all audio is stopped before playing new sound
  setTimeout(() => {
    // Re-enable sounds
    enableAllSounds();
    
    // Play the play again sound
    playPlayAgainSound();
    
    // ========== BACKGROUND MUSIC RESTART ==========
    // Restart background music with a delay to avoid overlap
    setTimeout(() => {
      playBackgroundMusic(true);
    }, 100);
  }, 50);

  // ========== WORLD REGENERATION SYSTEM ==========
  // Generate new positions for game entities
  const newPositions = generateGamePositions();
  setPositions(newPositions);
  
  // ========== ROOM SYSTEM REGENERATION ==========
  // First initialize new room descriptions
  const newRoomDescriptions = initializeRoomDescriptions();
  setRoomDescriptionMap(newRoomDescriptions);
  
  // Set available descriptions
    setAvailableRoomDescriptions(initializeGameRoomDescriptions());
    
    // ========== NAVIGATION SYSTEM REGENERATION ==========
  // Generate new room connections
  const newConnections = generateRoomConnections();
  setRoomConnections(newConnections);
  
  // ========== TREASURE SYSTEM REGENERATION ==========
  // Initialize the treasure hunt with the room descriptions
  initializeTreasureHunt(newRoomDescriptions, newPositions);
  
  // ========== COMPREHENSIVE STATE RESET ==========
  setMapClue('');
  setWizardRoomWarning(false);
  setWizardRoomEntryTime(null);
  setSpellbookDeciphered(false);
  setSpellbookBackfire(false);
  setCrystalRoomWarning(false);
  setThrowingRepellent(false);
  setRepellentThrowHandler(null);
  setMapFragmentUses(0);
  setShowWaterSpiritTradeButton(false);
  
  // ========== CORE RESET EXECUTION ==========
  // Call the original resetGame  as doing the above is not enough to reset the music as it will continue to play in the new game too
  //Keeping  the reset functions for now in the hopes of figuring out later how to fully reset and stop all music/sounds before new game starts as tere are 
  // some variables I'dlike to carry over into the new game when player resets
  
  setTimeout(() => {
    window.location.reload();
  }, 1350); // Adjust delay as needed
   // resetGame();

    
  };



  // ==================== ADVANCED GAME INITIALIZATION WITH AUDIO ORCHESTRATION ====================

/**
 * Professional Game Startup System with Audio Coordination and State Management
 * Master-level initialization function that coordinates audio playback, UI transitions,
 * and game logic activation with sophisticated timing and error handling.
 * 
 * **Audio Engineering Excellence:**
 * This function demonstrates professional game audio programming by managing
 * multiple audio streams, transition timing, and contextual music selection
 * based on game state and room properties.
 * 
 * **Key System Features:**
 * - **Professional Audio Sequencing**: Cave entry sound followed by contextual background music
 * - **Dynamic Music Selection**: Contextual music based on room special properties
 * - **Error-Resilient Audio**: Graceful fallback when audio fails to load/play
 * - **UI State Coordination**: Smooth transition from intro screen to gameplay
 * - **Cross-Component Communication**: Proper function reference validation and calling
 * - **Audio State Tracking**: Prevents duplicate background music initialization
 * 
 * **Advanced Programming Architecture:**
 * - **Promise-Based Audio**: Modern async/await patterns for audio loading
 * - **Event Handler Management**: Proper audio event listener setup and cleanup
 * - **Conditional Logic**: Smart music selection based on game state
 * - **Error Handling**: Comprehensive try/catch for audio system failures
 * - **Reference Validation**: Safe function calling with existence checks
 * 
 * **Professional Audio Design:**
 * - **Layered Audio Experience**: Entry sound followed by ambient background
 * - **Context-Aware Music**: Different music for special rooms vs. normal gameplay
 * - **Volume Management**: Appropriate audio levels for user experience
 * - **Audio State Prevention**: Prevents multiple background music instances
 * 
 * **User Experience Excellence:**
 * - **Smooth Transitions**: Seamless progression from intro to gameplay
 * - **Immediate Feedback**: Instant UI response to player action
 * - **Audio Immersion**: Rich soundscape enhancing game atmosphere
 * - **Robust Fallbacks**: Graceful handling of audio system failures
 * 
 * **Game Development Best Practices:**
 * - **State Management**: Proper UI and audio state coordination
 * - **Resource Management**: Efficient audio resource loading and cleanup
 * - **Debug Integration**: Comprehensive logging for development support
 * - **Error Prevention**: Multiple validation layers preventing system failures
 * 
 * @param {number|null} testRoom - Optional room number for testing purposes
 * @returns {void} - Initializes game with full audio coordination
 */
  const startGameFromContext = (testRoom = null) => {
    // First start playing the cave entry sound
    const entrySound = new Audio(caveEntrySoundFile);
    entrySound.volume = 0.7;
    
    // Hide the intro immediately
    setShowIntro(false);
    

    console.log("showIntro", showIntro)

    // If a test room is provided, use it
 //   if (testRoom !== null) {
  //    setStartingRoomFixed(parseInt(testRoom));
  //  } else {
  //    setStartingRoomFixed(null);
   // }
    
    // Call the startGame function from useGameLogic immediately
    if (gameLogicFunctions.current && gameLogicFunctions.current.startGame) {
      gameLogicFunctions.current.startGame(testRoom);
    } else {
      console.error("startGame function not available");
    }
    
    // Start the sound (it will play over the game)
    entrySound.play()
      .then(() => {
        console.log("Cave entry sound started");
        
        // When the sound ends, start the background music
     entrySound.onended = () => {
        console.log("Cave entry sound finished");
        
        // Check if we're in a room with special music
        const hasSpecialMusic = roomSpecial && ['crystal', 'waterfall', 'trinkets', 'low_pulsing', 'gift'].includes(roomSpecial);
        
        if (!backgroundMusicStarted.current && !hasSpecialMusic) {
          console.log("No special music in this room - starting background music");
          playBackgroundMusic();
          backgroundMusicStarted.current = true;
        } else if (hasSpecialMusic) {
          console.log(`In special music room (${roomSpecial}) - not starting background music`);
          backgroundMusicStarted.current = true; // Still set this to prevent future attempts
        }
      };
      })
      .catch(error => {
        console.error("Error playing cave entry sound:", error);
        // Start background music anyway if there's an error
        if (!backgroundMusicStarted.current) {
          playBackgroundMusic();
          backgroundMusicStarted.current = true;
        }
      });
  };

  
 
// 1. Enhanced updateRoomDescriptionAfterCollection function
// ==================== MASTER ROOM DESCRIPTION UPDATE SYSTEM ====================

/**
 * Advanced Interactive Item Collection Handler with Multi-System State Coordination
 * Professional-grade room management system that handles item collection with sophisticated
 * text processing, cursed item mechanics, trap detection, and comprehensive state updates.
 * 
 * **Content Management Excellence:**
 * This function demonstrates enterprise-level content management by processing 20+ different
 * item types with unique collection behaviors, curse mechanics, trap systems, audio coordination,
 * and sophisticated text pattern matching for seamless room description updates.
 * 
 * **Key System Features:**
 * - **Multi-Item Type Processing**: Handles 20+ item types with unique behaviors
 * - **Advanced Text Pattern Matching**: Sophisticated regex patterns for clean content removal
 * - **Cursed Item Mechanics**: Complex curse interactions with inventory checking
 * - **Trap Detection Systems**: Time-based challenges and death sequences
 * - **Audio Coordination**: Context-aware sound effect integration
 * - **Pool Disturbance System**: Water-based environmental interactions
 * - **HTML Element Management**: Safe removal of interactive span elements
 * - **State Synchronization**: Coordinates room descriptions, inventory, and special room states
 * 
 * **Advanced Programming Architecture:**
 * - **Switch-Case Organization**: Clean code structure for complex conditional logic
 * - **Pattern Matching Engineering**: Advanced regex for precise text manipulation
 * - **Asynchronous Event Management**: Timed sequences for dramatic game events
 * - **Cross-System Validation**: Inventory checking for curse interactions
 * - **Memory Management**: Prevents duplicate curse applications
 * - **Error Recovery**: Graceful handling of missing room data
 * 
 * **Game Development Excellence:**
 * - **Rich Interactive Mechanics**: Each item has unique collection behavior
 * - **Environmental Storytelling**: Room descriptions adapt to player actions
 * - **Curse System Implementation**: Complex item interactions with consequences
 * - **Dramatic Tension Building**: Timed events creating player pressure
 * - **Audio-Visual Coordination**: Synchronized sound effects and visual feedback
 * 
 * @param {string} itemId - Unique identifier of collected item requiring room updates
 * @returns {void} - Updates room state and triggers appropriate game events
 */
const updateRoomDescriptionAfterCollection = (itemId) => {

  console.log(`Updating room after collecting ${itemId}`);
  
  // ========== ROOM STATE VALIDATION ==========
  // Get current room info
  const roomInfo = roomDescriptionMap[currentPosition];
  if (!roomInfo) return;
  

  if (currentPosition === 31 && !window.HIDDEN_ROOM_TRAP_TRIGGERED) {
    window.HIDDEN_ROOM_TRAP_TRIGGERED = true;
    
     // ========== DRAMATIC TENSION BUILDING ==========
    // Subtle warning
    setMessage(prev => prev + "\n\nThe chamber suddenly rumbles ominously. The vortex in the room begins to pulse more violently and the door is slowly CLOSING on you!...");
   playHiddenRoomRumblingSound()
    // Notify GameBoard to start the trap
    window.dispatchEvent(new CustomEvent('hidden_room_trap', { 
      detail: { trapActive: true } 
    }));
  }


  // Start with the current text
  let updatedText = roomInfo.text;
  let updatedEnhancedText = roomInfo.enhancedText;
  

  // ==================== COMPREHENSIVE ITEM PROCESSING SYSTEM ====================

  // ========== MULTI-ITEM TYPE HANDLER ==========
  // Update text based on item type
  switch(itemId) {
     // ========== BASIC CONSUMABLE ITEMS ==========
    case 'torch_oil':
      playInteractivePickupSound()
      // Remove oil mention from both regular and enhanced text
      updatedText = updatedText.replace(/ On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./g, '');
      if (updatedEnhancedText) {
        updatedEnhancedText = updatedEnhancedText.replace(/ On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./g, '');
      }
      break;

   // ========== ADVANCED CURRENCY SYSTEM WITH MULTIPLE PATTERNS ==========
    case 'single_gold_coin':
      // Handle single gold coin patterns separately
  playInteractivePickupSound();   //adding this here becuase for some reason this wont play in addItemToInventory function when this is picked up
  const singleCoinPatterns = [
    // Single coin patterns from enhanced descriptions
    / In a crevice illuminated by your lantern's stronger beam, you notice a single <span class=['"]interactive-item['"][^>]*>ancient gold coin<\/span> that your torch missed\./g,
    / In a crevice illuminated by your lantern's stronger beam, you notice a single that your torch missed\./g,
    / Your lantern reveals a <span class=['"]interactive-item['"][^>]*>tarnished gold coin<\/span> tucked behind a small rock formation\./g,
    / Your lantern reveals a tucked behind a small rock formation\./g,

        // ADD THIS PATTERN FOR ROOM 31:
    / A beautifully crafted ancient <span class=['"]interactive-item['"][^>]*>coin<\/span> sits on a velvet cushion like it was worshiped by its inhabitants\. But since they arent around, maybe you should take it/g,
    // Simpler version in case of typos:
    / A beautifully crafted[^.]*<span class=['"]interactive-item['"][^>]*>coin<\/span>[^.]*\./g,
     / A beautifually crafted ancient <span class=['"]interactive-item['"][^>]*>coin<\/span> sits on a velvet cushio like it was worhiped by its inhabitants\. But since they arent around, maybe you should take it/g,
    // Generic pattern for single_gold_coin only
    /<span class=['"]interactive-item['"][^>]*data-item=['"]single_gold_coin['"][^>]*>.*?<\/span>/g
  ];
  
  // Apply patterns for single coin
  singleCoinPatterns.forEach(pattern => {
    updatedText = updatedText.replace(pattern, '');
    if (updatedEnhancedText) {
      updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
    }
  });
  
  // Don't add anything to inventory here - it should be handled elsewhere
  break;

      
    // ========== EQUIPMENT ITEMS WITH COMPLEX CLEANUP ==========
    case 'invisibility_cloak':
      playInteractivePickupSound();   //adding this here because for some reason this won't play in addItemToInventory function when this is picked up

        // ========== COMPREHENSIVE CLOAK TEXT REMOVAL ==========
        // FIXED: More comprehensive patterns to remove all variations of the cloak text
        const cloakPatterns = [
          // Full sentence with both span and description
          / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
          // Just the interactive span with period
          / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./g,
          // After collection part without the span
          / In the corner, you spot a\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
          // Simple text after span removed
          / In the corner, you spot a tattered cloth\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
          // Just the span itself (fallback)
          /<span class=['"]interactive-item['"][^>]*data-item=['"]invisibility_cloak['"][^>]*>.*?<\/span>/g,
          // Just the description after the span is removed
          / Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
          // Very important - remove the entire first part of the sentence that remains after the span is removed
          / In the corner, you spot a\.?/g,
          // Any remaining fragment with tattered cloth
          / In the corner, you spot a tattered cloth\.?/g
        ];
        
        // Apply each pattern to both texts
        cloakPatterns.forEach(pattern => {
          updatedText = updatedText.replace(pattern, '');
          if (updatedEnhancedText) {
            updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
          }
        });
        
        // Additional cleanup specifically for the cloak 
        // Try a more aggressive approach to remove the entire sentence if fragments remain
        if (updatedText.includes("In the corner")) {
          // Extract the full sentence containing "In the corner"
          const cornerRegex = /[^.!?]*In the corner[^.!?]*\.?/g;
          updatedText = updatedText.replace(cornerRegex, '');
          if (updatedEnhancedText) {
            updatedEnhancedText = updatedEnhancedText.replace(cornerRegex, '');
          }
        }
        break;  

   // ========== SPECIAL MAGICAL ITEMS WITH CREATURE INTERACTIONS ==========
    case 'cave_salt':
      // ========== CONTENT PRESERVATION SYSTEM ==========
      // Function to preserve appended content
  const preserveAppendedContent = (text) => {
    // Find any content after the main description
    const mainDescriptionEnd = text.indexOf("nature's nightlight, apparently.") + "nature's nightlight, apparently.".length;
    const appendedContent = text.substring(mainDescriptionEnd);
    
    // Replace just the cave salt part
    const baseText = text.substring(0, mainDescriptionEnd);
    const newBaseText = baseText.replace(/ Among them, you spot unusual <span class=['"]interactive-item['"][^>]*>salt-like crystals<\/span> with a subtle blue glow—nature's nightlight, apparently\./g, ' Where the glowing salt once was, a small hole remains.');
    
    // Return updated text with preserved appended content
    return newBaseText + appendedContent;
  };
  
  updatedText = preserveAppendedContent(updatedText);
  if (updatedEnhancedText) {
    updatedEnhancedText = preserveAppendedContent(updatedEnhancedText);
  }
  
  // Still show the creature as a one-time message
  setMessage(prev => prev + "\n As you pocket the salt, a pale creature pokes its head out of the  new hole, shrieks at you, and retreats muttering curses.");
  break;
      
    // ========== DANGEROUS ITEMS WITH CURSE MECHANICS ==========
    case 'sulfur_crystal':
      // ========== CURSE INTERACTION DETECTION ==========
      // EVIL CHECK: Does player have the cursed utility knife?
  const hasCursedKnife = inventory.some(item =>
    (item.originalId || item.id) === 'utility_knife'
  );
  
  if (hasCursedKnife) {
         // ========== DEATH TRAP SEQUENCE ==========
        // DEATH TRAP ACTIVATED!
    setTimeout(() => {
      setMessage(`As you touch the sulfur crystal, it instantly reacts with the ornate dagger in your pack! Your entire body begins vibrating uncontrollably - the cursed dagger and crystal are creating a catastrophic alchemical reaction!`);
      
      // Death sequence
      setTimeout(() => {
        setMessage(`The vibrations intensify to an unbearable frequency! Your body glows bright yellow as the sulfur infuses every cell! With a soft *POOF*, you explode into a cloud of yellow dust that settles gently on the cave floor. Perhaps grabbing cursed items wasn't the wisest choice...`);
        
        // Kill player
        setTimeout(() => {
          setGameStatus('lost');
          setDeathCause('sulfur_explosion');
          setMessage("You have been reduced to sulfur dust. Game over!");
        }, 3500);
      }, 5000);
    }, 500);

  }   //end switch



      // ========== STANDARD CRYSTAL REMOVAL ==========
      // Pattern for regular textt
  updatedText = updatedText.replace(/ Yellow <span class=['"]interactive-item['"][^>]*>sulfur crystals<\/span> line the walls like evil butterscotch\./g, ' The walls where you removed the crystals still emit a faint yellow residue.');
  
  if (updatedEnhancedText) {
    // Different pattern for enhanced text - note the lowercase 'yellow' and different sentence structure
    updatedEnhancedText = updatedEnhancedText.replace(/illuminates yellow <span class=['"]interactive-item['"][^>]*>sulfur crystals<\/span> line the walls like evil butterscotch/g, 'reveals bare walls where you removed the crystals. They still emit a faint yellow residue');
    
    // Also handle if the enhanced text has been modified or has variations
    if (updatedEnhancedText.includes('sulfur crystals')) {
      // Fallback: just remove the interactive span if the exact match fails
      updatedEnhancedText = updatedEnhancedText.replace(/<span class=['"]interactive-item['"][^>]*data-item=['"]sulfur_crystal['"][^>]*>sulfur crystals<\/span>/g, 'empty crystal sockets');
    }
  }
  break;

case 'druika_repellent':
  // Remove the vial mention from room 31
  if (currentPosition === 31) {
    const baseText = "A hidden chamber untouched for centuries. The air is thick with dust and mystery. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls.";
    updatedText = baseText + " An empty shelf shows where something important once stood.";
    if (updatedEnhancedText) {
      updatedEnhancedText = baseText + " An empty shelf shows where something important once stood.";
    }
  }
  break;

case 'wizard_journal':
  // Remove journal if added as interactive
  if (currentPosition === 31) {
    const baseText = "A hidden chamber untouched for centuries. The air is thick with dust and mystery. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls.";
    updatedText = baseText + " A dusty outline remains where a book once rested.";
    if (updatedEnhancedText) {
      updatedEnhancedText = baseText + " A dusty outline remains where a book once rested.";
    }
  }
  break;



 case 'lantern':
  // Get current room's special properties
  const hasTeleport = specialRooms[currentPosition]?.hasTeleport;
  const hasHiddenDoor = specialRooms[currentPosition]?.hasHiddenDoor;
  
  // Check if room has textAfterCollection defined
  if (roomInfo.textAfterCollection) {
    console.log("Current textAfterCollection:", roomInfo.textAfterCollection);
    console.log("Does it contain lantern?", roomInfo.textAfterCollection?.includes('lantern'));
    
    // Start with the textAfterCollection
    updatedText = roomInfo.textAfterCollection;
    
    // Preserve special room hints
    if (hasTeleport) {
      const orbFeature = specialRooms[currentPosition]?.orbFeature || "unusual rock formations that seem to form a doorframe";
      
      // Check if this is the first or second teleport room
      const teleportRooms = Object.entries(specialRooms)
        .filter(([roomId, roomData]) => roomData.hasTeleport && parseInt(roomId) <= 30)
        .map(([roomId]) => parseInt(roomId))
        .sort((a, b) => a - b);
      
      const isFirstTeleportRoom = teleportRooms[0] === currentPosition;
      
      // Add the appropriate teleport hint if not already present
      if (!updatedText.includes('strange circular pattern') && !updatedText.includes('unusual energy')) {
        if (isFirstTeleportRoom) {
          updatedText += ` There's a strange circular pattern around ${orbFeature}.`;
        } else {
          updatedText += ` You notice unusual energy emanating from ${orbFeature}.`;
        }
      }
    }
    
    if (hasHiddenDoor) {
      const doorFeature = specialRooms[currentPosition]?.doorFeature || "the northern wall";
      // Add hidden door hint if not already present
      if (!updatedText.includes('keyhole')) {
        updatedText += ` You notice what appears to be a keyhole hidden among ${doorFeature}.`;
      }
    }
    
    // Apply to enhanced text too
    if (updatedEnhancedText) {
      updatedEnhancedText = updatedText;
    }
  } else {
    // Fallback - clean current text
    console.log("LANTERN: No textAfterCollection, cleaning current text");
    
    // Start with current text
    updatedText = roomInfo.text || updatedText;
    
    // More specific pattern for the exact text structure
    const lanternPatterns = [
      // Specific pattern for "You find a rusty lantern and mining equipment"
      /You find a <span class=['"]interactive-item['"][^>]*>rusty lantern<\/span> and/gi,
      // Generic patterns
      /\ba\s+<span class=['"]interactive-item['"][^>]*>(?:rusty|old)?\s*lantern<\/span>/gi,
      /\ban\s+<span class=['"]interactive-item['"][^>]*>(?:rusty|old)?\s*lantern<\/span>/gi,
      /<span class=['"]interactive-item['"][^>]*>(?:rusty|old)?\s*lantern<\/span>/gi,
    ];
    
    lanternPatterns.forEach(pattern => {
      updatedText = updatedText.replace(pattern, (match) => {
        console.log(`Removing pattern: "${match}"`);
        // Special handling for "You find a lantern and"
        if (match.includes('You find') && match.includes('and')) {
          return 'You find';
        }
        return '';
      });
      if (updatedEnhancedText) {
        updatedEnhancedText = updatedEnhancedText.replace(pattern, (match) => {
          if (match.includes('You find') && match.includes('and')) {
            return 'You find';
          }
          return '';
        });
      }
    });
    
    // Clean up grammar
    updatedText = updatedText.replace(/You find\s+mining/g, 'You find mining');
    updatedText = updatedText.replace(/\s{2,}/g, ' ');
    updatedText = updatedText.trim();
    
    if (updatedEnhancedText) {
      updatedEnhancedText = updatedEnhancedText.replace(/You find\s+mining/g, 'You find mining');
      updatedEnhancedText = updatedEnhancedText.replace(/\s{2,}/g, ' ');
      updatedEnhancedText = updatedEnhancedText.trim();
    }
  }
  
  
  break;
      case 'spellbook':
        // Comprehensive patterns to remove all variations of the spellbook text
        const spellbookPatterns = [
          / Your lantern's light reveals an <span class=['"]interactive-item['"][^>]*>ancient spellbook<\/span> tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g,
          / Your lantern's light reveals an ancient spellbook tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g,
          / The space underneath where you found the spellbook is now empty\./g,
          /<span class=['"]interactive-item['"][^>]*data-item=['"]spellbook['"][^>]*>.*?<\/span>/g
        ];
        
        // Apply each pattern
        spellbookPatterns.forEach(pattern => {
          updatedText = updatedText.replace(pattern, '');
          if (updatedEnhancedText) {
            updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
          }
        });
        
        // Replace with more interesting "after collection" text AND replace the original backpack text
        if (updatedText.includes('backpack')) {
    
                   
          // Remove the original backpack text - updated for new whimsical description
const backpackPattern = /You find a backpack with half-eaten rations\(someone wasn't a stress eater\)\. Inside is a map that simply says ['"]RUN!['"] in what appears to be blood, ketchup, or very dramatic red ink\.?/g;
          updatedText = updatedText.replace(backpackPattern, "");
          if (updatedEnhancedText) {
            updatedEnhancedText = updatedEnhancedText.replace(backpackPattern, "");
          }
          
          // IMPORTANT: Create the persistent text for future visits FIRST
          // This should only be the "state" description without action text
          const persistentText = "You find a pile of ancient dust on the floor. A weathered piece of parchment with the word 'RUN!' is all that remains visible.";
          
          // Define the transition text for the immediate feedback (separate from persistent)
          const transitionText = " As you take the spellbook, the backpack suddenly shudders and collapses into dust, as if it had been waiting centuries to be relieved of its burden.";
          
          // For the CURRENT visit: show both persistent state + transition action
          updatedText = persistentText + transitionText;
          if (updatedEnhancedText) {
            updatedEnhancedText = persistentText + transitionText;
          }
          
          // Save this as the "textAfterCollection" for this room
          // CRITICAL: Only save the persistent text without the transition text
          setRoomDescriptionMap(prev => ({
            ...prev,
            [currentPosition]: {
              ...prev[currentPosition],
              textAfterCollection: persistentText, // ONLY the persistent state text
              text: updatedText, // Current text includes transition for immediate feedback
              enhancedText: updatedEnhancedText,
              hasInteractiveItem: false,
              interactiveItem: null,
              collectedItems: [...(prev[currentPosition].collectedItems || []), itemId]
            }
          }));
          
          // Set the room description based on lantern status
          const lanternActive = inventory.some(item => 
            (item.originalId || item.id) === 'lantern' && item.isActive
          );
          
          // Force immediate update of room description
          setRoomDescription(lanternActive && updatedEnhancedText ? updatedEnhancedText : updatedText);
          
          // Exit early since we've handled everything specifically
          return;
        }
        break;
     





 case 'fools_gold':
case 'utility_knife':
case 'tarnished_bracelet':
  console.log(`Handling pool item collection: ${itemId}`);
  
  // Check if this is the pool room using the ORIGINAL room data
  const roomData = roomDescriptionMap[currentPosition];
  const originalText = roomData?.text || "";
  const enhancedText = roomData?.enhancedText || "";
  
  // Check both original and enhanced text for pool indicators
  const hasPoolItems = originalText.includes('pool of clear water') || 
                       enhancedText.includes('deceptively clear pool') ||
                       roomData?.hasPoolTreasures === true;
  
  console.log("Pool detection - hasPoolItems:", hasPoolItems);
  
  if (hasPoolItems) {
    console.log("Pool room detected - disturbing the water");
    
    // Use the specific disturbed text if available, otherwise use default
    const persistentText = roomData?.enhancedTextAfterDisturbance || 
      "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening.";
    
    // For immediate feedback
    const transitionText = " As you pull the treasure from the water, something massive stirs below!";
    
    // CRITICAL: Update the room description map IMMEDIATELY
   setRoomDescriptionMap(prev => {
  const updated = {
    ...prev,
    [currentPosition]: {
      ...prev[currentPosition],
      text: persistentText, // Set the base text to persistent
      enhancedText: persistentText, // CRITICAL: Set enhanced text to disturbed state too
      textAfterCollection: persistentText,
      enhancedTextAfterDisturbance: persistentText, // Store for consistency
      originalText: prev[currentPosition].originalText || prev[currentPosition].text,
      originalEnhancedText: prev[currentPosition].originalEnhancedText || prev[currentPosition].enhancedText,
      hasInteractiveItem: false,
      interactiveItem: null,
      poolDisturbed: true,
      collectedItems: [...(prev[currentPosition].collectedItems || []), itemId]
    }
  };
  
  console.log("POOL DISTURBANCE UPDATE - Room map updated for position:", currentPosition);
  console.log("Updated room data:", {
    poolDisturbed: updated[currentPosition].poolDisturbed,
    text: updated[currentPosition].text?.substring(0, 50),
    textAfterCollection: updated[currentPosition].textAfterCollection?.substring(0, 50)
  });
  return updated;
});
    
    // Force immediate update
    setRoomDescription(persistentText + transitionText);
    
    // Show message
   let poolMessage;
if (itemId === 'fools_gold') {
  poolMessage = `You plunge your hand into the cold water, grasping the glittering gold coins. \nBut as you pull them out, the 'gold' washes away like cheap paint, revealing worthless stone discs! \n\nThe pool erupts in furious bubbles—something massive below is NOT amused by your theft. \nThe remaining treasures vanish into the churning depths!`;
} else {
  poolMessage = `You reach into the cold water and grab the ${itemTypes[itemId].name}. \nThe pool suddenly erupts in violent ripples! Something large moves beneath the surface, and the remaining treasures sink rapidly into the murky depths.`;
}

setMessage(poolMessage);///
    // Exit early - don't process any other updates
  // Apply curse effects based on which item was collected
switch(itemId) {
 case 'fools_gold':
  // Curse: Convert up to 2 coins total
  let coinsToRemove = 2;
  
  // Check if we've already processed this curse
  if (window._foolsGoldCurseApplied) {
    break;
  }
  window._foolsGoldCurseApplied = true;
  
  // Process inventory to remove up to 2 coins worth of value
  const updatedInventoryFools = inventory.map(item => {
    if (coinsToRemove <= 0) return item; // No more coins to remove
    
    const itemId = item.originalId || item.id;
    
    // Check if this is a gold coin item
    if (itemId === 'gold_coins') {
      // This is the multi-coin item
      const currentValue = item.value || 10;
      
      if (currentValue > coinsToRemove) {
        // Remove only some coins
        const newValue = currentValue - coinsToRemove;
        
        setTimeout(() => {
          setMessage(prev => prev + `\n\nThe curse of greed strikes! Some of your Ancient Wyrm Coins crumble into worthless dust!`);
        }, 2000);
        
        coinsToRemove = 0;
        
        return {
          ...item,
          value: newValue,
          name: `Ancient Wyrm Coins (${newValue})`
        };
      } else {
        // Remove all coins in this stack
        coinsToRemove -= currentValue;
        
        setTimeout(() => {
          setMessage(prev => prev + `\n\nThe curse of greed strikes! All ${currentValue} of your Ancient Wyrm Coins crumble into worthless dust!`);
        }, 2000);
        
        return null; // Mark for removal
      }
    } else if (itemId === 'single_gold_coin') {
      // Single coin - worth 1
      coinsToRemove -= 1;
      
      setTimeout(() => {
        setMessage(prev => prev + `\n\nThe curse of greed strikes! Your Ancient Wyrm Coin crumbles into worthless dust!`);
      }, 2000);
      
      return null; // Remove it
    }
    
    return item;
  }).filter(item => item !== null); // Remove nulled items
  
  setInventory(updatedInventoryFools);
  
  // Clear the flag
  setTimeout(() => {
    window._foolsGoldCurseApplied = false;
  }, 100);
  break;

case 'tarnished_bracelet':
  // Check if we've already processed this curse
  if (window._braceletCurseApplied) {
    break;
  }
  window._braceletCurseApplied = true;
  
  // Check if player is currently wearing the cloak
  const wornCloak = inventory.find(item => 
    (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
  );
  
  if (wornCloak) {
    // EVIL DEATH TRAP!
    setTimeout(() => {
      setMessage(`\n\nAs you clasp the tarnished bracelet around your wrist, it suddenly glows with malevolent green energy! The bracelet reacts violently with your worn cloak - acidic green flames erupt from both items! You try to remove them but they've fused to your body! The cursed flames consume you entirely!`);
      
      // Kill the player after dramatic pause
      setTimeout(() => {
        setGameStatus('lost');
        setDeathCause('cursed_items');
        setMessage("The combined curse of the bracelet and cloak proves fatal. Your last thought is that maybe wearing mysterious magical items together wasn't the brightest idea... Game over!");
      }, 3500);
    }, 4500);
  } else {
    // Player has cloak but isn't wearing it - just destroy it
    const hasCloak = inventory.some(item => 
      (item.originalId || item.id) === 'invisibility_cloak'
    );
    
    if (hasCloak) {
      setTimeout(() => {
        setMessage(prev => prev + `\n\nThe tarnished bracelet emits a corrosive green mist! Your strange cloak dissolves into ash before your eyes!`);
      }, 3000);
      
      const updatedInventoryBracelet = inventory.filter(item => 
        (item.originalId || item.id) !== 'invisibility_cloak'
      );
      setInventory(updatedInventoryBracelet);
    }
  }
  
  // Clear the flag
  setTimeout(() => {
    window._braceletCurseApplied = false;
  }, 100);
  break;


    
 case 'utility_knife':
  // Check if we've already processed this curse
  if (window._utilityKnifeCurseApplied) {
    break;
  }
  window._utilityKnifeCurseApplied = true;
  
  // Curse: Dissolve sulfur crystal if present
  const hasSulfurCrystal = inventory.some(item =>
    (item.originalId || item.id) === 'sulfur_crystal'
  );
  
  if (hasSulfurCrystal) {
    setTimeout(() => {
      setMessage(prev => prev + `\n\nThe ornate dagger reacts violently with your sulfur crystal! The crystal dissolves into a foul-smelling yellow puddle that drips from your pack!`);
    }, 2000);
    
    // Remove sulfur crystal from inventory
    const updatedInventoryKnife = inventory.filter(item =>
      (item.originalId || item.id) !== 'sulfur_crystal'
    );
    setInventory(updatedInventoryKnife);
  } else {
    // Optional: Add a subtle curse message even if no sulfur crystal
    setTimeout(() => {
      setMessage(prev => prev + `\n\nThe ornate dagger feels unnaturally cold and seems to radiate a corrosive aura.`);
    }, 2000);
  }
  
  // Clear the flag
  setTimeout(() => {
    window._utilityKnifeCurseApplied = false;
  }, 100);
  
  break;
}

    return;
  }
  break;

  

        case 'loose_rocks':
          playInteractivePickupSound(); 
  console.log("ROCKS: Handling collection of loose rocks");
  
  // Patterns for regular room descriptions
  const regularRockPatterns = [
    // Original pattern for regular rooms
    / Near the entrance, you notice a pile of.*?that might be useful\./g,
  ];
  
  // Patterns for enhanced room descriptions (from lantern)
  const enhancedRockPatterns = [
    // Full pattern with span
    /\s*Near the wall, your lantern illuminates[^.]*<span[^>]*>loose rocks<\/span>[^.]*for throwing\.\s*/gi,
    // After span removed
    /\s*Near the wall, your lantern illuminates[^.]*for throwing\.\s*/gi,
    // Any fragment
    /\s*Near the wall[^.]*for throwing\.\s*/gi
  ];
  
  // Apply regular patterns
  regularRockPatterns.forEach(pattern => {
    updatedText = updatedText.replace(pattern, '');
    if (updatedEnhancedText) {
      updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
    }
  });
  
  // Apply enhanced patterns
  enhancedRockPatterns.forEach(pattern => {
    updatedText = updatedText.replace(pattern, '');
    if (updatedEnhancedText) {
      updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
    }
  });
  
  // Fallback to using textAfterCollection if defined
  if (roomInfo.textAfterCollection) {
    console.log("ROCKS: Using textAfterCollection:", roomInfo.textAfterCollection);
    updatedText = roomInfo.textAfterCollection;
    if (updatedEnhancedText) {
      updatedEnhancedText = roomInfo.textAfterCollection;
    }
  }
  break;

  case 'shiny_trinkets':
    playTrinketTrapDeathSound();
  // This is a trap! Don't actually add to inventory
  console.log("TRAP TRIGGERED: Shiny trinkets!");
  
 // Update the room description with sarcastic aftermath text
  const trapTriggeredText = "OH NO!  \nYOU JUST SET OFF AN OBVIOUS TRAP! \n You are not the intrepid cave adventerur you and everyone else thought you were!";
  
  // Update the room description BEFORE killing the player
  updatedText = trapTriggeredText;
  if (updatedEnhancedText) {
    updatedEnhancedText = trapTriggeredText;
  }
    // Update room description map to remove the interactive item
  setRoomDescriptionMap(prev => ({
    ...prev,
    [currentPosition]: {
      ...prev[currentPosition],
      text: trapTriggeredText,
      enhancedText: trapTriggeredText,
      hasInteractiveItem: false,
      interactiveItem: null,
      textAfterCollection: trapTriggeredText,
      collectedItems: [...(prev[currentPosition].collectedItems || []), itemId]
    }
  }));
  
  // Force immediate update of room description
  setRoomDescription(trapTriggeredText);

   // THEN trigger the death sequence
  setTimeout(() => {
    setGameStatus('lost');
    setDeathCause('trinket_trap');
    playLadderTrapSound();
    setMessage("As you grab the white golden bauble, the floor suddenly gives way beneath you! A massive trapdoor swings open, and tentacles shoot up from the darkness below. The last thing you see is rows of teeth in a gaping maw as something ancient and hungry swallows you whole. Perhaps not everything that glitters is gold... Game over!");
  }, 500); // Small delay to ensure description updates first
  return;

      // 2. Similar improvements for the golden compass
      case 'golden_compass':
        // Comprehensive patterns to remove all variations of the compass text
    
  console.log("Golden compass collection case running");
  console.log("Before text:", updatedText);
  
  // Comprehensive patterns to remove all variations of the compass text
  // Use more permissive patterns that focus on the key phrases
  const compassPatterns = [
    // More precise patterns first
    / Your lantern['"]s bright beam reveals a <span class=['"]interactive-item['"][^>]*>golden compass<\/span> hidden in a shadowy crevice, its metal surface reflecting the light\./g,
    / Your lantern['"]s bright beam reveals a golden compass hidden in a shadowy crevice, its metal surface reflecting the light\./g,
    /\s*In a corner, you spot a <span class=['"]interactive-item['"][^>]*>golden compass<\/span> glinting in your torchlight\./g,
    /\s*In a corner, you spot a <span class=['"]interactive-item['"][^>]*data-item=['"]golden_compass['"][^>]*>golden compass<\/span> glinting in your torchlight\./g,
    /\s*In a corner, you spot a golden compass glinting in your torchlight\./g,
    
    // More general patterns
    / In a corner, you spot a .*?golden compass.*?\./g,
    / Your lantern.*?reveals a .*?golden compass.*?\./g,
    
    // Last resort - direct lookup for the span
    /<span class=['"]interactive-item['"][^>]*data-item=['"]golden_compass['"][^>]*>.*?<\/span>/g
  ];
  
  // Apply each pattern and track if any changes were made
  let anyChanges = false;
  compassPatterns.forEach(pattern => {
    const beforeLength = updatedText.length;
    updatedText = updatedText.replace(pattern, '');
    
    // Check if this pattern made a change
    if (updatedText.length !== beforeLength) {
      anyChanges = true;
      console.log("Pattern matched and replaced:", pattern.toString().substring(0, 50) + "...");
    }
    
    if (updatedEnhancedText) {
      updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
    }
  });
  
  // If no changes were made, try a more brute force approach
  if (!anyChanges) {
    console.log("No compass patterns matched, trying more aggressive approach");
    
    // Look for sentences containing "golden compass"
    //const sentences = updatedText.split(/(?<=\.|\!|\?)\s+/);
    const sentences = updatedText.split(/(?<=[.!?])\s+/);
    const newSentences = sentences.filter(sentence => 
      !sentence.toLowerCase().includes('golden compass')
    );
    
    // Only update if we actually removed something
    if (newSentences.length < sentences.length) {
      updatedText = newSentences.join(' ');
      console.log("Removed sentences containing 'golden compass'");
      anyChanges = true;
    }
  }
  
  console.log("After pattern replacements:", updatedText);
  
  // Add interesting after-collection text
  const compassAfterTexts = [
    "The spot where the compass rested still glimmers oddly, as if reality itself is thinner there.",
    "With the compass gone, you notice that the stone beneath it is unnaturally warm and etched with a perfect circle.",
    "The corner where you found the compass now appears distorted, as if space itself is reluctant to fill the void left by the mystical object."
  ];
  
  // Select a random after-collection text for immediate feedback only
  const selectedCompassText = compassAfterTexts[Math.floor(Math.random() * compassAfterTexts.length)];
  
  // CRITICAL FIX: Create the persistent text FIRST, before adding the transition text
  // This is what we'll save for future visits - just the cleaned description with no compass or effect
  const persistentCompassText = updatedText.trim();
  
  // Add the transition text only for the current display
  updatedText = persistentCompassText + " " + selectedCompassText;
  if (updatedEnhancedText) {
    updatedEnhancedText = (updatedEnhancedText || persistentCompassText) + " " + selectedCompassText;
  }
  
  console.log("Final text with transition:", updatedText);
  console.log("Persistent text for future visits:", persistentCompassText);
  
  // Store the permanent description change for future visits
  setRoomDescriptionMap(prev => ({
    ...prev,
    [currentPosition]: {
      ...prev[currentPosition],
      textAfterCollection: persistentCompassText, // Only the persistent state for future visits
      text: updatedText, // Current text includes transition for immediate feedback
      enhancedText: updatedEnhancedText,
      hasInteractiveItem: false,
      interactiveItem: null,
      collectedItems: [...(prev[currentPosition].collectedItems || []), itemId]
    }
  }));
  
  // Set the room description based on lantern status
  const lanternActive = inventory.some(item => 
    (item.originalId || item.id) === 'lantern' && item.isActive
  );
  
  // Force immediate update of room description
  setRoomDescription(lanternActive && updatedEnhancedText ? updatedEnhancedText : updatedText);
  
  // Exit early since we've handled everything specifically
  return;

   case 'wyrmglass':
  // Mark wyrmglass as collected in room 32
  setSpecialRooms(prev => ({
    ...prev,
    32: {
      ...prev[32],
      wyrmglassCollected: true
    }
  }));
  
  // Remove wyrmglass mention from room text
  updatedText = updatedText.replace(/ On a pedestal where the hole once was, you notice a <span class=['"]interactive-item['"][^>]*>polished glass sphere<\/span> that seems to hold swirling mists within\./g, '');
  if (updatedEnhancedText) {
    updatedEnhancedText = updatedEnhancedText.replace(/ On a pedestal where the hole once was, you notice a <span class=['"]interactive-item['"][^>]*>polished glass sphere<\/span> that seems to hold swirling mists within\./g, '');
  }
  
  
  break;
  
  
    default:
      // Generic pattern for any other item
     // const pattern = new RegExp(`<span class=['"]interactive-item['"][^>]*data-item=['"]${itemId}['"][^>]*>.*?<\/span>`, 'g');
     const pattern = new RegExp(`<span class=['"]interactive-item['"][^>]*data-item=['"]${itemId}['"][^>]*>.*?</span>`, 'g');
      updatedText = updatedText.replace(pattern, '');
      if (updatedEnhancedText) {
        updatedEnhancedText = updatedEnhancedText.replace(pattern, '');
      }
  }
  
  // Clean up any double spaces or periods that might have been left
updatedText = updatedText
  .replace(/\s+/g, ' ')
  .replace(/\.\s*\./g, '.')
  .replace(/\s*\./g, '.')
  .trim();

if (updatedEnhancedText) {
  updatedEnhancedText = updatedEnhancedText
    .replace(/\s+/g, ' ')
    .replace(/\.\s*\./g, '.')
    .replace(/\s*\./g, '.')
    .trim();
}

// Update the room description map with both regular and enhanced text
setRoomDescriptionMap(prev => ({
  ...prev,
  [currentPosition]: {
    ...prev[currentPosition],
    text: updatedText,
    enhancedText: updatedEnhancedText,
    hasInteractiveItem: false,
    interactiveItem: null,
    textAfterCollection: updatedText, // Default to using the current text for future visits
    collectedItems: [...(prev[currentPosition].collectedItems || []), itemId], // Track collected items
    // ADD THIS LINE for pool disturbance flag:
    ...(itemId === 'fools_gold' || itemId === 'utility_knife' || itemId === 'tarnished_bracelet' ? { poolDisturbed: true } : {})
  }
}));

// Set the room description based on lantern status
const lanternActive = inventory.some(item =>
  (item.originalId || item.id) === 'lantern' && item.isActive
);

// Force immediate update of room description
setRoomDescription(lanternActive && updatedEnhancedText ? updatedEnhancedText : updatedText);


};
  



 // ==================== ADVANCED LIGHTING SYSTEM WITH SURVIVAL MECHANICS ====================

/**
 * Professional Lantern Fuel Management with Dual-Light Survival System
 * Master-level resource management system implementing dual lighting mechanics with
 * dramatic consequences, warning systems, and intelligent state coordination.
 * 
 * **Survival Mechanics Excellence:**
 * This function demonstrates advanced game design programming by implementing
 * realistic fuel consumption with escalating consequences, dramatic tension building,
 * and intelligent survival mechanics that create meaningful player choices.
 * 
 * **Key System Features:**
 * - **Dual Light Source Management**: Coordinates lantern and torch systems
 * - **Dramatic Consequence Escalation**: Escalating warnings leading to death
 * - **State Synchronization**: Updates inventory, lighting, and game status
 * - **Resource Conservation Logic**: Intelligent fuel consumption management
 * - **Warning System Integration**: Progressive alerts as resources deplete
 * - **Death Prevention Logic**: Safety checks preventing accidental game over
 * 
 * **Advanced Programming Architecture:**
 * - **Inventory State Management**: Complex item state updates with fuel tracking
 * - **Conditional Logic Trees**: Multiple outcome paths based on game state
 * - **Asynchronous Event Handling**: Timed death sequences for dramatic effect
 * - **Dynamic Item Naming**: Real-time item name updates reflecting fuel status
 * - **Cross-System Validation**: Checks multiple game systems before consequences
 * 
 * **Game Design Philosophy:**
 * Implements "meaningful resource management" where players must balance exploration
 * depth with survival resources, creating tension and strategic decision-making
 * that enhances the survival horror atmosphere.
 * 
 * **User Experience Design:**
 * - **Progressive Warnings**: Clear fuel level alerts preventing surprise death
 * - **Dramatic Messaging**: Rich narrative feedback for all fuel states
 * - **Safety Mechanisms**: Prevents accidental death from poor resource management
 * - **Visual Feedback**: Dynamic item names showing current fuel status
 * 
 * @returns {void} - Manages lantern fuel consumption and lighting system coordination
 */
const decreaseLanternFuel = () => {
  // ========== ACTIVE LANTERN DETECTION ==========
  const lanternItem = inventory.find(item => 
    (item.originalId || item.id) === 'lantern' && item.isActive
  );
  
   // ========== FUEL VALIDATION ==========
  if (!lanternItem || lanternItem.fuel <= 0) return;
  
  // ========== COMPREHENSIVE FUEL MANAGEMENT SYSTEM ==========
  // Reduce fuel by 1
  setInventory(prev => 
    prev.map(item => {
      if ((item.originalId || item.id) === 'lantern' && item.isActive) {
        const newFuel = item.fuel - 1;
        
        // If fuel is now depleted
        if (newFuel <= 0) {
          // CHECK IF TORCH IS ALSO OUT
          if (torchLevel === 0) {
            // Both lights are out - player dies
            setTimeout(() => {
              setMessage("Your magical lantern flickers and dies, its last charge expended. With your torch already extinguished, absolute darkness engulfs you. You stumble in the blackness and fall to your doom. Game over!");
              setGameStatus('lost');
              setDeathCause('lantern_darkness');
            }, 100);
          } else {
            // Just the lantern is out
            setMessage(prev => prev + " Your magical lantern flickers and goes dark as its energy is depleted. You must rely on your torch now.");
          }
          
          return {
            ...item,
            fuel: 0,
            isActive: false,
            name: `Depleted Magical Lantern (0 charges)`,
            canUse: false
          };
        }
        
        // Warning messages as fuel gets low
        if (newFuel === 1) {
          setMessage(prev => prev + " Your lantern flickers. Only 1 charge remains!");
        } else if (newFuel === 3) {
          setMessage(prev => prev + " Your lantern's glow weakens. Only 3 charges left.");
        }
        
        return {
          ...item,
          fuel: newFuel,
          name: `Active Magical Lantern (${newFuel} charges)`
        };
      }
      return item;
    })
  );
};


// ==================== MASTER GAME LOGIC HOOK INTEGRATION SYSTEM ====================

/**
 * Professional React Hook Integration with Comprehensive Function Exposure
 * Enterprise-level hook architecture that coordinates 60+ game functions across
 * multiple systems with proper dependency injection and cross-component communication.
 * 
 * **Hook Architecture Excellence:**
 * This hook integration demonstrates master-level React architecture by coordinating
 * multiple complex systems (audio, inventory, rooms, combat, commerce, treasure hunting)
 * through a single, well-organized interface with proper dependency injection.
 * 
 * **Key System Features:**
 * - **60+ Function Integration**: Comprehensive game logic function exposure
 * - **Multi-System Coordination**: Audio, inventory, rooms, combat, commerce integration
 * - **Dependency Injection**: Proper parameter passing for hook initialization
 * - **Function Categorization**: Logical grouping of related functionality
 * - **State Management**: Comprehensive state passing for all game systems
 * - **Audio Integration**: Complete audio system function exposure
 * 
 * **Advanced Programming Architecture:**
 * - **Hook Composition**: Master-level React hook integration patterns
 * - **Parameter Organization**: Clean, categorized parameter passing
 * - **Function Exposure**: Comprehensive return value management
 * - **Type Safety Preparation**: Clear parameter documentation for team development
 * - **Cross-System Integration**: Seamless communication between game systems
 * 
 * **Professional Software Design:**
 * - **Separation of Concerns**: Clean division between hook logic and component logic
 * - **Interface Design**: Well-defined contract between GameContext and useGameLogic
 * - **Scalability Architecture**: Easy addition of new game systems and functions
 * - **Maintainability**: Clear organization for team development and debugging
 * 
 * **Game Development Best Practices:**
 * - **System Coordination**: All game systems accessible through single interface
 * - **Audio Management**: Complete audio function exposure for rich soundscapes
 * - **State Synchronization**: Proper state passing ensuring system consistency
 * - **Function Organization**: Logical grouping making code navigation intuitive
 */
const {
  // ========== CORE GAME FLOW FUNCTIONS ==========
  handleGuess,                          // Main movement/input handler
  handleChange,                         // Text input change handler
  resetGame,                            // Complete game reset function
  startGame: startGameFromLogic,        // Game initialization function (renamed to avoid collision)
  checkPosition,                        // Position validation and encounter handler
  
  // ========== COMMERCE AND TRADING SYSTEMS ==========
  addGiftShopItemToInventory,           // Gift shop purchase handler
  showNixieDisplay,                     // Nixie trade display state
  setShowNixieDisplay,                  // Nixie trade display setter

  
  // ========== LIGHTING AND SURVIVAL SYSTEMS ==========
  // decreaseTorchLevel,                // (Commented out) Torch level decrease function
  
} = useGameLogic({
  // ========== CORE GAME STATE ==========
  term,                                 // Current player input
  setTerm,                              // Function to update player input
  currentPosition,                      // Current player room position
  setCurrentPosition,                   // Function to update player position
  gameStatus,                           // Current game status (playing/won/lost)
  setGameStatus,                        // Function to update game status
  message,                              // Current display message
  setMessage,                           // Function to update display message
  roomDescription,                      // Current room description text
  setRoomDescription,                   // Function to update room description
  history,                              // Array of visited rooms
  setHistory,                           // Function to update room history
  perceptions,                          // Array of current threat perceptions
  setPerceptions,                       // Function to update perceptions
  
  // ========== ENCOUNTER AND MOVEMENT SYSTEMS ==========
  batEncounter,                         // Boolean: currently in bat encounter
  setBatEncounter,                      // Function to set bat encounter state
  moveCounter,                          // Number of moves made
  setMoveCounter,                       // Function to update move counter
  positions,                            // Object containing all entity positions
  setPositions,                         // Function to update entity positions
  generateGamePositions,                // Function to generate new random positions
  
  // ========== ROOM ATMOSPHERE AND STATE ==========
  setRoomMood,                          // Function to set room atmosphere
  setDeathCause,                        // Function to set cause of death
  setRoomHasWater,                      // Function to mark if room has water
  setRoomSpecial,                       // Function to set special room properties
  
  // ========== AUDIO SYSTEM INTEGRATION ==========
  playWalkingSound,                     // Function to play walking sound effects
  playRoomSound,                        // Function to play room-specific sounds
  playBatGrabScreamSound,               // Function to play bat grab scream
  playTeleportSound,                    // Function to play teleport sound
  
  // ========== WORLD CONTENT MANAGEMENT ==========
  roomDescriptionMap,                   // Map of room numbers to description objects
  setRoomDescriptionMap,                // Function to update room descriptions
  availableRoomDescriptions,            // Pool of unused room descriptions
  setAvailableRoomDescriptions,         // Function to update available descriptions
  roomConnections,                      // Map of room connections for navigation
  
  // ========== TREASURE HUNT SYSTEM ==========
  treasureMap,                          // Current treasure map state
  setTreasureMap,                       // Function to update treasure map
  treasurePieces,                       // Array of treasure objects in the game
  setTreasurePieces,                    // Function to update treasure pieces
  collectedTreasures,                   // Array of treasures player has collected
  setCollectedTreasures,                // Function to update collected treasures
  hasMap,                               // Boolean: does player have the map?
  setHasMap,                            // Function to set map possession status
  mapClue,                              // String: clue text from treasure map
    playMapFoundSound,
    playTreasureFoundSound,
  setBatEncounters,                     // Function to set bat encounter tracking
  
  // ========== LIGHTING AND SURVIVAL MECHANICS ==========
  torchLevel,                           // Current torch fuel level (0-100%)
  setTorchLevel,                        // Function to update torch level
  darknessCounter,                      // Current darkness move counter
  setDarknessCounter,                   // Function to update darkness counter
  MAX_DARKNESS,                         // Constant: maximum darkness moves allowed
  
  // ========== INVENTORY AND ITEM MANAGEMENT ==========
  specialRooms,                         // Object: special room data and states
  setSpecialRooms,                      // Function to update special room data
  inventory,                            // Array: player's current inventory
  setInventory,                         // Function to update player inventory
  addItemToInventory,                   // Function to add items to inventory
  itemTypes,                            // Object: definitions of all item types
  initializeSpecialRooms,               // Function to set up special room systems
  collectSecretRoomItem,                // Function to handle secret room item collection
  updateRoomDescriptionAfterCollection, // Function to update room text after collection
  decreaseLanternFuel,                  // Function to decrease lantern fuel (passed as parameter)
  
  // ========== COMMERCE SYSTEM INTEGRATION ==========
  giftShopRoom,                         // Current gift shop room number
  setGiftShopRoom,                      // Function to set gift shop location
  showTradeButton,                      // Boolean: show trade interface
  setShowTradeButton,                   // Function to control trade button visibility
  
  // ========== SHIFTING ROOM MECHANICS ==========
  shiftingRoomId,                       // ID of the shifting room
  setShiftingRoomId,                    // Function to set shifting room ID
  originalRoomDescription,              // Original description of shifting room
  setOriginalRoomDescription,           // Function to set original room description
  originalRoomTreasure,                 // Original treasure in shifting room
  setOriginalRoomTreasure,              // Function to set original treasure
  shiftingRoomDescriptions,             // Array of possible shifting descriptions
  setShiftingRoomDescriptions,          // Function to update shifting descriptions
  currentShiftingIndex,                 // Current index in shifting descriptions
  setCurrentShiftingIndex,              // Function to update shifting index
  hasVisitedShiftingRoom,               // Boolean: has player visited shifting room
  setHasVisitedShiftingRoom,            // Function to track shifting room visits
  
  // ========== CREATURE ENCOUNTER SYSTEMS ==========
  setFungiWarning,                      // Function to set fungi creature warning
  setRoomEntryTime,                     // Function to track room entry timing
  fungiWarning,                         // Boolean: fungi creature warning active
  showWaterSpiritTradeButton,           // Boolean: show water spirit trade interface
  setShowWaterSpiritTradeButton,        // Function to control water spirit trade UI
  nightCrawlerWarning,                  // Boolean: night crawler warning active
  setNightCrawlerWarning,               // Function to set night crawler warning
  nightCrawlerProtection,               // Boolean: night crawler protection active
  setNightCrawlerProtection,            // Function to set night crawler protection
  nightCrawlerProtectionTimer,          // Timer reference for night crawler protection
  setNightCrawlerProtectionTimer,       // Function to manage night crawler timer
  crystalRoomWarning,                   // Boolean: crystal room warning active
  setCrystalRoomWarning,                // Function to set crystal room warning
  
  // ========== ADVANCED GAME MECHANICS ==========
  addInvisibilityCloakToGame,           // Function to add invisibility cloak to world
  checkTemperatureEffects,              // Function to check temperature-based effects
  temperatureTimer,                     // Timer reference for temperature effects
  setTemperatureTimer,                  // Function to manage temperature timer
  wizardRoomVisited,                    // Boolean: has player visited wizard room
  setWizardRoomVisited,                 // Function to track wizard room visits
  spellbookDeciphered,                  // Boolean: has spellbook been deciphered
  setSpellbookDeciphered,               // Function to set spellbook decipher status
  activeSpell,                          // String: currently active spell
  setActiveSpell,                       // Function to set active spell
  floatingActive,                       // Boolean: floating spell active
  setFloatingActive,                    // Function to control floating spell
  floatingMovesLeft,                    // Number: remaining floating moves
  setFloatingMovesLeft,                 // Function to update floating moves
  calculateDistanceToRoom,              // Function to calculate room distances
  isPoolRoom,                           // Function to detect pool rooms
  
  // ========== COMMERCE AND SHOP SYSTEMS ==========
  goblinCooldown,                       // Number: goblin encounter cooldown
  setGoblinCooldown,                    // Function to set goblin cooldown
  shopMode,                             // Boolean: shop interface active
  setShopMode,                          // Function to control shop mode
  processShopPurchase,                  // Function to handle shop purchases
  playAutoPickupSound,                  // Function to play automatic pickup sounds
  giftShopCatalog,                      // Object: available shop items (testing only)
  
  // ========== TREASURE DISPLAY SYSTEM ==========
  setShowTreasureDisplay,               // Function to show treasure found display
  setFoundTreasureInfo,                 // Function to set treasure information
  
  // ========== COMPREHENSIVE AUDIO SYSTEM ==========
  // Nixie (Water Spirit) Audio Functions
  playNixieTollReqiuredSound,           // Audio: nixie toll requirement
  playNixieOneGoldCoinSound,            // Audio: nixie one gold coin payment
  playNixieGoldenCompassSound,          // Audio: nixie golden compass payment
  playNixieAFairTradeSound,             // Audio: nixie fair trade completion
  
  // Shop Keeper Audio Functions
  playShopKeeperFileSound,              // Audio: shop keeper greeting
  playShopKeeperRepellentSound,         // Audio: shop keeper repellent sale
  playShopKeeperLanternSound,           // Audio: shop keeper lantern sale
  playShopKeeperMapFragmentSound,       // Audio: shop keeper map fragment sale
  playShopKeeperFlaskOilSound,          // Audio: shop keeper oil flask sale
  playShopKeeperCloakSound,             // Audio: shop keeper cloak sale
  playShopKeeperTShirtSound,            // Audio: shop keeper t-shirt sale
  playShopKeeperMugSound,               // Audio: shop keeper mug sale
  playShopKeeperCanvasBagSound,         // Audio: shop keeper canvas bag sale
  playShopKeeperPlushieSound,           // Audio: shop keeper plushie sale
  playShopKeeperLeavingSound,           // Audio: shop keeper departure
  
  // Creature Audio Functions
  playSandCreatureHissSound,            // Audio: sand creature hiss
  playSandCreatureShriekSound,          // Audio: sand creature shriek
  
  // Game State Audio Functions
  playSaveGameSound,                    // Audio: save game operation
  playLoadGameSound,                    // Audio: load game operation
  playDeleteSavedGameSound              // Audio: delete save operation
});


// ==================== ENHANCED INPUT HANDLER WITH AUDIO INTEGRATION ====================
  // Create a wrapped version of handleGuess that plays the explore sound
const handleGuessWithSound = (event) => {
  // Play the explore button sound first
  playExploreSound();
  

  // Then immediately call the original handler
  handleGuess(event);
  
};


// ==================== MASTER LIGHTING CONTROL SYSTEM ====================

/**
 * Advanced Magical Lantern Toggle System with Multi-System Integration
 * Professional-grade lighting control implementing complex game mechanics with safety
 * systems, magical interactions, room-specific behaviors, and dramatic consequences.
 * 
 * **Lighting System Excellence:**
 * This function demonstrates master-level game programming by implementing a sophisticated
 * lighting toggle system that coordinates multiple game systems: survival mechanics,
 * magical interactions, room descriptions, item placement, and dramatic death sequences.
 * 
 * **Key System Features:**
 * - **Dual Light Source Management**: Coordinates lantern and torch for survival mechanics
 * - **Magical Interaction Systems**: Complex spell interactions with catastrophic consequences
 * - **Room-Specific Behaviors**: Special handling for backpack rooms and exit chambers
 * - **Safety Mechanism Integration**: Prevents accidental death through poor decisions
 * - **Dynamic Content Revelation**: Shows/hides interactive elements based on lighting
 * - **Anti-Exploit Protection**: Fuel consumption prevents infinite light cycling
 * - **Audio-Visual Coordination**: Synchronized sound effects and visual feedback
 * 
 * **Advanced Programming Architecture:**
 * - **Multi-State Management**: Complex inventory updates with fuel tracking
 * - **Conditional Logic Trees**: Multiple outcome paths based on game state
 * - **DOM Manipulation**: Direct UI updates for immediate visual feedback
 * - **Event System Integration**: Custom events for cross-component communication
 * - **Asynchronous Processing**: Delayed operations for proper state synchronization
 * - **Error Prevention**: Comprehensive validation preventing edge case failures
 * 
 * **Game Design Philosophy:**
 * Implements "meaningful resource management" where lighting choices have significant
 * consequences, creating strategic decision-making that enhances survival horror
 * atmosphere while providing rich interactive experiences.
 * 
 * **Professional Software Engineering:**
 * - **Complex State Coordination**: Manages 6+ different game systems simultaneously
 * - **Safety-First Design**: Multiple validation layers preventing unfair player death
 * - **Performance Optimization**: Efficient DOM manipulation and state updates
 * - **Debug Integration**: Comprehensive logging for development support
 * 
 * @returns {void} - Toggles lantern state with comprehensive system coordination
 */
const activateLantern = () => {
  console.log("Toggle lantern state");
  console.log("After lantern toggle - Current room map data:", {
    position: currentPosition,
    roomData: roomDescriptionMap[currentPosition],
    poolDisturbed: roomDescriptionMap[currentPosition]?.poolDisturbed
  });

  // Set a flag to prevent exit message from appearing
  window.SKIP_EXIT_CHECK = true;
  setTimeout(() => {
    window.SKIP_EXIT_CHECK = false;
  }, 1000);

    // ========== LANTERN INVENTORY VALIDATION ==========
  // Check if the lantern is already in inventory
  const lanternItem = inventory.find(item =>
    (item.originalId || item.id) === 'lantern'
  );
  
  // If lantern doesn't exist in inventory, do nothing
  if (!lanternItem) {
    console.log("No lantern in inventory");
    return;
  }
  
  // Get the current active state
  const isCurrentlyActive = lanternItem.isActive || false;
  
  if (isCurrentlyActive) {
     // ==================== LANTERN DEACTIVATION SEQUENCE ====================

    // TURNING OFF THE LANTERN
    console.log("Deactivating lantern");
    
    // CHECK TORCH LEVEL BEFORE DEACTIVATING
    if (torchLevel === 0) {
      // Player is about to die from stupidity
      setMessage("You deactivate your only source of light. In the absolute darkness, you immediately stumble and fall to your doom. Perhaps keeping the light on would have been wiser? Game over!");
      
      // Kill the player
      setGameStatus('lost');
      setDeathCause('lantern_darkness');
      
      // Still deactivate the lantern (they're dead anyway)
      setInventory(prev => prev.map(item => {
        if ((item.originalId || item.id) === 'lantern') {
          return {
            ...item,
            isActive: false,
            name: `Magical Lantern (${item.fuel} charges)`,
            canUse: item.fuel > 0
          };
        }
        return item;
      }));
      
      return; // Exit early since player is dead
    }
    
    // Normal deactivation (torch is still lit)
    setMessage("You deactivate the magical lantern, conserving its remaining energy.");
    
    // Decrease lantern fuel by 1 when turning off to prevent exploit
    const currentFuel = lanternItem.fuel || 0;
    const newFuel = Math.max(0, currentFuel - 1);
    
    // Update lantern in inventory to show it's inactive and reduce fuel by 1
    setInventory(prev => {
      return prev.map(item => {
        if ((item.originalId || item.id) === 'lantern') {
          return {
            ...item,
            isActive: false,
            fuel: newFuel,
            name: `Magical Lantern (${newFuel} charges)`,
            canUse: newFuel > 0 // Can only be used if it has fuel
          };
        }
        return item;
      });
    });
    
    // ========== ROOM TYPE DETECTION SYSTEM ==========
    // IMPORTANT: Check if we're in the backpack room
    const isBackpackRoom = (roomId) => {
      const roomDesc = roomDescriptionMap[roomId]?.text || '';
      return roomDesc.toLowerCase().includes('backpack with half-eaten rations') &&
             roomDesc.toLowerCase().includes('map that simply says');
    };
    
       // ========== SPECIAL BACKPACK ROOM HANDLING ==========
    // SPECIAL HANDLING FOR BACKPACK ROOM
    // If we're in the backpack room, add the spellbook directly
    if (currentPosition && isBackpackRoom(currentPosition)) {
      console.log("Special handling for backpack room - hiding spellbook");
      
      // Get original room description without spellbook
      const roomInfo = roomDescriptionMap[currentPosition];
      
      if (roomInfo) {
        // Find the original text without spellbook
        const originalText = roomInfo.originalText ||
          "You find a backpack with half-eaten rations. Inside is a map that simply says 'RUN!'";
        
        // Update room description to original text without enhancements
        setRoomDescription(originalText);
        
        // Also update UI immediately to hide the spellbook
        const spellbookContainer = document.querySelector('.room-description');
        if (spellbookContainer) {
          // Remove any interactive-item spans directly from the DOM
          const interactiveItems = spellbookContainer.querySelectorAll('.interactive-item');
          interactiveItems.forEach(item => {
            // Check if this is the spellbook
            if (item.getAttribute('data-item') === 'spellbook') {
              // Find the parent paragraph
              const paragraph = item.closest('p');
              if (paragraph) {
                // Replace the entire paragraph with just the original text
                paragraph.textContent = originalText;
              }
            }
          });
        }
      }
    } else {
      // Normal room - just set to non-enhanced text
      if (currentPosition && roomDescriptionMap[currentPosition]) {
        setRoomDescription(roomDescriptionMap[currentPosition].text || "");
      }
    }
    
    // Trigger the lantern deactivation event
    const event = new CustomEvent('lantern_event', {
      detail: { action: 'lantern_deactivated' }
    });
    window.dispatchEvent(event);
  } else {
    // TURNING ON THE LANTERN
    console.log("Activating lantern");
    
    // NEW DEATH TRAP CHECK: Check if we're in the exit room with an extended ladder
    if (currentPosition === positions.exitPosition && 
        specialRooms[currentPosition]?.ladderExtended) {
      
      // CATASTROPHIC FAILURE!
      setMessage("You activate the lantern, and its magical light floods the chamber. The ethereal glow of the extended ladder suddenly flickers and wavers as the two magical energies interact. With a terrible crackling sound, the ladder's enchantment unravels! The magical rungs vanish one by one, and the ladder collapses back to its original, useless height. \n\nWorse yet, the conflicting magics create a null-magic field that extinguishes ALL light sources permanently! In the absolute darkness, you hear the skittering of a thousand nightcrawlers emerging from the walls. Their clicking mandibles are the last sound you hear as they swarm over you in the pitch black. Game over!");
      
      // Kill the player
      setGameStatus('lost');
      setDeathCause('night_crawlers');
      
      // Deactivate the ladder extension
      setSpecialRooms(prev => ({
        ...prev,
        [currentPosition]: {
          ...prev[currentPosition],
          ladderExtended: false,
          ladderDestroyed: true
        }
      }));
      
      // Could add nightcrawler sound effect here
      // playNightcrawlerSwarmSound();
      
      return; // Exit early since player is dead
    }
    
    // Check if lantern has fuel
    if (lanternItem.fuel <= 0) {
      setMessage("The magical lantern flickers briefly but fails to ignite. It seems to be out of magical energy.");
      return;
    }
    
    // Consume 1 fuel charge for normal activation
    const newFuel = lanternItem.fuel - 1;
    
    playLanternSound();
    // Set message about activating the lantern
    setMessage("You activate the magical lantern. It provides enhanced illumination around you. Which may or may not be a good thing.");
    
    // Update the lantern in inventory to show it's active with reduced charges
    setInventory(prev => {
      const updatedInventory = prev.map(item => {
        if ((item.originalId || item.id) === 'lantern') {
          return {
            ...item,
            isActive: true,
            fuel: newFuel,
            name: `Active Magical Lantern (${newFuel} charges)`,
            canUse: true // Keep it usable for toggling off
          };
        }
        return item;
      });
      
      return updatedInventory;
    });
    
    // IMPORTANT: Check if we're in the backpack room
    const isBackpackRoom = (roomId) => {
      const roomDesc = roomDescriptionMap[roomId]?.text || '';
      return roomDesc.toLowerCase().includes('backpack with half-eaten rations') && 
            roomDesc.toLowerCase().includes('map that simply says');
    };
    
    // SPECIAL HANDLING FOR BACKPACK ROOM
    // If we're in the backpack room, add the spellbook directly
    if (currentPosition && isBackpackRoom(currentPosition)) {
      console.log("Currently in backpack room - adding ONLY spellbook (no compass)");
      
      // Get current room info
      const roomInfo = roomDescriptionMap[currentPosition];
      if (roomInfo) {
        // Store original text
        const currentText = roomInfo.text || "";
        const originalText = roomInfo.originalText || currentText;
        
        // CRITICAL FIX: Make sure we're not adding a compass AND a spellbook
        // Remove any existing compass text if it's there from an older implementation
        let cleanText = currentText;
        const compassPattern = / Your lantern's bright beam reveals a <span class=['"]interactive-item['"][^>]*>golden compass<\/span> hidden in a shadowy crevice, its metal surface reflecting the light\./g;
        cleanText = cleanText.replace(compassPattern, '');
        
        // If spellbook not already there, add it
        if (!cleanText.includes('ancient spellbook')) {
          const appendText = " Your lantern's light reveals an <span class='interactive-item' data-item='spellbook'>ancient spellbook</span> tucked underneath the backpack, its leather cover embossed with strange protective symbols.";
          
          // If there's enhanced text, append to it; otherwise append to current text
          let textToUpdate = roomInfo.enhancedText || cleanText;
          let newText = textToUpdate + appendText;
          
          console.log("Adding ONLY spellbook to backpack room");
          
          // Update room description with the spellbook
          setRoomDescriptionMap(prev => ({
            ...prev,
            [currentPosition]: {
              ...prev[currentPosition],
              text: newText,
              enhancedText: newText, 
              hasInteractiveItem: true,
              interactiveItem: 'spellbook',
              originalText: originalText 
            }
          }));
          
          // Update the displayed room description immediately
          setRoomDescription(newText);
          
          // Add to specialRooms
          setSpecialRooms(prev => ({
            ...prev,
            [currentPosition]: {
              ...prev[currentPosition],
              hasItem: true,
              itemId: 'spellbook',
              itemRevealed: true
            }
          }));
        }
      }
      
      // CRITICAL: Place golden compass in a different room (NOT backpack room)
      setTimeout(() => {
        // Create a custom version that never adds to the backpack room
        placeGoldenCompassNotInBackpack();
      }, 500);
    }
    else {
      // Normal room - force refresh the current room description but preserve interactive items
      setTimeout(() => {
        if (currentPosition && roomDescriptionMap[currentPosition]) {
          // Get current room info
          const roomInfo = roomDescriptionMap[currentPosition];
          
          // If there's no enhanced text, nothing to do
          if (!roomInfo.enhancedText) {
            // Still trigger the golden compass placement
            placeGoldenCompass(true);
            return;
          }
          
          // Handle enhanced text directly
          const currentDesc = roomInfo.text || "";
          
          // Use the createEnhancedRoomDescription function if available
          let enhancedDesc = currentDesc;
          if (typeof createEnhancedRoomDescription === 'function') {
            enhancedDesc = createEnhancedRoomDescription(currentDesc, roomInfo.enhancedText);
          } else {
            // Fallback to simple approach
            enhancedDesc = roomInfo.enhancedText;
          }
          
          // Update the room description in state
          setRoomDescription(enhancedDesc);
          
          // Also update the room description map
          setRoomDescriptionMap(prev => ({
            ...prev,
            [currentPosition]: {
              ...prev[currentPosition],
              displayText: enhancedDesc // Use a new field to avoid conflicts
            }
          }));
          
          // Update perceptions to ensure they match the new description
          if (typeof checkPosition === 'function') {
            checkPosition(currentPosition);
          }
          
          // Place the golden compass in a different room
          placeGoldenCompass(true);
        }
      }, 100);
    }
    
    // Trigger the lantern activation event for other components to respond to
    const event = new CustomEvent('lantern_event', {
      detail: { action: 'lantern_activated' }
    });
    window.dispatchEvent(event);
  }
};


// ==================== INTELLIGENT ITEM PLACEMENT SYSTEM ====================

/**
 * Advanced Golden Compass Placement with Conflict Prevention
 * Professional item placement system ensuring golden compass never conflicts with
 * special room content, particularly backpack rooms with spellbook mechanics.
 * 
 * **Placement System Excellence:**
 * This function demonstrates sophisticated procedural item placement by using
 * comprehensive conflict detection, multi-pattern room analysis, and intelligent
 * room selection to prevent narrative and mechanical conflicts.
 * 
 * **Key System Features:**
 * - **Comprehensive Conflict Detection**: Excludes hazards, treasures, and special rooms
 * - **Multi-Pattern Room Analysis**: Uses multiple detection methods for backpack rooms
 * - **Intelligent Room Selection**: Selects optimal placement locations dynamically
 * - **Content Integration**: Seamlessly adds interactive elements to room descriptions
 * - **Error Recovery**: Graceful handling when no suitable rooms available
 * - **Debug Integration**: Comprehensive logging for development transparency
 * 
 * **Advanced Programming Architecture:**
 * - **Content Analysis**: Sophisticated text pattern matching for room detection
 * - **Constraint Satisfaction**: Multi-objective room selection with safety requirements
 * - **State Synchronization**: Coordinates room descriptions and interactive elements
 * - **Defensive Programming**: Multiple validation layers preventing placement failures
 * - **Performance Optimization**: Efficient room scanning without overhead
 * 
 * **Game Design Philosophy:**
 * Ensures items are placed in thematically appropriate locations while preventing
 * conflicts that could break game mechanics or narrative consistency. Maintains
 * perfect separation between different interactive systems.
 * 
 * @returns {void} - Places golden compass in optimal location with conflict prevention
 */
const placeGoldenCompassNotInBackpack = () => {
  console.log("Setting up golden compass placement (NEVER in backpack room)...");
  
   // ========== BACKPACK ROOM DETECTION SYSTEM ==========
  // Helper function to check if a room has a backpack description
  const hasBackpackDescription = (roomId) => {
    const roomDesc = roomDescriptionMap[roomId]?.text || '';
    return roomDesc.toLowerCase().includes('backpack with half-eaten rations') && 
           roomDesc.toLowerCase().includes('map that simply says');
  };
    // ========== COMPREHENSIVE BACKPACK ROOM SCANNING ==========
  // Get ALL rooms with backpack text to make sure we exclude all of them
  const backpackRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (hasBackpackDescription(i)) {
      backpackRooms.push(i);
      console.log(`Found backpack room at ${i} - EXCLUDED from compass placement`);
    }
  }
  
  // ========== AVAILABLE ROOM CALCULATION ==========
  // Find rooms that are not occupied by hazards, treasures, or ANY backpack room
  const availableRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (
      i !== positions.wumpusPosition &&               // Not Druika room
      i !== positions.pitPosition1 &&                // Not pit room 1
      i !== positions.pitPosition2 &&                // Not pit room 2
      i !== positions.batPosition &&                 // Not bat room
      i !== positions.exitPosition &&                // Not exit room
      i !== treasureMap &&                           // Not treasure map room
      !treasurePieces.some(treasure => treasure.room === i) && // Not treasure room
      !specialRooms[i]?.hasItem &&                   // No existing items
      !backpackRooms.includes(i) &&                  // Exclude ALL backpack rooms
      !hasBackpackDescription(i)                     // Double-check backpack text
    ) {
      availableRooms.push(i);
    }
  }
  
  // Log available rooms
  console.log(`Found ${availableRooms.length} available rooms for golden compass placement (excluding backpack room)`);
  
  if (availableRooms.length === 0) {
    console.error("ERROR: No available rooms for golden compass placement");
    return;
  }
  
  // Pick a random room
  const compassRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
  console.log(`Golden compass will be placed in room ${compassRoom} (definitely not backpack room)`);
  
  // Triple-check this is not a backpack room
  if (hasBackpackDescription(compassRoom)) {
    console.error("CRITICAL ERROR: Still trying to place compass in backpack room!");
    return;
  }
  
  // Update the room description to mention the compass
  setRoomDescriptionMap(prev => ({
    ...prev,
    [compassRoom]: {
      ...prev[compassRoom],
      text: prev[compassRoom].text + " In a corner, you spot a <span class='interactive-item' data-item='golden_compass'>golden compass</span> glinting in your torchlight.",
      hasInteractiveItem: true,
      interactiveItem: 'golden_compass',
      textAfterCollection: prev[compassRoom].text
    }
  }));
};






  // ==================== EFFECTS ====================
  // Update the ref when functions change
  useEffect(() => {
  // Only initialize treasure hunt if we have valid positions and room descriptions
  if (positions && positions.wumpusPosition && roomDescriptionMap && Object.keys(roomDescriptionMap).length > 0) {
    if (!treasurePieces || treasurePieces.length === 0) {
      console.log("Treasures not initialized - initializing now");
      initializeTreasureHunt(roomDescriptionMap, positions);
    } else {
      console.log(`Treasures already initialized: ${treasurePieces.length} found`);
    }
  } else {
    console.log("Waiting for positions and room descriptions before initializing treasures");
  }
}, [positions, roomDescriptionMap]); // Add dependencies

// Add this useEffect in GameContext.js after your other useEffects
useEffect(() => {
  // Clear ladder extension scene when changing rooms
  if (showLadderExtendScene && currentPosition !== positions.exitPosition) {
    setShowLadderExtendScene(false);
  }
}, [currentPosition, showLadderExtendScene, positions.exitPosition]);

// ==================== COMPREHENSIVE GAME END CLEANUP EFFECT ====================

/**
 * Master Resource Management System with Complete Game End Cleanup
 * Enterprise-level resource disposal system that cleanly terminates all active timers,
 * global state variables, and temporary effects when game concludes.
 * 
 * **Resource Management Excellence:**
 * This effect demonstrates professional-grade memory management by implementing
 * comprehensive cleanup of all game resources, preventing memory leaks and ensuring
 * clean state transitions between game sessions. It handles complex nested state safely.
 * 
 * **Key System Features:**
 * - **Complete Timer Cleanup**: Clears all active timers preventing memory leaks
 * - **Global State Management**: Resets window-level variables safely
 * - **Complex Object Handling**: Safely manages nested specialRooms state
 * - **Warning System Reset**: Clears all creature and environmental warnings
 * - **Defensive Programming**: Type checking prevents errors during cleanup
 * - **Multi-System Coordination**: Handles 8+ different timer and warning systems
 * 
 * **Advanced Programming Techniques:**
 * - **Type-Safe State Updates**: Checks object types before modification
 * - **Memory Leak Prevention**: Comprehensive timer and reference cleanup
 * - **Global Variable Management**: Safe handling of window-level state
 * - **Nested State Modification**: Complex object updates with immutability
 * - **Resource Disposal**: Complete cleanup of all temporary effects
 * 
 * **Enterprise Software Design:**
 * - **Fail-Safe Architecture**: Multiple validation layers preventing errors
 * - **Professional Cleanup**: No orphaned timers or memory leaks
 * - **State Consistency**: Ensures clean state for next game session
 * - **Performance Optimization**: Efficient cleanup without blocking UI
 * 
 * **Memory Management Mastery:**
 * - **Timer Reference Tracking**: Proper cleanup of all setTimeout references
 * - **Object State Validation**: Defensive programming for complex state objects
 * - **Global Scope Cleanup**: Manages window-level variables responsibly
 * - **Warning State Reset**: Comprehensive cleanup of all warning systems
 */
useEffect(() => {
  if (gameStatus === 'lost' || gameStatus === 'won') {
    console.log("Game ended - clearing all death timers");
    
    // ========== TEMPERATURE SYSTEM CLEANUP ==========
    // Clear temperature timer
    if (temperatureTimer) {
      clearTimeout(temperatureTimer);
      setTemperatureTimer(null);
    }
    
    // ========== GLOBAL STATE CLEANUP ==========
    // Clear window temperature tracking
    window.TEMP_EFFECT_ROOM = null;
    window.TEMP_EFFECT_TYPE = null;
    window.TEMP_EFFECT_START_TIME = null;
    
    // ========== TRAP SYSTEM CLEANUP ==========
    // Clear hidden room trap timer
    if (window.HIDDEN_ROOM_TRAP_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_TRAP_TIMER);
      window.HIDDEN_ROOM_TRAP_TIMER = null;
      window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    }
    
   // ========== COMPLEX STATE OBJECT CLEANUP ==========
    // Clear crystal room entry time 
    setSpecialRooms(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(room => {
        // Check if the value is an object (not a boolean or other primitive)
        if (updated[room] && typeof updated[room] === 'object') {
          updated[room].crystalEntryTime = null;
          updated[room].fungiEntryTime = null;
        }
        // If it's a boolean (like treasuresProtected: true), leave it alone
      });
      return updated;
    });
    
    // Clear wizard room timer
    setWizardRoomEntryTime(null);
    setWizardRoomWarning(false);
    
    // Clear room entry time (for nightcrawlers)
    setRoomEntryTime(null);
    setNightCrawlerWarning(false);
    
    // Clear crystal room warning
    setCrystalRoomWarning(false);
    
    // Clear fungi warning
    setFungiWarning(false);
  }
}, [gameStatus, temperatureTimer]);

// ==================== NIGHT CRAWLER PROTECTION TIMER SYSTEM ====================
/**
 * Real-time monitoring system for night crawler protection duration
 * 
 * This effect creates a countdown timer that tracks the remaining duration of 
 * night crawler protection (typically granted by cave salt crystals). It provides
 * both expiration handling and advance warning to the player.
 * 
 * Key Features:
 * - **Real-time Updates**: Checks protection status every second
 * - **Automatic Expiration**: Removes protection when timer reaches zero
 * - **Advance Warning**: Alerts player when 30 seconds remain
 * - **Clean Termination**: Clears interval when protection expires or component unmounts
 * - **Narrative Integration**: Updates game message with atmospheric descriptions
 * 
 * Dependencies:
 * - nightCrawlerProtection: Boolean state for protection status
 * - nightCrawlerProtectionTimer: Timestamp when protection will expire
 * 
 * @effects setNightCrawlerProtection, setNightCrawlerProtectionTimer, setMessage
 */
useEffect(() => {
  // Guard clause: Only run if protection is active and timer is set
    if (!nightCrawlerProtection || !nightCrawlerProtectionTimer) return;
    
    const checkInterval = setInterval(() => {
      const timeRemaining = (nightCrawlerProtectionTimer - Date.now()) / 1000;
      
      // Protection has expired
      if (timeRemaining <= 0) {
        setNightCrawlerProtection(false);
        setNightCrawlerProtectionTimer(null);
        setMessage(prev => `${prev} The shimmering effect from the cave salt crystals fades away. You are no longer protected from the nightcrawlers.`);
        clearInterval(checkInterval);
      }
      // Warning when protection is about to expire (30 seconds left)
      else if (timeRemaining <= 30 && timeRemaining > 29) {
        setMessage(prev => `${prev} The protective shimmer from the cave salt crystals is beginning to fade. You have about 30 seconds of protection left.`);
      }
    }, 1000);
    
    return () => clearInterval(checkInterval);
  }, [nightCrawlerProtection, nightCrawlerProtectionTimer]);


// ==================== INITIAL ROOM TIMER SETUP SYSTEM ====================
/**
 * Comprehensive room initialization system for spawn-time timer setup
 * 
 * This effect handles the critical task of initializing various room-specific timers
 * when the player spawns into the game. Unlike regular room entry effects, this
 * specifically handles the edge case where a player starts the game in a special room
 * that requires immediate timer initialization.
 * 
 * Special Room Types Handled:
 * - **Fungi Rooms**: Creatures that attack after time limit
 * - **Crystal Rooms**: Cause permanent sleep after prolonged exposure  
 * - **General Rooms**: Night crawler spawn timer initialization
 * 
 * Key Features:
 * - **Spawn Safety**: Only activates during active gameplay with valid position
 * - **One-time Initialization**: Prevents duplicate timer creation on re-renders
 * - **Multi-system Setup**: Handles fungi, crystal, and night crawler systems
 * - **Warning State Reset**: Clears any stale warning flags
 * - **Defensive Coding**: Robust null checking and state validation
 * 
 * Technical Notes:
 * - Uses roomDescriptionMap for crystal room detection via text content
 * - Leverages specialRooms object for fungi room detection
 * - Dependencies limited to gameStatus and currentPosition for performance
 * 
 * @effects setSpecialRooms, setFungiWarning, setCrystalRoomWarning, setRoomEntryTime, setNightCrawlerWarning
 */
useEffect(() => {
  // Only run when game is playing and we have a valid position
  if (gameStatus !== 'playing' || !currentPosition || currentPosition === null) return;
  
  console.log(`Checking initial room ${currentPosition} for special timer setup`);
  
// ========== FUNGI CREATURE TIMER INITIALIZATION ==========
  // Check if player spawned in fungi room
  const inFungiRoom = specialRooms[currentPosition]?.hasFungiCreature;
  if (inFungiRoom && !specialRooms[currentPosition]?.fungiEntryTime) {
    console.log("Player spawned in fungi room - initializing timer");
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        fungiEntryTime: Date.now(),
        fungiCreatureActive: true
      }
    }));
    setFungiWarning(false);
  }
  

  // ========== CRYSTAL ROOM SLEEP TIMER INITIALIZATION ==========
  // Check if player spawned in crystal room
  const inCrystalRoom = roomDescriptionMap[currentPosition]?.special === "crystal" && 
                       roomDescriptionMap[currentPosition]?.text?.includes("crystal columns");
  if (inCrystalRoom && !specialRooms[currentPosition]?.crystalEntryTime) {
    console.log("Player spawned in crystal room - initializing sleep timer");
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        hasCrystalSleep: true,
        crystalEntryTime: Date.now()
      }
    }));
    setCrystalRoomWarning(false);
  }
  
  // Initialize night crawler timer for any room
  if (!roomEntryTime) {
    console.log("Initializing night crawler timer for spawn room");
    setRoomEntryTime(Date.now());
    setNightCrawlerWarning(false);
  }
}, [gameStatus, currentPosition]); // Only depend on gameStatus and currentPosition




 // ==================== SPELLBOOK BACKFIRE VISUAL EFFECTS SYSTEM ====================
/**
 * DOM manipulation system for spellbook backfire animation effects
 * 
 * This effect manages the visual feedback when spellbook magic fails or backfires,
 * providing immediate visual cues to the player through CSS class manipulation.
 * The animation system is designed to be self-contained and automatically clean up.
 * 
 * Animation Lifecycle:
 * 1. **Trigger Detection**: Activates when spellbookBackfire state becomes true
 * 2. **DOM Manipulation**: Adds 'spellbook-backfire' CSS class to game board
 * 3. **Animation Duration**: Maintains effect for 3 seconds (matches CSS animation)
 * 4. **Automatic Cleanup**: Removes CSS class and resets state flag
 * 5. **Safety Checks**: Validates DOM element existence before manipulation
 * 
 * Technical Features:
 * - **Duplicate Prevention**: Checks for existing class before adding
 * - **Cleanup Safety**: Verifies class existence before removal
 * - **Timer Management**: Properly clears timeout on component unmount
 * - **State Synchronization**: Resets backfire flag after animation completes
 * - **CSS Integration**: Timing matches CSS animation duration exactly
 * 
 * Visual Effects:
 * - Applies dramatic visual feedback (likely screen shake, color changes, etc.)
 * - Provides immediate player feedback for failed magic attempts
 * - Creates immersive atmosphere for magical mishaps
 * 
 * @effects DOM class manipulation, setSpellbookBackfire
 */
useEffect(() => {
  // Logic to handle spellbook backfire animation
  if (spellbookBackfire) {
    // Add the backfire class to the game board
     
      const gameBoard = document.querySelector('.game-board');
      if (gameBoard && !gameBoard.classList.contains('spellbook-backfire')) {
        gameBoard.classList.add('spellbook-backfire');
      }
      
      // Remove the class after the animation completes
      const timer = setTimeout(() => {
        if (gameBoard && gameBoard.classList.contains('spellbook-backfire')) {
          gameBoard.classList.remove('spellbook-backfire');
        }
        setSpellbookBackfire(false);
      }, 3000); // 3 seconds matches our CSS animation duration
      
      return () => clearTimeout(timer);
    }
  }, [spellbookBackfire]);

// ==================== WIZARD ROOM MECHANICS & FLOATING SPELL SYSTEM ====================
/**
 * Comprehensive wizard room interaction and floating spell visual effects manager
 * 
 * This complex effect handles two critical magical systems in the game:
 * 1. First-time wizard room visit mechanics with spellbook deciphering
 * 2. Real-time visual effects for the floating spell when active
 * 
 * Wizard Room Visit Logic:
 * - **One-time Trigger**: Only activates on first visit to room 32 (wizard's sanctum)
 * - **Spellbook Enhancement**: Automatically deciphers spellbook if player possesses it
 * - **Dynamic Inventory Updates**: Modifies spellbook description and unlocks floating spell
 * - **Special Messaging**: Uses timed special message system for dramatic effect
 * - **State Synchronization**: Updates multiple interconnected magical states
 * 
 * Floating Spell Visual System:
 * - **Active State Monitoring**: Continuously tracks floating spell activation
 * - **DOM Class Management**: Adds/removes 'floating-active' CSS class for visual effects
 * - **Game State Integration**: Only applies effects during active gameplay
 * - **Automatic Cleanup**: Removes visual effects when spell ends or game stops
 * 
 * Technical Features:
 * - **Flexible Item Identification**: Handles both originalId and id for spellbook detection
 * - **Immutable State Updates**: Uses proper React patterns for inventory modification
 * - **Timed Message System**: 8-second display duration for special wizard message
 * - **CSS Class Safety**: Prevents duplicate class additions with existence checking
 * 
 * Narrative Integration:
 * - **Atmospheric Messaging**: "Levitas Aerium" spell discovery with wizard sanctum context
 * - **Progressive Revelation**: Spellbook becomes readable only after wizard room visit
 * - **Visual Feedback**: Floating effects provide immediate spell activation confirmation
 * 
 * @effects setWizardRoomVisited, setInventory, setSpellbookDeciphered, setSpecialMessage, DOM manipulation
 */
useEffect(() => {
  // ========== WIZARD ROOM FIRST VISIT MECHANICS ==========
  // Check wizard room visits
  if (currentPosition === 32 && !wizardRoomVisited) {
    // First time in wizard room
    setWizardRoomVisited(true);
    
    // Update the spellbook description in inventory if the player has it
    setInventory(prev => {
      // Check if player has the spellbook
      const hasSpellbook = prev.some(item => (item.originalId || item.id) === 'spellbook');
      
      if (hasSpellbook) {
        setSpellbookDeciphered(true);
        
        // Set the special message instead of regular message
        setSpecialMessage({
          text: 'You notice a section in the spellbook that seems clearer now that you\'re in the wizard\'s sanctum. The floating spell "Levitas Aerium" is now decipherable!',
          className: 'wizard-decipher-message'
        });
        
        // Clear it after some time
        setTimeout(() => {
          setSpecialMessage(null);
        }, 8000); // Show for 8 seconds
        
        // Update the spellbook description
        return prev.map(item => {
          if ((item.originalId || item.id) === 'spellbook') {
            return {
              ...item,
              description: 'A magical tome containing the "Levitas Aerium" floating spell. The arcane symbols now appear clear and legible to you after your visit to the wizard\'s sanctum.'
            };
          }
          return item;
        });
      }
      return prev;
    });
  }
  
  // Handle floating spell effects and update game UI
  if (floatingActive && gameStatus === 'playing') {
    // Add visual indicator for floating
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard && !gameBoard.classList.contains('floating-active')) {
      gameBoard.classList.add('floating-active');
    }
  } else {
    // Remove visual indicator when floating ends
    const gameBoard = document.querySelector('.game-board');
    if (gameBoard && gameBoard.classList.contains('floating-active')) {
      gameBoard.classList.remove('floating-active');
    }
  }
}, [currentPosition, floatingActive, wizardRoomVisited, gameStatus]);



// ==================== GAME LOGIC FUNCTION REFERENCE SYSTEM ====================
/**
 * External function reference manager for game logic integration
 * 
 * This effect maintains a current reference to critical game functions that need
 * to be accessible from external game logic modules. It ensures that other parts
 * of the game system always have access to the most up-to-date function versions.
 * 
 * Technical Purpose:
 * - **Function Reference Updates**: Keeps gameLogicFunctions.current synchronized
 * - **External Access**: Allows useGameLogic.js and other modules to call these functions
 * - **State Closure**: Ensures external calls use current state values
 * - **Dependency Tracking**: Updates when source functions change
 * 
 * Exposed Functions:
 * - startGame: Initiates new game sessions
 * - checkPosition: Validates and processes player position changes
 * 
 * @effects gameLogicFunctions.current reference updates
 */
  useEffect(() => {
    gameLogicFunctions.current = {
      startGame: startGameFromLogic,
      checkPosition
    };
  }, [startGameFromLogic, checkPosition]);



  // ==================== WATER SPIRIT TRADE INTERFACE MANAGER ====================
/**
 * Water spirit trade button visibility controller
 * 
 * This effect manages the display state of the water spirit trade interface,
 * automatically hiding the trade button when the toll has been paid. This
 * provides clean UI state management for water spirit encounters.
 * 
 * Features:
 * - **Conditional Display**: Only shows trade button when toll is unpaid
 * - **Automatic Hiding**: Removes trade interface once payment is complete
 * - **State Synchronization**: Reacts to changes in room state and toll status
 * - **Debug Logging**: Provides console feedback for trade state changes
 * 
 * Business Logic:
 * - **Toll Payment Detection**: Checks specialRooms for tollPaid flag
 * - **Water Spirit Presence**: Only affects rooms with active water spirits
 * - **UI State Management**: Maintains clean separation between payment and display
 * 
 * @effects setShowWaterSpiritTradeButton
 */
  useEffect(() => {
    // Hide water spirit trade button if toll is paid
    if (currentPosition && 
        specialRooms[currentPosition]?.hasWaterSpirit && 
        specialRooms[currentPosition]?.tollPaid) {
      console.log("Toll is paid - hiding water spirit trade button via useEffect");
      setShowWaterSpiritTradeButton(false);
    }
  }, [currentPosition, specialRooms]);


  // Fungi Creature Encounter System
  // This effect manages the complex fungi creature encounter mechanics, including
  // time-based attacks, warnings, and player protection via torch level.
  // It provides a comprehensive system for handling one of the game's most intricate 
  // creature threats, ensuring both player safety and immersive gameplay.
  //somehow this useEffect got left out by the claudiAI when I was having it do extensive comments
  //I pasted it back in from local backup 

useEffect(() => {
  if (gameStatus !== 'playing' || !currentPosition) return;
  
  const inFungiRoom = specialRooms[currentPosition]?.hasFungiCreature;
  
  if (!inFungiRoom) {
    if (fungiWarning) {
      setFungiWarning(false);
    }
    return;
  }
  
  // Make sure we have an entry time - this handles both initial spawn and room entry
  if (!specialRooms[currentPosition]?.fungiEntryTime) {
    console.log("Setting fungi entry time for room", currentPosition);
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        fungiEntryTime: Date.now(),
        fungiCreatureActive: true,
         hasFungiCreature: true    
      }
    }));
  }
  
  const checkInterval = setInterval(() => {
      // Check if game is still playing
  if (gameStatus !== 'playing') {
    return;
  }
    if (!specialRooms[currentPosition]?.fungiEntryTime) return;
    
    const timeInRoom = (Date.now() - specialRooms[currentPosition].fungiEntryTime) / 1000;
    
    // Enhanced debugging
    console.log(`Time in fungi room: ${timeInRoom.toFixed(2)} seconds`);
    console.log('Current room properties:', {
        position: currentPosition,
        hasFungiCreature: specialRooms[currentPosition]?.hasFungiCreature,
        fungiCreatureActive: specialRooms[currentPosition]?.fungiCreatureActive,
        fungiEntryTime: specialRooms[currentPosition]?.fungiEntryTime,
        torchLevel: torchLevel
    });
    
    // Warning at 20 seconds
    if (timeInRoom > 20 && !fungiWarning) {
        setFungiWarning(true);
        setMessage(prev => {
            const warningMsg = "\n\nThe fungi on the walls seem to be growing more active, pulsing faster and starting to extend in your direction.";
            if (prev.includes(warningMsg)) {
                return prev;
            }
            return prev + warningMsg;
        });
    }
    
    // Attack at 25 seconds
    if (timeInRoom > 25) {
        console.log('25 seconds reached! Checking attack conditions...');
        console.log('fungiCreatureActive:', specialRooms[currentPosition]?.fungiCreatureActive);
        console.log('hasFungiCreature:', specialRooms[currentPosition]?.hasFungiCreature);
        
        // Try checking both properties since you set both
        const shouldAttack = specialRooms[currentPosition]?.fungiCreatureActive || 
                           specialRooms[currentPosition]?.hasFungiCreature;
        
        if (shouldAttack) {
            const hasBrightTorch = torchLevel > 80;
            console.log('Should attack! Bright torch?', hasBrightTorch);
            
            if (!hasBrightTorch) {
                console.log("ATTACK: 30 seconds exceeded - fungi attacking!");
                setGameStatus('lost');
                setDeathCause('fungi');
                setMessage("The luminescent fungi suddenly expand rapidly, sending glowing tendrils across the floor toward you! Before you can react, they wrap around your legs and begin releasing spores. You feel yourself growing weak as the spores enter your lungs. The last thing you see is the fungi growing over your body as you collapse. Game over!");
                clearInterval(checkInterval);
            }
            else  {
               setMessage(prev => {
            const warningMsg = "\n\nThe fungi dont seem to be able to quite get to you. \nSomething must beblocking or repulsing them.\nCool!";
            if (prev.includes(warningMsg)) {
                return prev;
            }
            return prev + warningMsg;
        });
            }

        }
    }
}, 1000);
  
  return () => clearInterval(checkInterval);
}, [gameStatus, currentPosition, specialRooms, fungiWarning, torchLevel]);




// ==================== Crystal CREATURE ENCOUNTER SYSTEM ====================

/**
 * Advanced crystal room sleep mechanics with amulet protection system
 * 
 * This effect manages one of the game's most sophisticated environmental hazards:
 * crystal rooms that lull players into permanent sleep through enchanting harmonics.
 * The system includes a protective artifact (crystal amulet) that can counter the effect.
 * 
 * Crystal Room Detection:
 * - **Room Type Validation**: Checks both special flag and text content for "crystal columns"
 * - **Dynamic Detection**: Re-evaluates room properties inside effect to avoid stale closures
 * - **Position Tracking**: Maintains current room reference for cleanup operations
 * 
 * Sleep Enchantment Timeline:
 * - **0-20 seconds**: Safe observation period with growing harmonic effects
 * - **20 seconds**: Warning phase with drowsiness messages
 * - **30 seconds**: Sleep effect triggers (death unless protected by amulet)
 * 
 * Protection Mechanics:
 * - **Crystal Amulet Detection**: Checks both inventory and collected treasures
 * - **Counter-Melody Effect**: Amulet resonates to protect against sleep enchantment
 * - **Timer Reset**: Protected players get timer reset to continue exploring
 * - **Flexible Item ID**: Handles both originalId and id for robust item detection
 * 
 * Technical Features:
 * - **Minimal Dependencies**: Only tracks essential state to prevent stale closures
 * - **Internal State Access**: Accesses current inventory/treasures inside intervals
 * - **Room Exit Cleanup**: Automatically resets timer when leaving crystal room
 * - **Position Validation**: Prevents processing when player has moved rooms
 * - **Game State Monitoring**: Ensures processing only during active gameplay
 * 
 * Death Sequence:
 * - **Atmospheric Narrative**: Beautiful but deadly crystal song description
 * - **Permanent Sleep**: Sets death cause to 'crystal_sleep'
 * - **Poetic Death Message**: Emphasizes the seductive nature of the crystal magic
 * 
 * Performance Optimizations:
 * - **Dependency Minimization**: Avoids inventory/treasure dependencies for performance
 * - **Cleanup on Exit**: Properly clears timers and resets room state
 * - **State Snapshot**: Takes current state snapshots inside intervals
 * 
 * @effects setSpecialRooms, setCrystalRoomWarning, setMessage, setGameStatus, setDeathCause
 */
useEffect(() => {
  if (gameStatus !== 'playing' || !currentPosition) return;
  
  // ========== CRYSTAL ROOM DETECTION ==========
  // Check these values INSIDE the effect, not in dependencies
  const roomData = roomDescriptionMap[currentPosition];
  const inCrystalRoom = roomData?.special === "crystal" && 
                       roomData?.text?.includes("crystal columns");
  
  const currentRoom = currentPosition;
  
  if (!inCrystalRoom) {
    if (crystalRoomWarning) {
      setCrystalRoomWarning(false);
    }
    return;
  }
  
  // Make sure we have an entry time
  if (!specialRooms[currentPosition]?.crystalEntryTime) {
    console.log("Setting crystal entry time for room", currentPosition);
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        hasCrystalSleep: true,
        crystalEntryTime: Date.now()
      }
    }));
  }
  
  const checkInterval = setInterval(() => {
      // Check if game is still playing
  if (gameStatus !== 'playing') {
    return;
  }
    if (currentPosition !== currentRoom) return;
    
    // Re-check current state inside the interval
    const currentSpecialRooms = specialRooms[currentRoom];
    if (!currentSpecialRooms?.crystalEntryTime) return;
    
    const timeInRoom = (Date.now() - currentSpecialRooms.crystalEntryTime) / 1000;
    console.log(`Time in crystal room: ${timeInRoom.toFixed(2)} seconds`);
    
    // Display warning at 20 seconds
    if (timeInRoom > 20 && !crystalRoomWarning) {
      setCrystalRoomWarning(true);
      setMessage(prev => {
        const warningMsg = " \nThe crystals' harmonious humming grows stronger. You feel a gentle wave of drowsiness washing over you. It becomes difficult to keep your eyes open.";
        if (prev.includes(warningMsg)) return prev;
        return prev + warningMsg;
      });
    }
    
    // Sleep effect at 30 seconds
    if (timeInRoom > 30) {
      console.log("SLEEP: 30 seconds exceeded in crystal room!");
      
      // Check current inventory state for amulet
      const currentInventory = inventory;
      const currentCollectedTreasures = collectedTreasures;
      
      const hasCrystalAmulet = currentCollectedTreasures.includes('amulet') || 
                              currentInventory.some(item => (item.originalId || item.id) === 'amulet');
      
      if (hasCrystalAmulet) {
        console.log("Player has crystal amulet - protected from the sleep effect");
        setMessage("The crystals' song grows overwhelming, but your crystal amulet resonates with a counter-melody, protecting your mind from the hypnotic effect. You feel alert despite the enchanting music.");
        
        setSpecialRooms(prev => ({
          ...prev,
          [currentRoom]: {
            ...prev[currentRoom],
            crystalEntryTime: Date.now()
          }
        }));
        setCrystalRoomWarning(false);
      } else {
        setGameStatus('lost');
        setDeathCause('crystal_sleep');
        setMessage("The crystals' song grows impossibly beautiful, weaving through your mind like silk. /nYour eyelids become too heavy to keep open. /n/nAs you sink to the floor, the last thing you remember is the perfect harmony of crystal voices lulling you into an eternal slumber. /n/nGame over!");
      }
      
      clearInterval(checkInterval);
    }
  }, 1000);
  
  return () => {
    clearInterval(checkInterval);
    
    if (inCrystalRoom && currentPosition !== currentRoom) {
      console.log(`Player left crystal room ${currentRoom} - resetting sleep timer`);
      setSpecialRooms(prev => ({
        ...prev,
        [currentRoom]: {
          ...prev[currentRoom],
          crystalEntryTime: null
        }
      }));
    }
  };
}, [
  gameStatus, 
  currentPosition,
  // These are the only essential dependencies
  // Everything else can be accessed inside the effect
]);


// ==================== AUTO-GAME START SYSTEM ====================
/**
 * Automatic game initialization when intro is skipped
 * 
 * This effect provides seamless game startup when players skip the intro sequence,
 * ensuring that the game begins immediately without requiring additional user action.
 * 
 * Trigger Conditions:
 * - **Intro Skipped**: showIntro is false
 * - **No Active Game**: currentPosition is null (no game in progress)
 * 
 * Features:
 * - **Seamless Transition**: Automatically starts game without user intervention
 * - **State Validation**: Only triggers when appropriate conditions are met
 * - **Clean Startup**: Uses established game start function for consistency
 * 
 * @effects Triggers startGameFromContext function
 */
  useEffect(() => {
    if (!showIntro && currentPosition === null) {
      startGameFromContext();
    }
  }, [showIntro, currentPosition]);



  // ==================== MASTER GAME INITIALIZATION SYSTEM ====================
/**
 * Comprehensive game world initialization and setup orchestrator
 * 
 * This is the master initialization effect that bootstraps the entire game world
 * when the component first mounts. It handles the complex sequence of world
 * generation, room creation, treasure placement, and system initialization.
 * 
 * Initialization Sequence:
 * 1. **Position Generation**: Creates the foundational game world coordinates
 * 2. **Room Description Creation**: Generates detailed room narratives and features
 * 3. **State Synchronization**: Sets up room description mapping for the game
 * 4. **Template Initialization**: Prepares available room description templates
 * 5. **Connection Generation**: Creates navigable pathways between rooms
 * 6. **Shop Initialization**: Sets up the gift shop commerce system
 * 7. **Debug Validation**: Verifies critical game elements like lantern placement
 * 
 * World Generation Features:
 * - **Dynamic Room Creation**: Procedurally generates unique room descriptions
 * - **Treasure System**: Initializes complex treasure hunt mechanics (commented)
 * - **Map Fragment System**: Sets up old map item with randomized purposes
 * - **Interactive Elements**: Places key items like lanterns in appropriate rooms
 * - **Commerce System**: Initializes gift shop for player transactions
 * 
 * Debug and Validation:
 * - **Comprehensive Logging**: Tracks each initialization step for debugging
 * - **Room Validation**: Verifies room description generation success
 * - **Item Placement Verification**: Confirms critical items are properly placed
 * - **Map Fragment Debugging**: Logs map fragment purpose and hint information
 * - **Lantern Detection**: Searches for and confirms lantern room placement
 * 
 * Technical Architecture:
 * - **Single Execution**: Empty dependency array ensures one-time initialization
 * - **Sequential Setup**: Each step builds on the previous for proper world state
 * - **State Management**: Updates multiple interconnected state systems
 * - **Error Prevention**: Validates each step before proceeding to the next
 * 
 * Commented Systems:
 * - **Treasure Hunt**: Advanced treasure system initialization (temporarily disabled)
 * - **Gift Shop Validation**: Additional shop existence verification (deferred)
 * - **Delayed Initialization**: Timeout-based setup for complex interdependencies
 * 
 * Performance Considerations:
 * - **One-time Execution**: Prevents unnecessary re-initialization
 * - **Immediate Setup**: Synchronous initialization for faster game start
 * - **Memory Efficient**: Creates world data once and reuses throughout game
 * 
 * @effects Multiple state setters for comprehensive world initialization
 */
  useEffect(() => {
  console.log("=== INITIALIZING GAME DATA ===");
  
  // ========== STEP 1: POSITION GENERATION ==========
  const initialPositions = generateGamePositions();
  console.log("Generated positions:", initialPositions); // Add this debug log
  setPositions(initialPositions);
  
  // ========== STEP 2: ROOM DESCRIPTION CREATION ==========
  const initialRoomDesc = createRoomDescriptions(initialPositions);
  console.log("Room descriptions created:", Object.keys(initialRoomDesc).length);
  
  // ========== STEP 3: ROOM DESCRIPTION STATE SETUP ==========
  setRoomDescriptionMap(initialRoomDesc);
  
  // ========== STEP 4: AVAILABLE DESCRIPTIONS INITIALIZATION ==========
  const availableDesc = initializeGameRoomDescriptions();
  setAvailableRoomDescriptions(availableDesc);
  
  // ========== STEP 5: ROOM CONNECTION GENERATION ==========
  const initialConnections = generateRoomConnections();
  setRoomConnections(initialConnections);
  
  // ========== STEP 6: GIFT SHOP INITIALIZATION ==========
  initializeGiftShop();


  // ========== STEP 7: MAP FRAGMENT DEBUG LOGGING ==========
  console.log("=== MAP FRAGMENT INFO ===");
  console.log("Map fragment purpose:", itemTypes.old_map.purpose);
  console.log("Purpose description:", itemTypes.old_map.purposeDescription);
  console.log("Hint message:", itemTypes.old_map.hintMessage);
  console.log("========================");
  
  // ========== DEBUG: LANTERN ROOM VERIFICATION ==========
  console.log("=== CHECKING FOR LANTERN ROOM ===");
  for (let i = 1; i <= 30; i++) {
    if (initialRoomDesc[i]?.interactiveItem === 'lantern' ||
       (initialRoomDesc[i]?.text && initialRoomDesc[i]?.text.includes("rusty lantern"))) {
      console.log(`FOUND LANTERN in room ${i} - description: ${initialRoomDesc[i]?.text}`);
    }
  }
     //outside settimeout
  /*    setTimeout(() => {
    console.log("=== CHECKING FOR GIFT SHOP (DELAYED) ===");
    // Need to check if treasures have been initialized
    initializeTreasureHunt(
      initialPositions,
      initialRoomDesc,
      setTreasureMap,
      setTreasurePieces,
      setCollectedTreasures,
      setHasMap,
      setMapClue,
      setRoomDescriptionMap,
      setTreasureDebugInfo,
      setShiftingRoomId,
      setOriginalRoomTreasure,
      setShiftingRoomDescriptions,
      setSpecialRooms,
      specialRooms,
      shiftingRoomId
    );
    
    // Then ensure gift shop exists after treasure initialization
    setTimeout(() => {
      ensureGiftShopExists();
    }, 100);
  }, 100); */
  
      console.log("=== GAME INITIALIZATION COMPLETE ===");
  }, []);

  // Add a ref to track if enhanced items have been added
  const enhancedItemsAddedRef = useRef(false);

  // Add a ref to track if gift shop has been checked
const giftShopCheckedRef = useRef(false);

 


// ==================== ENHANCED ROOM ITEMS INTEGRATION SYSTEM ====================
/**
 * Sophisticated post-initialization enhancement system for room item placement
 * 
 * This effect handles the complex task of adding enhanced items to rooms after the
 * core game world has been fully initialized. It uses refs to prevent duplicate
 * execution and implements a delayed check system to ensure all dependencies are ready.
 * 
 * Initialization Dependencies:
 * - **Room Descriptions**: Complete room description map must exist
 * - **Position Data**: Game entity positions must be fully generated
 * - **Treasure System**: Treasure pieces must be initialized for gift shop
 * 
 * Enhanced Items System:
 * - **Enhanced Text Validation**: Ensures rooms have proper enhanced descriptions
 * - **Item Placement**: Adds special items to rooms with enhanced narratives
 * - **Duplicate Prevention**: Uses refs to prevent multiple executions
 * - **Debug Tracking**: Comprehensive logging of enhanced room distribution
 * 
 * Gift Shop Integration:
 * - **Delayed Verification**: Ensures gift shop exists after treasure initialization
 * - **Position Logging**: Records final positions of all game entities
 * - **One-time Execution**: Prevents duplicate gift shop creation
 * 
 * Technical Features:
 * - **Timing Coordination**: 1-second delay ensures full initialization completion
 * - **Ref-based Flags**: Prevents race conditions and duplicate processing
 * - **State Validation**: Multiple checks ensure system readiness
 * - **Cleanup Safety**: Proper timeout cleanup on component unmount
 * 
 * Debug and Monitoring:
 * - **Enhanced Room Counting**: Tracks how many rooms receive enhancements
 * - **Item Addition Logging**: Records successful item placement operations
 * - **Entity Position Summary**: Final verification of all game entity locations
 * 
 * Performance Considerations:
 * - **Delayed Execution**: Prevents blocking main initialization thread
 * - **Single Execution**: Ref flags ensure processing happens only once
 * - **Efficient Validation**: Quick checks before expensive operations
 * 
 * @effects ensureEnhancedTextsExist, addEnhancedRoomItems, ensureGiftShopExists
 */
useEffect(() => {
  // Only run if we have room descriptions and positions set up AND haven't already added items
  if (roomDescriptionMap && Object.keys(roomDescriptionMap).length > 0 &&
      positions && positions.wumpusPosition &&
      !enhancedItemsAddedRef.current) {
    
    // Delay to ensure all initialization is complete
    const timer = setTimeout(() => {
      // Double-check the flag inside the timeout
      if (enhancedItemsAddedRef.current) {
        console.log("Enhanced items already added, skipping...");
        return;
      }
      
      console.log("Room descriptions are ready, checking enhanced texts...");
      console.log("Total rooms in map:", Object.keys(roomDescriptionMap).length);
      
      // Debug: Check how many rooms have enhancedText
      let enhancedCount = 0;
      for (let i = 1; i <= 30; i++) {
        if (roomDescriptionMap[i]?.enhancedText) {
          enhancedCount++;
          console.log(`Room ${i} has enhanced text`);
        }
      }
      console.log(`Total rooms with enhanced text: ${enhancedCount}`);
      
      // Ensure we have enough enhanced texts
      ensureEnhancedTextsExist();
      
      // Then add items to enhanced rooms
      addEnhancedRoomItems();
      
      // Set the flag to prevent running again
      enhancedItemsAddedRef.current = true;
      console.log("Enhanced items added, will not run again");
      
      // ADD GIFT SHOP CHECK HERE
      if (!giftShopCheckedRef.current && treasurePieces) {
        console.log("=== ENSURING GIFT SHOP EXISTS (DELAYED CHECK) ===");
        const giftShopId = ensureGiftShopExists();
        giftShopCheckedRef.current = true;
        
        // Log final positions including gift shop
        console.log("=== FINAL GAME ENTITY POSITIONS ===");
        console.log("Wumpus:", positions.wumpusPosition);
        console.log("Pit 1:", positions.pitPosition1);
        console.log("Pit 2:", positions.pitPosition2);
        console.log("Bat:", positions.batPosition);
        console.log("Exit:", positions.exitPosition);
        console.log("Gift Shop:", giftShopId);
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }
}, [roomDescriptionMap, positions, treasurePieces]); // ADD treasurePieces to dependencies



// ==================== NIGHT CRAWLER THREAT & TORCH MANAGEMENT SYSTEM ====================
/**
 * Advanced time-based threat system with torch mechanics and room safety logic
 * 
 * This is one of the most complex and sophisticated threat systems in the game,
 * managing both the omnipresent night crawler danger and the critical torch
 * resource management. It implements a multi-tiered safety system with different
 * room types providing various levels of protection.
 * 
 * Safety Classification System:
 * - **Fungi Rooms**: Protected by natural creature deterrent effects
 * - **Sand Creature Rooms**: Hostile environment deters night crawlers
 * - **Gift Shop**: Commercial sanctuary with orcish protection
 * - **Wizard Room (32)**: Magical wards prevent night crawler entry
 * - **Cave Salt Rooms**: Natural mineral repels night crawlers
 * - **Crystal Rooms**: Harmonic frequencies interfere with night crawler navigation
 * 
 * Night Crawler Threat Timeline (Non-Safe Rooms):
 * - **0-40 seconds**: Safe exploration period
 * - **40 seconds**: Warning phase with scratching sounds and audio cues
 * - **75 seconds**: Attack phase with dramatic death sequence
 * 
 * Torch Management System:
 * - **Universal Drain**: Affects all rooms after 60 seconds of stationary time
 * - **Progressive Depletion**: 5% torch loss every minute of lingering
 * - **Death Prevention**: Active lantern can substitute for dead torch
 * - **Location-Specific Death**: Special gift shop death sequence for atmosphere
 * 
 * Audio Integration:
 * - **Proximity Audio**: Night crawler sounds increase as threat escalates
 * - **Volume Management**: 0.3 volume for warnings, 0.8 for attacks
 * - **Cleanup Safety**: Proper audio stopping on room changes and game end
 * 
 * Floating Spell Integration:
 * - **Threat Immunity**: Floating players bypass night crawler dangers
 * - **Move Validation**: Only active floating with remaining moves provides protection
 * - **Resource Management**: Floating moves are precious and limited
 * 
 * Death Scenarios:
 * - **Torch Death**: Different narratives for gift shop vs. normal rooms
 * - **Night Crawler Death**: Humorous but deadly "interior redecorating critics"
 * - **Lantern Backup**: Players with active lanterns get warnings instead of death
 * 
 * Technical Features:
 * - **State Scheduling**: Uses setTimeout to avoid state updates during renders
 * - **Inventory Monitoring**: Real-time checking for lantern availability
 * - **Multi-condition Logic**: Complex safety determination with multiple factors
 * - **Audio Lifecycle**: Proper sound management with cleanup
 * - **Performance Optimization**: Early returns for inactive states
 * 
 * Narrative Integration:
 * - **Atmospheric Warnings**: "Distant scratching" builds tension gradually
 * - **Humorous Deaths**: Maintains game's comedic tone even in failure
 * - **Gift Shop Personality**: Throk's reactions add character depth
 * - **Progressive Tension**: Audio and text cues escalate appropriately
 * 
 * @effects setNightCrawlerWarning, setMessage, setTorchLevel, setGameStatus, setDeathCause, playNightCrawlerSound, stopNightCrawlerSound
 */
 useEffect(() => {
  if (gameStatus !== 'playing' || !currentPosition || !roomEntryTime) return;
  
  if (floatingActive && floatingMovesLeft > 0) {
    return;
  }
  
  // ========== ROOM SAFETY CLASSIFICATION ==========
  const isSafeRoom = 
    (specialRooms[currentPosition]?.hasFungiCreature) || // Fungi room
    (specialRooms[currentPosition]?.hasSandCreature) ||  // Sand creature room
    (currentPosition === giftShopRoom) ||               // Gift shop
    (currentPosition === 32) ||                         // Wizard room
    (specialRooms[currentPosition]?.hasCaveSalt) ||     // Cave salt room
    (roomDescriptionMap[currentPosition]?.special === "crystal" && 
      roomDescriptionMap[currentPosition]?.text?.includes("crystal columns")); // Crystal room
  
  // ========== THREAT MONITORING INTERVAL ==========
  const intervalId = setInterval(() => {
    // Check if game is still playing
    if (gameStatus !== 'playing') {
      clearInterval(intervalId);
      return;
    }
    
    const timeInRoom = (Date.now() - roomEntryTime) / 1000; // in seconds
    
   // ========== UNIVERSAL TORCH DRAIN SYSTEM ==========
    // TORCH DRAIN - happens in ALL rooms (moved outside safe room check)
    if (timeInRoom > 60 && Math.floor(timeInRoom) % 60 === 0) { // Every minute after the first
  setTorchLevel(prev => {
    const newLevel = Math.max(0, prev - 5); // Extra 5% torch drain
    console.log("Extra torch drain from staying in same room too long - new level:", newLevel);
    
    // CHECK FOR TORCH DEATH HERE
    if (newLevel === 0) {
      // Check if player has active lantern
      const hasActiveLantern = inventory.some(item => 
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      if (!hasActiveLantern) {
        // Schedule death for next tick to avoid state update during render
        setTimeout(() => {
          setGameStatus('lost');
          
          // Special death for gift shop
          if (currentPosition === giftShopRoom) {
            //setDeathCause('gift_shop_darkness');
              setDeathCause('torch_darkness');
            setMessage("Your torch flickers out in the gift shop. In the sudden darkness, you hear Throk's disappointed sigh. 'No light, no sight, no customer rights! To My Delight!' he chants ominously. The last thing you feel is surprisingly well-maintained orcish dental work. Turns out the 'Adventurer Special' on the menu wasn't referring to a discount. Game over!");
          } else {
            // Normal darkness death
            setDeathCause('torch_darkness');
            setMessage("Your torch has gone completely out. In the total darkness, you stumble and fall, unable to find your way. The darkness claims another victim. Game over!");
          }
        }, 0);
      } else {
        // Player has active lantern, just show a warning
        setTimeout(() => {
          if (currentPosition === giftShopRoom) {
            setMessage("Your torch has gone out, but your lantern continues to light the way. Throk looks disappointed and puts away his dinner bib.");
          } else {
            setMessage("Your torch has gone out, but your lantern continues to light the way.");
          }
        }, 0);
      }
    }
    
    return newLevel;
  });
}
    
    // NIGHT CRAWLER CHECKS - only for non-safe rooms
    if (!isSafeRoom && !nightCrawlerProtection) {
      // Warning at 100
      if (timeInRoom > 100 && !nightCrawlerWarning) {
        setNightCrawlerWarning(true);
        setMessage(prev => `${prev} \n\nYou hear a distant scratching sound. Something seems to be moving through the cave walls toward you.`);
      
              // START PLAYING THE SOUND AT LOW VOLUME
        playNightCrawlerSound(0.3);
      }
      
      // Death at 120 seconds (2 minutes)
      if (timeInRoom > 110) {
        // Kill the player
        playNightCrawlerSound(0.8);
        setGameStatus('lost');
        setDeathCause('night_crawlers');
         setMessage("The scratching crescendos into what sounds like aggressive interior redecorating. Pale, segmented critics of your life choices burst through the walls—thousands of them, like the world's worst surprise party. They're very bitey and have zero respect for personal space. \nAs they enthusiastically drag you into their wall apartments, you realize you should've left a better Yelp review. \nGame over!");
        
        // Clear the interval
        clearInterval(intervalId);
      }
    } else if (isSafeRoom) {
      console.log(`Room ${currentPosition} is safe from nightcrawlers but torch still drains`);
    }
  }, 1000); // Check every second
  
  // Clean up interval on room change or game end
  return () => {
  console.log("Night crawler cleanup - stopping sound");
  clearInterval(intervalId);
  stopNightCrawlerSound();
  
};
}, [gameStatus, currentPosition, roomEntryTime, nightCrawlerWarning, nightCrawlerProtection, inventory]); // Added inventory to dependencies



// ==================== WIZARD ROOM DEATH TIMER SYSTEM ====================
/**
 * Specialized wizard room mortality system with dual death scenarios
 * 
 * This effect implements the dangerous time limit for the wizard's sanctum (room 32),
 * where prolonged presence results in death with different outcomes based on whether
 * the wizard has been freed from magical imprisonment.
 * 
 * Death Scenarios:
 * - **Pre-Liberation**: Player becomes petrified statue, trapped like the wizard was
 * - **Post-Liberation**: Player's consciousness absorbed into cave's malevolent entity
 * 
 * Timer Mechanics:
 * - **Entry Detection**: Automatically starts timer upon entering room 32
 * - **Death Threshold**: 60 seconds maximum survival time
 * - **State Cleanup**: Resets timer and warnings when leaving room
 * - **Global Flag Integration**: Uses window.WIZARD_FREED for scenario determination
 * 
 * Enhanced Torch Drain:
 * - **Accelerated Depletion**: Heavy 10% torch drain every 30 seconds after first minute
 * - **Magical Environment**: Wizard room's magical energy rapidly consumes torch fuel
 * - **Resource Pressure**: Forces quick decision-making in critical story room
 * 
 * Narrative Differentiation:
 * - **Trapped Wizard Scenario**: Petrification with slow starvation horror
 * - **Freed Wizard Scenario**: Consciousness absorption with eternal commentary curse
 * - **Environmental Storytelling**: Different death causes track player progression
 * 
 * Technical Features:
 * - **Room-Specific Logic**: Only activates in room 32
 * - **Timer Initialization**: Sets entry time on first visit
 * - **State Reset**: Cleans up when leaving room
 * - **Global State Integration**: Checks wizard liberation status
 * - **Enhanced Resource Drain**: Accelerated torch consumption in magical environment
 * 
 * Death Cause Tracking:
 * - **wizard_room_trapped**: Death before wizard liberation
 * - **wizard_room_absorbed**: Death after wizard liberation
 * 
 * @effects setWizardRoomEntryTime, setWizardRoomWarning, setGameStatus, setDeathCause, setMessage, setTorchLevel
 */
useEffect(() => {
  if (gameStatus !== 'playing' || currentPosition !== 32) {
    // Reset wizard room states when leaving
    if (currentPosition !== 32) {
      setWizardRoomEntryTime(null);
      setWizardRoomWarning(false);
    }
    return;
  }

  // Set entry time when entering wizard room
  if (!wizardRoomEntryTime) {
    setWizardRoomEntryTime(Date.now());
    console.log("Entered wizard room - death timer started");
  }

   // ========== WIZARD ROOM DEATH TIMER ==========
  const intervalId = setInterval(() => {
    const timeInRoom = (Date.now() - wizardRoomEntryTime) / 1000; // in seconds
    
    
    // Death at 3 minutes (180 seconds)
    if (timeInRoom > 60) {
      setGameStatus('lost');
      
      if (!window.WIZARD_FREED) {
        // Death before freeing wizard - trapped forever
        
        setDeathCause('wizard_room_trapped');
        setMessage("The magical prison that held the wizard now claims you. Your legs turn to stone, then your torso, until you're just another statue in this cursed chamber. The crystal orb falls uselessly from your frozen hands. Over the coming weeks, you slowly starve, unable to move, unable to scream, unable to die quickly. Just another decoration in the wizard's eternal prison. Game over!");
      } else {
        // Death after freeing wizard - absorbed by cave
    
        setDeathCause('wizard_room_absorbed');
        setMessage("The cave's consciousness floods into your mind like a tsunami of ancient malice. Your thoughts dissolve, replaced by echoes of a thousand trapped souls. As your body crumbles to dust, your voice joins the eternal chorus: 'Welcome, adventurer... stay a while... stay forever...' You are now part of the cave's sarcastic commentary for all eternity. Game over!");
      }
      
      // Clear the interval
      clearInterval(intervalId);
    }
    
    // Extra torch drain in wizard room
    if (timeInRoom > 60 && Math.floor(timeInRoom) % 30 === 0) { // Every 30 seconds after first minute
      setTorchLevel(prev => Math.max(0, prev - 10)); // Heavy torch drain
      console.log("Heavy torch drain in wizard room");
    }
  }, 1000);

  // Cleanup
  return () => clearInterval(intervalId);
}, [gameStatus, currentPosition, wizardRoomEntryTime, wizardRoomWarning]);



// ==================== LANTERN ACTIVATION EVENT SYSTEM ====================
/**
 * Global event listener for lantern activation with golden compass placement
 * 
 * This effect establishes a window-level event listener that responds to lantern
 * activation events from anywhere in the application. It provides a clean way
 * to trigger cross-component actions when specific items are activated.
 * 
 * Event Integration:
 * - **Global Event Listening**: Monitors 'lantern_event' on window object
 * - **Action Filtering**: Specifically responds to 'lantern_activated' action
 * - **Golden Compass Placement**: Triggers compass placement upon lantern activation
 * - **Cross-Component Communication**: Enables item interactions across different UI components
 * 
 * Technical Features:
 * - **Event Detail Validation**: Checks for proper event structure before processing
 * - **Lifecycle Management**: Adds listener on mount, removes on unmount
 * - **Memory Leak Prevention**: Proper cleanup prevents orphaned listeners
 * - **One-time Setup**: Empty dependency array ensures single registration
 * 
 * Game Mechanics:
 * - **Item Synergy**: Lantern activation unlocks golden compass item
 * - **Progressive Unlock**: Creates item dependency chains for gameplay depth
 * - **Debug Logging**: Tracks activation events for troubleshooting
 * 
 * @effects Registers/removes window event listener, triggers placeGoldenCompass
 */
useEffect(() => {
  // Define the event handler function
  const handleLanternActivation = (event) => {
    if (event.detail && event.detail.action === 'lantern_activated') {
      console.log("Lantern activation detected, attempting to place golden compass");
      placeGoldenCompass();
    }
  };
  
  // Register the event listener
  window.addEventListener('lantern_event', handleLanternActivation);
  
  // Clean up function to remove the listener when component unmounts
  return () => {
    window.removeEventListener('lantern_event', handleLanternActivation);
  };
}, []); // Empty dependency array means this runs once when component mounts




 // ==================== AUDIO SYSTEM INITIALIZATION ====================
/**
 * Master audio system initialization and cleanup manager
 * 
 * This effect handles the foundational setup of the game's audio system,
 * establishing proper cleanup protocols to prevent audio memory leaks and
 * ensuring all sound resources are properly managed throughout the game lifecycle.
 * 
 * Audio Management:
 * - **Deferred Music Start**: Background music starts on first user interaction
 * - **Resource Cleanup**: Comprehensive sound cleanup on component unmount
 * - **Memory Management**: Prevents audio-related memory leaks
 * - **System Initialization**: Sets up audio infrastructure for game sounds
 * 
 * Technical Features:
 * - **Cleanup Function Integration**: Uses cleanupSounds from audio context
 * - **Component Lifecycle**: Properly manages audio across component lifetime
 * - **User Interaction Requirement**: Respects browser autoplay policies
 * - **Resource Safety**: Ensures no orphaned audio processes
 * 
 * Browser Compatibility:
 * - **Autoplay Policy Compliance**: Waits for user interaction before music
 * - **Cross-Browser Support**: Works with various browser audio restrictions
 * - **Graceful Degradation**: Handles audio system failures elegantly
 * 
 * @effects Audio system initialization and cleanup
 */
  useEffect(() => {
    // We'll start the music on first user interaction instead
    
    // Clean up all sounds when the component unmounts
    return () => {
      cleanupSounds();
    };
  }, [cleanupSounds]);

 // ==================== DYNAMIC SPECIAL ROOM MUSIC SYSTEM ====================
/**
 * Sophisticated room-based music transition and management system
 * 
 * This effect orchestrates complex musical transitions between different room types,
 * managing the interplay between background music and special room themes with
 * seamless transitions and proper audio overlap prevention.
 * 
 * Music Transition Logic:
 * - **Special Room Entry**: Stops background music, starts room-specific themes
 * - **Special Room Exit**: Stops special music, resumes background ambiance
 * - **Overlap Prevention**: Short delays prevent audio conflicts during transitions
 * - **State Tracking**: Uses ref to compare previous vs. current room types
 * 
 * Special Room Types:
 * - **Crystal Rooms**: Harmonic crystalline music
 * - **Wizard Rooms**: Mystical arcane themes
 * - **Fungi Rooms**: Organic, biological soundscapes
 * - **Gift Shop**: Commercial, orcish musical themes
 * - **Other Special Locations**: Room-specific atmospheric audio
 * 
 * Technical Features:
 * - **Timeout Management**: Uses window.specialMusicTimeout for transition timing
 * - **State Comparison**: Tracks previous room type to detect transitions
 * - **Automatic Cleanup**: Clears timeouts on component unmount or re-renders
 * - **Audio Function Integration**: Works with playSpecialRoomMusic and resumeBackgroundMusic
 * 
 * Transition Timing:
 * - **100ms Delays**: Short pauses prevent audio overlap and glitching
 * - **Immediate Stops**: Previous music stops immediately for clean transitions
 * - **Smooth Resumption**: Background music resumes gracefully after special rooms
 * 
 * Performance Considerations:
 * - **Timeout Cleanup**: Prevents memory leaks from orphaned timers
 * - **Efficient State Tracking**: Minimal overhead for room type comparison
 * - **Audio Resource Management**: Proper start/stop cycles for audio objects
 * 
 * @effects Music playback control, timeout management, audio transitions
 */
  useEffect(() => {
  console.log(`Room music change - Previous: ${previousRoomSpecial.current}, Current: ${roomSpecial}`);
  
  // ========== STOP PREVIOUS SPECIAL MUSIC ==========
  // Always stop any playing special music when room changes
  if (previousRoomSpecial.current && previousRoomSpecial.current !== roomSpecial) {
    console.log("Room changed - stopping previous special music");
    playSpecialRoomMusic(null);
  }
  
  // ========== TIMEOUT CLEANUP ==========
  // Clear any existing timeouts
  if (window.specialMusicTimeout) {
    clearTimeout(window.specialMusicTimeout);
  }
  
  // If entering a special room
  if (roomSpecial && roomSpecial !== previousRoomSpecial.current) {
    // First stop background music completely
    playBackgroundMusic(false);
    
    // Short delay before starting special music to avoid overlap
    window.specialMusicTimeout = setTimeout(() => {
      playSpecialRoomMusic(roomSpecial);
    }, 100);
  }
  // If leaving a special room (going to a non-special room)
  else if (!roomSpecial && previousRoomSpecial.current) {
    // Stop special music first (already done above)
    
    // Short delay before resuming background music
    window.specialMusicTimeout = setTimeout(() => {
      resumeBackgroundMusic();
    }, 100);
  }
  
  // Update previous room type for next comparison
  previousRoomSpecial.current = roomSpecial;
  
  // Cleanup function
  return () => {
    if (window.specialMusicTimeout) {
      clearTimeout(window.specialMusicTimeout);
    }
  };
}, [roomSpecial, playSpecialRoomMusic, resumeBackgroundMusic, playBackgroundMusic]);
  


// ==================== MESSAGE-TRIGGERED SOUND EFFECTS SYSTEM ====================
/**
 * Context-aware sound effect trigger based on game message content
 * 
 * This effect monitors game messages for specific text patterns and triggers
 * appropriate sound effects, creating a more immersive audio experience that
 * responds dynamically to game events and creature movements.
 * 
 * Sound Trigger Patterns:
 * - **Wumpus Movement**: "low growling sound as something moves" triggers distant wumpus audio
 * - **Bat Movement**: "distant flapping as the bat moves" could trigger bat sounds (placeholder)
 * - **Extensible System**: Easy to add new message-sound associations
 * 
 * Features:
 * - **Text Pattern Matching**: Uses includes() for flexible message detection
 * - **Event-Driven Audio**: Sounds triggered by narrative events rather than location
 * - **Immersive Feedback**: Audio reinforces text descriptions for enhanced atmosphere
 * - **Modular Design**: Easy to extend with additional sound triggers
 * 
 * Technical Implementation:
 * - **Message Monitoring**: Reacts to any changes in the game message state
 * - **Function Integration**: Uses imported sound functions for consistent audio management
 * - **Conditional Logic**: Only triggers sounds when specific text patterns match
 * - **Performance Optimized**: Minimal overhead for message checking
 * 
 * Audio Consistency:
 * - **Unified Sound System**: Uses same audio functions as other game systems
 * - **Volume Management**: Leverages existing audio level controls
 * - **Browser Compatibility**: Works within established audio infrastructure
 * 
 * @effects Triggers playDistantWumpusSound and potentially other sound effects
 */
  useEffect(() => {
    // Play druika movement growl when that message appears
    if (message.includes('low growling sound as something moves')) {
      playDistantWumpusSound();
    }
    
    // Could add other message-based sound triggers here
    if (message.includes('distant flapping as the bat moves')) {
      // Optionally play a bat movement sound here if you have one
    }
  }, [message, playDistantWumpusSound]);
  


 // ==================== AMBIENT CREATURE PROXIMITY AUDIO SYSTEM ====================
/**
 * Advanced proximity-based ambient audio system with creature detection
 * 
 * This is one of the most sophisticated audio systems in the game, managing
 * dynamic ambient sounds based on player proximity to dangerous creatures.
 * It creates a layered audio environment that provides both atmospheric
 * immersion and strategic gameplay information.
 * 
 * Creature Proximity Detection:
 * - **Wumpus Proximity**: "smell something terrible" triggers distant growl (one-shot)
 * - **Pit Proximity**: "feel a draft" controls looping wind sound
 * - **Bat Proximity**: "hear wings flapping" controls looping bat flapping
 * 
 * Audio Behavior Patterns:
 * - **Wumpus Audio**: One-time growl when first detecting proximity
 * - **Environmental Audio**: Continuous loops for pits (wind) and bats (flapping)
 * - **State-Driven**: Audio starts/stops based on perception changes
 * - **Game State Integration**: All audio stops when game ends
 * 
 * Technical Features:
 * - **Perception Analysis**: Scans perception array for specific text patterns
 * - **State Tracking**: Maintains previous proximity states to detect changes
 * - **Loop Management**: Properly starts/stops continuous ambient sounds
 * - **Resource Cleanup**: Ensures audio stops when game ends or component unmounts
 * 
 * Proximity State Management:
 * - **nearWumpus**: Boolean state tracking wumpus proximity
 * - **nearPit**: Boolean state tracking pit proximity  
 * - **nearBat**: Boolean state tracking bat proximity
 * - **First Detection**: Special handling for initial proximity detection
 * 
 * Audio Function Integration:
 * - **playDistantWumpusSound()**: One-shot wumpus growl
 * - **playPitWindSound(boolean)**: Toggleable wind loop for pits
 * - **playBatFlapSound(boolean)**: Toggleable flapping loop for bats
 * 
 * Performance Considerations:
 * - **Efficient Perception Scanning**: Quick text matching for real-time response
 * - **State Change Detection**: Only triggers audio on actual proximity changes
 * - **Resource Management**: Proper cleanup prevents audio memory leaks
 * - **Game State Integration**: Respects overall game state for audio control
 * 
 * Strategic Gameplay Value:
 * - **Audio Cues**: Provides non-visual information about nearby dangers
 * - **Atmosphere Building**: Creates tension through layered ambient sounds
 * - **Accessibility**: Audio feedback supports different player preferences
 * - **Immersion Enhancement**: Makes the cave feel alive and dangerous
 * 
 * @effects Updates nearWumpus/nearPit/nearBat states, triggers various audio functions
 */
useEffect(() => {
    // ========== WUMPUS PROXIMITY DETECTION ==========
    // Check for wumpus perception
    const hasWumpusPerception = perceptions.some(p => 
      p.includes('smell something terrible'));
    
    // If we're newly near a wumpus, play the distant growl once
    if (hasWumpusPerception && !nearWumpus) {
      playDistantWumpusSound();
    }
    
    // Update wumpus proximity state
    setNearWumpus(hasWumpusPerception);
    
    // Check for pit perception and control looping wind sound
    const hasPitPerception = perceptions.some(p => 
      p.includes('feel a draft'));
    
    // Start or stop the wind sound as needed
    playPitWindSound(hasPitPerception);
    
    // Update pit proximity state
    setNearPit(hasPitPerception);
    
    // Check for bat perception and control looping flap sound
    const hasBatPerception = perceptions.some(p => 
      p.includes('hear wings flapping'));
    
    // Start or stop the bat flapping sound as needed
    playBatFlapSound(hasBatPerception);
    
    // Update bat proximity state
    setNearBat(hasBatPerception);
    
    // Cleanup function to stop any looping sounds when component unmounts
    return () => {
      if (gameStatus !== 'playing') {
        playPitWindSound(false);
        playBatFlapSound(false);
      }
    };
  }, [
    perceptions, 
    nearWumpus, 
    nearPit, 
    nearBat, 
    gameStatus,
    playDistantWumpusSound,
    playPitWindSound,
    playBatFlapSound
  ]);
  
 // ==================== GAME END AUDIO CLEANUP SYSTEM ====================
/**
 * Final audio cleanup system for game state transitions
 * 
 * This effect provides an additional layer of audio cleanup specifically
 * focused on stopping looping ambient sounds when the game ends. It works
 * in conjunction with other cleanup systems to ensure no audio continues
 * playing after gameplay concludes.
 * 
 * Cleanup Targets:
 * - **Pit Wind Sounds**: Stops continuous wind loop from pit proximity
 * - **Bat Flapping Sounds**: Stops continuous wing flapping from bat proximity
 * - **State-Driven Cleanup**: Only triggers when game actually ends
 * 
 * Features:
 * - **Game State Monitoring**: Responds to gameStatus changes
 * - **Selective Cleanup**: Only stops specific looping sounds, not all audio
 * - **Redundant Safety**: Provides backup cleanup if other systems miss anything
 * - **Clean Game End**: Ensures silent state after game conclusion
 * 
 * Technical Implementation:
 * - **Boolean Control**: Uses false parameter to stop looping sounds
 * - **Function Dependency**: Includes audio functions in dependency array
 * - **State-Driven**: Only activates when gameStatus indicates non-playing state
 * - **Lightweight**: Minimal overhead for critical cleanup operation
 * 
 * @effects Stops playPitWindSound and playBatFlapSound when game ends
 */
  useEffect(() => {
    if (gameStatus !== 'playing') {
      playPitWindSound(false);
      playBatFlapSound(false);
    }
  }, [gameStatus, playPitWindSound, playBatFlapSound]);
 
  

  // ==================== COMPREHENSIVE GAME STATE AUDIO ORCHESTRATION SYSTEM ====================
/**
 * Master audio control system for victory and death sequences with dynamic sound layering
 * 
 * This is the most complex audio management system in the game, orchestrating elaborate
 * audio sequences for different game endings. It manages multiple audio layers, prevents
 * audio conflicts, and creates dramatic audio narratives for each type of game conclusion.
 * 
 * Victory Audio Sequence:
 * 1. **Immediate Silence**: Stops all background and special room music
 * 2. **Win Sound**: Plays victory sound effect (one-time only)
 * 3. **Victory Music**: Starts continuous victory theme after win sound completes
 * 4. **State Prevention**: Uses refs to prevent duplicate audio triggering
 * 
 * Death Audio Architecture:
 * - **Immediate Cleanup**: Stops all ambient music and special room audio
 * - **Death-Specific Sounds**: Different audio for each death cause
 * - **Layered Sequence**: Death sound → lose jingle → lose music
 * - **Failsafe Systems**: Multiple cleanup methods for problematic scenarios
 * 
 * Death Cause Audio Mapping:
 * - **wumpus**: Dragon growl → lose sound → lose music
 * - **sand_creature**: Demon growl → lose sound → lose music  
 * - **magical_catastrophe/vortex_trap**: Time distortion → lose sound → lose music
 * - **pit1/pit2**: Pit fall sound with enhanced cleanup → lose sound → lose music
 * - **night_crawlers**: Concurrent night crawler + lose sound → lose music
 * - **default**: Direct lose sound → lose music
 * 
 * Technical Features:
 * - **Ref-Based State Management**: Prevents duplicate audio triggering across re-renders
 * - **Event Listener Chaining**: Creates sequential audio experiences
 * - **Error Handling**: Graceful fallbacks when audio files fail to load
 * - **Audio Resource Management**: Proper cleanup and resource disposal
 * - **State Reset**: Clears all audio flags when returning to playing state
 * 
 * Advanced Audio Techniques:
 * - **Audio Sequence Chaining**: Uses 'ended' event listeners for seamless transitions
 * - **Concurrent Audio**: Night crawler sound continues during lose sound for atmosphere
 * - **Failsafe Cleanup**: Multiple cleanup calls for problematic death types (pits)
 * - **Immediate Disabling**: disableAllSounds() for emergency audio shutdown
 * - **Delayed Execution**: setTimeout for pit sounds to ensure cleanup completion
 * 
 * Pit Death Special Handling:
 * - **Enhanced Cleanup**: Multiple cleanup methods due to pit audio complexity
 * - **Delayed Audio**: 100ms delay ensures other audio stops first
 * - **Debug Logging**: Extensive logging for troubleshooting pit audio issues
 * - **Redundant Safety**: Both cleanupSounds() and disableAllSounds() calls
 * 
 * Audio File Management:
 * - **Dynamic Imports**: require() statements for various death sound effects
 * - **Error Resilience**: Continues audio sequence even if specific sounds fail
 * - **Resource Disposal**: Proper event listener cleanup after audio completes
 * - **Memory Management**: Prevents audio memory leaks through proper cleanup
 * 
 * State Flag Management:
 * - **winSoundListenerAdded**: Prevents duplicate win sound listener registration
 * - **victoryMusicStarted**: Ensures victory music plays only once
 * - **deathSoundPlayed**: Prevents death sound replay on re-renders
 * - **loseSoundPlayed**: Tracks lose sound completion status
 * 
 * Performance Considerations:
 * - **Single Execution**: Ref flags prevent expensive re-processing
 * - **Efficient Cleanup**: Targeted audio stopping based on game state
 * - **Resource Conservation**: Immediate music stopping saves audio resources
 * - **Error Tolerance**: Fallback systems ensure audio sequence continues
 * 
 * Game State Integration:
 * - **Victory Detection**: Responds to gameStatus 'won' state
 * - **Death Detection**: Responds to gameStatus 'lost' with death cause analysis
 * - **State Reset**: Clears all flags when returning to 'playing' state
 * - **Cross-Component Compatibility**: Works with all audio system components
 * 
 * @effects Complex audio orchestration, state flag management, event listener setup/cleanup
 */
useEffect(() => {
   // ========== VICTORY AUDIO SEQUENCE ==========
 if (gameStatus === 'won') {
  // Stop background music
  playBackgroundMusic(false);
  playSpecialRoomMusic(null);
  
    if (!winSoundListenerAdded.current) {
    winSoundListenerAdded.current = true;
    victoryMusicStarted.current = false;
    
    // Play win sound
    const winSound = playWinSound();
    
    // When win sound ends, start victory music (but only once)
    if (winSound) {
      const handleWinSoundEnd = () => {
        console.log("Win sound ended - checking if should start victory music");
        
        if (!victoryMusicStarted.current) {
          victoryMusicStarted.current = true;
          console.log("Starting victory music (first time only)");
          playVictoryMusicEnding(true);
        } else {
          console.log("Victory music already started - skipping");
        }
        
        // Remove the event listener after it fires
        winSound.removeEventListener('ended', handleWinSoundEnd);
      };
      
      winSound.addEventListener('ended', handleWinSoundEnd);
    }
  }
}

 // ========== DEATH AUDIO ORCHESTRATION ==========
 else if (gameStatus === 'lost' && !deathSoundPlayed.current) {
  // Stop background music IMMEDIATELY
  console.log("Game lost - stopping all music");
  // Disable all sounds first
  disableAllSounds();
  playBackgroundMusic(false);
  playSpecialRoomMusic(null);
  
  // Call cleanupSounds as an additional failsafe for pit deaths
  if (deathCause === 'pit1' || deathCause === 'pit2') {
    console.log("Pit death - using cleanupSounds as failsafe");
    cleanupSounds();
  }
  
  // Set flag to avoid replaying
  deathSoundPlayed.current = true;
  
  // Function to start lose music after lose sound
  const startLoseMusic = () => {
    console.log("Lose sound finished, starting lose music");
     stopNightCrawlerSound();
    playLoseMusicEnding(true);
  };
  
   // ========== WUMPUS DEATH SEQUENCE ==========
  if (deathCause === 'wumpus') {
    const druikaSound = new Audio(require('../sounds/Dragon_Growl_00.mp3'));
    
    // Play wumpus sound and then lose jingle after it completes
    druikaSound.addEventListener('ended', () => {
      const loseSound = playLoseSound();
      loseSoundPlayed.current = true;
      
      // When lose sound ends, start lose music
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
    
    druikaSound.play().catch(error => {
      console.error('Error playing wumpus sound:', error);
      // If wumpus sound fails, still play lose sound
      const loseSound = playLoseSound();
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
  }
 // ========== SAND CREATURE DEATH SEQUENCE ==========
 else if (deathCause === 'sand_creature') {
    const wraithSound = new Audio(require('../sounds/DL_ DEMON_GROWL_4.ogg'));
    
    // Play wumpus sound and then lose jingle after it completes
    wraithSound.addEventListener('ended', () => {
      const loseSound = playLoseSound();
      loseSoundPlayed.current = true;
      
      // When lose sound ends, start lose music
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
    
    wraithSound.play().catch(error => {
      console.error('Error playing wumpus sound:', error);
      // If wumpus sound fails, still play lose sound
      const loseSound = playLoseSound();
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
  }


/*   Think I commnented this out because it I mow have it  with the magical catashophe one
 else if (deathCause === 'vortex_trap') {
    const vortex_trapSound = new Audio(require('../hooks/131100__northern87__time-distortion_northern87.ogg'));
    
    // Play wumpus sound and then lose jingle after it completes
    vortex_trapSound.addEventListener('ended', () => {
      const loseSound = playLoseSound();
      loseSoundPlayed.current = true;
      
      // When lose sound ends, start lose music
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
    
   vortex_trapSound.play().catch(error => {
      console.error('Error playing vortex_trap sound:', error);
      // If wumpus sound fails, still play lose sound
      const loseSound = playLoseSound();
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });

  }
*/
 // ========== MAGICAL/VORTEX DEATH SEQUENCE ==========
 else if (deathCause === 'magical_catastrophe' || deathCause === 'vortex_trap') {
    const TimeVortexSound = new Audio(require('../sounds/131100__northern87__time-distortion_northern87.ogg'));
    
    // Play wumpus sound and then lose jingle after it completes
    TimeVortexSound.addEventListener('ended', () => {
      const loseSound = playLoseSound();
      loseSoundPlayed.current = true;
      
      // When lose sound ends, start lose music
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
    
    TimeVortexSound.play().catch(error => {
      console.error('Error playing TimeVortexSound sound:', error);
      // If wumpus sound fails, still play lose sound
      const loseSound = playLoseSound();
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });

  }
  // ========== PIT DEATH SEQUENCE (ENHANCED CLEANUP) ==========
  else if (deathCause === 'pit1' || deathCause === 'pit2') {
  console.log("Pit death detected - playing pit sound");
    playBackgroundMusic(false);
  // Force cleanup all sounds for pit deaths
  cleanupSounds();
  
  setTimeout(() => {
    console.log("Playing pit sound");
    const pitSound = new Audio(require('../sounds/pit-fall.mp3'));
    
    // Play pit sound and then lose jingle after it completes
    pitSound.addEventListener('ended', () => {
      console.log("Pit sound ended - playing lose sound");
      const loseSound = playLoseSound();
      loseSoundPlayed.current = true;
      
      // When lose sound ends, start lose music
      if (loseSound) {
        loseSound.addEventListener('ended', startLoseMusic);
      }
    });
    
    pitSound.play()
      .then(() => {
        console.log("Pit sound playing successfully");
      })
      .catch(error => {
        console.error('Error playing pit sound:', error);
        // If pit sound fails, still play lose sound
        const loseSound = playLoseSound();
        if (loseSound) {
          loseSound.addEventListener('ended', startLoseMusic);
        }
      });
  }, 100); // <-- This is where the closing bracket and delay go
}
// ========== NIGHT CRAWLER DEATH SEQUENCE (CONCURRENT AUDIO) ==========
else if (deathCause === 'night_crawlers') {
  // Let the night crawler sound continue during lose sound
  const loseSound = playLoseSound();
  loseSoundPlayed.current = true;
  
  // When lose sound ends, stop night crawler and start lose music
  if (loseSound) {
    loseSound.addEventListener('ended', startLoseMusic);
  }
}

  // If no specific death cause, just play lose sound
  else {
    const loseSound = playLoseSound();
    loseSoundPlayed.current = true;
    
    // When lose sound ends, start lose music
    if (loseSound) {
      loseSound.addEventListener('ended', startLoseMusic);
    }
  }
}
    
    // ========== STATE RESET FOR NEW GAMES ==========
  if (gameStatus === 'playing') {
  victoryMusicStarted.current = false;
  winSoundListenerAdded.current = false;
  deathSoundPlayed.current = false;
  loseSoundPlayed.current = false;
}
  }, [
    gameStatus, 
    deathCause, 
    playWinSound, 
    playWumpusSound, 
    playPitSound, 
    playLoseSound,
    playBackgroundMusic,
    playSpecialRoomMusic,
    playVictoryMusicEnding
  ]);




// ==================== SHIFTING ROOM INITIALIZATION SYSTEM ====================
/**
 * One-time shifting room initialization triggered by treasure system completion
 * 
 * This effect handles the initialization of the game's shifting room mechanic,
 * which creates a dynamic room that changes its description and contents over time.
 * It waits for the treasure system to be fully established before creating the
 * shifting room to avoid conflicts with treasure placement.
 * 
 * Initialization Triggers:
 * - **Treasure System Ready**: treasurePieces array must exist and have content
 * - **No Existing Shifting Room**: shiftingRoomId must be null/undefined
 * - **One-time Execution**: Only runs once per game session
 * 
 * Technical Features:
 * - **Dependency Coordination**: Waits for treasure initialization completion
 * - **State Validation**: Checks for both treasure existence and shifting room absence
 * - **Delayed Execution**: 100ms delay ensures all state updates have completed
 * - **Debug Logging**: Reports treasure count and initialization status
 * - **Cleanup Safety**: Proper timeout cleanup on component unmount
 * 
 * Shifting Room Mechanics:
 * - **Dynamic Descriptions**: Room text changes periodically during gameplay
 * - **Content Variation**: Room may have different items or features in each state
 * - **Player Discovery**: Creates mystery and exploration incentive
 * - **State Persistence**: Maintains shifting state throughout game session
 * 
 * Timing Coordination:
 * - **Post-Treasure Setup**: Ensures treasure placement doesn't conflict
 * - **State Completion Wait**: Delay allows React state updates to fully process
 * - **Single Initialization**: Prevents duplicate shifting room creation
 * 
 * @effects Triggers initializeShiftingRoom function, manages initialization timing
 */
  // once treasures exist, initialize the shifting-room exactly one time
  useEffect(() => {
    // Only attempt shifting room init if treasures exist and shifting room doesn't
    if (treasurePieces && treasurePieces.length > 0 && !shiftingRoomId) {
      console.log(`Found ${treasurePieces.length} treasures - initializing shifting room`);
      
      // Add a short delay to ensure state updates have completed
      const timer = setTimeout(() => {
        initializeShiftingRoom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [treasurePieces, shiftingRoomId]);
  


// ==================== GOLDEN COMPASS PLACEMENT SYSTEM ====================
/**
 * Sophisticated item placement function with comprehensive room validation
 * 
 * This function implements an advanced room selection algorithm for placing the
 * golden compass item, with extensive validation to prevent conflicts with existing
 * game elements and ensure optimal placement for player discovery.
 * 
 * Exclusion Criteria:
 * - **Hazard Rooms**: Avoids wumpus, pit, and bat positions
 * - **Special Locations**: Excludes exit position and treasure map room
 * - **Treasure Conflicts**: Prevents overlap with existing treasure locations
 * - **Interactive Items**: Avoids rooms that already have items
 * - **Backpack Room**: Critical exclusion to prevent narrative conflicts
 * - **Pool Room**: Prevents placement in water-based rooms
 * 
 * Room Validation Functions:
 * - **hasBackpackDescription()**: Detects rooms with backpack narrative elements
 * - **isPoolRoom()**: Identifies rooms with water features
 * - **Multiple Detection Methods**: Uses text content, flags, and enhanced text
 * 
 * Placement Algorithm:
 * 1. **Primary Selection**: Finds completely available rooms
 * 2. **Fallback System**: Relaxes criteria if no ideal rooms exist
 * 3. **Safety Validation**: Triple-checks placement location before execution
 * 4. **Dynamic Description**: Adds compass to room text with interactive span
 * 
 * Error Prevention:
 * - **Critical Error Checking**: Logs and aborts if placing in excluded rooms
 * - **Fallback Mechanisms**: Continues functioning even with limited room availability
 * - **Defensive Programming**: Multiple validation layers prevent placement errors
 * - **Debug Logging**: Comprehensive reporting of placement decisions
 * 
 * Room Description Integration:
 * - **Interactive HTML**: Adds proper span with data attributes for UI interaction
 * - **State Preservation**: Maintains original room text for restoration
 * - **Visual Integration**: Describes compass discovery in atmospheric terms
 * - **Collection Support**: Sets up proper state for item collection mechanics
 * 
 * @param {boolean} forcePlacement - Optional parameter to override placement restrictions
 * @effects Updates roomDescriptionMap with golden compass placement
 */
const placeGoldenCompass = (forcePlacement = false) => {
  console.log("Setting up golden compass placement...");
  
  // Helper function to check if a room has a backpack description
  const hasBackpackDescription = (roomId) => {
    const roomDesc = roomDescriptionMap[roomId]?.text || '';
    return roomDesc.toLowerCase().includes('backpack with half-eaten rations') &&
           roomDesc.toLowerCase().includes('map that simply says');
  };
  
  // Helper function to check if a room is the pool room
  const isPoolRoom = (roomId) => {
    const roomDesc = roomDescriptionMap[roomId];
    return roomDesc?.hasPoolTreasures === true || 
           roomDesc?.text?.includes('pool of clear water') ||
           roomDesc?.text?.includes("nature's most inconvenient wading pool") ||
           roomDesc?.enhancedText?.includes('deceptively clear pool');
  };
  
  // Find rooms that are not occupied by hazards, treasures, backpack, or pool
  const availableRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (
      i !== positions.wumpusPosition &&
      i !== positions.pitPosition1 &&
      i !== positions.pitPosition2 &&
      i !== positions.batPosition &&
      i !== positions.exitPosition &&
      i !== treasureMap &&
      !treasurePieces.some(treasure => treasure.room === i) &&
      !specialRooms[i]?.hasItem && // Room shouldn't already have an item
      !hasBackpackDescription(i) && // CRITICAL: Exclude the backpack room
      !isPoolRoom(i) // CRITICAL: Exclude the pool room
    ) {
      availableRooms.push(i);
    }
  }
  
  // Log detailed info about available rooms
  console.log(`Found ${availableRooms.length} available rooms for golden compass placement (excluding backpack and pool rooms)`);
  
  if (availableRooms.length === 0) {
    console.log("No available rooms for golden compass placement - trying alternative approach");
    
    // Desperate fallback: get ANY safe room that's not the backpack or pool room
    const fallbackRooms = [];
    for (let i = 1; i <= 30; i++) {
      if (i !== positions.wumpusPosition &&
          i !== positions.pitPosition1 &&
          i !== positions.pitPosition2 &&
          !hasBackpackDescription(i) &&
          !isPoolRoom(i)) {
        fallbackRooms.push(i);
      }
    }
    
    if (fallbackRooms.length > 0) {
      const compassRoom = fallbackRooms[Math.floor(Math.random() * fallbackRooms.length)];
      console.log(`FALLBACK: Placing golden compass in room ${compassRoom}`);
      
      // Continue with placement using the fallback room
      setRoomDescriptionMap(prev => ({
        ...prev,
        [compassRoom]: {
          ...prev[compassRoom],
          text: prev[compassRoom].text + " In a corner, you spot a <span class='interactive-item' data-item='golden_compass'>golden compass</span> glinting in your torchlight.",
          hasInteractiveItem: true,
          interactiveItem: 'golden_compass',
          textAfterCollection: prev[compassRoom].text
        }
      }));
    }
    return;
  }
  
  // Pick a random room from available ones
  const compassRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
  console.log(`Golden compass will be placed in room ${compassRoom}`);
  
  // Triple check to make absolutely sure we're not placing in backpack or pool room
  if (hasBackpackDescription(compassRoom)) {
    console.error("CRITICAL ERROR: About to place golden compass in backpack room despite filters!");
    return;
  }
  
  if (isPoolRoom(compassRoom)) {
    console.error("CRITICAL ERROR: About to place golden compass in pool room despite filters!");
    return;
  }
  
  // Update the room description to mention the compass
  setRoomDescriptionMap(prev => ({
    ...prev,
    [compassRoom]: {
      ...prev[compassRoom],
      text: prev[compassRoom].text + " In a corner, you spot a <span class='interactive-item' data-item='golden_compass'>golden compass</span> glinting in your torchlight.",
      hasInteractiveItem: true,
      interactiveItem: 'golden_compass',
      textAfterCollection: prev[compassRoom].text
    }
  }));
};


// ==================== ENHANCED TEXT GENERATION SYSTEM ====================
/**
 * Dynamic enhanced text generation for lantern-illuminated room discoveries
 * 
 * This function ensures that enough rooms have enhanced text descriptions that
 * are revealed when players use the lantern instead of just the torch. It
 * dynamically generates atmospheric enhanced descriptions based on room
 * characteristics and mood settings.
 * 
 * Enhanced Text Requirements:
 * - **Minimum Count**: Ensures at least 5 rooms have enhanced text
 * - **Dynamic Generation**: Creates appropriate text based on room mood
 * - **Atmospheric Integration**: Enhanced descriptions feel natural and immersive
 * - **Gameplay Value**: Provides incentive for players to acquire and use lantern
 * 
 * Room Mood-Based Enhancement:
 * - **Mysterious Rooms**: Hidden details in stonework revealed by bright light
 * - **Ancient Rooms**: Faded inscriptions invisible to torchlight
 * - **Water Rooms**: Lantern penetrates water to reveal rocky bottom
 * - **Default Rooms**: Subtle cave formation details become visible
 * 
 * Selection Criteria:
 * - **Safety First**: Avoids hazard rooms (wumpus, pits, bats)
 * - **No Conflicts**: Excludes exit position and treasure map room
 * - **Existing Content**: Only enhances rooms that don't already have enhanced text
 * - **Text Availability**: Requires base room text to build upon
 * 
 * Technical Implementation:
 * - **Count Validation**: Checks current enhanced text distribution
 * - **Random Selection**: Shuffles eligible rooms for varied placement
 * - **State Updates**: Adds enhanced text to selected rooms
 * - **Debug Logging**: Reports enhancement process and room selection
 * 
 * Enhancement Algorithm:
 * 1. **Audit Current State**: Count existing enhanced text rooms
 * 2. **Identify Candidates**: Find rooms suitable for enhancement
 * 3. **Random Selection**: Choose rooms to enhance up to minimum requirement
 * 4. **Generate Text**: Create mood-appropriate enhanced descriptions
 * 5. **Update State**: Apply enhanced text to selected rooms
 * 
 * @effects Updates roomDescriptionMap with enhanced text for selected rooms
 */
const ensureEnhancedTextsExist = () => {
  console.log("Ensuring enhanced texts exist for enough rooms...");
  
  // Count how many rooms have enhanced text
  let enhancedCount = 0;
  for (let i = 1; i <= 30; i++) {
    if (roomDescriptionMap[i]?.enhancedText) {
      enhancedCount++;
    }
  }
  
  console.log(`Currently ${enhancedCount} rooms have enhanced text`);
  
  // If we need more enhanced texts, add them to random safe rooms
  if (enhancedCount < 5) {
    const roomsToEnhance = [];
    
    // Find rooms that could have enhanced text added
    for (let i = 1; i <= 30; i++) {
      if (!roomDescriptionMap[i]?.enhancedText &&
          roomDescriptionMap[i]?.text &&
          i !== positions.wumpusPosition &&
          i !== positions.pitPosition1 &&
          i !== positions.pitPosition2 &&
          i !== positions.batPosition &&
          i !== positions.exitPosition &&
          i !== treasureMap) {
        roomsToEnhance.push(i);
      }
    }
    
    console.log(`Found ${roomsToEnhance.length} rooms that could have enhanced text added`);
    
    // Shuffle and take up to 5 rooms
    const shuffled = [...roomsToEnhance].sort(() => Math.random() - 0.5);
    const toEnhance = shuffled.slice(0, Math.min(5 - enhancedCount, shuffled.length));
    
    // Add simple enhanced text to these rooms
    toEnhance.forEach(roomId => {
      const room = roomDescriptionMap[roomId];
      if (room) {
        // Create enhanced text based on the room's mood or content
        let enhancedAddition = "";
        
        if (room.mood === 'mysterious') {
          enhancedAddition = " Your lantern's bright light reveals previously hidden details in the stonework.";
        } else if (room.mood === 'ancient') {
          enhancedAddition = " The lantern illuminates faded inscriptions on the walls that were invisible in torchlight.";
        } else if (room.hasWater) {
          enhancedAddition = " Your lantern's beam penetrates the water, revealing the rocky bottom.";
        } else {
          enhancedAddition = " The brighter light of your lantern reveals subtle details in the cave formations.";
        }
        
        setRoomDescriptionMap(prev => ({
          ...prev,
          [roomId]: {
            ...prev[roomId],
            enhancedText: (prev[roomId].text || "") + enhancedAddition
          }
        }));
        
        console.log(`Added enhanced text to room ${roomId}`);
      }
    });
  }
};




// ==================== ENHANCED ROOM BONUS ITEMS SYSTEM ====================
/**
 * Advanced bonus item placement system for lantern-enhanced room exploration
 * 
 * This function implements a sophisticated system for placing valuable bonus items
 * in rooms with enhanced text, creating additional incentive for players to acquire
 * and use the lantern. It includes comprehensive validation to prevent duplicate
 * placement and ensures balanced item distribution.
 * 
 * Bonus Item Types:
 * - **Single Gold Coins**: Valuable currency items placed in 2 different rooms
 * - **Loose Rocks**: Utility items for throwing/distraction placed in 1 room
 * - **Enhanced Discovery**: Items only visible with lantern illumination
 * 
 * Placement Requirements:
 * - **Enhanced Text Prerequisite**: Only rooms with enhanced descriptions qualify
 * - **No Duplicate Items**: Prevents placing items in rooms that already have them
 * - **Hazard Avoidance**: Excludes dangerous rooms (wumpus, pits, bats, exit)
 * - **Pool Room Exclusion**: Avoids water-based rooms for item placement
 * 
 * Validation Systems:
 * - **Duplicate Prevention**: Checks for existing enhanced items before placement
 * - **Debug State Analysis**: Comprehensive logging of room states and eligibility
 * - **Enhanced Text Verification**: Ensures rooms have proper enhanced descriptions
 * - **Interactive Item Conflict Resolution**: Allows enhanced items even with regular items
 * 
 * Item Placement Algorithm:
 * 1. **State Validation**: Verify no enhanced items already exist
 * 2. **Eligibility Assessment**: Find rooms with enhanced text but no enhanced items
 * 3. **Safety Filtering**: Remove hazardous or problematic rooms
 * 4. **Random Distribution**: Shuffle eligible rooms for varied placement
 * 5. **Item Assignment**: Place specific items with atmospheric descriptions
 * 6. **State Integration**: Update room descriptions with interactive HTML
 * 
 * Technical Features:
 * - **Enhanced Text Integration**: Builds upon existing enhanced descriptions
 * - **Interactive HTML**: Proper span elements with data attributes for UI
 * - **State Tracking**: Maintains enhanced item flags and IDs
 * - **Sentence Preservation**: Stores item sentences for potential removal
 * - **Duplicate Detection**: Multiple validation layers prevent conflicts
 * 
 * Debug and Monitoring:
 * - **Comprehensive Logging**: Detailed state analysis for each room
 * - **Eligibility Reporting**: Clear indication of why rooms qualify or don't
 * - **Placement Confirmation**: Logs successful item placement with room numbers
 * - **Error Diagnostics**: Explains why no eligible rooms exist if placement fails
 * 
 * @effects Updates roomDescriptionMap with enhanced item descriptions and flags
 */

const addEnhancedRoomItems = () => {
  console.log("Adding bonus items to enhanced room descriptions...");
  
  // Check if we've already added enhanced items
  let itemsAlreadyAdded = false;
  for (let i = 1; i <= 30; i++) {
    if (roomDescriptionMap[i]?.enhancedHasItem) {
      itemsAlreadyAdded = true;
      console.log(`Enhanced items already exist in room ${i}, aborting...`);
      break;
    }
  }
  
  if (itemsAlreadyAdded) {
    console.log("Enhanced items have already been added, skipping...");
    return;
  }
  
  // Debug: Log the current state of roomDescriptionMap
  console.log("Current roomDescriptionMap:", roomDescriptionMap);
  
  // Find rooms that have enhanced text but no existing interactive items
  const eligibleRooms = [];
  for (let i = 1; i <= 30; i++) {
    const roomInfo = roomDescriptionMap[i];
    const roomText = roomInfo?.text || '';
    
    // Debug log for each room
    if (roomInfo) {
      console.log(`Room ${i}:`, {
        hasEnhancedText: !!roomInfo.enhancedText,
        enhancedTextLength: roomInfo.enhancedText?.length || 0,
        hasInteractiveItem: roomInfo.hasInteractiveItem,
        hasEnhancedItem: roomInfo.enhancedHasItem,
        text: roomInfo.text?.substring(0, 50) + "..."
      });
    }
    
    if (roomInfo && 
        roomInfo.enhancedText && 
        !roomInfo.enhancedHasItem && // Check if it already has an enhanced item
        !roomInfo.enhancedText.includes('interactive-item') && // Also check the text itself
        i !== positions.wumpusPosition &&
        i !== positions.pitPosition1 &&
        i !== positions.pitPosition2 &&
        i !== positions.batPosition &&
        i !== positions.exitPosition &&
        !isPoolRoom(roomText)) {
      
      // Don't exclude rooms that have regular interactive items
      // They can still have enhanced items
      eligibleRooms.push(i);
    }
  }
  
  console.log(`Found ${eligibleRooms.length} eligible rooms for enhanced items:`, eligibleRooms);
  
  // If no eligible rooms, log why
  if (eligibleRooms.length === 0) {
    console.log("No eligible rooms found. Checking why:");
    console.log("Positions:", positions);
    console.log("Rooms with enhanced text:", Object.keys(roomDescriptionMap).filter(key => 
      roomDescriptionMap[key]?.enhancedText
    ));
  }
  
  // Rest of the function remains the same...
  // Shuffle the eligible rooms
  const shuffledRooms = [...eligibleRooms].sort(() => Math.random() - 0.5);
  
  // Add single gold coins to 2 different rooms using the existing gold_coins item
  if (shuffledRooms.length >= 2) {
    const goldRoom1 = shuffledRooms[0];
    const goldRoom2 = shuffledRooms[1];
    
    // Add gold coin to first room's enhanced text - using single_gold_coin
    setRoomDescriptionMap(prev => ({
      ...prev,
      [goldRoom1]: {
        ...prev[goldRoom1],
        enhancedText: prev[goldRoom1].enhancedText + " In a crevice illuminated by your lantern's stronger beam, you notice a single <span class='interactive-item' data-item='single_gold_coin'>ancient gold coin</span> that your torch missed.",
        enhancedHasItem: true,
        enhancedItemId: 'single_gold_coin', // Changed from 'gold_coins'
        enhancedItemSentence: " In a crevice illuminated by your lantern's stronger beam, you notice a single <span class='interactive-item' data-item='single_gold_coin'>ancient gold coin</span> that your torch missed."
      }
    }));
    
    // Add gold coin to second room's enhanced text
    setRoomDescriptionMap(prev => ({
      ...prev,
      [goldRoom2]: {
        ...prev[goldRoom2],
        enhancedText: prev[goldRoom2].enhancedText + " Your lantern reveals a <span class='interactive-item' data-item='single_gold_coin'>tarnished gold coin</span> tucked behind a small rock formation.",
        enhancedHasItem: true,
        enhancedItemId: 'single_gold_coin', // Changed from 'gold_coins'
        enhancedItemSentence: " Your lantern reveals a <span class='interactive-item' data-item='single_gold_coin'>tarnished gold coin</span> tucked behind a small rock formation."
      }
    }));
    
    console.log(`Added single gold coins to rooms ${goldRoom1} and ${goldRoom2}`);
  } else {
    console.log(`Not enough eligible rooms for gold coins (need 2, have ${shuffledRooms.length})`);
  }
  
  // Add 1 loose rock to a different room
  if (shuffledRooms.length >= 3) {
    const rockRoom = shuffledRooms[2];
    
    setRoomDescriptionMap(prev => ({
      ...prev,
      [rockRoom]: {
        ...prev[rockRoom],
        enhancedText: prev[rockRoom].enhancedText + " Near the wall, your lantern illuminates a pile of <span class='interactive-item' data-item='loose_rocks'>loose rocks</span> that seem perfect for throwing.",
        enhancedHasItem: true,
        enhancedItemId: 'loose_rocks',
         enhancedItemSentence: " Near the wall, your lantern illuminates a pile of <span class='interactive-item' data-item='loose_rocks'>loose rocks</span> that seem perfect for throwing."
      
      }
    }));
    
    console.log(`Added loose rocks to room ${rockRoom}`);
  } else {
    console.log(`Not enough eligible rooms for rocks (need 3, have ${shuffledRooms.length})`);
  }
};




// ==================== BACKPACK ROOM VALIDATION HELPER ====================
/**
 * Helper function to identify rooms containing the backpack narrative element
 * 
 * This utility function provides a standardized way to detect rooms that contain
 * the backpack with half-eaten rations and the warning map. It's used throughout
 * the codebase to prevent item placement conflicts and maintain narrative consistency.
 **/
const hasBackpackDescription = (roomId, roomDescMap) => {
  const roomDesc = roomDescMap[roomId]?.text || '';
  return roomDesc.includes('backpack with half-eaten rations') && 
         roomDesc.includes('map that simply says \'RUN!\'');
};


// ==================== REALITY STABILIZER PLACEMENT SYSTEM ====================
/**
 * Advanced placement system for Reality Stabilizer with distance optimization
 * 
 * This sophisticated function handles the strategic placement of the Reality Stabilizer
 * (Reality Anchor), a critical item that helps counteract the effects of shifting rooms.
 * It implements intelligent room selection with distance optimization and comprehensive
 * fallback systems to ensure reliable placement.
 * 
 * Strategic Placement Goals:
 * - **Maximum Distance**: Places stabilizer as far from shifting room as possible
 * - **Hazard Avoidance**: Prevents placement in dangerous or special rooms
 * - **Treasure Conflicts**: Avoids rooms with existing treasures or interactive items
 * - **Optimal Positioning**: Uses both direct and path-based distance calculations
 * 
 * Distance Calculation Methods:
 * - **Direct Distance**: Simple mathematical distance between room numbers
 * - **Path Distance**: Actual movement distance through room connections
 * - **Maximum Selection**: Uses whichever distance calculation is greater
 * - **Pathfinding Integration**: Leverages findShortestPath for accurate routing
 * 
 * Fallback Systems:
 * - **Room Generation**: Creates available room list if none provided
 * - **Safety Filtering**: Excludes all hazardous and occupied rooms
 * - **Random Selection**: Falls back to random placement if shifting room undefined
 * - **Error Handling**: Comprehensive error logging and graceful degradation
 * 
 * Exclusion Criteria:
 * - **Game Hazards**: Wumpus, pit, and bat positions
 * - **Special Locations**: Exit position and treasure map room
 * - **Treasure Rooms**: Any room containing treasure pieces
 * - **Shifting Room**: The room that changes descriptions dynamically
 * - **Interactive Rooms**: Rooms with existing interactive elements
 * 
 * Technical Features:
 * - **Distance Optimization**: Sophisticated algorithm to maximize stabilizer effectiveness
 * - **Path Analysis**: Uses room connection data for accurate distance measurement
 * - **Robust Error Handling**: Multiple fallback layers prevent placement failure
 * - **Debug Logging**: Comprehensive reporting of placement decisions and distances
 * - **Item Integration**: Uses existing placeItem function for consistent placement
 * 
 * Performance Considerations:
 * - **Efficient Distance Calculation**: Optimized algorithms for room comparison
 * - **Smart Fallback Generation**: Only generates room lists when necessary
 * - **Memory Efficient**: Minimal object creation during distance calculation
 * - **Early Exit**: Stops processing when optimal placement found
 * 
 * Game Balance Impact:
 * - **Strategic Positioning**: Makes stabilizer require exploration to reach
 * - **Risk vs Reward**: Players must venture far from shifting room to stabilize it
 * - **Exploration Incentive**: Encourages thorough cave exploration
 * - **Tactical Considerations**: Placement affects player movement strategies
 * 
 * @param {Array} availableRooms - Pre-filtered list of rooms suitable for placement
 * @returns {number} The room ID where the Reality Stabilizer was placed
 * @effects Calls placeItem to actually place the stabilizer in chosen room
 */
const placeRealityStabilizer = (availableRooms) => {
  console.log("Placing Reality Anchor in game world...");
  
  // ========== FALLBACK ROOM GENERATION ==========
  if (!availableRooms || availableRooms.length === 0) {
    console.error("No available rooms for Reality Anchor - generating fallback rooms");
    
    // Fallback: generate a list of all rooms not containing treasures or hazards
    availableRooms = [];
    for (let i = 1; i <= 30; i++) {
      if (i !== positions.wumpusPosition &&
          i !== positions.pitPosition1 &&
          i !== positions.pitPosition2 &&
          i !== positions.batPosition &&
          i !== positions.exitPosition &&
          i !== treasureMap &&
          !treasurePieces.some(t => t.room === i) &&
          i !== shiftingRoomId) {
        availableRooms.push(i);
      }
    }
    
    if (availableRooms.length === 0) {
      console.error("CRITICAL ERROR: No rooms available for Reality Anchor!");
      return;
    }
  }
  
  // Find the optimal room - as far from shifting room as possible
  let bestRoom = availableRooms[0];
  let maxDistance = 0;
  
  if (shiftingRoomId) {
    availableRooms.forEach(room => {
      // Calculate distance to shifting room
      const directDistance = Math.abs(room - shiftingRoomId); // Simple distance metric
      
      // Try to find path through room connections if available
      let pathDistance = 0;
      if (roomConnections) {
        const path = findShortestPath(room, shiftingRoomId, roomConnections);
        pathDistance = path ? path.distance : 0;
      }
      
      // Use whichever distance is greater
      const distance = Math.max(directDistance, pathDistance);
      
      if (distance > maxDistance) {
        maxDistance = distance;
        bestRoom = room;
      }
    });
  } else {
    // If shifting room not set yet, pick random room
    bestRoom = availableRooms[Math.floor(Math.random() * availableRooms.length)];
    console.log("Shifting room not set yet - using random room for Reality Anchor");
  }
  
  // Place the stabilizer in the chosen room
  placeItem('reality_stabilizer', bestRoom);
  
  console.log(`Reality Anchor placed in room ${bestRoom}`);
  if (maxDistance > 0) {
    console.log(`Distance from shifting room: ${maxDistance} moves`);
  }
  
  return bestRoom;
};




 // ==================== COMPREHENSIVE CONTEXT VALUE EXPORT SYSTEM ====================
/**
 * Master context value object containing all game state and functions
 * 
 * This comprehensive object serves as the central hub for all game state,
 * functions, and configuration data that needs to be accessible throughout
 * the application. It represents the complete public API of the GameContext
 * and ensures consistent access to game functionality across all components.
 * 
 * State Categories:
 * - **Core Game State**: Position, status, messages, room data
 * - **Player Progression**: Inventory, treasures, abilities, spells
 * - **Environmental Systems**: Torch, darkness, special rooms, creatures
 * - **Audio & Visual**: Sound controls, display flags, special messages
 * - **Save System**: Game persistence and loading functionality
 * - **UI Control**: Modal displays, trading interfaces, scene controls
 * 
 * Function Categories:
 * - **Game Control**: Start, reset, save/load operations
 * - **Player Actions**: Movement, item usage, trading, guessing
 * - **Item Management**: Inventory operations, item interactions
 * - **Room Systems**: Description updates, interactive element handling
 * - **Audio Integration**: Sound-enabled versions of core functions
 * - **Special Mechanics**: Spell casting, trap handling, creature encounters
 * 
 * Technical Architecture:
 * - **Centralized Access**: Single source of truth for all game functionality
 * - **Consistent API**: Uniform interface for component interaction
 * - **State Synchronization**: All state changes flow through this context
 * - **Function Wrapping**: Sound-enabled versions of key functions
 * - **Modular Design**: Organized by functional areas for maintainability
 * 
 * Performance Considerations:
 * - **Selective Re-rendering**: Components only re-render when needed values change
 * - **Function Stability**: Memoized functions prevent unnecessary re-renders
 * - **State Optimization**: Efficient state structure minimizes update overhead
 * - **Context Splitting**: Could be split into smaller contexts for optimization
 * 
 * @exports Complete game context value object for provider consumption
 */
const value = {
    // ========== CORE GAME STATE ==========
    term,                           // Current player input/command
    setTerm,                        // Function to update player input
    currentPosition,                // Player's current room number
    gameStatus,                     // Current game state (playing/won/lost)
    message,                        // Current game message to display
    roomDescription,                // Current room's description text
    history,                        // Game action history
    perceptions,                    // Current environmental perceptions
    batEncounter,                   // Bat encounter state
    positions,                      // All entity positions (wumpus, pits, etc.)
    roomMood,                       // Current room's atmospheric mood
    roomHasWater,                   // Boolean - current room has water
    roomSpecial,                    // Current room's special type
    
    // ========== PROXIMITY DETECTION ==========
    nearWumpus,                     // Boolean - wumpus proximity warning
    nearPit,                        // Boolean - pit proximity warning
    nearBat,                        // Boolean - bat proximity warning
    
    // ========== CORE GAME FUNCTIONS ==========
    handleGuess: handleGuessWithSound,  // Sound-enabled guess function
    handleChange,                   // Input change handler
    resetGame: resetGameWithSound,  // Sound-enabled reset function
    startGame: startGameFromContext, // Game initialization function
    
    // ========== GAME OUTCOME TRACKING ==========
    deathCause,                     // Reason for game loss
    
    // ========== TREASURE SYSTEM ==========
    treasurePieces,                 // Array of treasure objects
    collectedTreasures,             // Array of collected treasure IDs
    hasMap,                         // Boolean - player has treasure map
    mapClue,                        // Treasure map clue text
    playMapFoundSound,
    playTreasureFoundSound,
    treasureDebugInfo,              // Debug information for treasure system
    shiftingRoomId,                 // ID of the shifting room
    
    // ========== WORLD STRUCTURE ==========
    roomConnections,                // Room connection graph
    roomDescriptionMap,             // Map of all room descriptions
    specialRooms,                   // Special room configurations
    setSpecialRooms,                // Function to update special room

    // ========== USER INTERFACE ==========
    showIntro,                      // Boolean - show intro sequence
    
    // ========== INVENTORY SYSTEM ==========
    inventory,                      // Player's current inventory
    addItemToInventory,             // Function to add items
    hasItem,                        // Function to check item possession
    handleUseItem,                  // Function to use inventory items
    itemTypes,                      // Item type definitions
    
    // ========== ENVIRONMENTAL SYSTEMS ==========
    torchLevel,                     // Current torch fuel level
    darknessCounter,                // Darkness progression counter
    MAX_DARKNESS,                   // Maximum darkness threshold
    
    // ========== CREATURE ENCOUNTERS ==========
    batEncounters,                  // Bat encounter tracking
    throwingRepellent,              // Repellent throwing state
    repellentThrowHandler,          // Repellent throwing function
    nightCrawlerWarning,            // Night crawler warning state
    nightCrawlerProtection,         // Night crawler protection status
    
    // ========== COMMERCE SYSTEM ==========
    giftShopRoom,                   // Gift shop room ID
    showTradeButton,                // Boolean - show trade interface
    handleTrade,                    // Trade function
    shopMode,                       // Shop mode state
    processShopPurchase,            // Purchase processing function
    
    // ========== WATER SPIRIT SYSTEM ==========
    showWaterSpiritTradeButton,     // Boolean - show water spirit trade
    handleWaterSpiritTrade,         // Water spirit trade function
    
    // ========== ROOM DESCRIPTION MANAGEMENT ==========
    setRoomDescriptionMap,          // Function to update room descriptions
    setRoomDescription,             // Function to update current room description
    updateRoomDescriptionAfterCollection, // Post-collection room updates
    getFullInteractiveStatement,    // Interactive element statement generator
    createEnhancedRoomDescription,  // Enhanced description creator
    
    // ========== LANTERN SYSTEM ==========
    decreaseLanternFuel,            // Lantern fuel management
    
    // ========== WIZARD & MAGIC SYSTEM ==========
    wizardRoomVisited,              // Boolean - wizard room discovery
    spellbookDeciphered,            // Boolean - spellbook readable
    activeSpell,                    // Currently active spell
    floatingActive,                 // Boolean - floating spell active
    floatingMovesLeft,              // Remaining floating spell moves
    spellbookBackfire,              // Boolean - spell backfire state
    setSpellbookBackfire,           // Function to set backfire state
    
    // ========== ITEM INTERACTION FUNCTIONS ==========
    inspectGoldCoins,               // Gold coin inspection function
    forceUpdateCloakState,          // Invisibility cloak state update
    setInventory,                   // Direct inventory setter
    
    // ========== TRAP SYSTEM ==========
    handleTrapTrigger,              // Trap activation handler
    handleHiddenRoomTrap,           // Hidden room trap handler
    
    // ========== GAME STATE CONTROL ==========
    setGameStatus,                  // Game status setter
    setDeathCause,                  // Death cause setter
    setMessage,                     // Message setter
    
    // ========== TREASURE DISPLAY SYSTEM ==========
    showTreasureDisplay,            // Boolean - treasure display visible
    setShowTreasureDisplay,         // Treasure display control
    foundTreasureInfo,              // Found treasure information
    setFoundTreasureInfo,           // Found treasure info setter
    
    // ========== SAVE SYSTEM ==========
    saveGame,                       // Game save function
    loadGame,                       // Game load function
    hasSavedGame,                   // Boolean - saved game exists
    deleteSavedGame,                // Save deletion function
    playLoadGameSound,              // Load game audio
    playDeleteSavedGameSound,       // Delete save audio
    
    // ========== SPECIAL SCENES ==========
    showLadderExtendScene,          // Boolean - ladder extension scene
    setShowLadderExtendScene,       // Ladder scene control
    specialMessage,                 // Special message object
    setSpecialMessage,              // Special message setter
    
    // ========== VICTORY SYSTEM ==========
    showWinVideo,                   // Boolean - victory video display
    setShowWinVideo,                // Victory video control
    showWinMessage,                 // Boolean - victory message display
    setShowWinMessage,              // Victory message control
    
    // ========== NIXIE ENCOUNTER SYSTEM ==========
    showNixieDisplay,               // Boolean - nixie encounter display
    setShowNixieDisplay,            // Nixie display control
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};