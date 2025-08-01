const handleUseRustyKey = (dependencies) => {
    // Extract dependencies
    const {
      currentPosition, 
      specialRooms,
     setRoomDescriptionMap,
     setMessage,
   
      setRoomConnections,
      playOldDoorOpeningSound,
    } = dependencies;
    
    // Check if in a room with a hidden door
    if (specialRooms[currentPosition]?.hasHiddenDoor) {
      setMessage("You use the rusty key in the hidden keyhole. With a grinding sound, a secret passage opens!");
      playOldDoorOpeningSound()
      // Update room connections to include the secret room
      const secretRoom = specialRooms[currentPosition].secretRoom;
      if (secretRoom) {
        // Update connections for current room to include secret room
        setRoomConnections(prev => {
          const updatedConnections = {...prev};
          updatedConnections[currentPosition] = [
            ...updatedConnections[currentPosition], 
            secretRoom
          ];
          
          // Also create or update connections for the secret room to include the way back
          if (!updatedConnections[secretRoom]) {
            updatedConnections[secretRoom] = [currentPosition];
          } else if (!updatedConnections[secretRoom].includes(currentPosition)) {
            updatedConnections[secretRoom] = [...updatedConnections[secretRoom], currentPosition];
          }
          
          return updatedConnections;
        });
        
        // Force update the room description for the secret room   
        const secretRoomContent = specialRooms[secretRoom]?.specialContent;
      const secretContentDesc = secretRoomContent?.interactiveText || 
                         secretRoomContent?.description ||
          "Ancient artifacts and strange symbols cover the walls.";
        
      setRoomDescriptionMap(prev => ({
          ...prev,
          [secretRoom]: {
            text: "A hidden chamber untouched for centuries. The air is thick with dust and mystery and is wild looking. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls. \nAlso a spinning vortex thingie that I should probably stay away from. \n" + secretContentDesc,
            special: "hidden_chamber",
            mood: "magical",
            hasWater: false,
            // ADD THESE LINES
            hasInteractiveItem: secretRoomContent?.id ? true : false,
            interactiveItem: secretRoomContent?.id || null,
            textAfterCollection: "A hidden chamber untouched for centuries. The air is thick with dust and mystery and is wild looking. Ancient artifacts, a sarcophagus(?), and strange symbols cover the walls. \nAlso a spinning vortex thingie that I should probably stay away from as it's spinning faster now.  \nEmpty pedestals and shelves show where ancient treasures once rested."
              }
            }));
        
        return true; // Successfully used and remove from inventory
      }
    } else {
      // The key doesn't work in this room - DON'T remove it from inventory
      setMessage("The key doesn't seem to fit anywhere in this room.");
    }
    
    return false; // Keep the key in inventory
  };
  
export const handleUseWizardJournal = (dependencies) => {
  const {
    currentPosition,
    specialRooms,
    setSpecialRooms,
    setMessage,
    inventory,          // ADD THIS
    setInventory,       // ADD THIS
    
    showWaterSpiritTradeButton,
    setShowWaterSpiritTradeButton,

  playNixieThankYouJournalSound,
  } = dependencies;
  
  console.log("Using wizard journal in room", currentPosition);
  
  console.log("Using wizard journal in room", currentPosition);
  console.log("showWaterSpiritTradeButton:", showWaterSpiritTradeButton);
  console.log("specialRooms[currentPosition]:", specialRooms[currentPosition]);
  
  // Check if in nixie room
  const isNixieRoom = specialRooms[currentPosition]?.hasWaterSpirit && 
                      specialRooms[currentPosition]?.waterSpiritActive;
  
  console.log("isNixieRoom:", isNixieRoom);

  
  // Check if nixie has already appeared (trade button is showing)
  const nixieHasAppeared = showWaterSpiritTradeButton;
    console.log("nixieHasAppeared:", showWaterSpiritTradeButton);
    if (isNixieRoom && nixieHasAppeared) {
    // Nixie is present and asking for payment - give her the journal!
    playNixieThankYouJournalSound()
    setMessage("You toss the leather-bound journal toward the water. The nixie's eyes go wide with delight!\n\n" +
               "'THE WIZARD'S JOURNAL?! Oh my gills, I've been DYING to read his secrets! " +
               "Did he really turn himself into a rock? What's his poker strategy?!'\n\n" +
               "She clutches the journal like a precious treasure, flipping through pages with webbed fingers.\n\n" +
               "'THANK YOU! Here, take this coin I've been saving. Now if you'll excuse me, " +
               "I have CENTURIES of gossip to catch up on!'\n\n" +
               "The nixie dives into the depths with her new reading material, giggling with glee. " +
               "The pool becomes still and ordinary - she won't be coming back.");
    
    // Handle single gold coin addition (copied from unified handler)
    const existingGoldCoins = inventory.find(item =>
      (item.originalId || item.id) === 'gold_coins'
    );
    
    if (existingGoldCoins) {
      // Add 1 to existing gold coins count
      setInventory(prev => prev.map(item => {
        if ((item.originalId || item.id) === 'gold_coins') {
          const currentValue = typeof item.value === 'number' ? item.value : 1;
          const newValue = currentValue + 1;
          return {
            ...item,
            value: newValue,
            name: `Ancient Wyrm Coins (${newValue})`
          };
        }
        return item;
      }));
    } else {
      // Create a new gold coin item with value 1
      const newCoin = {
        id: 'gold_coins_' + Date.now(),
        originalId: 'gold_coins',
        name: 'Ancient Wyrm Coin',
        icon: '💰',
        description: 'A single ancient gold coin, gifted by a grateful water spirit.',
        value: 1,
        canInspect: true,
        canUse: false
      };
      setInventory(prev => [...prev, newCoin]);
    }
    
    // Permanently remove nixie and hide trade button
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        waterSpiritActive: false,
        waterSpiritGone: true,
        nixieHasJournal: true,
        tollPaid: true
      }
    }));
    
    // Hide the trade button
    setShowWaterSpiritTradeButton(false);
    
    return true; // Remove journal from inventory
  } else {
    // Nixie hasn't appeared yet OR not in nixie room - journal gets offended
    setMessage("You pull out the wizard's journal and open it. The book suddenly springs to life!\n\n" +
               "'HOW RUDE!' it shouts in a tiny, papery voice. 'Reading someone's private journal? " +
               "Without even offering it to someone who might appreciate it? The NERVE!'\n\n" +
               "The journal snaps itself shut, plops onto the ground with an indignant thud, " +
               "and vanishes in a puff of offended smoke.\n\n" +
               "Well, that's the last you'll see of THAT.");
    
    return true; // Remove journal from inventory
  }
};


export const handleUseLooseRocks = (dependencies) => {
  // Extract needed dependencies
  const {
    currentPosition,
    specialRooms,
    setSpecialRooms,
    setMessage,
   
    roomDescriptionMap,
    setRoomDescriptionMap, // ADD THIS to dependencies
    positions,
    roomMood,
    roomHasWater,

    playRockThrowSound,
    playRockLockedInPLaceSound,
    playWizardFreedSound,
    playSodiumRockWaterExplosionSound,
    playWaterNixieShriekSound,
    playNixieWailingKillScream,
    setGameStatus,
    setDeathCause,
    
  } = dependencies;

  console.log("Using loose rocks in room", currentPosition);

  // CASE 0: WIZARD'S ROOM (Room 32) - HIGHEST PRIORITY
 if (currentPosition === 32) {
    // Check if wizard hasn't been freed yet
    if (!specialRooms[32]?.wizardFreed) {
      // Free the wizard!
      setSpecialRooms(prev => ({
        ...prev,
        32: {
          ...prev[32],
          wizardFreed: true
        }
      }));
      
      // ADD THIS: Update room 32 description permanently
      const freedDescription = {
        text: "The sanctum feels different now - lighter somehow. The ancient tomes still line the walls, but the oppressive feeling is gone. A thank-you note floats in mid-air: 'Finally! Do you know how boring it is being a cave? -W' On a pedestal where the hole once was, you notice a <span class='interactive-item' data-item='wyrmglass'>polished glass sphere</span> that seems to hold swirling mists within.",
        mood: "peaceful",
        hasWater: false,
        special: "echo",
        perception: "The room feels grateful, if a room can feel such things.",
        hasInteractiveItem: true,
        interactiveItem: 'wyrmglass',
        // Store the text without wyrmglass for after collection
        textAfterCollection: "The sanctum feels different now - lighter somehow. The ancient tomes still line the walls, but the oppressive feeling is gone. A thank-you note floats in mid-air: 'Finally! Do you know how boring it is being a cave? -W'",
        wizardFreed: true // Mark as freed
      };
      
      // Update roomDescriptionMap permanently
      setRoomDescriptionMap(prev => ({
        ...prev,
        32: freedDescription
      }));
      
      // Show the dramatic message
     
      playRockLockedInPLaceSound();
       setTimeout(() => {
         setMessage(" 'AHAHAHA! ROCK IN HOLE! BRILLIANT! \nI'VE BEEN A CAVE FOR SO MANY YEARS I LOST COUNT AND ALL I NEEDED WAS A ROCK IN A HOLE! \n\n\n\n\n\n\n\n\n I'll NEVER LEAVE! NEVER! This is MY cave! MINE! \nDON'T STAY TOO LONG! *manic giggling fades into the walls*'");
          playWizardFreedSound();
         }, 3500);
      // Add a global flag that the wizard is freed
      window.WIZARD_FREED = true;
      

      
      return true; // Remove the rock from inventory
    } else {
      // Wizard already freed
      setMessage("The pedestal already has a rock in it. The wizard's voice echoes faintly: 'One was enough, thanks. Keep the rest for skipping across underground lakes or something.'");
      return false; // Don't remove the rock
    }
  }

  // Check for different room types
  const inSandRoom = specialRooms[currentPosition]?.hasSandCreature;
  const inWaterRoom = roomHasWater || 
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('water') ||
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('pool') ||
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('stream');
  const isPitRoom = currentPosition === positions.pitPosition1 || currentPosition === positions.pitPosition2;
  const isDarkRoom = roomMood === 'dark' || roomMood === 'ominous';
  const isEchoRoom = roomDescriptionMap[currentPosition]?.special === 'echo' ||
    (roomDescriptionMap[currentPosition]?.text || '').toLowerCase().includes('echo');

  // CASE 1: In sand creature room with active creature
  if (inSandRoom && specialRooms[currentPosition]?.sandCreatureActive) {
    console.log("Player used rocks in active sand creature room!");
    
    // Deactivate the sand creature
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        sandCreatureActive: false,
        sandCreatureDefeated: true // Mark as defeated for good
      }
    }));
    playRockThrowSound();
    // Show success message - very subtle about what happened
    setMessage("You toss the rock into the center of the sandy depression. It makes a strange echoing effect. \nThen the  sand suddenly shifts violently! After a moment, the circular disturbance completely disappears, and the area seems safe now.");
    
    return true; // Item was used and removed
  }
  // CASE 2: In sand room but creature already defeated
  else if (inSandRoom && !specialRooms[currentPosition]?.sandCreatureActive) {
    setMessage("You toss another rock  onto the sand. Nothing happens.Excet for the rock disolving into the sand");
    return true; // Still consume the rocks
  }
  // CASE 3: In water room - UPDATED WITH SODIUM EXPLOSION
  else if (inWaterRoom) {
    console.log("!specialRooms[currentPosition]?.waterSpiritActive", !specialRooms[currentPosition]?.waterSpiritActive);
    
    // Play rock throw sound first
    playRockThrowSound();
    
   // Delay the explosion for dramatic effect
setTimeout(() => {
  // Play explosion sound
  if (playSodiumRockWaterExplosionSound) {
    playSodiumRockWaterExplosionSound();
  }
  
  // Check if this is the nixie's tranquil pool room
  const isNixieRoom = roomDescriptionMap[currentPosition]?.text?.includes('tranquil pool') &&
                      roomDescriptionMap[currentPosition]?.text?.includes('perfect mirror');
  
  if (isNixieRoom && specialRooms[currentPosition]?.waterSpiritActive &&
      specialRooms[currentPosition]?.nixieHasAppeared) {
    // SPECIAL CASE: Kill the water nixie ONLY if she's active/revealed
    console.log("Nixie killed by sodium explosion!");
    
     setMessage("You toss the rock into the tranquil pool.\n\n It hits the water with a violent hiss and burst of flame!\n The nixie shrieks in pain as the chemical fire burns through her watery form.\n\n She dissolves into mist with a horridly and hauntingly scream that you will never forgot for killing an innocent water nixie. ' \n\nThe pool's surface still bubbles where she once dwelt.\n Minuns 100 points for you");
    // Update special rooms to mark nixie as dead and show death scene
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        waterSpiritActive: false,
        nixieKilled: true,
        showNixieDeathScene: true,
        hasWaterSpirit: false
      }
    }));
    
    // Play nixie shriek 1 second after explosion starts
    setTimeout(() => {
      if (playWaterNixieShriekSound) {
        playWaterNixieShriekSound();
      }
    }, 1000);
    
  } else if (isNixieRoom && specialRooms[currentPosition]?.hasWaterSpirit &&
             !specialRooms[currentPosition]?.nixieHasAppeared) {
    // Nixie room but she hasn't appeared yet - NIXIE GETS ANGRY AND KILLS PLAYER
    setMessage("You toss the rock into the tranquil pool. It explodes violently! A demonic looking nixie comes flying out of the water. \n\n\n\n\n She makes the most horrid wailing sound you've ever heard.\n\nYour last sight is her furious eyes as darkness claims you and the pain from her claws and teeth as they sink into you.");
    
    // IMMEDIATELY trigger the death to show the picture
    setGameStatus('lost');
    setDeathCause('nixie_rage');
    playNixieWailingKillScream();
    
  } else {
    // NORMAL WATER ROOM: Just explosion, no special effects
    setMessage("You toss the rock into the water. FWOOSH! The strange rock  ignites on contact, creating a bright yellow flame that dances across the surface and blinds your eyes! Sparks fly and the water hisses angrily. The reaction lasts about ten seconds before the rock is consumed. \nAlchemy lesson learned: Ye soft greyish rock with strange magical properties, plus water equals fire!");
  }
}, 1000); // 1 second delay after throw // Consume the rocks
  }
  // CASE 4: Near a pit
  else if (isPitRoom) {
    setMessage("You drop the rock into the pit. It falls for what seems like an eternity before you hear a distant 'plunk' sound far below.");
    return true; // Consume the rocks
  }
  // CASE 5: In a room with good echo
  else if (isEchoRoom) {
    playRockThrowSound();
    playRockThrowSound();
    setMessage("You toss the rock against the wall. The sound echoes impressively through the chamber, briefly drowning out all other cave sounds. \n The rock then disolves into the cave floor");
    return true; // Consume the rocks
  }
  // CASE 6: In a dark room
  else if (isDarkRoom) {
    setMessage("You toss the rock into the darkness. The sound of them landing seems to continue longer than it should, as if the rocks are rolling down an unseen slope.");
    return true; // Consume the rocks
  }
  // CASE 7: Default case - generic room
  else {
    playRockThrowSound();
    setMessage("You toss the rock onto the cave floor. It clatters and makes a strange echoing effect throughout  and then mysteriously dissolve into the ground. Weird place");
    return true; // Consume the rocks
  }
};



  // Crystal Orb Handler
  const handleUseCrystalOrb = (dependencies) => {
    // Extract dependencies
    const {
      currentPosition,
      specialRooms,
      history,
      setCurrentPosition,
      setHistory,
      checkPosition,
      setMessage,
      playTeleportSound
    } = dependencies;
    
    // Check if in a room with a teleport point
    if (specialRooms[currentPosition]?.hasTeleport) {
      setMessage("The crystal orb glows brightly as you hold it up. Suddenly, you're engulfed in light!");
      
      // Play teleport sound
      playTeleportSound();
      
      // Teleport to the destination room
      const teleportRoom = specialRooms[currentPosition].teleportRoom;
      if (teleportRoom) {
        setCurrentPosition(teleportRoom);
        setHistory([...history, teleportRoom]);
        
        // After a short delay, check the new position
        setTimeout(() => {
          checkPosition(teleportRoom);
        }, 1000);
      }
      
      return false; //keep in  inventory
    } else if (currentPosition === 32) {
      // If we're in the teleport room, send to a different room
      const exitRooms = Object.keys(specialRooms)
        .filter(room => specialRooms[room].hasTeleport)
        .map(Number);
      
      if (exitRooms.length > 0) {
        // Choose a different teleport room than the last one used
        let destination;
        if (exitRooms.length > 1 && history.length > 1) {
          const lastRoom = history[history.length - 2];
          destination = exitRooms.find(room => room !== lastRoom) || exitRooms[0];
        } else {
          destination = exitRooms[0];
        }
        
        setMessage("The orb pulses with energy. You feel yourself being transported back...");
        playTeleportSound();
        
        // Teleport after a short delay
        setTimeout(() => {
          setCurrentPosition(destination);
          setHistory([...history, destination]);
          checkPosition(destination);
        }, 1000);
        
        return false; //keep in inventory
      }
    } else {
      setMessage("The orb glows faintly, but nothing happens in this room. Perhaps it needs a specific location to activate.");
    }
    
    return false; // Keep the orb in inventory
  };
  
  // Spellbook Handler
  const handleUseSpellbook = (dependencies) => {
    // Extract dependencies
    const {
      currentPosition,
      wizardRoomVisited,
      setWizardRoomVisited,
      setSpellbookDeciphered,
      setFloatingActive,
      setFloatingMovesLeft,
      setActiveSpell,
      setMessage,
      setSpellbookBackfire,
      inventory,
      setInventory,
      playSpellBookFailSound,
      playSpellBookSuccessSound,
    } = dependencies;
    
    // Check if the player has visited the wizard's room
    if (currentPosition === 32 || wizardRoomVisited) {
      // Success case - player can use the spellbook
      setWizardRoomVisited(true);
      setSpellbookDeciphered(true);
      
      // Activate the floating spell
      setFloatingActive(true);
      setFloatingMovesLeft(5);
      setActiveSpell('floating');
      
      // Show a message about the spell
      setMessage("You open the ancient spellbook. The pages glow with arcane symbols, and one spell becomes clear to you: 'Levitas Aerium'. \nAs you speak the words, you feel lighter than air! You begin to float slightly above the ground. \nThis effect will last for around 5 moves, hopefully protecting you from pits and nightcrawlers and maybe other stuff. \nNo lifetime guarantee provide.");
      playSpellBookSuccessSound();
      return true; // Remove the spellbook after successful use
    } else {
      // DANGEROUS EFFECT: The player hasn't been to the wizard's room
      // Trigger the backfire animation
      setSpellbookBackfire(true);
      
      // Find lantern in inventory and reduce its fuel by half ONLY IF IT'S ACTIVE
      setInventory(prev => {
        return prev.map(item => {
          if ((item.originalId || item.id) === 'lantern') {
            // If lantern has fuel property AND is active, reduce it by half
            if (item.fuel !== undefined && item.isActive) {
              return {
                ...item,
                fuel: Math.max(0, Math.floor(item.fuel / 2)),
                isActive: item.fuel > 0 ? item.isActive : false, // Deactivate if fuel becomes zero
                name: `${item.isActive ? 'Active' : ''} Magical Lantern (${Math.max(0, Math.floor(item.fuel / 2))} charges)`
              };
            }
            // If lantern is not active, leave it unchanged
            return item;
          }
          return item;
        });
      });
      
      // Show a dramatic message - adjusted slightly to reflect that only active lantern is affected
      const lanternActive = inventory.some(item => 
        (item.originalId || item.id) === 'lantern' && item.isActive
      );
      
      let message = "As you open the ancient spellbook, the arcane symbols begin to writhe and shift unnaturally across the pages! A cold wind howls through the cavern as the book ignites with an eerie blue flame that doesn't burn your hands but drains the light from your torch";
      playSpellBookFailSound();
      if (lanternActive) {
        message += " and lantern";
      }
      
      message += "! Ghostly voices wail in tongues no mortal should comprehend, and the book slams shut violently. Your light sources flicker and dim dramatically.";
      
      setMessage(message);
      
      return false; // Keep the spellbook in inventory
    }
  };
  
  // Golden Compass Handler
  const handleUseGoldenCompass = (dependencies) => {
    // Extract dependencies
    const {
      hasMap,
      treasurePieces,
      collectedTreasures,
      currentPosition,
      roomConnections,
      findShortestPath,
      setMessage,
      highlightPathToRoom,
      positions,
          inventory,
    setInventory
    } = dependencies;
    
    // Only works if player has the map
    if (!hasMap) {
      setMessage("The compass needle spins wildly. It seems you need the treasure map to make sense of its guidance.");
      return false; // Don't remove the item
    }
    
// Find the compass in inventory to check/update uses
  const compass = inventory.find(item => 
    (item.originalId || item.id) === 'golden_compass'
  );
  
  if (!compass) {
    console.error("Compass not found in inventory");
    return false;
  }
  
  // Initialize uses if not set
  if (compass.uses === undefined) {
    compass.uses = 0;
  }
  
  // Check if compass is out of uses
  if (compass.uses >= 3) {
    setMessage("The golden compass has lost its magical charge. Its needle spins aimlessly, no longer able to guide you.");
    return false; // Keep the depleted compass
  }


    // Find uncollected treasures
    const unCollectedTreasures = treasurePieces.filter(
      treasure => !collectedTreasures.includes(treasure.id)
    );
    





    if (unCollectedTreasures.length > 0) {
      // 10% chance to lead to a trap instead of treasure
      const isCompassBroken = Math.random() < 0.1;
      
      if (isCompassBroken) {
        // Find a dangerous room to mislead the player to
        const dangerousRooms = [];
        
        // Try to find the wumpus room first
        if (positions.wumpusPosition) {
          dangerousRooms.push({
            room: positions.wumpusPosition,
            danger: "wumpus"
          });
        }
        
        // Add pit rooms
        if (positions.pitPosition1) {
          dangerousRooms.push({
            room: positions.pitPosition1,
            danger: "pit"
          });
        }
        
        if (positions.pitPosition2) {
          dangerousRooms.push({
            room: positions.pitPosition2,
            danger: "pit"
          });
        }
        
        // Add bat room if no other danger rooms are available
        if (dangerousRooms.length === 0 && positions.batPosition) {
          dangerousRooms.push({
            room: positions.batPosition,
            danger: "bat"
          });
        }
        
        // If we have dangerous rooms, pick one randomly
        if (dangerousRooms.length > 0) {
          const randomDanger = dangerousRooms[Math.floor(Math.random() * dangerousRooms.length)];
          setMessage(`The golden compass whirs erratically before pointing confidently in a direction. Its needle trembles as it points toward room ${randomDanger.room}. Something doesn't feel right about its guidance...`);
        } else {
          // Fallback if no danger rooms found
          setMessage("The golden compass spins wildly before settling on a direction. The needle keeps jittering... it seems to be malfunctioning.");
        }
      } else {
        // Normal operation - point to nearest treasure
        // Calculate distances to each uncollected treasure
        const treasureDistances = unCollectedTreasures.map(treasure => ({
          ...treasure,
          distance: calculateDistanceToRoom(currentPosition, treasure.room, roomConnections, findShortestPath)
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
        const nearest = treasureDistances[0];
        
        // Find the path to the treasure
        const pathToTreasure = findShortestPath(currentPosition, nearest.room, roomConnections);
        const nextRoomTowardTreasure = pathToTreasure ? pathToTreasure.nextRoom : null;
        
        if (nextRoomTowardTreasure) {
          setMessage(`The golden compass points toward a ${nearest.name}. Its needle quivers with anticipation as it directs you through room ${nextRoomTowardTreasure} toward room ${nearest.room}.`);
          
          // Highlight the button leading toward the treasure
          if (typeof highlightPathToRoom === 'function') {
            highlightPathToRoom(nextRoomTowardTreasure, '#ffdd00', 'treasure');
          }
        } else {
          setMessage(`The golden compass points toward a ${nearest.name}. Its needle quivers with anticipation as it directs you to room ${nearest.room}.`);
        }
      }
    } else {
      setMessage("The golden compass spins in a circle. You've already found all the treasures it can detect.");
    }
    
   // Increment uses
  const newUses = compass.uses + 1;
  
  // Update the compass in inventory with new use count
  setInventory(prev => prev.map(item => {
    if ((item.originalId || item.id) === 'golden_compass') {
      return {
        ...item,
        uses: newUses,
        name: `Golden Compass (${3 - newUses} uses left)`
      };
    }
    return item;
  }));
  
  // Remove after 3rd use
  return newUses >= 3;
  };
  
  // Sulfur Crystal Handler
  const handleUseSulfurCrystal = (dependencies) => {
    // Extract dependencies
    const { setMessage } = dependencies;
    
    // Simple message about the crystal disintegrating when used
    setMessage("You carefully place the sulfur crystal on the ground. As it touches the cave floor, it begins to crumble and quickly disintegrates into a fine yellow powder that dissipates into the air.");
    
    // Remove from inventory
    return true; // Return true to allow the item to be removed
  };
  
  // Cave Salt Handler
  const handleUseCaveSalt = (dependencies) => {
    // Extract dependencies
    const {
      itemTypes,
      setNightCrawlerProtection,
      setNightCrawlerProtectionTimer,
      setMessage,
      setNightCrawlerWarning
    } = dependencies;
    
    console.log("Using cave salt crystals");
    
    // Activate night crawler protection
    setNightCrawlerProtection(true);
    
    // Set the protection timer (duration in seconds from itemTypes)
    const protectionDuration = itemTypes?.cave_salt?.duration || 50; // Default 50 seconds if not specified
    const protectionEndTime = Date.now() + (protectionDuration * 1000);
    setNightCrawlerProtectionTimer(protectionEndTime);
    
    // Show message
    setMessage("You crush the cave salt crystals in your hand. They dissolve into a fine powder that clings to your skin and clothing. A subtle shimmer surrounds you, and the air feels unnaturally still. You sense the nightcrawlers will avoid you for a while.");
    
    // Reset any night crawler warning
    setNightCrawlerWarning(false);
    
    return true; // Remove the item after use
  };
  

  const handleUseInvisibilityCloak = (dependencies) => {
    // Only extract needed dependencies
    const { 
      forceUpdateCloakState, // Add this to dependencies
      inventory,
      setMessage,
    
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
    
    console.log("CLOAK USE HANDLER: Using item:", cloakItem);
    
    // Ensure equipped is a boolean
    const currentEquipped = cloakItem.equipped === true;
    const newEquippedState = !currentEquipped;
    
    console.log(`CLOAK USE HANDLER: Changing equipped from ${currentEquipped} to ${newEquippedState}`);
    
    // Use the new forceUpdateCloakState function instead
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
    
    return false; // Don't remove the item
  };



  // Torch Oil Handler
  const handleUseTorchOil = (dependencies) => {
    // Extract dependencies directly
    const {
      setTorchLevel,
      setDarknessCounter,
      setMessage,
      inventory,
      setInventory,
     
 
    } = dependencies;
    
    // Replenish torch to full
    setTorchLevel(100);
    setDarknessCounter(0);
   
    // Find oil flask in inventory
    const oilFlask = inventory.find(item => 
      (item.originalId || item.id) === 'torch_oil'
    );
    
    // Show message
    setMessage("You fdsfsdf carefully pour the oil onto your torch and the flame brightens considerably.");
    
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
  
export const handleUseWyrmglass = (dependencies) => {
  const {
    currentPosition,
    positions,
    specialRooms,
    setSpecialRooms,
    setMessage,
    roomDescriptionMap,
    setRoomDescriptionMap,
    setShowLadderExtendScene,
    playWyrmglassSound,
  
    inventory,
    setGameStatus,
    setDeathCause,
    
  } = dependencies;
  
  // Check if we're in the exit room
  if (currentPosition === positions.exitPosition) {
    // Check if ladder has already been extended
    if (specialRooms[currentPosition]?.ladderExtended) {
      setMessage("You hold up the wyrmglass again. The magical ladder remains fully extended, ready for your escape.");
      return false; // Keep the wyrmglass
    }
    
    // NEW: Check if lantern is active - DEATH TRAP!
    const hasActiveLantern = inventory.some(item => 
      (item.originalId || item.id) === 'lantern' && item.isActive
    );
    
    if (hasActiveLantern) {
      // MAGICAL CATASTROPHE!
      setMessage("You hold up the wyrmglass while your lantern blazes brightly. \nThe two magical forces collide with catastrophic results! \nThe wyrmglass begins to vibrate violently as its ethereal energies clash with the lantern's arcane light. \nSuddenly, both artifacts explode in a burst of anti-magic that tears a hole in reality itself! \n\nYou're sucked into the magical void, experiencing all possible deaths simultaneously before ceasing to exist. \nPerhaps mixing unstable magical artifacts wasn't your brightest idea... \n\nGame over!");
      
 
    
         setGameStatus('lost');
         
  
      
      setDeathCause('magical_catastrophe');
      
      // Could add a special sound effect here if you have one
      // playMagicalCatastropheSound();
      
      return true; // Remove the wyrmglass (player is dead anyway)
    }

    // Play the wyrmglass sound when extending the ladder
    if (playWyrmglassSound) {
      playWyrmglassSound();
    }
    
    // TRIGGER THE SCENE DISPLAY
    setShowLadderExtendScene(true);

    // Extend the ladder!
    setSpecialRooms(prev => ({
      ...prev,
      [currentPosition]: {
        ...prev[currentPosition],
        ladderExtended: true
      }
    }));
    
    // Update the room description
    const currentDesc = roomDescriptionMap[currentPosition];
    const updatedDesc = {
      ...currentDesc,
      text: currentDesc.text.replace(
        "In the corner, you notice a rickety ladder leading up through a shaft in the ceiling. Light filters down from above - this appears to be the way out!",
        "In the corner stands a rickety ladder that extends only halfway up the shaft. Above it, you can see daylight but the ladder doesn't reach. <span class='interactive-item' data-item='ladder'>The ladder</span> looks barely stable enough to hold your weight."
      ),
      enhancedText: currentDesc.enhancedText?.replace(
        "In the corner, you notice a rickety ladder leading up through a shaft in the ceiling. Light filters down from above - this appears to be the way out!",
        "In the corner stands a rickety ladder that now extends ALL THE WAY up through the shaft, glowing with a faint magical light. <span class='interactive-item' data-item='ladder'>The ladder</span> looks sturdy and ready to support your escape!"
      )
    };
    
    setRoomDescriptionMap(prev => ({
      ...prev,
      [currentPosition]: updatedDesc
    }));
    
    setMessage("You hold up the wyrmglass toward the ladder. The glass sphere begins to glow with an inner light, and suddenly the ladder shimmers and extends upward! Magical rungs appear one by one until the ladder reaches all the way to the surface. The way out is now clear!");
    
    return false; // Keep the wyrmglass
  } else {
    setMessage("You peer through the wyrmglass. The world looks slightly distorted through its surface, but nothing special happens here.");
    return false; // Keep the wyrmglass
  }
};



  // Wumpus Repellent Handler
  const handleUseWumpusRepellent = (dependencies) => {
    // Extract dependencies we need
    const { 
      setThrowingRepellent, 
      setRepellentThrowHandler, 
      setMessage 
    } = dependencies;
    
    console.log("WUMPUS REPELLENT USE DETECTED - setting up throwing mode");
    
    // Enable throwing mode first
    setThrowingRepellent(true);
    
    // Show instruction message
    setMessage("Where do you want to throw the Wumpus Repellent? Select a room.");
    
    // Define the handler function but with protection against null room
    const safeThrowHandler = (targetRoom) => {
      // We need to implement the full throwing handler logic here
      // But for now we just need a placeholder to avoid circular references
      console.log(`Throw handler would be called with target room: ${targetRoom}`);
      
      // The actual implementation will be in itemManagerImport.js
      // This is just a placeholder
      return true;
    };
    
    // Store the handler function
    setRepellentThrowHandler(() => safeThrowHandler);
    
    // IMPORTANT: Return early to prevent any further processing
    return false; // Don't remove the item until it's actually thrown
  };
  
  // Helper function for calculating distance between rooms
  const calculateDistanceToRoom = (startRoom, targetRoom, roomConnections, findShortestPath) => {
    if (!startRoom || !targetRoom || !roomConnections || !findShortestPath) {
      return "an unknown number of";
    }
    
    const path = findShortestPath(startRoom, targetRoom, roomConnections);
    return path ? path.distance : "an unknown number of";
  };
  
  // Export all functions individually
  export {
    handleUseRustyKey,
    handleUseCrystalOrb,
    handleUseSpellbook,
    handleUseGoldenCompass,
    handleUseSulfurCrystal,
    handleUseCaveSalt,
    handleUseTorchOil,
    handleUseWumpusRepellent,
    handleUseInvisibilityCloak, 
    calculateDistanceToRoom,
    
  };
  
  // Also export them as a grouped object
  export const itemHandlers = {
    handleUseRustyKey,
    handleUseCrystalOrb,
    handleUseSpellbook,
    handleUseGoldenCompass,
    handleUseSulfurCrystal,
    handleUseCaveSalt,
    handleUseTorchOil,
    handleUseWumpusRepellent,
    handleUseInvisibilityCloak, 
    handleUseLooseRocks,
    handleUseWyrmglass,
    handleUseWizardJournal,
  
    
  };
  
  // Finally, add a central handler function
  export const handleUseItem = (
    itemId, 
    dependencies
  ) => {
    // Extract necessary dependencies
    const {
      inventory,
      setInventory,
  
      setMessage,
      
      // ... other dependencies needed by the item handlers
    } = dependencies;
    
    // Find the item in inventory
    const item = inventory.find(item => item.id === itemId);
    if (!item) return;
    
    // Get the original item type
    const originalId = item.originalId || item.id;
    
    // Special handling for torch oil
    if (originalId === 'torch_oil') {
      return handleUseTorchOil(dependencies);
    }
    
    // Special handling for different item types
    let removeItem = false; // Default to not removing the item
    
    switch (originalId) {
      case 'rusty_key':
        removeItem = handleUseRustyKey(dependencies);
        break;
        
      case 'crystal_orb':
        removeItem = handleUseCrystalOrb(dependencies);
        break;
        
      case 'spellbook':
        removeItem = handleUseSpellbook(dependencies);
        break;
        
      case 'golden_compass':
        removeItem = handleUseGoldenCompass(dependencies);
        break;
        
      case 'sulfur_crystal':
        removeItem = handleUseSulfurCrystal(dependencies);
        break;
        
      case 'cave_salt':
        removeItem = handleUseCaveSalt(dependencies);
        console.log("USE WUMPUS REPELLENT")
        break;
        
      case 'druika_repellent':
        console.log("USE WUMPUS REPELLENT")
        removeItem = handleUseWumpusRepellent(dependencies);
        break;
        
        case 'loose_rocks':
          removeItem = handleUseLooseRocks(dependencies);
          break;
      
     
      default:
        setMessage("You examine the item, but aren't sure how to use it here.");
        removeItem = false; // Don't remove unrecognized items
    }
    
    // Only remove the item if it was successfully used
    if (removeItem) {
      setInventory(prev => prev.filter(i => i.id !== itemId));
    }
    
    return removeItem;
  };
