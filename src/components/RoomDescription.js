/* eslint-disable react-hooks/exhaustive-deps */
  
   
import React, { useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import useSounds from '../hooks/useSounds';

const RoomDescription = ({ description }) => {
  // Get necessary functions from GameContext
  const { 
    addItemToInventory, 
    updateRoomDescriptionAfterCollection, 
    currentPosition,
    
    roomDescriptionMap,
    inventory,
    itemTypes,
    setMessage,
  
    createEnhancedRoomDescription,
    
    setInventory,
    handleTrapTrigger  ,
    
  specialRooms   ,
   positions,
    collectedTreasures,
    treasurePieces,
    setGameStatus,
    setDeathCause,
    gameStatus,
setShowWinVideo,
setShowLadderExtendScene,
setShowWinMessage,
setRoomDescription
  } = useGame();
  
  // Create a local state for the displayed description
  const [displayDescription, setDisplayDescription] = useState(description);
  
  // Track items that have been collected from this room
  const collectedItemsRef = useRef([]);
  
  // Track if lantern is activated
  const [lanternActive, setLanternActive] = useState(false);
  
  // Flag to prevent loops
  const processingRef = useRef(false);
  
  // Always declare hooks at the top level
  const mineralsContainerRef = useRef(null);
  const waterContainerRef = useRef(null);
  const containerRef = useRef(null);
  
const { playLadderTrapSound } = useSounds();

  // Update your checkCloakStatus function to check global state first
const checkCloakStatus = () => {
  // First check global state if available
  if (window.GLOBAL_CLOAK_STATE !== undefined) {
    const globalEquipped = window.GLOBAL_CLOAK_STATE;
    console.log(`RoomDescription: Using global cloak state: ${globalEquipped}`);
    
    return { 
      hasCloak: true,
      cloakEquipped: globalEquipped,
      containsCloak: false, // Not relevant when using global state
      cloakCollected: false // Not relevant when using global state
    };
  }
  
  // Fall back to original logic if global state not available
  // Get the rest of your existing function...
  const cloakItem = inventory.find(item => 
    (item.originalId || item.id) === 'invisibility_cloak'
  );
  
  const hasCloak = !!cloakItem;
  const cloakEquipped = hasCloak && cloakItem.equipped === true;
  
  // Check if the current room description contains the cloak
  const roomInfo = roomDescriptionMap[currentPosition];
  const originalText = roomInfo?.text || '';
  const containsCloak = originalText.includes('tattered cloth');
  
  // Check if the cloak has been collected from this room
  const collectedItems = roomInfo?.collectedItems || [];
  const cloakCollected = collectedItems.includes('invisibility_cloak');
  
  console.log(`Cloak status check - In inventory: ${hasCloak}, Equipped: ${cloakEquipped}, In room: ${containsCloak}, Collected: ${cloakCollected}`);
  
  return { 
    hasCloak, 
    cloakEquipped, 
    containsCloak, 
    cloakCollected 
  };
};


// Add this after the checkCloakStatus function
const debugCloakState = () => {
  const { hasCloak, cloakEquipped, containsCloak, cloakCollected } = checkCloakStatus();
  
  console.log("=== CLOAK STATE DEBUG ===");
  console.log(`Room ${currentPosition}:`);
  console.log(`- Cloak in inventory: ${hasCloak}`);
  console.log(`- Cloak equipped: ${cloakEquipped}`);
  console.log(`- Cloak in room text: ${containsCloak}`);
  console.log(`- Cloak collected: ${cloakCollected}`);
  
  // Find all cloak items in inventory
  const cloakItems = inventory.filter(item => 
    (item.originalId || item.id) === 'invisibility_cloak'
  );
  
  if (cloakItems.length > 0) {
    console.log(`Found ${cloakItems.length} cloak items in inventory:`);
    cloakItems.forEach((item, index) => {
      console.log(`  Cloak ${index + 1}:`, item);
    });
  } else {
    console.log("No cloak found in inventory");
  }
  
  // Check room description DOM
  setTimeout(() => {
    const container = containerRef.current;
    if (container) {
      const hasCloakInDOM = container.innerHTML.includes('tattered cloth');
      console.log(`- Cloak visible in DOM: ${hasCloakInDOM}`);
    }
    console.log("=========================");
  }, 100);
};


useEffect(() => {
  // Define the event handler function
  const handleCloakStateChange = (event) => {
    console.log("RoomDescription: Detected cloak state change event", event.detail);
    
    // Force re-render by calling state update function
    setDisplayDescription(prev => {
      // This will cause a re-render even if the content doesn't change
      return prev;
    });
    
    // Debug the cloak state
    debugCloakState();
  };
  
  // Register the event listener
  window.addEventListener('cloak_state_change', handleCloakStateChange);
  
  // Clean up function to remove the listener when component unmounts
  return () => {
    window.removeEventListener('cloak_state_change', handleCloakStateChange);
  };
}, [debugCloakState]); // Empty dependency array means this runs once when component mounts

useEffect(() => {
  // Define the event handler
  const handleCloakStateChange = (event) => {
    console.log("RoomDescription: Received cloak_state_change event", event.detail);
    
    // Force a check of cloak status
    const cloakState = checkCloakStatus();
    console.log("RoomDescription: Updated cloak state after event:", cloakState);
    
    // If needed, force a re-render by updating a local state
    debugCloakState();
  };
  
  // Add event listener
  window.addEventListener('cloak_state_change', handleCloakStateChange);
  
  // Cleanup
  return () => {
    window.removeEventListener('cloak_state_change', handleCloakStateChange);
  };
}, []);

  // Detect lantern status changes
  useEffect(() => {
    const hasActiveLantern = inventory.some(item => 
      (item.originalId || item.id) === 'lantern' && item.isActive
    );
    
    setLanternActive(hasActiveLantern);
    
    // Reset collected items when room changes
    if (currentPosition) {
      collectedItemsRef.current = [];
    }
  }, [inventory, currentPosition]);
  

// 1. Add a useEffect that directly manipulates the DOM to ensure the cloak is visible
useEffect(() => {
  // This effect will run after the component renders
  // It checks if the cloak should be visible but isn't
  
  if (!displayDescription || !currentPosition) return;
  
  // Check if we're in a room that should have the cloak
  const roomInfo = roomDescriptionMap[currentPosition];
  
  if (!roomInfo) return;
  
  // 1. Check if the original text contains the cloak
  const originalText = roomInfo.text || '';
  const containsCloak = originalText.includes('tattered cloth');
  
  // 2. Check if the cloak has been collected
  const collectedItems = roomInfo.collectedItems || [];
  const cloakCollected = collectedItems.includes('invisibility_cloak');
  
  console.log(`Cloak checks - Should have cloak: ${containsCloak}, Collected: ${cloakCollected}`);
  
  // 3. If we should have the cloak but it's not displayed, fix it
  if (containsCloak && !cloakCollected) {
    // Wait for the DOM to be updated
    setTimeout(() => {
      // Get the room description container
      const container = containerRef.current;
      if (!container) return;
      
      // Check if the rendered content already has the cloak
      const hasVisibleCloak = container.innerHTML.includes('tattered cloth');
      
      console.log(`DOM check - Cloak visible: ${hasVisibleCloak}`);
      
      // If the cloak is not visible in the DOM, add it
      if (!hasVisibleCloak) {
        console.log("Cloak missing from DOM, adding it directly");
        
        // Extract the cloak text from the original description
        const cloakRegex = / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>(\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material)?\.?/;
        const cloakMatch = originalText.match(cloakRegex);
        
        if (cloakMatch) {
          // Get the paragraph element that contains the room description
          const descriptionParagraph = container.querySelector('p');
          
          if (descriptionParagraph) {
            // Create a temporary div to hold the HTML content
            const tempDiv = document.createElement('div');
            
            // Set the innerHTML to the cloak HTML
            tempDiv.innerHTML = cloakMatch[0];
            
            // Get the actual content to append
            const cloakContent = tempDiv.innerHTML;
            
            // Append the cloak HTML directly to the paragraph
            descriptionParagraph.innerHTML += cloakContent;
            
            console.log("Cloak added to DOM directly");
            
            // Update the display description in state to match the DOM
            // This helps keep things in sync for future updates
            setDisplayDescription(prev => {
              if (!prev.includes('tattered cloth')) {
                return prev + cloakMatch[0];
              }
              return prev;
            });
          }
        }
      }
    }, 100); // Short delay to ensure DOM has updated
  }
}, [displayDescription, currentPosition, roomDescriptionMap]);


  // Effect to update description when lantern state or room changes
useEffect(() => {
  // Skip if we're in the middle of processing
  if (processingRef.current) return;
  processingRef.current = true;

  const timeoutId = setTimeout(() => {
    try {
      let newDescription = description;
      const roomInfo = roomDescriptionMap[currentPosition];
      
      // CRITICAL: Check if pool is disturbed FIRST
      if (roomInfo?.poolDisturbed && roomInfo?.textAfterCollection) {
        console.log("Pool is disturbed - using permanent disturbed description");
        newDescription = roomInfo.textAfterCollection;
        setDisplayDescription(newDescription);
        return; // Exit early - don't process enhanced text
      }
      
      if (lanternActive && roomInfo?.enhancedText && !roomInfo?.poolDisturbed) {
        console.log("RoomDescription component using enhanced text");
        
        newDescription = createEnhancedRoomDescription(
          roomInfo.text || description,
          roomInfo.enhancedText
        );
      }
      
      // Update the displayed description
      console.log("Setting display description to:", newDescription);
      setDisplayDescription(newDescription);
    } finally {
      processingRef.current = false;
    }
  }, 50);

  return () => {
    clearTimeout(timeoutId);
    processingRef.current = false;
  };
}, [description, lanternActive, currentPosition, roomDescriptionMap]);
  
  
  
  
  // Check room types based on the displayDescription (not the original description)
  const isLuminescentRoom = displayDescription?.includes('Luminescent fungi') && 
                            displayDescription?.includes('eerie blue-green glow');
  
  const isMineralsRoom = displayDescription?.includes('glittering minerals') && 
                         displayDescription?.includes('thousand tiny');
                        
  const isWaterDripRoom = displayDescription?.includes('Water drips from stalactites') || 
                          (displayDescription?.includes('droplets') && 
                          displayDescription?.includes('melody'));
 
  const isSulfurRoom = displayDescription?.includes('sulfur fills this chamber')

  const isStreamRoom = displayDescription?.includes('shallow underground stream') && 
                       displayDescription?.includes('late for an important appointment');

  const isCrystalRoom = displayDescription?.includes('unusual crystals') && 
                        (displayDescription?.includes('ominous with a chance of doom') ||
                        displayDescription?.includes('sparkles with unusual crystals'));

  const isTendrilsRoom = displayDescription?.includes('root-like tendrils') && 
                         displayDescription?.includes('supernatural microwave');


  // Check if room has interactive items
  const hasInteractiveItem = displayDescription?.includes('interactive-item');
  




  // Simple prepare description function - just returns the HTML
  // This solution takes a different approach by directly modifying the rendered DOM elements
// Add this to RoomDescription.js

// 1. Add a useEffect that directly manipulates the DOM to ensure the cloak is visible
useEffect(() => {
  // This effect will run after the component renders
  // It checks if the cloak should be visible but isn't
  
  if (!displayDescription || !currentPosition) return;
  
  // Use the new function to check cloak status
  const { containsCloak, cloakCollected } = checkCloakStatus();
  
  // Only proceed if cloak should be there but hasn't been collected
  if (containsCloak && !cloakCollected) {
    // Delay to ensure the DOM has updated
    setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;
      
      // Check if the rendered content already has the cloak
      const hasVisibleCloak = container.innerHTML.includes('tattered cloth');
      
      console.log(`DOM check - Cloak visible: ${hasVisibleCloak}`);
      
      if (!hasVisibleCloak) {
        console.log("Cloak missing from DOM, adding it directly");
        
        // Get room info for original text
        const roomInfo = roomDescriptionMap[currentPosition];
        if (!roomInfo || !roomInfo.text) return;
        
        const originalText = roomInfo.text;
        
        // Extract the cloak text
        const cloakRegex = / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>(\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material)?\.?/;
        const cloakMatch = originalText.match(cloakRegex);
        
        if (cloakMatch) {
          const descriptionParagraph = container.querySelector('p');
          if (descriptionParagraph) {
            // Create and append the cloak content
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cloakMatch[0];
            const cloakContent = tempDiv.innerHTML;
            
            descriptionParagraph.innerHTML += cloakContent;
            
            // IMPORTANT: Also update the state to keep in sync
            setDisplayDescription(prev => {
              if (!prev.includes('tattered cloth')) {
                // Create a new string with the cloak appended
                return prev + cloakMatch[0];
              }
              return prev;
            });
            
            // Dispatch a custom event to notify context that we've modified the DOM
            const event = new CustomEvent('item_visibility_fixed', {
              detail: { itemId: 'invisibility_cloak', visible: true }
            });
            window.dispatchEvent(event);
          }
        }
      }
    }, 100);
  }
}, [displayDescription, currentPosition, roomDescriptionMap]);

const hasHTMLContent = displayDescription?.includes('<span') || 
                      displayDescription?.includes('</span>') ||
                      displayDescription?.includes('class=');



                      
  // Click handler for interactive items
  useEffect(() => {
  // ADD THIS CHECK - Don't allow interactions if game is over
  if (gameStatus === 'lost' || gameStatus === 'won') {
    console.log("Game is over - ignoring interactive item clicks");
    return;
  }


    // Local variable to prevent duplicate item collection
    let isCollecting = false;
    
   const unifiedClickHandler = (e) => {
      if (isCollecting || processingRef.current) return;
      
      console.log("Click detected in room description:", e.target);
      
      const interactiveElem = e.target.closest('.interactive-item') || 
                             (e.target.classList && e.target.classList.contains('interactive-item') ? e.target : null);
      
      if (!interactiveElem) {
        console.log("No interactive element found in click");
        return;
      }
      
      const itemId = interactiveElem.getAttribute('data-item');
      console.log(`Interactive item detected: ${itemId}`);
      
      // SPECIAL HANDLING FOR LADDER
    if (itemId === 'ladder') {
  console.log("Player clicked on the ladder!");
  
  // Check if we're in the exit room
  if (currentPosition !== positions.exitPosition) {
    console.log("Not in exit room, ignoring ladder interaction");
    return;
  }
  
  // Check if player has all treasures
  if (collectedTreasures.length < treasurePieces.length) {
    setMessage("You start to climb the ladder, but a magical force pushes you back. A voice echoes: 'Not until you have found all the treasures!'");
    return;
  }
  
  // Check if ladder has been extended with wyrmglass
  if (!specialRooms[currentPosition]?.ladderExtended) {
    // TRAP! The ladder breaks
    setGameStatus('lost');
    setDeathCause('ladder_trap');
    setMessage("You eagerly grab the rickety ladder and start climbing. Halfway up, the ancient wood gives way with a sickening CRACK! You plummet downward, but instead of hitting the cave floor, you fall through a hidden pit that opens beneath you. As you tumble into the darkness, you realize the ladder was a trap for the overconfident. Game over!");
    
    // Play the death sound
    playLadderTrapSound();
    
    return;
  }
  
  // SUCCESS! Player wins

 const ladderVideo = document.querySelector('.ladder-video-background');
if (ladderVideo) {
  ladderVideo.pause();
  ladderVideo.src = '';
  ladderVideo.load();
}

setShowLadderExtendScene(false);

// ADD THIS: Update room description immediately when ladder is clicked
setRoomDescription("The Wyrmglass starts pulsating more! It tears free from your grasp and rockets upward, shattering through the ceiling with a brilliant explosion of light and widening the hole much more. Chunks of rock and ancient dust rain down as daylight floods the chamber.\nEach rung now glowing with ethereal light, extending upward toward the newly opened passage. You can't wait to get back home. \nYou hippity hop up the ladder");

// Small delay to ensure cleanup
setTimeout(() => {
  setShowWinVideo(true);
  setGameStatus('won');
  setShowWinMessage(false); // Reset message visibility
  
  // This message will show AFTER the video ends (since you have showWinMessage logic)
  setMessage("You've escaped the ancient cave with all the treasures to save the village...\n wait... what is this?\n\n\nWHAT DID YOU DO!?\n\n\n\nWhat's wrong with the trees?\nWhy is the sky differerent!\n\n~ To Be Continued ~");
}, 100);

return; // Exit early - don't process as a collectible item
}
      
      // SPECIAL HANDLING FOR SHINY TRINKETS (existing code)
      if (itemId === 'shiny_trinkets') {
        console.log("TRAP TRIGGERED: Player clicked on shiny trinkets!");
        
        if (handleTrapTrigger) {
          handleTrapTrigger(
            'trinket_trap',
            "As you reach for the golden bauble, the floor suddenly gives way beneath you! A massive trapdoor swings open, and tentacles shoot up from the darkness below. The last thing you see is rows of teeth in a gaping maw as something ancient and hungry swallows you whole. Perhaps not everything that glitters is gold... Game over!"
          );
        }
        
        interactiveElem.style.display = 'none';
        updateRoomDescriptionAfterCollection(itemId);
        
        setTimeout(() => {
          isCollecting = false;
          processingRef.current = false;
        }, 500);
        
        return; // Exit early - don't process as normal item
}

if (itemId === 'fools_gold' || itemId === 'utility_knife' || itemId === 'tarnished_bracelet') {
  console.log(`Player grabbed pool item: ${itemId}`);
  
  // Prevent processing if already collecting
  if (isCollecting || processingRef.current) return;
  
  isCollecting = true;
  processingRef.current = true;
  e.stopPropagation();
  
  // Add to collected items
  if (!collectedItemsRef.current.includes(itemId)) {
    collectedItemsRef.current.push(itemId);
  }
  
  // Add the item to inventory
  addItemToInventory(itemId);
   
  // Get item info for initial message
  const itemInfo = itemTypes[itemId];
  if (itemInfo) {
    console.log('Found item info:', itemInfo);
    setMessage(`You picked up the ${itemInfo.name}!`);
  }
  
  // Hide ALL pool items immediately
  const allPoolItems = document.querySelectorAll('.underwater-treasure');
  allPoolItems.forEach(el => {
    el.style.display = 'none';
  });
  
  // Update the room description (this will trigger the disturbed state)
  updateRoomDescriptionAfterCollection(itemId);
  
  // Force update the display after a short delay
  setTimeout(() => {
    const disturbedText = lanternActive ? 
      "The once-clear pool now churns with agitation. Whatever dwells in the depths has been disturbed, and the water has turned murky and threatening." :
      "A pool of dark, churning water covers most of the floor. The surface ripples with unseen movement below.";
    
    setDisplayDescription(disturbedText);
    
    isCollecting = false;
    processingRef.current = false;
  }, 100);
  
  return;
}




  if (itemId) {
    isCollecting = true;
    processingRef.current = true;
    e.stopPropagation();
    
    console.log(`Collecting item: ${itemId} via unified handler`);
    
    // Add to collected items array
    if (!collectedItemsRef.current.includes(itemId)) {
      collectedItemsRef.current.push(itemId);
    }
    
    // SPECIAL HANDLING FOR SINGLE GOLD COIN
    if (itemId === 'single_gold_coin') {
      console.log("Special handling for single gold coin");
      




      // Check if player already has gold coins
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
        
        setMessage(`You found a single Ancient Wyrm Coin! You add it to your collection.`);
      } else {
        // Create a new gold coin item with value 1
        const newCoin = {
          id: 'gold_coins_' + Date.now(),
          originalId: 'gold_coins', // NOT 'single_gold_coin'
          name: 'Ancient Wyrm Coin',
          icon: '💰',
          description: 'A single ancient gold coin, worn but still valuable.',
          value: 1,
          canInspect: true,
          canUse: false
        };
        
        setInventory(prev => [...prev, newCoin]);
        setMessage(`You found an Ancient Wyrm Coin!`);
      }
      
      // Update the room description to remove the coin text
      updateRoomDescriptionAfterCollection('single_gold_coin');
      
      // Hide the element immediately
      interactiveElem.style.display = 'none';
      
      setTimeout(() => {
        isCollecting = false;
        processingRef.current = false;
      }, 500);
      
      return; // Exit early - don't do normal item addition
    }
    
    // NORMAL ITEM HANDLING (not single gold coin)
    // Add to inventory

const getArticle = (word) => {
  if (!word) return 'a';
  const firstLetter = word.charAt(0).toLowerCase();
  const vowels = ['a', 'e', 'i', 'o', 'u'];
  return vowels.includes(firstLetter) ? 'an' : 'a';
};

    addItemToInventory(itemId);
    
    // Get the item info for the message with safer access
    if (itemTypes && itemTypes[itemId]) {
      const itemInfo = itemTypes[itemId];
      console.log('Found item info:', itemInfo);
      // Set message to show the item description when collected
    const article = getArticle(itemTypes[itemId].name);
setMessage(`\nYou picked up ${article} ${itemTypes[itemId].name}!\n ${itemTypes[itemId].description}`);
    } else {
      console.log(`Item ${itemId} not found in itemTypes`);
      // Fallback message if item type is not found
      setMessage(`You picked up sssd the ${itemId.replace(/_/g, ' ')}.`);
    }
    
    // Update the room description state
    updateRoomDescriptionAfterCollection(itemId);
        
        // IMPORTANT: Also update the local displayDescription state
        setDisplayDescription(prev => {
          // Use the updated updateRoomDescriptionAfterCollection logic from above
          // but apply it to the local displayDescription
          
          let updatedDesc = prev;
          
          // Remove item based on its type
          switch(itemId) {
            // ... other cases

            case 'spellbook':
              // Complete patterns to remove entire spellbook sentence
              const spellbookPatterns = [
                / Your lantern's light reveals an <span class=['"]interactive-item['"][^>]*>ancient spellbook<\/span> tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g,
                / Your lantern's light reveals an ancient spellbook tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g,
                /<span class=['"]interactive-item['"][^>]*data-item=['"]spellbook['"][^>]*>.*?<\/span>/g,
                / tucked underneath the backpack, its leather cover embossed with strange protective symbols\./g
              ];
              
              // Apply each pattern to ensure complete removal
              spellbookPatterns.forEach(pattern => {
                updatedDesc = updatedDesc.replace(pattern, '');
              });
              break;


            case 'invisibility_cloak':
              // FIXED: Apply all patterns to ensure complete removal
              const cloakPatterns = [
                / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
                / In the corner, you spot a <span class=['"]interactive-item['"][^>]*>tattered cloth<\/span>\./g,
                / In the corner, you spot a tattered cloth\. Looks like someone['"]s musty old cloak, it['"]s made out of some odd material\./g,
                / In the corner, you spot a tattered cloth\./g,
                /<span class=['"]interactive-item['"][^>]*data-item=['"]invisibility_cloak['"][^>]*>.*?<\/span>/g
              ];
              
              // Apply each pattern
              cloakPatterns.forEach(pattern => {
                updatedDesc = updatedDesc.replace(pattern, '');
              });
              break;
              
            // ... other cases
              default:
                // Generic default - do nothing
                break;
          }
          
          return updatedDesc;
        });
        
        // Also hide the element immediately
        interactiveElem.style.display = 'none';
        
        setTimeout(() => {
          isCollecting = false;
          processingRef.current = false;
        }, 500);
      }
    };
    
    // Determine which container to use
    const activeContainer = isMineralsRoom ? mineralsContainerRef.current : 
                           isWaterDripRoom ? waterContainerRef.current : 
                           containerRef.current;
    
    if (activeContainer && hasInteractiveItem) {
      console.log(`Adding click handler to ${isMineralsRoom ? 'minerals' : isWaterDripRoom ? 'water' : 'standard'} container`);
      activeContainer.addEventListener('click', unifiedClickHandler);
    }
    
    return () => {
      if (activeContainer) {
        activeContainer.removeEventListener('click', unifiedClickHandler);
      }
    };
  }, [
   currentPosition,
displayDescription,
hasInteractiveItem,
isMineralsRoom,
isWaterDripRoom,
addItemToInventory,
updateRoomDescriptionAfterCollection,
itemTypes,
setMessage,
positions,
collectedTreasures,
treasurePieces,
setGameStatus,
setDeathCause,
specialRooms
  ]); 
  
 // Effects for visual enhancements
useEffect(() => {
  // Minerals room effect
  if (isMineralsRoom && mineralsContainerRef.current) {
    const container = mineralsContainerRef.current;
    
    // Clear any existing glitter particles
    const existingGlitter = container.querySelectorAll('.glitter');
    existingGlitter.forEach(el => el.remove());
    
    // Create 30 glitter particles
    for (let i = 0; i < 30; i++) {
      const glitter = document.createElement('div');
      glitter.className = 'glitter';
      
      // Random position
      glitter.style.left = `${Math.random() * 100}%`;
      glitter.style.top = `${Math.random() * 100}%`;
      
      // Random timing
      glitter.style.setProperty('--glitter-delay', `${Math.random() * 3}s`);
      glitter.style.setProperty('--glitter-duration', `${1 + Math.random() * 3}s`);
      
      // Random size and brightness
      glitter.style.setProperty('--glitter-scale', `${1 + Math.random()}`);
      glitter.style.setProperty('--glitter-opacity', `${0.5 + Math.random() * 0.5}`);
      
      container.appendChild(glitter);
    }
    
    // Cleanup function
    return () => {
      const glitters = container.querySelectorAll('.glitter');
      glitters.forEach(el => el.remove());
    };
  }
  


  
  // Water drip effect
  if (isWaterDripRoom && waterContainerRef.current) {
    const container = waterContainerRef.current;
    
    // Clear any existing water drops
    const existingDrops = container.querySelectorAll('.water-drop, .water-ripple');
    existingDrops.forEach(el => el.remove());
    
    // Create 10 water drops at random positions
    for (let i = 0; i < 10; i++) {
      // Create the drop
      const drop = document.createElement('div');
      drop.className = 'water-drop';
      
      // Random horizontal position
      const xPos = 5 + Math.random() * 90; // 5-95% to keep it within view
      drop.style.left = `${xPos}%`;
      
      // Random timing for each drop
      drop.style.setProperty('--drip-delay', `${Math.random() * 4}s`);
      drop.style.setProperty('--drip-duration', `${2 + Math.random() * 3}s`);
      
      container.appendChild(drop);
      
      // Create the ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'water-ripple';
      ripple.style.left = `${xPos}%`;
      ripple.style.width = '20px';
      ripple.style.height = '20px';
      ripple.style.setProperty('--ripple-delay', `${Math.random() * 4}s`);
      
      container.appendChild(ripple);
    }
    
    // Cleanup function
    return () => {
      const drops = container.querySelectorAll('.water-drop, .water-ripple');
      drops.forEach(el => el.remove());
    };
  }
  
  // Sulfur room effect - ADD THIS NEW SECTION
  if (isSulfurRoom && containerRef.current) {
    const container = containerRef.current;
    
    // Clear any existing effects
    const existingEffects = container.querySelectorAll('.sulfur-vapor, .sulfur-bubble');
    existingEffects.forEach(el => el.remove());
    
    // Create vapor wisps
    for (let i = 0; i < 8; i++) {
      const vapor = document.createElement('div');
      vapor.className = 'sulfur-vapor';
      
      // Random position along the bottom
      vapor.style.left = `${Math.random() * 100}%`;
      
      // Random timing and drift
      vapor.style.setProperty('--vapor-delay', `${Math.random() * 6}s`);
      vapor.style.setProperty('--vapor-duration', `${5 + Math.random() * 3}s`);
      vapor.style.setProperty('--vapor-drift', `${-20 + Math.random() * 40}px`);
      
      container.appendChild(vapor);
    }
    
    // Create bubble effects near where crystals would be
    for (let i = 0; i < 15; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'sulfur-bubble';
      
      // Position bubbles along the walls
      if (Math.random() > 0.5) {
        bubble.style.left = `${Math.random() * 20}%`; // Left wall
      } else {
        bubble.style.left = `${80 + Math.random() * 20}%`; // Right wall
      }
      bubble.style.top = `${20 + Math.random() * 60}%`;
      
      // Random timing
      bubble.style.setProperty('--bubble-delay', `${Math.random() * 4}s`);
      bubble.style.setProperty('--bubble-duration', `${1.5 + Math.random() * 1}s`);
      
      container.appendChild(bubble);
    }
    
    // Cleanup
    return () => {
      const effects = container.querySelectorAll('.sulfur-vapor, .sulfur-bubble');
      effects.forEach(el => el.remove());
    };
  }
// Stream room effect
if (isStreamRoom && containerRef.current) {
  const container = containerRef.current;
  
  // Clear existing effects
  const existingEffects = container.querySelectorAll('.water-splash, .speed-line');
  existingEffects.forEach(el => el.remove());
  
  // Create splash effects
  for (let i = 0; i < 20; i++) {
    const splash = document.createElement('div');
    splash.className = 'water-splash';
    
    // Random position along the stream
    splash.style.bottom = '10%';
    splash.style.left = `${Math.random() * 100}%`;
    
    // Random timing
    splash.style.setProperty('--splash-delay', `${Math.random() * 2}s`);
    splash.style.setProperty('--splash-duration', `${0.8 + Math.random() * 0.4}s`);
    
    container.appendChild(splash);
  }
  
  // Create speed lines
  for (let i = 0; i < 5; i++) {
    const line = document.createElement('div');
    line.className = 'speed-line';
    
    // Random vertical position in lower half
    line.style.bottom = `${5 + Math.random() * 25}%`;
    line.style.width = `${30 + Math.random() * 40}%`;
    
    // Random timing
    line.style.setProperty('--line-delay', `${Math.random() * 1.5}s`);
    line.style.setProperty('--line-duration', `${1 + Math.random() * 0.5}s`);
    
    container.appendChild(line);
  }
  
  // Cleanup
  return () => {
    const effects = container.querySelectorAll('.water-splash, .speed-line');
    effects.forEach(el => el.remove());
  };
}

// Crystal room effect
if (isCrystalRoom && containerRef.current) {
  const container = containerRef.current;
  
  // Clear existing effects
  const existingEffects = container.querySelectorAll('.crystal-particle, .gold-sparkle');
  existingEffects.forEach(el => el.remove());
  
  // Create floating particles
  for (let i = 0; i < 15; i++) {
    const particle = document.createElement('div');
    particle.className = 'crystal-particle';
    
    // Random horizontal position
    particle.style.left = `${Math.random() * 100}%`;
    
    // Random timing and drift
    particle.style.setProperty('--particle-delay', `${Math.random() * 8}s`);
    particle.style.setProperty('--particle-duration', `${6 + Math.random() * 4}s`);
    particle.style.setProperty('--particle-drift', `${-30 + Math.random() * 60}px`);
    
    container.appendChild(particle);
  }
  
  // If lantern is active, add gold sparkles
  if (lanternActive) {
    for (let i = 0; i < 25; i++) {
      const sparkle = document.createElement('div');
      sparkle.className = 'gold-sparkle';
      
      // Position along "veins" (diagonal lines across walls)
      const isLeftWall = Math.random() > 0.5;
      if (isLeftWall) {
        sparkle.style.left = `${Math.random() * 15}%`;
      } else {
        sparkle.style.right = `${Math.random() * 15}%`;
      }
      sparkle.style.top = `${Math.random() * 100}%`;
      
      // Random timing
      sparkle.style.setProperty('--sparkle-delay', `${Math.random() * 3}s`);
      sparkle.style.setProperty('--sparkle-duration', `${2 + Math.random() * 2}s`);
      
      container.appendChild(sparkle);
    }
  }
  
  // Cleanup
  return () => {
    const effects = container.querySelectorAll('.crystal-particle, .gold-sparkle');
    effects.forEach(el => el.remove());
  };
}


// Tendrils room effect
if (isTendrilsRoom && containerRef.current) {
  const container = containerRef.current;
  
  // Clear existing effects
  const existingEffects = container.querySelectorAll('.tendril-vein, .pulse-wave, .pulse-particle, .ghost-footprint');
  existingEffects.forEach(el => el.remove());
  
  // Create tendril veins on walls
  const veinPositions = [
    { left: '5%', top: '10%', height: '60%', angle: 5 },
    { left: '15%', top: '20%', height: '70%', angle: -10 },
    { right: '10%', top: '15%', height: '65%', angle: 8 },
    { right: '20%', top: '5%', height: '80%', angle: -5 },
    { left: '25%', top: '30%', height: '50%', angle: 15 },
    { right: '30%', top: '25%', height: '55%', angle: -12 }
  ];
  
  veinPositions.forEach((pos, index) => {
    const vein = document.createElement('div');
    vein.className = 'tendril-vein';
    
    // Set position
    if (pos.left) vein.style.left = pos.left;
    if (pos.right) vein.style.right = pos.right;
    vein.style.top = pos.top;
    vein.style.height = pos.height;
    vein.style.transform = `rotate(${pos.angle}deg)`;
    
    // Stagger the pulse timing
    vein.style.setProperty('--vein-delay', `${index * 0.3}s`);
    
    container.appendChild(vein);
  });
  
  // Create pulse waves from random tendril points
  for (let i = 0; i < 3; i++) {
    const wave = document.createElement('div');
    wave.className = 'pulse-wave';
    
    // Position at random points
    wave.style.left = `${20 + Math.random() * 60}%`;
    wave.style.top = `${20 + Math.random() * 60}%`;
    
    // Stagger timing
    wave.style.setProperty('--wave-delay', `${i * 1.3}s`);
    
    container.appendChild(wave);
  }
  
  // Create floating particles
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'pulse-particle';
    
    // Random position
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    // Random push direction
    particle.style.setProperty('--push-x', `${-20 + Math.random() * 40}px`);
    particle.style.setProperty('--push-y', `${-10 + Math.random() * 20}px`);
    particle.style.setProperty('--particle-delay', `${Math.random() * 8}s`);
    
    container.appendChild(particle);
  }
  
  // Create ghost footprints (optional - comment out if not wanted)
  const footstepPath = [];
  for (let i = 0; i < 8; i++) {
    footstepPath.push({
      x: 10 + (i * 10),
      angle: -30 + (i * 5),
      delay: i * 0.5
    });
  }
  
  footstepPath.forEach((step, index) => {
    const footprint = document.createElement('div');
    footprint.className = 'ghost-footprint';
    
    footprint.style.left = `${step.x}%`;
    footprint.style.setProperty('--foot-angle', `${step.angle}deg`);
    footprint.style.setProperty('--foot-delay', `${step.delay}s`);
    footprint.style.setProperty('--foot-duration', '8s');
    
    container.appendChild(footprint);
  });
  
  // Cleanup
  return () => {
    const effects = container.querySelectorAll('.tendril-vein, .pulse-wave, .pulse-particle, .ghost-footprint');
    effects.forEach(el => el.remove());
  };
}



}, [isMineralsRoom, isWaterDripRoom, isSulfurRoom, isStreamRoom, isCrystalRoom, isTendrilsRoom, displayDescription, lanternActive]);

let finalDescription = displayDescription;




if (!displayDescription) return null;
  
  // Determine which refs to use based on room type
  let containerToUse = containerRef;
  if (isMineralsRoom) containerToUse = mineralsContainerRef;
  if (isWaterDripRoom) containerToUse = waterContainerRef;
  
  // Render different JSX based on room type


if (isWaterDripRoom) {
  return (
    <div className="room-description water-drip-container" ref={waterContainerRef}>
      <div className="water-overlay"></div>
      {hasHTMLContent ? (
        <p className="water-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="water-text">{finalDescription}</p>
      )}
    </div>
  );
}

if (isMineralsRoom) {
  return (
    <div className="room-description minerals-container" ref={mineralsContainerRef}>
      <div className="minerals-background"></div>
      {hasHTMLContent ? (
        <p className="minerals-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="minerals-text">{finalDescription}</p>
      )}
    </div>
  );
}

if (isLuminescentRoom) {
  return (
    <div className="room-description" ref={containerRef}>
      {hasHTMLContent ? (
        <p className="luminescent-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="luminescent-text">{finalDescription}</p>
      )}
    </div>
  );
}

if (isSulfurRoom) {
  return (
    <div className="room-description sulfur-room-container" ref={containerRef}>
      <div className="heat-shimmer"></div>
      <div className="sulfur-overlay"></div>
      {hasHTMLContent ? (
        <p className="sulfur-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="sulfur-text">{finalDescription}</p>
      )}
    </div>
  );
}

// Stream room
if (isStreamRoom) {
  return (
    <div className="room-description stream-room-container" ref={containerRef}>
      <div className="stream-flow"></div>
      {hasHTMLContent ? (
        <p className="stream-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="stream-text">{finalDescription}</p>
      )}
    </div>
  );
}

// Crystal room
if (isCrystalRoom) {
  return (
    <div className={`room-description crystal-room-container ${lanternActive ? 'lantern-active' : ''}`} ref={containerRef}>
      <div className="crystal-pulse"></div>
      {hasHTMLContent ? (
        <p className="crystal-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="crystal-text">{finalDescription}</p>
      )}
    </div>
  );
}

// Tendrils room
if (isTendrilsRoom) {
  return (
    <div className="room-description tendrils-room-container" ref={containerRef}>
      <div className="warmth-overlay"></div>
      {hasHTMLContent ? (
        <p className="tendrils-text" dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
      ) : (
        <p className="tendrils-text">{finalDescription}</p>
      )}
    </div>
  );
}

// Default return
return (
  <div className="room-description" ref={containerRef}>
    {hasHTMLContent ? (
      <p dangerouslySetInnerHTML={{ __html: finalDescription }}></p>
    ) : (
      <p>{finalDescription}</p>
    )}
  </div>
);
};

export default RoomDescription;