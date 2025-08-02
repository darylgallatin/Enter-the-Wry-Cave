/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape, no-loop-func */

// ==================== IMPORTS ====================
// Core React hooks for state management and references
import { useRef } from 'react';
import { useState } from 'react';

// Utility imports for game content and messages
import getQuietMessage from '../data/randomThoughts';           // Random quiet room messages
import { getRandomCaveMessage, getContextualCaveMessage } from '../data/caveMessages';  // Cave ambient messages

// Uncommented utility imports (currently not in use)
//import { getFullInteractiveStatement, createEnhancedRoomDescription } from '../utils/descriptionUtils';

// ==================== UTILITY FUNCTIONS ====================

/**
 * Gets a valid adjacent position for the Wumpus to move to
 * The Wumpus can move +1, -1, +2, or -2 rooms, but will avoid dangerous areas
 * 
 * @param {number} currentPosition - Current Wumpus position (1-30)
 * @param {object} positions - Game positions object containing all entity positions
 * @param {number} playerPosition - Current player position to avoid
 * @param {object} specialRooms - Object containing special room data (sulfur crystals, etc.)
 * @returns {number} New valid position for Wumpus to move to
 */
const getAdjacentWumpusPosition = (currentPosition, positions, playerPosition, specialRooms) => {
  // ========== SAFETY CHECKS ==========
  // Check for undefined inputs - if critical data is missing, fallback to random position
  if (!positions || !currentPosition) {
    // Default to a random position as fallback
    return Math.floor(Math.random() * 30) + 1;
  }
  
  // ========== MOVEMENT OPTIONS ==========
  // Possible movement directions: +1, -1 are preferred (adjacent rooms)
  const possibleMoves = [1, -1];
  // Fallback moves: +2, -2 (rooms further away)
  const fallbackMoves = [2, -2];
  
  // Randomize the order of possible moves to make Wumpus movement unpredictable
  possibleMoves.sort(() => Math.random() - 0.5);
  fallbackMoves.sort(() => Math.random() - 0.5);
  
  // ========== IDENTIFY SULFUR ROOMS ==========
  // Safely check for sulfur rooms if specialRooms is defined
  // Wumpus avoids sulfur crystal rooms (they repel the Wumpus)
  const sulfurRooms = [];
  if (specialRooms) {
    Object.entries(specialRooms).forEach(([roomId, roomData]) => {
      if (roomData && (roomData.hasSulfurCrystal || roomData.itemId === 'sulfur_crystal')) {
        sulfurRooms.push(parseInt(roomId));
      }
    });
  }
  
  // ========== TRY ADJACENT POSITIONS FIRST ==========
  // First try adjacent positions (+1 or -1) for natural movement
  for (const move of possibleMoves) {
    const newPosition = currentPosition + move;
    
    // Check if this is a valid room number (1-30)
    if (newPosition < 1 || newPosition > 30) {
      continue;
    }
    
    // Check if this position is free of pits, bats, player, AND sulfur crystals
    if (
      newPosition !== positions.pitPosition1 &&
      newPosition !== positions.pitPosition2 &&
      newPosition !== positions.batPosition &&
      newPosition !== playerPosition &&
      !sulfurRooms.includes(newPosition)
    ) {
      return newPosition;
    }
  }
  
  // ========== FALLBACK LOGIC ==========
  // Rest of your existing code with similar safety checks...
  
  // Last resort: just make sure it doesn't overlap with pits, bats, or player
  let fallbackPosition;
  do {
    fallbackPosition = Math.floor(Math.random() * 30) + 1;
  } while (
    fallbackPosition === positions.pitPosition1 ||
    fallbackPosition === positions.pitPosition2 ||
    fallbackPosition === positions.batPosition ||
    fallbackPosition === playerPosition ||
    sulfurRooms.includes(fallbackPosition)
  );
  
  return fallbackPosition;
};

// ==================== MAIN HOOK DECLARATION ====================
/**
 * Main game logic hook that manages all game state and mechanics
 * This hook receives props from GameContext and returns game logic functions
 * 
 * @param {object} props - Destructured props containing all game state and setters
 * @returns {object} Object containing game logic functions (handleGuess, resetGame, etc.)
 */
const useGameLogic = ({
  // ========== BASIC GAME STATE ==========
  term,                           // Current input term from player
  setTerm,                        // Function to update input term
  currentPosition,                // Player's current room position (1-30)
  setCurrentPosition,             // Function to update player position
  gameStatus,                     // Current game status ('playing', 'won', 'lost')
  setGameStatus,                  // Function to update game status
  setMessage,                     // Function to set display messages
  roomDescription,                // Current room's description text
  setRoomDescription,             // Function to update room description
  history,                        // Array of previously visited rooms
  setHistory,                     // Function to update visit history
  perceptions,                    // Array of current threat perceptions
  setPerceptions,                 // Function to update perceptions
  
  // ========== ENCOUNTER MANAGEMENT ==========
  setBatEncounter,                // Function to set bat encounter state
  moveCounter,                    // Number of moves player has made
  setMoveCounter,                 // Function to update move counter
  positions,                      // Object containing all entity positions
  setPositions,                   // Function to update entity positions
  generateGamePositions,          // Function to generate new random positions
  
  // ========== ROOM STATE MANAGEMENT ==========
  setRoomMood,                    // Function to set room atmosphere/mood
  setDeathCause,                  // Function to set cause of death
  setRoomHasWater,                // Function to mark if room has water
  setRoomSpecial,                 // Function to set special room properties
  
  // ========== AUDIO FUNCTIONS ==========
  playWalkingSound,               // Function to play walking sound effects
  playRoomSound,                  // Function to play room-specific sounds
  playBatGrabScreamSound,         // Function to play bat grab scream
  playTeleportSound,              // Function to play teleport sound
  playMapFoundSound,              // Function to play map discovery sound
  playTreasureFoundSound,         // Function to play treasure found sound
  playAutoPickupSound,            // Function to play automatic pickup sound
  
  // ========== ROOM DESCRIPTION SYSTEM ==========
  roomDescriptionMap,             // Map of room numbers to description objects
  setRoomDescriptionMap,          // Function to update room descriptions
  availableRoomDescriptions,      // Pool of unused room descriptions
  setAvailableRoomDescriptions,   // Function to update available descriptions
  roomConnections,                // Map of room connections for navigation
  
  // ========== TREASURE HUNT SYSTEM ==========
  treasureMap,                    // Current treasure map state
  setTreasureMap,                 // Function to update treasure map
  treasurePieces,                 // Array of treasure objects in the game
  setTreasurePieces,              // Function to update treasure pieces
  collectedTreasures,             // Array of treasures player has collected
  setCollectedTreasures,          // Function to update collected treasures
  hasMap,                         // Boolean - does player have the map?
  setHasMap,                      // Function to update map possession
  mapClue,                        // Current map clue information
  setBatEncounters,               // Function to track bat encounter history
  
  // ========== LIGHTING SYSTEM ==========
  torchLevel,                     // Current torch fuel level (0-100)
  setTorchLevel,                  // Function to update torch level
  darknessCounter,                // Counter for moves in darkness
  setDarknessCounter,             // Function to update darkness counter
  MAX_DARKNESS,                   // Maximum moves allowed in darkness
  
  // ========== COMMENTED OUT THIRST SYSTEM ==========
  //thirstCounter,                // (Disabled) Player thirst level
  //setThirstCounter,             // (Disabled) Function to update thirst
  //MAX_THIRST,                   // (Disabled) Maximum thirst level
  
  // ========== SPECIAL ROOMS AND INVENTORY ==========
  specialRooms,                   // Object containing special room data
  setSpecialRooms,                // Function to update special rooms
  inventory,                      // Player's inventory array
  setInventory,                   // Function to update inventory
  addItemToInventory,             // Function to add items to inventory
  itemTypes,                      // Available item type definitions
  initializeSpecialRooms,         // Function to set up special rooms
  collectSecretRoomItem,          // Function to collect secret items
  updateRoomDescriptionAfterCollection, // Function to update room after item pickup
  decreaseLanternFuel,            // Function to decrease magical lantern fuel
  
  // ========== GIFT SHOP SYSTEM ==========
  giftShopRoom,                   // Current gift shop room number
  setGiftShopRoom,                // Function to set gift shop location
  showTradeButton,                // Boolean - show trade interface?
  setShowTradeButton,             // Function to toggle trade button
  
  // ========== SHIFTING ROOM MECHANICS ==========
  shiftingRoomId,                 // ID of the room that changes descriptions
  setShiftingRoomId,              // Function to set shifting room
  originalRoomDescription,        // Original description before shifting
  setOriginalRoomDescription,     // Function to store original description
  originalRoomTreasure,           // Original treasure before shifting
  setOriginalRoomTreasure,        // Function to store original treasure
  shiftingRoomDescriptions,       // Array of possible shifting descriptions
  setShiftingRoomDescriptions,    // Function to update shifting descriptions
  currentShiftingIndex,           // Current index in shifting descriptions
  setCurrentShiftingIndex,        // Function to update shifting index
  hasVisitedShiftingRoom,         // Boolean - has player seen shifting room?
  setHasVisitedShiftingRoom,      // Function to mark shifting room as visited
  
  // ========== CREATURE WARNING SYSTEMS ==========
  setFungiWarning,                // Function to set fungi creature warning
  setRoomEntryTime,               // Function to track room entry time
  fungiWarning,                   // Current fungi warning state
  showWaterSpiritTradeButton,     // Boolean - show water spirit trade?
  setShowWaterSpiritTradeButton,  // Function to toggle water spirit trade
  
  // ========== NIGHT CRAWLER PROTECTION ==========
  //nightCrawlerWarning,          // (Commented) Night crawler warning state
  setNightCrawlerWarning,         // Function to set night crawler warnings
  //nightCrawlerProtection,       // (Commented) Protection status
  setNightCrawlerProtection,      // Function to set protection status
  //nightCrawlerProtectionTimer,  // (Commented) Protection timer
  setNightCrawlerProtectionTimer, // Function to set protection timer
  //placeCaveSalt                 // (Commented) Cave salt placement function
  
  // ========== CRYSTAL ROOM MECHANICS ==========
  crystalRoomWarning,             // Warning state for crystal rooms
  setCrystalRoomWarning,          // Function to set crystal warnings
  crystalEntryTime,               // Time when player entered crystal room
  setCrystalEntryTime,            // Function to set crystal entry time
  
  // ========== SPECIAL ABILITIES AND EFFECTS ==========
  addInvisibilityCloakToGame,     // Function to add invisibility cloak
  checkTemperatureEffects,        // Function to check temperature effects
  temperatureTimer,               // Timer for temperature-related effects
  setTemperatureTimer,            // Function to set temperature timer
  
  // ========== WIZARD MECHANICS ==========
  wizardRoomVisited,              // Boolean - has player visited wizard room?
  setWizardRoomVisited,           // Function to mark wizard room as visited
  spellbookDeciphered,            // Boolean - has spellbook been read?
  setSpellbookDeciphered,         // Function to mark spellbook as read
  activeSpell,                    // Currently active spell effect
  setActiveSpell,                 // Function to set active spell
  floatingActive,                 // Boolean - is floating spell active?
  setFloatingActive,              // Function to toggle floating spell
  floatingMovesLeft,              // Number of floating moves remaining
  setFloatingMovesLeft,           // Function to update floating moves
  
  // ========== UTILITY FUNCTIONS ==========
  calculateDistanceToRoom,        // Function to calculate room distances
  isPoolRoom,                     // Function to check if room has water
  
  // ========== GOBLIN SHOP SYSTEM ==========
  goblinCooldown,                 // Cooldown timer for goblin interactions
  setGoblinCooldown,              // Function to update goblin cooldown
  shopMode,                       // Boolean - is shop interface active?
  setShopMode,                    // Function to toggle shop mode
  processShopPurchase,            // Function to handle shop purchases
  giftShopCatalog,                // Available items in gift shop (testing only)
  
  // ========== TREASURE DISPLAY SYSTEM ==========
  setShowTreasureDisplay,         // Function to show treasure found display
  setFoundTreasureInfo,           // Function to set found treasure info
  
  // ========== NIXIE AUDIO FUNCTIONS ==========
  playNixieTollReqiuredSound,     // Audio for nixie toll requirement
  playNixieOneGoldCoinSound,      // Audio for nixie one gold coin
  playNixieGoldenCompassSound,    // Audio for nixie golden compass
  playNixieAFairTradeSoun,        // Audio for nixie fair trade
  playShopKeeperFileSound,        // Audio for shop keeper
  playSandCreatureHissSound,      // Audio for sand creature hiss
  playShopKeeperRepellentSound,   // Audio for shop keeper repellent
  playSandCreatureShriekSound     // Audio for sand creature shriek
  
  //startingRoomFixed             // (Commented) Fixed starting room option
}) => {
  
  // ==================== HOOK INTERNAL STATE AND REFS ====================
  
  // Reference to track same room entry attempts (for wizard teleport mechanic)
  const sameRoomAttemptsRef = useRef(0);
  
  // Reference to track the last room entered (for wizard teleport logic)
  const lastRoomEnteredRef = useRef(null);
  
  // Reference to count wizard summon attempts
  const wizardSummonCountRef = useRef(0);
  
  // State for Wumpus attack timing
  const [wumpusAttackTimer, setWumpusAttackTimer] = useState(null);
  
  // State for nixie (water fairy) trade display
  const [showNixieDisplay, setShowNixieDisplay] = useState(false);
  
  // ==================== UTILITY FUNCTIONS ====================
  
  /**
   * Checks if player is currently floating (has floating spell active with moves left)
   * @returns {boolean} True if player can float, false otherwise
   */
  const isFloating = () => floatingActive && floatingMovesLeft > 0;
  
  /**
   * Initializes oil flasks in safe rooms for torch refueling
   * Places exactly one oil flask in a random safe room that doesn't conflict with other game elements
   */
    const initializeOilFlasks = () => {
    // ========== FIND SAFE ROOMS ==========
    // Get a few rooms that aren't dangerous or special
    const safeRooms = [];
    for (let i = 1; i <= 30; i++) {
      const roomText = roomDescriptionMap[i]?.text || '';
      if (
        // Exclude all dangerous and special locations
        i !== positions.wumpusPosition &&
        i !== positions.pitPosition1 &&
        i !== positions.pitPosition2 &&
        i !== positions.batPosition &&
        i !== positions.exitPosition &&
        i !== treasureMap &&
        !isPoolRoom(roomText) &&
        // Check if room has a treasure (important!)
        !treasurePieces.some(treasure => treasure.room === i)
      ) {
        safeRooms.push(i);
      }
    }
    
    // ========== PLACE OIL FLASK ==========
    // Shuffle and pick a SINGLE room for oil flask (only one as requested)
    const shuffledRooms = [...safeRooms].sort(() => Math.random() - 0.5);
    const oilRoom = shuffledRooms[0]; // Just one room
   
    console.log(`Oil flask will be placed in room: ${oilRoom}`);
    
    // Place oil in this room
    // Double-check this isn't a treasure room
    if (treasurePieces.some(treasure => treasure.room === oilRoom)) {
      console.log(`Skipping oil flask in room ${oilRoom} - it has a treasure!`);
      return;
    }
    
    // ========== UPDATE ROOM DESCRIPTION ==========
    const updatedDesc = {...(roomDescriptionMap[oilRoom] || {})};
    
    if (!updatedDesc.text) {
      updatedDesc.text = "A small chamber with rough walls.";
    }
    
    // IMPORTANT: Store the original description before adding the oil flask
    updatedDesc.originalText = updatedDesc.text;
    
    // Add the oil flask to the description
    updatedDesc.text = `${updatedDesc.text} On a small ledge, you spot a <span class='interactive-item' data-item='torch_oil'>flask of oil</span>.`;
    updatedDesc.textAfterCollection = updatedDesc.text.replace(` On a small ledge, you spot a <span class='interactive-item' data-item='torch_oil'>flask of oil</span>.`, '');
    updatedDesc.hasInteractiveItem = true;
    updatedDesc.interactiveItem = 'torch_oil';
    
    setRoomDescriptionMap(prev => ({
      ...prev,
      [oilRoom]: updatedDesc
    }));
    
    console.log(`Oil flask placed in room: ${oilRoom}`);
  };

  /**
   * Checks if player can collect a treasure (requires canvas bag)
   * @param {object} treasure - The treasure object to check
   * @returns {boolean} True if treasure can be collected, false otherwise
   */
  const canCollectTreasure = (treasure) => {
    // Check if player has canvas bag (required for treasure collection)
    const hasCanvasBag = inventory.some(item => 
      (item.originalId || item.id) === 'canvas_bag'
    );
    
    if (!hasCanvasBag) {
      setMessage(`You found the ${treasure.name}, \nbut as you try to pick it up to put it in one of your pockets the treasure refuses to let you pick it up.\n\nYou reluctantly leave the ${treasure.name} where it is.\nMaybe you need some other item before you can grab the treasures?`);
      return false;
    }
    
    return true;
  };

  /**
   * Updates the goblin cooldown timer (decreases by 1 each turn)
   * Used to prevent spam interactions with goblin merchant
   */
  const updateGoblinCooldown = () => {
    if (goblinCooldown > 0) {
      setGoblinCooldown(prev => {
        const newCooldown = prev - 1;
        console.log(`Goblin cooldown: ${newCooldown}`);
        return newCooldown;
      });
    }
  };

  /**
   * Highlights pit rooms when player feels a breeze
   * Provides visual feedback by making pit room buttons glow briefly
   */
  const highlightPitRooms = () => {
    // Check if player is near a pit (breeze perception)
    const hasBreeze = perceptions.some(p => 
      p.includes('draft') || p.includes('breeze')
    );
    
    if (!hasBreeze || !currentPosition) {
      return; // No pit nearby or no current position
    }
    
    console.log("Breeze detected, checking for pit rooms...");
    
    // Get connected rooms to current position
    const connectedRooms = roomConnections[currentPosition] || [];
    
    // Check which connected rooms have a pit
    const pitRooms = connectedRooms.filter(room => 
      room === positions.pitPosition1 || room === positions.pitPosition2
    );
    
    if (pitRooms.length === 0) {
      console.log("No pit found in connected rooms. This is odd...");
      return;
    }
    
    console.log(`Found pit(s) in rooms: ${pitRooms.join(', ')}`);
    
    // Add subtle visual hint for each pit room
    pitRooms.forEach(pitRoom => {
      addPitWarningEffect(pitRoom);
    });
  };

  /**
   * Adds visual warning effect to a pit room button
   * Creates a temporary CSS animation to make the pit room button glow
   * @param {number} pitRoom - The room number containing a pit
   */
  const addPitWarningEffect = (pitRoom) => {
    console.log(`Attempting to highlight pit room ${pitRoom}...`);
    
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      // Find all connection buttons
      const allButtons = document.querySelectorAll('.connection-btn');
      console.log(`Found ${allButtons.length} connection buttons`);
      
      // Log all buttons for debugging
      Array.from(allButtons).forEach(btn => {
        console.log(`Button text: "${btn.textContent.trim()}"`);
      });
      
      // Find the button for the pit room
      const roomButton = Array.from(allButtons).find(btn => 
        btn.textContent.trim() === pitRoom.toString()
      );
      
      if (!roomButton) {
        console.log(`Could not find button for pit room ${pitRoom}`);
        return;
      }
      
      console.log(`Found button for pit room ${pitRoom}, applying warning effect`);
      
      // Create unique ID for this animation
      const uniqueID = `pit-warning-${Date.now()}`;
      
      // Create a style element
      const styleElement = document.createElement('style');
      styleElement.id = uniqueID;
      
      // Define a more noticeable animation for the pit warning
      styleElement.textContent = `
        @keyframes pit-warning-${uniqueID} {
          0% { 
            background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
          }
          50% { 
            background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
            box-shadow: 0 0 15px #a87b57;
          }
          100% { 
            background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
          }
        }
        
        .pit-warning-${uniqueID} {
          animation: pit-warning-${uniqueID} 1.0s ease-in-out 2;
        }
      `;
      
      // Add the style to the document
      document.head.appendChild(styleElement);
      
      // Add the class to the button
      roomButton.classList.add(`pit-warning-${uniqueID}`);
      
      // Remove the class and style element after animation completes
      // ADJUST THIS TIMEOUT TO MATCH YOUR ANIMATION:
      setTimeout(() => {
        roomButton.classList.remove(`pit-warning-${uniqueID}`);
        const styleElem = document.getElementById(uniqueID);
        if (styleElem) {
          document.head.removeChild(styleElem);
        }
        console.log(`Removed pit warning effect from room ${pitRoom}`);
      }, 3500); // Currently 3.5 seconds (should be: duration × iteration-count + buffer)
      // If you change to 2s × 5 repeats, set this to 10500 (10.5 seconds)
    });
  };

  /**
   * Calculates threat perceptions based on current position
   * Checks adjacent rooms for Wumpus, pits, bats, and exit
   * @param {number} position - Current player position
   * @returns {Array} Array of perception strings
   */
  const getThreatPerceptions = (position) => {
    // If no valid position, return empty array
    if (!position) return [];
    
    const threatPerceptions = [];
    
    // Get the connected rooms for the current position
    const connectedRooms = roomConnections[position] || [];
    
    console.log(`Position: ${position}, Connected rooms: ${connectedRooms.join(', ')}`);
    
    // Check if wumpus is in a connected room
    if (connectedRooms.includes(positions.wumpusPosition)) {
      threatPerceptions.push("You smell something terrible nearby...");
    }
    
    // Check if any pit is in a connected room
    const pitRooms = connectedRooms.filter(room => 
      room === positions.pitPosition1 || room === positions.pitPosition2
    );
    
    // ONLY add the perception message ONCE, no matter how many pits are nearby
    if (pitRooms.length > 0) {
      threatPerceptions.push("You feel a draft coming from somewhere close...");
      console.log(`Found pits in rooms: ${pitRooms.join(', ')}`);
      
      // Add a brief delay to allow for the DOM to update
      setTimeout(() => {
        pitRooms.forEach(pitRoom => {
          addPitWarningEffect(pitRoom);
        });
      }, 500);
    }
    
    // Check if bat is in a connected room
    if (connectedRooms.includes(positions.batPosition)) {
      threatPerceptions.push("You hear wings flapping in the darkness...");
    }
    
    // Check if exit is in a connected room
    if (connectedRooms.includes(positions.exitPosition)) {
      threatPerceptions.push("You feel a fresh breeze. The exit must be nearby!");
    }
    
    return threatPerceptions;
  };
  
  /**
   * Gets a random empty position for teleportation
   * Excludes dangerous rooms and current position
   * @param {Array} excludePositions - Positions to avoid
   * @returns {number} A safe random position
   */
  const getRandomEmptyPosition = (excludePositions) => {
    let newPosition;
    do {
      newPosition = Math.floor(Math.random() * 30) + 1;
    } while (excludePositions.includes(newPosition));
    
    return newPosition;
  };
  
  /**
   * Handles wizard teleportation when player attempts same room multiple times
   * Teleports player to random safe location after wizard encounter
   */
  const handleWizardTeleport = () => {
    // Get positions to exclude
    const excludePositions = [
      positions.wumpusPosition,
      positions.pitPosition1,
      positions.pitPosition2,
      positions.batPosition,
      positions.exitPosition,
      currentPosition
    ];
    
    // Get a random empty position
    const newPosition = getRandomEmptyPosition(excludePositions);
    
    // Play teleport sound
    playTeleportSound();
    
    // Show wizard message
    setMessage('The Evil Cave Wizard appears in a flash of purple smoke! "STOP THAT!" he bellows, teleporting you away with a flick of his wand!');
    setRoomMood('wizard');
    setTerm('');
    
    // Reset the counter
    sameRoomAttemptsRef.current = 0;
    lastRoomEnteredRef.current = null;
    
    // After showing wizard message, move to new position
    setTimeout(() => {
      setCurrentPosition(newPosition);
      setHistory([...history, newPosition]);
      checkPosition(newPosition);
    }, 3000);
  };
  



// ==================== ROOM DESCRIPTION UPDATE SYSTEM ====================
  
  /**
   * Updates room description and room-specific effects based on current position
   * This is one of the most complex functions - handles multiple room types and states
   * @param {number} position - Current room position (1-30)
   * @returns {object} Object containing perception and specialType for the room
   */
  const updateRoomDescription = (position) => {
    
    // ========== HELPER FUNCTION: EXIT ROOM DISPLAY ==========
    /**
     * Checks if this is the exit room and handles ladder visibility logic
     * The ladder's visibility depends on wyrmglass possession and lantern state
     * @param {object} roomInfo - Room data object
     * @param {number} position - Current room position
     * @returns {string} Modified room description text
     */
    const checkAndDisplayExit = (roomInfo, position) => {
      // Check if this is the exit room
      if (roomInfo?.isExitRoom || roomInfo?.special === 'exit' || position === positions.exitPosition) {
        // Check if player has wyrmglass (magical lens for seeing through illusions)
        const hasWyrmglass = inventory.some(item => 
          (item.originalId || item.id) === 'wyrmglass'
        );
        
        if (hasWyrmglass) {
          // Check if lantern is active
          const hasActiveLantern = inventory.some(item => 
            (item.originalId || item.id) === 'lantern' && item.isActive
          );
          
          // If lantern is ON, ladder is INVISIBLE (magical paradox)
          if (hasActiveLantern) {
            // Just return the base room text without any ladder mention
            return roomInfo.text;
          }
          
          // Lantern is OFF, so ladder is visible
          // Check if ladder has been extended (after wyrmglass interaction)
          const ladderExtended = specialRooms[position]?.ladderExtended;
          
          if (ladderExtended) {
            // Show extended ladder (after using wyrmglass)
            return roomInfo.text + " In the corner stands a rickety ladder that now MAGICALLY EXTENDS all the way up through the shaft, glowing with a faint ethereal light. <span class='interactive-item' data-item='ladder'>The ladder</span> looks sturdy and ready to support your escape!";
          } else {
            // Show unextended ladder (before using wyrmglass)  
            return roomInfo.text + " In the corner stands a rickety ladder that extends only halfway up the shaft. Above it, you can see tantalizing daylight, but the ladder doesn't reach that far. <span class='interactive-item' data-item='ladder'>The ladder</span> looks old and unstable.";
          }
        } else {
          // No wyrmglass - just show normal room description
          return roomInfo.text;
        }
      } 
        
      // Not the exit room - return normal text
      return roomInfo.text;
    };

    // ========== SHIFTING ROOM SPECIAL HANDLING ==========
    // CRITICAL FIX: If this is the shifting room and player has stabilizer, skip normal processing
    if (position === shiftingRoomId) {
      const hasStabilizer = inventory.some(item => 
        (item.originalId || item.id) === 'reality_stabilizer'
      );

      if (hasStabilizer) {
        console.log("Skipping updateRoomDescription for shifting room - stabilizer active");
        
        // Just return the perception for the original room
        const originalDesc = shiftingRoomDescriptions && shiftingRoomDescriptions[0];
        if (originalDesc) {
          return {
            perception: originalDesc.perception || null,
            specialType: originalDesc.special || null
          };
        }
        
        return {
          perception: null,
          specialType: null
        };
      }
    }
    
    // ========== SHIFTING ROOM STATE UPDATES ==========
    // CRITICAL: Handle shifting room state updates first
    if (roomDescriptionMap[position]?.isShiftingRoom) {
      console.log(`Position ${position} is a shifting room - ensuring state variables match current description`);
      
      const currentRoomData = roomDescriptionMap[position];
      if (currentRoomData) {
        // Force update all state variables to match current room data
        setRoomMood(currentRoomData.mood || 'mysterious');
        setRoomHasWater(currentRoomData.hasWater || false);
        setRoomSpecial(currentRoomData.special || null);
        
        console.log(`Shifting room state updated - Mood: ${currentRoomData.mood}, HasWater: ${currentRoomData.hasWater}, Special: ${currentRoomData.special}`);
        
        // Update room description with exit check
        const displayText = checkAndDisplayExit(currentRoomData, position);
        setRoomDescription(displayText);
        
        // CRITICAL: Play sounds based on room data
        playWalkingSound(currentRoomData.hasWater);
        
        // CRITICAL: Play special room sound if it exists
        if (currentRoomData.sound) {
          console.log(`Playing special room sound: ${currentRoomData.sound}`);
          playRoomSound(currentRoomData.sound);
        }
        
        // CRITICAL: Return null perception here - let updatePerceptions handle it
        return {
          perception: null, // Don't return perception here for shifting rooms
          specialType: currentRoomData.special
        };
      }
    } 
    
    // ========== SPECIAL ROOM 31 HANDLING ==========
    // Check for special rooms 31 and 32 first
    if (position === 31) {
      const info31 = roomDescriptionMap[31];
      if (info31) {
        const displayText = checkAndDisplayExit(info31, position);
        setRoomDescription(displayText);
        setRoomMood(info31.mood || 'magical');
        setRoomHasWater(info31.hasWater || false);
        setRoomSpecial(info31.special || null);
        playWalkingSound(info31.hasWater);
        if (info31.sound) playRoomSound(info31.sound);
        return {
          perception: info31.perception,
          specialType: info31.special
        };
      }
    }
    
    // Get room info for current position
    const roomInfo = roomDescriptionMap[position];  
    
    // ========== WIZARD'S TELEPORT ROOM (ROOM 32) ==========
    // Special case for the wizard's teleport room (Room 32)
    if (position === 32) {
      // Just use whatever is in roomDescriptionMap - no special checks needed
      if (roomInfo) {
        const displayText = checkAndDisplayExit(roomInfo, position);
        setRoomDescription(displayText);
        setRoomMood(roomInfo.mood);
        setRoomHasWater(roomInfo.hasWater || false);
        setRoomSpecial(roomInfo.special);
        
        if (roomInfo.hasWater) playWalkingSound(true);
        if (roomInfo.sound) playRoomSound(roomInfo.sound);
        
        return {
          perception: roomInfo.perception,
          specialType: roomInfo.special
        };
      }
    }

    // ========== DISTURBED POOL ROOM HANDLING ==========
    // CRITICAL: Check for pool disturbance FIRST
    if (roomInfo && roomInfo.poolDisturbed) {
      console.log(`Room ${position} is a disturbed pool room - using permanent disturbed description`);
      
      // Use the enhanced disturbed text if available, otherwise use textAfterCollection
      const disturbedText = roomInfo.enhancedTextAfterDisturbance || 
                           roomInfo.textAfterCollection || 
                           "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening.";
      
      const displayText = checkAndDisplayExit({ ...roomInfo, text: disturbedText }, position);
      setRoomDescription(displayText);
      setRoomMood('dangerous');
      setRoomHasWater(true);
      setRoomSpecial(null);
      
      // Play water sound for the disturbed pool
      playWalkingSound(true);
      
      return {
        perception: "You sense something large and hostile lurking in the murky depths.",
        specialType: null
      };
    }

    // ========== TELEPORT ROOM HANDLING ==========
    // Check for teleport room first
    const hasTeleportInSpecialRooms = specialRooms[position]?.hasTeleport;
    
    if (hasTeleportInSpecialRooms) {
      const orbFeature = specialRooms[position]?.orbFeature || "unusual energy";
      
      // Determine if this is the first or second teleport room
      const teleportRooms = Object.entries(specialRooms)
        .filter(([roomId, roomData]) => roomData.hasTeleport && parseInt(roomId) <= 30)
        .map(([roomId]) => parseInt(roomId));
      
      // Sort the teleport rooms so we know which is first/second
      teleportRooms.sort((a, b) => a - b);
      
      // Determine which format to use (first room or second room)
      const isFirstTeleportRoom = teleportRooms[0] === position;
      
      // If we have room info already (returning to teleport room)
      if (roomInfo) {
        // Check if items have been collected from this room and textAfterCollection exists
        const hasCollectedItems = roomInfo.collectedItems && roomInfo.collectedItems.length > 0;
        
        // Get the basic description - use textAfterCollection if applicable
        let description = roomInfo.text;
        
        // CRITICAL CHANGE: Always use textAfterCollection if it exists
        if (hasCollectedItems && roomInfo.textAfterCollection) {
          console.log(`Using after-collection description for room ${position}`);
          console.log(`After-collection description: ${roomInfo.textAfterCollection.substring(0, 50)}...`);
          description = roomInfo.textAfterCollection;
        }
        
        // Check if lantern is active
        const hasActiveLantern = inventory.some(item => 
          (item.originalId || item.id) === 'lantern' && item.isActive
        );
        
        // Use enhanced text if available and lantern is active
        if (hasActiveLantern && roomInfo.enhancedText) {
          // Use the createEnhancedRoomDescription function to preserve interactive elements
          description = createEnhancedRoomDescription(description, roomInfo.enhancedText);
        }
        
        // Check if this is the pool room
        const isPoolRoom = roomInfo?.hasPoolTreasures === true || 
                           roomInfo?.text?.includes('pool of clear water') ||
                           roomInfo?.text?.includes("nature's most inconvenient wading pool") ||
                           roomInfo?.enhancedText?.includes('deceptively clear pool') ||
                           roomInfo?.poolDisturbed === true;

        // Only add teleport hint if it's not already there AND it's not the pool room
        if (!description.includes('strange circular pattern') && 
            !description.includes('unusual energy') && 
            !isPoolRoom) {
          // Use different hint format based on which teleport room this is
          if (isFirstTeleportRoom) {
            description += ` There's a strange circular pattern around ${orbFeature}.`;
          } else {
            description += ` You notice unusual energy emanating from ${orbFeature}.`;
          }
          
          // Update room description map to include the hint for future visits
          setRoomDescriptionMap(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              text: description,
              hasTeleport: true
            }
          }));
        }
        
        // Update description for display with exit check
        const displayText = checkAndDisplayExit({ ...roomInfo, text: description }, position);
        setRoomDescription(displayText);
        
        // Rest of your existing code for returned room
        setRoomMood(roomInfo.mood || 'mysterious');
        setRoomHasWater(roomInfo.hasWater || false);
        setRoomSpecial(roomInfo.special || null);
        
        playWalkingSound(roomInfo.hasWater);
        if (roomInfo.sound) {
          playRoomSound(roomInfo.sound);
        }
        
        return {
          perception: roomInfo.perception,
          specialType: roomInfo.special
        };
      }
      
      // Handle first-time visit to a teleport room
      // (Code for first visit stays mostly the same)
    }
    
    // ========== HIDDEN DOOR ROOM HANDLING ==========
    // Check hidden door rooms (similar pattern as teleport rooms)
    const hasHiddenDoorInSpecialRooms = specialRooms[position]?.hasHiddenDoor;
    
    if (hasHiddenDoorInSpecialRooms) {
      const doorFeature = specialRooms[position]?.doorFeature || "the wall";
      
      // If we have room info already (returning to hidden door room)
      if (roomInfo) {
        // Check if items have been collected from this room and textAfterCollection exists
        const hasCollectedItems = roomInfo.collectedItems && roomInfo.collectedItems.length > 0;
        
        // Get the basic description - use textAfterCollection if applicable
        let description = roomInfo.text;
        if (hasCollectedItems && roomInfo.textAfterCollection) {
          console.log(`Using after-collection description for hidden door room ${position}`);
          description = roomInfo.textAfterCollection;
        }
        
        // Check if lantern is active
        const hasActiveLantern = inventory.some(item => 
          (item.originalId || item.id) === 'lantern' && item.isActive
        );
        
        // Use enhanced text if available and lantern is active
        if (hasActiveLantern && roomInfo.enhancedText) {
          // Use the createEnhancedRoomDescription function to preserve interactive elements
          description = createEnhancedRoomDescription(description, roomInfo.enhancedText);
        }
        
        // Only add hidden door hint if it's not already there
        if (!description.includes('keyhole hidden among')) {
          description += ` You notice what appears to be a keyhole hidden among ${doorFeature}.`;
          
          // Update room description map to include the hint for future visits
          setRoomDescriptionMap(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              text: description,
              hasHiddenDoor: true
            }
          }));
        }
        
        // Update description for display with exit check
        const displayText = checkAndDisplayExit({ ...roomInfo, text: description }, position);
        setRoomDescription(displayText);
        
        setRoomMood(roomInfo.mood || 'mysterious');
        setRoomHasWater(roomInfo.hasWater || false);
        setRoomSpecial(roomInfo.special || null);
        
        playWalkingSound(roomInfo.hasWater);
        if (roomInfo.sound) {
          playRoomSound(roomInfo.sound);
        }
        
        return {
          perception: roomInfo.perception,
          specialType: roomInfo.special
        };
      }
      
      // Handle first-time visit to a hidden door room
      // (Code for first visit stays mostly the same)
    }
    
    // ========== NORMAL ROOM HANDLING ==========
    // Normal room handling (not special or teleport/hidden door)
    if (roomInfo) {
      // CRITICAL CHANGE: Check if items have been collected from this room
      const hasCollectedItems = roomInfo.collectedItems && roomInfo.collectedItems.length > 0;
      
      // Get the basic description - prioritize textAfterCollection if it exists
      let description = roomInfo.text;
      
      // CRITICAL CHANGE: Always use textAfterCollection if it exists
      if (hasCollectedItems && roomInfo.textAfterCollection) {
        console.log(`Using after-collection description for room ${position}`);
        console.log(`After-collection description: ${roomInfo.textAfterCollection.substring(0, 50)}...`);
        description = roomInfo.textAfterCollection;
      }
      
      // Check if lantern is active
      const hasActiveLantern = inventory.some(item => 
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      // Check if this room has a revealed hidden item
      const hasRevealedItem = specialRooms[position]?.itemRevealed;
      
      // CRITICAL: Skip enhanced text if pool is disturbed
      if (roomInfo.poolDisturbed) {
        console.log("Pool is disturbed - skipping enhanced text processing");
        // Description is already set from the pool disturbance check above
      }
      // If lantern is active and enhanced text is available, use it
      else if (hasActiveLantern && roomInfo.enhancedText) {
        // Use createEnhancedRoomDescription to preserve interactive items
        description = createEnhancedRoomDescription(description, roomInfo.enhancedText);
        
        // If room has revealed items, make sure they're included
        if (hasRevealedItem) {
          // Look for revealed item text in current roomInfo.text
          const revealedItemMatch = roomInfo.text.match(/Your lantern illuminates.*?crystal orb.*?\./);
          if (revealedItemMatch && !description.includes(revealedItemMatch[0])) {
            description += " " + revealedItemMatch[0];
          }
        }
      } 
      
      // CRITICAL DEBUG: Log what's being displayed 
      console.log(`Setting room description for room ${position}`);
      console.log(`Has collected items: ${hasCollectedItems}`);
      console.log(`textAfterCollection exists: ${Boolean(roomInfo.textAfterCollection)}`);
      console.log(`Final description being used: ${description.substring(0, 50)}...`);
      
      // Update room description state with exit check
      const displayText = checkAndDisplayExit({ ...roomInfo, text: description }, position);
      setRoomDescription(displayText);
      
      // Rest of function remains unchanged
      setRoomMood(roomInfo.mood || 'mysterious');
      setRoomHasWater(roomInfo.hasWater || false);
      setRoomSpecial(roomInfo.special || null);
      
      playWalkingSound(roomInfo.hasWater);
      if (roomInfo.sound) {
        playRoomSound(roomInfo.sound);
      }
      
      return {
        perception: roomInfo.perception,
        specialType: roomInfo.special
      };
    }
    
    // ========== FIRST-TIME ROOM VISIT HANDLING ==========
    // First time visiting this room - your existing code for new rooms
    let newRoomInfo = roomDescriptionMap[position];
    
    // The rest of your existing code for handling first visits...
    if (!newRoomInfo && availableRoomDescriptions.length > 0) {
      console.log(`No pre-assigned description for room ${position}, assigning a unique description from the pool`);
      
      const availableDescriptions = [...availableRoomDescriptions];
      newRoomInfo = availableDescriptions.pop();
      
      setAvailableRoomDescriptions(availableDescriptions);
    } else if (!newRoomInfo) {
      console.warn('Ran out of descriptions! Using default fallback.');
      newRoomInfo = {
        text: "A plain cave passage with nothing remarkable about it.",
        mood: "mysterious",
        hasWater: false,
        special: null,
        sound: null,
        perception: null
      };
    } else {
      console.log(`First visit to room ${position}, using pre-assigned description`);
      
      // CRITICAL CHANGE: Check for after-collection description
      if (newRoomInfo.collectedItems && newRoomInfo.collectedItems.length > 0 && newRoomInfo.textAfterCollection) {
        console.log(`Using after-collection description for first revisit to room ${position}`);
        console.log(`After-collection text: ${newRoomInfo.textAfterCollection.substring(0, 50)}...`);
        newRoomInfo.text = newRoomInfo.textAfterCollection;
      }
    }
    
    // Save this description to the map for future visits
    setRoomDescriptionMap(prev => ({
      ...prev,
      [position]: newRoomInfo
    }));
    
    // Update room state with exit check
    const displayText = checkAndDisplayExit(newRoomInfo, position);
    setRoomDescription(displayText);
    setRoomMood(newRoomInfo.mood || 'mysterious');
    setRoomHasWater(newRoomInfo.hasWater || false);
    setRoomSpecial(newRoomInfo.special || null);
    
    playWalkingSound(newRoomInfo.hasWater);
    if (newRoomInfo.sound) {
      playRoomSound(newRoomInfo.sound);
    }
    
    return {
      perception: newRoomInfo.perception,
      specialType: newRoomInfo.special
    };
  };




// ==================== ROOM REFRESH AND ENHANCEMENT SYSTEM ====================
  
  /**
   * Refreshes the current room description when lantern state changes
   * This function is called when the magical lantern is turned on/off to update what's visible
   * Handles special cases like disturbed pools and backpack rooms
   */
  const refreshRoomWithLantern = () => {
    console.log("Refreshing room with lantern state change - current position:", currentPosition);
    
    // Only refresh if player is in a valid position and game is active
    if (currentPosition && gameStatus === 'playing') {
      console.log("Refreshing room with lantern state change - current position:", currentPosition);

      // Get the room information for current position
      const roomInfo = roomDescriptionMap[currentPosition];

      if (roomInfo) {
        
        // ========== DISTURBED POOL SPECIAL HANDLING ==========
        // CRITICAL: Check if pool is disturbed FIRST
        // Disturbed pools maintain their dangerous state regardless of lantern
        if (roomInfo.poolDisturbed) {
          console.log("Pool is disturbed - maintaining disturbed state");
          // Use the enhanced disturbed text if available
          const disturbedText = roomInfo.enhancedTextAfterDisturbance || 
                               roomInfo.textAfterCollection || 
                               "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening.";
          setRoomDescription(disturbedText);
          setRoomMood('dangerous'); // Ensure mood stays dangerous
          // Don't process any enhanced text or hints for disturbed pool
          return;
        }
        
        // ========== CHECK LANTERN STATE ==========
        // Check if lantern is active
        const hasActiveLantern = inventory.some(item => 
          (item.originalId || item.id) === 'lantern' && item.isActive
        );

        // ========== BACKPACK ROOM SPECIAL HANDLING ==========
        // Special handling for backpack room (contains spellbook when lantern is active)
        const isBackpackRoom = (roomId) => {
          const roomDesc = roomDescriptionMap[roomId]?.text || '';
          return roomDesc.toLowerCase().includes('backpack with half-eaten rations') && 
                 roomDesc.toLowerCase().includes('map that simply says');
        };

        // ========== LANTERN INACTIVE - NORMAL DESCRIPTIONS ==========
        // If lantern is inactive, handle normal and backpack room cases
        if (!hasActiveLantern) {
          console.log("Lantern is inactive - showing normal description");
          
          if (isBackpackRoom(currentPosition)) {
            console.log("Special handling for backpack room - hiding spellbook");
            // Hide the spellbook when lantern is off
            const originalText = roomInfo.originalText ||
              "You find a backpack with half-eaten rations. Inside is a map that simply says 'RUN!'";
            setRoomDescription(originalText);
          } else {
            // Show normal room description
            setRoomDescription(roomInfo.text || "");
          }
          
          // Update perceptions for the room
          if (typeof updatePerceptions === 'function') {
            updatePerceptions(currentPosition);
          } else if (typeof checkPosition === 'function') {
            checkPosition(currentPosition);
          }
          return; // Exit early - no enhanced processing needed
        }

        // ========== LANTERN ACTIVE - ENHANCED DESCRIPTIONS ==========
        // Lantern is active - show enhanced description
        if (roomInfo.enhancedText) {
          console.log("Lantern is active - using enhanced description");
          
          // Extract important elements from current description
          const currentDescription = roomInfo.text;
          
          // ========== PRESERVE INTERACTIVE ITEMS ==========
          // Store common interactive item patterns to preserve them in enhanced text
          const commonPatterns = [
            { 
              regex: / On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./i, 
              itemType: 'torch_oil' 
            },
            { 
              regex: / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./i, 
              itemType: 'invisibility_cloak' 
            },
            { 
              regex: / Among them, you spot unusual <span class=['"]interactive-item['"][^>]*>salt-like crystals<\/span> with a subtle blue glow\./i, 
              itemType: 'cave_salt' 
            },
            { 
              regex: / Yellow <span class=['"]interactive-item['"][^>]*>sulfur crystals<\/span> line the walls\./i, 
              itemType: 'sulfur_crystal' 
            }
          ];
          
          // Find patterns that exist in current description
          const foundPatterns = [];
          commonPatterns.forEach(pattern => {
            const match = currentDescription.match(pattern.regex);
            if (match) foundPatterns.push({ fullText: match[0], itemType: pattern.itemType });
          });
          
          // ========== PRESERVE SPECIAL HINTS ==========
          // Extract special hints (keyhole, teleport patterns)
          const specialHints = [];
          
          // Check for keyhole hint
          const keyholeHint = currentDescription.match(/You notice what appears to be a keyhole hidden among.*?\./);
          if (keyholeHint) specialHints.push(keyholeHint[0]);
          
          // Check for teleport hint
          const teleportHint = currentDescription.match(/(There's a strange circular pattern.*?\.)|(You notice unusual energy emanating.*?\.)/);
          if (teleportHint) specialHints.push(teleportHint[0]);
          
          // ========== FIND REMAINING INTERACTIVE ITEMS ==========
          // Find remaining interactive items not caught by common patterns
          const itemRegex = /<span class=['"]interactive-item['"][^>]*>.*?<\/span>/g;
          let match;
          const matches = [];
          
          while ((match = itemRegex.exec(currentDescription)) !== null) {
            // Skip if already found in patterns
            if (!foundPatterns.some(p => p.fullText.includes(match[0]))) {
              matches.push({ html: match[0], index: match.index });
            }
          }
          
          // Get full statements for remaining interactive items
          for (const m of matches) {
            const fullStatement = getFullInteractiveStatement(currentDescription, m.index);
            foundPatterns.push({ fullText: fullStatement, itemType: getItemTypeFromSpan(m.html) });
          }
          
          // ========== COMBINE ENHANCED TEXT WITH PRESERVED ELEMENTS ==========
          // Combine enhanced text, hints, and items
          let newDescription = roomInfo.enhancedText;
          
          // Add special hints if they exist
          if (specialHints.length) {
            newDescription += " " + specialHints.join(" ");
          }
          
          // Add preserved interactive items if they don't already exist in enhanced text
          if (foundPatterns.length) {
            foundPatterns.forEach(pattern => {
              const itemTypeRegex = new RegExp(`data-item=['"]${pattern.itemType}['"]`, 'i');
              if (!itemTypeRegex.test(newDescription)) {
                newDescription += " " + pattern.fullText;
              }
            });
          }
          
          // ========== UPDATE ROOM STATE ==========
          // Update state with new enhanced description
          setRoomDescription(newDescription);
          setRoomDescriptionMap(prev => ({
            ...prev,
            [currentPosition]: { 
              ...prev[currentPosition], 
              displayText: newDescription 
            }
          }));
          
          // Reveal any hidden items after a brief delay
          if (typeof revealHiddenItems === 'function') {
            setTimeout(() => revealHiddenItems(currentPosition, inventory), 100);
          }
        } else {
          console.log("Lantern active but no enhanced text - showing normal description");
          // Lantern is active but no enhanced text available
          setRoomDescription(roomInfo.text || "");
        }

        // ========== UPDATE PERCEPTIONS ==========
        // Update perceptions after enhanced handling
        if (typeof updatePerceptions === 'function') {
          updatePerceptions(currentPosition);
        } else if (typeof checkPosition === 'function') {
          checkPosition(currentPosition);
        }
      }
    }
  };

  // ==================== ENHANCED DESCRIPTION UTILITY ====================

  /**
   * Creates an enhanced room description while preserving interactive items and hints
   * This is a utility function used whenever creating enhanced descriptions
   * Ensures that interactive elements aren't lost when switching to enhanced text
   * 
   * @param {string} originalText - The original room description 
   * @param {string} enhancedText - The enhanced description from the lantern
   * @returns {string} Combined text with preserved interactive elements
   */
  const createEnhancedRoomDescription = (originalText, enhancedText) => {
    // ========== INPUT VALIDATION ==========
    if (!originalText || !enhancedText) {
      return originalText || enhancedText || "";
    }
    
    // Start with the enhanced text as the base
    let result = enhancedText;
    
    // Collection for items and hints to preserve
    const itemsToPreserve = [];
    
    // ========== PRESERVE COMMON INTERACTIVE PATTERNS ==========
    // 1. Check for special structured phrases first
    const commonPatterns = [
      {
        regex: / On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./i,
        itemType: 'torch_oil'
      },
      {
        regex: / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./i,
        itemType: 'invisibility_cloak'
      },
      {
        regex: / Among them, you spot unusual <span class=['"]interactive-item['"][^>]*>salt-like crystals<\/span> with a subtle blue glow\./i,
        itemType: 'cave_salt'
      },
      {
        regex: / Yellow <span class=['"]interactive-item['"][^>]*>sulfur crystals<\/span> line the walls\./i,
        itemType: 'sulfur_crystal'
      },
      // Add more patterns as needed based on your game's content
    ];
    
    // Check for each common pattern in original text
    commonPatterns.forEach(pattern => {
      const match = originalText.match(pattern.regex);
      if (match) {
        itemsToPreserve.push({
          text: match[0],
          itemType: pattern.itemType
        });
      }
    });
    
    // ========== PRESERVE SPECIAL HINTS ==========
    // 2. Extract key hints
    
    // Keyhole hint (for hidden doors)
    const keyholeHint = originalText.match(/You notice what appears to be a keyhole hidden among.*?\./);
    if (keyholeHint) {
      itemsToPreserve.push({
        text: keyholeHint[0],
        type: 'keyhole'
      });
    }
    
    // Teleport hints (for teleportation circles)
    const teleportHint = originalText.match(/(There's a strange circular pattern.*?\.)|(You notice unusual energy emanating.*?\.)/);
    if (teleportHint) {
      itemsToPreserve.push({
        text: teleportHint[0],
        type: 'teleport'
      });
    }
    
    // ========== PRESERVE OTHER INTERACTIVE ITEMS ==========
    // 3. Look for any interactive items not caught by the patterns
    const itemRegex = /<span class=['"]interactive-item['"][^>]*data-item=['"]([^'"]+)['"][^>]*>(.*?)<\/span>/g;
    let match;
    
    while ((match = itemRegex.exec(originalText)) !== null) {
      const itemType = match[1];
      
      // Skip if this is part of a pattern we already found
      const alreadyFound = itemsToPreserve.some(item => 
        item.text.includes(match[0]) || (item.itemType === itemType)
      );
      
      if (!alreadyFound) {
        // Get the full statement containing this item
        let start = match.index;
        
        // Look backwards for beginning of sentence or meaningful phrase
        while (start > 0) {
          // Look for beginning of sentence or meaningful phrase
          if (".!?".includes(originalText.charAt(start - 1))) {
            break;
          }
          start--;
        }
        
        // Look forwards for end of statement
        let end = match.index + match[0].length;
        while (end < originalText.length) {
          if (".!?".includes(originalText.charAt(end))) {
            end++; // Include the punctuation
            break;
          }
          end++;
        }
        
        const fullStatement = originalText.substring(start, end).trim();
        
        itemsToPreserve.push({
          text: fullStatement,
          itemType: itemType
        });
      }
    }
    
    // ========== ADD PRESERVED ITEMS TO ENHANCED TEXT ==========
    // 4. Add all preserved items to the enhanced text
    // But first check if they're already there to avoid duplication
    itemsToPreserve.forEach(item => {
      // Don't add if the exact text is already there
      if (!result.includes(item.text)) {
        // For item types, check if any span with the same item type exists
        if (item.itemType) {
          const itemTypeRegex = new RegExp(`data-item=['"]${item.itemType}['"]`, 'i');
          if (!itemTypeRegex.test(result)) {
            result += " " + item.text;
          }
        } else {
          // For hint types, just check if the type of hint is present
          if (item.type === 'keyhole' && !result.includes('keyhole')) {
            result += " " + item.text;
          } else if (item.type === 'teleport' && 
                    !result.includes('circular pattern') && 
                    !result.includes('unusual energy')) {
            result += " " + item.text;
          }
        }
      }
    });
    
    return result;
  };


// ==================== TEXT PROCESSING HELPER FUNCTIONS ====================
  
  /**
   * Gets the full statement containing an interactive item
   * Finds the complete sentence that contains a clickable item span
   * @param {string} text - The full room description text
   * @param {number} startIndex - Index where the interactive item span begins
   * @returns {string} Complete sentence containing the interactive item
   */
  const getFullInteractiveStatement = (text, startIndex) => {
    // ========== FIND BEGINNING OF STATEMENT ==========
    // Find the beginning of the sentence or statement
    let start = startIndex;
    // Look for the start of this phrase, usually after a period or at the beginning
    while (start > 0) {
      const prevChar = text.charAt(start - 1);
      if (prevChar === '.' || prevChar === '!' || prevChar === '?') {
        break;
      }
      start--;
    }
    
    // ========== FIND END OF STATEMENT ==========
    // Find the end of the sentence or statement
    let end = startIndex;
    while (end < text.length) {
      if (".!?".includes(text.charAt(end))) {
        end++; // Include the punctuation
        break;
      }
      end++;
    }
    
    return text.substring(start, end).trim();
  };

  /**
   * Extracts item type from an interactive span element
   * Parses the data-item attribute from HTML span tags
   * @param {string} spanHtml - HTML string containing the span element
   * @returns {string|null} Item type or null if not found
   */
  const getItemTypeFromSpan = (spanHtml) => {
    const match = spanHtml.match(/data-item=['"]([^'"]+)['"]/);
    return match ? match[1] : null;
  };

  // ==================== HIDDEN ITEM REVELATION SYSTEM ====================

  /**
   * Reveals hidden items when player has an active magical lantern
   * Only certain rooms contain hidden items that become visible with lantern light
   * @param {number} position - Current room position
   * @param {Array} inventory - Player's current inventory
   * @returns {boolean} True if an item was revealed, false otherwise
   */
  const revealHiddenItems = (position, inventory) => {
    console.log("revealHiddenItems called for position:", position);
    
    // ========== CHECK LANTERN REQUIREMENT ==========
    // Check if player has an active lantern
    const hasActiveLantern = inventory.some(item =>
      (item.originalId || item.id) === 'lantern' && item.isActive
    );
    
    if (!hasActiveLantern) return false;
    
    // ========== CHECK IF ALREADY REVEALED ==========
    // Check if item has already been revealed in this room
    if (specialRooms[position]?.itemRevealed) {
      console.log("Item already revealed in this room");
      return false;
    }
    
    // ========== GET ROOM INFORMATION ==========
    // Get the current room info
    const roomInfo = roomDescriptionMap[position];
    if (!roomInfo) {
      return false;
    }
    
    // Define originalText here so it's in scope
    const currentText = roomInfo.text || "";
    const originalText = roomInfo.originalText || currentText;
    
    // ========== DEFINE HIDDEN ITEMS DATABASE ==========
    // Define hidden items and their locations
    const hiddenItems = {
      // Echo chamber - hidden crystal orb
      "perfect echo": {
        itemId: "crystal_orb",
        appendText: " Your lantern illuminates a small niche in the wall containing a <span class='interactive-item' data-item='crystal_orb'>crystal orb</span> that seems to absorb and amplify the sounds around it.",
        textAfterCollection: " Your lantern illuminates a small niche in the wall, now empty."
      },
      // Backpack room - hidden spellbook
      "backpack with half-eaten rations": {
        itemId: "spellbook",
        appendText: " Your lantern's light reveals an <span class='interactive-item' data-item='spellbook'>ancient spellbook</span> tucked underneath the backpack, its leather cover embossed with strange protective symbols.",
        textAfterCollection: " The space underneath where you found the spellbook is now empty."
      }
    };
    
    // ========== SEARCH FOR HIDDEN ITEMS ==========
    // Check if this room has a hidden item
    let hiddenItemInfo = null;
    
    // Check both current and original text for matches
    Object.keys(hiddenItems).forEach(key => {
      if (currentText.toLowerCase().includes(key.toLowerCase()) || 
          originalText.toLowerCase().includes(key.toLowerCase())) {
        console.log(`Match found for hidden item key: "${key}" in room ${position}`);
        hiddenItemInfo = hiddenItems[key];
      }
    });
    
    // ========== DEBUG BACKPACK ROOM ==========
    // Extra debug for the backpack room - log what's in the text to see if it's matching correctly
    if (currentText.includes("backpack") || originalText.includes("backpack")) {
      console.log("Backpack detected in room text!");
      console.log("Current text:", currentText.substring(0, 100));
      console.log("Original text:", originalText.substring(0, 100));
      console.log("Text includes 'backpack with half-eaten rations':", 
        currentText.includes("backpack with half-eaten rations") || 
        originalText.includes("backpack with half-eaten rations"));
      console.log("Text includes 'RUN!':", 
        currentText.includes("RUN!") || 
        originalText.includes("RUN!"));
    }
    
    // ========== EXIT IF NO HIDDEN ITEM ==========
    // If no hidden item in this room, exit
    if (!hiddenItemInfo) {
      console.log(`No hidden item found in room ${position}`);
      return false;
    }
    
    console.log(`Revealing hidden item: ${hiddenItemInfo.itemId} in room ${position}`);
    
    // ========== UPDATE ROOM DESCRIPTION ==========
    // If there's enhanced text, append to it; otherwise append to current text
    let textToUpdate = roomInfo.enhancedText || currentText;
    let newText = textToUpdate + hiddenItemInfo.appendText;
    
    // Update room description with the hidden item
    setRoomDescriptionMap(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        text: newText,
        enhancedText: newText, // IMPORTANT: Also update enhanced text
        hasInteractiveItem: true,
        interactiveItem: hiddenItemInfo.itemId,
        originalText: originalText // Save the original text
      }
    }));
    
    // IMPORTANT: Also update the currently displayed room description immediately
    setRoomDescription(newText);
    
    // ========== UPDATE SPECIAL ROOMS TRACKING ==========
    // Reveal the hidden item in specialRooms
    setSpecialRooms(prev => ({
      ...prev,
      [position]: {
        ...prev[position],
        hasItem: true,
        itemId: hiddenItemInfo.itemId,
        itemRevealed: true
      }
    }));
    
    // ========== VERIFICATION AND FALLBACK ==========
    // ADDITIONAL DEBUG - Check if room description was actually updated
    setTimeout(() => {
      const updatedRoomInfo = roomDescriptionMap[position];
      console.log("After update, room description is:", updatedRoomInfo?.text?.substring(0, 100));
      console.log("Current displayed room description:", roomDescription?.substring(0, 100));
      
      // Force refresh if needed
      if (!roomDescription.includes(hiddenItemInfo.itemId)) {
        console.log("FORCE REFRESHING room description to include hidden item");
        setRoomDescription(newText);
      }
    }, 100);
    
    return true;
  };

  // ==================== PERCEPTION UPDATE SYSTEM ====================
  
  /**
   * Updates all perceptions and room information for the current position
   * This is the main function that determines what the player senses in their current location
   * Handles both regular rooms and special shifting rooms differently
   * @param {number} position - Current player position (1-30)
   */
  const updatePerceptions = (position) => {
    // ========== VALIDATE POSITION ==========
    // If no valid position, clear perceptions and return
    if (!position) {
      setPerceptions([]);
      return;
    }
    
    console.log('=== UPDATING PERCEPTIONS ===');
    console.log('Player at:', position);
    
    // ========== CLEAR PREVIOUS PERCEPTIONS ==========
    // CRITICAL: Clear perceptions immediately when updating
    // This prevents accumulation of old perceptions
    setPerceptions([]);
    
    // ========== GET THREAT PERCEPTIONS ==========
    // Get threat perceptions (wumpus, pit, bat, exit)
    const threatPerceptions = getThreatPerceptions(position);
    
    // ========== UPDATE ROOM DESCRIPTION ==========
    // Get room description and any room-specific perception and special room type
    const roomInfo = updateRoomDescription(position);
    
    // ========== CHECK FOR SHIFTING ROOM ==========
    // CRITICAL: Check if this is the shifting room FIRST
    const currentRoomData = roomDescriptionMap[position];
    const isShiftingRoom = currentRoomData?.isShiftingRoom || position === shiftingRoomId;
    
    // Start with empty perceptions array
    let allPerceptions = [];
    
    // ========== SHIFTING ROOM PERCEPTION HANDLING ==========
    // For shifting rooms, handle perceptions differently
    if (isShiftingRoom) {
      console.log('Handling shifting room perceptions - clearing all previous perceptions');
      
      // ONLY add threat perceptions if they are immediate threats in THIS room
      // Don't add nearby threats for shifting rooms to avoid confusion
      allPerceptions = [...threatPerceptions];
      
      // Get the current shifting description based on the index
      const currentDescIndex = currentRoomData?.lastUpdatedIndex !== undefined 
        ? currentRoomData.lastUpdatedIndex 
        : currentShiftingIndex || 0;
        
      const currentShiftingDesc = shiftingRoomDescriptions[currentDescIndex];
      
      console.log(`Using shifting description at index ${currentDescIndex}:`, currentShiftingDesc);
      
      // Clear any room-specific perceptions and only use the shifting room's perception
      if (currentShiftingDesc) {
        // If the shifting description has a specific perception, use ONLY that
        if (currentShiftingDesc.perception) {
          console.log('Using shifting room perception:', currentShiftingDesc.perception);
          allPerceptions.push(currentShiftingDesc.perception);
        }
        // Otherwise, check for special type and generate appropriate perception
        else if (currentShiftingDesc.special) {
          const shiftingPerception = generatePerceptionForSpecialType(
            currentShiftingDesc.special, 
            currentShiftingDesc.text
          );
          if (shiftingPerception) {
            console.log('Generated perception for shifting room special type:', shiftingPerception);
            allPerceptions.push(shiftingPerception);
          }
        }
      }
      
      // ========== SPECIAL CASE: GOBLIN SHRINE ==========
      // For the small shrine room specifically
      if (currentShiftingDesc && currentShiftingDesc.text && 
          currentShiftingDesc.text.includes('small shrine')) {
        // Make sure we have the goblin perception
        const hasGoblinPerception = allPerceptions.some(p => 
          p.includes('high-pitched cackles') || p.includes('goblins')
        );
        if (!hasGoblinPerception) {
          allPerceptions.push('You hear high-pitched cackles echoing from the shadows. Cave goblins seem to be watching your every move.');
        }
      }
    }
    // ========== NORMAL ROOM PERCEPTION HANDLING ==========
    // For non-shifting rooms, use normal perception logic
    else {
      // Combine all perceptions normally
      allPerceptions = [...threatPerceptions];
      
      // Add room-specific perception if it exists
      if (roomInfo.perception) {
        console.log('Adding room-specific perception:', roomInfo.perception);
        allPerceptions.push(roomInfo.perception);
      }
      
      const currentSpecialType = currentRoomData?.special;
      const currentText = currentRoomData?.text || "";
      
      // If the current room data has a built-in perception, use it
      if (currentRoomData?.perception && !roomInfo.perception) {
        console.log('Using built-in room perception:', currentRoomData.perception);
        allPerceptions.push(currentRoomData.perception);
      }
      // Only generate perception if no built-in perception exists
      else if (!roomInfo.perception && !currentRoomData?.perception && currentSpecialType) {
        const specialPerception = generatePerceptionForSpecialType(currentSpecialType, currentText);
        if (specialPerception) {
          console.log('Adding generated special perception:', specialPerception);
          allPerceptions.push(specialPerception);
        }
      }
    }
    
    // ========== FALLBACK FOR EMPTY PERCEPTIONS ==========
    // If no perceptions at all, add the "all seems quiet" message
    if (allPerceptions.length === 0) {
      allPerceptions.push(getQuietMessage());
    }
    
    console.log('Final perceptions for position', position, ':', allPerceptions);
    
    // ========== UPDATE STATE ==========
    // Update perceptions state with the new array
    setPerceptions(allPerceptions);
    
    // ========== VISUAL FEEDBACK ==========
    // Add this line to highlight pit rooms if there's a breeze
    setTimeout(highlightPitRooms, 500);
  };



// ==================== SPECIAL ROOM PERCEPTION GENERATOR ====================
  
  /**
   * Generates appropriate perceptions based on room's special type and content
   * Each special room type has unique atmospheric descriptions that enhance immersion
   * Some perceptions are conditional on room text content to ensure accuracy
   * 
   * @param {string} specialType - The special room type identifier
   * @param {string} roomText - Current room description text (defaults to empty string)
   * @returns {string|null} Generated perception string or null if no match
   */
  const generatePerceptionForSpecialType = (specialType, roomText = '') => {
    // Generate perception based on special type and room content
    let specialPerception = null;
    
    // ========== CRYSTAL ROOMS ==========
    // Magical crystal chambers with ethereal sounds
    if (specialType === 'crystal' && roomText.includes('crystal')) {
      specialPerception = 'You can hear a peaceful, ethereal melody emanating from the glowing crystals.';
    }
    // ========== ECHO CHAMBERS ==========
    // Rooms with supernatural acoustic properties
    else if (specialType === 'echo') {
      specialPerception = 'The air feels charged with an unnatural presence. Whispers seem to surround you.';
    }
    // ========== WATERFALL ROOMS ==========
    // Natural water features with soothing sounds
    else if (specialType === 'waterfall' && roomText.includes('waterfall')) {
      specialPerception = 'The gentle patter of water droplets creates a soothing natural melody all around you.';
    }
    // ========== GOBLIN AREAS ==========
    // Areas inhabited by cave goblins - mischievous but not always hostile
    else if (specialType === 'goblin') {
      specialPerception = 'You hear high-pitched cackles echoing from the shadows. Cave goblins seem to be watching your every move.';
    }
    // ========== STREAM ROOMS ==========
    // Chambers with flowing water streams
    else if (specialType === 'stream' && roomText.includes('stream')) {
      specialPerception = 'The soothing sound of running water fills the cavern. The stream continues into darkness beyond your light.';
    }
    // ========== TRINKET COLLECTIONS ==========
    // Rooms filled with mysterious artifacts and collectibles
    else if (specialType === 'trinkets') {
      specialPerception = 'The trinkets seem to glimmer with a magical quality. Some appear to be from the surface world, while others are clearly not of human origin.';
    }
    // ========== HIDDEN CHAMBERS ==========
    // Ancient secret rooms with mystical properties
    else if (specialType === 'hidden_chamber') {
      specialPerception = 'Ancient symbols on the walls seem to shift and change as you look at them. This place feels untouched by time.';
    }
    // ========== SAND CREATURE LAIRS ==========
    // Hostile creature territories - predatory atmosphere
    else if (specialType === 'sand_creature') {
      specialPerception = "You feel an unsettling sensation, as if you're being watched and stalked";
    }
    // ========== WATER SPIRIT DOMAINS ==========
    // Benevolent water fairy territories - peaceful but watchful
    else if (specialType === 'water_spirit') {
      specialPerception = "You sense a gentle presence like something intelligent observing you with curiosity.";
    }
    // ========== FUNGI CREATURE AREAS ==========
    // Living fungal organism chambers - bio-luminescent and alive
    else if (specialType === 'fungi_creature') {
      specialPerception = 'The glowing fungi seem to pulse slightly in rhythm, like a breathing organism. You feel a tingling sensation on your skin.';
    }
    
    // Return the generated perception (or null if no match found)
    return specialPerception;
  };
// ==================== MAIN POSITION CHECK FUNCTION ====================
  
  /**
   * Main function that handles all game logic when player moves to a new position
   * This is the core game engine that processes room entry, encounters, items, and events
   * 
   * @param {number} position - The room position player is moving to (1-30)
   * @param {object} itemFoundParam - Optional item found during movement (default: null)
   */
  const checkPosition = (position, itemFoundParam = null) => {
    // ========== INITIAL VALIDATION ==========
    // Ensure we have a valid position
    if (!position) return;
    
    console.log('Wumpus:', positions.wumpusPosition);
    
    // ========== TURN-BASED UPDATES ==========
    // Update goblin cooldown on movement (reduces merchant interaction timer)
    updateGoblinCooldown();

    // Set global temperature effect tracking
    window.TEMP_EFFECT_ROOM = position;

    // ========== MESSAGE BUILDING SYSTEM ==========
    // Build the message throughout the function
    let roomMessage = `You are now in room ${position}.`;
    let specialMessage = "";
    let immediateMessage = null; // For messages that need to be set immediately
    let shouldReturn = false;    // Flag to exit early for critical events

    // ========== SHIFTING ROOM STABILIZER PRE-CHECK ==========
    // CRITICAL FIX: Pre-check for shifting room with stabilizer
    if (position === shiftingRoomId) {
      const hasStabilizer = inventory.some(item => 
        (item.originalId || item.id) === 'reality_stabilizer'
      );
      
      if (hasStabilizer && shiftingRoomDescriptions && shiftingRoomDescriptions[0]) {
        console.log("PRE-CHECK: Stabilizer detected for shifting room - forcing original state");
        
        // Force the original state BEFORE anything else happens
        const original = shiftingRoomDescriptions[0];
        setCurrentShiftingIndex(0);
        
        // Update the room description map to show original
        setRoomDescriptionMap(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            text: original.text,
            mood: original.mood || 'mysterious',
            special: original.special || null,
            hasWater: original.hasWater || false,
            currentShiftingIndex: 0,
            lastUpdatedIndex: 0,
            isStabilized: true
          }
        }));
      }
    }

    // ========== TEMPERATURE EFFECTS CHECK ==========
    // Check temperature effects whenever entering a new room
    if (typeof checkTemperatureEffects === 'function') {
      console.log("ROOM ENTRY: Checking temperature effects for new room");
      checkTemperatureEffects(position);
    }

    // ========== ROOM DESCRIPTION SETUP ==========
    const currentRoomInfo = roomDescriptionMap[position];
    if (currentRoomInfo) {
      console.log("CheckPosition - Room data:", {
        poolDisturbed: currentRoomInfo.poolDisturbed,
        text: currentRoomInfo.text?.substring(0, 50),
        textAfterCollection: currentRoomInfo.textAfterCollection?.substring(0, 50)
      });
      
      // CRITICAL: Check pool disturbed FIRST
      if (currentRoomInfo.poolDisturbed) {
        console.log("POOL DISTURBED - Setting room to disturbed state");
        const disturbedText = currentRoomInfo.enhancedTextAfterDisturbance || 
                             currentRoomInfo.textAfterCollection || 
                             "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening.";
        setRoomDescription(disturbedText);
        setRoomMood('dangerous');
        setRoomHasWater(true);
        setRoomSpecial(null);
      } else {
        // Normal room setup
        const currentRoomText = currentRoomInfo.text || "You are in a mysterious cave chamber.";
        const currentRoomMood = currentRoomInfo.originalMood || currentRoomInfo.mood || 'mysterious';
        
        // Set room visuals immediately
        setRoomDescription(currentRoomText);
        setRoomMood(currentRoomMood);
        setRoomHasWater(currentRoomInfo.hasWater || false);
        setRoomSpecial(currentRoomInfo.special || null);
      }
      
      console.log(`Room ${position} description updated:`, currentRoomInfo.text?.substring(0, 50) + "...");
    }

    // ========== UPDATE PERCEPTIONS ==========
    // Update what player senses (threats, atmosphere, etc.)
    updatePerceptions(position);

    // ========== FLOATING SPELL MECHANICS ==========
    // Handle floating spell duration and pit safety
    if (isFloating()) {
      setFloatingMovesLeft(prev => {
        const newCount = prev - 1;
        
        // Notify when floating is about to end
        if (newCount === 1) {
          specialMessage += " The floating spell is weakening. You'll return to the ground after one more move.";
        } else if (newCount === 0) {
          // Spell expired
          setFloatingActive(false);
          setActiveSpell(null);
          
          // CRITICAL FIX: Check if player is over a pit when spell expires
          if (position === positions.pitPosition1 || position === positions.pitPosition2) {
            // Kill the player if the spell expires while over a pit
            setGameStatus('lost');
            setDeathCause('pit');
            immediateMessage = "As the floating spell expires, you feel gravity reclaim its hold on you. With horror, you realize you're suspended over a bottomless pit! You plummet into the infinite darkness with no hope of survival. Game over!";
            shouldReturn = true;
            return newCount;
          } else {
            // Normal expiration message if not over a pit
            specialMessage += " The floating spell wears off, and you gently return to the ground.";
          }
        }
        return newCount;
      });
      
      // Handle edge case where they just used their last floating move
      if (floatingMovesLeft === 1 && (position === positions.pitPosition1 || position === positions.pitPosition2)) {
        setTimeout(() => {
          if (!floatingActive) {
            setGameStatus('lost');
            setDeathCause('pit');
            setMessage("As the floating spell expires, you feel gravity reclaim its hold on you. With horror, you realize you're suspended over a bottomless pit! You plummet into the infinite darkness with no hope of survival. Game over!");
          }
        }, 10);
      }
    }

    // ========== WATER SPIRIT TOLL RESET ==========
    // Reset water sprite toll status when entering their domain
    if (specialRooms[position]?.hasWaterSpirit) {
      console.log("Player entering water spirit room - checking toll status");
      
      const isNewEntry = history.length === 0 || history[history.length - 1] !== position;
      
      if (isNewEntry) {
        console.log("New entry to water sprite room - resetting toll paid status");
        setSpecialRooms(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            tollPaid: false
          }
        }));
        
        setShowWaterSpiritTradeButton(false);
      }
    }

    // ========== CRYSTAL ROOM SLEEP TIMER ==========
    // Crystal room check - starts dangerous sleep timer
    if (position && roomDescriptionMap[position]?.special === "crystal" && 
        roomDescriptionMap[position]?.text?.includes("crystal columns")) {
      console.log("Player entered crystal room");
      
      setSpecialRooms(prev => ({
        ...prev,
        [position]: {
          ...prev[position],
          hasCrystalSleep: true,
          crystalEntryTime: Date.now()
        }
      }));
      
      setCrystalRoomWarning(false);
    }

    // ========== PIT ENCOUNTER CHECKS ==========
    // Check if you fell into a pit (instant death unless floating)
    if ((position === positions.pitPosition1 || position === positions.pitPosition2) && !isFloating()) {
      setGameStatus('lost');
      
      // Set different death causes for each pit
      if (position === positions.pitPosition1) {
        setDeathCause('pit1');
        immediateMessage = "You tumbled into an endless chasm! \nGame over!\n Gravity always wins!";
      } else {
        setDeathCause('pit2');
        immediateMessage = "You fell into a bottomless pit! \nGame over!\n Just Brilliant!";
      }
      
      shouldReturn = true;
    }

    // ========== FLOATING OVER PIT DESCRIPTION ==========
    // Add cool description when floating over a pit
    if ((position === positions.pitPosition1 || position === positions.pitPosition2) && isFloating()) {
      immediateMessage = "From above, the pit's true horror emerges. Solid ground below masks a bottomless chasm, its jagged edges perfectly concealing the infinite darkness waiting to consume any unwary traveler.";
      shouldReturn = true;
    }

    // ========== WUMPUS ENCOUNTER ==========
    // Check if you encountered the wumpus (Druika)
    if (position === positions.wumpusPosition) {
      const hasSulfurCrystal = inventory.some(item => 
        (item.originalId || item.id) === 'sulfur_crystal'
      );
      
      if (hasSulfurCrystal) {
        // Player has protection - give them a chance to escape
        if (wumpusAttackTimer) {
          clearTimeout(wumpusAttackTimer);
        }
        
        immediateMessage = "You've stumbled into the Druika's lair! It recoils from the pungent odor of your sulfur crystal, giving you a brief chance to escape. You have 10 seconds before it overcomes its aversion!";
        
        const wumpusRoom = position;
        
        console.log(`Player entered Druika's room: ${wumpusRoom} - Starting 10 second timer`);
        
        // Start countdown timer for Wumpus attack
        const timer = setTimeout(() => {
          console.log(`Timer expired - checking if player is still in Wumpus room ${wumpusRoom}`);
          
          if (position === wumpusRoom) {
            console.log(`ATTACK! Player still in Wumpus room ${wumpusRoom}`);
            setGameStatus('lost');
            setDeathCause('wumpus');
            setMessage("The ancient Druika overcomes its aversion to the sulfur smell and charges at you! Game over!");
          } else {
            console.log(`Player escaped from Druika room ${wumpusRoom} - now in room ${currentPosition}`);
          }
          
          setWumpusAttackTimer(null);
        }, 3000); // 3 second timer (not 10 as message says - for game balance)
        
        setWumpusAttackTimer(timer);
        shouldReturn = true;
      } else {
        // No protection - instant death
        setGameStatus('lost');
        setDeathCause('wumpus');
        immediateMessage = "You walked right into the Druika! \nAs it swifty comes towards you, its tentacles grab you and flip you round and round and shreds you to pieces then devours your crumbs! \nYou were a most delictible villager \nGame over man!";
        shouldReturn = true;
      }
    }

 
    // ========== EXIT ROOM MECHANICS ==========
    // Check if you found the exit - complex wyrmglass and treasure validation
    if (position === positions.exitPosition) {
      const hasWyrmglass = inventory.some(item =>
        (item.originalId || item.id) === 'wyrmglass'
      );
      
      if (!hasWyrmglass) {
        // Player doesn't have wyrmglass - can't see the exit
        // Don't show any exit messages - they see a normal room
        return;
      }
      
      // Check if player has an active lantern
      // Skip if lantern was just toggled (prevents exit spam)
      if (window.SKIP_EXIT_CHECK) {
        return;
      }
      
      const hasActiveLantern = inventory.some(item =>
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      // Only show exit message if lantern is NOT active (paradox mechanic)
      if (!hasActiveLantern) {
        if (collectedTreasures.length === treasurePieces.length) {
          // Player has all treasures - ready to win
          // REMOVE THE AUTO-WIN - just show a message instead
          // setGameStatus('won'); // <-- REMOVE THIS LINE
          specialMessage = " You've found the exit and have all the treasures! The ladder beckons...";
        } else {
          // Missing treasures - can't win yet
          const missingCount = treasurePieces.length - collectedTreasures.length;
          specialMessage = ` You've found the exit, but you're missing ${missingCount} treasure ${missingCount === 1 ? 'piece' : 'pieces'}. The curse can only be lifted when all artifacts are returned!`;
        }
        // Don't set shouldReturn = true anymore, let them stay in the room
      }
      // If lantern is active, the exit remains hidden - proceed normally with no special message
    }

    // ========== SHIFTING ROOM COMPLEX LOGIC ==========
    // SHIFTING ROOM LOGIC - Most complex room type in the game
    if (position === shiftingRoomId) {
      console.log("Entering shifting room - checking current state");
      
      // Clear perceptions to avoid conflicts
      setPerceptions([]);
      
      // Get stored room state information
      const roomData = roomDescriptionMap[position];
      const storedIndex = roomData?.currentShiftingIndex ?? 
                          roomData?.lastUpdatedIndex ?? 
                          currentShiftingIndex ?? 0;
      
      console.log(`Shifting room stored index: ${storedIndex}, Current state index: ${currentShiftingIndex}`);
      
      // Mark that player has visited the shifting room
      if (!hasVisitedShiftingRoom) {
        setHasVisitedShiftingRoom(true);
      }
      
      // ========== REALITY STABILIZER MECHANICS ==========
      // Check if player has reality stabilizer
      const hasStabilizer = inventory.some(item => 
        (item.originalId || item.id) === 'reality_stabilizer'
      );
      
      // Check if anchor has already been placed
      const anchorPlaced = specialRooms[position]?.anchorPlaced;
      
      if (hasStabilizer && !anchorPlaced) {
        console.log("Player has Reality Stabilizer - placing it in the room");
        
        // ========== STABILIZER PLACEMENT PROCESS ==========
        // Remove the stabilizer from inventory
        setInventory(prev => prev.filter(item => 
          (item.originalId || item.id) !== 'reality_stabilizer'
        ));
        
        // Mark anchor as placed
        setSpecialRooms(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            anchorPlaced: true
          }
        }));
        
        // Force to index 0 (original state)
        setCurrentShiftingIndex(0);
        
        // Get the original description and modify it for placed anchor
        const originalDesc = shiftingRoomDescriptions && shiftingRoomDescriptions[0];
        
        if (originalDesc) {
          // Create the "anchor placed" description
          const placedDesc = originalDesc.text.replace(
            'On the far wall, you notice a faint etching of an <span class="glowing-anchor">anchor symbol</span> that glows softly - odd, considering you\'re nowhere near deep water.',
            'On the far wall, the <span class="anchor-placed">crystalline anchor</span> rests perfectly in its matching socket, <span class="anchor-placed">glowing steadily</span> with a calming light that seems to hold this room in place.'
          );
          
          // Apply the updated description
          setRoomDescription(placedDesc);
          setRoomMood(originalDesc.mood || 'mysterious');
          setRoomSpecial(originalDesc.special || null);
          setRoomHasWater(originalDesc.hasWater || false);
          
          // Lock in the placed state in the map
          setRoomDescriptionMap(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              text: placedDesc,
              mood: originalDesc.mood || 'mysterious',
              special: originalDesc.special || null,
              hasWater: originalDesc.hasWater || false,
              currentShiftingIndex: 0,
              lastUpdatedIndex: 0,
              isStabilized: true,
              anchorPlaced: true,
              isShiftingRoom: true,
              originalDescription: placedDesc
            }
          }));
          
          // Update the shifting descriptions to reflect the placed state
          shiftingRoomDescriptions[0] = {
            ...shiftingRoomDescriptions[0],
            text: placedDesc
          };
          setShiftingRoomDescriptions([...shiftingRoomDescriptions]);
        }
        
        // ========== TREASURE COLLECTION ON STABILIZATION ==========
        // Handle treasure collection when room is stabilized
        const treasureInRoom = originalRoomTreasure || treasurePieces.find(t => t.room === position);

        if (treasureInRoom && hasMap && !collectedTreasures.includes(treasureInRoom.id)) {
          // Check if player has canvas bag BEFORE collecting
          const hasCanvasBag = inventory.some(item =>
            (item.originalId || item.id) === 'canvas_bag'
          );
          
          // Add treasure to collected treasures
          setCollectedTreasures(prev => [...prev, treasureInRoom.id]);
          playTreasureFoundSound();
          
          // Show treasure found display
          console.log(`Setting treasure display for: ${treasureInRoom.id}`);
          setShowTreasureDisplay(true);
          setFoundTreasureInfo({
            id: treasureInRoom.id,
            name: treasureInRoom.name,
            description: treasureInRoom.description
          });

          // Hide treasure display after 10 seconds
          setTimeout(() => {
            console.log(`Hiding treasure display for: ${treasureInRoom.id}`);
            setShowTreasureDisplay(false);
            setFoundTreasureInfo(null);
          }, 10000);

          // Update canvas bag if player has one
          if (hasCanvasBag) {
            setInventory(prev => {
              const updatedInventory = prev.map(item => {
                if ((item.originalId || item.id) === 'canvas_bag') {
                  // Count how many treasures are now collected
                  const totalTreasures = collectedTreasures.length + 1; // +1 for the one we just collected
                  const maxTreasures = treasurePieces.length; // Total treasures in game
                  
                  return {
                    ...item,
                    inUse: true,
                    coinFound: item.coinFound || false, // Preserve coin found flag
                    name: totalTreasures >= maxTreasures ?
                      'Adventure Canvas Bag (Filled)' :
                      `Adventure Canvas Bag (${totalTreasures}/${maxTreasures} treasures)`,
                    description: `A sturdy canvas bag containing ${totalTreasures} treasure${totalTreasures > 1 ? 's' : ''}. The magical runes on it counteract the curse.`,
                    treasureCount: totalTreasures
                  };
                }
                return item;
              });
              
              return updatedInventory;
            });
            
            // Add treasure protection
            setSpecialRooms(prev => ({
              ...prev,
              treasuresProtected: true
            }));
          }
          
          // Create appropriate message based on treasure and bag status
          specialMessage = ` As you approach the glowing anchor symbol, the crystalline device in your inventory begins to vibrate intensely. You place the vibrating anchor onto the matching symbol, and they fuse together with a brilliant flash. The room suddenly locks into place, and the shifting stops completely. \nWith the room stabilized, you notice a ${treasureInRoom.name} that appears where it was hidden! ${treasureInRoom.description}`;
          
          // Add canvas bag message if applicable
          if (hasCanvasBag) {
            specialMessage += `\n\nYou carefully place the ${treasureInRoom.name} in your canvas bag, where the protective runes will keep it safe from the cave's curse.`;
          }
        } else if (hasMap && treasureInRoom && collectedTreasures.includes(treasureInRoom.id)) {
          // Treasure already collected
          specialMessage = ` You place the crystalline anchor onto the glowing symbol. They match perfectly and fuse together, stabilizing the room permanently. You've already collected the treasure that was hidden here.`;
        } else {
          // No treasure or player doesn't have map
          specialMessage = ` The crystalline anchor vibrates as you approach the glowing symbol. You place it carefully onto the matching etching, and they fuse together with a soft hum. The room's reality locks into place.`;
        }
        shouldReturn = true;
      } 
      else if (anchorPlaced) {
        // ========== RETURNING TO STABILIZED ROOM ==========
        // Anchor has already been placed - show the stabilized room
        console.log("Anchor already placed - room is permanently stabilized");
        
        const placedDesc = roomDescriptionMap[position]?.text || 
          "On the far wall, the crystalline anchor rests perfectly in its matching socket, glowing steadily with a calming light that seems to hold reality in place.";
        
        setRoomDescription(placedDesc);
        
        // Normal message for returning to stabilized room
        specialMessage = " The crystalline anchor continues to glow steadily in its socket, keeping the room firmly in place and not shifting to a different room.";
        
        shouldReturn = true;
      }
      else {
        // ========== NORMAL SHIFTING BEHAVIOR ==========
        // No stabilizer and no anchor placed - normal shifting behavior
        console.log(`No stabilizer - room should show shifted state at index ${storedIndex}`);
        
        if (shiftingRoomDescriptions && shiftingRoomDescriptions[storedIndex] !== undefined) {
          const currentDesc = shiftingRoomDescriptions[storedIndex];
          
          console.log(`Using shifted description at stored index ${storedIndex}: "${currentDesc.text.substring(0, 50)}..."`);
          
          // Apply the shifted room description
          setRoomDescription(currentDesc.text);
          setRoomMood(currentDesc.mood || 'mysterious');
          setRoomHasWater(currentDesc.hasWater || false);
          setRoomSpecial(currentDesc.special || null);
          
          // Update room description map with current shifted state
          setRoomDescriptionMap(prev => ({
            ...prev,
            [position]: {
              ...prev[position],
              text: currentDesc.text,
              mood: currentDesc.mood || 'mysterious',
              special: currentDesc.special,
              hasWater: currentDesc.hasWater || false,
              currentShiftingIndex: storedIndex,
              lastUpdatedIndex: storedIndex,
              isShiftingRoom: true
            }
          }));
          
          // Sync state index if needed
          if (currentShiftingIndex !== storedIndex) {
            console.log(`Syncing state index from ${currentShiftingIndex} to ${storedIndex}`);
            setCurrentShiftingIndex(storedIndex);
          }
        }
        
        // Add mysterious message for return visits
        if (hasVisitedShiftingRoom) {
          specialMessage = ` \n\nHow very... odd`;
        }
        
        // Force complete perception rebuild for shifting room
        setTimeout(() => {
          console.log("Forcing complete perception rebuild for shifting room");
          updatePerceptions(position);
        }, 100);
        
        shouldReturn = true;
      }
    }

    // ========== SPECIAL ROOM MESSAGE OVERRIDE ==========
    // Base message for special rooms (beyond room 30)
    if (position > 30) {
      roomMessage = "You are in a hidden chamber.";
    }
// ========== SPECIAL ROOM ITEM COLLECTION ==========
    // Check for special room items (beyond normal treasures)
    let foundSpecialItem = false;
    if (typeof collectSecretRoomItem === 'function') {
      try {
        foundSpecialItem = collectSecretRoomItem(position);
      } catch (error) {
        console.error("Error collecting secret room item:", error);
        foundSpecialItem = false;
      }
    }

    // ========== TREASURE MAP AND TREASURE COLLECTION ==========
    // Only continue with normal room message if no special item was found
    if (!foundSpecialItem) {
      
      // ========== TREASURE MAP DISCOVERY ==========
      // Check for treasure map
      if (position === treasureMap && !hasMap) {
        setHasMap(true);
        playMapFoundSound();
        const mapMessage = "You found an ancient treasure map!\n\n" + mapClue;
        immediateMessage = mapMessage;
        shouldReturn = true;
      }

      // ========== TREASURE PIECE COLLECTION ==========
      // Check for treasure pieces
      const treasureInRoom = treasurePieces.find(t => t.room === position);

      if (treasureInRoom) {
        // ========== SHIFTING ROOM TREASURE HANDLING ==========
        // Special handling for shifting room
        if (position === shiftingRoomId) {
          // Check if anchor has been placed (not just in inventory)
          const anchorPlaced = specialRooms[position]?.anchorPlaced;
          
          // Get current index of shifting room
          const currentIndex = roomDescriptionMap[position]?.currentShiftingIndex ??
                              roomDescriptionMap[position]?.lastUpdatedIndex ??
                              currentShiftingIndex ?? 0;
          
          console.log(`Treasure check in shifting room - Current index: ${currentIndex}, Anchor placed: ${anchorPlaced}`);
          
          // Only show treasure if anchor has been placed
          if (hasMap && anchorPlaced) {
            if (!collectedTreasures.includes(treasureInRoom.id)) {
              if (!canCollectTreasure(treasureInRoom)) {
                return; // Exit early, message already shown
              }
              
              // Check if player has canvas bag
              const hasCanvasBag = inventory.some(item =>
                (item.originalId || item.id) === 'canvas_bag'
              );
              
              setCollectedTreasures(prev => [...prev, treasureInRoom.id]);
              playTreasureFoundSound();
              
              // Show treasure found display
              console.log(`Setting treasure display for: ${treasureInRoom.id}`);
              setShowTreasureDisplay(true);
              setFoundTreasureInfo({
                id: treasureInRoom.id,
                name: treasureInRoom.name,
                description: treasureInRoom.description
              });

              // Hide treasure display after 10 seconds
              setTimeout(() => {
                console.log(`Hiding treasure display for: ${treasureInRoom.id}`);
                setShowTreasureDisplay(false);
                setFoundTreasureInfo(null);
              }, 10000);

              const roomInfo = roomDescriptionMap[position];
              const roomDesc = roomInfo.originalText || roomInfo.text;
              
              // ========== CANVAS BAG UPDATE ==========
              // If player has canvas bag, automatically mark it as containing treasures
              if (hasCanvasBag) {
                // Update the canvas bag to show it contains treasures
                setInventory(prev => {
                  const updatedInventory = prev.map(item => {
                    if ((item.originalId || item.id) === 'canvas_bag') {
                      // Count how many treasures are now collected
                      const totalTreasures = collectedTreasures.length + 1; // +1 for the one we just collected
                      const maxTreasures = treasurePieces.length; // Total treasures in game
                      
                      return {
                        ...item,
                        inUse: true,
                        coinFound: item.coinFound || false, // Preserve coin found flag
                        name: totalTreasures >= maxTreasures ?
                          'Adventure Canvas Bag (Filled)' :
                          `Adventure Canvas Bag (${totalTreasures}/${maxTreasures} treasures)`,
                        description: `A sturdy canvas bag containing ${totalTreasures} treasure${totalTreasures > 1 ? 's' : ''}. The magical runes on it counteract the curse.`,
                        treasureCount: totalTreasures
                      };
                    }
                    return item;
                  });
                  
                  return updatedInventory;
                });
                
                // Add treasure protection
                setSpecialRooms(prev => ({
                  ...prev,
                  treasuresProtected: true
                }));
                
                // Special message for automatic collection into bag
                specialMessage += `\nYou found a ${treasureInRoom.name}! ${treasureInRoom.description}\n\nYou carefully place it in your canvas bag, where the protective runes will keep it safe from the cave's curse.`;
              } else {
                // Normal message without bag (this shouldn't happen since canCollectTreasure requires bag)
                specialMessage += `\nYou found a ${treasureInRoom.name}! ${treasureInRoom.description}`;
              }
              
              console.log("Treasure found in shifting room and placed in canvas bag:");
              console.log("Clue:", treasureInRoom.clue);
              console.log("Room description:", roomDesc);
              console.log("Room was at index:", currentIndex);
            }
          } else if (hasMap && currentIndex === 0 && !anchorPlaced) {
            // Player has map and room is at index 0, but anchor not placed - no treasure available
            console.log(`Player in shifting room at index 0 but anchor not placed - treasure not available`);
          } else if (hasMap && currentIndex !== 0 && !anchorPlaced) {
            // Player has map but room is shifted - no treasure visible
            console.log(`Player in shifted room ${position} at index ${currentIndex} - treasure hidden`);
          }
        } else {
          // ========== NORMAL ROOM TREASURE HANDLING ==========
          // Normal room treasure handling
          if (hasMap) {
            if (!collectedTreasures.includes(treasureInRoom.id)) {
              if (!canCollectTreasure(treasureInRoom)) {
                return; // Exit early, message already shown
              }
              
              // Check if player has canvas bag
              const hasCanvasBag = inventory.some(item =>
                (item.originalId || item.id) === 'canvas_bag'
              );
              
              setCollectedTreasures(prev => [...prev, treasureInRoom.id]);
              playTreasureFoundSound();
              
              // Show treasure found display
              console.log(`Setting treasure display for: ${treasureInRoom.id}`);
              setShowTreasureDisplay(true);
              setFoundTreasureInfo({
                id: treasureInRoom.id,
                name: treasureInRoom.name,
                description: treasureInRoom.description
              });

              // Hide treasure display after 10 seconds
              setTimeout(() => {
                console.log(`Hiding treasure display for: ${treasureInRoom.id}`);
                setShowTreasureDisplay(false);
                setFoundTreasureInfo(null);
              }, 10000);

              const roomInfo = roomDescriptionMap[position];
              const roomDesc = roomInfo.originalText || roomInfo.text;
              
              // ========== CANVAS BAG UPDATE (NORMAL ROOMS) ==========
              // If player has canvas bag, automatically mark it as containing treasures
              if (hasCanvasBag) {
                // Update the canvas bag to show it contains treasures
                setInventory(prev => {
                  const updatedInventory = prev.map(item => {
                    if ((item.originalId || item.id) === 'canvas_bag') {
                      // Count how many treasures are now collected
                      const totalTreasures = collectedTreasures.length + 1; // +1 for the one we just collected
                      const maxTreasures = treasurePieces.length; // Total treasures in game
                      
                      return {
                        ...item,
                        inUse: true,
                        coinFound: item.coinFound || false, // Preserve coin found flag
                        name: totalTreasures >= maxTreasures ?
                          'Adventure Canvas Bag (Filled)' :
                          `Adventure Canvas Bag (${totalTreasures}/${maxTreasures} treasures)`,
                        description: `A sturdy canvas bag containing ${totalTreasures} treasure${totalTreasures > 1 ? 's' : ''}. The magical runes on it counteract the curse.`,
                        treasureCount: totalTreasures
                      };
                    }
                    return item;
                  });
                  
                  return updatedInventory;
                });
                
                // Add treasure protection
                setSpecialRooms(prev => ({
                  ...prev,
                  treasuresProtected: true
                }));
                
                // Special message for automatic collection into bag
                specialMessage += `\nYou found a ${treasureInRoom.name}! ${treasureInRoom.description}\n\nYou carefully place it in your canvas bag, where the protective runes will keep it safe from the cave's curse.`;
              } else {
                // Normal message without bag (this shouldn't happen since canCollectTreasure requires bag)
                specialMessage += `\nYou found a ${treasureInRoom.name}! ${treasureInRoom.description}`;
              }
              
              console.log("Treasure found in normal room and placed in canvas bag:");
              console.log("Clue:", treasureInRoom.clue);
              console.log("Room description:", roomDesc);
            }
          } else {
            console.log(`Player in room ${position} with ${treasureInRoom.id} but doesn't have map yet`);
          }
        }
      }
        
      // ========== CREATURE ROOM ENTRY TIMERS ==========
      // Check if entering fungi room
      if (position && specialRooms[position]?.hasFungiCreature) {
        console.log("Player entered fungi creature room");
        
        setSpecialRooms(prev => ({
          ...prev,
          [position]: {
            ...prev[position],
            fungiEntryTime: Date.now()
          }
        }));
        
        setFungiWarning(false);
      }

      // Check temperature effects for environmental hazards
      checkTemperatureEffects(position);

      // Always record room entry time for any room (for potential nightcrawler feature)
      setRoomEntryTime(Date.now());
      setNightCrawlerWarning(false);

      // ========== ITEM FOUND PARAMETER HANDLING ==========
      // Set the final message
      if (itemFoundParam) {
        playAutoPickupSound()
        if (itemFoundParam.name === 'Ancient Wyrm Coins') {
          specialMessage += `\nYou found a bag of ${itemFoundParam.name}! ${itemFoundParam.description}`;
        } else {
          specialMessage += `\nYou picked up a ${itemFoundParam.name}! ${itemFoundParam.description}`;
        }
      }
      
      // ========== GIFT SHOP CHECK ==========
      const giftShopMessage = checkForGiftShop(position);
      if (giftShopMessage) {
        specialMessage += giftShopMessage;
      }
    }

    // ========== EARLY EXIT FOR CRITICAL MESSAGES ==========
    // If we need to return early with an immediate message
    if (shouldReturn && immediateMessage) {
      setMessage(immediateMessage);
      return;
    }

    // ========== PIT WARNING VISUAL EFFECTS ==========
    // Add a short delay before checking for pit warnings
    setTimeout(() => {
      const hasBreeze = perceptions.some(p => 
        p.includes('draft') || p.includes('breeze')
      );
      
      if (hasBreeze) {
        const connectedRooms = roomConnections[position] || [];
        
        const pitRooms = connectedRooms.filter(room => 
          room === positions.pitPosition1 || room === positions.pitPosition2
        );
        
        pitRooms.forEach(pitRoom => {
          addPitWarningEffect(pitRoom);
        });
      }
    }, 500);

    // ========== HIDDEN ITEM REVELATION ==========
    // Update perceptions about nearby threats and room description
    //updatePerceptions(position);
    
    // Try to reveal hidden items
    if (gameStatus === 'playing') {
      revealHiddenItems(position, inventory);
    }

    // ========== DEBUG INFORMATION ==========
    // Debug: Check if the room has a hidden door
    if (roomDescriptionMap[position]?.hasHiddenDoor) {
      console.log("ENTERING ROOM WITH HIDDEN DOOR:", position);
      console.log("Door hint in description:", roomDescriptionMap[position].text.includes("keyhole"));
    }

    // ========== CAVE NARRATOR SYSTEM ==========
    // Add cave message at the very end
    const gameState = {
      torchLevel,
      moveCounter,
      inventory,
      collectedTreasures,
      treasurePieces
    };

    console.log("getContextualCaveMessage !!!!!!!!!!!!");
    const contextualMessage = getContextualCaveMessage(gameState);
    const caveMessage = contextualMessage || getRandomCaveMessage();

    // ========== FINAL MESSAGE ASSEMBLY ==========
    // Build and set the final message
    let finalMessage = roomMessage;
    if (specialMessage) {
      finalMessage += specialMessage;
    }

    // ========== WIZARD FREED CONDITION ==========
    // Only add cave message if wizard hasn't been freed
    if (caveMessage) {
      finalMessage += `\n\n"${caveMessage}"`;
    } else if (window.WIZARD_FREED && !window.WIZARD_FREED_MESSAGE_SHOWN) {
      // Show a one-time message about the cave being silent
      finalMessage += "\n\nThe cave is completely silent now. No more sarcastic commentary echoes through the chambers. It's actually a bit unsettling.";
      window.WIZARD_FREED_MESSAGE_SHOWN = true;
    }

    // ========== SET FINAL MESSAGE ==========
    // Set the complete message ONCE
    setMessage(finalMessage);
  };



// ==================== GIFT SHOP ENCOUNTER SYSTEM ====================
  
  /**
   * Checks if player is in the gift shop and handles goblin merchant interactions
   * The goblin merchant has complex behavior based on player state and cooldowns
   * 
   * @param {number} roomNumber - Current room position to check
   * @returns {string} Message describing the gift shop encounter (empty if not in shop)
   */
  const checkForGiftShop = (roomNumber) => {
    // ========== GIFT SHOP LOCATION CHECK ==========
    // Check if this room is the designated gift shop room
    if (roomNumber === giftShopRoom) {
      console.log(`Player is in the gift shop (room ${roomNumber})`);
      
      // ========== GOBLIN COOLDOWN CHECK ==========
      // Check if goblin is on cooldown (prevents spam interactions)
      if (goblinCooldown > 0) {
        console.log(`Goblin still on cooldown: ${goblinCooldown} moves remaining`);
        setShowTradeButton(false);
        return "\nThe cave gift shop is here, but the shopkeeper is nowhere to be seen. A hastily scrawled sign reads: 'Back in a bit - counting coins!'";
      }
      
      // ========== PLAYER INVENTORY CHECKS ==========
      // Check if player has gold coins (required for trading)
      const hasGoldCoins = inventory.some(item => 
        (item.originalId || item.id) === 'gold_coins'
      );
      
      // Check if player is wearing invisibility cloak
      const wearingCloak = inventory.some(item => 
        (item.originalId || item.id) === 'invisibility_cloak' && item.equipped
      );

      // ========== INVISIBILITY CLOAK INTERACTION ==========
      if (wearingCloak) {
        // Shopkeeper doesn't see the player
        setShowTradeButton(false);
        return " The cave gift shop appears empty and unattended. The shopkeeper must be away.";
      }

      // ========== GOLD COINS INTERACTION ==========
      if (hasGoldCoins) {
        // Player has gold and is visible - show trading interface
        setShowTradeButton(true);
        playShopKeeperFileSound()
        return "\n\nAn orcish looking cave goblin shopkeeper wearing a ragged looking T-shirt with the word 'Throk'.\n It seems to sense the gold you have. \"In an annoying and raspy voice it speaks 'A fool approaches 'Care to trade those shinys for something a little more... useful?' he asks.";
        
      } else {
        // ========== NO GOLD INTERACTION ==========
        // Player has no gold - goblin is uninterested
        setShowTradeButton(false);
        return " An orcish goblin smelling of alcohol and death comes out of nowhere, and eyeballs you. Then disappears with a growl, seemingly uninterested in you.";
      }
    } else {
      // ========== NOT IN GIFT SHOP ==========
      // IMPORTANT: We're not in the gift shop, so hide the trade button
      setShowTradeButton(false);
      return ""; // Return empty string when not in gift shop
    }
  };
  
  // ==================== LOOSE ROCKS INITIALIZATION SYSTEM ====================
  
  /**
   * Initializes loose rocks in a safe room for throwing at creatures
   * Rocks are placed in a random safe room that doesn't conflict with other game elements
   * 
   * @param {number} startingRoom - The room where player starts (note: variable gets reassigned)
   */
  const initializeLooseRocks = (startingRoom) => {
    // Debug logging
    // console.log(`ROCKS: Initializing loose rocks in starting room ${startingRoom}`);
    
    // ========== STARTING ROOM VALIDATION ==========
    // Make sure startingRoom is valid
    if (!startingRoom || !roomDescriptionMap[startingRoom]) {
      console.error(`ROCKS: Invalid starting room ${startingRoom} or room description missing`);
      return;
    }
    
    // ========== FIND SAFE ROOMS FOR ROCK PLACEMENT ==========
    // First make sure the loose_rocks item type is defined
    const safeRooms = [];
    for (let i = 1; i <= 30; i++) {
      const roomText = roomDescriptionMap[i]?.text || '';
      if (
        // Exclude all dangerous and special locations
        i !== positions.wumpusPosition &&
        i !== positions.pitPosition1 &&
        i !== positions.pitPosition2 &&
        i !== positions.batPosition &&
        i !== positions.exitPosition &&
        i !== treasureMap &&
        // Check if room has a treasure (important!)
        !treasurePieces.some(treasure => treasure.room === i) &&
        // Exclude pool rooms to avoid conflicts
        !isPoolRoom(roomText)
      ) {
        safeRooms.push(i);
      }
    }
    
    // ========== RANDOM ROOM SELECTION ==========
    const shuffledRooms = [...safeRooms].sort(() => Math.random() - 0.5);
    const rockRoom = shuffledRooms[0]; // Just one room
    console.log(`ROCKS: Initializing loose rocks in ROOM ${rockRoom}`);

    // ========== ROOM DESCRIPTION UPDATE ==========
    // Update the starting room description to include loose rocks
    // Using same pattern as oil flask
    // const updatedDesc = {...(roomDescriptionMap[startingRoom] || {})};
    
    const updatedDesc = {...(roomDescriptionMap[rockRoom] || {})};

    // If no text exists (unlikely), provide a fallback
    if (!updatedDesc.text) {
      updatedDesc.text = "A cave chamber with rough walls.";
    }
    
    // IMPORTANT: Store the original description before modification
    updatedDesc.originalText = updatedDesc.text;
    
    // ========== ADD INTERACTIVE ROCK ELEMENT ==========
    // Add the loose rocks description
    updatedDesc.text = `${updatedDesc.text} Near the entrance, you notice a hand sized <span class='interactive-item' data-item='loose_rocks'>loose rock </span> that might be useful.`;
    
    // CRITICAL: Store the EXACT full sentence for proper removal
    updatedDesc.textAfterCollection = updatedDesc.originalText;
    
    // Mark as having an interactive item
    updatedDesc.hasInteractiveItem = true;
    updatedDesc.interactiveItem = 'loose_rocks';
    
    console.log("ROCKS: Updated description for room", startingRoom, ":", updatedDesc);
    
    // ========== UPDATE ROOM DESCRIPTION MAP ==========
    // Update room description map using the exact pattern from oil flasks
    setRoomDescriptionMap(prev => ({
      ...prev,
      [rockRoom]: updatedDesc
    }));
    
    // ========== VARIABLE REASSIGNMENT ==========
    // NOTE: This reassignment doesn't affect the calling function since it's pass-by-value
    startingRoom = rockRoom;
    console.log("STARTING Room", startingRoom);
    
    // ========== VERIFICATION SYSTEM ==========
    // Verification log to ensure rocks were placed correctly
    setTimeout(() => {
      console.log("ROCKS: Verification after 1 second:");
      console.log("ROCKS: Room description:", roomDescriptionMap[startingRoom]?.text);
      console.log("ROCKS: Has loose rocks:", roomDescriptionMap[startingRoom]?.text?.includes('loose_rocks'));
      console.log("ROCKS: Interactive item:", roomDescriptionMap[startingRoom]?.interactiveItem);
    }, 1000);
  };


// ==================== GAME INITIALIZATION FUNCTION ====================
  
  /**
   * Initializes a new game by finding a safe starting room and setting up all game systems
   * Uses complex algorithms to ensure player doesn't start in dangerous or special locations
   * 
   * @param {number|null} testRoom - Optional specific room for testing (default: null for random safe room)
   */
  const startGame = (testRoom = null) => {
    
    // ========== STARTING ROOM DETERMINATION ==========
    let startingRoom;
    console.log("CHECKING FOR LANTERN ROOM");
  
    // ========== LANTERN ROOM DETECTION (DEBUG) ==========
    // Find the room with the lantern for debugging purposes
    for (let i = 1; i <= 30; i++) {
      if (roomDescriptionMap[i]?.interactiveItem === 'lantern' || 
          (roomDescriptionMap[i]?.text && roomDescriptionMap[i]?.text.includes("rusty lantern"))) {
        console.log(`FOUND LANTERN in room ${i} - description: ${roomDescriptionMap[i]?.text}`);
      }
    }

    // ========== TEST ROOM OVERRIDE ==========
    if (testRoom !== null) {
      // Use the test room if provided (for debugging/testing)
      startingRoom = parseInt(testRoom);
      // Commented out fixed room logic:
      // } else if (startingRoomFixed !== null) {
      //   startingRoom = startingRoomFixed;
    } else {
      
      // ========== DANGEROUS ROOM IDENTIFICATION ==========
      // Get all occupied dangerous rooms that must be avoided
      const dangerousRooms = [
        positions.wumpusPosition,    // Instant death without sulfur crystal
        positions.pitPosition1,     // Instant death unless floating
        positions.pitPosition2,     // Instant death unless floating
        positions.batPosition,      // Teleports player randomly
        positions.exitPosition,     // CRITICAL: Don't start at the exit!
        treasureMap                 // Don't start on the treasure map
      ];
      
      console.log("Dangerous rooms to avoid:", dangerousRooms);
      console.log("Exit position is:", positions.exitPosition);

      // ========== SPECIAL CREATURE ROOM IDENTIFICATION ==========
      // Also exclude water sprite and sand creature rooms
      const specialCreatureRooms = [];
      
      // Scan all rooms for special creature patterns
      Object.entries(roomDescriptionMap).forEach(([roomId, roomDesc]) => {
        // Check for water sprite room (nixie/water fairy)
        if (roomDesc.text && roomDesc.text.includes("tranquil pool") && 
            roomDesc.text.includes("mirror")) {
          specialCreatureRooms.push(parseInt(roomId));
          console.log(`Excluding water sprite room ${roomId} from starting rooms`);
        }
        
        // Check for sand creature room (hostile desert entity)
        if (roomDesc.text && roomDesc.text.includes("soft sand") && 
            roomDesc.text.includes("comfortable")) {
          specialCreatureRooms.push(parseInt(roomId));
          console.log(`Excluding sand creature room ${roomId} from starting rooms`);
        }
        
        // Check for gift shop room (goblin merchant)
        if (roomDesc.text && (
            roomDesc.text.includes("gift shop") || 
            roomDesc.text.includes("t-shirt") || 
            roomDesc.text.includes("souvenir") ||
            roomDesc.text.includes("shopkeeper"))) {
          specialCreatureRooms.push(parseInt(roomId));
          console.log(`Excluding gift shop room ${roomId} from starting rooms`);
        }
      });

      // ========== DESIGNATED GIFT SHOP EXCLUSION ==========
      // Also add the designated gift shop position if it exists
      if (positions.giftShopPosition) {
        if (!specialCreatureRooms.includes(positions.giftShopPosition)) {
          specialCreatureRooms.push(positions.giftShopPosition);
          console.log(`Excluding designated gift shop room ${positions.giftShopPosition} from starting rooms`);
        }
      }

      // ========== ADJACENT ROOM DANGER ZONES ==========
      // Get rooms adjacent to dangers (these give threat perceptions)
      const adjacentToDanger = new Set();
      dangerousRooms.forEach(room => {
        if (roomConnections[room]) {
          roomConnections[room].forEach(adjacent => {
            adjacentToDanger.add(adjacent);
          });
        }
      });
      
      // ========== EXIT ADJACENCY EXCLUSION ==========
      // NEW: Also exclude rooms adjacent to the exit to prevent immediate discovery
      const exitRoom = positions.exitPosition;
      const adjacentToExit = new Set();
      
      if (roomConnections[exitRoom]) {
        roomConnections[exitRoom].forEach(adjacent => {
          adjacentToExit.add(adjacent);
          console.log(`Room ${adjacent} is adjacent to exit - excluding from starting rooms`);
        });
      }

      // ========== SAFE ROOM CALCULATION ==========
      // Find all safe rooms (not dangerous, not adjacent to danger, not adjacent to exit, and not special creature/shop rooms)
      const safeRooms = [];
      for (let i = 1; i <= 30; i++) {
        if (!dangerousRooms.includes(i) && 
            !adjacentToDanger.has(i) &&
            !adjacentToExit.has(i) &&        // NEW: Exclude exit-adjacent rooms
            !specialCreatureRooms.includes(i) &&
            i !== positions.exitPosition) {   // Extra safety check for exit
          safeRooms.push(i);
        }
      }
      
      console.log(`Found ${safeRooms.length} safe starting rooms after all exclusions`);
      
      // ========== RANDOM SAFE ROOM SELECTION ==========
      // Pick a random safe room
      if (safeRooms.length > 0) {
        const randomIndex = Math.floor(Math.random() * safeRooms.length);
        startingRoom = safeRooms[randomIndex];
      } else {
        // ========== FALLBACK ROOM SELECTION ==========
        console.warn("Very few safe rooms available - using fallback without exit adjacency check");
        
        // Fallback: just pick any room that's not dangerous, not special creature/shop, and not adjacent to exit
        const allSafeRooms = [];
        for (let i = 1; i <= 30; i++) {
          if (!dangerousRooms.includes(i) && 
              !specialCreatureRooms.includes(i) &&
              !adjacentToExit.has(i) &&      // Still exclude exit-adjacent in fallback
              i !== positions.exitPosition) { // Extra safety check
            allSafeRooms.push(i);
          }
        }

        // ========== CRITICAL ERROR PREVENTION ==========
        // Prevent starting in exit room (should never happen)
        if (startingRoom === positions.exitPosition) {
          console.error("ERROR: Starting room is the exit room! Finding alternative...");
          // Find any room that isn't the exit or immediately dangerous
          for (let i = 1; i <= 30; i++) {
            if (i !== positions.exitPosition && 
                i !== positions.wumpusPosition &&
                i !== positions.pitPosition1 &&
                i !== positions.pitPosition2) {
              startingRoom = i;
              console.log(`Reassigned starting room to ${startingRoom} (was exit room)`);
              break;
            }
          }
        }
        
        // ========== SECONDARY FALLBACK ==========
        if (allSafeRooms.length > 0) {
          const randomIndex = Math.floor(Math.random() * allSafeRooms.length);
          startingRoom = allSafeRooms[randomIndex];
        } else {
          // ========== LAST RESORT FALLBACK ==========
          // Last resort: exclude exit-adjacent but allow other restrictions
          console.error("CRITICAL: No safe rooms found with all restrictions - using minimal safety");
          for (let i = 1; i <= 30; i++) {
            if (i !== positions.exitPosition && !adjacentToExit.has(i)) {
              allSafeRooms.push(i);
            }
          }
          const randomIndex = Math.floor(Math.random() * allSafeRooms.length);
          startingRoom = allSafeRooms[randomIndex];
        }
      }
    }

    // ========== STARTING ROOM VALIDATION LOGGING ==========
    console.log(`Starting in room: ${startingRoom}`);
    console.log(`Distance from exit: ${roomConnections[startingRoom]?.includes(positions.exitPosition) ? "1 (adjacent)" : "2+ rooms away"}`);
    
    // ========== GAME STATE INITIALIZATION ==========
    // Set the current position and history
    setCurrentPosition(startingRoom);
    setHistory([startingRoom]);
    
    // ========== GAME SYSTEM INITIALIZATION ==========
    // Initialize special rooms and item locations
    initializeSpecialRooms();       // Set up creature rooms, teleports, etc.
    initializeOilFlasks();          // Place torch oil in safe location
    addInvisibilityCloakToGame();   // Add invisibility cloak to game world
    
    console.log("START GAME FUNCTION CALLED");
    console.log("ROCKS_DEBUG: Starting Room: ", startingRoom);
    
    // Initialize loose rocks for throwing at creatures
    initializeLooseRocks(startingRoom);
    console.log("ROCKS_DEBUG: Called addLooseRocksToFirstRoom");

    // ========== TESTING ITEMS (IGNORE FOR COMMENTS) ==========
    // Various addItemToInventory calls for testing purposes
    // These will be removed in final version

    // ========== ROOM POSITION CHECK ==========
    // Check the position to update room description and perceptions
    checkPosition(startingRoom);
    console.log("STARTING ROOM After", startingRoom);
    
    // ========== FUNGI ROOM SPECIAL HANDLING ==========
    // If starting in fungi room, set entry time for danger timer
    if (specialRooms[startingRoom]?.hasFungiCreature) {
      console.log("Starting in fungi room - setting entry time");
      setSpecialRooms(prev => ({
        ...prev,
        [startingRoom]: {
          ...prev[startingRoom],
          fungiEntryTime: Date.now()
        }
      }));
      setFungiWarning(false);
    }
    
    // ========== STARTING EQUIPMENT CHECK ==========
    // Give player a starting oil flask if they don't have one
    const hasOil = inventory.some(item => 
      (item.originalId || item.id) === 'torch_oil'
    );

    if (!hasOil) {
      // Testing inventory additions (commented out as requested)
      // Final message about starting equipment
      setMessage(prev => 
        `${prev} You check your pack and find a flask of torch oil you brought along.`
      );
    }

    // ========== OPENING NARRATIVE ==========
    console.log("Set message: Starting room: ", startingRoom);
    setMessage(`You stumble into a cave room, lets call it room ${startingRoom}, already regretting every life choice that led to this moment. The cave entrance vanishes behind you with a sound like your mother-in-law's disapproval.\n\n"Just pop in, grab the treasures, save the village," you mutter, checking your torch (still burning) and your torch oil (still there, unlike your common sense). "What's the worst that could happen?"\n\nFrom somewhere deeper in the cave comes a sound that suggests the universe is about to answer that question. Should be 'fun'.\nThen you hear an unrequested reply emanating from everywhere 'Yes it will be fun. Welcome!'`);
  };




///FOR DEBUGGING ONLY REMEMBER O REMOVE. ADD GIFTSHOP ITEMS T INVENTORY FOR TESTING
const addGiftShopItemToInventory = (itemId) => {
  console.log(`Attempting to add gift shop item: ${itemId}`);
  
  // Check if item exists in giftShopCatalog
  if (!giftShopCatalog[itemId]) {
    console.error(`Gift shop item ${itemId} not found in catalog!`);
    return;
  }
  
  // Get the item data from catalog
  const catalogItem = giftShopCatalog[itemId];
  
  // Create a complete item object
  const newItem = {
    id: itemId,
    originalId: itemId,
    name: catalogItem.name || `Unknown Item (${itemId})`,
    icon: catalogItem.icon || '❓',
    description: catalogItem.description || 'A mysterious souvenir.',
    canUse: catalogItem.canUse !== undefined ? catalogItem.canUse : false,
    isSouvenir: true,
    equippable: catalogItem.equippable || false,
    equipped: false
  };
  
  console.log(`Created item object:`, newItem);
  
  // Add to inventory directly
  setInventory(prev => {
    // Check if already in inventory
    const exists = prev.some(item => 
      (item.originalId || item.id) === itemId
    );
    
    if (exists) {
      console.log(`Item ${itemId} already in inventory, not adding duplicate`);
      return prev;
    }
    
    console.log(`Adding ${itemId} to inventory`);
    return [...prev, newItem];
  });
  
  console.log(`Added ${itemId} to inventory successfully`);
};



// ==================== MAIN PLAYER MOVEMENT HANDLER ====================
  
  /**
   * Main function that handles all player movement attempts and room navigation
   * This is the core input handler that processes room guesses and manages encounters
   * 
   * @param {Event} event - The event that triggered the guess (form submission or button click)
   */
  const handleGuess = (event) => {
    
    // ========== EVENT HANDLING ==========
    // Always prevent default behavior for events that have it
    if (event && event.preventDefault) {
      event.preventDefault();
    }

    // ========== SHOP MODE CHECK ==========
    // Check if we're in shop mode FIRST (highest priority)
    if (shopMode) {
      processShopPurchase(term);
      setTerm('');
      return;
    }

    // ========== WUMPUS TIMER CLEANUP ==========
    // Clear Wumpus attack timer if it exists (player moved, so they escaped)
    if (wumpusAttackTimer) {
      clearTimeout(wumpusAttackTimer);
      setWumpusAttackTimer(null);
    }
    
    // ========== SPECIAL ROOM NAVIGATION ==========
    // Check if this is a direct navigation to a special room
    if (event && event.target && event.target.specialRoomTarget) {
      const specialRoomTarget = event.target.specialRoomTarget;
      navigateToRoom(specialRoomTarget);
      return;
    }
    
    // ========== ROOM NUMBER EXTRACTION ==========
    // Get the room number from either the term state or directly from the event
    let guess;
    
    // If this is a click event from a room button, get the room number directly
    if (event && event.target && event.target.roomNumber !== undefined) {
      guess = parseInt(event.target.roomNumber);
    } else {
      // Otherwise, use the term state as before
      guess = parseInt(term);
    }
    
    // ========== INPUT VALIDATION ==========
    // Validate guess but DON'T change the main message
    if (isNaN(guess) || guess < 1 || guess > 32) {
      // Instead of setting a message, update the placeholder text in the input field
      const inputElement = document.getElementById('term');
      if (inputElement) {
        inputElement.placeholder = 'Please enter a valid number (1-30)';
        // Optionally flash the input field to indicate error
        inputElement.classList.add('error-flash');
        setTimeout(() => {
          inputElement.classList.remove('error-flash');
        }, 1000);
      }
      return;
    }

    console.log("FLOATING: ", isFloating());
    
    // ========== SAND CREATURE ENCOUNTER ==========
    // Handle sand creature encounters (blocks movement unless protected)
    if (currentPosition && specialRooms[currentPosition]?.hasSandCreature && !isFloating()) {
      console.log("Player is in sand creature room!"); 
      
      // Get the room the player previously came from
      const previousRoom = history.length >= 2 ? history[history.length - 2] : null;
      
      console.log(`Player came from room ${previousRoom}, trying to go to ${guess}`);
      
      // If player is trying to go to a room that's not where they came from
      if (previousRoom !== guess && specialRooms[currentPosition]?.sandCreatureActive) {
        
        // ========== PROTECTION ITEM CHECKS ==========
        // Check if player has protective items
        const hasProtectiveOrb = inventory.some(item => 
          (item.originalId || item.id) === 'crystal_orb'
        );
        
        const hasAmulet = inventory.some(item => 
          (item.originalId || item.id) === 'amulet' || 
          treasurePieces.some(t => t.id === 'amulet' && collectedTreasures.includes(t.id))
        );
        
        // Check for sulfur crystal
        const hasSulfurCrystal = inventory.some(item => 
          (item.originalId || item.id) === 'sulfur_crystal'
        );
        
        // ========== PROTECTED ENCOUNTERS ==========
        // If player has any protection...
        if (hasProtectiveOrb || hasAmulet || hasSulfurCrystal) {
          // Player has protection - sand creature retreats
          console.log("Player has protection - sand creature retreats");
          
          // Determine which protection is being used and create appropriate message
          let protectionMessage;
          
          if (hasSulfurCrystal) {
            // ========== SULFUR CRYSTAL PROTECTION ==========
            protectionMessage = "As you take a step forward, the sand suddenly erupts! A giant sand wraith rises up with skeletal arms reaching for you! But as the pungent sulfur scent hits it, the creature recoils with a hiss and reluctantly burrows back into the sand, leaving the path clear.";
            playSandCreatureHissSound();
            
            // The sulfur crystal doesn't permanently deactivate the creature
            // Instead, decrease its remaining moves
            setInventory(prev => prev.map(item => {
              if ((item.originalId || item.id) === 'sulfur_crystal') {
                const newMovesRemaining = item.movesRemaining - 2; // Use up 2 moves for repelling
                
                // If it's about to expire, make it drop automatically
                if (newMovesRemaining <= 0) {
                  setTimeout(() => {
                    setMessage(prev => prev + " The sulfur crystal crumbles to dust in your hand after repelling the sand wraith!");
                    setInventory(current => current.filter(i => 
                      (i.originalId || i.id) !== 'sulfur_crystal'
                    ));
                  }, 4000);
                  
                  return {
                    ...item,
                    movesRemaining: 0,
                    name: `Sulfur Crystal (crumbling)`
                  };
                }
                
                return {
                  ...item,
                  movesRemaining: newMovesRemaining,
                  name: `Sulfur Crystal (${newMovesRemaining} moves left)`
                };
              }
              return item;
            }));
            
          } else if (hasProtectiveOrb) {
            // ========== CRYSTAL ORB PROTECTION ==========
            protectionMessage = "As you take a step forward, the sand swirls and suddenly erupts! \n\n A mythical sand wraith starts to rise up with long skeletal arms reaching for you! \n\n But as it notices your Crystal Orb is pulsating brightly, it lets out an otherworldly shriek and burrows back into the sand, leaving the path clear. WHEW!";
            
            playSandCreatureShriekSound();
            
            // Trigger crystal orb glow effect
            window.dispatchEvent(new CustomEvent('orb_protection_activated', {
              detail: { 
                roomType: 'sand_creature',
                duration: 6000 // 6 seconds to match existing glow duration
              }
            }));
  
            // Sand wraith is not permanently deactivated with orb
            setSpecialRooms(prev => ({
              ...prev,
              [currentPosition]: {
                ...prev[currentPosition],
                sandCreatureActive: true
              }
            }));
            
          } else {
            // ========== AMULET PROTECTION ==========
            // has amulet
            protectionMessage = "As you take a step forward,  the sand swirls and  suddenly erupts! \n\n A mythical sand wraith  starts to rise up with long skeletal arms reaching for you! \n\n But it senses somethign you have and doesnt like.\n You notice a brief glow of light from your canvas bag \n\n It lets out an otherworldly shriek and burrows back into the sand, leaving the path clear. WHEW!";
            playSandCreatureShriekSound();
            
            // Deactivate the sand creature permanently with amulet
            setSpecialRooms(prev => ({
              ...prev,
              [currentPosition]: {
                ...prev[currentPosition],
                sandCreatureActive: false
              }
            }));
          }
          
          setMessage(protectionMessage);
          
          // After a delay, move the player to the next room
          setTimeout(() => {
            setCurrentPosition(guess);
            setHistory([...history, guess]);
            
            // Then check the new position
            checkPosition(guess);
          }, 8000);
          
          return;
          
        } else {
          // ========== UNPROTECTED SAND CREATURE ATTACK ==========
          // No protection - instant death
          console.log("Sand creature attacks player!");
          setGameStatus('lost');
          setDeathCause('sand_creature');
          setMessage("As you step toward room " + guess + ", the sand suddenly erupts around you! A massive sand wraith emerges with horrifying speed, its skeletal limbs grabbing you! It drags you beneath the sand in seconds. Game over!");
          return;
        }
      }
      // ========== SAFE RETREAT ==========
      // Player returning the way they came - safe from sand creature
      else if (previousRoom === guess) {
        console.log("Player returning the way they came - safe from sand creature");
        setMessage(`You carefully back away to room ${guess}, keeping your eyes on the disturbed sand.`);
      }
    }

    // ========== WATER SPIRIT ENCOUNTER ==========
    // Handle water nixie toll system
    if (currentPosition && specialRooms[currentPosition]?.hasWaterSpirit) {
      console.log("Player is in water nixie room");
      console.log("Water spirit active:", specialRooms[currentPosition]?.waterSpiritActive);
      console.log("Toll paid:", specialRooms[currentPosition]?.tollPaid);
      
      // Get the room the player previously came from
      const previousRoom = history.length >= 2 ? history[history.length - 2] : null;
      
      // If player attempts to leave and nixie is active AND they're not going back the way they came
      // AND they haven't already paid the toll for this visit
      if (specialRooms[currentPosition]?.waterSpiritActive && 
          guess !== previousRoom && 
          !specialRooms[currentPosition]?.tollPaid) {
        
        console.log(`Player came from room ${previousRoom}, trying to go to ${guess}`);
        
        // Mark that nixie has appeared
        if (!specialRooms[currentPosition]?.nixieHasAppeared) {
          setSpecialRooms(prev => ({
            ...prev,
            [currentPosition]: {
              ...prev[currentPosition],
              nixieHasAppeared: true  // Set this when she appears
            }
          }));
        }

        console.log("showNixieDisplay", showNixieDisplay);

        // ========== PAYMENT ITEM CHECKS ==========
        // Check if player has an amulet treasure
        const hasAmulet = inventory.some(item => 
          (item.originalId || item.id) === 'amulet' || 
          treasurePieces.some(t => t.id === 'amulet' && collectedTreasures.includes(t.id))
        );
        
        // Check if player has gold coins to pay the toll
        const hasGoldCoins = inventory.some(item => 
          (item.originalId || item.id) === 'gold_coins'
        );
        
        // Check for golden compass
        const hasGoldenCompass = inventory.some(item => 
          (item.originalId || item.id) === 'golden_compass'
        );
        
        // ========== NIXIE INTERACTION LOGIC ==========
        // Nixie always demands payment if player doesn't have the amulet
        if (!hasAmulet) {
          if (hasGoldCoins || hasGoldenCompass) {
            // ========== TOLL PAYMENT OPTIONS ==========
            // Start with the toll required message
            setMessage("As you attempt to leave through a different way, the water ripples and a beautiful water nixie emerges.\n\n\n\n\n \"A toll is required to pass,\" she says with a musical voice.");
            
            // Play toll required sound
            playNixieTollReqiuredSound();
            
            // Chain the next sound and message update
            setTimeout(() => {
              if (hasGoldCoins) {
                playNixieOneGoldCoinSound();
                setMessage(prev => prev + " \"One gold coin for safe passage.\"");
              } else {
                playNixieGoldenCompassSound();
                setMessage(prev => prev + " Her eyes linger on your golden compass. \"Your beuatiful compass would be...  an acceptable alternative.\"");
              }
              
              // Show trade button after the second sound starts
              setTimeout(() => {
                setShowWaterSpiritTradeButton(true);
              }, 500);
            }, 3000); // Adjust based on toll required sound duration
            
            return;
          } else {
            // ========== NO PAYMENT AVAILABLE ==========
            // No payment - player can't pass except the way they came
            setMessage("As you attempt to leave, the water ripples and a beautiful water nixie emerges. \"A toll is required to pass,\" she says with a musical voice. Without a gold coin or valuable artifact to offer, you cannot proceed this way.");
            playNixieTollReqiuredSound();
            
            // Prevent movement to any room except where they came from
            if (guess !== previousRoom) {
              return; // Prevent the movement
            }
          }
        } 
        else if (hasAmulet) {
          // ========== AMULET GRANTS PERMANENT PASSAGE ==========
          // Amulet causes water nixie to bow and grant permanent passage
          setMessage("As you approach the water's edge, a graceful nixie emerges. She gasps when she sees your crystal amulet, bowing deeply. \"One who bears the ancient token may pass freely through my domain,\" she says, and sinks beneath the surface.");
          
          // Deactivate the water nixie's toll requirement permanently
          setSpecialRooms(prev => ({
            ...prev,
            [currentPosition]: {
              ...prev[currentPosition],
              waterSpiritActive: false,
              tollPaid: true
            }
          }));
        }
      } else {
        // ========== HIDE TRADE BUTTON ==========
        // Hide the trade button when it's not needed
        if (showWaterSpiritTradeButton) {
          setShowWaterSpiritTradeButton(false);
        }
      }
    }

// ========== WIZARD SUMMONING MECHANICS ==========
    // Track if the player is going back and forth between the same two rooms
    // This will be our new wizard summoning mechanism
    if (history.length >= 2 && 
        history[history.length - 2] === guess && 
        history[history.length - 1] === currentPosition) {
      
      // Increment counter for back-and-forth movement
      wizardSummonCountRef.current++;
      
      // After going back and forth 3 times, summon the wizard (if not already freed)
      if (wizardSummonCountRef.current >= 3 && !window.WIZARD_FREED) { 
        handleWizardTeleport();
        wizardSummonCountRef.current = 0;
        return;
      } else if (wizardSummonCountRef.current === 2) {
        // Give a warning on the second time
        setMessage(`You're going back and forth between rooms ${currentPosition} and ${guess}. The air feels strange...`);
      }
    } else {
      // Reset the counter if they're not going back and forth
      wizardSummonCountRef.current = 0;
    }
    
    // Update the last room entered for wizard tracking
    lastRoomEnteredRef.current = currentPosition;
    
    // ========== POSITION AND HISTORY UPDATES ==========
    // Update current position
    setCurrentPosition(guess);
    window.TEMP_EFFECT_ROOM = guess;
    
    // Update movement history (avoid duplicates)
    if (history.length === 0 || history[history.length - 1] !== guess) {
      setHistory([...history, guess]);
    }
    
    // ========== TEMPERATURE EFFECTS CHECK ==========
    // Check temperature effects for environmental hazards
    if (typeof checkTemperatureEffects === 'function') {
      setTimeout(() => {
        console.log("MOVEMENT: Checking temperature effects for new room");
        checkTemperatureEffects(guess);
      }, 100); // Slight delay to ensure state updates
    }

    // ========== TORCH AND LIGHTING SYSTEM ==========
    // Handle torch fuel depletion
    if (torchLevel > 0) {
      setTorchLevel(prev => Math.max(0, prev - 5)); // Decrease by 5% per move
    } else {
      // ========== DARKNESS DEATH CHECK ==========
      // Check if player has an active lantern when torch is out
      const hasActiveLantern = inventory.some(item => 
        (item.originalId || item.id) === 'lantern' && item.isActive && item.fuel > 0
      );
      
      if (!hasActiveLantern) {
        // Player dies immediately when torch is out AND no active lantern
        setGameStatus('lost');
        setDeathCause('torch_darkness');
        setMessage("Your torch has gone completely out. In the total darkness, you stumble and fall, unable to find your way. The darkness claims another victim. Game over!");
        return;
      } else {
        // Player has active lantern, just show a warning
        setMessage("Your torch has gone out, but your lantern continues to light the way.");
      }
    }

    // ========== ITEM COLLECTION LOGIC ==========
    // Check if the room has an item to collect
    let foundItem = null;
    
    if (specialRooms[guess]?.hasItem) {
      const itemId = specialRooms[guess].itemId;
      
      // EXCLUDE SPELLBOOK from auto-collection (requires manual interaction)
      if (itemId !== 'spellbook') {
        addItemToInventory(itemId);
        
        foundItem = {
          name: itemTypes[itemId].name,
          description: itemTypes[itemId].description
        };
        
        console.log("ITEM: ", foundItem);
        setMessage(`\nYou picked up a ${itemTypes[itemId].name}! ${itemTypes[itemId].description}`);
        
        // ========== REMOVE ITEM FROM ROOM ==========
        // Remove item from the room after collection
        setSpecialRooms(prev => {
          const updatedRooms = {...prev};
          if (updatedRooms[guess]) {
            updatedRooms[guess] = {
              ...updatedRooms[guess],
              hasItem: false,
              itemId: null
            };
          }
          return updatedRooms;
        });
        
        // ========== UPDATE ROOM DESCRIPTION ==========
        // Also update the room description to remove mention of the item
        const updatedDescMap = {...roomDescriptionMap};
        if (updatedDescMap[guess]) {
          // Remove the part about the item
          const itemName = itemTypes[itemId].name.toLowerCase();
          const originalText = updatedDescMap[guess].text;
          const cleanedText = originalText.replace(` You spot a ${itemName} lying on the ground.`, '');
          
          updatedDescMap[guess] = {
            ...updatedDescMap[guess],
            text: cleanedText
          };
          
          setRoomDescriptionMap(updatedDescMap);
        }
      }
    } 
    
    // ========== BAT ENCOUNTER SYSTEM ==========
    // Check if bat encounter (check before any other condition)
    if (guess === positions.batPosition) {
      console.log('=== BAT ENCOUNTER ===');
      console.log('Player entered room with bat:', guess);
      
      // ========== WUMPUS T-SHIRT PROTECTION ==========
      // Check for wumpus t-shirt protection against bats
      const wearingTshirt = inventory.some(item => 
        (item.originalId || item.id) === 'wumpus_tshirt' && item.equipped
      );

      // 80% chance to repel bats if wearing the t-shirt
      if (wearingTshirt && Math.random() < 0.8) {
        console.log('Bats repelled by tacky t-shirt!');
        setMessage("A giant bat plummets toward you but suddenly backflips away, shrieking. \nYour glittering T-shirt has caused it to retreat to sulk in a corner, muttering about 'fashion crimes.'");
        
        // Update perceptions to include the near miss
        setTimeout(() => {
          if (gameStatus === 'playing') {
            updatePerceptions(guess);
          }
        }, 2000);
        
        return; // Skip the rest of the bat encounter
      }

      // ========== BAT GRAB AND TELEPORT ==========
      playBatGrabScreamSound();
      
      // Transport to random room
      const randomRoom = Math.floor(Math.random() * 30) + 1;
      console.log('Bat carrying player to random room:', randomRoom);
      
      // Set bat encounter state to show animation
      setBatEncounter(true);
      
      // Show bat encounter message
      setMessage("YOINK! A massive bat grabs you in its fuzzy clutches. \n'No ticket? No problem!' it chirps cheerfully as you become an unwilling frequent flyer.");
      
      // ========== BAT ENCOUNTER TRACKING ==========
      // Add this section to track the bat encounter
      const batEncounterInfo = {
        fromRoom: guess,
        toRoom: randomRoom,
        time: Date.now()
      };
      setBatEncounters(prev => [...prev, batEncounterInfo]);
      
      // ========== BAT TELEPORT SEQUENCE ==========
      // After showing the bat message for 7 seconds, move the player and update
      setTimeout(() => {
        // Move player to new room
        setCurrentPosition(randomRoom);
        console.log('Bat carrying player to random room:', randomRoom);
        console.log('Current entity positions:');
        console.log('Wumpus:', positions.wumpusPosition);
        console.log('Pit 1:', positions.pitPosition1);
        console.log('Pit 2:', positions.pitPosition2);
        console.log('Exit:', positions.exitPosition);
        
        // Record both positions in history
        setHistory([...history, guess, randomRoom]);
        
        // Update the message for the new room
        setMessage(`With all the grace of a tired delivery driver, \nthe bat plops you down in room ${randomRoom}. 'Package delivered!'\nit squeaks before zooming off to ruin someone else's day.`);

        // ========== BAT RELOCATION ==========
        // After the player is moved, move the bat to a new location
        let newBatPosition;
        do {
          newBatPosition = Math.floor(Math.random() * 30) + 1;
        } while (
          newBatPosition === randomRoom || // Not where player landed
          newBatPosition === positions.wumpusPosition || // Not where wumpus is
          newBatPosition === positions.pitPosition1 || // Not where pit 1 is
          newBatPosition === positions.pitPosition2 ||  // Not where pit 2 is
          newBatPosition === treasureMap // Not where treasure map is
        );
        
        console.log('Bat moved to new location:', newBatPosition);
        
        // Update bat position
        setPositions(prev => ({
          ...prev,
          batPosition: newBatPosition
        }));
        
        // ========== WUMPUS DISTURBANCE ==========
        // Random 10% chance for wumpus to move when bat moves
        if (Math.random() < 0.1) {
          // Get an adjacent position for the wumpus (or +2/-2 if needed)
          const newWumpusPosition = getAdjacentWumpusPosition(
            positions.wumpusPosition, 
            positions, 
            randomRoom
          );
          
          console.log('Wumpus moved to:', newWumpusPosition);
          
          setPositions(prev => ({
            ...prev,
            wumpusPosition: newWumpusPosition
          }));
          
          setMessage(prev => prev + "\n\nYou hear a low growling sound as something moves in the darkness...");
        }
        
        // ========== BAT ENCOUNTER COMPLETION ==========
        // Check new position for hazards after a delay to ensure message is seen
        setTimeout(() => {
          // Turn off the bat animation
          setBatEncounter(false);
          
          // Check position after teleporting
          checkPosition(randomRoom);
        }, 4500);
      }, 7000);
      
      return;
    }

    // ========== MOVE COUNTER INCREMENT ==========
    // Increment move counter for various game mechanics
    setMoveCounter(prev => prev + 1);
    
    // ========== FLOATING SPELL PIT DANGER ==========
    // Special check for moving to a pit room on the last move of floating
    if (floatingMovesLeft === 1 && (guess === positions.pitPosition1 || guess === positions.pitPosition2)) {
      // This is the last floating move and they're moving to a pit
      // They'll die after the move completes
      
      // Set up a small delay to let the spell expiration logic run first 
      setTimeout(() => {
        // Check if the player isn't already dead and the spell has expired
        if (gameStatus === 'playing' && !floatingActive) {
          setGameStatus('lost');
          setDeathCause('pit');
          setMessage("As you float into the chamber, your spell begins to fade. With horror, you realize you're suspended above a bottomless pit just as the magic gives out! You plummet into the infinite darkness with no hope of survival. Game over!");
        }
      }, 50);
    }

    // ========== CHECK POSITION FOR ENCOUNTERS ==========
    // Check for other encounters (wumpus, pits, treasures, etc.)
    checkPosition(guess, foundItem);checkPosition(guess, foundItem);
    // ========== WUMPUS AI AND MOVEMENT SYSTEM ==========
    // Check if player is wearing wumpus t-shirt (affects Wumpus behavior)
    const wearingTshirt = inventory.some(item => 
      (item.originalId || item.id) === 'wumpus_tshirt' && item.equipped
    );

    // Increase aggression chance if wearing the t-shirt (angers the Wumpus)
    const wumpusAggressionChance = wearingTshirt ? 0.2 : 0.1;

    // Random chance for Wumpus to move each turn
    if (Math.random() < wumpusAggressionChance) {
      // ========== WUMPUS MOVEMENT CALCULATION ==========
      // Get an adjacent position for the wumpus (or +2/-2 if needed)
      const newWumpusPosition = getAdjacentWumpusPosition(
        positions.wumpusPosition, 
        positions, 
        guess
      );
      
      // ========== T-SHIRT ANGER MECHANICS ==========
      // When wearing the shirt, 25% chance the wumpus moves directly toward player
      if (wearingTshirt && Math.random() < 0.25) {
        console.log("Wumpus is angered by the t-shirt and moving directly toward player");
        
        // Find the room connected to wumpus that's closest to player
        const wumpusConnections = roomConnections[positions.wumpusPosition] || [];
        let closestRoom = null;
        let shortestDistance = Infinity;
        
        // Calculate which connected room is closest to player
        for (const connectedRoom of wumpusConnections) {
          const distance = calculateDistanceToRoom(connectedRoom, currentPosition);
          if (typeof distance === 'number' && distance < shortestDistance) {
            shortestDistance = distance;
            closestRoom = connectedRoom;
          }
        }
        
        if (closestRoom) {
          // ========== AGGRESSIVE PURSUIT ==========
          // Move Wumpus closer to player
          setPositions(prev => ({
            ...prev,
            wumpusPosition: closestRoom
          }));
          
          setMessage(prev => prev + " You hear a particularly angry growl as something large moves through the cave system. It seems to be getting closer...");
        } else {
          // ========== FALLBACK MOVEMENT ==========
          // Fallback to normal random movement
          setPositions(prev => ({
            ...prev,
            wumpusPosition: newWumpusPosition
          }));
          
          setMessage(prev => prev + "\nYou hear a low growling sound as something moves in the darkness...");
        }
      } else {
        // ========== NORMAL RANDOM MOVEMENT ==========
        // Normal random movement using the original getAdjacentWumpusPosition logic
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusPosition
        }));
        
        setMessage(prev => prev + "\nYou hear a low growling sound as something moves in the darkness...");
      }
      
      // ========== PERCEPTION UPDATE AFTER WUMPUS MOVE ==========
      // Re-update perceptions when wumpus moves
      setTimeout(() => {
        if (gameStatus === 'playing') {
          updatePerceptions(guess);
        }
      }, 50);
    }

    // ========== BAT MOVEMENT CYCLE ==========
    // Move bat every 4 turns (independent of player encounters)
    if (moveCounter > 0 && moveCounter % 4 === 0) {
      let newBatPosition;
      do {
        newBatPosition = Math.floor(Math.random() * 30) + 1;
      } while (
        newBatPosition === guess || // Not where player is
        newBatPosition === positions.wumpusPosition || // Not where wumpus is
        newBatPosition === positions.pitPosition1 || // Not where pit 1 is
        newBatPosition === positions.pitPosition2 || // Not where pit 2 is
        newBatPosition === treasureMap // Not where treasure map is
      );
      
      console.log('Bat moved to:', newBatPosition);
      console.log('Player position:', guess);
      console.log('Wumpus:', positions.wumpusPosition);
      console.log('Pit 1:', positions.pitPosition1);
      console.log('Pit 2:', positions.pitPosition2);
      console.log('============================');
      
      // Update bat position
      setPositions(prev => ({
        ...prev,
        batPosition: newBatPosition
      }));
      
      // Update message to inform player
      setMessage(prev => prev + "\nYou hear distant flapping as the bat moves to a new location.");
      
      // ========== PERCEPTION UPDATE AFTER BAT MOVE ==========
      // Re-update perceptions when bat moves
      setTimeout(() => {
        if (gameStatus === 'playing') {
          updatePerceptions(guess);
        }
      }, 50);
    }
    
    // ========== INPUT CLEANUP ==========
    // Clear the input field for next command
    setTerm('');

    // ========== FUEL MANAGEMENT SYSTEMS ==========
    if (gameStatus === 'playing') {
      // Decrease lantern fuel each move
      decreaseLanternFuel();
      
      // ========== SULFUR CRYSTAL DEGRADATION ==========
      // Handle sulfur crystal degradation over time
      const sulfurCrystal = inventory.find(item => 
        (item.originalId || item.id) === 'sulfur_crystal'
      );
      
      if (sulfurCrystal && sulfurCrystal.movesRemaining > 0) {
        // Decrease remaining moves on sulfur crystal
        setInventory(prev => prev.map(item => {
          if ((item.originalId || item.id) === 'sulfur_crystal') {
            const newMovesRemaining = item.movesRemaining - 1;
            
            // ========== SULFUR CRYSTAL EXPIRATION ==========
            // If this move depletes it
            if (newMovesRemaining <= 0) {
              setMessage(prev => prev + " The sulfur crystal crumbles to dust in your hand!");
              
              // Remove it from inventory after 10 moves worth of degradation
              setTimeout(() => {
                setInventory(current => current.filter(i => 
                  (i.originalId || i.id) !== 'sulfur_crystal'
                ));
              }, 100);
              
              return {
                ...item,
                movesRemaining: 0,
                name: `Sulfur Crystal (crumbling)`
              };
            }
            
            // ========== SULFUR CRYSTAL STATUS UPDATES ==========
            // Update name and description based on remaining moves
            return {
              ...item,
              movesRemaining: newMovesRemaining,
              name: `Sulfur Crystal (${newMovesRemaining} moves left)`,
              description: newMovesRemaining <= 3 ? 
                'The crystal is unstable and crumbling. You should drop it soon or use it quickly!' : 
                'A fragile yellow crystal that gives off a pungent odor. The sand wraith seems repelled by it, but it\'s slowly crumbling.'
            };
          }
          return item;
        }));
      }
    }
    
    // ========== REALITY SHIFTING MECHANICS ==========
    // Only handle room shifting if player doesn't have stabilizer
    const hasStabilizer = inventory.some(item => 
      (item.originalId || item.id) === 'reality_stabilizer'
    );

    if (!hasStabilizer) {
      // ========== NORMAL ROOM SHIFTING ==========
      // Player doesn't have stabilizer - rooms can shift
      handleRoomShifting();
    } else {
      // ========== STABILIZER OVERRIDE ==========
      console.log("Player has Reality Stabilizer - skipping room shifting");
      
      // ADDITIONAL FIX: If we just moved to the shifting room with a stabilizer,
      // force it back to index 0 immediately
      if (guess === shiftingRoomId) {
        console.log("Just entered shifting room with stabilizer - forcing to original state");
        
        // Force reset to index 0 (original room state)
        setCurrentShiftingIndex(0);
        
        // Update the room description map to ensure it shows index 0
        setRoomDescriptionMap(prev => ({
          ...prev,
          [shiftingRoomId]: {
            ...prev[shiftingRoomId],
            currentShiftingIndex: 0,
            lastUpdatedIndex: 0,
            isStabilized: true,
            // Force the original text from shifting descriptions
            text: shiftingRoomDescriptions[0]?.text || 
                  prev[shiftingRoomId]?.originalDescription || 
                  originalRoomDescription
          }
        }));
      }
    }
  };
  // ==================== ROOM SHIFTING MECHANICS ====================
  
  /**
   * Handles the dynamic room shifting system where one room changes its appearance
   * Only affects the designated shifting room, and is disabled if player has reality stabilizer
   * Room shifts occur when player is NOT in the shifting room and has visited it before
   */
  const handleRoomShifting = () => {
    // ========== BASIC VALIDATION ==========
    // Skip if we're not in game or if the shifting room isn't set up yet
    if (gameStatus !== 'playing' || !shiftingRoomId) {
      return;
    }
    
    // ========== REALITY STABILIZER CHECK ==========
    // CRITICAL: Check if player has stabilizer (completely disables shifting)
    const hasStabilizer = inventory.some(item => 
      (item.originalId || item.id) === 'reality_stabilizer'
    );
    
    if (hasStabilizer) {
      console.log("Player has Reality Stabilizer - room shifting is DISABLED");
        
      // Clear out any leftover state
      setPerceptions([]);
      setMessage("");
      
      // ========== STABILIZER OVERRIDE LOGIC ==========
      // If player just entered the shifting room with stabilizer, ensure it's at index 0
      if (currentPosition === shiftingRoomId) {
        console.log("Player IN shifting room with stabilizer - ensuring index 0");
        
        // Force the room to index 0 if it's not already
        if (currentShiftingIndex !== 0) {
          console.log(`Forcing shifting index from ${currentShiftingIndex} to 0`);
          setCurrentShiftingIndex(0);
          
          // Update the room description map to ensure it stays at index 0
          setRoomDescriptionMap(prev => ({
            ...prev,
            [shiftingRoomId]: {
              ...prev[shiftingRoomId],
              currentShiftingIndex: 0,
              lastUpdatedIndex: 0,
              isStabilized: true
            }
          }));
        }
      }
      
      return; // Exit early - no shifting happens with stabilizer
    }
    
    // ========== PERMANENT STABILIZATION CHECK ==========
    // CRITICAL: Check if room has been stabilized previously (anchor placed)
    if (roomDescriptionMap[shiftingRoomId]?.isStabilized) {
      console.log(`Room ${shiftingRoomId} has been permanently stabilized - no shifting`);
      return;
    }
    
    // ========== DEBUG INFORMATION ==========
    console.log(`handleRoomShifting called. Current room: ${currentPosition}, Shifting room: ${shiftingRoomId}`);
    console.log(`Has visited shifting room: ${hasVisitedShiftingRoom}`);
    console.log(`Current shifting index: ${currentShiftingIndex}`);
    
    // ========== SANITY CHECKS ==========
    if (!shiftingRoomId || shiftingRoomId <= 0) {
      console.warn("Shifting room ID is invalid:", shiftingRoomId);
      return;
    }
    
    if (!shiftingRoomDescriptions || !Array.isArray(shiftingRoomDescriptions) || shiftingRoomDescriptions.length === 0) {
      console.warn("No shifting room descriptions available");
      return;
    }
    
    const SHIFTING_ROOM_TO_UPDATE = shiftingRoomId;
    
    // ========== SHIFTING CONDITIONS ==========
    // Only prepare changes when player is NOT in the shifting room AND has visited it before
    if (currentPosition !== SHIFTING_ROOM_TO_UPDATE && hasVisitedShiftingRoom) {
      console.log(`Player not in shifting room ${SHIFTING_ROOM_TO_UPDATE} - preparing it to change for next visit`);
      
      try {
        // ========== DESCRIPTION CYCLING LOGIC ==========
        // ALWAYS increment the index to use the next description
        const totalDescriptions = shiftingRoomDescriptions.length;
        const nextIndex = (currentShiftingIndex + 1) % totalDescriptions;
        const nextDesc = shiftingRoomDescriptions[nextIndex];
        
        if (!nextDesc) {
          console.error(`No description at index ${nextIndex}`);
          return;
        }
        
        console.log(`Preparing shifting room ${SHIFTING_ROOM_TO_UPDATE} with new description (index ${nextIndex} of ${totalDescriptions})`);
        
        // ========== TEXT CLEANING ==========
        // Clean interactive items from the description (shifting rooms shouldn't have items)
        let cleanedText = nextDesc.text;
        if (cleanedText.includes('<span class=\'interactive-item\'') || 
            cleanedText.includes('<span class="interactive-item"')) {
          console.log("WARNING: Shifting room description contains interactive item tag, cleaning...");
          cleanedText = cleanedText.replace(/<span class=['"]interactive-item['"].*?<\/span>/g, '');
        }
        
        console.log(`New description for room ${SHIFTING_ROOM_TO_UPDATE}: "${cleanedText.substring(0, 50)}..."`);
        
        // ========== ROOM DESCRIPTION UPDATE ==========
        // Update room description map with new shifted state
        setRoomDescriptionMap(prev => {
          const newMap = JSON.parse(JSON.stringify(prev)); // Deep clone
          
          if (!newMap[SHIFTING_ROOM_TO_UPDATE]) {
            console.error(`Room ${SHIFTING_ROOM_TO_UPDATE} not found in room description map!`);
            return prev;
          }
          
          // Preserve original data for potential restoration
          const originalDesc = prev[SHIFTING_ROOM_TO_UPDATE].originalDescription || originalRoomDescription;
          const originalMood = prev[SHIFTING_ROOM_TO_UPDATE].originalMood || 'mysterious';
          
          // Update ONLY the shifting room
          newMap[SHIFTING_ROOM_TO_UPDATE] = {
            ...prev[SHIFTING_ROOM_TO_UPDATE],
            text: cleanedText,
            mood: nextDesc.mood || 'mysterious',
            special: nextDesc.special || null,
            hasWater: nextDesc.hasWater || false,
            isShiftingRoom: true,
            hasInteractiveItem: false,
            interactiveItem: null,
            originalDescription: originalDesc,
            originalMood: originalMood,
            currentShiftingIndex: nextIndex,
            lastUpdatedIndex: nextIndex,
            lastUpdatedTimestamp: Date.now(),
            perception: nextDesc.perception || null
          };
          
          console.log(`Updated room ${SHIFTING_ROOM_TO_UPDATE} to index ${nextIndex}`);
          return newMap;
        });
        
        // ========== INDEX STATE UPDATE ==========
        // Update the current index
        setCurrentShiftingIndex(nextIndex);
        console.log(`Shifting index updated to ${nextIndex}`);
        
      } catch (error) {
        console.error("Error updating shifting room:", error);
      }
    }
    else if (currentPosition === SHIFTING_ROOM_TO_UPDATE) {
      console.log(`Player is in the shifting room ${SHIFTING_ROOM_TO_UPDATE} - no shifting occurs while inside`);
    }
  };

  // ==================== INPUT HANDLING ====================
  
  /**
   * Handles text input changes and processes special text commands
   * Supports both numeric room navigation and text-based item collection
   * @param {Event} event - Input change event
   */
  const handleChange = (event) => {
    setTerm(event.target.value);
    
    // ========== TEXT COMMAND PROCESSING ==========
    // Check for item collection commands
    const command = event.target.value.toLowerCase();
    if ((command === "get lantern" || command === "take lantern") && 
        currentPosition && 
        roomDescriptionMap[currentPosition]?.interactiveItem === "lantern") {
      
      // Add lantern to inventory
      addItemToInventory("lantern");
      
      // Update room description to remove lantern
      updateRoomDescriptionAfterCollection();
      
      // Clear the input field
      setTerm("");
      
      // Early return to prevent normal processing
      return;
    }
  };

  // ==================== DIRECT NAVIGATION UTILITY ====================
  
  /**
   * Navigate directly to a room without updating the term input
   * Used for special navigation scenarios (teleportation, forced movement, etc.)
   * @param {number} roomNumber - Target room number
   */
  const navigateToRoom = (roomNumber) => {
    // Process navigation to a room without updating the term
    // This function contains the same logic as handleGuess but without
    // relying on or updating the term state
    
    // Update position
    setCurrentPosition(roomNumber);
    
    // Update history
    if (history.length === 0 || history[history.length - 1] !== roomNumber) {
      setHistory([...history, roomNumber]);
    }
    
    // Handle water system, item collection, bat encounters, etc.
    // This is basically the same code as in handleGuess
    
    // Check position for special encounters
    checkPosition(roomNumber);
    
    // No need to clear the input as we didn't update it
  };

  // ==================== GAME RESET FUNCTION ====================
  
  /**
   * Completely resets the game to initial state
   * Clears all game data, timers, and state variables
   */
  const resetGame = () => {
    // ========== BASIC GAME STATE RESET ==========
    setTerm('');
    setCurrentPosition(null);
    setMessage('Enter a number between 1 and 30 to start exploring');
    setRoomDescription('');
    setHistory([]);
    setPerceptions([]);
    setBatEncounter(false);
    setMoveCounter(0);
    setGameStatus('playing');
    setRoomMood('calm');
    setDeathCause('');
    setRoomHasWater(false);
    setRoomSpecial(null);
    
    // ========== LIGHTING SYSTEM RESET ==========
    setTorchLevel(100);
    setDarknessCounter(0);
    
    // ========== CREATURE TIMERS RESET ==========
    setRoomEntryTime(null);
    setFungiWarning(false);
    setNightCrawlerWarning(false);
    setNightCrawlerProtection(false);
    setNightCrawlerProtectionTimer(null);
    
    // ========== INVENTORY AND ITEMS RESET ==========
    setInventory([]);
    setSpecialRooms({});
    
    // ========== TREASURE HUNT STATE RESET ==========
    setTreasureMap(null);
    setTreasurePieces([]);
    setCollectedTreasures([]);
    setHasMap(false);
    setShowNixieDisplay(false);
    
    // ========== CONDITIONAL STATE RESETS ==========
    // Treasure display state (if these functions are passed)
    if (typeof setShowTreasureDisplay !== 'undefined') {
      setShowTreasureDisplay(false);
    }
    if (typeof setFoundTreasureInfo !== 'undefined') {
      setFoundTreasureInfo(null);
    }
    
    // ========== TIMER CLEANUP ==========
    if (temperatureTimer) {
      clearTimeout(temperatureTimer);
      setTemperatureTimer(null);
    }
    
    // ========== SHIFTING ROOM STATE RESET ==========
    setShiftingRoomId(null);
    setOriginalRoomDescription(null);
    setOriginalRoomTreasure(null);
    setShiftingRoomDescriptions([]);
    setCurrentShiftingIndex(0);
    setHasVisitedShiftingRoom(false);
    
    // ========== GIFT SHOP STATE RESET ==========
    if (typeof setGiftShopRoom !== 'undefined') {
      setGiftShopRoom(null);
    }
    if (typeof setShowTradeButton !== 'undefined') {
      setShowTradeButton(false);
    }
    if (typeof setGoblinCooldown !== 'undefined') {
      setGoblinCooldown(0);
    }
    if (typeof setShopMode !== 'undefined') {
      setShopMode(false);
    }
    
    // ========== WIZARD STATE RESET ==========
    if (typeof setWizardRoomVisited !== 'undefined') {
      setWizardRoomVisited(false);
    }
    if (typeof setActiveSpell !== 'undefined') {
      setActiveSpell(null);
    }
    if (typeof setFloatingActive !== 'undefined') {
      setFloatingActive(false);
    }
    if (typeof setFloatingMovesLeft !== 'undefined') {
      setFloatingMovesLeft(0);
    }
    
    // ========== REF RESETS ==========
    sameRoomAttemptsRef.current = 0;
    lastRoomEnteredRef.current = null;
    
    // ========== GLOBAL WINDOW VARIABLES CLEANUP ==========
    window.TEMP_EFFECT_ROOM = null;
    window.TEMP_EFFECT_TYPE = null;
    window.TEMP_EFFECT_START_TIME = null;
    window.GLOBAL_CLOAK_STATE = false;
    window.currentShopItems = null;
    window.WIZARD_FREED = false;
    window.WIZARD_FREED_MESSAGE_SHOWN = false;
    
    // ========== WINDOW TIMER CLEANUP ==========
    if (window.HIDDEN_ROOM_TRAP_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_TRAP_TIMER);
      window.HIDDEN_ROOM_TRAP_TIMER = null;
      window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    }
    
    // ========== TRACKING ARRAYS RESET ==========
    setBatEncounters([]);
    
    // ========== LOCAL STORAGE CLEANUP ==========
    localStorage.removeItem('treasuresInitialized');
    localStorage.removeItem('shiftingRoomInitialized');
    
    // ========== REGENERATE GAME POSITIONS ==========
    setPositions(generateGamePositions());
    
    // ========== FINAL TIMER CLEANUP ==========
    if (temperatureTimer) {
      clearTimeout(temperatureTimer);
      setTemperatureTimer(null);
    }
  };
  
  // ==================== HOOK RETURN STATEMENT ====================
  
  /**
   * IMPORTANT: Return statement that exposes functions to other components
   * These functions are used throughout the game by various components
   */
  return {
    handleGuess,                    // Main movement/input handler
    handleChange,                   // Text input change handler
    resetGame,                      // Complete game reset function
    startGame,                      // Game initialization function
    checkPosition,                  // Position validation and encounter handler
    playMapFoundSound,              // Audio function for map discovery
    playTreasureFoundSound,         // Audio function for treasure discovery
    refreshRoomWithLantern,         // Lantern state room refresh
    revealHiddenItems,              // Hidden item revelation system
    addGiftShopItemToInventory,     // Gift shop purchase handler
    showNixieDisplay,               // Nixie trade display state
    setShowNixieDisplay,            // Nixie trade display setter
    // decreaseTorchLevel           // (Commented out) Torch level decrease function
  };
};

// ==================== MODULE EXPORT ====================
export default useGameLogic;