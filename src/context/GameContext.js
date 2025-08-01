/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-useless-escape, default-case */
// Updated Gameif (timeRemaining <= 0) text.js to start music on "Enter Cave"
 
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import useGameLogic from '../hooks/useGameLogic';
import useSounds from '../hooks/useSounds';
import { getAllRoomDescriptions, getShiftingRoomFallbacks } from '../data/roomDescriptions';
import treasureClues from '../data/treasureClues';
import caveEntrySoundFile from '../sounds/warp2.ogg'; // Import the sound file directly

import { getFullInteractiveStatement, createEnhancedRoomDescription } from '../utils/descriptionUtils';

import { handleItemUse } from '../utils/itemManagerImport';

// Import the coin lore at the top of the file
import { goldCoinDescription,  getRandomCoinDialogue } from '../utils/coinLore';


window.GLOBAL_CLOAK_STATE = false;

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {

// Add these state variables in the GameProvider component
const [throwingRepellent, setThrowingRepellent] = useState(false);
const [repellentThrowHandler, setRepellentThrowHandler] = useState(null);
// Add a state variable to track map fragment uses
const [mapFragmentUses, setMapFragmentUses] = useState(0);

const [giftShopRoom, setGiftShopRoom] = useState(null);
const [showTradeButton, setShowTradeButton] = useState(false);

//shifting room state variables
const [shiftingRoomId, setShiftingRoomId] = useState(null);
const [originalRoomDescription, setOriginalRoomDescription] = useState(null);
const [originalRoomTreasure, setOriginalRoomTreasure] = useState(null);
const [shiftingRoomDescriptions, setShiftingRoomDescriptions] = useState([]);
const [currentShiftingIndex, setCurrentShiftingIndex] = useState(0);
const [hasVisitedShiftingRoom, setHasVisitedShiftingRoom] = useState(false)

const [roomEntryTime, setRoomEntryTime] = useState(null);
const [fungiWarning, setFungiWarning] = useState(false);
const [showWaterSpiritTradeButton, setShowWaterSpiritTradeButton] = useState(false)



const [nightCrawlerWarning, setNightCrawlerWarning] = useState(false);
const [nightCrawlerProtection, setNightCrawlerProtection] = useState(false);
const [nightCrawlerProtectionTimer, setNightCrawlerProtectionTimer] = useState(null);


const [crystalRoomWarning, setCrystalRoomWarning] = useState(false);
//const [crystalEntryTime, setCrystalEntryTime] = useState(null);


const [temperatureTimer, setTemperatureTimer] = useState(null);



// Add these state variables to your GameProvider component
const [wizardRoomVisited, setWizardRoomVisited] = useState(false);
const [spellbookDeciphered, setSpellbookDeciphered] = useState(false);
const [activeSpell, setActiveSpell] = useState(null);
const [floatingActive, setFloatingActive] = useState(false);
const [floatingMovesLeft, setFloatingMovesLeft] = useState(0);

const [spellbookBackfire, setSpellbookBackfire] = useState(false);



const [wizardRoomEntryTime, setWizardRoomEntryTime] = useState(null);
const [wizardRoomWarning, setWizardRoomWarning] = useState(false);


 
const [goblinCooldown, setGoblinCooldown] = useState(0);
const [shopMode, setShopMode] = useState(false);
 

const [showTreasureDisplay, setShowTreasureDisplay] = useState(false);
const [foundTreasureInfo, setFoundTreasureInfo] = useState(null);


const [showLadderExtendScene, setShowLadderExtendScene] = useState(false);

const [specialMessage, setSpecialMessage] = useState(null);

const [showWinVideo, setShowWinVideo] = useState(false);


const [showWinMessage, setShowWinMessage] = useState(false);

// Add these refs at the top of GameProvider  winSound is triggering twice for some reason. adding these to prevent that
const victoryMusicStarted = useRef(false);
const winSoundListenerAdded = useRef(false);



// 2. Update ensureGiftShopExists to avoid rooms that will be overwritten:
const ensureGiftShopExists = () => {
  console.log("=== ENSURING GIFT SHOP EXISTS ===");
  console.log("Current room descriptions:", Object.keys(roomDescriptionMap).length);
  
  // First try to identify if one already exists
  let giftShopRoomId = identifyGiftShopRoom();
  
  // CHECK: If gift shop is in the same room as exit, we have a problem
  if (giftShopRoomId && giftShopRoomId === positions.exitPosition) {
    console.log(`CONFLICT: Gift shop (${giftShopRoomId}) is in same room as exit!`);
    
    // Move the exit to a different room
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

// Save game state to localStorage
const saveGame = () => {
  try {
    const gameState = {
      // Meta info
      version: "1.0",
      savedAt: new Date().toISOString(),
      
      // Core game state
      currentPosition,
      gameStatus,
      moveCounter,
      history,
      
      // Player stats
      torchLevel,
      darknessCounter,
      inventory,
      
      // Room states
      roomDescriptionMap,
      specialRooms,
      roomConnections,
      
      // Positions (dangers, treasures, etc.)
      positions,
      
      // Treasure hunt
      treasureMap,
      treasurePieces,
      collectedTreasures,
      hasMap,
      mapClue,
      
      // Gift shop
      giftShopRoom,
      goblinCooldown,
      
      // Shifting room
      shiftingRoomId,
      originalRoomDescription,
      originalRoomTreasure,
      shiftingRoomDescriptions,
      currentShiftingIndex,
      hasVisitedShiftingRoom,
      
      // Wizard room
      wizardRoomVisited,
      spellbookDeciphered,
      activeSpell,
      floatingActive,
      floatingMovesLeft,
      wizardFreed: window.WIZARD_FREED || false,
      
      // Protection states
      nightCrawlerProtection,
      nightCrawlerProtectionTimer: nightCrawlerProtectionTimer ? Date.now() + nightCrawlerProtectionTimer : null,
      
      // Item uses
      mapFragmentUses,
      
      // Bat encounters
      batEncounters,
      
      // Global states that need preserving
      globalCloakState: window.GLOBAL_CLOAK_STATE || false,
      
      // Exit ladder state
      exitLadderExtended: specialRooms[positions?.exitPosition]?.ladderExtended || false
    };
    
    // Convert to JSON and save
    localStorage.setItem('wumpusCaveSave', JSON.stringify(gameState));
    
    // Show success message
    setMessage("Game saved successfully! You can safely close the game and continue later.");
    
    return true;
  } catch (error) {
    console.error("Error saving game:", error);
    setMessage("Failed to save game. Your browser might not support saving.");
    return false;
  }
};

// Load game state from localStorage
const loadGame = () => {
  try {
    const savedGameStr = localStorage.getItem('wumpusCaveSave');
    if (!savedGameStr) {
      setMessage("No saved game found.");
      return false;
    }
    
    const savedGame = JSON.parse(savedGameStr);
    
    // Verify save version (for future compatibility)
    if (savedGame.version !== "1.0") {
      setMessage("This save file is from a different game version and cannot be loaded.");
      return false;
    }
    
    // IMPORTANT: Hide the intro screen first!
    setShowIntro(false);
    
    // Restore all state
    setCurrentPosition(savedGame.currentPosition);
    setGameStatus(savedGame.gameStatus);
    setMoveCounter(savedGame.moveCounter);
    setHistory(savedGame.history || []);
    
    setTorchLevel(savedGame.torchLevel);
    setDarknessCounter(savedGame.darknessCounter);
    setInventory(savedGame.inventory || []);
    
    setRoomDescriptionMap(savedGame.roomDescriptionMap || {});
    setSpecialRooms(savedGame.specialRooms || {});
    setRoomConnections(savedGame.roomConnections || {});
    
    setPositions(savedGame.positions);
    
    setTreasureMap(savedGame.treasureMap);
    setTreasurePieces(savedGame.treasurePieces || []);
    setCollectedTreasures(savedGame.collectedTreasures || []);
    setHasMap(savedGame.hasMap || false);
    setMapClue(savedGame.mapClue || '');
    
    setGiftShopRoom(savedGame.giftShopRoom);
    setGoblinCooldown(savedGame.goblinCooldown || 0);
    
    setShiftingRoomId(savedGame.shiftingRoomId);
    setOriginalRoomDescription(savedGame.originalRoomDescription);
    setOriginalRoomTreasure(savedGame.originalRoomTreasure);
    setShiftingRoomDescriptions(savedGame.shiftingRoomDescriptions || []);
    setCurrentShiftingIndex(savedGame.currentShiftingIndex || 0);
    setHasVisitedShiftingRoom(savedGame.hasVisitedShiftingRoom || false);
    
    setWizardRoomVisited(savedGame.wizardRoomVisited || false);
    setSpellbookDeciphered(savedGame.spellbookDeciphered || false);
    setActiveSpell(savedGame.activeSpell);
    setFloatingActive(savedGame.floatingActive || false);
    setFloatingMovesLeft(savedGame.floatingMovesLeft || 0);
    window.WIZARD_FREED = savedGame.wizardFreed || false;
    
    setNightCrawlerProtection(savedGame.nightCrawlerProtection || false);
    if (savedGame.nightCrawlerProtectionTimer && savedGame.nightCrawlerProtectionTimer > Date.now()) {
      setNightCrawlerProtectionTimer(savedGame.nightCrawlerProtectionTimer - Date.now());
    }
    
    setMapFragmentUses(savedGame.mapFragmentUses || 0);
    setBatEncounters(savedGame.batEncounters || []);
    
    window.GLOBAL_CLOAK_STATE = savedGame.globalCloakState || false;
    
    // Start background music if not already playing
    if (!backgroundMusicStarted.current) {
      playBackgroundMusic();
      backgroundMusicStarted.current = true;
    }
    
    // Call checkPosition to update the current room display
    if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
      setTimeout(() => {
        gameLogicFunctions.current.checkPosition(savedGame.currentPosition);
      }, 100);
    }
    
    setMessage(`Game loaded! You're back in room ${savedGame.currentPosition}. Welcome back, adventurer!`);
    
    return true;
  } catch (error) {
    console.error("Error loading game:", error);
    setMessage("Failed to load saved game. The save file might be corrupted.");
    return false;
  }
};

// Check if a saved game exists
const hasSavedGame = () => {
  return localStorage.getItem('wumpusCaveSave') !== null;
};

// Delete saved game
const deleteSavedGame = () => {
  localStorage.removeItem('wumpusCaveSave');
  setMessage("Saved game deleted.");
};

// 2. Now let's update the temperature function to ensure data is properly stored and retrieved
// Here's a simplified version that focuses on just the hot room with cloak case:

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
          setMessage("The extreme cold drains your warmth. Find protection soon! Oh Dear! Oh Dear!");
          
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
          }, 12000); // 5 seconds
          
          // Store the timer
          setTemperatureTimer(secondColdTimer);
        } else {
          // Player put on cloak before first effect
          setMessage("The cloak provides relief from the freezing cold.");
        }
      }
    }, 14000); // 30 seconds
    
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




// Enhanced function for when adding main gold coins (10) to inventory
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

// Function to inspect gold coins
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


// Function to check if an item is in inventory
const hasItem = (itemId) => {
  return inventory.some(item => item.id === itemId);
};

// Function to use an item
const handleUseItem = (itemId) => {
  const item = inventory.find(item => item.id === itemId);
  if (!item) return;
  
  // Collect all dependencies needed by the item handlers
  const dependencies = {
    // Game state
    term,
    currentPosition,
    gameStatus,
    message,
    roomDescription,
    history,
    perceptions,
    batEncounter,
    moveCounter,
    positions,
    roomMood,
    roomHasWater,
    roomSpecial,
    torchLevel,
    darknessCounter,
    inventory,
    specialRooms,
    mapFragmentUses,
    treasurePieces,
    // Calculated values
    hasMap,
    collectedTreasures,
    nightCrawlerWarning,
    nightCrawlerProtection,
    
    // Items info
    itemTypes,
      showWaterSpiritTradeButton,      // ADD THIS
    setShowWaterSpiritTradeButton,  
    // Functions
    setTerm,
    setCurrentPosition,
    setGameStatus,
    setMessage,
    setRoomDescription,
    setHistory,
    setPerceptions,
    setBatEncounter,
    setMoveCounter,
    setPositions,
    setRoomMood,
    setDeathCause,
    setRoomHasWater,
    setRoomSpecial,
    setTorchLevel,
    setDarknessCounter,
    setInventory,
    setSpecialRooms,
    addItemToInventory,
    updateRoomDescriptionAfterCollection,
    setNightCrawlerWarning,
    setNightCrawlerProtection,
    setNightCrawlerProtectionTimer,
    checkTemperatureEffects,
    setMapFragmentUses,
    handleWumpusTracker: handleMapFragmentWumpusTracker,
    handleMapFragmentDangerSense,
    handleMapFragmentTreasureEnhancer,
    handleMapFragmentFlaskFinder,
    handleMapFragmentSecretDoor,
    handleMapFragmentDisintegrate,
    handleMapFragmentRoomRevealer,
    handleMapFragmentGoldFinder,
    findShortestPath,
    calculateDistanceToRoom,
    pulseButton,
    highlightPathToRoom,
    
    // Room info
    roomDescriptionMap,
    setRoomDescriptionMap,
    roomConnections,
    setRoomConnections,
    
    // Game logic
    checkPosition,
    gameLogicFunctions,
    
    // Room entry time
    setRoomEntryTime,
    
    // Wizard state
    wizardRoomVisited,
    setWizardRoomVisited,
    spellbookDeciphered,
    setSpellbookDeciphered,
    setFloatingActive,
    setFloatingMovesLeft,
    setActiveSpell,
    setSpellbookBackfire,
    
    // Wumpus repellent state
    setThrowingRepellent,
    setRepellentThrowHandler,
    throwingRepellent,
    repellentThrowHandler,
    
    // Sound effects
    playTeleportSound,
    playDistantWumpusSound,
    playWumpusScreamSound,
    
    // Special function references
    activateLantern, // The function to toggle lantern state
    
    // Map fragment uses
    handleUseMapFragment,
    
    // Canvas bag and trade functions
    handleTrade,
    handleWaterSpiritTrade,
   
    forceUpdateCloakState,
    setShowLadderExtendScene,
    playWyrmglassSound, 
    playSpellBookFailSound,
    playSpellBookSuccessSound,
    playFlameSound,
    playGoldenCompassSound,
    playPlushieScreamSound,
    playPlushieSqueakSound,
    playPlushieMatingCallSound,
    playOldDoorOpeningSound,
    playRockThrowSound,
    playRockLockedInPLaceSound,
    setVialToThrowSound,
    playThrowingVialWooshSound,
    playVialbreakingSound,
    playWizardFreedSound,
     playNixieTollReqiuredSound,
  playNixieOneGoldCoinSound,
  playNixieGoldenCompassSound,
  playNixieThankYouJournalSound,
  playNixieAFairTradeSound,
  playHiddenRoomRumblingSound,
  playSodiumRockWaterExplosionSound,
  playWaterNixieShriekSound,
  playNixieWailingKillScream,
 

  };
  
  // Use the central handler from the item manager
  console.log("ITEM !!!-------", itemId )
  const removeItem = handleItemUse(itemId, dependencies);
  
  // Remove the item if requested by the handler
  if (removeItem) {
    setInventory(prev => prev.filter(i => i.id !== itemId));
  }
};
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

// Map fragment purpose implementations
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


// Simple function to pulse a room button
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




// Function to calculate distance between rooms (number of moves required)
const calculateDistanceToRoom = (startRoom, targetRoom) => {
  const path = findShortestPath(startRoom, targetRoom, roomConnections);
  return path ? path.distance : "an unknown number of";
};



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
        
        setMessage("You offer a single gold coin to the water sprite. She bows her head to you and gracefully accepts it, and the waters part to let you pass.");
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
  setSpecialRooms(prev => ({
    ...prev,
    [currentPosition]: {
      ...prev[currentPosition],
      
      tollPaid: true
    }
  }));
  
  // Hide the trade button
  setShowWaterSpiritTradeButton(false);
  
  return true;
};

//this function handles bag of gold trade with the orcish shopkeeper
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

// Add this new function to process shop purchases
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
  
  // Use your existing generateMessage function
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
  
  // Set goblin cooldown (3-7 moves)
  const cooldownMoves = Math.floor(Math.random() * 5) + 3;
  setGoblinCooldown(cooldownMoves);
  console.log(`Goblin cooldown set to ${cooldownMoves} moves`);
};

// Improved removeItemFromWorld that handles all item types properly
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
  
  // Create a unique ID for this animation
  const uniqueID = `highlight-${type}-${Date.now()}`;
  const styleElement = document.createElement('style');
  styleElement.id = uniqueID;
  
  // Define new animation that modifies the existing button styles
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

const handleMapFragmentDisintegrate = () => {
  // Show a message about the map crumbling
  setMessage("As you examine the map fragment, it crumbles to dust in your hands. Whatever secrets it held are now lost forever.");
  
  // Add some dramatic effect - optional: play a sound if you have one
  // Example: playDisintegrateSound();
  
  // Remove the item from inventory without any actual effect
  setInventory(prev => prev.filter(item => item.id !== 'old_map'));
  
  return true; // Item was used (and removed)
};

// 2. Cursed Map Fragment (Kills Player)
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


//  Create the Gold Finder map fragment function
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

const handleTrapTrigger = (trapType, deathMessage) => {
  console.log(`Trap triggered: ${trapType}`);
  setGameStatus('lost');
  setDeathCause(trapType);
  setMessage(deathMessage);
};



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



// Function to find the shortest path from start to target room
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


// Initialize special rooms - call this during game initialization
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

// Helper function to determine room feature for hints
// Helper function to determine room feature for hints
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

// Function to select random content for the secret room
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


// Function to select random content for the teleport room
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

// Helper function to identify pool room
const isPoolRoom = (roomText) => {
  return roomText && 
         roomText.includes("pool of clear water") && 
         roomText.includes("nature's most inconvenient wading pool");
};


// Function to update room descriptions with hints
const updateRoomDescriptionsWithHints = (
  doorRoom, 
  orbRoom1, 
  orbRoom2, 
  doorFeature,
  orbFeature1,
  orbFeature2
) => {
  const updatedDescriptions = {...roomDescriptionMap};
  
  // Add hidden door hint
  // Check if this is a treasure room
  const isTreasureRoom = treasurePieces.some(treasure => treasure.room === doorRoom);
  
  const originalText = updatedDescriptions[doorRoom].text || '';
  const hintText = ` You notice what appears to be a keyhole hidden among ${doorFeature}.`;
  

// Add hidden door hint
if (!isPoolRoom(originalText) && !originalText.includes('keyhole hidden among')) {
  // Only add hint if not pool room
  updatedDescriptions[doorRoom] = {
    ...updatedDescriptions[doorRoom],
    text: `${originalText}${hintText}`,
    hasHiddenDoor: true,
    doorHint: hintText
  };
}





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
  //removed special : "echo"
  // Update room descriptions
  setRoomDescriptionMap(updatedDescriptions);
};


// Function to place an item in a specific room
// In placeItem function 
// Fixed placeItem function with defined variables
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

  
  // Generate random unique positions for game elements
  const generateGamePositions = () => {
  const positions = new Set();
  
  // Generate unique positions for each game element (5 positions)
  while(positions.size < 5) {
    positions.add(Math.floor(Math.random() * 30) + 1);
  }
  
  const positionsArray = [...positions];
  
  const gamePositions = {
    wumpusPosition: positionsArray[0],
    pitPosition1: positionsArray[1],
    pitPosition2: positionsArray[2],
    batPosition: positionsArray[3],
    exitPosition: positionsArray[4],
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


// Function to create room descriptions
const createRoomDescriptions = (gamePositions) => {
  const newRoomDescriptions = {};
  
  // Add safety check at the start
  console.log("createRoomDescriptions called with positions:", gamePositions);
  
  if (!gamePositions || !gamePositions.pitPosition1 || !gamePositions.pitPosition2) {
    console.error("ERROR: Invalid gamePositions provided to createRoomDescriptions!");
    // Use the current state positions as fallback
    gamePositions = positions;
    
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

  // Add this debug function to see all room descriptions
 




  // Initialize room descriptions
  const initializeRoomDescriptions = () => {
  return createRoomDescriptions();
  };

  // Create pool of available room descriptions
  const initializeGameRoomDescriptions = () => {
    // Get all available room descriptions from the collection
    const allDescriptions = getAllRoomDescriptions();
    console.log(`Total available room descriptions: ${allDescriptions.length}`);
    
    // Shuffle the array of descriptions to randomize which ones are used in this game
    const shuffledDescriptions = [...allDescriptions].sort(() => Math.random() - 0.5);
    
    // Create a pool of available descriptions for this game
    return shuffledDescriptions;
  };

  // Add a function to generate the room connections
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

  // ==================== STATE DECLARATIONS ====================
  // Initialize all game state
  const [term, setTerm] = useState('');
  const [currentPosition, setCurrentPosition] = useState(null);
  const [gameStatus, setGameStatus] = useState('playing'); // 'playing', 'won', 'lost'
  const [message, setMessage] = useState('Enter a number between 1 and 30 to start exploring');
  const [roomDescription, setRoomDescription] = useState(''); // Separate room description
  const [history, setHistory] = useState([]);
  const [perceptions, setPerceptions] = useState([]);
  const [batEncounter, setBatEncounter] = useState(false);
  const [moveCounter, setMoveCounter] = useState(0);
  const [roomMood, setRoomMood] = useState('calm'); // For styling based on room mood
  const [deathCause, setDeathCause] = useState(''); // 'wumpus' or 'pit'
  const [roomHasWater, setRoomHasWater] = useState(false); // Track if current room has water
  const [roomSpecial, setRoomSpecial] = useState(null); // Track special room type
  const [roomDescriptionMap, setRoomDescriptionMap] = useState({});
  const [availableRoomDescriptions, setAvailableRoomDescriptions] = useState([]);
  const [roomConnections, setRoomConnections] = useState({});
  const [showIntro, setShowIntro] = useState(true);
 // const [startingRoomFixed, setStartingRoomFixed] = useState(null); // For testing

  // Treasure hunt state
  const [treasureMap, setTreasureMap] = useState(null); // Room number with map
  const [treasurePieces, setTreasurePieces] = useState([]); // List of pieces and their locations
  const [collectedTreasures, setCollectedTreasures] = useState([]); // What player has found
  const [hasMap, setHasMap] = useState(false); // Whether player found the map
  const [mapClue, setMapClue] = useState(''); // Clue from the map once found

  // Debug info
  const [treasureDebugInfo, setTreasureDebugInfo] = useState([]);

  // Track ambient perceptions
  const [nearWumpus, setNearWumpus] = useState(false);
  const [nearPit, setNearPit] = useState(false);
  const [nearBat, setNearBat] = useState(false);
  
  // Track sound states

  const deathSoundPlayed = useRef(false);
  const loseSoundPlayed = useRef(false);
  const backgroundMusicStarted = useRef(false);
  const previousRoomSpecial = useRef(null);
  
// Inventory and torch  system states
const [inventory, setInventory] = useState([]);
const [torchLevel, setTorchLevel] = useState(100); // 0-100%
const [darknessCounter, setDarknessCounter] = useState(0);
const MAX_DARKNESS = 1; // Moves before death when torch is completely out

const [specialRooms, setSpecialRooms] = useState({}); // For secret rooms and special locations


  // Game element positions
  const [positions, setPositions] = useState(() => generateGamePositions());
  // Inside GameProvider component, add a new state for tracking bat encounters
const [batEncounters, setBatEncounters] = useState([]);

// line 1624 Item definitions - add this near other game data initializations
//i I remve these itemyes even though theyre duplicates I get a bunch of undefined erors
const itemTypes = {
  rusty_key: { 
    id: 'rusty_key', 
    name: 'Rusty Key', 
    icon: '🔑',
    description: 'A giant  ancient looking rusty key that looks like it would unlock a realy big door. It is heavy',
    canUse: true
  },
  crystal_orb: {
    id: 'crystal_orb',
    name: 'Crystal Orb',
    icon: '🔮',
    description: 'A mysterious crystal orb that seems to ... Well actually you have no frigging clue as to what it does. \nIt could be anything from a magical hearing device to a teleportaion device',
    canUse: true
  },
  old_map: {
    id: 'old_map',
    name: 'Faded Parchment',
    icon: '🗺️',
    description: 'A torn piece of an old Parchment or even Map. It might even be Elvis last missing hit song for all you know.',
    canUse: true
  },
  lantern: { 
    id: 'lantern',
    name: 'old lantern',
    icon: '🏮',
    description: 'An old and rusty mining lantern by the looks of it. It has strange looking glyphs on it.',
    canUse: true,  // Make sure this is true
    fuel: 10,      // Add these properties
    maxFuel: 10,   // Add these properties
    isActive: false // Add these properties
  },
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
    description: 'This device has a needle  with no arrow, and what looks like some sort of symbol  on the top edge.',
    canUse: true
  },
  druika_repellent: {
    id: 'druika_repellent',
    name: 'Ancient Vial',
    icon: '🧪',
    description: 'An ancient vial that has a repugnent smell emanating from it. It reeks',
    canUse: true
  },
  wizard_journal: {
  id: 'wizard_journal',
  name: "Wizard's Journal",
  icon: '📓',
  description: "A leather-bound journal filled with bizarre diagrams and notes like 'Day 423: Still can't figure out why the blasted  water nixie keeps winning at poker. Suspect cheating.'",
  canUse: true  // or true if you want it to be usable
},
  invisibility_cloak: {
    id: 'invisibility_cloak',
    name: 'cloak',
    icon: '🧥',
   description: 'A tattered cloak that clearly lost a fight with something bitey. The musty fabric has more holes than a conspiracy theory, and those are definitely teeth marks—big ones. It tingles when you touch it, which is either magic or mold. Previous owner probably became lunch.',
     canUse: true, // Passive item - always active when in inventory
    isPassive: true,
    equippable: true,
    equipped: false // Auto-equipped when found
  },
  torch_oil: {
    id: 'torch_oil',
    name: 'Torch refill Oil Flask',
    icon: '🛢️',
    description: '\nA leather-wrapped container filled with thick, slow-burning oil. Still usable, somehow.',
    canUse: true
  },
  gold_coins: {
  id: 'gold_coins',
  name: 'Ancient Wyrm Coins',
  icon: '💰',
  description: '\nA handful of ancient gold coins. AWESOME! I Can retire from villiage life now!',
  canUse: false, // Just a collectible item
  value: 10
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


reality_stabilizer: {
  id: 'reality_stabilizer',
  name: 'Crystalline Rock',
  icon: '🔮',
  description: 'A strange crystalline rock that looks oddly like an anchor. Its purpose is unclear',
  canUse: false // Passive item - works automatically when entering the shifting room
},
loose_rocks: {
  id: 'loose_rocks',
  name: 'Loose Cave Rock',
  icon: '🪨',
  description: 'A handsized  dull, grayish-white loose rock. It might be useful even though it feels soft',
  canUse: true
},
cave_salt: {
  id: 'cave_salt',
  name: 'Cave Salt Crystal',
  icon: '💎',
  description: 'A Strange glittering crystal. You wonder if it will  help repel evil spirits or evil little tax collectors',
  canUse: true,
  duration: 50, // 5 minutes in seconds
  remaining: 50
},
sulfur_crystal: {
  id: 'sulfur_crystal',
  name: 'Sulfur Crystal',
  icon: '🟡',
  description: 'A fragile yellow crystal that gives off a repelling pungent odor. ',
  canUse: true, // Passive effect while in inventory
  isPassive: true,

  movesRemaining: 10, // Countdown until it becomes dangerous
  isTemporary: true
},

wyrmglass: {
  id: 'wyrmglass',
  name: 'Wyrmglass',
  icon: '🔮',
  description: 'A polished sphere of glassy stone, cold to the touch. Its surface reflects nothing behind you. ',
  canUse: true
},

shiny_trinkets: {
  id: 'shiny_trinkets',
  name: 'Shiny White Golden Bauble',
  icon: '✨',
  description: 'An irresistibly shiny trinket that practically begs to be picked up.',
  canUse: false,
  isTrap: true // Special flag to indicate this is a trap
},
fools_gold: {
  id: 'fools_gold',
  name: 'Fake Coins',
  icon: '🪙',
  description: 'A handful of what appeared to be ancient coins. Upon closer inspection, they\'re just cleverly painted stones. The "gold" rubs off on your fingers, leaving worthless pebbles.',
  canUse: false,
  isFakeItem: true,
  isCursed: true  // Add this flag
},

utility_knife: {
  id: 'utility_knife',
  name: 'Ornate Dagger',
  icon: '🗡️',
  description: 'A small utility knife with a bat-shaped hilt. While ornate, it\'s barely sharp enough to cut cheese. More decorative than dangerous.',
  canUse: false,
  isFakeItem: true,
  isCursed: true  // Add this flag
},

tarnished_bracelet: {
  id: 'tarnished_bracelet',
  name: 'Exotic Bracelet',
  icon: '🔗',
  description: 'A heavy bracelet made from some unidentifiable metal. It leaves green marks on your wrist and smells vaguely of fish.',
  canUse: false,
  isFakeItem: true,
  isCursed: true,  // Add this flag
  countersInvisibility: true  // Special property
}

};

const giftShopCatalog = {
  // Items from your existing itemTypes (reference existing definitions)
  druika_repellent: { price: 5 },
  lantern: { price: 4 },
  old_map: { price: 5 },
  torch_oil: { price: 3 },
  invisibility_cloak: { price: 6 },
  
  // New souvenir items (will be added to itemTypes)
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
// Items that cannot be purchased (must be found in the caves)
const nonPurchasableItems = ['reality_stabilizer', 'cave_salt', 'spellbook', 'golden_compass','sulfur_crystal'];


// Function to initialize gift shop items (call during game initialization)
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




  // Initialize sound effects
  const { 
    playWinSound,
    playWumpusSound,
    playPitSound,
    playLoseSound,
    playRoomSound,
    playBatGrabScreamSound,
    playExploreSound,
    playPlayAgainSound,
    playWalkingSound,
    playDistantWumpusSound,
    playPitWindSound,
    playBatFlapSound,
    playBackgroundMusic,
    playSpecialRoomMusic,
    resumeBackgroundMusic,
   

    playTeleportSound,  
    playMapFoundSound,
    playTreasureFoundSound,
    cleanupSounds,
  
     playAutoPickupSound,        // Add this
  playInteractivePickupSound,  // Add this
  playWyrmglassSound, 
  
  playLadderTrapSound,
  playSpellBookFailSound,
  playSpellBookSuccessSound,
  playTrinketTrapDeathSound,
  playVictoryMusicEnding,
  playLoseMusicEnding, 
    disableAllSounds,
  enableAllSounds,
    playNightCrawlerSound,
  stopNightCrawlerSound,
  playLanternSound,
  playFlameSound,
  playGoldenCompassSound,
  playMapFragmentSound,
  playPlushieScreamSound,
  playPlushieSqueakSound,
  playPlushieMatingCallSound,
  playOldDoorOpeningSound,
  playRockThrowSound,
  playRockLockedInPLaceSound,
  setVialToThrowSound,
  playThrowingVialWooshSound,
  playVialbreakingSound,
  playWizardFreedSound,
   playNixieTollReqiuredSound,
  playNixieOneGoldCoinSound,
  playNixieGoldenCompassSound,
  playNixieThankYouJournalSound,
  playNixieAFairTradeSound,
    playShopKeeperFileSound,
    playShopKeeperRepellentSound,
     playShopKeeperLanternSound,
  playShopKeeperMapFragmentSound,
  playShopKeeperFlaskOilSound,
  playShopKeeperCloakSound,
  playShopKeeperTShirtSound,
  playShopKeeperMugSound,
  playShopKeeperCanvasBagSound,
  playShopKeeperPlushieSound,
  playShopKeeperLeavingSound,
playHiddenRoomRumblingSound,
playSodiumRockWaterExplosionSound,
playWaterNixieShriekSound,
playNixieWailingKillScream,
playSandCreatureHissSound,
playSandCreatureShriekSound
  } = useSounds();

  // ==================== GAME LOGIC HELPERS ====================
  // Ref to store useGameLogic functions
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
    
    // Build CSS for different types of pulses - STRONGER VISUAL EFFECT
    let cssRules = '';
    
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


  const gameLogicFunctions = useRef({
    startGame: null,
    checkPosition: null
  });
  
  // starting at line 1728 ==================== GAME LOGIC FUNCTIONS ====================
  // Treasure hunt initialization



// Modified initializeTreasureHunt function with proper safety checks
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
  
  // Define empty rooms array to track rooms we've assigned
  const dangerousRooms = [
    positionsMap.wumpusPosition,
    positionsMap.pitPosition1,
    positionsMap.pitPosition2,
    positionsMap.batPosition,
    positionsMap.exitPosition
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
    
    // Check for water sprite room
    if ((roomDesc.toLowerCase().includes('tranquil pool') && roomDesc.toLowerCase().includes('mirror')) ||
        (specialRooms && specialRooms[i]?.hasWaterSpirit)) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding water sprite room ${i} from treasure/map placement`);
    }
    
    // Check for sand creature room
    if ((roomDesc.toLowerCase().includes('soft sand') && roomDesc.toLowerCase().includes('comfortable')) ||
        (specialRooms && specialRooms[i]?.hasSandCreature)) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding sand creature room ${i} from treasure/map placement`);
    }
    
    // Check for fungi creature room
    if ((roomDesc.toLowerCase().includes('luminescent fungi') && roomDesc.toLowerCase().includes('glow')) ||
        (specialRooms && specialRooms[i]?.hasFungiCreature)) {
      specialRoomsToExclude.push(i);
      console.log(`Excluding fungi creature room ${i} from treasure/map placement`);
    }
  }

  // UPDATED: Remove special rooms from allSafeRooms for BOTH map and treasure placement
  const filteredSafeRooms = allSafeRooms.filter(room => !specialRoomsToExclude.includes(room));
  console.log(`Safe rooms after filtering special rooms: ${filteredSafeRooms.length}`);

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





const initializeShiftingRoom = () => {
  console.log('Initializing shifting room feature...');
  
  // Force reload treasures from state if needed
  if (!treasurePieces || treasurePieces.length === 0) {
    console.log('Warning: treasurePieces is empty. This should not happen at this point!');
    return; // Don't proceed with empty treasures
  }
  
  console.log(`Found ${treasurePieces.length} treasures: ${treasurePieces.map(t => t.id).join(', ')}`);
  
  // Helper function to check if a room description has problematic content
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

  // Create the final descriptions array with original description as first element
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

//////////////////////////////////////
//////////////////////////////////////////
// Example function to add the cloak to a special room
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


// Call this function during game initialization if you want to add the cloak to the game



// Function to calculate text similarity (for fuzzy matching)
function calculateTextSimilarity(str1, str2) {
  str1 = str1.toLowerCase();
  str2 = str2.toLowerCase();
  
  let matches = 0;
  const minLength = Math.min(str1.length, str2.length);
  
  for (let i = 0; i < minLength; i++) {
    if (str1[i] === str2[i]) matches++;
  }
  
  return matches / Math.max(str1.length, str2.length);
}
const handleHiddenRoomTrap = () => {
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
  
  // FIRST: Stop victory and lose music (before enabling sounds)
  playVictoryMusicEnding(false);
  playLoseMusicEnding(false);
  disableAllSounds();
  // THEN: Play the play again sound
  playPlayAgainSound();
  
  // THEN: Re-enable all sounds
  enableAllSounds();
  
  // FINALLY: Restart background music with a small delay
  setTimeout(() => {
    playBackgroundMusic(true);
  }, 100);
    
    // Generate new positions for game entities
    const newPositions = generateGamePositions();
    setPositions(newPositions);
    
    // First initialize new room descriptions
    const newRoomDescriptions = initializeRoomDescriptions();
    setRoomDescriptionMap(newRoomDescriptions);
    
    // Set available descriptions
    setAvailableRoomDescriptions(initializeGameRoomDescriptions());
    
    // Generate new room connections
    const newConnections = generateRoomConnections();
    setRoomConnections(newConnections);
    
    // Initialize the treasure hunt with the room descriptions
    initializeTreasureHunt(newRoomDescriptions, newPositions);
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
    // Call the original resetGame
    resetGame();

    console.log("=== GAME RESET COMPLETE ===");
  };

  // Function to start the game from context
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
// 1. Enhanced updateRoomDescriptionAfterCollection function
const updateRoomDescriptionAfterCollection = (itemId) => {

  console.log(`Updating room after collecting ${itemId}`);
  
  // Get current room info
  const roomInfo = roomDescriptionMap[currentPosition];
  if (!roomInfo) return;
  

  if (currentPosition === 31 && !window.HIDDEN_ROOM_TRAP_TRIGGERED) {
    window.HIDDEN_ROOM_TRAP_TRIGGERED = true;
    
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
  


  // Update text based on item type
  switch(itemId) {
    case 'torch_oil':
      playInteractivePickupSound()
      // Remove oil mention from both regular and enhanced text
      updatedText = updatedText.replace(/ On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./g, '');
      if (updatedEnhancedText) {
        updatedEnhancedText = updatedEnhancedText.replace(/ On a small ledge, you spot a <span class=['"]interactive-item['"][^>]*>flask of oil<\/span>\./g, '');
      }
      break;


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

      
      case 'invisibility_cloak':
        playInteractivePickupSound();   //adding this here becuase for some reason this wont play in addItemToInventory function when this is picked up
  
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
      
case 'cave_salt':
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
      
case 'sulfur_crystal':
   // EVIL CHECK: Does player have the cursed utility knife?
  const hasCursedKnife = inventory.some(item =>
    (item.originalId || item.id) === 'utility_knife'
  );
  
  if (hasCursedKnife) {
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

  }

  // Pattern for regular text
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
  



 const decreaseLanternFuel = () => {
  const lanternItem = inventory.find(item => 
    (item.originalId || item.id) === 'lantern' && item.isActive
  );
  
  if (!lanternItem || lanternItem.fuel <= 0) return;
  
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


  // ==================== USE GAME LOGIC HOOK ====================
  // Get game logic functions - IMPORTANT: This must come AFTER handleGuessWithSound declaration
  const {
    handleGuess,
    handleChange,
    resetGame,
    startGame: startGameFromLogic, // Rename to avoid collision
    checkPosition, // Make sure this is returned from useGameLogic
    addGiftShopItemToInventory,
      showNixieDisplay,        // <-- Add this
  setShowNixieDisplay  
 ///   playMapFoundSound,
 //   playTreasureFoundSound
 // Make sure decreaseTorchLevel is RETURNED from useGameLogic
 
  } = useGameLogic({
    term,
    setTerm,
    currentPosition,
    setCurrentPosition,
    gameStatus,
    setGameStatus,
    message,
    setMessage,
    roomDescription,
    setRoomDescription,
    history,
    setHistory,
    perceptions,
    setPerceptions,
    batEncounter,
    setBatEncounter,
    moveCounter,
    setMoveCounter,
    positions,
    setPositions,
    generateGamePositions,
    setRoomMood,
    setDeathCause,
    setRoomHasWater,
    setRoomSpecial,
    playWalkingSound,
    playRoomSound,
    playBatGrabScreamSound,
    playTeleportSound, 
    roomDescriptionMap,
    setRoomDescriptionMap,
    availableRoomDescriptions,
    setAvailableRoomDescriptions,
    roomConnections, 
    treasureMap,
    setTreasureMap,
    treasurePieces,
    setTreasurePieces,
    collectedTreasures,
    setCollectedTreasures,
    hasMap,
    setHasMap,
    mapClue,
    playMapFoundSound,
    playTreasureFoundSound,
    setBatEncounters,
    torchLevel,
  setTorchLevel,
  darknessCounter,
  setDarknessCounter,

 // decreaseTorchLevel, // Pass the function
  MAX_DARKNESS,
 

  specialRooms,
  setSpecialRooms,
  inventory,
  setInventory,
  addItemToInventory,
  itemTypes,
  initializeSpecialRooms,
  collectSecretRoomItem,
  updateRoomDescriptionAfterCollection, // pass the function
  decreaseLanternFuel, // pass the function
  //  startingRoomFixed 
  giftShopRoom,
  setGiftShopRoom,
  showTradeButton,
  setShowTradeButton,
  shiftingRoomId,
  setShiftingRoomId,
  originalRoomDescription,
  setOriginalRoomDescription,
  originalRoomTreasure,
  setOriginalRoomTreasure,
  shiftingRoomDescriptions,
  setShiftingRoomDescriptions,
  currentShiftingIndex,
  setCurrentShiftingIndex,
  hasVisitedShiftingRoom,
  setHasVisitedShiftingRoom,
  setFungiWarning,
  setRoomEntryTime,
  fungiWarning,
  showWaterSpiritTradeButton,
  setShowWaterSpiritTradeButton,
  nightCrawlerWarning,
  setNightCrawlerWarning,
  nightCrawlerProtection,
  setNightCrawlerProtection,
  nightCrawlerProtectionTimer,
  setNightCrawlerProtectionTimer,
  crystalRoomWarning,
  setCrystalRoomWarning,
  //crystalEntryTime, 
  //setCrystalEntryTime,
  addInvisibilityCloakToGame,
  checkTemperatureEffects,
  temperatureTimer,
  setTemperatureTimer,
  wizardRoomVisited,
  setWizardRoomVisited,
  spellbookDeciphered, 
  setSpellbookDeciphered,
  activeSpell,
  setActiveSpell,
  floatingActive,
  setFloatingActive,
  floatingMovesLeft,
  setFloatingMovesLeft,
  calculateDistanceToRoom,
  isPoolRoom,
    goblinCooldown,
  setGoblinCooldown,
  shopMode,
  setShopMode,
  processShopPurchase,
  playAutoPickupSound,  
  giftShopCatalog , //added for testing only. remove when done
  setShowTreasureDisplay,
  setFoundTreasureInfo,
  playNixieTollReqiuredSound,
  playNixieOneGoldCoinSound,
  playNixieGoldenCompassSound,
    playNixieAFairTradeSound,
      playShopKeeperFileSound,
      playShopKeeperRepellentSound,
      playShopKeeperLanternSound,
      playShopKeeperMapFragmentSound,
      playShopKeeperFlaskOilSound,
      playShopKeeperCloakSound,
      playShopKeeperTShirtSound,
      playShopKeeperMugSound,
      playShopKeeperCanvasBagSound,
      playShopKeeperPlushieSound,
      playShopKeeperLeavingSound,
      playSandCreatureHissSound,
      playSandCreatureShriekSound
  });



  // Create a wrapped version of handleGuess that plays the explore sound
const handleGuessWithSound = (event) => {
  // Play the explore button sound first
  playExploreSound();
  
  // Start background music if not started yet
 // if (!backgroundMusicStarted.current) {
//    playBackgroundMusic();
//    backgroundMusicStarted.current = true;
 // }
  
  // Then immediately call the original handler
  handleGuess(event);
  
};
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
    
    // Special handling for backpack room - need to completely reset description
    const isBackpackRoom = (roomId) => {
      const roomDesc = roomDescriptionMap[roomId]?.text || '';
      return roomDesc.toLowerCase().includes('backpack with half-eaten rations') &&
             roomDesc.toLowerCase().includes('map that simply says');
    };
    
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

// New helper function to ensure compass is NEVER in backpack room
const placeGoldenCompassNotInBackpack = () => {
  console.log("Setting up golden compass placement (NEVER in backpack room)...");
  
  // Helper function to check if a room has a backpack description
  const hasBackpackDescription = (roomId) => {
    const roomDesc = roomDescriptionMap[roomId]?.text || '';
    return roomDesc.toLowerCase().includes('backpack with half-eaten rations') && 
           roomDesc.toLowerCase().includes('map that simply says');
  };
  
  // Get ALL rooms with backpack text to make sure we exclude all of them
  const backpackRooms = [];
  for (let i = 1; i <= 30; i++) {
    if (hasBackpackDescription(i)) {
      backpackRooms.push(i);
      console.log(`Found backpack room at ${i} - EXCLUDED from compass placement`);
    }
  }
  
  // Find rooms that are not occupied by hazards, treasures, or ANY backpack room
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
      !specialRooms[i]?.hasItem && 
      !backpackRooms.includes(i) && // Exclude ALL backpack rooms
      !hasBackpackDescription(i)    // Double-check backpack text
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

// Clear all death timers when game ends
useEffect(() => {
  if (gameStatus === 'lost' || gameStatus === 'won') {
    console.log("Game ended - clearing all death timers");
    
    // Clear temperature timer
    if (temperatureTimer) {
      clearTimeout(temperatureTimer);
      setTemperatureTimer(null);
    }
    
    // Clear window temperature tracking
    window.TEMP_EFFECT_ROOM = null;
    window.TEMP_EFFECT_TYPE = null;
    window.TEMP_EFFECT_START_TIME = null;
    
    // Clear hidden room trap timer
    if (window.HIDDEN_ROOM_TRAP_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_TRAP_TIMER);
      window.HIDDEN_ROOM_TRAP_TIMER = null;
      window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    }
    
    // Clear crystal room entry time - FIXED VERSION
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

  useEffect(() => {
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


// Add this useEffect to handle initial room timer setup
useEffect(() => {
  // Only run when game is playing and we have a position
  if (gameStatus !== 'playing' || !currentPosition || currentPosition === null) return;
  
  console.log(`Checking initial room ${currentPosition} for special timer setup`);
  
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


useEffect(() => {
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


  useEffect(() => {
    gameLogicFunctions.current = {
      startGame: startGameFromLogic,
      checkPosition
    };
  }, [startGameFromLogic, checkPosition]);

  useEffect(() => {
    // Hide water spirit trade button if toll is paid
    if (currentPosition && 
        specialRooms[currentPosition]?.hasWaterSpirit && 
        specialRooms[currentPosition]?.tollPaid) {
      console.log("Toll is paid - hiding water spirit trade button via useEffect");
      setShowWaterSpiritTradeButton(false);
    }
  }, [currentPosition, specialRooms]);

  // Add this useEffect to GameContext.js:
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
    
    // Attack at 30 seconds
    if (timeInRoom > 30) {
        console.log('30 seconds reached! Checking attack conditions...');
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


useEffect(() => {
  if (gameStatus !== 'playing' || !currentPosition) return;
  
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


  // Auto-start the game if not showing intro
  useEffect(() => {
    if (!showIntro && currentPosition === null) {
      startGameFromContext();
    }
  }, [showIntro, currentPosition]);

  // Initialize game data on first mount
  useEffect(() => {
    console.log("=== INITIALIZING GAME DATA ===");
    
    // Step 1: Generate game positions
    const initialPositions = generateGamePositions();
    console.log("Generated positions:", initialPositions); // Add this debug log
    setPositions(initialPositions);
    
    // Step 2: Create room descriptions immediately without relying on state
    const initialRoomDesc = createRoomDescriptions(initialPositions);
    console.log("Room descriptions created:", Object.keys(initialRoomDesc).length);
    
    // Step 3: Set room descriptions in state
    setRoomDescriptionMap(initialRoomDesc);
    

    // Step 4: Set available room descriptions
    const availableDesc = initializeGameRoomDescriptions();
    setAvailableRoomDescriptions(availableDesc);
    
    // Step 5: Generate room connections
    const initialConnections = generateRoomConnections();
    setRoomConnections(initialConnections);
    

    // Add this line to initialize the gift shop items
    initializeGiftShop();



    // Step 6: Assign map fragment purpose and log debug info
  //  assignMapFragmentPurpose();
    console.log("=== MAP FRAGMENT INFO ===");
    console.log("Map fragment purpose:", itemTypes.old_map.purpose);
    console.log("Purpose description:", itemTypes.old_map.purposeDescription);
    console.log("Hint message:", itemTypes.old_map.hintMessage);
    console.log("========================");
    
 
     



      // Debug code to find the lantern room
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

  // Add a separate effect that runs after room descriptions are fully loaded
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

 useEffect(() => {
  if (gameStatus !== 'playing' || !currentPosition || !roomEntryTime) return;
  
  if (floatingActive && floatingMovesLeft > 0) {
    return;
  }
  
  // Check if this is a safe room from nightcrawlers
  const isSafeRoom = 
    (specialRooms[currentPosition]?.hasFungiCreature) || // Fungi room
    (specialRooms[currentPosition]?.hasSandCreature) ||  // Sand creature room
    (currentPosition === giftShopRoom) ||               // Gift shop
    (currentPosition === 32) ||
    (specialRooms[currentPosition]?.hasCaveSalt) ||
    (roomDescriptionMap[currentPosition]?.special === "crystal" && 
      roomDescriptionMap[currentPosition]?.text?.includes("crystal columns")); // Crystal room
  
  // Create interval to check time every second
  const intervalId = setInterval(() => {
    // Check if game is still playing
    if (gameStatus !== 'playing') {
      clearInterval(intervalId);
      return;
    }
    
    const timeInRoom = (Date.now() - roomEntryTime) / 1000; // in seconds
    
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
      // Warning at 90 seconds (1.5 minutes)
      if (timeInRoom > 40 && !nightCrawlerWarning) {
        setNightCrawlerWarning(true);
        setMessage(prev => `${prev} \n\nYou hear a distant scratching sound. Something seems to be moving through the cave walls toward you.`);
      
              // START PLAYING THE SOUND AT LOW VOLUME
        playNightCrawlerSound(0.3);
      }
      
      // Death at 120 seconds (2 minutes)
      if (timeInRoom > 75) {
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



// 3. Add this new useEffect for the wizard room death timer
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

  // Create interval to check time
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



  // Initialize background music
  useEffect(() => {
    // We'll start the music on first user interaction instead
    
    // Clean up all sounds when the component unmounts
    return () => {
      cleanupSounds();
    };
  }, [cleanupSounds]);

  // Handle special room music
  useEffect(() => {
  console.log(`Room music change - Previous: ${previousRoomSpecial.current}, Current: ${roomSpecial}`);
  
  // Always stop any playing special music when room changes
  if (previousRoomSpecial.current && previousRoomSpecial.current !== roomSpecial) {
    console.log("Room changed - stopping previous special music");
    playSpecialRoomMusic(null);
  }
  
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
  
  // Play sound effects for specific messages
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
  


  // Handle ambient sounds based on perceptions
  useEffect(() => {
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
  
  // Cleanup sounds when game ends
  useEffect(() => {
    if (gameStatus !== 'playing') {
      playPitWindSound(false);
      playBatFlapSound(false);
    }
  }, [gameStatus, playPitWindSound, playBatFlapSound]);
  
  // Play sounds based on game state and death cause changes
useEffect(() => {
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
  
  // Play the appropriate death sound based on cause
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


/*
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
    
    // Reset the flags when game status changes from lost to playing
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

// Call this during game initialization


//useEffect(() => {
  // Add this line to your existing initialization effect
//  assignMapFragmentPurpose();
//}, []);


// —————————————————————————————————————
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
  
// In GameContext.js, update the canvas bag useEffect:


// 2. Function to place the golden compass in a suitable room
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

// Then call this before addEnhancedRoomItems in your effect:
// ensureEnhancedTextsExist();
// addEnhancedRoomItems();

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





//  Helper function to check if a room has a backpack description
const hasBackpackDescription = (roomId, roomDescMap) => {
  const roomDesc = roomDescMap[roomId]?.text || '';
  return roomDesc.includes('backpack with half-eaten rations') && 
         roomDesc.includes('map that simply says \'RUN!\'');
};


// Helper function to place the Reality Stabilizer
const placeRealityStabilizer = (availableRooms) => {
  console.log("Placing Reality Anchor in game world...");
  
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




  // ==================== CONTEXT VALUE ====================
  // Create the context value
  const value = {
    term,
    setTerm,
    currentPosition,
    gameStatus,
    message,
    roomDescription,
    history,
    perceptions,
    batEncounter,
    positions,
    roomMood,
    roomHasWater,
    roomSpecial,
    nearWumpus,
    nearPit, 
    nearBat,
    handleGuess: handleGuessWithSound, // Use wrapped version with sound
    handleChange,
    resetGame: resetGameWithSound, // Use wrapped version with sound
    deathCause,
    treasurePieces,
    collectedTreasures,
    hasMap,
    mapClue,
    roomConnections,
    treasureDebugInfo,
    showIntro,
    startGame: startGameFromContext,
    roomDescriptionMap ,
    inventory,
    // Other existing properties...
    torchLevel,
    darknessCounter,
    MAX_DARKNESS,
  
    addItemToInventory,
    hasItem,
    handleUseItem,
    specialRooms,
    batEncounters,
    throwingRepellent,
    repellentThrowHandler, 
    updateRoomDescriptionAfterCollection,
 decreaseLanternFuel,
 giftShopRoom,
 showTradeButton,
 handleTrade,
 showWaterSpiritTradeButton,
 handleWaterSpiritTrade,
 nightCrawlerWarning,
 
 nightCrawlerProtection,
 setRoomDescriptionMap, // Important to export this
 setRoomDescription,    // Important to export this
 itemTypes,        // Make sure this is here too
 setMessage ,       // Make sure this is here
 getFullInteractiveStatement,
 createEnhancedRoomDescription,
 wizardRoomVisited,
 spellbookDeciphered,
 activeSpell,
 floatingActive,
 floatingMovesLeft,
 spellbookBackfire,
 setSpellbookBackfire,
 inspectGoldCoins  ,
 forceUpdateCloakState,
 setInventory,
 handleTrapTrigger ,
     shopMode,              // Add this
    processShopPurchase,
          shiftingRoomId,        // ADD THIS

 //collectEnhancedRoomItem
  setGameStatus,
  setDeathCause,

    handleHiddenRoomTrap,
   showTreasureDisplay,
  setShowTreasureDisplay,
  foundTreasureInfo,
  setFoundTreasureInfo,
    saveGame,
  loadGame,
  hasSavedGame,
  deleteSavedGame,
  showLadderExtendScene,
setShowLadderExtendScene,
   specialMessage,  // ADD THIS
    setSpecialMessage,  // ADD THIS (optional, in case you need it elsewhere)
      showWinVideo,
  setShowWinVideo,
   showWinMessage,
  setShowWinMessage,
  showNixieDisplay,    
  setShowNixieDisplay,  
  
  };

  return (
    <GameContext.Provider value={value}>
   
      {children}
    </GameContext.Provider>
  );
};