import React, { useEffect, useState, useRef } from 'react';
import { useGame } from '../context/GameContext';
import Perceptions from './Perceptions';
import RoomDescription from './RoomDescription';
import { getMoodStyles } from '../data/roomDescriptions';
import '../App.css'; // Make sure the throwing mode CSS is loaded
import '../styles/TextStyles.css'; // Import the new styles
import '../styles/scenes.css'; // css for picture scenes

const GameBoard = () => {
  const { 
    term, 
    message,
    roomDescription, 
    gameStatus, 
    batEncounter,
    perceptions,
    roomMood,
    currentPosition,
    roomConnections,
    history,
    handleGuess, 
    handleChange, 
    resetGame,
  
    treasurePieces,
    roomHasWater, // Use this prop to detect water rooms
    throwingRepellent,
    repellentThrowHandler,
    showTradeButton,
    handleTrade,
    showWaterSpiritTradeButton,
    handleWaterSpiritTrade,
    nightCrawlerWarning,
    nightCrawlerProtection,
    inventory,
    shopMode,              // Add this

     giftShopRoom,  
     giftShopCatalog,
      
      deathCause,
      positions, 
      roomDescriptionMap,
       handleHiddenRoomTrap,
         showTreasureDisplay,
  foundTreasureInfo,
    saveGame,
  loadGame,
  hasSavedGame,
  deleteSavedGame,
  showLadderExtendScene,
  specialMessage,
  showWinVideo,
  showWinMessage,
  setShowWinMessage,
  specialRooms,
  playLoadGameSound,
    playDeleteSavedGameSound

  } = useGame();
 console.log("showWinVideo", showWinVideo);

 console.log("showLadderExtendScene", showLadderExtendScene);
  console.log("Special message in GameBoard:", specialMessage);
  const [containerStyle, setContainerStyle] = useState({});
  const [wizardMode, setWizardMode] = useState(false);
  const [showMapDiscovery, setShowMapDiscovery] = useState(false);
  const [oneWayDiscovered, setOneWayDiscovered] = useState(false);
  const [pulsedButtons, setPulsedButtons] = useState([]);
  const [isWaterRoom, setIsWaterRoom] = useState(false);
  
  const [showGiftShopDisplay, setShowGiftShopDisplay] = useState(false);
const [giftShopItems, setGiftShopItems] = useState([]);

const [showWizardRoomDisplay, setShowWizardRoomDisplay] = useState(false);
const [hasLeftWizardRoom, setHasLeftWizardRoom] = useState(false);

const showCurseDeathDisplay = gameStatus === 'lost' && deathCause === 'curse';

const showTrinketTrapDisplay = gameStatus === 'lost' && deathCause === 'trinket_trap';

const [showShrineDisplay, setShowShrineDisplay] = useState(false);

const [showHiddenRoomDisplay, setShowHiddenRoomDisplay] = useState(false);

const [hiddenRoomTrapActive, setHiddenRoomTrapActive] = useState(false);

const [showVortexTrapDisplay, setShowVortexTrapDisplay] = useState(false);

const [showNixieRageDeathDisplay, setShowNixieRageDeathDisplay] = useState(false);

  // Ref to track previous position
  const prevPositionRef = useRef(null);
  // Ref for game board container for water effects
  const gameBoardRef = useRef(null);

const [showPitDeathDisplay, setShowPitDeathDisplay] = useState(false);

const [showDarknessDeathDisplay, setShowDarknessDeathDisplay] = useState(false);

// Add state for night crawler death
const [showNightCrawlerDeathDisplay, setShowNightCrawlerDeathDisplay] = useState(false);
// Add state for wumpus death
const [showWumpusDeathDisplay, setShowWumpusDeathDisplay] = useState(false);

const [showSulfurExplosionDisplay, setShowSulfurExplosionDisplay] = useState(false);

const [showLadderTrapDisplay, setShowLadderTrapDisplay] = useState(false);

const [showExitRoomDisplay, setShowExitRoomDisplay] = useState(false);
const [showExitWithLadder, setShowExitWithLadder] = useState(false);

const [showMagicalCatastropheDisplay, setShowMagicalCatastropheDisplay] = useState(false);

const [showTranquilPoolDisplay, setShowTranquilPoolDisplay] = useState(false);


  // Update container style based on room mood and check for water room
  useEffect(() => {
    const newStyle = getMoodStyles(roomMood);
    setContainerStyle(newStyle);
    
    // Check if this is a water-themed room
    const waterRoomDesc = roomDescription?.toLowerCase().includes('water drips') || 
                        roomDescription?.toLowerCase().includes('droplets') ||
                        roomDescription?.toLowerCase().includes('stream') ||
                        roomDescription?.toLowerCase().includes('pool');
    
    // Set water room state based on description or roomHasWater prop
    setIsWaterRoom(waterRoomDesc || roomHasWater);
    
    // Check if the message contains wizard text
    const isWizardMessage = message.includes('Evil Cave Wizard');
    setWizardMode(isWizardMessage);
    
    // If it's a wizard message, add wizard effects
    if (isWizardMessage) {
      // After the wizard message plays, turn off wizard mode
      const timer = setTimeout(() => {
        setWizardMode(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }

    // Check if the message contains map discovery
    console.log("Displaying room description:", roomDescription);
    const isMapDiscovery = message.includes('You found an ancient treasure map');
    setShowMapDiscovery(isMapDiscovery);
  }, [roomMood, message, roomDescription, roomHasWater]);



  // 3. Add this useEffect to detect wizard room and wyrmglass status
useEffect(() => {
  // Check if we're in the wizard's room (room 32)
  if (currentPosition === 32) {
    setShowWizardRoomDisplay(true);
    
    // If wizard is already freed when we enter, check if this is a return visit
    if (window.WIZARD_FREED && prevPositionRef.current !== 32 && prevPositionRef.current !== null) {
      // We're entering from another room after wizard was freed
      setHasLeftWizardRoom(true);
    }
  } else {
    setShowWizardRoomDisplay(false);
    
    // If we're leaving room 32 and wizard is freed, mark that we've left
    if (prevPositionRef.current === 32 && window.WIZARD_FREED) {
      setHasLeftWizardRoom(true);
    }
  }
  
  // Update previous position AFTER the checks
  prevPositionRef.current = currentPosition;
}, [currentPosition]);

// Add useEffect to detect wumpus death
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'wumpus') {
    setShowWumpusDeathDisplay(true);
  } else {
    setShowWumpusDeathDisplay(false);
  }
}, [gameStatus, deathCause]);

// Add this useEffect with your other room detection effects
useEffect(() => {
  // Check if we're in the hidden room (31)
  if (currentPosition === 31) {
    setShowHiddenRoomDisplay(true);
  } else {
    setShowHiddenRoomDisplay(false);
  }
}, [currentPosition]);

// Add useEffect
// Simplified trap handling - just visual effects
useEffect(() => {
  const handleTrap = (event) => {
    if (event.detail.trapActive && currentPosition === 31) {
      setHiddenRoomTrapActive(true);
      
      // Set a timer to trigger the actual death after 5 seconds
      const deathTimer = setTimeout(() => {
        // Check if player is still in room 31
        if (currentPosition === 31) {
          // Call the GameContext function to handle the actual trap
          handleHiddenRoomTrap();
        }
      }, 5000); // 4 seconds to escape
      
      // Store the timer so we can clear it if needed
      window.HIDDEN_ROOM_DEATH_TIMER = deathTimer;
    }
  };
  
  window.addEventListener('hidden_room_trap', handleTrap);
  return () => window.removeEventListener('hidden_room_trap', handleTrap);
}, [currentPosition, handleHiddenRoomTrap]);

// Clear trap visual when leaving room 31
useEffect(() => {
  if (currentPosition !== 31) {
    setHiddenRoomTrapActive(false);
    
    // Clear the timer if player escaped
    if (window.HIDDEN_ROOM_TRAP_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_TRAP_TIMER);
      window.HIDDEN_ROOM_TRAP_TIMER = null;
      window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    }
  }
}, [currentPosition]);

// Add useEffect to detect ladder trap death
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'ladder_trap') {
    setShowLadderTrapDisplay(true);
  } else {
    setShowLadderTrapDisplay(false);
  }
}, [gameStatus, deathCause]);


// Add useEffect to detect night crawler death
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'night_crawlers') {
    setShowNightCrawlerDeathDisplay(true);
  } else {
    setShowNightCrawlerDeathDisplay(false);
  }
}, [gameStatus, deathCause]);


// Add this useEffect with your other death detection useEffects
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'sulfur_explosion') {
    setShowSulfurExplosionDisplay(true);
  } else {
    setShowSulfurExplosionDisplay(false);
  }
}, [gameStatus, deathCause]);

// 3. Add this useEffect to detect pit rooms and death:
useEffect(() => {
  // Check if we're in a pit room AND the game is lost
  if (currentPosition && positions && gameStatus === 'lost' && 
      (currentPosition === positions.pitPosition1 || currentPosition === positions.pitPosition2)) {
    setShowPitDeathDisplay(true);
  } else {
    setShowPitDeathDisplay(false);
  }
}, [currentPosition, positions, gameStatus]);


// 2. Add this useEffect to detect when player is in gift shop (add after the existing useEffects)
useEffect(() => {
  // Check if we're in the gift shop room
  // Don't call useGame() here - use the values already destructured above
  
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
}, [currentPosition, giftShopRoom, shopMode, inventory, giftShopCatalog]); // Add all dependencies


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
        roomText.includes("perfect mirror") ) {
      setShowTranquilPoolDisplay(true);
    } else {
      setShowTranquilPoolDisplay(false);
    }
  }
}, [currentPosition, roomDescriptionMap, showMapDiscovery, showHiddenRoomDisplay]);



// Add this useEffect with your other death detection effects
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'vortex_trap') {
    setShowVortexTrapDisplay(true);
  } else {
    setShowVortexTrapDisplay(false);
  }
}, [gameStatus, deathCause]);
  
// 4. Add this useEffect to detect darkness deaths:
useEffect(() => {
  // Check if game is lost due to darkness (either type)
  if (gameStatus === 'lost' && (deathCause === 'torch_darkness' || deathCause === 'lantern_darkness')) {
    setShowDarknessDeathDisplay(true);
  } else {
    setShowDarknessDeathDisplay(false);
  }
}, [gameStatus, deathCause]);

  // Add water effect to game board when in a water room
  useEffect(() => {
    if (isWaterRoom && gameBoardRef.current) {
      const container = gameBoardRef.current;
      
      // Clear any existing water drops
      const existingDrops = container.querySelectorAll('.gb-water-drop, .gb-water-ripple');
      existingDrops.forEach(el => el.remove());
      
      // Create 15 water drops at random positions
      for (let i = 0; i < 15; i++) {
        // Create the drop
        const drop = document.createElement('div');
        drop.className = 'gb-water-drop';
        
        // Random horizontal position
        const xPos = 5 + Math.random() * 90; // 5-95% to keep it within view
        drop.style.left = `${xPos}%`;
        
        // Random timing for each drop
        drop.style.setProperty('--drip-delay', `${Math.random() * 15}s`); // More spread out
        drop.style.setProperty('--drip-duration', `${4 + Math.random() * 6}s`); // Slower falls
        
        container.appendChild(drop);
        
        // Create the ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'gb-water-ripple';
        ripple.style.left = `${xPos}%`;
        
        // Random ripple size
        const rippleSize = 10 + Math.random() * 10;
        ripple.style.width = `${rippleSize}px`;
        ripple.style.height = `${rippleSize}px`;
        
        // Match ripple timing to drop timing, but with offset
        const dropDelay = parseFloat(drop.style.getPropertyValue('--drip-delay'));
        const dropDuration = parseFloat(drop.style.getPropertyValue('--drip-duration'));
        ripple.style.setProperty('--ripple-delay', `${dropDelay + dropDuration * 0.9}s`);
        
        container.appendChild(ripple);
      }
      
      // Add water overlay if not already present
      if (!container.querySelector('.water-room-overlay')) {
        const overlay = document.createElement('div');
        overlay.className = 'water-room-overlay';
        container.appendChild(overlay);
      }
      
      // Cleanup function
      return () => {
        const drops = container.querySelectorAll('.gb-water-drop, .gb-water-ripple, .water-room-overlay');
        drops.forEach(el => el.remove());
      };
    }
  }, [isWaterRoom]);

  // Check for one-way passages
  useEffect(() => {
    if (prevPositionRef.current && currentPosition) {
      // Check if we can go back to where we came from
      const canGoBack = roomConnections[currentPosition]?.includes(prevPositionRef.current);
      
      if (!canGoBack && history.length > 1) {
        // We've discovered a one-way passage!
        setOneWayDiscovered(true);
        
        // Hide the message after 5 seconds
        setTimeout(() => {
          setOneWayDiscovered(false);
        }, 5000);
      }
    }
    
    // Update previous position for next check
    prevPositionRef.current = currentPosition;
  }, [currentPosition, roomConnections, history]);


 //Shimmer effect for treasure clues
  useEffect(() => {
    if (!showMapDiscovery) return;

    const treasureClasses = ['ruby-clue', 'medallion-clue', 'statue-clue', 'amulet-clue'];
    let currentIndex = 0;
    let animationTimeout = null;
    let cycleInterval = null;

    // Function to animate the next treasure
    const animateNext = () => {
      // Remove shimmer from ALL elements first
      document.querySelectorAll('.ruby-clue, .medallion-clue, .statue-clue, .amulet-clue').forEach(el => {
        el.classList.remove('shimmer-active');
      });

      // Get the current class
      const currentClass = treasureClasses[currentIndex];
      const currentElement = document.querySelector(`.map-clue-list .${currentClass}`);

      if (currentElement) {
        // Force a reflow to ensure the animation restarts
        void currentElement.offsetWidth;
        
        // Add shimmer effect to only this element
        currentElement.classList.add('shimmer-active');
        
        // Remove the class after animation completes (1.5s)
        animationTimeout = setTimeout(() => {
          currentElement.classList.remove('shimmer-active');
        }, 3500);
      }

      // Move to next treasure for the next cycle
      currentIndex = (currentIndex + 1) % treasureClasses.length;
    };

    // Start animation after ensuring DOM is ready
    const startTimeout = setTimeout(() => {
      // Initial animation
      animateNext();
      
      // Set up repeating animation every 2 seconds (1.5s animation + 0.5s pause)
      cycleInterval = setInterval(animateNext, 1600);
    }, 100);

    // Cleanup function
    return () => {
      clearTimeout(startTimeout);
      clearTimeout(animationTimeout);
      clearInterval(cycleInterval);
      
      // Remove all shimmer classes
      document.querySelectorAll('.ruby-clue, .medallion-clue, .statue-clue, .amulet-clue').forEach(el => {
        el.classList.remove('shimmer-active');
      });
    };
  }, [showMapDiscovery]); // Re-run when map discovery state changes


useEffect(() => {
  // Check if we're in the exit room
  if (currentPosition === positions?.exitPosition && gameStatus === 'playing') {
    // Check if player has wyrmglass
    const hasWyrmglass = inventory.some(item => 
      (item.originalId || item.id) === 'wyrmglass'
    );
    
    if (hasWyrmglass) {
      // Check if lantern is active
      const hasActiveLantern = inventory.some(item => 
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      setShowExitRoomDisplay(true);
      setShowExitWithLadder(!hasActiveLantern); // Show ladder only if lantern is OFF
    } else {
      setShowExitRoomDisplay(false);
    }
  } else {
    setShowExitRoomDisplay(false);
  }
}, [currentPosition, positions, inventory, gameStatus]);



// Add this useEffect after your other death detection useEffects
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'magical_catastrophe') {
    setShowMagicalCatastropheDisplay(true);
  } else {
    setShowMagicalCatastropheDisplay(false);
  }
}, [gameStatus, deathCause]);

// Add this additional useEffect to reset when leaving the room
useEffect(() => {
  if (currentPosition !== 31) {
    setHiddenRoomTrapActive(false);
    window.HIDDEN_ROOM_TRAP_TRIGGERED = false;
    
    // Clear the death timer if player escaped
    if (window.HIDDEN_ROOM_DEATH_TIMER) {
      clearTimeout(window.HIDDEN_ROOM_DEATH_TIMER);
      window.HIDDEN_ROOM_DEATH_TIMER = null;
    }
  }
}, [currentPosition]);


// Add this useEffect to detect nixie rage death
useEffect(() => {
  if (gameStatus === 'lost' && deathCause === 'nixie_rage') {
    setShowNixieRageDeathDisplay(true);
  } else {
    setShowNixieRageDeathDisplay(false);
  }
}, [gameStatus, deathCause]);

// 5. Add function to determine which darkness death class to use:
const getDarknessDeathClass = () => {
  if (deathCause === 'torch_darkness') {
    return "torch-darkness-death";
  } else if (deathCause === 'lantern_darkness') {
    return "lantern-darkness-death";
  }
  return "torch-darkness-death"; // fallback
};


// 4. Add function to determine which pit death class to use:
const getPitDeathClass = () => {
  if (currentPosition === positions?.pitPosition1) {
    return "pit-death-1";
  } else if (currentPosition === positions?.pitPosition2) {
    return "pit-death-2";
  }
  return "pit-death-1"; // fallback
};








// Add this function to handle selecting a room when throwing the repellent
const handleRoomSelection = (room) => {
  console.log(`Selected room ${room} for throwing repellent`);
  if (throwingRepellent && repellentThrowHandler) {
    // Call the handler with the selected room
    repellentThrowHandler(room);
  }
};

  // Helper function to get the clue class based on treasure ID
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


// 4. Add this function to determine which wizard room background to use
const getWizardRoomClass = () => {
  // Check if wyrmglass has been taken from pedestal (in player's inventory)
  const hasWyrmglass = inventory.some(item => 
    (item.originalId || item.id) === 'wyrmglass'
  );
  
  // Debug logging to see what's happening
  console.log("Wizard room state check:");
  console.log("- WIZARD_FREED:", window.WIZARD_FREED);
  console.log("- Has left wizard room:", hasLeftWizardRoom);
  console.log("- Has wyrmglass in inventory:", hasWyrmglass);
  console.log("- Current room:", currentPosition);
  
  // STATE 1: Wizard trapped (initial state)
  if (!window.WIZARD_FREED) {
    console.log("STATE 1: Showing trapped wizard");
    return "wizard-room-trapped";
  }
  
  // STATE 2: Rock placed, wizard just freed (still in room)
  if (window.WIZARD_FREED && !hasLeftWizardRoom) {
    console.log("STATE 2: Showing room with rock in pedestal");
    return "wizard-room-rock";
  }
  
  // STATE 3: Returned to room after freeing wizard, wyrmglass appears
  if (window.WIZARD_FREED && hasLeftWizardRoom && !hasWyrmglass) {
    console.log("STATE 3: Showing wyrmglass on pedestal");
    return "wizard-room-freed";
  }
  
  // STATE 4: Wyrmglass taken, empty pedestal
  if (window.WIZARD_FREED && hasWyrmglass) {
    console.log("STATE 4: Showing empty pedestal");
    return "wizard-room-empty";
  }
  
  // Fallback - should not reach here
  return "wizard-room-trapped";
};

  // Parse map clues from the message
  const parseMapContent = () => {
    if (!message.includes('You found an ancient treasure map')) {
      return { title: '', introText: '', clues: [] };
    }

    const parts = message.split('\n\n');
    if (parts.length < 3) return { title: '', introText: '', clues: [] };

    // First part is room number, second is map discovery
    const title = parts[1].trim();
    // If we have "The ancient map..." text
    const introText = parts.length > 2 ? parts[2].trim() : '';
    
    // Extract the clues (the bullet points)
    const clueText = parts.slice(3).join('\n\n');
    const clues = clueText.split('\n\n')
      .filter(line => line.startsWith('•'))
      .map(line => line.substring(2).trim());

    return { title, introText, clues };
  };

  // Check if a connection is potentially one-way
  const isOneWayConnection = (targetRoom) => {
    // If no current position or connections data, can't determine
    if (!currentPosition || !roomConnections[targetRoom]) return false;
    
    // Check if the target room has a connection back to the current room
    return !roomConnections[targetRoom].includes(currentPosition);
  };

  // Handle button pulsing
  const handleButtonPulse = (room) => {
    // If this room has already pulsed, don't pulse again
    if (pulsedButtons.includes(room)) return false;
    
    // Check if it's a one-way passage
    if (isOneWayConnection(room)) {
      // Add to pulsed buttons list so it only pulses once
      setPulsedButtons(prev => [...prev, room]);
      return true;
    }
    
    return false;
  };

  const mapContent = parseMapContent();

  return (
    <div 
     className={`container game-board ${wizardMode ? 'wizard-mode' : ''} ${isWaterRoom ? 'water-room' : ''} ${nightCrawlerProtection ? 'night-crawler-protection' : ''} ${gameStatus === 'lost' || gameStatus === 'won' ? 'game-over' : ''}`} 
  style={containerStyle}
  ref={gameBoardRef}
    >
      <div className='head'>
        <label htmlFor='term'>
          Cave Explorer: Numbers 1-30
        </label>
      </div>

   <div className="game-message-container">
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
    
    {/* Overlay the map content on top of the video */}
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
  ) : showMagicalCatastropheDisplay ? (
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
  ) : showNightCrawlerDeathDisplay ? (
  <div className="night-crawler-death-display">
    <p className={`game-message lost night_crawlers`}>
      {message}
    </p>
  </div>
  )  : showDarknessDeathDisplay ? (
    <div className={`darkness-death-display ${getDarknessDeathClass()}`}>
      <div className="darkness-death-content">
        <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''} ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
          {message}
        </p>
      </div>
    </div>
  ): showNixieRageDeathDisplay ? (
  <div className="nixie-rage-death-display">
    <p className={`game-message lost nixie_rage`}>
      {message}
    </p>
  </div>
  
  ): showLadderExtendScene && gameStatus !== 'won' ? (
  <div className="ladder-extend-display">
    {/* Only show video if not transitioning to win */}
    {!showWinVideo && (
      <video
        className="ladder-video-background"
        autoPlay
        muted
        playsInline
        onEnded={() => {
          console.log("Ladder extension video finished");
          // Remove video from DOM after playing
         
        }}
      >
        <source src={require('../images/player_holding_orb_rusty_ladder_hole.mp4')} type="video/mp4" />
      </video>
    )}
    {/* Always show the fallback image as background */}
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
  ): showPitDeathDisplay ? (
    <div className={`pit-death-display ${getPitDeathClass()}`}>
      <div className="pit-death-content">
        <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''} ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
          {message}
        </p>
      </div>
    </div>
  ): showWumpusDeathDisplay ? (
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
) : showSulfurExplosionDisplay ? (
  <div className="sulfur-explosion-display">
    <p className={`game-message lost sulfur_explosion`}>
      {message}
    </p>
  </div>
  ):  showCurseDeathDisplay ? (
    // ADD THIS NEW CONDITION
    <div className="curse-death-display">
      <p className={`game-message lost curse`}>
        {message}
      </p>
    </div>
  ): showTrinketTrapDisplay ? (
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
  ): showLadderTrapDisplay ? (
  <div className="ladder-trap-display">
    <p className={`game-message lost ladder_trap`}>
      {message}
    </p>
  </div>
) : showWizardRoomDisplay ? (
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
  ) : showMapDiscovery ? (
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
   
  ):  showHiddenRoomDisplay ? (
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

  ) : showExitRoomDisplay ? (
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
) : showTranquilPoolDisplay ? ( <div className={
    currentPosition && specialRooms[currentPosition]?.showNixieDeathScene ? 
    "nixie-death-scene-display" :
    currentPosition && specialRooms[currentPosition]?.nixieHasAppeared ? 
    "nixie-appearance-display" : 
    "tranquil-pool-display"
  }>
    {!specialRooms[currentPosition]?.nixieHasAppeared && (
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
) :showShrineDisplay ? (
  <div className="goblin-shrine-display">
  
        <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''}`}>
          {message}
        </p>
      </div>
     
) : showGiftShopDisplay ? (
  <div className="gift-shop-discovery">
    <div className="gift-shop-title">🛍️ Throk's Cave Gift Shop 🛍️</div>
    <div className="gift-shop-subtitle">"Finest Cave Souvenirs & Survival Gear!"</div>
    
    <div className="gift-shop-content">
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
      
      {/* The actual message from checkForGiftShop will appear here */}
      <div className="shop-message-area">
        <p className={`game-message ${gameStatus !== 'playing' ? gameStatus : ''} ${batEncounter ? 'bat-encounter' : ''} ${gameStatus === 'lost' && deathCause ? deathCause : ''}`}>
          {message}
        </p>
      </div>
      
      {/* ADD SAVE/LOAD CONTROLS HERE */}
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
) : (
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

  {oneWayDiscovered && (
    <div className="one-way-message">
      You notice the passage sealed behind you. There's no way back the way you came!
    </div>
  )}

  {nightCrawlerWarning && !nightCrawlerProtection && (
    <div className="night-crawler-warning">
      Warning: You've been squatting here like a teenager at a mall. The wall worms are filing noise complaints and preparing an eviction notice with their teeth. Shuffle along to another room or protect yourself with...
    </div>
  )}

  {nightCrawlerProtection && (
    <div className="protection-status">
      <span className="protection-icon">✨</span> Cave Salt Protection Active
    </div>
  )}
</div>

{/* Trade button appears here when in gift shop */}
{showTradeButton && showGiftShopDisplay && (
  <button 
    className="trade-gold-btn" 
    onClick={handleTrade}
    data-description="Trade your gold coins for useful items"
  >
    Trade Gold Coins
  </button>
)}

{roomDescription && (
  <RoomDescription description={roomDescription} />
)}

<Perceptions perceptions={perceptions} gameStatus={gameStatus} />

{/* Room connections UI */}
{currentPosition && roomConnections && roomConnections[currentPosition] && gameStatus === 'playing' && (
  <div className="connections-wrapper">
    <div className="room-connections">
      <p className="connections-header">
        {throwingRepellent ?
          "Choose a room to throw the Wumpus Repellent into:" :
          "Tunnels lead to rooms:"}
      </p>
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
    // Add e.stopPropagation() to prevent event bubbling
    e.stopPropagation();
    if (throwingRepellent) {
      // We're in throwing mode - handle the repellent throw
      handleRoomSelection(room);
    } else if (isSpecial) {
      // For special rooms, don't update the input field, just navigate directly
      handleGuess({ 
        preventDefault: () => {},
        target: { specialRoomTarget: room }
      });
    } else {
      // For normal rooms, use the custom event object
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
    
    {/* Add the water spirit trade button here */}
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
      
      {gameStatus !== 'playing' && (
        <button onClick={resetGame} className='reset-btn'>
          Play Again
        </button>
      )}
    </div>
  );
};

export default GameBoard;