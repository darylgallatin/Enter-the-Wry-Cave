import { singleGoldCoinDescription } from '../utils/coinLore';

export const handleUseWumpusTshirt = (dependencies) => {
    // Only extract dependencies we actually use
    const {
      inventory,
      setInventory,
      setMessage,
      playDistantWumpusSound
    } = dependencies;
    
    console.log("Using Wumpus T-shirt");
    
    // Find the T-shirt in inventory
    const tshirtItem = inventory.find(item => 
      (item.originalId || item.id) === 'wumpus_tshirt'
    );
    
    if (!tshirtItem) {
      console.error("T-shirt not found in inventory");
      return false;
    }
    
    // Toggle equipped state
    const currentlyEquipped = tshirtItem.equipped || false;
    const newEquippedState = !currentlyEquipped;
    
    // Check if the player is wearing the invisibility cloak
    const isWearingCloak = inventory.some(item => 
      (item.originalId || item.id) === 'invisibility_cloak' && item.equipped === true
    );
    
    // If trying to put on the T-shirt while wearing the cloak
    if (newEquippedState && isWearingCloak) {
      setMessage("You can't put on the T-shirt while wearing the cloak. Remove the cloak first.");
      return false; // Don't change equipped state
    }
    
    // Update inventory
    setInventory(prev => prev.map(item => {
      if ((item.originalId || item.id) === 'wumpus_tshirt') {
        return {
          ...item,
          equipped: newEquippedState,
          name: newEquippedState ? 'Wumpus Cave T-shirt (Worn)' : 'Wumpus Cave T-shirt'
        };
      }
      return item;
    }));
    
    // Display appropriate message based on equipped state
    if (newEquippedState) {
      setMessage("You pull the tacky t-shirt over your head. It's a bit tight, but oddly comfortable. The large 'I SURVIVED THE ANCIENT CAVE!' text glows slightly in the dark.");
      
      // Additional sound effects or effects here...
    } else {
      setMessage("You remove the tacky souvenir t-shirt and stuff it in your pack.");
    }
    
    return false; // Don't remove the item
};
  
  export const handleUseSouvenirMug = (dependencies) => {
    // Only extract dependencies we actually use
    const {
      currentPosition,
      roomHasWater,
      roomDescriptionMap,
      specialRooms,
      setSpecialRooms,
      positions,
      roomConnections,
      inventory,
      setInventory,
      setMessage,
      setTorchLevel,
      setGameStatus,
      setDeathCause,
      playDistantWumpusSound,
      setPositions
    } = dependencies;
    
    console.log("Using Cave Explorer Mug");
    // NEW CODE: Check if in sand creature room
  const inSandRoom = specialRooms[currentPosition]?.hasSandCreature;
  
  if (inSandRoom && specialRooms[currentPosition]?.sandCreatureActive) {
    console.log("Using mug in active sand creature room");
    
    // Sacrifice the mug to trap the sand creature
    setMessage("From the entry way into this cavern you toss the mug into the center of the sand. A sand creature from  beneath lurches upward, grabbing the mug and pulling it under. The sand settles, and you notice the circular pattern has disappeared - the path is now safe.");
    
    // Deactivate the sand creature
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        sandCreatureActive: false,
        sandCreatureDefeated: true // Mark as defeated for good
      }
    }));
    
    // Remove the mug from inventory
    return true; // Item will be removed
  }

    // WIZARD ROOM CHECK - Add this right here!
    if (currentPosition === 32 && !specialRooms[32]?.wizardFreed) {
      console.log("Player trying to put mug in wizard room hole - fatal mistake!");
      
      setMessage("You try to jam the ceramic mug into the pedestal hole.\nIt doesn't quite fit, so you push harder.\nThe room begins to shake violently!\n\n 'A MUG?! A MUG?!' the wizard's voice screams. 'IT SAYS STONE! STONE! NOT CERAMIC SOUVENIRS! ARE YOU ILLITERATE OR JUST STUPID?!\n WAIT, DON'T ANSWER - YOU'RE ABOUT TO BE CRUSHED! HAHAHAHA!'\n The ceiling collapses as the wizard's manic laughter echoes through the crumbling chamber.\nYour last thought is that maybe you should have read the instructions more carefully.");
      
      setTimeout(() => {
        setGameStatus('lost');
        setDeathCause('stupidity');
      }, 8000); // Give them time to read the message
      
      return true; // Remove the mug (they're dead anyway)
    }


    // Check if player is in a water room
    const inWaterRoom = roomHasWater || 
                       (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('water') || 
                       (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('pool') ||
                       (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('stream');
    
    if (inWaterRoom) {
      console.log("Player is in a water room");
      
      // Check if it's a clean water source (water sprite room)
      const isCleanWater = specialRooms[currentPosition]?.hasWaterSpirit;
      
      if (isCleanWater) {
        console.log("Water is clean (water spirit room)");
        // Safe to drink
        setMessage("You dip the souvenir mug into the crystal-clear water of the pool. As you take a refreshing sip, you feel revitalized! Your torch burns a bit brighter.");
        
        // Increase torch level by 20%
        setTorchLevel(prev => Math.min(100, prev + 20));
      } else {
        console.log("Water is not clean - dysentery incoming!");
        // Death by dysentery - Oregon Trail reference
        setMessage("You fill the souvenir mug with cave water and take a hearty gulp. It tastes... strange. Within moments, your stomach cramps violently. Your vision blurs as you collapse to the ground. The water contained a prehistoric super-microbe unseen by modern medicine.");
        
        // Short delay for dramatic effect
        setTimeout(() => {
          setGameStatus('lost');
          setDeathCause('dysentery');
          setMessage("You have died of dysentery. Game over!");
        }, 10000);
      }
    } else {
      console.log("No water here to fill the mug");
      // No water here
      setMessage("You examine the tacky souvenir mug. The phrase 'DON'T WAKE UP GRANDPA' glows slightly in the dark. There's no water here to fill it with.");
      
      // 10% chance the mug makes a sound that alerts the Wumpus
      if (Math.random() < 0.1) {
        setTimeout(() => {
          console.log("Mug made a noise - alerting Wumpus");
          setMessage(prev => prev + " As you put the mug away, it makes a loud 'CLINK' against your gear. You freeze, hoping nothing heard that...");
          
          // Play Wumpus sound if available
          if (typeof playDistantWumpusSound === 'function') {
            playDistantWumpusSound();
          }
          
          // Move the Wumpus closer if possible
          if (positions.wumpusPosition && roomConnections[positions.wumpusPosition]) {
            const wumpusConnections = roomConnections[positions.wumpusPosition];
            
            // Find a connection that moves the Wumpus closer to the player if possible
            let closestRoom = null;
            let shortestDistance = Infinity;
            
            for (const connectedRoom of wumpusConnections) {
              // Simple distance calculation (just numeric difference for simplicity)
              const currentDistance = Math.abs(positions.wumpusPosition - currentPosition);
              const newDistance = Math.abs(connectedRoom - currentPosition);
              
              // If this room is closer to the player than the current Wumpus position
              if (newDistance < currentDistance && newDistance < shortestDistance) {
                shortestDistance = newDistance;
                closestRoom = connectedRoom;
              }
            }
            
            // If we found a closer room, move the Wumpus there
            if (closestRoom !== null) {
              setPositions(prev => ({
                ...prev,
                wumpusPosition: closestRoom
              }));
            } 
            // Otherwise just pick a random connected room
            else if (wumpusConnections.length > 0) {
              const randomRoom = wumpusConnections[Math.floor(Math.random() * wumpusConnections.length)];
              setPositions(prev => ({
                ...prev,
                wumpusPosition: randomRoom
              }));
            }
          }
        }, 2000);
      }
    }
    
    // 50% chance the mug breaks if used in water
    if (inWaterRoom && Math.random() < 0.5) {
      setTimeout(() => {
        console.log("Mug broke from temperature difference");
        setMessage(prev => prev + " Unfortunately, the mug's cheap ceramic couldn't handle the temperature difference and cracked in half. It's now useless.");
        
        // Remove from inventory
        setInventory(prev => prev.filter(item => 
          (item.originalId || item.id) !== 'souvenir_mug'
        ));
      }, 4000);
      
      return false; // We'll handle removal in the timeout
    }
    
    return false; // Keep the mug (unless broken in the timeout)
  };
  
 
export const handleUseCanvasBag = (dependencies) => {
  // Only extract dependencies we actually use
  const {
    collectedTreasures,
    setMessage,
    setInventory,
    setSpecialRooms,
    positions,
    roomConnections,
    currentPosition,
    setPositions,
    playDistantWumpusSound,
    inventory
  } = dependencies;
  
  console.log("Using Adventure Canvas Bag");
  
  // Check if player currently has any treasures in inventory
  const hasTreasuresCollected = collectedTreasures && collectedTreasures.length > 0;
  
  // Find the canvas bag in inventory
  const canvasBag = inventory.find(item => 
    (item.originalId || item.id) === 'canvas_bag'
  );
  
  // Check if it has the coinFound flag set
  const coinAlreadyFound = canvasBag && canvasBag.coinFound === true;
  
  if (hasTreasuresCollected) {
    console.log("Player has treasures - bag provides protection");
    
    // Check if bag is already marked as in use
    if (canvasBag && canvasBag.inUse) {
      const treasureCount = collectedTreasures.length;
      setMessage(`Your canvas bag is already protecting your ${treasureCount} treasure${treasureCount > 1 ? 's' : ''}.`);
      return false; // Don't consume the item
    }
    
    // Bag provides protection for treasures
    setMessage("You carefully place your collected treasures in the sturdy canvas bag. Its lining contains mysterious runes that seem to counteract the curse. Your treasures are now safer from cave magic!");
    
    // Mark that treasures are protected
    setInventory(prev => {
      const updatedInventory = prev.map(item => {
        if ((item.originalId || item.id) === 'canvas_bag') {
          return {
            ...item,
            inUse: true,
            coinFound: item.coinFound || false,
            name: 'Adventure Canvas Bag (Filled)',
            description: 'A sturdy canvas bag containing your treasures. The magical runes on it counteract the curse.'
          };
        }
        return item;
      });
      
      return updatedInventory;
    });
    
    // Add a special property to track treasure protection
    setSpecialRooms(prev => ({
      ...prev,
      treasuresProtected: true
    }));
    
    // 5% chance the bag rips anyway
    if (Math.random() < 0.05) {
      setTimeout(() => {
        console.log("Bad luck - bag tears and exposes treasures!");
        setMessage("The canvas bag suddenly tears along the bottom seam! Your treasures spill out across the cave floor, glowing with renewed curse energy. Hurriedly, you gather them back up, but the damage is done.");
        
        // Bag is destroyed
        setInventory(prev => prev.filter(item => 
          (item.originalId || item.id) !== 'canvas_bag'
        ));
        
        // Remove treasure protection
        setSpecialRooms(prev => ({
          ...prev,
          treasuresProtected: false
        }));
        
        // Move the Wumpus closer due to curse energy
        if (positions && positions.wumpusPosition && roomConnections && roomConnections[positions.wumpusPosition]) {
          const wumpusConnections = roomConnections[positions.wumpusPosition];
          
          // Find a connection that moves the Wumpus closer to the player if possible
          let moveTarget = null;
          
          if (wumpusConnections.includes(currentPosition)) {
            // Wumpus can go directly to player's room!
            moveTarget = currentPosition;
          } else if (wumpusConnections.length > 0) {
            // Just pick a random connected room
            moveTarget = wumpusConnections[Math.floor(Math.random() * wumpusConnections.length)];
          }
          
          if (moveTarget !== null) {
            setPositions(prev => ({
              ...prev,
              wumpusPosition: moveTarget
            }));
            
            // Play Wumpus sound if available
            if (typeof playDistantWumpusSound === 'function') {
              playDistantWumpusSound();
            }
          }
        }
      }, 3000);
    }
  } else {
    console.log("Player has no treasures yet");
    // No treasures to store
    setMessage("You examine the canvas bag. It's surprisingly well-made for gift shop merchandise, with strange runes woven into the inner lining. It might be useful for carrying treasures, but you haven't found any yet.");
    
    // Only check for gold coin if it hasn't been found yet
    if (!coinAlreadyFound && Math.random() < 0.95) {
      setTimeout(() => {
        console.log("Player found a gold coin in the bag!");
        
        // Import or reference singleGoldCoinDescription
        const goldCoinName = "Gold Coin";
        const goldCoinLore = "A single golden coin of ancient make";
        
        setMessage(prev => prev + ` Wait - there's something in one of the pockets! You discover a single ${goldCoinName}. ${goldCoinLore}.`);
        
        // Mark the bag as having had its coin found
        setInventory(prev => prev.map(item => {
          if ((item.originalId || item.id) === 'canvas_bag') {
            return {
              ...item,
              coinFound: true // Mark that coin has been found
            };
          }
          return item;
        }));
        
        // Check if player already has gold coins
        const existingGoldCoins = inventory.find(item => 
          (item.originalId || item.id) === 'gold_coins'
        );
        
        if (existingGoldCoins) {
          // Add 1 to existing gold coins count
          setInventory(prev => prev.map(item => {
            if ((item.originalId || item.id) === 'gold_coins') {
              // Make sure value is actually a number
              const currentValue = typeof item.value === 'number' ? item.value : parseInt(item.value) || 1;
              return {
                ...item,
                value: currentValue + 1,
                name: `Gold Coins (${currentValue + 1})`,
                description: `${currentValue + 1} ancient gold coins. They're quite valuable!`
              };
            }
            return item;
          }));
        } else {
          // Add new gold coin to inventory
          setInventory(prev => [...prev, {
            id: 'gold_coins',
            originalId: 'gold_coins',
            name: 'Gold Coin',
            icon: '🪙',
            description: 'A single ancient gold coin. It\'s quite valuable!',
            value: 1,
            canUse: false
          }]);
        }
      }, 2000);
    }
  }
  
  return false; // Don't consume the canvas bag
};
  
  
  export const handleUseDruikaPlush = (dependencies) => {
    // Only extract dependencies we actually use
    const {
      nightCrawlerWarning,
      nightCrawlerProtection,
      setMessage,
      setNightCrawlerWarning,
      setRoomEntryTime,
      setInventory,
      roomConnections,
      currentPosition,
      positions,
      setPositions,
      playDistantWumpusSound,
      findShortestPath,
      playPlushieScreamSound,
      playPlushieSqueakSound,
      playPlushieMatingCallSound,
    } = dependencies;
    
    // First check if player is in danger from nightcrawlers
    const inDanger = nightCrawlerWarning && !nightCrawlerProtection;
    
    if (inDanger) {
      // Use the plush as a distraction/sacrifice for the nightcrawlers
      playPlushieScreamSound();
      setMessage("As the nightcrawlers approach, you frantically toss the  plush toy toward the sound. To your amazement, the toy emits a loud horrible  vomiting like  sound  and its eyes begin to glow bright red! The nightcrawlers retreat from the light, buying you some time to escape.\nYou notice the plushie disintegrate andwith the flakes absorbed by the cave floor");
      
      // Provide temporary protection without activating the cave salt protection UI
      setNightCrawlerWarning(false);
      
      // Reset the room entry time to effectively give the player more time
      setRoomEntryTime(Date.now());
      
      // Remove the plush - it's sacrificed
      return true; // Remove the item
    }




    const addWumpusWarningEffect = (wumpusRoom) => {
  console.log(`Attempting to highlight wumpus room ${wumpusRoom}...`);
  
  // Use requestAnimationFrame to ensure DOM is ready
  requestAnimationFrame(() => {
    // Find all connection buttons
    const allButtons = document.querySelectorAll('.connection-btn');
    console.log(`Found ${allButtons.length} connection buttons`);
    
    // Find the button for the wumpus room
    const roomButton = Array.from(allButtons).find(btn => 
      btn.textContent.trim() === wumpusRoom.toString()
    );
    
    if (!roomButton) {
      console.log(`Could not find button for wumpus room ${wumpusRoom}`);
      return;
    }
    
    console.log(`Found button for wumpus room ${wumpusRoom}, applying warning effect`);
    
    // Create unique ID for this animation
    const uniqueID = `wumpus-warning-${Date.now()}`;
    
    // Create a style element
    const styleElement = document.createElement('style');
    styleElement.id = uniqueID;
    
    // Define a red/danger animation for the wumpus warning
    styleElement.textContent = `
      @keyframes wumpus-warning-${uniqueID} {
        0% { 
          background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
        }
        50% { 
          background: linear-gradient(135deg, #8B0000, #DC143C);
          box-shadow: 0 0 20px #FF0000;
          transform: scale(1.1);
        }
        100% { 
          background: linear-gradient(135deg,rgb(103, 83, 66), #774513);
        }
      }
      
      .wumpus-warning-${uniqueID} {
        animation: wumpus-warning-${uniqueID} 0.8s ease-in-out 5;
        z-index: 100;
      }
    `;
    
    // Add the style to the document
    document.head.appendChild(styleElement);
    
    // Add the class to the button
    roomButton.classList.add(`wumpus-warning-${uniqueID}`);
    
    // Remove the class and style element after animation completes
    setTimeout(() => {
      roomButton.classList.remove(`wumpus-warning-${uniqueID}`);
      const styleElem = document.getElementById(uniqueID);
      if (styleElem) {
        document.head.removeChild(styleElem);
      }
      console.log(`Removed wumpus warning effect from room ${wumpusRoom}`);
    }, 4000); // 0.8s × 5 repeats = 4 seconds
  });
};
    
    // Check if the Wumpus is in an adjacent room
    const adjacentRooms = roomConnections[currentPosition] || [];
const wumpusNearby = adjacentRooms.includes(positions.wumpusPosition);
    // Debug logging
console.log("Current position:", currentPosition);
console.log("Wumpus position:", positions.wumpusPosition);
console.log("Adjacent rooms:", roomConnections[currentPosition]);
console.log("Is wumpus nearby?", wumpusNearby);


if (wumpusNearby) {
  // Find which room the Wumpus is in
  const adjacentRooms = roomConnections[currentPosition] || [];
  const wumpusRoom = adjacentRooms.find(room => room === positions.wumpusPosition);

     setMessage("You squeeze the plush, causing it to emit what sounds like some sort of psychotropic acid trip monster mating call.\n");
     playPlushieMatingCallSound()
      // Move the Wumpus away from the player
      let newWumpusPosition;
      do {
        newWumpusPosition = Math.floor(Math.random() * 30) + 1;
      } while (
        newWumpusPosition === currentPosition || 
        newWumpusPosition === positions.pitPosition1 || 
        newWumpusPosition === positions.pitPosition2 || 
        roomConnections[currentPosition]?.includes(newWumpusPosition)
      );
      
      setPositions(prev => ({
        ...prev,
        wumpusPosition: newWumpusPosition
      }));
      
      // Play wumpus sound if available
      // After 3 seconds, play roar and update message
        if (wumpusRoom) {
    // Flash the wumpus room button
    addWumpusWarningEffect(wumpusRoom);
  }
  setTimeout(() => {
    if (typeof playDistantWumpusSound === 'function') {
      playDistantWumpusSound();
    }
      

    setMessage(prev => prev + " There's a moment of silence, then an answering roar from nearby! You quickly toss the plush down a side passage.");
  }, 4000);
  
      
      // Remove the plush - it's used as bait
      return true;
    }
    
    // Regular use - no danger present
    playPlushieSqueakSound();
    setMessage("You squeeze the plush Druika toy. It squeaks and its eyes glow red momentarily. Other than being slightly unnerving, it doesn't seem to do anything useful at the moment.");
    
    // 15% chance it alerts the real Wumpus
    if (Math.random() < 0.15) {
      setTimeout(() => {
        // Play wumpus sound if available
        if (typeof playDistantWumpusSound === 'function') {
          playDistantWumpusSound();
        }
        
        setMessage(prev => prev + " Wait... was that an answering roar from somewhere in the cave? The toy's eyes are glowing brighter now. Perhaps it wasn't wise to mock the cave's apex predator...");
        
        // Move the Wumpus closer
        const currentWumpusPos = positions.wumpusPosition;
        const possibleRooms = roomConnections[currentWumpusPos] || [];
        
        // Find which connected room is closest to the player
        let closestRoom = currentWumpusPos;
        let shortestDistance = 100;
        
        possibleRooms.forEach(room => {
          if (typeof findShortestPath === 'function') {
            const path = findShortestPath(room, currentPosition, roomConnections);
            if (path && path.distance < shortestDistance) {
              shortestDistance = path.distance;
              closestRoom = room;
            }
          }
        });
        
        // Move the Wumpus
        setPositions(prev => ({
          ...prev,
          wumpusPosition: closestRoom
        }));
      }, 2000);
    }
    
    return false; // Keep the item unless used for a specific purpose
  };
  
  // Export all gift shop item handlers in a single object for easier import
  export const giftShopItemHandlers = {
    handleUseWumpusTshirt,
    handleUseSouvenirMug,
    handleUseCanvasBag,
    handleUseDruikaPlush,
    
  };