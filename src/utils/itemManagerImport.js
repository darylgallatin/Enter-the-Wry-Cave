import { itemHandlers } from './itemHandlers';
import { giftShopItemHandlers } from './giftShopItems';



// Combine all handlers into a single object
const allItemHandlers = {
  ...itemHandlers,
  ...giftShopItemHandlers
};

/**
 * Main function to handle using any item in the game
 * This centralizes the logic and automatically routes to the correct handler
 * 
 * @param {string} itemId - The ID of the item being used
 * @param {object} dependencies - All required state variables and setters
 * @returns {boolean} - Whether the item should be removed from inventory
 */
export const handleItemUse = (itemId, dependencies) => {
  console.log("ITEM 33!!!-------", itemId )
  // Extract commonly used dependencies
  const {
    inventory,
    setInventory,
    itemTypes,
    setMessage,
    playGoldenCompassSound,
    
    currentPosition

    
  } = dependencies;

  // Find the item in inventory
  const item = inventory.find(item => item.id === itemId);
  if (!item) return false;
  
  // Get the original item type
  const originalId = item.originalId || item.id;
  
  // Special case for torch oil
  if (originalId === 'torch_oil') {
    return handleUseTorchOil(dependencies);
  }

  // Special case for golden compass
if (originalId === 'golden_compass') {
  playGoldenCompassSound();
  return allItemHandlers.handleUseGoldenCompass(dependencies);
}
  
  // Special handling for the cloak
  if (originalId === 'invisibility_cloak') {
    console.log("CLOAK USE DETECTED - calling handleUseInvisibilityCloak with item:", item);
    return handleUseInvisibilityCloak(dependencies, item);
  }
  
  // Special handling for lantern
  if (originalId === 'lantern') {
    if (typeof dependencies.activateLantern === 'function') {
      dependencies.activateLantern();
    } else {
      console.error("activateLantern function not available");
    }
    return false; // Don't remove lantern
  }

  // Special case for Wumpus Repellent
  if (originalId === 'druika_repellent') {
    return handleUseWumpusRepellent(dependencies, itemId);
  }
  
  // Special case for map fragment
  if (originalId === 'old_map') {
    console.log("Map fragment use detected - will NOT remove from inventory");
    
    // Find the correct handler and call it
    if (dependencies.handleUseMapFragment) {
      dependencies.handleUseMapFragment();
    } else if (allItemHandlers.handleUseOldMap) {
      allItemHandlers.handleUseOldMap(dependencies);
    } else {
      setMessage("You examine the map fragment, but can't make sense of it right now.");
    }
    
    return false; // Force keep the item regardless of return value
  }
  
  // For other items, find the appropriate handler function
  const handlerName = `handleUse${capitalizeFirstLetter(originalId)}`;
  



  // Check if we have a handler for this item
  if (allItemHandlers[handlerName]) {
    // Call the appropriate handler with all dependencies
    try {
      return allItemHandlers[handlerName](dependencies);
    } catch (error) {
      console.error(`Error in ${handlerName}:`, error);
      setMessage(`You try to use the ${item.name}, but something goes wrong.`);
      return false; // Don't remove item on error
    }
  }
  
  // No specific handler found, use default behavior
  setMessage(`You examine the ${item.name}, but aren't sure how to use it here. IMPORT`);
  return false; // Keep the item
};

/**
 * Special handler for using Wumpus Repellent
 * This needs special handling because of the throwing mechanic
 */
const handleUseWumpusRepellent = (dependencies, itemId) => {
  const {
    positions,
    roomConnections,
    currentPosition,
    setPositions,
    setGameStatus,
    setDeathCause,
    gameLogicFunctions,
    playWumpusScreamSound,
    inventory,
    setInventory,
    setThrowingRepellent,
    setRepellentThrowHandler,
    setMessage,
    setVialToThrowSound,
    playThrowingVialWooshSound,
    playVialbreakingSound,
  } = dependencies;

  console.log("WUMPUS REPELLENT USE DETECTED - setting up throwing mode");
  
  // Enable throwing mode first
  setThrowingRepellent(true);
  
  // Show instruction message
  setMessage("Where do you wish to throw the liquid Reek of the Ancients? Select a room.");
  setVialToThrowSound();
  // Define the handler function but with protection against null room
  const safeThrowHandler = (targetRoom) => {
    playThrowingVialWooshSound()
    // Safety check - only proceed if we have a valid room number
    if (targetRoom === null || targetRoom === undefined) {
      console.log("WARNING: Throw handler called with invalid room, ignoring");
      return; // Don't process with invalid room
    }
    
    console.log(`Throwing repellent into valid room ${targetRoom}`);
    console.log(`Wumpus is currently in room ${positions.wumpusPosition}`);
    
    // Disable throwing mode
    setThrowingRepellent(false);
    
    // Remove the repellent from inventory
    setInventory(prev => prev.filter(i => i.id !== itemId));
    
    // Check if wumpus is in the target room
    if (parseInt(targetRoom) === positions.wumpusPosition) {
      console.log("DIRECT HIT! Wumpus is in this room!");
      
     
        // Wait 1 second after throwing sound before playing scream
    setTimeout(() => {
      // Play wumpus scream sound
      if (typeof playWumpusScreamSound === 'function') {
        playWumpusScreamSound();
      }
    }, 1500); // 1 second delay


      // Message about direct hit
        setTimeout(() => {
          
      setMessage("You lob the Reek of the Ancients into the chamber! An indignant shriek rattles the cave walls as the Druika discovers what a thousand-year-old gym sock smells like! It bellows and  gags dramatically as it leaves the room. Thankfully it doesnt come into yours");
          }, 4500);
      // 10% chance the Wumpus tramples the player in confusion
      if (Math.random() < 0.1) {
        // The Wumpus comes to the player's room!
        setTimeout(() => {
          setMessage("In a confused and desperate attempt to escape the nostril-melting stench, the Druika crashes into YOUR chamber like a drunk rhinoceros at a tea party! It accidentally steamrolls you while frantically fanning the air with its arms. Game over!");
          setGameStatus('lost');
          setDeathCause('wumpus');
        }, 3500);
        
        return;
      }
      
      // The Wumpus flees to another room (not connected to player)
      // First, get all possible rooms the Wumpus might flee to
      const wumpusConnections = roomConnections[positions.wumpusPosition] || [];
      
      // Filter out the player's room and rooms with hazards
      const safeWumpusDestinations = wumpusConnections.filter(room => 
        room !== currentPosition && 
        room !== positions.pitPosition1 && 
        room !== positions.pitPosition2 && 
        room !== positions.batPosition
      );
      
      // If there are safe destinations, pick one randomly
      if (safeWumpusDestinations.length > 0) {
        const newWumpusRoom = safeWumpusDestinations[Math.floor(Math.random() * safeWumpusDestinations.length)];
        
        console.log(`Wumpus fleeing from room ${positions.wumpusPosition} to room ${newWumpusRoom}`);
        
        // Move the Wumpus
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusRoom
        }));
        
        setTimeout(() => {
          setMessage(prev => prev + " You hear heavy footsteps rapidly moving away as the Wumpus flees!");
          
          // Update perceptions to reflect the Wumpus's new position
          if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
            gameLogicFunctions.current.checkPosition(currentPosition);
          }
        }, 2500);
      } else {
        // No safe destinations - Wumpus is cornered and moves to a random room
        let newWumpusPosition;
        do {
          newWumpusPosition = Math.floor(Math.random() * 30) + 1;
        } while (
          newWumpusPosition === currentPosition ||
          newWumpusPosition === positions.pitPosition1 ||
          newWumpusPosition === positions.pitPosition2 ||
          newWumpusPosition === positions.batPosition
        );
        
        console.log(`Wumpus cornered! Moving from ${positions.wumpusPosition} to random room ${newWumpusPosition}`);
        
        // Move the Wumpus
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusPosition
        }));
        
        setTimeout(() => {
          setMessage(prev => prev + " The Druika seems cornered, but then crashes through the cave walls to escape the foul smell!");
          
          // Update perceptions
          if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
            gameLogicFunctions.current.checkPosition(currentPosition);
          }
        }, 2500);
      }
    } 
    // Check if wumpus is adjacent to the target room
    else if (roomConnections[targetRoom] && roomConnections[targetRoom].includes(positions.wumpusPosition)) {
      console.log("NEAR MISS! Wumpus is adjacent to this room!");
      
      // Near miss - Wumpus is adjacent to where the repellent was thrown
      setMessage("You hurl the repellent with all your might down the corridor  into room " + targetRoom + ". You hear angry growling nearby as the Druika reacts to the strange scent!");
      
      // 20% chance the disturbed Wumpus moves to the player's room
      if (Math.random() < 0.2) {
        console.log("1 RUN AT USER")
        // Check if player has invisibility cloak
        const hasInvisibilityCloak = inventory.some(item => 
          (item.originalId || item.id) === 'invisibility_cloak' && item.equipped
        );
        
        if (hasInvisibilityCloak) {
          // Saved by the cloak!
          setTimeout(() => {
            setMessage(prev => prev + " The Wumpus bursts into YOUR room but can't see you through your invisibility cloak. It leaves, confused.");
            
            // Move the Wumpus to a random room (not the player's)
            let newWumpusPosition;
            do {
              newWumpusPosition = Math.floor(Math.random() * 30) + 1;
            } while (
              newWumpusPosition === currentPosition ||
              newWumpusPosition === positions.pitPosition1 ||
              newWumpusPosition === positions.pitPosition2 ||
              newWumpusPosition === positions.batPosition
            );
            
            // Move the Wumpus
            setPositions(prev => ({
              ...prev,
              wumpusPosition: newWumpusPosition
            }));
            
            // Update perceptions
            if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
              gameLogicFunctions.current.checkPosition(currentPosition);
            }
          }, 2500);
        } else {
          // Player doesn't have the cloak - the Wumpus finds them!
          setTimeout(() => {
            setMessage(prev => prev + " Suddenly the Druika bursts into YOUR room, seeking the source of the disturbance!");
            setGameStatus('lost');
            setDeathCause('wumpus');
          }, 2000);
        }
      } else {
        // The Wumpus is disturbed but doesn't find the player
        // Move the Wumpus to a random room (not the player's)
        let newWumpusPosition;
        do {
          newWumpusPosition = Math.floor(Math.random() * 30) + 1;
        } while (
          newWumpusPosition === currentPosition ||
          newWumpusPosition === positions.pitPosition1 ||
          newWumpusPosition === positions.pitPosition2 ||
          newWumpusPosition === positions.batPosition
        );
        
        console.log(`Wumpus disturbed! Moving from ${positions.wumpusPosition} to random room ${newWumpusPosition}`);
        
        // Move the Wumpus
        setPositions(prev => ({
          ...prev,
          wumpusPosition: newWumpusPosition
        }));
        
        setTimeout(() => {
          setMessage(prev => prev + " You hear the creature moving away to escape the foul smell.");
          
          // Update perceptions
          if (gameLogicFunctions.current && gameLogicFunctions.current.checkPosition) {
            gameLogicFunctions.current.checkPosition(currentPosition);
          }
        }, 2000);
      }
    } else {
      console.log("MISS! Wumpus is not in or adjacent to this room.");
     // Wait 1 second after throwing sound before playing breaking sound
    setTimeout(() => {
      playVialbreakingSound();
    }, 1500); // 1 second delay

    
      // Missed completely - the Wumpus isn't in or adjacent to the target room

      setTimeout(() => {
      setMessage("You hurl the repellent with all your might down the corridor  into room " + targetRoom + ", but it seems to have no effect. \n\nThe glass vial shatters in the distance, the sound echoing coldly through the tunnels \nThe Druika must be farther away.");
       }, 1500); // 1.5 seconds to allow both sounds to play
   
    }
  };
  
  // Store the handler function with the safety check
  setRepellentThrowHandler(() => safeThrowHandler);
  
  // IMPORTANT: Return early to prevent any further processing
  return false; // Don't remove yet - will be removed during throwing
};

/**
 * Helper function to capitalize the first letter of a string
 * Used to convert item IDs to handler function names
 */
const capitalizeFirstLetter = (string) => {
  if (!string) return '';
  // First handle underscores by splitting, capitalizing each part, and joining
  return string
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

/**
 * Helper function for torch oil specifically
 */
const handleUseTorchOil = ({
  setTorchLevel,
  setDarknessCounter,
  setMessage,
  inventory,
  setInventory,
  playFlameSound
}) => {
  // Replenish torch to full
  setTorchLevel(100);
  setDarknessCounter(0);
  
  // Find oil flask in inventory
  const oilFlask = inventory.find(item => 
    (item.originalId || item.id) === 'torch_oil'
  );
  
  // Show message
  setMessage("You  carefully pour the oil onto your torch and the flame brightens considerably.");
   playFlameSound();
  // Check if we have multiple flasks or just one
  if (oilFlask && oilFlask.quantity && oilFlask.quantity > 1) {
    // Reduce quantity
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'torch_oil') {
        return {
          ...item,
          quantity: item.quantity - 1,
          name: `Torch Oil Flask (${item.quantity - 1})` // Update name to show new count
        };
      }
      return item;
    }));
    return false; // Don't remove item entirely
  } else {
    // Remove the oil from inventory if it's the last one
    return true; // Item will be removed
  }
}; 

/**
 * Helper function for invisibility cloak specifically
 */
const handleUseInvisibilityCloak = (dependencies) => {
  // Extract needed dependencies
  const {
    forceUpdateCloakState,
    inventory,
    setInventory,
    setMessage,
    currentPosition,
    checkTemperatureEffects
  } = dependencies;
  
  console.log("CLOAK USE HANDLER: Starting");
  
  // Find the cloak item
  const cloakItem = inventory.find(item => 
    (item.originalId || item.id) === 'invisibility_cloak'
  );
  
  if (!cloakItem) {
    console.error("Could not find cloak in inventory");
    return false;
  }
  
  // Ensure equipped is a boolean
  const currentEquipped = cloakItem.equipped === true;
  const newEquippedState = !currentEquipped;
  
  // Check if trying to put on cloak while wearing t-shirt
  if (newEquippedState) {
    const isWearingTshirt = inventory.some(item => 
      (item.originalId || item.id) === 'wumpus_tshirt' && item.equipped === true
    );
    
    if (isWearingTshirt) {
      setMessage("You can't put on the cloak while wearing the T-shirt. Remove the T-shirt first.");
      return false; // Don't change equipped state
    }
  }
  
  // Use the forceUpdateCloakState function
  if (typeof forceUpdateCloakState === 'function') {
    forceUpdateCloakState(newEquippedState);
  } else {
    console.error("forceUpdateCloakState not available - falling back to basic update");
    // Original update code here as fallback
  }
  
  // Set appropriate message
  if (newEquippedState) {
    setMessage("You wrap the thick cloak around your shoulders. It's surprisingly warm, and you notice a strange shimmer at the edge of your vision when you move.");
  } else {
    setMessage("You remove the cloak and fold it over your arm. The air feels different against your skin now.");
  }
  
  // Check temperature effects after a slight delay
  setTimeout(() => {
    if (typeof checkTemperatureEffects === 'function' && currentPosition) {
      checkTemperatureEffects(currentPosition);
    }
  }, 100);
  
  return false; // Don't remove the item
};
